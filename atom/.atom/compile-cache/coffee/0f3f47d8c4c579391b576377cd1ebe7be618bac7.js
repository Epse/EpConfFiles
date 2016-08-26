(function() {
  var AbstractProvider, parser;

  parser = require("../services/php-file-parser.coffee");

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = '';

    AbstractProvider.prototype.selector = '.source.php';

    AbstractProvider.prototype.inclusionPriority = 1;

    AbstractProvider.prototype.disableForSelector = '.source.php .comment, .source.php .string';

    AbstractProvider.prototype.functionOnly = false;


    /**
     * Entry point of all request from autocomplete-plus
     * Calls @fetchSuggestion in the provider if allowed
     * @return array Suggestions
     */

    AbstractProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      if (this.functionOnly === true && !parser.isInFunction(editor, bufferPosition)) {
        return;
      }
      return this.fetchSuggestions({
        editor: editor,
        bufferPosition: bufferPosition,
        scopeDescriptor: scopeDescriptor,
        prefix: prefix
      });
    };


    /**
     * Builds a snippet for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the snippet (parameters, optionals)
     * @return string The snippet
     */

    AbstractProvider.prototype.getFunctionSnippet = function(word, elements) {
      var arg, body, index, lastIndex, _i, _j, _len, _len1, _ref, _ref1;
      body = word + "(";
      lastIndex = 0;
      _ref = elements.parameters;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        arg = _ref[index];
        if (index !== 0) {
          body += ", ";
        }
        body += "${" + (index + 1) + ":" + arg + "}";
        lastIndex = index + 1;
      }
      if (elements.optionals.length > 0) {
        body += "${" + (lastIndex + 1) + ":[";
        if (lastIndex !== 0) {
          body += ",";
        }
        lastIndex += 1;
        _ref1 = elements.optionals;
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          arg = _ref1[index];
          if (index !== 0) {
            body += ", ";
          }
          body += arg;
        }
        body += "]}";
      }
      body += ")";
      body += "$0";
      return body;
    };


    /**
     * Builds the signature for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the signature (parameters, optionals)
     * @return string The signature
     */

    AbstractProvider.prototype.getFunctionSignature = function(word, element) {
      var signature, snippet;
      snippet = this.getFunctionSnippet(word, element);
      signature = snippet.replace(/\$\{\d+:([^\}]+)\}/g, '$1');
      return signature.slice(0, -2);
    };


    /**
     * Get prefix from bufferPosition and @regex
     * @return string
     */

    AbstractProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, match, matches, start, word, _i, _len;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(this.regex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          match = matches[_i];
          start = bufferPosition.column - match.length;
          if (start >= 0) {
            word = editor.getTextInBufferRange([[bufferPosition.row, bufferPosition.column - match.length], bufferPosition]);
            if (word === match) {
              if (match[0] === '{' || match[0] === '(' || match[0] === '[') {
                match = match.substring(1);
              }
              return match;
            }
          }
        }
      }
      return '';
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBR007a0NBQ0Y7O0FBQUEsK0JBQUEsS0FBQSxHQUFPLEVBQVAsQ0FBQTs7QUFBQSwrQkFDQSxRQUFBLEdBQVUsYUFEVixDQUFBOztBQUFBLCtCQUdBLGlCQUFBLEdBQW1CLENBSG5CLENBQUE7O0FBQUEsK0JBS0Esa0JBQUEsR0FBb0IsMkNBTHBCLENBQUE7O0FBQUEsK0JBUUEsWUFBQSxHQUFjLEtBUmQsQ0FBQTs7QUFVQTtBQUFBOzs7O09BVkE7O0FBQUEsK0JBZUEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsK0NBQUE7QUFBQSxNQURjLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFDdkQsQ0FBQTtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsWUFBRCxLQUFpQixJQUFqQixJQUEwQixDQUFBLE1BQVUsQ0FBQyxZQUFQLENBQW9CLE1BQXBCLEVBQTRCLGNBQTVCLENBQXhDO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFFQSxhQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFrQjtBQUFBLFFBQUMsUUFBQSxNQUFEO0FBQUEsUUFBUyxnQkFBQSxjQUFUO0FBQUEsUUFBeUIsaUJBQUEsZUFBekI7QUFBQSxRQUEwQyxRQUFBLE1BQTFDO09BQWxCLENBQVAsQ0FIWTtJQUFBLENBZmhCLENBQUE7O0FBb0JBO0FBQUE7Ozs7O09BcEJBOztBQUFBLCtC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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/abstract-provider.coffee
