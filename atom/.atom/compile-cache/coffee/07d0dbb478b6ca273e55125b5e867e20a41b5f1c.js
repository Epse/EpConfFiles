(function() {
  var configs;

  configs = {
    general: {
      order: 1,
      type: "object",
      properties: {
        analytics: {
          order: 1,
          title: "Anonymous Analytics",
          type: "boolean",
          "default": true,
          description: "[Google Analytics](http://www.google.com/analytics/) is used to track which features are being used the most and causing the most errors. Everything is anonymized and no personal information, source code, or repository information is sent."
        },
        _analyticsUserId: {
          order: 2,
          title: "Analytics User Id",
          type: "string",
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        gitPath: {
          order: 3,
          title: "Git Path",
          type: "string",
          "default": "git",
          description: "If git is not in your PATH, specify where the executable is"
        },
        enableStatusBarIcon: {
          order: 4,
          title: "Status-bar Pin Icon",
          type: "boolean",
          "default": true,
          description: "The pin icon in the bottom-right of the status-bar toggles the output view above the status-bar"
        },
        openInPane: {
          order: 5,
          title: "Allow commands to open new panes",
          type: "boolean",
          "default": true,
          description: "Commands like `Commit`, `Log`, `Show`, `Diff` can be split into new panes"
        },
        splitPane: {
          order: 6,
          title: "Split pane direction",
          type: "string",
          "default": "Down",
          description: "Where should new panes go?",
          "enum": ["Up", "Right", "Down", "Left"]
        },
        messageTimeout: {
          order: 7,
          title: "Output view timeout",
          type: "integer",
          "default": 5,
          description: "For how many seconds should the output view above the status-bar stay open?"
        },
        showFormat: {
          order: 9,
          title: "Format option for 'Git Show'",
          type: "string",
          "default": "full",
          "enum": ["oneline", "short", "medium", "full", "fuller", "email", "raw", "none"],
          description: "Which format to use for `git show`? (`none` will use your git config default)"
        }
      }
    },
    commits: {
      order: 2,
      type: "object",
      properties: {
        verboseCommits: {
          title: "Verbose Commits",
          description: "Show diffs in commit pane?",
          type: "boolean",
          "default": false
        }
      }
    },
    diffs: {
      order: 3,
      type: "object",
      properties: {
        includeStagedDiff: {
          order: 1,
          title: "Include staged diffs?",
          type: "boolean",
          "default": true
        },
        wordDiff: {
          order: 2,
          title: "Word diff",
          type: "boolean",
          "default": true,
          description: "Should diffs be generated with the `--word-diff` flag?"
        },
        syntaxHighlighting: {
          order: 3,
          title: "Enable syntax highlighting in diffs?",
          type: "boolean",
          "default": true
        }
      }
    },
    logs: {
      order: 4,
      type: "object",
      properties: {
        numberOfCommitsToShow: {
          order: 1,
          title: "Number of commits to load",
          type: "integer",
          "default": 25,
          minimum: 1,
          description: "Initial amount of commits to load when running the `Log` command"
        }
      }
    },
    remoteInteractions: {
      order: 5,
      type: "object",
      properties: {
        pullRebase: {
          order: 1,
          title: "Pull Rebase",
          type: "boolean",
          "default": false,
          description: "Pull with `--rebase` flag?"
        },
        pullBeforePush: {
          order: 2,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        alwaysPullFromUpstream: {
          order: 3,
          title: "Pull From Upstream",
          type: "boolean",
          "default": false,
          description: "Always pull from current branch upstream?"
        }
      }
    },
    experimental: {
      order: 6,
      type: "object",
      properties: {
        stageFilesBeta: {
          order: 1,
          title: "Stage Files Beta",
          type: "boolean",
          "default": true,
          description: "Stage and unstage files in a single command"
        },
        customCommands: {
          order: 2,
          title: "Custom Commands",
          type: "boolean",
          "default": false,
          description: "Allow custom commands to be declared in your `init` file and run within Git-plus"
        }
      }
    }
  };

  module.exports = function() {
    var ref, userConfigs;
    if (userConfigs = (ref = atom.config.getAll('git-plus')[0]) != null ? ref.value : void 0) {
      Object.keys(userConfigs).forEach((function(_this) {
        return function(key) {
          if (!configs[key]) {
            return atom.config.unset("git-plus." + key);
          }
        };
      })(this));
    }
    return configs;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQ0U7SUFBQSxPQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsVUFBQSxFQUNFO1FBQUEsU0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8scUJBRFA7VUFFQSxJQUFBLEVBQU8sU0FGUDtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVUsSUFIVjtVQUlBLFdBQUEsRUFBYyxpUEFKZDtTQURGO1FBTUEsZ0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLG1CQURQO1VBRUEsSUFBQSxFQUFPLFFBRlA7VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFVLEVBSFY7VUFJQSxXQUFBLEVBQWMsOERBSmQ7U0FQRjtRQVlBLE9BQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFVBRFA7VUFFQSxJQUFBLEVBQU0sUUFGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSw2REFKYjtTQWJGO1FBa0JBLG1CQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxxQkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1VBSUEsV0FBQSxFQUFhLGlHQUpiO1NBbkJGO1FBd0JBLFVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLGtDQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7VUFJQSxXQUFBLEVBQWEs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V0FBQSxFQUFhLGlDQUpiO1NBUEY7UUFZQSxzQkFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sb0JBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSwyQ0FKYjtTQWJGO09BSEY7S0EvRkY7SUFvSEEsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLENBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLFVBQUEsRUFDRTtRQUFBLGNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLGtCQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7VUFJQSxXQUFBLEVBQWEsNkNBSmI7U0FERjtRQU1BLGNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLGlCQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsa0ZBSmI7U0FQRjtPQUhGO0tBckhGOzs7RUFxSUYsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQTtBQUVmLFFBQUE7SUFBQSxJQUFHLFdBQUEsMERBQStDLENBQUUsY0FBcEQ7TUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLFdBQVosQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtVQUMvQixJQUF1QyxDQUFJLE9BQVEsQ0FBQSxHQUFBLENBQW5EO21CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQixXQUFBLEdBQVksR0FBOUIsRUFBQTs7UUFEK0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLEVBREY7O1dBSUE7RUFOZTtBQXRJakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWdzID1cbiAgZ2VuZXJhbDpcbiAgICBvcmRlcjogMVxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgYW5hbHl0aWNzOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJBbm9ueW1vdXMgQW5hbHl0aWNzXCJcbiAgICAgICAgdHlwZSA6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQgOiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJbR29vZ2xlIEFuYWx5dGljc10oaHR0cDovL3d3dy5nb29nbGUuY29tL2FuYWx5dGljcy8pIGlzIHVzZWQgdG8gdHJhY2sgd2hpY2ggZmVhdHVyZXMgYXJlIGJlaW5nIHVzZWQgdGhlIG1vc3QgYW5kIGNhdXNpbmcgdGhlIG1vc3QgZXJyb3JzLiBFdmVyeXRoaW5nIGlzIGFub255bWl6ZWQgYW5kIG5vIHBlcnNvbmFsIGluZm9ybWF0aW9uLCBzb3VyY2UgY29kZSwgb3IgcmVwb3NpdG9yeSBpbmZvcm1hdGlvbiBpcyBzZW50LlwiXG4gICAgICBfYW5hbHl0aWNzVXNlcklkOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJBbmFseXRpY3MgVXNlciBJZFwiXG4gICAgICAgIHR5cGUgOiBcInN0cmluZ1wiXG4gICAgICAgIGRlZmF1bHQgOiBcIlwiXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyB1c2VyIGZvciB0cmFja2luZyB1c2FnZSBhbmFseXRpY3NcIlxuICAgICAgZ2l0UGF0aDpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiR2l0IFBhdGhcIlxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICAgIGRlZmF1bHQ6IFwiZ2l0XCJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSWYgZ2l0IGlzIG5vdCBpbiB5b3VyIFBBVEgsIHNwZWNpZnkgd2hlcmUgdGhlIGV4ZWN1dGFibGUgaXNcIlxuICAgICAgZW5hYmxlU3RhdHVzQmFySWNvbjpcbiAgICAgICAgb3JkZXI6IDRcbiAgICAgICAgdGl0bGU6IFwiU3RhdHVzLWJhciBQaW4gSWNvblwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIHBpbiBpY29uIGluIHRoZSBib3R0b20tcmlnaHQgb2YgdGhlIHN0YXR1cy1iYXIgdG9nZ2xlcyB0aGUgb3V0cHV0IHZpZXcgYWJvdmUgdGhlIHN0YXR1cy1iYXJcIlxuICAgICAgb3BlbkluUGFuZTpcbiAgICAgICAgb3JkZXI6IDVcbiAgICAgICAgdGl0bGU6IFwiQWxsb3cgY29tbWFuZHMgdG8gb3BlbiBuZXcgcGFuZXNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbW1hbmRzIGxpa2UgYENvbW1pdGAsIGBMb2dgLCBgU2hvd2AsIGBEaWZmYCBjYW4gYmUgc3BsaXQgaW50byBuZXcgcGFuZXNcIlxuICAgICAgc3BsaXRQYW5lOlxuICAgICAgICBvcmRlcjogNlxuICAgICAgICB0aXRsZTogXCJTcGxpdCBwYW5lIGRpcmVjdGlvblwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJEb3duXCJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiV2hlcmUgc2hvdWxkIG5ldyBwYW5lcyBnbz9cIlxuICAgICAgICBlbnVtOiBbXCJVcFwiLCBcIlJpZ2h0XCIsIFwiRG93blwiLCBcIkxlZnRcIl1cbiAgICAgIG1lc3NhZ2VUaW1lb3V0OlxuICAgICAgICBvcmRlcjogN1xuICAgICAgICB0aXRsZTogXCJPdXRwdXQgdmlldyB0aW1lb3V0XCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogNVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJGb3IgaG93IG1hbnkgc2Vjb25kcyBzaG91bGQgdGhlIG91dHB1dCB2aWV3IGFib3ZlIHRoZSBzdGF0dXMtYmFyIHN0YXkgb3Blbj9cIlxuICAgICAgc2hvd0Zvcm1hdDpcbiAgICAgICAgb3JkZXI6IDlcbiAgICAgICAgdGl0bGU6IFwiRm9ybWF0IG9wdGlvbiBmb3IgJ0dpdCBTaG93J1wiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJmdWxsXCJcbiAgICAgICAgZW51bTogW1wib25lbGluZVwiLCBcInNob3J0XCIsIFwibWVkaXVtXCIsIFwiZnVsbFwiLCBcImZ1bGxlclwiLCBcImVtYWlsXCIsIFwicmF3XCIsIFwibm9uZVwiXVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGljaCBmb3JtYXQgdG8gdXNlIGZvciBgZ2l0IHNob3dgPyAoYG5vbmVgIHdpbGwgdXNlIHlvdXIgZ2l0IGNvbmZpZyBkZWZhdWx0KVwiXG4gIGNvbW1pdHM6XG4gICAgb3JkZXI6IDJcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHZlcmJvc2VDb21taXRzOlxuICAgICAgICB0aXRsZTogXCJWZXJib3NlIENvbW1pdHNcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGRpZmZzIGluIGNvbW1pdCBwYW5lP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGRpZmZzOlxuICAgIG9yZGVyOiAzXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZjpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiSW5jbHVkZSBzdGFnZWQgZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgd29yZERpZmY6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIldvcmQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU2hvdWxkIGRpZmZzIGJlIGdlbmVyYXRlZCB3aXRoIHRoZSBgLS13b3JkLWRpZmZgIGZsYWc/XCJcbiAgICAgIHN5bnRheEhpZ2hsaWdodGluZzpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiRW5hYmxlIHN5bnRheCBoaWdobGlnaHRpbmcgaW4gZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICBsb2dzOlxuICAgIG9yZGVyOiA0XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBudW1iZXJPZkNvbW1pdHNUb1Nob3c6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIk51bWJlciBvZiBjb21taXRzIHRvIGxvYWRcIlxuICAgICAgICB0eXBlOiBcImludGVnZXJcIlxuICAgICAgICBkZWZhdWx0OiAyNVxuICAgICAgICBtaW5pbXVtOiAxXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkluaXRpYWwgYW1vdW50IG9mIGNvbW1pdHMgdG8gbG9hZCB3aGVuIHJ1bm5pbmcgdGhlIGBMb2dgIGNvbW1hbmRcIlxuICByZW1vdGVJbnRlcmFjdGlvbnM6XG4gICAgb3JkZXI6IDVcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHB1bGxSZWJhc2U6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgUmViYXNlXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHVsbCB3aXRoIGAtLXJlYmFzZWAgZmxhZz9cIlxuICAgICAgcHVsbEJlZm9yZVB1c2g6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgQmVmb3JlIFB1c2hpbmdcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJQdWxsIGZyb20gcmVtb3RlIGJlZm9yZSBwdXNoaW5nXCJcbiAgICAgIGFsd2F5c1B1bGxGcm9tVXBzdHJlYW06XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgRnJvbSBVcHN0cmVhbVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkFsd2F5cyBwdWxsIGZyb20gY3VycmVudCBicmFuY2ggdXBzdHJlYW0/XCJcbiAgZXhwZXJpbWVudGFsOlxuICAgIG9yZGVyOiA2XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBzdGFnZUZpbGVzQmV0YTpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiU3RhZ2UgRmlsZXMgQmV0YVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU3RhZ2UgYW5kIHVuc3RhZ2UgZmlsZXMgaW4gYSBzaW5nbGUgY29tbWFuZFwiXG4gICAgICBjdXN0b21Db21tYW5kczpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiQ3VzdG9tIENvbW1hbmRzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQWxsb3cgY3VzdG9tIGNvbW1hbmRzIHRvIGJlIGRlY2xhcmVkIGluIHlvdXIgYGluaXRgIGZpbGUgYW5kIHJ1biB3aXRoaW4gR2l0LXBsdXNcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gICMgQ2xlYW51cCB1c2VyJ3MgY29uZmlnLmNzb24gaWYgY29uZmlnIHByb3BlcnRpZXMgY2hhbmdlXG4gIGlmIHVzZXJDb25maWdzID0gYXRvbS5jb25maWcuZ2V0QWxsKCdnaXQtcGx1cycpWzBdPy52YWx1ZVxuICAgIE9iamVjdC5rZXlzKHVzZXJDb25maWdzKS5mb3JFYWNoIChrZXkpID0+XG4gICAgICBhdG9tLmNvbmZpZy51bnNldCBcImdpdC1wbHVzLiN7a2V5fVwiIGlmIG5vdCBjb25maWdzW2tleV1cblxuICBjb25maWdzXG4iXX0=
