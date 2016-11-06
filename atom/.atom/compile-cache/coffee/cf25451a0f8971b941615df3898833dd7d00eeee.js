(function() {
  var EditLine;

  EditLine = require("../../lib/commands/edit-line");

  describe("EditLine", function() {
    var editLine, editor, event, _ref;
    _ref = [], editor = _ref[0], editLine = _ref[1], event = _ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        event = {
          abortKeyBinding: function() {
            return {};
          }
        };
        return spyOn(event, "abortKeyBinding");
      });
    });
    describe("insertNewLine", function() {
      beforeEach(function() {
        return editLine = new EditLine("insert-new-line");
      });
      it("does not affect normal new line", function() {
        editor.setText("this is normal line");
        editor.setCursorBufferPosition([0, 4]);
        editLine.trigger(event);
        return expect(event.abortKeyBinding).toHaveBeenCalled();
      });
      it("continue if config inlineNewLineContinuation enabled", function() {
        atom.config.set("markdown-writer.inlineNewLineContinuation", true);
        editor.setText("- inline line");
        editor.setCursorBufferPosition([0, 8]);
        editLine.trigger();
        return expect(editor.getText()).toBe("- inline\n-  line");
      });
      it("continue after unordered list line", function() {
        editor.setText("- line");
        editor.setCursorBufferPosition([0, 6]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["- line", "- "].join("\n"));
      });
      it("continue after ordered task list line", function() {
        editor.setText("1. [ ] Epic Tasks\n  1. [X] Sub-task A");
        editor.setCursorBufferPosition([1, 19]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["1. [ ] Epic Tasks", "  1. [X] Sub-task A", "  2. [ ] "].join("\n"));
      });
      it("continue after alpha ordered task list line", function() {
        editor.setText("1. [ ] Epic Tasks\n  y. [X] Sub-task A");
        editor.setCursorBufferPosition([1, 19]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["1. [ ] Epic Tasks", "  y. [X] Sub-task A", "  z. [ ] "].join("\n"));
      });
      it("continue after blockquote line", function() {
        editor.setText("> Your time is limited, so don’t waste it living someone else’s life.");
        editor.setCursorBufferPosition([0, 69]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["> Your time is limited, so don’t waste it living someone else’s life.", "> "].join("\n"));
      });
      it("not continue after empty unordered task list line", function() {
        editor.setText("- [ ]");
        editor.setCursorBufferPosition([0, 5]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["", ""].join("\n"));
      });
      it("not continue after empty ordered list line", function() {
        editor.setText(["1. [ ] parent", "  - child", "  - "].join("\n"));
        editor.setCursorBufferPosition([2, 4]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["1. [ ] parent", "  - child", "2. [ ] "].join("\n"));
      });
      return it("not continue after empty ordered paragraph", function() {
        editor.setText(["1. parent", "  - child has a paragraph", "", "    paragraph one", "", "    paragraph two", "", "  - "].join("\n"));
        editor.setCursorBufferPosition([7, 4]);
        editLine.trigger();
        return expect(editor.getText()).toBe(["1. parent", "  - child has a paragraph", "", "    paragraph one", "", "    paragraph two", "", "2. "].join("\n"));
      });
    });
    return describe("indentListLine", function() {
      beforeEach(function() {
        return editLine = new EditLine("indent-list-line");
      });
      it("indent line if it is at head of line", function() {
        editor.setText("  normal line");
        editor.setCursorBufferPosition([0, 1]);
        editLine.trigger();
        return expect(editor.getText()).toBe("    normal line");
      });
      it("indent line if it is a list", function() {
        editor.setText("- list");
        editor.setCursorBufferPosition([0, 5]);
        editLine.trigger();
        return expect(editor.getText()).toBe("  - list");
      });
      return it("insert space if it is text", function() {
        editor.setText("texttext");
        editor.setCursorBufferPosition([0, 4]);
        editLine.trigger(event);
        return expect(event.abortKeyBinding).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL2NvbW1hbmRzL2VkaXQtbGluZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw4QkFBUixDQUFYLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSw2QkFBQTtBQUFBLElBQUEsT0FBNEIsRUFBNUIsRUFBQyxnQkFBRCxFQUFTLGtCQUFULEVBQW1CLGVBQW5CLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGdCQUFwQixFQUFIO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxRQUVBLEtBQUEsR0FBUTtBQUFBLFVBQUUsZUFBQSxFQUFpQixTQUFBLEdBQUE7bUJBQUcsR0FBSDtVQUFBLENBQW5CO1NBRlIsQ0FBQTtlQUdBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsaUJBQWIsRUFKRztNQUFBLENBQUwsRUFGUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFVQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQUcsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLGlCQUFULEVBQWxCO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxN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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/commands/edit-line-spec.coffee