(function() {
  var AbstractProvider, FunctionProvider, Point, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Point = require('atom').Point;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.function-call';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    FunctionProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, exceptionType, param, parametersDescription, returnType, thrownWhenDescription, throwsDescription, value, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      value = this.parser.getMethodContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      description = "";
      accessModifier = '';
      returnType = (value.args["return"] ? value.args["return"] : '');
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else {
        accessModifier = 'private';
      }
      description += "<p><div>";
      description += accessModifier + ' ' + returnType + ' <strong>' + term + '</strong>' + '(';
      if (value.args.parameters.length > 0) {
        description += value.args.parameters.join(', ');
      }
      if (value.args.optionals.length > 0) {
        description += '[';
        if (value.args.parameters.length > 0) {
          description += ', ';
        }
        description += value.args.optionals.join(', ');
        description += ']';
      }
      description += ')';
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
      parametersDescription = "";
      _ref1 = value.args.parameters;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        param = _ref1[_i];
        parametersDescription += "<div>";
        parametersDescription += "• <strong>" + param + "</strong>";
        parametersDescription += "</div>";
      }
      _ref2 = value.args.optionals;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        param = _ref2[_j];
        parametersDescription += "<div>";
        parametersDescription += "• <strong>[" + param + "]</strong>";
        parametersDescription += "</div>";
      }
      if (value.args.parameters.length > 0 || value.args.optionals.length > 0) {
        description += '<div class="section">';
        description += "<h4>Parameters</h4>";
        description += "<div>" + parametersDescription + "</div>";
        description += "</div>";
      }
      if (value.args["return"]) {
        description += '<div class="section">';
        description += "<h4>Returns</h4>";
        description += "<div>" + value.args["return"] + "</div>";
        description += "</div>";
      }
      throwsDescription = "";
      _ref3 = value.args.throws;
      for (exceptionType in _ref3) {
        thrownWhenDescription = _ref3[exceptionType];
        throwsDescription += "<div>";
        throwsDescription += "• <strong>" + exceptionType + "</strong>";
        if (thrownWhenDescription) {
          throwsDescription += ' ' + thrownWhenDescription;
        }
        throwsDescription += "</div>";
      }
      if (throwsDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Throws</h4>";
        description += "<div>" + throwsDescription + "</div>";
        description += "</div>";
      }
      return description;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0MsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBREQsQ0FBQTs7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUhuQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNGLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwrQkFBQSxtQkFBQSxHQUFxQixnQkFBckIsQ0FBQTs7QUFFQTtBQUFBOzs7OztPQUZBOztBQUFBLCtCQVFBLGlCQUFBLEdBQW1CLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxjQUFmLEdBQUE7QUFDZixVQUFBLHFMQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxJQUFqQyxFQUF1QyxjQUF2QyxDQUFSLENBQUE7QUFFQSxNQUFBLElBQUcsQ0FBQSxLQUFIO0FBQ0ksY0FBQSxDQURKO09BRkE7QUFBQSxNQUtBLFdBQUEsR0FBYyxFQUxkLENBQUE7QUFBQSxNQVFBLGNBQUEsR0FBaUIsRUFSakIsQ0FBQTtBQUFBLE1BU0EsVUFBQSxHQUFhLENBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQWIsR0FBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFELENBQXBDLEdBQWlELEVBQWxELENBVGIsQ0FBQTtBQVdBLE1BQUEsSUFBRyxLQUFLLENBQUMsUUFBVDtBQUNJ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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/tooltip/function-provider.coffee
