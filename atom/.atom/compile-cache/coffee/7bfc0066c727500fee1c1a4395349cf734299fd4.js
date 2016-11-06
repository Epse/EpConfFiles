(function() {
  var CompositeDisposable, ImportListView, UPIConsumer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  ImportListView = require('./views/import-list-view');

  module.exports = UPIConsumer = (function() {
    UPIConsumer.prototype.messageTypes = {
      error: {},
      warning: {},
      lint: {}
    };

    UPIConsumer.prototype.contextScope = 'atom-text-editor[data-grammar~="haskell"]';

    UPIConsumer.prototype.globalCommands = function() {
      return {
        'haskell-ghc-mod:check-file': this.checkCommand,
        'haskell-ghc-mod:lint-file': this.lintCommand
      };
    };

    UPIConsumer.prototype.mainMenu = [
      {
        label: 'Check',
        command: 'haskell-ghc-mod:check-file'
      }, {
        label: 'Lint',
        command: 'haskell-ghc-mod:lint-file'
      }
    ];

    UPIConsumer.prototype.contextCommands = function() {
      return {
        'haskell-ghc-mod:show-type': this.tooltipCommand(this.typeTooltip),
        'haskell-ghc-mod:show-info': this.tooltipCommand(this.infoTooltip),
        'haskell-ghc-mod:case-split': this.caseSplitCommand,
        'haskell-ghc-mod:sig-fill': this.sigFillCommand,
        'haskell-ghc-mod:go-to-declaration': this.goToDeclCommand,
        'haskell-ghc-mod:show-info-fallback-to-type': this.tooltipCommand(this.infoTypeTooltip),
        'haskell-ghc-mod:show-type-fallback-to-info': this.tooltipCommand(this.typeInfoTooltip),
        'haskell-ghc-mod:show-type-and-info': this.tooltipCommand(this.typeAndInfoTooltip),
        'haskell-ghc-mod:insert-type': this.insertTypeCommand,
        'haskell-ghc-mod:insert-import': this.insertImportCommand
      };
    };

    UPIConsumer.prototype.contextMenu = {
      label: 'ghc-mod',
      submenu: [
        {
          label: 'Show Type',
          command: 'haskell-ghc-mod:show-type'
        }, {
          label: 'Show Info',
          command: 'haskell-ghc-mod:show-info'
        }, {
          label: 'Show Type And Info',
          command: 'haskell-ghc-mod:show-type-and-info'
        }, {
          label: 'Case Split',
          command: 'haskell-ghc-mod:case-split'
        }, {
          label: 'Sig Fill',
          command: 'haskell-ghc-mod:sig-fill'
        }, {
          label: 'Insert Type',
          command: 'haskell-ghc-mod:insert-type'
        }, {
          label: 'Insert Import',
          command: 'haskell-ghc-mod:insert-import'
        }, {
          label: 'Go To Declaration',
          command: 'haskell-ghc-mod:go-to-declaration'
        }
      ]
    };

    UPIConsumer.prototype.upi = null;

    UPIConsumer.prototype.process = null;

    function UPIConsumer(service, process) {
      var cm;
      this.process = process;
      this.typeAndInfoTooltip = __bind(this.typeAndInfoTooltip, this);
      this.typeInfoTooltip = __bind(this.typeInfoTooltip, this);
      this.infoTypeTooltip = __bind(this.infoTypeTooltip, this);
      this.infoTooltip = __bind(this.infoTooltip, this);
      this.typeTooltip = __bind(this.typeTooltip, this);
      this.insertImportCommand = __bind(this.insertImportCommand, this);
      this.goToDeclCommand = __bind(this.goToDeclCommand, this);
      this.sigFillCommand = __bind(this.sigFillCommand, this);
      this.caseSplitCommand = __bind(this.caseSplitCommand, this);
      this.insertTypeCommand = __bind(this.insertTypeCommand, this);
      this.tooltipCommand = __bind(this.tooltipCommand, this);
      this.lintCommand = __bind(this.lintCommand, this);
      this.checkCommand = __bind(this.checkCommand, this);
      this.shouldShowTooltip = __bind(this.shouldShowTooltip, this);
      this.upi = service.registerPlugin(this.disposables = new CompositeDisposable);
      this.upi.setMessageTypes(this.messageTypes);
      this.disposables.add(atom.commands.add(this.contextScope, this.contextCommands()));
      this.upi.onShouldShowTooltip(this.shouldShowTooltip);
      this.disposables.add(this.process.onBackendActive((function(_this) {
        return function() {
          return _this.upi.setStatus({
            status: 'progress'
          });
        };
      })(this)));
      this.disposables.add(this.process.onBackendIdle((function(_this) {
        return function() {
          return _this.upi.setStatus({
            status: 'ready'
          });
        };
      })(this)));
      cm = {};
      cm[this.contextScope] = [this.contextMenu];
      this.disposables.add(atom.contextMenu.add(cm));
      if (!atom.config.get('haskell-ghc-mod.useLinter')) {
        this.disposables.add(atom.commands.add(this.contextScope, this.globalCommands()));
        this.upi.setMenu('ghc-mod', this.mainMenu);
        this.disposables.add(this.upi.onDidSaveBuffer((function(_this) {
          return function(buffer) {
            return _this.checkLint(buffer, 'Save');
          };
        })(this)));
        this.disposables.add(this.upi.onDidStopChanging((function(_this) {
          return function(buffer) {
            return _this.checkLint(buffer, 'Change', true);
          };
        })(this)));
      } else {
        this.upi.setMenu('ghc-mod', [
          {
            label: 'Check',
            command: 'linter:lint'
          }
        ]);
      }
      this.upi.setMenu('ghc-mod', [
        {
          label: 'Stop Backend',
          command: 'haskell-ghc-mod:shutdown-backend'
        }
      ]);
    }

    UPIConsumer.prototype.destroy = function() {
      this.disposables.dispose();
      this.upi = null;
      return this.process = null;
    };

    UPIConsumer.prototype.shouldShowTooltip = function(editor, crange, type) {
      var t;
      switch (type) {
        case 'mouse':
        case void 0:
          if (t = atom.config.get('haskell-ghc-mod.onMouseHoverShow')) {
            return this["" + t + "Tooltip"](editor, crange);
          }
          break;
        case 'selection':
          if (t = atom.config.get('haskell-ghc-mod.onSelectionShow')) {
            return this["" + t + "Tooltip"](editor, crange);
          }
      }
    };

    UPIConsumer.prototype.checkCommand = function(_arg) {
      var editor, target;
      target = _arg.target;
      editor = target.getModel();
      return this.process.doCheckBuffer(editor.getBuffer()).then((function(_this) {
        return function(res) {
          return _this.setMessages(res, ['error', 'warning']);
        };
      })(this));
    };

    UPIConsumer.prototype.lintCommand = function(_arg) {
      var editor, target;
      target = _arg.target;
      editor = target.getModel();
      return this.process.doLintBuffer(editor.getBuffer()).then((function(_this) {
        return function(res) {
          return _this.setMessages(res, ['lint']);
        };
      })(this));
    };

    UPIConsumer.prototype.tooltipCommand = function(tooltipfun) {
      return (function(_this) {
        return function(_arg) {
          var detail, target;
          target = _arg.target, detail = _arg.detail;
          return _this.upi.showTooltip({
            editor: target.getModel(),
            detail: detail,
            tooltip: function(crange) {
              return tooltipfun(target.getModel(), crange);
            }
          });
        };
      })(this);
    };

    UPIConsumer.prototype.insertTypeCommand = function(_arg) {
      var Util, detail, editor, target;
      target = _arg.target, detail = _arg.detail;
      Util = require('./util');
      editor = target.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(_arg1) {
          var crange, pos;
          crange = _arg1.crange, pos = _arg1.pos;
          return _this.process.getTypeInBuffer(editor.getBuffer(), crange).then(function(o) {
            var birdTrack, indent, range, scope, symbol, type, _ref;
            type = o.type;
            _ref = Util.getSymbolAtPoint(editor, pos), scope = _ref.scope, range = _ref.range, symbol = _ref.symbol;
            if (editor.getTextInBufferRange(o.range).match(/[=]/) != null) {
              indent = editor.getTextInBufferRange([[o.range.start.row, 0], o.range.start]);
              if (scope === 'keyword.operator.haskell') {
                symbol = "(" + symbol + ")";
              }
              birdTrack = '';
              if (__indexOf.call(editor.scopeDescriptorForBufferPosition(pos).getScopesArray(), 'meta.embedded.haskell') >= 0) {
                birdTrack = indent.slice(0, 2);
                indent = indent.slice(2);
              }
              if (indent.match(/\S/) != null) {
                indent = indent.replace(/\S/g, ' ');
              }
              return editor.setTextInBufferRange([o.range.start, o.range.start], "" + symbol + " :: " + type + "\n" + birdTrack + indent);
            } else if (scope == null) {
              return editor.setTextInBufferRange(o.range, "(" + (editor.getTextInBufferRange(o.range)) + " :: " + type + ")");
            }
          });
        };
      })(this));
    };

    UPIConsumer.prototype.caseSplitCommand = function(_arg) {
      var detail, editor, target;
      target = _arg.target, detail = _arg.detail;
      editor = target.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(_arg1) {
          var crange;
          crange = _arg1.crange;
          return _this.process.doCaseSplit(editor.getBuffer(), crange).then(function(res) {
            return res.forEach(function(_arg2) {
              var range, replacement;
              range = _arg2.range, replacement = _arg2.replacement;
              return editor.setTextInBufferRange(range, replacement);
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.sigFillCommand = function(_arg) {
      var detail, editor, target;
      target = _arg.target, detail = _arg.detail;
      editor = target.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(_arg1) {
          var crange;
          crange = _arg1.crange;
          return _this.process.doSigFill(editor.getBuffer(), crange).then(function(res) {
            return res.forEach(function(_arg2) {
              var body, indent, pos, range, sig, text, type;
              type = _arg2.type, range = _arg2.range, body = _arg2.body;
              sig = editor.getTextInBufferRange(range);
              indent = editor.indentLevelForLine(sig);
              pos = range.end;
              text = "\n" + body;
              return editor.transact(function() {
                var newrange, row, _i, _len, _ref, _results;
                if (type === 'instance') {
                  indent += 1;
                  if (!sig.endsWith(' where')) {
                    editor.setTextInBufferRange([range.end, range.end], ' where');
                  }
                }
                newrange = editor.setTextInBufferRange([pos, pos], text);
                _ref = newrange.getRows().slice(1);
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  row = _ref[_i];
                  _results.push(editor.setIndentationForBufferRow(row, indent));
                }
                return _results;
              });
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.goToDeclCommand = function(_arg) {
      var detail, editor, target;
      target = _arg.target, detail = _arg.detail;
      editor = target.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(_arg1) {
          var crange;
          crange = _arg1.crange;
          return _this.process.getInfoInBuffer(editor, crange).then(function(_arg2) {
            var col, fn, info, line, range, res, rootDir, _;
            range = _arg2.range, info = _arg2.info;
            res = /.*-- Defined at (.+):(\d+):(\d+)/.exec(info);
            if (res == null) {
              return;
            }
            _ = res[0], fn = res[1], line = res[2], col = res[3];
            rootDir = _this.process.getRootDir(editor.getBuffer());
            return atom.workspace.open(((function() {
              var _ref;
              try {
                return (_ref = rootDir.getFile(fn).getPath()) != null ? _ref : fn;
              } catch (_error) {}
            })()), {
              initialLine: parseInt(line) - 1,
              initialColumn: parseInt(col) - 1
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.insertImportCommand = function(_arg) {
      var buffer, detail, editor, target;
      target = _arg.target, detail = _arg.detail;
      editor = target.getModel();
      buffer = editor.getBuffer();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(_arg1) {
          var crange;
          crange = _arg1.crange;
          return _this.process.findSymbolProvidersInBuffer(editor, crange).then(function(lines) {
            return new ImportListView({
              items: lines,
              onConfirmed: function(mod) {
                var piP;
                piP = new Promise(function(resolve) {
                  buffer.backwardsScan(/^(\s*)(import|module)/, function(_arg2) {
                    var match, range, stop;
                    match = _arg2.match, range = _arg2.range, stop = _arg2.stop;
                    return resolve({
                      pos: buffer.rangeForRow(range.start.row).end,
                      indent: (function() {
                        switch (match[2]) {
                          case "import":
                            return "\n" + match[1];
                          case "module":
                            return "\n\n" + match[1];
                        }
                      })()
                    });
                  });
                  return resolve({
                    pos: buffer.getFirstPosition(),
                    indent: "",
                    end: "\n"
                  });
                });
                return piP.then(function(pi) {
                  var _ref;
                  return editor.setTextInBufferRange([pi.pos, pi.pos], "" + pi.indent + "import " + mod + ((_ref = pi.end) != null ? _ref : ''));
                });
              }
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.typeTooltip = function(e, p) {
      return this.process.getTypeInBuffer(e.getBuffer(), p).then(function(_arg) {
        var range, type;
        range = _arg.range, type = _arg.type;
        return {
          range: range,
          text: {
            text: type,
            highlighter: atom.config.get('haskell-ghc-mod.highlightTooltips') ? 'hint.type.haskell' : void 0
          }
        };
      });
    };

    UPIConsumer.prototype.infoTooltip = function(e, p) {
      return this.process.getInfoInBuffer(e, p).then(function(_arg) {
        var info, range;
        range = _arg.range, info = _arg.info;
        return {
          range: range,
          text: {
            text: info,
            highlighter: atom.config.get('haskell-ghc-mod.highlightTooltips') ? 'source.haskell' : void 0
          }
        };
      });
    };

    UPIConsumer.prototype.infoTypeTooltip = function(e, p) {
      var args;
      args = arguments;
      return this.infoTooltip(e, p)["catch"]((function(_this) {
        return function() {
          return _this.typeTooltip(e, p);
        };
      })(this));
    };

    UPIConsumer.prototype.typeInfoTooltip = function(e, p) {
      var args;
      args = arguments;
      return this.typeTooltip(e, p)["catch"]((function(_this) {
        return function() {
          return _this.infoTooltip(e, p);
        };
      })(this));
    };

    UPIConsumer.prototype.typeAndInfoTooltip = function(e, p) {
      var args, infoP, typeP;
      args = arguments;
      typeP = this.typeTooltip(e, p)["catch"](function() {
        return null;
      });
      infoP = this.infoTooltip(e, p)["catch"](function() {
        return null;
      });
      return Promise.all([typeP, infoP]).then(function(_arg) {
        var info, type, _ref, _ref1, _ref2;
        type = _arg[0], info = _arg[1];
        return {
          range: (function() {
            if ((type != null) && (info != null)) {
              return type.range.union(info.range);
            } else if (type != null) {
              return type.range;
            } else if (info != null) {
              return info.range;
            } else {
              throw new Error('Got neither type nor info');
            }
          })(),
          text: {
            text: "" + ((type != null ? (_ref = type.text) != null ? _ref.text : void 0 : void 0) ? ':: ' + type.text.text + '\n' : '') + ((_ref1 = info != null ? (_ref2 = info.text) != null ? _ref2.text : void 0 : void 0) != null ? _ref1 : ''),
            highlighter: atom.config.get('haskell-ghc-mod.highlightTooltips') ? 'source.haskell' : void 0
          }
        };
      });
    };

    UPIConsumer.prototype.setHighlighter = function() {
      if (atom.config.get('haskell-ghc-mod.highlightMessages')) {
        return function(m) {
          m.message = {
            text: m.message,
            highlighter: 'hint.message.haskell'
          };
          return m;
        };
      } else {
        return function(m) {
          return m;
        };
      }
    };

    UPIConsumer.prototype.setMessages = function(messages, types) {
      return this.upi.setMessages(messages.map(this.setHighlighter()), types);
    };

    UPIConsumer.prototype.checkLint = function(buffer, opt, fast) {
      if (atom.config.get("haskell-ghc-mod.on" + opt + "Check") && atom.config.get("haskell-ghc-mod.on" + opt + "Lint")) {
        return this.process.doCheckAndLint(buffer, fast).then((function(_this) {
          return function(res) {
            return _this.setMessages(res, ['error', 'warning', 'lint']);
          };
        })(this));
      } else if (atom.config.get("haskell-ghc-mod.on" + opt + "Check")) {
        return this.process.doCheckBuffer(buffer, fast).then((function(_this) {
          return function(res) {
            return _this.setMessages(res, ['error', 'warning']);
          };
        })(this));
      } else if (atom.config.get("haskell-ghc-mod.on" + opt + "Lint")) {
        return this.process.doLintBuffer(buffer, fast).then((function(_this) {
          return function(res) {
            return _this.setMessages(res, ['lint']);
          };
        })(this));
      }
    };

    return UPIConsumer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvdXBpLWNvbnN1bWVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnREFBQTtJQUFBO3lKQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwwQkFBUixDQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBCQUFBLFlBQUEsR0FDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLEVBQVA7QUFBQSxNQUNBLE9BQUEsRUFBUyxFQURUO0FBQUEsTUFFQSxJQUFBLEVBQU0sRUFGTjtLQURGLENBQUE7O0FBQUEsMEJBS0EsWUFBQSxHQUFjLDJDQUxkLENBQUE7O0FBQUEsMEJBT0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7YUFDZDtBQUFBLFFBQUEsNEJBQUEsRUFBOEIsSUFBQyxDQUFBLFlBQS9CO0FBQUEsUUFDQSwyQkFBQSxFQUE2QixJQUFDLENBQUEsV0FEOUI7UUFEYztJQUFBLENBUGhCLENBQUE7O0FBQUEsMEJBV0EsUUFBQSxHQUNFO01BQ0U7QUFBQSxRQUFDLEtBQUEsRUFBTyxPQUFSO0FBQUEsUUFBaUIsT0FBQSxFQUFTLDRCQUExQjtPQURGLEVBRUU7QUFBQSxRQUFDLEtBQUEsRUFBTyxNQUFSO0FBQUEsUUFBZ0IsT0FBQSxFQUFTLDJCQUF6QjtPQUZGO0tBWkYsQ0FBQTs7QUFBQSwwQkFpQkEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZjtBQUFBLFFBQUEsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFdBQWpCLENBQTdCO0FBQUEsUUFDQSwy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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/upi-consumer.coffee
