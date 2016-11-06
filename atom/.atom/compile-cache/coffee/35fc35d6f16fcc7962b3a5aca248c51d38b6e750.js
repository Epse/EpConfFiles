(function() {
  var AbstractProvider, FunctionProvider, config, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.functions = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    FunctionProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, scopeDescriptor, suggestions, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([a-z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.functions = proxy.functions();
      if (((_ref = this.functions) != null ? _ref.names : void 0) == null) {
        return;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(prefix.trim(), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix.
     *
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters.
     *
     * @return {Array}
     */

    FunctionProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var element, suggestions, word, words, _i, _j, _len, _len1, _ref;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      words = fuzzaldrin.filter(this.functions.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        _ref = this.functions.values[word];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          suggestions.push({
            text: word,
            type: 'function',
            description: 'Built-in PHP function.',
            descriptionMoreURL: config.config.php_documentation_base_url.functions + word,
            className: element.args.deprecated ? 'php-atom-autocomplete-strike' : '',
            snippet: insertParameterList ? this.getFunctionSnippet(word, element.args) : null,
            displayText: this.getFunctionSignature(word, element.args),
            replacementPrefix: prefix
          });
        }
      }
      return suggestions;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUpuQixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUixDQU5ULENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBRUE7QUFBQTs7O09BRkE7O0FBQUEsK0JBTUEsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFFZCxVQUFBLDZHQUFBO0FBQUEsTUFGZ0IsY0FBQSxRQUFRLHNCQUFBLGdCQUFnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUV6RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLDZDQUFULENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkIsQ0FGVCxDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQUhBO0FBQUEsTUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBQUssQ0FBQyxTQUFOLENBQUEsQ0FMYixDQUFBO0FBTUEsTUFBQSxJQUFjLCtEQUFkO0FBQUEsY0FBQSxDQUFBO09BTkE7QUFBQSxNQVFBLG9CQUFBLEdBQXVCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsY0FBRCxFQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixjQUFjLENBQUMsTUFBZixHQUF3QixDQUE3QyxDQUFqQixDQUF0QixDQVJ2QixDQUFBO0FBQUEsTUFTQSxtQkFBQSxHQUF5QixvQkFBQSxLQUF3QixHQUEzQixHQUFvQyxLQUFwQyxHQUErQyxJQVRyRSxDQUFBO0FBQUEsTUFXQSxXQUFBLEdBQWMsSUFBQyxDQUFBLHdCQUFELENBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBMUIsRUFBeUMsbUJBQXpDLENBWGQsQ0FBQTtBQVlBLE1BQUEsSUFBQSxDQUFBLFdBQXlCLENBQUMsTUFBMUI7QUFBQSxjQUFBLENBQUE7T0FaQTtBQWFBLGFBQU8sV0FBUCxDQWZjO0lBQUEsQ0FObEIsQ0FBQTs7QUF1QkE7QUFBQTs7Ozs7OztPQXZCQTs7QUFBQSwrQkErQkEsd0JBQUEsR0FBMEIsU0FBQyxNQUFELEVBQVMsbUJBQVQsR0FBQTtBQUV0QixVQUFBLDREQUFBOztRQUYrQixzQkFBc0I7T0FFckQ7QUFBQSxNQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQTdCLEVBQW9DLE1BQXBDLENBQVIsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUlBLFdBQUEsNENBQUE7eUJBQUE7QUFDSTtBQUFBLGFBQUEsNkNBQUE7NkJBQUE7QUFDSSxVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQ0k7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFDQSxJQUFBLEVBQU0sVUFETjtBQUFBLFlBRUEsV0FBQSxFQUFhLHdCQUZiO0FBQUEsWUFHQSxrQkFBQSxFQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLFNBQXpDLEdBQXFELElBSHpFO0FBQUEsWUFJQSxTQUFBLEVBQWMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFoQixHQUFnQyw4QkFBaEMsR0FBb0UsRUFKL0U7QUFBQSxZQUtBLE9BQUEsRUFBWSxtQkFBSCxHQUE0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsT0FBTyxDQUFDLElBQWxDLENBQTVCLEdBQXlFLElBTGxGO0FBQUEsWUFNQSxXQUFBLEVBQWEsSUFBQyxDQUFBLG9CQUFELENBQXNCLElBQXRCLEVBQTRCLE9BQU8sQ0FBQyxJQUFwQyxDQU5iO0FBQUEsWUFPQSxpQkFBQSxFQUFtQixNQVBuQjtXQURKLENBQUEsQ0FESjtBQUFBLFNBREo7QUFBQSxPQUpBO0FBZ0JBLGFBQU8sV0FBUCxDQWxCc0I7SUFBQSxDQS9CMUIsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQVgvQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/autocompletion/function-provider.coffee
