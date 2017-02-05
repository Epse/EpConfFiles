(function() {
  var GitMerge, git, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitMerge = require('../../lib/models/git-merge');

  describe("GitMerge", function() {
    describe("when called with no options", function() {
      return it("calls git.cmd with 'branch'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(''));
        GitMerge(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['branch'], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
    return describe("when called with { remote: true } option", function() {
      return it("calls git.cmd with 'branch -r'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(''));
        GitMerge(repo, {
          remote: true
        });
        return expect(git.cmd).toHaveBeenCalledWith(['branch', '-r'], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1tZXJnZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSw0QkFBUjs7RUFFWCxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0lBQ25CLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO2FBQ3RDLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO1FBQ2hDLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBQTVCO1FBQ0EsUUFBQSxDQUFTLElBQVQ7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsQ0FBckMsRUFBaUQ7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUFqRDtNQUhnQyxDQUFsQztJQURzQyxDQUF4QztXQU1BLFFBQUEsQ0FBUywwQ0FBVCxFQUFxRCxTQUFBO2FBQ25ELEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1FBQ25DLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBQTVCO1FBQ0EsUUFBQSxDQUFTLElBQVQsRUFBZTtVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWY7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsRUFBVyxJQUFYLENBQXJDLEVBQXVEO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBdkQ7TUFIbUMsQ0FBckM7SUFEbUQsQ0FBckQ7RUFQbUIsQ0FBckI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdE1lcmdlID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtbWVyZ2UnXG5cbmRlc2NyaWJlIFwiR2l0TWVyZ2VcIiwgLT5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNhbGxlZCB3aXRoIG5vIG9wdGlvbnNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnYnJhbmNoJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnJ1xuICAgICAgR2l0TWVyZ2UocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2JyYW5jaCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNhbGxlZCB3aXRoIHsgcmVtb3RlOiB0cnVlIH0gb3B0aW9uXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ2JyYW5jaCAtcidcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJydcbiAgICAgIEdpdE1lcmdlKHJlcG8sIHJlbW90ZTogdHJ1ZSlcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2JyYW5jaCcsICctciddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4iXX0=
