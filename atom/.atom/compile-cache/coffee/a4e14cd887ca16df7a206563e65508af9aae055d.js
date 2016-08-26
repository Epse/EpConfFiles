(function() {
  var BuildMatrixView, BuildStatusView, Disposable, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('shell');

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
      return this.activationPromise = Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project))).then((function(_this) {
        return function(repos) {
          return new Promise(function(resolve) {
            if (_this.hasGitHubRepo(repos)) {
              return _this.isTravisProject(function(config) {
                if (config) {
                  return resolve();
                }
              });
            }
          });
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1;
      atom.travis = null;
      if ((_ref = this.statusBarSubscription) != null) {
        _ref.dispose();
      }
      return (_ref1 = this.buildMatrixView) != null ? _ref1.destroy() : void 0;
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
      this.buildStatusView = new BuildStatusView(nwo, this.buildMatrixView, statusBar);
    },
    openOnTravis: function() {
      var domain, nwo;
      nwo = this.getNameWithOwner();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return shell.openExternal("https://" + domain + "/" + nwo);
    },
    consumeStatusBar: function(statusBar) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy90cmF2aXMtY2ktc3RhdHVzL2xpYi90cmF2aXMtY2ktc3RhdHVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1RUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUhELENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsSUFMWCxDQUFBOztBQUFBLEVBT0EsZUFBQSxHQUFrQixJQVBsQixDQUFBOztBQUFBLEVBUUEsZUFBQSxHQUFrQixJQVJsQixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURKO0FBQUEsTUFHQSxtQkFBQSxFQUNJO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLHFDQURUO09BSko7QUFBQSxNQU1BLGtCQUFBLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsUUFEVDtPQVBKO0tBREY7QUFBQSxJQVlBLGVBQUEsRUFBaUIsSUFaakI7QUFBQSxJQWVBLGVBQUEsRUFBaUIsSUFmakI7QUFBQSxJQW9CQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLGlCQUFELEdBQXFCLE9BQU8sQ0FBQyxHQUFSLENBQ25CLElB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

//# sourceURL=/home/epse/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee
