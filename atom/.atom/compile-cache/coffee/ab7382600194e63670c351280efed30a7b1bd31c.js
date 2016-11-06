(function() {
  var $, CompositeDisposable, InsertFootnoteView, TextEditorView, View, config, guid, helper, templateHelper, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  guid = require("guid");

  config = require("../config");

  utils = require("../utils");

  helper = require("../helpers/insert-link-helper");

  templateHelper = require("../helpers/template-helper");

  module.exports = InsertFootnoteView = (function(_super) {
    __extends(InsertFootnoteView, _super);

    function InsertFootnoteView() {
      return InsertFootnoteView.__super__.constructor.apply(this, arguments);
    }

    InsertFootnoteView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Footnote", {
            "class": "icon icon-pin"
          });
          _this.div(function() {
            _this.label("Label", {
              "class": "message"
            });
            return _this.subview("labelEditor", new TextEditorView({
              mini: true
            }));
          });
          return _this.div({
            outlet: "contentBox"
          }, function() {
            _this.label("Content", {
              "class": "message"
            });
            return _this.subview("contentEditor", new TextEditorView({
              mini: true
            }));
          });
        };
      })(this));
    };

    InsertFootnoteView.prototype.initialize = function() {
      utils.setTabIndex([this.labelEditor, this.contentEditor]);
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

    InsertFootnoteView.prototype.onConfirm = function() {
      var footnote;
      footnote = {
        label: this.labelEditor.getText(),
        content: this.contentEditor.getText()
      };
      if (this.footnote) {
        this.updateFootnote(footnote);
      } else {
        this.insertFootnote(footnote);
      }
      return this.detach();
    };

    InsertFootnoteView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this._normalizeSelectionAndSetFootnote();
      this.panel.show();
      this.labelEditor.getModel().selectAll();
      return this.labelEditor.focus();
    };

    InsertFootnoteView.prototype.detach = function() {
      var _ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((_ref1 = this.previouslyFocusedElement) != null) {
          _ref1.focus();
        }
      }
      return InsertFootnoteView.__super__.detach.apply(this, arguments);
    };

    InsertFootnoteView.prototype.detached = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertFootnoteView.prototype._normalizeSelectionAndSetFootnote = function() {
      var selection;
      this.range = utils.getTextBufferRange(this.editor, "link", {
        selectBy: "nope"
      });
      selection = this.editor.getTextInRange(this.range);
      if (utils.isFootnote(selection)) {
        this.footnote = utils.parseFootnote(selection);
        this.contentBox.hide();
        return this.labelEditor.setText(this.footnote["label"]);
      } else {
        return this.labelEditor.setText(guid.raw().slice(0, 8));
      }
    };

    InsertFootnoteView.prototype.updateFootnote = function(footnote) {
      var definitionText, findText, referenceText, replaceText, updateText;
      referenceText = templateHelper.create("footnoteReferenceTag", footnote);
      definitionText = templateHelper.create("footnoteDefinitionTag", footnote).trim();
      if (this.footnote["isDefinition"]) {
        updateText = definitionText;
        findText = templateHelper.create("footnoteReferenceTag", this.footnote).trim();
        replaceText = referenceText;
      } else {
        updateText = referenceText;
        findText = templateHelper.create("footnoteDefinitionTag", this.footnote).trim();
        replaceText = definitionText;
      }
      this.editor.setTextInBufferRange(this.range, updateText);
      return this.editor.buffer.scan(RegExp("" + (utils.escapeRegExp(findText))), function(match) {
        match.replace(replaceText);
        return match.stop();
      });
    };

    InsertFootnoteView.prototype.insertFootnote = function(footnote) {
      var definitionText, referenceText;
      referenceText = templateHelper.create("footnoteReferenceTag", footnote);
      definitionText = templateHelper.create("footnoteDefinitionTag", footnote).trim();
      this.editor.setTextInBufferRange(this.range, referenceText);
      if (config.get("footnoteInsertPosition") === "article") {
        return helper.insertAtEndOfArticle(this.editor, definitionText);
      } else {
        return helper.insertAfterCurrentParagraph(this.editor, definitionText);
      }
    };

    return InsertFootnoteView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvaW5zZXJ0LWZvb3Rub3RlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1IQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixFQUFVLHNCQUFBLGNBRFYsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVIsQ0FKVCxDQUFBOztBQUFBLEVBS0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBTFIsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsK0JBQVIsQ0FOVCxDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFpQixPQUFBLENBQVEsNEJBQVIsQ0FQakIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sd0NBQVA7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BELFVBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxpQkFBUCxFQUEwQjtBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBMUIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxL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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/views/insert-footnote-view.coffee
