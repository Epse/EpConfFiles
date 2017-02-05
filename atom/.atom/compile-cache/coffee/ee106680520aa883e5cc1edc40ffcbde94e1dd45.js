(function() {
  var GitPull, _pull, git, options, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitPull = require('../../lib/models/git-pull');

  _pull = require('../../lib/models/_pull');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  describe("Git Pull", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve(true));
    });
    it("calls git.cmd with ['remote'] to get remote repositories", function() {
      atom.config.set('git-plus.experimental', false);
      atom.config.set('git-plus.alwaysPullFromUpstream', false);
      GitPull(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['remote'], options);
    });
    describe("when 'alwaysPullFromCurrentBranch' is enabled", function() {
      return it("pulls immediately from the upstream branch", function() {
        atom.config.set('git-plus.experimental', true);
        atom.config.set('git-plus.alwaysPullFromUpstream', true);
        GitPull(repo);
        return expect(git.cmd).not.toHaveBeenCalledWith(['remote'], options);
      });
    });
    return describe("The pull function", function() {
      it("calls git.cmd", function() {
        _pull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, {
          color: true
        });
      });
      return it("calls git.cmd with extra arguments if passed", function() {
        _pull(repo, {
          extraArgs: ['--rebase']
        });
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'origin', 'foo'], options, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1wdWxsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSOztFQUNWLEtBQUEsR0FBUSxPQUFBLENBQVEsd0JBQVI7O0VBRVIsT0FBQSxHQUNFO0lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7OztFQUVGLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7SUFDbkIsVUFBQSxDQUFXLFNBQUE7YUFBRyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUE1QjtJQUFILENBQVg7SUFFQSxFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQTtNQUM3RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLEtBQXpDO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixFQUFtRCxLQUFuRDtNQUNBLE9BQUEsQ0FBUSxJQUFSO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELENBQXJDLEVBQWlELE9BQWpEO0lBSjZELENBQS9EO0lBTUEsUUFBQSxDQUFTLCtDQUFULEVBQTBELFNBQUE7YUFDeEQsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7UUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxJQUF6QztRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsRUFBbUQsSUFBbkQ7UUFDQSxPQUFBLENBQVEsSUFBUjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsR0FBRyxDQUFDLG9CQUFwQixDQUF5QyxDQUFDLFFBQUQsQ0FBekMsRUFBcUQsT0FBckQ7TUFKK0MsQ0FBakQ7SUFEd0QsQ0FBMUQ7V0FPQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtNQUM1QixFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO1FBQ2xCLEtBQUEsQ0FBTSxJQUFOO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixLQUFuQixDQUFyQyxFQUFnRSxPQUFoRSxFQUF5RTtVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXpFO01BRmtCLENBQXBCO2FBSUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7UUFDakQsS0FBQSxDQUFNLElBQU4sRUFBWTtVQUFBLFNBQUEsRUFBVyxDQUFDLFVBQUQsQ0FBWDtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixRQUFyQixFQUErQixLQUEvQixDQUFyQyxFQUE0RSxPQUE1RSxFQUFxRjtVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXJGO01BRmlELENBQW5EO0lBTDRCLENBQTlCO0VBaEJtQixDQUFyQjtBQVJBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1bGwnXG5fcHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvX3B1bGwnXG5cbm9wdGlvbnMgPVxuICBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbmRlc2NyaWJlIFwiR2l0IFB1bGxcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPiBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcblxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3JlbW90ZSddIHRvIGdldCByZW1vdGUgcmVwb3NpdG9yaWVzXCIsIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwnLCBmYWxzZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nLCBmYWxzZSlcbiAgICBHaXRQdWxsKHJlcG8pXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVtb3RlJ10sIG9wdGlvbnNcblxuICBkZXNjcmliZSBcIndoZW4gJ2Fsd2F5c1B1bGxGcm9tQ3VycmVudEJyYW5jaCcgaXMgZW5hYmxlZFwiLCAtPlxuICAgIGl0IFwicHVsbHMgaW1tZWRpYXRlbHkgZnJvbSB0aGUgdXBzdHJlYW0gYnJhbmNoXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbCcsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nLCB0cnVlKVxuICAgICAgR2l0UHVsbChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3JlbW90ZSddLCBvcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJUaGUgcHVsbCBmdW5jdGlvblwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZFwiLCAtPlxuICAgICAgX3B1bGwgcmVwb1xuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdvcmlnaW4nLCAnZm9vJ10sIG9wdGlvbnMsIHtjb2xvcjogdHJ1ZX1cblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIGV4dHJhIGFyZ3VtZW50cyBpZiBwYXNzZWRcIiwgLT5cbiAgICAgIF9wdWxsIHJlcG8sIGV4dHJhQXJnczogWyctLXJlYmFzZSddXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJy0tcmViYXNlJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuIl19
