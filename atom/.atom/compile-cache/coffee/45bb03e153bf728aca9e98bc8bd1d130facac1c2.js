(function() {
  var $, CompositeDisposable, FrontMatter, ManageFrontMatterView, TextEditorView, View, config, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

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
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
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
      }));
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

    ManageFrontMatterView.prototype.detached = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.disposables = null;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvbWFuYWdlLWZyb250LW1hdHRlci12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxR0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxPQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxzQkFBQSxjQURWLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVIsQ0FIVCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBSlIsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxPQUFBLENBQVEseUJBQVIsQ0FMZCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHFCQUFDLENBQUEsU0FBRCxHQUFZLGNBQVosQ0FBQTs7QUFBQSxJQUNBLHFCQUFDLENBQUEsU0FBRCxHQUFZLFdBRFosQ0FBQTs7QUFBQSxJQUdBLHFCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywyQ0FBUDtPQUFMLEVBQXlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdkQsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEtBQUMsQ0FBQSxTQUFSLEVBQW1CO0FBQUEsWUFBQSxPQUFBLEVBQU8sZ0JBQVA7V0FBbkIsQ0FBQSxDQUFBO0FBQUEsVUFD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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/views/manage-front-matter-view.coffee
