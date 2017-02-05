(function() {
  var customMatchers, grammarExpect, ref;

  ref = require('./util'), grammarExpect = ref.grammarExpect, customMatchers = ref.customMatchers;

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
        var char, chars, results, scope, tokens;
        chars = ['a', '0', '9', 'z', '@', '0', '"'];
        results = [];
        for (scope in chars) {
          char = chars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          results.push(expect(tokens).toEqual([
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
        return results;
      });
      it('tokenizes escape chars', function() {
        var char, escapeChars, results, scope, tokens;
        escapeChars = ['\\t', '\\n', '\\\''];
        results = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          results.push(expect(tokens).toEqual([
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
        return results;
      });
      return it('tokenizes control chars', function() {
        var char, escapeChars, g, i, results, results1, scope;
        escapeChars = (function() {
          results = [];
          for (i = 64; i <= 95; i++){ results.push(i); }
          return results;
        }).apply(this).map(function(x) {
          return "\\^" + (String.fromCharCode(x));
        });
        results1 = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          g = grammarExpect(grammar, "'" + char + "'");
          g.toHaveTokens([["'", char, "'"]]);
          g.toHaveScopes([['source.haskell', "string.quoted.single.haskell"]]);
          results1.push(g.tokenToHaveScopes([[[1, ["constant.character.escape.control.haskell"]]]]));
        }
        return results1;
      });
    });
    describe("strings", function() {
      it("tokenizes single-line strings", function() {
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
      it("Regression test for 96", function() {
        var g;
        g = grammarExpect(grammar, '"^\\\\ "');
        g.toHaveTokens([["\"", "^", "\\\\", " ", "\""]]);
        g.toHaveScopes([['source.haskell', "string.quoted.double.haskell"]]);
        return g.tokenToHaveScopes([[[2, ["constant.character.escape.haskell"]]]]);
      });
      return it("Supports type-level string literals", function() {
        var g;
        g = grammarExpect(grammar, ':: "type-level string"');
        g.toHaveTokens([["::", " ", "\"", "type-level string", "\""]]);
        g.toHaveScopes([['source.haskell']]);
        return g.tokenToHaveScopes([[[3, ["string.quoted.double.haskell"]]]]);
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
      var controlKeywords, keyword, results, scope;
      controlKeywords = ['case', 'of', 'in', 'where', 'if', 'then', 'else'];
      results = [];
      for (scope in controlKeywords) {
        keyword = controlKeywords[scope];
        results.push(it("tokenizes " + keyword + " as a keyword", function() {
          var tokens;
          tokens = grammar.tokenizeLine(keyword).tokens;
          return expect(tokens[0]).toEqual({
            value: keyword,
            scopes: ['source.haskell', 'keyword.control.haskell']
          });
        }));
      }
      return results;
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
        var id, results, scope, tokens, typeIds;
        typeIds = ['Char', 'Data', 'List', 'Int', 'Integral', 'Float', 'Date'];
        results = [];
        for (scope in typeIds) {
          id = typeIds[scope];
          tokens = grammar.tokenizeLine(id).tokens;
          results.push(expect(tokens[0]).toEqual({
            value: id,
            scopes: ['source.haskell', 'entity.name.tag.haskell']
          }));
        }
        return results;
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
              'data': ['keyword.other.data.haskell']
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
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.other.data.haskell']
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
          "scopes": ["source.haskell", "meta.declaration.type.data.haskell", "keyword.other.data.haskell"]
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
        var g, i, len, p, ref1, results;
        ref1 = ['OVERLAPS', 'OVERLAPPING', 'OVERLAPPABLE', 'INCOHERENT'];
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          p = ref1[i];
          g = grammarExpect(grammar, "instance {-# " + p + " #-} Class where");
          g.toHaveTokens([['instance', ' ', '{-#', ' ', p, ' ', '#-}', ' ', 'Class', ' ', 'where']]);
          g.toHaveScopes([['source.haskell', 'meta.declaration.instance.haskell']]);
          results.push(g.tokenToHaveScopes([[[2, ['meta.preprocessor.haskell']], [3, ['meta.preprocessor.haskell']], [4, ['meta.preprocessor.haskell', 'keyword.other.preprocessor.haskell']], [5, ['meta.preprocessor.haskell']], [6, ['meta.preprocessor.haskell']]]]));
        }
        return results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9sYW5ndWFnZS1oYXNrZWxsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFrQyxPQUFBLENBQVEsUUFBUixDQUFsQyxFQUFDLGlDQUFELEVBQWdCOztFQUVoQixRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsV0FBRCxDQUFhLGNBQWI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCO01BRGMsQ0FBaEI7YUFHQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGdCQUFsQztNQURQLENBQUw7SUFMUyxDQUFYO0lBUUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7TUFDdkIsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixnQkFBL0I7SUFGdUIsQ0FBekI7SUFJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO01BQ2hCLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxLQUFBLEdBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0I7QUFFUjthQUFBLGNBQUE7O1VBQ0csU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixHQUFBLEdBQU0sSUFBTixHQUFhLEdBQWxDO3VCQUNYLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCO1lBQ3JCO2NBQUMsS0FBQSxFQUFNLEdBQVA7Y0FBWSxNQUFBLEVBQVEsQ0FBQyxnQkFBRCxFQUFtQiw4QkFBbkIsRUFBbUQsNkNBQW5ELENBQXBCO2FBRHFCLEVBRXJCO2NBQUMsS0FBQSxFQUFPLElBQVI7Y0FBYyxNQUFBLEVBQVEsQ0FBQyxnQkFBRCxFQUFtQiw4QkFBbkIsQ0FBdEI7YUFGcUIsRUFHckI7Y0FBQyxLQUFBLEVBQU0sR0FBUDtjQUFZLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLDhCQUFuQixFQUFtRCwyQ0FBbkQsQ0FBcEI7YUFIcUI7V0FBdkI7QUFGRjs7TUFINEIsQ0FBOUI7TUFXQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtBQUMzQixZQUFBO1FBQUEsV0FBQSxHQUFjLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxNQUFmO0FBQ2Q7YUFBQSxvQkFBQTs7VUFDRyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLEdBQUEsR0FBTSxJQUFOLEdBQWEsR0FBbEM7dUJBQ1gsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUI7WUFDckI7Y0FBQyxLQUFBLEVBQU0sR0FBUDtjQUFZLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLDhCQUFuQixFQUFtRCw2Q0FBbkQsQ0FBcEI7YUFEcUIsRUFFckI7Y0FBQyxLQUFBLEVBQU8sSUFBUjtjQUFjLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLDhCQUFuQixFQUFtRCxtQ0FBbkQsQ0FBdEI7YUFGcUIsRUFHckI7Y0FBQyxLQUFBLEVBQU0sR0FBUDtjQUFZLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLDhCQUFuQixFQUFtRCwyQ0FBbkQsQ0FBcEI7YUFIcUI7V0FBdkI7QUFGRjs7TUFGMkIsQ0FBN0I7YUFTQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtBQUM1QixZQUFBO1FBQUEsV0FBQSxHQUFjOzs7O3NCQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsQ0FBRDtpQkFBTyxLQUFBLEdBQUssQ0FBQyxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFwQixDQUFEO1FBQVosQ0FBYjtBQUNkO2FBQUEsb0JBQUE7O1VBQ0UsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLEdBQUEsR0FBSSxJQUFKLEdBQVMsR0FBaEM7VUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLEdBQVosQ0FBRCxDQUFmO1VBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsRUFBbUIsOEJBQW5CLENBQUQsQ0FBZjt3QkFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFFLENBQUMsQ0FBRCxFQUFJLENBQUMsMkNBQUQsQ0FBSixDQUFGLENBQUQsQ0FBcEI7QUFKRjs7TUFGNEIsQ0FBOUI7SUFyQmdCLENBQWxCO0lBNkJBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7TUFDbEIsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUE7QUFDbEMsWUFBQTtRQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsc0JBQXJCO2VBQ1gsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBd0I7VUFDdEI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLDhCQUFwQixFQUFvRCw2Q0FBcEQsQ0FBeEI7V0FEc0IsRUFFdEI7WUFBRSxLQUFBLEVBQVEsT0FBVjtZQUFtQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiw4QkFBcEIsQ0FBNUI7V0FGc0IsRUFHdEI7WUFBRSxLQUFBLEVBQVEsS0FBVjtZQUFpQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiw4QkFBcEIsRUFBb0QsbUNBQXBELENBQTFCO1dBSHNCLEVBSXRCO1lBQUUsS0FBQSxFQUFRLE9BQVY7WUFBbUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0IsOEJBQXBCLEVBQW9ELG1DQUFwRCxDQUE1QjtXQUpzQixFQUt0QjtZQUFFLEtBQUEsRUFBUSxPQUFWO1lBQW1CLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLDhCQUFwQixDQUE1QjtXQUxzQixFQU10QjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0IsOEJBQXBCLEVBQW9ELDJDQUFwRCxDQUF4QjtXQU5zQjtTQUF4QjtNQUZrQyxDQUFwQztNQVVBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO0FBQzNCLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsVUFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLE1BQVosRUFBb0IsR0FBcEIsRUFBeUIsSUFBekIsQ0FBRCxDQUFmO1FBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsRUFBbUIsOEJBQW5CLENBQUQsQ0FBZjtlQUNBLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUUsQ0FBQyxDQUFELEVBQUksQ0FBQyxtQ0FBRCxDQUFKLENBQUYsQ0FBRCxDQUFwQjtNQUoyQixDQUE3QjthQUtBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO0FBQ3hDLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsd0JBQXZCO1FBQ0osQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWSxJQUFaLEVBQWtCLG1CQUFsQixFQUF1QyxJQUF2QyxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFFLENBQUMsQ0FBRCxFQUFJLENBQUMsOEJBQUQsQ0FBSixDQUFGLENBQUQsQ0FBcEI7TUFKd0MsQ0FBMUM7SUFoQmtCLENBQXBCO0lBdUJBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBO2FBQ2pDLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBO0FBQ2xDLFlBQUE7UUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFVBQXJCO1FBQ1gsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtVQUFBLEtBQUEsRUFBTyxHQUFQO1VBQVksTUFBQSxFQUFRLENBQUMsZ0JBQUQsRUFBbUIseUNBQW5CLEVBQTZELHVDQUE3RCxDQUFwQjtTQUExQjtRQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7VUFBQSxLQUFBLEVBQU8sTUFBUDtVQUFlLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLHlDQUFuQixDQUF2QjtTQUExQjtlQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7VUFBQSxLQUFBLEVBQU8sR0FBUDtVQUFZLE1BQUEsRUFBUSxDQUFDLGdCQUFELEVBQW1CLHlDQUFuQixFQUE2RCx1Q0FBN0QsQ0FBcEI7U0FBMUI7TUFKa0MsQ0FBcEM7SUFEaUMsQ0FBbkM7SUFPQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFVBQUE7TUFBQSxlQUFBLEdBQWtCLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCLElBQTlCLEVBQW9DLE1BQXBDLEVBQTRDLE1BQTVDO0FBRWxCO1dBQUEsd0JBQUE7O3FCQUNFLEVBQUEsQ0FBRyxZQUFBLEdBQWEsT0FBYixHQUFxQixlQUF4QixFQUF3QyxTQUFBO0FBQ3RDLGNBQUE7VUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE9BQXJCO2lCQUNYLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7WUFBQSxLQUFBLEVBQU8sT0FBUDtZQUFnQixNQUFBLEVBQVEsQ0FBQyxnQkFBRCxFQUFtQix5QkFBbkIsQ0FBeEI7V0FBMUI7UUFGc0MsQ0FBeEM7QUFERjs7SUFIbUIsQ0FBckI7SUFRQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO2FBQ3BCLEVBQUEsQ0FBRyxnRUFBSCxFQUFxRSxTQUFBO0FBQ25FLFlBQUE7UUFBQSxLQUFBLEdBQVEsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsUUFBdEI7ZUFJUixNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUF1QjtVQUNuQjtZQUNFO2NBQUUsS0FBQSxFQUFRLEdBQVY7Y0FBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQixrQ0FBcEIsQ0FBeEI7YUFERjtXQURtQixFQUluQjtZQUNFO2NBQUUsS0FBQSxFQUFRLEdBQVY7Y0FBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiwwQkFBcEIsQ0FBeEI7YUFERixFQUVFO2NBQUUsS0FBQSxFQUFRLEdBQVY7Y0FBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixDQUF4QjthQUZGLEVBR0U7Y0FBRSxLQUFBLEVBQVEsR0FBVjtjQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLGtDQUFwQixDQUF4QjthQUhGO1dBSm1CO1NBQXZCO01BTG1FLENBQXJFO0lBRG9CLENBQXRCO0lBaUJBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7YUFDZCxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtBQUNyQixZQUFBO1FBQUEsT0FBQSxHQUFVLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsS0FBekIsRUFBZ0MsVUFBaEMsRUFBNEMsT0FBNUMsRUFBcUQsTUFBckQ7QUFFVjthQUFBLGdCQUFBOztVQUNHLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsRUFBckI7dUJBQ1gsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtZQUFBLEtBQUEsRUFBTyxFQUFQO1lBQVcsTUFBQSxFQUFRLENBQUMsZ0JBQUQsRUFBbUIseUJBQW5CLENBQW5CO1dBQTFCO0FBRkY7O01BSHFCLENBQXZCO0lBRGMsQ0FBaEI7SUFRQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO2FBQ3RCLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBO0FBQzNDLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsWUFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQixvQkFBbkIsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CO1VBQ2xCO1lBQUU7Y0FBQSxZQUFBLEVBQWUsQ0FBRSxvQkFBRixDQUFmO2FBQUY7V0FEa0I7U0FBcEI7TUFIMkMsQ0FBN0M7SUFEc0IsQ0FBeEI7SUFRQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtNQUMxQixFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTtBQUNoQyxZQUFBO1FBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLCtCQUF2QjtRQUNKLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLGdCQUFELEVBQW1CLHdDQUFuQixDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0I7VUFDbEI7WUFBRTtjQUFBLFVBQUEsRUFBYSxDQUFFLDhCQUFGLENBQWI7YUFBRixFQUNFLEdBREYsRUFFRTtjQUFBLElBQUEsRUFBTyxDQUFFLG9DQUFGLENBQVA7YUFGRixFQUdFLEdBSEYsRUFJRTtjQUFBLE1BQUEsRUFBUyxDQUFFLDZCQUFGLEVBQWlDLDBCQUFqQyxDQUFUO2FBSkYsRUFLRSxHQUxGLEVBTUU7Y0FBQSxJQUFBLEVBQU8sQ0FBRSw2QkFBRixFQUFpQyw2QkFBakMsQ0FBUDthQU5GLEVBT0UsR0FQRixFQVFFO2NBQUEsV0FBQSxFQUFjLENBQUUsNkJBQUYsRUFBaUMsMEJBQWpDLENBQWQ7YUFSRjtXQURrQjtTQUFwQjtNQUhnQyxDQUFsQztNQWVBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBO0FBQzlDLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsZ0VBQXZCO1FBQ0osQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CO1VBQ2xCO1lBQUU7Y0FBQSxNQUFBLEVBQVMsQ0FBQyxvQkFBRCxDQUFUO2FBQUYsRUFDRSxHQURGLEVBRUU7Y0FBQSxHQUFBLEVBQU0sQ0FBQywwQkFBRCxDQUFOO2FBRkYsRUFHRSxHQUhGLEVBSUUsR0FKRixFQUtFO2NBQUEsVUFBQSxFQUFhLENBQUMsa0NBQUQsQ0FBYjthQUxGLEVBTUUsR0FORixFQU9FO2NBQUEsSUFBQSxFQUFPLENBQUMsb0NBQUQsQ0FBUDthQVBGLEVBUUUsR0FSRixFQVNFO2NBQUEsUUFBQSxFQUFXLENBQUMsMEJBQUQsRUFBNkIsK0JBQTdCLENBQVg7YUFURixFQVVFLEdBVkYsRUFXRTtjQUFBLElBQUEsRUFBTyxDQUFDLDZCQUFELENBQVA7YUFYRixFQVlFLEdBWkYsRUFhRTtjQUFBLElBQUEsRUFBTyxDQUFDLDBCQUFELEVBQTZCLCtCQUE3QixDQUFQO2FBYkYsRUFjRSxHQWRGLEVBZUU7Y0FBQSxJQUFBLEVBQU8sQ0FBQyxnQ0FBRCxDQUFQO2FBZkYsRUFnQkUsR0FoQkYsRUFpQkUsR0FqQkYsRUFrQkUsR0FsQkYsRUFtQkUsSUFuQkYsRUFvQkU7Y0FBQSxhQUFBLEVBQWdCLENBQUMsOEJBQUQsQ0FBaEI7YUFwQkYsRUFxQkUsSUFyQkYsRUFzQkUsR0F0QkYsRUF1QkU7Y0FBQSxJQUFBLEVBQU8sQ0FBQyxvQ0FBRCxDQUFQO2FBdkJGLEVBd0JFLEdBeEJGLEVBeUJFO2NBQUEsUUFBQSxFQUFXLENBQUMsMEJBQUQsRUFBNkIsK0JBQTdCLENBQVg7YUF6QkYsRUEwQkUsR0ExQkY7V0FEa0I7U0FBcEI7TUFIOEMsQ0FBaEQ7TUFrQ0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7QUFDckMsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1QixpQ0FBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0I7VUFDbEI7WUFBRSxHQUFGLEVBQ0UsSUFERixFQUVFO2NBQUEsc0JBQUEsRUFBeUIsQ0FBQyw4QkFBRCxDQUF6QjthQUZGLEVBR0UsSUFIRixFQUlFLEdBSkYsRUFLRTtjQUFBLElBQUEsRUFBTyxDQUFDLDBCQUFELENBQVA7YUFMRixFQU1FLEdBTkYsRUFPRTtjQUFBLEtBQUEsRUFBUSxDQUFDLG9CQUFELENBQVI7YUFQRixFQVFFLEdBUkY7V0FEa0I7U0FBcEI7TUFIcUMsQ0FBdkM7YUFnQkEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUE7QUFDbEQsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1Qix3Q0FBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0I7VUFDbEI7WUFBRTtjQUFBLE1BQUEsRUFBUyxDQUFFLG9CQUFGLENBQVQ7YUFBRixFQUNFLEdBREYsRUFFRTtjQUFBLEdBQUEsRUFBTSxDQUFFLDBCQUFGLENBQU47YUFGRixFQUdFLEdBSEYsRUFJRTtjQUFBLFVBQUEsRUFBYSxDQUFFLG9CQUFGLEVBQXdCLGtDQUF4QixDQUFiO2FBSkYsRUFLRSxHQUxGLEVBTUU7Y0FBQyxHQUFBLEVBQU0sQ0FBRSw4QkFBRixFQUFrQyw2Q0FBbEMsQ0FBUDthQU5GLEVBT0U7Y0FBQyxhQUFBLEVBQWdCLENBQUUsOEJBQUYsQ0FBakI7YUFQRixFQVFFO2NBQUMsR0FBQSxFQUFNLENBQUUsOEJBQUYsRUFBa0MsMkNBQWxDLENBQVA7YUFSRixFQVNFLEdBVEYsRUFVRTtjQUFBLElBQUEsRUFBTyxDQUFFLG9DQUFGLENBQVA7YUFWRixFQVdFLEdBWEYsRUFZRTtjQUFBLElBQUEsRUFBTyxDQUFFLDZCQUFGLEVBQWlDLDBCQUFqQyxFQUE2RCwrQkFBN0QsQ0FBUDthQVpGLEVBYUUsR0FiRixFQWNFO2NBQUEsSUFBQSxFQUFPLENBQUUsNkJBQUYsRUFBaUMsZ0NBQWpDLENBQVA7YUFkRjtXQURrQjtTQUFwQjtNQUhrRCxDQUFwRDtJQWxFMEIsQ0FBNUI7SUF3RkEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7TUFDakMsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7QUFDckIsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1Qiw2QkFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQixvQ0FBbkIsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CO1VBQ2xCO1lBQUU7Y0FBQSxNQUFBLEVBQVMsQ0FBRSw0QkFBRixDQUFUO2FBQUYsRUFDRSxHQURGLEVBRUU7Y0FBQSxLQUFBLEVBQVEsQ0FBRSw2QkFBRixFQUFpQywwQkFBakMsQ0FBUjtjQUNBLEdBQUEsRUFBTSxDQUFFLDZCQUFGLENBRE47Y0FFQSxHQUFBLEVBQU0sQ0FBRSxxQ0FBRixDQUZOO2FBRkYsRUFLRSxHQUxGLEVBTUU7Y0FBQSxLQUFBLEVBQVEsQ0FBRSx5QkFBRixDQUFSO2FBTkYsRUFPRSxHQVBGLEVBUUU7Y0FBQSxHQUFBLEVBQU0sQ0FBRSxpREFBRixFQUFxRCx1Q0FBckQsQ0FBTjtjQUNBLEtBQUEsRUFBUSxDQUFFLDRDQUFGLEVBQWdELHFDQUFoRCxDQURSO2FBUkYsRUFVRSxHQVZGLEVBV0U7Y0FBQSxJQUFBLEVBQU8sQ0FBRSxvQ0FBRixDQUFQO2NBQ0EsR0FBQSxFQUFNLENBQUUsNkJBQUYsQ0FETjtjQUVBLEtBQUEsRUFBUSxDQUFFLDZCQUFGLEVBQWlDLDBCQUFqQyxDQUZSO2NBR0EsR0FBQSxFQUFNLENBQUUsaURBQUYsRUFBcUQscUNBQXJELENBSE47YUFYRjtXQURrQjtTQUFwQjtNQUhxQixDQUF2QjthQXNCQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQTtBQUN4QixZQUFBO1FBQUEsSUFBQSxHQUFPO1FBQ04sU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixJQUFyQjtlQUNYLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCO1VBQ3JCO1lBQUUsS0FBQSxFQUFRLE1BQVY7WUFBa0IsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELDRCQUExRCxDQUEzQjtXQURxQixFQUVyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLENBQXhCO1dBRnFCLEVBR3JCO1lBQUUsS0FBQSxFQUFRLEtBQVY7WUFBaUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELDZCQUExRCxFQUF5RiwwQkFBekYsQ0FBMUI7V0FIcUIsRUFJckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixFQUEwRCw2QkFBMUQsQ0FBeEI7V0FKcUIsRUFLckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixFQUEwRCxxQ0FBMUQsQ0FBeEI7V0FMcUIsRUFNckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixDQUF4QjtXQU5xQixFQU9yQjtZQUFFLEtBQUEsRUFBUSxLQUFWO1lBQWlCLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixFQUEwRCx5QkFBMUQsQ0FBMUI7V0FQcUIsRUFRckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixFQUEwRCxpREFBMUQsRUFBNkcsdUNBQTdHLENBQXhCO1dBUnFCLEVBU3JCO1lBQUUsS0FBQSxFQUFRLEtBQVY7WUFBaUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELGlEQUExRCxFQUE2Ryw0Q0FBN0csRUFBMkoscUNBQTNKLENBQTFCO1dBVHFCLEVBVXJCO1lBQUUsS0FBQSxFQUFRLEdBQVY7WUFBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQixvQ0FBcEIsRUFBMEQsaURBQTFELEVBQTZHLDRDQUE3RyxDQUF4QjtXQVZxQixFQVdyQjtZQUFFLEtBQUEsRUFBUSxJQUFWO1lBQWdCLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9DQUFwQixFQUEwRCxpREFBMUQsRUFBNkcsNENBQTdHLEVBQTJKLG9DQUEzSixDQUF6QjtXQVhxQixFQVlyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELGlEQUExRCxFQUE2Ryw0Q0FBN0csRUFBMkosNkJBQTNKLENBQXhCO1dBWnFCLEVBYXJCO1lBQUUsS0FBQSxFQUFRLEtBQVY7WUFBaUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELGlEQUExRCxFQUE2Ryw0Q0FBN0csRUFBMkosNkJBQTNKLEVBQTBMLDBCQUExTCxDQUExQjtXQWJxQixFQWNyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLEVBQTBELGlEQUExRCxFQUE2RyxxQ0FBN0csQ0FBeEI7V0FkcUI7U0FBdkI7TUFId0IsQ0FBMUI7SUF2QmlDLENBQW5DO0lBMkNBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBO0FBQzFDLFVBQUE7TUFBQSxJQUFBLEdBQU87TUFDTixTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLElBQXJCO2FBRVgsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUI7UUFDbkI7VUFDRSxPQUFBLEVBQVMsTUFEWDtVQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUiw0QkFIUSxDQUZaO1NBRG1CLEVBU25CO1VBQ0UsT0FBQSxFQUFTLEdBRFg7VUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7U0FUbUIsRUFnQm5CO1VBQ0UsT0FBQSxFQUFTLEtBRFg7VUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IsNkJBSFEsRUFJUiwwQkFKUSxDQUZaO1NBaEJtQixFQXlCbkI7VUFDRSxPQUFBLEVBQVMsR0FEWDtVQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUiw2QkFIUSxDQUZaO1NBekJtQixFQWlDbkI7VUFDRSxPQUFBLEVBQVMsR0FEWDtVQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsRUFHUixxQ0FIUSxDQUZaO1NBakNtQixFQXlDbkI7VUFDRSxPQUFBLEVBQVMsR0FEWDtVQUVFLFFBQUEsRUFBVSxDQUNSLGdCQURRLEVBRVIsb0NBRlEsQ0FGWjtTQXpDbUIsRUFnRG5CO1VBQ0UsT0FBQSxFQUFTLEtBRFg7VUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLEVBR1IseUJBSFEsQ0FGWjtTQWhEbUIsRUF3RG5CO1VBQ0UsT0FBQSxFQUFTLEdBRFg7VUFFRSxRQUFBLEVBQVUsQ0FDUixnQkFEUSxFQUVSLG9DQUZRLENBRlo7U0F4RG1CLEVBK0RuQjtVQUNFLE9BQUEsRUFBUyxLQURYO1VBRUUsUUFBQSxFQUFVLENBQ1IsZ0JBRFEsRUFFUixvQ0FGUSxFQUdSLDZCQUhRLEVBSVIsMEJBSlEsQ0FGWjtTQS9EbUI7T0FBdkI7SUFKMEMsQ0FBNUM7SUE2RUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7TUFDakMsRUFBQSxDQUFHLElBQUgsRUFBUyxTQUFBO0FBQ1AsWUFBQTtRQUFBLElBQUEsR0FBTztRQUNOLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsSUFBckI7UUFDWCxPQUFPLENBQUMsR0FBUixDQUFZLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixFQUF1QixNQUF2QixFQUFrQyxDQUFsQyxDQUFaO2VBQ0EsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUI7VUFDckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLG9CQUFwQixDQUF4QjtXQURxQixFQUVyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsQ0FBeEI7V0FGcUIsRUFHckI7WUFBRSxLQUFBLEVBQVEsSUFBVjtZQUFnQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQixvQ0FBcEIsQ0FBekI7V0FIcUIsRUFJckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLDZCQUFwQixDQUF4QjtXQUpxQixFQUtyQjtZQUFFLEtBQUEsRUFBUSxRQUFWO1lBQW9CLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLDZCQUFwQixFQUFtRCwwQkFBbkQsRUFBK0UsK0JBQS9FLENBQTdCO1dBTHFCLEVBTXJCO1lBQUUsS0FBQSxFQUFRLEdBQVY7WUFBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiw2QkFBcEIsQ0FBeEI7V0FOcUIsRUFPckI7WUFBRSxLQUFBLEVBQVEsSUFBVjtZQUFnQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiwwQkFBcEIsQ0FBekI7V0FQcUIsRUFRckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLENBQXhCO1dBUnFCLEVBU3JCO1lBQUUsS0FBQSxFQUFRLFdBQVY7WUFBdUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0JBQXBCLEVBQTBDLGtDQUExQyxDQUFoQztXQVRxQjtTQUF2QjtNQUpPLENBQVQ7TUFlQSxFQUFBLENBQUcsR0FBSCxFQUFRLFNBQUE7QUFDTixZQUFBO1FBQUEsSUFBQSxHQUFPO1FBQ04sU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixJQUFyQjtlQUVYLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCO1VBQ3JCO1lBQUUsS0FBQSxFQUFRLEdBQVY7WUFBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQixvQkFBcEIsQ0FBeEI7V0FEcUIsRUFFckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLENBQXhCO1dBRnFCLEVBR3JCO1lBQUUsS0FBQSxFQUFRLElBQVY7WUFBZ0IsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0NBQXBCLENBQXpCO1dBSHFCLEVBSXJCO1lBQUUsS0FBQSxFQUFRLEdBQVY7WUFBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiw2QkFBcEIsQ0FBeEI7V0FKcUIsRUFLckI7WUFBRSxLQUFBLEVBQVEsUUFBVjtZQUFvQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQiw2QkFBcEIsRUFBbUQsMEJBQW5ELEVBQStFLCtCQUEvRSxDQUE3QjtXQUxxQixFQU1yQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0IsNkJBQXBCLENBQXhCO1dBTnFCLEVBT3JCO1lBQUUsS0FBQSxFQUFRLEdBQVY7WUFBZSxNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQixxQ0FBcEIsQ0FBeEI7V0FQcUIsRUFRckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLENBQXhCO1dBUnFCLEVBU3JCO1lBQUUsS0FBQSxFQUFRLFdBQVY7WUFBdUIsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isb0JBQXBCLEVBQTBDLGtDQUExQyxDQUFoQztXQVRxQjtTQUF2QjtNQUpNLENBQVI7YUFlQSxFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQTtBQUN2QyxZQUFBO1FBQUEsSUFBQSxHQUFPO1FBQ04sU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixJQUFyQjtlQUNYLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCO1VBQ3JCO1lBQUUsS0FBQSxFQUFRLE1BQVY7WUFBa0IsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELDhCQUE5RCxDQUEzQjtXQURxQixFQUVyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLENBQXhCO1dBRnFCLEVBR3JCO1lBQUUsS0FBQSxFQUFRLElBQVY7WUFBZ0IsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELG9DQUE5RCxDQUF6QjtXQUhxQixFQUlyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELDZCQUE5RCxDQUF4QjtXQUpxQixFQUtyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELDZCQUE5RCxFQUE2RixxQ0FBN0YsQ0FBeEI7V0FMcUIsRUFNckI7WUFBRSxLQUFBLEVBQVEsR0FBVjtZQUFlLE1BQUEsRUFBUyxDQUFFLGdCQUFGLEVBQW9CLHdDQUFwQixFQUE4RCw2QkFBOUQsQ0FBeEI7V0FOcUIsRUFPckI7WUFBRSxLQUFBLEVBQVEsS0FBVjtZQUFpQixNQUFBLEVBQVMsQ0FBRSxnQkFBRixFQUFvQix3Q0FBcEIsRUFBOEQsNkJBQTlELEVBQTZGLDBCQUE3RixDQUExQjtXQVBxQixFQVFyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELDZCQUE5RCxDQUF4QjtXQVJxQixFQVNyQjtZQUFFLEtBQUEsRUFBUSxHQUFWO1lBQWUsTUFBQSxFQUFTLENBQUUsZ0JBQUYsRUFBb0Isd0NBQXBCLEVBQThELDZCQUE5RCxFQUE2RixxQ0FBN0YsQ0FBeEI7V0FUcUI7U0FBdkI7TUFIdUMsQ0FBekM7SUEvQmlDLENBQW5DO0lBOENBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO01BQ3pCLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO0FBQzFCLFlBQUE7UUFBQSxJQUFBLEdBQU87UUFDTixTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLElBQXJCO1FBQ1gsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFqQixDQUF1QixDQUFDLE9BQXhCLENBQWdDLEtBQWhDO2VBQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFqQixDQUF3QixDQUFDLFNBQXpCLENBQW1DLDBCQUFuQztNQUowQixDQUE1QjthQUtBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBO0FBQzlDLFlBQUE7UUFBQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsWUFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsS0FBdEIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsQ0FBRCxDQUFmO1FBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsQ0FBRCxDQUFmO1FBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFDLDBCQUFELEVBQTZCLDZCQUE3QixDQUFKLENBQUQsQ0FBRCxDQUFwQjtRQUVBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1QixZQUF2QjtRQUNKLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLElBQUQsRUFBTyxHQUFQLEVBQVksR0FBWixFQUFpQixHQUFqQixFQUFzQixLQUF0QixFQUE2QixHQUE3QixFQUFrQyxHQUFsQyxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUMsMEJBQUQsRUFBNkIsNkJBQTdCLENBQUosQ0FBRCxDQUFELENBQXBCO1FBRUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLFlBQXZCO1FBQ0osQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWSxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEtBQXRCLEVBQTZCLEdBQTdCLEVBQWtDLEdBQWxDLENBQUQsQ0FBZjtRQUNBLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBZjtRQUNBLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBQywwQkFBRCxFQUE2Qiw2QkFBN0IsQ0FBSixDQUFELENBQUQsQ0FBcEI7UUFFQSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsWUFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsS0FBdEIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsQ0FBRCxDQUFmO1FBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFDLDBCQUFELEVBQTZCLDZCQUE3QixDQUFKLENBQUQsQ0FBRCxDQUFwQjtNQW5COEMsQ0FBaEQ7SUFOeUIsQ0FBM0I7SUEyQkEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtNQUNuQixFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtBQUMxQixZQUFBO1FBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLCtCQUF2QjtRQUNKLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLElBQUQsRUFBTywyQkFBUCxFQUFvQyxJQUFwQyxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQix1QkFBbkIsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFDLG9EQUFELENBQUosQ0FBRCxFQUNDLENBQUMsQ0FBRCxFQUFJLENBQUMsa0RBQUQsQ0FBSixDQURELENBQUQsQ0FBcEI7TUFKMEIsQ0FBNUI7TUFPQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQTtBQUNqQyxZQUFBO1FBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLDRDQUF2QjtRQUNKLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLElBQUQsRUFBTyxhQUFQLEVBQXNCLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLElBQXhDLEVBQThDLGlCQUE5QyxFQUFpRSxJQUFqRSxDQUFELENBQWY7UUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQix1QkFBbkIsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFDLG9EQUFELENBQUosQ0FBRCxFQUNDLENBQUMsQ0FBRCxFQUFJLENBQUMsb0RBQUQsQ0FBSixDQURELEVBRUMsQ0FBQyxDQUFELEVBQUksQ0FBQyxrREFBRCxDQUFKLENBRkQsRUFHQyxDQUFDLENBQUQsRUFBSSxDQUFDLGtEQUFELENBQUosQ0FIRCxDQUFELENBQXBCO01BSmlDLENBQW5DO2FBU0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7QUFDakQsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1Qiw4Q0FBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxJQUFELEVBQU8sYUFBUCxFQUFzQixJQUF0QixFQUE0QixZQUE1QixFQUEwQyxJQUExQyxFQUFnRCxpQkFBaEQsRUFBbUUsSUFBbkUsQ0FBRCxDQUFmO1FBQ0EsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsZ0JBQUQsRUFBbUIsdUJBQW5CLENBQUQsQ0FBZjtlQUNBLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBQyxvREFBRCxDQUFKLENBQUQsRUFDQyxDQUFDLENBQUQsRUFBSSxDQUFDLG9EQUFELENBQUosQ0FERCxFQUVDLENBQUMsQ0FBRCxFQUFJLENBQUMsa0RBQUQsQ0FBSixDQUZELEVBR0MsQ0FBQyxDQUFELEVBQUksQ0FBQyxrREFBRCxDQUFKLENBSEQsQ0FBRCxDQUFwQjtNQUppRCxDQUFuRDtJQWpCbUIsQ0FBckI7V0F5QkEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtNQUNuQixFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQTtBQUN6QixZQUFBO1FBQUEsQ0FBQSxHQUFJLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLHNCQUF2QjtRQUNKLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLFVBQUQsRUFBYSxHQUFiLEVBQWtCLE9BQWxCLEVBQTJCLEdBQTNCLEVBQWdDLE9BQWhDLENBQUQsQ0FBZjtRQUNBLENBQUMsQ0FBQyxZQUFGLENBQWUsQ0FBQyxDQUFDLGdCQUFELEVBQW1CLG1DQUFuQixDQUFELENBQWY7ZUFDQSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUMsNkJBQUQsQ0FBSixDQUFELEVBQ0MsQ0FBQyxDQUFELEVBQUksQ0FBQyw2QkFBRCxFQUFnQywwQkFBaEMsQ0FBSixDQURELEVBRUMsQ0FBQyxDQUFELEVBQUksQ0FBQyw2QkFBRCxDQUFKLENBRkQsRUFHQyxDQUFDLENBQUQsRUFBSSxDQUFDLHVCQUFELENBQUosQ0FIRCxDQUFELENBQXBCO01BSnlCLENBQTNCO2FBU0EsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUE7QUFDaEMsWUFBQTtBQUFBO0FBQUE7YUFBQSxzQ0FBQTs7VUFDRSxDQUFBLEdBQUksYUFBQSxDQUFjLE9BQWQsRUFBdUIsZUFBQSxHQUFnQixDQUFoQixHQUFrQixrQkFBekM7VUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxVQUFELEVBQWEsR0FBYixFQUFrQixLQUFsQixFQUF5QixHQUF6QixFQUE4QixDQUE5QixFQUFpQyxHQUFqQyxFQUFzQyxLQUF0QyxFQUE2QyxHQUE3QyxFQUFrRCxPQUFsRCxFQUEyRCxHQUEzRCxFQUFnRSxPQUFoRSxDQUFELENBQWY7VUFDQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQixtQ0FBbkIsQ0FBRCxDQUFmO3VCQUNBLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBQywyQkFBRCxDQUFKLENBQUQsRUFDQyxDQUFDLENBQUQsRUFBSSxDQUFDLDJCQUFELENBQUosQ0FERCxFQUVDLENBQUMsQ0FBRCxFQUFJLENBQUMsMkJBQUQsRUFBOEIsb0NBQTlCLENBQUosQ0FGRCxFQUdDLENBQUMsQ0FBRCxFQUFJLENBQUMsMkJBQUQsQ0FBSixDQUhELEVBSUMsQ0FBQyxDQUFELEVBQUksQ0FBQywyQkFBRCxDQUFKLENBSkQsQ0FBRCxDQUFwQjtBQUpGOztNQURnQyxDQUFsQztJQVZtQixDQUFyQjtFQXJhMkIsQ0FBN0I7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntncmFtbWFyRXhwZWN0LCBjdXN0b21NYXRjaGVyc30gPSByZXF1aXJlICcuL3V0aWwnXG5cbmRlc2NyaWJlIFwiTGFuZ3VhZ2UtSGFza2VsbFwiLCAtPlxuICBncmFtbWFyID0gbnVsbFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBAYWRkTWF0Y2hlcnMoY3VzdG9tTWF0Y2hlcnMpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcImxhbmd1YWdlLWhhc2tlbGxcIilcblxuICAgIHJ1bnMgLT5cbiAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoXCJzb3VyY2UuaGFza2VsbFwiKVxuXG4gIGl0IFwicGFyc2VzIHRoZSBncmFtbWFyXCIsIC0+XG4gICAgZXhwZWN0KGdyYW1tYXIpLnRvQmVUcnV0aHkoKVxuICAgIGV4cGVjdChncmFtbWFyLnNjb3BlTmFtZSkudG9CZSBcInNvdXJjZS5oYXNrZWxsXCJcblxuICBkZXNjcmliZSBcImNoYXJzXCIsIC0+XG4gICAgaXQgJ3Rva2VuaXplcyBnZW5lcmFsIGNoYXJzJywgLT5cbiAgICAgIGNoYXJzID0gWydhJywgJzAnLCAnOScsICd6JywgJ0AnLCAnMCcsICdcIiddXG5cbiAgICAgIGZvciBzY29wZSwgY2hhciBvZiBjaGFyc1xuICAgICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwiJ1wiICsgY2hhciArIFwiJ1wiKVxuICAgICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsIFtcbiAgICAgICAgICB7dmFsdWU6XCInXCIsIHNjb3BlczogW1wic291cmNlLmhhc2tlbGxcIiwgJ3N0cmluZy5xdW90ZWQuc2luZ2xlLmhhc2tlbGwnLCBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGxcIl19XG4gICAgICAgICAge3ZhbHVlOiBjaGFyLCBzY29wZXM6IFtcInNvdXJjZS5oYXNrZWxsXCIsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJ119XG4gICAgICAgICAge3ZhbHVlOlwiJ1wiLCBzY29wZXM6IFtcInNvdXJjZS5oYXNrZWxsXCIsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJywgXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuaGFza2VsbFwiXX1cbiAgICAgICAgXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBlc2NhcGUgY2hhcnMnLCAtPlxuICAgICAgZXNjYXBlQ2hhcnMgPSBbJ1xcXFx0JywgJ1xcXFxuJywgJ1xcXFxcXCcnXVxuICAgICAgZm9yIHNjb3BlLCBjaGFyIG9mIGVzY2FwZUNoYXJzXG4gICAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCInXCIgKyBjaGFyICsgXCInXCIpXG4gICAgICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICAgIHt2YWx1ZTpcIidcIiwgc2NvcGVzOiBbXCJzb3VyY2UuaGFza2VsbFwiLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCcsIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbFwiXX1cbiAgICAgICAgICB7dmFsdWU6IGNoYXIsIHNjb3BlczogW1wic291cmNlLmhhc2tlbGxcIiwgJ3N0cmluZy5xdW90ZWQuc2luZ2xlLmhhc2tlbGwnLCAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oYXNrZWxsJ119XG4gICAgICAgICAge3ZhbHVlOlwiJ1wiLCBzY29wZXM6IFtcInNvdXJjZS5oYXNrZWxsXCIsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJywgXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuaGFza2VsbFwiXX1cbiAgICAgICAgXVxuICAgIGl0ICd0b2tlbml6ZXMgY29udHJvbCBjaGFycycsIC0+XG4gICAgICBlc2NhcGVDaGFycyA9IFs2NC4uOTVdLm1hcCAoeCkgLT4gXCJcXFxcXiN7U3RyaW5nLmZyb21DaGFyQ29kZSh4KX1cIlxuICAgICAgZm9yIHNjb3BlLCBjaGFyIG9mIGVzY2FwZUNoYXJzXG4gICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIFwiJyN7Y2hhcn0nXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1tcIidcIiwgY2hhciwgXCInXCJdXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsIFwic3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbFwiXV1cbiAgICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbWyBbMSwgW1wiY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5jb250cm9sLmhhc2tlbGxcIl1dIF1dXG5cbiAgZGVzY3JpYmUgXCJzdHJpbmdzXCIsIC0+XG4gICAgaXQgXCJ0b2tlbml6ZXMgc2luZ2xlLWxpbmUgc3RyaW5nc1wiLCAtPlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZSAnXCJhYmNkZVxcXFxuXFxcXEVPVFxcXFxFT0xcIidcbiAgICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgIFtcbiAgICAgICAgeyB2YWx1ZSA6ICdcIicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnYWJjZGUnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdcXFxcbicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdcXFxcRU9UJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbCcsICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ1xcXFxFT0wnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdcIicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGwnIF0gfVxuICAgICAgXVxuICAgIGl0IFwiUmVncmVzc2lvbiB0ZXN0IGZvciA5NlwiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ1wiXlxcXFxcXFxcIFwiJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1tcIlxcXCJcIiwgXCJeXCIsIFwiXFxcXFxcXFxcIiwgXCIgXCIsIFwiXFxcIlwiXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgXCJzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsXCJdXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbWyBbMiwgW1wiY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oYXNrZWxsXCJdXSBdXVxuICAgIGl0IFwiU3VwcG9ydHMgdHlwZS1sZXZlbCBzdHJpbmcgbGl0ZXJhbHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICc6OiBcInR5cGUtbGV2ZWwgc3RyaW5nXCInXG4gICAgICBnLnRvSGF2ZVRva2VucyBbW1wiOjpcIiwgXCIgXCIsIFwiXFxcIlwiLCBcInR5cGUtbGV2ZWwgc3RyaW5nXCIsIFwiXFxcIlwiXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbIFszLCBbXCJzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsXCJdXSBdXVxuXG5cbiAgZGVzY3JpYmUgXCJiYWNrdGljayBmdW5jdGlvbiBjYWxsXCIsIC0+XG4gICAgaXQgXCJmaW5kcyBiYWNrdGljayBmdW5jdGlvbiBuYW1lc1wiLCAtPlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcIlxcYGZ1bmNcXGBcIilcbiAgICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICdgJywgc2NvcGVzOiBbJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IuZnVuY3Rpb24uaW5maXguaGFza2VsbCcsJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uZW50aXR5Lmhhc2tlbGwnXVxuICAgICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ2Z1bmMnLCBzY29wZXM6IFsnc291cmNlLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5mdW5jdGlvbi5pbmZpeC5oYXNrZWxsJ11cbiAgICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICdgJywgc2NvcGVzOiBbJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IuZnVuY3Rpb24uaW5maXguaGFza2VsbCcsJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uZW50aXR5Lmhhc2tlbGwnXVxuXG4gIGRlc2NyaWJlIFwia2V5d29yZHNcIiwgLT5cbiAgICBjb250cm9sS2V5d29yZHMgPSBbJ2Nhc2UnLCAnb2YnLCAnaW4nLCAnd2hlcmUnLCAnaWYnLCAndGhlbicsICdlbHNlJ11cblxuICAgIGZvciBzY29wZSwga2V5d29yZCBvZiBjb250cm9sS2V5d29yZHNcbiAgICAgIGl0IFwidG9rZW5pemVzICN7a2V5d29yZH0gYXMgYSBrZXl3b3JkXCIsIC0+XG4gICAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoa2V5d29yZClcbiAgICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZToga2V5d29yZCwgc2NvcGVzOiBbJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQuY29udHJvbC5oYXNrZWxsJ11cblxuICBkZXNjcmliZSBcIm9wZXJhdG9yc1wiLCAtPlxuICAgIGl0IFwidG9rZW5pemVzIHRoZSAvIGFyaXRobWV0aWMgb3BlcmF0b3Igd2hlbiBzZXBhcmF0ZWQgYnkgbmV3bGluZXNcIiwgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzIFwiXCJcIlxuICAgICAgICAxXG4gICAgICAgIC8gMlxuICAgICAgXCJcIlwiXG4gICAgICBleHBlY3QobGluZXMpLnRvRXF1YWwgIFtcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7IHZhbHVlIDogJzEnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdjb25zdGFudC5udW1lcmljLmRlY2ltYWwuaGFza2VsbCcgXSB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7IHZhbHVlIDogJy8nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnIF0gfVxuICAgICAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnIF0gfVxuICAgICAgICAgICAgeyB2YWx1ZSA6ICcyJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnY29uc3RhbnQubnVtZXJpYy5kZWNpbWFsLmhhc2tlbGwnIF0gfVxuICAgICAgICAgIF1cbiAgICAgICAgXVxuXG4gIGRlc2NyaWJlIFwiaWRzXCIsIC0+XG4gICAgaXQgJ2hhbmRsZXMgdHlwZV9pZHMnLCAtPlxuICAgICAgdHlwZUlkcyA9IFsnQ2hhcicsICdEYXRhJywgJ0xpc3QnLCAnSW50JywgJ0ludGVncmFsJywgJ0Zsb2F0JywgJ0RhdGUnXVxuXG4gICAgICBmb3Igc2NvcGUsIGlkIG9mIHR5cGVJZHNcbiAgICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShpZClcbiAgICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogaWQsIHNjb3BlczogWydzb3VyY2UuaGFza2VsbCcsICdlbnRpdHkubmFtZS50YWcuaGFza2VsbCddXG5cbiAgZGVzY3JpYmUgXCJpZGVudGlmaWVyc1wiLCAtPlxuICAgIGl0ICdkb2VzbnQgaGlnaGxpZ2h0IHBhcnRpYWwgcHJlbHVkZSBuYW1lcycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCBcInRvcCduJ3RhaWxcIilcbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ2lkZW50aWZpZXIuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgXCJ0b3Anbid0YWlsXCIgOiBbICdpZGVudGlmaWVyLmhhc2tlbGwnIF1dXG4gICAgICBdXG5cbiAgZGVzY3JpYmUgJzo6IGRlY2xhcmF0aW9ucycsIC0+XG4gICAgaXQgJ3BhcnNlcyBuZXdsaW5lIGRlY2xhcmF0aW9ucycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCAnZnVuY3Rpb24gOjogVHlwZSAtPiBPdGhlclR5cGUnKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbICdmdW5jdGlvbicgOiBbICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJzo6JyA6IFsgJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnVHlwZScgOiBbICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJy0+JyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmFycm93Lmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnT3RoZXJUeXBlJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnIF1cbiAgICAgICAgXV1cblxuICAgIGl0ICdwYXJzZXMgaW4tbGluZSBwYXJlbnRoZXNpc2VkIGRlY2xhcmF0aW9ucycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCAnbWFpbiA9IChwdXRTdHJMbiA6OiBTdHJpbmcgLT4gSU8gKCkpIChcIkhlbGxvIFdvcmxkXCIgOjogU3RyaW5nKScpXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgXCJtYWluXCIgOiBbJ2lkZW50aWZpZXIuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIj1cIiA6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiKFwiXG4gICAgICAgICwgXCJwdXRTdHJMblwiIDogWydzdXBwb3J0LmZ1bmN0aW9uLnByZWx1ZGUuaGFza2VsbCcgXVxuICAgICAgICAsIFwiIFwiXG4gICAgICAgICwgXCI6OlwiIDogWydrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiU3RyaW5nXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIi0+XCIgOiBbJ2tleXdvcmQub3RoZXIuYXJyb3cuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIklPXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIigpXCIgOiBbJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgICAsIFwiKVwiXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIihcIlxuICAgICAgICAsIFwiXFxcIlwiXG4gICAgICAgICwgXCJIZWxsbyBXb3JsZFwiIDogWydzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJ11cbiAgICAgICAgLCBcIlxcXCJcIlxuICAgICAgICAsIFwiIFwiXG4gICAgICAgICwgXCI6OlwiIDogWydrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiU3RyaW5nXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIpXCJcbiAgICAgICAgXVxuICAgICAgXVxuXG4gICAgaXQgJ2RvZXNudCBnZXQgY29uZnVzZWQgYnkgcXVvdGVkIDo6JywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICcoXCJ4IDo6IFN0cmluZyAtPiBJTyAoKVwiICsrIHZhciknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbIFwiKFwiXG4gICAgICAgICwgXCJcXFwiXCJcbiAgICAgICAgLCBcInggOjogU3RyaW5nIC0+IElPICgpXCIgOiBbJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnXVxuICAgICAgICAsIFwiXFxcIlwiXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIisrXCIgOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcInZhclwiIDogWydpZGVudGlmaWVyLmhhc2tlbGwnXVxuICAgICAgICAsIFwiKVwiXG4gICAgICAgIF1cbiAgICAgIF1cblxuICAgIGl0ICdwYXJzZXMgaW4tbGluZSBub24tcGFyZW50aGVzaXNlZCBkZWNsYXJhdGlvbnMnLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgJ21haW4gPSBwdXRTdHJMbiBcIkhlbGxvIFdvcmxkXCIgOjogSU8gKCknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbICdtYWluJyA6IFsgJ2lkZW50aWZpZXIuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICc9JyA6IFsgJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICdwdXRTdHJMbicgOiBbICdpZGVudGlmaWVyLmhhc2tlbGwnLCAnc3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCB7J1wiJyA6IFsgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbCcgXX1cbiAgICAgICAgLCB7J0hlbGxvIFdvcmxkJyA6IFsgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnIF19XG4gICAgICAgICwgeydcIicgOiBbICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJyBdfVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICc6OicgOiBbICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJ0lPJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLCAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnKCknIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgICBdXG4gICAgICBdXG5cbiAgZGVzY3JpYmUgJ3JlZ3Jlc3Npb24gdGVzdCBmb3IgNjUnLCAtPlxuICAgIGl0ICd3b3JrcyB3aXRoIHNwYWNlJywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICdkYXRhIEZvbyA9IEZvbyB7YmFyIDo6IEJhcn0nKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgJ2RhdGEnIDogWyAna2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnRm9vJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICcgOiBbICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnPScgOiBbICdrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICdGb28nIDogWyAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAneycgOiBbICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5iZWdpbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJ2JhcicgOiBbICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnOjonIDogWyAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXVxuICAgICAgICAsICcgJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXVxuICAgICAgICAsICdCYXInIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXVxuICAgICAgICAsICd9JyA6IFsgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLnJlY29yZC5ibG9jay5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmVuZC5oYXNrZWxsJyBdXG4gICAgICAgIF1cbiAgICAgIF1cblxuICAgIGl0ICd3b3JrcyB3aXRob3V0IHNwYWNlJywgLT5cbiAgICAgIGRhdGEgPSAnZGF0YSBGb28gPSBGb297YmFyIDo6IEJhcn0nXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsIFtcbiAgICAgICAgeyB2YWx1ZSA6ICdkYXRhJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmRhdGEuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ0ZvbycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc9Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ0ZvbycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ3snLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLnJlY29yZC5ibG9jay5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmJlZ2luLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ2JhcicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAnbWV0YS5yZWNvcmQtZmllbGQudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ2VudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJzo6Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAnbWV0YS5yZWNvcmQtZmllbGQudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnQmFyJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnfScsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5yZWNvcmQuZW5kLmhhc2tlbGwnIF0gfVxuICAgICAgXVxuXG4gIGl0IFwicHJvcGVybHkgaGlnaGxpZ2h0cyBkYXRhIGRlY2xhcmF0aW9uc1wiLCAtPlxuICAgIGRhdGEgPSAnZGF0YSBGb28gPSBGb28gQmFyJ1xuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoZGF0YSlcbiAgICAjIGNvbnNvbGUubG9nIEpTT04uc3RyaW5naWZ5KHRva2VucywgdW5kZWZpbmVkLCAyKVxuICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcImRhdGFcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwia2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCJGb29cIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lLnR5cGUuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsXCJcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInZhbHVlXCI6IFwiPVwiLFxuICAgICAgICAgIFwic2NvcGVzXCI6IFtcbiAgICAgICAgICAgIFwic291cmNlLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCJGb29cIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwiZW50aXR5Lm5hbWUudGFnLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCIgXCIsXG4gICAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgICAgXCJzb3VyY2UuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsXCJcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInZhbHVlXCI6IFwiQmFyXCIsXG4gICAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgICAgXCJzb3VyY2UuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbFwiXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lLnR5cGUuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gIGRlc2NyaWJlIFwicmVncmVzc2lvbiB0ZXN0IGZvciA3MVwiLCAtPlxuICAgIGl0IFwiPC1cIiwgLT5cbiAgICAgIGRhdGEgPSBcInggOjogU3RyaW5nIDwtIHVuZGVmaW5lZFwiXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICBjb25zb2xlLmxvZyBKU09OLnN0cmluZ2lmeSh0b2tlbnMsIHVuZGVmaW5lZCwgMilcbiAgICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICB7IHZhbHVlIDogJ3gnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdpZGVudGlmaWVyLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnOjonLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdTdHJpbmcnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJywgJ3N1cHBvcnQuY2xhc3MucHJlbHVkZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc8LScsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICd1bmRlZmluZWQnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdpZGVudGlmaWVyLmhhc2tlbGwnLCAnc3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLmhhc2tlbGwnIF0gfVxuICAgICAgICBdXG4gICAgaXQgXCI9XCIsIC0+XG4gICAgICBkYXRhID0gXCJ4IDo6IFN0cmluZyA9IHVuZGVmaW5lZFwiXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICAjIGNvbnNvbGUubG9nIEpTT04uc3RyaW5naWZ5KHRva2VucywgdW5kZWZpbmVkLCAyKVxuICAgICAgZXhwZWN0KHRva2VucykudG9FcXVhbCBbXG4gICAgICAgIHsgdmFsdWUgOiAneCcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ2lkZW50aWZpZXIuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc6OicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ1N0cmluZycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLCAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJz0nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICd1bmRlZmluZWQnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdpZGVudGlmaWVyLmhhc2tlbGwnLCAnc3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLmhhc2tlbGwnIF0gfVxuICAgICAgICBdXG4gICAgaXQgXCJzdGlsbCB3b3JrcyBmb3IgdHlwZS1vcCBzaWduYXR1cmVzXCIsIC0+XG4gICAgICBkYXRhID0gXCJzbXRoIDo6IGEgPC0tIGJcIlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShkYXRhKVxuICAgICAgZXhwZWN0KHRva2VucykudG9FcXVhbCBbXG4gICAgICAgIHsgdmFsdWUgOiAnc210aCcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnOjonLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdhJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ3ZhcmlhYmxlLm90aGVyLmdlbmVyaWMtdHlwZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc8LS0nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdiJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ3ZhcmlhYmxlLm90aGVyLmdlbmVyaWMtdHlwZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgXVxuXG4gIGRlc2NyaWJlIFwidHlwZSBvcGVyYXRvcnNcIiwgLT5cbiAgICBpdCBcInBhcnNlcyB0eXBlIG9wZXJhdG9yc1wiLCAtPlxuICAgICAgZGF0YSA9IFwiOjogYSAqKiogYlwiXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICBleHBlY3QodG9rZW5zWzRdLnZhbHVlKS50b0VxdWFsICcqKionXG4gICAgICBleHBlY3QodG9rZW5zWzRdLnNjb3BlcykudG9Db250YWluICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXG4gICAgaXQgXCJkb2Vzbid0IGNvbmZ1c2UgYXJyb3dzIGFuZCB0eXBlIG9wZXJhdG9yc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgXCI6OiBhIC0tPiBiXCIpXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyc6OicsICcgJywgJ2EnLCAnICcsICctLT4nLCAnICcsICdiJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1s0LCBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXV1dXVxuXG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCBcIjo6IGEgLT4tIGJcIilcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJzo6JywgJyAnLCAnYScsICcgJywgJy0+LScsICcgJywgJ2InXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzQsIFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXV1dXG5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwiOjogYSA9PT4gYlwiKVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1snOjonLCAnICcsICdhJywgJyAnLCAnPT0+JywgJyAnLCAnYiddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbNCwgWydrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXV1cblxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgXCI6OiBhID0+PSBiXCIpXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyc6OicsICcgJywgJ2EnLCAnICcsICc9Pj0nLCAnICcsICdiJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1s0LCBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXV1dXVxuXG4gIGRlc2NyaWJlIFwiY29tbWVudHNcIiwgLT5cbiAgICBpdCBcInBhcnNlcyBibG9jayBjb21tZW50c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJ7LSB0aGlzIGlzIGEgYmxvY2sgY29tbWVudCAtfVwiXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LScsICcgdGhpcyBpcyBhIGJsb2NrIGNvbW1lbnQgJywgJy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdjb21tZW50LmJsb2NrLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbMCwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suc3RhcnQuaGFza2VsbCddXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMiwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXV1dXVxuXG4gICAgaXQgXCJwYXJzZXMgbmVzdGVkIGJsb2NrIGNvbW1lbnRzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBcInstIHRoaXMgaXMgYSB7LSBuZXN0ZWQgLX0gYmxvY2sgY29tbWVudCAtfVwiXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyd7LScsICcgdGhpcyBpcyBhICcsICd7LScsICcgbmVzdGVkICcsICctfScsICcgYmxvY2sgY29tbWVudCAnLCAnLX0nXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ2NvbW1lbnQuYmxvY2suaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1swLCBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzIsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNCwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNiwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXV1dXVxuXG4gICAgaXQgXCJwYXJzZXMgcHJhZ21hcyBhcyBjb21tZW50cyBpbiBibG9jayBjb21tZW50c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ3stIHRoaXMgaXMgYSB7LSMgbmVzdGVkICMtfSBibG9jayBjb21tZW50IC19J1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1sney0nLCAnIHRoaXMgaXMgYSAnLCAney0nLCAnIyBuZXN0ZWQgIycsICctfScsICcgYmxvY2sgY29tbWVudCAnLCAnLX0nXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ2NvbW1lbnQuYmxvY2suaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1swLCBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzIsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNCwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNiwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXV1dXVxuICBkZXNjcmliZSBcImluc3RhbmNlXCIsIC0+XG4gICAgaXQgXCJyZWNvZ25pemVzIGluc3RhbmNlc1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ2luc3RhbmNlIENsYXNzIHdoZXJlJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snaW5zdGFuY2UnLCAnICcsICdDbGFzcycsICcgJywgJ3doZXJlJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbMSwgWydtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMiwgWydtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzMsIFsnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzQsIFsna2V5d29yZC5vdGhlci5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICBpdCBcInJlY29nbml6ZXMgaW5zdGFuY2UgcHJhZ21hc1wiLCAtPlxuICAgICAgZm9yIHAgaW4gWyAnT1ZFUkxBUFMnLCAnT1ZFUkxBUFBJTkcnLCAnT1ZFUkxBUFBBQkxFJywgJ0lOQ09IRVJFTlQnIF1cbiAgICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJpbnN0YW5jZSB7LSMgI3twfSAjLX0gQ2xhc3Mgd2hlcmVcIlxuICAgICAgICBnLnRvSGF2ZVRva2VucyBbWydpbnN0YW5jZScsICcgJywgJ3stIycsICcgJywgcCwgJyAnLCAnIy19JywgJyAnLCAnQ2xhc3MnLCAnICcsICd3aGVyZSddXVxuICAgICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmhhc2tlbGwnXV1cbiAgICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1syLCBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFszLCBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs0LCBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5wcmVwcm9jZXNzb3IuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzUsIFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzYsIFsnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXV1cbiJdfQ==
