(function() {
  var $, CompositeDisposable, NewFileView, TextEditorView, View, config, fs, path, templateHelper, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  module.exports = NewFileView = (function(_super) {
    __extends(NewFileView, _super);

    function NewFileView() {
      return NewFileView.__super__.constructor.apply(this, arguments);
    }

    NewFileView.fileType = "File";

    NewFileView.pathConfig = "siteFilesDir";

    NewFileView.fileNameConfig = "newFileFileName";

    NewFileView.content = function() {
      return this.div({
        "class": "markdown-writer"
      }, (function(_this) {
        return function() {
          _this.label("Add New " + _this.fileType, {
            "class": "icon icon-file-add"
          });
          _this.div(function() {
            _this.label("Directory", {
              "class": "message"
            });
            _this.subview("pathEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Date", {
              "class": "message"
            });
            _this.subview("dateEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Title", {
              "class": "message"
            });
            return _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
          });
          _this.p({
            "class": "message",
            outlet: "message"
          });
          return _this.p({
            "class": "error",
            outlet: "error"
          });
        };
      })(this));
    };

    NewFileView.prototype.initialize = function() {
      utils.setTabIndex([this.titleEditor, this.pathEditor, this.dateEditor]);
      this.dateTime = templateHelper.getDateTime();
      this.titleEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.updatePath();
        };
      })(this));
      this.pathEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.updatePath();
        };
      })(this));
      this.dateEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.pathEditor.setText(templateHelper.create(_this.constructor.pathConfig, _this.getDateTime()));
        };
      })(this));
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.createFile();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    NewFileView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.dateEditor.setText(templateHelper.getFrontMatterDate(this.dateTime));
      this.pathEditor.setText(templateHelper.create(this.constructor.pathConfig, this.dateTime));
      this.panel.show();
      return this.titleEditor.focus();
    };

    NewFileView.prototype.detach = function() {
      var _ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((_ref1 = this.previouslyFocusedElement) != null) {
          _ref1.focus();
        }
      }
      return NewFileView.__super__.detach.apply(this, arguments);
    };

    NewFileView.prototype.detached = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.disposables = null;
    };

    NewFileView.prototype.createFile = function() {
      var error, filePath, frontMatterText;
      try {
        filePath = path.join(this.getFileDir(), this.getFilePath());
        if (fs.existsSync(filePath)) {
          return this.error.text("File " + filePath + " already exists!");
        } else {
          frontMatterText = templateHelper.create("frontMatter", this.getFrontMatter(), this.getDateTime());
          fs.writeFileSync(filePath, frontMatterText);
          atom.workspace.open(filePath);
          return this.detach();
        }
      } catch (_error) {
        error = _error;
        return this.error.text("" + error.message);
      }
    };

    NewFileView.prototype.updatePath = function() {
      return this.message.html("<b>Site Directory:</b> " + (this.getFileDir()) + "<br/>\n<b>Create " + this.constructor.fileType + " At:</b> " + (this.getFilePath()));
    };

    NewFileView.prototype.getLayout = function() {
      return "post";
    };

    NewFileView.prototype.getPublished = function() {
      return this.constructor.fileType === "Post";
    };

    NewFileView.prototype.getTitle = function() {
      return this.titleEditor.getText() || ("New " + this.constructor.fileType);
    };

    NewFileView.prototype.getSlug = function() {
      return utils.slugize(this.getTitle(), config.get('slugSeparator'));
    };

    NewFileView.prototype.getDate = function() {
      return templateHelper.getFrontMatterDate(this.getDateTime());
    };

    NewFileView.prototype.getExtension = function() {
      return config.get("fileExtension");
    };

    NewFileView.prototype.getFileDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    NewFileView.prototype.getFilePath = function() {
      return path.join(this.pathEditor.getText(), this.getFileName());
    };

    NewFileView.prototype.getFileName = function() {
      return templateHelper.create(this.constructor.fileNameConfig, this.getFrontMatter(), this.getDateTime());
    };

    NewFileView.prototype.getDateTime = function() {
      return templateHelper.parseFrontMatterDate(this.dateEditor.getText()) || this.dateTime;
    };

    NewFileView.prototype.getFrontMatter = function() {
      return templateHelper.getFrontMatter(this);
    };

    return NewFileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvbmV3LWZpbGUtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0dBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBQSxDQUFELEVBQUksWUFBQSxJQUFKLEVBQVUsc0JBQUEsY0FEVixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUhMLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVIsQ0FMVCxDQUFBOztBQUFBLEVBTUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBTlIsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSLENBUGpCLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLFFBQUQsR0FBWSxNQUFaLENBQUE7O0FBQUEsSUFDQSxXQUFDLENBQUEsVUFBRCxHQUFjLGNBRGQsQ0FBQTs7QUFBQSxJQUVBLFdBQUMsQ0FBQSxjQUFELEdBQWtCLGlCQUZsQixDQUFBOztBQUFBLElBSUEsV0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8saUJBQVA7T0FBTCxFQUErQixDQUFBLFNBQUEsS0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/views/new-file-view.coffee
