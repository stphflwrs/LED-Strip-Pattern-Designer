$(document).ready(main);

const appConfig = {
  
};

const colorPickerConfig = {
  width: 0,
  height: 30,
  hue: 0,
  saturation: 100,
  lightness: 50,
}

const canvasConfig = {
  pixelWidth: 20,
  pixelHeight: 20,
  pixelSpacing: 10,
};

const stripConfig = {
  numLeds: 60,
};

const blankCanvasFrame = $('<div>')
  .addClass('led-strip-canvas-frame')
  .append($('<canvas>')
    .addClass('led-strip-canvas')
    .attr('width', (canvasConfig.pixelWidth + canvasConfig.pixelSpacing) * stripConfig.numLeds + canvasConfig.pixelSpacing)
    .attr('height', canvasConfig.pixelHeight + canvasConfig.pixelSpacing * 2));

var ledStrips = [];

function main() {
  console.log('Javascript!');

  registerListeners();
  initColorPicker();
  initLedStrip();
}

function registerListeners() {
  $('#add-led-strip').on('click', clickAddLedStrip);
  $('#save-led-strips').on('click', clickSaveLedStrips);
  $('#load-led-strips').on('click', clickLoadLedStrips);
}

/* BEGIN Event Listeners */

function clickAddLedStrip() {
  initLedStrip();
}

function clickSaveLedStrips() {
  localStorage.setItem('ledStrip', JSON.stringify(ledStrips));
}

function clickLoadLedStrips() {
  ledStrips = JSON.parse(localStorage.getItem('ledStrip'));
  refreshLedStrips();
}

/* END Event Listeners */

/* BEGIN Initialization Functions */

function initColorPicker() {
  if (window.innerWidth > 768) {
    colorPickerConfig.width = 706;
  }

  if (window.innerWidth > 992) {
    colorPickerConfig.width = 940;
  }

  if (window.innerWidth > 1200) {
    colorPickerConfig.width = 1140;
  }

  const currentColorCanvas = $('<canvas>')
    .addClass('current-color-canvas')
    .attr('width', '100')
    .attr('height', '20');

  const colorPickerHueCanvas = $('<canvas>')
    .addClass('color-picker-hue-canvas')
    .attr('width', colorPickerConfig.width)
    .attr('height', colorPickerConfig.height);

  const colorPickerSaturationCanvas = $('<canvas>')
    .addClass('color-picker-saturation-canvas')
    .attr('width', colorPickerConfig.width)
    .attr('height', colorPickerConfig.height);

  const colorPickerLightnessCanvas = $('<canvas>')
    .addClass('color-picker-lightness-canvas')
    .attr('width', colorPickerConfig.width)
    .attr('height', colorPickerConfig.height);

  $('#color-picker > span').append(currentColorCanvas);
  $('#color-picker').append(colorPickerHueCanvas);
  $('#color-picker').append(colorPickerSaturationCanvas);
  $('#color-picker').append(colorPickerLightnessCanvas);

  drawColorPickerCurrent();
  drawColorPickerHue();
  drawColorPickerSaturation();
  drawColorPickerLightness();
}

function initLedStrip() {
  var ledStrip = {};

  // Generate colors
  ledStrip.colors = [];
  for (var i = 0; i < stripConfig.numLeds; i++) {
    ledStrip.colors[i] = {};
    ledStrip.colors[i].r = Math.floor(Math.random() * 256);
    ledStrip.colors[i].g = Math.floor(Math.random() * 256);
    ledStrip.colors[i].b = Math.floor(Math.random() * 256);
  }

  ledStrips.push(ledStrip);

  const newLedStripCanvasFrame = blankCanvasFrame.clone(),
        newLedStripCanvas = newLedStripCanvasFrame.find('canvas');

  newLedStripCanvas.attr('id', 'strip' + (ledStrips.length - 1));

  $('#editor').append(newLedStripCanvasFrame);

  drawLedStrip(ledStrip, ledStrips.length - 1);
}

/* END Initialization Functions */

/* BEGIN Refresh Functions */

function refreshCurrentColor() {
  const currentColorCanvas = $('.current-color-canvas');

  currentColorCanvas.clearCanvas();

  drawColorPickerCurrent();
}

function refreshColorPicker() {
  var colorPickerSaturationCanvas = $('.color-picker-saturation-canvas');
  var colorPickerLightnessCanvas = $('.color-picker-lightness-canvas');

  colorPickerSaturationCanvas.clearCanvas();
  colorPickerLightnessCanvas.clearCanvas();

  drawColorPickerSaturation();
  drawColorPickerLightness();
}

function refreshLedStrips() {
  $('#editor').empty();

  ledStrips.forEach(drawLedStrip);
}

/* END Refresh Functions */

/* BEGIN Draw Functions */

function drawColorPickerCurrent() {
  const currentColorCanvas = $('.current-color-canvas');
  currentColorCanvas.drawRect({
    fillStyle: 'hsl(' + colorPickerConfig.hue + ',' + colorPickerConfig.saturation + '%,' + colorPickerConfig.lightness + '%)',
    x: 0, y: 0,
    width: 100, height: 20,
    fromCenter: false,
  });
}

function drawColorPickerHue() {
  const colorPickerHueCanvas = $('.color-picker-hue-canvas');
  for (var i = 0; i < 360; i++) {
    colorPickerHueCanvas.drawRect({
      layer: true,
      fillStyle: 'hsl(' + i + ',100%,50%)',
      x: Math.floor(i*(colorPickerConfig.width/360)), y: 0,
      width: Math.ceil(colorPickerConfig.width/360), height: 30,
      fromCenter: false,
      click: function(layer) {
        var hueRe = /hsl\((\d{1,3}),\d{1,3}%,\d{1,3}%\)/;
        // console.log(layer.fillStyle.match(hueRe));
        colorPickerConfig.hue = layer.fillStyle.match(hueRe)[1];

        refreshColorPicker();
        refreshCurrentColor();
      }
    });
  }
}

function drawColorPickerSaturation() {
  const colorPickerSaturationCanvas = $('.color-picker-saturation-canvas');
  for (var i = 0; i < 100; i++) {
    colorPickerSaturationCanvas.drawRect({
      layer: true,
      fillStyle: 'hsl(' + colorPickerConfig.hue + ',' + i + '%,' + colorPickerConfig.lightness + '%)',
      x: Math.floor(i*(colorPickerConfig.width/100)), y: 0,
      width: Math.ceil(colorPickerConfig.width/100), height: 30,
      fromCenter: false,
      click: function(layer) {
        var saturationRe = /hsl\(\d{1,3},(\d{1,3})%,\d{1,3}%\)/;
        // console.log(layer.fillStyle.match(saturationRe));
        colorPickerConfig.saturation = layer.fillStyle.match(saturationRe)[1];
        refreshCurrentColor();
      }
    });
  }
}

function drawColorPickerLightness() {
  const colorPickerLightnessCanvas = $('.color-picker-lightness-canvas');
  for (var i = 0; i < 100; i++) {
    colorPickerLightnessCanvas.drawRect({
      layer: true,
      fillStyle: 'hsl(' + colorPickerConfig.hue + ',' + colorPickerConfig.saturation + '%,' + i + '%)',
      x: Math.floor(i*(colorPickerConfig.width/100)), y: 0,
      width: Math.ceil(colorPickerConfig.width/100), height: 30,
      fromCenter: false,
      click: function(layer) {
        var lightnessRe = /hsl\(\d{1,3},\d{1,3}%,(\d{1,3})%\)/;
        // console.log(layer.fillStyle.match(lightnessRe));
        colorPickerConfig.lightness = layer.fillStyle.match(lightnessRe)[1];
        refreshCurrentColor();
      }
    });
  }
}

function drawLedStrip(ledStrip, stripId) {
  const newLedStripCanvas = $('#strip' + stripId);

  // Draw background of LED strip
  newLedStripCanvas.drawRect({
    layer: true,
    fillStyle: 'rgb(210,210,210)',
    x: 0, y: 0,
    width: (canvasConfig.pixelWidth + canvasConfig.pixelSpacing) * stripConfig.numLeds + canvasConfig.pixelSpacing,
    height: canvasConfig.pixelHeight + canvasConfig.pixelSpacing * 2,
    fromCenter: false,
  });

  // Draw LEDs
  for (var i = 0; i < stripConfig.numLeds; i++) {
    newLedStripCanvas.drawRect({
      layer: true,
      name: 'led' + i,
      strokeStyle: 'rgb(0,0,0)',
      strokeWidth: 1,
      fillStyle: 'rgb(' + ledStrip.colors[i].r + ',' + ledStrip.colors[i].g + ',' + ledStrip.colors[i].b + ')',
      x: (canvasConfig.pixelWidth + canvasConfig.pixelSpacing) * i + canvasConfig.pixelSpacing, y: canvasConfig.pixelSpacing,
      width: canvasConfig.pixelWidth, height: canvasConfig.pixelHeight,
      fromCenter: false,
      click: function(layer) {
        $(layer.canvas).setLayer(layer.name, {
          fillStyle: 'hsl(' + colorPickerConfig.hue + ',' + colorPickerConfig.saturation + '%,' + colorPickerConfig.lightness + '%)',
        }).drawLayers();
      }
    });
  }
}

/* END Draw Functions */

/* BEGIN Borrowed */

/* Found here: https://gist.github.com/mjackson/5311256 */

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

/* END Borrowed */
