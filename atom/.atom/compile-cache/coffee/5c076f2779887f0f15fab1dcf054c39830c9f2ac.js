(function() {
  var Dom;

  Dom = require('./dom');

  module.exports = {
    init: function(state) {
      var self;
      self = this;
      this.themeSet = false;
      if (self.isLoaded('seti-syntax')) {
        atom.config.onDidChange('seti-syntax.themeColor', function(value) {
          return self.setTheme(value.newValue, value.oldValue, true);
        });
        atom.config.onDidChange('seti-syntax.dynamicColor', function(value) {
          var newColor;
          if (value.newValue) {
            newColor = atom.config.get('seti-ui.themeColor');
            return self.setTheme(newColor, false, true);
          } else {
            if (atom.config.get('seti-syntax.themeColor')) {
              newColor = atom.config.get('seti-syntax.themeColor');
            } else {
              newColor = 'default';
            }
            return self.setTheme(newColor, false, true);
          }
        });
        if (self.isLoaded('seti-ui')) {
          if (atom.config.get('seti-syntax.dynamicColor') && !this.themeSet) {
            self.setTheme(atom.config.get('seti-ui.themeColor'), false, false);
          }
          atom.config.onDidChange('seti-ui.themeColor', function(value) {
            if (atom.config.get('seti-syntax.dynamicColor')) {
              return self.setTheme(value.newValue, value.oldValue, false);
            }
          });
          self.onDeactivate('seti-ui', function() {
            if (atom.config.get('seti-syntax.dynamicColor')) {
              return self.setTheme('default', false, false);
            }
          });
        }
        if ((atom.config.get('seti-syntax.themeColor')) && !this.themeSet) {
          return self.setTheme(atom.config.get('seti-syntax.themeColor'), false, false);
        } else if (!this.themeSet) {
          return self.setTheme('default', false, false);
        }
      }
    },
    isLoaded: function(which) {
      return atom.packages.isPackageLoaded(which);
    },
    onActivate: function(which, cb) {
      return atom.packages.onDidActivatePackage(function(pkg) {
        if (pkg.name === which) {
          return cb(pkg);
        }
      });
    },
    onDeactivate: function(which, cb) {
      return atom.packages.onDidDeactivatePackage(function(pkg) {
        if (pkg.name === which) {
          return cb(pkg);
        }
      });
    },
    "package": atom.packages.getLoadedPackage('seti-syntax'),
    packageInfo: function(which) {
      return atom.packages.getLoadedPackage(which);
    },
    refresh: function() {
      var self;
      self = this;
      self["package"].deactivate();
      return setImmediate(function() {
        return self["package"].activate();
      });
    },
    setTheme: function(theme, previous, reload) {
      var fs, pkg, self, themeData;
      self = this;
      fs = require('fs');
      pkg = this["package"];
      themeData = '@import "themes/' + theme.toLowerCase() + '";';
      this.themeSet = true;
      return fs.readFile(pkg.path + '/styles/user-theme.less', 'utf8', function(err, fileData) {
        if (fileData !== themeData) {
          return fs.writeFile(pkg.path + '/styles/user-theme.less', themeData, function(err) {
            if (!err) {
              return self.refresh();
            }
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9zZXRpLXN5bnRheC9saWIvc2V0dGluZ3MuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEdBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FBTixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFNLFNBQUMsS0FBRCxHQUFBO0FBRUosVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBRFosQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFJLENBQUMsUUFBTCxDQUFjLGFBQWQsQ0FBSDtBQUdFLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHdCQUF4QixFQUFrRCxTQUFDLEtBQUQsR0FBQTtpQkFDaEQsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLENBQUMsUUFBcEIsRUFBOEIsS0FBSyxDQUFDLFFBQXBDLEVBQThDLElBQTlDLEVBRGdEO1FBQUEsQ0FBbEQsQ0FBQSxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsMEJBQXhCLEVBQW9ELFNBQUMsS0FBRCxHQUFBO0FBRWxELGNBQUEsUUFBQTtBQUFBLFVBQUEsSUFBSSxLQUFLLENBQUMsUUFBVjtBQUNFLFlBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsQ0FBWCxDQUFBO21CQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxFQUF3QixLQUF4QixFQUErQixJQUEvQixFQUZGO1dBQUEsTUFBQTtBQU1FLFlBQUEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Is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

//# sourceURL=/home/epse/.atom/packages/seti-syntax/lib/settings.coffee
