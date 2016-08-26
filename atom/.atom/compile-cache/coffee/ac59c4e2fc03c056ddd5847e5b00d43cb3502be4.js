(function() {
  var ColorParser, ColorScanner, countLines, getRegistry;

  countLines = require('./utils').countLines;

  getRegistry = require('./color-expressions').getRegistry;

  ColorParser = require('./color-parser');

  module.exports = ColorScanner = (function() {
    function ColorScanner(params) {
      if (params == null) {
        params = {};
      }
      this.parser = params.parser, this.context = params.context;
      if (this.parser == null) {
        this.parser = new ColorParser;
      }
    }

    ColorScanner.prototype.getRegExp = function() {
      var registry;
      registry = getRegistry(this.context);
      return this.regexp = new RegExp(registry.getRegExp(), 'g');
    };

    ColorScanner.prototype.search = function(text, start) {
      var color, index, lastIndex, match, matchText;
      if (start == null) {
        start = 0;
      }
      this.regexp = this.getRegExp();
      this.regexp.lastIndex = start;
      if (match = this.regexp.exec(text)) {
        matchText = match[0];
        lastIndex = this.regexp.lastIndex;
        color = this.parser.parse(matchText, this.context);
        if ((index = matchText.indexOf(color.colorExpression)) > 0) {
          lastIndex += -matchText.length + index + color.colorExpression.length;
          matchText = color.colorExpression;
        }
        return {
          color: color,
          match: matchText,
          lastIndex: lastIndex,
          range: [lastIndex - matchText.length, lastIndex],
          line: countLines(text.slice(0, +(lastIndex - matchText.length) + 1 || 9e9)) - 1
        };
      }
    };

    return ColorScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2Nhbm5lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxTQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0MsY0FBZSxPQUFBLENBQVEscUJBQVIsRUFBZixXQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFDLE1BQUQsR0FBQTs7UUFBQyxTQUFPO09BQ25CO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxpQkFBQSxPQUFYLENBQUE7O1FBQ0EsSUFBQyxDQUFBLFNBQVUsR0FBQSxDQUFBO09BRkE7SUFBQSxDQUFiOztBQUFBLDJCQUlBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLFFBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxXQUFBLENBQVksSUFBQyxDQUFBLE9BQWIsQ0FBWCxDQUFBO2FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE1BQUEsQ0FBTyxRQUFRLENBQUMsU0FBVCxDQUFBLENBQVAsRUFBNkIsR0FBN0IsRUFITDtJQUFBLENBSlgsQ0FBQTs7QUFBQSwyQkFTQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ04sVUFBQSx5Q0FBQTs7UUFEYSxRQUFNO09BQ25CO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsS0FEcEIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFYO0FBQ0UsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsWUFBYSxJQUFDLENBQUEsT0FBZCxTQURELENBQUE7QUFBQSxRQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFkLEVBQXlCLElBQUMsQ0FBQSxPQUExQixDQUhSLENBQUE7QUFLQSxRQUFBLElBQUcsQ0FBQyxLQUFBLEdBQVEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBSyxDQUFDLGVBQXhCLENBQVQsQ0FBQSxHQUFxRCxDQUF4RDtBQUNFLFVBQUEsU0FBQSxJQUFhLENBQUEsU0FBVSxDQUFDLE1BQVgsR0FBb0IsS0FBcEIsR0FBNEIsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUEvRCxDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVksS0FBSyxDQUFDLGVBRGxCLENBREY7U0FMQTtlQVNBO0FBQUEsVUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVyxTQUZYO0FBQUEsVUFHQSxLQUFBLEVBQU8sQ0FDTCxTQUFBLEdBQVksU0FBUyxDQUFDLE1BRGpCLEVBRUwsU0FGSyxDQUhQO0FBQUEsVUFPQSxJQUFBLEVBQU0sVUFBQSxDQUFXLElBQUsscURBQWhCLENBQUEsR0FBb0QsQ0FQMUQ7VUFWRjtPQUpNO0lBQUEsQ0FUUixDQUFBOzt3QkFBQTs7TUFORixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-scanner.coffee
