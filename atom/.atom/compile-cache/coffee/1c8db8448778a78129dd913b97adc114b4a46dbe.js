(function() {
  var EditorControl, Range,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = null;

  module.exports = EditorControl = (function() {
    function EditorControl(editor) {
      var Emitter, SubAtom, buffer, bufferPositionFromMouseEvent, editorElement, gutterElement, _ref;
      this.editor = editor;
      this.updateResults = __bind(this.updateResults, this);
      SubAtom = require('sub-atom');
      this.disposables = new SubAtom;
      _ref = require('atom'), Range = _ref.Range, Emitter = _ref.Emitter;
      this.disposables.add(this.emitter = new Emitter);
      editorElement = atom.views.getView(this.editor);
      this.gutter = this.editor.gutterWithName("ide-haskell-check-results");
      if (this.gutter == null) {
        this.gutter = this.editor.addGutter({
          name: "ide-haskell-check-results",
          priority: 10
        });
      }
      bufferPositionFromMouseEvent = require('./utils').bufferPositionFromMouseEvent;
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
      var m, r, t, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _results;
      if (types != null) {
        for (_i = 0, _len = types.length; _i < _len; _i++) {
          t = types[_i];
          _ref = this.editor.findMarkers({
            type: 'check-result',
            severity: t,
            editor: this.editor.id
          });
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            m = _ref[_j];
            m.destroy();
          }
        }
      } else {
        _ref1 = this.editor.findMarkers({
          type: 'check-result',
          editor: this.editor.id
        });
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          m = _ref1[_k];
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

    EditorControl.prototype.markerFromCheckResult = function(resItem) {
      var marker, message, position, range, severity, uri;
      uri = resItem.uri, severity = resItem.severity, message = resItem.message, position = resItem.position;
      if (!((uri != null) && uri === this.editor.getURI())) {
        return;
      }
      range = new Range(position, {
        row: position.row,
        column: position.column + 1
      });
      marker = this.editor.markBufferRange(range, {
        invalidate: 'touch'
      });
      marker.setProperties({
        type: 'check-result',
        severity: severity,
        desc: message,
        editor: this.editor.id
      });
      marker.disposables.add(marker.onDidChange(function(_arg) {
        var isValid;
        isValid = _arg.isValid;
        if (!isValid) {
          resItem.destroy();
          return marker.destroy();
        }
      }));
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
      } else if (this.rangeHasChanged(pos, eventType)) {
        return this.emitter.emit('should-show-tooltip', {
          editor: this.editor,
          pos: pos,
          eventType: eventType
        });
      }
    };

    EditorControl.prototype.rangeHasChanged = function(pos, eventType) {
      var isFirstIteration, isSameRow, isSameToken, newrange, rangesAreEmpty, result;
      newrange = this.getEventRange(pos, eventType).crange;
      isFirstIteration = !((this.lastMouseBufferPtTest != null) && (this.lastMouseBufferRangeTest != null));
      rangesAreEmpty = (function(_this) {
        return function() {
          return _this.lastMouseBufferRangeTest.isEmpty() && newrange.isEmpty();
        };
      })(this);
      isSameRow = (function(_this) {
        return function() {
          return _this.lastMouseBufferPtTest.row === pos.row;
        };
      })(this);
      isSameToken = (function(_this) {
        return function() {
          var newtokid, oldtokid, tl;
          if (!(rangesAreEmpty() && isSameRow())) {
            return false;
          }
          tl = _this.editor.tokenizedBuffer.tokenizedLineForRow(_this.lastMouseBufferPtTest.row);
          oldtokid = tl.tokenIndexAtBufferColumn(_this.lastMouseBufferPtTest.column);
          newtokid = tl.tokenIndexAtBufferColumn(pos.column);
          return oldtokid === newtokid;
        };
      })(this);
      result = isFirstIteration || !(this.lastMouseBufferRangeTest.isEqual(newrange) || isSameToken());
      this.lastMouseBufferPtTest = pos;
      this.lastMouseBufferRangeTest = newrange;
      return result;
    };

    EditorControl.prototype.showTooltip = function(pos, range, text, detail) {
      var TooltipMessage, highlightMarker, lastSel, markerPos;
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
      highlightMarker = this.editor.markBufferRange(range);
      highlightMarker.setProperties(detail);
      TooltipMessage = require('./views/tooltip-view');
      this.editor.decorateMarker(highlightMarker, {
        type: 'overlay',
        position: 'tail',
        item: new TooltipMessage(text)
      });
      return this.editor.decorateMarker(highlightMarker, {
        type: 'highlight',
        "class": 'ide-haskell-type'
      });
    };

    EditorControl.prototype.hideTooltip = function(template) {
      var m, _i, _len, _ref, _results;
      if (template == null) {
        template = {};
      }
      this.tooltipHighlightRange = null;
      template.type = 'tooltip';
      _ref = this.editor.findMarkers(template);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9lZGl0b3ItY29udHJvbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0JBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx1QkFBRSxNQUFGLEdBQUE7QUFDWCxVQUFBLDBGQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxPQURmLENBQUE7QUFBQSxNQUVBLE9BQW1CLE9BQUEsQ0FBUSxNQUFSLENBQW5CLEVBQUMsYUFBQSxLQUFELEVBQVEsZUFBQSxPQUZSLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUE1QixDQUhBLENBQUE7QUFBQSxNQUtBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQUxoQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QiwyQkFBdkIsQ0FQVixDQUFBOztRQVFBLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUNUO0FBQUEsVUFBQSxJQUFBLEVBQU0sMkJBQU47QUFBQSxVQUNBLFFBQUEsRUFBVSxFQURWO1NBRFM7T0FSWDtB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/editor-control.coffee
