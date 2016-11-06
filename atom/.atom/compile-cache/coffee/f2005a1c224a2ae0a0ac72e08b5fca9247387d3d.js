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
    describe("identifiers", function() {
      return it('doesnt highlight partial prelude names', function() {
        var g;
        g = grammarExpect(grammar, "top'n'tail");
        g.toHaveScopes([['source.haskell', 'identifier.haskell']]);
        return g.toHaveTokenScopes([
          [
            {
              "top'n'tail": ['identifier.haskell']
            }
          ]
        ]);
      });
    });
    describe(':: declarations', function() {
      it('parses newline declarations', function() {
        var g;
        g = grammarExpect(grammar, 'function :: Type -> OtherType');
        g.toHaveScopes([['source.haskell', 'meta.function.type-declaration.haskell']]);
        return g.toHaveTokenScopes([
          [
            {
              'function': ['entity.name.function.haskell']
            }, ' ', {
              '::': ['keyword.other.double-colon.haskell']
            }, ' ', {
              'Type': ['meta.type-signature.haskell', 'entity.name.type.haskell']
            }, ' ', {
              '->': ['meta.type-signature.haskell', 'keyword.other.arrow.haskell']
            }, ' ', {
              'OtherType': ['meta.type-signature.haskell', 'entity.name.type.haskell']
            }
          ]
        ]);
      });
      it('parses in-line parenthesised declarations', function() {
        var g;
        g = grammarExpect(grammar, 'main = (putStrLn :: String -> IO ()) ("Hello World" :: String)');
        g.toHaveScopes([['source.haskell']]);
        return g.toHaveTokenScopes([
          [
            {
              "main": ['identifier.haskell']
            }, " ", {
              "=": ['keyword.operator.haskell']
            }, " ", "(", {
              "putStrLn": ['support.function.prelude.haskell']
            }, " ", {
              "::": ['keyword.other.double-colon.haskell']
            }, " ", {
              "String": ['entity.name.type.haskell', 'support.class.prelude.haskell']
            }, " ", {
              "->": ['keyword.other.arrow.haskell']
            }, " ", {
              "IO": ['entity.name.type.haskell', 'support.class.prelude.haskell']
            }, " ", {
              "()": ['constant.language.unit.haskell']
            }, ")", " ", "(", "\"", {
              "Hello World": ['string.quoted.double.haskell']
            }, "\"", " ", {
              "::": ['keyword.other.double-colon.haskell']
            }, " ", {
              "String": ['entity.name.type.haskell', 'support.class.prelude.haskell']
            }, ")"
          ]
        ]);
      });
      it('doesnt get confused by quoted ::', function() {
        var g;
        g = grammarExpect(grammar, '("x :: String -> IO ()" ++ var)');
        g.toHaveScopes([['source.haskell']]);
        return g.toHaveTokenScopes([
          [
            "(", "\"", {
              "x :: String -> IO ()": ['string.quoted.double.haskell']
            }, "\"", " ", {
              "++": ['keyword.operator.haskell']
            }, " ", {
              "var": ['identifier.haskell']
            }, ")"
          ]
        ]);
      });
      return it('parses in-line non-parenthesised declarations', function() {
        var g;
        g = grammarExpect(grammar, 'main = putStrLn "Hello World" :: IO ()');
        g.toHaveScopes([['source.haskell']]);
        return g.toHaveTokenScopes([
          [
            {
              'main': ['identifier.haskell']
            }, ' ', {
              '=': ['keyword.operator.haskell']
            }, ' ', {
              'putStrLn': ['identifier.haskell', 'support.function.prelude.haskell']
            }, ' ', {
              '"': ['string.quoted.double.haskell', 'punctuation.definition.string.begin.haskell']
            }, {
              'Hello World': ['string.quoted.double.haskell']
            }, {
              '"': ['string.quoted.double.haskell', 'punctuation.definition.string.end.haskell']
            }, ' ', {
              '::': ['keyword.other.double-colon.haskell']
            }, ' ', {
              'IO': ['meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
            }, ' ', {
              '()': ['meta.type-signature.haskell', 'constant.language.unit.haskell']
            }
          ]
        ]);
      });
    });
    describe('regression test for 65', function() {
      it('works with space', function() {
        var g;
        g = grammarExpect(grammar, 'data Foo = Foo {bar :: Bar}');
        g.toHaveScopes([['source.haskell', 'meta.declaration.type.data.haskell']]);
        return g.toHaveTokenScopes([
          [
            {
              'data': ['storage.type.data.haskell']
            }, ' ', {
              'Foo': ['meta.type-signature.haskell', 'entity.name.type.haskell'],
              ' ': ['meta.type-signature.haskell'],
              '=': ['keyword.operator.assignment.haskell']
            }, ' ', {
              'Foo': ['entity.name.tag.haskell']
            }, ' ', {
              '{': ['meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.begin.haskell'],
              'bar': ['meta.record-field.type-declaration.haskell', 'entity.other.attribute-name.haskell']
            }, ' ', {
              '::': ['keyword.other.double-colon.haskell'],
              ' ': ['meta.type-signature.haskell'],
              'Bar': ['meta.type-signature.haskell', 'entity.name.type.haskell'],
              '}': ['meta.declaration.type.data.record.block.haskell', 'keyword.operator.record.end.haskell']
            }
          ]
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
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell']
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
    it("properly highlights data declarations", function() {
      var data, tokens;
      data = 'data Foo = Foo Bar';
      tokens = grammar.tokenizeLine(data).tokens;
      return expect(tokens).toEqual([
        {
          "value": "data",
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "storage.type.data.haskell"]
        }, {
          "value": " ",
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
        }, {
          "value": "Foo",
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
          "value": "Foo",
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "entity.name.tag.haskell"]
        }, {
          "value": " ",
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell"]
        }, {
          "value": "Bar",
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "meta.type-signature.haskell", "entity.name.type.haskell"]
        }
      ]);
    });
    describe("regression test for 71", function() {
      it("<-", function() {
        var data, tokens;
        data = "x :: String <- undefined";
        tokens = grammar.tokenizeLine(data).tokens;
        console.log(JSON.stringify(tokens, void 0, 2));
        return expect(tokens).toEqual([
          {
            value: 'x',
            scopes: ['source.haskell', 'identifier.haskell']
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
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: '<-',
            scopes: ['source.haskell', 'keyword.operator.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: 'undefined',
            scopes: ['source.haskell', 'identifier.haskell', 'support.function.prelude.haskell']
          }
        ]);
      });
      it("=", function() {
        var data, tokens;
        data = "x :: String = undefined";
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'x',
            scopes: ['source.haskell', 'identifier.haskell']
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
            scopes: ['source.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.type-signature.haskell']
          }, {
            value: '=',
            scopes: ['source.haskell', 'keyword.operator.assignment.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell']
          }, {
            value: 'undefined',
            scopes: ['source.haskell', 'identifier.haskell', 'support.function.prelude.haskell']
          }
        ]);
      });
      return it("still works for type-op signatures", function() {
        var data, tokens;
        data = "smth :: a <-- b";
        tokens = grammar.tokenizeLine(data).tokens;
        return expect(tokens).toEqual([
          {
            value: 'smth',
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
            value: 'a',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'variable.other.generic-type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: '<--',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'keyword.operator.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'b',
            scopes: ['source.haskell', 'meta.function.type-declaration.haskell', 'meta.type-signature.haskell', 'variable.other.generic-type.haskell']
          }
        ]);
      });
    });
    describe("type operators", function() {
      it("parses type operators", function() {
        var data, tokens;
        data = ":: a *** b";
        tokens = grammar.tokenizeLine(data).tokens;
        expect(tokens[4].value).toEqual('***');
        return expect(tokens[4].scopes).toContain('keyword.operator.haskell');
      });
      return it("doesn't confuse arrows and type operators", function() {
        var g;
        g = grammarExpect(grammar, ":: a --> b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '-->', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([[[4, ['keyword.operator.haskell', 'meta.type-signature.haskell']]]]);
        g = grammarExpect(grammar, ":: a ->- b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '->-', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([[[4, ['keyword.operator.haskell', 'meta.type-signature.haskell']]]]);
        g = grammarExpect(grammar, ":: a ==> b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '==>', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        g.tokenToHaveScopes([[[4, ['keyword.operator.haskell', 'meta.type-signature.haskell']]]]);
        g = grammarExpect(grammar, ":: a =>= b");
        g.toHaveTokens([['::', ' ', 'a', ' ', '=>=', ' ', 'b']]);
        g.toHaveScopes([['source.haskell']]);
        return g.tokenToHaveScopes([[[4, ['keyword.operator.haskell', 'meta.type-signature.haskell']]]]);
      });
    });
    describe("comments", function() {
      it("parses block comments", function() {
        var g;
        g = grammarExpect(grammar, "{- this is a block comment -}");
        g.toHaveTokens([['{-', ' this is a block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([[[0, ['punctuation.definition.comment.block.start.haskell']], [2, ['punctuation.definition.comment.block.end.haskell']]]]);
      });
      it("parses nested block comments", function() {
        var g;
        g = grammarExpect(grammar, "{- this is a {- nested -} block comment -}");
        g.toHaveTokens([['{-', ' this is a ', '{-', ' nested ', '-}', ' block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([[[0, ['punctuation.definition.comment.block.start.haskell']], [2, ['punctuation.definition.comment.block.start.haskell']], [4, ['punctuation.definition.comment.block.end.haskell']], [6, ['punctuation.definition.comment.block.end.haskell']]]]);
      });
      return it("parses pragmas as comments in block comments", function() {
        var g;
        g = grammarExpect(grammar, '{- this is a {-# nested #-} block comment -}');
        g.toHaveTokens([['{-', ' this is a ', '{-', '# nested #', '-}', ' block comment ', '-}']]);
        g.toHaveScopes([['source.haskell', 'comment.block.haskell']]);
        return g.tokenToHaveScopes([[[0, ['punctuation.definition.comment.block.start.haskell']], [2, ['punctuation.definition.comment.block.start.haskell']], [4, ['punctuation.definition.comment.block.end.haskell']], [6, ['punctuation.definition.comment.block.end.haskell']]]]);
      });
    });
    return describe("instance", function() {
      it("recognizes instances", function() {
        var g;
        g = grammarExpect(grammar, 'instance Class where');
        g.toHaveTokens([['instance', ' ', 'Class', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
        return g.tokenToHaveScopes([[[1, ['meta.type-signature.haskell']], [2, ['meta.type-signature.haskell', 'entity.name.type.haskell']], [3, ['meta.type-signature.haskell']], [4, ['keyword.other.haskell']]]]);
      });
      return it("recognizes instance pragmas", function() {
        var g, p, _i, _len, _ref1, _results;
        _ref1 = ['OVERLAPS', 'OVERLAPPING', 'OVERLAPPABLE', 'INCOHERENT'];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          p = _ref1[_i];
          g = grammarExpect(grammar, "instance {-# " + p + " #-} Class where");
          g.toHaveTokens([['instance', ' ', '{-#', ' ', p, ' ', '#-}', ' ', 'Class', ' ', 'where']]);
          g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
          _results.push(g.tokenToHaveScopes([[[2, ['meta.preprocessor.haskell']], [3, ['meta.preprocessor.haskell']], [4, ['meta.preprocessor.haskell', 'keyword.other.preprocessor.haskell']], [5, ['meta.preprocessor.haskell']], [6, ['meta.preprocessor.haskell']]]]));
        }
        return _results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9sYW5ndWFnZS1oYXNrZWxsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBOztBQUFBLEVBQUEsT0FBa0MsT0FBQSxDQUFRLFFBQVIsQ0FBbEMsRUFBQyxxQkFBQSxhQUFELEVBQWdCLHNCQUFBLGNBQWhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxjQUFiLENBQUEsQ0FBQTtBQUFBLE1BQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQURBLENBQUE7YUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsZ0JBQWxDLEVBRFA7TUFBQSxDQUFMLEVBTFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBVUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLGdCQUEvQixFQUZ1QjtJQUFBLENBQXpCLENBVkEsQ0FBQTtBQUFBLElBY0EsUUFBQSxDQUFTLE9BQVQsRUFBa0Is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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/language-haskell-spec.coffee
