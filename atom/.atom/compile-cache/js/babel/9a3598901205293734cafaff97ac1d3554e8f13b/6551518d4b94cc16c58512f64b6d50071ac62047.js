Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _messageElement = require('./message-element');

'use babel';

var Interact = require('interact.js');

var BottomPanel = (function () {
  function BottomPanel(scope) {
    var _this = this;

    _classCallCheck(this, BottomPanel);

    this.subscriptions = new _atom.CompositeDisposable();
    this.element = document.createElement('linter-panel'); // TODO(steelbrain): Make this a `div`
    this.element.tabIndex = '-1';
    this.messagesElement = document.createElement('div');
    this.panel = atom.workspace.addBottomPanel({ item: this.element, visible: false, priority: 500 });
    this.visibility = false;
    this.visibleMessages = 0;
    this.alwaysTakeMinimumSpace = atom.config.get('linter.alwaysTakeMinimumSpace');
    this.errorPanelHeight = atom.config.get('linter.errorPanelHeight');
    this.configVisibility = atom.config.get('linter.showErrorPanel');
    this.scope = scope;
    this.messages = new Map();

    // Keep messages contained to measure height.
    this.element.appendChild(this.messagesElement);

    this.subscriptions.add(atom.config.onDidChange('linter.alwaysTakeMinimumSpace', function (_ref) {
      var newValue = _ref.newValue;
      var oldValue = _ref.oldValue;

      _this.alwaysTakeMinimumSpace = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.errorPanelHeight', function (_ref2) {
      var newValue = _ref2.newValue;
      var oldValue = _ref2.oldValue;

      _this.errorPanelHeight = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.showErrorPanel', function (_ref3) {
      var newValue = _ref3.newValue;
      var oldValue = _ref3.oldValue;

      _this.configVisibility = newValue;
      _this.updateVisibility();
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      _this.paneVisibility = paneItem === atom.workspace.getActiveTextEditor();
      _this.updateVisibility();
    }));

    Interact(this.element).resizable({ edges: { top: true } }).on('resizemove', function (event) {
      event.target.style.height = event.rect.height + 'px';
    }).on('resizeend', function (event) {
      atom.config.set('linter.errorPanelHeight', event.target.clientHeight);
    });
  }

  _createClass(BottomPanel, [{
    key: 'refresh',
    value: function refresh(scope) {
      this.scope = scope;
      this.visibleMessages = 0;

      for (var message of this.messages) {
        if (message[1].updateVisibility(scope).status) this.visibleMessages++;
      }

      this.updateVisibility();
    }
  }, {
    key: 'setMessages',
    value: function setMessages(_ref4) {
      var added = _ref4.added;
      var removed = _ref4.removed;

      if (removed.length) this.removeMessages(removed);

      for (var message of added) {
        var messageElement = _messageElement.Message.fromMessage(message);
        this.messagesElement.appendChild(messageElement);
        messageElement.updateVisibility(this.scope);
        if (messageElement.status) this.visibleMessages++;
        this.messages.set(message, messageElement);
      }

      this.updateVisibility();
    }
  }, {
    key: 'updateHeight',
    value: function updateHeight() {
      var height = this.errorPanelHeight;

      if (this.alwaysTakeMinimumSpace) {
        // Add `1px` for the top border.
        height = Math.min(this.messagesElement.clientHeight + 1, height);
      }

      this.element.style.height = height + 'px';
    }
  }, {
    key: 'removeMessages',
    value: function removeMessages(removed) {
      for (var message of removed) {
        if (this.messages.has(message)) {
          var messageElement = this.messages.get(message);
          if (messageElement.status) this.visibleMessages--;
          this.messagesElement.removeChild(messageElement);
          this.messages['delete'](message);
        }
      }
    }
  }, {
    key: 'getVisibility',
    value: function getVisibility() {
      return this.visibility;
    }
  }, {
    key: 'updateVisibility',
    value: function updateVisibility() {
      this.visibility = this.configVisibility && this.paneVisibility && this.visibleMessages > 0;

      if (this.visibility) {
        this.panel.show();
        this.updateHeight();
      } else {
        this.panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.messages.clear();
      this.panel.destroy();
    }
  }]);

  return BottomPanel;
})();

exports.BottomPanel = BottomPanel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9ib3R0b20tcGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBR2tDLE1BQU07OzhCQUNsQixtQkFBbUI7O0FBSnpDLFdBQVcsQ0FBQTs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7O0lBSTFCLFdBQVc7QUFDWCxXQURBLFdBQVcsQ0FDVixLQUFLLEVBQUU7OzswQkFEUixXQUFXOztBQUVwQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF1QixDQUFBO0FBQzVDLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUNyRCxRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDNUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3BELFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFBO0FBQy9GLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0FBQzlFLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQ2xFLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxD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QUksY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDakQsY0FBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDaEQsY0FBSSxDQUFDLFFBQVEsVUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQzlCO09BQ0Y7S0FDRjs7O1dBQ1kseUJBQUc7QUFDZCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7S0FDdkI7OztXQUNlLDRCQUFHO0FBQ2pCLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUE7O0FBRTFGLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixZQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2pCLFlBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtPQUNwQixNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUNsQjtLQUNGOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3JCOzs7U0EzR1UsV0FBVyIsImZpbGUiOiIvaG9tZS9lcHNlLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdWkvYm90dG9tLXBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgSW50ZXJhY3QgPSByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQge01lc3NhZ2V9IGZyb20gJy4vbWVzc2FnZS1lbGVtZW50J1xuXG5leHBvcnQgY2xhc3MgQm90dG9tUGFuZWwge1xuICBjb25zdHJ1Y3RvcihzY29wZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGludGVyLXBhbmVsJykgLy8gVE9ETyhzdGVlbGJyYWluKTogTWFrZSB0aGlzIGEgYGRpdmBcbiAgICB0aGlzLmVsZW1lbnQudGFiSW5kZXggPSAnLTEnXG4gICAgdGhpcy5tZXNzYWdlc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCh7aXRlbTogdGhpcy5lbGVtZW50LCB2aXNpYmxlOiBmYWxzZSwgcHJpb3JpdHk6IDUwMH0pXG4gICAgdGhpcy52aXNpYmlsaXR5ID0gZmFsc2VcbiAgICB0aGlzLnZpc2libGVNZXNzYWdlcyA9IDBcbiAgICB0aGlzLmFsd2F5c1Rha2VNaW5pbXVtU3BhY2UgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5hbHdheXNUYWtlTWluaW11bVNwYWNlJylcbiAgICB0aGlzLmVycm9yUGFuZWxIZWlnaHQgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5lcnJvclBhbmVsSGVpZ2h0JylcbiAgICB0aGlzLmNvbmZpZ1Zpc2liaWxpdHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5zaG93RXJyb3JQYW5lbCcpXG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNYXAoKVxuXG4gICAgLy8gS2VlcCBtZXNzYWdlcyBjb250YWluZWQgdG8gbWVhc3VyZSBoZWlnaHQuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMubWVzc2FnZXNFbGVtZW50KVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbGludGVyLmFsd2F5c1Rha2VNaW5pbXVtU3BhY2UnLCAoe25ld1ZhbHVlLCBvbGRWYWx1ZX0pID0+IHtcbiAgICAgIHRoaXMuYWx3YXlzVGFrZU1pbmltdW1TcGFjZSA9IG5ld1ZhbHVlXG4gICAgICB0aGlzLnVwZGF0ZUhlaWdodCgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsaW50ZXIuZXJyb3JQYW5lbEhlaWdodCcsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT4ge1xuICAgICAgdGhpcy5lcnJvclBhbmVsSGVpZ2h0ID0gbmV3VmFsdWVcbiAgICAgIHRoaXMudXBkYXRlSGVpZ2h0KClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xpbnRlci5zaG93RXJyb3JQYW5lbCcsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT4ge1xuICAgICAgdGhpcy5jb25maWdWaXNpYmlsaXR5ID0gbmV3VmFsdWVcbiAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVBY3RpdmVQYW5lSXRlbShwYW5lSXRlbSA9PiB7XG4gICAgICB0aGlzLnBhbmVWaXNpYmlsaXR5ID0gcGFuZUl0ZW0gPT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KClcbiAgICB9KSlcblxuICAgIEludGVyYWN0KHRoaXMuZWxlbWVudCkucmVzaXphYmxlKHtlZGdlczoge3RvcDogdHJ1ZX19KVxuICAgICAgLm9uKCdyZXNpemVtb3ZlJywgZXZlbnQgPT4ge1xuICAgICAgICBldmVudC50YXJnZXQuc3R5bGUuaGVpZ2h0ID0gYCR7ZXZlbnQucmVjdC5oZWlnaHR9cHhgXG4gICAgICB9KVxuICAgICAgLm9uKCdyZXNpemVlbmQnLCBldmVudCA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmVycm9yUGFuZWxIZWlnaHQnLCBldmVudC50YXJnZXQuY2xpZW50SGVpZ2h0KVxuICAgICAgfSlcbiAgfVxuICByZWZyZXNoKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG4gICAgdGhpcy52aXNpYmxlTWVzc2FnZXMgPSAwXG5cbiAgICBmb3IgKGxldCBtZXNzYWdlIG9mIHRoaXMubWVzc2FnZXMpIHtcbiAgICAgIGlmIChtZXNzYWdlWzFdLnVwZGF0ZVZpc2liaWxpdHkoc2NvcGUpLnN0YXR1cykgdGhpcy52aXNpYmxlTWVzc2FnZXMrK1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eSgpXG4gIH1cbiAgc2V0TWVzc2FnZXMoe2FkZGVkLCByZW1vdmVkfSkge1xuICAgIGlmIChyZW1vdmVkLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZXMocmVtb3ZlZClcblxuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgYWRkZWQpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gTWVzc2FnZS5mcm9tTWVzc2FnZShtZXNzYWdlKVxuICAgICAgdGhpcy5tZXNzYWdlc0VsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpXG4gICAgICBtZXNzYWdlRWxlbWVudC51cGRhdGVWaXNpYmlsaXR5KHRoaXMuc2NvcGUpXG4gICAgICBpZiAobWVzc2FnZUVsZW1lbnQuc3RhdHVzKSB0aGlzLnZpc2libGVNZXNzYWdlcysrXG4gICAgICB0aGlzLm1lc3NhZ2VzLnNldChtZXNzYWdlLCBtZXNzYWdlRWxlbWVudClcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKVxuICB9XG4gIHVwZGF0ZUhlaWdodCgpIHtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5lcnJvclBhbmVsSGVpZ2h0XG5cbiAgICBpZiAodGhpcy5hbHdheXNUYWtlTWluaW11bVNwYWNlKSB7XG4gICAgICAvLyBBZGQgYDFweGAgZm9yIHRoZSB0b3AgYm9yZGVyLlxuICAgICAgaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5tZXNzYWdlc0VsZW1lbnQuY2xpZW50SGVpZ2h0ICsgMSwgaGVpZ2h0KVxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIH1cbiAgcmVtb3ZlTWVzc2FnZXMocmVtb3ZlZCkge1xuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgcmVtb3ZlZCkge1xuICAgICAgaWYgKHRoaXMubWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gdGhpcy5tZXNzYWdlcy5nZXQobWVzc2FnZSlcbiAgICAgICAgaWYgKG1lc3NhZ2VFbGVtZW50LnN0YXR1cykgdGhpcy52aXNpYmxlTWVzc2FnZXMtLVxuICAgICAgICB0aGlzLm1lc3NhZ2VzRWxlbWVudC5yZW1vdmVDaGlsZChtZXNzYWdlRWxlbWVudClcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5kZWxldGUobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0VmlzaWJpbGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpYmlsaXR5XG4gIH1cbiAgdXBkYXRlVmlzaWJpbGl0eSgpIHtcbiAgICB0aGlzLnZpc2liaWxpdHkgPSB0aGlzLmNvbmZpZ1Zpc2liaWxpdHkgJiYgdGhpcy5wYW5lVmlzaWJpbGl0eSAmJiB0aGlzLnZpc2libGVNZXNzYWdlcyA+IDBcblxuICAgIGlmICh0aGlzLnZpc2liaWxpdHkpIHtcbiAgICAgIHRoaXMucGFuZWwuc2hvdygpXG4gICAgICB0aGlzLnVwZGF0ZUhlaWdodCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFuZWwuaGlkZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMubWVzc2FnZXMuY2xlYXIoKVxuICAgIHRoaXMucGFuZWwuZGVzdHJveSgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/epse/.atom/packages/linter/lib/ui/bottom-panel.js
