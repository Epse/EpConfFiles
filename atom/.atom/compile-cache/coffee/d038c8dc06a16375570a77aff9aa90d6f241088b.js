(function() {
  var AbstractProvider, MemberProvider, exec, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = MemberProvider = (function(_super) {
    __extends(MemberProvider, _super);

    function MemberProvider() {
      return MemberProvider.__super__.constructor.apply(this, arguments);
    }

    MemberProvider.prototype.methods = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    MemberProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, classInfo, className, currentClass, currentClassParents, editor, elements, insertParameterList, mustBeStatic, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:[a-zA-Z0-9_]*)\s*(?:\(.*\))?\s*(?:->|::)\s*)+([a-zA-Z0-9_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      elements = parser.getStackClasses(editor, bufferPosition);
      if (elements == null) {
        return;
      }
      className = parser.parseElements(editor, bufferPosition, elements);
      if (className == null) {
        return;
      }
      elements = prefix.split(/(->|::)/);
      if (!(elements.length > 2)) {
        return;
      }
      currentClass = parser.getFullClassName(editor);
      currentClassParents = [];
      if (currentClass) {
        classInfo = proxy.methods(currentClass);
        currentClassParents = (classInfo != null ? classInfo.parents : void 0) ? classInfo != null ? classInfo.parents : void 0 : [];
      }
      mustBeStatic = false;
      if (elements[elements.length - 2] === '::' && elements[elements.length - 3].trim() !== 'parent') {
        mustBeStatic = true;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(className, elements[elements.length - 1].trim(), (function(_this) {
        return function(element) {
          var _ref;
          if (mustBeStatic && !element.isStatic) {
            return false;
          }
          if (element.isPrivate && element.declaringClass.name !== currentClass) {
            return false;
          }
          if (element.isProtected && element.declaringClass.name !== currentClass && (_ref = element.declaringClass.name, __indexOf.call(currentClassParents, _ref) < 0)) {
            return false;
          }
          if (!element.isMethod && !element.isProperty && !mustBeStatic) {
            return false;
          }
          return true;
        };
      })(this), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string}   className           The name of the class to show members of.
     * @param {string}   prefix              Prefix to match (may be left empty to list all members).
     * @param {callback} filterCallback      A callback that should return true if the item should be added to the
     *                                       suggestions list.
     * @param {bool}     insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    MemberProvider.prototype.findSuggestionsForPrefix = function(className, prefix, filterCallback, insertParameterList) {
      var displayText, ele, element, methods, returnValue, returnValueParts, snippet, suggestions, type, word, words, _i, _j, _len, _len1;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      methods = proxy.methods(className);
      if (!(methods != null ? methods.names : void 0)) {
        return [];
      }
      words = fuzzaldrin.filter(methods.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        element = methods.values[word];
        if (!(element instanceof Array)) {
          element = [element];
        }
        for (_j = 0, _len1 = element.length; _j < _len1; _j++) {
          ele = element[_j];
          if (filterCallback && !filterCallback(ele)) {
            continue;
          }
          snippet = null;
          displayText = word;
          returnValueParts = ele.args["return"] ? ele.args["return"].split('\\') : [];
          returnValue = returnValueParts[returnValueParts.length - 1];
          if (ele.isMethod) {
            type = 'method';
            snippet = insertParameterList ? this.getFunctionSnippet(word, ele.args) : null;
            displayText = this.getFunctionSignature(word, ele.args);
          } else if (ele.isProperty) {
            type = 'property';
          } else {
            type = 'constant';
          }
          suggestions.push({
            text: word,
            type: type,
            snippet: snippet,
            displayText: displayText,
            leftLabel: returnValue,
            description: ele.args.descriptions.short != null ? ele.args.descriptions.short : '',
            className: ele.args.deprecated ? 'php-atom-autocomplete-strike' : ''
          });
        }
      }
      return suggestions;
    };

    return MemberProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy9tZW1iZXItcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUlBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FKVCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBQ0YscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLE9BQUEsR0FBUyxFQUFULENBQUE7O0FBRUE7QUFBQTs7O09BRkE7O0FBQUEsNkJBTUEsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFFZCxVQUFBLHdMQUFBO0FBQUEsTUFGZ0IsY0FBQSxRQUFRLHNCQUFBLGdCQUFnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUV6RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLHFFQUFULENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkIsQ0FGVCxDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQUhBO0FBQUEsTUFLQSxRQUFBLEdBQVcsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsTUFBdkIsRUFB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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/member-provider.coffee
