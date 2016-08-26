(function() {
  var $, FrontMatter, ManageFrontMatterView, TextEditorView, View, config, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  config = require("../config");

  utils = require("../utils");

  FrontMatter = require("../helpers/front-matter");

  module.exports = ManageFrontMatterView = (function(_super) {
    __extends(ManageFrontMatterView, _super);

    function ManageFrontMatterView() {
      return ManageFrontMatterView.__super__.constructor.apply(this, arguments);
    }

    ManageFrontMatterView.labelName = "Manage Field";

    ManageFrontMatterView.fieldName = "fieldName";

    ManageFrontMatterView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-selection"
      }, (function(_this) {
        return function() {
          _this.label(_this.labelName, {
            "class": "icon icon-book"
          });
          _this.p({
            "class": "error",
            outlet: "error"
          });
          _this.subview("fieldEditor", new TextEditorView({
            mini: true
          }));
          return _this.ul({
            "class": "candidates",
            outlet: "candidates"
          }, function() {
            return _this.li("Loading...");
          });
        };
      })(this));
    };

    ManageFrontMatterView.prototype.initialize = function() {
      this.candidates.on("click", "li", (function(_this) {
        return function(e) {
          return _this.appendFieldItem(e);
        };
      })(this));
      return atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.saveFrontMatter();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      });
    };

    ManageFrontMatterView.prototype.display = function() {
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.fetchSiteFieldCandidates();
      this.frontMatter = new FrontMatter(this.editor);
      if (this.frontMatter.parseError) {
        return this.detach();
      }
      this.setEditorFieldItems(this.frontMatter.getArray(this.constructor.fieldName));
      this.panel.show();
      return this.fieldEditor.focus();
    };

    ManageFrontMatterView.prototype.detach = function() {
      var _ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((_ref1 = this.previouslyFocusedElement) != null) {
          _ref1.focus();
        }
      }
      return ManageFrontMatterView.__super__.detach.apply(this, arguments);
    };

    ManageFrontMatterView.prototype.saveFrontMatter = function() {
      this.frontMatter.set(this.constructor.fieldName, this.getEditorFieldItems());
      this.frontMatter.save();
      return this.detach();
    };

    ManageFrontMatterView.prototype.setEditorFieldItems = function(fieldItems) {
      return this.fieldEditor.setText(fieldItems.join(","));
    };

    ManageFrontMatterView.prototype.getEditorFieldItems = function() {
      return this.fieldEditor.getText().split(/\s*,\s*/).filter(function(c) {
        return !!c.trim();
      });
    };

    ManageFrontMatterView.prototype.fetchSiteFieldCandidates = function() {};

    ManageFrontMatterView.prototype.displaySiteFieldItems = function(siteFieldItems) {
      var fieldItems, tagElems;
      fieldItems = this.frontMatter.getArray(this.constructor.fieldName) || [];
      tagElems = siteFieldItems.map(function(tag) {
        if (fieldItems.indexOf(tag) < 0) {
          return "<li>" + tag + "</li>";
        } else {
          return "<li class='selected'>" + tag + "</li>";
        }
      });
      return this.candidates.empty().append(tagElems.join(""));
    };

    ManageFrontMatterView.prototype.appendFieldItem = function(e) {
      var fieldItem, fieldItems, idx;
      fieldItem = e.target.textContent;
      fieldItems = this.getEditorFieldItems();
      idx = fieldItems.indexOf(fieldItem);
      if (idx < 0) {
        fieldItems.push(fieldItem);
        e.target.classList.add("selected");
      } else {
        fieldItems.splice(idx, 1);
        e.target.classList.remove("selected");
      }
      this.setEditorFieldItems(fieldItems);
      return this.fieldEditor.focus();
    };

    return ManageFrontMatterView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL21hbmFnZS1mcm9udC1tYXR0ZXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0ZBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixFQUFVLHNCQUFBLGNBQVYsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUixDQUZULENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSx5QkFBUixDQUpkLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osNENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEscUJBQUMsQ0FBQSxTQUFELEdBQVksY0FBWixDQUFBOztBQUFBLElBQ0EscUJBQUMsQ0FBQSxTQUFELEdBQVksV0FEWixDQUFBOztBQUFBLElBR0EscUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDJDQUFQO09BQUwsRUFBeUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN2RCxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sS0FBQyxDQUFBLFNBQVIsRUFBbUI7QUFBQSxZQUFBLE9BQUEsRUFBTyxnQkFBUDtXQUFuQixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxZQUFBLE9BQUEsRUFBTyxPQUFQO0FBQUEsWUFBZ0IsTUFBQSxFQUFR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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/views/manage-front-matter-view.coffee
