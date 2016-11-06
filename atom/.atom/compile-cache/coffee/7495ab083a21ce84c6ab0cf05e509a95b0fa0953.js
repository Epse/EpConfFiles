(function() {
  var PluginManager, mkError,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mkError = function(name, message) {
    var e;
    e = new Error(message);
    e.name = name;
    return e;
  };

  module.exports = PluginManager = (function() {
    function PluginManager(state) {
      this.onResultsUpdated = __bind(this.onResultsUpdated, this);
      var CompositeDisposable, Emitter, ResultsDB, _ref, _ref1;
      ResultsDB = require('./results-db');
      this.checkResults = new ResultsDB;
      _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;
      this.disposables = new CompositeDisposable;
      this.controllers = new WeakMap;
      this.disposables.add(this.emitter = new Emitter);
      this.disposables.add(this.onResultsUpdated((function(_this) {
        return function(_arg) {
          var types;
          types = _arg.types;
          return _this.updateEditorsWithResults(types);
        };
      })(this)));
      this.createOutputViewPanel(state);
      this.subscribeEditorController();
      this.changeParamFs = {};
      this.configParams = (_ref1 = state.configParams) != null ? _ref1 : {};
    }

    PluginManager.prototype.deactivate = function() {
      var _ref;
      this.checkResults.destroy();
      this.disposables.dispose();
      if ((_ref = this.backend) != null) {
        if (typeof _ref.shutdownBackend === "function") {
          _ref.shutdownBackend();
        }
      }
      this.deleteEditorControllers();
      return this.deleteOutputViewPanel();
    };

    PluginManager.prototype.serialize = function() {
      var _ref;
      return {
        outputView: (_ref = this.outputView) != null ? _ref.serialize() : void 0,
        configParams: this.configParams
      };
    };

    PluginManager.prototype.onShouldShowTooltip = function(callback) {
      return this.emitter.on('should-show-tooltip', callback);
    };

    PluginManager.prototype.onWillSaveBuffer = function(callback) {
      return this.emitter.on('will-save-buffer', callback);
    };

    PluginManager.prototype.onDidSaveBuffer = function(callback) {
      return this.emitter.on('did-save-buffer', callback);
    };

    PluginManager.prototype.onDidStopChanging = function(callback) {
      return this.emitter.on('did-stop-changing', callback);
    };

    PluginManager.prototype.togglePanel = function() {
      var _ref;
      return (_ref = this.outputView) != null ? _ref.toggle() : void 0;
    };

    PluginManager.prototype.updateEditorsWithResults = function(types) {
      var ed, _i, _len, _ref, _ref1, _results;
      _ref = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ed = _ref[_i];
        _results.push((_ref1 = this.controller(ed)) != null ? typeof _ref1.updateResults === "function" ? _ref1.updateResults(this.checkResults.filter({
          uri: ed.getPath()
        }, types)) : void 0 : void 0);
      }
      return _results;
    };

    PluginManager.prototype.onResultsUpdated = function(callback) {
      return this.checkResults.onDidUpdate(callback);
    };

    PluginManager.prototype.controller = function(editor) {
      var _ref;
      return (_ref = this.controllers) != null ? typeof _ref.get === "function" ? _ref.get(editor) : void 0 : void 0;
    };

    PluginManager.prototype.createOutputViewPanel = function(state) {
      var OutputPanel;
      OutputPanel = require('./output-panel/output-panel');
      return this.outputView = new OutputPanel(state.outputView, this.checkResults);
    };

    PluginManager.prototype.deleteOutputViewPanel = function() {
      this.outputView.destroy();
      return this.outputView = null;
    };

    PluginManager.prototype.addController = function(editor) {
      var EditorControl, controller;
      if (this.controllers.get(editor) == null) {
        EditorControl = require('./editor-control');
        this.controllers.set(editor, controller = new EditorControl(editor));
        controller.disposables.add(editor.onDidDestroy((function(_this) {
          return function() {
            return _this.removeController(editor);
          };
        })(this)));
        controller.disposables.add(controller.onShouldShowTooltip((function(_this) {
          return function(_arg) {
            var editor, eventType, pos;
            editor = _arg.editor, pos = _arg.pos, eventType = _arg.eventType;
            return _this.emitter.emit('should-show-tooltip', {
              editor: editor,
              pos: pos,
              eventType: eventType
            });
          };
        })(this)));
        controller.disposables.add(controller.onWillSaveBuffer((function(_this) {
          return function(buffer) {
            return _this.emitter.emit('will-save-buffer', buffer);
          };
        })(this)));
        controller.disposables.add(controller.onDidSaveBuffer((function(_this) {
          return function(buffer) {
            return _this.emitter.emit('did-save-buffer', buffer);
          };
        })(this)));
        controller.disposables.add(controller.onDidStopChanging((function(_this) {
          return function(editor) {
            return _this.emitter.emit('did-stop-changing', editor.getBuffer());
          };
        })(this)));
        return controller.updateResults(this.checkResults.filter({
          uri: editor.getPath()
        }));
      }
    };

    PluginManager.prototype.removeController = function(editor) {
      var _ref;
      if ((_ref = this.controllers.get(editor)) != null) {
        _ref.deactivate();
      }
      return this.controllers["delete"](editor);
    };

    PluginManager.prototype.controllerOnGrammar = function(editor, grammar) {
      if (grammar.scopeName.match(/haskell$/)) {
        return this.addController(editor);
      } else {
        return this.removeController(editor);
      }
    };

    PluginManager.prototype.subscribeEditorController = function() {
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this.disposables.add(editor.onDidChangeGrammar(function(grammar) {
            return _this.controllerOnGrammar(editor, grammar);
          }));
          return _this.controllerOnGrammar(editor, editor.getGrammar());
        };
      })(this)));
    };

    PluginManager.prototype.deleteEditorControllers = function() {
      var editor, _i, _len, _ref, _results;
      _ref = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        _results.push(this.removeController(editor));
      }
      return _results;
    };

    PluginManager.prototype.nextError = function() {
      var _ref;
      return (_ref = this.outputView) != null ? _ref.showNextError() : void 0;
    };

    PluginManager.prototype.prevError = function() {
      var _ref;
      return (_ref = this.outputView) != null ? _ref.showPrevError() : void 0;
    };

    PluginManager.prototype.addConfigParam = function(pluginName, specs) {
      var CompositeDisposable, disp, name, spec, _base, _base1, _fn;
      CompositeDisposable = require('atom').CompositeDisposable;
      disp = new CompositeDisposable;
      if ((_base = this.changeParamFs)[pluginName] == null) {
        _base[pluginName] = {};
      }
      if ((_base1 = this.configParams)[pluginName] == null) {
        _base1[pluginName] = {};
      }
      _fn = (function(_this) {
        return function(name, spec) {
          var change, elem, show, _base2;
          if ((_base2 = _this.configParams[pluginName])[name] == null) {
            _base2[name] = spec["default"];
          }
          elem = document.createElement("ide-haskell-param");
          elem.classList.add("ide-haskell-" + pluginName + "-" + name);
          if (spec.displayName == null) {
            spec.displayName = name.charAt(0).toUpperCase() + name.slice(1);
          }
          show = function() {
            elem.innerText = ("" + spec.displayName + ": ") + spec.displayTemplate(_this.configParams[pluginName][name]);
            return typeof spec.onChanged === "function" ? spec.onChanged(_this.configParams[pluginName][name]) : void 0;
          };
          show();
          _this.changeParamFs[pluginName][name] = change = function(resolve, reject) {
            var ParamSelectView;
            ParamSelectView = require('./output-panel/views/param-select-view');
            return new ParamSelectView({
              items: typeof spec.items === 'function' ? spec.items() : spec.items,
              heading: spec.description,
              itemTemplate: spec.itemTemplate,
              itemFilterName: spec.itemFilterName,
              onConfirmed: function(value) {
                _this.configParams[pluginName][name] = value;
                show();
                return typeof resolve === "function" ? resolve(value) : void 0;
              },
              onCancelled: function() {
                return typeof reject === "function" ? reject() : void 0;
              }
            });
          };
          return disp.add(_this.outputView.addPanelControl(elem, {
            events: {
              click: function() {
                return change();
              }
            },
            before: '#progressBar'
          }));
        };
      })(this);
      for (name in specs) {
        spec = specs[name];
        _fn(name, spec);
      }
      return disp;
    };

    PluginManager.prototype.getConfigParam = function(pluginName, name) {
      var _ref, _ref1;
      if (!atom.packages.isPackageActive(pluginName)) {
        return Promise.reject(mkError('PackageInactiveError', "Ide-haskell cannot get parameter " + pluginName + ":" + name + " of inactive package " + pluginName));
      }
      if (((_ref = this.configParams[pluginName]) != null ? _ref[name] : void 0) != null) {
        return Promise.resolve(this.configParams[pluginName][name]);
      } else if (((_ref1 = this.changeParamFs[pluginName]) != null ? _ref1[name] : void 0) != null) {
        return new Promise((function(_this) {
          return function(resolve, reject) {
            return _this.changeParamFs[pluginName][name](resolve, reject);
          };
        })(this));
      } else {
        return Promise.reject(mkError('ParamUndefinedError', "Ide-haskell cannot get parameter " + pluginName + ":" + name + " before it is defined"));
      }
    };

    PluginManager.prototype.setConfigParam = function(pluginName, name, value) {
      var _base, _ref;
      if (!atom.packages.isPackageActive(pluginName)) {
        return Promise.reject(mkError('PackageInactiveError', "Ide-haskell cannot set parameter " + pluginName + ":" + name + " of inactive package " + pluginName));
      }
      if (value != null) {
        if ((_base = this.configParams)[pluginName] == null) {
          _base[pluginName] = {};
        }
        this.configParams[pluginName][name] = value;
        return Promise.resolve(value);
      } else if (((_ref = this.changeParamFs[pluginName]) != null ? _ref[name] : void 0) != null) {
        return new Promise((function(_this) {
          return function(resolve, reject) {
            return _this.changeParamFs[pluginName][name](resolve, reject);
          };
        })(this));
      } else {
        return Promise.reject(mkError('ParamUndefinedError', "Ide-haskell cannot set parameter " + pluginName + ":" + name + " before it is defined"));
      }
    };

    return PluginManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9wbHVnaW4tbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0JBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7QUFDUixRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBUSxJQUFBLEtBQUEsQ0FBTSxPQUFOLENBQVIsQ0FBQTtBQUFBLElBQ0EsQ0FBQyxDQUFDLElBQUYsR0FBUyxJQURULENBQUE7QUFFQSxXQUFPLENBQVAsQ0FIUTtFQUFBLENBQVYsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHVCQUFDLEtBQUQsR0FBQTtBQUNYLGlFQUFBLENBQUE7QUFBQSxVQUFBLG9EQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FBWixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixHQUFBLENBQUEsU0FEaEIsQ0FBQTtBQUFBLE1BR0EsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BSHRCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUpmLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLE9BTGYsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQTVCLENBTkEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/plugin-manager.coffee
