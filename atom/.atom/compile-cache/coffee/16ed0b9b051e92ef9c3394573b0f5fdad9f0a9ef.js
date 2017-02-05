(function() {
  var GitAddAndCommitContext, GitAddContext, GitCheckoutFileContext, GitDiffContext, GitDifftoolContext, GitUnstageFileContext, contextPackageFinder, git, mockSelectedPath, notifier, repo;

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  contextPackageFinder = require('../../lib/context-package-finder');

  GitAddContext = require('../../lib/models/context/git-add-context');

  GitAddAndCommitContext = require('../../lib/models/context/git-add-and-commit-context');

  GitCheckoutFileContext = require('../../lib/models/context/git-checkout-file-context');

  GitDiffContext = require('../../lib/models/context/git-diff-context');

  GitDifftoolContext = require('../../lib/models/context/git-difftool-context');

  GitUnstageFileContext = require('../../lib/models/context/git-unstage-file-context');

  repo = require('../fixtures').repo;

  mockSelectedPath = 'selected/path';

  describe("GitAddContext", function() {
    describe("when an object in the tree is selected", function() {
      return it("calls git::add", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        spyOn(git, 'add');
        GitAddContext(repo);
        return expect(git.add).toHaveBeenCalledWith(repo, {
          file: mockSelectedPath
        });
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitAddContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add");
      });
    });
  });

  describe("GitAddAndCommitContext", function() {
    describe("when an object in the tree is selected", function() {
      return it("calls git::add and GitCommit", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        spyOn(git, 'add').andReturn(Promise.resolve());
        GitAddAndCommitContext(repo);
        return expect(git.add).toHaveBeenCalledWith(repo, {
          file: mockSelectedPath
        });
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitAddAndCommitContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add and commit");
      });
    });
  });

  describe("GitDiffContext", function() {
    xdescribe("when an object in the tree is selected", function() {
      return it("calls GitDiff", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        return GitDiffContext(repo);
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitDiffContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
      });
    });
  });

  describe("GitDifftoolContext", function() {
    xdescribe("when an object in the tree is selected", function() {
      return it("calls GitDiffTool", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        return GitDifftoolContext(repo);
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitDifftoolContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
      });
    });
  });

  describe("GitCheckoutFileContext", function() {
    xdescribe("when an object in the tree is selected", function() {
      return it("calls CheckoutFile", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        return GitCheckoutFileContext(repo);
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitCheckoutFileContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to checkout");
      });
    });
  });

  describe("GitUnstageFileContext", function() {
    describe("when an object in the tree is selected", function() {
      return it("calls git::cmd to unstage files", function() {
        spyOn(contextPackageFinder, 'get').andReturn({
          selectedPath: mockSelectedPath
        });
        spyOn(git, 'cmd').andReturn(Promise.resolve());
        GitUnstageFileContext(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD', '--', mockSelectedPath], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
    return describe("when an object is not selected", function() {
      return it("notifies the user of the issue", function() {
        spyOn(notifier, 'addInfo');
        GitUnstageFileContext(repo);
        return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to unstage");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb250ZXh0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFDWCxvQkFBQSxHQUF1QixPQUFBLENBQVEsa0NBQVI7O0VBQ3ZCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBDQUFSOztFQUNoQixzQkFBQSxHQUF5QixPQUFBLENBQVEscURBQVI7O0VBQ3pCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxvREFBUjs7RUFDekIsY0FBQSxHQUFpQixPQUFBLENBQVEsMkNBQVI7O0VBQ2pCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSwrQ0FBUjs7RUFDckIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLG1EQUFSOztFQUV2QixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULGdCQUFBLEdBQW1COztFQUVuQixRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0lBQ3hCLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBO2FBQ2pELEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBO1FBQ25CLEtBQUEsQ0FBTSxvQkFBTixFQUE0QixLQUE1QixDQUFrQyxDQUFDLFNBQW5DLENBQTZDO1VBQUMsWUFBQSxFQUFjLGdCQUFmO1NBQTdDO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYO1FBQ0EsYUFBQSxDQUFjLElBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxJQUFyQyxFQUEyQztVQUFBLElBQUEsRUFBTSxnQkFBTjtTQUEzQztNQUptQixDQUFyQjtJQURpRCxDQUFuRDtXQU9BLFFBQUEsQ0FBUyxnQ0FBVCxF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TSxRQUFOLEVBQWdCLFNBQWhCO1FBQ0EscUJBQUEsQ0FBc0IsSUFBdEI7ZUFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLE9BQWhCLENBQXdCLENBQUMsb0JBQXpCLENBQThDLDZCQUE5QztNQUhtQyxDQUFyQztJQUR5QyxDQUEzQztFQVJnQyxDQUFsQztBQWxGQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL2xpYi9ub3RpZmllcidcbmNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vbGliL2NvbnRleHQtcGFja2FnZS1maW5kZXInXG5HaXRBZGRDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1hZGQtY29udGV4dCdcbkdpdEFkZEFuZENvbW1pdENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1hbmQtY29tbWl0LWNvbnRleHQnXG5HaXRDaGVja291dEZpbGVDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1jaGVja291dC1maWxlLWNvbnRleHQnXG5HaXREaWZmQ29udGV4dCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvY29udGV4dC9naXQtZGlmZi1jb250ZXh0J1xuR2l0RGlmZnRvb2xDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmdG9vbC1jb250ZXh0J1xuR2l0VW5zdGFnZUZpbGVDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC11bnN0YWdlLWZpbGUtY29udGV4dCdcblxue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5tb2NrU2VsZWN0ZWRQYXRoID0gJ3NlbGVjdGVkL3BhdGgnXG5cbmRlc2NyaWJlIFwiR2l0QWRkQ29udGV4dFwiLCAtPlxuICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQ6OmFkZFwiLCAtPlxuICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogbW9ja1NlbGVjdGVkUGF0aH1cbiAgICAgIHNweU9uKGdpdCwgJ2FkZCcpXG4gICAgICBHaXRBZGRDb250ZXh0IHJlcG9cbiAgICAgIGV4cGVjdChnaXQuYWRkKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBmaWxlOiBtb2NrU2VsZWN0ZWRQYXRoXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgIEdpdEFkZENvbnRleHQgcmVwb1xuICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGRcIlxuXG5kZXNjcmliZSBcIkdpdEFkZEFuZENvbW1pdENvbnRleHRcIiwgLT5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0OjphZGQgYW5kIEdpdENvbW1pdFwiLCAtPlxuICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogbW9ja1NlbGVjdGVkUGF0aH1cbiAgICAgIHNweU9uKGdpdCwgJ2FkZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgR2l0QWRkQW5kQ29tbWl0Q29udGV4dCByZXBvXG4gICAgICBleHBlY3QoZ2l0LmFkZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogbW9ja1NlbGVjdGVkUGF0aFxuICAgICAgIyBUT0RPOiBmaWd1cmUgb3V0IGhvdyB0byB2YWxpZGF0ZSBHaXRDb21taXQgd2FzIGNhbGxlZFxuICAgICAgIyBleHBlY3QoR2l0Q29tbWl0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgIEdpdEFkZEFuZENvbW1pdENvbnRleHQgcmVwb1xuICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGQgYW5kIGNvbW1pdFwiXG5cbmRlc2NyaWJlIFwiR2l0RGlmZkNvbnRleHRcIiwgLT5cbiAgeGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaW4gdGhlIHRyZWUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcImNhbGxzIEdpdERpZmZcIiwgLT5cbiAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IG1vY2tTZWxlY3RlZFBhdGh9XG4gICAgICBHaXREaWZmQ29udGV4dCByZXBvXG4gICAgICAjIFRPRE86IGV4cGVjdChHaXREaWZmKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBmaWxlOiBtb2NrU2VsZWN0ZWRQYXRoXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgIEdpdERpZmZDb250ZXh0IHJlcG9cbiAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gZGlmZlwiXG5cbmRlc2NyaWJlIFwiR2l0RGlmZnRvb2xDb250ZXh0XCIsIC0+XG4gIHhkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBHaXREaWZmVG9vbFwiLCAtPlxuICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogbW9ja1NlbGVjdGVkUGF0aH1cbiAgICAgIEdpdERpZmZ0b29sQ29udGV4dCByZXBvXG4gICAgICAjIGV4cGVjdChHaXREaWZmVG9vbCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogbW9ja1NlbGVjdGVkUGF0aFxuXG4gIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJub3RpZmllcyB0aGUgdXNlciBvZiB0aGUgaXNzdWVcIiwgLT5cbiAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICBHaXREaWZmdG9vbENvbnRleHQgcmVwb1xuICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBkaWZmXCJcblxuZGVzY3JpYmUgXCJHaXRDaGVja291dEZpbGVDb250ZXh0XCIsIC0+XG4gIHhkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBDaGVja291dEZpbGVcIiwgLT5cbiAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IG1vY2tTZWxlY3RlZFBhdGh9XG4gICAgICBHaXRDaGVja291dEZpbGVDb250ZXh0IHJlcG9cbiAgICAgICMgZXhwZWN0KEdpdENoZWNrb3V0RmlsZSkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogbW9ja1NlbGVjdGVkUGF0aFxuXG4gIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJub3RpZmllcyB0aGUgdXNlciBvZiB0aGUgaXNzdWVcIiwgLT5cbiAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICBHaXRDaGVja291dEZpbGVDb250ZXh0IHJlcG9cbiAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gY2hlY2tvdXRcIlxuXG5kZXNjcmliZSBcIkdpdFVuc3RhZ2VGaWxlQ29udGV4dFwiLCAtPlxuICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQ6OmNtZCB0byB1bnN0YWdlIGZpbGVzXCIsIC0+XG4gICAgICBzcHlPbihjb250ZXh0UGFja2FnZUZpbmRlciwgJ2dldCcpLmFuZFJldHVybiB7c2VsZWN0ZWRQYXRoOiBtb2NrU2VsZWN0ZWRQYXRofVxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICBHaXRVbnN0YWdlRmlsZUNvbnRleHQgcmVwb1xuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVzZXQnLCAnSEVBRCcsICctLScsIG1vY2tTZWxlY3RlZFBhdGhdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgIEdpdFVuc3RhZ2VGaWxlQ29udGV4dCByZXBvXG4gICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIHVuc3RhZ2VcIlxuIl19
