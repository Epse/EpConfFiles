(function() {
  var GitCommit, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitCommit = require('../git-commit');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      file = repo.relativize(path);
      if (file === '') {
        file = void 0;
      }
      return git.add(repo, {
        file: file
      }).then(function() {
        return GitCommit(repo);
      });
    } else {
      return notifier.addInfo("No file selected to add and commit");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvY29udGV4dC9naXQtYWRkLWFuZC1jb21taXQtY29udGV4dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDdkIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxXQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsZ0JBQVI7O0VBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUSxlQUFSOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxJQUFHLElBQUEsbURBQWlDLENBQUUscUJBQXRDO01BQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCO01BQ1AsSUFBb0IsSUFBQSxLQUFRLEVBQTVCO1FBQUEsSUFBQSxHQUFPLE9BQVA7O2FBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQyxNQUFBLElBQUQ7T0FBZCxDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUE7ZUFBRyxTQUFBLENBQVUsSUFBVjtNQUFILENBQTNCLEVBSEY7S0FBQSxNQUFBO2FBS0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsb0NBQWpCLEVBTEY7O0VBRGU7QUFMakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb250ZXh0UGFja2FnZUZpbmRlciA9IHJlcXVpcmUgJy4uLy4uL2NvbnRleHQtcGFja2FnZS1maW5kZXInXG5naXQgPSByZXF1aXJlICcuLi8uLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL25vdGlmaWVyJ1xuR2l0Q29tbWl0ID0gcmVxdWlyZSAnLi4vZ2l0LWNvbW1pdCdcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgaWYgcGF0aCA9IGNvbnRleHRQYWNrYWdlRmluZGVyLmdldCgpPy5zZWxlY3RlZFBhdGhcbiAgICBmaWxlID0gcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gICAgZmlsZSA9IHVuZGVmaW5lZCBpZiBmaWxlIGlzICcnXG4gICAgZ2l0LmFkZChyZXBvLCB7ZmlsZX0pLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8pXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGQgYW5kIGNvbW1pdFwiXG4iXX0=
