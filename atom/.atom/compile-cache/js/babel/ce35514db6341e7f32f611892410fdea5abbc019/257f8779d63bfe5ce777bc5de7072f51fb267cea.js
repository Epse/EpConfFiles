Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

// Transfer existing settings from previous versions of the package
'use babel';

if (atom.config.get('build-cargo.showBacktrace')) {
  atom.config.set('build-cargo.backtraceType', 'Compact');
}
if (atom.config.get('build-cargo.cargoCheck')) {
  atom.config.set('build-cargo.extCommands.cargoCheck', true);
}
if (atom.config.get('build-cargo.cargoClippy')) {
  atom.config.set('build-cargo.extCommands.cargoClippy', true);
}
// Remove old settings
atom.config.unset('build-cargo.showBacktrace');
atom.config.unset('build-cargo.cargoCheck');
atom.config.unset('build-cargo.cargoClippy');
atom.config.unset('build-cargo.jsonErrors');

var config = {
  cargoPath: {
    title: 'Path to the Cargo executable',
    type: 'string',
    'default': 'cargo',
    order: 1
  },
  multiCrateProjects: {
    title: 'Enable multi-crate projects support',
    description: 'Build internal crates separately based on the current open file.',
    type: 'boolean',
    'default': false,
    order: 2
  },
  verbose: {
    title: 'Verbose Cargo output',
    description: 'Pass the --verbose flag to Cargo.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  backtraceType: {
    title: 'Backtrace',
    description: 'Stack backtrace verbosity level. Uses the environment variable RUST_BACKTRACE=1 if not `Off`.',
    type: 'string',
    'default': 'Off',
    'enum': ['Off', 'Compact', 'Full'],
    order: 4
  },
  jsonErrorFormat: {
    title: 'Use JSON error format',
    description: 'Use JSON error format instead of human readable output.',
    type: 'boolean',
    'default': true,
    order: 5
  },
  openDocs: {
    title: 'Open documentation in browser after \'doc\' target is built',
    type: 'boolean',
    'default': false,
    order: 6
  },
  extCommands: {
    title: 'Extended Commands',
    type: 'object',
    order: 7,
    properties: {
      cargoCheck: {
        title: 'Enable cargo check',
        description: 'Enable the `cargo check` Cargo command. Only use this if you have `cargo check` installed.',
        type: 'boolean',
        'default': false,
        order: 1
      },
      cargoClippy: {
        title: 'Enable cargo clippy',
        description: 'Enable the `cargo clippy` Cargo command to run Clippy\'s lints. Only use this if you have the `cargo clippy` package installed.',
        type: 'boolean',
        'default': false,
        order: 2
      }
    }
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
        var path = require('path');
        var err = require('./errors');
        var stdParser = require('./std-parser');
        var jsonParser = require('./json-parser');
        var panicParser = require('./panic-parser');

        var buildWorkDir = undefined; // The last build workding directory (might differ from the project root for multi-crate projects)
        var panicsLimit = 10; // Max number of panics to show at once

        // Split output and remove ANSI escape codes if needed
        function extractLines(output, removeEscape) {
          var lines = output.split(/\n/);
          if (removeEscape) {
            for (var i = 0; i < lines.length; i++) {
              lines[i] = lines[i].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            }
          }
          return lines;
        }

        function matchFunction(output) {
          var useJson = atom.config.get('build-cargo.jsonErrorFormat');
          var messages = []; // resulting collection of high-level messages
          var panicsN = 0; // quantity of panics in this output
          var lines = extractLines(output, !useJson);
          for (var i = 0; i < lines.length; i++) {
            var parsedQty = 0;

            // Try parse a JSON message
            if (useJson && lines[i].startsWith('{')) {
              jsonParser.parseMessage(lines[i], messages);
              parsedQty = 1;
            }

            // Try parse a standard output message
            if (parsedQty === 0 && !useJson) {
              parsedQty = stdParser.tryParseMessage(lines, i, messages);
            }

            // Try parse a panic
            if (parsedQty === 0) {
              parsedQty = panicParser.tryParsePanic(lines, i, panicsN < panicsLimit, buildWorkDir);
              if (parsedQty > 0) {
                panicsN += 1;
              }
            }

            if (parsedQty > 1) {
              i += parsedQty - 1; // Subtract one because the current line is already counted
            }
          }
          var hiddenPanicsN = panicsN - panicsLimit;
          if (hiddenPanicsN === 1) {
            atom.notifications.addError('One more panic is hidden', { dismissable: true });
          } else if (hiddenPanicsN > 1) {
            atom.notifications.addError(hiddenPanicsN + ' more panics are hidden', { dismissable: true });
          }
          return messages.filter(function (m) {
            return err.preprocessMessage(m, buildWorkDir);
          });
        }

        // Checks if the given object represents the root of the project or file system
        function isRoot(parts) {
          if (parts.dir === parts.root) {
            return true; // The file system root
          }
          return atom.project.getPaths().some(function (p) {
            return parts.dir === p;
          });
        }

        // Returns the closest directory with Cargo.toml in it.
        // If there's no such directory, returns undefined.
        function findCargoProjectDir(_x) {
          var _again = true;

          _function: while (_again) {
            var p = _x;
            _again = false;

            var parts = path.parse(p);
            var root = isRoot(parts);
            var cargoToml = path.format({
              dir: parts.dir,
              base: 'Cargo.toml'
            });
            try {
              if (_fs2['default'].statSync(cargoToml).isFile()) {
                return {
                  dir: parts.dir,
                  root: root
                };
              }
            } catch (e) {
              if (e.code !== 'ENOENT') {
                // No such file (Cargo.toml)
                throw e;
              }
            }
            if (root) {
              return undefined;
            }
            _x = parts.dir;
            _again = true;
            parts = root = cargoToml = undefined;
            continue _function;
          }
        }

        // This function is called before every build. It finds the closest
        // Cargo.toml file in the path and uses its directory as working.
        function prepareBuild(buildCfg) {
          // Common build command parameters
          buildCfg.exec = atom.config.get('build-cargo.cargoPath');
          buildCfg.env = {};
          if (atom.config.get('build-cargo.jsonErrorFormat')) {
            buildCfg.env.RUSTFLAGS = '-Z unstable-options --error-format=json';
          } else if (process.platform !== 'win32') {
            buildCfg.env.TERM = 'xterm';
            buildCfg.env.RUSTFLAGS = '--color=always';
          }
          if (atom.config.get('build-cargo.backtraceType') !== 'Off') {
            buildCfg.env.RUST_BACKTRACE = '1';
          }
          buildCfg.args = buildCfg.args || [];
          atom.config.get('build-cargo.verbose') && buildCfg.args.push('--verbose');

          // Substitute working directory if we are in a multi-crate environment
          if (atom.config.get('build-cargo.multiCrateProjects')) {
            var editor = atom.workspace.getActiveTextEditor();
            buildCfg.cwd = undefined;
            if (editor && editor.getPath()) {
              var wdInfo = findCargoProjectDir(editor.getPath());
              if (wdInfo) {
                if (!wdInfo.root) {
                  var p = path.parse(wdInfo.dir);
                  atom.notifications.addInfo('Building ' + p.base + '...');
                }
                buildCfg.cwd = wdInfo.dir;
              }
            }
          }
          if (!buildCfg.cwd && atom.project.getPaths().length > 0) {
            // Build in the root of the first path by default
            buildCfg.cwd = atom.project.getPaths()[0];
          }
          buildWorkDir = buildCfg.cwd;
        }

        var commands = [{
          name: 'Cargo: build (debug)',
          atomCommandName: 'cargo:build-debug',
          argsCfg: ['build']
        }, {
          name: 'Cargo: build (release)',
          atomCommandName: 'cargo:build-release',
          argsCfg: ['build', '--release']
        }, {
          name: 'Cargo: bench',
          atomCommandName: 'cargo:bench',
          argsCfg: ['bench']
        }, {
          name: 'Cargo: clean',
          atomCommandName: 'cargo:clean',
          argsCfg: ['clean']
        }, {
          name: 'Cargo: doc',
          atomCommandName: 'cargo:doc',
          argsCfg: ['doc'],
          preConfig: function preConfig() {
            atom.config.get('build-cargo.openDocs') && this.args.push('--open');
          }
        }, {
          name: 'Cargo: run (debug)',
          atomCommandName: 'cargo:run-debug',
          argsCfg: ['run']
        }, {
          name: 'Cargo: run (release)',
          atomCommandName: 'cargo:run-release',
          argsCfg: ['run', '--release']
        }, {
          name: 'Cargo: test',
          atomCommandName: 'cargo:run-test',
          argsCfg: ['test']
        }, {
          name: 'Cargo: update',
          atomCommandName: 'cargo:update',
          argsCfg: ['update']
        }, {
          name: 'Cargo: build example',
          atomCommandName: 'cargo:build-example',
          argsCfg: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run example',
          atomCommandName: 'cargo:run-example',
          argsCfg: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run bin',
          atomCommandName: 'cargo:run-bin',
          argsCfg: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}']
        }];

        if (atom.config.get('build-cargo.extCommands.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            atomCommandName: 'cargo:clippy',
            argsCfg: ['clippy']
          });
        }

        if (atom.config.get('build-cargo.extCommands.cargoCheck')) {
          commands.push({
            name: 'Cargo: check',
            atomCommandName: 'cargo:check',
            argsCfg: ['check']
          });
        }

        commands.forEach(function (cmd) {
          cmd.exec = atom.config.get('build-cargo.cargoPath');
          cmd.sh = false;
          cmd.functionMatch = matchFunction;
          cmd.preBuild = function () {
            this.args = this.argsCfg.slice(0); // Clone initial arguments
            if (this.preConfig) {
              this.preConfig(); // Allow the command to configure its arguments
            }
            prepareBuild(this);
          };
        });

        return commands;
      }
    }]);

    return CargoBuildProvider;
  })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7O0FBRm5CLFdBQVcsQ0FBQzs7QUFLWixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLEVBQUU7QUFDaEQsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDekQ7QUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7QUFDN0MsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0Q7QUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7QUFDOUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7O0FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7QUFFckMsSUFBTSxNQUFNLEdBQUc7QUFDcEIsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLDhCQUE4QjtBQUNyQyxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsT0FBTztBQUNoQixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0Qsb0JBQWtCLEVBQUU7QUFDbEIsU0FB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TUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELGFBQUcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ2YsYUFBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDbEMsYUFBRyxDQUFDLFFBQVEsR0FBRyxZQUFZO0FBQ3pCLGdCQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsa0JBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUNsQjtBQUNELHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDcEIsQ0FBQztTQUNILENBQUMsQ0FBQzs7QUFFSCxlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O1dBelBVLGtCQUFrQjtPQTBQN0I7Q0FDSCIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbi8vIFRyYW5zZmVyIGV4aXN0aW5nIHNldHRpbmdzIGZyb20gcHJldmlvdXMgdmVyc2lvbnMgb2YgdGhlIHBhY2thZ2VcbmlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnNob3dCYWNrdHJhY2UnKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnLCAnQ29tcGFjdCcpO1xufVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DaGVjaycsIHRydWUpO1xufVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DbGlwcHknKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JywgdHJ1ZSk7XG59XG4vLyBSZW1vdmUgb2xkIHNldHRpbmdzXG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2hlY2snKTtcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvcnMnKTtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgY2FyZ29QYXRoOiB7XG4gICAgdGl0bGU6ICdQYXRoIHRvIHRoZSBDYXJnbyBleGVjdXRhYmxlJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnY2FyZ28nLFxuICAgIG9yZGVyOiAxXG4gIH0sXG4gIG11bHRpQ3JhdGVQcm9qZWN0czoge1xuICAgIHRpdGxlOiAnRW5hYmxlIG11bHRpLWNyYXRlIHByb2plY3RzIHN1cHBvcnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQnVpbGQgaW50ZXJuYWwgY3JhdGVzIHNlcGFyYXRlbHkgYmFzZWQgb24gdGhlIGN1cnJlbnQgb3BlbiBmaWxlLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyXG4gIH0sXG4gIHZlcmJvc2U6IHtcbiAgICB0aXRsZTogJ1ZlcmJvc2UgQ2FyZ28gb3V0cHV0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1Bhc3MgdGhlIC0tdmVyYm9zZSBmbGFnIHRvIENhcmdvLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAzXG4gIH0sXG4gIGJhY2t0cmFjZVR5cGU6IHtcbiAgICB0aXRsZTogJ0JhY2t0cmFjZScsXG4gICAgZGVzY3JpcHRpb246ICdTdGFjayBiYWNrdHJhY2UgdmVyYm9zaXR5IGxldmVsLiBVc2VzIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBSVVNUX0JBQ0tUUkFDRT0xIGlmIG5vdCBgT2ZmYC4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdPZmYnLFxuICAgIGVudW06IFsgJ09mZicsICdDb21wYWN0JywgJ0Z1bGwnIF0sXG4gICAgb3JkZXI6IDRcbiAgfSxcbiAganNvbkVycm9yRm9ybWF0OiB7XG4gICAgdGl0bGU6ICdVc2UgSlNPTiBlcnJvciBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnVXNlIEpTT04gZXJyb3IgZm9ybWF0IGluc3RlYWQgb2YgaHVtYW4gcmVhZGFibGUgb3V0cHV0LicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgb3BlbkRvY3M6IHtcbiAgICB0aXRsZTogJ09wZW4gZG9jdW1lbnRhdGlvbiBpbiBicm93c2VyIGFmdGVyIFxcJ2RvY1xcJyB0YXJnZXQgaXMgYnVpbHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNlxuICB9LFxuICBleHRDb21tYW5kczoge1xuICAgIHRpdGxlOiAnRXh0ZW5kZWQgQ29tbWFuZHMnLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiA3LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGNhcmdvQ2hlY2s6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2hlY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNoZWNrYCBDYXJnbyBjb21tYW5kLiBPbmx5IHVzZSB0aGlzIGlmIHlvdSBoYXZlIGBjYXJnbyBjaGVja2AgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxXG4gICAgICB9LFxuICAgICAgY2FyZ29DbGlwcHk6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2xpcHB5JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGhlIGBjYXJnbyBjbGlwcHlgIENhcmdvIGNvbW1hbmQgdG8gcnVuIENsaXBweVxcJ3MgbGludHMuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgdGhlIGBjYXJnbyBjbGlwcHlgIHBhY2thZ2UgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBjbGFzcyBDYXJnb0J1aWxkUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKGN3ZCkge1xuICAgICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgfVxuXG4gICAgZ2V0TmljZU5hbWUoKSB7XG4gICAgICByZXR1cm4gJ0NhcmdvJztcbiAgICB9XG5cbiAgICBpc0VsaWdpYmxlKCkge1xuICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoYCR7dGhpcy5jd2R9L0NhcmdvLnRvbWxgKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncygpIHtcbiAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gICAgICBjb25zdCBlcnIgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xuICAgICAgY29uc3Qgc3RkUGFyc2VyID0gcmVxdWlyZSgnLi9zdGQtcGFyc2VyJyk7XG4gICAgICBjb25zdCBqc29uUGFyc2VyID0gcmVxdWlyZSgnLi9qc29uLXBhcnNlcicpO1xuICAgICAgY29uc3QgcGFuaWNQYXJzZXIgPSByZXF1aXJlKCcuL3BhbmljLXBhcnNlcicpO1xuXG4gICAgICBsZXQgYnVpbGRXb3JrRGlyOyAgICAgICAgLy8gVGhlIGxhc3QgYnVpbGQgd29ya2RpbmcgZGlyZWN0b3J5IChtaWdodCBkaWZmZXIgZnJvbSB0aGUgcHJvamVjdCByb290IGZvciBtdWx0aS1jcmF0ZSBwcm9qZWN0cylcbiAgICAgIGNvbnN0IHBhbmljc0xpbWl0ID0gMTA7ICAvLyBNYXggbnVtYmVyIG9mIHBhbmljcyB0byBzaG93IGF0IG9uY2VcblxuICAgICAgLy8gU3BsaXQgb3V0cHV0IGFuZCByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgaWYgbmVlZGVkXG4gICAgICBmdW5jdGlvbiBleHRyYWN0TGluZXMob3V0cHV0LCByZW1vdmVFc2NhcGUpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoL1xcbi8pO1xuICAgICAgICBpZiAocmVtb3ZlRXNjYXBlKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGluZXNbaV0gPSBsaW5lc1tpXS5yZXBsYWNlKC9bXFx1MDAxYlxcdTAwOWJdW1soKSM7P10qKD86WzAtOV17MSw0fSg/OjtbMC05XXswLDR9KSopP1swLTlBLU9SWmNmLW5xcnk9PjxdL2csICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtYXRjaEZ1bmN0aW9uKG91dHB1dCkge1xuICAgICAgICBjb25zdCB1c2VKc29uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JGb3JtYXQnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTsgICAgLy8gcmVzdWx0aW5nIGNvbGxlY3Rpb24gb2YgaGlnaC1sZXZlbCBtZXNzYWdlc1xuICAgICAgICBsZXQgcGFuaWNzTiA9IDA7ICAgICAgICAvLyBxdWFudGl0eSBvZiBwYW5pY3MgaW4gdGhpcyBvdXRwdXRcbiAgICAgICAgY29uc3QgbGluZXMgPSBleHRyYWN0TGluZXMob3V0cHV0LCAhdXNlSnNvbik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgcGFyc2VkUXR5ID0gMDtcblxuICAgICAgICAgIC8vIFRyeSBwYXJzZSBhIEpTT04gbWVzc2FnZVxuICAgICAgICAgIGlmICh1c2VKc29uICYmIGxpbmVzW2ldLnN0YXJ0c1dpdGgoJ3snKSkge1xuICAgICAgICAgICAganNvblBhcnNlci5wYXJzZU1lc3NhZ2UobGluZXNbaV0sIG1lc3NhZ2VzKTtcbiAgICAgICAgICAgIHBhcnNlZFF0eSA9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVHJ5IHBhcnNlIGEgc3RhbmRhcmQgb3V0cHV0IG1lc3NhZ2VcbiAgICAgICAgICBpZiAocGFyc2VkUXR5ID09PSAwICYmICF1c2VKc29uKSB7XG4gICAgICAgICAgICBwYXJzZWRRdHkgPSBzdGRQYXJzZXIudHJ5UGFyc2VNZXNzYWdlKGxpbmVzLCBpLCBtZXNzYWdlcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVHJ5IHBhcnNlIGEgcGFuaWNcbiAgICAgICAgICBpZiAocGFyc2VkUXR5ID09PSAwKSB7XG4gICAgICAgICAgICBwYXJzZWRRdHkgPSBwYW5pY1BhcnNlci50cnlQYXJzZVBhbmljKGxpbmVzLCBpLCBwYW5pY3NOIDwgcGFuaWNzTGltaXQsIGJ1aWxkV29ya0Rpcik7XG4gICAgICAgICAgICBpZiAocGFyc2VkUXR5ID4gMCkge1xuICAgICAgICAgICAgICBwYW5pY3NOICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcnNlZFF0eSA+IDEpIHtcbiAgICAgICAgICAgIGkgKz0gcGFyc2VkUXR5IC0gMTsgLy8gU3VidHJhY3Qgb25lIGJlY2F1c2UgdGhlIGN1cnJlbnQgbGluZSBpcyBhbHJlYWR5IGNvdW50ZWRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGlkZGVuUGFuaWNzTiA9IHBhbmljc04gLSBwYW5pY3NMaW1pdDtcbiAgICAgICAgaWYgKGhpZGRlblBhbmljc04gPT09IDEpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ09uZSBtb3JlIHBhbmljIGlzIGhpZGRlbicsIHsgZGlzbWlzc2FibGU6IHRydWUgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZGVuUGFuaWNzTiA+IDEpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoaGlkZGVuUGFuaWNzTiArICcgbW9yZSBwYW5pY3MgYXJlIGhpZGRlbicsIHsgZGlzbWlzc2FibGU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICAgIHJldHVybiBlcnIucHJlcHJvY2Vzc01lc3NhZ2UobSwgYnVpbGRXb3JrRGlyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrcyBpZiB0aGUgZ2l2ZW4gb2JqZWN0IHJlcHJlc2VudHMgdGhlIHJvb3Qgb2YgdGhlIHByb2plY3Qgb3IgZmlsZSBzeXN0ZW1cbiAgICAgIGZ1bmN0aW9uIGlzUm9vdChwYXJ0cykge1xuICAgICAgICBpZiAocGFydHMuZGlyID09PSBwYXJ0cy5yb290KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7ICAgIC8vIFRoZSBmaWxlIHN5c3RlbSByb290XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRQYXRocygpLnNvbWUocCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHBhcnRzLmRpciA9PT0gcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybnMgdGhlIGNsb3Nlc3QgZGlyZWN0b3J5IHdpdGggQ2FyZ28udG9tbCBpbiBpdC5cbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gc3VjaCBkaXJlY3RvcnksIHJldHVybnMgdW5kZWZpbmVkLlxuICAgICAgZnVuY3Rpb24gZmluZENhcmdvUHJvamVjdERpcihwKSB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcGF0aC5wYXJzZShwKTtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGlzUm9vdChwYXJ0cyk7XG4gICAgICAgIGNvbnN0IGNhcmdvVG9tbCA9IHBhdGguZm9ybWF0KHtcbiAgICAgICAgICBkaXI6IHBhcnRzLmRpcixcbiAgICAgICAgICBiYXNlOiAnQ2FyZ28udG9tbCdcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGZzLnN0YXRTeW5jKGNhcmdvVG9tbCkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGRpcjogcGFydHMuZGlyLFxuICAgICAgICAgICAgICByb290OiByb290XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7ICAvLyBObyBzdWNoIGZpbGUgKENhcmdvLnRvbWwpXG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocm9vdCkge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbmRDYXJnb1Byb2plY3REaXIocGFydHMuZGlyKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYmVmb3JlIGV2ZXJ5IGJ1aWxkLiBJdCBmaW5kcyB0aGUgY2xvc2VzdFxuICAgICAgLy8gQ2FyZ28udG9tbCBmaWxlIGluIHRoZSBwYXRoIGFuZCB1c2VzIGl0cyBkaXJlY3RvcnkgYXMgd29ya2luZy5cbiAgICAgIGZ1bmN0aW9uIHByZXBhcmVCdWlsZChidWlsZENmZykge1xuICAgICAgICAvLyBDb21tb24gYnVpbGQgY29tbWFuZCBwYXJhbWV0ZXJzXG4gICAgICAgIGJ1aWxkQ2ZnLmV4ZWMgPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvUGF0aCcpO1xuICAgICAgICBidWlsZENmZy5lbnYgPSB7fTtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uanNvbkVycm9yRm9ybWF0JykpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy1aIHVuc3RhYmxlLW9wdGlvbnMgLS1lcnJvci1mb3JtYXQ9anNvbic7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5URVJNID0gJ3h0ZXJtJztcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy0tY29sb3I9YWx3YXlzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5iYWNrdHJhY2VUeXBlJykgIT09ICdPZmYnKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlJVU1RfQkFDS1RSQUNFID0gJzEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1aWxkQ2ZnLmFyZ3MgPSBidWlsZENmZy5hcmdzIHx8IFtdO1xuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnZlcmJvc2UnKSAmJiBidWlsZENmZy5hcmdzLnB1c2goJy0tdmVyYm9zZScpO1xuXG4gICAgICAgIC8vIFN1YnN0aXR1dGUgd29ya2luZyBkaXJlY3RvcnkgaWYgd2UgYXJlIGluIGEgbXVsdGktY3JhdGUgZW52aXJvbm1lbnRcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28ubXVsdGlDcmF0ZVByb2plY3RzJykpIHtcbiAgICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgICAgICAgY29uc3Qgd2RJbmZvID0gZmluZENhcmdvUHJvamVjdERpcihlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIGlmICh3ZEluZm8pIHtcbiAgICAgICAgICAgICAgaWYgKCF3ZEluZm8ucm9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBwYXRoLnBhcnNlKHdkSW5mby5kaXIpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZGluZyAnICsgcC5iYXNlICsgJy4uLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJ1aWxkQ2ZnLmN3ZCA9IHdkSW5mby5kaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRDZmcuY3dkICYmIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBCdWlsZCBpbiB0aGUgcm9vdCBvZiB0aGUgZmlyc3QgcGF0aCBieSBkZWZhdWx0XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRXb3JrRGlyID0gYnVpbGRDZmcuY3dkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKGRlYnVnKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIChyZWxlYXNlKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJlbmNoJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpiZW5jaCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYmVuY2gnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogY2xlYW4nLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsZWFuJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGVhbicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBkb2MnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmRvYycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnZG9jJyBdLFxuICAgICAgICAgIHByZUNvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5vcGVuRG9jcycpICYmIHRoaXMuYXJncy5wdXNoKCctLW9wZW4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tcmVsZWFzZScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB0ZXN0JyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tdGVzdCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAndGVzdCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB1cGRhdGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnVwZGF0ZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAndXBkYXRlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIGV4YW1wbGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJ1aWxkLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicsICctLWV4YW1wbGUnLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIGJpbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWJpbicsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tYmluJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBDbGlwcHknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsaXBweScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2xpcHB5JyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjaGVjaycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2hlY2snLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NoZWNrJyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgICAgIGNtZC5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgY21kLnNoID0gZmFsc2U7XG4gICAgICAgIGNtZC5mdW5jdGlvbk1hdGNoID0gbWF0Y2hGdW5jdGlvbjtcbiAgICAgICAgY21kLnByZUJ1aWxkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuYXJncyA9IHRoaXMuYXJnc0NmZy5zbGljZSgwKTsgICAgLy8gQ2xvbmUgaW5pdGlhbCBhcmd1bWVudHNcbiAgICAgICAgICBpZiAodGhpcy5wcmVDb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlnKCk7ICAgICAgICAgICAgICAgICAgIC8vIEFsbG93IHRoZSBjb21tYW5kIHRvIGNvbmZpZ3VyZSBpdHMgYXJndW1lbnRzXG4gICAgICAgICAgfVxuICAgICAgICAgIHByZXBhcmVCdWlsZCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/build-cargo/lib/cargo.js
