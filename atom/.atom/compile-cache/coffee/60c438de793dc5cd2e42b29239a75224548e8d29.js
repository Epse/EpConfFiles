(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      useCargo: {
        type: 'boolean',
        "default": true,
        description: "Use Cargo if it's possible"
      },
      rustcPath: {
        type: 'string',
        "default": 'rustc',
        description: "Path to Rust's compiler `rustc`"
      },
      cargoPath: {
        type: 'string',
        "default": 'cargo',
        description: "Path to Rust's package manager `cargo`"
      },
      cargoCommand: {
        type: 'string',
        "default": 'build',
        "enum": ['build', 'check', 'test', 'rustc', 'clippy'],
        description: "Use 'check' for fast linting (you need to install `cargo-check`). Use 'clippy' to increase amount of available lints (you need to install `clippy`). Use 'test' to lint test code, too. Use 'rustc' for fast linting (note: does not build the project)."
      },
      cargoManifestFilename: {
        type: 'string',
        "default": 'Cargo.toml',
        description: 'Cargo manifest filename'
      },
      jobsNumber: {
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 4, 6, 8, 10],
        description: 'Number of jobs to run Cargo in parallel'
      },
      disabledWarnings: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        description: 'Linting warnings to be ignored in editor, separated with commas.'
      },
      specifiedFeatures: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        description: 'Additional features to be passed, when linting (for example, `secure, html`)'
      },
      rustcBuildTest: {
        type: 'boolean',
        "default": false,
        description: "Lint test code, when using `rustc`"
      }
    },
    activate: function() {
      return require('atom-package-deps').install('linter-rust');
    },
    provideLinter: function() {
      var LinterRust;
      LinterRust = require('./linter-rust');
      this.provider = new LinterRust();
      return {
        name: 'Rust',
        grammarScopes: ['source.rust'],
        scope: 'project',
        lint: this.provider.lint,
        lintOnFly: false
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1ydXN0L2xpYi9pbml0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDRCQUZiO09BREY7QUFBQSxNQUlBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsaUNBRmI7T0FMRjtBQUFBLE1BUUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx3Q0FGYjtPQVRGO0FBQUEsTUFZQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsT0FEVDtBQUFBLFFBRUEsTUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FGTjtBQUFBLFFBR0EsV0FBQSxFQUFhLDBQQUhiO09BYkY7QUFBQSxNQXNCQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFlBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5QkFGYjtPQXZCRjtBQUFBLE1BMEJBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxDQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixFQUFoQixDQUZOO0FBQUEsUUFHQSxXQUFBLEVBQWEseUNBSGI7T0EzQkY7QUFBQSxNQStCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtBQUFBLFFBSUEsV0FBQSxFQUFhLGtFQUpiO09BaENGO0FBQUEsTUFxQ0EsaUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7QUFBQSxRQUlBLFdBQUEsRUFBYSw4RUFKYjtPQXRDRjtBQUFBLE1BMkNBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsb0NBRmI7T0E1Q0Y7S0FERjtBQUFBLElBa0RBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFxQyxhQUFyQyxFQURRO0lBQUEsQ0FsRFY7QUFBQSxJQXNEQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFVBQUEsQ0FBQSxDQURoQixDQUFBO0FBRUEsYUFBTztBQUFBLFFBQ0wsSUFBQSxFQUFNLE1BREQ7QUFBQSxRQUVMLGFBQUEsRUFBZSxDQUFDLGFBQUQsQ0FGVjtBQUFBLFFBR0wsS0FBQSxFQUFPLFNBSEY7QUFBQSxRQUlMLElBQUEsRUFBTSxJQUFDLENBQUEsUUFBUSxDQUFDLElBSlg7QUFBQSxRQUtMLFNBQUEsRUFBVyxLQUxOO09BQVAsQ0FIYTtJQUFBLENBdERmO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/linter-rust/lib/init.coffee
