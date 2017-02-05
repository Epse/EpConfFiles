(function() {
  var GitShow, Os, Path, fs, git, pathToRepoFile, ref, repo,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  fs = require('fs-plus');

  Os = require('os');

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  GitShow = require('../../lib/models/git-show');

  describe("GitShow", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve('foobar'));
    });
    it("calls git.cmd with 'show' and " + pathToRepoFile, function() {
      var args;
      GitShow(repo, 'foobar-hash', pathToRepoFile);
      args = git.cmd.mostRecentCall.args[0];
      expect(indexOf.call(args, 'show') >= 0).toBe(true);
      return expect(indexOf.call(args, pathToRepoFile) >= 0).toBe(true);
    });
    it("uses the format option from package settings", function() {
      var args;
      atom.config.set('git-plus.general.showFormat', 'fuller');
      GitShow(repo, 'foobar-hash', pathToRepoFile);
      args = git.cmd.mostRecentCall.args[0];
      return expect(indexOf.call(args, '--format=fuller') >= 0).toBe(true);
    });
    it("writes the output to a file", function() {
      var outputFile;
      spyOn(fs, 'writeFile').andCallFake(function() {
        return fs.writeFile.mostRecentCall.args[3]();
      });
      outputFile = Path.join(Os.tmpDir(), "foobar-hash.diff");
      waitsForPromise(function() {
        return GitShow(repo, 'foobar-hash', pathToRepoFile);
      });
      return runs(function() {
        var args;
        args = fs.writeFile.mostRecentCall.args;
        expect(args[0]).toBe(outputFile);
        return expect(args[1]).toBe('foobar');
      });
    });
    return describe("When a hash is not specified", function() {
      return it("returns a view for entering a hash", function() {
        var view;
        view = GitShow(repo);
        return expect(view).toBeDefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1zaG93LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxREFBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixNQUF5QixPQUFBLENBQVEsYUFBUixDQUF6QixFQUFDLGVBQUQsRUFBTzs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSOztFQUVWLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7SUFDbEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixRQUFoQixDQUE1QjtJQURTLENBQVg7SUFHQSxFQUFBLENBQUcsZ0NBQUEsR0FBaUMsY0FBcEMsRUFBc0QsU0FBQTtBQUNwRCxVQUFBO01BQUEsT0FBQSxDQUFRLElBQVIsRUFBYyxhQUFkLEVBQTZCLGNBQTdCO01BQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBO01BQ25DLE1BQUEsQ0FBTyxhQUFVLElBQVYsRUFBQSxNQUFBLE1BQVAsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QjthQUNBLE1BQUEsQ0FBTyxhQUFrQixJQUFsQixFQUFBLGNBQUEsTUFBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLElBQXBDO0lBSm9ELENBQXREO0lBTUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7QUFDakQsVUFBQTtNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsUUFBL0M7TUFDQSxPQUFBLENBQVEsSUFBUixFQUFjLGFBQWQsRUFBNkIsY0FBN0I7TUFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUE7YUFDbkMsTUFBQSxDQUFPLGFBQXFCLElBQXJCLEVBQUEsaUJBQUEsTUFBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQXZDO0lBSmlELENBQW5EO0lBTUEsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUE7QUFDaEMsVUFBQTtNQUFBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsV0FBVixDQUFzQixDQUFDLFdBQXZCLENBQW1DLFNBQUE7ZUFDakMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBakMsQ0FBQTtNQURpQyxDQUFuQztNQUVBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF1QixrQkFBdkI7TUFDYixlQUFBLENBQWdCLFNBQUE7ZUFDZCxPQUFBLENBQVEsSUFBUixFQUFjLGFBQWQsRUFBNkIsY0FBN0I7TUFEYyxDQUFoQjthQUVBLElBQUEsQ0FBSyxTQUFBO0FBQ0gsWUFBQTtRQUFBLElBQUEsR0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztRQUNuQyxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsVUFBckI7ZUFDQSxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsUUFBckI7TUFIRyxDQUFMO0lBTmdDLENBQWxDO1dBV0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7YUFDdkMsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUE7QUFDdkMsWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsSUFBUjtlQUNQLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxXQUFiLENBQUE7TUFGdUMsQ0FBekM7SUFEdUMsQ0FBekM7RUEzQmtCLENBQXBCO0FBUEEiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbk9zID0gcmVxdWlyZSAnb3MnXG5naXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG8sIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0U2hvdyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXNob3cnXG5cbmRlc2NyaWJlIFwiR2l0U2hvd1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnZm9vYmFyJ1xuXG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzaG93JyBhbmQgI3twYXRoVG9SZXBvRmlsZX1cIiwgLT5cbiAgICBHaXRTaG93IHJlcG8sICdmb29iYXItaGFzaCcsIHBhdGhUb1JlcG9GaWxlXG4gICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgIGV4cGVjdCgnc2hvdycgaW4gYXJncykudG9CZSB0cnVlXG4gICAgZXhwZWN0KHBhdGhUb1JlcG9GaWxlIGluIGFyZ3MpLnRvQmUgdHJ1ZVxuXG4gIGl0IFwidXNlcyB0aGUgZm9ybWF0IG9wdGlvbiBmcm9tIHBhY2thZ2Ugc2V0dGluZ3NcIiwgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc2hvd0Zvcm1hdCcsICdmdWxsZXInKVxuICAgIEdpdFNob3cgcmVwbywgJ2Zvb2Jhci1oYXNoJywgcGF0aFRvUmVwb0ZpbGVcbiAgICBhcmdzID0gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgZXhwZWN0KCctLWZvcm1hdD1mdWxsZXInIGluIGFyZ3MpLnRvQmUgdHJ1ZVxuXG4gIGl0IFwid3JpdGVzIHRoZSBvdXRwdXQgdG8gYSBmaWxlXCIsIC0+XG4gICAgc3B5T24oZnMsICd3cml0ZUZpbGUnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgZnMud3JpdGVGaWxlLm1vc3RSZWNlbnRDYWxsLmFyZ3NbM10oKVxuICAgIG91dHB1dEZpbGUgPSBQYXRoLmpvaW4gT3MudG1wRGlyKCksIFwiZm9vYmFyLWhhc2guZGlmZlwiXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBHaXRTaG93IHJlcG8sICdmb29iYXItaGFzaCcsIHBhdGhUb1JlcG9GaWxlXG4gICAgcnVucyAtPlxuICAgICAgYXJncyA9IGZzLndyaXRlRmlsZS5tb3N0UmVjZW50Q2FsbC5hcmdzXG4gICAgICBleHBlY3QoYXJnc1swXSkudG9CZSBvdXRwdXRGaWxlXG4gICAgICBleHBlY3QoYXJnc1sxXSkudG9CZSAnZm9vYmFyJ1xuXG4gIGRlc2NyaWJlIFwiV2hlbiBhIGhhc2ggaXMgbm90IHNwZWNpZmllZFwiLCAtPlxuICAgIGl0IFwicmV0dXJucyBhIHZpZXcgZm9yIGVudGVyaW5nIGEgaGFzaFwiLCAtPlxuICAgICAgdmlldyA9IEdpdFNob3cgcmVwb1xuICAgICAgZXhwZWN0KHZpZXcpLnRvQmVEZWZpbmVkKClcbiJdfQ==
