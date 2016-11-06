(function() {
  var AbstractProvider, parser;

  parser = require("../services/php-file-parser.coffee");

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = '';

    AbstractProvider.prototype.selector = '.source.php';

    AbstractProvider.prototype.inclusionPriority = 10;

    AbstractProvider.prototype.disableForSelector = '.source.php .comment, .source.php .string';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {};


    /**
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {};


    /**
     * Entry point of all request from autocomplete-plus
     * Calls @fetchSuggestion in the provider if allowed
     * @return array Suggestions
     */

    AbstractProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
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
        body += " ${" + (lastIndex + 1) + ":[";
        if (lastIndex !== 0) {
          body += ", ";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUFULENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUdNO2tDQUNGOztBQUFBLCtCQUFBLEtBQUEsR0FBTyxFQUFQLENBQUE7O0FBQUEsK0JBQ0EsUUFBQSxHQUFVLGFBRFYsQ0FBQTs7QUFBQSwrQkFHQSxpQkFBQSxHQUFtQixFQUhuQixDQUFBOztBQUFBLCtCQUtBLGtCQUFBLEdBQW9CLDJDQUxwQixDQUFBOztBQU9BO0FBQUE7O09BUEE7O0FBQUEsK0JBVUEsSUFBQSxHQUFNLFNBQUEsR0FBQSxDQVZOLENBQUE7O0FBWUE7QUFBQTs7T0FaQTs7QUFBQSwrQkFlQSxVQUFBLEdBQVksU0FBQSxHQUFBLENBZlosQ0FBQTs7QUFpQkE7QUFBQTs7OztPQWpCQTs7QUFBQSwrQkFzQkEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsK0NBQUE7QUFBQSxNQURjLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFDdkQsQ0FBQTtBQUFBLGFBQU8sSUFBQyxDQUFBLGdCQUFELENBQWtCO0FBQUEsUUFBQyxRQUFBLE1BQUQ7QUFBQSxRQUFTLGdCQUFBLGNBQVQ7QUFBQSxRQUF5QixpQkFBQSxlQUF6QjtBQUFBLFFBQTBDLFFBQUEsTUFBMUM7T0FBbEIsQ0FBUCxDQURZO0lBQUEsQ0F0QmhCLENBQUE7O0FBeUJBO0FBQUE7Ozs7O09BekJBOztBQUFBLCtCQStCQSxr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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/autocompletion/abstract-provider.coffee
