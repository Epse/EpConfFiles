(function() {
  var GitRun, git, repo;

  git = require('../lib/git');

  GitRun = require('../lib/models/git-run');

  repo = require('./fixtures').repo;

  describe("Git-Plus service", function() {
    var service;
    service = null;
    beforeEach(function() {
      atom.config.set('git-plus.experimental.customCommands', true);
      return service = require('../lib/service');
    });
    describe("registerCommand", function() {
      return it("registers the given command with atom and saves it for the Git-Plus command palette", function() {
        var command, fn;
        fn = function() {};
        service.registerCommand('some-element', 'foobar:do-cool-stuff', fn);
        command = service.getCustomCommands()[0];
        expect(command[0]).toBe('foobar:do-cool-stuff');
        expect(command[1]).toBe('Do Cool Stuff');
        return expect(command[2]).toBe(fn);
      });
    });
    describe("::getRepo", function() {
      return it("is the getRepo function", function() {
        return expect(git.getRepo).toBe(service.getRepo);
      });
    });
    return describe("::run", function() {
      return it("is the GitRun function", function() {
        return expect(GitRun).toBe(service.run);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvc2VydmljZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxZQUFSOztFQUNOLE1BQUEsR0FBUyxPQUFBLENBQVEsdUJBQVI7O0VBQ1IsT0FBUSxPQUFBLENBQVEsWUFBUjs7RUFFVCxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0NBQWhCLEVBQXdELElBQXhEO2FBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUjtJQUZELENBQVg7SUFJQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTthQUMxQixFQUFBLENBQUcscUZBQUgsRUFBMEYsU0FBQTtBQUN4RixZQUFBO1FBQUEsRUFBQSxHQUFLLFNBQUEsR0FBQTtRQUNMLE9BQU8sQ0FBQyxlQUFSLENBQXdCLGNBQXhCLEVBQXdDLHNCQUF4QyxFQUFnRSxFQUFoRTtRQUNBLE9BQUEsR0FBVSxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQUE0QixDQUFBLENBQUE7UUFDdEMsTUFBQSxDQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixzQkFBeEI7UUFDQSxNQUFBLENBQU8sT0FBUSxDQUFBLENBQUEsQ0FBZixDQUFrQixDQUFDLElBQW5CLENBQXdCLGVBQXhCO2VBQ0EsTUFBQSxDQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixFQUF4QjtNQU53RixDQUExRjtJQUQwQixDQUE1QjtJQVNBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7YUFDcEIsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7ZUFDNUIsTUFBQSxDQUFPLEdBQUcsQ0FBQyxPQUFYLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsT0FBTyxDQUFDLE9BQWpDO01BRDRCLENBQTlCO0lBRG9CLENBQXRCO1dBSUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQTthQUNoQixFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtlQUMzQixNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsSUFBZixDQUFvQixPQUFPLENBQUMsR0FBNUI7TUFEMkIsQ0FBN0I7SUFEZ0IsQ0FBbEI7RUFwQjJCLENBQTdCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9saWIvZ2l0J1xuR2l0UnVuID0gcmVxdWlyZSAnLi4vbGliL21vZGVscy9naXQtcnVuJ1xue3JlcG99ID0gcmVxdWlyZSAnLi9maXh0dXJlcydcblxuZGVzY3JpYmUgXCJHaXQtUGx1cyBzZXJ2aWNlXCIsIC0+XG4gIHNlcnZpY2UgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLmN1c3RvbUNvbW1hbmRzJywgdHJ1ZSlcbiAgICBzZXJ2aWNlID0gcmVxdWlyZSAnLi4vbGliL3NlcnZpY2UnXG5cbiAgZGVzY3JpYmUgXCJyZWdpc3RlckNvbW1hbmRcIiwgLT5cbiAgICBpdCBcInJlZ2lzdGVycyB0aGUgZ2l2ZW4gY29tbWFuZCB3aXRoIGF0b20gYW5kIHNhdmVzIGl0IGZvciB0aGUgR2l0LVBsdXMgY29tbWFuZCBwYWxldHRlXCIsIC0+XG4gICAgICBmbiA9ICgpIC0+XG4gICAgICBzZXJ2aWNlLnJlZ2lzdGVyQ29tbWFuZCgnc29tZS1lbGVtZW50JywgJ2Zvb2Jhcjpkby1jb29sLXN0dWZmJywgZm4pXG4gICAgICBjb21tYW5kID0gc2VydmljZS5nZXRDdXN0b21Db21tYW5kcygpWzBdXG4gICAgICBleHBlY3QoY29tbWFuZFswXSkudG9CZSAnZm9vYmFyOmRvLWNvb2wtc3R1ZmYnXG4gICAgICBleHBlY3QoY29tbWFuZFsxXSkudG9CZSAnRG8gQ29vbCBTdHVmZidcbiAgICAgIGV4cGVjdChjb21tYW5kWzJdKS50b0JlIGZuXG5cbiAgZGVzY3JpYmUgXCI6OmdldFJlcG9cIiwgLT5cbiAgICBpdCBcImlzIHRoZSBnZXRSZXBvIGZ1bmN0aW9uXCIsIC0+XG4gICAgICBleHBlY3QoZ2l0LmdldFJlcG8pLnRvQmUgc2VydmljZS5nZXRSZXBvXG5cbiAgZGVzY3JpYmUgXCI6OnJ1blwiLCAtPlxuICAgIGl0IFwiaXMgdGhlIEdpdFJ1biBmdW5jdGlvblwiLCAtPlxuICAgICAgZXhwZWN0KEdpdFJ1bikudG9CZSBzZXJ2aWNlLnJ1blxuIl19
