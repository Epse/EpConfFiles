(function() {
  var CompositeDisposable, LinterRust, XRegExp, atom_linter, errorModes, fs, path, semver,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  atom_linter = require('atom-linter');

  semver = require('semver');

  XRegExp = require('xregexp');

  errorModes = require('./mode');

  LinterRust = (function() {
    LinterRust.prototype.patternRustcVersion = XRegExp('rustc (?<version>1.\\d+.\\d+)(?:(?:-(?:(?<nightly>nightly)|(?<beta>beta.*?))|(?:[^\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\))?');

    LinterRust.prototype.cargoDependencyDir = "target/debug/deps";

    function LinterRust() {
      this.locateCargo = bind(this.locateCargo, this);
      this.decideErrorMode = bind(this.decideErrorMode, this);
      this.compilationFeatures = bind(this.compilationFeatures, this);
      this.initCmd = bind(this.initCmd, this);
      this.lint = bind(this.lint, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-rust.rustcPath', (function(_this) {
        return function(rustcPath) {
          if (rustcPath) {
            rustcPath = rustcPath.trim();
          }
          return _this.rustcPath = rustcPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoPath', (function(_this) {
        return function(cargoPath) {
          return _this.cargoPath = cargoPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.useCargo', (function(_this) {
        return function(useCargo) {
          return _this.useCargo = useCargo;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoCommand', (function(_this) {
        return function(cargoCommand) {
          return _this.cargoCommand = cargoCommand;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.rustcBuildTest', (function(_this) {
        return function(rustcBuildTest) {
          return _this.rustcBuildTest = rustcBuildTest;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoManifestFilename', (function(_this) {
        return function(cargoManifestFilename) {
          return _this.cargoManifestFilename = cargoManifestFilename;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.jobsNumber', (function(_this) {
        return function(jobsNumber) {
          return _this.jobsNumber = jobsNumber;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.disabledWarnings', (function(_this) {
        return function(disabledWarnings) {
          return _this.disabledWarnings = disabledWarnings;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.specifiedFeatures', (function(_this) {
        return function(specifiedFeatures) {
          return _this.specifiedFeatures = specifiedFeatures;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.allowedToCacheVersions', (function(_this) {
        return function(allowedToCacheVersions) {
          return _this.allowedToCacheVersions = allowedToCacheVersions;
        };
      })(this)));
    }

    LinterRust.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    LinterRust.prototype.lint = function(textEditor) {
      return this.initCmd(textEditor.getPath()).then((function(_this) {
        return function(result) {
          var additional, args, cmd, cmd_res, command, curDir, cwd, env, errorMode, file;
          cmd_res = result[0], errorMode = result[1];
          file = cmd_res[0], cmd = cmd_res[1];
          env = JSON.parse(JSON.stringify(process.env));
          curDir = path.dirname(file);
          cwd = curDir;
          command = cmd[0];
          args = cmd.slice(1);
          env.PATH = path.dirname(cmd[0]) + path.delimiter + env.PATH;
          if (errorMode === errorModes.FLAGS_JSON_CARGO) {
            if ((env.RUSTFLAGS == null) || !(env.RUSTFLAGS.indexOf('--error-format=json') >= 0)) {
              additional = env.RUSTFLAGS != null ? ' ' + env.RUSTFLAGS : '';
              env.RUSTFLAGS = '--error-format=json' + additional;
            }
          }
          return atom_linter.exec(command, args, {
            env: env,
            cwd: cwd,
            stream: 'both'
          }).then(function(result) {
            var exitCode, messages, output, showDevModeWarning, stderr, stdout;
            stdout = result.stdout, stderr = result.stderr, exitCode = result.exitCode;
            if (stderr.indexOf('does not have these features') >= 0) {
              atom.notifications.addError("Invalid specified features", {
                detail: "" + stderr,
                dismissable: true
              });
              return [];
            } else if (exitCode === 101 || exitCode === 0) {
              showDevModeWarning = function(stream, message) {
                return atom.notifications.addWarning("Output from " + stream + " while linting", {
                  detail: "" + message,
                  description: "This is shown because Atom is running in dev-mode and probably not an actual error",
                  dismissable: true
                });
              };
              if (atom.inDevMode()) {
                if (stderr) {
                  showDevModeWarning('stderr', stderr);
                }
                if (stdout) {
                  showDevModeWarning('stdout', stdout);
                }
              }
              output = errorMode.neededOutput(stdout, stderr);
              messages = errorMode.parse(output, {
                disabledWarnings: _this.disabledWarnings,
                textEditor: textEditor
              });
              messages.forEach(function(message) {
                if (!(path.isAbsolute(message.filePath))) {
                  return message.filePath = path.join(curDir, message.filePath);
                }
              });
              return messages;
            } else {
              atom.notifications.addError("Failed to run " + command + " with exit code " + exitCode, {
                detail: "with args:\n " + (args.join(' ')) + "\nSee console for more information",
                dismissable: true
              });
              console.log("stdout:");
              console.log(stdout);
              console.log("stderr:");
              console.log(stderr);
              return [];
            }
          })["catch"](function(error) {
            console.log(error);
            atom.notifications.addError("Failed to run " + command, {
              detail: "" + error.message,
              dismissable: true
            });
            return [];
          });
        };
      })(this));
    };

    LinterRust.prototype.initCmd = function(editingFile) {
      var cargoManifestPath, curDir;
      curDir = path.dirname(editingFile);
      cargoManifestPath = this.locateCargo(curDir);
      if (!this.useCargo || !cargoManifestPath) {
        return this.decideErrorMode(curDir, 'rustc').then((function(_this) {
          return function(mode) {
            return mode.buildArguments(_this, [editingFile, cargoManifestPath]).then(function(cmd) {
              return [cmd, mode];
            });
          };
        })(this));
      } else {
        return this.decideErrorMode(curDir, 'cargo').then((function(_this) {
          return function(mode) {
            return mode.buildArguments(_this, cargoManifestPath).then(function(cmd) {
              return [cmd, mode];
            });
          };
        })(this));
      }
    };

    LinterRust.prototype.compilationFeatures = function(cargo) {
      var cfgs, f, result;
      if (this.specifiedFeatures.length > 0) {
        if (cargo) {
          return ['--features', this.specifiedFeatures.join(' ')];
        } else {
          result = [];
          cfgs = (function() {
            var i, len, ref, results;
            ref = this.specifiedFeatures;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              f = ref[i];
              results.push(result.push(['--cfg', "feature=\"" + f + "\""]));
            }
            return results;
          }).call(this);
          return result;
        }
      }
    };

    LinterRust.prototype.decideErrorMode = function(curDir, commandMode) {
      if ((this.cachedErrorMode != null) && this.allowedToCacheVersions) {
        return Promise.resolve().then((function(_this) {
          return function() {
            return _this.cachedErrorMode;
          };
        })(this));
      } else {
        return atom_linter.exec(this.rustcPath, ['--version'], {
          cwd: curDir
        }).then((function(_this) {
          return function(stdout) {
            var canUseIntermediateJSON, canUseProperCargoJSON, match, nightlyWithJSON, stableWithJSON;
            try {
              match = XRegExp.exec(stdout, _this.patternRustcVersion);
              if (match) {
                nightlyWithJSON = match.nightly && match.date > '2016-08-08';
                stableWithJSON = !match.nightly && semver.gte(match.version, '1.12.0');
                canUseIntermediateJSON = nightlyWithJSON || stableWithJSON;
                switch (commandMode) {
                  case 'cargo':
                    canUseProperCargoJSON = (match.nightly && match.date >= '2016-10-10') || (match.beta || !match.nightly && semver.gte(match.version, '1.13.0'));
                    if (canUseProperCargoJSON) {
                      return errorModes.JSON_CARGO;
                    } else if (canUseIntermediateJSON) {
                      return errorModes.FLAGS_JSON_CARGO;
                    } else {
                      return errorModes.OLD_CARGO;
                    }
                    break;
                  case 'rustc':
                    if (canUseIntermediateJSON) {
                      return errorModes.JSON_RUSTC;
                    } else {
                      return errorModes.OLD_RUSTC;
                    }
                }
              } else {
                throw 'rustc returned unexpected result: ' + stdout;
              }
            } catch (error1) {}
          };
        })(this)).then((function(_this) {
          return function(result) {
            _this.cachedErrorMode = result;
            return result;
          };
        })(this));
      }
    };

    LinterRust.prototype.locateCargo = function(curDir) {
      var directory, root_dir;
      root_dir = /^win/.test(process.platform) ? /^.:\\$/ : /^\/$/;
      directory = path.resolve(curDir);
      while (true) {
        if (fs.existsSync(path.join(directory, this.cargoManifestFilename))) {
          return path.join(directory, this.cargoManifestFilename);
        }
        if (root_dir.test(directory)) {
          break;
        }
        directory = path.resolve(path.join(directory, '..'));
      }
      return false;
    };

    return LinterRust;

  })();

  module.exports = LinterRust;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1ydXN0L2xpYi9saW50ZXItcnVzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLFdBQUEsR0FBYyxPQUFBLENBQVEsYUFBUjs7RUFDZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztFQUVWLFVBQUEsR0FBYSxPQUFBLENBQVEsUUFBUjs7RUFFUDt5QkFDSixtQkFBQSxHQUFxQixPQUFBLENBQVEsNklBQVI7O3lCQUVyQixrQkFBQSxHQUFvQjs7SUFFUCxvQkFBQTs7Ozs7O01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUVyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHVCQUFwQixFQUNuQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtVQUNFLElBQWlDLFNBQWpDO1lBQUEsU0FBQSxHQUFlLFNBQVMsQ0FBQyxJQUFiLENBQUEsRUFBWjs7aUJBQ0EsS0FBQyxDQUFBLFNBQUQsR0FBYTtRQUZmO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURtQixDQUFuQjtNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsdUJBQXBCLEVBQ25CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUNFLEtBQUMsQ0FBQSxTQUFELEdBQWE7UUFEZjtNQUFBLENBQUEsQ0FBQSxDQUFB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QkFDbkI7VUFGSTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F6Qk4sRUFMRjs7SUFGZTs7eUJBcUNqQixXQUFBLEdBQWEsU0FBQyxNQUFEO0FBQ1gsVUFBQTtNQUFBLFFBQUEsR0FBYyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxRQUFwQixDQUFILEdBQXFDLFFBQXJDLEdBQW1EO01BQzlELFNBQUEsR0FBWSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWI7QUFDWixhQUFBLElBQUE7UUFDRSxJQUFzRCxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFDLENBQUEscUJBQXRCLENBQWQsQ0FBdEQ7QUFBQSxpQkFBTyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBQyxDQUFBLHFCQUF0QixFQUFQOztRQUNBLElBQVMsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFkLENBQVQ7QUFBQSxnQkFBQTs7UUFDQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsQ0FBYjtNQUhkO0FBSUEsYUFBTztJQVBJOzs7Ozs7RUFTZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxNakIiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5hdG9tX2xpbnRlciA9IHJlcXVpcmUgJ2F0b20tbGludGVyJ1xuc2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xuWFJlZ0V4cCA9IHJlcXVpcmUgJ3hyZWdleHAnXG5cbmVycm9yTW9kZXMgPSByZXF1aXJlICcuL21vZGUnXG5cbmNsYXNzIExpbnRlclJ1c3RcbiAgcGF0dGVyblJ1c3RjVmVyc2lvbjogWFJlZ0V4cCgncnVzdGMgKD88dmVyc2lvbj4xLlxcXFxkKy5cXFxcZCspKD86KD86LSg/Oig/PG5pZ2h0bHk+bmlnaHRseSl8KD88YmV0YT5iZXRhLio/KSl8KD86W15cXHNdKykpPyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXFxcKCg/OlteXFxcXHNdKykgKD88ZGF0ZT5cXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfSlcXFxcKSk/JylcbiAgY2FyZ29EZXBlbmRlbmN5RGlyOiBcInRhcmdldC9kZWJ1Zy9kZXBzXCJcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3QucnVzdGNQYXRoJyxcbiAgICAocnVzdGNQYXRoKSA9PlxuICAgICAgcnVzdGNQYXRoID0gZG8gcnVzdGNQYXRoLnRyaW0gaWYgcnVzdGNQYXRoXG4gICAgICBAcnVzdGNQYXRoID0gcnVzdGNQYXRoXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3QuY2FyZ29QYXRoJyxcbiAgICAoY2FyZ29QYXRoKSA9PlxuICAgICAgQGNhcmdvUGF0aCA9IGNhcmdvUGF0aFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LnVzZUNhcmdvJyxcbiAgICAodXNlQ2FyZ28pID0+XG4gICAgICBAdXNlQ2FyZ28gPSB1c2VDYXJnb1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LmNhcmdvQ29tbWFuZCcsXG4gICAgKGNhcmdvQ29tbWFuZCkgPT5cbiAgICAgIEBjYXJnb0NvbW1hbmQgPSBjYXJnb0NvbW1hbmRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5ydXN0Y0J1aWxkVGVzdCcsXG4gICAgKHJ1c3RjQnVpbGRUZXN0KSA9PlxuICAgICAgQHJ1c3RjQnVpbGRUZXN0ID0gcnVzdGNCdWlsZFRlc3RcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5jYXJnb01hbmlmZXN0RmlsZW5hbWUnLFxuICAgIChjYXJnb01hbmlmZXN0RmlsZW5hbWUpID0+XG4gICAgICBAY2FyZ29NYW5pZmVzdEZpbGVuYW1lID0gY2FyZ29NYW5pZmVzdEZpbGVuYW1lXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3Quam9ic051bWJlcicsXG4gICAgKGpvYnNOdW1iZXIpID0+XG4gICAgICBAam9ic051bWJlciA9IGpvYnNOdW1iZXJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5kaXNhYmxlZFdhcm5pbmdzJyxcbiAgICAoZGlzYWJsZWRXYXJuaW5ncykgPT5cbiAgICAgIEBkaXNhYmxlZFdhcm5pbmdzID0gZGlzYWJsZWRXYXJuaW5nc1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LnNwZWNpZmllZEZlYXR1cmVzJyxcbiAgICAoc3BlY2lmaWVkRmVhdHVyZXMpID0+XG4gICAgICBAc3BlY2lmaWVkRmVhdHVyZXMgPSBzcGVjaWZpZWRGZWF0dXJlc1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LmFsbG93ZWRUb0NhY2hlVmVyc2lvbnMnLFxuICAgIChhbGxvd2VkVG9DYWNoZVZlcnNpb25zKSA9PlxuICAgICAgQGFsbG93ZWRUb0NhY2hlVmVyc2lvbnMgPSBhbGxvd2VkVG9DYWNoZVZlcnNpb25zXG5cbiAgZGVzdHJveTogLT5cbiAgICBkbyBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlXG5cbiAgbGludDogKHRleHRFZGl0b3IpID0+XG4gICAgQGluaXRDbWQodGV4dEVkaXRvci5nZXRQYXRoKCkpLnRoZW4gKHJlc3VsdCkgPT5cbiAgICAgIFtjbWRfcmVzLCBlcnJvck1vZGVdID0gcmVzdWx0XG4gICAgICBbZmlsZSwgY21kXSA9IGNtZF9yZXNcbiAgICAgIGVudiA9IEpTT04ucGFyc2UgSlNPTi5zdHJpbmdpZnkgcHJvY2Vzcy5lbnZcbiAgICAgIGN1ckRpciA9IHBhdGguZGlybmFtZSBmaWxlXG4gICAgICBjd2QgPSBjdXJEaXJcbiAgICAgIGNvbW1hbmQgPSBjbWRbMF1cbiAgICAgIGFyZ3MgPSBjbWQuc2xpY2UgMVxuICAgICAgZW52LlBBVEggPSBwYXRoLmRpcm5hbWUoY21kWzBdKSArIHBhdGguZGVsaW1pdGVyICsgZW52LlBBVEhcblxuICAgICAgIyB3ZSBzZXQgZmxhZ3Mgb25seSBmb3IgaW50ZXJtZWRpYXRlIGpzb24gc3VwcG9ydFxuICAgICAgaWYgZXJyb3JNb2RlID09IGVycm9yTW9kZXMuRkxBR1NfSlNPTl9DQVJHT1xuICAgICAgICBpZiAhZW52LlJVU1RGTEFHUz8gb3IgIShlbnYuUlVTVEZMQUdTLmluZGV4T2YoJy0tZXJyb3ItZm9ybWF0PWpzb24nKSA+PSAwKVxuICAgICAgICAgIGFkZGl0aW9uYWwgPSBpZiBlbnYuUlVTVEZMQUdTPyB0aGVuICcgJyArIGVudi5SVVNURkxBR1MgZWxzZSAnJ1xuICAgICAgICAgIGVudi5SVVNURkxBR1MgPSAnLS1lcnJvci1mb3JtYXQ9anNvbicgKyBhZGRpdGlvbmFsXG5cbiAgICAgIGF0b21fbGludGVyLmV4ZWMoY29tbWFuZCwgYXJncywge2VudjogZW52LCBjd2Q6IGN3ZCwgc3RyZWFtOiAnYm90aCd9KVxuICAgICAgICAudGhlbiAocmVzdWx0KSA9PlxuICAgICAgICAgIHtzdGRvdXQsIHN0ZGVyciwgZXhpdENvZGV9ID0gcmVzdWx0XG4gICAgICAgICAgIyBmaXJzdCwgY2hlY2sgaWYgYW4gb3V0cHV0IHNheXMgc3BlY2lmaWVkIGZlYXR1cmVzIGFyZSBpbnZhbGlkXG4gICAgICAgICAgaWYgc3RkZXJyLmluZGV4T2YoJ2RvZXMgbm90IGhhdmUgdGhlc2UgZmVhdHVyZXMnKSA+PSAwXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJJbnZhbGlkIHNwZWNpZmllZCBmZWF0dXJlc1wiLFxuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tzdGRlcnJ9XCJcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIFtdXG4gICAgICAgICAgIyB0aGVuLCBpZiBleGl0IGNvZGUgbG9va3Mgb2theSwgcHJvY2VzcyBhbiBvdXRwdXRcbiAgICAgICAgICBlbHNlIGlmIGV4aXRDb2RlIGlzIDEwMSBvciBleGl0Q29kZSBpcyAwXG4gICAgICAgICAgICAjIGluIGRldiBtb2RlIHNob3cgbWVzc2FnZSBib3hlcyB3aXRoIG91dHB1dFxuICAgICAgICAgICAgc2hvd0Rldk1vZGVXYXJuaW5nID0gKHN0cmVhbSwgbWVzc2FnZSkgLT5cbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJPdXRwdXQgZnJvbSAje3N0cmVhbX0gd2hpbGUgbGludGluZ1wiLFxuICAgICAgICAgICAgICAgIGRldGFpbDogXCIje21lc3NhZ2V9XCJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGlzIGlzIHNob3duIGJlY2F1c2UgQXRvbSBpcyBydW5uaW5nIGluIGRldi1tb2RlIGFuZCBwcm9iYWJseSBub3QgYW4gYWN0dWFsIGVycm9yXCJcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgaWYgZG8gYXRvbS5pbkRldk1vZGVcbiAgICAgICAgICAgICAgc2hvd0Rldk1vZGVXYXJuaW5nKCdzdGRlcnInLCBzdGRlcnIpIGlmIHN0ZGVyclxuICAgICAgICAgICAgICBzaG93RGV2TW9kZVdhcm5pbmcoJ3N0ZG91dCcsIHN0ZG91dCkgaWYgc3Rkb3V0XG5cbiAgICAgICAgICAgICMgY2FsbCBhIG5lZWRlZCBwYXJzZXJcbiAgICAgICAgICAgIG91dHB1dCA9IGVycm9yTW9kZS5uZWVkZWRPdXRwdXQoc3Rkb3V0LCBzdGRlcnIpXG4gICAgICAgICAgICBtZXNzYWdlcyA9IGVycm9yTW9kZS5wYXJzZSBvdXRwdXQsIHtAZGlzYWJsZWRXYXJuaW5ncywgdGV4dEVkaXRvcn1cblxuICAgICAgICAgICAgIyBjb3JyZWN0IGZpbGUgcGF0aHNcbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2ggKG1lc3NhZ2UpIC0+XG4gICAgICAgICAgICAgIGlmICEocGF0aC5pc0Fic29sdXRlIG1lc3NhZ2UuZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5maWxlUGF0aCA9IHBhdGguam9pbiBjdXJEaXIsIG1lc3NhZ2UuZmlsZVBhdGhcbiAgICAgICAgICAgIG1lc3NhZ2VzXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyB3aG9vcHMsIHdlJ3JlIGluIHRyb3VibGUgLS0gbGV0J3Mgb3V0cHV0IGFzIG11Y2ggYXMgd2UgY2FuXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJGYWlsZWQgdG8gcnVuICN7Y29tbWFuZH0gd2l0aCBleGl0IGNvZGUgI3tleGl0Q29kZX1cIixcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIndpdGggYXJnczpcXG4gI3thcmdzLmpvaW4oJyAnKX1cXG5TZWUgY29uc29sZSBmb3IgbW9yZSBpbmZvcm1hdGlvblwiXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcInN0ZG91dDpcIlxuICAgICAgICAgICAgY29uc29sZS5sb2cgc3Rkb3V0XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcInN0ZGVycjpcIlxuICAgICAgICAgICAgY29uc29sZS5sb2cgc3RkZXJyXG4gICAgICAgICAgICBbXVxuICAgICAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIGVycm9yXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiRmFpbGVkIHRvIHJ1biAje2NvbW1hbmR9XCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIFtdXG5cbiAgaW5pdENtZDogKGVkaXRpbmdGaWxlKSA9PlxuICAgIGN1ckRpciA9IHBhdGguZGlybmFtZSBlZGl0aW5nRmlsZVxuICAgIGNhcmdvTWFuaWZlc3RQYXRoID0gQGxvY2F0ZUNhcmdvIGN1ckRpclxuICAgIGlmIG5vdCBAdXNlQ2FyZ28gb3Igbm90IGNhcmdvTWFuaWZlc3RQYXRoXG4gICAgICBAZGVjaWRlRXJyb3JNb2RlKGN1ckRpciwgJ3J1c3RjJykudGhlbiAobW9kZSkgPT5cbiAgICAgICAgbW9kZS5idWlsZEFyZ3VtZW50cyh0aGlzLCBbZWRpdGluZ0ZpbGUsIGNhcmdvTWFuaWZlc3RQYXRoXSkudGhlbiAoY21kKSA9PlxuICAgICAgICAgIFtjbWQsIG1vZGVdXG4gICAgZWxzZVxuICAgICAgQGRlY2lkZUVycm9yTW9kZShjdXJEaXIsICdjYXJnbycpLnRoZW4gKG1vZGUpID0+XG4gICAgICAgIG1vZGUuYnVpbGRBcmd1bWVudHModGhpcywgY2FyZ29NYW5pZmVzdFBhdGgpLnRoZW4gKGNtZCkgPT5cbiAgICAgICAgICBbY21kLCBtb2RlXVxuXG4gIGNvbXBpbGF0aW9uRmVhdHVyZXM6IChjYXJnbykgPT5cbiAgICBpZiBAc3BlY2lmaWVkRmVhdHVyZXMubGVuZ3RoID4gMFxuICAgICAgaWYgY2FyZ29cbiAgICAgICAgWyctLWZlYXR1cmVzJywgQHNwZWNpZmllZEZlYXR1cmVzLmpvaW4oJyAnKV1cbiAgICAgIGVsc2VcbiAgICAgICAgcmVzdWx0ID0gW11cbiAgICAgICAgY2ZncyA9IGZvciBmIGluIEBzcGVjaWZpZWRGZWF0dXJlc1xuICAgICAgICAgIHJlc3VsdC5wdXNoIFsnLS1jZmcnLCBcImZlYXR1cmU9XFxcIiN7Zn1cXFwiXCJdXG4gICAgICAgIHJlc3VsdFxuXG4gIGRlY2lkZUVycm9yTW9kZTogKGN1ckRpciwgY29tbWFuZE1vZGUpID0+XG4gICAgIyBlcnJvciBtb2RlIGlzIGNhY2hlZCB0byBhdm9pZCBkZWxheXNcbiAgICBpZiBAY2FjaGVkRXJyb3JNb2RlPyBhbmQgQGFsbG93ZWRUb0NhY2hlVmVyc2lvbnNcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4gKCkgPT5cbiAgICAgICAgQGNhY2hlZEVycm9yTW9kZVxuICAgIGVsc2VcbiAgICAgICMgY3VycmVudCBkaXIgaXMgc2V0IHRvIGhhbmRsZSBvdmVycmlkZXNcbiAgICAgIGF0b21fbGludGVyLmV4ZWMoQHJ1c3RjUGF0aCwgWyctLXZlcnNpb24nXSwge2N3ZDogY3VyRGlyfSkudGhlbiAoc3Rkb3V0KSA9PlxuICAgICAgICB0cnlcbiAgICAgICAgICBtYXRjaCA9IFhSZWdFeHAuZXhlYyhzdGRvdXQsIEBwYXR0ZXJuUnVzdGNWZXJzaW9uKVxuICAgICAgICAgIGlmIG1hdGNoXG4gICAgICAgICAgICBuaWdodGx5V2l0aEpTT04gPSBtYXRjaC5uaWdodGx5IGFuZCBtYXRjaC5kYXRlID4gJzIwMTYtMDgtMDgnXG4gICAgICAgICAgICBzdGFibGVXaXRoSlNPTiA9IG5vdCBtYXRjaC5uaWdodGx5IGFuZCBzZW12ZXIuZ3RlKG1hdGNoLnZlcnNpb24sICcxLjEyLjAnKVxuICAgICAgICAgICAgY2FuVXNlSW50ZXJtZWRpYXRlSlNPTiA9IG5pZ2h0bHlXaXRoSlNPTiBvciBzdGFibGVXaXRoSlNPTlxuICAgICAgICAgICAgc3dpdGNoIGNvbW1hbmRNb2RlXG4gICAgICAgICAgICAgIHdoZW4gJ2NhcmdvJ1xuICAgICAgICAgICAgICAgIGNhblVzZVByb3BlckNhcmdvSlNPTiA9IChtYXRjaC5uaWdodGx5IGFuZCBtYXRjaC5kYXRlID49ICcyMDE2LTEwLTEwJykgb3JcbiAgICAgICAgICAgICAgICAgIChtYXRjaC5iZXRhIG9yIG5vdCBtYXRjaC5uaWdodGx5IGFuZCBzZW12ZXIuZ3RlKG1hdGNoLnZlcnNpb24sICcxLjEzLjAnKSlcbiAgICAgICAgICAgICAgICBpZiBjYW5Vc2VQcm9wZXJDYXJnb0pTT05cbiAgICAgICAgICAgICAgICAgIGVycm9yTW9kZXMuSlNPTl9DQVJHT1xuICAgICAgICAgICAgICAgICMgdGhpcyBtb2RlIGlzIHVzZWQgb25seSB0aHJvdWdoIEF1Z3VzdCB0aWxsIE9jdG9iZXIsIDIwMTZcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGNhblVzZUludGVybWVkaWF0ZUpTT05cbiAgICAgICAgICAgICAgICAgIGVycm9yTW9kZXMuRkxBR1NfSlNPTl9DQVJHT1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGVycm9yTW9kZXMuT0xEX0NBUkdPXG4gICAgICAgICAgICAgIHdoZW4gJ3J1c3RjJ1xuICAgICAgICAgICAgICAgIGlmIGNhblVzZUludGVybWVkaWF0ZUpTT05cbiAgICAgICAgICAgICAgICAgIGVycm9yTW9kZXMuSlNPTl9SVVNUQ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGVycm9yTW9kZXMuT0xEX1JVU1RDXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgJ3J1c3RjIHJldHVybmVkIHVuZXhwZWN0ZWQgcmVzdWx0OiAnICsgc3Rkb3V0XG4gICAgICAudGhlbiAocmVzdWx0KSA9PlxuICAgICAgICBAY2FjaGVkRXJyb3JNb2RlID0gcmVzdWx0XG4gICAgICAgIHJlc3VsdFxuXG5cbiAgbG9jYXRlQ2FyZ286IChjdXJEaXIpID0+XG4gICAgcm9vdF9kaXIgPSBpZiAvXndpbi8udGVzdCBwcm9jZXNzLnBsYXRmb3JtIHRoZW4gL14uOlxcXFwkLyBlbHNlIC9eXFwvJC9cbiAgICBkaXJlY3RvcnkgPSBwYXRoLnJlc29sdmUgY3VyRGlyXG4gICAgbG9vcFxuICAgICAgcmV0dXJuIHBhdGguam9pbiBkaXJlY3RvcnksIEBjYXJnb01hbmlmZXN0RmlsZW5hbWUgaWYgZnMuZXhpc3RzU3luYyBwYXRoLmpvaW4gZGlyZWN0b3J5LCBAY2FyZ29NYW5pZmVzdEZpbGVuYW1lXG4gICAgICBicmVhayBpZiByb290X2Rpci50ZXN0IGRpcmVjdG9yeVxuICAgICAgZGlyZWN0b3J5ID0gcGF0aC5yZXNvbHZlIHBhdGguam9pbihkaXJlY3RvcnksICcuLicpXG4gICAgcmV0dXJuIGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyUnVzdFxuIl19
