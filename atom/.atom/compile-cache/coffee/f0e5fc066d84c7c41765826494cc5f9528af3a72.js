(function() {
  var $, CompositeDisposable, InsertImageView, TextEditorView, View, config, dialog, fs, lastInsertImageDir, path, ref, remote, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  remote = require("remote");

  dialog = remote.dialog || remote.require("dialog");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  lastInsertImageDir = null;

  module.exports = InsertImageView = (function(superClass) {
    extend(InsertImageView, superClass);

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
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertImageView.__super__.detach.apply(this, arguments);
    };

    InsertImageView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
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
      var naturalHeight, naturalWidth, position, ref1;
      ref1 = this.imagePreview.context, naturalWidth = ref1.naturalWidth, naturalHeight = ref1.naturalHeight;
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
      } catch (error1) {
        error = error1;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvdmlld3MvaW5zZXJ0LWltYWdlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrSUFBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxlQUFKLEVBQVU7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLElBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZjs7RUFFMUIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFakIsa0JBQUEsR0FBcUI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3Q0FBUDtPQUFMLEVBQXNELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwRCxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUI7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlCQUFQO1dBQXZCO1VBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO1lBQ0gsS0FBQyxDQUFBLEtBQUQsQ0FBTyxrQkFBUCxFQUEyQjtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDthQUEzQjtZQUNBLEtBQUMsQ0FB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Qjs7OztLQXZQQztBQWQ5QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcbnJlbW90ZSA9IHJlcXVpcmUgXCJyZW1vdGVcIlxuZGlhbG9nID0gcmVtb3RlLmRpYWxvZyB8fCByZW1vdGUucmVxdWlyZSBcImRpYWxvZ1wiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWdcIlxudXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxudGVtcGxhdGVIZWxwZXIgPSByZXF1aXJlIFwiLi4vaGVscGVycy90ZW1wbGF0ZS1oZWxwZXJcIlxuXG5sYXN0SW5zZXJ0SW1hZ2VEaXIgPSBudWxsICMgcmVtZW1iZXIgbGFzdCBpbnNlcnRlZCBpbWFnZSBkaXJlY3RvcnlcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5zZXJ0SW1hZ2VWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiBcIm1hcmtkb3duLXdyaXRlciBtYXJrZG93bi13cml0ZXItZGlhbG9nXCIsID0+XG4gICAgICBAbGFiZWwgXCJJbnNlcnQgSW1hZ2VcIiwgY2xhc3M6IFwiaWNvbiBpY29uLWRldmljZS1jYW1lcmFcIlxuICAgICAgQGRpdiA9PlxuICAgICAgICBAbGFiZWwgXCJJbWFnZSBQYXRoIChzcmMpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcImltYWdlRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImRpYWxvZy1yb3dcIiwgPT5cbiAgICAgICAgICBAYnV0dG9uIFwiQ2hvb3NlIExvY2FsIEltYWdlXCIsIG91dGxldDogXCJvcGVuSW1hZ2VCdXR0b25cIiwgY2xhc3M6IFwiYnRuXCJcbiAgICAgICAgICBAbGFiZWwgb3V0bGV0OiBcIm1lc3NhZ2VcIiwgY2xhc3M6IFwic2lkZS1sYWJlbFwiXG4gICAgICAgIEBsYWJlbCBcIlRpdGxlIChhbHQpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcInRpdGxlRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0xXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiV2lkdGggKHB4KVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgICBAc3VidmlldyBcIndpZHRoRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0xXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiSGVpZ2h0IChweClcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJoZWlnaHRFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLTJcIiwgPT5cbiAgICAgICAgICBAbGFiZWwgXCJBbGlnbm1lbnRcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJhbGlnbkVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBkaXYgb3V0bGV0OiBcImNvcHlJbWFnZVBhbmVsXCIsIGNsYXNzOiBcImhpZGRlbiBkaWFsb2ctcm93XCIsID0+XG4gICAgICAgIEBsYWJlbCBmb3I6IFwibWFya2Rvd24td3JpdGVyLWNvcHktaW1hZ2UtY2hlY2tib3hcIiwgPT5cbiAgICAgICAgICBAaW5wdXQgaWQ6IFwibWFya2Rvd24td3JpdGVyLWNvcHktaW1hZ2UtY2hlY2tib3hcIixcbiAgICAgICAgICAgIHR5cGU6XCJjaGVja2JveFwiLCBvdXRsZXQ6IFwiY29weUltYWdlQ2hlY2tib3hcIlxuICAgICAgICAgIEBzcGFuIFwiQ29weSBJbWFnZSB0byBTaXRlIEltYWdlIERpcmVjdG9yeVwiLCBjbGFzczogXCJzaWRlLWxhYmVsXCIsIG91dGxldDogXCJjb3B5SW1hZ2VNZXNzYWdlXCJcbiAgICAgIEBkaXYgY2xhc3M6IFwiaW1hZ2UtY29udGFpbmVyXCIsID0+XG4gICAgICAgIEBpbWcgb3V0bGV0OiAnaW1hZ2VQcmV2aWV3J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgdXRpbHMuc2V0VGFiSW5kZXgoW0BpbWFnZUVkaXRvciwgQG9wZW5JbWFnZUJ1dHRvbiwgQHRpdGxlRWRpdG9yLFxuICAgICAgQHdpZHRoRWRpdG9yLCBAaGVpZ2h0RWRpdG9yLCBAYWxpZ25FZGl0b3IsIEBjb3B5SW1hZ2VDaGVja2JveF0pXG5cbiAgICBAaW1hZ2VFZGl0b3Iub24gXCJibHVyXCIsID0+XG4gICAgICBmaWxlID0gQGltYWdlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICAgIEB1cGRhdGVJbWFnZVNvdXJjZShmaWxlKVxuICAgICAgQHVwZGF0ZUNvcHlJbWFnZURlc3QoZmlsZSlcbiAgICBAdGl0bGVFZGl0b3Iub24gXCJibHVyXCIsID0+XG4gICAgICBAdXBkYXRlQ29weUltYWdlRGVzdChAaW1hZ2VFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKSlcbiAgICBAb3BlbkltYWdlQnV0dG9uLm9uIFwiY2xpY2tcIiwgPT4gQG9wZW5JbWFnZURpYWxvZygpXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIEBlbGVtZW50LCB7XG4gICAgICAgIFwiY29yZTpjb25maXJtXCI6ID0+IEBvbkNvbmZpcm0oKSxcbiAgICAgICAgXCJjb3JlOmNhbmNlbFwiOiAgPT4gQGRldGFjaCgpXG4gICAgICB9KSlcblxuICBvbkNvbmZpcm06IC0+XG4gICAgaW1nU291cmNlID0gQGltYWdlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICByZXR1cm4gdW5sZXNzIGltZ1NvdXJjZVxuXG4gICAgY2FsbGJhY2sgPSA9PlxuICAgICAgQGluc2VydEltYWdlVGFnKClcbiAgICAgIEBkZXRhY2goKVxuXG4gICAgaWYgIUBjb3B5SW1hZ2VDaGVja2JveC5oYXNDbGFzcygnaGlkZGVuJykgJiYgQGNvcHlJbWFnZUNoZWNrYm94LnByb3AoXCJjaGVja2VkXCIpXG4gICAgICBAY29weUltYWdlKEByZXNvbHZlSW1hZ2VQYXRoKGltZ1NvdXJjZSksIGNhbGxiYWNrKVxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKClcblxuICBkaXNwbGF5OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuICAgIEBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgQGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBmcm9udE1hdHRlciA9IHRlbXBsYXRlSGVscGVyLmdldEVkaXRvcihAZWRpdG9yKVxuICAgIEBkYXRlVGltZSA9IHRlbXBsYXRlSGVscGVyLmdldERhdGVUaW1lKClcbiAgICBAc2V0RmllbGRzRnJvbVNlbGVjdGlvbigpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBpbWFnZUVkaXRvci5mb2N1cygpXG5cbiAgZGV0YWNoOiAtPlxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudD8uZm9jdXMoKVxuICAgIHN1cGVyXG5cbiAgZGV0YWNoZWQ6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBudWxsXG5cbiAgc2V0RmllbGRzRnJvbVNlbGVjdGlvbjogLT5cbiAgICBAcmFuZ2UgPSB1dGlscy5nZXRUZXh0QnVmZmVyUmFuZ2UoQGVkaXRvciwgXCJsaW5rXCIpXG4gICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRUZXh0SW5SYW5nZShAcmFuZ2UpXG4gICAgcmV0dXJuIHVubGVzcyBzZWxlY3Rpb25cblxuICAgIGlmIHV0aWxzLmlzSW1hZ2Uoc2VsZWN0aW9uKVxuICAgICAgaW1nID0gdXRpbHMucGFyc2VJbWFnZShzZWxlY3Rpb24pXG4gICAgZWxzZSBpZiB1dGlscy5pc0ltYWdlVGFnKHNlbGVjdGlvbilcbiAgICAgIGltZyA9IHV0aWxzLnBhcnNlSW1hZ2VUYWcoc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGltZyA9IHsgYWx0OiBzZWxlY3Rpb24gfVxuXG4gICAgQHRpdGxlRWRpdG9yLnNldFRleHQoaW1nLmFsdCB8fCBcIlwiKVxuICAgIEB3aWR0aEVkaXRvci5zZXRUZXh0KGltZy53aWR0aCB8fCBcIlwiKVxuICAgIEBoZWlnaHRFZGl0b3Iuc2V0VGV4dChpbWcuaGVpZ2h0IHx8IFwiXCIpXG4gICAgQGltYWdlRWRpdG9yLnNldFRleHQoaW1nLnNyYyB8fCBcIlwiKVxuXG4gICAgQHVwZGF0ZUltYWdlU291cmNlKGltZy5zcmMpXG5cbiAgb3BlbkltYWdlRGlhbG9nOiAtPlxuICAgIGZpbGVzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ11cbiAgICAgIGRlZmF1bHRQYXRoOiBsYXN0SW5zZXJ0SW1hZ2VEaXIgfHwgQHNpdGVMb2NhbERpcigpXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlcyAmJiBmaWxlcy5sZW5ndGggPiAwXG5cbiAgICBAaW1hZ2VFZGl0b3Iuc2V0VGV4dChmaWxlc1swXSlcbiAgICBAdXBkYXRlSW1hZ2VTb3VyY2UoZmlsZXNbMF0pXG5cbiAgICBsYXN0SW5zZXJ0SW1hZ2VEaXIgPSBwYXRoLmRpcm5hbWUoZmlsZXNbMF0pIHVubGVzcyB1dGlscy5pc1VybChmaWxlc1swXSlcbiAgICBAdGl0bGVFZGl0b3IuZm9jdXMoKVxuXG4gIHVwZGF0ZUltYWdlU291cmNlOiAoZmlsZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGZpbGVcbiAgICBAZGlzcGxheUltYWdlUHJldmlldyhmaWxlKVxuXG4gICAgaWYgdXRpbHMuaXNVcmwoZmlsZSkgfHwgQGlzSW5TaXRlRGlyKEByZXNvbHZlSW1hZ2VQYXRoKGZpbGUpKVxuICAgICAgQGNvcHlJbWFnZVBhbmVsLmFkZENsYXNzKFwiaGlkZGVuXCIpXG4gICAgZWxzZVxuICAgICAgQGNvcHlJbWFnZVBhbmVsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpXG5cbiAgdXBkYXRlQ29weUltYWdlRGVzdDogKGZpbGUpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBmaWxlXG4gICAgZGVzdEZpbGUgPSBAY29weUltYWdlRGVzdFBhdGgoZmlsZSwgQHRpdGxlRWRpdG9yLmdldFRleHQoKSlcbiAgICBAY29weUltYWdlTWVzc2FnZS50ZXh0KFwiQ29weSBJbWFnZSB0byAje2Rlc3RGaWxlfVwiKVxuXG4gIGRpc3BsYXlJbWFnZVByZXZpZXc6IChmaWxlKSAtPlxuICAgIHJldHVybiBpZiBAaW1hZ2VPblByZXZpZXcgPT0gZmlsZVxuXG4gICAgaWYgdXRpbHMuaXNJbWFnZUZpbGUoZmlsZSlcbiAgICAgIEBtZXNzYWdlLnRleHQoXCJPcGVuaW5nIEltYWdlIFByZXZpZXcgLi4uXCIpXG4gICAgICBAaW1hZ2VQcmV2aWV3LmF0dHIoXCJzcmNcIiwgQHJlc29sdmVJbWFnZVBhdGgoZmlsZSkpXG4gICAgICBAaW1hZ2VQcmV2aWV3LmxvYWQgPT5cbiAgICAgICAgQG1lc3NhZ2UudGV4dChcIlwiKVxuICAgICAgICBAc2V0SW1hZ2VDb250ZXh0KClcbiAgICAgIEBpbWFnZVByZXZpZXcuZXJyb3IgPT5cbiAgICAgICAgQG1lc3NhZ2UudGV4dChcIkVycm9yOiBGYWlsZWQgdG8gTG9hZCBJbWFnZS5cIilcbiAgICAgICAgQGltYWdlUHJldmlldy5hdHRyKFwic3JjXCIsIFwiXCIpXG4gICAgZWxzZVxuICAgICAgQG1lc3NhZ2UudGV4dChcIkVycm9yOiBJbnZhbGlkIEltYWdlIEZpbGUuXCIpIGlmIGZpbGVcbiAgICAgIEBpbWFnZVByZXZpZXcuYXR0cihcInNyY1wiLCBcIlwiKVxuICAgICAgQHdpZHRoRWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgIEBoZWlnaHRFZGl0b3Iuc2V0VGV4dChcIlwiKVxuICAgICAgQGFsaWduRWRpdG9yLnNldFRleHQoXCJcIilcblxuICAgIEBpbWFnZU9uUHJldmlldyA9IGZpbGUgIyBjYWNoZSBwcmV2aWV3IGltYWdlIHNyY1xuXG4gIHNldEltYWdlQ29udGV4dDogLT5cbiAgICB7IG5hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodCB9ID0gQGltYWdlUHJldmlldy5jb250ZXh0XG4gICAgQHdpZHRoRWRpdG9yLnNldFRleHQoXCJcIiArIG5hdHVyYWxXaWR0aClcbiAgICBAaGVpZ2h0RWRpdG9yLnNldFRleHQoXCJcIiArIG5hdHVyYWxIZWlnaHQpXG5cbiAgICBwb3NpdGlvbiA9IGlmIG5hdHVyYWxXaWR0aCA+IDMwMCB0aGVuIFwiY2VudGVyXCIgZWxzZSBcInJpZ2h0XCJcbiAgICBAYWxpZ25FZGl0b3Iuc2V0VGV4dChwb3NpdGlvbilcblxuICBpbnNlcnRJbWFnZVRhZzogLT5cbiAgICBpbWdTb3VyY2UgPSBAaW1hZ2VFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuICAgIGltZyA9XG4gICAgICByYXdTcmM6IGltZ1NvdXJjZSxcbiAgICAgIHNyYzogQGdlbmVyYXRlSW1hZ2VTcmMoaW1nU291cmNlKVxuICAgICAgcmVsYXRpdmVGaWxlU3JjOiBAZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjKGltZ1NvdXJjZSwgQGN1cnJlbnRGaWxlRGlyKCkpXG4gICAgICByZWxhdGl2ZVNpdGVTcmM6IEBnZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmMoaW1nU291cmNlLCBAc2l0ZUxvY2FsRGlyKCkpXG4gICAgICBhbHQ6IEB0aXRsZUVkaXRvci5nZXRUZXh0KClcbiAgICAgIHdpZHRoOiBAd2lkdGhFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBoZWlnaHQ6IEBoZWlnaHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBhbGlnbjogQGFsaWduRWRpdG9yLmdldFRleHQoKVxuXG4gICAgIyBpbnNlcnQgaW1hZ2UgdGFnIHdoZW4gaW1nLnNyYyBleGlzdHMsIG90aGVyd2lzZSBjb25zaWRlciB0aGUgaW1hZ2Ugd2FzIHJlbW92ZWRcbiAgICBpZiBpbWcuc3JjXG4gICAgICB0ZXh0ID0gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwiaW1hZ2VUYWdcIiwgQGZyb250TWF0dGVyLCBAZGF0ZVRpbWUsIGltZylcbiAgICBlbHNlXG4gICAgICB0ZXh0ID0gaW1nLmFsdFxuXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShAcmFuZ2UsIHRleHQpXG5cbiAgY29weUltYWdlOiAoZmlsZSwgY2FsbGJhY2spIC0+XG4gICAgcmV0dXJuIGNhbGxiYWNrKCkgaWYgdXRpbHMuaXNVcmwoZmlsZSkgfHwgIWZzLmV4aXN0c1N5bmMoZmlsZSlcblxuICAgIHRyeVxuICAgICAgZGVzdEZpbGUgPSBAY29weUltYWdlRGVzdFBhdGgoZmlsZSwgQHRpdGxlRWRpdG9yLmdldFRleHQoKSlcbiAgICAgIHBlcmZvcm1Xcml0ZSA9IHRydWVcblxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhkZXN0RmlsZSlcbiAgICAgICAgY29uZmlybWF0aW9uID0gYXRvbS5jb25maXJtXG4gICAgICAgICAgbWVzc2FnZTogXCJGaWxlIGFscmVhZHkgZXhpc3RzIVwiXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIkFub3RoZXIgZmlsZSBhbHJlYWR5IGV4aXN0cyBhdDpcXG4je2Rlc3RGaWxlfVxcbkRvIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSBpdD9cIlxuICAgICAgICAgIGJ1dHRvbnM6IFtcIk5vXCIsIFwiWWVzXCJdXG4gICAgICAgIHBlcmZvcm1Xcml0ZSA9IChjb25maXJtYXRpb24gPT0gMSlcblxuICAgICAgaWYgcGVyZm9ybVdyaXRlXG4gICAgICAgIGZzLmNvcHkgZmlsZSwgZGVzdEZpbGUsID0+XG4gICAgICAgICAgQGltYWdlRWRpdG9yLnNldFRleHQoZGVzdEZpbGUpXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgbWVzc2FnZTogXCJbTWFya2Rvd24gV3JpdGVyXSBFcnJvciFcIlxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiQ29weSBJbWFnZTpcXG4je2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgYnV0dG9uczogWydPSyddXG5cbiAgIyBnZXQgdXNlcidzIHNpdGUgbG9jYWwgZGlyZWN0b3J5XG4gIHNpdGVMb2NhbERpcjogLT4gdXRpbHMuZ2V0U2l0ZVBhdGgoY29uZmlnLmdldChcInNpdGVMb2NhbERpclwiKSlcblxuICAjIGdldCB1c2VyJ3Mgc2l0ZSBpbWFnZXMgZGlyZWN0b3J5XG4gIHNpdGVJbWFnZXNEaXI6IC0+IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcInNpdGVJbWFnZXNEaXJcIiwgQGZyb250TWF0dGVyLCBAZGF0ZVRpbWUpXG5cbiAgIyBnZXQgY3VycmVudCBvcGVuIGZpbGUgZGlyZWN0b3J5XG4gIGN1cnJlbnRGaWxlRGlyOiAtPiBwYXRoLmRpcm5hbWUoQGVkaXRvci5nZXRQYXRoKCkgfHwgXCJcIilcblxuICAjIGNoZWNrIHRoZSBmaWxlIGlzIGluIHRoZSBzaXRlIGRpcmVjdG9yeVxuICBpc0luU2l0ZURpcjogKGZpbGUpIC0+IGZpbGUgJiYgZmlsZS5zdGFydHNXaXRoKEBzaXRlTG9jYWxEaXIoKSlcblxuICAjIGdldCBjb3B5IGltYWdlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aFxuICBjb3B5SW1hZ2VEZXN0UGF0aDogKGZpbGUsIHRpdGxlKSAtPlxuICAgIGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKVxuXG4gICAgaWYgY29uZmlnLmdldChcInJlbmFtZUltYWdlT25Db3B5XCIpICYmIHRpdGxlXG4gICAgICBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSlcbiAgICAgIHRpdGxlID0gdXRpbHMuc2x1Z2l6ZSh0aXRsZSwgY29uZmlnLmdldCgnc2x1Z1NlcGFyYXRvcicpKVxuICAgICAgZmlsZW5hbWUgPSBcIiN7dGl0bGV9I3tleHRlbnNpb259XCJcblxuICAgIHBhdGguam9pbihAc2l0ZUxvY2FsRGlyKCksIEBzaXRlSW1hZ2VzRGlyKCksIGZpbGVuYW1lKVxuXG4gICMgdHJ5IHRvIHJlc29sdmUgZmlsZSB0byBhIHZhbGlkIHNyYyB0aGF0IGNvdWxkIGJlIGRpc3BsYXllZFxuICByZXNvbHZlSW1hZ2VQYXRoOiAoZmlsZSkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpIHx8IGZzLmV4aXN0c1N5bmMoZmlsZSlcbiAgICBhYnNvbHV0ZVBhdGggPSBwYXRoLmpvaW4oQHNpdGVMb2NhbERpcigpLCBmaWxlKVxuICAgIHJldHVybiBhYnNvbHV0ZVBhdGggaWYgZnMuZXhpc3RzU3luYyhhYnNvbHV0ZVBhdGgpXG4gICAgcmVsYXRpdmVQYXRoID0gcGF0aC5qb2luKEBjdXJyZW50RmlsZURpcigpLCBmaWxlKVxuICAgIHJldHVybiByZWxhdGl2ZVBhdGggaWYgZnMuZXhpc3RzU3luYyhyZWxhdGl2ZVBhdGgpXG4gICAgcmV0dXJuIGZpbGUgIyBmYWxsYmFjayB0byBub3QgcmVzb2x2ZVxuXG4gICMgZ2VuZXJhdGUgYSBzcmMgdGhhdCBpcyB1c2VkIGluIG1hcmtkb3duIGZpbGUgYmFzZWQgb24gdXNlciBjb25maWd1cmF0aW9uIG9yIGZpbGUgbG9jYXRpb25cbiAgZ2VuZXJhdGVJbWFnZVNyYzogKGZpbGUpIC0+XG4gICAgdXRpbHMubm9ybWFsaXplRmlsZVBhdGgoQF9nZW5lcmF0ZUltYWdlU3JjKGZpbGUpKVxuXG4gIF9nZW5lcmF0ZUltYWdlU3JjOiAoZmlsZSkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoQGN1cnJlbnRGaWxlRGlyKCksIGZpbGUpIGlmIGNvbmZpZy5nZXQoJ3JlbGF0aXZlSW1hZ2VQYXRoJylcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShAc2l0ZUxvY2FsRGlyKCksIGZpbGUpIGlmIEBpc0luU2l0ZURpcihmaWxlKVxuICAgIHJldHVybiBwYXRoLmpvaW4oXCIvXCIsIEBzaXRlSW1hZ2VzRGlyKCksIHBhdGguYmFzZW5hbWUoZmlsZSkpXG5cbiAgIyBnZW5lcmF0ZSBhIHJlbGF0aXZlIHNyYyBmcm9tIHRoZSBiYXNlIHBhdGggb3IgZnJvbSB1c2VyJ3MgaG9tZSBkaXJlY3RvcnlcbiAgZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjOiAoZmlsZSwgYmFzZVBhdGgpIC0+XG4gICAgdXRpbHMubm9ybWFsaXplRmlsZVBhdGgoQF9nZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmMoZmlsZSwgYmFzZVBhdGgpKVxuXG4gIF9nZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmM6IChmaWxlLCBiYXNlUGF0aCkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoYmFzZVBhdGggfHwgXCJ+XCIsIGZpbGUpXG4iXX0=
