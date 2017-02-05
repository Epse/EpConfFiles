(function() {
  var CompositeDisposable, ImportListView, UPIConsumer,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      this.typeAndInfoTooltip = bind(this.typeAndInfoTooltip, this);
      this.typeInfoTooltip = bind(this.typeInfoTooltip, this);
      this.infoTypeTooltip = bind(this.infoTypeTooltip, this);
      this.infoTooltip = bind(this.infoTooltip, this);
      this.typeTooltip = bind(this.typeTooltip, this);
      this.insertImportCommand = bind(this.insertImportCommand, this);
      this.goToDeclCommand = bind(this.goToDeclCommand, this);
      this.sigFillCommand = bind(this.sigFillCommand, this);
      this.caseSplitCommand = bind(this.caseSplitCommand, this);
      this.insertTypeCommand = bind(this.insertTypeCommand, this);
      this.tooltipCommand = bind(this.tooltipCommand, this);
      this.lintCommand = bind(this.lintCommand, this);
      this.checkCommand = bind(this.checkCommand, this);
      this.shouldShowTooltip = bind(this.shouldShowTooltip, this);
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
            return this[t + "Tooltip"](editor, crange);
          }
          break;
        case 'selection':
          if (t = atom.config.get('haskell-ghc-mod.onSelectionShow')) {
            return this[t + "Tooltip"](editor, crange);
          }
      }
    };

    UPIConsumer.prototype.checkCommand = function(arg) {
      var currentTarget, editor;
      currentTarget = arg.currentTarget;
      editor = currentTarget.getModel();
      return this.process.doCheckBuffer(editor.getBuffer()).then((function(_this) {
        return function(res) {
          return _this.setMessages(res, ['error', 'warning']);
        };
      })(this));
    };

    UPIConsumer.prototype.lintCommand = function(arg) {
      var currentTarget, editor;
      currentTarget = arg.currentTarget;
      editor = currentTarget.getModel();
      return this.process.doLintBuffer(editor.getBuffer()).then((function(_this) {
        return function(res) {
          return _this.setMessages(res, ['lint']);
        };
      })(this));
    };

    UPIConsumer.prototype.tooltipCommand = function(tooltipfun) {
      return (function(_this) {
        return function(arg) {
          var currentTarget, detail;
          currentTarget = arg.currentTarget, detail = arg.detail;
          return _this.upi.showTooltip({
            editor: currentTarget.getModel(),
            detail: detail,
            tooltip: function(crange) {
              return tooltipfun(currentTarget.getModel(), crange);
            }
          });
        };
      })(this);
    };

    UPIConsumer.prototype.insertTypeCommand = function(arg) {
      var Util, currentTarget, detail, editor;
      currentTarget = arg.currentTarget, detail = arg.detail;
      Util = require('./util');
      editor = currentTarget.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(arg1) {
          var crange, pos;
          crange = arg1.crange, pos = arg1.pos;
          return _this.process.getTypeInBuffer(editor.getBuffer(), crange).then(function(o) {
            var birdTrack, indent, range, ref, scope, symbol, type;
            type = o.type;
            ref = Util.getSymbolAtPoint(editor, pos), scope = ref.scope, range = ref.range, symbol = ref.symbol;
            if (editor.getTextInBufferRange(o.range).match(/[=]/) != null) {
              indent = editor.getTextInBufferRange([[o.range.start.row, 0], o.range.start]);
              if (scope === 'keyword.operator.haskell') {
                symbol = "(" + symbol + ")";
              }
              birdTrack = '';
              if (indexOf.call(editor.scopeDescriptorForBufferPosition(pos).getScopesArray(), 'meta.embedded.haskell') >= 0) {
                birdTrack = indent.slice(0, 2);
                indent = indent.slice(2);
              }
              if (indent.match(/\S/) != null) {
                indent = indent.replace(/\S/g, ' ');
              }
              return editor.setTextInBufferRange([o.range.start, o.range.start], symbol + " :: " + type + "\n" + birdTrack + indent);
            } else if (scope == null) {
              return editor.setTextInBufferRange(o.range, "(" + (editor.getTextInBufferRange(o.range)) + " :: " + type + ")");
            }
          });
        };
      })(this));
    };

    UPIConsumer.prototype.caseSplitCommand = function(arg) {
      var currentTarget, detail, editor;
      currentTarget = arg.currentTarget, detail = arg.detail;
      editor = currentTarget.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(arg1) {
          var crange;
          crange = arg1.crange;
          return _this.process.doCaseSplit(editor.getBuffer(), crange).then(function(res) {
            return res.forEach(function(arg2) {
              var range, replacement;
              range = arg2.range, replacement = arg2.replacement;
              return editor.setTextInBufferRange(range, replacement);
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.sigFillCommand = function(arg) {
      var currentTarget, detail, editor;
      currentTarget = arg.currentTarget, detail = arg.detail;
      editor = currentTarget.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(arg1) {
          var crange;
          crange = arg1.crange;
          return _this.process.doSigFill(editor.getBuffer(), crange).then(function(res) {
            return res.forEach(function(arg2) {
              var body, indent, pos, range, sig, text, type;
              type = arg2.type, range = arg2.range, body = arg2.body;
              sig = editor.getTextInBufferRange(range);
              indent = editor.indentLevelForLine(sig);
              pos = range.end;
              text = "\n" + body;
              return editor.transact(function() {
                var i, len, newrange, ref, results, row;
                if (type === 'instance') {
                  indent += 1;
                  if (!sig.endsWith(' where')) {
                    editor.setTextInBufferRange([range.end, range.end], ' where');
                  }
                }
                newrange = editor.setTextInBufferRange([pos, pos], text);
                ref = newrange.getRows().slice(1);
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                  row = ref[i];
                  results.push(editor.setIndentationForBufferRow(row, indent));
                }
                return results;
              });
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.goToDeclCommand = function(arg) {
      var currentTarget, detail, editor;
      currentTarget = arg.currentTarget, detail = arg.detail;
      editor = currentTarget.getModel();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(arg1) {
          var crange;
          crange = arg1.crange;
          return _this.process.getInfoInBuffer(editor, crange).then(function(arg2) {
            var _, col, fn, info, line, range, res, rootDir;
            range = arg2.range, info = arg2.info;
            res = /.*-- Defined at (.+):(\d+):(\d+)/.exec(info);
            if (res == null) {
              return;
            }
            _ = res[0], fn = res[1], line = res[2], col = res[3];
            rootDir = _this.process.getRootDir(editor.getBuffer());
            return atom.workspace.open(((function() {
              var ref;
              try {
                return (ref = rootDir.getFile(fn).getPath()) != null ? ref : fn;
              } catch (error) {}
            })()), {
              initialLine: parseInt(line) - 1,
              initialColumn: parseInt(col) - 1
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.insertImportCommand = function(arg) {
      var buffer, currentTarget, detail, editor;
      currentTarget = arg.currentTarget, detail = arg.detail;
      editor = currentTarget.getModel();
      buffer = editor.getBuffer();
      return this.upi.withEventRange({
        editor: editor,
        detail: detail
      }, (function(_this) {
        return function(arg1) {
          var crange;
          crange = arg1.crange;
          return _this.process.findSymbolProvidersInBuffer(editor, crange).then(function(lines) {
            return new ImportListView({
              items: lines,
              onConfirmed: function(mod) {
                var piP;
                piP = new Promise(function(resolve) {
                  buffer.backwardsScan(/^(\s*)(import|module)/, function(arg2) {
                    var match, range, stop;
                    match = arg2.match, range = arg2.range, stop = arg2.stop;
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
                  var ref;
                  return editor.setTextInBufferRange([pi.pos, pi.pos], pi.indent + "import " + mod + ((ref = pi.end) != null ? ref : ''));
                });
              }
            });
          });
        };
      })(this));
    };

    UPIConsumer.prototype.typeTooltip = function(e, p) {
      return this.process.getTypeInBuffer(e.getBuffer(), p).then(function(arg) {
        var range, type;
        range = arg.range, type = arg.type;
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
      return this.process.getInfoInBuffer(e, p).then(function(arg) {
        var info, range;
        range = arg.range, info = arg.info;
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
      return Promise.all([typeP, infoP]).then(function(arg) {
        var info, ref, ref1, ref2, type;
        type = arg[0], info = arg[1];
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
            text: "" + ((type != null ? (ref = type.text) != null ? ref.text : void 0 : void 0) ? ':: ' + type.text.text + '\n' : '') + ((ref1 = info != null ? (ref2 = info.text) != null ? ref2.text : void 0 : void 0) != null ? ref1 : ''),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvdXBpLWNvbnN1bWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixjQUFBLEdBQWlCLE9BQUEsQ0FBUSwwQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTswQkFDSixZQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sRUFBUDtNQUNBLE9BQUEsRUFBUyxFQURUO01BRUEsSUFBQSxFQUFNLEVBRk47OzswQkFJRixZQUFBLEdBQWM7OzBCQUVkLGNBQUEsR0FBZ0IsU0FBQTthQUNkO1FBQUEsNEJBQUEsRUFBOEIsSUFBQyxDQUFBLFlBQS9CO1FBQ0EsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLFdBRDlCOztJQURjOzswQkFJaEIsUUFBQSxHQUNFO01BQ0U7UUFBQyxLQUFBLEVBQU8sT0FBUjtRQUFpQixPQUFBLEVBQVMsNEJBQTFCO09BREYsRUFFRTtRQUFDLEtBQUEsRUFBTyxNQUFSO1FBQWdCLE9BQUEsRUFBUywyQkFBekI7T0FGRjs7OzBCQUtGLGVBQUEsR0FBaUIsU0FBQTthQUNmO1FBQUEsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFdBQWpCLENBQTdCO1FBQ0EsMkJBQUEsRUFBNkIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFdBQWpCLENBRDdCO1FBRUEsNEJBQUEsRUFBOEIsSUFBQyxDQUFBLGdCQUYvQjtRQUdBLDBCQUFBLEVBQTRCLElBQUMsQ0FBQSxjQUg3QjtRQUlBLG1DQUFBLEVBQXFDLElBQUMsQ0FBQSxlQUp0QztRQUtBLDRDQUFBLEVBQThDLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxlQUFqQixDQUw5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d0M7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDLEVBREc7T0FBQSxNQUdBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFBLEdBQXFCLEdBQXJCLEdBQXlCLE1BQXpDLENBQUg7ZUFDSCxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBdEIsRUFBOEIsSUFBOUIsQ0FBbUMsQ0FBQyxJQUFwQyxDQUF5QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEdBQUQ7bUJBQ3ZDLEtBQUMsQ0FBQSxXQUFELENBQWEsR0FBYixFQUFrQixDQUFDLE1BQUQsQ0FBbEI7VUFEdUM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDLEVBREc7O0lBUkk7Ozs7O0FBbFJiIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkltcG9ydExpc3RWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9pbXBvcnQtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBVUElDb25zdW1lclxuICBtZXNzYWdlVHlwZXM6XG4gICAgZXJyb3I6IHt9XG4gICAgd2FybmluZzoge31cbiAgICBsaW50OiB7fVxuXG4gIGNvbnRleHRTY29wZTogJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyfj1cImhhc2tlbGxcIl0nXG5cbiAgZ2xvYmFsQ29tbWFuZHM6IC0+XG4gICAgJ2hhc2tlbGwtZ2hjLW1vZDpjaGVjay1maWxlJzogQGNoZWNrQ29tbWFuZFxuICAgICdoYXNrZWxsLWdoYy1tb2Q6bGludC1maWxlJzogQGxpbnRDb21tYW5kXG5cbiAgbWFpbk1lbnU6XG4gICAgW1xuICAgICAge2xhYmVsOiAnQ2hlY2snLCBjb21tYW5kOiAnaGFza2VsbC1naGMtbW9kOmNoZWNrLWZpbGUnfVxuICAgICAge2xhYmVsOiAnTGludCcsIGNvbW1hbmQ6ICdoYXNrZWxsLWdoYy1tb2Q6bGludC1maWxlJ31cbiAgICBdXG5cbiAgY29udGV4dENvbW1hbmRzOiAtPlxuICAgICdoYXNrZWxsLWdoYy1tb2Q6c2hvdy10eXBlJzogQHRvb2x0aXBDb21tYW5kIEB0eXBlVG9vbHRpcFxuICAgICdoYXNrZWxsLWdoYy1tb2Q6c2hvdy1pbmZvJzogQHRvb2x0aXBDb21tYW5kIEBpbmZvVG9vbHRpcFxuICAgICdoYXNrZWxsLWdoYy1tb2Q6Y2FzZS1zcGxpdCc6IEBjYXNlU3BsaXRDb21tYW5kXG4gICAgJ2hhc2tlbGwtZ2hjLW1vZDpzaWctZmlsbCc6IEBzaWdGaWxsQ29tbWFuZFxuICAgICdoYXNrZWxsLWdoYy1tb2Q6Z28tdG8tZGVjbGFyYXRpb24nOiBAZ29Ub0RlY2xDb21tYW5kXG4gICAgJ2hhc2tlbGwtZ2hjLW1vZDpzaG93LWluZm8tZmFsbGJhY2stdG8tdHlwZSc6IEB0b29sdGlwQ29tbWFuZCBAaW5mb1R5cGVUb29sdGlwXG4gICAgJ2hhc2tlbGwtZ2hjLW1vZDpzaG93LXR5cGUtZmFsbGJhY2stdG8taW5mbyc6IEB0b29sdGlwQ29tbWFuZCBAdHlwZUluZm9Ub29sdGlwXG4gICAgJ2hhc2tlbGwtZ2hjLW1vZDpzaG93LXR5cGUtYW5kLWluZm8nOiBAdG9vbHRpcENvbW1hbmQgQHR5cGVBbmRJbmZvVG9vbHRpcFxuICAgICdoYXNrZWxsLWdoYy1tb2Q6aW5zZXJ0LXR5cGUnOiBAaW5zZXJ0VHlwZUNvbW1hbmRcbiAgICAnaGFza2VsbC1naGMtbW9kOmluc2VydC1pbXBvcnQnOiBAaW5zZXJ0SW1wb3J0Q29tbWFuZFxuXG4gIGNvbnRleHRNZW51OlxuICAgIGxhYmVsOiAnZ2hjLW1vZCdcbiAgICBzdWJtZW51OlxuICAgICAgW1xuICAgICAgICB7bGFiZWw6ICdTaG93IFR5cGUnLCBjb21tYW5kOiAnaGFza2VsbC1naGMtbW9kOnNob3ctdHlwZSd9XG4gICAgICAgIHtsYWJlbDogJ1Nob3cgSW5mbycsIGNvbW1hbmQ6ICdoYXNrZWxsLWdoYy1tb2Q6c2hvdy1pbmZvJ31cbiAgICAgICAge2xhYmVsOiAnU2hvdyBUeXBlIEFuZCBJbmZvJywgY29tbWFuZDogJ2hhc2tlbGwtZ2hjLW1vZDpzaG93LXR5cGUtYW5kLWluZm8nfVxuICAgICAgICB7bGFiZWw6ICdDYXNlIFNwbGl0JywgY29tbWFuZDogJ2hhc2tlbGwtZ2hjLW1vZDpjYXNlLXNwbGl0J31cbiAgICAgICAge2xhYmVsOiAnU2lnIEZpbGwnLCBjb21tYW5kOiAnaGFza2VsbC1naGMtbW9kOnNpZy1maWxsJ31cbiAgICAgICAge2xhYmVsOiAnSW5zZXJ0IFR5cGUnLCBjb21tYW5kOiAnaGFza2VsbC1naGMtbW9kOmluc2VydC10eXBlJ31cbiAgICAgICAge2xhYmVsOiAnSW5zZXJ0IEltcG9ydCcsIGNvbW1hbmQ6ICdoYXNrZWxsLWdoYy1tb2Q6aW5zZXJ0LWltcG9ydCd9XG4gICAgICAgIHtsYWJlbDogJ0dvIFRvIERlY2xhcmF0aW9uJywgY29tbWFuZDogJ2hhc2tlbGwtZ2hjLW1vZDpnby10by1kZWNsYXJhdGlvbid9XG4gICAgICBdXG5cbiAgdXBpOiBudWxsXG4gIHByb2Nlc3M6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKHNlcnZpY2UsIEBwcm9jZXNzKSAtPlxuICAgIEB1cGkgPSBzZXJ2aWNlLnJlZ2lzdGVyUGx1Z2luIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHVwaS5zZXRNZXNzYWdlVHlwZXMgQG1lc3NhZ2VUeXBlc1xuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAY29udGV4dFNjb3BlLCBAY29udGV4dENvbW1hbmRzKClcblxuICAgIEB1cGkub25TaG91bGRTaG93VG9vbHRpcCBAc2hvdWxkU2hvd1Rvb2x0aXBcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHByb2Nlc3Mub25CYWNrZW5kQWN0aXZlID0+XG4gICAgICBAdXBpLnNldFN0YXR1cyBzdGF0dXM6ICdwcm9ncmVzcydcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHByb2Nlc3Mub25CYWNrZW5kSWRsZSA9PlxuICAgICAgQHVwaS5zZXRTdGF0dXMgc3RhdHVzOiAncmVhZHknXG5cbiAgICBjbSA9IHt9XG4gICAgY21bQGNvbnRleHRTY29wZV0gPSBbQGNvbnRleHRNZW51XVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb250ZXh0TWVudS5hZGQgY21cblxuICAgIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgJ2hhc2tlbGwtZ2hjLW1vZC51c2VMaW50ZXInXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBjb250ZXh0U2NvcGUsIEBnbG9iYWxDb21tYW5kcygpXG4gICAgICBAdXBpLnNldE1lbnUgJ2doYy1tb2QnLCBAbWFpbk1lbnVcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQHVwaS5vbkRpZFNhdmVCdWZmZXIgKGJ1ZmZlcikgPT5cbiAgICAgICAgQGNoZWNrTGludCBidWZmZXIsICdTYXZlJ1xuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBAdXBpLm9uRGlkU3RvcENoYW5naW5nIChidWZmZXIpID0+XG4gICAgICAgIEBjaGVja0xpbnQgYnVmZmVyLCAnQ2hhbmdlJywgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEB1cGkuc2V0TWVudSAnZ2hjLW1vZCcsIFtcbiAgICAgICAge2xhYmVsOiAnQ2hlY2snLCBjb21tYW5kOiAnbGludGVyOmxpbnQnfVxuICAgICAgXVxuXG4gICAgQHVwaS5zZXRNZW51ICdnaGMtbW9kJywgW1xuICAgICAge2xhYmVsOiAnU3RvcCBCYWNrZW5kJywgY29tbWFuZDogJ2hhc2tlbGwtZ2hjLW1vZDpzaHV0ZG93bi1iYWNrZW5kJ31cbiAgICBdXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQHVwaSA9IG51bGxcbiAgICBAcHJvY2VzcyA9IG51bGxcblxuICBzaG91bGRTaG93VG9vbHRpcDogKGVkaXRvciwgY3JhbmdlLCB0eXBlKSA9PlxuICAgIHN3aXRjaCB0eXBlXG4gICAgICB3aGVuICdtb3VzZScsIHVuZGVmaW5lZFxuICAgICAgICBpZiB0ID0gYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2Qub25Nb3VzZUhvdmVyU2hvdycpXG4gICAgICAgICAgQFtcIiN7dH1Ub29sdGlwXCJdIGVkaXRvciwgY3JhbmdlXG4gICAgICB3aGVuICdzZWxlY3Rpb24nXG4gICAgICAgIGlmIHQgPSBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5vblNlbGVjdGlvblNob3cnKVxuICAgICAgICAgIEBbXCIje3R9VG9vbHRpcFwiXSBlZGl0b3IsIGNyYW5nZVxuXG4gIGNoZWNrQ29tbWFuZDogKHtjdXJyZW50VGFyZ2V0fSkgPT5cbiAgICBlZGl0b3IgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICBAcHJvY2Vzcy5kb0NoZWNrQnVmZmVyKGVkaXRvci5nZXRCdWZmZXIoKSkudGhlbiAocmVzKSA9PlxuICAgICAgQHNldE1lc3NhZ2VzIHJlcywgWydlcnJvcicsICd3YXJuaW5nJ11cblxuICBsaW50Q29tbWFuZDogKHtjdXJyZW50VGFyZ2V0fSkgPT5cbiAgICBlZGl0b3IgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICBAcHJvY2Vzcy5kb0xpbnRCdWZmZXIoZWRpdG9yLmdldEJ1ZmZlcigpKS50aGVuIChyZXMpID0+XG4gICAgICBAc2V0TWVzc2FnZXMgcmVzLCBbJ2xpbnQnXVxuXG4gIHRvb2x0aXBDb21tYW5kOiAodG9vbHRpcGZ1bikgPT5cbiAgICAoe2N1cnJlbnRUYXJnZXQsIGRldGFpbH0pID0+XG4gICAgICBAdXBpLnNob3dUb29sdGlwXG4gICAgICAgIGVkaXRvcjogY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIGRldGFpbDogZGV0YWlsXG4gICAgICAgIHRvb2x0aXA6IChjcmFuZ2UpIC0+XG4gICAgICAgICAgdG9vbHRpcGZ1biBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCksIGNyYW5nZVxuXG4gIGluc2VydFR5cGVDb21tYW5kOiAoe2N1cnJlbnRUYXJnZXQsIGRldGFpbH0pID0+XG4gICAgVXRpbCA9IHJlcXVpcmUgJy4vdXRpbCdcbiAgICBlZGl0b3IgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICBAdXBpLndpdGhFdmVudFJhbmdlIHtlZGl0b3IsIGRldGFpbH0sICh7Y3JhbmdlLCBwb3N9KSA9PlxuICAgICAgQHByb2Nlc3MuZ2V0VHlwZUluQnVmZmVyKGVkaXRvci5nZXRCdWZmZXIoKSwgY3JhbmdlKVxuICAgICAgLnRoZW4gKG8pIC0+XG4gICAgICAgIHt0eXBlfSA9IG9cbiAgICAgICAge3Njb3BlLCByYW5nZSwgc3ltYm9sfSA9IFV0aWwuZ2V0U3ltYm9sQXRQb2ludCBlZGl0b3IsIHBvc1xuICAgICAgICBpZiBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Uoby5yYW5nZSkubWF0Y2goL1s9XS8pP1xuICAgICAgICAgIGluZGVudCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW28ucmFuZ2Uuc3RhcnQucm93LCAwXSwgby5yYW5nZS5zdGFydF0pXG4gICAgICAgICAgc3ltYm9sID0gXCIoI3tzeW1ib2x9KVwiIGlmIHNjb3BlIGlzICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXG4gICAgICAgICAgYmlyZFRyYWNrID0gJydcbiAgICAgICAgICBpZiAnbWV0YS5lbWJlZGRlZC5oYXNrZWxsJyBpbiBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocG9zKS5nZXRTY29wZXNBcnJheSgpXG4gICAgICAgICAgICBiaXJkVHJhY2sgPSBpbmRlbnQuc2xpY2UgMCwgMlxuICAgICAgICAgICAgaW5kZW50ID0gaW5kZW50LnNsaWNlKDIpXG4gICAgICAgICAgaWYgaW5kZW50Lm1hdGNoKC9cXFMvKT9cbiAgICAgICAgICAgIGluZGVudCA9IGluZGVudC5yZXBsYWNlIC9cXFMvZywgJyAnXG4gICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIFtvLnJhbmdlLnN0YXJ0LCBvLnJhbmdlLnN0YXJ0XSxcbiAgICAgICAgICAgIFwiI3tzeW1ib2x9IDo6ICN7dHlwZX1cXG4je2JpcmRUcmFja30je2luZGVudH1cIlxuICAgICAgICBlbHNlIGlmIG5vdCBzY29wZT8gI25laXRoZXIgb3BlcmF0b3Igbm9yIGluZml4XG4gICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIG8ucmFuZ2UsXG4gICAgICAgICAgICBcIigje2VkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShvLnJhbmdlKX0gOjogI3t0eXBlfSlcIlxuXG4gIGNhc2VTcGxpdENvbW1hbmQ6ICh7Y3VycmVudFRhcmdldCwgZGV0YWlsfSkgPT5cbiAgICBlZGl0b3IgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICBAdXBpLndpdGhFdmVudFJhbmdlIHtlZGl0b3IsIGRldGFpbH0sICh7Y3JhbmdlfSkgPT5cbiAgICAgIEBwcm9jZXNzLmRvQ2FzZVNwbGl0KGVkaXRvci5nZXRCdWZmZXIoKSwgY3JhbmdlKVxuICAgICAgLnRoZW4gKHJlcykgLT5cbiAgICAgICAgcmVzLmZvckVhY2ggKHtyYW5nZSwgcmVwbGFjZW1lbnR9KSAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgcmVwbGFjZW1lbnQpXG5cbiAgc2lnRmlsbENvbW1hbmQ6ICh7Y3VycmVudFRhcmdldCwgZGV0YWlsfSkgPT5cbiAgICBlZGl0b3IgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICBAdXBpLndpdGhFdmVudFJhbmdlIHtlZGl0b3IsIGRldGFpbH0sICh7Y3JhbmdlfSkgPT5cbiAgICAgIEBwcm9jZXNzLmRvU2lnRmlsbChlZGl0b3IuZ2V0QnVmZmVyKCksIGNyYW5nZSlcbiAgICAgIC50aGVuIChyZXMpIC0+XG4gICAgICAgIHJlcy5mb3JFYWNoICh7dHlwZSwgcmFuZ2UsIGJvZHl9KSAtPlxuICAgICAgICAgIHNpZyA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBpbmRlbnQgPSBlZGl0b3IuaW5kZW50TGV2ZWxGb3JMaW5lKHNpZylcbiAgICAgICAgICBwb3MgPSByYW5nZS5lbmRcbiAgICAgICAgICB0ZXh0ID0gXCJcXG4je2JvZHl9XCJcbiAgICAgICAgICBlZGl0b3IudHJhbnNhY3QgLT5cbiAgICAgICAgICAgIGlmIHR5cGUgaXMgJ2luc3RhbmNlJ1xuICAgICAgICAgICAgICBpbmRlbnQgKz0gMVxuICAgICAgICAgICAgICB1bmxlc3Mgc2lnLmVuZHNXaXRoICcgd2hlcmUnXG4gICAgICAgICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtyYW5nZS5lbmQsIHJhbmdlLmVuZF0sICcgd2hlcmUnKVxuICAgICAgICAgICAgbmV3cmFuZ2UgPSBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvcywgcG9zXSwgdGV4dClcbiAgICAgICAgICAgIGZvciByb3cgaW4gbmV3cmFuZ2UuZ2V0Um93cygpLnNsaWNlKDEpXG4gICAgICAgICAgICAgIGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyByb3csIGluZGVudFxuXG4gIGdvVG9EZWNsQ29tbWFuZDogKHtjdXJyZW50VGFyZ2V0LCBkZXRhaWx9KSA9PlxuICAgIGVkaXRvciA9IGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgIEB1cGkud2l0aEV2ZW50UmFuZ2Uge2VkaXRvciwgZGV0YWlsfSwgKHtjcmFuZ2V9KSA9PlxuICAgICAgQHByb2Nlc3MuZ2V0SW5mb0luQnVmZmVyKGVkaXRvciwgY3JhbmdlKVxuICAgICAgLnRoZW4gKHtyYW5nZSwgaW5mb30pID0+XG4gICAgICAgIHJlcyA9IC8uKi0tIERlZmluZWQgYXQgKC4rKTooXFxkKyk6KFxcZCspLy5leGVjIGluZm9cbiAgICAgICAgcmV0dXJuIHVubGVzcyByZXM/XG4gICAgICAgIFtfLCBmbiwgbGluZSwgY29sXSA9IHJlc1xuICAgICAgICByb290RGlyID0gQHByb2Nlc3MuZ2V0Um9vdERpcihlZGl0b3IuZ2V0QnVmZmVyKCkpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gKHRyeSByb290RGlyLmdldEZpbGUoZm4pLmdldFBhdGgoKSA/IGZuKSxcbiAgICAgICAgICBpbml0aWFsTGluZTogcGFyc2VJbnQobGluZSkgLSAxXG4gICAgICAgICAgaW5pdGlhbENvbHVtbjogcGFyc2VJbnQoY29sKSAtIDFcblxuICBpbnNlcnRJbXBvcnRDb21tYW5kOiAoe2N1cnJlbnRUYXJnZXQsIGRldGFpbH0pID0+XG4gICAgZWRpdG9yID0gY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgQHVwaS53aXRoRXZlbnRSYW5nZSB7ZWRpdG9yLCBkZXRhaWx9LCAoe2NyYW5nZX0pID0+XG4gICAgICBAcHJvY2Vzcy5maW5kU3ltYm9sUHJvdmlkZXJzSW5CdWZmZXIgZWRpdG9yLCBjcmFuZ2VcbiAgICAgIC50aGVuIChsaW5lcykgLT5cbiAgICAgICAgbmV3IEltcG9ydExpc3RWaWV3XG4gICAgICAgICAgaXRlbXM6IGxpbmVzXG4gICAgICAgICAgb25Db25maXJtZWQ6IChtb2QpIC0+XG4gICAgICAgICAgICBwaVAgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICAgICAgICAgICAgYnVmZmVyLmJhY2t3YXJkc1NjYW4gL14oXFxzKikoaW1wb3J0fG1vZHVsZSkvLCAoe21hdGNoLCByYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgICAgICAgICAgcmVzb2x2ZVxuICAgICAgICAgICAgICAgICAgcG9zOiBidWZmZXIucmFuZ2VGb3JSb3cocmFuZ2Uuc3RhcnQucm93KS5lbmRcbiAgICAgICAgICAgICAgICAgIGluZGVudDpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIG1hdGNoWzJdXG4gICAgICAgICAgICAgICAgICAgICAgd2hlbiBcImltcG9ydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcblwiICsgbWF0Y2hbMV1cbiAgICAgICAgICAgICAgICAgICAgICB3aGVuIFwibW9kdWxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuXFxuXCIgKyBtYXRjaFsxXVxuICAgICAgICAgICAgICByZXNvbHZlXG4gICAgICAgICAgICAgICAgcG9zOiBidWZmZXIuZ2V0Rmlyc3RQb3NpdGlvbigpXG4gICAgICAgICAgICAgICAgaW5kZW50OiBcIlwiXG4gICAgICAgICAgICAgICAgZW5kOiBcIlxcblwiXG4gICAgICAgICAgICBwaVAudGhlbiAocGkpIC0+XG4gICAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSBbcGkucG9zLCBwaS5wb3NdLCBcIiN7cGkuaW5kZW50fWltcG9ydCAje21vZH0je3BpLmVuZCA/ICcnfVwiXG5cbiAgdHlwZVRvb2x0aXA6IChlLCBwKSA9PlxuICAgIEBwcm9jZXNzLmdldFR5cGVJbkJ1ZmZlcihlLmdldEJ1ZmZlcigpLCBwKVxuICAgIC50aGVuICh7cmFuZ2UsIHR5cGV9KSAtPlxuICAgICAgcmFuZ2U6IHJhbmdlXG4gICAgICB0ZXh0OlxuICAgICAgICB0ZXh0OiB0eXBlXG4gICAgICAgIGhpZ2hsaWdodGVyOlxuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1naGMtbW9kLmhpZ2hsaWdodFRvb2x0aXBzJylcbiAgICAgICAgICAgICdoaW50LnR5cGUuaGFza2VsbCdcblxuICBpbmZvVG9vbHRpcDogKGUsIHApID0+XG4gICAgQHByb2Nlc3MuZ2V0SW5mb0luQnVmZmVyKGUsIHApXG4gICAgLnRoZW4gKHtyYW5nZSwgaW5mb30pIC0+XG4gICAgICByYW5nZTogcmFuZ2VcbiAgICAgIHRleHQ6XG4gICAgICAgIHRleHQ6IGluZm9cbiAgICAgICAgaGlnaGxpZ2h0ZXI6XG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuaGlnaGxpZ2h0VG9vbHRpcHMnKVxuICAgICAgICAgICAgJ3NvdXJjZS5oYXNrZWxsJ1xuXG4gIGluZm9UeXBlVG9vbHRpcDogKGUsIHApID0+XG4gICAgYXJncyA9IGFyZ3VtZW50c1xuICAgIEBpbmZvVG9vbHRpcChlLCBwKVxuICAgIC5jYXRjaCA9PlxuICAgICAgQHR5cGVUb29sdGlwKGUsIHApXG5cbiAgdHlwZUluZm9Ub29sdGlwOiAoZSwgcCkgPT5cbiAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgQHR5cGVUb29sdGlwKGUsIHApXG4gICAgLmNhdGNoID0+XG4gICAgICBAaW5mb1Rvb2x0aXAoZSwgcClcblxuICB0eXBlQW5kSW5mb1Rvb2x0aXA6IChlLCBwKSA9PlxuICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICB0eXBlUCA9XG4gICAgICBAdHlwZVRvb2x0aXAoZSwgcCkuY2F0Y2ggLT4gcmV0dXJuIG51bGxcbiAgICBpbmZvUCA9XG4gICAgICBAaW5mb1Rvb2x0aXAoZSwgcCkuY2F0Y2ggLT4gcmV0dXJuIG51bGxcbiAgICBQcm9taXNlLmFsbCBbdHlwZVAsIGluZm9QXVxuICAgIC50aGVuIChbdHlwZSwgaW5mb10pIC0+XG4gICAgICByYW5nZTpcbiAgICAgICAgaWYgdHlwZT8gYW5kIGluZm8/XG4gICAgICAgICAgdHlwZS5yYW5nZS51bmlvbihpbmZvLnJhbmdlKVxuICAgICAgICBlbHNlIGlmIHR5cGU/XG4gICAgICAgICAgdHlwZS5yYW5nZVxuICAgICAgICBlbHNlIGlmIGluZm8/XG4gICAgICAgICAgaW5mby5yYW5nZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdHb3QgbmVpdGhlciB0eXBlIG5vciBpbmZvJylcbiAgICAgIHRleHQ6XG4gICAgICAgIHRleHQ6IFwiI3tpZiB0eXBlPy50ZXh0Py50ZXh0IHRoZW4gJzo6ICcrdHlwZS50ZXh0LnRleHQrJ1xcbicgZWxzZSAnJ30je2luZm8/LnRleHQ/LnRleHQgPyAnJ31cIlxuICAgICAgICBoaWdobGlnaHRlcjpcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hhc2tlbGwtZ2hjLW1vZC5oaWdobGlnaHRUb29sdGlwcycpXG4gICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnXG5cbiAgc2V0SGlnaGxpZ2h0ZXI6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuaGlnaGxpZ2h0TWVzc2FnZXMnKVxuICAgICAgKG0pIC0+XG4gICAgICAgIG0ubWVzc2FnZT1cbiAgICAgICAgICB0ZXh0OiBtLm1lc3NhZ2VcbiAgICAgICAgICBoaWdobGlnaHRlcjogJ2hpbnQubWVzc2FnZS5oYXNrZWxsJ1xuICAgICAgICBtXG4gICAgZWxzZVxuICAgICAgKG0pIC0+IG1cblxuICBzZXRNZXNzYWdlczogKG1lc3NhZ2VzLCB0eXBlcykgLT5cbiAgICBAdXBpLnNldE1lc3NhZ2VzIG1lc3NhZ2VzLm1hcChAc2V0SGlnaGxpZ2h0ZXIoKSksIHR5cGVzXG5cbiAgY2hlY2tMaW50OiAoYnVmZmVyLCBvcHQsIGZhc3QpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiaGFza2VsbC1naGMtbW9kLm9uI3tvcHR9Q2hlY2tcIikgYW5kXG4gICAgICAgYXRvbS5jb25maWcuZ2V0KFwiaGFza2VsbC1naGMtbW9kLm9uI3tvcHR9TGludFwiKVxuICAgICAgQHByb2Nlc3MuZG9DaGVja0FuZExpbnQoYnVmZmVyLCBmYXN0KS50aGVuIChyZXMpID0+XG4gICAgICAgIEBzZXRNZXNzYWdlcyByZXMsIFsnZXJyb3InLCAnd2FybmluZycsICdsaW50J11cbiAgICBlbHNlIGlmIGF0b20uY29uZmlnLmdldChcImhhc2tlbGwtZ2hjLW1vZC5vbiN7b3B0fUNoZWNrXCIpXG4gICAgICBAcHJvY2Vzcy5kb0NoZWNrQnVmZmVyKGJ1ZmZlciwgZmFzdCkudGhlbiAocmVzKSA9PlxuICAgICAgICBAc2V0TWVzc2FnZXMgcmVzLCBbJ2Vycm9yJywgJ3dhcm5pbmcnXVxuICAgIGVsc2UgaWYgYXRvbS5jb25maWcuZ2V0KFwiaGFza2VsbC1naGMtbW9kLm9uI3tvcHR9TGludFwiKVxuICAgICAgQHByb2Nlc3MuZG9MaW50QnVmZmVyKGJ1ZmZlciwgZmFzdCkudGhlbiAocmVzKSA9PlxuICAgICAgICBAc2V0TWVzc2FnZXMgcmVzLCBbJ2xpbnQnXVxuIl19
