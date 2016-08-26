(function() {
  var CSON, defaults, engines, packagePath, path, prefix, sampleConfigFile;

  CSON = require("season");

  path = require("path");

  prefix = "markdown-writer";

  packagePath = atom.packages.resolvePackagePath("markdown-writer");

  sampleConfigFile = packagePath ? path.join(packagePath, "lib", "config.cson") : path.join(__dirname, "config.cson");

  defaults = CSON.readFileSync(sampleConfigFile);

  defaults["siteEngine"] = "general";

  defaults["projectConfigFile"] = "_mdwriter.cson";

  defaults["siteLinkPath"] = path.join(atom.getConfigDirPath(), "" + prefix + "-links.cson");

  defaults["grammars"] = ['source.gfm', 'source.litcoffee', 'text.md', 'text.plain', 'text.plain.null-grammar'];

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
      _ref = ["Project", "User", "Engine", "Default"];
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
    getEngine: function(key) {
      var engine;
      engine = this.getProject("siteEngine") || this.getUser("siteEngine") || this.getDefault("siteEngine");
      return this._valueForKeyPath(engines[engine] || {}, key);
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
      return sampleConfigFile;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbmZpZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0VBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxpQkFIVCxDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWQsQ0FBaUMsaUJBQWpDLENBSmQsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQ0ssV0FBSCxHQUFvQixJQUFJLENBQUMsSUFBTCxDQUFVLFdBQVYsRUFBdUIsS0FBdkIsRUFBOEIsYUFBOUIsQ0FBcEIsR0FDSyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsYUFBckIsQ0FQUCxDQUFBOztBQUFBLEVBVUEsUUFBQSxHQUFXLElBQUksQ0FBQyxZQUFMLENBQWtCLGdCQUFsQixDQVZYLENBQUE7O0FBQUEsRUFhQSxRQUFTLENBQUEsWUFBQSxDQUFULEdBQXlCLFNBYnpCLENBQUE7O0FBQUEsRUFnQkEsUUFBUyxDQUFBLG1CQUFBLENBQVQsR0FBZ0MsZ0JBaEJoQyxDQUFBOztBQUFBLEVBbUJBLFFBQVMsQ0FBQSxjQUFBLENBQVQsR0FBMkIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUFWLEVBQW1DLEVBQUEsR0FBRyxNQUFILEdBQVUsYUFBN0MsQ0FuQjNCLENBQUE7O0FBQUEsRUFxQkEsUUFBUyxDQUFBLFVBQUEsQ0FBVCxHQUF1QixDQUNyQixZQURxQixFQUVyQixrQkFGcUIsRUFHckIsU0FIcUIsRUFJckIsWUFKcUIsRUFL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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/config.coffee
