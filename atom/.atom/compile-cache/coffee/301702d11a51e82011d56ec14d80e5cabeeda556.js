(function() {
  var Color, ColorContext, ColorExpression, ColorParser, getRegistry;

  Color = require('./color');

  ColorExpression = require('./color-expression');

  ColorContext = null;

  getRegistry = require('./color-expressions').getRegistry;

  module.exports = ColorParser = (function() {
    function ColorParser() {}

    ColorParser.prototype.parse = function(expression, context) {
      var e, registry, res, _i, _len, _ref;
      if (context == null) {
        if (ColorContext == null) {
          ColorContext = require('./color-context');
        }
        context = new ColorContext;
      }
      if (context.parser == null) {
        context.parser = this;
      }
      if ((expression == null) || expression === '') {
        return void 0;
      }
      registry = getRegistry(context);
      _ref = registry.getExpressions();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (e.match(expression)) {
          res = e.parse(expression, context);
          res.variables = context.readUsedVariables();
          return res;
        }
      }
      return void 0;
    };

    return ColorParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItcGFyc2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw4REFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQURsQixDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLElBRmYsQ0FBQTs7QUFBQSxFQUlDLGNBQWUsT0FBQSxDQUFRLHFCQUFSLEVBQWYsV0FKRCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUEsR0FBQSxDQUFiOztBQUFBLDBCQUVBLEtBQUEsR0FBTyxTQUFDLFVBQUQsRUFBYSxPQUFiLEdBQUE7QUFDTCxVQUFBLGdDQUFBO0FBQUEsTUFBQSxJQUFPLGVBQVA7O1VBQ0UsZUFBZ0IsT0FBQSxDQUFRLGlCQUFSO1NBQWhCO0FBQUEsUUFDQSxPQUFBLEdBQVUsR0FBQSxDQUFBLFlBRFYsQ0FERjtPQUFBOztRQUdBLE9BQU8sQ0FBQyxTQUFVO09BSGxCO0FBS0EsTUFBQSxJQUF3QixvQkFBSixJQUFtQixVQUFBLEtBQWMsRUFBckQ7QUFBQSxlQUFPLE1BQVAsQ0FBQTtPQUxBO0FBQUEsTUFPQSxRQUFBLEdBQVcsV0FBQSxDQUFZLE9BQVosQ0FQWCxDQUFBO0FBU0E7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixDQUFIO0FBQ0UsVUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFSLEVBQW9CLE9BQXBCLENBQU4sQ0FBQTtBQUFBLFVBQ0EsR0FBRyxDQUFDLFNBQUosR0FBZ0IsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FEaEIsQ0FBQTtBQUVBLGlCQUFPLEdBQVAsQ0FIRjtTQURGO0FBQUEsT0FUQTtBQWVBLGFBQU8sTUFBUCxDQWhCSztJQUFBLENBRlAsQ0FBQTs7dUJBQUE7O01BUkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-parser.coffee
