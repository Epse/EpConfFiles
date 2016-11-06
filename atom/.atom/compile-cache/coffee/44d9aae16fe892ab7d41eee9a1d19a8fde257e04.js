(function() {
  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, _ref;
    _ref = [], completionDelay = _ref[0], editor = _ref[1], editorView = _ref[2], pigments = _ref[3], autocompleteMain = _ref[4], autocompleteManager = _ref[5], jasmineContent = _ref[6], project = _ref[7];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        jasmineContent = document.body.querySelector('#jasmine-content');
        atom.config.set('pigments.autocompleteScopes', ['*']);
        atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmineContent.appendChild(workspaceElement);
      });
      waitsForPromise('autocomplete-plus activation', function() {
        return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
          return autocompleteMain = pkg.mainModule;
        });
      });
      waitsForPromise('pigments activation', function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          return pigments = pkg.mainModule;
        });
      });
      runs(function() {
        spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
        return spyOn(pigments, 'provideAutocomplete').andCallThrough();
      });
      waitsForPromise('open sample file', function() {
        return atom.workspace.open('sample.styl').then(function(e) {
          editor = e;
          editor.setText('');
          return editorView = atom.views.getView(editor);
        });
      });
      waitsForPromise('pigments project initialized', function() {
        project = pigments.getProject();
        return project.initialize();
      });
      return runs(function() {
        autocompleteManager = autocompleteMain.autocompleteManager;
        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      });
    });
    describe('writing the name of a color', function() {
      it('returns suggestions for the matching colors', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('border: 1px solid ');
          editor.moveToBottom();
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var popup, preview;
          popup = editorView.querySelector('.autocomplete-plus');
          expect(popup).toExist();
          expect(popup.querySelector('span.word').textContent).toEqual('base-color');
          preview = popup.querySelector('.color-suggestion-preview');
          expect(preview).toExist();
          return expect(preview.style.background).toEqual('rgb(255, 255, 255)');
        });
      });
      it('replaces the prefix even when it contains a @', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('@');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editor.getText()).not.toContain('@@');
        });
      });
      it('replaces the prefix even when it contains a $', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('o');
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toContain('$other-color');
          return expect(editor.getText()).not.toContain('$$');
        });
      });
      return describe('when the extendAutocompleteToColorValue setting is enabled', function() {
        beforeEach(function() {
          return atom.config.set('pigments.extendAutocompleteToColorValue', true);
        });
        describe('with an opaque color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('b');
              editor.insertText('a');
              editor.insertText('s');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('base-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
        });
        describe('when the autocompleteSuggestionsFromValue setting is enabled', function() {
          beforeEach(function() {
            return atom.config.set('pigments.autocompleteSuggestionsFromValue', true);
          });
          it('suggests color variables from hexadecimal values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from hexadecimal values when in a CSS expression', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from rgb values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('r');
              editor.insertText('g');
              editor.insertText('b');
              editor.insertText('(');
              editor.insertText('2');
              editor.insertText('5');
              editor.insertText('5');
              editor.insertText(',');
              editor.insertText(' ');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          return describe('and when extendAutocompleteToVariables is true', function() {
            beforeEach(function() {
              return atom.config.set('pigments.extendAutocompleteToVariables', true);
            });
            return it('returns suggestions for the matching variable value', function() {
              runs(function() {
                expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
                editor.moveToBottom();
                editor.insertText('border: ');
                editor.moveToBottom();
                editor.insertText('6');
                editor.insertText('p');
                editor.insertText('x');
                editor.insertText(' ');
                return advanceClock(completionDelay);
              });
              waitsFor(function() {
                return autocompleteManager.displaySuggestions.calls.length === 1;
              });
              waitsFor(function() {
                return editorView.querySelector('.autocomplete-plus li') != null;
              });
              return runs(function() {
                var popup;
                popup = editorView.querySelector('.autocomplete-plus');
                expect(popup).toExist();
                expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
                return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
              });
            });
          });
        });
        return describe('with a transparent color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('$');
              editor.insertText('o');
              editor.insertText('t');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('$other-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('rgba(255,0,0,0.5)');
            });
          });
        });
      });
    });
    describe('writing the name of a non-color variable', function() {
      return it('returns suggestions for the matching variable', function() {
        atom.config.set('pigments.extendAutocompleteToVariables', false);
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('o');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
    return describe('when extendAutocompleteToVariables is true', function() {
      beforeEach(function() {
        return atom.config.set('pigments.extendAutocompleteToVariables', true);
      });
      return describe('writing the name of a non-color variable', function() {
        return it('returns suggestions for the matching variable', function() {
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('b');
            editor.insertText('u');
            editor.insertText('t');
            editor.insertText('t');
            editor.insertText('o');
            editor.insertText('n');
            editor.insertText('-');
            editor.insertText('p');
            return advanceClock(completionDelay);
          });
          waitsFor(function() {
            return autocompleteManager.displaySuggestions.calls.length === 1;
          });
          waitsFor(function() {
            return editorView.querySelector('.autocomplete-plus li') != null;
          });
          return runs(function() {
            var popup;
            popup = editorView.querySelector('.autocomplete-plus');
            expect(popup).toExist();
            expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
            return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
          });
        });
      });
    });
  });

  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, _ref;
    _ref = [], completionDelay = _ref[0], editor = _ref[1], editorView = _ref[2], pigments = _ref[3], autocompleteMain = _ref[4], autocompleteManager = _ref[5], jasmineContent = _ref[6], project = _ref[7];
    return describe('for sass files', function() {
      beforeEach(function() {
        runs(function() {
          var workspaceElement;
          jasmineContent = document.body.querySelector('#jasmine-content');
          atom.config.set('pigments.autocompleteScopes', ['*']);
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.scss']);
          atom.config.set('autocomplete-plus.enableAutoActivation', true);
          completionDelay = 100;
          atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
          completionDelay += 100;
          workspaceElement = atom.views.getView(atom.workspace);
          return jasmineContent.appendChild(workspaceElement);
        });
        waitsForPromise('autocomplete-plus activation', function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
            return autocompleteMain = pkg.mainModule;
          });
        });
        waitsForPromise('pigments activation', function() {
          return atom.packages.activatePackage('pigments').then(function(pkg) {
            return pigments = pkg.mainModule;
          });
        });
        runs(function() {
          spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
          return spyOn(pigments, 'provideAutocomplete').andCallThrough();
        });
        waitsForPromise('open sample file', function() {
          return atom.workspace.open('sample.styl').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise('pigments project initialized', function() {
          project = pigments.getProject();
          return project.initialize();
        });
        return runs(function() {
          autocompleteManager = autocompleteMain.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return it('does not display the alternate sass version', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor('suggestions displayed callback', function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor('autocomplete lis', function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var hasAlternate, lis;
          lis = editorView.querySelectorAll('.autocomplete-plus li');
          hasAlternate = Array.prototype.some.call(lis, function(li) {
            return li.querySelector('span.word').textContent === '$base_color';
          });
          return expect(hasAlternate).toBeFalsy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvcGlnbWVudHMtcHJvdmlkZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLEVBQUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxRQUFBLG1IQUFBO0FBQUEsSUFBQSxPQUFrSCxFQUFsSCxFQUFDLHlCQUFELEVBQWtCLGdCQUFsQixFQUEwQixvQkFBMUIsRUFBc0Msa0JBQXRDLEVBQWdELDBCQUFoRCxFQUFrRSw2QkFBbEUsRUFBdUYsd0JBQXZGLEVBQXVHLGlCQUF2RyxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSxnQkFBQTtBQUFBLFFBQUEsY0FBQSxHQUFpQixRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWQsQ0FBNEIsa0JBQTVCLENBQWpCLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsQ0FBQyxHQUFELENBQS9DLENBRkEsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxXQURzQyxFQUV0QyxXQUZzQyxDQUF4QyxDQUhBLENBQUE7QUFBQSxRQVNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQsQ0FUQSxDQUFBO0FBQUEsUUFXQSxlQUFBLEdBQWtCLEdBWGxCLENBQUE7QUFBQSxRQVlBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsRUFBeUQsZUFBekQsQ0FaQSxDQUFBO0FBQUEsUUFhQSxlQUFBLElBQW1C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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/spec/pigments-provider-spec.coffee
