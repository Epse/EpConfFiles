(function() {
  var CompositeDisposable, Emitter, GhcModiProcess, GhcModiProcessReal, Point, Queue, Range, Util, extname, unlitSync, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Util = require('../util');

  extname = require('path').extname;

  Queue = require('promise-queue');

  unlitSync = require('atom-haskell-utils').unlitSync;

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
      timeout = atom.config.get('haskell-ghc-mod.syncTimeout');
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
      timeout = atom.config.get('haskell-ghc-mod.syncTimeout');
      stackghc = Util.execPromise('stack', ['ghc', '--', '--version'], _.extend({
        timeout: timeout
      }, opts)).then(function(stdout) {
        return /version (.+)$/.exec(stdout.trim())[1];
      })["catch"](function(error) {
        Util.warn(error);
        return null;
      });
      pathghc = Util.execPromise('ghc', ['--version'], _.extend({
        timeout: timeout
      }, opts)).then(function(stdout) {
        return /version (.+)$/.exec(stdout.trim())[1];
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
          var rd;
          _this.emitter.emit('backend-active');
          rd = runArgs.dir || Util.getRootDir(runArgs.options.cwd);
          return new Promise(function(resolve, reject) {
            return rd.getEntries(function(error, files) {
              if (error != null) {
                return reject(error);
              } else {
                return resolve(files);
              }
            });
          })["catch"](function(error) {
            Util.warn(error);
            return [];
          }).then(function(files) {
            if (files.some(function(e) {
              return e.isFile() && e.getBaseName() === '.disable-ghc-mod';
            })) {
              throw new Error("Disable-ghc-mod found");
            }
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
          var myrange, pos, tokens, type;
          if (acc !== '') {
            return acc;
          }
          tokens = line.split('"');
          pos = tokens[0].trim().split(' ').map(function(i) {
            return i - 1;
          });
          type = tokens[1];
          myrange = new Range([pos[0], pos[1]], [pos[2], pos[3]]);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oYXNrZWxsLWdoYy1tb2QvbGliL2doYy1tb2QvZ2hjLW1vZGktcHJvY2Vzcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0hBQUE7SUFBQTtzQkFBQTs7QUFBQSxFQUFBLE9BQStDLE9BQUEsQ0FBUSxNQUFSLENBQS9DLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsZUFBQSxPQUFmLEVBQXdCLDJCQUFBLG1CQUF4QixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUMsWUFBYSxPQUFBLENBQVEsb0JBQVIsRUFBYixTQUpELENBQUE7O0FBQUEsRUFNQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsZ0NBQVIsQ0FOckIsQ0FBQTs7QUFBQSxFQU9BLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FQSixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZCQUFBLE9BQUEsR0FBUyxJQUFULENBQUE7O0FBQUEsNkJBQ0EsYUFBQSxHQUFlLElBRGYsQ0FBQTs7QUFHYSxJQUFBLHdCQUFBLEdBQUE7QUFDWCw2REFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEsdUZBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtB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

//# sourceURL=/home/epse/.atom/packages/haskell-ghc-mod/lib/ghc-mod/ghc-modi-process.coffee
