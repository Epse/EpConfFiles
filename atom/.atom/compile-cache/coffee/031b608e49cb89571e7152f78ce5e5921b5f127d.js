(function() {
  var AnnotationManager, AutocompletionManager, GotoManager, StatusInProgress, TooltipManager, config, parser, plugins, proxy;

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

  AutocompletionManager = require("./autocompletion/autocompletion-manager.coffee");

  StatusInProgress = require("./services/status-in-progress.coffee");

  config = require('./config.coffee');

  proxy = require('./services/php-proxy.coffee');

  parser = require('./services/php-file-parser.coffee');

  plugins = require('./services/plugin-manager.coffee');

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
      config.testConfig();
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
      config.statusInProgress.attach();
      config.statusErrorAutocomplete.initialize(statusBar);
      return config.statusErrorAutocomplete.attach();
    },
    consumePlugin: function(plugin) {
      return plugins.plugins.push(plugin);
    },
    provideAutocompleteTools: function() {
      this.services = {
        proxy: proxy,
        parser: parser
      };
      return this.services;
    },
    getProvider: function() {
      return this.autocompletionManager.getProviders();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvcGVla21vLXBocC1hdG9tLWF1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsNEJBQVI7O0VBQ2QsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBQ2pCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3Q0FBUjs7RUFDcEIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLGdEQUFSOztFQUN4QixnQkFBQSxHQUFtQixPQUFBLENBQVEsc0NBQVI7O0VBQ25CLE1BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSw2QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG1DQUFSOztFQUNULE9BQUEsR0FBVSxPQUFBLENBQVEsa0NBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFDSTtNQUFBLFdBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyx5QkFBUDtRQUNBLFdBQUEsRUFBYSx1SUFEYjtRQUdBLElBQUEsRUFBTSxRQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyx5QkFKVDtRQUtBLEtBQUEsRUFBTyxDQUxQO09BREo7TUFRQSxNQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSxtR0FEYjtRQUdBLElBQUEsRUFBTSxRQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUpUO1FBS0EsS0FBQSxFQUFPLENBTFA7T0FUSjtNQWdCQSxhQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxXQUFBLEVBQWEsNktBRGI7UUFHQSxJQUFBLEVBQU0sT0FITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxxQkFBRCxFQUF3QixjQUF4QixDQUpUO1FBS0EsS0FBQSxFQUFPLENBTFA7T0FqQko7TUF3QkEsYUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLGdCQUFQO1FBQ0EsV0FBQSxFQUFhLGdLQURiO1FBR0EsSUFBQSxFQUFNLE9BSE47UUFJQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsdUNBQUQsRUFBMEMseUJBQTFDLENBSlQ7UUFLQSxLQUFBLEVBQU8sQ0FMUDtPQXpCSjtNQWdDQSw4QkFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLHFDQUFQO1FBQ0EsV0FBQSxFQUFhLHVRQURiO1FBSUEsSUFBQSxFQUFNLFNBSk47UUFLQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBTFQ7UUFNQSxLQUFBLEVBQU8sQ0FOUDtPQWpDSjtNQXlDQSxhQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sOEJBQVA7UUFDQSxXQUFBLEVBQWEsa0pBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BMUNKO0tBREo7SUFpREEsUUFBQSxFQUFVLFNBQUE7TUFDTixNQUFNLENBQUMsVUFBUCxDQUFBO01BQ0EsTUFBTSxDQUFDLElBQVAsQ0FBQTtNQUVBLElBQUMsQ0FBQSxxQkFBRCxHQUE2QixJQUFBLHFCQUFBLENBQUE7TUFDN0IsSUFBQyxDQUFBLHFCQUFxQixDQUFDLElBQXZCLENBQUE7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFdBQUEsQ0FBQTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsY0FBQSxDQUFBO01BQ3RCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxpQkFBRCxHQUF5QixJQUFBLGlCQUFBLENBQUE7TUFDekIsSUFBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQUE7YUFFQSxLQUFLLENBQUMsSUFBTixDQUFBO0lBaEJNLENBakRWO0lBbUVBLFVBQUEsRUFBWSxTQUFBO01BQ1IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7TUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLFVBQWhCLENBQUE7TUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsVUFBbkIsQ0FBQTthQUNBLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxVQUF2QixDQUFBO0lBSlEsQ0FuRVo7SUF5RUEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFEO01BQ2QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQXhCLENBQW1DLFNBQW5DO01BQ0EsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQXhCLENBQUE7TUFFQSxNQUFNLENBQUMsdUJBQXVCLENBQUMsVUFBL0IsQ0FBMEMsU0FBMUM7YUFDQSxNQUFNLENBQUMsdUJBQXVCLENBQUMsTUFBL0IsQ0FBQTtJQUxjLENBekVsQjtJQWdGQSxhQUFBLEVBQWUsU0FBQyxNQUFEO2FBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFoQixDQUFxQixNQUFyQjtJQURXLENBaEZmO0lBbUZBLHdCQUFBLEVBQTBCLFNBQUE7TUFDdEIsSUFBQyxDQUFBLFFBQUQsR0FDSTtRQUFBLEtBQUEsRUFBTyxLQUFQO1FBQ0EsTUFBQSxFQUFRLE1BRFI7O0FBR0osYUFBTyxJQUFDLENBQUE7SUFMYyxDQW5GMUI7SUEwRkEsV0FBQSxFQUFhLFNBQUE7QUFDVCxhQUFPLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxZQUF2QixDQUFBO0lBREUsQ0ExRmI7O0FBWEoiLCJzb3VyY2VzQ29udGVudCI6WyJHb3RvTWFuYWdlciA9IHJlcXVpcmUgXCIuL2dvdG8vZ290by1tYW5hZ2VyLmNvZmZlZVwiXG5Ub29sdGlwTWFuYWdlciA9IHJlcXVpcmUgXCIuL3Rvb2x0aXAvdG9vbHRpcC1tYW5hZ2VyLmNvZmZlZVwiXG5Bbm5vdGF0aW9uTWFuYWdlciA9IHJlcXVpcmUgXCIuL2Fubm90YXRpb24vYW5ub3RhdGlvbi1tYW5hZ2VyLmNvZmZlZVwiXG5BdXRvY29tcGxldGlvbk1hbmFnZXIgPSByZXF1aXJlIFwiLi9hdXRvY29tcGxldGlvbi9hdXRvY29tcGxldGlvbi1tYW5hZ2VyLmNvZmZlZVwiXG5TdGF0dXNJblByb2dyZXNzID0gcmVxdWlyZSBcIi4vc2VydmljZXMvc3RhdHVzLWluLXByb2dyZXNzLmNvZmZlZVwiXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5wcm94eSA9IHJlcXVpcmUgJy4vc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZSdcbnBhcnNlciA9IHJlcXVpcmUgJy4vc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyLmNvZmZlZSdcbnBsdWdpbnMgPSByZXF1aXJlICcuL3NlcnZpY2VzL3BsdWdpbi1tYW5hZ2VyLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGNvbmZpZzpcbiAgICAgICAgYmluQ29tcG9zZXI6XG4gICAgICAgICAgICB0aXRsZTogJ0NvbW1hbmQgdG8gdXNlIGNvbXBvc2VyJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGlzIHBsdWdpbiBkZXBlbmRzIG9uIGNvbXBvc2VyIGluIG9yZGVyIHRvIHdvcmsuIFNwZWNpZnkgdGhlIHBhdGhcbiAgICAgICAgICAgICB0byB5b3VyIGNvbXBvc2VyIGJpbiAoZS5nIDogYmluL2NvbXBvc2VyLCBjb21wb3Nlci5waGFyLCBjb21wb3NlciknXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJy91c3IvbG9jYWwvYmluL2NvbXBvc2VyJ1xuICAgICAgICAgICAgb3JkZXI6IDFcblxuICAgICAgICBiaW5QaHA6XG4gICAgICAgICAgICB0aXRsZTogJ0NvbW1hbmQgcGhwJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGlzIHBsdWdpbiB1c2UgcGhwIENMSSBpbiBvcmRlciB0byB3b3JrLiBQbGVhc2Ugc3BlY2lmeSB5b3VyIHBocFxuICAgICAgICAgICAgIGNvbW1hbmQgKFwicGhwXCIgb24gVU5JWCBzeXN0ZW1zKSdcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBkZWZhdWx0OiAncGhwJ1xuICAgICAgICAgICAgb3JkZXI6IDJcblxuICAgICAgICBhdXRvbG9hZFBhdGhzOlxuICAgICAgICAgICAgdGl0bGU6ICdBdXRvbG9hZGVyIGZpbGUnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlbGF0aXZlIHBhdGggdG8gdGhlIGZpbGVzIG9mIGF1dG9sb2FkLnBocCBmcm9tIGNvbXBvc2VyIChvciBhbiBvdGhlciBvbmUpLiBZb3UgY2FuIHNwZWNpZnkgbXVsdGlwbGVcbiAgICAgICAgICAgICBwYXRocyAoY29tbWEgc2VwYXJhdGVkKSBpZiB5b3UgaGF2ZSBkaWZmZXJlbnQgcGF0aHMgZm9yIHNvbWUgcHJvamVjdHMuJ1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgICAgICAgZGVmYXVsdDogWyd2ZW5kb3IvYXV0b2xvYWQucGhwJywgJ2F1dG9sb2FkLnBocCddXG4gICAgICAgICAgICBvcmRlcjogM1xuXG4gICAgICAgIGNsYXNzTWFwRmlsZXM6XG4gICAgICAgICAgICB0aXRsZTogJ0NsYXNzbWFwIGZpbGVzJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxhdGl2ZSBwYXRoIHRvIHRoZSBmaWxlcyB0aGF0IGNvbnRhaW5zIGEgY2xhc3NtYXAgKGFycmF5IHdpdGggXCJjbGFzc05hbWVcIiA9PiBcImZpbGVOYW1lXCIpLiBCeSBkZWZhdWx0XG4gICAgICAgICAgICAgb24gY29tcG9zZXIgaXRcXCdzIHZlbmRvci9jb21wb3Nlci9hdXRvbG9hZF9jbGFzc21hcC5waHAnXG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknXG4gICAgICAgICAgICBkZWZhdWx0OiBbJ3ZlbmRvci9jb21wb3Nlci9hdXRvbG9hZF9jbGFzc21hcC5waHAnLCAnYXV0b2xvYWQvZXpwX2tlcm5lbC5waHAnXVxuICAgICAgICAgICAgb3JkZXI6IDRcblxuICAgICAgICBpbnNlcnROZXdsaW5lc0ZvclVzZVN0YXRlbWVudHM6XG4gICAgICAgICAgICB0aXRsZTogJ0luc2VydCBuZXdsaW5lcyBmb3IgdXNlIHN0YXRlbWVudHMuJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGVuIGVuYWJsZWQsIHRoZSBwbHVnaW4gd2lsbCBhZGQgYWRkaXRpb25hbCBuZXdsaW5lcyBiZWZvcmUgb3IgYWZ0ZXIgYW4gYXV0b21hdGljYWxseSBhZGRlZFxuICAgICAgICAgICAgICAgIHVzZSBzdGF0ZW1lbnQgd2hlbiBpdCBjYW5cXCd0IGFkZCB0aGVtIG5pY2VseSB0byBhbiBleGlzdGluZyBncm91cC4gVGhpcyByZXN1bHRzIGluIG1vcmUgY2xlYW5seVxuICAgICAgICAgICAgICAgIHNlcGFyYXRlZCB1c2Ugc3RhdGVtZW50cyBidXQgd2lsbCBjcmVhdGUgYWRkaXRpb25hbCB2ZXJ0aWNhbCB3aGl0ZXNwYWNlLidcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiA1XG5cbiAgICAgICAgdmVyYm9zZUVycm9yczpcbiAgICAgICAgICAgIHRpdGxlOiAnRXJyb3JzIG9uIGZpbGUgc2F2aW5nIHNob3dlZCdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBlbmFibGVkLCB5b3VcXCdsbCBoYXZlIGEgbm90aWZpY2F0aW9uIG9uY2UgYW4gZXJyb3Igb2NjdXJlZCBvbiBhdXRvY29tcGxldGUuIE90aGVyd2lzZSwgdGhlIG1lc3NhZ2Ugd2lsbCBqdXN0IGJlIGxvZ2dlZCBpbiBkZXZlbG9wZXIgY29uc29sZSdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiA2XG5cbiAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgY29uZmlnLnRlc3RDb25maWcoKVxuICAgICAgICBjb25maWcuaW5pdCgpXG5cbiAgICAgICAgQGF1dG9jb21wbGV0aW9uTWFuYWdlciA9IG5ldyBBdXRvY29tcGxldGlvbk1hbmFnZXIoKVxuICAgICAgICBAYXV0b2NvbXBsZXRpb25NYW5hZ2VyLmluaXQoKVxuXG4gICAgICAgIEBnb3RvTWFuYWdlciA9IG5ldyBHb3RvTWFuYWdlcigpXG4gICAgICAgIEBnb3RvTWFuYWdlci5pbml0KClcblxuICAgICAgICBAdG9vbHRpcE1hbmFnZXIgPSBuZXcgVG9vbHRpcE1hbmFnZXIoKVxuICAgICAgICBAdG9vbHRpcE1hbmFnZXIuaW5pdCgpXG5cbiAgICAgICAgQGFubm90YXRpb25NYW5hZ2VyID0gbmV3IEFubm90YXRpb25NYW5hZ2VyKClcbiAgICAgICAgQGFubm90YXRpb25NYW5hZ2VyLmluaXQoKVxuXG4gICAgICAgIHByb3h5LmluaXQoKVxuXG4gICAgZGVhY3RpdmF0ZTogLT5cbiAgICAgICAgQGdvdG9NYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBAdG9vbHRpcE1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBhbm5vdGF0aW9uTWFuYWdlci5kZWFjdGl2YXRlKClcbiAgICAgICAgQGF1dG9jb21wbGV0aW9uTWFuYWdlci5kZWFjdGl2YXRlKClcblxuICAgIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgICAgIGNvbmZpZy5zdGF0dXNJblByb2dyZXNzLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgICAgICBjb25maWcuc3RhdHVzSW5Qcm9ncmVzcy5hdHRhY2goKVxuXG4gICAgICAgIGNvbmZpZy5zdGF0dXNFcnJvckF1dG9jb21wbGV0ZS5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICAgICAgY29uZmlnLnN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlLmF0dGFjaCgpXG5cbiAgICBjb25zdW1lUGx1Z2luOiAocGx1Z2luKSAtPlxuICAgICAgICBwbHVnaW5zLnBsdWdpbnMucHVzaChwbHVnaW4pXG5cbiAgICBwcm92aWRlQXV0b2NvbXBsZXRlVG9vbHM6IC0+XG4gICAgICAgIEBzZXJ2aWNlcyA9XG4gICAgICAgICAgICBwcm94eTogcHJveHlcbiAgICAgICAgICAgIHBhcnNlcjogcGFyc2VyXG5cbiAgICAgICAgcmV0dXJuIEBzZXJ2aWNlc1xuXG4gICAgZ2V0UHJvdmlkZXI6IC0+XG4gICAgICAgIHJldHVybiBAYXV0b2NvbXBsZXRpb25NYW5hZ2VyLmdldFByb3ZpZGVycygpXG4iXX0=
