(function() {
  var BranchListView, DeleteBranchListView, git, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  module.exports = DeleteBranchListView = (function(superClass) {
    extend(DeleteBranchListView, superClass);

    function DeleteBranchListView() {
      return DeleteBranchListView.__super__.constructor.apply(this, arguments);
    }

    DeleteBranchListView.prototype.initialize = function(repo, data, arg) {
      this.repo = repo;
      this.data = data;
      this.isRemote = (arg != null ? arg : {}).isRemote;
      return DeleteBranchListView.__super__.initialize.apply(this, arguments);
    };

    DeleteBranchListView.prototype.confirmed = function(arg) {
      var branch, name, remote;
      name = arg.name;
      if (name.startsWith("*")) {
        name = name.slice(1);
      }
      if (!this.isRemote) {
        this["delete"](name);
      } else {
        branch = name.substring(name.indexOf('/') + 1);
        remote = name.substring(0, name.indexOf('/'));
        this["delete"](branch, remote);
      }
      return this.cancel();
    };

    DeleteBranchListView.prototype["delete"] = function(branch, remote) {
      var args, notification;
      notification = notifier.addInfo("Deleting remote branch " + branch, {
        dismissable: true
      });
      args = remote ? ['push', remote, '--delete'] : ['branch', '-D'];
      return git.cmd(args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(message) {
        notification.dismiss();
        return notifier.addSuccess(message);
      })["catch"](function(error) {
        notification.dismiss();
        return notifier.addError(error);
      });
    };

    return DeleteBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9kZWxldGUtYnJhbmNoLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtREFBQTtJQUFBOzs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNROzs7Ozs7O21DQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxJQUFSLEVBQWUsR0FBZjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7TUFBUSxJQUFDLENBQUEsMEJBQUYsTUFBWSxJQUFWO2FBQWlCLHNEQUFBLFNBQUE7SUFBbEM7O21DQUVaLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQXdCLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBQXhCO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFQOztNQUNBLElBQUEsQ0FBTyxJQUFDLENBQUEsUUFBUjtRQUNFLElBQUMsRUFBQSxNQUFBLEVBQUQsQ0FBUSxJQUFSLEVBREY7T0FBQSxNQUFBO1FBR0UsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQUEsR0FBb0IsQ0FBbkM7UUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFsQjtRQUNULElBQUMsRUFBQSxNQUFBLEVBQUQsQ0FBUSxNQUFSLEVBQWdCLE1BQWhCLEVBTEY7O2FBTUEsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQVJTOztvQ0FVWCxRQUFBLEdBQVEsU0FBQyxNQUFELEVBQVMsTUFBVDtBQUNOLFVBQUE7TUFBQSxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIseUJBQUEsR0FBMEIsTUFBM0MsRUFBcUQ7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUFyRDtNQUNmLElBQUEsR0FBVSxNQUFILEdBQWUsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixVQUFqQixDQUFmLEdBQWlELENBQUMsUUFBRCxFQUFXLElBQVg7YUFDeEQsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosQ0FBUixFQUE2QjtRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUE3QixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsT0FBRDtRQUNKLFlBQVksQ0FBQyxPQUFiLENBQUE7ZUFDQSxRQUFRLENBQUMsVUFBVCxDQUFvQixPQUFwQjtNQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtRQUNMLFlBQVksQ0FBQyxPQUFiLENBQUE7ZUFDQSxRQUFRLENBQUMsUUFBVCxDQUFrQixLQUFsQjtNQUZLLENBSlA7SUFITTs7OztLQWJ5QjtBQUxyQyIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5CcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vYnJhbmNoLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjbGFzcyBEZWxldGVCcmFuY2hMaXN0VmlldyBleHRlbmRzIEJyYW5jaExpc3RWaWV3XG4gICAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwge0Bpc1JlbW90ZX09e30pIC0+IHN1cGVyXG5cbiAgICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgICBuYW1lID0gbmFtZS5zbGljZSgxKSBpZiBuYW1lLnN0YXJ0c1dpdGggXCIqXCJcbiAgICAgIHVubGVzcyBAaXNSZW1vdGVcbiAgICAgICAgQGRlbGV0ZSBuYW1lXG4gICAgICBlbHNlXG4gICAgICAgIGJyYW5jaCA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgICAgcmVtb3RlID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5pbmRleE9mKCcvJykpXG4gICAgICAgIEBkZWxldGUgYnJhbmNoLCByZW1vdGVcbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgZGVsZXRlOiAoYnJhbmNoLCByZW1vdGUpIC0+XG4gICAgICBub3RpZmljYXRpb24gPSBub3RpZmllci5hZGRJbmZvIFwiRGVsZXRpbmcgcmVtb3RlIGJyYW5jaCAje2JyYW5jaH1cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGFyZ3MgPSBpZiByZW1vdGUgdGhlbiBbJ3B1c2gnLCByZW1vdGUsICctLWRlbGV0ZSddIGVsc2UgWydicmFuY2gnLCAnLUQnXVxuICAgICAgZ2l0LmNtZChhcmdzLmNvbmNhdChicmFuY2gpLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChtZXNzYWdlKSAtPlxuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgbWVzc2FnZVxuICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgICBub3RpZmllci5hZGRFcnJvciBlcnJvclxuIl19
