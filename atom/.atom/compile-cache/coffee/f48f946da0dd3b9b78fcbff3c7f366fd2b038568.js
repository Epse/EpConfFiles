(function() {
  var AnnotationManager, MethodProvider;

  MethodProvider = require('./method-provider.coffee');

  module.exports = AnnotationManager = (function() {
    function AnnotationManager() {}

    AnnotationManager.prototype.providers = [];


    /**
     * Initializes the tooltip providers.
     */

    AnnotationManager.prototype.init = function() {
      var provider, _i, _len, _ref, _results;
      this.providers.push(new MethodProvider());
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.init(this));
      }
      return _results;
    };


    /**
     * Deactivates the tooltip providers.
     */

    AnnotationManager.prototype.deactivate = function() {
      var provider, _i, _len, _ref, _results;
      _ref = this.providers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        provider = _ref[_i];
        _results.push(provider.deactivate());
      }
      return _results;
    };

    return AnnotationManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vYW5ub3RhdGlvbi1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDBCQUFSLENBQWpCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUVNO21DQUNGOztBQUFBLGdDQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBRUE7QUFBQTs7T0FGQTs7QUFBQSxnQ0FLQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0YsVUFBQSxrQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsY0FBQSxDQUFBLENBQXBCLENBQUEsQ0FBQTtBQUVBO0FBQUE7V0FBQSwyQ0FBQTs0QkFBQTtBQUNJLHNCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQUFBLENBREo7QUFBQTtzQkFIRTtJQUFBLENBTE4sQ0FBQTs7QUFXQTtBQUFBOztPQVhBOztBQUFBLGdDQWNBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixVQUFBLGtDQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzRCQUFBO0FBQ0ksc0JBQUEsUUFBUSxDQUFDLFVBQVQsQ0FBQSxFQUFBLENBREo7QUFBQTtzQkFEUTtJQUFBLENBZFosQ0FBQTs7NkJBQUE7O01BTEosQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/annotation/annotation-manager.coffee
