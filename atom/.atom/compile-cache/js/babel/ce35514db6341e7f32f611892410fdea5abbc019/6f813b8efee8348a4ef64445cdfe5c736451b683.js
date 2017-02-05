function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

var _helpers = require('./helpers');

'use babel';

describe('Linter Integration', function () {
  var directory = null;
  var workspaceElement = null;
  var dummyPackage = null;
  var join = require('path').join;
  var originalHomedirFn = _os2['default'].homedir;

  _temp2['default'].track();

  beforeEach(function () {
    var createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' }));
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.scrollOnError', false);
    atom.config.set('build.notificationOnRefresh', true);
    atom.config.set('editor.fontSize', 14);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return Promise.resolve().then(function () {
        return atom.packages.activatePackage('build');
      }).then(function () {
        return atom.packages.activatePackage(join(__dirname, 'fixture', 'atom-build-spec-linter'));
      }).then(function () {
        return dummyPackage = atom.packages.getActivePackage('atom-build-spec-linter').mainModule;
      });
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
    _os2['default'].homedir = originalHomedirFn;
  });

  describe('when error matching and linter is activated', function () {
    it('should push those errors to the linter', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match-multiple.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }, {
          filePath: join(directory, '.atom-build.json'),
          range: [[1, 4], [1, 4]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
      });
    });

    it('should parse `message` and include that to linter', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match.message.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'very bad things',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
      });
    });

    it('should emit warnings just like errors', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-warning.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: 'mildly bad things',
          html: undefined,
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should attach traces to matches where applicable', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: 'insert great explanation here',
            html: undefined,
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });

    it('should clear linter errors when starting a new build', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match.message.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'very bad things',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
        _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), JSON.stringify({
          cmd: '' + (0, _helpers.sleep)(30)
        }));
      });

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && !workspaceElement.querySelector('.build .title').classList.contains('error') && !workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(dummyPackage.getLinter().messages.length).toEqual(0);
      });
    });

    it('should leave text undefined if html is set', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: undefined,
          html: 'mildly <b>bad</b> things',
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should leave text undefined if html is set in traces', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: undefined,
            html: 'insert <i>great</i> explanation here',
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });

    it('should give priority to text over html when both are set', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-message-and-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: 'something happened in plain text',
          html: undefined,
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should give priority to text over html when both are set in traces', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace-message-and-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: 'insert plain text explanation here',
            html: undefined,
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2xpbnRlci1pbnRlcmdyYXRpb24tc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztrQkFFZSxJQUFJOzs7O3VCQUNKLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7dUJBQzNCLFdBQVc7O0FBTmpDLFdBQVcsQ0FBQzs7QUFRWixRQUFRLENBQUMsb0JBQW9CLEVBQUUsWUFBTTtBQUNuQyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbEMsTUFBTSxpQkFBaUIsR0FBRyxnQkFBRyxPQUFPLENBQUM7O0FBRXJDLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBTSxjQUFjLEdBQUcsa0JBQUssU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDOUQsb0JBQUcsT0FBTyxHQUFHO2FBQU0sY0FBYztLQUFBLENBQUM7QUFDbEMsYUFBUyxHQUFHLHFCQUFHLFlBQVksQ0FBQyxrQkFBSyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUUsUUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBRSxTQUFTLENBQUUsQ0FBQyxDQUFDOztBQUVyQyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFdkMsV0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDcEMsV0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRXRDLFFBQUksQ0FBQyxZQUFNO0FBQ1Qsc0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELGFBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUN2QyxDQUFDLENBQUM7O0FBRUgsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUNyQixJQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQ2xELElBQUksQ0FBQztlQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7T0FBQSxDQUFDLENBQy9GLElBQUksQ0FBQztlQUFPLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUMsVUFBVTtPQUFDLENBQUMsQ0FBQztLQUNyRyxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsV0FBUyxDQUFDLFlBQU07QUFDZCx5QkFBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekIsb0JBQUcsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0dBQ2hDLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsNkNBQTZDLEVBQUUsWUFBTTtBQUM1RCxNQUFFLENBQUMsd0NBQXdDLEVBQUUsWUFBTTtBQUNqRCxZQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELDJCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEVBQUUscUJBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1SSxVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQy9FLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QyxjQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QjtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQztBQUM3QyxlQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRTtBQUN6QixjQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLGNBQUksRUFBRSxTQUFTO0FBQ2YsY0FBSSxFQUFFLE9BQU87QUFDYixrQkFBUSxFQUFFLE9BQU87QUFDakIsZUFBSyxFQUFFLFNBQVM7U0FDakIsRUFDRDtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQztBQUM3QyxlQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRTtBQUN6QixjQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLGNBQUksRUFBRSxTQUFTO0FBQ2YsY0FBSSxFQUFFLE9BQU87QUFDYixrQkFBUSxFQUFFLE9BQU87QUFDakIsZUFBSyxFQUFFLFNBQVM7U0FDakIsQ0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLG1EQUFtRCxFQUFFLFlBQU07QUFDNUQsWUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCwyQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLHFCQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFM0ksVUFBSSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUV0RSxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMvRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUI7QUFDRSxrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7QUFDN0MsZUFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUU7QUFDekIsY0FBSSxFQUFFLGlCQUFpQjtBQUN2QixjQUFJLEVBQUUsU0FBUztBQUNmLGNBQUksRUFBRSxPQUFPO0FBQ2Isa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGVBQUssRUFBRSxTQUFTO1NBQ2pCLENBQ0YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx1Q0FBdUMsRUFBRSxZQUFNO0FBQ2hELFlBQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsMkJBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxxQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsdUNBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTFJLFVBQUksQ0FBQztlQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdEUsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3hDLGNBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQzlCO0FBQ0Usa0JBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDO0FBQzNDLGVBQUssRUFBRSxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFO0FBQ3pCLGNBQUksRUFBRSxtQkFBbUI7QUFDekIsY0FBSSxFQUFFLFNBQVM7QUFDZixjQUFJLEVBQUUsU0FBUztBQUNmLGtCQUFRLEVBQUUsU0FBUztBQUNuQixlQUFLLEVBQUUsU0FBUztTQUNqQixDQUNGLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBTTtBQUMzRCxZQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELDJCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLEVBQUUscUJBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV4SSxVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQy9FLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QyxjQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QjtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQztBQUMzQyxlQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRTtBQUN6QixjQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLGNBQUksRUFBRSxTQUFTO0FBQ2YsY0FBSSxFQUFFLE9BQU87QUFDYixrQkFBUSxFQUFFLE9BQU87QUFDakIsZUFBSyxFQUFFLENBQ0w7QUFDRSxnQkFBSSxFQUFFLCtCQUErQjtBQUNyQyxnQkFBSSxFQUFFLFNBQVM7QUFDZixvQkFBUSxFQUFFLE1BQU07QUFDaEIsZ0JBQUksRUFBRSxhQUFhO0FBQ25CLGlCQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN4QixvQkFBUSxFQUFFLFNBQVM7V0FDcEIsQ0FDRjtTQUNGLENBQ0YsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxzREFBc0QsRUFBRSxZQUFNO0FBQy9ELFlBQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsMkJBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxxQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNJLFVBQUksQ0FBQztlQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdEUsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDL0UsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3hDLGNBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQzlCO0FBQ0Usa0JBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDO0FBQzdDLGVBQUssRUFBRSxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFO0FBQ3pCLGNBQUksRUFBRSxpQkFBaUI7QUFDdkIsY0FBSSxFQUFFLFNBQVM7QUFDZixjQUFJLEVBQUUsT0FBTztBQUNiLGtCQUFRLEVBQUUsT0FBTztBQUNqQixlQUFLLEVBQUUsU0FBUztTQUNqQixDQUNGLENBQUMsQ0FBQztBQUNILDZCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNuRSxhQUFHLE9BQUssb0JBQU0sRUFBRSxDQUFDLEFBQUU7U0FDcEIsQ0FBQyxDQUFDLENBQUM7T0FDTCxDQUFDLENBQUM7O0FBRUgscUJBQWUsQ0FBQztlQUFNLGtDQUFZLG1CQUFtQixFQUFFO09BQUEsQ0FBQyxDQUFDOztBQUV6RCxVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQzVFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDbEYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzdELENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsNENBQTRDLEVBQUUsWUFBTTtBQUNyRCxZQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELDJCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLEVBQUUscUJBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2SSxVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QyxjQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QjtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQztBQUMzQyxlQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRTtBQUN6QixjQUFJLEVBQUUsU0FBUztBQUNmLGNBQUksRUFBRSwwQkFBMEI7QUFDaEMsY0FBSSxFQUFFLFNBQVM7QUFDZixrQkFBUSxFQUFFLFNBQVM7QUFDbkIsZUFBSyxFQUFFLFNBQVM7U0FDakIsQ0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLHNEQUFzRCxFQUFFLFlBQU07QUFDL0QsWUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCwyQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLHFCQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFN0ksVUFBSSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUV0RSxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMvRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUI7QUFDRSxrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7QUFDM0MsZUFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUU7QUFDekIsY0FBSSxFQUFFLGtCQUFrQjtBQUN4QixjQUFJLEVBQUUsU0FBUztBQUNmLGNBQUksRUFBRSxPQUFPO0FBQ2Isa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGVBQUssRUFBRSxDQUNMO0FBQ0UsZ0JBQUksRUFBRSxTQUFTO0FBQ2YsZ0JBQUksRUFBRSxzQ0FBc0M7QUFDNUMsb0JBQVEsRUFBRSxNQUFNO0FBQ2hCLGdCQUFJLEVBQUUsYUFBYTtBQUNuQixpQkFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEIsb0JBQVEsRUFBRSxTQUFTO1dBQ3BCLENBQ0Y7U0FDRixDQUNGLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsMERBQTBELEVBQUUsWUFBTTtBQUNuRSxZQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELDJCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLEVBQUUscUJBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLGdEQUFnRCxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuSixVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QyxjQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QjtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQztBQUMzQyxlQUFLLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRTtBQUN6QixjQUFJLEVBQUUsa0NBQWtDO0FBQ3hDLGNBQUksRUFBRSxTQUFTO0FBQ2YsY0FBSSxFQUFFLFNBQVM7QUFDZixrQkFBUSxFQUFFLFNBQVM7QUFDbkIsZUFBSyxFQUFFLFNBQVM7U0FDakIsQ0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLG9FQUFvRSxFQUFFLFlBQU07QUFDN0UsWUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCwyQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLHFCQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxzREFBc0QsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFekosVUFBSSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUV0RSxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMvRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUI7QUFDRSxrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7QUFDM0MsZUFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUU7QUFDekIsY0FBSSxFQUFFLGtCQUFrQjtBQUN4QixjQUFJLEVBQUUsU0FBUztBQUNmLGNBQUksRUFBRSxPQUFPO0FBQ2Isa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGVBQUssRUFBRSxDQUNMO0FBQ0UsZ0JBQUksRUFBRSxvQ0FBb0M7QUFDMUMsZ0JBQUksRUFBRSxTQUFTO0FBQ2Ysb0JBQVEsRUFBRSxNQUFNO0FBQ2hCLGdCQUFJLEVBQUUsYUFBYTtBQUNuQixpQkFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEIsb0JBQVEsRUFBRSxTQUFTO1dBQ3BCLENBQ0Y7U0FDRixDQUNGLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9saW50ZXItaW50ZXJncmF0aW9uLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBzcGVjSGVscGVycyBmcm9tICdhdG9tLWJ1aWxkLXNwZWMtaGVscGVycyc7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vaGVscGVycyc7XG5cbmRlc2NyaWJlKCdMaW50ZXIgSW50ZWdyYXRpb24nLCAoKSA9PiB7XG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IG51bGw7XG4gIGxldCBkdW1teVBhY2thZ2UgPSBudWxsO1xuICBjb25zdCBqb2luID0gcmVxdWlyZSgncGF0aCcpLmpvaW47XG4gIGNvbnN0IG9yaWdpbmFsSG9tZWRpckZuID0gb3MuaG9tZWRpcjtcblxuICB0ZW1wLnRyYWNrKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgY29uc3QgY3JlYXRlZEhvbWVEaXIgPSB0ZW1wLm1rZGlyU3luYygnYXRvbS1idWlsZC1zcGVjLWhvbWUnKTtcbiAgICBvcy5ob21lZGlyID0gKCkgPT4gY3JlYXRlZEhvbWVEaXI7XG4gICAgZGlyZWN0b3J5ID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKHsgcHJlZml4OiAnYXRvbS1idWlsZC1zcGVjLScgfSkpO1xuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbIGRpcmVjdG9yeSBdKTtcblxuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuYnVpbGRPblNhdmUnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5wYW5lbFZpc2liaWxpdHknLCAnVG9nZ2xlJyk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5zYXZlT25CdWlsZCcsIGZhbHNlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnNjcm9sbE9uRXJyb3InLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnLCB0cnVlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5mb250U2l6ZScsIDE0KTtcblxuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpO1xuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgLnRoZW4oKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2J1aWxkJykpXG4gICAgICAgIC50aGVuKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICdhdG9tLWJ1aWxkLXNwZWMtbGludGVyJykpKVxuICAgICAgICAudGhlbigoKSA9PiAoZHVtbXlQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdhdG9tLWJ1aWxkLXNwZWMtbGludGVyJykubWFpbk1vZHVsZSkpO1xuICAgIH0pO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgICBvcy5ob21lZGlyID0gb3JpZ2luYWxIb21lZGlyRm47XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIGVycm9yIG1hdGNoaW5nIGFuZCBsaW50ZXIgaXMgYWN0aXZhdGVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcHVzaCB0aG9zZSBlcnJvcnMgdG8gdGhlIGxpbnRlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5lcnJvci1tYXRjaC1tdWx0aXBsZS5qc29uJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qc29uJyksXG4gICAgICAgICAgICByYW5nZTogWyBbMiwgN10sIFsyLCA3XSBdLFxuICAgICAgICAgICAgdGV4dDogJ0Vycm9yIGZyb20gYnVpbGQnLFxuICAgICAgICAgICAgaHRtbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICAgICAgdHJhY2U6IHVuZGVmaW5lZFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanNvbicpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzEsIDRdLCBbMSwgNF0gXSxcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHBhcnNlIGBtZXNzYWdlYCBhbmQgaW5jbHVkZSB0aGF0IHRvIGxpbnRlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5lcnJvci1tYXRjaC5tZXNzYWdlLmpzb24nKSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSBkdW1teVBhY2thZ2UuZ2V0TGludGVyKCk7XG4gICAgICAgIGV4cGVjdChsaW50ZXIubWVzc2FnZXMpLnRvRXF1YWwoW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFsyLCA3XSwgWzIsIDddIF0sXG4gICAgICAgICAgICB0ZXh0OiAndmVyeSBiYWQgdGhpbmdzJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGVtaXQgd2FybmluZ3MganVzdCBsaWtlIGVycm9ycycsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQubWF0Y2gtZnVuY3Rpb24td2FybmluZy5qcycpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzQsIDBdLCBbNCwgMF0gXSxcbiAgICAgICAgICAgIHRleHQ6ICdtaWxkbHkgYmFkIHRoaW5ncycsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnV2FybmluZycsXG4gICAgICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgdHJhY2U6IHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYXR0YWNoIHRyYWNlcyB0byBtYXRjaGVzIHdoZXJlIGFwcGxpY2FibGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmhhc1JlZ2lzdGVyZWQoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLCBmcy5yZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlJywgJy5hdG9tLWJ1aWxkLm1hdGNoLWZ1bmN0aW9uLXRyYWNlLmpzJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzUsIDBdLCBbNSwgMF0gXSxcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnaW5zZXJ0IGdyZWF0IGV4cGxhbmF0aW9uIGhlcmUnLFxuICAgICAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdFeHBsYW5hdGlvbicsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFsgWzAsIDBdLCBbMCwgMF1dLFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY2xlYXIgbGludGVyIGVycm9ycyB3aGVuIHN0YXJ0aW5nIGEgbmV3IGJ1aWxkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanNvbicpLCBmcy5yZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlJywgJy5hdG9tLWJ1aWxkLmVycm9yLW1hdGNoLm1lc3NhZ2UuanNvbicpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanNvbicpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzIsIDddLCBbMiwgN10gXSxcbiAgICAgICAgICAgIHRleHQ6ICd2ZXJ5IGJhZCB0aGluZ3MnLFxuICAgICAgICAgICAgaHRtbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICAgICAgdHJhY2U6IHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qc29uJyksIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjbWQ6IGAke3NsZWVwKDMwKX1gXG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJykgJiZcbiAgICAgICAgICAhd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuZ2V0TGludGVyKCkubWVzc2FnZXMubGVuZ3RoKS50b0VxdWFsKDApO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGxlYXZlIHRleHQgdW5kZWZpbmVkIGlmIGh0bWwgaXMgc2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5tYXRjaC1mdW5jdGlvbi1odG1sLmpzJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSBkdW1teVBhY2thZ2UuZ2V0TGludGVyKCk7XG4gICAgICAgIGV4cGVjdChsaW50ZXIubWVzc2FnZXMpLnRvRXF1YWwoW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksXG4gICAgICAgICAgICByYW5nZTogWyBbNCwgMF0sIFs0LCAwXSBdLFxuICAgICAgICAgICAgdGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaHRtbDogJ21pbGRseSA8Yj5iYWQ8L2I+IHRoaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnV2FybmluZycsXG4gICAgICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgdHJhY2U6IHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVhdmUgdGV4dCB1bmRlZmluZWQgaWYgaHRtbCBpcyBzZXQgaW4gdHJhY2VzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5tYXRjaC1mdW5jdGlvbi10cmFjZS1odG1sLmpzJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzUsIDBdLCBbNSwgMF0gXSxcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgaHRtbDogJ2luc2VydCA8aT5ncmVhdDwvaT4gZXhwbGFuYXRpb24gaGVyZScsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnRXhwbGFuYXRpb24nLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbIFswLCAwXSwgWzAsIDBdXSxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGdpdmUgcHJpb3JpdHkgdG8gdGV4dCBvdmVyIGh0bWwgd2hlbiBib3RoIGFyZSBzZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmhhc1JlZ2lzdGVyZWQoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLCBmcy5yZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlJywgJy5hdG9tLWJ1aWxkLm1hdGNoLWZ1bmN0aW9uLW1lc3NhZ2UtYW5kLWh0bWwuanMnKSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFs0LCAwXSwgWzQsIDBdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnc29tZXRoaW5nIGhhcHBlbmVkIGluIHBsYWluIHRleHQnLFxuICAgICAgICAgICAgaHRtbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGdpdmUgcHJpb3JpdHkgdG8gdGV4dCBvdmVyIGh0bWwgd2hlbiBib3RoIGFyZSBzZXQgaW4gdHJhY2VzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5tYXRjaC1mdW5jdGlvbi10cmFjZS1tZXNzYWdlLWFuZC1odG1sLmpzJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzUsIDBdLCBbNSwgMF0gXSxcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnaW5zZXJ0IHBsYWluIHRleHQgZXhwbGFuYXRpb24gaGVyZScsXG4gICAgICAgICAgICAgICAgaHRtbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0V4cGxhbmF0aW9uJyxcbiAgICAgICAgICAgICAgICByYW5nZTogWyBbMCwgMF0sIFswLCAwXV0sXG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19