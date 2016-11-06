(function() {
  var CompositeDisposable, basicConfig, config;

  CompositeDisposable = require("atom").CompositeDisposable;

  config = require("./config");

  basicConfig = require("./config-basic");

  module.exports = {
    config: basicConfig,
    modules: {},
    disposables: null,
    activate: function() {
      this.disposables = new CompositeDisposable();
      this.registerWorkspaceCommands();
      return this.registerEditorCommands();
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.disposables) != null) {
        _ref.dispose();
      }
      this.disposables = null;
      return this.modules = {};
    },
    registerWorkspaceCommands: function() {
      var workspaceCommands;
      workspaceCommands = {};
      ["draft", "post"].forEach((function(_this) {
        return function(file) {
          return workspaceCommands["markdown-writer:new-" + file] = _this.registerView("./views/new-" + file + "-view", {
            optOutGrammars: true
          });
        };
      })(this));
      ["open-cheat-sheet", "create-default-keymaps", "create-project-configs"].forEach((function(_this) {
        return function(command) {
          return workspaceCommands["markdown-writer:" + command] = _this.registerCommand("./commands/" + command, {
            optOutGrammars: true
          });
        };
      })(this));
      return this.disposables.add(atom.commands.add("atom-workspace", workspaceCommands));
    },
    registerEditorCommands: function() {
      var editorCommands;
      editorCommands = {};
      ["tags", "categories"].forEach((function(_this) {
        return function(attr) {
          return editorCommands["markdown-writer:manage-post-" + attr] = _this.registerView("./views/manage-post-" + attr + "-view");
        };
      })(this));
      ["link", "footnote", "image", "table"].forEach((function(_this) {
        return function(media) {
          return editorCommands["markdown-writer:insert-" + media] = _this.registerView("./views/insert-" + media + "-view");
        };
      })(this));
      ["code", "codeblock", "bold", "italic", "keystroke", "strikethrough"].forEach((function(_this) {
        return function(style) {
          return editorCommands["markdown-writer:toggle-" + style + "-text"] = _this.registerCommand("./commands/style-text", {
            args: style
          });
        };
      })(this));
      ["h1", "h2", "h3", "h4", "h5", "ul", "ol", "task", "taskdone", "blockquote"].forEach((function(_this) {
        return function(style) {
          return editorCommands["markdown-writer:toggle-" + style] = _this.registerCommand("./commands/style-line", {
            args: style
          });
        };
      })(this));
      ["previous-heading", "next-heading", "next-table-cell", "reference-definition"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:jump-to-" + command] = _this.registerCommand("./commands/jump-to", {
            args: command
          });
        };
      })(this));
      ["insert-new-line", "indent-list-line"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/edit-line", {
            args: command,
            skipList: ["autocomplete-active"]
          });
        };
      })(this));
      ["correct-order-list-numbers", "format-table"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/format-text", {
            args: command
          });
        };
      })(this));
      ["publish-draft", "open-link-in-browser"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/" + command);
        };
      })(this));
      return this.disposables.add(atom.commands.add("atom-text-editor", editorCommands));
    },
    registerView: function(path, options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(e) {
          var moduleInstance, _base;
          if ((options.optOutGrammars || _this.isMarkdown()) && !_this.inSkipList(options.skipList)) {
            if ((_base = _this.modules)[path] == null) {
              _base[path] = require(path);
            }
            moduleInstance = new _this.modules[path](options.args);
            if (config.get("_skipAction") == null) {
              return moduleInstance.display();
            }
          } else {
            return e.abortKeyBinding();
          }
        };
      })(this);
    },
    registerCommand: function(path, options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(e) {
          var moduleInstance, _base;
          if ((options.optOutGrammars || _this.isMarkdown()) && !_this.inSkipList(options.skipList)) {
            if ((_base = _this.modules)[path] == null) {
              _base[path] = require(path);
            }
            moduleInstance = new _this.modules[path](options.args);
            if (config.get("_skipAction") == null) {
              return moduleInstance.trigger(e);
            }
          } else {
            return e.abortKeyBinding();
          }
        };
      })(this);
    },
    isMarkdown: function() {
      var editor, grammars;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      grammars = config.get("grammars") || [];
      return grammars.indexOf(editor.getGrammar().scopeName) >= 0;
    },
    inSkipList: function(list) {
      var editorElement;
      if (list == null) {
        return false;
      }
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      if (!((editorElement != null) && (editorElement.classList != null))) {
        return false;
      }
      return list.every(function(className) {
        return editorElement.classList.contains(className);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvbWFya2Rvd24td3JpdGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3Q0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLFdBQVI7QUFBQSxJQUVBLE9BQUEsRUFBUyxFQUZUO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtBQUFBLElBS0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxtQkFBQSxDQUFBLENBQW5CLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSx5QkFBRCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxzQkFBRCxDQUFBLEVBSlE7SUFBQSxDQUxWO0FBQUEsSUFXQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFZLENBQUUsT0FBZCxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFEZixDQUFBO2FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUhEO0lBQUEsQ0FYWjtBQUFBLElBZ0JBLHlCQUFBLEVBQTJCLFNBQUEsR0FBQTtBQUN6QixVQUFBLGlCQUFBO0FBQUEsTUFBQSxpQkFBQSxHQUFvQixFQUFwQixDQUFBO0FBQUEsTUFFQSxDQUFDLE9BQUQsRUFBVSxNQUFWLENB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/markdown-writer.coffee
