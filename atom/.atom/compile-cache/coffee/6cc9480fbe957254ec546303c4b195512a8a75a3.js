(function() {
  var CompositeDisposable, EditorControl, Emitter, OutputPanel, PluginManager, ResultItem, ResultsDB, TooltipMessage, dirname, statSync, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  OutputPanel = require('./output-panel/output-panel');

  EditorControl = require('./editor-control').EditorControl;

  TooltipMessage = require('./views/tooltip-view').TooltipMessage;

  ResultsDB = require('./results-db');

  ResultItem = require('./result-item');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  dirname = require('path').dirname;

  statSync = require('fs').statSync;

  PluginManager = (function() {
    function PluginManager(state) {
      this.onResultsUpdated = __bind(this.onResultsUpdated, this);
      this.checkResults = new ResultsDB;
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
    }

    PluginManager.prototype.deactivate = function() {
      var _ref1;
      this.checkResults.destroy();
      this.disposables.dispose();
      if ((_ref1 = this.backend) != null) {
        if (typeof _ref1.shutdownBackend === "function") {
          _ref1.shutdownBackend();
        }
      }
      this.deleteEditorControllers();
      return this.deleteOutputViewPanel();
    };

    PluginManager.prototype.serialize = function() {
      var _ref1;
      return {
        outputView: (_ref1 = this.outputView) != null ? _ref1.serialize() : void 0
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
      var _ref1;
      return (_ref1 = this.outputView) != null ? _ref1.toggle() : void 0;
    };

    PluginManager.prototype.updateEditorsWithResults = function(types) {
      var ed, _i, _len, _ref1, _ref2, _results;
      _ref1 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ed = _ref1[_i];
        _results.push((_ref2 = this.controller(ed)) != null ? typeof _ref2.updateResults === "function" ? _ref2.updateResults(this.checkResults.filter({
          uri: ed.getPath()
        }, types)) : void 0 : void 0);
      }
      return _results;
    };

    PluginManager.prototype.onResultsUpdated = function(callback) {
      return this.checkResults.onDidUpdate(callback);
    };

    PluginManager.prototype.controller = function(editor) {
      var _ref1;
      return (_ref1 = this.controllers) != null ? typeof _ref1.get === "function" ? _ref1.get(editor) : void 0 : void 0;
    };

    PluginManager.prototype.createOutputViewPanel = function(state) {
      return this.outputView = new OutputPanel(state.outputView, this.checkResults);
    };

    PluginManager.prototype.deleteOutputViewPanel = function() {
      this.outputView.destroy();
      return this.outputView = null;
    };

    PluginManager.prototype.addController = function(editor) {
      var controller;
      if (this.controllers.get(editor) == null) {
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
      var _ref1;
      if ((_ref1 = this.controllers.get(editor)) != null) {
        _ref1.deactivate();
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
      var editor, _i, _len, _ref1, _results;
      _ref1 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        _results.push(this.removeController(editor));
      }
      return _results;
    };

    PluginManager.prototype.nextError = function() {
      var _ref1;
      return (_ref1 = this.outputView) != null ? _ref1.showNextError() : void 0;
    };

    PluginManager.prototype.prevError = function() {
      var _ref1;
      return (_ref1 = this.outputView) != null ? _ref1.showPrevError() : void 0;
    };

    return PluginManager;

  })();

  module.exports = {
    PluginManager: PluginManager
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvcGx1Z2luLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVJQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLDZCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUNDLGdCQUFpQixPQUFBLENBQVEsa0JBQVIsRUFBakIsYUFERCxDQUFBOztBQUFBLEVBRUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUZELENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSmIsQ0FBQTs7QUFBQSxFQUtBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUx0QixDQUFBOztBQUFBLEVBTUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BTkQsQ0FBQTs7QUFBQSxFQU9DLFdBQVksT0FBQSxDQUFRLElBQVIsRUFBWixRQVBELENBQUE7O0FBQUEsRUFTTTtBQUNTLElBQUEsdUJBQUMsS0FBRCxHQUFBO0FBQ1gsaUVBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsR0FBQSxDQUFBLFNBQWhCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUZmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLE9BSGYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQTVCLENBSkEs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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/plugin-manager.coffee
