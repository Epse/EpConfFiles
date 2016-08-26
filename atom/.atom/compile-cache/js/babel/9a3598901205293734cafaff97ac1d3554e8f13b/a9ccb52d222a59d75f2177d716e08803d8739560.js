'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NewLine = /\r?\n/;

var Message = (function (_HTMLElement) {
  _inherits(Message, _HTMLElement);

  function Message() {
    _classCallCheck(this, Message);

    _get(Object.getPrototypeOf(Message.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Message, [{
    key: 'initialize',
    value: function initialize(message) {
      var includeLink = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      this.message = message;
      this.includeLink = includeLink;
      this.status = false;
      return this;
    }
  }, {
    key: 'updateVisibility',
    value: function updateVisibility(scope) {
      var status = true;
      if (scope === 'Line') status = this.message.currentLine;else if (scope === 'File') status = this.message.currentFile;

      if (this.children.length && this.message.filePath) {
        var link = this.querySelector('.linter-message-link');
        if (link) {
          if (scope === 'Project') {
            link.querySelector('span').removeAttribute('hidden');
          } else {
            link.querySelector('span').setAttribute('hidden', true);
          }
        }
      }

      this.status = status;

      if (status) {
        this.removeAttribute('hidden');
      } else this.setAttribute('hidden', true);

      return this;
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      if (atom.config.get('linter.showProviderName') && this.message.linter) {
        this.appendChild(Message.getName(this.message));
      }
      this.appendChild(Message.getRibbon(this.message));
      this.appendChild(Message.getMessage(this.message, this.includeLink));
    }
  }], [{
    key: 'getLink',
    value: function getLink(message) {
      var el = document.createElement('a');
      var pathEl = document.createElement('span');
      var displayFile = message.filePath;

      el.className = 'linter-message-link';

      for (var path of atom.project.getPaths()) {
        if (displayFile.indexOf(path) === 0) {
          displayFile = displayFile.substr(path.length + 1); // Path + Path Separator
          break;
        }
      }if (message.range) {
        el.textContent = 'at line ' + (message.range.start.row + 1) + ' col ' + (message.range.start.column + 1);
      }
      pathEl.textContent = ' in ' + displayFile;
      el.appendChild(pathEl);
      el.addEventListener('click', function () {
        atom.workspace.open(message.filePath).then(function () {
          if (message.range) {
            atom.workspace.getActiveTextEditor().setCursorBufferPosition(message.range.start);
          }
        });
      });
      return el;
    }
  }, {
    key: 'getMessage',
    value: function getMessage(message, includeLink) {
      if (message.multiline || NewLine.test(message.text)) {
        return Message.getMultiLineMessage(message, includeLink);
      }

      var el = document.createElement('span');
      var messageEl = document.createElement('linter-message-line');

      el.className = 'linter-message-item';

      el.appendChild(messageEl);

      if (includeLink && message.filePath) {
        el.appendChild(Message.getLink(message));
      }

      if (message.html && typeof message.html !== 'string') {
        messageEl.appendChild(message.html.cloneNode(true));
      } else if (message.html) {
        messageEl.innerHTML = message.html;
      } else if (message.text) {
        messageEl.textContent = message.text;
      }

      return el;
    }
  }, {
    key: 'getMultiLineMessage',
    value: function getMultiLineMessage(message, includeLink) {
      var container = document.createElement('span');
      var messageEl = document.createElement('linter-multiline-message');

      container.className = 'linter-message-item';
      messageEl.setAttribute('title', message.text);

      message.text.split(NewLine).forEach(function (line, index) {
        if (!line) return;

        var el = document.createElement('linter-message-line');
        el.textContent = line;
        messageEl.appendChild(el);

        // Render the link in the "title" line.
        if (index === 0 && includeLink && message.filePath) {
          messageEl.appendChild(Message.getLink(message));
        }
      });

      container.appendChild(messageEl);

      messageEl.addEventListener('click', function (e) {
        // Avoid opening the message contents when we click the link.
        var link = e.target.tagName === 'A' ? e.target : e.target.parentNode;

        if (!link.classList.contains('linter-message-link')) {
          messageEl.classList.toggle('expanded');
        }
      });

      return container;
    }
  }, {
    key: 'getName',
    value: function getName(message) {
      var el = document.createElement('span');
      el.className = 'linter-message-item badge badge-flexible linter-highlight';
      el.textContent = message.linter;
      return el;
    }
  }, {
    key: 'getRibbon',
    value: function getRibbon(message) {
      var el = document.createElement('span');
      el.className = 'linter-message-item badge badge-flexible linter-highlight';
      el.className += ' ' + message['class'];
      el.textContent = message.type;
      return el;
    }
  }, {
    key: 'fromMessage',
    value: function fromMessage(message, includeLink) {
      return new MessageElement().initialize(message, includeLink);
    }
  }]);

  return Message;
})(HTMLElement);

exports.Message = Message;
var MessageElement = document.registerElement('linter-message', {
  prototype: Message.prototype
});
exports.MessageElement = MessageElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9tZXNzYWdlLWVsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7SUFFVixPQUFPO1lBQVAsT0FBTzs7V0FBUCxPQUFPOzBCQUFQLE9BQU87OytCQUFQLE9BQU87OztlQUFQLE9BQU87O1dBQ1Isb0JBQUMsT0FBTyxFQUFzQjtVQUFwQixXQUFXLHlEQUFHLElBQUk7O0FBQ3BDLFVBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO0FBQ25CLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQUNlLDBCQUFDLEtBQUssRUFBRTtBQUN0QixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDakIsVUFBSSxLQUFLLEtBQUssTUFBTSxFQUNsQixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUEsS0FDOUIsSUFBSSxLQUFLLEtBQUssTUFBTSxFQUN2QixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUE7O0FBRW5DLFVBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDakQsWUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELFlBQUksSUFBSSxFQUFFO0FBQ1IsY0FBSSxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3ZCLGdCQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtXQUNyRCxNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxhQUFhLENBQUMsTUFB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QUFBO0FBQy9CLGFBQU8sRUFBRSxDQUFBO0tBQ1Y7OztXQUNlLG1CQUFDLE9BQU8sRUFBRTtBQUN4QixVQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3pDLFFBQUUsQ0FBQyxTQUFTLEdBQUcsMkRBQTJELENBQUE7QUFDMUUsUUFBRSxDQUFDLFNBQVMsVUFBUSxPQUFPLFNBQU0sQUFBRSxDQUFBO0FBQ25DLFFBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQTtBQUM3QixhQUFPLEVBQUUsQ0FBQTtLQUNWOzs7V0FDaUIscUJBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRTtBQUN2QyxhQUFPLElBQUksY0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTtLQUM3RDs7O1NBN0lVLE9BQU87R0FBUyxXQUFXOzs7QUFnSmpDLElBQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUU7QUFDdkUsV0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO0NBQzdCLENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9lcHNlLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdWkvbWVzc2FnZS1lbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgTmV3TGluZSA9IC9cXHI/XFxuL1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgaW5pdGlhbGl6ZShtZXNzYWdlLCBpbmNsdWRlTGluayA9IHRydWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5pbmNsdWRlTGluayA9IGluY2x1ZGVMaW5rXG4gICAgdGhpcy5zdGF0dXMgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgdXBkYXRlVmlzaWJpbGl0eShzY29wZSkge1xuICAgIGxldCBzdGF0dXMgPSB0cnVlXG4gICAgaWYgKHNjb3BlID09PSAnTGluZScpXG4gICAgICBzdGF0dXMgPSB0aGlzLm1lc3NhZ2UuY3VycmVudExpbmVcbiAgICBlbHNlIGlmIChzY29wZSA9PT0gJ0ZpbGUnKVxuICAgICAgc3RhdHVzID0gdGhpcy5tZXNzYWdlLmN1cnJlbnRGaWxlXG5cbiAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggJiYgdGhpcy5tZXNzYWdlLmZpbGVQYXRoKSB7XG4gICAgICBjb25zdCBsaW5rID0gdGhpcy5xdWVyeVNlbGVjdG9yKCcubGludGVyLW1lc3NhZ2UtbGluaycpXG4gICAgICBpZiAobGluaykge1xuICAgICAgICBpZiAoc2NvcGUgPT09ICdQcm9qZWN0Jykge1xuICAgICAgICAgIGxpbmsucXVlcnlTZWxlY3Rvcignc3BhbicpLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5rLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1c1xuXG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpXG4gICAgfSBlbHNlIHRoaXMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCB0cnVlKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBhdHRhY2hlZENhbGxiYWNrKCkge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5zaG93UHJvdmlkZXJOYW1lJykgJiYgdGhpcy5tZXNzYWdlLmxpbnRlcikge1xuICAgICAgdGhpcy5hcHBlbmRDaGlsZChNZXNzYWdlLmdldE5hbWUodGhpcy5tZXNzYWdlKSlcbiAgICB9XG4gICAgdGhpcy5hcHBlbmRDaGlsZChNZXNzYWdlLmdldFJpYmJvbih0aGlzLm1lc3NhZ2UpKVxuICAgIHRoaXMuYXBwZW5kQ2hpbGQoTWVzc2FnZS5nZXRNZXNzYWdlKHRoaXMubWVzc2FnZSwgdGhpcy5pbmNsdWRlTGluaykpXG4gIH1cbiAgc3RhdGljIGdldExpbmsobWVzc2FnZSkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgY29uc3QgcGF0aEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgbGV0IGRpc3BsYXlGaWxlID0gbWVzc2FnZS5maWxlUGF0aFxuXG4gICAgZWwuY2xhc3NOYW1lID0gJ2xpbnRlci1tZXNzYWdlLWxpbmsnXG5cbiAgICBmb3IgKGxldCBwYXRoIG9mIGF0b20ucHJvamVjdC5nZXRQYXRocygpKVxuICAgICAgaWYgKGRpc3BsYXlGaWxlLmluZGV4T2YocGF0aCkgPT09IDApIHtcbiAgICAgICAgZGlzcGxheUZpbGUgPSBkaXNwbGF5RmlsZS5zdWJzdHIocGF0aC5sZW5ndGggKyAxKSAvLyBQYXRoICsgUGF0aCBTZXBhcmF0b3JcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnJhbmdlKSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IGBhdCBsaW5lICR7bWVzc2FnZS5yYW5nZS5zdGFydC5yb3cgKyAxfSBjb2wgJHttZXNzYWdlLnJhbmdlLnN0YXJ0LmNvbHVtbiArIDF9YFxuICAgIH1cbiAgICBwYXRoRWwudGV4dENvbnRlbnQgPSAnIGluICcgKyBkaXNwbGF5RmlsZVxuICAgIGVsLmFwcGVuZENoaWxkKHBhdGhFbClcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihtZXNzYWdlLmZpbGVQYXRoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAobWVzc2FnZS5yYW5nZSkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihtZXNzYWdlLnJhbmdlLnN0YXJ0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuIGVsXG4gIH1cbiAgc3RhdGljIGdldE1lc3NhZ2UobWVzc2FnZSwgaW5jbHVkZUxpbmspIHtcbiAgICBpZiAobWVzc2FnZS5tdWx0aWxpbmUgfHwgTmV3TGluZS50ZXN0KG1lc3NhZ2UudGV4dCkpIHtcbiAgICAgIHJldHVybiBNZXNzYWdlLmdldE11bHRpTGluZU1lc3NhZ2UobWVzc2FnZSwgaW5jbHVkZUxpbmspXG4gICAgfVxuXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBjb25zdCBtZXNzYWdlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW50ZXItbWVzc2FnZS1saW5lJylcblxuICAgIGVsLmNsYXNzTmFtZSA9ICdsaW50ZXItbWVzc2FnZS1pdGVtJ1xuXG4gICAgZWwuYXBwZW5kQ2hpbGQobWVzc2FnZUVsKVxuXG4gICAgaWYgKGluY2x1ZGVMaW5rICYmIG1lc3NhZ2UuZmlsZVBhdGgpIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKE1lc3NhZ2UuZ2V0TGluayhtZXNzYWdlKSlcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5odG1sICYmIHR5cGVvZiBtZXNzYWdlLmh0bWwgIT09ICdzdHJpbmcnKSB7XG4gICAgICBtZXNzYWdlRWwuYXBwZW5kQ2hpbGQobWVzc2FnZS5odG1sLmNsb25lTm9kZSh0cnVlKSlcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UuaHRtbCkge1xuICAgICAgbWVzc2FnZUVsLmlubmVySFRNTCA9IG1lc3NhZ2UuaHRtbFxuICAgIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0KSB7XG4gICAgICBtZXNzYWdlRWwudGV4dENvbnRlbnQgPSBtZXNzYWdlLnRleHRcbiAgICB9XG5cbiAgICByZXR1cm4gZWxcbiAgfVxuICBzdGF0aWMgZ2V0TXVsdGlMaW5lTWVzc2FnZShtZXNzYWdlLCBpbmNsdWRlTGluaykge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIGNvbnN0IG1lc3NhZ2VFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbnRlci1tdWx0aWxpbmUtbWVzc2FnZScpXG5cbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ2xpbnRlci1tZXNzYWdlLWl0ZW0nXG4gICAgbWVzc2FnZUVsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBtZXNzYWdlLnRleHQpXG5cbiAgICBtZXNzYWdlLnRleHQuc3BsaXQoTmV3TGluZSkuZm9yRWFjaChmdW5jdGlvbihsaW5lLCBpbmRleCkge1xuICAgICAgaWYgKCFsaW5lKSByZXR1cm5cblxuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW50ZXItbWVzc2FnZS1saW5lJylcbiAgICAgIGVsLnRleHRDb250ZW50ID0gbGluZVxuICAgICAgbWVzc2FnZUVsLmFwcGVuZENoaWxkKGVsKVxuXG4gICAgICAvLyBSZW5kZXIgdGhlIGxpbmsgaW4gdGhlIFwidGl0bGVcIiBsaW5lLlxuICAgICAgaWYgKGluZGV4ID09PSAwICYmIGluY2x1ZGVMaW5rICYmIG1lc3NhZ2UuZmlsZVBhdGgpIHtcbiAgICAgICAgbWVzc2FnZUVsLmFwcGVuZENoaWxkKE1lc3NhZ2UuZ2V0TGluayhtZXNzYWdlKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VFbClcblxuICAgIG1lc3NhZ2VFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIC8vIEF2b2lkIG9wZW5pbmcgdGhlIG1lc3NhZ2UgY29udGVudHMgd2hlbiB3ZSBjbGljayB0aGUgbGluay5cbiAgICAgIHZhciBsaW5rID0gZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnID8gZS50YXJnZXQgOiBlLnRhcmdldC5wYXJlbnROb2RlXG5cbiAgICAgIGlmICghbGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2xpbnRlci1tZXNzYWdlLWxpbmsnKSkge1xuICAgICAgICBtZXNzYWdlRWwuY2xhc3NMaXN0LnRvZ2dsZSgnZXhwYW5kZWQnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gY29udGFpbmVyXG4gIH1cbiAgc3RhdGljIGdldE5hbWUobWVzc2FnZSkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgZWwuY2xhc3NOYW1lID0gJ2xpbnRlci1tZXNzYWdlLWl0ZW0gYmFkZ2UgYmFkZ2UtZmxleGlibGUgbGludGVyLWhpZ2hsaWdodCdcbiAgICBlbC50ZXh0Q29udGVudCA9IG1lc3NhZ2UubGludGVyXG4gICAgcmV0dXJuIGVsXG4gIH1cbiAgc3RhdGljIGdldFJpYmJvbihtZXNzYWdlKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBlbC5jbGFzc05hbWUgPSAnbGludGVyLW1lc3NhZ2UtaXRlbSBiYWRnZSBiYWRnZS1mbGV4aWJsZSBsaW50ZXItaGlnaGxpZ2h0J1xuICAgIGVsLmNsYXNzTmFtZSArPSBgICR7bWVzc2FnZS5jbGFzc31gXG4gICAgZWwudGV4dENvbnRlbnQgPSBtZXNzYWdlLnR5cGVcbiAgICByZXR1cm4gZWxcbiAgfVxuICBzdGF0aWMgZnJvbU1lc3NhZ2UobWVzc2FnZSwgaW5jbHVkZUxpbmspIHtcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2VFbGVtZW50KCkuaW5pdGlhbGl6ZShtZXNzYWdlLCBpbmNsdWRlTGluaylcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2xpbnRlci1tZXNzYWdlJywge1xuICBwcm90b3R5cGU6IE1lc3NhZ2UucHJvdG90eXBlXG59KVxuIl19
//# sourceURL=/home/epse/.atom/packages/linter/lib/ui/message-element.js
