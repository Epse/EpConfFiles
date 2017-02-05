(function() {
  var $$, ListView, SelectListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.args = ['checkout'];

    ListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      ListView.__super__.initialize.apply(this, arguments);
      this.addClass('git-branch');
      this.show();
      this.parseData();
      return this.currentPane = atom.workspace.getActivePane();
    };

    ListView.prototype.parseData = function() {
      var branches, i, item, items, len;
      items = this.data.split("\n");
      branches = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
      this.setItems(branches);
      return this.focusFilterEditor();
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg) {
      var current, name;
      name = arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('HEAD');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var name;
      name = arg.name;
      this.checkout(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.checkout = function(branch) {
      return git.cmd(this.args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(message) {
          notifier.addSuccess(message);
          atom.workspace.observeTextEditors(function(editor) {
            var error, filepath, path;
            try {
              path = editor.getPath();
              console.log("Git-plus: editor.getPath() returned '" + path + "'");
              if (filepath = path != null ? typeof path.toString === "function" ? path.toString() : void 0 : void 0) {
                return fs.exists(filepath, function(exists) {
                  if (!exists) {
                    return editor.destroy();
                  }
                });
              }
            } catch (error1) {
              error = error1;
              notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
              return console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139");
            }
          });
          git.refresh(_this.repo);
          return _this.currentPane.activate();
        };
      })(this))["catch"](function(err) {
        return notifier.addError(err);
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9icmFuY2gtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0RBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7dUJBQ0osSUFBQSxHQUFNLENBQUMsVUFBRDs7dUJBRU4sVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLElBQVI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQ2xCLDBDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLFlBQVY7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUE7SUFMTDs7dUJBT1osU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVo7TUFDUixRQUFBLEdBQVc7QUFDWCxXQUFBLHVDQUFBOztRQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7UUFDUCxJQUFPLElBQUEsS0FBUSxFQUFmO1VBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYztZQUFDLElBQUEsRUFBTSxJQUFQO1dBQWQsRUFERjs7QUFGRjtNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUs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b250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGFyZ3M6IFsnY2hlY2tvdXQnXVxuXG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEpIC0+XG4gICAgc3VwZXJcbiAgICBAYWRkQ2xhc3MoJ2dpdC1icmFuY2gnKVxuICAgIEBzaG93KClcbiAgICBAcGFyc2VEYXRhKClcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcblxuICBwYXJzZURhdGE6IC0+XG4gICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgIGJyYW5jaGVzID0gW11cbiAgICBmb3IgaXRlbSBpbiBpdGVtc1xuICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgdW5sZXNzIGl0ZW0gaXMgJydcbiAgICAgICAgYnJhbmNoZXMucHVzaCB7bmFtZTogaXRlbX1cbiAgICBAc2V0SXRlbXMgYnJhbmNoZXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgc2hvdzogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT4gQHBhbmVsPy5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICBjdXJyZW50ID0gZmFsc2VcbiAgICBpZiBuYW1lLnN0YXJ0c1dpdGggXCIqXCJcbiAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDEpXG4gICAgICBjdXJyZW50ID0gdHJ1ZVxuICAgICQkIC0+XG4gICAgICBAbGkgbmFtZSwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgIEBzcGFuKCdIRUFEJykgaWYgY3VycmVudFxuXG4gIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICBAY2hlY2tvdXQgbmFtZS5tYXRjaCgvXFwqPyguKikvKVsxXVxuICAgIEBjYW5jZWwoKVxuXG4gIGNoZWNrb3V0OiAoYnJhbmNoKSAtPlxuICAgIGdpdC5jbWQoQGFyZ3MuY29uY2F0KGJyYW5jaCksIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChtZXNzYWdlKSA9PlxuICAgICAgbm90aWZpZXIuYWRkU3VjY2VzcyBtZXNzYWdlXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkdpdC1wbHVzOiBlZGl0b3IuZ2V0UGF0aCgpIHJldHVybmVkICcje3BhdGh9J1wiXG4gICAgICAgICAgaWYgZmlsZXBhdGggPSBwYXRoPy50b1N0cmluZz8oKVxuICAgICAgICAgICAgZnMuZXhpc3RzIGZpbGVwYXRoLCAoZXhpc3RzKSA9PlxuICAgICAgICAgICAgICBlZGl0b3IuZGVzdHJveSgpIGlmIG5vdCBleGlzdHNcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBub3RpZmllci5hZGRXYXJuaW5nIFwiVGhlcmUgd2FzIGFuIGVycm9yIGNsb3Npbmcgd2luZG93cyBmb3Igbm9uLWV4aXN0aW5nIGZpbGVzIGFmdGVyIHRoZSBjaGVja291dC4gUGxlYXNlIGNoZWNrIHRoZSBkZXYgY29uc29sZS5cIlxuICAgICAgICAgIGNvbnNvbGUuaW5mbyBcIkdpdC1wbHVzOiBwbGVhc2UgdGFrZSBhIHNjcmVlbnNob3Qgb2Ygd2hhdCBoYXMgYmVlbiBwcmludGVkIGluIHRoZSBjb25zb2xlIGFuZCBhZGQgaXQgdG8gdGhlIGlzc3VlIG9uIGdpdGh1YiBhdCBodHRwczovL2dpdGh1Yi5jb20vYWtvbndpL2dpdC1wbHVzL2lzc3Vlcy8xMzlcIlxuICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIEBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG4gICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICBub3RpZmllci5hZGRFcnJvciBlcnJcbiJdfQ==
