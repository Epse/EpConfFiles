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

    SuggestionBuilder.prototype.exportsScope = ['meta.import.haskell', 'meta.declaration.exports.haskell'];

    SuggestionBuilder.prototype.pragmaWords = ['LANGUAGE', 'OPTIONS_GHC', 'INCLUDE', 'WARNING', 'DEPRECATED', 'INLINE', 'NOINLINE', 'ANN', 'LINE', 'RULES', 'SPECIALIZE', 'UNPACK', 'SOURCE'];

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

    SuggestionBuilder.prototype.preprocessorSuggestions = function() {
      var f, kw, kwrx, label, rx;
      kwrx = new RegExp("\\b(" + (this.pragmaWords.join('|')) + ")\\b");
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
          f = (function(_this) {
            return function(b, p) {
              return Promise.resolve(filter(_this.pragmaWords, p));
            };
          })(this);
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
      if (this.isIn(this.typeScope)) {
        return this.symbolSuggestions(this.backend.getCompletionsForType);
      } else if (this.isIn(this.moduleScope)) {
        return this.moduleSuggestions();
      } else if (this.isIn(this.exportsScope)) {
        return this.symbolSuggestions(this.backend.getCompletionsForSymbolInModule);
      } else if (this.isIn(this.preprocessorScope)) {
        return this.preprocessorSuggestions();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtaGFza2VsbC9saWIvc3VnZ2VzdGlvbi1idWlsZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBO3lKQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNDLFNBQVUsT0FBQSxDQUFRLFlBQVIsRUFBVixNQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsU0FBQSxHQUFXLENBQUMsNkJBQUQsQ0FBWCxDQUFBOztBQUFBLGdDQUNBLFdBQUEsR0FBYSxDQUFDLGdCQUFELENBRGIsQ0FBQTs7QUFBQSxnQ0FFQSxXQUFBLEdBQWEsQ0FBQyxxQkFBRCxFQUF3Qiw4QkFBeEIsQ0FGYixDQUFBOztBQUFBLGdDQUdBLGlCQUFBLEdBQW1CLENBQUMsMkJBQUQsQ0FIbkIsQ0FBQTs7QUFBQSxnQ0FJQSxZQUFBLEdBQWMsQ0FBQyxxQkFBRCxFQUF3QixrQ0FBeEIsQ0FKZCxDQUFBOztBQUFBLGdDQU1BLFdBQUEsR0FBYSxDQUNYLFVBRFcsRUFDQyxhQURELEVBQ2dCLFNBRGhCLEVBQzJCLFNBRDNCLEVBQ3NDLFlBRHRDLEVBQ29ELFFBRHBELEVBRVgsVUFGVyxFQUVDLEtBRkQsRUFFUSxNQUZSLEVBRWdCLE9BRmhCLEVBRXlCLFlBRnpCLEVBRXVDLFFBRnZDLEVBRWlELFFBRmpELENBTmIsQ0FBQTs7QUFXYSxJQUFBLDJCQUFFLE9BQUYsRUFBWSxPQUFaLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLE1BRHNCLElBQUMsQ0FBQSxVQUFBLE9BQ3ZCLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsK0VBQUEsQ0FB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

//# sourceURL=/home/epse/.atom/packages/autocomplete-haskell/lib/suggestion-builder.coffee
