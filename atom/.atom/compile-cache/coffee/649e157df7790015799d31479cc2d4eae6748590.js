(function() {
  var VariableParser, registry;

  VariableParser = require('../lib/variable-parser');

  registry = require('../lib/variable-expressions');

  describe('VariableParser', function() {
    var itParses, parser;
    parser = [][0];
    itParses = function(expression) {
      return {
        as: function(variables) {
          it("parses '" + expression + "' as variables " + (jasmine.pp(variables)), function() {
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
        },
        asDefault: function(variables) {
          it("parses '" + expression + "' as default variables " + (jasmine.pp(variables)), function() {
            var expected, isDefault, name, range, results, value, _i, _len, _ref, _results;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], name = _ref.name, value = _ref.value, range = _ref.range, isDefault = _ref["default"];
              expected = variables[name];
              expect(isDefault).toBeTruthy();
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
        },
        asUndefined: function() {
          return it("does not parse '" + expression + "' as a variable expression", function() {
            var results;
            results = parser.parse(expression);
            return expect(results).toBeUndefined();
          });
        }
      };
    };
    beforeEach(function() {
      return parser = new VariableParser(registry);
    });
    itParses('color = white').as({
      'color': 'white'
    });
    itParses('non-color = 10px').as({
      'non-color': '10px'
    });
    itParses('$color: white').as({
      '$color': 'white'
    });
    itParses('$color: white !default').asDefault({
      '$color': 'white'
    });
    itParses('$color: white // foo').as({
      '$color': 'white'
    });
    itParses('$color  : white').as({
      '$color': 'white'
    });
    itParses('$some-color: white;').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$some_color  : white').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$non-color: 10px;').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('$non_color: 10px').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('@color: white;').as({
      '@color': 'white'
    });
    itParses('@non-color: 10px;').as({
      '@non-color': '10px'
    });
    itParses('@non--color: 10px;').as({
      '@non--color': '10px'
    });
    itParses('--color: white;').as({
      'var(--color)': 'white'
    });
    itParses('--non-color: 10px;').as({
      'var(--non-color)': '10px'
    });
    itParses('\\definecolor{orange}{gray}{1}').as({
      '{orange}': 'gray(100%)'
    });
    itParses('\\definecolor{orange}{RGB}{255,127,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{rgb}{1,0.5,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{cmyk}{0,0.5,1,0}').as({
      '{orange}': 'cmyk(0,0.5,1,0)'
    });
    itParses('\\definecolor{orange}{HTML}{FF7F00}').as({
      '{orange}': '#FF7F00'
    });
    itParses('\\definecolor{darkgreen}{blue!20!black!30!green}').as({
      '{darkgreen}': '{blue!20!black!30!green}'
    });
    itParses('\n.error--large(@color: red) {\n  background-color: @color;\n}').asUndefined();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvdmFyaWFibGUtcGFyc2VyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLGdCQUFBO0FBQUEsSUFBQyxTQUFVLEtBQVgsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLFNBQUMsVUFBRCxHQUFBO2FBQ1Q7QUFBQSxRQUFBLEVBQUEsRUFBSSxTQUFDLFNBQUQsR0FBQTtBQUNGLFVBQUEsRUFBQSxDQUFJLFVBQUEsR0FBVSxVQUFWLEdBQXFCLGlCQUFyQixHQUFxQyxDQUFDLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxDQUFELENBQXpDLEVBQW1FLFNBQUEsR0FBQTtBQUNqRSxnQkFBQSwrREFBQTtBQUFBLFlBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsVUFBYixDQUFWLENBQUE7QUFBQSxZQUVBLE1BQUEsQ0FBTyxPQUFPLENBQUMsTUFBZixDQUFzQixDQUFDLE9BQXZCLENBQStCLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFzQixDQUFDLE1BQXRELENBRkEsQ0FBQTtBQUdBO2lCQUFBLDhDQUFBLEdBQUE7QUFDRSxrQ0FERyxZQUFBLE1BQU0sYUFBQSxPQUFPLGFBQUEsS0FDaEIsQ0FBQTtBQUFBLGNBQUEsUUFBQSxHQUFXLFNBQVUsQ0FBQSxJQUFBLENBQXJCLENBQUE7QUFDQSxjQUFBLElBQUcsc0JBQUg7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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/spec/variable-parser-spec.coffee
