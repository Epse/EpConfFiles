(function() {
  var ExpressionsRegistry;

  ExpressionsRegistry = require('../lib/expressions-registry');

  describe('ExpressionsRegistry', function() {
    var Dummy, registry, _ref;
    _ref = [], registry = _ref[0], Dummy = _ref[1];
    beforeEach(function() {
      Dummy = (function() {
        function Dummy(_arg) {
          this.name = _arg.name;
        }

        return Dummy;

      })();
      return registry = new ExpressionsRegistry(Dummy);
    });
    describe('::createExpression', function() {
      return describe('called with enough data', function() {
        return it('creates a new expression of this registry expressions type', function() {
          var expression;
          expression = registry.createExpression('dummy', 'foo');
          expect(expression.constructor).toBe(Dummy);
          return expect(registry.getExpressions()).toEqual([expression]);
        });
      });
    });
    describe('::addExpression', function() {
      return it('adds a previously created expression in the registry', function() {
        var expression;
        expression = new Dummy({
          name: 'bar'
        });
        registry.addExpression(expression);
        expect(registry.getExpression('bar')).toBe(expression);
        return expect(registry.getExpressions()).toEqual([expression]);
      });
    });
    describe('::getExpressions', function() {
      return it('returns the expression based on their priority', function() {
        var expression1, expression2, expression3;
        expression1 = registry.createExpression('dummy1', '', 2);
        expression2 = registry.createExpression('dummy2', '', 0);
        expression3 = registry.createExpression('dummy3', '', 1);
        return expect(registry.getExpressions()).toEqual([expression1, expression3, expression2]);
      });
    });
    return describe('::removeExpression', function() {
      return it('removes an expression with its name', function() {
        registry.createExpression('dummy', 'foo');
        registry.removeExpression('dummy');
        return expect(registry.getExpressions()).toEqual([]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2V4cHJlc3Npb25zLXJlZ2lzdHJ5LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDZCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFFBQUEscUJBQUE7QUFBQSxJQUFBLE9BQW9CLEVBQXBCLEVBQUMsa0JBQUQsRUFBVyxlQUFYLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFNO0FBQ1MsUUFBQSxlQUFDLElBQUQsR0FBQTtBQUFXLFVBQVQsSUFBQyxDQUFBLE9BQUYsS0FBRSxJQUFRLENBQVg7UUFBQSxDQUFiOztxQkFBQTs7VUFERixDQUFBO2FBR0EsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsS0FBcEIsRUFKTjtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO2FBQzdCLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBLEdBQUE7ZUFDbEMsRUFBQSxDQUFHLDREQUFILEVBQWlFLFNBQUEsR0FBQTtBQUMvRCxjQUFBLFVBQUE7QUFBQSxVQUFBLFVBQUEsR0FBYSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUMsS0FBbkMsQ0FBYixDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sVUFBVSxDQUFDLFdBQWxCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsS0FBcEMsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBVCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxDQUFDLFVBQUQsQ0FBMUMsRUFKK0Q7UUFBQSxDQUFqRSxFQURrQztNQUFBLENBQXBDLEVBRDZCO0lBQUEsQ0FBL0IsQ0FSQSxDQUFBO0FBQUEsSUFnQkEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTthQUMxQixFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFpQixJQUFBLEtBQUEsQ0FBTTtBQUFBLFVBQUEsSUFBQSxFQUFNLEtBQU47U0FBTixDQUFqQixDQUFBO0FBQUEsUUFFQSxRQUFRLENBQUMsYUFBVCxDQUF1QixVQUF2QixDQUZBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFQLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsVUFBM0MsQ0FKQSxDQUFBO2VBS0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxjQUFULENBQUEsQ0FBUCxDQUFpQyxDQUFDLE9BQWxDLENBQTBDLENBQUMsVUFBRCxDQUExQyxFQU55RDtNQUFBLENBQTNELEVBRDBCO0lBQUEsQ0FBNUIsQ0FoQkEsQ0FBQTtBQUFBLElBeUJBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7YUFDM0IsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtBQUNuRCxZQUFBLHFDQUFBO0FBQUEsUUFBQSxXQUFBLEdBQWMsUUFBUSxDQUFDLGdCQUFULENBQTBCLFFBQTFCLEVBQW9DLEVBQXBDLEVBQXdDLENBQXhDLENBQWQsQ0FBQTtBQUFBLFFBQ0EsV0FBQSxHQUFjLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixRQUExQixFQUFvQyxFQUFwQyxFQUF3QyxDQUF4QyxDQURkLENBQUE7QUFBQSxRQUVBLFdBQUEsR0FBYyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsUUFBMUIsRUFBb0MsRUFBcEMsRUFBd0MsQ0FBeEMsQ0FGZCxDQUFBO2VBSUEsTUFBQSxDQUFPLFFBQVEsQ0FBQyxjQUFULENBQUEsQ0FBUCxDQUFpQyxDQUFDLE9BQWxDLENBQTBDLENBQ3hDLFdBRHdDLEVBRXhDLFdBRndDLEVBR3hDLFdBSHdDLENBQTFDLEVBTG1EO01BQUEsQ0FBckQsRUFEMkI7SUFBQSxDQUE3QixDQXpCQSxDQUFBO1dBcUNBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7YUFDN0IsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxRQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxLQUFuQyxDQUFBLENBQUE7QUFBQSxRQUVBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixPQUExQixDQUZBLENBQUE7ZUFJQSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBQSxDQUFQLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsRUFBMUMsRUFMd0M7TUFBQSxDQUExQyxFQUQ2QjtJQUFBLENBQS9CLEVBdEM4QjtFQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/pigments/spec/expressions-registry-spec.coffee
