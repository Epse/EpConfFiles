(function() {
  var ExpressionsRegistry, VariableExpression, registry, sass_handler;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('pigments:less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n\\r]+);?', ['less']);

  registry.createExpression('pigments:scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', ['scss', 'sass', 'haml'], function(match, solver) {
    match = match[0];
    return solver.endParsing(match.length - 1);
  });

  sass_handler = function(match, solver) {
    var all_hyphen, all_underscore;
    solver.appendResult(match[1], match[2], 0, match[0].length, {
      isDefault: match[3] != null
    });
    if (match[1].match(/[-_]/)) {
      all_underscore = match[1].replace(/-/g, '_');
      all_hyphen = match[1].replace(/_/g, '-');
      if (match[1] !== all_underscore) {
        solver.appendResult(all_underscore, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
      if (match[1] !== all_hyphen) {
        solver.appendResult(all_hyphen, match[2], 0, match[0].length, {
          isAlternate: true,
          isDefault: match[3] != null
        });
      }
    }
    return solver.endParsing(match[0].length);
  };

  registry.createExpression('pigments:scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?\\s*;', ['scss', 'haml'], sass_handler);

  registry.createExpression('pigments:sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*([^\\{]*?)(\\s*!default)?\\s*(?:$|\\/)', ['sass', 'haml'], sass_handler);

  registry.createExpression('pigments:css_vars', '(--[^\\s:]+):\\s*([^\\n;]+);', ['css'], function(match, solver) {
    solver.appendResult("var(" + match[1] + ")", match[2], 0, match[0].length);
    return solver.endParsing(match[0].length);
  });

  registry.createExpression('pigments:stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', ['styl', 'stylus'], function(match, solver) {
    var buffer, char, commaSensitiveBegin, commaSensitiveEnd, content, current, inCommaSensitiveContext, key, name, scope, scopeBegin, scopeEnd, value, _i, _len, _ref, _ref1;
    buffer = '';
    _ref = match, match = _ref[0], name = _ref[1], content = _ref[2];
    current = match.indexOf(content);
    scope = [name];
    scopeBegin = /\{/;
    scopeEnd = /\}/;
    commaSensitiveBegin = /\(|\[/;
    commaSensitiveEnd = /\)|\]/;
    inCommaSensitiveContext = false;
    for (_i = 0, _len = content.length; _i < _len; _i++) {
      char = content[_i];
      if (scopeBegin.test(char)) {
        scope.push(buffer.replace(/[\s:]/g, ''));
        buffer = '';
      } else if (scopeEnd.test(char)) {
        scope.pop();
        if (scope.length === 0) {
          return solver.endParsing(current);
        }
      } else if (commaSensitiveBegin.test(char)) {
        buffer += char;
        inCommaSensitiveContext = true;
      } else if (inCommaSensitiveContext) {
        buffer += char;
        inCommaSensitiveContext = !commaSensitiveEnd.test(char);
      } else if (/[,\n]/.test(char)) {
        buffer = buffer.replace(/\s+/g, '');
        if (buffer.length) {
          _ref1 = buffer.split(/\s*:\s*/), key = _ref1[0], value = _ref1[1];
          solver.appendResult(scope.concat(key).join('.'), value, current - buffer.length - 1, current);
        }
        buffer = '';
      } else {
        buffer += char;
      }
      current++;
    }
    scope.pop();
    if (scope.length === 0) {
      return solver.endParsing(current + 1);
    } else {
      return solver.abortParsing();
    }
  });

  registry.createExpression('pigments:stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['styl', 'stylus']);

  registry.createExpression('pigments:latex', '\\\\definecolor(\\{[^\\}]+\\})\\{([^\\}]+)\\}\\{([^\\}]+)\\}', ['tex'], function(match, solver) {
    var mode, name, value, values, _;
    _ = match[0], name = match[1], mode = match[2], value = match[3];
    value = (function() {
      switch (mode) {
        case 'RGB':
          return "rgb(" + value + ")";
        case 'gray':
          return "gray(" + (Math.round(parseFloat(value) * 100)) + "%)";
        case 'rgb':
          values = value.split(',').map(function(n) {
            return Math.floor(n * 255);
          });
          return "rgb(" + (values.join(',')) + ")";
        case 'cmyk':
          return "cmyk(" + value + ")";
        case 'HTML':
          return "#" + value;
        default:
          return value;
      }
    })();
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

  registry.createExpression('pigments:latex_mix', '\\\\definecolor(\\{[^\\}]+\\})(\\{[^\\}\\n!]+[!][^\\}\\n]+\\})', ['tex'], function(match, solver) {
    var name, value, _;
    _ = match[0], name = match[1], value = match[2];
    solver.appendResult(name, value, 0, _.length, {
      noNamePrefix: true
    });
    return solver.endParsing(_.length);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1leHByZXNzaW9ucy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0RBQUE7O0FBQUEsRUFBQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVIsQ0FBdEIsQ0FBQTs7QUFBQSxFQUNBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUixDQURyQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0Isa0JBQXBCLENBSGhDLENBQUE7O0FBQUEsRUFLQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsZUFBMUIsRUFBMkMscURBQTNDLEVBQWtHLENBQUMsTUFBRCxDQUFsRyxDQUxBLENBQUE7O0FBQUEsRUFRQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsc0JBQTFCLEVBQWtELHdFQUFsRCxFQUE0SCxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLENBQTVILEVBQXNKLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNwSixJQUFDLFFBQVMsUUFBVixDQUFBO1dBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFqQyxFQUZvSjtFQUFBLENBQXRKLENBUkEsQ0FBQTs7QUFBQSxFQVlBLFlBQUEsR0FBZSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDYixRQUFBLDBCQUFBO0FBQUEsSUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixLQUFNLENBQUEsQ0FBQSxDQUExQixFQUE4QixLQUFNLENBQUEsQ0FBQSxDQUFwQyxFQUF3QyxDQUF4QyxFQUEyQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBcEQsRUFBNEQ7QUFBQSxNQUFBLFNBQUEsRUFBVyxnQkFBWDtLQUE1RCxDQUFBLENBQUE7QUFFQSxJQUFBLElBQUcsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVQsQ0FBZSxNQUFmLENBQUg7QUFDRSxNQUFBLGNBQUEsR0FBaUIsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsR0FBdkIsQ0FBakIsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFULENBQWlCLElBQWpCLEVBQXVCLEdBQXZCLENBRGIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQWMsY0FBakI7QUFDRSxRQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLGNBQXBCLEVBQW9DLEtBQU0sQ0FBQSxDQUFBLENBQTFDLEVBQThDLENBQTlDLEVBQWlELEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUExRCxFQUFrRTtBQUFBLFVBQUEsV0FBQSxFQUFhLElBQWI7QUFBQSxVQUFtQixTQUFBLEVBQVcsZ0JBQTlCO1NBQWxFLENBQUEsQ0FERjtPQUhBO0FBS0EsTUFBQSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBYyxVQUFqQjtBQUNFLFFBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsVUFBcEIsRUFBZ0MsS0FBTSxDQUFBLENBQUEsQ0FBdEMsRUFBMEMsQ0FBMUMsRUFBNkMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXRELEVBQThEO0FBQUEsVUFBQSxXQUFBLEVBQWEsSUFBYjtBQUFBLFVBQW1CLFNBQUEsRUFBVyxnQkFBOUI7U0FBOUQsQ0FBQSxDQURGO09BTkY7S0FGQTtXQVdBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUEzQixFQVphO0VBQUEsQ0FaZixDQUFBOztBQUFBLEVBMEJBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyxpRUFBM0MsRUFBOEcsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUE5RyxFQUFnSSxZQUFoSSxDQTFCQSxDQUFBOztBQUFBLEVBNEJBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixlQUExQixFQUEyQyw4RUFBM0MsRUFBMkgsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUEzSCxFQUE2SSxZQUE3SSxDQTVCQSxDQUFBOztBQUFBLEVBOEJBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixtQkFBMUIsRUFBK0MsOEJBQS9DLEVBQStFLENBQUMsS0FBRCxDQUEvRSxFQUF3RixTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDdEYsSUFBQSxNQUFNLENBQUMsWUFBUCxDQUFxQixNQUFBLEdBQU0sS0FBTSxDQUFBLENBQUEsQ0FBWixHQUFlLEdBQXBDLEVBQXdDLEtBQU0sQ0FBQSxDQUFBLENBQTlDLEVBQWtELENBQWxELEVBQXFELEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUE5RCxDQUFBLENBQUE7V0FDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBM0IsRUFGc0Y7RUFBQSxDQUF4RixDQTlCQSxDQUFBOztBQUFBLEVBa0NBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUIsRUFBa0QsNERBQWxELEVBQWdILENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FBaEgsRUFBb0ksU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2xJLFFBQUEscUtBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxJQUNBLE9BQXlCLEtBQXpCLEVBQUMsZUFBRCxFQUFRLGNBQVIsRUFBYyxpQkFEZCxDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkLENBRlYsQ0FBQTtBQUFBLElBR0EsS0FBQSxHQUFRLENBQUMsSUFBRCxDQUhSLENBQUE7QUFBQSxJQUlBLFVBQUEsR0FBYSxJQUpiLENBQUE7QUFBQSxJQUtBLFFBQUEsR0FBVyxJQUxYLENBQUE7QUFBQSxJQU1BLG1CQUFBLEdBQXNCLE9BTnRCLENBQUE7QUFBQSxJQU9BLGlCQUFBLEdBQW9CLE9BUHBCLENBQUE7QUFBQSxJQVFBLHVCQUFBLEdBQTBCLEtBUjFCLENBQUE7QUFTQSxTQUFBLDhDQUFBO3lCQUFBO0FBQ0UsTUFBQSxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQUg7QUFDRSxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsRUFEVCxDQURGO09BQUEsTUFHSyxJQUFHLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFIO0FBQ0gsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBcUMsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBckQ7QUFBQSxpQkFBTyxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFsQixDQUFQLENBQUE7U0FGRztPQUFBLE1BR0EsSUFBRyxtQkFBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUFIO0FBQ0gsUUFBQSxNQUFBLElBQVUsSUFBVixDQUFBO0FBQUEsUUFDQSx1QkFBQSxHQUEwQixJQUQxQixDQURHO09BQUEsTUFHQSxJQUFHLHVCQUFIO0FBQ0gsUUFBQSxNQUFBLElBQVUsSUFBVixDQUFBO0FBQUEsUUFDQSx1QkFBQSxHQUEwQixDQUFBLGlCQUFrQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBRDNCLENBREc7T0FBQSxNQUdBLElBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQUg7QUFDSCxRQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFBdUIsRUFBdkIsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFWO0FBQ0UsVUFBQSxRQUFlLE1BQU0sQ0FBQyxLQUFQLENBQWEsU0FBYixDQUFmLEVBQUMsY0FBRCxFQUFNLGdCQUFOLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixDQUFpQixDQUFDLElBQWxCLENBQXVCLEdBQXZCLENBQXBCLEVBQWlELEtBQWpELEVBQXdELE9BQUEsR0FBVSxNQUFNLENBQUMsTUFBakIsR0FBMEIsQ0FBbEYsRUFBcUYsT0FBckYsQ0FGQSxDQURGO1NBREE7QUFBQSxRQU1BLE1BQUEsR0FBUyxFQU5ULENBREc7T0FBQSxNQUFBO0FBU0gsUUFBQSxNQUFBLElBQVUsSUFBVixDQVRHO09BWkw7QUFBQSxNQXVCQSxPQUFBLEVBdkJBLENBREY7QUFBQSxLQVRBO0FBQUEsSUFtQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQW5DQSxDQUFBO0FBb0NBLElBQUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjthQUNFLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQUEsR0FBVSxDQUE1QixFQURGO0tBQUEsTUFBQTthQUdFLE1BQU0sQ0FBQyxZQUFQLENBQUEsRUFIRjtLQXJDa0k7RUFBQSxDQUFwSSxDQWxDQSxDQUFBOztBQUFBLEVBNEVBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixpQkFBMUIsRUFBNkMsb0VBQTdDLEVBQW1ILENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FBbkgsQ0E1RUEsQ0FBQTs7QUFBQSxFQThFQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsZ0JBQTFCLEVBQTRDLDhEQUE1QyxFQUE0RyxDQUFDLEtBQUQsQ0FBNUcsRUFBcUgsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ25ILFFBQUEsNEJBQUE7QUFBQSxJQUFDLFlBQUQsRUFBSSxlQUFKLEVBQVUsZUFBVixFQUFnQixnQkFBaEIsQ0FBQTtBQUFBLElBRUEsS0FBQTtBQUFRLGNBQU8sSUFBUDtBQUFBLGFBQ0QsS0FEQztpQkFDVyxNQUFBLEdBQU0sS0FBTixHQUFZLElBRHZCO0FBQUEsYUFFRCxNQUZDO2lCQUVZLE9BQUEsR0FBTSxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsVUFBQSxDQUFXLEtBQVgsQ0FBQSxHQUFvQixHQUEvQixDQUFELENBQU4sR0FBMkMsS0FGdkQ7QUFBQSxhQUdELEtBSEM7QUFJSixVQUFBLE1BQUEsR0FBUyxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVosQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixTQUFDLENBQUQsR0FBQTttQkFBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsR0FBSSxHQUFmLEVBQVA7VUFBQSxDQUFyQixDQUFULENBQUE7aUJBQ0MsTUFBQSxHQUFLLENBQUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLENBQUQsQ0FBTCxHQUF1QixJQUxwQjtBQUFBLGFBTUQsTUFOQztpQkFNWSxPQUFBLEdBQU8sS0FBUCxHQUFhLElBTnpCO0FBQUEsYUFPRCxNQVBDO2lCQU9ZLEdBQUEsR0FBRyxNQVBmO0FBQUE7aUJBUUQsTUFSQztBQUFBO1FBRlIsQ0FBQTtBQUFBLElBWUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsSUFBcEIsRUFBMEIsS0FBMUIsRUFBaUMsQ0FBakMsRUFBb0MsQ0FBQyxDQUFDLE1BQXRDLEVBQThDO0FBQUEsTUFBQSxZQUFBLEVBQWMsSUFBZDtLQUE5QyxDQVpBLENBQUE7V0FhQSxNQUFNLENBQUMsVUFBUCxDQUFrQixDQUFDLENBQUMsTUFBcEIsRUFkbUg7RUFBQSxDQUFySCxDQTlFQSxDQUFBOztBQUFBLEVBOEZBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUIsRUFBZ0QsZ0VBQWhELEVBQWtILENBQUMsS0FBRCxDQUFsSCxFQUEySCxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDekgsUUFBQSxjQUFBO0FBQUEsSUFBQyxZQUFELEVBQUksZUFBSixFQUFVLGdCQUFWLENBQUE7QUFBQSxJQUVBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQXBCLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLEVBQW9DLENBQUMsQ0FBQyxNQUF0QyxFQUE4QztBQUFBLE1BQUEsWUFBQSxFQUFjLElBQWQ7S0FBOUMsQ0FGQSxDQUFBO1dBR0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCLEVBSnlIO0VBQUEsQ0FBM0gsQ0E5RkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/variable-expressions.coffee
