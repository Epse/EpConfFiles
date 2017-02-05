(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile, verboseCommitsEnabled;

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

  verboseCommitsEnabled = function() {
    return atom.config.get('git-plus.commits.verboseCommits');
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      if (files.length >= 1) {
        return git.cmd(['-c', 'color.ui=false', 'status'], {
          cwd: repo.getWorkingDirectory()
        });
      } else {
        return Promise.reject("Nothing to commit.");
      }
    });
  };

  getTemplate = function(filePath) {
    var e;
    if (filePath) {
      try {
        return fs.readFileSync(fs.absolute(filePath.trim())).toString().trim();
      } catch (error) {
        e = error;
        throw new Error("Your configured commit template file can't be found.");
      }
    } else {
      return '';
    }
  };

  prepFile = function(arg) {
    var commentChar, content, cwd, diff, filePath, status, template;
    status = arg.status, filePath = arg.filePath, diff = arg.diff, commentChar = arg.commentChar, template = arg.template;
    cwd = Path.dirname(filePath);
    status = status.replace(/\s*\(.*\)\n/g, "\n");
    status = status.trim().replace(/\n/g, "\n" + commentChar + " ");
    content = template + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status;
    if (diff) {
      content += "\n" + commentChar + "\n" + commentChar + " ------------------------ >8 ------------------------\n" + commentChar + " Do not touch the line above.\n" + commentChar + " Everything below will be removed.\n" + diff;
    }
    return fs.writeFileSync(filePath, content);
  };

  destroyCommitEditor = function(filePath) {
    var ref, ref1;
    if (atom.config.get('git-plus.general.openInPane')) {
      return (ref = atom.workspace.paneForURI(filePath)) != null ? ref.destroy() : void 0;
    } else {
      return (ref1 = atom.workspace.paneForURI(filePath).itemForURI(filePath)) != null ? ref1.destroy() : void 0;
    }
  };

  trimFile = function(filePath, commentChar) {
    var content, cwd, startOfComments;
    cwd = Path.dirname(filePath);
    content = fs.readFileSync(fs.absolute(filePath)).toString();
    startOfComments = content.indexOf(content.split('\n').find(function(line) {
      return line.startsWith(commentChar);
    }));
    content = content.substring(0, startOfComments);
    return fs.writeFileSync(filePath, content);
  };

  commit = function(directory, filePath) {
    return git.cmd(['commit', "--cleanup=strip", "--file=" + filePath], {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor(filePath);
      return git.refresh();
    })["catch"](function(data) {
      notifier.addError(data);
      return destroyCommitEditor(filePath);
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    return disposables.dispose();
  };

  showFile = function(filePath) {
    var commitEditor, ref, splitDirection;
    commitEditor = (ref = atom.workspace.paneForURI(filePath)) != null ? ref.itemForURI(filePath) : void 0;
    if (!commitEditor) {
      if (atom.config.get('git-plus.general.openInPane')) {
        splitDirection = atom.config.get('git-plus.general.splitPane');
        atom.workspace.getActivePane()["split" + splitDirection]();
      }
      return atom.workspace.open(filePath);
    } else {
      if (atom.config.get('git-plus.general.openInPane')) {
        atom.workspace.paneForURI(filePath).activate();
      } else {
        atom.workspace.paneForURI(filePath).activateItemForURI(filePath);
      }
      return Promise.resolve(commitEditor);
    }
  };

  module.exports = function(repo, arg) {
    var andPush, commentChar, currentPane, e, filePath, init, ref, ref1, stageChanges, startCommit, template;
    ref = arg != null ? arg : {}, stageChanges = ref.stageChanges, andPush = ref.andPush;
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    currentPane = atom.workspace.getActivePane();
    commentChar = (ref1 = git.getConfig(repo, 'core.commentchar')) != null ? ref1 : '#';
    try {
      template = getTemplate(git.getConfig(repo, 'commit.template'));
    } catch (error) {
      e = error;
      notifier.addError(e.message);
      return Promise.reject(e.message);
    }
    init = function() {
      return getStagedFiles(repo).then(function(status) {
        var args;
        if (verboseCommitsEnabled()) {
          args = ['diff', '--color=never', '--staged'];
          if (atom.config.get('git-plus.diffs.wordDiff')) {
            args.push('--word-diff');
          }
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          }).then(function(diff) {
            return prepFile({
              status: status,
              filePath: filePath,
              diff: diff,
              commentChar: commentChar,
              template: template
            });
          });
        } else {
          return prepFile({
            status: status,
            filePath: filePath,
            commentChar: commentChar,
            template: template
          });
        }
      });
    };
    startCommit = function() {
      return showFile(filePath).then(function(textEditor) {
        disposables.add(textEditor.onDidSave(function() {
          if (verboseCommitsEnabled()) {
            trimFile(filePath, commentChar);
          }
          return commit(repo.getWorkingDirectory(), filePath).then(function() {
            if (andPush) {
              return GitPush(repo);
            }
          });
        }));
        return disposables.add(textEditor.onDidDestroy(function() {
          return cleanup(currentPane, filePath);
        }));
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };
    if (stageChanges) {
      return git.add(repo, {
        update: stageChanges
      }).then(function() {
        return init();
      }).then(function() {
        return startCommit();
      });
    } else {
      return init().then(function() {
        return startCommit();
      })["catch"](function(message) {
        if (typeof message.includes === "function" ? message.includes('CRLF') : void 0) {
          return startCommit();
        } else {
          return notifier.addInfo(message);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBRVYsV0FBQSxHQUFjLElBQUk7O0VBRWxCLHFCQUFBLEdBQXdCLFNBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO0VBQUg7O0VBRXhCLGNBQUEsR0FBaUIsU0FBQyxJQUFEO1dBQ2YsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLEtBQUQ7TUFDekIsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFuQjtlQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFELEVBQU8sZ0JBQVAsRUFBeUIsUUFBekIsQ0FBUixFQUE0QztVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTVDLEVBREY7T0FBQSxNQUFBO2VBR0UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxvQkFBZixFQUhGOztJQUR5QixDQUEzQjtFQURlOztFQU9qQixXQUFBLEdBQWMsU0FBQyxRQUFEO0FBQ1osUUFBQTtJQUFBLElBQUcsUUFBSDtBQUNFO2VBQ0UsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsRUFBRSxDQUFDLFFBQUgsQ0FBWSxR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bkIsRUFBQTs7aUJBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVAsRUFBbUMsUUFBbkMsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFBO1lBQUcsSUFBaUIsT0FBakI7cUJBQUEsT0FBQSxDQUFRLElBQVIsRUFBQTs7VUFBSCxDQUROO1FBRm1DLENBQXJCLENBQWhCO2VBSUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtpQkFBRyxPQUFBLENBQVEsV0FBUixFQUFxQixRQUFyQjtRQUFILENBQXhCLENBQWhCO01BTEksQ0FETixDQU9BLEVBQUMsS0FBRCxFQVBBLENBT08sU0FBQyxHQUFEO2VBQVMsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7TUFBVCxDQVBQO0lBRFk7SUFVZCxJQUFHLFlBQUg7YUFDRSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLE1BQUEsRUFBUSxZQUFSO09BQWQsQ0FBbUMsQ0FBQyxJQUFwQyxDQUF5QyxTQUFBO2VBQUcsSUFBQSxDQUFBO01BQUgsQ0FBekMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxTQUFBO2VBQUcsV0FBQSxDQUFBO01BQUgsQ0FBekQsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFBLENBQUEsQ0FBTSxDQUFDLElBQVAsQ0FBWSxTQUFBO2VBQUcsV0FBQSxDQUFBO01BQUgsQ0FBWixDQUNBLEVBQUMsS0FBRCxFQURBLENBQ08sU0FBQyxPQUFEO1FBQ0wsNkNBQUcsT0FBTyxDQUFDLFNBQVUsZ0JBQXJCO2lCQUNFLFdBQUEsQ0FBQSxFQURGO1NBQUEsTUFBQTtpQkFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUhGOztNQURLLENBRFAsRUFIRjs7RUE1QmU7QUF4RmpCIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkdpdFB1c2ggPSByZXF1aXJlICcuL2dpdC1wdXNoJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4vZ2l0LXB1bGwnXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxudmVyYm9zZUNvbW1pdHNFbmFibGVkID0gLT4gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5jb21taXRzLnZlcmJvc2VDb21taXRzJylcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBnaXQuY21kKFsnLWMnLCAnY29sb3IudWk9ZmFsc2UnLCAnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZWplY3QgXCJOb3RoaW5nIHRvIGNvbW1pdC5cIlxuXG5nZXRUZW1wbGF0ZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgZmlsZVBhdGhcbiAgICB0cnlcbiAgICAgIGZzLnJlYWRGaWxlU3luYyhmcy5hYnNvbHV0ZShmaWxlUGF0aC50cmltKCkpKS50b1N0cmluZygpLnRyaW0oKVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdXIgY29uZmlndXJlZCBjb21taXQgdGVtcGxhdGUgZmlsZSBjYW4ndCBiZSBmb3VuZC5cIilcbiAgZWxzZVxuICAgICcnXG5cbnByZXBGaWxlID0gKHtzdGF0dXMsIGZpbGVQYXRoLCBkaWZmLCBjb21tZW50Q2hhciwgdGVtcGxhdGV9KSAtPlxuICBjd2QgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMqXFwoLipcXClcXG4vZywgXCJcXG5cIilcbiAgc3RhdHVzID0gc3RhdHVzLnRyaW0oKS5yZXBsYWNlKC9cXG4vZywgXCJcXG4je2NvbW1lbnRDaGFyfSBcIilcbiAgY29udGVudCA9XG4gICAgXCJcIlwiI3t0ZW1wbGF0ZX1cbiAgICAje2NvbW1lbnRDaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgI3tjb21tZW50Q2hhcn0gd2l0aCAnI3tjb21tZW50Q2hhcn0nIHdpbGwgYmUgaWdub3JlZCwgYW5kIGFuIGVtcHR5IG1lc3NhZ2UgYWJvcnRzIHRoZSBjb21taXQuXG4gICAgI3tjb21tZW50Q2hhcn1cbiAgICAje2NvbW1lbnRDaGFyfSAje3N0YXR1c31cIlwiXCJcbiAgaWYgZGlmZlxuICAgIGNvbnRlbnQgKz1cbiAgICAgIFwiXCJcIlxcbiN7Y29tbWVudENoYXJ9XG4gICAgICAje2NvbW1lbnRDaGFyfSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gPjggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAje2NvbW1lbnRDaGFyfSBEbyBub3QgdG91Y2ggdGhlIGxpbmUgYWJvdmUuXG4gICAgICAje2NvbW1lbnRDaGFyfSBFdmVyeXRoaW5nIGJlbG93IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgICN7ZGlmZn1cIlwiXCJcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgY29udGVudFxuXG5kZXN0cm95Q29tbWl0RWRpdG9yID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCk/LmRlc3Ryb3koKVxuICBlbHNlXG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuaXRlbUZvclVSSShmaWxlUGF0aCk/LmRlc3Ryb3koKVxuXG50cmltRmlsZSA9IChmaWxlUGF0aCwgY29tbWVudENoYXIpIC0+XG4gIGN3ZCA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmcy5hYnNvbHV0ZShmaWxlUGF0aCkpLnRvU3RyaW5nKClcbiAgc3RhcnRPZkNvbW1lbnRzID0gY29udGVudC5pbmRleE9mKGNvbnRlbnQuc3BsaXQoJ1xcbicpLmZpbmQgKGxpbmUpIC0+IGxpbmUuc3RhcnRzV2l0aCBjb21tZW50Q2hhcilcbiAgY29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIHN0YXJ0T2ZDb21tZW50cylcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgY29udGVudFxuXG5jb21taXQgPSAoZGlyZWN0b3J5LCBmaWxlUGF0aCkgLT5cbiAgZ2l0LmNtZChbJ2NvbW1pdCcsIFwiLS1jbGVhbnVwPXN0cmlwXCIsIFwiLS1maWxlPSN7ZmlsZVBhdGh9XCJdLCBjd2Q6IGRpcmVjdG9yeSlcbiAgLnRoZW4gKGRhdGEpIC0+XG4gICAgbm90aWZpZXIuYWRkU3VjY2VzcyBkYXRhXG4gICAgZGVzdHJveUNvbW1pdEVkaXRvcihmaWxlUGF0aClcbiAgICBnaXQucmVmcmVzaCgpXG4gIC5jYXRjaCAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRFcnJvciBkYXRhXG4gICAgZGVzdHJveUNvbW1pdEVkaXRvcihmaWxlUGF0aClcblxuY2xlYW51cCA9IChjdXJyZW50UGFuZSwgZmlsZVBhdGgpIC0+XG4gIGN1cnJlbnRQYW5lLmFjdGl2YXRlKCkgaWYgY3VycmVudFBhbmUuaXNBbGl2ZSgpXG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgY29tbWl0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCk/Lml0ZW1Gb3JVUkkoZmlsZVBhdGgpXG4gIGlmIG5vdCBjb21taXRFZGl0b3JcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUnKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBmaWxlUGF0aFxuICBlbHNlXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuYWN0aXZhdGUoKVxuICAgIGVsc2VcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLmFjdGl2YXRlSXRlbUZvclVSSShmaWxlUGF0aClcbiAgICBQcm9taXNlLnJlc29sdmUoY29tbWl0RWRpdG9yKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7c3RhZ2VDaGFuZ2VzLCBhbmRQdXNofT17fSkgLT5cbiAgZmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRycpXG4gIGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGNvbW1lbnRDaGFyID0gZ2l0LmdldENvbmZpZyhyZXBvLCAnY29yZS5jb21tZW50Y2hhcicpID8gJyMnXG4gIHRyeVxuICAgIHRlbXBsYXRlID0gZ2V0VGVtcGxhdGUoZ2l0LmdldENvbmZpZyhyZXBvLCAnY29tbWl0LnRlbXBsYXRlJykpXG4gIGNhdGNoIGVcbiAgICBub3RpZmllci5hZGRFcnJvcihlLm1lc3NhZ2UpXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUubWVzc2FnZSlcblxuICBpbml0ID0gLT4gZ2V0U3RhZ2VkRmlsZXMocmVwbykudGhlbiAoc3RhdHVzKSAtPlxuICAgIGlmIHZlcmJvc2VDb21taXRzRW5hYmxlZCgpXG4gICAgICBhcmdzID0gWydkaWZmJywgJy0tY29sb3I9bmV2ZXInLCAnLS1zdGFnZWQnXVxuICAgICAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZicpXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGlmZikgLT4gcHJlcEZpbGUge3N0YXR1cywgZmlsZVBhdGgsIGRpZmYsIGNvbW1lbnRDaGFyLCB0ZW1wbGF0ZX1cbiAgICBlbHNlXG4gICAgICBwcmVwRmlsZSB7c3RhdHVzLCBmaWxlUGF0aCwgY29tbWVudENoYXIsIHRlbXBsYXRlfVxuICBzdGFydENvbW1pdCA9IC0+XG4gICAgc2hvd0ZpbGUgZmlsZVBhdGhcbiAgICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPlxuICAgICAgICB0cmltRmlsZShmaWxlUGF0aCwgY29tbWVudENoYXIpIGlmIHZlcmJvc2VDb21taXRzRW5hYmxlZCgpXG4gICAgICAgIGNvbW1pdChyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgZmlsZVBhdGgpXG4gICAgICAgIC50aGVuIC0+IEdpdFB1c2gocmVwbykgaWYgYW5kUHVzaFxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGNsZWFudXAgY3VycmVudFBhbmUsIGZpbGVQYXRoXG4gICAgLmNhdGNoIChtc2cpIC0+IG5vdGlmaWVyLmFkZEVycm9yIG1zZ1xuXG4gIGlmIHN0YWdlQ2hhbmdlc1xuICAgIGdpdC5hZGQocmVwbywgdXBkYXRlOiBzdGFnZUNoYW5nZXMpLnRoZW4oLT4gaW5pdCgpKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgZWxzZVxuICAgIGluaXQoKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgICAuY2F0Y2ggKG1lc3NhZ2UpIC0+XG4gICAgICBpZiBtZXNzYWdlLmluY2x1ZGVzPygnQ1JMRicpXG4gICAgICAgIHN0YXJ0Q29tbWl0KClcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlXG4iXX0=
