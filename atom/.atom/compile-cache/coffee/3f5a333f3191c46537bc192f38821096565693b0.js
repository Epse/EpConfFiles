(function() {
  var BlendModes, Color, ColorExpression, ExpressionsRegistry, MAX_PER_COMPONENT, SVGColors, blendMethod, clamp, clampInt, comma, contrast, createVariableRegExpString, cssColor, float, floatOrPercent, hexadecimal, int, intOrPercent, isInvalid, mixColors, namePrefixes, notQuote, optionalPercent, pe, percent, ps, readParam, split, strip, variables, _ref, _ref1,
    __slice = [].slice;

  cssColor = require('css-color-function');

  _ref = require('./regexes'), int = _ref.int, float = _ref.float, percent = _ref.percent, optionalPercent = _ref.optionalPercent, intOrPercent = _ref.intOrPercent, floatOrPercent = _ref.floatOrPercent, comma = _ref.comma, notQuote = _ref.notQuote, hexadecimal = _ref.hexadecimal, ps = _ref.ps, pe = _ref.pe, variables = _ref.variables, namePrefixes = _ref.namePrefixes, createVariableRegExpString = _ref.createVariableRegExpString;

  _ref1 = require('./utils'), strip = _ref1.strip, split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  Color = require('./color');

  BlendModes = require('./blend-modes');

  MAX_PER_COMPONENT = {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 1,
    hue: 360,
    saturation: 100,
    lightness: 100
  };

  mixColors = function(color1, color2, amount) {
    var color, inverse;
    if (amount == null) {
      amount = 0.5;
    }
    inverse = 1 - amount;
    color = new Color;
    color.rgba = [Math.floor(color1.red * amount) + Math.floor(color2.red * inverse), Math.floor(color1.green * amount) + Math.floor(color2.green * inverse), Math.floor(color1.blue * amount) + Math.floor(color2.blue * inverse), color1.alpha * amount + color2.alpha * inverse];
    return color;
  };

  contrast = function(base, dark, light, threshold) {
    var _ref2;
    if (dark == null) {
      dark = new Color('black');
    }
    if (light == null) {
      light = new Color('white');
    }
    if (threshold == null) {
      threshold = 0.43;
    }
    if (dark.luma > light.luma) {
      _ref2 = [dark, light], light = _ref2[0], dark = _ref2[1];
    }
    if (base.luma > threshold) {
      return dark;
    } else {
      return light;
    }
  };

  blendMethod = function(registry, name, method) {
    return registry.createExpression(name, strip("" + name + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), function(match, expression, context) {
      var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
      _ = match[0], expr = match[1];
      _ref2 = split(expr), color1 = _ref2[0], color2 = _ref2[1];
      baseColor1 = context.readColor(color1);
      baseColor2 = context.readColor(color2);
      if (isInvalid(baseColor1) || isInvalid(baseColor2)) {
        return this.invalid = true;
      }
      return _ref3 = baseColor1.blend(baseColor2, method), this.rgba = _ref3.rgba, _ref3;
    });
  };

  readParam = function(param, block) {
    var name, re, value, _, _ref2;
    re = RegExp("\\$(\\w+):\\s*((-?" + float + ")|" + variables + ")");
    if (re.test(param)) {
      _ref2 = re.exec(param), _ = _ref2[0], name = _ref2[1], value = _ref2[2];
      return block(name, value);
    }
  };

  isInvalid = function(color) {
    return !(color != null ? color.isValid() : void 0);
  };

  module.exports = {
    getRegistry: function(context) {
      var colorRegexp, colors, elmAngle, elmDegreesRegexp, paletteRegexpString, registry;
      registry = new ExpressionsRegistry(ColorExpression);
      registry.createExpression('css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w])", function(match, expression, context) {
        var hexa, _;
        _ = match[0], hexa = match[1];
        return this.hexRGBA = hexa;
      });
      registry.createExpression('css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w])", function(match, expression, context) {
        var hexa, _;
        _ = match[0], hexa = match[1];
        return this.hex = hexa;
      });
      registry.createExpression('css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w])", function(match, expression, context) {
        var colorAsInt, hexa, _;
        _ = match[0], hexa = match[1];
        colorAsInt = context.readInt(hexa, 16);
        this.colorExpression = "#" + hexa;
        this.red = (colorAsInt >> 12 & 0xf) * 17;
        this.green = (colorAsInt >> 8 & 0xf) * 17;
        this.blue = (colorAsInt >> 4 & 0xf) * 17;
        return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
      });
      registry.createExpression('css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w])", function(match, expression, context) {
        var colorAsInt, hexa, _;
        _ = match[0], hexa = match[1];
        colorAsInt = context.readInt(hexa, 16);
        this.colorExpression = "#" + hexa;
        this.red = (colorAsInt >> 8 & 0xf) * 17;
        this.green = (colorAsInt >> 4 & 0xf) * 17;
        return this.blue = (colorAsInt & 0xf) * 17;
      });
      registry.createExpression('int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", function(match, expression, context) {
        var hexa, _;
        _ = match[0], hexa = match[1];
        return this.hexARGB = hexa;
      });
      registry.createExpression('int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", function(match, expression, context) {
        var hexa, _;
        _ = match[0], hexa = match[1];
        return this.hex = hexa;
      });
      registry.createExpression('css_rgb', strip("rgb" + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var b, g, r, _;
        _ = match[0], r = match[1], g = match[2], b = match[3];
        this.red = context.readIntOrPercent(r);
        this.green = context.readIntOrPercent(g);
        this.blue = context.readIntOrPercent(b);
        return this.alpha = 1;
      });
      registry.createExpression('css_rgba', strip("rgba" + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), function(match, expression, context) {
        var a, b, g, r, _;
        _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
        this.red = context.readIntOrPercent(r);
        this.green = context.readIntOrPercent(g);
        this.blue = context.readIntOrPercent(b);
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), function(match, expression, context) {
        var a, baseColor, subexpr, _;
        _ = match[0], subexpr = match[1], a = match[2];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        this.rgb = baseColor.rgb;
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('css_hsl', strip("hsl" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var h, hsl, l, s, _;
        _ = match[0], h = match[1], s = match[2], l = match[3];
        hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
        if (hsl.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsl = hsl;
        return this.alpha = 1;
      });
      registry.createExpression('css_hsla', strip("hsla" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), function(match, expression, context) {
        var a, h, hsl, l, s, _;
        _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
        hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
        if (hsl.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsl = hsl;
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('hsv', strip("(?:hsv|hsb)" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var h, hsv, s, v, _;
        _ = match[0], h = match[1], s = match[2], v = match[3];
        hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
        if (hsv.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsv = hsv;
        return this.alpha = 1;
      });
      registry.createExpression('hsva', strip("(?:hsva|hsba)" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), function(match, expression, context) {
        var a, h, hsv, s, v, _;
        _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
        hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
        if (hsv.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsv = hsv;
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), function(match, expression, context) {
        var a, h, l, s, _;
        _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
        return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
      });
      registry.createExpression('hwb', strip("hwb" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), function(match, expression, context) {
        var a, b, h, w, _;
        _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
        this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
        return this.alpha = a != null ? context.readFloat(a) : 1;
      });
      registry.createExpression('gray', strip("gray" + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, function(match, expression, context) {
        var a, p, _;
        _ = match[0], p = match[1], a = match[2];
        p = context.readFloat(p) / 100 * 255;
        this.rgb = [p, p, p];
        return this.alpha = a != null ? context.readFloat(a) : 1;
      });
      colors = Object.keys(SVGColors.allCases);
      colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")(?!\\s*[-\\.:=\\(])\\b";
      registry.createExpression('named_colors', colorRegexp, function(match, expression, context) {
        var name, _;
        _ = match[0], name = match[1];
        this.colorExpression = this.name = name;
        return this.hex = SVGColors.allCases[name].replace('#', '');
      });
      registry.createExpression('darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloat(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [h, s, clampInt(l - amount)];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloat(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [h, s, clampInt(l + amount)];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, subexpr, _;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        this.rgb = baseColor.rgb;
        return this.alpha = amount;
      });
      registry.createExpression('transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, subexpr, _;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        this.rgb = baseColor.rgb;
        return this.alpha = clamp(baseColor.alpha - amount);
      });
      registry.createExpression('opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, subexpr, _;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        this.rgb = baseColor.rgb;
        return this.alpha = clamp(baseColor.alpha + amount);
      });
      registry.createExpression('stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, channel, subexpr, _;
        _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
        amount = context.readInt(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        if (isNaN(amount)) {
          return this.invalid = true;
        }
        return this[channel] = amount;
      });
      registry.createExpression('transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), function(match, expression, context) {
        var alpha, bestAlpha, bottom, expr, processChannel, top, _, _ref2;
        _ = match[0], expr = match[1];
        _ref2 = split(expr), top = _ref2[0], bottom = _ref2[1], alpha = _ref2[2];
        top = context.readColor(top);
        bottom = context.readColor(bottom);
        alpha = context.readFloatOrPercent(alpha);
        if (isInvalid(top)) {
          return this.invalid = true;
        }
        if ((bottom != null) && isInvalid(bottom)) {
          return this.invalid = true;
        }
        if (bottom == null) {
          bottom = new Color(255, 255, 255, 1);
        }
        if (isNaN(alpha)) {
          alpha = void 0;
        }
        bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
          var res;
          res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
          return res;
        }).sort(function(a, b) {
          return a < b;
        })[0];
        processChannel = function(channel) {
          if (bestAlpha === 0) {
            return bottom[channel];
          } else {
            return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
          }
        };
        if (alpha != null) {
          bestAlpha = alpha;
        }
        bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
        this.red = processChannel('red');
        this.green = processChannel('green');
        this.blue = processChannel('blue');
        return this.alpha = Math.round(bestAlpha * 100) / 100;
      });
      registry.createExpression('hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloat(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        if (isNaN(amount)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [amount % 360, s, l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, channel, subexpr, _;
        _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
        amount = context.readInt(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        if (isNaN(amount)) {
          return this.invalid = true;
        }
        baseColor[channel] = amount;
        return this.rgba = baseColor.rgba;
      });
      registry.createExpression('adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloat(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [(h + amount) % 360, s, l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('mix', strip("mix" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " " + comma + " (" + floatOrPercent + "|" + variables + ") ) " + pe), function(match, expression, context) {
        var amount, baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
        _ = match[0], expr = match[1];
        _ref2 = split(expr), color1 = _ref2[0], color2 = _ref2[1], amount = _ref2[2];
        if (amount != null) {
          amount = context.readFloatOrPercent(amount);
        } else {
          amount = 0.5;
        }
        baseColor1 = context.readColor(color1);
        baseColor2 = context.readColor(color2);
        if (isInvalid(baseColor1) || isInvalid(baseColor2)) {
          return this.invalid = true;
        }
        return _ref3 = mixColors(baseColor1, baseColor2, amount), this.rgba = _ref3.rgba, _ref3;
      });
      registry.createExpression('tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, subexpr, white, _;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        white = new Color(255, 255, 255);
        return this.rgba = mixColors(white, baseColor, amount).rgba;
      });
      registry.createExpression('shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, black, subexpr, _;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        black = new Color(0, 0, 0);
        return this.rgba = mixColors(black, baseColor, amount).rgba;
      });
      registry.createExpression('desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [h, clampInt(s - amount * 100), l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), function(match, expression, context) {
        var amount, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], amount = match[2];
        amount = context.readFloatOrPercent(amount);
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [h, clampInt(s + amount * 100), l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, function(match, expression, context) {
        var baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [h, 0, l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('invert', "invert" + ps + "(" + notQuote + ")" + pe, function(match, expression, context) {
        var b, baseColor, g, r, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.rgb, r = _ref2[0], g = _ref2[1], b = _ref2[2];
        this.rgb = [255 - r, 255 - g, 255 - b];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('complement', "complement" + ps + "(" + notQuote + ")" + pe, function(match, expression, context) {
        var baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [(h + 180) % 360, s, l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), function(match, expression, context) {
        var angle, baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1], angle = match[2];
        baseColor = context.readColor(subexpr);
        angle = context.readInt(angle);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [(360 + h + angle) % 360, s, l];
        return this.alpha = baseColor.alpha;
      });
      registry.createExpression('contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), function(match, expression, context) {
        var base, baseColor, dark, expr, light, res, threshold, _, _ref2, _ref3;
        _ = match[0], expr = match[1];
        _ref2 = split(expr), base = _ref2[0], dark = _ref2[1], light = _ref2[2], threshold = _ref2[3];
        baseColor = context.readColor(base);
        dark = context.readColor(dark);
        light = context.readColor(light);
        if (threshold != null) {
          threshold = context.readPercent(threshold);
        }
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        if (dark != null ? dark.invalid : void 0) {
          return this.invalid = true;
        }
        if (light != null ? light.invalid : void 0) {
          return this.invalid = true;
        }
        res = contrast(baseColor, dark, light);
        if (isInvalid(res)) {
          return this.invalid = true;
        }
        return _ref3 = contrast(baseColor, dark, light, threshold), this.rgb = _ref3.rgb, _ref3;
      });
      registry.createExpression('contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), function(match, expression, context) {
        var baseColor, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        return _ref2 = contrast(baseColor), this.rgb = _ref2.rgb, _ref2;
      });
      registry.createExpression('css_color_function', "(?:" + namePrefixes + ")(color" + ps + "(" + notQuote + ")" + pe + ")", function(match, expression, context) {
        var e, expr, rgba, _;
        try {
          _ = match[0], expr = match[1];
          rgba = cssColor.convert(expr);
          this.rgba = context.readColor(rgba).rgba;
          return this.colorExpression = expr;
        } catch (_error) {
          e = _error;
          return this.invalid = true;
        }
      });
      registry.createExpression('sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, function(match, expression, context) {
        var baseColor, param, params, subexpr, subject, _, _i, _len, _ref2;
        _ = match[0], subexpr = match[1];
        _ref2 = split(subexpr), subject = _ref2[0], params = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
        baseColor = context.readColor(subject);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          readParam(param, function(name, value) {
            return baseColor[name] += context.readFloat(value);
          });
        }
        return this.rgba = baseColor.rgba;
      });
      registry.createExpression('sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, function(match, expression, context) {
        var baseColor, param, params, subexpr, subject, _, _i, _len, _ref2;
        _ = match[0], subexpr = match[1];
        _ref2 = split(subexpr), subject = _ref2[0], params = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
        baseColor = context.readColor(subject);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          readParam(param, function(name, value) {
            var dif, result;
            value = context.readFloat(value) / 100;
            result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
            return baseColor[name] = result;
          });
        }
        return this.rgba = baseColor.rgba;
      });
      registry.createExpression('sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, function(match, expression, context) {
        var baseColor, param, params, subexpr, subject, _, _i, _len, _ref2;
        _ = match[0], subexpr = match[1];
        _ref2 = split(subexpr), subject = _ref2[0], params = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
        baseColor = context.readColor(subject);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          readParam(param, function(name, value) {
            return baseColor[name] = context.readFloat(value);
          });
        }
        return this.rgba = baseColor.rgba;
      });
      registry.createExpression('stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), function(match, expression, context) {
        var baseColor1, baseColor2, color1, color2, expr, _, _ref2;
        _ = match[0], expr = match[1];
        _ref2 = split(expr), color1 = _ref2[0], color2 = _ref2[1];
        baseColor1 = context.readColor(color1);
        baseColor2 = context.readColor(color2);
        if (isInvalid(baseColor1) || isInvalid(baseColor2)) {
          return this.invalid = true;
        }
        return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
      });
      blendMethod(registry, 'multiply', BlendModes.MULTIPLY);
      blendMethod(registry, 'screen', BlendModes.SCREEN);
      blendMethod(registry, 'overlay', BlendModes.OVERLAY);
      blendMethod(registry, 'softlight', BlendModes.SOFT_LIGHT);
      blendMethod(registry, 'hardlight', BlendModes.HARD_LIGHT);
      blendMethod(registry, 'difference', BlendModes.DIFFERENCE);
      blendMethod(registry, 'exclusion', BlendModes.EXCLUSION);
      blendMethod(registry, 'average', BlendModes.AVERAGE);
      blendMethod(registry, 'negation', BlendModes.NEGATION);
      registry.createExpression('lua_rgba', strip("Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), function(match, expression, context) {
        var a, b, g, r, _;
        _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
        this.red = context.readInt(r);
        this.green = context.readInt(g);
        this.blue = context.readInt(b);
        return this.alpha = context.readInt(a) / 255;
      });
      registry.createExpression('elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), function(match, expression, context) {
        var a, b, g, r, _;
        _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
        this.red = context.readInt(r);
        this.green = context.readInt(g);
        this.blue = context.readInt(b);
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), function(match, expression, context) {
        var b, g, r, _;
        _ = match[0], r = match[1], g = match[2], b = match[3];
        this.red = context.readInt(r);
        this.green = context.readInt(g);
        return this.blue = context.readInt(b);
      });
      elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";
      elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + int + "|" + variables + ")\\)");
      registry.createExpression('elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), function(match, expression, context) {
        var h, hsl, l, m, s, _;
        _ = match[0], h = match[1], s = match[2], l = match[3];
        if (m = elmDegreesRegexp.exec(h)) {
          h = context.readInt(m[1]);
        } else {
          h = context.readFloat(h) * 180 / Math.PI;
        }
        hsl = [h, context.readFloat(s), context.readFloat(l)];
        if (hsl.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsl = hsl;
        return this.alpha = 1;
      });
      registry.createExpression('elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), function(match, expression, context) {
        var a, h, hsl, l, m, s, _;
        _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
        if (m = elmDegreesRegexp.exec(h)) {
          h = context.readInt(m[1]);
        } else {
          h = context.readFloat(h) * 180 / Math.PI;
        }
        hsl = [h, context.readFloat(s), context.readFloat(l)];
        if (hsl.some(function(v) {
          return (v == null) || isNaN(v);
        })) {
          return this.invalid = true;
        }
        this.hsl = hsl;
        return this.alpha = context.readFloat(a);
      });
      registry.createExpression('elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", function(match, expression, context) {
        var amount, _;
        _ = match[0], amount = match[1];
        amount = Math.floor(255 - context.readFloat(amount) * 255);
        return this.rgb = [amount, amount, amount];
      });
      registry.createExpression('elm_complement', strip("complement\\s+(" + notQuote + ")"), function(match, expression, context) {
        var baseColor, h, l, s, subexpr, _, _ref2;
        _ = match[0], subexpr = match[1];
        baseColor = context.readColor(subexpr);
        if (isInvalid(baseColor)) {
          return this.invalid = true;
        }
        _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
        this.hsl = [(h + 180) % 360, s, l];
        return this.alpha = baseColor.alpha;
      });
      if (context != null ? context.hasColorVariables() : void 0) {
        paletteRegexpString = createVariableRegExpString(context.getColorVariables());
        registry.createExpression('variables', paletteRegexpString, 1, function(match, expression, context) {
          var baseColor, name, _;
          _ = match[0], name = match[1];
          baseColor = context.readColor(name);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        });
      }
      return registry;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtXQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUVBLE9BZUksT0FBQSxDQUFRLFdBQVIsQ0FmSixFQUNFLFdBQUEsR0FERixFQUVFLGFBQUEsS0FGRixFQUdFLGVBQUEsT0FIRixFQUlFLHVCQUFBLGVBSkYsRUFLRSxvQkFBQSxZQUxGLEVBTUUsc0JBQUEsY0FORixFQU9FLGFBQUEsS0FQRixFQVFFLGdCQUFBLFFBUkYsRUFTRSxtQkFBQSxXQVRGLEVBVUUsVUFBQSxFQVZGLEVBV0UsVUFBQSxFQVhGLEVBWUUsaUJBQUEsU0FaRixFQWFFLG9CQUFBLFlBYkYsRUFjRSxrQ0FBQSwwQkFoQkYsQ0FBQTs7QUFBQSxFQW1CQSxRQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSxjQUFBLEtBREYsRUFFRSxjQUFBLEtBRkYsRUFHRSxjQUFBLEtBSEYsRUFJRSxpQkFBQSxRQXZCRixDQUFBOztBQUFBLEVBMEJBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQTFCdEIsQ0FBQTs7QUFBQSxFQTJCQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQTNCbEIsQ0FBQTs7QUFBQSxFQTRCQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0E1QlosQ0FBQTs7QUFBQSxFQTZCQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0E3QlIsQ0FBQTs7QUFBQSxFQThCQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0E5QmIsQ0FBQTs7QUFBQSxFQWdDQSxpQkFBQSxHQUNFO0FBQUEsSUFBQSxHQUFB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

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-expressions.coffee
