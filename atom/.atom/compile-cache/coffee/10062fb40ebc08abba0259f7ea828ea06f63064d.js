(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, scopeFromFileName, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = [], ColorBuffer = _ref[0], ColorSearch = _ref[1], Palette = _ref[2], ColorMarkerElement = _ref[3], VariablesCollection = _ref[4], PathsLoader = _ref[5], PathsScanner = _ref[6], Emitter = _ref[7], CompositeDisposable = _ref[8], Range = _ref[9], SERIALIZE_VERSION = _ref[10], SERIALIZE_MARKERS_VERSION = _ref[11], THEME_VARIABLES = _ref[12], ATOM_VARIABLES = _ref[13], scopeFromFileName = _ref[14], minimatch = _ref[15];

  compareArray = function(a, b) {
    var i, v, _i, _len;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      markersVersion = SERIALIZE_MARKERS_VERSION;
      if (atom.inDevMode() && atom.project.getPaths().some(function(p) {
        return p.match(/\/pigments$/);
      })) {
        markersVersion += '-dev';
      }
      if ((state != null ? state.version : void 0) !== SERIALIZE_VERSION) {
        state = {};
      }
      if ((state != null ? state.markersVersion : void 0) !== markersVersion) {
        delete state.variables;
        delete state.buffers;
      }
      if (!compareArray(state.globalSourceNames, atom.config.get('pigments.sourceNames')) || !compareArray(state.globalIgnoredNames, atom.config.get('pigments.ignoredNames'))) {
        delete state.variables;
        delete state.buffers;
        delete state.paths;
      }
      return new ColorProject(state);
    };

    function ColorProject(state) {
      var buffers, svgColorExpression, timestamp, variables, _ref1;
      if (state == null) {
        state = {};
      }
      if (Emitter == null) {
        _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
      }
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      this.includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.colorBuffersByEditorId = {};
      this.bufferStates = buffers != null ? buffers : {};
      this.variableExpressionsRegistry = require('./variable-expressions');
      this.colorExpressionsRegistry = require('./color-expressions');
      if (variables != null) {
        this.variables = atom.deserializers.deserialize(variables);
      } else {
        this.variables = new VariablesCollection;
      }
      this.subscriptions.add(this.variables.onDidChange((function(_this) {
        return function(results) {
          return _this.emitVariablesChangeEvent(results);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sourceNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredBufferNames', (function(_this) {
        return function(ignoredBufferNames) {
          _this.ignoredBufferNames = ignoredBufferNames;
          return _this.updateColorBuffers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredScopes', (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.supportedFiletypes', (function(_this) {
        return function() {
          _this.updateIgnoredFiletypes();
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', function(type) {
        if (type != null) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sassShadeAndTintImplementation', (function(_this) {
        return function() {
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      this.subscriptions.add(atom.config.observe('pigments.filetypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = scopes != null ? scopes : [];
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(_arg) {
          var name;
          name = _arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          return _this.variables.evaluateVariables(_this.variables.getVariables(), function() {
            var colorBuffer, id, _ref2, _results;
            _ref2 = _this.colorBuffersByEditorId;
            _results = [];
            for (id in _ref2) {
              colorBuffer = _ref2[id];
              _results.push(colorBuffer.update());
            }
            return _results;
          });
        };
      })(this)));
      this.subscriptions.add(this.variableExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function() {
          if (_this.paths == null) {
            return;
          }
          return _this.reloadVariablesForPaths(_this.getPaths());
        };
      })(this)));
      if (timestamp != null) {
        this.timestamp = new Date(Date.parse(timestamp));
      }
      this.updateIgnoredFiletypes();
      if (this.paths != null) {
        this.initialize();
      }
      this.initializeBuffers();
    }

    ColorProject.prototype.onDidInitialize = function(callback) {
      return this.emitter.on('did-initialize', callback);
    };

    ColorProject.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorProject.prototype.onDidUpdateVariables = function(callback) {
      return this.emitter.on('did-update-variables', callback);
    };

    ColorProject.prototype.onDidCreateColorBuffer = function(callback) {
      return this.emitter.on('did-create-color-buffer', callback);
    };

    ColorProject.prototype.onDidChangeIgnoredScopes = function(callback) {
      return this.emitter.on('did-change-ignored-scopes', callback);
    };

    ColorProject.prototype.onDidChangePaths = function(callback) {
      return this.emitter.on('did-change-paths', callback);
    };

    ColorProject.prototype.observeColorBuffers = function(callback) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        callback(colorBuffer);
      }
      return this.onDidCreateColorBuffer(callback);
    };

    ColorProject.prototype.isInitialized = function() {
      return this.initialized;
    };

    ColorProject.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorProject.prototype.initialize = function() {
      if (this.isInitialized()) {
        return Promise.resolve(this.variables.getVariables());
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      return this.initializePromise = new Promise((function(_this) {
        return function(resolve) {
          return _this.variables.onceInitialized(resolve);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (_this.includeThemes) {
            return _this.includeThemesVariables();
          }
        };
      })(this)).then((function(_this) {
        return function() {
          var variables;
          _this.initialized = true;
          variables = _this.variables.getVariables();
          _this.emitter.emit('did-initialize', variables);
          return variables;
        };
      })(this));
    };

    ColorProject.prototype.destroy = function() {
      var buffer, id, _ref1;
      if (this.destroyed) {
        return;
      }
      if (PathsScanner == null) {
        PathsScanner = require('./paths-scanner');
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        buffer.destroy();
      }
      this.colorBuffersByEditorId = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ColorProject.prototype.reload = function() {
      return this.initialize().then((function(_this) {
        return function() {
          _this.variables.reset();
          _this.paths = [];
          return _this.loadPathsAndVariables();
        };
      })(this)).then((function(_this) {
        return function() {
          if (atom.config.get('pigments.notifyReloads')) {
            return atom.notifications.addSuccess("Pigments successfully reloaded", {
              dismissable: atom.config.get('pigments.dismissableReloadNotifications'),
              description: "Found:\n- **" + _this.paths.length + "** path(s)\n- **" + (_this.getVariables().length) + "** variables(s) including **" + (_this.getColorVariables().length) + "** color(s)"
            });
          } else {
            return console.log("Found:\n- " + _this.paths.length + " path(s)\n- " + (_this.getVariables().length) + " variables(s) including " + (_this.getColorVariables().length) + " color(s)");
          }
        };
      })(this))["catch"](function(reason) {
        var detail, stack;
        detail = reason.message;
        stack = reason.stack;
        atom.notifications.addError("Pigments couldn't be reloaded", {
          detail: detail,
          stack: stack,
          dismissable: true
        });
        return console.error(reason);
      });
    };

    ColorProject.prototype.loadPathsAndVariables = function() {
      var destroyed;
      destroyed = null;
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, path, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return __indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
              path = dirtied[_i];
              if (__indexOf.call(_this.paths, path) < 0) {
                _this.paths.push(path);
              }
            }
            if (_this.variables.length) {
              return dirtied;
            } else {
              return _this.paths;
            }
          } else if (_this.paths == null) {
            return _this.paths = dirtied;
          } else if (!_this.variables.length) {
            return _this.paths;
          } else {
            return [];
          }
        };
      })(this)).then((function(_this) {
        return function(paths) {
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          if (results != null) {
            return _this.variables.updateCollection(results);
          }
        };
      })(this));
    };

    ColorProject.prototype.findAllColors = function() {
      var patterns;
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
        project: this,
        ignoredNames: this.getIgnoredNames(),
        context: this.getContext()
      });
    };

    ColorProject.prototype.setColorPickerAPI = function(colorPickerAPI) {
      this.colorPickerAPI = colorPickerAPI;
    };

    ColorProject.prototype.initializeBuffers = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var buffer, bufferElement, editorPath;
          editorPath = editor.getPath();
          if ((editorPath == null) || _this.isBufferIgnored(editorPath)) {
            return;
          }
          buffer = _this.colorBufferForEditor(editor);
          if (buffer != null) {
            bufferElement = atom.views.getView(buffer);
            return bufferElement.attach();
          }
        };
      })(this)));
    };

    ColorProject.prototype.hasColorBufferForEditor = function(editor) {
      if (this.destroyed || (editor == null)) {
        return false;
      }
      return this.colorBuffersByEditorId[editor.id] != null;
    };

    ColorProject.prototype.colorBufferForEditor = function(editor) {
      var buffer, state, subscription;
      if (this.destroyed) {
        return;
      }
      if (editor == null) {
        return;
      }
      if (ColorBuffer == null) {
        ColorBuffer = require('./color-buffer');
      }
      if (this.colorBuffersByEditorId[editor.id] != null) {
        return this.colorBuffersByEditorId[editor.id];
      }
      if (this.bufferStates[editor.id] != null) {
        state = this.bufferStates[editor.id];
        state.editor = editor;
        state.project = this;
        delete this.bufferStates[editor.id];
      } else {
        state = {
          editor: editor,
          project: this
        };
      }
      this.colorBuffersByEditorId[editor.id] = buffer = new ColorBuffer(state);
      this.subscriptions.add(subscription = buffer.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.remove(subscription);
          subscription.dispose();
          return delete _this.colorBuffersByEditorId[editor.id];
        };
      })(this)));
      this.emitter.emit('did-create-color-buffer', buffer);
      return buffer;
    };

    ColorProject.prototype.colorBufferForPath = function(path) {
      var colorBuffer, id, _ref1;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, _i, _len, _ref1, _ref2, _results;
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        buffer = _ref1[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          _ref2 = atom.workspace.getTextEditors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            editor = _ref2[_i];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              _results.push(bufferElement.attach());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } catch (_error) {
        e = _error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var source, sources, _i, _len, _ref1;
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = (_ref1 = this.ignoredBufferNames) != null ? _ref1 : [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
      return false;
    };

    ColorProject.prototype.getPaths = function() {
      var _ref1;
      return (_ref1 = this.paths) != null ? _ref1.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var _ref1;
      return __indexOf.call((_ref1 = this.paths) != null ? _ref1 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      if (PathsLoader == null) {
        PathsLoader = require('./paths-loader');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, rootPaths, _ref1;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (_ref1 = _this.paths) != null ? _ref1 : [];
          config = {
            knownPaths: knownPaths,
            timestamp: _this.timestamp,
            ignoredNames: _this.getIgnoredNames(),
            paths: rootPaths,
            traverseIntoSymlinkDirectories: atom.config.get('pigments.traverseIntoSymlinkDirectories'),
            sourceNames: _this.getSourceNames(),
            ignoreVcsIgnores: atom.config.get('pigments.ignoreVcsIgnoredPaths')
          };
          return PathsLoader.startTask(config, function(results) {
            var isDescendentOfRootPaths, p, _i, _len;
            for (_i = 0, _len = knownPaths.length; _i < _len; _i++) {
              p = knownPaths[_i];
              isDescendentOfRootPaths = rootPaths.some(function(root) {
                return p.indexOf(root) === 0;
              });
              if (!isDescendentOfRootPaths) {
                if (results.removed == null) {
                  results.removed = [];
                }
                results.removed.push(p);
              }
            }
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.updatePaths = function() {
      if (!this.initialized) {
        return Promise.resolve();
      }
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, p, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return __indexOf.call(removed, p) < 0;
          });
          for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
            p = dirtied[_i];
            if (__indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var source, sources, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, _i, _len;
      if (!path) {
        return false;
      }
      if (minimatch == null) {
        minimatch = require('minimatch');
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (minimatch(path, ignore, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.scopeFromFileName = function(path) {
      var scope;
      if (scopeFromFileName == null) {
        scopeFromFileName = require('./scope-from-file-name');
      }
      scope = scopeFromFileName(path);
      if (scope === 'sass' || scope === 'scss') {
        scope = [scope, this.getSassScopeSuffix()].join(':');
      }
      return scope;
    };

    ColorProject.prototype.getPalette = function() {
      if (Palette == null) {
        Palette = require('./palette');
      }
      if (!this.isInitialized()) {
        return new Palette;
      }
      return new Palette(this.getColorVariables());
    };

    ColorProject.prototype.getContext = function() {
      return this.variables.getContext();
    };

    ColorProject.prototype.getVariables = function() {
      return this.variables.getVariables();
    };

    ColorProject.prototype.getVariableExpressionsRegistry = function() {
      return this.variableExpressionsRegistry;
    };

    ColorProject.prototype.getVariableById = function(id) {
      return this.variables.getVariableById(id);
    };

    ColorProject.prototype.getVariableByName = function(name) {
      return this.variables.getVariableByName(name);
    };

    ColorProject.prototype.getColorVariables = function() {
      return this.variables.getColorVariables();
    };

    ColorProject.prototype.getColorExpressionsRegistry = function() {
      return this.colorExpressionsRegistry;
    };

    ColorProject.prototype.showVariableInFile = function(variable) {
      return atom.workspace.open(variable.path).then(function(editor) {
        var buffer, bufferRange, _ref1;
        if (Range == null) {
          _ref1 = require('atom'), Emitter = _ref1.Emitter, CompositeDisposable = _ref1.CompositeDisposable, Range = _ref1.Range;
        }
        buffer = editor.getBuffer();
        bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
        return editor.setSelectedBufferRange(bufferRange, {
          autoscroll: true
        });
      });
    };

    ColorProject.prototype.emitVariablesChangeEvent = function(results) {
      return this.emitter.emit('did-update-variables', results);
    };

    ColorProject.prototype.loadVariablesForPath = function(path) {
      return this.loadVariablesForPaths([path]);
    };

    ColorProject.prototype.loadVariablesForPaths = function(paths) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.scanPathsForVariables(paths, function(results) {
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.getVariablesForPath = function(path) {
      return this.variables.getVariablesForPath(path);
    };

    ColorProject.prototype.getVariablesForPaths = function(paths) {
      return this.variables.getVariablesForPaths(paths);
    };

    ColorProject.prototype.deleteVariablesForPath = function(path) {
      return this.deleteVariablesForPaths([path]);
    };

    ColorProject.prototype.deleteVariablesForPaths = function(paths) {
      return this.variables.deleteVariablesForPaths(paths);
    };

    ColorProject.prototype.reloadVariablesForPath = function(path) {
      return this.reloadVariablesForPaths([path]);
    };

    ColorProject.prototype.reloadVariablesForPaths = function(paths) {
      var promise;
      promise = Promise.resolve();
      if (!this.isInitialized()) {
        promise = this.initialize();
      }
      return promise.then((function(_this) {
        return function() {
          if (paths.some(function(path) {
            return __indexOf.call(_this.paths, path) < 0;
          })) {
            return Promise.resolve([]);
          }
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.variables.updateCollection(results, paths);
        };
      })(this));
    };

    ColorProject.prototype.scanPathsForVariables = function(paths, callback) {
      var colorBuffer;
      if (paths.length === 1 && (colorBuffer = this.colorBufferForPath(paths[0]))) {
        return colorBuffer.scanBufferForVariables().then(function(results) {
          return callback(results);
        });
      } else {
        if (PathsScanner == null) {
          PathsScanner = require('./paths-scanner');
        }
        return PathsScanner.startTask(paths.map((function(_this) {
          return function(p) {
            return [p, _this.scopeFromFileName(p)];
          };
        })(this)), this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      if (ATOM_VARIABLES == null) {
        ATOM_VARIABLES = require('./atom-variables');
      }
      iterator = 0;
      variables = [];
      html = '';
      ATOM_VARIABLES.forEach(function(v) {
        return html += "<div class='" + v + "'>" + v + "</div>";
      });
      div = document.createElement('div');
      div.className = 'pigments-sampler';
      div.innerHTML = html;
      document.body.appendChild(div);
      ATOM_VARIABLES.forEach(function(v, i) {
        var color, end, node, variable;
        node = div.children[i];
        color = getComputedStyle(node).color;
        end = iterator + v.length + color.length + 4;
        variable = {
          name: "@" + v,
          line: i,
          value: color,
          range: [iterator, end],
          path: THEME_VARIABLES
        };
        iterator = end;
        return variables.push(variable);
      });
      document.body.removeChild(div);
      return variables;
    };

    ColorProject.prototype.getRootPaths = function() {
      return atom.project.getPaths();
    };

    ColorProject.prototype.getSassScopeSuffix = function() {
      var _ref1, _ref2;
      return (_ref1 = (_ref2 = this.sassShadeAndTintImplementation) != null ? _ref2 : atom.config.get('pigments.sassShadeAndTintImplementation')) != null ? _ref1 : 'compass';
    };

    ColorProject.prototype.setSassShadeAndTintImplementation = function(sassShadeAndTintImplementation) {
      this.sassShadeAndTintImplementation = sassShadeAndTintImplementation;
      return this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
        registry: this.colorExpressionsRegistry
      });
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, _ref1, _ref2;
      names = ['.pigments'];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((_ref2 = atom.config.get('pigments.sourceNames')) != null ? _ref2 : []);
      }
      return names;
    };

    ColorProject.prototype.setSourceNames = function(sourceNames) {
      this.sourceNames = sourceNames != null ? sourceNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return;
      }
      return this.initialize().then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalSourceNames = function(ignoreGlobalSourceNames) {
      this.ignoreGlobalSourceNames = ignoreGlobalSourceNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getSearchNames = function() {
      var names, _ref1, _ref2, _ref3, _ref4;
      names = [];
      names = names.concat((_ref1 = this.sourceNames) != null ? _ref1 : []);
      names = names.concat((_ref2 = this.searchNames) != null ? _ref2 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((_ref3 = atom.config.get('pigments.sourceNames')) != null ? _ref3 : []);
        names = names.concat((_ref4 = atom.config.get('pigments.extendedSearchNames')) != null ? _ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.setSearchNames = function(searchNames) {
      this.searchNames = searchNames != null ? searchNames : [];
    };

    ColorProject.prototype.setIgnoreGlobalSearchNames = function(ignoreGlobalSearchNames) {
      this.ignoreGlobalSearchNames = ignoreGlobalSearchNames;
    };

    ColorProject.prototype.getIgnoredNames = function() {
      var names, _ref1, _ref2, _ref3;
      names = (_ref1 = this.ignoredNames) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((_ref2 = this.getGlobalIgnoredNames()) != null ? _ref2 : []);
        names = names.concat((_ref3 = atom.config.get('core.ignoredNames')) != null ? _ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var _ref1;
      return (_ref1 = atom.config.get('pigments.ignoredNames')) != null ? _ref1.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames) {
      this.ignoredNames = ignoredNames != null ? ignoredNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return Promise.reject('Project is not initialized yet');
      }
      return this.initialize().then((function(_this) {
        return function() {
          var dirtied;
          dirtied = _this.paths.filter(function(p) {
            return _this.isIgnoredPath(p);
          });
          _this.deleteVariablesForPaths(dirtied);
          _this.paths = _this.paths.filter(function(p) {
            return !_this.isIgnoredPath(p);
          });
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredNames = function(ignoreGlobalIgnoredNames) {
      this.ignoreGlobalIgnoredNames = ignoreGlobalIgnoredNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getIgnoredScopes = function() {
      var scopes, _ref1, _ref2;
      scopes = (_ref1 = this.ignoredScopes) != null ? _ref1 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((_ref2 = atom.config.get('pigments.ignoredScopes')) != null ? _ref2 : []);
      }
      scopes = scopes.concat(this.ignoredFiletypes);
      return scopes;
    };

    ColorProject.prototype.setIgnoredScopes = function(ignoredScopes) {
      this.ignoredScopes = ignoredScopes != null ? ignoredScopes : [];
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredScopes = function(ignoreGlobalIgnoredScopes) {
      this.ignoreGlobalIgnoredScopes = ignoreGlobalIgnoredScopes;
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setSupportedFiletypes = function(supportedFiletypes) {
      this.supportedFiletypes = supportedFiletypes != null ? supportedFiletypes : [];
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.updateIgnoredFiletypes = function() {
      return this.ignoredFiletypes = this.getIgnoredFiletypes();
    };

    ColorProject.prototype.getIgnoredFiletypes = function() {
      var filetypes, scopes, _ref1, _ref2;
      filetypes = (_ref1 = this.supportedFiletypes) != null ? _ref1 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((_ref2 = atom.config.get('pigments.supportedFiletypes')) != null ? _ref2 : []);
      }
      if (filetypes.length === 0) {
        filetypes = ['*'];
      }
      if (filetypes.some(function(type) {
        return type === '*';
      })) {
        return [];
      }
      scopes = filetypes.map(function(ext) {
        var _ref3;
        return (_ref3 = atom.grammars.selectGrammar("file." + ext)) != null ? _ref3.scopeName.replace(/\./g, '\\.') : void 0;
      }).filter(function(scope) {
        return scope != null;
      });
      return ["^(?!\\.(" + (scopes.join('|')) + "))"];
    };

    ColorProject.prototype.setIgnoreGlobalSupportedFiletypes = function(ignoreGlobalSupportedFiletypes) {
      this.ignoreGlobalSupportedFiletypes = ignoreGlobalSupportedFiletypes;
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.themesIncluded = function() {
      return this.includeThemes;
    };

    ColorProject.prototype.setIncludeThemes = function(includeThemes) {
      if (includeThemes === this.includeThemes) {
        return Promise.resolve();
      }
      this.includeThemes = includeThemes;
      if (this.includeThemes) {
        return this.includeThemesVariables();
      } else {
        return this.disposeThemesVariables();
      }
    };

    ColorProject.prototype.includeThemesVariables = function() {
      this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
        return function() {
          var variables;
          if (!_this.includeThemes) {
            return;
          }
          if (THEME_VARIABLES == null) {
            THEME_VARIABLES = require('./uris').THEME_VARIABLES;
          }
          variables = _this.loadThemesVariables();
          return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
        };
      })(this));
      this.subscriptions.add(this.themesSubscription);
      return this.variables.addMany(this.loadThemesVariables());
    };

    ColorProject.prototype.disposeThemesVariables = function() {
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      this.subscriptions.remove(this.themesSubscription);
      this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
      return this.themesSubscription.dispose();
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data, _ref1;
      if (SERIALIZE_VERSION == null) {
        _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;
      }
      data = {
        deserializer: 'ColorProject',
        timestamp: this.getTimestamp(),
        version: SERIALIZE_VERSION,
        markersVersion: SERIALIZE_MARKERS_VERSION,
        globalSourceNames: atom.config.get('pigments.sourceNames'),
        globalIgnoredNames: atom.config.get('pigments.ignoredNames')
      };
      if (this.ignoreGlobalSourceNames != null) {
        data.ignoreGlobalSourceNames = this.ignoreGlobalSourceNames;
      }
      if (this.ignoreGlobalSearchNames != null) {
        data.ignoreGlobalSearchNames = this.ignoreGlobalSearchNames;
      }
      if (this.ignoreGlobalIgnoredNames != null) {
        data.ignoreGlobalIgnoredNames = this.ignoreGlobalIgnoredNames;
      }
      if (this.ignoreGlobalIgnoredScopes != null) {
        data.ignoreGlobalIgnoredScopes = this.ignoreGlobalIgnoredScopes;
      }
      if (this.includeThemes != null) {
        data.includeThemes = this.includeThemes;
      }
      if (this.ignoredScopes != null) {
        data.ignoredScopes = this.ignoredScopes;
      }
      if (this.ignoredNames != null) {
        data.ignoredNames = this.ignoredNames;
      }
      if (this.sourceNames != null) {
        data.sourceNames = this.sourceNames;
      }
      if (this.searchNames != null) {
        data.searchNames = this.searchNames;
      }
      data.buffers = this.serializeBuffers();
      if (this.isInitialized()) {
        data.paths = this.paths;
        data.variables = this.variables.serialize();
      }
      return data;
    };

    ColorProject.prototype.serializeBuffers = function() {
      var colorBuffer, id, out, _ref1;
      out = {};
      _ref1 = this.colorBuffersByEditorId;
      for (id in _ref1) {
        colorBuffer = _ref1[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wcm9qZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5UkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FRSSxFQVJKLEVBQ0UscUJBREYsRUFDZSxxQkFEZixFQUVFLGlCQUZGLEVBRVcsNEJBRlgsRUFFK0IsNkJBRi9CLEVBR0UscUJBSEYsRUFHZSxzQkFIZixFQUlFLGlCQUpGLEVBSVcsNkJBSlgsRUFJZ0MsZUFKaEMsRUFLRSw0QkFMRixFQUtxQixvQ0FMckIsRUFLZ0QsMEJBTGhELEVBS2lFLHlCQUxqRSxFQU1FLDRCQU5GLEVBT0Usb0JBUEYsQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDYixRQUFBLGNBQUE7QUFBQSxJQUFBLElBQW9CLFdBQUosSUFBYyxXQUE5QjtBQUFBLGFBQU8sS0FBUCxDQUFBO0tBQUE7QUFDQSxJQUFBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBQyxDQUFDLE1BQWxDO0FBQUEsYUFBTyxLQUFQLENBQUE7S0FEQTtBQUVBLFNBQUEsZ0RBQUE7ZUFBQTtVQUErQixDQUFBLEtBQU8sQ0FBRSxDQUFBLENBQUE7QUFBeEMsZUFBTyxLQUFQO09BQUE7QUFBQSxLQUZBO0FBR0EsV0FBTyxJQUFQLENBSmE7RUFBQSxDQVZmLENBQUE7O0FBQUEsRUFnQkEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsWUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsR0FBQTtBQUNaLFVBQUEscUJBQUE7QUFBQSxNQUFBLElBQU8seUJBQVA7QUFDRSxRQUFBLFFBQWlELE9BQUEsQ0FBUSxZQUFSLENBQWpELEVBQUMsMEJBQUEsaUJBQUQsRUFBb0Isa0NBQUEseUJBQXBCLENBREY7T0FBQTtBQUFBLE1BR0EsY0FBQSxHQUFpQix5QkFIakIsQ0FBQTtBQUlBLE1BQUEsSUFBNEIsSUFBSSxDQUFDLFNBQUwsQ0FBQSxDQUFBLElBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsS0FBRixDQUFRLGFBQVIsRUFBUDtNQUFBLENBQTdCLENBQWpEO0FBQUEsUUFBQSxjQUFBLElBQWtCLE1BQWxCLENBQUE7T0FKQTtBQU1BLE1BQUEscUJBQUcsS0FBSyxDQUFFLGlCQUFQLEtBQW9CLGlCQUF2QjtBQUNFLFFBQUEsS0FBQSxHQUFRLEVBQVIsQ0FERjtPQU5BO0FBU0EsTUFBQSxxQkFBRyxLQUFLLENBQUUsd0JBQVAsS0FBMkIsY0FBOUI7QUFDRSxRQUFBLE1BQUEsQ0FBQSxLQUFZLENBQUMsU0FBYixDQUFBO0FBQUEsUUFDQSxNQUFBLENBQUEsS0FBWSxDQUFDLE9BRGIsQ0FERjtPQVRBO0FBYUEsTUFBQSxJQUFHLENBQUEsWUFBSSxDQUFhLEtBQUssQ0FBQyxpQkFBbkIsRUFBc0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixDQUF0QyxDQUFKLElBQXNGLENBQUEsWUFBSSxDQUFhLEtBQUssQ0FBQyxrQkFBbkIsRUFBdUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUF2QyxDQUE3RjtBQUNFLFFBQUEsTUFBQSxDQUFBLEtBQVksQ0FBQyxTQUFiLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBQSxLQUFZLENBQUMsT0FEYixDQUFBO0FBQUEsUUFFQSxNQUFBLENBQUEsS0FBWSxDQUFDLEtBRmIsQ0FERjtPQWJBO2FBa0JJLElBQUEsWUFBQSxDQUFhLEtBQWIsRUFuQlE7SUFBQSxDQUFkLENBQUE7O0FBcUJhLElBQUEsc0JBQUMsS0FBRCxHQUFBO0FBQ1gsVUFBQSx3REFBQTs7UUFEWSxRQUFNO09BQ2xCO0FBQUEsTUFBQSxJQUE4RCxlQUE5RDtBQUFBLFFBQUEsUUFBd0MsT0FBQSxDQUFRLE1BQVIsQ0FBeEMsRUFBQyxnQkFBQSxPQUFELEVBQVUsNEJBQUEsbUJBQVYsRUFBK0IsY0FBQSxLQUEvQixDQUFBO09BQUE7O1FBQ0Esc0JBQXVCLE9BQUEsQ0FBUSx3QkFBUjtPQUR2QjtBQUFBLE1BSUUsSUFBQyxDQUFBLHNCQUFBLGFBREgsRUFDa0IsSUFBQyxDQUFBLHFCQUFBLFlBRG5CLEVBQ2lDLElBQUMsQ0FBQSxvQkFBQSxXQURsQyxFQUMrQyxJQUFDLENBQUEsc0JBQUEsYUFEaEQsRUFDK0QsSUFBQyxDQUFBLGNBQUEsS0FEaEUsRUFDdUUsSUFBQyxDQUFBLG9CQUFBLFdBRHhFLEVBQ3FGLElBQUMsQ0FBQSxnQ0FBQSx1QkFEdEYsRUFDK0csSUFBQyxDQUFBLGlDQUFBLHdCQURoSCxFQUMwSSxJQUFDLENBQUEsa0NBQUEseUJBRDNJLEVBQ3NLLElBQUMsQ0FBQSxnQ0FBQSx1QkFEdkssRUFDZ00sSUFBQyxDQUFBLHVDQUFBLDhCQURqTSxFQUNpTyxJQUFDLENBQUEsMkJBQUEsa0JBRGxPLEVBQ3NQLGtCQUFBLFNBRHRQLEVBQ2lRLGtCQUFBLFNBRGpRLEVBQzRRLGdCQUFBLE9BSjVRLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BUFgsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQVJqQixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsRUFUMUIsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLFlBQUQscUJBQWdCLFVBQVUsRUFWMUIsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLDJCQUFELEdBQStCLE9BQUEsQ0FBUSx3QkFBUixDQVovQixDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsd0JBQUQsR0FBNEIsT0FBQSxDQUFRLHFCQUFSLENBYjVCLENBQUE7QUFlQSxNQUFBLElBQUcsaUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFuQixDQUErQixTQUEvQixDQUFiLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBQUEsQ0FBQSxtQkFBYixDQUhGO09BZkE7QUFBQSxNQW9CQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtpQkFDeEMsS0FBQyxDQUFBLHdCQUFELENBQTBCLE9BQTFCLEVBRHdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0FBbkIsQ0FwQkEsQ0FBQTtBQUFBLE1BdUJBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isc0JBQXBCLEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzdELEtBQUMsQ0FBQSxXQUFELENBQUEsRUFENkQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQUFuQixDQXZCQSxDQUFBO0FBQUEsTUEwQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix1QkFBcEIsRUFBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDOUQsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUQ4RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLENBQW5CLENBMUJBLENBQUE7QUFBQSxNQTZCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDZCQUFwQixFQUFtRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxrQkFBRixHQUFBO0FBQ3BFLFVBRHFFLEtBQUMsQ0FBQSxxQkFBQSxrQkFDdEUsQ0FBQTtpQkFBQSxLQUFDLENBQUEsa0JBQUQsQ0FBQSxFQURvRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQW5CLENBN0JBLENBQUE7QUFBQSxNQWdDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHdCQUFwQixFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMvRCxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxLQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQUQrRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBQW5CLENBaENBLENBQUE7QUFBQSxNQW1DQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDZCQUFwQixFQUFtRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BFLFVBQUEsS0FBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDJCQUFkLEVBQTJDLEtBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQTNDLEVBRm9FO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkQsQ0FBbkIsQ0FuQ0EsQ0FBQTtBQUFBLE1BdUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IscUJBQXBCLEVBQTJDLFNBQUMsSUFBRCxHQUFBO0FBQzVELFFBQUEsSUFBRyxZQUFIOztZQUNFLHFCQUFzQixPQUFBLENBQVEsd0JBQVI7V0FBdEI7aUJBQ0Esa0JBQWtCLENBQUMsYUFBbkIsQ0FBaUMsSUFBakMsRUFGRjtTQUQ0RDtNQUFBLENBQTNDLENBQW5CLENBdkNBLENBQUE7QUFBQSxNQTRDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGdDQUFwQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN2RSxLQUFDLENBQUEscUJBQUQsQ0FBQSxFQUR1RTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQW5CLENBNUNBLENBQUE7QUFBQSxNQStDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHlDQUFwQixFQUErRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNoRixLQUFDLENBQUEsd0JBQXdCLENBQUMsT0FBTyxDQUFDLElBQWxDLENBQXVDLHdCQUF2QyxFQUFpRTtBQUFBLFlBQy9ELFFBQUEsRUFBVSxLQUFDLENBQUEsd0JBRG9EO1dBQWpFLEVBRGdGO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0QsQ0FBbkIsQ0EvQ0EsQ0FBQTtBQUFBLE1Bb0RBLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxhQUExQixDQUF3Qyx1QkFBeEMsQ0FwRHJCLENBQUE7QUFBQSxNQXFEQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGlDQUFwQixFQUF1RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDeEUsVUFBQSxrQkFBa0IsQ0FBQyxNQUFuQixvQkFBNEIsU0FBUyxFQUFyQyxDQUFBO2lCQUNBLEtBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBbEMsQ0FBdUMsd0JBQXZDLEVBQWlFO0FBQUEsWUFDL0QsSUFBQSxFQUFNLGtCQUFrQixDQUFDLElBRHNDO0FBQUEsWUFFL0QsUUFBQSxFQUFVLEtBQUMsQ0FBQSx3QkFGb0Q7V0FBakUsRUFGd0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxDQUFuQixDQXJEQSxDQUFBO0FBQUEsTUE0REEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxzQkFBMUIsQ0FBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ2xFLGNBQUEsSUFBQTtBQUFBLFVBRG9FLE9BQUQsS0FBQyxJQUNwRSxDQUFBO0FBQUEsVUFBQSxJQUFjLHFCQUFKLElBQWUsSUFBQSxLQUFRLG9CQUFqQztBQUFBLGtCQUFBLENBQUE7V0FBQTtpQkFDQSxLQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQTZCLEtBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUFBLENBQTdCLEVBQXdELFNBQUEsR0FBQTtBQUN0RCxnQkFBQSxnQ0FBQTtBQUFBO0FBQUE7aUJBQUEsV0FBQTtzQ0FBQTtBQUFBLDRCQUFBLFdBQVcsQ0FBQyxNQUFaLENBQUEsRUFBQSxDQUFBO0FBQUE7NEJBRHNEO1VBQUEsQ0FBeEQsRUFGa0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQUFuQixDQTVEQSxDQUFBO0FBQUEsTUFpRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSwyQkFBMkIsQ0FBQyxzQkFBN0IsQ0FBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyRSxVQUFBLElBQWMsbUJBQWQ7QUFBQSxrQkFBQSxDQUFBO1dBQUE7aUJBQ0EsS0FBQyxDQUFBLHVCQUFELENBQXlCLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBekIsRUFGcUU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRCxDQUFuQixDQWpFQSxDQUFBO0FBcUVBLE1BQUEsSUFBZ0QsaUJBQWhEO0FBQUEsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBTCxDQUFqQixDQUFBO09BckVBO0FBQUEsTUF1RUEsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0F2RUEsQ0FBQTtBQXlFQSxNQUFBLElBQWlCLGtCQUFqQjtBQUFBLFFBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7T0F6RUE7QUFBQSxNQTBFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQTFFQSxDQURXO0lBQUEsQ0FyQmI7O0FBQUEsMkJBa0dBLGVBQUEsR0FBaUIsU0FBQyxRQUFELEdBQUE7YUFDZixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxnQkFBWixFQUE4QixRQUE5QixFQURlO0lBQUEsQ0FsR2pCLENBQUE7O0FBQUEsMkJBcUdBLFlBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTthQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsUUFBM0IsRUFEWTtJQUFBLENBckdkLENBQUE7O0FBQUEsMkJBd0dBLG9CQUFBLEdBQXNCLFNBQUMsUUFBRCxHQUFBO2FBQ3BCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHNCQUFaLEVBQW9DLFFBQXBDLEVBRG9CO0lBQUEsQ0F4R3RCLENBQUE7O0FBQUEsMkJBMkdBLHNCQUFBLEdBQXdCLFNBQUMsUUFBRCxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHlCQUFaLEVBQXVDLFFBQXZDLEVBRHNCO0lBQUEsQ0EzR3hCLENBQUE7O0FBQUEsMkJBOEdBLHdCQUFBLEdBQTBCLFNBQUMsUUFBRCxHQUFBO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLDJCQUFaLEVBQXlDLFFBQXpDLEVBRHdCO0lBQUEsQ0E5RzFCLENBQUE7O0FBQUEsMkJBaUhBLGdCQUFBLEdBQWtCLFNBQUMsUUFBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDLEVBRGdCO0lBQUEsQ0FqSGxCLENBQUE7O0FBQUEsMkJBb0hBLG1CQUFBLEdBQXFCLFNBQUMsUUFBRCxHQUFBO0FBQ25CLFVBQUEsc0JBQUE7QUFBQTtBQUFBLFdBQUEsV0FBQTtnQ0FBQTtBQUFBLFFBQUEsUUFBQSxDQUFTLFdBQVQsQ0FBQSxDQUFBO0FBQUEsT0FBQTthQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixRQUF4QixFQUZtQjtJQUFBLENBcEhyQixDQUFBOztBQUFBLDJCQXdIQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFlBQUo7SUFBQSxDQXhIZixDQUFBOztBQUFBLDJCQTBIQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFVBQUo7SUFBQSxDQTFIYixDQUFBOztBQUFBLDJCQTRIQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFxRCxJQUFDLENBQUEsYUFBRCxDQUFBLENBQXJEO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBQSxDQUFoQixDQUFQLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBNkIsOEJBQTdCO0FBQUEsZUFBTyxJQUFDLENBQUEsaUJBQVIsQ0FBQTtPQURBO2FBRUEsSUFBQyxDQUFBLGlCQUFELEdBQXlCLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtpQkFDL0IsS0FBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQTJCLE9BQTNCLEVBRCtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUd6QixDQUFDLElBSHdCLENBR25CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0osS0FBQyxDQUFBLHFCQUFELENBQUEsRUFESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSG1CLENBS3pCLENBQUMsSUFMd0IsQ0FLbkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNKLFVBQUEsSUFBNkIsS0FBQyxDQUFBLGFBQTlCO21CQUFBLEtBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBQUE7V0FESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTG1CLENBT3pCLENBQUMsSUFQd0IsQ0FPbkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNKLGNBQUEsU0FBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLFdBQUQsR0FBZSxJQUFmLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxLQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBQSxDQUZaLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGdCQUFkLEVBQWdDLFNBQWhDLENBSEEsQ0FBQTtpQkFJQSxVQUxJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FQbUIsRUFIZjtJQUFBLENBNUhaLENBQUE7O0FBQUEsMkJBNklBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7O1FBRUEsZUFBZ0IsT0FBQSxDQUFRLGlCQUFSO09BRmhCO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBSmIsQ0FBQTtBQUFBLE1BTUEsWUFBWSxDQUFDLG9CQUFiLENBQUEsQ0FOQSxDQUFBO0FBUUE7QUFBQSxXQUFBLFdBQUE7MkJBQUE7QUFBQSxRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FSQTtBQUFBLE1BU0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBVDFCLENBQUE7QUFBQSxNQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBWEEsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFaakIsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZCxFQUE2QixJQUE3QixDQWRBLENBQUE7YUFlQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQSxFQWhCTztJQUFBLENBN0lULENBQUE7O0FBQUEsMkJBK0pBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDakIsVUFBQSxLQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLEVBSGlCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FJQSxDQUFDLElBSkQsQ0FJTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0osVUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBSDttQkFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLGdDQUE5QixFQUFnRTtBQUFBLGNBQUEsV0FBQSxFQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5Q0FBaEIsQ0FBYjtBQUFBLGNBQXlFLFdBQUEsRUFBZ0IsY0FBQSxHQUMzSixLQUFDLENBQUEsS0FBSyxDQUFDLE1BRG9KLEdBQzdJLGtCQUQ2SSxHQUM3SCxDQUFDLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZSxDQUFDLE1BQWpCLENBRDZILEdBRTVJLDhCQUY0SSxHQUUvRyxDQUFDLEtBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQW9CLENBQUMsTUFBdEIsQ0FGK0csR0FFbEYsYUFGUDthQUFoRSxFQURGO1dBQUEsTUFBQTttQkFNRSxPQUFPLENBQUMsR0FBUixDQUFlLFlBQUEsR0FDbkIsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQURZLEdBQ0wsY0FESyxHQUNPLENBQUMsS0FBQyxDQUFBLFlBQUQsQ0FBQSxDQUFlLENBQUMsTUFBakIsQ0FEUCxHQUVKLDBCQUZJLEdBRXFCLENBQUMsS0FBQyxDQUFBLGlCQUFELENBQUEsQ0FBb0IsQ0FBQyxNQUF0QixDQUZyQixHQUVrRCxXQUZqRSxFQU5GO1dBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOLENBZUEsQ0FBQyxPQUFELENBZkEsQ0FlTyxTQUFDLE1BQUQsR0FBQTtBQUNMLFlBQUEsYUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFoQixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsTUFBTSxDQUFDLEtBRGYsQ0FBQTtBQUFBLFFBRUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QiwrQkFBNUIsRUFBNkQ7QUFBQSxVQUFDLFFBQUEsTUFBRDtBQUFBLFVBQVMsT0FBQSxLQUFUO0FBQUEsVUFBZ0IsV0FBQSxFQUFhLElBQTdCO1NBQTdELENBRkEsQ0FBQTtlQUdBLE9BQU8sQ0FBQyxLQUFSLENBQWMsTUFBZCxFQUpLO01BQUEsQ0FmUCxFQURNO0lBQUEsQ0EvSlIsQ0FBQTs7QUFBQSwyQkFxTEEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQVosQ0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBR2hCLGNBQUEsZ0NBQUE7QUFBQSxVQUhrQixlQUFBLFNBQVMsZUFBQSxPQUczQixDQUFBO0FBQUEsVUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBQ0UsWUFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO3FCQUFPLGVBQVMsT0FBVCxFQUFBLENBQUEsTUFBUDtZQUFBLENBQWQsQ0FBVCxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBekIsQ0FEQSxDQURGO1dBQUE7QUFNQSxVQUFBLElBQUcscUJBQUEsSUFBWSxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFoQztBQUNFLGlCQUFBLDhDQUFBO2lDQUFBO2tCQUEwQyxlQUFZLEtBQUMsQ0FBQSxLQUFiLEVBQUEsSUFBQTtBQUExQyxnQkFBQSxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUE7ZUFBQTtBQUFBLGFBQUE7QUFJQSxZQUFBLElBQUcsS0FBQyxDQUFBLFNBQVMsQ0FBQyxNQUFkO3FCQUNFLFFBREY7YUFBQSxNQUFBO3FCQUtFLEtBQUMsQ0FBQSxNQUxIO2FBTEY7V0FBQSxNQVlLLElBQU8sbUJBQVA7bUJBQ0gsS0FBQyxDQUFBLEtBQUQsR0FBUyxRQUROO1dBQUEsTUFJQSxJQUFBLENBQUEsS0FBUSxDQUFBLFNBQVMsQ0FBQyxNQUFsQjttQkFDSCxLQUFDLENBQUEsTUFERTtXQUFBLE1BQUE7bUJBSUgsR0FKRztXQXpCVztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLENBOEJBLENBQUMsSUE5QkQsQ0E4Qk0sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUNKLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixLQUF2QixFQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0E5Qk4sQ0FnQ0EsQ0FBQyxJQWhDRCxDQWdDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7QUFDSixVQUFBLElBQXdDLGVBQXhDO21CQUFBLEtBQUMsQ0FBQSxTQUFTLENBQUMsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBQTtXQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FoQ04sRUFIcUI7SUFBQSxDQXJMdkIsQ0FBQTs7QUFBQSwyQkEyTkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsUUFBQTs7UUFBQSxjQUFlLE9BQUEsQ0FBUSxnQkFBUjtPQUFmO0FBQUEsTUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUZYLENBQUE7YUFHSSxJQUFBLFdBQUEsQ0FDRjtBQUFBLFFBQUEsV0FBQSxFQUFhLFFBQWI7QUFBQSxRQUNBLE9BQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxZQUFBLEVBQWMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUZkO0FBQUEsUUFHQSxPQUFBLEVBQVMsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUhUO09BREUsRUFKUztJQUFBLENBM05mLENBQUE7O0FBQUEsMkJBcU9BLGlCQUFBLEdBQW1CLFNBQUUsY0FBRixHQUFBO0FBQW1CLE1BQWxCLElBQUMsQ0FBQSxpQkFBQSxjQUFpQixDQUFuQjtJQUFBLENBck9uQixDQUFBOztBQUFBLDJCQStPQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFDakIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ25ELGNBQUEsaUNBQUE7QUFBQSxVQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWIsQ0FBQTtBQUNBLFVBQUEsSUFBYyxvQkFBSixJQUFtQixLQUFDLENBQUEsZUFBRCxDQUFpQixVQUFqQixDQUE3QjtBQUFBLGtCQUFBLENBQUE7V0FEQTtBQUFBLFVBR0EsTUFBQSxHQUFTLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixDQUhULENBQUE7QUFJQSxVQUFBLElBQUcsY0FBSDtBQUNFLFlBQUEsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBaEIsQ0FBQTttQkFDQSxhQUFhLENBQUMsTUFBZCxDQUFBLEVBRkY7V0FMbUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQixFQURpQjtJQUFBLENBL09uQixDQUFBOztBQUFBLDJCQXlQQSx1QkFBQSxHQUF5QixTQUFDLE1BQUQsR0FBQTtBQUN2QixNQUFBLElBQWdCLElBQUMsQ0FBQSxTQUFELElBQWtCLGdCQUFsQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7YUFDQSwrQ0FGdUI7SUFBQSxDQXpQekIsQ0FBQTs7QUFBQSwyQkE2UEEsb0JBQUEsR0FBc0IsU0FBQyxNQUFELEdBQUE7QUFDcEIsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FEQTs7UUFHQSxjQUFlLE9BQUEsQ0FBUSxnQkFBUjtPQUhmO0FBS0EsTUFBQSxJQUFHLDhDQUFIO0FBQ0UsZUFBTyxJQUFDLENBQUEsc0JBQXVCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBL0IsQ0FERjtPQUxBO0FBUUEsTUFBQSxJQUFHLG9DQUFIO0FBQ0UsUUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQWEsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUF0QixDQUFBO0FBQUEsUUFDQSxLQUFLLENBQUMsTUFBTixHQUFlLE1BRGYsQ0FBQTtBQUFBLFFBRUEsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsSUFGaEIsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFBLElBQVEsQ0FBQSxZQUFhLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FIckIsQ0FERjtPQUFBLE1BQUE7QUFNRSxRQUFBLEtBQUEsR0FBUTtBQUFBLFVBQUMsUUFBQSxNQUFEO0FBQUEsVUFBUyxPQUFBLEVBQVMsSUFBbEI7U0FBUixDQU5GO09BUkE7QUFBQSxNQWdCQSxJQUFDLENBQUEsc0JBQXVCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBeEIsR0FBcUMsTUFBQSxHQUFhLElBQUEsV0FBQSxDQUFZLEtBQVosQ0FoQmxELENBQUE7QUFBQSxNQWtCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsWUFBQSxHQUFlLE1BQU0sQ0FBQyxZQUFQLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEQsVUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsWUFBdEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxZQUFZLENBQUMsT0FBYixDQUFBLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQUEsS0FBUSxDQUFBLHNCQUF1QixDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBSHFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FBbEMsQ0FsQkEsQ0FBQTtBQUFBLE1BdUJBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHlCQUFkLEVBQXlDLE1BQXpDLENBdkJBLENBQUE7YUF5QkEsT0ExQm9CO0lBQUEsQ0E3UHRCLENBQUE7O0FBQUEsMkJBeVJBLGtCQUFBLEdBQW9CLFNBQUMsSUFBRCxHQUFBO0FBQ2xCLFVBQUEsc0JBQUE7QUFBQTtBQUFBLFdBQUEsV0FBQTtnQ0FBQTtBQUNFLFFBQUEsSUFBc0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFuQixDQUFBLENBQUEsS0FBZ0MsSUFBdEQ7QUFBQSxpQkFBTyxXQUFQLENBQUE7U0FERjtBQUFBLE9BRGtCO0lBQUEsQ0F6UnBCLENBQUE7O0FBQUEsMkJBNlJBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixVQUFBLHNFQUFBO0FBQUE7QUFBQSxXQUFBLFdBQUE7MkJBQUE7QUFDRSxRQUFBLElBQUcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFkLENBQUEsQ0FBakIsQ0FBSDtBQUNFLFVBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBQSxJQUFRLENBQUEsc0JBQXVCLENBQUEsRUFBQSxDQUQvQixDQURGO1NBREY7QUFBQSxPQUFBO0FBS0E7QUFDRSxRQUFBLElBQUcsbUNBQUg7QUFDRTtBQUFBO2VBQUEsNENBQUE7K0JBQUE7QUFDRSxZQUFBLElBQVksSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLENBQUEsSUFBb0MsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFqQixDQUFoRDtBQUFBLHVCQUFBO2FBQUE7QUFBQSxZQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsQ0FGVCxDQUFBO0FBR0EsWUFBQSxJQUFHLGNBQUg7QUFDRSxjQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQWhCLENBQUE7QUFBQSw0QkFDQSxhQUFhLENBQUMsTUFBZCxDQUFBLEVBREEsQ0FERjthQUFBLE1BQUE7b0NBQUE7YUFKRjtBQUFBOzBCQURGO1NBREY7T0FBQSxjQUFBO0FBV0UsUUFESSxVQUNKLENBQUE7ZUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQVosRUFYRjtPQU5rQjtJQUFBLENBN1JwQixDQUFBOztBQUFBLDJCQWdUQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsVUFBQSxnQ0FBQTs7UUFBQSxZQUFhLE9BQUEsQ0FBUSxXQUFSO09BQWI7QUFBQSxNQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FGUCxDQUFBO0FBQUEsTUFHQSxPQUFBLHVEQUFnQyxFQUhoQyxDQUFBO0FBSUEsV0FBQSw4Q0FBQTs2QkFBQTtZQUF1QyxTQUFBLENBQVUsSUFBVixFQUFnQixNQUFoQixFQUF3QjtBQUFBLFVBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxVQUFpQixHQUFBLEVBQUssSUFBdEI7U0FBeEI7QUFBdkMsaUJBQU8sSUFBUDtTQUFBO0FBQUEsT0FKQTthQUtBLE1BTmU7SUFBQSxDQWhUakIsQ0FBQTs7QUFBQSwyQkFnVUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUFHLFVBQUEsS0FBQTtpREFBTSxDQUFFLEtBQVIsQ0FBQSxXQUFIO0lBQUEsQ0FoVVYsQ0FBQTs7QUFBQSwyQkFrVUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQVUsTUFBQSxJQUFxQixZQUFyQjtlQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVosRUFBQTtPQUFWO0lBQUEsQ0FsVVosQ0FBQTs7QUFBQSwyQkFvVUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQVUsVUFBQSxLQUFBO2FBQUEsc0RBQWtCLEVBQWxCLEVBQUEsSUFBQSxPQUFWO0lBQUEsQ0FwVVQsQ0FBQTs7QUFBQSwyQkFzVUEsU0FBQSxHQUFXLFNBQUMsWUFBRCxHQUFBOztRQUFDLGVBQWE7T0FDdkI7O1FBQUEsY0FBZSxPQUFBLENBQVEsZ0JBQVI7T0FBZjthQUVJLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDVixjQUFBLG9DQUFBO0FBQUEsVUFBQSxTQUFBLEdBQVksS0FBQyxDQUFBLFlBQUQsQ0FBQSxDQUFaLENBQUE7QUFBQSxVQUNBLFVBQUEsR0FBZ0IsWUFBSCxHQUFxQixFQUFyQiwyQ0FBc0MsRUFEbkQsQ0FBQTtBQUFBLFVBRUEsTUFBQSxHQUFTO0FBQUEsWUFDUCxZQUFBLFVBRE87QUFBQSxZQUVOLFdBQUQsS0FBQyxDQUFBLFNBRk07QUFBQSxZQUdQLFlBQUEsRUFBYyxLQUFDLENBQUEsZUFBRCxDQUFBLENBSFA7QUFBQSxZQUlQLEtBQUEsRUFBTyxTQUpBO0FBQUEsWUFLUCw4QkFBQSxFQUFnQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBTHpCO0FBQUEsWUFNUCxXQUFBLEVBQWEsS0FBQyxDQUFBLGNBQUQsQ0FBQSxDQU5OO0FBQUEsWUFPUCxnQkFBQSxFQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBUFg7V0FGVCxDQUFBO2lCQVdBLFdBQVcsQ0FBQyxTQUFaLENBQXNCLE1BQXRCLEVBQThCLFNBQUMsT0FBRCxHQUFBO0FBQzVCLGdCQUFBLG9DQUFBO0FBQUEsaUJBQUEsaURBQUE7aUNBQUE7QUFDRSxjQUFBLHVCQUFBLEdBQTBCLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxJQUFELEdBQUE7dUJBQ3ZDLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixDQUFBLEtBQW1CLEVBRG9CO2NBQUEsQ0FBZixDQUExQixDQUFBO0FBR0EsY0FBQSxJQUFBLENBQUEsdUJBQUE7O2tCQUNFLE9BQU8sQ0FBQyxVQUFXO2lCQUFuQjtBQUFBLGdCQUNBLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBaEIsQ0FBcUIsQ0FBckIsQ0FEQSxDQURGO2VBSkY7QUFBQSxhQUFBO21CQVFBLE9BQUEsQ0FBUSxPQUFSLEVBVDRCO1VBQUEsQ0FBOUIsRUFaVTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFISztJQUFBLENBdFVYLENBQUE7O0FBQUEsMkJBZ1dBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLElBQUEsQ0FBQSxJQUFpQyxDQUFBLFdBQWpDO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVAsQ0FBQTtPQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsSUFBYixDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDaEIsY0FBQSw2QkFBQTtBQUFBLFVBRGtCLGVBQUEsU0FBUyxlQUFBLE9BQzNCLENBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixPQUF6QixDQUFBLENBQUE7QUFBQSxVQUVBLEtBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFELEdBQUE7bUJBQU8sZUFBUyxPQUFULEVBQUEsQ0FBQSxNQUFQO1VBQUEsQ0FBZCxDQUZULENBQUE7QUFHQSxlQUFBLDhDQUFBOzRCQUFBO2dCQUFxQyxlQUFTLEtBQUMsQ0FBQSxLQUFWLEVBQUEsQ0FBQTtBQUFyQyxjQUFBLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBQTthQUFBO0FBQUEsV0FIQTtBQUFBLFVBS0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsa0JBQWQsRUFBa0MsS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFsQyxDQUxBLENBQUE7aUJBTUEsS0FBQyxDQUFBLHVCQUFELENBQXlCLE9BQXpCLEVBUGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsRUFIVztJQUFBLENBaFdiLENBQUE7O0FBQUEsMkJBNFdBLHFCQUFBLEdBQXVCLFNBQUMsSUFBRCxHQUFBO0FBQ3JCLFVBQUEseUJBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFBO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FBQTs7UUFFQSxZQUFhLE9BQUEsQ0FBUSxXQUFSO09BRmI7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsSUFBeEIsQ0FIUCxDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUpWLENBQUE7QUFNQSxXQUFBLDhDQUFBOzZCQUFBO1lBQXVDLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLEVBQXdCO0FBQUEsVUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLFVBQWlCLEdBQUEsRUFBSyxJQUF0QjtTQUF4QjtBQUF2QyxpQkFBTyxJQUFQO1NBQUE7QUFBQSxPQVBxQjtJQUFBLENBNVd2QixDQUFBOztBQUFBLDJCQXFYQSxhQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDYixVQUFBLDhCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7O1FBRUEsWUFBYSxPQUFBLENBQVEsV0FBUjtPQUZiO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFiLENBQXdCLElBQXhCLENBSFAsQ0FBQTtBQUFBLE1BSUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FKZixDQUFBO0FBTUEsV0FBQSxtREFBQTtrQ0FBQTtZQUE0QyxTQUFBLENBQVUsSUFBVixFQUFnQixNQUFoQixFQUF3QjtBQUFBLFVBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxVQUFpQixHQUFBLEVBQUssSUFBdEI7U0FBeEI7QUFBNUMsaUJBQU8sSUFBUDtTQUFBO0FBQUEsT0FQYTtJQUFBLENBclhmLENBQUE7O0FBQUEsMkJBOFhBLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLFVBQUEsS0FBQTs7UUFBQSxvQkFBcUIsT0FBQSxDQUFRLHdCQUFSO09BQXJCO0FBQUEsTUFFQSxLQUFBLEdBQVEsaUJBQUEsQ0FBa0IsSUFBbEIsQ0FGUixDQUFBO0FBSUEsTUFBQSxJQUFHLEtBQUEsS0FBUyxNQUFULElBQW1CLEtBQUEsS0FBUyxNQUEvQjtBQUNFLFFBQUEsS0FBQSxHQUFRLENBQUMsS0FBRCxFQUFRLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQVIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxHQUFwQyxDQUFSLENBREY7T0FKQTthQU9BLE1BUmlCO0lBQUEsQ0E5WG5CLENBQUE7O0FBQUEsMkJBZ1pBLFVBQUEsR0FBWSxTQUFBLEdBQUE7O1FBQ1YsVUFBVyxPQUFBLENBQVEsV0FBUjtPQUFYO0FBRUEsTUFBQSxJQUFBLENBQUEsSUFBMkIsQ0FBQSxhQUFELENBQUEsQ0FBMUI7QUFBQSxlQUFPLEdBQUEsQ0FBQSxPQUFQLENBQUE7T0FGQTthQUdJLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQVIsRUFKTTtJQUFBLENBaFpaLENBQUE7O0FBQUEsMkJBc1pBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLFVBQVgsQ0FBQSxFQUFIO0lBQUEsQ0F0WlosQ0FBQTs7QUFBQSwyQkF3WkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUFBLEVBQUg7SUFBQSxDQXhaZCxDQUFBOztBQUFBLDJCQTBaQSw4QkFBQSxHQUFnQyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsNEJBQUo7SUFBQSxDQTFaaEMsQ0FBQTs7QUFBQSwyQkE0WkEsZUFBQSxHQUFpQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsZUFBWCxDQUEyQixFQUEzQixFQUFSO0lBQUEsQ0E1WmpCLENBQUE7O0FBQUEsMkJBOFpBLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxHQUFBO2FBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixJQUE3QixFQUFWO0lBQUEsQ0E5Wm5CLENBQUE7O0FBQUEsMkJBZ2FBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsaUJBQVgsQ0FBQSxFQUFIO0lBQUEsQ0FoYW5CLENBQUE7O0FBQUEsMkJBa2FBLDJCQUFBLEdBQTZCLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSx5QkFBSjtJQUFBLENBbGE3QixDQUFBOztBQUFBLDJCQW9hQSxrQkFBQSxHQUFvQixTQUFDLFFBQUQsR0FBQTthQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBUSxDQUFDLElBQTdCLENBQWtDLENBQUMsSUFBbkMsQ0FBd0MsU0FBQyxNQUFELEdBQUE7QUFDdEMsWUFBQSwwQkFBQTtBQUFBLFFBQUEsSUFBOEQsYUFBOUQ7QUFBQSxVQUFBLFFBQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsZ0JBQUEsT0FBRCxFQUFVLDRCQUFBLG1CQUFWLEVBQStCLGNBQUEsS0FBL0IsQ0FBQTtTQUFBO0FBQUEsUUFFQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUZULENBQUE7QUFBQSxRQUlBLFdBQUEsR0FBYyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUM3QixNQUFNLENBQUMseUJBQVAsQ0FBaUMsUUFBUSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWhELENBRDZCLEVBRTdCLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBaEQsQ0FGNkIsQ0FBakIsQ0FKZCxDQUFBO2VBU0EsTUFBTSxDQUFDLHNCQUFQLENBQThCLFdBQTlCLEVBQTJDO0FBQUEsVUFBQSxVQUFBLEVBQVksSUFBWjtTQUEzQyxFQVZzQztNQUFBLENBQXhDLEVBRGtCO0lBQUEsQ0FwYXBCLENBQUE7O0FBQUEsMkJBaWJBLHdCQUFBLEdBQTBCLFNBQUMsT0FBRCxHQUFBO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHNCQUFkLEVBQXNDLE9BQXRDLEVBRHdCO0lBQUEsQ0FqYjFCLENBQUE7O0FBQUEsMkJBb2JBLG9CQUFBLEdBQXNCLFNBQUMsSUFBRCxHQUFBO2FBQVUsSUFBQyxDQUFBLHFCQUFELENBQXVCLENBQUMsSUFBRCxDQUF2QixFQUFWO0lBQUEsQ0FwYnRCLENBQUE7O0FBQUEsMkJBc2JBLHFCQUFBLEdBQXVCLFNBQUMsS0FBRCxHQUFBO2FBQ2pCLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7aUJBQ1YsS0FBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLEVBQThCLFNBQUMsT0FBRCxHQUFBO21CQUFhLE9BQUEsQ0FBUSxPQUFSLEVBQWI7VUFBQSxDQUE5QixFQURVO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixFQURpQjtJQUFBLENBdGJ2QixDQUFBOztBQUFBLDJCQTBiQSxtQkFBQSxHQUFxQixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsbUJBQVgsQ0FBK0IsSUFBL0IsRUFBVjtJQUFBLENBMWJyQixDQUFBOztBQUFBLDJCQTRiQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQsR0FBQTthQUFXLElBQUMsQ0FBQSxTQUFTLENBQUMsb0JBQVgsQ0FBZ0MsS0FBaEMsRUFBWDtJQUFBLENBNWJ0QixDQUFBOztBQUFBLDJCQThiQSxzQkFBQSxHQUF3QixTQUFDLElBQUQsR0FBQTthQUFVLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUFDLElBQUQsQ0FBekIsRUFBVjtJQUFBLENBOWJ4QixDQUFBOztBQUFBLDJCQWdjQSx1QkFBQSxHQUF5QixTQUFDLEtBQUQsR0FBQTthQUN2QixJQUFDLENBQUEsU0FBUyxDQUFDLHVCQUFYLENBQW1DLEtBQW5DLEVBRHVCO0lBQUEsQ0FoY3pCLENBQUE7O0FBQUEsMkJBbWNBLHNCQUFBLEdBQXdCLFNBQUMsSUFBRCxHQUFBO2FBQVUsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUMsSUFBRCxDQUF6QixFQUFWO0lBQUEsQ0FuY3hCLENBQUE7O0FBQUEsMkJBcWNBLHVCQUFBLEdBQXlCLFNBQUMsS0FBRCxHQUFBO0FBQ3ZCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBZ0MsQ0FBQSxhQUFELENBQUEsQ0FBL0I7QUFBQSxRQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQVYsQ0FBQTtPQURBO2FBR0EsT0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0osVUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxJQUFELEdBQUE7bUJBQVUsZUFBWSxLQUFDLENBQUEsS0FBYixFQUFBLElBQUEsTUFBVjtVQUFBLENBQVgsQ0FBSDtBQUNFLG1CQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBQVAsQ0FERjtXQUFBO2lCQUdBLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixLQUF2QixFQUpJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQU1BLENBQUMsSUFORCxDQU1NLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtpQkFDSixLQUFDLENBQUEsU0FBUyxDQUFDLGdCQUFYLENBQTRCLE9BQTVCLEVBQXFDLEtBQXJDLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5OLEVBSnVCO0lBQUEsQ0FyY3pCLENBQUE7O0FBQUEsMkJBa2RBLHFCQUFBLEdBQXVCLFNBQUMsS0FBRCxFQUFRLFFBQVIsR0FBQTtBQUNyQixVQUFBLFdBQUE7QUFBQSxNQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBaEIsSUFBc0IsQ0FBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLGtCQUFELENBQW9CLEtBQU0sQ0FBQSxDQUFBLENBQTFCLENBQWQsQ0FBekI7ZUFDRSxXQUFXLENBQUMsc0JBQVosQ0FBQSxDQUFvQyxDQUFDLElBQXJDLENBQTBDLFNBQUMsT0FBRCxHQUFBO2lCQUFhLFFBQUEsQ0FBUyxPQUFULEVBQWI7UUFBQSxDQUExQyxFQURGO09BQUEsTUFBQTs7VUFHRSxlQUFnQixPQUFBLENBQVEsaUJBQVI7U0FBaEI7ZUFFQSxZQUFZLENBQUMsU0FBYixDQUF1QixLQUFLLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxDQUFELEdBQUE7bUJBQU8sQ0FBQyxDQUFELEVBQUksS0FBQyxDQUFBLGlCQUFELENBQW1CLENBQW5CLENBQUosRUFBUDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FBdkIsRUFBcUUsSUFBQyxDQUFBLDJCQUF0RSxFQUFtRyxTQUFDLE9BQUQsR0FBQTtpQkFBYSxRQUFBLENBQVMsT0FBVCxFQUFiO1FBQUEsQ0FBbkcsRUFMRjtPQURxQjtJQUFBLENBbGR2QixDQUFBOztBQUFBLDJCQTBkQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsSUFBNEMsdUJBQTVDO0FBQUEsUUFBQyxrQkFBbUIsT0FBQSxDQUFRLFFBQVIsRUFBbkIsZUFBRCxDQUFBO09BQUE7O1FBQ0EsaUJBQWtCLE9BQUEsQ0FBUSxrQkFBUjtPQURsQjtBQUFBLE1BR0EsUUFBQSxHQUFXLENBSFgsQ0FBQTtBQUFBLE1BSUEsU0FBQSxHQUFZLEVBSlosQ0FBQTtBQUFBLE1BS0EsSUFBQSxHQUFPLEVBTFAsQ0FBQTtBQUFBLE1BTUEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxDQUFELEdBQUE7ZUFBTyxJQUFBLElBQVMsY0FBQSxHQUFjLENBQWQsR0FBZ0IsSUFBaEIsR0FBb0IsQ0FBcEIsR0FBc0IsU0FBdEM7TUFBQSxDQUF2QixDQU5BLENBQUE7QUFBQSxNQVFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQVJOLENBQUE7QUFBQSxNQVNBLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLGtCQVRoQixDQUFBO0FBQUEsTUFVQSxHQUFHLENBQUMsU0FBSixHQUFnQixJQVZoQixDQUFBO0FBQUEsTUFXQSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQWQsQ0FBMEIsR0FBMUIsQ0FYQSxDQUFBO0FBQUEsTUFhQSxjQUFjLENBQUMsT0FBZixDQUF1QixTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDckIsWUFBQSwwQkFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFwQixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsZ0JBQUEsQ0FBaUIsSUFBakIsQ0FBc0IsQ0FBQyxLQUQvQixDQUFBO0FBQUEsUUFFQSxHQUFBLEdBQU0sUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxNQUE1QixHQUFxQyxDQUYzQyxDQUFBO0FBQUEsUUFJQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTyxHQUFBLEdBQUcsQ0FBVjtBQUFBLFVBQ0EsSUFBQSxFQUFNLENBRE47QUFBQSxVQUVBLEtBQUEsRUFBTyxLQUZQO0FBQUEsVUFHQSxLQUFBLEVBQU8sQ0FBQyxRQUFELEVBQVUsR0FBVixDQUhQO0FBQUEsVUFJQSxJQUFBLEVBQU0sZUFKTjtTQUxGLENBQUE7QUFBQSxRQVdBLFFBQUEsR0FBVyxHQVhYLENBQUE7ZUFZQSxTQUFTLENBQUMsSUFBVixDQUFlLFFBQWYsRUFicUI7TUFBQSxDQUF2QixDQWJBLENBQUE7QUFBQSxNQTRCQSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQWQsQ0FBMEIsR0FBMUIsQ0E1QkEsQ0FBQTtBQTZCQSxhQUFPLFNBQVAsQ0E5Qm1CO0lBQUEsQ0ExZHJCLENBQUE7O0FBQUEsMkJBa2dCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsRUFBSDtJQUFBLENBbGdCZCxDQUFBOztBQUFBLDJCQW9nQkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsWUFBQTtvS0FBK0YsVUFEN0U7SUFBQSxDQXBnQnBCLENBQUE7O0FBQUEsMkJBdWdCQSxpQ0FBQSxHQUFtQyxTQUFFLDhCQUFGLEdBQUE7QUFDakMsTUFEa0MsSUFBQyxDQUFBLGlDQUFBLDhCQUNuQyxDQUFBO2FBQUEsSUFBQyxDQUFBLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxJQUFsQyxDQUF1Qyx3QkFBdkMsRUFBaUU7QUFBQSxRQUMvRCxRQUFBLEVBQVUsSUFBQyxDQUFBLHdCQURvRDtPQUFqRSxFQURpQztJQUFBLENBdmdCbkMsQ0FBQTs7QUFBQSwyQkE0Z0JBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxtQkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLENBQUMsV0FBRCxDQUFSLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTiw4Q0FBNEIsRUFBNUIsQ0FEUixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHVCQUFSO0FBQ0UsUUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4scUVBQXVELEVBQXZELENBQVIsQ0FERjtPQUZBO2FBSUEsTUFMYztJQUFBLENBNWdCaEIsQ0FBQTs7QUFBQSwyQkFtaEJBLGNBQUEsR0FBZ0IsU0FBRSxXQUFGLEdBQUE7QUFDZCxNQURlLElBQUMsQ0FBQSxvQ0FBQSxjQUFZLEVBQzVCLENBQUE7QUFBQSxNQUFBLElBQWMsMEJBQUosSUFBMEIsZ0NBQXBDO0FBQUEsY0FBQSxDQUFBO09BQUE7YUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLHFCQUFELENBQXVCLElBQXZCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQUhjO0lBQUEsQ0FuaEJoQixDQUFBOztBQUFBLDJCQXdoQkEsMEJBQUEsR0FBNEIsU0FBRSx1QkFBRixHQUFBO0FBQzFCLE1BRDJCLElBQUMsQ0FBQSwwQkFBQSx1QkFDNUIsQ0FBQTthQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsRUFEMEI7SUFBQSxDQXhoQjVCLENBQUE7O0FBQUEsMkJBMmhCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsaUNBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTiw4Q0FBNEIsRUFBNUIsQ0FEUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sOENBQTRCLEVBQTVCLENBRlIsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSx1QkFBUjtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLHFFQUF1RCxFQUF2RCxDQUFSLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTiw2RUFBK0QsRUFBL0QsQ0FEUixDQURGO09BSEE7YUFNQSxNQVBjO0lBQUEsQ0EzaEJoQixDQUFBOztBQUFBLDJCQW9pQkEsY0FBQSxHQUFnQixTQUFFLFdBQUYsR0FBQTtBQUFtQixNQUFsQixJQUFDLENBQUEsb0NBQUEsY0FBWSxFQUFLLENBQW5CO0lBQUEsQ0FwaUJoQixDQUFBOztBQUFBLDJCQXNpQkEsMEJBQUEsR0FBNEIsU0FBRSx1QkFBRixHQUFBO0FBQTRCLE1BQTNCLElBQUMsQ0FBQSwwQkFBQSx1QkFBMEIsQ0FBNUI7SUFBQSxDQXRpQjVCLENBQUE7O0FBQUEsMkJBd2lCQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsMEJBQUE7QUFBQSxNQUFBLEtBQUEsaURBQXdCLEVBQXhCLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsd0JBQVI7QUFDRSxRQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTiwwREFBd0MsRUFBeEMsQ0FBUixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sa0VBQW9ELEVBQXBELENBRFIsQ0FERjtPQURBO2FBSUEsTUFMZTtJQUFBLENBeGlCakIsQ0FBQTs7QUFBQSwyQkEraUJBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixVQUFBLEtBQUE7K0VBQXdDLENBQUUsR0FBMUMsQ0FBOEMsU0FBQyxDQUFELEdBQUE7QUFDNUMsUUFBQSxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYixDQUFIO2lCQUF3QixDQUFBLEdBQUksSUFBNUI7U0FBQSxNQUFBO2lCQUFxQyxFQUFyQztTQUQ0QztNQUFBLENBQTlDLFdBRHFCO0lBQUEsQ0EvaUJ2QixDQUFBOztBQUFBLDJCQW1qQkEsZUFBQSxHQUFpQixTQUFFLFlBQUYsR0FBQTtBQUNmLE1BRGdCLElBQUMsQ0FBQSxzQ0FBQSxlQUFhLEVBQzlCLENBQUE7QUFBQSxNQUFBLElBQU8sMEJBQUosSUFBMEIsZ0NBQTdCO0FBQ0UsZUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLGdDQUFmLENBQVAsQ0FERjtPQUFBO2FBR0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2pCLGNBQUEsT0FBQTtBQUFBLFVBQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsQ0FBRCxHQUFBO21CQUFPLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFQO1VBQUEsQ0FBZCxDQUFWLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSx1QkFBRCxDQUF5QixPQUF6QixDQURBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxLQUFELEdBQVMsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsU0FBQyxDQUFELEdBQUE7bUJBQU8sQ0FBQSxLQUFFLENBQUEsYUFBRCxDQUFlLENBQWYsRUFBUjtVQUFBLENBQWQsQ0FIVCxDQUFBO2lCQUlBLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixJQUF2QixFQUxpQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBSmU7SUFBQSxDQW5qQmpCLENBQUE7O0FBQUEsMkJBOGpCQSwyQkFBQSxHQUE2QixTQUFFLHdCQUFGLEdBQUE7QUFDM0IsTUFENEIsSUFBQyxDQUFBLDJCQUFBLHdCQUM3QixDQUFBO2FBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQUQyQjtJQUFBLENBOWpCN0IsQ0FBQTs7QUFBQSwyQkFpa0JBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLG9CQUFBO0FBQUEsTUFBQSxNQUFBLGtEQUEwQixFQUExQixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLHlCQUFSO0FBQ0UsUUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsdUVBQTBELEVBQTFELENBQVQsQ0FERjtPQURBO0FBQUEsTUFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsZ0JBQWYsQ0FKVCxDQUFBO2FBS0EsT0FOZ0I7SUFBQSxDQWprQmxCLENBQUE7O0FBQUEsMkJBeWtCQSxnQkFBQSxHQUFrQixTQUFFLGFBQUYsR0FBQTtBQUNoQixNQURpQixJQUFDLENBQUEsd0NBQUEsZ0JBQWMsRUFDaEMsQ0FBQTthQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDJCQUFkLEVBQTJDLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQTNDLEVBRGdCO0lBQUEsQ0F6a0JsQixDQUFBOztBQUFBLDJCQTRrQkEsNEJBQUEsR0FBOEIsU0FBRSx5QkFBRixHQUFBO0FBQzVCLE1BRDZCLElBQUMsQ0FBQSw0QkFBQSx5QkFDOUIsQ0FBQTthQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDJCQUFkLEVBQTJDLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQTNDLEVBRDRCO0lBQUEsQ0E1a0I5QixDQUFBOztBQUFBLDJCQStrQkEscUJBQUEsR0FBdUIsU0FBRSxrQkFBRixHQUFBO0FBQ3JCLE1BRHNCLElBQUMsQ0FBQSxrREFBQSxxQkFBbUIsRUFDMUMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsMkJBQWQsRUFBMkMsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBM0MsRUFGcUI7SUFBQSxDQS9rQnZCLENBQUE7O0FBQUEsMkJBbWxCQSxzQkFBQSxHQUF3QixTQUFBLEdBQUE7YUFDdEIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBREU7SUFBQSxDQW5sQnhCLENBQUE7O0FBQUEsMkJBc2xCQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSwrQkFBQTtBQUFBLE1BQUEsU0FBQSx1REFBa0MsRUFBbEMsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSw4QkFBUjtBQUNFLFFBQUEsU0FBQSxHQUFZLFNBQVMsQ0FBQyxNQUFWLDRFQUFrRSxFQUFsRSxDQUFaLENBREY7T0FGQTtBQUtBLE1BQUEsSUFBcUIsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBekM7QUFBQSxRQUFBLFNBQUEsR0FBWSxDQUFDLEdBQUQsQ0FBWixDQUFBO09BTEE7QUFPQSxNQUFBLElBQWEsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLElBQUQsR0FBQTtlQUFVLElBQUEsS0FBUSxJQUFsQjtNQUFBLENBQWYsQ0FBYjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BUEE7QUFBQSxNQVNBLE1BQUEsR0FBUyxTQUFTLENBQUMsR0FBVixDQUFjLFNBQUMsR0FBRCxHQUFBO0FBQ3JCLFlBQUEsS0FBQTttRkFBMEMsQ0FBRSxTQUFTLENBQUMsT0FBdEQsQ0FBOEQsS0FBOUQsRUFBcUUsS0FBckUsV0FEcUI7TUFBQSxDQUFkLENBRVQsQ0FBQyxNQUZRLENBRUQsU0FBQyxLQUFELEdBQUE7ZUFBVyxjQUFYO01BQUEsQ0FGQyxDQVRULENBQUE7YUFhQSxDQUFFLFVBQUEsR0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixDQUFELENBQVQsR0FBMkIsSUFBN0IsRUFkbUI7SUFBQSxDQXRsQnJCLENBQUE7O0FBQUEsMkJBc21CQSxpQ0FBQSxHQUFtQyxTQUFFLDhCQUFGLEdBQUE7QUFDakMsTUFEa0MsSUFBQyxDQUFBLGlDQUFBLDhCQUNuQyxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUEzQyxFQUZpQztJQUFBLENBdG1CbkMsQ0FBQTs7QUFBQSwyQkEwbUJBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLGNBQUo7SUFBQSxDQTFtQmhCLENBQUE7O0FBQUEsMkJBNG1CQSxnQkFBQSxHQUFrQixTQUFDLGFBQUQsR0FBQTtBQUNoQixNQUFBLElBQTRCLGFBQUEsS0FBaUIsSUFBQyxDQUFBLGFBQTlDO0FBQUEsZUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixhQUZqQixDQUFBO0FBR0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFKO2VBQ0UsSUFBQyxDQUFBLHNCQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxFQUhGO09BSmdCO0lBQUEsQ0E1bUJsQixDQUFBOztBQUFBLDJCQXFuQkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO0FBQ3RCLE1BQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQVosQ0FBb0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN4RCxjQUFBLFNBQUE7QUFBQSxVQUFBLElBQUEsQ0FBQSxLQUFlLENBQUEsYUFBZjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUVBLFVBQUEsSUFBNEMsdUJBQTVDO0FBQUEsWUFBQyxrQkFBbUIsT0FBQSxDQUFRLFFBQVIsRUFBbkIsZUFBRCxDQUFBO1dBRkE7QUFBQSxVQUlBLFNBQUEsR0FBWSxLQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUpaLENBQUE7aUJBS0EsS0FBQyxDQUFBLFNBQVMsQ0FBQyxvQkFBWCxDQUFnQyxlQUFoQyxFQUFpRCxTQUFqRCxFQU53RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLENBQXRCLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsa0JBQXBCLENBUkEsQ0FBQTthQVNBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFuQixFQVZzQjtJQUFBLENBcm5CeEIsQ0FBQTs7QUFBQSwyQkFpb0JBLHNCQUFBLEdBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLElBQTRDLHVCQUE1QztBQUFBLFFBQUMsa0JBQW1CLE9BQUEsQ0FBUSxRQUFSLEVBQW5CLGVBQUQsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLGtCQUF2QixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsdUJBQVgsQ0FBbUMsQ0FBQyxlQUFELENBQW5DLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxPQUFwQixDQUFBLEVBTHNCO0lBQUEsQ0Fqb0J4QixDQUFBOztBQUFBLDJCQXdvQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFPLElBQUEsSUFBQSxDQUFBLEVBQVA7SUFBQSxDQXhvQmQsQ0FBQTs7QUFBQSwyQkEwb0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLFdBQUE7QUFBQSxNQUFBLElBQU8seUJBQVA7QUFDRSxRQUFBLFFBQWlELE9BQUEsQ0FBUSxZQUFSLENBQWpELEVBQUMsMEJBQUEsaUJBQUQsRUFBb0Isa0NBQUEseUJBQXBCLENBREY7T0FBQTtBQUFBLE1BR0EsSUFBQSxHQUNFO0FBQUEsUUFBQSxZQUFBLEVBQWMsY0FBZDtBQUFBLFFBQ0EsU0FBQSxFQUFXLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FEWDtBQUFBLFFBRUEsT0FBQSxFQUFTLGlCQUZUO0FBQUEsUUFHQSxjQUFBLEVBQWdCLHlCQUhoQjtBQUFBLFFBSUEsaUJBQUEsRUFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixDQUpuQjtBQUFBLFFBS0Esa0JBQUEsRUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUxwQjtPQUpGLENBQUE7QUFXQSxNQUFBLElBQUcsb0NBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyx1QkFBTCxHQUErQixJQUFDLENBQUEsdUJBQWhDLENBREY7T0FYQTtBQWFBLE1BQUEsSUFBRyxvQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLHVCQUFMLEdBQStCLElBQUMsQ0FBQSx1QkFBaEMsQ0FERjtPQWJBO0FBZUEsTUFBQSxJQUFHLHFDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsd0JBQUwsR0FBZ0MsSUFBQyxDQUFBLHdCQUFqQyxDQURGO09BZkE7QUFpQkEsTUFBQSxJQUFHLHNDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMseUJBQUwsR0FBaUMsSUFBQyxDQUFBLHlCQUFsQyxDQURGO09BakJBO0FBbUJBLE1BQUEsSUFBRywwQkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBQyxDQUFBLGFBQXRCLENBREY7T0FuQkE7QUFxQkEsTUFBQSxJQUFHLDBCQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixJQUFDLENBQUEsYUFBdEIsQ0FERjtPQXJCQTtBQXVCQSxNQUFBLElBQUcseUJBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxZQUFMLEdBQW9CLElBQUMsQ0FBQSxZQUFyQixDQURGO09BdkJBO0FBeUJBLE1BQUEsSUFBRyx3QkFBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsSUFBQyxDQUFBLFdBQXBCLENBREY7T0F6QkE7QUEyQkEsTUFBQSxJQUFHLHdCQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsV0FBTCxHQUFtQixJQUFDLENBQUEsV0FBcEIsQ0FERjtPQTNCQTtBQUFBLE1BOEJBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0E5QmYsQ0FBQTtBQWdDQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQSxLQUFkLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFBLENBRGpCLENBREY7T0FoQ0E7YUFvQ0EsS0FyQ1M7SUFBQSxDQTFvQlgsQ0FBQTs7QUFBQSwyQkFpckJBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDJCQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQ0E7QUFBQSxXQUFBLFdBQUE7Z0NBQUE7QUFDRSxRQUFBLEdBQUksQ0FBQSxFQUFBLENBQUosR0FBVSxXQUFXLENBQUMsU0FBWixDQUFBLENBQVYsQ0FERjtBQUFBLE9BREE7YUFHQSxJQUpnQjtJQUFBLENBanJCbEIsQ0FBQTs7d0JBQUE7O01BbEJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-project.coffee
