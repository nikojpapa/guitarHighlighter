FRETBOARD_IMG = new Image();
FRETBOARD_IMG.src = 'images/blank_fretboard.png';
FRET_DIVIDOR = 12.2;

FRETBOARD_DIV = null;
ZOOM_DIV = null;
ZOOM_CTX = null;

var range = function(start, end, step) {  //taken from http://stackoverflow.com/a/3895521/3869199
  var range = [];
  var typeofStart = typeof start;
  var typeofEnd = typeof end;

  if (step === 0) {
    throw TypeError("Step cannot be zero.");
  }

  if (typeofStart == "undefined" || typeofEnd == "undefined") {
    throw TypeError("Must pass start and end arguments.");
  } else if (typeofStart != typeofEnd) {
    throw TypeError("Start and end arguments must be of same type.");
  }

  typeof step == "undefined" && (step = 1);

  if (end < start) {
    step = -step;
  }

  if (typeofStart == "number") {
    while (step > 0 ? end >= start : end <= start) {
      range.push(start);
      start += step;
    }

  } else if (typeofStart == "string") {
    if (start.length != 1 || end.length != 1) {
      throw TypeError("Only strings with one character are supported.");
    }

    start = start.charCodeAt(0);
    end = end.charCodeAt(0);

    while (step > 0 ? end >= start : end <= start) {
      range.push(String.fromCharCode(start));
      start += step;
    }

  } else {
    throw TypeError("Only string and number types are supported");
  }

  return range;

}

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
    ]
  },
  computed: {
    positionBorderStyle: function() {
      return {
        'margin-top': (this.startingFret - 1) * this.fretHeight() + "px",
        'height': this.positionSize * this.fretHeight() + "px"
      }
    },
    numFrets: function() {
      return this.startingFret + this.positionSize;
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
    this.drawZoom();
  },
  watch: {
    startingFret: function() {
      this.drawZoom()
    },
    positionSize: function() {
      this.drawZoom()
    }
  },
  methods: {
    fretHeight: function() {
      return $('#fretboard').height() / FRET_DIVIDOR;
    },
    drawZoom: function() {
      console.log('draw');
      var imgFretSize = FRETBOARD_IMG.height / FRET_DIVIDOR;
      var startingFretPx  = (this.startingFret - 1) * imgFretSize;
      var borderHeight    = this.positionSize * imgFretSize;
      var zoomHeight      = ZOOM_DIV.height;
      var zoomWidth       = ZOOM_DIV.width;
      ZOOM_CTX.fillStyle = 'white';
      ZOOM_CTX.fillRect(0,0, ZOOM_DIV.width, ZOOM_DIV.height);
      ZOOM_CTX.drawImage(FRETBOARD_IMG, 0, startingFretPx, FRETBOARD_IMG.width, borderHeight, 0, 0, zoomWidth, zoomHeight);
    }
  }
})
