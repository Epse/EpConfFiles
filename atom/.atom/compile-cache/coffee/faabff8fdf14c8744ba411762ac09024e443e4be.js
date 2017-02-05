(function() {
  var GitCommitAmend, Path, commitFilePath, commitPane, currentPane, fs, git, pathToRepoFile, ref, repo, textEditor;

  Path = require('path');

  fs = require('fs-plus');

  git = require('../../lib/git');

  GitCommitAmend = require('../../lib/models/git-commit-amend');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor, commitPane = ref.commitPane, currentPane = ref.currentPane;

  commitFilePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');

  describe("GitCommitAmend", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'getActivePane').andReturn(currentPane);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(atom.workspace, 'getPanes').andReturn([currentPane, commitPane]);
      spyOn(atom.workspace, 'paneForURI').andReturn(commitPane);
      spyOn(git, 'refresh');
      spyOn(commitPane, 'destroy').andCallThrough();
      spyOn(currentPane, 'activate');
      spyOn(fs, 'unlink');
      spyOn(fs, 'readFileSync').andReturn('');
      spyOn(git, 'stagedFiles').andCallFake(function() {
        var args;
        args = git.stagedFiles.mostRecentCall.args;
        if (args[0].getWorkingDirectory() === repo.getWorkingDirectory()) {
          return Promise.resolve([pathToRepoFile]);
        }
      });
      return spyOn(git, 'cmd').andCallFake(function() {
        var args;
        args = git.cmd.mostRecentCall.args[0];
        switch (args[0]) {
          case 'whatchanged':
            return Promise.resolve('last commit');
          case 'status':
            return Promise.resolve('current status');
          default:
            return Promise.resolve('');
        }
      });
    });
    it("gets the previous commit message and changed files", function() {
      var expectedGitArgs;
      expectedGitArgs = ['whatchanged', '-1', '--name-status', '--format=%B'];
      GitCommitAmend(repo);
      return expect(git.cmd).toHaveBeenCalledWith(expectedGitArgs, {
        cwd: repo.getWorkingDirectory()
      });
    });
    it("writes to the new commit file", function() {
      spyOn(fs, 'writeFileSync');
      GitCommitAmend(repo);
      waitsFor(function() {
        return fs.writeFileSync.callCount > 0;
      });
      return runs(function() {
        var actualPath;
        actualPath = fs.writeFileSync.mostRecentCall.args[0];
        return expect(actualPath).toEqual(commitFilePath);
      });
    });
    it("shows the file", function() {
      GitCommitAmend(repo);
      waitsFor(function() {
        return atom.workspace.open.callCount > 0;
      });
      return runs(function() {
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
    });
    it("calls git.cmd with ['commit'...] on textEditor save", function() {
      GitCommitAmend(repo);
      textEditor.save();
      return expect(git.cmd).toHaveBeenCalledWith(['commit', '--amend', '--cleanup=strip', "--file=" + commitFilePath], {
        cwd: repo.getWorkingDirectory()
      });
    });
    it("closes the commit pane when commit is successful", function() {
      GitCommitAmend(repo);
      textEditor.save();
      waitsFor(function() {
        return commitPane.destroy.callCount > 0;
      });
      return runs(function() {
        return expect(commitPane.destroy).toHaveBeenCalled();
      });
    });
    return it("cancels the commit on textEditor destroy", function() {
      GitCommitAmend(repo);
      textEditor.destroy();
      expect(currentPane.activate).toHaveBeenCalled();
      return expect(fs.unlink).toHaveBeenCalledWith(commitFilePath);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb21taXQtYW1lbmQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1DQUFSOztFQUNqQixNQU1JLE9BQUEsQ0FBUSxhQUFSLENBTkosRUFDRSxlQURGLEVBRUUsbUNBRkYsRUFHRSwyQkFIRixFQUlFLDJCQUpGLEVBS0U7O0VBR0YsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixnQkFBMUI7O0VBRWpCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0lBQ3pCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLGVBQXRCLENBQXNDLENBQUMsU0FBdkMsQ0FBaUQsV0FBakQ7TUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsTUFBdEIsQ0FBNkIsQ0FBQyxTQUE5QixDQUF3QyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixDQUF4QztNQUNBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixVQUF0QixDQUFpQyxDQUFDLFNBQWxDLENBQTRDLENBQUMsV0FBRCxFQUFjLFVBQWQsQ0FBNUM7TUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsWUFBdEIsQ0FBbUMsQ0FBQyxTQUFwQyxDQUE4QyxVQUE5QztNQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsU0FBWDtNQUVBLEtBQUEsQ0FBTSxVQUFO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RDtJQUtBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBO01BQ3JELGNBQUEsQ0FBZSxJQUFmO01BQ0EsVUFBVSxDQUFDLElBQVgsQ0FBQTtNQUNBLFFBQUEsQ0FBUyxTQUFBO2VBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFuQixHQUErQjtNQUFsQyxDQUFUO2FBQ0EsSUFBQSxDQUFLLFNBQUE7ZUFBRyxNQUFBLENBQU8sVUFBVSxDQUFDLE9BQWxCLENBQTBCLENBQUMsZ0JBQTNCLENBQUE7TUFBSCxDQUFMO0lBSnFELENBQXZEO1dBTUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7TUFDN0MsY0FBQSxDQUFlLElBQWY7TUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO01BQ0EsTUFBQSxDQUFPLFdBQVcsQ0FBQyxRQUFuQixDQUE0QixDQUFDLGdCQUE3QixDQUFBO2FBQ0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxNQUFWLENBQWlCLENBQUMsb0JBQWxCLENBQXVDLGNBQXZDO0lBSjZDLENBQS9DO0VBekR5QixDQUEzQjtBQWZBIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5HaXRDb21taXRBbWVuZCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZCdcbntcbiAgcmVwbyxcbiAgcGF0aFRvUmVwb0ZpbGUsXG4gIHRleHRFZGl0b3IsXG4gIGNvbW1pdFBhbmUsXG4gIGN1cnJlbnRQYW5lXG59ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5cbmNvbW1pdEZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuXG5kZXNjcmliZSBcIkdpdENvbW1pdEFtZW5kXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVBhbmUnKS5hbmRSZXR1cm4gY3VycmVudFBhbmVcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRleHRFZGl0b3JcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldFBhbmVzJykuYW5kUmV0dXJuIFtjdXJyZW50UGFuZSwgY29tbWl0UGFuZV1cbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ3BhbmVGb3JVUkknKS5hbmRSZXR1cm4gY29tbWl0UGFuZVxuICAgIHNweU9uKGdpdCwgJ3JlZnJlc2gnKVxuXG4gICAgc3B5T24oY29tbWl0UGFuZSwgJ2Rlc3Ryb3knKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgc3B5T24oY3VycmVudFBhbmUsICdhY3RpdmF0ZScpXG5cbiAgICBzcHlPbihmcywgJ3VubGluaycpXG4gICAgc3B5T24oZnMsICdyZWFkRmlsZVN5bmMnKS5hbmRSZXR1cm4gJydcbiAgICBzcHlPbihnaXQsICdzdGFnZWRGaWxlcycpLmFuZENhbGxGYWtlIC0+XG4gICAgICBhcmdzID0gZ2l0LnN0YWdlZEZpbGVzLm1vc3RSZWNlbnRDYWxsLmFyZ3NcbiAgICAgIGlmIGFyZ3NbMF0uZ2V0V29ya2luZ0RpcmVjdG9yeSgpIGlzIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSBbcGF0aFRvUmVwb0ZpbGVdXG5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgc3dpdGNoIGFyZ3NbMF1cbiAgICAgICAgd2hlbiAnd2hhdGNoYW5nZWQnIHRoZW4gUHJvbWlzZS5yZXNvbHZlICdsYXN0IGNvbW1pdCdcbiAgICAgICAgd2hlbiAnc3RhdHVzJyB0aGVuIFByb21pc2UucmVzb2x2ZSAnY3VycmVudCBzdGF0dXMnXG4gICAgICAgIGVsc2UgUHJvbWlzZS5yZXNvbHZlICcnXG5cbiAgaXQgXCJnZXRzIHRoZSBwcmV2aW91cyBjb21taXQgbWVzc2FnZSBhbmQgY2hhbmdlZCBmaWxlc1wiLCAtPlxuICAgIGV4cGVjdGVkR2l0QXJncyA9IFsnd2hhdGNoYW5nZWQnLCAnLTEnLCAnLS1uYW1lLXN0YXR1cycsICctLWZvcm1hdD0lQiddXG4gICAgR2l0Q29tbWl0QW1lbmQgcmVwb1xuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBleHBlY3RlZEdpdEFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBpdCBcIndyaXRlcyB0byB0aGUgbmV3IGNvbW1pdCBmaWxlXCIsIC0+XG4gICAgc3B5T24oZnMsICd3cml0ZUZpbGVTeW5jJylcbiAgICBHaXRDb21taXRBbWVuZCByZXBvXG4gICAgd2FpdHNGb3IgLT5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMuY2FsbENvdW50ID4gMFxuICAgIHJ1bnMgLT5cbiAgICAgIGFjdHVhbFBhdGggPSBmcy53cml0ZUZpbGVTeW5jLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgIGV4cGVjdChhY3R1YWxQYXRoKS50b0VxdWFsIGNvbW1pdEZpbGVQYXRoXG5cbiAgaXQgXCJzaG93cyB0aGUgZmlsZVwiLCAtPlxuICAgIEdpdENvbW1pdEFtZW5kIHJlcG9cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbi5jYWxsQ291bnQgPiAwXG4gICAgcnVucyAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnY29tbWl0Jy4uLl0gb24gdGV4dEVkaXRvciBzYXZlXCIsIC0+XG4gICAgR2l0Q29tbWl0QW1lbmQgcmVwb1xuICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnY29tbWl0JywgJy0tYW1lbmQnLCAnLS1jbGVhbnVwPXN0cmlwJywgXCItLWZpbGU9I3tjb21taXRGaWxlUGF0aH1cIl0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBpdCBcImNsb3NlcyB0aGUgY29tbWl0IHBhbmUgd2hlbiBjb21taXQgaXMgc3VjY2Vzc2Z1bFwiLCAtPlxuICAgIEdpdENvbW1pdEFtZW5kIHJlcG9cbiAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgIHdhaXRzRm9yIC0+IGNvbW1pdFBhbmUuZGVzdHJveS5jYWxsQ291bnQgPiAwXG4gICAgcnVucyAtPiBleHBlY3QoY29tbWl0UGFuZS5kZXN0cm95KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBpdCBcImNhbmNlbHMgdGhlIGNvbW1pdCBvbiB0ZXh0RWRpdG9yIGRlc3Ryb3lcIiwgLT5cbiAgICBHaXRDb21taXRBbWVuZCByZXBvXG4gICAgdGV4dEVkaXRvci5kZXN0cm95KClcbiAgICBleHBlY3QoY3VycmVudFBhbmUuYWN0aXZhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIGV4cGVjdChmcy51bmxpbmspLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIGNvbW1pdEZpbGVQYXRoXG4iXX0=
