(function() {
  var $, NewFileView, TextEditorView, View, config, fs, path, templateHelper, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
      atom.commands.add(this.element, {
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
      });
      return this.dateTime = templateHelper.getDateTime();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL25ldy1maWxlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxzQkFBQSxjQUFWLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUlBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUixDQUpULENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FMUixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixPQUFBLENBQVEsNEJBQVIsQ0FOakIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsUUFBRCxHQUFZLE1BQVosQ0FBQTs7QUFBQSxJQUNBLFdBQUMsQ0FBQSxVQUFELEdBQWMsY0FEZCxDQUFBOztBQUFBLElBRUEsV0FBQyxDQUFBLGNBQUQsR0FBa0IsaUJBRmxCLENBQUE7O0FBQUEsSUFJQSxXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxpQkFBUDtPQUFMLEVBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDN0IsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFRLFVBQUEsR0FBVSxLQUFDLENBQUEsUUFBbkIsRUFBK0I7QUFBQSxZQUFBLE9BQUEsRUFBTyxvQkFBUDtXQUEvQixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLFdBQVAsRUFBb0I7QUFBQSxjQUFBLE9BQUEsRUFBTyxTQUFQO2FBQXBCLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO0FBQUEsY0FBQSxJQUFBLEVBQU0sSUFBTjthQUFmLENBQTNCLENBREEsQ0FBQTtBQUFBLFlBRUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWU7QUFBQSxjQUFBLE9BQUEsRUFBTyxTQUFQO2FBQWYsQ0FGQSxDQUFBO0FBQUEsWUFHQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxjQUFBLENBQWU7QUFBQSxjQUFBLElBQUEsRUFBTSxJQUFOO2FBQWYsQ0FBM0IsQ0FIQSxDQUFBO0FBQUEsWUFJQSxLQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFBZ0I7QUFBQSxjQUFBLE9BQUEsRUFBTyxTQUFQO2FBQWhCLENBSkEsQ0FBQTttQkFLQSxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBNEIsSUFBQSxjQUFBLENBQWU7QUFBQSxjQUFBLElBQUEsRUFBTSxJQUFOO2FBQWYsQ0FBNUIsRUFORztVQUFBLENBQUwsQ0FEQSxDQUFBO0FBQUEsVUFRQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLFlBQWtCLE1BQUEsRUFBUSxTQUExQjtXQUFILENBUkEsQ0FBQTtpQkFTQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtBQUFBLFlBQWdCLE1BQUEsRUFBUSxPQUF4QjtXQUFILEVBVjZCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsRUFEUTtJQUFBLENBSlYsQ0FBQTs7QUFBQSwwQkFpQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsQ0FBQyxJQUFDLENBQUEsV0FBRixFQUFlLElBQUMsQ0FBQSxVQUFoQixFQUE0QixJQUFDLENBQUEsVUFBN0IsQ0FBbEIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBQSxDQUF1QixDQUFDLFdBQXhCLENBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEMsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLFdBQXZCLENBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsQ0FIQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLFdBQXZCLENBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ2pDLEtBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFvQixjQUFjLENBQUMsTUFBZixDQUFzQixLQUFDLENBQUEsV0FBVyxDQUFDLFVBQW5DLEVBQStDLEtBQUMsQ0FBQSxXQUFELENBQUEsQ0FBL0MsQ0FBcEIsRUFEaUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQyxDQUxBLENBQUE7QUFBQSxNQVFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFDRTtBQUFBLFFBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtBQUFBLFFBQ0EsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGY7T0FERixDQVJBLENBQUE7YUFhQSxJQUFDLENBQUEsUUFBRCxHQUFZLGNBQWMsQ0FBQyxXQUFmLENBQUEsRUFkRjtJQUFBLENBakJaLENBQUE7O0FBQUEsMEJBaUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7O1FBQ1AsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFVBQVksT0FBQSxFQUFTLEtBQXJCO1NBQTdCO09BQVY7QUFBQSxNQUNBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVgsQ0FENUIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLGNBQWMsQ0FBQyxrQkFBZixDQUFrQyxJQUFDLENBQUEsUUFBbkMsQ0FBcEIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFuQyxFQUErQyxJQUFDLENBQUEsUUFBaEQsQ0FBcEIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUpBLENBQUE7YUFLQSxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQSxFQU5PO0lBQUEsQ0FqQ1QsQ0FBQTs7QUFBQSwwQkF5Q0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUFBLENBQUE7O2VBQ3lCLENBQUUsS0FBM0IsQ0FBQTtTQUZGO09BQUE7YUFHQSx5Q0FBQSxTQUFBLEVBSk07SUFBQSxDQXpDUixDQUFBOztBQUFBLDBCQStDQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxnQ0FBQTtBQUFBO0FBQ0UsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQVYsRUFBeUIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUF6QixDQUFYLENBQUE7QUFFQSxRQUFBLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQUg7aUJBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQWEsT0FBQSxHQUFPLFFBQVAsR0FBZ0Isa0JBQTdCLEVBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxlQUFBLEdBQWtCLGNBQWMsQ0FBQyxNQUFmLENBQXNCLGFBQXRCLEVBQXFDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBckMsRUFBd0QsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUF4RCxDQUFsQixDQUFBO0FBQUEsVUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixRQUFqQixFQUEyQixlQUEzQixDQURBLENBQUE7QUFBQSxVQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixDQUZBLENBQUE7aUJBR0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQU5GO1NBSEY7T0FBQSxjQUFBO0FBV0UsUUFESSxjQUNKLENBQUE7ZUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxFQUFBLEdBQUcsS0FBSyxDQUFDLE9BQXJCLEVBWEY7T0FEVTtJQUFBLENBL0NaLENBQUE7O0FBQUEsMEJBNkRBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FDSix5QkFBQSxHQUF3QixDQUFDLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBRCxDQUF4QixHQUF1QyxtQkFBdkMsR0FDUSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBRHJCLEdBQzhCLFdBRDlCLEdBQ3dDLENBQUMsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFELENBRnBDLEVBRFU7SUFBQSxDQTdEWixDQUFBOztBQUFBLDBCQW9FQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQUcsT0FBSDtJQUFBLENBcEVYLENBQUE7O0FBQUEsMEJBcUVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsS0FBeUIsT0FBNUI7SUFBQSxDQXJFZCxDQUFBOztBQUFBLDBCQXNFQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsQ0FBQSxJQUEwQixDQUFDLE1BQUEsR0FBTSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQXBCLEVBQTdCO0lBQUEsQ0F0RVYsQ0FBQTs7QUFBQSwwQkF1RUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFkLEVBQTJCLE1BQU0sQ0FBQyxHQUFQLENBQVcsZUFBWCxDQUEzQixFQUFIO0lBQUEsQ0F2RVQsQ0FBQTs7QUFBQSwwQkF3RUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLGNBQWMsQ0FBQyxrQkFBZixDQUFrQyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQWxDLEVBQUg7SUFBQSxDQXhFVCxDQUFBOztBQUFBLDBCQXlFQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxlQUFYLEVBQUg7SUFBQSxDQXpFZCxDQUFBOztBQUFBLDBCQTRFQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsTUFBTSxDQUFDLEdBQVAsQ0FBVyxjQUFYLENBQWxCLEVBQUg7SUFBQSxDQTVFWixDQUFBOztBQUFBLDBCQTZFQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFWLEVBQWlDLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBakMsRUFBSDtJQUFBLENBN0ViLENBQUE7O0FBQUEsMEJBK0VBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFBRyxjQUFjLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQW5DLEVBQW1ELElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBbkQsRUFBc0UsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUF0RSxFQUFIO0lBQUEsQ0EvRWIsQ0FBQTs7QUFBQSwwQkFnRkEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLGNBQWMsQ0FBQyxvQkFBZixDQUFvQyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFwQyxDQUFBLElBQThELElBQUMsQ0FBQSxTQUFsRTtJQUFBLENBaEZiLENBQUE7O0FBQUEsMEJBaUZBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQUcsY0FBYyxDQUFDLGNBQWYsQ0FBOEIsSUFBOUIsRUFBSDtJQUFBLENBakZoQixDQUFBOzt1QkFBQTs7S0FEd0IsS0FUMUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/views/new-file-view.coffee
