FRETBOARD_IMG       = new Image();
FRETBOARD_IMG.src   = 'images/blank_fretboard.png';
FRET_DIVIDOR        = 12.2;
BORDER_EDGE_SIZE    = 1;

FRETBOARD_DIV         = null;
FRETBOARD_CTX         = null;
ZOOM_DIV              = null;
ZOOM_CTX              = null;
STRING_SPACING_OFFSET = null;

$(function() {
  $('[data-toggle="popover"]').popover({
    html: true,
    content: $('#settings').html()
  });
})

var app  = new Vue({
  el: '#myApp',
  data: {
    startingFret: 3,
    positionSize: 4,
    openStrings: [
      'E',
      'A',
      'D',
      'G',
      'B',
      'E'
    ],
    useStrings: range(0,5,1),
    chordProgression: [
      teoria.chord('C').notes(),
      teoria.chord('F').notes(),
      teoria.chord('G').notes()
    ],
    selectedChord: 'all',
    newChord: '',
    clientY: null,
    clientX: null,
    clickedY: null,
    clickedX: null,
    moveType: null,
    currentBorderY: 0,
    fretboardPointer: {}
  },
  computed: {
    tabWidthClass: function() {
      return 'col-sm-' + Math.floor(12 / (Object.keys(this.chordShapes).length + 2))
    },
    numFrets: function() {
      return Number(this.startingFret) + Number(this.positionSize);
    },
    fretboard: function() {
      return generateFretboard(this.openStrings, this.numFrets);
    },
    chordShapes: function() {
      return generateChordShapes(this.chordProgression, this.fretboard, this.startingFret, this.positionSize, this.useStrings);
    }
  },
  mounted: function () {
    FRETBOARD_DIV = $('#fretboard')[0];
    FRETBOARD_CTX = FRETBOARD_DIV.getContext('2d');
    ZOOM_DIV = $('#zoom')[0];
    ZOOM_CTX = ZOOM_DIV.getContext('2d');
    STRING_SPACING_OFFSET = ZOOM_DIV.width * 0.12;
  },
  beforeUpdate: function() {
    this.drawBoards();
  },
  methods: {
    fretHeight       : function() {return this.fretboardHeight() / FRET_DIVIDOR;},
    imgFretSize      : function() {return FRETBOARD_IMG.height / FRET_DIVIDOR;},
    borderHeight     : function() {return this.positionSize * this.fretHeight()},
    imgBorderHeight  : function() {return this.positionSize * this.imgFretSize();},
    zoomStringSpacing: function() {return (ZOOM_DIV.width - STRING_SPACING_OFFSET) / (this.openStrings.length - 1);},
    zoomFretSize     : function() {return ZOOM_DIV.height / this.positionSize;},
    startingFretPx   : function() {return (this.startingFret - 1) * this.imgFretSize();},
    fretboardHeight  : function() {return FRETBOARD_DIV.height;},
    fretboardWidth   : function() {return FRETBOARD_DIV.width;},
    zoomHeight       : function() {return ZOOM_DIV.height;},
    zoomWidth        : function() {return ZOOM_DIV.width;},
    mouseCoords: function(event) {
      return getMousePos(FRETBOARD_DIV, event);
    },
    currentY: function(event) {
      return this.mouseCoords(event).y;
    },
    currentX: function(event) {
      return this.mouseCoords(event).x;
    },
    resizeTop: function(newStartingFret) {
      var oldStartingFret = this.startingFret;
      var diffStartingFret = newStartingFret - oldStartingFret;
      this.startingFret = newStartingFret;
      this.positionSize = this.positionSize - diffStartingFret;
    },
    // resizeBottom: function(diffY) {
    //   console.log(diffY);
    //   this.positionSize = this.positionSize + diffY;
    // },
    withinBorder: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.borderHeight();
      return yPos !== null && yPos > currentBorderY+BORDER_EDGE_SIZE && yPos < currentBorderY+borderHeight-BORDER_EDGE_SIZE;
    },
    withinTopBorderEdge: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.borderHeight();
      var borderEndY     = currentBorderY+borderHeight;
      return yPos !== null && (yPos >= currentBorderY-BORDER_EDGE_SIZE && yPos <= currentBorderY+BORDER_EDGE_SIZE)
    },
    withinBottomBorderEdge: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.borderHeight();
      var borderEndY     = currentBorderY+borderHeight;
      return yPos !== null && (yPos >= borderEndY-BORDER_EDGE_SIZE && yPos <= borderEndY+BORDER_EDGE_SIZE)
    },
    borderClick: function(event) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.imgBorderHeight();
      var clientY        = event.clientY;
      var clientX        = event.clientX;
      var clickedY       = this.currentY(event);
      var clickedX       = this.currentX(event);
      if (this.withinBorder(clickedY, clickedX)) {
        this.clickedY = clickedY;
        this.clickedX = clickedX;
        this.moveType = 'drag';
      } else if (this.withinTopBorderEdge(clickedY, clickedX)) {
        this.clickedY = clickedY;
        this.clickedX = clickedX;
        this.moveType = 'resizeTop';
      } else if (this.withinBottomBorderEdge(clickedY, clickedX)) {
        this.clientY  = clientY;
        this.clientX  = clientX;
        this.clickedY = clickedY;
        this.clickedX = clickedX;
        this.oldY     = clickedY;
        this.moveType = 'resizeBottom';
      }
    },
    borderRelease: function(event) {
      var currentY = this.currentY(event);
      var oldY     = this.oldY;
      var moveType = this.moveType;
      if (moveType === 'drag') this.startingFret  = Math.round(currentY / this.fretHeight());
      else if (moveType === 'resizeTop') {
        var newStartingFret = Math.round((currentY - 1) / this.fretHeight() + 1);
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.positionSize = Math.round(currentY / this.fretHeight() + 1 - this.startingFret);
      }
      this.clickedX = null;
      this.clickedY = null;
      this.oldY     = null;
      this.moveType = null;
    },
    moveBorder: function(event) {
      var clientY  = event.clientY;
      var clientX  = event.clientX;
      var currentY = this.currentY(event);
      var currentX = this.currentX(event);
      var oldY     = this.oldY;
      var clickedY = this.clickedY;
      var moveType = this.moveType;
      if (moveType === 'drag') {
        this.startingFret = currentY / this.fretHeight();  //drag border
      } else if (moveType === 'resizeTop') {
        var newStartingFret = currentY / this.fretHeight() + 1;
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.positionSize = currentY / this.fretHeight() + 1 - this.startingFret;
      }

      if (this.withinBorder(currentY, currentX)) {
        if (moveType === 'drag') {
          FRETBOARD_DIV.style.cursor='-webkit-grabbing';
        } else {
          FRETBOARD_DIV.style.cursor='pointer';  //grabbable cursor
        }
      } else if (this.withinTopBorderEdge(currentY, currentX) || this.withinBottomBorderEdge(currentY, currentX)) {
        FRETBOARD_DIV.style.cursor='ns-resize';
      } else {
        FRETBOARD_DIV.style.cursor = 'auto';
      }
    },
    chordToNotes: function(chordName) {
      return teoria.chord(chordName).notes();
    },
    createNewChord: function() {
      var newChord = teoria.chord(this.newChord);
      var newChordNotes = newChord.notes();
      var newChordName = chordId(newChordNotes);
      this.chordProgression.push(newChordNotes);
      this.selectedChord = newChordName
    },
    removeChord: function(chordName, event) {
      event.stopPropagation();
      var chordIndex = this.chordProgression.indexOf(chordName);
      this.chordProgression.splice(chordIndex,1);
    },
    drawPositionBorder: function() {
      //draw fretboard
      FRETBOARD_CTX.clearRect(0,0, this.fretboardWidth(), this.fretboardHeight());

      //draw position border
      FRETBOARD_CTX.beginPath();
      var yPos = (this.startingFret - 1) * this.fretHeight();
      var height = this.positionSize * this.fretHeight();
      FRETBOARD_CTX.rect(0, yPos, this.fretboardWidth(), height);
      FRETBOARD_CTX.stroke();
      this.currentBorderY = yPos;
    },
    drawZoomedFretboard: function() {
      ZOOM_CTX.fillStyle = 'white';
      ZOOM_CTX.fillRect(0,0, this.zoomWidth(), this.zoomHeight());
      ZOOM_CTX.drawImage(FRETBOARD_IMG, 0, this.startingFretPx(), FRETBOARD_IMG.width, this.imgBorderHeight(), 0, 0, this.zoomWidth(), this.zoomHeight());
    },
    drawFingers: function() {
      var selectedChord       = this.selectedChord;
      var zoomWidth           = this.zoomWidth();
      var zoomHeight          = this.zoomHeight();
      var zoomStringSpacing   = this.zoomStringSpacing();
      var zoomFretSize        = this.zoomFretSize();
      var chordShapes         = this.chordShapes;
      var chordOffset         = zoomFretSize / (Object.keys(this.chordShapes).length + 1);

      var chordNameIndex = 0;
      for (var chordName in chordShapes) {
        ++chordNameIndex;
        var alpha      = 0.5;
        if (selectedChord === chordName) alpha = 1;
        else if (selectedChord !== 'all') continue;
        var chordColor = hex2rgba(chordShapes[chordName].color, alpha);
        var strings = chordShapes[chordName].strings;
        strings.forEach(function(noteNames, stringNum) {
          var xPos = stringNum * zoomStringSpacing + STRING_SPACING_OFFSET;
          noteNames.forEach(function(noteName, fretNum) {
            if (noteName != 'x') {
              var yPos = fretNum * zoomFretSize + chordNameIndex * chordOffset;
              var radius = chordOffset;

              var can2 = document.createElement('canvas');
              can2.width = zoomWidth;
              can2.height = zoomHeight;
              ctx2 = can2.getContext('2d');

              ZOOM_CTX.beginPath();
              ZOOM_CTX.arc(xPos,yPos,radius,0,2*Math.PI);
              ZOOM_CTX.fillStyle = chordColor;
              ZOOM_CTX.fill();
              ZOOM_CTX.stroke();
            }
          })
        })
      }
    },
    drawBoards: function() {
      this.drawPositionBorder();
      this.drawZoomedFretboard();
      if (this.clickedY === null) this.drawFingers();
    }
  }
})
