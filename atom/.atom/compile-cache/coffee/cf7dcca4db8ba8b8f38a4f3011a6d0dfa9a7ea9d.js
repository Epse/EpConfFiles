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
        return grammar = atom.grammars.grammarForScopeName("text.tex.latex.haskell");
      });
    });
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("text.tex.latex.haskell");
    });
    return describe("regression test for 64", function() {
      it("parses inline signatures", function() {
        var g;
        g = grammarExpect(grammar, 'a signature |f::Type| should be contained');
        g.toHaveTokens([['a signature ', '|', 'f', '::', 'Type', '|', ' should be contained']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([[[1, ['meta.embedded.text.haskell.latex.haskell']], [2, ['meta.embedded.text.haskell.latex.haskell', 'meta.function.type-declaration.haskell']], [3, ['meta.embedded.text.haskell.latex.haskell', 'keyword.other.double-colon.haskell']], [4, ['meta.embedded.text.haskell.latex.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']], [5, ['meta.embedded.text.haskell.latex.haskell']]]]);
      });
      it("parses inline signatures with dots", function() {
        var g;
        g = grammarExpect(grammar, 'a signature |f::Type|. should be contained');
        g.toHaveTokens([['a signature ', '|', 'f', '::', 'Type', '|', '. should be contained']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([[[1, ['meta.embedded.text.haskell.latex.haskell']], [2, ['meta.embedded.text.haskell.latex.haskell', 'meta.function.type-declaration.haskell']], [3, ['meta.embedded.text.haskell.latex.haskell', 'keyword.other.double-colon.haskell']], [4, ['meta.embedded.text.haskell.latex.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']], [5, ['meta.embedded.text.haskell.latex.haskell']]]]);
      });
      it("parses inline code with pipes", function() {
        var g;
        g = grammarExpect(grammar, 'a code |type Bool = True || False| should parse correctly');
        g.toHaveTokens([['a code ', '|', 'type', ' ', 'Bool', ' ', '=', ' ', 'True', ' ', '||', ' ', 'False', '|', ' should parse correctly']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([[[1, ['meta.embedded.text.haskell.latex.haskell']], [2, ["storage.type.data.haskell"]], [3, ["meta.type-signature.haskell"]], [4, ["entity.name.type.haskell"]], [6, ['keyword.operator.assignment.haskell']], [8, ['entity.name.type.haskell']], [10, ['keyword.operator.haskell']], [12, ['entity.name.type.haskell']], [13, ['meta.embedded.text.haskell.latex.haskell']]]]);
      });
      return it("parses inline code with pipes", function() {
        var g;
        g = grammarExpect(grammar, 'a |code||||| should parse correctly');
        g.toHaveTokens([['a ', '|', 'code', '||||', '|', ' should parse correctly']]);
        g.toHaveScopes([['text.tex.latex.haskell']]);
        return g.tokenToHaveScopes([[[1, ['meta.embedded.text.haskell.latex.haskell']], [2, ["identifier.haskell"]], [3, ["keyword.operator.haskell"]], [4, ['meta.embedded.text.haskell.latex.haskell']]]]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9saXRlcmF0ZS1oYXNrZWxsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBOztBQUFBLEVBQUEsT0FBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxxQkFBQSxhQUFELEVBQWdCLHNCQUFBLGNBQWhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxjQUFiLENBQUEsQ0FBQTtBQUFBLE1BQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQURBLENBQUE7YUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0Msd0JBQWxDLEVBRFA7TUFBQSxDQUFMLEVBTFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBVUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLHdCQUEvQixFQUZ1QjtJQUFBLENBQXpCLENBVkEsQ0FBQTtXQWNBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/literate-haskell-spec.coffee
