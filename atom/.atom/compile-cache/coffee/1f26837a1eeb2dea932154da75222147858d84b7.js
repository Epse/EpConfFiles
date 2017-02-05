(function() {
  var GitDiffTool, contextPackageFinder, notifier;

  contextPackageFinder = require('../../context-package-finder');

  notifier = require('../../notifier');

  GitDiffTool = require('../git-difftool');

  module.exports = function(repo) {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return GitDiffTool(repo, {
        file: repo.relativize(path)
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvY29udGV4dC9naXQtZGlmZnRvb2wtY29udGV4dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDdkIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxJQUFHLElBQUEsbURBQWlDLENBQUUscUJBQXRDO2FBQ0UsV0FBQSxDQUFZLElBQVosRUFBa0I7UUFBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBTjtPQUFsQixFQURGO0tBQUEsTUFBQTthQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLDBCQUFqQixFQUhGOztFQURlO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdERpZmZUb29sID0gcmVxdWlyZSAnLi4vZ2l0LWRpZmZ0b29sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBpZiBwYXRoID0gY29udGV4dFBhY2thZ2VGaW5kZXIuZ2V0KCk/LnNlbGVjdGVkUGF0aFxuICAgIEdpdERpZmZUb29sIHJlcG8sIGZpbGU6IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICBlbHNlXG4gICAgbm90aWZpZXIuYWRkSW5mbyBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gZGlmZlwiXG4iXX0=
