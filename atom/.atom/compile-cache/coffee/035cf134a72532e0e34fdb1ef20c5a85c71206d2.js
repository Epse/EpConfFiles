(function() {
  var BufferVariablesScanner, ColorContext, VariableScanner, VariablesChunkSize;

  VariableScanner = require('../variable-scanner');

  ColorContext = require('../color-context');

  VariablesChunkSize = 100;

  BufferVariablesScanner = (function() {
    function BufferVariablesScanner(config) {
      this.buffer = config.buffer;
      this.scanner = new VariableScanner();
      this.results = [];
    }

    BufferVariablesScanner.prototype.scan = function() {
      var lastIndex, results;
      lastIndex = 0;
      while (results = this.scanner.search(this.buffer, lastIndex)) {
        this.results = this.results.concat(results);
        if (this.results.length >= VariablesChunkSize) {
          this.flushVariables();
        }
        lastIndex = results.lastIndex;
      }
      return this.flushVariables();
    };

    BufferVariablesScanner.prototype.flushVariables = function() {
      emit('scan-buffer:variables-found', this.results);
      return this.results = [];
    };

    return BufferVariablesScanner;

  })();

  module.exports = function(config) {
    return new BufferVariablesScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1idWZmZXItdmFyaWFibGVzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBR0Esa0JBQUEsR0FBcUIsR0FIckIsQ0FBQTs7QUFBQSxFQUtNO0FBQ1MsSUFBQSxnQ0FBQyxNQUFELEdBQUE7QUFDWCxNQUFDLElBQUMsQ0FBQSxTQUFVLE9BQVYsTUFBRixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsZUFBQSxDQUFBLENBRGYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUZYLENBRFc7SUFBQSxDQUFiOztBQUFBLHFDQUtBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLGtCQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO0FBQ0EsYUFBTSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixTQUF6QixDQUFoQixHQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixPQUFoQixDQUFYLENBQUE7QUFFQSxRQUFBLElBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixrQkFBeEM7QUFBQSxVQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO1NBRkE7QUFBQSxRQUdDLFlBQWEsUUFBYixTQUhELENBREY7TUFBQSxDQURBO2FBT0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQVJJO0lBQUEsQ0FMTixDQUFBOztBQUFBLHFDQWVBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFBLENBQUssNkJBQUwsRUFBb0MsSUFBQyxDQUFBLE9BQXJDLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FGRztJQUFBLENBZmhCLENBQUE7O2tDQUFBOztNQU5GLENBQUE7O0FBQUEsRUF5QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFELEdBQUE7V0FDWCxJQUFBLHNCQUFBLENBQXVCLE1BQXZCLENBQThCLENBQUMsSUFBL0IsQ0FBQSxFQURXO0VBQUEsQ0F6QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/tasks/scan-buffer-variables-handler.coffee
