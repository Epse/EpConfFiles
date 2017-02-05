(function() {
  var AbstractProvider, FunctionProvider, Point, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Point = require('atom').Point;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

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
      var accessModifier, description, exceptionType, info, param, parametersDescription, ref, ref1, ref2, ref3, ref4, returnType, returnValue, thrownWhenDescription, throwsDescription, value;
      value = this.parser.getMemberContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      description = "";
      accessModifier = '';
      returnType = '';
      if ((ref = value.args["return"]) != null ? ref.type : void 0) {
        returnType = value.args["return"].type;
      }
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else if (value.isFunction == null) {
        accessModifier = 'private';
      }
      description += "<p><div>";
      if (value.isFunction != null) {
        description += returnType + ' <strong>' + term + '</strong>' + '(';
      } else {
        description += accessModifier + ' ' + returnType + ' <strong>' + term + '</strong>' + '(';
      }
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
      if (((ref1 = value.args.descriptions.long) != null ? ref1.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + value.args.descriptions.long + "</div>";
        description += "</div>";
      }
      parametersDescription = "";
      ref2 = value.args.docParameters;
      for (param in ref2) {
        info = ref2[param];
        parametersDescription += "<tr>";
        parametersDescription += "<td>•&nbsp;<strong>";
        if (indexOf.call(value.args.optionals, param) >= 0) {
          parametersDescription += "[" + param + "]";
        } else {
          parametersDescription += param;
        }
        parametersDescription += "</strong></td>";
        parametersDescription += "<td>" + (info.type ? info.type : '&nbsp;') + '</td>';
        parametersDescription += "<td>" + (info.description ? info.description : '&nbsp;') + '</td>';
        parametersDescription += "</tr>";
      }
      if (parametersDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Parameters</h4>";
        description += "<div><table>" + parametersDescription + "</table></div>";
        description += "</div>";
      }
      if ((ref3 = value.args["return"]) != null ? ref3.type : void 0) {
        returnValue = '<strong>' + value.args["return"].type + '</strong>';
        if (value.args["return"].description) {
          returnValue += ' ' + value.args["return"].description;
        }
        description += '<div class="section">';
        description += "<h4>Returns</h4>";
        description += "<div>" + returnValue + "</div>";
        description += "</div>";
      }
      throwsDescription = "";
      ref4 = value.args.throws;
      for (exceptionType in ref4) {
        thrownWhenDescription = ref4[exceptionType];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7Ozs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNULGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzs7QUFFckI7Ozs7Ozs7K0JBTUEsaUJBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWY7QUFDZixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkM7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsV0FBQSxHQUFjO01BR2QsY0FBQSxHQUFpQjtNQUNqQixVQUFBLEdBQWE7TUFFYiw4Q0FBb0IsQ0FBRSxhQUF0QjtRQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFBSSxFQUFDLE1BQUQsRUFBTyxDQUFDLEtBRG5DOztNQUdBLElBQUcsS0FBSyxDQUFDLFFBQVQ7UUFDSSxjQUFBLEdBQWlCLFNBRHJCO09BQUEsTUFHSyxJQUFHLEtBQUssQ0FBQyxXQUFUO1FBQ0QsY0FBQSxHQUFpQixZQURoQjtPQUFBLE1BR0EsSUFBTyx3QkFBUDtRQUNELGNBQUEsR0FBaUIsVUFEaEI7O01BR0wsV0FBQSxJQUFlO01BRWYsSUFBRyx3QkFBSDtRQUNFLFdBQUEsSUFBZSxVQUFBLEdBQWEsV0FBYixHQUEyQixJQUEzQixHQUFrQyxXQUFsQyxHQUFnRCxJQURqRTtPQUFBLE1BQUE7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QUFBLEdBQU0sc0JBRC9COztRQUdBLGlCQUFBLElBQXFCO0FBUHpCO01BU0EsSUFBRyxpQkFBaUIsQ0FBQyxNQUFsQixHQUEyQixDQUE5QjtRQUNJLFdBQUEsSUFBZTtRQUNmLFdBQUEsSUFBbUI7UUFDbkIsV0FBQSxJQUFtQixPQUFBLEdBQVUsaUJBQVYsR0FBOEI7UUFDakQsV0FBQSxJQUFlLFNBSm5COztBQU1BLGFBQU87SUFsSFE7Ozs7S0FUUTtBQVAvQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xue1RleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgRnVuY3Rpb25Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnLmZ1bmN0aW9uLWNhbGwnXG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIGEgdG9vbHRpcCBmb3IgdGhlIHdvcmQgZ2l2ZW4uXG4gICAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICAgICAgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgIHRlcm0gICAgICAgICAgIFRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0gIHtQb2ludH0gICAgICBidWZmZXJQb3NpdGlvbiBUaGUgY3Vyc29yIGxvY2F0aW9uIHRoZSB0ZXJtIGlzIGF0LlxuICAgICMjI1xuICAgIGdldFRvb2x0aXBGb3JXb3JkOiAoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICAgICAgdmFsdWUgPSBAcGFyc2VyLmdldE1lbWJlckNvbnRleHQoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbilcblxuICAgICAgICBpZiBub3QgdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGRlc2NyaXB0aW9uID0gXCJcIlxuXG4gICAgICAgICMgU2hvdyB0aGUgbWV0aG9kJ3Mgc2lnbmF0dXJlLlxuICAgICAgICBhY2Nlc3NNb2RpZmllciA9ICcnXG4gICAgICAgIHJldHVyblR5cGUgPSAnJ1xuXG4gICAgICAgIGlmIHZhbHVlLmFyZ3MucmV0dXJuPy50eXBlXG4gICAgICAgICAgICByZXR1cm5UeXBlID0gdmFsdWUuYXJncy5yZXR1cm4udHlwZVxuXG4gICAgICAgIGlmIHZhbHVlLmlzUHVibGljXG4gICAgICAgICAgICBhY2Nlc3NNb2RpZmllciA9ICdwdWJsaWMnXG5cbiAgICAgICAgZWxzZSBpZiB2YWx1ZS5pc1Byb3RlY3RlZFxuICAgICAgICAgICAgYWNjZXNzTW9kaWZpZXIgPSAncHJvdGVjdGVkJ1xuXG4gICAgICAgIGVsc2UgaWYgbm90IHZhbHVlLmlzRnVuY3Rpb24/XG4gICAgICAgICAgICBhY2Nlc3NNb2RpZmllciA9ICdwcml2YXRlJ1xuXG4gICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPHA+PGRpdj5cIlxuXG4gICAgICAgIGlmIHZhbHVlLmlzRnVuY3Rpb24/XG4gICAgICAgICAgZGVzY3JpcHRpb24gKz0gcmV0dXJuVHlwZSArICcgPHN0cm9uZz4nICsgdGVybSArICc8L3N0cm9uZz4nICsgJygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkZXNjcmlwdGlvbiArPSBhY2Nlc3NNb2RpZmllciArICcgJyArIHJldHVyblR5cGUgKyAnIDxzdHJvbmc+JyArIHRlcm0gKyAnPC9zdHJvbmc+JyArICcoJ1xuXG4gICAgICAgIGlmIHZhbHVlLmFyZ3MucGFyYW1ldGVycy5sZW5ndGggPiAwXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSB2YWx1ZS5hcmdzLnBhcmFtZXRlcnMuam9pbignLCAnKTtcblxuICAgICAgICBpZiB2YWx1ZS5hcmdzLm9wdGlvbmFscy5sZW5ndGggPiAwXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAnWydcblxuICAgICAgICAgICAgaWYgdmFsdWUuYXJncy5wYXJhbWV0ZXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAnLCAnXG5cbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IHZhbHVlLmFyZ3Mub3B0aW9uYWxzLmpvaW4oJywgJylcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICddJ1xuXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICcpJ1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAnPC9kaXY+PC9wPidcblxuICAgICAgICAjIFNob3cgdGhlIHN1bW1hcnkgKHNob3J0IGRlc2NyaXB0aW9uKS5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXY+J1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgKGlmIHZhbHVlLmFyZ3MuZGVzY3JpcHRpb25zLnNob3J0IHRoZW4gdmFsdWUuYXJncy5kZXNjcmlwdGlvbnMuc2hvcnQgZWxzZSAnKE5vIGRvY3VtZW50YXRpb24gYXZhaWxhYmxlKScpXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICc8L2Rpdj4nXG5cbiAgICAgICAgIyBTaG93IHRoZSAobG9uZykgZGVzY3JpcHRpb24uXG4gICAgICAgIGlmIHZhbHVlLmFyZ3MuZGVzY3JpcHRpb25zLmxvbmc/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5EZXNjcmlwdGlvbjwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+XCIgKyB2YWx1ZS5hcmdzLmRlc2NyaXB0aW9ucy5sb25nICsgXCI8L2Rpdj5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gXCI8L2Rpdj5cIlxuXG4gICAgICAgICMgU2hvdyB0aGUgcGFyYW1ldGVycyB0aGUgbWV0aG9kIGhhcy5cbiAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uID0gXCJcIlxuXG4gICAgICAgIGZvciBwYXJhbSxpbmZvIG9mIHZhbHVlLmFyZ3MuZG9jUGFyYW1ldGVyc1xuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPHRyPlwiXG5cbiAgICAgICAgICAgIHBhcmFtZXRlcnNEZXNjcmlwdGlvbiArPSBcIjx0ZD7igKImbmJzcDs8c3Ryb25nPlwiXG5cbiAgICAgICAgICAgIGlmIHBhcmFtIGluIHZhbHVlLmFyZ3Mub3B0aW9uYWxzXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiW1wiICsgcGFyYW0gKyBcIl1cIlxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IHBhcmFtXG5cbiAgICAgICAgICAgIHBhcmFtZXRlcnNEZXNjcmlwdGlvbiArPSBcIjwvc3Ryb25nPjwvdGQ+XCJcblxuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPHRkPlwiICsgKGlmIGluZm8udHlwZSB0aGVuIGluZm8udHlwZSBlbHNlICcmbmJzcDsnKSArICc8L3RkPidcbiAgICAgICAgICAgIHBhcmFtZXRlcnNEZXNjcmlwdGlvbiArPSBcIjx0ZD5cIiArIChpZiBpbmZvLmRlc2NyaXB0aW9uIHRoZW4gaW5mby5kZXNjcmlwdGlvbiBlbHNlICcmbmJzcDsnKSArICc8L3RkPidcblxuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPC90cj5cIlxuXG4gICAgICAgIGlmIHBhcmFtZXRlcnNEZXNjcmlwdGlvbi5sZW5ndGggPiAwXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAnPGRpdiBjbGFzcz1cInNlY3Rpb25cIj4nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgXCI8aDQ+UGFyYW1ldGVyczwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+PHRhYmxlPlwiICsgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICsgXCI8L3RhYmxlPjwvZGl2PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSBcIjwvZGl2PlwiXG5cbiAgICAgICAgaWYgdmFsdWUuYXJncy5yZXR1cm4/LnR5cGVcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gJzxzdHJvbmc+JyArIHZhbHVlLmFyZ3MucmV0dXJuLnR5cGUgKyAnPC9zdHJvbmc+J1xuXG4gICAgICAgICAgICBpZiB2YWx1ZS5hcmdzLnJldHVybi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlICs9ICcgJyArIHZhbHVlLmFyZ3MucmV0dXJuLmRlc2NyaXB0aW9uXG5cbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5SZXR1cm5zPC9oND5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGRpdj5cIiArIHJldHVyblZhbHVlICsgXCI8L2Rpdj5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gXCI8L2Rpdj5cIlxuXG4gICAgICAgICMgU2hvdyBhbiBvdmVydmlldyBvZiB0aGUgZXhjZXB0aW9ucyB0aGUgbWV0aG9kIGNhbiB0aHJvdy5cbiAgICAgICAgdGhyb3dzRGVzY3JpcHRpb24gPSBcIlwiXG5cbiAgICAgICAgZm9yIGV4Y2VwdGlvblR5cGUsdGhyb3duV2hlbkRlc2NyaXB0aW9uIG9mIHZhbHVlLmFyZ3MudGhyb3dzXG4gICAgICAgICAgICB0aHJvd3NEZXNjcmlwdGlvbiArPSBcIjxkaXY+XCJcbiAgICAgICAgICAgIHRocm93c0Rlc2NyaXB0aW9uICs9IFwi4oCiIDxzdHJvbmc+XCIgKyBleGNlcHRpb25UeXBlICsgXCI8L3N0cm9uZz5cIlxuXG4gICAgICAgICAgICBpZiB0aHJvd25XaGVuRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB0aHJvd3NEZXNjcmlwdGlvbiArPSAnICcgKyB0aHJvd25XaGVuRGVzY3JpcHRpb25cblxuICAgICAgICAgICAgdGhyb3dzRGVzY3JpcHRpb24gKz0gXCI8L2Rpdj5cIlxuXG4gICAgICAgIGlmIHRocm93c0Rlc2NyaXB0aW9uLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5UaHJvd3M8L2g0PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgXCI8ZGl2PlwiICsgdGhyb3dzRGVzY3JpcHRpb24gKyBcIjwvZGl2PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSBcIjwvZGl2PlwiXG5cbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uXG4iXX0=
