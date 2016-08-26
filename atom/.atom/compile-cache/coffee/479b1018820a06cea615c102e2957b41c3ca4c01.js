(function() {
  var ExpressionsRegistry, VariableExpression, registry, strip;

  strip = require('./utils').strip;

  ExpressionsRegistry = require('./expressions-registry');

  VariableExpression = require('./variable-expression');

  module.exports = registry = new ExpressionsRegistry(VariableExpression);

  registry.createExpression('less', '^[ \\t]*(@[a-zA-Z0-9\\-_]+)\\s*:\\s*([^;\\n]+);?');

  registry.createExpression('scss_params', '^[ \\t]*@(mixin|include|function)\\s+[a-zA-Z0-9\\-_]+\\s*\\([^\\)]+\\)', function(match, solver) {
    match = match[0];
    return solver.endParsing(match.length - 1);
  });

  registry.createExpression('scss', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+)\\s*:\\s*(.*?)(\\s*!default)?;');

  registry.createExpression('sass', '^[ \\t]*(\\$[a-zA-Z0-9\\-_]+):\\s*([^\\{]*?)(\\s*!default)?$');

  registry.createExpression('stylus_hash', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=\\s*\\{([^=]*)\\}', function(match, solver) {
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
        buffer = strip(buffer);
        if (buffer.length) {
          _ref1 = buffer.split(/\s*:\s*/), key = _ref1[0], value = _ref1[1];
          solver.appendResult([scope.concat(key).join('.'), value, current - buffer.length - 1, current]);
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

  registry.createExpression('stylus', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n;]*);?$');

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvdmFyaWFibGUtZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdEQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsU0FBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3QkFBUixDQUR0QixDQUFBOztBQUFBLEVBRUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBRnJCLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixrQkFBcEIsQ0FKaEMsQ0FBQTs7QUFBQSxFQU1BLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixNQUExQixFQUFrQyxrREFBbEMsQ0FOQSxDQUFBOztBQUFBLEVBU0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGFBQTFCLEVBQXlDLHdFQUF6QyxFQUFtSCxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDakgsSUFBQyxRQUFTLFFBQVYsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBakMsRUFGaUg7RUFBQSxDQUFuSCxDQVRBLENBQUE7O0FBQUEsRUFhQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsTUFBMUIsRUFBa0MsNkRBQWxDLENBYkEsQ0FBQTs7QUFBQSxFQWVBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixNQUExQixFQUFrQyw4REFBbEMsQ0FmQSxDQUFBOztBQUFBLEVBaUJBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixhQUExQixFQUF5Qyw0REFBekMsRUFBdUcsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ3JHLFFBQUEscUtBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxJQUNBLE9BQXlCLEtBQXpCLEVBQUMsZUFBRCxFQUFRLGNBQVIsRUFBYyxpQkFEZCxDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkLENBRlYsQ0FBQTtBQUFBLElBR0EsS0FBQSxHQUFRLENBQUMsSUFBRCxDQUhSLENBQUE7QUFBQSxJQUlBLFVBQUEsR0FBYSxJQUpiLENBQUE7QUFBQSxJQUtBLFFBQUEsR0FBVyxJQUxYLENBQUE7QUFBQSxJQU1BLG1CQUFBLEdBQXNCLE9BTnRCLENBQUE7QUFBQSxJQU9BLGlCQUFBLEdBQW9CLE9BUHBCLENBQUE7QUFBQSxJQVFBLHVCQUFBLEdBQTBCLEtBUjFCLENBQUE7QUFTQSxTQUFBLDhDQUFBO3lCQUFBO0FBQ0UsTUFBQSxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQUg7QUFDRSxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsRUFEVCxDQURGO09BQUEsTUFHSyxJQUFHLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFIO0FBQ0gsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBcUMsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBckQ7QUFBQSxpQkFBTyxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFsQixDQUFQLENBQUE7U0FGRztPQUFBLE1BR0EsSUFBRyxtQkFBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUFIO0FBQ0gsUUFBQSxNQUFBLElBQVUsSUFBVixDQUFBO0FBQUEsUUFDQSx1QkFBQSxHQUEwQixJQUQxQixDQURHO09BQUEsTUFHQSxJQUFHLHVCQUFIO0FBQ0gsUUFBQSxNQUFBLElBQVUsSUFBVixDQUFBO0FBQUEsUUFDQSx1QkFBQSxHQUEwQixDQUFBLGlCQUFrQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBRDNCLENBREc7T0FBQSxNQUdBLElBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQUg7QUFDSCxRQUFBLE1BQUEsR0FBUyxLQUFBLENBQU0sTUFBTixDQUFULENBQUE7QUFDQSxRQUFBLElBQUcsTUFBTSxDQUFDLE1BQVY7QUFDRSxVQUFBLFFBQWUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxTQUFiLENBQWYsRUFBQyxjQUFELEVBQU0sZ0JBQU4sQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FDbEIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsR0FBdkIsQ0FEa0IsRUFFbEIsS0FGa0IsRUFHbEIsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFqQixHQUEwQixDQUhSLEVBSWxCLE9BSmtCLENBQXBCLENBRkEsQ0FERjtTQURBO0FBQUEsUUFXQSxNQUFBLEdBQVMsRUFYVCxDQURHO09BQUEsTUFBQTtBQWNILFFBQUEsTUFBQSxJQUFVLElBQVYsQ0FkRztPQVpMO0FBQUEsTUE0QkEsT0FBQSxFQTVCQSxDQURGO0FBQUEsS0FUQTtBQUFBLElBd0NBLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0F4Q0EsQ0FBQTtBQXlDQSxJQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7YUFDRSxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFBLEdBQVUsQ0FBNUIsRUFERjtLQUFBLE1BQUE7YUFHRSxNQUFNLENBQUMsWUFBUCxDQUFBLEVBSEY7S0ExQ3FHO0VBQUEsQ0FBdkcsQ0FqQkEsQ0FBQTs7QUFBQSxFQWdFQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsUUFBMUIsRUFBb0MsaUVBQXBDLENBaEVBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/variable-expressions.coffee
