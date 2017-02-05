(function() {
  var GitRun, git, pathToRepoFile, ref, repo;

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  git = require('../../lib/git');

  GitRun = require('../../lib/models/git-run');

  describe("GitRun", function() {
    describe("when called with just a repository", function() {
      return it("calls git.cmd with the arguments typed into the input with a config for colors to be enabled", function() {
        var editor, view;
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        view = GitRun(repo);
        editor = view.find('atom-text-editor')[0];
        view.commandEditor.setText('do some stuff');
        atom.commands.dispatch(editor, 'core:confirm');
        return expect(git.cmd).toHaveBeenCalledWith(['do', 'some', 'stuff'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
    return describe("when called with a repository and a string with arguments", function() {
      return it("calls git.cmd with the arguments passed", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        view = GitRun(repo, "status --list");
        return expect(git.cmd).toHaveBeenCalledWith(['status', '--list'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1ydW4tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixNQUFBLEdBQVMsT0FBQSxDQUFRLDBCQUFSOztFQUVULFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7SUFDakIsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7YUFDN0MsRUFBQSxDQUFHLDhGQUFILEVBQW1HLFNBQUE7QUFDakcsWUFBQTtRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsSUFBQSxHQUFPLE1BQUEsQ0FBTyxJQUFQO1FBQ1AsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBOEIsQ0FBQSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZUFBM0I7UUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsY0FBL0I7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsT0FBZixDQUFyQyxFQUE4RDtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTlELEVBQStGO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBL0Y7TUFOaUcsQ0FBbkc7SUFENkMsQ0FBL0M7V0FTQSxRQUFBLENBQVMsMkRBQVQsRUFBc0UsU0FBQTthQUNwRSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtBQUM1QyxZQUFBO1FBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7UUFDQSxJQUFBLEdBQU8sTUFBQSxDQUFPLElBQVAsRUFBYSxlQUFiO2VBQ1AsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUFyQyxFQUEyRDtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTNELEVBQTRGO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBNUY7TUFINEMsQ0FBOUM7SUFEb0UsQ0FBdEU7RUFWaUIsQ0FBbkI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvLCBwYXRoVG9SZXBvRmlsZX0gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5HaXRSdW4gPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1ydW4nXG5cbmRlc2NyaWJlIFwiR2l0UnVuXCIsIC0+XG4gIGRlc2NyaWJlIFwid2hlbiBjYWxsZWQgd2l0aCBqdXN0IGEgcmVwb3NpdG9yeVwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIHRoZSBhcmd1bWVudHMgdHlwZWQgaW50byB0aGUgaW5wdXQgd2l0aCBhIGNvbmZpZyBmb3IgY29sb3JzIHRvIGJlIGVuYWJsZWRcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgdmlldyA9IEdpdFJ1bihyZXBvKVxuICAgICAgZWRpdG9yID0gdmlldy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJylbMF1cbiAgICAgIHZpZXcuY29tbWFuZEVkaXRvci5zZXRUZXh0ICdkbyBzb21lIHN0dWZmJ1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3IsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZG8nLCAnc29tZScsICdzdHVmZiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9XG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNhbGxlZCB3aXRoIGEgcmVwb3NpdG9yeSBhbmQgYSBzdHJpbmcgd2l0aCBhcmd1bWVudHNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCB0aGUgYXJndW1lbnRzIHBhc3NlZFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICB2aWV3ID0gR2l0UnVuKHJlcG8sIFwic3RhdHVzIC0tbGlzdFwiKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc3RhdHVzJywgJy0tbGlzdCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9XG4iXX0=
