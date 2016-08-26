(function() {
  var AbstractProvider, ConstantProvider, config, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = ConstantProvider = (function(_super) {
    __extends(ConstantProvider, _super);

    function ConstantProvider() {
      return ConstantProvider.__super__.constructor.apply(this, arguments);
    }

    ConstantProvider.prototype.constants = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ConstantProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([A-Z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.constants = proxy.constants();
      if (this.constants.names == null) {
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

    ConstantProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var element, suggestions, word, words, _i, _j, _len, _len1, _ref;
      words = fuzzaldrin.filter(this.constants.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        _ref = this.constants.values[word];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          suggestions.push({
            text: word,
            type: 'constant',
            description: 'Built-in PHP constant.'
          });
        }
      }
      return suggestions;
    };

    return ConstantProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy9jb25zdGFudC1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUFiLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FIVCxDQUFBOztBQUFBLEVBSUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBSm5CLENBQUE7O0FBQUEsRUFNQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSLENBTlQsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBR007QUFDRix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsU0FBQSxHQUFXLEVBQVgsQ0FBQTs7QUFFQTtBQUFBOzs7T0FGQTs7QUFBQSwrQkFNQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUVkLFVBQUEsNERBQUE7QUFBQSxNQUZnQixjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BRXpELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsNkNBQVQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQixDQUZULENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxNQUFvQixDQUFDLE1BQXJCO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBSyxDQUFDLFNBQU4sQ0FBQSxDQUxiLENBQUE7QUFNQSxNQUFBLElBQWMsNEJBQWQ7QUFBQSxjQUFBLENBQUE7T0FOQTtBQUFBLE1BUUEsV0FBQSxHQUFjLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTFCLENBUmQsQ0FBQTtBQVNBLE1BQUEsSUFBQSxDQUFBLFdBQXlCLENBQUMsTUFBMUI7QUFBQSxjQUFBLENBQUE7T0FUQTtBQVVBLGFBQU8sV0FBUCxDQVpjO0lBQUEsQ0FObEIsQ0FBQTs7QUFvQkE7QUFBQTs7OztPQXBCQTs7QUFBQSwrQkF5QkEsd0JBQUEsR0FBMEIsU0FBQyxNQUFELEdBQUE7QUFFdEIsVUFBQSw0REFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxNQUFYLENBQWtCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBN0IsRUFBb0MsTUFBcEMsQ0FBUixDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsRUFIZCxDQUFBO0FBSUEsV0FBQSw0Q0FBQTt5QkFBQTtBQUNJO0FBQUEsYUFBQSw2Q0FBQTs2QkFBQTtBQUNJLFVBQUEsV0FBVyxDQUFDLElBQVosQ0FDSTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxZQUNBLElBQUEsRUFBTSxVQUROO0FBQUEsWUFFQSxXQUFBLEVBQWEsd0JBRmI7V0FESixDQUFBLENBREo7QUFBQSxTQURKO0FBQUEsT0FKQTtBQVdBLGFBQU8sV0FBUCxDQWJzQjtJQUFBLENBekIxQixDQUFBOzs0QkFBQTs7S0FEMkIsaUJBWC9CLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/constant-provider.coffee
