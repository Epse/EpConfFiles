(function() {
  var GitCheckoutFile, file, git, notifier, repo;

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  GitCheckoutFile = require('../../lib/models/git-checkout-file');

  repo = require('../fixtures').repo;

  file = 'path/to/file';

  describe("GitCheckoutFile", function() {
    it("calls git.cmd with ['checkout', '--', filepath]", function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve());
      GitCheckoutFile(repo, {
        file: file
      });
      return expect(git.cmd).toHaveBeenCalledWith(['checkout', '--', file], {
        cwd: repo.getWorkingDirectory()
      });
    });
    return it("notifies the user when it fails", function() {
      var err;
      err = "error message";
      spyOn(git, 'cmd').andReturn(Promise.reject(err));
      spyOn(notifier, 'addError');
      waitsForPromise(function() {
        return GitCheckoutFile(repo, {
          file: file
        });
      });
      return runs(function() {
        return expect(notifier.addError).toHaveBeenCalledWith(err);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jaGVja291dC1maWxlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFDWCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQ0FBUjs7RUFDakIsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFFVCxJQUFBLEdBQU87O0VBRVAsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUE7SUFDMUIsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7TUFDcEQsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUE1QjtNQUNBLGVBQUEsQ0FBZ0IsSUFBaEIsRUFBc0I7UUFBQyxNQUFBLElBQUQ7T0FBdEI7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLElBQW5CLENBQXJDLEVBQStEO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBL0Q7SUFIb0QsQ0FBdEQ7V0FLQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQTtBQUNwQyxVQUFBO01BQUEsR0FBQSxHQUFNO01BQ04sS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE1BQVIsQ0FBZSxHQUFmLENBQTVCO01BQ0EsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsVUFBaEI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxlQUFBLENBQWdCLElBQWhCLEVBQXNCO1VBQUMsTUFBQSxJQUFEO1NBQXRCO01BQUgsQ0FBaEI7YUFDQSxJQUFBLENBQUssU0FBQTtlQUFHLE1BQUEsQ0FBTyxRQUFRLENBQUMsUUFBaEIsQ0FBeUIsQ0FBQyxvQkFBMUIsQ0FBK0MsR0FBL0M7TUFBSCxDQUFMO0lBTG9DLENBQXRDO0VBTjBCLENBQTVCO0FBUEEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9saWIvbm90aWZpZXInXG5HaXRDaGVja291dEZpbGUgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1jaGVja291dC1maWxlJ1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5cbmZpbGUgPSAncGF0aC90by9maWxlJ1xuXG5kZXNjcmliZSBcIkdpdENoZWNrb3V0RmlsZVwiLCAtPlxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2NoZWNrb3V0JywgJy0tJywgZmlsZXBhdGhdXCIsIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgR2l0Q2hlY2tvdXRGaWxlKHJlcG8sIHtmaWxlfSlcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydjaGVja291dCcsICctLScsIGZpbGVdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgaXQgXCJub3RpZmllcyB0aGUgdXNlciB3aGVuIGl0IGZhaWxzXCIsIC0+XG4gICAgZXJyID0gXCJlcnJvciBtZXNzYWdlXCJcbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkRXJyb3InKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDaGVja291dEZpbGUocmVwbywge2ZpbGV9KVxuICAgIHJ1bnMgLT4gZXhwZWN0KG5vdGlmaWVyLmFkZEVycm9yKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBlcnJcbiJdfQ==
