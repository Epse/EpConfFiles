(function() {
  var fs, namespace;

  fs = require('fs');

  namespace = require('./services/namespace.coffee');

  module.exports = {
    config: {},

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
      return this.config['packagePath'] = atom.packages.resolvePackagePath('atom-autocomplete-php');
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
        atom.notifications.addError(errorTitle, {
          'detail': errorMessage
        });
        return false;
      } else if (interactive) {
        atom.notifications.addSuccess('atom-autocomplete-php - Success', {
          'detail': 'Configuration OK !'
        });
        return false;
      }
      return true;
    },

    /**
     * Init function called on package activation
     * Register config events and write the first config
     */
    init: function() {
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
      return atom.config.onDidChange('atom-autocomplete-php.classMapFiles', (function(_this) {
        return function() {
          return _this.writeConfig();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2NvbmZpZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxTQUFBLEdBQVksT0FBQSxDQUFRLDZCQUFSLENBRFosQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBRUk7QUFBQSxJQUFBLE1BQUEsRUFBUSxFQUFSO0FBRUE7QUFBQTs7T0FGQTtBQUFBLElBS0EsU0FBQSxFQUFXLFNBQUEsR0FBQTtBQUVQLE1BQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSw0QkFBQSxDQUFSLEdBQXdDO0FBQUEsUUFDcEMsU0FBQSxFQUFXLGtDQUR5QjtPQUF4QyxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBUixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCLENBSnRCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQSxDQUFSLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsQ0FMakIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxVQUFBLENBQVIsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQixDQU50QixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBUixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBUHRCLENBQUE7YUFRQSxJQUFDLENBQUEsTUFBTyxDQUFBLGFBQUEsQ0FBUixHQUF5QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQWlDLHVCQUFqQyxFQVZsQjtJQUFBLENBTFg7QUFpQkE7QUFBQTs7T0FqQkE7QUFBQSxJQW9CQSxXQUFBLEVBQWEsU0FBQSxHQUFBO0FBQ1QsVUFBQSx3RUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxFQUZSLENBQUE7QUFHQTtBQUFBLFdBQUEsMkNBQUE7d0JBQUE7QUFDSSxRQUFBLEtBQUEsSUFBVSxHQUFBLEdBQUcsSUFBSCxHQUFRLElBQWxCLENBREo7QUFBQSxPQUhBO0FBQUEsTUFNQSxTQUFBLEdBQVksRUFOWixDQUFBO0FBT0E7QUFBQSxXQUFBLDhDQUFBOzZCQUFBO0FBQ0ksUUFBQSxTQUFBLElBQWMsR0FBQSxHQUFHLFFBQUgsR0FBWSxJQUExQixDQURKO0FBQUEsT0FQQTtBQUFBLE1BVUEsSUFBQSxHQUFRLHdDQUFBLEdBRWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUZyQixHQUU4QixlQUY5QixHQUdRLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FIaEIsR0FHb0IseUJBSHBCLEdBSWtCLEtBSmxCLEdBSXdCLHlCQUp4QixHQUtrQixTQUxsQixHQUs0QixNQWZwQyxDQUFBO2FBbUJBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQixjQUF2QyxFQUF1RCxJQUF2RCxFQXBCUztJQUFBLENBcEJiO0FBMENBO0FBQUE7OztPQTFDQTtBQUFBLElBOENBLFVBQUEsRUFBWSxTQUFDLFdBQUQsR0FBQTtBQUNSLFVBQUEsMENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FGUCxDQUFBO0FBQUEsTUFHQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQXZCLEVBQTRCLENBQUMsSUFBRCxDQUE1QixDQUhiLENBQUE7QUFBQSxNQUtBLFVBQUEsR0FBYSwwQ0FMYixDQUFBO0FBQUEsTUFNQSxZQUFBLEdBQWUsbUdBQUEsR0FDYixnSEFEYSxHQUViLDRDQVJGLENBQUE7QUFVQSxNQUFBLElBQUcsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBQSxJQUFRLFVBQVUsQ0FBQyxNQUFYLEtBQXFCLENBQXBEO0FBQ0ksUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLFVBQTVCLEVBQXdDO0FBQUEsVUFBQyxRQUFBLEVBQVUsWUFBWDtTQUF4QyxDQUFBLENBQUE7QUFDQSxlQUFPLEtBQVAsQ0FGSjtPQVZBO0FBQUEsTUFlQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQXZCLEVBQTRCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFULEVBQW1CLFdBQW5CLENBQTVCLENBZmIsQ0FBQTtBQWlCQSxNQUFBLElBQUcsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBQSxJQUFRLFVBQVUsQ0FBQyxNQUFYLEtBQXFCLENBQXBEO0FBQ0ksUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLFVBQTVCLEVBQXdDO0FBQUEsVUFBQyxRQUFBLEVBQVUsWUFBWDtTQUF4QyxDQUFBLENBQUE7QUFDQSxlQUFPLEtBQVAsQ0FGSjtPQUFBLE1BR0ssSUFBRyxXQUFIO0FBQ0QsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLGlDQUE5QixFQUFpRTtBQUFBLFVBQUMsUUFBQSxFQUFVLG9CQUFYO1NBQWpFLENBQUEsQ0FBQTtBQUNBLGVBQU8sS0FBUCxDQUZDO09BcEJMO0FBd0JBLGFBQU8sSUFBUCxDQXpCUTtJQUFBLENBOUNaO0FBeUVBO0FBQUE7OztPQXpFQTtBQUFBLElBNkVBLElBQUEsRUFBTSxTQUFBLEdBQUE7QUFFRixNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxRQUFBLGlDQUFBLEVBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUNuRSxTQUFTLENBQUMsZUFBVixDQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBMUIsRUFEbUU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQztPQUFwQyxDQUFBLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxRQUFBLHFDQUFBLEVBQXVDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUN2RSxLQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFEdUU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QztPQUFwQyxDQUpBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FQQSxDQUFBO0FBQUEsTUFTQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsOEJBQXhCLEVBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BELEtBQUMsQ0FBQSxXQUFELENBQUEsRUFEb0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQVRBLENBQUE7QUFBQSxNQVlBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixtQ0FBeEIsRUFBNkQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDekQsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUR5RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdELENBWkEsQ0FBQTtBQUFBLE1BZUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHFDQUF4QixFQUErRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMzRCxLQUFDLENBQUEsV0FBRCxDQUFBLEVBRDJEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0QsQ0FmQSxDQUFBO2FBa0JBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixxQ0FBeEIsRUFBK0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDM0QsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUQyRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9ELEVBcEJFO0lBQUEsQ0E3RU47R0FMSixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/config.coffee
