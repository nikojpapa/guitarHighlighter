function capitalizeFirstLetter(string) {  //taken from https://stackoverflow.com/a/1026087/3869199
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Colors class taken from http://stackoverflow.com/a/10014969/3869199
Colors = {};
Colors.names = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    black: "#000000",
    blue: "#0000ff",
    brown: "#a52a2a",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    white: "#ffffff",
    yellow: "#ffff00"
};
Colors.random = function() {
    var result;
    var count = 0;
    for (var prop in this.names)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
};

function hex2rgba(hexa, alpha){  // modified from http://stackoverflow.com/a/28709657/3869199
  var r = parseInt(hexa.slice(1,3), 16);
      g = parseInt(hexa.slice(3,5), 16);
      b = parseInt(hexa.slice(5,7), 16);
      a = alpha;
  return 'rgba('+r+', '+g+', '+b+', '+a+')';
}

function getScale(canvas) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleY = canvas.height / rect.height,  // relationship bitmap vs. element for Y
      scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X

  return {
    y: scaleY,
    x: scaleX
  }
}

function getScaledFretboardPos(canvas, yPos, xPos, reverse=false) {
  // if (canvas===null) return null;
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scale = getScale(canvas),
      scaleX = scale.x,
      scaleY = scale.y

  if (reverse) return {
    x: xPos / scaleX + rect.left,   // scale mouse coordinates after they have
    y: yPos / scaleY + rect.top     // been adjusted to be relative to element
  }
  else return {
    x: (xPos - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (yPos - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function getMousePos(canvas, evt) {  //Taken from http://stackoverflow.com/a/17130415/3869199
  return getScaledFretboardPos(canvas, evt.clientY, evt.clientX);
}

function drawRotated(degrees){
    // if(ZOOM_DIV) document.body.removeChild("canvas");

    // ZOOM_DIV = document.createElement("canvas");
    // ZOOM_CTX = ZOOM_DIV.getContext("2d");
    // ZOOM_DIV.style.width="20%";

    // if(degrees == 90 || degrees == 270) {
    //     ZOOM_DIV.width = image.height;
    //     ZOOM_DIV.height = image.width;
    // } else {
    //     ZOOM_DIV.width = image.width;
    //     ZOOM_DIV.height = image.height;
    // }

    ZOOM_CTX.clearRect(0,0,ZOOM_DIV.width,ZOOM_DIV.height);
    if(degrees == 90 || degrees == 270) {
        ZOOM_CTX.translate(ZOOM_CTX.height/2,ZOOM_CTX.width/2);
    } else {
        ZOOM_CTX.translate(ZOOM_CTX.width/2,ZOOM_CTX.height/2);
   }
    ZOOM_CTX.rotate(degrees*Math.PI/180);
    ZOOM_CTX.drawImage(ZOOM_CTX,-ZOOM_CTX.width/2,-ZOOM_CTX.height/2);

    // document.body.appendChild(ZOOM_DIV);
}


function range(start, end, step) {  //taken from http://stackoverflow.com/a/3895521/3869199
  var range = [];
  var typeofStart = typeof start;
  var typeofEnd = typeof end;

  if (step === 0) {
    throw TypeError("Step cannot be zero.");
  }

  if (typeofStart == "undefined" || typeofEnd == "undefined") {
    throw TypeError("Must pass start and end arguments.");
  } else if (typeofStart != typeofEnd) {
    console.log('S: ' + start + '.'+ typeofStart);
    console.log('E: ' + end + '.' + typeofEnd);
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