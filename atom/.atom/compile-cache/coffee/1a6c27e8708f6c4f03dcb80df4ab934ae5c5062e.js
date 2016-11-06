(function() {
  var HEADING_REGEX, JumpTo, REFERENCE_REGEX, TABLE_COL_REGEX, utils;

  utils = require("../utils");

  HEADING_REGEX = /^\#{1,6} +.+$/;

  REFERENCE_REGEX = /\[([^\[\]]+)(?:\]|\]:)/;

  TABLE_COL_REGEX = /([^\|]*?)\s*\|/;

  module.exports = JumpTo = (function() {
    function JumpTo(command) {
      this.command = command;
      this.editor = atom.workspace.getActiveTextEditor();
      this.cursor = this.editor.getCursorBufferPosition();
    }

    JumpTo.prototype.trigger = function(e) {
      var fn, range;
      fn = this.command.replace(/-[a-z]/ig, function(s) {
        return s[1].toUpperCase();
      });
      range = this[fn]();
      if (range) {
        return this.editor.setCursorBufferPosition(range);
      } else {
        return e.abortKeyBinding();
      }
    };

    JumpTo.prototype.previousHeading = function() {
      var found, range;
      range = [[0, 0], [this.cursor.row - 1, 0]];
      found = false;
      this.editor.buffer.backwardsScanInRange(HEADING_REGEX, range, function(match) {
        found = match.range.start;
        return match.stop();
      });
      return found;
    };

    JumpTo.prototype.nextHeading = function() {
      var eof, range;
      eof = this.editor.getEofBufferPosition();
      range = this._findNextHeading([[this.cursor.row + 1, 0], [eof.row + 1, 0]]) || this._findNextHeading([[0, 0], [eof.row + 1, 0]]);
      return range;
    };

    JumpTo.prototype._findNextHeading = function(range) {
      var found;
      found = false;
      this.editor.buffer.scanInRange(HEADING_REGEX, range, function(match) {
        found = match.range.start;
        return match.stop();
      });
      return found;
    };

    JumpTo.prototype.referenceDefinition = function() {
      var found, link, range, selection;
      range = utils.getTextBufferRange(this.editor, "link", {
        selectBy: "currentLine"
      });
      if (link = utils.findLinkInRange(this.editor, range)) {
        if (!link.id) {
          return false;
        }
        if (!link.linkRange || !link.definitionRange) {
          return false;
        }
        if (link.linkRange.start.row !== this.cursor.row && link.linkRange.end.row !== this.cursor.row) {
          return [link.linkRange.start.row, link.linkRange.start.column];
        } else {
          return [link.definitionRange.start.row, link.definitionRange.start.column];
        }
      } else {
        selection = this.editor.getTextInRange(range);
        if (!selection) {
          return false;
        }
        link = REFERENCE_REGEX.exec(selection);
        if (!link) {
          return false;
        }
        found = false;
        this.editor.buffer.scan(RegExp("\\[" + (utils.escapeRegExp(link[1])) + "\\]", "g"), (function(_this) {
          return function(match) {
            if (match.range.start.row !== _this.cursor.row && match.range.end.row !== _this.cursor.row) {
              found = [match.range.start.row, match.range.start.column];
              return match.stop();
            }
          };
        })(this));
        return found;
      }
    };

    JumpTo.prototype.nextTableCell = function() {
      var line;
      line = this.editor.lineTextForBufferRow(this.cursor.row);
      if (utils.isTableRow(line) || utils.isTableSeparator(line)) {
        return this._findNextTableCell(line, this.cursor.row, this.cursor.column);
      } else {
        return false;
      }
    };

    JumpTo.prototype._findNextTableCell = function(currentLine, row, column) {
      var td;
      column = currentLine.indexOf("|", column);
      if (column === -1 || column === currentLine.length - 1) {
        row += 1;
        column = 0;
        currentLine = this.editor.lineTextForBufferRow(row);
      }
      if (utils.isTableSeparator(currentLine)) {
        row += 1;
        column = 0;
        currentLine = this.editor.lineTextForBufferRow(row);
      }
      if (currentLine === void 0) {
        return false;
      }
      if (currentLine[column] === "|") {
        column += 1;
        currentLine = currentLine.slice(column);
      }
      if (td = TABLE_COL_REGEX.exec(currentLine)) {
        return [row, column + td[1].length];
      } else {
        return [row, column + currentLine.length];
      }
    };

    return JumpTo;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29tbWFuZHMvanVtcC10by5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOERBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FBUixDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFrQixlQUZsQixDQUFBOztBQUFBLEVBR0EsZUFBQSxHQUFrQix3QkFIbEIsQ0FBQTs7QUFBQSxFQUlBLGVBQUEsR0FBa0IsZ0JBSmxCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxnQkFBQyxPQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQURWLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBRlYsQ0FEVztJQUFBLENBQWI7O0FBQUEscUJBS0EsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsVUFBQSxTQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLFVBQWpCLEVBQTZCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQUwsQ0FBQSxFQUFQO01BQUEsQ0FBN0IsQ0FBTCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBRSxDQUFBLEVBQUEsQ0FBRixDQUFBLENBRFIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxLQUFIO2VBQ0UsSUFBQyxDQUFBLE1B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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/commands/jump-to.coffee