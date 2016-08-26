var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var Validate = require('./validate');
var Helpers = require('./helpers');

var MessageRegistry = (function () {
  function MessageRegistry() {
    var _this = this;

    _classCallCheck(this, MessageRegistry);

    this.hasChanged = false;
    this.shouldRefresh = true;
    this.publicMessages = [];
    this.subscriptions = new _atom.CompositeDisposable();
    this.emitter = new _atom.Emitter();
    this.linterResponses = new Map();
    // We track messages by the underlying TextBuffer the lint was run against
    // rather than the TextEditor because there may be multiple TextEditors per
    // TextBuffer when multiple panes are in use.  For each buffer, we store a
    // map whose values are messages and whose keys are the linter that produced
    // the messages.  (Note that we are talking about linter instances, not
    // EditorLinter instances.  EditorLinter instances are per-TextEditor and
    // could result in duplicated sets of messages.)
    this.bufferMessages = new Map();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter.ignoredMessageTypes', function (value) {
      return _this.ignoredMessageTypes = value || [];
    }));

    var UpdateMessages = function UpdateMessages() {
      if (_this.shouldRefresh) {
        if (_this.hasChanged) {
          _this.hasChanged = false;
          _this.updatePublic();
        }
        Helpers.requestUpdateFrame(UpdateMessages);
      }
    };
    Helpers.requestUpdateFrame(UpdateMessages);
  }

  _createClass(MessageRegistry, [{
    key: 'set',
    value: function set(_ref) {
      var _this2 = this;

      var linter = _ref.linter;
      var messages = _ref.messages;
      var editor = _ref.editor;

      if (linter.deactivated) return;
      try {
        Validate.messages(messages, linter);
      } catch (e) {
        return Helpers.error(e);
      }
      messages = messages.filter(function (i) {
        return _this2.ignoredMessageTypes.indexOf(i.type) === -1;
      });
      if (linter.scope === 'file') {
        if (!editor.alive) return;
        if (!(editor instanceof _atom.TextEditor)) throw new Error("Given editor isn't really an editor");
        var buffer = editor.getBuffer();
        if (!this.bufferMessages.has(buffer)) this.bufferMessages.set(buffer, new Map());
        this.bufferMessages.get(buffer).set(linter, messages);
      } else {
        // It's project
        this.linterResponses.set(linter, messages);
      }
      this.hasChanged = true;
    }
  }, {
    key: 'updatePublic',
    value: function updatePublic() {
      var latestMessages = [];
      var publicMessages = [];
      var added = [];
      var removed = [];
      var currentKeys = undefined;
      var lastKeys = undefined;

      this.linterResponses.forEach(function (messages) {
        return latestMessages = latestMessages.concat(messages);
      });
      this.bufferMessages.forEach(function (bufferMessages) {
        return bufferMessages.forEach(function (messages) {
          return latestMessages = latestMessages.concat(messages);
        });
      });

      currentKeys = latestMessages.map(function (i) {
        return i.key;
      });
      lastKeys = this.publicMessages.map(function (i) {
        return i.key;
      });

      for (var i of latestMessages) {
        if (lastKeys.indexOf(i.key) === -1) {
          added.push(i);
          publicMessages.push(i);
        }
      }

      for (var i of this.publicMessages) {
        if (currentKeys.indexOf(i.key) === -1) removed.push(i);else publicMessages.push(i);
      }this.publicMessages = publicMessages;
      this.emitter.emit('did-update-messages', { added: added, removed: removed, messages: publicMessages });
    }
  }, {
    key: 'onDidUpdateMessages',
    value: function onDidUpdateMessages(callback) {
      return this.emitter.on('did-update-messages', callback);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages(linter) {
      if (linter.scope === 'file') {
        this.bufferMessages.forEach(function (r) {
          return r['delete'](linter);
        });
        this.hasChanged = true;
      } else if (this.linterResponses.has(linter)) {
        this.linterResponses['delete'](linter);
        this.hasChanged = true;
      }
    }
  }, {
    key: 'deleteEditorMessages',
    value: function deleteEditorMessages(editor) {
      // Caveat: in the event that there are multiple TextEditor instances open
      // referring to the same underlying buffer and those instances are not also
      // closed, the linting results for this buffer will be temporarily removed
      // until such time as a lint is re-triggered by one of the other
      // corresponding EditorLinter instances.  There are ways to mitigate this,
      // but they all involve some complexity that does not yet seem justified.
      var buffer = editor.getBuffer();
      if (!this.bufferMessages.has(buffer)) return;
      this.bufferMessages['delete'](buffer);
      this.hasChanged = true;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.shouldRefresh = false;
      this.subscriptions.dispose();
      this.linterResponses.clear();
      this.bufferMessages.clear();
    }
  }]);

  return MessageRegistry;
})();

module.exports = MessageRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tZXNzYWdlLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBQ3VELE1BQU07O0FBRDdELFdBQVcsQ0FBQTs7QUFHWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBOztJQUU5QixlQUFlO0FBQ1IsV0FEUCxlQUFlLEdBQ0w7OzswQkFEVixlQUFlOztBQUVqQixRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtBQUN2QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQTtBQUN4QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7Ozs7Ozs7O0FBUWhDLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFL0IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFVBQUEsS0FBSzthQUFJLE1BQUssbUJBQW1CLEdBQUksS0FBSyxJQUFJLEVBQUUsQUFBQztLQUFBLENBQUMsQ0FBQyxDQUFBOztBQUU1SCxRQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDM0IsVUFBSSxNQUFLLGFBQWEsRUFBRTtBQUN0QixZQUFJLE1BQUssVUFBVSxFQUFFO0FBQ25CLGdCQUFLLFVBQVUsR0FBRyxLQUFLLENBQUE7QUFDdkIs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QVUsR0FBRyxJQUFJLENBQUE7T0FDdkI7S0FDRjs7O1dBQ21CLDhCQUFDLE1BQU0sRUFBRTs7Ozs7OztBQU8zQixVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEMsVUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU07QUFDNUMsVUFBSSxDQUFDLGNBQWMsVUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xDLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0tBQ3ZCOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFBO0FBQzFCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQzVCOzs7U0E5R0csZUFBZTs7O0FBaUhyQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQSIsImZpbGUiOiIvaG9tZS9lcHNlLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWVzc2FnZS1yZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5pbXBvcnQge0VtaXR0ZXIsIFRleHRFZGl0b3IsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5cbmNvbnN0IFZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0ZScpXG5jb25zdCBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcblxuY2xhc3MgTWVzc2FnZVJlZ2lzdHJ5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5oYXNDaGFuZ2VkID0gZmFsc2VcbiAgICB0aGlzLnNob3VsZFJlZnJlc2ggPSB0cnVlXG4gICAgdGhpcy5wdWJsaWNNZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmxpbnRlclJlc3BvbnNlcyA9IG5ldyBNYXAoKVxuICAgIC8vIFdlIHRyYWNrIG1lc3NhZ2VzIGJ5IHRoZSB1bmRlcmx5aW5nIFRleHRCdWZmZXIgdGhlIGxpbnQgd2FzIHJ1biBhZ2FpbnN0XG4gICAgLy8gcmF0aGVyIHRoYW4gdGhlIFRleHRFZGl0b3IgYmVjYXVzZSB0aGVyZSBtYXkgYmUgbXVsdGlwbGUgVGV4dEVkaXRvcnMgcGVyXG4gICAgLy8gVGV4dEJ1ZmZlciB3aGVuIG11bHRpcGxlIHBhbmVzIGFyZSBpbiB1c2UuICBGb3IgZWFjaCBidWZmZXIsIHdlIHN0b3JlIGFcbiAgICAvLyBtYXAgd2hvc2UgdmFsdWVzIGFyZSBtZXNzYWdlcyBhbmQgd2hvc2Uga2V5cyBhcmUgdGhlIGxpbnRlciB0aGF0IHByb2R1Y2VkXG4gICAgLy8gdGhlIG1lc3NhZ2VzLiAgKE5vdGUgdGhhdCB3ZSBhcmUgdGFsa2luZyBhYm91dCBsaW50ZXIgaW5zdGFuY2VzLCBub3RcbiAgICAvLyBFZGl0b3JMaW50ZXIgaW5zdGFuY2VzLiAgRWRpdG9yTGludGVyIGluc3RhbmNlcyBhcmUgcGVyLVRleHRFZGl0b3IgYW5kXG4gICAgLy8gY291bGQgcmVzdWx0IGluIGR1cGxpY2F0ZWQgc2V0cyBvZiBtZXNzYWdlcy4pXG4gICAgdGhpcy5idWZmZXJNZXNzYWdlcyA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaWdub3JlZE1lc3NhZ2VUeXBlcycsIHZhbHVlID0+IHRoaXMuaWdub3JlZE1lc3NhZ2VUeXBlcyA9ICh2YWx1ZSB8fCBbXSkpKVxuXG4gICAgY29uc3QgVXBkYXRlTWVzc2FnZXMgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zaG91bGRSZWZyZXNoKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0NoYW5nZWQpIHtcbiAgICAgICAgICB0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZVxuICAgICAgICAgIHRoaXMudXBkYXRlUHVibGljKClcbiAgICAgICAgfVxuICAgICAgICBIZWxwZXJzLnJlcXVlc3RVcGRhdGVGcmFtZShVcGRhdGVNZXNzYWdlcylcbiAgICAgIH1cbiAgICB9XG4gICAgSGVscGVycy5yZXF1ZXN0VXBkYXRlRnJhbWUoVXBkYXRlTWVzc2FnZXMpXG4gIH1cbiAgc2V0KHtsaW50ZXIsIG1lc3NhZ2VzLCBlZGl0b3J9KSB7XG4gICAgaWYgKGxpbnRlci5kZWFjdGl2YXRlZCkgcmV0dXJuXG4gICAgdHJ5IHtcbiAgICAgIFZhbGlkYXRlLm1lc3NhZ2VzKG1lc3NhZ2VzLCBsaW50ZXIpXG4gICAgfSBjYXRjaCAoZSkgeyByZXR1cm4gSGVscGVycy5lcnJvcihlKSB9XG4gICAgbWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoaSA9PiB0aGlzLmlnbm9yZWRNZXNzYWdlVHlwZXMuaW5kZXhPZihpLnR5cGUpID09PSAtMSlcbiAgICBpZiAobGludGVyLnNjb3BlID09PSAnZmlsZScpIHtcbiAgICAgIGlmICghZWRpdG9yLmFsaXZlKSByZXR1cm5cbiAgICAgIGlmICghKGVkaXRvciBpbnN0YW5jZW9mIFRleHRFZGl0b3IpKSB0aHJvdyBuZXcgRXJyb3IoXCJHaXZlbiBlZGl0b3IgaXNuJ3QgcmVhbGx5IGFuIGVkaXRvclwiKVxuICAgICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgaWYgKCF0aGlzLmJ1ZmZlck1lc3NhZ2VzLmhhcyhidWZmZXIpKVxuICAgICAgICB0aGlzLmJ1ZmZlck1lc3NhZ2VzLnNldChidWZmZXIsIG5ldyBNYXAoKSlcbiAgICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZ2V0KGJ1ZmZlcikuc2V0KGxpbnRlciwgbWVzc2FnZXMpXG4gICAgfSBlbHNlIHsgLy8gSXQncyBwcm9qZWN0XG4gICAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5zZXQobGludGVyLCBtZXNzYWdlcylcbiAgICB9XG4gICAgdGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZVxuICB9XG4gIHVwZGF0ZVB1YmxpYygpIHtcbiAgICBsZXQgbGF0ZXN0TWVzc2FnZXMgPSBbXVxuICAgIGxldCBwdWJsaWNNZXNzYWdlcyA9IFtdXG4gICAgbGV0IGFkZGVkID0gW11cbiAgICBsZXQgcmVtb3ZlZCA9IFtdXG4gICAgbGV0IGN1cnJlbnRLZXlzXG4gICAgbGV0IGxhc3RLZXlzXG5cbiAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5mb3JFYWNoKG1lc3NhZ2VzID0+IGxhdGVzdE1lc3NhZ2VzID0gbGF0ZXN0TWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKSlcbiAgICB0aGlzLmJ1ZmZlck1lc3NhZ2VzLmZvckVhY2goYnVmZmVyTWVzc2FnZXMgPT5cbiAgICAgIGJ1ZmZlck1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZXMgPT4gbGF0ZXN0TWVzc2FnZXMgPSBsYXRlc3RNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpKVxuICAgIClcblxuICAgIGN1cnJlbnRLZXlzID0gbGF0ZXN0TWVzc2FnZXMubWFwKGkgPT4gaS5rZXkpXG4gICAgbGFzdEtleXMgPSB0aGlzLnB1YmxpY01lc3NhZ2VzLm1hcChpID0+IGkua2V5KVxuXG4gICAgZm9yIChsZXQgaSBvZiBsYXRlc3RNZXNzYWdlcykge1xuICAgICAgaWYgKGxhc3RLZXlzLmluZGV4T2YoaS5rZXkpID09PSAtMSkge1xuICAgICAgICBhZGRlZC5wdXNoKGkpXG4gICAgICAgIHB1YmxpY01lc3NhZ2VzLnB1c2goaSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpIG9mIHRoaXMucHVibGljTWVzc2FnZXMpXG4gICAgICBpZiAoY3VycmVudEtleXMuaW5kZXhPZihpLmtleSkgPT09IC0xKVxuICAgICAgICByZW1vdmVkLnB1c2goaSlcbiAgICAgIGVsc2VcbiAgICAgICAgcHVibGljTWVzc2FnZXMucHVzaChpKVxuXG4gICAgdGhpcy5wdWJsaWNNZXNzYWdlcyA9IHB1YmxpY01lc3NhZ2VzXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCB7YWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzOiBwdWJsaWNNZXNzYWdlc30pXG4gIH1cbiAgb25EaWRVcGRhdGVNZXNzYWdlcyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCBjYWxsYmFjaylcbiAgfVxuICBkZWxldGVNZXNzYWdlcyhsaW50ZXIpIHtcbiAgICBpZiAobGludGVyLnNjb3BlID09PSAnZmlsZScpIHtcbiAgICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZm9yRWFjaChyID0+IHIuZGVsZXRlKGxpbnRlcikpXG4gICAgICB0aGlzLmhhc0NoYW5nZWQgPSB0cnVlXG4gICAgfSBlbHNlIGlmKHRoaXMubGludGVyUmVzcG9uc2VzLmhhcyhsaW50ZXIpKSB7XG4gICAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5kZWxldGUobGludGVyKVxuICAgICAgdGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZVxuICAgIH1cbiAgfVxuICBkZWxldGVFZGl0b3JNZXNzYWdlcyhlZGl0b3IpIHtcbiAgICAvLyBDYXZlYXQ6IGluIHRoZSBldmVudCB0aGF0IHRoZXJlIGFyZSBtdWx0aXBsZSBUZXh0RWRpdG9yIGluc3RhbmNlcyBvcGVuXG4gICAgLy8gcmVmZXJyaW5nIHRvIHRoZSBzYW1lIHVuZGVybHlpbmcgYnVmZmVyIGFuZCB0aG9zZSBpbnN0YW5jZXMgYXJlIG5vdCBhbHNvXG4gICAgLy8gY2xvc2VkLCB0aGUgbGludGluZyByZXN1bHRzIGZvciB0aGlzIGJ1ZmZlciB3aWxsIGJlIHRlbXBvcmFyaWx5IHJlbW92ZWRcbiAgICAvLyB1bnRpbCBzdWNoIHRpbWUgYXMgYSBsaW50IGlzIHJlLXRyaWdnZXJlZCBieSBvbmUgb2YgdGhlIG90aGVyXG4gICAgLy8gY29ycmVzcG9uZGluZyBFZGl0b3JMaW50ZXIgaW5zdGFuY2VzLiAgVGhlcmUgYXJlIHdheXMgdG8gbWl0aWdhdGUgdGhpcyxcbiAgICAvLyBidXQgdGhleSBhbGwgaW52b2x2ZSBzb21lIGNvbXBsZXhpdHkgdGhhdCBkb2VzIG5vdCB5ZXQgc2VlbSBqdXN0aWZpZWQuXG4gICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICBpZiAoIXRoaXMuYnVmZmVyTWVzc2FnZXMuaGFzKGJ1ZmZlcikpIHJldHVyblxuICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZGVsZXRlKGJ1ZmZlcilcbiAgICB0aGlzLmhhc0NoYW5nZWQgPSB0cnVlXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnNob3VsZFJlZnJlc2ggPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5jbGVhcigpXG4gICAgdGhpcy5idWZmZXJNZXNzYWdlcy5jbGVhcigpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlUmVnaXN0cnlcbiJdfQ==
//# sourceURL=/home/epse/.atom/packages/linter/lib/message-registry.js
