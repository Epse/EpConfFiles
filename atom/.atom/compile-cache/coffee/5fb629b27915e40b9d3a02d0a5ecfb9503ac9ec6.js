(function() {
  var GitCommit, GitPush, GitRepository, Path, commentChar, commitFilePath, file, fs, git, notifier, os, quibble, repo, workingDirectory;

  os = require('os');

  Path = require('path');

  quibble = require('quibble');

  fs = require('fs-plus');

  GitRepository = require('atom').GitRepository;

  git = require('../../lib/git');

  GitPush = quibble('../../lib/models/git-push', jasmine.createSpy('GitPush'));

  GitCommit = require('../../lib/models/git-commit');

  notifier = require('../../lib/notifier');

  commentChar = '%';

  workingDirectory = Path.join(os.homedir(), 'fixture-repo');

  commitFilePath = Path.join(workingDirectory, '/.git/COMMIT_EDITMSG');

  file = Path.join(workingDirectory, 'fake.file');

  repo = null;

  describe("GitCommit", function() {
    beforeEach(function() {
      fs.writeFileSync(file, 'foobar');
      waitsForPromise(function() {
        return git.cmd(['init'], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['config', 'core.commentchar', commentChar], {
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
      waitsForPromise(function() {
        return git.cmd(['tag', '-a', '-m', '', 'ROOT'], {
          cwd: workingDirectory
        });
      });
      return runs(function() {
        return repo = GitRepository.open(workingDirectory);
      });
    });
    afterEach(function() {
      fs.removeSync(workingDirectory);
      return repo.destroy();
    });
    describe("a regular commit", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      it("uses the commentchar from git configs", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText().trim()[0]).toBe(commentChar);
      });
      it("gets staged files", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText()).toContain('modified:   fake.file');
      });
      it("makes a commit when the commit file is saved and closes the textEditor", function() {
        var editor, log;
        spyOn(notifier, 'addSuccess');
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        editor.setText('this is a commit');
        editor.save();
        log = null;
        waitsFor(function() {
          return editor.destroy.callCount > 0;
        });
        waitsForPromise(function() {
          return log = git.cmd(['whatchanged', '-1', '--name-status'], {
            cwd: workingDirectory
          });
        });
        return runs(function() {
          expect(notifier.addSuccess).toHaveBeenCalled();
          return log.then(function(l) {
            return expect(l).toContain('this is a commit');
          });
        });
      });
      return it("cancels the commit on textEditor destroy", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        editor.destroy();
        return expect(fs.existsSync(commitFilePath)).toBe(false);
      });
    });
    describe("when commit.template config is set", function() {
      beforeEach(function() {
        var templateFile;
        templateFile = Path.join(os.tmpdir(), 'commit-template');
        fs.writeFileSync(templateFile, 'foobar');
        waitsForPromise(function() {
          return git.cmd(['config', 'commit.template', templateFile], {
            cwd: workingDirectory
          });
        });
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("pre-populates the commit with the template message", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        expect(editor.getText().startsWith('foobar')).toBe(true);
        return git.cmd(['config', '--unset', 'commit.template'], {
          cwd: workingDirectory
        });
      });
    });
    describe("when 'stageChanges' option is true", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        return waitsForPromise(function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        });
      });
      return it("stages modified and tracked files", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText()).toContain('modified:   fake.file');
      });
    });
    describe("a failing commit", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("notifies of error and closes commit pane", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        spyOn(notifier, 'addError');
        spyOn(git, 'cmd').andReturn(Promise.reject());
        editor.save();
        waitsFor(function() {
          return notifier.addError.callCount > 0;
        });
        return runs(function() {
          expect(notifier.addError).toHaveBeenCalled();
          return expect(editor.destroy).toHaveBeenCalled();
        });
      });
    });
    describe("when the verbose commit setting is true", function() {
      beforeEach(function() {
        atom.config.set("git-plus.commits.verboseCommits", true);
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("puts the diff in the commit file", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return waitsForPromise(function() {
          return git.cmd(['diff', '--color=never', '--staged'], {
            cwd: workingDirectory
          }).then(function(diff) {
            return expect(editor.getText()).toContain(diff);
          });
        });
      });
    });
    describe("when the `git-plus.general.openInPane` setting is true", function() {
      beforeEach(function() {
        atom.config.set('git-plus.general.openInPane', true);
        atom.config.set('git-plus.general.splitPane', 'Right');
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("closes the created pane on finish", function() {
        var pane;
        pane = atom.workspace.paneForURI(commitFilePath);
        spyOn(pane, 'destroy').andCallThrough();
        pane.itemForURI(commitFilePath).save();
        waitsFor(function() {
          return pane.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(pane.destroy).toHaveBeenCalled();
        });
      });
    });
    return describe("when 'andPush' option is true", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo, {
            andPush: true
          });
        });
      });
      return it("tries to push after a successful commit", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        editor.setText('blah blah');
        editor.save();
        waitsFor(function() {
          return editor.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(GitPush).toHaveBeenCalledWith(repo);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1jb21taXQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztFQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDSixnQkFBaUIsT0FBQSxDQUFRLE1BQVI7O0VBQ2xCLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSLEVBQXFDLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLENBQXJDOztFQUNWLFNBQUEsR0FBWSxPQUFBLENBQVEsNkJBQVI7O0VBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFFWCxXQUFBLEdBQWM7O0VBQ2QsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsT0FBSCxDQUFBLENBQVYsRUFBd0IsY0FBeEI7O0VBQ25CLGNBQUEsR0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxnQkFBVixFQUE0QixzQkFBNUI7O0VBQ2pCLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLGdCQUFWLEVBQTRCLFdBQTVCOztFQUNQLElBQUEsR0FBTzs7RUFFUCxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO0lBQ3BCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsUUFBdkI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsTUFBRCxDQUFSLEVBQWtCO1VBQUEsR0FBQSxFQUFLLGdCQUFM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QUFMO1dBQXZCO1FBQUgsQ0FBaEI7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVYsRUFBZ0I7WUFBQSxPQUFBLEVBQVMsSUFBVDtXQUFoQjtRQUFILENBQWhCO01BSFMsQ0FBWDthQUtBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO0FBQzVDLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLGNBQTFCLENBQXlDLENBQUMsVUFBMUMsQ0FBcUQsY0FBckQ7UUFDVCxLQUFBLENBQU0sTUFBTixFQUFjLFNBQWQsQ0FBd0IsQ0FBQyxjQUF6QixDQUFBO1FBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmO1FBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBQTtRQUNBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixHQUEyQjtRQUE5QixDQUFUO2VBQ0EsSUFBQSxDQUFLLFNBQUE7aUJBQUcsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxJQUFyQztRQUFILENBQUw7TUFONEMsQ0FBOUM7SUFOd0MsQ0FBMUM7RUFuSG9CLENBQXRCO0FBaEJBIiwic291cmNlc0NvbnRlbnQiOlsib3MgPSByZXF1aXJlICdvcydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xucXVpYmJsZSA9IHJlcXVpcmUgJ3F1aWJibGUnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG57R2l0UmVwb3NpdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdFB1c2ggPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1wdXNoJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdFB1c2gnKVxuR2l0Q29tbWl0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtY29tbWl0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9saWIvbm90aWZpZXInXG5cbmNvbW1lbnRDaGFyID0gJyUnXG53b3JraW5nRGlyZWN0b3J5ID0gUGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJ2ZpeHR1cmUtcmVwbycpXG5jb21taXRGaWxlUGF0aCA9IFBhdGguam9pbih3b3JraW5nRGlyZWN0b3J5LCAnLy5naXQvQ09NTUlUX0VESVRNU0cnKVxuZmlsZSA9IFBhdGguam9pbih3b3JraW5nRGlyZWN0b3J5LCAnZmFrZS5maWxlJylcbnJlcG8gPSBudWxsXG5cbmRlc2NyaWJlIFwiR2l0Q29tbWl0XCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsICdmb29iYXInXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydpbml0J10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2NvbmZpZycsICdjb3JlLmNvbW1lbnRjaGFyJywgY29tbWVudENoYXJdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCBmaWxlXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29tbWl0JywgJy0tYWxsb3ctZW1wdHknLCAnLS1hbGxvdy1lbXB0eS1tZXNzYWdlJywgJy1tJywgJyddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWyd0YWcnLCAnLWEnLCAnLW0nLCAnJywgJ1JPT1QnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgIHJ1bnMgLT4gcmVwbyA9IEdpdFJlcG9zaXRvcnkub3Blbih3b3JraW5nRGlyZWN0b3J5KVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGZzLnJlbW92ZVN5bmMgd29ya2luZ0RpcmVjdG9yeVxuICAgIHJlcG8uZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgXCJhIHJlZ3VsYXIgY29tbWl0XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCBNYXRoLnJhbmRvbSgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2FkZCcsIGZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0Q29tbWl0KHJlcG8pXG5cbiAgICBpdCBcInVzZXMgdGhlIGNvbW1lbnRjaGFyIGZyb20gZ2l0IGNvbmZpZ3NcIiwgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpLml0ZW1Gb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS50cmltKClbMF0pLnRvQmUgY29tbWVudENoYXJcblxuICAgIGl0IFwiZ2V0cyBzdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpLml0ZW1Gb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9Db250YWluICdtb2RpZmllZDogICBmYWtlLmZpbGUnXG5cbiAgICBpdCBcIm1ha2VzIGEgY29tbWl0IHdoZW4gdGhlIGNvbW1pdCBmaWxlIGlzIHNhdmVkIGFuZCBjbG9zZXMgdGhlIHRleHRFZGl0b3JcIiwgLT5cbiAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkU3VjY2VzcycpXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZGVzdHJveScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIGVkaXRvci5zZXRUZXh0ICd0aGlzIGlzIGEgY29tbWl0J1xuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgbG9nID0gbnVsbFxuICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yLmRlc3Ryb3kuY2FsbENvdW50ID4gMFxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGxvZyA9IGdpdC5jbWQoWyd3aGF0Y2hhbmdlZCcsICctMScsICctLW5hbWUtc3RhdHVzJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZFN1Y2Nlc3MpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBsb2cudGhlbiAobCkgLT4gZXhwZWN0KGwpLnRvQ29udGFpbiAndGhpcyBpcyBhIGNvbW1pdCdcblxuICAgIGl0IFwiY2FuY2VscyB0aGUgY29tbWl0IG9uIHRleHRFZGl0b3IgZGVzdHJveVwiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKGNvbW1pdEZpbGVQYXRoKSkudG9CZSBmYWxzZVxuXG4gIGRlc2NyaWJlIFwid2hlbiBjb21taXQudGVtcGxhdGUgY29uZmlnIGlzIHNldFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRlbXBsYXRlRmlsZSA9IFBhdGguam9pbihvcy50bXBkaXIoKSwgJ2NvbW1pdC10ZW1wbGF0ZScpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIHRlbXBsYXRlRmlsZSwgJ2Zvb2JhcidcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29uZmlnJywgJ2NvbW1pdC50ZW1wbGF0ZScsIHRlbXBsYXRlRmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCBmaWxlXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENvbW1pdChyZXBvKVxuXG4gICAgaXQgXCJwcmUtcG9wdWxhdGVzIHRoZSBjb21taXQgd2l0aCB0aGUgdGVtcGxhdGUgbWVzc2FnZVwiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpLnN0YXJ0c1dpdGgoJ2Zvb2JhcicpKS50b0JlIHRydWVcbiAgICAgIGdpdC5jbWQoWydjb25maWcnLCAnLS11bnNldCcsICdjb21taXQudGVtcGxhdGUnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuXG4gIGRlc2NyaWJlIFwid2hlbiAnc3RhZ2VDaGFuZ2VzJyBvcHRpb24gaXMgdHJ1ZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENvbW1pdChyZXBvLCBzdGFnZUNoYW5nZXM6IHRydWUpXG5cbiAgICBpdCBcInN0YWdlcyBtb2RpZmllZCBhbmQgdHJhY2tlZCBmaWxlc1wiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0NvbnRhaW4gJ21vZGlmaWVkOiAgIGZha2UuZmlsZSdcblxuICBkZXNjcmliZSBcImEgZmFpbGluZyBjb21taXRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsIE1hdGgucmFuZG9tKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbylcblxuICAgIGl0IFwibm90aWZpZXMgb2YgZXJyb3IgYW5kIGNsb3NlcyBjb21taXQgcGFuZVwiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIHNweU9uKGVkaXRvciwgJ2Rlc3Ryb3knKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihub3RpZmllciwgJ2FkZEVycm9yJylcbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlamVjdCgpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICB3YWl0c0ZvciAtPiBub3RpZmllci5hZGRFcnJvci5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZGVzdHJveSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSB2ZXJib3NlIGNvbW1pdCBzZXR0aW5nIGlzIHRydWVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgXCJnaXQtcGx1cy5jb21taXRzLnZlcmJvc2VDb21taXRzXCIsIHRydWVcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCBmaWxlXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENvbW1pdChyZXBvKVxuXG4gICAgaXQgXCJwdXRzIHRoZSBkaWZmIGluIHRoZSBjb21taXQgZmlsZVwiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuY21kKFsnZGlmZicsICctLWNvbG9yPW5ldmVyJywgJy0tc3RhZ2VkJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgICAgLnRoZW4gKGRpZmYpIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQ29udGFpbiBkaWZmXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBgZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lYCBzZXR0aW5nIGlzIHRydWVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScsIHRydWVcbiAgICAgIGF0b20uY29uZmlnLnNldCAnZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUnLCAnUmlnaHQnXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsIE1hdGgucmFuZG9tKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbylcblxuICAgIGl0IFwiY2xvc2VzIHRoZSBjcmVhdGVkIHBhbmUgb24gZmluaXNoXCIsIC0+XG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIHNweU9uKHBhbmUsICdkZXN0cm95JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgcGFuZS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5zYXZlKClcbiAgICAgIHdhaXRzRm9yIC0+IHBhbmUuZGVzdHJveS5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+IGV4cGVjdChwYW5lLmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiAnYW5kUHVzaCcgb3B0aW9uIGlzIHRydWVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsIE1hdGgucmFuZG9tKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbywgYW5kUHVzaDogdHJ1ZSlcblxuICAgIGl0IFwidHJpZXMgdG8gcHVzaCBhZnRlciBhIHN1Y2Nlc3NmdWwgY29tbWl0XCIsIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZGVzdHJveScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIGVkaXRvci5zZXRUZXh0ICdibGFoIGJsYWgnXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICB3YWl0c0ZvciAtPiBlZGl0b3IuZGVzdHJveS5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+IGV4cGVjdChHaXRQdXNoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvXG4iXX0=
