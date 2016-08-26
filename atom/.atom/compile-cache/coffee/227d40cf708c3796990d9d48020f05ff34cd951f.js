(function() {
  var CreateProjectConfigs, config, fs;

  fs = require("fs-plus");

  config = require("../config");

  module.exports = CreateProjectConfigs = (function() {
    function CreateProjectConfigs() {}

    CreateProjectConfigs.prototype.trigger = function() {
      var configFile, content, err;
      configFile = config.getProjectConfigFile();
      if (!this.inProjectFolder(configFile)) {
        return;
      }
      if (this.fileExists(configFile)) {
        return;
      }
      content = fs.readFileSync(config.getSampleConfigFile());
      err = fs.writeFileSync(configFile, content);
      if (!err) {
        return atom.workspace.open(configFile);
      }
    };

    CreateProjectConfigs.prototype.inProjectFolder = function(configFile) {
      if (configFile) {
        return true;
      }
      atom.confirm({
        message: "[Markdown Writer] Error!",
        detailedMessage: "Cannot create file if you are not in a project folder.",
        buttons: ['OK']
      });
      return false;
    };

    CreateProjectConfigs.prototype.fileExists = function(configFile) {
      var exists;
      exists = fs.existsSync(configFile);
      if (exists) {
        atom.confirm({
          message: "[Markdown Writer] Error!",
          detailedMessage: "Project config file already exists:\n" + configFile,
          buttons: ['OK']
        });
      }
      return exists;
    };

    return CreateProjectConfigs;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbW1hbmRzL2NyZWF0ZS1wcm9qZWN0LWNvbmZpZ3MuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUixDQUZULENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO3NDQUNKOztBQUFBLG1DQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHdCQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLG9CQUFQLENBQUEsQ0FBYixDQUFBO0FBRUEsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLGVBQUQsQ0FBaUIsVUFBakIsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUZBO0FBR0EsTUFBQSxJQUFVLElBQUMsQ0FBQSxVQUFELENBQVksVUFBWixDQUFWO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFBQSxNQUtBLE9BQUEsR0FBVSxFQUFFLENBQUMsWUFBSCxDQUFnQixNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFoQixDQUxWLENBQUE7QUFBQSxNQU1BLEdBQUEsR0FBTSxFQUFFLENBQUMsYUFBSCxDQUFpQixVQUFqQixFQUE2QixPQUE3QixDQU5OLENBQUE7QUFRQSxNQUFBLElBQUEsQ0FBQSxHQUFBO2VBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBQUE7T0FUTztJQUFBLENBQVQsQ0FBQTs7QUFBQSxtQ0FXQSxlQUFBLEdBQWlCLFNBQUMsVUFBRCxHQUFBO0FBQ2YsTUFBQSxJQUFlLFVBQWY7QUFBQSxlQUFPLElBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsT0FBTCxDQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsMEJBQVQ7QUFBQSxRQUNBLGVBQUEsRUFBaUIsd0RBRGpCO0FBQUEsUUFFQSxPQUFBLEVBQVMsQ0FBQyxJQUFELENBRlQ7T0FERixDQURBLENBQUE7YUFLQSxNQU5lO0lBQUEsQ0FYakIsQ0FBQTs7QUFBQSxtQ0FtQkEsVUFBQSxHQUFZLFNBQUMsVUFBRCxHQUFBO0FBQ1YsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsRUFBRSxDQUFDLFVBQUgsQ0FBYyxVQUFkLENBQVQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxNQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsT0FBTCxDQUNFO0FBQUEsVUFBQSxPQUFBLEVBQVMsMEJBQVQ7QUFBQSxVQUNBLGVBQUEsRUFBa0IsdUNBQUEsR0FBdUMsVUFEekQ7QUFBQSxVQUVBLE9BQUEsRUFBUyxDQUFDLElBQUQsQ0FGVDtTQURGLENBQUEsQ0FERjtPQURBO2FBTUEsT0FQVTtJQUFBLENBbkJaLENBQUE7O2dDQUFBOztNQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/commands/create-project-configs.coffee
