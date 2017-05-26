FRETBOARD_IMG_HORIZ = new Image();
FRETBOARD_IMG_HORIZ.src   = 'images/blank_fretboard_horizontal.png';

ZOOM_DIV                = null;
ZOOM_CTX                = null;

// $(function() {
//   $('[data-toggle="popover"]').popover({
//     html: true,
//     content: $('#settings').html()
//   });
// })

var app  = new Vue({
  el: '#myApp',
  mounted: function () {
    // ZOOM_DIV      = $('#zoom')[0];
    // ZOOM_CTX      = ZOOM_DIV.getContext('2d');
  },
  beforeUpdate: function() {
    this.drawBoards();
  },
  data: {
    startingFret: 0,
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
    drawZoomedFretboard: function() {
      this.startingFretPx = (this.startingFret - 1) * this.imgFretSize('vertical') + this.imgTOffset('vertical');
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
      this.$refs.fretboard.drawPositionBorder();

      // this.drawPositionBorder();
      // this.drawZoomedFretboard();
      // if (this.clickedY === null) this.drawFingers('letter');

    }
  }
})
