(function() {
  var config, currentProcesses, data, exec, execute, fs, md5, printError, process, readComposer, readIndex;

  exec = require("child_process");

  process = require("process");

  config = require("../config.coffee");

  md5 = require('md5');

  fs = require('fs');

  data = {
    methods: [],
    autocomplete: [],
    composer: null
  };

  currentProcesses = [];


  /**
   * Executes a command to PHP proxy
   * @param  {string}  command Command to exectue
   * @param  {boolean} async   Must be async or not
   * @return {array}           Json of the response
   */

  execute = function(command, async) {
    var c, directory, err, res, stdout, _i, _j, _len, _len1, _ref;
    _ref = atom.project.getDirectories();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      directory = _ref[_i];
      if (!async) {
        for (_j = 0, _len1 = command.length; _j < _len1; _j++) {
          c = command[_j];
          c.replace(/\\/g, '\\\\');
        }
        try {
          if (currentProcesses[command] == null) {
            currentProcesses[command] = true;
            stdout = exec.spawnSync(config.config.php, [__dirname + "/../../php/parser.php", directory.path].concat(command)).output[1].toString('ascii');
            delete currentProcesses[command];
            res = JSON.parse(stdout);
          }
        } catch (_error) {
          err = _error;
          console.log(err);
          res = {
            error: err
          };
        }
        if (!res) {
          return [];
        }
        if (res.error != null) {
          printError(res.error);
        }
        return res;
      } else {
        command.replace(/\\/g, '\\\\');
        if (currentProcesses[command] == null) {
          console.log('Building index');
          currentProcesses[command] = exec.exec(config.config.php + " " + __dirname + "/../../php/parser.php " + directory.path + " " + command, function(error, stdout, stderr) {
            delete currentProcesses[command];
            console.log('Build done');
            return [];
          });
        }
      }
    }
  };


  /**
   * Reads an index by its name (file in indexes/index.[name].json)
   * @param {string} name Name of the index to read
   */

  readIndex = function(name) {
    var crypt, directory, err, options, path, _i, _len, _ref;
    _ref = atom.project.getDirectories();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      directory = _ref[_i];
      crypt = md5(directory.path);
      path = __dirname + "/../../indexes/" + crypt + "/index." + name + ".json";
      try {
        fs.accessSync(path, fs.F_OK | fs.R_OK);
      } catch (_error) {
        err = _error;
        return [];
      }
      options = {
        encoding: 'UTF-8'
      };
      return JSON.parse(fs.readFileSync(path, options));
      break;
    }
  };


  /**
   * Open and read the composer.json file in the current folder
   */

  readComposer = function() {
    var directory, err, options, path, _i, _len, _ref;
    _ref = atom.project.getDirectories();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      directory = _ref[_i];
      path = "" + directory.path + "/composer.json";
      try {
        fs.accessSync(path, fs.F_OK | fs.R_OK);
      } catch (_error) {
        err = _error;
        continue;
      }
      options = {
        encoding: 'UTF-8'
      };
      data.composer = JSON.parse(fs.readFileSync(path, options));
      return data.composer;
    }
    console.log('Unable to find composer.json file or to open it. The plugin will not work as expected. It only works on composer project');
    throw "Error";
  };


  /**
   * Throw a formatted error
   * @param {object} error Error to show
   */

  printError = function(error) {
    var message;
    data.error = true;
    return message = error.message;
  };

  module.exports = {

    /**
     * Clear all cache of the plugin
     */
    clearCache: function() {
      return data = {
        error: false,
        autocomplete: [],
        methods: [],
        composer: null
      };
    },

    /**
     * Autocomplete for classes name
     * @return {array}
     */
    classes: function() {
      return readIndex('classes');
    },

    /**
     * Returns composer.json file
     * @return {Object}
     */
    composer: function() {
      return readComposer();
    },

    /**
     * Autocomplete for internal PHP constants
     * @return {array}
     */
    constants: function() {
      var res;
      if (data.constants == null) {
        res = execute(["--constants"], false);
        data.constants = res;
      }
      return data.constants;
    },

    /**
     * Autocomplete for internal PHP functions
     * @return {array}
     */
    functions: function() {
      var res;
      if (data.functions == null) {
        res = execute(["--functions"], false);
        data.functions = res;
      }
      return data.functions;
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    methods: function(className) {
      var res;
      if (data.methods[className] == null) {
        res = execute(["--methods", "" + className], false);
        data.methods[className] = res;
      }
      return data.methods[className];
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    autocomplete: function(className, name) {
      var cacheKey, res;
      cacheKey = className + "." + name;
      if (data.autocomplete[cacheKey] == null) {
        res = execute(["--autocomplete", className, name], false);
        data.autocomplete[cacheKey] = res;
      }
      return data.autocomplete[cacheKey];
    },

    /**
     * Returns params from the documentation of the given function
     *
     * @param {string} className
     * @param {string} functionName
     */
    docParams: function(className, functionName) {
      var res;
      res = execute("--doc-params " + className + " " + functionName, false);
      return res;
    },

    /**
     * Refresh the full index or only for the given classPath
     * @param  {string} classPath Full path (dir) of the class to refresh
     */
    refresh: function(classPath) {
      if (classPath == null) {
        return execute("--refresh", true);
      } else {
        return execute("--refresh " + classPath, true);
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
            var classPath, directory, path, _i, _len, _ref;
            if (event.path.substr(event.path.length - 4) === ".php") {
              _this.clearCache();
              path = event.path;
              _ref = atom.project.getDirectories();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                directory = _ref[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0dBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUpMLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQ0k7QUFBQSxJQUFBLE9BQUEsRUFBUyxFQUFUO0FBQUEsSUFDQSxZQUFBLEVBQWMsRUFEZDtBQUFBLElBRUEsUUFBQSxFQUFVLElBRlY7R0FQSixDQUFBOztBQUFBLEVBV0EsZ0JBQUEsR0FBbUIsRUFYbkIsQ0FBQTs7QUFhQTtBQUFBOzs7OztLQWJBOztBQUFBLEVBbUJBLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxLQUFWLEdBQUE7QUFDTixRQUFBLHlEQUFBO0FBQUE7QUFBQSxTQUFBLDJDQUFBOzJCQUFBO0FBQ0ksTUFBQSxJQUFHLENBQUEsS0FBSDtBQUNJLGFBQUEsZ0RBQUE7MEJBQUE7QUFDSSxVQUFBLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixFQUFpQixNQUFqQixDQUFBLENBREo7QUFBQSxTQUFBO0FBR0E7QUFFSSxVQUFBLElBQU8saUNBQVA7QUFDSSxZQUFBLGdCQUFpQixDQUFBLE9BQUEsQ0FBakIsR0FBNEIsSUFBNUIsQ0FBQTtBQUFBLFlBRUEsTUFBQSxHQUFTLElB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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/services/php-proxy.coffee
