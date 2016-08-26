(function() {
  var padZero,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  padZero = function(strToPad, size) {
    while (strToPad.length < size) {
      strToPad = '0' + strToPad;
    }
    return strToPad;
  };

  exports.charCodeFromKeyIdentifier = function(keyIdentifier) {
    if (keyIdentifier.indexOf('U+') === 0) {
      return parseInt(keyIdentifier.slice(2), 16);
    }
  };

  exports.charCodeToKeyIdentifier = function(charCode) {
    return 'U+' + padZero(charCode.toString(16).toUpperCase(), 4);
  };

  exports.vimModeActive = function(editor) {
    if ((editor != null) && (__indexOf.call(editor.classList, 'vim-mode') >= 0 || __indexOf.call(editor.classList, 'vim-mode-plus') >= 0)) {
      if (__indexOf.call(editor.classList, 'operator-pending-mode') >= 0) {
        return true;
      }
      if (__indexOf.call(editor.classList, 'normal-mode') >= 0) {
        return true;
      }
      if (__indexOf.call(editor.classList, 'visual-mode') >= 0) {
        return true;
      }
    }
    return false;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL2hlbHBlcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLE9BQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxTQUFDLFFBQUQsRUFBVyxJQUFYLEdBQUE7QUFDUixXQUFNLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQXhCLEdBQUE7QUFDRSxNQUFBLFFBQUEsR0FBVyxHQUFBLEdBQU0sUUFBakIsQ0FERjtJQUFBLENBQUE7QUFFQSxXQUFPLFFBQVAsQ0FIUTtFQUFBLENBQVYsQ0FBQTs7QUFBQSxFQU1BLE9BQU8sQ0FBQyx5QkFBUixHQUFvQyxTQUFDLGFBQUQsR0FBQTtBQUNsQyxJQUFBLElBQW9DLGFBQWEsQ0FBQyxPQUFkLENBQXNCLElBQXRCLENBQUEsS0FBK0IsQ0FBbkU7YUFBQSxRQUFBLENBQVMsYUFBYyxTQUF2QixFQUE2QixFQUE3QixFQUFBO0tBRGtDO0VBQUEsQ0FOcEMsQ0FBQTs7QUFBQSxFQVNBLE9BQU8sQ0FBQyx1QkFBUixHQUFrQyxTQUFDLFFBQUQsR0FBQTtBQUNoQyxXQUFPLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsRUFBbEIsQ0FBcUIsQ0FBQyxXQUF0QixDQUFBLENBQVIsRUFBNkMsQ0FBN0MsQ0FBZCxDQURnQztFQUFBLENBVGxDLENBQUE7O0FBQUEsRUFZQSxPQUFPLENBQUMsYUFBUixHQUF3QixTQUFDLE1BQUQsR0FBQTtBQUN0QixJQUFBLElBQUcsZ0JBQUEsSUFBWSxDQUFDLGVBQWMsTUFBTSxDQUFDLFNBQXJCLEVBQUEsVUFBQSxNQUFBLElBQWtDLGVBQW1CLE1BQU0sQ0FBQyxTQUExQixFQUFBLGVBQUEsTUFBbkMsQ0FBZjtBQUNFLE1BQUEsSUFBZSxlQUEyQixNQUFNLENBQUMsU0FBbEMsRUFBQSx1QkFBQSxNQUFmO0FBQUEsZUFBTyxJQUFQLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBZSxlQUFpQixNQUFNLENBQUMsU0FBeEIsRUFBQSxhQUFBLE1BQWY7QUFBQSxlQUFPLElBQVAsQ0FBQTtPQURBO0FBRUEsTUFBQSxJQUFlLGVBQWlCLE1BQU0sQ0FBQyxTQUF4QixFQUFBLGFBQUEsTUFBZjtBQUFBLGVBQU8sSUFBUCxDQUFBO09BSEY7S0FBQTtBQUlBLFdBQU8sS0FBUCxDQUxzQjtFQUFBLENBWnhCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/helpers.coffee
