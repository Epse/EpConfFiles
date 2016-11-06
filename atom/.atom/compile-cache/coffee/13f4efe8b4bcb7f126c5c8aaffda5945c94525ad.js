(function() {
  var CP, Directory, EOL, FS, HsUtil, Point, Range, Temp, Util, debuglog, delimiter, extname, joinPath, logKeep, objclone, savelog, sep, _ref, _ref1,
    __slice = [].slice;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Directory = _ref.Directory;

  _ref1 = require('path'), delimiter = _ref1.delimiter, sep = _ref1.sep, extname = _ref1.extname;

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
    messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    ts = Date.now();
    debuglog.push({
      timestamp: ts,
      messages: messages
    });
    debuglog = debuglog.filter(function(_arg) {
      var timestamp;
      timestamp = _arg.timestamp;
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
    EOT: "" + EOL + "\x04" + EOL,
    debug: function() {
      var messages;
      messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (atom.config.get('haskell-ghc-mod.debug')) {
        console.log.apply(console, ["haskell-ghc-mod debug:"].concat(__slice.call(messages)));
      }
      return savelog.apply(null, messages.map(JSON.stringify));
    },
    warn: function() {
      var messages;
      messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      console.warn.apply(console, ["haskell-ghc-mod warning:"].concat(__slice.call(messages)));
      return savelog.apply(null, messages.map(JSON.stringify));
    },
    getDebugLog: function() {
      var ts;
      ts = Date.now();
      debuglog = debuglog.filter(function(_arg) {
        var timestamp;
        timestamp = _arg.timestamp;
        return (ts - timestamp) < logKeep;
      });
      return debuglog.map(function(_arg) {
        var messages, timestamp;
        timestamp = _arg.timestamp, messages = _arg.messages;
        return "" + ((timestamp - ts) / 1000) + "s: " + (messages.join(','));
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
        var sandbox, _ref2;
        if ((sbc != null ? (_ref2 = sbc['install-dirs']) != null ? _ref2['bindir'] : void 0 : void 0) != null) {
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
      return Util.execPromise('stack', ['path', '--snapshot-install-root', '--local-install-root'], {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: rootPath,
        env: env,
        timeout: atom.config.get('haskell-ghc-mod.initTimeout') * 1000
      }).then(function(out) {
        var lines, lir, sir;
        lines = out.split(EOL);
        sir = lines.filter(function(l) {
          return l.startsWith('snapshot-install-root: ');
        })[0].slice(23) + ("" + sep + "bin");
        lir = lines.filter(function(l) {
          return l.startsWith('local-install-root: ');
        })[0].slice(20) + ("" + sep + "bin");
        Util.debug("Found stack sandbox ", lir, sir);
        return [lir, sir];
      })["catch"](function(err) {
        return Util.warn("No stack sandbox found because ", err);
      });
    },
    getProcessOptions: (function(_this) {
      return function(rootPath) {
        var PATH, apd, cabalSandbox, capMask, env, m, res, sbd, stackSandbox, vn, _i;
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
            var a, c, i, _i, _len;
            a = str.split('');
            for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
              c = a[i];
              if (mask & Math.pow(2, i)) {
                a[i] = a[i].toUpperCase();
              }
            }
            return a.join('');
          };
          for (m = _i = 0xf; _i >= 0; m = --_i) {
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
        res = Promise.all([cabalSandbox, stackSandbox]).then(function(_arg) {
          var cabalSandboxDir, newp, stackSandboxDirs;
          cabalSandboxDir = _arg[0], stackSandboxDirs = _arg[1];
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
            maxBuffer: Infinity
          };
        });
        _this.processOptionsCache.set(rootPath, res);
        return res;
      };
    })(this),
    getSymbolAtPoint: function(editor, point) {
      var find, inScope, line, range, regex, scope, scopes, symbol, tb, _i, _len;
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
      for (_i = 0, _len = scopes.length; _i < _len; _i++) {
        scope = scopes[_i];
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
          var l, m, name, newscope, val, _;
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
      var columnShift, _ref2;
      columnShift = 7 * (((_ref2 = buffer.lineForRow(point.row).slice(0, point.column).match(/\t/g)) != null ? _ref2.length : void 0) || 0);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvdXRpbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOElBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLE9BQTRCLE9BQUEsQ0FBUSxNQUFSLENBQTVCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsaUJBQUEsU0FBZixDQUFBOztBQUFBLEVBQ0EsUUFBNEIsT0FBQSxDQUFRLE1BQVIsQ0FBNUIsRUFBQyxrQkFBQSxTQUFELEVBQVksWUFBQSxHQUFaLEVBQWlCLGdCQUFBLE9BRGpCLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsZUFBUixDQUpMLENBQUE7O0FBQUEsRUFLQyxNQUFPLE9BQUEsQ0FBUSxJQUFSLEVBQVAsR0FMRCxDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQkFBUixDQU5ULENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQVcsT0FBQSxDQUFRLE9BQVIsQ0FQWCxDQUFBOztBQUFBLEVBU0EsUUFBQSxHQUFXLEVBVFgsQ0FBQTs7QUFBQSxFQVVBLE9BQUEsR0FBVSxLQVZWLENBQUE7O0FBQUEsRUFZQSxPQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxZQUFBO0FBQUEsSUFEUyxrRUFDVCxDQUFBO0FBQUEsSUFBQSxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFMLENBQUE7QUFBQSxJQUNBLFFBQVEsQ0FBQyxJQUFULENBQ0U7QUFBQSxNQUFBLFNBQUEsRUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/util.coffee
