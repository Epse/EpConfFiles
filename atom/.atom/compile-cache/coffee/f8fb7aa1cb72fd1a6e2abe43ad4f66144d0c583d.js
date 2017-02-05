(function() {
  var contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      file = repo.relativize(path);
      if (file === '') {
        file = '.';
      }
      return git.cmd(['reset', 'HEAD', '--', file], {
        cwd: repo.getWorkingDirectory()
      }).then(notifier.addSuccess)["catch"](notifier.addError);
    } else {
      return notifier.addInfo("No file selected to unstage");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvY29udGV4dC9naXQtdW5zdGFnZS1maWxlLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxJQUFHLElBQUEsbURBQWlDLENBQUUscUJBQXRDO01BQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCO01BQ1AsSUFBYyxJQUFBLEtBQVEsRUFBdEI7UUFBQSxJQUFBLEdBQU8sSUFBUDs7YUFDQSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsSUFBbEIsRUFBd0IsSUFBeEIsQ0FBUixFQUF1QztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXZDLENBQ0EsQ0FBQyxJQURELENBQ00sUUFBUSxDQUFDLFVBRGYsQ0FFQSxFQUFDLEtBQUQsRUFGQSxDQUVPLFFBQVEsQ0FBQyxRQUZoQixFQUhGO0tBQUEsTUFBQTthQU9FLFFBQVEsQ0FBQyxPQUFULENBQWlCLDZCQUFqQixFQVBGOztFQURlO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgaWYgcGF0aCA9IGNvbnRleHRQYWNrYWdlRmluZGVyLmdldCgpPy5zZWxlY3RlZFBhdGhcbiAgICBmaWxlID0gcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gICAgZmlsZSA9ICcuJyBpZiBmaWxlIGlzICcnXG4gICAgZ2l0LmNtZChbJ3Jlc2V0JywgJ0hFQUQnLCAnLS0nLCBmaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbihub3RpZmllci5hZGRTdWNjZXNzKVxuICAgIC5jYXRjaChub3RpZmllci5hZGRFcnJvcilcbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJObyBmaWxlIHNlbGVjdGVkIHRvIHVuc3RhZ2VcIlxuIl19
