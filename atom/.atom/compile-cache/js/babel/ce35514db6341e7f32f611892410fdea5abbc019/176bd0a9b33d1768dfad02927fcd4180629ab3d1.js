function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./helpers/workspace');

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

'use babel';

describe('Minimap package', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var editorElement = _ref[2];
  var minimapElement = _ref[3];
  var workspaceElement = _ref[4];
  var minimapPackage = _ref[5];

  beforeEach(function () {
    atom.config.set('minimap.autoToggle', true);

    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return atom.workspace.open('sample.coffee');
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap').then(function (pkg) {
        minimapPackage = pkg.mainModule;
      });
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor');
    });

    runs(function () {
      editor = atom.workspace.getActiveTextEditor();
      editorElement = atom.views.getView(editor);
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor::shadow atom-text-editor-minimap');
    });
  });

  it('registers the minimap views provider', function () {
    var textEditor = atom.workspace.buildTextEditor({});
    minimap = new _libMinimap2['default']({ textEditor: textEditor });
    minimapElement = atom.views.getView(minimap);

    expect(minimapElement).toExist();
  });

  describe('when an editor is opened', function () {
    it('creates a minimap model for the editor', function () {
      expect(minimapPackage.minimapForEditor(editor)).toBeDefined();
    });

    it('attaches a minimap element to the editor view', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).toExist();
    });

    describe('when the package is deactivated', function () {
      beforeEach(function () {
        atom.packages.deactivatePackage('minimap');
      });
      it('removes the minimap from their editor parent', function () {
        expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
      });

      describe('and reactivated with a remaining minimap in the DOM', function () {
        beforeEach(function () {
          var m = new _libMinimap2['default']({ textEditor: editor });
          var v = atom.views.getView(m);
          editorElement.shadowRoot.appendChild(v);
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap');
          });
        });

        it('removes the remaining minimap', function () {
          expect(editorElement.shadowRoot.querySelectorAll('atom-text-editor-minimap').length).toEqual(1);
        });
      });
    });
  });

  describe('::observeMinimaps', function () {
    var _ref2 = [];
    var spy = _ref2[0];

    beforeEach(function () {
      spy = jasmine.createSpy('observeMinimaps');
      minimapPackage.observeMinimaps(spy);
    });

    it('calls the callback with the existing minimaps', function () {
      expect(spy).toHaveBeenCalled();
    });

    it('calls the callback when a new editor is opened', function () {
      waitsForPromise(function () {
        return atom.workspace.open('other-sample.js');
      });

      runs(function () {
        expect(spy.calls.length).toEqual(2);
      });
    });
  });

  describe('::deactivate', function () {
    beforeEach(function () {
      minimapPackage.deactivate();
    });

    it('destroys all the minimap models', function () {
      expect(minimapPackage.editorsMinimaps).toBeUndefined();
    });

    it('destroys all the minimap elements', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
    });
  });

  describe('service', function () {
    it('returns the minimap main module', function () {
      expect(minimapPackage.provideMinimapServiceV1()).toEqual(minimapPackage);
    });

    it('creates standalone minimap with provided text editor', function () {
      var textEditor = atom.workspace.buildTextEditor({});
      var standaloneMinimap = minimapPackage.standAloneMinimapForEditor(textEditor);
      expect(standaloneMinimap.getTextEditor()).toEqual(textEditor);
    });
  });

  //    ########  ##       ##     ##  ######   #### ##    ##  ######
  //    ##     ## ##       ##     ## ##    ##   ##  ###   ## ##    ##
  //    ##     ## ##       ##     ## ##         ##  ####  ## ##
  //    ########  ##       ##     ## ##   ####  ##  ## ## ##  ######
  //    ##        ##       ##     ## ##    ##   ##  ##  ####       ##
  //    ##        ##       ##     ## ##    ##   ##  ##   ### ##    ##
  //    ##        ########  #######   ######   #### ##    ##  ######

  describe('plugins', function () {
    var _ref3 = [];
    var registerHandler = _ref3[0];
    var unregisterHandler = _ref3[1];
    var plugin = _ref3[2];

    describe('when the displayPluginsControls setting is enabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
        atom.config.set('minimap.plugins.dummy', undefined);

        plugin = {
          active: false,
          activatePlugin: function activatePlugin() {
            this.active = true;
          },
          deactivatePlugin: function deactivatePlugin() {
            this.active = false;
          },
          isActive: function isActive() {
            return this.active;
          }
        };

        spyOn(plugin, 'activatePlugin').andCallThrough();
        spyOn(plugin, 'deactivatePlugin').andCallThrough();

        registerHandler = jasmine.createSpy('register handler');
        unregisterHandler = jasmine.createSpy('unregister handler');
      });

      describe('when registered', function () {
        beforeEach(function () {
          minimapPackage.onDidAddPlugin(registerHandler);
          minimapPackage.onDidRemovePlugin(unregisterHandler);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('makes the plugin available in the minimap', function () {
          expect(minimapPackage.plugins['dummy']).toBe(plugin);
        });

        it('emits an event', function () {
          expect(registerHandler).toHaveBeenCalled();
        });

        it('creates a default config for the plugin', function () {
          expect(minimapPackage.getConfigSchema().plugins.properties.dummy).toBeDefined();
          expect(minimapPackage.getConfigSchema().plugins.properties.dummyDecorationsZIndex).toBeDefined();
        });

        it('sets the corresponding config', function () {
          expect(atom.config.get('minimap.plugins.dummy')).toBeTruthy();
          expect(atom.config.get('minimap.plugins.dummyDecorationsZIndex')).toEqual(0);
        });

        describe('triggering the corresponding plugin command', function () {
          beforeEach(function () {
            atom.commands.dispatch(workspaceElement, 'minimap:toggle-dummy');
          });

          it('receives a deactivation call', function () {
            expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });

        describe('and then unregistered', function () {
          beforeEach(function () {
            minimapPackage.unregisterPlugin('dummy');
          });

          it('has been unregistered', function () {
            expect(minimapPackage.plugins['dummy']).toBeUndefined();
          });

          it('emits an event', function () {
            expect(unregisterHandler).toHaveBeenCalled();
          });

          describe('when the config is modified', function () {
            beforeEach(function () {
              atom.config.set('minimap.plugins.dummy', false);
            });

            it('does not activates the plugin', function () {
              expect(plugin.deactivatePlugin).not.toHaveBeenCalled();
            });
          });
        });

        describe('on minimap deactivation', function () {
          beforeEach(function () {
            expect(plugin.active).toBeTruthy();
            minimapPackage.deactivate();
          });

          it('deactivates all the plugins', function () {
            expect(plugin.active).toBeFalsy();
          });
        });
      });

      describe('when the config for it is false', function () {
        beforeEach(function () {
          atom.config.set('minimap.plugins.dummy', false);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('does not receive an activation call', function () {
          expect(plugin.activatePlugin).not.toHaveBeenCalled();
        });
      });

      describe('the registered plugin', function () {
        beforeEach(function () {
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('receives an activation call', function () {
          expect(plugin.activatePlugin).toHaveBeenCalled();
        });

        it('activates the plugin', function () {
          expect(plugin.active).toBeTruthy();
        });

        describe('when the config is modified after registration', function () {
          beforeEach(function () {
            atom.config.set('minimap.plugins.dummy', false);
          });

          it('receives a deactivation call', function () {
            expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the displayPluginsControls setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', false);
        atom.config.set('minimap.plugins.dummy', undefined);

        plugin = {
          active: false,
          activatePlugin: function activatePlugin() {
            this.active = true;
          },
          deactivatePlugin: function deactivatePlugin() {
            this.active = false;
          },
          isActive: function isActive() {
            return this.active;
          }
        };

        spyOn(plugin, 'activatePlugin').andCallThrough();
        spyOn(plugin, 'deactivatePlugin').andCallThrough();

        registerHandler = jasmine.createSpy('register handler');
        unregisterHandler = jasmine.createSpy('unregister handler');
      });

      describe('when registered', function () {
        beforeEach(function () {
          minimapPackage.onDidAddPlugin(registerHandler);
          minimapPackage.onDidRemovePlugin(unregisterHandler);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('makes the plugin available in the minimap', function () {
          expect(minimapPackage.plugins['dummy']).toBe(plugin);
        });

        it('emits an event', function () {
          expect(registerHandler).toHaveBeenCalled();
        });

        it('still activates the package', function () {
          expect(plugin.isActive()).toBeTruthy();
        });

        describe('and then unregistered', function () {
          beforeEach(function () {
            minimapPackage.unregisterPlugin('dummy');
          });

          it('has been unregistered', function () {
            expect(minimapPackage.plugins['dummy']).toBeUndefined();
          });

          it('emits an event', function () {
            expect(unregisterHandler).toHaveBeenCalled();
          });
        });

        describe('on minimap deactivation', function () {
          beforeEach(function () {
            expect(plugin.active).toBeTruthy();
            minimapPackage.deactivate();
          });

          it('deactivates all the plugins', function () {
            expect(plugin.active).toBeFalsy();
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1tYWluLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7UUFFTyxxQkFBcUI7OzBCQUNSLGdCQUFnQjs7OztBQUhwQyxXQUFXLENBQUE7O0FBS1gsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFlBQU07YUFDeUQsRUFBRTtNQUF0RixNQUFNO01BQUUsT0FBTztNQUFFLGFBQWE7TUFBRSxjQUFjO01BQUUsZ0JBQWdCO01BQUUsY0FBYzs7QUFFckYsWUFBVSxDQUFDLFlBQU07QUFDZixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFM0Msb0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3JELFdBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTs7QUFFckMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7S0FDNUMsQ0FBQyxDQUFBOztBQUVGLG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM1RCxzQkFBYyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUE7T0FDaEMsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRCxDQUFDLENBQUE7O0FBRUYsUUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFB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QUMsZ0JBQWdCLEVBQUUsWUFBTTtBQUN6QixrQkFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtXQUM3QyxDQUFDLENBQUE7U0FDSCxDQUFDLENBQUE7O0FBRUYsZ0JBQVEsQ0FBQyx5QkFBeUIsRUFBRSxZQUFNO0FBQ3hDLG9CQUFVLENBQUMsWUFBTTtBQUNmLGtCQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBQ2xDLDBCQUFjLENBQUMsVUFBVSxFQUFFLENBQUE7V0FDNUIsQ0FBQyxDQUFBOztBQUVGLFlBQUUsQ0FBQyw2QkFBNkIsRUFBRSxZQUFNO0FBQ3RDLGtCQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBO1dBQ2xDLENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtbWFpbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICcuL2hlbHBlcnMvd29ya3NwYWNlJ1xuaW1wb3J0IE1pbmltYXAgZnJvbSAnLi4vbGliL21pbmltYXAnXG5cbmRlc2NyaWJlKCdNaW5pbWFwIHBhY2thZ2UnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBlZGl0b3JFbGVtZW50LCBtaW5pbWFwRWxlbWVudCwgd29ya3NwYWNlRWxlbWVudCwgbWluaW1hcFBhY2thZ2VdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYXV0b1RvZ2dsZScsIHRydWUpXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmNvZmZlZScpXG4gICAgfSlcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21pbmltYXAnKS50aGVuKChwa2cpID0+IHtcbiAgICAgICAgbWluaW1hcFBhY2thZ2UgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgfSlcblxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpXG4gICAgfSlcbiAgfSlcblxuICBpdCgncmVnaXN0ZXJzIHRoZSBtaW5pbWFwIHZpZXdzIHByb3ZpZGVyJywgKCkgPT4ge1xuICAgIGxldCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcn0pXG4gICAgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcblxuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudCkudG9FeGlzdCgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYW4gZWRpdG9yIGlzIG9wZW5lZCcsICgpID0+IHtcbiAgICBpdCgnY3JlYXRlcyBhIG1pbmltYXAgbW9kZWwgZm9yIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UubWluaW1hcEZvckVkaXRvcihlZGl0b3IpKS50b0JlRGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KCdhdHRhY2hlcyBhIG1pbmltYXAgZWxlbWVudCB0byB0aGUgZWRpdG9yIHZpZXcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpKS50b0V4aXN0KClcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIHBhY2thZ2UgaXMgZGVhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpXG4gICAgICB9KVxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIG1pbmltYXAgZnJvbSB0aGVpciBlZGl0b3IgcGFyZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHJlYWN0aXZhdGVkIHdpdGggYSByZW1haW5pbmcgbWluaW1hcCBpbiB0aGUgRE9NJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBtID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3I6IGVkaXRvcn0pXG4gICAgICAgICAgY29uc3QgdiA9IGF0b20udmlld3MuZ2V0VmlldyhtKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh2KVxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSByZW1haW5pbmcgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6Om9ic2VydmVNaW5pbWFwcycsICgpID0+IHtcbiAgICBsZXQgW3NweV0gPSBbXVxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ29ic2VydmVNaW5pbWFwcycpXG4gICAgICBtaW5pbWFwUGFja2FnZS5vYnNlcnZlTWluaW1hcHMoc3B5KVxuICAgIH0pXG5cbiAgICBpdCgnY2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGV4aXN0aW5nIG1pbmltYXBzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgfSlcblxuICAgIGl0KCdjYWxscyB0aGUgY2FsbGJhY2sgd2hlbiBhIG5ldyBlZGl0b3IgaXMgb3BlbmVkJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHsgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJ290aGVyLXNhbXBsZS5qcycpIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4geyBleHBlY3Qoc3B5LmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKSB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6ZGVhY3RpdmF0ZScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIG1pbmltYXBQYWNrYWdlLmRlYWN0aXZhdGUoKVxuICAgIH0pXG5cbiAgICBpdCgnZGVzdHJveXMgYWxsIHRoZSBtaW5pbWFwIG1vZGVscycsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5lZGl0b3JzTWluaW1hcHMpLnRvQmVVbmRlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnZGVzdHJveXMgYWxsIHRoZSBtaW5pbWFwIGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKSkubm90LnRvRXhpc3QoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3NlcnZpY2UnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIG1pbmltYXAgbWFpbiBtb2R1bGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucHJvdmlkZU1pbmltYXBTZXJ2aWNlVjEoKSkudG9FcXVhbChtaW5pbWFwUGFja2FnZSlcbiAgICB9KVxuXG4gICAgaXQoJ2NyZWF0ZXMgc3RhbmRhbG9uZSBtaW5pbWFwIHdpdGggcHJvdmlkZWQgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBsZXQgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICAgIGxldCBzdGFuZGFsb25lTWluaW1hcCA9IG1pbmltYXBQYWNrYWdlLnN0YW5kQWxvbmVNaW5pbWFwRm9yRWRpdG9yKHRleHRFZGl0b3IpXG4gICAgICBleHBlY3Qoc3RhbmRhbG9uZU1pbmltYXAuZ2V0VGV4dEVkaXRvcigpKS50b0VxdWFsKHRleHRFZGl0b3IpXG4gICAgfSlcbiAgfSlcblxuICAvLyAgICAjIyMjIyMjIyAgIyMgICAgICAgIyMgICAgICMjICAjIyMjIyMgICAjIyMjICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgICMjICAjIyMgICAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICAgIyMgICMjIyMgICMjICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAjIyMjICAjIyAgIyMgIyMgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAgIyMgICMjICAjIyMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICAjIyAgIyMgICAjIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyMjICAjIyMjIyMjICAgIyMjIyMjICAgIyMjIyAjIyAgICAjIyAgIyMjIyMjXG5cbiAgZGVzY3JpYmUoJ3BsdWdpbnMnLCAoKSA9PiB7XG4gICAgbGV0IFtyZWdpc3RlckhhbmRsZXIsIHVucmVnaXN0ZXJIYW5kbGVyLCBwbHVnaW5dID0gW11cblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgdW5kZWZpbmVkKVxuXG4gICAgICAgIHBsdWdpbiA9IHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHlPbihwbHVnaW4sICdhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocGx1Z2luLCAnZGVhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICByZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICAgIHVucmVnaXN0ZXJIYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ3VucmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5vbkRpZEFkZFBsdWdpbihyZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRSZW1vdmVQbHVnaW4odW5yZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgcGx1Z2luIGF2YWlsYWJsZSBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZShwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjcmVhdGVzIGEgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLmdldENvbmZpZ1NjaGVtYSgpLnBsdWdpbnMucHJvcGVydGllcy5kdW1teSkudG9CZURlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5nZXRDb25maWdTY2hlbWEoKS5wbHVnaW5zLnByb3BlcnRpZXMuZHVtbXlEZWNvcmF0aW9uc1pJbmRleCkudG9CZURlZmluZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzZXRzIHRoZSBjb3JyZXNwb25kaW5nIGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15RGVjb3JhdGlvbnNaSW5kZXgnKSkudG9FcXVhbCgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd0cmlnZ2VyaW5nIHRoZSBjb3JyZXNwb25kaW5nIHBsdWdpbiBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnbWluaW1hcDp0b2dnbGUtZHVtbXknKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncmVjZWl2ZXMgYSBkZWFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnYW5kIHRoZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UudW5yZWdpc3RlclBsdWdpbignZHVtbXknKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnaGFzIGJlZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnBsdWdpbnNbJ2R1bW15J10pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZW1pdHMgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QodW5yZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgY29uZmlnIGlzIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgZmFsc2UpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnZG9lcyBub3QgYWN0aXZhdGVzIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdvbiBtaW5pbWFwIGRlYWN0aXZhdGlvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZlKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLmRlYWN0aXZhdGUoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZGVhY3RpdmF0ZXMgYWxsIHRoZSBwbHVnaW5zJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb25maWcgZm9yIGl0IGlzIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5kdW1teScsIGZhbHNlKVxuICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teScsIHBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZG9lcyBub3QgcmVjZWl2ZSBhbiBhY3RpdmF0aW9uIGNhbGwnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmF0ZVBsdWdpbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3RoZSByZWdpc3RlcmVkIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZWNlaXZlcyBhbiBhY3RpdmF0aW9uIGNhbGwnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmF0ZVBsdWdpbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FjdGl2YXRlcyB0aGUgcGx1Z2luJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZlKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgY29uZmlnIGlzIG1vZGlmaWVkIGFmdGVyIHJlZ2lzdHJhdGlvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgZmFsc2UpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZWNlaXZlcyBhIGRlYWN0aXZhdGlvbiBjYWxsJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyBkaXNhYmxlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIGZhbHNlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5kdW1teScsIHVuZGVmaW5lZClcblxuICAgICAgICBwbHVnaW4gPSB7XG4gICAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICBhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gdHJ1ZSB9LFxuICAgICAgICAgIGRlYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IGZhbHNlIH0sXG4gICAgICAgICAgaXNBY3RpdmUgKCkgeyByZXR1cm4gdGhpcy5hY3RpdmUgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3B5T24ocGx1Z2luLCAnYWN0aXZhdGVQbHVnaW4nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIHNweU9uKHBsdWdpbiwgJ2RlYWN0aXZhdGVQbHVnaW4nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgcmVnaXN0ZXJIYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ3JlZ2lzdGVyIGhhbmRsZXInKVxuICAgICAgICB1bnJlZ2lzdGVySGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCd1bnJlZ2lzdGVyIGhhbmRsZXInKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gcmVnaXN0ZXJlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRBZGRQbHVnaW4ocmVnaXN0ZXJIYW5kbGVyKVxuICAgICAgICAgIG1pbmltYXBQYWNrYWdlLm9uRGlkUmVtb3ZlUGx1Z2luKHVucmVnaXN0ZXJIYW5kbGVyKVxuICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teScsIHBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnbWFrZXMgdGhlIHBsdWdpbiBhdmFpbGFibGUgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnBsdWdpbnNbJ2R1bW15J10pLnRvQmUocGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdlbWl0cyBhbiBldmVudCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVnaXN0ZXJIYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc3RpbGwgYWN0aXZhdGVzIHRoZSBwYWNrYWdlJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChwbHVnaW4uaXNBY3RpdmUoKSkudG9CZVRydXRoeSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIHVucmVnaXN0ZXJlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnVucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2hhcyBiZWVuIHVucmVnaXN0ZXJlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5wbHVnaW5zWydkdW1teSddKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHVucmVnaXN0ZXJIYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdvbiBtaW5pbWFwIGRlYWN0aXZhdGlvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZlKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLmRlYWN0aXZhdGUoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZGVhY3RpdmF0ZXMgYWxsIHRoZSBwbHVnaW5zJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/minimap/spec/minimap-main-spec.js
