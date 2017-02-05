(function() {
  var RemoteListView, experimentalFeaturesEnabled, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  module.exports = function(repo, arg) {
    var extraArgs, rebase;
    rebase = (arg != null ? arg : {}).rebase;
    extraArgs = rebase ? ['--rebase'] : [];
    if (experimentalFeaturesEnabled()) {
      return pull(repo, {
        extraArgs: extraArgs
      });
    } else {
      return git.cmd(['remote'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return new RemoteListView(repo, data, {
          mode: 'pull',
          extraArgs: extraArgs
        }).result;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXB1bGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSOztFQUNQLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDJCQUFSOztFQUVqQiwyQkFBQSxHQUE4QixTQUFBO0FBQzVCLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFVBQWhCO1dBQ1YsT0FBTyxDQUFDLHNCQUFSLElBQW1DLE9BQU8sQ0FBQztFQUZmOztFQUk5QixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1Qix3QkFBRCxNQUFTO0lBQy9CLFNBQUEsR0FBZSxNQUFILEdBQWUsQ0FBQyxVQUFELENBQWYsR0FBaUM7SUFDN0MsSUFBRywyQkFBQSxDQUFBLENBQUg7YUFDRSxJQUFBLENBQUssSUFBTCxFQUFXO1FBQUMsV0FBQSxTQUFEO09BQVgsRUFERjtLQUFBLE1BQUE7YUFHRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBcEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7ZUFBVSxJQUFJLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLElBQXJCLEVBQTJCO1VBQUEsSUFBQSxFQUFNLE1BQU47VUFBYyxTQUFBLEVBQVcsU0FBekI7U0FBM0IsQ0FBOEQsQ0FBQztNQUE3RSxDQUROLEVBSEY7O0VBRmU7QUFSakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5wdWxsID0gcmVxdWlyZSAnLi9fcHVsbCdcblJlbW90ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmVtb3RlLWxpc3QtdmlldydcblxuZXhwZXJpbWVudGFsRmVhdHVyZXNFbmFibGVkID0gKCkgLT5cbiAgZ2l0UGx1cyA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMnKVxuICBnaXRQbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0gYW5kIGdpdFBsdXMuZXhwZXJpbWVudGFsXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtyZWJhc2V9PXt9KSAtPlxuICBleHRyYUFyZ3MgPSBpZiByZWJhc2UgdGhlbiBbJy0tcmViYXNlJ10gZWxzZSBbXVxuICBpZiBleHBlcmltZW50YWxGZWF0dXJlc0VuYWJsZWQoKVxuICAgIHB1bGwgcmVwbywge2V4dHJhQXJnc31cbiAgZWxzZVxuICAgIGdpdC5jbWQoWydyZW1vdGUnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT4gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIGRhdGEsIG1vZGU6ICdwdWxsJywgZXh0cmFBcmdzOiBleHRyYUFyZ3MpLnJlc3VsdFxuIl19
