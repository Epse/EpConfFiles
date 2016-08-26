(function() {
  var AbstractProvider, ClassProvider, exec, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = ClassProvider = (function(_super) {
    var classes;

    __extends(ClassProvider, _super);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    classes = [];

    ClassProvider.prototype.disableForSelector = '.source.php .string';


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ClassProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, scopeDescriptor, suggestions, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /((?:new|use)?(?:[^a-z0-9_])\\?(?:[A-Z][a-zA-Z_\\]*)+)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.classes = proxy.classes();
      if (((_ref = this.classes) != null ? _ref.autocomplete : void 0) == null) {
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
     * Returns suggestions available matching the given prefix
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    ClassProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var args, instantiation, suggestions, use, word, words, _i, _len;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      instantiation = false;
      use = false;
      if (prefix.indexOf("new \\") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new \\/, '');
      } else if (prefix.indexOf("new ") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new /, '');
      } else if (prefix.indexOf("use ") !== -1) {
        use = true;
        prefix = prefix.replace(/use /, '');
      }
      if (prefix.indexOf("\\") === 0) {
        prefix = prefix.substring(1, prefix.length);
      }
      words = fuzzaldrin.filter(this.classes.autocomplete, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        if (word !== prefix) {
          if (instantiation && this.classes.mapping[word].methods.constructor.has) {
            args = this.classes.mapping[word].methods.constructor.args;
            suggestions.push({
              text: word,
              type: 'class',
              snippet: insertParameterList ? this.getFunctionSnippet(word, args) : null,
              displayText: this.getFunctionSignature(word, args),
              data: {
                kind: 'instantiation',
                prefix: prefix,
                replacementPrefix: prefix
              }
            });
          } else if (use) {
            suggestions.push({
              text: word,
              type: 'class',
              prefix: prefix,
              replacementPrefix: prefix,
              data: {
                kind: 'use'
              }
            });
          } else {
            suggestions.push({
              text: word,
              type: 'class',
              data: {
                kind: 'static',
                prefix: prefix,
                replacementPrefix: prefix
              }
            });
          }
        }
      }
      return suggestions;
    };


    /**
     * Adds the missing use if needed
     * @param {TextEditor} editor
     * @param {Position}   triggerPosition
     * @param {object}     suggestion
     */

    ClassProvider.prototype.onDidInsertSuggestion = function(_arg) {
      var added, editor, lineEnd, lineStart, name, nameLength, splits, suggestion, triggerPosition, wordStart, _ref;
      editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
      if (!((_ref = suggestion.data) != null ? _ref.kind : void 0)) {
        return;
      }
      if (suggestion.data.kind === 'instantiation' || suggestion.data.kind === 'static') {
        added = parser.addUseClass(editor, suggestion.text);
        if (added != null) {
          name = suggestion.text;
          splits = name.split('\\');
          nameLength = splits[splits.length - 1].length;
          wordStart = triggerPosition.column - suggestion.data.prefix.length;
          lineStart = added === "added" ? triggerPosition.row + 1 : triggerPosition.row;
          if (suggestion.data.kind === 'instantiation') {
            lineEnd = wordStart + name.length - nameLength - splits.length + 1;
          } else {
            lineEnd = wordStart + name.length - nameLength;
          }
          return editor.setTextInBufferRange([[lineStart, wordStart], [lineStart, lineEnd]], "");
        }
      }
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Byb3ZpZGVycy9jbGFzcy1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0VBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUFiLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUixDQUhSLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBSlQsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUxuQixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FHTTtBQUNGLFFBQUEsT0FBQTs7QUFBQSxvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBOztBQUFBLDRCQUNBLGtCQUFBLEdBQW9CLHFCQURwQixDQUFBOztBQUdBO0FBQUE7OztPQUhBOztBQUFBLDRCQU9BLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO0FBRWQsVUFBQSw2R0FBQTtBQUFBLE1BRmdCLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsdUJBQUEsaUJBQWlCLGNBQUEsTUFFekQsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyx3REFBVCxDQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CLENBRlQsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUFLLENBQUMsT0FBTixDQUFBLENBTFgsQ0FBQTtBQU1BLE1BQUEsSUFBYyxvRUFBZDtBQUFBLGNBQUEsQ0FBQTtPQU5BO0FBQUEsTUFRQSxvQkFBQSxHQUF1QixNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLGNBQUQsRUFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBN0MsQ0FBakIsQ0FBdEIsQ0FSdkIsQ0FBQTtBQUFBLE1BU0EsbUJBQUEsR0FBeUIsb0JBQUEsS0FBd0IsR0FBM0IsR0FBb0MsS0FBcEMsR0FBK0MsSUFUckUsQ0FBQTtBQUFBLE1BV0EsV0FBQSxHQUFjLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTFCLEVBQXlDLG1CQUF6QyxDQVhkLENBQUE7QUFZQSxNQUFBLElBQUEsQ0FBQSxXQUF5QixDQUFDLE1BQTFCO0FBQUEsY0FBQSxDQUFBO09BWkE7QUFhQSxhQUFPLFdBQVAsQ0FmYztJQUFBLENBUGxCLENBQUE7O0FBd0JBO0FBQUE7Ozs7O09BeEJBOztBQUFBLDRCQThCQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQsRUFBUyxtQkFBVCxHQUFBO0FBRXRCLFVBQUEsNERBQUE7O1FBRitCLHNCQUFzQjtPQUVyRDtBQUFBLE1BQUEsYUFBQSxHQUFnQixLQUFoQixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sS0FETixDQUFBO0FBR0EsTUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQUFBLEtBQTRCLENBQUEsQ0FBL0I7QUFDSSxRQUFBLGFBQUEsR0FBZ0IsSUFBaEIsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixFQUF5QixFQUF6QixDQURULENBREo7T0FBQSxNQUdLLElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLENBQUEsS0FBMEIsQ0FBQSxDQUE3QjtBQUNELFFBQUEsYUFBQSxHQUFnQixJQUFoQixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLEVBQXVCLEVBQXZCLENBRFQsQ0FEQztPQUFBLE1BR0EsSUFBRyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsQ0FBQSxLQUEwQixDQUFBLENBQTdCO0FBQ0QsUUFBQSxHQUFBLEdBQU0sSUFBTixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLEVBQXVCLEVBQXZCLENBRFQsQ0FEQztPQVRMO0FBYUEsTUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixDQUFBLEtBQXdCLENBQTNCO0FBQ0ksUUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakIsRUFBb0IsTUFBTSxDQUFDLE1BQTNCLENBQVQsQ0FESjtPQWJBO0FBQUEsTUFpQkEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxNQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBM0IsRUFBeUMsTUFBekMsQ0FqQlIsQ0FBQTtBQUFBLE1Bb0JBLFdBQUEsR0FBYyxFQXBCZCxDQUFBO0FBc0JBLFdBQUEsNENBQUE7eUJBQUE7WUFBdUIsSUFBQSxLQUFVO0FBRTdCLFVBQUEsSUFBRyxhQUFBLElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBUSxDQUFBLElBQUEsQ0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBaEU7QUFDSSxZQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVEsQ0FBQSxJQUFBLENBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQWxELENBQUE7QUFBQSxZQUVBLFdBQVcsQ0FBQyxJQUFaLENBQ0k7QUFBQSxjQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsY0FDQSxJQUFBLEVBQU0sT0FETjtBQUFBLGNBRUEsT0FBQSxFQUFZLG1CQUFILEdBQTRCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFwQixFQUEwQixJQUExQixDQUE1QixHQUFpRSxJQUYxRTtBQUFBLGNBR0EsV0FBQSxFQUFhLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixJQUF0QixFQUE0QixJQUE1QixDQUhiO0FBQUEsY0FJQSxJQUFBLEVBQ0k7QUFBQSxnQkFBQSxJQUFBLEVBQU0sZUFBTjtBQUFBLGdCQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsZ0JBRUEsaUJBQUEsRUFBbUIsTUFGbkI7ZUFMSjthQURKLENBRkEsQ0FESjtXQUFBLE1BYUssSUFBRyxHQUFIO0FBQ0QsWUFBQSxXQUFXLENBQUMsSUFBWixDQUNJO0FBQUEsY0FBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLGNBQ0EsSUFBQSxFQUFNLE9BRE47QUFBQSxjQUVBLE1BQUEsRUFBUSxNQUZSO0FBQUEsY0FHQSxpQkFBQSxFQUFtQixNQUhuQjtBQUFBLGNBSUEsSUFBQSxFQUNJO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLEtBQU47ZUFMSjthQURKLENBQUEsQ0FEQztXQUFBLE1BQUE7QUFXRCxZQUFBLFdBQVcsQ0FBQyxJQUFaLENBQ0k7QUFBQSxjQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsY0FDQSxJQUFBLEVBQU0sT0FETjtBQUFBLGNBRUEsSUFBQSxFQUNJO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxnQkFDQSxNQUFBLEVBQVEsTUFEUjtBQUFBLGdCQUVBLGlCQUFBLEVBQW1CLE1BRm5CO2VBSEo7YUFESixDQUFBLENBWEM7O1NBZlQ7QUFBQSxPQXRCQTtBQXdEQSxhQUFPLFdBQVAsQ0ExRHNCO0lBQUEsQ0E5QjFCLENBQUE7O0FBMEZBO0FBQUE7Ozs7O09BMUZBOztBQUFBLDRCQWdHQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsR0FBQTtBQUNuQixVQUFBLHlHQUFBO0FBQUEsTUFEcUIsY0FBQSxRQUFRLHVCQUFBLGlCQUFpQixrQkFBQSxVQUM5QyxDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsd0NBQTZCLENBQUUsY0FBL0I7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUVBLE1BQUEsSUFBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQWhCLEtBQXdCLGVBQXhCLElBQTJDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBaEIsS0FBd0IsUUFBdEU7QUFDSSxRQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQixFQUEyQixVQUFVLENBQUMsSUFBdEMsQ0FBUixDQUFBO0FBR0EsUUFBQSxJQUFHLGFBQUg7QUFDSSxVQUFBLElBQUEsR0FBTyxVQUFVLENBQUMsSUFBbEIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQURULENBQUE7QUFBQSxVQUdBLFVBQUEsR0FBYSxNQUFPLENBQUEsTUFBTSxDQUFDLE1BQVAsR0FBYyxDQUFkLENBQWdCLENBQUMsTUFIckMsQ0FBQTtBQUFBLFVBSUEsU0FBQSxHQUFZLGVBQWUsQ0FBQyxNQUFoQixHQUF5QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUo1RCxDQUFBO0FBQUEsVUFLQSxTQUFBLEdBQWUsS0FBQSxLQUFTLE9BQVosR0FBeUIsZUFBZSxDQUFDLEdBQWhCLEdBQXNCLENBQS9DLEdBQXNELGVBQWUsQ0FBQyxHQUxsRixDQUFBO0FBT0EsVUFBQSxJQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBaEIsS0FBd0IsZUFBM0I7QUFDSSxZQUFBLE9BQUEsR0FBVSxTQUFBLEdBQVksSUFBSSxDQUFDLE1BQWpCLEdBQTBCLFVBQTFCLEdBQXVDLE1BQU0sQ0FBQyxNQUE5QyxHQUF1RCxDQUFqRSxDQURKO1dBQUEsTUFBQTtBQUdJLFlBQUEsT0FBQSxHQUFVLFNBQUEsR0FBWSxJQUFJLENBQUMsTUFBakIsR0FBMEIsVUFBcEMsQ0FISjtXQVBBO2lCQVlBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUN4QixDQUFDLFNBQUQsRUFBWSxTQUFaLENBRHdCLEVBRXhCLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FGd0IsQ0FBNUIsRUFHRyxFQUhILEVBYko7U0FKSjtPQUhtQjtJQUFBLENBaEd2QixDQUFBOzt5QkFBQTs7S0FEd0IsaUJBVjVCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/providers/class-provider.coffee
