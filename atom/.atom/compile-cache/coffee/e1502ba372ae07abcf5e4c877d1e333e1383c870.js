(function() {
  var Color, ColorContext, ColorExpression, ColorParser,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Color = require('./color');

  ColorParser = null;

  ColorExpression = require('./color-expression');

  module.exports = ColorContext = (function() {
    function ColorContext(options) {
      var colorVariables, sorted, v, variables, _i, _j, _len, _len1, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      this.sortPaths = __bind(this.sortPaths, this);
      variables = options.variables, colorVariables = options.colorVariables, this.referenceVariable = options.referenceVariable, this.referencePath = options.referencePath, this.rootPaths = options.rootPaths, this.parser = options.parser, this.colorVars = options.colorVars, this.vars = options.vars, this.defaultVars = options.defaultVars, this.defaultColorVars = options.defaultColorVars, sorted = options.sorted;
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
        _ref = this.variables;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          this.vars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultVars[v.name] = v;
          }
        }
        _ref1 = this.colorVariables;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          this.colorVars[v.name] = v;
          if (v.path.match(/\/.pigments$/)) {
            this.defaultColorVars[v.name] = v;
          }
        }
      }
      if (this.parser == null) {
        ColorParser = require('./color-parser');
        this.parser = new ColorParser;
      }
      this.usedVariables = [];
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
      var root, _i, _len, _ref;
      _ref = this.rootPaths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        root = _ref[_i];
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

    ColorContext.prototype.getValue = function(value) {
      var lastRealValue, realValue, _ref, _ref1;
      _ref = [], realValue = _ref[0], lastRealValue = _ref[1];
      while (realValue = (_ref1 = this.vars[value]) != null ? _ref1.value : void 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
      }
      return lastRealValue;
    };

    ColorContext.prototype.getColorValue = function(value) {
      var lastRealValue, realValue, _ref, _ref1;
      _ref = [], realValue = _ref[0], lastRealValue = _ref[1];
      while (realValue = (_ref1 = this.colorVars[value]) != null ? _ref1.value : void 0) {
        this.usedVariables.push(value);
        value = lastRealValue = realValue;
      }
      return lastRealValue;
    };

    ColorContext.prototype.readUsedVariables = function() {
      var usedVariables, v, _i, _len, _ref;
      usedVariables = [];
      _ref = this.usedVariables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (__indexOf.call(usedVariables, v) < 0) {
          usedVariables.push(v);
        }
      }
      this.usedVariables = [];
      return usedVariables;
    };

    ColorContext.prototype.readColorExpression = function(value) {
      if (this.colorVars[value] != null) {
        this.usedVariables.push(value);
        return this.colorVars[value].value;
      } else {
        return value;
      }
    };

    ColorContext.prototype.readColor = function(value, keepAllVariables) {
      var realValue, result;
      if (keepAllVariables == null) {
        keepAllVariables = false;
      }
      realValue = this.readColorExpression(value);
      result = this.parser.parse(realValue, this.clone());
      if (result != null) {
        if (result.invalid && (this.defaultColorVars[realValue] != null)) {
          this.usedVariables.push(realValue);
          result = this.readColor(this.defaultColorVars[realValue].value);
          value = realValue;
        }
      } else if (this.defaultColorVars[value] != null) {
        this.usedVariables.push(realValue);
        result = this.readColor(this.defaultColorVars[value].value);
      }
      if ((result != null) && (keepAllVariables || __indexOf.call(this.usedVariables, value) < 0)) {
        result.variables = result.variables.concat(this.readUsedVariables());
      }
      return result;
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

    return ColorContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItY29udGV4dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7SUFBQTt5SkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsSUFEZCxDQUFBOztBQUFBLEVBRUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLE9BQUQsR0FBQTtBQUNYLFVBQUEsc0VBQUE7O1FBRFksVUFBUTtPQUNwQjtBQUFBLG1EQUFBLENBQUE7QUFBQSxNQUFDLG9CQUFBLFNBQUQsRUFBWSx5QkFBQSxjQUFaLEVBQTRCLElBQUMsQ0FBQSw0QkFBQSxpQkFBN0IsRUFBZ0QsSUFBQyxDQUFBLHdCQUFBLGFBQWpELEVBQWdFLElBQUMsQ0FBQSxvQkFBQSxTQUFqRSxFQUE0RSxJQUFDLENBQUEsaUJBQUEsTUFBN0UsRUFBcUYsSUFBQyxDQUFBLG9CQUFBLFNBQXRGLEVBQWlHLElBQUMsQ0FBQSxlQUFBLElBQWxHLEVBQXdHLElBQUMsQ0FBQSxzQkFBQSxXQUF6RyxFQUFzSCxJQUFDLENBQUEsMkJBQUEsZ0JBQXZILEVBQXlJLGlCQUFBLE1BQXpJLENBQUE7O1FBRUEsWUFBYTtPQUZiOztRQUdBLGlCQUFrQjtPQUhsQjs7UUFJQSxJQUFDLENBQUEsWUFBYTtPQUpkO0FBS0EsTUFBQSxJQUE2Qyw4QkFBN0M7O1VBQUEsSUFBQyxDQUFBLGdCQUFpQixJQUFDLENBQUEsaUJBQWlCLENBQUM7U0FBckM7T0FMQTtBQU9BLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBSjtBQUNFLFFBQUEsSUFB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

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-context.coffee
