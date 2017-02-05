(function() {
  var GitStashApply, GitStashDrop, GitStashPop, GitStashSave, colorOptions, git, options, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitStashApply = require('../../lib/models/git-stash-apply');

  GitStashSave = require('../../lib/models/git-stash-save');

  GitStashPop = require('../../lib/models/git-stash-pop');

  GitStashDrop = require('../../lib/models/git-stash-drop');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  describe("Git Stash commands", function() {
    describe("Apply", function() {
      return it("calls git.cmd with 'stash' and 'apply'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashApply(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'apply'], options, colorOptions);
      });
    });
    describe("Save", function() {
      return it("calls git.cmd with 'stash' and 'save'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save'], options, colorOptions);
      });
    });
    describe("Save with message", function() {
      return it("calls git.cmd with 'stash', 'save', and provides message", function() {
        var message;
        message = 'foobar';
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo, {
          message: message
        });
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save', message], options, colorOptions);
      });
    });
    describe("Pop", function() {
      return it("calls git.cmd with 'stash' and 'pop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashPop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'pop'], options, colorOptions);
      });
    });
    return describe("Drop", function() {
      return it("calls git.cmd with 'stash' and 'drop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashDrop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'drop'], options, colorOptions);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1zdGFzaC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sYUFBQSxHQUFnQixPQUFBLENBQVEsa0NBQVI7O0VBQ2hCLFlBQUEsR0FBZSxPQUFBLENBQVEsaUNBQVI7O0VBQ2YsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQ0FBUjs7RUFDZCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlDQUFSOztFQUVmLE9BQUEsR0FDRTtJQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMOzs7RUFDRixZQUFBLEdBQ0U7SUFBQSxLQUFBLEVBQU8sSUFBUDs7O0VBRUYsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7SUFDN0IsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQTthQUNoQixFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQTtRQUMzQyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUE1QjtRQUNBLGFBQUEsQ0FBYyxJQUFkO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUFyQyxFQUF5RCxPQUF6RCxFQUFrRSxZQUFsRTtNQUgyQyxDQUE3QztJQURnQixDQUFsQjtJQU1BLFFBQUEsQ0FBUyxNQUFULEVBQWlCLFNBQUE7YUFDZixFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQTtRQUMxQyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUE1QjtRQUNBLFlBQUEsQ0FBYSxJQUFiO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFyQyxFQUF3RCxPQUF4RCxFQUFpRSxZQUFqRTtNQUgwQyxDQUE1QztJQURlLENBQWpCO0lBTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7YUFDNUIsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUE7QUFDN0QsWUFBQTtRQUFBLE9BQUEsR0FBVTtRQUNWLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsWUFBQSxDQUFhLElBQWIsRUFBbUI7VUFBQyxTQUFBLE9BQUQ7U0FBbkI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLE9BQWxCLENBQXJDLEVBQWlFLE9BQWpFLEVBQTBFLFlBQTFFO01BSjZELENBQS9EO0lBRDRCLENBQTlCO0lBT0EsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsU0FBQTthQUNkLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBO1FBQ3pDLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsV0FBQSxDQUFZLElBQVo7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxLQUFWLENBQXJDLEVBQXVELE9BQXZELEVBQWdFLFlBQWhFO01BSHlDLENBQTNDO0lBRGMsQ0FBaEI7V0FNQSxRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBO2FBQ2YsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7UUFDMUMsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7UUFDQSxZQUFBLENBQWEsSUFBYjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FBckMsRUFBd0QsT0FBeEQsRUFBaUUsWUFBakU7TUFIMEMsQ0FBNUM7SUFEZSxDQUFqQjtFQTFCNkIsQ0FBL0I7QUFaQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdFN0YXNoQXBwbHkgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1zdGFzaC1hcHBseSdcbkdpdFN0YXNoU2F2ZSA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUnXG5HaXRTdGFzaFBvcCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLXBvcCdcbkdpdFN0YXNoRHJvcCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLWRyb3AnXG5cbm9wdGlvbnMgPVxuICBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5jb2xvck9wdGlvbnMgPVxuICBjb2xvcjogdHJ1ZVxuXG5kZXNjcmliZSBcIkdpdCBTdGFzaCBjb21tYW5kc1wiLCAtPlxuICBkZXNjcmliZSBcIkFwcGx5XCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ3N0YXNoJyBhbmQgJ2FwcGx5J1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBHaXRTdGFzaEFwcGx5KHJlcG8pXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydzdGFzaCcsICdhcHBseSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcblxuICBkZXNjcmliZSBcIlNhdmVcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3Rhc2gnIGFuZCAnc2F2ZSdcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgR2l0U3Rhc2hTYXZlKHJlcG8pXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydzdGFzaCcsICdzYXZlJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwiU2F2ZSB3aXRoIG1lc3NhZ2VcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3Rhc2gnLCAnc2F2ZScsIGFuZCBwcm92aWRlcyBtZXNzYWdlXCIsIC0+XG4gICAgICBtZXNzYWdlID0gJ2Zvb2JhcidcbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgR2l0U3Rhc2hTYXZlKHJlcG8sIHttZXNzYWdlfSlcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3N0YXNoJywgJ3NhdmUnLCBtZXNzYWdlXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJQb3BcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3Rhc2gnIGFuZCAncG9wJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBHaXRTdGFzaFBvcChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc3Rhc2gnLCAncG9wJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwiRHJvcFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzdGFzaCcgYW5kICdkcm9wJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBHaXRTdGFzaERyb3AocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3N0YXNoJywgJ2Ryb3AnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4iXX0=
