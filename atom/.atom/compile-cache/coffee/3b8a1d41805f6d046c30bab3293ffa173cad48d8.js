(function() {
  var GitRun, git, pathToRepoFile, ref, repo;

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  git = require('../../lib/git');

  GitRun = require('../../lib/models/git-run');

  describe("GitRun", function() {
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1ydW4tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixNQUFBLEdBQVMsT0FBQSxDQUFRLDBCQUFSOztFQUVULFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7V0FDakIsRUFBQSxDQUFHLDhGQUFILEVBQW1HLFNBQUE7QUFDakcsVUFBQTtNQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO01BQ0EsSUFBQSxHQUFPLE1BQUEsQ0FBTyxJQUFQO01BQ1AsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBOEIsQ0FBQSxDQUFBO01BQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZUFBM0I7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsY0FBL0I7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsT0FBZixDQUFyQyxFQUE4RDtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQTlELEVBQStGO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBL0Y7SUFOaUcsQ0FBbkc7RUFEaUIsQ0FBbkI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvLCBwYXRoVG9SZXBvRmlsZX0gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5HaXRSdW4gPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1ydW4nXG5cbmRlc2NyaWJlIFwiR2l0UnVuXCIsIC0+XG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIHRoZSBhcmd1bWVudHMgdHlwZWQgaW50byB0aGUgaW5wdXQgd2l0aCBhIGNvbmZpZyBmb3IgY29sb3JzIHRvIGJlIGVuYWJsZWRcIiwgLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICB2aWV3ID0gR2l0UnVuKHJlcG8pXG4gICAgZWRpdG9yID0gdmlldy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJylbMF1cbiAgICB2aWV3LmNvbW1hbmRFZGl0b3Iuc2V0VGV4dCAnZG8gc29tZSBzdHVmZidcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvciwgJ2NvcmU6Y29uZmlybScpXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZG8nLCAnc29tZScsICdzdHVmZiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9XG4iXX0=
