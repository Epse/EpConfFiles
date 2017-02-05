(function() {
  var CP, Directory, EOL, FS, HsUtil, Point, Range, Temp, Util, debuglog, delimiter, extname, joinPath, logKeep, objclone, ref, ref1, savelog, sep,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Directory = ref.Directory;

  ref1 = require('path'), delimiter = ref1.delimiter, sep = ref1.sep, extname = ref1.extname;

  Temp = require('temp');

  FS = require('fs');

  CP = require('child_process');

  EOL = require('os').EOL;

  HsUtil = require('atom-haskell-utils');

  objclone = require('clone');

  debuglog = [];

  logKeep = 30000;

  savelog = function() {
    var messages, ts;
    messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ts = Date.now();
    debuglog.push({
      timestamp: ts,
      messages: messages
    });
    debuglog = debuglog.filter(function(arg) {
      var timestamp;
      timestamp = arg.timestamp;
      return (ts - timestamp) < logKeep;
    });
  };

  joinPath = function(ds) {
    var res, set;
    set = new Set(ds);
    res = [];
    set.forEach(function(d) {
      return res.push(d);
    });
    return res.join(delimiter);
  };

  module.exports = Util = {
    EOT: EOL + "\x04" + EOL,
    debug: function() {
      var messages;
      messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (atom.config.get('haskell-ghc-mod.debug')) {
        console.log.apply(console, ["haskell-ghc-mod debug:"].concat(slice.call(messages)));
      }
      return savelog.apply(null, messages.map(JSON.stringify));
    },
    warn: function() {
      var messages;
      messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      console.warn.apply(console, ["haskell-ghc-mod warning:"].concat(slice.call(messages)));
      return savelog.apply(null, messages.map(JSON.stringify));
    },
    getDebugLog: function() {
      var ts;
      ts = Date.now();
      debuglog = debuglog.filter(function(arg) {
        var timestamp;
        timestamp = arg.timestamp;
        return (ts - timestamp) < logKeep;
      });
      return debuglog.map(function(arg) {
        var messages, timestamp;
        timestamp = arg.timestamp, messages = arg.messages;
        return ((timestamp - ts) / 1000) + "s: " + (messages.join(','));
      }).join(EOL);
    },
    getRootDirFallback: HsUtil.getRootDirFallback,
    getRootDir: HsUtil.getRootDir,
    isDirectory: HsUtil.isDirectory,
    execPromise: function(cmd, args, opts, stdin) {
      return new Promise(function(resolve, reject) {
        var child;
        Util.debug("Running " + cmd + " " + args + " with opts = ", opts);
        child = CP.execFile(cmd, args, opts, function(error, stdout, stderr) {
          if (stderr) {
            Util.warn(stderr);
          }
          if (error != null) {
            Util.warn("Running " + cmd + " " + args + " failed with ", error);
            if (stdout) {
              Util.warn(stdout);
            }
            error.stack = (new Error).stack;
            return reject(error);
          } else {
            Util.debug("Got response from " + cmd + " " + args, {
              stdout: stdout,
              stderr: stderr
            });
            return resolve(stdout);
          }
        });
        if (stdin != null) {
          Util.debug("sending stdin text to " + cmd + " " + args);
          return child.stdin.write(stdin);
        }
      });
    },
    getCabalSandbox: function(rootPath) {
      Util.debug("Looking for cabal sandbox...");
      return Util.parseSandboxConfig("" + rootPath + sep + "cabal.sandbox.config").then(function(sbc) {
        var ref2, sandbox;
        if ((sbc != null ? (ref2 = sbc['install-dirs']) != null ? ref2['bindir'] : void 0 : void 0) != null) {
          sandbox = sbc['install-dirs']['bindir'];
          Util.debug("Found cabal sandbox: ", sandbox);
          if (Util.isDirectory(sandbox)) {
            return sandbox;
          } else {
            return Util.warn("Cabal sandbox ", sandbox, " is not a directory");
          }
        } else {
          return Util.warn("No cabal sandbox found");
        }
      });
    },
    getStackSandbox: function(rootPath, apd, env) {
      Util.debug("Looking for stack sandbox...");
      env.PATH = joinPath(apd);
      Util.debug("Running stack with PATH ", env.PATH);
      return Util.execPromise('stack', ['path', '--snapshot-install-root', '--local-install-root', '--bin-path'], {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: rootPath,
        env: env,
        timeout: atom.config.get('haskell-ghc-mod.initTimeout') * 1000
      }).then(function(out) {
        var bp, lines, lir, sir;
        lines = out.split(EOL);
        sir = lines.filter(function(l) {
          return l.startsWith('snapshot-install-root: ');
        })[0].slice(23) + (sep + "bin");
        lir = lines.filter(function(l) {
          return l.startsWith('local-install-root: ');
        })[0].slice(20) + (sep + "bin");
        bp = lines.filter(function(l) {
          return l.startsWith('bin-path: ');
        })[0].slice(10).split(delimiter).filter(function(p) {
          return !((p === sir) || (p === lir) || (indexOf.call(apd, p) >= 0));
        });
        Util.debug.apply(Util, ["Found stack sandbox ", lir, sir].concat(slice.call(bp)));
        return [lir, sir].concat(slice.call(bp));
      })["catch"](function(err) {
        return Util.warn("No stack sandbox found because ", err);
      });
    },
    getProcessOptions: (function(_this) {
      return function(rootPath) {
        var PATH, apd, cabalSandbox, capMask, env, j, m, res, sbd, stackSandbox, vn;
        if (rootPath == null) {
          rootPath = Util.getRootDirFallback().getPath();
        }
        if (_this.processOptionsCache == null) {
          _this.processOptionsCache = new Map();
        }
        if (_this.processOptionsCache.has(rootPath)) {
          return _this.processOptionsCache.get(rootPath);
        }
        Util.debug("getProcessOptions(" + rootPath + ")");
        env = objclone(process.env);
        if (process.platform === 'win32') {
          PATH = [];
          capMask = function(str, mask) {
            var a, c, i, j, len;
            a = str.split('');
            for (i = j = 0, len = a.length; j < len; i = ++j) {
              c = a[i];
              if (mask & Math.pow(2, i)) {
                a[i] = a[i].toUpperCase();
              }
            }
            return a.join('');
          };
          for (m = j = 0xf; j >= 0; m = --j) {
            vn = capMask("path", m);
            if (env[vn] != null) {
              PATH.push(env[vn]);
            }
          }
          env.PATH = PATH.join(delimiter);
        }
        if (env.PATH == null) {
          env.PATH = "";
        }
        apd = atom.config.get('haskell-ghc-mod.additionalPathDirectories').concat(env.PATH.split(delimiter));
        sbd = false;
        cabalSandbox = atom.config.get('haskell-ghc-mod.cabalSandbox') ? Util.getCabalSandbox(rootPath) : Promise.resolve();
        stackSandbox = atom.config.get('haskell-ghc-mod.stackSandbox') ? Util.getStackSandbox(rootPath, apd, objclone(env)) : Promise.resolve();
        res = Promise.all([cabalSandbox, stackSandbox]).then(function(arg) {
          var cabalSandboxDir, newp, stackSandboxDirs;
          cabalSandboxDir = arg[0], stackSandboxDirs = arg[1];
          newp = [];
          if (cabalSandboxDir != null) {
            newp.push(cabalSandboxDir);
          }
          if (stackSandboxDirs != null) {
            newp.push.apply(newp, stackSandboxDirs);
          }
          newp.push.apply(newp, apd);
          env.PATH = joinPath(newp);
          Util.debug("PATH = " + env.PATH);
          return {
            cwd: rootPath,
            env: env,
            encoding: 'utf-8',
            maxBuffer: 2e308
          };
        });
        _this.processOptionsCache.set(rootPath, res);
        return res;
      };
    })(this),
    getSymbolAtPoint: function(editor, point) {
      var find, inScope, j, len, line, range, regex, scope, scopes, symbol, tb;
      inScope = function(scope, point) {
        return editor.scopeDescriptorForBufferPosition(point).getScopesArray().some(function(v) {
          return v === scope;
        });
      };
      tb = editor.getBuffer();
      line = tb.rangeForRow(point.row);
      find = function(test) {
        var end, start, start_;
        start = end = point;
        start_ = start.translate([0, -1]);
        while (test(start_) && start_.isGreaterThanOrEqual(line.start)) {
          start = start_;
          start_ = start.translate([0, -1]);
        }
        while (test(end) && end.isLessThan(line.end)) {
          end = end.translate([0, 1]);
        }
        return new Range(start, end);
      };
      regex = /[\w'.]/;
      scopes = ['keyword.operator.haskell', 'entity.name.function.infix.haskell'];
      for (j = 0, len = scopes.length; j < len; j++) {
        scope = scopes[j];
        range = find(function(p) {
          return inScope(scope, p);
        });
        if (!range.isEmpty()) {
          symbol = tb.getTextInRange(range);
          return {
            scope: scope,
            range: range,
            symbol: symbol
          };
        }
      }
      range = find((function(p) {
        return tb.getTextInRange([p, p.translate([0, 1])]).match(regex) != null;
      }));
      symbol = tb.getTextInRange(range);
      return {
        range: range,
        symbol: symbol
      };
    },
    getSymbolInRange: function(editor, crange) {
      var buffer;
      buffer = editor.getBuffer();
      if (crange.isEmpty()) {
        return Util.getSymbolAtPoint(editor, crange.start);
      } else {
        return {
          symbol: buffer.getTextInRange(crange),
          range: crange
        };
      }
    },
    withTempFile: function(contents, uri, gen) {
      return new Promise(function(resolve, reject) {
        return Temp.open({
          prefix: 'haskell-ghc-mod',
          suffix: extname(uri || ".hs")
        }, function(err, info) {
          if (err) {
            return reject(err);
          } else {
            return resolve(info);
          }
        });
      }).then(function(info) {
        return new Promise(function(resolve, reject) {
          return FS.write(info.fd, contents, function(err) {
            if (err) {
              return reject(err);
            } else {
              return gen(info.path).then(function(res) {
                FS.close(info.fd, function() {
                  return FS.unlink(info.path);
                });
                return resolve(res.map(function(line) {
                  return line.split(info.path).join(uri);
                }));
              });
            }
          });
        });
      });
    },
    mkError: function(name, message) {
      var err;
      err = new Error(message);
      err.name = name;
      return err;
    },
    parseSandboxConfig: function(file) {
      return new Promise(function(resolve, reject) {
        return FS.readFile(file, {
          encoding: 'utf-8'
        }, function(err, sbc) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(sbc);
          }
        });
      }).then(function(sbc) {
        var rv, scope, vars;
        vars = {};
        scope = vars;
        rv = function(v) {
          var k1, v1;
          for (k1 in scope) {
            v1 = scope[k1];
            v = v.split("$" + k1).join(v1);
          }
          return v;
        };
        sbc.split(/\r?\n|\r/).forEach(function(line) {
          var _, l, m, name, newscope, val;
          if (!(line.match(/^\s*--/) || line.match(/^\s*$/))) {
            l = line.split(/--/)[0];
            if (m = line.match(/^\s*([\w-]+):\s*(.*)\s*$/)) {
              _ = m[0], name = m[1], val = m[2];
              return scope[name] = rv(val);
            } else {
              newscope = {};
              scope[line] = newscope;
              return scope = newscope;
            }
          }
        });
        return vars;
      })["catch"](function(err) {
        return Util.warn("Reading cabal sandbox config failed with ", err);
      });
    },
    tabShiftForPoint: function(buffer, point) {
      var columnShift, ref2;
      columnShift = 7 * (((ref2 = buffer.lineForRow(point.row).slice(0, point.column).match(/\t/g)) != null ? ref2.length : void 0) || 0);
      return new Point(point.row, point.column + columnShift);
    },
    tabShiftForRange: function(buffer, range) {
      var end, start;
      start = Util.tabShiftForPoint(buffer, range.start);
      end = Util.tabShiftForPoint(buffer, range.end);
      return new Range(start, end);
    },
    tabUnshiftForPoint: function(buffer, point) {
      var columnl, columnr, line;
      line = buffer.lineForRow(point.row);
      columnl = 0;
      columnr = point.column;
      while (columnl < columnr) {
        if (!((line != null) && (line[columnl] != null))) {
          break;
        }
        if (line[columnl] === '\t') {
          columnr -= 7;
        }
        columnl += 1;
      }
      return new Point(point.row, columnr);
    },
    tabUnshiftForRange: function(buffer, range) {
      var end, start;
      start = Util.tabUnshiftForPoint(buffer, range.start);
      end = Util.tabUnshiftForPoint(buffer, range.end);
      return new Range(start, end);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRJQUFBO0lBQUE7OztFQUFBLE1BQTRCLE9BQUEsQ0FBUSxNQUFSLENBQTVCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLE9BQTRCLE9BQUEsQ0FBUSxNQUFSLENBQTVCLEVBQUMsMEJBQUQsRUFBWSxjQUFaLEVBQWlCOztFQUNqQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsZUFBUjs7RUFDSixNQUFPLE9BQUEsQ0FBUSxJQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsb0JBQVI7O0VBQ1QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxPQUFSOztFQUVYLFFBQUEsR0FBVzs7RUFDWCxPQUFBLEdBQVU7O0VBRVYsT0FBQSxHQUFVLFNBQUE7QUFDUixRQUFBO0lBRFM7SUFDVCxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBQTtJQUNMLFFBQVEsQ0FBQyxJQUFULENBQ0U7TUFBQSxTQUFBLEVBQVcsRUFBWDtNQUNBLFFBQUEsRUFBVSxRQURWO0tBREY7SUFHQSxRQUFBLEdBQVcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxHQUFEO0FBQWlCLFVBQUE7TUFBZixZQUFEO2FBQWdCLENBQUMsRUFBQSxHQUFLLFNBQU4sQ0FBQSxHQUFtQjtJQUFwQyxDQUFoQjtFQUxIOztFQVFWLFFBQUEsR0FBVyxTQUFDLEVBQUQ7QUFDVCxRQUFBO0lBQUEsR0FBQSxHQUFVLElBQUEsR0FBQSxDQUFJLEVBQUo7SUFDVixHQUFBLEdBQU07SUFDTixHQUFHLENBQUMsT0FBSixDQUFZLFNBQUMsQ0FBRDthQUFP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SUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLEdBQVosRUFBaUIsT0FBakI7SUFUYyxDQWxQcEI7SUE2UEEsa0JBQUEsRUFBb0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNsQixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxrQkFBTCxDQUF3QixNQUF4QixFQUFnQyxLQUFLLENBQUMsS0FBdEM7TUFDUixHQUFBLEdBQU0sSUFBSSxDQUFDLGtCQUFMLENBQXdCLE1BQXhCLEVBQWdDLEtBQUssQ0FBQyxHQUF0QzthQUNGLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiO0lBSGMsQ0E3UHBCOztBQTNCRiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIERpcmVjdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xue2RlbGltaXRlciwgc2VwLCBleHRuYW1lfSA9IHJlcXVpcmUgJ3BhdGgnXG5UZW1wID0gcmVxdWlyZSgndGVtcCcpXG5GUyA9IHJlcXVpcmUoJ2ZzJylcbkNQID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpXG57RU9MfSA9IHJlcXVpcmUoJ29zJylcbkhzVXRpbCA9IHJlcXVpcmUgJ2F0b20taGFza2VsbC11dGlscydcbm9iamNsb25lID0gcmVxdWlyZSAnY2xvbmUnXG5cbmRlYnVnbG9nID0gW11cbmxvZ0tlZXAgPSAzMDAwMCAjbXNcblxuc2F2ZWxvZyA9IChtZXNzYWdlcy4uLikgLT5cbiAgdHMgPSBEYXRlLm5vdygpXG4gIGRlYnVnbG9nLnB1c2hcbiAgICB0aW1lc3RhbXA6IHRzXG4gICAgbWVzc2FnZXM6IG1lc3NhZ2VzXG4gIGRlYnVnbG9nID0gZGVidWdsb2cuZmlsdGVyICh7dGltZXN0YW1wfSkgLT4gKHRzIC0gdGltZXN0YW1wKSA8IGxvZ0tlZXBcbiAgcmV0dXJuXG5cbmpvaW5QYXRoID0gKGRzKSAtPlxuICBzZXQgPSBuZXcgU2V0KGRzKVxuICByZXMgPSBbXVxuICBzZXQuZm9yRWFjaCAoZCkgLT4gcmVzLnB1c2ggZFxuICByZXR1cm4gcmVzLmpvaW4oZGVsaW1pdGVyKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWwgPVxuICBFT1Q6IFwiI3tFT0x9XFx4MDQje0VPTH1cIlxuXG4gIGRlYnVnOiAobWVzc2FnZXMuLi4pIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuZGVidWcnKVxuICAgICAgY29uc29sZS5sb2cgXCJoYXNrZWxsLWdoYy1tb2QgZGVidWc6XCIsIG1lc3NhZ2VzLi4uXG4gICAgc2F2ZWxvZyBtZXNzYWdlcy5tYXAoSlNPTi5zdHJpbmdpZnkpLi4uXG5cbiAgd2FybjogKG1lc3NhZ2VzLi4uKSAtPlxuICAgIGNvbnNvbGUud2FybiBcImhhc2tlbGwtZ2hjLW1vZCB3YXJuaW5nOlwiLCBtZXNzYWdlcy4uLlxuICAgIHNhdmVsb2cgbWVzc2FnZXMubWFwKEpTT04uc3RyaW5naWZ5KS4uLlxuXG4gIGdldERlYnVnTG9nOiAtPlxuICAgIHRzID0gRGF0ZS5ub3coKVxuICAgIGRlYnVnbG9nID0gZGVidWdsb2cuZmlsdGVyICh7dGltZXN0YW1wfSkgLT4gKHRzIC0gdGltZXN0YW1wKSA8IGxvZ0tlZXBcbiAgICBkZWJ1Z2xvZy5tYXAgKHt0aW1lc3RhbXAsIG1lc3NhZ2VzfSkgLT5cbiAgICAgIFwiI3sodGltZXN0YW1wIC0gdHMpIC8gMTAwMH1zOiAje21lc3NhZ2VzLmpvaW4gJywnfVwiXG4gICAgLmpvaW4gRU9MXG5cbiAgZ2V0Um9vdERpckZhbGxiYWNrOiBIc1V0aWwuZ2V0Um9vdERpckZhbGxiYWNrXG5cbiAgZ2V0Um9vdERpcjogSHNVdGlsLmdldFJvb3REaXJcblxuICBpc0RpcmVjdG9yeTogSHNVdGlsLmlzRGlyZWN0b3J5XG5cbiAgZXhlY1Byb21pc2U6IChjbWQsIGFyZ3MsIG9wdHMsIHN0ZGluKSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBVdGlsLmRlYnVnIFwiUnVubmluZyAje2NtZH0gI3thcmdzfSB3aXRoIG9wdHMgPSBcIiwgb3B0c1xuICAgICAgY2hpbGQgPSBDUC5leGVjRmlsZSBjbWQsIGFyZ3MsIG9wdHMsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIFV0aWwud2FybiBzdGRlcnIgaWYgc3RkZXJyXG4gICAgICAgIGlmIGVycm9yP1xuICAgICAgICAgIFV0aWwud2FybihcIlJ1bm5pbmcgI3tjbWR9ICN7YXJnc30gZmFpbGVkIHdpdGggXCIsIGVycm9yKVxuICAgICAgICAgIFV0aWwud2FybiBzdGRvdXQgaWYgc3Rkb3V0XG4gICAgICAgICAgZXJyb3Iuc3RhY2sgPSAobmV3IEVycm9yKS5zdGFja1xuICAgICAgICAgIHJlamVjdCBlcnJvclxuICAgICAgICBlbHNlXG4gICAgICAgICAgVXRpbC5kZWJ1ZyBcIkdvdCByZXNwb25zZSBmcm9tICN7Y21kfSAje2FyZ3N9XCIsIHN0ZG91dDogc3Rkb3V0LCBzdGRlcnI6IHN0ZGVyclxuICAgICAgICAgIHJlc29sdmUgc3Rkb3V0XG4gICAgICBpZiBzdGRpbj9cbiAgICAgICAgVXRpbC5kZWJ1ZyBcInNlbmRpbmcgc3RkaW4gdGV4dCB0byAje2NtZH0gI3thcmdzfVwiXG4gICAgICAgIGNoaWxkLnN0ZGluLndyaXRlIHN0ZGluXG5cbiAgZ2V0Q2FiYWxTYW5kYm94OiAocm9vdFBhdGgpIC0+XG4gICAgVXRpbC5kZWJ1ZyhcIkxvb2tpbmcgZm9yIGNhYmFsIHNhbmRib3guLi5cIilcbiAgICBVdGlsLnBhcnNlU2FuZGJveENvbmZpZyhcIiN7cm9vdFBhdGh9I3tzZXB9Y2FiYWwuc2FuZGJveC5jb25maWdcIilcbiAgICAudGhlbiAoc2JjKSAtPlxuICAgICAgaWYgc2JjP1snaW5zdGFsbC1kaXJzJ10/WydiaW5kaXInXT9cbiAgICAgICAgc2FuZGJveCA9IHNiY1snaW5zdGFsbC1kaXJzJ11bJ2JpbmRpciddXG4gICAgICAgIFV0aWwuZGVidWcoXCJGb3VuZCBjYWJhbCBzYW5kYm94OiBcIiwgc2FuZGJveClcbiAgICAgICAgaWYgVXRpbC5pc0RpcmVjdG9yeShzYW5kYm94KVxuICAgICAgICAgIHNhbmRib3hcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFV0aWwud2FybihcIkNhYmFsIHNhbmRib3ggXCIsIHNhbmRib3gsIFwiIGlzIG5vdCBhIGRpcmVjdG9yeVwiKVxuICAgICAgZWxzZVxuICAgICAgICBVdGlsLndhcm4oXCJObyBjYWJhbCBzYW5kYm94IGZvdW5kXCIpXG5cbiAgZ2V0U3RhY2tTYW5kYm94OiAocm9vdFBhdGgsIGFwZCwgZW52KSAtPlxuICAgIFV0aWwuZGVidWcoXCJMb29raW5nIGZvciBzdGFjayBzYW5kYm94Li4uXCIpXG4gICAgZW52LlBBVEggPSBqb2luUGF0aChhcGQpXG4gICAgVXRpbC5kZWJ1ZyhcIlJ1bm5pbmcgc3RhY2sgd2l0aCBQQVRIIFwiLCBlbnYuUEFUSClcbiAgICBVdGlsLmV4ZWNQcm9taXNlICdzdGFjaycsIFsncGF0aCcsICctLXNuYXBzaG90LWluc3RhbGwtcm9vdCcsICctLWxvY2FsLWluc3RhbGwtcm9vdCcsICctLWJpbi1wYXRoJ10sXG4gICAgICBlbmNvZGluZzogJ3V0Zi04J1xuICAgICAgc3RkaW86ICdwaXBlJ1xuICAgICAgY3dkOiByb290UGF0aFxuICAgICAgZW52OiBlbnZcbiAgICAgIHRpbWVvdXQ6IGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1naGMtbW9kLmluaXRUaW1lb3V0JykgKiAxMDAwXG4gICAgLnRoZW4gKG91dCkgLT5cbiAgICAgIGxpbmVzID0gb3V0LnNwbGl0KEVPTClcbiAgICAgIHNpciA9IGxpbmVzLmZpbHRlcigobCkgLT4gbC5zdGFydHNXaXRoKCdzbmFwc2hvdC1pbnN0YWxsLXJvb3Q6ICcpKVswXS5zbGljZSgyMykgKyBcIiN7c2VwfWJpblwiXG4gICAgICBsaXIgPSBsaW5lcy5maWx0ZXIoKGwpIC0+IGwuc3RhcnRzV2l0aCgnbG9jYWwtaW5zdGFsbC1yb290OiAnKSlbMF0uc2xpY2UoMjApICsgXCIje3NlcH1iaW5cIlxuICAgICAgYnAgPVxuICAgICAgICAgbGluZXMuZmlsdGVyKChsKSAtPiBsLnN0YXJ0c1dpdGgoJ2Jpbi1wYXRoOiAnKSlbMF0uc2xpY2UoMTApLnNwbGl0KGRlbGltaXRlcikuZmlsdGVyIChwKSAtPlxuICAgICAgICAgICBub3QgKChwIGlzIHNpcikgb3IgKHAgaXMgbGlyKSBvciAocCBpbiBhcGQpKVxuICAgICAgVXRpbC5kZWJ1ZyhcIkZvdW5kIHN0YWNrIHNhbmRib3ggXCIsIGxpciwgc2lyLCBicC4uLilcbiAgICAgIHJldHVybiBbbGlyLCBzaXIsIGJwLi4uXVxuICAgIC5jYXRjaCAoZXJyKSAtPlxuICAgICAgVXRpbC53YXJuKFwiTm8gc3RhY2sgc2FuZGJveCBmb3VuZCBiZWNhdXNlIFwiLCBlcnIpXG5cbiAgZ2V0UHJvY2Vzc09wdGlvbnM6IChyb290UGF0aCkgPT5cbiAgICByb290UGF0aCA/PSBVdGlsLmdldFJvb3REaXJGYWxsYmFjaygpLmdldFBhdGgoKVxuICAgICNjYWNoZVxuICAgIEBwcm9jZXNzT3B0aW9uc0NhY2hlID89IG5ldyBNYXAoKVxuICAgIGlmIEBwcm9jZXNzT3B0aW9uc0NhY2hlLmhhcyhyb290UGF0aClcbiAgICAgIHJldHVybiBAcHJvY2Vzc09wdGlvbnNDYWNoZS5nZXQocm9vdFBhdGgpXG5cbiAgICBVdGlsLmRlYnVnIFwiZ2V0UHJvY2Vzc09wdGlvbnMoI3tyb290UGF0aH0pXCJcbiAgICBlbnYgPSBvYmpjbG9uZShwcm9jZXNzLmVudilcblxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgUEFUSCA9IFtdXG4gICAgICBjYXBNYXNrID0gKHN0ciwgbWFzaykgLT5cbiAgICAgICAgYSA9IHN0ci5zcGxpdCAnJ1xuICAgICAgICBmb3IgYywgaSBpbiBhXG4gICAgICAgICAgaWYgbWFzayAmIE1hdGgucG93KDIsIGkpXG4gICAgICAgICAgICBhW2ldID0gYVtpXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHJldHVybiBhLmpvaW4gJydcbiAgICAgIGZvciBtIGluIFswYjExMTEuLjBdXG4gICAgICAgIHZuID0gY2FwTWFzayhcInBhdGhcIiwgbSlcbiAgICAgICAgaWYgZW52W3ZuXT9cbiAgICAgICAgICBQQVRILnB1c2ggZW52W3ZuXVxuICAgICAgZW52LlBBVEggPSBQQVRILmpvaW4gZGVsaW1pdGVyXG5cbiAgICBlbnYuUEFUSCA/PSBcIlwiXG5cbiAgICBhcGQgPSBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5hZGRpdGlvbmFsUGF0aERpcmVjdG9yaWVzJylcbiAgICAgICAgICAuY29uY2F0IGVudi5QQVRILnNwbGl0IGRlbGltaXRlclxuICAgIHNiZCA9IGZhbHNlXG4gICAgY2FiYWxTYW5kYm94ID1cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1naGMtbW9kLmNhYmFsU2FuZGJveCcpXG4gICAgICAgIFV0aWwuZ2V0Q2FiYWxTYW5kYm94KHJvb3RQYXRoKVxuICAgICAgZWxzZVxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSAjIHVuZGVmaW5lZFxuICAgIHN0YWNrU2FuZGJveCA9XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5zdGFja1NhbmRib3gnKVxuICAgICAgICBVdGlsLmdldFN0YWNrU2FuZGJveChyb290UGF0aCwgYXBkLCBvYmpjbG9uZShlbnYpKVxuICAgICAgZWxzZVxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKSAjIHVuZGVmaW5lZFxuICAgIHJlcyA9XG4gICAgICBQcm9taXNlLmFsbChbY2FiYWxTYW5kYm94LCBzdGFja1NhbmRib3hdKVxuICAgICAgLnRoZW4gKFtjYWJhbFNhbmRib3hEaXIsIHN0YWNrU2FuZGJveERpcnNdKSAtPlxuICAgICAgICBuZXdwID0gW11cbiAgICAgICAgaWYgY2FiYWxTYW5kYm94RGlyP1xuICAgICAgICAgIG5ld3AucHVzaCBjYWJhbFNhbmRib3hEaXJcbiAgICAgICAgaWYgc3RhY2tTYW5kYm94RGlycz9cbiAgICAgICAgICBuZXdwLnB1c2ggc3RhY2tTYW5kYm94RGlycy4uLlxuICAgICAgICBuZXdwLnB1c2ggYXBkLi4uXG4gICAgICAgIGVudi5QQVRIID0gam9pblBhdGgobmV3cClcbiAgICAgICAgVXRpbC5kZWJ1ZyBcIlBBVEggPSAje2Vudi5QQVRIfVwiXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY3dkOiByb290UGF0aFxuICAgICAgICAgIGVudjogZW52XG4gICAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCdcbiAgICAgICAgICBtYXhCdWZmZXI6IEluZmluaXR5XG4gICAgICAgIH1cbiAgICBAcHJvY2Vzc09wdGlvbnNDYWNoZS5zZXQocm9vdFBhdGgsIHJlcylcbiAgICByZXR1cm4gcmVzXG5cbiAgZ2V0U3ltYm9sQXRQb2ludDogKGVkaXRvciwgcG9pbnQpIC0+XG4gICAgaW5TY29wZSA9IChzY29wZSwgcG9pbnQpIC0+XG4gICAgICBlZGl0b3JcbiAgICAgIC5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIC5nZXRTY29wZXNBcnJheSgpXG4gICAgICAuc29tZSAodikgLT4gdiBpcyBzY29wZVxuXG4gICAgdGIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBsaW5lID0gdGIucmFuZ2VGb3JSb3cgcG9pbnQucm93XG4gICAgZmluZCA9ICh0ZXN0KSAtPlxuICAgICAgc3RhcnQgPSBlbmQgPSBwb2ludFxuICAgICAgc3RhcnRfID0gc3RhcnQudHJhbnNsYXRlIFswLCAtMV1cbiAgICAgIHdoaWxlIHRlc3Qoc3RhcnRfKSBhbmQgc3RhcnRfLmlzR3JlYXRlclRoYW5PckVxdWFsKGxpbmUuc3RhcnQpXG4gICAgICAgIHN0YXJ0ID0gc3RhcnRfXG4gICAgICAgIHN0YXJ0XyA9IHN0YXJ0LnRyYW5zbGF0ZSBbMCwgLTFdXG4gICAgICB3aGlsZSB0ZXN0KGVuZCkgYW5kIGVuZC5pc0xlc3NUaGFuKGxpbmUuZW5kKVxuICAgICAgICBlbmQgPSBlbmQudHJhbnNsYXRlIFswLCAxXVxuICAgICAgcmV0dXJuIG5ldyBSYW5nZSBzdGFydCwgZW5kXG5cbiAgICByZWdleCA9IC9bXFx3Jy5dL1xuICAgIHNjb3BlcyA9IFtcbiAgICAgICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXG4gICAgICAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaW5maXguaGFza2VsbCdcbiAgICBdXG4gICAgZm9yIHNjb3BlIGluIHNjb3Blc1xuICAgICAgcmFuZ2UgPSBmaW5kIChwKSAtPiBpblNjb3BlKHNjb3BlLCBwKVxuICAgICAgaWYgbm90IHJhbmdlLmlzRW1wdHkoKVxuICAgICAgICBzeW1ib2wgPSB0Yi5nZXRUZXh0SW5SYW5nZSByYW5nZVxuICAgICAgICByZXR1cm4ge3Njb3BlLCByYW5nZSwgc3ltYm9sfVxuXG4gICAgIyBlbHNlXG4gICAgcmFuZ2UgPSBmaW5kICgocCkgLT4gdGIuZ2V0VGV4dEluUmFuZ2UoW3AsIHAudHJhbnNsYXRlKFswLCAxXSldKS5tYXRjaChyZWdleCk/KVxuICAgIHN5bWJvbCA9IHRiLmdldFRleHRJblJhbmdlIHJhbmdlXG4gICAgcmV0dXJuIHtyYW5nZSwgc3ltYm9sfVxuXG4gIGdldFN5bWJvbEluUmFuZ2U6IChlZGl0b3IsIGNyYW5nZSkgLT5cbiAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBpZiBjcmFuZ2UuaXNFbXB0eSgpXG4gICAgICBVdGlsLmdldFN5bWJvbEF0UG9pbnQgZWRpdG9yLCBjcmFuZ2Uuc3RhcnRcbiAgICBlbHNlXG4gICAgICBzeW1ib2w6IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZSBjcmFuZ2VcbiAgICAgIHJhbmdlOiBjcmFuZ2VcblxuXG4gIHdpdGhUZW1wRmlsZTogKGNvbnRlbnRzLCB1cmksIGdlbikgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgVGVtcC5vcGVuIHtwcmVmaXg6ICdoYXNrZWxsLWdoYy1tb2QnLCBzdWZmaXg6IGV4dG5hbWUgdXJpIG9yIFwiLmhzXCJ9LFxuICAgICAgICAoZXJyLCBpbmZvKSAtPlxuICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgcmVqZWN0IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc29sdmUgaW5mb1xuICAgIC50aGVuIChpbmZvKSAtPlxuICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgICAgRlMud3JpdGUgaW5mby5mZCwgY29udGVudHMsIChlcnIpIC0+XG4gICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICByZWplY3QgZXJyXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZ2VuKGluZm8ucGF0aCkudGhlbiAocmVzKSAtPlxuICAgICAgICAgICAgICBGUy5jbG9zZSBpbmZvLmZkLCAtPiBGUy51bmxpbmsgaW5mby5wYXRoXG4gICAgICAgICAgICAgIHJlc29sdmUgcmVzLm1hcCAobGluZSkgLT5cbiAgICAgICAgICAgICAgICBsaW5lLnNwbGl0KGluZm8ucGF0aCkuam9pbih1cmkpXG5cbiAgbWtFcnJvcjogKG5hbWUsIG1lc3NhZ2UpIC0+XG4gICAgZXJyID0gbmV3IEVycm9yIG1lc3NhZ2VcbiAgICBlcnIubmFtZSA9IG5hbWVcbiAgICByZXR1cm4gZXJyXG5cbiAgcGFyc2VTYW5kYm94Q29uZmlnOiAoZmlsZSkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgRlMucmVhZEZpbGUgZmlsZSwgZW5jb2Rpbmc6ICd1dGYtOCcsIChlcnIsIHNiYykgLT5cbiAgICAgICAgaWYgZXJyP1xuICAgICAgICAgIHJlamVjdCBlcnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc29sdmUgc2JjXG4gICAgLnRoZW4gKHNiYykgLT5cbiAgICAgIHZhcnMgPSB7fVxuICAgICAgc2NvcGUgPSB2YXJzXG4gICAgICBydiA9ICh2KSAtPlxuICAgICAgICBmb3IgazEsIHYxIG9mIHNjb3BlXG4gICAgICAgICAgdiA9IHYuc3BsaXQoXCIkI3trMX1cIikuam9pbih2MSlcbiAgICAgICAgcmV0dXJuIHZcbiAgICAgIHNiYy5zcGxpdCgvXFxyP1xcbnxcXHIvKS5mb3JFYWNoIChsaW5lKSAtPlxuICAgICAgICB1bmxlc3MgbGluZS5tYXRjaCgvXlxccyotLS8pIG9yIGxpbmUubWF0Y2goL15cXHMqJC8pXG4gICAgICAgICAgW2xdID0gbGluZS5zcGxpdCAvLS0vXG4gICAgICAgICAgaWYgbSA9IGxpbmUubWF0Y2ggL15cXHMqKFtcXHctXSspOlxccyooLiopXFxzKiQvXG4gICAgICAgICAgICBbXywgbmFtZSwgdmFsXSA9IG1cbiAgICAgICAgICAgIHNjb3BlW25hbWVdID0gcnYodmFsKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5ld3Njb3BlID0ge31cbiAgICAgICAgICAgIHNjb3BlW2xpbmVdID0gbmV3c2NvcGVcbiAgICAgICAgICAgIHNjb3BlID0gbmV3c2NvcGVcbiAgICAgIHJldHVybiB2YXJzXG4gICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICBVdGlsLndhcm4gXCJSZWFkaW5nIGNhYmFsIHNhbmRib3ggY29uZmlnIGZhaWxlZCB3aXRoIFwiLCBlcnJcblxuICAjIEEgZGlydHkgaGFjayB0byB3b3JrIHdpdGggdGFic1xuICB0YWJTaGlmdEZvclBvaW50OiAoYnVmZmVyLCBwb2ludCkgLT5cbiAgICBjb2x1bW5TaGlmdCA9IDcgKiAoYnVmZmVyLmxpbmVGb3JSb3cocG9pbnQucm93KS5zbGljZSgwLCBwb2ludC5jb2x1bW4pLm1hdGNoKC9cXHQvZyk/Lmxlbmd0aCBvciAwKVxuICAgIG5ldyBQb2ludChwb2ludC5yb3csIHBvaW50LmNvbHVtbiArIGNvbHVtblNoaWZ0KVxuXG4gIHRhYlNoaWZ0Rm9yUmFuZ2U6IChidWZmZXIsIHJhbmdlKSAtPlxuICAgIHN0YXJ0ID0gVXRpbC50YWJTaGlmdEZvclBvaW50KGJ1ZmZlciwgcmFuZ2Uuc3RhcnQpXG4gICAgZW5kID0gVXRpbC50YWJTaGlmdEZvclBvaW50KGJ1ZmZlciwgcmFuZ2UuZW5kKVxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIHRhYlVuc2hpZnRGb3JQb2ludDogKGJ1ZmZlciwgcG9pbnQpIC0+XG4gICAgbGluZSA9IGJ1ZmZlci5saW5lRm9yUm93KHBvaW50LnJvdylcbiAgICBjb2x1bW5sID0gMFxuICAgIGNvbHVtbnIgPSBwb2ludC5jb2x1bW5cbiAgICB3aGlsZShjb2x1bW5sIDwgY29sdW1ucilcbiAgICAgIGJyZWFrIHVubGVzcyBsaW5lPyBhbmQgbGluZVtjb2x1bW5sXT9cbiAgICAgIGlmIGxpbmVbY29sdW1ubF0gaXMgJ1xcdCdcbiAgICAgICAgY29sdW1uciAtPSA3XG4gICAgICBjb2x1bW5sICs9IDFcbiAgICBuZXcgUG9pbnQocG9pbnQucm93LCBjb2x1bW5yKVxuXG4gIHRhYlVuc2hpZnRGb3JSYW5nZTogKGJ1ZmZlciwgcmFuZ2UpIC0+XG4gICAgc3RhcnQgPSBVdGlsLnRhYlVuc2hpZnRGb3JQb2ludChidWZmZXIsIHJhbmdlLnN0YXJ0KVxuICAgIGVuZCA9IFV0aWwudGFiVW5zaGlmdEZvclBvaW50KGJ1ZmZlciwgcmFuZ2UuZW5kKVxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuIl19
