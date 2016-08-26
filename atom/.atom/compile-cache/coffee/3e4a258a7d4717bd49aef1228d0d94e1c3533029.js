(function() {
  var $, InsertImageView, TextEditorView, View, config, dialog, fs, lastInsertImageDir, path, remote, templateHelper, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View, TextEditorView = _ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  remote = require("remote");

  dialog = remote.require("dialog");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  lastInsertImageDir = null;

  module.exports = InsertImageView = (function(_super) {
    __extends(InsertImageView, _super);

    function InsertImageView() {
      return InsertImageView.__super__.constructor.apply(this, arguments);
    }

    InsertImageView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Image", {
            "class": "icon icon-device-camera"
          });
          _this.div(function() {
            _this.label("Image Path (src)", {
              "class": "message"
            });
            _this.subview("imageEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "dialog-row"
            }, function() {
              _this.button("Choose Local Image", {
                outlet: "openImageButton",
                "class": "btn"
              });
              return _this.label({
                outlet: "message",
                "class": "side-label"
              });
            });
            _this.label("Title (alt)", {
              "class": "message"
            });
            _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Width (px)", {
                "class": "message"
              });
              return _this.subview("widthEditor", new TextEditorView({
                mini: true
              }));
            });
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Height (px)", {
                "class": "message"
              });
              return _this.subview("heightEditor", new TextEditorView({
                mini: true
              }));
            });
            return _this.div({
              "class": "col-2"
            }, function() {
              _this.label("Alignment", {
                "class": "message"
              });
              return _this.subview("alignEditor", new TextEditorView({
                mini: true
              }));
            });
          });
          _this.div({
            outlet: "copyImagePanel",
            "class": "hidden dialog-row"
          }, function() {
            return _this.label({
              "for": "markdown-writer-copy-image-checkbox"
            }, function() {
              _this.input({
                id: "markdown-writer-copy-image-checkbox"
              }, {
                type: "checkbox",
                outlet: "copyImageCheckbox"
              });
              return _this.span("Copy Image to Site Image Directory", {
                "class": "side-label"
              });
            });
          });
          return _this.div({
            "class": "image-container"
          }, function() {
            return _this.img({
              outlet: 'imagePreview'
            });
          });
        };
      })(this));
    };

    InsertImageView.prototype.initialize = function() {
      utils.setTabIndex([this.imageEditor, this.openImageButton, this.titleEditor, this.widthEditor, this.heightEditor, this.alignEditor, this.copyImageCheckbox]);
      this.imageEditor.on("blur", (function(_this) {
        return function() {
          return _this.updateImageSource(_this.imageEditor.getText().trim());
        };
      })(this));
      this.openImageButton.on("click", (function(_this) {
        return function() {
          return _this.openImageDialog();
        };
      })(this));
      return atom.commands.add(this.element, {
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
      });
    };

    InsertImageView.prototype.onConfirm = function() {
      var callback, imgSource;
      imgSource = this.imageEditor.getText().trim();
      if (!imgSource) {
        return;
      }
      callback = (function(_this) {
        return function() {
          _this.insertImageTag();
          return _this.detach();
        };
      })(this);
      if (!this.copyImageCheckbox.hasClass('hidden') && this.copyImageCheckbox.prop("checked")) {
        return this.copyImage(this.resolveImagePath(imgSource), callback);
      } else {
        return callback();
      }
    };

    InsertImageView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this.frontMatter = templateHelper.getEditor(this.editor);
      this.dateTime = templateHelper.getDateTime();
      this.setFieldsFromSelection();
      this.panel.show();
      return this.imageEditor.focus();
    };

    InsertImageView.prototype.detach = function() {
      var _ref1;
      if (!this.panel.isVisible()) {
        return;
      }
      this.panel.hide();
      if ((_ref1 = this.previouslyFocusedElement) != null) {
        _ref1.focus();
      }
      return InsertImageView.__super__.detach.apply(this, arguments);
    };

    InsertImageView.prototype.setFieldsFromSelection = function() {
      var img, selection;
      this.range = utils.getTextBufferRange(this.editor, "link");
      selection = this.editor.getTextInRange(this.range);
      if (!selection) {
        return;
      }
      if (utils.isImage(selection)) {
        img = utils.parseImage(selection);
      } else if (utils.isImageTag(selection)) {
        img = utils.parseImageTag(selection);
      } else {
        img = {
          alt: selection
        };
      }
      this.titleEditor.setText(img.alt || "");
      this.widthEditor.setText(img.width || "");
      this.heightEditor.setText(img.height || "");
      this.imageEditor.setText(img.src || "");
      return this.updateImageSource(img.src);
    };

    InsertImageView.prototype.openImageDialog = function() {
      var files;
      files = dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: lastInsertImageDir || this.siteLocalDir()
      });
      if (!(files && files.length > 0)) {
        return;
      }
      this.imageEditor.setText(files[0]);
      this.updateImageSource(files[0]);
      if (!utils.isUrl(files[0])) {
        lastInsertImageDir = path.dirname(files[0]);
      }
      return this.titleEditor.focus();
    };

    InsertImageView.prototype.updateImageSource = function(file) {
      if (!file) {
        return;
      }
      this.displayImagePreview(file);
      if (utils.isUrl(file) || this.isInSiteDir(this.resolveImagePath(file))) {
        return this.copyImagePanel.addClass("hidden");
      } else {
        return this.copyImagePanel.removeClass("hidden");
      }
    };

    InsertImageView.prototype.displayImagePreview = function(file) {
      if (this.imageOnPreview === file) {
        return;
      }
      if (utils.isImageFile(file)) {
        this.message.text("Opening Image Preview ...");
        this.imagePreview.attr("src", this.resolveImagePath(file));
        this.imagePreview.load((function(_this) {
          return function() {
            _this.message.text("");
            return _this.setImageContext();
          };
        })(this));
        this.imagePreview.error((function(_this) {
          return function() {
            _this.message.text("Error: Failed to Load Image.");
            return _this.imagePreview.attr("src", "");
          };
        })(this));
      } else {
        if (file) {
          this.message.text("Error: Invalid Image File.");
        }
        this.imagePreview.attr("src", "");
        this.widthEditor.setText("");
        this.heightEditor.setText("");
        this.alignEditor.setText("");
      }
      return this.imageOnPreview = file;
    };

    InsertImageView.prototype.setImageContext = function() {
      var naturalHeight, naturalWidth, position, _ref1;
      _ref1 = this.imagePreview.context, naturalWidth = _ref1.naturalWidth, naturalHeight = _ref1.naturalHeight;
      this.widthEditor.setText("" + naturalWidth);
      this.heightEditor.setText("" + naturalHeight);
      position = naturalWidth > 300 ? "center" : "right";
      return this.alignEditor.setText(position);
    };

    InsertImageView.prototype.insertImageTag = function() {
      var img, imgSource, text;
      imgSource = this.imageEditor.getText().trim();
      img = {
        rawSrc: imgSource,
        src: this.generateImageSrc(imgSource),
        relativeFileSrc: this.generateRelativeImageSrc(imgSource, this.currentFileDir()),
        relativeSiteSrc: this.generateRelativeImageSrc(imgSource, this.siteLocalDir()),
        alt: this.titleEditor.getText(),
        width: this.widthEditor.getText(),
        height: this.heightEditor.getText(),
        align: this.alignEditor.getText()
      };
      if (img.src) {
        text = templateHelper.create("imageTag", this.frontMatter, this.dateTime, img);
      } else {
        text = img.alt;
      }
      return this.editor.setTextInBufferRange(this.range, text);
    };

    InsertImageView.prototype.copyImage = function(file, callback) {
      var destFile, error;
      if (utils.isUrl(file) || !fs.existsSync(file)) {
        return callback();
      }
      try {
        destFile = path.join(this.siteLocalDir(), this.siteImagesDir(), path.basename(file));
        if (fs.existsSync(destFile)) {
          return atom.confirm({
            message: "File already exists!",
            detailedMessage: "Another file already exists at:\n" + destPath,
            buttons: ['OK']
          });
        } else {
          return fs.copy(file, destFile, (function(_this) {
            return function() {
              _this.imageEditor.setText(destFile);
              return callback();
            };
          })(this));
        }
      } catch (_error) {
        error = _error;
        return atom.confirm({
          message: "[Markdown Writer] Error!",
          detailedMessage: "Copy Image:\n" + error.message,
          buttons: ['OK']
        });
      }
    };

    InsertImageView.prototype.siteLocalDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    InsertImageView.prototype.siteImagesDir = function() {
      return templateHelper.create("siteImagesDir", this.frontMatter, this.dateTime);
    };

    InsertImageView.prototype.currentFileDir = function() {
      return path.dirname(this.editor.getPath() || "");
    };

    InsertImageView.prototype.isInSiteDir = function(file) {
      return file && file.startsWith(this.siteLocalDir());
    };

    InsertImageView.prototype.resolveImagePath = function(file) {
      var absolutePath;
      if (!file) {
        return "";
      }
      if (utils.isUrl(file) || fs.existsSync(file)) {
        return file;
      }
      absolutePath = path.join(this.siteLocalDir(), file);
      if (fs.existsSync(absolutePath)) {
        return absolutePath;
      }
      return file;
    };

    InsertImageView.prototype.generateImageSrc = function(file) {
      return utils.normalizeFilePath(this._generateImageSrc(file));
    };

    InsertImageView.prototype._generateImageSrc = function(file) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      if (config.get('relativeImagePath')) {
        return path.relative(this.currentFileDir(), file);
      }
      if (this.isInSiteDir(file)) {
        return path.relative(this.siteLocalDir(), file);
      }
      return path.join("/", this.siteImagesDir(), path.basename(file));
    };

    InsertImageView.prototype.generateRelativeImageSrc = function(file, basePath) {
      return utils.normalizeFilePath(this._generateRelativeImageSrc(file, basePath));
    };

    InsertImageView.prototype._generateRelativeImageSrc = function(file, basePath) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      return path.relative(basePath || "~", file);
    };

    return InsertImageView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL2luc2VydC1pbWFnZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwySEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBQSxDQUFELEVBQUksWUFBQSxJQUFKLEVBQVUsc0JBQUEsY0FBVixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FIVCxDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQUpULENBQUE7O0FBQUEsRUFNQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVIsQ0FOVCxDQUFBOztBQUFBLEVBT0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBUFIsQ0FBQTs7QUFBQSxFQVFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSLENBUmpCLENBQUE7O0FBQUEsRUFVQSxrQkFBQSxHQUFxQixJQVZyQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwRCxVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8s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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/views/insert-image-view.coffee
