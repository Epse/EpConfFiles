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
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([a-z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.functions = proxy.functions();
      if (this.functions.names == null) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUFiLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FIVCxDQUFBOztBQUFBLEVBSUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBSm5CLENBQUE7O0FBQUEsRUFNQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSLENBTlQsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBR007QUFDRix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsU0FBQSxHQUFXLEVBQVgsQ0FBQTs7QUFFQTtBQUFBOzs7T0FGQTs7QUFBQSwrQkFNQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUVkLFVBQUEsdUdBQUE7QUFBQSxNQUZnQixjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BRXpELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsNkNBQVQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQixDQUZULENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxNQUFvQixDQUFDLE1BQXJCO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBSyxDQUFDLFNBQU4sQ0FBQSxDQUxiLENBQUE7QUFNQSxNQUFBLElBQWMsNEJBQWQ7QUFBQSxjQUFBLENBQUE7T0FOQTtBQUFBLE1BUUEsb0JBQUEsR0FBdUIsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxjQUFELEVBQWlCLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLENBQTdDLENBQWpCLENBQXRCLENBUnZCLENBQUE7QUFBQSxNQVNBLG1CQUFBLEdBQXlCLG9CQUFBLEtBQXdCLEdBQTNCLEdBQW9DLEtBQXBDLEdBQStDLElBVHJFLENBQUE7QUFBQSxNQVdBLFdBQUEsR0FBYyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUExQixFQUF5QyxtQkFBekMsQ0FYZCxDQUFBO0FBWUEsTUFBQSxJQUFBLENBQUEsV0FBeUIsQ0FBQyxNQUExQjtBQUFBLGNBQUEsQ0FBQTtPQVpBO0FBYUEsYUFBTyxXQUFQLENBZmM7SUFBQSxDQU5sQixDQUFBOztBQXVCQTtBQUFBOzs7Ozs7O09BdkJBOztBQUFBLCtCQStCQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQsRUFBUyxtQkFBVCxHQUFBO0FBRXRCLFVBQUEsNERBQUE7O1FBRitCLHNCQUFzQjtPQUVyRDtBQUFBLE1BQUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxNQUFYLENBQWtCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBN0IsRUFBb0MsTUFBcEMsQ0FBUixDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsRUFIZCxDQUFBO0FBSUEsV0FBQSw0Q0FBQTt5QkFBQTtBQUNJO0FBQUEsYUFBQSw2Q0FBQTs2QkFBQTtBQUNJLFVBQUEsV0FBVyxDQUFDLElBQVosQ0FDSTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxZQUNBLElBQUEsRUFBTSxVQUROO0FBQUEsWUFFQSxXQUFBLEVBQWEsd0JBRmI7QUFBQSxZQUdBLGtCQUFBLEVBQW9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsU0FBekMsR0FBcUQsSUFIekU7QUFBQSxZQUlBLFNBQUEsRUFBYyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQWhCLEdBQWdDLDhCQUFoQyxHQUFvRSxFQUovRTtBQUFBLFlBS0EsT0FBQSxFQUFZLG1CQUFILEdBQTRCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFwQixFQUEwQixPQUFPLENBQUMsSUFBbEMsQ0FBNUIsR0FBeUUsSUFMbEY7QUFBQSxZQU1BLFdBQUEsRUFBYSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsSUFBdEIsRUFBNEIsT0FBTyxDQUFDLElBQXBDLENBTmI7QUFBQSxZQU9BLGlCQUFBLEVBQW1CLE1BUG5CO1dBREosQ0FBQSxDQURKO0FBQUEsU0FESjtBQUFBLE9BSkE7QUFnQkEsYUFBTyxXQUFQLENBbEJzQjtJQUFBLENBL0IxQixDQUFBOzs0QkFBQTs7S0FEMkIsaUJBWC9CLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/function-provider.coffee
