Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

var Registry = (function (_EventEmitter) {
  _inherits(Registry, _EventEmitter);

  function Registry() {
    _classCallCheck(this, Registry);

    _get(Object.getPrototypeOf(Registry.prototype), 'constructor', this).call(this);
    this.uniqueId = 0;
    this.tasks = [];
  }

  _createClass(Registry, [{
    key: 'begin',
    value: function begin(id, description) {
      var task = {
        id: id,
        description: description,
        uniqueId: this.uniqueId++,
        time: {
          start: new Date(),
          end: null
        }
      };
      this.tasks.push(task);
      this.emit('begin', task);
    }
  }, {
    key: 'end',
    value: function end(id) {
      var success = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var index = this.tasks.findIndex(function (task) {
        return task.id === id;
      });
      if (-1 === index) {
        return;
      }

      var task = this.tasks.splice(index, 1)[0];
      task.success = success;
      task.time.end = new Date();
      this.emit('end', task);
    }
  }, {
    key: '_getTasks',
    value: function _getTasks() {
      return this.tasks;
    }
  }]);

  return Registry;
})(_events2['default']);

exports['default'] = Registry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idXN5L2xpYi9yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFeUIsUUFBUTs7OztBQUZqQyxXQUFXLENBQUM7O0lBSVMsUUFBUTtZQUFSLFFBQVE7O0FBQ2hCLFdBRFEsUUFBUSxHQUNiOzBCQURLLFFBQVE7O0FBRXpCLCtCQUZpQixRQUFRLDZDQUVqQjtBQUNSLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0dBQ2pCOztlQUxrQixRQUFROztXQU90QixlQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUU7QUFDckIsVUFBTSxJQUFJLEdBQUc7QUFDWCxVQUFFLEVBQUYsRUFBRTtBQUNGLG1CQUFXLEVBQVgsV0FBVztBQUNYLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUN6QixZQUFJLEVBQUU7QUFDSixlQUFLLEVBQUUsSUFBSSxJQUFJLEVBQUU7QUFDakIsYUFBRyxFQUFFLElBQUk7U0FDVjtPQUNGLENBQUM7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMxQjs7O1dBRUUsYUFBQyxFQUFFLEVBQWtCO1VBQWhCLE9BQU8seURBQUcsSUFBSTs7QUFDcEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzNELFVBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO0FBQ2hCLGVBQU87T0FDUjs7QUFFRCxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMzQixVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN4Qjs7O1dBRVEscUJBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDbkI7OztTQW5Da0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1c3kvbGliL3JlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cnkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudW5pcXVlSWQgPSAwO1xuICAgIHRoaXMudGFza3MgPSBbXTtcbiAgfVxuXG4gIGJlZ2luKGlkLCBkZXNjcmlwdGlvbikge1xuICAgIGNvbnN0IHRhc2sgPSB7XG4gICAgICBpZCxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgdW5pcXVlSWQ6IHRoaXMudW5pcXVlSWQrKyxcbiAgICAgIHRpbWU6IHtcbiAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKCksXG4gICAgICAgIGVuZDogbnVsbFxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy50YXNrcy5wdXNoKHRhc2spO1xuICAgIHRoaXMuZW1pdCgnYmVnaW4nLCB0YXNrKTtcbiAgfVxuXG4gIGVuZChpZCwgc3VjY2VzcyA9IHRydWUpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMudGFza3MuZmluZEluZGV4KHRhc2sgPT4gdGFzay5pZCA9PT0gaWQpO1xuICAgIGlmICgtMSA9PT0gaW5kZXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xuICAgIHRhc2suc3VjY2VzcyA9IHN1Y2Nlc3M7XG4gICAgdGFzay50aW1lLmVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5lbWl0KCdlbmQnLCB0YXNrKTtcbiAgfVxuXG4gIF9nZXRUYXNrcygpIHtcbiAgICByZXR1cm4gdGhpcy50YXNrcztcbiAgfVxufVxuIl19