(function() {
  var pkg;

  pkg = require("../package");

  describe("MarkdownWriter", function() {
    var activationPromise, ditor, editorView, workspaceView, _ref;
    _ref = [], workspaceView = _ref[0], ditor = _ref[1], editorView = _ref[2], activationPromise = _ref[3];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("test");
      });
      return runs(function() {
        var editor;
        workspaceView = atom.views.getView(atom.workspace);
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage("markdown-writer");
      });
    });
    pkg.activationCommands["atom-workspace"].forEach(function(cmd) {
      return it("registered workspace commands " + cmd, function() {
        atom.config.set("markdown-writer._skipAction", true);
        atom.commands.dispatch(workspaceView, cmd);
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return expect(true).toBe(true);
        });
      });
    });
    return pkg.activationCommands["atom-text-editor"].forEach(function(cmd) {
      return it("registered editor commands " + cmd, function() {
        atom.config.set("markdown-writer._skipAction", true);
        atom.commands.dispatch(editorView, cmd);
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return expect(true).toBe(true);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy9tYXJrZG93bi13cml0ZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsR0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsWUFBUixDQUFOLENBQUE7O0FBQUEsRUFPQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEseURBQUE7QUFBQSxJQUFBLE9BQXdELEVBQXhELEVBQUMsdUJBQUQsRUFBZ0IsZUFBaEIsRUFBdUIsb0JBQXZCLEVBQW1DLDJCQUFuQyxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixNQUFwQixFQUFIO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsTUFBQTtBQUFBLFFBQUEsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQWhCLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FEVCxDQUFBO0FBQUEsUUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBRmIsQ0FBQTtlQUdBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUIsRUFKakI7TUFBQSxDQUFMLEVBRlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBY0EsR0FBRyxDQUFDLGtCQUFtQixDQUFBLGdCQUFBLENBQWlCLENBQUMsT0FBekMsQ0FBaUQsU0FBQyxHQUFELEdBQUE7YUFDL0MsRUFBQSxDQUFJLGdDQUFBLEdBQWdDLEdBQXBDLEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsSUFBL0MsQ0FBQSxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsYUFBdkIsRUFBc0MsR0FBdEMsQ0FGQSxDQUFBO0FBQUEsUUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFBRyxrQkFBSDtRQUFBLENBQWhCLENBSkEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7aUJBQUcsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsSUFBbEIsRUFBSDtRQUFBLENBQUwsRUFOeUM7TUFBQSxDQUEzQyxFQUQrQztJQUFBLENBQWpELENBZEEsQ0FBQTtXQXVCQSxHQUFHLENBQUMsa0JBQW1CLENBQUEsa0JBQUEsQ0FBbUIsQ0FBQyxPQUEzQyxDQUFtRCxTQUFDLEdBQUQsR0FBQTthQUNqRCxFQUFBLENBQUksNkJBQUEsR0FBNkIsR0FBakMsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixFQUErQyxJQUEvQyxDQUFBLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixVQUF2QixFQUFtQyxHQUFuQyxDQUZBLENBQUE7QUFBQSxRQUlBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUFHLGtCQUFIO1FBQUEsQ0FBaEIsQ0FKQSxDQUFBO2VBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFBRyxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsSUFBYixDQUFrQixJQUFsQixFQUFIO1FBQUEsQ0FBTCxFQU5zQztNQUFBLENBQXhDLEVBRGlEO0lBQUEsQ0FBbkQsRUF4QnlCO0VBQUEsQ0FBM0IsQ0FQQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/markdown-writer-spec.coffee
