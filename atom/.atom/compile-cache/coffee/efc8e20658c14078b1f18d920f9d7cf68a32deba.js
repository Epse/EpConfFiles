(function() {
  var GitRepository, Os, Path, commitPane, currentPane, fs, git, mockRepoWithSubmodule, mockSubmodule, notifier, pathToRepoFile, pathToSubmoduleFile, ref, repo, textEditor;

  Path = require('path');

  Os = require('os');

  fs = require('fs-plus');

  GitRepository = require('atom').GitRepository;

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
    describe("getting staged/unstaged files", function() {
      var file, repository, workingDirectory;
      workingDirectory = Path.join(Os.homedir(), 'fixture-repo');
      file = Path.join(workingDirectory, 'fake.file');
      repository = null;
      beforeEach(function() {
        fs.writeFileSync(file, 'foobar');
        waitsForPromise(function() {
          return git.cmd(['init'], {
            cwd: workingDirectory
          });
        });
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        waitsForPromise(function() {
          return git.cmd(['commit', '--allow-empty', '--allow-empty-message', '-m', ''], {
            cwd: workingDirectory
          });
        });
        return runs(function() {
          return repository = GitRepository.open(workingDirectory);
        });
      });
      afterEach(function() {
        fs.removeSync(workingDirectory);
        return repository.destroy();
      });
      describe("git.stagedFiles", function() {
        it("returns an empty array when there are no staged files", function() {
          return git.stagedFiles(repository).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
        return it("returns a non-empty array when there are staged files", function() {
          fs.writeFileSync(file, 'some stuff');
          waitsForPromise(function() {
            return git.cmd(['add', 'fake.file'], {
              cwd: workingDirectory
            });
          });
          return waitsForPromise(function() {
            return git.stagedFiles(repository).then(function(files) {
              expect(files.length).toEqual(1);
              expect(files[0].mode).toEqual('M');
              expect(files[0].path).toEqual('fake.file');
              return expect(files[0].staged).toBe(true);
            });
          });
        });
      });
      describe("git.unstagedFiles", function() {
        it("returns an empty array when there are no unstaged files", function() {
          return git.unstagedFiles(repository).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
        return it("returns a non-empty array when there are unstaged files", function() {
          fs.writeFileSync(file, 'some stuff');
          waitsForPromise(function() {
            return git.cmd(['reset'], {
              cwd: workingDirectory
            });
          });
          return waitsForPromise(function() {
            return git.unstagedFiles(repository).then(function(files) {
              expect(files.length).toEqual(1);
              expect(files[0].mode).toEqual('M');
              return expect(files[0].staged).toBe(false);
            });
          });
        });
      });
      return describe("git.unstagedFiles(showUntracked: true)", function() {
        return it("returns an array with size 1 when there is only an untracked file", function() {
          var newFile;
          newFile = Path.join(workingDirectory, 'another.file');
          fs.writeFileSync(newFile, 'this is untracked');
          return waitsForPromise(function() {
            return git.unstagedFiles(repository, {
              showUntracked: true
            }).then(function(files) {
              expect(files.length).toEqual(1);
              return expect(files[0].mode).toEqual('?');
            });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvZ2l0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDSixnQkFBaUIsT0FBQSxDQUFRLE1BQVI7O0VBQ2xCLEdBQUEsR0FBTSxPQUFBLENBQVEsWUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUNYLE1BTUksT0FBQSxDQUFRLFlBQVIsQ0FOSixFQUNFLGVBREYsRUFFRSxtQ0FGRixFQUdFLDJCQUhGLEVBSUUsMkJBSkYsRUFLRTs7RUFFRixtQkFBQSxHQUFzQixJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBVixFQUF3QixxQkFBeEI7O0VBRXRCLGFBQUEsR0FDRTtJQUFBLG1CQUFBLEVBQXFCLFNBQUE7YUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBVixFQUF3QixnQkFBeEI7SUFBSCxDQUFyQjtJQUNBLFVBQUEsRUFBWSxTQUFDLElBQUQ7TUFBVSxJQUFVLElBQUEsS0FBUSxtQkFBbEI7ZUFBQSxPQUFBOztJQUFWLENBRFo7OztFQUdGLHFCQUFBLEdBQXdCLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZDs7RUFDeEIscUJBQXFCLENBQUMsSUFBdEIsR0FBNkI7SUFDM0IsZ0JBQUEsRUFBa0IsU0FBQyxJQUFEO01BQ2hCLElBQWlCLElBQUEsS0FBUSxtQkFBekI7ZUFBQSxjQUFBOztJQURnQixDQURTOzs7RUFLN0IsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7SUFDOUIsUUFBQSxDQUFTLGVBQVQs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bUQsU0FBQTttQkFBRyxDQUFFLElBQUY7VUFBSCxDQUFuRDtVQUNBLEtBQUEsQ0FBTSxJQUFOLEVBQVksZUFBWjtVQUNBLEdBQUcsQ0FBQyxPQUFKLENBQUE7aUJBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFaLENBQTBCLENBQUMsZ0JBQTNCLENBQUE7UUFKc0QsQ0FBeEQ7TUFEdUMsQ0FBekM7YUFPQSxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQTtlQUNoRCxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtVQUN0RCxLQUFBLENBQU0sSUFBTixFQUFZLGVBQVo7VUFDQSxHQUFHLENBQUMsT0FBSixDQUFZLElBQVo7aUJBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFaLENBQTBCLENBQUMsZ0JBQTNCLENBQUE7UUFIc0QsQ0FBeEQ7TUFEZ0QsQ0FBbEQ7SUFSc0IsQ0FBeEI7V0FjQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO2FBQ25CLEVBQUEsQ0FBRyw0REFBSCxFQUFpRSxTQUFBO1FBQy9ELEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7aUJBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEI7UUFBSCxDQUE5QjtRQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxFQUFlLGNBQWY7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsS0FBZixFQUFzQixjQUF0QixDQUFyQyxFQUE0RTtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTVFO01BSCtELENBQWpFO0lBRG1CLENBQXJCO0VBM0w4QixDQUFoQztBQXpCQSIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xuT3MgPSByZXF1aXJlICdvcydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbntHaXRSZXBvc2l0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG5naXQgPSByZXF1aXJlICcuLi9saWIvZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9saWIvbm90aWZpZXInXG57XG4gIHJlcG8sXG4gIHBhdGhUb1JlcG9GaWxlLFxuICB0ZXh0RWRpdG9yLFxuICBjb21taXRQYW5lLFxuICBjdXJyZW50UGFuZVxufSA9IHJlcXVpcmUgJy4vZml4dHVyZXMnXG5wYXRoVG9TdWJtb2R1bGVGaWxlID0gUGF0aC5qb2luIE9zLmhvbWVkaXIoKSwgXCJzb21lL3N1Ym1vZHVsZS9maWxlXCJcblxubW9ja1N1Ym1vZHVsZSA9XG4gIGdldFdvcmtpbmdEaXJlY3Rvcnk6IC0+IFBhdGguam9pbiBPcy5ob21lZGlyKCksIFwic29tZS9zdWJtb2R1bGVcIlxuICByZWxhdGl2aXplOiAocGF0aCkgLT4gXCJmaWxlXCIgaWYgcGF0aCBpcyBwYXRoVG9TdWJtb2R1bGVGaWxlXG5cbm1vY2tSZXBvV2l0aFN1Ym1vZHVsZSA9IE9iamVjdC5jcmVhdGUocmVwbylcbm1vY2tSZXBvV2l0aFN1Ym1vZHVsZS5yZXBvID0ge1xuICBzdWJtb2R1bGVGb3JQYXRoOiAocGF0aCkgLT5cbiAgICBtb2NrU3VibW9kdWxlIGlmIHBhdGggaXMgcGF0aFRvU3VibW9kdWxlRmlsZVxufVxuXG5kZXNjcmliZSBcIkdpdC1QbHVzIGdpdCBtb2R1bGVcIiwgLT5cbiAgZGVzY3JpYmUgXCJnaXQuZ2V0Q29uZmlnXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgcmVwbyBmaWxlIHBhdGggaXNuJ3Qgc3BlY2lmaWVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIDo6Z2V0Q29uZmlnVmFsdWUgb24gdGhlIGdpdmVuIGluc3RhbmNlIG9mIEdpdFJlcG9zaXRvcnlcIiwgLT5cbiAgICAgICAgc3B5T24ocmVwbywgJ2dldENvbmZpZ1ZhbHVlJykuYW5kUmV0dXJuICd2YWx1ZSdcbiAgICAgICAgZXhwZWN0KGdpdC5nZXRDb25maWcocmVwbywgJ3VzZXIubmFtZScpKS50b0JlICd2YWx1ZSdcbiAgICAgICAgZXhwZWN0KHJlcG8uZ2V0Q29uZmlnVmFsdWUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoICd1c2VyLm5hbWUnLCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZXJlIGlzIG5vIHZhbHVlIGZvciBhIGNvbmZpZyBrZXlcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBudWxsXCIsIC0+XG4gICAgICAgIHNweU9uKHJlcG8sICdnZXRDb25maWdWYWx1ZScpLmFuZFJldHVybiBudWxsXG4gICAgICAgIGV4cGVjdChnaXQuZ2V0Q29uZmlnKHJlcG8sICd1c2VyLm5hbWUnKSkudG9CZSBudWxsXG5cbiAgZGVzY3JpYmUgXCJnaXQuZ2V0UmVwb1wiLCAtPlxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgcmVzb2x2aW5nIHRvIHJlcG9zaXRvcnlcIiwgLT5cbiAgICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ2dldFJlcG9zaXRvcmllcycpLmFuZFJldHVybiBbcmVwb11cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuZ2V0UmVwbygpLnRoZW4gKGFjdHVhbCkgLT5cbiAgICAgICAgICBleHBlY3QoYWN0dWFsLmdldFdvcmtpbmdEaXJlY3RvcnkoKSkudG9FcXVhbCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIGRlc2NyaWJlIFwiZ2l0LmRpclwiLCAtPlxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgcmVzb2x2aW5nIHRvIGFic29sdXRlIHBhdGggb2YgcmVwb1wiLCAtPlxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdnZXRBY3RpdmVUZXh0RWRpdG9yJykuYW5kUmV0dXJuIHRleHRFZGl0b3JcbiAgICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ2dldFJlcG9zaXRvcmllcycpLmFuZFJldHVybiBbcmVwb11cbiAgICAgIGdpdC5kaXIoKS50aGVuIChkaXIpIC0+XG4gICAgICAgIGV4cGVjdChkaXIpLnRvRXF1YWwgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBkZXNjcmliZSBcImdpdC5nZXRTdWJtb2R1bGVcIiwgLT5cbiAgICBpdCBcInJldHVybnMgdW5kZWZpbmVkIHdoZW4gdGhlcmUgaXMgbm8gc3VibW9kdWxlXCIsIC0+XG4gICAgICBleHBlY3QoZ2l0LmdldFN1Ym1vZHVsZShwYXRoVG9SZXBvRmlsZSkpLnRvQmUgdW5kZWZpbmVkXG5cbiAgICBpdCBcInJldHVybnMgYSBzdWJtb2R1bGUgd2hlbiBnaXZlbiBmaWxlIGlzIGluIGEgc3VibW9kdWxlIG9mIGEgcHJvamVjdCByZXBvXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRSZXBvc2l0b3JpZXMnKS5hbmRDYWxsRmFrZSAtPiBbbW9ja1JlcG9XaXRoU3VibW9kdWxlXVxuICAgICAgZXhwZWN0KGdpdC5nZXRTdWJtb2R1bGUocGF0aFRvU3VibW9kdWxlRmlsZSkuZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50b0VxdWFsIG1vY2tTdWJtb2R1bGUuZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJnaXQucmVsYXRpdml6ZVwiLCAtPlxuICAgIGl0IFwicmV0dXJucyByZWxhdGl2aXplZCBmaWxlcGF0aCBmb3IgZmlsZXMgaW4gcmVwb1wiLCAtPlxuICAgICAgc3B5T24oYXRvbS5wcm9qZWN0LCAnZ2V0UmVwb3NpdG9yaWVzJykuYW5kQ2FsbEZha2UgLT4gW3JlcG8sIG1vY2tSZXBvV2l0aFN1Ym1vZHVsZV1cbiAgICAgIGV4cGVjdChnaXQucmVsYXRpdml6ZSBwYXRoVG9SZXBvRmlsZSkudG9CZSAnZGlyZWN0b3J5L2ZpbGUnXG4gICAgICBleHBlY3QoZ2l0LnJlbGF0aXZpemUgcGF0aFRvU3VibW9kdWxlRmlsZSkudG9CZSBcImZpbGVcIlxuXG4gIGRlc2NyaWJlIFwiZ2l0LmNtZFwiLCAtPlxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2VcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBwcm9taXNlID0gZ2l0LmNtZCgpXG4gICAgICAgIGV4cGVjdChwcm9taXNlLmNhdGNoKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm9taXNlLnRoZW4pLnRvQmVEZWZpbmVkKClcbiAgICAgICAgcHJvbWlzZS5jYXRjaCAob3V0cHV0KSAtPlxuICAgICAgICAgIGV4cGVjdChvdXRwdXQpLnRvQ29udGFpbigndXNhZ2UnKVxuXG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aXRoIHN0ZG91dCBvbiBzdWNjZXNzXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LmNtZChbJy0tdmVyc2lvbiddKS50aGVuIChvdXRwdXQpIC0+XG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCdnaXQgdmVyc2lvbicpXG5cbiAgICBpdCBcInJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVqZWN0ZWQgd2l0aCBzdGRlcnIgb24gZmFpbHVyZVwiLCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5jbWQoWydoZWxwJywgJy0tYm9ndXMtb3B0aW9uJ10pLmNhdGNoIChvdXRwdXQpIC0+XG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCd1bmtub3duIG9wdGlvbicpXG5cbiAgICBpdCBcInJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggc3RkZXJyIG9uIHN1Y2Nlc3NcIiwgLT5cbiAgICAgIGluaXREaXIgPSAnZ2l0LXBsdXMtdGVzdC1kaXInICsgTWF0aC5yYW5kb20oKVxuICAgICAgY2xvbmVEaXIgPSBpbml0RGlyICsgJy1jbG9uZSdcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAjIFRPRE86IFVzZSBzb21ldGhpbmcgdGhhdCBkb2Vzbid0IHJlcXVpcmUgcGVybWlzc2lvbnMgYW5kIGNhbiBydW4gd2l0aGluIGF0b21cbiAgICAgICAgZ2l0LmNtZChbJ2luaXQnLCBpbml0RGlyXSkudGhlbiAoKSAtPlxuICAgICAgICAgIGdpdC5jbWQoWydjbG9uZScsICctLXByb2dyZXNzJywgaW5pdERpciwgY2xvbmVEaXJdKVxuICAgICAgICAudGhlbiAob3V0cHV0KSAtPlxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMoaW5pdERpcilcbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKGNsb25lRGlyKVxuICAgICAgICAgIGV4cGVjdChvdXRwdXQpLnRvQ29udGFpbignQ2xvbmluZycpXG5cbiAgZGVzY3JpYmUgXCJnaXQuYWRkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydhZGQnLCAnLS1hbGwnLCB7ZmlsZU5hbWV9XVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuYWRkKHJlcG8sIGZpbGU6IHBhdGhUb1N1Ym1vZHVsZUZpbGUpLnRoZW4gKHN1Y2Nlc3MpIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFsnYWRkJywgJy0tYWxsJywgcGF0aFRvU3VibW9kdWxlRmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2FkZCcsICctLWFsbCcsICcuJ10gd2hlbiBubyBmaWxlIGlzIHNwZWNpZmllZFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuYWRkKHJlcG8pLnRoZW4gKHN1Y2Nlc3MpIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFsnYWRkJywgJy0tYWxsJywgJy4nXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnYWRkJywgJy0tdXBkYXRlJy4uLl0gd2hlbiB1cGRhdGUgb3B0aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+IFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LmFkZChyZXBvLCB1cGRhdGU6IHRydWUpLnRoZW4gKHN1Y2Nlc3MpIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFsnYWRkJywgJy0tdXBkYXRlJywgJy4nXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBpdCBmYWlsc1wiLCAtPlxuICAgICAgaXQgXCJub3RpZmllcyBvZiBmYWlsdXJlXCIsIC0+XG4gICAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlamVjdCAnZ2l0LmFkZCBlcnJvcidcbiAgICAgICAgc3B5T24obm90aWZpZXIsICdhZGRFcnJvcicpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGdpdC5hZGQocmVwbykudGhlbiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgZmFpbCBcInNob3VsZCBoYXZlIGJlZW4gcmVqZWN0ZWRcIlxuICAgICAgICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoICdnaXQuYWRkIGVycm9yJ1xuXG4gIGRlc2NyaWJlIFwiZ2l0LnJlc2V0XCIsIC0+XG4gICAgaXQgXCJyZXNldHMgYW5kIHVuc3RhZ2VzIGFsbCBmaWxlc1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQucmVzZXQocmVwbykudGhlbiAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3Jlc2V0JywgJ0hFQUQnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIGRlc2NyaWJlIFwiZ2V0dGluZyBzdGFnZWQvdW5zdGFnZWQgZmlsZXNcIiwgLT5cbiAgICB3b3JraW5nRGlyZWN0b3J5ID0gUGF0aC5qb2luKE9zLmhvbWVkaXIoKSwgJ2ZpeHR1cmUtcmVwbycpXG4gICAgZmlsZSA9IFBhdGguam9pbih3b3JraW5nRGlyZWN0b3J5LCAnZmFrZS5maWxlJylcbiAgICByZXBvc2l0b3J5ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCAnZm9vYmFyJ1xuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydpbml0J10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29tbWl0JywgJy0tYWxsb3ctZW1wdHknLCAnLS1hbGxvdy1lbXB0eS1tZXNzYWdlJywgJy1tJywgJyddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICBydW5zIC0+IHJlcG9zaXRvcnkgPSBHaXRSZXBvc2l0b3J5Lm9wZW4od29ya2luZ0RpcmVjdG9yeSlcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgZnMucmVtb3ZlU3luYyB3b3JraW5nRGlyZWN0b3J5XG4gICAgICByZXBvc2l0b3J5LmRlc3Ryb3koKVxuXG4gICAgZGVzY3JpYmUgXCJnaXQuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBlbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBubyBzdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgIC50aGVuIChmaWxlcykgLT4gZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAwXG5cbiAgICAgIGl0IFwicmV0dXJucyBhIG5vbi1lbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBzdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCAnc29tZSBzdHVmZidcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCAnZmFrZS5maWxlJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnTSdcbiAgICAgICAgICAgIGV4cGVjdChmaWxlc1swXS5wYXRoKS50b0VxdWFsICdmYWtlLmZpbGUnXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0uc3RhZ2VkKS50b0JlIHRydWVcblxuICAgIGRlc2NyaWJlIFwiZ2l0LnVuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBlbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBubyB1bnN0YWdlZCBmaWxlc1wiLCAtPlxuICAgICAgICBnaXQudW5zdGFnZWRGaWxlcyhyZXBvc2l0b3J5KVxuICAgICAgICAudGhlbiAoZmlsZXMpIC0+IGV4cGVjdChmaWxlcy5sZW5ndGgpLnRvRXF1YWwgMFxuXG4gICAgICBpdCBcInJldHVybnMgYSBub24tZW1wdHkgYXJyYXkgd2hlbiB0aGVyZSBhcmUgdW5zdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCAnc29tZSBzdHVmZidcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydyZXNldCddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGdpdC51bnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnTSdcbiAgICAgICAgICAgIGV4cGVjdChmaWxlc1swXS5zdGFnZWQpLnRvQmUgZmFsc2VcblxuICAgIGRlc2NyaWJlIFwiZ2l0LnVuc3RhZ2VkRmlsZXMoc2hvd1VudHJhY2tlZDogdHJ1ZSlcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBhcnJheSB3aXRoIHNpemUgMSB3aGVuIHRoZXJlIGlzIG9ubHkgYW4gdW50cmFja2VkIGZpbGVcIiwgLT5cbiAgICAgICAgbmV3RmlsZSA9IFBhdGguam9pbih3b3JraW5nRGlyZWN0b3J5LCAnYW5vdGhlci5maWxlJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBuZXdGaWxlLCAndGhpcyBpcyB1bnRyYWNrZWQnXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGdpdC51bnN0YWdlZEZpbGVzKHJlcG9zaXRvcnksIHNob3dVbnRyYWNrZWQ6IHRydWUpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnPydcblxuICBkZXNjcmliZSBcImdpdC5zdGF0dXNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3RhdHVzJyBhcyB0aGUgZmlyc3QgYXJndW1lbnRcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICAgIGFyZ3MgPSBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NcbiAgICAgICAgaWYgYXJnc1swXVswXSBpcyAnc3RhdHVzJ1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBnaXQuc3RhdHVzKHJlcG8pLnRoZW4gLT4gZXhwZWN0KHRydWUpLnRvQmVUcnV0aHkoKVxuXG4gIGRlc2NyaWJlIFwiZ2l0LnJlZnJlc2hcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgcmVwby5yZWZyZXNoU3RhdHVzIGZvciBlYWNoIHJlcG8gaW4gcHJvamVjdFwiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRSZXBvc2l0b3JpZXMnKS5hbmRDYWxsRmFrZSAtPiBbIHJlcG8gXVxuICAgICAgICBzcHlPbihyZXBvLCAncmVmcmVzaFN0YXR1cycpXG4gICAgICAgIGdpdC5yZWZyZXNoKClcbiAgICAgICAgZXhwZWN0KHJlcG8ucmVmcmVzaFN0YXR1cykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYSBHaXRSZXBvc2l0b3J5IG9iamVjdCBpcyBwYXNzZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgcmVwby5yZWZyZXNoU3RhdHVzIGZvciBlYWNoIHJlcG8gaW4gcHJvamVjdFwiLCAtPlxuICAgICAgICBzcHlPbihyZXBvLCAncmVmcmVzaFN0YXR1cycpXG4gICAgICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgICAgICAgZXhwZWN0KHJlcG8ucmVmcmVzaFN0YXR1cykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJnaXQuZGlmZlwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnZGlmZicsICctcCcsICctVTEnXSBhbmQgdGhlIGZpbGUgcGF0aFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIFwic3RyaW5nXCJcbiAgICAgIGdpdC5kaWZmKHJlcG8sIHBhdGhUb1JlcG9GaWxlKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZGlmZicsICctcCcsICctVTEnLCBwYXRoVG9SZXBvRmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiJdfQ==
