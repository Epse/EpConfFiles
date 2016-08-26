(function() {
  var ModifierView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  module.exports = ModifierView = (function(_super) {
    __extends(ModifierView, _super);

    function ModifierView() {
      return ModifierView.__super__.constructor.apply(this, arguments);
    }

    ModifierView.content = function() {
      return this.div({
        "class": 'modifier'
      });
    };

    ModifierView.prototype.initialize = function(params) {
      this.text(params.label);
      return this.addClass('modifier-' + params.label.toLowerCase());
    };

    ModifierView.prototype.setActive = function(active) {
      if (active) {
        return this.addClass('modifier-active');
      } else {
        return this.removeClass('modifier-active');
      }
    };

    return ModifierView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL3ZpZXdzL21vZGlmaWVyLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxVQUFQO09BQUwsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSwyQkFHQSxVQUFBLEdBQVksU0FBQyxNQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sTUFBTSxDQUFDLEtBQWIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxXQUFBLEdBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFiLENBQUEsQ0FBeEIsRUFGVTtJQUFBLENBSFosQ0FBQTs7QUFBQSwyQkFPQSxTQUFBLEdBQVcsU0FBQyxNQUFELEdBQUE7QUFDVCxNQUFBLElBQUcsTUFBSDtlQUFlLElBQUMsQ0FBQSxRQUFELENBQVUsaUJBQVYsRUFBZjtPQUFBLE1BQUE7ZUFBaUQsSUFBQyxDQUFBLFdBQUQsQ0FBYSxpQkFBYixFQUFqRDtPQURTO0lBQUEsQ0FQWCxDQUFBOzt3QkFBQTs7S0FGeUIsS0FIM0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/views/modifier-view.coffee
