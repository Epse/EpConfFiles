(function() {
  var debounce, defer, sample;

  debounce = require("lodash.debounce");

  defer = require("lodash.defer");

  sample = require("lodash.sample");

  module.exports = {
    currentStreak: 0,
    reached: false,
    maxStreakReached: false,
    reset: function() {
      var ref, ref1;
      return (ref = this.container) != null ? (ref1 = ref.parentNode) != null ? ref1.removeChild(this.container) : void 0 : void 0;
    },
    destroy: function() {
      var ref, ref1, ref2;
      this.reset();
      this.container = null;
      if ((ref = this.debouncedEndStreak) != null) {
        ref.cancel();
      }
      this.debouncedEndStreak = null;
      if ((ref1 = this.streakTimeoutObserver) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.opacityObserver) != null) {
        ref2.dispose();
      }
      this.currentStreak = 0;
      this.reached = false;
      return this.maxStreakReached = false;
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
      var leftTimeout, ref, ref1, ref2;
      if (!this.container) {
        this.maxStreak = this.getMaxStreak();
        this.container = this.createElement("streak-container");
        this.title = this.createElement("title", this.container);
        this.title.textContent = "Combo";
        this.max = this.createElement("max", this.container);
        this.max.textContent = "Max " + this.maxStreak;
        this.counter = this.createElement("counter", this.container);
        this.bar = this.createElement("bar", this.container);
        this.exclamations = this.createElement("exclamations", this.container);
        if ((ref = this.streakTimeoutObserver) != null) {
          ref.dispose();
        }
        this.streakTimeoutObserver = atom.config.observe('activate-power-mode.comboMode.streakTimeout', (function(_this) {
          return function(value) {
            var ref1;
            _this.streakTimeout = value * 1000;
            _this.endStreak();
            if ((ref1 = _this.debouncedEndStreak) != null) {
              ref1.cancel();
            }
            return _this.debouncedEndStreak = debounce(_this.endStreak.bind(_this), _this.streakTimeout);
          };
        })(this));
        if ((ref1 = this.opacityObserver) != null) {
          ref1.dispose();
        }
        this.opacityObserver = atom.config.observe('activate-power-mode.comboMode.opacity', (function(_this) {
          return function(value) {
            var ref2;
            return (ref2 = _this.container) != null ? ref2.style.opacity = value : void 0;
          };
        })(this));
      }
      this.exclamations.innerHTML = '';
      ((ref2 = editorElement.shadowRoot) != null ? ref2 : editorElement).querySelector(".scroll-view").appendChild(this.container);
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
      if (this.currentStreak > this.maxStreak) {
        this.increaseMaxStreak();
      }
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
      this.maxStreakReached = false;
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
    showExclamation: function(text) {
      var exclamation;
      if (text == null) {
        text = null;
      }
      exclamation = document.createElement("span");
      exclamation.classList.add("exclamation");
      if (text === null) {
        text = sample(this.getConfig("exclamationTexts"));
      }
      exclamation.textContent = text;
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
    getMaxStreak: function() {
      var maxStreak;
      maxStreak = localStorage.getItem("activate-power-mode.maxStreak");
      if (maxStreak === null) {
        maxStreak = 0;
      }
      return maxStreak;
    },
    increaseMaxStreak: function() {
      localStorage.setItem("activate-power-mode.maxStreak", this.currentStreak);
      this.maxStreak = this.currentStreak;
      this.max.textContent = "Max " + this.maxStreak;
      if (this.maxStreakReached === false) {
        this.showExclamation("NEW MAX!!!");
      }
      return this.maxStreakReached = true;
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode.comboMode." + config);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2NvbWJvLW1vZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUNYLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGFBQUEsRUFBZSxDQUFmO0lBQ0EsT0FBQSxFQUFTLEtBRFQ7SUFFQSxnQkFBQSxFQUFrQixLQUZsQjtJQUlBLEtBQUEsRUFBTyxTQUFBO0FBQ0wsVUFBQTtvRkFBc0IsQ0FBRSxXQUF4QixDQUFvQyxJQUFDLENBQUEsU0FBckM7SUFESyxDQUpQO0lBT0EsT0FBQSxFQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7O1dBQ00sQ0FBRSxNQUFyQixDQUFBOztNQUNBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjs7WUFDQSxDQUFFLE9BQXhCLENBQUE7OztZQUNnQixDQUFFLE9BQWxCLENBQUE7O01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFDakIsSUFBQyxDQUFBLE9BQUQsR0FBVzthQUNYLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQVRiLENBUFQ7SUFrQkEsYUFBQSxFQUFlLFNBQUMsSUFBRCxFQUFPLE1BQVA7TUFDYixJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsSUFBdkI7TUFDQSxJQUErQixNQUEvQjtRQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLElBQUMsQ0FBQSxP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LFNBQUEsR0FBWSxZQUFZLENBQUMsT0FBYixDQUFxQiwrQkFBckI7TUFDWixJQUFpQixTQUFBLEtBQWEsSUFBOUI7UUFBQSxTQUFBLEdBQVksRUFBWjs7YUFDQTtJQUhZLENBbEhkO0lBdUhBLGlCQUFBLEVBQW1CLFNBQUE7TUFDakIsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsK0JBQXJCLEVBQXNELElBQUMsQ0FBQSxhQUF2RDtNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBO01BQ2QsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLEdBQW1CLE1BQUEsR0FBTyxJQUFDLENBQUE7TUFDM0IsSUFBaUMsSUFBQyxDQUFBLGdCQUFELEtBQXFCLEtBQXREO1FBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsWUFBakIsRUFBQTs7YUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFMSCxDQXZIbkI7SUE4SEEsU0FBQSxFQUFXLFNBQUMsTUFBRDthQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBQSxHQUFpQyxNQUFqRDtJQURTLENBOUhYOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsiZGVib3VuY2UgPSByZXF1aXJlIFwibG9kYXNoLmRlYm91bmNlXCJcbmRlZmVyID0gcmVxdWlyZSBcImxvZGFzaC5kZWZlclwiXG5zYW1wbGUgPSByZXF1aXJlIFwibG9kYXNoLnNhbXBsZVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY3VycmVudFN0cmVhazogMFxuICByZWFjaGVkOiBmYWxzZVxuICBtYXhTdHJlYWtSZWFjaGVkOiBmYWxzZVxuXG4gIHJlc2V0OiAtPlxuICAgIEBjb250YWluZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkIEBjb250YWluZXJcblxuICBkZXN0cm95OiAtPlxuICAgIEByZXNldCgpXG4gICAgQGNvbnRhaW5lciA9IG51bGxcbiAgICBAZGVib3VuY2VkRW5kU3RyZWFrPy5jYW5jZWwoKVxuICAgIEBkZWJvdW5jZWRFbmRTdHJlYWsgPSBudWxsXG4gICAgQHN0cmVha1RpbWVvdXRPYnNlcnZlcj8uZGlzcG9zZSgpXG4gICAgQG9wYWNpdHlPYnNlcnZlcj8uZGlzcG9zZSgpXG4gICAgQGN1cnJlbnRTdHJlYWsgPSAwXG4gICAgQHJlYWNoZWQgPSBmYWxzZVxuICAgIEBtYXhTdHJlYWtSZWFjaGVkID0gZmFsc2VcblxuICBjcmVhdGVFbGVtZW50OiAobmFtZSwgcGFyZW50KS0+XG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZGl2XCJcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkIG5hbWVcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQgQGVsZW1lbnQgaWYgcGFyZW50XG4gICAgQGVsZW1lbnRcblxuICBzZXR1cDogKGVkaXRvckVsZW1lbnQpIC0+XG4gICAgaWYgbm90IEBjb250YWluZXJcbiAgICAgIEBtYXhTdHJlYWsgPSBAZ2V0TWF4U3RyZWFrKClcbiAgICAgIEBjb250YWluZXIgPSBAY3JlYXRlRWxlbWVudCBcInN0cmVhay1jb250YWluZXJcIlxuICAgICAgQHRpdGxlID0gQGNyZWF0ZUVsZW1lbnQgXCJ0aXRsZVwiLCBAY29udGFpbmVyXG4gICAgICBAdGl0bGUudGV4dENvbnRlbnQgPSBcIkNvbWJvXCJcbiAgICAgIEBtYXggPSBAY3JlYXRlRWxlbWVudCBcIm1heFwiLCBAY29udGFpbmVyXG4gICAgICBAbWF4LnRleHRDb250ZW50ID0gXCJNYXggI3tAbWF4U3RyZWFrfVwiXG4gICAgICBAY291bnRlciA9IEBjcmVhdGVFbGVtZW50IFwiY291bnRlclwiLCBAY29udGFpbmVyXG4gICAgICBAYmFyID0gQGNyZWF0ZUVsZW1lbnQgXCJiYXJcIiwgQGNvbnRhaW5lclxuICAgICAgQGV4Y2xhbWF0aW9ucyA9IEBjcmVhdGVFbGVtZW50IFwiZXhjbGFtYXRpb25zXCIsIEBjb250YWluZXJcblxuICAgICAgQHN0cmVha1RpbWVvdXRPYnNlcnZlcj8uZGlzcG9zZSgpXG4gICAgICBAc3RyZWFrVGltZW91dE9ic2VydmVyID0gYXRvbS5jb25maWcub2JzZXJ2ZSAnYWN0aXZhdGUtcG93ZXItbW9kZS5jb21ib01vZGUuc3RyZWFrVGltZW91dCcsICh2YWx1ZSkgPT5cbiAgICAgICAgQHN0cmVha1RpbWVvdXQgPSB2YWx1ZSAqIDEwMDBcbiAgICAgICAgQGVuZFN0cmVhaygpXG4gICAgICAgIEBkZWJvdW5jZWRFbmRTdHJlYWs/LmNhbmNlbCgpXG4gICAgICAgIEBkZWJvdW5jZWRFbmRTdHJlYWsgPSBkZWJvdW5jZSBAZW5kU3RyZWFrLmJpbmQodGhpcyksIEBzdHJlYWtUaW1lb3V0XG5cbiAgICAgIEBvcGFjaXR5T2JzZXJ2ZXI/LmRpc3Bvc2UoKVxuICAgICAgQG9wYWNpdHlPYnNlcnZlciA9IGF0b20uY29uZmlnLm9ic2VydmUgJ2FjdGl2YXRlLXBvd2VyLW1vZGUuY29tYm9Nb2RlLm9wYWNpdHknLCAodmFsdWUpID0+XG4gICAgICAgIEBjb250YWluZXI/LnN0eWxlLm9wYWNpdHkgPSB2YWx1ZVxuXG4gICAgQGV4Y2xhbWF0aW9ucy5pbm5lckhUTUwgPSAnJ1xuXG4gICAgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCA/IGVkaXRvckVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoXCIuc2Nyb2xsLXZpZXdcIikuYXBwZW5kQ2hpbGQgQGNvbnRhaW5lclxuXG4gICAgaWYgQGN1cnJlbnRTdHJlYWtcbiAgICAgIGxlZnRUaW1lb3V0ID0gQHN0cmVha1RpbWVvdXQgLSAocGVyZm9ybWFuY2Uubm93KCkgLSBAbGFzdFN0cmVhaylcbiAgICAgIEByZWZyZXNoU3RyZWFrQmFyIGxlZnRUaW1lb3V0XG5cbiAgICBAcmVuZGVyU3RyZWFrKClcblxuICBpbmNyZWFzZVN0cmVhazogLT5cbiAgICBAbGFzdFN0cmVhayA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgQGRlYm91bmNlZEVuZFN0cmVhaygpXG5cbiAgICBAY3VycmVudFN0cmVhaysrXG5cbiAgICBpZiBAY3VycmVudFN0cmVhayA+IEBtYXhTdHJlYWtcbiAgICAgIEBpbmNyZWFzZU1heFN0cmVhaygpXG5cbiAgICBAc2hvd0V4Y2xhbWF0aW9uKCkgaWYgQGN1cnJlbnRTdHJlYWsgPiAwIGFuZCBAY3VycmVudFN0cmVhayAlIEBnZXRDb25maWcoXCJleGNsYW1hdGlvbkV2ZXJ5XCIpIGlzIDBcblxuICAgIGlmIEBjdXJyZW50U3RyZWFrID49IEBnZXRDb25maWcoXCJhY3RpdmF0aW9uVGhyZXNob2xkXCIpIGFuZCBub3QgQHJlYWNoZWRcbiAgICAgIEByZWFjaGVkID0gdHJ1ZVxuICAgICAgQGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkIFwicmVhY2hlZFwiXG5cbiAgICBAcmVmcmVzaFN0cmVha0JhcigpXG5cbiAgICBAcmVuZGVyU3RyZWFrKClcblxuICBlbmRTdHJlYWs6IC0+XG4gICAgQGN1cnJlbnRTdHJlYWsgPSAwXG4gICAgQHJlYWNoZWQgPSBmYWxzZVxuICAgIEBtYXhTdHJlYWtSZWFjaGVkID0gZmFsc2VcbiAgICBAY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUgXCJyZWFjaGVkXCJcbiAgICBAcmVuZGVyU3RyZWFrKClcblxuICByZW5kZXJTdHJlYWs6IC0+XG4gICAgQGNvdW50ZXIudGV4dENvbnRlbnQgPSBAY3VycmVudFN0cmVha1xuICAgIEBjb3VudGVyLmNsYXNzTGlzdC5yZW1vdmUgXCJidW1wXCJcblxuICAgIGRlZmVyID0+XG4gICAgICBAY291bnRlci5jbGFzc0xpc3QuYWRkIFwiYnVtcFwiXG5cbiAgcmVmcmVzaFN0cmVha0JhcjogKGxlZnRUaW1lb3V0ID0gQHN0cmVha1RpbWVvdXQpIC0+XG4gICAgc2NhbGUgPSBsZWZ0VGltZW91dCAvIEBzdHJlYWtUaW1lb3V0XG4gICAgQGJhci5zdHlsZS50cmFuc2l0aW9uID0gXCJub25lXCJcbiAgICBAYmFyLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGVYKCN7c2NhbGV9KVwiXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBAYmFyLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCJcbiAgICAgIEBiYXIuc3R5bGUudHJhbnNpdGlvbiA9IFwidHJhbnNmb3JtICN7bGVmdFRpbWVvdXR9bXMgbGluZWFyXCJcbiAgICAsIDEwMFxuXG4gIHNob3dFeGNsYW1hdGlvbjogKHRleHQgPSBudWxsKSAtPlxuICAgIGV4Y2xhbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInNwYW5cIlxuICAgIGV4Y2xhbWF0aW9uLmNsYXNzTGlzdC5hZGQgXCJleGNsYW1hdGlvblwiXG4gICAgdGV4dCA9IHNhbXBsZSBAZ2V0Q29uZmlnIFwiZXhjbGFtYXRpb25UZXh0c1wiIGlmIHRleHQgaXMgbnVsbFxuICAgIGV4Y2xhbWF0aW9uLnRleHRDb250ZW50ID0gdGV4dFxuXG4gICAgQGV4Y2xhbWF0aW9ucy5pbnNlcnRCZWZvcmUgZXhjbGFtYXRpb24sIEBleGNsYW1hdGlvbnMuY2hpbGROb2Rlc1swXVxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIEBleGNsYW1hdGlvbnMucmVtb3ZlQ2hpbGQgZXhjbGFtYXRpb24gaWYgQGV4Y2xhbWF0aW9ucy5maXJzdENoaWxkXG4gICAgLCAzMDAwXG5cbiAgaGFzUmVhY2hlZDogLT5cbiAgICBAcmVhY2hlZFxuXG4gIGdldE1heFN0cmVhazogLT5cbiAgICBtYXhTdHJlYWsgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcImFjdGl2YXRlLXBvd2VyLW1vZGUubWF4U3RyZWFrXCJcbiAgICBtYXhTdHJlYWsgPSAwIGlmIG1heFN0cmVhayBpcyBudWxsXG4gICAgbWF4U3RyZWFrXG5cbiAgaW5jcmVhc2VNYXhTdHJlYWs6IC0+XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0gXCJhY3RpdmF0ZS1wb3dlci1tb2RlLm1heFN0cmVha1wiLCBAY3VycmVudFN0cmVha1xuICAgIEBtYXhTdHJlYWsgPSBAY3VycmVudFN0cmVha1xuICAgIEBtYXgudGV4dENvbnRlbnQgPSBcIk1heCAje0BtYXhTdHJlYWt9XCJcbiAgICBAc2hvd0V4Y2xhbWF0aW9uIFwiTkVXIE1BWCEhIVwiIGlmIEBtYXhTdHJlYWtSZWFjaGVkIGlzIGZhbHNlXG4gICAgQG1heFN0cmVha1JlYWNoZWQgPSB0cnVlXG5cbiAgZ2V0Q29uZmlnOiAoY29uZmlnKSAtPlxuICAgIGF0b20uY29uZmlnLmdldCBcImFjdGl2YXRlLXBvd2VyLW1vZGUuY29tYm9Nb2RlLiN7Y29uZmlnfVwiXG4iXX0=
