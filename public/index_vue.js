FRETBOARD_IMG     = new Image();
FRETBOARD_IMG.src = 'images/blank_fretboard.png';
FRET_DIVIDOR      = 12.2;

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
    clickedX: null,
    clickedY: null,
    currentBorderY: 0
  },
  computed: {
    // settingsContent: function() {
    //   return $('#settings').html();
    // },
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
  // watch: {
  //   startingFret: function() {
  //     this.drawBoards();
  //   },
  //   positionSize: function() {
  //     this.drawBoards();
  //   },
  //   selectedChord: function() {
  //     this.drawBoards();
  //   }
  // },
  methods: {
    fretHeight       : function() {return this.fretboardHeight() / FRET_DIVIDOR;},
    imgFretSize      : function() {return FRETBOARD_IMG.height / FRET_DIVIDOR;},
    zoomStringSpacing: function() {return (ZOOM_DIV.width - STRING_SPACING_OFFSET) / (this.openStrings.length - 1);},
    zoomFretSize     : function() {return ZOOM_DIV.height / this.positionSize;},
    startingFretPx   : function() {return (this.startingFret - 1) * this.imgFretSize();},
    borderHeight     : function() {return this.positionSize * this.imgFretSize();},
    fretboardHeight  : function() {return FRETBOARD_DIV.height;},
    fretboardWidth   : function() {return FRETBOARD_DIV.width;},
    zoomHeight       : function() {return ZOOM_DIV.height;},
    zoomWidth        : function() {return ZOOM_DIV.width;},
    mouseCoords      : function(event) {return getMousePos(FRETBOARD_DIV, event);},
    borderClick: function(event) {
      var mouseCoords    = this.mouseCoords(event);
      var currentBorderY = this.currentBorderY;
      var borderHeight   = this.borderHeight()
      var clickedY       = mouseCoords.y;
      var clickedX       = mouseCoords.x;
      if (clickedY > currentBorderY && clickedY < currentBorderY + borderHeight) {
        this.clickedX = mouseCoords.x;
        this.clickedY = mouseCoords.y;
      }
    },
    borderRelease: function(event) {
      var currentY       = this.mouseCoords(event).y;
      this.clickedX      = null;
      this.clickedY      = null;
      this.startingFret  = Math.round(currentY / this.fretHeight());
    },
    moveBorder: function(event) {
      var clickedY       = this.clickedY;
      if (clickedY !== null) {
        var currentY       = this.mouseCoords(event).y;
        this.startingFret  = currentY / this.fretHeight();
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
      ZOOM_CTX.drawImage(FRETBOARD_IMG, 0, this.startingFretPx(), FRETBOARD_IMG.width, this.borderHeight(), 0, 0, this.zoomWidth(), this.zoomHeight());
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
