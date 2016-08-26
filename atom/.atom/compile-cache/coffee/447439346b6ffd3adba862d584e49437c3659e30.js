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
      useTravisCiPro: {
        type: 'boolean',
        "default": false
      },
      personalAccessToken: {
        type: 'string',
        "default": '<Your personal GitHub access token>'
      },
      travisCiRemoteName: {
        type: 'string',
        "default": 'origin'
      }
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
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
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      for (_i = 0, _len = repos.length; _i < _len; _i++) {
        repo = repos[_i];
        if (/(.)*github\.com/i.test(repo.getConfigValue("remote." + name + ".url"))) {
          return true;
        }
      }
      return false;
    },
    getNameWithOwner: function() {
      var name, repo, url;
      repo = atom.project.getRepositories()[0];
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      url = repo.getConfigValue("remote." + name + ".url");
      if (url == null) {
        return null;
      }
      return /([^\/:]+)\/([^\/]+)$/.exec(url.replace(/\.git$/, ''))[0];
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
      var nwo;
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
      this.buildMatrixView = new BuildMatrixView(nwo);
      return this.buildStatusView = new BuildStatusView(nwo, this.buildMatrixView, statusBar);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy90cmF2aXMtY2ktc3RhdHVzL2xpYi90cmF2aXMtY2ktc3RhdHVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1RUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUMsUUFBUyxPQUFBLENBQVEsVUFBUixFQUFULEtBRkQsQ0FBQTs7QUFBQSxFQUdDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUhELENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsSUFMWCxDQUFBOztBQUFBLEVBT0EsZUFBQSxHQUFrQixJQVBsQixDQUFBOztBQUFBLEVBUUEsZUFBQSxHQUFrQixJQVJsQixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURKO0FBQUEsTUFHQSxtQkFBQSxFQUNJO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLHFDQURUO09BSko7QUFBQSxNQU1BLGtCQUFBLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsUUFEVDtPQVBKO0tBREY7QUFBQSxJQVlBLGVBQUEsRUFBaUIsSUFaakI7QUFBQSxJQWVBLGVBQUEsRUFBaUIsSUFmakI7QUFBQSxJQW9CQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEseUJBQUQsR0FBNkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN6RCxLQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFtQixDQUFDLElBQXBCLENBQXlCLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFNLEtBQUMsQ0FBQSxTQUFQLEVBQUg7VUFBQSxDQUF6QixFQUR5RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBQTdCLENBQUE7YUFHQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxFQUpRO0lBQUEsQ0FwQlY7QUFBQSxJQTBCQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7YUFDaEIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLE9BQU8sQ0FBQyxHQUFSLENBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQTZCLENBQUMsR0FBOUIsQ0FDRSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQXBDLENBQXlDLElBQUksQ0FBQyxPQUE5QyxDQURGLENBRG1CLENBSXBCLENBQUMsSUFKbUIsQ0FJZCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7QUFDTCxVQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixDQUFhLFNBQUMsSUFBRCxHQUFBO21CQUFVLEtBQVY7VUFBQSxDQUFiLENBQVIsQ0FBQTtpQkFFSSxJQUFBLE9BQUEsQ0FDRixTQUFDLE9BQUQsR0FBQTtBQUNFLFlBQUEsSUFBRyxLQUFDLENBQUEsYUFBRCxDQUFlLEtBQWYsQ0FBSDtxQkFDRSxLQUFDLENBQUEsZUFBRCxDQUFpQixTQUFDLE1BQUQsR0FBQTt1QkFBWSxNQUFBLElBQVcsT0FBQSxDQUFBLEVBQXZCO2NBQUEsQ0FBakIsRUFERjthQURGO1VBQUEsQ0FERSxFQUhDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKYyxFQURMO0lBQUEsQ0ExQmxCO0FBQUEsSUEyQ0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsa0JBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsSUFBZCxDQUFBOztZQUNzQixDQUFFLE9BQXhCLENBQUE7T0FEQTs7YUFFZ0IsQ0FBRSxPQUFsQixDQUFBO09BRkE7cUVBRzBCLENBQUUsT0FBNUIsQ0FBQSxXQUpVO0lBQUEsQ0EzQ1o7QUFBQSxJQW9EQSxTQUFBLEVBQVcsU0FBQSxHQUFBLENBcERYO0FBQUEsSUF5REEsYUFBQSxFQUFlLFNBQUMsS0FBRCxHQUFBO0FBQ2IsVUFBQSxvQkFBQTtBQUFBLE1BQUEsSUFBZ0IsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBaEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQixDQURQLENBQUE7QUFFQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsUUFBQSxJQUFlLGtCQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUksQ0FBQyxjQUFMLENBQXFCLFNBQUEsR0FBUyxJQUFULEdBQWMsTUFBbkMsQ0FBeEIsQ0FBZjtBQUFBLGlCQUFPLElBQVAsQ0FBQTtTQURGO0FBQUEsT0FGQTthQUtBLE1BTmE7SUFBQSxDQXpEZjtBQUFBLElBcUVBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLGVBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUErQixDQUFBLENBQUEsQ0FBdEMsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FEUCxDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU8sSUFBSSxDQUFDLGNBQUwsQ0FBcUIsU0FBQSxHQUFTLElBQVQsR0FBYyxNQUFuQyxDQUZQLENBQUE7QUFJQSxNQUFBLElBQW1CLFdBQW5CO0FBQUEsZUFBTyxJQUFQLENBQUE7T0FKQTthQU1BLHNCQUFzQixDQUFDLElBQXZCLENBQTRCLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixFQUFzQixFQUF0QixDQUE1QixDQUF1RCxDQUFBLENBQUEsRUFQdkM7SUFBQSxDQXJFbEI7QUFBQSxJQWtGQSxlQUFBLEVBQWlCLFNBQUMsUUFBRCxHQUFBO0FBQ2YsVUFBQSxjQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBYyxRQUFBLFlBQW9CLFFBQWxDLENBQUE7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUZuQyxDQUFBO0FBR0EsTUFBQSxJQUE4QixnQkFBOUI7QUFBQSxlQUFPLFFBQUEsQ0FBUyxLQUFULENBQVAsQ0FBQTtPQUhBO0FBQUEsTUFLQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLGFBQXBCLENBTFAsQ0FBQTthQU1BLEVBQUUsQ0FBQyxNQUFILENBQVUsSUFBVixFQUFnQixRQUFoQixFQVBlO0lBQUEsQ0FsRmpCO0FBQUEsSUE4RkEsSUFBQSxFQUFNLFNBQUMsU0FBRCxHQUFBO0FBQ0osVUFBQSxHQUFBOztRQUFBLFdBQVksT0FBQSxDQUFRLFdBQVI7T0FBWjtBQUFBLE1BRUEsSUFBSSxDQUFDLE1BQUwsR0FBa0IsSUFBQSxRQUFBLENBQ2hCO0FBQUEsUUFBQSxPQUFBLEVBQVMsT0FBVDtBQUFBLFFBQ0EsR0FBQSxFQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FETDtPQURnQixDQUZsQixDQUFBO0FBQUEsTUFPQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGlDQUFwQyxFQUF1RSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNyRSxLQUFDLENBQUEsWUFBRCxDQUFBLEVBRHFFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkUsQ0FQQSxDQUFBOztRQVVBLGtCQUFtQixPQUFBLENBQVEscUJBQVI7T0FWbkI7O1FBV0Esa0JBQW1CLE9BQUEsQ0FBUSxxQkFBUjtPQVhuQjtBQUFBLE1BYUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBYk4sQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQWdCLEdBQWhCLENBZHZCLENBQUE7YUFlQSxJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLGVBQUEsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBQyxDQUFBLGVBQXRCLEVBQXVDLFNBQXZDLEVBaEJuQjtJQUFBLENBOUZOO0FBQUEsSUFtSEEsWUFBQSxFQUFjLFNBQUEsR0FBQTtBQUNaLFVBQUEsV0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQU4sQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBZixHQUNQLHNCQURPLEdBR1AsZUFMRixDQUFBO2FBT0EsS0FBSyxDQUFDLFlBQU4sQ0FBb0IsVUFBQSxHQUFVLE1BQVYsR0FBaUIsR0FBakIsR0FBb0IsR0FBeEMsRUFSWTtJQUFBLENBbkhkO0FBQUEsSUE2SEEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQWIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQURBLENBQUE7YUFFQSxJQUFDLENBQUEscUJBQUQsR0FBNkIsSUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN0QyxjQUFBLElBQUE7OERBQWdCLENBQUUsT0FBbEIsQ0FBQSxXQURzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFIYjtJQUFBLENBN0hsQjtHQVpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee
