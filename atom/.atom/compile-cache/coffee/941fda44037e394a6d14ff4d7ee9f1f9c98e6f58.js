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
      this.info = __bind(this.info, this);
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

    BuildMatrixView.prototype.info = function(status) {
      var display;
      switch (status) {
        case 'not-found':
          display = 'was not found on Travis!';
          break;
        case 'inactive':
          display = 'is not enabled on Travis!';
      }
      return this.title.text('Repository ' + this.nwo + ' ' + display);
    };

    BuildMatrixView.prototype.buildMatrix = function(err, data) {
      var build, duration, finished_at, number, _i, _len, _ref, _results;
      this.matrix.removeClass('pending success fail');
      if (err != null) {
        return console.log("Error:", err);
      }
      number = data['build']['number'];
      finished_at = new Date(data['build']['finished_at']).toLocaleString();
      if (data['build']['duration']) {
        duration = data['build']['duration'].toString();
        this.title.text("Build " + number + " finished at " + finished_at + " took " + (duration.formattedDuration()));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3RyYXZpcy1jaS1zdGF0dXMvbGliL2J1aWxkLW1hdHJpeC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsT0FBQSxDQUFRLGNBQVIsQ0FGQSxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUVKLHNDQUFBLENBQUE7Ozs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxRUFBUDtBQUFBLFFBQThFLFFBQUEsRUFBVSxDQUFBLENBQXhGO09BQUwsRUFBaUcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDL0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG9CQUFQO1dBQUwsRUFBa0MsU0FBQSxHQUFBO21CQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLGNBQWtCLE1BQUEsRUFBUSxRQUExQjthQUFMLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLGdCQUF1QixNQUFBLEVBQVEsT0FBL0I7ZUFBSCxFQUEyQyx5QkFBM0MsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxnQkFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGdCQUFpQixNQUFBLEVB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/travis-ci-status/lib/build-matrix-view.coffee
