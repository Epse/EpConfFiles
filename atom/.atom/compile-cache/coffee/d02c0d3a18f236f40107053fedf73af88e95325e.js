(function() {
  var CompositeDisposable, HighlightLineView, Point, lines,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  Point = require('atom').Point;

  lines = [];

  module.exports = HighlightLineView = (function() {
    function HighlightLineView() {
      this.observeSettings = __bind(this.observeSettings, this);
      this.createDecoration = __bind(this.createDecoration, this);
      this.handleMultiLine = __bind(this.handleMultiLine, this);
      this.handleSingleLine = __bind(this.handleSingleLine, this);
      this.showHighlight = __bind(this.showHighlight, this);
      this.updateSelectedLine = __bind(this.updateSelectedLine, this);
      this.destroy = __bind(this.destroy, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(activeEditor) {
          activeEditor.onDidAddSelection(_this.updateSelectedLine);
          return activeEditor.onDidChangeSelectionRange(_this.updateSelectedLine);
        };
      })(this)));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(this.updateSelectedLine));
      this.markers = [];
      this.observeSettings();
      this.updateSelectedLine();
    }

    HighlightLineView.prototype.getEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightLineView.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    HighlightLineView.prototype.updateSelectedLine = function() {
      this.resetBackground();
      return this.showHighlight();
    };

    HighlightLineView.prototype.resetBackground = function() {
      var decoration, _i, _len, _ref;
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        decoration = _ref[_i];
        decoration.destroy();
        decoration = null;
      }
      return this.markers = [];
    };

    HighlightLineView.prototype.showHighlight = function() {
      if (!this.getEditor()) {
        return;
      }
      this.handleMultiLine();
      return this.handleSingleLine();
    };

    HighlightLineView.prototype.handleSingleLine = function() {
      var selection, selectionRange, style, _i, _len, _ref, _results;
      _ref = this.getEditor().getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (selection.isSingleScreenLine()) {
          selectionRange = selection.getBufferRange();
          if (!(selection.getText() !== '' && atom.config.get("highlight-line.hideHighlightOnSelect"))) {
            if (atom.config.get('highlight-line.enableBackgroundColor')) {
              this.createDecoration(selectionRange);
            }
          }
          if (atom.config.get('highlight-line.enableUnderline')) {
            style = atom.config.get("highlight-line.underline");
            _results.push(this.createDecoration(selectionRange, "-multi-line-" + style + "-bottom"));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    HighlightLineView.prototype.handleMultiLine = function() {
      var bottomLine, selection, selectionRange, selections, style, topLine, _i, _len, _results;
      if (!atom.config.get('highlight-line.enableSelectionBorder')) {
        return;
      }
      selections = this.getEditor().getSelections();
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        if (!selection.isSingleScreenLine()) {
          selectionRange = selection.getBufferRange().copy();
          topLine = selectionRange;
          bottomLine = selectionRange.copy();
          topLine.end = topLine.start;
          bottomLine.start = new Point(bottomLine.end.row - 1, bottomLine.end.column);
          style = atom.config.get("highlight-line.underline");
          this.createDecoration(topLine, "-multi-line-" + style + "-top");
          _results.push(this.createDecoration(bottomLine, "-multi-line-" + style + "-bottom"));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    HighlightLineView.prototype.createDecoration = function(range, klassToAdd) {
      var decoration, klass, marker;
      if (klassToAdd == null) {
        klassToAdd = '';
      }
      klass = 'highlight-line';
      klass += klassToAdd;
      marker = this.getEditor().markBufferRange(range);
      decoration = this.getEditor().decorateMarker(marker, {
        type: 'line',
        "class": klass
      });
      return this.markers.push(marker);
    };

    HighlightLineView.prototype.observeSettings = function() {
      this.subscriptions.add(atom.config.onDidChange("highlight-line.enableBackgroundColor", this.updateSelectedLine));
      this.subscriptions.add(atom.config.onDidChange("highlight-line.hideHighlightOnSelect", this.updateSelectedLine));
      this.subscriptions.add(atom.config.onDidChange("highlight-line.enableUnderline", this.updateSelectedLine));
      return this.subscriptions.add(atom.config.onDidChange("highlight-line.enableSelectionBorder", this.updateSelectedLine));
    };

    return HighlightLineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtbGluZS9saWIvaGlnaGxpZ2h0LWxpbmUtbW9kZWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsRUFIUixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVTLElBQUEsMkJBQUEsR0FBQTtBQUNYLCtEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEscUVBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsWUFBRCxHQUFBO0FBQ25ELFVBQUEsWUFBWSxDQUFDLGlCQUFiLENBQStCLEtBQUMsQ0FBQSxrQkFBaEMsQ0FBQSxDQUFBO2lCQUNBLFlBQVksQ0FBQyx5QkFBYixDQUF1QyxLQUFDLENBQUEsa0JBQXhDLEVBRm1EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkIsQ0FGQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FDRSxJQUFJLENBQUMsU0FBUyxDQUFDLHlC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

//# sourceURL=/home/epse/.atom/packages/highlight-line/lib/highlight-line-model.coffee
