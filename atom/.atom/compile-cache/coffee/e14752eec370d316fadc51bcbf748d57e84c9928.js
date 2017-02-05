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
      },
      allowedToCacheVersions: {
        type: 'boolean',
        "default": true,
        description: "Uncheck this if you need to change toolchains during one Atom session. Otherwise toolchains' versions are saved for an entire Atom session to increase performance."
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1ydXN0L2xpYi9pbml0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsNEJBRmI7T0FERjtNQUlBLFNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BTEY7TUFRQSxTQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtRQUVBLFdBQUEsRUFBYSx3Q0FGYjtPQVRGO01BWUEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FGTjtRQUdBLFdBQUEsRUFBYSwwUEFIYjtPQWJGO01Bc0JBLHFCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsWUFEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtPQXZCRjtNQTBCQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixFQUFoQixDQUZOO1FBR0EsV0FBQSxFQUFhLHlDQUhiO09BM0JGO01BK0JBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLEtBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7UUFJQSxXQUFBLEVBQWEsa0VBSmI7T0FoQ0Y7TUFxQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtRQUlBLFdBQUEsRUFBYSw4RUFKYjtPQXRDRjtNQTJDQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxvQ0FGYjtPQTVDRjtNQStDQSxzQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEscUtBRmI7T0FoREY7S0FERjtJQXNEQSxRQUFBLEVBQVUsU0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQXFDLGFBQXJDO0lBRFEsQ0F0RFY7SUEwREEsYUFBQSxFQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSO01BQ2IsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxVQUFBLENBQUE7YUFDaEI7UUFDRSxJQUFBLEVBQU0sTUFEUjtRQUVFLGFBQUEsRUFBZSxDQUFDLGFBQUQsQ0FGakI7UUFHRSxLQUFBLEVBQU8sU0FIVDtRQUlFLElBQUEsRUFBTSxJQUFDLENBQUEsUUFBUSxDQUFDLElBSmxCO1FBS0UsU0FBQSxFQUFXLEtBTGI7O0lBSGEsQ0ExRGY7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB1c2VDYXJnbzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlIENhcmdvIGlmIGl0J3MgcG9zc2libGVcIlxuICAgIHJ1c3RjUGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncnVzdGMnXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXRoIHRvIFJ1c3QncyBjb21waWxlciBgcnVzdGNgXCJcbiAgICBjYXJnb1BhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2NhcmdvJ1xuICAgICAgZGVzY3JpcHRpb246IFwiUGF0aCB0byBSdXN0J3MgcGFja2FnZSBtYW5hZ2VyIGBjYXJnb2BcIlxuICAgIGNhcmdvQ29tbWFuZDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnYnVpbGQnXG4gICAgICBlbnVtOiBbJ2J1aWxkJywgJ2NoZWNrJywgJ3Rlc3QnLCAncnVzdGMnLCAnY2xpcHB5J11cbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSAnY2hlY2snIGZvciBmYXN0IGxpbnRpbmcgKHlvdSBuZWVkIHRvIGluc3RhbGxcbiAgICAgICAgYGNhcmdvLWNoZWNrYCkuIFVzZSAnY2xpcHB5JyB0byBpbmNyZWFzZSBhbW91bnQgb2YgYXZhaWxhYmxlIGxpbnRzXG4gICAgICAgICh5b3UgbmVlZCB0byBpbnN0YWxsIGBjbGlwcHlgKS5cbiAgICAgICAgVXNlICd0ZXN0JyB0byBsaW50IHRlc3QgY29kZSwgdG9vLlxuICAgICAgICBVc2UgJ3J1c3RjJyBmb3IgZmFzdCBsaW50aW5nIChub3RlOiBkb2VzIG5vdCBidWlsZFxuICAgICAgICB0aGUgcHJvamVjdCkuXCJcbiAgICBjYXJnb01hbmlmZXN0RmlsZW5hbWU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ0NhcmdvLnRvbWwnXG4gICAgICBkZXNjcmlwdGlvbjogJ0NhcmdvIG1hbmlmZXN0IGZpbGVuYW1lJ1xuICAgIGpvYnNOdW1iZXI6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICAgIGVudW06IFsxLCAyLCA0LCA2LCA4LCAxMF1cbiAgICAgIGRlc2NyaXB0aW9uOiAnTnVtYmVyIG9mIGpvYnMgdG8gcnVuIENhcmdvIGluIHBhcmFsbGVsJ1xuICAgIGRpc2FibGVkV2FybmluZ3M6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogJ0xpbnRpbmcgd2FybmluZ3MgdG8gYmUgaWdub3JlZCBpbiBlZGl0b3IsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcy4nXG4gICAgc3BlY2lmaWVkRmVhdHVyZXM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogJ0FkZGl0aW9uYWwgZmVhdHVyZXMgdG8gYmUgcGFzc2VkLCB3aGVuIGxpbnRpbmcgKGZvciBleGFtcGxlLCBgc2VjdXJlLCBodG1sYCknXG4gICAgcnVzdGNCdWlsZFRlc3Q6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJMaW50IHRlc3QgY29kZSwgd2hlbiB1c2luZyBgcnVzdGNgXCJcbiAgICBhbGxvd2VkVG9DYWNoZVZlcnNpb25zOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJVbmNoZWNrIHRoaXMgaWYgeW91IG5lZWQgdG8gY2hhbmdlIHRvb2xjaGFpbnMgZHVyaW5nIG9uZSBBdG9tIHNlc3Npb24uIE90aGVyd2lzZSB0b29sY2hhaW5zJyB2ZXJzaW9ucyBhcmUgc2F2ZWQgZm9yIGFuIGVudGlyZSBBdG9tIHNlc3Npb24gdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2UuXCJcblxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCAnbGludGVyLXJ1c3QnXG5cblxuICBwcm92aWRlTGludGVyOiAtPlxuICAgIExpbnRlclJ1c3QgPSByZXF1aXJlKCcuL2xpbnRlci1ydXN0JylcbiAgICBAcHJvdmlkZXIgPSBuZXcgTGludGVyUnVzdCgpXG4gICAge1xuICAgICAgbmFtZTogJ1J1c3QnXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5ydXN0J11cbiAgICAgIHNjb3BlOiAncHJvamVjdCdcbiAgICAgIGxpbnQ6IEBwcm92aWRlci5saW50XG4gICAgICBsaW50T25GbHk6IGZhbHNlXG4gICAgfVxuIl19
