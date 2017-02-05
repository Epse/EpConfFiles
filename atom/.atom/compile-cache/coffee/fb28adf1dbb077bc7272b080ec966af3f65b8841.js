(function() {
  var GitDiff, contextPackageFinder, notifier;

  contextPackageFinder = require('../../context-package-finder');

  notifier = require('../../notifier');

  GitDiff = require('../git-diff');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      if (path === repo.getWorkingDirectory()) {
        file = path;
      } else {
        file = repo.relativize(path);
      }
      if (file === '') {
        file = void 0;
      }
      return GitDiff(repo, {
        file: file
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvY29udGV4dC9naXQtZGlmZi1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QztNQUNFLElBQUcsSUFBQSxLQUFRLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVg7UUFDRSxJQUFBLEdBQU8sS0FEVDtPQUFBLE1BQUE7UUFHRSxJQUFBLEdBQU8sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsRUFIVDs7TUFJQSxJQUFvQixJQUFBLEtBQVEsRUFBNUI7UUFBQSxJQUFBLEdBQU8sT0FBUDs7YUFDQSxPQUFBLENBQVEsSUFBUixFQUFjO1FBQUMsTUFBQSxJQUFEO09BQWQsRUFORjtLQUFBLE1BQUE7YUFRRSxRQUFRLENBQUMsT0FBVCxDQUFpQiwwQkFBakIsRUFSRjs7RUFEZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5HaXREaWZmID0gcmVxdWlyZSAnLi4vZ2l0LWRpZmYnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgaWYgcGF0aCBpcyByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICAgICAgZmlsZSA9IHBhdGhcbiAgICBlbHNlXG4gICAgICBmaWxlID0gcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gICAgZmlsZSA9IHVuZGVmaW5lZCBpZiBmaWxlIGlzICcnXG4gICAgR2l0RGlmZiByZXBvLCB7ZmlsZX1cbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJObyBmaWxlIHNlbGVjdGVkIHRvIGRpZmZcIlxuIl19
