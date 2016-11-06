(function() {
  var Color, ColorExpression, createVariableRegExpString, _ref;

  _ref = [], createVariableRegExpString = _ref[0], Color = _ref[1];

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      if (createVariableRegExpString == null) {
        createVariableRegExpString = require('./regexes').createVariableRegExpString;
      }
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var baseColor, evaluated, name, _;
          _ = match[0], _ = match[1], name = match[2];
          if (name == null) {
            name = match[0];
          }
          evaluated = context.readColorExpression(name);
          if (evaluated === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(evaluated);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      if (Color == null) {
        Color = require('./color');
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref1;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref1 = re.exec(text), match = _ref1[0], _ref1) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3REFBQTs7QUFBQSxFQUFBLE9BQXNDLEVBQXRDLEVBQUMsb0NBQUQsRUFBNkIsZUFBN0IsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLGVBQUMsQ0FBQSx5QkFBRCxHQUE0QixTQUFDLE9BQUQsR0FBQTthQUMxQixJQUFDLENBQUEsZ0NBQUQsQ0FBa0MsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FBbEMsRUFEMEI7SUFBQSxDQUE1QixDQUFBOztBQUFBLElBR0EsZUFBQyxDQUFBLHNDQUFELEdBQXlDLFNBQUMsY0FBRCxHQUFBO0FBQ3ZDLE1BQUEsSUFBTyxrQ0FBUDtBQUNFLFFBQUMsNkJBQThCLE9BQUEsQ0FBUSxXQUFSLEVBQTlCLDBCQUFELENBREY7T0FBQTthQUdBLDBCQUFBLENBQTJCLGNBQTNCLEVBSnVDO0lBQUEsQ0FIekMsQ0FBQTs7QUFBQSxJQVNBLGVBQUMsQ0FBQSxnQ0FBRCxHQUFtQyxTQUFDLGNBQUQsR0FBQTtBQUNqQyxVQUFBLG1CQUFBO0FBQUEsTUFBQSxtQkFBQSxHQUFzQixJQUFDLENBQUEsc0NBQUQsQ0FBd0MsY0FBeEMsQ0FBdEIsQ0FBQTthQUVJLElBQUEsZUFBQSxDQUNGO0FBQUEsUUFBQSxJQUFBLEVBQU0sb0JBQU47QUFBQSxRQUNBLFlBQUEsRUFBYyxtQkFEZDtBQUFBLFFBRUEsTUFBQSxFQUFRLENBQUMsR0FBRCxDQUZSO0FBQUEsUUFHQSxRQUFBLEVBQVUsQ0FIVjtBQUFBLFFBSUEsTUFBQSxFQUFRLFNBQUMsS0FBRCxFQUFRLFVBQVIsRUFBb0IsT0FBcEIsR0FBQTtB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-expression.coffee
