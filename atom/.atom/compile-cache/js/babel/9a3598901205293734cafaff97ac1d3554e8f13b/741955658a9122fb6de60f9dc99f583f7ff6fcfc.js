Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _bottomTab = require('./bottom-tab');

var _bottomTab2 = _interopRequireDefault(_bottomTab);

var _bottomStatus = require('./bottom-status');

var _bottomStatus2 = _interopRequireDefault(_bottomStatus);

'use babel';

var BottomContainer = (function (_HTMLElement) {
  _inherits(BottomContainer, _HTMLElement);

  function BottomContainer() {
    _classCallCheck(this, BottomContainer);

    _get(Object.getPrototypeOf(BottomContainer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BottomContainer, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var _this = this;

      this.subscriptions = new _atom.CompositeDisposable();
      this.emitter = new _atom.Emitter();
      this.tabs = new Map();
      this.tabs.set('Line', _bottomTab2['default'].create('Line'));
      this.tabs.set('File', _bottomTab2['default'].create('File'));
      this.tabs.set('Project', _bottomTab2['default'].create('Project'));
      this.status = new _bottomStatus2['default']();

      this.subscriptions.add(this.emitter);
      this.subscriptions.add(atom.config.observe('linter.displayLinterInfo', function (displayInfo) {
        _this.visibility = displayInfo;
      }));
      this.subscriptions.add(atom.config.observe('linter.statusIconScope', function (iconScope) {
        _this.iconScope = iconScope;
        _this.status.count = _this.tabs.get(iconScope).count;
      }));

      for (var tab of this.tabs) {
        this.appendChild(tab[1]);
        this.subscriptions.add(tab[1]);
      }
      this.appendChild(this.status);

      this.onDidChangeTab(function (activeName) {
        _this.activeTab = activeName;
      });
    }
  }, {
    key: 'getTab',
    value: function getTab(name) {
      return this.tabs.get(name);
    }
  }, {
    key: 'setCount',
    value: function setCount(_ref) {
      var Project = _ref.Project;
      var File = _ref.File;
      var Line = _ref.Line;

      this.tabs.get('Project').count = Project;
      this.tabs.get('File').count = File;
      this.tabs.get('Line').count = Line;
      this.status.count = this.tabs.get(this.iconScope).count;
    }
  }, {
    key: 'onDidChangeTab',
    value: function onDidChangeTab(callback) {
      var disposable = new _atom.CompositeDisposable();
      this.tabs.forEach(function (tab) {
        disposable.add(tab.onDidChangeTab(callback));
      });
      return disposable;
    }
  }, {
    key: 'onShouldTogglePanel',
    value: function onShouldTogglePanel(callback) {
      var disposable = new _atom.CompositeDisposable();
      this.tabs.forEach(function (tab) {
        disposable.add(tab.onShouldTogglePanel(callback));
      });
      return disposable;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.tabs.clear();
      this.status = null;
    }
  }, {
    key: 'activeTab',
    set: function set(activeName) {
      this._activeTab = activeName;
      for (var _ref23 of this.tabs) {
        var _ref22 = _slicedToArray(_ref23, 2);

        var _name = _ref22[0];
        var tab = _ref22[1];

        tab.active = _name === activeName;
      }
    },
    get: function get() {
      return this._activeTab;
    }
  }, {
    key: 'visibility',
    get: function get() {
      return !this.hasAttribute('hidden');
    },
    set: function set(value) {
      if (value) {
        this.removeAttribute('hidden');
      } else {
        this.setAttribute('hidden', true);
      }
    }
  }], [{
    key: 'create',
    value: function create(activeTab) {
      var el = document.createElement('linter-bottom-container');
      el.activeTab = activeTab;
      return el;
    }
  }]);

  return BottomContainer;
})(HTMLElement);

exports['default'] = BottomContainer;

document.registerElement('linter-bottom-container', {
  prototype: BottomContainer.prototype
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9ib3R0b20tY29udGFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRTJDLE1BQU07O3lCQUMzQixjQUFjOzs7OzRCQUNYLGlCQUFpQjs7OztBQUoxQyxXQUFXLENBQUE7O0lBTVUsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUNuQiwyQkFBRzs7O0FBQ2hCLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXVCLENBQUE7QUFDNUMsVUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBVyxDQUFBO0FBQzFCLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNyQixVQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsdUJBQVUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDL0MsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLHVCQUFVLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQy9DLFVBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSx1QkFBVSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUNyRCxVQUFJLENBQUMsTUFBTSxHQUFHLCtCQUFnQixDQUFBOztBQUU5QixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsVUFBQSxXQUFXLEVBQUk7QUFDcEYsY0FBSyxVQUFVLEdBQUcsV0FBVyxDQUFBO09BQzlCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsVUFBSSxDQUFDLGFBQWEs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QUc7QUFDZCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7S0FDdkI7OztTQUVhLGVBQUc7QUFDZixhQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNwQztTQUNhLGFBQUMsS0FBSyxFQUFFO0FBQ3BCLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUMvQixNQUFNO0FBQ0wsWUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDbEM7S0FDRjs7O1dBdUJZLGdCQUFDLFNBQVMsRUFBRTtBQUN2QixVQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFDNUQsUUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDeEIsYUFBTyxFQUFFLENBQUE7S0FDVjs7O1NBckZrQixlQUFlO0dBQVMsV0FBVzs7cUJBQW5DLGVBQWU7O0FBd0ZwQyxRQUFRLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFO0FBQ2xELFdBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztDQUNyQyxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL3VpL2JvdHRvbS1jb250YWluZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nXG5pbXBvcnQgQm90dG9tVGFiIGZyb20gJy4vYm90dG9tLXRhYidcbmltcG9ydCBCb3R0b21TdGF0dXMgZnJvbSAnLi9ib3R0b20tc3RhdHVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3R0b21Db250YWluZXIgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNyZWF0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgdGhpcy50YWJzID0gbmV3IE1hcCgpXG4gICAgdGhpcy50YWJzLnNldCgnTGluZScsIEJvdHRvbVRhYi5jcmVhdGUoJ0xpbmUnKSlcbiAgICB0aGlzLnRhYnMuc2V0KCdGaWxlJywgQm90dG9tVGFiLmNyZWF0ZSgnRmlsZScpKVxuICAgIHRoaXMudGFicy5zZXQoJ1Byb2plY3QnLCBCb3R0b21UYWIuY3JlYXRlKCdQcm9qZWN0JykpXG4gICAgdGhpcy5zdGF0dXMgPSBuZXcgQm90dG9tU3RhdHVzXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5kaXNwbGF5TGludGVySW5mbycsIGRpc3BsYXlJbmZvID0+IHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eSA9IGRpc3BsYXlJbmZvXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc3RhdHVzSWNvblNjb3BlJywgaWNvblNjb3BlID0+IHtcbiAgICAgIHRoaXMuaWNvblNjb3BlID0gaWNvblNjb3BlXG4gICAgICB0aGlzLnN0YXR1cy5jb3VudCA9IHRoaXMudGFicy5nZXQoaWNvblNjb3BlKS5jb3VudFxuICAgIH0pKVxuXG4gICAgZm9yIChsZXQgdGFiIG9mIHRoaXMudGFicykge1xuICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0YWJbMV0pXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRhYlsxXSlcbiAgICB9XG4gICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLnN0YXR1cylcblxuICAgIHRoaXMub25EaWRDaGFuZ2VUYWIoYWN0aXZlTmFtZSA9PiB7XG4gICAgICB0aGlzLmFjdGl2ZVRhYiA9IGFjdGl2ZU5hbWVcbiAgICB9KVxuICB9XG4gIGdldFRhYihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMudGFicy5nZXQobmFtZSlcbiAgfVxuICBzZXRDb3VudCh7UHJvamVjdCwgRmlsZSwgTGluZX0pIHtcbiAgICB0aGlzLnRhYnMuZ2V0KCdQcm9qZWN0JykuY291bnQgPSBQcm9qZWN0XG4gICAgdGhpcy50YWJzLmdldCgnRmlsZScpLmNvdW50ID0gRmlsZVxuICAgIHRoaXMudGFicy5nZXQoJ0xpbmUnKS5jb3VudCA9IExpbmVcbiAgICB0aGlzLnN0YXR1cy5jb3VudCA9IHRoaXMudGFicy5nZXQodGhpcy5pY29uU2NvcGUpLmNvdW50XG4gIH1cblxuICBzZXQgYWN0aXZlVGFiKGFjdGl2ZU5hbWUpIHtcbiAgICB0aGlzLl9hY3RpdmVUYWIgPSBhY3RpdmVOYW1lXG4gICAgZm9yIChsZXQgW25hbWUsIHRhYl0gb2YgdGhpcy50YWJzKSB7XG4gICAgICB0YWIuYWN0aXZlID0gbmFtZSA9PT0gYWN0aXZlTmFtZVxuICAgIH1cbiAgfVxuICBnZXQgYWN0aXZlVGFiKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVUYWJcbiAgfVxuXG4gIGdldCB2aXNpYmlsaXR5KCkge1xuICAgIHJldHVybiAhdGhpcy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpXG4gIH1cbiAgc2V0IHZpc2liaWxpdHkodmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICBvbkRpZENoYW5nZVRhYihjYWxsYmFjaykge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMudGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYikge1xuICAgICAgZGlzcG9zYWJsZS5hZGQodGFiLm9uRGlkQ2hhbmdlVGFiKGNhbGxiYWNrKSlcbiAgICB9KVxuICAgIHJldHVybiBkaXNwb3NhYmxlXG4gIH1cbiAgb25TaG91bGRUb2dnbGVQYW5lbChjYWxsYmFjaykge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMudGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYikge1xuICAgICAgZGlzcG9zYWJsZS5hZGQodGFiLm9uU2hvdWxkVG9nZ2xlUGFuZWwoY2FsbGJhY2spKVxuICAgIH0pXG4gICAgcmV0dXJuIGRpc3Bvc2FibGVcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMudGFicy5jbGVhcigpXG4gICAgdGhpcy5zdGF0dXMgPSBudWxsXG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKGFjdGl2ZVRhYikge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGludGVyLWJvdHRvbS1jb250YWluZXInKVxuICAgIGVsLmFjdGl2ZVRhYiA9IGFjdGl2ZVRhYlxuICAgIHJldHVybiBlbFxuICB9XG59XG5cbmRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnbGludGVyLWJvdHRvbS1jb250YWluZXInLCB7XG4gIHByb3RvdHlwZTogQm90dG9tQ29udGFpbmVyLnByb3RvdHlwZVxufSlcbiJdfQ==
//# sourceURL=/home/epse/.atom/packages/linter/lib/ui/bottom-container.js
