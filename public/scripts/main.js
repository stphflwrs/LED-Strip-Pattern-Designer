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
  numLeds: 180,
  stripPin: 0,
};

const blankCanvasFrame = $('<div>')
  .addClass('led-strip-canvas-frame')
  .css('height', canvasConfig.pixelHeight + canvasConfig.pixelSpacing * 2)
  .append($('<canvas>')
    .addClass('led-strip-canvas')
    .attr('width', (canvasConfig.pixelWidth + canvasConfig.pixelSpacing) * stripConfig.numLeds + canvasConfig.pixelSpacing)
    .attr('height', canvasConfig.pixelHeight + canvasConfig.pixelSpacing * 2));

const codeOutputInit = '#include <Adafruit_NeoPixel.h>\n#ifdef __AVR__\n\t#include <avr/power.h>\n#endif\n\n#define PIN ' + stripConfig.stripPin + '\n\nAdafruit_NeoPixel strip = Adafruit_NeoPixel(' + stripConfig.numLeds + ', PIN, NEO_GRB + NEO_KHZ800);\n\n';
const codeOutputSetup = 'void setup() {\n\t#if defined (__AVR_ATtiny85__)\n\t\tif (F_CPU == 16000000) clock_prescale_set(clock_div_1);\n\t#endif\n\tstrip.begin();\n\tstrip.show();\n}\n\n';
const codeOutputLoop = 'void loop() {\n\tfor (int i = 0; i < numFrames; i++) {\n\t\tsetPixels(frames[i], 500);\n\t}\n}\n\n'
const codeOutputSetPixels = 'void setPixels(uint8_t stripArray[][3], uint16_t wait) {\n\tfor (int i = 0; i < strip.numPixels(); i++) {\n\t\tstrip.setPixelColor(i, strip.Color(stripArray[i][0], stripArray[i][1], stripArray[i][2]));\n\t}\n\tstrip.show();\n\tdelay(wait);\n}\n';

var ledStrips = [];

function main() {
  console.log('Javascript!');

  registerListeners();
  initColorPicker();
  initLedStrip();
  initCodeOutput();
}

function registerListeners() {
  $('#add-led-strip').on('click', clickAddLedStrip);
  $('#save-led-strips').on('click', clickSaveLedStrips);
  $('#load-led-strips').on('click', clickLoadLedStrips);
  $('#select-code-output').on('click', clickSelectCodeOutput);
}

/* BEGIN Event Listeners */

// ID based

function clickAddLedStrip() {
  initLedStrip();

  refreshOutputArrays();
}

function clickSaveLedStrips() {
  localStorage.setItem('ledStrip', JSON.stringify(ledStrips));
}

function clickLoadLedStrips() {
  ledStrips = JSON.parse(localStorage.getItem('ledStrip'));
  refreshLedStrips();
}

function clickSelectCodeOutput() {
  selectText('output');
}

// Class based

function clickDeleteLedStrip(event) {
  event.preventDefault();
  console.log(event);
  const stripCanvasFrame = $(event.currentTarget).parent().parent(),
        stripIndex = stripCanvasFrame.find('.led-strip-canvas').attr('id').match(/strip(\d*)/)[1];

  ledStrips.splice(stripIndex, 1);
  stripCanvasFrame.find('#strip-header' + stripIndex).remove();
  stripCanvasFrame.find('#strip-frame' + stripIndex).remove();

  refreshLedStrips();
  refreshOutputArrays();
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
  refreshColorPicker();
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

  refreshLedStrips();
}

function initCodeOutput() {
  $('#output-init').text(codeOutputInit);
  $('#output-setup').text(codeOutputSetup);
  $('#output-loop').text(codeOutputLoop);
  $('#output-set-pixels').text(codeOutputSetPixels);

  refreshOutputArrays();
}

/* END Initialization Functions */

/* BEGIN Refresh Functions */

function refreshCurrentColor() {
  const currentColorCanvas = $('.current-color-canvas');

  currentColorCanvas.clearCanvas();

  drawColorPickerCurrent();
}

function refreshColorPicker() {
  const colorPickerHueCanvas = $('.color-picker-hue-canvas'),
        colorPickerSaturationCanvas = $('.color-picker-saturation-canvas'),
        colorPickerLightnessCanvas = $('.color-picker-lightness-canvas');

  colorPickerHueCanvas.clearCanvas();
  colorPickerSaturationCanvas.clearCanvas();
  colorPickerLightnessCanvas.clearCanvas();

  drawColorPickerHue();
  drawColorPickerSaturation();
  drawColorPickerLightness();
  drawColorPickerTicks();


}

function refreshLedStrips() {
  $('#editor').empty();

  ledStrips.forEach(function(ledStrip, index, array) {
    const newLedStripCanvasFrame = blankCanvasFrame.clone()
            .attr('id', 'strip-frame' + index),
          newLedStripCanvas = newLedStripCanvasFrame.find('canvas');

    newLedStripCanvas.attr('id', 'strip' + index);

    $('#editor').append($('<span>')
      .append($('<strong>')
        .text('LED Strip ' + (index + 1)))
      .append($('<span>')
        .text(' | '))
      .attr('id', 'strip-header' + index)
      .append($('<a>')
        .attr('href', '#')
        .addClass('delete-led-strip')
        .text('Delete')
        .on('click', clickDeleteLedStrip)));
    $('#editor').append(newLedStripCanvasFrame);
  });

  ledStrips.forEach(drawLedStrip);
}

function refreshOutputArrays() {
  $('#output-arrays').empty();

  var text = 'uint16_t numFrames = ' + ledStrips.length + ';\n\n';
  text += 'uint8_t frames[' + ledStrips.length + '][' + stripConfig.numLeds + '][3] = \n';
  text += '{';
  ledStrips.forEach(function(ledStrip, index, array) {
    // text += 'frames[' + index + '] = ';
    text += parseLedStripToCArray(ledStrip);
    // text += '},\n';
    if (index + 1 < array.length) {
      text += ',\n';
    }
  });
  text += '};\n\n';

  $('#output-arrays').text(text);
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

    colorPickerHueCanvas.drawPolygon({
      strokeStyle: 'rgb(0,0,0)',
      strokeWidth: 1,
      fillStyle: 'rgb(255,255,255)',
      x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.hue / 360.0)), y: 0,
      radius: 10,
      sides: 3,
      rotate: 180,
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

        refreshColorPicker();
        refreshCurrentColor();
      }
    });

    colorPickerSaturationCanvas.drawPolygon({
      strokeStyle: 'rgb(0,0,0)',
      strokeWidth: 1,
      fillStyle: 'rgb(255,255,255)',
      x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.saturation / 100.0)), y: 0,
      radius: 10,
      sides: 3,
      rotate: 180,
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

        refreshColorPicker();
        refreshCurrentColor();
      }
    });

    colorPickerLightnessCanvas.drawPolygon({
      strokeStyle: 'rgb(0,0,0)',
      strokeWidth: 1,
      fillStyle: 'rgb(255,255,255)',
      x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.lightness / 100.0)), y: 0,
      radius: 10,
      sides: 3,
      rotate: 180,
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

        // var hslRe = /hsl\((\d{1,3}),(\d{1,3})%,(\d{1,3})%\)/;
        var rgbPixel = hslToRgb(
          colorPickerConfig.hue / 255.0,
          colorPickerConfig.saturation / 100.0,
          colorPickerConfig.lightness / 100.0);
        rgbPixel.forEach(function(pixel, index) {
          rgbPixel[index] = Math.round(pixel);
        });
        var ledStripIndex = parseInt($(layer.canvas).attr('id').match(/strip(\d{1,})/)[1]),
            ledStripPixelIndex = layer.index - 1;
        ledStrips[ledStripIndex].colors[ledStripPixelIndex].r = rgbPixel[0];
        ledStrips[ledStripIndex].colors[ledStripPixelIndex].g = rgbPixel[1];
        ledStrips[ledStripIndex].colors[ledStripPixelIndex].b = rgbPixel[2];

        refreshOutputArrays();
      }
    });
  }
}

function drawColorPickerTicks() {
  const colorPickerHueCanvas = $('.color-picker-hue-canvas'),
        colorPickerSaturationCanvas = $('.color-picker-saturation-canvas'),
        colorPickerLightnessCanvas = $('.color-picker-lightness-canvas');

  colorPickerHueCanvas.drawPolygon({
    layer: true,
    strokeStyle: 'rgb(0,0,0)',
    strokeWidth: 1,
    fillStyle: 'rgb(255,255,255)',
    x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.hue / 360.0)), y: 0,
    radius: 10,
    sides: 3,
    rotate: 180,
  });

  colorPickerSaturationCanvas.drawPolygon({
    layer: true,
    strokeStyle: 'rgb(0,0,0)',
    strokeWidth: 1,
    fillStyle: 'rgb(255,255,255)',
    x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.saturation / 100.0)), y: 0,
    radius: 10,
    sides: 3,
    rotate: 180,
  });

  colorPickerLightnessCanvas.drawPolygon({
    layer: true,
    strokeStyle: 'rgb(0,0,0)',
    strokeWidth: 1,
    fillStyle: 'rgb(255,255,255)',
    x: Math.ceil(colorPickerConfig.width * (colorPickerConfig.lightness / 100.0)), y: 0,
    radius: 10,
    sides: 3,
    rotate: 180,
  });
}

/* END Draw Functions */

/* BEGIN Parsing Functions */

function parseLedStripToCArray(ledStrip) {
  var outputCArray = '';

  outputCArray += '{';
  ledStrip.colors.forEach(function(pixel, index, array) {
    outputCArray += '{';
    outputCArray += String(pixel.r) + ',';
    outputCArray += String(pixel.g) + ',';
    outputCArray += String(pixel.b) + '}';
    if (index + 1 < array.length) {
      outputCArray += ',';
    }
  });
  outputCArray += '}';
  return outputCArray;
}

/* END Parsing Functions */

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

/* Found here: http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse */
/* See Jason's edit */

function selectText(element) {
  var doc = document
    , text = doc.getElementById(element)
    , range, selection
  ;    
  if (doc.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();        
    range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/* END Borrowed */
