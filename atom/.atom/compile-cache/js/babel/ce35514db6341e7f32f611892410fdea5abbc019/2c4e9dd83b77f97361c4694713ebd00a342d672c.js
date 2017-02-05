Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var TargetsView = (function (_SelectListView) {
  _inherits(TargetsView, _SelectListView);

  function TargetsView() {
    _classCallCheck(this, TargetsView);

    _get(Object.getPrototypeOf(TargetsView.prototype), 'constructor', this).apply(this, arguments);
    this.show();
  }

  _createClass(TargetsView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'initialize', this).apply(this, arguments);
      this.addClass('build-target');
      this.list.addClass('mark-active');
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.show();
      this.focusFilterEditor();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
    }
  }, {
    key: 'setItems',
    value: function setItems() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'setItems', this).apply(this, arguments);

      var activeItemView = this.find('.active');
      if (0 < activeItemView.length) {
        this.selectItemView(activeItemView);
        this.scrollToItemView(activeItemView);
      }
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(target) {
      this.activeTarget = target;
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(targetName) {
      var activeTarget = this.activeTarget;
      return TargetsView.render(function () {
        var activeClass = targetName === activeTarget ? 'active' : '';
        this.li({ 'class': activeClass + ' build-target' }, targetName);
      });
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount) {
      return 0 === itemCount ? 'No targets found.' : 'No matches';
    }
  }, {
    key: 'awaitSelection',
    value: function awaitSelection() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.resolveFunction = resolve;
      });
    }
  }, {
    key: 'confirmed',
    value: function confirmed(target) {
      if (this.resolveFunction) {
        this.resolveFunction(target);
        this.resolveFunction = null;
      }
      this.hide();
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.hide();
    }
  }]);

  return TargetsView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = TargetsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0cy12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQ0FFK0Isc0JBQXNCOztBQUZyRCxXQUFXLENBQUM7O0lBSVMsV0FBVztZQUFYLFdBQVc7O0FBRW5CLFdBRlEsV0FBVyxHQUVoQjswQkFGSyxXQUFXOztBQUc1QiwrQkFIaUIsV0FBVyw4Q0FHbkIsU0FBUyxFQUFFO0FBQ3BCLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNiOztlQUxrQixXQUFXOztXQU9wQixzQkFBRztBQUNYLGlDQVJpQixXQUFXLDZDQVFSLFNBQVMsRUFBRTtBQUMvQixVQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMxRCxVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbkI7OztXQUVPLG9CQUFHO0FBQ1QsaUNBeEJpQixXQUFXLDJDQXdCVixTQUFTLEVBQUU7O0FBRTdCLFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUM3QixZQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztPQUN2QztLQUNGOzs7V0FFYyx5QkFBQyxNQUFNLEVBQUU7QUFDdEIsVUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7S0FDNUI7OztXQUVVLHFCQUFDLFVBQVUsRUFBRTtBQUN0QixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLGFBQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxZQUFZO0FBQ3BDLFlBQU0sV0FBVyxHQUFJLFVBQVUsS0FBSyxZQUFZLEdBQUcsUUFBUSxHQUFHLEVBQUUsQUFBQyxDQUFDO0FBQ2xFLFlBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFPLFdBQVcsR0FBRyxlQUFlLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUMvRCxDQUFDLENBQUM7S0FDSjs7O1dBRWMseUJBQUMsU0FBUyxFQUFFO0FBQ3pCLGFBQU8sQUFBQyxDQUFDLEtBQUssU0FBUyxHQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQztLQUMvRDs7O1dBRWEsMEJBQUc7OztBQUNmLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLGNBQUssZUFBZSxHQUFHLE9BQU8sQ0FBQztPQUNoQyxDQUFDLENBQUM7S0FDSjs7O1dBRVEsbUJBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN4QixZQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLFlBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO09BQzdCO0FBQ0QsVUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2I7OztXQUVRLHFCQUFHO0FBQ1YsVUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2I7OztTQWpFa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi90YXJnZXRzLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgU2VsZWN0TGlzdFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhcmdldHNWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgdGhpcy5zaG93KCk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLmFkZENsYXNzKCdidWlsZC10YXJnZXQnKTtcbiAgICB0aGlzLmxpc3QuYWRkQ2xhc3MoJ21hcmstYWN0aXZlJyk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICB9XG5cbiAgc2V0SXRlbXMoKSB7XG4gICAgc3VwZXIuc2V0SXRlbXMoLi4uYXJndW1lbnRzKTtcblxuICAgIGNvbnN0IGFjdGl2ZUl0ZW1WaWV3ID0gdGhpcy5maW5kKCcuYWN0aXZlJyk7XG4gICAgaWYgKDAgPCBhY3RpdmVJdGVtVmlldy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2VsZWN0SXRlbVZpZXcoYWN0aXZlSXRlbVZpZXcpO1xuICAgICAgdGhpcy5zY3JvbGxUb0l0ZW1WaWV3KGFjdGl2ZUl0ZW1WaWV3KTtcbiAgICB9XG4gIH1cblxuICBzZXRBY3RpdmVUYXJnZXQodGFyZ2V0KSB7XG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICB2aWV3Rm9ySXRlbSh0YXJnZXROYW1lKSB7XG4gICAgY29uc3QgYWN0aXZlVGFyZ2V0ID0gdGhpcy5hY3RpdmVUYXJnZXQ7XG4gICAgcmV0dXJuIFRhcmdldHNWaWV3LnJlbmRlcihmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBhY3RpdmVDbGFzcyA9ICh0YXJnZXROYW1lID09PSBhY3RpdmVUYXJnZXQgPyAnYWN0aXZlJyA6ICcnKTtcbiAgICAgIHRoaXMubGkoeyBjbGFzczogYWN0aXZlQ2xhc3MgKyAnIGJ1aWxkLXRhcmdldCcgfSwgdGFyZ2V0TmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRFbXB0eU1lc3NhZ2UoaXRlbUNvdW50KSB7XG4gICAgcmV0dXJuICgwID09PSBpdGVtQ291bnQpID8gJ05vIHRhcmdldHMgZm91bmQuJyA6ICdObyBtYXRjaGVzJztcbiAgfVxuXG4gIGF3YWl0U2VsZWN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmVGdW5jdGlvbiA9IHJlc29sdmU7XG4gICAgfSk7XG4gIH1cblxuICBjb25maXJtZWQodGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMucmVzb2x2ZUZ1bmN0aW9uKSB7XG4gICAgICB0aGlzLnJlc29sdmVGdW5jdGlvbih0YXJnZXQpO1xuICAgICAgdGhpcy5yZXNvbHZlRnVuY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmhpZGUoKTtcbiAgfVxuXG4gIGNhbmNlbGxlZCgpIHtcbiAgICB0aGlzLmhpZGUoKTtcbiAgfVxufVxuIl19