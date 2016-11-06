(function() {
  var HaskellGhcMod, tooltipActions,
    __slice = [].slice;

  tooltipActions = [
    {
      value: '',
      description: 'Nothing'
    }, {
      value: 'type',
      description: 'Type'
    }, {
      value: 'info',
      description: 'Info'
    }, {
      value: 'infoType',
      description: 'Info, fallback to Type'
    }, {
      value: 'typeInfo',
      description: 'Type, fallback to Info'
    }, {
      value: 'typeAndInfo',
      description: 'Type and Info'
    }
  ];

  module.exports = HaskellGhcMod = {
    process: null,
    config: {
      ghcModPath: {
        type: 'string',
        "default": 'ghc-mod',
        description: 'Path to ghc-mod'
      },
      enableGhcModi: {
        type: 'boolean',
        "default": true,
        description: 'Using GHC Modi is suggested and noticeably faster, but if experiencing problems, disabling it can sometimes help.'
      },
      lowMemorySystem: {
        type: 'boolean',
        "default": false,
        description: 'Avoid spawning more than one ghc-mod process; also disables parallel features, which can help with weird stack errors'
      },
      debug: {
        type: 'boolean',
        "default": false
      },
      additionalPathDirectories: {
        type: 'array',
        "default": [],
        description: 'Add this directories to PATH when invoking ghc-mod. You might want to add path to a directory with ghc, cabal, etc binaries here. Separate with comma.',
        items: {
          type: 'string'
        }
      },
      cabalSandbox: {
        type: 'boolean',
        "default": true,
        description: 'Add cabal sandbox bin-path to PATH'
      },
      stackSandbox: {
        type: 'boolean',
        "default": true,
        description: 'Add stack bin-path to PATH'
      },
      initTimeout: {
        type: 'integer',
        description: 'How long to wait for initialization commands (checking GHC and ghc-mod versions, getting stack sandbox) until assuming those hanged and bailing. In seconds.',
        "default": 60,
        minimum: 1
      },
      interactiveInactivityTimeout: {
        type: 'integer',
        description: 'Kill ghc-mod interactive process (ghc-modi) after this number of minutes of inactivity to conserve memory. 0 means never.',
        "default": 60,
        minimum: 0
      },
      interactiveActionTimeout: {
        type: 'integer',
        description: 'Timeout for interactive ghc-mod commands (in seconds). 0 means wait forever.',
        "default": 300,
        minimum: 0
      },
      onSaveCheck: {
        type: "boolean",
        "default": true,
        description: "Check file on save"
      },
      onSaveLint: {
        type: "boolean",
        "default": true,
        description: "Lint file on save"
      },
      onChangeCheck: {
        type: "boolean",
        "default": false,
        description: "Check file on change"
      },
      onChangeLint: {
        type: "boolean",
        "default": false,
        description: "Lint file on change"
      },
      onMouseHoverShow: {
        type: 'string',
        description: 'Contents of tooltip on mouse hover',
        "default": 'typeAndInfo',
        "enum": tooltipActions
      },
      onSelectionShow: {
        type: 'string',
        description: 'Contents of tooltip on selection',
        "default": '',
        "enum": tooltipActions
      },
      useLinter: {
        type: 'boolean',
        "default": false,
        description: 'Use \'linter\' package instead of \'ide-haskell\' to display check and lint results (requires restart)'
      },
      maxBrowseProcesses: {
        type: 'integer',
        "default": 2,
        description: 'Maximum number of parallel ghc-mod browse processes, which are used in autocompletion backend initialization. Note that on larger projects it may require a considerable amount of memory.'
      },
      highlightTooltips: {
        type: 'boolean',
        "default": true,
        description: 'Show highlighting for type/info tooltips'
      },
      highlightMessages: {
        type: 'boolean',
        "default": true,
        description: 'Show highlighting for output panel messages'
      },
      hlintOptions: {
        type: 'array',
        "default": [],
        description: 'Command line options to pass to hlint (comma-separated)'
      },
      experimental: {
        type: 'boolean',
        "default": false,
        description: 'Enable experimentai features, which are expected to land in next release of ghc-mod. ENABLE ONLY IF YOU KNOW WHAT YOU ARE DOING'
      }
    },
    activate: function(state) {
      var CompositeDisposable, GhcModiProcess;
      GhcModiProcess = require('./ghc-mod/ghc-modi-process');
      this.process = new GhcModiProcess;
      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable;
      return this.disposables.add(atom.commands.add('atom-workspace', {
        'haskell-ghc-mod:shutdown-backend': (function(_this) {
          return function() {
            var _ref;
            return (_ref = _this.process) != null ? typeof _ref.killProcess === "function" ? _ref.killProcess() : void 0 : void 0;
          };
        })(this)
      }));
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.process) != null) {
        if (typeof _ref.destroy === "function") {
          _ref.destroy();
        }
      }
      this.process = null;
      this.completionBackend = null;
      if ((_ref1 = this.disposables) != null) {
        if (typeof _ref1.dispose === "function") {
          _ref1.dispose();
        }
      }
      return this.disposables = null;
    },
    provideCompletionBackend: function() {
      var CompletionBackend;
      if (this.process == null) {
        return;
      }
      CompletionBackend = require('./completion-backend/completion-backend');
      if (this.completionBackend == null) {
        this.completionBackend = new CompletionBackend(this.process);
      }
      return this.completionBackend;
    },
    consumeUPI: function(service) {
      var Disposable, UPIConsumer, upiConsumer, upiConsumerDisp;
      if (this.process == null) {
        return;
      }
      UPIConsumer = require('./upi-consumer');
      Disposable = require('atom').Disposable;
      upiConsumer = new UPIConsumer(service, this.process);
      upiConsumerDisp = new Disposable(function() {
        return upiConsumer.destroy();
      });
      this.disposables.add(upiConsumerDisp);
      return upiConsumerDisp;
    },
    provideLinter: function() {
      if (!atom.config.get('haskell-ghc-mod.useLinter')) {
        return;
      }
      return [
        {
          func: 'doCheckBuffer',
          lintOnFly: 'onChangeCheck',
          enabledConf: 'onSaveCheck'
        }, {
          func: 'doLintBuffer',
          lintOnFly: 'onChangeLint',
          enabledConf: 'onSaveLint'
        }
      ].map((function(_this) {
        return function(_arg) {
          var enabledConf, func, lintOnFly, linter;
          func = _arg.func, lintOnFly = _arg.lintOnFly, enabledConf = _arg.enabledConf;
          linter = {
            grammarScopes: ['source.haskell', 'text.tex.latex.haskell'],
            scope: 'file',
            lintOnFly: false,
            lint: function(textEditor) {
              if (_this.process == null) {
                return;
              }
              if (!(atom.config.get("haskell-ghc-mod." + enabledConf) || atom.config.get("haskell-ghc-mod." + lintOnFly))) {
                return;
              }
              if (textEditor.isEmpty()) {
                return;
              }
              return _this.process[func](textEditor.getBuffer(), lintOnFly).then(function(res) {
                return res.map(function(_arg1) {
                  var message, messages, position, severity, uri, _ref;
                  uri = _arg1.uri, position = _arg1.position, message = _arg1.message, severity = _arg1.severity;
                  _ref = message.split(/^(?!\s)/gm), message = _ref[0], messages = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
                  return {
                    type: severity,
                    text: message.replace(/\n+$/, ''),
                    filePath: uri,
                    range: [position, position.translate([0, 1])],
                    trace: messages.map(function(text) {
                      return {
                        type: 'trace',
                        text: text.replace(/\n+$/, '')
                      };
                    })
                  };
                });
              });
            }
          };
          atom.config.observe("haskell-ghc-mod." + lintOnFly, function(value) {
            return linter.lintOnFly = value;
          });
          return linter;
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvaGFza2VsbC1naGMtbW9kLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUNFO0lBQ0U7QUFBQSxNQUFDLEtBQUEsRUFBTyxFQUFSO0FBQUEsTUFBWSxXQUFBLEVBQWEsU0FBekI7S0FERixFQUVFO0FBQUEsTUFBQyxLQUFBLEVBQU8sTUFBUjtBQUFBLE1BQWdCLFdBQUEsRUFBYSxNQUE3QjtLQUZGLEVBR0U7QUFBQSxNQUFDLEtBQUEsRUFBTyxNQUFSO0FBQUEsTUFBZ0IsV0FBQSxFQUFhLE1BQTdCO0tBSEYsRUFJRTtBQUFBLE1BQUMsS0FBQSxFQUFPLFVBQVI7QUFBQSxNQUFvQixXQUFBLEVBQWEsd0JBQWpDO0tBSkYsRUFLRTtBQUFBLE1BQUMsS0FBQSxFQUFPLFVBQVI7QUFBQSxNQUFvQixXQUFBLEVBQWEsd0JBQWpDO0tBTEYsRUFNRTtBQUFBLE1BQUMsS0FBQSxFQUFPLGFBQVI7QUFBQSxNQUF1QixXQUFBLEVBQWEsZUFBcEM7S0FORjtHQURGLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2Y7QUFBQSxJQUFBLE9BQUEsRUFBUyxJQUFUO0FBQUEsSUFFQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxTQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsaUJBRmI7T0FERjtBQUFBLE1BSUEsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/haskell-ghc-mod.coffee
