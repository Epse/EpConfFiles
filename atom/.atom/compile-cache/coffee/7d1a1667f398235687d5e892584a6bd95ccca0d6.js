(function() {
  var Pigments, PigmentsAPI, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, _ref;

  Pigments = require('../lib/pigments');

  PigmentsAPI = require('../lib/pigments-api');

  _ref = require('../lib/versions'), SERIALIZE_VERSION = _ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref.SERIALIZE_MARKERS_VERSION;

  describe("Pigments", function() {
    var pigments, project, workspaceElement, _ref1;
    _ref1 = [], workspaceElement = _ref1[0], pigments = _ref1[1], project = _ref1[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      atom.config.set('pigments.ignoredScopes', []);
      atom.config.set('pigments.autocompleteScopes', []);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    it('instanciates a ColorProject instance', function() {
      return expect(pigments.getProject()).toBeDefined();
    });
    it('serializes the project', function() {
      var date;
      date = new Date;
      spyOn(pigments.getProject(), 'getTimestamp').andCallFake(function() {
        return date;
      });
      return expect(pigments.serialize()).toEqual({
        project: {
          deserializer: 'ColorProject',
          timestamp: date,
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION,
          globalSourceNames: ['**/*.sass', '**/*.styl'],
          globalIgnoredNames: [],
          buffers: {}
        }
      });
    });
    describe('service provider API', function() {
      var buffer, editor, editorElement, service, _ref2;
      _ref2 = [], service = _ref2[0], editor = _ref2[1], editorElement = _ref2[2], buffer = _ref2[3];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return buffer = project.colorBufferForEditor(editor);
          });
        });
        runs(function() {
          return service = pigments.provideAPI();
        });
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('returns an object conforming to the API', function() {
        expect(service instanceof PigmentsAPI).toBeTruthy();
        expect(service.getProject()).toBe(project);
        expect(service.getPalette()).toEqual(project.getPalette());
        expect(service.getPalette()).not.toBe(project.getPalette());
        expect(service.getVariables()).toEqual(project.getVariables());
        return expect(service.getColorVariables()).toEqual(project.getColorVariables());
      });
      return describe('::observeColorBuffers', function() {
        var spy;
        spy = [][0];
        beforeEach(function() {
          spy = jasmine.createSpy('did-create-color-buffer');
          return service.observeColorBuffers(spy);
        });
        it('calls the callback for every existing color buffer', function() {
          expect(spy).toHaveBeenCalled();
          return expect(spy.calls.length).toEqual(1);
        });
        return it('calls the callback on every new buffer creation', function() {
          waitsForPromise(function() {
            return atom.workspace.open('buttons.styl');
          });
          return runs(function() {
            return expect(spy.calls.length).toEqual(2);
          });
        });
      });
    });
    describe('when deactivated', function() {
      var colorBuffer, editor, editorElement, _ref2;
      _ref2 = [], editor = _ref2[0], editorElement = _ref2[1], colorBuffer = _ref2[2];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        waitsFor(function() {
          return editorElement.shadowRoot.querySelector('pigments-markers');
        });
        return runs(function() {
          spyOn(project, 'destroy').andCallThrough();
          spyOn(colorBuffer, 'destroy').andCallThrough();
          return pigments.deactivate();
        });
      });
      it('destroys the pigments project', function() {
        return expect(project.destroy).toHaveBeenCalled();
      });
      it('destroys all the color buffers that were created', function() {
        expect(project.colorBufferForEditor(editor)).toBeUndefined();
        expect(project.colorBuffersByEditorId).toBeNull();
        return expect(colorBuffer.destroy).toHaveBeenCalled();
      });
      return it('destroys the color buffer element that were added to the DOM', function() {
        return expect(editorElement.shadowRoot.querySelector('pigments-markers')).not.toExist();
      });
    });
    return describe('pigments:project-settings', function() {
      var item;
      item = null;
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:project-settings');
        return waitsFor(function() {
          item = atom.workspace.getActivePaneItem();
          return item != null;
        });
      });
      return it('opens a settings view in the active pane', function() {
        return item.matches('pigments-color-project');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3BpZ21lbnRzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLE9BQWlELE9BQUEsQ0FBUSxpQkFBUixDQUFqRCxFQUFDLHlCQUFBLGlCQUFELEVBQW9CLGlDQUFBLHlCQUhwQixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsMENBQUE7QUFBQSxJQUFBLFFBQXdDLEVBQXhDLEVBQUMsMkJBQUQsRUFBbUIsbUJBQW5CLEVBQTZCLGtCQUE3QixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQURBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsQ0FBQyxXQUFELEVBQWMsV0FBZCxDQUF4QyxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsRUFBekMsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLEVBQTFDLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLE1BQU0s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

//# sourceURL=/home/epse/.atom/packages/pigments/spec/pigments-spec.coffee
