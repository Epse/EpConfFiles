Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var EditorLinter = (function () {
  function EditorLinter(editor) {
    var _this = this;

    _classCallCheck(this, EditorLinter);

    if (!(editor instanceof _atom.TextEditor)) {
      throw new Error('Given editor is not really an editor');
    }

    this.editor = editor;
    this.emitter = new _atom.Emitter();
    this.messages = new Set();
    this.markers = new WeakMap();
    this.gutter = null;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter.underlineIssues', function (underlineIssues) {
      return _this.underlineIssues = underlineIssues;
    }));
    this.subscriptions.add(this.editor.onDidDestroy(function () {
      return _this.dispose();
    }));
    this.subscriptions.add(this.editor.onDidSave(function () {
      return _this.emitter.emit('should-lint', false);
    }));
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(function (_ref) {
      var oldBufferPosition = _ref.oldBufferPosition;
      var newBufferPosition = _ref.newBufferPosition;

      if (newBufferPosition.row !== oldBufferPosition.row) {
        _this.emitter.emit('should-update-line-messages');
      }
      _this.emitter.emit('should-update-bubble');
    }));
    this.subscriptions.add(atom.config.observe('linter.gutterEnabled', function (gutterEnabled) {
      _this.gutterEnabled = gutterEnabled;
      _this.handleGutter();
    }));
    // Using onDidChange instead of observe here 'cause the same function is invoked above
    this.subscriptions.add(atom.config.onDidChange('linter.gutterPosition', function () {
      return _this.handleGutter();
    }));
    this.subscriptions.add(this.onDidMessageAdd(function (message) {
      if (!_this.underlineIssues && !_this.gutterEnabled) {
        return; // No-Op
      }
      var marker = _this.editor.markBufferRange(message.range, { invalidate: 'inside' });
      _this.markers.set(message, marker);
      if (_this.underlineIssues) {
        _this.editor.decorateMarker(marker, {
          type: 'highlight',
          'class': 'linter-highlight ' + message['class']
        });
      }
      if (_this.gutterEnabled) {
        var item = document.createElement('span');
        item.className = 'linter-gutter linter-highlight ' + message['class'];
        _this.gutter.decorateMarker(marker, {
          'class': 'linter-row',
          item: item
        });
      }
    }));
    this.subscriptions.add(this.onDidMessageDelete(function (message) {
      if (_this.markers.has(message)) {
        _this.markers.get(message).destroy();
        _this.markers['delete'](message);
      }
    }));

    // Atom invokes the onDidStopChanging callback immediately on Editor creation. So we wait a moment
    setImmediate(function () {
      _this.subscriptions.add(_this.editor.onDidStopChanging(function () {
        return _this.emitter.emit('should-lint', true);
      }));
    });
  }

  _createClass(EditorLinter, [{
    key: 'handleGutter',
    value: function handleGutter() {
      if (this.gutter !== null) {
        this.removeGutter();
      }
      if (this.gutterEnabled) {
        this.addGutter();
      }
    }
  }, {
    key: 'addGutter',
    value: function addGutter() {
      var position = atom.config.get('linter.gutterPosition');
      this.gutter = this.editor.addGutter({
        name: 'linter',
        priority: position === 'Left' ? -100 : 100
      });
    }
  }, {
    key: 'removeGutter',
    value: function removeGutter() {
      if (this.gutter !== null) {
        try {
          this.gutter.destroy();
          // Atom throws when we try to remove a gutter container from a closed text editor
        } catch (err) {}
        this.gutter = null;
      }
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this.messages;
    }
  }, {
    key: 'addMessage',
    value: function addMessage(message) {
      if (!this.messages.has(message)) {
        this.messages.add(message);
        this.emitter.emit('did-message-add', message);
        this.emitter.emit('did-message-change', { message: message, type: 'add' });
      }
    }
  }, {
    key: 'deleteMessage',
    value: function deleteMessage(message) {
      if (this.messages.has(message)) {
        this.messages['delete'](message);
        this.emitter.emit('did-message-delete', message);
        this.emitter.emit('did-message-change', { message: message, type: 'delete' });
      }
    }
  }, {
    key: 'lint',
    value: function lint() {
      var onChange = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.emitter.emit('should-lint', onChange);
    }
  }, {
    key: 'onDidMessageAdd',
    value: function onDidMessageAdd(callback) {
      return this.emitter.on('did-message-add', callback);
    }
  }, {
    key: 'onDidMessageDelete',
    value: function onDidMessageDelete(callback) {
      return this.emitter.on('did-message-delete', callback);
    }
  }, {
    key: 'onDidMessageChange',
    value: function onDidMessageChange(callback) {
      return this.emitter.on('did-message-change', callback);
    }
  }, {
    key: 'onShouldUpdateBubble',
    value: function onShouldUpdateBubble(callback) {
      return this.emitter.on('should-update-bubble', callback);
    }
  }, {
    key: 'onShouldUpdateLineMessages',
    value: function onShouldUpdateLineMessages(callback) {
      return this.emitter.on('should-update-line-messages', callback);
    }
  }, {
    key: 'onShouldLint',
    value: function onShouldLint(callback) {
      return this.emitter.on('should-lint', callback);
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      if (this.markers.size) {
        this.markers.forEach(function (marker) {
          return marker.destroy();
        });
        this.markers.clear();
      }
      this.removeGutter();
      this.subscriptions.dispose();
      this.messages.clear();
      this.emitter.dispose();
    }
  }]);

  return EditorLinter;
})();

exports['default'] = EditorLinter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9lZGl0b3ItbGludGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUV1RCxNQUFNOztBQUY3RCxXQUFXLENBQUE7O0lBR1UsWUFBWTtBQUNwQixXQURRLFlBQVksQ0FDbkIsTUFBTSxFQUFFOzs7MEJBREQsWUFBWTs7QUFFN0IsUUFBSSxFQUFFLE1BQU0sNkJBQXNCLEFBQUMsRUFBRTtBQUNuQyxZQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUE7S0FDeEQ7O0FBRUQsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN6QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7QUFDNUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBdUIsQ0FBQTs7QUFFNUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBQSxlQUFlO2FBQ2xGLE1BQUssZUFBZSxHQUFHLGVBQWU7S0FBQSxDQUN2QyxDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUM5QyxNQUFLLE9BQU8sRUFBRTtLQUFBLENBQ2YsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7YUFDM0MsTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUM7S0FBQSxDQUN4QyxDQUFDLENB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QUU7QUFDckIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUVXLHNCQUFDLFFBQVEsRUFBRTtBQUNyQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNoQyxVQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtpQkFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO1NBQUEsQ0FBQyxDQUFBO0FBQ2hELFlBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7T0FDckI7QUFDRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDbkIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3JCLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDdkI7OztTQWpLa0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1saW50ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge1RleHRFZGl0b3IsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0b3JMaW50ZXIge1xuICBjb25zdHJ1Y3RvcihlZGl0b3IpIHtcbiAgICBpZiAoIShlZGl0b3IgaW5zdGFuY2VvZiBUZXh0RWRpdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdHaXZlbiBlZGl0b3IgaXMgbm90IHJlYWxseSBhbiBlZGl0b3InKVxuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgU2V0KClcbiAgICB0aGlzLm1hcmtlcnMgPSBuZXcgV2Vha01hcCgpXG4gICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLnVuZGVybGluZUlzc3VlcycsIHVuZGVybGluZUlzc3VlcyA9PlxuICAgICAgdGhpcy51bmRlcmxpbmVJc3N1ZXMgPSB1bmRlcmxpbmVJc3N1ZXNcbiAgICApKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lZGl0b3Iub25EaWREZXN0cm95KCgpID0+XG4gICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vbkRpZFNhdmUoKCkgPT5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtbGludCcsIGZhbHNlKVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCh7b2xkQnVmZmVyUG9zaXRpb24sIG5ld0J1ZmZlclBvc2l0aW9ufSkgPT4ge1xuICAgICAgaWYgKG5ld0J1ZmZlclBvc2l0aW9uLnJvdyAhPT0gb2xkQnVmZmVyUG9zaXRpb24ucm93KSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtdXBkYXRlLWxpbmUtbWVzc2FnZXMnKVxuICAgICAgfVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC11cGRhdGUtYnViYmxlJylcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5ndXR0ZXJFbmFibGVkJywgZ3V0dGVyRW5hYmxlZCA9PiB7XG4gICAgICB0aGlzLmd1dHRlckVuYWJsZWQgPSBndXR0ZXJFbmFibGVkXG4gICAgICB0aGlzLmhhbmRsZUd1dHRlcigpXG4gICAgfSkpXG4gICAgLy8gVXNpbmcgb25EaWRDaGFuZ2UgaW5zdGVhZCBvZiBvYnNlcnZlIGhlcmUgJ2NhdXNlIHRoZSBzYW1lIGZ1bmN0aW9uIGlzIGludm9rZWQgYWJvdmVcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsaW50ZXIuZ3V0dGVyUG9zaXRpb24nLCAoKSA9PlxuICAgICAgdGhpcy5oYW5kbGVHdXR0ZXIoKVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm9uRGlkTWVzc2FnZUFkZChtZXNzYWdlID0+IHtcbiAgICAgIGlmICghdGhpcy51bmRlcmxpbmVJc3N1ZXMgJiYgIXRoaXMuZ3V0dGVyRW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gLy8gTm8tT3BcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShtZXNzYWdlLnJhbmdlLCB7aW52YWxpZGF0ZTogJ2luc2lkZSd9KVxuICAgICAgdGhpcy5tYXJrZXJzLnNldChtZXNzYWdlLCBtYXJrZXIpXG4gICAgICBpZiAodGhpcy51bmRlcmxpbmVJc3N1ZXMpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgICAgY2xhc3M6IGBsaW50ZXItaGlnaGxpZ2h0ICR7bWVzc2FnZS5jbGFzc31gXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5ndXR0ZXJFbmFibGVkKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgaXRlbS5jbGFzc05hbWUgPSBgbGludGVyLWd1dHRlciBsaW50ZXItaGlnaGxpZ2h0ICR7bWVzc2FnZS5jbGFzc31gXG4gICAgICAgIHRoaXMuZ3V0dGVyLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICAgIGNsYXNzOiAnbGludGVyLXJvdycsXG4gICAgICAgICAgaXRlbVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5vbkRpZE1lc3NhZ2VEZWxldGUobWVzc2FnZSA9PiB7XG4gICAgICBpZiAodGhpcy5tYXJrZXJzLmhhcyhtZXNzYWdlKSkge1xuICAgICAgICB0aGlzLm1hcmtlcnMuZ2V0KG1lc3NhZ2UpLmRlc3Ryb3koKVxuICAgICAgICB0aGlzLm1hcmtlcnMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICAvLyBBdG9tIGludm9rZXMgdGhlIG9uRGlkU3RvcENoYW5naW5nIGNhbGxiYWNrIGltbWVkaWF0ZWx5IG9uIEVkaXRvciBjcmVhdGlvbi4gU28gd2Ugd2FpdCBhIG1vbWVudFxuICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKCgpID0+XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtbGludCcsIHRydWUpXG4gICAgICApKVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVHdXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuZ3V0dGVyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgfVxuICAgIGlmICh0aGlzLmd1dHRlckVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYWRkR3V0dGVyKClcbiAgICB9XG4gIH1cblxuICBhZGRHdXR0ZXIoKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5ndXR0ZXJQb3NpdGlvbicpXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLmVkaXRvci5hZGRHdXR0ZXIoe1xuICAgICAgbmFtZTogJ2xpbnRlcicsXG4gICAgICBwcmlvcml0eTogcG9zaXRpb24gPT09ICdMZWZ0JyA/IC0xMDAgOiAxMDBcbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlR3V0dGVyKCkge1xuICAgIGlmICh0aGlzLmd1dHRlciAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5ndXR0ZXIuZGVzdHJveSgpXG4gICAgICAgIC8vIEF0b20gdGhyb3dzIHdoZW4gd2UgdHJ5IHRvIHJlbW92ZSBhIGd1dHRlciBjb250YWluZXIgZnJvbSBhIGNsb3NlZCB0ZXh0IGVkaXRvclxuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZ2V0TWVzc2FnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZXNcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmICghdGhpcy5tZXNzYWdlcy5oYXMobWVzc2FnZSkpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuYWRkKG1lc3NhZ2UpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW1lc3NhZ2UtYWRkJywgbWVzc2FnZSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbWVzc2FnZS1jaGFuZ2UnLCB7bWVzc2FnZSwgdHlwZTogJ2FkZCd9KVxuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmhhcyhtZXNzYWdlKSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5kZWxldGUobWVzc2FnZSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbWVzc2FnZS1kZWxldGUnLCBtZXNzYWdlKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1tZXNzYWdlLWNoYW5nZScsIHttZXNzYWdlLCB0eXBlOiAnZGVsZXRlJ30pXG4gICAgfVxuICB9XG5cbiAgbGludChvbkNoYW5nZSA9IGZhbHNlKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1saW50Jywgb25DaGFuZ2UpXG4gIH1cblxuICBvbkRpZE1lc3NhZ2VBZGQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbWVzc2FnZS1hZGQnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkTWVzc2FnZURlbGV0ZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1tZXNzYWdlLWRlbGV0ZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRNZXNzYWdlQ2hhbmdlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW1lc3NhZ2UtY2hhbmdlJywgY2FsbGJhY2spXG4gIH1cblxuICBvblNob3VsZFVwZGF0ZUJ1YmJsZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC11cGRhdGUtYnViYmxlJywgY2FsbGJhY2spXG4gIH1cblxuICBvblNob3VsZFVwZGF0ZUxpbmVNZXNzYWdlcyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC11cGRhdGUtbGluZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25TaG91bGRMaW50KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWxpbnQnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpXG4gICAgaWYgKHRoaXMubWFya2Vycy5zaXplKSB7XG4gICAgICB0aGlzLm1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLmRlc3Ryb3koKSlcbiAgICAgIHRoaXMubWFya2Vycy5jbGVhcigpXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlR3V0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5tZXNzYWdlcy5jbGVhcigpXG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=
//# sourceURL=/home/epse/.atom/packages/linter/lib/editor-linter.js
