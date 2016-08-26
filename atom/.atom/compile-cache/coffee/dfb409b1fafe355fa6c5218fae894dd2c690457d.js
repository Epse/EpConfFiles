(function() {
  var constantRegex, fullMethodRegex, methodDisplayTextRegex, methodRegex, openFullMethodRegex, paramMethodRegex, proc, propertyRegex;

  proc = require('child_process');

  propertyRegex = /(private|protected|public)\s(static)?\s?\$(\w+)/;

  constantRegex = /const\s(\w+)/;

  methodRegex = /function\s(\w+)/;

  paramMethodRegex = /function\s\w+\(([\s\S]*)\)/;

  fullMethodRegex = /(public|private|protected)?\s?(static)?\s?function\s(\w+)\((.*)\)/;

  openFullMethodRegex = /(public|private|protected)?\s?(static)?\s?function\s\w+\(?(.*)?\)?/;

  methodDisplayTextRegex = /(public|private|protected)?\s?(static)?\s?function\s(\w+\s?\((.*)\))/;

  module.exports = {
    selector: '.source.php',
    disableForSelector: '.source.php .comment',
    inclusionPriority: 0,
    excludeLowerPriority: false,
    filterSuggestions: true,
    getSuggestions: function(_arg) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      prefix = this.getPrefix(editor, bufferPosition);
      return new Promise((function(_this) {
        return function(resolve) {
          var completions, local, matches, mergeWithLocal, objectType, setAsInherited;
          if (matches = _this.matchCurrentContext(prefix)) {
            if (matches[0] === "$this->") {
              local = _this.getLocalAvailableCompletions(editor, prefix);
              objectType = _this.getParentClassName(editor);
              mergeWithLocal = function(inheritedCompletions) {
                var completion, localCompletion, _i, _j, _len, _len1;
                for (_i = 0, _len = inheritedCompletions.length; _i < _len; _i++) {
                  completion = inheritedCompletions[_i];
                  completion.rightLabel = '(inherited)';
                  for (_j = 0, _len1 = local.length; _j < _len1; _j++) {
                    localCompletion = local[_j];
                    if (localCompletion.text === completion.text) {
                      localCompletion.rightLabel = '(override)';
                    }
                  }
                }
                return resolve(local.concat(inheritedCompletions));
              };
              return _this.getObjectAvailableMethods(editor, prefix, objectType, mergeWithLocal);
            } else if (matches[0] === "parent::") {
              objectType = _this.getParentClassName(editor);
              setAsInherited = function(completions) {
                var completion, _i, _len;
                for (_i = 0, _len = completions.length; _i < _len; _i++) {
                  completion = completions[_i];
                  completion.rightLabel = '(inherited)';
                }
                return resolve(completions);
              };
              return _this.getObjectAvailableMethods(editor, prefix, objectType, setAsInherited);
            } else if (matches[0] === "self::") {
              completions = _this.getLocalAvailableCompletions(editor).filter(function(item) {
                return item.isStatic;
              });
              return resolve(completions);
            }
          } else if (objectType = _this.isKnownObject(editor, bufferPosition, prefix)) {
            return _this.getObjectAvailableMethods(editor, prefix, objectType, resolve);
          } else {
            return resolve([]);
          }
        };
      })(this));
    },
    matchCurrentContext: function(prefix) {
      return prefix.match(/(\$this->|parent::|self::|static::)/);
    },
    getLocalAvailableCompletions: function(editor) {
      var completions, inline, line, ma, matches, methodMatches, _i, _len, _ref;
      inline = [];
      completions = [];
      _ref = editor.buffer.getLines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (inline.length === 0) {
          ma = null;
        }
        if (inline.length > 0) {
          inline.push(line);
          ma = inline.join('').match(methodRegex);
          if (ma) {
            inline = [];
          }
        }
        if (matches = line.match(propertyRegex)) {
          completions.push(this.createVariableCompletion(matches));
        } else if (matches = line.match(constantRegex)) {
          completions.push(this.createConstantCompletion(matches));
        } else if (matches = line.match(methodRegex) || ma) {
          methodMatches = matches.input.match(fullMethodRegex);
          if (methodMatches === null) {
            inline.push(matches.input);
          }
          if (methodMatches !== null) {
            completions.push(this.createMehodCompletion(methodMatches));
          }
        }
      }
      return completions;
    },
    createVariableCompletion: function(matches) {
      return this.createCompletion({
        name: "$" + matches[3],
        snippet: "" + matches[3] + "${2}",
        isStatic: matches[2] !== void 0,
        visibility: matches[1],
        type: 'property'
      });
    },
    createConstantCompletion: function(matches) {
      return this.createCompletion({
        name: matches[1],
        snippet: "" + matches[1] + "${2}",
        isStatic: false,
        visibility: void 0,
        type: 'constant'
      });
    },
    createMehodCompletion: function(matches) {
      return this.createCompletion({
        name: this.createMethodDisplayText(matches.input),
        snippet: this.createMethodSnippet(matches),
        isStatic: matches[2] !== void 0,
        visibility: matches[1],
        type: 'method'
      });
    },
    createMethodSnippet: function(matches) {
      var mapped, parameters, parametersLength;
      parameters = matches[4].match(/\$\w+/g);
      mapped = '';
      parametersLength = 0;
      if (parameters) {
        mapped = parameters.map(function(item, index) {
          return "${" + (index + 2) + ":" + item + "}";
        }).join(',');
        parametersLength = parameters.length;
      }
      return "" + matches[3] + "(" + mapped + ")${" + (parametersLength + 2) + "}";
    },
    createMethodDisplayText: function(input) {
      var formattedParams, matches;
      matches = input.match(methodDisplayTextRegex);
      if (matches !== null) {
        formattedParams = matches[4].split(',').map(function(item) {
          return item.split(' ').filter(function(item) {
            return item !== '';
          }).join(' ');
        }).join(', ');
        return matches[3].replace(matches[4], formattedParams);
      }
    },
    isKnownObject: function(editor, bufferPosition, prefix) {
      var currentMethodParams, param, regex, _i, _len;
      currentMethodParams = this.getMethodParams(editor, bufferPosition);
      if (currentMethodParams !== void 0) {
        for (_i = 0, _len = currentMethodParams.length; _i < _len; _i++) {
          param = currentMethodParams[_i];
          if (prefix.indexOf(param.varName) === 0) {
            if (param.objectType !== void 0) {
              regex = "\\$" + (param.varName.substr(1)) + "\\-\\>";
              if (prefix.match(regex)) {
                return param.objectType;
              } else {
                return false;
              }
            }
          }
        }
      }
    },
    getMethodParams: function(editor, bufferPosition) {
      var fullMethodString, parametersSplited, parametersString, result;
      fullMethodString = this.getFullMethodDefinition(editor, bufferPosition);
      parametersString = fullMethodString.match(paramMethodRegex);
      if (parametersString !== null) {
        parametersSplited = parametersString[1].split(',');
        result = parametersSplited.map(function(item) {
          var words;
          words = item.trim().split(' ');
          return {
            objectType: words[1] ? words[0] : void 0,
            varName: words[1] ? words[1] : words[0]
          };
        });
      }
      return result;
    },
    getFullMethodDefinition: function(editor, bufferPosition) {
      var fullMethodString, i, inline, lines, m, matches, totalLines, _i, _ref;
      lines = editor.buffer.getLines();
      totalLines = lines.length;
      inline = [];
      for (i = _i = _ref = bufferPosition.row; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
        inline.push(lines[i]);
        if (matches = lines[i].match(methodRegex)) {
          fullMethodString = inline.reverse().reduce(function(previous, current) {
            return previous.trim() + current.trim();
          });
          if (m = fullMethodString.match(fullMethodRegex)) {
            return m[0];
          }
        }
      }
      return '';
    },
    getObjectAvailableMethods: function(editor, prefix, objectType, resolve) {
      var currentNamespace, fullName, isValid, line, matches, namespaceMatch, regex, _i, _len, _ref;
      regex = /^use(.*)$/;
      currentNamespace = '';
      _ref = editor.buffer.getLines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (namespaceMatch = line.match(/namespace\s+(.+);/)) {
          currentNamespace += namespaceMatch[1];
        }
        if (matches = line.match(regex)) {
          isValid = matches[1].split('\\').map(function(item) {
            var l;
            l = item.split(';')[0].split(' as ');
            if (l.length === 1) {
              return l[0] === objectType;
            } else if (l.length === 2) {
              return l[0] === objectType || l[1] === objectType;
            }
          }).filter(function(item) {
            return item === true;
          });
          if (isValid.length > 0) {
            return this.fetchAndResolveDependencies(matches[1].match(objectType), prefix, resolve);
          }
        }
      }
      if (currentNamespace !== '') {
        fullName = currentNamespace + objectType;
        return this.fetchAndResolveDependencies(fullName, prefix, resolve);
      }
      return resolve([]);
    },
    fetchAndResolveDependencies: function(lastMatch, prefix, resolve) {
      var autoload, namespace, process, script;
      namespace = this.parseNamespace(lastMatch);
      script = this.getScript();
      autoload = this.getAutoloadPath();
      process = proc.spawn("php", [script, autoload, namespace]);
      this.compiled = '';
      this.errorCompiled = '';
      this.availableResources = [];
      process.stdout.on('data', (function(_this) {
        return function(data) {
          return _this.compiled += data;
        };
      })(this));
      process.stderr.on('data', function(data) {
        return this.errorCompiled += data;
      });
      return process.on('close', (function(_this) {
        return function(code) {
          var completions, error, resource, _i, _len, _ref;
          try {
            _this.availableResources = JSON.parse(_this.compiled);
            completions = [];
            _ref = _this.availableResources;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              resource = _ref[_i];
              if (prefix.indexOf(resource.name)) {
                completions.push(_this.createCompletion(resource));
              }
            }
            return resolve(completions);
          } catch (_error) {
            error = _error;
            return console.log(error, code, _this.compiled, _this.errorCompiled);
          }
        };
      })(this));
    },
    getAutoloadPath: function() {
      return atom.project.getPaths()[0] + '/vendor/autoload.php';
    },
    getScript: function() {
      return __dirname + '/../scripts/main.php';
    },
    parseNamespace: function(lastMatch) {
      if (typeof lastMatch === 'string') {
        return lastMatch;
      }
      return lastMatch.input.substring(1, lastMatch.input.length - 1).split(' as ')[0];
    },
    createCompletion: function(completion) {
      var _ref;
      return {
        text: completion.name,
        snippet: completion.snippet,
        displayText: completion.name,
        type: (_ref = completion.type) != null ? _ref : 'method',
        leftLabel: "" + completion.visibility + (completion.isStatic ? ' static' : ''),
        className: "method-" + completion.visibility,
        isStatic: completion.isStatic
      };
    },
    getParentClassName: function(editor) {
      var classMatch, line, namespace, _i, _len, _ref;
      namespace = '';
      _ref = editor.buffer.getLines();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        classMatch = line.match(/class\s\w+\s?extends?\s?(\w+)?/);
        if (classMatch !== null) {
          return "\\" + classMatch[1];
        }
      }
    },
    onDidInsertSuggestion: function(_arg) {
      var editor, suggestion, triggerPosition;
      editor = _arg.editor, triggerPosition = _arg.triggerPosition, suggestion = _arg.suggestion;
    },
    dispose: function() {},
    getPrefix: function(editor, bufferPosition) {
      var line, regex, _ref;
      regex = /[\$\w0-9:>_-]+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref = line.match(regex)) != null ? _ref[0] : void 0) || '';
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waHAtY29tcG9zZXItY29tcGxldGlvbi9saWIvcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtIQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsaURBRmhCLENBQUE7O0FBQUEsRUFHQSxhQUFBLEdBQWdCLGNBSGhCLENBQUE7O0FBQUEsRUFJQSxXQUFBLEdBQWMsaUJBSmQsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLDRCQUxuQixDQUFBOztBQUFBLEVBTUEsZUFBQSxHQUFrQixtRUFObEIsQ0FBQTs7QUFBQSxFQU9BLG1CQUFBLEdBQXNCLG9FQVB0QixDQUFBOztBQUFBLEVBUUEsc0JBQUEsR0FBeUIsc0VBUnpCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUVJO0FBQUEsSUFBQSxRQUFBLEVBQVUsYUFBVjtBQUFBLElBQ0Esa0JBQUEsRUFBb0Isc0JBRHBCO0FBQUEsSUFNQSxpQkFBQSxFQUFtQixDQU5uQjtBQUFBLElBT0Esb0JBQUEsRUFBc0IsS0FQdEI7QUFBQSxJQVFBLGlCQUFBLEVBQW1CLElBUm5CO0FBQUEsSUFXQSxjQUFBLEVBQWdCLFNBQUMsSUFBRCxHQUFBO0FBRVosVUFBQSwrQ0FBQTtBQUFBLE1BRmMsY0FBQSxRQUFRLHNCQUFBLGdCQUFnQix1QkFBQSxpQkFBaUIsY0FBQSxNQUV2RCxDQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CLENBQVQsQ0FBQTthQUVJLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNSLGNBQUEsdUVBQUE7QUFBQSxVQUFBLElBQUcsT0FBQSxHQUFVLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQixDQUFiO0FBQ0ksWUFBQSxJQUFHLE9BQVEsQ0FBQSxDQUFBLENBQVIsS0FBYyxTQUFqQjtBQUVJLGNBQUEsS0FBQSxHQUFRLEtBQUMsQ0FBQSw0QkFBRCxDQUE4QixNQUE5QixFQUFxQyxNQUFyQyxDQUFSLENBQUE7QUFBQSxjQUVBLFVBQUEsR0FBYSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEIsQ0FGYixDQUFBO0FBQUEsY0FJQSxjQUFBLEdBQWlCLFNBQUMsb0JBQUQsR0FBQTtBQUNiLG9CQUFBLGdEQUFBO0FBQUEscUJBQUEsMkRBQUE7d0RBQUE7QUFDSSxrQkFBQSxVQUFVLENBQUMsVUFBWCxHQUF3QixhQUF4QixDQUFBO0FBQ0EsdUJBQUEsOENBQUE7Z0RBQUE7QUFDSSxvQkFBQSxJQUFHLGVBQWUsQ0FBQyxJQUFoQixLQUF3QixVQUFVLENBQUMsSUFBdEM7QUFDSSxzQkFBQSxlQUFlLENBQUMsVUFBaEIsR0FBNkIsWUFBN0IsQ0FESjtxQkFESjtBQUFBLG1CQUZKO0FBQUEsaUJBQUE7dUJBTUEsT0FBQSxDQUFRLEtBQUssQ0FBQyxNQUFOLENBQWEsb0JBQWIsQ0FBUixFQVBhO2NBQUEsQ0FKakIsQ0FBQTtxQkFhQSxLQUFDLENBQUEseUJBQUQsQ0FBMkIsTUFBM0IsRUFBbUMsTUFBbkMsRUFBMkMsVUFBM0MsRUFBdUQsY0FBdkQsRUFmSjthQUFBLE1BZ0JLLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLFVBQWpCO0FBQ0QsY0FBQSxVQUFBLEdBQWEsS0FBQyxDQUFBLGtCQUFELENBQW9CLE1BQXBCLENBQWIsQ0FBQTtBQUFBLGNBQ0EsY0FBQSxHQUFpQixTQUFDLFdBQUQsR0FBQTtBQUNiLG9CQUFBLG9CQUFBO0FBQUEscUJBQUEsa0RBQUE7K0NBQUE7QUFDSSxrQkFBQSxVQUFVLENBQUMsVUFBWCxHQUF3QixhQUF4QixDQURKO0FBQUEsaUJBQUE7dUJBR0EsT0FBQSxDQUFRLFdBQVIsRUFKYTtjQUFBLENBRGpCLENBQUE7cUJBT0EsS0FBQyxDQUFBLHlCQUFELENBQTJCLE1BQTNCLEVBQW1DLE1BQW5DLEVBQTJDLFVBQTNDLEVBQXVELGNBQXZELEVBUkM7YUFBQSxNQVNBLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLFFBQWpCO0FBQ0QsY0FBQSxXQUFBLEdBQWMsS0FBQyxDQUFBLDRCQUFELENBQThCLE1BQTlCLENBQXFDLENBQUMsTUFBdEMsQ0FBNkMsU0FBQyxJQUFELEdBQUE7dUJBQVUsSUFBSSxDQUFDLFNBQWY7Y0FBQSxDQUE3QyxDQUFkLENBQUE7cUJBQ0EsT0FBQSxDQUFRLFdBQVIsRUFGQzthQTFCVDtXQUFBLE1BNkJLLElBQUcsVUFBQSxHQUFhLEtBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQUF1QixjQUF2QixFQUF1QyxNQUF2QyxDQUFoQjttQkFDRCxLQUFDLENBQUEseUJBQUQsQ0FBMkIsTUFBM0IsRUFBbUMsTUFBbkMsRUFBMkMsVUFBM0MsRUFBdUQsT0FBdkQsRUFEQztXQUFBLE1BQUE7bUJBR0QsT0FBQSxDQUFRLEVBQVIsRUFIQztXQTlCRztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFKUTtJQUFBLENBWGhCO0FBQUEsSUFrREEsbUJBQUEsRUFBcUIsU0FBQyxNQUFELEdBQUE7YUFFakIsTUFBTSxDQUFDLEtBQVAsQ0FBYSxxQ0FBYixFQUZpQjtJQUFBLENBbERyQjtBQUFBLElBc0RBLDRCQUFBLEVBQThCLFNBQUMsTUFBRCxHQUFBO0FBRTFCLFVBQUEscUVBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxFQURkLENBQUE7QUFHQTtBQUFBLFdBQUEsMkNBQUE7d0JBQUE7QUFFSSxRQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBcEI7QUFDSSxVQUFBLEVBQUEsR0FBSyxJQUFMLENBREo7U0FBQTtBQUdBLFFBQUEsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFuQjtBQUVJLFVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUEsQ0FBQTtBQUFBLFVBRUEsRUFBQSxHQUFLLE1BQU0sQ0FBQyxJQUFQLENBQVksRUFBWixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsV0FBdEIsQ0FGTCxDQUFBO0FBSUEsVUFBQSxJQUFHLEVBQUg7QUFDSSxZQUFBLE1BQUEsR0FBUyxFQUFULENBREo7V0FOSjtTQUhBO0FBWUEsUUFBQSxJQUFHLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLGFBQVgsQ0FBYjtBQUNJLFVBQUEsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLHdCQUFELENBQTBCLE9BQTFCLENBQWpCLENBQUEsQ0FESjtTQUFBLE1BRUssSUFBRyxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLENBQWI7QUFDRCxVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixPQUExQixDQUFqQixDQUFBLENBREM7U0FBQSxNQUVBLElBQUcsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBWCxDQUFBLElBQTJCLEVBQXhDO0FBQ0QsVUFBQSxhQUFBLEdBQWdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBZCxDQUFvQixlQUFwQixDQUFoQixDQUFBO0FBRUEsVUFBQSxJQUFHLGFBQUEsS0FBaUIsSUFBcEI7QUFDSSxZQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLEtBQXBCLENBQUEsQ0FESjtXQUZBO0FBS0EsVUFBQSxJQUFPLGFBQUEsS0FBaUIsSUFBeEI7QUFDSSxZQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixhQUF2QixDQUFqQixDQUFBLENBREo7V0FOQztTQWxCVDtBQUFBLE9BSEE7QUE4QkEsYUFBTyxXQUFQLENBaEMwQjtJQUFBLENBdEQ5QjtBQUFBLElBd0ZBLHdCQUFBLEVBQTBCLFNBQUMsT0FBRCxHQUFBO2FBQ3RCLElBQUMsQ0FBQSxnQkFBRCxDQUNJO0FBQUEsUUFBQSxJQUFBLEVBQU0sR0FBQSxHQUFJLE9BQVEsQ0FBQSxDQUFBLENBQWxCO0FBQUEsUUFDQSxPQUFBLEVBQVMsRUFBQSxHQUFHLE9BQVEsQ0FBQSxDQUFBLENBQVgsR0FBYyxNQUR2QjtBQUFBLFFBRUEsUUFBQSxFQUFVLE9BQVEsQ0FBQSxDQUFBLENBQVIsS0FBYyxNQUZ4QjtBQUFBLFFBR0EsVUFBQSxFQUFZLE9BQVEsQ0FBQSxDQUFBLENBSHBCO0FBQUEsUUFJQSxJQUFBLEVBQU0sVUFKTjtPQURKLEVBRHNCO0lBQUEsQ0F4RjFCO0FBQUEsSUFnR0Esd0JBQUEsRUFBMEIsU0FBQyxPQUFELEdBQUE7YUFDdEIsSUFBQyxDQUFBLGdCQUFELENBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFRLENBQUEsQ0FBQSxDQUFkO0FBQUEsUUFDQSxPQUFBLEVBQVMsRUFBQSxHQUFHLE9BQVEsQ0FBQSxDQUFBLENBQVgsR0FBYyxNQUR2QjtBQUFBLFFBRUEsUUFBQSxFQUFVLEtBRlY7QUFBQSxRQUdBLFVBQUEsRUFBWSxNQUhaO0FBQUEsUUFJQSxJQUFBLEVBQU0sVUFKTjtPQURKLEVBRHNCO0lBQUEsQ0FoRzFCO0FBQUEsSUF5R0EscUJBQUEsRUFBdUIsU0FBQyxPQUFELEdBQUE7YUFDbkIsSUFBQyxDQUFBLGdCQUFELENBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsT0FBTyxDQUFDLEtBQWpDLENBQU47QUFBQSxRQUNBLE9BQUEsRUFBUyxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBckIsQ0FEVDtBQUFBLFFBRUEsUUFBQSxFQUFVLE9BQVEsQ0FBQSxDQUFBLENBQVIsS0FBYyxNQUZ4QjtBQUFBLFFBR0EsVUFBQSxFQUFZLE9BQVEsQ0FBQSxDQUFBLENBSHBCO0FBQUEsUUFJQSxJQUFBLEVBQU0sUUFKTjtPQURKLEVBRG1CO0lBQUEsQ0F6R3ZCO0FBQUEsSUFrSEEsbUJBQUEsRUFBcUIsU0FBQyxPQUFELEdBQUE7QUFFakIsVUFBQSxvQ0FBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFYLENBQWlCLFFBQWpCLENBQWIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLEVBRFQsQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsQ0FGbkIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxVQUFIO0FBQ0ksUUFBQSxNQUFBLEdBQVMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxTQUFDLElBQUQsRUFBTSxLQUFOLEdBQUE7aUJBQWlCLElBQUEsR0FBRyxDQUFDLEtBQUEsR0FBTSxDQUFQLENBQUgsR0FBWSxHQUFaLEdBQWUsSUFBZixHQUFvQixJQUFyQztRQUFBLENBQWYsQ0FBdUQsQ0FBQyxJQUF4RCxDQUE2RCxHQUE3RCxDQUFULENBQUE7QUFBQSxRQUNBLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxNQUQ5QixDQURKO09BSkE7YUFRQSxFQUFBLEdBQUcsT0FBUSxDQUFBLENBQUEsQ0FBWCxHQUFjLEdBQWQsR0FBaUIsTUFBakIsR0FBd0IsS0FBeEIsR0FBNEIsQ0FBQyxnQkFBQSxHQUFpQixDQUFsQixDQUE1QixHQUFnRCxJQVYvQjtJQUFBLENBbEhyQjtBQUFBLElBOEhBLHVCQUFBLEVBQXlCLFNBQUMsS0FBRCxHQUFBO0FBRXJCLFVBQUEsd0JBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsS0FBTixDQUFZLHNCQUFaLENBQVYsQ0FBQTtBQUVBLE1BQUEsSUFBTyxPQUFBLEtBQVcsSUFBbEI7QUFFSSxRQUFBLGVBQUEsR0FBa0IsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVgsQ0FBaUIsR0FBakIsQ0FBcUIsQ0FBQyxHQUF0QixDQUNkLFNBQUMsSUFBRCxHQUFBO2lCQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQUMsTUFBaEIsQ0FDSSxTQUFDLElBQUQsR0FBQTttQkFDSSxJQUFBLEtBQVEsR0FEWjtVQUFBLENBREosQ0FHQyxDQUFDLElBSEYsQ0FHTyxHQUhQLEVBREo7UUFBQSxDQURjLENBTWpCLENBQUMsSUFOZ0IsQ0FNWCxJQU5XLENBQWxCLENBQUE7ZUFRQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBWCxDQUFtQixPQUFRLENBQUEsQ0FBQSxDQUEzQixFQUErQixlQUEvQixFQVZKO09BSnFCO0lBQUEsQ0E5SHpCO0FBQUEsSUErSUEsYUFBQSxFQUFlLFNBQUMsTUFBRCxFQUFRLGNBQVIsRUFBdUIsTUFBdkIsR0FBQTtBQUVYLFVBQUEsMkNBQUE7QUFBQSxNQUFBLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLEVBQXdCLGNBQXhCLENBQXRCLENBQUE7QUFFQSxNQUFBLElBQU8sbUJBQUEsS0FBdUIsTUFBOUI7QUFDSSxhQUFBLDBEQUFBOzBDQUFBO0FBQ0ksVUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsS0FBSyxDQUFDLE9BQXJCLENBQUEsS0FBaUMsQ0FBcEM7QUFDSSxZQUFBLElBQU8sS0FBSyxDQUFDLFVBQU4sS0FBb0IsTUFBM0I7QUFDSSxjQUFBLEtBQUEsR0FBUyxLQUFBLEdBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWQsQ0FBcUIsQ0FBckIsQ0FBRCxDQUFKLEdBQTZCLFFBQXRDLENBQUE7QUFDTyxjQUFBLElBQUcsTUFBTSxDQUFDLEtBQVAsQ0FBYSxLQUFiLENBQUg7dUJBQTRCLEtBQUssQ0FBQyxXQUFsQztlQUFBLE1BQUE7dUJBQWtELE1BQWxEO2VBRlg7YUFESjtXQURKO0FBQUEsU0FESjtPQUpXO0lBQUEsQ0EvSWY7QUFBQSxJQTBKQSxlQUFBLEVBQWlCLFNBQUMsTUFBRCxFQUFRLGNBQVIsR0FBQTtBQUViLFVBQUEsNkRBQUE7QUFBQSxNQUFBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUF6QixFQUFnQyxjQUFoQyxDQUFuQixDQUFBO0FBQUEsTUFDQSxnQkFBQSxHQUFtQixnQkFBZ0IsQ0FBQyxLQUFqQixDQUF1QixnQkFBdkIsQ0FEbkIsQ0FBQTtBQUdBLE1BQUEsSUFBTyxnQkFBQSxLQUFvQixJQUEzQjtBQUNJLFFBQUEsaUJBQUEsR0FBb0IsZ0JBQWlCLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBcEIsQ0FBMEIsR0FBMUIsQ0FBcEIsQ0FBQTtBQUFBLFFBRUEsTUFBQSxHQUFTLGlCQUFpQixDQUFDLEdBQWxCLENBQXVCLFNBQUMsSUFBRCxHQUFBO0FBRTVCLGNBQUEsS0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBUixDQUFBO2lCQUVBO0FBQUEsWUFBQSxVQUFBLEVBQWUsS0FBTSxDQUFBLENBQUEsQ0FBVCxHQUFpQixLQUFNLENBQUEsQ0FBQSxDQUF2QixHQUErQixNQUEzQztBQUFBLFlBQ0EsT0FBQSxFQUFZLEtBQU0sQ0FBQSxDQUFBLENBQVQsR0FBaUIsS0FBTSxDQUFBLENBQUEsQ0FBdkIsR0FBK0IsS0FBTSxDQUFBLENBQUEsQ0FEOUM7WUFKNEI7UUFBQSxDQUF2QixDQUZULENBREo7T0FIQTthQWNBLE9BaEJhO0lBQUEsQ0ExSmpCO0FBQUEsSUE0S0EsdUJBQUEsRUFBeUIsU0FBQyxNQUFELEVBQVEsY0FBUixHQUFBO0FBQ3JCLFVBQUEsb0VBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWQsQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxLQUFLLENBQUMsTUFEbkIsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLEVBSFQsQ0FBQTtBQUtBLFdBQVMsNEZBQVQsR0FBQTtBQUVJLFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFNLENBQUEsQ0FBQSxDQUFsQixDQUFBLENBQUE7QUFFQSxRQUFBLElBQUcsT0FBQSxHQUFVLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFULENBQWUsV0FBZixDQUFiO0FBQ0ksVUFBQSxnQkFBQSxHQUFtQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsTUFBakIsQ0FBd0IsU0FBQyxRQUFELEVBQVUsT0FBVixHQUFBO21CQUN2QyxRQUFRLENBQUMsSUFBVCxDQUFBLENBQUEsR0FBZ0IsT0FBTyxDQUFDLElBQVIsQ0FBQSxFQUR1QjtVQUFBLENBQXhCLENBQW5CLENBQUE7QUFHQSxVQUFBLElBQUcsQ0FBQSxHQUFJLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLGVBQXZCLENBQVA7QUFDSSxtQkFBTyxDQUFFLENBQUEsQ0FBQSxDQUFULENBREo7V0FKSjtTQUpKO0FBQUEsT0FMQTtBQWdCQyxhQUFPLEVBQVAsQ0FqQm9CO0lBQUEsQ0E1S3pCO0FBQUEsSUFpTUEseUJBQUEsRUFBMkIsU0FBQyxNQUFELEVBQVEsTUFBUixFQUFlLFVBQWYsRUFBMEIsT0FBMUIsR0FBQTtBQUV2QixVQUFBLHlGQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsV0FBUixDQUFBO0FBQUEsTUFDQSxnQkFBQSxHQUFtQixFQURuQixDQUFBO0FBR0E7QUFBQSxXQUFBLDJDQUFBO3dCQUFBO0FBRUksUUFBQSxJQUFHLGNBQUEsR0FBaUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxtQkFBWCxDQUFwQjtBQUNJLFVBQUEsZ0JBQUEsSUFBb0IsY0FBZSxDQUFBLENBQUEsQ0FBbkMsQ0FESjtTQUFBO0FBR0EsUUFBQSxJQUFHLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsQ0FBYjtBQUNJLFVBQUEsT0FBQSxHQUFVLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFYLENBQWlCLElBQWpCLENBQXNCLENBQUMsR0FBdkIsQ0FDTixTQUFDLElBQUQsR0FBQTtBQUNJLGdCQUFBLENBQUE7QUFBQSxZQUFBLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVgsQ0FBZ0IsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFuQixDQUF5QixNQUF6QixDQUFKLENBQUE7QUFDQSxZQUFBLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFmO3FCQUNJLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxXQURaO2FBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBZjtxQkFDRCxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsVUFBUixJQUFzQixDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsV0FEN0I7YUFKVDtVQUFBLENBRE0sQ0FRVCxDQUFDLE1BUlEsQ0FTTixTQUFDLElBQUQsR0FBQTttQkFBVSxJQUFBLEtBQVEsS0FBbEI7VUFBQSxDQVRNLENBQVYsQ0FBQTtBQVlBLFVBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUNJLG1CQUFPLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWCxDQUFpQixVQUFqQixDQUE3QixFQUEwRCxNQUExRCxFQUFpRSxPQUFqRSxDQUFQLENBREo7V0FiSjtTQUxKO0FBQUEsT0FIQTtBQXdCQSxNQUFBLElBQUcsZ0JBQUEsS0FBb0IsRUFBdkI7QUFDSSxRQUFBLFFBQUEsR0FBVyxnQkFBQSxHQUFpQixVQUE1QixDQUFBO0FBQ0EsZUFBTyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsUUFBN0IsRUFBc0MsTUFBdEMsRUFBNkMsT0FBN0MsQ0FBUCxDQUZKO09BeEJBO0FBNEJBLGFBQU8sT0FBQSxDQUFRLEVBQVIsQ0FBUCxDQTlCdUI7SUFBQSxDQWpNM0I7QUFBQSxJQWlPQSwyQkFBQSxFQUE2QixTQUFDLFNBQUQsRUFBWSxNQUFaLEVBQW9CLE9BQXBCLEdBQUE7QUFFekIsVUFBQSxvQ0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxjQUFELENBQWdCLFNBQWhCLENBQVosQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FEVCxDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUZYLENBQUE7QUFBQSxNQU1BLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsRUFBa0IsQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixTQUFuQixDQUFsQixDQU5WLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFSWixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQVRqQixDQUFBO0FBQUEsTUFVQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFWdEIsQ0FBQTtBQUFBLE1BWUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLE1BQWxCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtpQkFDdEIsS0FBQyxDQUFBLFFBQUQsSUFBYSxLQURTO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsQ0FaQSxDQUFBO0FBQUEsTUFlQSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWYsQ0FBa0IsTUFBbEIsRUFBMEIsU0FBQyxJQUFELEdBQUE7ZUFDdEIsSUFBQyxDQUFBLGFBQUQsSUFBa0IsS0FESTtNQUFBLENBQTFCLENBZkEsQ0FBQTthQWtCQSxPQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ2hCLGNBQUEsNENBQUE7QUFBQTtBQUNJLFlBQUEsS0FBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQyxDQUFBLFFBQVosQ0FBdEIsQ0FBQTtBQUFBLFlBR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUtBO0FBQUEsaUJBQUEsMkNBQUE7a0NBQUE7QUFDSSxjQUFBLElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFRLENBQUMsSUFBeEIsQ0FBSDtBQUNJLGdCQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixRQUFsQixDQUFqQixDQUFBLENBREo7ZUFESjtBQUFBLGFBTEE7bUJBU0EsT0FBQSxDQUFRLFdBQVIsRUFWSjtXQUFBLGNBQUE7QUFZSSxZQURFLGNBQ0YsQ0FBQTttQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsSUFBbkIsRUFBeUIsS0FBQyxDQUFBLFFBQTFCLEVBQW9DLEtBQUMsQ0FBQSxhQUFyQyxFQVpKO1dBRGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFwQnlCO0lBQUEsQ0FqTzdCO0FBQUEsSUFvUUEsZUFBQSxFQUFpQixTQUFBLEdBQUE7YUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBeEIsR0FBNkIsdUJBRGhCO0lBQUEsQ0FwUWpCO0FBQUEsSUF1UUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNQLFNBQUEsR0FBWSx1QkFETDtJQUFBLENBdlFYO0FBQUEsSUEwUUEsY0FBQSxFQUFnQixTQUFDLFNBQUQsR0FBQTtBQUNaLE1BQUEsSUFBRyxNQUFBLENBQUEsU0FBQSxLQUFvQixRQUF2QjtBQUNJLGVBQU8sU0FBUCxDQURKO09BQUE7YUFFQSxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQWhCLENBQTBCLENBQTFCLEVBQTRCLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBaEIsR0FBeUIsQ0FBckQsQ0FBdUQsQ0FBQyxLQUF4RCxDQUE4RCxNQUE5RCxDQUFzRSxDQUFBLENBQUEsRUFIMUQ7SUFBQSxDQTFRaEI7QUFBQSxJQStRQSxnQkFBQSxFQUFrQixTQUFDLFVBQUQsR0FBQTtBQUNkLFVBQUEsSUFBQTthQUFBO0FBQUEsUUFBQSxJQUFBLEVBQU0sVUFBVSxDQUFDLElBQWpCO0FBQUEsUUFDQSxPQUFBLEVBQVMsVUFBVSxDQUFDLE9BRHBCO0FBQUEsUUFFQSxXQUFBLEVBQWEsVUFBVSxDQUFDLElBRnhCO0FBQUEsUUFHQSxJQUFBLDRDQUF3QixRQUh4QjtBQUFBLFFBSUEsU0FBQSxFQUFXLEVBQUEsR0FBRyxVQUFVLENBQUMsVUFBZCxHQUEwQixDQUFJLFVBQVUsQ0FBQyxRQUFkLEdBQTRCLFNBQTVCLEdBQTJDLEVBQTVDLENBSnJDO0FBQUEsUUFLQSxTQUFBLEVBQVksU0FBQSxHQUFTLFVBQVUsQ0FBQyxVQUxoQztBQUFBLFFBTUEsUUFBQSxFQUFVLFVBQVUsQ0FBQyxRQU5yQjtRQURjO0lBQUEsQ0EvUWxCO0FBQUEsSUF5UkEsa0JBQUEsRUFBb0IsU0FBQyxNQUFELEdBQUE7QUFFaEIsVUFBQSwyQ0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUVBO0FBQUEsV0FBQSwyQ0FBQTt3QkFBQTtBQU9JLFFBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFMLENBQVcsZ0NBQVgsQ0FBYixDQUFBO0FBRUEsUUFBQSxJQUFPLFVBQUEsS0FBYyxJQUFyQjtBQUNJLGlCQUFRLElBQUEsR0FBSSxVQUFXLENBQUEsQ0FBQSxDQUF2QixDQURKO1NBVEo7QUFBQSxPQUpnQjtJQUFBLENBelJwQjtBQUFBLElBMlNBLHFCQUFBLEVBQXVCLFNBQUMsSUFBRCxHQUFBO0FBQXlDLFVBQUEsbUNBQUE7QUFBQSxNQUF2QyxjQUFBLFFBQVEsdUJBQUEsaUJBQWlCLGtCQUFBLFVBQWMsQ0FBekM7SUFBQSxDQTNTdkI7QUFBQSxJQWdUQSxPQUFBLEVBQVMsU0FBQSxHQUFBLENBaFRUO0FBQUEsSUFrVEEsU0FBQSxFQUFXLFNBQUMsTUFBRCxFQUFTLGNBQVQsR0FBQTtBQUVQLFVBQUEsaUJBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxpQkFBUixDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCLENBSFAsQ0FBQTt1REFNbUIsQ0FBQSxDQUFBLFdBQW5CLElBQXlCLEdBUmxCO0lBQUEsQ0FsVFg7R0FaSixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/php-composer-completion/lib/provider.coffee
