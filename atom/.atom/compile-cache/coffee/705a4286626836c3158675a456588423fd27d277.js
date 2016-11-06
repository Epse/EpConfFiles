(function() {
  var balanced, concat, list, listMaybe, rxToStr,
    __slice = [].slice;

  rxToStr = function(rx) {
    if (typeof rx === 'object') {
      return rx.source;
    } else {
      return rx;
    }
  };

  list = function(s, sep) {
    return "((?:" + (rxToStr(s)) + ")(?:(?:" + (rxToStr(sep)) + ")(?:" + (rxToStr(s)) + "))*)";
  };

  listMaybe = function(s, sep) {
    return "" + (list(s, sep)) + "?";
  };

  concat = function() {
    var list, r;
    list = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    r = ''.concat.apply('', list.map(function(i) {
      return "(?:" + (rxToStr(i)) + ")";
    }));
    return "(?:" + r + ")";
  };

  balanced = function(name, left, right, inner, ignore) {
    if (ignore == null) {
      ignore = '';
    }
    if (inner != null) {
      return "(?<" + name + ">(?:" + inner + "|[^" + left + right + ignore + "]|" + left + "\\g<" + name + ">" + right + ")*)";
    } else {
      return "(?<" + name + ">(?:[^" + left + right + ignore + "]|" + left + "\\g<" + name + ">" + right + ")*)";
    }
  };

  module.exports = {
    list: list,
    listMaybe: listMaybe,
    concat: concat,
    balanced: balanced
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvdXRpbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMENBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxTQUFDLEVBQUQsR0FBQTtBQUNSLElBQUEsSUFBRyxNQUFBLENBQUEsRUFBQSxLQUFhLFFBQWhCO2FBQ0UsRUFBRSxDQUFDLE9BREw7S0FBQSxNQUFBO2FBR0UsR0FIRjtLQURRO0VBQUEsQ0FBVixDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLFNBQUMsQ0FBRCxFQUFJLEdBQUosR0FBQTtXQUVKLE1BQUEsR0FBSyxDQUFDLE9BQUEsQ0FBUSxDQUFSLENBQUQsQ0FBTCxHQUFnQixTQUFoQixHQUF3QixDQUFDLE9BQUEsQ0FBUSxHQUFSLENBQUQsQ0FBeEIsR0FBcUMsTUFBckMsR0FBMEMsQ0FBQyxPQUFBLENBQVEsQ0FBUixDQUFELENBQTFDLEdBQXFELE9BRmpEO0VBQUEsQ0FOUCxDQUFBOztBQUFBLEVBVUEsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLEdBQUosR0FBQTtXQUVWLEVBQUEsR0FBRSxDQUFDLElBQUEsQ0FBSyxDQUFMLEVBQVEsR0FBUixDQUFELENBQUYsR0FBZ0IsSUFGTjtFQUFBLENBVlosQ0FBQTs7QUFBQSxFQWNBLE1BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLE9BQUE7QUFBQSxJQURRLDhEQUNSLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxFQUFFLENBQUMsTUFBSCxXQUFXLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQyxDQUFELEdBQUE7YUFBUSxLQUFBLEdBQUksQ0FBQyxPQUFBLENBQVEsQ0FBUixDQUFELENBQUosR0FBZSxJQUF2QjtJQUFBLENBQVQsQ0FBWCxDQUFKLENBQUE7V0FDQyxLQUFBLEdBQUssQ0FBTCxHQUFPLElBRkQ7RUFBQSxDQWRULENBQUE7O0FBQUEsRUFrQkEsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEVBQW9CLEtBQXBCLEVBQTJCLE1BQTNCLEdBQUE7O01BQTJCLFNBQVM7S0FDN0M7QUFBQSxJQUFBLElBQUcsYUFBSDthQUNHLEtBQUEsR0FBSyxJQUFMLEdBQVUsTUFBVixHQUFnQixLQUFoQixHQUFzQixLQUF0QixHQUEyQixJQUEzQixHQUFrQyxLQUFsQyxHQUEwQyxNQUExQyxHQUFpRCxJQUFqRCxHQUFxRCxJQUFyRCxHQUEwRCxNQUExRCxHQUFnRSxJQUFoRSxHQUFxRSxHQUFyRSxHQUF3RSxLQUF4RSxHQUE4RSxNQURqRjtLQUFBLE1BQUE7YUFHRyxLQUFBLEdBQUssSUFBTCxHQUFVLFFBQVYsR0FBa0IsSUFBbEIsR0FBeUIsS0FBekIsR0FBaUMsTUFBakMsR0FBd0MsSUFBeEMsR0FBNEMsSUFBNUMsR0FBaUQsTUFBakQsR0FBdUQsSUFBdkQsR0FBNEQsR0FBNUQsR0FBK0QsS0FBL0QsR0FBcUUsTUFIeEU7S0FEUztFQUFBLENBbEJYLENBQUE7O0FBQUEsRUF3QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLE1BQUEsSUFBRDtBQUFBLElBQU8sV0FBQSxTQUFQO0FBQUEsSUFBa0IsUUFBQSxNQUFsQjtBQUFBLElBQTBCLFVBQUEsUUFBMUI7R0F4QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/src/include/util.coffee
