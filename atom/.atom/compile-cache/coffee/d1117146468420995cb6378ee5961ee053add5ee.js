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
    return describe(".getProject", function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy9jb25maWctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsWUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVIsQ0FEVCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLElBQUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxTQUF4QyxDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQVAsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxTQUFuQyxFQUY0QjtNQUFBLENBQTlCLENBQUEsQ0FBQTthQUlBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsQ0FBUCxDQUErQyxDQUFDLE9BQWhELENBQXdELE9BQXhELEVBRnNCO01BQUEsQ0FBeEIsRUFMZTtJQUFBLENBQWpCLENBQUEsQ0FBQTtBQUFBLElBU0EsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO2VBQzNCLE1B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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/config-spec.coffee
