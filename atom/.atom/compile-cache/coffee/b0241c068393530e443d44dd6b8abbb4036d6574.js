(function() {
  var CompositeDisposable, DecorationManagement, Emitter, Minimap, nextModelId, _ref;

  _ref = require('event-kit'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  DecorationManagement = require('./mixins/decoration-management');

  nextModelId = 1;

  module.exports = Minimap = (function() {
    DecorationManagement.includeInto(Minimap);


    /* Public */

    function Minimap(options) {
      var subs;
      if (options == null) {
        options = {};
      }
      this.textEditor = options.textEditor, this.standAlone = options.standAlone, this.width = options.width, this.height = options.height;
      if (this.textEditor == null) {
        throw new Error('Cannot create a minimap without an editor');
      }
      this.id = nextModelId++;
      this.emitter = new Emitter;
      this.subscriptions = subs = new CompositeDisposable;
      this.initializeDecorations();
      if (this.standAlone) {
        this.scrollTop = 0;
      }
      subs.add(atom.config.observe('editor.scrollPastEnd', (function(_this) {
        return function(scrollPastEnd) {
          _this.scrollPastEnd = scrollPastEnd;
          return _this.emitter.emit('did-change-config', {
            config: 'editor.scrollPastEnd',
            value: _this.scrollPastEnd
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.charHeight', (function(_this) {
        return function(charHeight) {
          _this.charHeight = charHeight;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.charHeight',
            value: _this.charHeight
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.charWidth', (function(_this) {
        return function(charWidth) {
          _this.charWidth = charWidth;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.charWidth',
            value: _this.charWidth
          });
        };
      })(this)));
      subs.add(atom.config.observe('minimap.interline', (function(_this) {
        return function(interline) {
          _this.interline = interline;
          return _this.emitter.emit('did-change-config', {
            config: 'minimap.interline',
            value: _this.interline
          });
        };
      })(this)));
      subs.add(this.textEditor.onDidChange((function(_this) {
        return function(changes) {
          return _this.emitChanges(changes);
        };
      })(this)));
      subs.add(this.textEditor.onDidChangeScrollTop((function(_this) {
        return function() {
          if (!_this.standAlone) {
            return _this.emitter.emit('did-change-scroll-top', _this);
          }
        };
      })(this)));
      subs.add(this.textEditor.onDidChangeScrollLeft((function(_this) {
        return function() {
          if (!_this.standAlone) {
            return _this.emitter.emit('did-change-scroll-left', _this);
          }
        };
      })(this)));
      subs.add(this.textEditor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      subs.add(this.textEditor.displayBuffer.onDidTokenize((function(_this) {
        return function() {
          return _this.emitter.emit('did-change-config');
        };
      })(this)));
    }

    Minimap.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      this.removeAllDecorations();
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.textEditor = null;
      this.emitter.emit('did-destroy');
      this.emitter.dispose();
      return this.destroyed = true;
    };

    Minimap.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    Minimap.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    Minimap.prototype.onDidChangeConfig = function(callback) {
      return this.emitter.on('did-change-config', callback);
    };

    Minimap.prototype.onDidChangeScrollTop = function(callback) {
      return this.emitter.on('did-change-scroll-top', callback);
    };

    Minimap.prototype.onDidChangeScrollLeft = function(callback) {
      return this.emitter.on('did-change-scroll-left', callback);
    };

    Minimap.prototype.onDidChangeStandAlone = function(callback) {
      return this.emitter.on('did-change-stand-alone', callback);
    };

    Minimap.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    Minimap.prototype.isStandAlone = function() {
      return this.standAlone;
    };

    Minimap.prototype.setStandAlone = function(standAlone) {
      if (standAlone !== this.standAlone) {
        this.standAlone = standAlone;
        return this.emitter.emit('did-change-stand-alone', this);
      }
    };

    Minimap.prototype.getTextEditor = function() {
      return this.textEditor;
    };

    Minimap.prototype.getTextEditorScaledHeight = function() {
      return this.textEditor.getHeight() * this.getVerticalScaleFactor();
    };

    Minimap.prototype.getTextEditorScaledScrollTop = function() {
      return this.textEditor.getScrollTop() * this.getVerticalScaleFactor();
    };

    Minimap.prototype.getTextEditorScaledScrollLeft = function() {
      return this.textEditor.getScrollLeft() * this.getHorizontalScaleFactor();
    };

    Minimap.prototype.getTextEditorMaxScrollTop = function() {
      var lineHeight, maxScrollTop;
      maxScrollTop = this.textEditor.displayBuffer.getMaxScrollTop();
      lineHeight = this.textEditor.displayBuffer.getLineHeightInPixels();
      if (this.scrollPastEnd) {
        maxScrollTop -= this.textEditor.getHeight() - 3 * lineHeight;
      }
      return maxScrollTop;
    };

    Minimap.prototype.getTextEditorScrollRatio = function() {
      return this.textEditor.getScrollTop() / (this.getTextEditorMaxScrollTop() || 1);
    };

    Minimap.prototype.getCapedTextEditorScrollRatio = function() {
      return Math.min(1, this.getTextEditorScrollRatio());
    };

    Minimap.prototype.getHeight = function() {
      return this.textEditor.getScreenLineCount() * this.getLineHeight();
    };

    Minimap.prototype.getWidth = function() {
      return this.textEditor.getMaxScreenLineLength() * this.getCharWidth();
    };

    Minimap.prototype.getVisibleHeight = function() {
      return Math.min(this.getScreenHeight(), this.getHeight());
    };

    Minimap.prototype.getScreenHeight = function() {
      if (this.isStandAlone()) {
        if (this.height != null) {
          return this.height;
        } else {
          return this.getHeight();
        }
      } else {
        return this.textEditor.getHeight();
      }
    };

    Minimap.prototype.getVisibleWidth = function() {
      return Math.min(this.getScreenWidth(), this.getWidth());
    };

    Minimap.prototype.getScreenWidth = function() {
      if (this.isStandAlone() && (this.width != null)) {
        return this.width;
      } else {
        return this.getWidth();
      }
    };

    Minimap.prototype.setScreenHeightAndWidth = function(height, width) {
      this.height = height;
      this.width = width;
    };

    Minimap.prototype.getVerticalScaleFactor = function() {
      return this.getLineHeight() / this.textEditor.getLineHeightInPixels();
    };

    Minimap.prototype.getHorizontalScaleFactor = function() {
      return this.getCharWidth() / this.textEditor.getDefaultCharWidth();
    };

    Minimap.prototype.getLineHeight = function() {
      return this.charHeight + this.interline;
    };

    Minimap.prototype.getCharWidth = function() {
      return this.charWidth;
    };

    Minimap.prototype.getCharHeight = function() {
      return this.charHeight;
    };

    Minimap.prototype.getInterline = function() {
      return this.interline;
    };

    Minimap.prototype.getFirstVisibleScreenRow = function() {
      return Math.floor(this.getScrollTop() / this.getLineHeight());
    };

    Minimap.prototype.getLastVisibleScreenRow = function() {
      return Math.ceil((this.getScrollTop() + this.getScreenHeight()) / this.getLineHeight());
    };

    Minimap.prototype.getScrollTop = function() {
      if (this.standAlone) {
        return this.scrollTop;
      } else {
        return Math.abs(this.getCapedTextEditorScrollRatio() * this.getMaxScrollTop());
      }
    };

    Minimap.prototype.setScrollTop = function(scrollTop) {
      this.scrollTop = scrollTop;
      if (this.standAlone) {
        return this.emitter.emit('did-change-scroll-top', this);
      }
    };

    Minimap.prototype.getMaxScrollTop = function() {
      return Math.max(0, this.getHeight() - this.getScreenHeight());
    };

    Minimap.prototype.canScroll = function() {
      return this.getMaxScrollTop() > 0;
    };

    Minimap.prototype.getMarker = function(id) {
      return this.textEditor.getMarker(id);
    };

    Minimap.prototype.findMarkers = function(o) {
      try {
        return this.textEditor.findMarkers(o);
      } catch (_error) {
        return [];
      }
    };

    Minimap.prototype.markBufferRange = function(range) {
      return this.textEditor.markBufferRange(range);
    };

    Minimap.prototype.emitChanges = function(changes) {
      return this.emitter.emit('did-change', changes);
    };

    return Minimap;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4RUFBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxXQUFSLENBQWpDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsQ0FBQTs7QUFBQSxFQUNBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxnQ0FBUixDQUR2QixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLENBSGQsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG9CQUFvQixDQUFDLFdBQXJCLENBQWlDLE9BQWpDLENBQUEsQ0FBQTs7QUFFQTtBQUFBLGdCQUZBOztBQVFhLElBQUEsaUJBQUMsT0FBRCxHQUFBO0FBQ1gsVUFBQSxJQUFBOztRQURZLFVBQVE7T0FDcEI7QUFBQSxNQUFDLElBQUMsQ0FBQSxxQkFBQSxVQUFGLEVBQWMsSUFBQyxDQUFBLHFCQUFBLFVBQWYsRUFBMkIsSUFBQyxDQUFBLGdCQUFBLEtBQTVCLEVBQW1DLElBQUMsQ0FBQSxpQkFBQSxNQUFwQyxDQUFBO0FBQ0EsTUFBQSxJQUFPLHVCQUFQO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSwyQ0FBTixDQUFWLENBREY7T0FEQTtBQUFBLE1BSUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxXQUFBLEVBSk4sQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FMWCxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFBLEdBQU8sR0FBQSxDQUFBLG1CQU54QixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQVBBLENBQUE7QUFTQSxNQUFBLElBQUcsSUFBQyxD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

//# sourceURL=/home/epse/.atom/packages/minimap/lib/minimap.coffee
