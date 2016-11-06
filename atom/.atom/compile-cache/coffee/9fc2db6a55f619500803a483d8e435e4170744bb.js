(function() {
  var FormatText, LineMeta, config, utils;

  config = require("../config");

  utils = require("../utils");

  LineMeta = require("../helpers/line-meta");

  module.exports = FormatText = (function() {
    function FormatText(action) {
      this.action = action;
      this.editor = atom.workspace.getActiveTextEditor();
    }

    FormatText.prototype.trigger = function(e) {
      var fn;
      fn = this.action.replace(/-[a-z]/ig, function(s) {
        return s[1].toUpperCase();
      });
      return this.editor.transact((function(_this) {
        return function() {
          var formattedText, paragraphRange, range, text;
          paragraphRange = _this.editor.getCurrentParagraphBufferRange();
          range = _this.editor.getSelectedBufferRange();
          if (paragraphRange) {
            range = paragraphRange.union(range);
          }
          text = _this.editor.getTextInBufferRange(range);
          if (range.start.row === range.end.row || text.trim() === "") {
            return;
          }
          formattedText = _this[fn](e, range, text.split("\n"));
          if (formattedText) {
            return _this.editor.setTextInBufferRange(range, formattedText);
          }
        };
      })(this));
    };

    FormatText.prototype.correctOrderListNumbers = function(e, range, lines) {
      var correctedLines, idx, indent, indentStack, line, lineMeta, orderStack, _i, _len;
      correctedLines = [];
      indentStack = [];
      orderStack = [];
      for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
        line = lines[idx];
        lineMeta = new LineMeta(line);
        if (lineMeta.isList("ol")) {
          indent = lineMeta.indent;
          if (indentStack.length === 0 || indent.length > indentStack[0].length) {
            indentStack.unshift(indent);
            if (lineMeta.isList("al")) {
              if (utils.isUpperCase(lineMeta.head)) {
                orderStack.unshift(lineMeta.head.replace(/./g, "A"));
              } else {
                orderStack.unshift(lineMeta.head.replace(/./g, "a"));
              }
            } else {
              orderStack.unshift(1);
            }
          } else if (indent.length < indentStack[0].length) {
            while (indent.length !== indentStack[0].length) {
              indentStack.shift();
              orderStack.shift();
            }
            orderStack.unshift(LineMeta.incStr(orderStack.shift()));
          } else {
            orderStack.unshift(LineMeta.incStr(orderStack.shift()));
          }
          correctedLines[idx] = "" + indentStack[0] + orderStack[0] + ". " + lineMeta.body;
        } else {
          correctedLines[idx] = line;
        }
      }
      return correctedLines.join("\n");
    };

    FormatText.prototype.formatTable = function(e, range, lines) {
      var options, row, rows, table, _i, _len, _ref, _ref1;
      if (lines.some(function(line) {
        return line.trim() !== "" && !utils.isTableRow(line);
      })) {
        return;
      }
      _ref = this._parseTable(lines), rows = _ref.rows, options = _ref.options;
      table = [];
      table.push(utils.createTableRow(rows[0], options).trimRight());
      table.push(utils.createTableSeparator(options));
      _ref1 = rows.slice(1);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        table.push(utils.createTableRow(row, options).trimRight());
      }
      return table.join("\n");
    };

    FormatText.prototype._parseTable = function(lines) {
      var columnWidth, i, line, options, row, rows, separator, _i, _j, _len, _len1, _ref;
      rows = [];
      options = {
        numOfColumns: 1,
        extraPipes: config.get("tableExtraPipes"),
        columnWidth: 1,
        columnWidths: [],
        alignment: config.get("tableAlignment"),
        alignments: []
      };
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (line.trim() === "") {
          continue;
        } else if (utils.isTableSeparator(line)) {
          separator = utils.parseTableSeparator(line);
          options.extraPipes = options.extraPipes || separator.extraPipes;
          options.alignments = separator.alignments;
          options.numOfColumns = Math.max(options.numOfColumns, separator.columns.length);
        } else {
          row = utils.parseTableRow(line);
          rows.push(row.columns);
          options.numOfColumns = Math.max(options.numOfColumns, row.columns.length);
          _ref = row.columnWidths;
          for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
            columnWidth = _ref[i];
            options.columnWidths[i] = Math.max(options.columnWidths[i] || 0, columnWidth);
          }
        }
      }
      return {
        rows: rows,
        options: options
      };
    };

    return FormatText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29tbWFuZHMvZm9ybWF0LXRleHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQURSLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLHNCQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFUyxJQUFBLG9CQUFDLE1BQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBRFYsQ0FEVztJQUFBLENBQWI7O0FBQUEseUJBSUEsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsVUFBQSxFQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLFVBQWhCLEVBQTRCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQUwsQ0FBQSxFQUFQO01BQUEsQ0FBNUIsQ0FBTCxDQUFBO2FBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFFZixjQUFBLDBDQUFBO0FBQUEsVUFBQSxjQUFBLEdBQWlCLEtBQUMsQ0FBQSxNQUFNLENBQUMsOEJBQVIsQ0FBQSxDQUFqQixDQUFBO0FBQUEsVUFFQSxLQUFBLEdB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/commands/format-text.coffee
