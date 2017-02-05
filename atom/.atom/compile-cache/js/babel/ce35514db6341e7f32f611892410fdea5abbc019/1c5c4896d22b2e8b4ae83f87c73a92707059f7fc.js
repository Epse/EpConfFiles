Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _statusBarView = require('./status-bar-view');

var _statusBarView2 = _interopRequireDefault(_statusBarView);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

'use babel';

exports['default'] = {
  activate: function activate() {
    this.registry = new _registry2['default']();
    this.views = [];
    this.tasksBegun = [];
    this.tasksEnded = [];

    this.registry.on('begin', this.beginTask.bind(this));
    this.registry.on('end', this.endTask.bind(this));
  },

  deactivate: function deactivate() {
    this.views.forEach(function (view) {
      return view.dispose();
    });
  },

  provideRegistry: function provideRegistry() {
    return this.registry;
  },

  beginTask: function beginTask(task) {
    this.tasksBegun.push(task);
    this.views.forEach(function (view) {
      return view.beginTask(task);
    });
  },

  endTask: function endTask(task) {
    this.tasksEnded.push(task);
    this.views.forEach(function (view) {
      return view.endTask(task);
    });
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.addView(new _statusBarView2['default'](statusBar));
  },

  addView: function addView(view) {
    this.views.push(view);
    this.tasksBegun.forEach(function (task) {
      return view.beginTask(task);
    });
    this.tasksEnded.forEach(function (task) {
      return view.endTask(task);
    });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idXN5L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NkJBRTBCLG1CQUFtQjs7Ozt3QkFDeEIsWUFBWTs7OztBQUhqQyxXQUFXLENBQUM7O3FCQUtHO0FBQ2IsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsUUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVyQixRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUksSUFBSSxDQUFDLFNBQVMsTUFBZCxJQUFJLEVBQVcsQ0FBQztBQUM1QyxRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUksSUFBSSxDQUFDLE9BQU8sTUFBWixJQUFJLEVBQVMsQ0FBQztHQUN6Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0tBQUEsQ0FBQyxDQUFDO0dBQzVDOztBQUVELGlCQUFlLEVBQUEsMkJBQUc7QUFDaEIsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQ3RCOztBQUVELFdBQVMsRUFBQSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FBQztHQUNsRDs7QUFFRCxTQUFPLEVBQUEsaUJBQUMsSUFBSSxFQUFFO0FBQ1osUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDaEQ7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsU0FBUyxFQUFFO0FBQzFCLFFBQUksQ0FBQyxPQUFPLENBQUMsK0JBQWtCLFNBQVMsQ0FBQyxDQUFDLENBQUM7R0FDNUM7O0FBRUQsU0FBTyxFQUFBLGlCQUFDLElBQUksRUFBRTtBQUNaLFFBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQ3RELFFBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQ3JEO0NBQ0YiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1c3kvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBTdGF0dXNCYXJWaWV3IGZyb20gJy4vc3RhdHVzLWJhci12aWV3JztcbmltcG9ydCBSZWdpc3RyeSBmcm9tICcuL3JlZ2lzdHJ5JztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5ID0gbmV3IFJlZ2lzdHJ5KCk7XG4gICAgdGhpcy52aWV3cyA9IFtdO1xuICAgIHRoaXMudGFza3NCZWd1biA9IFtdO1xuICAgIHRoaXMudGFza3NFbmRlZCA9IFtdO1xuXG4gICAgdGhpcy5yZWdpc3RyeS5vbignYmVnaW4nLCA6OnRoaXMuYmVnaW5UYXNrKTtcbiAgICB0aGlzLnJlZ2lzdHJ5Lm9uKCdlbmQnLCA6OnRoaXMuZW5kVGFzayk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnZpZXdzLmZvckVhY2godmlldyA9PiB2aWV3LmRpc3Bvc2UoKSk7XG4gIH0sXG5cbiAgcHJvdmlkZVJlZ2lzdHJ5KCkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5O1xuICB9LFxuXG4gIGJlZ2luVGFzayh0YXNrKSB7XG4gICAgdGhpcy50YXNrc0JlZ3VuLnB1c2godGFzayk7XG4gICAgdGhpcy52aWV3cy5mb3JFYWNoKHZpZXcgPT4gdmlldy5iZWdpblRhc2sodGFzaykpO1xuICB9LFxuXG4gIGVuZFRhc2sodGFzaykge1xuICAgIHRoaXMudGFza3NFbmRlZC5wdXNoKHRhc2spO1xuICAgIHRoaXMudmlld3MuZm9yRWFjaCh2aWV3ID0+IHZpZXcuZW5kVGFzayh0YXNrKSk7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLmFkZFZpZXcobmV3IFN0YXR1c0JhclZpZXcoc3RhdHVzQmFyKSk7XG4gIH0sXG5cbiAgYWRkVmlldyh2aWV3KSB7XG4gICAgdGhpcy52aWV3cy5wdXNoKHZpZXcpO1xuICAgIHRoaXMudGFza3NCZWd1bi5mb3JFYWNoKHRhc2sgPT4gdmlldy5iZWdpblRhc2sodGFzaykpO1xuICAgIHRoaXMudGFza3NFbmRlZC5mb3JFYWNoKHRhc2sgPT4gdmlldy5lbmRUYXNrKHRhc2spKTtcbiAgfVxufTtcbiJdfQ==