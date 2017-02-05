Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

var TargetManager = (function (_EventEmitter) {
  _inherits(TargetManager, _EventEmitter);

  function TargetManager() {
    var _this = this;

    _classCallCheck(this, TargetManager);

    _get(Object.getPrototypeOf(TargetManager.prototype), 'constructor', this).call(this);

    var projectPaths = atom.project.getPaths();

    this.pathTargets = projectPaths.map(function (path) {
      return _this._defaultPathTarget(path);
    });

    atom.project.onDidChangePaths(function (newProjectPaths) {
      var addedPaths = newProjectPaths.filter(function (el) {
        return projectPaths.indexOf(el) === -1;
      });
      var removedPaths = projectPaths.filter(function (el) {
        return newProjectPaths.indexOf(el) === -1;
      });
      addedPaths.forEach(function (path) {
        return _this.pathTargets.push(_this._defaultPathTarget(path));
      });
      _this.pathTargets = _this.pathTargets.filter(function (pt) {
        return -1 === removedPaths.indexOf(pt.path);
      });
      _this.refreshTargets(addedPaths);
      projectPaths = newProjectPaths;
    });

    atom.commands.add('atom-workspace', 'build:refresh-targets', function () {
      return _this.refreshTargets();
    });
    atom.commands.add('atom-workspace', 'build:select-active-target', function () {
      return _this.selectActiveTarget();
    });
  }

  _createClass(TargetManager, [{
    key: 'setBusyRegistry',
    value: function setBusyRegistry(registry) {
      this.busyRegistry = registry;
    }
  }, {
    key: '_defaultPathTarget',
    value: function _defaultPathTarget(path) {
      var CompositeDisposable = require('atom').CompositeDisposable;
      return {
        path: path,
        loading: false,
        targets: [],
        instancedTools: [],
        activeTarget: null,
        tools: [],
        subscriptions: new CompositeDisposable()
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.pathTargets.forEach(function (pathTarget) {
        return pathTarget.tools.map(function (tool) {
          tool.removeAllListeners && tool.removeAllListeners('refresh');
          tool.destructor && tool.destructor();
        });
      });
    }
  }, {
    key: 'setTools',
    value: function setTools(tools) {
      this.tools = tools || [];
    }
  }, {
    key: 'refreshTargets',
    value: function refreshTargets(refreshPaths) {
      var _this2 = this;

      refreshPaths = refreshPaths || atom.project.getPaths();

      this.busyRegistry && this.busyRegistry.begin('build.refresh-targets', 'Refreshing targets for ' + refreshPaths.join(','));
      var pathPromises = refreshPaths.map(function (path) {
        var pathTarget = _this2.pathTargets.find(function (pt) {
          return pt.path === path;
        });
        pathTarget.loading = true;

        pathTarget.instancedTools = pathTarget.instancedTools.map(function (t) {
          return t.removeAllListeners && t.removeAllListeners('refresh');
        }).filter(function () {
          return false;
        }); // Just empty the array

        var settingsPromise = _this2.tools.map(function (Tool) {
          return new Tool(path);
        }).filter(function (tool) {
          return tool.isEligible();
        }).map(function (tool) {
          pathTarget.instancedTools.push(tool);
          require('./google-analytics').sendEvent('build', 'tool eligible', tool.getNiceName());

          tool.on && tool.on('refresh', _this2.refreshTargets.bind(_this2, [path]));
          return Promise.resolve().then(function () {
            return tool.settings();
          })['catch'](function (err) {
            if (err instanceof SyntaxError) {
              atom.notifications.addError('Invalid build file.', {
                detail: 'You have a syntax error in your build file: ' + err.message,
                dismissable: true
              });
            } else {
              var toolName = tool.getNiceName();
              atom.notifications.addError('Ooops. Something went wrong' + (toolName ? ' in the ' + toolName + ' build provider' : '') + '.', {
                detail: err.message,
                stack: err.stack,
                dismissable: true
              });
            }
          });
        });

        var CompositeDisposable = require('atom').CompositeDisposable;
        return Promise.all(settingsPromise).then(function (settings) {
          settings = require('./utils').uniquifySettings([].concat.apply([], settings).filter(Boolean).map(function (setting) {
            return require('./utils').getDefaultSettings(path, setting);
          }));

          if (null === pathTarget.activeTarget || !settings.find(function (s) {
            return s.name === pathTarget.activeTarget;
          })) {
            /* Active target has been removed or not set. Set it to the highest prio target */
            pathTarget.activeTarget = settings[0] ? settings[0].name : undefined;
          }

          // CompositeDisposable cannot be reused, so we must create a new instance on every refresh
          pathTarget.subscriptions.dispose();
          pathTarget.subscriptions = new CompositeDisposable();

          settings.forEach(function (setting, index) {
            if (setting.keymap && !setting.atomCommandName) {
              setting.atomCommandName = 'build:trigger:' + setting.name;
            }

            pathTarget.subscriptions.add(atom.commands.add('atom-workspace', setting.atomCommandName, function (atomCommandName) {
              return _this2.emit('trigger', atomCommandName);
            }));

            if (setting.keymap) {
              require('./google-analytics').sendEvent('keymap', 'registered', setting.keymap);
              var keymapSpec = { 'atom-workspace, atom-text-editor': {} };
              keymapSpec['atom-workspace, atom-text-editor'][setting.keymap] = setting.atomCommandName;
              pathTarget.subscriptions.add(atom.keymaps.add(setting.name, keymapSpec));
            }
          });

          pathTarget.targets = settings;
          pathTarget.loading = false;
        })['catch'](function (err) {
          atom.notifications.addError('Ooops. Something went wrong.', {
            detail: err.message,
            stack: err.stack,
            dismissable: true
          });
        });
      });

      return Promise.all(pathPromises).then(function (entries) {
        _this2.fillTargets(require('./utils').activePath());
        _this2.emit('refresh-complete');
        _this2.busyRegistry && _this2.busyRegistry.end('build.refresh-targets');

        if (entries.length === 0) {
          return;
        }

        if (atom.config.get('build.notificationOnRefresh')) {
          var rows = refreshPaths.map(function (path) {
            var pathTarget = _this2.pathTargets.find(function (pt) {
              return pt.path === path;
            });
            if (!pathTarget) {
              return 'Targets ' + path + ' no longer exists. Is build deactivated?';
            }
            return pathTarget.targets.length + ' targets at: ' + path;
          });
          atom.notifications.addInfo('Build targets parsed.', {
            detail: rows.join('\n')
          });
        }
      })['catch'](function (err) {
        atom.notifications.addError('Ooops. Something went wrong.', {
          detail: err.message,
          stack: err.stack,
          dismissable: true
        });
      });
    }
  }, {
    key: 'fillTargets',
    value: function fillTargets(path) {
      var _this3 = this;

      if (!this.targetsView) {
        return;
      }

      var activeTarget = this.getActiveTarget(path);
      activeTarget && this.targetsView.setActiveTarget(activeTarget.name);

      this.getTargets(path).then(function (targets) {
        return targets.map(function (t) {
          return t.name;
        });
      }).then(function (targetNames) {
        return _this3.targetsView && _this3.targetsView.setItems(targetNames);
      });
    }
  }, {
    key: 'selectActiveTarget',
    value: function selectActiveTarget() {
      var _this4 = this;

      if (atom.config.get('build.refreshOnShowTargetList')) {
        this.refreshTargets();
      }

      var path = require('./utils').activePath();
      if (!path) {
        atom.notifications.addWarning('Unable to build.', {
          detail: 'Open file is not part of any open project in Atom'
        });
        return;
      }

      var TargetsView = require('./targets-view');
      this.targetsView = new TargetsView();

      if (this.isLoading(path)) {
        this.targetsView.setLoading('Loading project build targets…');
      } else {
        this.fillTargets(path);
      }

      this.targetsView.awaitSelection().then(function (newTarget) {
        _this4.setActiveTarget(path, newTarget);

        _this4.targetsView = null;
      })['catch'](function (err) {
        _this4.targetsView.setError(err.message);
        _this4.targetsView = null;
      });
    }
  }, {
    key: 'getTargets',
    value: function getTargets(path) {
      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return Promise.resolve([]);
      }

      if (pathTarget.targets.length === 0) {
        return this.refreshTargets([pathTarget.path]).then(function () {
          return pathTarget.targets;
        });
      }
      return Promise.resolve(pathTarget.targets);
    }
  }, {
    key: 'getActiveTarget',
    value: function getActiveTarget(path) {
      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return null;
      }
      return pathTarget.targets.find(function (target) {
        return target.name === pathTarget.activeTarget;
      });
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(path, targetName) {
      this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).activeTarget = targetName;
      this.emit('new-active-target', path, this.getActiveTarget(path));
    }
  }, {
    key: 'isLoading',
    value: function isLoading(path) {
      return this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).loading;
    }
  }]);

  return TargetManager;
})(_events2['default']);

exports['default'] = TargetManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0LW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRXlCLFFBQVE7Ozs7QUFGakMsV0FBVyxDQUFDOztJQUlOLGFBQWE7WUFBYixhQUFhOztBQUNOLFdBRFAsYUFBYSxHQUNIOzs7MEJBRFYsYUFBYTs7QUFFZiwrQkFGRSxhQUFhLDZDQUVQOztBQUVSLFFBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRTNDLFFBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7YUFBSSxNQUFLLGtCQUFrQixDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFM0UsUUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLGVBQWUsRUFBSTtBQUMvQyxVQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pGLFVBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBQSxFQUFFO2VBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDbkYsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2VBQUksTUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQUssa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDakYsWUFBSyxXQUFXLEdBQUcsTUFBSyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxPQUFPLENBQUMs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QUMsVUFBQSxNQUFNO2VBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsWUFBWTtPQUFBLENBQUMsQ0FBQztLQUNuRjs7O1dBRWMseUJBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtBQUNoQyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFBLEVBQUU7ZUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUk7T0FBQSxDQUFDLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztBQUN4RSxVQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbEU7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQSxFQUFFO2VBQUksRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJO09BQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQztLQUM5RDs7O1NBdk9HLGFBQWE7OztxQkEwT0osYUFBYSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3RhcmdldC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcblxuY2xhc3MgVGFyZ2V0TWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBsZXQgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG5cbiAgICB0aGlzLnBhdGhUYXJnZXRzID0gcHJvamVjdFBhdGhzLm1hcChwYXRoID0+IHRoaXMuX2RlZmF1bHRQYXRoVGFyZ2V0KHBhdGgpKTtcblxuICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKG5ld1Byb2plY3RQYXRocyA9PiB7XG4gICAgICBjb25zdCBhZGRlZFBhdGhzID0gbmV3UHJvamVjdFBhdGhzLmZpbHRlcihlbCA9PiBwcm9qZWN0UGF0aHMuaW5kZXhPZihlbCkgPT09IC0xKTtcbiAgICAgIGNvbnN0IHJlbW92ZWRQYXRocyA9IHByb2plY3RQYXRocy5maWx0ZXIoZWwgPT4gbmV3UHJvamVjdFBhdGhzLmluZGV4T2YoZWwpID09PSAtMSk7XG4gICAgICBhZGRlZFBhdGhzLmZvckVhY2gocGF0aCA9PiB0aGlzLnBhdGhUYXJnZXRzLnB1c2godGhpcy5fZGVmYXVsdFBhdGhUYXJnZXQocGF0aCkpKTtcbiAgICAgIHRoaXMucGF0aFRhcmdldHMgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbHRlcihwdCA9PiAtMSA9PT0gcmVtb3ZlZFBhdGhzLmluZGV4T2YocHQucGF0aCkpO1xuICAgICAgdGhpcy5yZWZyZXNoVGFyZ2V0cyhhZGRlZFBhdGhzKTtcbiAgICAgIHByb2plY3RQYXRocyA9IG5ld1Byb2plY3RQYXRocztcbiAgICB9KTtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpyZWZyZXNoLXRhcmdldHMnLCAoKSA9PiB0aGlzLnJlZnJlc2hUYXJnZXRzKCkpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpzZWxlY3QtYWN0aXZlLXRhcmdldCcsICgpID0+IHRoaXMuc2VsZWN0QWN0aXZlVGFyZ2V0KCkpO1xuICB9XG5cbiAgc2V0QnVzeVJlZ2lzdHJ5KHJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5idXN5UmVnaXN0cnkgPSByZWdpc3RyeTtcbiAgfVxuXG4gIF9kZWZhdWx0UGF0aFRhcmdldChwYXRoKSB7XG4gICAgY29uc3QgQ29tcG9zaXRlRGlzcG9zYWJsZSA9IHJlcXVpcmUoJ2F0b20nKS5Db21wb3NpdGVEaXNwb3NhYmxlO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBwYXRoLFxuICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICB0YXJnZXRzOiBbXSxcbiAgICAgIGluc3RhbmNlZFRvb2xzOiBbXSxcbiAgICAgIGFjdGl2ZVRhcmdldDogbnVsbCxcbiAgICAgIHRvb2xzOiBbXSxcbiAgICAgIHN1YnNjcmlwdGlvbnM6IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB9O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnBhdGhUYXJnZXRzLmZvckVhY2gocGF0aFRhcmdldCA9PiBwYXRoVGFyZ2V0LnRvb2xzLm1hcCh0b29sID0+IHtcbiAgICAgIHRvb2wucmVtb3ZlQWxsTGlzdGVuZXJzICYmIHRvb2wucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZWZyZXNoJyk7XG4gICAgICB0b29sLmRlc3RydWN0b3IgJiYgdG9vbC5kZXN0cnVjdG9yKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgc2V0VG9vbHModG9vbHMpIHtcbiAgICB0aGlzLnRvb2xzID0gdG9vbHMgfHwgW107XG4gIH1cblxuICByZWZyZXNoVGFyZ2V0cyhyZWZyZXNoUGF0aHMpIHtcbiAgICByZWZyZXNoUGF0aHMgPSByZWZyZXNoUGF0aHMgfHwgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG5cbiAgICB0aGlzLmJ1c3lSZWdpc3RyeSAmJiB0aGlzLmJ1c3lSZWdpc3RyeS5iZWdpbignYnVpbGQucmVmcmVzaC10YXJnZXRzJywgYFJlZnJlc2hpbmcgdGFyZ2V0cyBmb3IgJHtyZWZyZXNoUGF0aHMuam9pbignLCcpfWApO1xuICAgIGNvbnN0IHBhdGhQcm9taXNlcyA9IHJlZnJlc2hQYXRocy5tYXAoKHBhdGgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgICBwYXRoVGFyZ2V0LmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICBwYXRoVGFyZ2V0Lmluc3RhbmNlZFRvb2xzID0gcGF0aFRhcmdldC5pbnN0YW5jZWRUb29sc1xuICAgICAgICAubWFwKHQgPT4gdC5yZW1vdmVBbGxMaXN0ZW5lcnMgJiYgdC5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlZnJlc2gnKSlcbiAgICAgICAgLmZpbHRlcigoKSA9PiBmYWxzZSk7IC8vIEp1c3QgZW1wdHkgdGhlIGFycmF5XG5cbiAgICAgIGNvbnN0IHNldHRpbmdzUHJvbWlzZSA9IHRoaXMudG9vbHNcbiAgICAgICAgLm1hcChUb29sID0+IG5ldyBUb29sKHBhdGgpKVxuICAgICAgICAuZmlsdGVyKHRvb2wgPT4gdG9vbC5pc0VsaWdpYmxlKCkpXG4gICAgICAgIC5tYXAodG9vbCA9PiB7XG4gICAgICAgICAgcGF0aFRhcmdldC5pbnN0YW5jZWRUb29scy5wdXNoKHRvb2wpO1xuICAgICAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnYnVpbGQnLCAndG9vbCBlbGlnaWJsZScsIHRvb2wuZ2V0TmljZU5hbWUoKSk7XG5cbiAgICAgICAgICB0b29sLm9uICYmIHRvb2wub24oJ3JlZnJlc2gnLCB0aGlzLnJlZnJlc2hUYXJnZXRzLmJpbmQodGhpcywgWyBwYXRoIF0pKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRvb2wuc2V0dGluZ3MoKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgYnVpbGQgZmlsZS4nLCB7XG4gICAgICAgICAgICAgICAgICBkZXRhaWw6ICdZb3UgaGF2ZSBhIHN5bnRheCBlcnJvciBpbiB5b3VyIGJ1aWxkIGZpbGU6ICcgKyBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vbE5hbWUgPSB0b29sLmdldE5pY2VOYW1lKCk7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPb29wcy4gU29tZXRoaW5nIHdlbnQgd3JvbmcnICsgKHRvb2xOYW1lID8gJyBpbiB0aGUgJyArIHRvb2xOYW1lICsgJyBidWlsZCBwcm92aWRlcicgOiAnJykgKyAnLicsIHtcbiAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBDb21wb3NpdGVEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGU7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoc2V0dGluZ3NQcm9taXNlKS50aGVuKChzZXR0aW5ncykgPT4ge1xuICAgICAgICBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vdXRpbHMnKS51bmlxdWlmeVNldHRpbmdzKFtdLmNvbmNhdC5hcHBseShbXSwgc2V0dGluZ3MpXG4gICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgIC5tYXAoc2V0dGluZyA9PiByZXF1aXJlKCcuL3V0aWxzJykuZ2V0RGVmYXVsdFNldHRpbmdzKHBhdGgsIHNldHRpbmcpKSk7XG5cbiAgICAgICAgaWYgKG51bGwgPT09IHBhdGhUYXJnZXQuYWN0aXZlVGFyZ2V0IHx8ICFzZXR0aW5ncy5maW5kKHMgPT4gcy5uYW1lID09PSBwYXRoVGFyZ2V0LmFjdGl2ZVRhcmdldCkpIHtcbiAgICAgICAgICAvKiBBY3RpdmUgdGFyZ2V0IGhhcyBiZWVuIHJlbW92ZWQgb3Igbm90IHNldC4gU2V0IGl0IHRvIHRoZSBoaWdoZXN0IHByaW8gdGFyZ2V0ICovXG4gICAgICAgICAgcGF0aFRhcmdldC5hY3RpdmVUYXJnZXQgPSBzZXR0aW5nc1swXSA/IHNldHRpbmdzWzBdLm5hbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb21wb3NpdGVEaXNwb3NhYmxlIGNhbm5vdCBiZSByZXVzZWQsIHNvIHdlIG11c3QgY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9uIGV2ZXJ5IHJlZnJlc2hcbiAgICAgICAgcGF0aFRhcmdldC5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgcGF0aFRhcmdldC5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgICAgICBzZXR0aW5ncy5mb3JFYWNoKChzZXR0aW5nLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChzZXR0aW5nLmtleW1hcCAmJiAhc2V0dGluZy5hdG9tQ29tbWFuZE5hbWUpIHtcbiAgICAgICAgICAgIHNldHRpbmcuYXRvbUNvbW1hbmROYW1lID0gYGJ1aWxkOnRyaWdnZXI6JHtzZXR0aW5nLm5hbWV9YDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoVGFyZ2V0LnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHNldHRpbmcuYXRvbUNvbW1hbmROYW1lLCBhdG9tQ29tbWFuZE5hbWUgPT4gdGhpcy5lbWl0KCd0cmlnZ2VyJywgYXRvbUNvbW1hbmROYW1lKSkpO1xuXG4gICAgICAgICAgaWYgKHNldHRpbmcua2V5bWFwKSB7XG4gICAgICAgICAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2tleW1hcCcsICdyZWdpc3RlcmVkJywgc2V0dGluZy5rZXltYXApO1xuICAgICAgICAgICAgY29uc3Qga2V5bWFwU3BlYyA9IHsgJ2F0b20td29ya3NwYWNlLCBhdG9tLXRleHQtZWRpdG9yJzoge30gfTtcbiAgICAgICAgICAgIGtleW1hcFNwZWNbJ2F0b20td29ya3NwYWNlLCBhdG9tLXRleHQtZWRpdG9yJ11bc2V0dGluZy5rZXltYXBdID0gc2V0dGluZy5hdG9tQ29tbWFuZE5hbWU7XG4gICAgICAgICAgICBwYXRoVGFyZ2V0LnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ua2V5bWFwcy5hZGQoc2V0dGluZy5uYW1lLCBrZXltYXBTcGVjKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwYXRoVGFyZ2V0LnRhcmdldHMgPSBzZXR0aW5ncztcbiAgICAgICAgcGF0aFRhcmdldC5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ09vb3BzLiBTb21ldGhpbmcgd2VudCB3cm9uZy4nLCB7XG4gICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocGF0aFByb21pc2VzKS50aGVuKGVudHJpZXMgPT4ge1xuICAgICAgdGhpcy5maWxsVGFyZ2V0cyhyZXF1aXJlKCcuL3V0aWxzJykuYWN0aXZlUGF0aCgpKTtcbiAgICAgIHRoaXMuZW1pdCgncmVmcmVzaC1jb21wbGV0ZScpO1xuICAgICAgdGhpcy5idXN5UmVnaXN0cnkgJiYgdGhpcy5idXN5UmVnaXN0cnkuZW5kKCdidWlsZC5yZWZyZXNoLXRhcmdldHMnKTtcblxuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJykpIHtcbiAgICAgICAgY29uc3Qgcm93cyA9IHJlZnJlc2hQYXRocy5tYXAocGF0aCA9PiB7XG4gICAgICAgICAgY29uc3QgcGF0aFRhcmdldCA9IHRoaXMucGF0aFRhcmdldHMuZmluZChwdCA9PiBwdC5wYXRoID09PSBwYXRoKTtcbiAgICAgICAgICBpZiAoIXBhdGhUYXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBgVGFyZ2V0cyAke3BhdGh9IG5vIGxvbmdlciBleGlzdHMuIElzIGJ1aWxkIGRlYWN0aXZhdGVkP2A7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBgJHtwYXRoVGFyZ2V0LnRhcmdldHMubGVuZ3RofSB0YXJnZXRzIGF0OiAke3BhdGh9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZCB0YXJnZXRzIHBhcnNlZC4nLCB7XG4gICAgICAgICAgZGV0YWlsOiByb3dzLmpvaW4oJ1xcbicpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ09vb3BzLiBTb21ldGhpbmcgd2VudCB3cm9uZy4nLCB7XG4gICAgICAgIGRldGFpbDogZXJyLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbGxUYXJnZXRzKHBhdGgpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0c1ZpZXcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVUYXJnZXQgPSB0aGlzLmdldEFjdGl2ZVRhcmdldChwYXRoKTtcbiAgICBhY3RpdmVUYXJnZXQgJiYgdGhpcy50YXJnZXRzVmlldy5zZXRBY3RpdmVUYXJnZXQoYWN0aXZlVGFyZ2V0Lm5hbWUpO1xuXG4gICAgdGhpcy5nZXRUYXJnZXRzKHBhdGgpXG4gICAgICAudGhlbih0YXJnZXRzID0+IHRhcmdldHMubWFwKHQgPT4gdC5uYW1lKSlcbiAgICAgIC50aGVuKHRhcmdldE5hbWVzID0+IHRoaXMudGFyZ2V0c1ZpZXcgJiYgdGhpcy50YXJnZXRzVmlldy5zZXRJdGVtcyh0YXJnZXROYW1lcykpO1xuICB9XG5cbiAgc2VsZWN0QWN0aXZlVGFyZ2V0KCkge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnJlZnJlc2hPblNob3dUYXJnZXRMaXN0JykpIHtcbiAgICAgIHRoaXMucmVmcmVzaFRhcmdldHMoKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgnLi91dGlscycpLmFjdGl2ZVBhdGgoKTtcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdVbmFibGUgdG8gYnVpbGQuJywge1xuICAgICAgICBkZXRhaWw6ICdPcGVuIGZpbGUgaXMgbm90IHBhcnQgb2YgYW55IG9wZW4gcHJvamVjdCBpbiBBdG9tJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgVGFyZ2V0c1ZpZXcgPSByZXF1aXJlKCcuL3RhcmdldHMtdmlldycpO1xuICAgIHRoaXMudGFyZ2V0c1ZpZXcgPSBuZXcgVGFyZ2V0c1ZpZXcoKTtcblxuICAgIGlmICh0aGlzLmlzTG9hZGluZyhwYXRoKSkge1xuICAgICAgdGhpcy50YXJnZXRzVmlldy5zZXRMb2FkaW5nKCdMb2FkaW5nIHByb2plY3QgYnVpbGQgdGFyZ2V0c1xcdTIwMjYnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maWxsVGFyZ2V0cyhwYXRoKTtcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldHNWaWV3LmF3YWl0U2VsZWN0aW9uKCkudGhlbihuZXdUYXJnZXQgPT4ge1xuICAgICAgdGhpcy5zZXRBY3RpdmVUYXJnZXQocGF0aCwgbmV3VGFyZ2V0KTtcblxuICAgICAgdGhpcy50YXJnZXRzVmlldyA9IG51bGw7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy50YXJnZXRzVmlldy5zZXRFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICB0aGlzLnRhcmdldHNWaWV3ID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFRhcmdldHMocGF0aCkge1xuICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgaWYgKCFwYXRoVGFyZ2V0KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICBpZiAocGF0aFRhcmdldC50YXJnZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFRhcmdldHMoWyBwYXRoVGFyZ2V0LnBhdGggXSkudGhlbigoKSA9PiBwYXRoVGFyZ2V0LnRhcmdldHMpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBhdGhUYXJnZXQudGFyZ2V0cyk7XG4gIH1cblxuICBnZXRBY3RpdmVUYXJnZXQocGF0aCkge1xuICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgaWYgKCFwYXRoVGFyZ2V0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUYXJnZXQudGFyZ2V0cy5maW5kKHRhcmdldCA9PiB0YXJnZXQubmFtZSA9PT0gcGF0aFRhcmdldC5hY3RpdmVUYXJnZXQpO1xuICB9XG5cbiAgc2V0QWN0aXZlVGFyZ2V0KHBhdGgsIHRhcmdldE5hbWUpIHtcbiAgICB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCkuYWN0aXZlVGFyZ2V0ID0gdGFyZ2V0TmFtZTtcbiAgICB0aGlzLmVtaXQoJ25ldy1hY3RpdmUtdGFyZ2V0JywgcGF0aCwgdGhpcy5nZXRBY3RpdmVUYXJnZXQocGF0aCkpO1xuICB9XG5cbiAgaXNMb2FkaW5nKHBhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoVGFyZ2V0cy5maW5kKHB0ID0+IHB0LnBhdGggPT09IHBhdGgpLmxvYWRpbmc7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFyZ2V0TWFuYWdlcjtcbiJdfQ==