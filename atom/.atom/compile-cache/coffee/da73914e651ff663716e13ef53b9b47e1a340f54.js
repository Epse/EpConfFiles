(function() {
  var escapeString, highlightSync, popScope, pushScope, updateScopeStack, _;

  _ = require('underscore-plus');

  escapeString = function(string) {
    return string.replace(/[&"'<> ]/g, function(match) {
      switch (match) {
        case '&':
          return '&amp;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case ' ':
          return '&nbsp;';
        default:
          return match;
      }
    });
  };

  pushScope = function(scopeStack, scope, html) {
    scopeStack.push(scope);
    return html += "<span class=\"" + (scope.replace(/\.+/g, ' ')) + "\">";
  };

  popScope = function(scopeStack, html) {
    scopeStack.pop();
    return html += '</span>';
  };

  updateScopeStack = function(scopeStack, desiredScopes, html) {
    var excessScopes, i, j, _i, _j, _ref, _ref1;
    excessScopes = scopeStack.length - desiredScopes.length;
    if (excessScopes > 0) {
      while (excessScopes--) {
        html = popScope(scopeStack, html);
      }
    }
    for (i = _i = _ref = scopeStack.length; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
      if (_.isEqual(scopeStack.slice(0, i), desiredScopes.slice(0, i))) {
        break;
      }
      html = popScope(scopeStack, html);
    }
    for (j = _j = i, _ref1 = desiredScopes.length; i <= _ref1 ? _j < _ref1 : _j > _ref1; j = i <= _ref1 ? ++_j : --_j) {
      html = pushScope(scopeStack, desiredScopes[j], html);
    }
    return html;
  };

  module.exports = highlightSync = function(_arg) {
    var fileContents, grammar, html, lastLineTokens, lineTokens, registry, scopeName, scopeStack, scopes, tokens, value, _i, _j, _len, _len1, _ref, _ref1;
    _ref = _arg != null ? _arg : {}, registry = _ref.registry, fileContents = _ref.fileContents, scopeName = _ref.scopeName;
    grammar = registry.grammarForScopeName(scopeName);
    if (grammar == null) {
      return;
    }
    lineTokens = grammar.tokenizeLines(fileContents);
    if (lineTokens.length > 0) {
      lastLineTokens = lineTokens[lineTokens.length - 1];
      if (lastLineTokens.length === 1 && lastLineTokens[0].value === '') {
        lineTokens.pop();
      }
    }
    html = '';
    for (_i = 0, _len = lineTokens.length; _i < _len; _i++) {
      tokens = lineTokens[_i];
      scopeStack = [];
      for (_j = 0, _len1 = tokens.length; _j < _len1; _j++) {
        _ref1 = tokens[_j], value = _ref1.value, scopes = _ref1.scopes;
        if (!value) {
          value = ' ';
        }
        html = updateScopeStack(scopeStack, scopes, html);
        html += "<span>" + (escapeString(value)) + "</span>";
      }
      while (scopeStack.length > 0) {
        html = popScope(scopeStack, html);
      }
      html += '\n';
    }
    return html;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9oaWdobGlnaHQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsU0FBQyxNQUFELEdBQUE7V0FDYixNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsRUFBNEIsU0FBQyxLQUFELEdBQUE7QUFDMUIsY0FBTyxLQUFQO0FBQUEsYUFDTyxHQURQO2lCQUNnQixRQURoQjtBQUFBLGFBRU8sR0FGUDtpQkFFZ0IsU0FGaEI7QUFBQSxhQUdPLEdBSFA7aUJBR2dCLFFBSGhCO0FBQUEsYUFJTyxHQUpQO2lCQUlnQixPQUpoQjtBQUFBLGFBS08sR0FMUDtpQkFLZ0IsT0FMaEI7QUFBQSxhQU1PLEdBTlA7aUJBTWdCLFNBTmhCO0FBQUE7aUJBT08sTUFQUDtBQUFBLE9BRDBCO0lBQUEsQ0FBNUIsRUFEYTtFQUFBLENBRmYsQ0FBQTs7QUFBQSxFQWFBLFNBQUEsR0FBWSxTQUFDLFVBQUQsRUFBYSxLQUFiLEVBQW9CLElBQXBCLEdBQUE7QUFDVixJQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQUEsQ0FBQTtXQUNBLElBQUEsSUFBUyxnQkFBQSxHQUFlLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFkLEVBQXNCLEdBQXRCLENBQUQsQ0FBZixHQUEyQyxNQUYxQztFQUFBLENBYlosQ0FBQTs7QUFBQSxFQWlCQSxRQUFBLEdBQVcsU0FBQyxVQUFELEVBQWEsSUFBYixHQUFBO0FBQ1QsSUFBQSxVQUFVLENBQUMsR0FBWCxDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUEsSUFBUSxVQUZDO0VB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/highlight.coffee
