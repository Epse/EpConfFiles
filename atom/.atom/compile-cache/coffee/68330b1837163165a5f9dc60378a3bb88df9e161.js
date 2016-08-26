(function() {
  var PathScanner, VariableScanner, async, fs;

  async = require('async');

  fs = require('fs');

  VariableScanner = require('../variable-scanner');

  PathScanner = (function() {
    function PathScanner(path) {
      this.path = path;
      this.scanner = new VariableScanner;
    }

    PathScanner.prototype.load = function(done) {
      var currentChunk, currentLine, currentOffset, lastIndex, line, readStream, results;
      currentChunk = '';
      currentLine = 0;
      currentOffset = 0;
      lastIndex = 0;
      line = 0;
      results = [];
      readStream = fs.createReadStream(this.path);
      readStream.on('data', (function(_this) {
        return function(chunk) {
          var index, lastLine, result, v, _i, _len;
          currentChunk += chunk.toString();
          index = lastIndex;
          while (result = _this.scanner.search(currentChunk, lastIndex)) {
            result.range[0] += index;
            result.range[1] += index;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.path = _this.path;
              v.range[0] += index;
              v.range[1] += index;
              v.definitionRange = result.range;
              v.line += line;
              lastLine = v.line;
            }
            results = results.concat(result);
            lastIndex = result.lastIndex;
          }
          if (result != null) {
            currentChunk = currentChunk.slice(lastIndex);
            line = lastLine;
            return lastIndex = 0;
          }
        };
      })(this));
      return readStream.on('end', function() {
        emit('scan-paths:path-scanned', results);
        return done();
      });
    };

    return PathScanner;

  })();

  module.exports = function(paths) {
    return async.each(paths, function(path, next) {
      return new PathScanner(path).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdGFza3Mvc2Nhbi1wYXRocy1oYW5kbGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1Q0FBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxFQUlNO0FBQ1MsSUFBQSxxQkFBRSxJQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxPQUFBLElBQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsZUFBWCxDQURXO0lBQUEsQ0FBYjs7QUFBQSwwQkFHQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixVQUFBLDhFQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsRUFBZixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsQ0FEZCxDQUFBO0FBQUEsTUFFQSxhQUFBLEdBQWdCLENBRmhCLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxDQUhaLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxDQUpQLENBQUE7QUFBQSxNQUtBLE9BQUEsR0FBVSxFQUxWLENBQUE7QUFBQSxNQU9BLFVBQUEsR0FBYSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBQyxDQUFBLElBQXJCLENBUGIsQ0FBQTtBQUFBLE1BU0EsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtBQUNwQixjQUFBLG9DQUFBO0FBQUEsVUFBQSxZQUFBLElBQWdCLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLFVBRUEsS0FBQSxHQUFRLFNBRlIsQ0FBQTtBQUlBLGlCQUFNLE1BQUEsR0FBUyxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsWUFBaEIsRUFBOEIsU0FBOUIsQ0FBZixHQUFBO0FBQ0UsWUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQixLQUFuQixDQUFBO0FBQUEsWUFDQSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQixLQURuQixDQUFBO0FBR0EsaUJBQUEsNkNBQUE7NkJBQUE7QUFDRSxjQUFBLENBQUMsQ0FBQyxJQUFGLEdBQVMsS0FBQyxDQUFBLElBQVYsQ0FBQTtBQUFBLGNBQ0EsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYyxLQURkLENBQUE7QUFBQSxjQUVBLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWMsS0FGZCxDQUFBO0FBQUEsY0FHQSxDQUFDLENBQUMsZUFBRixHQUFvQixNQUFNLENBQUMsS0FIM0IsQ0FBQTtBQUFBLGNBSUEsQ0FBQyxDQUFDLElBQUYsSUFBVSxJQUpWLENBQUE7QUFBQSxjQUtBLFFBQUEsR0FBVyxDQUFDLENBQUMsSUFMYixDQURGO0FBQUEsYUFIQTtBQUFBLFlBV0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBZixDQVhWLENBQUE7QUFBQSxZQVlDLFlBQWEsT0FBYixTQVpELENBREY7VUFBQSxDQUpBO0FBbUJBLFVBQUEsSUFBRyxjQUFIO0FBQ0UsWUFBQSxZQUFBLEdBQWUsWUFBYSxpQkFBNUIsQ0FBQTtBQUFBLFlBQ0EsSUFBQSxHQUFPLFFBRFAsQ0FBQTttQkFFQSxTQUFBLEdBQVksRUFIZDtXQXBCb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixDQVRBLENBQUE7YUFrQ0EsVUFBVSxDQUFDLEVBQVgsQ0FBYyxLQUFkLEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLElBQUEsQ0FBSyx5QkFBTCxFQUFnQyxPQUFoQyxDQUFBLENBQUE7ZUFDQSxJQUFBLENBQUEsRUFGbUI7TUFBQSxDQUFyQixFQW5DSTtJQUFBLENBSE4sQ0FBQTs7dUJBQUE7O01BTEYsQ0FBQTs7QUFBQSxFQStDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEtBQUQsR0FBQTtXQUNmLEtBQUssQ0FBQyxJQUFOLENBQ0UsS0FERixFQUVFLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTthQUNNLElBQUEsV0FBQSxDQUFZLElBQVosQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixFQUROO0lBQUEsQ0FGRixFQUlFLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FKRixFQURlO0VBQUEsQ0EvQ2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/tasks/scan-paths-handler.coffee
