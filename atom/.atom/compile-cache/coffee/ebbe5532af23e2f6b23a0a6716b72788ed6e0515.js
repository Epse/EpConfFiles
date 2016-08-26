(function() {
  var ExViewModel, Input, ViewModel, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./view-model'), ViewModel = _ref.ViewModel, Input = _ref.Input;

  module.exports = ExViewModel = (function(_super) {
    __extends(ExViewModel, _super);

    function ExViewModel(exCommand) {
      this.exCommand = exCommand;
      this.confirm = __bind(this.confirm, this);
      this.decreaseHistoryEx = __bind(this.decreaseHistoryEx, this);
      this.increaseHistoryEx = __bind(this.increaseHistoryEx, this);
      ExViewModel.__super__.constructor.call(this, this.exCommand, {
        "class": 'command'
      });
      this.historyIndex = -1;
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistoryEx);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistoryEx);
    }

    ExViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index).value);
    };

    ExViewModel.prototype.history = function(index) {
      return this.exState.getExHistoryItem(index);
    };

    ExViewModel.prototype.increaseHistoryEx = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.decreaseHistoryEx = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.confirm = function(view) {
      this.value = this.view.value;
      this.exState.pushExHistory(this);
      return ExViewModel.__super__.confirm.call(this, view);
    };

    return ExViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC12aWV3LW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQ0FBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQXFCLE9BQUEsQ0FBUSxjQUFSLENBQXJCLEVBQUMsaUJBQUEsU0FBRCxFQUFZLGFBQUEsS0FBWixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7O0FBQWEsSUFBQSxxQkFBRSxTQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxZQUFBLFNBQ2IsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxtRUFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLE1BQUEsNkNBQU0sSUFBQyxDQUFBLFNBQVAsRUFBa0I7QUFBQSxRQUFBLE9BQUEsRUFBTyxTQUFQO09BQWxCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQSxDQURoQixDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUF4QixFQUF1QyxjQUF2QyxFQUF1RCxJQUFDLENBQUEsaUJBQXhELENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBeEIsRUFBdUMsZ0JBQXZDLEVBQXlELElBQUMsQ0FBQSxpQkFBMUQsQ0FKQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSwwQkFPQSxjQUFBLEdBQWdCLFNBQUMsS0FBRCxHQUFBO2FBQ2QsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVCxDQUFlLENBQUMsS0FBdkQsRUFEYztJQUFBLENBUGhCLENBQUE7O0FBQUEsMEJBVUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO2FBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixLQUExQixFQURPO0lBQUEsQ0FWVCxDQUFBOztBQUFBLDBCQWFBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLElBQUcsMkNBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxZQUFELElBQWlCLENBQWpCLENBQUE7ZUFDQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsWUFBakIsRUFGRjtPQURpQjtJQUFBLENBYm5CLENBQUE7O0FBQUEsMEJBa0JBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLElBQUcsSUFBQyxDQUFBLFlBQUQsSUFBaUIsQ0FBcEI7QUFFRSxRQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUEsQ0FBaEIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxFQUF2QyxFQUhGO09BQUEsTUFBQTtBQUtFLFFBQUEsSUFBQyxDQUFBLFlBQUQsSUFBaUIsQ0FBakIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxZQUFqQixFQU5GO09BRGlCO0lBQUEsQ0FsQm5CLENBQUE7O0FBQUEsMEJBMkJBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLElBQXZCLENBREEsQ0FBQTthQUVBLHlDQUFNLElBQU4sRUFITztJQUFBLENBM0JULENBQUE7O3VCQUFBOztLQUR3QixVQUgxQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/ex-mode/lib/ex-view-model.coffee
