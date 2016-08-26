function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

'use babel';

var lint = require(path.join('..', 'lib', 'index.js')).provideLinter().lint;

describe('The remark-lint provider for Linter', function () {
  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      atom.packages.activatePackage('linter-markdown');
      return atom.packages.activatePackage('language-gfm').then(function () {
        return atom.workspace.open(path.join(__dirname, 'fixtures', 'definition-case-valid.md'));
      });
    });
  });

  describe('checks a file with issues and', function () {
    var editor = null;
    var dciPath = path.join(__dirname, 'fixtures', 'definition-case-invalid.md');
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open(dciPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', function () {
      waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBeGreaterThan(0);
        });
      });
    });

    it('verifies the first message', function () {
      waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].html).toBeDefined();
          expect(messages[0].html).toEqual('<span class="badge badge-flexible">definition-case</span> ' + 'Do not use upper-case characters in definition labels');
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+definition-case-invalid\.md$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[2, 0], [2, 58]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', function () {
    var dcvPath = path.join(__dirname, 'fixtures', 'definition-case-valid.md');
    waitsForPromise(function () {
      return atom.workspace.open(dcvPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toEqual(0);
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyLW1hcmtkb3duL3NwZWMvbGludGVyLW1hcmtkb3duLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRXNCLE1BQU07O0lBQWhCLElBQUk7O0FBRmhCLFdBQVcsQ0FBQzs7QUFJWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUU5RSxRQUFRLENBQUMscUNBQXFDLEVBQUUsWUFBTTtBQUNwRCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxtQkFBZSxDQUFDLFlBQU07QUFDcEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQztlQUN4RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztPQUFBLENBQ2xGLENBQUM7S0FDSCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDOUMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBQy9FLGNBQVUsQ0FBQyxZQUFNO0FBQ2YscUJBQWUsQ0FBQztlQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUFFLGdCQUFNLEdBQUcsVUFBVSxDQUFDO1NBQUUsQ0FBQztPQUFBLENBQzFFLENBQUM7S0FDSCxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLDRCQUE0QixFQUFFLFlBQU07QUFDckMscUJBQWUsQ0FBQztlQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO2lCQUN4QixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7U0FBQSxDQUMzQztPQUFBLENBQ0YsQ0FBQztLQUNILENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsNEJBQTRCLEVBQUUsWUFBTTtBQUNyQyxxQkFBZSxDQUFDO2VBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUM1QixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN2QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdkMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUM5Qiw0REFBNEQsR0FDNUQsdURBQXVELENBQ3hELENBQUM7QUFDRixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUN2RSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN4QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDL0MsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEQsQ0FBQztPQUFBLENBQ0gsQ0FBQztLQUNILENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsdUNBQXVDLEVBQUUsWUFBTTtBQUNoRCxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztBQUM3RSxtQkFBZSxDQUFDO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTTtlQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtpQkFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FDbkM7T0FBQSxDQUNGO0tBQUEsQ0FDRixDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyLW1hcmtkb3duL3NwZWMvbGludGVyLW1hcmtkb3duLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgbGludCA9IHJlcXVpcmUocGF0aC5qb2luKCcuLicsICdsaWInLCAnaW5kZXguanMnKSkucHJvdmlkZUxpbnRlcigpLmxpbnQ7XG5cbmRlc2NyaWJlKCdUaGUgcmVtYXJrLWxpbnQgcHJvdmlkZXIgZm9yIExpbnRlcicsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsaW50ZXItbWFya2Rvd24nKTtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtZ2ZtJykudGhlbigoKSA9PlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdkZWZpbml0aW9uLWNhc2UtdmFsaWQubWQnKSlcbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjaGVja3MgYSBmaWxlIHdpdGggaXNzdWVzIGFuZCcsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICBjb25zdCBkY2lQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2RlZmluaXRpb24tY2FzZS1pbnZhbGlkLm1kJyk7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihkY2lQYXRoKS50aGVuKG9wZW5FZGl0b3IgPT4geyBlZGl0b3IgPSBvcGVuRWRpdG9yOyB9KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGl0KCdmaW5kcyBhdCBsZWFzdCBvbmUgbWVzc2FnZScsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBsaW50KGVkaXRvcikudGhlbihtZXNzYWdlcyA9PlxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3ZlcmlmaWVzIHRoZSBmaXJzdCBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICAgIGxpbnQoZWRpdG9yKS50aGVuKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0udHlwZSkudG9CZURlZmluZWQoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0udHlwZSkudG9FcXVhbCgnRXJyb3InKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uaHRtbCkudG9CZURlZmluZWQoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uaHRtbCkudG9FcXVhbChcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlXCI+ZGVmaW5pdGlvbi1jYXNlPC9zcGFuPiAnICtcbiAgICAgICAgICAgICdEbyBub3QgdXNlIHVwcGVyLWNhc2UgY2hhcmFjdGVycyBpbiBkZWZpbml0aW9uIGxhYmVscydcbiAgICAgICAgICApO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9CZURlZmluZWQoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmlsZVBhdGgpLnRvTWF0Y2goLy4rZGVmaW5pdGlvbi1jYXNlLWludmFsaWRcXC5tZCQvKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnJhbmdlLmxlbmd0aCkudG9CZURlZmluZWQoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5yYW5nZSkudG9FcXVhbChbWzIsIDBdLCBbMiwgNThdXSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIGEgdmFsaWQgZmlsZScsICgpID0+IHtcbiAgICBjb25zdCBkY3ZQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2RlZmluaXRpb24tY2FzZS12YWxpZC5tZCcpO1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihkY3ZQYXRoKS50aGVuKGVkaXRvciA9PlxuICAgICAgICBsaW50KGVkaXRvcikudGhlbihtZXNzYWdlcyA9PlxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvRXF1YWwoMClcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/epse/.atom/packages/linter-markdown/spec/linter-markdown-spec.js
