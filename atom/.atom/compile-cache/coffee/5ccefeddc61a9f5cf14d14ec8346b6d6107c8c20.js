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
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'storage.type.data.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'a',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'variable.other.generic-type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'where',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.other.haskell']
          }
        ], [
          {
            value: '  ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: 'Lit',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'entity.name.tag.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: '->',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'keyword.other.arrow.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9oYXNrZWxsLWdhZHQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSxtQkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEseUNBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQWU7YUFBQSxnREFBQTs4QkFBQTtBQUFBLHdCQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUE7QUFBQTs7K0JBQWYsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLGFBQVMsV0FBVCxDQURULENBQUE7QUFFQTtXQUFTLGtGQUFULEdBQUE7QUFDRTs7QUFBQTtlQUFBLGdEQUFBO2dDQUFBO0FBQUEsMkJBQUEsR0FBSSxDQUFBLENBQUEsRUFBSixDQUFBO0FBQUE7O2tDQUFBLENBREY7QUFBQTtzQkFISTtJQUFBLENBRk4sQ0FBQTtBQUFBLElBUUEsS0FBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtBQUNOLFVBQUEsOEJBQUE7QUFBQTtBQUFBO1dBQUEsbURBQUE7b0JBQUE7O1VBQ0UsQ0FBRSxDQUFBLENBQUEsSUFBTTtTQUFSOztVQUNBLENBQUUsQ0FBQSxDQUFBLElBQU07U0FEUjtBQUFBLFFBRUEsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUwsR0FBVyxDQUZYLENBQUE7QUFBQSxRQUdBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFMLEdBQVcsQ0FIWCxDQUFBO0FBQUEsc0JBSUEsTUFBQSxDQUFPLENBQUUsQ0FBQSxDQUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/haskell-gadt-spec.coffee
