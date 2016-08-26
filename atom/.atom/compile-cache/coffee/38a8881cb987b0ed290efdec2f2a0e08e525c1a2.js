(function() {
  var ColorExpression, ExpressionsRegistry;

  ColorExpression = require('./color-expression');

  module.exports = ExpressionsRegistry = (function() {
    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
      this.colorExpressions = {};
    }

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var _ref, _results;
        _ref = this.colorExpressions;
        _results = [];
        for (k in _ref) {
          e = _ref[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      return this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, handle) {
      var newExpression, _ref;
      if (priority == null) {
        priority = 0;
      }
      if (typeof priority === 'function') {
        _ref = [0, priority], priority = _ref[0], handle = _ref[1];
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        handle: handle
      });
      newExpression.priority = priority;
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression) {
      return this.colorExpressions[expression.name] = expression;
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      return delete this.colorExpressions[name];
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvZXhwcmVzc2lvbnMtcmVnaXN0cnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFUyxJQUFBLDZCQUFFLGVBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLGtCQUFBLGVBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEVBQXBCLENBRFc7SUFBQSxDQUFiOztBQUFBLGtDQUdBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxJQUFBO2FBQUE7O0FBQUM7QUFBQTthQUFBLFNBQUE7c0JBQUE7QUFBQSx3QkFBQSxFQUFBLENBQUE7QUFBQTs7bUJBQUQsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7ZUFBUyxDQUFDLENBQUMsUUFBRixHQUFhLENBQUMsQ0FBQyxTQUF4QjtNQUFBLENBQXRDLEVBRGM7SUFBQSxDQUhoQixDQUFBOztBQUFBLGtDQU1BLGFBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxJQUFBLEVBQTVCO0lBQUEsQ0FOZixDQUFBOztBQUFBLGtDQVFBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFDVCxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxDQUFELEdBQUE7ZUFBUSxHQUFBLEdBQUcsQ0FBQyxDQUFDLFlBQUwsR0FBa0IsSUFBMUI7TUFBQSxDQUF0QixDQUFtRCxDQUFDLElBQXBELENBQXlELEdBQXpELEVBRFM7SUFBQSxDQVJYLENBQUE7O0FBQUEsa0NBV0EsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEVBQU8sWUFBUCxFQUFxQixRQUFyQixFQUFpQyxNQUFqQyxHQUFBO0FBQ2hCLFVBQUEsbUJBQUE7O1FBRHFDLFdBQVM7T0FDOUM7QUFBQSxNQUFBLElBQXNDLE1BQUEsQ0FBQSxRQUFBLEtBQW1CLFVBQXpEO0FBQUEsUUFBQSxPQUFxQixDQUFDLENBQUQsRUFBSSxRQUFKLENBQXJCLEVBQUMsa0JBQUQsRUFBVyxnQkFBWCxDQUFBO09BQUE7QUFBQSxNQUNBLGFBQUEsR0FBb0IsSUFBQSxJQUFDLENBQUEsZUFBRCxDQUFpQjtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxjQUFBLFlBQVA7QUFBQSxRQUFxQixRQUFBLE1BQXJCO09BQWpCLENBRHBCLENBQUE7QUFBQSxNQUVBLGFBQWEsQ0FBQyxRQUFkLEdBQXlCLFFBRnpCLENBQUE7YUFHQSxJQUFDLENBQUEsYUFBRCxDQUFlLGFBQWYsRUFKZ0I7SUFBQSxDQVhsQixDQUFBOztBQUFBLGtDQWlCQSxhQUFBLEdBQWUsU0FBQyxVQUFELEdBQUE7YUFDYixJQUFDLENBQUEsZ0JBQWlCLENBQUEsVUFBVSxDQUFDLElBQVgsQ0FBbEIsR0FBcUMsV0FEeEI7SUFBQSxDQWpCZixDQUFBOztBQUFBLGtDQW9CQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTthQUFVLE1BQUEsQ0FBQSxJQUFRLENBQUEsZ0JBQWlCLENBQUEsSUFBQSxFQUFuQztJQUFBLENBcEJsQixDQUFBOzsrQkFBQTs7TUFMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/pigments/lib/expressions-registry.coffee
