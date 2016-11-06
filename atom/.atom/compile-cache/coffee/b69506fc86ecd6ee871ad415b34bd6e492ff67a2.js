(function() {
  var InsertImageView, config;

  config = require("../../lib/config");

  InsertImageView = require("../../lib/views/insert-image-view");

  describe("InsertImageView", function() {
    var editor, insertImageView, _ref;
    _ref = [], editor = _ref[0], insertImageView = _ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return insertImageView = new InsertImageView({});
      });
    });
    describe(".isInSiteDir", function() {
      beforeEach(function() {
        return atom.config.set("markdown-writer.siteLocalDir", editor.getPath().replace("empty.markdown", ""));
      });
      it("check a file is in site local dir", function() {
        var fixture;
        fixture = "" + (config.get("siteLocalDir")) + "/image.jpg";
        return expect(insertImageView.isInSiteDir(fixture)).toBe(true);
      });
      return it("check a file is not in site local dir", function() {
        var fixture;
        fixture = 'some/random/path/image.jpg';
        return expect(insertImageView.isInSiteDir(fixture)).toBe(false);
      });
    });
    describe(".resolveImagePath", function() {
      it("return empty image path", function() {
        var fixture;
        fixture = "";
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      it("return URL image path", function() {
        var fixture;
        fixture = "https://assets-cdn.github.com/images/icons/emoji/octocat.png";
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      it("return relative image path", function() {
        var fixture;
        insertImageView.editor = editor;
        fixture = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      return it("return absolute image path", function() {
        var expected, fixture;
        insertImageView.editor = editor;
        atom.config.set("markdown-writer.siteLocalDir", editor.getPath().replace("empty.markdown", ""));
        fixture = "octocat.png";
        expected = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.resolveImagePath(fixture)).toBe(expected);
      });
    });
    describe(".copyImageDestPath", function() {
      it("return the local path with original filename", function() {
        var fixture;
        atom.config.set("markdown-writer.renameImageOnCopy", false);
        fixture = "images/icons/emoji/octocat.png";
        return expect(insertImageView.copyImageDestPath(fixture, "name")).toMatch(/[\/\\]octocat\.png/);
      });
      return it("return the local path with new filename", function() {
        var fixture;
        atom.config.set("markdown-writer.renameImageOnCopy", true);
        fixture = "images/icons/emoji/octocat.png";
        expect(insertImageView.copyImageDestPath(fixture, "New name")).toMatch(/[\/\\]new-name\.png/);
        fixture = "images/icons/emoji/octocat";
        expect(insertImageView.copyImageDestPath(fixture, "New name")).toMatch(/[\/\\]new-name/);
        fixture = "images/icons/emoji/octocat.png";
        return expect(insertImageView.copyImageDestPath(fixture, "")).toMatch(/[\/\\]octocat.png/);
      });
    });
    return describe(".generateImageSrc", function() {
      it("return empty image path", function() {
        var fixture;
        fixture = "";
        return expect(insertImageView.generateImageSrc(fixture)).toBe(fixture);
      });
      it("return URL image path", function() {
        var fixture;
        fixture = "https://assets-cdn.github.com/images/icons/emoji/octocat.png";
        return expect(insertImageView.generateImageSrc(fixture)).toBe(fixture);
      });
      it("return relative image path from file", function() {
        var fixture;
        insertImageView.editor = editor;
        atom.config.set("markdown-writer.relativeImagePath", true);
        fixture = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.generateImageSrc(fixture)).toBe("octocat.png");
      });
      it("return relative image path from site", function() {
        var fixture;
        atom.config.set("markdown-writer.siteLocalDir", "/assets/images/icons/emoji");
        fixture = "/assets/images/icons/emoji/octocat.png";
        return expect(insertImageView.generateImageSrc(fixture)).toBe("octocat.png");
      });
      return it("return image dir path using config template", function() {
        var expected, fixture;
        insertImageView.display();
        fixture = "octocat.png";
        expected = /^\/images\/\d{4}\/\d\d\/octocat\.png$/;
        return expect(insertImageView.generateImageSrc(fixture)).toMatch(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL3ZpZXdzL2luc2VydC1pbWFnZS12aWV3LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUixDQUFULENBQUE7O0FBQUEsRUFDQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxtQ0FBUixDQURsQixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLDZCQUFBO0FBQUEsSUFBQSxPQUE0QixFQUE1QixFQUFDLGdCQUFELEVBQVMseUJBQVQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsZ0JBQXBCLEVBQUg7TUFBQSxDQUFoQixDQUFBLENBQUE7YUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtlQUNBLGVBQUEsR0FBc0IsSUFBQSxlQUFBLENBQWdCLEVBQWhCLEVBRm5CO01BQUEsQ0FBTCxFQUhTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVNBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLEVBQWdELE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixnQkFBekIs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/views/insert-image-view-spec.coffee
