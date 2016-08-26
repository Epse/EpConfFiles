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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy92aWV3cy9pbnNlcnQtaW1hZ2Utdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1QkFBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsZUFBQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FEbEIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSw2QkFBQTtBQUFBLElBQUEsT0FBNEIsRUFBNUIsRUFBQyxnQkFBRCxFQUFTLHlCQUFULENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGdCQUFwQixFQUFIO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBRUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7ZUFDQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQixFQUFoQixFQUZuQjtNQUFBLENBQUwsRUFIUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFTQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixFQUFnRCxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsZ0JBQXpCLEVBQTJDLEVBQTNDLENBQWhE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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/views/insert-image-view-spec.coffee
