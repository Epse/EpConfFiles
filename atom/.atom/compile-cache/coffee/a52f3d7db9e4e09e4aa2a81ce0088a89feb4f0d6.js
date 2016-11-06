(function() {
  var CSON, defaults, engines, filetypes, getConfigFile, packagePath, path, prefix,
    __slice = [].slice;

  CSON = require("season");

  path = require("path");

  prefix = "markdown-writer";

  packagePath = atom.packages.resolvePackagePath("markdown-writer");

  getConfigFile = function() {
    var parts;
    parts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (packagePath) {
      return path.join.apply(path, [packagePath, "lib"].concat(__slice.call(parts)));
    } else {
      return path.join.apply(path, [__dirname].concat(__slice.call(parts)));
    }
  };

  defaults = CSON.readFileSync(getConfigFile("config.cson"));

  defaults["siteEngine"] = "general";

  defaults["projectConfigFile"] = "_mdwriter.cson";

  defaults["siteLinkPath"] = path.join(atom.getConfigDirPath(), "" + prefix + "-links.cson");

  defaults["grammars"] = ['source.gfm', 'source.gfm.nvatom', 'source.litcoffee', 'source.asciidoc', 'text.md', 'text.plain', 'text.plain.null-grammar'];

  filetypes = {
    'source.asciidoc': CSON.readFileSync(getConfigFile("filetypes", "asciidoc.cson"))
  };

  engines = {
    html: {
      imageTag: "<a href=\"{site}/{slug}.html\" target=\"_blank\">\n  <img class=\"align{align}\" alt=\"{alt}\" src=\"{src}\" width=\"{width}\" height=\"{height}\" />\n</a>"
    },
    jekyll: {
      textStyles: {
        codeblock: {
          before: "{% highlight %}\n",
          after: "\n{% endhighlight %}",
          regexBefore: "{% highlight(?: .+)? %}\n",
          regexAfter: "\n{% endhighlight %}"
        }
      }
    },
    octopress: {
      imageTag: "{% img {align} {src} {width} {height} '{alt}' %}"
    },
    hexo: {
      newPostFileName: "{title}{extension}",
      frontMatter: "layout: \"{layout}\"\ntitle: \"{title}\"\ndate: \"{date}\"\n---"
    }
  };

  module.exports = {
    projectConfigs: {},
    engineNames: function() {
      return Object.keys(engines);
    },
    keyPath: function(key) {
      return "" + prefix + "." + key;
    },
    get: function(key, options) {
      var allow_blank, config, val, _i, _len, _ref;
      if (options == null) {
        options = {};
      }
      allow_blank = options["allow_blank"] != null ? options["allow_blank"] : true;
      _ref = ["Project", "User", "Engine", "Filetype", "Default"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        config = _ref[_i];
        val = this["get" + config](key);
        if (allow_blank) {
          if (val != null) {
            return val;
          }
        } else {
          if (val) {
            return val;
          }
        }
      }
    },
    set: function(key, val) {
      return atom.config.set(this.keyPath(key), val);
    },
    restoreDefault: function(key) {
      return atom.config.unset(this.keyPath(key));
    },
    getDefault: function(key) {
      return this._valueForKeyPath(defaults, key);
    },
    getFiletype: function(key) {
      var editor, filetypeConfig;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return void 0;
      }
      filetypeConfig = filetypes[editor.getGrammar().scopeName];
      if (filetypeConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(filetypeConfig, key);
    },
    getEngine: function(key) {
      var engine, engineConfig;
      engine = this.getProject("siteEngine") || this.getUser("siteEngine") || this.getDefault("siteEngine");
      engineConfig = engines[engine];
      if (engineConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(engineConfig, key);
    },
    getCurrentDefault: function(key) {
      return this.getEngine(key) || this.getDefault(key);
    },
    getUser: function(key) {
      return atom.config.get(this.keyPath(key), {
        sources: [atom.config.getUserConfigPath()]
      });
    },
    getProject: function(key) {
      var config, configFile;
      configFile = this.getProjectConfigFile();
      if (!configFile) {
        return;
      }
      config = this._loadProjectConfig(configFile);
      return this._valueForKeyPath(config, key);
    },
    getSampleConfigFile: function() {
      return getConfigFile("config.cson");
    },
    getProjectConfigFile: function() {
      var fileName, projectPath;
      if (!atom.project || atom.project.getPaths().length < 1) {
        return;
      }
      projectPath = atom.project.getPaths()[0];
      fileName = this.getUser("projectConfigFile") || this.getDefault("projectConfigFile");
      return path.join(projectPath, fileName);
    },
    _loadProjectConfig: function(configFile) {
      var error;
      if (this.projectConfigs[configFile]) {
        return this.projectConfigs[configFile];
      }
      try {
        return this.projectConfigs[configFile] = CSON.readFileSync(configFile) || {};
      } catch (_error) {
        error = _error;
        if (atom.inDevMode() && !/ENOENT/.test(error.message)) {
          console.info("Markdown Writer [config.coffee]: " + error);
        }
        return this.projectConfigs[configFile] = {};
      }
    },
    _valueForKeyPath: function(object, keyPath) {
      var key, keys, _i, _len;
      keys = keyPath.split(".");
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        object = object[key];
        if (object == null) {
          return;
        }
      }
      return object;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29uZmlnLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0RUFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsaUJBSFQsQ0FBQTs7QUFBQSxFQUlBLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQWlDLGlCQUFqQyxDQUpkLENBQUE7O0FBQUEsRUFLQSxhQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFFBQUEsS0FBQTtBQUFBLElBRGUsK0RBQ2YsQ0FBQTtBQUFBLElBQUEsSUFBRyxXQUFIO2FBQW9CLElBQUksQ0FBQyxJQUFMLGFBQVUsQ0FBQSxXQUFBLEVBQWEsS0FBTyxTQUFBLGFBQUEsS0FBQSxDQUFBLENBQTlCLEVBQXBCO0tBQUEsTUFBQTthQUNLLElBQUksQ0FBQyxJQUFMLGFBQVUsQ0FBQSxTQUFXLFNBQUEsYUFBQSxLQUFBLENBQUEsQ0FBckIsRUFETDtLQURjO0VBQUEsQ0FMaEIsQ0FBQTs7QUFBQSxFQVVBLFFBQUEsR0FBVyxJQUFJLENBQUMsWUFBTCxDQUFrQixhQUFBLENBQWMsYUFBZCxDQUFsQixDQVZYLENBQUE7O0FBQUEsRUFhQSxRQUFTLENBQUEsWUFBQSxDQUFULEdBQXlCLFNBYnpCLENBQUE7O0FBQUEsRUFnQkEsUUFBUyxDQUFBLG1CQUFBLENBQVQsR0FBZ0MsZ0JBaEJoQyxDQUFBOztBQUFBLEVBbUJBLFFBQVMsQ0FBQSxjQUFBLENBQVQsR0FBMkIsSUFBSSxDQUFDLElBQUws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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/config.coffee
