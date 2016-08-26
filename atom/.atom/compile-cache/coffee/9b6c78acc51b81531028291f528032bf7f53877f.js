(function() {
  describe('helpers', function() {
    var helpers;
    helpers = require('../lib/helpers');
    beforeEach(function() {
      return atom.notifications.clear();
    });
    describe('::error', function() {
      return it('adds an error notification', function() {
        helpers.error(new Error());
        return expect(atom.notifications.getNotifications().length).toBe(1);
      });
    });
    return describe('::shouldTriggerLinter', function() {
      var bufferModifying, lintOnFly, normalLinter;
      normalLinter = {
        grammarScopes: ['*'],
        scope: 'file',
        lintOnFly: false,
        lint: function() {}
      };
      lintOnFly = {
        grammarScopes: ['*'],
        scope: 'file',
        lintOnFly: true,
        lint: function() {}
      };
      bufferModifying = {
        grammarScopes: ['*'],
        scope: 'file',
        lintOnFly: false,
        lint: function() {}
      };
      it('accepts a wildcard grammarScope', function() {
        return expect(helpers.shouldTriggerLinter(normalLinter, false, ['*'])).toBe(true);
      });
      it('runs lintOnFly ones on both save and lintOnFly', function() {
        expect(helpers.shouldTriggerLinter(lintOnFly, false, ['*'])).toBe(true);
        return expect(helpers.shouldTriggerLinter(lintOnFly, true, ['*'])).toBe(true);
      });
      return it("doesn't run save ones on fly", function() {
        return expect(helpers.shouldTriggerLinter(normalLinter, true, ['*'])).toBe(false);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9oZWxwZXJzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FBVixDQUFBO0FBQUEsSUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFuQixDQUFBLEVBRFM7SUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLElBSUEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO2FBQ2xCLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSxPQUFPLENBQUMsS0FBUixDQUFrQixJQUFBLEtBQUEsQ0FBQSxDQUFsQixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBbkIsQ0FBQSxDQUFxQyxDQUFDLE1BQTdDLENBQW9ELENBQUMsSUFBckQsQ0FBMEQsQ0FBMUQsRUFGK0I7TUFBQSxDQUFqQyxFQURrQjtJQUFBLENBQXBCLENBSkEsQ0FBQTtXQVNBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSx3Q0FBQTtBQUFBLE1BQUEsWUFBQSxHQUNFO0FBQUEsUUFBQSxhQUFBLEVBQWUsQ0FBQyxHQUFELENBQWY7QUFBQSxRQUNBLEtBQUEsRUFBTyxNQURQO0FBQUEsUUFFQSxTQUFBLEVBQVcsS0FGWDtBQUFBLFFBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUhOO09BREYsQ0FBQTtBQUFBLE1BS0EsU0FBQSxHQUNFO0FBQUEsUUFBQSxhQUFBLEVBQWUsQ0FBQyxHQUFELENBQWY7QUFBQSxRQUNBLEtBQUEsRUFBTyxNQURQO0FBQUEsUUFFQSxTQUFBLEVBQVcsSUFGWDtBQUFBLFFBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUhOO09BTkYsQ0FBQTtBQUFBLE1BVUEsZUFBQSxHQUNFO0FBQUEsUUFBQSxhQUFBLEVBQWUsQ0FBQyxHQUFELENBQWY7QUFBQSxRQUNBLEtBQUEsRUFBTyxNQURQO0FBQUEsUUFFQSxTQUFBLEVBQVcsS0FGWDtBQUFBLFFBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUhOO09BWEYsQ0FBQTtBQUFBLE1BZUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtlQUNwQyxNQUFBLENBQU8sT0FBTyxDQUFDLG1CQUFSLENBQTRCLFlBQTVCLEVBQTBDLEtBQTFDLEVBQWlELENBQUMsR0FBRCxDQUFqRCxDQUFQLENBQStELENBQUMsSUFBaEUsQ0FBcUUsSUFBckUsRUFEb0M7TUFBQSxDQUF0QyxDQWZBLENBQUE7QUFBQSxNQWlCQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFFBQUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxtQkFBUixDQUE0QixTQUE1QixFQUF1QyxLQUF2QyxFQUE4QyxDQUFDLEdBQUQsQ0FBOUMsQ0FBUCxDQUE0RCxDQUFDLElBQTdELENBQWtFLElBQWxFLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsbUJBQVIsQ0FBNEIsU0FBNUIsRUFBdUMsSUFBdkMsRUFBNkMsQ0FBQyxHQUFELENBQTdDLENBQVAsQ0FBMkQsQ0FBQyxJQUE1RCxDQUFpRSxJQUFqRSxFQUZtRDtNQUFBLENBQXJELENBakJBLENBQUE7YUFvQkEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtlQUNqQyxNQUFBLENBQU8sT0FBTyxDQUFDLG1CQUFSLENBQTRCLFlBQTVCLEVBQTBDLElBQTFDLEVBQWdELENBQUMsR0FBRCxDQUFoRCxDQUFQLENBQThELENBQUMsSUFBL0QsQ0FBb0UsS0FBcEUsRUFEaUM7TUFBQSxDQUFuQyxFQXJCZ0M7SUFBQSxDQUFsQyxFQVZrQjtFQUFBLENBQXBCLENBQUEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/linter/spec/helpers-spec.coffee
