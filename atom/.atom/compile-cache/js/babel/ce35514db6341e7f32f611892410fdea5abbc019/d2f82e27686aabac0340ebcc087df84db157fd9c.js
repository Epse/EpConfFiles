function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _libCargo = require('../lib/cargo');

'use babel';

describe('cargo', function () {
  var directory = undefined;
  var builder = undefined;
  var Builder = (0, _libCargo.provideBuilder)();

  beforeEach(function () {
    atom.config.set('build-make.useMake', true);
    atom.config.set('build-make.jobs', 2);
    waitsForPromise(function () {
      return (0, _atomBuildSpecHelpers.vouch)(_temp2['default'].mkdir, 'atom-build-make-spec-').then(function (dir) {
        return (0, _atomBuildSpecHelpers.vouch)(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        return directory = dir + '/';
      }).then(function (dir) {
        return builder = new Builder(dir);
      });
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when Cargo.toml exists', function () {
    beforeEach(function () {
      _fsExtra2['default'].writeFileSync(directory + 'Cargo.toml', _fsExtra2['default'].readFileSync(__dirname + '/Cargo.toml'));
      atom.config.set('build-cargo.cargoPath', '/this/is/just/a/dummy/path/cargo');
    });

    it('should be eligible', function () {
      expect(builder.isEligible(directory)).toBe(true);
    });

    it('should yield available targets', function () {
      waitsForPromise(function () {
        return Promise.resolve(builder.settings(directory)).then(function (settings) {
          expect(settings.length).toBe(12); // change this when you change the default settings

          var defaultTarget = settings[0]; // default MUST be first
          expect(defaultTarget.name).toBe('Cargo: build (debug)');
          expect(defaultTarget.exec).toBe('/this/is/just/a/dummy/path/cargo');
          expect(defaultTarget.argsCfg).toEqual(['build']);
          expect(defaultTarget.sh).toBe(false);

          var target = settings.find(function (setting) {
            return setting.name === 'Cargo: test';
          });
          expect(target.name).toBe('Cargo: test');
          expect(target.exec).toBe('/this/is/just/a/dummy/path/cargo');
          expect(target.argsCfg).toEqual(['test']);
          expect(target.sh).toBe(false);
        });
      });
    });

    it('should not contain clippy in the set of commands if it is disabled', function () {
      atom.config.set('build-cargo.cargoClippy', false);
      waitsForPromise(function () {
        expect(builder.isEligible(directory)).toBe(true);
        return Promise.resolve(builder.settings(directory)).then(function (settings) {
          settings.forEach(function (s) {
            return expect(s.name.toLowerCase().indexOf('clippy')).toEqual(-1);
          });
        });
      });
    });
  });

  describe('when Cargo.toml does not exist', function () {
    it('should not be eligible', function () {
      expect(builder.isEligible(directory)).toBe(false);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9zcGVjL2NhcmdvLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7dUJBRWUsVUFBVTs7OztvQkFDUixNQUFNOzs7O29DQUNELHlCQUF5Qjs7d0JBQ2hCLGNBQWM7O0FBTDdDLFdBQVcsQ0FBQzs7QUFPWixRQUFRLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDdEIsTUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLE1BQUksT0FBTyxZQUFBLENBQUM7QUFDWixNQUFNLE9BQU8sR0FBRywrQkFBZ0IsQ0FBQzs7QUFFakMsWUFBVSxDQUFDLFlBQU07QUFDZixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QyxtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxpQ0FBTSxrQkFBSyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FDOUMsSUFBSSxDQUFDLFVBQUMsR0FBRztlQUFLLGlDQUFNLHFCQUFHLFFBQVEsRUFBRSxHQUFHLENBQUM7T0FBQSxDQUFDLENBQ3RDLElBQUksQ0FBQyxVQUFDLEdBQUc7ZUFBTSxTQUFTLEdBQU0sR0FBRyxNQUFHO09BQUMsQ0FBQyxDQUN0QyxJQUFJLENBQUMsVUFBQyxHQUFHO2VBQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQztPQUFDLENBQUMsQ0FBQztLQUNoRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsV0FBUyxDQUFDLFlBQU07QUFDZCx5QkFBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDMUIsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyx3QkFBd0IsRUFBRSxZQUFNO0FBQ3ZDLGNBQVUsQ0FBQyxZQUFNO0FB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WUFBTTtBQUMvQyxNQUFFLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUNqQyxZQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNuRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1aWxkLWNhcmdvL3NwZWMvY2FyZ28tc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5pbXBvcnQgeyB2b3VjaCB9IGZyb20gJ2F0b20tYnVpbGQtc3BlYy1oZWxwZXJzJztcbmltcG9ydCB7IHByb3ZpZGVCdWlsZGVyIH0gZnJvbSAnLi4vbGliL2NhcmdvJztcblxuZGVzY3JpYmUoJ2NhcmdvJywgKCkgPT4ge1xuICBsZXQgZGlyZWN0b3J5O1xuICBsZXQgYnVpbGRlcjtcbiAgY29uc3QgQnVpbGRlciA9IHByb3ZpZGVCdWlsZGVyKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1tYWtlLnVzZU1ha2UnLCB0cnVlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLW1ha2Uuam9icycsIDIpO1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gdm91Y2godGVtcC5ta2RpciwgJ2F0b20tYnVpbGQtbWFrZS1zcGVjLScpXG4gICAgICAgIC50aGVuKChkaXIpID0+IHZvdWNoKGZzLnJlYWxwYXRoLCBkaXIpKVxuICAgICAgICAudGhlbigoZGlyKSA9PiAoZGlyZWN0b3J5ID0gYCR7ZGlyfS9gKSlcbiAgICAgICAgLnRoZW4oKGRpcikgPT4gKGJ1aWxkZXIgPSBuZXcgQnVpbGRlcihkaXIpKSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgZnMucmVtb3ZlU3luYyhkaXJlY3RvcnkpO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiBDYXJnby50b21sIGV4aXN0cycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJ0NhcmdvLnRvbWwnLCBmcy5yZWFkRmlsZVN5bmMoYCR7X19kaXJuYW1lfS9DYXJnby50b21sYCkpO1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnLCAnL3RoaXMvaXMvanVzdC9hL2R1bW15L3BhdGgvY2FyZ28nKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYmUgZWxpZ2libGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKGRpcmVjdG9yeSkpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHlpZWxkIGF2YWlsYWJsZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKGRpcmVjdG9yeSkpLnRoZW4oKHNldHRpbmdzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHNldHRpbmdzLmxlbmd0aCkudG9CZSgxMik7IC8vIGNoYW5nZSB0aGlzIHdoZW4geW91IGNoYW5nZSB0aGUgZGVmYXVsdCBzZXR0aW5nc1xuXG4gICAgICAgICAgY29uc3QgZGVmYXVsdFRhcmdldCA9IHNldHRpbmdzWzBdOyAvLyBkZWZhdWx0IE1VU1QgYmUgZmlyc3RcbiAgICAgICAgICBleHBlY3QoZGVmYXVsdFRhcmdldC5uYW1lKS50b0JlKCdDYXJnbzogYnVpbGQgKGRlYnVnKScpO1xuICAgICAgICAgIGV4cGVjdChkZWZhdWx0VGFyZ2V0LmV4ZWMpLnRvQmUoJy90aGlzL2lzL2p1c3QvYS9kdW1teS9wYXRoL2NhcmdvJyk7XG4gICAgICAgICAgZXhwZWN0KGRlZmF1bHRUYXJnZXQuYXJnc0NmZykudG9FcXVhbChbICdidWlsZCcgXSk7XG4gICAgICAgICAgZXhwZWN0KGRlZmF1bHRUYXJnZXQuc2gpLnRvQmUoZmFsc2UpO1xuXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2V0dGluZ3MuZmluZChzZXR0aW5nID0+IHNldHRpbmcubmFtZSA9PT0gJ0NhcmdvOiB0ZXN0Jyk7XG4gICAgICAgICAgZXhwZWN0KHRhcmdldC5uYW1lKS50b0JlKCdDYXJnbzogdGVzdCcpO1xuICAgICAgICAgIGV4cGVjdCh0YXJnZXQuZXhlYykudG9CZSgnL3RoaXMvaXMvanVzdC9hL2R1bW15L3BhdGgvY2FyZ28nKTtcbiAgICAgICAgICBleHBlY3QodGFyZ2V0LmFyZ3NDZmcpLnRvRXF1YWwoWyAndGVzdCcgXSk7XG4gICAgICAgICAgZXhwZWN0KHRhcmdldC5zaCkudG9CZShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBjb250YWluIGNsaXBweSBpbiB0aGUgc2V0IG9mIGNvbW1hbmRzIGlmIGl0IGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScsIGZhbHNlKTtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoZGlyZWN0b3J5KSkudG9CZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKGRpcmVjdG9yeSkpLnRoZW4oKHNldHRpbmdzKSA9PiB7XG4gICAgICAgICAgc2V0dGluZ3MuZm9yRWFjaChzID0+IGV4cGVjdChzLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjbGlwcHknKSkudG9FcXVhbCgtMSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiBDYXJnby50b21sIGRvZXMgbm90IGV4aXN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgbm90IGJlIGVsaWdpYmxlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZShkaXJlY3RvcnkpKS50b0JlKGZhbHNlKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/build-cargo/spec/cargo-spec.js
