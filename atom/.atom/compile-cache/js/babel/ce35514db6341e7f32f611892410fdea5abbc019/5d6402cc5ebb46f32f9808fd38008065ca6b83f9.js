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

        function matchFunction(output, useJson) {
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
          var useJson = atom.config.get('build-cargo.jsonErrorFormat') && buildCfg.supportsMessageFormat;
          buildCfg.functionMatch = function (messages) {
            return matchFunction(messages, useJson);
          };
          if (useJson) {
            buildCfg.args.push('--message-format=json');
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
          supportsMessageFormat: true,
          argsCfg: ['build']
        }, {
          name: 'Cargo: build (release)',
          atomCommandName: 'cargo:build-release',
          supportsMessageFormat: true,
          argsCfg: ['build', '--release']
        }, {
          name: 'Cargo: bench',
          atomCommandName: 'cargo:bench',
          supportsMessageFormat: true,
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
          supportsMessageFormat: true,
          argsCfg: ['run']
        }, {
          name: 'Cargo: run (release)',
          atomCommandName: 'cargo:run-release',
          supportsMessageFormat: true,
          argsCfg: ['run', '--release']
        }, {
          name: 'Cargo: test',
          atomCommandName: 'cargo:run-test',
          supportsMessageFormat: true,
          argsCfg: ['test']
        }, {
          name: 'Cargo: update',
          atomCommandName: 'cargo:update',
          argsCfg: ['update']
        }, {
          name: 'Cargo: build example',
          atomCommandName: 'cargo:build-example',
          supportsMessageFormat: true,
          argsCfg: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run example',
          atomCommandName: 'cargo:run-example',
          supportsMessageFormat: true,
          argsCfg: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run bin',
          atomCommandName: 'cargo:run-bin',
          supportsMessageFormat: true,
          argsCfg: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}']
        }];

        if (atom.config.get('build-cargo.extCommands.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            atomCommandName: 'cargo:clippy',
            supportsMessageFormat: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7O0FBRm5CLFdBQVcsQ0FBQzs7QUFLWixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLEVBQUU7QUFDaEQsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDekQ7QUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7QUFDN0MsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0Q7QUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7QUFDOUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7O0FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7QUFFckMsSUFBTSxNQUFNLEdBQUc7QUFDcEIsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLDhCQUE4QjtBQUNyQyxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsT0FBTztBQUNoQixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0Qsb0JBQWtCLEVBQUU7QUFDbEIsU0FB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QUFxQixFQUFFLElBQUk7QUFDM0IsbUJBQU8sRUFBRSxDQUFFLFFBQVEsQ0FBRTtXQUN0QixDQUFDLENBQUM7U0FDSjs7QUFFRCxZQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7QUFDekQsa0JBQVEsQ0FBQyxJQUFJLENBQUM7QUFDWixnQkFBSSxFQUFFLGNBQWM7QUFDcEIsMkJBQWUsRUFBRSxhQUFhO0FBQzlCLG1CQUFPLEVBQUUsQ0FBRSxPQUFPLENBQUU7V0FDckIsQ0FBQyxDQUFDO1NBQ0o7O0FBRUQsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDdEIsYUFBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELGFBQUcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ2YsYUFBRyxDQUFDLFFBQVEsR0FBRyxZQUFZO0FBQ3pCLGdCQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsa0JBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUNsQjtBQUNELHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDcEIsQ0FBQztTQUNILENBQUMsQ0FBQzs7QUFFSCxlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O1dBblFVLGtCQUFrQjtPQW9RN0I7Q0FDSCIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbi8vIFRyYW5zZmVyIGV4aXN0aW5nIHNldHRpbmdzIGZyb20gcHJldmlvdXMgdmVyc2lvbnMgb2YgdGhlIHBhY2thZ2VcbmlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnNob3dCYWNrdHJhY2UnKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnLCAnQ29tcGFjdCcpO1xufVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DaGVjaycsIHRydWUpO1xufVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DbGlwcHknKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JywgdHJ1ZSk7XG59XG4vLyBSZW1vdmUgb2xkIHNldHRpbmdzXG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2hlY2snKTtcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvcnMnKTtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgY2FyZ29QYXRoOiB7XG4gICAgdGl0bGU6ICdQYXRoIHRvIHRoZSBDYXJnbyBleGVjdXRhYmxlJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnY2FyZ28nLFxuICAgIG9yZGVyOiAxXG4gIH0sXG4gIG11bHRpQ3JhdGVQcm9qZWN0czoge1xuICAgIHRpdGxlOiAnRW5hYmxlIG11bHRpLWNyYXRlIHByb2plY3RzIHN1cHBvcnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQnVpbGQgaW50ZXJuYWwgY3JhdGVzIHNlcGFyYXRlbHkgYmFzZWQgb24gdGhlIGN1cnJlbnQgb3BlbiBmaWxlLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyXG4gIH0sXG4gIHZlcmJvc2U6IHtcbiAgICB0aXRsZTogJ1ZlcmJvc2UgQ2FyZ28gb3V0cHV0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1Bhc3MgdGhlIC0tdmVyYm9zZSBmbGFnIHRvIENhcmdvLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAzXG4gIH0sXG4gIGJhY2t0cmFjZVR5cGU6IHtcbiAgICB0aXRsZTogJ0JhY2t0cmFjZScsXG4gICAgZGVzY3JpcHRpb246ICdTdGFjayBiYWNrdHJhY2UgdmVyYm9zaXR5IGxldmVsLiBVc2VzIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBSVVNUX0JBQ0tUUkFDRT0xIGlmIG5vdCBgT2ZmYC4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdPZmYnLFxuICAgIGVudW06IFsgJ09mZicsICdDb21wYWN0JywgJ0Z1bGwnIF0sXG4gICAgb3JkZXI6IDRcbiAgfSxcbiAganNvbkVycm9yRm9ybWF0OiB7XG4gICAgdGl0bGU6ICdVc2UgSlNPTiBlcnJvciBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnVXNlIEpTT04gZXJyb3IgZm9ybWF0IGluc3RlYWQgb2YgaHVtYW4gcmVhZGFibGUgb3V0cHV0LicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgb3BlbkRvY3M6IHtcbiAgICB0aXRsZTogJ09wZW4gZG9jdW1lbnRhdGlvbiBpbiBicm93c2VyIGFmdGVyIFxcJ2RvY1xcJyB0YXJnZXQgaXMgYnVpbHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNlxuICB9LFxuICBleHRDb21tYW5kczoge1xuICAgIHRpdGxlOiAnRXh0ZW5kZWQgQ29tbWFuZHMnLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiA3LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGNhcmdvQ2hlY2s6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2hlY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNoZWNrYCBDYXJnbyBjb21tYW5kLiBPbmx5IHVzZSB0aGlzIGlmIHlvdSBoYXZlIGBjYXJnbyBjaGVja2AgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxXG4gICAgICB9LFxuICAgICAgY2FyZ29DbGlwcHk6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2xpcHB5JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGhlIGBjYXJnbyBjbGlwcHlgIENhcmdvIGNvbW1hbmQgdG8gcnVuIENsaXBweVxcJ3MgbGludHMuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgdGhlIGBjYXJnbyBjbGlwcHlgIHBhY2thZ2UgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBjbGFzcyBDYXJnb0J1aWxkUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKGN3ZCkge1xuICAgICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgfVxuXG4gICAgZ2V0TmljZU5hbWUoKSB7XG4gICAgICByZXR1cm4gJ0NhcmdvJztcbiAgICB9XG5cbiAgICBpc0VsaWdpYmxlKCkge1xuICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoYCR7dGhpcy5jd2R9L0NhcmdvLnRvbWxgKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncygpIHtcbiAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gICAgICBjb25zdCBlcnIgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xuICAgICAgY29uc3Qgc3RkUGFyc2VyID0gcmVxdWlyZSgnLi9zdGQtcGFyc2VyJyk7XG4gICAgICBjb25zdCBqc29uUGFyc2VyID0gcmVxdWlyZSgnLi9qc29uLXBhcnNlcicpO1xuICAgICAgY29uc3QgcGFuaWNQYXJzZXIgPSByZXF1aXJlKCcuL3BhbmljLXBhcnNlcicpO1xuXG4gICAgICBsZXQgYnVpbGRXb3JrRGlyOyAgICAgICAgLy8gVGhlIGxhc3QgYnVpbGQgd29ya2RpbmcgZGlyZWN0b3J5IChtaWdodCBkaWZmZXIgZnJvbSB0aGUgcHJvamVjdCByb290IGZvciBtdWx0aS1jcmF0ZSBwcm9qZWN0cylcbiAgICAgIGNvbnN0IHBhbmljc0xpbWl0ID0gMTA7ICAvLyBNYXggbnVtYmVyIG9mIHBhbmljcyB0byBzaG93IGF0IG9uY2VcblxuICAgICAgLy8gU3BsaXQgb3V0cHV0IGFuZCByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgaWYgbmVlZGVkXG4gICAgICBmdW5jdGlvbiBleHRyYWN0TGluZXMob3V0cHV0LCByZW1vdmVFc2NhcGUpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoL1xcbi8pO1xuICAgICAgICBpZiAocmVtb3ZlRXNjYXBlKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGluZXNbaV0gPSBsaW5lc1tpXS5yZXBsYWNlKC9bXFx1MDAxYlxcdTAwOWJdW1soKSM7P10qKD86WzAtOV17MSw0fSg/OjtbMC05XXswLDR9KSopP1swLTlBLU9SWmNmLW5xcnk9PjxdL2csICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtYXRjaEZ1bmN0aW9uKG91dHB1dCwgdXNlSnNvbikge1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdOyAgICAvLyByZXN1bHRpbmcgY29sbGVjdGlvbiBvZiBoaWdoLWxldmVsIG1lc3NhZ2VzXG4gICAgICAgIGxldCBwYW5pY3NOID0gMDsgICAgICAgIC8vIHF1YW50aXR5IG9mIHBhbmljcyBpbiB0aGlzIG91dHB1dFxuICAgICAgICBjb25zdCBsaW5lcyA9IGV4dHJhY3RMaW5lcyhvdXRwdXQsICF1c2VKc29uKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBwYXJzZWRRdHkgPSAwO1xuXG4gICAgICAgICAgLy8gVHJ5IHBhcnNlIGEgSlNPTiBtZXNzYWdlXG4gICAgICAgICAgaWYgKHVzZUpzb24gJiYgbGluZXNbaV0uc3RhcnRzV2l0aCgneycpKSB7XG4gICAgICAgICAgICBqc29uUGFyc2VyLnBhcnNlTWVzc2FnZShsaW5lc1tpXSwgbWVzc2FnZXMpO1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBzdGFuZGFyZCBvdXRwdXQgbWVzc2FnZVxuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPT09IDAgJiYgIXVzZUpzb24pIHtcbiAgICAgICAgICAgIHBhcnNlZFF0eSA9IHN0ZFBhcnNlci50cnlQYXJzZU1lc3NhZ2UobGluZXMsIGksIG1lc3NhZ2VzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBwYW5pY1xuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPT09IDApIHtcbiAgICAgICAgICAgIHBhcnNlZFF0eSA9IHBhbmljUGFyc2VyLnRyeVBhcnNlUGFuaWMobGluZXMsIGksIHBhbmljc04gPCBwYW5pY3NMaW1pdCwgYnVpbGRXb3JrRGlyKTtcbiAgICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAwKSB7XG4gICAgICAgICAgICAgIHBhbmljc04gKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyc2VkUXR5ID4gMSkge1xuICAgICAgICAgICAgaSArPSBwYXJzZWRRdHkgLSAxOyAvLyBTdWJ0cmFjdCBvbmUgYmVjYXVzZSB0aGUgY3VycmVudCBsaW5lIGlzIGFscmVhZHkgY291bnRlZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoaWRkZW5QYW5pY3NOID0gcGFuaWNzTiAtIHBhbmljc0xpbWl0O1xuICAgICAgICBpZiAoaGlkZGVuUGFuaWNzTiA9PT0gMSkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT25lIG1vcmUgcGFuaWMgaXMgaGlkZGVuJywgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChoaWRkZW5QYW5pY3NOID4gMSkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihoaWRkZW5QYW5pY3NOICsgJyBtb3JlIHBhbmljcyBhcmUgaGlkZGVuJywgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZXMuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgcmV0dXJuIGVyci5wcmVwcm9jZXNzTWVzc2FnZShtLCBidWlsZFdvcmtEaXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBnaXZlbiBvYmplY3QgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgcHJvamVjdCBvciBmaWxlIHN5c3RlbVxuICAgICAgZnVuY3Rpb24gaXNSb290KHBhcnRzKSB7XG4gICAgICAgIGlmIChwYXJ0cy5kaXIgPT09IHBhcnRzLnJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgLy8gVGhlIGZpbGUgc3lzdGVtIHJvb3RcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuc29tZShwID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFydHMuZGlyID09PSBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJucyB0aGUgY2xvc2VzdCBkaXJlY3Rvcnkgd2l0aCBDYXJnby50b21sIGluIGl0LlxuICAgICAgLy8gSWYgdGhlcmUncyBubyBzdWNoIGRpcmVjdG9yeSwgcmV0dXJucyB1bmRlZmluZWQuXG4gICAgICBmdW5jdGlvbiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHApIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKHApO1xuICAgICAgICBjb25zdCByb290ID0gaXNSb290KHBhcnRzKTtcbiAgICAgICAgY29uc3QgY2FyZ29Ub21sID0gcGF0aC5mb3JtYXQoe1xuICAgICAgICAgIGRpcjogcGFydHMuZGlyLFxuICAgICAgICAgIGJhc2U6ICdDYXJnby50b21sJ1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY2FyZ29Ub21sKS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHsgIC8vIE5vIHN1Y2ggZmlsZSAoQ2FyZ28udG9tbClcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb290KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluZENhcmdvUHJvamVjdERpcihwYXJ0cy5kaXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBiZWZvcmUgZXZlcnkgYnVpbGQuIEl0IGZpbmRzIHRoZSBjbG9zZXN0XG4gICAgICAvLyBDYXJnby50b21sIGZpbGUgaW4gdGhlIHBhdGggYW5kIHVzZXMgaXRzIGRpcmVjdG9yeSBhcyB3b3JraW5nLlxuICAgICAgZnVuY3Rpb24gcHJlcGFyZUJ1aWxkKGJ1aWxkQ2ZnKSB7XG4gICAgICAgIC8vIENvbW1vbiBidWlsZCBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICAgICAgYnVpbGRDZmcuZXhlYyA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29QYXRoJyk7XG4gICAgICAgIGJ1aWxkQ2ZnLmVudiA9IHt9O1xuICAgICAgICBjb25zdCB1c2VKc29uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JGb3JtYXQnKSAmJiBidWlsZENmZy5zdXBwb3J0c01lc3NhZ2VGb3JtYXQ7XG4gICAgICAgIGJ1aWxkQ2ZnLmZ1bmN0aW9uTWF0Y2ggPSBmdW5jdGlvbiAobWVzc2FnZXMpIHsgcmV0dXJuIG1hdGNoRnVuY3Rpb24obWVzc2FnZXMsIHVzZUpzb24pOyB9O1xuICAgICAgICBpZiAodXNlSnNvbikge1xuICAgICAgICAgIGJ1aWxkQ2ZnLmFyZ3MucHVzaCgnLS1tZXNzYWdlLWZvcm1hdD1qc29uJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5URVJNID0gJ3h0ZXJtJztcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy0tY29sb3I9YWx3YXlzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5iYWNrdHJhY2VUeXBlJykgIT09ICdPZmYnKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlJVU1RfQkFDS1RSQUNFID0gJzEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1aWxkQ2ZnLmFyZ3MgPSBidWlsZENmZy5hcmdzIHx8IFtdO1xuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnZlcmJvc2UnKSAmJiBidWlsZENmZy5hcmdzLnB1c2goJy0tdmVyYm9zZScpO1xuXG4gICAgICAgIC8vIFN1YnN0aXR1dGUgd29ya2luZyBkaXJlY3RvcnkgaWYgd2UgYXJlIGluIGEgbXVsdGktY3JhdGUgZW52aXJvbm1lbnRcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28ubXVsdGlDcmF0ZVByb2plY3RzJykpIHtcbiAgICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgICAgICAgY29uc3Qgd2RJbmZvID0gZmluZENhcmdvUHJvamVjdERpcihlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIGlmICh3ZEluZm8pIHtcbiAgICAgICAgICAgICAgaWYgKCF3ZEluZm8ucm9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBwYXRoLnBhcnNlKHdkSW5mby5kaXIpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZGluZyAnICsgcC5iYXNlICsgJy4uLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJ1aWxkQ2ZnLmN3ZCA9IHdkSW5mby5kaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRDZmcuY3dkICYmIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBCdWlsZCBpbiB0aGUgcm9vdCBvZiB0aGUgZmlyc3QgcGF0aCBieSBkZWZhdWx0XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRXb3JrRGlyID0gYnVpbGRDZmcuY3dkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKGRlYnVnKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZGVidWcnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdidWlsZCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBidWlsZCAocmVsZWFzZSknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJ1aWxkLXJlbGVhc2UnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdidWlsZCcsICctLXJlbGVhc2UnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYmVuY2gnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJlbmNoJyxcbiAgICAgICAgICBzdXBwb3J0c01lc3NhZ2VGb3JtYXQ6IHRydWUsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYmVuY2gnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogY2xlYW4nLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsZWFuJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGVhbicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBkb2MnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmRvYycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnZG9jJyBdLFxuICAgICAgICAgIHByZUNvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5vcGVuRG9jcycpICYmIHRoaXMuYXJncy5wdXNoKCctLW9wZW4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZGVidWcnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIChyZWxlYXNlKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLXJlbGVhc2UnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHRlc3QnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi10ZXN0JyxcbiAgICAgICAgICBzdXBwb3J0c01lc3NhZ2VGb3JtYXQ6IHRydWUsXG4gICAgICAgICAgYXJnc0NmZzogWyAndGVzdCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB1cGRhdGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnVwZGF0ZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAndXBkYXRlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIGV4YW1wbGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJ1aWxkLWV4YW1wbGUnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdidWlsZCcsICctLWV4YW1wbGUnLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIGV4YW1wbGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1leGFtcGxlJyxcbiAgICAgICAgICBzdXBwb3J0c01lc3NhZ2VGb3JtYXQ6IHRydWUsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gYmluJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tYmluJyxcbiAgICAgICAgICBzdXBwb3J0c01lc3NhZ2VGb3JtYXQ6IHRydWUsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tYmluJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBDbGlwcHknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsaXBweScsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NsaXBweScgXVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DaGVjaycpKSB7XG4gICAgICAgIGNvbW1hbmRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogY2hlY2snLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNoZWNrJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjaGVjaycgXVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY29tbWFuZHMuZm9yRWFjaChjbWQgPT4ge1xuICAgICAgICBjbWQuZXhlYyA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29QYXRoJyk7XG4gICAgICAgIGNtZC5zaCA9IGZhbHNlO1xuICAgICAgICBjbWQucHJlQnVpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5hcmdzID0gdGhpcy5hcmdzQ2ZnLnNsaWNlKDApOyAgICAvLyBDbG9uZSBpbml0aWFsIGFyZ3VtZW50c1xuICAgICAgICAgIGlmICh0aGlzLnByZUNvbmZpZykge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maWcoKTsgICAgICAgICAgICAgICAgICAgLy8gQWxsb3cgdGhlIGNvbW1hbmQgdG8gY29uZmlndXJlIGl0cyBhcmd1bWVudHNcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJlcGFyZUJ1aWxkKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9XG4gIH07XG59XG4iXX0=