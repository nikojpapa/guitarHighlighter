FRETBOARD_DIV = null;
FRETBOARD_CTX = null;
FRETBOARD_IMG = new FretboardImage('images/blank_fretboard_vertical.png');

NUM_FRETS         = 16
BORDER_EDGE_SIZE  = 1;

Vue.component('fretboard', {
  template: '#fretboardTemplate',
  created: function() {
    eventHub.$on('drawPositionBorder', this.drawPositionBorder);
  },
  mounted: function() {
    FRETBOARD_DIV = $('#fretboard')[0];
    FRETBOARD_CTX = FRETBOARD_DIV.getContext('2d');
  },
  beforeDestroy: function() {
    eventHub.$off('drawPositionBorder', this.drawPositionBorder);
  },
  props: [
    'startingFret',
    'positionSize'
  ],
  data: function() {
    return {
      clickedY: null,
      clickedX: null,
      moveType: null,
      currentBorderY: 0
    }
  },
  methods: {
    fretboardStyle: function() {
      var scaledCurrentBorderY = 0,
          scaledBorderHeight   = 0;
      if (FRETBOARD_DIV!==null) {
        scaledCurrentBorderY = getScaledFretboardPos(FRETBOARD_DIV, this.currentBorderY, 0, true).y;
        scaledBorderHeight   = getScaledFretboardPos(FRETBOARD_DIV, this.currentBorderY + this.fretboardBorderHeight(), 0, true).y;
      }
      return {
        'background-image': "url(images/blank_fretboard_vertical.png), linear-gradient(#cdaa7d 0%, #cdaa7d " + scaledCurrentBorderY + "px, #deb887 " + scaledCurrentBorderY + "px, #deb887 " + scaledBorderHeight + "px, #cdaa7d " + scaledBorderHeight + "px, #cdaa7d 100%)",
        'background-size': "100% 100%",
        'background-repeat': "no-repeat"
      }
    },
    fretboardHeight      : function() {return FRETBOARD_DIV.height;},
    fretboardWidth       : function() {return FRETBOARD_DIV.width;},
    fretboardScale       : function() {
      return {
        y: this.fretboardHeight() / FRETBOARD_IMG.imgHeight(),
        x: this.fretboardWidth() / FRETBOARD_IMG.imgWidth()
      }
    },
    fretboardTOffset     : function() {return FRETBOARD_IMG.imgTOffset() * this.fretboardScale().y;},
    fretboardBOffset     : function() {return FRETBOARD_IMG.imgBOffset() * this.fretboardScale().y;},
    fretboardFretSize    : function() {return FRETBOARD_IMG.imgFretSize(NUM_FRETS) * this.fretboardScale().y;},
    fretboardBorderHeight: function() {return this.positionSize * this.fretboardFretSize()},
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
      this.$emit('update:startingFret', newStartingFret);
      this.$emit('update:positionSize', this.positionSize - diffStartingFret);
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
      var borderHeight   = FRETBOARD_IMG.imgBorderHeight(this.positionSize);
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
      if (moveType === 'drag') this.$emit('update:startingFret', Math.round(offsetY / this.fretboardFretSize()));
      else if (moveType === 'resizeTop') {
        var newStartingFret = Math.round((offsetY - 1) / this.fretboardFretSize() + 1);
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.$emit('update:positionSize', Math.round(offsetY / this.fretboardFretSize() + 1 - this.startingFret));
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
        this.$emit('update:startingFret', offsetY / this.fretboardFretSize());  //drag border
      } else if (moveType === 'resizeTop') {
        var newStartingFret = offsetY / this.fretboardFretSize() + 1;
        this.resizeTop(newStartingFret);
      } else if (moveType === 'resizeBottom') {
        this.$emit('update:positionSize', offsetY / this.fretboardFretSize() + 1 - this.startingFret);
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
      
      eventHub.$emit('drawZoomedFretboard');
      if (this.clickedY===null) eventHub.$emit('drawFingers', 'letter');
    },
  }
})