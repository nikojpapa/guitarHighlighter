class FretboardImage {

  constructor(url, tOff=0.0, bOff=0.0, lOff=0.19, rOff=0.12) {
    this.image = new Image();
    this.image.src = url;
    this.tOff = tOff;
    this.bOff = bOff;
    this.lOff = lOff;
    this.rOff = rOff;
  }

  imgHeight() {return this.image.height;};
  imgWidth() {return this.image.width;};
  imgTOffset() {return this.imgHeight() * this.tOff;};
  imgBOffset() {return this.imgHeight() * this.bOff;};
  imgLOffset() {return this.imgWidth()  * this.lOff;};
  imgROffset() {return this.imgWidth()  * this.rOff;};
  imgFretSize(numFrets) {return (this.imgHeight() - this.imgTOffset() - this.imgBOffset()) / numFrets;};
  imgStringSpacing(numStrings) {return (this.imgWidth() - this.imgLOffset() - this.imgROffset()) / numStrings - 1;};
  imgBorderHeight(positionSize, numFrets) {return positionSize * this.imgFretSize(numFrets);};
}