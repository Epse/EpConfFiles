(function() {
  var BufferedProcess, path, prettify;

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  prettify = function(text, workingDirectory, _arg) {
    var lines, onComplete, onFailure, proc, shpath;
    onComplete = _arg.onComplete, onFailure = _arg.onFailure;
    lines = [];
    shpath = atom.config.get('ide-haskell.stylishHaskellPath');
    proc = new BufferedProcess({
      command: shpath,
      args: [],
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
            detail: "Stylish-haskell exited with non-zero exit status " + code
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

  module.exports = {
    prettify: prettify
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvYmludXRpbHMvdXRpbC1zdHlsaXNoLWhhc2tlbGwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sZ0JBQVAsRUFBeUIsSUFBekIsR0FBQTtBQUVULFFBQUEsMENBQUE7QUFBQSxJQUZtQyxrQkFBQSxZQUFZLGlCQUFBLFNBRS9DLENBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBRlQsQ0FBQTtBQUFBLElBSUEsSUFBQSxHQUFXLElBQUEsZUFBQSxDQUNUO0FBQUEsTUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLE1BQ0EsSUFBQSxFQUFNLEVBRE47QUFBQSxNQUVBLE9BQUEsRUFDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLGdCQUFMO09BSEY7QUFBQSxNQUlBLE1BQUEsRUFBUSxTQUFDLElBQUQsR0FBQTtlQUNOLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQURNO01BQUEsQ0FKUjtBQUFBLE1BTUEsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osUUFBQSxJQUFHLElBQUEsS0FBUSxDQUFYO29EQUNFLFdBQVksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLFlBRGQ7U0FBQSxNQUFBO21EQUdFLFVBQVc7QUFBQSxZQUNULE9BQUEsRUFBUyxvQkFEQTtBQUFBLFlBRVQsTUFBQSxFQUFTLG1EQUFBLEdBQW1ELElBRm5EO3NCQUhiO1NBREk7TUFBQSxDQU5OO0tBRFMsQ0FKWCxDQUFBO0FBQUEsSUFvQkEsSUFBSSxDQUFDLGdCQUFMLENBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ3BCLFVBQUEsYUFBQTtBQUFBLE1BRHNCLGNBQUEsT0FBTyxlQUFBLE1BQzdCLENBQUE7QUFBQSxNQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxDQUFBLENBQUE7O1FBQ0EsVUFBVztBQUFBLFVBQUMsT0FBQSxFQUFVLDhCQUFBLEdBQThCLE1BQXpDO0FBQUEsVUFBbUQsTUFBQSxFQUFRLEVBQUEsR0FBRyxLQUE5RDs7T0FEWDthQUVBLE1BQUEsQ0FBQSxFQUhvQjtJQUFBLENBQXRCLENBcEJBLENBQUE7QUFBQSxJQXlCQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFuQixDQUF5QixJQUF6QixDQXpCQSxDQUFBO1dBMEJBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQW5CLENBQUEsRUE1QlM7RUFBQSxDQUxYLENBQUE7O0FBQUEsRUFtQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUNmLFVBQUEsUUFEZTtHQW5DakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/binutils/util-stylish-haskell.coffee
