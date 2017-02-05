(function() {
  var XRegExp, atom_linter, buildCargoArguments, buildMessages, buildRustcArguments, cachedUsingMultitoolForClippy, constructMessage, errorModes, parseJsonMessages, parseJsonOutput, parseOldMessages, path, pattern;

  path = require('path');

  atom_linter = require('atom-linter');

  XRegExp = require('xregexp');

  pattern = XRegExp('(?<file>[^\n\r]+):(?<from_line>\\d+):(?<from_col>\\d+):\\s*(?<to_line>\\d+):(?<to_col>\\d+)\\s+((?<error>error|fatal error)|(?<warning>warning)|(?<info>note|help)):\\s+(?<message>.+?)[\n\r]+($|(?=[^\n\r]+:\\d+))', 's');

  parseOldMessages = function(output, arg) {
    var disabledWarnings, elements, textEditor;
    disabledWarnings = arg.disabledWarnings, textEditor = arg.textEditor;
    elements = [];
    XRegExp.forEach(output, pattern, function(match) {
      var element, level, range;
      range = match.from_col === match.to_col && match.from_line === match.to_line ? atom_linter.rangeFromLineNumber(textEditor, Number.parseInt(match.from_line, 10) - 1, Number.parseInt(match.from_col, 10) - 1) : [[match.from_line - 1, match.from_col - 1], [match.to_line - 1, match.to_col - 1]];
      level = match.error ? 'error' : match.warning ? 'warning' : match.info ? 'info' : match.trace ? 'trace' : match.note ? 'note' : void 0;
      element = {
        type: level,
        message: match.message,
        file: match.file,
        range: range
      };
      return elements.push(element);
    });
    return buildMessages(elements, disabledWarnings);
  };

  parseJsonMessages = function(messages, arg) {
    var disabledWarnings, element, elements, i, input, j, len, len1, primary_span, range, ref, span;
    disabledWarnings = arg.disabledWarnings;
    elements = [];
    for (i = 0, len = messages.length; i < len; i++) {
      input = messages[i];
      if (!(input && input.spans)) {
        continue;
      }
      primary_span = input.spans.find(function(span) {
        return span.is_primary;
      });
      if (!primary_span) {
        continue;
      }
      while (primary_span.expansion && primary_span.expansion.span) {
        primary_span = primary_span.expansion.span;
      }
      range = [[primary_span.line_start - 1, primary_span.column_start - 1], [primary_span.line_end - 1, primary_span.column_end - 1]];
      if (input.level === 'fatal error') {
        input.level = 'error';
      }
      element = {
        type: input.level,
        message: input.message,
        file: primary_span.file_name,
        range: range,
        children: input.children
      };
      ref = input.spans;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        span = ref[j];
        if (!span.is_primary) {
          element.children.push({
            message: span.label,
            range: [[span.line_start - 1, span.column_start - 1], [span.line_end - 1, span.column_end - 1]]
          });
        }
      }
      elements.push(element);
    }
    return buildMessages(elements, disabledWarnings);
  };

  parseJsonOutput = function(output, arg) {
    var additionalFilter, disabledWarnings, results;
    disabledWarnings = arg.disabledWarnings, additionalFilter = arg.additionalFilter;
    results = output.split('\n').map(function(message) {
      var json;
      message = message.trim();
      if (message.startsWith('{')) {
        json = JSON.parse(message);
        if (additionalFilter != null) {
          return additionalFilter(json);
        } else {
          return json;
        }
      }
    }).filter(function(m) {
      return m != null;
    });
    return parseJsonMessages(results, {
      disabledWarnings: disabledWarnings
    });
  };

  buildMessages = function(elements, disabledWarnings) {
    var disabledWarning, element, i, j, lastMessage, len, len1, messageIsDisabledLint, messages;
    messages = [];
    lastMessage = null;
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      switch (element.type) {
        case 'info':
        case 'trace':
        case 'note':
          if (lastMessage) {
            lastMessage.trace || (lastMessage.trace = []);
            lastMessage.trace.push({
              type: "Trace",
              text: element.message,
              filePath: element.file,
              range: element.range
            });
          }
          break;
        case 'warning':
          if (disabledWarnings && disabledWarnings.length > 0) {
            messageIsDisabledLint = false;
            for (j = 0, len1 = disabledWarnings.length; j < len1; j++) {
              disabledWarning = disabledWarnings[j];
              if (element.message.indexOf(disabledWarning) >= 0) {
                messageIsDisabledLint = true;
                lastMessage = null;
                break;
              }
            }
            if (!messageIsDisabledLint) {
              lastMessage = constructMessage("Warning", element);
              messages.push(lastMessage);
            }
          } else {
            lastMessage = constructMessage("Warning", element);
            messages.push(lastMessage);
          }
          break;
        case 'error':
        case 'fatal error':
          lastMessage = constructMessage("Error", element);
          messages.push(lastMessage);
      }
    }
    return messages;
  };

  constructMessage = function(type, element) {
    var children, i, len, message, ref;
    message = {
      type: type,
      text: element.message,
      filePath: element.file,
      range: element.range
    };
    if (element.children) {
      message.trace = [];
      ref = element.children;
      for (i = 0, len = ref.length; i < len; i++) {
        children = ref[i];
        message.trace.push({
          type: "Trace",
          text: children.message,
          filePath: element.file,
          range: children.range || element.range
        });
      }
    }
    return message;
  };

  buildRustcArguments = function(linter, paths) {
    var cargoManifestPath, editingFile;
    editingFile = paths[0], cargoManifestPath = paths[1];
    return Promise.resolve().then((function(_this) {
      return function() {
        var cmd, compilationFeatures, rustcArgs;
        rustcArgs = (function() {
          switch (linter.rustcBuildTest) {
            case true:
              return ['--cfg', 'test'];
            default:
              return [];
          }
        })();
        rustcArgs = rustcArgs.concat(['--color', 'never']);
        cmd = [linter.rustcPath].concat(rustcArgs);
        if (cargoManifestPath) {
          cmd.push('-L');
          cmd.push(path.join(path.dirname(cargoManifestPath), linter.cargoDependencyDir));
        }
        compilationFeatures = linter.compilationFeatures(false);
        if (compilationFeatures) {
          cmd = cmd.concat(compilationFeatures);
        }
        cmd = cmd.concat([editingFile]);
        return [editingFile, cmd];
      };
    })(this));
  };

  cachedUsingMultitoolForClippy = null;

  buildCargoArguments = function(linter, cargoManifestPath) {
    var buildCargoPath, cargoArgs, compilationFeatures;
    buildCargoPath = function(cargoPath, cargoCommand) {
      var usingMultitoolForClippy;
      if ((cachedUsingMultitoolForClippy != null) && linter.allowedToCacheVersions) {
        return Promise.resolve().then((function(_this) {
          return function() {
            return cachedUsingMultitoolForClippy;
          };
        })(this));
      } else {
        usingMultitoolForClippy = atom_linter.exec('rustup', ['--version'], {
          ignoreExitCode: true
        }).then(function() {
          return {
            result: true,
            tool: 'rustup'
          };
        })["catch"](function() {
          return atom_linter.exec('multirust', ['--version'], {
            ignoreExitCode: true
          }).then(function() {
            return {
              result: true,
              tool: 'multirust'
            };
          })["catch"](function() {
            return {
              result: false
            };
          });
        });
        return usingMultitoolForClippy.then(function(canUseMultirust) {
          if (cargoCommand === 'clippy' && canUseMultirust.result) {
            return [canUseMultirust.tool, 'run', 'nightly', 'cargo'];
          } else {
            return [cargoPath];
          }
        }).then((function(_this) {
          return function(cached) {
            cachedUsingMultitoolForClippy = cached;
            return cached;
          };
        })(this));
      }
    };
    cargoArgs = (function() {
      switch (linter.cargoCommand) {
        case 'check':
          return ['check'];
        case 'test':
          return ['test', '--no-run'];
        case 'rustc':
          return ['rustc', '--color', 'never'];
        case 'clippy':
          return ['clippy'];
        default:
          return ['build'];
      }
    })();
    compilationFeatures = linter.compilationFeatures(true);
    return buildCargoPath(linter.cargoPath, linter.cargoCommand).then(function(cmd) {
      cmd = cmd.concat(cargoArgs).concat(['-j', linter.jobsNumber]);
      if (compilationFeatures) {
        cmd = cmd.concat(compilationFeatures);
      }
      cmd = cmd.concat(['--manifest-path', cargoManifestPath]);
      return [cargoManifestPath, cmd];
    });
  };

  errorModes = {
    JSON_RUSTC: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: (function(_this) {
        return function(output, options) {
          return parseJsonOutput(output, options);
        };
      })(this),
      buildArguments: function(linter, file) {
        return buildRustcArguments(linter, file).then(function(cmd_res) {
          var cmd;
          file = cmd_res[0], cmd = cmd_res[1];
          cmd = cmd.concat(['--error-format=json']);
          return [file, cmd];
        });
      }
    },
    JSON_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stdout;
      },
      parse: function(output, options) {
        options.additionalFilter = function(json) {
          if ((json != null) && json.reason === "compiler-message") {
            return json.message;
          }
        };
        return parseJsonOutput(output, options);
      },
      buildArguments: function(linter, file) {
        return buildCargoArguments(linter, file).then(function(cmd_res) {
          var cmd;
          file = cmd_res[0], cmd = cmd_res[1];
          cmd = cmd.concat(['--message-format', 'json']);
          return [file, cmd];
        });
      }
    },
    FLAGS_JSON_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseJsonOutput,
      buildArguments: buildCargoArguments
    },
    OLD_RUSTC: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseOldMessages,
      buildArguments: buildRustcArguments
    },
    OLD_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseOldMessages,
      buildArguments: buildCargoArguments
    }
  };

  module.exports = errorModes;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1ydXN0L2xpYi9tb2RlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLFdBQUEsR0FBYyxPQUFBLENBQVEsYUFBUjs7RUFDZCxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBRVYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxxTkFBUixFQUdzQyxHQUh0Qzs7RUFLVixnQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ2pCLFFBQUE7SUFEMkIseUNBQWtCO0lBQzdDLFFBQUEsR0FBVztJQUNYLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE1BQWhCLEVBQXdCLE9BQXhCLEVBQWlDLFNBQUMsS0FBRDtBQUMvQixVQUFBO01BQUEsS0FBQSxHQUFXLEtBQUssQ0FBQyxRQUFOLEtBQWtCLEtBQUssQ0FBQyxNQUF4QixJQUFtQyxLQUFLLENBQUMsU0FBTixLQUFtQixLQUFLLENBQUMsT0FBL0QsR0FDTixXQUFXLENBQUMsbUJBQVosQ0FBZ0MsVUFBaEMsRUFBNEMsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsS0FBSyxDQUFDLFNBQXRCLEVBQWlDLEVBQWpDLENBQUEsR0FBdUMsQ0FBbkYsRUFBc0YsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsS0FBSyxDQUFDLFFBQXRCLEVBQWdDLEVBQWhDLENBQUEsR0FBc0MsQ0FBNUgsQ0FETSxHQUdOLENBQ0UsQ0FBQyxLQUFLLENBQUMsU0FBTixHQUFrQixDQUFuQixFQUFzQixLQUFLLENBQUMsUUFBTixHQUFpQixDQUF2QyxDQURGLEVBRUUsQ0FBQyxLQUFLLENBQUMsT0FBTixHQUFnQixDQUFqQixFQUFvQixLQUFLLENBQUMsTUFBTixHQUFlLENBQW5DLENBRkY7TUFJRixLQUFBLEdBQVcsS0FBSyxD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QUFkO01BR0EsS0FBQSxFQUFPLFNBQUMsTUFBRCxFQUFTLE9BQVQ7UUFDTCxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsU0FBQyxJQUFEO1VBQ3pCLElBQUcsY0FBQSxJQUFVLElBQUksQ0FBQyxNQUFMLEtBQWUsa0JBQTVCO21CQUNFLElBQUksQ0FBQyxRQURQOztRQUR5QjtlQUczQixlQUFBLENBQWdCLE1BQWhCLEVBQXdCLE9BQXhCO01BSkssQ0FIUDtNQVNBLGNBQUEsRUFBZ0IsU0FBQyxNQUFELEVBQVMsSUFBVDtlQUNkLG1CQUFBLENBQW9CLE1BQXBCLEVBQTRCLElBQTVCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsU0FBQyxPQUFEO0FBQ3JDLGNBQUE7VUFBQyxpQkFBRCxFQUFPO1VBQ1AsR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBQyxrQkFBRCxFQUFxQixNQUFyQixDQUFYO2lCQUNOLENBQUMsSUFBRCxFQUFPLEdBQVA7UUFIcUMsQ0FBdkM7TUFEYyxDQVRoQjtLQWRGO0lBNkJBLGdCQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQWMsU0FBQyxNQUFELEVBQVMsTUFBVDtlQUNaO01BRFksQ0FBZDtNQUdBLEtBQUEsRUFBTyxlQUhQO01BS0EsY0FBQSxFQUFnQixtQkFMaEI7S0E5QkY7SUFxQ0EsU0FBQSxFQUNFO01BQUEsWUFBQSxFQUFjLFNBQUMsTUFBRCxFQUFTLE1BQVQ7ZUFDWjtNQURZLENBQWQ7TUFHQSxLQUFBLEVBQU8sZ0JBSFA7TUFLQSxjQUFBLEVBQWdCLG1CQUxoQjtLQXRDRjtJQTZDQSxTQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQWMsU0FBQyxNQUFELEVBQVMsTUFBVDtlQUNaO01BRFksQ0FBZDtNQUdBLEtBQUEsRUFBTyxnQkFIUDtNQUtBLGNBQUEsRUFBZ0IsbUJBTGhCO0tBOUNGOzs7RUFxREYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0UGpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmF0b21fbGludGVyID0gcmVxdWlyZSAnYXRvbS1saW50ZXInXG5YUmVnRXhwID0gcmVxdWlyZSAneHJlZ2V4cCdcblxucGF0dGVybiA9IFhSZWdFeHAoJyg/PGZpbGU+W15cXG5cXHJdKyk6KD88ZnJvbV9saW5lPlxcXFxkKyk6KD88ZnJvbV9jb2w+XFxcXGQrKTpcXFxccypcXFxuICAoPzx0b19saW5lPlxcXFxkKyk6KD88dG9fY29sPlxcXFxkKylcXFxccytcXFxuICAoKD88ZXJyb3I+ZXJyb3J8ZmF0YWwgZXJyb3IpfCg/PHdhcm5pbmc+d2FybmluZyl8KD88aW5mbz5ub3RlfGhlbHApKTpcXFxccytcXFxuICAoPzxtZXNzYWdlPi4rPylbXFxuXFxyXSsoJHwoPz1bXlxcblxccl0rOlxcXFxkKykpJywgJ3MnKVxuXG5wYXJzZU9sZE1lc3NhZ2VzID0gKG91dHB1dCwge2Rpc2FibGVkV2FybmluZ3MsIHRleHRFZGl0b3J9KSAtPlxuICBlbGVtZW50cyA9IFtdXG4gIFhSZWdFeHAuZm9yRWFjaCBvdXRwdXQsIHBhdHRlcm4sIChtYXRjaCkgLT5cbiAgICByYW5nZSA9IGlmIG1hdGNoLmZyb21fY29sID09IG1hdGNoLnRvX2NvbCBhbmQgbWF0Y2guZnJvbV9saW5lID09IG1hdGNoLnRvX2xpbmVcbiAgICAgIGF0b21fbGludGVyLnJhbmdlRnJvbUxpbmVOdW1iZXIodGV4dEVkaXRvciwgTnVtYmVyLnBhcnNlSW50KG1hdGNoLmZyb21fbGluZSwgMTApIC0gMSwgTnVtYmVyLnBhcnNlSW50KG1hdGNoLmZyb21fY29sLCAxMCkgLSAxKVxuICAgIGVsc2VcbiAgICAgIFtcbiAgICAgICAgW21hdGNoLmZyb21fbGluZSAtIDEsIG1hdGNoLmZyb21fY29sIC0gMV0sXG4gICAgICAgIFttYXRjaC50b19saW5lIC0gMSwgbWF0Y2gudG9fY29sIC0gMV1cbiAgICAgIF1cbiAgICBsZXZlbCA9IGlmIG1hdGNoLmVycm9yIHRoZW4gJ2Vycm9yJ1xuICAgIGVsc2UgaWYgbWF0Y2gud2FybmluZyB0aGVuICd3YXJuaW5nJ1xuICAgIGVsc2UgaWYgbWF0Y2guaW5mbyB0aGVuICdpbmZvJ1xuICAgIGVsc2UgaWYgbWF0Y2gudHJhY2UgdGhlbiAndHJhY2UnXG4gICAgZWxzZSBpZiBtYXRjaC5ub3RlIHRoZW4gJ25vdGUnXG4gICAgZWxlbWVudCA9XG4gICAgICB0eXBlOiBsZXZlbFxuICAgICAgbWVzc2FnZTogbWF0Y2gubWVzc2FnZVxuICAgICAgZmlsZTogbWF0Y2guZmlsZVxuICAgICAgcmFuZ2U6IHJhbmdlXG4gICAgZWxlbWVudHMucHVzaCBlbGVtZW50XG4gIGJ1aWxkTWVzc2FnZXMgZWxlbWVudHMsIGRpc2FibGVkV2FybmluZ3NcblxucGFyc2VKc29uTWVzc2FnZXMgPSAobWVzc2FnZXMsIHtkaXNhYmxlZFdhcm5pbmdzfSkgLT5cbiAgZWxlbWVudHMgPSBbXVxuICBmb3IgaW5wdXQgaW4gbWVzc2FnZXNcbiAgICBjb250aW51ZSB1bmxlc3MgaW5wdXQgYW5kIGlucHV0LnNwYW5zXG4gICAgcHJpbWFyeV9zcGFuID0gaW5wdXQuc3BhbnMuZmluZCAoc3BhbikgLT4gc3Bhbi5pc19wcmltYXJ5XG4gICAgY29udGludWUgdW5sZXNzIHByaW1hcnlfc3BhblxuICAgIHdoaWxlIHByaW1hcnlfc3Bhbi5leHBhbnNpb24gYW5kIHByaW1hcnlfc3Bhbi5leHBhbnNpb24uc3BhblxuICAgICAgcHJpbWFyeV9zcGFuID0gcHJpbWFyeV9zcGFuLmV4cGFuc2lvbi5zcGFuXG4gICAgcmFuZ2UgPSBbXG4gICAgICBbcHJpbWFyeV9zcGFuLmxpbmVfc3RhcnQgLSAxLCBwcmltYXJ5X3NwYW4uY29sdW1uX3N0YXJ0IC0gMV0sXG4gICAgICBbcHJpbWFyeV9zcGFuLmxpbmVfZW5kIC0gMSwgcHJpbWFyeV9zcGFuLmNvbHVtbl9lbmQgLSAxXVxuICAgIF1cbiAgICBpbnB1dC5sZXZlbCA9ICdlcnJvcicgaWYgaW5wdXQubGV2ZWwgPT0gJ2ZhdGFsIGVycm9yJ1xuICAgIGVsZW1lbnQgPVxuICAgICAgdHlwZTogaW5wdXQubGV2ZWxcbiAgICAgIG1lc3NhZ2U6IGlucHV0Lm1lc3NhZ2VcbiAgICAgIGZpbGU6IHByaW1hcnlfc3Bhbi5maWxlX25hbWVcbiAgICAgIHJhbmdlOiByYW5nZVxuICAgICAgY2hpbGRyZW46IGlucHV0LmNoaWxkcmVuXG4gICAgZm9yIHNwYW4gaW4gaW5wdXQuc3BhbnNcbiAgICAgIHVubGVzcyBzcGFuLmlzX3ByaW1hcnlcbiAgICAgICAgZWxlbWVudC5jaGlsZHJlbi5wdXNoXG4gICAgICAgICAgbWVzc2FnZTogc3Bhbi5sYWJlbFxuICAgICAgICAgIHJhbmdlOiBbXG4gICAgICAgICAgICBbc3Bhbi5saW5lX3N0YXJ0IC0gMSwgc3Bhbi5jb2x1bW5fc3RhcnQgLSAxXSxcbiAgICAgICAgICAgIFtzcGFuLmxpbmVfZW5kIC0gMSwgc3Bhbi5jb2x1bW5fZW5kIC0gMV1cbiAgICAgICAgICBdXG4gICAgZWxlbWVudHMucHVzaCBlbGVtZW50XG4gIGJ1aWxkTWVzc2FnZXMgZWxlbWVudHMsIGRpc2FibGVkV2FybmluZ3NcblxucGFyc2VKc29uT3V0cHV0ID0gKG91dHB1dCwge2Rpc2FibGVkV2FybmluZ3MsIGFkZGl0aW9uYWxGaWx0ZXJ9ICkgLT5cbiAgcmVzdWx0cyA9IG91dHB1dC5zcGxpdCgnXFxuJykubWFwIChtZXNzYWdlKSAtPlxuICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnRyaW0oKVxuICAgIGlmIG1lc3NhZ2Uuc3RhcnRzV2l0aCAneydcbiAgICAgIGpzb24gPSBKU09OLnBhcnNlIG1lc3NhZ2VcbiAgICAgIGlmIGFkZGl0aW9uYWxGaWx0ZXI/XG4gICAgICAgIGFkZGl0aW9uYWxGaWx0ZXIoanNvbilcbiAgICAgIGVsc2VcbiAgICAgICAganNvblxuICAuZmlsdGVyIChtKSAtPiBtP1xuICBwYXJzZUpzb25NZXNzYWdlcyByZXN1bHRzLCB7ZGlzYWJsZWRXYXJuaW5nc31cblxuYnVpbGRNZXNzYWdlcyA9IChlbGVtZW50cywgZGlzYWJsZWRXYXJuaW5ncykgLT5cbiAgbWVzc2FnZXMgPSBbXVxuICBsYXN0TWVzc2FnZSA9IG51bGxcbiAgZm9yIGVsZW1lbnQgaW4gZWxlbWVudHNcbiAgICBzd2l0Y2ggZWxlbWVudC50eXBlXG4gICAgICB3aGVuICdpbmZvJywgJ3RyYWNlJywgJ25vdGUnXG4gICAgICAgICMgQWRkIG9ubHkgaWYgdGhlcmUgaXMgYSBsYXN0IG1lc3NhZ2VcbiAgICAgICAgaWYgbGFzdE1lc3NhZ2VcbiAgICAgICAgICBsYXN0TWVzc2FnZS50cmFjZSBvcj0gW11cbiAgICAgICAgICBsYXN0TWVzc2FnZS50cmFjZS5wdXNoXG4gICAgICAgICAgICB0eXBlOiBcIlRyYWNlXCJcbiAgICAgICAgICAgIHRleHQ6IGVsZW1lbnQubWVzc2FnZVxuICAgICAgICAgICAgZmlsZVBhdGg6IGVsZW1lbnQuZmlsZVxuICAgICAgICAgICAgcmFuZ2U6IGVsZW1lbnQucmFuZ2VcbiAgICAgIHdoZW4gJ3dhcm5pbmcnXG4gICAgICAgICMgSWYgdGhlIG1lc3NhZ2UgaXMgd2FybmluZyBhbmQgdXNlciBlbmFibGVkIGRpc2FibGluZyB3YXJuaW5nc1xuICAgICAgICAjIENoZWNrIGlmIHRoaXMgd2FybmluZyBpcyBkaXNhYmxlZFxuICAgICAgICBpZiBkaXNhYmxlZFdhcm5pbmdzIGFuZCBkaXNhYmxlZFdhcm5pbmdzLmxlbmd0aCA+IDBcbiAgICAgICAgICBtZXNzYWdlSXNEaXNhYmxlZExpbnQgPSBmYWxzZVxuICAgICAgICAgIGZvciBkaXNhYmxlZFdhcm5pbmcgaW4gZGlzYWJsZWRXYXJuaW5nc1xuICAgICAgICAgICAgIyBGaW5kIGEgZGlzYWJsZWQgbGludCBpbiB3YXJuaW5nIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIGVsZW1lbnQubWVzc2FnZS5pbmRleE9mKGRpc2FibGVkV2FybmluZykgPj0gMFxuICAgICAgICAgICAgICBtZXNzYWdlSXNEaXNhYmxlZExpbnQgPSB0cnVlXG4gICAgICAgICAgICAgIGxhc3RNZXNzYWdlID0gbnVsbFxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIG5vdCBtZXNzYWdlSXNEaXNhYmxlZExpbnRcbiAgICAgICAgICAgIGxhc3RNZXNzYWdlID0gY29uc3RydWN0TWVzc2FnZSBcIldhcm5pbmdcIiwgZWxlbWVudFxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaCBsYXN0TWVzc2FnZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGFzdE1lc3NhZ2UgPSBjb25zdHJ1Y3RNZXNzYWdlIFwiV2FybmluZ1wiICwgZWxlbWVudFxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2ggbGFzdE1lc3NhZ2VcbiAgICAgIHdoZW4gJ2Vycm9yJywgJ2ZhdGFsIGVycm9yJ1xuICAgICAgICBsYXN0TWVzc2FnZSA9IGNvbnN0cnVjdE1lc3NhZ2UgXCJFcnJvclwiLCBlbGVtZW50XG4gICAgICAgIG1lc3NhZ2VzLnB1c2ggbGFzdE1lc3NhZ2VcbiAgcmV0dXJuIG1lc3NhZ2VzXG5cbmNvbnN0cnVjdE1lc3NhZ2UgPSAodHlwZSwgZWxlbWVudCkgLT5cbiAgbWVzc2FnZSA9XG4gICAgdHlwZTogdHlwZVxuICAgIHRleHQ6IGVsZW1lbnQubWVzc2FnZVxuICAgIGZpbGVQYXRoOiBlbGVtZW50LmZpbGVcbiAgICByYW5nZTogZWxlbWVudC5yYW5nZVxuICAjIGNoaWxkcmVuIGV4aXN0cyBvbmx5IGluIEpTT04gbWVzc2FnZXNcbiAgaWYgZWxlbWVudC5jaGlsZHJlblxuICAgIG1lc3NhZ2UudHJhY2UgPSBbXVxuICAgIGZvciBjaGlsZHJlbiBpbiBlbGVtZW50LmNoaWxkcmVuXG4gICAgICBtZXNzYWdlLnRyYWNlLnB1c2hcbiAgICAgICAgdHlwZTogXCJUcmFjZVwiXG4gICAgICAgIHRleHQ6IGNoaWxkcmVuLm1lc3NhZ2VcbiAgICAgICAgZmlsZVBhdGg6IGVsZW1lbnQuZmlsZVxuICAgICAgICByYW5nZTogY2hpbGRyZW4ucmFuZ2Ugb3IgZWxlbWVudC5yYW5nZVxuICBtZXNzYWdlXG5cbmJ1aWxkUnVzdGNBcmd1bWVudHMgPSAobGludGVyLCBwYXRocykgLT5cbiAgW2VkaXRpbmdGaWxlLCBjYXJnb01hbmlmZXN0UGF0aF0gPSBwYXRoc1xuICBQcm9taXNlLnJlc29sdmUoKS50aGVuICgpID0+XG4gICAgcnVzdGNBcmdzID0gc3dpdGNoIGxpbnRlci5ydXN0Y0J1aWxkVGVzdFxuICAgICAgd2hlbiB0cnVlIHRoZW4gWyctLWNmZycsICd0ZXN0J11cbiAgICAgIGVsc2UgW11cbiAgICBydXN0Y0FyZ3MgPSBydXN0Y0FyZ3MuY29uY2F0IFsnLS1jb2xvcicsICduZXZlciddXG4gICAgY21kID0gW2xpbnRlci5ydXN0Y1BhdGhdXG4gICAgICAuY29uY2F0IHJ1c3RjQXJnc1xuICAgIGlmIGNhcmdvTWFuaWZlc3RQYXRoXG4gICAgICBjbWQucHVzaCAnLUwnXG4gICAgICBjbWQucHVzaCBwYXRoLmpvaW4gcGF0aC5kaXJuYW1lKGNhcmdvTWFuaWZlc3RQYXRoKSwgbGludGVyLmNhcmdvRGVwZW5kZW5jeURpclxuICAgIGNvbXBpbGF0aW9uRmVhdHVyZXMgPSBsaW50ZXIuY29tcGlsYXRpb25GZWF0dXJlcyhmYWxzZSlcbiAgICBjbWQgPSBjbWQuY29uY2F0IGNvbXBpbGF0aW9uRmVhdHVyZXMgaWYgY29tcGlsYXRpb25GZWF0dXJlc1xuICAgIGNtZCA9IGNtZC5jb25jYXQgW2VkaXRpbmdGaWxlXVxuICAgIFtlZGl0aW5nRmlsZSwgY21kXVxuXG5jYWNoZWRVc2luZ011bHRpdG9vbEZvckNsaXBweSA9IG51bGxcblxuYnVpbGRDYXJnb0FyZ3VtZW50cyA9IChsaW50ZXIsIGNhcmdvTWFuaWZlc3RQYXRoKSAtPlxuICBidWlsZENhcmdvUGF0aCA9IChjYXJnb1BhdGgsIGNhcmdvQ29tbWFuZCkgLT5cbiAgICAjIHRoZSByZXN1bHQgaXMgY2FjaGVkIHRvIGF2b2lkIGRlbGF5c1xuICAgIGlmIGNhY2hlZFVzaW5nTXVsdGl0b29sRm9yQ2xpcHB5PyBhbmQgbGludGVyLmFsbG93ZWRUb0NhY2hlVmVyc2lvbnNcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4gKCkgPT5cbiAgICAgICAgY2FjaGVkVXNpbmdNdWx0aXRvb2xGb3JDbGlwcHlcbiAgICBlbHNlXG4gICAgICAjIERlY2lkZSBpZiBzaG91bGQgdXNlIG9sZGVyIG11bHRpcnVzdCBvciBuZXdlciBydXN0dXBcbiAgICAgIHVzaW5nTXVsdGl0b29sRm9yQ2xpcHB5ID1cbiAgICAgICAgYXRvbV9saW50ZXIuZXhlYyAncnVzdHVwJywgWyctLXZlcnNpb24nXSwge2lnbm9yZUV4aXRDb2RlOiB0cnVlfVxuICAgICAgICAgIC50aGVuIC0+XG4gICAgICAgICAgICByZXN1bHQ6IHRydWUsIHRvb2w6ICdydXN0dXAnXG4gICAgICAgICAgLmNhdGNoIC0+XG4gICAgICAgICAgICAjIFRyeSB0byB1c2Ugb2xkZXIgbXVsdGlydXN0IGF0IGxlYXN0XG4gICAgICAgICAgICBhdG9tX2xpbnRlci5leGVjICdtdWx0aXJ1c3QnLCBbJy0tdmVyc2lvbiddLCB7aWdub3JlRXhpdENvZGU6IHRydWV9XG4gICAgICAgICAgICAgIC50aGVuIC0+XG4gICAgICAgICAgICAgICAgcmVzdWx0OiB0cnVlLCB0b29sOiAnbXVsdGlydXN0J1xuICAgICAgICAgICAgICAuY2F0Y2ggLT5cbiAgICAgICAgICAgICAgICByZXN1bHQ6IGZhbHNlXG4gICAgICB1c2luZ011bHRpdG9vbEZvckNsaXBweS50aGVuIChjYW5Vc2VNdWx0aXJ1c3QpIC0+XG4gICAgICAgIGlmIGNhcmdvQ29tbWFuZCA9PSAnY2xpcHB5JyBhbmQgY2FuVXNlTXVsdGlydXN0LnJlc3VsdFxuICAgICAgICAgIFtjYW5Vc2VNdWx0aXJ1c3QudG9vbCwgJ3J1bicsICduaWdodGx5JywgJ2NhcmdvJ11cbiAgICAgICAgZWxzZVxuICAgICAgICAgIFtjYXJnb1BhdGhdXG4gICAgICAudGhlbiAoY2FjaGVkKSA9PlxuICAgICAgICBjYWNoZWRVc2luZ011bHRpdG9vbEZvckNsaXBweSA9IGNhY2hlZFxuICAgICAgICBjYWNoZWRcblxuICBjYXJnb0FyZ3MgPSBzd2l0Y2ggbGludGVyLmNhcmdvQ29tbWFuZFxuICAgIHdoZW4gJ2NoZWNrJyB0aGVuIFsnY2hlY2snXVxuICAgIHdoZW4gJ3Rlc3QnIHRoZW4gWyd0ZXN0JywgJy0tbm8tcnVuJ11cbiAgICB3aGVuICdydXN0YycgdGhlbiBbJ3J1c3RjJywgJy0tY29sb3InLCAnbmV2ZXInXVxuICAgIHdoZW4gJ2NsaXBweScgdGhlbiBbJ2NsaXBweSddXG4gICAgZWxzZSBbJ2J1aWxkJ11cblxuICBjb21waWxhdGlvbkZlYXR1cmVzID0gbGludGVyLmNvbXBpbGF0aW9uRmVhdHVyZXModHJ1ZSlcbiAgYnVpbGRDYXJnb1BhdGgobGludGVyLmNhcmdvUGF0aCwgbGludGVyLmNhcmdvQ29tbWFuZCkudGhlbiAoY21kKSAtPlxuICAgIGNtZCA9IGNtZFxuICAgICAgLmNvbmNhdCBjYXJnb0FyZ3NcbiAgICAgIC5jb25jYXQgWyctaicsIGxpbnRlci5qb2JzTnVtYmVyXVxuICAgIGNtZCA9IGNtZC5jb25jYXQgY29tcGlsYXRpb25GZWF0dXJlcyBpZiBjb21waWxhdGlvbkZlYXR1cmVzXG4gICAgY21kID0gY21kLmNvbmNhdCBbJy0tbWFuaWZlc3QtcGF0aCcsIGNhcmdvTWFuaWZlc3RQYXRoXVxuICAgIFtjYXJnb01hbmlmZXN0UGF0aCwgY21kXVxuXG4jIFRoZXNlIGRlZmluZSB0aGUgYmVoYWJpb3VyIG9mIGVhY2ggZXJyb3IgbW9kZSBsaW50ZXItcnVzdCBoYXNcbmVycm9yTW9kZXMgPVxuICBKU09OX1JVU1RDOlxuICAgIG5lZWRlZE91dHB1dDogKHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgc3RkZXJyXG5cbiAgICBwYXJzZTogKG91dHB1dCwgb3B0aW9ucykgPT5cbiAgICAgIHBhcnNlSnNvbk91dHB1dCBvdXRwdXQsIG9wdGlvbnNcblxuICAgIGJ1aWxkQXJndW1lbnRzOiAobGludGVyLCBmaWxlKSAtPlxuICAgICAgYnVpbGRSdXN0Y0FyZ3VtZW50cyhsaW50ZXIsIGZpbGUpLnRoZW4gKGNtZF9yZXMpIC0+XG4gICAgICAgIFtmaWxlLCBjbWRdID0gY21kX3Jlc1xuICAgICAgICBjbWQgPSBjbWQuY29uY2F0IFsnLS1lcnJvci1mb3JtYXQ9anNvbiddXG4gICAgICAgIFtmaWxlLCBjbWRdXG5cbiAgSlNPTl9DQVJHTzpcbiAgICBuZWVkZWRPdXRwdXQ6IChzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgIHN0ZG91dFxuXG4gICAgcGFyc2U6IChvdXRwdXQsIG9wdGlvbnMpIC0+XG4gICAgICBvcHRpb25zLmFkZGl0aW9uYWxGaWx0ZXIgPSAoanNvbikgLT5cbiAgICAgICAgaWYganNvbj8gYW5kIGpzb24ucmVhc29uID09IFwiY29tcGlsZXItbWVzc2FnZVwiXG4gICAgICAgICAganNvbi5tZXNzYWdlXG4gICAgICBwYXJzZUpzb25PdXRwdXQgb3V0cHV0LCBvcHRpb25zXG5cbiAgICBidWlsZEFyZ3VtZW50czogKGxpbnRlciwgZmlsZSkgLT5cbiAgICAgIGJ1aWxkQ2FyZ29Bcmd1bWVudHMobGludGVyLCBmaWxlKS50aGVuIChjbWRfcmVzKSAtPlxuICAgICAgICBbZmlsZSwgY21kXSA9IGNtZF9yZXNcbiAgICAgICAgY21kID0gY21kLmNvbmNhdCBbJy0tbWVzc2FnZS1mb3JtYXQnLCAnanNvbiddXG4gICAgICAgIFtmaWxlLCBjbWRdXG5cbiAgRkxBR1NfSlNPTl9DQVJHTzpcbiAgICBuZWVkZWRPdXRwdXQ6IChzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgIHN0ZGVyclxuXG4gICAgcGFyc2U6IHBhcnNlSnNvbk91dHB1dFxuXG4gICAgYnVpbGRBcmd1bWVudHM6IGJ1aWxkQ2FyZ29Bcmd1bWVudHNcblxuICBPTERfUlVTVEM6XG4gICAgbmVlZGVkT3V0cHV0OiAoc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBzdGRlcnJcblxuICAgIHBhcnNlOiBwYXJzZU9sZE1lc3NhZ2VzXG5cbiAgICBidWlsZEFyZ3VtZW50czogYnVpbGRSdXN0Y0FyZ3VtZW50c1xuXG4gIE9MRF9DQVJHTzpcbiAgICBuZWVkZWRPdXRwdXQ6IChzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgIHN0ZGVyclxuXG4gICAgcGFyc2U6IHBhcnNlT2xkTWVzc2FnZXNcblxuICAgIGJ1aWxkQXJndW1lbnRzOiBidWlsZENhcmdvQXJndW1lbnRzXG5cbm1vZHVsZS5leHBvcnRzID0gZXJyb3JNb2Rlc1xuIl19
