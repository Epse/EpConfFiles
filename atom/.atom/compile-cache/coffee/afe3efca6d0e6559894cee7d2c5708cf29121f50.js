(function() {
  var $, CompositeDisposable, InsertImageView, TextEditorView, View, config, dialog, fs, lastInsertImageDir, path, remote, templateHelper, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

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
                "class": "side-label",
                outlet: "copyImageMessage"
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
          var file;
          file = _this.imageEditor.getText().trim();
          _this.updateImageSource(file);
          return _this.updateCopyImageDest(file);
        };
      })(this));
      this.titleEditor.on("blur", (function(_this) {
        return function() {
          return _this.updateCopyImageDest(_this.imageEditor.getText().trim());
        };
      })(this));
      this.openImageButton.on("click", (function(_this) {
        return function() {
          return _this.openImageDialog();
        };
      })(this));
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
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((_ref1 = this.previouslyFocusedElement) != null) {
          _ref1.focus();
        }
      }
      return InsertImageView.__super__.detach.apply(this, arguments);
    };

    InsertImageView.prototype.detached = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.disposables = null;
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

    InsertImageView.prototype.updateCopyImageDest = function(file) {
      var destFile;
      if (!file) {
        return;
      }
      destFile = this.copyImageDestPath(file, this.titleEditor.getText());
      return this.copyImageMessage.text("Copy Image to " + destFile);
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
      var confirmation, destFile, error, performWrite;
      if (utils.isUrl(file) || !fs.existsSync(file)) {
        return callback();
      }
      try {
        destFile = this.copyImageDestPath(file, this.titleEditor.getText());
        performWrite = true;
        if (fs.existsSync(destFile)) {
          confirmation = atom.confirm({
            message: "File already exists!",
            detailedMessage: "Another file already exists at:\n" + destFile + "\nDo you want to overwrite it?",
            buttons: ["No", "Yes"]
          });
          performWrite = confirmation === 1;
        }
        if (performWrite) {
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

    InsertImageView.prototype.copyImageDestPath = function(file, title) {
      var extension, filename;
      filename = path.basename(file);
      if (config.get("renameImageOnCopy") && title) {
        extension = path.extname(file);
        title = utils.slugize(title, config.get('slugSeparator'));
        filename = "" + title + extension;
      }
      return path.join(this.siteLocalDir(), this.siteImagesDir(), filename);
    };

    InsertImageView.prototype.resolveImagePath = function(file) {
      var absolutePath, relativePath;
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
      relativePath = path.join(this.currentFileDir(), file);
      if (fs.existsSync(relativePath)) {
        return relativePath;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvaW5zZXJ0LWltYWdlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdKQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixFQUFVLHNCQUFBLGNBRFYsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBSlQsQ0FBQTs7QUFBQSxFQUtBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLFFBQWYsQ0FMVCxDQUFBOztBQUFBLEVBT0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSLENBUFQsQ0FBQTs7QUFBQSxFQVFBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQVJSLENBQUE7O0FBQUEsRUFTQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUixDQVRqQixDQUFBOztBQUFBLEVBV0Esa0JBQUEsR0FBcUIsSUFYckIsQ0FBQTs7QUFBQSxFQWFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3Q0FBUDtPQUFMLEVBQXNE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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/views/insert-image-view.coffee
