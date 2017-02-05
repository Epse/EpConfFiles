(function() {
  var CompositeDisposable, Path, cleanup, cleanupUnstagedText, commit, destroyCommitEditor, diffFiles, disposables, fs, getGitStatus, getStagedFiles, git, notifier, parse, prepFile, prettifyFileStatuses, prettifyStagedFiles, prettyifyPreviousFile, showFile,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  disposables = new CompositeDisposable;

  prettifyStagedFiles = function(data) {
    var i, mode;
    if (data === '') {
      return [];
    }
    data = data.split(/\0/).slice(0, -1);
    return (function() {
      var j, len, results;
      results = [];
      for (i = j = 0, len = data.length; j < len; i = j += 2) {
        mode = data[i];
        results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  prettyifyPreviousFile = function(data) {
    return {
      mode: data[0],
      path: data.substring(1).trim()
    };
  };

  prettifyFileStatuses = function(files) {
    return files.map(function(arg) {
      var mode, path;
      mode = arg.mode, path = arg.path;
      switch (mode) {
        case 'M':
          return "modified:   " + path;
        case 'A':
          return "new file:   " + path;
        case 'D':
          return "deleted:   " + path;
        case 'R':
          return "renamed:   " + path;
      }
    });
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      var args;
      if (files.length >= 1) {
        args = ['diff-index', '--cached', 'HEAD', '--name-status', '-z'];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          return prettifyStagedFiles(data);
        });
      } else {
        return Promise.resolve([]);
      }
    });
  };

  getGitStatus = function(repo) {
    return git.cmd(['status'], {
      cwd: repo.getWorkingDirectory()
    });
  };

  diffFiles = function(previousFiles, currentFiles) {
    var currentPaths;
    previousFiles = previousFiles.map(function(p) {
      return prettyifyPreviousFile(p);
    });
    currentPaths = currentFiles.map(function(arg) {
      var path;
      path = arg.path;
      return path;
    });
    return previousFiles.filter(function(p) {
      var ref;
      return (ref = p.path, indexOf.call(currentPaths, ref) >= 0) === false;
    });
  };

  parse = function(prevCommit) {
    var indexOfStatus, lines, message, prevChangedFiles, prevMessage, statusRegex;
    lines = prevCommit.split(/\n/).filter(function(line) {
      return line !== '/n';
    });
    statusRegex = /(([ MADRCU?!])\s(.*))/;
    indexOfStatus = lines.findIndex(function(line) {
      return statusRegex.test(line);
    });
    prevMessage = lines.splice(0, indexOfStatus - 1);
    prevMessage.reverse();
    if (prevMessage[0] === '') {
      prevMessage.shift();
    }
    prevMessage.reverse();
    prevChangedFiles = lines.filter(function(line) {
      return line !== '';
    });
    message = prevMessage.join('\n');
    return {
      message: message,
      prevChangedFiles: prevChangedFiles
    };
  };

  cleanupUnstagedText = function(status) {
    var text, unstagedFiles;
    unstagedFiles = status.indexOf("Changes not staged for commit:");
    if (unstagedFiles >= 0) {
      text = status.substring(unstagedFiles);
      return status = (status.substring(0, unstagedFiles - 1)) + "\n" + (text.replace(/\s*\(.*\)\n/g, ""));
    } else {
      return status;
    }
  };

  prepFile = function(arg) {
    var commentChar, currentChanges, filePath, message, nothingToCommit, prevChangedFiles, replacementText, status, textToReplace;
    commentChar = arg.commentChar, message = arg.message, prevChangedFiles = arg.prevChangedFiles, status = arg.status, filePath = arg.filePath;
    status = cleanupUnstagedText(status);
    status = status.replace(/\s*\(.*\)\n/g, "\n").replace(/\n/g, "\n" + commentChar + " ");
    if (prevChangedFiles.length > 0) {
      nothingToCommit = "nothing to commit, working directory clean";
      currentChanges = "committed:\n" + commentChar;
      textToReplace = null;
      if (status.indexOf(nothingToCommit) > -1) {
        textToReplace = nothingToCommit;
      } else if (status.indexOf(currentChanges) > -1) {
        textToReplace = currentChanges;
      }
      replacementText = "committed:\n" + (prevChangedFiles.map(function(f) {
        return commentChar + "   " + f;
      }).join("\n"));
      status = status.replace(textToReplace, replacementText);
    }
    return fs.writeFileSync(filePath, message + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status);
  };

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  destroyCommitEditor = function() {
    var ref;
    return (ref = atom.workspace) != null ? ref.getPanes().some(function(pane) {
      return pane.getItems().some(function(paneItem) {
        var ref1;
        if (paneItem != null ? typeof paneItem.getURI === "function" ? (ref1 = paneItem.getURI()) != null ? ref1.includes('COMMIT_EDITMSG') : void 0 : void 0 : void 0) {
          if (pane.getItems().length === 1) {
            pane.destroy();
          } else {
            paneItem.destroy();
          }
          return true;
        }
      });
    }) : void 0;
  };

  commit = function(directory, filePath) {
    var args;
    args = ['commit', '--amend', '--cleanup=strip', "--file=" + filePath];
    return git.cmd(args, {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor();
      return git.refresh();
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    disposables.dispose();
    return fs.unlink(filePath);
  };

  module.exports = function(repo) {
    var commentChar, currentPane, cwd, filePath, ref;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
    commentChar = (ref = git.getConfig(repo, 'core.commentchar')) != null ? ref : '#';
    return git.cmd(['whatchanged', '-1', '--name-status', '--format=%B'], {
      cwd: cwd
    }).then(function(amend) {
      return parse(amend);
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getStagedFiles(repo).then(function(files) {
        prevChangedFiles = prettifyFileStatuses(diffFiles(prevChangedFiles, files));
        return {
          message: message,
          prevChangedFiles: prevChangedFiles
        };
      });
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getGitStatus(repo).then(function(status) {
        return prepFile({
          commentChar: commentChar,
          message: message,
          prevChangedFiles: prevChangedFiles,
          status: status,
          filePath: filePath
        });
      }).then(function() {
        return showFile(filePath);
      });
    }).then(function(textEditor) {
      disposables.add(textEditor.onDidSave(function() {
        return commit(repo.getWorkingDirectory(), filePath);
      }));
      return disposables.add(textEditor.onDidDestroy(function() {
        return cleanup(currentPane, filePath);
      }));
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBQQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsV0FBQSxHQUFjLElBQUk7O0VBRWxCLG1CQUFBLEdBQXNCLFNBQUMsSUFBRDtBQUNwQixRQUFBO0lBQUEsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQjs7O0FBQ25CO1dBQUEsaURBQUE7O3FCQUNIO1VBQUMsTUFBQSxJQUFEO1VBQU8sSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFsQjs7QUFERzs7O0VBSGU7O0VBTXRCLHFCQUFBLEdBQXdCLFNBQUMsSUFBRDtXQUN0QjtNQUFBLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUFYO01BQ0EsSUFBQSxFQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FETjs7RUFEc0I7O0VBSXhCLG9CQUFBLEdBQXVCLFNBQUMsS0FBRDtXQUNyQixLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFEVSxpQkFBTTtBQUNoQixjQUFPLElBQVA7QUFBQSxhQUNPLEdBRFA7aUJBRUksY0FBQSxHQUFlO0FBRm5CLGFBR08sR0FIUDtpQkFJSSxjQUFBLEdBQWU7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TSx1QkFBUzthQUNmLFlBQUEsQ0FBYSxJQUFiLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxNQUFEO2VBQVksUUFBQSxDQUFTO1VBQUMsYUFBQSxXQUFEO1VBQWMsU0FBQSxPQUFkO1VBQXVCLGtCQUFBLGdCQUF2QjtVQUF5QyxRQUFBLE1BQXpDO1VBQWlELFVBQUEsUUFBakQ7U0FBVDtNQUFaLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO2VBQUcsUUFBQSxDQUFTLFFBQVQ7TUFBSCxDQUZOO0lBREksQ0FQTixDQVdBLENBQUMsSUFYRCxDQVdNLFNBQUMsVUFBRDtNQUNKLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFNBQUE7ZUFBRyxNQUFBLENBQU8sSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBUCxFQUFtQyxRQUFuQztNQUFILENBQXJCLENBQWhCO2FBQ0EsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtlQUFHLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLFFBQXJCO01BQUgsQ0FBeEIsQ0FBaEI7SUFGSSxDQVhOLENBY0EsRUFBQyxLQUFELEVBZEEsQ0FjTyxTQUFDLEdBQUQ7YUFBUyxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQjtJQUFULENBZFA7RUFMZTtBQXpIakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnByZXR0aWZ5U3RhZ2VkRmlsZXMgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcMC8pWy4uLi0xXVxuICBbXSA9IGZvciBtb2RlLCBpIGluIGRhdGEgYnkgMlxuICAgIHttb2RlLCBwYXRoOiBkYXRhW2krMV0gfVxuXG5wcmV0dHlpZnlQcmV2aW91c0ZpbGUgPSAoZGF0YSkgLT5cbiAgbW9kZTogZGF0YVswXVxuICBwYXRoOiBkYXRhLnN1YnN0cmluZygxKS50cmltKClcblxucHJldHRpZnlGaWxlU3RhdHVzZXMgPSAoZmlsZXMpIC0+XG4gIGZpbGVzLm1hcCAoe21vZGUsIHBhdGh9KSAtPlxuICAgIHN3aXRjaCBtb2RlXG4gICAgICB3aGVuICdNJ1xuICAgICAgICBcIm1vZGlmaWVkOiAgICN7cGF0aH1cIlxuICAgICAgd2hlbiAnQSdcbiAgICAgICAgXCJuZXcgZmlsZTogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ0QnXG4gICAgICAgIFwiZGVsZXRlZDogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ1InXG4gICAgICAgIFwicmVuYW1lZDogICAje3BhdGh9XCJcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBhcmdzID0gWydkaWZmLWluZGV4JywgJy0tY2FjaGVkJywgJ0hFQUQnLCAnLS1uYW1lLXN0YXR1cycsICcteiddXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGF0YSkgLT4gcHJldHRpZnlTdGFnZWRGaWxlcyBkYXRhXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZXNvbHZlIFtdXG5cbmdldEdpdFN0YXR1cyA9IChyZXBvKSAtPlxuICBnaXQuY21kIFsnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuZGlmZkZpbGVzID0gKHByZXZpb3VzRmlsZXMsIGN1cnJlbnRGaWxlcykgLT5cbiAgcHJldmlvdXNGaWxlcyA9IHByZXZpb3VzRmlsZXMubWFwIChwKSAtPiBwcmV0dHlpZnlQcmV2aW91c0ZpbGUgcFxuICBjdXJyZW50UGF0aHMgPSBjdXJyZW50RmlsZXMubWFwICh7cGF0aH0pIC0+IHBhdGhcbiAgcHJldmlvdXNGaWxlcy5maWx0ZXIgKHApIC0+IHAucGF0aCBpbiBjdXJyZW50UGF0aHMgaXMgZmFsc2VcblxucGFyc2UgPSAocHJldkNvbW1pdCkgLT5cbiAgbGluZXMgPSBwcmV2Q29tbWl0LnNwbGl0KC9cXG4vKS5maWx0ZXIgKGxpbmUpIC0+IGxpbmUgaXNudCAnL24nXG4gIHN0YXR1c1JlZ2V4ID0gLygoWyBNQURSQ1U/IV0pXFxzKC4qKSkvXG4gIGluZGV4T2ZTdGF0dXMgPSBsaW5lcy5maW5kSW5kZXggKGxpbmUpIC0+IHN0YXR1c1JlZ2V4LnRlc3QgbGluZVxuXG4gIHByZXZNZXNzYWdlID0gbGluZXMuc3BsaWNlIDAsIGluZGV4T2ZTdGF0dXMgLSAxXG4gIHByZXZNZXNzYWdlLnJldmVyc2UoKVxuICBwcmV2TWVzc2FnZS5zaGlmdCgpIGlmIHByZXZNZXNzYWdlWzBdIGlzICcnXG4gIHByZXZNZXNzYWdlLnJldmVyc2UoKVxuICBwcmV2Q2hhbmdlZEZpbGVzID0gbGluZXMuZmlsdGVyIChsaW5lKSAtPiBsaW5lIGlzbnQgJydcbiAgbWVzc2FnZSA9IHByZXZNZXNzYWdlLmpvaW4oJ1xcbicpXG4gIHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfVxuXG5jbGVhbnVwVW5zdGFnZWRUZXh0ID0gKHN0YXR1cykgLT5cbiAgdW5zdGFnZWRGaWxlcyA9IHN0YXR1cy5pbmRleE9mIFwiQ2hhbmdlcyBub3Qgc3RhZ2VkIGZvciBjb21taXQ6XCJcbiAgaWYgdW5zdGFnZWRGaWxlcyA+PSAwXG4gICAgdGV4dCA9IHN0YXR1cy5zdWJzdHJpbmcgdW5zdGFnZWRGaWxlc1xuICAgIHN0YXR1cyA9IFwiI3tzdGF0dXMuc3Vic3RyaW5nKDAsIHVuc3RhZ2VkRmlsZXMgLSAxKX1cXG4je3RleHQucmVwbGFjZSAvXFxzKlxcKC4qXFwpXFxuL2csIFwiXCJ9XCJcbiAgZWxzZVxuICAgIHN0YXR1c1xuXG5wcmVwRmlsZSA9ICh7Y29tbWVudENoYXIsIG1lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXMsIHN0YXR1cywgZmlsZVBhdGh9KSAtPlxuICAgIHN0YXR1cyA9IGNsZWFudXBVbnN0YWdlZFRleHQgc3RhdHVzXG4gICAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKS5yZXBsYWNlKC9cXG4vZywgXCJcXG4je2NvbW1lbnRDaGFyfSBcIilcbiAgICBpZiBwcmV2Q2hhbmdlZEZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIG5vdGhpbmdUb0NvbW1pdCA9IFwibm90aGluZyB0byBjb21taXQsIHdvcmtpbmcgZGlyZWN0b3J5IGNsZWFuXCJcbiAgICAgIGN1cnJlbnRDaGFuZ2VzID0gXCJjb21taXR0ZWQ6XFxuI3tjb21tZW50Q2hhcn1cIlxuICAgICAgdGV4dFRvUmVwbGFjZSA9IG51bGxcbiAgICAgIGlmIHN0YXR1cy5pbmRleE9mKG5vdGhpbmdUb0NvbW1pdCkgPiAtMVxuICAgICAgICB0ZXh0VG9SZXBsYWNlID0gbm90aGluZ1RvQ29tbWl0XG4gICAgICBlbHNlIGlmIHN0YXR1cy5pbmRleE9mKGN1cnJlbnRDaGFuZ2VzKSA+IC0xXG4gICAgICAgIHRleHRUb1JlcGxhY2UgPSBjdXJyZW50Q2hhbmdlc1xuICAgICAgcmVwbGFjZW1lbnRUZXh0ID1cbiAgICAgICAgXCJcIlwiY29tbWl0dGVkOlxuICAgICAgICAje1xuICAgICAgICAgIHByZXZDaGFuZ2VkRmlsZXMubWFwKChmKSAtPiBcIiN7Y29tbWVudENoYXJ9ICAgI3tmfVwiKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIH1cIlwiXCJcbiAgICAgIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlIHRleHRUb1JlcGxhY2UsIHJlcGxhY2VtZW50VGV4dFxuICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsXG4gICAgICBcIlwiXCIje21lc3NhZ2V9XG4gICAgICAje2NvbW1lbnRDaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgICAje2NvbW1lbnRDaGFyfSB3aXRoICcje2NvbW1lbnRDaGFyfScgd2lsbCBiZSBpZ25vcmVkLCBhbmQgYW4gZW1wdHkgbWVzc2FnZSBhYm9ydHMgdGhlIGNvbW1pdC5cbiAgICAgICN7Y29tbWVudENoYXJ9XG4gICAgICAje2NvbW1lbnRDaGFyfSAje3N0YXR1c31cIlwiXCJcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcblxuZGVzdHJveUNvbW1pdEVkaXRvciA9IC0+XG4gIGF0b20ud29ya3NwYWNlPy5nZXRQYW5lcygpLnNvbWUgKHBhbmUpIC0+XG4gICAgcGFuZS5nZXRJdGVtcygpLnNvbWUgKHBhbmVJdGVtKSAtPlxuICAgICAgaWYgcGFuZUl0ZW0/LmdldFVSST8oKT8uaW5jbHVkZXMgJ0NPTU1JVF9FRElUTVNHJ1xuICAgICAgICBpZiBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIGlzIDFcbiAgICAgICAgICBwYW5lLmRlc3Ryb3koKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcGFuZUl0ZW0uZGVzdHJveSgpXG4gICAgICAgIHJldHVybiB0cnVlXG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBhcmdzID0gWydjb21taXQnLCAnLS1hbWVuZCcsICctLWNsZWFudXA9c3RyaXAnLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogZGlyZWN0b3J5KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKClcbiAgICBnaXQucmVmcmVzaCgpXG5cbmNsZWFudXAgPSAoY3VycmVudFBhbmUsIGZpbGVQYXRoKSAtPlxuICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpIGlmIGN1cnJlbnRQYW5lLmlzQWxpdmUoKVxuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgZnMudW5saW5rIGZpbGVQYXRoXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBjb21tZW50Q2hhciA9IGdpdC5nZXRDb25maWcocmVwbywgJ2NvcmUuY29tbWVudGNoYXInKSA/ICcjJ1xuICBnaXQuY21kKFsnd2hhdGNoYW5nZWQnLCAnLTEnLCAnLS1uYW1lLXN0YXR1cycsICctLWZvcm1hdD0lQiddLCB7Y3dkfSlcbiAgLnRoZW4gKGFtZW5kKSAtPiBwYXJzZSBhbWVuZFxuICAudGhlbiAoe21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9KSAtPlxuICAgIGdldFN0YWdlZEZpbGVzKHJlcG8pXG4gICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgcHJldkNoYW5nZWRGaWxlcyA9IHByZXR0aWZ5RmlsZVN0YXR1c2VzKGRpZmZGaWxlcyBwcmV2Q2hhbmdlZEZpbGVzLCBmaWxlcylcbiAgICAgIHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfVxuICAudGhlbiAoe21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9KSAtPlxuICAgIGdldEdpdFN0YXR1cyhyZXBvKVxuICAgIC50aGVuIChzdGF0dXMpIC0+IHByZXBGaWxlIHtjb21tZW50Q2hhciwgbWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlcywgc3RhdHVzLCBmaWxlUGF0aH1cbiAgICAudGhlbiAtPiBzaG93RmlsZSBmaWxlUGF0aFxuICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZFNhdmUgLT4gY29tbWl0KHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCBmaWxlUGF0aClcbiAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT4gY2xlYW51cCBjdXJyZW50UGFuZSwgZmlsZVBhdGhcbiAgLmNhdGNoIChtc2cpIC0+IG5vdGlmaWVyLmFkZEluZm8gbXNnXG4iXX0=
