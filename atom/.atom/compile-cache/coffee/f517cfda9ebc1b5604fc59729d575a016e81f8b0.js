(function() {
  var AbstractProvider, ConstantProvider, config, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = ConstantProvider = (function(_super) {
    __extends(ConstantProvider, _super);

    function ConstantProvider() {
      return ConstantProvider.__super__.constructor.apply(this, arguments);
    }

    ConstantProvider.prototype.constants = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ConstantProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([A-Z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.constants = proxy.constants();
      if (((_ref = this.constants) != null ? _ref.names : void 0) == null) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix.trim());
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix Prefix to match
     * @return array
     */

    ConstantProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var element, suggestions, word, words, _i, _j, _len, _len1, _ref;
      words = fuzzaldrin.filter(this.constants.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        _ref = this.constants.values[word];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          element = _ref[_j];
          suggestions.push({
            text: word,
            type: 'constant',
            description: 'Built-in PHP constant.'
          });
        }
      }
      return suggestions;
    };

    return ConstantProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vY29uc3RhbnQtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUpuQixDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUixDQU5ULENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUdNO0FBQ0YsdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBRUE7QUFBQTs7O09BRkE7O0FBQUEsK0JBTUEsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFFZCxVQUFBLGtFQUFBO0FBQUEsTUFGZ0IsY0FBQSxRQUFRLHNCQUFBLGdCQUFnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUV6RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLDZDQUFULENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkIsQ0FGVCxDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLGNBQUEsQ0FBQTtPQUhBO0FBQUEsTUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBQUssQ0FBQyxTQUFOLENBQUEsQ0FMYixDQUFBO0FBTUEsTUFBQSxJQUFjLCtEQUFkO0FBQUEsY0FBQSxDQUFBO09BTkE7QUFBQSxNQVFBLFdBQUEsR0FBYyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUExQixDQVJkLENBQUE7QUFTQSxNQUFBLElBQUEsQ0FBQSxXQUF5QixDQUFDLE1BQTFCO0FBQUEsY0FBQSxDQUFBO09BVEE7QUFVQSxhQUFPLFdBQVAsQ0FaYztJQUFBLENBTmxCLENBQUE7O0FBb0JBO0FBQUE7Ozs7T0FwQkE7O0FBQUEsK0JBeUJBLHdCQUFBLEdBQTBCLFNBQUMsTUFBRCxHQUFBO0FBRXRCLFVBQUEsNERBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQTdCLEVBQW9DLE1BQXBDLENBQVIsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUlBLFdBQUEsNENBQUE7eUJBQUE7QUFDSTtBQUFBLGFBQUEsNkNBQUE7NkJBQUE7QUFDSSxVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQ0k7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFDQSxJQUFBLEVBQU0sVUFETjtBQUFBLFlBRUEsV0FBQSxFQUFhLHdCQUZiO1dBREosQ0FBQSxDQURKO0FBQUEsU0FESjtBQUFBLE9BSkE7QUFXQSxhQUFPLFdBQVAsQ0Fic0I7SUFBQSxDQXpCMUIsQ0FBQTs7NEJBQUE7O0tBRDJCLGlCQVgvQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/autocompletion/constant-provider.coffee
