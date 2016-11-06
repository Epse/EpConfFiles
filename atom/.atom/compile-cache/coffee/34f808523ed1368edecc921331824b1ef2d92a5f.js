(function() {
  var Utils;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsS0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUEsR0FDZjtBQUFBLElBQUEsYUFBQSxFQUFlLGFBQWY7QUFBQSxJQUVBLFlBQUEsRUFBYyxTQUFDLE1BQUQsR0FBQTtBQUNaLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBRywyREFBQSxJQUEyQiwrRkFBOUI7ZUFDRSxVQURGO09BQUEsTUFBQTtlQUdFLFdBSEY7T0FEWTtJQUFBLENBRmQ7QUFBQSxJQVNBLDRCQUFBLEVBQThCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTthQUM1QixNQUFNLENBQUMsK0JBQVAsQ0FDRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBMEIsQ0FBQyxTQUFTLENBQUMsMkJBQXJDLENBQWlFLEtBQWpFLENBREYsRUFENEI7SUFBQSxDQVQ5QjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/utils.coffee
