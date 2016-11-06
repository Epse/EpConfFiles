(function() {
  var $, BuildStatusView, GitRepository, TravisCi, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

  GitRepository = require('atom').GitRepository;

  TravisCi = require('travis-ci');

  module.exports = BuildStatusView = (function(_super) {
    __extends(BuildStatusView, _super);

    function BuildStatusView() {
      this.repoStatus = __bind(this.repoStatus, this);
      this.update = __bind(this.update, this);
      this.subscribeToRepo = __bind(this.subscribeToRepo, this);
      return BuildStatusView.__super__.constructor.apply(this, arguments);
    }

    BuildStatusView.content = function() {
      return this.div({
        "class": 'travis-ci-status inline-block'
      }, (function(_this) {
        return function() {
          return _this.span({
            "class": 'build-status icon icon-history',
            outlet: 'status',
            tabindex: -1
          }, '');
        };
      })(this));
    };

    BuildStatusView.prototype.initialize = function(nwo, matrix, statusBar, gfr) {
      this.nwo = nwo;
      this.matrix = matrix;
      this.statusBar = statusBar;
      this.gfr = gfr;
      atom.commands.add('atom-workspace', 'travis-ci-status:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.on('click', (function(_this) {
        return function() {
          return _this.matrix.toggle();
        };
      })(this));
      this.attach();
      this.subscribeToRepo();
      return this.update();
    };

    BuildStatusView.prototype.serialize = function() {};

    BuildStatusView.prototype.attach = function() {
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this,
        priority: 100
      });
    };

    BuildStatusView.prototype.detach = function() {
      var _ref1;
      return (_ref1 = this.statusBarTile) != null ? _ref1.destroy() : void 0;
    };

    BuildStatusView.prototype.destroy = function() {
      return this.detach();
    };

    BuildStatusView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    BuildStatusView.prototype.getActiveItemPath = function() {
      var _ref1;
      return (_ref1 = this.getActiveItem()) != null ? typeof _ref1.getPath === "function" ? _ref1.getPath() : void 0 : void 0;
    };

    BuildStatusView.prototype.getActiveItem = function() {
      return atom.workspace.getActivePaneItem();
    };

    BuildStatusView.prototype.subscribeToRepo = function() {
      if (this.repo != null) {
        this.unsubscribe(this.repo);
      }
      this.repoPromise = Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project)));
      return this.repoPromise.then((function(_this) {
        return function(repos) {
          var repo_list;
          repo_list = repos.filter(function(r) {
            var name;
            if (r != null) {
              name = this.gfr;
              return /(.)*github\.com/i.test(r.getConfigValue("remote." + name + ".url"));
            }
          });
          _this.repo = repo_list[0];
          return _this.repo.onDidChangeStatus(_this.update);
        };
      })(this));
    };

    BuildStatusView.prototype.update = function() {
      var details, token, updateRepo, _ref1;
      if (!this.hasParent()) {
        return;
      }
      this.status.addClass('pending');
      details = this.nwo.split('/');
      updateRepo = (function(_this) {
        return function() {
          if (!navigator.onLine) {
            return _this.status.removeClass('pending success fail');
          }
          return atom.travis.repos(details[0], details[1]).get(_this.repoStatus);
        };
      })(this);
      if (((_ref1 = atom.travis) != null ? _ref1.pro : void 0) != null) {
        token = atom.config.get('travis-ci-status.personalAccessToken');
        return atom.travis.authenticate({
          github_token: token
        }, updateRepo);
      } else {
        return updateRepo();
      }
    };

    BuildStatusView.prototype.fallback = function() {
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: false
      });
      return this.update();
    };

    BuildStatusView.prototype.repoStatus = function(err, data) {
      var _ref1;
      if ((err != null) && (((_ref1 = atom.travis) != null ? _ref1.pro : void 0) != null)) {
        if (err.file === "not found") {
          this.matrix.info('not-found');
          this.status.removeClass('pending success fail');
          this.status.addClass('info');
          return console.log("Error: Repository not found on Travis");
        } else {
          this.status.removeClass('pending success fail');
          this.status.addClass('fail');
          if (err != null) {
            console.log("Error:", err);
          }
        }
        return this.fallback();
      }
      data = data['repo'];
      this.status.removeClass('pending success fail');
      if (data && (data['active'] == null)) {
        this.matrix.info('inactive');
        return this.status.addClass('info');
      } else if (data && data['last_build_state'] === "passed") {
        this.matrix.update(data['last_build_id']);
        return this.status.addClass('success');
      } else {
        return this.status.addClass('fail');
      }
    };

    return BuildStatusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3RyYXZpcy1jaS1zdGF0dXMvbGliL2J1aWxkLXN0YXR1cy12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1REFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosQ0FBQTs7QUFBQSxFQUNDLGdCQUFpQixPQUFBLENBQVEsTUFBUixFQUFqQixhQURELENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVIsQ0FIWCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUVKLHNDQUFBLENBQUE7Ozs7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLCtCQUFQO09BQUwsRUFBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDM0MsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLFlBQUEsT0FBQSxFQUFPLGdDQUFQO0FBQUEsWUFBeUMsTUFBQSxFQUFRLFFBQWpEO0FBQUEsWUFBMkQsUUFBQSxFQUFVLENBQUEsQ0FBckU7V0FBTixFQUErRSxFQUEvRSxFQUQyQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsOEJBUUEsVUFBQSxHQUFZLFNBQUUsR0FBRixFQUFRLE1BQVIsRUFBaUIsU0FBakIsRUFBNkIsR0FBN0IsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE1BQUEsR0FDWixDQUFBO0FBQUEs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/travis-ci-status/lib/build-status-view.coffee
