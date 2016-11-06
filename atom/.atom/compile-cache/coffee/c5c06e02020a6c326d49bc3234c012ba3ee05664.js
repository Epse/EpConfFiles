(function() {
  describe('Rust grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-rust');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('source.rust');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('source.rust');
    });
    it('tokenizes block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text\ntext /* this is a\nblock comment */ text');
      expect(tokens[0][0]).toEqual({
        value: 'text',
        scopes: ['source.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1][2]).toEqual({
        value: ' this is a',
        scopes: ['source.rust', 'comment.block.rust']
      });
      expect(tokens[2][0]).toEqual({
        value: 'block comment ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      return expect(tokens[2][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes nested block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text /* this is a /* nested */ block comment */ text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: ' this is a ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      expect(tokens[4]).toEqual({
        value: ' nested ',
        scopes: ['source.rust', 'comment.block.rust', 'comment.block.rust']
      });
      expect(tokens[6]).toEqual({
        value: ' block comment ',
        scopes: ['source.rust', 'comment.block.rust']
      });
      return expect(tokens[8]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('does not tokenize strings or numbers in block comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('/* comment "string" 42 0x18 0b01011 u32 as i16 if impl */').tokens;
      return expect(tokens[1]).toEqual({
        value: ' comment "string" 42 0x18 0b01011 u32 as i16 if impl ',
        scopes: ['source.rust', 'comment.block.rust']
      });
    });
    it('tokenizes block doc comments', function() {
      var src, tokens, _i, _len, _ref, _results;
      _ref = ['/** this is a\nblock doc comment */', '/*! this is a\nblock doc comment */'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        src = _ref[_i];
        tokens = grammar.tokenizeLines(src);
        expect(tokens[0][1]).toEqual({
          value: ' this is a',
          scopes: ['source.rust', 'comment.block.documentation.rust']
        });
        _results.push(expect(tokens[1][0]).toEqual({
          value: 'block doc comment ',
          scopes: ['source.rust', 'comment.block.documentation.rust']
        }));
      }
      return _results;
    });
    it('tokenizes line comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text // line comment').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' line comment',
        scopes: ['source.rust', 'comment.line.double-slash.rust']
      });
    });
    it('does not tokenize strings or numbers in line comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine('// comment "string" 42 0x18 0b01011 u32 as i16 if impl').tokens;
      return expect(tokens[1]).toEqual({
        value: ' comment "string" 42 0x18 0b01011 u32 as i16 if impl',
        scopes: ['source.rust', 'comment.line.double-slash.rust']
      });
    });
    it('tokenizes line doc comments', function() {
      var src, tokens, _i, _len, _ref, _results;
      _ref = ['/// line doc comment', '//! line doc comment'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        src = _ref[_i];
        tokens = grammar.tokenizeLine(src).tokens;
        _results.push(expect(tokens[1]).toEqual({
          value: ' line doc comment',
          scopes: ['source.rust', 'comment.line.documentation.rust']
        }));
      }
      return _results;
    });
    it('tokenizes attributes', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![main] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'main',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with options', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![allow(great_algorithms)] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'allow(great_algorithms)',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with negations', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#![!resolve_unexported] text').tokens;
      expect(tokens[1]).toEqual({
        value: '!resolve_unexported',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes item attributes', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[deny(silly_comments)] text').tokens;
      expect(tokens[1]).toEqual({
        value: 'deny(silly_comments)',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes attributes with values', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[doc = "The docs"]').tokens;
      expect(tokens[1]).toEqual({
        value: 'doc = ',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'The docs',
        scopes: ['source.rust', 'meta.attribute.rust', 'string.quoted.double.rust']
      });
    });
    it('tokenizes attributes with special characters in values', function() {
      var tokens;
      tokens = grammar.tokenizeLine('#[doc = "This attribute contains ] an attribute ending character"]').tokens;
      expect(tokens[1]).toEqual({
        value: 'doc = ',
        scopes: ['source.rust', 'meta.attribute.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'This attribute contains ] an attribute ending character',
        scopes: ['source.rust', 'meta.attribute.rust', 'string.quoted.double.rust']
      });
    });
    it('tokenizes strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "This is a string" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a string',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes strings with escaped characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "string\\nwith\\x20escaped\\"characters" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'string',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[3]).toEqual({
        value: '\\n',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[4]).toEqual({
        value: 'with',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[5]).toEqual({
        value: '\\x20',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[6]).toEqual({
        value: 'escaped',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[7]).toEqual({
        value: '\\"',
        scopes: ['source.rust', 'string.quoted.double.rust', 'constant.character.escape.rust']
      });
      expect(tokens[8]).toEqual({
        value: 'characters',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[10]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes strings with comments inside', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text "string with // comment /* inside" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'string with // comment /* inside',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes multiline strings', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text "strings can\nspan multiple lines" text');
      expect(tokens[0][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'strings can',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'span multiple lines',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[1][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text r"This is a raw string" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a raw string',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw strings with multiple surrounding characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text r##"This is a ##"# valid raw string"## text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a ##"# valid raw string',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes byte strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b"This is a bytestring" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a bytestring',
        scopes: ['source.rust', 'string.quoted.double.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes raw byte strings', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text br"This is a raw bytestring" text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'This is a raw bytestring',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[4]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes multiline raw strings', function() {
      var tokens;
      tokens = grammar.tokenizeLines('text r"Raw strings can\nspan multiple lines" text');
      expect(tokens[0][0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'Raw strings can',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      expect(tokens[1][0]).toEqual({
        value: 'span multiple lines',
        scopes: ['source.rust', 'string.quoted.double.raw.rust']
      });
      return expect(tokens[1][2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text \'c\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '\'c\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes escaped characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text \'\\n\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '\'\\n\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes bytes character', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b\'b\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'b\'b\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes escaped bytes characters', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text b\'\\x20\' text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'b\'\\x20\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes decimal integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes hex integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0xf00b text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0xf00b',
        scopes: ['source.rust', 'constant.numeric.integer.hexadecimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes octal integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0o755 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0o755',
        scopes: ['source.rust', 'constant.numeric.integer.octal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes binary integers', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 0b101010 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '0b101010',
        scopes: ['source.rust', 'constant.numeric.integer.binary.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42u8 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42u8',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with underscores', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes integers with underscores and type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2_u8 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2_u8',
        scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42e18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42e18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with signed exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42e+18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42e+18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with dot and exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415e18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415e18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with dot and signed exponent', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415e+18 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415e+18',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 42.1415f32 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '42.1415f32',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with underscores', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2.141_5 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2.141_5',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes floats with underscores and type suffix', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text 4_2.141_5_f32 text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: '4_2.141_5_f32',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes boolean false', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text false text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'false',
        scopes: ['source.rust', 'constant.language.boolean.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes boolean true', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text true text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'true',
        scopes: ['source.rust', 'constant.language.boolean.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes control keywords', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['break', 'continue', 'else', 'if', 'in', 'for', 'loop', 'match', 'return', 'while'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'keyword.control.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes keywords', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['crate', 'extern', 'mod', 'let', 'proc', 'ref', 'use', 'super', 'as', 'move'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'keyword.other.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes unsafe keyword', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text unsafe text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes self keyword', function() {
      var tokens;
      tokens = grammar.tokenizeLine('text self text').tokens;
      expect(tokens[0]).toEqual({
        value: 'text ',
        scopes: ['source.rust']
      });
      expect(tokens[1]).toEqual({
        value: 'self',
        scopes: ['source.rust', 'variable.language.rust']
      });
      return expect(tokens[2]).toEqual({
        value: ' text',
        scopes: ['source.rust']
      });
    });
    it('tokenizes sigils', function() {
      var tokens;
      tokens = grammar.tokenizeLine('*var &var').tokens;
      expect(tokens[0]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[2]).toEqual({
        value: '&',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
    });
    it('tokenizes core types', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['bool', 'char', 'usize', 'isize', 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'f32', 'f64', 'str', 'Self', 'Option', 'Result'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'storage.type.core.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes core variants', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['Some', 'None', 'Ok', 'Err'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.constant.core.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes core trait markers', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['Copy', 'Send', 'Sized', 'Sync'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.marker.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes core traits', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['Drop', 'Fn', 'FnMut', 'FnOnce', 'Clone', 'PartialEq', 'PartialOrd', 'Eq', 'Ord', 'AsRef', 'AsMut', 'Into', 'From', 'Default', 'Iterator', 'Extend', 'IntoIterator', 'DoubleEndedIterator', 'ExactSizeIterator'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.core.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes std types', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['Box', 'String', 'Vec', 'Path', 'PathBuf'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'storage.class.std.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes std traits', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['ToOwned', 'ToString'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("text " + t + " text").tokens;
        expect(tokens[0]).toEqual({
          value: 'text ',
          scopes: ['source.rust']
        });
        expect(tokens[1]).toEqual({
          value: t,
          scopes: ['source.rust', 'support.type.std.rust']
        });
        _results.push(expect(tokens[2]).toEqual({
          value: ' text',
          scopes: ['source.rust']
        }));
      }
      return _results;
    });
    it('tokenizes enums', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub enum MyEnum {\n    One,\n    Two\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'enum',
        scopes: ['source.rust', 'storage.type.rust']
      });
      return expect(tokens[0][4]).toEqual({
        value: 'MyEnum',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
    });
    it('tokenizes structs', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub struct MyStruct<\'foo> {\n    pub one: u32,\n    two: Option<\'a, MyEnum>,\n    three: &\'foo i32,\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'struct',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'MyStruct',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[0][5]).toEqual({
        value: '<',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[0][6]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[0][7]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[2][4]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      expect(tokens[3][2]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[3][3]).toEqual({
        value: 'foo',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes tuple structs', function() {
      var tokens;
      tokens = grammar.tokenizeLine('pub struct MyTupleStruct(pub i32, u32);').tokens;
      expect(tokens[0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'struct',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[4]).toEqual({
        value: 'MyTupleStruct',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      return expect(tokens[6]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
    });
    it('tokenizes type aliases', function() {
      var tokens;
      tokens = grammar.tokenizeLine('type MyType = u32;').tokens;
      expect(tokens[0]).toEqual({
        value: 'type',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[2]).toEqual({
        value: 'MyType',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      return expect(tokens[4]).toEqual({
        value: 'u32',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes constants', function() {
      var tokens;
      tokens = grammar.tokenizeLine('static MY_CONSTANT: &str = "hello";').tokens;
      expect(tokens[0]).toEqual({
        value: 'static',
        scopes: ['source.rust', 'storage.modifier.static.rust']
      });
      expect(tokens[2]).toEqual({
        value: '&',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[3]).toEqual({
        value: 'str',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes traits', function() {
      var tokens;
      tokens = grammar.tokenizeLines('pub trait MyTrait {\n    fn create_something (param: &str, mut other_param: u32) -> Option<Self>;\n    fn do_whatever<T: Send+Share+Whatever, U: Freeze> (param: &T, other_param: u32) -> Option<U>;\n    fn do_all_the_work (&mut self, param: &str, mut other_param: u32) -> bool;\n    fn do_even_more<\'a, T: Send+Whatever, U: Something<T>+Freeze> (&\'a mut self, param: &T) -> &\'a U;\n}');
      expect(tokens[0][0]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[0][2]).toEqual({
        value: 'trait',
        scopes: ['source.rust', 'storage.type.rust']
      });
      expect(tokens[0][4]).toEqual({
        value: 'MyTrait',
        scopes: ['source.rust', 'entity.name.type.rust']
      });
      expect(tokens[1][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[1][12]).toEqual({
        value: 'Option',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
      expect(tokens[1][14]).toEqual({
        value: 'Self',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.type.core.rust']
      });
      expect(tokens[2][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[2][6]).toEqual({
        value: 'Send',
        scopes: ['source.rust', 'meta.type_params.rust', 'support.type.marker.rust']
      });
      expect(tokens[2][7]).toEqual({
        value: '+Share+Whatever, U: Freeze',
        scopes: ['source.rust', 'meta.type_params.rust']
      });
      expect(tokens[3][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][1]).toEqual({
        value: 'fn',
        scopes: ['source.rust', 'keyword.other.fn.rust']
      });
      expect(tokens[4][5]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust']
      });
      expect(tokens[4][6]).toEqual({
        value: 'a',
        scopes: ['source.rust', 'meta.type_params.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
      return expect(tokens[4][11]).toEqual({
        value: 'T',
        scopes: ['source.rust', 'meta.type_params.rust', 'meta.type_params.rust']
      });
    });
    it('tokenizes loop expression labels (issue \\#2)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('infinity: loop {\n    do_serious_stuff();\n    use_a_letter(\'Z\');\n    break \'infinity;\n}');
      expect(tokens[0][0]).toEqual({
        value: 'infinity: ',
        scopes: ['source.rust']
      });
      expect(tokens[2][3]).toEqual({
        value: '\'Z\'',
        scopes: ['source.rust', 'string.quoted.single.rust']
      });
      expect(tokens[3][3]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[3][4]).toEqual({
        value: 'infinity',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes isize/usize type suffixes (issue \\#22)', function() {
      var t, tokens, _i, _len, _ref, _results;
      _ref = ['isize', 'usize'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tokens = grammar.tokenizeLine("let x = 123" + t + ";").tokens;
        _results.push(expect(tokens[4]).toEqual({
          value: "123" + t,
          scopes: ['source.rust', 'constant.numeric.integer.decimal.rust']
        }));
      }
      return _results;
    });
    it('tokenizes float literals without +/- after E (issue \\#30)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('let x = 1.2345e6;').tokens;
      return expect(tokens[4]).toEqual({
        value: '1.2345e6',
        scopes: ['source.rust', 'constant.numeric.float.rust']
      });
    });
    it('tokenizes nested generics (issue \\#33, \\#37)', function() {
      var tokens, _ref;
      return _ref = grammar.tokenizeLine('let x: Vec<Vec<u8>> = Vec::new();'), tokens = _ref.tokens, _ref;
    });
    it('tokenizes == properly (issue \\#40)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('struct Foo { x: i32 }\nif x == 1 { }');
      return expect(tokens[1][2]).toEqual({
        value: '==',
        scopes: ['source.rust', 'keyword.operator.comparison.rust']
      });
    });
    it('tokenizes const function parameters (issue \\#52)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('fn foo(bar: *const i32) {\n  let _ = 1234 as *const u32;\n}');
      expect(tokens[0][4]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      expect(tokens[0][5]).toEqual({
        value: 'const',
        scopes: ['source.rust', 'storage.modifier.const.rust']
      });
      expect(tokens[1][9]).toEqual({
        value: '*',
        scopes: ['source.rust', 'keyword.operator.sigil.rust']
      });
      return expect(tokens[1][10]).toEqual({
        value: 'const',
        scopes: ['source.rust', 'storage.modifier.const.rust']
      });
    });
    it('tokenizes keywords and known types in wrapper structs (issue \\#56)', function() {
      var tokens;
      tokens = grammar.tokenizeLine('pub struct Foobar(pub Option<bool>);').tokens;
      expect(tokens[6]).toEqual({
        value: 'pub',
        scopes: ['source.rust', 'storage.modifier.visibility.rust']
      });
      expect(tokens[8]).toEqual({
        value: 'Option',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
      return expect(tokens[10]).toEqual({
        value: 'bool',
        scopes: ['source.rust', 'storage.type.core.rust']
      });
    });
    it('tokenizes lifetimes in associated type definitions (issue \\#55)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('trait Foo {\n  type B: A + \'static;\n}');
      expect(tokens[1][5]).toEqual({
        value: '\'',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust']
      });
      return expect(tokens[1][6]).toEqual({
        value: 'static',
        scopes: ['source.rust', 'storage.modifier.lifetime.rust', 'entity.name.lifetime.rust']
      });
    });
    it('tokenizes unsafe keywords in function arguments (issue \\#73)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('unsafe fn foo();\nfn foo(f: unsafe fn());');
      expect(tokens[0][0]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
      return expect(tokens[1][4]).toEqual({
        value: 'unsafe',
        scopes: ['source.rust', 'keyword.other.unsafe.rust']
      });
    });
    return it('tokenizes where clauses (issue \\#57)', function() {
      var tokens;
      tokens = grammar.tokenizeLines('impl Foo<A, B> where text { }\nimpl Foo<A, B> for C where text { }\nimpl Foo<A, B> for C {\n    fn foo<A, B> -> C where text { }\n}\nfn foo<A, B> -> C where text { }\nstruct Foo<A, B> where text { }\ntrait Foo<A, B> : C where { }');
      expect(tokens[0][6]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[1][8]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[3][8]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[5][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      expect(tokens[6][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
      return expect(tokens[7][7]).toEqual({
        value: 'where',
        scopes: ['source.rust', 'keyword.other.where.rust']
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLXJ1c3Qvc3BlYy9ydXN0LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUFBLENBQUE7YUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsYUFBbEMsRUFEUDtNQUFBLENBQUwsRUFIUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFmLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsYUFBL0IsRUFGdUI7SUFBQSxDQUF6QixDQVJBLENBQUE7QUFBQSxJQWdCQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxhQUFSLENBQXNCLGdEQUF0QixDQUFULENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sTUFBUDtBQUFBLFFBQWUsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF2QjtPQUE3QixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBN0IsQ0FGQSxDQUFBO0FBQUEsTUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7QUFBQSxRQUFxQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLG9CQUFoQixDQUE3QjtPQUE3QixDQUhBLENBQUE7QUFBQSxNQUlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0JBQVA7QUFBQSxRQUF5QixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLG9CQUFoQixDQUFqQztPQUE3QixDQUpBLENBQUE7YUFLQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTdCLEVBTjZCO0lBQUEsQ0FBL0IsQ0FoQkEsQ0FBQTtBQUFBLElBd0JBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7QUFDcEMsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLHNEQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUFzQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLG9CQUFoQixDQUE5QjtPQUExQixDQUZBLENBQUE7QUFBQSxNQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFBbUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixvQkFBaEIsRUFBc0Msb0JBQXRDLENBQTNCO09BQTFCLENBSEEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGlCQUFQO0FBQUEsUUFBMEIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixvQkFBaEIsQ0FBbEM7T0FBMUIsQ0FKQSxDQUFBO2FBS0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBTm9DO0lBQUEsQ0FBdEMsQ0F4QkEsQ0FBQTtBQUFBLElBZ0NBLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxTQUFBLEdBQUE7QUFDM0QsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLDJEQUFyQixFQUFWLE1BQUQsQ0FBQTthQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyx1REFBUDtBQUFBLFFBQWdFLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isb0JBQWhCLENBQXhFO09BQTFCLEVBRjJEO0lBQUEsQ0FBN0QsQ0FoQ0EsQ0FBQTtBQUFBLElBb0NBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsVUFBQSxxQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt1QkFBQTtBQUNFLFFBQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxhQUFSLENBQXNCLEdBQXRCLENBQVQsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxVQUFBLEtBQUEsRUFBTyxZQUFQO0FBQUEsVUFBcUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixrQ0FBaEIsQ0FBN0I7U0FBN0IsQ0FEQSxDQUFBO0FBQUEsc0JBRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxVQUFBLEtBQUEsRUFBTyxvQkFBUDtBQUFBLFVBQTZCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isa0NBQWhCLENBQXJDO1NBQTdCLEVBRkEsQ0FERjtBQUFBO3NCQURpQztJQUFBLENBQW5DLENBcENBLENBQUE7QUFBQSxJQTBDQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixzQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7YUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sZUFBUDtBQUFBLFFBQXdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLENBQWhDO09BQTFCLEVBSDRCO0lBQUEsQ0FBOUIsQ0ExQ0EsQ0FBQTtBQUFBLElBK0NBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLHdEQUFyQixFQUFWLE1BQUQsQ0FBQTthQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxzREFBUDtBQUFBLFFBQStELE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLENBQXZFO09BQTFCLEVBRjBEO0lBQUEsQ0FBNUQsQ0EvQ0EsQ0FBQTtBQUFBLElBbURBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxxQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt1QkFBQTtBQUNFLFFBQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixHQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLHNCQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxtQkFBUDtBQUFBLFVBQTRCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsaUNBQWhCLENBQXBDO1NBQTFCLEVBREEsQ0FERjtBQUFBO3NCQURnQztJQUFBLENBQWxDLENBbkRBLENBQUE7QUFBQSxJQTREQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixlQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLENBQXZCO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUh5QjtJQUFBLENBQTNCLENBNURBLENBQUE7QUFBQSxJQWlFQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixrQ0FBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyx5QkFBUDtBQUFBLFFBQWtDLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLENBQTFDO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUhzQztJQUFBLENBQXhDLENBakVBLENBQUE7QUFBQSxJQXNFQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQiw4QkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQThCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLENBQXRDO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUh3QztJQUFBLENBQTFDLENBdEVBLENBQUE7QUFBQSxJQTJFQSxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQiw4QkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQkFBUDtBQUFBLFFBQStCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLENBQXZDO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUg4QjtJQUFBLENBQWhDLENBM0VBLENBQUE7QUFBQSxJQWdGQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixxQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixxQkFBaEIsQ0FBekI7T0FBMUIsQ0FEQSxDQUFBO2FBRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLFVBQVA7QUFBQSxRQUFtQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHFCQUFoQixFQUF1QywyQkFBdkMsQ0FBM0I7T0FBMUIsRUFIcUM7SUFBQSxDQUF2QyxDQWhGQSxDQUFBO0FBQUEsSUFxRkEsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtBQUMzRCxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsb0VBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLENBQXpCO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyx5REFBUDtBQUFBLFFBQWtFLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IscUJBQWhCLEVBQXVDLDJCQUF2QyxDQUExRTtPQUExQixFQUgyRDtJQUFBLENBQTdELENBckZBLENBQUE7QUFBQSxJQThGQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQiw4QkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxrQkFBUDtBQUFBLFFBQTJCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQW5DO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUpzQjtJQUFBLENBQXhCLENBOUZBLENBQUE7QUFBQSxJQW9HQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixvREFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBekI7T0FBMUIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQWMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsRUFBNkMsZ0NBQTdDLENBQXRCO09BQTFCLENBSEEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQXZCO09BQTFCLENBSkEsQ0FBQTtBQUFBLE1BS0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixFQUE2QyxnQ0FBN0MsQ0FBeEI7T0FBMUIsQ0FMQSxDQUFBO0FBQUEsTUFNQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sU0FBUDtBQUFBLFFBQWtCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQTFCO09BQTFCLENBTkEsQ0FBQTtBQUFBLE1BT0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLEVBQTZDLGdDQUE3QyxDQUF0QjtPQUExQixDQVBBLENBQUE7QUFBQSxNQVFBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxZQUFQO0FBQUEsUUFBcUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBN0I7T0FBMUIsQ0FSQSxDQUFBO2FBU0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxFQUFBLENBQWQsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTNCLEVBVjhDO0lBQUEsQ0FBaEQsQ0FwR0EsQ0FBQTtBQUFBLElBZ0hBLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBLEdBQUE7QUFDM0MsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLDhDQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGtDQUFQO0FBQUEsUUFBMkMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBbkQ7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSjJDO0lBQUEsQ0FBN0MsQ0FoSEEsQ0FBQTtBQUFBLElBc0hBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsOENBQXRCLENBQVQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUE3QixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQXNCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQTlCO09BQTdCLENBRkEsQ0FBQTtBQUFBLE1BR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQThCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQXRDO09BQTdCLENBSEEsQ0FBQTthQUlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBN0IsRUFMZ0M7SUFBQSxDQUFsQyxDQXRIQSxDQUFBO0FBQUEsSUE2SEEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsbUNBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sc0JBQVA7QUFBQSxRQUErQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLCtCQUFoQixDQUF2QztPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKMEI7SUFBQSxDQUE1QixDQTdIQSxDQUFBO0FBQUEsSUFtSUEsRUFBQSxDQUFHLDREQUFILEVBQWlFLFNBQUEsR0FBQTtBQUMvRCxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsa0RBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8saUNBQVA7QUFBQSxRQUEwQyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLCtCQUFoQixDQUFsRDtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKK0Q7SUFBQSxDQUFqRSxDQW5JQSxDQUFBO0FBQUEsSUF5SUEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsbUNBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sc0JBQVA7QUFBQSxRQUErQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUF2QztPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKMkI7SUFBQSxDQUE3QixDQXpJQSxDQUFBO0FBQUEsSUErSUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtBQUMvQixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsd0NBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sMEJBQVA7QUFBQSxRQUFtQyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLCtCQUFoQixDQUEzQztPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKK0I7SUFBQSxDQUFqQyxDQS9JQSxDQUFBO0FBQUEsSUFxSkEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxPQUFPLENBQUMsYUFBUixDQUFzQixtREFBdEIsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTdCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxpQkFBUDtBQUFBLFFBQTBCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsK0JBQWhCLENBQWxDO09BQTdCLENBRkEsQ0FBQTtBQUFBLE1BR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQThCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsK0JBQWhCLENBQXRDO09BQTdCLENBSEEsQ0FBQTthQUlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBN0IsRUFMb0M7SUFBQSxDQUF0QyxDQXJKQSxDQUFBO0FBQUEsSUE0SkEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTtBQUN6QixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsaUJBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQXhCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUp5QjtJQUFBLENBQTNCLENBNUpBLENBQUE7QUFBQSxJQWtLQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixtQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxTQUFQO0FBQUEsUUFBa0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBMUI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSmlDO0lBQUEsQ0FBbkMsQ0FsS0EsQ0FBQTtBQUFBLElBd0tBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGtCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLFFBQVA7QUFBQSxRQUFpQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDJCQUFoQixDQUF6QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKOEI7SUFBQSxDQUFoQyxDQXhLQSxDQUFBO0FBQUEsSUE4S0EsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsc0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sWUFBUDtBQUFBLFFBQXFCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQTdCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUp1QztJQUFBLENBQXpDLENBOUtBLENBQUE7QUFBQSxJQXdMQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixjQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7QUFBQSxRQUFhLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUNBQWhCLENBQXJCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUorQjtJQUFBLENBQWpDLENBeExBLENBQUE7QUFBQSxJQThMQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixrQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQ0FBaEIsQ0FBekI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSjJCO0lBQUEsQ0FBN0IsQ0E5TEEsQ0FBQTtBQUFBLElBb01BLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFDN0IsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGlCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHFDQUFoQixDQUF4QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKNkI7SUFBQSxDQUEvQixDQXBNQSxDQUFBO0FBQUEsSUEwTUEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsb0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sVUFBUDtBQUFBLFFBQW1CLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isc0NBQWhCLENBQTNCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUo4QjtJQUFBLENBQWhDLENBMU1BLENBQUE7QUFBQSxJQWdOQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixnQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxNQUFQO0FBQUEsUUFBZSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHVDQUFoQixDQUF2QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKd0M7SUFBQSxDQUExQyxDQWhOQSxDQUFBO0FBQUEsSUFzTkEsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsZUFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHVDQUFoQixDQUF0QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKd0M7SUFBQSxDQUExQyxDQXROQSxDQUFBO0FBQUEsSUE0TkEsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsa0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUNBQWhCLENBQXpCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUp3RDtJQUFBLENBQTFELENBNU5BLENBQUE7QUFBQSxJQWtPQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixtQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxTQUFQO0FBQUEsUUFBa0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw2QkFBaEIsQ0FBMUI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSnFCO0lBQUEsQ0FBdkIsQ0FsT0EsQ0FBQTtBQUFBLElBd09BLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGlCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDZCQUFoQixDQUF4QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKbUM7SUFBQSxDQUFyQyxDQXhPQSxDQUFBO0FBQUEsSUE4T0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsa0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQXpCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUowQztJQUFBLENBQTVDLENBOU9BLENBQUE7QUFBQSxJQW9QQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixzQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxZQUFQO0FBQUEsUUFBcUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw2QkFBaEIsQ0FBN0I7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSjJDO0lBQUEsQ0FBN0MsQ0FwUEEsQ0FBQTtBQUFBLElBMFBBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBLEdBQUE7QUFDbEQsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLHVCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUFzQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDZCQUFoQixDQUE5QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKa0Q7SUFBQSxDQUFwRCxDQTFQQSxDQUFBO0FBQUEsSUFnUUEsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsc0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sWUFBUDtBQUFBLFFBQXFCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQTdCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUpzQztJQUFBLENBQXhDLENBaFFBLENBQUE7QUFBQSxJQXNRQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixxQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsUUFBb0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw2QkFBaEIsQ0FBNUI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSnNDO0lBQUEsQ0FBeEMsQ0F0UUEsQ0FBQTtBQUFBLElBNFFBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLHlCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGVBQVA7QUFBQSxRQUF3QixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDZCQUFoQixDQUFoQztPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKc0Q7SUFBQSxDQUF4RCxDQTVRQSxDQUFBO0FBQUEsSUFzUkEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsaUJBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLENBQXhCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUo0QjtJQUFBLENBQTlCLENBdFJBLENBQUE7QUFBQSxJQTRSQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixnQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxNQUFQO0FBQUEsUUFBZSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGdDQUFoQixDQUF2QjtPQUExQixDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7T0FBMUIsRUFKMkI7SUFBQSxDQUE3QixDQTVSQSxDQUFBO0FBQUEsSUFzU0EsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtBQUMvQixVQUFBLG1DQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXNCLE9BQUEsR0FBTyxDQUFQLEdBQVMsT0FBL0IsRUFBVixNQUFELENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtTQUExQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsVUFBVSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHNCQUFoQixDQUFsQjtTQUExQixDQUZBLENBQUE7QUFBQSxzQkFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsRUFIQSxDQURGO0FBQUE7c0JBRCtCO0lBQUEsQ0FBakMsQ0F0U0EsQ0FBQTtBQUFBLElBNlNBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSxtQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFzQixPQUFBLEdBQU8sQ0FBUCxHQUFTLE9BQS9CLEVBQVYsTUFBRCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFVBQVUsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixvQkFBaEIsQ0FBbEI7U0FBMUIsQ0FGQSxDQUFBO0FBQUEsc0JBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxVQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO1NBQTFCLEVBSEEsQ0FERjtBQUFBO3NCQUR1QjtJQUFBLENBQXpCLENBN1NBLENBQUE7QUFBQSxJQW9UQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixrQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBekI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLEVBSjZCO0lBQUEsQ0FBL0IsQ0FwVEEsQ0FBQTtBQUFBLElBMFRBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGdCQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isd0JBQWhCLENBQXZCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtPQUExQixFQUoyQjtJQUFBLENBQTdCLENBMVRBLENBQUE7QUFBQSxJQWdVQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQXBCO09BQTFCLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxHQUFQO0FBQUEsUUFBWSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDZCQUFoQixDQUFwQjtPQUExQixFQUhxQjtJQUFBLENBQXZCLENBaFVBLENBQUE7QUFBQSxJQXlVQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsbUNBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBc0IsT0FBQSxHQUFPLENBQVAsR0FBUyxPQUEvQixFQUFWLE1BQUQsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxVQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO1NBQTFCLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxVQUFVLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isd0JBQWhCLENBQWxCO1NBQTFCLENBRkEsQ0FBQTtBQUFBLHNCQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtTQUExQixFQUhBLENBREY7QUFBQTtzQkFEeUI7SUFBQSxDQUEzQixDQXpVQSxDQUFBO0FBQUEsSUFnVkEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLG1DQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXNCLE9BQUEsR0FBTyxDQUFQLEdBQVMsT0FBL0IsRUFBVixNQUFELENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtTQUExQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsVUFBVSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDRCQUFoQixDQUFsQjtTQUExQixDQUZBLENBQUE7QUFBQSxzQkFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsRUFIQSxDQURGO0FBQUE7c0JBRDRCO0lBQUEsQ0FBOUIsQ0FoVkEsQ0FBQTtBQUFBLElBdVZBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsVUFBQSxtQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFzQixPQUFBLEdBQU8sQ0FBUCxHQUFTLE9BQS9CLEVBQVYsTUFBRCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFVBQVUsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwwQkFBaEIsQ0FBbEI7U0FBMUIsQ0FGQSxDQUFBO0FBQUEsc0JBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxVQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO1NBQTFCLEVBSEEsQ0FERjtBQUFBO3NCQURpQztJQUFBLENBQW5DLENBdlZBLENBQUE7QUFBQSxJQThWQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsbUNBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBc0IsT0FBQSxHQUFPLENBQVAsR0FBUyxPQUEvQixFQUFWLE1BQUQsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxVQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO1NBQTFCLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxVQUFVLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isd0JBQWhCLENBQWxCO1NBQTFCLENBRkEsQ0FBQTtBQUFBLHNCQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtTQUExQixFQUhBLENBREY7QUFBQTtzQkFEMEI7SUFBQSxDQUE1QixDQTlWQSxDQUFBO0FBQUEsSUF5V0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUEsR0FBQTtBQUN4QixVQUFBLG1DQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXNCLE9BQUEsR0FBTyxDQUFQLEdBQVMsT0FBL0IsRUFBVixNQUFELENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsVUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxDQUF4QjtTQUExQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsVUFBVSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHdCQUFoQixDQUFsQjtTQUExQixDQUZBLENBQUE7QUFBQSxzQkFHQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsRUFIQSxDQURGO0FBQUE7c0JBRHdCO0lBQUEsQ0FBMUIsQ0F6V0EsQ0FBQTtBQUFBLElBZ1hBLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxtQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFzQixPQUFBLEdBQU8sQ0FBUCxHQUFTLE9BQS9CLEVBQVYsTUFBRCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFVBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsQ0FBeEI7U0FBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsVUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFVBQVUsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBbEI7U0FBMUIsQ0FGQSxDQUFBO0FBQUEsc0JBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFVBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxVQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQXhCO1NBQTFCLEVBSEEsQ0FERjtBQUFBO3NCQUR5QjtJQUFBLENBQTNCLENBaFhBLENBQUE7QUFBQSxJQTJYQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxhQUFSLENBQXNCLHlDQUF0QixDQUFULENBQUE7QUFBQSxNQU1BLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQWMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixrQ0FBaEIsQ0FBdEI7T0FBN0IsQ0FOQSxDQUFBO0FBQUEsTUFPQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsbUJBQWhCLENBQXZCO09BQTdCLENBUEEsQ0FBQTthQVFBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQXpCO09BQTdCLEVBVG9CO0lBQUEsQ0FBdEIsQ0EzWEEsQ0FBQTtBQUFBLElBc1lBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsMkdBQXRCLENBQVQsQ0FBQTtBQUFBLE1BT0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGtDQUFoQixDQUF0QjtPQUE3QixDQVBBLENBQUE7QUFBQSxNQVFBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsbUJBQWhCLENBQXpCO09BQTdCLENBUkEsQ0FBQTtBQUFBLE1BU0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFBbUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBM0I7T0FBN0IsQ0FUQSxDQUFBO0FBQUEsTUFVQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQXBCO09BQTdCLENBVkEsQ0FBQTtBQUFBLE1BV0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsUUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHVCQUFoQixFQUF5QyxnQ0FBekMsQ0FBckI7T0FBN0IsQ0FYQSxDQUFBO0FBQUEsTUFZQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLEVBQXlDLGdDQUF6QyxFQUEyRSwyQkFBM0UsQ0FBdEI7T0FBN0IsQ0FaQSxDQUFBO0FBQUEsTUFhQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isa0NBQWhCLENBQXRCO09BQTdCLENBYkEsQ0FBQTtBQUFBLE1BY0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsUUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGdDQUFoQixDQUFyQjtPQUE3QixDQWRBLENBQUE7QUFBQSxNQWVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLFFBQVksTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixnQ0FBaEIsRUFBa0QsMkJBQWxELENBQXBCO09BQTdCLENBZkEsQ0FBQTtBQUFBLE1BZ0JBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixnQ0FBaEIsQ0FBckI7T0FBN0IsQ0FoQkEsQ0FBQTthQWlCQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLEVBQWtELDJCQUFsRCxDQUF0QjtPQUE3QixFQWxCc0I7SUFBQSxDQUF4QixDQXRZQSxDQUFBO0FBQUEsSUEwWkEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIseUNBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQWMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixrQ0FBaEIsQ0FBdEI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsbUJBQWhCLENBQXpCO09BQTFCLENBRkEsQ0FBQTtBQUFBLE1BR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLGVBQVA7QUFBQSxRQUF3QixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHVCQUFoQixDQUFoQztPQUExQixDQUhBLENBQUE7YUFJQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQWMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixrQ0FBaEIsQ0FBdEI7T0FBMUIsRUFMNEI7SUFBQSxDQUE5QixDQTFaQSxDQUFBO0FBQUEsSUFpYUEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsb0JBQXJCLEVBQVYsTUFBRCxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sTUFBUDtBQUFBLFFBQWUsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixtQkFBaEIsQ0FBdkI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQXpCO09BQTFCLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHdCQUFoQixDQUF0QjtPQUExQixFQUoyQjtJQUFBLENBQTdCLENBamFBLENBQUE7QUFBQSxJQXVhQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixxQ0FBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw4QkFBaEIsQ0FBekI7T0FBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLFFBQVksTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw2QkFBaEIsQ0FBcEI7T0FBMUIsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isd0JBQWhCLENBQXRCO09BQTFCLEVBSndCO0lBQUEsQ0FBMUIsQ0F2YUEsQ0FBQTtBQUFBLElBNmFBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsbVlBQXRCLENBQVQsQ0FBQTtBQUFBLE1BUUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFBYyxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGtDQUFoQixDQUF0QjtPQUE3QixDQVJBLENBQUE7QUFBQSxNQVNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsbUJBQWhCLENBQXhCO09BQTdCLENBVEEsQ0FBQTtBQUFBLE1BVUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxTQUFQO0FBQUEsUUFBa0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBMUI7T0FBN0IsQ0FWQSxDQUFBO0FBQUEsTUFXQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7QUFBQSxRQUFhLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLENBQXJCO09BQTdCLENBWEEsQ0FBQTtBQUFBLE1BWUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxFQUFBLENBQWpCLENBQXFCLENBQUMsT0FBdEIsQ0FBOEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsUUFBaUIsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix3QkFBaEIsQ0FBekI7T0FBOUIsQ0FaQSxDQUFBO0FBQUEsTUFhQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLEVBQUEsQ0FBakIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLEVBQXlDLHdCQUF6QyxDQUF2QjtPQUE5QixDQWJBLENBQUE7QUFBQSxNQWNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBckI7T0FBN0IsQ0FkQSxDQUFBO0FBQUEsTUFlQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUFlLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLEVBQXlDLDBCQUF6QyxDQUF2QjtPQUE3QixDQWZBLENBQUE7QUFBQSxNQWdCQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFBcUMsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBN0M7T0FBN0IsQ0FoQkEsQ0FBQTtBQUFBLE1BaUJBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBckI7T0FBN0IsQ0FqQkEsQ0FBQTtBQUFBLE1Ba0JBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsQ0FBckI7T0FBN0IsQ0FsQkEsQ0FBQTtBQUFBLE1BbUJBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix1QkFBaEIsRUFBeUMsZ0NBQXpDLENBQXJCO09BQTdCLENBbkJBLENBQUE7QUFBQSxNQW9CQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLEVBQXlDLGdDQUF6QyxFQUEyRSwyQkFBM0UsQ0FBcEI7T0FBN0IsQ0FwQkEsQ0FBQTthQXFCQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLEVBQUEsQ0FBakIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUJBQWhCLEVBQXlDLHVCQUF6QyxDQUFwQjtPQUE5QixFQXRCcUI7SUFBQSxDQUF2QixDQTdhQSxDQUFBO0FBQUEsSUF5Y0EsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxPQUFPLENBQUMsYUFBUixDQUFzQiwrRkFBdEIsQ0FBVCxDQUFBO0FBQUEsTUFRQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7QUFBQSxRQUFxQixNQUFBLEVBQVEsQ0FBQyxhQUFELENBQTdCO09BQTdCLENBUkEsQ0FBQTtBQUFBLE1BU0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwyQkFBaEIsQ0FBeEI7T0FBN0IsQ0FUQSxDQUFBO0FBQUEsTUFVQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7QUFBQSxRQUFhLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLENBQXJCO09BQTdCLENBVkEsQ0FBQTthQVdBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sVUFBUDtBQUFBLFFBQW1CLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsZ0NBQWhCLEVBQWtELDJCQUFsRCxDQUEzQjtPQUE3QixFQVprRDtJQUFBLENBQXBELENBemNBLENBQUE7QUFBQSxJQXVkQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFVBQUEsbUNBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBc0IsYUFBQSxHQUFhLENBQWIsR0FBZSxHQUFyQyxFQUFWLE1BQUQsQ0FBQTtBQUFBLHNCQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxVQUFBLEtBQUEsRUFBUSxLQUFBLEdBQUssQ0FBYjtBQUFBLFVBQWtCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsdUNBQWhCLENBQTFCO1NBQTFCLEVBREEsQ0FERjtBQUFBO3NCQURzRDtJQUFBLENBQXhELENBdmRBLENBQUE7QUFBQSxJQTRkQSxFQUFBLENBQUcsNERBQUgsRUFBaUUsU0FBQSxHQUFBO0FBQy9ELFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixtQkFBckIsRUFBVixNQUFELENBQUE7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO0FBQUEsUUFBQSxLQUFBLEVBQU8sVUFBUDtBQUFBLFFBQW1CLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQTNCO09BQTFCLEVBRitEO0lBQUEsQ0FBakUsQ0E1ZEEsQ0FBQTtBQUFBLElBZ2VBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsVUFBQSxZQUFBO2FBQUEsT0FBVyxPQUFPLENBQUMsWUFBUixDQUFxQixtQ0FBckIsQ0FBWCxFQUFDLGNBQUEsTUFBRCxFQUFBLEtBRG1EO0lBQUEsQ0FBckQsQ0FoZUEsQ0FBQTtBQUFBLElBdWVBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0Isc0NBQXRCLENBQVQsQ0FBQTthQUlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLFFBQWEsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQixrQ0FBaEIsQ0FBckI7T0FBN0IsRUFMd0M7SUFBQSxDQUExQyxDQXZlQSxDQUFBO0FBQUEsSUE4ZUEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxPQUFPLENBQUMsYUFBUixDQUFzQiw2REFBdEIsQ0FBVCxDQUFBO0FBQUEsTUFLQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQXBCO09BQTdCLENBTEEsQ0FBQTtBQUFBLE1BTUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiw2QkFBaEIsQ0FBeEI7T0FBN0IsQ0FOQSxDQUFBO0FBQUEsTUFPQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUFZLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQXBCO09BQTdCLENBUEEsQ0FBQTthQVFBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsRUFBQSxDQUFqQixDQUFxQixDQUFDLE9BQXRCLENBQThCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsNkJBQWhCLENBQXhCO09BQTlCLEVBVHNEO0lBQUEsQ0FBeEQsQ0E5ZUEsQ0FBQTtBQUFBLElBeWZBLEVBQUEsQ0FBRyxxRUFBSCxFQUEwRSxTQUFBLEdBQUE7QUFDeEUsVUFBQSxNQUFBO0FBQUEsTUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLHNDQUFyQixFQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUFjLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0Isa0NBQWhCLENBQXRCO09BQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtBQUFBLFFBQUEsS0FBQSxFQUFPLFFBQVA7QUFBQSxRQUFpQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLHdCQUFoQixDQUF6QjtPQUExQixDQUZBLENBQUE7YUFJQSxNQUFBLENBQU8sTUFBTyxDQUFBLEVBQUEsQ0FBZCxDQUFrQixDQUFDLE9BQW5CLENBQTJCO0FBQUEsUUFBQSxLQUFBLEVBQU8sTUFBUDtBQUFBLFFBQWUsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQix3QkFBaEIsQ0FBdkI7T0FBM0IsRUFMd0U7SUFBQSxDQUExRSxDQXpmQSxDQUFBO0FBQUEsSUFnZ0JBLEVBQUEsQ0FBRyxrRUFBSCxFQUF1RSxTQUFBLEdBQUE7QUFDckUsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IseUNBQXRCLENBQVQsQ0FBQTtBQUFBLE1BS0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsUUFBYSxNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGdDQUFoQixDQUFyQjtPQUE3QixDQUxBLENBQUE7YUFNQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLFFBQVA7QUFBQSxRQUFpQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLGdDQUFoQixFQUFrRCwyQkFBbEQsQ0FBekI7T0FBN0IsRUFQcUU7SUFBQSxDQUF2RSxDQWhnQkEsQ0FBQTtBQUFBLElBeWdCQSxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQSxHQUFBO0FBQ2xFLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxhQUFSLENBQXNCLDJDQUF0QixDQUFULENBQUE7QUFBQSxNQUlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQXpCO09BQTdCLENBSkEsQ0FBQTthQUtBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBUDtBQUFBLFFBQWlCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMkJBQWhCLENBQXpCO09BQTdCLEVBTmtFO0lBQUEsQ0FBcEUsQ0F6Z0JBLENBQUE7V0FpaEJBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBc0IsdU9BQXRCLENBQVQsQ0FBQTtBQUFBLE1BVUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwwQkFBaEIsQ0FBeEI7T0FBN0IsQ0FWQSxDQUFBO0FBQUEsTUFXQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDBCQUFoQixDQUF4QjtPQUE3QixDQVhBLENBQUE7QUFBQSxNQVlBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO0FBQUEsUUFBQSxLQUFBLEVBQU8sT0FBUDtBQUFBLFFBQWdCLE1BQUEsRUFBUSxDQUFDLGFBQUQsRUFBZ0IsMEJBQWhCLENBQXhCO09BQTdCLENBWkEsQ0FBQTtBQUFBLE1BYUEsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWpCLENBQW9CLENBQUMsT0FBckIsQ0FBNkI7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFBZ0IsTUFBQSxFQUFRLENBQUMsYUFBRCxFQUFnQiwwQkFBaEIsQ0FBeEI7T0FBN0IsQ0FiQSxDQUFBO0FBQUEsTUFjQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDBCQUFoQixDQUF4QjtPQUE3QixDQWRBLENBQUE7YUFlQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBakIsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QjtBQUFBLFFBQUEsS0FBQSxFQUFPLE9BQVA7QUFBQSxRQUFnQixNQUFBLEVBQVEsQ0FBQyxhQUFELEVBQWdCLDBCQUFoQixDQUF4QjtPQUE3QixFQWhCMEM7SUFBQSxDQUE1QyxFQWxoQnVCO0VBQUEsQ0FBekIsQ0FBQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-rust/spec/rust-spec.coffee
