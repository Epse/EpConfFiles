(function() {
  var Prettify, getRootDir, utilCabalFormat, utilStylishHaskell,
    __slice = [].slice;

  getRootDir = require('atom-haskell-utils').getRootDir;

  utilStylishHaskell = require('./util-stylish-haskell');

  utilCabalFormat = require('./util-cabal-format');

  module.exports = Prettify = {
    prettifyFile: function(editor, format) {
      var cursors, firstCursor, util, workDir, _ref;
      if (format == null) {
        format = 'haskell';
      }
      _ref = editor.getCursors().map(function(cursor) {
        return cursor.getBufferPosition();
      }), firstCursor = _ref[0], cursors = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      util = (function() {
        switch (format) {
          case 'haskell':
            return utilStylishHaskell;
          case 'cabal':
            return utilCabalFormat;
          default:
            throw new Error("Unknown format " + format);
        }
      })();
      workDir = getRootDir(editor.getBuffer()).getPath();
      return util.prettify(editor.getText(), workDir, {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvYmludXRpbHMvcHJldHRpZnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxvQkFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQURyQixDQUFBOztBQUFBLEVBRUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtBQUFBLElBQUEsWUFBQSxFQUFjLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNaLFVBQUEseUNBQUE7O1FBRHFCLFNBQVM7T0FDOUI7QUFBQSxNQUFBLE9BQTRCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QixTQUFDLE1BQUQsR0FBQTtlQUNsRCxNQUFNLENBQUMsaUJBQVAsQ0FBQSxFQURrRDtNQUFBLENBQXhCLENBQTVCLEVBQUMscUJBQUQsRUFBYyx1REFBZCxDQUFBO0FBQUEsTUFFQSxJQUFBO0FBQU8sZ0JBQU8sTUFBUDtBQUFBLGVBQ0EsU0FEQTttQkFDZSxtQkFEZjtBQUFBLGVBRUEsT0FGQTttQkFFYSxnQkFGYjtBQUFBO0FBR0Esa0JBQVUsSUFBQSxLQUFBLENBQU8saUJBQUEsR0FBaUIsTUFBeEIsQ0FBVixDQUhBO0FBQUE7VUFGUCxDQUFBO0FBQUEsTUFNQSxPQUFBLEdBQVUsVUFBQSxDQUFXLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBWCxDQUE4QixDQUFDLE9BQS9CLENBQUEsQ0FOVixDQUFBO2FBT0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWQsRUFBZ0MsT0FBaEMsRUFDRTtBQUFBLFFBQUEsVUFBQSxFQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxJQUFHLDhCQUFIO0FBQ0UsWUFBQSxNQUFNLENBQUMsYUFBUCxDQUFBLENBQXNCLENBQUMsaUJBQXZCLENBQXlDLFdBQXpDLEVBQ0U7QUFBQSxjQUFBLFVBQUEsRUFBWSxLQUFaO2FBREYsQ0FBQSxDQUFBO21CQUVBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQUMsTUFBRCxHQUFBO3FCQUNkLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxNQUFqQyxFQUNFO0FBQUEsZ0JBQUEsVUFBQSxFQUFZLEtBQVo7ZUFERixFQURjO1lBQUEsQ0FBaEIsRUFIRjtXQUZVO1FBQUEsQ0FBWjtBQUFBLFFBUUEsU0FBQSxFQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1QsY0FBQSxlQUFBO0FBQUEsVUFEVyxlQUFBLFNBQVMsY0FBQSxNQUNwQixDQUFBO2lCQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsT0FBNUIsRUFBcUM7QUFBQSxZQUFDLFFBQUEsTUFBRDtXQUFyQyxFQURTO1FBQUEsQ0FSWDtPQURGLEVBUlk7SUFBQSxDQUFkO0dBTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/binutils/prettify.coffee
