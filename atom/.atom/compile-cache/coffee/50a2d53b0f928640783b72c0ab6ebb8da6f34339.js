(function() {
  var TravisCiStatus;

  TravisCiStatus = require('../lib/travis-ci-status');

  describe("TravisCiStatus", function() {
    var workspaceElement;
    workspaceElement = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
      spyOn(TravisCiStatus, "isTravisProject").andCallFake(function(cb) {
        return cb(true);
      });
      workspaceElement = atom.views.getView(atom.workspace);
      return jasmine.attachToDOM(workspaceElement);
    });
    describe("when the travis-ci-status:toggle event is triggered", function() {
      beforeEach(function() {
        return spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:test/test.git";
            }
          }
        ]);
      });
      return it("attaches and then detaches the view", function() {
        expect(workspaceElement.querySelector(".travis-ci-status")).not.toExist();
        waitsForPromise(function() {
          return atom.packages.activatePackage("travis-ci-status");
        });
        return runs(function() {
          return expect(workspaceElement.querySelector(".travis-ci-status")).toExist();
        });
      });
    });
    return describe("can get the nwo if the project is a github repo", function() {
      it("gets nwo of https repo ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "https://github.com/tombell/travis-ci-status.git";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/travis-ci-status");
      });
      it("gets nwo of https repo not ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "https://github.com/tombell/test-status";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/test-status");
      });
      it("gets nwo of ssh repo ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:tombell/travis-ci-status.git";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/travis-ci-status");
      });
      return it("gets nwo of ssh repo not ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:tombell/test-status";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/test-status");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy90cmF2aXMtY2ktc3RhdHVzL3NwZWMvdHJhdmlzLWNpLXN0YXR1cy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEseUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxnQkFBQTtBQUFBLElBQUEsZ0JBQUEsR0FBbUIsSUFBbkIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLE1BR0EsS0FBQSxDQUFNLGNBQU4sRUFBc0IsaUJBQXRCLENBQXdDLENBQUMsV0FBekMsQ0FBcUQsU0FBQyxFQUFELEdBQUE7ZUFBUSxFQUFBLENBQUcsSUFBSCxFQUFSO01BQUEsQ0FBckQsQ0FIQSxDQUFBO0FBQUEsTUFLQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBTG5CLENBQUE7YUFNQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsRUFQUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMscURBQVQsRUFBZ0UsU0FBQSxHQUFBO0FBQzlELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEtBQUEsQ0FBTSxJQUFJLENBQUMsT0FBWCxFQUFvQixpQkFBcEIsQ0FBc0MsQ0FBQyxTQUF2QyxDQUFpRDtVQUFDO0FBQUEsWUFDaEQsY0FBQSxFQUFn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

//# sourceURL=/home/epse/.atom/packages/travis-ci-status/spec/travis-ci-status-spec.coffee
