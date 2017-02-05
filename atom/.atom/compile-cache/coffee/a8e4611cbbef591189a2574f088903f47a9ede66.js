(function() {
  var git, quibble, repo;

  quibble = require('quibble');

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  describe("GitStageFilesBeta", function() {
    return it("calls git.unstagedFiles and git.stagedFiles", function() {
      var GitStageFiles, SelectView, stagedFile, unstagedFile;
      SelectView = quibble('../../lib/views/select-stage-files-view-beta', jasmine.createSpy('SelectView'));
      GitStageFiles = require('../../lib/models/git-stage-files-beta');
      unstagedFile = {
        path: 'unstaged.file',
        status: 'M',
        staged: false
      };
      stagedFile = {
        path: 'staged.file',
        status: 'M',
        staged: true
      };
      spyOn(git, 'unstagedFiles').andReturn(Promise.resolve([unstagedFile]));
      spyOn(git, 'stagedFiles').andReturn(Promise.resolve([stagedFile]));
      waitsForPromise(function() {
        return GitStageFiles(repo);
      });
      return runs(function() {
        expect(git.unstagedFiles).toHaveBeenCalled();
        expect(git.stagedFiles).toHaveBeenCalled();
        return expect(SelectView).toHaveBeenCalledWith(repo, [unstagedFile, stagedFile]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1zdGFnZS1maWxlcy1iZXRhLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNMLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBRVQsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7V0FDNUIsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7QUFDaEQsVUFBQTtNQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsOENBQVIsRUFBd0QsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsWUFBbEIsQ0FBeEQ7TUFDYixhQUFBLEdBQWdCLE9BQUEsQ0FBUSx1Q0FBUjtNQUVoQixZQUFBLEdBQWU7UUFBQSxJQUFBLEVBQU0sZUFBTjtRQUF1QixNQUFBLEVBQVEsR0FBL0I7UUFBb0MsTUFBQSxFQUFRLEtBQTVDOztNQUNmLFVBQUEsR0FBYTtRQUFBLElBQUEsRUFBTSxhQUFOO1FBQXFCLE1BQUEsRUFBUSxHQUE3QjtRQUFrQyxNQUFBLEVBQVEsSUFBMUM7O01BRWIsS0FBQSxDQUFNLEdBQU4sRUFBVyxlQUFYLENBQTJCLENBQUMsU0FBNUIsQ0FBc0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQyxZQUFELENBQWhCLENBQXRDO01BQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxhQUFYLENBQXlCLENBQUMsU0FBMUIsQ0FBb0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQyxVQUFELENBQWhCLENBQXBDO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsYUFBQSxDQUFjLElBQWQ7TUFBSCxDQUFoQjthQUNBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsTUFBQSxDQUFPLEdBQUcsQ0FBQyxhQUFYLENBQXlCLENBQUMsZ0JBQTFCLENBQUE7UUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLFdBQVgsQ0FBdUIsQ0FBQyxnQkFBeEIsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxVQUFQLENBQWtCLENBQUMsb0JBQW5CLENBQXdDLElBQXhDLEVBQThDLENBQUMsWUFBRCxFQUFlLFVBQWYsQ0FBOUM7TUFIRyxDQUFMO0lBVmdELENBQWxEO0VBRDRCLENBQTlCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJxdWliYmxlID0gcmVxdWlyZSAncXVpYmJsZSdcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcblxuZGVzY3JpYmUgXCJHaXRTdGFnZUZpbGVzQmV0YVwiLCAtPlxuICBpdCBcImNhbGxzIGdpdC51bnN0YWdlZEZpbGVzIGFuZCBnaXQuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICBTZWxlY3RWaWV3ID0gcXVpYmJsZSAnLi4vLi4vbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1maWxlcy12aWV3LWJldGEnLCBqYXNtaW5lLmNyZWF0ZVNweSgnU2VsZWN0VmlldycpXG4gICAgR2l0U3RhZ2VGaWxlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzLWJldGEnXG5cbiAgICB1bnN0YWdlZEZpbGUgPSBwYXRoOiAndW5zdGFnZWQuZmlsZScsIHN0YXR1czogJ00nLCBzdGFnZWQ6IGZhbHNlXG4gICAgc3RhZ2VkRmlsZSA9IHBhdGg6ICdzdGFnZWQuZmlsZScsIHN0YXR1czogJ00nLCBzdGFnZWQ6IHRydWVcblxuICAgIHNweU9uKGdpdCwgJ3Vuc3RhZ2VkRmlsZXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFt1bnN0YWdlZEZpbGVdKVxuICAgIHNweU9uKGdpdCwgJ3N0YWdlZEZpbGVzJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZShbc3RhZ2VkRmlsZV0pXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdFN0YWdlRmlsZXMgcmVwb1xuICAgIHJ1bnMgLT5cbiAgICAgIGV4cGVjdChnaXQudW5zdGFnZWRGaWxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoZ2l0LnN0YWdlZEZpbGVzKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChTZWxlY3RWaWV3KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBbdW5zdGFnZWRGaWxlLCBzdGFnZWRGaWxlXVxuIl19
