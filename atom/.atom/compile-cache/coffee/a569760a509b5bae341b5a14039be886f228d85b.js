(function() {
  var Os, Path, head, homedir, mocks, pathToRepoFile;

  Path = require('path');

  Os = require('os');

  homedir = Os.homedir();

  pathToRepoFile = Path.join(homedir, "some/repository/directory/file");

  head = jasmine.createSpyObj('head', ['replace']);

  module.exports = mocks = {
    pathToRepoFile: pathToRepoFile,
    pathToSampleDir: homedir,
    repo: {
      getPath: function() {
        return Path.join(this.getWorkingDirectory(), ".git");
      },
      getWorkingDirectory: function() {
        return Path.join(homedir, "some/repository");
      },
      getConfigValue: function(key) {
        return 'some-value';
      },
      refreshStatus: function() {
        return void 0;
      },
      relativize: function(path) {
        if (path === pathToRepoFile) {
          return "directory/file";
        } else {
          return path;
        }
      },
      getReferences: function() {
        return {
          heads: [head]
        };
      },
      getShortHead: function() {
        return 'short head';
      },
      getUpstreamBranch: function() {
        return 'refs/remotes/origin/foo';
      },
      isPathModified: function() {
        return false;
      },
      repo: {
        submoduleForPath: function(path) {
          return void 0;
        }
      }
    },
    currentPane: {
      isAlive: function() {
        return true;
      },
      activate: function() {
        return void 0;
      },
      destroy: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return pathToRepoFile;
            }
          }
        ];
      }
    },
    commitPane: {
      isAlive: function() {
        return true;
      },
      destroy: function() {
        return mocks.textEditor.destroy();
      },
      splitRight: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return Path.join(mocks.repo.getPath(), 'COMMIT_EDITMSG');
            }
          }
        ];
      }
    },
    textEditor: {
      getPath: function() {
        return pathToRepoFile;
      },
      getURI: function() {
        return pathToRepoFile;
      },
      onDidDestroy: function(destroy) {
        this.destroy = destroy;
        return {
          dispose: function() {}
        };
      },
      onDidSave: function(save) {
        this.save = save;
        return {
          dispose: function() {
            return void 0;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvZml4dHVyZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE9BQUEsR0FBVSxFQUFFLENBQUMsT0FBSCxDQUFBOztFQUNWLGNBQUEsR0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGdDQUFuQjs7RUFDakIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE1BQXJCLEVBQTZCLENBQUMsU0FBRCxDQUE3Qjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFBLEdBQ2Y7SUFBQSxjQUFBLEVBQWdCLGNBQWhCO0lBQ0EsZUFBQSxFQUFpQixPQURqQjtJQUdBLElBQUEsRUFDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFWLEVBQXNDLE1BQXRDO01BQUgsQ0FBVDtNQUNBLG1CQUFBLEVBQXFCLFNBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsaUJBQW5CO01BQUgsQ0FEckI7TUFFQSxjQUFBLEVBQWdCLFNBQUMsR0FBRDtlQUFTO01BQVQsQ0FGaEI7TUFHQSxhQUFBLEVBQWUsU0FBQTtlQUFHO01BQUgsQ0FIZjtNQUlBLFVBQUEsRUFBWSxTQUFDLElBQUQ7UUFBVSxJQUFHLElBQUEsS0FBUSxjQUFYO2lCQUErQixpQkFBL0I7U0FBQSxNQUFBO2lCQUFxRCxLQUFyRDs7TUFBVixDQUpaO01BS0EsYUFBQSxFQUFlLFNBQUE7ZUFDYjtVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUQsQ0FBUDs7TUFEYSxDQUxmO01BT0EsWUFBQSxFQUFjLFNBQUE7ZUFBRztNQUFILENBUGQ7TUFRQSxpQkFBQSxFQUFtQixTQUFBO2VBQUc7TUFBSCxDQVJuQjtNQVNBLGNBQUEsRUFBZ0IsU0FBQTtlQUFHO01BQUgsQ0FUaEI7TUFVQSxJQUFBLEVBQ0U7UUFBQSxnQkFBQSxFQUFrQixTQUFDLElBQUQ7aUJBQVU7UUFBVixDQUFsQjtPQVhGO0tBSkY7SUFpQkEsV0FBQSxFQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7ZUFBRztNQUFILENBQVQ7TUFDQSxRQUFBLEVBQVUsU0FBQTtlQUFHO01BQUgsQ0FEVjtNQUVBLE9BQUEsRUFBUyxTQUFBO2VBQUc7TUFBSCxDQUZUO01BR0EsUUFBQSxFQUFVLFNBQUE7ZUFBRztVQUNYO1lBQUEsTUFBQSxFQUFRLFNBQUE7cUJBQUc7WUFBSCxDQUFSO1dBRFc7O01BQUgsQ0FIVjtLQWxCRjtJQXlCQSxVQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtlQUFHO01BQUgsQ0FBVDtNQUNBLE9BQUEsRUFBUyxTQUFBO2VBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFqQixDQUFBO01BQUgsQ0FEVDtNQUVBLFVBQUEsRUFBWSxTQUFBO2VBQUc7TUFBSCxDQUZaO01BR0EsUUFBQSxFQUFVLFNBQUE7ZUFBRztVQUNYO1lBQUEsTUFBQSxFQUFRLFNBQUE7cUJBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQVgsQ0FBQSxDQUFWLEVBQWdDLGdCQUFoQztZQUFILENBQVI7V0FEVzs7TUFBSCxDQUhWO0tBMUJGO0lBaUNBLFVBQUEsRUFDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO2VBQUc7TUFBSCxDQUFUO01BQ0EsTUFBQSxFQUFRLFNBQUE7ZUFBRztNQUFILENBRFI7TUFFQSxZQUFBLEVBQWMsU0FBQyxPQUFEO1FBQUMsSUFBQyxDQUFBLFVBQUQ7ZUFDYjtVQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUEsQ0FBVDs7TUFEWSxDQUZkO01BSUEsU0FBQSxFQUFXLFNBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO2VBQ1Y7VUFBQSxPQUFBLEVBQVMsU0FBQTttQkFBRztVQUFILENBQVQ7O01BRFMsQ0FKWDtLQWxDRjs7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xuT3MgPSByZXF1aXJlICdvcydcblxuaG9tZWRpciA9IE9zLmhvbWVkaXIoKVxucGF0aFRvUmVwb0ZpbGUgPSBQYXRoLmpvaW4oaG9tZWRpciwgXCJzb21lL3JlcG9zaXRvcnkvZGlyZWN0b3J5L2ZpbGVcIilcbmhlYWQgPSBqYXNtaW5lLmNyZWF0ZVNweU9iaignaGVhZCcsIFsncmVwbGFjZSddKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1vY2tzID1cbiAgcGF0aFRvUmVwb0ZpbGU6IHBhdGhUb1JlcG9GaWxlXG4gIHBhdGhUb1NhbXBsZURpcjogaG9tZWRpclxuXG4gIHJlcG86XG4gICAgZ2V0UGF0aDogLT4gUGF0aC5qb2luIHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCBcIi5naXRcIlxuICAgIGdldFdvcmtpbmdEaXJlY3Rvcnk6IC0+IFBhdGguam9pbihob21lZGlyLCBcInNvbWUvcmVwb3NpdG9yeVwiKVxuICAgIGdldENvbmZpZ1ZhbHVlOiAoa2V5KSAtPiAnc29tZS12YWx1ZSdcbiAgICByZWZyZXNoU3RhdHVzOiAtPiB1bmRlZmluZWRcbiAgICByZWxhdGl2aXplOiAocGF0aCkgLT4gaWYgcGF0aCBpcyBwYXRoVG9SZXBvRmlsZSB0aGVuIFwiZGlyZWN0b3J5L2ZpbGVcIiBlbHNlIHBhdGhcbiAgICBnZXRSZWZlcmVuY2VzOiAtPlxuICAgICAgaGVhZHM6IFtoZWFkXVxuICAgIGdldFNob3J0SGVhZDogLT4gJ3Nob3J0IGhlYWQnXG4gICAgZ2V0VXBzdHJlYW1CcmFuY2g6IC0+ICdyZWZzL3JlbW90ZXMvb3JpZ2luL2ZvbydcbiAgICBpc1BhdGhNb2RpZmllZDogLT4gZmFsc2VcbiAgICByZXBvOlxuICAgICAgc3VibW9kdWxlRm9yUGF0aDogKHBhdGgpIC0+IHVuZGVmaW5lZFxuXG4gIGN1cnJlbnRQYW5lOlxuICAgIGlzQWxpdmU6IC0+IHRydWVcbiAgICBhY3RpdmF0ZTogLT4gdW5kZWZpbmVkXG4gICAgZGVzdHJveTogLT4gdW5kZWZpbmVkXG4gICAgZ2V0SXRlbXM6IC0+IFtcbiAgICAgIGdldFVSSTogLT4gcGF0aFRvUmVwb0ZpbGVcbiAgICBdXG5cbiAgY29tbWl0UGFuZTpcbiAgICBpc0FsaXZlOiAtPiB0cnVlXG4gICAgZGVzdHJveTogLT4gbW9ja3MudGV4dEVkaXRvci5kZXN0cm95KClcbiAgICBzcGxpdFJpZ2h0OiAtPiB1bmRlZmluZWRcbiAgICBnZXRJdGVtczogLT4gW1xuICAgICAgZ2V0VVJJOiAtPiBQYXRoLmpvaW4gbW9ja3MucmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRydcbiAgICBdXG5cbiAgdGV4dEVkaXRvcjpcbiAgICBnZXRQYXRoOiAtPiBwYXRoVG9SZXBvRmlsZVxuICAgIGdldFVSSTogLT4gcGF0aFRvUmVwb0ZpbGVcbiAgICBvbkRpZERlc3Ryb3k6IChAZGVzdHJveSkgLT5cbiAgICAgIGRpc3Bvc2U6IC0+XG4gICAgb25EaWRTYXZlOiAoQHNhdmUpIC0+XG4gICAgICBkaXNwb3NlOiAtPiB1bmRlZmluZWRcbiJdfQ==
