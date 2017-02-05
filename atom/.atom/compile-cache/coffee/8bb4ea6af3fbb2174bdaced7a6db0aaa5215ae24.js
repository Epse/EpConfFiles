(function() {
  module.exports = {
    includeStagedDiff: {
      title: 'Include staged diffs?',
      type: 'boolean',
      "default": true
    },
    openInPane: {
      type: 'boolean',
      "default": true,
      description: 'Allow commands to open new panes'
    },
    splitPane: {
      title: 'Split pane direction',
      type: 'string',
      "default": 'Down',
      description: 'Where should new panes go? (Defaults to Right)',
      "enum": ['Up', 'Right', 'Down', 'Left']
    },
    wordDiff: {
      type: 'boolean',
      "default": true,
      description: 'Should word diffs be highlighted in diffs?'
    },
    syntaxHighlighting: {
      title: 'Enable syntax highlighting in diffs?',
      type: 'boolean',
      "default": true
    },
    numberOfCommitsToShow: {
      type: 'integer',
      "default": 25,
      minimum: 1
    },
    gitPath: {
      type: 'string',
      "default": 'git',
      description: 'Where is your git?'
    },
    messageTimeout: {
      type: 'integer',
      "default": 5,
      description: 'How long should success/error messages be shown?'
    },
    showFormat: {
      description: 'Which format to use for git show? (none will use your git config default)',
      type: 'string',
      "default": 'full',
      "enum": ['oneline', 'short', 'medium', 'full', 'fuller', 'email', 'raw', 'none']
    },
    pullBeforePush: {
      description: 'Pull from remote before pushing',
      type: 'string',
      "default": 'no',
      "enum": ['no', 'pull', 'pull --rebase']
    },
    experimental: {
      description: 'Enable beta features and behavior',
      type: 'boolean',
      "default": false
    },
    verboseCommits: {
      description: '(Experimental) Show diffs in commit pane?',
      type: 'boolean',
      "default": false
    },
    alwaysPullFromUpstream: {
      description: '(Experimental) Always pull from current branch upstream?',
      type: 'boolean',
      "default": false
    },
    enableStatusBarIcon: {
      type: 'boolean',
      "default": true
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGlCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sdUJBQVA7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtLQURGO0lBSUEsVUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxXQUFBLEVBQWEsa0NBRmI7S0FMRjtJQVFBLFNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxzQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUZUO01BR0EsV0FBQSxFQUFhLGdEQUhiO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLE1BQWhCLEVBQXdCLE1BQXhCLENBSk47S0FURjtJQWNBLFFBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO01BRUEsV0FBQSxFQUFhLDRDQUZiO0tBZkY7SUFrQkEsa0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxzQ0FBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO0tBbkJGO0lBc0JBLHFCQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtNQUVBLE9BQUEsRUFBUyxDQUZUO0tBdkJGO0lBMEJBLE9BQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO01BRUEsV0FBQSxFQUFhLG9CQUZiO0tBM0JGO0lBOEJBLGNBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQURUO01BRUEsV0FBQSxFQUFhLGtEQUZiO0tBL0JGO0lBa0NBLFVBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSwyRUFBYjtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUZUO01BR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLFFBQXJCLEVBQStCLE1BQS9CLEVBQXVDLFFBQXZDLEVBQWlELE9BQWpELEVBQTBELEtBQTFELEVBQWlFLE1BQWpFLENBSE47S0FuQ0Y7SUF1Q0EsY0FBQSxFQUNFO01BQUEsV0FBQSxFQUFhLGlDQUFiO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxlQUFmLENBSE47S0F4Q0Y7SUE0Q0EsWUFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLG1DQUFiO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7S0E3Q0Y7SUFnREEsY0FBQSxFQUNFO01BQUEsV0FBQSxFQUFhLDJDQUFiO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7S0FqREY7SUFvREEsc0JBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSwwREFBYjtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO0tBckRGO0lBd0RBLG1CQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtLQXpERjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgaW5jbHVkZVN0YWdlZERpZmY6XG4gICAgdGl0bGU6ICdJbmNsdWRlIHN0YWdlZCBkaWZmcz8nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICBvcGVuSW5QYW5lOlxuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0FsbG93IGNvbW1hbmRzIHRvIG9wZW4gbmV3IHBhbmVzJ1xuICBzcGxpdFBhbmU6XG4gICAgdGl0bGU6ICdTcGxpdCBwYW5lIGRpcmVjdGlvbidcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICdEb3duJ1xuICAgIGRlc2NyaXB0aW9uOiAnV2hlcmUgc2hvdWxkIG5ldyBwYW5lcyBnbz8gKERlZmF1bHRzIHRvIFJpZ2h0KSdcbiAgICBlbnVtOiBbJ1VwJywgJ1JpZ2h0JywgJ0Rvd24nLCAnTGVmdCddXG4gIHdvcmREaWZmOlxuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB3b3JkIGRpZmZzIGJlIGhpZ2hsaWdodGVkIGluIGRpZmZzPydcbiAgc3ludGF4SGlnaGxpZ2h0aW5nOlxuICAgIHRpdGxlOiAnRW5hYmxlIHN5bnRheCBoaWdobGlnaHRpbmcgaW4gZGlmZnM/J1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgbnVtYmVyT2ZDb21taXRzVG9TaG93OlxuICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgIGRlZmF1bHQ6IDI1XG4gICAgbWluaW11bTogMVxuICBnaXRQYXRoOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ2dpdCdcbiAgICBkZXNjcmlwdGlvbjogJ1doZXJlIGlzIHlvdXIgZ2l0PydcbiAgbWVzc2FnZVRpbWVvdXQ6XG4gICAgdHlwZTogJ2ludGVnZXInXG4gICAgZGVmYXVsdDogNVxuICAgIGRlc2NyaXB0aW9uOiAnSG93IGxvbmcgc2hvdWxkIHN1Y2Nlc3MvZXJyb3IgbWVzc2FnZXMgYmUgc2hvd24/J1xuICBzaG93Rm9ybWF0OlxuICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZm9ybWF0IHRvIHVzZSBmb3IgZ2l0IHNob3c/IChub25lIHdpbGwgdXNlIHlvdXIgZ2l0IGNvbmZpZyBkZWZhdWx0KSdcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICdmdWxsJ1xuICAgIGVudW06IFsnb25lbGluZScsICdzaG9ydCcsICdtZWRpdW0nLCAnZnVsbCcsICdmdWxsZXInLCAnZW1haWwnLCAncmF3JywgJ25vbmUnXVxuICBwdWxsQmVmb3JlUHVzaDpcbiAgICBkZXNjcmlwdGlvbjogJ1B1bGwgZnJvbSByZW1vdGUgYmVmb3JlIHB1c2hpbmcnXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnbm8nXG4gICAgZW51bTogWydubycsICdwdWxsJywgJ3B1bGwgLS1yZWJhc2UnXVxuICBleHBlcmltZW50YWw6XG4gICAgZGVzY3JpcHRpb246ICdFbmFibGUgYmV0YSBmZWF0dXJlcyBhbmQgYmVoYXZpb3InXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgdmVyYm9zZUNvbW1pdHM6XG4gICAgZGVzY3JpcHRpb246ICcoRXhwZXJpbWVudGFsKSBTaG93IGRpZmZzIGluIGNvbW1pdCBwYW5lPydcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICBhbHdheXNQdWxsRnJvbVVwc3RyZWFtOlxuICAgIGRlc2NyaXB0aW9uOiAnKEV4cGVyaW1lbnRhbCkgQWx3YXlzIHB1bGwgZnJvbSBjdXJyZW50IGJyYW5jaCB1cHN0cmVhbT8nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgZW5hYmxlU3RhdHVzQmFySWNvbjpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4iXX0=
