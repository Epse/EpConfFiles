'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LegacyAdapter = (function () {
  function LegacyAdapter(textEditor) {
    _classCallCheck(this, LegacyAdapter);

    this.textEditor = textEditor;
  }

  _createClass(LegacyAdapter, [{
    key: 'enableCache',
    value: function enableCache() {
      this.useCache = true;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      delete this.maxScrollTopCache;
    }
  }, {
    key: 'onDidChangeScrollTop',
    value: function onDidChangeScrollTop(callback) {
      return this.textEditor.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditor.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditor.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.textEditor.getScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.textEditor.getScrollTop();
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditor.getScrollLeft();
        }
        return this.scrollLeftCache;
      }

      return this.textEditor.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }
      var maxScrollTop = this.textEditor.displayBuffer.getMaxScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    }
  }, {
    key: 'editorDestroyed',
    value: function editorDestroyed() {
      return !this.textEditor || this.textEditor.isDestroyed();
    }
  }]);

  return LegacyAdapter;
})();

exports['default'] = LegacyAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9sZWdhY3ktYWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7Ozs7SUFLVSxhQUFhO0FBQ3BCLFdBRE8sYUFBYSxDQUNuQixVQUFVLEVBQUU7MEJBRE4sYUFBYTs7QUFDTCxRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtHQUFFOztlQUR0QyxhQUFhOztXQUdwQix1QkFBRztBQUFFLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0tBQUU7OztXQUU1QixzQkFBRztBQUNaLFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtBQUN2QixhQUFPLElBQUksQ0FBQyxjQUFjLENBQUE7QUFDMUIsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFBO0FBQzNCLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0tBQzlCOzs7V0FFb0IsOEJBQUMsUUFBUSxFQUFFO0FBQzlCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN0RDs7O1dBRXFCLCtCQUFDLFFBQVEsRUFBRTtBQUMvQixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkQ7OztXQUVTLHFCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLGNBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUMvQztBQUNELGVBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtPQUN4QjtBQUNELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtLQUNuQzs7O1dBRVksd0JBQUc7QUFDZCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDeEIsY0FBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFBO1NBQ3JEO0FBQ0QsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFBO09BQzNCO0FBQ0QsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFBO0tBQ3RDOzs7V0FFWSxzQkFBQyxTQUFTLEVBQUU7QUFDdkIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUMvQzs7O1dBRWEseUJBQUc7QUFDZixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDekIsY0FBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFBO1NBQ3ZEO0FBQ0QsZUFBTyxJQUFJLENBQUMsZUFBZSxDQUFBO09BQzVCOztBQUVELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUN2Qzs7O1dBRWUsMkJBQUc7QUFDakIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbkQsZUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7T0FDOUI7QUFDRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUNsRSxVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUE7O0FBRXhELFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixvQkFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFBO09BQ2xEO0FBQ0QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQUUsWUFBSSxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQTtPQUFFO0FBQzVELGFBQU8sWUFBWSxDQUFBO0tBQ3BCOzs7V0FFZSwyQkFBRztBQUNqQixhQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO0tBQ3pEOzs7U0F4RWtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9sZWdhY3ktYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlZ2FjeUFkYXB0ZXIge1xuICBjb25zdHJ1Y3RvciAodGV4dEVkaXRvcikgeyB0aGlzLnRleHRFZGl0b3IgPSB0ZXh0RWRpdG9yIH1cblxuICBlbmFibGVDYWNoZSAoKSB7IHRoaXMudXNlQ2FjaGUgPSB0cnVlIH1cblxuICBjbGVhckNhY2hlICgpIHtcbiAgICB0aGlzLnVzZUNhY2hlID0gZmFsc2VcbiAgICBkZWxldGUgdGhpcy5oZWlnaHRDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsTGVmdENhY2hlXG4gICAgZGVsZXRlIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsVG9wIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxUb3AoY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZVNjcm9sbExlZnQgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZVNjcm9sbExlZnQoY2FsbGJhY2spXG4gIH1cblxuICBnZXRIZWlnaHQgKCkge1xuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuaGVpZ2h0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5oZWlnaHRDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRIZWlnaHQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0Q2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5nZXRIZWlnaHQoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbFRvcENhY2hlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9wQ2FjaGUgPSB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsVG9wKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsVG9wKClcbiAgfVxuXG4gIHNldFNjcm9sbFRvcCAoc2Nyb2xsVG9wKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuICB9XG5cbiAgZ2V0U2Nyb2xsTGVmdCAoKSB7XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxMZWZ0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxMZWZ0Q2FjaGUgPSB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLmdldFNjcm9sbExlZnQoKVxuICB9XG5cbiAgZ2V0TWF4U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy5tYXhTY3JvbGxUb3BDYWNoZSAhPSBudWxsICYmIHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIHJldHVybiB0aGlzLm1heFNjcm9sbFRvcENhY2hlXG4gICAgfVxuICAgIHZhciBtYXhTY3JvbGxUb3AgPSB0aGlzLnRleHRFZGl0b3IuZGlzcGxheUJ1ZmZlci5nZXRNYXhTY3JvbGxUb3AoKVxuICAgIHZhciBsaW5lSGVpZ2h0ID0gdGhpcy50ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICBpZiAodGhpcy5zY3JvbGxQYXN0RW5kKSB7XG4gICAgICBtYXhTY3JvbGxUb3AgLT0gdGhpcy5nZXRIZWlnaHQoKSAtIDMgKiBsaW5lSGVpZ2h0XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7IHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGUgPSBtYXhTY3JvbGxUb3AgfVxuICAgIHJldHVybiBtYXhTY3JvbGxUb3BcbiAgfVxuXG4gIGVkaXRvckRlc3Ryb3llZCAoKSB7XG4gICAgcmV0dXJuICF0aGlzLnRleHRFZGl0b3IgfHwgdGhpcy50ZXh0RWRpdG9yLmlzRGVzdHJveWVkKClcbiAgfVxufVxuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/minimap/lib/adapters/legacy-adapter.js
