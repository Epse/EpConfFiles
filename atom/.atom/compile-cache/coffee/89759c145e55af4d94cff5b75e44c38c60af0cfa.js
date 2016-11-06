(function() {
  var CompositeDisposable, PigmentsProvider, variablesRegExp, _, _ref;

  _ref = [], CompositeDisposable = _ref[0], variablesRegExp = _ref[1], _ = _ref[2];

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.selector = atom.config.get('pigments.autocompleteScopes').join(',');
      this.subscriptions.add(atom.config.observe('pigments.autocompleteScopes', (function(_this) {
        return function(scopes) {
          return _this.selector = scopes.join(',');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToVariables', (function(_this) {
        return function(extendAutocompleteToVariables) {
          _this.extendAutocompleteToVariables = extendAutocompleteToVariables;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToColorValue', (function(_this) {
        return function(extendAutocompleteToColorValue) {
          _this.extendAutocompleteToColorValue = extendAutocompleteToColorValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.autocompleteSuggestionsFromValue', (function(_this) {
        return function(autocompleteSuggestionsFromValue) {
          _this.autocompleteSuggestionsFromValue = autocompleteSuggestionsFromValue;
        };
      })(this)));
    }

    PigmentsProvider.prototype.dispose = function() {
      this.disposed = true;
      this.subscriptions.dispose();
      return this.pigments = null;
    };

    PigmentsProvider.prototype.getProject = function() {
      if (this.disposed) {
        return;
      }
      return this.pigments.getProject();
    };

    PigmentsProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, project, suggestions, variables;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      if (this.disposed) {
        return;
      }
      prefix = this.getPrefix(editor, bufferPosition);
      project = this.getProject();
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      if (project == null) {
        return;
      }
      if (this.extendAutocompleteToVariables) {
        variables = project.getVariables();
      } else {
        variables = project.getColorVariables();
      }
      suggestions = this.findSuggestionsForPrefix(variables, prefix);
      return suggestions;
    };

    PigmentsProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (this.autocompleteSuggestionsFromValue) {
        return (_ref1 = (_ref2 = (_ref3 = (_ref4 = (_ref5 = line.match(/(?:#[a-fA-F0-9]*|rgb.+)$/)) != null ? _ref5[0] : void 0) != null ? _ref4 : (_ref6 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref6[0] : void 0) != null ? _ref3 : (_ref7 = line.match(/:\s*([^\s].+)$/)) != null ? _ref7[1] : void 0) != null ? _ref2 : (_ref8 = line.match(/^\s*([^\s].+)$/)) != null ? _ref8[1] : void 0) != null ? _ref1 : '';
      } else {
        return ((_ref9 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref9[0] : void 0) || '';
      }
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, matchesColorValue, re, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      re = RegExp("^" + (_.escapeRegExp(prefix).replace(/,\s*/, '\\s*,\\s*')));
      suggestions = [];
      matchesColorValue = function(v) {
        var res;
        res = re.test(v.value);
        if (v.color != null) {
          res || (res = v.color.suggestionValues.some(function(s) {
            return re.test(s);
          }));
        }
        return res;
      };
      matchedVariables = variables.filter((function(_this) {
        return function(v) {
          return !v.isAlternate && re.test(v.name) || (_this.autocompleteSuggestionsFromValue && matchesColorValue(v));
        };
      })(this));
      matchedVariables.forEach((function(_this) {
        return function(v) {
          var color, rightLabelHTML;
          if (v.isColor) {
            color = v.color.alpha === 1 ? '#' + v.color.hex : v.color.toCSS();
            rightLabelHTML = "<span class='color-suggestion-preview' style='background: " + (v.color.toCSS()) + "'></span>";
            if (_this.extendAutocompleteToColorValue) {
              rightLabelHTML = "" + color + " " + rightLabelHTML;
            }
            return suggestions.push({
              text: v.name,
              rightLabelHTML: rightLabelHTML,
              replacementPrefix: prefix,
              className: 'color-suggestion'
            });
          } else {
            return suggestions.push({
              text: v.name,
              rightLabel: v.value,
              replacementPrefix: prefix,
              className: 'pigments-suggestion'
            });
          }
        };
      })(this));
      return suggestions;
    };

    return PigmentsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9waWdtZW50cy1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0RBQUE7O0FBQUEsRUFBQSxPQUVJLEVBRkosRUFDRSw2QkFERixFQUN1Qix5QkFEdkIsRUFDd0MsV0FEeEMsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLDBCQUFFLFFBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBOztRQUFBLHNCQUF1QixPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7T0FBdkM7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsR0FBcEQsQ0FIWixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDZCQUFwQixFQUFtRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ3BFLEtBQUMsQ0FBQSxRQUFELEdBQVksTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBRHdEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkQsQ0FBbkIsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHdDQUFwQixFQUE4RCxDQUFBLFNB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/pigments-provider.coffee
