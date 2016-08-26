(function() {
  var Utils, path;

  path = require('path');

  module.exports = Utils = {
    MainMenuLabel: 'Haskell IDE',
    getEventType: function(detail) {
      var _ref;
      if (((detail != null ? detail.contextCommand : void 0) != null) || ((detail != null ? (_ref = detail[0]) != null ? _ref.contextCommand : void 0 : void 0) != null)) {
        return 'context';
      } else {
        return 'keyboard';
      }
    },
    bufferPositionFromMouseEvent: function(editor, event) {
      return editor.bufferPositionForScreenPosition(atom.views.getView(editor).component.screenPositionForMouseEvent(event));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvdXRpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBQSxHQUNmO0FBQUEsSUFBQSxhQUFBLEVBQWUsYUFBZjtBQUFBLElBRUEsWUFBQSxFQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ1osVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFHLDJEQUFBLElBQTJCLCtGQUE5QjtlQUNFLFVBREY7T0FBQSxNQUFBO2VBR0UsV0FIRjtPQURZO0lBQUEsQ0FGZDtBQUFBLElBU0EsNEJBQUEsRUFBOEIsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO2FBQzVCLE1BQU0sQ0FBQywrQkFBUCxDQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUEwQixDQUFDLFNBQVMsQ0FBQywyQkFBckMsQ0FBaUUsS0FBakUsQ0FERixFQUQ0QjtJQUFBLENBVDlCO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/utils.coffee
