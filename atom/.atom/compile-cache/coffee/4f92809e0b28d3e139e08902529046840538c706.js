(function() {
  var OpenLinkInBrowser, child_process, shell, utils;

  child_process = require("child_process");

  shell = require("shell");

  utils = require("../utils");

  module.exports = OpenLinkInBrowser = (function() {
    function OpenLinkInBrowser() {}

    OpenLinkInBrowser.prototype.trigger = function(e) {
      var editor, link, range;
      editor = atom.workspace.getActiveTextEditor();
      range = utils.getTextBufferRange(editor, "link");
      link = utils.findLinkInRange(editor, range);
      if (!link || !link.url) {
        return e.abortKeyBinding();
      }
      switch (process.platform) {
        case 'darwin':
          return child_process.execFile("open", [link.url]);
        case 'linux':
          return child_process.execFile("xdg-open", [link.url]);
        case 'win32':
          return shell.openExternal(link.url);
      }
    };

    return OpenLinkInBrowser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29tbWFuZHMvb3Blbi1saW5rLWluLWJyb3dzZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsZUFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQUhSLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO21DQUNKOztBQUFBLGdDQUFBLE9BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtBQUNQLFVBQUEsbUJBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLGtCQUFOLENBQXlCLE1BQXpCLEVBQWlDLE1BQWpDLENBRFIsQ0FBQTtBQUFBLE1BR0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxlQUFOLENBQXNCLE1BQXRCLEVBQThCLEtBQTlCLENBSFAsQ0FBQTtBQUlBLE1BQUEsSUFBOEIsQ0FBQSxJQUFBLElBQVMsQ0FBQSxJQUFLLENBQUMsR0FBN0M7QUFBQSxlQUFPLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FBUCxDQUFBO09BSkE7QUFNQSxjQUFPLE9BQU8sQ0FBQyxRQUFmO0FBQUEsYUFDTyxRQURQO2lCQUNxQixhQUFhLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixDQUFDLElBQUksQ0FBQyxHQUFOLENBQS9CLEVBRHJCO0FBQUEsYUFFTyxPQUZQO2lCQUVxQixhQUFhLENBQUMsUUFBZCxDQUF1QixVQUF2QixFQUFtQyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQW5DLEVBRnJCO0FBQUEsYUFHTyxPQUhQO2lCQUdxQixLQUFLLENBQUMsWUFBTixDQUFtQixJQUFJLENBQUMsR0FBeEIsRUFIckI7QUFBQSxPQVBPO0lBQUEsQ0FBVCxDQUFBOzs2QkFBQTs7TUFQRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/commands/open-link-in-browser.coffee
