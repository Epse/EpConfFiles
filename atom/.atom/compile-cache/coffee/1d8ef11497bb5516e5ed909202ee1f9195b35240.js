(function() {
  var ResultItem;

  module.exports = ResultItem = (function() {
    function ResultItem(parent, _arg) {
      this.parent = parent;
      this.uri = _arg.uri, this.message = _arg.message, this.severity = _arg.severity, this.position = _arg.position;
    }

    ResultItem.prototype.destroy = function() {
      if (this.parent != null) {
        return this.parent.removeResult(this);
      }
    };

    return ResultItem;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9yZXN1bHQtaXRlbS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsVUFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLG9CQUFFLE1BQUYsRUFBVSxJQUFWLEdBQUE7QUFBbUQsTUFBbEQsSUFBQyxDQUFBLFNBQUEsTUFBaUQsQ0FBQTtBQUFBLE1BQXhDLElBQUMsQ0FBQSxXQUFBLEtBQUssSUFBQyxDQUFBLGVBQUEsU0FBUyxJQUFDLENBQUEsZ0JBQUEsVUFBVSxJQUFDLENBQUEsZ0JBQUEsUUFBWSxDQUFuRDtJQUFBLENBQWI7O0FBQUEseUJBRUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBRyxtQkFBSDtlQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFyQixFQURGO09BRE87SUFBQSxDQUZULENBQUE7O3NCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/result-item.coffee
