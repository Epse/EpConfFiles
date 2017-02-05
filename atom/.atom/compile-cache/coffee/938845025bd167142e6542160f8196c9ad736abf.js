(function() {
  var packagesToTest;

  packagesToTest = {
    Python: {
      name: 'language-python',
      file: 'test.py'
    }
  };

  describe('Python autocompletions', function() {
    var editor, getCompletions, provider, ref;
    ref = [], editor = ref[0], provider = ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-python');
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.py');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editor.setGrammar(atom.grammars.grammarsByScopeName['source.python']);
        return atom.packages.loadPackage('autocomplete-python').activationHooks = [];
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-python');
      });
      return runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-python').mainModule.getProvider();
      });
    });
    it('autocompletes builtins', function() {
      var completions;
      editor.setText('isinstanc');
      editor.setCursorBufferPosition([1, 0]);
      completions = getCompletions();
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          var completion, i, len;
          for (i = 0, len = completions.length; i < len; i++) {
            completion = completions[i];
            expect(completion.text.length).toBeGreaterThan(0);
            expect(completion.text).toBe('isinstance');
          }
          return expect(completions.length).toBe(1);
        });
      });
    });
    it('autocompletes python keywords', function() {
      var completions;
      editor.setText('impo');
      editor.setCursorBufferPosition([1, 0]);
      completions = getCompletions();
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          var completion, i, len;
          for (i = 0, len = completions.length; i < len; i++) {
            completion = completions[i];
            if (completion.type === 'keyword') {
              expect(completion.text).toBe('import');
            }
            expect(completion.text.length).toBeGreaterThan(0);
          }
          return expect(completions.length).toBe(3);
        });
      });
    });
    return it('autocompletes defined functions', function() {
      var completions;
      editor.setText("def hello_world():\n  return True\nhell");
      editor.setCursorBufferPosition([3, 0]);
      completions = getCompletions();
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          expect(completions[0].text).toBe('hello_world');
          return expect(completions.length).toBe(1);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vc3BlYy9wcm92aWRlci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsY0FBQSxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLGlCQUFOO01BQ0EsSUFBQSxFQUFNLFNBRE47S0FERjs7O0VBSUYsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7QUFDakMsUUFBQTtJQUFBLE1BQXFCLEVBQXJCLEVBQUMsZUFBRCxFQUFTO0lBRVQsY0FBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsYUFBUCxDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyx1Q0FBUCxDQUFBO01BQ1IsR0FBQSxHQUFNLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ04sTUFBQSxHQUFTLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEI7TUFDVCxPQUFBLEdBQ0U7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUNBLGNBQUEsRUFBZ0IsR0FEaEI7UUFFQSxlQUFBLEVBQWlCLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBRmpCO1FBR0EsTUFBQSxFQUFRLE1BSFI7O2FBSUYsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEI7SUFWZTtJQVlqQixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUI7TUFBSCxDQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFwQjtNQUFILENBQWhCO01BQ0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLEdBQVMsSUFB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bnQiOlsicGFja2FnZXNUb1Rlc3QgPVxuICBQeXRob246XG4gICAgbmFtZTogJ2xhbmd1YWdlLXB5dGhvbidcbiAgICBmaWxlOiAndGVzdC5weSdcblxuZGVzY3JpYmUgJ1B5dGhvbiBhdXRvY29tcGxldGlvbnMnLCAtPlxuICBbZWRpdG9yLCBwcm92aWRlcl0gPSBbXVxuXG4gIGdldENvbXBsZXRpb25zID0gLT5cbiAgICBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgc3RhcnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbmQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHByZWZpeCA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbc3RhcnQsIGVuZF0pXG4gICAgcmVxdWVzdCA9XG4gICAgICBlZGl0b3I6IGVkaXRvclxuICAgICAgYnVmZmVyUG9zaXRpb246IGVuZFxuICAgICAgc2NvcGVEZXNjcmlwdG9yOiBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKClcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMocmVxdWVzdClcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1weXRob24nKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKCd0ZXN0LnB5JylcbiAgICBydW5zIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hcnNCeVNjb3BlTmFtZVsnc291cmNlLnB5dGhvbiddKVxuICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnYXV0b2NvbXBsZXRlLXB5dGhvbicpLmFjdGl2YXRpb25Ib29rcyA9IFtdXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcHl0aG9uJylcbiAgICBydW5zIC0+IHByb3ZpZGVyID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKFxuICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24nKS5tYWluTW9kdWxlLmdldFByb3ZpZGVyKClcblxuICBpdCAnYXV0b2NvbXBsZXRlcyBidWlsdGlucycsIC0+XG4gICAgZWRpdG9yLnNldFRleHQgJ2lzaW5zdGFuYydcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDBdKVxuICAgIGNvbXBsZXRpb25zID0gZ2V0Q29tcGxldGlvbnMoKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgZ2V0Q29tcGxldGlvbnMoKS50aGVuIChjb21wbGV0aW9ucykgLT5cbiAgICAgICAgZm9yIGNvbXBsZXRpb24gaW4gY29tcGxldGlvbnNcbiAgICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0Lmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0KS50b0JlICdpc2luc3RhbmNlJ1xuICAgICAgICBleHBlY3QoY29tcGxldGlvbnMubGVuZ3RoKS50b0JlIDFcblxuICBpdCAnYXV0b2NvbXBsZXRlcyBweXRob24ga2V5d29yZHMnLCAtPlxuICAgIGVkaXRvci5zZXRUZXh0ICdpbXBvJ1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMSwgMF0pXG4gICAgY29tcGxldGlvbnMgPSBnZXRDb21wbGV0aW9ucygpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBnZXRDb21wbGV0aW9ucygpLnRoZW4gKGNvbXBsZXRpb25zKSAtPlxuICAgICAgICBmb3IgY29tcGxldGlvbiBpbiBjb21wbGV0aW9uc1xuICAgICAgICAgIGlmIGNvbXBsZXRpb24udHlwZSA9PSAna2V5d29yZCdcbiAgICAgICAgICAgIGV4cGVjdChjb21wbGV0aW9uLnRleHQpLnRvQmUgJ2ltcG9ydCdcbiAgICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0Lmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICAgICAgZXhwZWN0KGNvbXBsZXRpb25zLmxlbmd0aCkudG9CZSAzXG5cbiAgaXQgJ2F1dG9jb21wbGV0ZXMgZGVmaW5lZCBmdW5jdGlvbnMnLCAtPlxuICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICAgZGVmIGhlbGxvX3dvcmxkKCk6XG4gICAgICAgIHJldHVybiBUcnVlXG4gICAgICBoZWxsXG4gICAgXCJcIlwiXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICBjb21wbGV0aW9ucyA9IGdldENvbXBsZXRpb25zKClcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGdldENvbXBsZXRpb25zKCkudGhlbiAoY29tcGxldGlvbnMpIC0+XG4gICAgICAgIGV4cGVjdChjb21wbGV0aW9uc1swXS50ZXh0KS50b0JlICdoZWxsb193b3JsZCdcbiAgICAgICAgZXhwZWN0KGNvbXBsZXRpb25zLmxlbmd0aCkudG9CZSAxXG4iXX0=
