(function() {
  var KeyMapper, fs, path;

  path = require('path');

  fs = require('fs-plus');

  module.exports = KeyMapper = (function() {
    function KeyMapper() {}

    KeyMapper.prototype.pkg = 'keyboard-localization';

    KeyMapper.prototype.translationTable = null;

    KeyMapper.prototype.keymapName = '';

    KeyMapper.prototype.loaded = false;

    KeyMapper.prototype.destroy = function() {
      return this.translationTable = null;
    };

    KeyMapper.prototype.loadKeymap = function() {
      var customPath, pathToTransTable, tansTableContentJson, useKeyboardLayout, useKeyboardLayoutFromPath;
      this.loaded = false;
      this.keymapName = '';
      useKeyboardLayout = atom.config.get([this.pkg, 'useKeyboardLayout'].join('.'));
      if (useKeyboardLayout != null) {
        pathToTransTable = path.join(__dirname, 'keymaps', useKeyboardLayout + '.json');
      }
      useKeyboardLayoutFromPath = atom.config.get([this.pkg, 'useKeyboardLayoutFromPath'].join('.'));
      if (useKeyboardLayoutFromPath != null) {
        customPath = path.normalize(useKeyboardLayoutFromPath);
        if (fs.isFileSync(customPath)) {
          pathToTransTable = customPath;
        }
      }
      if (fs.isFileSync(pathToTransTable)) {
        tansTableContentJson = fs.readFileSync(pathToTransTable, 'utf8');
        this.translationTable = JSON.parse(tansTableContentJson);
        console.log(this.pkg, 'Keymap loaded "' + pathToTransTable + '"');
        this.keymapName = path.basename(pathToTransTable, '.json');
        return this.loaded = true;
      } else {
        return console.log(this.pkg, 'Error loading keymap "' + pathToTransTable + '"');
      }
    };

    KeyMapper.prototype.isLoaded = function() {
      return this.loaded;
    };

    KeyMapper.prototype.getKeymapName = function() {
      return this.keymapName;
    };

    KeyMapper.prototype.getKeymap = function() {
      return this.translationTable;
    };

    return KeyMapper;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL2tleW1hcC1sb2FkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNOzJCQUNKOztBQUFBLHdCQUFBLEdBQUEsR0FBSyx1QkFBTCxDQUFBOztBQUFBLHdCQUNBLGdCQUFBLEdBQWtCLElBRGxCLENBQUE7O0FBQUEsd0JBRUEsVUFBQSxHQUFZLEVBRlosQ0FBQTs7QUFBQSx3QkFHQSxNQUFBLEdBQVEsS0FIUixDQUFBOztBQUFBLHdCQUtBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsS0FEYjtJQUFBLENBTFQsQ0FBQTs7QUFBQSx3QkFRQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxnR0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsRUFEZCxDQUFBO0FBQUEsTUFHQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsQ0FBQyxJQUFDLENBQUEsR0FBRixFQUFPLG1CQUFQLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsR0FBakMsQ0FBaEIsQ0FIcEIsQ0FBQTtBQUlBLE1BQUEsSUFBRyx5QkFBSDtBQUNFLFFBQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLElBQUwsQ0FDakIsU0FEaUIsRUFFakIsU0FGaUIsRUFHakIsaUJBQUEsR0FBb0IsT0FISCxDQUFuQixDQURGO09BSkE7QUFBQSxNQVdBLHlCQUFBLEdBQTRCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixDQUFDLElBQUMsQ0FBQSxHQUFGLEVBQU8sMkJBQVAsQ0FBbUMsQ0FBQyxJQUFwQyxDQUF5QyxHQUF6QyxDQUFoQixDQVg1QixDQUFBO0FBWUEsTUFBQSxJQUFHLGlDQUFIO0FBQ0UsUUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZSx5QkFBZixDQUFiLENBQUE7QUFDQSxRQUFBLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxVQUFkLENBQUg7QUFDRSxVQUFBLGdCQUFBLEdBQW1CLFVBQW5CLENBREY7U0FGRjtPQVpBO0FBaUJBLE1BQUEsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLGdCQUFkLENBQUg7QUFDRSxRQUFBLG9CQUFBLEdBQXVCLEVBQUUsQ0FBQyxZQUFILENBQWdCLGdCQUFoQixFQUFrQyxNQUFsQyxDQUF2QixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxvQkFBWCxDQURwQixDQUFBO0FBQUEsUUFFQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxHQUFiLEVBQWtCLGlCQUFBLEdBQW9CLGdCQUFwQixHQUF1QyxHQUF6RCxDQUZBLENBQUE7QUFBQSxRQUdBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxnQkFBZCxFQUFnQyxPQUFoQyxDQUhkLENBQUE7ZUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBTFo7T0FBQSxNQUFBO2VBT0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFDLENBQUEsR0FBYixFQUFrQix3QkFBQSxHQUEyQixnQkFBM0IsR0FBOEMsR0FBaEUsRUFQRjtPQWxCVTtJQUFBLENBUlosQ0FBQTs7QUFBQSx3QkFtQ0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLGFBQU8sSUFBQyxDQUFBLE1BQVIsQ0FEUTtJQUFBLENBbkNWLENBQUE7O0FBQUEsd0JBc0NBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixhQUFPLElBQUMsQ0FBQSxVQUFSLENBRGE7SUFBQSxDQXRDZixDQUFBOztBQUFBLHdCQXlDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsYUFBTyxJQUFDLENBQUEsZ0JBQVIsQ0FEUztJQUFBLENBekNYLENBQUE7O3FCQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/keymap-loader.coffee
