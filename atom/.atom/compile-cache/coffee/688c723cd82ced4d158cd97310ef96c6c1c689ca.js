(function() {
  var CompositeDisposable, EventsDelegation, StickyTitle;

  EventsDelegation = require('atom-utils').EventsDelegation;

  CompositeDisposable = null;

  module.exports = StickyTitle = (function() {
    EventsDelegation.includeInto(StickyTitle);

    function StickyTitle(stickies, scrollContainer) {
      this.stickies = stickies;
      this.scrollContainer = scrollContainer;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      Array.prototype.forEach.call(this.stickies, function(sticky) {
        sticky.parentNode.style.height = sticky.offsetHeight + 'px';
        return sticky.style.width = sticky.offsetWidth + 'px';
      });
      this.subscriptions.add(this.subscribeTo(this.scrollContainer, {
        'scroll': (function(_this) {
          return function(e) {
            return _this.scroll(e);
          };
        })(this)
      }));
    }

    StickyTitle.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.stickies = null;
      return this.scrollContainer = null;
    };

    StickyTitle.prototype.scroll = function(e) {
      var delta;
      delta = this.lastScrollTop ? this.lastScrollTop - this.scrollContainer.scrollTop : 0;
      Array.prototype.forEach.call(this.stickies, (function(_this) {
        return function(sticky, i) {
          var nextSticky, nextTop, parentTop, prevSticky, prevTop, scrollTop, top;
          nextSticky = _this.stickies[i + 1];
          prevSticky = _this.stickies[i - 1];
          scrollTop = _this.scrollContainer.getBoundingClientRect().top;
          parentTop = sticky.parentNode.getBoundingClientRect().top;
          top = sticky.getBoundingClientRect().top;
          if (parentTop < scrollTop) {
            if (!sticky.classList.contains('absolute')) {
              sticky.classList.add('fixed');
              sticky.style.top = scrollTop + 'px';
              if (nextSticky != null) {
                nextTop = nextSticky.parentNode.getBoundingClientRect().top;
                if (top + sticky.offsetHeight >= nextTop) {
                  sticky.classList.add('absolute');
                  return sticky.style.top = _this.scrollContainer.scrollTop + 'px';
                }
              }
            }
          } else {
            sticky.classList.remove('fixed');
            if ((prevSticky != null) && prevSticky.classList.contains('absolute')) {
              prevTop = prevSticky.getBoundingClientRect().top;
              if (delta < 0) {
                prevTop -= prevSticky.offsetHeight;
              }
              if (scrollTop <= prevTop) {
                prevSticky.classList.remove('absolute');
                return prevSticky.style.top = scrollTop + 'px';
              }
            }
          }
        };
      })(this));
      return this.lastScrollTop = this.scrollContainer.scrollTop;
    };

    return StickyTitle;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9zdGlja3ktdGl0bGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBOztBQUFBLEVBQUMsbUJBQW9CLE9BQUEsQ0FBUSxZQUFSLEVBQXBCLGdCQUFELENBQUE7O0FBQUEsRUFDQSxtQkFBQSxHQUFzQixJQUR0QixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsV0FBN0IsQ0FBQSxDQUFBOztBQUVhLElBQUEscUJBQUUsUUFBRixFQUFhLGVBQWIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFEdUIsSUFBQyxDQUFBLGtCQUFBLGVBQ3hCLENBQUE7O1FBQUEsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztPQUF2QztBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxLQUFLLENBQUEsU0FBRSxDQUFBLE9BQU8sQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQSxRQUFyQixFQUErQixTQUFDLE1BQUQsR0FBQTtBQUM3QixRQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQXhCLEdBQWlDLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLElBQXZELENBQUE7ZUFDQSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsR0FBcUIsTUFBTSxDQUFDLFdBQVAsR0FBcUIsS0FGYjtNQUFBLENBQS9CLENBSEEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxD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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/sticky-title.coffee
