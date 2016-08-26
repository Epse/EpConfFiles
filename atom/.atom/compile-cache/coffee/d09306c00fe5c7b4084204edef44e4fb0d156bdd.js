(function() {
  var Helpers, Range, child_process, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Range = require('atom').Range;

  path = require('path');

  child_process = require('child_process');

  Helpers = module.exports = {
    error: function(e) {
      return atom.notifications.addError(e.toString(), {
        detail: e.stack || '',
        dismissable: true
      });
    },
    shouldTriggerLinter: function(linter, onChange, scopes) {
      if (onChange && !linter.lintOnFly) {
        return false;
      }
      if (!scopes.some(function(entry) {
        return __indexOf.call(linter.grammarScopes, entry) >= 0;
      })) {
        return false;
      }
      return true;
    },
    requestUpdateFrame: function(callback) {
      return setTimeout(callback, 100);
    },
    debounce: function(callback, delay) {
      var timeout;
      timeout = null;
      return function(arg) {
        clearTimeout(timeout);
        return timeout = setTimeout((function(_this) {
          return function() {
            return callback.call(_this, arg);
          };
        })(this), delay);
      };
    },
    isPathIgnored: function(filePath) {
      var i, projectPath, repo, _i, _len, _ref;
      repo = null;
      _ref = atom.project.getPaths();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        projectPath = _ref[i];
        if (filePath.indexOf(projectPath + path.sep) === 0) {
          repo = atom.project.getRepositories()[i];
          break;
        }
      }
      if (repo && repo.isProjectAtRoot() && repo.isPathIgnored(filePath)) {
        return true;
      }
      return false;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2hlbHBlcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUlBLE9BQUEsR0FBVSxNQUFNLENBQUMsT0FBUCxHQUNSO0FBQUEsSUFBQSxLQUFBLEVBQU8sU0FBQyxDQUFELEdBQUE7YUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FBNUIsRUFBMEM7QUFBQSxRQUFDLE1BQUEsRUFBUSxDQUFDLENBQUMsS0FBRixJQUFXLEVBQXBCO0FBQUEsUUFBd0IsV0FBQSxFQUFhLElBQXJDO09BQTFDLEVBREs7SUFBQSxDQUFQO0FBQUEsSUFFQSxtQkFBQSxFQUFxQixTQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLE1BQW5CLEdBQUE7QUFJbkIsTUFBQSxJQUFnQixRQUFBLElBQWEsQ0FBQSxNQUFVLENBQUMsU0FBeEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsTUFBMEIsQ0FBQyxJQUFQLENBQVksU0FBQyxLQUFELEdBQUE7ZUFBVyxlQUFTLE1BQU0sQ0FBQyxhQUFoQixFQUFBLEtBQUEsT0FBWDtNQUFBLENBQVosQ0FBcEI7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQURBO0FBRUEsYUFBTyxJQUFQLENBTm1CO0lBQUEsQ0FGckI7QUFBQSxJQVNBLGtCQUFBLEVBQW9CLFNBQUMsUUFBRCxHQUFBO2FBQ2xCLFVBQUEsQ0FBVyxRQUFYLEVBQXFCLEdBQXJCLEVBRGtCO0lBQUEsQ0FUcEI7QUFBQSxJQVdBLFFBQUEsRUFBVSxTQUFDLFFBQUQsRUFBVyxLQUFYLEdBQUE7QUFDUixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFDQSxhQUFPLFNBQUMsR0FBRCxHQUFBO0FBQ0wsUUFBQSxZQUFBLENBQWEsT0FBYixDQUFBLENBQUE7ZUFDQSxPQUFBLEdBQVUsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUNuQixRQUFRLENBQUMsSUFBVCxDQUFjLEtBQWQsRUFBb0IsR0FBcEIsRUFEbUI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRVIsS0FGUSxFQUZMO01BQUEsQ0FBUCxDQUZRO0lBQUEsQ0FYVjtBQUFBLElBa0JBLGFBQUEsRUFBZSxTQUFDLFFBQUQsR0FBQTtBQUNiLFVBQUEsb0NBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFDQTtBQUFBLFdBQUEsbURBQUE7OEJBQUE7QUFDRSxRQUFBLElBQUcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsV0FBQSxHQUFjLElBQUksQ0FBQyxHQUFwQyxDQUFBLEtBQTRDLENBQS9DO0FBQ0UsVUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFiLENBQUEsQ0FBK0IsQ0FBQSxDQUFBLENBQXRDLENBQUE7QUFDQSxnQkFGRjtTQURGO0FBQUEsT0FEQTtBQUtBLE1BQUEsSUFBZSxJQUFBLElBQVMsSUFBSSxDQUFDLGVBQUwsQ0FBQSxDQUFULElBQW9DLElBQUksQ0FBQyxhQUFMLENBQW1CLFFBQW5CLENBQW5EO0FBQUEsZUFBTyxJQUFQLENBQUE7T0FMQTtBQU1BLGFBQU8sS0FBUCxDQVBhO0lBQUEsQ0FsQmY7R0FMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/linter/lib/helpers.coffee
