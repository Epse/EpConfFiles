(function() {
  var Range, SuggestionBuilder, filter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Range = require('atom').Range;

  filter = require('fuzzaldrin').filter;

  module.exports = SuggestionBuilder = (function() {
    SuggestionBuilder.prototype.typeScope = ['meta.type-signature.haskell'];

    SuggestionBuilder.prototype.sourceScope = ['source.haskell'];

    SuggestionBuilder.prototype.moduleScope = ['meta.import.haskell', 'support.other.module.haskell'];

    SuggestionBuilder.prototype.preprocessorScope = ['meta.preprocessor.haskell'];

    SuggestionBuilder.prototype.instancePreprocessorScope = ['meta.declaration.instance.haskell', 'meta.preprocessor.haskell'];

    SuggestionBuilder.prototype.exportsScope = ['meta.import.haskell', 'meta.declaration.exports.haskell'];

    SuggestionBuilder.prototype.pragmaWords = ['LANGUAGE', 'OPTIONS_GHC', 'INCLUDE', 'WARNING', 'DEPRECATED', 'INLINE', 'NOINLINE', 'ANN', 'LINE', 'RULES', 'SPECIALIZE', 'UNPACK', 'SOURCE'];

    SuggestionBuilder.prototype.instancePragmaWords = ['INCOHERENT', 'OVERLAPPABLE', 'OVERLAPPING', 'OVERLAPS'];

    function SuggestionBuilder(options, backend) {
      this.options = options;
      this.backend = backend;
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.preprocessorSuggestions = __bind(this.preprocessorSuggestions, this);
      this.moduleSuggestions = __bind(this.moduleSuggestions, this);
      this.symbolSuggestions = __bind(this.symbolSuggestions, this);
      this.processSuggestions = __bind(this.processSuggestions, this);
      this.getPrefix = __bind(this.getPrefix, this);
      this.lineSearch = __bind(this.lineSearch, this);
      this.buffer = this.options.editor.getBuffer();
      this.lineRange = new Range([this.options.bufferPosition.row, 0], this.options.bufferPosition);
      this.line = this.buffer.getTextInRange(this.lineRange);
      this.mwl = this.options.activatedManually ? 0 : atom.config.get('autocomplete-plus.minimumWordLength');
    }

    SuggestionBuilder.prototype.lineSearch = function(rx, idx) {
      var _ref;
      if (idx == null) {
        idx = 0;
      }
      return ((_ref = this.line.match(rx)) != null ? _ref[0] : void 0) || '';
    };

    SuggestionBuilder.prototype.isIn = function(scope) {
      return scope.every((function(_this) {
        return function(s1) {
          return __indexOf.call(_this.options.scopeDescriptor.scopes, s1) >= 0;
        };
      })(this));
    };

    SuggestionBuilder.prototype.getPrefix = function(rx) {
      if (rx == null) {
        rx = /[\w.']+$/;
      }
      return this.lineSearch(rx);
    };

    SuggestionBuilder.prototype.buildSymbolSuggestion = function(s, prefix) {
      var _ref, _ref1;
      return {
        text: (_ref = s.qname) != null ? _ref : s.name,
        rightLabel: (_ref1 = s.module) != null ? _ref1.name : void 0,
        type: s.symbolType,
        replacementPrefix: prefix,
        description: s.name + " :: " + s.typeSignature
      };
    };

    SuggestionBuilder.prototype.buildSimpleSuggestion = function(type, text, prefix, label) {
      return {
        text: text,
        type: type,
        replacementPrefix: prefix,
        rightLabel: label
      };
    };

    SuggestionBuilder.prototype.processSuggestions = function(f, rx, p) {
      var prefix;
      if (typeof rx === 'function') {
        p = rx;
        rx = void 0;
      }
      prefix = this.getPrefix(rx);
      if (prefix.length < this.mwl) {
        return [];
      }
      return f(this.buffer, prefix, this.options.bufferPosition).then(function(symbols) {
        return symbols.map(function(s) {
          return p(s, prefix);
        });
      });
    };

    SuggestionBuilder.prototype.symbolSuggestions = function(f) {
      return this.processSuggestions(f, this.buildSymbolSuggestion);
    };

    SuggestionBuilder.prototype.moduleSuggestions = function() {
      return this.processSuggestions(this.backend.getCompletionsForModule, (function(_this) {
        return function(s, prefix) {
          return _this.buildSimpleSuggestion('import', s, prefix);
        };
      })(this));
    };

    SuggestionBuilder.prototype.preprocessorSuggestions = function(pragmaList) {
      var f, kw, kwrx, label, rx;
      kwrx = new RegExp("\\b(" + (pragmaList.join('|')) + ")\\b");
      kw = this.lineSearch(kwrx);
      label = '';
      rx = void 0;
      switch (false) {
        case kw !== 'OPTIONS_GHC':
          rx = /[\w-]+$/;
          label = 'GHC Flag';
          f = this.backend.getCompletionsForCompilerOptions;
          break;
        case kw !== 'LANGUAGE':
          label = 'Language';
          f = this.backend.getCompletionsForLanguagePragmas;
          break;
        case !!kw:
          label = 'Pragma';
          f = function(b, p) {
            return Promise.resolve(filter(pragmaList, p));
          };
          break;
        default:
          return [];
      }
      return this.processSuggestions(f, rx, (function(_this) {
        return function(s, prefix) {
          return _this.buildSimpleSuggestion('keyword', s, prefix, label);
        };
      })(this));
    };

    SuggestionBuilder.prototype.getSuggestions = function() {
      if (this.isIn(this.instancePreprocessorScope)) {
        return this.preprocessorSuggestions(this.instancePragmaWords);
      } else if (this.isIn(this.typeScope)) {
        return this.symbolSuggestions(this.backend.getCompletionsForType);
      } else if (this.isIn(this.moduleScope)) {
        return this.moduleSuggestions();
      } else if (this.isIn(this.exportsScope)) {
        return this.symbolSuggestions(this.backend.getCompletionsForSymbolInModule);
      } else if (this.isIn(this.preprocessorScope)) {
        return this.preprocessorSuggestions(this.pragmaWords);
      } else if (this.isIn(this.sourceScope)) {
        if (this.getPrefix().startsWith('_')) {
          if (atom.config.get('autocomplete-haskell.ingoreMinimumWordLengthForHoleCompletions')) {
            this.mwl = 1;
          }
          return this.symbolSuggestions(this.backend.getCompletionsForHole);
        } else {
          return this.symbolSuggestions(this.backend.getCompletionsForSymbol);
        }
      } else {
        return [];
      }
    };

    return SuggestionBuilder;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1oYXNrZWxsL2xpYi9zdWdnZXN0aW9uLWJ1aWxkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0MsU0FBVSxPQUFBLENBQVEsWUFBUixFQUFWLE1BREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixnQ0FBQSxTQUFBLEdBQVcsQ0FBQyw2QkFBRCxDQUFYLENBQUE7O0FBQUEsZ0NBQ0EsV0FBQSxHQUFhLENBQUMsZ0JBQUQsQ0FEYixDQUFBOztBQUFBLGdDQUVBLFdBQUEsR0FBYSxDQUFDLHFCQUFELEVBQXdCLDhCQUF4QixDQUZiLENBQUE7O0FBQUEsZ0NBR0EsaUJBQUEsR0FBbUIsQ0FBQywyQkFBRCxDQUhuQixDQUFBOztBQUFBLGdDQUlBLHlCQUFBLEdBQTJCLENBQUMsbUNBQUQsRUFBc0MsMkJBQXRDLENBSjNCLENBQUE7O0FBQUEsZ0NBS0EsWUFBQSxHQUFjLENBQUMscUJBQUQsRUFBd0Isa0NBQXhCLENBTGQsQ0FBQTs7QUFBQSxnQ0FPQSxXQUFBLEdBQWEsQ0FDWCxVQURXLEVBQ0MsYUFERCxFQUNnQixTQURoQixFQUMyQixTQUQzQixFQUNzQyxZQUR0QyxFQUNvRCxRQURwRCxFQUVYLFVBRlcsRUFFQyxLQUZELEVBRVEsTUFGUixFQUVnQixPQUZoQixFQUV5QixZQUZ6QixFQUV1QyxRQUZ2QyxFQUVpRCxRQUZqRCxDQVBiLENBQUE7O0FBQUEsZ0NBWUEsbUJBQUEsR0FBcUIsQ0FDbkIsWUFEbUIsRUFFbkIsY0FGbUIsRUFHbkIsYUFIbUIsRUFJ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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/autocomplete-haskell/lib/suggestion-builder.coffee
