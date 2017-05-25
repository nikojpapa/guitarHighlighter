FRETBOARD_IMG       = new Image();
FRETBOARD_IMG_HORIZ = new Image();
FRETBOARD_IMG.src         = 'images/blank_fretboard_vertical.png';
FRETBOARD_IMG_HORIZ.src   = 'images/blank_fretboard_horizontal.png';

FRETBOARD_DIV           = null;
FRETBOARD_CTX           = null;
ZOOM_DIV                = null;
ZOOM_CTX                = null;
// STRING_SPACING_L_OFFSET = null;
// STRING_SPACING_R_OFFSET = null;
// FRETBOARD_L_OFFSET      = null;
// FRETBOARD_R_OFFSET      = null;
// FRETBOARD_T_OFFSET      = null;
// FRETBOARD_B_OFFSET      = null;
NUM_FRETS            = 16;
BORDER_EDGE_SIZE        = 1;

$(function() {
  $('[data-toggle="popover"]').popover({
    html: true,
    content: $('#settings').html()
  });
})

var app  = new Vue({
  el: '#myApp',
  mounted: function () {
    FRETBOARD_DIV = $('#fretboard')[0];
    FRETBOARD_CTX = FRETBOARD_DIV.getContext('2d');
    ZOOM_DIV      = $('#zoom')[0];
    ZOOM_CTX      = ZOOM_DIV.getContext('2d');
    // STRING_SPACING_L_OFFSET = ZOOM_DIV.width * 0.225;
    // STRING_SPACING_R_OFFSET = ZOOM_DIV.width * 0.135;
    // STRING_SPACING_T_OFFSET = ZOOM_DIV.height * 0.25;
    // STRING_SPACING_B_OFFSET = ZOOM_DIV.width * 0.06;
    // FRETBOARD_L_OFFSET      = null;
    // FRETBOARD_R_OFFSET      = null;
    // FRETBOARD_T_OFFSET      = FRETBOARD_DIV.height * 0.03;
    // FRETBOARD_T_OFFSET      = FRETBOARD_DIV.height * 0.03;
    // FRETBOARD_B_OFFSET      = null;
    // IMG_T_OFFSET  = FRETBOARD_IMG.height * 0.03
  },
  beforeUpdate: function() {
    this.drawBoards();
  },
  data: {
    startingFret: 1,
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
    imgStartingFretPx: 0,
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
    numStrings: function() {
      return this.openStrings.length;
    },
    fretboard: function() {
      return generateFretboard(this.openStrings, this.numFrets);
    },
    chordShapes: function() {
      return generateChordShapes(this.chordProgression, this.fretboard, this.startingFret, this.positionSize, this.useStrings);
    },
    numChords: function() {
      return Object.keys(this.chordShapes).length;
    }
  },
  methods: {
    fretboardStyle: function() {
      var scaledCurrentBorderY = 0,
          scaledBorderHeight   = 0;
      if (FRETBOARD_DIV!==null) {
        scaledCurrentBorderY = getScaledFretboardPos(FRETBOARD_DIV, this.currentBorderY, 0, true).y;
        scaledBorderHeight   = getScaledFretboardPos(FRETBOARD_DIV, this.currentBorderY + this.fretboardBorderHeight(), 0, true).y;
        console.log(scaledCurrentBorderY);
      }
      console.log(scaledCurrentBorderY);
      return {
        'background-image': "url(images/blank_fretboard_vertical.png), linear-gradient(#cdaa7d 0%, #cdaa7d " + scaledCurrentBorderY + "px, #deb887 " + scaledCurrentBorderY + "px, #deb887 " + scaledBorderHeight + "px, #cdaa7d " + scaledBorderHeight + "px, #cdaa7d 100%)",
        'background-size': "100% 100%",
        'background-repeat': "no-repeat"
      }
    },
    displayNote          : function(noteString) {
      return capitalizeFirstLetter(noteString.slice(0,-1));
    },
    displayChord         : function(chordName) {
      var self = this,
          noteNames = [];
      chordName.split(',').forEach(function(noteName) {
        noteNames.push(self.displayNote(noteName));
      })
      return noteNames.join(',');
    },
    imgHeight            : function(orientation) {if (orientation==='vertical') return FRETBOARD_IMG.height; else if (orientation==='horizontal') return FRETBOARD_IMG_HORIZ.height;},
    imgWidth             : function(orientation) {if (orientation==='vertical') return FRETBOARD_IMG.width; else if (orientation==='horizontal') return FRETBOARD_IMG_HORIZ.width;},
    imgTOffset           : function(orientation) {return this.imgHeight(orientation) * 0.00;},
    imgBOffset           : function(orientation) {return this.imgHeight(orientation) * 0.00;},
    imgLOffset           : function(orientation) {return this.imgWidth(orientation)  * 0.19;},
    imgROffset           : function(orientation) {return this.imgWidth(orientation)  * 0.12;},
    imgFretSize          : function(orientation) {return (this.imgHeight(orientation) - this.imgTOffset(orientation) - this.imgBOffset(orientation)) / NUM_FRETS;},
    imgStringSpacing     : function(orientation) {return (this.imgWidth(orientation) - this.imgLOffset(orientation) - this.imgROffset(orientation)) / this.numStrings - 1},
    imgBorderHeight      : function(orientation) {return this.positionSize * this.imgFretSize(orientation);},
    fretboardHeight      : function() {return FRETBOARD_DIV.height;},
    fretboardWidth       : function() {return FRETBOARD_DIV.width;},
    fretboardScale       : function() {return getScale(FRETBOARD_DIV);},
    fretboardTOffset     : function() {return this.imgTOffset('vertical') * this.fretboardScale('vertical').y;},
    fretboardBOffset     : function() {return this.imgBOffset('vertical') * this.fretboardScale('vertical').y;},
    fretboardFretSize    : function() {return (this.fretboardHeight() - this.fretboardTOffset() - this.fretboardBOffset()) / NUM_FRETS;},
    fretboardBorderHeight: function() {return this.positionSize * this.fretboardFretSize()},
    zoomHeight           : function() {return ZOOM_DIV.height;},
    zoomWidth            : function() {return ZOOM_DIV.width;},
    zoomScale            : function() {
      return {
        y: this.zoomHeight() / this.imgWidth('vertical'),
        x: this.zoomWidth() / this.imgBorderHeight('vertical')
      }
    },
    zoomFretSize         : function() {return this.imgFretSize('vertical') * this.zoomScale().x;},
    zoomTOffset          : function() {return this.imgROffset('vertical') * this.zoomScale().y;},
    zoomStringSpacing    : function() {return this.imgStringSpacing('vertical') * this.zoomScale().y;},
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
    withinBorder: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.fretboardBorderHeight();
      return yPos !== null && yPos > currentBorderY+BORDER_EDGE_SIZE && yPos < currentBorderY+borderHeight-BORDER_EDGE_SIZE;
    },
    withinTopBorderEdge: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.fretboardBorderHeight();
      var borderEndY     = currentBorderY+borderHeight;
      return yPos !== null && (yPos >= currentBorderY-BORDER_EDGE_SIZE && yPos <= currentBorderY+BORDER_EDGE_SIZE)
    },
    withinBottomBorderEdge: function(yPos, xPos) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.fretboardBorderHeight();
      var borderEndY     = currentBorderY+borderHeight;
      return yPos !== null && (yPos >= borderEndY-BORDER_EDGE_SIZE && yPos <= borderEndY+BORDER_EDGE_SIZE)
    },
    borderClick: function(event) {
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.imgBorderHeight();
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
        this.clickedY = clickedY;
        this.clickedX = clickedX;
        this.moveType = 'resizeBottom';
      }
    },
    borderRelease: function(event) {
      var currentY = this.currentY(event),
          offsetY  = currentY - this.fretboardTOffset();
          moveType = this.moveType;
      if (moveType === 'drag') this.startingFret  = Math.round(offsetY / this.fretboardFretSize());
      else if (moveType === 'resizeTop') {
        var newStartingFret = Math.round((offsetY - 1) / this.fretboardFretSize() + 1);
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.positionSize = Math.round(offsetY / this.fretboardFretSize() + 1 - this.startingFret);
      }
      this.clickedX = null;
      this.clickedY = null;
      this.oldY     = null;
      this.moveType = null;
    },
    moveBorder: function(event) {
      var currentY = this.currentY(event),
          currentX = this.currentX(event),
          offsetY  = currentY - this.fretboardTOffset();
          clickedY = this.clickedY,
          moveType = this.moveType;
      if (moveType === 'drag') {
        this.startingFret = offsetY / this.fretboardFretSize();  //drag border
      } else if (moveType === 'resizeTop') {
        var newStartingFret = offsetY / this.fretboardFretSize() + 1;
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.positionSize = offsetY / this.fretboardFretSize() + 1 - this.startingFret;
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
    removeChord: function(chordIndex, event) {
      event.stopPropagation();
      this.chordProgression.splice(chordIndex,1);
    },
    drawPositionBorder: function() {
      //draw fretboard
      FRETBOARD_CTX.clearRect(0,0, this.fretboardWidth(), this.fretboardHeight());

      //draw position border
      FRETBOARD_CTX.beginPath();
      var yPos = (this.startingFret - 1) * this.fretboardFretSize() + this.fretboardTOffset();
      var height = this.positionSize * this.fretboardFretSize();
      FRETBOARD_CTX.rect(0, yPos, this.fretboardWidth(), height);
      FRETBOARD_CTX.stroke();
      this.currentBorderY = yPos;
    },
    drawZoomedFretboard: function() {
      this.startingFretPx = (this.startingFret - 1) * this.imgFretSize('vertical') + this.imgTOffset('vertical');
      // this.zoomScale          = {
      //   y: this.zoomHeight() / this.imgBorderHeight(),
      //   x: this.zoomWidth() / FRETBOARD_IMG.width
      // }
      // this.zoomFretSize       = this.imgFretSize() * this.zoomScale.y;
      // this.zoomLOffset        = this.imgLOffset() * this.zoomScale.x;
      // this.zoomStringSpacing  = this.imgStringSpacing() * this.zoomScale.x;

      // ZOOM_CTX.fillStyle = 'white';
      ZOOM_CTX.clearRect(0,0, this.zoomWidth(), this.zoomHeight());
      ZOOM_CTX.drawImage(FRETBOARD_IMG_HORIZ, this.startingFretPx, 0, this.imgBorderHeight('vertical'), FRETBOARD_IMG_HORIZ.height, 0, 0, this.zoomWidth(), this.zoomHeight());  //x and y are reversed to draw horizontally
    },
    drawFingers: function(mark) {
      var self                = this,
          numChords           = this.numChords,
          selectedChord       = this.selectedChord,
          zoomWidth           = this.zoomWidth(),
          zoomHeight          = this.zoomHeight(),
          zoomTOffset         = this.zoomTOffset(),
          zoomStringSpacing   = this.zoomStringSpacing(),
          zoomFretSize        = this.zoomFretSize(),
          chordShapes         = this.chordShapes,
          chordOffset         = zoomFretSize / (numChords + 1),
          chordNameIndex      = 0;

      for (var chordName in chordShapes) {
        ++chordNameIndex;
        var alpha      = 0.5;
        if (selectedChord === chordName) alpha = 1;
        else if (selectedChord !== 'all') continue;
        var chordColor = hex2rgba(chordShapes[chordName].color, alpha);
        var strings = chordShapes[chordName].strings;
        strings.forEach(function(noteNames, stringNum) {
          var yPos = (5-stringNum) * zoomStringSpacing + zoomTOffset;
          noteNames.forEach(function(noteName, fretNum) {
            if (noteName != 'x') {
              var xPos = fretNum * zoomFretSize + chordNameIndex * chordOffset;
              var radius = Math.min(chordOffset, zoomStringSpacing / 2);

              ZOOM_CTX.fillStyle = chordColor;
              switch(mark) {
                case 'circle':
                  ZOOM_CTX.beginPath();
                  ZOOM_CTX.arc(xPos,yPos,radius,0,2*Math.PI);
                  ZOOM_CTX.fill();
                  ZOOM_CTX.stroke();
                  break;
                case 'letter':
                  var height = radius*2
                  ZOOM_CTX.font= height + "px Sans";
                  ZOOM_CTX.fillText(self.displayNote(noteName), xPos - radius/2, yPos + radius/2, height);
                  break;
              }
            }
          })
        })
      }
    },
    drawBoards: function() {
      // ZOOM_CTX.save();
      // ZOOM_CTX.translate(ZOOM_DIV.width/2,ZOOM_DIV.height/2);
      // ZOOM_CTX.rotate(270*Math.PI/180);
      // ZOOM_CTX.translate(0,0);

      this.drawPositionBorder();
      this.drawZoomedFretboard();
      if (this.clickedY === null) this.drawFingers('letter');

      // ZOOM_CTX.restore();
    }
  }
})
