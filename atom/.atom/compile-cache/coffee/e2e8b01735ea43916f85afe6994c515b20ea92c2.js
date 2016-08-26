(function() {
  var Color, ColorExpression;

  Color = require('./color');

  module.exports = ColorExpression = (function() {
    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.handle = _arg.handle;
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
      color = new Color();
      color.colorExpression = expression;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref = re.exec(text), match = _ref[0], _ref) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBUixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEseUJBQUMsSUFBRCxHQUFBO0FBQ1gsTUFEYSxJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxvQkFBQSxjQUFjLElBQUMsQ0FBQSxjQUFBLE1BQ3BDLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQVEsR0FBQSxHQUFHLElBQUMsQ0FBQSxZQUFKLEdBQWlCLEdBQXpCLENBQWQsQ0FEVztJQUFBLENBQWI7O0FBQUEsOEJBR0EsS0FBQSxHQUFPLFNBQUMsVUFBRCxHQUFBO2FBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsRUFBaEI7SUFBQSxDQUhQLENBQUE7O0FBQUEsOEJBS0EsS0FBQSxHQUFPLFNBQUMsVUFBRCxFQUFhLE9BQWIsR0FBQTtBQUNMLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQW9CLENBQUEsS0FBRCxDQUFPLFVBQVAsQ0FBbkI7QUFBQSxlQUFPLElBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FGWixDQUFBO0FBQUEsTUFHQSxLQUFLLENBQUMsZUFBTixHQUF3QixVQUh4QixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxLQUFiLEVBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FBcEIsRUFBOEMsVUFBOUMsRUFBMEQsT0FBMUQsQ0FKQSxDQUFBO2FBS0EsTUFOSztJQUFBLENBTFAsQ0FBQTs7QUFBQSw4QkFhQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ04sVUFBQSwwQ0FBQTs7UUFEYSxRQUFNO09BQ25CO0FBQUEsTUFBQSxPQUFBLEdBQVUsTUFBVixDQUFBO0FBQUEsTUFDQSxFQUFBLEdBQVMsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFlBQVIsRUFBc0IsR0FBdEIsQ0FEVCxDQUFBO0FBQUEsTUFFQSxFQUFFLENBQUMsU0FBSCxHQUFlLEtBRmYsQ0FBQTtBQUdBLE1BQUEsSUFBRyxPQUFVLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixDQUFWLEVBQUMsZUFBRCxFQUFBLElBQUg7QUFDRSxRQUFDLFlBQWEsR0FBYixTQUFELENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxDQUFDLFNBQUEsR0FBWSxLQUFLLENBQUMsTUFBbkIsRUFBMkIsU0FBM0IsQ0FEUixDQUFBO0FBQUEsUUFFQSxPQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sSUFBSywwQkFEWjtTQUhGLENBREY7T0FIQTthQVVBLFFBWE07SUFBQSxDQWJSLENBQUE7OzJCQUFBOztNQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-expression.coffee
