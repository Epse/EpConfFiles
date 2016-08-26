(function() {
  var $, FrontMatter, PublishDraft, config, fs, path, shell, templateHelper, utils;

  $ = require("atom-space-pen-views").$;

  fs = require("fs-plus");

  path = require("path");

  shell = require("shell");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  FrontMatter = require("../helpers/front-matter");

  module.exports = PublishDraft = (function() {
    function PublishDraft() {
      this.editor = atom.workspace.getActiveTextEditor();
      this.draftPath = this.editor.getPath();
      this.frontMatter = new FrontMatter(this.editor);
      this.dateTime = templateHelper.getDateTime();
    }

    PublishDraft.prototype.trigger = function(e) {
      this.updateFrontMatter();
      this.postPath = this.getPostPath();
      return this.confirmPublish((function(_this) {
        return function() {
          var error;
          try {
            _this.editor.saveAs(_this.postPath);
            if (_this.draftPath) {
              return shell.moveItemToTrash(_this.draftPath);
            }
          } catch (_error) {
            error = _error;
            return atom.confirm({
              message: "[Markdown Writer] Error!",
              detailedMessage: "Publish Draft:\n" + error.message,
              buttons: ['OK']
            });
          }
        };
      })(this));
    };

    PublishDraft.prototype.confirmPublish = function(callback) {
      if (fs.existsSync(this.postPath)) {
        return atom.confirm({
          message: "Do you want to overwrite file?",
          detailedMessage: "Another file already exists at:\n" + this.postPath,
          buttons: {
            "Confirm": callback,
            "Cancel": null
          }
        });
      } else if (this.draftPath === this.postPath) {
        return atom.confirm({
          message: "This file is published!",
          detailedMessage: "This file already published at:\n" + this.draftPath,
          buttons: ['OK']
        });
      } else {
        return callback();
      }
    };

    PublishDraft.prototype.updateFrontMatter = function() {
      if (this.frontMatter.isEmpty) {
        return;
      }
      this.frontMatter.setIfExists("published", true);
      this.frontMatter.setIfExists("date", templateHelper.getFrontMatterDate(this.dateTime));
      return this.frontMatter.save();
    };

    PublishDraft.prototype.getPostPath = function() {
      var fileName, frontMatter, localDir, postsDir;
      frontMatter = templateHelper.getFrontMatter(this);
      localDir = utils.getSitePath(config.get("siteLocalDir"));
      postsDir = templateHelper.create("sitePostsDir", frontMatter, this.dateTime);
      fileName = templateHelper.create("newPostFileName", frontMatter, this.dateTime);
      return path.join(localDir, postsDir, fileName);
    };

    PublishDraft.prototype.getLayout = function() {
      return this.frontMatter.get("layout");
    };

    PublishDraft.prototype.getPublished = function() {
      return this.frontMatter.get("published");
    };

    PublishDraft.prototype.getTitle = function() {
      return this.frontMatter.get("title");
    };

    PublishDraft.prototype.getSlug = function() {
      var slug, useFrontMatter;
      useFrontMatter = !this.draftPath || !!config.get("publishRenameBasedOnTitle");
      if (useFrontMatter) {
        slug = utils.slugize(this.frontMatter.get("title"), config.get('slugSeparator'));
      }
      return slug || templateHelper.getFileSlug(this.draftPath) || utils.slugize("New Post", config.get('slugSeparator'));
    };

    PublishDraft.prototype.getDate = function() {
      return templateHelper.getFrontMatterDate(this.dateTime);
    };

    PublishDraft.prototype.getExtension = function() {
      var extname, keepExtension;
      keepExtension = this.draftPath && !!config.get("publishKeepFileExtname");
      if (keepExtension) {
        extname = path.extname(this.draftPath);
      }
      return extname || config.get("fileExtension");
    };

    return PublishDraft;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbW1hbmRzL3B1Ymxpc2gtZHJhZnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQUhSLENBQUE7O0FBQUEsRUFLQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVIsQ0FMVCxDQUFBOztBQUFBLEVBTUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBTlIsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSLENBUGpCLENBQUE7O0FBQUEsRUFRQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHlCQUFSLENBUmQsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHNCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQURiLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsV0FBQSxDQUFZLElBQUMsQ0FBQSxNQUFiLENBRm5CLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksY0FBYyxDQUFDLFdBQWYsQ0FBQSxDQUhaLENBRFc7SUFBQSxDQUFiOztBQUFBLDJCQU1BLE9BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FGWixDQUFBO2FBR0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNkLGNBQUEsS0FBQTtBQUFBO0FBQ0UsWUFBQSxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxLQUFDLENBQUEsUUFBaEIsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFxQyxLQUFDLENBQUEsU0FBdEM7cUJBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsS0FBQyxDQUFBLFNBQXZCLEVBQUE7YUFGRjtXQUFBLGNBQUE7QUFJRSxZQURJLGNBQ0osQ0FBQTttQkFBQSxJQUFJLENBQUMsT0FBTCxDQUNFO0FBQUEsY0FBQSxPQUFBLEVBQVMsMEJBQVQ7QUFBQSxjQUNBLGVBQUEsRUFBa0Isa0JBQUEsR0FBa0IsS0FBSyxDQUFDLE9BRDFDO0FBQUEsY0FFQSxPQUFBLEVBQVMsQ0FBQyxJQUFELENBRlQ7YUFERixFQUpGO1dBRGM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixFQUpPO0lBQUEsQ0FOVCxDQUFBOztBQUFBLDJCQW9CQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxHQUFBO0FBQ2QsTUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBSDtlQUNFLElBQUksQ0FBQyxPQUFMLENBQ0U7QUFBQSxVQUFBLE9BQUEsRUFBUyxnQ0FBVDtBQUFBLFVBQ0EsZUFBQSxFQUFrQixtQ0FBQSxHQUFtQyxJQUFDLENBQUEsUUFEdEQ7QUFBQSxVQUVBLE9BQUEsRUFDRTtBQUFBLFlBQUEsU0FBQSxFQUFXLFFBQVg7QUFBQSxZQUNBLFFBQUEsRUFBVSxJQURWO1dBSEY7U0FERixFQURGO09BQUEsTUFPSyxJQUFHLElBQUMsQ0FBQSxTQUFELEtBQWMsSUFBQyxDQUFBLFFBQWxCO2VBQ0gsSUFBSSxDQUFDLE9BQUwsQ0FDRTtBQUFBLFVBQUEsT0FBQSxFQUFTLHlCQUFUO0FBQUEsVUFDQSxlQUFBLEVBQWtCLG1DQUFBLEdBQW1DLElBQUMsQ0FBQSxTQUR0RDtBQUFBLFVBRUEsT0FBQSxFQUFTLENBQUMsSUFBRCxDQUZUO1NBREYsRUFERztPQUFBLE1BQUE7ZUFLQSxRQUFBLENBQUEsRUFMQTtPQVJTO0lBQUEsQ0FwQmhCLENBQUE7O0FBQUEsMkJBbUNBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLElBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUF2QjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsV0FBekIsRUFBc0MsSUFBdEMsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsTUFBekIsRUFBaUMsY0FBYyxDQUFDLGtCQUFmLENBQWtDLElBQUMsQ0FBQSxRQUFuQyxDQUFqQyxDQUhBLENBQUE7YUFLQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQSxFQU5pQjtJQUFBLENBbkNuQixDQUFBOztBQUFBLDJCQTJDQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSx5Q0FBQTtBQUFBLE1BQUEsV0FBQSxHQUFhLGNBQWMsQ0FBQyxjQUFmLENBQThCLElBQTlCLENBQWIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxXQUFOLENBQWtCLE1BQU0sQ0FBQyxHQUFQLENBQVcsY0FBWCxDQUFsQixDQUZYLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxjQUFjLENBQUMsTUFBZixDQUFzQixjQUF0QixFQUFzQyxXQUF0QyxFQUFtRCxJQUFDLENBQUEsUUFBcEQsQ0FIWCxDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsaUJBQXRCLEVBQXlDLFdBQXpDLEVBQXNELElBQUMsQ0FBQSxRQUF2RCxDQUpYLENBQUE7YUFNQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsUUFBcEIsRUFBOEIsUUFBOUIsRUFQVztJQUFBLENBM0NiLENBQUE7O0FBQUEsMkJBcURBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsUUFBakIsRUFBSDtJQUFBLENBckRYLENBQUE7O0FBQUEsMkJBc0RBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsV0FBakIsRUFBSDtJQUFBLENBdERkLENBQUE7O0FBQUEsMkJBdURBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsT0FBakIsRUFBSDtJQUFBLENBdkRWLENBQUE7O0FBQUEsMkJBd0RBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFHUCxVQUFBLG9CQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLENBQUEsSUFBRSxDQUFBLFNBQUYsSUFBZSxDQUFBLENBQUMsTUFBTyxDQUFDLEdBQVAsQ0FBVywyQkFBWCxDQUFsQyxDQUFBO0FBQ0EsTUFBQSxJQUFnRixjQUFoRjtBQUFBLFFBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLE9BQWpCLENBQWQsRUFBeUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxlQUFYLENBQXpDLENBQVAsQ0FBQTtPQURBO2FBRUEsSUFBQSxJQUFRLGNBQWMsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxTQUE1QixDQUFSLElBQWtELEtBQUssQ0FBQyxPQUFOLENBQWMsVUFBZCxFQUEwQixNQUFNLENBQUMsR0FBUCxDQUFXLGVBQVgsQ0FBMUIsRUFMM0M7SUFBQSxDQXhEVCxDQUFBOztBQUFBLDJCQThEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQUcsY0FBYyxDQUFDLGtCQUFmLENBQWtDLElBQUMsQ0FBQSxRQUFuQyxFQUFIO0lBQUEsQ0E5RFQsQ0FBQTs7QUFBQSwyQkErREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUVaLFVBQUEsc0JBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQUQsSUFBYyxDQUFBLENBQUMsTUFBTyxDQUFDLEdBQVAsQ0FBVyx3QkFBWCxDQUFoQyxDQUFBO0FBQ0EsTUFBQSxJQUFzQyxhQUF0QztBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLFNBQWQsQ0FBVixDQUFBO09BREE7YUFFQSxPQUFBLElBQVcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxlQUFYLEVBSkM7SUFBQSxDQS9EZCxDQUFBOzt3QkFBQTs7TUFaRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/commands/publish-draft.coffee
