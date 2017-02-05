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
    describe("instance", function() {
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
    return describe("module", function() {
      it("understands module declarations", function() {
        var g;
        g = grammarExpect(grammar, 'module Module where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([[[2, ['support.other.module.haskell']]]]);
      });
      it("understands module declarations with exports", function() {
        var g;
        g = grammarExpect(grammar, 'module Module (export1, export2) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', 'export1', ',', ' ', 'export2', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([[[2, ['support.other.module.haskell']], [5, ['meta.declaration.exports.haskell', 'entity.name.function.haskell']], [8, ['meta.declaration.exports.haskell', 'entity.name.function.haskell']]]]);
      });
      it("understands module declarations with operator exports", function() {
        var g;
        g = grammarExpect(grammar, 'module Module ((<|>), export2) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', '(<|>)', ',', ' ', 'export2', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([[[2, ['support.other.module.haskell']], [5, ['meta.declaration.exports.haskell', 'entity.name.function.infix.haskell']], [8, ['meta.declaration.exports.haskell', 'entity.name.function.haskell']]]]);
      });
      return it("understands module declarations with export lists", function() {
        var g;
        g = grammarExpect(grammar, 'module Module (export1 (..), export2 (Something)) where');
        g.toHaveTokens([['module', ' ', 'Module', ' ', '(', 'export1', ' (', '..', ')', ',', ' ', 'export2', ' (', 'Something', ')', ')', ' ', 'where']]);
        g.toHaveScopes([['source.haskell', 'meta.declaration.module.haskell']]);
        return g.tokenToHaveScopes([[[2, ['support.other.module.haskell']], [5, ['meta.declaration.exports.haskell', 'entity.name.function.haskell']], [7, ['meta.declaration.exports.haskell', 'meta.other.constructor-list.haskell', 'keyword.operator.wildcard.haskell']], [11, ['meta.declaration.exports.haskell', 'entity.name.function.haskell']], [13, ['meta.declaration.exports.haskell', 'meta.other.constructor-list.haskell', 'entity.name.tag.haskell']]]]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9sYW5ndWFnZS1oYXNrZWxsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFrQyxPQUFBLENBQVEsUUFBUixDQUFsQyxFQUFDLGlDQUFELEVBQWdCOztFQUVoQixRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsV0FBRCxDQUFhLGNBQWI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCO01BRGMsQ0FBaEI7YUFHQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGdCQUFsQztNQURQLENBQUw7SUFMUyxDQUFYO0lBUUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7TUFDdkIsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixnQkFBL0I7SUFGdUIsQ0FBekI7SUFJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO01BQ2hCLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxLQUFBLEdBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0I7QUFFUjthQUFBLGNBQUE7O1VBQ0csU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixHQUFBLEdBQU0sSUFBTixHQUFhLEdBQWxD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QUFHLG1EQUFILEVBQXdELFNBQUE7QUFDdEQsWUFBQTtRQUFBLENBQUEsR0FBSSxhQUFBLENBQWMsT0FBZCxFQUF1Qix5REFBdkI7UUFDSixDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxRQUFELEVBQVcsR0FBWCxFQUFnQixRQUFoQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxTQUFwQyxFQUErQyxJQUEvQyxFQUFzRCxJQUF0RCxFQUE0RCxHQUE1RCxFQUNDLEdBREQsRUFDTSxHQUROLEVBQ1csU0FEWCxFQUNzQixJQUR0QixFQUM0QixXQUQ1QixFQUN5QyxHQUR6QyxFQUM4QyxHQUQ5QyxFQUNtRCxHQURuRCxFQUN3RCxPQUR4RCxDQUFELENBQWY7UUFFQSxDQUFDLENBQUMsWUFBRixDQUFlLENBQUMsQ0FBQyxnQkFBRCxFQUFtQixpQ0FBbkIsQ0FBRCxDQUFmO2VBQ0EsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFDLDhCQUFELENBQUosQ0FBRCxFQUNDLENBQUMsQ0FBRCxFQUFJLENBQUMsa0NBQUQsRUFBcUMsOEJBQXJDLENBQUosQ0FERCxFQUVDLENBQUMsQ0FBRCxFQUFJLENBQUMsa0NBQUQsRUFBcUMscUNBQXJDLEVBQ0MsbUNBREQsQ0FBSixDQUZELEVBSUMsQ0FBQyxFQUFELEVBQUssQ0FBQyxrQ0FBRCxFQUFxQyw4QkFBckMsQ0FBTCxDQUpELEVBS0MsQ0FBQyxFQUFELEVBQUssQ0FBQyxrQ0FBRCxFQUFxQyxxQ0FBckMsRUFDQyx5QkFERCxDQUFMLENBTEQsQ0FBRCxDQUFwQjtNQUxzRCxDQUF4RDtJQXRCaUIsQ0FBbkI7RUF6YjJCLENBQTdCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z3JhbW1hckV4cGVjdCwgY3VzdG9tTWF0Y2hlcnN9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG5kZXNjcmliZSBcIkxhbmd1YWdlLUhhc2tlbGxcIiwgLT5cbiAgZ3JhbW1hciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgQGFkZE1hdGNoZXJzKGN1c3RvbU1hdGNoZXJzKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJsYW5ndWFnZS1oYXNrZWxsXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKFwic291cmNlLmhhc2tlbGxcIilcblxuICBpdCBcInBhcnNlcyB0aGUgZ3JhbW1hclwiLCAtPlxuICAgIGV4cGVjdChncmFtbWFyKS50b0JlVHJ1dGh5KClcbiAgICBleHBlY3QoZ3JhbW1hci5zY29wZU5hbWUpLnRvQmUgXCJzb3VyY2UuaGFza2VsbFwiXG5cbiAgZGVzY3JpYmUgXCJjaGFyc1wiLCAtPlxuICAgIGl0ICd0b2tlbml6ZXMgZ2VuZXJhbCBjaGFycycsIC0+XG4gICAgICBjaGFycyA9IFsnYScsICcwJywgJzknLCAneicsICdAJywgJzAnLCAnXCInXVxuXG4gICAgICBmb3Igc2NvcGUsIGNoYXIgb2YgY2hhcnNcbiAgICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcIidcIiArIGNoYXIgKyBcIidcIilcbiAgICAgICAgZXhwZWN0KHRva2VucykudG9FcXVhbCBbXG4gICAgICAgICAge3ZhbHVlOlwiJ1wiLCBzY29wZXM6IFtcInNvdXJjZS5oYXNrZWxsXCIsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJywgXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5oYXNrZWxsXCJdfVxuICAgICAgICAgIHt2YWx1ZTogY2hhciwgc2NvcGVzOiBbXCJzb3VyY2UuaGFza2VsbFwiLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCddfVxuICAgICAgICAgIHt2YWx1ZTpcIidcIiwgc2NvcGVzOiBbXCJzb3VyY2UuaGFza2VsbFwiLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCcsIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGxcIl19XG4gICAgICAgIF1cblxuICAgIGl0ICd0b2tlbml6ZXMgZXNjYXBlIGNoYXJzJywgLT5cbiAgICAgIGVzY2FwZUNoYXJzID0gWydcXFxcdCcsICdcXFxcbicsICdcXFxcXFwnJ11cbiAgICAgIGZvciBzY29wZSwgY2hhciBvZiBlc2NhcGVDaGFyc1xuICAgICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwiJ1wiICsgY2hhciArIFwiJ1wiKVxuICAgICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsIFtcbiAgICAgICAgICB7dmFsdWU6XCInXCIsIHNjb3BlczogW1wic291cmNlLmhhc2tlbGxcIiwgJ3N0cmluZy5xdW90ZWQuc2luZ2xlLmhhc2tlbGwnLCBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGxcIl19XG4gICAgICAgICAge3ZhbHVlOiBjaGFyLCBzY29wZXM6IFtcInNvdXJjZS5oYXNrZWxsXCIsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJywgJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuaGFza2VsbCddfVxuICAgICAgICAgIHt2YWx1ZTpcIidcIiwgc2NvcGVzOiBbXCJzb3VyY2UuaGFza2VsbFwiLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCcsIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGxcIl19XG4gICAgICAgIF1cbiAgICBpdCAndG9rZW5pemVzIGNvbnRyb2wgY2hhcnMnLCAtPlxuICAgICAgZXNjYXBlQ2hhcnMgPSBbNjQuLjk1XS5tYXAgKHgpIC0+IFwiXFxcXF4je1N0cmluZy5mcm9tQ2hhckNvZGUoeCl9XCJcbiAgICAgIGZvciBzY29wZSwgY2hhciBvZiBlc2NhcGVDaGFyc1xuICAgICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCBcIicje2NoYXJ9J1wiXG4gICAgICAgIGcudG9IYXZlVG9rZW5zIFtbXCInXCIsIGNoYXIsIFwiJ1wiXV1cbiAgICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCBcInN0cmluZy5xdW90ZWQuc2luZ2xlLmhhc2tlbGxcIl1dXG4gICAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1sgWzEsIFtcImNvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuY29udHJvbC5oYXNrZWxsXCJdXSBdXVxuXG4gIGRlc2NyaWJlIFwic3RyaW5nc1wiLCAtPlxuICAgIGl0IFwidG9rZW5pemVzIHNpbmdsZS1saW5lIHN0cmluZ3NcIiwgLT5cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUgJ1wiYWJjZGVcXFxcblxcXFxFT1RcXFxcRU9MXCInXG4gICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsICBbXG4gICAgICAgIHsgdmFsdWUgOiAnXCInLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ2FiY2RlJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnXFxcXG4nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJywgJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnXFxcXEVPVCcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdcXFxcRU9MJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnXCInLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJyBdIH1cbiAgICAgIF1cbiAgICBpdCBcIlJlZ3Jlc3Npb24gdGVzdCBmb3IgOTZcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdcIl5cXFxcXFxcXCBcIidcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbXCJcXFwiXCIsIFwiXlwiLCBcIlxcXFxcXFxcXCIsIFwiIFwiLCBcIlxcXCJcIl1dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsIFwic3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbFwiXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1sgWzIsIFtcImNvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuaGFza2VsbFwiXV0gXV1cbiAgICBpdCBcIlN1cHBvcnRzIHR5cGUtbGV2ZWwgc3RyaW5nIGxpdGVyYWxzXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAnOjogXCJ0eXBlLWxldmVsIHN0cmluZ1wiJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1tcIjo6XCIsIFwiIFwiLCBcIlxcXCJcIiwgXCJ0eXBlLWxldmVsIHN0cmluZ1wiLCBcIlxcXCJcIl1dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbWyBbMywgW1wic3RyaW5nLnF1b3RlZC5kb3VibGUuaGFza2VsbFwiXV0gXV1cblxuXG4gIGRlc2NyaWJlIFwiYmFja3RpY2sgZnVuY3Rpb24gY2FsbFwiLCAtPlxuICAgIGl0IFwiZmluZHMgYmFja3RpY2sgZnVuY3Rpb24gbmFtZXNcIiwgLT5cbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJcXGBmdW5jXFxgXCIpXG4gICAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAnYCcsIHNjb3BlczogWydzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmZ1bmN0aW9uLmluZml4Lmhhc2tlbGwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5lbnRpdHkuaGFza2VsbCddXG4gICAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnZnVuYycsIHNjb3BlczogWydzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmZ1bmN0aW9uLmluZml4Lmhhc2tlbGwnXVxuICAgICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ2AnLCBzY29wZXM6IFsnc291cmNlLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5mdW5jdGlvbi5pbmZpeC5oYXNrZWxsJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uZW50aXR5Lmhhc2tlbGwnXVxuXG4gIGRlc2NyaWJlIFwia2V5d29yZHNcIiwgLT5cbiAgICBjb250cm9sS2V5d29yZHMgPSBbJ2Nhc2UnLCAnb2YnLCAnaW4nLCAnd2hlcmUnLCAnaWYnLCAndGhlbicsICdlbHNlJ11cblxuICAgIGZvciBzY29wZSwga2V5d29yZCBvZiBjb250cm9sS2V5d29yZHNcbiAgICAgIGl0IFwidG9rZW5pemVzICN7a2V5d29yZH0gYXMgYSBrZXl3b3JkXCIsIC0+XG4gICAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoa2V5d29yZClcbiAgICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZToga2V5d29yZCwgc2NvcGVzOiBbJ3NvdXJjZS5oYXNrZWxsJywgJ2tleXdvcmQuY29udHJvbC5oYXNrZWxsJ11cblxuICBkZXNjcmliZSBcIm9wZXJhdG9yc1wiLCAtPlxuICAgIGl0IFwidG9rZW5pemVzIHRoZSAvIGFyaXRobWV0aWMgb3BlcmF0b3Igd2hlbiBzZXBhcmF0ZWQgYnkgbmV3bGluZXNcIiwgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzIFwiXCJcIlxuICAgICAgICAxXG4gICAgICAgIC8gMlxuICAgICAgXCJcIlwiXG4gICAgICBleHBlY3QobGluZXMpLnRvRXF1YWwgIFtcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7IHZhbHVlIDogJzEnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdjb25zdGFudC5udW1lcmljLmRlY2ltYWwuaGFza2VsbCcgXSB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7IHZhbHVlIDogJy8nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnIF0gfVxuICAgICAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnIF0gfVxuICAgICAgICAgICAgeyB2YWx1ZSA6ICcyJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnY29uc3RhbnQubnVtZXJpYy5kZWNpbWFsLmhhc2tlbGwnIF0gfVxuICAgICAgICAgIF1cbiAgICAgICAgXVxuXG4gIGRlc2NyaWJlIFwiaWRzXCIsIC0+XG4gICAgaXQgJ2hhbmRsZXMgdHlwZV9pZHMnLCAtPlxuICAgICAgdHlwZUlkcyA9IFsnQ2hhcicsICdEYXRhJywgJ0xpc3QnLCAnSW50JywgJ0ludGVncmFsJywgJ0Zsb2F0JywgJ0RhdGUnXVxuXG4gICAgICBmb3Igc2NvcGUsIGlkIG9mIHR5cGVJZHNcbiAgICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShpZClcbiAgICAgICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogaWQsIHNjb3BlczogWydzb3VyY2UuaGFza2VsbCcsICdlbnRpdHkubmFtZS50YWcuaGFza2VsbCddXG5cbiAgZGVzY3JpYmUgXCJpZGVudGlmaWVyc1wiLCAtPlxuICAgIGl0ICdkb2VzbnQgaGlnaGxpZ2h0IHBhcnRpYWwgcHJlbHVkZSBuYW1lcycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCBcInRvcCduJ3RhaWxcIilcbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJywgJ2lkZW50aWZpZXIuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgXCJ0b3Anbid0YWlsXCIgOiBbICdpZGVudGlmaWVyLmhhc2tlbGwnIF1dXG4gICAgICBdXG5cbiAgZGVzY3JpYmUgJzo6IGRlY2xhcmF0aW9ucycsIC0+XG4gICAgaXQgJ3BhcnNlcyBuZXdsaW5lIGRlY2xhcmF0aW9ucycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCAnZnVuY3Rpb24gOjogVHlwZSAtPiBPdGhlclR5cGUnKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbICdmdW5jdGlvbicgOiBbICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJzo6JyA6IFsgJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnVHlwZScgOiBbICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJy0+JyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmFycm93Lmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnT3RoZXJUeXBlJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnIF1cbiAgICAgICAgXV1cblxuICAgIGl0ICdwYXJzZXMgaW4tbGluZSBwYXJlbnRoZXNpc2VkIGRlY2xhcmF0aW9ucycsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCAnbWFpbiA9IChwdXRTdHJMbiA6OiBTdHJpbmcgLT4gSU8gKCkpIChcIkhlbGxvIFdvcmxkXCIgOjogU3RyaW5nKScpXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgXCJtYWluXCIgOiBbJ2lkZW50aWZpZXIuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIj1cIiA6IFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiKFwiXG4gICAgICAgICwgXCJwdXRTdHJMblwiIDogWydzdXBwb3J0LmZ1bmN0aW9uLnByZWx1ZGUuaGFza2VsbCcgXVxuICAgICAgICAsIFwiIFwiXG4gICAgICAgICwgXCI6OlwiIDogWydrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiU3RyaW5nXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIi0+XCIgOiBbJ2tleXdvcmQub3RoZXIuYXJyb3cuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIklPXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIigpXCIgOiBbJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgICAsIFwiKVwiXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIihcIlxuICAgICAgICAsIFwiXFxcIlwiXG4gICAgICAgICwgXCJIZWxsbyBXb3JsZFwiIDogWydzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJ11cbiAgICAgICAgLCBcIlxcXCJcIlxuICAgICAgICAsIFwiIFwiXG4gICAgICAgICwgXCI6OlwiIDogWydrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ11cbiAgICAgICAgLCBcIiBcIlxuICAgICAgICAsIFwiU3RyaW5nXCIgOiBbJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCddXG4gICAgICAgICwgXCIpXCJcbiAgICAgICAgXVxuICAgICAgXVxuXG4gICAgaXQgJ2RvZXNudCBnZXQgY29uZnVzZWQgYnkgcXVvdGVkIDo6JywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICcoXCJ4IDo6IFN0cmluZyAtPiBJTyAoKVwiICsrIHZhciknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbIFwiKFwiXG4gICAgICAgICwgXCJcXFwiXCJcbiAgICAgICAgLCBcInggOjogU3RyaW5nIC0+IElPICgpXCIgOiBbJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnXVxuICAgICAgICAsIFwiXFxcIlwiXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcIisrXCIgOiBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCddXG4gICAgICAgICwgXCIgXCJcbiAgICAgICAgLCBcInZhclwiIDogWydpZGVudGlmaWVyLmhhc2tlbGwnXVxuICAgICAgICAsIFwiKVwiXG4gICAgICAgIF1cbiAgICAgIF1cblxuICAgIGl0ICdwYXJzZXMgaW4tbGluZSBub24tcGFyZW50aGVzaXNlZCBkZWNsYXJhdGlvbnMnLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgJ21haW4gPSBwdXRTdHJMbiBcIkhlbGxvIFdvcmxkXCIgOjogSU8gKCknKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9IYXZlVG9rZW5TY29wZXMgW1xuICAgICAgICBbICdtYWluJyA6IFsgJ2lkZW50aWZpZXIuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICc9JyA6IFsgJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICdwdXRTdHJMbicgOiBbICdpZGVudGlmaWVyLmhhc2tlbGwnLCAnc3VwcG9ydC5mdW5jdGlvbi5wcmVsdWRlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCB7J1wiJyA6IFsgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbCcgXX1cbiAgICAgICAgLCB7J0hlbGxvIFdvcmxkJyA6IFsgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnIF19XG4gICAgICAgICwgeydcIicgOiBbICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJyBdfVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICc6OicgOiBbICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJyAnXG4gICAgICAgICwgJ0lPJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLCAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnKCknIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCcgXVxuICAgICAgICBdXG4gICAgICBdXG5cbiAgZGVzY3JpYmUgJ3JlZ3Jlc3Npb24gdGVzdCBmb3IgNjUnLCAtPlxuICAgIGl0ICd3b3JrcyB3aXRoIHNwYWNlJywgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsICdkYXRhIEZvbyA9IEZvbyB7YmFyIDo6IEJhcn0nKVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCddXVxuICAgICAgZy50b0hhdmVUb2tlblNjb3BlcyBbXG4gICAgICAgIFsgJ2RhdGEnIDogWyAna2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnRm9vJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICcgOiBbICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnPScgOiBbICdrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbCcgXVxuICAgICAgICAsICcgJ1xuICAgICAgICAsICdGb28nIDogWyAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAneycgOiBbICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5iZWdpbi5oYXNrZWxsJyBdXG4gICAgICAgICwgJ2JhcicgOiBbICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmhhc2tlbGwnIF1cbiAgICAgICAgLCAnICdcbiAgICAgICAgLCAnOjonIDogWyAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXVxuICAgICAgICAsICcgJyA6IFsgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXVxuICAgICAgICAsICdCYXInIDogWyAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXVxuICAgICAgICAsICd9JyA6IFsgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLnJlY29yZC5ibG9jay5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmVuZC5oYXNrZWxsJyBdXG4gICAgICAgIF1cbiAgICAgIF1cblxuICAgIGl0ICd3b3JrcyB3aXRob3V0IHNwYWNlJywgLT5cbiAgICAgIGRhdGEgPSAnZGF0YSBGb28gPSBGb297YmFyIDo6IEJhcn0nXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsIFtcbiAgICAgICAgeyB2YWx1ZSA6ICdkYXRhJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmRhdGEuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ0ZvbycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc9Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ0ZvbycsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ3snLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLnJlY29yZC5ibG9jay5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmJlZ2luLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJ2JhcicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAnbWV0YS5yZWNvcmQtZmllbGQudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ2VudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJzo6Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAnbWV0YS5yZWNvcmQtZmllbGQudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnQmFyJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCcsICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnfScsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5yZWNvcmQuZW5kLmhhc2tlbGwnIF0gfVxuICAgICAgXVxuXG4gIGl0IFwicHJvcGVybHkgaGlnaGxpZ2h0cyBkYXRhIGRlY2xhcmF0aW9uc1wiLCAtPlxuICAgIGRhdGEgPSAnZGF0YSBGb28gPSBGb28gQmFyJ1xuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoZGF0YSlcbiAgICAjIGNvbnNvbGUubG9nIEpTT04uc3RyaW5naWZ5KHRva2VucywgdW5kZWZpbmVkLCAyKVxuICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcImRhdGFcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwia2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCJGb29cIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lLnR5cGUuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsXCJcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInZhbHVlXCI6IFwiPVwiLFxuICAgICAgICAgIFwic2NvcGVzXCI6IFtcbiAgICAgICAgICAgIFwic291cmNlLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwibWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJrZXl3b3JkLm9wZXJhdG9yLmFzc2lnbm1lbnQuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2YWx1ZVwiOiBcIiBcIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCJGb29cIixcbiAgICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgICBcInNvdXJjZS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGxcIixcbiAgICAgICAgICAgIFwiZW50aXR5Lm5hbWUudGFnLmhhc2tlbGxcIlxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwidmFsdWVcIjogXCIgXCIsXG4gICAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgICAgXCJzb3VyY2UuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsXCJcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcInZhbHVlXCI6IFwiQmFyXCIsXG4gICAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgICAgXCJzb3VyY2UuaGFza2VsbFwiLFxuICAgICAgICAgICAgXCJtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsXCIsXG4gICAgICAgICAgICBcIm1ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbFwiXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lLnR5cGUuaGFza2VsbFwiXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICBdXG4gIGRlc2NyaWJlIFwicmVncmVzc2lvbiB0ZXN0IGZvciA3MVwiLCAtPlxuICAgIGl0IFwiPC1cIiwgLT5cbiAgICAgIGRhdGEgPSBcInggOjogU3RyaW5nIDwtIHVuZGVmaW5lZFwiXG4gICAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGRhdGEpXG4gICAgICBleHBlY3QodG9rZW5zKS50b0VxdWFsIFtcbiAgICAgICAgeyB2YWx1ZSA6ICd4Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnaWRlbnRpZmllci5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJzo6Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnU3RyaW5nJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCcsICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnPC0nLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAndW5kZWZpbmVkJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnaWRlbnRpZmllci5oYXNrZWxsJywgJ3N1cHBvcnQuZnVuY3Rpb24ucHJlbHVkZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgXVxuICAgIGl0IFwiPVwiLCAtPlxuICAgICAgZGF0YSA9IFwieCA6OiBTdHJpbmcgPSB1bmRlZmluZWRcIlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShkYXRhKVxuICAgICAgIyBjb25zb2xlLmxvZyBKU09OLnN0cmluZ2lmeSh0b2tlbnMsIHVuZGVmaW5lZCwgMilcbiAgICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICB7IHZhbHVlIDogJ3gnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdpZGVudGlmaWVyLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnOjonLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICdTdHJpbmcnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJywgJ3N1cHBvcnQuY2xhc3MucHJlbHVkZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICc9Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAna2V5d29yZC5vcGVyYXRvci5hc3NpZ25tZW50Lmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJyAnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAndW5kZWZpbmVkJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnaWRlbnRpZmllci5oYXNrZWxsJywgJ3N1cHBvcnQuZnVuY3Rpb24ucHJlbHVkZS5oYXNrZWxsJyBdIH1cbiAgICAgICAgXVxuICAgIGl0IFwic3RpbGwgd29ya3MgZm9yIHR5cGUtb3Agc2lnbmF0dXJlc1wiLCAtPlxuICAgICAgZGF0YSA9IFwic210aCA6OiBhIDwtLSBiXCJcbiAgICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoZGF0YSlcbiAgICAgIGV4cGVjdCh0b2tlbnMpLnRvRXF1YWwgW1xuICAgICAgICB7IHZhbHVlIDogJ3NtdGgnLCBzY29wZXMgOiBbICdzb3VyY2UuaGFza2VsbCcsICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJyBdIH1cbiAgICAgICAgeyB2YWx1ZSA6ICcgJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnIF0gfVxuICAgICAgICB7IHZhbHVlIDogJzo6Jywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnYScsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICd2YXJpYWJsZS5vdGhlci5nZW5lcmljLXR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnPC0tJywgc2NvcGVzIDogWyAnc291cmNlLmhhc2tlbGwnLCAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnICcsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcgXSB9XG4gICAgICAgIHsgdmFsdWUgOiAnYicsIHNjb3BlcyA6IFsgJ3NvdXJjZS5oYXNrZWxsJywgJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsICd2YXJpYWJsZS5vdGhlci5nZW5lcmljLXR5cGUuaGFza2VsbCcgXSB9XG4gICAgICAgIF1cblxuICBkZXNjcmliZSBcInR5cGUgb3BlcmF0b3JzXCIsIC0+XG4gICAgaXQgXCJwYXJzZXMgdHlwZSBvcGVyYXRvcnNcIiwgLT5cbiAgICAgIGRhdGEgPSBcIjo6IGEgKioqIGJcIlxuICAgICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShkYXRhKVxuICAgICAgZXhwZWN0KHRva2Vuc1s0XS52YWx1ZSkudG9FcXVhbCAnKioqJ1xuICAgICAgZXhwZWN0KHRva2Vuc1s0XS5zY29wZXMpLnRvQ29udGFpbiAna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ1xuICAgIGl0IFwiZG9lc24ndCBjb25mdXNlIGFycm93cyBhbmQgdHlwZSBvcGVyYXRvcnNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwiOjogYSAtLT4gYlwiKVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1snOjonLCAnICcsICdhJywgJyAnLCAnLS0+JywgJyAnLCAnYiddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbNCwgWydrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXV1cblxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QoZ3JhbW1hciwgXCI6OiBhIC0+LSBiXCIpXG4gICAgICBnLnRvSGF2ZVRva2VucyBbWyc6OicsICcgJywgJ2EnLCAnICcsICctPi0nLCAnICcsICdiJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1s0LCBbJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCcsICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXV1dXVxuXG4gICAgICBnID0gZ3JhbW1hckV4cGVjdChncmFtbWFyLCBcIjo6IGEgPT0+IGJcIilcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJzo6JywgJyAnLCAnYScsICcgJywgJz09PicsICcgJywgJ2InXV1cbiAgICAgIGcudG9IYXZlU2NvcGVzIFtbJ3NvdXJjZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzQsIFsna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJywgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXV1dXG5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0KGdyYW1tYXIsIFwiOjogYSA9Pj0gYlwiKVxuICAgICAgZy50b0hhdmVUb2tlbnMgW1snOjonLCAnICcsICdhJywgJyAnLCAnPT49JywgJyAnLCAnYiddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbNCwgWydrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnLCAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXV1cblxuICBkZXNjcmliZSBcImNvbW1lbnRzXCIsIC0+XG4gICAgaXQgXCJwYXJzZXMgYmxvY2sgY29tbWVudHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIFwiey0gdGhpcyBpcyBhIGJsb2NrIGNvbW1lbnQgLX1cIlxuICAgICAgZy50b0hhdmVUb2tlbnMgW1sney0nLCAnIHRoaXMgaXMgYSBibG9jayBjb21tZW50ICcsICctfSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnY29tbWVudC5ibG9jay5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzAsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzIsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11dXV1cblxuICAgIGl0IFwicGFyc2VzIG5lc3RlZCBibG9jayBjb21tZW50c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgXCJ7LSB0aGlzIGlzIGEgey0gbmVzdGVkIC19IGJsb2NrIGNvbW1lbnQgLX1cIlxuICAgICAgZy50b0hhdmVUb2tlbnMgW1sney0nLCAnIHRoaXMgaXMgYSAnLCAney0nLCAnIG5lc3RlZCAnLCAnLX0nLCAnIGJsb2NrIGNvbW1lbnQgJywgJy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdjb21tZW50LmJsb2NrLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbMCwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suc3RhcnQuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsyLCBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzQsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzYsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11dXV1cblxuICAgIGl0IFwicGFyc2VzIHByYWdtYXMgYXMgY29tbWVudHMgaW4gYmxvY2sgY29tbWVudHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICd7LSB0aGlzIGlzIGEgey0jIG5lc3RlZCAjLX0gYmxvY2sgY29tbWVudCAtfSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ3stJywgJyB0aGlzIGlzIGEgJywgJ3stJywgJyMgbmVzdGVkICMnLCAnLX0nLCAnIGJsb2NrIGNvbW1lbnQgJywgJy19J11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdjb21tZW50LmJsb2NrLmhhc2tlbGwnXV1cbiAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbMCwgWydwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suc3RhcnQuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsyLCBbJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzQsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzYsIFsncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ11dXV1cbiAgZGVzY3JpYmUgXCJpbnN0YW5jZVwiLCAtPlxuICAgIGl0IFwicmVjb2duaXplcyBpbnN0YW5jZXNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdpbnN0YW5jZSBDbGFzcyB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ2luc3RhbmNlJywgJyAnLCAnQ2xhc3MnLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5pbnN0YW5jZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzEsIFsnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzIsIFsnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFszLCBbJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs0LCBbJ2tleXdvcmQub3RoZXIuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgaXQgXCJyZWNvZ25pemVzIGluc3RhbmNlIHByYWdtYXNcIiwgLT5cbiAgICAgIGZvciBwIGluIFsgJ09WRVJMQVBTJywgJ09WRVJMQVBQSU5HJywgJ09WRVJMQVBQQUJMRScsICdJTkNPSEVSRU5UJyBdXG4gICAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsIFwiaW5zdGFuY2Ugey0jICN7cH0gIy19IENsYXNzIHdoZXJlXCJcbiAgICAgICAgZy50b0hhdmVUb2tlbnMgW1snaW5zdGFuY2UnLCAnICcsICd7LSMnLCAnICcsIHAsICcgJywgJyMtfScsICcgJywgJ0NsYXNzJywgJyAnLCAnd2hlcmUnXV1cbiAgICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5pbnN0YW5jZS5oYXNrZWxsJ11dXG4gICAgICAgIGcudG9rZW5Ub0hhdmVTY29wZXMgW1tbMiwgWydtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMywgWydtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNCwgWydtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJywgJ2tleXdvcmQub3RoZXIucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs1LCBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs2LCBbJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1dXG4gIGRlc2NyaWJlIFwibW9kdWxlXCIsIC0+XG4gICAgaXQgXCJ1bmRlcnN0YW5kcyBtb2R1bGUgZGVjbGFyYXRpb25zXCIsIC0+XG4gICAgICBnID0gZ3JhbW1hckV4cGVjdCBncmFtbWFyLCAnbW9kdWxlIE1vZHVsZSB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ21vZHVsZScsICcgJywgJ01vZHVsZScsICcgJywgJ3doZXJlJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLm1vZHVsZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzIsIFsnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCddXV1dXG4gICAgaXQgXCJ1bmRlcnN0YW5kcyBtb2R1bGUgZGVjbGFyYXRpb25zIHdpdGggZXhwb3J0c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ21vZHVsZSBNb2R1bGUgKGV4cG9ydDEsIGV4cG9ydDIpIHdoZXJlJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snbW9kdWxlJywgJyAnLCAnTW9kdWxlJywgJyAnLCAnKCcsICdleHBvcnQxJywgJywnLCAnICcsICdleHBvcnQyJywgJyknLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5tb2R1bGUuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1syLCBbJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNSwgWydtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzgsIFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgaXQgXCJ1bmRlcnN0YW5kcyBtb2R1bGUgZGVjbGFyYXRpb25zIHdpdGggb3BlcmF0b3IgZXhwb3J0c1wiLCAtPlxuICAgICAgZyA9IGdyYW1tYXJFeHBlY3QgZ3JhbW1hciwgJ21vZHVsZSBNb2R1bGUgKCg8fD4pLCBleHBvcnQyKSB3aGVyZSdcbiAgICAgIGcudG9IYXZlVG9rZW5zIFtbJ21vZHVsZScsICcgJywgJ01vZHVsZScsICcgJywgJygnLCAnKDx8PiknLCAnLCcsICcgJywgJ2V4cG9ydDInLCAnKScsICcgJywgJ3doZXJlJ11dXG4gICAgICBnLnRvSGF2ZVNjb3BlcyBbWydzb3VyY2UuaGFza2VsbCcsICdtZXRhLmRlY2xhcmF0aW9uLm1vZHVsZS5oYXNrZWxsJ11dXG4gICAgICBnLnRva2VuVG9IYXZlU2NvcGVzIFtbWzIsIFsnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs1LCBbJ21ldGEuZGVjbGFyYXRpb24uZXhwb3J0cy5oYXNrZWxsJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmluZml4Lmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbOCwgWydtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICBpdCBcInVuZGVyc3RhbmRzIG1vZHVsZSBkZWNsYXJhdGlvbnMgd2l0aCBleHBvcnQgbGlzdHNcIiwgLT5cbiAgICAgIGcgPSBncmFtbWFyRXhwZWN0IGdyYW1tYXIsICdtb2R1bGUgTW9kdWxlIChleHBvcnQxICguLiksIGV4cG9ydDIgKFNvbWV0aGluZykpIHdoZXJlJ1xuICAgICAgZy50b0hhdmVUb2tlbnMgW1snbW9kdWxlJywgJyAnLCAnTW9kdWxlJywgJyAnLCAnKCcsICdleHBvcnQxJywgJyAoJyAsICcuLicsICcpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgJywnLCAnICcsICdleHBvcnQyJywgJyAoJywgJ1NvbWV0aGluZycsICcpJywgJyknLCAnICcsICd3aGVyZSddXVxuICAgICAgZy50b0hhdmVTY29wZXMgW1snc291cmNlLmhhc2tlbGwnLCAnbWV0YS5kZWNsYXJhdGlvbi5tb2R1bGUuaGFza2VsbCddXVxuICAgICAgZy50b2tlblRvSGF2ZVNjb3BlcyBbW1syLCBbJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNSwgWydtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzcsIFsnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnLCAnbWV0YS5vdGhlci5jb25zdHJ1Y3Rvci1saXN0Lmhhc2tlbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tleXdvcmQub3BlcmF0b3Iud2lsZGNhcmQuaGFza2VsbCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMSwgWydtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCcsICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCBbJ21ldGEuZGVjbGFyYXRpb24uZXhwb3J0cy5oYXNrZWxsJywgJ21ldGEub3RoZXIuY29uc3RydWN0b3ItbGlzdC5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXVxuIl19
