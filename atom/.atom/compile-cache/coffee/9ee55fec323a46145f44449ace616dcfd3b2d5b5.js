(function() {
  var ParamSelectView, SelectListView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  module.exports = ParamSelectView = (function(_super) {
    __extends(ParamSelectView, _super);

    function ParamSelectView() {
      return ParamSelectView.__super__.constructor.apply(this, arguments);
    }

    ParamSelectView.prototype.initialize = function(_arg) {
      var div, heading, items;
      this.onConfirmed = _arg.onConfirmed, this.onCancelled = _arg.onCancelled, items = _arg.items, heading = _arg.heading, this.itemTemplate = _arg.itemTemplate, this.itemFilterName = _arg.itemFilterName;
      ParamSelectView.__super__.initialize.apply(this, arguments);
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: false
      });
      this.addClass('ide-haskell');
      if (typeof items.then === 'function') {
        items.then((function(_this) {
          return function(its) {
            return _this.show(its);
          };
        })(this));
      } else {
        this.show(items);
      }
      if (heading != null) {
        div = document.createElement('div');
        div.classList.add('select-list-heading');
        div.innerText = heading;
        return this.prepend(div);
      }
    };

    ParamSelectView.prototype.cancelled = function() {
      this.panel.destroy();
      return typeof this.onCancelled === "function" ? this.onCancelled() : void 0;
    };

    ParamSelectView.prototype.getFilterKey = function() {
      return this.itemFilterKey;
    };

    ParamSelectView.prototype.show = function(list) {
      this.setItems(list);
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    ParamSelectView.prototype.viewForItem = function(item) {
      return this.itemTemplate(item);
    };

    ParamSelectView.prototype.confirmed = function(item) {
      if (typeof this.onConfirmed === "function") {
        this.onConfirmed(item);
      }
      this.onCancelled = null;
      return this.cancel();
    };

    return ParamSelectView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3MvcGFyYW0tc2VsZWN0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsOEJBQUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxtQkFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLG1CQUFBLGFBQWEsSUFBQyxDQUFBLG1CQUFBLGFBQWEsYUFBQSxPQUFPLGVBQUEsU0FBUyxJQUFDLENBQUEsb0JBQUEsY0FBYyxJQUFDLENBQUEsc0JBQUEsY0FDeEUsQ0FBQTtBQUFBLE1BQUEsaURBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQ1A7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsUUFDQSxPQUFBLEVBQVMsS0FEVDtPQURPLENBRFQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLENBSkEsQ0FBQTtBQUtBLE1BQUEsSUFBRyxNQUFBLENBQUEsS0FBWSxDQUFDLElBQWIsS0FBcUIsVUFBeEI7QUFDRSxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEdBQUQsR0FBQTttQkFBUyxLQUFDLENBQUEsSUFBRCxDQUFNLEdBQU4sRUFBVDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxLQUFOLENBQUEsQ0FIRjtPQUxBO0FBU0EsTUFBQSxJQUFHLGVBQUg7QUFDRSxRQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFOLENBQUE7QUFBQSxRQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixxQkFBbEIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxHQUFHLENBQUMsU0FBSixHQUFnQixPQUZoQixDQUFBO2VBR0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxHQUFULEVBSkY7T0FWVTtJQUFBLENBQVosQ0FBQTs7QUFBQSw4QkFnQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO3NEQUNBLElBQUMsQ0FBQSx1QkFGUTtJQUFBLENBaEJYLENBQUE7O0FBQUEsOEJBb0JBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsY0FEVztJQUFBLENBcEJkLENBQUE7O0FBQUEsOEJBdUJBLElBQUEsR0FBTSxTQUFDLElBQUQsR0FBQTtBQUNKLE1BQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUpJO0lBQUEsQ0F2Qk4sQ0FBQTs7QUFBQSw4QkE2QkEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO2FBQ1gsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBRFc7SUFBQSxDQTdCYixDQUFBOztBQUFBLDhCQWdDQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7O1FBQ1QsSUFBQyxDQUFBLFlBQWE7T0FBZDtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQURmLENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSFM7SUFBQSxDQWhDWCxDQUFBOzsyQkFBQTs7S0FENEIsZUFIOUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/param-select-view.coffee
