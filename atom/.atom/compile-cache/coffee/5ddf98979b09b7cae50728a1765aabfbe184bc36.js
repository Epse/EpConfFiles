(function() {
  var git, gitBranches, gitRemoteBranches, newBranch, pathToRepoFile, ref, ref1, repo;

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  ref1 = require('../../lib/models/git-branch'), gitBranches = ref1.gitBranches, gitRemoteBranches = ref1.gitRemoteBranches, newBranch = ref1.newBranch;

  describe("GitBranch", function() {
    beforeEach(function() {
      return spyOn(atom.workspace, 'addModalPanel').andCallThrough();
    });
    describe(".gitBranches", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('branch1\nbranch2'));
        return waitsForPromise(function() {
          return gitBranches(repo);
        });
      });
      return it("displays a list of the repo's branches", function() {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], {
          cwd: repo.getWorkingDirectory()
        });
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
    describe(".gitRemoteBranches", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('branch1\nbranch2'));
        return waitsForPromise(function() {
          return gitRemoteBranches(repo);
        });
      });
      return it("displays a list of the repo's remote branches", function() {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '-r', '--no-color'], {
          cwd: repo.getWorkingDirectory()
        });
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
    return describe(".newBranch", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(function() {
          return Promise.reject('new branch created');
        });
        return newBranch(repo);
      });
      return it("displays a text input", function() {
        return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1icmFuY2gtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixNQUF5QixPQUFBLENBQVEsYUFBUixDQUF6QixFQUFDLGVBQUQsRUFBTzs7RUFDUCxPQUlJLE9BQUEsQ0FBUSw2QkFBUixDQUpKLEVBQ0UsOEJBREYsRUFFRSwwQ0FGRixFQUdFOztFQUdGLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7SUFDcEIsVUFBQSxDQUFXLFNBQUE7YUFDUCxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsZUFBdEIsQ0FBc0MsQ0FBQyxjQUF2QyxDQUFBO0lBRE8sQ0FBWDtJQUdBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7TUFDdkIsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsQ0FBNUI7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsV0FBQSxDQUFZLElBQVo7UUFBSCxDQUFoQjtNQUZTLENBQVg7YUFJQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQTtRQUMzQyxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsRUFBVyxZQUFYLENBQXJDLEVBQStEO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBL0Q7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUF0QixDQUFvQyxDQUFDLGdCQUFyQyxDQUFBO01BRjJDLENBQTdDO0lBTHVCLENBQXpCO0lBU0EsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7TUFDN0IsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsQ0FBNUI7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsaUJBQUEsQ0FBa0IsSUFBbEI7UUFBSCxDQUFoQjtNQUZTLENBQVg7YUFJQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtRQUNsRCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLFlBQWpCLENBQXJDLEVBQXFFO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBckU7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUF0QixDQUFvQyxDQUFDLGdCQUFyQyxDQUFBO01BRmtELENBQXBEO0lBTDZCLENBQS9CO1dBU0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtNQUNyQixVQUFBLENBQVcsU0FBQTtRQUNULEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLFNBQUE7aUJBQUcsT0FBTyxDQUFDLE1BQVIsQ0FBZSxvQkFBZjtRQUFILENBQTVCO2VBQ0EsU0FBQSxDQUFVLElBQVY7TUFGUyxDQUFYO2FBSUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7ZUFDMUIsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBdEIsQ0FBb0MsQ0FBQyxnQkFBckMsQ0FBQTtNQUQwQixDQUE1QjtJQUxxQixDQUF2QjtFQXRCb0IsQ0FBdEI7QUFSQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwbywgcGF0aFRvUmVwb0ZpbGV9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG57XG4gIGdpdEJyYW5jaGVzLFxuICBnaXRSZW1vdGVCcmFuY2hlcyxcbiAgbmV3QnJhbmNoXG59ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtYnJhbmNoJ1xuXG5kZXNjcmliZSBcIkdpdEJyYW5jaFwiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2FkZE1vZGFsUGFuZWwnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgZGVzY3JpYmUgXCIuZ2l0QnJhbmNoZXNcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxXFxuYnJhbmNoMidcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXRCcmFuY2hlcyhyZXBvKVxuXG4gICAgaXQgXCJkaXNwbGF5cyBhIGxpc3Qgb2YgdGhlIHJlcG8ncyBicmFuY2hlc1wiLCAtPlxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnYnJhbmNoJywgJy0tbm8tY29sb3InXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiLmdpdFJlbW90ZUJyYW5jaGVzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnYnJhbmNoMVxcbmJyYW5jaDInXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0UmVtb3RlQnJhbmNoZXMocmVwbylcblxuICAgIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIHRoZSByZXBvJ3MgcmVtb3RlIGJyYW5jaGVzXCIsIC0+XG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydicmFuY2gnLCAnLXInLCAnLS1uby1jb2xvciddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCIubmV3QnJhbmNoXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIC0+IFByb21pc2UucmVqZWN0ICduZXcgYnJhbmNoIGNyZWF0ZWQnXG4gICAgICBuZXdCcmFuY2gocmVwbylcblxuICAgIGl0IFwiZGlzcGxheXMgYSB0ZXh0IGlucHV0XCIsIC0+XG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAjIyBUd2Vha3Mgb3V0IGFib3V0ICdnaXQnIGJlaW5nIHVuZGVmaW5lZCBmb3Igc29tZSByZWFzb25cbiAgICAjIGl0IFwiY3JlYXRlcyBhIGJyYW5jaCB3aXRoIHRoZSBuYW1lIGVudGVyZWQgaW4gdGhlIGlucHV0IHZpZXdcIiwgLT5cbiAgICAjICAgYnJhbmNoTmFtZSA9ICduZWF0Ly1icmFuY2gnXG4gICAgIyAgIEB2aWV3LmJyYW5jaEVkaXRvci5zZXRUZXh0IGJyYW5jaE5hbWVcbiAgICAjICAgQHZpZXcuY3JlYXRlQnJhbmNoKClcbiAgICAjICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnY2hlY2tvdXQnLCAnLWInLCBicmFuY2hOYW1lXVxuIl19
