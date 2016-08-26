(function() {
  var AnnotationManager, AutocompletionManager, GotoManager, StatusInProgress, TooltipManager, config, proxy;

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

  AutocompletionManager = require("./autocompletion/autocompletion-manager.coffee");

  StatusInProgress = require("./services/status-in-progress.coffee");

  config = require('./config.coffee');

  proxy = require('./services/php-proxy.coffee');

  module.exports = {
    config: {
      binComposer: {
        title: 'Command to use composer',
        description: 'This plugin depends on composer in order to work. Specify the path to your composer bin (e.g : bin/composer, composer.phar, composer)',
        type: 'string',
        "default": '/usr/local/bin/composer',
        order: 1
      },
      binPhp: {
        title: 'Command php',
        description: 'This plugin use php CLI in order to work. Please specify your php command ("php" on UNIX systems)',
        type: 'string',
        "default": 'php',
        order: 2
      },
      autoloadPaths: {
        title: 'Autoloader file',
        description: 'Relative path to the files of autoload.php from composer (or an other one). You can specify multiple paths (comma separated) if you have different paths for some projects.',
        type: 'array',
        "default": ['vendor/autoload.php', 'autoload.php'],
        order: 3
      },
      classMapFiles: {
        title: 'Classmap files',
        description: 'Relative path to the files that contains a classmap (array with "className" => "fileName"). By default on composer it\'s vendor/composer/autoload_classmap.php',
        type: 'array',
        "default": ['vendor/composer/autoload_classmap.php', 'autoload/ezp_kernel.php'],
        order: 4
      },
      insertNewlinesForUseStatements: {
        title: 'Insert newlines for use statements.',
        description: 'When enabled, the plugin will add additional newlines before or after an automatically added use statement when it can\'t add them nicely to an existing group. This results in more cleanly separated use statements but will create additional vertical whitespace.',
        type: 'boolean',
        "default": false,
        order: 5
      },
      verboseErrors: {
        title: 'Errors on file saving showed',
        description: 'When enabled, you\'ll have a notification once an error occured on autocomplete. Otherwise, the message will just be logged in developer console',
        type: 'boolean',
        "default": false,
        order: 6
      }
    },
    activate: function() {
      config.init();
      this.autocompletionManager = new AutocompletionManager();
      this.autocompletionManager.init();
      this.gotoManager = new GotoManager();
      this.gotoManager.init();
      this.tooltipManager = new TooltipManager();
      this.tooltipManager.init();
      this.annotationManager = new AnnotationManager();
      this.annotationManager.init();
      return proxy.init();
    },
    deactivate: function() {
      this.gotoManager.deactivate();
      this.tooltipManager.deactivate();
      this.annotationManager.deactivate();
      return this.autocompletionManager.deactivate();
    },
    consumeStatusBar: function(statusBar) {
      config.statusInProgress.initialize(statusBar);
      return config.statusInProgress.attach();
    },
    provideAutocompleteTools: function() {
      this.services = {
        proxy: proxy
      };
      return this.services;
    },
    getProvider: function() {
      return this.autocompletionManager.getProviders();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3BlZWttby1waHAtYXRvbS1hdXRvY29tcGxldGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNHQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQ0FBUixDQURqQixDQUFBOztBQUFBLEVBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdDQUFSLENBRnBCLENBQUE7O0FBQUEsRUFHQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsZ0RBQVIsQ0FIeEIsQ0FBQTs7QUFBQSxFQUlBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQ0FBUixDQUpuQixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUxULENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDZCQUFSLENBTlIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBRUk7QUFBQSxJQUFBLE1BQUEsRUFDSTtBQUFBLE1BQUEsV0FBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8seUJBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSx1SUFEYjtBQUFBLFFBR0EsSUFBQSxFQUFNLFFBSE47QUFBQSxRQUlBLFNBQUEsRUFBUyx5QkFKVDtBQUFBLFFBS0EsS0FBQSxFQUFPLENBTFA7T0FESjtBQUFBLE1BUUEsTUFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLG1HQURiO0FBQUEsUUFHQSxJQUFBLEVBQU0sUUFITjtBQUFBLFFBSUEsU0FBQSxFQUFTLEtBSlQ7QUFBQSxRQUtBLEtBQUEsRUFB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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/peekmo-php-atom-autocomplete.coffee
