(function() {
  var debounce, defer, sample;

  debounce = require("lodash.debounce");

  defer = require("lodash.defer");

  sample = require("lodash.sample");

  module.exports = {
    currentStreak: 0,
    reached: false,
    reset: function() {
      var _ref, _ref1;
      return (_ref = this.container) != null ? (_ref1 = _ref.parentNode) != null ? _ref1.removeChild(this.container) : void 0 : void 0;
    },
    destroy: function() {
      var reached, _ref, _ref1, _ref2;
      this.reset();
      this.container = null;
      if ((_ref = this.debouncedEndStreak) != null) {
        _ref.cancel();
      }
      this.debouncedEndStreak = null;
      if ((_ref1 = this.streakTimeoutObserver) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.opacityObserver) != null) {
        _ref2.dispose();
      }
      this.currentStreak = 0;
      return reached = false;
    },
    createElement: function(name, parent) {
      this.element = document.createElement("div");
      this.element.classList.add(name);
      if (parent) {
        parent.appendChild(this.element);
      }
      return this.element;
    },
    setup: function(editorElement) {
      var leftTimeout, _ref, _ref1, _ref2;
      if (!this.container) {
        this.container = this.createElement("streak-container");
        this.title = this.createElement("title", this.container);
        this.title.textContent = "Combo";
        this.counter = this.createElement("counter", this.container);
        this.bar = this.createElement("bar", this.container);
        this.exclamations = this.createElement("exclamations", this.container);
        if ((_ref = this.streakTimeoutObserver) != null) {
          _ref.dispose();
        }
        this.streakTimeoutObserver = atom.config.observe('activate-power-mode.comboMode.streakTimeout', (function(_this) {
          return function(value) {
            var _ref1;
            _this.streakTimeout = value * 1000;
            _this.endStreak();
            if ((_ref1 = _this.debouncedEndStreak) != null) {
              _ref1.cancel();
            }
            return _this.debouncedEndStreak = debounce(_this.endStreak.bind(_this), _this.streakTimeout);
          };
        })(this));
        if ((_ref1 = this.opacityObserver) != null) {
          _ref1.dispose();
        }
        this.opacityObserver = atom.config.observe('activate-power-mode.comboMode.opacity', (function(_this) {
          return function(value) {
            var _ref2;
            return (_ref2 = _this.container) != null ? _ref2.style.opacity = value : void 0;
          };
        })(this));
      }
      this.exclamations.innerHTML = '';
      ((_ref2 = editorElement.shadowRoot) != null ? _ref2 : editorElement).querySelector(".scroll-view").appendChild(this.container);
      if (this.currentStreak) {
        leftTimeout = this.streakTimeout - (performance.now() - this.lastStreak);
        this.refreshStreakBar(leftTimeout);
      }
      return this.renderStreak();
    },
    increaseStreak: function() {
      this.lastStreak = performance.now();
      this.debouncedEndStreak();
      this.currentStreak++;
      if (this.currentStreak > 0 && this.currentStreak % this.getConfig("exclamationEvery") === 0) {
        this.showExclamation();
      }
      if (this.currentStreak >= this.getConfig("activationThreshold") && !this.reached) {
        this.reached = true;
        this.container.classList.add("reached");
      }
      this.refreshStreakBar();
      return this.renderStreak();
    },
    endStreak: function() {
      this.currentStreak = 0;
      this.reached = false;
      this.container.classList.remove("reached");
      return this.renderStreak();
    },
    renderStreak: function() {
      this.counter.textContent = this.currentStreak;
      this.counter.classList.remove("bump");
      return defer((function(_this) {
        return function() {
          return _this.counter.classList.add("bump");
        };
      })(this));
    },
    refreshStreakBar: function(leftTimeout) {
      var scale;
      if (leftTimeout == null) {
        leftTimeout = this.streakTimeout;
      }
      scale = leftTimeout / this.streakTimeout;
      this.bar.style.transition = "none";
      this.bar.style.transform = "scaleX(" + scale + ")";
      return setTimeout((function(_this) {
        return function() {
          _this.bar.style.transform = "";
          return _this.bar.style.transition = "transform " + leftTimeout + "ms linear";
        };
      })(this), 100);
    },
    showExclamation: function() {
      var exclamation;
      exclamation = document.createElement("span");
      exclamation.classList.add("exclamation");
      exclamation.textContent = sample(this.getConfig("exclamationTexts"));
      this.exclamations.insertBefore(exclamation, this.exclamations.childNodes[0]);
      return setTimeout((function(_this) {
        return function() {
          if (_this.exclamations.firstChild) {
            return _this.exclamations.removeChild(exclamation);
          }
        };
      })(this), 3000);
    },
    hasReached: function() {
      return this.reached;
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode.comboMode." + config);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2NvbWJvLW1vZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGNBQVIsQ0FEUixDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxDQUFmO0FBQUEsSUFDQSxPQUFBLEVBQVMsS0FEVDtBQUFBLElBR0EsS0FBQSxFQUFPLFNBQUEsR0FBQTtBQUNMLFVBQUEsV0FBQTt3RkFBc0IsQ0FBRSxXQUF4QixDQUFvQyxJQUFDLENBQUEsU0FBckMsb0JBREs7SUFBQSxDQUhQO0FBQUEsSUFNQSxPQUFBLEVBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBOztZQUVtQixDQUFFLE1BQXJCLENBQUE7T0FGQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBSHRCLENBQUE7O2FBSXNCLENBQUUsT0FBeEIsQ0FBQTtPQUpBOzthQUtnQixDQUFFLE9BQWxCLENBQUE7T0FMQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsQ0FOakIsQ0FBQTthQU9BLE9BQUEsR0FBVSxNQVJIO0lBQUEsQ0FOVDtBQUFBLElBZ0JBLGFBQUEsRUFBZSxTQUFDLElBQUQsRUFBTyxNQUFQ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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/activate-power-mode/lib/combo-mode.coffee
