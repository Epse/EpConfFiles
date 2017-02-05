'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Linter = (function () {
  function Linter(registry) {
    _classCallCheck(this, Linter);

    this.linter = registry.register({ name: 'Build' });
  }

  _createClass(Linter, [{
    key: 'destroy',
    value: function destroy() {
      this.linter.dispose();
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.linter.deleteMessages();
    }
  }, {
    key: 'processMessages',
    value: function processMessages(messages, cwd) {
      function extractRange(json) {
        return [[(json.line || 1) - 1, (json.col || 1) - 1], [(json.line_end || json.line || 1) - 1, (json.col_end || json.col || 1) - 1]];
      }
      function normalizePath(p) {
        return require('path').isAbsolute(p) ? p : require('path').join(cwd, p);
      }
      function typeToSeverity(type) {
        switch (type && type.toLowerCase()) {
          case 'err':
          case 'error':
            return 'error';
          case 'warn':
          case 'warning':
            return 'warning';
          default:
            return null;
        }
      }
      this.linter.setMessages(messages.map(function (match) {
        return {
          type: match.type || 'Error',
          text: !match.message && !match.html_message ? 'Error from build' : match.message,
          html: match.message ? undefined : match.html_message,
          filePath: normalizePath(match.file),
          severity: typeToSeverity(match.type),
          range: extractRange(match),
          trace: match.trace && match.trace.map(function (trace) {
            return {
              type: trace.type || 'Trace',
              text: !trace.message && !trace.html_message ? 'Trace in build' : trace.message,
              html: trace.message ? undefined : trace.html_message,
              filePath: trace.file && normalizePath(trace.file),
              severity: typeToSeverity(trace.type) || 'info',
              range: extractRange(trace)
            };
          })
        };
      }));
    }
  }]);

  return Linter;
})();

exports['default'] = Linter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvbGludGVyLWludGVncmF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVOLE1BQU07QUFDQyxXQURQLE1BQU0sQ0FDRSxRQUFRLEVBQUU7MEJBRGxCLE1BQU07O0FBRVIsUUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7R0FDcEQ7O2VBSEcsTUFBTTs7V0FJSCxtQkFBRztBQUNSLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7OztXQUNJLGlCQUFHO0FBQ04sVUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUM5Qjs7O1dBQ2MseUJBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtBQUM3QixlQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDMUIsZUFBTyxDQUNMLENBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFFLEVBQzdDLENBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBRSxDQUMvRSxDQUFDO09BQ0g7QUFDRCxlQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUU7QUFDeEIsZUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztPQUN6RTtBQUNELGVBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixnQkFBUSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQyxlQUFLLEtBQUssQ0FBQztBQUNYLGVBQUssT0FBTztBQUFFLG1CQUFPLE9BQU8sQ0FBQztBQUFBLEFBQzdCLGVBQUssTUFBTSxDQUFDO0FBQ1osZUFBSyxTQUFTO0FBQUUsbUJBQU8sU0FBUyxDQUFDO0FBQUEsQUFDakM7QUFBUyxtQkFBTyxJQUFJLENBQUM7QUFBQSxTQUN0QjtPQUNGO0FBQ0QsVUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSztBQUM3QyxjQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxPQUFPO0FBQzNCLGNBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxPQUFPO0FBQ2hGLGNBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUMsWUFBWTtBQUNwRCxrQkFBUSxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ25DLGtCQUFRLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDcEMsZUFBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFDMUIsZUFBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO21CQUFLO0FBQzlDLGtCQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxPQUFPO0FBQzNCLGtCQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTztBQUM5RSxrQkFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZO0FBQ3BELHNCQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNqRCxzQkFBUSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTTtBQUM5QyxtQkFBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUM7YUFDM0I7V0FBQyxDQUFDO1NBQ0o7T0FBQyxDQUFDLENBQUMsQ0FBQztLQUNOOzs7U0E3Q0csTUFBTTs7O3FCQWdERyxNQUFNIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvbGludGVyLWludGVncmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNsYXNzIExpbnRlciB7XG4gIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5saW50ZXIgPSByZWdpc3RyeS5yZWdpc3Rlcih7IG5hbWU6ICdCdWlsZCcgfSk7XG4gIH1cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmxpbnRlci5kaXNwb3NlKCk7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5saW50ZXIuZGVsZXRlTWVzc2FnZXMoKTtcbiAgfVxuICBwcm9jZXNzTWVzc2FnZXMobWVzc2FnZXMsIGN3ZCkge1xuICAgIGZ1bmN0aW9uIGV4dHJhY3RSYW5nZShqc29uKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBbIChqc29uLmxpbmUgfHwgMSkgLSAxLCAoanNvbi5jb2wgfHwgMSkgLSAxIF0sXG4gICAgICAgIFsgKGpzb24ubGluZV9lbmQgfHwganNvbi5saW5lIHx8IDEpIC0gMSwgKGpzb24uY29sX2VuZCB8fCBqc29uLmNvbCB8fCAxKSAtIDEgXVxuICAgICAgXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZSgncGF0aCcpLmlzQWJzb2x1dGUocCkgPyBwIDogcmVxdWlyZSgncGF0aCcpLmpvaW4oY3dkLCBwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHlwZVRvU2V2ZXJpdHkodHlwZSkge1xuICAgICAgc3dpdGNoICh0eXBlICYmIHR5cGUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdlcnInOlxuICAgICAgICBjYXNlICdlcnJvcic6IHJldHVybiAnZXJyb3InO1xuICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgY2FzZSAnd2FybmluZyc6IHJldHVybiAnd2FybmluZyc7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxpbnRlci5zZXRNZXNzYWdlcyhtZXNzYWdlcy5tYXAobWF0Y2ggPT4gKHtcbiAgICAgIHR5cGU6IG1hdGNoLnR5cGUgfHwgJ0Vycm9yJyxcbiAgICAgIHRleHQ6ICFtYXRjaC5tZXNzYWdlICYmICFtYXRjaC5odG1sX21lc3NhZ2UgPyAnRXJyb3IgZnJvbSBidWlsZCcgOiBtYXRjaC5tZXNzYWdlLFxuICAgICAgaHRtbDogbWF0Y2gubWVzc2FnZSA/IHVuZGVmaW5lZCA6IG1hdGNoLmh0bWxfbWVzc2FnZSxcbiAgICAgIGZpbGVQYXRoOiBub3JtYWxpemVQYXRoKG1hdGNoLmZpbGUpLFxuICAgICAgc2V2ZXJpdHk6IHR5cGVUb1NldmVyaXR5KG1hdGNoLnR5cGUpLFxuICAgICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShtYXRjaCksXG4gICAgICB0cmFjZTogbWF0Y2gudHJhY2UgJiYgbWF0Y2gudHJhY2UubWFwKHRyYWNlID0+ICh7XG4gICAgICAgIHR5cGU6IHRyYWNlLnR5cGUgfHwgJ1RyYWNlJyxcbiAgICAgICAgdGV4dDogIXRyYWNlLm1lc3NhZ2UgJiYgIXRyYWNlLmh0bWxfbWVzc2FnZSA/ICdUcmFjZSBpbiBidWlsZCcgOiB0cmFjZS5tZXNzYWdlLFxuICAgICAgICBodG1sOiB0cmFjZS5tZXNzYWdlID8gdW5kZWZpbmVkIDogdHJhY2UuaHRtbF9tZXNzYWdlLFxuICAgICAgICBmaWxlUGF0aDogdHJhY2UuZmlsZSAmJiBub3JtYWxpemVQYXRoKHRyYWNlLmZpbGUpLFxuICAgICAgICBzZXZlcml0eTogdHlwZVRvU2V2ZXJpdHkodHJhY2UudHlwZSkgfHwgJ2luZm8nLFxuICAgICAgICByYW5nZTogZXh0cmFjdFJhbmdlKHRyYWNlKVxuICAgICAgfSkpXG4gICAgfSkpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaW50ZXI7XG4iXX0=