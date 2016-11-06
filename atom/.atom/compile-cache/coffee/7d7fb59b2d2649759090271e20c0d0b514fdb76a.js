(function() {
  var ActivatePowerMode, CompositeDisposable, configSchema, powerEditor;

  CompositeDisposable = require("atom").CompositeDisposable;

  configSchema = require("./config-schema");

  powerEditor = require("./power-editor");

  module.exports = ActivatePowerMode = {
    config: configSchema,
    subscriptions: null,
    active: false,
    powerEditor: powerEditor,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add("atom-workspace", {
        "activate-power-mode:toggle": (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        "activate-power-mode:enable": (function(_this) {
          return function() {
            return _this.enable();
          };
        })(this),
        "activate-power-mode:disable": (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)
      }));
      if (this.getConfig("autoToggle")) {
        return this.toggle();
      }
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.subscriptions) != null) {
        _ref.dispose();
      }
      this.active = false;
      return this.powerEditor.disable();
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode." + config);
    },
    toggle: function() {
      if (this.active) {
        return this.disable();
      } else {
        return this.enable();
      }
    },
    enable: function() {
      this.active = true;
      return this.powerEditor.enable();
    },
    disable: function() {
      this.active = false;
      return this.powerEditor.disable();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2FjdGl2YXRlLXBvd2VyLW1vZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRmYsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsaUJBQUEsR0FDZjtBQUFBLElBQUEsTUFBQSxFQUFRLFlBQVI7QUFBQSxJQUNBLGFBQUEsRUFBZSxJQURmO0FBQUEsSUFFQSxNQUFBLEVBQVEsS0FGUjtBQUFBLElBR0EsV0FBQSxFQUFhLFdBSGI7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtBQUFBLFFBQUEsNEJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0I7QUFBQSxRQUNBLDRCQUFBLEVBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRC9CO0FBQUEsUUFFQSw2QkFBQSxFQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUYvQjtPQURpQixDQUFuQixDQUZBLENBQUE7QUFPQSxNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBVyxZQUFYLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FSUTtJQUFBLENBTFY7QUFBQSxJQWdCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFjLENBQUUsT0FBaEIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBRFYsQ0FBQTthQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBSFU7SUFBQSxDQWhCWjtBQUFBLElBcUJBLFNBQUEsRUFBVyxTQUFDLE1BQUQsR0FBQTthQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixzQkFBQSxHQUFzQixNQUF2QyxFQURTO0lBQUEsQ0FyQlg7QUFBQSxJQXdCQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFKO2VBQWdCLElBQUMsQ0FBQSxPQUFELENBQUEsRUFBaEI7T0FBQSxNQUFBO2VBQWdDLElBQUMsQ0FBQSxNQUFELENBQUEsRUFBaEM7T0FETTtJQUFBLENBeEJSO0FBQUEsSUEyQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFWLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBQSxFQUZNO0lBQUEsQ0EzQlI7QUFBQSxJQStCQSxPQUFBLEVBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBQVYsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBRk87SUFBQSxDQS9CVDtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/activate-power-mode/lib/activate-power-mode.coffee
