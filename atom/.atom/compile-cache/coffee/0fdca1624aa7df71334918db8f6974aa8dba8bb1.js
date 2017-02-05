(function() {
  var RemoteListView, colorOptions, git, options, pullBeforePush, remotes, repo;

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

  pullBeforePush = 'git-plus.pullBeforePush';

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
        atom.config.set('git-plus.alwaysPullFromUpstream', false);
        atom.config.set('git-plus.experimental', false);
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
          return expect(git.cmd).toHaveBeenCalledWith(['branch', '-r'], options);
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
        atom.config.set('git-plus.alwaysPullFromUpstream', false);
        atom.config.set('git-plus.experimental', false);
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 1;
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
      describe("when the the config for pull before push is set to true", function() {
        it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull');
          atom.config.set('git-plus.alwaysPullFromUpstream', false);
          atom.config.set('git-plus.experimental', false);
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
        return describe("when the config for alwaysPullFromUpstream is set to true", function() {
          return it("calls the function from the _pull module", function() {
            var view;
            spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
            atom.config.set(pullBeforePush, 'pull');
            atom.config.set('git-plus.alwaysPullFromUpstream', true);
            atom.config.set('git-plus.experimental', true);
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
      });
      return describe("when the the config for pull before push is set to 'Pull --rebase'", function() {
        return it("calls git.cmd with ['pull', '--rebase'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull --rebase');
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSOztFQUNoQixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULE9BQUEsR0FBVTtJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOOzs7RUFDVixZQUFBLEdBQWU7SUFBQyxLQUFBLEVBQU8sSUFBUjs7O0VBQ2YsT0FBQSxHQUFVOztFQUNWLGNBQUEsR0FBaUI7O0VBRWpCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0lBQ3pCLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO0FBQy9CLFVBQUE7TUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtRQUFBLElBQUEsRUFBTSxNQUFOO09BQTlCO2FBQ1gsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQjtJQUYrQixDQUFqQztJQUlBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO2FBQzVCLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO0FBQ2hELFlBQUE7UUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLEVBQW1ELEtBQW5EO1FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QztRQUNBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCO1VBQUEsSUFBQSxFQUFNLE1BQU47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b0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsU0FBckIsRUFBZ0MsU0FBaEMsQ0FBckMsRUFBaUYsT0FBakYsRUFBMEYsWUFBMUY7bUJBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsU0FBVCxDQUFyQyxFQUEwRCxPQUExRCxFQUFtRSxZQUFuRTtVQUZHLENBQUw7UUFSaUcsQ0FBbkc7TUFENkUsQ0FBL0U7SUF4Q2lDLENBQW5DO0VBckR5QixDQUEzQjtBQVJBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcblJlbW90ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbm9wdGlvbnMgPSB7Y3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKX1cbmNvbG9yT3B0aW9ucyA9IHtjb2xvcjogdHJ1ZX1cbnJlbW90ZXMgPSBcInJlbW90ZTFcXG5yZW1vdGUyXCJcbnB1bGxCZWZvcmVQdXNoID0gJ2dpdC1wbHVzLnB1bGxCZWZvcmVQdXNoJ1xuXG5kZXNjcmliZSBcIlJlbW90ZUxpc3RWaWV3XCIsIC0+XG4gIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIHJlbW90ZXNcIiwgLT5cbiAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdWxsJylcbiAgICBleHBlY3Qodmlldy5pdGVtcy5sZW5ndGgpLnRvQmUgMlxuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIHB1bGxcIiwgLT5cbiAgICBpdCBcIml0IGNhbGxzIGdpdC5jbWQgdG8gZ2V0IHRoZSByZW1vdGUgYnJhbmNoZXNcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbScsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwnLCBmYWxzZSlcbiAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1bGwnKVxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxXFxuYnJhbmNoMidcblxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydicmFuY2gnLCAnLXInXSwgb3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIGZldGNoXCIsIC0+XG4gICAgaXQgXCJpdCBjYWxscyBnaXQuY21kIHRvIHdpdGggWydmZXRjaCddIGFuZCB0aGUgcmVtb3RlIG5hbWVcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSAnZmV0Y2hlZCBzdHVmZidcblxuICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAnZmV0Y2gnKVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydmZXRjaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIGZldGNoLXBydW5lXCIsIC0+XG4gICAgaXQgXCJpdCBjYWxscyBnaXQuY21kIHRvIHdpdGggWydmZXRjaCcsICctLXBydW5lJ10gYW5kIHRoZSByZW1vdGUgbmFtZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdmZXRjaGVkIHN0dWZmJ1xuXG4gICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdmZXRjaC1wcnVuZScpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2ZldGNoJywgJy0tcHJ1bmUnLCAncmVtb3RlMSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcblxuICBkZXNjcmliZSBcIndoZW4gbW9kZSBpcyBwdXNoXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdXNoJ11cIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbScsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwnLCBmYWxzZSlcbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ3B1c2hpbmcgdGV4dCdcblxuICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAncHVzaCcpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDFcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVzaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzICdwdXNoIC11J1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsncHVzaCcsICctdSddIGFuZCByZW1vdGUgbmFtZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgncHVzaGluZyB0ZXh0JylcbiAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1c2ggLXUnKVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1c2gnLCAnLXUnLCAncmVtb3RlMScsICdIRUFEJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSB0aGUgY29uZmlnIGZvciBwdWxsIGJlZm9yZSBwdXNoIGlzIHNldCB0byB0cnVlXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1bGwnXSwgcmVtb3RlIG5hbWUsIGFuZCBicmFuY2ggbmFtZSBhbmQgdGhlbiB3aXRoIFsncHVzaCddXCIsIC0+XG4gICAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ2JyYW5jaDEnXG4gICAgICAgIGF0b20uY29uZmlnLnNldChwdWxsQmVmb3JlUHVzaCwgJ3B1bGwnKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nLCBmYWxzZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwnLCBmYWxzZSlcblxuICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDJcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAncmVtb3RlMScsICdicmFuY2gxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1c2gnLCAncmVtb3RlMSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBjb25maWcgZm9yIGFsd2F5c1B1bGxGcm9tVXBzdHJlYW0gaXMgc2V0IHRvIHRydWVcIiwgLT5cbiAgICAgICAgaXQgXCJjYWxscyB0aGUgZnVuY3Rpb24gZnJvbSB0aGUgX3B1bGwgbW9kdWxlXCIsIC0+XG4gICAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnYnJhbmNoMSdcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHVsbEJlZm9yZVB1c2gsICdwdWxsJylcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsJywgdHJ1ZSlcblxuICAgICAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1c2gnKVxuICAgICAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDFcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkubm90LnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdyZW1vdGUxJywgJ2JyYW5jaDEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4gICAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdXNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIHRoZSBjb25maWcgZm9yIHB1bGwgYmVmb3JlIHB1c2ggaXMgc2V0IHRvICdQdWxsIC0tcmViYXNlJ1wiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdWxsJywgJy0tcmViYXNlJ10sIHJlbW90ZSBuYW1lLCBhbmQgYnJhbmNoIG5hbWUgYW5kIHRoZW4gd2l0aCBbJ3B1c2gnXVwiLCAtPlxuICAgICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxJ1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHVsbEJlZm9yZVB1c2gsICdwdWxsIC0tcmViYXNlJylcblxuICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDJcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnLS1yZWJhc2UnLCAncmVtb3RlMScsICdicmFuY2gxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1c2gnLCAncmVtb3RlMSddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcbiJdfQ==
