(function() {
  var AbstractProvider, PropertyProvider, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = PropertyProvider = (function(_super) {
    __extends(PropertyProvider, _super);

    function PropertyProvider() {
      return PropertyProvider.__super__.constructor.apply(this, arguments);
    }

    PropertyProvider.prototype.hoverEventSelectors = '.property';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    PropertyProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, returnType, value, _ref;
      value = this.parser.getPropertyContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      accessModifier = '';
      returnType = value.args["return"] ? value.args["return"] : 'mixed';
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else {
        accessModifier = 'private';
      }
      description = '';
      description += "<p><div>";
      description += accessModifier + ' ' + returnType + '<strong>' + ' $' + term + '</strong>';
      description += '</div></p>';
      description += '<div>';
      description += (value.args.descriptions.short ? value.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((_ref = value.args.descriptions.long) != null ? _ref.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + value.args.descriptions.long + "</div>";
        description += "</div>";
      }
      if (value.args["return"]) {
        description += '<div class="section">';
        description += "<h4>Type</h4>";
        description += "<div>" + value.args["return"] + "</div>";
        description += "</div>";
      }
      return description;
    };

    return PropertyProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvcHJvcGVydHktcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLG1CQUFBLEdBQXFCLFdBQXJCLENBQUE7O0FBRUE7QUFBQTs7Ozs7T0FGQTs7QUFBQSwrQkFRQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ2YsVUFBQSxvREFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsTUFBM0IsRUFBbUMsSUFBbkMsRUFBeUMsY0FBekMsQ0FBUixDQUFBO0FBRUEsTUFBQSxJQUFHLENBQUEsS0FBSDtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBQUEsTUFLQSxjQUFBLEdBQWlCLEVBTGpCLENBQUE7QUFBQSxNQU1BLFVBQUEsR0FBZ0IsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQWIsR0FBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQXBDLEdBQWlELE9BTjlELENBQUE7QUFRQSxNQUFBLElBQUcsS0FBSyxDQUFDLFFBQVQ7QUFDSSxRQUFBLGNBQUEsR0FBaUIsUUFBakIsQ0FESjtPQUFBLE1BR0ssSUFBRyxLQUFLLENBQUMsV0FBVDtBQUNELFFBQUEsY0FBQSxHQUFpQixXQUFqQixDQURDO09BQUEsTUFBQTtBQUlELFFBQUEsY0FBQSxHQUFpQixTQUFqQixDQUpDO09BWEw7QUFBQSxNQWtCQSxXQUFBLEdBQWMsRUFsQmQsQ0FBQTtBQUFBLE1Bb0JBLFdBQUEsSUFBZSxVQXBCZixDQUFBO0FBQUEsTUFxQkEsV0FBQSxJQUFlLGNBQUEsR0FBaUIsR0FBakIsR0FBdUIsVUFBdkIsR0FBb0MsVUFBcEMsR0FBaUQsSUFBakQsR0FBd0QsSUFBeEQsR0FBK0QsV0FyQjlFLENBQUE7QUFBQSxNQXNCQSxXQUFBLElBQWUsWUF0QmYsQ0FBQTtBQUFBLE1BeUJBLFdBQUEsSUFBZSxPQXpCZixDQUFBO0FBQUEsTUEwQkEsV0FBQSxJQUFtQixDQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQTNCLEdBQXNDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQTlELEdBQXlFLDhCQUExRSxDQTFCbkIsQ0FBQTtBQUFBLE1BMkJBLFdBQUEsSUFBZSxRQTNCZixDQUFBO0FBOEJBLE1BQUEseURBQStCLENBQUUsZ0JBQTlCLEdBQXVDLENBQTFDO0FBQ0ksUUFBQSxXQUFBLElBQWUsdUJBQWYsQ0FBQTtBQUFBLFFBQ0EsV0FBQSxJQUFtQixzQkFEbkIsQ0FBQTtBQUFBLFFBRUEsV0FBQSxJQUFtQixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBbEMsR0FBeUMsUUFGNUQsQ0FBQTtBQUFBLFFBR0EsV0FBQSxJQUFlLFFBSGYsQ0FESjtPQTlCQTtBQW9DQSxNQUFBLElBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQWI7QUFDSSxRQUFBLFdBQUEsSUFBZSx1QkFBZixDQUFBO0FBQUEsUUFDQSxXQUFBLElBQW1CLGVBRG5CLENBQUE7QUFBQSxRQUVBLFdBQUEsSUFBbUIsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBRCxDQUFwQixHQUE4QixRQUZqRCxDQUFBO0FBQUEsUUFHQSxXQUFBLElBQWUsUUFIZixDQURKO09BcENBO0FBMENBLGFBQU8sV0FBUCxDQTNDZTtJQUFBLENBUm5CLENBQUE7OzRCQUFBOztLQUQyQixpQkFOL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/tooltip/property-provider.coffee
