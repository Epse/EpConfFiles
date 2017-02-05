(function() {
  var Selector, log, provider, selectorsMatchScopeChain;

  provider = require('./provider');

  log = require('./log');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: provider.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name",
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = Selector.create(this.disableForSelector);
        if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          log.debug(range.start, this._getScopes(editor, range.start));
          log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = function() {
          return provider.goToDefinition(editor, bufferPosition);
        };
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2h5cGVyY2xpY2stcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNMLDJCQUE0QixPQUFBLENBQVEsaUJBQVI7O0VBQzVCLFdBQVksT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxDQUFWO0lBRUEsWUFBQSxFQUFjLHFCQUZkO0lBSUEsa0JBQUEsRUFBdUIsUUFBUSxDQUFDLGtCQUFWLEdBQTZCLDZOQUpuRDtJQU1BLFVBQUEsRUFBWSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ1YsYUFBTyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsS0FBeEMsQ0FBOEMsQ0FBQztJQUQ1QyxDQU5aO0lBU0Esb0JBQUEsRUFBc0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEtBQWY7QUFDcEIsVUFBQTtNQUFBLElBQUcsSUFBQSxLQUFTLEdBQVQsSUFBQSxJQUFBLEtBQWMsR0FBakI7QUFDRSxlQURGOztNQUVBLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUE5QixDQUFzQyxlQUF0QyxDQUFBLEdBQXlELENBQUMsQ0FBN0Q7UUFDRSxjQUFBLEdBQWlCLEtBQUssQ0FBQztRQUN2QixlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUNoQixjQURnQjtRQUVsQixVQUFBLEdBQWEsZUFBZSxDQUFDLGFBQWhCLENBQUE7UUFDYixrQkFBQSxHQUFxQixRQUFRLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsa0JBQWpCO1FBQ3JCLElBQUcsd0JBQUEsQ0FBeUIsa0JBQXpCLEVBQTZDLFVBQTdDLENBQUg7QUFDRSxpQkFERjs7UUFHQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBSDtVQUNFLEdBQUcsQ0FBQyxLQUFKLENBQVUsS0FBSyxDQUFDLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsS0FBMUIsQ0FBdkI7VUFDQSxHQUFHLENBQUMsS0FBSixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEdBQTFCLENBQXJCLEVBRkY7O1FBR0EsUUFBQSxHQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsY0FBaEM7UUFEUztBQUVYLGVBQU87VUFBQyxPQUFBLEtBQUQ7VUFBUSxVQUFBLFFBQVI7VUFkVDs7SUFIb0IsQ0FUdEI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJwcm92aWRlciA9IHJlcXVpcmUgJy4vcHJvdmlkZXInXG5sb2cgPSByZXF1aXJlICcuL2xvZydcbntzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xue1NlbGVjdG9yfSA9IHJlcXVpcmUgJ3NlbGVjdG9yLWtpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBwcmlvcml0eTogMVxuXG4gIHByb3ZpZGVyTmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG5cbiAgZGlzYWJsZUZvclNlbGVjdG9yOiBcIiN7cHJvdmlkZXIuZGlzYWJsZUZvclNlbGVjdG9yfSwgLnNvdXJjZS5weXRob24gLm51bWVyaWMsIC5zb3VyY2UucHl0aG9uIC5pbnRlZ2VyLCAuc291cmNlLnB5dGhvbiAuZGVjaW1hbCwgLnNvdXJjZS5weXRob24gLnB1bmN0dWF0aW9uLCAuc291cmNlLnB5dGhvbiAua2V5d29yZCwgLnNvdXJjZS5weXRob24gLnN0b3JhZ2UsIC5zb3VyY2UucHl0aG9uIC52YXJpYWJsZS5wYXJhbWV0ZXIsIC5zb3VyY2UucHl0aG9uIC5lbnRpdHkubmFtZVwiXG5cbiAgX2dldFNjb3BlczogKGVkaXRvciwgcmFuZ2UpIC0+XG4gICAgcmV0dXJuIGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihyYW5nZSkuc2NvcGVzXG5cbiAgZ2V0U3VnZ2VzdGlvbkZvcldvcmQ6IChlZGl0b3IsIHRleHQsIHJhbmdlKSAtPlxuICAgIGlmIHRleHQgaW4gWycuJywgJzonXVxuICAgICAgcmV0dXJuXG4gICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZignc291cmNlLnB5dGhvbicpID4gLTFcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICAgICAgYnVmZmVyUG9zaXRpb24pXG4gICAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgICAgZGlzYWJsZUZvclNlbGVjdG9yID0gU2VsZWN0b3IuY3JlYXRlKEBkaXNhYmxlRm9yU2VsZWN0b3IpXG4gICAgICBpZiBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dERlYnVnJylcbiAgICAgICAgbG9nLmRlYnVnIHJhbmdlLnN0YXJ0LCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLnN0YXJ0KVxuICAgICAgICBsb2cuZGVidWcgcmFuZ2UuZW5kLCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLmVuZClcbiAgICAgIGNhbGxiYWNrID0gLT5cbiAgICAgICAgcHJvdmlkZXIuZ29Ub0RlZmluaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIHJldHVybiB7cmFuZ2UsIGNhbGxiYWNrfVxuIl19
