(function() {
  var CP, CompositeDisposable, Directory, EOL, EOT, Emitter, GhcModiProcessReal, InteractiveProcess, Util, debug, mkError, warn, withTempFile, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Directory = _ref.Directory;

  CP = require('child_process');

  InteractiveProcess = require('./interactive-process');

  _ref1 = Util = require('../util'), debug = _ref1.debug, warn = _ref1.warn, mkError = _ref1.mkError, withTempFile = _ref1.withTempFile, EOT = _ref1.EOT;

  EOL = require('os').EOL;

  _ = require('underscore-plus');

  module.exports = GhcModiProcessReal = (function() {
    function GhcModiProcessReal(caps, rootDir, options) {
      this.caps = caps;
      this.rootDir = rootDir;
      this.options = options;
      this.runModiCmd = __bind(this.runModiCmd, this);
      this.runModCmd = __bind(this.runModCmd, this);
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
    }

    GhcModiProcessReal.prototype.run = function(_arg) {
      var P, args, command, dashArgs, fun, ghcModOptions, ghcOptions, interactive, suppressErrors, text, uri;
      interactive = _arg.interactive, command = _arg.command, text = _arg.text, uri = _arg.uri, dashArgs = _arg.dashArgs, args = _arg.args, suppressErrors = _arg.suppressErrors, ghcOptions = _arg.ghcOptions, ghcModOptions = _arg.ghcModOptions;
      if (args == null) {
        args = [];
      }
      if (dashArgs == null) {
        dashArgs = [];
      }
      if (suppressErrors == null) {
        suppressErrors = false;
      }
      if (ghcOptions == null) {
        ghcOptions = [];
      }
      if (ghcModOptions == null) {
        ghcModOptions = [];
      }
      ghcModOptions = ghcModOptions.concat.apply(ghcModOptions, ghcOptions.map(function(opt) {
        return ['--ghc-option', opt];
      }));
      if (atom.config.get('haskell-ghc-mod.lowMemorySystem')) {
        interactive = atom.config.get('haskell-ghc-mod.enableGhcModi');
      }
      if (typeof dashArgs === 'function') {
        dashArgs = dashArgs(this.caps);
      }
      if (this.caps.optparse) {
        args = dashArgs.concat(['--']).concat(args);
      } else {
        args = dashArgs.concat(args);
      }
      fun = interactive ? this.runModiCmd : this.runModCmd;
      P = (text != null) && !this.caps.fileMap ? withTempFile(text, uri, function(tempuri) {
        return fun({
          ghcModOptions: ghcModOptions,
          command: command,
          uri: tempuri,
          args: args
        });
      }) : fun({
        ghcModOptions: ghcModOptions,
        command: command,
        text: text,
        uri: uri,
        args: args
      });
      return P["catch"]((function(_this) {
        return function(err) {
          debug(err);
          if (err.name === 'InteractiveActionTimeout') {
            atom.notifications.addError("Haskell-ghc-mod: ghc-mod " + (interactive != null ? 'interactive ' : '') + "command " + command + " timed out. You can try to fix it by raising 'Interactive Action Timeout' setting in haskell-ghc-mod settings.", {
              detail: "caps: " + (JSON.stringify(_this.caps)) + "\nURI: " + uri + "\nArgs: " + args + "\nmessage: " + err.message,
              stack: err.stack,
              dismissable: true
            });
          } else if (!suppressErrors) {
            atom.notifications.addFatalError("Haskell-ghc-mod: ghc-mod " + (interactive != null ? 'interactive ' : '') + "command " + command + " failed with error " + err.name, {
              detail: "caps: " + (JSON.stringify(_this.caps)) + "\nURI: " + uri + "\nArgs: " + args + "\nmessage: " + err.message + "\nlog:\n" + (Util.getDebugLog()),
              stack: err.stack,
              dismissable: true
            });
          } else {
            console.error(err);
          }
          return [];
        };
      })(this));
    };

    GhcModiProcessReal.prototype.spawnProcess = function(ghcModOptions) {
      var modPath;
      if (!atom.config.get('haskell-ghc-mod.enableGhcModi')) {
        return Promise.resolve(null);
      }
      debug("Checking for ghc-modi in " + (this.rootDir.getPath()));
      if (this.proc != null) {
        if (!_.isEqual(this.ghcModOptions, ghcModOptions)) {
          debug("Found running ghc-modi instance for " + (this.rootDir.getPath()) + ", but ghcModOptions don't match. Old: ", this.ghcModOptions, ' new: ', ghcModOptions);
          this.proc.kill();
          return new Promise((function(_this) {
            return function(resolve) {
              return _this.proc.onExit(function() {
                return resolve(_this.spawnProcess(ghcModOptions));
              });
            };
          })(this));
        }
        debug("Found running ghc-modi instance for " + (this.rootDir.getPath()));
        return Promise.resolve(this.proc);
      }
      debug("Spawning new ghc-modi instance for " + (this.rootDir.getPath()) + " with", this.options);
      modPath = atom.config.get('haskell-ghc-mod.ghcModPath');
      this.ghcModOptions = ghcModOptions;
      this.proc = new InteractiveProcess(modPath, ghcModOptions.concat(['legacy-interactive']), this.options, this.caps);
      this.proc.disposables.add(this.proc.onExit((function(_this) {
        return function(code) {
          debug("ghc-modi for " + (_this.rootDir.getPath()) + " ended with " + code);
          return _this.proc = null;
        };
      })(this)));
      return Promise.resolve(this.proc);
    };

    GhcModiProcessReal.prototype.runModCmd = function(_arg) {
      var args, cmd, command, err, ghcModOptions, modPath, result, stdin, text, uri;
      ghcModOptions = _arg.ghcModOptions, command = _arg.command, text = _arg.text, uri = _arg.uri, args = _arg.args;
      modPath = atom.config.get('haskell-ghc-mod.ghcModPath');
      result = [];
      err = [];
      if (uri != null) {
        cmd = ghcModOptions.concat([command, uri], args);
      } else {
        cmd = ghcModOptions.concat([command], args);
      }
      if (text != null) {
        cmd = ['--map-file', uri].concat(cmd);
      }
      if (text != null) {
        stdin = "" + text + EOT;
      }
      return Util.execPromise(modPath, cmd, this.options, stdin).then(function(stdout) {
        return stdout.split(EOL).slice(0, -1).map(function(line) {
          return line.replace(/\0/g, '\n');
        });
      });
    };

    GhcModiProcessReal.prototype.runModiCmd = function(o) {
      var args, command, ghcModOptions, text, uri;
      ghcModOptions = o.ghcModOptions, command = o.command, text = o.text, uri = o.uri, args = o.args;
      debug("Trying to run ghc-modi in " + (this.rootDir.getPath()));
      return this.spawnProcess(ghcModOptions).then((function(_this) {
        return function(proc) {
          if (!proc) {
            debug("Failed. Falling back to ghc-mod");
            return _this.runModCmd(o);
          }
          if ((uri != null) && !_this.caps.quoteArgs) {
            uri = _this.rootDir.relativize(uri);
          }
          return proc["do"](function(interact) {
            return Promise.resolve().then(function() {
              if (text != null) {
                return interact("map-file", [uri], text);
              }
            }).then(function() {
              return interact(command, uri != null ? [uri].concat(args) : args);
            }).then(function(res) {
              if (text != null) {
                return interact("unmap-file", [uri]).then(function() {
                  return res;
                });
              } else {
                return res;
              }
            })["catch"](function(err) {
              try {
                interact("unmap-file", [uri]);
              } catch (_error) {}
              throw err;
            });
          });
        };
      })(this));
    };

    GhcModiProcessReal.prototype.killProcess = function() {
      if (this.proc == null) {
        return;
      }
      debug("Killing ghc-modi process for " + (this.rootDir.getPath()));
      this.proc.kill();
      return this.proc = null;
    };

    GhcModiProcessReal.prototype.destroy = function() {
      if (this.emitter == null) {
        return;
      }
      debug("GhcModiProcessBase destroying");
      this.killProcess();
      this.emitter.emit('did-destroy');
      this.emitter = null;
      return this.disposables.dispose();
    };

    GhcModiProcessReal.prototype.onDidDestroy = function(callback) {
      if (this.emitter == null) {
        return;
      }
      return this.emitter.on('did-destroy', callback);
    };

    return GhcModiProcessReal;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvZ2hjLW1vZC9naGMtbW9kaS1wcm9jZXNzLXJlYWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVKQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUE0QyxPQUFBLENBQVEsTUFBUixDQUE1QyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLEVBQStCLGlCQUFBLFNBQS9CLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLGVBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBRnJCLENBQUE7O0FBQUEsRUFHQSxRQUE0QyxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FBbkQsRUFBQyxjQUFBLEtBQUQsRUFBUSxhQUFBLElBQVIsRUFBYyxnQkFBQSxPQUFkLEVBQXVCLHFCQUFBLFlBQXZCLEVBQXFDLFlBQUEsR0FIckMsQ0FBQTs7QUFBQSxFQUlDLE1BQU8sT0FBQSxDQUFRLElBQVIsRUFBUCxHQUpELENBQUE7O0FBQUEsRUFLQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBTEosQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLDRCQUFFLElBQUYsRUFBUyxPQUFULEVBQW1CLE9BQW5CLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxPQUFBLElBQ2IsQ0FBQTtBQUFBLE1BRG1CLElBQUMsQ0FBQSxVQUFBLE9BQ3BCLENBQUE7QUFBQSxNQUQ2QixJQUFDLENBQUEsVUFBQSxPQUM5QixDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFE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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/ghc-mod/ghc-modi-process-real.coffee
