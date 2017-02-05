(function() {
  var StyleText, config, scopeSelectors, utils;

  config = require("../config");

  utils = require("../utils");

  scopeSelectors = {
    code: ".raw",
    bold: ".bold",
    italic: ".italic",
    strikethrough: ".strike"
  };

  module.exports = StyleText = (function() {
    function StyleText(style) {
      var base, base1;
      this.styleName = style;
      this.style = config.get("textStyles." + style);
      if ((base = this.style).before == null) {
        base.before = "";
      }
      if ((base1 = this.style).after == null) {
        base1.after = "";
      }
    }

    StyleText.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            var retainSelection, text;
            retainSelection = !selection.isEmpty();
            _this.normalizeSelection(selection);
            if (text = selection.getText()) {
              return _this.toggleStyle(selection, text, {
                select: retainSelection
              });
            } else {
              return _this.insertEmptyStyle(selection);
            }
          });
        };
      })(this));
    };

    StyleText.prototype.normalizeSelection = function(selection) {
      var range, scopeSelector;
      scopeSelector = scopeSelectors[this.styleName];
      if (!scopeSelector) {
        return;
      }
      range = utils.getTextBufferRange(this.editor, scopeSelector, selection);
      return selection.setBufferRange(range);
    };

    StyleText.prototype.toggleStyle = function(selection, text, opts) {
      if (this.isStyleOn(text)) {
        text = this.removeStyle(text);
      } else {
        text = this.addStyle(text);
      }
      return selection.insertText(text, opts);
    };

    StyleText.prototype.insertEmptyStyle = function(selection) {
      var position;
      selection.insertText(this.style.before);
      position = selection.cursor.getBufferPosition();
      selection.insertText(this.style.after);
      return selection.cursor.setBufferPosition(position);
    };

    StyleText.prototype.isStyleOn = function(text) {
      if (text) {
        return this.getStylePattern().test(text);
      }
    };

    StyleText.prototype.addStyle = function(text) {
      return "" + this.style.before + text + this.style.after;
    };

    StyleText.prototype.removeStyle = function(text) {
      var matches;
      while (matches = this.getStylePattern().exec(text)) {
        text = matches.slice(1).join("");
      }
      return text;
    };

    StyleText.prototype.getStylePattern = function() {
      var after, before;
      before = this.style.regexBefore || utils.escapeRegExp(this.style.before);
      after = this.style.regexAfter || utils.escapeRegExp(this.style.after);
      return RegExp("^([\\s\\S]*?)" + before + "([\\s\\S]*?)" + after + "([\\s\\S]*?)$", "gm");
    };

    return StyleText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29tbWFuZHMvc3R5bGUtdGV4dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFDVCxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBR1IsY0FBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLE1BQU47SUFDQSxJQUFBLEVBQU0sT0FETjtJQUVBLE1BQUEsRUFBUSxTQUZSO0lBR0EsYUFBQSxFQUFlLFNBSGY7OztFQUtGLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFRUyxtQkFBQyxLQUFEO0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsS0FBRCxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsYUFBQSxHQUFjLEtBQXpCOztZQUVILENBQUMsU0FBVTs7O2FBQ1gsQ0FBQyxRQUFTOztJQUxMOzt3QkFPYixPQUFBLEdBQVMsU0FBQyxDQUFEO01BQ1AsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7YUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNmLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxTQUFEO0FBQzlCLGdCQUFBO1lBQUEsZUFBQSxHQUFrQixDQUFDLFNBQVMsQ0FBQyxPQUFWLENBQUE7WUFDbkIsS0FBQyxDQUFBLGtCQUFELENBQW9CLFNBQXBCO1lBRUEsSUFBRyxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFWO3FCQUNFLEtBQUMsQ0FBQSxXQUFELENBQWEsU0FBYixFQUF3QixJQUF4QixFQUE4QjtnQkFBQSxNQUFBLEVBQVEsZUFBUjtlQUE5QixFQURGO2FBQUEsTUFBQTtxQkFHRSxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBbEIsRUFIRjs7VUFKOEIsQ0FBaEM7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFGTzs7d0JBYVQsa0JBQUEsR0FBb0IsU0FBQyxTQUFEO0FBQ2xCLFVBQUE7TUFBQSxhQUFBLEdBQWdCLGNBQWUsQ0FBQSxJQUFDLENBQUEsU0FBRDtNQUMvQixJQUFBLENBQWMsYUFBZDtBQUFBLGVBQUE7O01BRUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxrQkFBTixDQUF5QixJQUFDLENBQUEsTUFBMUIsRUFBa0MsYUFBbEMsRUFBaUQsU0FBakQ7YUFDUixTQUFTLENBQUMsY0FBVixDQUF5QixLQUF6QjtJQUxrQjs7d0JBT3BCLFdBQUEsR0FBYSxTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLElBQWxCO01BQ1gsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsQ0FBSDtRQUNFLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFEVDtPQUFBLE1BQUE7UUFHRSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBSFQ7O2FBS0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0I7SUFOVzs7d0JBUWIsZ0JBQUEsR0FBa0IsU0FBQyxTQUFEO0FBQ2hCLFVBQUE7TUFBQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTVCO01BQ0EsUUFBQSxHQUFXLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQUE7TUFDWCxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQTVCO2FBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBbUMsUUFBbkM7SUFKZ0I7O3dCQU1sQixTQUFBLEdBQVcsU0FBQyxJQUFEO01BQ1QsSUFBaUMsSUFBakM7ZUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBeEIsRUFBQTs7SUFEUzs7d0JBR1gsUUFBQSxHQUFVLFNBQUMsSUFBRDthQUNSLEVBQUEsR0FBRyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVYsR0FBbUIsSUFBbkIsR0FBMEIsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUR6Qjs7d0JBR1YsV0FBQSxHQUFhLFNBQUMsSUFBRDtBQUNYLFVBQUE7QUFBQSxhQUFNLE9BQUEsR0FBVSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBaEI7UUFDRSxJQUFBLEdBQU8sT0FBUSxTQUFJLENBQUMsSUFBYixDQUFrQixFQUFsQjtNQURUO0FBRUEsYUFBTztJQUhJOzt3QkFLYixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBUCxJQUFzQixLQUFLLENBQUMsWUFBTixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTFCO01BQy9CLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsSUFBcUIsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUExQjthQUU3QixNQUFBLENBQUEsZUFBQSxHQUVFLE1BRkYsR0FFUyxjQUZULEdBRXFCLEtBRnJCLEdBRTJCLGVBRjNCLEVBSUcsSUFKSDtJQUplOzs7OztBQXZFbkIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxuIyBNYXAgbWFya2Rvd24td3JpdGVyIHRleHQgc3R5bGUga2V5cyB0byBvZmZpY2lhbCBnZm0gc3R5bGUgc2NvcGUgc2VsZWN0b3JzXG5zY29wZVNlbGVjdG9ycyA9XG4gIGNvZGU6IFwiLnJhd1wiXG4gIGJvbGQ6IFwiLmJvbGRcIlxuICBpdGFsaWM6IFwiLml0YWxpY1wiXG4gIHN0cmlrZXRocm91Z2g6IFwiLnN0cmlrZVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0eWxlVGV4dFxuICAjIEBzdHlsZSBjb25maWcgY291bGQgY29udGFpbnM6XG4gICNcbiAgIyAtIGJlZm9yZSAocmVxdWlyZWQpXG4gICMgLSBhZnRlciAocmVxdWlyZWQpXG4gICMgLSByZWdleEJlZm9yZSAob3B0aW9uYWwpIG92ZXJ3cml0ZXMgYmVmb3JlIHdoZW4gdG8gbWF0Y2gvcmVwbGFjZSBzdHJpbmdcbiAgIyAtIHJlZ2V4QWZ0ZXIgKG9wdGlvbmFsKSBvdmVyd3JpdGVzIGFmdGVyIHdoZW4gdG8gbWF0Y2gvcmVwbGFjZSBzdHJpbmdcbiAgI1xuICBjb25zdHJ1Y3RvcjogKHN0eWxlKSAtPlxuICAgIEBzdHlsZU5hbWUgPSBzdHlsZVxuICAgIEBzdHlsZSA9IGNvbmZpZy5nZXQoXCJ0ZXh0U3R5bGVzLiN7c3R5bGV9XCIpXG4gICAgIyBtYWtlIHN1cmUgYmVmb3JlL2FmdGVyIGV4aXN0XG4gICAgQHN0eWxlLmJlZm9yZSA/PSBcIlwiXG4gICAgQHN0eWxlLmFmdGVyID89IFwiXCJcblxuICB0cmlnZ2VyOiAoZSkgLT5cbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICByZXRhaW5TZWxlY3Rpb24gPSAhc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgICBAbm9ybWFsaXplU2VsZWN0aW9uKHNlbGVjdGlvbilcblxuICAgICAgICBpZiB0ZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICAgIEB0b2dnbGVTdHlsZShzZWxlY3Rpb24sIHRleHQsIHNlbGVjdDogcmV0YWluU2VsZWN0aW9uKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluc2VydEVtcHR5U3R5bGUoc2VsZWN0aW9uKVxuXG4gICMgdHJ5IHRvIGFjdCBzbWFydCB0byBjb3JyZWN0IHRoZSBzZWxlY3Rpb24gaWYgbmVlZGVkXG4gIG5vcm1hbGl6ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzY29wZVNlbGVjdG9yID0gc2NvcGVTZWxlY3RvcnNbQHN0eWxlTmFtZV1cbiAgICByZXR1cm4gdW5sZXNzIHNjb3BlU2VsZWN0b3JcblxuICAgIHJhbmdlID0gdXRpbHMuZ2V0VGV4dEJ1ZmZlclJhbmdlKEBlZGl0b3IsIHNjb3BlU2VsZWN0b3IsIHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgdG9nZ2xlU3R5bGU6IChzZWxlY3Rpb24sIHRleHQsIG9wdHMpIC0+XG4gICAgaWYgQGlzU3R5bGVPbih0ZXh0KVxuICAgICAgdGV4dCA9IEByZW1vdmVTdHlsZSh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIHRleHQgPSBAYWRkU3R5bGUodGV4dClcblxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIG9wdHMpXG5cbiAgaW5zZXJ0RW1wdHlTdHlsZTogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChAc3R5bGUuYmVmb3JlKVxuICAgIHBvc2l0aW9uID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQoQHN0eWxlLmFmdGVyKVxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXG5cbiAgaXNTdHlsZU9uOiAodGV4dCkgLT5cbiAgICBAZ2V0U3R5bGVQYXR0ZXJuKCkudGVzdCh0ZXh0KSBpZiB0ZXh0XG5cbiAgYWRkU3R5bGU6ICh0ZXh0KSAtPlxuICAgIFwiI3tAc3R5bGUuYmVmb3JlfSN7dGV4dH0je0BzdHlsZS5hZnRlcn1cIlxuXG4gIHJlbW92ZVN0eWxlOiAodGV4dCkgLT5cbiAgICB3aGlsZSBtYXRjaGVzID0gQGdldFN0eWxlUGF0dGVybigpLmV4ZWModGV4dClcbiAgICAgIHRleHQgPSBtYXRjaGVzWzEuLl0uam9pbihcIlwiKVxuICAgIHJldHVybiB0ZXh0XG5cbiAgZ2V0U3R5bGVQYXR0ZXJuOiAtPlxuICAgIGJlZm9yZSA9IEBzdHlsZS5yZWdleEJlZm9yZSB8fCB1dGlscy5lc2NhcGVSZWdFeHAoQHN0eWxlLmJlZm9yZSlcbiAgICBhZnRlciA9IEBzdHlsZS5yZWdleEFmdGVyIHx8IHV0aWxzLmVzY2FwZVJlZ0V4cChAc3R5bGUuYWZ0ZXIpXG5cbiAgICAvLy9cbiAgICBeKFtcXHNcXFNdKj8pICAgICAgICAgICAgICAgICAgICAjIHJhbmRvbSB0ZXh0IGF0IGhlYWRcbiAgICAje2JlZm9yZX0oW1xcc1xcU10qPykje2FmdGVyfSAgICAjIHRoZSBzdHlsZSBwYXR0ZXJuIGFwcGVhciBvbmNlXG4gICAgKFtcXHNcXFNdKj8pJCAgICAgICAgICAgICAgICAgICAgIyByYW5kb20gdGV4dCBhdCBlbmRcbiAgICAvLy9nbVxuIl19