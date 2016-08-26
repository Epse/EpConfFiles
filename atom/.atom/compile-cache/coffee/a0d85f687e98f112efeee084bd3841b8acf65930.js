(function() {
  var EditorLinter, LinterRegistry;

  LinterRegistry = require('../lib/linter-registry');

  EditorLinter = require('../lib/editor-linter');

  module.exports = {
    getLinter: function() {
      return {
        grammarScopes: ['*'],
        lintOnFly: false,
        modifiesBuffer: false,
        scope: 'project',
        lint: function() {}
      };
    },
    getMessage: function(type, filePath, range) {
      return {
        type: type,
        text: 'Some Message',
        filePath: filePath,
        range: range
      };
    },
    getLinterRegistry: function() {
      var editorLinter, linter, linterRegistry;
      linterRegistry = new LinterRegistry;
      editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
      linter = {
        grammarScopes: ['*'],
        lintOnFly: false,
        modifiesBuffer: false,
        scope: 'project',
        lint: function() {
          return [
            {
              type: 'Error',
              text: 'Something'
            }
          ];
        }
      };
      linterRegistry.addLinter(linter);
      return {
        linterRegistry: linterRegistry,
        editorLinter: editorLinter,
        linter: linter
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9jb21tb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsU0FBQSxFQUFXLFNBQUEsR0FBQTtBQUNULGFBQU87QUFBQSxRQUFDLGFBQUEsRUFBZSxDQUFDLEdBQUQsQ0FBaEI7QUFBQSxRQUF1QixTQUFBLEVBQVcsS0FBbEM7QUFBQSxRQUF5QyxjQUFBLEVBQWdCLEtBQXpEO0FBQUEsUUFBZ0UsS0FBQSxFQUFPLFNBQXZFO0FBQUEsUUFBa0YsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUF4RjtPQUFQLENBRFM7SUFBQSxDQUFYO0FBQUEsSUFFQSxVQUFBLEVBQVksU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixLQUFqQixHQUFBO0FBQ1YsYUFBTztBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxJQUFBLEVBQU0sY0FBYjtBQUFBLFFBQTZCLFVBQUEsUUFBN0I7QUFBQSxRQUF1QyxPQUFBLEtBQXZDO09BQVAsQ0FEVTtJQUFBLENBRlo7QUFBQSxJQUlBLGlCQUFBLEVBQW1CLFNBQUEsR0FBQTtBQUNqQixVQUFBLG9DQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLEdBQUEsQ0FBQSxjQUFqQixDQUFBO0FBQUEsTUFDQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFiLENBRG5CLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUztBQUFBLFFBQ1AsYUFBQSxFQUFlLENBQUMsR0FBRCxDQURSO0FBQUEsUUFFUCxTQUFBLEVBQVcsS0FGSjtBQUFBLFFBR1AsY0FBQSxFQUFnQixLQUhUO0FBQUEsUUFJUCxLQUFBLEVBQU8sU0FKQTtBQUFBLFFBS1AsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUFHLGlCQUFPO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLFdBQXRCO2FBQUQ7V0FBUCxDQUFIO1FBQUEsQ0FMQztPQUZULENBQUE7QUFBQSxNQVNBLGNBQWMsQ0FBQyxTQUFmLENBQXlCLE1BQXpCLENBVEEsQ0FBQTtBQVVBLGFBQU87QUFBQSxRQUFDLGdCQUFBLGNBQUQ7QUFBQSxRQUFpQixjQUFBLFlBQWpCO0FBQUEsUUFBK0IsUUFBQSxNQUEvQjtPQUFQLENBWGlCO0lBQUEsQ0FKbkI7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/linter/spec/common.coffee
