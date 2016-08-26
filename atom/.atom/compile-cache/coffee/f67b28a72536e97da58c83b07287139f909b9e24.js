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
        'haskell-ghc-mod:show-type': this.typeCommand,
        'haskell-ghc-mod:show-info': this.infoCommand,
        'haskell-ghc-mod:case-split': this.caseSplitCommand,
        'haskell-ghc-mod:go-to-declaration': this.goToDeclCommand,
        'haskell-ghc-mod:show-info-fallback-to-type': this.infoTypeCommand,
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
          label: 'Case Split',
          command: 'haskell-ghc-mod:case-split'
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
      this.insertImportCommand = __bind(this.insertImportCommand, this);
      this.goToDeclCommand = __bind(this.goToDeclCommand, this);
      this.caseSplitCommand = __bind(this.caseSplitCommand, this);
      this.insertTypeCommand = __bind(this.insertTypeCommand, this);
      this.infoTypeCommand = __bind(this.infoTypeCommand, this);
      this.infoCommand = __bind(this.infoCommand, this);
      this.typeCommand = __bind(this.typeCommand, this);
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
      switch (type) {
        case 'mouse':
        case void 0:
          switch (atom.config.get('haskell-ghc-mod.onMouseHoverShow')) {
            case 'Type':
              return this.typeTooltip(editor.getBuffer(), crange);
            case 'Info':
              return this.infoTooltip(editor, crange);
            case 'Info, fallback to Type':
              return this.infoTypeTooltip(editor, crange);
          }
          break;
        case 'selection':
          if (atom.config.get('haskell-ghc-mod.showTypeOnSelection')) {
            return this.typeTooltip(editor.getBuffer(), crange);
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

    UPIConsumer.prototype.typeCommand = function(_arg) {
      var detail, target;
      target = _arg.target, detail = _arg.detail;
      return this.upi.showTooltip({
        editor: target.getModel(),
        detail: detail,
        tooltip: (function(_this) {
          return function(crange) {
            return _this.typeTooltip(target.getModel().getBuffer(), crange);
          };
        })(this)
      });
    };

    UPIConsumer.prototype.infoCommand = function(_arg) {
      var detail, target;
      target = _arg.target, detail = _arg.detail;
      return this.upi.showTooltip({
        editor: target.getModel(),
        detail: detail,
        tooltip: (function(_this) {
          return function(crange) {
            return _this.infoTooltip(target.getModel(), crange);
          };
        })(this)
      });
    };

    UPIConsumer.prototype.infoTypeCommand = function(_arg) {
      var detail, target;
      target = _arg.target, detail = _arg.detail;
      return this.upi.showTooltip({
        editor: target.getModel(),
        detail: detail,
        tooltip: (function(_this) {
          return function(crange) {
            return _this.infoTypeTooltip(target.getModel(), crange);
          };
        })(this)
      });
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
            var col, fn, info, line, range, res, _;
            range = _arg2.range, info = _arg2.info;
            res = /.*-- Defined at (.+):(\d+):(\d+)$/.exec(info);
            if (res == null) {
              return;
            }
            _ = res[0], fn = res[1], line = res[2], col = res[3];
            return atom.workspace.open(fn, {
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

    UPIConsumer.prototype.typeTooltip = function(b, p) {
      return this.process.getTypeInBuffer(b, p).then(function(_arg) {
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
          return _this.typeTooltip(e.getBuffer(), p);
        };
      })(this));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oYXNrZWxsLWdoYy1tb2QvbGliL3VwaS1jb25zdW1lci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTt5SkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsMEJBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwwQkFBQSxZQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxFQUFQO0FBQUEsTUFDQSxPQUFBLEVBQVMsRUFEVDtBQUFBLE1BRUEsSUFBQSxFQUFNLEVBRk47S0FERixDQUFBOztBQUFBLDBCQUtBLFlBQUEsR0FBYywyQ0FMZCxDQUFBOztBQUFBLDBCQU9BLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQ2Q7QUFBQSxRQUFBLDRCQUFBLEVBQThCLElBQUMsQ0FBQSxZQUEvQjtBQUFBLFFBQ0EsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLFdBRDlCO1FBRGM7SUFBQSxDQVBoQixDQUFBOztBQUFBLDBCQVdBLFFBQUEsR0FDRTtNQUNFO0FBQUEsUUFBQyxLQUFBLEVBQU8sT0FBUjtBQUFBLFFBQWlCLE9BQUEsRUFBUyw0QkFBMUI7T0FERixFQUVFO0FBQUEsUUFBQyxLQUFBLEVBQU8sTUFBUjtBQUFBLFFBQWdCLE9BQUEsRUFBUywyQkFBekI7T0FGRjtLQVpGLENBQUE7O0FBQUEsMEJBaUJBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO2FBQ2Y7QUFBQSxRQUFBLDJCQUFBLEVBQTZCLElBQUMsQ0FBQSxXQUE5QjtBQUFBLFFBQ0EsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLFdBRDlCO0FBQUEsUUFFQSw0QkFBQSxF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

//# sourceURL=/home/epse/.atom/packages/haskell-ghc-mod/lib/upi-consumer.coffee
