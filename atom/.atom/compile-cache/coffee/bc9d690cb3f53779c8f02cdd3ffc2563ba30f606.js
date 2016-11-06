(function() {
  var ProgressBar, ProgressBarElement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ProgressBar = (function(_super) {
    __extends(ProgressBar, _super);

    function ProgressBar() {
      return ProgressBar.__super__.constructor.apply(this, arguments);
    }

    ProgressBar.prototype.createdCallback = function() {
      return this.appendChild(this.span = document.createElement('span'));
    };

    ProgressBar.prototype.setProgress = function(progress) {
      this.span.style.setProperty('width', "" + (progress * 100) + "%");
      if (progress <= 0) {
        return this.classList.remove('visible');
      } else {
        return this.classList.add('visible');
      }
    };

    return ProgressBar;

  })(HTMLElement);

  module.exports = ProgressBarElement = document.registerElement('ide-haskell-progress-bar', {
    prototype: ProgressBar.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3MvcHJvZ3Jlc3MtYmFyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQU07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBckIsRUFEZTtJQUFBLENBQWpCLENBQUE7O0FBQUEsMEJBR0EsV0FBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFaLENBQXdCLE9BQXhCLEVBQWlDLEVBQUEsR0FBRSxDQUFDLFFBQUEsR0FBVyxHQUFaLENBQUYsR0FBa0IsR0FBbkQsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQUEsSUFBWSxDQUFmO2VBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLFNBQWxCLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsU0FBZixFQUhGO09BRlc7SUFBQSxDQUhiLENBQUE7O3VCQUFBOztLQUR3QixZQUExQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsa0JBQUEsR0FDZixRQUFRLENBQUMsZUFBVCxDQUF5QiwwQkFBekIsRUFDRTtBQUFBLElBQUEsU0FBQSxFQUFXLFdBQVcsQ0FBQyxTQUF2QjtHQURGLENBYkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/progress-bar.coffee
