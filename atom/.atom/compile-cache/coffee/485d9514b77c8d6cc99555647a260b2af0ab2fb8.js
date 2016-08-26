(function() {
  var VariableParser;

  VariableParser = require('../lib/variable-parser');

  describe('VariableParser', function() {
    var itParses, parser;
    parser = [][0];
    itParses = function(expression) {
      return {
        description: '',
        as: function(variables) {
          it("parses the '" + expression + "' as variables " + (jasmine.pp(variables)), function() {
            var expected, name, range, results, value, _i, _len, _ref, _results;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], name = _ref.name, value = _ref.value, range = _ref.range;
              expected = variables[name];
              if (expected.value != null) {
                _results.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                _results.push(expect(range).toEqual(expected.range));
              } else {
                _results.push(expect(value).toEqual(expected));
              }
            }
            return _results;
          });
          return this;
        }
      };
    };
    beforeEach(function() {
      return parser = new VariableParser;
    });
    itParses('color = white').as({
      'color': 'white'
    });
    itParses('non-color = 10px').as({
      'non-color': '10px'
    });
    itParses('$color: white;').as({
      '$color': 'white'
    });
    itParses('$color: white').as({
      '$color': 'white'
    });
    itParses('$non-color: 10px;').as({
      '$non-color': '10px'
    });
    itParses('$non-color: 10px').as({
      '$non-color': '10px'
    });
    itParses('@color: white;').as({
      '@color': 'white'
    });
    itParses('@non-color: 10px;').as({
      '@non-color': '10px'
    });
    return itParses("colors = {\n  red: rgb(255,0,0),\n  green: rgb(0,255,0),\n  blue: rgb(0,0,255)\n  value: 10px\n  light: {\n    base: lightgrey\n  }\n  dark: {\n    base: slategrey\n  }\n}").as({
      'colors.red': {
        value: 'rgb(255,0,0)',
        range: [[1, 2], [1, 14]]
      },
      'colors.green': {
        value: 'rgb(0,255,0)',
        range: [[2, 2], [2, 16]]
      },
      'colors.blue': {
        value: 'rgb(0,0,255)',
        range: [[3, 2], [3, 15]]
      },
      'colors.value': {
        value: '10px',
        range: [[4, 2], [4, 13]]
      },
      'colors.light.base': {
        value: 'lightgrey',
        range: [[9, 4], [9, 17]]
      },
      'colors.dark.base': {
        value: 'slategrey',
        range: [[12, 4], [12, 14]]
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3ZhcmlhYmxlLXBhcnNlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxnQkFBQTtBQUFBLElBQUMsU0FBVSxLQUFYLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNUO0FBQUEsUUFBQSxXQUFBLEVBQWEsRUFBYjtBQUFBLFFBQ0EsRUFBQSxFQUFJLFNBQUMsU0FBRCxHQUFBO0FBQ0YsVUFBQSxFQUFBLENBQUksY0FBQSxHQUFjLFVBQWQsR0FBeUIsaUJBQXpCLEdBQXlDLENBQUMsT0FBTyxDQUFDLEVBQVIsQ0FBVyxTQUFYLENBQUQsQ0FBN0MsRUFBdUUsU0FBQSxHQUFBO0FBQ3JFLGdCQUFBLCtEQUFBO0FBQUEsWUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxVQUFiLENBQVYsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxNQUFmLENBQXNCLENBQUMsT0FBdkIsQ0FBK0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxTQUFaLENBQXNCLENBQUMsTUFBdEQsQ0FGQSxDQUFBO0FBR0E7aUJBQUEsOENBQUEsR0FBQTtBQUNFLGtDQURHLFlBQUEsTUFBTSxhQUFBLE9BQU8sYUFBQSxLQUNoQixDQUFBO0FBQUEsY0FBQSxRQUFBLEdBQVcsU0FBVSxDQUFBLElBQUEsQ0FBckIsQ0FBQTtBQUNBLGNBQUEsSUFBRyxzQkFBSDs4QkFDRSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFz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

//# sourceURL=/home/epse/.atom/packages/pigments/spec/variable-parser-spec.coffee
