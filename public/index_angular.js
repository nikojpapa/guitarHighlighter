FRET_DIVIDOR = 12.2

var app = angular.module('myApp', []);
var img = new Image();
img.src = 'images/blank_fretboard.png'

app.controller('myCtrl', function($scope) {
  var fretboard = $('#fretboard')
  var zoom = $('#zoom')[0];
  var zoomCtx = zoom.getContext('2d');

  $scope.OPEN_STRINGS = ['E','A','D','G','B','E']
  $scope.fretHeight = $('#fretboard').height() / FRET_DIVIDOR;
  $scope.startingFret = 3;
  $scope.positionSize = 6;
  zoomCtx.drawImage(img,0,0);

  $scope.$watch('startingFret', function(newValue, oldValue) {
    var fretSize = img.height / FRET_DIVIDOR;
    var startingFretPx  = (newValue - 1) * fretSize;
    var borderHeight    = $scope.positionSize * fretSize;
    var zoomHeight      = zoom.height;
    var zoomWidth       = zoom.width;
    zoomCtx.fillStyle = 'white';
    zoomCtx.fillRect(0,0, zoom.width, zoom.height);
    zoomCtx.drawImage(img, 0, startingFretPx, img.width, borderHeight, 0, 0, zoomWidth, zoomHeight);
  })
})