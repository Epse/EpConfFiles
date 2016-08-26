(function() {
  var VariableExpression;

  module.exports = VariableExpression = (function() {
    VariableExpression.DEFAULT_HANDLE = function(match, solver) {
      var end, name, start, value, _;
      _ = match[0], name = match[1], value = match[2];
      start = _.indexOf(name);
      end = _.indexOf(value) + value.length;
      solver.appendResult([name, value, start, end]);
      return solver.endParsing(end);
    };

    function VariableExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.handle = _arg.handle;
      this.regexp = new RegExp("" + this.regexpString, 'm');
      if (this.handle == null) {
        this.handle = this.constructor.DEFAULT_HANDLE;
      }
    }

    VariableExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    VariableExpression.prototype.parse = function(expression) {
      var lastIndex, match, matchText, parsingAborted, results, solver, startIndex;
      parsingAborted = false;
      results = [];
      match = this.regexp.exec(expression);
      if (match != null) {
        matchText = match[0];
        lastIndex = this.regexp.lastIndex;
        startIndex = lastIndex - matchText.length;
        solver = {
          endParsing: function(end) {
            var start;
            start = expression.indexOf(matchText);
            results.lastIndex = end;
            results.range = [start, end];
            return results.match = matchText.slice(start, end);
          },
          abortParsing: function() {
            return parsingAborted = true;
          },
          appendResult: function(_arg) {
            var end, name, range, reName, start, value;
            name = _arg[0], value = _arg[1], start = _arg[2], end = _arg[3];
            range = [start, end];
            reName = name.replace('$', '\\$');
            if (!RegExp("" + reName + "(?![-_])").test(value)) {
              return results.push({
                name: name,
                value: value,
                range: range
              });
            }
          }
        };
        this.handle(match, solver);
      }
      if (parsingAborted) {
        return void 0;
      } else {
        return results;
      }
    };

    return VariableExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxrQkFBQyxDQUFBLGNBQUQsR0FBaUIsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2YsVUFBQSwwQkFBQTtBQUFBLE1BQUMsWUFBRCxFQUFJLGVBQUosRUFBVSxnQkFBVixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLENBRFIsQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFBLEdBQW1CLEtBQUssQ0FBQyxNQUYvQixDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsS0FBZCxFQUFxQixHQUFyQixDQUFwQixDQUhBLENBQUE7YUFJQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixFQUxlO0lBQUEsQ0FBakIsQ0FBQTs7QUFPYSxJQUFBLDRCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsb0JBQUEsY0FBYyxJQUFDLENBQUEsY0FBQSxNQUNwQyxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsTUFBQSxDQUFPLEVBQUEsR0FBRyxJQUFDLENBQUEsWUFBWCxFQUEyQixHQUEzQixDQUFkLENBQUE7O1FBQ0EsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQztPQUZiO0lBQUEsQ0FQYjs7QUFBQSxpQ0FXQSxLQUFBLEdBQU8sU0FBQyxVQUFELEdBQUE7YUFBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsVUFBYixFQUFoQjtJQUFBLENBWFAsQ0FBQTs7QUFBQSxpQ0FhQSxLQUFBLEdBQU8sU0FBQyxVQUFELEdBQUE7QUFDTCxVQUFBLHdFQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLEtBQWpCLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxFQURWLENBQUE7QUFBQSxNQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxVQUFiLENBSFIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxhQUFIO0FBRUUsUUFBQyxZQUFhLFFBQWQsQ0FBQTtBQUFBLFFBQ0MsWUFBYSxJQUFDLENBQUEsT0FBZCxTQURELENBQUE7QUFBQSxRQUVBLFVBQUEsR0FBYSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BRm5DLENBQUE7QUFBQSxRQUlBLE1BQUEsR0FDRTtBQUFBLFVBQUEsVUFBQSxFQUFZLFNBQUMsR0FBRCxHQUFBO0FBQ1YsZ0JBQUEsS0FBQTtBQUFBLFlBQUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFNBQW5CLENBQVIsQ0FBQTtBQUFBLFlBQ0EsT0FBTyxDQUFDLFNBQVIsR0FBb0IsR0FEcEIsQ0FBQTtBQUFBLFlBRUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsQ0FBQyxLQUFELEVBQU8sR0FBUCxDQUZoQixDQUFBO21CQUdBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQVUsbUJBSmhCO1VBQUEsQ0FBWjtBQUFBLFVBS0EsWUFBQSxFQUFjLFNBQUEsR0FBQTttQkFDWixjQUFBLEdBQWlCLEtBREw7VUFBQSxDQUxkO0FBQUEsVUFPQSxZQUFBLEVBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixnQkFBQSxzQ0FBQTtBQUFBLFlBRGMsZ0JBQU0saUJBQU8saUJBQU8sYUFDbEMsQ0FBQTtBQUFBLFlBQUEsS0FBQSxHQUFRLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBUixDQUFBO0FBQUEsWUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLEtBQWxCLENBRFQsQ0FBQTtBQUVBLFlBQUEsSUFBQSxDQUFBLE1BQU8sQ0FBQSxFQUFBLEdBQUssTUFBTCxHQUFZLFVBQVosQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixLQUE3QixDQUFQO3FCQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWE7QUFBQSxnQkFBQyxNQUFBLElBQUQ7QUFBQSxnQkFBTyxPQUFBLEtBQVA7QUFBQSxnQkFBYyxPQUFBLEtBQWQ7ZUFBYixFQURGO2FBSFk7VUFBQSxDQVBkO1NBTEYsQ0FBQTtBQUFBLFFBa0JBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixFQUFlLE1BQWYsQ0FsQkEsQ0FGRjtPQUpBO0FBMEJBLE1BQUEsSUFBRyxjQUFIO2VBQXVCLE9BQXZCO09BQUEsTUFBQTtlQUFzQyxRQUF0QztPQTNCSztJQUFBLENBYlAsQ0FBQTs7OEJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/pigments/lib/variable-expression.coffee
