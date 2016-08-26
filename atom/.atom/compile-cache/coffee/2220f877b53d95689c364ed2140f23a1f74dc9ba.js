(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = {
    activate: function() {
      return setImmediate(function() {
        var lps, _base;
        lps = atom.workspace.getTextEditors().map(function(ed) {
          return ed.getGrammar().packageName;
        });
        if (__indexOf.call(lps, 'language-haskell') >= 0) {
          return typeof (_base = atom.packages).triggerActivationHook === "function" ? _base.triggerActivationHook('language-haskell:grammar-used') : void 0;
        }
      });
    },
    deactivate: function() {}
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxSkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixZQUFBLENBQWEsU0FBQSxHQUFBO0FBQ1gsWUFBQSxVQUFBO0FBQUEsUUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsQ0FDSixDQUFDLEdBREcsQ0FDQyxTQUFDLEVBQUQsR0FBQTtpQkFBUSxFQUFFLENBQUMsVUFBSCxDQUFBLENBQWUsQ0FBQyxZQUF4QjtRQUFBLENBREQsQ0FBTixDQUFBO0FBRUEsUUFBQSxJQUFHLGVBQXNCLEdBQXRCLEVBQUEsa0JBQUEsTUFBSDs0RkFDZSxDQUFDLHNCQUF1QiwwQ0FEdkM7U0FIVztNQUFBLENBQWIsRUFEUTtJQUFBLENBQVY7QUFBQSxJQU1BLFVBQUEsRUFBWSxTQUFBLEdBQUEsQ0FOWjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/language-haskell/src/main.coffee
