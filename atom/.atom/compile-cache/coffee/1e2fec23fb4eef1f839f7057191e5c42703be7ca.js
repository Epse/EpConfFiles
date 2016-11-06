(function() {
  var ColorScanner, countLines;

  countLines = null;

  module.exports = ColorScanner = (function() {
    function ColorScanner(_arg) {
      this.context = (_arg != null ? _arg : {}).context;
      this.parser = this.context.parser;
      this.registry = this.context.registry;
    }

    ColorScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExp(), 'g');
    };

    ColorScanner.prototype.getRegExpForScope = function(scope) {
      return new RegExp(this.registry.getRegExpForScope(scope), 'g');
    };

    ColorScanner.prototype.search = function(text, scope, start) {
      var color, index, lastIndex, match, matchText, regexp;
      if (start == null) {
        start = 0;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExpForScope(scope);
      regexp.lastIndex = start;
      if (match = regexp.exec(text)) {
        matchText = match[0];
        lastIndex = regexp.lastIndex;
        color = this.parser.parse(matchText, scope);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1zY2FubmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxJQUFiLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxzQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSwwQkFBRixPQUFXLElBQVQsT0FDZCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBbkIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBRHJCLENBRFc7SUFBQSxDQUFiOztBQUFBLDJCQUlBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFDTCxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBQSxDQUFQLEVBQThCLEdBQTlCLEVBREs7SUFBQSxDQUpYLENBQUE7O0FBQUEsMkJBT0EsaUJBQUEsR0FBbUIsU0FBQyxLQUFELEdBQUE7YUFDYixJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLEtBQTVCLENBQVAsRUFBMkMsR0FBM0MsRUFEYTtJQUFBLENBUG5CLENBQUE7O0FBQUEsMkJBVUEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxLQUFkLEdBQUE7QUFDTixVQUFBLGlEQUFBOztRQURvQixRQUFNO09BQzFCO0FBQUEsTUFBQSxJQUF3QyxrQkFBeEM7QUFBQSxRQUFDLGFBQWMsT0FBQSxDQUFRLFNBQVIsRUFBZCxVQUFELENBQUE7T0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUZULENBQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLEtBSG5CLENBQUE7QUFLQSxNQUFBLElBQUcsS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFYO0FBQ0UsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsWUFBYSxPQUFiLFNBREQsQ0FBQTtBQUFBLFFBR0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFNBQWQsRUFBeUIsS0FBekIsQ0FIUixDQUFBO0FBT0EsUUFBQSxJQUFHLENBQUMsS0FBQSxHQUFRLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQUssQ0FBQyxlQUF4QixDQUFULENBQUEsR0FBcUQsQ0FBeEQ7QUFDRSxVQUFBLFNBQUEsSUFBYSxDQUFBLFNBQVUsQ0FBQyxNQUFYLEdBQW9CLEtBQXBCLEdBQTRCLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBL0QsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxHQUFZLEtBQUssQ0FBQyxlQURsQixDQURGO1NBUEE7ZUFXQTtBQUFBLFVBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxVQUNBLEtBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVcsU0FGWDtBQUFBLFVBR0EsS0FBQSxFQUFPLENBQ0wsU0FBQSxHQUFZLFNBQVMsQ0FBQyxNQURqQixFQUVMLFNBRkssQ0FIUDtBQUFBLFVBT0EsSUFBQSxFQUFNLFVBQUEsQ0FBVyxJQUFLLHFEQUFoQixDQUFBLEdBQW9ELENBUDFEO1VBWkY7T0FOTTtJQUFBLENBVlIsQ0FBQTs7d0JBQUE7O01BSkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-scanner.coffee
