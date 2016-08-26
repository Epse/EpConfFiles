(function() {
  var OutputPanelItemElement, OutputPanelItemsElement, OutputPanelItemsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  OutputPanelItemElement = require('./output-panel-item');

  OutputPanelItemsView = (function(_super) {
    __extends(OutputPanelItemsView, _super);

    function OutputPanelItemsView() {
      return OutputPanelItemsView.__super__.constructor.apply(this, arguments);
    }

    OutputPanelItemsView.prototype.setModel = function(model) {
      this.model = model;
    };

    OutputPanelItemsView.prototype.createdCallback = function() {
      this.classList.add('native-key-bindings');
      this.setAttribute('tabindex', -1);
      return this.itemViews = [];
    };

    OutputPanelItemsView.prototype.filter = function(activeFilter) {
      var i, scrollTop;
      this.activeFilter = activeFilter;
      scrollTop = this.scrollTop;
      this.clear();
      this.items = this.model.filter(this.activeFilter);
      this.itemViews = (function() {
        var _i, _len, _ref, _results;
        _ref = this.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(this.appendChild((new OutputPanelItemElement).setModel(i)));
        }
        return _results;
      }).call(this);
      return this.scrollTop = scrollTop;
    };

    OutputPanelItemsView.prototype.showItem = function(item) {
      var view;
      view = this.itemViews[this.items.indexOf(item)];
      if (view == null) {
        return;
      }
      view.position.click();
      return view.scrollIntoView({
        block: "start",
        behavior: "smooth"
      });
    };

    OutputPanelItemsView.prototype.scrollToEnd = function() {
      return this.scrollTop = this.scrollHeight;
    };

    OutputPanelItemsView.prototype.atEnd = function() {
      return this.scrollTop >= (this.scrollHeight - this.clientHeight);
    };

    OutputPanelItemsView.prototype.clear = function() {
      var i, _i, _len, _ref;
      _ref = this.itemViews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        i.destroy();
      }
      return this.itemViews = [];
    };

    OutputPanelItemsView.prototype.destroy = function() {
      this.remove();
      return this.clear();
    };

    return OutputPanelItemsView;

  })(HTMLElement);

  OutputPanelItemsElement = document.registerElement('ide-haskell-panel-items', {
    prototype: OutputPanelItemsView.prototype
  });

  module.exports = OutputPanelItemsElement;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvb3V0cHV0LXBhbmVsL3ZpZXdzL291dHB1dC1wYW5lbC1pdGVtcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQUF6QixDQUFBOztBQUFBLEVBRU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsbUNBQUEsUUFBQSxHQUFVLFNBQUUsS0FBRixHQUFBO0FBQVUsTUFBVCxJQUFDLENBQUEsUUFBQSxLQUFRLENBQVY7SUFBQSxDQUFWLENBQUE7O0FBQUEsbUNBRUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLHFCQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxVQUFkLEVBQTBCLENBQUEsQ0FBMUIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUhFO0lBQUEsQ0FGakIsQ0FBQTs7QUFBQSxtQ0FPQSxNQUFBLEdBQVEsU0FBRSxZQUFGLEdBQUE7QUFDTixVQUFBLFlBQUE7QUFBQSxNQURPLElBQUMsQ0FBQSxlQUFBLFlBQ1IsQ0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFiLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxZQUFmLENBRlQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQ7O0FBQWE7QUFBQTthQUFBLDJDQUFBO3VCQUFBO0FBQ1gsd0JBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFDLEdBQUEsQ0FBQSxzQkFBRCxDQUE0QixDQUFDLFFBQTdCLENBQXNDLENBQXRDLENBQWIsRUFBQSxDQURXO0FBQUE7O21CQUhiLENBQUE7YUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhLFVBTlA7SUFBQSxDQVBSLENBQUE7O0FBQUEsbUNBZUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFNBQVUsQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxJQUFmLENBQUEsQ0FBbEIsQ0FBQTtBQUNBLE1BQUEsSUFBYyxZQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBZCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUksQ0FBQyxjQUFMLENBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFDQSxRQUFBLEVBQVUsUUFEVjtPQURGLEVBSlE7SUFBQSxDQWZWLENBQUE7O0FBQUEsbUNBdUJBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxhQURIO0lBQUEsQ0F2QmIsQ0FBQTs7QUFBQSxtQ0EwQkEsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUNMLElBQUMsQ0FBQSxTQUFELElBQWMsQ0FBQyxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsWUFBbEIsRUFEVDtJQUFBLENBMUJQLENBQUE7O0FBQUEsbUNBNkJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLGlCQUFBO0FBQUE7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQUEsUUFBQSxDQUFDLENBQUMsT0FBRixDQUFBLENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBRlI7SUFBQSxDQTdCUCxDQUFBOztBQUFBLG1DQWlDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFGTztJQUFBLENBakNULENBQUE7O2dDQUFBOztLQURpQyxZQUZuQyxDQUFBOztBQUFBLEVBd0NBLHVCQUFBLEdBQ0UsUUFBUSxDQUFDLGVBQVQsQ0FBeUIseUJBQXpCLEVBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxvQkFBb0IsQ0FBQyxTQUFoQztHQURGLENBekNGLENBQUE7O0FBQUEsRUE0Q0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsdUJBNUNqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-items.coffee
