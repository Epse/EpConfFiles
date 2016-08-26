(function() {
  describe('GADT', function() {
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
    return it('understands GADT syntax', function() {
      var exp, l, lines, string, _i, _len, _ref, _results;
      string = "data Term a where\n  Lit :: Int -> Term Int";
      lines = grammar.tokenizeLines(string);
      exp = [
        [
          {
            value: 'data',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'storage.type.data.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'a',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.type-signature.haskell', 'variable.other.generic-type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell']
          }, {
            value: 'where',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'keyword.other.haskell']
          }
        ], [
          {
            value: '  ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: 'Lit',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: '->',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'keyword.other.arrow.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.GADT.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvaGFza2VsbC1nYWR0LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxNQUFULEVBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsbUJBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLHlDQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFlO2FBQUEsZ0RBQUE7OEJBQUE7QUFBQSx3QkFBQSxHQUFHLENBQUMsT0FBSixDQUFBO0FBQUE7OytCQUFmLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxhQUFTLFdBQVQsQ0FEVCxDQUFBO0FBRUE7V0FBUyxrRkFBVCxHQUFBO0FBQ0U7O0FBQUE7ZUFBQSxnREFBQTtnQ0FBQTtBQUFBLDJCQUFBLEdBQUksQ0FBQSxDQUFBLEVBQUosQ0FBQTtBQUFBOztrQ0FBQSxDQURGO0FBQUE7c0JBSEk7SUFBQSxDQUZOLENBQUE7QUFBQSxJQVFBLEtBQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQLEdBQUE7QUFDTixVQUFBLDhCQUFBO0FBQUE7QUFBQTtXQUFBLG1EQUFBO29CQUFBOztVQUNFLENBQUUsQ0FBQSxDQUFBLElBQU07U0FBUjs7VUFDQSxDQUFFLENBQUEsQ0FBQSxJQUFNO1NBRFI7QUFBQSxRQUVBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFMLEdBQVcsQ0FGWCxDQUFBO0FBQUEsUUFHQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTCxHQUFXLENBSFgsQ0FBQTtBQUFBLHNCQUlBLE1BQUEsQ0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFULENBQVksQ0FBQyxP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

//# sourceURL=/home/epse/.atom/packages/language-haskell/spec/haskell-gadt-spec.coffee
