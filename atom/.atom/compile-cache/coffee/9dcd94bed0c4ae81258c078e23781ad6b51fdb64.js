(function() {
  var GitAddContext, GitUnstageFileContext, contextPackageFinder, git, notifier, quibble, repo, selectedFilePath;

  quibble = require('quibble');

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  contextPackageFinder = require('../../lib/context-package-finder');

  GitAddContext = require('../../lib/models/context/git-add-context');

  GitUnstageFileContext = require('../../lib/models/context/git-unstage-file-context');

  repo = require('../fixtures').repo;

  selectedFilePath = 'selected/path';

  describe("Context-menu commands", function() {
    beforeEach(function() {
      return spyOn(git, 'getRepoForPath').andReturn(Promise.resolve(repo));
    });
    describe("GitAddContext", function() {
      describe("when an object in the tree is selected", function() {
        return it("calls git::add", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'add');
          waitsForPromise(function() {
            return GitAddContext();
          });
          return runs(function() {
            return expect(git.add).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitAddContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add");
        });
      });
    });
    describe("GitAddAndCommitContext", function() {
      var GitAddAndCommitContext, GitCommit;
      GitAddAndCommitContext = null;
      GitCommit = null;
      beforeEach(function() {
        GitCommit = quibble('../../lib/models/git-commit', jasmine.createSpy('GitCommit'));
        return GitAddAndCommitContext = require('../../lib/models/context/git-add-and-commit-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls git::add and GitCommit", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'add').andReturn(Promise.resolve());
          waitsForPromise(function() {
            return GitAddAndCommitContext();
          });
          return runs(function() {
            expect(git.add).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
            return expect(GitCommit).toHaveBeenCalledWith(repo);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitAddAndCommitContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add and commit");
        });
      });
    });
    describe("GitDiffContext", function() {
      var GitDiff, GitDiffContext;
      GitDiff = null;
      GitDiffContext = null;
      beforeEach(function() {
        GitDiff = quibble('../../lib/models/git-diff', jasmine.createSpy('GitDiff'));
        return GitDiffContext = require('../../lib/models/context/git-diff-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiff", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDiffContext();
          });
          return runs(function() {
            return expect(GitDiff).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDiffContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
        });
      });
    });
    describe("GitDifftoolContext", function() {
      var GitDiffTool, GitDifftoolContext;
      GitDiffTool = null;
      GitDifftoolContext = null;
      beforeEach(function() {
        GitDiffTool = quibble('../../lib/models/git-difftool', jasmine.createSpy('GitDiffTool'));
        return GitDifftoolContext = require('../../lib/models/context/git-difftool-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiffTool", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDifftoolContext();
          });
          return runs(function() {
            return expect(GitDiffTool).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDifftoolContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
        });
      });
    });
    describe("GitCheckoutFileContext", function() {
      var GitCheckoutFile, GitCheckoutFileContext;
      GitCheckoutFile = null;
      GitCheckoutFileContext = null;
      beforeEach(function() {
        GitCheckoutFile = quibble('../../lib/models/git-checkout-file', jasmine.createSpy('GitCheckoutFile'));
        return GitCheckoutFileContext = require('../../lib/models/context/git-checkout-file-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls CheckoutFile", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(atom, 'confirm').andCallFake(function() {
            return atom.confirm.mostRecentCall.args[0].buttons.Yes();
          });
          waitsForPromise(function() {
            return GitCheckoutFileContext();
          });
          return runs(function() {
            return expect(GitCheckoutFile).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitCheckoutFileContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to checkout");
        });
      });
    });
    describe("GitUnstageFileContext", function() {
      describe("when an object in the tree is selected", function() {
        return it("calls git::cmd to unstage files", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'cmd').andReturn(Promise.resolve());
          waitsForPromise(function() {
            return GitUnstageFileContext();
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD', '--', selectedFilePath], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitUnstageFileContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to unstage");
        });
      });
    });
    describe("GitPullContext", function() {
      var GitPull, GitPullContext, ref;
      ref = [], GitPull = ref[0], GitPullContext = ref[1];
      beforeEach(function() {
        GitPull = quibble('../../lib/models/git-pull', jasmine.createSpy('GitPull'));
        return GitPullContext = require('../../lib/models/context/git-pull-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitPull with the options received", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitPullContext();
          });
          return runs(function() {
            return expect(GitPull).toHaveBeenCalledWith(repo);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitPullContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
    return describe("GitPushContext", function() {
      var GitPush, GitPushContext, ref;
      ref = [], GitPush = ref[0], GitPushContext = ref[1];
      beforeEach(function() {
        GitPush = quibble('../../lib/models/git-push', jasmine.createSpy('GitPush'));
        return GitPushContext = require('../../lib/models/context/git-push-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitPush with the options received", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitPushContext({
              setUpstream: true
            });
          });
          return runs(function() {
            return expect(GitPush).toHaveBeenCalledWith(repo, {
              setUpstream: true
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitPushContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb250ZXh0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVI7O0VBQ1gsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLGtDQUFSOztFQUN2QixhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQ0FBUjs7RUFDaEIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLG1EQUFSOztFQUV2QixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULGdCQUFBLEdBQW1COztFQUVuQixRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTtJQUNoQyxVQUFBLENBQVcsU0FBQTthQUNULEtBQUEsQ0FBTSxHQUFOLEVBQVcsZ0JBQVgsQ0FBNEIsQ0FBQyxTQUE3QixDQUF1QyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUF2QztJQURTLENBQVg7SUFHQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO01BQ3hCLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBO2VBQ2pELEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBO1VBQ25CLEtBQUEsQ0FBTSxvQkFBTixFQUE0QixLQUE1QixDQUFrQyxDQUFDLFNBQW5DLENBQTZDO1lBQUMsWUFBQSxFQUFjLGdCQUFmO1dBQTdDO1VBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYO1VBQ0EsZUFBQSxDQUFnQixTQUFBO21CQUFHLGFBQUEsQ0FBQTtVQUFILENBQWhCO2lCQUNBLElBQUEsQ0FBSyxTQUFBO21CQUFHLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhC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U0FBbkMsQ0FBNkM7WUFBQyxZQUFBLEVBQWMsZ0JBQWY7V0FBN0M7VUFDQSxlQUFBLENBQWdCLFNBQUE7bUJBQUcsY0FBQSxDQUFlO2NBQUEsV0FBQSxFQUFhLElBQWI7YUFBZjtVQUFILENBQWhCO2lCQUNBLElBQUEsQ0FBSyxTQUFBO21CQUFHLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsSUFBckMsRUFBMkM7Y0FBQSxXQUFBLEVBQWEsSUFBYjthQUEzQztVQUFILENBQUw7UUFINEMsQ0FBOUM7TUFEaUQsQ0FBbkQ7YUFNQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQTtlQUN6QyxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtVQUNuQyxLQUFBLENBQU0sUUFBTixFQUFnQixTQUFoQjtVQUNBLGNBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLE9BQWhCLENBQXdCLENBQUMsb0JBQXpCLENBQThDLHFCQUE5QztRQUhtQyxDQUFyQztNQUR5QyxDQUEzQztJQWJ5QixDQUEzQjtFQXZJZ0MsQ0FBbEM7QUFWQSIsInNvdXJjZXNDb250ZW50IjpbInF1aWJibGUgPSByZXF1aXJlICdxdWliYmxlJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbGliL25vdGlmaWVyJ1xuY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9saWIvY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbkdpdEFkZENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1jb250ZXh0J1xuR2l0VW5zdGFnZUZpbGVDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC11bnN0YWdlLWZpbGUtY29udGV4dCdcblxue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5zZWxlY3RlZEZpbGVQYXRoID0gJ3NlbGVjdGVkL3BhdGgnXG5cbmRlc2NyaWJlIFwiQ29udGV4dC1tZW51IGNvbW1hbmRzXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzcHlPbihnaXQsICdnZXRSZXBvRm9yUGF0aCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUocmVwbylcblxuICBkZXNjcmliZSBcIkdpdEFkZENvbnRleHRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdDo6YWRkXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHNweU9uKGdpdCwgJ2FkZCcpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRBZGRDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoZ2l0LmFkZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogc2VsZWN0ZWRGaWxlUGF0aFxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdEFkZENvbnRleHQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIGFkZFwiXG5cbiAgZGVzY3JpYmUgXCJHaXRBZGRBbmRDb21taXRDb250ZXh0XCIsIC0+XG4gICAgR2l0QWRkQW5kQ29tbWl0Q29udGV4dCA9IG51bGxcbiAgICBHaXRDb21taXQgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBHaXRDb21taXQgPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1jb21taXQnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0Q29tbWl0JylcbiAgICAgIEdpdEFkZEFuZENvbW1pdENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1hbmQtY29tbWl0LWNvbnRleHQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdDo6YWRkIGFuZCBHaXRDb21taXRcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgc3B5T24oZ2l0LCAnYWRkJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRBZGRBbmRDb21taXRDb250ZXh0KClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuYWRkKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBmaWxlOiBzZWxlY3RlZEZpbGVQYXRoXG4gICAgICAgICAgZXhwZWN0KEdpdENvbW1pdCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwb1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdEFkZEFuZENvbW1pdENvbnRleHQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIGFkZCBhbmQgY29tbWl0XCJcblxuICBkZXNjcmliZSBcIkdpdERpZmZDb250ZXh0XCIsIC0+XG4gICAgR2l0RGlmZiA9IG51bGxcbiAgICBHaXREaWZmQ29udGV4dCA9IG51bGxcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdERpZmYgPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1kaWZmJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdERpZmYnKVxuICAgICAgR2l0RGlmZkNvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmYtY29udGV4dCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaW4gdGhlIHRyZWUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgR2l0RGlmZlwiLCAtPlxuICAgICAgICBzcHlPbihjb250ZXh0UGFja2FnZUZpbmRlciwgJ2dldCcpLmFuZFJldHVybiB7c2VsZWN0ZWRQYXRoOiBzZWxlY3RlZEZpbGVQYXRofVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0RGlmZkNvbnRleHQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChHaXREaWZmKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBmaWxlOiBzZWxlY3RlZEZpbGVQYXRoXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGlzIG5vdCBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJub3RpZmllcyB0aGUgdXNlciBvZiB0aGUgaXNzdWVcIiwgLT5cbiAgICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgICAgR2l0RGlmZkNvbnRleHQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIGRpZmZcIlxuXG4gIGRlc2NyaWJlIFwiR2l0RGlmZnRvb2xDb250ZXh0XCIsIC0+XG4gICAgR2l0RGlmZlRvb2wgPSBudWxsXG4gICAgR2l0RGlmZnRvb2xDb250ZXh0ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgR2l0RGlmZlRvb2wgPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbCcsIGphc21pbmUuY3JlYXRlU3B5KCdHaXREaWZmVG9vbCcpXG4gICAgICBHaXREaWZmdG9vbENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmZ0b29sLWNvbnRleHQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIEdpdERpZmZUb29sXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXREaWZmdG9vbENvbnRleHQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChHaXREaWZmVG9vbCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogc2VsZWN0ZWRGaWxlUGF0aFxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdERpZmZ0b29sQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gZGlmZlwiXG5cbiAgZGVzY3JpYmUgXCJHaXRDaGVja291dEZpbGVDb250ZXh0XCIsIC0+XG4gICAgR2l0Q2hlY2tvdXRGaWxlID0gbnVsbFxuICAgIEdpdENoZWNrb3V0RmlsZUNvbnRleHQgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBHaXRDaGVja291dEZpbGUgPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1jaGVja291dC1maWxlJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdENoZWNrb3V0RmlsZScpXG4gICAgICBHaXRDaGVja291dEZpbGVDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1jaGVja291dC1maWxlLWNvbnRleHQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIENoZWNrb3V0RmlsZVwiLCAtPlxuICAgICAgICBzcHlPbihjb250ZXh0UGFja2FnZUZpbmRlciwgJ2dldCcpLmFuZFJldHVybiB7c2VsZWN0ZWRQYXRoOiBzZWxlY3RlZEZpbGVQYXRofVxuICAgICAgICBzcHlPbihhdG9tLCAnY29uZmlybScpLmFuZENhbGxGYWtlIC0+IGF0b20uY29uZmlybS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmJ1dHRvbnMuWWVzKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENoZWNrb3V0RmlsZUNvbnRleHQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChHaXRDaGVja291dEZpbGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIGZpbGU6IHNlbGVjdGVkRmlsZVBhdGhcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRDaGVja291dEZpbGVDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBjaGVja291dFwiXG5cbiAgZGVzY3JpYmUgXCJHaXRVbnN0YWdlRmlsZUNvbnRleHRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdDo6Y21kIHRvIHVuc3RhZ2UgZmlsZXNcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRVbnN0YWdlRmlsZUNvbnRleHQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3Jlc2V0JywgJ0hFQUQnLCAnLS0nLCBzZWxlY3RlZEZpbGVQYXRoXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdFVuc3RhZ2VGaWxlQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gdW5zdGFnZVwiXG5cbiAgZGVzY3JpYmUgXCJHaXRQdWxsQ29udGV4dFwiLCAtPlxuICAgIFtHaXRQdWxsLCBHaXRQdWxsQ29udGV4dF0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgR2l0UHVsbCA9IHF1aWJibGUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1bGwnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0UHVsbCcpXG4gICAgICBHaXRQdWxsQ29udGV4dCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvY29udGV4dC9naXQtcHVsbC1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBHaXRQdWxsIHdpdGggdGhlIG9wdGlvbnMgcmVjZWl2ZWRcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdFB1bGxDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0UHVsbCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwb1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdFB1bGxDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gcmVwb3NpdG9yeSBmb3VuZFwiXG5cbiAgZGVzY3JpYmUgXCJHaXRQdXNoQ29udGV4dFwiLCAtPlxuICAgIFtHaXRQdXNoLCBHaXRQdXNoQ29udGV4dF0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgR2l0UHVzaCA9IHF1aWJibGUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1c2gnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0UHVzaCcpXG4gICAgICBHaXRQdXNoQ29udGV4dCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvY29udGV4dC9naXQtcHVzaC1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBHaXRQdXNoIHdpdGggdGhlIG9wdGlvbnMgcmVjZWl2ZWRcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdFB1c2hDb250ZXh0KHNldFVwc3RyZWFtOiB0cnVlKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChHaXRQdXNoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBzZXRVcHN0cmVhbTogdHJ1ZVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdFB1c2hDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gcmVwb3NpdG9yeSBmb3VuZFwiXG4iXX0=
