(function() {
  var BuildMatrixView, BuildStatusView, Disposable, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('electron').shell;

  Disposable = require('atom').Disposable;

  TravisCi = null;

  BuildMatrixView = null;

  BuildStatusView = null;

  module.exports = {
    config: {
      travisCiRemoteName: {
        type: 'string',
        "default": 'origin',
        title: 'Travis CI Remote Name',
        description: 'Enter the name of the remote used for Travis integration',
        order: 1
      },
      travisCiAltRemotes: {
        type: 'string',
        "default": '',
        title: 'Remote Overrides',
        description: 'Enter repository-specific remotes as a JSON string to override the default in the format:<br/>`{"repository":"remote"}`',
        order: 2
      },
      useTravisCiPro: {
        type: 'boolean',
        "default": false,
        title: 'Use Travis CI Pro',
        order: 3
      },
      personalAccessToken: {
        type: 'string',
        "default": '',
        title: 'Personal Access Token',
        description: 'Your personal [GitHub access token](https://github.com/settings/tokens) (*required for Travis CI Pro*)',
        order: 4
      }
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
      this.updateSettings;
      this.projectChangeSubscription = atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.checkTravisRepos().then(function() {
            return _this.init(_this.statusBar);
          });
        };
      })(this));
      return this.checkTravisRepos();
    },
    checkTravisRepos: function() {
      return this.activationPromise = Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project))).then((function(_this) {
        return function(repos) {
          repos = repos.filter(function(repo) {
            return repo;
          });
          return new Promise(function(resolve) {
            if (_this.hasGitHubRepo(repos)) {
              return _this.isTravisProject(function(config) {
                return config && resolve();
              });
            }
          });
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1, _ref2;
      atom.travis = null;
      if ((_ref = this.statusBarSubscription) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.buildMatrixView) != null) {
        _ref1.destroy();
      }
      return (_ref2 = this.projectChangeSubscription) != null ? _ref2.dispose() : void 0;
    },
    serialize: function() {},
    hasGitHubRepo: function(repos) {
      var name, repo, _i, _len;
      if (repos.length === 0) {
        return false;
      }
      for (_i = 0, _len = repos.length; _i < _len; _i++) {
        repo = repos[_i];
        name = this.getFinalRemote(repo);
        if (/(.)*github\.com/i.test(repo.getConfigValue("remote." + name + ".url"))) {
          return true;
        }
      }
      return false;
    },
    getNameWithOwner: function() {
      var name, repo, url;
      repo = atom.project.getRepositories()[0];
      name = this.getFinalRemote(repo);
      url = repo.getConfigValue("remote." + name + ".url");
      if (url == null) {
        return null;
      }
      return /([^\/:]+)\/([^\/]+)$/.exec(url.replace(/\.git$/, ''))[0];
    },
    getFinalRemote: function(repo) {
      var gitPath, name, override, url;
      if (repo == null) {
        repo = atom.project.getRepositories()[0];
      }
      url = repo.getOriginURL();
      gitPath = /([^\/:]+)\/([^\/]+)$/.exec(url.replace(/\.git$/, ''))[0];
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      override = atom.config.get('travis-ci-status.travisCiAltRemotes');
      override = JSON.parse(override);
      if (override.hasOwnProperty(gitPath)) {
        name = override[gitPath];
      }
      return name;
    },
    isTravisProject: function(callback) {
      var conf, projPath;
      if (!(callback instanceof Function)) {
        return;
      }
      projPath = atom.project.getPaths()[0];
      if (projPath == null) {
        return callback(false);
      }
      conf = path.join(projPath, '.travis.yml');
      return fs.exists(conf, callback);
    },
    init: function(statusBar) {
      var gfr, nwo;
      if (TravisCi == null) {
        TravisCi = require('travis-ci');
      }
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: atom.config.get('travis-ci-status.useTravisCiPro')
      });
      atom.commands.add('atom-workspace', 'travis-ci-status:open-on-travis', (function(_this) {
        return function() {
          return _this.openOnTravis();
        };
      })(this));
      if (BuildStatusView == null) {
        BuildStatusView = require('./build-status-view');
      }
      if (BuildMatrixView == null) {
        BuildMatrixView = require('./build-matrix-view');
      }
      nwo = this.getNameWithOwner();
      gfr = this.getFinalRemote();
      this.buildMatrixView = new BuildMatrixView(nwo);
      return this.buildStatusView = new BuildStatusView(nwo, this.buildMatrixView, statusBar, gfr);
    },
    openOnTravis: function() {
      var domain, nwo;
      nwo = this.getNameWithOwner();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return shell.openExternal("https://" + domain + "/" + nwo);
    },
    consumeStatusBar: function(statusBar) {
      this.statusBar = statusBar;
      this.activationPromise.then((function(_this) {
        return function() {
          return _this.init(statusBar);
        };
      })(this));
      return this.statusBarSubscription = new Disposable((function(_this) {
        return function() {
          var _ref;
          return (_ref = _this.buildStatusView) != null ? _ref.destroy() : void 0;
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3RyYXZpcy1jaS1zdGF0dXMvbGliL3RyYXZpcy1jaS1zdGF0dXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVFQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQyxRQUFTLE9BQUEsQ0FBUSxVQUFSLEVBQVQsS0FGRCxDQUFBOztBQUFBLEVBR0MsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBSEQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxJQUxYLENBQUE7O0FBQUEsRUFPQSxlQUFBLEdBQWtCLElBUGxCLENBQUE7O0FBQUEsRUFRQSxlQUFBLEdBQWtCLElBUmxCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsUUFEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLHVCQUZQO0FBQUEsUUFHQSxXQUFBLEVBQWEsMERBSGI7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BREY7QUFBQSxNQU1BLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLGtCQUZQO0FBQUEsUUFHQSxXQUFBLEVBQWEseUhBSGI7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BUEY7QUFBQSxNQVlBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8sbUJBRlA7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BYkY7QUFBQSxNQWlCQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyx1QkFGUDtBQUFBLFFBR0EsV0FBQSxFQUFhLHdHQUhiO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQWxCRjtLQURGO0FBQUEsSUEwQkEsZUFBQSxFQUFpQixJQTFCakI7QUFBQSxJQTZCQSxlQUFBLEVBQWlCLElBN0JqQjtBQUFBLElBa0NBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxjQUFELENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSx5QkFBRCxHQUE2QixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3pELEtBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBQyxDQUFBLFNBQVAsRUFBSDtVQUFBLENBQXpCLEVBRHlEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsQ0FGN0IsQ0FBQTthQUtBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBTlE7SUFBQSxDQWxDVjtBQUFBLElBMENBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTthQUNoQixJQUFDLENBQUEsaUJBQUQsR0FBcUIsT0FBTyxDQUFDLEdBQVIsQ0FDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQUEsQ0FBNkIsQ0FBQyxHQUE5QixDQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsSUFBcEMsQ0FBeUMsSUFBSSxDQUFDLE9BQTlDLENBREYsQ0FEbUIsQ0FJcEIsQ0FBQyxJQUptQixDQUlkLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtBQUNMLFVBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBQyxJQUFELEdBQUE7bUJBQVUsS0FBVjtVQUFBLENBQWIsQ0FBUixDQUFBO2lCQUVJLElBQUEsT0FBQSxDQUNGLFNBQUMsT0FBRCxHQUFBO0FBQ0UsWUFBQSxJQUFHLEtBQUMsQ0FBQSxhQUFELENBQWUsS0FBZixDQUFIO3FCQUNFLEtBQUMsQ0FBQSxlQUFELENBQWlCLFNBQUMsTUFBRCxHQUFBO3VCQUFZLE1BQUEsSUFBVyxPQUFBLENBQUEsRUFBdkI7Y0FBQSxDQUFqQixFQURGO2FBREY7VUFBQSxDQURFLEVBSEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpjLEVBREw7SUFBQSxDQTFDbEI7QUFBQSxJQTJEQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxrQkFBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFkLENBQUE7O1lBQ3NCLENBQUUsT0FBeEIsQ0FBQTtPQURBOzthQUVnQixDQUFFLE9BQWxCLENBQUE7T0FGQTtxRUFHMEIsQ0FBRSxPQUE1QixDQUFBLFdBSlU7SUFBQSxDQTNEWjtBQUFBLElBb0VBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FwRVg7QUFBQSxJQXlFQSxhQUFBLEVBQWUsU0FBQyxLQUFELEdBQUE7QUFDYixVQUFBLG9CQUFBO0FBQUEsTUFBQSxJQUFnQixLQUFLLENBQUMsTUFBTixLQUFnQixDQUFoQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7QUFFQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBaEIsQ0FBUCxDQUFBO0FBQ0EsUUFBQSxJQUFlLGtCQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUksQ0FBQyxjQUFMLENBQXFCLFNBQUEsR0FBUyxJQUFULEdBQWMsTUFBbkMsQ0FBeEIsQ0FBZjtBQUFBLGlCQUFPLElBQVAsQ0FBQTtTQUZGO0FBQUEsT0FGQTthQU1BLE1BUGE7SUFBQSxDQXpFZjtBQUFBLElBc0ZBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLGVBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUErQixDQUFBLENBQUEsQ0FBdEMsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCLENBRFAsQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFPLElBQUksQ0FBQyxjQUFMLENBQXFCLFNBQUEsR0FBUyxJQUFULEdBQWMsTUFBbkMsQ0FGUCxDQUFBO0FBSUEsTUFBQSxJQUFtQixXQUFuQjtBQUFBLGVBQU8sSUFBUCxDQUFBO09BSkE7YUFNQSxzQkFBc0IsQ0FBQyxJQUF2QixDQUE0QixHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosRUFBc0IsRUFBdEIsQ0FBNUIsQ0FBdUQsQ0FBQSxDQUFBLEVBUHZDO0lBQUEsQ0F0RmxCO0FBQUEsSUErRkEsY0FBQSxFQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLFVBQUEsNEJBQUE7QUFBQSxNQUFBLElBQU8sWUFBUDtBQUNFLFFBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBYixDQUFBLENBQStCLENBQUEsQ0FBQSxDQUF0QyxDQURGO09BQUE7QUFBQSxNQUdBLEdBQUEsR0FBTSxJQUFJLENBQUMsWUFBTCxDQUFBLENBSE4sQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUFVLHNCQUFzQixDQUFDLElBQXZCLENBQTRCLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixFQUFzQixFQUF0QixDQUE1QixDQUF1RCxDQUFBLENBQUEsQ0FKakUsQ0FBQTtBQUFBLE1BTUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FOUCxDQUFBO0FBQUEsTUFPQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQixDQVBYLENBQUE7QUFBQSxNQVFBLFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsQ0FSWCxDQUFBO0FBVUEsTUFBQSxJQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLE9BQXhCLENBQUg7QUFDRSxRQUFBLElBQUEsR0FBTyxRQUFTLENBQUEsT0FBQSxDQUFoQixDQURGO09BVkE7YUFhQSxLQWRjO0lBQUEsQ0EvRmhCO0FBQUEsSUFtSEEsZUFBQSxFQUFpQixTQUFDLFFBQUQsR0FBQTtBQUNmLFVBQUEsY0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQWMsUUFBQSxZQUFvQixRQUFsQyxDQUFBO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FGbkMsQ0FBQTtBQUdBLE1BQUEsSUFBOEIsZ0JBQTlCO0FBQUEsZUFBTyxRQUFBLENBQVMsS0FBVCxDQUFQLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQixhQUFwQixDQUxQLENBQUE7YUFNQSxFQUFFLENBQUMsTUFBSCxDQUFVLElBQVYsRUFBZ0IsUUFBaEIsRUFQZTtJQUFBLENBbkhqQjtBQUFBLElBK0hBLElBQUEsRUFBTSxTQUFDLFNBQUQsR0FBQTtBQUNKLFVBQUEsUUFBQTs7UUFBQSxXQUFZLE9BQUEsQ0FBUSxXQUFSO09BQVo7QUFBQSxNQUVBLElBQUksQ0FBQyxNQUFMLEdBQWtCLElBQUEsUUFBQSxDQUNoQjtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUNBLEdBQUEsRUFBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBREw7T0FEZ0IsQ0FGbEIsQ0FBQTtBQUFBLE1BT0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxpQ0FBcEMsRUFBdUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDckUsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQURxRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZFLENBUEEsQ0FBQTs7UUFVQSxrQkFBbUIsT0FBQSxDQUFRLHFCQUFSO09BVm5COztRQVdBLGtCQUFtQixPQUFBLENBQVEscUJBQVI7T0FYbkI7QUFBQSxNQWFBLEdBQUEsR0FBTSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQWJOLENBQUE7QUFBQSxNQWNBLEdBQUEsR0FBTSxJQUFDLENBQUEsY0FBRCxDQUFBLENBZE4sQ0FBQTtBQUFBLE1BZUEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQWdCLEdBQWhCLENBZnZCLENBQUE7YUFnQkEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQWdCLEdBQWhCLEVBQXFCLElBQUMsQ0FBQSxlQUF0QixFQUF1QyxTQUF2QyxFQUFrRCxHQUFsRCxFQWpCbkI7SUFBQSxDQS9ITjtBQUFBLElBcUpBLFlBQUEsRUFBYyxTQUFBLEdBQUE7QUFDWixVQUFBLFdBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFOLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQWYsR0FDUCxzQkFETyxHQUdQLGVBTEYsQ0FBQTthQU9BLEtBQUssQ0FBQyxZQUFOLENBQW9CLFVBQUEsR0FBVSxNQUFWLEdBQWlCLEdBQWpCLEdBQW9CLEdBQXhDLEVBUlk7SUFBQSxDQXJKZDtBQUFBLElBK0pBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUFiLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLHFCQUFELEdBQTZCLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsY0FBQSxJQUFBOzhEQUFnQixDQUFFLE9BQWxCLENBQUEsV0FEc0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBSGI7SUFBQSxDQS9KbEI7R0FaRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee
