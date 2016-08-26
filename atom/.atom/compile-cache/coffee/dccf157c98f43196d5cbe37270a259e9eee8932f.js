(function() {
  var CompositeDisposable, EditorLinter, EditorRegistry, Emitter, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  EditorLinter = require('./editor-linter');

  EditorRegistry = (function() {
    function EditorRegistry() {
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.emitter);
      this.editorLinters = new Map();
      this.editorLintersByPath = new Map();
    }

    EditorRegistry.prototype.create = function(textEditor) {
      var currentPath, editorLinter;
      editorLinter = new EditorLinter(textEditor);
      if (currentPath = textEditor.getPath()) {
        this.editorLintersByPath.set(currentPath, editorLinter);
      }
      textEditor.onDidChangePath((function(_this) {
        return function(path) {
          _this.editorLintersByPath["delete"](currentPath);
          return _this.editorLintersByPath.set(currentPath = path, editorLinter);
        };
      })(this));
      this.editorLinters.set(textEditor, editorLinter);
      editorLinter.onDidDestroy((function(_this) {
        return function() {
          return _this.editorLinters["delete"](textEditor);
        };
      })(this));
      this.emitter.emit('observe', editorLinter);
      return editorLinter;
    };

    EditorRegistry.prototype.has = function(textEditor) {
      return this.editorLinters.has(textEditor);
    };

    EditorRegistry.prototype.forEach = function(callback) {
      return this.editorLinters.forEach(callback);
    };

    EditorRegistry.prototype.ofPath = function(path) {
      return this.editorLintersByPath.get(path);
    };

    EditorRegistry.prototype.ofTextEditor = function(editor) {
      return this.editorLinters.get(editor);
    };

    EditorRegistry.prototype.ofActiveTextEditor = function() {
      return this.ofTextEditor(atom.workspace.getActiveTextEditor());
    };

    EditorRegistry.prototype.observe = function(callback) {
      this.forEach(callback);
      return this.emitter.on('observe', callback);
    };

    EditorRegistry.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.editorLinters.forEach(function(editorLinter) {
        return editorLinter.dispose();
      });
      return this.editorLinters.clear();
    };

    return EditorRegistry;

  })();

  module.exports = EditorRegistry;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1yZWdpc3RyeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0VBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdNO0FBQ1MsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFwQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsR0FBQSxDQUFBLENBSHJCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLEdBQUEsQ0FBQSxDQUozQixDQURXO0lBQUEsQ0FBYjs7QUFBQSw2QkFPQSxNQUFBLEdBQVEsU0FBQyxVQUFELEdBQUE7QUFDTixVQUFBLHlCQUFBO0FBQUEsTUFBQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLFVBQWIsQ0FBbkIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxXQUFBLEdBQWMsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFqQjtBQUNFLFFBQUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLEdBQXJCLENBQXlCLFdBQXpCLEVBQXNDLFlBQXRDLENBQUEsQ0FERjtPQURBO0FBQUEsTUFHQSxVQUFVLENBQUMsZUFBWCxDQUEy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

//# sourceURL=/home/epse/.atom/packages/linter/lib/editor-registry.coffee
