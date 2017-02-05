(function() {
  var HaskellGhcMod, tooltipActions,
    slice = [].slice;

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
        description: 'Path to ghc-mod',
        order: 0
      },
      enableGhcModi: {
        type: 'boolean',
        "default": true,
        description: 'Using GHC Modi is suggested and noticeably faster, but if experiencing problems, disabling it can sometimes help.',
        order: 70
      },
      lowMemorySystem: {
        type: 'boolean',
        "default": false,
        description: 'Avoid spawning more than one ghc-mod process; also disables parallel features, which can help with weird stack errors',
        order: 70
      },
      debug: {
        type: 'boolean',
        "default": false,
        order: 999
      },
      additionalPathDirectories: {
        type: 'array',
        "default": [],
        description: 'Add this directories to PATH when invoking ghc-mod. You might want to add path to a directory with ghc, cabal, etc binaries here. Separate with comma.',
        items: {
          type: 'string'
        },
        order: 0
      },
      cabalSandbox: {
        type: 'boolean',
        "default": true,
        description: 'Add cabal sandbox bin-path to PATH',
        order: 100
      },
      stackSandbox: {
        type: 'boolean',
        "default": true,
        description: 'Add stack bin-path to PATH',
        order: 100
      },
      initTimeout: {
        type: 'integer',
        description: 'How long to wait for initialization commands (checking GHC and ghc-mod versions, getting stack sandbox) until assuming those hanged and bailing. In seconds.',
        "default": 60,
        minimum: 1,
        order: 50
      },
      interactiveInactivityTimeout: {
        type: 'integer',
        description: 'Kill ghc-mod interactive process (ghc-modi) after this number of minutes of inactivity to conserve memory. 0 means never.',
        "default": 60,
        minimum: 0,
        order: 50
      },
      interactiveActionTimeout: {
        type: 'integer',
        description: 'Timeout for interactive ghc-mod commands (in seconds). 0 means wait forever.',
        "default": 300,
        minimum: 0,
        order: 50
      },
      onSaveCheck: {
        type: "boolean",
        "default": true,
        description: "Check file on save",
        order: 25
      },
      onSaveLint: {
        type: "boolean",
        "default": true,
        description: "Lint file on save",
        order: 25
      },
      onChangeCheck: {
        type: "boolean",
        "default": false,
        description: "Check file on change",
        order: 25
      },
      onChangeLint: {
        type: "boolean",
        "default": false,
        description: "Lint file on change",
        order: 25
      },
      onMouseHoverShow: {
        type: 'string',
        description: 'Contents of tooltip on mouse hover',
        "default": 'typeAndInfo',
        "enum": tooltipActions,
        order: 30
      },
      onSelectionShow: {
        type: 'string',
        description: 'Contents of tooltip on selection',
        "default": '',
        "enum": tooltipActions,
        order: 30
      },
      useLinter: {
        type: 'boolean',
        "default": false,
        description: 'Use \'linter\' package instead of \'ide-haskell\' to display check and lint results (requires restart)',
        order: 75
      },
      maxBrowseProcesses: {
        type: 'integer',
        "default": 2,
        description: 'Maximum number of parallel ghc-mod browse processes, which are used in autocompletion backend initialization. Note that on larger projects it may require a considerable amount of memory.',
        order: 60
      },
      highlightTooltips: {
        type: 'boolean',
        "default": true,
        description: 'Show highlighting for type/info tooltips',
        order: 40
      },
      highlightMessages: {
        type: 'boolean',
        "default": true,
        description: 'Show highlighting for output panel messages',
        order: 40
      },
      hlintOptions: {
        type: 'array',
        "default": [],
        description: 'Command line options to pass to hlint (comma-separated)',
        order: 45
      },
      experimental: {
        type: 'boolean',
        "default": false,
        description: 'Enable experimentai features, which are expected to land in next release of ghc-mod. ENABLE ONLY IF YOU KNOW WHAT YOU ARE DOING',
        order: 999
      },
      suppressGhcPackagePathWarning: {
        type: 'boolean',
        "default": false,
        description: 'Suppress warning about GHC_PACKAGE_PATH environment variable. ENABLE ONLY IF YOU KNOW WHAT YOU ARE DOING.',
        order: 999
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
            var ref;
            return (ref = _this.process) != null ? typeof ref.killProcess === "function" ? ref.killProcess() : void 0 : void 0;
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.process) != null) {
        if (typeof ref.destroy === "function") {
          ref.destroy();
        }
      }
      this.process = null;
      this.completionBackend = null;
      if ((ref1 = this.disposables) != null) {
        if (typeof ref1.dispose === "function") {
          ref1.dispose();
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
        return function(arg) {
          var enabledConf, func, lintOnFly, linter;
          func = arg.func, lintOnFly = arg.lintOnFly, enabledConf = arg.enabledConf;
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
                return res.map(function(arg1) {
                  var message, messages, position, ref, severity, uri;
                  uri = arg1.uri, position = arg1.position, message = arg1.message, severity = arg1.severity;
                  ref = message.split(/^(?!\s)/gm), message = ref[0], messages = 2 <= ref.length ? slice.call(ref, 1) : [];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvaGFza2VsbC1naGMtbW9kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNkJBQUE7SUFBQTs7RUFBQSxjQUFBLEdBQ0U7SUFDRTtNQUFDLEtBQUEsRUFBTyxFQUFSO01BQVksV0FBQSxFQUFhLFNBQXpCO0tBREYsRUFFRTtNQUFDLEtBQUEsRUFBTyxNQUFSO01BQWdCLFdBQUEsRUFBYSxNQUE3QjtLQUZGLEVBR0U7TUFBQyxLQUFBLEVBQU8sTUFBUjtNQUFnQixXQUFBLEVBQWEsTUFBN0I7S0FIRixFQUlFO01BQUMsS0FBQSxFQUFPLFVBQVI7TUFBb0IsV0FBQSxFQUFhLHdCQUFqQztLQUpGLEVBS0U7TUFBQyxLQUFBLEVBQU8sVUFBUjtNQUFvQixXQUFBLEVBQWEsd0JBQWpDO0tBTEYsRUFNRTtNQUFDLEtBQUEsRUFBTyxhQUFSO01BQXVCLFdBQUEsRUFBYSxlQUFwQztLQU5GOzs7RUFTRixNQUFNLENBQUMsT0FBUCxHQUFpQixhQUFBLEdBQ2Y7SUFBQSxPQUFBLEVBQVMsSUFBVDtJQUVBLE1BQUEsRUFDRTtNQUFBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQURUO1FBRUEsV0FBQSxFQUFhLGlCQUZiO1FBR0EsS0FBQSxFQUFPLENBSFA7T0FERjtNQUtBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUNFLG1IQUhGO1FBS0EsS0FBQSxFQUFPLEVBTFA7T0FORjtNQVlBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUNFLHVIQUhGO1FB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LENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbkIsQ0FBWCxDQUpUO29CQUtFLEtBQUEsRUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsSUFBRDs2QkFDbEI7d0JBQUEsSUFBQSxFQUFNLE9BQU47d0JBQ0EsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixFQUFxQixFQUFyQixDQUROOztvQkFEa0IsQ0FBYixDQUxUOztnQkFGTSxDQUFSO2NBRHFELENBQXZEO1lBTEksQ0FITjs7VUFzQkEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGtCQUFBLEdBQW1CLFNBQXZDLEVBQW9ELFNBQUMsS0FBRDttQkFDbEQsTUFBTSxDQUFDLFNBQVAsR0FBbUI7VUFEK0IsQ0FBcEQ7QUFHQSxpQkFBTztRQTNCSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSTjtJQUZhLENBbkxmOztBQVhGIiwic291cmNlc0NvbnRlbnQiOlsidG9vbHRpcEFjdGlvbnMgPVxuICBbXG4gICAge3ZhbHVlOiAnJywgZGVzY3JpcHRpb246ICdOb3RoaW5nJ31cbiAgICB7dmFsdWU6ICd0eXBlJywgZGVzY3JpcHRpb246ICdUeXBlJ31cbiAgICB7dmFsdWU6ICdpbmZvJywgZGVzY3JpcHRpb246ICdJbmZvJ31cbiAgICB7dmFsdWU6ICdpbmZvVHlwZScsIGRlc2NyaXB0aW9uOiAnSW5mbywgZmFsbGJhY2sgdG8gVHlwZSd9XG4gICAge3ZhbHVlOiAndHlwZUluZm8nLCBkZXNjcmlwdGlvbjogJ1R5cGUsIGZhbGxiYWNrIHRvIEluZm8nfVxuICAgIHt2YWx1ZTogJ3R5cGVBbmRJbmZvJywgZGVzY3JpcHRpb246ICdUeXBlIGFuZCBJbmZvJ31cbiAgXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2tlbGxHaGNNb2QgPVxuICBwcm9jZXNzOiBudWxsXG5cbiAgY29uZmlnOlxuICAgIGdoY01vZFBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2doYy1tb2QnXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8gZ2hjLW1vZCdcbiAgICAgIG9yZGVyOiAwXG4gICAgZW5hYmxlR2hjTW9kaTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdVc2luZyBHSEMgTW9kaSBpcyBzdWdnZXN0ZWQgYW5kIG5vdGljZWFibHkgZmFzdGVyLFxuICAgICAgICAgYnV0IGlmIGV4cGVyaWVuY2luZyBwcm9ibGVtcywgZGlzYWJsaW5nIGl0IGNhbiBzb21ldGltZXMgaGVscC4nXG4gICAgICBvcmRlcjogNzBcbiAgICBsb3dNZW1vcnlTeXN0ZW06XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ0F2b2lkIHNwYXduaW5nIG1vcmUgdGhhbiBvbmUgZ2hjLW1vZCBwcm9jZXNzOyBhbHNvIGRpc2FibGVzIHBhcmFsbGVsXG4gICAgICAgIGZlYXR1cmVzLCB3aGljaCBjYW4gaGVscCB3aXRoIHdlaXJkIHN0YWNrIGVycm9ycydcbiAgICAgIG9yZGVyOiA3MFxuICAgIGRlYnVnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDk5OVxuICAgIGFkZGl0aW9uYWxQYXRoRGlyZWN0b3JpZXM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgdGhpcyBkaXJlY3RvcmllcyB0byBQQVRIIHdoZW4gaW52b2tpbmcgZ2hjLW1vZC5cbiAgICAgICAgICAgICAgICAgICAgWW91IG1pZ2h0IHdhbnQgdG8gYWRkIHBhdGggdG8gYSBkaXJlY3Rvcnkgd2l0aFxuICAgICAgICAgICAgICAgICAgICBnaGMsIGNhYmFsLCBldGMgYmluYXJpZXMgaGVyZS5cbiAgICAgICAgICAgICAgICAgICAgU2VwYXJhdGUgd2l0aCBjb21tYS4nXG4gICAgICBpdGVtczpcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIG9yZGVyOiAwXG4gICAgY2FiYWxTYW5kYm94OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ0FkZCBjYWJhbCBzYW5kYm94IGJpbi1wYXRoIHRvIFBBVEgnXG4gICAgICBvcmRlcjogMTAwXG4gICAgc3RhY2tTYW5kYm94OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ0FkZCBzdGFjayBiaW4tcGF0aCB0byBQQVRIJ1xuICAgICAgb3JkZXI6IDEwMFxuICAgIGluaXRUaW1lb3V0OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZXNjcmlwdGlvbjogJ0hvdyBsb25nIHRvIHdhaXQgZm9yIGluaXRpYWxpemF0aW9uIGNvbW1hbmRzIChjaGVja2luZ1xuICAgICAgICAgICAgICAgICAgICBHSEMgYW5kIGdoYy1tb2QgdmVyc2lvbnMsIGdldHRpbmcgc3RhY2sgc2FuZGJveCkgdW50aWxcbiAgICAgICAgICAgICAgICAgICAgYXNzdW1pbmcgdGhvc2UgaGFuZ2VkIGFuZCBiYWlsaW5nLiBJbiBzZWNvbmRzLidcbiAgICAgIGRlZmF1bHQ6IDYwXG4gICAgICBtaW5pbXVtOiAxXG4gICAgICBvcmRlcjogNTBcbiAgICBpbnRlcmFjdGl2ZUluYWN0aXZpdHlUaW1lb3V0OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZXNjcmlwdGlvbjogJ0tpbGwgZ2hjLW1vZCBpbnRlcmFjdGl2ZSBwcm9jZXNzIChnaGMtbW9kaSkgYWZ0ZXIgdGhpc1xuICAgICAgICAgICAgICAgICAgICBudW1iZXIgb2YgbWludXRlcyBvZiBpbmFjdGl2aXR5IHRvIGNvbnNlcnZlIG1lbW9yeS4gMFxuICAgICAgICAgICAgICAgICAgICBtZWFucyBuZXZlci4nXG4gICAgICBkZWZhdWx0OiA2MFxuICAgICAgbWluaW11bTogMFxuICAgICAgb3JkZXI6IDUwXG4gICAgaW50ZXJhY3RpdmVBY3Rpb25UaW1lb3V0OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZXNjcmlwdGlvbjogJ1RpbWVvdXQgZm9yIGludGVyYWN0aXZlIGdoYy1tb2QgY29tbWFuZHMgKGluIHNlY29uZHMpLiAwXG4gICAgICAgICAgICAgICAgICAgIG1lYW5zIHdhaXQgZm9yZXZlci4nXG4gICAgICBkZWZhdWx0OiAzMDBcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIG9yZGVyOiA1MFxuICAgIG9uU2F2ZUNoZWNrOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNoZWNrIGZpbGUgb24gc2F2ZVwiXG4gICAgICBvcmRlcjogMjVcbiAgICBvblNhdmVMaW50OlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpbnQgZmlsZSBvbiBzYXZlXCJcbiAgICAgIG9yZGVyOiAyNVxuICAgIG9uQ2hhbmdlQ2hlY2s6XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNoZWNrIGZpbGUgb24gY2hhbmdlXCJcbiAgICAgIG9yZGVyOiAyNVxuICAgIG9uQ2hhbmdlTGludDpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiTGludCBmaWxlIG9uIGNoYW5nZVwiXG4gICAgICBvcmRlcjogMjVcbiAgICBvbk1vdXNlSG92ZXJTaG93OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29udGVudHMgb2YgdG9vbHRpcCBvbiBtb3VzZSBob3ZlcidcbiAgICAgIGRlZmF1bHQ6ICd0eXBlQW5kSW5mbydcbiAgICAgIGVudW06IHRvb2x0aXBBY3Rpb25zXG4gICAgICBvcmRlcjogMzBcbiAgICBvblNlbGVjdGlvblNob3c6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246ICdDb250ZW50cyBvZiB0b29sdGlwIG9uIHNlbGVjdGlvbidcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBlbnVtOiB0b29sdGlwQWN0aW9uc1xuICAgICAgb3JkZXI6IDMwXG4gICAgdXNlTGludGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdVc2UgXFwnbGludGVyXFwnIHBhY2thZ2UgaW5zdGVhZCBvZiBcXCdpZGUtaGFza2VsbFxcJ1xuICAgICAgICAgICAgICAgICAgICB0byBkaXNwbGF5IGNoZWNrIGFuZCBsaW50IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgKHJlcXVpcmVzIHJlc3RhcnQpJ1xuICAgICAgb3JkZXI6IDc1XG4gICAgbWF4QnJvd3NlUHJvY2Vzc2VzOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyXG4gICAgICBkZXNjcmlwdGlvbjogJ01heGltdW0gbnVtYmVyIG9mIHBhcmFsbGVsIGdoYy1tb2QgYnJvd3NlIHByb2Nlc3Nlcywgd2hpY2hcbiAgICAgICAgICAgICAgICAgICAgYXJlIHVzZWQgaW4gYXV0b2NvbXBsZXRpb24gYmFja2VuZCBpbml0aWFsaXphdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgTm90ZSB0aGF0IG9uIGxhcmdlciBwcm9qZWN0cyBpdCBtYXkgcmVxdWlyZSBhIGNvbnNpZGVyYWJsZVxuICAgICAgICAgICAgICAgICAgICBhbW91bnQgb2YgbWVtb3J5LidcbiAgICAgIG9yZGVyOiA2MFxuICAgIGhpZ2hsaWdodFRvb2x0aXBzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgaGlnaGxpZ2h0aW5nIGZvciB0eXBlL2luZm8gdG9vbHRpcHMnXG4gICAgICBvcmRlcjogNDBcbiAgICBoaWdobGlnaHRNZXNzYWdlczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGhpZ2hsaWdodGluZyBmb3Igb3V0cHV0IHBhbmVsIG1lc3NhZ2VzJ1xuICAgICAgb3JkZXI6IDQwXG4gICAgaGxpbnRPcHRpb25zOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW11cbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWFuZCBsaW5lIG9wdGlvbnMgdG8gcGFzcyB0byBobGludCAoY29tbWEtc2VwYXJhdGVkKSdcbiAgICAgIG9yZGVyOiA0NVxuICAgIGV4cGVyaW1lbnRhbDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIGV4cGVyaW1lbnRhaSBmZWF0dXJlcywgd2hpY2ggYXJlIGV4cGVjdGVkIHRvIGxhbmQgaW5cbiAgICAgICAgICAgICAgICAgICAgbmV4dCByZWxlYXNlIG9mIGdoYy1tb2QuIEVOQUJMRSBPTkxZIElGIFlPVSBLTk9XIFdIQVQgWU9VXG4gICAgICAgICAgICAgICAgICAgIEFSRSBET0lORydcbiAgICAgIG9yZGVyOiA5OTlcbiAgICBzdXBwcmVzc0doY1BhY2thZ2VQYXRoV2FybmluZzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3VwcHJlc3Mgd2FybmluZyBhYm91dCBHSENfUEFDS0FHRV9QQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICAgICAgICAgICAgICAgICAgICBFTkFCTEUgT05MWSBJRiBZT1UgS05PVyBXSEFUIFlPVSBBUkUgRE9JTkcuJ1xuICAgICAgb3JkZXI6IDk5OVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgR2hjTW9kaVByb2Nlc3MgPSByZXF1aXJlICcuL2doYy1tb2QvZ2hjLW1vZGktcHJvY2VzcydcbiAgICBAcHJvY2VzcyA9IG5ldyBHaGNNb2RpUHJvY2Vzc1xuICAgIHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdoYXNrZWxsLWdoYy1tb2Q6c2h1dGRvd24tYmFja2VuZCc6ID0+XG4gICAgICAgIEBwcm9jZXNzPy5raWxsUHJvY2Vzcz8oKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHByb2Nlc3M/LmRlc3Ryb3k/KClcbiAgICBAcHJvY2VzcyA9IG51bGxcbiAgICBAY29tcGxldGlvbkJhY2tlbmQgPSBudWxsXG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlPygpXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gIHByb3ZpZGVDb21wbGV0aW9uQmFja2VuZDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwcm9jZXNzP1xuICAgIENvbXBsZXRpb25CYWNrZW5kID0gcmVxdWlyZSAnLi9jb21wbGV0aW9uLWJhY2tlbmQvY29tcGxldGlvbi1iYWNrZW5kJ1xuICAgIEBjb21wbGV0aW9uQmFja2VuZCA/PSBuZXcgQ29tcGxldGlvbkJhY2tlbmQgQHByb2Nlc3NcbiAgICBAY29tcGxldGlvbkJhY2tlbmRcblxuICBjb25zdW1lVVBJOiAoc2VydmljZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwcm9jZXNzP1xuICAgIFVQSUNvbnN1bWVyID0gcmVxdWlyZSAnLi91cGktY29uc3VtZXInXG4gICAge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICB1cGlDb25zdW1lciA9IG5ldyBVUElDb25zdW1lcihzZXJ2aWNlLCBAcHJvY2VzcylcbiAgICB1cGlDb25zdW1lckRpc3AgPVxuICAgICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgICAgdXBpQ29uc3VtZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCB1cGlDb25zdW1lckRpc3BcbiAgICByZXR1cm4gdXBpQ29uc3VtZXJEaXNwXG5cbiAgcHJvdmlkZUxpbnRlcjogLT5cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCAnaGFza2VsbC1naGMtbW9kLnVzZUxpbnRlcidcbiAgICBbXG4gICAgICBmdW5jOiAnZG9DaGVja0J1ZmZlcidcbiAgICAgIGxpbnRPbkZseTogJ29uQ2hhbmdlQ2hlY2snXG4gICAgICBlbmFibGVkQ29uZjogJ29uU2F2ZUNoZWNrJ1xuICAgICxcbiAgICAgIGZ1bmM6ICdkb0xpbnRCdWZmZXInXG4gICAgICBsaW50T25GbHk6ICdvbkNoYW5nZUxpbnQnXG4gICAgICBlbmFibGVkQ29uZjogJ29uU2F2ZUxpbnQnXG4gICAgXS5tYXAgKHtmdW5jLCBsaW50T25GbHksIGVuYWJsZWRDb25mfSkgPT5cbiAgICAgIGxpbnRlciA9XG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5oYXNrZWxsJywgJ3RleHQudGV4LmxhdGV4Lmhhc2tlbGwnXVxuICAgICAgc2NvcGU6ICdmaWxlJ1xuICAgICAgbGludE9uRmx5OiBmYWxzZVxuICAgICAgbGludDogKHRleHRFZGl0b3IpID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQHByb2Nlc3M/XG4gICAgICAgIHJldHVybiB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KFwiaGFza2VsbC1naGMtbW9kLiN7ZW5hYmxlZENvbmZ9XCIpIG9yXG4gICAgICAgICAgYXRvbS5jb25maWcuZ2V0KFwiaGFza2VsbC1naGMtbW9kLiN7bGludE9uRmx5fVwiKVxuICAgICAgICByZXR1cm4gaWYgdGV4dEVkaXRvci5pc0VtcHR5KClcbiAgICAgICAgQHByb2Nlc3NbZnVuY10odGV4dEVkaXRvci5nZXRCdWZmZXIoKSwgbGludE9uRmx5KS50aGVuIChyZXMpIC0+XG4gICAgICAgICAgcmVzLm1hcCAoe3VyaSwgcG9zaXRpb24sIG1lc3NhZ2UsIHNldmVyaXR5fSkgLT5cbiAgICAgICAgICAgIFttZXNzYWdlLCBtZXNzYWdlcy4uLl0gPSBtZXNzYWdlLnNwbGl0IC9eKD8hXFxzKS9nbVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiBzZXZlcml0eVxuICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgICAgIGZpbGVQYXRoOiB1cmlcbiAgICAgICAgICAgICAgcmFuZ2U6IFtwb3NpdGlvbiwgcG9zaXRpb24udHJhbnNsYXRlIFswLCAxXV1cbiAgICAgICAgICAgICAgdHJhY2U6IG1lc3NhZ2VzLm1hcCAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICB0eXBlOiAndHJhY2UnXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAjIFRPRE86IFJld3JpdGUgdGhpcyBob3JyaWJsZW5lc3NcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgXCJoYXNrZWxsLWdoYy1tb2QuI3tsaW50T25GbHl9XCIsICh2YWx1ZSkgLT5cbiAgICAgICAgbGludGVyLmxpbnRPbkZseSA9IHZhbHVlXG5cbiAgICAgIHJldHVybiBsaW50ZXJcbiJdfQ==
