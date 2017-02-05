(function() {
  var BranchListView, OutputViewManager, PullBranchListView, branchFilter, git, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  branchFilter = function(item) {
    return item !== '' && item.indexOf('origin/HEAD') < 0;
  };

  module.exports = PullBranchListView = (function(superClass) {
    extend(PullBranchListView, superClass);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data1, remote, extraArgs) {
      this.repo = repo;
      this.data = data1;
      this.remote = remote;
      this.extraArgs = extraArgs;
      PullBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PullBranchListView.prototype.parseData = function() {
      var branches, currentBranch, items;
      this.currentBranchString = '== Current ==';
      currentBranch = {
        name: this.currentBranchString
      };
      items = this.data.split("\n");
      branches = items.filter(branchFilter).map(function(item) {
        return {
          name: item.replace(/\s/g, '')
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems([currentBranch].concat(branches));
      }
      return this.focusFilterEditor();
    };

    PullBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
      if (name === this.currentBranchString) {
        this.pull();
      } else {
        this.pull(name.substring(name.indexOf('/') + 1));
      }
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var args, startMessage, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve();
          view.setContent(data).finish();
          return startMessage.dismiss();
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9wdWxsLWJyYW5jaC1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrRkFBQTtJQUFBOzs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04saUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBRWpCLFlBQUEsR0FBZSxTQUFDLElBQUQ7V0FBVSxJQUFBLEtBQVUsRUFBVixJQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLGFBQWIsQ0FBQSxHQUE4QjtFQUF6RDs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUdROzs7Ozs7O2lDQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSLEVBQWUsTUFBZixFQUF3QixTQUF4QjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxZQUFEO01BQ2xDLG9EQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtVQUNwQixLQUFDLENBQUEsT0FBRCxHQUFXO2lCQUNYLEtBQUMsQ0FBQSxNQUFELEdBQVU7UUFGVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUZKOztpQ0FNWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFDLENBQUEsbUJBQUQsR0FBdUI7TUFDdkIsYUFBQSxHQUNFO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxtQkFBUDs7TUFDRixLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWjtNQUNSLFFBQUEsR0FBVyxLQUFLLENBQUMsTUFBTixDQUFhLFlBQWIsQ0FBMEIsQ0FBQyxHQUEzQixDQUErQixTQUFDLElBQUQ7ZUFBVTtVQUFDLElBQUEsRUFBTSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBUDs7TUFBVixDQUEvQjtNQUNYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLFFBQVMsQ0FBQSxDQUFBLENBQXBCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLGFBQUQsQ0FBZSxDQUFDLE1BQWhCLENBQXVCLFFBQXZCLENBQVYsRUFIRjs7YUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVZTOztpQ0FZWCxTQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1QsVUFBQTtNQURXLE9BQUQ7TUFDVixJQUFHLElBQUEsS0FBUSxJQUFDLENBQUEsbUJBQVo7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEdBQW9CLENBQW5DLENBQU4sRUFIRjs7YUFJQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBTFM7O2lDQU9YLElBQUEsR0FBTSxTQUFDLFlBQUQ7QUFDSixVQUFBOztRQURLLGVBQWE7O01BQ2xCLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO01BQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBL0I7TUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxTQUFqQixFQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsWUFBckMsQ0FBa0QsQ0FBQyxNQUFuRCxDQUEwRCxTQUFDLEdBQUQ7ZUFBUyxHQUFBLEtBQVM7TUFBbEIsQ0FBMUQ7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUFkLEVBQWdEO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNKLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFDQSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUhJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUdMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTtpQkFDQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSks7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFA7SUFKSTs7OztLQTFCeUI7QUFWbkMiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuL2JyYW5jaC1saXN0LXZpZXcnXG5cbmJyYW5jaEZpbHRlciA9IChpdGVtKSAtPiBpdGVtIGlzbnQgJycgYW5kIGl0ZW0uaW5kZXhPZignb3JpZ2luL0hFQUQnKSA8IDBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIEV4dGVuc2lvbiBvZiBCcmFuY2hMaXN0Vmlld1xuICAjIFRha2VzIHRoZSBuYW1lIG9mIHRoZSByZW1vdGUgdG8gcHVsbCBmcm9tXG4gIGNsYXNzIFB1bGxCcmFuY2hMaXN0VmlldyBleHRlbmRzIEJyYW5jaExpc3RWaWV3XG4gICAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwgQHJlbW90ZSwgQGV4dHJhQXJncykgLT5cbiAgICAgIHN1cGVyXG4gICAgICBAcmVzdWx0ID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgQHJlc29sdmUgPSByZXNvbHZlXG4gICAgICAgIEByZWplY3QgPSByZWplY3RcblxuICAgIHBhcnNlRGF0YTogLT5cbiAgICAgIEBjdXJyZW50QnJhbmNoU3RyaW5nID0gJz09IEN1cnJlbnQgPT0nXG4gICAgICBjdXJyZW50QnJhbmNoID1cbiAgICAgICAgbmFtZTogQGN1cnJlbnRCcmFuY2hTdHJpbmdcbiAgICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIilcbiAgICAgIGJyYW5jaGVzID0gaXRlbXMuZmlsdGVyKGJyYW5jaEZpbHRlcikubWFwIChpdGVtKSAtPiB7bmFtZTogaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpfVxuICAgICAgaWYgYnJhbmNoZXMubGVuZ3RoIGlzIDFcbiAgICAgICAgQGNvbmZpcm1lZCBicmFuY2hlc1swXVxuICAgICAgZWxzZVxuICAgICAgICBAc2V0SXRlbXMgW2N1cnJlbnRCcmFuY2hdLmNvbmNhdCBicmFuY2hlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICAgIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICAgIGlmIG5hbWUgaXMgQGN1cnJlbnRCcmFuY2hTdHJpbmdcbiAgICAgICAgQHB1bGwoKVxuICAgICAgZWxzZVxuICAgICAgICBAcHVsbCBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICBAY2FuY2VsKClcblxuICAgIHB1bGw6IChyZW1vdGVCcmFuY2g9JycpIC0+XG4gICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBhcmdzID0gWydwdWxsJ10uY29uY2F0KEBleHRyYUFyZ3MsIEByZW1vdGUsIHJlbW90ZUJyYW5jaCkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBAcmVzb2x2ZSgpXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAjIyBTaG91bGQgQHJlc3VsdCBiZSByZWplY3RlZCBmb3IgdGhvc2UgZGVwZW5kaW5nIG9uIHRoaXMgdmlldz9cbiAgICAgICAgIyBAcmVqZWN0KClcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGVycm9yKS5maW5pc2goKVxuICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
