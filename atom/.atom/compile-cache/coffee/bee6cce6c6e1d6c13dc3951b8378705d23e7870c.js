(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var ref;
    return (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (extraArgs == null) {
      extraArgs = [];
    }
    view = OutputViewManager.create();
    startMessage = notifier.addInfo("Pulling...", {
      dismissable: true
    });
    args = ['pull'].concat(extraArgs).concat(getUpstream(repo)).filter(emptyOrUndefined);
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    }).then(function(data) {
      view.setContent(data).finish();
      return startMessage.dismiss();
    })["catch"](function(error) {
      view.setContent(error).finish();
      return startMessage.dismiss();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvX3B1bGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsZ0JBQUEsR0FBbUIsU0FBQyxLQUFEO1dBQVcsS0FBQSxLQUFXLEVBQVgsSUFBa0IsS0FBQSxLQUFXO0VBQXhDOztFQUVuQixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osUUFBQTt5REFBd0IsQ0FBRSxTQUExQixDQUFvQyxlQUFlLENBQUMsTUFBcEQsQ0FBMkQsQ0FBQyxLQUE1RCxDQUFrRSxHQUFsRTtFQURZOztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLDJCQUFELE1BQVk7O01BQ2xDLFlBQWE7O0lBQ2IsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7SUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7TUFBQSxXQUFBLEVBQWEsSUFBYjtLQUEvQjtJQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxXQUFBLENBQVksSUFBWixDQUFsQyxDQUFvRCxDQUFDLE1BQXJELENBQTRELGdCQUE1RDtXQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxFQUErQztNQUFDLEtBQUEsRUFBTyxJQUFSO0tBQS9DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO01BQ0osSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2FBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtJQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtNQUNMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTthQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7SUFGSyxDQUpQO0VBTGU7QUFUakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5lbXB0eU9yVW5kZWZpbmVkID0gKHRoaW5nKSAtPiB0aGluZyBpc250ICcnIGFuZCB0aGluZyBpc250IHVuZGVmaW5lZFxuXG5nZXRVcHN0cmVhbSA9IChyZXBvKSAtPlxuICByZXBvLmdldFVwc3RyZWFtQnJhbmNoKCk/LnN1YnN0cmluZygncmVmcy9yZW1vdGVzLycubGVuZ3RoKS5zcGxpdCgnLycpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtleHRyYUFyZ3N9PXt9KSAtPlxuICBleHRyYUFyZ3MgPz0gW11cbiAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoZXh0cmFBcmdzKS5jb25jYXQoZ2V0VXBzdHJlYW0ocmVwbykpLmZpbHRlcihlbXB0eU9yVW5kZWZpbmVkKVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgLmNhdGNoIChlcnJvcikgLT5cbiAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
