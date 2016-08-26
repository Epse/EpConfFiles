(function() {
  var CanvasDrawer, Mixin, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Mixin = require('mixto');

  module.exports = CanvasDrawer = (function(_super) {
    __extends(CanvasDrawer, _super);

    function CanvasDrawer() {
      return CanvasDrawer.__super__.constructor.apply(this, arguments);
    }


    /* Public */

    CanvasDrawer.prototype.initializeCanvas = function() {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.webkitImageSmoothingEnabled = false;
      if (this.pendingChanges == null) {
        this.pendingChanges = [];
      }
      this.offscreenCanvas = document.createElement('canvas');
      return this.offscreenContext = this.offscreenCanvas.getContext('2d');
    };

    CanvasDrawer.prototype.updateCanvas = function() {
      var firstRow, intact, intactRanges, lastRow, _i, _len;
      firstRow = this.minimap.getFirstVisibleScreenRow();
      lastRow = this.minimap.getLastVisibleScreenRow();
      intactRanges = this.computeIntactRanges(firstRow, lastRow);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (intactRanges.length === 0) {
        this.drawLines(this.context, firstRow, lastRow, 0);
      } else {
        for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
          intact = intactRanges[_i];
          this.copyBitmapPart(this.context, this.offscreenCanvas, intact.domStart, intact.start - firstRow, intact.end - intact.start);
        }
        this.fillGapsBetweenIntactRanges(this.context, intactRanges, firstRow, lastRow);
      }
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenContext.drawImage(this.canvas, 0, 0);
      this.offscreenFirstRow = firstRow;
      return this.offscreenLastRow = lastRow;
    };

    CanvasDrawer.prototype.getTextOpacity = function() {
      return this.textOpacity;
    };

    CanvasDrawer.prototype.getDefaultColor = function() {
      var color;
      color = this.retrieveStyleFromDom(['.editor'], 'color', false, true);
      return this.transparentize(color, this.getTextOpacity());
    };

    CanvasDrawer.prototype.getTokenColor = function(token) {
      return this.retrieveTokenColorFromDom(token);
    };

    CanvasDrawer.prototype.getDecorationColor = function(decoration) {
      var properties;
      properties = decoration.getProperties();
      if (properties.color != null) {
        return properties.color;
      }
      return this.retrieveDecorationColorFromDom(decoration);
    };

    CanvasDrawer.prototype.retrieveTokenColorFromDom = function(token) {
      var color, scopes;
      scopes = token.scopeDescriptor || token.scopes;
      color = this.retrieveStyleFromDom(scopes, 'color');
      return this.transparentize(color, this.getTextOpacity());
    };

    CanvasDrawer.prototype.retrieveDecorationColorFromDom = function(decoration) {
      return this.retrieveStyleFromDom(decoration.getProperties().scope.split(/\s+/), 'background-color', false);
    };

    CanvasDrawer.prototype.transparentize = function(color, opacity) {
      if (opacity == null) {
        opacity = 1;
      }
      return color.replace('rgb(', 'rgba(').replace(')', ", " + opacity + ")");
    };

    CanvasDrawer.prototype.drawLines = function(context, firstRow, lastRow, offsetRow) {
      var canvasWidth, charHeight, charWidth, color, decoration, decorations, displayCodeHighlights, highlightDecorations, invisibleRegExp, line, lineDecorations, lineHeight, lines, row, screenRow, token, value, w, x, y, y0, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
      if (firstRow > lastRow) {
        return;
      }
      lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow);
      lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      canvasWidth = this.canvas.width;
      displayCodeHighlights = this.displayCodeHighlights;
      decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);
      line = lines[0];
      invisibleRegExp = this.getInvisibleRegExp(line);
      for (row = _i = 0, _len = lines.length; _i < _len; row = ++_i) {
        line = lines[row];
        x = 0;
        y = offsetRow + row;
        screenRow = firstRow + row;
        y0 = y * lineHeight;
        lineDecorations = (_ref = decorations['line']) != null ? _ref[screenRow] : void 0;
        if (lineDecorations != null ? lineDecorations.length : void 0) {
          this.drawLineDecorations(context, lineDecorations, y0, canvasWidth, lineHeight);
        }
        highlightDecorations = (_ref1 = decorations['highlight-under']) != null ? _ref1[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_j = 0, _len1 = highlightDecorations.length; _j < _len1; _j++) {
            decoration = highlightDecorations[_j];
            this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
        if ((line != null ? line.tokens : void 0) != null) {
          _ref2 = line.tokens;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            token = _ref2[_k];
            w = token.screenDelta;
            if (!token.isOnlyWhitespace()) {
              color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor();
              value = token.value;
              if (invisibleRegExp != null) {
                value = value.replace(invisibleRegExp, ' ');
              }
              x = this.drawToken(context, value, color, x, y0, charWidth, charHeight);
            } else {
              x += w * charWidth;
            }
            if (x > canvasWidth) {
              break;
            }
          }
        }
        highlightDecorations = (_ref3 = decorations['highlight-over']) != null ? _ref3[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_l = 0, _len3 = highlightDecorations.length; _l < _len3; _l++) {
            decoration = highlightDecorations[_l];
            this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
        highlightDecorations = (_ref4 = decorations['highlight-outline']) != null ? _ref4[firstRow + row] : void 0;
        if (highlightDecorations != null ? highlightDecorations.length : void 0) {
          for (_m = 0, _len4 = highlightDecorations.length; _m < _len4; _m++) {
            decoration = highlightDecorations[_m];
            this.drawHighlightOutlineDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth);
          }
        }
      }
      return context.fill();
    };

    CanvasDrawer.prototype.getInvisibleRegExp = function(line) {
      var invisibles;
      if ((line != null) && (line.invisibles != null)) {
        invisibles = [];
        if (line.invisibles.cr != null) {
          invisibles.push(line.invisibles.cr);
        }
        if (line.invisibles.eol != null) {
          invisibles.push(line.invisibles.eol);
        }
        if (line.invisibles.space != null) {
          invisibles.push(line.invisibles.space);
        }
        if (line.invisibles.tab != null) {
          invisibles.push(line.invisibles.tab);
        }
        return RegExp("" + (invisibles.map(_.escapeRegExp).join('|')), "g");
      }
    };

    CanvasDrawer.prototype.drawToken = function(context, text, color, x, y, charWidth, charHeight) {
      var char, chars, _i, _len;
      context.fillStyle = color;
      chars = 0;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        char = text[_i];
        if (/\s/.test(char)) {
          if (chars > 0) {
            context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight);
          }
          chars = 0;
        } else {
          chars++;
        }
        x += charWidth;
      }
      if (chars > 0) {
        context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight);
      }
      return x;
    };

    CanvasDrawer.prototype.drawLineDecorations = function(context, decorations, y, canvasWidth, lineHeight) {
      var decoration, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = decorations.length; _i < _len; _i++) {
        decoration = decorations[_i];
        context.fillStyle = this.getDecorationColor(decoration);
        _results.push(context.fillRect(0, y, canvasWidth, lineHeight));
      }
      return _results;
    };

    CanvasDrawer.prototype.drawHighlightDecoration = function(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
      var colSpan, range, rowSpan, x;
      context.fillStyle = this.getDecorationColor(decoration);
      range = decoration.getMarker().getScreenRange();
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        return context.fillRect(range.start.column * charWidth, y * lineHeight, colSpan * charWidth, lineHeight);
      } else {
        if (screenRow === range.start.row) {
          x = range.start.column * charWidth;
          return context.fillRect(x, y * lineHeight, canvasWidth - x, lineHeight);
        } else if (screenRow === range.end.row) {
          return context.fillRect(0, y * lineHeight, range.end.column * charWidth, lineHeight);
        } else {
          return context.fillRect(0, y * lineHeight, canvasWidth, lineHeight);
        }
      }
    };

    CanvasDrawer.prototype.drawHighlightOutlineDecoration = function(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
      var bottomWidth, colSpan, range, rowSpan, width, xBottomStart, xEnd, xStart, yEnd, yStart;
      context.fillStyle = this.getDecorationColor(decoration);
      range = decoration.getMarker().getScreenRange();
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        width = colSpan * charWidth;
        xStart = range.start.column * charWidth;
        xEnd = xStart + width;
        yStart = y * lineHeight;
        yEnd = yStart + lineHeight;
        context.fillRect(xStart, yStart, width, 1);
        context.fillRect(xStart, yEnd, width, 1);
        context.fillRect(xStart, yStart, 1, lineHeight);
        return context.fillRect(xEnd, yStart, 1, lineHeight);
      } else if (rowSpan === 1) {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          xBottomStart = Math.max(xStart, xEnd);
          bottomWidth = canvasWidth - xBottomStart;
          context.fillRect(xStart, yStart, width, 1);
          context.fillRect(xBottomStart, yEnd, bottomWidth, 1);
          context.fillRect(xStart, yStart, 1, lineHeight);
          return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          bottomWidth = canvasWidth - xEnd;
          context.fillRect(0, yStart, xStart, 1);
          context.fillRect(0, yEnd, xEnd, 1);
          context.fillRect(0, yStart, 1, lineHeight);
          return context.fillRect(xEnd, yStart, 1, lineHeight);
        }
      } else {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(xStart, yStart, width, 1);
          context.fillRect(xStart, yStart, 1, lineHeight);
          return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else if (screenRow === range.end.row) {
          width = canvasWidth - xStart;
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(0, yEnd, xEnd, 1);
          context.fillRect(0, yStart, 1, lineHeight);
          return context.fillRect(xEnd, yStart, 1, lineHeight);
        } else {
          yStart = y * lineHeight;
          yEnd = yStart + lineHeight;
          context.fillRect(0, yStart, 1, lineHeight);
          context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
          if (screenRow === range.start.row + 1) {
            context.fillRect(0, yStart, xStart, 1);
          }
          if (screenRow === range.end.row - 1) {
            return context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1);
          }
        }
      }
    };

    CanvasDrawer.prototype.copyBitmapPart = function(context, bitmapCanvas, srcRow, destRow, rowCount) {
      var lineHeight;
      lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      return context.drawImage(bitmapCanvas, 0, srcRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight, 0, destRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight);
    };


    /* Internal */

    CanvasDrawer.prototype.fillGapsBetweenIntactRanges = function(context, intactRanges, firstRow, lastRow) {
      var currentRow, intact, _i, _len;
      currentRow = firstRow;
      for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
        intact = intactRanges[_i];
        this.drawLines(context, currentRow, intact.start - 1, currentRow - firstRow);
        currentRow = intact.end;
      }
      if (currentRow <= lastRow) {
        return this.drawLines(context, currentRow, lastRow, currentRow - firstRow);
      }
    };

    CanvasDrawer.prototype.computeIntactRanges = function(firstRow, lastRow) {
      var change, intactRange, intactRanges, newIntactRanges, range, _i, _j, _len, _len1, _ref;
      if ((this.offscreenFirstRow == null) && (this.offscreenLastRow == null)) {
        return [];
      }
      intactRanges = [
        {
          start: this.offscreenFirstRow,
          end: this.offscreenLastRow,
          domStart: 0
        }
      ];
      _ref = this.pendingChanges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        change = _ref[_i];
        newIntactRanges = [];
        for (_j = 0, _len1 = intactRanges.length; _j < _len1; _j++) {
          range = intactRanges[_j];
          if (change.end < range.start && change.screenDelta !== 0) {
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              domStart: range.domStart
            });
          } else if (change.end < range.start || change.start > range.end) {
            newIntactRanges.push(range);
          } else {
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                domStart: range.domStart
              });
            }
            if (change.end < range.end) {
              if (change.bufferDelta !== 0) {
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  domStart: range.domStart + change.end + 1 - range.start
                });
              }
            }
          }
          intactRange = newIntactRanges[newIntactRanges.length - 1];
        }
        intactRanges = newIntactRanges;
      }
      this.truncateIntactRanges(intactRanges, firstRow, lastRow);
      this.pendingChanges = [];
      return intactRanges;
    };

    CanvasDrawer.prototype.truncateIntactRanges = function(intactRanges, firstRow, lastRow) {
      var i, range;
      i = 0;
      while (i < intactRanges.length) {
        range = intactRanges[i];
        if (range.start < firstRow) {
          range.domStart += firstRow - range.start;
          range.start = firstRow;
        }
        if (range.end > lastRow) {
          range.end = lastRow;
        }
        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }
        i++;
      }
      return intactRanges.sort(function(a, b) {
        return a.domStart - b.domStart;
      });
    };

    return CanvasDrawer;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvY2FudmFzLWRyYXdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUE7QUFBQSxnQkFBQTs7QUFBQSwyQkFHQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBbkIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLEdBQXNDLEtBRnRDLENBQUE7O1FBR0EsSUFBQyxDQUFBLGlCQUFrQjtPQUhuQjtBQUFBLE1BS0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FMbkIsQ0FBQTthQU1BLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsZUFBZSxDQUFDLFVBQWpCLENBQTRCLElBQTVCLEVBUEo7SUFBQSxDQUhsQixDQUFBOztBQUFBLDJCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGlEQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyx3QkFBVCxDQUFBLENBQVgsQ0FBQTtBQUFB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

//# sourceURL=/home/epse/.atom/packages/minimap/lib/mixins/canvas-drawer.coffee
