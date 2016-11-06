(function() {
  var BlendModes, Color, ColorContext, ColorExpression, ColorParser, SVGColors, clamp, clampInt, comma, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, scopeFromFileName, split, variables, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], Color = _ref[0], ColorParser = _ref[1], ColorExpression = _ref[2], SVGColors = _ref[3], BlendModes = _ref[4], int = _ref[5], float = _ref[6], percent = _ref[7], optionalPercent = _ref[8], intOrPercent = _ref[9], floatOrPercent = _ref[10], comma = _ref[11], notQuote = _ref[12], hexadecimal = _ref[13], ps = _ref[14], pe = _ref[15], variables = _ref[16], namePrefixes = _ref[17], split = _ref[18], clamp = _ref[19], clampInt = _ref[20], scopeFromFileName = _ref[21];

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, expr, sorted, v, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      this.sortPaths = __bind(this.sortPaths, this);
      if (Color == null) {
        Color = require('./color');
        SVGColors = require('./svg-colors');
        BlendModes = require('./blend-modes');
        if (ColorExpression == null) {
          ColorExpression = require('./color-expression');
        }
        _ref1 = require('./regexes'), int = _ref1.int, float = _ref1.float, percent = _ref1.percent, optionalPercent = _ref1.optionalPercent, intOrPercent = _ref1.intOrPercent, floatOrPercent = _ref1.floatOrPercent, comma = _ref1.comma, notQuote = _ref1.notQuote, hexadecimal = _ref1.hexadecimal, ps = _ref1.ps, pe = _ref1.pe, variables = _ref1.variables, namePrefixes = _ref1.namePrefixes;
        ColorContext.prototype.SVGColors = SVGColors;
        ColorContext.prototype.Color = Color;
        ColorContext.prototype.BlendModes = BlendModes;
        ColorContext.prototype.int = int;
        ColorContext.prototype.float = float;
        ColorContext.prototype.percent = percent;
        ColorContext.prototype.optionalPercent = optionalPercent;
        ColorContext.prototype.intOrPercent = intOrPercent;
        ColorContext.prototype.floatOrPercent = floatOrPercent;
        ColorContext.prototype.comma = comma;
        ColorContext.prototype.notQuote = notQuote;
        ColorContext.prototype.hexadecimal = hexadecimal;
        ColorContext.prototype.ps = ps;
        ColorContext.prototype.pe = pe;
        ColorContext.prototype.variablesRE = variables;
        ColorContext.prototype.namePrefixes = namePrefixes;
      }
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted, this.registry = options.registry, this.sassScopeSuffix = options.sassScopeSuffix;
      if (variables == null) {
        variables = [];
      }
      if (colorVariables == null) {
        colorVariables = [];
      }
      if (this.rootPaths == null) {
        this.rootPaths = [];
      }
      if (this.referenceVariable != null) {
        if (this.referencePath == null) {
          this.referencePath = this.referenceVariable.path;
        }
      }
      if (this.sorted) {
        this.variables = variables;
        this.colorVariables = colorVariables;
      } else {
        this.variables = variables.slice().sort(this.sortPaths);
        this.colorVariables = colorVariables.slice().sort(this.sortPaths);
      }
      if (this.vars == null) {
        this.vars = {};
        this.colorVars = {};
        this.defaultVars = {};
        this.defaultColorVars = {};
        _ref2 = this.variables;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          v = _ref2[_i];
          if (!v["default"]) {
            this.vars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultVars[v.name] = v;
          }
        }
        _ref3 = this.colorVariables;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          v = _ref3[_j];
          if (!v["default"]) {
            this.colorVars[v.name] = v;
          }
          if (v["default"]) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if ((this.registry.getExpression('pigments:variables') == null) && this.colorVariables.length > 0) {
        expr = ColorExpression.colorExpressionForColorVariables(this.colorVariables);
        this.registry.addExpression(expr);
      }
      if (this.parser == null) {
        if (ColorParser == null) {
          ColorParser = require('./color-parser');
        }
        this.parser = new ColorParser(this.registry, this);
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
    }

    ColorContext.prototype.sortPaths = function(a, b) {
      var rootA, rootB, rootReference;
      if (this.referencePath != null) {
        if (a.path === b.path) {
          return 0;
        }
        if (a.path === this.referencePath) {
          return 1;
        }
        if (b.path === this.referencePath) {
          return -1;
        }
        rootReference = this.rootPathForPath(this.referencePath);
        rootA = this.rootPathForPath(a.path);
        rootB = this.rootPathForPath(b.path);
        if (rootA === rootB) {
          return 0;
        }
        if (rootA === rootReference) {
          return 1;
        }
        if (rootB === rootReference) {
          return -1;
        }
        return 0;
      } else {
        return 0;
      }
    };

    ColorContext.prototype.rootPathForPath = function(path) {
      var root, _i, _len, _ref1;
      _ref1 = this.rootPaths;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        root = _ref1[_i];
        if (path.indexOf("" + root + "/") === 0) {
          return root;
        }
      }
    };

    ColorContext.prototype.clone = function() {
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        referenceVariable: this.referenceVariable,
        parser: this.parser,
        vars: this.vars,
        colorVars: this.colorVars,
        defaultVars: this.defaultVars,
        defaultColorVars: this.defaultColorVars,
        sorted: true
      });
    };

    ColorContext.prototype.containsVariable = function(variableName) {
      return __indexOf.call(this.getVariablesNames(), variableName) >= 0;
    };

    ColorContext.prototype.hasColorVariables = function() {
      return this.colorVariables.length > 0;
    };

    ColorContext.prototype.getVariables = function() {
      return this.variables;
    };

    ColorContext.prototype.getColorVariables = function() {
      return this.colorVariables;
    };

    ColorContext.prototype.getVariablesNames = function() {
      return this.varNames != null ? this.varNames : this.varNames = Object.keys(this.vars);
    };

    ColorContext.prototype.getVariablesCount = function() {
      return this.varCount != null ? this.varCount : this.varCount = this.getVariablesNames().length;
    };

    ColorContext.prototype.readUsedVariables = function() {
      var usedVariables, v, _i, _len, _ref1;
      usedVariables = [];
      _ref1 = this.usedVariables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (__indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      this.resolvedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, lookedUpValues, realValue, _ref1, _ref2;
      _ref1 = [], realValue = _ref1[0], lastRealValue = _ref1[1];
      lookedUpValues = [value];
      while ((realValue = (_ref2 = this.vars[value]) != null ? _ref2.value : void 0) && __indexOf.call(lookedUpValues, realValue) < 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
        lookedUpValues.push(realValue);
      }
      if (__indexOf.call(lookedUpValues, realValue) >= 0) {
        return void 0;
      } else {
        return lastRealValue;
      }
    };

    ColorContext.prototype.readColorExpression = function(value) {
      if (this.colorVars[value] != null) {
        this.usedVariables.push(value);
        return this.colorVars[value].value;
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        return this.defaultColorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, result, scope, _ref1;
      if (keepAllVariables == null) {
        keepAllVariables = false;
      }
      if (__indexOf.call(this.usedVariables, value) >= 0 && !(__indexOf.call(this.resolvedVariables, value) >= 0)) {
        return;
      }
      realValue = this.readColorExpression(value);
      if ((realValue == null) || __indexOf.call(this.usedVariables, realValue) >= 0) {
        return;
      }
      scope = this.colorVars[value] != null ? this.scopeFromFileName(this.colorVars[value].path) : '*';
      this.usedVariables = this.usedVariables.filter(function(v) {
        return v !== realValue;
      });
      result = this.parser.parse(realValue, scope, false);
      if (result != null) {
        if (result.invalid && (this.defaultColorVars[realValue] != null)) {
          result = this.readColor(this.defaultColorVars[realValue].value);
          value = realValue;
        }
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(value);
        result = this.readColor(this.defaultColorVars[value].value);
      } else {
        if (this.vars[value] != null) {
          this.usedVariables.push(value);
        }
      }
      if (result != null) {
        this.resolvedVariables.push(value);
        if (keepAllVariables || __indexOf.call(this.usedVariables, value) < 0) {
          result.variables = ((_ref1 = result.variables) != null ? _ref1 : []).concat(this.readUsedVariables());
        }
      }
      return result;
    };

    ColorContext.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.sassScopeSuffix].join(':');
      }
      return scope;
    };

    ColorContext.prototype.readFloat = function(value) {
      var res;
      res = parseFloat(value);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readFloat(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readInt = function(value, base) {
      var res;
      if (base == null) {
        base = 10;
      }
      res = parseInt(value, base);
      if (isNaN(res) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.vars[value].value);
      }
      if (isNaN(res) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        res = this.readInt(this.defaultVars[value].value);
      }
      return res;
    };

    ColorContext.prototype.readPercent = function(value) {
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readPercent(this.defaultVars[value].value);
      }
      return Math.round(parseFloat(value) * 2.55);
    };

    ColorContext.prototype.readIntOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readIntOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = Math.round(parseFloat(value) * 2.55);
      } else {
        res = parseInt(value);
      }
      return res;
    };

    ColorContext.prototype.readFloatOrPercent = function(value) {
      var res;
      if (!/\d+/.test(value) && (this.vars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.vars[value].value);
      }
      if (!/\d+/.test(value) && (this.defaultVars[value] != null)) {
        this.usedVariables.push(value);
        value = this.readFloatOrPercent(this.defaultVars[value].value);
      }
      if (value == null) {
        return NaN;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value.indexOf('%') !== -1) {
        res = parseFloat(value) / 100;
      } else {
        res = parseFloat(value);
        if (res > 1) {
          res = res / 100;
        }
        res;
      }
      return res;
    };

    ColorContext.prototype.split = function(value) {
      var _ref1;
      if (split == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return split(value);
    };

    ColorContext.prototype.clamp = function(value) {
      var _ref1;
      if (clamp == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return clamp(value);
    };

    ColorContext.prototype.clampInt = function(value) {
      var _ref1;
      if (clampInt == null) {
        _ref1 = require('./utils'), split = _ref1.split, clamp = _ref1.clamp, clampInt = _ref1.clampInt;
      }
      return clampInt(value);
    };

    ColorContext.prototype.isInvalid = function(color) {
      return !Color.isValid(color);
    };

    ColorContext.prototype.readParam = function(param, block) {
      var name, re, value, _, _ref1;
      re = RegExp("\\$(\\w+):\\s*((-?" + this.float + ")|" + this.variablesRE + ")");
      if (re.test(param)) {
        _ref1 = re.exec(param), _ = _ref1[0], name = _ref1[1], value = _ref1[2];
        return block(name, value);
      }
    };

    ColorContext.prototype.contrast = function(base, dark, light, threshold) {
      var _ref1;
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
        _ref1 = [dark, light], light = _ref1[0], dark = _ref1[1];
      }
      if (base.luma > threshold) {
        return dark;
      } else {
        return light;
      }
    };

    ColorContext.prototype.mixColors = function(color1, color2, amount, round) {
      var color, inverse;
      if (amount == null) {
        amount = 0.5;
      }
      if (round == null) {
        round = Math.floor;
      }
      if (!((color1 != null) && (color2 != null) && !isNaN(amount))) {
        return new Color(NaN, NaN, NaN, NaN);
      }
      inverse = 1 - amount;
      color = new Color;
      color.rgba = [round(color1.red * amount + color2.red * inverse), round(color1.green * amount + color2.green * inverse), round(color1.blue * amount + color2.blue * inverse), color1.alpha * amount + color2.alpha * inverse];
      return color;
    };

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1jb250ZXh0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0UEFBQTtJQUFBO3lKQUFBOztBQUFBLEVBQUEsT0FLSSxFQUxKLEVBQ0UsZUFERixFQUNTLHFCQURULEVBQ3NCLHlCQUR0QixFQUN1QyxtQkFEdkMsRUFDa0Qsb0JBRGxELEVBRUUsYUFGRixFQUVPLGVBRlAsRUFFYyxpQkFGZCxFQUV1Qix5QkFGdkIsRUFFd0Msc0JBRnhDLEVBRXNELHlCQUZ0RCxFQUVzRSxnQkFGdEUsRUFHRSxtQkFIRixFQUdZLHNCQUhaLEVBR3lCLGFBSHpCLEVBRzZCLGFBSDdCLEVBR2lDLG9CQUhqQyxFQUc0Qyx1QkFINUMsRUFJRSxnQkFKRixFQUlTLGdCQUpULEVBSWdCLG1CQUpoQixFQUkwQiw0QkFKMUIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLE9BQUQsR0FBQTtBQUNYLFVBQUEseUVBQUE7O1FBRFksVUFBUTtPQUNwQjtBQUFBLG1EQUFBLENBQUE7QUFBQSxNQUFBLElBQU8sYUFBUDtBQUNFLFFBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBQVIsQ0FBQTtBQUFBLFFBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBRFosQ0FBQTtBQUFBLFFBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7VUFHQSxrQkFBbUIsT0FBQSxDQUFRLG9CQUFSO1NBSG5CO0FBQUEsUUFLQSxRQUdJLE9BQUEsQ0FBUSxXQUFSLENBSEosRUFDRSxZQUFBLEdBREYsRUFDTyxjQUFBLEtBRFAsRUFDYyxnQkFBQSxPQURkLEVBQ3VCLHdCQUFBLGVBRHZC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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-context.coffee
