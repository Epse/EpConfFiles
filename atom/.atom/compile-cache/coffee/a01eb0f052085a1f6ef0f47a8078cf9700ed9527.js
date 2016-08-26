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

    BuildStatusView.prototype.initialize = function(nwo, matrix, statusBar) {
      this.nwo = nwo;
      this.matrix = matrix;
      this.statusBar = statusBar;
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
          var name, repo_list;
          name = atom.config.get('travis-ci-status.travisCiRemoteName');
          repo_list = repos.filter(function(r) {
            return /(.)*github\.com/i.test(r.getConfigValue("remote." + name + ".url"));
          });
          _this.repo = repo_list[0];
          console.log("DEBUG: ", _this.repo);
          return _this.repo.onDidChangeStatus(_this.update);
        };
      })(this));
    };

    BuildStatusView.prototype.update = function() {
      var details, token, updateRepo, _ref1;
      console.log(this);
      if (!this.hasParent()) {
        return;
      }
      this.status.addClass('pending');
      details = this.nwo.split('/');
      updateRepo = (function(_this) {
        return function() {
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
        return this.fallback();
      }
      if (data['files'] === 'not found') {
        return;
      }
      if (err != null) {
        return console.log("Error:", err);
      }
      data = data['repo'];
      this.status.removeClass('pending success fail');
      if (data && data['last_build_state'] === "passed") {
        this.matrix.update(data['last_build_id']);
        return this.status.addClass('success');
      } else {
        return this.status.addClass('fail');
      }
    };

    return BuildStatusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy90cmF2aXMtY2ktc3RhdHVzL2xpYi9idWlsZC1zdGF0dXMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdURBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBQSxDQUFELEVBQUksWUFBQSxJQUFKLENBQUE7O0FBQUEsRUFDQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFERCxDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywrQkFBUDtPQUFMLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzNDLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxnQ0FBUDtBQUFBLFlBQXlDLE1BQUEsRUFBUSxRQUFqRDtBQUFBLFlBQTJELFFBQUEsRUFBVSxDQUFBLENBQXJFO1dBQU4sRUFBK0UsRUFBL0UsRUFEMkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDhCQVFBLFVBQUEsR0FBWSxTQUFFLEdBQUYsRUFBUSxNQUFSLEVBQWlCLFNBQWpCLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxNQUFBLEdBQ1osQ0FBQTtBQUFBLE1BRGlCLElBQUMsQ0FBQSxTQUFBLE1BQ2xCLENB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

//# sourceURL=/home/epse/.atom/packages/travis-ci-status/lib/build-status-view.coffee
