(function() {
  var VariableParser, VariableScanner, countLines, _ref;

  _ref = [], VariableParser = _ref[0], countLines = _ref[1];

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      if (VariableParser == null) {
        VariableParser = require('./variable-parser');
      }
      this.parser = params.parser, this.registry = params.registry, this.scope = params.scope;
      if (this.parser == null) {
        this.parser = new VariableParser(this.registry);
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExpForScope(this.scope), 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var index, lastIndex, line, lineCountIndex, match, matchText, regexp, result, v, _i, _len;
      if (start == null) {
        start = 0;
      }
      if (this.registry.getExpressionsForScope(this.scope).length === 0) {
        return;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1zY2FubmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpREFBQTs7QUFBQSxFQUFBLE9BQStCLEVBQS9CLEVBQUMsd0JBQUQsRUFBaUIsb0JBQWpCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx5QkFBQyxNQUFELEdBQUE7O1FBQUMsU0FBTztPQUNuQjs7UUFBQSxpQkFBa0IsT0FBQSxDQUFRLG1CQUFSO09BQWxCO0FBQUEsTUFFQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxrQkFBQSxRQUFYLEVBQXFCLElBQUMsQ0FBQSxlQUFBLEtBRnRCLENBQUE7O1FBR0EsSUFBQyxDQUFBLFNBQWMsSUFBQSxjQUFBLENBQWUsSUFBQyxDQUFBLFFBQWhCO09BSko7SUFBQSxDQUFiOztBQUFBLDhCQU1BLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFDTCxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLElBQUMsQ0FBQSxLQUE3QixDQUFQLEVBQTRDLElBQTVDLEVBREs7SUFBQSxDQU5YLENBQUE7O0FBQUEsOEJBU0EsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNOLFVBQUEscUZBQUE7O1FBRGEsUUFBTTtPQUNuQjtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsUUFBUSxDQUFDLHNCQUFWLENBQWlDLElBQUMsQ0FBQSxLQUFsQyxDQUF3QyxDQUFDLE1BQXpDLEtBQW1ELENBQTdEO0FBQUEsY0FBQSxDQUFBO09BQUE7O1FBRUEsYUFBYyxPQUFBLENBQVEsU0FBUixDQUFrQixDQUFDO09BRmpDO0FBQUEsTUFJQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUpULENBQUE7QUFBQSxNQUtBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLEtBTG5CLENBQUE7QUFPQSxhQUFNLEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBZCxHQUFBO0FBQ0UsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsUUFBUyxNQUFULEtBREQsQ0FBQTtBQUFBLFFBRUMsWUFBYSxPQUFiLFNBRkQsQ0FBQTtBQUFBLFFBSUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFNBQWQsQ0FKVCxDQUFBO0FBTUEsUUFBQSxJQUFHLGNBQUg7QUFDRSxVQUFBLE1BQU0sQ0FBQyxTQUFQLElBQW9CLEtBQXBCLENBQUE7QUFFQSxVQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7QUFDRSxZQUFBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBQW5CLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLElBQW1CLEtBRG5CLENBQUE7QUFBQSxZQUdBLElBQUEsR0FBTyxDQUFBLENBSFAsQ0FBQTtBQUFBLFlBSUEsY0FBQSxHQUFpQixDQUpqQixDQUFBO0FBTUEsaUJBQUEsNkNBQUE7NkJBQUE7QUFDRSxjQUFBLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWMsS0FBZCxDQUFBO0FBQUEsY0FDQSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjLEtBRGQsQ0FBQTtBQUFBLGNBRUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBQSxHQUFPLFVBQUEsQ0FBVyxJQUFLLDhDQUFoQixDQUZ2QixDQUFBO0FBQUEsY0FHQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUh6QixDQURGO0FBQUEsYUFOQTtBQVlBLG1CQUFPLE1BQVAsQ0FiRjtXQUFBLE1BQUE7QUFlRSxZQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQyxTQUExQixDQWZGO1dBSEY7U0FQRjtNQUFBLENBUEE7QUFrQ0EsYUFBTyxNQUFQLENBbkNNO0lBQUEsQ0FUUixDQUFBOzsyQkFBQTs7TUFKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/variable-scanner.coffee
