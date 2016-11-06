(function() {
  var $, CompositeDisposable, InsertTableView, TextEditorView, View, config, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  config = require("../config");

  utils = require("../utils");

  module.exports = InsertTableView = (function(_super) {
    __extends(InsertTableView, _super);

    function InsertTableView() {
      return InsertTableView.__super__.constructor.apply(this, arguments);
    }

    InsertTableView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Table", {
            "class": "icon icon-diff-added"
          });
          return _this.div(function() {
            _this.label("Rows", {
              "class": "message"
            });
            _this.subview("rowEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Columns", {
              "class": "message"
            });
            return _this.subview("columnEditor", new TextEditorView({
              mini: true
            }));
          });
        };
      })(this));
    };

    InsertTableView.prototype.initialize = function() {
      utils.setTabIndex([this.rowEditor, this.columnEditor]);
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.onConfirm();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    InsertTableView.prototype.onConfirm = function() {
      var col, row;
      row = parseInt(this.rowEditor.getText(), 10);
      col = parseInt(this.columnEditor.getText(), 10);
      if (this.isValidRange(row, col)) {
        this.insertTable(row, col);
      }
      return this.detach();
    };

    InsertTableView.prototype.display = function() {
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.rowEditor.setText("3");
      this.columnEditor.setText("3");
      this.panel.show();
      return this.rowEditor.focus();
    };

    InsertTableView.prototype.detach = function() {
      var _ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((_ref1 = this.previouslyFocusedElement) != null) {
          _ref1.focus();
        }
      }
      return InsertTableView.__super__.detach.apply(this, arguments);
    };

    InsertTableView.prototype.detached = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertTableView.prototype.insertTable = function(row, col) {
      var cursor;
      cursor = this.editor.getCursorBufferPosition();
      this.editor.insertText(this.createTable(row, col));
      return this.editor.setCursorBufferPosition(cursor);
    };

    InsertTableView.prototype.createTable = function(row, col) {
      var options, table, _i, _ref1;
      options = {
        numOfColumns: col,
        extraPipes: config.get("tableExtraPipes"),
        columnWidth: 1,
        alignment: config.get("tableAlignment")
      };
      table = [];
      table.push(utils.createTableRow([], options));
      table.push(utils.createTableSeparator(options));
      for (_i = 0, _ref1 = row - 2; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--) {
        table.push(utils.createTableRow([], options));
      }
      return table.join("\n");
    };

    InsertTableView.prototype.isValidRange = function(row, col) {
      if (isNaN(row) || isNaN(col)) {
        return false;
      }
      if (row < 2 || col < 1) {
        return false;
      }
      return true;
    };

    return InsertTableView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvaW5zZXJ0LXRhYmxlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtGQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixFQUFVLHNCQUFBLGNBRFYsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUixDQUhULENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FKUixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwRCxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QjtBQUFBLFlBQUEsT0FBQSxFQUFPLHNCQUFQO1dBQXZCLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWU7QUFBQSxjQUFBLE9BQUEsRUFBTyxTQUFQO2FBQWYsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFdBQVQsRUFBMEIs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/views/insert-table-view.coffee
