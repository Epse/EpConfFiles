'use babel';

var _this = this;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Linter = (function () {
  function Linter() {
    _classCallCheck(this, Linter);

    this.messages = [];
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'setMessages',
    value: function setMessages(msg) {
      this.messages = this.messages.concat(msg);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages() {
      this.messages = [];
    }
  }]);

  return Linter;
})();

module.exports = {
  activate: function activate() {},
  provideIndie: function provideIndie() {
    return {
      register: function register(obj) {
        _this.registered = obj;
        _this.linter = new Linter();
        return _this.linter;
      }
    };
  },

  hasRegistered: function hasRegistered() {
    return _this.registered !== undefined;
  },

  getLinter: function getLinter() {
    return _this.linter;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2ZpeHR1cmUvYXRvbS1idWlsZC1zcGVjLWxpbnRlci9hdG9tLWJ1aWxkLXNwZWMtbGludGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7SUFFTixNQUFNO0FBQ0MsV0FEUCxNQUFNLEdBQ0k7MEJBRFYsTUFBTTs7QUFFUixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztHQUNwQjs7ZUFIRyxNQUFNOztXQUlILG1CQUFHLEVBQUU7OztXQUNELHFCQUFDLEdBQUcsRUFBRTtBQUNmLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDM0M7OztXQUNhLDBCQUFHO0FBQ2YsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7S0FDcEI7OztTQVZHLE1BQU07OztBQWFaLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsb0JBQU0sRUFBRTtBQUNsQixjQUFZLEVBQUU7V0FBTztBQUNuQixjQUFRLEVBQUUsa0JBQUMsR0FBRyxFQUFLO0FBQ2pCLGNBQUssVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUN0QixjQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQzNCLGVBQU8sTUFBSyxNQUFNLENBQUM7T0FDcEI7S0FDRjtHQUFDOztBQUVGLGVBQWEsRUFBRSx5QkFBTTtBQUNuQixXQUFPLE1BQUssVUFBVSxLQUFLLFNBQVMsQ0FBQztHQUN0Qzs7QUFFRCxXQUFTLEVBQUUscUJBQU07QUFDZixXQUFPLE1BQUssTUFBTSxDQUFDO0dBQ3BCO0NBQ0YsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9maXh0dXJlL2F0b20tYnVpbGQtc3BlYy1saW50ZXIvYXRvbS1idWlsZC1zcGVjLWxpbnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jbGFzcyBMaW50ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gIH1cbiAgZGlzcG9zZSgpIHt9XG4gIHNldE1lc3NhZ2VzKG1zZykge1xuICAgIHRoaXMubWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzLmNvbmNhdChtc2cpO1xuICB9XG4gIGRlbGV0ZU1lc3NhZ2VzKCkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGU6ICgpID0+IHt9LFxuICBwcm92aWRlSW5kaWU6ICgpID0+ICh7XG4gICAgcmVnaXN0ZXI6IChvYmopID0+IHtcbiAgICAgIHRoaXMucmVnaXN0ZXJlZCA9IG9iajtcbiAgICAgIHRoaXMubGludGVyID0gbmV3IExpbnRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMubGludGVyO1xuICAgIH1cbiAgfSksXG5cbiAgaGFzUmVnaXN0ZXJlZDogKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWQgIT09IHVuZGVmaW5lZDtcbiAgfSxcblxuICBnZXRMaW50ZXI6ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5saW50ZXI7XG4gIH1cbn07XG4iXX0=