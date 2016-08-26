(function() {
  var MessageObject, TooltipElement, TooltipMessage, TooltipView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MessageObject = require('../message-object.coffee');

  TooltipMessage = (function() {
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

  module.exports = {
    TooltipMessage: TooltipMessage
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvdmlld3MvdG9vbHRpcC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsMEJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUVNO0FBQ1MsSUFBQSx3QkFBQyxJQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyxHQUFBLENBQUEsY0FBRCxDQUFvQixDQUFDLFVBQXJCLENBQWdDLElBQWhDLENBQVgsQ0FEVztJQUFBLENBQWI7OzBCQUFBOztNQUhGLENBQUE7O0FBQUEsRUFNTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwwQkFBQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixVQUFBLGtCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBQWIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxPQUFBLFlBQW1CLEtBQXRCO0FBQ0UsYUFBQSw4Q0FBQTswQkFBQTtBQUNFLFVBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFBLEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBckIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxhQUFhLENBQUMsVUFBZCxDQUF5QixDQUF6QixDQUEyQixDQUFDLEtBQTVCLENBQWtDLEtBQWxDLENBREEsQ0FERjtBQUFBLFNBREY7T0FBQSxNQUFBO0FBS0UsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFyQixDQUFBLENBQUE7QUFBQSxRQUNBLGFBQWEsQ0FBQyxVQUFkLENBQXlCLE9BQXpCLENBQWlDLENBQUMsS0FBbEMsQ0FBd0MsS0FBeEMsQ0FEQSxDQUxGO09BREE7YUFRQSxLQVRVO0lBQUEsQ0FBWixDQUFBOztBQUFBLDBCQVdBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTthQUNoQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixhQUE3QixFQURnQjtJQUFBLENBWGxCLENBQUE7O3VCQUFBOztLQUR3QixZQU4xQixDQUFBOztBQUFBLEVBcUJBLGNBQUEsR0FDRSxRQUFRLENBQUMsZUFBVCxDQUF5QixxQkFBekIsRUFDRTtBQUFBLElBQUEsU0FBQSxFQUFXLFdBQVcsQ0FBQyxTQUF2QjtHQURGLENBdEJGLENBQUE7O0FBQUEsRUF5QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUNmLGdCQUFBLGNBRGU7R0F6QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/views/tooltip-view.coffee
