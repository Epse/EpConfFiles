(function() {
  var CompositeDisposable, InputView, Os, Path, TextEditorView, View, fs, git, isEmpty, prepFile, ref, showCommitFilePath, showFile, showObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  showCommitFilePath = function(objectHash) {
    return Path.join(Os.tmpDir(), objectHash + ".diff");
  };

  isEmpty = function(string) {
    return string === '';
  };

  showObject = function(repo, objectHash, file) {
    var args, showFormatOption;
    objectHash = isEmpty(objectHash) ? 'HEAD' : objectHash;
    args = ['show', '--color=never'];
    showFormatOption = atom.config.get('git-plus.general.showFormat');
    if (showFormatOption !== 'none') {
      args.push("--format=" + showFormatOption);
    }
    if (atom.config.get('git-plus.diffs.wordDiff')) {
      args.push('--word-diff');
    }
    args.push(objectHash);
    if (file != null) {
      args.push('--', file);
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      if (data.length > 0) {
        return prepFile(data, objectHash);
      }
    });
  };

  prepFile = function(text, objectHash) {
    return fs.writeFile(showCommitFilePath(objectHash), text, {
      flag: 'w+'
    }, function(err) {
      if (err) {
        return notifier.addError(err);
      } else {
        return showFile(objectHash);
      }
    });
  };

  showFile = function(objectHash) {
    var disposables, editorForDiffs, filePath, splitDirection;
    filePath = showCommitFilePath(objectHash);
    disposables = new CompositeDisposable;
    editorForDiffs = atom.workspace.getPaneItems().filter(function(item) {
      var ref1;
      return (ref1 = item.getURI()) != null ? ref1.includes('.diff') : void 0;
    })[0];
    if (editorForDiffs != null) {
      return editorForDiffs.setText(fs.readFileSync(filePath, {
        encoding: 'utf-8'
      }));
    } else {
      if (atom.config.get('git-plus.general.openInPane')) {
        splitDirection = atom.config.get('git-plus.general.splitPane');
        atom.workspace.getActivePane()["split" + splitDirection]();
      }
      return atom.workspace.open(filePath, {
        pending: true,
        activatePane: true
      }).then(function(textBuffer) {
        if (textBuffer != null) {
          return disposables.add(textBuffer.onDidDestroy(function() {
            disposables.dispose();
            try {
              return fs.unlinkSync(filePath);
            } catch (error) {}
          }));
        }
      });
    }
  };

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('objectHash', new TextEditorView({
            mini: true,
            placeholderText: 'Commit hash to show. (Defaults to HEAD)'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.objectHash.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:confirm': (function(_this) {
          return function() {
            var text;
            text = _this.objectHash.getModel().getText().split(' ')[0];
            showObject(_this.repo, text);
            return _this.destroy();
          };
        })(this)
      }));
    };

    InputView.prototype.destroy = function() {
      var ref1, ref2;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return (ref2 = this.panel) != null ? ref2.destroy() : void 0;
    };

    return InputView;

  })(View);

  module.exports = function(repo, objectHash, file) {
    if (objectHash == null) {
      return new InputView(repo);
    } else {
      return showObject(repo, objectHash, file);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXNob3cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5SUFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFSixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQXlCLE9BQUEsQ0FBUSxzQkFBUixDQUF6QixFQUFDLG1DQUFELEVBQWlCOztFQUVqQixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sa0JBQUEsR0FBcUIsU0FBQyxVQUFEO1dBQ25CLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFWLEVBQTBCLFVBQUQsR0FBWSxPQUFyQztFQURtQjs7RUFHckIsT0FBQSxHQUFVLFNBQUMsTUFBRDtXQUFZLE1BQUEsS0FBVTtFQUF0Qjs7RUFFVixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixJQUFuQjtBQUNYLFFBQUE7SUFBQSxVQUFBLEdBQWdCLE9BQUEsQ0FBUSxVQUFSLENBQUgsR0FBMkIsTUFBM0IsR0FBdUM7SUFDcEQsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLGVBQVQ7SUFDUCxnQkFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCO0lBQ25CLElBQTRDLGdCQUFBLEtBQW9CLE1BQWhFO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFBLEdBQVksZ0JBQXRCLEVBQUE7O0lBQ0EsSUFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUEzQjtNQUFBLElBQUksQ0FBQyxJQUFMLENB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QTthQUdFLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCLElBQTdCLEVBSEY7O0VBRGU7QUFyRWpCIiwic291cmNlc0NvbnRlbnQiOlsiT3MgPSByZXF1aXJlICdvcydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1RleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbnNob3dDb21taXRGaWxlUGF0aCA9IChvYmplY3RIYXNoKSAtPlxuICBQYXRoLmpvaW4gT3MudG1wRGlyKCksIFwiI3tvYmplY3RIYXNofS5kaWZmXCJcblxuaXNFbXB0eSA9IChzdHJpbmcpIC0+IHN0cmluZyBpcyAnJ1xuXG5zaG93T2JqZWN0ID0gKHJlcG8sIG9iamVjdEhhc2gsIGZpbGUpIC0+XG4gIG9iamVjdEhhc2ggPSBpZiBpc0VtcHR5IG9iamVjdEhhc2ggdGhlbiAnSEVBRCcgZWxzZSBvYmplY3RIYXNoXG4gIGFyZ3MgPSBbJ3Nob3cnLCAnLS1jb2xvcj1uZXZlciddXG4gIHNob3dGb3JtYXRPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLmdlbmVyYWwuc2hvd0Zvcm1hdCdcbiAgYXJncy5wdXNoIFwiLS1mb3JtYXQ9I3tzaG93Rm9ybWF0T3B0aW9ufVwiIGlmIHNob3dGb3JtYXRPcHRpb24gIT0gJ25vbmUnXG4gIGFyZ3MucHVzaCAnLS13b3JkLWRpZmYnIGlmIGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMud29yZERpZmYnXG4gIGFyZ3MucHVzaCBvYmplY3RIYXNoXG4gIGFyZ3MucHVzaCAnLS0nLCBmaWxlIGlmIGZpbGU/XG5cbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT4gcHJlcEZpbGUoZGF0YSwgb2JqZWN0SGFzaCkgaWYgZGF0YS5sZW5ndGggPiAwXG5cbnByZXBGaWxlID0gKHRleHQsIG9iamVjdEhhc2gpIC0+XG4gIGZzLndyaXRlRmlsZSBzaG93Q29tbWl0RmlsZVBhdGgob2JqZWN0SGFzaCksIHRleHQsIGZsYWc6ICd3KycsIChlcnIpIC0+XG4gICAgaWYgZXJyIHRoZW4gbm90aWZpZXIuYWRkRXJyb3IgZXJyIGVsc2Ugc2hvd0ZpbGUgb2JqZWN0SGFzaFxuXG5zaG93RmlsZSA9IChvYmplY3RIYXNoKSAtPlxuICBmaWxlUGF0aCA9IHNob3dDb21taXRGaWxlUGF0aChvYmplY3RIYXNoKVxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIGVkaXRvckZvckRpZmZzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkuZmlsdGVyKChpdGVtKSAtPiBpdGVtLmdldFVSSSgpPy5pbmNsdWRlcygnLmRpZmYnKSlbMF1cbiAgaWYgZWRpdG9yRm9yRGlmZnM/XG4gICAgZWRpdG9yRm9yRGlmZnMuc2V0VGV4dCBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIGVuY29kaW5nOiAndXRmLTgnKVxuICBlbHNlXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICAgIGF0b20ud29ya3NwYWNlXG4gICAgICAub3BlbihmaWxlUGF0aCwgcGVuZGluZzogdHJ1ZSwgYWN0aXZhdGVQYW5lOiB0cnVlKVxuICAgICAgLnRoZW4gKHRleHRCdWZmZXIpIC0+XG4gICAgICAgIGlmIHRleHRCdWZmZXI/XG4gICAgICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRCdWZmZXIub25EaWREZXN0cm95IC0+XG4gICAgICAgICAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgICAgICAgIHRyeSBmcy51bmxpbmtTeW5jIGZpbGVQYXRoXG5cbmNsYXNzIElucHV0VmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiA9PlxuICAgICAgQHN1YnZpZXcgJ29iamVjdEhhc2gnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnQ29tbWl0IGhhc2ggdG8gc2hvdy4gKERlZmF1bHRzIHRvIEhFQUQpJylcblxuICBpbml0aWFsaXplOiAoQHJlcG8pIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAb2JqZWN0SGFzaC5mb2N1cygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCc6ID0+IEBkZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y29uZmlybSc6ID0+XG4gICAgICB0ZXh0ID0gQG9iamVjdEhhc2guZ2V0TW9kZWwoKS5nZXRUZXh0KCkuc3BsaXQoJyAnKVswXVxuICAgICAgc2hvd09iamVjdChAcmVwbywgdGV4dClcbiAgICAgIEBkZXN0cm95KClcblxuICBkZXN0cm95OiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQHBhbmVsPy5kZXN0cm95KClcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywgb2JqZWN0SGFzaCwgZmlsZSkgLT5cbiAgaWYgbm90IG9iamVjdEhhc2g/XG4gICAgbmV3IElucHV0VmlldyhyZXBvKVxuICBlbHNlXG4gICAgc2hvd09iamVjdChyZXBvLCBvYmplY3RIYXNoLCBmaWxlKVxuIl19
