(function() {
  var StatusErrorAutocomplete, StatusInProgress, fs, namespace;

  fs = require('fs');

  namespace = require('./services/namespace.coffee');

  StatusInProgress = require("./services/status-in-progress.coffee");

  StatusErrorAutocomplete = require("./services/status-error-autocomplete.coffee");

  module.exports = {
    config: {},
    statusInProgress: null,
    statusErrorAutocomplete: null,

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
      var classmap, classmaps, file, files, i, j, len, len1, ref, ref1, text;
      this.getConfig();
      files = "";
      ref = this.config.autoload;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        files += "'" + file + "',";
      }
      classmaps = "";
      ref1 = this.config.classmap;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        classmap = ref1[j];
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
      errorMessage = 'Either PHP or Composer is not correctly set up and as a result PHP autocompletion will not work. ' + 'Please visit the settings screen to correct this error. If you are not specifying an absolute path for PHP or ' + 'Composer, make sure they are in your PATH. Feel free to look package\'s README for configuration examples';
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
      this.statusErrorAutocomplete = new StatusErrorAutocomplete;
      this.statusErrorAutocomplete.hide();
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
          _this.writeConfig();
          return _this.testConfig(true);
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          _this.writeConfig();
          return _this.testConfig(true);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLFNBQUEsR0FBWSxPQUFBLENBQVEsNkJBQVI7O0VBQ1osZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNDQUFSOztFQUNuQix1QkFBQSxHQUEwQixPQUFBLENBQVEsNkNBQVI7O0VBRTFCLE1BQU0sQ0FBQyxPQUFQLEdBRUk7SUFBQSxNQUFBLEVBQVEsRUFBUjtJQUNBLGdCQUFBLEVBQWtCLElBRGxCO0lBRUEsdUJBQUEsRUFBeUIsSUFGekI7O0FBSUE7OztJQUdBLFNBQUEsRUFBVyxTQUFBO01BRVAsSUFBQyxDQUFBLE1BQU8sQ0FBQSw0QkFBQSxDQUFSLEdBQXdDO1FBQ3BDLFNBQUEsRUFBVyxrQ0FEeUI7O01BSXhDLElBQUMsQ0FBQSxNQUFPLENBQUEsVUFBQSxDQUFSLEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEI7TUFDdEIsSUFBQyxDQUFBLE1BQU8sQ0FBQSxLQUFBLENBQVIsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQjtNQUNqQixJQUFDLENBQUEsTUFBTyxDQUFBLFVBQUEsQ0FBUixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCO01BQ3RCLElBQUMsQ0FBQSxNQUFPLENBQUEsVUFBQSxDQUFSLEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEI7TUFDdEIsSUFBQyxDQUFBLE1BQU8sQ0FBQSxhQUFBLENBQVIsR0FBeUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyx1QkFBakM7TUFDekIs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QUFELENBQUE7UUFEMkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9EO01BR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHFDQUF4QixFQUErRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzNELEtBQUMsQ0FBQSxXQUFELENBQUE7UUFEMkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9EO2FBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHNEQUF4QixFQUFnRixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzVFLEtBQUMsQ0FBQSxXQUFELENBQUE7UUFENEU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhGO0lBbENFLENBdEZOOztBQVBKIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbm5hbWVzcGFjZSA9IHJlcXVpcmUgJy4vc2VydmljZXMvbmFtZXNwYWNlLmNvZmZlZSdcblN0YXR1c0luUHJvZ3Jlc3MgPSByZXF1aXJlIFwiLi9zZXJ2aWNlcy9zdGF0dXMtaW4tcHJvZ3Jlc3MuY29mZmVlXCJcblN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlID0gcmVxdWlyZSBcIi4vc2VydmljZXMvc3RhdHVzLWVycm9yLWF1dG9jb21wbGV0ZS5jb2ZmZWVcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBjb25maWc6IHt9XG4gICAgc3RhdHVzSW5Qcm9ncmVzczogbnVsbFxuICAgIHN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlOiBudWxsXG5cbiAgICAjIyMqXG4gICAgICogR2V0IHBsdWdpbiBjb25maWd1cmF0aW9uXG4gICAgIyMjXG4gICAgZ2V0Q29uZmlnOiAoKSAtPlxuICAgICAgICAjIFNlZSBhbHNvIGh0dHBzOi8vc2VjdXJlLnBocC5uZXQvdXJsaG93dG8ucGhwIC5cbiAgICAgICAgQGNvbmZpZ1sncGhwX2RvY3VtZW50YXRpb25fYmFzZV91cmwnXSA9IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uczogJ2h0dHBzOi8vc2VjdXJlLnBocC5uZXQvZnVuY3Rpb24uJ1xuICAgICAgICB9XG5cbiAgICAgICAgQGNvbmZpZ1snY29tcG9zZXInXSA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1hdXRvY29tcGxldGUtcGhwLmJpbkNvbXBvc2VyJylcbiAgICAgICAgQGNvbmZpZ1sncGhwJ10gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5iaW5QaHAnKVxuICAgICAgICBAY29uZmlnWydhdXRvbG9hZCddID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYXV0b2xvYWRQYXRocycpXG4gICAgICAgIEBjb25maWdbJ2NsYXNzbWFwJ10gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5jbGFzc01hcEZpbGVzJylcbiAgICAgICAgQGNvbmZpZ1sncGFja2FnZVBhdGgnXSA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdhdG9tLWF1dG9jb21wbGV0ZS1waHAnKVxuICAgICAgICBAY29uZmlnWyd2ZXJib3NlRXJyb3JzJ10gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXBocC52ZXJib3NlRXJyb3JzJylcbiAgICAgICAgQGNvbmZpZ1snaW5zZXJ0TmV3bGluZXNGb3JVc2VTdGF0ZW1lbnRzJ10gPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5pbnNlcnROZXdsaW5lc0ZvclVzZVN0YXRlbWVudHMnKVxuXG4gICAgIyMjKlxuICAgICAqIFdyaXRlcyBjb25maWd1cmF0aW9uIGluIFwicGhwIGxpYlwiIGZvbGRlclxuICAgICMjI1xuICAgIHdyaXRlQ29uZmlnOiAoKSAtPlxuICAgICAgICBAZ2V0Q29uZmlnKClcblxuICAgICAgICBmaWxlcyA9IFwiXCJcbiAgICAgICAgZm9yIGZpbGUgaW4gQGNvbmZpZy5hdXRvbG9hZFxuICAgICAgICAgICAgZmlsZXMgKz0gXCInI3tmaWxlfScsXCJcblxuICAgICAgICBjbGFzc21hcHMgPSBcIlwiXG4gICAgICAgIGZvciBjbGFzc21hcCBpbiBAY29uZmlnLmNsYXNzbWFwXG4gICAgICAgICAgICBjbGFzc21hcHMgKz0gXCInI3tjbGFzc21hcH0nLFwiXG5cbiAgICAgICAgdGV4dCA9IFwiPD9waHBcbiAgICAgICAgICAkY29uZmlnID0gYXJyYXkoXG4gICAgICAgICAgICAnY29tcG9zZXInID0+ICcje0Bjb25maWcuY29tcG9zZXJ9JyxcbiAgICAgICAgICAgICdwaHAnID0+ICcje0Bjb25maWcucGhwfScsXG4gICAgICAgICAgICAnYXV0b2xvYWQnID0+IGFycmF5KCN7ZmlsZXN9KSxcbiAgICAgICAgICAgICdjbGFzc21hcCcgPT4gYXJyYXkoI3tjbGFzc21hcHN9KVxuICAgICAgICAgICk7XG4gICAgICAgIFwiXG5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhAY29uZmlnLnBhY2thZ2VQYXRoICsgJy9waHAvdG1wLnBocCcsIHRleHQpXG5cbiAgICAjIyMqXG4gICAgICogVGVzdHMgdGhlIHVzZXIncyBQSFAgYW5kIENvbXBvc2VyIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHJldHVybiB7Ym9vbH1cbiAgICAjIyNcbiAgICB0ZXN0Q29uZmlnOiAoaW50ZXJhY3RpdmUpIC0+XG4gICAgICAgIEBnZXRDb25maWcoKVxuXG4gICAgICAgIGV4ZWMgPSByZXF1aXJlIFwiY2hpbGRfcHJvY2Vzc1wiXG4gICAgICAgIHRlc3RSZXN1bHQgPSBleGVjLnNwYXduU3luYyhAY29uZmlnLnBocCwgW1wiLXZcIl0pXG5cbiAgICAgICAgZXJyb3JUaXRsZSA9ICdhdG9tLWF1dG9jb21wbGV0ZS1waHAgLSBJbmNvcnJlY3Qgc2V0dXAhJ1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSAnRWl0aGVyIFBIUCBvciBDb21wb3NlciBpcyBub3QgY29ycmVjdGx5IHNldCB1cCBhbmQgYXMgYSByZXN1bHQgUEhQIGF1dG9jb21wbGV0aW9uIHdpbGwgbm90IHdvcmsuICcgK1xuICAgICAgICAgICdQbGVhc2UgdmlzaXQgdGhlIHNldHRpbmdzIHNjcmVlbiB0byBjb3JyZWN0IHRoaXMgZXJyb3IuIElmIHlvdSBhcmUgbm90IHNwZWNpZnlpbmcgYW4gYWJzb2x1dGUgcGF0aCBmb3IgUEhQIG9yICcgK1xuICAgICAgICAgICdDb21wb3NlciwgbWFrZSBzdXJlIHRoZXkgYXJlIGluIHlvdXIgUEFUSC5cbiAgICAgICAgICBGZWVsIGZyZWUgdG8gbG9vayBwYWNrYWdlXFwncyBSRUFETUUgZm9yIGNvbmZpZ3VyYXRpb24gZXhhbXBsZXMnXG5cbiAgICAgICAgaWYgdGVzdFJlc3VsdC5zdGF0dXMgPSBudWxsIG9yIHRlc3RSZXN1bHQuc3RhdHVzICE9IDBcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnJvclRpdGxlLCB7J2RldGFpbCc6IGVycm9yTWVzc2FnZX0pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAjIFRlc3QgQ29tcG9zZXIuXG4gICAgICAgIHRlc3RSZXN1bHQgPSBleGVjLnNwYXduU3luYyhAY29uZmlnLnBocCwgW0Bjb25maWcuY29tcG9zZXIsIFwiLS12ZXJzaW9uXCJdKVxuXG4gICAgICAgIGlmIHRlc3RSZXN1bHQuc3RhdHVzID0gbnVsbCBvciB0ZXN0UmVzdWx0LnN0YXR1cyAhPSAwXG4gICAgICAgICAgICB0ZXN0UmVzdWx0ID0gZXhlYy5zcGF3blN5bmMoQGNvbmZpZy5jb21wb3NlciwgW1wiLS12ZXJzaW9uXCJdKVxuXG4gICAgICAgICAgICAjIFRyeSBleGVjdXRpbmcgQ29tcG9zZXIgZGlyZWN0bHkuXG4gICAgICAgICAgICBpZiB0ZXN0UmVzdWx0LnN0YXR1cyA9IG51bGwgb3IgdGVzdFJlc3VsdC5zdGF0dXMgIT0gMFxuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnJvclRpdGxlLCB7J2RldGFpbCc6IGVycm9yTWVzc2FnZX0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgaWYgaW50ZXJhY3RpdmVcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdhdG9tLWF1dG9jb21wbGV0ZS1waHAgLSBTdWNjZXNzJywgeydkZXRhaWwnOiAnQ29uZmlndXJhdGlvbiBPSyAhJ30pXG5cbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICMjIypcbiAgICAgKiBJbml0IGZ1bmN0aW9uIGNhbGxlZCBvbiBwYWNrYWdlIGFjdGl2YXRpb25cbiAgICAgKiBSZWdpc3RlciBjb25maWcgZXZlbnRzIGFuZCB3cml0ZSB0aGUgZmlyc3QgY29uZmlnXG4gICAgIyMjXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQHN0YXR1c0luUHJvZ3Jlc3MgPSBuZXcgU3RhdHVzSW5Qcm9ncmVzc1xuICAgICAgICBAc3RhdHVzSW5Qcm9ncmVzcy5oaWRlKClcblxuICAgICAgICBAc3RhdHVzRXJyb3JBdXRvY29tcGxldGUgPSBuZXcgU3RhdHVzRXJyb3JBdXRvY29tcGxldGVcbiAgICAgICAgQHN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlLmhpZGUoKVxuXG4gICAgICAgICMgQ29tbWFuZCBmb3IgbmFtZXNwYWNlc1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1hdXRvY29tcGxldGUtcGhwOm5hbWVzcGFjZSc6ID0+XG4gICAgICAgICAgICBuYW1lc3BhY2UuY3JlYXRlTmFtZXNwYWNlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpXG5cbiAgICAgICAgIyBDb21tYW5kIHRvIHRlc3QgY29uZmlndXJhdGlvblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1hdXRvY29tcGxldGUtcGhwOmNvbmZpZ3VyYXRpb24nOiA9PlxuICAgICAgICAgICAgQHRlc3RDb25maWcodHJ1ZSlcblxuICAgICAgICBAd3JpdGVDb25maWcoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluUGhwJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG4gICAgICAgICAgICBAdGVzdENvbmZpZyh0cnVlKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluQ29tcG9zZXInLCAoKSA9PlxuICAgICAgICAgICAgQHdyaXRlQ29uZmlnKClcbiAgICAgICAgICAgIEB0ZXN0Q29uZmlnKHRydWUpXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5hdXRvbG9hZFBhdGhzJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5jbGFzc01hcEZpbGVzJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC52ZXJib3NlRXJyb3JzJywgKCkgPT5cbiAgICAgICAgICAgIEB3cml0ZUNvbmZpZygpXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5pbnNlcnROZXdsaW5lc0ZvclVzZVN0YXRlbWVudHMnLCAoKSA9PlxuICAgICAgICAgICAgQHdyaXRlQ29uZmlnKClcbiJdfQ==
