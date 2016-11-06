'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StableAdapter = (function () {
  function StableAdapter(textEditor) {
    _classCallCheck(this, StableAdapter);

    this.textEditor = textEditor;
    this.textEditorElement = atom.views.getView(this.textEditor);
  }

  _createClass(StableAdapter, [{
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
      return this.textEditorElement.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditorElement.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditorElement.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditorElement.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.computeScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.computeScrollTop();
    }
  }, {
    key: 'computeScrollTop',
    value: function computeScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      var scrollTop = this.textEditorElement.getScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();
      var firstRow = this.textEditorElement.getFirstVisibleScreenRow();
      var lineTop = this.textEditorElement.pixelPositionForScreenPosition([firstRow, 0]).top;

      if (lineTop > scrollTop) {
        firstRow -= 1;
        lineTop = this.textEditorElement.pixelPositionForScreenPosition([firstRow, 0]).top;
      }

      var lineY = firstRow * lineHeight;
      var offset = Math.min(scrollTop - lineTop, lineHeight);
      return lineY + offset;
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      if (this.editorDestroyed()) {
        return;
      }

      this.textEditorElement.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditorElement.getScrollLeft();
        }
        return this.scrollLeftCache;
      }
      return this.textEditorElement.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }

      var maxScrollTop = this.textEditorElement.getScrollHeight() - this.getHeight();
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
      return !this.textEditor || this.textEditor.isDestroyed() || !this.textEditorElement.getModel();
    }
  }]);

  return StableAdapter;
})();

exports['default'] = StableAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9zdGFibGUtYWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7Ozs7SUFLVSxhQUFhO0FBQ3BCLFdBRE8sYUFBYSxDQUNuQixVQUFVLEVBQUU7MEJBRE4sYUFBYTs7QUFFOUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtHQUM3RDs7ZUFKa0IsYUFBYTs7V0FNcEIsdUJBQUc7QUFBRSxVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtLQUFFOzs7V0FFNUIsc0JBQUc7QUFDWixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7QUFDdkIsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFBO0FBQzFCLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtBQUMzQixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtLQUM5Qjs7O1dBRW9CLDhCQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM3RDs7O1dBRXFCLCtCQUFDLFFBQVEsRUFBRTtBQUMvQixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM5RDs7O1dBRVMscUJBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFBO09BQUU7O0FBRXhDLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcs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QUFDOUUsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBOztBQUV4RCxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsb0JBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtPQUNsRDs7QUFFRCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQTtPQUN0Qzs7QUFFRCxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1dBRWUsMkJBQUc7QUFDakIsYUFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLElBQzdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBO0tBQzFDOzs7U0E3R2tCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9zdGFibGUtYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YWJsZUFkYXB0ZXIge1xuICBjb25zdHJ1Y3RvciAodGV4dEVkaXRvcikge1xuICAgIHRoaXMudGV4dEVkaXRvciA9IHRleHRFZGl0b3JcbiAgICB0aGlzLnRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMudGV4dEVkaXRvcilcbiAgfVxuXG4gIGVuYWJsZUNhY2hlICgpIHsgdGhpcy51c2VDYWNoZSA9IHRydWUgfVxuXG4gIGNsZWFyQ2FjaGUgKCkge1xuICAgIHRoaXMudXNlQ2FjaGUgPSBmYWxzZVxuICAgIGRlbGV0ZSB0aGlzLmhlaWdodENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICBkZWxldGUgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZVxuICB9XG5cbiAgb25EaWRDaGFuZ2VTY3JvbGxUb3AgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZVNjcm9sbExlZnQgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KGNhbGxiYWNrKVxuICB9XG5cbiAgZ2V0SGVpZ2h0ICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gMCB9XG5cbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLmhlaWdodENhY2hlKSB7XG4gICAgICAgIHRoaXMuaGVpZ2h0Q2FjaGUgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldEhlaWdodCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5oZWlnaHRDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gMCB9XG5cbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbFRvcENhY2hlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9wQ2FjaGUgPSB0aGlzLmNvbXB1dGVTY3JvbGxUb3AoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29tcHV0ZVNjcm9sbFRvcCgpXG4gIH1cblxuICBjb21wdXRlU2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gMCB9XG5cbiAgICBjb25zdCBzY3JvbGxUb3AgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgY29uc3QgbGluZUhlaWdodCA9IHRoaXMudGV4dEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuICAgIGxldCBmaXJzdFJvdyA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBsZXQgbGluZVRvcCA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKFtmaXJzdFJvdywgMF0pLnRvcFxuXG4gICAgaWYgKGxpbmVUb3AgPiBzY3JvbGxUb3ApIHtcbiAgICAgIGZpcnN0Um93IC09IDFcbiAgICAgIGxpbmVUb3AgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbZmlyc3RSb3csIDBdKS50b3BcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lWSA9IGZpcnN0Um93ICogbGluZUhlaWdodFxuICAgIGNvbnN0IG9mZnNldCA9IE1hdGgubWluKHNjcm9sbFRvcCAtIGxpbmVUb3AsIGxpbmVIZWlnaHQpXG4gICAgcmV0dXJuIGxpbmVZICsgb2Zmc2V0XG4gIH1cblxuICBzZXRTY3JvbGxUb3AgKHNjcm9sbFRvcCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnRleHRFZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG4gIH1cblxuICBnZXRTY3JvbGxMZWZ0ICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gMCB9XG5cbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbExlZnRDYWNoZSkge1xuICAgICAgICB0aGlzLnNjcm9sbExlZnRDYWNoZSA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gIH1cblxuICBnZXRNYXhTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiAwIH1cblxuICAgIGlmICh0aGlzLm1heFNjcm9sbFRvcENhY2hlICE9IG51bGwgJiYgdGhpcy51c2VDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG5cbiAgICBsZXQgbWF4U2Nyb2xsVG9wID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSAtIHRoaXMuZ2V0SGVpZ2h0KClcbiAgICBsZXQgbGluZUhlaWdodCA9IHRoaXMudGV4dEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsUGFzdEVuZCkge1xuICAgICAgbWF4U2Nyb2xsVG9wIC09IHRoaXMuZ2V0SGVpZ2h0KCkgLSAzICogbGluZUhlaWdodFxuICAgIH1cblxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICB0aGlzLm1heFNjcm9sbFRvcENhY2hlID0gbWF4U2Nyb2xsVG9wXG4gICAgfVxuXG4gICAgcmV0dXJuIG1heFNjcm9sbFRvcFxuICB9XG5cbiAgZWRpdG9yRGVzdHJveWVkICgpIHtcbiAgICByZXR1cm4gIXRoaXMudGV4dEVkaXRvciB8fFxuICAgICAgICAgICB0aGlzLnRleHRFZGl0b3IuaXNEZXN0cm95ZWQoKSB8fFxuICAgICAgICAgICAhdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/minimap/lib/adapters/stable-adapter.js
