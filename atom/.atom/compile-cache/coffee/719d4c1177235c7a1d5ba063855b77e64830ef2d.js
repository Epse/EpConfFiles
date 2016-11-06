(function() {
  var ColorContext, ColorSearch, Emitter, Minimatch, registry, _ref;

  _ref = [], Emitter = _ref[0], Minimatch = _ref[1], ColorContext = _ref[2], registry = _ref[3];

  module.exports = ColorSearch = (function() {
    ColorSearch.deserialize = function(state) {
      return new ColorSearch(state.options);
    };

    function ColorSearch(options) {
      var subscription, _ref1;
      this.options = options != null ? options : {};
      _ref1 = this.options, this.sourceNames = _ref1.sourceNames, this.ignoredNameSources = _ref1.ignoredNames, this.context = _ref1.context, this.project = _ref1.project;
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      if (this.project != null) {
        this.init();
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pkg.mainModule.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    }

    ColorSearch.prototype.init = function() {
      var error, ignore, _i, _len, _ref1;
      if (Minimatch == null) {
        Minimatch = require('minimatch').Minimatch;
      }
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (this.context == null) {
        this.context = new ColorContext({
          registry: this.project.getColorExpressionsRegistry()
        });
      }
      this.parser = this.context.parser;
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      if (this.ignoredNameSources == null) {
        this.ignoredNameSources = [];
      }
      this.ignoredNames = [];
      _ref1 = this.ignoredNameSources;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignore = _ref1[_i];
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
      if (this.searchRequested) {
        return this.search();
      }
    };

    ColorSearch.prototype.getTitle = function() {
      return 'Pigments Find Results';
    };

    ColorSearch.prototype.getURI = function() {
      return 'pigments://search';
    };

    ColorSearch.prototype.getIconName = function() {
      return "pigments";
    };

    ColorSearch.prototype.onDidFindMatches = function(callback) {
      return this.emitter.on('did-find-matches', callback);
    };

    ColorSearch.prototype.onDidCompleteSearch = function(callback) {
      return this.emitter.on('did-complete-search', callback);
    };

    ColorSearch.prototype.search = function() {
      var promise, re, results;
      if (this.project == null) {
        this.searchRequested = true;
        return;
      }
      re = new RegExp(this.project.getColorExpressionsRegistry().getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, scope, _i, _len, _ref1, _ref2;
          relativePath = atom.project.relativize(m.filePath);
          scope = _this.project.scopeFromFileName(relativePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref1 = m.matches;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
            result.color = _this.parser.parse(result.matchText, scope);
            if (!((_ref2 = result.color) != null ? _ref2.isValid() : void 0)) {
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
      var ignoredName, _i, _len, _ref1;
      _ref1 = this.ignoredNames;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignoredName = _ref1[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    ColorSearch.prototype.serialize = function() {
      return {
        deserializer: 'ColorSearch',
        options: {
          sourceNames: this.sourceNames,
          ignoredNames: this.ignoredNameSources
        }
      };
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1zZWFyY2guY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBOztBQUFBLEVBQUEsT0FBK0MsRUFBL0MsRUFBQyxpQkFBRCxFQUFVLG1CQUFWLEVBQXFCLHNCQUFyQixFQUFtQyxrQkFBbkMsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFdBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFBZSxJQUFBLFdBQUEsQ0FBWSxLQUFLLENBQUMsT0FBbEIsRUFBZjtJQUFBLENBQWQsQ0FBQTs7QUFFYSxJQUFBLHFCQUFFLE9BQUYsR0FBQTtBQUNYLFVBQUEsbUJBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSw0QkFBQSxVQUFRLEVBQ3JCLENBQUE7QUFBQSxNQUFBLFFBQXdFLElBQUMsQ0FBQSxPQUF6RSxFQUFDLElBQUMsQ0FBQSxvQkFBQSxXQUFGLEVBQTZCLElBQUMsQ0FBQSwyQkFBZixZQUFmLEVBQWtELElBQUMsQ0FBQSxnQkFBQSxPQUFuRCxFQUE0RCxJQUFDLENBQUEsZ0JBQUEsT0FBN0QsQ0FBQTtBQUNBLE1BQUEsSUFBa0MsZUFBbEM7QUFBQSxRQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7T0FEQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FGWCxDQUFBO0FBSUEsTUFBQSxJQUFHLG9CQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFkLENBQW1DLENBQUEsU0FBQSxL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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-search.coffee
