function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _ = require('..');

var lint = _interopRequireWildcard(_);

'use babel';

describe('The remark-lint provider for Linter', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      atom.packages.activatePackage('linter-markdown');
      return atom.packages.activatePackage('language-gfm').then(function () {
        return atom.workspace.open(path.join(__dirname, 'fixtures', 'definition-use-valid.md'));
      });
    });
  });

  describe('checks a file with issues and', function () {
    var editor = null;
    var invalidPath = path.join(__dirname, 'fixtures', 'definition-use-invalid.md');
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open(invalidPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', function () {
      waitsForPromise(function () {
        return lint.provideLinter().lint(editor).then(function (messages) {
          return expect(messages.length).toBeGreaterThan(0);
        });
      });
    });

    it('verifies the first message', function () {
      waitsForPromise(function () {
        return lint.provideLinter().lint(editor).then(function (messages) {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].html).toBeDefined();
          expect(messages[0].html).toEqual('<span class="badge badge-flexible">remark-lint:' + 'no-unused-definitions</span> Found unused definition');
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+definition-use-invalid\.md$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[2, 0], [2, 58]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', function () {
    var validPath = path.join(__dirname, 'fixtures', 'definition-use-valid.md');
    waitsForPromise(function () {
      return atom.workspace.open(validPath).then(function (editor) {
        return lint.provideLinter().lint(editor).then(function (messages) {
          return expect(messages.length).toEqual(0);
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9saW50ZXItbWFya2Rvd24vc3BlYy9saW50ZXItbWFya2Rvd24tc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFc0IsTUFBTTs7SUFBaEIsSUFBSTs7Z0JBQ00sSUFBSTs7SUFBZCxJQUFJOztBQUhoQixXQUFXLENBQUM7O0FBS1osUUFBUSxDQUFDLHFDQUFxQyxFQUFFLFlBQU07QUFDcEQsWUFBVSxDQUFDLFlBQU07QUFDZixRQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDdkMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLFVBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUM7ZUFDeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUM7T0FBQSxDQUNqRixDQUFDO0tBQ0gsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQywrQkFBK0IsRUFBRSxZQUFNO0FBQzlDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztBQUNsRixjQUFVLENBQUMsWUFBTTtBQUNmLHFCQUFlLENBQUM7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxVQUFVLEVBQUs7QUFBRSxnQkFBTSxHQUFHLFVBQVUsQ0FBQztTQUFFLENBQUM7T0FBQSxDQUNoRixDQUFDO0tBQ0gsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw0QkFBNEIsRUFBRSxZQUFNO0FBQ3JDLHFCQUFlLENBQUM7ZUFDZCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVE7aUJBQzdDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztTQUFBLENBQzNDO09BQUEsQ0FDRixDQUFDO0tBQ0gsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw0QkFBNEIsRUFBRSxZQUFNO0FBQ3JDLHFCQUFlLENBQUM7ZUFDZCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUNuRCxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN2QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdkMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUM5QixpREFBaUQsR0FDakQsc0RBQXNELENBQ3ZELENBQUM7QUFDRixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN0RSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN4QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDL0MsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEQsQ0FBQztPQUFBLENBQ0gsQ0FBQztLQUNILENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsdUNBQXVDLEVBQUUsWUFBTTtBQUNoRCxRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUM5RSxtQkFBZSxDQUFDO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTTtlQUN4QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVE7aUJBQzdDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUFBLENBQ25DO09BQUEsQ0FDRjtLQUFBLENBQ0YsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvbGludGVyLW1hcmtkb3duL3NwZWMvbGludGVyLW1hcmtkb3duLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGxpbnQgZnJvbSAnLi4nO1xuXG5kZXNjcmliZSgnVGhlIHJlbWFyay1saW50IHByb3ZpZGVyIGZvciBMaW50ZXInLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpO1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLW1hcmtkb3duJyk7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWdmbScpLnRoZW4oKCkgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAnZGVmaW5pdGlvbi11c2UtdmFsaWQubWQnKSlcbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjaGVja3MgYSBmaWxlIHdpdGggaXNzdWVzIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICBjb25zdCBpbnZhbGlkUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdkZWZpbml0aW9uLXVzZS1pbnZhbGlkLm1kJyk7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihpbnZhbGlkUGF0aCkudGhlbigob3BlbkVkaXRvcikgPT4geyBlZGl0b3IgPSBvcGVuRWRpdG9yOyB9KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGl0KCdmaW5kcyBhdCBsZWFzdCBvbmUgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBsaW50LnByb3ZpZGVMaW50ZXIoKS5saW50KGVkaXRvcikudGhlbihtZXNzYWdlcyA9PlxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3ZlcmlmaWVzIHRoZSBmaXJzdCBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICAgIGxpbnQucHJvdmlkZUxpbnRlcigpLmxpbnQoZWRpdG9yKS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50eXBlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50eXBlKS50b0VxdWFsKCdFcnJvcicpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5odG1sKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5odG1sKS50b0VxdWFsKFxuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGVcIj5yZW1hcmstbGludDonICtcbiAgICAgICAgICAgICduby11bnVzZWQtZGVmaW5pdGlvbnM8L3NwYW4+IEZvdW5kIHVudXNlZCBkZWZpbml0aW9uJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZpbGVQYXRoKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9NYXRjaCgvLitkZWZpbml0aW9uLXVzZS1pbnZhbGlkXFwubWQkLyk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnJhbmdlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5yYW5nZS5sZW5ndGgpLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnJhbmdlLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1syLCAwXSwgWzIsIDU4XV0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhIHZhbGlkIGZpbGUnLCAoKSA9PiB7XG4gICAgY29uc3QgdmFsaWRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2RlZmluaXRpb24tdXNlLXZhbGlkLm1kJyk7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHZhbGlkUGF0aCkudGhlbihlZGl0b3IgPT5cbiAgICAgICAgbGludC5wcm92aWRlTGludGVyKCkubGludChlZGl0b3IpLnRoZW4obWVzc2FnZXMgPT5cbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0VxdWFsKDApXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/linter-markdown/spec/linter-markdown-spec.js
