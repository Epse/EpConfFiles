(function() {
  var CP, CompositeDisposable, EOL, EOT, Emitter, InteractiveProcess, debug, mkError, ref, ref1, warn,
    slice = [].slice;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  CP = require('child_process');

  ref1 = require('../util'), debug = ref1.debug, warn = ref1.warn, mkError = ref1.mkError, EOT = ref1.EOT;

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
        var first, i, last, ref2, rest;
        ref2 = data.split(EOL), first = ref2[0], rest = 3 <= ref2.length ? slice.call(ref2, 1, i = ref2.length - 1) : (i = 1, []), last = ref2[i++];
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
      var base, ref2;
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      if ((ref2 = this.proc.stdin) != null) {
        if (typeof ref2.end === "function") {
          ref2.end();
        }
      }
      return typeof (base = this.proc).kill === "function" ? base.kill() : void 0;
    };

    InteractiveProcess.prototype["do"] = function(action) {
      var interact;
      this.resetTimer();
      interact = (function(_this) {
        return function(command, args, data) {
          var args_, resultP;
          resultP = new Promise(function(resolve, reject) {
            var chunks, cleanup, exitCallback, parseData, savedLines, timer, tml;
            savedLines = [];
            chunks = [];
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
              chunks.push(data);
              savedLines = chunks.join('').split(EOL);
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
          })) : [command].concat(slice.call(args));
          debug.apply(null, ["Running ghc-modi command " + command].concat(slice.call(args)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvZ2hjLW1vZC9pbnRlcmFjdGl2ZS1wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0ZBQUE7SUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxlQUFSOztFQUNMLE9BQThCLE9BQUEsQ0FBUSxTQUFSLENBQTlCLEVBQUMsa0JBQUQsRUFBUSxnQkFBUixFQUFjLHNCQUFkLEVBQXVCOztFQUN0QixNQUFPLE9BQUEsQ0FBUSxJQUFSOztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyw0QkFBQyxJQUFELEVBQU8sR0FBUCxFQUFZLE9BQVosRUFBcUIsSUFBckI7QUFDWCxVQUFBO01BRGdDLElBQUMsQ0FBQSxPQUFEO01BQ2hDLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLE9BQWhDO01BQ0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLE9BQU8sQ0FBQyxPQUFSLENBQUE7TUFDckIsSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFPLENBQUM7TUFFZixLQUFBLENBQU0scUNBQUEsR0FBc0MsT0FBTyxDQUFDLEdBQTlDLEdBQWtELGtCQUF4RCxFQUNtQixPQURuQjtNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFULEVBQWUsR0FBZixFQUFvQixPQUFwQjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQWIsQ0FBeUIsT0FBekI7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFiLENB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IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKVxuQ1AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcbntkZWJ1Zywgd2FybiwgbWtFcnJvciwgRU9UfSA9IHJlcXVpcmUgJy4uL3V0aWwnXG57RU9MfSA9IHJlcXVpcmUoJ29zJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW50ZXJhY3RpdmVQcm9jZXNzXG4gIGNvbnN0cnVjdG9yOiAocGF0aCwgY21kLCBvcHRpb25zLCBAY2FwcykgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBpbnRlcmFjdGl2ZUFjdGlvbiA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgQGN3ZCA9IG9wdGlvbnMuY3dkXG5cbiAgICBkZWJ1ZyBcIlNwYXduaW5nIG5ldyBnaGMtbW9kaSBpbnN0YW5jZSBmb3IgI3tvcHRpb25zLmN3ZH0gd2l0aFxuICAgICAgICAgIG9wdGlvbnMgPSBcIiwgb3B0aW9uc1xuICAgIEBwcm9jID0gQ1Auc3Bhd24ocGF0aCwgY21kLCBvcHRpb25zKVxuICAgIEBwcm9jLnN0ZG91dC5zZXRFbmNvZGluZyAndXRmLTgnXG4gICAgQHByb2Muc3RkZXJyLnNldEVuY29kaW5nICd1dGYtOCdcbiAgICBsYXN0TGluZSA9IFwiXCJcbiAgICBAcHJvYy5zdGRlcnIub24gJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgIFtmaXJzdCwgcmVzdC4uLiwgbGFzdF0gPSBkYXRhLnNwbGl0KEVPTClcbiAgICAgIGlmIGxhc3Q/XG4gICAgICAgIHdhcm4gXCJnaGMtbW9kaSBzYWlkOiAje2xhc3RMaW5lICsgZmlyc3R9XCJcbiAgICAgICAgbGFzdExpbmUgPSBsYXN0XG4gICAgICBlbHNlXG4gICAgICAgIGxhc3RMaW5lID0gbGFzdExpbmUgKyBmaXJzdFxuICAgICAgcmVzdC5mb3JFYWNoIChsaW5lKSAtPlxuICAgICAgICB3YXJuIFwiZ2hjLW1vZGkgc2FpZDogI3tsaW5lfVwiXG4gICAgQHJlc2V0VGltZXIoKVxuICAgIEBwcm9jLm9uICdleGl0JywgKGNvZGUpID0+XG4gICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICBkZWJ1ZyBcImdoYy1tb2RpIGZvciAje29wdGlvbnMuY3dkfSBlbmRlZCB3aXRoICN7Y29kZX1cIlxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWV4aXQnLCBjb2RlXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgb25FeGl0OiAoYWN0aW9uKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtZXhpdCcsIGFjdGlvblxuXG4gIHJlc2V0VGltZXI6IC0+XG4gICAgaWYgQHRpbWVyP1xuICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgIGlmIHRtbCA9IGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1naGMtbW9kLmludGVyYWN0aXZlSW5hY3Rpdml0eVRpbWVvdXQnKVxuICAgICAgQHRpbWVyID0gc2V0VGltZW91dCAoPT4gQGtpbGwoKSksIHRtbCAqIDYwICogMTAwMFxuXG4gIGtpbGw6IC0+XG4gICAgaWYgQHRpbWVyP1xuICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgIEBwcm9jLnN0ZGluPy5lbmQ/KClcbiAgICBAcHJvYy5raWxsPygpXG5cbiAgZG86IChhY3Rpb24pIC0+XG4gICAgQHJlc2V0VGltZXIoKVxuICAgIGludGVyYWN0ID0gKGNvbW1hbmQsIGFyZ3MsIGRhdGEpID0+XG4gICAgICByZXN1bHRQID1cbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBzYXZlZExpbmVzID0gW11cbiAgICAgICAgICBjaHVua3MgPSBbXVxuICAgICAgICAgIGV4aXRDYWxsYmFjayA9IG51bGxcbiAgICAgICAgICBwYXJzZURhdGEgPSBudWxsXG4gICAgICAgICAgdGltZXIgPSBudWxsXG4gICAgICAgICAgY2xlYW51cCA9ID0+XG4gICAgICAgICAgICBAcHJvYy5zdGRvdXQucmVtb3ZlTGlzdGVuZXIgJ2RhdGEnLCBwYXJzZURhdGFcbiAgICAgICAgICAgIEBwcm9jLnJlbW92ZUxpc3RlbmVyICdleGl0JywgZXhpdENhbGxiYWNrXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgdGltZXIgaWYgdGltZXI/XG4gICAgICAgICAgcGFyc2VEYXRhID0gKGRhdGEpIC0+XG4gICAgICAgICAgICBkZWJ1ZyBcIkdvdCByZXNwb25zZSBmcm9tIGdoYy1tb2RpOiN7RU9MfSN7ZGF0YX1cIlxuICAgICAgICAgICAgY2h1bmtzLnB1c2ggZGF0YVxuICAgICAgICAgICAgc2F2ZWRMaW5lcyA9IGNodW5rcy5qb2luKCcnKS5zcGxpdChFT0wpXG4gICAgICAgICAgICByZXN1bHQgPSBzYXZlZExpbmVzW3NhdmVkTGluZXMubGVuZ3RoIC0gMl1cbiAgICAgICAgICAgIGlmIHJlc3VsdCBpcyAnT0snXG4gICAgICAgICAgICAgIGNsZWFudXAoKVxuICAgICAgICAgICAgICBsaW5lcyA9IHNhdmVkTGluZXMuc2xpY2UoMCwgLTIpXG4gICAgICAgICAgICAgIHJlc29sdmUgbGluZXMubWFwIChsaW5lKSAtPlxuICAgICAgICAgICAgICAgIGxpbmUucmVwbGFjZSAvXFwwL2csICdcXG4nXG4gICAgICAgICAgZXhpdENhbGxiYWNrID0gLT5cbiAgICAgICAgICAgIGNsZWFudXAoKVxuICAgICAgICAgICAgY29uc29sZS5lcnJvciBcIiN7c2F2ZWRMaW5lc31cIlxuICAgICAgICAgICAgcmVqZWN0IG1rRXJyb3IgXCJnaGMtbW9kaSBjcmFzaGVkXCIsIFwiI3tzYXZlZExpbmVzfVwiXG4gICAgICAgICAgQHByb2Muc3Rkb3V0Lm9uICdkYXRhJywgcGFyc2VEYXRhXG4gICAgICAgICAgQHByb2Mub24gJ2V4aXQnLCBleGl0Q2FsbGJhY2tcbiAgICAgICAgICBpZiB0bWwgPSBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5pbnRlcmFjdGl2ZUFjdGlvblRpbWVvdXQnKVxuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0ICg9PlxuICAgICAgICAgICAgICBjbGVhbnVwKClcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvciBcIiN7c2F2ZWRMaW5lc31cIlxuICAgICAgICAgICAgICBAa2lsbCgpXG4gICAgICAgICAgICAgIHJlamVjdCBta0Vycm9yIFwiSW50ZXJhY3RpdmVBY3Rpb25UaW1lb3V0XCIsIFwiI3tzYXZlZExpbmVzfVwiXG4gICAgICAgICAgICAgICksIHRtbCAqIDEwMDBcbiAgICAgIGFyZ3NfID1cbiAgICAgICAgaWYgQGNhcHMucXVvdGVBcmdzXG4gICAgICAgICAgWydhc2NpaS1lc2NhcGUnLCBjb21tYW5kXS5jb25jYXQgYXJncy5tYXAgKHgpIC0+IFwiXFx4MDIje3h9XFx4MDNcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgW2NvbW1hbmQsIGFyZ3MuLi5dXG4gICAgICBkZWJ1ZyBcIlJ1bm5pbmcgZ2hjLW1vZGkgY29tbWFuZCAje2NvbW1hbmR9XCIsIGFyZ3MuLi5cbiAgICAgIEBwcm9jLnN0ZGluLndyaXRlIFwiI3thcmdzXy5qb2luKCcgJykucmVwbGFjZSgvKD86XFxyP1xcbnxcXHIpL2csICcgJyl9I3tFT0x9XCJcbiAgICAgIGlmIGRhdGE/XG4gICAgICAgIGRlYnVnIFwiV3JpdGluZyBkYXRhIHRvIHN0ZGluLi4uXCJcbiAgICAgICAgQHByb2Muc3RkaW4ud3JpdGUgXCIje2RhdGF9I3tFT1R9XCJcbiAgICAgIHJldHVybiByZXN1bHRQXG4gICAgQGludGVyYWN0aXZlQWN0aW9uID0gQGludGVyYWN0aXZlQWN0aW9uLnRoZW4gPT5cbiAgICAgIGRlYnVnIFwiU3RhcnRlZCBpbnRlcmFjdGl2ZSBhY3Rpb24gYmxvY2sgaW4gI3tAY3dkfVwiXG4gICAgICBhY3Rpb24oaW50ZXJhY3QpLnRoZW4gKHJlcykgPT5cbiAgICAgICAgZGVidWcgXCJFbmRlZCBpbnRlcmFjdGl2ZSBhY3Rpb24gYmxvY2sgaW4gI3tAY3dkfVwiXG4gICAgICAgIHJldHVybiByZXNcbiJdfQ==
