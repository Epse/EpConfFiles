(function() {
  var config, exec, fs, md5, process;

  exec = require("child_process");

  process = require("process");

  config = require("../config.coffee");

  md5 = require('md5');

  fs = require('fs');

  module.exports = {
    data: {
      methods: [],
      autocomplete: [],
      composer: null
    },
    currentProcesses: [],

    /**
     * Executes a command to PHP proxy
     * @param  {string}  command  Command to execute
     * @param  {boolean} async    Must be async or not
     * @param  {array}   options  Options for the command
     * @param  {boolean} noparser Do not use php/parser.php
     * @return {array}           Json of the response
     */
    execute: function(command, async, options, noparser) {
      var args, c, commandData, directory, err, i, j, len, len1, processKey, ref, res, stdout;
      if (!options) {
        options = {};
      }
      processKey = command.join("_");
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        for (j = 0, len1 = command.length; j < len1; j++) {
          c = command[j];
          c.replace(/\\/g, '\\\\');
        }
        if (!async) {
          try {
            if (this.currentProcesses[processKey] == null) {
              this.currentProcesses[processKey] = true;
              args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
              if (noparser) {
                args = command;
              }
              console.log(args);
              stdout = exec.spawnSync(config.config.php, args, options).output[1].toString('ascii');
              delete this.currentProcesses[processKey];
              if (noparser) {
                res = {
                  result: stdout
                };
              } else {
                res = JSON.parse(stdout);
              }
            }
          } catch (error1) {
            err = error1;
            console.log(err);
            res = {
              error: err
            };
          }
          if (!res) {
            return [];
          }
          if (res.error != null) {
            this.printError(res.error);
          }
          return res;
        } else {
          if (this.currentProcesses[processKey] == null) {
            if (processKey.indexOf("--refresh") !== -1) {
              config.statusInProgress.update("Indexing...", true);
            }
            args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
            if (noparser) {
              args = command;
            }
            this.currentProcesses[processKey] = exec.spawn(config.config.php, args, options);
            this.currentProcesses[processKey].on("exit", (function(_this) {
              return function(exitCode) {
                return delete _this.currentProcesses[processKey];
              };
            })(this));
            commandData = '';
            this.currentProcesses[processKey].stdout.on("data", (function(_this) {
              return function(data) {
                return commandData += data.toString();
              };
            })(this));
            this.currentProcesses[processKey].on("close", (function(_this) {
              return function() {
                if (processKey.indexOf("--functions") !== -1) {
                  _this.data.functions = JSON.parse(commandData);
                }
                if (processKey.indexOf("--refresh") !== -1) {
                  return config.statusInProgress.update("Indexing...", false);
                }
              };
            })(this));
          }
        }
      }
    },

    /**
     * Reads an index by its name (file in indexes/index.[name].json)
     * @param {string} name Name of the index to read
     */
    readIndex: function(name) {
      var crypt, directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        crypt = md5(directory.path);
        path = __dirname + "/../../indexes/" + crypt + "/index." + name + ".json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
          return [];
        }
        options = {
          encoding: 'UTF-8'
        };
        return JSON.parse(fs.readFileSync(path, options));
        break;
      }
    },

    /**
     * Open and read the composer.json file in the current folder
     */
    readComposer: function() {
      var directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        path = directory.path + "/composer.json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
          continue;
        }
        options = {
          encoding: 'UTF-8'
        };
        this.data.composer = JSON.parse(fs.readFileSync(path, options));
        return this.data.composer;
      }
      console.log('Unable to find composer.json file or to open it. The plugin will not work as expected. It only works on composer project');
      throw "Error";
    },

    /**
     * Throw a formatted error
     * @param {object} error Error to show
     */
    printError: function(error) {
      var message;
      this.data.error = true;
      return message = error.message;
    },

    /**
     * Clear all cache of the plugin
     */
    clearCache: function() {
      this.data = {
        error: false,
        autocomplete: [],
        methods: [],
        composer: null
      };
      return this.functions();
    },

    /**
     * Autocomplete for classes name
     * @return {array}
     */
    classes: function() {
      return this.readIndex('classes');
    },

    /**
     * Returns composer.json file
     * @return {Object}
     */
    composer: function() {
      return this.readComposer();
    },

    /**
     * Autocomplete for internal PHP constants
     * @return {array}
     */
    constants: function() {
      var res;
      if (this.data.constants == null) {
        res = this.execute(["--constants"], false);
        this.data.constants = res;
      }
      return this.data.constants;
    },

    /**
     * Autocomplete for internal PHP functions
     *
     * @return {array}
     */
    functions: function() {
      if (this.data.functions == null) {
        this.execute(["--functions"], true);
      }
      return this.data.functions;
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    methods: function(className) {
      var res;
      if (this.data.methods[className] == null) {
        res = this.execute(["--methods", "" + className], false);
        this.data.methods[className] = res;
      }
      return this.data.methods[className];
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    autocomplete: function(className, name) {
      var cacheKey, res;
      cacheKey = className + "." + name;
      if (this.data.autocomplete[cacheKey] == null) {
        res = this.execute(["--autocomplete", className, name], false);
        this.data.autocomplete[cacheKey] = res;
      }
      return this.data.autocomplete[cacheKey];
    },

    /**
     * Returns params from the documentation of the given function
     *
     * @param {string} className
     * @param {string} functionName
     */
    docParams: function(className, functionName) {
      var res;
      res = this.execute(["--doc-params", "" + className, "" + functionName], false);
      return res;
    },

    /**
     * Refresh the full index or only for the given classPath
     * @param  {string} classPath Full path (dir) of the class to refresh
     */
    refresh: function(classPath) {
      if (classPath == null) {
        return this.execute(["--refresh"], true);
      } else {
        return this.execute(["--refresh", "" + classPath], true);
      }
    },

    /**
     * Method called on plugin activation
     */
    init: function() {
      this.refresh();
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return editor.onDidSave(function(event) {
            var classPath, directory, i, len, path, ref;
            if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
              _this.clearCache();
              path = event.path;
              ref = atom.project.getDirectories();
              for (i = 0, len = ref.length; i < len; i++) {
                directory = ref[i];
                if (path.indexOf(directory.path) === 0) {
                  classPath = path.substr(0, directory.path.length + 1);
                  path = path.substr(directory.path.length + 1);
                  break;
                }
              }
              return _this.refresh(classPath + path.replace(/\\/g, '/'));
            }
          });
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binPhp', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      return atom.config.onDidChange('atom-autocomplete-php.autoloadPaths', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFDSTtNQUFBLE9BQUEsRUFBUyxFQUFUO01BQ0EsWUFBQSxFQUFjLEVBRGQ7TUFFQSxRQUFBLEVBQVUsSUFGVjtLQURKO0lBS0EsZ0JBQUEsRUFBa0IsRUFMbEI7O0FBT0E7Ozs7Ozs7O0lBUUEsT0FBQSxFQUFTLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsT0FBakIsRUFBMEIsUUFBMUI7QUFDTCxVQUFBO01BQUEsSUFBZ0IsQ0FBSSxPQUFwQjtRQUFBLE9BQUEsR0FBVSxHQUFWOztNQUNBLFVBQUEsR0FBYSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7QUFFYjtBQUFBLFdBQUEscUNBQUE7O0FBQ0ksYUFBQSwyQ0FBQTs7VUFDSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFESjtRQUdBLElBQUcsQ0FBSSxLQUFQO0FBQ0k7WUFFSSxJQUFPLHlDQUFQO2NBQ0ksSUFBQyxDQUFBLGdCQUFpQixDQUFBLFVBQUEsQ0FBbEIsR0FBZ0M7Y0FFaEMsSUFBQSxHQUFRLENBQUMsU0FBQSxHQUFZLHVCQUFiLEVBQXVDLFNBQVMsQ0FBQyxJQUFqRCxDQUFzRCxDQUFDLE1BQXZELENBQThELE9BQTlEO2NBQ1Is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Q0FBQTtRQUQyRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0Q7SUExQkUsQ0F2T047O0FBUEoiLCJzb3VyY2VzQ29udGVudCI6WyJleGVjID0gcmVxdWlyZSBcImNoaWxkX3Byb2Nlc3NcIlxucHJvY2VzcyA9IHJlcXVpcmUgXCJwcm9jZXNzXCJcbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWcuY29mZmVlXCJcbm1kNSA9IHJlcXVpcmUgJ21kNSdcbmZzID0gcmVxdWlyZSAnZnMnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkYXRhOlxuICAgICAgICBtZXRob2RzOiBbXSxcbiAgICAgICAgYXV0b2NvbXBsZXRlOiBbXSxcbiAgICAgICAgY29tcG9zZXI6IG51bGxcblxuICAgIGN1cnJlbnRQcm9jZXNzZXM6IFtdXG5cbiAgICAjIyMqXG4gICAgICogRXhlY3V0ZXMgYSBjb21tYW5kIHRvIFBIUCBwcm94eVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gIGNvbW1hbmQgIENvbW1hbmQgdG8gZXhlY3V0ZVxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IGFzeW5jICAgIE11c3QgYmUgYXN5bmMgb3Igbm90XG4gICAgICogQHBhcmFtICB7YXJyYXl9ICAgb3B0aW9ucyAgT3B0aW9ucyBmb3IgdGhlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBub3BhcnNlciBEbyBub3QgdXNlIHBocC9wYXJzZXIucGhwXG4gICAgICogQHJldHVybiB7YXJyYXl9ICAgICAgICAgICBKc29uIG9mIHRoZSByZXNwb25zZVxuICAgICMjI1xuICAgIGV4ZWN1dGU6IChjb21tYW5kLCBhc3luYywgb3B0aW9ucywgbm9wYXJzZXIpIC0+XG4gICAgICAgIG9wdGlvbnMgPSB7fSBpZiBub3Qgb3B0aW9uc1xuICAgICAgICBwcm9jZXNzS2V5ID0gY29tbWFuZC5qb2luKFwiX1wiKVxuXG4gICAgICAgIGZvciBkaXJlY3RvcnkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgICAgIGZvciBjIGluIGNvbW1hbmRcbiAgICAgICAgICAgICAgICBjLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcblxuICAgICAgICAgICAgaWYgbm90IGFzeW5jXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICMgYXZvaWQgbXVsdGlwbGUgcHJvY2Vzc2VzIG9mIHRoZSBzYW1lIGNvbW1hbmRcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldP1xuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0gPSB0cnVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSAgW19fZGlybmFtZSArIFwiLy4uLy4uL3BocC9wYXJzZXIucGhwXCIsICBkaXJlY3RvcnkucGF0aF0uY29uY2F0KGNvbW1hbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3BhcnNlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBjb21tYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRvdXQgPSBleGVjLnNwYXduU3luYyhjb25maWcuY29uZmlnLnBocCwgYXJncywgb3B0aW9ucykub3V0cHV0WzFdLnRvU3RyaW5nKCdhc2NpaScpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3BhcnNlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogc3Rkb3V0XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gSlNPTi5wYXJzZShzdGRvdXQpXG4gICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVyclxuICAgICAgICAgICAgICAgICAgICByZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyclxuXG4gICAgICAgICAgICAgICAgaWYgIXJlc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW11cblxuICAgICAgICAgICAgICAgIGlmIHJlcy5lcnJvcj9cbiAgICAgICAgICAgICAgICAgICAgQHByaW50RXJyb3IocmVzLmVycm9yKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XT9cbiAgICAgICAgICAgICAgICAgICAgaWYgcHJvY2Vzc0tleS5pbmRleE9mKFwiLS1yZWZyZXNoXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RhdHVzSW5Qcm9ncmVzcy51cGRhdGUoXCJJbmRleGluZy4uLlwiLCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSAgW19fZGlybmFtZSArIFwiLy4uLy4uL3BocC9wYXJzZXIucGhwXCIsICBkaXJlY3RvcnkucGF0aF0uY29uY2F0KGNvbW1hbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vcGFyc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gY29tbWFuZFxuXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldID0gZXhlYy5zcGF3bihjb25maWcuY29uZmlnLnBocCwgYXJncywgb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0ub24oXCJleGl0XCIsIChleGl0Q29kZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XVxuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5vbihcImNsb3NlXCIsICgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwcm9jZXNzS2V5LmluZGV4T2YoXCItLWZ1bmN0aW9uc1wiKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYXRhLmZ1bmN0aW9ucyA9IEpTT04ucGFyc2UoY29tbWFuZERhdGEpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHByb2Nlc3NLZXkuaW5kZXhPZihcIi0tcmVmcmVzaFwiKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zdGF0dXNJblByb2dyZXNzLnVwZGF0ZShcIkluZGV4aW5nLi4uXCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAjIyMqXG4gICAgICogUmVhZHMgYW4gaW5kZXggYnkgaXRzIG5hbWUgKGZpbGUgaW4gaW5kZXhlcy9pbmRleC5bbmFtZV0uanNvbilcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIG9mIHRoZSBpbmRleCB0byByZWFkXG4gICAgIyMjXG4gICAgcmVhZEluZGV4OiAobmFtZSkgLT5cbiAgICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgICAgICAgY3J5cHQgPSBtZDUoZGlyZWN0b3J5LnBhdGgpXG4gICAgICAgICAgICBwYXRoID0gX19kaXJuYW1lICsgXCIvLi4vLi4vaW5kZXhlcy9cIiArIGNyeXB0ICsgXCIvaW5kZXguXCIgKyBuYW1lICsgXCIuanNvblwiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGgsIGZzLkZfT0sgfCBmcy5SX09LKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdXG5cbiAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiAnVVRGLTgnXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aCwgb3B0aW9ucykpXG5cbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAjIyMqXG4gICAgICogT3BlbiBhbmQgcmVhZCB0aGUgY29tcG9zZXIuanNvbiBmaWxlIGluIHRoZSBjdXJyZW50IGZvbGRlclxuICAgICMjI1xuICAgIHJlYWRDb21wb3NlcjogKCkgLT5cbiAgICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgICAgICAgcGF0aCA9IFwiI3tkaXJlY3RvcnkucGF0aH0vY29tcG9zZXIuanNvblwiXG5cbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyB8IGZzLlJfT0spXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICBlbmNvZGluZzogJ1VURi04J1xuICAgICAgICAgICAgQGRhdGEuY29tcG9zZXIgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLCBvcHRpb25zKSlcbiAgICAgICAgICAgIHJldHVybiBAZGF0YS5jb21wb3NlclxuXG4gICAgICAgIGNvbnNvbGUubG9nICdVbmFibGUgdG8gZmluZCBjb21wb3Nlci5qc29uIGZpbGUgb3IgdG8gb3BlbiBpdC4gVGhlIHBsdWdpbiB3aWxsIG5vdCB3b3JrIGFzIGV4cGVjdGVkLiBJdCBvbmx5IHdvcmtzIG9uIGNvbXBvc2VyIHByb2plY3QnXG4gICAgICAgIHRocm93IFwiRXJyb3JcIlxuXG4gICAgIyMjKlxuICAgICAqIFRocm93IGEgZm9ybWF0dGVkIGVycm9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGVycm9yIEVycm9yIHRvIHNob3dcbiAgICAjIyNcbiAgICBwcmludEVycm9yOihlcnJvcikgLT5cbiAgICAgICAgQGRhdGEuZXJyb3IgPSB0cnVlXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG5cbiAgICAgICAgI2lmIGVycm9yLmZpbGU/IGFuZCBlcnJvci5saW5lP1xuICAgICAgICAgICAgI21lc3NhZ2UgPSBtZXNzYWdlICsgJyBbZnJvbSBmaWxlICcgKyBlcnJvci5maWxlICsgJyAtIExpbmUgJyArIGVycm9yLmxpbmUgKyAnXSdcblxuICAgICAgICAjdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpXG5cbiAgICAjIyMqXG4gICAgICogQ2xlYXIgYWxsIGNhY2hlIG9mIHRoZSBwbHVnaW5cbiAgICAjIyNcbiAgICBjbGVhckNhY2hlOiAoKSAtPlxuICAgICAgICBAZGF0YSA9XG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBhdXRvY29tcGxldGU6IFtdLFxuICAgICAgICAgICAgbWV0aG9kczogW10sXG4gICAgICAgICAgICBjb21wb3NlcjogbnVsbFxuXG4gICAgICAgICMgRmlsbCB0aGUgZnVuY3Rpb25zIGFycmF5IGJlY2F1c2UgaXQgY2FuIHRha2UgdGltZXNcbiAgICAgICAgQGZ1bmN0aW9ucygpXG5cbiAgICAjIyMqXG4gICAgICogQXV0b2NvbXBsZXRlIGZvciBjbGFzc2VzIG5hbWVcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBjbGFzc2VzOiAoKSAtPlxuICAgICAgICByZXR1cm4gQHJlYWRJbmRleCgnY2xhc3NlcycpXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBjb21wb3Nlci5qc29uIGZpbGVcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgIyMjXG4gICAgY29tcG9zZXI6ICgpIC0+XG4gICAgICAgIHJldHVybiBAcmVhZENvbXBvc2VyKClcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIGludGVybmFsIFBIUCBjb25zdGFudHNcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBjb25zdGFudHM6ICgpIC0+XG4gICAgICAgIGlmIG5vdCBAZGF0YS5jb25zdGFudHM/XG4gICAgICAgICAgICByZXMgPSBAZXhlY3V0ZShbXCItLWNvbnN0YW50c1wiXSwgZmFsc2UpXG4gICAgICAgICAgICBAZGF0YS5jb25zdGFudHMgPSByZXNcblxuICAgICAgICByZXR1cm4gQGRhdGEuY29uc3RhbnRzXG5cbiAgICAjIyMqXG4gICAgICogQXV0b2NvbXBsZXRlIGZvciBpbnRlcm5hbCBQSFAgZnVuY3Rpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBmdW5jdGlvbnM6ICgpIC0+XG4gICAgICAgIGlmIG5vdCBAZGF0YS5mdW5jdGlvbnM/XG4gICAgICAgICAgICBAZXhlY3V0ZShbXCItLWZ1bmN0aW9uc1wiXSwgdHJ1ZSlcblxuICAgICAgICByZXR1cm4gQGRhdGEuZnVuY3Rpb25zXG5cbiAgICAjIyMqXG4gICAgICogQXV0b2NvbXBsZXRlIGZvciBtZXRob2RzICYgcHJvcGVydGllcyBvZiBhIGNsYXNzXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgY29tcGxldGUgbmFtZSAod2l0aCBuYW1lc3BhY2UpXG4gICAgICogQHJldHVybiB7YXJyYXl9XG4gICAgIyMjXG4gICAgbWV0aG9kczogKGNsYXNzTmFtZSkgLT5cbiAgICAgICAgaWYgbm90IEBkYXRhLm1ldGhvZHNbY2xhc3NOYW1lXT9cbiAgICAgICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tbWV0aG9kc1wiLFwiI3tjbGFzc05hbWV9XCJdLCBmYWxzZSlcbiAgICAgICAgICAgIEBkYXRhLm1ldGhvZHNbY2xhc3NOYW1lXSA9IHJlc1xuXG4gICAgICAgIHJldHVybiBAZGF0YS5tZXRob2RzW2NsYXNzTmFtZV1cblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIG1ldGhvZHMgJiBwcm9wZXJ0aWVzIG9mIGEgY2xhc3NcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBjb21wbGV0ZSBuYW1lICh3aXRoIG5hbWVzcGFjZSlcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBhdXRvY29tcGxldGU6IChjbGFzc05hbWUsIG5hbWUpIC0+XG4gICAgICAgIGNhY2hlS2V5ID0gY2xhc3NOYW1lICsgXCIuXCIgKyBuYW1lXG5cbiAgICAgICAgaWYgbm90IEBkYXRhLmF1dG9jb21wbGV0ZVtjYWNoZUtleV0/XG4gICAgICAgICAgICByZXMgPSBAZXhlY3V0ZShbXCItLWF1dG9jb21wbGV0ZVwiLCBjbGFzc05hbWUsIG5hbWVdLCBmYWxzZSlcbiAgICAgICAgICAgIEBkYXRhLmF1dG9jb21wbGV0ZVtjYWNoZUtleV0gPSByZXNcblxuICAgICAgICByZXR1cm4gQGRhdGEuYXV0b2NvbXBsZXRlW2NhY2hlS2V5XVxuXG4gICAgIyMjKlxuICAgICAqIFJldHVybnMgcGFyYW1zIGZyb20gdGhlIGRvY3VtZW50YXRpb24gb2YgdGhlIGdpdmVuIGZ1bmN0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZVxuICAgICMjI1xuICAgIGRvY1BhcmFtczogKGNsYXNzTmFtZSwgZnVuY3Rpb25OYW1lKSAtPlxuICAgICAgICByZXMgPSBAZXhlY3V0ZShbXCItLWRvYy1wYXJhbXNcIiwgXCIje2NsYXNzTmFtZX1cIiwgXCIje2Z1bmN0aW9uTmFtZX1cIl0sIGZhbHNlKVxuICAgICAgICByZXR1cm4gcmVzXG5cbiAgICAjIyMqXG4gICAgICogUmVmcmVzaCB0aGUgZnVsbCBpbmRleCBvciBvbmx5IGZvciB0aGUgZ2l2ZW4gY2xhc3NQYXRoXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBjbGFzc1BhdGggRnVsbCBwYXRoIChkaXIpIG9mIHRoZSBjbGFzcyB0byByZWZyZXNoXG4gICAgIyMjXG4gICAgcmVmcmVzaDogKGNsYXNzUGF0aCkgLT5cbiAgICAgICAgaWYgbm90IGNsYXNzUGF0aD9cbiAgICAgICAgICAgIEBleGVjdXRlKFtcIi0tcmVmcmVzaFwiXSwgdHJ1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGV4ZWN1dGUoW1wiLS1yZWZyZXNoXCIsIFwiI3tjbGFzc1BhdGh9XCJdLCB0cnVlKVxuXG4gICAgIyMjKlxuICAgICAqIE1ldGhvZCBjYWxsZWQgb24gcGx1Z2luIGFjdGl2YXRpb25cbiAgICAjIyNcbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAcmVmcmVzaCgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkU2F2ZSgoZXZlbnQpID0+XG4gICAgICAgICAgICAgICMgT25seSAucGhwIGZpbGVcbiAgICAgICAgICAgICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUubWF0Y2ggL3RleHQuaHRtbC5waHAkL1xuICAgICAgICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuXG4gICAgICAgICAgICAgICAgICAjIEZvciBXaW5kb3dzIC0gUmVwbGFjZSBcXCBpbiBjbGFzcyBuYW1lc3BhY2UgdG8gLyBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAjIGNvbXBvc2VyIHVzZSAvIGluc3RlYWQgb2YgXFxcbiAgICAgICAgICAgICAgICAgIHBhdGggPSBldmVudC5wYXRoXG4gICAgICAgICAgICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICAgaWYgcGF0aC5pbmRleE9mKGRpcmVjdG9yeS5wYXRoKSA9PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzUGF0aCA9IHBhdGguc3Vic3RyKDAsIGRpcmVjdG9yeS5wYXRoLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHIoZGlyZWN0b3J5LnBhdGgubGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAgIEByZWZyZXNoKGNsYXNzUGF0aCArIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpKVxuICAgICAgICAgICAgKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluUGhwJywgKCkgPT5cbiAgICAgICAgICAgIEBjbGVhckNhY2hlKClcblxuICAgICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXRvbS1hdXRvY29tcGxldGUtcGhwLmJpbkNvbXBvc2VyJywgKCkgPT5cbiAgICAgICAgICAgIEBjbGVhckNhY2hlKClcblxuICAgICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXRvbS1hdXRvY29tcGxldGUtcGhwLmF1dG9sb2FkUGF0aHMnLCAoKSA9PlxuICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuIl19
