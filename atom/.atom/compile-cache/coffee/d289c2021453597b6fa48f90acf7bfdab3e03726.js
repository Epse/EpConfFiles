(function() {
  var BufferInfo, CompletionBackend, Disposable, FZ, ModuleInfo, Range, Util, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FZ = require('fuzzaldrin');

  _ref = require('atom'), Disposable = _ref.Disposable, Range = _ref.Range;

  BufferInfo = require('./buffer-info');

  ModuleInfo = require('./module-info');

  Util = require('../util');

  _ = require('underscore-plus');

  module.exports = CompletionBackend = (function() {
    CompletionBackend.prototype.process = null;

    CompletionBackend.prototype.bufferMap = null;

    CompletionBackend.prototype.dirMap = null;

    CompletionBackend.prototype.modListMap = null;

    CompletionBackend.prototype.languagePragmas = null;

    CompletionBackend.prototype.compilerOptions = null;

    function CompletionBackend(proc) {
      this.getCompletionsForHole = __bind(this.getCompletionsForHole, this);
      this.getCompletionsForCompilerOptions = __bind(this.getCompletionsForCompilerOptions, this);
      this.getCompletionsForLanguagePragmas = __bind(this.getCompletionsForLanguagePragmas, this);
      this.getCompletionsForSymbolInModule = __bind(this.getCompletionsForSymbolInModule, this);
      this.getCompletionsForModule = __bind(this.getCompletionsForModule, this);
      this.getCompletionsForClass = __bind(this.getCompletionsForClass, this);
      this.getCompletionsForType = __bind(this.getCompletionsForType, this);
      this.getCompletionsForSymbol = __bind(this.getCompletionsForSymbol, this);
      this.unregisterCompletionBuffer = __bind(this.unregisterCompletionBuffer, this);
      this.registerCompletionBuffer = __bind(this.registerCompletionBuffer, this);
      this.onDidDestroy = __bind(this.onDidDestroy, this);
      this.getModuleInfo = __bind(this.getModuleInfo, this);
      this.getModuleMap = __bind(this.getModuleMap, this);
      this.getBufferInfo = __bind(this.getBufferInfo, this);
      this.getSymbolsForBuffer = __bind(this.getSymbolsForBuffer, this);
      this.isActive = __bind(this.isActive, this);
      this.bufferMap = new WeakMap;
      this.dirMap = new WeakMap;
      this.modListMap = new WeakMap;
      this.languagePragmas = new WeakMap;
      this.compilerOptions = new WeakMap;
      this.setProcess(proc);
    }

    CompletionBackend.prototype.setProcess = function(process) {
      var _ref1;
      this.process = process;
      return (_ref1 = this.process) != null ? _ref1.onDidDestroy((function(_this) {
        return function() {
          return _this.process = null;
        };
      })(this)) : void 0;
    };

    CompletionBackend.prototype.isActive = function() {
      if (this.process == null) {
        atom.notifications.addWarning("Haskell Completion Backend " + (this.name()) + " is inactive");
      }
      return this.process != null;
    };

    CompletionBackend.prototype.getSymbolsForBuffer = function(buffer, symbolTypes) {
      var bufferInfo, moduleMap, rootDir, _ref1;
      bufferInfo = this.getBufferInfo({
        buffer: buffer
      }).bufferInfo;
      _ref1 = this.getModuleMap({
        bufferInfo: bufferInfo
      }), rootDir = _ref1.rootDir, moduleMap = _ref1.moduleMap;
      if ((bufferInfo != null) && (moduleMap != null)) {
        return bufferInfo.getImports().then((function(_this) {
          return function(imports) {
            return Promise.all(imports.map(function(imp) {
              return _this.getModuleInfo({
                moduleName: imp.name,
                rootDir: rootDir,
                moduleMap: moduleMap
              }).then(function(_arg) {
                var moduleInfo;
                moduleInfo = _arg.moduleInfo;
                return moduleInfo.select(imp, symbolTypes);
              });
            }));
          };
        })(this)).then(function(promises) {
          var _ref2;
          return (_ref2 = []).concat.apply(_ref2, promises);
        });
      } else {
        return Promise.resolve([]);
      }
    };

    CompletionBackend.prototype.getBufferInfo = function(_arg) {
      var bi, buffer;
      buffer = _arg.buffer;
      if (buffer == null) {
        throw new Error("Null buffer in getBufferInfo!");
      }
      if (this.bufferMap.has(buffer)) {
        bi = this.bufferMap.get(buffer);
      }
      if ((bi != null ? bi.buffer : void 0) == null) {
        this.bufferMap.set(buffer, bi = new BufferInfo(buffer));
      }
      return {
        bufferInfo: bi
      };
    };

    CompletionBackend.prototype.getModuleMap = function(_arg) {
      var bufferInfo, mm, rootDir, _ref1, _ref2;
      bufferInfo = _arg.bufferInfo, rootDir = _arg.rootDir;
      if (!((bufferInfo != null) || (rootDir != null))) {
        throw new Error("Neither bufferInfo nor rootDir specified");
      }
      if (rootDir == null) {
        rootDir = (_ref1 = (_ref2 = this.process) != null ? typeof _ref2.getRootDir === "function" ? _ref2.getRootDir(bufferInfo.buffer) : void 0 : void 0) != null ? _ref1 : Util.getRootDir(bufferInfo.buffer);
      }
      if (!this.dirMap.has(rootDir)) {
        this.dirMap.set(rootDir, mm = new Map);
      } else {
        mm = this.dirMap.get(rootDir);
      }
      return {
        rootDir: rootDir,
        moduleMap: mm
      };
    };

    CompletionBackend.prototype.getModuleInfo = function(_arg) {
      var bufferInfo, moduleMap, moduleName, rootDir;
      moduleName = _arg.moduleName, bufferInfo = _arg.bufferInfo, rootDir = _arg.rootDir, moduleMap = _arg.moduleMap;
      if (!((moduleName != null) || (bufferInfo != null))) {
        throw new Error("No moduleName or bufferInfo specified");
      }
      return Promise.resolve(moduleName || bufferInfo.getModuleName()).then((function(_this) {
        return function(moduleName) {
          var moduleInfo, _ref1;
          if (!moduleName) {
            Util.debug("warn: nameless module in " + (bufferInfo.buffer.getUri()));
            return;
          }
          if (!((moduleMap != null) && (rootDir != null))) {
            if (bufferInfo == null) {
              throw new Error("No bufferInfo specified and no moduleMap+rootDir");
            }
            _ref1 = _this.getModuleMap({
              bufferInfo: bufferInfo,
              rootDir: rootDir
            }), rootDir = _ref1.rootDir, moduleMap = _ref1.moduleMap;
          }
          moduleInfo = moduleMap.get(moduleName);
          if ((moduleInfo != null ? moduleInfo.symbols : void 0) == null) {
            return new Promise(function(resolve) {
              moduleMap.set(moduleName, moduleInfo = new ModuleInfo(moduleName, _this.process, rootDir, function() {
                return resolve({
                  bufferInfo: bufferInfo,
                  rootDir: rootDir,
                  moduleMap: moduleMap,
                  moduleInfo: moduleInfo
                });
              }));
              if (bufferInfo != null) {
                moduleInfo.setBuffer(bufferInfo, rootDir);
              } else {
                atom.workspace.getTextEditors().forEach(function(editor) {
                  bufferInfo = _this.getBufferInfo({
                    buffer: editor.getBuffer()
                  }).bufferInfo;
                  return moduleInfo.setBuffer(bufferInfo, rootDir);
                });
              }
              return moduleInfo.onDidDestroy(function() {
                moduleMap["delete"](moduleName);
                return Util.debug("" + moduleName + " removed from map");
              });
            });
          } else {
            return Promise.resolve({
              bufferInfo: bufferInfo,
              rootDir: rootDir,
              moduleMap: moduleMap,
              moduleInfo: moduleInfo
            });
          }
        };
      })(this));
    };

    CompletionBackend.prototype.filter = function(candidates, prefix, keys) {
      if (!prefix) {
        return candidates;
      }
      return candidates.map(function(c) {
        var c1, scores;
        c1 = _.clone(c);
        scores = keys.map(function(key) {
          return FZ.score(c1[key], prefix);
        });
        c1.score = Math.max.apply(Math, scores);
        c1.scoreN = scores.indexOf(c1.score);
        return c1;
      }).filter(function(c) {
        return c.score > 0;
      }).sort(function(a, b) {
        var s;
        s = b.score - a.score;
        if (s === 0) {
          s = a.scoreN - b.scoreN;
        }
        return s;
      });
    };


    /* Public interface below */


    /*
    name()
    Get backend name
    
    Returns String, unique string describing a given backend
     */

    CompletionBackend.prototype.name = function() {
      return "haskell-ghc-mod";
    };


    /*
    onDidDestroy(callback)
    Destruction event subscription. Usually should be called only on
    package deactivation.
    callback: () ->
     */

    CompletionBackend.prototype.onDidDestroy = function(callback) {
      if (this.isActive) {
        return this.process.onDidDestroy(callback);
      }
    };


    /*
    registerCompletionBuffer(buffer)
    Every buffer that would be used with autocompletion functions has to
    be registered with this function.
    
    buffer: TextBuffer, buffer to be used in autocompletion
    
    Returns: Disposable, which will remove buffer from autocompletion
     */

    CompletionBackend.prototype.registerCompletionBuffer = function(buffer) {
      if (this.bufferMap.has(buffer)) {
        return new Disposable(function() {});
      }
      setImmediate((function(_this) {
        return function() {
          var bufferInfo, moduleMap, rootDir, _ref1;
          bufferInfo = _this.getBufferInfo({
            buffer: buffer
          }).bufferInfo;
          _ref1 = _this.getModuleMap({
            bufferInfo: bufferInfo
          }), rootDir = _ref1.rootDir, moduleMap = _ref1.moduleMap;
          _this.getModuleInfo({
            bufferInfo: bufferInfo,
            rootDir: rootDir,
            moduleMap: moduleMap
          });
          return bufferInfo.getImports().then(function(imports) {
            return imports.forEach(function(_arg) {
              var name;
              name = _arg.name;
              return _this.getModuleInfo({
                moduleName: name,
                rootDir: rootDir,
                moduleMap: moduleMap
              });
            });
          });
        };
      })(this));
      return new Disposable((function(_this) {
        return function() {
          return _this.unregisterCompletionBuffer(buffer);
        };
      })(this));
    };


    /*
    unregisterCompletionBuffer(buffer)
    buffer: TextBuffer, buffer to be removed from autocompletion
     */

    CompletionBackend.prototype.unregisterCompletionBuffer = function(buffer) {
      var _ref1;
      return (_ref1 = this.bufferMap.get(buffer)) != null ? _ref1.destroy() : void 0;
    };


    /*
    getCompletionsForSymbol(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([symbol])
    symbol: Object, a completion symbol
      name: String, symbol name
      qname: String, qualified name, if module is qualified.
             Otherwise, same as name
      typeSignature: String, type signature
      symbolType: String, one of ['type', 'class', 'function']
      module: Object, symbol module information
        qualified: Boolean, true if module is imported as qualified
        name: String, module name
        alias: String, module alias
        hiding: Boolean, true if module is imported with hiding clause
        importList: [String], array of explicit imports/hidden imports
     */

    CompletionBackend.prototype.getCompletionsForSymbol = function(buffer, prefix, position) {
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      return this.getSymbolsForBuffer(buffer).then((function(_this) {
        return function(symbols) {
          return _this.filter(symbols, prefix, ['qname', 'qparent']);
        };
      })(this));
    };


    /*
    getCompletionsForType(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([symbol])
    symbol: Same as getCompletionsForSymbol, except
            symbolType is one of ['type', 'class']
     */

    CompletionBackend.prototype.getCompletionsForType = function(buffer, prefix, position) {
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      return this.getSymbolsForBuffer(buffer, ['type', 'class']).then(function(symbols) {
        return FZ.filter(symbols, prefix, {
          key: 'qname'
        });
      });
    };


    /*
    getCompletionsForClass(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([symbol])
    symbol: Same as getCompletionsForSymbol, except
            symbolType is one of ['class']
     */

    CompletionBackend.prototype.getCompletionsForClass = function(buffer, prefix, position) {
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      return this.getSymbolsForBuffer(buffer, ['class']).then(function(symbols) {
        return FZ.filter(symbols, prefix, {
          key: 'qname'
        });
      });
    };


    /*
    getCompletionsForModule(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([module])
    module: String, module name
     */

    CompletionBackend.prototype.getCompletionsForModule = function(buffer, prefix, position) {
      var m, rootDir, _ref1, _ref2;
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      rootDir = (_ref1 = (_ref2 = this.process) != null ? typeof _ref2.getRootDir === "function" ? _ref2.getRootDir(buffer) : void 0 : void 0) != null ? _ref1 : Util.getRootDir(buffer);
      m = this.modListMap.get(rootDir);
      if (m != null) {
        return Promise.resolve(FZ.filter(m, prefix));
      } else {
        return this.process.runList(buffer).then((function(_this) {
          return function(modules) {
            _this.modListMap.set(rootDir, modules);
            setTimeout((function() {
              return _this.modListMap["delete"](rootDir);
            }), 60 * 1000);
            return FZ.filter(modules, prefix);
          };
        })(this));
      }
    };


    /*
    getCompletionsForSymbolInModule(buffer,prefix,position,{module})
    Used in import hiding/list completions
    
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    module: String, module name (optional). If undefined, function
            will attempt to infer module name from position and buffer.
    
    Returns: Promise([symbol])
    symbol: Object, symbol in given module
      name: String, symbol name
      typeSignature: String, type signature
      symbolType: String, one of ['type', 'class', 'function']
     */

    CompletionBackend.prototype.getCompletionsForSymbolInModule = function(buffer, prefix, position, opts) {
      var bufferInfo, lineRange, moduleName;
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      moduleName = opts != null ? opts.module : void 0;
      if (moduleName == null) {
        lineRange = new Range([0, position.row], position);
        buffer.backwardsScanInRange(/^import\s+([\w.]+)/, lineRange, function(_arg) {
          var match;
          match = _arg.match;
          return moduleName = match[1];
        });
      }
      bufferInfo = this.getBufferInfo({
        buffer: buffer
      }).bufferInfo;
      return this.getModuleInfo({
        bufferInfo: bufferInfo,
        moduleName: moduleName
      }).then(function(_arg) {
        var moduleInfo, symbols;
        moduleInfo = _arg.moduleInfo;
        symbols = moduleInfo.select({
          qualified: false,
          skipQualified: true,
          hiding: false,
          name: moduleName
        });
        return FZ.filter(symbols, prefix, {
          key: 'name'
        });
      });
    };


    /*
    getCompletionsForLanguagePragmas(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([pragma])
    pragma: String, language option
     */

    CompletionBackend.prototype.getCompletionsForLanguagePragmas = function(buffer, prefix, position) {
      var dir, p, promise, _ref1, _ref2;
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      dir = (_ref1 = (_ref2 = this.process) != null ? typeof _ref2.getRootDir === "function" ? _ref2.getRootDir(buffer) : void 0 : void 0) != null ? _ref1 : Util.getRootDir(buffer);
      p = this.languagePragmas.has(dir) ? this.languagePragmas.get(dir) : (promise = this.process.runLang(dir), this.languagePragmas.set(dir, promise), promise);
      return p.then(function(pragmas) {
        return FZ.filter(pragmas, prefix);
      });
    };


    /*
    getCompletionsForCompilerOptions(buffer,prefix,position)
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([ghcopt])
    ghcopt: String, compiler option (starts with '-f')
     */

    CompletionBackend.prototype.getCompletionsForCompilerOptions = function(buffer, prefix, position) {
      var dir, p, promise, _ref1, _ref2;
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      dir = (_ref1 = (_ref2 = this.process) != null ? typeof _ref2.getRootDir === "function" ? _ref2.getRootDir(buffer) : void 0 : void 0) != null ? _ref1 : Util.getRootDir(buffer);
      p = this.compilerOptions.has(dir) ? this.compilerOptions.get(dir) : (promise = this.process.runFlag(dir), this.compilerOptions.set(dir, promise), promise);
      return p.then(function(options) {
        return FZ.filter(options, prefix);
      });
    };


    /*
    getCompletionsForHole(buffer,prefix,position)
    Get completions based on expression type.
    It is assumed that `prefix` starts with '_'
    
    buffer: TextBuffer, current buffer
    prefix: String, completion prefix
    position: Point, current cursor position
    
    Returns: Promise([symbol])
    symbol: Same as getCompletionsForSymbol
     */

    CompletionBackend.prototype.getCompletionsForHole = function(buffer, prefix, position) {
      if (!this.isActive()) {
        return Promise.reject("Backend inactive");
      }
      if (position != null) {
        position = Range.fromPointWithDelta(position, 0, 0);
      }
      if (prefix.startsWith('_')) {
        prefix = prefix.slice(1);
      }
      return this.process.getTypeInBuffer(buffer, position).then((function(_this) {
        return function(_arg) {
          var type;
          type = _arg.type;
          return _this.getSymbolsForBuffer(buffer).then(function(symbols) {
            var ts;
            ts = symbols.filter(function(s) {
              var rx, tl;
              if (s.typeSignature == null) {
                return false;
              }
              tl = s.typeSignature.split(' -> ').slice(-1)[0];
              if (tl.match(/^[a-z]$/)) {
                return false;
              }
              ts = tl.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
              rx = RegExp(ts.replace(/\b[a-z]\b/g, '.+'), '');
              return rx.test(type);
            });
            if (prefix.length === 0) {
              return ts.sort(function(a, b) {
                return FZ.score(b.typeSignature, type) - FZ.score(a.typeSignature, type);
              });
            } else {
              return FZ.filter(ts, prefix, {
                key: 'qname'
              });
            }
          });
        };
      })(this));
    };

    return CompletionBackend;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvY29tcGxldGlvbi1iYWNrZW5kL2NvbXBsZXRpb24tYmFja2VuZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0VBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsWUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxPQUFzQixPQUFBLENBQVEsTUFBUixDQUF0QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxhQUFBLEtBRGIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBSlAsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FMSixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGdDQUFBLE9BQUEsR0FBUyxJQUFULENBQUE7O0FBQUEsZ0NBQ0EsU0FBQSxHQUFXLElBRFgsQ0FBQTs7QUFBQSxnQ0FFQSxNQUFBLEdBQVEsSUFGUixDQUFBOztBQUFBLGdDQUdBLFVBQUEsR0FBWSxJQUhaLENBQUE7O0FBQUEsZ0NBSUEsZUFBQSxHQUFpQixJQUpqQixDQUFBOztBQUFBLGdDQUtBLGVBQUEsR0FBaUIsSUFMakIsQ0FBQTs7QUFPYSxJQUFBLDJCQUFDLElBQUQsR0FBQTtBQUNYLDJFQUFBLENBQUE7QUFBQSxpR0FBQSxDQUFBO0FBQUEsaUdBQUEsQ0FBQTtBQUFBLCtGQUFBLENBQUE7QUFBQSwrRUFBQSxDQUFBO0FBQUEsNkVBQUEsQ0FBQTtBQUFBLDJFQUFBLENBQUE7QUFBQSwrRUFBQSxDQUFBO0FBQUEscUZBQUEsQ0FBQTtBQUFBLGlGQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdUVBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFBLE9BQWIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxHQUFBLENBQUEsT0FEVixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQUEsQ0FBQSxPQUZkLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQUEsQ0FBQSxPQUhuQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsZUFBRCxHQUFtQixHQUFBLENBQUEsT0FKbkIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLENBTkEsQ0FEVztJQUFBLENBUGI7O0FBQUEsZ0NBZ0JBLFVBQUEsR0FBWSxTQUFFLE9BQUYsR0FBQTtBQUNWLFVBQUEsS0FBQTtBQUFBLE1BRFcsSUFBQyxDQUFBLFVBQUEsT0FDWixDQUFBO21EQUFRLENBQUUsWUFBVixDQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNyQixLQUFDLENBQUEsT0FBRCxHQUFXLEtBRFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixXQURVO0lBQUEsQ0FoQlosQ0FBQTs7QUFBQSxnQ0FvQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBTyxvQkFBUDtBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUErQiw2QkFBQSxHQUE0QixDQUFDLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBRCxDQUE1QixHQUFxQyxjQUFwRSxDQUFBLENBREY7T0FBQTthQUdBLHFCQUpRO0lBQUEsQ0FwQlYsQ0FBQTs7QUFBQSxnQ0EwQkEsbUJBQUEsR0FBcUIsU0FBQyxNQUFELEVBQVMsV0FBVCxHQUFBO0FBQ25CLFVBQUEscUNBQUE7QUFBQSxNQUFDLGFBQWMsSUFBQyxDQUFBLGFBQUQsQ0FBZTtBQUFBLFFBQUMsUUFBQSxNQUFEO09BQWYsRUFBZCxVQUFELENBQUE7QUFBQSxNQUNBLFFBQXVCLElBQUMsQ0FBQSxZQUFELENBQWM7QUFBQSxRQUFDLFlBQUEsVUFBRDtPQUFkLENBQXZCLEVBQUMsZ0JBQUEsT0FBRCxFQUFVLGtCQUFBLFNBRFYsQ0FBQTtBQUVBLE1BQUEsSUFBRyxvQkFBQSxJQUFnQixtQkFBbkI7ZUFDRSxVQUFVLENBQUMsVUFBWCxDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE9BQUQsR0FBQTttQkFDSixPQUFPLENBQUMsR0FBUixDQUFZLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxHQUFELEdBQUE7cUJBQ3RCLEtBQUMsQ0FBQSxhQUFELENBQ0U7QUFBQSxnQkFBQSxVQUFBLEVBQVksR0FBRyxDQUFDLElBQWhCO0FBQUEsZ0JBQ0EsT0FBQSxFQUFTLE9BRFQ7QUFBQSxnQkFFQSxTQUFBLEVBQVcsU0FGWDtlQURGLENBSUEsQ0FBQyxJQUpELENBSU0sU0FBQyxJQUFELEdBQUE7QUFDSixvQkFBQSxVQUFBO0FBQUEsZ0JBRE0sYUFBRCxLQUFDLFVBQ04sQ0FBQTt1QkFBQSxVQUFVLENBQUMsTUFBWCxDQUFrQixHQUFsQixFQUF1QixXQUF2QixFQURJO2NBQUEsQ0FKTixFQURzQjtZQUFBLENBQVosQ0FBWixFQURJO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQVNBLENBQUMsSUFURCxDQVNNLFNBQUMsUUFBRCxHQUFBO0FBQ0osY0FBQSxLQUFBO2lCQUFBLFNBQUEsRUFBQSxDQUFFLENBQUMsTUFBSCxjQUFVLFFBQVYsRUFESTtRQUFBLENBVE4sRUFERjtPQUFBLE1BQUE7ZUFhRSxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixFQWJGO09BSG1CO0lBQUEsQ0ExQnJCLENBQUE7O0FBQUEsZ0NBNENBLGFBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTtBQUNiLFVBQUEsVUFBQTtBQUFBLE1BRGUsU0FBRCxLQUFDLE1BQ2YsQ0FBQTtBQUFBLE1BQUEsSUFBTyxjQUFQO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSwrQkFBTixDQUFWLENBREY7T0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxNQUFmLENBQUg7QUFDRSxRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxNQUFmLENBQUwsQ0FERjtPQUZBO0FBSUEsTUFBQSxJQUFPLHlDQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxNQUFmLEVBQXVCLEVBQUEsR0FBUyxJQUFBLFVBQUEsQ0FBVyxNQUFYLENBQWhDLENBQUEsQ0FERjtPQUpBO2FBUUE7QUFBQSxRQUFBLFVBQUEsRUFBWSxFQUFaO1FBVGE7SUFBQSxDQTVDZixDQUFBOztBQUFBLGdDQXVEQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLHFDQUFBO0FBQUEsTUFEYyxrQkFBQSxZQUFZLGVBQUEsT0FDMUIsQ0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQU8sb0JBQUEsSUFBZSxpQkFBdEIsQ0FBQTtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sMENBQU4sQ0FBVixDQURGO09BQUE7O1FBRUEsc0tBQXNELElBQUksQ0FBQyxVQUFMLENBQWdCLFVBQVUsQ0FBQyxNQUEzQjtPQUZ0RDtBQUdBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE9BQVosQ0FBUDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksT0FBWixFQUFxQixFQUFBLEdBQUssR0FBQSxDQUFBLEdBQTFCLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxPQUFaLENBQUwsQ0FIRjtPQUhBO2FBUUE7QUFBQSxRQUFBLE9BQUEsRUFBUyxPQUFUO0FBQUEsUUFDQSxTQUFBLEVBQVcsRUFEWDtRQVRZO0lBQUEsQ0F2RGQsQ0FBQTs7QUFBQSxnQ0FtRUEsYUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2IsVUFBQSwwQ0FBQTtBQUFBLE1BRGUsa0JBQUEsWUFBWSxrQkFBQSxZQUFZLGVBQUEsU0FBUyxpQkFBQSxTQUNoRCxDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBTyxvQkFBQSxJQUFlLG9CQUF0QixDQUFBO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSx1Q0FBTixDQUFWLENBREY7T0FBQTthQUdBLE9BQU8sQ0FBQyxPQUFSLENBQWlCLFVBQUEsSUFBYyxVQUFVLENBQUMsYUFBWCxDQUFBLENBQS9CLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsVUFBRCxHQUFBO0FBQ0osY0FBQSxpQkFBQTtBQUFBLFVBQUEsSUFBQSxDQUFBLFVBQUE7QUFDRSxZQUFBLElBQUksQ0FBQyxLQUFMLENBQVksMkJBQUEsR0FDVCxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBbEIsQ0FBQSxDQUFELENBREgsQ0FBQSxDQUFBO0FBRUEsa0JBQUEsQ0FIRjtXQUFBO0FBSUEsVUFBQSxJQUFBLENBQUEsQ0FBTyxtQkFBQSxJQUFlLGlCQUF0QixDQUFBO0FBQ0UsWUFBQSxJQUFPLGtCQUFQO0FBQ0Usb0JBQVUsSUFBQSxLQUFBLENBQU0sa0RBQU4sQ0FBVixDQURGO2FBQUE7QUFBQSxZQUVBLFFBQXVCLEtBQUMsQ0FBQSxZQUFELENBQWM7QUFBQSxjQUFDLFlBQUEsVUFBRDtBQUFBLGNBQWEsU0FBQSxPQUFiO2FBQWQsQ0FBdkIsRUFBQyxnQkFBQSxPQUFELEVBQVUsa0JBQUEsU0FGVixDQURGO1dBSkE7QUFBQSxVQVNBLFVBQUEsR0FBYSxTQUFTLENBQUMsR0FBVixDQUFjLFVBQWQsQ0FUYixDQUFBO0FBVUEsVUFBQSxJQUFPLDBEQUFQO21CQUNNLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ1YsY0FBQSxTQUFTLENBQUMsR0FBVixDQUFjLFVBQWQsRUFDRSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUFXLFVBQVgsRUFBdUIsS0FBQyxDQUFBLE9BQXhCLEVBQWlDLE9BQWpDLEVBQTBDLFNBQUEsR0FBQTt1QkFDekQsT0FBQSxDQUFRO0FBQUEsa0JBQUMsWUFBQSxVQUFEO0FBQUEsa0JBQWEsU0FBQSxPQUFiO0FBQUEsa0JBQXNCLFdBQUEsU0FBdEI7QUFBQSxrQkFBaUMsWUFBQSxVQUFqQztpQkFBUixFQUR5RDtjQUFBLENBQTFDLENBRG5CLENBQUEsQ0FBQTtBQUlBLGNBQUEsSUFBRyxrQkFBSDtBQUNFLGdCQUFBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFVBQXJCLEVBQWlDLE9BQWpDLENBQUEsQ0FERjtlQUFBLE1BQUE7QUFHRSxnQkFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBQSxDQUErQixDQUFDLE9BQWhDLENBQXdDLFNBQUMsTUFBRCxHQUFBO0FBQ3RDLGtCQUFDLGFBQWMsS0FBQyxDQUFBLGFBQUQsQ0FBZTtBQUFBLG9CQUFDLE1BQUEsRUFBUSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVQ7bUJBQWYsRUFBZCxVQUFELENBQUE7eUJBQ0EsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsVUFBckIsRUFBaUMsT0FBakMsRUFGc0M7Z0JBQUEsQ0FBeEMsQ0FBQSxDQUhGO2VBSkE7cUJBV0EsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQSxHQUFBO0FBQ3RCLGdCQUFBLFNBQVMsQ0FBQyxRQUFELENBQVQsQ0FBaUIsVUFBakIsQ0FBQSxDQUFBO3VCQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBQSxHQUFHLFVBQUgsR0FBYyxtQkFBekIsRUFGc0I7Y0FBQSxDQUF4QixFQVpVO1lBQUEsQ0FBUixFQUROO1dBQUEsTUFBQTttQkFpQkUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0I7QUFBQSxjQUFDLFlBQUEsVUFBRDtBQUFBLGNBQWEsU0FBQSxPQUFiO0FBQUEsY0FBc0IsV0FBQSxTQUF0QjtBQUFBLGNBQWlDLFlBQUEsVUFBakM7YUFBaEIsRUFqQkY7V0FYSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sRUFKYTtJQUFBLENBbkVmLENBQUE7O0FBQUEsZ0NBc0dBLE1BQUEsR0FBUSxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLElBQXJCLEdBQUE7QUFDTixNQUFBLElBQUEsQ0FBQSxNQUFBO0FBQ0UsZUFBTyxVQUFQLENBREY7T0FBQTthQUVBLFVBQ0EsQ0FBQyxHQURELENBQ0ssU0FBQyxDQUFELEdBQUE7QUFDSCxZQUFBLFVBQUE7QUFBQSxRQUFBLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsQ0FBTCxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLEdBQUQsR0FBQTtpQkFBUyxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQUcsQ0FBQSxHQUFBLENBQVosRUFBa0IsTUFBbEIsRUFBVDtRQUFBLENBQVQsQ0FEVCxDQUFBO0FBQUEsUUFFQSxFQUFFLENBQUMsS0FBSCxHQUFXLElBQUksQ0FBQyxHQUFMLGFBQVMsTUFBVCxDQUZYLENBQUE7QUFBQSxRQUdBLEVBQUUsQ0FBQyxNQUFILEdBQVksTUFBTSxDQUFDLE9BQVAsQ0FBZSxFQUFFLENBQUMsS0FBbEIsQ0FIWixDQUFBO0FBSUEsZUFBTyxFQUFQLENBTEc7TUFBQSxDQURMLENBT0EsQ0FBQyxNQVBELENBT1EsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsS0FBRixHQUFVLEVBQWpCO01BQUEsQ0FQUixDQVFBLENBQUMsSUFSRCxDQVFNLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNKLFlBQUEsQ0FBQTtBQUFBLFFBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQWhCLENBQUE7QUFDQSxRQUFBLElBQUcsQ0FBQSxLQUFLLENBQVI7QUFDRSxVQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixHQUFXLENBQUMsQ0FBQyxNQUFqQixDQURGO1NBREE7QUFHQSxlQUFPLENBQVAsQ0FKSTtNQUFBLENBUk4sRUFITTtJQUFBLENBdEdSLENBQUE7O0FBdUhBO0FBQUEsZ0NBdkhBOztBQXlIQTtBQUFBOzs7OztPQXpIQTs7QUFBQSxnQ0ErSEEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUFHLGtCQUFIO0lBQUEsQ0EvSE4sQ0FBQTs7QUFpSUE7QUFBQTs7Ozs7T0FqSUE7O0FBQUEsZ0NBdUlBLFlBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTtBQUNaLE1BQUEsSUFBa0MsSUFBQyxDQUFBLFFBQW5DO2VBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLFFBQXRCLEVBQUE7T0FEWTtJQUFBLENBdklkLENBQUE7O0FBMElBO0FBQUE7Ozs7Ozs7O09BMUlBOztBQUFBLGdDQW1KQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtBQUN4QixNQUFBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsTUFBZixDQUFIO0FBQ0UsZUFBVyxJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUEsQ0FBWCxDQUFYLENBREY7T0FBQTtBQUFBLE1BR0EsWUFBQSxDQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDWCxjQUFBLHFDQUFBO0FBQUEsVUFBQyxhQUFjLEtBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxZQUFDLFFBQUEsTUFBRDtXQUFmLEVBQWQsVUFBRCxDQUFBO0FBQUEsVUFFQSxRQUF1QixLQUFDLENBQUEsWUFBRCxDQUFjO0FBQUEsWUFBQyxZQUFBLFVBQUQ7V0FBZCxDQUF2QixFQUFDLGdCQUFBLE9BQUQsRUFBVSxrQkFBQSxTQUZWLENBQUE7QUFBQSxVQUlBLEtBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxZQUFDLFlBQUEsVUFBRDtBQUFBLFlBQWEsU0FBQSxPQUFiO0FBQUEsWUFBc0IsV0FBQSxTQUF0QjtXQUFmLENBSkEsQ0FBQTtpQkFNQSxVQUFVLENBQUMsVUFBWCxDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxPQUFELEdBQUE7bUJBQ0osT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxJQUFELEdBQUE7QUFDZCxrQkFBQSxJQUFBO0FBQUEsY0FEZ0IsT0FBRCxLQUFDLElBQ2hCLENBQUE7cUJBQUEsS0FBQyxDQUFBLGFBQUQsQ0FBZTtBQUFBLGdCQUFDLFVBQUEsRUFBWSxJQUFiO0FBQUEsZ0JBQW1CLFNBQUEsT0FBbkI7QUFBQSxnQkFBNEIsV0FBQSxTQUE1QjtlQUFmLEVBRGM7WUFBQSxDQUFoQixFQURJO1VBQUEsQ0FETixFQVBXO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQUhBLENBQUE7YUFlSSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNiLEtBQUMsQ0FBQSwwQkFBRCxDQUE0QixNQUE1QixFQURhO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQWhCb0I7SUFBQSxDQW5KMUIsQ0FBQTs7QUFzS0E7QUFBQTs7O09BdEtBOztBQUFBLGdDQTBLQSwwQkFBQSxHQUE0QixTQUFDLE1BQUQsR0FBQTtBQUMxQixVQUFBLEtBQUE7aUVBQXNCLENBQUUsT0FBeEIsQ0FBQSxXQUQwQjtJQUFBLENBMUs1QixDQUFBOztBQTZLQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BN0tBOztBQUFBLGdDQWlNQSx1QkFBQSxHQUF5QixTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEdBQUE7QUFDdkIsTUFBQSxJQUFBLENBQUEsSUFBa0QsQ0FBQSxRQUFELENBQUEsQ0FBakQ7QUFBQSxlQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsa0JBQWYsQ0FBUCxDQUFBO09BQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7aUJBQ2hDLEtBQUMsQ0FBQSxNQUFELENBQVEsT0FBUixFQUFpQixNQUFqQixFQUF5QixDQUFDLE9BQUQsRUFBVSxTQUFWLENBQXpCLEVBRGdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFIdUI7SUFBQSxDQWpNekIsQ0FBQTs7QUF3TUE7QUFBQTs7Ozs7Ozs7O09BeE1BOztBQUFBLGdDQWtOQSxxQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEdBQUE7QUFDckIsTUFBQSxJQUFBLENBQUEsSUFBa0QsQ0FBQSxRQUFELENBQUEsQ0FBakQ7QUFBQSxlQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsa0JBQWYsQ0FBUCxDQUFBO09BQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsRUFBNkIsQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUE3QixDQUErQyxDQUFDLElBQWhELENBQXFELFNBQUMsT0FBRCxHQUFBO2VBQ25ELEVBQUUsQ0FBQyxNQUFILENBQVUsT0FBVixFQUFtQixNQUFuQixFQUEyQjtBQUFBLFVBQUEsR0FBQSxFQUFLLE9BQUw7U0FBM0IsRUFEbUQ7TUFBQSxDQUFyRCxFQUhxQjtJQUFBLENBbE52QixDQUFBOztBQXdOQTtBQUFBOzs7Ozs7Ozs7T0F4TkE7O0FBQUEsZ0NBa09BLHNCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsR0FBQTtBQUN0QixNQUFBLElBQUEsQ0FBQSxJQUFrRCxDQUFBLFFBQUQsQ0FBQSxDQUFqRDtBQUFBLGVBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBZSxrQkFBZixDQUFQLENBQUE7T0FBQTthQUVBLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQixFQUE2QixDQUFDLE9BQUQsQ0FBN0IsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxTQUFDLE9BQUQsR0FBQTtlQUMzQyxFQUFFLENBQUMsTUFBSCxDQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkI7QUFBQSxVQUFBLEdBQUEsRUFBSyxPQUFMO1NBQTNCLEVBRDJDO01BQUEsQ0FBN0MsRUFIc0I7SUFBQSxDQWxPeEIsQ0FBQTs7QUF3T0E7QUFBQTs7Ozs7Ozs7T0F4T0E7O0FBQUEsZ0NBaVBBLHVCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsR0FBQTtBQUN2QixVQUFBLHdCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBa0QsQ0FBQSxRQUFELENBQUEsQ0FBakQ7QUFBQSxlQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsa0JBQWYsQ0FBUCxDQUFBO09BQUE7QUFBQSxNQUNBLE9BQUEsb0pBQTBDLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLENBRDFDLENBQUE7QUFBQSxNQUVBLENBQUEsR0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsT0FBaEIsQ0FGSixDQUFBO0FBR0EsTUFBQSxJQUFHLFNBQUg7ZUFDRSxPQUFPLENBQUMsT0FBUixDQUFpQixFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxNQUFiLENBQWpCLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE9BQUQsR0FBQTtBQUM1QixZQUFBLEtBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixPQUF6QixDQUFBLENBQUE7QUFBQSxZQUVBLFVBQUEsQ0FBVyxDQUFDLFNBQUEsR0FBQTtxQkFBRyxLQUFDLENBQUEsVUFBVSxDQUFDLFFBQUQsQ0FBWCxDQUFtQixPQUFuQixFQUFIO1lBQUEsQ0FBRCxDQUFYLEVBQTRDLEVBQUEsR0FBSyxJQUFqRCxDQUZBLENBQUE7bUJBR0EsRUFBRSxDQUFDLE1BQUgsQ0FBVSxPQUFWLEVBQW1CLE1BQW5CLEVBSjRCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFIRjtPQUp1QjtJQUFBLENBalB6QixDQUFBOztBQThQQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7T0E5UEE7O0FBQUEsZ0NBOFFBLCtCQUFBLEdBQWlDLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsRUFBMkIsSUFBM0IsR0FBQTtBQUMvQixVQUFBLGlDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBa0QsQ0FBQSxRQUFELENBQUEsQ0FBakQ7QUFBQSxlQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsa0JBQWYsQ0FBUCxDQUFBO09BQUE7QUFBQSxNQUNBLFVBQUEsa0JBQWEsSUFBSSxDQUFFLGVBRG5CLENBQUE7QUFFQSxNQUFBLElBQU8sa0JBQVA7QUFDRSxRQUFBLFNBQUEsR0FBZ0IsSUFBQSxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksUUFBUSxDQUFDLEdBQWIsQ0FBTixFQUF5QixRQUF6QixDQUFoQixDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsb0JBQTVCLEVBQ0UsU0FERixFQUNhLFNBQUMsSUFBRCxHQUFBO0FBQ1QsY0FBQSxLQUFBO0FBQUEsVUFEVyxRQUFELEtBQUMsS0FDWCxDQUFBO2lCQUFBLFVBQUEsR0FBYSxLQUFNLENBQUEsQ0FBQSxFQURWO1FBQUEsQ0FEYixDQURBLENBREY7T0FGQTtBQUFBLE1BUUMsYUFBYyxJQUFDLENBQUEsYUFBRCxDQUFlO0FBQUEsUUFBQyxRQUFBLE1BQUQ7T0FBZixFQUFkLFVBUkQsQ0FBQTthQVNBLElBQUMsQ0FBQSxhQUFELENBQ0U7QUFBQSxRQUFBLFVBQUEsRUFBWSxVQUFaO0FBQUEsUUFDQSxVQUFBLEVBQVksVUFEWjtPQURGLENBR0EsQ0FBQyxJQUhELENBR00sU0FBQyxJQUFELEdBQUE7QUFDSixZQUFBLG1CQUFBO0FBQUEsUUFETSxhQUFELEtBQUMsVUFDTixDQUFBO0FBQUEsUUFBQSxPQUFBLEdBQVUsVUFBVSxDQUFDLE1BQVgsQ0FDUjtBQUFBLFVBQUEsU0FBQSxFQUFXLEtBQVg7QUFBQSxVQUNBLGFBQUEsRUFBZSxJQURmO0FBQUEsVUFFQSxNQUFBLEVBQVEsS0FGUjtBQUFBLFVBR0EsSUFBQSxFQUFNLFVBSE47U0FEUSxDQUFWLENBQUE7ZUFLQSxFQUFFLENBQUMsTUFBSCxDQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkI7QUFBQSxVQUFBLEdBQUEsRUFBSyxNQUFMO1NBQTNCLEVBTkk7TUFBQSxDQUhOLEVBVitCO0lBQUEsQ0E5UWpDLENBQUE7O0FBbVNBO0FBQUE7Ozs7Ozs7O09BblNBOztBQUFBLGdDQTRTQSxnQ0FBQSxHQUFrQyxTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEdBQUE7QUFDaEMsVUFBQSw2QkFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQWtELENBQUEsUUFBRCxDQUFBLENBQWpEO0FBQUEsZUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLGtCQUFmLENBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxHQUFBLG9KQUFzQyxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixDQUZ0QyxDQUFBO0FBQUEsTUFJQSxDQUFBLEdBQ0ssSUFBQyxDQUFBLGVBQWUsQ0FBQyxHQUFqQixDQUFxQixHQUFyQixDQUFILEdBQ0UsSUFBQyxDQUFBLGVBQWUsQ0FBQyxHQUFqQixDQUFxQixHQUFyQixDQURGLEdBR0UsQ0FBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLEdBQWpCLENBQVYsRUFDQSxJQUFDLENBQUEsZUFBZSxDQUFDLEdBQWpCLENBQXFCLEdBQXJCLEVBQTBCLE9BQTFCLENBREEsRUFFQSxPQUZBLENBUkosQ0FBQTthQVdBLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBQyxPQUFELEdBQUE7ZUFDTCxFQUFFLENBQUMsTUFBSCxDQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFESztNQUFBLENBQVAsRUFaZ0M7SUFBQSxDQTVTbEMsQ0FBQTs7QUEyVEE7QUFBQTs7Ozs7Ozs7T0EzVEE7O0FBQUEsZ0NBb1VBLGdDQUFBLEdBQWtDLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsR0FBQTtBQUNoQyxVQUFBLDZCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBa0QsQ0FBQSxRQUFELENBQUEsQ0FBakQ7QUFBQSxlQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsa0JBQWYsQ0FBUCxDQUFBO09BQUE7QUFBQSxNQUVBLEdBQUEsb0pBQXNDLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQWhCLENBRnRDLENBQUE7QUFBQSxNQUlBLENBQUEsR0FDSyxJQUFDLENBQUEsZUFBZSxDQUFDLEdBQWpCLENBQXFCLEdBQXJCLENBQUgsR0FDRSxJQUFDLENBQUEsZUFBZSxDQUFDLEdBQWpCLENBQXFCLEdBQXJCLENBREYsR0FHRSxDQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsQ0FBVixFQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsR0FBakIsQ0FBcUIsR0FBckIsRUFBMEIsT0FBMUIsQ0FEQSxFQUVBLE9BRkEsQ0FSSixDQUFBO2FBV0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFDLE9BQUQsR0FBQTtlQUNMLEVBQUUsQ0FBQyxNQUFILENBQVUsT0FBVixFQUFtQixNQUFuQixFQURLO01BQUEsQ0FBUCxFQVpnQztJQUFBLENBcFVsQyxDQUFBOztBQW1WQTtBQUFBOzs7Ozs7Ozs7OztPQW5WQTs7QUFBQSxnQ0ErVkEscUJBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixRQUFqQixHQUFBO0FBQ3JCLE1BQUEsSUFBQSxDQUFBLElBQWtELENBQUEsUUFBRCxDQUFBLENBQWpEO0FBQUEsZUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLGtCQUFmLENBQVAsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUF1RCxnQkFBdkQ7QUFBQSxRQUFBLFFBQUEsR0FBVyxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsUUFBekIsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsQ0FBWCxDQUFBO09BREE7QUFFQSxNQUFBLElBQTJCLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCLENBQTNCO0FBQUEsUUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxDQUFiLENBQVQsQ0FBQTtPQUZBO2FBR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLE1BQXpCLEVBQWlDLFFBQWpDLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzlDLGNBQUEsSUFBQTtBQUFBLFVBRGdELE9BQUQsS0FBQyxJQUNoRCxDQUFBO2lCQUFBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQixDQUE0QixDQUFDLElBQTdCLENBQWtDLFNBQUMsT0FBRCxHQUFBO0FBQ2hDLGdCQUFBLEVBQUE7QUFBQSxZQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsTUFBUixDQUFlLFNBQUMsQ0FBRCxHQUFBO0FBQ2xCLGtCQUFBLE1BQUE7QUFBQSxjQUFBLElBQW9CLHVCQUFwQjtBQUFBLHVCQUFPLEtBQVAsQ0FBQTtlQUFBO0FBQUEsY0FDQSxFQUFBLEdBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFoQixDQUFzQixNQUF0QixDQUE2QixDQUFDLEtBQTlCLENBQW9DLENBQUEsQ0FBcEMsQ0FBd0MsQ0FBQSxDQUFBLENBRDdDLENBQUE7QUFFQSxjQUFBLElBQWdCLEVBQUUsQ0FBQyxLQUFILENBQVMsU0FBVCxDQUFoQjtBQUFBLHVCQUFPLEtBQVAsQ0FBQTtlQUZBO0FBQUEsY0FHQSxFQUFBLEdBQUssRUFBRSxDQUFDLE9BQUgsQ0FBVyxzQkFBWCxFQUFtQyxNQUFuQyxDQUhMLENBQUE7QUFBQSxjQUlBLEVBQUEsR0FBSyxNQUFBLENBQU8sRUFBRSxDQUFDLE9BQUgsQ0FBVyxZQUFYLEVBQXlCLElBQXpCLENBQVAsRUFBdUMsRUFBdkMsQ0FKTCxDQUFBO3FCQUtBLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixFQU5rQjtZQUFBLENBQWYsQ0FBTCxDQUFBO0FBT0EsWUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQXBCO3FCQUNFLEVBQUUsQ0FBQyxJQUFILENBQVEsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO3VCQUNOLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBQyxDQUFDLGFBQVgsRUFBMEIsSUFBMUIsQ0FBQSxHQUFrQyxFQUFFLENBQUMsS0FBSCxDQUFTLENBQUMsQ0FBQyxhQUFYLEVBQTBCLElBQTFCLEVBRDVCO2NBQUEsQ0FBUixFQURGO2FBQUEsTUFBQTtxQkFJRSxFQUFFLENBQUMsTUFBSCxDQUFVLEVBQVYsRUFBYyxNQUFkLEVBQXNCO0FBQUEsZ0JBQUEsR0FBQSxFQUFLLE9BQUw7ZUFBdEIsRUFKRjthQVJnQztVQUFBLENBQWxDLEVBRDhDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsRUFKcUI7SUFBQSxDQS9WdkIsQ0FBQTs7NkJBQUE7O01BVEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/completion-backend/completion-backend.coffee
