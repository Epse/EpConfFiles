(function() {
  var GitDiffTool, fs, git, pathToRepoFile, pathToSampleDir, ref, repo;

  fs = require('fs-plus');

  ref = require('../fixtures'), repo = ref.repo, pathToSampleDir = ref.pathToSampleDir, pathToRepoFile = ref.pathToRepoFile;

  git = require('../../lib/git');

  GitDiffTool = require('../../lib/models/git-difftool');

  describe("GitDiffTool", function() {
    describe("Using includeStagedDiff", function() {
      beforeEach(function() {
        atom.config.set('git-plus.includeStagedDiff', true);
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn('some-tool');
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
          return expect(git.getConfig).toHaveBeenCalledWith(repo, 'diff.tool');
        });
      });
    });
    return describe("Usage on dirs", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn('some-tool');
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
          return expect(git.getConfig).toHaveBeenCalledWith(repo, 'diff.tool');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1kaWZmdG9vbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQTBDLE9BQUEsQ0FBUSxhQUFSLENBQTFDLEVBQUMsZUFBRCxFQUFPLHFDQUFQLEVBQXdCOztFQUN4QixHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sV0FBQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUjs7RUFFZCxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0lBQ3RCLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBO01BQ2xDLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxJQUE5QztRQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQTVCO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsV0FBbEM7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQ2QsV0FBQSxDQUFZLElBQVosRUFBa0I7WUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFsQjtRQURjLENBQWhCO01BSlMsQ0FBWDthQU9BLFFBQUEsQ0FBUyxnREFBVCxFQUEyRCxTQUFBO1FBQ3pELEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO2lCQUM1QyxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFlBQUQsRUFBZSxNQUFmLEVBQXVCLElBQXZCLENBQXJDLEVBQW1FO1lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBbkU7UUFENEMsQ0FBOUM7ZUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQTtpQkFDMUQsTUFBQSxDQUFPLEdBQUcsQ0FBQyxTQUFYLENBQXFCLENBQUMsb0JBQXRCLENBQTJDLElBQTNDLEVBQWlELFdBQWpEO1FBRDBELENBQTVEO01BSnlELENBQTNEO0lBUmtDLENBQXBDO1dBZUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtNQUN4QixVQUFBLENBQVcsU0FBQTtRQUNULEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQTVCO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxXQUFYLENBQXVCLENBQUMsU0FBeEIsQ0FBa0MsV0FBbEM7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQ2QsV0FBQSxDQUFZLElBQVosRUFBa0I7WUFBQSxJQUFBLEVBQU0sZUFBTjtXQUFsQjtRQURjLENBQWhCO01BSFMsQ0FBWDthQU1BLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBO1FBQzFDLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO2lCQUNqRCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQztZQUFDLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsYUFBbkIsRUFBa0MsZUFBbEMsQ0FBRCxFQUFxRDtjQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO2FBQXJEO1dBQXRDO1FBRGlELENBQW5EO2VBR0EsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7aUJBQzFELE1BQUEsQ0FBTyxHQUFHLENBQUMsU0FBWCxDQUFxQixDQUFDLG9CQUF0QixDQUEyQyxJQUEzQyxFQUFpRCxXQUFqRDtRQUQwRCxDQUE1RDtNQUowQyxDQUE1QztJQVB3QixDQUExQjtFQWhCc0IsQ0FBeEI7QUFMQSIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbntyZXBvLCBwYXRoVG9TYW1wbGVEaXIsIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdERpZmZUb29sID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtZGlmZnRvb2wnXG5cbmRlc2NyaWJlIFwiR2l0RGlmZlRvb2xcIiwgLT5cbiAgZGVzY3JpYmUgXCJVc2luZyBpbmNsdWRlU3RhZ2VkRGlmZlwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAnZ2l0LXBsdXMuaW5jbHVkZVN0YWdlZERpZmYnLCB0cnVlXG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCdkaWZmcycpXG4gICAgICBzcHlPbihnaXQsICdnZXRDb25maWcnKS5hbmRSZXR1cm4gJ3NvbWUtdG9vbCdcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBHaXREaWZmVG9vbCByZXBvLCBmaWxlOiBwYXRoVG9SZXBvRmlsZVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGdpdC1wbHVzLmluY2x1ZGVTdGFnZWREaWZmIGNvbmZpZyBpcyB0cnVlXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnZGlmZi1pbmRleCBIRUFEIC16J1wiLCAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydkaWZmLWluZGV4JywgJ0hFQUQnLCAnLXonXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gICAgICBpdCBcImNhbGxzIGBnaXQuZ2V0Q29uZmlnYCB0byBjaGVjayBpZiBhIGEgZGlmZnRvb2wgaXMgc2V0XCIsIC0+XG4gICAgICAgIGV4cGVjdChnaXQuZ2V0Q29uZmlnKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCAnZGlmZi50b29sJ1xuXG4gIGRlc2NyaWJlIFwiVXNhZ2Ugb24gZGlyc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoJ2RpZmZzJylcbiAgICAgIHNweU9uKGdpdCwgJ2dldENvbmZpZycpLmFuZFJldHVybiAnc29tZS10b29sJ1xuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIEdpdERpZmZUb29sIHJlcG8sIGZpbGU6IHBhdGhUb1NhbXBsZURpclxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZpbGUgcG9pbnRzIHRvIGEgZGlyZWN0b3J5XCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnZGlmZnRvb2wgLS1uby1wcm9tcHQgLWQnXCIsIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kLmNhbGxzWzFdLmFyZ3MpLnRvRXF1YWwoW1snZGlmZnRvb2wnLCAnLWQnLCAnLS1uby1wcm9tcHQnLCBwYXRoVG9TYW1wbGVEaXJdLCB7Y3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKX1dKTtcblxuICAgICAgaXQgXCJjYWxscyBgZ2l0LmdldENvbmZpZ2AgdG8gY2hlY2sgaWYgYSBhIGRpZmZ0b29sIGlzIHNldFwiLCAtPlxuICAgICAgICBleHBlY3QoZ2l0LmdldENvbmZpZykudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgJ2RpZmYudG9vbCdcbiJdfQ==
