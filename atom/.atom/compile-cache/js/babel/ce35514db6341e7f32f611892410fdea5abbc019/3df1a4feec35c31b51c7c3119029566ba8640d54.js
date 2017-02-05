Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

function getConfig(file) {
  var fs = require('fs');
  var realFile = fs.realpathSync(file);
  delete require.cache[realFile];
  switch (require('path').extname(file)) {
    case '.json':
    case '.js':
      return require(realFile);

    case '.cson':
      return require('cson-parser').parse(fs.readFileSync(realFile));

    case '.yml':
      return require('js-yaml').safeLoad(fs.readFileSync(realFile));
  }

  return {};
}

function createBuildConfig(build, name) {
  var conf = {
    name: 'Custom: ' + name,
    exec: build.cmd,
    env: build.env,
    args: build.args,
    cwd: build.cwd,
    sh: build.sh,
    errorMatch: build.errorMatch,
    functionMatch: build.functionMatch,
    warningMatch: build.warningMatch,
    atomCommandName: build.atomCommandName,
    keymap: build.keymap,
    killSignals: build.killSignals
  };

  if (typeof build.postBuild === 'function') {
    conf.postBuild = build.postBuild;
  }

  if (typeof build.preBuild === 'function') {
    conf.preBuild = build.preBuild;
  }

  return conf;
}

var CustomFile = (function (_EventEmitter) {
  _inherits(CustomFile, _EventEmitter);

  function CustomFile(cwd) {
    _classCallCheck(this, CustomFile);

    _get(Object.getPrototypeOf(CustomFile.prototype), 'constructor', this).call(this);
    this.cwd = cwd;
    this.fileWatchers = [];
  }

  _createClass(CustomFile, [{
    key: 'destructor',
    value: function destructor() {
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
    }
  }, {
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Custom file';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      var _this = this;

      var os = require('os');
      var fs = require('fs');
      var path = require('path');
      this.files = [].concat.apply([], ['json', 'cson', 'yml', 'js'].map(function (ext) {
        return [path.join(_this.cwd, '.atom-build.' + ext), path.join(os.homedir(), '.atom-build.' + ext)];
      })).filter(fs.existsSync);
      return 0 < this.files.length;
    }
  }, {
    key: 'settings',
    value: function settings() {
      var _this2 = this;

      var fs = require('fs');
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
      // On Linux, closing a watcher triggers a new callback, which causes an infinite loop
      // fallback to `watchFile` here which polls instead.
      this.fileWatchers = this.files.map(function (file) {
        return (require('os').platform() === 'linux' ? fs.watchFile : fs.watch)(file, function () {
          return _this2.emit('refresh');
        });
      });

      var config = [];
      this.files.map(getConfig).forEach(function (build) {
        config.push.apply(config, [createBuildConfig(build, build.name || 'default')].concat(_toConsumableArray(Object.keys(build.targets || {}).map(function (name) {
          return createBuildConfig(build.targets[name], name);
        }))));
      });

      return config;
    }
  }]);

  return CustomFile;
})(_events2['default']);

exports['default'] = CustomFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYXRvbS1idWlsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUV5QixRQUFROzs7O0FBRmpDLFdBQVcsQ0FBQzs7QUFJWixTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDdkIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsU0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLFVBQVEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbkMsU0FBSyxPQUFPLENBQUM7QUFDYixTQUFLLEtBQUs7QUFDUixhQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFBQSxBQUUzQixTQUFLLE9BQU87QUFDVixhQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUFBLEFBRWpFLFNBQUssTUFBTTtBQUNULGFBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFBQSxHQUNqRTs7QUFFRCxTQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELFNBQVMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN0QyxNQUFNLElBQUksR0FBRztBQUNYLFFBQUksRUFBRSxVQUFVLEdBQUcsSUFBSTtBQUN2QixRQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDZixPQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDZCxRQUFJLEVBQUUsS0FBSyxDQUFD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QyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN6QyxjQUFNLENBQUMsSUFBSSxNQUFBLENBQVgsTUFBTSxHQUNKLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyw0QkFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7aUJBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7U0FBQSxDQUFDLEdBQzlGLENBQUM7T0FDSCxDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBNUNrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2F0b20tYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5mdW5jdGlvbiBnZXRDb25maWcoZmlsZSkge1xuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gIGNvbnN0IHJlYWxGaWxlID0gZnMucmVhbHBhdGhTeW5jKGZpbGUpO1xuICBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZWFsRmlsZV07XG4gIHN3aXRjaCAocmVxdWlyZSgncGF0aCcpLmV4dG5hbWUoZmlsZSkpIHtcbiAgICBjYXNlICcuanNvbic6XG4gICAgY2FzZSAnLmpzJzpcbiAgICAgIHJldHVybiByZXF1aXJlKHJlYWxGaWxlKTtcblxuICAgIGNhc2UgJy5jc29uJzpcbiAgICAgIHJldHVybiByZXF1aXJlKCdjc29uLXBhcnNlcicpLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhyZWFsRmlsZSkpO1xuXG4gICAgY2FzZSAnLnltbCc6XG4gICAgICByZXR1cm4gcmVxdWlyZSgnanMteWFtbCcpLnNhZmVMb2FkKGZzLnJlYWRGaWxlU3luYyhyZWFsRmlsZSkpO1xuICB9XG5cbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWlsZENvbmZpZyhidWlsZCwgbmFtZSkge1xuICBjb25zdCBjb25mID0ge1xuICAgIG5hbWU6ICdDdXN0b206ICcgKyBuYW1lLFxuICAgIGV4ZWM6IGJ1aWxkLmNtZCxcbiAgICBlbnY6IGJ1aWxkLmVudixcbiAgICBhcmdzOiBidWlsZC5hcmdzLFxuICAgIGN3ZDogYnVpbGQuY3dkLFxuICAgIHNoOiBidWlsZC5zaCxcbiAgICBlcnJvck1hdGNoOiBidWlsZC5lcnJvck1hdGNoLFxuICAgIGZ1bmN0aW9uTWF0Y2g6IGJ1aWxkLmZ1bmN0aW9uTWF0Y2gsXG4gICAgd2FybmluZ01hdGNoOiBidWlsZC53YXJuaW5nTWF0Y2gsXG4gICAgYXRvbUNvbW1hbmROYW1lOiBidWlsZC5hdG9tQ29tbWFuZE5hbWUsXG4gICAga2V5bWFwOiBidWlsZC5rZXltYXAsXG4gICAga2lsbFNpZ25hbHM6IGJ1aWxkLmtpbGxTaWduYWxzXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBidWlsZC5wb3N0QnVpbGQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25mLnBvc3RCdWlsZCA9IGJ1aWxkLnBvc3RCdWlsZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYnVpbGQucHJlQnVpbGQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25mLnByZUJ1aWxkID0gYnVpbGQucHJlQnVpbGQ7XG4gIH1cblxuICByZXR1cm4gY29uZjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tRmlsZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKGN3ZCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgdGhpcy5maWxlV2F0Y2hlcnMgPSBbXTtcbiAgfVxuXG4gIGRlc3RydWN0b3IoKSB7XG4gICAgdGhpcy5maWxlV2F0Y2hlcnMuZm9yRWFjaChmdyA9PiBmdy5jbG9zZSgpKTtcbiAgfVxuXG4gIGdldE5pY2VOYW1lKCkge1xuICAgIHJldHVybiAnQ3VzdG9tIGZpbGUnO1xuICB9XG5cbiAgaXNFbGlnaWJsZSgpIHtcbiAgICBjb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gICAgdGhpcy5maWxlcyA9IFtdLmNvbmNhdC5hcHBseShbXSwgWyAnanNvbicsICdjc29uJywgJ3ltbCcsICdqcycgXS5tYXAoZXh0ID0+IFtcbiAgICAgIHBhdGguam9pbih0aGlzLmN3ZCwgYC5hdG9tLWJ1aWxkLiR7ZXh0fWApLFxuICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgYC5hdG9tLWJ1aWxkLiR7ZXh0fWApXG4gICAgXSkpLmZpbHRlcihmcy5leGlzdHNTeW5jKTtcbiAgICByZXR1cm4gMCA8IHRoaXMuZmlsZXMubGVuZ3RoO1xuICB9XG5cbiAgc2V0dGluZ3MoKSB7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgIHRoaXMuZmlsZVdhdGNoZXJzLmZvckVhY2goZncgPT4gZncuY2xvc2UoKSk7XG4gICAgLy8gT24gTGludXgsIGNsb3NpbmcgYSB3YXRjaGVyIHRyaWdnZXJzIGEgbmV3IGNhbGxiYWNrLCB3aGljaCBjYXVzZXMgYW4gaW5maW5pdGUgbG9vcFxuICAgIC8vIGZhbGxiYWNrIHRvIGB3YXRjaEZpbGVgIGhlcmUgd2hpY2ggcG9sbHMgaW5zdGVhZC5cbiAgICB0aGlzLmZpbGVXYXRjaGVycyA9IHRoaXMuZmlsZXMubWFwKGZpbGUgPT5cbiAgICAgIChyZXF1aXJlKCdvcycpLnBsYXRmb3JtKCkgPT09ICdsaW51eCcgPyBmcy53YXRjaEZpbGUgOiBmcy53YXRjaCkoZmlsZSwgKCkgPT4gdGhpcy5lbWl0KCdyZWZyZXNoJykpXG4gICAgKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IFtdO1xuICAgIHRoaXMuZmlsZXMubWFwKGdldENvbmZpZykuZm9yRWFjaChidWlsZCA9PiB7XG4gICAgICBjb25maWcucHVzaChcbiAgICAgICAgY3JlYXRlQnVpbGRDb25maWcoYnVpbGQsIGJ1aWxkLm5hbWUgfHwgJ2RlZmF1bHQnKSxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoYnVpbGQudGFyZ2V0cyB8fCB7fSkubWFwKG5hbWUgPT4gY3JlYXRlQnVpbGRDb25maWcoYnVpbGQudGFyZ2V0c1tuYW1lXSwgbmFtZSkpXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxufVxuIl19