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
      ["link", "image", "table"].forEach((function(_this) {
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
      ["publish-draft"].forEach((function(_this) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL21hcmtkb3duLXdyaXRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFHQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBSGQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxXQUFSO0FBQUEsSUFFQSxPQUFBLEVBQVMsRUFGVDtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQSxDQUFuQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxFQUpRO0lBQUEsQ0FMVjtBQUFBLElBV0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTs7WUFBWSxDQUFFLE9BQWQsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBRGYsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FIRDtJQUFBLENBWFo7QUFBQSxJQWdCQSx5QkFBQSxFQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxpQkFBQTtBQUFBLE1BQUEsaUJBQUEsR0FBb0IsRUFBcEIsQ0FBQTtBQUFBLE1BRUEsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFpQixDQUFDLE9BQWxCLENB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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/markdown-writer.coffee
