(function() {
  var BufferedProcess, CompositeDisposable, Process, XRegExp, getUserHome, hdRegex, hdRegexFlags, infoErrors, jsonErrors, matchError, takeAfter, trimMessage, _ref;

  _ref = require("atom"), BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  XRegExp = require("xregexp").XRegExp;

  Process = require("process").Process;

  hdRegex = ".+?:(?<line>\\d+):(?<col>\\d+):((?<warning>\\s+Warning:)|(?<error>))(?<message>(\\s+.*\\n)+)";

  hdRegexFlags = "";

  trimMessage = function(str) {
    var lines, tlines;
    lines = str.split("\n");
    tlines = lines.map(function(l) {
      return l.trim();
    });
    return tlines.join("\n");
  };

  matchError = function(fp, match) {
    var col, line, tmsg;
    line = Number(match.line) - 1;
    col = Number(match.col) - 1;
    tmsg = trimMessage(match.message);
    return {
      type: match.warning ? "Warning" : "Error",
      text: tmsg,
      filePath: fp,
      multiline: true,
      range: [[line, col], [line, col + 1]]
    };
  };

  infoErrors = function(fp, info) {
    var errors, msg, regex, _i, _len, _ref1;
    if (!info) {
      return [];
    }
    errors = [];
    regex = XRegExp(hdRegex);
    _ref1 = info.split(/\r?\n\r?\n/);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      msg = _ref1[_i];
      XRegExp.forEach(msg, regex, function(match, i) {
        var e;
        e = matchError(fp, match);
        return errors.push(e);
      });
    }
    return errors;
  };

  takeAfter = function(str, needle) {
    var i;
    i = str.indexOf(needle);
    if (!(0 <= i)) {
      return str;
    }
    return str.substring(i + needle.length);
  };

  jsonErrors = function(fp, message) {
    var errors, result;
    console.log(message);
    if (message == null) {
      return [];
    }
    result = takeAfter(message, 'RESULT');
    console.log(result);
    errors = (function() {
      try {
        return JSON.parse(result);
      } catch (_error) {}
    })();
    if (errors == null) {
      return [];
    }
    console.log("jsonErrors");
    console.log(errors);
    return errors.map(function(err) {
      return {
        type: 'Error',
        text: err.message,
        filePath: fp,
        range: [[err.start.line - 1, err.start.column - 1], [err.stop.line - 1, err.stop.column]]
      };
    });
  };

  getUserHome = function() {
    var p, v;
    p = process.platform;
    v = p === "win32" ? "USERPROFILE" : "HOME";
    return process.env[v];
  };

  module.exports = {
    config: {
      liquidUseStack: {
        title: "Use stack to run liquid (recommended).",
        type: "boolean",
        "default": true
      },
      liquidExecutablePath: {
        title: "The liquid executable path.",
        type: "string",
        "default": "liquid"
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe("linter-liquidhaskell.liquidUseStack", (function(_this) {
        return function(useStack) {
          return _this.useStack = useStack;
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe("linter-liquidhaskell.liquidExecutablePath", (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        grammarScopes: ["source.haskell"],
        scope: "file",
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            return new Promise(function(resolve, reject) {
              var args, command, filePath, message, process;
              filePath = textEditor.getPath();
              message = [];
              command = _this.executablePath;
              args = ["--json", filePath];
              if (_this.useStack) {
                command = "stack";
                args = ["exec", "--", _this.executablePath].concat(args);
              }
              process = new BufferedProcess({
                command: command,
                args: args,
                stderr: function(data) {
                  return message.push(data);
                },
                stdout: function(data) {
                  return message.push(data);
                },
                exit: function(code) {
                  var info;
                  info = message.join("\n");
                  return resolve(jsonErrors(filePath, info));
                }
              });
              return process.onWillThrowError(function(_arg) {
                var error, handle;
                error = _arg.error, handle = _arg.handle;
                console.error("Failed to run", command, args, ":", message);
                reject("Failed to run " + command + " with args " + args + ": " + error.message);
                return handle();
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXItbGlxdWlkaGFza2VsbC9saWIvaW5pdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEpBQUE7O0FBQUEsRUFBQSxPQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLHVCQUFBLGVBQUQsRUFBa0IsMkJBQUEsbUJBQWxCLENBQUE7O0FBQUEsRUFDQyxVQUFhLE9BQUEsQ0FBUSxTQUFSLEVBQWIsT0FERCxDQUFBOztBQUFBLEVBRUMsVUFBYSxPQUFBLENBQVEsU0FBUixFQUFiLE9BRkQsQ0FBQTs7QUFBQSxFQVFBLE9BQUEsR0FBVSw4RkFSVixDQUFBOztBQUFBLEVBV0EsWUFBQSxHQUFlLEVBWGYsQ0FBQTs7QUFBQSxFQWFBLFdBQUEsR0FBYyxTQUFDLEdBQUQsR0FBQTtBQUNaLFFBQUEsYUFBQTtBQUFBLElBQUEsS0FBQSxHQUFTLEdBQUcsQ0FBQyxLQUFKLENBQVUsSUFBVixDQUFULENBQUE7QUFBQSxJQUNBLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBQSxFQUFQO0lBQUEsQ0FBVixDQURULENBQUE7QUFFQSxXQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFQLENBSFk7RUFBQSxDQWJkLENBQUE7O0FBQUEsRUFrQkEsVUFBQSxHQUFhLFNBQUMsRUFBRCxFQUFLLEtBQUwsR0FBQTtBQUNYLFFBQUEsZUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBYixDQUFBLEdBQXFCLENBQTVCLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTyxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQWIsQ0FBQSxHQUFvQixDQUQzQixDQUFBO0FBQUEsSUFF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

//# sourceURL=/home/epse/.atom/packages/linter-liquidhaskell/lib/init.coffee
