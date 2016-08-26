(function() {
  var BufferColorsScanner, ColorContext, ColorScanner, ColorsChunkSize, createVariableExpression, getRegistry;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  getRegistry = require('../color-expressions').getRegistry;

  createVariableExpression = require('../utils').createVariableExpression;

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var bufferPath, colorVariables, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, bufferPath = config.bufferPath;
      this.context = new ColorContext({
        variables: variables,
        colorVariables: colorVariables,
        referencePath: bufferPath
      });
      this.scanner = new ColorScanner({
        context: this.context
      });
      this.results = [];
    }

    BufferColorsScanner.prototype.scan = function() {
      var lastIndex, result;
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, lastIndex)) {
        this.results.push(result);
        if (this.results.length >= ColorsChunkSize) {
          this.flushColors();
        }
        lastIndex = result.lastIndex;
      }
      return this.flushColors();
    };

    BufferColorsScanner.prototype.flushColors = function() {
      emit('scan-buffer:colors-found', this.results);
      return this.results = [];
    };

    return BufferColorsScanner;

  })();

  module.exports = function(config) {
    return new BufferColorsScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItY29sb3JzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVHQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVDLGNBQWUsT0FBQSxDQUFRLHNCQUFSLEVBQWYsV0FGRCxDQUFBOztBQUFBLEVBR0MsMkJBQTRCLE9BQUEsQ0FBUSxVQUFSLEVBQTVCLHdCQUhELENBQUE7O0FBQUEsRUFJQSxlQUFBLEdBQWtCLEdBSmxCLENBQUE7O0FBQUEsRUFNTTtBQUNTLElBQUEsNkJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxxQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLGdCQUFBLE1BQUYsRUFBVSxtQkFBQSxTQUFWLEVBQXFCLHdCQUFBLGNBQXJCLEVBQXFDLG9CQUFBLFVBQXJDLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxZQUFBLENBQWE7QUFBQSxRQUFDLFdBQUEsU0FBRDtBQUFBLFFBQVksZ0JBQUEsY0FBWjtBQUFBLFFBQTRCLGFBQUEsRUFBZSxVQUEzQztPQUFiLENBRGYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQUUsU0FBRCxJQUFDLENBQUEsT0FBRjtPQUFiLENBRmYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUhYLENBRFc7SUFBQSxDQUFiOztBQUFBLGtDQU1BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLGlCQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO0FBQ0EsYUFBTSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixTQUF6QixDQUFmLEdBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQsQ0FBQSxDQUFBO0FBRUEsUUFBQSxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsSUFBbUIsZUFBckM7QUFBQSxVQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO1NBRkE7QUFBQSxRQUdDLFlBQWEsT0FBYixTQUhELENBREY7TUFBQSxDQURBO2FBT0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQVJJO0lBQUEsQ0FOTixDQUFBOztBQUFBLGtDQWdCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFBLENBQUssMEJBQUwsRUFBaUMsSUFBQyxDQUFBLE9BQWxDLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FGQTtJQUFBLENBaEJiLENBQUE7OytCQUFBOztNQVBGLENBQUE7O0FBQUEsRUEyQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFELEdBQUE7V0FDWCxJQUFBLG1CQUFBLENBQW9CLE1BQXBCLENBQTJCLENBQUMsSUFBNUIsQ0FBQSxFQURXO0VBQUEsQ0EzQmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/tasks/scan-buffer-colors-handler.coffee
