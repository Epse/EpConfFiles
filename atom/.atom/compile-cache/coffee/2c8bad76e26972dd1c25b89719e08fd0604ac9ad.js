(function() {
  var customMatchers, grammarExpect, _ref;

  _ref = require('./util'), grammarExpect = _ref.grammarExpect, customMatchers = _ref.customMatchers;

  describe("Language-Haskell", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      this.addMatchers(customMatchers);
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.haskell");
      });
    });
    return describe("identifiers", function() {
      it('tokenizes identifiers', function() {
        var tokens;
        tokens = grammar.tokenizeLine('aSimpleIdentifier').tokens;
        return expect(tokens).toEqual([
          {
            value: 'aSimpleIdentifier',
            scopes: ['source.haskell', 'identifier.haskell']
          }
        ]);
      });
      it('tokenizes identifiers with module names', function() {
        var tokens;
        tokens = grammar.tokenizeLine('Some.Module.identifier').tokens;
        return expect(tokens).toEqual([
          {
            value: 'Some.Module.',
            scopes: ['source.haskell', 'identifier.haskell', 'support.other.module.haskell']
          }, {
            value: 'identifier',
            scopes: ['source.haskell', 'identifier.haskell']
          }
        ]);
      });
      it('tokenizes type constructors', function() {
        var tokens;
        tokens = grammar.tokenizeLine('SomeCtor').tokens;
        return expect(tokens).toEqual([
          {
            value: 'SomeCtor',
            scopes: ['source.haskell', 'entity.name.tag.haskell']
          }
        ]);
      });
      it('tokenizes type constructors with module names', function() {
        var tokens;
        tokens = grammar.tokenizeLine('Some.Module.SomeCtor').tokens;
        return expect(tokens).toEqual([
          {
            value: 'Some.Module.',
            scopes: ['source.haskell', 'entity.name.tag.haskell', 'support.other.module.haskell']
          }, {
            value: 'SomeCtor',
            scopes: ['source.haskell', 'entity.name.tag.haskell']
          }
        ]);
      });
      it('tokenizes identifiers with numeric parts', function() {
        var tokens;
        tokens = grammar.tokenizeLine('numer123ident').tokens;
        expect(tokens).toEqual([
          {
            value: 'numer123ident',
            scopes: ['source.haskell', 'identifier.haskell']
          }
        ]);
        tokens = grammar.tokenizeLine('numerident123').tokens;
        expect(tokens).toEqual([
          {
            value: 'numerident123',
            scopes: ['source.haskell', 'identifier.haskell']
          }
        ]);
        tokens = grammar.tokenizeLine('123numerident').tokens;
        return expect(tokens).toEqual([
          {
            value: '123',
            scopes: ['source.haskell', 'constant.numeric.decimal.haskell']
          }, {
            value: 'numerident',
            scopes: ['source.haskell', 'identifier.haskell']
          }
        ]);
      });
      it('doesnt confuse identifiers starting with type (issue 84)', function() {
        var g;
        g = grammarExpect(grammar, 'typeIdentifier');
        g.toHaveTokens([['typeIdentifier']]);
        return g.toHaveScopes([['source.haskell', 'identifier.haskell']]);
      });
      it('doesnt confuse identifiers starting with data', function() {
        var g;
        g = grammarExpect(grammar, 'dataIdentifier');
        g.toHaveTokens([['dataIdentifier']]);
        return g.toHaveScopes([['source.haskell', 'identifier.haskell']]);
      });
      return it('doesnt confuse identifiers starting with newtype', function() {
        var g;
        g = grammarExpect(grammar, 'newtypeIdentifier');
        g.toHaveTokens([['newtypeIdentifier']]);
        return g.toHaveScopes([['source.haskell', 'identifier.haskell']]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9oYXNrZWxsLWlkZW50LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBOztBQUFBLEVBQUEsT0FBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxxQkFBQSxhQUFELEVBQWdCLHNCQUFBLGNBQWhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxjQUFiLENBQUEsQ0FBQTtBQUFBLE1BQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQURBLENBQUE7YUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsZ0JBQWxDLEVBRFA7TUFBQSxDQUFMLEVBTFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQVVBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsWUFBQSxNQUFBO0FBQUEsUUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLG1CQUFyQixFQUFWLE1BQUQsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCO1VBQ3JCO0FBQUEsWUFBRSxLQUFBLEVBQVEs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/haskell-ident-spec.coffee
