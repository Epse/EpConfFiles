(function() {
  var AbstractProvider, VariableProvider, fuzzaldrin, parser,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = VariableProvider = (function(_super) {
    __extends(VariableProvider, _super);

    function VariableProvider() {
      return VariableProvider.__super__.constructor.apply(this, arguments);
    }

    VariableProvider.prototype.variables = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    VariableProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(\$[a-zA-Z_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.variables = parser.getAllVariablesInFunction(editor, bufferPosition);
      if (!this.variables.length) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix.trim());
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix Prefix to match
     * @return array
     */

    VariableProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var suggestions, word, words, _i, _len;
      words = fuzzaldrin.filter(this.variables, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        suggestions.push({
          text: word,
          type: 'variable',
          replacementPrefix: prefix
        });
      }
      return suggestions;
    };

    return VariableProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy92YXJpYWJsZS1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUFiLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUhuQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FHTTtBQUNGLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwrQkFBQSxTQUFBLEdBQVcsRUFBWCxDQUFBOztBQUVBO0FBQUE7OztPQUZBOztBQUFBLCtCQU1BLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO0FBRWQsVUFBQSw0REFBQTtBQUFBLE1BRmdCLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFFekQsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxpQkFBVCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CLENBRlQsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMseUJBQVAsQ0FBaUMsTUFBakMsRUFBeUMsY0FBekMsQ0FMYixDQUFBO0FBTUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLFNBQVMsQ0FBQyxNQUF6QjtBQUFBLGNBQUEsQ0FBQTtPQU5BO0FBQUEsTUFRQSxXQUFBLEdBQWMsSUFBQyxDQUFBLHdCQUFELENBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBMUIsQ0FSZCxDQUFBO0FBU0EsTUFBQSxJQUFBLENBQUEsV0FBeUIsQ0FBQyxNQUExQjtBQUFBLGNBQUEsQ0FBQTtPQVRBO0FBVUEsYUFBTyxXQUFQLENBWmM7SUFBQSxDQU5sQixDQUFBOztBQW9CQTtBQUFBOzs7O09BcEJBOztBQUFBLCtCQXlCQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtBQUV0QixVQUFBLGtDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CLEVBQThCLE1BQTlCLENBQVIsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUlBLFdBQUEsNENBQUE7eUJBQUE7QUFDSSxRQUFBLFdBQVcsQ0FBQyxJQUFaLENBQ0k7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsVUFDQSxJQUFBLEVBQU0sVUFETjtBQUFBLFVBRUEsaUJBQUEsRUFBbUIsTUFGbkI7U0FESixDQUFBLENBREo7QUFBQSxPQUpBO0FBVUEsYUFBTyxXQUFQLENBWnNCO0lBQUEsQ0F6QjFCLENBQUE7OzRCQUFBOztLQUQyQixpQkFSL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/variable-provider.coffee
