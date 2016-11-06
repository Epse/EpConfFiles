(function() {
  var comboMode, playAudio, powerCanvas, screenShake, throttle,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  throttle = require("lodash.throttle");

  screenShake = require("./screen-shake");

  playAudio = require("./play-audio");

  powerCanvas = require("./power-canvas");

  comboMode = require("./combo-mode");

  module.exports = {
    screenShake: screenShake,
    playAudio: playAudio,
    powerCanvas: powerCanvas,
    comboMode: comboMode,
    enable: function() {
      this.throttledShake = throttle(this.screenShake.shake.bind(this.screenShake), 100, {
        trailing: false
      });
      this.throttledPlayAudio = throttle(this.playAudio.play.bind(this.playAudio), 100, {
        trailing: false
      });
      this.activeItemSubscription = atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.comboModeEnabledSubscription = atom.config.observe('activate-power-mode.comboMode.enabled', (function(_this) {
        return function(value) {
          _this.isComboMode = value;
          if (_this.isComboMode && _this.editorElement) {
            return _this.comboMode.setup(_this.editorElement);
          } else {
            return _this.comboMode.destroy();
          }
        };
      })(this));
      return this.subscribeToActiveTextEditor();
    },
    disable: function() {
      var _ref, _ref1, _ref2, _ref3;
      if ((_ref = this.activeItemSubscription) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.editorChangeSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.comboModeEnabledSubscription) != null) {
        _ref2.dispose();
      }
      if ((_ref3 = this.editorAddCursor) != null) {
        _ref3.dispose();
      }
      this.powerCanvas.destroy();
      this.comboMode.destroy();
      return this.isComboMode = false;
    },
    subscribeToActiveTextEditor: function() {
      this.powerCanvas.resetCanvas();
      if (this.isComboMode) {
        this.comboMode.reset();
      }
      return this.prepareEditor();
    },
    prepareEditor: function() {
      var _ref, _ref1, _ref2, _ref3;
      if ((_ref = this.editorChangeSubscription) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.editorAddCursor) != null) {
        _ref1.dispose();
      }
      this.editor = atom.workspace.getActiveTextEditor();
      if (!this.editor) {
        return;
      }
      if (_ref2 = (_ref3 = this.editor.getPath()) != null ? _ref3.split('.').pop() : void 0, __indexOf.call(this.getConfig("excludedFileTypes.excluded"), _ref2) >= 0) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.powerCanvas.setupCanvas(this.editor, this.editorElement);
      if (this.isComboMode) {
        this.comboMode.setup(this.editorElement);
      }
      this.editorChangeSubscription = this.editor.getBuffer().onDidChange(this.onChange.bind(this));
      return this.editorAddCursor = this.editor.observeCursors(this.handleCursor.bind(this));
    },
    handleCursor: function(cursor) {
      return cursor.throttleSpawnParticles = throttle(this.powerCanvas.spawnParticles.bind(this.powerCanvas), 25, {
        trailing: false
      });
    },
    onChange: function(e) {
      var cursor, range, screenPosition, spawnParticles;
      spawnParticles = true;
      if (e.newText) {
        spawnParticles = e.newText !== "\n";
        range = e.newRange.end;
      } else {
        range = e.newRange.start;
      }
      screenPosition = this.editor.screenPositionForBufferPosition(range);
      cursor = this.editor.getCursorAtScreenPosition(screenPosition);
      if (!cursor) {
        return;
      }
      if (this.isComboMode) {
        this.comboMode.increaseStreak();
        if (!this.comboMode.hasReached()) {
          return;
        }
      }
      if (spawnParticles && this.getConfig("particles.enabled")) {
        cursor.throttleSpawnParticles(screenPosition);
      }
      if (this.getConfig("screenShake.enabled")) {
        this.throttledShake(this.editorElement);
      }
      if (this.getConfig("playAudio.enabled")) {
        return this.throttledPlayAudio();
      }
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode." + config);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL3Bvd2VyLWVkaXRvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0RBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQURkLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FGWixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FKWixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsV0FBQSxFQUFhLFdBQWI7QUFBQSxJQUNBLFNBQUEsRUFBVyxTQURYO0FBQUEsSUFFQSxXQUFBLEVBQWEsV0FGYjtBQUFBLElBR0EsU0FBQSxFQUFXLFNBSFg7QUFBQSxJQUtBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLFFBQUEsQ0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFuQixDQUF3QixJQUFDLENBQUEsV0FBekIsQ0FBVCxFQUFnRCxHQUFoRCxFQUFxRDtBQUFBLFFBQUEsUUFBQSxFQUFVLEtBQVY7T0FBckQsQ0FBbEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLFFBQUEsQ0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFoQixDQUFxQixJQUFDLENBQUEsU0FBdEIsQ0FBVCxFQUEyQyxHQUEz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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/activate-power-mode/lib/power-editor.coffee
