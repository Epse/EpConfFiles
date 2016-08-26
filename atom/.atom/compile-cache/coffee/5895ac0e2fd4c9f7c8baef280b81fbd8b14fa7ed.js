(function() {
  module.exports = {
    findInBuffer: function(buffer, pattern) {
      var found;
      found = [];
      buffer.scan(new RegExp(pattern, 'g'), function(obj) {
        return found.push(obj.range);
      });
      return found;
    },
    findNextInBuffer: function(buffer, curPos, pattern) {
      var found, i, more;
      found = this.findInBuffer(buffer, pattern);
      more = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = found.length; _i < _len; _i++) {
          i = found[_i];
          if (i.compare([curPos, curPos]) === 1) {
            _results.push(i);
          }
        }
        return _results;
      })();
      if (more.length > 0) {
        return more[0].start.row;
      } else if (found.length > 0) {
        return found[0].start.row;
      } else {
        return null;
      }
    },
    findPreviousInBuffer: function(buffer, curPos, pattern) {
      var found, i, less;
      found = this.findInBuffer(buffer, pattern);
      less = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = found.length; _i < _len; _i++) {
          i = found[_i];
          if (i.compare([curPos, curPos]) === -1) {
            _results.push(i);
          }
        }
        return _results;
      })();
      if (less.length > 0) {
        return less[less.length - 1].start.row;
      } else if (found.length > 0) {
        return found[found.length - 1].start.row;
      } else {
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9maW5kLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsWUFBQSxFQUFlLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtBQUNiLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLElBQVAsQ0FBZ0IsSUFBQSxNQUFBLENBQU8sT0FBUCxFQUFnQixHQUFoQixDQUFoQixFQUFzQyxTQUFDLEdBQUQsR0FBQTtlQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBRyxDQUFDLEtBQWYsRUFBVDtNQUFBLENBQXRDLENBREEsQ0FBQTtBQUVBLGFBQU8sS0FBUCxDQUhhO0lBQUEsQ0FEQTtBQUFBLElBTWYsZ0JBQUEsRUFBbUIsU0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixPQUFqQixHQUFBO0FBQ2pCLFVBQUEsY0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQUFzQixPQUF0QixDQUFSLENBQUE7QUFBQSxNQUNBLElBQUE7O0FBQVE7YUFBQSw0Q0FBQTt3QkFBQTtjQUFzQixDQUFDLENBQUMsT0FBRixDQUFVLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBVixDQUFBLEtBQStCO0FBQXJELDBCQUFBLEVBQUE7V0FBQTtBQUFBOztVQURSLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtBQUNFLGVBQU8sSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUssQ0FBQyxHQUFyQixDQURGO09BQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7QUFDSCxlQUFPLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFLLENBQUMsR0FBdEIsQ0FERztPQUFBLE1BQUE7QUFHSCxlQUFPLElBQVAsQ0FIRztPQUxZO0lBQUEsQ0FOSjtBQUFBLElBZ0JmLG9CQUFBLEVBQXVCLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsT0FBakIsR0FBQTtBQUNyQixVQUFBLGNBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsT0FBdEIsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFBOztBQUFRO2FBQUEsNENBQUE7d0JBQUE7Y0FBc0IsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFDLE1BQUQsRUFBUyxNQUFULENBQVYsQ0FBQSxLQUErQixDQUFBO0FBQXJELDBCQUFBLEVBQUE7V0FBQTtBQUFBOztVQURSLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtBQUNFLGVBQU8sSUFBSyxDQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBZCxDQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFuQyxDQURGO09BQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7QUFDSCxlQUFPLEtBQU0sQ0FBQSxLQUFLLENBQUMsTUFBTixHQUFlLENBQWYsQ0FBaUIsQ0FBQyxLQUFLLENBQUMsR0FBckMsQ0FERztPQUFBLE1BQUE7QUFHSCxlQUFPLElBQVAsQ0FIRztPQUxnQjtJQUFBLENBaEJSO0dBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/ex-mode/lib/find.coffee
