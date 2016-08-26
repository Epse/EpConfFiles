Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var config = {
  cargoPath: {
    title: 'Path to the Cargo executable',
    type: 'string',
    'default': 'cargo',
    order: 1
  },
  verbose: {
    title: 'Verbose Cargo output',
    description: 'Pass the --verbose flag to cargo',
    type: 'boolean',
    'default': false,
    order: 2
  },
  openDocs: {
    title: 'Open documentation in browser after \'doc\' target is built',
    type: 'boolean',
    'default': false,
    order: 3
  },
  showBacktrace: {
    title: 'Show backtrace information in tests',
    description: 'Set environment variable RUST_BACKTRACE=1',
    type: 'boolean',
    'default': false,
    order: 4
  },
  cargoCheck: {
    title: 'Enable `cargo check',
    description: 'Enable the `cargo check` Cargo command. Only use this if you have `cargo check` installed.',
    type: 'boolean',
    'default': false,
    order: 5
  },
  cargoClippy: {
    title: 'Enable `cargo clippy',
    description: 'Enable the `cargo clippy` Cargo command to run Clippy\'s lints. \
                  Only use this if you have the `cargo clippy` package installed.',
    type: 'boolean',
    'default': false,
    order: 6
  },
  jsonErrors: {
    title: 'Use json errors',
    description: 'Instead of using regex to parse the human readable output (requires rustc version 1.7)',
    type: 'boolean',
    'default': false,
    order: 7
  }
};

exports.config = config;

function provideBuilder() {
  return (function () {
    function CargoBuildProvider(cwd) {
      _classCallCheck(this, CargoBuildProvider);

      this.cwd = cwd;
    }

    _createClass(CargoBuildProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return 'Cargo';
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        return _fs2['default'].existsSync(this.cwd + '/Cargo.toml');
      }
    }, {
      key: 'settings',
      value: function settings() {
        var cargoPath = atom.config.get('build-cargo.cargoPath');
        var args = [];
        atom.config.get('build-cargo.verbose') && args.push('--verbose');

        var docArgs = ['doc'];
        atom.config.get('build-cargo.openDocs') && docArgs.push('--open');

        var env = {};
        if (atom.config.get('build-cargo.jsonErrors')) {
          env["RUSTFLAGS"] = "-Z unstable-options --error-format=json";
        }
        if (atom.config.get('build-cargo.showBacktrace')) {
          env['RUST_BACKTRACE'] = '1';
        }

        var matchRelaxed = '(?<file>.+.rs):(?<line>\\d+):(?<col>\\d+):(?: (?<line_end>\\d+):(?<col_end>\\d+) )?(error):';
        var matchStrictRegex = '(?<file>.+.rs):(?<line>\\d+):(?<col>\\d+):(?: (?<line_end>\\d+):(?<col_end>\\d+) )?';
        var matchStrictFunction = function matchStrictFunction(output) {
          var array = [];
          output.split(/\n/).forEach((function (line) {
            if (line[0] != '{') {
              return;
            }
            var json = JSON.parse(line);
            json.spans.forEach((function (span) {
              json.file = span.file_name;
              json.line = span.line_start;
              json.line_end = span.line_end;
              json.col = span.column_start;
              json.col_end = span.column_end;
              this.push(json);
            }).bind(this));
          }).bind(array));
          return array;
        };
        var matchStrict = atom.config.get('build-cargo.jsonErrors') ? matchStrictFunction : matchStrictRegex;
        var matchThreadPanic = 'thread \'[^\\\']+\' panicked at \'[^\\\']+\', (?<file>[^\\/][^\\:]+):(?<line>\\d+)';
        var matchBacktrace = 'at (?<file>[^.\/][^\\/][^\\:]+):(?<line>\\d+)';

        var commands = [{
          name: 'Cargo: build (debug)',
          exec: cargoPath,
          env: env,
          args: ['build'].concat(args),
          sh: false,
          errorMatch: [matchRelaxed, matchThreadPanic]
        }, {
          name: 'Cargo: build (release)',
          exec: cargoPath,
          env: env,
          args: ['build', '--release'].concat(args),
          sh: false,
          errorMatch: [matchStrict, matchThreadPanic]
        }, {
          name: 'Cargo: bench',
          exec: cargoPath,
          env: env,
          args: ['bench'].concat(args),
          sh: false,
          errorMatch: [matchRelaxed, matchThreadPanic]
        }, {
          name: 'Cargo: clean',
          exec: cargoPath,
          env: env,
          args: ['clean'].concat(args),
          sh: false,
          errorMatch: []
        }, {
          name: 'Cargo: doc',
          exec: cargoPath,
          env: env,
          args: docArgs.concat(args),
          sh: false,
          errorMatch: []
        }, {
          name: 'Cargo: run',
          exec: cargoPath,
          env: env,
          args: ['run'].concat(args),
          sh: false,
          errorMatch: [matchStrict, matchThreadPanic, matchBacktrace]
        }, {
          name: 'Cargo: test',
          exec: cargoPath,
          env: env,
          args: ['test'].concat(args),
          sh: false,
          errorMatch: [matchStrict, matchThreadPanic, matchBacktrace]
        }, {
          name: 'Cargo: update',
          exec: cargoPath,
          env: env,
          args: ['update'].concat(args),
          sh: false,
          errorMatch: []
        }, {
          name: 'Cargo: build example',
          exec: cargoPath,
          env: env,
          args: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}'].concat(args),
          sh: false,
          errorMatch: [matchRelaxed, matchThreadPanic]
        }, {
          name: 'Cargo: run example',
          exec: cargoPath,
          env: env,
          args: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}'].concat(args),
          sh: false,
          errorMatch: [matchStrict, matchThreadPanic, matchBacktrace]
        }, {
          name: 'Cargo: run bin',
          exec: cargoPath,
          env: env,
          args: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}'].concat(args),
          sh: false,
          errorMatch: [matchStrict, matchThreadPanic, matchBacktrace]
        }];

        if (atom.config.get('build-cargo.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            exec: cargoPath,
            env: env,
            args: ['clippy'].concat(args),
            sh: false,
            errorMatch: [matchRelaxed, matchThreadPanic]
          });
        }

        if (atom.config.get('build-cargo.cargoCheck')) {
          commands.push({
            name: 'Cargo: check',
            exec: cargoPath,
            env: env,
            args: ['check'].concat(args),
            sh: false,
            errorMatch: [matchRelaxed, matchThreadPanic]
          });
        }

        return commands;
      }
    }]);

    return CargoBuildProvider;
  })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7O0FBRm5CLFdBQVcsQ0FBQzs7QUFJTCxJQUFNLE1BQU0sR0FBRztBQUNwQixXQUFTLEVBQUU7QUFDVCxTQUFLLEVBQUUsOEJBQThCO0FBQ3JDLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxPQUFPO0FBQ2hCLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxTQUFPLEVBQUU7QUFDUCxTQUFLLEVBQUUsc0JBQXNCO0FBQzdCLGVBQVcsRUFBRSxrQ0FBa0M7QUFDL0MsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsVUFBUSxFQUFFO0FBQ1IsU0FBSyxFQUFFLDZEQUE2RDtBQUNwRSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxlQUFhLEVBQUU7QUFDYixTQUFLLEVBQUUscUNBQXFDO0FBQzVDLGVBQVcsRUFBRSwyQ0FBMkM7QUFDeEQsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsWUFBVSxFQUFFO0FBQ1YsU0FBSyxFQUFFLHFCQUFxQjtBQUM1QixlQUFXLEVBQUUsNEZBQTRGO0FBQ3pHLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGFBQVcsRUFBRTtBQUNYLFNBQUssRUFBRSxzQkFBc0I7QUFDN0IsZUFBVyxFQUFFO2tGQUNpRTtBQUM5RSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxZQUFVLEVBQUU7QUFDVixTQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGVBQVcsRUFBRSx3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QztBQUM1QixjQUFFLEVBQUUsS0FBSztBQUNULHNCQUFVLEVBQUUsQ0FBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUU7V0FDL0MsQ0FBQyxDQUFBO1NBQ0g7O0FBRUQsZUFBTyxRQUFRLENBQUM7T0FDakI7OztXQXZLVSxrQkFBa0I7T0F3SzdCO0NBQ0giLCJmaWxlIjoiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgY2FyZ29QYXRoOiB7XG4gICAgdGl0bGU6ICdQYXRoIHRvIHRoZSBDYXJnbyBleGVjdXRhYmxlJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnY2FyZ28nLFxuICAgIG9yZGVyOiAxXG4gIH0sXG4gIHZlcmJvc2U6IHtcbiAgICB0aXRsZTogJ1ZlcmJvc2UgQ2FyZ28gb3V0cHV0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1Bhc3MgdGhlIC0tdmVyYm9zZSBmbGFnIHRvIGNhcmdvJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDJcbiAgfSxcbiAgb3BlbkRvY3M6IHtcbiAgICB0aXRsZTogJ09wZW4gZG9jdW1lbnRhdGlvbiBpbiBicm93c2VyIGFmdGVyIFxcJ2RvY1xcJyB0YXJnZXQgaXMgYnVpbHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogM1xuICB9LFxuICBzaG93QmFja3RyYWNlOiB7XG4gICAgdGl0bGU6ICdTaG93IGJhY2t0cmFjZSBpbmZvcm1hdGlvbiBpbiB0ZXN0cycsXG4gICAgZGVzY3JpcHRpb246ICdTZXQgZW52aXJvbm1lbnQgdmFyaWFibGUgUlVTVF9CQUNLVFJBQ0U9MScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA0XG4gIH0sXG4gIGNhcmdvQ2hlY2s6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBgY2FyZ28gY2hlY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHRoZSBgY2FyZ28gY2hlY2tgIENhcmdvIGNvbW1hbmQuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgYGNhcmdvIGNoZWNrYCBpbnN0YWxsZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgY2FyZ29DbGlwcHk6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBgY2FyZ28gY2xpcHB5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNsaXBweWAgQ2FyZ28gY29tbWFuZCB0byBydW4gQ2xpcHB5XFwncyBsaW50cy4gXFxcbiAgICAgICAgICAgICAgICAgIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgdGhlIGBjYXJnbyBjbGlwcHlgIHBhY2thZ2UgaW5zdGFsbGVkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2XG4gIH0sXG4gIGpzb25FcnJvcnM6IHtcbiAgICB0aXRsZTogJ1VzZSBqc29uIGVycm9ycycsXG4gICAgZGVzY3JpcHRpb246ICdJbnN0ZWFkIG9mIHVzaW5nIHJlZ2V4IHRvIHBhcnNlIHRoZSBodW1hbiByZWFkYWJsZSBvdXRwdXQgKHJlcXVpcmVzIHJ1c3RjIHZlcnNpb24gMS43KScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA3XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGNsYXNzIENhcmdvQnVpbGRQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB9XG5cbiAgICBnZXROaWNlTmFtZSgpIHtcbiAgICAgIHJldHVybiAnQ2FyZ28nO1xuICAgIH1cblxuICAgIGlzRWxpZ2libGUoKSB7XG4gICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhgJHt0aGlzLmN3ZH0vQ2FyZ28udG9tbGApO1xuICAgIH1cblxuICAgIHNldHRpbmdzKCkge1xuICAgICAgY29uc3QgY2FyZ29QYXRoID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICAgIGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28udmVyYm9zZScpICYmIGFyZ3MucHVzaCgnLS12ZXJib3NlJyk7XG5cbiAgICAgIGNvbnN0IGRvY0FyZ3MgPSBbICdkb2MnIF07XG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLm9wZW5Eb2NzJykgJiYgZG9jQXJncy5wdXNoKCctLW9wZW4nKTtcblxuICAgICAgY29uc3QgZW52ID0ge307XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JzJykpIHtcbiAgICAgICAgICBlbnZbXCJSVVNURkxBR1NcIl0gPSBcIi1aIHVuc3RhYmxlLW9wdGlvbnMgLS1lcnJvci1mb3JtYXQ9anNvblwiO1xuICAgICAgfVxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpKSB7XG4gICAgICAgIGVudlsnUlVTVF9CQUNLVFJBQ0UnXSA9ICcxJ1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRjaFJlbGF4ZWQgPSAnKD88ZmlsZT4uKy5ycyk6KD88bGluZT5cXFxcZCspOig/PGNvbD5cXFxcZCspOig/OiAoPzxsaW5lX2VuZD5cXFxcZCspOig/PGNvbF9lbmQ+XFxcXGQrKSApPyhlcnJvcik6JztcbiAgICAgIGNvbnN0IG1hdGNoU3RyaWN0UmVnZXggPSAnKD88ZmlsZT4uKy5ycyk6KD88bGluZT5cXFxcZCspOig/PGNvbD5cXFxcZCspOig/OiAoPzxsaW5lX2VuZD5cXFxcZCspOig/PGNvbF9lbmQ+XFxcXGQrKSApPyc7XG4gICAgICBjb25zdCBtYXRjaFN0cmljdEZ1bmN0aW9uID0gZnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgb3V0cHV0LnNwbGl0KC9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgaWYgKGxpbmVbMF0gIT0gJ3snKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobGluZSk7XG4gICAgICAgICAgICAgIGpzb24uc3BhbnMuZm9yRWFjaChmdW5jdGlvbihzcGFuKSB7XG4gICAgICAgICAgICAgICAgICBqc29uLmZpbGUgPSBzcGFuLmZpbGVfbmFtZTtcbiAgICAgICAgICAgICAgICAgIGpzb24ubGluZSA9IHNwYW4ubGluZV9zdGFydDtcbiAgICAgICAgICAgICAgICAgIGpzb24ubGluZV9lbmQgPSBzcGFuLmxpbmVfZW5kO1xuICAgICAgICAgICAgICAgICAganNvbi5jb2wgPSBzcGFuLmNvbHVtbl9zdGFydDtcbiAgICAgICAgICAgICAgICAgIGpzb24uY29sX2VuZCA9IHNwYW4uY29sdW1uX2VuZDtcbiAgICAgICAgICAgICAgICAgIHRoaXMucHVzaChqc29uKTtcbiAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQoYXJyYXkpKTtcbiAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICB9O1xuICAgICAgY29uc3QgbWF0Y2hTdHJpY3QgPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvcnMnKSA/IG1hdGNoU3RyaWN0RnVuY3Rpb24gOiBtYXRjaFN0cmljdFJlZ2V4O1xuICAgICAgY29uc3QgbWF0Y2hUaHJlYWRQYW5pYyA9ICd0aHJlYWQgXFwnW15cXFxcXFwnXStcXCcgcGFuaWNrZWQgYXQgXFwnW15cXFxcXFwnXStcXCcsICg/PGZpbGU+W15cXFxcL11bXlxcXFw6XSspOig/PGxpbmU+XFxcXGQrKSc7XG4gICAgICBjb25zdCBtYXRjaEJhY2t0cmFjZSA9ICdhdCAoPzxmaWxlPlteLlxcL11bXlxcXFwvXVteXFxcXDpdKyk6KD88bGluZT5cXFxcZCspJztcblxuICAgICAgdmFyIGNvbW1hbmRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBidWlsZCAoZGVidWcpJyxcbiAgICAgICAgICBleGVjOiBjYXJnb1BhdGgsXG4gICAgICAgICAgZW52OiBlbnYsXG4gICAgICAgICAgYXJnczogWyAnYnVpbGQnIF0uY29uY2F0KGFyZ3MpLFxuICAgICAgICAgIHNoOiBmYWxzZSxcbiAgICAgICAgICBlcnJvck1hdGNoOiBbIG1hdGNoUmVsYXhlZCwgbWF0Y2hUaHJlYWRQYW5pYyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIChyZWxlYXNlKScsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ2J1aWxkJywgJy0tcmVsZWFzZScgXS5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFsgbWF0Y2hTdHJpY3QsIG1hdGNoVGhyZWFkUGFuaWMgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBiZW5jaCcsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ2JlbmNoJyBdLmNvbmNhdChhcmdzKSxcbiAgICAgICAgICBzaDogZmFsc2UsXG4gICAgICAgICAgZXJyb3JNYXRjaDogWyBtYXRjaFJlbGF4ZWQsIG1hdGNoVGhyZWFkUGFuaWMgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjbGVhbicsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ2NsZWFuJyBdLmNvbmNhdChhcmdzKSxcbiAgICAgICAgICBzaDogZmFsc2UsXG4gICAgICAgICAgZXJyb3JNYXRjaDogW11cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogZG9jJyxcbiAgICAgICAgICBleGVjOiBjYXJnb1BhdGgsXG4gICAgICAgICAgZW52OiBlbnYsXG4gICAgICAgICAgYXJnczogZG9jQXJncy5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1bicsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ3J1bicgXS5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFsgbWF0Y2hTdHJpY3QsIG1hdGNoVGhyZWFkUGFuaWMsIG1hdGNoQmFja3RyYWNlIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogdGVzdCcsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ3Rlc3QnIF0uY29uY2F0KGFyZ3MpLFxuICAgICAgICAgIHNoOiBmYWxzZSxcbiAgICAgICAgICBlcnJvck1hdGNoOiBbIG1hdGNoU3RyaWN0LCBtYXRjaFRocmVhZFBhbmljLCBtYXRjaEJhY2t0cmFjZSBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHVwZGF0ZScsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ3VwZGF0ZScgXS5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBgQ2FyZ286IGJ1aWxkIGV4YW1wbGVgLFxuICAgICAgICAgIGV4ZWM6IGNhcmdvUGF0aCxcbiAgICAgICAgICBlbnY6IGVudixcbiAgICAgICAgICBhcmdzOiBbICdidWlsZCcsICctLWV4YW1wbGUnLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF0uY29uY2F0KGFyZ3MpLFxuICAgICAgICAgIHNoOiBmYWxzZSxcbiAgICAgICAgICBlcnJvck1hdGNoOiBbIG1hdGNoUmVsYXhlZCwgbWF0Y2hUaHJlYWRQYW5pYyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBgQ2FyZ286IHJ1biBleGFtcGxlYCxcbiAgICAgICAgICBleGVjOiBjYXJnb1BhdGgsXG4gICAgICAgICAgZW52OiBlbnYsXG4gICAgICAgICAgYXJnczogWyAncnVuJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXS5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFsgbWF0Y2hTdHJpY3QsIG1hdGNoVGhyZWFkUGFuaWMsIG1hdGNoQmFja3RyYWNlIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IGBDYXJnbzogcnVuIGJpbmAsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsgJ3J1bicsICctLWJpbicsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXS5jb25jYXQoYXJncyksXG4gICAgICAgICAgc2g6IGZhbHNlLFxuICAgICAgICAgIGVycm9yTWF0Y2g6IFsgbWF0Y2hTdHJpY3QsIG1hdGNoVGhyZWFkUGFuaWMsIG1hdGNoQmFja3RyYWNlIF1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DbGlwcHknKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBgQ2FyZ286IENsaXBweWAsXG4gICAgICAgICAgZXhlYzogY2FyZ29QYXRoLFxuICAgICAgICAgIGVudjogZW52LFxuICAgICAgICAgIGFyZ3M6IFsnY2xpcHB5J10uY29uY2F0KGFyZ3MpLFxuICAgICAgICAgIHNoOiBmYWxzZSxcbiAgICAgICAgICBlcnJvck1hdGNoOiBbIG1hdGNoUmVsYXhlZCwgbWF0Y2hUaHJlYWRQYW5pYyBdXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2hlY2snKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBgQ2FyZ286IGNoZWNrYCxcbiAgICAgICAgICBleGVjOiBjYXJnb1BhdGgsXG4gICAgICAgICAgZW52OiBlbnYsXG4gICAgICAgICAgYXJnczogWydjaGVjayddLmNvbmNhdChhcmdzKSxcbiAgICAgICAgICBzaDogZmFsc2UsXG4gICAgICAgICAgZXJyb3JNYXRjaDogWyBtYXRjaFJlbGF4ZWQsIG1hdGNoVGhyZWFkUGFuaWMgXVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/home/epse/.atom/packages/build-cargo/lib/cargo.js
