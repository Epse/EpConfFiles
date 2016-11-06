(function() {
  var CP, CompositeDisposable, EOL, EOT, Emitter, InteractiveProcess, debug, mkError, warn, _ref, _ref1,
    __slice = [].slice;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  CP = require('child_process');

  _ref1 = require('../util'), debug = _ref1.debug, warn = _ref1.warn, mkError = _ref1.mkError, EOT = _ref1.EOT;

  EOL = require('os').EOL;

  module.exports = InteractiveProcess = (function() {
    function InteractiveProcess(path, cmd, options, caps) {
      var lastLine;
      this.caps = caps;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      this.interactiveAction = Promise.resolve();
      this.cwd = options.cwd;
      debug("Spawning new ghc-modi instance for " + options.cwd + " with options = ", options);
      this.proc = CP.spawn(path, cmd, options);
      this.proc.stdout.setEncoding('utf-8');
      this.proc.stderr.setEncoding('utf-8');
      lastLine = "";
      this.proc.stderr.on('data', function(data) {
        var first, last, rest, _i, _ref2;
        _ref2 = data.split(EOL), first = _ref2[0], rest = 3 <= _ref2.length ? __slice.call(_ref2, 1, _i = _ref2.length - 1) : (_i = 1, []), last = _ref2[_i++];
        if (last != null) {
          warn("ghc-modi said: " + (lastLine + first));
          lastLine = last;
        } else {
          lastLine = lastLine + first;
        }
        return rest.forEach(function(line) {
          return warn("ghc-modi said: " + line);
        });
      });
      this.resetTimer();
      this.proc.on('exit', (function(_this) {
        return function(code) {
          clearTimeout(_this.timer);
          debug("ghc-modi for " + options.cwd + " ended with " + code);
          _this.emitter.emit('did-exit', code);
          return _this.disposables.dispose();
        };
      })(this));
    }

    InteractiveProcess.prototype.onExit = function(action) {
      return this.emitter.on('did-exit', action);
    };

    InteractiveProcess.prototype.resetTimer = function() {
      var tml;
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      if (tml = atom.config.get('haskell-ghc-mod.interactiveInactivityTimeout')) {
        return this.timer = setTimeout(((function(_this) {
          return function() {
            return _this.kill();
          };
        })(this)), tml * 60 * 1000);
      }
    };

    InteractiveProcess.prototype.kill = function() {
      var _base, _ref2;
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      if ((_ref2 = this.proc.stdin) != null) {
        if (typeof _ref2.end === "function") {
          _ref2.end();
        }
      }
      return typeof (_base = this.proc).kill === "function" ? _base.kill() : void 0;
    };

    InteractiveProcess.prototype["do"] = function(action) {
      var interact;
      this.resetTimer();
      interact = (function(_this) {
        return function(command, args, data) {
          var args_, resultP;
          resultP = new Promise(function(resolve, reject) {
            var cleanup, exitCallback, parseData, savedLines, timer, tml;
            savedLines = [];
            exitCallback = null;
            parseData = null;
            timer = null;
            cleanup = function() {
              _this.proc.stdout.removeListener('data', parseData);
              _this.proc.removeListener('exit', exitCallback);
              if (timer != null) {
                return clearTimeout(timer);
              }
            };
            parseData = function(data) {
              var lines, result;
              debug("Got response from ghc-modi:" + EOL + data);
              lines = data.split(EOL);
              savedLines = savedLines.concat(lines);
              result = savedLines[savedLines.length - 2];
              if (result === 'OK') {
                cleanup();
                lines = savedLines.slice(0, -2);
                return resolve(lines.map(function(line) {
                  return line.replace(/\0/g, '\n');
                }));
              }
            };
            exitCallback = function() {
              cleanup();
              console.error("" + savedLines);
              return reject(mkError("ghc-modi crashed", "" + savedLines));
            };
            _this.proc.stdout.on('data', parseData);
            _this.proc.on('exit', exitCallback);
            if (tml = atom.config.get('haskell-ghc-mod.interactiveActionTimeout')) {
              return timer = setTimeout((function() {
                cleanup();
                console.error("" + savedLines);
                _this.kill();
                return reject(mkError("InteractiveActionTimeout", "" + savedLines));
              }), tml * 1000);
            }
          });
          args_ = _this.caps.quoteArgs ? ['ascii-escape', command].concat(args.map(function(x) {
            return "\x02" + x + "\x03";
          })) : [command].concat(__slice.call(args));
          debug.apply(null, ["Running ghc-modi command " + command].concat(__slice.call(args)));
          _this.proc.stdin.write("" + (args_.join(' ').replace(/(?:\r?\n|\r)/g, ' ')) + EOL);
          if (data != null) {
            debug("Writing data to stdin...");
            _this.proc.stdin.write("" + data + EOT);
          }
          return resultP;
        };
      })(this);
      return this.interactiveAction = this.interactiveAction.then((function(_this) {
        return function() {
          debug("Started interactive action block in " + _this.cwd);
          return action(interact).then(function(res) {
            debug("Ended interactive action block in " + _this.cwd);
            return res;
          });
        };
      })(this));
    };

    return InteractiveProcess;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvZ2hjLW1vZC9pbnRlcmFjdGl2ZS1wcm9jZXNzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFBVixDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxlQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLFFBQThCLE9BQUEsQ0FBUSxTQUFSLENBQTlCLEVBQUMsY0FBQSxLQUFELEVBQVEsYUFBQSxJQUFSLEVBQWMsZ0JBQUEsT0FBZCxFQUF1QixZQUFBLEdBRnZCLENBQUE7O0FBQUEsRUFHQyxNQUFPLE9BQUEsQ0FBUSxJQUFSLEVBQVAsR0FIRCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsNEJBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWSxPQUFaLEVBQXNCLElBQXRCLEdBQUE7QUFDWCxVQUFBLFFBQUE7QUFBQSxNQURnQyxJQUFDLENBQUEsT0FBQSxJQUNqQyxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsR0FBRCxHQUFPLE9BQU8sQ0FBQyxHQUhmLENB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/ghc-mod/interactive-process.coffee
