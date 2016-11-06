(function() {
  var Path, head, mocks, pathToRepoFile;

  Path = require('flavored-path');

  pathToRepoFile = Path.get("~/some/repository/directory/file");

  head = jasmine.createSpyObj('head', ['replace']);

  module.exports = mocks = {
    pathToRepoFile: pathToRepoFile,
    pathToSampleDir: Path.get("~"),
    repo: {
      getPath: function() {
        return Path.join(this.getWorkingDirectory(), ".git");
      },
      getWorkingDirectory: function() {
        return Path.get("~/some/repository");
      },
      refreshStatus: function() {
        return void 0;
      },
      relativize: function(path) {
        if (path === pathToRepoFile) {
          return "directory/file";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvZml4dHVyZXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxrQ0FBVCxDQURqQixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE1BQXJCLEVBQTZCLENBQUMsU0FBRCxDQUE3QixDQUZQLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFBLEdBQ2Y7QUFBQSxJQUFBLGNBQUEsRUFBZ0IsY0FBaEI7QUFBQSxJQUNBLGVBQUEsRUFBaUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFULENBRGpCO0FBQUEsSUFHQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVYsRUFBc0MsTUFBdEMsRUFBSDtNQUFBLENBQVQ7QUFBQSxNQUNBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsbUJBQVQsRUFBSDtNQUFBLENBRHJCO0FBQUEsTUFFQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRmY7QUFBQSxNQUdBLFVBQUEsRUFBWSxTQUFDLElBQUQsR0FBQTtBQUFVLFFBQUEsSUFBb0IsSUFBQSxLQUFRLGNBQTVCO2lCQUFBLGlCQUFBO1NBQVY7TUFBQSxDQUhaO0FBQUEsTUFJQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQ2I7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUQsQ0FBUDtVQURhO01BQUEsQ0FKZjtBQUFBLE1BTUEsWUFBQSxFQUFjLFNBQUEsR0FBQTtlQUFHLGFBQUg7TUFBQSxDQU5kO0FBQUEsTUFPQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtlQUFHLE1BQUg7TUFBQSxDQVBoQjtBQUFBLE1BUUEsSUFBQSxFQUNFO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixTQUFDLElBQUQsR0FBQTtpQkFBVSxPQUFWO1FBQUEsQ0FBbEI7T0FURjtLQUpGO0FBQUEsSUFlQSxXQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQURWO0FBQUEsTUFFQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRlQ7QUFBQSxNQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7ZUFBRztVQUNYO0FBQUEsWUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBO3FCQUFHLGVBQUg7WUFBQSxDQUFSO1dBRFc7VUFBSDtNQUFBLENBSFY7S0FoQkY7QUFBQSxJQXVCQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsT0FBQSxFQUFTLFNBQUEsR0FBQTtlQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBakIsQ0FBQSxFQUFIO01BQUEsQ0FEVDtBQUFBLE1BRUEsVUFBQSxFQUFZLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQUZaO0FBQUEsTUFHQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2VBQUc7VUFDWDtBQUFBLFlBQUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtxQkFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBWCxDQUFBLENBQVYsRUFBZ0MsZ0JBQWhDLEVBQUg7WUFBQSxDQUFSO1dBRFc7VUFBSDtNQUFBLENBSFY7S0F4QkY7QUFBQSxJQStCQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxlQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtlQUFHLGVBQUg7TUFBQSxDQURSO0FBQUEsTUFFQSxZQUFBLEVBQWMsU0FBRSxPQUFGLEdBQUE7QUFDWixRQURhLElBQUMsQ0FBQSxVQUFBLE9BQ2QsQ0FBQTtlQUFBO0FBQUEsVUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBLENBQVQ7VUFEWTtNQUFBLENBRmQ7QUFBQSxNQUlBLFNBQUEsRUFBVyxTQUFFLElBQUYsR0FBQTtBQUNULFFBRFUsSUFBQyxDQUFBLE9BQUEsSUFDWCxDQUFBO2VBQUE7QUFBQSxVQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7bUJBQUcsT0FBSDtVQUFBLENBQVQ7VUFEUztNQUFBLENBSlg7S0FoQ0Y7R0FMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/git-plus/spec/fixtures.coffee
