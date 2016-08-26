(function() {
  var GitBridge, ResolverView, util,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ResolverView = require('../../lib/view/resolver-view').ResolverView;

  GitBridge = require('../../lib/git-bridge').GitBridge;

  util = require('../util');

  describe('ResolverView', function() {
    var fakeEditor, pkg, state, view, _ref;
    _ref = [], view = _ref[0], fakeEditor = _ref[1], pkg = _ref[2];
    state = {
      repo: {
        getWorkingDirectory: function() {
          return "/fake/gitroot/";
        },
        relativize: function(filepath) {
          return filepath.slice("/fake/gitroot/".length);
        }
      }
    };
    beforeEach(function() {
      var done;
      pkg = util.pkgEmitter();
      fakeEditor = {
        isModified: function() {
          return true;
        },
        getURI: function() {
          return '/fake/gitroot/lib/file1.txt';
        },
        save: function() {},
        onDidSave: function() {}
      };
      atom.config.set('merge-conflicts.gitPath', 'git');
      done = false;
      GitBridge.locateGitAnd(function(err) {
        if (err != null) {
          throw err;
        }
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      GitBridge.process = function(_arg) {
        var exit, stdout;
        stdout = _arg.stdout, exit = _arg.exit;
        stdout('UU lib/file1.txt');
        exit(0);
        return {
          process: {
            on: function(err) {}
          }
        };
      };
      return view = new ResolverView(fakeEditor, state, pkg);
    });
    it('begins needing both saving and staging', function() {
      view.refresh();
      return expect(view.actionText.text()).toBe('Save and stage');
    });
    it('shows if the file only needs staged', function() {
      fakeEditor.isModified = function() {
        return false;
      };
      view.refresh();
      return expect(view.actionText.text()).toBe('Stage');
    });
    return it('saves and stages the file', function() {
      var a, c, o, _ref1;
      _ref1 = [], c = _ref1[0], a = _ref1[1], o = _ref1[2];
      GitBridge.process = function(_arg) {
        var args, command, exit, options, stdout, _ref2;
        command = _arg.command, args = _arg.args, options = _arg.options, stdout = _arg.stdout, exit = _arg.exit;
        if (__indexOf.call(args, 'add') >= 0) {
          _ref2 = [command, args, options], c = _ref2[0], a = _ref2[1], o = _ref2[2];
          exit(0);
        }
        if (__indexOf.call(args, 'status') >= 0) {
          stdout('M  lib/file1.txt');
          exit(0);
        }
        return {
          process: {
            on: function(err) {}
          }
        };
      };
      spyOn(fakeEditor, 'save');
      view.resolve();
      expect(fakeEditor.save).toHaveBeenCalled();
      expect(c).toBe('git');
      expect(a).toEqual(['add', 'lib/file1.txt']);
      return expect(o).toEqual({
        cwd: state.repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy92aWV3L3Jlc29sdmVyLXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkJBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLGVBQWdCLE9BQUEsQ0FBUSw4QkFBUixFQUFoQixZQUFELENBQUE7O0FBQUEsRUFFQyxZQUFhLE9BQUEsQ0FBUSxzQkFBUixFQUFiLFNBRkQsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUhQLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxrQ0FBQTtBQUFBLElBQUEsT0FBMEIsRUFBMUIsRUFBQyxjQUFELEVBQU8sb0JBQVAsRUFBbUIsYUFBbkIsQ0FBQTtBQUFBLElBRUEsS0FBQSxHQUNFO0FBQUEsTUFBQSxJQUFBLEVBQ0U7QUFBQSxRQUFBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTtpQkFBRyxpQkFBSDtRQUFBLENBQXJCO0FBQUEsUUFDQSxVQUFBLEVBQVksU0FBQyxRQUFELEdBQUE7aUJBQWMsUUFBUyxnQ0FBdkI7UUFBQSxDQURaO09BREY7S0FIRixDQUFBO0FBQUEsSUFPQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFOLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYTtBQUFBLFFBQ1gsVUFBQSxFQUFZLFNBQUEsR0FBQTtpQkFBRyxLQUFIO1FBQUEsQ0FERDtBQUFBLFFBRVgsTUFBQSxFQUFRLFNBQUEsR0FBQTtpQkFBRyw4QkFBSDtRQUFBLENBRkc7QUFBQSxRQUdYLElBQUEsRUFBTSxTQUFBLEdBQUEs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

//# sourceURL=/home/epse/.atom/packages/merge-conflicts/spec/view/resolver-view-spec.coffee
