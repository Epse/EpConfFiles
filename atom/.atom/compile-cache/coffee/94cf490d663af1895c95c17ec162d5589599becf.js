(function() {
  var PublishDraft, path, pathSep;

  path = require("path");

  PublishDraft = require("../../lib/commands/publish-draft");

  pathSep = "[/\\\\]";

  describe("PublishDraft", function() {
    var editor, publishDraft, _ref;
    _ref = [], editor = _ref[0], publishDraft = _ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe(".trigger", function() {
      return it("abort publish draft when not confirm publish", function() {
        publishDraft = new PublishDraft({});
        publishDraft.confirmPublish = function() {
          return {};
        };
        publishDraft.trigger();
        expect(publishDraft.draftPath).toMatch(RegExp("" + pathSep + "fixtures" + pathSep + "empty\\.markdown$"));
        return expect(publishDraft.postPath).toMatch(RegExp("" + pathSep + "\\d{4}" + pathSep + "\\d{4}-\\d\\d-\\d\\d-empty\\.markdown$"));
      });
    });
    describe(".getSlug", function() {
      it("get title from front matter by config", function() {
        atom.config.set("markdown-writer.publishRenameBasedOnTitle", true);
        editor.setText("---\ntitle: Markdown Writer\n---");
        publishDraft = new PublishDraft({});
        return expect(publishDraft.getSlug()).toBe("markdown-writer");
      });
      it("get title from front matter if no draft path", function() {
        editor.setText("---\ntitle: Markdown Writer (New Post)\n---");
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = void 0;
        return expect(publishDraft.getSlug()).toBe("markdown-writer-new-post");
      });
      it("get title from draft path", function() {
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = path.join("test", "name-of-post.md");
        return expect(publishDraft.getSlug()).toBe("name-of-post");
      });
      return it("get new-post when no front matter/draft path", function() {
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = void 0;
        return expect(publishDraft.getSlug()).toBe("new-post");
      });
    });
    return describe(".getExtension", function() {
      beforeEach(function() {
        return publishDraft = new PublishDraft({});
      });
      it("get draft path extname by config", function() {
        atom.config.set("markdown-writer.publishKeepFileExtname", true);
        publishDraft.draftPath = path.join("test", "name.md");
        return expect(publishDraft.getExtension()).toBe(".md");
      });
      return it("get default extname", function() {
        publishDraft.draftPath = path.join("test", "name.md");
        return expect(publishDraft.getExtension()).toBe(".markdown");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy9jb21tYW5kcy9wdWJsaXNoLWRyYWZ0LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0NBQVIsQ0FEZixDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLFNBSFYsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLDBCQUFBO0FBQUEsSUFBQSxPQUF5QixFQUF6QixFQUFDLGdCQUFELEVBQVMsc0JBQVQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsZ0JBQXBCLEVBQUg7TUFBQSxDQUFoQixDQUFBLENBQUE7YUFDQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxFQUFaO01BQUEsQ0FBTCxFQUZTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQU1BLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTthQUNuQixFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELFFBQUEsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBYSxFQUFiLENBQW5CLENBQUE7QUFBQSxRQUNBLFlBQVksQ0FBQyxjQUFiLEdBQThCLFNBQUEsR0FBQTtpQkFBRyxHQUFIO1FBQUEsQ0FEOUIsQ0FBQTtBQUFBLFFBR0EsWUFBWSxD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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/commands/publish-draft-spec.coffee
