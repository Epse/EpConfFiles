(function() {
  var KeyboardLocalization, fs, path;

  path = require('path');

  fs = require('fs');

  KeyboardLocalization = require('../lib/keyboard-localization.coffee');

  describe('KeyboardLocalization', function() {
    var pkg;
    pkg = [];
    beforeEach(function() {
      return pkg = new KeyboardLocalization();
    });
    return describe('when the package loads', function() {
      return it('should be an keymap-locale-file available for every config entry', function() {
        return pkg.config.useKeyboardLayout["enum"].forEach(function(localeString) {
          var pathToKeymapFile;
          pathToKeymapFile = path.join(__dirname, '..', 'lib', 'keymaps', localeString + '.json');
          return expect(fs.existsSync(pathToKeymapFile)).toBe(true);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vc3BlYy9rZXlib2FyZC1sb2NhbGl6YXRpb24tc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEJBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxxQ0FBUixDQUZ2QixDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxFQUFOLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxHQUFBLEdBQVUsSUFBQSxvQkFBQSxDQUFBLEVBREQ7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQUtBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7YUFDakMsRUFBQSxDQUFHLGtFQUFILEVBQXVFLFNBQUEsR0FBQTtlQUNyRSxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQUQsQ0FBSyxDQUFDLE9BQWxDLENBQTBDLFNBQUMsWUFBRCxHQUFBO0FBQ3hDLGNBQUEsZ0JBQUE7QUFBQSxVQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixLQUEzQixFQUFrQyxTQUFsQyxFQUE2QyxZQUFBLEdBQWUsT0FBNUQsQ0FBbkIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sRUFBRSxDQUFDLFVBQUgsQ0FBYyxnQkFBZCxDQUFQLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsSUFBN0MsRUFGd0M7UUFBQSxDQUExQyxFQURxRTtNQUFBLENBQXZFLEVBRGlDO0lBQUEsQ0FBbkMsRUFOK0I7RUFBQSxDQUFqQyxDQUpBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/spec/keyboard-localization-spec.coffee
