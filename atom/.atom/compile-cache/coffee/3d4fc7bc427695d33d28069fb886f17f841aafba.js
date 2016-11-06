(function() {
  var OutputPanelItemsElement, OutputPanelItemsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
      var OutputPanelItemElement, i, scrollTop;
      this.activeFilter = activeFilter;
      scrollTop = this.scrollTop;
      this.clear();
      this.items = this.model.filter(this.activeFilter);
      OutputPanelItemElement = require('./output-panel-item');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3Mvb3V0cHV0LXBhbmVsLWl0ZW1zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsbUNBQUEsUUFBQSxHQUFVLFNBQUUsS0FBRixHQUFBO0FBQVUsTUFBVCxJQUFDLENBQUEsUUFBQSxLQUFRLENBQVY7SUFBQSxDQUFWLENBQUE7O0FBQUEsbUNBRUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLHFCQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxVQUFkLEVBQTBCLENBQUEsQ0FBMUIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUhFO0lBQUEsQ0FGakIsQ0FBQTs7QUFBQSxtQ0FPQSxNQUFBLEdBQVEsU0FBRSxZQUFGLEdBQUE7QUFDTixVQUFBLG9DQUFBO0FBQUEsTUFETyxJQUFDLENBQUEsZUFBQSxZQUNSLENBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsU0FBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsWUFBZixDQUZULENBQUE7QUFBQSxNQUdBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQUh6QixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRDs7QUFBYTtBQUFBO2FBQUEsMkNBQUE7dUJBQUE7QUFDWCx3QkFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLENBQUMsR0FBQSxDQUFBLHNCQUFELENBQTRCLENBQUMsUUFBN0IsQ0FBc0MsQ0FBdEMsQ0FBYixFQUFBLENBRFc7QUFBQTs7bUJBSmIsQ0FBQTthQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsVUFQUDtJQUFBLENBUFIsQ0FBQTs7QUFBQSxtQ0FnQkEsUUFBQSxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFNBQVUsQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxJQUFmLENBQUEsQ0FBbEIsQ0FBQTtBQUNBLE1BQUEsSUFBYyxZQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBZCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUksQ0FBQyxjQUFMLENBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxPQUFQO0FBQUEsUUFDQSxRQUFBLEVBQVUsUUFEVjtPQURGLEVBSlE7SUFBQSxDQWhCVixDQUFBOztBQUFBLG1DQXdCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsYUFESDtJQUFBLENBeEJiLENBQUE7O0FBQUEsbUNBMkJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsU0FBRCxJQUFjLENBQUMsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLFlBQWxCLEVBRFQ7SUFBQSxDQTNCUCxDQUFBOztBQUFBLG1DQThCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsVUFBQSxpQkFBQTtBQUFBO0FBQUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUFBLFFBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQUFBO2FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUZSO0lBQUEsQ0E5QlAsQ0FBQTs7QUFBQSxtQ0FrQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBRk87SUFBQSxDQWxDVCxDQUFBOztnQ0FBQTs7S0FEaUMsWUFBbkMsQ0FBQTs7QUFBQSxFQXVDQSx1QkFBQSxHQUNFLFFBQVEsQ0FBQyxlQUFULENBQXlCLHlCQUF6QixFQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsb0JBQW9CLENBQUMsU0FBaEM7R0FERixDQXhDRixDQUFBOztBQUFBLEVBMkNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLHVCQTNDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-items.coffee
