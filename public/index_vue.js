FRETBOARD_IMG     = new Image();
FRETBOARD_IMG.src = 'images/blank_fretboard.png';
FRET_DIVIDOR      = 12.2;

FRETBOARD_DIV         = null;
ZOOM_DIV              = null;
ZOOM_CTX              = null;
STRING_SPACING_OFFSET = null;

// Vue.component('positionBorder', {
//   props: [
//     'startingFret',
//     'positionSize'
//   ],
//   template: "<"
// })

// Vue.component('fretboard', {
//   props: [
//     'startingFret',
//     'positionSize'
//   ],
//   template: '<div><div id="positionBorder" :style="positionBorderStyle"/></div>'
// })

// Vue.component('zoomed-position', {
//   props: [
//     'startingFret',
//     'positionSize'
//   ],
//   template: '<canvas />',
//   mounted: function () {
//     FRETBOARD_DIV = $('#fretboard')[0];
//     ZOOM_DIV = $('#zoom')[0];
//     ZOOM_CTX = ZOOM_DIV.getContext("2d");
//     this.drawZoom();
//   },
//   watch: {
//     startingFret: function() {
//       this.drawZoom()
//     },
//     positionSize: function() {
//       this.drawZoom()
//     }
//   },
//   methods: {
//     drawZoom: function() {
//       var imgFretSize = FRETBOARD_IMG.height / FRET_DIVIDOR;
//       var startingFretPx  = (this.startingFret - 1) * imgFretSize;
//       var borderHeight    = this.positionSize * imgFretSize;
//       var zoomHeight      = ZOOM_DIV.height;
//       var zoomWidth       = ZOOM_DIV.width;
//       ZOOM_CTX.fillStyle = 'white';
//       ZOOM_CTX.fillRect(0,0, ZOOM_DIV.width, ZOOM_DIV.height);
//       ZOOM_CTX.drawImage(FRETBOARD_IMG, 0, startingFretPx, FRETBOARD_IMG.width, borderHeight, 0, 0, zoomWidth, zoomHeight);
//     }
//   }
// })

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
      teoria.chord('C'),
      teoria.chord('F'),
      teoria.chord('G')
    ],
    selectedChord: 'C'
  },
  computed: {
    positionBorderStyle: function() {
      return {
        'margin-top': (this.startingFret - 1) * this.fretHeight() + "px",
        'height': this.positionSize * this.fretHeight() + "px"
      }
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
    ZOOM_DIV = $('#zoom')[0];
    ZOOM_CTX = ZOOM_DIV.getContext("2d");
    STRING_SPACING_OFFSET = ZOOM_DIV.width * 0.12;
    this.drawZoom();
  },
  watch: {
    startingFret: function() {
      this.drawZoom();
    },
    positionSize: function() {
      this.drawZoom();
    },
    selectedChord: function() {
      this.drawZoom();
    }
  },
  methods: {
    fretHeight       : function() {return $('#fretboard').height() / FRET_DIVIDOR;},
    imgFretSize      : function() {return FRETBOARD_IMG.height / FRET_DIVIDOR;},
    zoomStringSpacing: function() {return (ZOOM_DIV.width - STRING_SPACING_OFFSET) / (this.openStrings.length - 1);},
    zoomFretSize     : function() {return ZOOM_DIV.height / this.positionSize;},
    startingFretPx   : function() {return (this.startingFret - 1) * this.imgFretSize();},
    borderHeight     : function() {return this.positionSize * this.imgFretSize();},
    zoomHeight       : function() {return ZOOM_DIV.height;},
    zoomWidth        : function() {return ZOOM_DIV.width;},
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
        var colorNames = Object.keys(Colors.names)
        var alpha      = 0.5;
        if (selectedChord === chordName) alpha = 1;
        var chordColor = hex2rgba(Colors.names[colorNames[(chordNameIndex++ * 7) % colorNames.length]], alpha);
        var strings = chordShapes[chordName];
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
    drawZoom: function() {
      this.drawZoomedFretboard();
      this.drawFingers();
    }
  }
})
