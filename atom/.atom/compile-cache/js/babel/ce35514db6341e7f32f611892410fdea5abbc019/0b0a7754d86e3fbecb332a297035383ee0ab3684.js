'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var hooks = {
  preBuild: function preBuild() {},
  postBuild: function postBuild() {}
};

var Builder = (function () {
  function Builder() {
    _classCallCheck(this, Builder);
  }

  _createClass(Builder, [{
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Build with hooks';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      return true;
    }
  }, {
    key: 'settings',
    value: function settings() {
      return [{
        exec: 'exit',
        args: ['0'],
        atomCommandName: 'build:hook-test:succeding',
        preBuild: function preBuild() {
          return hooks.preBuild();
        },
        postBuild: function postBuild(success) {
          return hooks.postBuild(success);
        }
      }, {
        exec: 'exit',
        args: ['1'],
        atomCommandName: 'build:hook-test:failing',
        preBuild: function preBuild() {
          return hooks.preBuild();
        },
        postBuild: function postBuild(success) {
          return hooks.postBuild(success);
        }
      }];
    }
  }]);

  return Builder;
})();

module.exports = {
  activate: function activate() {},
  provideBuilder: function provideBuilder() {
    return Builder;
  },
  hooks: hooks
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2ZpeHR1cmUvYXRvbS1idWlsZC1ob29rcy1kdW1teS1wYWNrYWdlL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLEtBQUssR0FBRztBQUNaLFVBQVEsRUFBRSxvQkFBTSxFQUFFO0FBQ2xCLFdBQVMsRUFBRSxxQkFBTSxFQUFFO0NBQ3BCLENBQUM7O0lBRUksT0FBTztXQUFQLE9BQU87MEJBQVAsT0FBTzs7O2VBQVAsT0FBTzs7V0FDQSx1QkFBRztBQUNaLGFBQU8sa0JBQWtCLENBQUM7S0FDM0I7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRU8sb0JBQUc7QUFDVCxhQUFPLENBQ0w7QUFDRSxZQUFJLEVBQUUsTUFBTTtBQUNaLFlBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLHVCQUFlLEVBQUUsMkJBQTJCO0FBQzVDLGdCQUFRLEVBQUU7aUJBQU0sS0FBSyxDQUFDLFFBQVEsRUFBRTtTQUFBO0FBQ2hDLGlCQUFTLEVBQUUsbUJBQUMsT0FBTztpQkFBSyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztTQUFBO09BQ2pELEVBQ0Q7QUFDRSxZQUFJLEVBQUUsTUFBTTtBQUNaLFlBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLHVCQUFlLEVBQUUseUJBQXlCO0FBQzFDLGdCQUFRLEVBQUU7aUJBQU0sS0FBSyxDQUFDLFFBQVEsRUFBRTtTQUFBO0FBQ2hDLGlCQUFTLEVBQUUsbUJBQUMsT0FBTztpQkFBSyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztTQUFBO09BQ2pELENBQ0YsQ0FBQztLQUNIOzs7U0ExQkcsT0FBTzs7O0FBNkJiLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsb0JBQU0sRUFBRTtBQUNsQixnQkFBYyxFQUFFO1dBQU0sT0FBTztHQUFBO0FBQzdCLE9BQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9maXh0dXJlL2F0b20tYnVpbGQtaG9va3MtZHVtbXktcGFja2FnZS9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IGhvb2tzID0ge1xuICBwcmVCdWlsZDogKCkgPT4ge30sXG4gIHBvc3RCdWlsZDogKCkgPT4ge31cbn07XG5cbmNsYXNzIEJ1aWxkZXIge1xuICBnZXROaWNlTmFtZSgpIHtcbiAgICByZXR1cm4gJ0J1aWxkIHdpdGggaG9va3MnO1xuICB9XG5cbiAgaXNFbGlnaWJsZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHNldHRpbmdzKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIGV4ZWM6ICdleGl0JyxcbiAgICAgICAgYXJnczogWycwJ10sXG4gICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2J1aWxkOmhvb2stdGVzdDpzdWNjZWRpbmcnLFxuICAgICAgICBwcmVCdWlsZDogKCkgPT4gaG9va3MucHJlQnVpbGQoKSxcbiAgICAgICAgcG9zdEJ1aWxkOiAoc3VjY2VzcykgPT4gaG9va3MucG9zdEJ1aWxkKHN1Y2Nlc3MpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBleGVjOiAnZXhpdCcsXG4gICAgICAgIGFyZ3M6IFsnMSddLFxuICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdidWlsZDpob29rLXRlc3Q6ZmFpbGluZycsXG4gICAgICAgIHByZUJ1aWxkOiAoKSA9PiBob29rcy5wcmVCdWlsZCgpLFxuICAgICAgICBwb3N0QnVpbGQ6IChzdWNjZXNzKSA9PiBob29rcy5wb3N0QnVpbGQoc3VjY2VzcylcbiAgICAgIH1cbiAgICBdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZTogKCkgPT4ge30sXG4gIHByb3ZpZGVCdWlsZGVyOiAoKSA9PiBCdWlsZGVyLFxuICBob29rczogaG9va3Ncbn07XG4iXX0=