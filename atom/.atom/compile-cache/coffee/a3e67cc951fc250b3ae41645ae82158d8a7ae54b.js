(function() {
  var GitCommit, Path, commitFileContent, commitFilePath, commitPane, commitResolution, commitTemplate, currentPane, fs, git, notifier, pathToRepoFile, ref, repo, setupMocks, status, templateFilePath, textEditor, workspace;

  fs = require('fs-plus');

  Path = require('path');

  ref = require('../fixtures'), repo = ref.repo, workspace = ref.workspace, pathToRepoFile = ref.pathToRepoFile, currentPane = ref.currentPane, textEditor = ref.textEditor, commitPane = ref.commitPane;

  git = require('../../lib/git');

  GitCommit = require('../../lib/models/git-commit');

  notifier = require('../../lib/notifier');

  commitFilePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');

  status = {
    replace: function() {
      return status;
    },
    trim: function() {
      return status;
    }
  };

  templateFilePath = '~/template';

  commitTemplate = 'foobar';

  commitFileContent = {
    toString: function() {
      return commitFileContent;
    },
    indexOf: function() {
      return 5;
    },
    substring: function() {
      return 'commit message';
    },
    split: function(splitPoint) {
      if (splitPoint === '\n') {
        return ['commit message', '# comments to be deleted'];
      }
    }
  };

  commitResolution = Promise.resolve('commit success');

  setupMocks = function(arg1) {
    var commentChar, ref1, template;
    ref1 = arg1 != null ? arg1 : {}, commentChar = ref1.commentChar, template = ref1.template;
    if (commentChar == null) {
      commentChar = null;
    }
    if (template == null) {
      template = '';
    }
    atom.config.set('git-plus.openInPane', false);
    spyOn(currentPane, 'activate');
    spyOn(commitPane, 'destroy').andCallThrough();
    spyOn(commitPane, 'splitRight');
    spyOn(atom.workspace, 'getActivePane').andReturn(currentPane);
    spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
    spyOn(atom.workspace, 'getPanes').andReturn([currentPane, commitPane]);
    spyOn(atom.workspace, 'paneForURI').andReturn(commitPane);
    spyOn(status, 'replace').andCallFake(function() {
      return status;
    });
    spyOn(status, 'trim').andCallThrough();
    spyOn(commitFileContent, 'substring').andCallThrough();
    spyOn(fs, 'readFileSync').andCallFake(function() {
      if (fs.readFileSync.mostRecentCall.args[0] === fs.absolute(templateFilePath)) {
        return template;
      } else {
        return commitFileContent;
      }
    });
    spyOn(fs, 'writeFileSync');
    spyOn(fs, 'writeFile');
    spyOn(fs, 'unlink');
    spyOn(git, 'refresh');
    spyOn(git, 'getConfig').andCallFake(function() {
      var arg;
      arg = git.getConfig.mostRecentCall.args[1];
      if (arg === 'commit.template') {
        return templateFilePath;
      } else if (arg === 'core.commentchar') {
        return commentChar;
      }
    });
    spyOn(git, 'cmd').andCallFake(function() {
      var args;
      args = git.cmd.mostRecentCall.args[0];
      if (args[0] === 'status') {
        return Promise.resolve(status);
      } else if (args[0] === 'commit') {
        return commitResolution;
      } else if (args[0] === 'diff') {
        return Promise.resolve('diff');
      }
    });
    spyOn(git, 'stagedFiles').andCallFake(function() {
      var args;
      args = git.stagedFiles.mostRecentCall.args;
      if (args[0].getWorkingDirectory() === repo.getWorkingDirectory()) {
        return Promise.resolve([pathToRepoFile]);
      }
    });
    spyOn(git, 'add').andCallFake(function() {
      var args;
      args = git.add.mostRecentCall.args;
      if (args[0].getWorkingDirectory() === repo.getWorkingDirectory() && args[1].update) {
        return Promise.resolve(true);
      }
    });
    spyOn(notifier, 'addError');
    spyOn(notifier, 'addInfo');
    return spyOn(notifier, 'addSuccess');
  };

  describe("GitCommit", function() {
    describe("a regular commit", function() {
      beforeEach(function() {
        atom.config.set("git-plus.openInPane", false);
        commitResolution = Promise.resolve('commit success');
        setupMocks();
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      it("gets the current pane", function() {
        return expect(atom.workspace.getActivePane).toHaveBeenCalled();
      });
      it("gets the commentchar from configs", function() {
        return expect(git.getConfig).toHaveBeenCalledWith(repo, 'core.commentchar');
      });
      it("gets staged files", function() {
        return expect(git.cmd).toHaveBeenCalledWith(['status'], {
          cwd: repo.getWorkingDirectory()
        });
      });
      it("removes lines with '(...)' from status", function() {
        return expect(status.replace).toHaveBeenCalled();
      });
      it("gets the commit template from git configs", function() {
        return expect(git.getConfig).toHaveBeenCalledWith(repo, 'commit.template');
      });
      it("writes to a file", function() {
        var argsTo_fsWriteFile;
        argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
        return expect(argsTo_fsWriteFile[0]).toEqual(commitFilePath);
      });
      it("shows the file", function() {
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      it("calls git.cmd with ['commit'...] on textEditor save", function() {
        textEditor.save();
        waitsFor(function() {
          return git.cmd.callCount > 1;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['commit', "--cleanup=strip", "--file=" + commitFilePath], {
            cwd: repo.getWorkingDirectory()
          });
        });
      });
      it("closes the commit pane when commit is successful", function() {
        textEditor.save();
        waitsFor(function() {
          return commitPane.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(commitPane.destroy).toHaveBeenCalled();
        });
      });
      it("notifies of success when commit is successful", function() {
        textEditor.save();
        waitsFor(function() {
          return notifier.addSuccess.callCount > 0;
        });
        return runs(function() {
          return expect(notifier.addSuccess).toHaveBeenCalledWith('commit success');
        });
      });
      return it("cancels the commit on textEditor destroy", function() {
        textEditor.destroy();
        expect(currentPane.activate).toHaveBeenCalled();
        return expect(fs.unlink).toHaveBeenCalledWith(commitFilePath);
      });
    });
    describe("when core.commentchar config is not set", function() {
      return it("uses '#' in commit file", function() {
        setupMocks();
        return GitCommit(repo).then(function() {
          var args;
          args = fs.writeFileSync.mostRecentCall.args;
          return expect(args[1].trim().charAt(0)).toBe('#');
        });
      });
    });
    describe("when core.commentchar config is set to '$'", function() {
      return it("uses '$' as the commentchar", function() {
        setupMocks({
          commentChar: '$'
        });
        waitsForPromise(function() {
          return GitCommit(repo);
        });
        return runs(function() {
          var args;
          args = fs.writeFileSync.mostRecentCall.args;
          return expect(args[1].trim().charAt(0)).toBe('$');
        });
      });
    });
    describe("when commit.template config is not set", function() {
      return it("commit file starts with a blank line", function() {
        setupMocks();
        return waitsForPromise(function() {
          return GitCommit(repo).then(function() {
            var argsTo_fsWriteFile;
            argsTo_fsWriteFile = fs.writeFileSync.mostRecentCall.args;
            return expect(argsTo_fsWriteFile[1].charAt(0)).toEqual("\n");
          });
        });
      });
    });
    describe("when commit.template config is set", function() {
      return it("commit file starts with content of that file", function() {
        var template;
        template = 'template';
        setupMocks({
          template: template
        });
        GitCommit(repo);
        waitsFor(function() {
          return fs.writeFileSync.callCount > 0;
        });
        return runs(function() {
          var args;
          args = fs.writeFileSync.mostRecentCall.args;
          return expect(args[1].indexOf(template)).toBe(0);
        });
      });
    });
    describe("when 'stageChanges' option is true", function() {
      return it("calls git.add with update option set to true", function() {
        setupMocks();
        return GitCommit(repo, {
          stageChanges: true
        }).then(function() {
          return expect(git.add).toHaveBeenCalledWith(repo, {
            update: true
          });
        });
      });
    });
    describe("a failing commit", function() {
      beforeEach(function() {
        atom.config.set("git-plus.openInPane", false);
        commitResolution = Promise.reject('commit error');
        setupMocks();
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("notifies of error and closes commit pane", function() {
        textEditor.save();
        waitsFor(function() {
          return notifier.addError.callCount > 0;
        });
        return runs(function() {
          expect(notifier.addError).toHaveBeenCalledWith('commit error');
          return expect(commitPane.destroy).toHaveBeenCalled();
        });
      });
    });
    return describe("when the verbose commit setting is true", function() {
      beforeEach(function() {
        atom.config.set("git-plus.openInPane", false);
        atom.config.set("git-plus.experimental", true);
        atom.config.set("git-plus.verboseCommits", true);
        return setupMocks();
      });
      it("calls git.cmd with the --verbose flag", function() {
        waitsForPromise(function() {
          return GitCommit(repo);
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['diff', '--color=never', '--staged'], {
            cwd: repo.getWorkingDirectory()
          });
        });
      });
      return it("trims the commit file", function() {
        textEditor.save();
        waitsFor(function() {
          return commitFileContent.substring.callCount > 0;
        });
        return runs(function() {
          return expect(commitFileContent.substring).toHaveBeenCalledWith(0, commitFileContent.indexOf());
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb21taXQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFPSSxPQUFBLENBQVEsYUFBUixDQVBKLEVBQ0UsZUFERixFQUVFLHlCQUZGLEVBR0UsbUNBSEYsRUFJRSw2QkFKRixFQUtFLDJCQUxGLEVBTUU7O0VBRUYsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLFNBQUEsR0FBWSxPQUFBLENBQVEsNkJBQVI7O0VBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFFWCxjQUFBLEdBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLGdCQUExQjs7RUFDakIsTUFBQSxHQUNFO0lBQUEsT0FBQSxFQUFTLFNBQUE7YUFBRztJQUFILENBQVQ7SUFDQSxJQUFBLEVBQU0sU0FBQTthQUFHO0lBQUgsQ0FETjs7O0VBRUYsZ0JBQUEsR0FBbUI7O0VBQ25CLGNBQUEsR0FBaUI7O0VBQ2pCLGlCQUFBLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTthQUFHO0lBQUgsQ0FBVjtJQUNBLE9BQUEsRUFBUyxTQUFBO2FBQUc7SUFBSCxDQURUO0lBRUEsU0FBQSxFQUFXLFNBQUE7YUFBRztJQUFILENBRlg7SUFHQSxLQUFBLEVBQU8sU0FBQyxVQUFEO01BQWdCLElBQUcsVUFBQSxLQUFjLElBQWpCO2VBQTJCLENBQUMsZ0JBQUQsRUFBbUIsMEJBQW5CLEVBQTNCOztJQUFoQixDQUhQOzs7RUFJRixnQkFBQSxHQUFtQixPQUFPLENBQUMsT0FBUixDQUFnQixnQkFBaEI7O0VBRW5C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QSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBNUU7UUFERyxDQUFMO01BRjBDLENBQTVDO2FBS0EsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7UUFDMUIsVUFBVSxDQUFDLElBQVgsQ0FBQTtRQUNBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxTQUE1QixHQUF3QztRQUEzQyxDQUFUO2VBQ0EsSUFBQSxDQUFLLFNBQUE7aUJBQ0gsTUFBQSxDQUFPLGlCQUFpQixDQUFDLFNBQXpCLENBQW1DLENBQUMsb0JBQXBDLENBQXlELENBQXpELEVBQTRELGlCQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FBNUQ7UUFERyxDQUFMO01BSDBCLENBQTVCO0lBWmtELENBQXBEO0VBM0dvQixDQUF0QjtBQTlFQSIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG57XG4gIHJlcG8sXG4gIHdvcmtzcGFjZSxcbiAgcGF0aFRvUmVwb0ZpbGUsXG4gIGN1cnJlbnRQYW5lLFxuICB0ZXh0RWRpdG9yLFxuICBjb21taXRQYW5lXG59ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5naXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuR2l0Q29tbWl0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtY29tbWl0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9saWIvbm90aWZpZXInXG5cbmNvbW1pdEZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuc3RhdHVzID1cbiAgcmVwbGFjZTogLT4gc3RhdHVzXG4gIHRyaW06IC0+IHN0YXR1c1xudGVtcGxhdGVGaWxlUGF0aCA9ICd+L3RlbXBsYXRlJ1xuY29tbWl0VGVtcGxhdGUgPSAnZm9vYmFyJ1xuY29tbWl0RmlsZUNvbnRlbnQgPVxuICB0b1N0cmluZzogLT4gY29tbWl0RmlsZUNvbnRlbnRcbiAgaW5kZXhPZjogLT4gNVxuICBzdWJzdHJpbmc6IC0+ICdjb21taXQgbWVzc2FnZSdcbiAgc3BsaXQ6IChzcGxpdFBvaW50KSAtPiBpZiBzcGxpdFBvaW50IGlzICdcXG4nIHRoZW4gWydjb21taXQgbWVzc2FnZScsICcjIGNvbW1lbnRzIHRvIGJlIGRlbGV0ZWQnXVxuY29tbWl0UmVzb2x1dGlvbiA9IFByb21pc2UucmVzb2x2ZSAnY29tbWl0IHN1Y2Nlc3MnXG5cbnNldHVwTW9ja3MgPSAoe2NvbW1lbnRDaGFyLCB0ZW1wbGF0ZX09e30pIC0+XG4gIGNvbW1lbnRDaGFyID89IG51bGxcbiAgdGVtcGxhdGUgPz0gJydcbiAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5vcGVuSW5QYW5lJywgZmFsc2VcbiAgc3B5T24oY3VycmVudFBhbmUsICdhY3RpdmF0ZScpXG4gIHNweU9uKGNvbW1pdFBhbmUsICdkZXN0cm95JykuYW5kQ2FsbFRocm91Z2goKVxuICBzcHlPbihjb21taXRQYW5lLCAnc3BsaXRSaWdodCcpXG4gIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZScpLmFuZFJldHVybiBjdXJyZW50UGFuZVxuICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRleHRFZGl0b3JcbiAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdnZXRQYW5lcycpLmFuZFJldHVybiBbY3VycmVudFBhbmUsIGNvbW1pdFBhbmVdXG4gIHNweU9uKGF0b20ud29ya3NwYWNlLCAncGFuZUZvclVSSScpLmFuZFJldHVybiBjb21taXRQYW5lXG4gIHNweU9uKHN0YXR1cywgJ3JlcGxhY2UnKS5hbmRDYWxsRmFrZSAtPiBzdGF0dXNcbiAgc3B5T24oc3RhdHVzLCAndHJpbScpLmFuZENhbGxUaHJvdWdoKClcbiAgc3B5T24oY29tbWl0RmlsZUNvbnRlbnQsICdzdWJzdHJpbmcnKS5hbmRDYWxsVGhyb3VnaCgpXG4gIHNweU9uKGZzLCAncmVhZEZpbGVTeW5jJykuYW5kQ2FsbEZha2UgLT5cbiAgICBpZiBmcy5yZWFkRmlsZVN5bmMubW9zdFJlY2VudENhbGwuYXJnc1swXSBpcyBmcy5hYnNvbHV0ZSh0ZW1wbGF0ZUZpbGVQYXRoKVxuICAgICAgdGVtcGxhdGVcbiAgICBlbHNlXG4gICAgICBjb21taXRGaWxlQ29udGVudFxuICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICBzcHlPbihmcywgJ3dyaXRlRmlsZScpXG4gIHNweU9uKGZzLCAndW5saW5rJylcbiAgc3B5T24oZ2l0LCAncmVmcmVzaCcpXG4gIHNweU9uKGdpdCwgJ2dldENvbmZpZycpLmFuZENhbGxGYWtlIC0+XG4gICAgYXJnID0gZ2l0LmdldENvbmZpZy5tb3N0UmVjZW50Q2FsbC5hcmdzWzFdXG4gICAgaWYgYXJnIGlzICdjb21taXQudGVtcGxhdGUnXG4gICAgICB0ZW1wbGF0ZUZpbGVQYXRoXG4gICAgZWxzZSBpZiBhcmcgaXMgJ2NvcmUuY29tbWVudGNoYXInXG4gICAgICBjb21tZW50Q2hhclxuICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAgIGFyZ3MgPSBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICBpZiBhcmdzWzBdIGlzICdzdGF0dXMnXG4gICAgICBQcm9taXNlLnJlc29sdmUgc3RhdHVzXG4gICAgZWxzZSBpZiBhcmdzWzBdIGlzICdjb21taXQnXG4gICAgICBjb21taXRSZXNvbHV0aW9uXG4gICAgZWxzZSBpZiBhcmdzWzBdIGlzICdkaWZmJ1xuICAgICAgUHJvbWlzZS5yZXNvbHZlICdkaWZmJ1xuICBzcHlPbihnaXQsICdzdGFnZWRGaWxlcycpLmFuZENhbGxGYWtlIC0+XG4gICAgYXJncyA9IGdpdC5zdGFnZWRGaWxlcy5tb3N0UmVjZW50Q2FsbC5hcmdzXG4gICAgaWYgYXJnc1swXS5nZXRXb3JraW5nRGlyZWN0b3J5KCkgaXMgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgICAgIFByb21pc2UucmVzb2x2ZSBbcGF0aFRvUmVwb0ZpbGVdXG4gIHNweU9uKGdpdCwgJ2FkZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgYXJncyA9IGdpdC5hZGQubW9zdFJlY2VudENhbGwuYXJnc1xuICAgIGlmIGFyZ3NbMF0uZ2V0V29ya2luZ0RpcmVjdG9yeSgpIGlzIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpIGFuZCBhcmdzWzFdLnVwZGF0ZVxuICAgICAgUHJvbWlzZS5yZXNvbHZlIHRydWVcblxuICBzcHlPbihub3RpZmllciwgJ2FkZEVycm9yJylcbiAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgc3B5T24obm90aWZpZXIsICdhZGRTdWNjZXNzJylcblxuZGVzY3JpYmUgXCJHaXRDb21taXRcIiwgLT5cbiAgZGVzY3JpYmUgXCJhIHJlZ3VsYXIgY29tbWl0XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0IFwiZ2l0LXBsdXMub3BlbkluUGFuZVwiLCBmYWxzZVxuICAgICAgY29tbWl0UmVzb2x1dGlvbiA9IFByb21pc2UucmVzb2x2ZSAnY29tbWl0IHN1Y2Nlc3MnXG4gICAgICBzZXR1cE1vY2tzKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBHaXRDb21taXQocmVwbylcblxuICAgIGl0IFwiZ2V0cyB0aGUgY3VycmVudCBwYW5lXCIsIC0+XG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImdldHMgdGhlIGNvbW1lbnRjaGFyIGZyb20gY29uZmlnc1wiLCAtPlxuICAgICAgZXhwZWN0KGdpdC5nZXRDb25maWcpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sICdjb3JlLmNvbW1lbnRjaGFyJ1xuXG4gICAgaXQgXCJnZXRzIHN0YWdlZCBmaWxlc1wiLCAtPlxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICAgIGl0IFwicmVtb3ZlcyBsaW5lcyB3aXRoICcoLi4uKScgZnJvbSBzdGF0dXNcIiwgLT5cbiAgICAgIGV4cGVjdChzdGF0dXMucmVwbGFjZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImdldHMgdGhlIGNvbW1pdCB0ZW1wbGF0ZSBmcm9tIGdpdCBjb25maWdzXCIsIC0+XG4gICAgICBleHBlY3QoZ2l0LmdldENvbmZpZykudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgJ2NvbW1pdC50ZW1wbGF0ZSdcblxuICAgIGl0IFwid3JpdGVzIHRvIGEgZmlsZVwiLCAtPlxuICAgICAgYXJnc1RvX2ZzV3JpdGVGaWxlID0gZnMud3JpdGVGaWxlU3luYy5tb3N0UmVjZW50Q2FsbC5hcmdzXG4gICAgICBleHBlY3QoYXJnc1RvX2ZzV3JpdGVGaWxlWzBdKS50b0VxdWFsIGNvbW1pdEZpbGVQYXRoXG5cbiAgICBpdCBcInNob3dzIHRoZSBmaWxlXCIsIC0+XG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3BlbikudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2NvbW1pdCcuLi5dIG9uIHRleHRFZGl0b3Igc2F2ZVwiLCAtPlxuICAgICAgdGV4dEVkaXRvci5zYXZlKClcbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMVxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydjb21taXQnLCBcIi0tY2xlYW51cD1zdHJpcFwiLCBcIi0tZmlsZT0je2NvbW1pdEZpbGVQYXRofVwiXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gICAgaXQgXCJjbG9zZXMgdGhlIGNvbW1pdCBwYW5lIHdoZW4gY29tbWl0IGlzIHN1Y2Nlc3NmdWxcIiwgLT5cbiAgICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgICB3YWl0c0ZvciAtPiBjb21taXRQYW5lLmRlc3Ryb3kuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPiBleHBlY3QoY29tbWl0UGFuZS5kZXN0cm95KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGl0IFwibm90aWZpZXMgb2Ygc3VjY2VzcyB3aGVuIGNvbW1pdCBpcyBzdWNjZXNzZnVsXCIsIC0+XG4gICAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgICAgd2FpdHNGb3IgLT4gbm90aWZpZXIuYWRkU3VjY2Vzcy5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+IGV4cGVjdChub3RpZmllci5hZGRTdWNjZXNzKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCAnY29tbWl0IHN1Y2Nlc3MnXG5cbiAgICBpdCBcImNhbmNlbHMgdGhlIGNvbW1pdCBvbiB0ZXh0RWRpdG9yIGRlc3Ryb3lcIiwgLT5cbiAgICAgIHRleHRFZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QoY3VycmVudFBhbmUuYWN0aXZhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KGZzLnVubGluaykudG9IYXZlQmVlbkNhbGxlZFdpdGggY29tbWl0RmlsZVBhdGhcblxuICBkZXNjcmliZSBcIndoZW4gY29yZS5jb21tZW50Y2hhciBjb25maWcgaXMgbm90IHNldFwiLCAtPlxuICAgIGl0IFwidXNlcyAnIycgaW4gY29tbWl0IGZpbGVcIiwgLT5cbiAgICAgIHNldHVwTW9ja3MoKVxuICAgICAgR2l0Q29tbWl0KHJlcG8pLnRoZW4gLT5cbiAgICAgICAgYXJncyA9IGZzLndyaXRlRmlsZVN5bmMubW9zdFJlY2VudENhbGwuYXJnc1xuICAgICAgICBleHBlY3QoYXJnc1sxXS50cmltKCkuY2hhckF0KDApKS50b0JlICcjJ1xuXG4gIGRlc2NyaWJlIFwid2hlbiBjb3JlLmNvbW1lbnRjaGFyIGNvbmZpZyBpcyBzZXQgdG8gJyQnXCIsIC0+XG4gICAgaXQgXCJ1c2VzICckJyBhcyB0aGUgY29tbWVudGNoYXJcIiwgLT5cbiAgICAgIHNldHVwTW9ja3MoY29tbWVudENoYXI6ICckJylcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXJncyA9IGZzLndyaXRlRmlsZVN5bmMubW9zdFJlY2VudENhbGwuYXJnc1xuICAgICAgICBleHBlY3QoYXJnc1sxXS50cmltKCkuY2hhckF0KDApKS50b0JlICckJ1xuXG4gIGRlc2NyaWJlIFwid2hlbiBjb21taXQudGVtcGxhdGUgY29uZmlnIGlzIG5vdCBzZXRcIiwgLT5cbiAgICBpdCBcImNvbW1pdCBmaWxlIHN0YXJ0cyB3aXRoIGEgYmxhbmsgbGluZVwiLCAtPlxuICAgICAgc2V0dXBNb2NrcygpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgR2l0Q29tbWl0KHJlcG8pLnRoZW4gLT5cbiAgICAgICAgICBhcmdzVG9fZnNXcml0ZUZpbGUgPSBmcy53cml0ZUZpbGVTeW5jLm1vc3RSZWNlbnRDYWxsLmFyZ3NcbiAgICAgICAgICBleHBlY3QoYXJnc1RvX2ZzV3JpdGVGaWxlWzFdLmNoYXJBdCgwKSkudG9FcXVhbCBcIlxcblwiXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNvbW1pdC50ZW1wbGF0ZSBjb25maWcgaXMgc2V0XCIsIC0+XG4gICAgaXQgXCJjb21taXQgZmlsZSBzdGFydHMgd2l0aCBjb250ZW50IG9mIHRoYXQgZmlsZVwiLCAtPlxuICAgICAgdGVtcGxhdGUgPSAndGVtcGxhdGUnXG4gICAgICBzZXR1cE1vY2tzKHt0ZW1wbGF0ZX0pXG4gICAgICBHaXRDb21taXQocmVwbylcbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBhcmdzID0gZnMud3JpdGVGaWxlU3luYy5tb3N0UmVjZW50Q2FsbC5hcmdzXG4gICAgICAgIGV4cGVjdChhcmdzWzFdLmluZGV4T2YodGVtcGxhdGUpKS50b0JlIDBcblxuICBkZXNjcmliZSBcIndoZW4gJ3N0YWdlQ2hhbmdlcycgb3B0aW9uIGlzIHRydWVcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5hZGQgd2l0aCB1cGRhdGUgb3B0aW9uIHNldCB0byB0cnVlXCIsIC0+XG4gICAgICBzZXR1cE1vY2tzKClcbiAgICAgIEdpdENvbW1pdChyZXBvLCBzdGFnZUNoYW5nZXM6IHRydWUpLnRoZW4gLT5cbiAgICAgICAgZXhwZWN0KGdpdC5hZGQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIHVwZGF0ZTogdHJ1ZVxuXG4gIGRlc2NyaWJlIFwiYSBmYWlsaW5nIGNvbW1pdFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCBcImdpdC1wbHVzLm9wZW5JblBhbmVcIiwgZmFsc2VcbiAgICAgIGNvbW1pdFJlc29sdXRpb24gPSBQcm9taXNlLnJlamVjdCAnY29tbWl0IGVycm9yJ1xuICAgICAgc2V0dXBNb2NrcygpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgR2l0Q29tbWl0KHJlcG8pXG5cbiAgICBpdCBcIm5vdGlmaWVzIG9mIGVycm9yIGFuZCBjbG9zZXMgY29tbWl0IHBhbmVcIiwgLT5cbiAgICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgICB3YWl0c0ZvciAtPiBub3RpZmllci5hZGRFcnJvci5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZFdpdGggJ2NvbW1pdCBlcnJvcidcbiAgICAgICAgZXhwZWN0KGNvbW1pdFBhbmUuZGVzdHJveSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSB2ZXJib3NlIGNvbW1pdCBzZXR0aW5nIGlzIHRydWVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgXCJnaXQtcGx1cy5vcGVuSW5QYW5lXCIsIGZhbHNlXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgXCJnaXQtcGx1cy5leHBlcmltZW50YWxcIiwgdHJ1ZVxuICAgICAgYXRvbS5jb25maWcuc2V0IFwiZ2l0LXBsdXMudmVyYm9zZUNvbW1pdHNcIiwgdHJ1ZVxuICAgICAgc2V0dXBNb2NrcygpXG5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCB0aGUgLS12ZXJib3NlIGZsYWdcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZGlmZicsICctLWNvbG9yPW5ldmVyJywgJy0tc3RhZ2VkJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICAgIGl0IFwidHJpbXMgdGhlIGNvbW1pdCBmaWxlXCIsIC0+XG4gICAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgICAgd2FpdHNGb3IgLT4gY29tbWl0RmlsZUNvbnRlbnQuc3Vic3RyaW5nLmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGNvbW1pdEZpbGVDb250ZW50LnN1YnN0cmluZykudG9IYXZlQmVlbkNhbGxlZFdpdGggMCwgY29tbWl0RmlsZUNvbnRlbnQuaW5kZXhPZigpXG5cbiAgIyMgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5vcGVuSW5QYW5lJykgaXMgYWx3YXlzIGZhbHNlIGluc2lkZSB0aGUgbW9kdWxlXG4gICMgZGVzY3JpYmUgXCJ3aGVuIHRoZSBgZ2l0LXBsdXMub3BlbkluUGFuZWAgc2V0dGluZyBpcyB0cnVlXCIsIC0+XG4gICMgICBpdCBcImRlZmF1bHRzIHRvIG9wZW5pbmcgdG8gdGhlIHJpZ2h0XCIsIC0+XG4gICMgICAgIHNldHVwTW9ja3MoKVxuICAjICAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLm9wZW5JblBhbmUnLCBmYWxzZVxuICAjICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0Q29tbWl0KHJlcG8pLnRoZW4gLT5cbiAgIyAgICAgICBleHBlY3QoY29tbWl0UGFuZS5zcGxpdFJpZ2h0KS50b0hhdmVCZWVuQ2FsbGVkKClcbiNcbiMgICAjIyBUb3VnaCBhcyBuYWlscyB0byB0ZXN0IGJlY2F1c2UgR2l0UHVzaCBpcyBjYWxsZWQgb3V0c2lkZSBvZiB0ZXN0XG4jICAgIyBkZXNjcmliZSBcIndoZW4gJ2FuZFB1c2gnIG9wdGlvbiBpcyB0cnVlXCIsIC0+XG4jICAgIyAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsncmVtb3RlJy4uLl0gYXMgYXJnc1wiLCAtPlxuIyAgICMgICAgIHNldHVwTW9ja3MoKVxuIyAgICMgICAgIEdpdENvbW1pdChyZXBvLCBhbmRQdXNoOiB0cnVlKS50aGVuIC0+XG4jICAgIyAgICAgICBydW5zIC0+XG4jICAgIyAgICAgICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4jICAgIyAgICAgICB3YWl0c0ZvcigoLT5cbiMgICAjICAgICAgICAgZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdWzBdIGlzICdyZW1vdGUnKSxcbiMgICAjICAgICAgICAgXCJzb21lIHN0dWZmXCIsIDEwMDAwXG4jICAgIyAgICAgICApXG4jICAgIyAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydyZW1vdGUnXVxuIl19
