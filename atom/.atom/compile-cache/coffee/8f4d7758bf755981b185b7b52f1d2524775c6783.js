(function() {
  var OutputViewManager, Path, fs, git, notifier;

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, _arg) {
    var file, isFolder, packageObj, sublimeTabs, treeView, _ref;
    file = (_arg != null ? _arg : {}).file;
    if (atom.packages.isPackageLoaded('tree-view')) {
      treeView = atom.packages.getLoadedPackage('tree-view');
      treeView = require(treeView.mainModulePath);
      packageObj = treeView.serialize();
    } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
      sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
      sublimeTabs = require(sublimeTabs.mainModulePath);
      packageObj = sublimeTabs.serialize();
    } else {
      console.warn("Git-plus: no tree-view or sublime-tabs package loaded");
    }
    isFolder = false;
    if (!file) {
      if (packageObj != null ? packageObj.selectedPath : void 0) {
        isFolder = fs.isDirectorySync(packageObj.selectedPath);
        if (file == null) {
          file = repo.relativize(packageObj.selectedPath);
        }
      }
    } else {
      isFolder = fs.isDirectorySync(file);
    }
    if (file == null) {
      file = repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
    }
    if (!file) {
      return notifier.addInfo("No open file. Select 'Diff All'.");
    }
    return git.getConfig('diff.tool', repo.getWorkingDirectory()).then(function(tool) {
      if (!tool) {
        return notifier.addInfo("You don't have a difftool configured.");
      } else {
        return git.cmd(['diff-index', 'HEAD', '-z'], {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          var args, diffIndex, diffsForCurrentFile, includeStagedDiff;
          diffIndex = data.split('\0');
          includeStagedDiff = atom.config.get('git-plus.includeStagedDiff');
          if (isFolder) {
            args = ['difftool', '-d', '--no-prompt'];
            if (includeStagedDiff) {
              args.push('HEAD');
            }
            args.push(file);
            git.cmd(args, {
              cwd: repo.getWorkingDirectory()
            })["catch"](function(msg) {
              return OutputViewManager.create().addLine(msg).finish();
            });
            return;
          }
          diffsForCurrentFile = diffIndex.map(function(line, i) {
            var path, staged;
            if (i % 2 === 0) {
              staged = !/^0{40}$/.test(diffIndex[i].split(' ')[3]);
              path = diffIndex[i + 1];
              if (path === file && (!staged || includeStagedDiff)) {
                return true;
              }
            } else {
              return void 0;
            }
          });
          if (diffsForCurrentFile.filter(function(diff) {
            return diff != null;
          })[0] != null) {
            args = ['difftool', '--no-prompt'];
            if (includeStagedDiff) {
              args.push('HEAD');
            }
            args.push(file);
            return git.cmd(args, {
              cwd: repo.getWorkingDirectory()
            })["catch"](function(msg) {
              return OutputViewManager.create().addLine(msg).finish();
            });
          } else {
            return notifier.addInfo('Nothing to show.');
          }
        });
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWRpZmZ0b29sLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQ0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FETixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQUhwQixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSkwsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUVmLFFBQUEsdURBQUE7QUFBQSxJQUZ1Qix1QkFBRCxPQUFPLElBQU4sSUFFdkIsQ0FBQTtBQUFBLElBQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsV0FBOUIsQ0FBSDtBQUNFLE1BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0IsQ0FBWCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVEsQ0FBQyxjQUFqQixDQURYLENBQUE7QUFBQSxNQUVBLFVBQUEsR0FBYSxRQUFRLENBQUMsU0FBVCxDQUFBLENBRmIsQ0FERjtLQUFBLE1BSUssSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsY0FBOUIsQ0FBSDtBQUNILE1BQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsY0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/git-plus/lib/models/git-difftool.coffee
