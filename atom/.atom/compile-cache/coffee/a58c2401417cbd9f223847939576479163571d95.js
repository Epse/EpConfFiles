(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(paths, registry, callback) {
      var results, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-paths-handler');
      this.task = Task.once(taskPath, [paths, registry.serialize()], (function(_this) {
        return function() {
          _this.task = null;
          return callback(results);
        };
      })(this));
      this.task.on('scan-paths:path-scanned', function(result) {
        return results = results.concat(result);
      });
      return this.task;
    },
    terminateRunningTask: function() {
      var _ref;
      return (_ref = this.task) != null ? _ref.terminate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYXRocy1zY2FubmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxJQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLFFBQWxCLEdBQUE7QUFDVCxVQUFBLGlCQUFBOztRQUFBLE9BQVEsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQXhCO0FBQUEsTUFFQSxPQUFBLEdBQVUsRUFGVixDQUFBO0FBQUEsTUFHQSxRQUFBLEdBQVcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsNEJBQWhCLENBSFgsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFBTCxDQUNOLFFBRE0sRUFFTixDQUFDLEtBQUQsRUFBUSxRQUFRLENBQUMsU0FBVCxDQUFBLENBQVIsQ0FGTSxFQUdOLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDRSxVQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVEsSUFBUixDQUFBO2lCQUNBLFFBQUEsQ0FBUyxPQUFULEVBRkY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhNLENBTFIsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMseUJBQVQsRUFBb0MsU0FBQyxNQUFELEdBQUE7ZUFDbEMsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBZixFQUR3QjtNQUFBLENBQXBDLENBYkEsQ0FBQTthQWdCQSxJQUFDLENBQUEsS0FqQlE7SUFBQSxDQUFYO0FBQUEsSUFtQkEsb0JBQUEsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsSUFBQTs4Q0FBSyxDQUFFLFNBQVAsQ0FBQSxXQURvQjtJQUFBLENBbkJ0QjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/paths-scanner.coffee
