(function() {
  var DjangoTemplates;

  DjangoTemplates = (function() {
    function DjangoTemplates() {}

    DjangoTemplates.prototype.desc = "defaultToDjangoTemplatesForFilePathsContaining";

    DjangoTemplates.prototype.configKey = "django-templates." + DjangoTemplates.prototype.desc;

    DjangoTemplates.prototype.config = {
      defaultToDjangoTemplatesForFilePathsContaining: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      }
    };

    DjangoTemplates.prototype.activate = function(state) {
      return this.watchEditors();
    };

    DjangoTemplates.prototype.watchEditors = function() {
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var frag, grammar, matches, path, _i, _len, _ref;
          path = editor.getPath();
          if (path) {
            if (path.indexOf('.html') !== -1) {
              matches = false;
              _ref = atom.config.get(_this.configKey);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                frag = _ref[_i];
                if (path.indexOf(frag)) {
                  matches = true;
                  break;
                }
              }
              if (matches) {
                grammar = atom.grammars.grammarForScopeName('text.html.django');
                return editor.setGrammar(grammar);
              }
            }
          }
        };
      })(this));
    };

    return DjangoTemplates;

  })();

  module.exports = new DjangoTemplates;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9kamFuZ28tdGVtcGxhdGVzL2RqYW5nby10ZW1wbGF0ZXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7O0FBQUEsRUFBTTtpQ0FDSjs7QUFBQSw4QkFBQSxJQUFBLEdBQU0sZ0RBQU4sQ0FBQTs7QUFBQSw4QkFFQSxTQUFBLEdBQVksbUJBQUEsR0FBYixlQUFlLENBQUMsU0FBUyxDQUFDLElBRnpCLENBQUE7O0FBQUEsOEJBSUEsTUFBQSxHQUNFO0FBQUEsTUFBQSw4Q0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtPQURGO0tBTEYsQ0FBQTs7QUFBQSw4QkFXQSxRQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsWUFBRCxDQUFBLEVBRFE7SUFBQSxDQVhWLENBQUE7O0FBQUEsOEJBY0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLGNBQUEsNENBQUE7QUFBQSxVQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBQTtBQUNBLFVBQUEsSUFBRyxJQUFIO0FBQ0UsWUFBQSxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUFBLEtBQTJCLENBQUEsQ0FBOUI7QUFDRSxjQUFBLE9BQUEsR0FBVSxLQUFWLENBQUE7QUFDQTtBQUFBLG1CQUFBLDJDQUFBO2dDQUFBO0FBQ0UsZ0JBQUEsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsQ0FBSDtBQUNFLGtCQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFDQSx3QkFGRjtpQkFERjtBQUFBLGVBREE7QUFLQSxjQUFBLElBQUcsT0FBSDtBQUNFLGdCQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGtCQUFsQyxDQUFWLENBQUE7dUJBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEIsRUFGRjtlQU5GO2FBREY7V0FGZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQURZO0lBQUEsQ0FkZCxDQUFBOzsyQkFBQTs7TUFERixDQUFBOztBQUFBLEVBNkJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEdBQUEsQ0FBQSxlQTdCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/django-templates/django-templates.coffee
