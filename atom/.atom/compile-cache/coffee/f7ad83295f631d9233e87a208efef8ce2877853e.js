(function() {
  var $, CompositeDisposable, CoveringView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('space-pen'), View = _ref.View, $ = _ref.$;

  _ = require('underscore-plus');

  CoveringView = (function(_super) {
    __extends(CoveringView, _super);

    function CoveringView() {
      return CoveringView.__super__.constructor.apply(this, arguments);
    }

    CoveringView.prototype.initialize = function(editor) {
      this.editor = editor;
      this.coverSubs = new CompositeDisposable;
      this.overlay = this.editor.decorateMarker(this.cover(), {
        type: 'overlay',
        item: this,
        position: 'tail'
      });
      return this.coverSubs.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
    };

    CoveringView.prototype.attached = function() {
      var rightPosition;
      rightPosition = this.editor.verticallyScrollable() ? this.editor.getVerticalScrollbarWidth() : 0;
      this.parent().css({
        right: rightPosition
      });
      this.css({
        'margin-top': -this.editor.getLineHeightInPixels()
      });
      return this.height(this.editor.getLineHeightInPixels());
    };

    CoveringView.prototype.cleanup = function() {
      var _ref1;
      this.coverSubs.dispose();
      if ((_ref1 = this.overlay) != null) {
        _ref1.destroy();
      }
      return this.overlay = null;
    };

    CoveringView.prototype.cover = function() {
      return null;
    };

    CoveringView.prototype.conflict = function() {
      return null;
    };

    CoveringView.prototype.isDirty = function() {
      return false;
    };

    CoveringView.prototype.detectDirty = function() {
      return null;
    };

    CoveringView.prototype.decorate = function() {
      return null;
    };

    CoveringView.prototype.getModel = function() {
      return null;
    };

    CoveringView.prototype.buffer = function() {
      return this.editor.getBuffer();
    };

    CoveringView.prototype.includesCursor = function(cursor) {
      return false;
    };

    CoveringView.prototype.deleteMarker = function(marker) {
      this.buffer()["delete"](marker.getBufferRange());
      return marker.destroy();
    };

    CoveringView.prototype.scrollTo = function(positionOrNull) {
      if (positionOrNull != null) {
        return this.editor.setCursorBufferPosition(positionOrNull);
      }
    };

    CoveringView.prototype.prependKeystroke = function(eventName, element) {
      var bindings, e, original, _i, _len, _results;
      bindings = atom.keymaps.findKeyBindings({
        command: eventName
      });
      _results = [];
      for (_i = 0, _len = bindings.length; _i < _len; _i++) {
        e = bindings[_i];
        original = element.text();
        _results.push(element.text(_.humanizeKeystroke(e.keystrokes) + (" " + original)));
      }
      return _results;
    };

    return CoveringView;

  })(View);

  module.exports = {
    CoveringView: CoveringView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvY292ZXJpbmctdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbURBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBWSxPQUFBLENBQVEsV0FBUixDQUFaLEVBQUMsWUFBQSxJQUFELEVBQU8sU0FBQSxDQURQLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUtNO0FBRUosbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDJCQUFBLFVBQUEsR0FBWSxTQUFFLE1BQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFNBQUEsTUFDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBQUEsQ0FBQSxtQkFBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUFDLENBQUEsS0FBRCxDQUFBLENBQXZCLEVBQ1Q7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxJQUFBLEVBQU0sSUFETjtBQUFBLFFBRUEsUUFBQSxFQUFVLE1BRlY7T0FEUyxDQURYLENBQUE7YUFNQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUFmLEVB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

//# sourceURL=/home/epse/.atom/packages/merge-conflicts/lib/view/covering-view.coffee
