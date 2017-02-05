(function() {
  var CompositeDisposable, Os, Path, disposables, fs, git, nothingToShow, notifier, prepFile, showFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  nothingToShow = 'Nothing to show.';

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.general.openInPane')) {
      splitDirection = atom.config.get('git-plus.general.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  module.exports = function(repo, arg) {
    var args, diffFilePath, diffStat, file, ref, ref1;
    ref = arg != null ? arg : {}, diffStat = ref.diffStat, file = ref.file;
    diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
    if (file == null) {
      file = repo.relativize((ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0);
    }
    if (!file) {
      return notifier.addError("No open file. Select 'Diff All'.");
    }
    args = ['diff', '--color=never'];
    if (atom.config.get('git-plus.diffs.includeStagedDiff')) {
      args.push('HEAD');
    }
    if (atom.config.get('git-plus.diffs.wordDiff')) {
      args.push('--word-diff');
    }
    if (!diffStat) {
      args.push(file);
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
    }).then(function() {
      return showFile(diffFilePath);
    }).then(function(textEditor) {
      return disposables.add(textEditor.onDidDestroy(function() {
        return fs.unlink(diffFilePath);
      }));
    })["catch"](function(err) {
      if (err === nothingToShow) {
        return notifier.addInfo(err);
      } else {
        return notifier.addError(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWRpZmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsYUFBQSxHQUFnQjs7RUFFaEIsV0FBQSxHQUFjLElBQUk7O0VBRWxCLFFBQUEsR0FBVyxTQUFDLFFBQUQ7QUFDVCxRQUFBO0lBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBQUg7TUFDRSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEI7TUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBK0IsQ0FBQSxPQUFBLEdBQVEsY0FBUixDQUEvQixDQUFBLEVBRkY7O1dBR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO0VBSlM7O0VBTVgsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLFFBQVA7V0FDTCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQ1Ysb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEtBQWdCLENBQW5CO2VBQ0UsTUFBQSxDQUFPLGFBQVAsRUFERjtPQUFBLE1BQUE7ZUFHRSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QixFQUF5QyxTQUFDLEdBQUQ7VUFDdkMsSUFBRyxHQUFIO21CQUFZLE1BQUEsQ0FBTyxHQUFQLEVBQVo7V0FBQSxNQUFBO21CQUE0QixPQUFBLENBQVEsSUFBUixFQUE1Qjs7UUFEdUMsQ0FBekMsRUFIRjs7SUFEVSxDQUFSO0VBREs7O0VBUVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7d0JBRHNCLE1BQWlCLElBQWhCLHlCQUFVO0lBQ2pDLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixvQkFBMUI7O01BQ2YsT0FBUSxJQUFJLENBQUMsVUFBTCw2REFBb0QsQ0FBRSxPQUF0QyxDQUFBLFVBQWhCOztJQUNSLElBQUcsQ0FBSSxJQUFQO0FBQ0UsYUFBTyxRQUFRLENBQUMsUUFBVCxDQUFrQixrQ0FBbEIsRUFEVDs7SUFFQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsZUFBVDtJQUNQLElBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBcEI7TUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBQTs7SUFDQSxJQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQTNCO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLEVBQUE7O0lBQ0EsSUFBQSxDQUFzQixRQUF0QjtNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQUFBOztXQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUFVLFFBQUEsQ0FBUyxvQkFBQyxXQUFXLEVBQVosQ0FBQSxHQUFrQixJQUEzQixFQUFpQyxZQUFqQztJQUFWLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO2FBQUcsUUFBQSxDQUFTLFlBQVQ7SUFBSCxDQUZOLENBR0EsQ0FBQyxJQUhELENBR00sU0FBQyxVQUFEO2FBQ0osV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtlQUFHLEVBQUUsQ0FBQyxNQUFILENBQVUsWUFBVjtNQUFILENBQXhCLENBQWhCO0lBREksQ0FITixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sU0FBQyxHQUFEO01BQ0wsSUFBRyxHQUFBLEtBQU8sYUFBVjtlQUNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCLEVBREY7T0FBQSxNQUFBO2VBR0UsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFIRjs7SUFESyxDQUxQO0VBVGU7QUExQmpCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbk9zID0gcmVxdWlyZSAnb3MnXG5QYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblxubm90aGluZ1RvU2hvdyA9ICdOb3RoaW5nIHRvIHNob3cuJ1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxucHJlcEZpbGUgPSAodGV4dCwgZmlsZVBhdGgpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgaWYgdGV4dD8ubGVuZ3RoIGlzIDBcbiAgICAgIHJlamVjdCBub3RoaW5nVG9TaG93XG4gICAgZWxzZVxuICAgICAgZnMud3JpdGVGaWxlIGZpbGVQYXRoLCB0ZXh0LCBmbGFnOiAndysnLCAoZXJyKSAtPlxuICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QgZXJyIGVsc2UgcmVzb2x2ZSB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtkaWZmU3RhdCwgZmlsZX09e30pIC0+XG4gIGRpZmZGaWxlUGF0aCA9IFBhdGguam9pbihyZXBvLmdldFBhdGgoKSwgXCJhdG9tX2dpdF9wbHVzLmRpZmZcIilcbiAgZmlsZSA/PSByZXBvLnJlbGF0aXZpemUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKCkpXG4gIGlmIG5vdCBmaWxlXG4gICAgcmV0dXJuIG5vdGlmaWVyLmFkZEVycm9yIFwiTm8gb3BlbiBmaWxlLiBTZWxlY3QgJ0RpZmYgQWxsJy5cIlxuICBhcmdzID0gWydkaWZmJywgJy0tY29sb3I9bmV2ZXInXVxuICBhcmdzLnB1c2ggJ0hFQUQnIGlmIGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYnXG4gIGFyZ3MucHVzaCAnLS13b3JkLWRpZmYnIGlmIGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMud29yZERpZmYnXG4gIGFyZ3MucHVzaCBmaWxlIHVubGVzcyBkaWZmU3RhdFxuICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPiBwcmVwRmlsZSgoZGlmZlN0YXQgPyAnJykgKyBkYXRhLCBkaWZmRmlsZVBhdGgpXG4gIC50aGVuIC0+IHNob3dGaWxlIGRpZmZGaWxlUGF0aFxuICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT4gZnMudW5saW5rIGRpZmZGaWxlUGF0aFxuICAuY2F0Y2ggKGVycikgLT5cbiAgICBpZiBlcnIgaXMgbm90aGluZ1RvU2hvd1xuICAgICAgbm90aWZpZXIuYWRkSW5mbyBlcnJcbiAgICBlbHNlXG4gICAgICBub3RpZmllci5hZGRFcnJvciBlcnJcbiJdfQ==
