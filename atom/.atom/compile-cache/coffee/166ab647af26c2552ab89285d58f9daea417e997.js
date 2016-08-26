(function() {
  var StatusInProgress, fs, namespace;

  fs = require('fs');

  namespace = require('./services/namespace.coffee');

  StatusInProgress = require("./services/status-in-progress.coffee");

  module.exports = {
    config: {},
    statusInProgress: null,

    /**
     * Get plugin configuration
     */
    getConfig: function() {
      this.config['php_documentation_base_url'] = {
        functions: 'https://secure.php.net/function.'
      };
      this.config['composer'] = atom.config.get('atom-autocomplete-php.binComposer');
      this.config['php'] = atom.config.get('atom-autocomplete-php.binPhp');
      this.config['autoload'] = atom.config.get('atom-autocomplete-php.autoloadPaths');
      this.config['classmap'] = atom.config.get('atom-autocomplete-php.classMapFiles');
      this.config['packagePath'] = atom.packages.resolvePackagePath('atom-autocomplete-php');
      this.config['verboseErrors'] = atom.config.get('atom-autocomplete-php.verboseErrors');
      return this.config['insertNewlinesForUseStatements'] = atom.config.get('atom-autocomplete-php.insertNewlinesForUseStatements');
    },

    /**
     * Writes configuration in "php lib" folder
     */
    writeConfig: function() {
      var classmap, classmaps, file, files, text, _i, _j, _len, _len1, _ref, _ref1;
      this.getConfig();
      files = "";
      _ref = this.config.autoload;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        files += "'" + file + "',";
      }
      classmaps = "";
      _ref1 = this.config.classmap;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        classmap = _ref1[_j];
        classmaps += "'" + classmap + "',";
      }
      text = "<?php $config = array( 'composer' => '" + this.config.composer + "', 'php' => '" + this.config.php + "', 'autoload' => array(" + files + "), 'classmap' => array(" + classmaps + ") );";
      return fs.writeFileSync(this.config.packagePath + '/php/tmp.php', text);
    },

    /**
     * Tests the user's PHP and Composer configuration.
     * @return {bool}
     */
    testConfig: function(interactive) {
      var errorMessage, errorTitle, exec, testResult;
      this.getConfig();
      exec = require("child_process");
      testResult = exec.spawnSync(this.config.php, ["-v"]);
      errorTitle = 'atom-autocomplete-php - Incorrect setup!';
      errorMessage = 'Either PHP or Composer is not correctly set up and as a result PHP autocompletion will not work. ' + 'Please visit the settings screen to correct this error. If you are not specifying an absolute path for PHP or ' + 'Composer, make sure they are in your PATH.';
      if (testResult.status = null || testResult.status !== 0) {
        atom.notifications.addError(errorTitle, {
          'detail': errorMessage
        });
        return false;
      }
      testResult = exec.spawnSync(this.config.php, [this.config.composer, "--version"]);
      if (testResult.status = null || testResult.status !== 0) {
        testResult = exec.spawnSync(this.config.composer, ["--version"]);
        if (testResult.status = null || testResult.status !== 0) {
          atom.notifications.addError(errorTitle, {
            'detail': errorMessage
          });
          return false;
        }
      }
      if (interactive) {
        atom.notifications.addSuccess('atom-autocomplete-php - Success', {
          'detail': 'Configuration OK !'
        });
      }
      return true;
    },

    /**
     * Init function called on package activation
     * Register config events and write the first config
     */
    init: function() {
      this.statusInProgress = new StatusInProgress;
      this.statusInProgress.hide();
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:namespace': (function(_this) {
          return function() {
            return namespace.createNamespace(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:configuration': (function(_this) {
          return function() {
            return _this.testConfig(true);
          };
        })(this)
      });
      this.writeConfig();
      atom.config.onDidChange('atom-autocomplete-php.binPhp', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.autoloadPaths', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.classMapFiles', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.verboseErrors', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
      return atom.config.onDidChange('atom-autocomplete-php.insertNewlinesForUseStatements', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2NvbmZpZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0NBQVIsQ0FGbkIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRUk7QUFBQSxJQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsSUFDQSxnQkFBQSxFQUFrQixJQURsQjtBQUdBO0FBQUE7O09BSEE7QUFBQSxJQU1BLFNBQUEsRUFBVyxTQUFBLEdBQUE7QUFFUCxNQUFBLElBQUMsQ0FBQSxNQUFPLENBQUEsNEJBQUEsQ0FBUixHQUF3QztBQUFBLFFBQ3BDLFNBQUEsRUFBVyxrQ0FEeUI7T0FBeEMsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUp0QixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLENBTGpCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxNQUFPLENBQUEsVUFBQSxDQUFSLEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FOdEIsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0s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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/config.coffee
