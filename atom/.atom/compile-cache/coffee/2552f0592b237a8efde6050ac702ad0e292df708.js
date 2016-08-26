(function() {
  var BufferedProcess, FS, Temp, path, prettify, withTempFile;

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  Temp = require('temp');

  FS = require('fs');

  withTempFile = function(contents, callback) {
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

  prettify = function(text, workingDirectory, _arg) {
    var onComplete, onFailure, shpath;
    onComplete = _arg.onComplete, onFailure = _arg.onFailure;
    shpath = atom.config.get('ide-haskell.cabalPath');
    return withTempFile(text, function(path, close) {
      var proc;
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

  module.exports = {
    prettify: prettify
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvYmludXRpbHMvdXRpbC1jYWJhbC1mb3JtYXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLFlBQUEsR0FBZSxTQUFDLFFBQUQsRUFBVyxRQUFYLEdBQUE7V0FDYixJQUFJLENBQUMsSUFBTCxDQUNFO0FBQUEsTUFBQSxNQUFBLEVBQU8saUJBQVA7QUFBQSxNQUNBLE1BQUEsRUFBTyxLQURQO0tBREYsRUFHRSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDRSxNQUFBLElBQUcsR0FBSDtBQUNFLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGRjtPQUFBO0FBQUEsTUFHQSxFQUFFLENBQUMsU0FBSCxDQUFhLElBQUksQ0FBQyxFQUFsQixFQUFzQixRQUF0QixDQUhBLENBQUE7YUFJQSxRQUFBLENBQVMsSUFBSSxDQUFDLElBQWQsRUFBb0IsU0FBQSxHQUFBO2VBQ2xCLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBSSxDQUFDLEVBQWQsRUFBa0IsU0FBQSxHQUFBO2lCQUFHLEVBQUUsQ0FBQyxNQUFILENBQVUsSUFBSSxDQUFDLElBQWYsRUFBSDtRQUFBLENBQWxCLEVBRGtCO01BQUEsQ0FBcEIsRUFMRjtJQUFBLENBSEYsRUFEYTtFQUFBLENBTGYsQ0FBQTs7QUFBQSxFQWtCQSxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sZ0JBQVAsRUFBeUIsSUFBekIsR0FBQTtBQUNULFFBQUEsNkJBQUE7QUFBQSxJQURtQyxrQkFBQSxZQUFZLGlCQUFBLFNBQy9DLENBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQVQsQ0FBQTtXQUVBLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNqQixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBVyxJQUFBLGVBQUEsQ0FDVDtBQUFBLFFBQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxJQUFYLENBRE47QUFBQSxRQUVBLE9BQUEsRUFDRTtBQUFBLFVBQUEsR0FBQSxFQUFLLGdCQUFMO1NBSEY7QUFBQSxRQUlBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtBQUNKLFVBQUEsSUFBRyxJQUFBLEtBQVEsQ0FBWDttQkFDRSxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosRUFBa0I7QUFBQSxjQUFBLFFBQUEsRUFBVSxPQUFWO2FBQWxCLEVBQXFDLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNuQyxjQUFBLElBQUcsYUFBSDtBQUNFLGdCQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxDQUFBLENBQUE7eURBQ0EsVUFBVztBQUFBLGtCQUNULE9BQUEsRUFBVSw2QkFBQSxHQUE2QixJQUQ5QjtBQUFBLGtCQUVULE1BQUEsRUFBUSxFQUFBLEdBQUcsS0FGRjs0QkFGYjtlQUFBLE1BQUE7MERBT0UsV0FBWSxlQVBkO2VBRG1DO1lBQUEsQ0FBckMsRUFERjtXQUFBLE1BQUE7cURBV0UsVUFBVztBQUFBLGNBQ1QsT0FBQSxFQUFTLG9CQURBO0FBQUEsY0FFVCxNQUFBLEVBQVMsNkNBQUEsR0FBNkMsSUFGN0M7d0JBWGI7V0FESTtRQUFBLENBSk47T0FEUyxDQUFYLENBQUE7YUFzQkEsSUFBSSxDQUFDLGdCQUFMLENBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ3BCLFlBQUEsYUFBQTtBQUFBLFFBRHNCLGNBQUEsT0FBTyxlQUFBLE1BQzdCLENBQUE7QUFBQSxRQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBQSxDQURBLENBQUE7O1VBRUEsVUFBVztBQUFBLFlBQ1QsT0FBQSxFQUFVLDhCQUFBLEdBQThCLE1BRC9CO0FBQUEsWUFFVCxNQUFBLEVBQVEsRUFBQSxHQUFHLEtBRkY7O1NBRlg7ZUFNQSxNQUFBLENBQUEsRUFQb0I7TUFBQSxDQUF0QixFQXZCaUI7SUFBQSxDQUFuQixFQUhTO0VBQUEsQ0FsQlgsQ0FBQTs7QUFBQSxFQXFEQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsVUFBQSxRQURlO0dBckRqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/binutils/util-cabal-format.coffee
