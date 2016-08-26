(function() {
  describe("Language-Haskell", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.haskell");
      });
    });
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("source.haskell");
    });
    describe("chars", function() {
      it('tokenizes general chars', function() {
        var char, chars, scope, tokens, _results;
        chars = ['a', '0', '9', 'z', '@', '0', '"'];
        _results = [];
        for (scope in chars) {
          char = chars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          _results.push(expect(tokens).toEqual([
            {
              value: "'",
              scopes: ["source.haskell", 'string.quoted.single.haskell', "punctuation.definition.string.begin.haskell"]
            }, {
              value: char,
              scopes: ["source.haskell", 'string.quoted.single.haskell']
            }, {
              value: "'",
              scopes: ["source.haskell", 'string.quoted.single.haskell', "punctuation.definition.string.end.haskell"]
            }
          ]));
        }
        return _results;
      });
      return it('tokenizes escape chars', function() {
        var char, escapeChars, scope, tokens, _results;
        escapeChars = ['\\t', '\\n', '\\\''];
        _results = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          _results.push(expect(tokens).toEqual([
            {
              value: "'",
              scopes: ["source.haskell", 'string.quoted.single.haskell', "punctuation.definition.string.begin.haskell"]
            }, {
              value: char,
              scopes: ["source.haskell", 'string.quoted.single.haskell', 'constant.character.escape.haskell']
            }, {
              value: "'",
              scopes: ["source.haskell", 'string.quoted.single.haskell', "punctuation.definition.string.end.haskell"]
            }
          ]));
        }
        return _results;
      });
    });
    describe("strings", function() {
      return it("tokenizes single-line strings", function() {
        var tokens;
        tokens = grammar.tokenizeLine('"abcde\\n\\EOT\\EOL"').tokens;
        return expect(tokens).toEqual([
          {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.begin.haskell']
          }, {
            value: 'abcde',
            scopes: ['source.haskell', 'string.quoted.double.haskell']
          }, {
            value: '\\n',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'constant.character.escape.haskell']
          }, {
            value: '\\EOT',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'constant.character.escape.haskell']
          }, {
            value: '\\EOL',
            scopes: ['source.haskell', 'string.quoted.double.haskell']
          }, {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.end.haskell']
          }
        ]);
      });
    });
    describe("backtick function call", function() {
      return it("finds backtick function names", function() {
        var tokens;
        tokens = grammar.tokenizeLine("\`func\`").tokens;
        expect(tokens[0]).toEqual({
          value: '`',
          scopes: ['source.haskell', 'keyword.operator.function.infix.haskell', 'punctuation.definition.entity.haskell']
        });
        expect(tokens[1]).toEqual({
          value: 'func',
          scopes: ['source.haskell', 'keyword.operator.function.infix.haskell']
        });
        return expect(tokens[2]).toEqual({
          value: '`',
          scopes: ['source.haskell', 'keyword.operator.function.infix.haskell', 'punctuation.definition.entity.haskell']
        });
      });
    });
    describe("keywords", function() {
      var controlKeywords, keyword, scope, _results;
      controlKeywords = ['case', 'of', 'in', 'where', 'if', 'then', 'else'];
      _results = [];
      for (scope in controlKeywords) {
        keyword = controlKeywords[scope];
        _results.push(it("tokenizes " + keyword + " as a keyword", function() {
          var tokens;
          tokens = grammar.tokenizeLine(keyword).tokens;
          return expect(tokens[0]).toEqual({
            value: keyword,
            scopes: ['source.haskell', 'keyword.control.haskell']
          });
        }));
      }
      return _results;
    });
    describe("operators", function() {
      return it("tokenizes the / arithmetic operator when separated by newlines", function() {
        var lines;
        lines = grammar.tokenizeLines("1\n/ 2");
        return expect(lines).toEqual([
          [
            {
              value: '1',
              scopes: ['source.haskell', 'constant.numeric.decimal.haskell']
            }
          ], [
            {
              value: '/',
              scopes: ['source.haskell', 'keyword.operator.haskell']
            }, {
              value: ' ',
              scopes: ['source.haskell']
            }, {
              value: '2',
              scopes: ['source.haskell', 'constant.numeric.decimal.haskell']
            }
          ]
        ]);
      });
    });
    it("tokenizes {-  -} comments", function() {
      var tokens;
      tokens = grammar.tokenizeLine('{--}').tokens;
      expect(tokens).toEqual([
        {
          value: '{-',
          scopes: ['source.haskell', 'comment.block.haskell', 'punctuation.definition.comment.haskell']
        }, {
          value: '-}',
          scopes: ['source.haskell', 'comment.block.haskell']
        }
      ]);
      tokens = grammar.tokenizeLine('{- foo -}').tokens;
      return expect(tokens).toEqual([
        {
          value: '{-',
          scopes: ['source.haskell', 'comment.block.haskell', 'punctuation.definition.comment.haskell']
        }, {
          value: ' foo ',
          scopes: ['source.haskell', 'comment.block.haskell']
        }, {
          value: '-}',
          scopes: ['source.haskell', 'comment.block.haskell']
        }
      ]);
    });
    describe("ids", function() {
      return it('handles type_ids', function() {
        var id, scope, tokens, typeIds, _results;
        typeIds = ['Char', 'Data', 'List', 'Int', 'Integral', 'Float', 'Date'];
        _results = [];
        for (scope in typeIds) {
          id = typeIds[scope];
          tokens = grammar.tokenizeLine(id).tokens;
          _results.push(expect(tokens[0]).toEqual({
            value: id,
            scopes: ['source.haskell', 'entity.name.tag.haskell']
          }));
        }
        return _results;
      });
    });
    describe(':: declarations', function() {
      it('parses newline declarations', function() {
        var data, tokens;
        data = 'function :: Type -> OtherType';
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'function',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'entity.name.function.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Type',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: '->',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'keyword.other.arrow.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'OtherType',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }
        ]);
      });
      it('parses in-line parenthesised declarations', function() {
        var data, tokens;
        data = 'main = (putStrLn :: String -> IO ()) ("Hello World" :: String)';
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'main',
            scopes: ['source.haskell', 'identifier.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '=',
            scopes: ['source.haskell', 'keyword.operator.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '(',
            scopes: ['source.haskell']
          }, {
            value: 'putStrLn',
            scopes: ['source.haskell', 'support.function.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'String',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: '->',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'keyword.other.arrow.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'IO',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: '()',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'constant.language.unit.haskell']
          }, {
            value: ')',
            scopes: ['source.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '(',
            scopes: ['source.haskell']
          }, {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.begin.haskell']
          }, {
            value: 'Hello World',
            scopes: ['source.haskell', 'string.quoted.double.haskell']
          }, {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.end.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'String',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
          }, {
            value: ')',
            scopes: ['source.haskell']
          }
        ]);
      });
      return it('parses in-line non-parenthesised declarations', function() {
        var data, tokens;
        data = 'main = putStrLn "Hello World" :: IO ()';
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'main',
            scopes: ['source.haskell', 'identifier.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '=',
            scopes: ['source.haskell', 'keyword.operator.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: 'putStrLn',
            scopes: ['source.haskell', 'support.function.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.begin.haskell']
          }, {
            value: 'Hello World',
            scopes: ['source.haskell', 'string.quoted.double.haskell']
          }, {
            value: '"',
            scopes: ['source.haskell', 'string.quoted.double.haskell', 'punctuation.definition.string.end.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'IO',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: '()',
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'constant.language.unit.haskell']
          }
        ]);
      });
    });
    return describe('regression test for 65', function() {
      it('works with space', function() {
        var data, tokens;
        data = 'data Foo = Foo {bar :: Bar}';
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'data',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'storage.type.data.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Foo',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: '=',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.operator.assignment.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Foo',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'entity.name.tag.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: '{',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.begin.haskell']
          }, {
            value: 'bar',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'entity.other.attribute-name.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Bar',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: '}',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.end.haskell']
          }
        ]);
      });
      return it('works without space', function() {
        var data, tokens;
        data = 'data Foo = Foo{bar :: Bar}';
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'data',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'storage.type.data.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Foo',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: '=',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.operator.assignment.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Foo',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'entity.name.tag.haskell']
          }, {
            value: '{',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.begin.haskell']
          }, {
            value: 'bar',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'entity.other.attribute-name.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Bar',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'meta.record-field.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: '}',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.end.haskell']
          }
        ]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NwZWMvbGFuZ3VhZ2UtaGFza2VsbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUFBLENBQUE7YUFHQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsZ0JBQWxDLEVBRFA7TUFBQSxDQUFMLEVBSlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLGdCQUEvQixFQUZ1QjtJQUFBLENBQXpCLENBVEEsQ0FBQTtBQUFBLElBYUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixZQUFBLG9DQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIs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

//# sourceURL=/home/epse/.atom/packages/language-haskell/spec/language-haskell-spec.coffee
