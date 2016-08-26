(function() {
  var cubes, list, math, num, number, opposite, race, square,
    __slice = [].slice;

  number = 42;

  opposite = true;

  if (opposite) {
    number = -42;
  }

  square = function(x) {
    return x * x;
  };

  list = [1, 2, 3, 4, 5];

  math = {
    root: Math.sqrt,
    square: square,
    cube: function(x) {
      return x * square(x);
    }
  };

  race = function() {
    var runners, winner;
    winner = arguments[0], runners = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  if (typeof elvis !== "undefined" && elvis !== null) {
    alert("I knew it!");
  }

  cubes = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      num = list[_i];
      _results.push(math.cube(num));
    }
    return _results;
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9zZXRpLXN5bnRheC9zYW1wbGUtZmlsZXMvQ29mZmVTY3JpcHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLHNEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLElBRFgsQ0FBQTs7QUFJQSxFQUFBLElBQWdCLFFBQWhCO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBQUE7R0FKQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtXQUFPLENBQUEsR0FBSSxFQUFYO0VBQUEsQ0FQVCxDQUFBOztBQUFBLEVBVUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FWUCxDQUFBOztBQUFBLEVBYUEsSUFBQSxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQVEsSUFBSSxDQUFDLElBQWI7QUFBQSxJQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsSUFFQSxJQUFBLEVBQVEsU0FBQyxDQUFELEdBQUE7YUFBTyxDQUFBLEdBQUksTUFBQSxDQUFPLENBQVAsRUFBWDtJQUFBLENBRlI7R0FkRixDQUFBOztBQUFBLEVBbUJBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxRQUFBLGVBQUE7QUFBQSxJQURNLHVCQUFRLGlFQUNkLENBQUE7V0FBQSxLQUFBLENBQU0sTUFBTixFQUFjLE9BQWQsRUFESztFQUFBLENBbkJQLENBQUE7O0FBdUJBLEVBQUEsSUFBc0IsOENBQXRCO0FBQUEsSUFBQSxLQUFBLENBQU0sWUFBTixDQUFBLENBQUE7R0F2QkE7O0FBQUEsRUEwQkEsS0FBQTs7QUFBUztTQUFBLDJDQUFBO3FCQUFBO0FBQUEsb0JBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQUEsQ0FBQTtBQUFBOztNQTFCVCxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/seti-syntax/sample-files/CoffeScript.coffee
