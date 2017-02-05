'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StatusBarItem = (function () {
  function StatusBarItem() {
    _classCallCheck(this, StatusBarItem);

    this.element = document.createElement('a');
    this.element.className = 'line-ending-tile inline-block';
    this.setLineEndings(new Set());
  }

  _createClass(StatusBarItem, [{
    key: 'setLineEndings',
    value: function setLineEndings(lineEndings) {
      this.lineEndings = lineEndings;
      this.element.textContent = lineEndingName(lineEndings);
    }
  }, {
    key: 'hasLineEnding',
    value: function hasLineEnding(lineEnding) {
      return this.lineEndings.has(lineEnding);
    }
  }, {
    key: 'onClick',
    value: function onClick(callback) {
      this.element.addEventListener('click', callback);
    }
  }]);

  return StatusBarItem;
})();

exports['default'] = StatusBarItem;

function lineEndingName(lineEndings) {
  if (lineEndings.size > 1) {
    return 'Mixed';
  } else if (lineEndings.has('\n')) {
    return 'LF';
  } else if (lineEndings.has('\r\n')) {
    return 'CRLF';
  } else if (lineEndings.has('\r')) {
    return 'CR';
  } else {
    return '';
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9idWlsZC9hdG9tL3NyYy9hdG9tLTEuMTIuOS9vdXQvYXBwL25vZGVfbW9kdWxlcy9saW5lLWVuZGluZy1zZWxlY3Rvci9saWIvc3RhdHVzLWJhci1pdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7QUFFWCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7QUFDM0MsT0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDLENBQUM7O0FBRUgsSUFBSSxZQUFZLEdBQUcsQ0FBQyxZQUFZO0FBQUUsV0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQUUsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFBRSxVQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxVQUFVLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLEFBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQUFBQyxJQUFJLE9BQU8sSUFBSSxVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQUFBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQUU7R0FBRSxBQUFDLE9BQU8sVUFBVSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtBQUFFLFFBQUksVUFBVSxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQUFBQyxJQUFJLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQUFBQyxPQUFPLFdBQVcsQ0FBQztHQUFFLENBQUM7Q0FBRSxDQUFBLEVBQUcsQ0FBQzs7QUFFdGpCLFNBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFBRSxNQUFJLEVBQUUsUUFBUSxZQUFZLFdBQVcsQ0FBQSxBQUFDLEVBQUU7QUFBRSxVQUFNLElBQUksU0FBUyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7R0FBRTtDQUFFOztBQUV6SixJQVJxQixhQUFhLEdBQUEsQ0FBQSxZQUFBO0FBQ3BCLFdBRE8sYUFBYSxHQUNqQjtBQVNiLG1CQUFlLENBQUMsSUFBSSxFQVZILGFBQWEsQ0FBQSxDQUFBOztBQUU5QixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUE7QUFDeEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7R0FDL0I7O0FBWUQsY0FBWSxDQWpCTyxhQUFhLEVBQUEsQ0FBQTtBQWtCOUIsT0FBRyxFQUFFLGdCQUFnQjtBQUNyQixTQUFLLEVBWlEsU0FBQSxjQUFBLENBQUMsV0FBVyxFQUFFO0FBQzNCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUN2RDtHQWFBLEVBQUU7QUFDRCxPQUFHLEVBQUUsZUFBZTtBQUNwQixTQUFLLEVBYk8sU0FBQSxhQUFBLENBQUMsVUFBVSxFQUFFO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDeEM7R0FjQSxFQUFFO0FBQ0QsT0FBRyxFQUFFLFNBQVM7QUFDZCxTQUFLLEVBZEMsU0FBQSxPQUFBLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2pEO0dBZUEsQ0FBQyxDQUFDLENBQUM7O0FBRUosU0FuQ21CLGFBQWEsQ0FBQTtDQW9DakMsQ0FBQSxFQUFHLENBQUM7O0FBRUwsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQXRDRyxhQUFhLENBQUE7O0FBcUJsQyxTQUFTLGNBQWMsQ0FBRSxXQUFXLEVBQUU7QUFDcEMsTUFBSSxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUN4QixXQUFPLE9BQU8sQ0FBQTtHQUNmLE1BQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2hDLFdBQU8sSUFBSSxDQUFBO0dBQ1osTUFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEMsV0FBTyxNQUFNLENBQUE7R0FDZCxNQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQyxXQUFPLElBQUksQ0FBQTtHQUNaLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQTtHQUNWO0NBQ0Y7QUFvQkQsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMiLCJmaWxlIjoiL2J1aWxkL2F0b20vc3JjL2F0b20tMS4xMi45L291dC9hcHAvbm9kZV9tb2R1bGVzL2xpbmUtZW5kaW5nLXNlbGVjdG9yL2xpYi9zdGF0dXMtYmFyLWl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0dXNCYXJJdGVtIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSAnbGluZS1lbmRpbmctdGlsZSBpbmxpbmUtYmxvY2snXG4gICAgdGhpcy5zZXRMaW5lRW5kaW5ncyhuZXcgU2V0KCkpXG4gIH1cblxuICBzZXRMaW5lRW5kaW5ncyAobGluZUVuZGluZ3MpIHtcbiAgICB0aGlzLmxpbmVFbmRpbmdzID0gbGluZUVuZGluZ3NcbiAgICB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQgPSBsaW5lRW5kaW5nTmFtZShsaW5lRW5kaW5ncylcbiAgfVxuXG4gIGhhc0xpbmVFbmRpbmcgKGxpbmVFbmRpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5saW5lRW5kaW5ncy5oYXMobGluZUVuZGluZylcbiAgfVxuXG4gIG9uQ2xpY2sgKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2spXG4gIH1cbn1cblxuZnVuY3Rpb24gbGluZUVuZGluZ05hbWUgKGxpbmVFbmRpbmdzKSB7XG4gIGlmIChsaW5lRW5kaW5ncy5zaXplID4gMSkge1xuICAgIHJldHVybiAnTWl4ZWQnXG4gIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXG4nKSkge1xuICAgIHJldHVybiAnTEYnXG4gIH0gZWxzZSBpZiAobGluZUVuZGluZ3MuaGFzKCdcXHJcXG4nKSkge1xuICAgIHJldHVybiAnQ1JMRidcbiAgfSBlbHNlIGlmIChsaW5lRW5kaW5ncy5oYXMoJ1xccicpKSB7XG4gICAgcmV0dXJuICdDUidcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJydcbiAgfVxufVxuIl19