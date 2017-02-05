(function() {
  var CompositeDisposable, Directory, Emitter, GhcModiProcess, GhcModiProcessReal, Point, Queue, Range, Util, _, extname, ref, unlitSync,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory;

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
      this.doCheckAndLint = bind(this.doCheckAndLint, this);
      this.doLintBuffer = bind(this.doLintBuffer, this);
      this.doCheckBuffer = bind(this.doCheckBuffer, this);
      this.doCheckOrLintBuffer = bind(this.doCheckOrLintBuffer, this);
      this.findSymbolProvidersInBuffer = bind(this.findSymbolProvidersInBuffer, this);
      this.getInfoInBuffer = bind(this.getInfoInBuffer, this);
      this.doSigFill = bind(this.doSigFill, this);
      this.doCaseSplit = bind(this.doCaseSplit, this);
      this.getTypeInBuffer = bind(this.getTypeInBuffer, this);
      this.runBrowse = bind(this.runBrowse, this);
      this.runFlag = bind(this.runFlag, this);
      this.runLang = bind(this.runLang, this);
      this.runList = bind(this.runList, this);
      this.queueCmd = bind(this.queueCmd, this);
      this.onQueueIdle = bind(this.onQueueIdle, this);
      this.onBackendIdle = bind(this.onBackendIdle, this);
      this.onBackendActive = bind(this.onBackendActive, this);
      this.onDidDestroy = bind(this.onDidDestroy, this);
      this.destroy = bind(this.destroy, this);
      this.killProcess = bind(this.killProcess, this);
      this.createQueues = bind(this.createQueues, this);
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      this.bufferDirMap = new WeakMap;
      this.backend = new Map;
      if ((process.env.GHC_PACKAGE_PATH != null) && !atom.config.get('haskell-ghc-mod.suppressGhcPackagePathWarning')) {
        atom.notifications.addWarning("haskell-ghc-mod: You have GHC_PACKAGE_PATH environment variable set!", {
          dismissable: true,
          detail: "This configuration is not supported, and can break arbitrarily. You can try to band-aid it by adding\n \ndelete process.env.GHC_PACKAGE_PATH\n \nto your Atom init script (Edit → Init Script...)\n \nYou can suppress this warning in haskell-ghc-mod settings."
        });
      }
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
        return function(caps1) {
          _this.caps = caps1;
          return procopts.then(function(opts) {
            return new GhcModiProcessReal(_this.caps, rootDir, opts);
          });
        };
      })(this))["catch"](function(err) {
        atom.notifications.addFatalError("Haskell-ghc-mod: ghc-mod failed to launch. It is probably missing or misconfigured. " + err.code, {
          detail: err + "\nPATH: " + process.env.PATH + "\npath: " + process.env.path + "\nPath: " + process.env.Path,
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

    GhcModiProcess.prototype.checkComp = function(opts, arg) {
      var comp, pathghc, stackghc, timeout;
      comp = arg.comp;
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
      return Promise.all([stackghc, pathghc]).then(function(arg1) {
        var pathghc, stackghc, warn;
        stackghc = arg1[0], pathghc = arg1[1];
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

    GhcModiProcess.prototype.getCaps = function(arg) {
      var atLeast, caps, exact, vers;
      vers = arg.vers;
      caps = {
        version: vers,
        fileMap: false,
        quoteArgs: false,
        optparse: false,
        typeConstraints: false,
        browseParents: false,
        interactiveCaseSplit: false,
        importedFrom: false
      };
      atLeast = function(b) {
        var i, j, len, v;
        for (i = j = 0, len = b.length; j < len; i = ++j) {
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
        var i, j, len, v;
        for (i = j = 0, len = b.length; j < len; i = ++j) {
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
      if (atLeast([5, 6])) {
        caps.typeConstraints = true;
        caps.browseParents = true;
        caps.interactiveCaseSplit = true;
      }
      if (atLeast([5, 7]) || atom.config.get('haskell-ghc-mod.experimental')) {
        caps.importedFrom = true;
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
                  } catch (error1) {
                    err = error1;
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
                  } catch (error1) {
                    err = error1;
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
          return Promise.all([globalSettings, localSettings]).then(function(arg) {
            var glob, loc;
            glob = arg[0], loc = arg[1];
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
              var results;
              results = [];
              for (k in this.commandQueues) {
                results.push(k);
              }
              return results;
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
            var name, parent, ref1, ref2, symbolType, typeSignature;
            ref1 = s.split(' :: '), name = ref1[0], typeSignature = 2 <= ref1.length ? slice.call(ref1, 1) : [];
            typeSignature = typeSignature.join(' :: ').trim();
            if (_this.caps.browseParents) {
              ref2 = typeSignature.split(' -- from:').map(function(v) {
                return v.trim();
              }), typeSignature = ref2[0], parent = ref2[1];
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
        var range, ref1, type;
        ref1 = lines.reduce((function(acc, line) {
          var colend, colstart, line_, myrange, ref1, rowend, rowstart, rx, text, type;
          if (acc !== '') {
            return acc;
          }
          rx = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+"([^]*)"$/;
          ref1 = line.match(rx), line_ = ref1[0], rowstart = ref1[1], colstart = ref1[2], rowend = ref1[3], colend = ref1[4], text = ref1[5];
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
        }), ''), range = ref1[0], type = ref1[1];
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
      var ref1, ref2;
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      crange = Util.tabShiftForRange(buffer, crange);
      return this.queueCmd('typeinfo', {
        interactive: (ref1 = (ref2 = this.caps) != null ? ref2.interactiveCaseSplit : void 0) != null ? ref1 : false,
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
          var colend, colstart, line_, ref1, rowend, rowstart, text;
          ref1 = line.match(rx), line_ = ref1[0], rowstart = ref1[1], colstart = ref1[2], rowend = ref1[3], colend = ref1[4], text = ref1[5];
          return {
            range: Range.fromObject([[parseInt(rowstart) - 1, parseInt(colstart) - 1], [parseInt(rowend) - 1, parseInt(colend) - 1]]),
            replacement: text
          };
        });
      });
    };

    GhcModiProcess.prototype.doSigFill = function(buffer, crange) {
      var ref1, ref2;
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      crange = Util.tabShiftForRange(buffer, crange);
      return this.queueCmd('typeinfo', {
        interactive: (ref1 = (ref2 = this.caps) != null ? ref2.interactiveCaseSplit : void 0) != null ? ref1 : false,
        buffer: buffer,
        command: 'sig',
        uri: buffer.getUri(),
        text: buffer.isModified() ? buffer.getText() : void 0,
        args: [crange.start.row + 1, crange.start.column + 1]
      }).then(function(lines) {
        var colend, colstart, line_, range, ref1, rowend, rowstart, rx;
        if (lines[0] == null) {
          return [];
        }
        rx = /^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/;
        ref1 = lines[1].match(rx), line_ = ref1[0], rowstart = ref1[1], colstart = ref1[2], rowend = ref1[3], colend = ref1[4];
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
      var buffer, range, ref1, symbol;
      buffer = editor.getBuffer();
      if (buffer.getUri() == null) {
        return Promise.resolve(null);
      }
      ref1 = Util.getSymbolInRange(editor, crange), symbol = ref1.symbol, range = ref1.range;
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
      var args, line, m, mess, olduri, ref1, ref2, text, uri;
      if (buffer.isEmpty()) {
        return Promise.resolve([]);
      }
      if (buffer.getUri() == null) {
        return Promise.resolve([]);
      }
      olduri = uri = buffer.getUri();
      text = cmd === 'lint' && extname(uri) === '.lhs' ? (uri = uri.slice(0, -1), unlitSync(olduri, buffer.getText())) : buffer.isModified() ? buffer.getText() : void 0;
      if ((text != null ? text.error : void 0) != null) {
        ref1 = text.error.match(/^(.*?):([0-9]+): *(.*) *$/), m = ref1[0], uri = ref1[1], line = ref1[2], mess = ref1[3];
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
        args = (ref2 = []).concat.apply(ref2, atom.config.get('haskell-ghc-mod.hlintOptions').map(function(v) {
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
            var col, file, match, messPos, ref3, row, severity, warning;
            match = line.match(rx);
            m = match[0], file = match[1], row = match[2], col = match[3], warning = match[4];
            if (uri.endsWith(file)) {
              file = olduri;
            }
            severity = cmd === 'lint' ? 'lint' : warning === 'Warning' ? 'warning' : 'error';
            messPos = new Point(row - 1, col - 1);
            messPos = Util.tabUnshiftForPoint(buffer, messPos);
            return {
              uri: (ref3 = ((function() {
                try {
                  return rootDir.getFile(rootDir.relativize(file)).getPath();
                } catch (error1) {}
              })())) != null ? ref3 : file,
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
        var ref1;
        return (ref1 = []).concat.apply(ref1, resArr);
      });
    };

    return GhcModiProcess;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvZ2hjLW1vZC9naGMtbW9kaS1wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0lBQUE7SUFBQTs7O0VBQUEsTUFBMEQsT0FBQSxDQUFRLE1BQVIsQ0FBMUQsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWUscUJBQWYsRUFBd0IsNkNBQXhCLEVBQTZDOztFQUM3QyxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBQ04sVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFDWixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVI7O0VBQ1AsWUFBYSxPQUFBLENBQVEsb0JBQVI7O0VBQ2QsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixrQkFBQSxHQUFxQixPQUFBLENBQVEsZ0NBQVI7O0VBQ3JCLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBTSxDQUFDLE9BQVAsR0FDTTs2QkFDSixPQUFBLEdBQVM7OzZCQUNULGFBQUEsR0FBZTs7SUFFRix3QkFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLE9BQWhDO01BQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSTtNQUNwQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFHLHNDQUFBLElBQWtDLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtDQUFoQixDQUF6QztRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsc0VBQTlCLEVBR0U7VUFBQSxXQUFBLEVBQWEsSUFBYjtVQUNBLE1BQUEs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UUFBQSxFQUFBLENBQUUsQ0FBQyxNQUFILGFBQVUsTUFBVjtNQUFaLENBRE47SUFEYzs7Ozs7QUFoZ0JsQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIERpcmVjdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xuVXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwnXG57ZXh0bmFtZX0gPSByZXF1aXJlKCdwYXRoJylcblF1ZXVlID0gcmVxdWlyZSAncHJvbWlzZS1xdWV1ZSdcbnt1bmxpdFN5bmN9ID0gcmVxdWlyZSAnYXRvbS1oYXNrZWxsLXV0aWxzJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuR2hjTW9kaVByb2Nlc3NSZWFsID0gcmVxdWlyZSAnLi9naGMtbW9kaS1wcm9jZXNzLXJlYWwuY29mZmVlJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2hjTW9kaVByb2Nlc3NcbiAgYmFja2VuZDogbnVsbFxuICBjb21tYW5kUXVldWVzOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAYnVmZmVyRGlyTWFwID0gbmV3IFdlYWtNYXAgI1RleHRCdWZmZXIgLT4gRGlyZWN0b3J5XG4gICAgQGJhY2tlbmQgPSBuZXcgTWFwICMgRmlsZVBhdGggLT4gQmFja2VuZFxuXG4gICAgaWYgcHJvY2Vzcy5lbnYuR0hDX1BBQ0tBR0VfUEFUSD8gYW5kIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5zdXBwcmVzc0doY1BhY2thZ2VQYXRoV2FybmluZycpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlwiXCJcbiAgICAgICAgaGFza2VsbC1naGMtbW9kOiBZb3UgaGF2ZSBHSENfUEFDS0FHRV9QQVRIIGVudmlyb25tZW50IHZhcmlhYmxlIHNldCFcbiAgICAgICAgXCJcIlwiLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICBkZXRhaWw6IFwiXCJcIlxuICAgICAgICAgIFRoaXMgY29uZmlndXJhdGlvbiBpcyBub3Qgc3VwcG9ydGVkLCBhbmQgY2FuIGJyZWFrIGFyYml0cmFyaWx5LiBZb3UgY2FuIHRyeSB0byBiYW5kLWFpZCBpdCBieSBhZGRpbmdcbiAgICAgICAgICDCoFxuICAgICAgICAgIGRlbGV0ZSBwcm9jZXNzLmVudi5HSENfUEFDS0FHRV9QQVRIXG4gICAgICAgICAgwqBcbiAgICAgICAgICB0byB5b3VyIEF0b20gaW5pdCBzY3JpcHQgKEVkaXQg4oaSIEluaXQgU2NyaXB0Li4uKVxuICAgICAgICAgIMKgXG4gICAgICAgICAgWW91IGNhbiBzdXBwcmVzcyB0aGlzIHdhcm5pbmcgaW4gaGFza2VsbC1naGMtbW9kIHNldHRpbmdzLlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgQGNyZWF0ZVF1ZXVlcygpXG5cbiAgZ2V0Um9vdERpcjogKGJ1ZmZlcikgLT5cbiAgICBkaXIgPSBAYnVmZmVyRGlyTWFwLmdldCBidWZmZXJcbiAgICBpZiBkaXI/XG4gICAgICByZXR1cm4gZGlyXG4gICAgZGlyID0gVXRpbC5nZXRSb290RGlyIGJ1ZmZlclxuICAgIEBidWZmZXJEaXJNYXAuc2V0IGJ1ZmZlciwgZGlyXG4gICAgZGlyXG5cbiAgaW5pdEJhY2tlbmQ6IChyb290RGlyKSAtPlxuICAgIHJvb3RQYXRoID0gcm9vdERpci5nZXRQYXRoKClcbiAgICByZXR1cm4gQGJhY2tlbmQuZ2V0KHJvb3RQYXRoKSBpZiBAYmFja2VuZC5oYXMocm9vdFBhdGgpXG4gICAgcHJvY29wdHMgPSBVdGlsLmdldFByb2Nlc3NPcHRpb25zKHJvb3RQYXRoKVxuICAgIHZlcnMgPSBwcm9jb3B0cy50aGVuIChvcHRzKSA9PiBAZ2V0VmVyc2lvbihvcHRzKVxuICAgIHZlcnMudGhlbiAodikgPT4gcHJvY29wdHMudGhlbiAob3B0cykgPT4gQGNoZWNrQ29tcChvcHRzLCB2KVxuXG4gICAgYmFja2VuZCA9XG4gICAgICB2ZXJzXG4gICAgICAudGhlbiBAZ2V0Q2Fwc1xuICAgICAgLnRoZW4gKEBjYXBzKSA9PlxuICAgICAgICBwcm9jb3B0cy50aGVuIChvcHRzKSA9PlxuICAgICAgICAgIG5ldyBHaGNNb2RpUHJvY2Vzc1JlYWwgQGNhcHMsIHJvb3REaXIsIG9wdHNcbiAgICAgIC5jYXRjaCAoZXJyKSAtPlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvciBcIlxuICAgICAgICAgIEhhc2tlbGwtZ2hjLW1vZDogZ2hjLW1vZCBmYWlsZWQgdG8gbGF1bmNoLlxuICAgICAgICAgIEl0IGlzIHByb2JhYmx5IG1pc3Npbmcgb3IgbWlzY29uZmlndXJlZC4gI3tlcnIuY29kZX1cIixcbiAgICAgICAgICBkZXRhaWw6IFwiXCJcIlxuICAgICAgICAgICAgI3tlcnJ9XG4gICAgICAgICAgICBQQVRIOiAje3Byb2Nlc3MuZW52LlBBVEh9XG4gICAgICAgICAgICBwYXRoOiAje3Byb2Nlc3MuZW52LnBhdGh9XG4gICAgICAgICAgICBQYXRoOiAje3Byb2Nlc3MuZW52LlBhdGh9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBzdGFjazogZXJyLnN0YWNrXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgbnVsbFxuICAgIEBiYWNrZW5kLnNldChyb290UGF0aCwgYmFja2VuZClcbiAgICByZXR1cm4gYmFja2VuZFxuXG4gIGNyZWF0ZVF1ZXVlczogPT5cbiAgICBAY29tbWFuZFF1ZXVlcyA9XG4gICAgICBjaGVja2xpbnQ6IG5ldyBRdWV1ZSgyKVxuICAgICAgYnJvd3NlOiBudWxsXG4gICAgICB0eXBlaW5mbzogbmV3IFF1ZXVlKDEpXG4gICAgICBmaW5kOiBuZXcgUXVldWUoMSlcbiAgICAgIGluaXQ6IG5ldyBRdWV1ZSg0KVxuICAgICAgbGlzdDogbmV3IFF1ZXVlKDEpXG4gICAgICBsb3dtZW06IG5ldyBRdWV1ZSgxKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnaGFza2VsbC1naGMtbW9kLm1heEJyb3dzZVByb2Nlc3NlcycsICh2YWx1ZSkgPT5cbiAgICAgIEBjb21tYW5kUXVldWVzLmJyb3dzZSA9IG5ldyBRdWV1ZSh2YWx1ZSlcblxuICBnZXRWZXJzaW9uOiAob3B0cykgLT5cbiAgICB0aW1lb3V0ID0gYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuaW5pdFRpbWVvdXQnKSAqIDEwMDBcbiAgICBjbWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5naGNNb2RQYXRoJylcbiAgICBVdGlsLmV4ZWNQcm9taXNlIGNtZCwgWyd2ZXJzaW9uJ10sIF8uZXh0ZW5kKHt0aW1lb3V0fSwgb3B0cylcbiAgICAudGhlbiAoc3Rkb3V0KSAtPlxuICAgICAgdmVycyA9IC9eZ2hjLW1vZCB2ZXJzaW9uIChcXGQrKVxcLihcXGQrKVxcLihcXGQrKSg/OlxcLihcXGQrKSk/Ly5leGVjKHN0ZG91dCkuc2xpY2UoMSwgNSkubWFwIChpKSAtPiBwYXJzZUludCBpXG4gICAgICBjb21wID0gL0dIQyAoLispJC8uZXhlYyhzdGRvdXQudHJpbSgpKVsxXVxuICAgICAgVXRpbC5kZWJ1ZyBcIkdoYy1tb2QgI3t2ZXJzfSBidWlsdCB3aXRoICN7Y29tcH1cIlxuICAgICAgcmV0dXJuIHt2ZXJzLCBjb21wfVxuXG4gIGNoZWNrQ29tcDogKG9wdHMsIHtjb21wfSkgLT5cbiAgICB0aW1lb3V0ID0gYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuaW5pdFRpbWVvdXQnKSAqIDEwMDBcbiAgICBzdGFja2doYyA9XG4gICAgICBVdGlsLmV4ZWNQcm9taXNlICdzdGFjaycsIFsnZ2hjJywgJy0tJywgJy0tbnVtZXJpYy12ZXJzaW9uJ10sIF8uZXh0ZW5kKHt0aW1lb3V0fSwgb3B0cylcbiAgICAgIC50aGVuIChzdGRvdXQpIC0+IHN0ZG91dC50cmltKClcbiAgICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICAgIFV0aWwud2FybiBlcnJvclxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIHBhdGhnaGMgPVxuICAgICAgVXRpbC5leGVjUHJvbWlzZSAnZ2hjJywgWyctLW51bWVyaWMtdmVyc2lvbiddLCBfLmV4dGVuZCh7dGltZW91dH0sIG9wdHMpXG4gICAgICAudGhlbiAoc3Rkb3V0KSAtPiBzdGRvdXQudHJpbSgpXG4gICAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgICBVdGlsLndhcm4gZXJyb3JcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBQcm9taXNlLmFsbCBbc3RhY2tnaGMsIHBhdGhnaGNdXG4gICAgLnRoZW4gKFtzdGFja2doYywgcGF0aGdoY10pIC0+XG4gICAgICBVdGlsLmRlYnVnIFwiU3RhY2sgR0hDIHZlcnNpb24gI3tzdGFja2doY31cIlxuICAgICAgVXRpbC5kZWJ1ZyBcIlBhdGggR0hDIHZlcnNpb24gI3twYXRoZ2hjfVwiXG4gICAgICBpZiBzdGFja2doYz8gYW5kIHN0YWNrZ2hjIGlzbnQgY29tcFxuICAgICAgICB3YXJuID0gXCJcbiAgICAgICAgICBHSEMgdmVyc2lvbiBpbiB5b3VyIFN0YWNrICcje3N0YWNrZ2hjfScgZG9lc24ndCBtYXRjaCB3aXRoXG4gICAgICAgICAgR0hDIHZlcnNpb24gdXNlZCB0byBidWlsZCBnaGMtbW9kICcje2NvbXB9Jy4gVGhpcyBjYW4gbGVhZCB0b1xuICAgICAgICAgIHByb2JsZW1zIHdoZW4gdXNpbmcgU3RhY2sgcHJvamVjdHNcIlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyB3YXJuXG4gICAgICAgIFV0aWwud2FybiB3YXJuXG4gICAgICBpZiBwYXRoZ2hjPyBhbmQgcGF0aGdoYyBpc250IGNvbXBcbiAgICAgICAgd2FybiA9IFwiXG4gICAgICAgICAgR0hDIHZlcnNpb24gaW4geW91ciBQQVRIICcje3BhdGhnaGN9JyBkb2Vzbid0IG1hdGNoIHdpdGhcbiAgICAgICAgICBHSEMgdmVyc2lvbiB1c2VkIHRvIGJ1aWxkIGdoYy1tb2QgJyN7Y29tcH0nLiBUaGlzIGNhbiBsZWFkIHRvXG4gICAgICAgICAgcHJvYmxlbXMgd2hlbiB1c2luZyBDYWJhbCBvciBQbGFpbiBwcm9qZWN0c1wiXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIHdhcm5cbiAgICAgICAgVXRpbC53YXJuIHdhcm5cblxuICBnZXRDYXBzOiAoe3ZlcnN9KSAtPlxuICAgIGNhcHMgPVxuICAgICAgdmVyc2lvbjogdmVyc1xuICAgICAgZmlsZU1hcDogZmFsc2VcbiAgICAgIHF1b3RlQXJnczogZmFsc2VcbiAgICAgIG9wdHBhcnNlOiBmYWxzZVxuICAgICAgdHlwZUNvbnN0cmFpbnRzOiBmYWxzZVxuICAgICAgYnJvd3NlUGFyZW50czogZmFsc2VcbiAgICAgIGludGVyYWN0aXZlQ2FzZVNwbGl0OiBmYWxzZVxuICAgICAgaW1wb3J0ZWRGcm9tOiBmYWxzZVxuXG4gICAgYXRMZWFzdCA9IChiKSAtPlxuICAgICAgZm9yIHYsIGkgaW4gYlxuICAgICAgICBpZiB2ZXJzW2ldID4gdlxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2UgaWYgdmVyc1tpXSA8IHZcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBleGFjdCA9IChiKSAtPlxuICAgICAgZm9yIHYsIGkgaW4gYlxuICAgICAgICBpZiB2ZXJzW2ldIGlzbnQgdlxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGlmIG5vdCBhdExlYXN0IFs1LCA0XVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiXG4gICAgICAgIEhhc2tlbGwtZ2hjLW1vZDogZ2hjLW1vZCA8IDUuNCBpcyBub3Qgc3VwcG9ydGVkLlxuICAgICAgICBVc2UgYXQgeW91ciBvd24gcmlzayBvciB1cGRhdGUgeW91ciBnaGMtbW9kIGluc3RhbGxhdGlvblwiLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGlmIGV4YWN0IFs1LCA0XVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJcbiAgICAgICAgSGFza2VsbC1naGMtbW9kOiBnaGMtbW9kIDUuNC4qIGlzIGRlcHJlY2F0ZWQuXG4gICAgICAgIFVzZSBhdCB5b3VyIG93biByaXNrIG9yIHVwZGF0ZSB5b3VyIGdoYy1tb2QgaW5zdGFsbGF0aW9uXCIsXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgaWYgYXRMZWFzdCBbNSwgNF1cbiAgICAgIGNhcHMuZmlsZU1hcCA9IHRydWVcbiAgICBpZiBhdExlYXN0IFs1LCA1XVxuICAgICAgY2Fwcy5xdW90ZUFyZ3MgPSB0cnVlXG4gICAgICBjYXBzLm9wdHBhcnNlID0gdHJ1ZVxuICAgIGlmIGF0TGVhc3QoWzUsIDZdKVxuICAgICAgY2Fwcy50eXBlQ29uc3RyYWludHMgPSB0cnVlXG4gICAgICBjYXBzLmJyb3dzZVBhcmVudHMgPSB0cnVlXG4gICAgICBjYXBzLmludGVyYWN0aXZlQ2FzZVNwbGl0ID0gdHJ1ZVxuICAgIGlmIGF0TGVhc3QoWzUsIDddKSBvciBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5leHBlcmltZW50YWwnKVxuICAgICAgY2Fwcy5pbXBvcnRlZEZyb20gPSB0cnVlXG4gICAgVXRpbC5kZWJ1ZyBKU09OLnN0cmluZ2lmeShjYXBzKVxuICAgIHJldHVybiBjYXBzXG5cbiAga2lsbFByb2Nlc3M6ID0+XG4gICAgQGJhY2tlbmQuZm9yRWFjaCAodikgLT5cbiAgICAgIHYudGhlbiAoYmFja2VuZCkgLT4gYmFja2VuZD8ua2lsbFByb2Nlc3M/KClcbiAgICBAYmFja2VuZC5jbGVhcigpXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogPT5cbiAgICBAYmFja2VuZC5mb3JFYWNoICh2KSAtPlxuICAgICAgdi50aGVuIChiYWNrZW5kKSAtPiBiYWNrZW5kPy5kZXN0cm95PygpXG4gICAgQGJhY2tlbmQuY2xlYXIoKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAY29tbWFuZFF1ZXVlcyA9IG51bGxcbiAgICBAYmFja2VuZCA9IG51bGxcblxuICBvbkRpZERlc3Ryb3k6IChjYWxsYmFjaykgPT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWRlc3Ryb3knLCBjYWxsYmFja1xuXG4gIG9uQmFja2VuZEFjdGl2ZTogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdiYWNrZW5kLWFjdGl2ZScsIGNhbGxiYWNrXG5cbiAgb25CYWNrZW5kSWRsZTogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdiYWNrZW5kLWlkbGUnLCBjYWxsYmFja1xuXG4gIG9uUXVldWVJZGxlOiAoY2FsbGJhY2spID0+XG4gICAgQGVtaXR0ZXIub24gJ3F1ZXVlLWlkbGUnLCBjYWxsYmFja1xuXG4gIHF1ZXVlQ21kOiAocXVldWVOYW1lLCBydW5BcmdzLCBiYWNrZW5kKSA9PlxuICAgIHVubGVzcyBydW5BcmdzLmJ1ZmZlcj8gb3IgcnVuQXJncy5kaXI/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgKFwiTmVpdGhlciBkaXIgbm9yIGJ1ZmZlciBpcyBzZXQgaW4gcXVldWVDbWQgaW52b2NhdGlvblwiKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1naGMtbW9kLmxvd01lbW9yeVN5c3RlbScpXG4gICAgICBxdWV1ZU5hbWUgPSAnbG93bWVtJ1xuICAgIHJ1bkFyZ3MuZGlyID89IEBnZXRSb290RGlyKHJ1bkFyZ3MuYnVmZmVyKSBpZiBydW5BcmdzLmJ1ZmZlcj9cbiAgICB1bmxlc3MgYmFja2VuZD9cbiAgICAgIHJldHVybiBAaW5pdEJhY2tlbmQocnVuQXJncy5kaXIpLnRoZW4gKGJhY2tlbmQpID0+XG4gICAgICAgIGlmIGJhY2tlbmQ/XG4gICAgICAgICAgQHF1ZXVlQ21kKHF1ZXVlTmFtZSwgcnVuQXJncywgYmFja2VuZClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFtdXG4gICAgcWUgPSAocW4pID0+XG4gICAgICBxID0gQGNvbW1hbmRRdWV1ZXNbcW5dXG4gICAgICBxLmdldFF1ZXVlTGVuZ3RoKCkgKyBxLmdldFBlbmRpbmdMZW5ndGgoKSBpcyAwXG4gICAgcHJvbWlzZSA9IEBjb21tYW5kUXVldWVzW3F1ZXVlTmFtZV0uYWRkID0+XG4gICAgICBAZW1pdHRlci5lbWl0ICdiYWNrZW5kLWFjdGl2ZSdcbiAgICAgIHJkID0gcnVuQXJncy5kaXIgb3IgVXRpbC5nZXRSb290RGlyKHJ1bkFyZ3Mub3B0aW9ucy5jd2QpXG4gICAgICBsb2NhbFNldHRpbmdzID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgICAgZmlsZSA9IHJkLmdldEZpbGUoJy5oYXNrZWxsLWdoYy1tb2QuanNvbicpXG4gICAgICAgIGZpbGUuZXhpc3RzKClcbiAgICAgICAgLnRoZW4gKGV4KSAtPlxuICAgICAgICAgIGlmIGV4XG4gICAgICAgICAgICBmaWxlLnJlYWQoKS50aGVuIChjb250ZW50cykgLT5cbiAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSBKU09OLnBhcnNlKGNvbnRlbnRzKVxuICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgJ0ZhaWxlZCB0byBwYXJzZSAuaGFza2VsbC1naGMtbW9kLmpzb24nLFxuICAgICAgICAgICAgICAgICAgZGV0YWlsOiBlcnJcbiAgICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgcmVqZWN0IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlamVjdCgpXG4gICAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgICBVdGlsLndhcm4gZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIHJldHVybiB7fVxuICAgICAgZ2xvYmFsU2V0dGluZ3MgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgICBjb25maWdEaXIgPSBuZXcgRGlyZWN0b3J5KGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpKVxuICAgICAgICBmaWxlID0gY29uZmlnRGlyLmdldEZpbGUoJ2hhc2tlbGwtZ2hjLW1vZC5qc29uJylcbiAgICAgICAgZmlsZS5leGlzdHMoKVxuICAgICAgICAudGhlbiAoZXgpIC0+XG4gICAgICAgICAgaWYgZXhcbiAgICAgICAgICAgIGZpbGUucmVhZCgpLnRoZW4gKGNvbnRlbnRzKSAtPlxuICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICByZXNvbHZlIEpTT04ucGFyc2UoY29udGVudHMpXG4gICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciAnRmFpbGVkIHRvIHBhcnNlIGhhc2tlbGwtZ2hjLW1vZC5qc29uJyxcbiAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyXG4gICAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIHJlamVjdCBlcnJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZWplY3QoKVxuICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgVXRpbC53YXJuIGVycm9yIGlmIGVycm9yP1xuICAgICAgICByZXR1cm4ge31cbiAgICAgIFByb21pc2UuYWxsIFtnbG9iYWxTZXR0aW5ncywgbG9jYWxTZXR0aW5nc11cbiAgICAgIC50aGVuIChbZ2xvYiwgbG9jXSkgLT5cbiAgICAgICAgXy5leHRlbmQoZ2xvYiwgbG9jKVxuICAgICAgLnRoZW4gKHNldHRpbmdzKSAtPlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHaGMtbW9kIGRpc2FibGVkIGluIHNldHRpbmdzXCIpIGlmIHNldHRpbmdzLmRpc2FibGVcbiAgICAgICAgcnVuQXJncy5zdXBwcmVzc0Vycm9ycyA9IHNldHRpbmdzLnN1cHByZXNzRXJyb3JzXG4gICAgICAgIHJ1bkFyZ3MuZ2hjT3B0aW9ucyA9IHNldHRpbmdzLmdoY09wdGlvbnNcbiAgICAgICAgcnVuQXJncy5naGNNb2RPcHRpb25zID0gc2V0dGluZ3MuZ2hjTW9kT3B0aW9uc1xuICAgICAgLnRoZW4gLT5cbiAgICAgICAgYmFja2VuZC5ydW4gcnVuQXJnc1xuICAgICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICAgIFV0aWwud2FybiBlcnJcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgcHJvbWlzZS50aGVuIChyZXMpID0+XG4gICAgICBpZiBxZShxdWV1ZU5hbWUpXG4gICAgICAgIEBlbWl0dGVyLmVtaXQgJ3F1ZXVlLWlkbGUnLCB7cXVldWU6IHF1ZXVlTmFtZX1cbiAgICAgICAgaWYgKGsgZm9yIGsgb2YgQGNvbW1hbmRRdWV1ZXMpLmV2ZXJ5KHFlKVxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ2JhY2tlbmQtaWRsZSdcbiAgICByZXR1cm4gcHJvbWlzZVxuXG4gIHJ1bkxpc3Q6IChidWZmZXIpID0+XG4gICAgQHF1ZXVlQ21kICdsaXN0JyxcbiAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICBjb21tYW5kOiAnbGlzdCdcblxuICBydW5MYW5nOiAoZGlyKSA9PlxuICAgIEBxdWV1ZUNtZCAnaW5pdCcsXG4gICAgICBjb21tYW5kOiAnbGFuZydcbiAgICAgIGRpcjogZGlyXG5cbiAgcnVuRmxhZzogKGRpcikgPT5cbiAgICBAcXVldWVDbWQgJ2luaXQnLFxuICAgICAgY29tbWFuZDogJ2ZsYWcnXG4gICAgICBkaXI6IGRpclxuXG4gIHJ1bkJyb3dzZTogKHJvb3REaXIsIG1vZHVsZXMpID0+XG4gICAgQHF1ZXVlQ21kICdicm93c2UnLFxuICAgICAgZGlyOiByb290RGlyXG4gICAgICBjb21tYW5kOiAnYnJvd3NlJ1xuICAgICAgZGFzaEFyZ3M6IChjYXBzKSAtPlxuICAgICAgICBhcmdzID0gWyctZCddXG4gICAgICAgIGFyZ3MucHVzaCAnLXAnIGlmIGNhcHMuYnJvd3NlUGFyZW50c1xuICAgICAgICBhcmdzXG4gICAgICBhcmdzOiBtb2R1bGVzXG4gICAgLnRoZW4gKGxpbmVzKSA9PlxuICAgICAgbGluZXMubWFwIChzKSA9PlxuICAgICAgICBbbmFtZSwgdHlwZVNpZ25hdHVyZS4uLl0gPSBzLnNwbGl0KCcgOjogJylcbiAgICAgICAgdHlwZVNpZ25hdHVyZSA9IHR5cGVTaWduYXR1cmUuam9pbignIDo6ICcpLnRyaW0oKVxuICAgICAgICBpZiBAY2Fwcy5icm93c2VQYXJlbnRzXG4gICAgICAgICAgW3R5cGVTaWduYXR1cmUsIHBhcmVudF0gPSB0eXBlU2lnbmF0dXJlLnNwbGl0KCcgLS0gZnJvbTonKS5tYXAgKHYpIC0+IHYudHJpbSgpXG4gICAgICAgIG5hbWUgPSBuYW1lLnRyaW0oKVxuICAgICAgICBpZiAvXig/OnR5cGV8ZGF0YXxuZXd0eXBlKS8udGVzdCh0eXBlU2lnbmF0dXJlKVxuICAgICAgICAgIHN5bWJvbFR5cGUgPSAndHlwZSdcbiAgICAgICAgZWxzZSBpZiAvXig/OmNsYXNzKS8udGVzdCh0eXBlU2lnbmF0dXJlKVxuICAgICAgICAgIHN5bWJvbFR5cGUgPSAnY2xhc3MnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzeW1ib2xUeXBlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICB7bmFtZSwgdHlwZVNpZ25hdHVyZSwgc3ltYm9sVHlwZSwgcGFyZW50fVxuXG4gIGdldFR5cGVJbkJ1ZmZlcjogKGJ1ZmZlciwgY3JhbmdlKSA9PlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUgbnVsbCB1bmxlc3MgYnVmZmVyLmdldFVyaSgpP1xuICAgIGNyYW5nZSA9IFV0aWwudGFiU2hpZnRGb3JSYW5nZShidWZmZXIsIGNyYW5nZSlcbiAgICBAcXVldWVDbWQgJ3R5cGVpbmZvJyxcbiAgICAgIGludGVyYWN0aXZlOiB0cnVlXG4gICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgY29tbWFuZDogJ3R5cGUnLFxuICAgICAgdXJpOiBidWZmZXIuZ2V0VXJpKClcbiAgICAgIHRleHQ6IGJ1ZmZlci5nZXRUZXh0KCkgaWYgYnVmZmVyLmlzTW9kaWZpZWQoKVxuICAgICAgZGFzaEFyZ3M6IChjYXBzKSAtPlxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgYXJncy5wdXNoICctYycgaWYgY2Fwcy50eXBlQ29uc3RyYWludHNcbiAgICAgICAgYXJnc1xuICAgICAgYXJnczogW2NyYW5nZS5zdGFydC5yb3cgKyAxLCBjcmFuZ2Uuc3RhcnQuY29sdW1uICsgMV1cbiAgICAudGhlbiAobGluZXMpIC0+XG4gICAgICBbcmFuZ2UsIHR5cGVdID0gbGluZXMucmVkdWNlICgoYWNjLCBsaW5lKSAtPlxuICAgICAgICByZXR1cm4gYWNjIGlmIGFjYyAhPSAnJ1xuICAgICAgICByeCA9IC9eKFxcZCspXFxzKyhcXGQrKVxccysoXFxkKylcXHMrKFxcZCspXFxzK1wiKFteXSopXCIkLyAjIFteXSBiYXNpY2FsbHkgbWVhbnMgXCJhbnl0aGluZ1wiLCBpbmNsLiBuZXdsaW5lc1xuICAgICAgICBbbGluZV8sIHJvd3N0YXJ0LCBjb2xzdGFydCwgcm93ZW5kLCBjb2xlbmQsIHRleHRdID0gbGluZS5tYXRjaChyeClcbiAgICAgICAgdHlwZSA9IHRleHQucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgIG15cmFuZ2UgPVxuICAgICAgICAgIFJhbmdlLmZyb21PYmplY3QgW1xuICAgICAgICAgICAgW3BhcnNlSW50KHJvd3N0YXJ0KSAtIDEsIHBhcnNlSW50KGNvbHN0YXJ0KSAtIDFdLFxuICAgICAgICAgICAgW3BhcnNlSW50KHJvd2VuZCkgLSAxLCBwYXJzZUludChjb2xlbmQpIC0gMV1cbiAgICAgICAgICBdXG4gICAgICAgIHJldHVybiBhY2MgaWYgbXlyYW5nZS5pc0VtcHR5KClcbiAgICAgICAgcmV0dXJuIGFjYyB1bmxlc3MgbXlyYW5nZS5jb250YWluc1JhbmdlKGNyYW5nZSlcbiAgICAgICAgbXlyYW5nZSA9IFV0aWwudGFiVW5zaGlmdEZvclJhbmdlKGJ1ZmZlciwgbXlyYW5nZSlcbiAgICAgICAgcmV0dXJuIFtteXJhbmdlLCB0eXBlXSksXG4gICAgICAgICcnXG4gICAgICByYW5nZSA9IGNyYW5nZSB1bmxlc3MgcmFuZ2VcbiAgICAgIGlmIHR5cGVcbiAgICAgICAgcmV0dXJuIHtyYW5nZSwgdHlwZX1cbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTm8gdHlwZVwiXG5cbiAgZG9DYXNlU3BsaXQ6IChidWZmZXIsIGNyYW5nZSkgPT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlIFtdIHVubGVzcyBidWZmZXIuZ2V0VXJpKCk/XG4gICAgY3JhbmdlID0gVXRpbC50YWJTaGlmdEZvclJhbmdlKGJ1ZmZlciwgY3JhbmdlKVxuICAgIEBxdWV1ZUNtZCAndHlwZWluZm8nLFxuICAgICAgaW50ZXJhY3RpdmU6IEBjYXBzPy5pbnRlcmFjdGl2ZUNhc2VTcGxpdCA/IGZhbHNlXG4gICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgY29tbWFuZDogJ3NwbGl0JyxcbiAgICAgIHVyaTogYnVmZmVyLmdldFVyaSgpXG4gICAgICB0ZXh0OiBidWZmZXIuZ2V0VGV4dCgpIGlmIGJ1ZmZlci5pc01vZGlmaWVkKClcbiAgICAgIGFyZ3M6IFtjcmFuZ2Uuc3RhcnQucm93ICsgMSwgY3JhbmdlLnN0YXJ0LmNvbHVtbiArIDFdXG4gICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgcnggPSAvXihcXGQrKVxccysoXFxkKylcXHMrKFxcZCspXFxzKyhcXGQrKVxccytcIihbXl0qKVwiJC8gIyBbXl0gYmFzaWNhbGx5IG1lYW5zIFwiYW55dGhpbmdcIiwgaW5jbC4gbmV3bGluZXNcbiAgICAgIGxpbmVzXG4gICAgICAuZmlsdGVyIChsaW5lKSAtPlxuICAgICAgICB1bmxlc3MgbGluZS5tYXRjaChyeCk/XG4gICAgICAgICAgVXRpbC53YXJuIFwiZ2hjLW1vZCBzYXlzOiAje2xpbmV9XCJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIC5tYXAgKGxpbmUpIC0+XG4gICAgICAgIFtsaW5lXywgcm93c3RhcnQsIGNvbHN0YXJ0LCByb3dlbmQsIGNvbGVuZCwgdGV4dF0gPSBsaW5lLm1hdGNoKHJ4KVxuICAgICAgICByYW5nZTpcbiAgICAgICAgICBSYW5nZS5mcm9tT2JqZWN0IFtcbiAgICAgICAgICAgIFtwYXJzZUludChyb3dzdGFydCkgLSAxLCBwYXJzZUludChjb2xzdGFydCkgLSAxXSxcbiAgICAgICAgICAgIFtwYXJzZUludChyb3dlbmQpIC0gMSwgcGFyc2VJbnQoY29sZW5kKSAtIDFdXG4gICAgICAgICAgXVxuICAgICAgICByZXBsYWNlbWVudDogdGV4dFxuXG4gIGRvU2lnRmlsbDogKGJ1ZmZlciwgY3JhbmdlKSA9PlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUgW10gdW5sZXNzIGJ1ZmZlci5nZXRVcmkoKT9cbiAgICBjcmFuZ2UgPSBVdGlsLnRhYlNoaWZ0Rm9yUmFuZ2UoYnVmZmVyLCBjcmFuZ2UpXG4gICAgQHF1ZXVlQ21kICd0eXBlaW5mbycsXG4gICAgICBpbnRlcmFjdGl2ZTogQGNhcHM/LmludGVyYWN0aXZlQ2FzZVNwbGl0ID8gZmFsc2VcbiAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICBjb21tYW5kOiAnc2lnJyxcbiAgICAgIHVyaTogYnVmZmVyLmdldFVyaSgpXG4gICAgICB0ZXh0OiBidWZmZXIuZ2V0VGV4dCgpIGlmIGJ1ZmZlci5pc01vZGlmaWVkKClcbiAgICAgIGFyZ3M6IFtjcmFuZ2Uuc3RhcnQucm93ICsgMSwgY3JhbmdlLnN0YXJ0LmNvbHVtbiArIDFdXG4gICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgcmV0dXJuIFtdIHVubGVzcyBsaW5lc1swXT9cbiAgICAgIHJ4ID0gL14oXFxkKylcXHMrKFxcZCspXFxzKyhcXGQrKVxccysoXFxkKykkLyAjIHBvc2l0aW9uIHJ4XG4gICAgICBbbGluZV8sIHJvd3N0YXJ0LCBjb2xzdGFydCwgcm93ZW5kLCBjb2xlbmRdID0gbGluZXNbMV0ubWF0Y2gocngpXG4gICAgICByYW5nZSA9XG4gICAgICAgIFJhbmdlLmZyb21PYmplY3QgW1xuICAgICAgICAgIFtwYXJzZUludChyb3dzdGFydCkgLSAxLCBwYXJzZUludChjb2xzdGFydCkgLSAxXSxcbiAgICAgICAgICBbcGFyc2VJbnQocm93ZW5kKSAtIDEsIHBhcnNlSW50KGNvbGVuZCkgLSAxXVxuICAgICAgICBdXG4gICAgICByZXR1cm4gW1xuICAgICAgICB0eXBlOiBsaW5lc1swXVxuICAgICAgICByYW5nZTogcmFuZ2VcbiAgICAgICAgYm9keTogbGluZXMuc2xpY2UoMikuam9pbignXFxuJylcbiAgICAgIF1cblxuICBnZXRJbmZvSW5CdWZmZXI6IChlZGl0b3IsIGNyYW5nZSkgPT5cbiAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlIG51bGwgdW5sZXNzIGJ1ZmZlci5nZXRVcmkoKT9cbiAgICB7c3ltYm9sLCByYW5nZX0gPSBVdGlsLmdldFN5bWJvbEluUmFuZ2UoZWRpdG9yLCBjcmFuZ2UpXG5cbiAgICBAcXVldWVDbWQgJ3R5cGVpbmZvJyxcbiAgICAgIGludGVyYWN0aXZlOiB0cnVlXG4gICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgY29tbWFuZDogJ2luZm8nXG4gICAgICB1cmk6IGJ1ZmZlci5nZXRVcmkoKVxuICAgICAgdGV4dDogYnVmZmVyLmdldFRleHQoKSBpZiBidWZmZXIuaXNNb2RpZmllZCgpXG4gICAgICBhcmdzOiBbc3ltYm9sXVxuICAgIC50aGVuIChsaW5lcykgLT5cbiAgICAgIGluZm8gPSBsaW5lcy5qb2luKCdcXG4nKVxuICAgICAgaWYgaW5mbyBpcyAnQ2Fubm90IHNob3cgaW5mbycgb3Igbm90IGluZm9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTm8gaW5mb1wiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB7cmFuZ2UsIGluZm99XG5cbiAgZmluZFN5bWJvbFByb3ZpZGVyc0luQnVmZmVyOiAoZWRpdG9yLCBjcmFuZ2UpID0+XG4gICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAge3N5bWJvbH0gPSBVdGlsLmdldFN5bWJvbEluUmFuZ2UoZWRpdG9yLCBjcmFuZ2UpXG5cbiAgICBAcXVldWVDbWQgJ2ZpbmQnLFxuICAgICAgaW50ZXJhY3RpdmU6IHRydWVcbiAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICBjb21tYW5kOiAnZmluZCdcbiAgICAgIGFyZ3M6IFtzeW1ib2xdXG5cbiAgZG9DaGVja09yTGludEJ1ZmZlcjogKGNtZCwgYnVmZmVyLCBmYXN0KSA9PlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUgW10gaWYgYnVmZmVyLmlzRW1wdHkoKVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUgW10gdW5sZXNzIGJ1ZmZlci5nZXRVcmkoKT9cblxuICAgICMgQSBkaXJ0eSBoYWNrIHRvIG1ha2UgbGludCB3b3JrIHdpdGggbGhzXG4gICAgb2xkdXJpID0gdXJpID0gYnVmZmVyLmdldFVyaSgpXG4gICAgdGV4dCA9XG4gICAgICBpZiBjbWQgaXMgJ2xpbnQnIGFuZCBleHRuYW1lKHVyaSkgaXMgJy5saHMnXG4gICAgICAgIHVyaSA9IHVyaS5zbGljZSAwLCAtMVxuICAgICAgICB1bmxpdFN5bmMgb2xkdXJpLCBidWZmZXIuZ2V0VGV4dCgpXG4gICAgICBlbHNlIGlmIGJ1ZmZlci5pc01vZGlmaWVkKClcbiAgICAgICAgYnVmZmVyLmdldFRleHQoKVxuICAgIGlmIHRleHQ/LmVycm9yP1xuICAgICAgIyBUT0RPOiBSZWplY3RcbiAgICAgIFttLCB1cmksIGxpbmUsIG1lc3NdID0gdGV4dC5lcnJvci5tYXRjaCgvXiguKj8pOihbMC05XSspOiAqKC4qKSAqJC8pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlIFtcbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAgcG9zaXRpb246IG5ldyBQb2ludChsaW5lIC0gMSwgMClcbiAgICAgICAgbWVzc2FnZTogbWVzc1xuICAgICAgICBzZXZlcml0eTogJ2xpbnQnXG4gICAgICBdXG4gICAgIyBlbmQgb2YgZGlydHkgaGFja1xuXG4gICAgaWYgY21kIGlzICdsaW50J1xuICAgICAgYXJncyA9IFtdLmNvbmNhdCBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5obGludE9wdGlvbnMnKS5tYXAoKHYpIC0+IFsnLS1obGludE9wdCcsIHZdKS4uLlxuXG4gICAgQHF1ZXVlQ21kICdjaGVja2xpbnQnLFxuICAgICAgaW50ZXJhY3RpdmU6IGZhc3RcbiAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICBjb21tYW5kOiBjbWRcbiAgICAgIHVyaTogdXJpXG4gICAgICB0ZXh0OiB0ZXh0XG4gICAgICBhcmdzOiBhcmdzXG4gICAgLnRoZW4gKGxpbmVzKSA9PlxuICAgICAgcm9vdERpciA9IEBnZXRSb290RGlyIGJ1ZmZlclxuICAgICAgcnggPSAvXiguKj8pOihbMC05XFxzXSspOihbMC05XFxzXSspOiAqKD86KFdhcm5pbmd8RXJyb3IpOiAqKT8vXG4gICAgICBsaW5lc1xuICAgICAgLmZpbHRlciAobGluZSkgLT5cbiAgICAgICAgc3dpdGNoXG4gICAgICAgICAgd2hlbiBsaW5lLnN0YXJ0c1dpdGggJ0R1bW15OjA6MDpFcnJvcjonXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgbGluZS5zbGljZSgxNilcbiAgICAgICAgICB3aGVuIGxpbmUuc3RhcnRzV2l0aCAnRHVtbXk6MDowOldhcm5pbmc6J1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgbGluZS5zbGljZSgxOClcbiAgICAgICAgICB3aGVuIGxpbmUubWF0Y2gocngpP1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICB3aGVuIGxpbmUudHJpbSgpLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIFV0aWwud2FybiBcImdoYy1tb2Qgc2F5czogI3tsaW5lfVwiXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgLm1hcCAobGluZSkgLT5cbiAgICAgICAgbWF0Y2ggPSBsaW5lLm1hdGNoKHJ4KVxuICAgICAgICBbbSwgZmlsZSwgcm93LCBjb2wsIHdhcm5pbmddID0gbWF0Y2hcbiAgICAgICAgZmlsZSA9IG9sZHVyaSBpZiB1cmkuZW5kc1dpdGgoZmlsZSlcbiAgICAgICAgc2V2ZXJpdHkgPVxuICAgICAgICAgIGlmIGNtZCA9PSAnbGludCdcbiAgICAgICAgICAgICdsaW50J1xuICAgICAgICAgIGVsc2UgaWYgd2FybmluZyA9PSAnV2FybmluZydcbiAgICAgICAgICAgICd3YXJuaW5nJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgbWVzc1BvcyA9IG5ldyBQb2ludChyb3cgLSAxLCBjb2wgLSAxKVxuICAgICAgICBtZXNzUG9zID0gVXRpbC50YWJVbnNoaWZ0Rm9yUG9pbnQoYnVmZmVyLCBtZXNzUG9zKVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdXJpOiAodHJ5IHJvb3REaXIuZ2V0RmlsZShyb290RGlyLnJlbGF0aXZpemUoZmlsZSkpLmdldFBhdGgoKSkgPyBmaWxlXG4gICAgICAgICAgcG9zaXRpb246IG1lc3NQb3NcbiAgICAgICAgICBtZXNzYWdlOiBsaW5lLnJlcGxhY2UgbSwgJydcbiAgICAgICAgICBzZXZlcml0eTogc2V2ZXJpdHlcbiAgICAgICAgfVxuXG4gIGRvQ2hlY2tCdWZmZXI6IChidWZmZXIsIGZhc3QpID0+XG4gICAgQGRvQ2hlY2tPckxpbnRCdWZmZXIgXCJjaGVja1wiLCBidWZmZXIsIGZhc3RcblxuICBkb0xpbnRCdWZmZXI6IChidWZmZXIsIGZhc3QpID0+XG4gICAgQGRvQ2hlY2tPckxpbnRCdWZmZXIgXCJsaW50XCIsIGJ1ZmZlciwgZmFzdFxuXG4gIGRvQ2hlY2tBbmRMaW50OiAoYnVmZmVyLCBmYXN0KSA9PlxuICAgIFByb21pc2UuYWxsIFsgQGRvQ2hlY2tCdWZmZXIoYnVmZmVyLCBmYXN0KSwgQGRvTGludEJ1ZmZlcihidWZmZXIsIGZhc3QpIF1cbiAgICAudGhlbiAocmVzQXJyKSAtPiBbXS5jb25jYXQgcmVzQXJyLi4uXG4iXX0=
