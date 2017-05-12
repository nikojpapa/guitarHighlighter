var app = angular.module('myApp', []);
var canvas;
var ctx;
var img = new Image();
img.src = 'images/blank_fretboard.png'

// $(function() {
//   drawBox(0);
// })

app.controller('myCtrl', function($scope) {
  $scope.fretHeight = 100.0 / 17;
  $scope.startingFret = 3;
  $scope.positionSize = 6;

  // $scope.$watch($('#fretboard'), function (newValue) {
  //   $scope.fretHeight = $('#fretboard').height() / 17;
  // });
})