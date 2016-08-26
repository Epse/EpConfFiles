(function() {
  var CP, CompositeDisposable, Directory, EOL, EOT, Emitter, GhcModiProcessReal, InteractiveProcess, Util, debug, mkError, warn, withTempFile, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Directory = _ref.Directory;

  CP = require('child_process');

  InteractiveProcess = require('./interactive-process');

  _ref1 = Util = require('../util'), debug = _ref1.debug, warn = _ref1.warn, mkError = _ref1.mkError, withTempFile = _ref1.withTempFile, EOT = _ref1.EOT;

  EOL = require('os').EOL;

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
      var P, args, command, dashArgs, fun, interactive, text, uri;
      interactive = _arg.interactive, command = _arg.command, text = _arg.text, uri = _arg.uri, dashArgs = _arg.dashArgs, args = _arg.args;
      if (args == null) {
        args = [];
      }
      if (dashArgs == null) {
        dashArgs = [];
      }
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
          command: command,
          uri: tempuri,
          args: args
        });
      }) : fun({
        command: command,
        text: text,
        uri: uri,
        args: args
      });
      return P["catch"](function(err) {
        debug("" + err);
        atom.notifications.addFatalError("Haskell-ghc-mod: ghc-mod " + (interactive != null ? 'interactive ' : '') + "command " + command + " failed with error " + err.name, {
          detail: "caps: " + (JSON.stringify(this.caps)) + "\nURI: " + uri + "\nArgs: " + args + "\nmessage: " + err.message + "\nlog:\n" + (Util.getDebugLog()),
          stack: err.stack,
          dismissable: true
        });
        return [];
      });
    };

    GhcModiProcessReal.prototype.spawnProcess = function() {
      var modPath;
      if (!atom.config.get('haskell-ghc-mod.enableGhcModi')) {
        return;
      }
      debug("Checking for ghc-modi in " + (this.rootDir.getPath()));
      if (this.proc != null) {
        debug("Found running ghc-modi instance for " + (this.rootDir.getPath()));
        return this.proc;
      }
      debug("Spawning new ghc-modi instance for " + (this.rootDir.getPath()) + " with", this.options);
      modPath = atom.config.get('haskell-ghc-mod.ghcModPath');
      this.proc = new InteractiveProcess(modPath, ['legacy-interactive'], this.options, this.caps);
      this.proc.onExit((function(_this) {
        return function(code) {
          debug("ghc-modi for " + (_this.rootDir.getPath()) + " ended with " + code);
          return _this.proc = null;
        };
      })(this));
      return this.proc;
    };

    GhcModiProcessReal.prototype.runModCmd = function(_arg) {
      var args, cmd, command, err, modPath, result, stdin, text, uri;
      command = _arg.command, text = _arg.text, uri = _arg.uri, args = _arg.args;
      modPath = atom.config.get('haskell-ghc-mod.ghcModPath');
      result = [];
      err = [];
      if (uri != null) {
        cmd = [command, uri].concat(args);
      } else {
        cmd = [command].concat(args);
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
      var args, command, proc, text, uri;
      command = o.command, text = o.text, uri = o.uri, args = o.args;
      debug("Trying to run ghc-modi in " + (this.rootDir.getPath()));
      proc = this.spawnProcess();
      if (!proc) {
        debug("Failed. Falling back to ghc-mod");
        return this.runModCmd(o);
      }
      if ((uri != null) && !this.caps.quoteArgs) {
        uri = this.rootDir.relativize(uri);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oYXNrZWxsLWdoYy1tb2QvbGliL2doYy1tb2QvZ2hjLW1vZGktcHJvY2Vzcy1yZWFsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvSkFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBNEMsT0FBQSxDQUFRLE1BQVIsQ0FBNUMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixFQUErQixpQkFBQSxTQUEvQixDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxlQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUixDQUZyQixDQUFBOztBQUFBLEVBR0EsUUFBNEMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBQW5ELEVBQUMsY0FBQSxLQUFELEVBQVEsYUFBQSxJQUFSLEVBQWMsZ0JBQUEsT0FBZCxFQUF1QixxQkFBQSxZQUF2QixFQUFxQyxZQUFBLEdBSHJDLENBQUE7O0FBQUEsRUFJQyxNQUFPLE9BQUEsQ0FBUSxJQUFSLEVBQVAsR0FKRCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsNEJBQUUsSUFBRixFQUFTLE9BQVQsRUFBbUIsT0FBbkIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLE9BQUEsSUFDYixDQUFBO0FBQUEsTUFEbUIsSUFBQyxDQUFBLFVBQUEsT0FDcEIsQ0FBQTtBQUFBLE1BRDZCLElBQUMsQ0FBQSxVQUFBLE9BQzlCLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENB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

//# sourceURL=/home/epse/.atom/packages/haskell-ghc-mod/lib/ghc-mod/ghc-modi-process-real.coffee
