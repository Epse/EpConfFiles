(function() {
  var IdeHaskell;

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
        description: "Path to `stylish-haskell` utility or other prettifier"
      },
      stylishHaskellArguments: {
        type: 'array',
        "default": [],
        description: 'Additional arguments to pass to prettifier; comma-separated',
        items: {
          type: 'string'
        }
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
      var CompositeDisposable, MainMenuLabel, PluginManager, prettifyFile;
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
      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable;
      PluginManager = require('./plugin-manager');
      this.pluginManager = new PluginManager(state);
      this.disposables.add(atom.commands.add('atom-workspace', {
        'ide-haskell:toggle-output': (function(_this) {
          return function() {
            return _this.pluginManager.togglePanel();
          };
        })(this)
      }));
      prettifyFile = require('./binutils/prettify').prettifyFile;
      this.disposables.add(atom.commands.add('atom-text-editor[data-grammar~="haskell"]', {
        'ide-haskell:prettify-file': function(_arg) {
          var target;
          target = _arg.target;
          return prettifyFile(target.getModel());
        },
        'ide-haskell:close-tooltip': (function(_this) {
          return function(_arg) {
            var abortKeyBinding, target, _ref;
            target = _arg.target, abortKeyBinding = _arg.abortKeyBinding;
            if ((_ref = _this.pluginManager.controller(target.getModel())) != null ? typeof _ref.hasTooltips === "function" ? _ref.hasTooltips() : void 0 : void 0) {
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
      MainMenuLabel = require('./utils').MainMenuLabel;
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
      var _ref;
      return (_ref = this.pluginManager) != null ? _ref.serialize() : void 0;
    },
    provideUpi: function() {
      var UPI;
      this.upiProvided = true;
      UPI = require('./upi');
      return new UPI(this.pluginManager);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9pZGUtaGFza2VsbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsVUFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQUEsR0FDZjtBQUFBLElBQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxJQUNBLFdBQUEsRUFBYSxJQURiO0FBQUEsSUFFQSxJQUFBLEVBQU0sSUFGTjtBQUFBLElBSUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDhDQUZiO09BREY7QUFBQSxNQUtBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLCtDQUZiO09BTkY7QUFBQSxNQVNBLHNCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsR0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHFDQUZiO09BVkY7QUFBQSxNQWFBLFlBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFdBQUEsRUFBYSw4SEFEYjtBQUFBLFFBTUEsTUFBQSxFQUFNLENBQUMsY0FBRCxFQUFpQixjQUFqQixFQUFpQyxTQUFqQyxDQU5OO0FBQUEsUUFPQSxTQUFBLEVBQVMsU0FQVDtPQWRGO0FBQUEsTUFzQkEsa0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxpQkFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHVEQUZiO09BdkJGO0FBQUEsTUEwQkEsdUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsNkRBRmI7QUFBQSxRQUdBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FKRjtPQTNCRjtBQUFBLE1BZ0NBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsNkNBRmI7T0FqQ0Y7QUFBQSxNQW9DQSx3QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxtRUFGYjtPQXJDRjtBQUFBLE1BeUNBLGFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxRQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsdUJBRmI7QUFBQSxRQUtBLE1BQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLEtBQW5CLEVBQTBCLE9BQTFCLENBTE47T0ExQ0Y7S0FMRjtBQUFBLElBc0RBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLENBQUUsYUFBRixFQUNFLFlBREYsRUFFRSxrQkFGRixFQUdFLFdBSEYsQ0FJQyxDQUFDLE9BSkYsQ0FJVSxTQUFDLElBQUQsR0FBQTtBQUNSLFFBQUEsSUFBRyw4Q0FBSDtBQUNFLFVBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWlCLGtCQUFBLEdBQWtCLElBQW5DLEVBQTJDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixjQUFBLEdBQWMsSUFBL0IsQ0FBM0MsQ0FBQSxDQURGO1NBQUE7ZUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBbUIsY0FBQSxHQUFjLElBQWpDLEVBSFE7TUFBQSxDQUpWLENBQUEsQ0FBQTtBQVNBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLENBQUg7QUFDRSxRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsRUFBNEMsY0FBNUMsQ0FBQSxDQURGO09BVEE7QUFBQSxNQVlBLENBQUUsWUFBRixFQUNFLGlCQURGLEVBRUUsMkJBRkYsQ0FHQyxDQUFDLE9BSEYsQ0FHVSxTQUFDLElBQUQsR0FBQTtlQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFtQixjQUFBLEdBQWMsSUFBakMsRUFEUTtNQUFBLENBSFYsQ0FaQSxDQUFBO2FBa0JBLFVBQUEsQ0FBVyxDQUFDLFNBQUEsR0FBQTtBQUNWLFlBQUEsc0JBQUE7QUFBQSxRQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFBQSxRQUVBLFNBQUEsR0FBWSxTQUFDLEdBQUQsRUFBTSxNQUFOLEdBQUE7QUFDVixjQUFBLElBQUE7O1lBRGdCLFNBQVM7V0FDekI7aUJBQUE7O0FBQUM7aUJBQUEsUUFBQTt5QkFBQTtBQUNDLGNBQUEsSUFBRyxNQUFBLENBQUEsQ0FBQSxLQUFhLFFBQWhCOzhCQUNFLEVBQUEsR0FDVixNQURVLEdBQ0gsR0FERyxHQUNELENBQUMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLENBQUQsQ0FEQyxHQUN1QixNQUR2QixHQUMyQixDQUFDLFNBQUEsQ0FBVSxDQUFWLEVBQWEsTUFBQSxHQUFPLElBQXBCLENBQUQsR0FGN0I7ZUFBQSxNQUFBOzhCQU1FLEVBQUEsR0FDVixNQURVLEdBQ0gsR0FERyxHQUNELENBQUMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLE1BQWhCLENBQUQsQ0FEQyxHQUN1QixNQUR2QixHQUM0QixDQUFDLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixNQUFoQixDQUFELENBRDVCLEdBQ29ELEtBUHREO2VBREQ7QUFBQTs7Y0FBRCxDQVNRLENBQUMsSUFUVCxDQVNjLElBVGQsRUFEVTtRQUFBLENBRlosQ0FBQTtBQUFBLFFBZUEsQ0FBRSxZQUFGLEVBQ0UsV0FERixFQUVFLFdBRkYsRUFHRSxXQUhGLEVBSUUsNEJBSkYsRUFLRSxhQUxGLEVBTUUsZUFORixDQU9DLENBQUMsT0FQRixDQU9VLFNBQUMsSUFBRCxHQUFBO0FBQ1IsY0FBQSxHQUFBO0FBQUEsVUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFiLENBQTZCO0FBQUEsWUFBQSxPQUFBLEVBQVUsY0FBQSxHQUFjLElBQXhCO1dBQTdCLENBQU4sQ0FBQTtpQkFDQSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsZ0JBQUEsb0JBQUE7QUFBQSxZQURZLGdCQUFBLFVBQVUsa0JBQUEsVUFDdEIsQ0FBQTs7Y0FBQSxPQUFRLENBQUEsUUFBQSxJQUFhO2FBQXJCO21CQUNBLE9BQVEsQ0FBQSxRQUFBLENBQVUsQ0FBQSxVQUFBLENBQWxCLEdBQWlDLGtCQUFBLEdBQWtCLEtBRnpDO1VBQUEsQ0FBWixFQUZRO1FBQUEsQ0FQVixDQWZBLENBQUE7QUFBQSxRQTRCQSxDQUFFLE9BQUYsRUFDRSxPQURGLEVBRUUsTUFGRixFQUdFLGtCQUhGLENBSUMsQ0FBQyxPQUpGLENBSVUsU0FBQyxJQUFELEdBQUE7QUFDUixjQUFBLEdBQUE7QUFBQSxVQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBNkI7QUFBQSxZQUFBLE9BQUEsRUFBVSxjQUFBLEdBQWMsSUFBeEI7V0FBN0IsQ0FBTixDQUFBO2lCQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBQyxJQUFELEdBQUE7QUFDVixnQkFBQSxvQkFBQTtBQUFBLFlBRFksZ0JBQUEsVUFBVSxrQkFBQSxVQUN0QixDQUFBOztjQUFBLE9BQVEsQ0FBQSxRQUFBLElBQWE7YUFBckI7bUJBQ0EsT0FBUSxDQUFBLFFBQUEsQ0FBVSxDQUFBLFVBQUEsQ0FBbEIsR0FBaUMsb0JBQUEsR0FBb0IsS0FGM0M7VUFBQSxDQUFaLEVBRlE7UUFBQSxDQUpWLENBNUJBLENBQUE7QUFBQSxRQXNDQSxFQUFBLEdBQUssU0FBQSxDQUFVLE9BQVYsQ0F0Q0wsQ0FBQTtBQXVDQSxRQUFBLElBQUcsRUFBSDtpQkFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IseUJBQXBCLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsU0FBQyxNQUFELEdBQUE7bUJBQ2xELE1BQU0sQ0FBQyxPQUFQLENBQ1Ysa1JBQUEsR0FJeUMsRUFML0IsRUFEa0Q7VUFBQSxDQUFwRCxFQURGO1NBeENVO01BQUEsQ0FBRCxDQUFYLEVBbURLLElBbkRMLEVBbkJXO0lBQUEsQ0F0RGI7QUFBQSxJQThIQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLCtEQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFrQyxDQUFDLFNBQVMsQ0FBQyxHQUE3QyxDQUFpRCxhQUFqRCxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FKZixDQUFBO0FBTUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsQ0FBSDtBQUNFLFFBQUEsVUFBQSxDQUFXLENBQUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDVixZQUFBLElBQUEsQ0FBQSxLQUFRLENBQUEsV0FBUjtxQkFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLG9HQUE5QixFQUlBO0FBQUEsZ0JBQUEsV0FBQSxFQUFhLElBQWI7ZUFKQSxFQURGO2FBRFU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFELENBQVgsRUFPSyxJQVBMLENBQUEsQ0FERjtPQU5BO0FBQUEsTUFnQkMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQWhCRCxDQUFBO0FBQUEsTUFpQkEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBakJmLENBQUE7QUFBQSxNQW1CQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQW5CaEIsQ0FBQTtBQUFBLE1Bb0JBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQWQsQ0FwQnJCLENBQUE7QUFBQSxNQXVCQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNmO0FBQUEsUUFBQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDM0IsS0FBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQUEsRUFEMkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtPQURlLENBQWpCLENBdkJBLENBQUE7QUFBQSxNQTJCQyxlQUFnQixPQUFBLENBQVEscUJBQVIsRUFBaEIsWUEzQkQsQ0FBQTtBQUFBLE1BNkJBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiwyQ0FBbEIsRUFDRTtBQUFBLFFBQUEsMkJBQUEsRUFBNkIsU0FBQyxJQUFELEdBQUE7QUFDM0IsY0FBQSxNQUFBO0FBQUEsVUFENkIsU0FBRCxLQUFDLE1BQzdCLENBQUE7aUJBQUEsWUFBQSxDQUFhLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBYixFQUQyQjtRQUFBLENBQTdCO0FBQUEsUUFFQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzNCLGdCQUFBLDZCQUFBO0FBQUEsWUFENkIsY0FBQSxRQUFRLHVCQUFBLGVBQ3JDLENBQUE7QUFBQSxZQUFBLHNIQUErQyxDQUFFLCtCQUFqRDtxQkFDRSxLQUFDLENBQUEsYUFBYSxDQUFDLFVBQWYsQ0FBMEIsTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUExQixDQUE0QyxDQUFDLFdBQTdDLENBQUEsRUFERjthQUFBLE1BQUE7NkRBR0UsMkJBSEY7YUFEMkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUY3QjtBQUFBLFFBT0Esd0JBQUEsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLElBQUQsR0FBQTtBQUN4QixnQkFBQSxNQUFBO0FBQUEsWUFEMEIsU0FBRCxLQUFDLE1BQzFCLENBQUE7bUJBQUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsRUFEd0I7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVAxQjtBQUFBLFFBU0Esd0JBQUEsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLElBQUQsR0FBQTtBQUN4QixnQkFBQSxNQUFBO0FBQUEsWUFEMEIsU0FBRCxLQUFDLE1BQzFCLENBQUE7bUJBQUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsRUFEd0I7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVQxQjtPQURGLENBREYsQ0E3QkEsQ0FBQTtBQUFBLE1BMkNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQix5Q0FBbEIsRUFDRTtBQUFBLFFBQUEsMkJBQUEsRUFBNkIsU0FBQyxJQUFELEdBQUE7QUFDM0IsY0FBQSxNQUFBO0FBQUEsVUFENkIsU0FBRCxLQUFDLE1BQzdCLENBQUE7aUJBQUEsWUFBQSxDQUFhLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBYixFQUFnQyxPQUFoQyxFQUQyQjtRQUFBLENBQTdCO09BREYsQ0FERixDQTNDQSxDQUFBO0FBQUEsTUFnREEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFiLENBQWlCLGFBQWpCLEVBQ0U7QUFBQSxRQUFBLDJDQUFBLEVBQ0U7QUFBQSxVQUFBLFFBQUEsRUFBVSwyQkFBVjtTQURGO09BREYsQ0FoREEsQ0FBQTtBQUFBLE1Bb0RDLGdCQUFpQixPQUFBLENBQVEsU0FBUixFQUFqQixhQXBERCxDQUFBO0FBQUEsTUFxREEsSUFBQyxDQUFBLElBQUQsR0FBUSxHQUFBLENBQUEsbUJBckRSLENBQUE7YUFzREEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLENBQWM7UUFDdEI7QUFBQSxVQUFBLEtBQUEsRUFBTyxhQUFQO0FBQUEsVUFDQSxPQUFBLEVBQVU7WUFDUjtBQUFBLGNBQUMsS0FBQSxFQUFPLFVBQVI7QUFBQSxjQUFvQixPQUFBLEVBQVMsMkJBQTdCO2FBRFEsRUFFUjtBQUFBLGNBQUMsS0FBQSxFQUFPLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQVMsMkJBQWpDO2FBRlE7V0FEVjtTQURzQjtPQUFkLENBQVYsRUF2RFE7SUFBQSxDQTlIVjtBQUFBLElBNkxBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFEakIsQ0FBQTtBQUFBLE1BR0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBYixDQUFzQyxhQUF0QyxDQUhBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQVBmLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBVEEsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQVZSLENBQUE7YUFXQSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQVYsQ0FBQSxFQVpVO0lBQUEsQ0E3TFo7QUFBQSxJQTJNQSxTQUFBLEVBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBO3VEQUFjLENBQUUsU0FBaEIsQ0FBQSxXQURTO0lBQUEsQ0EzTVg7QUFBQSxJQThNQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxHQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQWYsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBRE4sQ0FBQTthQUVJLElBQUEsR0FBQSxDQUFJLElBQUMsQ0FBQSxhQUFMLEVBSE07SUFBQSxDQTlNWjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/ide-haskell.coffee
