(function() {
  describe('Record', function() {
    var check, grammar, zip;
    grammar = null;
    zip = function() {
      var arr, i, length, lengthArray, _i, _results;
      lengthArray = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arr = arguments[_i];
          _results.push(arr.length);
        }
        return _results;
      }).apply(this, arguments);
      length = Math.max.apply(Math, lengthArray);
      _results = [];
      for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
        _results.push((function() {
          var _j, _len, _results1;
          _results1 = [];
          for (_j = 0, _len = arguments.length; _j < _len; _j++) {
            arr = arguments[_j];
            _results1.push(arr[i]);
          }
          return _results1;
        }).apply(this, arguments));
      }
      return _results;
    };
    check = function(line, exp) {
      var i, t, _i, _len, _ref, _results;
      _ref = zip(line, exp);
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        t = _ref[i];
        if (t[0] == null) {
          t[0] = {};
        }
        if (t[1] == null) {
          t[1] = {};
        }
        t[0].index = i;
        t[1].index = i;
        _results.push(expect(t[0]).toEqual(t[1]));
      }
      return _results;
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.haskell");
      });
    });
    return it('understands record syntax', function() {
      var exp, l, lines, string, _i, _len, _ref, _results;
      string = "data Car = Car {\n    company :: String,\n    model :: String,\n    year :: Int\n  } deriving (Show)";
      lines = grammar.tokenizeLines(string);
      exp = [
        [
          {
            "value": "data",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "storage.type.data.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
          }, {
            "value": "Car",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.type-signature.haskell", "entity.name.type.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
          }, {
            "value": "=",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "keyword.operator.assignment.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
          }, {
            "value": "Car",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "entity.name.tag.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
          }, {
            "value": "{",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "keyword.operator.record.begin.haskell"]
          }
        ], [
          {
            "value": "    ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell"]
          }, {
            "value": "company",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "entity.other.attribute-name.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell"]
          }, {
            "value": "::",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "keyword.other.double-colon.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "String",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "support.class.prelude.haskell"]
          }, {
            "value": ",",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }
        ], [
          {
            "value": "    ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "model",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "entity.other.attribute-name.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell"]
          }, {
            "value": "::",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "keyword.other.double-colon.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "String",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "support.class.prelude.haskell"]
          }, {
            "value": ",",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }
        ], [
          {
            "value": "    ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "year",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "entity.other.attribute-name.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell"]
          }, {
            "value": "::",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "keyword.other.double-colon.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "Int",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "support.class.prelude.haskell"]
          }
        ], [
          {
            "value": "  ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "}",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "keyword.operator.record.end.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
          }, {
            "value": "deriving",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.deriving.haskell", "keyword.other.haskell"]
          }, {
            "value": " (",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.deriving.haskell"]
          }, {
            "value": "Show",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.deriving.haskell", "entity.other.inherited-class.haskell"]
          }, {
            "value": ")",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.deriving.haskell"]
          }
        ]
      ];
      _ref = zip(lines, exp);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        _results.push(check(l[0], l[1]));
      }
      return _results;
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvaGFza2VsbC1yZWNvcmQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsbUJBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLHlDQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFlO2FBQUEsZ0RBQUE7OEJBQUE7QUFBQSx3QkFBQSxHQUFHLENBQUMsT0FBSixDQUFBO0FBQUE7OytCQUFmLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxhQUFTLFdBQVQsQ0FEVCxDQUFBO0FBRUE7V0FBUyxrRkFBVCxHQUFBO0FBQ0U7O0FBQUE7ZUFBQSxnREFBQTtnQ0FBQTtBQUFBLDJCQUFBLEdBQUksQ0FBQSxDQUFBLEVBQUosQ0FBQTtBQUFBOztrQ0FBQSxDQURGO0FBQUE7c0JBSEk7SUFBQSxDQUZOLENBQUE7QUFBQSxJQVFBLEtBQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQLEdBQUE7QUFDTixVQUFBLDhCQUFBO0FBQUE7QUFBQTtXQUFBLG1EQUFBO29CQUFBOztVQUNFLENBQUUsQ0FBQSxDQUFBLElBQU07U0FBUjs7VUFDQSxDQUFFLENBQUEsQ0FBQSxJQUFNO1NBRFI7QUFBQSxRQUVBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFMLEdBQVcsQ0FGWCxDQUFBO0FBQUEsUUFHQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTCxHQUFXLENBSFgsQ0FBQTtBQUFBLHNCQUlBLE1BQUEsQ0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFULENBQVksQ0FB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

//# sourceURL=/home/epse/.atom/packages/language-haskell/spec/haskell-record-spec.coffee
