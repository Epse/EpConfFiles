(function() {
  var CompositeDisposable, Directory, Emitter, GhcModiProcess, GhcModiProcessReal, Point, Queue, Range, Util, extname, unlitSync, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Directory = _ref.Directory;

  Util = require('../util');

  extname = require('path').extname;

  Queue = require('promise-queue');

  unlitSync = require('atom-haskell-utils').unlitSync;

  _ = require('underscore-plus');

  GhcModiProcessReal = require('./ghc-modi-process-real.coffee');

  _ = require('underscore-plus');

  module.exports = GhcModiProcess = (function() {
    GhcModiProcess.prototype.backend = null;

    GhcModiProcess.prototype.commandQueues = null;

    function GhcModiProcess() {
      this.doCheckAndLint = __bind(this.doCheckAndLint, this);
      this.doLintBuffer = __bind(this.doLintBuffer, this);
      this.doCheckBuffer = __bind(this.doCheckBuffer, this);
      this.doCheckOrLintBuffer = __bind(this.doCheckOrLintBuffer, this);
      this.findSymbolProvidersInBuffer = __bind(this.findSymbolProvidersInBuffer, this);
      this.getInfoInBuffer = __bind(this.getInfoInBuffer, this);
      this.doSigFill = __bind(this.doSigFill, this);
      this.doCaseSplit = __bind(this.doCaseSplit, this);
      this.getTypeInBuffer = __bind(this.getTypeInBuffer, this);
      this.runBrowse = __bind(this.runBrowse, this);
      this.runFlag = __bind(this.runFlag, this);
      this.runLang = __bind(this.runLang, this);
      this.runList = __bind(this.runList, this);
      this.queueCmd = __bind(this.queueCmd, this);
      this.onQueueIdle = __bind(this.onQueueIdle, this);
      this.onBackendIdle = __bind(this.onBackendIdle, this);
      this.onBackendActive = __bind(this.onBackendActive, this);
      this.onDidDestroy = __bind(this.onDidDestroy, this);
      this.destroy = __bind(this.destroy, this);
      this.killProcess = __bind(this.killProcess, this);
      this.createQueues = __bind(this.createQueues, this);
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      this.bufferDirMap = new WeakMap;
      this.backend = new Map;
      this.createQueues();
    }

    GhcModiProcess.prototype.getRootDir = function(buffer) {
      var dir;
      dir = this.bufferDirMap.get(buffer);
      if (dir != null) {
        return dir;
      }
      dir = Util.getRootDir(buffer);
      this.bufferDirMap.set(buffer, dir);
      return dir;
    };

    GhcModiProcess.prototype.initBackend = function(rootDir) {
      var backend, procopts, rootPath, vers;
      rootPath = rootDir.getPath();
      if (this.backend.has(rootPath)) {
        return this.backend.get(rootPath);
      }
      procopts = Util.getProcessOptions(rootPath);
      vers = procopts.then((function(_this) {
        return function(opts) {
          return _this.getVersion(opts);
        };
      })(this));
      vers.then((function(_this) {
        return function(v) {
          return procopts.then(function(opts) {
            return _this.checkComp(opts, v);
          });
        };
      })(this));
      backend = vers.then(this.getCaps).then((function(_this) {
        return function(caps) {
          _this.caps = caps;
          return procopts.then(function(opts) {
            return new GhcModiProcessReal(_this.caps, rootDir, opts);
          });
        };
      })(this))["catch"](function(err) {
        atom.notifications.addFatalError("Haskell-ghc-mod: ghc-mod failed to launch. It is probably missing or misconfigured. " + err.code, {
          detail: "" + err + "\nPATH: " + process.env.PATH + "\npath: " + process.env.path + "\nPath: " + process.env.Path,
          stack: err.stack,
          dismissable: true
        });
        return null;
      });
      this.backend.set(rootPath, backend);
      return backend;
    };

    GhcModiProcess.prototype.createQueues = function() {
      this.commandQueues = {
        checklint: new Queue(2),
        browse: null,
        typeinfo: new Queue(1),
        find: new Queue(1),
        init: new Queue(4),
        list: new Queue(1),
        lowmem: new Queue(1)
      };
      return this.disposables.add(atom.config.observe('haskell-ghc-mod.maxBrowseProcesses', (function(_this) {
        return function(value) {
          return _this.commandQueues.browse = new Queue(value);
        };
      })(this)));
    };

    GhcModiProcess.prototype.getVersion = function(opts) {
      var cmd, timeout;
      timeout = atom.config.get('haskell-ghc-mod.initTimeout') * 1000;
      cmd = atom.config.get('haskell-ghc-mod.ghcModPath');
      return Util.execPromise(cmd, ['version'], _.extend({
        timeout: timeout
      }, opts)).then(function(stdout) {
        var comp, vers;
        vers = /^ghc-mod version (\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/.exec(stdout).slice(1, 5).map(function(i) {
          return parseInt(i);
        });
        comp = /GHC (.+)$/.exec(stdout.trim())[1];
        Util.debug("Ghc-mod " + vers + " built with " + comp);
        return {
          vers: vers,
          comp: comp
        };
      });
    };

    GhcModiProcess.prototype.checkComp = function(opts, _arg) {
      var comp, pathghc, stackghc, timeout;
      comp = _arg.comp;
      timeout = atom.config.get('haskell-ghc-mod.initTimeout') * 1000;
      stackghc = Util.execPromise('stack', ['ghc', '--', '--numeric-version'], _.extend({
        timeout: timeout
      }, opts)).then(function(stdout) {
        return stdout.trim();
      })["catch"](function(error) {
        Util.warn(error);
        return null;
      });
      pathghc = Util.execPromise('ghc', ['--numeric-version'], _.extend({
        timeout: timeout
      }, opts)).then(function(stdout) {
        return stdout.trim();
      })["catch"](function(error) {
        Util.warn(error);
        return null;
      });
      return Promise.all([stackghc, pathghc]).then(function(_arg1) {
        var pathghc, stackghc, warn;
        stackghc = _arg1[0], pathghc = _arg1[1];
        Util.debug("Stack GHC version " + stackghc);
        Util.debug("Path GHC version " + pathghc);
        if ((stackghc != null) && stackghc !== comp) {
          warn = "GHC version in your Stack '" + stackghc + "' doesn't match with GHC version used to build ghc-mod '" + comp + "'. This can lead to problems when using Stack projects";
          atom.notifications.addWarning(warn);
          Util.warn(warn);
        }
        if ((pathghc != null) && pathghc !== comp) {
          warn = "GHC version in your PATH '" + pathghc + "' doesn't match with GHC version used to build ghc-mod '" + comp + "'. This can lead to problems when using Cabal or Plain projects";
          atom.notifications.addWarning(warn);
          return Util.warn(warn);
        }
      });
    };

    GhcModiProcess.prototype.getCaps = function(_arg) {
      var atLeast, caps, exact, vers;
      vers = _arg.vers;
      caps = {
        version: vers,
        fileMap: false,
        quoteArgs: false,
        optparse: false,
        typeConstraints: false,
        browseParents: false,
        interactiveCaseSplit: false
      };
      atLeast = function(b) {
        var i, v, _i, _len;
        for (i = _i = 0, _len = b.length; _i < _len; i = ++_i) {
          v = b[i];
          if (vers[i] > v) {
            return true;
          } else if (vers[i] < v) {
            return false;
          }
        }
        return true;
      };
      exact = function(b) {
        var i, v, _i, _len;
        for (i = _i = 0, _len = b.length; _i < _len; i = ++_i) {
          v = b[i];
          if (vers[i] !== v) {
            return false;
          }
        }
        return true;
      };
      if (!atLeast([5, 4])) {
        atom.notifications.addError("Haskell-ghc-mod: ghc-mod < 5.4 is not supported. Use at your own risk or update your ghc-mod installation", {
          dismissable: true
        });
      }
      if (exact([5, 4])) {
        atom.notifications.addWarning("Haskell-ghc-mod: ghc-mod 5.4.* is deprecated. Use at your own risk or update your ghc-mod installation", {
          dismissable: true
        });
      }
      if (atLeast([5, 4])) {
        caps.fileMap = true;
      }
      if (atLeast([5, 5])) {
        caps.quoteArgs = true;
        caps.optparse = true;
      }
      if (atLeast([5, 6]) || atom.config.get('haskell-ghc-mod.experimental')) {
        caps.typeConstraints = true;
        caps.browseParents = true;
        caps.interactiveCaseSplit = true;
      }
      Util.debug(JSON.stringify(caps));
      return caps;
    };

    GhcModiProcess.prototype.killProcess = function() {
      this.backend.forEach(function(v) {
        return v.then(function(backend) {
          return backend != null ? typeof backend.killProcess === "function" ? backend.killProcess() : void 0 : void 0;
        });
      });
      return this.backend.clear();
    };

    GhcModiProcess.prototype.destroy = function() {
      this.backend.forEach(function(v) {
        return v.then(function(backend) {
          return backend != null ? typeof backend.destroy === "function" ? backend.destroy() : void 0 : void 0;
        });
      });
      this.backend.clear();
      this.emitter.emit('did-destroy');
      this.disposables.dispose();
      this.commandQueues = null;
      return this.backend = null;
    };

    GhcModiProcess.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    GhcModiProcess.prototype.onBackendActive = function(callback) {
      return this.emitter.on('backend-active', callback);
    };

    GhcModiProcess.prototype.onBackendIdle = function(callback) {
      return this.emitter.on('backend-idle', callback);
    };

    GhcModiProcess.prototype.onQueueIdle = function(callback) {
      return this.emitter.on('queue-idle', callback);
    };

    GhcModiProcess.prototype.queueCmd = function(queueName, runArgs, backend) {
      var promise, qe;
      if (!((runArgs.buffer != null) || (runArgs.dir != null))) {
        throw new Error("Neither dir nor buffer is set in queueCmd invocation");
      }
      if (atom.config.get('haskell-ghc-mod.lowMemorySystem')) {
        queueName = 'lowmem';
      }
      if (runArgs.buffer != null) {
        if (runArgs.dir == null) {
          runArgs.dir = this.getRootDir(runArgs.buffer);
        }
      }
      if (backend == null) {
        return this.initBackend(runArgs.dir).then((function(_this) {
          return function(backend) {
            if (backend != null) {
              return _this.queueCmd(queueName, runArgs, backend);
            } else {
              return [];
            }
          };
        })(this));
      }
      qe = (function(_this) {
        return function(qn) {
          var q;
          q = _this.commandQueues[qn];
          return q.getQueueLength() + q.getPendingLength() === 0;
        };
      })(this);
      promise = this.commandQueues[queueName].add((function(_this) {
        return function() {
          var globalSettings, localSettings, rd;
          _this.emitter.emit('backend-active');
          rd = runArgs.dir || Util.getRootDir(runArgs.options.cwd);
          localSettings = new Promise(function(resolve, reject) {
            var file;
            file = rd.getFile('.haskell-ghc-mod.json');
            return file.exists().then(function(ex) {
              if (ex) {
                return file.read().then(function(contents) {
                  var err;
                  try {
                    return resolve(JSON.parse(contents));
                  } catch (_error) {
                    err = _error;
                    atom.notifications.addError('Failed to parse .haskell-ghc-mod.json', {
                      detail: err,
                      dismissable: true
                    });
                    return reject(err);
                  }
                });
              } else {
                return reject();
              }
            });
          })["catch"](function(error) {
            if (error != null) {
              Util.warn(error);
            }
            return {};
          });
          globalSettings = new Promise(function(resolve, reject) {
            var configDir, file;
            configDir = new Directory(atom.getConfigDirPath());
            file = configDir.getFile('haskell-ghc-mod.json');
            return file.exists().then(function(ex) {
              if (ex) {
                return file.read().then(function(contents) {
                  var err;
                  try {
                    return resolve(JSON.parse(contents));
                  } catch (_error) {
                    err = _error;
                    atom.notifications.addError('Failed to parse haskell-ghc-mod.json', {
                      detail: err,
                      dismissable: true
                    });
                    return reject(err);
                  }
                });
              } else {
                return reject();
              }
            });
          })["catch"](function(error) {
            if (error != null) {
              Util.warn(error);
            }
            return {};
          });
          return Promise.all([globalSettings, localSettings]).then(function(_arg) {
            var glob, loc;
            glob = _arg[0], loc = _arg[1];
            return _.extend(glob, loc);
          }).then(function(settings) {
            if (settings.disable) {
              throw new Error("Ghc-mod disabled in settings");
            }
            runArgs.suppressErrors = settings.suppressErrors;
            runArgs.ghcOptions = settings.ghcOptions;
            return runArgs.ghcModOptions = settings.ghcModOptions;
          }).then(function() {
            return backend.run(runArgs);
          })["catch"](function(err) {
            Util.warn(err);
            return [];
          });
        };
      })(this));
      promise.then((function(_this) {
        return function(res) {
          var k;
          if (qe(queueName)) {
            _this.emitter.emit('queue-idle', {
              queue: queueName
            });
            if (((function() {
              var _results;
              _results = [];
              for (k in this.commandQueues) {
                _results.push(k);
              }
              return _results;
            }).call(_this)).every(qe)) {
              return _this.emitter.emit('backend-idle');
            }
          }
        };
      })(this));
      return promise;
    };

    GhcModiProcess.prototype.runList = function(buffer) {
      return this.queueCmd('list', {
        buffer: buffer,
        command: 'list'
      });
    };

    GhcModiProcess.prototype.runLang = function(dir) {
      return this.queueCmd('init', {
        command: 'lang',
        dir: dir
      });
    };

    GhcModiProcess.prototype.runFlag = function(dir) {
      return this.queueCmd('init', {
        command: 'flag',
        dir: dir
      });
    };

    GhcModiProcess.prototype.runBrowse = function(rootDir, modules) {
      return this.queueCmd('browse', {
        dir: rootDir,
        command: 'browse',
        dashArgs: function(caps) {
          var args;
          args = ['-d'];
          if (caps.browseParents) {
            args.push('-p');
          }
          return args;
        },
        args: modules
      }).then((function(_this) {
        return function(lines) {
          return lines.map(function(s) {
            var name, parent, symbolType, typeSignature, _ref1, _ref2;
            _ref1 = s.split(' :: '), name = _ref1[0], typeSignature = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
            typeSignature = typeSignature.join(' :: ').trim();
            if (_this.caps.browseParents) {
              _ref2 = typeSignature.split(' -- from:').map(function(v) {
                return v.trim();
              }), typeSignature = _ref2[0], parent = _ref2[1];
            }
            name = name.trim();
            if (/^(?:type|data|newtype)/.test(typeSignature)) {
              symbolType = 'type';
            } else if (/^(?:class)/.test(typeSignature)) {
              symbolType = 'class';
            } else {
              symbolType = 'function';
            }
            return {
              name: name,
              typeSignature: typeSignature,
              symbolType: symbolType,
              parent: parent
            };
          });
        };
      })(this));
    };

    GhcModiProcess.prototype.getTypeInBuffer = function(buffer, crange) {
      if (buffer.getUri() == null) {
        return Promise.resolve(null);
      }
      crange = Util.tabShiftForRange(buffer, crange);
      return this.queueCmd('typeinfo', {
        interactive: true,
        buffer: buffer,
        command: 'type',
        uri: buffer.getUri(),
        text: buffer.isModified() ? buffer.getText() : void 0,
        dashArgs: function(caps) {
          var args;
          args = [];
          if (caps.typeConstraints) {
            args.push('-c');
          }
          return args;
        },
        args: [crange.start.row + 1, crange.start.column + 1]
      }).then(function(lines) {
        var range, type, _ref1;
        _ref1 = lines.reduce((function(acc, line) {
          var colend, colstart, line_, myrange, rowend, rowstart, rx, text, type, _ref1;
          if (acc !== '') {
            return acc;
          }
          rx = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+"([^]*)"$/;
          _ref1 = line.match(rx), line_ = _ref1[0], rowstart = _ref1[1], colstart = _ref1[2], rowend = _ref1[3], colend = _ref1[4], text = _ref1[5];
          type = text.replace(/\\"/g, '"');
          myrange = Range.fromObject([[parseInt(rowstart) - 1, parseInt(colstart) - 1], [parseInt(rowend) - 1, parseInt(colend) - 1]]);
          if (myrange.isEmpty()) {
            return acc;
          }
          if (!myrange.containsRange(crange)) {
            return acc;
          }
          myrange = Util.tabUnshiftForRange(buffer, myrange);
          return [myrange, type];
        }), ''), range = _ref1[0], type = _ref1[1];
        if (!range) {
          range = crange;
        }
        if (type) {
          return {
            range: range,
            type: type
          };
        } else {
          throw new Error("No type");
        }
      });
    };

    GhcModiProcess.prototype.doCaseSplit = function(buffer, crange) {
      var _ref1, _ref2;
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      crange = Util.tabShiftForRange(buffer, crange);
      return this.queueCmd('typeinfo', {
        interactive: (_ref1 = (_ref2 = this.caps) != null ? _ref2.interactiveCaseSplit : void 0) != null ? _ref1 : false,
        buffer: buffer,
        command: 'split',
        uri: buffer.getUri(),
        text: buffer.isModified() ? buffer.getText() : void 0,
        args: [crange.start.row + 1, crange.start.column + 1]
      }).then(function(lines) {
        var rx;
        rx = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+"([^]*)"$/;
        return lines.filter(function(line) {
          if (line.match(rx) == null) {
            Util.warn("ghc-mod says: " + line);
            return false;
          }
          return true;
        }).map(function(line) {
          var colend, colstart, line_, rowend, rowstart, text, _ref1;
          _ref1 = line.match(rx), line_ = _ref1[0], rowstart = _ref1[1], colstart = _ref1[2], rowend = _ref1[3], colend = _ref1[4], text = _ref1[5];
          return {
            range: Range.fromObject([[parseInt(rowstart) - 1, parseInt(colstart) - 1], [parseInt(rowend) - 1, parseInt(colend) - 1]]),
            replacement: text
          };
        });
      });
    };

    GhcModiProcess.prototype.doSigFill = function(buffer, crange) {
      var _ref1, _ref2;
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      crange = Util.tabShiftForRange(buffer, crange);
      return this.queueCmd('typeinfo', {
        interactive: (_ref1 = (_ref2 = this.caps) != null ? _ref2.interactiveCaseSplit : void 0) != null ? _ref1 : false,
        buffer: buffer,
        command: 'sig',
        uri: buffer.getUri(),
        text: buffer.isModified() ? buffer.getText() : void 0,
        args: [crange.start.row + 1, crange.start.column + 1]
      }).then(function(lines) {
        var colend, colstart, line_, range, rowend, rowstart, rx, _ref1;
        if (lines[0] == null) {
          return [];
        }
        rx = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/;
        _ref1 = lines[1].match(rx), line_ = _ref1[0], rowstart = _ref1[1], colstart = _ref1[2], rowend = _ref1[3], colend = _ref1[4];
        range = Range.fromObject([[parseInt(rowstart) - 1, parseInt(colstart) - 1], [parseInt(rowend) - 1, parseInt(colend) - 1]]);
        return [
          {
            type: lines[0],
            range: range,
            body: lines.slice(2).join('\n')
          }
        ];
      });
    };

    GhcModiProcess.prototype.getInfoInBuffer = function(editor, crange) {
      var buffer, range, symbol, _ref1;
      buffer = editor.getBuffer();
      if (buffer.getUri() == null) {
        return Promise.resolve(null);
      }
      _ref1 = Util.getSymbolInRange(editor, crange), symbol = _ref1.symbol, range = _ref1.range;
      return this.queueCmd('typeinfo', {
        interactive: true,
        buffer: buffer,
        command: 'info',
        uri: buffer.getUri(),
        text: buffer.isModified() ? buffer.getText() : void 0,
        args: [symbol]
      }).then(function(lines) {
        var info;
        info = lines.join('\n');
        if (info === 'Cannot show info' || !info) {
          throw new Error("No info");
        } else {
          return {
            range: range,
            info: info
          };
        }
      });
    };

    GhcModiProcess.prototype.findSymbolProvidersInBuffer = function(editor, crange) {
      var buffer, symbol;
      buffer = editor.getBuffer();
      symbol = Util.getSymbolInRange(editor, crange).symbol;
      return this.queueCmd('find', {
        interactive: true,
        buffer: buffer,
        command: 'find',
        args: [symbol]
      });
    };

    GhcModiProcess.prototype.doCheckOrLintBuffer = function(cmd, buffer, fast) {
      var args, line, m, mess, olduri, text, uri, _ref1, _ref2;
      if (buffer.isEmpty()) {
        return Promise.resolve([]);
      }
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      olduri = uri = buffer.getUri();
      text = cmd === 'lint' && extname(uri) === '.lhs' ? (uri = uri.slice(0, -1), unlitSync(olduri, buffer.getText())) : buffer.isModified() ? buffer.getText() : void 0;
      if ((text != null ? text.error : void 0) != null) {
        _ref1 = text.error.match(/^(.*?):([0-9]+): *(.*) *$/), m = _ref1[0], uri = _ref1[1], line = _ref1[2], mess = _ref1[3];
        return Promise.resolve([
          {
            uri: uri,
            position: new Point(line - 1, 0),
            message: mess,
            severity: 'lint'
          }
        ]);
      }
      if (cmd === 'lint') {
        args = (_ref2 = []).concat.apply(_ref2, atom.config.get('haskell-ghc-mod.hlintOptions').map(function(v) {
          return ['--hlintOpt', v];
        }));
      }
      return this.queueCmd('checklint', {
        interactive: fast,
        buffer: buffer,
        command: cmd,
        uri: uri,
        text: text,
        args: args
      }).then((function(_this) {
        return function(lines) {
          var rootDir, rx;
          rootDir = _this.getRootDir(buffer);
          rx = /^(.*?):([0-9\s]+):([0-9\s]+): *(?:(Warning|Error): *)?/;
          return lines.filter(function(line) {
            switch (false) {
              case !line.startsWith('Dummy:0:0:Error:'):
                atom.notifications.addError(line.slice(16));
                break;
              case !line.startsWith('Dummy:0:0:Warning:'):
                atom.notifications.addWarning(line.slice(18));
                break;
              case line.match(rx) == null:
                return true;
              case !(line.trim().length > 0):
                Util.warn("ghc-mod says: " + line);
            }
            return false;
          }).map(function(line) {
            var col, file, match, messPos, row, severity, warning, _ref3;
            match = line.match(rx);
            m = match[0], file = match[1], row = match[2], col = match[3], warning = match[4];
            if (uri.endsWith(file)) {
              file = olduri;
            }
            severity = cmd === 'lint' ? 'lint' : warning === 'Warning' ? 'warning' : 'error';
            messPos = new Point(row - 1, col - 1);
            messPos = Util.tabUnshiftForPoint(buffer, messPos);
            return {
              uri: (_ref3 = ((function() {
                try {
                  return rootDir.getFile(rootDir.relativize(file)).getPath();
                } catch (_error) {}
              })())) != null ? _ref3 : file,
              position: messPos,
              message: line.replace(m, ''),
              severity: severity
            };
          });
        };
      })(this));
    };

    GhcModiProcess.prototype.doCheckBuffer = function(buffer, fast) {
      return this.doCheckOrLintBuffer("check", buffer, fast);
    };

    GhcModiProcess.prototype.doLintBuffer = function(buffer, fast) {
      return this.doCheckOrLintBuffer("lint", buffer, fast);
    };

    GhcModiProcess.prototype.doCheckAndLint = function(buffer, fast) {
      return Promise.all([this.doCheckBuffer(buffer, fast), this.doLintBuffer(buffer, fast)]).then(function(resArr) {
        var _ref1;
        return (_ref1 = []).concat.apply(_ref1, resArr);
      });
    };

    return GhcModiProcess;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvZ2hjLW1vZC9naGMtbW9kaS1wcm9jZXNzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtSUFBQTtJQUFBO3NCQUFBOztBQUFBLEVBQUEsT0FBMEQsT0FBQSxDQUFRLE1BQVIsQ0FBMUQsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSxlQUFBLE9BQWYsRUFBd0IsMkJBQUEsbUJBQXhCLEVBQTZDLGlCQUFBLFNBQTdDLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BRkQsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUixDQUhSLENBQUE7O0FBQUEsRUFJQyxZQUFhLE9BQUEsQ0FBUSxvQkFBUixFQUFiLFNBSkQsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FMSixDQUFBOztBQUFBLEVBT0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLGdDQUFSLENBUHJCLENBQUE7O0FBQUEsRUFRQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBUkosQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2QkFBQSxPQUFBLEdBQVMsSUFBVCxDQUFBOztBQUFBLDZCQUNBLGFBQUEsR0FBZSxJQURmLENBQUE7O0FBR2EsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsNkRBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdUVBQUEsQ0FBQTtBQUFBLHVGQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixHQUFBLENBQUEsT0FGaEIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsR0FIWCxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBTEEsQ0FEVztJQUFBLENBSGI7O0FBQUEsNkJBV0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE1BQWxCLENBQU4sQ0FBQTtBQUNBLE1BQUEsSUFBRyxXQUFIO0FBQ0UsZUFBTyxHQUFQLENBREY7T0FEQTtBQUFBLE1BR0EsR0FBQSxHQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLENBSE4sQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE1BQWxCLEVBQTBCLEdBQTFCLENBSkEsQ0FBQTthQUtBLElBTlU7SUFBQSxDQVhaLENBQUE7O0FBQUEsNkJBbUJBLFdBQUEsR0FBYSxTQUFDLE9BQUQsR0FBQTtBQUNYLFVBQUEsaUNBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBaUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsUUFBYixDQUFqQztBQUFBLGVBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsUUFBYixDQUFQLENBQUE7T0FEQTtBQUFBLE1BRUEsUUFBQSxHQUFXLElBQUksQ0FBQyxpQkFBTCxDQUF1QixRQUF2QixDQUZYLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBVCxDQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtpQkFBVSxLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBVjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQsQ0FIUCxDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsR0FBQTtpQkFBTyxRQUFRLENBQUMsSUFBVCxDQUFjLFNBQUMsSUFBRCxHQUFBO21CQUFVLEtBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixDQUFqQixFQUFWO1VBQUEsQ0FBZCxFQUFQO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQUpBLENBQUE7QUFBQSxNQU1BLE9BQUEsR0FDRSxJQUNBLENBQUMsSUFERCxDQUNNLElBQUMsQ0FBQSxPQURQLENBRUEsQ0FBQyxJQUZELENBRU0sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsSUFBRixHQUFBO0FBQ0osVUFESyxLQUFDLENBQUEsT0FBQSxJQUNOLENBQUE7aUJBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFDLElBQUQsR0FBQTttQkFDUixJQUFBLGtCQUFBLENBQW1CLEtBQUMsQ0FBQSxJQUFwQixFQUEwQixPQUExQixFQUFtQyxJQUFuQyxFQURRO1VBQUEsQ0FBZCxFQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGTixDQUtBLENBQUMsT0FBRCxDQUxBLENBS08sU0FBQyxHQUFELEdBQUE7QUFDTCxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBbkIsQ0FDUixzRkFBQSxHQUMyQyxHQUFHLENBQUMsSUFGdkMsRUFHRTtBQUFBLFVBQUEsTUFBQSxFQUFRLEVBQUEsR0FDaEIsR0FEZ0IsR0FDWixVQURZLEdBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQURULEdBRUwsVUFGSyxHQUVJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFGaEIsR0FHakIsVUFIaUIsR0FHUixPQUFPLENBQUMsR0FBRyxDQUFDLElBSFo7QUFBQSxVQU1BLEtBQUEsRUFBTyxHQUFHLENBQUMsS0FOWDtBQUFBLFVBT0EsV0FBQSxFQUFhLElBUGI7U0FIRixDQUFBLENBQUE7ZUFXQSxLQVpLO01BQUEsQ0FMUCxDQVBGLENBQUE7QUFBQSxNQXlCQSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxRQUFiLEVBQXVCLE9BQXZCLENBekJBLENBQUE7QUEwQkEsYUFBTyxPQUFQLENBM0JXO0lBQUEsQ0FuQmIsQ0FBQTs7QUFBQSw2QkFnREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FDRTtBQUFBLFFBQUEsU0FBQSxFQUFlLElBQUEsS0FBQSxDQUFNLENBQU4sQ0FBZjtBQUFBLFFBQ0EsTUFBQSxFQUFRLElBRFI7QUFBQSxRQUVBLFFBQUEsRUFBYyxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBRmQ7QUFBQSxRQUdBLElBQUEsRUFBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBSFY7QUFBQSxRQUlBLElBQUEsRUFBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBSlY7QUFBQSxRQUtBLElBQUEsRUFBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBTFY7QUFBQSxRQU1BLE1BQUEsRUFBWSxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBTlo7T0FERixDQUFBO2FBUUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixvQ0FBcEIsRUFBMEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUN6RSxLQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBNEIsSUFBQSxLQUFBLENBQU0sS0FBTixFQUQ2QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFELENBQWpCLEVBVFk7SUFBQSxDQWhEZCxDQUFBOztBQUFBLDZCQTREQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixVQUFBLFlBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBQUEsR0FBaUQsSUFBM0QsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FETixDQUFBO2FBRUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsR0FBakIsRUFBc0IsQ0FBQyxTQUFELENBQXRCLEVBQW1DLENBQUMsQ0FBQyxNQUFGLENBQVM7QUFBQSxRQUFDLFNBQUEsT0FBRDtPQUFULEVBQW9CLElBQXBCLENBQW5DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxNQUFELEdBQUE7QUFDSixZQUFBLFVBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxrREFBa0QsQ0FBQyxJQUFuRCxDQUF3RCxNQUF4RCxDQUErRCxDQUFDLEtBQWhFLENBQXNFLENBQXRFLEVBQXlFLENBQXpFLENBQTJFLENBQUMsR0FBNUUsQ0FBZ0YsU0FBQyxDQUFELEdBQUE7aUJBQU8sUUFBQSxDQUFTLENBQVQsRUFBUDtRQUFBLENBQWhGLENBQVAsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxHQUFPLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBakIsQ0FBZ0MsQ0FBQSxDQUFBLENBRHZDLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxLQUFMLENBQVksVUFBQSxHQUFVLElBQVYsR0FBZSxjQUFmLEdBQTZCLElBQXpDLENBRkEsQ0FBQTtBQUdBLGVBQU87QUFBQSxVQUFDLE1BQUEsSUFBRDtBQUFBLFVBQU8sTUFBQSxJQUFQO1NBQVAsQ0FKSTtNQUFBLENBRE4sRUFIVTtJQUFBLENBNURaLENBQUE7O0FBQUEsNkJBc0VBLFNBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFDVCxVQUFBLGdDQUFBO0FBQUEsTUFEaUIsT0FBRCxLQUFDLElBQ2pCLENBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBQUEsR0FBaUQsSUFBM0QsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUNFLElBQUksQ0FBQyxXQUFMLENBQWlCLE9BQWpCLEVBQTBCLENBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxtQkFBZCxDQUExQixFQUE4RCxDQUFDLENBQUMsTUFBRixDQUFTO0FBQUEsUUFBQyxTQUFBLE9BQUQ7T0FBVCxFQUFvQixJQUFwQixDQUE5RCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsTUFBRCxHQUFBO2VBQVksTUFBTSxDQUFDLElBQVAsQ0FBQSxFQUFaO01BQUEsQ0FETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sU0FBQyxLQUFELEdBQUE7QUFDTCxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixDQUFBLENBQUE7QUFDQSxlQUFPLElBQVAsQ0FGSztNQUFBLENBRlAsQ0FGRixDQUFBO0FBQUEsTUFPQSxPQUFBLEdBQ0UsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsRUFBd0IsQ0FBQyxtQkFBRCxDQUF4QixFQUErQyxDQUFDLENBQUMsTUFBRixDQUFTO0FBQUEsUUFBQyxTQUFBLE9BQUQ7T0FBVCxFQUFvQixJQUFwQixDQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsTUFBRCxHQUFBO2VBQVksTUFBTSxDQUFDLElBQVAsQ0FBQSxFQUFaO01BQUEsQ0FETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sU0FBQyxLQUFELEdBQUE7QUFDTCxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixDQUFBLENBQUE7QUFDQSxlQUFPLElBQVAsQ0FGSztNQUFBLENBRlAsQ0FSRixDQUFBO2FBYUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFDLFFBQUQsRUFBVyxPQUFYLENBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLEtBQUQsR0FBQTtBQUNKLFlBQUEsdUJBQUE7QUFBQSxRQURNLHFCQUFVLGtCQUNoQixDQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsS0FBTCxDQUFZLG9CQUFBLEdBQW9CLFFBQWhDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBWSxtQkFBQSxHQUFtQixPQUEvQixDQURBLENBQUE7QUFFQSxRQUFBLElBQUcsa0JBQUEsSUFBYyxRQUFBLEtBQWMsSUFBL0I7QUFDRSxVQUFBLElBQUEsR0FDUiw2QkFBQSxHQUE2QixRQUE3QixHQUFzQywwREFBdEMsR0FDcUMsSUFEckMsR0FDMEMsd0RBRmxDLENBQUE7QUFBQSxVQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBOUIsQ0FKQSxDQUFBO0FBQUEsVUFLQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FMQSxDQURGO1NBRkE7QUFTQSxRQUFBLElBQUcsaUJBQUEsSUFBYSxPQUFBLEtBQWEsSUFBN0I7QUFDRSxVQUFBLElBQUEsR0FDUiw0QkFBQSxHQUE0QixPQUE1QixHQUFvQywwREFBcEMsR0FDcUMsSUFEckMsR0FDMEMsaUVBRmxDLENBQUE7QUFBQSxVQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBOUIsQ0FKQSxDQUFBO2lCQUtBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQU5GO1NBVkk7TUFBQSxDQUROLEVBZFM7SUFBQSxDQXRFWCxDQUFBOztBQUFBLDZCQXVHQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFDUCxVQUFBLDBCQUFBO0FBQUEsTUFEUyxPQUFELEtBQUMsSUFDVCxDQUFBO0FBQUEsTUFBQSxJQUFBLEdBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxJQUFUO0FBQUEsUUFDQSxPQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsU0FBQSxFQUFXLEtBRlg7QUFBQSxRQUdBLFFBQUEsRUFBVSxLQUhWO0FBQUEsUUFJQSxlQUFBLEVBQWlCLEtBSmpCO0FBQUEsUUFLQSxhQUFBLEVBQWUsS0FMZjtBQUFBLFFBTUEsb0JBQUEsRUFBc0IsS0FOdEI7T0FERixDQUFBO0FBQUEsTUFTQSxPQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFDUixZQUFBLGNBQUE7QUFBQSxhQUFBLGdEQUFBO21CQUFBO0FBQ0UsVUFBQSxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxDQUFiO0FBQ0UsbUJBQU8sSUFBUCxDQURGO1dBQUEsTUFFSyxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxDQUFiO0FBQ0gsbUJBQU8sS0FBUCxDQURHO1dBSFA7QUFBQSxTQUFBO0FBS0EsZUFBTyxJQUFQLENBTlE7TUFBQSxDQVRWLENBQUE7QUFBQSxNQWlCQSxLQUFBLEdBQVEsU0FBQyxDQUFELEdBQUE7QUFDTixZQUFBLGNBQUE7QUFBQSxhQUFBLGdEQUFBO21CQUFBO0FBQ0UsVUFBQSxJQUFHLElBQUssQ0FBQSxDQUFBLENBQUwsS0FBYSxDQUFoQjtBQUNFLG1CQUFPLEtBQVAsQ0FERjtXQURGO0FBQUEsU0FBQTtBQUdBLGVBQU8sSUFBUCxDQUpNO01BQUEsQ0FqQlIsQ0FBQTtBQXVCQSxNQUFBLElBQUcsQ0FBQSxPQUFJLENBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSLENBQVA7QUFDRSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsMkdBQTVCLEVBR0U7QUFBQSxVQUFBLFdBQUEsRUFBYSxJQUFiO1NBSEYsQ0FBQSxDQURGO09BdkJBO0FBNEJBLE1BQUEsSUFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLENBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsd0dBQTlCLEVBR0U7QUFBQSxVQUFBLFdBQUEsRUFBYSxJQUFiO1NBSEYsQ0FBQSxDQURGO09BNUJBO0FBaUNBLE1BQUEsSUFBRyxPQUFBLENBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSLENBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBZixDQURGO09BakNBO0FBbUNBLE1BQUEsSUFBRyxPQUFBLENBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSLENBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQWpCLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxRQUFMLEdBQWdCLElBRGhCLENBREY7T0FuQ0E7QUFzQ0EsTUFBQSxJQUFHLE9BQUEsQ0FBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVIsQ0FBQSxJQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLENBQXRCO0FBQ0UsUUFBQSxJQUFJLENBQUMsZUFBTCxHQUF1QixJQUF2QixDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsYUFBTCxHQUFxQixJQURyQixDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsb0JBQUwsR0FBNEIsSUFGNUIsQ0FERjtPQXRDQTtBQUFBLE1BMENBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLENBQVgsQ0ExQ0EsQ0FBQTtBQTJDQSxhQUFPLElBQVAsQ0E1Q087SUFBQSxDQXZHVCxDQUFBOztBQUFBLDZCQXFKQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFELEdBQUE7ZUFDZixDQUFDLENBQUMsSUFBRixDQUFPLFNBQUMsT0FBRCxHQUFBOytFQUFhLE9BQU8sQ0FBRSxnQ0FBdEI7UUFBQSxDQUFQLEVBRGU7TUFBQSxDQUFqQixDQUFBLENBQUE7YUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQSxFQUhXO0lBQUEsQ0FySmIsQ0FBQTs7QUFBQSw2QkEySkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRCxHQUFBO2VBQ2YsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFDLE9BQUQsR0FBQTsyRUFBYSxPQUFPLENBQUUsNEJBQXRCO1FBQUEsQ0FBUCxFQURlO01BQUEsQ0FBakIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBTGpCLENBQUE7YUFNQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBUEo7SUFBQSxDQTNKVCxDQUFBOztBQUFBLDZCQW9LQSxZQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCLEVBRFk7SUFBQSxDQXBLZCxDQUFBOztBQUFBLDZCQXVLQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksZ0JBQVosRUFBOEIsUUFBOUIsRUFEZTtJQUFBLENBdktqQixDQUFBOztBQUFBLDZCQTBLQSxhQUFBLEdBQWUsU0FBQyxRQUFELEdBQUE7YUFDYixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCLEVBRGE7SUFBQSxDQTFLZixDQUFBOztBQUFBLDZCQTZLQSxXQUFBLEdBQWEsU0FBQyxRQUFELEdBQUE7YUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCLEVBRFc7SUFBQSxDQTdLYixDQUFBOztBQUFBLDZCQWdMQSxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixPQUFyQixHQUFBO0FBQ1IsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBTyx3QkFBQSxJQUFtQixxQkFBMUIsQ0FBQTtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU8sc0RBQVAsQ0FBVixDQURGO09BQUE7QUFFQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO0FBQ0UsUUFBQSxTQUFBLEdBQVksUUFBWixDQURGO09BRkE7QUFJQSxNQUFBLElBQThDLHNCQUE5Qzs7VUFBQSxPQUFPLENBQUMsTUFBTyxJQUFDLENBQUEsVUFBRCxDQUFZLE9BQU8sQ0FBQyxNQUFwQjtTQUFmO09BSkE7QUFLQSxNQUFBLElBQU8sZUFBUDtBQUNFLGVBQU8sSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFPLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsT0FBRCxHQUFBO0FBQ3BDLFlBQUEsSUFBRyxlQUFIO3FCQUNFLEtBQUMsQ0FBQSxRQUFELENBQVUsU0FBVixFQUFxQixPQUFyQixFQUE4QixPQUE5QixFQURGO2FBQUEsTUFBQTtxQkFHRSxHQUhGO2FBRG9DO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsQ0FBUCxDQURGO09BTEE7QUFBQSxNQVdBLEVBQUEsR0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxFQUFELEdBQUE7QUFDSCxjQUFBLENBQUE7QUFBQSxVQUFBLENBQUEsR0FBSSxLQUFDLENBQUEsYUFBYyxDQUFBLEVBQUEsQ0FBbkIsQ0FBQTtpQkFDQSxDQUFDLENBQUMsY0FBRixDQUFBLENBQUEsR0FBcUIsQ0FBQyxDQUFDLGdCQUFGLENBQUEsQ0FBckIsS0FBNkMsRUFGMUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVhMLENBQUE7QUFBQSxNQWNBLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBYyxDQUFBLFNBQUEsQ0FBVSxDQUFDLEdBQTFCLENBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsY0FBQSxpQ0FBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsQ0FBQSxDQUFBO0FBQUEsVUFDQSxFQUFBLEdBQUssT0FBTyxDQUFDLEdBQVIsSUFBZSxJQUFJLENBQUMsVUFBTCxDQUFnQixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQWhDLENBRHBCLENBQUE7QUFBQSxVQUVBLGFBQUEsR0FBb0IsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQzFCLGdCQUFBLElBQUE7QUFBQSxZQUFBLElBQUEsR0FBTyxFQUFFLENBQUMsT0FBSCxDQUFXLHVCQUFYLENBQVAsQ0FBQTttQkFDQSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxFQUFELEdBQUE7QUFDSixjQUFBLElBQUcsRUFBSDt1QkFDRSxJQUFJLENBQUMsSUFBTCxDQUFBLENBQVcsQ0FBQyxJQUFaLENBQWlCLFNBQUMsUUFBRCxHQUFBO0FBQ2Ysc0JBQUEsR0FBQTtBQUFBOzJCQUNFLE9BQUEsQ0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsQ0FBUixFQURGO21CQUFBLGNBQUE7QUFHRSxvQkFESSxZQUNKLENBQUE7QUFBQSxvQkFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLHVDQUE1QixFQUNFO0FBQUEsc0JBQUEsTUFBQSxFQUFRLEdBQVI7QUFBQSxzQkFDQSxXQUFBLEVBQWEsSUFEYjtxQkFERixDQUFBLENBQUE7MkJBR0EsTUFBQSxDQUFPLEdBQVAsRUFORjttQkFEZTtnQkFBQSxDQUFqQixFQURGO2VBQUEsTUFBQTt1QkFVRSxNQUFBLENBQUEsRUFWRjtlQURJO1lBQUEsQ0FETixFQUYwQjtVQUFBLENBQVIsQ0FlcEIsQ0FBQyxPQUFELENBZm9CLENBZWIsU0FBQyxLQUFELEdBQUE7QUFDTCxZQUFBLElBQW1CLGFBQW5CO0FBQUEsY0FBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsQ0FBQSxDQUFBO2FBQUE7QUFDQSxtQkFBTyxFQUFQLENBRks7VUFBQSxDQWZhLENBRnBCLENBQUE7QUFBQSxVQW9CQSxjQUFBLEdBQXFCLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUMzQixnQkFBQSxlQUFBO0FBQUEsWUFBQSxTQUFBLEdBQWdCLElBQUEsU0FBQSxDQUFVLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQVYsQ0FBaEIsQ0FBQTtBQUFBLFlBQ0EsSUFBQSxHQUFPLFNBQVMsQ0FBQyxPQUFWLENBQWtCLHNCQUFsQixDQURQLENBQUE7bUJBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsRUFBRCxHQUFBO0FBQ0osY0FBQSxJQUFHLEVBQUg7dUJBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUMsSUFBWixDQUFpQixTQUFDLFFBQUQsR0FBQTtBQUNmLHNCQUFBLEdBQUE7QUFBQTsyQkFDRSxPQUFBLENBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLENBQVIsRUFERjttQkFBQSxjQUFBO0FBR0Usb0JBREksWUFDSixDQUFBO0FBQUEsb0JBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixzQ0FBNUIsRUFDRTtBQUFBLHNCQUFBLE1BQUEsRUFBUSxHQUFSO0FBQUEsc0JBQ0EsV0FBQSxFQUFhLElBRGI7cUJBREYsQ0FBQSxDQUFBOzJCQUdBLE1BQUEsQ0FBTyxHQUFQLEVBTkY7bUJBRGU7Z0JBQUEsQ0FBakIsRUFERjtlQUFBLE1BQUE7dUJBVUUsTUFBQSxDQUFBLEVBVkY7ZUFESTtZQUFBLENBRE4sRUFIMkI7VUFBQSxDQUFSLENBZ0JyQixDQUFDLE9BQUQsQ0FoQnFCLENBZ0JkLFNBQUMsS0FBRCxHQUFBO0FBQ0wsWUFBQSxJQUFtQixhQUFuQjtBQUFBLGNBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLENBQUEsQ0FBQTthQUFBO0FBQ0EsbUJBQU8sRUFBUCxDQUZLO1VBQUEsQ0FoQmMsQ0FwQnJCLENBQUE7aUJBdUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxjQUFELEVBQWlCLGFBQWpCLENBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQsR0FBQTtBQUNKLGdCQUFBLFNBQUE7QUFBQSxZQURNLGdCQUFNLGFBQ1osQ0FBQTttQkFBQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxHQUFmLEVBREk7VUFBQSxDQUROLENBR0EsQ0FBQyxJQUhELENBR00sU0FBQyxRQUFELEdBQUE7QUFDSixZQUFBLElBQW1ELFFBQVEsQ0FBQyxPQUE1RDtBQUFBLG9CQUFVLElBQUEsS0FBQSxDQUFNLDhCQUFOLENBQVYsQ0FBQTthQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsY0FBUixHQUF5QixRQUFRLENBQUMsY0FEbEMsQ0FBQTtBQUFBLFlBRUEsT0FBTyxDQUFDLFVBQVIsR0FBcUIsUUFBUSxDQUFDLFVBRjlCLENBQUE7bUJBR0EsT0FBTyxDQUFDLGFBQVIsR0FBd0IsUUFBUSxDQUFDLGNBSjdCO1VBQUEsQ0FITixDQVFBLENBQUMsSUFSRCxDQVFNLFNBQUEsR0FBQTttQkFDSixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFESTtVQUFBLENBUk4sQ0FVQSxDQUFDLE9BQUQsQ0FWQSxDQVVPLFNBQUMsR0FBRCxHQUFBO0FBQ0wsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQ0EsbUJBQU8sRUFBUCxDQUZLO1VBQUEsQ0FWUCxFQXhDc0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQWRWLENBQUE7QUFBQSxNQW1FQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNYLGNBQUEsQ0FBQTtBQUFBLFVBQUEsSUFBRyxFQUFBLENBQUcsU0FBSCxDQUFIO0FBQ0UsWUFBQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCO0FBQUEsY0FBQyxLQUFBLEVBQU8sU0FBUjthQUE1QixDQUFBLENBQUE7QUFDQSxZQUFBLElBQUc7O0FBQUM7bUJBQUEsdUJBQUEsR0FBQTtBQUFBLDhCQUFBLEVBQUEsQ0FBQTtBQUFBOzswQkFBRCxDQUEyQixDQUFDLEtBQTVCLENBQWtDLEVBQWxDLENBQUg7cUJBQ0UsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsY0FBZCxFQURGO2FBRkY7V0FEVztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWIsQ0FuRUEsQ0FBQTtBQXdFQSxhQUFPLE9BQVAsQ0F6RVE7SUFBQSxDQWhMVixDQUFBOztBQUFBLDZCQTJQQSxPQUFBLEdBQVMsU0FBQyxNQUFELEdBQUE7YUFDUCxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxRQUNBLE9BQUEsRUFBUyxNQURUO09BREYsRUFETztJQUFBLENBM1BULENBQUE7O0FBQUEsNkJBZ1FBLE9BQUEsR0FBUyxTQUFDLEdBQUQsR0FBQTthQUNQLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLFFBQ0EsR0FBQSxFQUFLLEdBREw7T0FERixFQURPO0lBQUEsQ0FoUVQsQ0FBQTs7QUFBQSw2QkFxUUEsT0FBQSxHQUFTLFNBQUMsR0FBRCxHQUFBO2FBQ1AsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxHQUFBLEVBQUssR0FETDtPQURGLEVBRE87SUFBQSxDQXJRVCxDQUFBOztBQUFBLDZCQTBRQSxTQUFBLEdBQVcsU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO2FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQ0U7QUFBQSxRQUFBLEdBQUEsRUFBSyxPQUFMO0FBQUEsUUFDQSxPQUFBLEVBQVMsUUFEVDtBQUFBLFFBRUEsUUFBQSxFQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFBLEdBQU8sQ0FBQyxJQUFELENBQVAsQ0FBQTtBQUNBLFVBQUEsSUFBa0IsSUFBSSxDQUFDLGFBQXZCO0FBQUEsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBQSxDQUFBO1dBREE7aUJBRUEsS0FIUTtRQUFBLENBRlY7QUFBQSxRQU1BLElBQUEsRUFBTSxPQU5OO09BREYsQ0FRQSxDQUFDLElBUkQsQ0FRTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQ0osS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQsR0FBQTtBQUNSLGdCQUFBLHFEQUFBO0FBQUEsWUFBQSxRQUEyQixDQUFDLENBQUMsS0FBRixDQUFRLE1BQVIsQ0FBM0IsRUFBQyxlQUFELEVBQU8sK0RBQVAsQ0FBQTtBQUFBLFlBQ0EsYUFBQSxHQUFnQixhQUFhLENBQUMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixDQUFDLElBQTNCLENBQUEsQ0FEaEIsQ0FBQTtBQUVBLFlBQUEsSUFBRyxLQUFDLENBQUEsSUFBSSxDQUFDLGFBQVQ7QUFDRSxjQUFBLFFBQTBCLGFBQWEsQ0FBQyxLQUFkLENBQW9CLFdBQXBCLENBQWdDLENBQUMsR0FBakMsQ0FBcUMsU0FBQyxDQUFELEdBQUE7dUJBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBQSxFQUFQO2NBQUEsQ0FBckMsQ0FBMUIsRUFBQyx3QkFBRCxFQUFnQixpQkFBaEIsQ0FERjthQUZBO0FBQUEsWUFJQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUpQLENBQUE7QUFLQSxZQUFBLElBQUcsd0JBQXdCLENBQUMsSUFBekIsQ0FBOEIsYUFBOUIsQ0FBSDtBQUNFLGNBQUEsVUFBQSxHQUFhLE1BQWIsQ0FERjthQUFBLE1BRUssSUFBRyxZQUFZLENBQUMsSUFBYixDQUFrQixhQUFsQixDQUFIO0FBQ0gsY0FBQSxVQUFBLEdBQWEsT0FBYixDQURHO2FBQUEsTUFBQTtBQUdILGNBQUEsVUFBQSxHQUFhLFVBQWIsQ0FIRzthQVBMO21CQVdBO0FBQUEsY0FBQyxNQUFBLElBQUQ7QUFBQSxjQUFPLGVBQUEsYUFBUDtBQUFBLGNBQXNCLFlBQUEsVUFBdEI7QUFBQSxjQUFrQyxRQUFBLE1BQWxDO2NBWlE7VUFBQSxDQUFWLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJOLEVBRFM7SUFBQSxDQTFRWCxDQUFBOztBQUFBLDZCQWtTQSxlQUFBLEdBQWlCLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNmLE1BQUEsSUFBbUMsdUJBQW5DO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixNQUE5QixDQURULENBQUE7YUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLElBQWI7QUFBQSxRQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsUUFFQSxPQUFBLEVBQVMsTUFGVDtBQUFBLFFBR0EsR0FBQSxFQUFLLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FITDtBQUFBLFFBSUEsSUFBQSxFQUEwQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQXBCLEdBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEdBQUEsTUFKTjtBQUFBLFFBS0EsUUFBQSxFQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBO0FBQ0EsVUFBQSxJQUFrQixJQUFJLENBQUMsZUFBdkI7QUFBQSxZQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFBLENBQUE7V0FEQTtpQkFFQSxLQUhRO1FBQUEsQ0FMVjtBQUFBLFFBU0EsSUFBQSxFQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLEdBQW1CLENBQXBCLEVBQXVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixDQUE3QyxDQVROO09BREYsQ0FXQSxDQUFDLElBWEQsQ0FXTSxTQUFDLEtBQUQsR0FBQTtBQUNKLFlBQUEsa0JBQUE7QUFBQSxRQUFBLFFBQWdCLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBQyxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDNUIsY0FBQSx5RUFBQTtBQUFBLFVBQUEsSUFBYyxHQUFBLEtBQU8sRUFBckI7QUFBQSxtQkFBTyxHQUFQLENBQUE7V0FBQTtBQUFBLFVBQ0EsRUFBQSxHQUFLLDRDQURMLENBQUE7QUFBQSxVQUVBLFFBQW9ELElBQUksQ0FBQyxLQUFMLENBQVcsRUFBWCxDQUFwRCxFQUFDLGdCQUFELEVBQVEsbUJBQVIsRUFBa0IsbUJBQWxCLEVBQTRCLGlCQUE1QixFQUFvQyxpQkFBcEMsRUFBNEMsZUFGNUMsQ0FBQTtBQUFBLFVBR0EsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixFQUFxQixHQUFyQixDQUhQLENBQUE7QUFBQSxVQUlBLE9BQUEsR0FDRSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUNmLENBQUMsUUFBQSxDQUFTLFFBQVQsQ0FBQSxHQUFxQixDQUF0QixFQUF5QixRQUFBLENBQVMsUUFBVCxDQUFBLEdBQXFCLENBQTlDLENBRGUsRUFFZixDQUFDLFFBQUEsQ0FBUyxNQUFULENBQUEsR0FBbUIsQ0FBcEIsRUFBdUIsUUFBQSxDQUFTLE1BQVQsQ0FBQSxHQUFtQixDQUExQyxDQUZlLENBQWpCLENBTEYsQ0FBQTtBQVNBLFVBQUEsSUFBYyxPQUFPLENBQUMsT0FBUixDQUFBLENBQWQ7QUFBQSxtQkFBTyxHQUFQLENBQUE7V0FUQTtBQVVBLFVBQUEsSUFBQSxDQUFBLE9BQXlCLENBQUMsYUFBUixDQUFzQixNQUF0QixDQUFsQjtBQUFBLG1CQUFPLEdBQVAsQ0FBQTtXQVZBO0FBQUEsVUFXQSxPQUFBLEdBQVUsSUFBSSxDQUFDLGtCQUFMLENBQXdCLE1BQXhCLEVBQWdDLE9BQWhDLENBWFYsQ0FBQTtBQVlBLGlCQUFPLENBQUMsT0FBRCxFQUFVLElBQVYsQ0FBUCxDQWI0QjtRQUFBLENBQUQsQ0FBYixFQWNkLEVBZGMsQ0FBaEIsRUFBQyxnQkFBRCxFQUFRLGVBQVIsQ0FBQTtBQWVBLFFBQUEsSUFBQSxDQUFBLEtBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxNQUFSLENBQUE7U0FmQTtBQWdCQSxRQUFBLElBQUcsSUFBSDtBQUNFLGlCQUFPO0FBQUEsWUFBQyxPQUFBLEtBQUQ7QUFBQSxZQUFRLE1BQUEsSUFBUjtXQUFQLENBREY7U0FBQSxNQUFBO0FBR0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFWLENBSEY7U0FqQkk7TUFBQSxDQVhOLEVBSGU7SUFBQSxDQWxTakIsQ0FBQTs7QUFBQSw2QkFzVUEsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNYLFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBaUMsdUJBQWpDO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixNQUE5QixDQURULENBQUE7YUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFDRTtBQUFBLFFBQUEsV0FBQSxnR0FBMkMsS0FBM0M7QUFBQSxRQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsUUFFQSxPQUFBLEVBQVMsT0FGVDtBQUFBLFFBR0EsR0FBQSxFQUFLLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FITDtBQUFBLFFBSUEsSUFBQSxFQUEwQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQXBCLEdBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEdBQUEsTUFKTjtBQUFBLFFBS0EsSUFBQSxFQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLEdBQW1CLENBQXBCLEVBQXVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixDQUE3QyxDQUxOO09BREYsQ0FPQSxDQUFDLElBUEQsQ0FPTSxTQUFDLEtBQUQsR0FBQTtBQUNKLFlBQUEsRUFBQTtBQUFBLFFBQUEsRUFBQSxHQUFLLDRDQUFMLENBQUE7ZUFDQSxLQUNBLENBQUMsTUFERCxDQUNRLFNBQUMsSUFBRCxHQUFBO0FBQ04sVUFBQSxJQUFPLHNCQUFQO0FBQ0UsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFXLGdCQUFBLEdBQWdCLElBQTNCLENBQUEsQ0FBQTtBQUNBLG1CQUFPLEtBQVAsQ0FGRjtXQUFBO0FBR0EsaUJBQU8sSUFBUCxDQUpNO1FBQUEsQ0FEUixDQU1BLENBQUMsR0FORCxDQU1LLFNBQUMsSUFBRCxHQUFBO0FBQ0gsY0FBQSxzREFBQTtBQUFBLFVBQUEsUUFBb0QsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFYLENBQXBELEVBQUMsZ0JBQUQsRUFBUSxtQkFBUixFQUFrQixtQkFBbEIsRUFBNEIsaUJBQTVCLEVBQW9DLGlCQUFwQyxFQUE0QyxlQUE1QyxDQUFBO2lCQUNBO0FBQUEsWUFBQSxLQUFBLEVBQ0UsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FDZixDQUFDLFFBQUEsQ0FBUyxRQUFULENBQUEsR0FBcUIsQ0FBdEIsRUFBeUIsUUFBQSxDQUFTLFFBQVQsQ0FBQSxHQUFxQixDQUE5QyxDQURlLEVBRWYsQ0FBQyxRQUFBLENBQVMsTUFBVCxDQUFBLEdBQW1CLENBQXBCLEVBQXVCLFFBQUEsQ0FBUyxNQUFULENBQUEsR0FBbUIsQ0FBMUMsQ0FGZSxDQUFqQixDQURGO0FBQUEsWUFLQSxXQUFBLEVBQWEsSUFMYjtZQUZHO1FBQUEsQ0FOTCxFQUZJO01BQUEsQ0FQTixFQUhXO0lBQUEsQ0F0VWIsQ0FBQTs7QUFBQSw2QkFpV0EsU0FBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNULFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBaUMsdUJBQWpDO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixNQUE5QixDQURULENBQUE7YUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFDRTtBQUFBLFFBQUEsV0FBQSxnR0FBMkMsS0FBM0M7QUFBQSxRQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsUUFFQSxPQUFBLEVBQVMsS0FGVDtBQUFBLFFBR0EsR0FBQSxFQUFLLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FITDtBQUFBLFFBSUEsSUFBQSxFQUEwQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQXBCLEdBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEdBQUEsTUFKTjtBQUFBLFFBS0EsSUFBQSxFQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLEdBQW1CLENBQXBCLEVBQXVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixDQUE3QyxDQUxOO09BREYsQ0FPQSxDQUFDLElBUEQsQ0FPTSxTQUFDLEtBQUQsR0FBQTtBQUNKLFlBQUEsMkRBQUE7QUFBQSxRQUFBLElBQWlCLGdCQUFqQjtBQUFBLGlCQUFPLEVBQVAsQ0FBQTtTQUFBO0FBQUEsUUFDQSxFQUFBLEdBQUssaUNBREwsQ0FBQTtBQUFBLFFBRUEsUUFBOEMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVQsQ0FBZSxFQUFmLENBQTlDLEVBQUMsZ0JBQUQsRUFBUSxtQkFBUixFQUFrQixtQkFBbEIsRUFBNEIsaUJBQTVCLEVBQW9DLGlCQUZwQyxDQUFBO0FBQUEsUUFHQSxLQUFBLEdBQ0UsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FDZixDQUFDLFFBQUEsQ0FBUyxRQUFULENBQUEsR0FBcUIsQ0FBdEIsRUFBeUIsUUFBQSxDQUFTLFFBQVQsQ0FBQSxHQUFxQixDQUE5QyxDQURlLEVBRWYsQ0FBQyxRQUFBLENBQVMsTUFBVCxDQUFBLEdBQW1CLENBQXBCLEVBQXVCLFFBQUEsQ0FBUyxNQUFULENBQUEsR0FBbUIsQ0FBMUMsQ0FGZSxDQUFqQixDQUpGLENBQUE7QUFRQSxlQUFPO1VBQ0w7QUFBQSxZQUFBLElBQUEsRUFBTSxLQUFNLENBQUEsQ0FBQSxDQUFaO0FBQUEsWUFDQSxLQUFBLEVBQU8sS0FEUDtBQUFBLFlBRUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWixDQUFjLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUZOO1dBREs7U0FBUCxDQVRJO01BQUEsQ0FQTixFQUhTO0lBQUEsQ0FqV1gsQ0FBQTs7QUFBQSw2QkEwWEEsZUFBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFDZixVQUFBLDRCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQW1DLHVCQUFuQztBQUFBLGVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUCxDQUFBO09BREE7QUFBQSxNQUVBLFFBQWtCLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixNQUE5QixDQUFsQixFQUFDLGVBQUEsTUFBRCxFQUFTLGNBQUEsS0FGVCxDQUFBO2FBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxVQUFWLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxJQUFiO0FBQUEsUUFDQSxNQUFBLEVBQVEsTUFEUjtBQUFBLFFBRUEsT0FBQSxFQUFTLE1BRlQ7QUFBQSxRQUdBLEdBQUEsRUFBSyxNQUFNLENBQUMsTUFBUCxDQUFBLENBSEw7QUFBQSxRQUlBLElBQUEsRUFBMEIsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFwQixHQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxHQUFBLE1BSk47QUFBQSxRQUtBLElBQUEsRUFBTSxDQUFDLE1BQUQsQ0FMTjtPQURGLENBT0EsQ0FBQyxJQVBELENBT00sU0FBQyxLQUFELEdBQUE7QUFDSixZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBUCxDQUFBO0FBQ0EsUUFBQSxJQUFHLElBQUEsS0FBUSxrQkFBUixJQUE4QixDQUFBLElBQWpDO0FBQ0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFWLENBREY7U0FBQSxNQUFBO0FBR0UsaUJBQU87QUFBQSxZQUFDLE9BQUEsS0FBRDtBQUFBLFlBQVEsTUFBQSxJQUFSO1dBQVAsQ0FIRjtTQUZJO01BQUEsQ0FQTixFQUxlO0lBQUEsQ0ExWGpCLENBQUE7O0FBQUEsNkJBNllBLDJCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUMzQixVQUFBLGNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0MsU0FBVSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsTUFBdEIsRUFBOEIsTUFBOUIsRUFBVixNQURELENBQUE7YUFHQSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLElBQWI7QUFBQSxRQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsUUFFQSxPQUFBLEVBQVMsTUFGVDtBQUFBLFFBR0EsSUFBQSxFQUFNLENBQUMsTUFBRCxDQUhOO09BREYsRUFKMkI7SUFBQSxDQTdZN0IsQ0FBQTs7QUFBQSw2QkF1WkEsbUJBQUEsR0FBcUIsU0FBQyxHQUFELEVBQU0sTUFBTixFQUFjLElBQWQsR0FBQTtBQUNuQixVQUFBLG9EQUFBO0FBQUEsTUFBQSxJQUE2QixNQUFNLENBQUMsT0FBUCxDQUFBLENBQTdCO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUFQLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBaUMsdUJBQWpDO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUFQLENBQUE7T0FEQTtBQUFBLE1BSUEsTUFBQSxHQUFTLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFBLENBSmYsQ0FBQTtBQUFBLE1BS0EsSUFBQSxHQUNLLEdBQUEsS0FBTyxNQUFQLElBQWtCLE9BQUEsQ0FBUSxHQUFSLENBQUEsS0FBZ0IsTUFBckMsR0FDRSxDQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsS0FBSixDQUFVLENBQVYsRUFBYSxDQUFBLENBQWIsQ0FBTixFQUNBLFNBQUEsQ0FBVSxNQUFWLEVBQWtCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBbEIsQ0FEQSxDQURGLEdBR1EsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFILEdBQ0gsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQURHLEdBQUEsTUFUUCxDQUFBO0FBV0EsTUFBQSxJQUFHLDRDQUFIO0FBRUUsUUFBQSxRQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsMkJBQWpCLENBQXZCLEVBQUMsWUFBRCxFQUFJLGNBQUosRUFBUyxlQUFULEVBQWUsZUFBZixDQUFBO0FBQ0EsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQjtVQUNyQjtBQUFBLFlBQUEsR0FBQSxFQUFLLEdBQUw7QUFBQSxZQUNBLFFBQUEsRUFBYyxJQUFBLEtBQUEsQ0FBTSxJQUFBLEdBQU8sQ0FBYixFQUFnQixDQUFoQixDQURkO0FBQUEsWUFFQSxPQUFBLEVBQVMsSUFGVDtBQUFBLFlBR0EsUUFBQSxFQUFVLE1BSFY7V0FEcUI7U0FBaEIsQ0FBUCxDQUhGO09BWEE7QUFzQkEsTUFBQSxJQUFHLEdBQUEsS0FBTyxNQUFWO0FBQ0UsUUFBQSxJQUFBLEdBQU8sU0FBQSxFQUFBLENBQUUsQ0FBQyxNQUFILGNBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUErQyxDQUFDLEdBQWhELENBQW9ELFNBQUMsQ0FBRCxHQUFBO2lCQUFPLENBQUMsWUFBRCxFQUFlLENBQWYsRUFBUDtRQUFBLENBQXBELENBQVYsQ0FBUCxDQURGO09BdEJBO2FBeUJBLElBQUMsQ0FBQSxRQUFELENBQVUsV0FBVixFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsSUFBYjtBQUFBLFFBQ0EsTUFBQSxFQUFRLE1BRFI7QUFBQSxRQUVBLE9BQUEsRUFBUyxHQUZUO0FBQUEsUUFHQSxHQUFBLEVBQUssR0FITDtBQUFBLFFBSUEsSUFBQSxFQUFNLElBSk47QUFBQSxRQUtBLElBQUEsRUFBTSxJQUxOO09BREYsQ0FPQSxDQUFDLElBUEQsQ0FPTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7QUFDSixjQUFBLFdBQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosQ0FBVixDQUFBO0FBQUEsVUFDQSxFQUFBLEdBQUssd0RBREwsQ0FBQTtpQkFFQSxLQUNBLENBQUMsTUFERCxDQUNRLFNBQUMsSUFBRCxHQUFBO0FBQ04sb0JBQUEsS0FBQTtBQUFBLG9CQUNPLElBQUksQ0FBQyxVQUFMLENBQWdCLGtCQUFoQixDQURQO0FBRUksZ0JBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBNUIsQ0FBQSxDQUZKOztBQUFBLG9CQUdPLElBQUksQ0FBQyxVQUFMLENBQWdCLG9CQUFoQixDQUhQO0FBSUksZ0JBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBOUIsQ0FBQSxDQUpKOztBQUFBLG1CQUtPLHNCQUxQO0FBTUksdUJBQU8sSUFBUCxDQU5KO0FBQUEscUJBT08sSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUMsTUFBWixHQUFxQixFQVA1QjtBQVFJLGdCQUFBLElBQUksQ0FBQyxJQUFMLENBQVcsZ0JBQUEsR0FBZ0IsSUFBM0IsQ0FBQSxDQVJKO0FBQUEsYUFBQTtBQVNBLG1CQUFPLEtBQVAsQ0FWTTtVQUFBLENBRFIsQ0FZQSxDQUFDLEdBWkQsQ0FZSyxTQUFDLElBQUQsR0FBQTtBQUNILGdCQUFBLHdEQUFBO0FBQUEsWUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFYLENBQVIsQ0FBQTtBQUFBLFlBQ0MsWUFBRCxFQUFJLGVBQUosRUFBVSxjQUFWLEVBQWUsY0FBZixFQUFvQixrQkFEcEIsQ0FBQTtBQUVBLFlBQUEsSUFBaUIsR0FBRyxDQUFDLFFBQUosQ0FBYSxJQUFiLENBQWpCO0FBQUEsY0FBQSxJQUFBLEdBQU8sTUFBUCxDQUFBO2FBRkE7QUFBQSxZQUdBLFFBQUEsR0FDSyxHQUFBLEtBQU8sTUFBVixHQUNFLE1BREYsR0FFUSxPQUFBLEtBQVcsU0FBZCxHQUNILFNBREcsR0FHSCxPQVRKLENBQUE7QUFBQSxZQVVBLE9BQUEsR0FBYyxJQUFBLEtBQUEsQ0FBTSxHQUFBLEdBQU0sQ0FBWixFQUFlLEdBQUEsR0FBTSxDQUFyQixDQVZkLENBQUE7QUFBQSxZQVdBLE9BQUEsR0FBVSxJQUFJLENBQUMsa0JBQUwsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsQ0FYVixDQUFBO0FBYUEsbUJBQU87QUFBQSxjQUNMLEdBQUE7Ozs7dUNBQWlFLElBRDVEO0FBQUEsY0FFTCxRQUFBLEVBQVUsT0FGTDtBQUFBLGNBR0wsT0FBQSxFQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixFQUFnQixFQUFoQixDQUhKO0FBQUEsY0FJTCxRQUFBLEVBQVUsUUFKTDthQUFQLENBZEc7VUFBQSxDQVpMLEVBSEk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBOLEVBMUJtQjtJQUFBLENBdlpyQixDQUFBOztBQUFBLDZCQTRkQSxhQUFBLEdBQWUsU0FBQyxNQUFELEVBQVMsSUFBVCxHQUFBO2FBQ2IsSUFBQyxDQUFBLG1CQUFELENBQXFCLE9BQXJCLEVBQThCLE1BQTlCLEVBQXNDLElBQXRDLEVBRGE7SUFBQSxDQTVkZixDQUFBOztBQUFBLDZCQStkQSxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVCxHQUFBO2FBQ1osSUFBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLElBQXJDLEVBRFk7SUFBQSxDQS9kZCxDQUFBOztBQUFBLDZCQWtlQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTthQUNkLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBRSxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsSUFBdkIsQ0FBRixFQUFnQyxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsSUFBdEIsQ0FBaEMsQ0FBWixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsTUFBRCxHQUFBO0FBQVksWUFBQSxLQUFBO2VBQUEsU0FBQSxFQUFBLENBQUUsQ0FBQyxNQUFILGNBQVUsTUFBVixFQUFaO01BQUEsQ0FETixFQURjO0lBQUEsQ0FsZWhCLENBQUE7OzBCQUFBOztNQVpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/ghc-mod/ghc-modi-process.coffee