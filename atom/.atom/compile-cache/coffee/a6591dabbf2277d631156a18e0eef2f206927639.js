(function() {
  var RemoteListView, alwaysPullFromUpstream, colorOptions, git, options, pullBeforePush, pullRebase, remotes, repo;

  git = require('../../lib/git');

  RemoteListView = require('../../lib/views/remote-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  remotes = "remote1\nremote2";

  pullBeforePush = 'git-plus.remoteInteractions.pullBeforePush';

  pullRebase = 'git-plus.remoteInteractions.pullRebase';

  alwaysPullFromUpstream = 'git-plus.remoteInteractions.alwaysPullFromUpstream';

  describe("RemoteListView", function() {
    it("displays a list of remotes", function() {
      var view;
      view = new RemoteListView(repo, remotes, {
        mode: 'pull'
      });
      return expect(view.items.length).toBe(2);
    });
    describe("when mode is pull", function() {
      return it("it calls git.cmd to get the remote branches", function() {
        var view;
        atom.config.set(alwaysPullFromUpstream, false);
        view = new RemoteListView(repo, remotes, {
          mode: 'pull'
        });
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('branch1\nbranch2');
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color', '-r'], options);
        });
      });
    });
    describe("when mode is fetch", function() {
      return it("it calls git.cmd to with ['fetch'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is fetch-prune", function() {
      return it("it calls git.cmd to with ['fetch', '--prune'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch-prune'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', '--prune', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is push", function() {
      return it("calls git.cmd with ['push']", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
        });
      });
    });
    return describe("when mode is 'push -u'", function() {
      it("calls git.cmd with ['push', '-u'] and remote name", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push -u'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', '-u', 'remote1', 'HEAD'], options, colorOptions);
        });
      });
      return describe("when the the config for pull before push is set to true", function() {
        it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, true);
          atom.config.set(alwaysPullFromUpstream, false);
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 2;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote1', 'branch1'], options, colorOptions);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
          });
        });
        describe("when the config for alwaysPullFromUpstream is set to true", function() {
          return it("calls the function from the _pull module", function() {
            var view;
            spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
            atom.config.set(pullBeforePush, true);
            atom.config.set(alwaysPullFromUpstream, true);
            view = new RemoteListView(repo, remotes, {
              mode: 'push'
            });
            view.confirmSelection();
            waitsFor(function() {
              return git.cmd.callCount > 1;
            });
            return runs(function() {
              expect(git.cmd).not.toHaveBeenCalledWith(['pull', 'remote1', 'branch1'], options, colorOptions);
              return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
            });
          });
        });
        return describe("when the the config for pullRebase is set to true", function() {
          return it("calls git.cmd with ['pull', '--rebase'], remote name, and branch name and then with ['push']", function() {
            var view;
            spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
            atom.config.set(pullBeforePush, true);
            atom.config.set(pullRebase, true);
            view = new RemoteListView(repo, remotes, {
              mode: 'push'
            });
            view.confirmSelection();
            waitsFor(function() {
              return git.cmd.callCount > 2;
            });
            return runs(function() {
              expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote1', 'branch1'], options, colorOptions);
              return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSOztFQUNoQixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULE9BQUEsR0FBVTtJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOOzs7RUFDVixZQUFBLEdBQWU7SUFBQyxLQUFBLEVBQU8sSUFBUjs7O0VBQ2YsT0FBQSxHQUFVOztFQUNWLGNBQUEsR0FBaUI7O0VBQ2pCLFVBQUEsR0FBYTs7RUFDYixzQkFBQSxHQUF5Qjs7RUFFekIsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7SUFDekIsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7QUFDL0IsVUFBQTtNQUFBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCO1FBQUEsSUFBQSxFQUFNLE1BQU47T0FBOUI7YUFDWCxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFsQixDQUF5QixDQUFDLElBQTFCLENBQStCLENBQS9CO0lBRitCLENBQWpDO0lBSUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7YUFDNUIsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7QUFDaEQsWUFBQTtRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsS0FBeEM7UUFDQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtVQUFBLElBQUEsRUFBTSxNQUFOO1NBQTlCO1FBQ1gsS0FBQSxDQUFN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WUFBbkU7WUFGRyxDQUFMO1VBVGlHLENBQW5HO1FBRDRELENBQTlEO01BNUJrRSxDQUFwRTtJQVZpQyxDQUFuQztFQWxEeUIsQ0FBM0I7QUFWQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5SZW1vdGVMaXN0VmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9yZW1vdGUtbGlzdC12aWV3J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5vcHRpb25zID0ge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9XG5jb2xvck9wdGlvbnMgPSB7Y29sb3I6IHRydWV9XG5yZW1vdGVzID0gXCJyZW1vdGUxXFxucmVtb3RlMlwiXG5wdWxsQmVmb3JlUHVzaCA9ICdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbEJlZm9yZVB1c2gnXG5wdWxsUmViYXNlID0gJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsUmViYXNlJ1xuYWx3YXlzUHVsbEZyb21VcHN0cmVhbSA9ICdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbSdcblxuZGVzY3JpYmUgXCJSZW1vdGVMaXN0Vmlld1wiLCAtPlxuICBpdCBcImRpc3BsYXlzIGEgbGlzdCBvZiByZW1vdGVzXCIsIC0+XG4gICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAncHVsbCcpXG4gICAgZXhwZWN0KHZpZXcuaXRlbXMubGVuZ3RoKS50b0JlIDJcblxuICBkZXNjcmliZSBcIndoZW4gbW9kZSBpcyBwdWxsXCIsIC0+XG4gICAgaXQgXCJpdCBjYWxscyBnaXQuY21kIHRvIGdldCB0aGUgcmVtb3RlIGJyYW5jaGVzXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoYWx3YXlzUHVsbEZyb21VcHN0cmVhbSwgZmFsc2UpXG4gICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdWxsJylcbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSAnYnJhbmNoMVxcbmJyYW5jaDInXG5cbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnYnJhbmNoJywgJy0tbm8tY29sb3InLCAnLXInXSwgb3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIGZldGNoXCIsIC0+XG4gICAgaXQgXCJpdCBjYWxscyBnaXQuY21kIHRvIHdpdGggWydmZXRjaCddIGFuZCB0aGUgcmVtb3RlIG5hbWVcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSAnZmV0Y2hlZCBzdHVmZidcblxuICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAnZmV0Y2gnKVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydmZXRjaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIGZldGNoLXBydW5lXCIsIC0+XG4gICAgaXQgXCJpdCBjYWxscyBnaXQuY21kIHRvIHdpdGggWydmZXRjaCcsICctLXBydW5lJ10gYW5kIHRoZSByZW1vdGUgbmFtZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdmZXRjaGVkIHN0dWZmJ1xuXG4gICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdmZXRjaC1wcnVuZScpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2ZldGNoJywgJy0tcHJ1bmUnLCAncmVtb3RlMSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcblxuICBkZXNjcmliZSBcIndoZW4gbW9kZSBpcyBwdXNoXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdXNoJ11cIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ3B1c2hpbmcgdGV4dCdcblxuICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAncHVzaCcpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVzaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzICdwdXNoIC11J1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsncHVzaCcsICctdSddIGFuZCByZW1vdGUgbmFtZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgncHVzaGluZyB0ZXh0JylcbiAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1c2ggLXUnKVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1c2gnLCAnLXUnLCAncmVtb3RlMScsICdIRUFEJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSB0aGUgY29uZmlnIGZvciBwdWxsIGJlZm9yZSBwdXNoIGlzIHNldCB0byB0cnVlXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1bGwnXSwgcmVtb3RlIG5hbWUsIGFuZCBicmFuY2ggbmFtZSBhbmQgdGhlbiB3aXRoIFsncHVzaCddXCIsIC0+XG4gICAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ2JyYW5jaDEnXG4gICAgICAgIGF0b20uY29uZmlnLnNldChwdWxsQmVmb3JlUHVzaCwgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KGFsd2F5c1B1bGxGcm9tVXBzdHJlYW0sIGZhbHNlKVxuXG4gICAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1c2gnKVxuICAgICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMlxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdyZW1vdGUxJywgJ2JyYW5jaDEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVzaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGNvbmZpZyBmb3IgYWx3YXlzUHVsbEZyb21VcHN0cmVhbSBpcyBzZXQgdG8gdHJ1ZVwiLCAtPlxuICAgICAgICBpdCBcImNhbGxzIHRoZSBmdW5jdGlvbiBmcm9tIHRoZSBfcHVsbCBtb2R1bGVcIiwgLT5cbiAgICAgICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxJ1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldChwdWxsQmVmb3JlUHVzaCwgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoYWx3YXlzUHVsbEZyb21VcHN0cmVhbSwgdHJ1ZSlcblxuICAgICAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1c2gnKVxuICAgICAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDFcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkubm90LnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdyZW1vdGUxJywgJ2JyYW5jaDEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4gICAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdXNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgdGhlIGNvbmZpZyBmb3IgcHVsbFJlYmFzZSBpcyBzZXQgdG8gdHJ1ZVwiLCAtPlxuICAgICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1bGwnLCAnLS1yZWJhc2UnXSwgcmVtb3RlIG5hbWUsIGFuZCBicmFuY2ggbmFtZSBhbmQgdGhlbiB3aXRoIFsncHVzaCddXCIsIC0+XG4gICAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnYnJhbmNoMSdcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHVsbEJlZm9yZVB1c2gsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KHB1bGxSZWJhc2UsIHRydWUpXG5cbiAgICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAyXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICctLXJlYmFzZScsICdyZW1vdGUxJywgJ2JyYW5jaDEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4gICAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdXNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4iXX0=
