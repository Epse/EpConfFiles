(function() {
  var CompositeDisposable, IdeHaskell, MainMenuLabel, PluginManager, UPI, getEventType, prettifyFile, _ref;

  PluginManager = require('./plugin-manager').PluginManager;

  _ref = require('./utils'), MainMenuLabel = _ref.MainMenuLabel, getEventType = _ref.getEventType;

  CompositeDisposable = require('atom').CompositeDisposable;

  prettifyFile = require('./binutils/prettify').prettifyFile;

  UPI = require('./upi');

  module.exports = IdeHaskell = {
    pluginManager: null,
    disposables: null,
    menu: null,
    config: {
      onSavePrettify: {
        type: "boolean",
        "default": false,
        description: "Run file through stylish-haskell before save"
      },
      switchTabOnCheck: {
        type: "boolean",
        "default": true,
        description: "Switch to error tab after file check finished"
      },
      expressionTypeInterval: {
        type: "integer",
        "default": 300,
        description: "Type/Info tooltip show delay, in ms"
      },
      onCursorMove: {
        type: 'string',
        description: 'Show check results (error, lint) description tooltips\nwhen text cursor is near marker, close open tooltips, or do\nnothing?',
        "enum": ['Show Tooltip', 'Hide Tooltip', 'Nothing'],
        "default": 'Nothing'
      },
      stylishHaskellPath: {
        type: "string",
        "default": 'stylish-haskell',
        description: "Path to `stylish-haskell` utility"
      },
      cabalPath: {
        type: "string",
        "default": 'cabal',
        description: "Path to `cabal` utility, for `cabal format`"
      },
      startupMessageIdeBackend: {
        type: "boolean",
        "default": true,
        description: "Show info message about haskell-ide-backend service on activation"
      },
      panelPosition: {
        type: 'string',
        "default": 'bottom',
        description: 'Output panel position',
        "enum": ['bottom', 'left', 'top', 'right']
      }
    },
    cleanConfig: function() {
      ['onSaveCheck', 'onSaveLint', 'onMouseHoverShow', 'useLinter'].forEach(function(item) {
        if (atom.config.get("ide-haskell." + item) != null) {
          atom.config.set("haskell-ghc-mod." + item, atom.config.get("ide-haskell." + item));
        }
        return atom.config.unset("ide-haskell." + item);
      });
      if (atom.config.get('ide-haskell.closeTooltipsOnCursorMove')) {
        atom.config.set('ide-haskell.onCursorMove', 'Hide Tooltip');
      }
      ['useBackend', 'useBuildBackend', 'closeTooltipsOnCursorMove'].forEach(function(item) {
        return atom.config.unset("ide-haskell." + item);
      });
      return setTimeout((function() {
        var cs, newconf, serialize;
        newconf = {};
        serialize = function(obj, indent) {
          var k, v;
          if (indent == null) {
            indent = "";
          }
          return ((function() {
            var _results;
            _results = [];
            for (k in obj) {
              v = obj[k];
              if (typeof v === 'object') {
                _results.push("" + indent + "'" + (k.replace(/'/g, '\\\'')) + "':\n" + (serialize(v, indent + '  ')));
              } else {
                _results.push("" + indent + "'" + (k.replace(/'/g, '\\\'')) + "': '" + (v.replace(/'/g, '\\\'')) + "'");
              }
            }
            return _results;
          })()).join('\n');
        };
        ['check-file', 'lint-file', 'show-type', 'show-info', 'show-info-fallback-to-type', 'insert-type', 'insert-import'].forEach(function(item) {
          var kbs;
          kbs = atom.keymaps.findKeyBindings({
            command: "ide-haskell:" + item
          });
          return kbs.forEach(function(_arg) {
            var keystrokes, selector;
            selector = _arg.selector, keystrokes = _arg.keystrokes;
            if (newconf[selector] == null) {
              newconf[selector] = {};
            }
            return newconf[selector][keystrokes] = "haskell-ghc-mod:" + item;
          });
        });
        ['build', 'clean', 'test', 'set-build-target'].forEach(function(item) {
          var kbs;
          kbs = atom.keymaps.findKeyBindings({
            command: "ide-haskell:" + item
          });
          return kbs.forEach(function(_arg) {
            var keystrokes, selector;
            selector = _arg.selector, keystrokes = _arg.keystrokes;
            if (newconf[selector] == null) {
              newconf[selector] = {};
            }
            return newconf[selector][keystrokes] = "ide-haskell-cabal:" + item;
          });
        });
        cs = serialize(newconf);
        if (cs) {
          return atom.workspace.open('ide-haskell-keymap.cson').then(function(editor) {
            return editor.setText("# This is ide-haskell system message\n# Most keybinding commands have been moved to backend packages\n# Please add the following to your keymap\n# in order to preserve existing keybindings.\n# This message won't be shown once there are no obsolete keybindings\n# anymore\n" + cs);
          });
        }
      }), 1000);
    },
    activate: function(state) {
      this.cleanConfig();
      atom.views.getView(atom.workspace).classList.add('ide-haskell');
      this.upiProvided = false;
      if (atom.config.get('ide-haskell.startupMessageIdeBackend')) {
        setTimeout(((function(_this) {
          return function() {
            if (!_this.upiProvided) {
              return atom.notifications.addWarning("Ide-Haskell needs backends that provide most of functionality.\nPlease refer to README for details", {
                dismissable: true
              });
            }
          };
        })(this)), 5000);
      }
      this.disposables = new CompositeDisposable;
      this.pluginManager = new PluginManager(state);
      this.disposables.add(atom.commands.add('atom-workspace', {
        'ide-haskell:toggle-output': (function(_this) {
          return function() {
            return _this.pluginManager.togglePanel();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor[data-grammar~="haskell"]', {
        'ide-haskell:prettify-file': function(_arg) {
          var target;
          target = _arg.target;
          return prettifyFile(target.getModel());
        },
        'ide-haskell:close-tooltip': (function(_this) {
          return function(_arg) {
            var abortKeyBinding, target, _ref1;
            target = _arg.target, abortKeyBinding = _arg.abortKeyBinding;
            if ((_ref1 = _this.pluginManager.controller(target.getModel())) != null ? typeof _ref1.hasTooltips === "function" ? _ref1.hasTooltips() : void 0 : void 0) {
              return _this.pluginManager.controller(target.getModel()).hideTooltip();
            } else {
              return typeof abortKeyBinding === "function" ? abortKeyBinding() : void 0;
            }
          };
        })(this),
        'ide-haskell:next-error': (function(_this) {
          return function(_arg) {
            var target;
            target = _arg.target;
            return _this.pluginManager.nextError();
          };
        })(this),
        'ide-haskell:prev-error': (function(_this) {
          return function(_arg) {
            var target;
            target = _arg.target;
            return _this.pluginManager.prevError();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor[data-grammar~="cabal"]', {
        'ide-haskell:prettify-file': function(_arg) {
          var target;
          target = _arg.target;
          return prettifyFile(target.getModel(), 'cabal');
        }
      }));
      atom.keymaps.add('ide-haskell', {
        'atom-text-editor[data-grammar~="haskell"]': {
          'escape': 'ide-haskell:close-tooltip'
        }
      });
      this.menu = new CompositeDisposable;
      return this.menu.add(atom.menu.add([
        {
          label: MainMenuLabel,
          submenu: [
            {
              label: 'Prettify',
              command: 'ide-haskell:prettify-file'
            }, {
              label: 'Toggle Panel',
              command: 'ide-haskell:toggle-output'
            }
          ]
        }
      ]));
    },
    deactivate: function() {
      this.pluginManager.deactivate();
      this.pluginManager = null;
      atom.keymaps.removeBindingsFromSource('ide-haskell');
      this.disposables.dispose();
      this.disposables = null;
      this.menu.dispose();
      this.menu = null;
      return atom.menu.update();
    },
    serialize: function() {
      var _ref1;
      return (_ref1 = this.pluginManager) != null ? _ref1.serialize() : void 0;
    },
    provideUpi: function() {
      this.upiProvided = true;
      return new UPI(this.pluginManager);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvaWRlLWhhc2tlbGwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBOztBQUFBLEVBQUMsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUixFQUFqQixhQUFELENBQUE7O0FBQUEsRUFDQSxPQUFnQyxPQUFBLENBQVEsU0FBUixDQUFoQyxFQUFDLHFCQUFBLGFBQUQsRUFBZ0Isb0JBQUEsWUFEaEIsQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBR0MsZUFBZ0IsT0FBQSxDQUFRLHFCQUFSLEVBQWhCLFlBSEQsQ0FBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUpOLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFBLEdBQ2Y7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFDQSxXQUFBLEVBQWEsSUFEYjtBQUFBLElBRUEsSUFBQSxFQUFNLElBRk47QUFBQSxJQUlBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw4Q0FGYjtPQURGO0FBQUEsTUFLQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQU5GO0FBQUEsTUFTQSxzQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEdBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxxQ0FGYjtP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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/ide-haskell.coffee
