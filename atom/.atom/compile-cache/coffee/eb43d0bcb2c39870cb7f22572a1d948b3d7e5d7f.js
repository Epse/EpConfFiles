(function() {
  var AutocompleteHaskell, BackendHelper, CompositeDisposable, LastSuggestionView, SuggestionBuilder;

  CompositeDisposable = require('atom').CompositeDisposable;

  SuggestionBuilder = require('./suggestion-builder');

  BackendHelper = require('atom-backend-helper');

  LastSuggestionView = require('./last-suggestion-view');

  module.exports = AutocompleteHaskell = {
    config: {
      completionBackendInfo: {
        type: "boolean",
        "default": true,
        description: "Show info message about haskell-completion-backend service on activation"
      },
      useBackend: {
        type: "string",
        "default": '',
        description: 'Name of backend to use. Leave empty for any. Consult backend provider documentation for name.'
      },
      ingoreMinimumWordLengthForHoleCompletions: {
        type: 'boolean',
        "default": 'true',
        description: 'If enabled, hole completions will be shown on \'_\' keystroke. Otherwise, only when there is a prefix, e.g. \'_something\''
      },
      defaultHintPanelVisibility: {
        type: 'string',
        "default": 'Visible',
        "enum": ['Visible', 'Hidden']
      }
    },
    backend: null,
    disposables: null,
    backendHelperDisp: null,
    activate: function(state) {
      this.backendHelper = new BackendHelper('autocomplete-haskell', {
        main: AutocompleteHaskell,
        backendInfo: 'completionBackendInfo',
        backendName: 'haskell-completion-backend'
      });
      this.backendHelper.init();
      this.disposables = new CompositeDisposable;
      this.globalDisposables = new CompositeDisposable;
      this.globalDisposables.add(this.disposables);
      this.globalDisposables.add(atom.packages.onDidActivatePackage((function(_this) {
        return function(p) {
          var _ref;
          if (p.name !== 'autocomplete-haskell') {
            return;
          }
          return _this.panel = atom.workspace.addBottomPanel({
            item: _this.view = new LastSuggestionView,
            visible: (_ref = state.panelVisible) != null ? _ref : atom.config.get('autocomplete-haskell.defaultHintPanelVisibility') === 'Visible',
            priority: 200
          });
        };
      })(this)));
      this.globalDisposables.add(atom.commands.add('atom-workspace', {
        'autocomplete-haskell:toggle-completion-hint': (function(_this) {
          return function() {
            if (_this.panel.isVisible()) {
              return _this.panel.hide();
            } else {
              return _this.panel.show();
            }
          };
        })(this)
      }));
      return this.globalDisposables.add(atom.menu.add([
        {
          'label': 'Haskell IDE',
          'submenu': [
            {
              'label': 'Toggle Completion Hint Panel',
              'command': 'autocomplete-haskell:toggle-completion-hint'
            }
          ]
        }
      ]));
    },
    serialize: function() {
      return {
        panelVisible: this.panel.isVisible()
      };
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.backendHelperDisp) != null) {
        _ref.dispose();
      }
      this.globalDisposables.dispose();
      this.disposables = null;
      this.globalDisposables = null;
      this.backendHelper = null;
      this.panel.destroy();
      return this.panel = null;
    },
    autocompleteProvider_2_0_0: function() {
      return {
        selector: '.source.haskell',
        disableForSelector: '.source.haskell .comment',
        inclusionPriority: 0,
        getSuggestions: (function(_this) {
          return function(options) {
            if (_this.backend == null) {
              return [];
            }
            return (new SuggestionBuilder(options, _this.backend)).getSuggestions();
          };
        })(this),
        onDidInsertSuggestion: (function(_this) {
          return function(_arg) {
            var editor, suggestion, triggerPosition;
            editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
            return _this.view.setText("" + suggestion.description);
          };
        })(this)
      };
    },
    consumeCompBack: function(service) {
      return this.backendHelperDisp = this.backendHelper.consume(service, {
        success: (function(_this) {
          return function() {
            return _this.disposables.add(atom.workspace.observeTextEditors(function(editor) {
              if (editor.getGrammar().scopeName !== "source.haskell") {
                return;
              }
              return _this.disposables.add(service.registerCompletionBuffer(editor.getBuffer()));
            }));
          };
        })(this),
        dispose: (function(_this) {
          return function() {
            _this.disposables.dispose();
            return _this.disposables = new CompositeDisposable;
          };
        })(this)
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1oYXNrZWxsL2xpYi9hdXRvY29tcGxldGUtaGFza2VsbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUixDQURwQixDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFnQixPQUFBLENBQVEscUJBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQUhyQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsbUJBQUEsR0FDZjtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwwRUFGYjtPQURGO0FBQUEsTUFLQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLCtGQUZiO09BTkY7QUFBQSxNQVVBLHlDQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsTUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDRIQUZiO09BWEY7QUFBQSxNQWVBLDBCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsU0FEVDtBQUFBLFFBRUEsTUFBQSxFQUFNLENBQUMsU0FBRCxFQUFZLFFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/autocomplete-haskell/lib/autocomplete-haskell.coffee
