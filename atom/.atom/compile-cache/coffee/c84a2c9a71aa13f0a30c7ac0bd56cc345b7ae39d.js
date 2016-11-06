(function() {
  var MessageObject, TooltipElement, TooltipMessage, TooltipView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MessageObject = require('../message-object.coffee');

  module.exports = TooltipMessage = (function() {
    function TooltipMessage(text) {
      this.element = (new TooltipElement).setMessage(text);
    }

    return TooltipMessage;

  })();

  TooltipView = (function(_super) {
    __extends(TooltipView, _super);

    function TooltipView() {
      return TooltipView.__super__.constructor.apply(this, arguments);
    }

    TooltipView.prototype.setMessage = function(message) {
      var inner, m, _i, _len;
      this.innerHtml = '';
      if (message instanceof Array) {
        for (_i = 0, _len = message.length; _i < _len; _i++) {
          m = message[_i];
          this.appendChild(inner = document.createElement('div'));
          MessageObject.fromObject(m).paste(inner);
        }
      } else {
        this.appendChild(inner = document.createElement('div'));
        MessageObject.fromObject(message).paste(inner);
      }
      return this;
    };

    TooltipView.prototype.attachedCallback = function() {
      return this.parentElement.classList.add('ide-haskell');
    };

    return TooltipView;

  })(HTMLElement);

  TooltipElement = document.registerElement('ide-haskell-tooltip', {
    prototype: TooltipView.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi92aWV3cy90b29sdGlwLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUixDQUFoQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsd0JBQUMsSUFBRCxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsR0FBQSxDQUFBLGNBQUQsQ0FBb0IsQ0FBQyxVQUFyQixDQUFnQyxJQUFoQyxDQUFYLENBRFc7SUFBQSxDQUFiOzswQkFBQTs7TUFKRixDQUFBOztBQUFBLEVBT007QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsVUFBQSxrQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBQUE7QUFDQSxNQUFBLElBQUcsT0FBQSxZQUFtQixLQUF0QjtBQUNFLGFBQUEsOENBQUE7MEJBQUE7QUFDRSxVQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsS0FBQSxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQXJCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsYUFBYSxDQUFDLFVBQWQsQ0FBeUIsQ0FBekIsQ0FBMkIsQ0FBQyxLQUE1QixDQUFrQyxLQUFsQyxDQURBLENBREY7QUFBQSxTQURGO09BQUEsTUFBQTtBQUtFLFFBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFBLEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBckIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxhQUFhLENBQUMsVUFBZCxDQUF5QixPQUF6QixDQUFpQyxDQUFDLEtBQWxDLENBQXdDLEtBQXhDLENBREEsQ0FMRjtPQURBO2FBUUEsS0FUVTtJQUFBLENBQVosQ0FBQTs7QUFBQSwwQkFXQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7YUFDaEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsYUFBN0IsRUFEZ0I7SUFBQSxDQVhsQixDQUFBOzt1QkFBQTs7S0FEd0IsWUFQMUIsQ0FBQTs7QUFBQSxFQXNCQSxjQUFBLEdBQ0UsUUFBUSxDQUFDLGVBQVQsQ0FBeUIscUJBQXpCLEVBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxXQUFXLENBQUMsU0FBdkI7R0FERixDQXZCRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/views/tooltip-view.coffee
