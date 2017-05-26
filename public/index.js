// $(function() {
//   ZOOM_IMG = new FretboardImage('images/blank_fretboard_horizontal.png');
//   ZOOM_DIV = $('#zoom')[0];
//   ZOOM_CTX = ZOOM_DIV.getContext('2d');

//   FRETBOARD_IMG = new FretboardImage('images/blank_fretboard_vertical.png');
//   FRETBOARD_DIV = $('#fretboard')[0];
//   FRETBOARD_CTX = FRETBOARD_DIV.getContext('2d');
// })

var eventHub = new Vue();
var app  = new Vue({
  el: '#myApp',
  beforeUpdate: function() {
    this.drawBoards();
  },
  data: {
    startingFret: 0,
    positionSize: 4
  },
  methods: {
    drawBoards: function() {
      eventHub.$emit('drawPositionBorder');
    }
  }
})
