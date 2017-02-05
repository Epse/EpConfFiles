function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _libAtomBuildJs = require('../lib/atom-build.js');

var _libAtomBuildJs2 = _interopRequireDefault(_libAtomBuildJs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('custom provider', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var builder = undefined;
  var directory = null;
  var createdHomeDir = undefined;

  _temp2['default'].track();

  beforeEach(function () {
    createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
    atom.project.setPaths([directory]);
    builder = new _libAtomBuildJs2['default'](directory);
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
    _os2['default'].homedir = originalHomedirFn;
  });

  describe('when there is no .atom-build config file in any elegible directory', function () {
    it('should not be eligible', function () {
      expect(builder.isEligible()).toEqual(false);
    });
  });

  describe('when .atom-build config is on home directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build config is on project directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build.cson exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['arg1', 'arg2']);
          expect(s.name).toEqual('Custom: Compose masterpiece');
          expect(s.sh).toEqual(false);
          expect(s.cwd).toEqual('/some/directory');
          expect(s.errorMatch).toEqual('(?<file>\\w+.js):(?<row>\\d+)');
        });
      });
    });
  });

  describe('when .atom-build.json exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('dd');
          expect(s.args).toEqual(['if=.atom-build.json']);
          expect(s.name).toEqual('Custom: Fly to moon');
        });
      });
    });
  });

  describe('when .atom-build.yml exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'yaml']);
          expect(s.name).toEqual('Custom: yaml conf');
        });
      });
    });
  });

  describe('when .atom-build.js exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.js', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.js'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'js']);
          expect(s.name).toEqual('Custom: from js');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2N1c3RvbS1wcm92aWRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUVlLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7Ozs4QkFDQSxzQkFBc0I7Ozs7a0JBQzlCLElBQUk7Ozs7QUFMbkIsV0FBVyxDQUFDOztBQU9aLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO0FBQ2hDLE1BQU0saUJBQWlCLEdBQUcsZ0JBQUcsT0FBTyxDQUFDO0FBQ3JDLE1BQUksT0FBTyxZQUFBLENBQUM7QUFDWixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxjQUFjLFlBQUEsQ0FBQzs7QUFFbkIsb0JBQUssS0FBSyxFQUFFLENBQUM7O0FBRWIsWUFBVSxDQUFDLFlBQU07QUFDZixrQkFBYyxHQUFHLGtCQUFLLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELG9CQUFHLE9BQU8sR0FBRzthQUFNLGNBQWM7S0FBQSxDQUFDO0FBQ2xDLGFBQVMsR0FBRyxxQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNsRixRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFFLFNBQVMsQ0FBRSxDQUFDLENBQUM7QUFDckMsV0FBTyxHQUFHLGdDQUFlLFNBQVMsQ0FBQyxDQUFDO0dBQ3JDLENBQUMsQ0FBQzs7QUFFSCxXQUFTLENBQUMsWUFBTTtBQUNkLHlCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QixvQkFBRyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7R0FDaEMsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyxvRUFBb0UsRUFBRSxZQUFNO0FBQ25GLE1BQUUsQ0FBQyx3QkFBd0IsRUFBRSxZQUFNO0FBQ2pDLFlBQU0sQ0FB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QUM7S0FDSixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLDRCQUE0QixFQUFFLFlBQU07QUFDM0MsTUFBRSxDQUFDLDJCQUEyQixFQUFFLFlBQU07QUFDcEMsMkJBQUcsYUFBYSxDQUFJLFNBQVMscUJBQWtCLHFCQUFHLFlBQVksQ0FBSSxTQUFTLDZCQUEwQixDQUFDLENBQUM7QUFDdkcsWUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFM0MscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDMUQsY0FBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUUsQ0FBQyxDQUFDO0FBQzNELGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNDLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9jdXN0b20tcHJvdmlkZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5pbXBvcnQgQ3VzdG9tRmlsZSBmcm9tICcuLi9saWIvYXRvbS1idWlsZC5qcyc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuXG5kZXNjcmliZSgnY3VzdG9tIHByb3ZpZGVyJywgKCkgPT4ge1xuICBjb25zdCBvcmlnaW5hbEhvbWVkaXJGbiA9IG9zLmhvbWVkaXI7XG4gIGxldCBidWlsZGVyO1xuICBsZXQgZGlyZWN0b3J5ID0gbnVsbDtcbiAgbGV0IGNyZWF0ZWRIb21lRGlyO1xuXG4gIHRlbXAudHJhY2soKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjcmVhdGVkSG9tZURpciA9IHRlbXAubWtkaXJTeW5jKCdhdG9tLWJ1aWxkLXNwZWMtaG9tZScpO1xuICAgIG9zLmhvbWVkaXIgPSAoKSA9PiBjcmVhdGVkSG9tZURpcjtcbiAgICBkaXJlY3RvcnkgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoeyBwcmVmaXg6ICdhdG9tLWJ1aWxkLXNwZWMtJyB9KSkgKyAnLyc7XG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFsgZGlyZWN0b3J5IF0pO1xuICAgIGJ1aWxkZXIgPSBuZXcgQ3VzdG9tRmlsZShkaXJlY3RvcnkpO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgICBvcy5ob21lZGlyID0gb3JpZ2luYWxIb21lZGlyRm47XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZXJlIGlzIG5vIC5hdG9tLWJ1aWxkIGNvbmZpZyBmaWxlIGluIGFueSBlbGVnaWJsZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBub3QgYmUgZWxpZ2libGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwoZmFsc2UpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZCBjb25maWcgaXMgb24gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIGpzb24gZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoY3JlYXRlZEhvbWVEaXIgKyAnLy5hdG9tLWJ1aWxkLmpzb24nLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmpzb24nKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIGNzb24gZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoY3JlYXRlZEhvbWVEaXIgKyAnLy5hdG9tLWJ1aWxkLmNzb24nLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmNzb24nKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIHltbCBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhjcmVhdGVkSG9tZURpciArICcvLmF0b20tYnVpbGQueW1sJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC55bWwnKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkIGNvbmZpZyBpcyBvbiBwcm9qZWN0IGRpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGZpbmQganNvbiBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmpzb24nLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmpzb24nKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIGNzb24gZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5jc29uJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5jc29uJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgZmluZCB5bWwgZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC55bWwnLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnltbCcpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQuY3NvbiBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBwcm92aWRlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5jc29uJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5jc29uJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2VjaG8nKTtcbiAgICAgICAgICBleHBlY3Qocy5hcmdzKS50b0VxdWFsKFsgJ2FyZzEnLCAnYXJnMicgXSk7XG4gICAgICAgICAgZXhwZWN0KHMubmFtZSkudG9FcXVhbCgnQ3VzdG9tOiBDb21wb3NlIG1hc3RlcnBpZWNlJyk7XG4gICAgICAgICAgZXhwZWN0KHMuc2gpLnRvRXF1YWwoZmFsc2UpO1xuICAgICAgICAgIGV4cGVjdChzLmN3ZCkudG9FcXVhbCgnL3NvbWUvZGlyZWN0b3J5Jyk7XG4gICAgICAgICAgZXhwZWN0KHMuZXJyb3JNYXRjaCkudG9FcXVhbCgnKD88ZmlsZT5cXFxcdysuanMpOig/PHJvdz5cXFxcZCspJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkLmpzb24gZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdpdCBzaG91bGQgcHJvdmlkZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhgJHtkaXJlY3Rvcnl9LmF0b20tYnVpbGQuanNvbmAsIGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2ZpeHR1cmUvLmF0b20tYnVpbGQuanNvbmApKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKCkpLnRoZW4oc2V0dGluZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IHMgPSBzZXR0aW5nc1swXTtcbiAgICAgICAgICBleHBlY3Qocy5leGVjKS50b0VxdWFsKCdkZCcpO1xuICAgICAgICAgIGV4cGVjdChzLmFyZ3MpLnRvRXF1YWwoWyAnaWY9LmF0b20tYnVpbGQuanNvbicgXSk7XG4gICAgICAgICAgZXhwZWN0KHMubmFtZSkudG9FcXVhbCgnQ3VzdG9tOiBGbHkgdG8gbW9vbicpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZC55bWwgZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdpdCBzaG91bGQgcHJvdmlkZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhgJHtkaXJlY3Rvcnl9LmF0b20tYnVpbGQueW1sYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC55bWxgKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYnVpbGRlci5zZXR0aW5ncygpKS50aGVuKHNldHRpbmdzID0+IHtcbiAgICAgICAgICBjb25zdCBzID0gc2V0dGluZ3NbMF07XG4gICAgICAgICAgZXhwZWN0KHMuZXhlYykudG9FcXVhbCgnZWNobycpO1xuICAgICAgICAgIGV4cGVjdChzLmFyZ3MpLnRvRXF1YWwoWyAnaGVsbG8nLCAnd29ybGQnLCAnZnJvbScsICd5YW1sJyBdKTtcbiAgICAgICAgICBleHBlY3Qocy5uYW1lKS50b0VxdWFsKCdDdXN0b206IHlhbWwgY29uZicpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZC5qcyBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBwcm92aWRlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGAke2RpcmVjdG9yeX0uYXRvbS1idWlsZC5qc2AsIGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2ZpeHR1cmUvLmF0b20tYnVpbGQuanNgKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYnVpbGRlci5zZXR0aW5ncygpKS50aGVuKHNldHRpbmdzID0+IHtcbiAgICAgICAgICBjb25zdCBzID0gc2V0dGluZ3NbMF07XG4gICAgICAgICAgZXhwZWN0KHMuZXhlYykudG9FcXVhbCgnZWNobycpO1xuICAgICAgICAgIGV4cGVjdChzLmFyZ3MpLnRvRXF1YWwoWyAnaGVsbG8nLCAnd29ybGQnLCAnZnJvbScsICdqcycgXSk7XG4gICAgICAgICAgZXhwZWN0KHMubmFtZSkudG9FcXVhbCgnQ3VzdG9tOiBmcm9tIGpzJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=