(function() {
  var CherryPickSelectCommits, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  CherryPickSelectCommits = require('../../lib/views/cherry-pick-select-commits-view');

  describe("CherryPickSelectCommits view", function() {
    beforeEach(function() {
      return this.view = new CherryPickSelectCommits(repo, ['commit1', 'commit2']);
    });
    it("displays a list of commits", function() {
      return expect(this.view.items.length).toBe(2);
    });
    return it("calls git.cmd with 'cherry-pick' and the selected commits", function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve('success'));
      this.view.confirmSelection();
      this.view.selectNextItemView();
      this.view.confirmSelection();
      this.view.find('.btn-pick-button').click();
      return expect(git.cmd).toHaveBeenCalledWith(['cherry-pick', 'commit1', 'commit2'], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3MvY2hlcnJ5LXBpY2stc2VsZWN0LWNvbW1pdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCx1QkFBQSxHQUEwQixPQUFBLENBQVEsaURBQVI7O0VBRTFCLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFBO0lBQ3ZDLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHVCQUFBLENBQXdCLElBQXhCLEVBQThCLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FBOUI7SUFESCxDQUFYO0lBR0EsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7YUFDL0IsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEM7SUFEK0IsQ0FBakM7V0FHQSxFQUFBLENBQUcsMkRBQUgsRUFBZ0UsU0FBQTtNQUM5RCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixTQUFoQixDQUE1QjtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQU4sQ0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLGtCQUFYLENBQThCLENBQUMsS0FBL0IsQ0FBQTthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsYUFBRCxFQUFnQixTQUFoQixFQUEyQixTQUEzQixDQUFyQyxFQUE0RTtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQTVFO0lBTjhELENBQWhFO0VBUHVDLENBQXpDO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5DaGVycnlQaWNrU2VsZWN0Q29tbWl0cyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9jaGVycnktcGljay1zZWxlY3QtY29tbWl0cy12aWV3J1xuXG5kZXNjcmliZSBcIkNoZXJyeVBpY2tTZWxlY3RDb21taXRzIHZpZXdcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEB2aWV3ID0gbmV3IENoZXJyeVBpY2tTZWxlY3RDb21taXRzKHJlcG8sIFsnY29tbWl0MScsICdjb21taXQyJ10pXG5cbiAgaXQgXCJkaXNwbGF5cyBhIGxpc3Qgb2YgY29tbWl0c1wiLCAtPlxuICAgIGV4cGVjdChAdmlldy5pdGVtcy5sZW5ndGgpLnRvQmUgMlxuXG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdjaGVycnktcGljaycgYW5kIHRoZSBzZWxlY3RlZCBjb21taXRzXCIsIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnc3VjY2VzcydcbiAgICBAdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICBAdmlldy5zZWxlY3ROZXh0SXRlbVZpZXcoKVxuICAgIEB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgIEB2aWV3LmZpbmQoJy5idG4tcGljay1idXR0b24nKS5jbGljaygpXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnY2hlcnJ5LXBpY2snLCAnY29tbWl0MScsICdjb21taXQyJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiJdfQ==
