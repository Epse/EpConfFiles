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
      atom.config.set('git-plus.remoteInteractions.alwaysPullFromUpstream', false);
      GitPull(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['remote'], options);
    });
    describe("when 'alwaysPullFromCurrentBranch' is enabled", function() {
      return it("pulls immediately from the upstream branch", function() {
        atom.config.set('git-plus.remoteInteractions.alwaysPullFromUpstream', true);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1wdWxsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSOztFQUNWLEtBQUEsR0FBUSxPQUFBLENBQVEsd0JBQVI7O0VBRVIsT0FBQSxHQUNFO0lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7OztFQUVGLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7SUFDbkIsVUFBQSxDQUFXLFNBQUE7YUFBRyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUE1QjtJQUFILENBQVg7SUFFQSxFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQTtNQUM3RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0RBQWhCLEVBQXNFLEtBQXRFO01BQ0EsT0FBQSxDQUFRLElBQVI7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsQ0FBckMsRUFBaUQsT0FBakQ7SUFINkQsQ0FBL0Q7SUFLQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQTthQUN4RCxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQTtRQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0RBQWhCLEVBQXNFLElBQXRFO1FBQ0EsT0FBQSxDQUFRLElBQVI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLEdBQUcsQ0FBQyxvQkFBcEIsQ0FBeUMsQ0FBQyxRQUFELENBQXpDLEVBQXFELE9BQXJEO01BSCtDLENBQWpEO0lBRHdELENBQTFEO1dBTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7TUFDNUIsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtRQUNsQixLQUFBLENBQU0sSUFBTjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsS0FBbkIsQ0FBckMsRUFBZ0UsT0FBaEUsRUFBeUU7VUFBQyxLQUFBLEVBQU8sSUFBUjtTQUF6RTtNQUZrQixDQUFwQjthQUlBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO1FBQ2pELEtBQUEsQ0FBTSxJQUFOLEVBQVk7VUFBQSxTQUFBLEVBQVcsQ0FBQyxVQUFELENBQVg7U0FBWjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsUUFBckIsRUFBK0IsS0FBL0IsQ0FBckMsRUFBNEUsT0FBNUUsRUFBcUY7VUFBQyxLQUFBLEVBQU8sSUFBUjtTQUFyRjtNQUZpRCxDQUFuRDtJQUw0QixDQUE5QjtFQWRtQixDQUFyQjtBQVJBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1bGwnXG5fcHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvX3B1bGwnXG5cbm9wdGlvbnMgPVxuICBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbmRlc2NyaWJlIFwiR2l0IFB1bGxcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPiBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcblxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3JlbW90ZSddIHRvIGdldCByZW1vdGUgcmVwb3NpdG9yaWVzXCIsIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbScsIGZhbHNlKVxuICAgIEdpdFB1bGwocmVwbylcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydyZW1vdGUnXSwgb3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiAnYWx3YXlzUHVsbEZyb21DdXJyZW50QnJhbmNoJyBpcyBlbmFibGVkXCIsIC0+XG4gICAgaXQgXCJwdWxscyBpbW1lZGlhdGVseSBmcm9tIHRoZSB1cHN0cmVhbSBicmFuY2hcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nLCB0cnVlKVxuICAgICAgR2l0UHVsbChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3JlbW90ZSddLCBvcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJUaGUgcHVsbCBmdW5jdGlvblwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZFwiLCAtPlxuICAgICAgX3B1bGwgcmVwb1xuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdvcmlnaW4nLCAnZm9vJ10sIG9wdGlvbnMsIHtjb2xvcjogdHJ1ZX1cblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIGV4dHJhIGFyZ3VtZW50cyBpZiBwYXNzZWRcIiwgLT5cbiAgICAgIF9wdWxsIHJlcG8sIGV4dHJhQXJnczogWyctLXJlYmFzZSddXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJy0tcmViYXNlJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuIl19
