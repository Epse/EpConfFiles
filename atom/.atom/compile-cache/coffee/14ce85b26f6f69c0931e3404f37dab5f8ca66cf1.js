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
    it('understands record syntax', function() {
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.type-signature.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
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
    it("understands comments in records", function() {
      var lines, string;
      string = "data Car = Car {\n    company :: String, -- comment\n    -- model :: String, -- commented field\n    year :: Int -- another comment\n  }";
      lines = grammar.tokenizeLines(string);
      return expect(lines).toEqual([
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.type-signature.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
          }, {
            "value": ", ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "--",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell", "punctuation.definition.comment.haskell"]
          }, {
            "value": " comment",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
          }, {
            "value": "",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
          }
        ], [
          {
            "value": "    ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "punctuation.whitespace.comment.leading.haskell"]
          }, {
            "value": "--",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell", "punctuation.definition.comment.haskell"]
          }, {
            "value": " model :: String, -- commented field",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
          }, {
            "value": "",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "--",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell", "punctuation.definition.comment.haskell"]
          }, {
            "value": " another comment",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
          }, {
            "value": "",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", "comment.line.double-dash.haskell"]
          }
        ], [
          {
            "value": "  ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "}",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "keyword.operator.record.end.haskell"]
          }
        ]
      ]);
    });
    return it("understands comments in start of records", function() {
      var lines, string;
      string = "data Car = Car {\n    -- company :: String\n    , model :: String\n  }";
      lines = grammar.tokenizeLines(string);
      return expect(lines).toEqual([
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.type-signature.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "punctuation.whitespace.comment.leading.haskell"]
          }, {
            "value": "--",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "comment.line.double-dash.haskell", "punctuation.definition.comment.haskell"]
          }, {
            "value": " company :: String",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "comment.line.double-dash.haskell"]
          }, {
            "value": "",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "comment.line.double-dash.haskell"]
          }
        ], [
          {
            "value": "    ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell"]
          }, {
            "value": ",",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "punctuation.separator.comma.haskell"]
          }, {
            "value": " ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell"]
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
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell", 'entity.name.type.haskell', "support.class.prelude.haskell"]
          }
        ], [
          {
            "value": "  ",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "meta.record-field.type-declaration.haskell", "meta.type-signature.haskell"]
          }, {
            "value": "}",
            "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.declaration.type.data.record.block.haskell", "keyword.operator.record.end.haskell"]
          }
        ]
      ]);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9oYXNrZWxsLXJlY29yZC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsUUFBQSxtQkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEseUNBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQWU7YUFBQSxnREFBQTs4QkFBQTtBQUFBLHdCQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUE7QUFBQTs7K0JBQWYsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLGFBQVMsV0FBVCxDQURULENBQUE7QUFFQTtXQUFTLGtGQUFULEdBQUE7QUFDRTs7QUFBQTtlQUFBLGdEQUFBO2dDQUFBO0FBQUEsMkJBQUEsR0FBSSxDQUFBLENBQUEsRUFBSixDQUFBO0FBQUE7O2tDQUFBLENBREY7QUFBQTtzQkFISTtJQUFBLENBRk4sQ0FBQTtBQUFBLElBUUEsS0FBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtBQUNOLFVBQUEsOEJBQUE7QUFBQTtBQUFBO1dBQUEsbURBQUE7b0JBQUE7O1VBQ0UsQ0FBRSxDQUFBLENBQUEsSUFBTTtTQUFSOztVQUNBLENBQUUsQ0FBQSxDQUFBLElBQU07U0FEUjtBQUFBLFFBRUEsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUwsR0FBYSxDQUZiLENBQUE7QUFBQSxRQUdBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFMLEdBQWEsQ0FIYixDQUFBO0FBQUEsc0JBSUEsTUFBQSxDQUFPLENBQUUsQ0FBQSxDQUFBLENBQVQsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsQ0FBRSxDQUFBLENBQUEsQ0FBdkIsRUFKQSxDQURGO0FBQUE7c0JBRE07SUFBQSxDQVJSLENBQUE7QUFBQSxJQWdCQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxnQkFBbEMsRUFEUDtNQUFBLENBQUwsRUFKUztJQUFBLENBQVgsQ0FoQkEsQ0FBQTtBQUFBLElBdUJBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsVUFBQSwrQ0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLHNHQUFULENBQUE7QUFBQSxNQU9BLEtBQUEsR0FBUSxPQUFPLENBQUMsYUFBUixDQUFzQixNQUF0QixDQVBSLENBQUE7QUFBQSxNQVNBLEdBQUEsR0FBTTtRQUNKO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsMkJBSFEsQ0FGWjtXQURGLEVBU0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7V0FURixFQWdCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEtBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUiw2QkFIUSxFQUlSLDBCQUpRLENBRlo7V0FoQkYsRUF5QkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsNkJBSFEsQ0FGWjtXQXpCRixFQWlDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixxQ0FIUSxDQUZaO1dBakNGLEVBeUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxDQUZaO1dBekNGLEVBZ0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsS0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLHlCQUhRLENBRlo7V0FoREYsRUF3REU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7V0F4REYsRUErREU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUix1Q0FKUSxDQUZaO1dBL0RGO1NBREksRUEwRUo7VUFDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLE1BRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxDQUZaO1dBREYsRUFTRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLFNBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IscUNBTFEsQ0FGWjtXQVRGLEVBbUJFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsQ0FGWjtXQW5CRixFQTRCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLElBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1Isb0NBTFEsQ0FGWjtXQTVCRixFQXNDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsQ0FGWjtXQXRDRixFQWdERTtBQUFBLFlBQ0UsT0FBQSxFQUFTLFFBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUiwwQkFOUSxFQU9SLCtCQVBRLENBRlo7V0FoREYsRUE0REU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0E1REY7U0ExRUksRUFpSko7VUFDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLE1BRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsQ0FGWjtXQURGLEVBV0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxPQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLHFDQUxRLENBRlo7V0FYRixFQXFCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLENBRlo7V0FyQkYsRUE4QkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxJQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLG9DQUxRLENBRlo7V0E5QkYsRUF3Q0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0F4Q0YsRUFrREU7QUFBQSxZQUNFLE9BQUEsRUFBUyxRQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLEVBTVIsMEJBTlEsRUFPUiwrQkFQUSxDQUZaO1dBbERGLEVBOERFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBOURGO1NBakpJLEVBME5KO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0FERixFQVdFO0FBQUEsWUFDRSxPQUFBLEVBQVMsTUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUixxQ0FMUSxDQUZaO1dBWEYsRUFxQkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxDQUZaO1dBckJGLEVBOEJFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUixvQ0FMUSxDQUZaO1dBOUJGLEVBd0NFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBeENGLEVBa0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsS0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxFQU1SLDBCQU5RLEVBT1IsK0JBUFEsQ0FGWjtXQWxERjtTQTFOSSxFQXlSSjtVQUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBREYsRUFXRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLHFDQUpRLENBRlo7V0FYRixFQW9CRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsQ0FGWjtXQXBCRixFQTJCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLFVBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUix1QkFIUSxFQUlSLHVCQUpRLENBRlo7V0EzQkYsRUFvQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxJQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsdUJBSFEsQ0FGWjtXQXBDRixFQTRDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLE1BRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUix1QkFIUSxFQUlSLHNDQUpRLENBRlo7V0E1Q0YsRUFxREU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsdUJBSFEsQ0FGWjtXQXJERjtTQXpSSTtPQVROLENBQUE7QUFpV0E7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQ0Usc0JBQUEsS0FBQSxDQUFNLENBQUUsQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFFLENBQUEsQ0FBQSxDQUFkLEVBQUEsQ0FERjtBQUFBO3NCQWxXOEI7SUFBQSxDQUFoQyxDQXZCQSxDQUFBO0FBQUEsSUE0WEEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxVQUFBLGFBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUywwSUFBVCxDQUFBO0FBQUEsTUFPQSxLQUFBLEdBQVEsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsTUFBdEIsQ0FQUixDQUFBO2FBU0EsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0I7UUFDZDtVQUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsTUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLDJCQUhRLENBRlo7V0FERixFQVNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxDQUZaO1dBVEYsRUFnQkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxLQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsNkJBSFEsRUFJUiwwQkFKUSxDQUZaO1dBaEJGLEVBeUJFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLDZCQUhRLENBRlo7V0F6QkYsRUFpQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IscUNBSFEsQ0FGWjtXQWpDRixFQXlDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsQ0FGWjtXQXpDRixFQWdERTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEtBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUix5QkFIUSxDQUZaO1dBaERGLEVBd0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxDQUZaO1dBeERGLEVBK0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsdUNBSlEsQ0FGWjtXQS9ERjtTQURjLEVBMEVkO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsQ0FGWjtXQURGLEVBU0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxTQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLHFDQUxRLENBRlo7V0FURixFQW1CRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLENBRlo7V0FuQkYsRUE0QkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxJQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLG9DQUxRLENBRlo7V0E1QkYsRUFzQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0F0Q0YsRUFnREU7QUFBQSxZQUNFLE9BQUEsRUFBUyxRQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLEVBTVIsMEJBTlEsRUFPUiwrQkFQUSxDQUZaO1dBaERGLEVBNERFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBNURGLEVBc0VFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxFQU1SLGtDQU5RLEVBT1Isd0NBUFEsQ0FGWjtXQXRFRixFQWtGRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLFVBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUixrQ0FOUSxDQUZaO1dBbEZGLEVBNkZFO0FBQUEsWUFDRSxPQUFBLEVBQVMsRUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxFQU1SLGtDQU5RLENBRlo7V0E3RkY7U0ExRWMsRUFtTGQ7VUFDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLE1BRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUixnREFOUSxDQUZaO1dBREYsRUFZRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLElBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUixrQ0FOUSxFQU9SLHdDQVBRLENBRlo7V0FaRixFQXdCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLHNDQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLEVBTVIsa0NBTlEsQ0FGWjtXQXhCRixFQW1DRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEVBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUixrQ0FOUSxDQUZaO1dBbkNGO1NBbkxjLEVBa09kO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0FERixFQVdFO0FBQUEsWUFDRSxPQUFBLEVBQVMsTUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUixxQ0FMUSxDQUZaO1dBWEYsRUFxQkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxDQUZaO1dBckJGLEVBOEJFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUixvQ0FMUSxDQUZaO1dBOUJGLEVBd0NFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBeENGLEVBa0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsS0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxFQU1SLDBCQU5RLEVBT1IsK0JBUFEsQ0FGWjtXQWxERixFQThERTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsQ0FGWjtXQTlERixFQXdFRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLElBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsRUFNUixrQ0FOUSxFQU9SLHdDQVBRLENBRlo7V0F4RUYsRUFvRkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxrQkFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxFQU1SLGtDQU5RLENBRlo7V0FwRkYsRUErRkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxFQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLEVBTVIsa0NBTlEsQ0FGWjtXQS9GRjtTQWxPYyxFQTZVZDtVQUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsSUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsNENBSlEsRUFLUiw2QkFMUSxDQUZaO1dBREYsRUFXRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLHFDQUpRLENBRlo7V0FYRjtTQTdVYztPQUF0QixFQVZvQztJQUFBLENBQXRDLENBNVhBLENBQUE7V0F5dUJBLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsVUFBQSxhQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsd0VBQVQsQ0FBQTtBQUFBLE1BTUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxhQUFSLENBQXNCLE1BQXRCLENBTlIsQ0FBQTthQVFBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCO1FBQ2xCO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsMkJBSFEsQ0FGWjtXQURGLEVBU0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7V0FURixFQWdCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEtBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUiw2QkFIUSxFQUlSLDBCQUpRLENBRlo7V0FoQkYsRUF5QkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsNkJBSFEsQ0FGWjtXQXpCRixFQWlDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixxQ0FIUSxDQUZaO1dBakNGLEVBeUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsR0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxDQUZaO1dBekNGLEVBZ0RFO0FBQUEsWUFDRSxPQUFBLEVBQVMsS0FEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLHlCQUhRLENBRlo7V0FoREYsRUF3REU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7V0F4REYsRUErREU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUix1Q0FKUSxDQUZaO1dBL0RGO1NBRGtCLEVBMEVsQjtVQUNFO0FBQUEsWUFDRSxPQUFBLEVBQVMsTUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsZ0RBSlEsQ0FGWjtXQURGLEVBVUU7QUFBQSxZQUNFLE9BQUEsRUFBUyxJQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUixrQ0FKUSxFQUtSLHdDQUxRLENBRlo7V0FWRixFQW9CRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLG9CQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUixrQ0FKUSxDQUZaO1dBcEJGLEVBNkJFO0FBQUEsWUFDRSxPQUFBLEVBQVMsRUFEWDtBQUFBLFlBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLGlEQUhRLEVBSVIsa0NBSlEsQ0FGWjtXQTdCRjtTQTFFa0IsRUFpSGxCO1VBQ0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxNQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsQ0FGWjtXQURGLEVBU0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUixxQ0FKUSxDQUZaO1dBVEYsRUFrQkU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsQ0FGWjtXQWxCRixFQTBCRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLE9BRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IscUNBTFEsQ0FGWjtXQTFCRixFQW9DRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLEdBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLENBRlo7V0FwQ0YsRUE2Q0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxJQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLG9DQUxRLENBRlo7V0E3Q0YsRUF1REU7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLENBRlo7V0F2REYsRUFpRUU7QUFBQSxZQUNFLE9BQUEsRUFBUyxRQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUiw0Q0FKUSxFQUtSLDZCQUxRLEVBTVIsMEJBTlEsRUFPUiwrQkFQUSxDQUZaO1dBakVGO1NBakhrQixFQStMbEI7VUFDRTtBQUFBLFlBQ0UsT0FBQSxFQUFTLElBRFg7QUFBQSxZQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixpREFIUSxFQUlSLDRDQUpRLEVBS1IsNkJBTFEsQ0FGWjtXQURGLEVBV0U7QUFBQSxZQUNFLE9BQUEsRUFBUyxHQURYO0FBQUEsWUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsaURBSFEsRUFJUixxQ0FKUSxDQUZaO1dBWEY7U0EvTGtCO09BQXRCLEVBVDZDO0lBQUEsQ0FBL0MsRUExdUJpQjtFQUFBLENBQW5CLENBQUEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/haskell-record-spec.coffee
