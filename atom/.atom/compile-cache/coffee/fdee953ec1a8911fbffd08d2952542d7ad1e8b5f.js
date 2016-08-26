(function() {
  var BuildMatrixView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  require('./extensions');

  module.exports = BuildMatrixView = (function(_super) {
    __extends(BuildMatrixView, _super);

    function BuildMatrixView() {
      this.addBuild = __bind(this.addBuild, this);
      this.buildMatrix = __bind(this.buildMatrix, this);
      this.update = __bind(this.update, this);
      return BuildMatrixView.__super__.constructor.apply(this, arguments);
    }

    BuildMatrixView.content = function() {
      return this.div({
        "class": 'travis-ci-status tool-panel panel-bottom padded native-key-bindings',
        tabIndex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'build-matrix block'
          }, function() {
            return _this.div({
              "class": 'message',
              outlet: 'matrix'
            }, function() {
              _this.p({
                "class": 'matrix-title',
                outlet: 'title'
              }, 'No build matrix fetched');
              return _this.ul({
                "class": 'builds',
                outlet: 'builds'
              });
            });
          });
        };
      })(this));
    };

    BuildMatrixView.prototype.initialize = function(nwo) {
      this.nwo = nwo;
      this.matrix.css('font-size', "" + (atom.config.get('editor.fontSize')) + "px");
      return atom.commands.add('atom-workspace', 'travis-ci-status:toggle-build-matrix', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    BuildMatrixView.prototype.serialize = function() {};

    BuildMatrixView.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this
      });
    };

    BuildMatrixView.prototype.destroy = function() {
      return this.detach();
    };

    BuildMatrixView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    BuildMatrixView.prototype.update = function(buildId) {
      var details;
      this.title.text('Fetching build matrix...');
      details = this.nwo.split('/');
      return atom.travis.repos(details[0], details[1]).builds(buildId).get(this.buildMatrix);
    };

    BuildMatrixView.prototype.buildMatrix = function(err, data) {
      var build, duration, number, _i, _len, _ref, _results;
      this.matrix.removeClass('pending success fail');
      if (err != null) {
        return console.log("Error:", err);
      }
      number = data['build']['number'];
      if (data['build']['duration']) {
        duration = data['build']['duration'].toString();
        this.title.text("Build " + number + " took " + (duration.formattedDuration()));
        this.builds.empty();
        _ref = data['jobs'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          build = _ref[_i];
          _results.push(this.addBuild(build));
        }
        return _results;
      }
    };

    BuildMatrixView.prototype.addBuild = function(build) {
      var domain, duration, finished, started, status;
      status = build['state'] === 'passed' ? 'success' : 'fail';
      started = new Date(build['started_at']);
      finished = new Date(build['finished_at']);
      duration = ((finished - started) / 1000).toString();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return this.builds.append("<li class='" + status + "'>\n  " + build['number'] + " - " + (duration.formattedDuration()) + "\n  (<a target=\"_new\" href=\"https://" + domain + "/" + this.nwo + "/builds/" + build['build_id'] + "\">details</a>)\n</li>");
    };

    return BuildMatrixView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy90cmF2aXMtY2ktc3RhdHVzL2xpYi9idWlsZC1tYXRyaXgtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsQ0FBUSxjQUFSLENBRkEsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxRUFBUDtBQUFBLFFBQThFLFFBQUEsRUFBVSxDQUFBLENBQXhGO09BQUwsRUFBaUcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDL0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG9CQUFQO1dBQUwsRUFBa0MsU0FBQSxHQUFBO21CQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLGNBQWtCLE1BQUEsRUFBUSxRQUExQjthQUFMLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLGdCQUF1QixNQUFBLEVBQVEsT0FBL0I7ZUFBSCxFQUEyQyx5QkFBM0MsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxnQkFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGdCQUFpQixNQUFBLEVBQVEsUUFBekI7ZUFBSixFQUZ1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

//# sourceURL=/home/epse/.atom/packages/travis-ci-status/lib/build-matrix-view.coffee
