(function() {
  var Prettify,
    __slice = [].slice;

  module.exports = Prettify = {
    prettifyFile: function(editor, format) {
      var cursors, firstCursor, getRootDir, prettify, workDir, _ref;
      if (format == null) {
        format = 'haskell';
      }
      _ref = editor.getCursors().map(function(cursor) {
        return cursor.getBufferPosition();
      }), firstCursor = _ref[0], cursors = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      prettify = (function() {
        switch (format) {
          case 'haskell':
            return require('./util-stylish-haskell');
          case 'cabal':
            return require('./util-cabal-format');
          default:
            throw new Error("Unknown format " + format);
        }
      })();
      getRootDir = require('atom-haskell-utils').getRootDir;
      workDir = getRootDir(editor.getBuffer()).getPath();
      return prettify(editor.getText(), workDir, {
        onComplete: function(text) {
          editor.setText(text);
          if (editor.getLastCursor() != null) {
            editor.getLastCursor().setBufferPosition(firstCursor, {
              autoscroll: false
            });
            return cursors.forEach(function(cursor) {
              return editor.addCursorAtBufferPosition(cursor, {
                autoscroll: false
              });
            });
          }
        },
        onFailure: function(_arg) {
          var detail, message;
          message = _arg.message, detail = _arg.detail;
          return atom.notifications.addError(message, {
            detail: detail
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9iaW51dGlscy9wcmV0dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBQSxHQUNmO0FBQUEsSUFBQSxZQUFBLEVBQWMsU0FBQyxNQUFELEVBQVMsTUFBVCxHQUFBO0FBQ1osVUFBQSx5REFBQTs7UUFEcUIsU0FBUztPQUM5QjtBQUFBLE1BQUEsT0FBNEIsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLEdBQXBCLENBQXdCLFNBQUMsTUFBRCxHQUFBO2VBQ2xELE1BQU0sQ0FBQyxpQkFBUCxDQUFBLEVBRGtEO01BQUEsQ0FBeEIsQ0FBNUIsRUFBQyxxQkFBRCxFQUFjLHVEQUFkLENBQUE7QUFBQSxNQUVBLFFBQUE7QUFBVyxnQkFBTyxNQUFQO0FBQUEsZUFDSixTQURJO21CQUNXLE9BQUEsQ0FBUSx3QkFBUixFQURYO0FBQUEsZUFFSixPQUZJO21CQUVTLE9BQUEsQ0FBUSxxQkFBUixFQUZUO0FBQUE7QUFHSixrQkFBVSxJQUFBLEtBQUEsQ0FBTyxpQkFBQSxHQUFpQixNQUF4QixDQUFWLENBSEk7QUFBQTtVQUZYLENBQUE7QUFBQSxNQU1DLGFBQWMsT0FBQSxDQUFRLG9CQUFSLEVBQWQsVUFORCxDQUFBO0FBQUEsTUFPQSxPQUFBLEdBQVUsVUFBQSxDQUFXLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBWCxDQUE4QixDQUFDLE9BQS9CLENBQUEsQ0FQVixDQUFBO2FBUUEsUUFBQSxDQUFTLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBVCxFQUEyQixPQUEzQixFQUNFO0FBQUEsUUFBQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFDVixVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixDQUFBLENBQUE7QUFDQSxVQUFBLElBQUcsOEJBQUg7QUFDRSxZQUFBLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxpQkFBdkIsQ0FBeUMsV0FBekMsRUFDRTtBQUFBLGNBQUEsVUFBQSxFQUFZLEtBQVo7YUFERixDQUFBLENBQUE7bUJBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxNQUFELEdBQUE7cUJBQ2QsTUFBTSxDQUFDLHlCQUFQLENBQWlDLE1BQWpDLEVBQ0U7QUFBQSxnQkFBQSxVQUFBLEVBQVksS0FBWjtlQURGLEVBRGM7WUFBQSxDQUFoQixFQUhGO1dBRlU7UUFBQSxDQUFaO0FBQUEsUUFRQSxTQUFBLEVBQVcsU0FBQyxJQUFELEdBQUE7QUFDVCxjQUFBLGVBQUE7QUFBQSxVQURXLGVBQUEsU0FBUyxjQUFBLE1BQ3BCLENBQUE7aUJBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixPQUE1QixFQUFxQztBQUFBLFlBQUMsUUFBQSxNQUFEO1dBQXJDLEVBRFM7UUFBQSxDQVJYO09BREYsRUFUWTtJQUFBLENBQWQ7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/binutils/prettify.coffee
