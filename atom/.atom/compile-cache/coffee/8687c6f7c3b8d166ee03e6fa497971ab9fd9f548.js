(function() {
  var FS, prettify, withTempFile;

  FS = require('fs');

  withTempFile = function(contents, callback) {
    var Temp;
    Temp = require('temp');
    return Temp.open({
      prefix: 'haskell-ghc-mod',
      suffix: '.hs'
    }, function(err, info) {
      if (err) {
        console.log(err);
        return;
      }
      FS.writeSync(info.fd, contents);
      return callback(info.path, function() {
        return FS.close(info.fd, function() {
          return FS.unlink(info.path);
        });
      });
    });
  };

  module.exports = prettify = function(text, workingDirectory, _arg) {
    var onComplete, onFailure, shpath;
    onComplete = _arg.onComplete, onFailure = _arg.onFailure;
    shpath = atom.config.get('ide-haskell.cabalPath');
    return withTempFile(text, function(path, close) {
      var BufferedProcess, proc;
      BufferedProcess = require('atom').BufferedProcess;
      proc = new BufferedProcess({
        command: shpath,
        args: ['format', path],
        options: {
          cwd: workingDirectory
        },
        exit: function(code) {
          if (code === 0) {
            return FS.readFile(path, {
              encoding: 'utf-8'
            }, function(error, text) {
              if (error != null) {
                console.error(error);
                return typeof onFailure === "function" ? onFailure({
                  message: "Ide-haskell could not read " + path,
                  detail: "" + error
                }) : void 0;
              } else {
                return typeof onComplete === "function" ? onComplete(text) : void 0;
              }
            });
          } else {
            return typeof onFailure === "function" ? onFailure({
              message: "Failed to prettify",
              detail: "cabal format ended with non-zero exit code " + code
            }) : void 0;
          }
        }
      });
      return proc.onWillThrowError(function(_arg1) {
        var error, handle;
        error = _arg1.error, handle = _arg1.handle;
        console.error(error);
        close();
        if (typeof onFailure === "function") {
          onFailure({
            message: "Ide-haskell could not spawn " + shpath,
            detail: "" + error
          });
        }
        return handle();
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9iaW51dGlscy91dGlsLWNhYmFsLWZvcm1hdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEJBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLFNBQUMsUUFBRCxFQUFXLFFBQVgsR0FBQTtBQUNiLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTtXQUNBLElBQUksQ0FBQyxJQUFMLENBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBTyxpQkFBUDtBQUFBLE1BQ0EsTUFBQSxFQUFPLEtBRFA7S0FERixFQUdFLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNFLE1BQUEsSUFBRyxHQUFIO0FBQ0UsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVosQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZGO09BQUE7QUFBQSxNQUdBLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBSSxDQUFDLEVBQWxCLEVBQXNCLFFBQXRCLENBSEEsQ0FBQTthQUlBLFFBQUEsQ0FBUyxJQUFJLENBQUMsSUFBZCxFQUFvQixTQUFBLEdBQUE7ZUFDbEIsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFrQixTQUFBLEdBQUE7aUJBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFJLENBQUMsSUFBZixFQUFIO1FBQUEsQ0FBbEIsRUFEa0I7TUFBQSxDQUFwQixFQUxGO0lBQUEsQ0FIRixFQUZhO0VBQUEsQ0FGZixDQUFBOztBQUFBLEVBZ0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLGdCQUFQLEVBQXlCLElBQXpCLEdBQUE7QUFDVCxRQUFBLDZCQUFBO0FBQUEsSUFEbUMsa0JBQUEsWUFBWSxpQkFBQSxTQUMvQyxDQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFULENBQUE7V0FFQSxZQUFBLENBQWEsSUFBYixFQUFtQixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDakIsVUFBQSxxQkFBQTtBQUFBLE1BQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFXLElBQUEsZUFBQSxDQUNUO0FBQUEsUUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLElBQVgsQ0FETjtBQUFBLFFBRUEsT0FBQSxFQUNFO0FBQUEsVUFBQSxHQUFBLEVBQUssZ0JBQUw7U0FIRjtBQUFBLFFBSUEsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osVUFBQSxJQUFHLElBQUEsS0FBUSxDQUFYO21CQUNFLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixFQUFrQjtBQUFBLGNBQUEsUUFBQSxFQUFVLE9BQVY7YUFBbEIsRUFBcUMsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ25DLGNBQUEsSUFBRyxhQUFIO0FBQ0UsZ0JBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLENBQUEsQ0FBQTt5REFDQSxVQUFXO0FBQUEsa0JBQ1QsT0FBQSxFQUFVLDZCQUFBLEdBQTZCLElBRDlCO0FBQUEsa0JBRVQsTUFBQSxFQUFRLEVBQUEsR0FBRyxLQUZGOzRCQUZiO2VBQUEsTUFBQTswREFPRSxXQUFZLGVBUGQ7ZUFEbUM7WUFBQSxDQUFyQyxFQURGO1dBQUEsTUFBQTtxREFXRSxVQUFXO0FBQUEsY0FDVCxPQUFBLEVBQVMsb0JBREE7QUFBQSxjQUVULE1BQUEsRUFBUyw2Q0FBQSxHQUE2QyxJQUY3Qzt3QkFYYjtXQURJO1FBQUEsQ0FKTjtPQURTLENBRFgsQ0FBQTthQXVCQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBQyxLQUFELEdBQUE7QUFDcEIsWUFBQSxhQUFBO0FBQUEsUUFEc0IsY0FBQSxPQUFPLGVBQUEsTUFDN0IsQ0FBQTtBQUFBLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFBLENBREEsQ0FBQTs7VUFFQSxVQUFXO0FBQUEsWUFDVCxPQUFBLEVBQVUsOEJBQUEsR0FBOEIsTUFEL0I7QUFBQSxZQUVULE1BQUEsRUFBUSxFQUFBLEdBQUcsS0FGRjs7U0FGWDtlQU1BLE1BQUEsQ0FBQSxFQVBvQjtNQUFBLENBQXRCLEVBeEJpQjtJQUFBLENBQW5CLEVBSFM7RUFBQSxDQWpCWCxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/binutils/util-cabal-format.coffee
