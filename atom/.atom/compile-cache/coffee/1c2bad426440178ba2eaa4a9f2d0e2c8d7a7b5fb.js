(function() {
  var InsertFootnoteView;

  InsertFootnoteView = require("../../lib/views/insert-footnote-view");

  describe("InsertFootnoteView", function() {
    var editor, insertFootnoteView, _ref;
    _ref = [], editor = _ref[0], insertFootnoteView = _ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        insertFootnoteView = new InsertFootnoteView({});
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe(".display", function() {
      it("display without set footnote", function() {
        insertFootnoteView.display();
        expect(insertFootnoteView.footnote).toBeUndefined();
        return expect(insertFootnoteView.labelEditor.getText().length).toEqual(8);
      });
      return it("display with footnote set", function() {
        editor.setText("[^1]");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertFootnoteView.display();
        expect(insertFootnoteView.footnote).toEqual({
          label: "1",
          content: "",
          isDefinition: false
        });
        return expect(insertFootnoteView.labelEditor.getText()).toEqual("1");
      });
    });
    describe(".insertFootnote", function() {
      return it("insert footnote with content", function() {
        insertFootnoteView.display();
        insertFootnoteView.insertFootnote({
          label: "footnote",
          content: "content"
        });
        return expect(editor.getText()).toEqual("[^footnote]\n\n[^footnote]: content");
      });
    });
    return describe(".updateFootnote", function() {
      var expected, fixture;
      fixture = "[^footnote]\n\n[^footnote]:\ncontent";
      expected = "[^note]\n\n[^note]:\ncontent";
      beforeEach(function() {
        return editor.setText(fixture);
      });
      it("update footnote definition to new label", function() {
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertFootnoteView.display();
        insertFootnoteView.updateFootnote({
          label: "note",
          content: ""
        });
        return expect(editor.getText()).toEqual(expected);
      });
      return it("update footnote reference to new label", function() {
        editor.setCursorBufferPosition([2, 0]);
        editor.selectToBufferPosition([2, 13]);
        insertFootnoteView.display();
        insertFootnoteView.updateFootnote({
          label: "note",
          content: ""
        });
        return expect(editor.getText()).toEqual(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL3ZpZXdzL2luc2VydC1mb290bm90ZS12aWV3LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHNDQUFSLENBQXJCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEsZ0NBQUE7QUFBQSxJQUFBLE9BQStCLEVBQS9CLEVBQUMsZ0JBQUQsRUFBUyw0QkFBVCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixnQkFBcEIsRUFBSDtNQUFBLENBQWhCLENBQUEsQ0FBQTthQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLGtCQUFBLEdBQXlCLElBQUEsa0JBQUEsQ0FBbUIsRUFBbkIsQ0FBekIsQ0FBQTtlQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsRUFGTjtNQUFBLENBQUwsRUFGUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsTUFBQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsa0JBQWtCLENBQUMsT0FBbkIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxRQUExQixDQUFtQyxDQUFDLGFBQXBDLENBQUEsQ0FEQSxDQUFBO2VBRUEsTUFBQSxDQUFP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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/views/insert-footnote-view-spec.coffee
