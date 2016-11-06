(function() {
  var prettify;

  module.exports = prettify = function(text, workingDirectory, _arg) {
    var BufferedProcess, lines, onComplete, onFailure, proc, shpath;
    onComplete = _arg.onComplete, onFailure = _arg.onFailure;
    lines = [];
    shpath = atom.config.get('ide-haskell.stylishHaskellPath');
    BufferedProcess = require('atom').BufferedProcess;
    proc = new BufferedProcess({
      command: shpath,
      args: atom.config.get('ide-haskell.stylishHaskellArguments'),
      options: {
        cwd: workingDirectory
      },
      stdout: function(line) {
        return lines.push(line);
      },
      exit: function(code) {
        if (code === 0) {
          return typeof onComplete === "function" ? onComplete(lines.join('')) : void 0;
        } else {
          return typeof onFailure === "function" ? onFailure({
            message: "Failed to prettify",
            detail: "Prettifier exited with non-zero exit status " + code
          }) : void 0;
        }
      }
    });
    proc.onWillThrowError(function(_arg1) {
      var error, handle;
      error = _arg1.error, handle = _arg1.handle;
      console.error(error);
      if (typeof onFailure === "function") {
        onFailure({
          message: "Ide-haskell could not spawn " + shpath,
          detail: "" + error
        });
      }
      return handle();
    });
    proc.process.stdin.write(text);
    return proc.process.stdin.end();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9iaW51dGlscy91dGlsLXN0eWxpc2gtaGFza2VsbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLGdCQUFQLEVBQXlCLElBQXpCLEdBQUE7QUFFVCxRQUFBLDJEQUFBO0FBQUEsSUFGbUMsa0JBQUEsWUFBWSxpQkFBQSxTQUUvQyxDQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUZULENBQUE7QUFBQSxJQUlDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUpELENBQUE7QUFBQSxJQUtBLElBQUEsR0FBVyxJQUFBLGVBQUEsQ0FDVDtBQUFBLE1BQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxNQUNBLElBQUEsRUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBRE47QUFBQSxNQUVBLE9BQUEsRUFDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLGdCQUFMO09BSEY7QUFBQSxNQUlBLE1BQUEsRUFBUSxTQUFDLElBQUQsR0FBQTtlQUNOLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQURNO01BQUEsQ0FKUjtBQUFBLE1BTUEsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osUUFBQSxJQUFHLElBQUEsS0FBUSxDQUFYO29EQUNFLFdBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLFlBRGQ7U0FBQSxNQUFBO21EQUdFLFVBQVc7QUFBQSxZQUNULE9BQUEsRUFBUyxvQkFEQTtBQUFBLFlBRVQsTUFBQSxFQUFTLDhDQUFBLEdBQThDLElBRjlDO3NCQUhiO1NBREk7TUFBQSxDQU5OO0tBRFMsQ0FMWCxDQUFBO0FBQUEsSUFxQkEsSUFBSSxDQUFDLGdCQUFMLENBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ3BCLFVBQUEsYUFBQTtBQUFBLE1BRHNCLGNBQUEsT0FBTyxlQUFBLE1BQzdCLENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxDQUFBLENBQUE7O1FBQ0EsVUFBVztBQUFBLFVBQUMsT0FBQSxFQUFVLDhCQUFBLEdBQThCLE1BQXpDO0FBQUEsVUFBbUQsTUFBQSxFQUFRLEVBQUEsR0FBRyxLQUE5RDs7T0FEWDthQUVBLE1BQUEsQ0FBQSxFQUhvQjtJQUFBLENBQXRCLENBckJBLENBQUE7QUFBQSxJQTBCQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFuQixDQUF5QixJQUF6QixDQTFCQSxDQUFBO1dBMkJBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQW5CLENBQUEsRUE3QlM7RUFBQSxDQURYLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/binutils/util-stylish-haskell.coffee
