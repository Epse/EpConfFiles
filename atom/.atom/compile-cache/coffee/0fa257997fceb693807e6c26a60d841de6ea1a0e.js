(function() {
  var Disposable, EditorControl, Emitter, Range, SubAtom, TooltipMessage, bufferPositionFromMouseEvent, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SubAtom = require('sub-atom');

  bufferPositionFromMouseEvent = require('./utils').bufferPositionFromMouseEvent;

  TooltipMessage = require('./views/tooltip-view').TooltipMessage;

  _ref = require('atom'), Range = _ref.Range, Disposable = _ref.Disposable, Emitter = _ref.Emitter;

  EditorControl = (function() {
    function EditorControl(editor) {
      var buffer, editorElement, gutterElement;
      this.editor = editor;
      this.updateResults = __bind(this.updateResults, this);
      this.disposables = new SubAtom;
      this.disposables.add(this.emitter = new Emitter);
      editorElement = atom.views.getView(this.editor);
      this.gutter = this.editor.gutterWithName("ide-haskell-check-results");
      if (this.gutter == null) {
        this.gutter = this.editor.addGutter({
          name: "ide-haskell-check-results",
          priority: 10
        });
      }
      gutterElement = atom.views.getView(this.gutter);
      this.disposables.add(gutterElement, 'mouseenter', ".decoration", (function(_this) {
        return function(e) {
          var bufferPt;
          bufferPt = bufferPositionFromMouseEvent(_this.editor, e);
          _this.lastMouseBufferPt = bufferPt;
          return _this.showCheckResult(bufferPt, true);
        };
      })(this));
      this.disposables.add(gutterElement, 'mouseleave', ".decoration", (function(_this) {
        return function(e) {
          return _this.hideTooltip();
        };
      })(this));
      buffer = this.editor.getBuffer();
      this.disposables.add(buffer.onWillSave((function(_this) {
        return function() {
          _this.emitter.emit('will-save-buffer', buffer);
          if (atom.config.get('ide-haskell.onSavePrettify')) {
            return atom.commands.dispatch(editorElement, 'ide-haskell:prettify-file');
          }
        };
      })(this)));
      this.disposables.add(buffer.onDidSave((function(_this) {
        return function() {
          return _this.emitter.emit('did-save-buffer', buffer);
        };
      })(this)));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.emitter.emit('did-stop-changing', _this.editor);
        };
      })(this)));
      this.disposables.add(editorElement.onDidChangeScrollLeft((function(_this) {
        return function() {
          return _this.hideTooltip({
            eventType: 'mouse'
          });
        };
      })(this)));
      this.disposables.add(editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.hideTooltip({
            eventType: 'mouse'
          });
        };
      })(this)));
      this.disposables.add(editorElement.rootElement, 'mousemove', '.scroll-view', (function(_this) {
        return function(e) {
          var bufferPt, _ref1;
          bufferPt = bufferPositionFromMouseEvent(_this.editor, e);
          if ((_ref1 = _this.lastMouseBufferPt) != null ? _ref1.isEqual(bufferPt) : void 0) {
            return;
          }
          _this.lastMouseBufferPt = bufferPt;
          if (_this.exprTypeTimeout != null) {
            clearTimeout(_this.exprTypeTimeout);
          }
          return _this.exprTypeTimeout = setTimeout((function() {
            return _this.shouldShowTooltip(bufferPt);
          }), atom.config.get('ide-haskell.expressionTypeInterval'));
        };
      })(this));
      this.disposables.add(editorElement.rootElement, 'mouseout', '.scroll-view', (function(_this) {
        return function(e) {
          if (_this.exprTypeTimeout != null) {
            return clearTimeout(_this.exprTypeTimeout);
          }
        };
      })(this));
      this.disposables.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function(_arg) {
          var newBufferRange;
          newBufferRange = _arg.newBufferRange;
          if (_this.selTimeout != null) {
            clearTimeout(_this.selTimeout);
          }
          if (newBufferRange.isEmpty()) {
            _this.hideTooltip({
              eventType: 'selection'
            });
            switch (atom.config.get('ide-haskell.onCursorMove')) {
              case 'Show Tooltip':
                if (_this.exprTypeTimeout != null) {
                  clearTimeout(_this.exprTypeTimeout);
                }
                if (!_this.showCheckResult(newBufferRange.start, false, 'keyboard')) {
                  return _this.hideTooltip();
                }
                break;
              case 'Hide Tooltip':
                if (_this.exprTypeTimeout != null) {
                  clearTimeout(_this.exprTypeTimeout);
                }
                return _this.hideTooltip();
            }
          } else {
            return _this.selTimeout = setTimeout((function() {
              return _this.shouldShowTooltip(newBufferRange.start, 'selection');
            }), atom.config.get('ide-haskell.expressionTypeInterval'));
          }
        };
      })(this)));
    }

    EditorControl.prototype.deactivate = function() {
      if (this.exprTypeTimeout != null) {
        clearTimeout(this.exprTypeTimeout);
      }
      if (this.selTimeout != null) {
        clearTimeout(this.selTimeout);
      }
      this.hideTooltip();
      this.disposables.dispose();
      this.disposables = null;
      this.editor = null;
      return this.lastMouseBufferPt = null;
    };

    EditorControl.prototype.updateResults = function(res, types) {
      var m, r, t, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _results;
      if (types != null) {
        for (_i = 0, _len = types.length; _i < _len; _i++) {
          t = types[_i];
          _ref1 = this.editor.findMarkers({
            type: 'check-result',
            severity: t,
            editor: this.editor.id
          });
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            m = _ref1[_j];
            m.destroy();
          }
        }
      } else {
        _ref2 = this.editor.findMarkers({
          type: 'check-result',
          editor: this.editor.id
        });
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          m = _ref2[_k];
          m.destroy();
        }
      }
      _results = [];
      for (_l = 0, _len3 = res.length; _l < _len3; _l++) {
        r = res[_l];
        _results.push(this.markerFromCheckResult(r));
      }
      return _results;
    };

    EditorControl.prototype.markerFromCheckResult = function(_arg) {
      var marker, message, position, range, severity, uri;
      uri = _arg.uri, severity = _arg.severity, message = _arg.message, position = _arg.position;
      if (!((uri != null) && uri === this.editor.getURI())) {
        return;
      }
      range = new Range(position, {
        row: position.row,
        column: position.column + 1
      });
      marker = this.editor.markBufferRange(range, {
        type: 'check-result',
        severity: severity,
        desc: message,
        editor: this.editor.id
      });
      return this.decorateMarker(marker);
    };

    EditorControl.prototype.decorateMarker = function(m) {
      var cls;
      if (this.gutter == null) {
        return;
      }
      cls = 'ide-haskell-' + m.getProperties().severity;
      this.gutter.decorateMarker(m, {
        type: 'line-number',
        "class": cls
      });
      this.editor.decorateMarker(m, {
        type: 'highlight',
        "class": cls
      });
      return this.editor.decorateMarker(m, {
        type: 'line',
        "class": cls
      });
    };

    EditorControl.prototype.onShouldShowTooltip = function(callback) {
      return this.emitter.on('should-show-tooltip', callback);
    };

    EditorControl.prototype.onWillSaveBuffer = function(callback) {
      return this.emitter.on('will-save-buffer', callback);
    };

    EditorControl.prototype.onDidSaveBuffer = function(callback) {
      return this.emitter.on('did-save-buffer', callback);
    };

    EditorControl.prototype.onDidStopChanging = function(callback) {
      return this.emitter.on('did-stop-changing', callback);
    };

    EditorControl.prototype.shouldShowTooltip = function(pos, eventType) {
      if (eventType == null) {
        eventType = 'mouse';
      }
      if (this.showCheckResult(pos, false, eventType)) {
        return;
      }
      if (pos.row < 0 || pos.row >= this.editor.getLineCount() || pos.isEqual(this.editor.bufferRangeForBufferRow(pos.row).end)) {
        return this.hideTooltip({
          eventType: eventType
        });
      } else {
        return this.emitter.emit('should-show-tooltip', {
          editor: this.editor,
          pos: pos,
          eventType: eventType
        });
      }
    };

    EditorControl.prototype.showTooltip = function(pos, range, text, detail) {
      var highlightMarker, lastSel, markerPos, tooltipMarker;
      if (this.editor == null) {
        return;
      }
      if (!detail.eventType) {
        throw new Error('eventType not set');
      }
      if (range.isEqual(this.tooltipHighlightRange)) {
        return;
      }
      this.hideTooltip();
      if (detail.eventType === 'mouse') {
        if (!range.containsPoint(this.lastMouseBufferPt)) {
          return;
        }
      }
      if (detail.eventType === 'selection') {
        lastSel = this.editor.getLastSelection();
        if (!(range.containsRange(lastSel.getBufferRange()) && !lastSel.isEmpty())) {
          return;
        }
      }
      this.tooltipHighlightRange = range;
      markerPos = range.start;
      detail.type = 'tooltip';
      tooltipMarker = this.editor.markBufferPosition(markerPos, detail);
      highlightMarker = this.editor.markBufferRange(range, detail);
      this.editor.decorateMarker(tooltipMarker, {
        type: 'overlay',
        item: new TooltipMessage(text)
      });
      return this.editor.decorateMarker(highlightMarker, {
        type: 'highlight',
        "class": 'ide-haskell-type'
      });
    };

    EditorControl.prototype.hideTooltip = function(template) {
      var m, _i, _len, _ref1, _results;
      if (template == null) {
        template = {};
      }
      this.tooltipHighlightRange = null;
      template.type = 'tooltip';
      _ref1 = this.editor.findMarkers(template);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        m = _ref1[_i];
        _results.push(m.destroy());
      }
      return _results;
    };

    EditorControl.prototype.getEventRange = function(pos, eventType) {
      var crange, selRange;
      switch (eventType) {
        case 'mouse':
        case 'context':
          if (pos == null) {
            pos = this.lastMouseBufferPt;
          }
          selRange = this.editor.getSelections().map(function(sel) {
            return sel.getBufferRange();
          }).filter(function(sel) {
            return sel.containsPoint(pos);
          })[0];
          crange = selRange != null ? selRange : Range.fromPointWithDelta(pos, 0, 0);
          break;
        case 'keyboard':
        case 'selection':
          crange = this.editor.getLastSelection().getBufferRange();
          pos = crange.start;
          break;
        default:
          throw new Error("unknown event type " + eventType);
      }
      return {
        crange: crange,
        pos: pos,
        eventType: eventType
      };
    };

    EditorControl.prototype.findCheckResultMarkers = function(pos, gutter, eventType) {
      if (gutter) {
        return this.editor.findMarkers({
          type: 'check-result',
          startBufferRow: pos.row,
          editor: this.editor.id
        });
      } else {
        switch (eventType) {
          case 'keyboard':
            return this.editor.findMarkers({
              type: 'check-result',
              editor: this.editor.id,
              containsRange: Range.fromPointWithDelta(pos, 0, 1)
            });
          case 'mouse':
            return this.editor.findMarkers({
              type: 'check-result',
              editor: this.editor.id,
              containsPoint: pos
            });
          default:
            return [];
        }
      }
    };

    EditorControl.prototype.showCheckResult = function(pos, gutter, eventType) {
      var marker, markers, text;
      if (eventType == null) {
        eventType = 'mouse';
      }
      markers = this.findCheckResultMarkers(pos, gutter, eventType);
      marker = markers[0];
      if (marker == null) {
        this.hideTooltip({
          subtype: 'check-result'
        });
        return false;
      }
      text = markers.map(function(marker) {
        return marker.getProperties().desc;
      });
      if (gutter) {
        this.showTooltip(pos, new Range(pos, pos), text, {
          eventType: eventType,
          subtype: 'check-result'
        });
      } else {
        this.showTooltip(pos, marker.getBufferRange(), text, {
          eventType: eventType,
          subtype: 'check-result'
        });
      }
      return true;
    };

    EditorControl.prototype.hasTooltips = function(template) {
      if (template == null) {
        template = {};
      }
      template.type = 'tooltip';
      return !!this.editor.findMarkers(template).length;
    };

    return EditorControl;

  })();

  module.exports = {
    EditorControl: EditorControl
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvZWRpdG9yLWNvbnRyb2wuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FBVixDQUFBOztBQUFBLEVBRUMsK0JBQWdDLE9BQUEsQ0FBUSxTQUFSLEVBQWhDLDRCQUZELENBQUE7O0FBQUEsRUFHQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBSEQsQ0FBQTs7QUFBQSxFQUlBLE9BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsYUFBQSxLQUFELEVBQVEsa0JBQUEsVUFBUixFQUFvQixlQUFBLE9BSnBCLENBQUE7O0FBQUEsRUFNTTtBQUNTLElBQUEsdUJBQUUsTUFBRixHQUFBO0FBQ1gsVUFBQSxvQ0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsT0FBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEIsQ0FIaEIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsMkJBQXZCLENBTFYsQ0FBQTs7UUFNQSxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FDVDtBQUFBLFVBQUEs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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/editor-control.coffee
