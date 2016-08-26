(function() {
  var VariableParser, VariableScanner, countLines, regexp, regexpString, registry, _ref;

  countLines = require('./utils').countLines;

  VariableParser = require('./variable-parser');

  _ref = [], registry = _ref[0], regexpString = _ref[1], regexp = _ref[2];

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      this.parser = params.parser;
      if (this.parser == null) {
        this.parser = new VariableParser;
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      if (registry == null) {
        registry = require('./variable-expressions');
      }
      if (regexpString == null) {
        regexpString = registry.getRegExp();
      }
      return regexp != null ? regexp : regexp = new RegExp(regexpString, 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var index, lastIndex, line, lineCountIndex, match, matchText, result, v, _i, _len;
      if (start == null) {
        start = 0;
      }
      regexp = this.getRegExp();
      regexp.lastIndex = start;
      while (match = regexp.exec(text)) {
        matchText = match[0];
        index = match.index;
        lastIndex = regexp.lastIndex;
        result = this.parser.parse(matchText);
        if (result != null) {
          result.lastIndex += index;
          if (result.length > 0) {
            result.range[0] += index;
            result.range[1] += index;
            line = -1;
            lineCountIndex = 0;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.range[0] += index;
              v.range[1] += index;
              line = v.line = line + countLines(text.slice(lineCountIndex, +v.range[0] + 1 || 9e9));
              lineCountIndex = v.range[0];
            }
            return result;
          } else {
            regexp.lastIndex = result.lastIndex;
          }
        }
      }
      return void 0;
    };

    return VariableScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxTQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUVBLE9BQW1DLEVBQW5DLEVBQUMsa0JBQUQsRUFBVyxzQkFBWCxFQUF5QixnQkFGekIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHlCQUFDLE1BQUQsR0FBQTs7UUFBQyxTQUFPO09BQ25CO0FBQUEsTUFBQyxJQUFDLENBQUEsU0FBVSxPQUFWLE1BQUYsQ0FBQTs7UUFDQSxJQUFDLENBQUEsU0FBVSxHQUFBLENBQUE7T0FGQTtJQUFBLENBQWI7O0FBQUEsOEJBSUEsU0FBQSxHQUFXLFNBQUEsR0FBQTs7UUFDVCxXQUFZLE9BQUEsQ0FBUSx3QkFBUjtPQUFaOztRQUNBLGVBQWdCLFFBQVEsQ0FBQyxTQUFULENBQUE7T0FEaEI7OEJBR0EsU0FBQSxTQUFjLElBQUEsTUFBQSxDQUFPLFlBQVAsRUFBcUIsSUFBckIsRUFKTDtJQUFBLENBSlgsQ0FBQTs7QUFBQSw4QkFVQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ04sVUFBQSw2RUFBQTs7UUFEYSxRQUFNO09BQ25CO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLEtBRG5CLENBQUE7QUFHQSxhQUFNLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBZCxHQUFBO0FBQ0UsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsUUFBUyxNQUFULEtBREQsQ0FBQTtBQUFBLFFBRUMsWUFBYSxPQUFiLFNBRkQsQ0FBQTtBQUFBLFFBSUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFNBQWQsQ0FKVCxDQUFBO0FBTUEsUUFBQSxJQUFHLGNBQUg7QUFDRSxVQUFBLE1BQU0sQ0FBQyxTQUFQLElBQW9CLEtBQXBCLENBQUE7QUFFQSxVQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7QUFDRSxZQUFBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBQW5CLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBRG5CLENBQUE7QUFBQSxZQUdBLElBQUEsR0FBTyxDQUFBLENBSFAsQ0FBQTtBQUFBLFlBSUEsY0FBQSxHQUFpQixDQUpqQixDQUFBO0FBTUEsaUJBQUEsNkNBQUE7NkJBQUE7QUFDRSxjQUFBLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWMsS0FBZCxDQUFBO0FBQUEsY0FDQSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjLEtBRGQsQ0FBQTtBQUFBLGNBRUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBQSxHQUFPLFVBQUEsQ0FBVyxJQUFLLDhDQUFoQixDQUZ2QixDQUFBO0FBQUEsY0FHQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUh6QixDQURGO0FBQUEsYUFOQTtBQVlBLG1CQUFPLE1BQVAsQ0FiRjtXQUFBLE1BQUE7QUFlRSxZQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQyxTQUExQixDQWZGO1dBSEY7U0FQRjtNQUFBLENBSEE7QUE4QkEsYUFBTyxNQUFQLENBL0JNO0lBQUEsQ0FWUixDQUFBOzsyQkFBQTs7TUFORixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/pigments/lib/variable-scanner.coffee
