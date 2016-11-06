(function() {
  var OpenCheatSheet;

  OpenCheatSheet = require("../../lib/commands/open-cheat-sheet");

  describe("OpenCheatSheet", function() {
    return it("returns correct cheatsheetURL", function() {
      var cmd;
      cmd = new OpenCheatSheet();
      expect(cmd.cheatsheetURL()).toMatch("markdown-preview://");
      expect(cmd.cheatsheetURL()).toMatch("CHEATSHEET.md");
      return expect(cmd.cheatsheetURL()).toNotMatch("%5C");
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL2NvbW1hbmRzL29wZW4tY2hlYXQtc2hlZXQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHFDQUFSLENBQWpCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO1dBQ3pCLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQVUsSUFBQSxjQUFBLENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLGFBQUosQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MscUJBQXBDLENBREEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxhQUFKLENBQUEsQ0FBUCxDQUEyQixDQUFDLE9BQTVCLENBQW9DLGVBQXBDLENBRkEsQ0FBQTthQUdBLE1BQUEsQ0FBTyxHQUFHLENBQUMsYUFBSixDQUFBLENBQVAsQ0FBMkIsQ0FBQyxVQUE1QixDQUF1QyxLQUF2QyxFQUprQztJQUFBLENBQXBDLEVBRHlCO0VBQUEsQ0FBM0IsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/commands/open-cheat-sheet-spec.coffee
