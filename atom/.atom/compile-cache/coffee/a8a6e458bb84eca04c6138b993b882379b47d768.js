(function() {
  var ColorParser;

  module.exports = ColorParser = (function() {
    function ColorParser(registry, context) {
      this.registry = registry;
      this.context = context;
    }

    ColorParser.prototype.parse = function(expression, scope, collectVariables) {
      var e, res, _i, _len, _ref;
      if (scope == null) {
        scope = '*';
      }
      if (collectVariables == null) {
        collectVariables = true;
      }
      if ((expression == null) || expression === '') {
        return void 0;
      }
      _ref = this.registry.getExpressionsForScope(scope);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (e.match(expression)) {
          res = e.parse(expression, this.context);
          if (collectVariables) {
            res.variables = this.context.readUsedVariables();
          }
          return res;
        }
      }
      return void 0;
    };

    return ColorParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wYXJzZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBRSxRQUFGLEVBQWEsT0FBYixHQUFBO0FBQXVCLE1BQXRCLElBQUMsQ0FBQSxXQUFBLFFBQXFCLENBQUE7QUFBQSxNQUFYLElBQUMsQ0FBQSxVQUFBLE9BQVUsQ0FBdkI7SUFBQSxDQUFiOztBQUFBLDBCQUVBLEtBQUEsR0FBTyxTQUFDLFVBQUQsRUFBYSxLQUFiLEVBQXdCLGdCQUF4QixHQUFBO0FBQ0wsVUFBQSxzQkFBQTs7UUFEa0IsUUFBTTtPQUN4Qjs7UUFENkIsbUJBQWlCO09BQzlDO0FBQUEsTUFBQSxJQUF3QixvQkFBSixJQUFtQixVQUFBLEtBQWMsRUFBckQ7QUFBQSxlQUFPLE1BQVAsQ0FBQTtPQUFBO0FBRUE7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBUixDQUFIO0FBQ0UsVUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFSLEVBQW9CLElBQUMsQ0FBQSxPQUFyQixDQUFOLENBQUE7QUFDQSxVQUFBLElBQWdELGdCQUFoRDtBQUFBLFlBQUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxpQkFBVCxDQUFBLENBQWhCLENBQUE7V0FEQTtBQUVBLGlCQUFPLEdBQVAsQ0FIRjtTQURGO0FBQUEsT0FGQTtBQVFBLGFBQU8sTUFBUCxDQVRLO0lBQUEsQ0FGUCxDQUFBOzt1QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-parser.coffee