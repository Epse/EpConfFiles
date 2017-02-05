(function() {
  var PullBranchListView, colorOptions, git, options, repo;

  git = require('../../lib/git');

  PullBranchListView = require('../../lib/views/pull-branch-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  describe("PullBranchListView", function() {
    beforeEach(function() {
      this.view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '');
      return spyOn(git, 'cmd').andReturn(Promise.resolve('pulled'));
    });
    it("displays a list of branches and the first option is a special one for the current branch", function() {
      expect(this.view.items.length).toBe(3);
      return expect(this.view.items[0].name).toEqual('== Current ==');
    });
    it("has a property called result which is a promise", function() {
      expect(this.view.result).toBeDefined();
      expect(this.view.result.then).toBeDefined();
      return expect(this.view.result["catch"]).toBeDefined();
    });
    it("removes the 'origin/HEAD' option in the list of branches", function() {
      var view;
      view = new PullBranchListView(repo, "branch1\nbranch2\norigin/HEAD", "remote", '');
      return expect(this.view.items.length).toBe(3);
    });
    describe("when the special option is selected", function() {
      return it("calls git.cmd with ['pull'] and remote name", function() {
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote'], options, colorOptions);
        });
      });
    });
    describe("when a branch option is selected", function() {
      return it("calls git.cmd with ['pull'], the remote name, and branch name", function() {
        this.view.selectNextItemView();
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote', 'branch1'], options, colorOptions);
        });
      });
    });
    return describe("when '--rebase' is passed as extraArgs", function() {
      return it("calls git.cmd with ['pull', '--rebase'], the remote name", function() {
        var view;
        view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '--rebase');
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote'], options, colorOptions);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVDQUFSOztFQUNwQixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULE9BQUEsR0FBVTtJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOOzs7RUFDVixZQUFBLEdBQWU7SUFBQyxLQUFBLEVBQU8sSUFBUjs7O0VBRWYsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7SUFDN0IsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsa0JBQUEsQ0FBbUIsSUFBbkIsRUFBeUIsa0JBQXpCLEVBQTZDLFFBQTdDLEVBQXVELEVBQXZEO2FBQ1osS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBNUI7SUFGUyxDQUFYO0lBSUEsRUFBQSxDQUFHLDBGQUFILEVBQStGLFNBQUE7TUFDN0YsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEM7YUFDQSxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxlQUFwQztJQUY2RixDQUEvRjtJQUlBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBO01BQ3BELE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQWIsQ0FBb0IsQ0FBQyxXQUFyQixDQUFBO01BQ0EsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQXBCLENBQXlCLENBQUMsV0FBMUIsQ0FBQTthQUNBLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sRUFBQyxLQUFELEVBQW5CLENBQTBCLENBQUMsV0FBM0IsQ0FBQTtJQUhvRCxDQUF0RDtJQUtBLEVBQUEsQ0FBRywwREFBSCxFQUErRCxTQUFBO0FBQzdELFVBQUE7TUFBQSxJQUFBLEdBQVcsSUFBQSxrQkFBQSxDQUFtQixJQUFuQixFQUF5QiwrQkFBekIsRUFBMEQsUUFBMUQsRUFBb0UsRUFBcEU7YUFDWCxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztJQUY2RCxDQUEvRDtJQUlBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBO2FBQzlDLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO1FBQ2hELElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQTtRQUVBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixHQUFvQjtRQUF2QixDQUFUO2VBQ0EsSUFBQSxDQUFLLFNBQUE7aUJBQ0gsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsUUFBVCxDQUFyQyxFQUF5RCxPQUF6RCxFQUFrRSxZQUFsRTtRQURHLENBQUw7TUFKZ0QsQ0FBbEQ7SUFEOEMsQ0FBaEQ7SUFRQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQTthQUMzQyxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQTtRQUNsRSxJQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFOLENBQUE7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQUE7UUFFQSxRQUFBLENBQVMsU0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0I7UUFBdkIsQ0FBVDtlQUNBLElBQUEsQ0FBSyxTQUFBO2lCQUNILE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsU0FBbkIsQ0FBckMsRUFBb0UsT0FBcEUsRUFBNkUsWUFBN0U7UUFERyxDQUFMO01BTGtFLENBQXBFO0lBRDJDLENBQTdDO1dBU0EsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUE7YUFDakQsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUE7QUFDN0QsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLGtCQUFBLENBQW1CLElBQW5CLEVBQXlCLGtCQUF6QixFQUE2QyxRQUE3QyxFQUF1RCxVQUF2RDtRQUNYLElBQUksQ0FBQyxnQkFBTCxDQUFBO1FBRUEsUUFBQSxDQUFTLFNBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CO1FBQXZCLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtpQkFDSCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLFFBQXJCLENBQXJDLEVBQXFFLE9BQXJFLEVBQThFLFlBQTlFO1FBREcsQ0FBTDtNQUw2RCxDQUEvRDtJQURpRCxDQUFuRDtFQW5DNkIsQ0FBL0I7QUFOQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5QdWxsQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5vcHRpb25zID0ge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9XG5jb2xvck9wdGlvbnMgPSB7Y29sb3I6IHRydWV9XG5cbmRlc2NyaWJlIFwiUHVsbEJyYW5jaExpc3RWaWV3XCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBAdmlldyA9IG5ldyBQdWxsQnJhbmNoTGlzdFZpZXcocmVwbywgXCJicmFuY2gxXFxuYnJhbmNoMlwiLCBcInJlbW90ZVwiLCAnJylcbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdwdWxsZWQnXG5cbiAgaXQgXCJkaXNwbGF5cyBhIGxpc3Qgb2YgYnJhbmNoZXMgYW5kIHRoZSBmaXJzdCBvcHRpb24gaXMgYSBzcGVjaWFsIG9uZSBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAzXG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zWzBdLm5hbWUpLnRvRXF1YWwgJz09IEN1cnJlbnQgPT0nXG5cbiAgaXQgXCJoYXMgYSBwcm9wZXJ0eSBjYWxsZWQgcmVzdWx0IHdoaWNoIGlzIGEgcHJvbWlzZVwiLCAtPlxuICAgIGV4cGVjdChAdmlldy5yZXN1bHQpLnRvQmVEZWZpbmVkKClcbiAgICBleHBlY3QoQHZpZXcucmVzdWx0LnRoZW4pLnRvQmVEZWZpbmVkKClcbiAgICBleHBlY3QoQHZpZXcucmVzdWx0LmNhdGNoKS50b0JlRGVmaW5lZCgpXG5cbiAgaXQgXCJyZW1vdmVzIHRoZSAnb3JpZ2luL0hFQUQnIG9wdGlvbiBpbiB0aGUgbGlzdCBvZiBicmFuY2hlc1wiLCAtPlxuICAgIHZpZXcgPSBuZXcgUHVsbEJyYW5jaExpc3RWaWV3KHJlcG8sIFwiYnJhbmNoMVxcbmJyYW5jaDJcXG5vcmlnaW4vSEVBRFwiLCBcInJlbW90ZVwiLCAnJylcbiAgICBleHBlY3QoQHZpZXcuaXRlbXMubGVuZ3RoKS50b0JlIDNcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIHNwZWNpYWwgb3B0aW9uIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdWxsJ10gYW5kIHJlbW90ZSBuYW1lXCIsIC0+XG4gICAgICBAdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAncmVtb3RlJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBhIGJyYW5jaCBvcHRpb24gaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1bGwnXSwgdGhlIHJlbW90ZSBuYW1lLCBhbmQgYnJhbmNoIG5hbWVcIiwgLT5cbiAgICAgIEB2aWV3LnNlbGVjdE5leHRJdGVtVmlldygpXG4gICAgICBAdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAncmVtb3RlJywgJ2JyYW5jaDEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJ3aGVuICctLXJlYmFzZScgaXMgcGFzc2VkIGFzIGV4dHJhQXJnc1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsncHVsbCcsICctLXJlYmFzZSddLCB0aGUgcmVtb3RlIG5hbWVcIiwgLT5cbiAgICAgIHZpZXcgPSBuZXcgUHVsbEJyYW5jaExpc3RWaWV3KHJlcG8sIFwiYnJhbmNoMVxcbmJyYW5jaDJcIiwgXCJyZW1vdGVcIiwgJy0tcmViYXNlJylcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG5cbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJy0tcmViYXNlJywgJ3JlbW90ZSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcbiJdfQ==
