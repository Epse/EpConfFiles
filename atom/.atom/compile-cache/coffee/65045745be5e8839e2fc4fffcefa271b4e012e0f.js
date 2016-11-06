(function() {
  var config, path;

  path = require("path");

  config = require("../lib/config");

  describe("config", function() {
    describe(".set", function() {
      it("get user modified value", function() {
        atom.config.set("markdown-writer.test", "special");
        return expect(config.get("test")).toEqual("special");
      });
      return it("set key and value", function() {
        config.set("test", "value");
        return expect(atom.config.get("markdown-writer.test")).toEqual("value");
      });
    });
    describe(".get", function() {
      it("get value from default", function() {
        return expect(config.get("fileExtension")).toEqual(".markdown");
      });
      it("get value from engine config", function() {
        config.set("siteEngine", "jekyll");
        return expect(config.get("codeblock.before")).toEqual(config.getEngine("codeblock.before"));
      });
      it("get value from default if engine is invalid", function() {
        config.set("siteEngine", "not-exists");
        return expect(config.get("codeblock.before")).toEqual(config.getDefault("codeblock.before"));
      });
      it("get value from user config", function() {
        config.set("codeblock.before", "changed");
        return expect(config.get("codeblock.before")).toEqual("changed");
      });
      it("get value from user config even if the config is empty string", function() {
        config.set("codeblock.before", "");
        return expect(config.get("codeblock.before")).toEqual("");
      });
      it("get value from default config if the config is empty string but not allow blank", function() {
        config.set("codeblock.before", "");
        return expect(config.get("codeblock.before", {
          allow_blank: false
        })).toEqual(config.getDefault("codeblock.before"));
      });
      return it("get value from default config if user config is undefined", function() {
        config.set("codeblock.before", void 0);
        expect(config.get("codeblock.before")).toEqual(config.getDefault("codeblock.before"));
        config.set("codeblock.before", null);
        return expect(config.get("codeblock.before")).toEqual(config.getDefault("codeblock.before"));
      });
    });
    describe(".getFiletype", function() {
      var originalgetActiveTextEditor;
      originalgetActiveTextEditor = atom.workspace.getActiveTextEditor;
      afterEach(function() {
        return atom.workspace.getActiveTextEditor = originalgetActiveTextEditor;
      });
      it("get value from filestyle config", function() {
        atom.workspace.getActiveTextEditor = function() {
          return {
            getGrammar: function() {
              return {
                scopeName: "source.asciidoc"
              };
            }
          };
        };
        expect(config.getFiletype("linkInlineTag")).not.toBeNull();
        return expect(config.getFiletype("siteEngine")).not.toBeDefined();
      });
      return it("get value from invalid filestyle config", function() {
        atom.workspace.getActiveTextEditor = function() {
          return {
            getGrammar: function() {
              return {
                scopeName: null
              };
            }
          };
        };
        return expect(config.getEngine("siteEngine")).not.toBeDefined();
      });
    });
    describe(".getEngine", function() {
      it("get value from engine config", function() {
        config.set("siteEngine", "jekyll");
        expect(config.getEngine("codeblock.before")).not.toBeNull();
        return expect(config.getEngine("imageTag")).not.toBeDefined();
      });
      return it("get value from invalid engine config", function() {
        config.set("siteEngine", "not-exists");
        return expect(config.getEngine("imageTag")).not.toBeDefined();
      });
    });
    describe(".getProject", function() {
      var originalGetProjectConfigFile;
      originalGetProjectConfigFile = config.getProjectConfigFile;
      afterEach(function() {
        return config.getProjectConfigFile = originalGetProjectConfigFile;
      });
      it("get value when file found", function() {
        config.getProjectConfigFile = function() {
          return path.resolve(__dirname, "fixtures", "dummy.cson");
        };
        return expect(config.getProject("imageTag")).toEqual("imageTag");
      });
      it("get empty when file is empty", function() {
        config.getProjectConfigFile = function() {
          return path.resolve(__dirname, "fixtures", "empty.cson");
        };
        return expect(config.getProject("imageTag")).not.toBeDefined();
      });
      return it("get empty when file is not found", function() {
        config.getProjectConfigFile = function() {
          return path.resolve(__dirname, "fixtures", "notfound.cson");
        };
        return expect(config.getProject("imageTag")).not.toBeDefined();
      });
    });
    return describe(".getSampleConfigFile", function() {
      return it("get the config file path", function() {
        var configPath;
        configPath = path.join("lib", "config.cson");
        return expect(config.getSampleConfigFile()).toContain(configPath);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL2NvbmZpZy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxZQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQURULENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsSUFBQSxRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLFNBQXhDLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBUCxDQUEwQixDQUFDLE9BQTNCLENBQW1DLFNBQW5DLEVBRjRCO01BQUEsQ0FBOUIsQ0FBQSxDQUFBO2FBSUEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsTUFBWCxFQUFtQixPQUFuQixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixDQUFQLENBQStDLENBQUMsT0FBaEQsQ0FBd0QsT0FBeEQsRUFGc0I7TUFBQSxDQUF4QixFQUxlO0lBQUEsQ0FBakIsQ0FBQSxDQUFBO0FBQUEsSUFTQSxRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixT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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/config-spec.coffee
