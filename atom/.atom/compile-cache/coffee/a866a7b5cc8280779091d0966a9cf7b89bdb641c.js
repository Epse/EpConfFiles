(function() {
  var MergeListView, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  MergeListView = require('../../lib/views/merge-list-view');

  describe("MergeListView", function() {
    beforeEach(function() {
      this.view = new MergeListView(repo, "branch1\nbranch2");
      return spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('');
      });
    });
    it("displays a list of branches", function() {
      return expect(this.view.items.length).toBe(2);
    });
    it("calls git.cmd with 'merge branch1' when branch1 is selected", function() {
      this.view.confirmSelection();
      waitsFor(function() {
        return git.cmd.callCount > 0;
      });
      return expect(git.cmd).toHaveBeenCalledWith(['merge', 'branch1'], {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      });
    });
    return describe("when passed extra arguments", function() {
      return it("calls git.cmd with 'merge [extraArgs] branch1' when branch1 is selected", function() {
        var view;
        view = new MergeListView(repo, "branch1", ['--no-ff']);
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return expect(git.cmd).toHaveBeenCalledWith(['merge', '--no-ff', 'branch1'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3MvbWVyZ2UtbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQ0FBUjs7RUFFaEIsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtJQUN4QixVQUFBLENBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxhQUFBLENBQWMsSUFBZCxFQUFvQixrQkFBcEI7YUFDWixLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO2VBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEI7TUFBSCxDQUE5QjtJQUZTLENBQVg7SUFJQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTthQUNoQyxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztJQURnQyxDQUFsQztJQUdBLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBO01BQ2hFLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQTtNQUNBLFFBQUEsQ0FBUyxTQUFBO2VBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CO01BQXZCLENBQVQ7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxTQUFWLENBQXJDLEVBQTJEO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBM0QsRUFBNEY7UUFBQyxLQUFBLEVBQU8sSUFBUjtPQUE1RjtJQUhnRSxDQUFsRTtXQUtBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO2FBQ3RDLEVBQUEsQ0FBRyx5RUFBSCxFQUE4RSxTQUFBO0FBQzVFLFlBQUE7UUFBQSxJQUFBLEdBQVcsSUFBQSxhQUFBLENBQWMsSUFBZCxFQUFvQixTQUFwQixFQUErQixDQUFDLFNBQUQsQ0FBL0I7UUFDWCxJQUFJLENBQUMsZ0JBQUwsQ0FBQTtRQUNBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixHQUFvQjtRQUF2QixDQUFUO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsU0FBVixFQUFxQixTQUFyQixDQUFyQyxFQUFzRTtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQXRFLEVBQXVHO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBdkc7TUFKNEUsQ0FBOUU7SUFEc0MsQ0FBeEM7RUFid0IsQ0FBMUI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbk1lcmdlTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvbWVyZ2UtbGlzdC12aWV3J1xuXG5kZXNjcmliZSBcIk1lcmdlTGlzdFZpZXdcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEB2aWV3ID0gbmV3IE1lcmdlTGlzdFZpZXcocmVwbywgXCJicmFuY2gxXFxuYnJhbmNoMlwiKVxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+IFByb21pc2UucmVzb2x2ZSAnJ1xuXG4gIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIGJyYW5jaGVzXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ21lcmdlIGJyYW5jaDEnIHdoZW4gYnJhbmNoMSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIEB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ21lcmdlJywgJ2JyYW5jaDEnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfVxuXG4gIGRlc2NyaWJlIFwid2hlbiBwYXNzZWQgZXh0cmEgYXJndW1lbnRzXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ21lcmdlIFtleHRyYUFyZ3NdIGJyYW5jaDEnIHdoZW4gYnJhbmNoMSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgdmlldyA9IG5ldyBNZXJnZUxpc3RWaWV3KHJlcG8sIFwiYnJhbmNoMVwiLCBbJy0tbm8tZmYnXSlcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ21lcmdlJywgJy0tbm8tZmYnLCAnYnJhbmNoMSddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9XG4iXX0=
