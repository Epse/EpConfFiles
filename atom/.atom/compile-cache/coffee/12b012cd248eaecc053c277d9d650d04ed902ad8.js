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
    showFormatOption = atom.config.get('git-plus.showFormat');
    if (showFormatOption !== 'none') {
      args.push("--format=" + showFormatOption);
    }
    if (atom.config.get('git-plus.wordDiff')) {
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
    var disposables, splitDirection;
    disposables = new CompositeDisposable;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(showCommitFilePath(objectHash), {
      activatePane: true
    }).then(function(textBuffer) {
      if (textBuffer != null) {
        return disposables.add(textBuffer.onDidDestroy(function() {
          disposables.dispose();
          try {
            return fs.unlinkSync(showCommitFilePath(objectHash));
          } catch (error) {}
        }));
      }
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXNob3cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5SUFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFSixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQXlCLE9BQUEsQ0FBUSxzQkFBUixDQUF6QixFQUFDLG1DQUFELEVBQWlCOztFQUVqQixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sa0JBQUEsR0FBcUIsU0FBQyxVQUFEO1dBQ25CLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFWLEVBQTBCLFVBQUQsR0FBWSxPQUFyQztFQURtQjs7RUFHckIsT0FBQSxHQUFVLFNBQUMsTUFBRDtXQUFZLE1BQUEsS0FBVTtFQUF0Qjs7RUFFVixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixJQUFuQjtBQUNYLFFBQUE7SUFBQSxVQUFBLEdBQWdCLE9BQUEsQ0FBUSxVQUFSLENBQUgsR0FBMkIsTUFBM0IsR0FBdUM7SUFDcEQsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLGVBQVQ7SUFDUCxnQkFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCO0lBQ25CLElBQTRDLGdCQUFBLEtBQW9CLE1BQWhFO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFBLEdBQVksZ0JBQXRCLEVBQUE7O0lBQ0EsSUFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixDQUEzQjtNQUFBLElBQUksQ0FBQyxJQUFMLENB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QSxDQUFBLENBQUEsSUFBQSxDQUFmO09BQXRDLENBQWpCO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7UUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDckUsZ0JBQUE7WUFBQSxJQUFBLEdBQU8sS0FBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxPQUF2QixDQUFBLENBQWdDLENBQUMsS0FBakMsQ0FBdUMsR0FBdkMsQ0FBNEMsQ0FBQSxDQUFBO1lBQ25ELFVBQUEsQ0FBVyxLQUFDLENBQUEsSUFBWixFQUFrQixJQUFsQjttQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFBO1VBSHFFO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtPQUF0QyxDQUFqQjtJQVBVOzt3QkFZWixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7OytDQUNNLENBQUUsT0FBUixDQUFBO0lBRk87Ozs7S0FqQmE7O0VBcUJ4QixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLElBQW5CO0lBQ2YsSUFBTyxrQkFBUDthQUNNLElBQUEsU0FBQSxDQUFVLElBQVYsRUFETjtLQUFBLE1BQUE7YUFHRSxVQUFBLENBQVcsSUFBWCxFQUFpQixVQUFqQixFQUE2QixJQUE3QixFQUhGOztFQURlO0FBaEVqQiIsInNvdXJjZXNDb250ZW50IjpbIk9zID0gcmVxdWlyZSAnb3MnXG5QYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5zaG93Q29tbWl0RmlsZVBhdGggPSAob2JqZWN0SGFzaCkgLT5cbiAgUGF0aC5qb2luIE9zLnRtcERpcigpLCBcIiN7b2JqZWN0SGFzaH0uZGlmZlwiXG5cbmlzRW1wdHkgPSAoc3RyaW5nKSAtPiBzdHJpbmcgaXMgJydcblxuc2hvd09iamVjdCA9IChyZXBvLCBvYmplY3RIYXNoLCBmaWxlKSAtPlxuICBvYmplY3RIYXNoID0gaWYgaXNFbXB0eSBvYmplY3RIYXNoIHRoZW4gJ0hFQUQnIGVsc2Ugb2JqZWN0SGFzaFxuICBhcmdzID0gWydzaG93JywgJy0tY29sb3I9bmV2ZXInXVxuICBzaG93Rm9ybWF0T3B0aW9uID0gYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5zaG93Rm9ybWF0J1xuICBhcmdzLnB1c2ggXCItLWZvcm1hdD0je3Nob3dGb3JtYXRPcHRpb259XCIgaWYgc2hvd0Zvcm1hdE9wdGlvbiAhPSAnbm9uZSdcbiAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy53b3JkRGlmZidcbiAgYXJncy5wdXNoIG9iamVjdEhhc2hcbiAgYXJncy5wdXNoICctLScsIGZpbGUgaWYgZmlsZT9cblxuICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPiBwcmVwRmlsZShkYXRhLCBvYmplY3RIYXNoKSBpZiBkYXRhLmxlbmd0aCA+IDBcblxucHJlcEZpbGUgPSAodGV4dCwgb2JqZWN0SGFzaCkgLT5cbiAgZnMud3JpdGVGaWxlIHNob3dDb21taXRGaWxlUGF0aChvYmplY3RIYXNoKSwgdGV4dCwgZmxhZzogJ3crJywgKGVycikgLT5cbiAgICBpZiBlcnIgdGhlbiBub3RpZmllci5hZGRFcnJvciBlcnIgZWxzZSBzaG93RmlsZSBvYmplY3RIYXNoXG5cbnNob3dGaWxlID0gKG9iamVjdEhhc2gpIC0+XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5vcGVuSW5QYW5lJylcbiAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2VcbiAgICAub3BlbihzaG93Q29tbWl0RmlsZVBhdGgob2JqZWN0SGFzaCksIGFjdGl2YXRlUGFuZTogdHJ1ZSlcbiAgICAudGhlbiAodGV4dEJ1ZmZlcikgLT5cbiAgICAgIGlmIHRleHRCdWZmZXI/XG4gICAgICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0QnVmZmVyLm9uRGlkRGVzdHJveSAtPlxuICAgICAgICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgICAgIHRyeSBmcy51bmxpbmtTeW5jIHNob3dDb21taXRGaWxlUGF0aChvYmplY3RIYXNoKVxuXG5jbGFzcyBJbnB1dFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgPT5cbiAgICAgIEBzdWJ2aWV3ICdvYmplY3RIYXNoJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogJ0NvbW1pdCBoYXNoIHRvIHNob3cuIChEZWZhdWx0cyB0byBIRUFEKScpXG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvKSAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQG9iamVjdEhhc2guZm9jdXMoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjYW5jZWwnOiA9PiBAZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNvbmZpcm0nOiA9PlxuICAgICAgdGV4dCA9IEBvYmplY3RIYXNoLmdldE1vZGVsKCkuZ2V0VGV4dCgpLnNwbGl0KCcgJylbMF1cbiAgICAgIHNob3dPYmplY3QoQHJlcG8sIHRleHQpXG4gICAgICBAZGVzdHJveSgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIG9iamVjdEhhc2gsIGZpbGUpIC0+XG4gIGlmIG5vdCBvYmplY3RIYXNoP1xuICAgIG5ldyBJbnB1dFZpZXcocmVwbylcbiAgZWxzZVxuICAgIHNob3dPYmplY3QocmVwbywgb2JqZWN0SGFzaCwgZmlsZSlcbiJdfQ==
