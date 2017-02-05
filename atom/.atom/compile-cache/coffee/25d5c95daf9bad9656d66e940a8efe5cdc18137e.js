(function() {
  var Os, Path, commitPane, currentPane, fs, git, mockRepoWithSubmodule, mockSubmodule, notifier, pathToRepoFile, pathToSubmoduleFile, ref, repo, textEditor;

  Path = require('path');

  Os = require('os');

  fs = require('fs-plus');

  git = require('../lib/git');

  notifier = require('../lib/notifier');

  ref = require('./fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor, commitPane = ref.commitPane, currentPane = ref.currentPane;

  pathToSubmoduleFile = Path.join(Os.homedir(), "some/submodule/file");

  mockSubmodule = {
    getWorkingDirectory: function() {
      return Path.join(Os.homedir(), "some/submodule");
    },
    relativize: function(path) {
      if (path === pathToSubmoduleFile) {
        return "file";
      }
    }
  };

  mockRepoWithSubmodule = Object.create(repo);

  mockRepoWithSubmodule.repo = {
    submoduleForPath: function(path) {
      if (path === pathToSubmoduleFile) {
        return mockSubmodule;
      }
    }
  };

  describe("Git-Plus git module", function() {
    describe("git.getConfig", function() {
      describe("when a repo file path isn't specified", function() {
        return it("calls ::getConfigValue on the given instance of GitRepository", function() {
          spyOn(repo, 'getConfigValue').andReturn('value');
          expect(git.getConfig(repo, 'user.name')).toBe('value');
          return expect(repo.getConfigValue).toHaveBeenCalledWith('user.name', repo.getWorkingDirectory());
        });
      });
      return describe("when there is no value for a config key", function() {
        return it("returns null", function() {
          spyOn(repo, 'getConfigValue').andReturn(null);
          return expect(git.getConfig(repo, 'user.name')).toBe(null);
        });
      });
    });
    describe("git.getRepo", function() {
      return it("returns a promise resolving to repository", function() {
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return waitsForPromise(function() {
          return git.getRepo().then(function(actual) {
            return expect(actual.getWorkingDirectory()).toEqual(repo.getWorkingDirectory());
          });
        });
      });
    });
    describe("git.dir", function() {
      return it("returns a promise resolving to absolute path of repo", function() {
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return git.dir().then(function(dir) {
          return expect(dir).toEqual(repo.getWorkingDirectory());
        });
      });
    });
    describe("git.getSubmodule", function() {
      it("returns undefined when there is no submodule", function() {
        return expect(git.getSubmodule(pathToRepoFile)).toBe(void 0);
      });
      return it("returns a submodule when given file is in a submodule of a project repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepoWithSubmodule];
        });
        return expect(git.getSubmodule(pathToSubmoduleFile).getWorkingDirectory()).toEqual(mockSubmodule.getWorkingDirectory());
      });
    });
    describe("git.relativize", function() {
      return it("returns relativized filepath for files in repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [repo, mockRepoWithSubmodule];
        });
        expect(git.relativize(pathToRepoFile)).toBe('directory/file');
        return expect(git.relativize(pathToSubmoduleFile)).toBe("file");
      });
    });
    describe("git.cmd", function() {
      it("returns a promise", function() {
        return waitsForPromise(function() {
          var promise;
          promise = git.cmd();
          expect(promise["catch"]).toBeDefined();
          expect(promise.then).toBeDefined();
          return promise["catch"](function(output) {
            return expect(output).toContain('usage');
          });
        });
      });
      it("returns a promise that is fulfilled with stdout on success", function() {
        return waitsForPromise(function() {
          return git.cmd(['--version']).then(function(output) {
            return expect(output).toContain('git version');
          });
        });
      });
      it("returns a promise that is rejected with stderr on failure", function() {
        return waitsForPromise(function() {
          return git.cmd(['help', '--bogus-option'])["catch"](function(output) {
            return expect(output).toContain('unknown option');
          });
        });
      });
      return it("returns a promise that is fulfilled with stderr on success", function() {
        var cloneDir, initDir;
        initDir = 'git-plus-test-dir' + Math.random();
        cloneDir = initDir + '-clone';
        return waitsForPromise(function() {
          return git.cmd(['init', initDir]).then(function() {
            return git.cmd(['clone', '--progress', initDir, cloneDir]);
          }).then(function(output) {
            fs.removeSync(initDir);
            fs.removeSync(cloneDir);
            return expect(output).toContain('Cloning');
          });
        });
      });
    });
    describe("git.add", function() {
      it("calls git.cmd with ['add', '--all', {fileName}]", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            file: pathToSubmoduleFile
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', pathToSubmoduleFile], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--all', '.'] when no file is specified", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--update'...] when update option is true", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            update: true
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--update', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when it fails", function() {
        return it("notifies of failure", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('git.add error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.add(repo).then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('git.add error');
            });
          });
        });
      });
    });
    describe("git.reset", function() {
      return it("resets and unstages all files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.reset(repo).then(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
    });
    describe("git.stagedFiles", function() {
      return it("returns an empty array when there are no staged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.stagedFiles(repo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.unstagedFiles", function() {
      return it("returns an empty array when there are no unstaged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.unstagedFiles(repo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.status", function() {
      return it("calls git.cmd with 'status' as the first argument", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          var args;
          args = git.cmd.mostRecentCall.args;
          if (args[0][0] === 'status') {
            return Promise.resolve(true);
          }
        });
        return git.status(repo).then(function() {
          return expect(true).toBeTruthy();
        });
      });
    });
    describe("git.refresh", function() {
      describe("when no arguments are passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(atom.project, 'getRepositories').andCallFake(function() {
            return [repo];
          });
          spyOn(repo, 'refreshStatus');
          git.refresh();
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
      return describe("when a GitRepository object is passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(repo, 'refreshStatus');
          git.refresh(repo);
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
    });
    return describe("git.diff", function() {
      return it("calls git.cmd with ['diff', '-p', '-U1'] and the file path", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve("string");
        });
        git.diff(repo, pathToRepoFile);
        return expect(git.cmd).toHaveBeenCalledWith(['diff', '-p', '-U1', pathToRepoFile], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvZ2l0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFlBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFDWCxNQU1JLE9BQUEsQ0FBUSxZQUFSLENBTkosRUFDRSxlQURGLEVBRUUsbUNBRkYsRUFHRSwyQkFIRixFQUlFLDJCQUpGLEVBS0U7O0VBRUYsbUJBQUEsR0FBc0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsT0FBSCxDQUFBLENBQVYsRUFBd0IscUJBQXhCOztFQUV0QixhQUFBLEdBQ0U7SUFBQSxtQkFBQSxFQUFxQixTQUFBO2FBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsT0FBSCxDQUFBLENBQVYsRUFBd0IsZ0JBQXhCO0lBQUgsQ0FBckI7SUFDQSxVQUFBLEVBQVksU0FBQyxJQUFEO01BQVUsSUFBVSxJQUFBLEtBQVEsbUJBQWxCO2VBQUEsT0FBQTs7SUFBVixDQURaOzs7RUFHRixxQkFBQSxHQUF3QixNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQ7O0VBQ3hCLHFCQUFxQixDQUFDLElBQXRCLEdBQTZCO0lBQzNCLGdCQUFBLEVBQWtCLFNBQUMsSUFBRDtNQUNoQixJQUFpQixJQUFBLEtBQVEsbUJBQXpCO2VBQUEsY0FBQTs7SUFEZ0IsQ0FEUzs7O0VBSzdCLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO0lBQzlCLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7TUFDeEIsUUFBQSxDQUFTLHVD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UUFIc0QsQ0FBeEQ7TUFEZ0QsQ0FBbEQ7SUFSc0IsQ0FBeEI7V0FjQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO2FBQ25CLEVBQUEsQ0FBRyw0REFBSCxFQUFpRSxTQUFBO1FBQy9ELEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7aUJBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEI7UUFBSCxDQUE5QjtRQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxFQUFlLGNBQWY7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsS0FBZixFQUFzQixjQUF0QixDQUFyQyxFQUE0RTtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTVFO01BSCtELENBQWpFO0lBRG1CLENBQXJCO0VBOU04QixDQUFoQztBQXhCQSIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xuT3MgPSByZXF1aXJlICdvcydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbmdpdCA9IHJlcXVpcmUgJy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL2xpYi9ub3RpZmllcidcbntcbiAgcmVwbyxcbiAgcGF0aFRvUmVwb0ZpbGUsXG4gIHRleHRFZGl0b3IsXG4gIGNvbW1pdFBhbmUsXG4gIGN1cnJlbnRQYW5lXG59ID0gcmVxdWlyZSAnLi9maXh0dXJlcydcbnBhdGhUb1N1Ym1vZHVsZUZpbGUgPSBQYXRoLmpvaW4gT3MuaG9tZWRpcigpLCBcInNvbWUvc3VibW9kdWxlL2ZpbGVcIlxuXG5tb2NrU3VibW9kdWxlID1cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeTogLT4gUGF0aC5qb2luIE9zLmhvbWVkaXIoKSwgXCJzb21lL3N1Ym1vZHVsZVwiXG4gIHJlbGF0aXZpemU6IChwYXRoKSAtPiBcImZpbGVcIiBpZiBwYXRoIGlzIHBhdGhUb1N1Ym1vZHVsZUZpbGVcblxubW9ja1JlcG9XaXRoU3VibW9kdWxlID0gT2JqZWN0LmNyZWF0ZShyZXBvKVxubW9ja1JlcG9XaXRoU3VibW9kdWxlLnJlcG8gPSB7XG4gIHN1Ym1vZHVsZUZvclBhdGg6IChwYXRoKSAtPlxuICAgIG1vY2tTdWJtb2R1bGUgaWYgcGF0aCBpcyBwYXRoVG9TdWJtb2R1bGVGaWxlXG59XG5cbmRlc2NyaWJlIFwiR2l0LVBsdXMgZ2l0IG1vZHVsZVwiLCAtPlxuICBkZXNjcmliZSBcImdpdC5nZXRDb25maWdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gYSByZXBvIGZpbGUgcGF0aCBpc24ndCBzcGVjaWZpZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgOjpnZXRDb25maWdWYWx1ZSBvbiB0aGUgZ2l2ZW4gaW5zdGFuY2Ugb2YgR2l0UmVwb3NpdG9yeVwiLCAtPlxuICAgICAgICBzcHlPbihyZXBvLCAnZ2V0Q29uZmlnVmFsdWUnKS5hbmRSZXR1cm4gJ3ZhbHVlJ1xuICAgICAgICBleHBlY3QoZ2l0LmdldENvbmZpZyhyZXBvLCAndXNlci5uYW1lJykpLnRvQmUgJ3ZhbHVlJ1xuICAgICAgICBleHBlY3QocmVwby5nZXRDb25maWdWYWx1ZSkudG9IYXZlQmVlbkNhbGxlZFdpdGggJ3VzZXIubmFtZScsIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlcmUgaXMgbm8gdmFsdWUgZm9yIGEgY29uZmlnIGtleVwiLCAtPlxuICAgICAgaXQgXCJyZXR1cm5zIG51bGxcIiwgLT5cbiAgICAgICAgc3B5T24ocmVwbywgJ2dldENvbmZpZ1ZhbHVlJykuYW5kUmV0dXJuIG51bGxcbiAgICAgICAgZXhwZWN0KGdpdC5nZXRDb25maWcocmVwbywgJ3VzZXIubmFtZScpKS50b0JlIG51bGxcblxuICBkZXNjcmliZSBcImdpdC5nZXRSZXBvXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gcmVwb3NpdG9yeVwiLCAtPlxuICAgICAgc3B5T24oYXRvbS5wcm9qZWN0LCAnZ2V0UmVwb3NpdG9yaWVzJykuYW5kUmV0dXJuIFtyZXBvXVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5nZXRSZXBvKCkudGhlbiAoYWN0dWFsKSAtPlxuICAgICAgICAgIGV4cGVjdChhY3R1YWwuZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50b0VxdWFsIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJnaXQuZGlyXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYWJzb2x1dGUgcGF0aCBvZiByZXBvXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgICAgc3B5T24oYXRvbS5wcm9qZWN0LCAnZ2V0UmVwb3NpdG9yaWVzJykuYW5kUmV0dXJuIFtyZXBvXVxuICAgICAgZ2l0LmRpcigpLnRoZW4gKGRpcikgLT5cbiAgICAgICAgZXhwZWN0KGRpcikudG9FcXVhbCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIGRlc2NyaWJlIFwiZ2l0LmdldFN1Ym1vZHVsZVwiLCAtPlxuICAgIGl0IFwicmV0dXJucyB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBubyBzdWJtb2R1bGVcIiwgLT5cbiAgICAgIGV4cGVjdChnaXQuZ2V0U3VibW9kdWxlKHBhdGhUb1JlcG9GaWxlKSkudG9CZSB1bmRlZmluZWRcblxuICAgIGl0IFwicmV0dXJucyBhIHN1Ym1vZHVsZSB3aGVuIGdpdmVuIGZpbGUgaXMgaW4gYSBzdWJtb2R1bGUgb2YgYSBwcm9qZWN0IHJlcG9cIiwgLT5cbiAgICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ2dldFJlcG9zaXRvcmllcycpLmFuZENhbGxGYWtlIC0+IFttb2NrUmVwb1dpdGhTdWJtb2R1bGVdXG4gICAgICBleHBlY3QoZ2l0LmdldFN1Ym1vZHVsZShwYXRoVG9TdWJtb2R1bGVGaWxlKS5nZXRXb3JraW5nRGlyZWN0b3J5KCkpLnRvRXF1YWwgbW9ja1N1Ym1vZHVsZS5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBkZXNjcmliZSBcImdpdC5yZWxhdGl2aXplXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIHJlbGF0aXZpemVkIGZpbGVwYXRoIGZvciBmaWxlcyBpbiByZXBvXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRSZXBvc2l0b3JpZXMnKS5hbmRDYWxsRmFrZSAtPiBbcmVwbywgbW9ja1JlcG9XaXRoU3VibW9kdWxlXVxuICAgICAgZXhwZWN0KGdpdC5yZWxhdGl2aXplIHBhdGhUb1JlcG9GaWxlKS50b0JlICdkaXJlY3RvcnkvZmlsZSdcbiAgICAgIGV4cGVjdChnaXQucmVsYXRpdml6ZSBwYXRoVG9TdWJtb2R1bGVGaWxlKS50b0JlIFwiZmlsZVwiXG5cbiAgZGVzY3JpYmUgXCJnaXQuY21kXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZVwiLCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByb21pc2UgPSBnaXQuY21kKClcbiAgICAgICAgZXhwZWN0KHByb21pc2UuY2F0Y2gpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHByb21pc2UudGhlbikudG9CZURlZmluZWQoKVxuICAgICAgICBwcm9taXNlLmNhdGNoIChvdXRwdXQpIC0+XG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCd1c2FnZScpXG5cbiAgICBpdCBcInJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggc3Rkb3V0IG9uIHN1Y2Nlc3NcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuY21kKFsnLS12ZXJzaW9uJ10pLnRoZW4gKG91dHB1dCkgLT5cbiAgICAgICAgICBleHBlY3Qob3V0cHV0KS50b0NvbnRhaW4oJ2dpdCB2ZXJzaW9uJylcblxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZWplY3RlZCB3aXRoIHN0ZGVyciBvbiBmYWlsdXJlXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LmNtZChbJ2hlbHAnLCAnLS1ib2d1cy1vcHRpb24nXSkuY2F0Y2ggKG91dHB1dCkgLT5cbiAgICAgICAgICBleHBlY3Qob3V0cHV0KS50b0NvbnRhaW4oJ3Vua25vd24gb3B0aW9uJylcblxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2l0aCBzdGRlcnIgb24gc3VjY2Vzc1wiLCAtPlxuICAgICAgaW5pdERpciA9ICdnaXQtcGx1cy10ZXN0LWRpcicgKyBNYXRoLnJhbmRvbSgpXG4gICAgICBjbG9uZURpciA9IGluaXREaXIgKyAnLWNsb25lJ1xuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICMgVE9ETzogVXNlIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3QgcmVxdWlyZSBwZXJtaXNzaW9ucyBhbmQgY2FuIHJ1biB3aXRoaW4gYXRvbVxuICAgICAgICBnaXQuY21kKFsnaW5pdCcsIGluaXREaXJdKS50aGVuICgpIC0+XG4gICAgICAgICAgZ2l0LmNtZChbJ2Nsb25lJywgJy0tcHJvZ3Jlc3MnLCBpbml0RGlyLCBjbG9uZURpcl0pXG4gICAgICAgIC50aGVuIChvdXRwdXQpIC0+XG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhpbml0RGlyKVxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMoY2xvbmVEaXIpXG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCdDbG9uaW5nJylcblxuICBkZXNjcmliZSBcImdpdC5hZGRcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2FkZCcsICctLWFsbCcsIHtmaWxlTmFtZX1dXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5hZGQocmVwbywgZmlsZTogcGF0aFRvU3VibW9kdWxlRmlsZSkudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS1hbGwnLCBwYXRoVG9TdWJtb2R1bGVGaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnYWRkJywgJy0tYWxsJywgJy4nXSB3aGVuIG5vIGZpbGUgaXMgc3BlY2lmaWVkXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5hZGQocmVwbykudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS1hbGwnLCAnLiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuXG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydhZGQnLCAnLS11cGRhdGUnLi4uXSB3aGVuIHVwZGF0ZSBvcHRpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuYWRkKHJlcG8sIHVwZGF0ZTogdHJ1ZSkudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS11cGRhdGUnLCAnLiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGZhaWxzXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIG9mIGZhaWx1cmVcIiwgLT5cbiAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVqZWN0ICdnaXQuYWRkIGVycm9yJ1xuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEVycm9yJylcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgZ2l0LmFkZChyZXBvKS50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgICAgICBmYWlsIFwic2hvdWxkIGhhdmUgYmVlbiByZWplY3RlZFwiXG4gICAgICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgICAgIGV4cGVjdChub3RpZmllci5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZFdpdGggJ2dpdC5hZGQgZXJyb3InXG5cbiAgZGVzY3JpYmUgXCJnaXQucmVzZXRcIiwgLT5cbiAgICBpdCBcInJlc2V0cyBhbmQgdW5zdGFnZXMgYWxsIGZpbGVzXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5yZXNldChyZXBvKS50aGVuIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVzZXQnLCAnSEVBRCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJnaXQuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICBpdCBcInJldHVybnMgYW4gZW1wdHkgYXJyYXkgd2hlbiB0aGVyZSBhcmUgbm8gc3RhZ2VkIGZpbGVzXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgJydcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuc3RhZ2VkRmlsZXMocmVwbylcbiAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgIGV4cGVjdChmaWxlcy5sZW5ndGgpLnRvRXF1YWwgMFxuXG4gICAgIyBpdCBcInJldHVybnMgYW4gYXJyYXkgd2l0aCBzaXplIDEgd2hlbiB0aGVyZSBpcyBhIHN0YWdlZCBmaWxlXCIsIC0+XG4gICAgIyAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+IFByb21pc2UucmVzb2x2ZShcIk1cXHRzb21lZmlsZS50eHRcIilcbiAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgIyAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pXG4gICAgIyAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICMgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgI1xuICAgICMgaXQgXCJyZXR1cm5zIGFuIGFycmF5IHdpdGggc2l6ZSA0IHdoZW4gdGhlcmUgYXJlIDQgc3RhZ2VkIGZpbGVzXCIsIC0+XG4gICAgIyAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgIyAgICAgUHJvbWlzZS5yZXNvbHZlKFwiTVxcdHNvbWVmaWxlLnR4dFxcbkFcXHRmb28uZmlsZVxcbkRcXHRhbm90aGVyLnRleHRcXG5NXFx0YWdhaW4ucmJcIilcbiAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgIyAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pXG4gICAgIyAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICMgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCA0XG5cbiAgZGVzY3JpYmUgXCJnaXQudW5zdGFnZWRGaWxlc1wiLCAtPlxuICAgIGl0IFwicmV0dXJucyBhbiBlbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBubyB1bnN0YWdlZCBmaWxlc1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlICcnXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LnVuc3RhZ2VkRmlsZXMocmVwbylcbiAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgIGV4cGVjdChmaWxlcy5sZW5ndGgpLnRvRXF1YWwgMFxuXG4gICAgIyMgTmVlZCBhIHdheSB0byBtb2NrIHRoZSB0ZXJtaW5hbCdzIGZpcnN0IGNoYXIgaWRlbnRpZmllciAoXFwwKVxuICAgICMgaXQgXCJyZXR1cm5zIGFuIGFycmF5IHdpdGggc2l6ZSAxIHdoZW4gdGhlcmUgaXMgYW4gdW5zdGFnZWQgZmlsZVwiLCAtPlxuICAgICMgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgXCJNXFx0c29tZWZpbGUudHh0XCJcbiAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgIyAgICAgZ2l0LnVuc3RhZ2VkRmlsZXMocmVwbylcbiAgICAjICAgICAudGhlbiAoZmlsZXMpIC0+XG4gICAgIyAgICAgICBleHBlY3QoZmlsZXMubGVuZ3RoKS50b0VxdWFsIDFcbiAgICAjICAgICAgIGV4cGVjdChmaWxlc1swXS5tb2RlKS50b0VxdWFsICdNJ1xuICAgICNcbiAgICAjIGl0IFwicmV0dXJucyBhbiBhcnJheSB3aXRoIHNpemUgNCB3aGVuIHRoZXJlIGFyZSA0IHVuc3RhZ2VkIGZpbGVzXCIsIC0+XG4gICAgIyAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgIyAgICAgUHJvbWlzZS5yZXNvbHZlKFwiTVxcdHNvbWVmaWxlLnR4dFxcbkFcXHRmb28uZmlsZVxcbkRcXHRhbm90aGVyLnRleHRcXG5NXFx0YWdhaW4ucmJcIilcbiAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgIyAgICAgZ2l0LnVuc3RhZ2VkRmlsZXMocmVwbylcbiAgICAjICAgICAudGhlbiAoZmlsZXMpIC0+XG4gICAgIyAgICAgICBleHBlY3QoZmlsZXMubGVuZ3RoKS50b0VxdWFsIDRcbiAgICAjICAgICAgIGV4cGVjdChmaWxlc1sxXS5tb2RlKS50b0VxdWFsICdBJ1xuICAgICMgICAgICAgZXhwZWN0KGZpbGVzWzNdLm1vZGUpLnRvRXF1YWwgJ00nXG5cbiAgIyBkZXNjcmliZSBcImdpdC51bnN0YWdlZEZpbGVzIGFuZCBzaG93VW50cmFja2VkOiB0cnVlXCIsIC0+XG4gICMgICBpdCBcInJldHVybnMgYW4gYXJyYXkgd2l0aCBzaXplIDEgd2hlbiB0aGVyZSBpcyBvbmx5IGFuIHVudHJhY2tlZCBmaWxlXCIsIC0+XG4gICMgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICMgICAgICAgaWYgZ2l0LmNtZC5jYWxsQ291bnQgaXMgMlxuICAjICAgICAgICAgUHJvbWlzZS5yZXNvbHZlIFwic29tZWZpbGUudHh0XCJcbiAgIyAgICAgICBlbHNlXG4gICMgICAgICAgICBQcm9taXNlLnJlc29sdmUgJydcbiAgIyAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAjICAgICAgICAgICBnaXQudW5zdGFnZWRGaWxlcyhyZXBvLCBzaG93VW50cmFja2VkOiB0cnVlKVxuICAjICAgICAgICAgICAudGhlbiAoZmlsZXMpIC0+XG4gICMgICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICMgICAgICAgICAgICAgZXhwZWN0KGZpbGVzWzBdLm1vZGUpLnRvRXF1YWwgJz8nXG4gICNcbiAgIyAgIGl0IFwicmV0dXJucyBhbiBhcnJheSBvZiBzaXplIDIgd2hlbiB0aGVyZSBpcyBhbiB1bnRyYWNrZWQgZmlsZSBhbmQgYW4gdW5zdGFnZWQgZmlsZVwiLCAtPlxuICAjICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAjICAgICAgIGlmIGdpdC5jbWQuY2FsbENvdW50IGlzIDJcbiAgIyAgICAgICAgIFByb21pc2UucmVzb2x2ZSBcInVudHJhY2tlZC50eHRcIlxuICAjICAgICAgIGVsc2VcbiAgIyAgICAgICAgIFByb21pc2UucmVzb2x2ZSAnTVxcdHVuc3RhZ2VkLmZpbGUnXG4gICMgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAjICAgICAgIGdpdC51bnN0YWdlZEZpbGVzKHJlcG8sIHNob3dVbnRyYWNrZWQ6IHRydWUpXG4gICMgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAjICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAyXG4gICMgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnTSdcbiAgIyAgICAgICAgIGV4cGVjdChmaWxlc1sxXS5tb2RlKS50b0VxdWFsICc/J1xuXG4gIGRlc2NyaWJlIFwiZ2l0LnN0YXR1c1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzdGF0dXMnIGFzIHRoZSBmaXJzdCBhcmd1bWVudFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1xuICAgICAgICBpZiBhcmdzWzBdWzBdIGlzICdzdGF0dXMnXG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIGdpdC5zdGF0dXMocmVwbykudGhlbiAtPiBleHBlY3QodHJ1ZSkudG9CZVRydXRoeSgpXG5cbiAgZGVzY3JpYmUgXCJnaXQucmVmcmVzaFwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBubyBhcmd1bWVudHMgYXJlIHBhc3NlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyByZXBvLnJlZnJlc2hTdGF0dXMgZm9yIGVhY2ggcmVwbyBpbiBwcm9qZWN0XCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ2dldFJlcG9zaXRvcmllcycpLmFuZENhbGxGYWtlIC0+IFsgcmVwbyBdXG4gICAgICAgIHNweU9uKHJlcG8sICdyZWZyZXNoU3RhdHVzJylcbiAgICAgICAgZ2l0LnJlZnJlc2goKVxuICAgICAgICBleHBlY3QocmVwby5yZWZyZXNoU3RhdHVzKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhIEdpdFJlcG9zaXRvcnkgb2JqZWN0IGlzIHBhc3NlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyByZXBvLnJlZnJlc2hTdGF0dXMgZm9yIGVhY2ggcmVwbyBpbiBwcm9qZWN0XCIsIC0+XG4gICAgICAgIHNweU9uKHJlcG8sICdyZWZyZXNoU3RhdHVzJylcbiAgICAgICAgZ2l0LnJlZnJlc2ggcmVwb1xuICAgICAgICBleHBlY3QocmVwby5yZWZyZXNoU3RhdHVzKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcImdpdC5kaWZmXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydkaWZmJywgJy1wJywgJy1VMSddIGFuZCB0aGUgZmlsZSBwYXRoXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgXCJzdHJpbmdcIlxuICAgICAgZ2l0LmRpZmYocmVwbywgcGF0aFRvUmVwb0ZpbGUpXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydkaWZmJywgJy1wJywgJy1VMScsIHBhdGhUb1JlcG9GaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
