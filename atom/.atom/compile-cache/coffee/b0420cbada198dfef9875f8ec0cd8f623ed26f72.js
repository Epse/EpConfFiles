(function() {
  var GitDiffTool, Path, fs, git, pathToRepoFile, pathToSampleDir, repo, _ref;

  fs = require('fs-plus');

  Path = require('flavored-path');

  _ref = require('../fixtures'), repo = _ref.repo, pathToSampleDir = _ref.pathToSampleDir, pathToRepoFile = _ref.pathToRepoFile;

  git = require('../../lib/git');

  GitDiffTool = require('../../lib/models/git-difftool');

  describe("GitDiffTool", function() {
    describe("Using includeStagedDiff", function() {
      beforeEach(function() {
        atom.config.set('git-plus.includeStagedDiff', true);
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn(Promise.resolve('some-tool'));
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToRepoFile
          });
        });
      });
      return describe("when git-plus.includeStagedDiff config is true", function() {
        it("calls git.cmd with 'diff-index HEAD -z'", function() {
          return expect(git.cmd).toHaveBeenCalledWith(['diff-index', 'HEAD', '-z'], {
            cwd: repo.getWorkingDirectory()
          });
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith('diff.tool', repo.getWorkingDirectory());
        });
      });
    });
    return describe("Usage on dirs", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn(Promise.resolve('some-tool'));
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToSampleDir
          });
        });
      });
      return describe("when file points to a directory", function() {
        it("calls git.cmd with 'difftool --no-prompt -d'", function() {
          return expect(git.cmd.calls[1].args).toEqual([
            ['difftool', '-d', '--no-prompt', pathToSampleDir], {
              cwd: repo.getWorkingDirectory()
            }
          ]);
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith('diff.tool', repo.getWorkingDirectory());
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1kaWZmdG9vbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1RUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsT0FBMEMsT0FBQSxDQUFRLGFBQVIsQ0FBMUMsRUFBQyxZQUFBLElBQUQsRUFBTyx1QkFBQSxlQUFQLEVBQXdCLHNCQUFBLGNBRnhCLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQUpkLENBQUE7O0FBQUEsRUFNQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsSUFBQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxJQUE5QyxDQUFBLENBQUE7QUFBQSxRQUVBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQTVCLENBRkEsQ0FBQTtBQUFBLFFBR0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEIsQ0FBbEMsQ0FIQSxDQUFBO2VBSUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsV0FBQSxDQUFZLElBQVosRUFBa0I7QUFBQSxZQUFBLElBQUEsRUFBTSxjQUFOO1dBQWxCLEVBRGM7UUFBQSxDQUFoQixFQUxTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFRQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFFBQUEsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtpQkFDNUMsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxZQUFELEVBQWUsTUFBZixFQUF1QixJQUF2QixDQUFyQyxFQUFtRTtBQUFBLFlBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBbkUsRUFENEM7UUFBQSxDQUE5QyxDQUFBLENBQUE7ZUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQSxHQUFBO2lCQUMxRCxNQUFBLENBQU8sR0FBRyxDQUFDLFNBQVgsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkMsV0FBM0MsRUFBd0QsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBeEQsRUFEMEQ7UUFBQSxDQUE1RCxFQUp5RDtNQUFBLENBQTNELEVBVGtDO0lBQUEsQ0FBcEMsQ0FBQSxDQUFBO1dBZ0JBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQTVCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEIsQ0FBbEMsQ0FEQSxDQUFBO2VBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsV0FBQSxDQUFZLElBQVosRUFBa0I7QUFBQSxZQUFBLElBQUEsRUFBTSxlQUFOO1dBQWxCLEVBRGM7UUFBQSxDQUFoQixFQUhTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFNQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLFFBQUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtpQkFDakQsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXhCLENBQTZCLENBQUMsT0FBOUIsQ0FBc0M7WUFBQyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLGFBQW5CLEVBQWtDLGVBQWxDLENBQUQsRUFBcUQ7QUFBQSxjQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO2FBQXJEO1dBQXRDLEVBRGlEO1FBQUEsQ0FBbkQsQ0FBQSxDQUFBO2VBR0EsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUEsR0FBQTtpQkFDMUQsTUFBQSxDQUFPLEdBQUcsQ0FBQyxTQUFYLENBQXFCLENBQUMsb0JBQXRCLENBQTJDLFdBQTNDLEVBQXdELElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQXhELEVBRDBEO1FBQUEsQ0FBNUQsRUFKMEM7TUFBQSxDQUE1QyxFQVB3QjtJQUFBLENBQTFCLEVBakJzQjtFQUFBLENBQXhCLENBTkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/git-plus/spec/models/git-difftool-spec.coffee
