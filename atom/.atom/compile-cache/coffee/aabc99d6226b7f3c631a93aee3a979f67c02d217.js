(function() {
  var GitDiff, GitDiffAll, currentPane, diffPane, fs, git, openPromise, pathToRepoFile, ref, repo, textEditor,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs-plus');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor;

  git = require('../../lib/git');

  GitDiff = require('../../lib/models/git-diff');

  GitDiffAll = require('../../lib/models/git-diff-all');

  currentPane = {
    splitRight: function() {}
  };

  diffPane = {
    splitRight: function() {
      return void 0;
    },
    getActiveEditor: function() {
      return textEditor;
    }
  };

  openPromise = {
    done: function(cb) {
      return cb(textEditor);
    }
  };

  describe("GitDiff", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo, {
          file: pathToRepoFile
        });
      });
    });
    return describe("when git-plus.diffs.includeStagedDiff config is true", function() {
      return it("calls git.cmd and specifies 'HEAD'", function() {
        return expect(indexOf.call(git.cmd.mostRecentCall.args[0], 'HEAD') >= 0).toBe(true);
      });
    });
  });

  describe("GitDiff when git-plus.diffs.wordDiff config is true", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.wordDiff', true);
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo, {
          file: pathToRepoFile
        });
      });
    });
    return it("calls git.cmd and uses '--word-diff' flag", function() {
      return expect(indexOf.call(git.cmd.mostRecentCall.args[0], '--word-diff') >= 0).toBe(true);
    });
  });

  describe("GitDiff when a file is not specified", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo);
      });
    });
    return it("checks for the current open file", function() {
      return expect(atom.workspace.getActiveTextEditor).toHaveBeenCalled();
    });
  });

  describe("GitDiffAll", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(fs, 'writeFile').andCallFake(function() {
        return fs.writeFile.mostRecentCall.args[3]();
      });
      spyOn(git, 'cmd').andCallFake(function() {
        var args;
        args = git.cmd.mostRecentCall.args[0];
        if (args[2] === '--stat') {
          return Promise.resolve('diff stats\n');
        } else {
          return Promise.resolve('diffs');
        }
      });
      return waitsForPromise(function() {
        return GitDiffAll(repo);
      });
    });
    return it("includes the diff stats in the diffs window", function() {
      return expect(fs.writeFile.mostRecentCall.args[1].includes('diff stats')).toBe(true);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1kaWZmLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1R0FBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxNQUFxQyxPQUFBLENBQVEsYUFBUixDQUFyQyxFQUFDLGVBQUQsRUFBTyxtQ0FBUCxFQUF1Qjs7RUFDdkIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE9BQUEsR0FBVSxPQUFBLENBQVEsMkJBQVI7O0VBQ1YsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUjs7RUFFYixXQUFBLEdBQ0U7SUFBQSxVQUFBLEVBQVksU0FBQSxHQUFBLENBQVo7OztFQUNGLFFBQUEsR0FDRTtJQUFBLFVBQUEsRUFBWSxTQUFBO2FBQUc7SUFBSCxDQUFaO0lBQ0EsZUFBQSxFQUFpQixTQUFBO2FBQUc7SUFBSCxDQURqQjs7O0VBRUYsV0FBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLFNBQUMsRUFBRDthQUFRLEVBQUEsQ0FBRyxVQUFIO0lBQVIsQ0FBTjs7O0VBRUYsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtJQUNsQixVQUFBLENBQVcsU0FBQTtNQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsRUFBb0QsSUFBcEQ7TUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IscUJBQXRCLENBQTRDLENBQUMsU0FBN0MsQ0FBdUQsVUFBdkQ7TUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsTUFBdEIsQ0FBNkIsQ0FBQyxTQUE5QixDQUF3QyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixDQUF4QztNQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFD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RUFBc0IsTUFBdEIsQ0FBNkIsQ0FBQyxTQUE5QixDQUF3QyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixDQUF4QztNQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsV0FBVixDQUFzQixDQUFDLFdBQXZCLENBQW1DLFNBQUE7ZUFBRyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFqQyxDQUFBO01BQUgsQ0FBbkM7TUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUE7UUFDbkMsSUFBRyxJQUFLLENBQUEsQ0FBQSxDQUFMLEtBQVcsUUFBZDtpQkFDRSxPQUFPLENBQUMsT0FBUixDQUFnQixjQUFoQixFQURGO1NBQUEsTUFBQTtpQkFHRSxPQUFPLENBQUMsT0FBUixDQUFnQixPQUFoQixFQUhGOztNQUY0QixDQUE5QjthQU1BLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLFVBQUEsQ0FBVyxJQUFYO01BRGMsQ0FBaEI7SUFYUyxDQUFYO1dBY0EsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7YUFDaEQsTUFBQSxDQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFwQyxDQUE2QyxZQUE3QyxDQUFQLENBQWlFLENBQUMsSUFBbEUsQ0FBdUUsSUFBdkU7SUFEZ0QsQ0FBbEQ7RUFmcUIsQ0FBdkI7QUFsRUEiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG57cmVwbywgcGF0aFRvUmVwb0ZpbGUsIHRleHRFZGl0b3J9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5naXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuR2l0RGlmZiA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYnXG5HaXREaWZmQWxsID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtZGlmZi1hbGwnXG5cbmN1cnJlbnRQYW5lID1cbiAgc3BsaXRSaWdodDogLT5cbmRpZmZQYW5lID1cbiAgc3BsaXRSaWdodDogLT4gdW5kZWZpbmVkXG4gIGdldEFjdGl2ZUVkaXRvcjogLT4gdGV4dEVkaXRvclxub3BlblByb21pc2UgPVxuICBkb25lOiAoY2IpIC0+IGNiIHRleHRFZGl0b3JcblxuZGVzY3JpYmUgXCJHaXREaWZmXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmJywgdHJ1ZVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlVGV4dEVkaXRvcicpLmFuZFJldHVybiB0ZXh0RWRpdG9yXG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0ZXh0RWRpdG9yXG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgnZGlmZnMnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgR2l0RGlmZiByZXBvLCBmaWxlOiBwYXRoVG9SZXBvRmlsZVxuXG4gIGRlc2NyaWJlIFwid2hlbiBnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZiBjb25maWcgaXMgdHJ1ZVwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCBhbmQgc3BlY2lmaWVzICdIRUFEJ1wiLCAtPlxuICAgICAgZXhwZWN0KCdIRUFEJyBpbiBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLnRvQmUgdHJ1ZVxuXG5kZXNjcmliZSBcIkdpdERpZmYgd2hlbiBnaXQtcGx1cy5kaWZmcy53b3JkRGlmZiBjb25maWcgaXMgdHJ1ZVwiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZicsIHRydWVcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmJywgdHJ1ZVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlVGV4dEVkaXRvcicpLmFuZFJldHVybiB0ZXh0RWRpdG9yXG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0ZXh0RWRpdG9yXG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgnZGlmZnMnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgR2l0RGlmZiByZXBvLCBmaWxlOiBwYXRoVG9SZXBvRmlsZVxuXG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCBhbmQgdXNlcyAnLS13b3JkLWRpZmYnIGZsYWdcIiwgLT5cbiAgICBleHBlY3QoJy0td29yZC1kaWZmJyBpbiBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLnRvQmUgdHJ1ZVxuXG5kZXNjcmliZSBcIkdpdERpZmYgd2hlbiBhIGZpbGUgaXMgbm90IHNwZWNpZmllZFwiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZicsIHRydWVcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdGV4dEVkaXRvclxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoJ2RpZmZzJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdERpZmYgcmVwb1xuXG4gIGl0IFwiY2hlY2tzIGZvciB0aGUgY3VycmVudCBvcGVuIGZpbGVcIiwgLT5cbiAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcikudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiMgZGVzY3JpYmUgXCJ3aGVuIGdpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZSBjb25maWcgaXMgdHJ1ZVwiLCAtPlxuIyAgIGJlZm9yZUVhY2ggLT5cbiMgICAgIGF0b20uY29uZmlnLnNldCAnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJywgdHJ1ZVxuIyAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdnZXRBY3RpdmVQYW5lJykuYW5kUmV0dXJuIGN1cnJlbnRQYW5lXG4jICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuIyAgICAgc3B5T24oY3VycmVudFBhbmUsICdzcGxpdFJpZ2h0JykuYW5kUmV0dXJuIGN1cnJlbnRQYW5lXG4jICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiMgICAgICAgR2l0RGlmZiByZXBvLCBmaWxlOiAnLidcbiNcbiMgICBkZXNjcmliZSBcIndoZW4gZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUgY29uZmlnIGlzIG5vdCBzZXRcIiwgLT5cbiMgICAgIGl0IFwiZGVmYXVsdHMgdG8gc3BsaXRSaWdodFwiLCAtPlxuIyAgICAgICBleHBlY3QoY3VycmVudFBhbmUuc3BsaXRSaWdodCkudG9IYXZlQmVlbkNhbGxlZCgpXG4jICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuZGVzY3JpYmUgXCJHaXREaWZmQWxsXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmJywgdHJ1ZVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlVGV4dEVkaXRvcicpLmFuZFJldHVybiB0ZXh0RWRpdG9yXG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0ZXh0RWRpdG9yXG4gICAgc3B5T24oZnMsICd3cml0ZUZpbGUnKS5hbmRDYWxsRmFrZSAtPiBmcy53cml0ZUZpbGUubW9zdFJlY2VudENhbGwuYXJnc1szXSgpXG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgIGFyZ3MgPSBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgIGlmIGFyZ3NbMl0gaXMgJy0tc3RhdCdcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdkaWZmIHN0YXRzXFxuJ1xuICAgICAgZWxzZVxuICAgICAgICBQcm9taXNlLnJlc29sdmUgJ2RpZmZzJ1xuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgR2l0RGlmZkFsbCByZXBvXG5cbiAgaXQgXCJpbmNsdWRlcyB0aGUgZGlmZiBzdGF0cyBpbiB0aGUgZGlmZnMgd2luZG93XCIsIC0+XG4gICAgZXhwZWN0KGZzLndyaXRlRmlsZS5tb3N0UmVjZW50Q2FsbC5hcmdzWzFdLmluY2x1ZGVzICdkaWZmIHN0YXRzJykudG9CZSB0cnVlXG4iXX0=
