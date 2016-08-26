(function() {
  describe('Linter Behavior', function() {
    var bottomContainer, getLinter, getMessage, linter, linterState, trigger, _ref;
    linter = null;
    linterState = null;
    bottomContainer = null;
    _ref = require('./common'), getLinter = _ref.getLinter, trigger = _ref.trigger;
    getMessage = function(type, filePath) {
      return {
        type: type,
        text: 'Some Message',
        filePath: filePath,
        range: [[0, 0], [1, 1]]
      };
    };
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('linter').then(function() {
          linter = atom.packages.getActivePackage('linter').mainModule.instance;
          linterState = linter.state;
          return bottomContainer = linter.views.bottomContainer;
        });
      });
    });
    describe('Bottom Tabs', function() {
      it('defaults to file tab', function() {
        return expect(linterState.scope).toBe('File');
      });
      it('changes tab on click', function() {
        trigger(bottomContainer.getTab('Project'), 'click');
        return expect(linterState.scope).toBe('Project');
      });
      it('toggles panel visibility on click', function() {
        var timesCalled;
        timesCalled = 0;
        bottomContainer.onShouldTogglePanel(function() {
          return ++timesCalled;
        });
        trigger(bottomContainer.getTab('Project'), 'click');
        expect(timesCalled).toBe(0);
        trigger(bottomContainer.getTab('Project'), 'click');
        return expect(timesCalled).toBe(1);
      });
      it('re-enables panel when another tab is clicked', function() {
        var timesCalled;
        timesCalled = 0;
        bottomContainer.onShouldTogglePanel(function() {
          return ++timesCalled;
        });
        trigger(bottomContainer.getTab('File'), 'click');
        expect(timesCalled).toBe(1);
        trigger(bottomContainer.getTab('Project'), 'click');
        return expect(timesCalled).toBe(1);
      });
      return it('updates count on pane change', function() {
        var messages, provider;
        provider = getLinter();
        expect(bottomContainer.getTab('File').count).toBe(0);
        messages = [getMessage('Error', __dirname + '/fixtures/file.txt')];
        linter.setMessages(provider, messages);
        linter.messages.updatePublic();
        return waitsForPromise(function() {
          return atom.workspace.open('file.txt').then(function() {
            expect(bottomContainer.getTab('File').count).toBe(1);
            expect(linter.views.bottomPanel.getVisibility()).toBe(true);
            return atom.workspace.open('/tmp/non-existing-file');
          }).then(function() {
            expect(bottomContainer.getTab('File').count).toBe(0);
            return expect(linter.views.bottomPanel.getVisibility()).toBe(false);
          });
        });
      });
    });
    return describe('Markers', function() {
      return it('automatically marks files when they are opened if they have any markers', function() {
        var messages, provider;
        provider = getLinter();
        messages = [getMessage('Error', '/etc/passwd')];
        linter.setMessages(provider, messages);
        linter.messages.updatePublic();
        return waitsForPromise(function() {
          return atom.workspace.open('/etc/passwd').then(function() {
            var activeEditor;
            activeEditor = atom.workspace.getActiveTextEditor();
            return expect(activeEditor.getMarkers().length > 0).toBe(true);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9saW50ZXItYmVoYXZpb3Itc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLDBFQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsSUFDQSxXQUFBLEdBQWMsSUFEZCxDQUFBO0FBQUEsSUFFQSxlQUFBLEdBQWtCLElBRmxCLENBQUE7QUFBQSxJQUdBLE9BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMsaUJBQUEsU0FBRCxFQUFZLGVBQUEsT0FIWixDQUFBO0FBQUEsSUFLQSxVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sUUFBUCxHQUFBO0FBQ1gsYUFBTztBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxJQUFBLEVBQU0sY0FBYjtBQUFBLFFBQTZCLFVBQUEsUUFBN0I7QUFBQSxRQUF1QyxLQUFBLEVBQU8sQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBOUM7T0FBUCxDQURXO0lBQUEsQ0FMYixDQUFBO0FBQUEsSUFRQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsUUFBOUIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxTQUFBLEdBQUE7QUFDM0MsVUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQUF3QyxDQUFDLFVBQVUsQ0FBQyxRQUE3RCxDQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWMsTUFBTSxDQUFDLEtBRHJCLENBQUE7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

//# sourceURL=/home/epse/.atom/packages/linter/spec/linter-behavior-spec.coffee
