(function() {
  var ColorContext, ColorParser, ColorSearch, Emitter, Minimatch, getRegistry;

  Emitter = require('atom').Emitter;

  Minimatch = require('minimatch').Minimatch;

  getRegistry = require('./color-expressions').getRegistry;

  ColorParser = require('./color-parser');

  ColorContext = require('./color-context');

  module.exports = ColorSearch = (function() {
    function ColorSearch(options) {
      var error, ignore, ignoredNames, _i, _len;
      if (options == null) {
        options = {};
      }
      this.sourceNames = options.sourceNames, ignoredNames = options.ignoredNames, this.context = options.context;
      this.emitter = new Emitter;
      this.parser = new ColorParser;
      if (this.context == null) {
        this.context = new ColorContext([]);
      }
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      this.context.parser = this.parser;
      if (ignoredNames == null) {
        ignoredNames = [];
      }
      this.ignoredNames = [];
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (ignore != null) {
          try {
            this.ignoredNames.push(new Minimatch(ignore, {
              matchBase: true,
              dot: true
            }));
          } catch (_error) {
            error = _error;
            console.warn("Error parsing ignore pattern (" + ignore + "): " + error.message);
          }
        }
      }
    }

    ColorSearch.prototype.onDidFindMatches = function(callback) {
      return this.emitter.on('did-find-matches', callback);
    };

    ColorSearch.prototype.onDidCompleteSearch = function(callback) {
      return this.emitter.on('did-complete-search', callback);
    };

    ColorSearch.prototype.search = function() {
      var promise, re, registry, results;
      registry = getRegistry(this.context);
      re = new RegExp(registry.getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, _i, _len, _ref, _ref1;
          relativePath = atom.project.relativize(m.filePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref = m.matches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            result = _ref[_i];
            result.color = _this.parser.parse(result.matchText, _this.context);
            if (!((_ref1 = result.color) != null ? _ref1.isValid() : void 0)) {
              continue;
            }
            if (result.range[0] == null) {
              console.warn("Color search returned a result with an invalid range", result);
              continue;
            }
            result.range[0][1] += result.matchText.indexOf(result.color.colorExpression);
            result.matchText = result.color.colorExpression;
            results.push(result);
            newMatches.push(result);
          }
          m.matches = newMatches;
          if (m.matches.length > 0) {
            return _this.emitter.emit('did-find-matches', m);
          }
        };
      })(this));
      return promise.then((function(_this) {
        return function() {
          _this.results = results;
          return _this.emitter.emit('did-complete-search', results);
        };
      })(this));
    };

    ColorSearch.prototype.isIgnored = function(relativePath) {
      var ignoredName, _i, _len, _ref;
      _ref = this.ignoredNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ignoredName = _ref[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3Itc2VhcmNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1RUFBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFDQyxZQUFhLE9BQUEsQ0FBUSxXQUFSLEVBQWIsU0FERCxDQUFBOztBQUFBLEVBRUMsY0FBZSxPQUFBLENBQVEscUJBQVIsRUFBZixXQUZELENBQUE7O0FBQUEsRUFHQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBSGQsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FKZixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUMsT0FBRCxHQUFBO0FBQ1gsVUFBQSxxQ0FBQTs7UUFEWSxVQUFRO09BQ3BCO0FBQUEsTUFBQyxJQUFDLENBQUEsc0JBQUEsV0FBRixFQUFlLHVCQUFBLFlBQWYsRUFBNkIsSUFBQyxDQUFBLGtCQUFBLE9BQTlCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxHQUFBLENBQUEsV0FGVixDQUFBOztRQUdBLElBQUMsQ0FBQSxVQUFlLElBQUEsWUFBQSxDQUFhLEVBQWI7T0FIaEI7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQUEsQ0FKYixDQUFBOztRQUtBLElBQUMsQ0FBQSxjQUFlO09BTGhCO0FBQUEsTUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0IsSUFBQyxDQUFBLE1BTm5CLENBQUE7O1FB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

//# sourceURL=/home/epse/.atom/packages/pigments/lib/color-search.coffee
