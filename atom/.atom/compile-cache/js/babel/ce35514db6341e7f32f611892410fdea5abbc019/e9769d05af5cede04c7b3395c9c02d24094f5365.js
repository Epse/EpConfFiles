'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

exports['default'] = {
  config: require('./config'),

  activate: function activate() {
    var _this = this;

    if (!/^win/.test(process.platform)) {
      // Manually append /usr/local/bin as it may not be set on some systems,
      // and it's common to have node installed here. Keep it at end so it won't
      // accidentially override any other node installation

      // Note: This should probably be removed in a end-user friendly way...
      process.env.PATH += ':/usr/local/bin';
    }

    require('atom-package-deps').install('build');

    this.tools = [require('./atom-build')];
    this.linter = null;

    this.setupTargetManager();
    this.setupBuildView();
    this.setupErrorMatcher();

    atom.commands.add('atom-workspace', 'build:trigger', function () {
      return _this.build('trigger');
    });
    atom.commands.add('atom-workspace', 'build:stop', function () {
      return _this.stop();
    });
    atom.commands.add('atom-workspace', 'build:confirm', function () {
      require('./google-analytics').sendEvent('build', 'confirmed');
      document.activeElement.click();
    });
    atom.commands.add('atom-workspace', 'build:no-confirm', function () {
      if (_this.saveConfirmView) {
        require('./google-analytics').sendEvent('build', 'not confirmed');
        _this.saveConfirmView.cancel();
      }
    });

    atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (atom.config.get('build.buildOnSave')) {
          _this.build('save');
        }
      });
    });

    atom.workspace.onDidChangeActivePaneItem(function () {
      return _this.updateStatusBar();
    });
    atom.packages.onDidActivateInitialPackages(function () {
      return _this.targetManager.refreshTargets();
    });
  },

  setupTargetManager: function setupTargetManager() {
    var _this2 = this;

    var TargetManager = require('./target-manager');
    this.targetManager = new TargetManager();
    this.targetManager.setTools(this.tools);
    this.targetManager.on('refresh-complete', function () {
      _this2.updateStatusBar();
    });
    this.targetManager.on('new-active-target', function (path, target) {
      _this2.updateStatusBar();

      if (atom.config.get('build.selectTriggers')) {
        _this2.build('trigger');
      }
    });
    this.targetManager.on('trigger', function (atomCommandName) {
      return _this2.build('trigger', atomCommandName);
    });
  },

  setupBuildView: function setupBuildView() {
    var BuildView = require('./build-view');
    this.buildView = new BuildView();
  },

  setupErrorMatcher: function setupErrorMatcher() {
    var _this3 = this;

    var ErrorMatcher = require('./error-matcher');
    this.errorMatcher = new ErrorMatcher();
    this.errorMatcher.on('error', function (message) {
      atom.notifications.addError('Error matching failed!', { detail: message });
    });
    this.errorMatcher.on('matched', function (match) {
      match[0] && _this3.buildView.scrollTo(match[0]);
    });
  },

  deactivate: function deactivate() {
    if (this.child) {
      this.child.removeAllListeners();
      require('tree-kill')(this.child.pid, 'SIGKILL');
      this.child = null;
    }

    this.statusBarView && this.statusBarView.destroy();
    this.buildView && this.buildView.destroy();
    this.saveConfirmView && this.saveConfirmView.destroy();
    this.linter && this.linter.destroy();
    this.targetManager.destroy();

    clearTimeout(this.finishedTimer);
  },

  updateStatusBar: function updateStatusBar() {
    var path = require('./utils').activePath();
    var activeTarget = this.targetManager.getActiveTarget(path);
    this.statusBarView && activeTarget && this.statusBarView.setTarget(activeTarget.name);
  },

  startNewBuild: function startNewBuild(source, atomCommandName) {
    var _this4 = this;

    var BuildError = require('./build-error');
    var path = require('./utils').activePath();
    var buildTitle = '';
    this.linter && this.linter.clear();

    Promise.resolve(this.targetManager.getTargets(path)).then(function (targets) {
      if (!targets || 0 === targets.length) {
        throw new BuildError('No eligible build target.', 'No configuration to build this project exists.');
      }

      var target = targets.find(function (t) {
        return t.atomCommandName === atomCommandName;
      });
      if (!target) {
        target = _this4.targetManager.getActiveTarget(path);
      }
      require('./google-analytics').sendEvent('build', 'triggered');

      if (!target.exec) {
        throw new BuildError('Invalid build file.', 'No executable command specified.');
      }

      _this4.statusBarView && _this4.statusBarView.buildStarted();
      _this4.busyRegistry && _this4.busyRegistry.begin('build.' + target.name, '' + target.name);
      _this4.buildView.buildStarted();
      _this4.buildView.setHeading('Running preBuild...');

      return Promise.resolve(target.preBuild ? target.preBuild() : null).then(function () {
        return target;
      });
    }).then(function (target) {
      var replace = require('./utils').replace;
      var env = Object.assign({}, process.env, target.env);
      Object.keys(env).forEach(function (key) {
        env[key] = replace(env[key], target.env);
      });

      var exec = replace(target.exec, target.env);
      var args = target.args.map(function (arg) {
        return replace(arg, target.env);
      });
      var cwd = replace(target.cwd, target.env);
      var isWin = process.platform === 'win32';
      var shCmd = isWin ? 'cmd' : '/bin/sh';
      var shCmdArg = isWin ? '/C' : '-c';

      // Store this as we need to re-set it after postBuild
      buildTitle = [target.sh ? shCmd + ' ' + shCmdArg + ' ' + exec : exec].concat(_toConsumableArray(args), ['\n']).join(' ');

      _this4.buildView.setHeading(buildTitle);
      if (target.sh) {
        _this4.child = require('child_process').spawn(shCmd, [shCmdArg, [exec].concat(args).join(' ')], { cwd: cwd, env: env });
      } else {
        _this4.child = require('cross-spawn').spawn(exec, args, { cwd: cwd, env: env });
      }

      var stdout = '';
      var stderr = '';
      _this4.child.stdout.setEncoding('utf8');
      _this4.child.stderr.setEncoding('utf8');
      _this4.child.stdout.on('data', function (d) {
        return stdout += d;
      });
      _this4.child.stderr.on('data', function (d) {
        return stderr += d;
      });
      _this4.child.stdout.pipe(_this4.buildView.terminal);
      _this4.child.stderr.pipe(_this4.buildView.terminal);
      _this4.child.killSignals = (target.killSignals || ['SIGINT', 'SIGTERM', 'SIGKILL']).slice();

      _this4.child.on('error', function (err) {
        _this4.buildView.terminal.write((target.sh ? 'Unable to execute with shell: ' : 'Unable to execute: ') + exec + '\n');

        if (/\s/.test(exec) && !target.sh) {
          _this4.buildView.terminal.write('`cmd` cannot contain space. Use `args` for arguments.\n');
        }

        if ('ENOENT' === err.code) {
          _this4.buildView.terminal.write('Make sure cmd:\'' + exec + '\' and cwd:\'' + cwd + '\' exists and have correct access permissions.\n');
          _this4.buildView.terminal.write('Binaries are found in these folders: ' + process.env.PATH + '\n');
        }
      });

      _this4.child.on('close', function (exitCode) {
        _this4.child = null;
        _this4.errorMatcher.set(target, cwd, stdout + stderr);

        var success = 0 === exitCode;
        if (atom.config.get('build.matchedErrorFailsBuild')) {
          success = success && !_this4.errorMatcher.getMatches().some(function (match) {
            return match.type && match.type.toLowerCase() === 'error';
          });
        }

        _this4.linter && _this4.linter.processMessages(_this4.errorMatcher.getMatches(), cwd);

        if (atom.config.get('build.beepWhenDone')) {
          atom.beep();
        }

        _this4.buildView.setHeading('Running postBuild...');
        return Promise.resolve(target.postBuild ? target.postBuild(success, stdout, stderr) : null).then(function () {
          _this4.buildView.setHeading(buildTitle);

          _this4.busyRegistry && _this4.busyRegistry.end('build.' + target.name, success);
          _this4.buildView.buildFinished(success);
          _this4.statusBarView && _this4.statusBarView.setBuildSuccess(success);
          if (success) {
            require('./google-analytics').sendEvent('build', 'succeeded');
            _this4.finishedTimer = setTimeout(function () {
              _this4.buildView.detach();
            }, 1200);
          } else {
            if (atom.config.get('build.scrollOnError')) {
              _this4.errorMatcher.matchFirst();
            }
            require('./google-analytics').sendEvent('build', 'failed');
          }

          _this4.nextBuild && _this4.nextBuild();
          _this4.nextBuild = null;
        });
      });
    })['catch'](function (err) {
      if (err instanceof BuildError) {
        if (source === 'save') {
          // If there is no eligible build tool, and cause of build was a save, stay quiet.
          return;
        }

        atom.notifications.addWarning(err.name, { detail: err.message, stack: err.stack });
      } else {
        atom.notifications.addError('Failed to build.', { detail: err.message, stack: err.stack });
      }
    });
  },

  sendNextSignal: function sendNextSignal() {
    try {
      var signal = this.child.killSignals.shift();
      require('tree-kill')(this.child.pid, signal);
    } catch (e) {
      /* Something may have happened to the child (e.g. terminated by itself). Ignore this. */
    }
  },

  abort: function abort(cb) {
    var _this5 = this;

    if (!this.child.killed) {
      this.buildView.buildAbortInitiated();
      this.child.killed = true;
      this.child.on('exit', function () {
        _this5.child = null;
        cb && cb();
      });
    }

    this.sendNextSignal();
  },

  build: function build(source, event) {
    var _this6 = this;

    clearTimeout(this.finishedTimer);

    this.doSaveConfirm(this.unsavedTextEditors(), function () {
      var nextBuild = _this6.startNewBuild.bind(_this6, source, event ? event.type : null);
      if (_this6.child) {
        _this6.nextBuild = nextBuild;
        return _this6.abort();
      }
      return nextBuild();
    });
  },

  doSaveConfirm: function doSaveConfirm(modifiedTextEditors, continuecb, cancelcb) {
    var saveAndContinue = function saveAndContinue(save) {
      modifiedTextEditors.forEach(function (textEditor) {
        return save && textEditor.save();
      });
      continuecb();
    };

    if (0 === modifiedTextEditors.length || atom.config.get('build.saveOnBuild')) {
      saveAndContinue(true);
      return;
    }

    if (this.saveConfirmView) {
      this.saveConfirmView.destroy();
    }

    var SaveConfirmView = require('./save-confirm-view');
    this.saveConfirmView = new SaveConfirmView();
    this.saveConfirmView.show(saveAndContinue, cancelcb);
  },

  unsavedTextEditors: function unsavedTextEditors() {
    return atom.workspace.getTextEditors().filter(function (textEditor) {
      return textEditor.isModified() && undefined !== textEditor.getPath();
    });
  },

  stop: function stop() {
    var _this7 = this;

    this.nextBuild = null;
    clearTimeout(this.finishedTimer);
    if (this.child) {
      this.abort(function () {
        _this7.buildView.buildAborted();
        _this7.statusBarView && _this7.statusBarView.buildAborted();
      });
    } else {
      this.buildView.reset();
    }
  },

  consumeLinterRegistry: function consumeLinterRegistry(registry) {
    this.linter && this.linter.destroy();
    var Linter = require('./linter-integration');
    this.linter = new Linter(registry);
  },

  consumeBuilder: function consumeBuilder(builder) {
    var _tools,
        _this8 = this;

    if (Array.isArray(builder)) (_tools = this.tools).push.apply(_tools, _toConsumableArray(builder));else this.tools.push(builder);
    this.targetManager.setTools(this.tools);
    var Disposable = require('atom').Disposable;
    return new Disposable(function () {
      _this8.tools = _this8.tools.filter(Array.isArray(builder) ? function (tool) {
        return builder.indexOf(tool) === -1;
      } : function (tool) {
        return tool !== builder;
      });
      _this8.targetManager.setTools(_this8.tools);
    });
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    var _this9 = this;

    var StatusBarView = require('./status-bar-view');
    this.statusBarView = new StatusBarView(statusBar);
    this.statusBarView.onClick(function () {
      return _this9.targetManager.selectActiveTarget();
    });
    this.statusBarView.attach();
  },

  consumeBusy: function consumeBusy(registry) {
    this.busyRegistry = registry;
    this.targetManager.setBusyRegistry(registry);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7OztxQkFFRztBQUNiLFFBQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDOztBQUUzQixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTs7Ozs7O0FBTWxDLGFBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLGlCQUFpQixDQUFDO0tBQ3ZDOztBQUVELFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBRSxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUVuQixRQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixRQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRTthQUFNLE1BQUssS0FBSyxDQUFDLFNBQVMsQ0FBQztLQUFBLENBQUMsQ0FBQztBQUNsRixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUU7YUFBTSxNQUFLLElBQUksRUFBRTtLQUFBLENBQUMsQ0FBQztBQUNyRSxRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsWUFBTTtBQUN6RCxhQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFD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QUFDO0FBQzlCLGFBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVqRCxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO2VBQU0sTUFBTTtPQUFBLENBQUMsQ0FBQztLQUN2RixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2hCLFVBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDM0MsVUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkQsWUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDOUIsV0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQzFDLENBQUMsQ0FBQzs7QUFFSCxVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2VBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQzlELFVBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxVQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQztBQUMzQyxVQUFNLEtBQUssR0FBRyxLQUFLLEdBQUcs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QUMsWUFBTTtBQUMxQixhQUFLLEtBQUssR0FBRyxPQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFBLElBQUk7ZUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLEdBQUcsVUFBQSxJQUFJO2VBQUksSUFBSSxLQUFLLE9BQU87T0FBQSxDQUFDLENBQUM7QUFDekgsYUFBSyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQUssS0FBSyxDQUFDLENBQUM7S0FDekMsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsU0FBUyxFQUFFOzs7QUFDMUIsUUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQzthQUFNLE9BQUssYUFBYSxDQUFDLGtCQUFrQixFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQzFFLFFBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDN0I7O0FBRUQsYUFBVyxFQUFBLHFCQUFDLFFBQVEsRUFBRTtBQUNwQixRQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM3QixRQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM5QztDQUNGIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHJlcXVpcmUoJy4vY29uZmlnJyksXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgaWYgKCEvXndpbi8udGVzdChwcm9jZXNzLnBsYXRmb3JtKSkge1xuICAgICAgLy8gTWFudWFsbHkgYXBwZW5kIC91c3IvbG9jYWwvYmluIGFzIGl0IG1heSBub3QgYmUgc2V0IG9uIHNvbWUgc3lzdGVtcyxcbiAgICAgIC8vIGFuZCBpdCdzIGNvbW1vbiB0byBoYXZlIG5vZGUgaW5zdGFsbGVkIGhlcmUuIEtlZXAgaXQgYXQgZW5kIHNvIGl0IHdvbid0XG4gICAgICAvLyBhY2NpZGVudGlhbGx5IG92ZXJyaWRlIGFueSBvdGhlciBub2RlIGluc3RhbGxhdGlvblxuXG4gICAgICAvLyBOb3RlOiBUaGlzIHNob3VsZCBwcm9iYWJseSBiZSByZW1vdmVkIGluIGEgZW5kLXVzZXIgZnJpZW5kbHkgd2F5Li4uXG4gICAgICBwcm9jZXNzLmVudi5QQVRIICs9ICc6L3Vzci9sb2NhbC9iaW4nO1xuICAgIH1cblxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnYnVpbGQnKTtcblxuICAgIHRoaXMudG9vbHMgPSBbIHJlcXVpcmUoJy4vYXRvbS1idWlsZCcpIF07XG4gICAgdGhpcy5saW50ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5zZXR1cFRhcmdldE1hbmFnZXIoKTtcbiAgICB0aGlzLnNldHVwQnVpbGRWaWV3KCk7XG4gICAgdGhpcy5zZXR1cEVycm9yTWF0Y2hlcigpO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnRyaWdnZXInLCAoKSA9PiB0aGlzLmJ1aWxkKCd0cmlnZ2VyJykpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpzdG9wJywgKCkgPT4gdGhpcy5zdG9wKCkpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpjb25maXJtJywgKCkgPT4ge1xuICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdidWlsZCcsICdjb25maXJtZWQnKTtcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xpY2soKTtcbiAgICB9KTtcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6bm8tY29uZmlybScsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNhdmVDb25maXJtVmlldykge1xuICAgICAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2J1aWxkJywgJ25vdCBjb25maXJtZWQnKTtcbiAgICAgICAgdGhpcy5zYXZlQ29uZmlybVZpZXcuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJykpIHtcbiAgICAgICAgICB0aGlzLmJ1aWxkKCdzYXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgoKSA9PiB0aGlzLnVwZGF0ZVN0YXR1c0JhcigpKTtcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMoKCkgPT4gdGhpcy50YXJnZXRNYW5hZ2VyLnJlZnJlc2hUYXJnZXRzKCkpO1xuICB9LFxuXG4gIHNldHVwVGFyZ2V0TWFuYWdlcigpIHtcbiAgICBjb25zdCBUYXJnZXRNYW5hZ2VyID0gcmVxdWlyZSgnLi90YXJnZXQtbWFuYWdlcicpO1xuICAgIHRoaXMudGFyZ2V0TWFuYWdlciA9IG5ldyBUYXJnZXRNYW5hZ2VyKCk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLnNldFRvb2xzKHRoaXMudG9vbHMpO1xuICAgIHRoaXMudGFyZ2V0TWFuYWdlci5vbigncmVmcmVzaC1jb21wbGV0ZScsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlU3RhdHVzQmFyKCk7XG4gICAgfSk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLm9uKCduZXctYWN0aXZlLXRhcmdldCcsIChwYXRoLCB0YXJnZXQpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlU3RhdHVzQmFyKCk7XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnNlbGVjdFRyaWdnZXJzJykpIHtcbiAgICAgICAgdGhpcy5idWlsZCgndHJpZ2dlcicpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMudGFyZ2V0TWFuYWdlci5vbigndHJpZ2dlcicsIGF0b21Db21tYW5kTmFtZSA9PiB0aGlzLmJ1aWxkKCd0cmlnZ2VyJywgYXRvbUNvbW1hbmROYW1lKSk7XG4gIH0sXG5cbiAgc2V0dXBCdWlsZFZpZXcoKSB7XG4gICAgY29uc3QgQnVpbGRWaWV3ID0gcmVxdWlyZSgnLi9idWlsZC12aWV3Jyk7XG4gICAgdGhpcy5idWlsZFZpZXcgPSBuZXcgQnVpbGRWaWV3KCk7XG4gIH0sXG5cbiAgc2V0dXBFcnJvck1hdGNoZXIoKSB7XG4gICAgY29uc3QgRXJyb3JNYXRjaGVyID0gcmVxdWlyZSgnLi9lcnJvci1tYXRjaGVyJyk7XG4gICAgdGhpcy5lcnJvck1hdGNoZXIgPSBuZXcgRXJyb3JNYXRjaGVyKCk7XG4gICAgdGhpcy5lcnJvck1hdGNoZXIub24oJ2Vycm9yJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRXJyb3IgbWF0Y2hpbmcgZmFpbGVkIScsIHsgZGV0YWlsOiBtZXNzYWdlIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuZXJyb3JNYXRjaGVyLm9uKCdtYXRjaGVkJywgKG1hdGNoKSA9PiB7XG4gICAgICBtYXRjaFswXSAmJiB0aGlzLmJ1aWxkVmlldy5zY3JvbGxUbyhtYXRjaFswXSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5jaGlsZCkge1xuICAgICAgdGhpcy5jaGlsZC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgIHJlcXVpcmUoJ3RyZWUta2lsbCcpKHRoaXMuY2hpbGQucGlkLCAnU0lHS0lMTCcpO1xuICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIHRoaXMuc3RhdHVzQmFyVmlldy5kZXN0cm95KCk7XG4gICAgdGhpcy5idWlsZFZpZXcgJiYgdGhpcy5idWlsZFZpZXcuZGVzdHJveSgpO1xuICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3ICYmIHRoaXMuc2F2ZUNvbmZpcm1WaWV3LmRlc3Ryb3koKTtcbiAgICB0aGlzLmxpbnRlciAmJiB0aGlzLmxpbnRlci5kZXN0cm95KCk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLmRlc3Ryb3koKTtcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbmlzaGVkVGltZXIpO1xuICB9LFxuXG4gIHVwZGF0ZVN0YXR1c0JhcigpIHtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgnLi91dGlscycpLmFjdGl2ZVBhdGgoKTtcbiAgICBjb25zdCBhY3RpdmVUYXJnZXQgPSB0aGlzLnRhcmdldE1hbmFnZXIuZ2V0QWN0aXZlVGFyZ2V0KHBhdGgpO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldyAmJiBhY3RpdmVUYXJnZXQgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LnNldFRhcmdldChhY3RpdmVUYXJnZXQubmFtZSk7XG4gIH0sXG5cbiAgc3RhcnROZXdCdWlsZChzb3VyY2UsIGF0b21Db21tYW5kTmFtZSkge1xuICAgIGNvbnN0IEJ1aWxkRXJyb3IgPSByZXF1aXJlKCcuL2J1aWxkLWVycm9yJyk7XG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5hY3RpdmVQYXRoKCk7XG4gICAgbGV0IGJ1aWxkVGl0bGUgPSAnJztcbiAgICB0aGlzLmxpbnRlciAmJiB0aGlzLmxpbnRlci5jbGVhcigpO1xuXG4gICAgUHJvbWlzZS5yZXNvbHZlKHRoaXMudGFyZ2V0TWFuYWdlci5nZXRUYXJnZXRzKHBhdGgpKS50aGVuKHRhcmdldHMgPT4ge1xuICAgICAgaWYgKCF0YXJnZXRzIHx8IDAgPT09IHRhcmdldHMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBCdWlsZEVycm9yKCdObyBlbGlnaWJsZSBidWlsZCB0YXJnZXQuJywgJ05vIGNvbmZpZ3VyYXRpb24gdG8gYnVpbGQgdGhpcyBwcm9qZWN0IGV4aXN0cy4nKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRhcmdldCA9IHRhcmdldHMuZmluZCh0ID0+IHQuYXRvbUNvbW1hbmROYW1lID09PSBhdG9tQ29tbWFuZE5hbWUpO1xuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy50YXJnZXRNYW5hZ2VyLmdldEFjdGl2ZVRhcmdldChwYXRoKTtcbiAgICAgIH1cbiAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnYnVpbGQnLCAndHJpZ2dlcmVkJyk7XG5cbiAgICAgIGlmICghdGFyZ2V0LmV4ZWMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJ1aWxkRXJyb3IoJ0ludmFsaWQgYnVpbGQgZmlsZS4nLCAnTm8gZXhlY3V0YWJsZSBjb21tYW5kIHNwZWNpZmllZC4nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIHRoaXMuc3RhdHVzQmFyVmlldy5idWlsZFN0YXJ0ZWQoKTtcbiAgICAgIHRoaXMuYnVzeVJlZ2lzdHJ5ICYmIHRoaXMuYnVzeVJlZ2lzdHJ5LmJlZ2luKGBidWlsZC4ke3RhcmdldC5uYW1lfWAsIGAke3RhcmdldC5uYW1lfWApO1xuICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRTdGFydGVkKCk7XG4gICAgICB0aGlzLmJ1aWxkVmlldy5zZXRIZWFkaW5nKCdSdW5uaW5nIHByZUJ1aWxkLi4uJyk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGFyZ2V0LnByZUJ1aWxkID8gdGFyZ2V0LnByZUJ1aWxkKCkgOiBudWxsKS50aGVuKCgpID0+IHRhcmdldCk7XG4gICAgfSkudGhlbih0YXJnZXQgPT4ge1xuICAgICAgY29uc3QgcmVwbGFjZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5yZXBsYWNlO1xuICAgICAgY29uc3QgZW52ID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHRhcmdldC5lbnYpO1xuICAgICAgT2JqZWN0LmtleXMoZW52KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGVudltrZXldID0gcmVwbGFjZShlbnZba2V5XSwgdGFyZ2V0LmVudik7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZXhlYyA9IHJlcGxhY2UodGFyZ2V0LmV4ZWMsIHRhcmdldC5lbnYpO1xuICAgICAgY29uc3QgYXJncyA9IHRhcmdldC5hcmdzLm1hcChhcmcgPT4gcmVwbGFjZShhcmcsIHRhcmdldC5lbnYpKTtcbiAgICAgIGNvbnN0IGN3ZCA9IHJlcGxhY2UodGFyZ2V0LmN3ZCwgdGFyZ2V0LmVudik7XG4gICAgICBjb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG4gICAgICBjb25zdCBzaENtZCA9IGlzV2luID8gJ2NtZCcgOiAnL2Jpbi9zaCc7XG4gICAgICBjb25zdCBzaENtZEFyZyA9IGlzV2luID8gJy9DJyA6ICctYyc7XG5cbiAgICAgIC8vIFN0b3JlIHRoaXMgYXMgd2UgbmVlZCB0byByZS1zZXQgaXQgYWZ0ZXIgcG9zdEJ1aWxkXG4gICAgICBidWlsZFRpdGxlID0gWyAodGFyZ2V0LnNoID8gYCR7c2hDbWR9ICR7c2hDbWRBcmd9ICR7ZXhlY31gIDogZXhlYyApLCAuLi5hcmdzLCAnXFxuJ10uam9pbignICcpO1xuXG4gICAgICB0aGlzLmJ1aWxkVmlldy5zZXRIZWFkaW5nKGJ1aWxkVGl0bGUpO1xuICAgICAgaWYgKHRhcmdldC5zaCkge1xuICAgICAgICB0aGlzLmNoaWxkID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduKFxuICAgICAgICAgIHNoQ21kLFxuICAgICAgICAgIFsgc2hDbWRBcmcsIFsgZXhlYyBdLmNvbmNhdChhcmdzKS5qb2luKCcgJyldLFxuICAgICAgICAgIHsgY3dkOiBjd2QsIGVudjogZW52IH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2hpbGQgPSByZXF1aXJlKCdjcm9zcy1zcGF3bicpLnNwYXduKFxuICAgICAgICAgIGV4ZWMsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICB7IGN3ZDogY3dkLCBlbnY6IGVudiB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIHRoaXMuY2hpbGQuc3Rkb3V0LnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRvdXQub24oJ2RhdGEnLCBkID0+IChzdGRvdXQgKz0gZCkpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBkID0+IChzdGRlcnIgKz0gZCkpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRvdXQucGlwZSh0aGlzLmJ1aWxkVmlldy50ZXJtaW5hbCk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZGVyci5waXBlKHRoaXMuYnVpbGRWaWV3LnRlcm1pbmFsKTtcbiAgICAgIHRoaXMuY2hpbGQua2lsbFNpZ25hbHMgPSAodGFyZ2V0LmtpbGxTaWduYWxzIHx8IFsgJ1NJR0lOVCcsICdTSUdURVJNJywgJ1NJR0tJTEwnIF0pLnNsaWNlKCk7XG5cbiAgICAgIHRoaXMuY2hpbGQub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICB0aGlzLmJ1aWxkVmlldy50ZXJtaW5hbC53cml0ZSgodGFyZ2V0LnNoID8gJ1VuYWJsZSB0byBleGVjdXRlIHdpdGggc2hlbGw6ICcgOiAnVW5hYmxlIHRvIGV4ZWN1dGU6ICcpICsgZXhlYyArICdcXG4nKTtcblxuICAgICAgICBpZiAoL1xccy8udGVzdChleGVjKSAmJiAhdGFyZ2V0LnNoKSB7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcudGVybWluYWwud3JpdGUoJ2BjbWRgIGNhbm5vdCBjb250YWluIHNwYWNlLiBVc2UgYGFyZ3NgIGZvciBhcmd1bWVudHMuXFxuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ0VOT0VOVCcgPT09IGVyci5jb2RlKSB7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcudGVybWluYWwud3JpdGUoYE1ha2Ugc3VyZSBjbWQ6JyR7ZXhlY30nIGFuZCBjd2Q6JyR7Y3dkfScgZXhpc3RzIGFuZCBoYXZlIGNvcnJlY3QgYWNjZXNzIHBlcm1pc3Npb25zLlxcbmApO1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LnRlcm1pbmFsLndyaXRlKGBCaW5hcmllcyBhcmUgZm91bmQgaW4gdGhlc2UgZm9sZGVyczogJHtwcm9jZXNzLmVudi5QQVRIfVxcbmApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jaGlsZC5vbignY2xvc2UnLCAoZXhpdENvZGUpID0+IHtcbiAgICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgICAgIHRoaXMuZXJyb3JNYXRjaGVyLnNldCh0YXJnZXQsIGN3ZCwgc3Rkb3V0ICsgc3RkZXJyKTtcblxuICAgICAgICBsZXQgc3VjY2VzcyA9ICgwID09PSBleGl0Q29kZSk7XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLm1hdGNoZWRFcnJvckZhaWxzQnVpbGQnKSkge1xuICAgICAgICAgIHN1Y2Nlc3MgPSBzdWNjZXNzICYmICF0aGlzLmVycm9yTWF0Y2hlci5nZXRNYXRjaGVzKCkuc29tZShtYXRjaCA9PiBtYXRjaC50eXBlICYmIG1hdGNoLnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2Vycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpbnRlciAmJiB0aGlzLmxpbnRlci5wcm9jZXNzTWVzc2FnZXModGhpcy5lcnJvck1hdGNoZXIuZ2V0TWF0Y2hlcygpLCBjd2QpO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLmJlZXBXaGVuRG9uZScpKSB7XG4gICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJ1aWxkVmlldy5zZXRIZWFkaW5nKCdSdW5uaW5nIHBvc3RCdWlsZC4uLicpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRhcmdldC5wb3N0QnVpbGQgPyB0YXJnZXQucG9zdEJ1aWxkKHN1Y2Nlc3MsIHN0ZG91dCwgc3RkZXJyKSA6IG51bGwpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LnNldEhlYWRpbmcoYnVpbGRUaXRsZSk7XG5cbiAgICAgICAgICB0aGlzLmJ1c3lSZWdpc3RyeSAmJiB0aGlzLmJ1c3lSZWdpc3RyeS5lbmQoYGJ1aWxkLiR7dGFyZ2V0Lm5hbWV9YCwgc3VjY2Vzcyk7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRGaW5pc2hlZChzdWNjZXNzKTtcbiAgICAgICAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LnNldEJ1aWxkU3VjY2VzcyhzdWNjZXNzKTtcbiAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdidWlsZCcsICdzdWNjZWVkZWQnKTtcbiAgICAgICAgICAgIHRoaXMuZmluaXNoZWRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmJ1aWxkVmlldy5kZXRhY2goKTtcbiAgICAgICAgICAgIH0sIDEyMDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zY3JvbGxPbkVycm9yJykpIHtcbiAgICAgICAgICAgICAgdGhpcy5lcnJvck1hdGNoZXIubWF0Y2hGaXJzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdidWlsZCcsICdmYWlsZWQnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLm5leHRCdWlsZCAmJiB0aGlzLm5leHRCdWlsZCgpO1xuICAgICAgICAgIHRoaXMubmV4dEJ1aWxkID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQnVpbGRFcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnc2F2ZScpIHtcbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBlbGlnaWJsZSBidWlsZCB0b29sLCBhbmQgY2F1c2Ugb2YgYnVpbGQgd2FzIGEgc2F2ZSwgc3RheSBxdWlldC5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhlcnIubmFtZSwgeyBkZXRhaWw6IGVyci5tZXNzYWdlLCBzdGFjazogZXJyLnN0YWNrIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gYnVpbGQuJywgeyBkZXRhaWw6IGVyci5tZXNzYWdlLCBzdGFjazogZXJyLnN0YWNrIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIHNlbmROZXh0U2lnbmFsKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzaWduYWwgPSB0aGlzLmNoaWxkLmtpbGxTaWduYWxzLnNoaWZ0KCk7XG4gICAgICByZXF1aXJlKCd0cmVlLWtpbGwnKSh0aGlzLmNoaWxkLnBpZCwgc2lnbmFsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBTb21ldGhpbmcgbWF5IGhhdmUgaGFwcGVuZWQgdG8gdGhlIGNoaWxkIChlLmcuIHRlcm1pbmF0ZWQgYnkgaXRzZWxmKS4gSWdub3JlIHRoaXMuICovXG4gICAgfVxuICB9LFxuXG4gIGFib3J0KGNiKSB7XG4gICAgaWYgKCF0aGlzLmNoaWxkLmtpbGxlZCkge1xuICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRBYm9ydEluaXRpYXRlZCgpO1xuICAgICAgdGhpcy5jaGlsZC5raWxsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5jaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgICAgIGNiICYmIGNiKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmROZXh0U2lnbmFsKCk7XG4gIH0sXG5cbiAgYnVpbGQoc291cmNlLCBldmVudCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbmlzaGVkVGltZXIpO1xuXG4gICAgdGhpcy5kb1NhdmVDb25maXJtKHRoaXMudW5zYXZlZFRleHRFZGl0b3JzKCksICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHRCdWlsZCA9IHRoaXMuc3RhcnROZXdCdWlsZC5iaW5kKHRoaXMsIHNvdXJjZSwgZXZlbnQgPyBldmVudC50eXBlIDogbnVsbCk7XG4gICAgICBpZiAodGhpcy5jaGlsZCkge1xuICAgICAgICB0aGlzLm5leHRCdWlsZCA9IG5leHRCdWlsZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWJvcnQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXh0QnVpbGQoKTtcbiAgICB9KTtcbiAgfSxcblxuICBkb1NhdmVDb25maXJtKG1vZGlmaWVkVGV4dEVkaXRvcnMsIGNvbnRpbnVlY2IsIGNhbmNlbGNiKSB7XG4gICAgY29uc3Qgc2F2ZUFuZENvbnRpbnVlID0gKHNhdmUpID0+IHtcbiAgICAgIG1vZGlmaWVkVGV4dEVkaXRvcnMuZm9yRWFjaCgodGV4dEVkaXRvcikgPT4gc2F2ZSAmJiB0ZXh0RWRpdG9yLnNhdmUoKSk7XG4gICAgICBjb250aW51ZWNiKCk7XG4gICAgfTtcblxuICAgIGlmICgwID09PSBtb2RpZmllZFRleHRFZGl0b3JzLmxlbmd0aCB8fCBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnNhdmVPbkJ1aWxkJykpIHtcbiAgICAgIHNhdmVBbmRDb250aW51ZSh0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zYXZlQ29uZmlybVZpZXcpIHtcbiAgICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3LmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBjb25zdCBTYXZlQ29uZmlybVZpZXcgPSByZXF1aXJlKCcuL3NhdmUtY29uZmlybS12aWV3Jyk7XG4gICAgdGhpcy5zYXZlQ29uZmlybVZpZXcgPSBuZXcgU2F2ZUNvbmZpcm1WaWV3KCk7XG4gICAgdGhpcy5zYXZlQ29uZmlybVZpZXcuc2hvdyhzYXZlQW5kQ29udGludWUsIGNhbmNlbGNiKTtcbiAgfSxcblxuICB1bnNhdmVkVGV4dEVkaXRvcnMoKSB7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkuZmlsdGVyKCh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICByZXR1cm4gdGV4dEVkaXRvci5pc01vZGlmaWVkKCkgJiYgKHVuZGVmaW5lZCAhPT0gdGV4dEVkaXRvci5nZXRQYXRoKCkpO1xuICAgIH0pO1xuICB9LFxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5uZXh0QnVpbGQgPSBudWxsO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbmlzaGVkVGltZXIpO1xuICAgIGlmICh0aGlzLmNoaWxkKSB7XG4gICAgICB0aGlzLmFib3J0KCgpID0+IHtcbiAgICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRBYm9ydGVkKCk7XG4gICAgICAgIHRoaXMuc3RhdHVzQmFyVmlldyAmJiB0aGlzLnN0YXR1c0JhclZpZXcuYnVpbGRBYm9ydGVkKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWlsZFZpZXcucmVzZXQoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZUxpbnRlclJlZ2lzdHJ5KHJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5saW50ZXIgJiYgdGhpcy5saW50ZXIuZGVzdHJveSgpO1xuICAgIGNvbnN0IExpbnRlciA9IHJlcXVpcmUoJy4vbGludGVyLWludGVncmF0aW9uJyk7XG4gICAgdGhpcy5saW50ZXIgPSBuZXcgTGludGVyKHJlZ2lzdHJ5KTtcbiAgfSxcblxuICBjb25zdW1lQnVpbGRlcihidWlsZGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYnVpbGRlcikpIHRoaXMudG9vbHMucHVzaCguLi5idWlsZGVyKTsgZWxzZSB0aGlzLnRvb2xzLnB1c2goYnVpbGRlcik7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLnNldFRvb2xzKHRoaXMudG9vbHMpO1xuICAgIGNvbnN0IERpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuRGlzcG9zYWJsZTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy50b29scyA9IHRoaXMudG9vbHMuZmlsdGVyKEFycmF5LmlzQXJyYXkoYnVpbGRlcikgPyB0b29sID0+IGJ1aWxkZXIuaW5kZXhPZih0b29sKSA9PT0gLTEgOiB0b29sID0+IHRvb2wgIT09IGJ1aWxkZXIpO1xuICAgICAgdGhpcy50YXJnZXRNYW5hZ2VyLnNldFRvb2xzKHRoaXMudG9vbHMpO1xuICAgIH0pO1xuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKSB7XG4gICAgY29uc3QgU3RhdHVzQmFyVmlldyA9IHJlcXVpcmUoJy4vc3RhdHVzLWJhci12aWV3Jyk7XG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3ID0gbmV3IFN0YXR1c0JhclZpZXcoc3RhdHVzQmFyKTtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcub25DbGljaygoKSA9PiB0aGlzLnRhcmdldE1hbmFnZXIuc2VsZWN0QWN0aXZlVGFyZ2V0KCkpO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldy5hdHRhY2goKTtcbiAgfSxcblxuICBjb25zdW1lQnVzeShyZWdpc3RyeSkge1xuICAgIHRoaXMuYnVzeVJlZ2lzdHJ5ID0gcmVnaXN0cnk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLnNldEJ1c3lSZWdpc3RyeShyZWdpc3RyeSk7XG4gIH1cbn07XG4iXX0=