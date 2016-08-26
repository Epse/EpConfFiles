(function() {
  var AnnotationManager, ClassProvider, ConstantProvider, FunctionProvider, GotoManager, MemberProvider, TooltipManager, VariableProvider, config, proxy;

  ClassProvider = require("./providers/class-provider.coffee");

  MemberProvider = require("./providers/member-provider.coffee");

  ConstantProvider = require("./providers/constant-provider.coffee");

  FunctionProvider = require("./providers/function-provider.coffee");

  VariableProvider = require("./providers/variable-provider.coffee");

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

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
      }
    },
    providers: [],
    activate: function() {
      config.init();
      this.registerProviders();
      this.gotoManager = new GotoManager();
      this.gotoManager.init();
      this.tooltipManager = new TooltipManager();
      this.tooltipManager.init();
      this.annotationManager = new AnnotationManager();
      this.annotationManager.init();
      return proxy.init();
    },
    deactivate: function() {
      this.providers = [];
      this.gotoManager.deactivate();
      this.tooltipManager.deactivate();
      return this.annotationManager.deactivate();
    },
    registerProviders: function() {
      var err;
      this.providers.push(new ConstantProvider());
      this.providers.push(new VariableProvider());
      this.providers.push(new FunctionProvider());
      try {
        proxy.composer();
      } catch (_error) {
        err = _error;
        console.log("No composer");
      }
      this.providers.push(new ClassProvider());
      return this.providers.push(new MemberProvider());
    },
    getProvider: function() {
      return this.providers;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3BlZWttby1waHAtYXRvbS1hdXRvY29tcGxldGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtKQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUNBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9DQUFSLENBRGpCLENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0NBQVIsQ0FGbkIsQ0FBQTs7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQ0FBUixDQUhuQixDQUFBOztBQUFBLEVBSUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNDQUFSLENBSm5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLDRCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSLENBUGpCLENBQUE7O0FBQUEsRUFRQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0NBQVIsQ0FScEIsQ0FBQTs7QUFBQSxFQVVBLE1BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FWVCxDQUFBOztBQUFBLEVBV0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSw2QkFBUixDQVhSLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUVJO0FBQUEsSUFBQSxNQUFBLEVBQ0k7QUFBQSxNQUFBLFdBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLHlCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsdUlBRGI7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMseUJBSlQ7QUFBQSxRQUtBLEtBQUEsRUFBTyxD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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/peekmo-php-atom-autocomplete.coffee
