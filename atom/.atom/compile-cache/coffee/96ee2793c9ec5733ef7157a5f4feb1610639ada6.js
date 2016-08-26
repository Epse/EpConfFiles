(function() {
  var CompositeDisposable, Emitter, ResultItem, ResultsDB, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  ResultItem = require('./result-item');

  module.exports = ResultsDB = (function() {
    function ResultsDB() {
      this.results = [];
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
    }

    ResultsDB.prototype.destroy = function() {
      var _ref1;
      if ((_ref1 = this.disposables) != null) {
        if (typeof _ref1.dispose === "function") {
          _ref1.dispose();
        }
      }
      this.disposables = null;
      return this.emitter = null;
    };

    ResultsDB.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ResultsDB.prototype.setResults = function(res, severityArr) {
      var severity, _i, _len;
      if (severityArr != null) {
        this.results = this.results.filter(function(_arg) {
          var severity;
          severity = _arg.severity;
          return !(__indexOf.call(severityArr, severity) >= 0);
        }).concat(res.map(function(i) {
          return new ResultItem(i);
        }));
      } else {
        this.results = res;
      }
      if (severityArr == null) {
        severityArr = [];
        for (_i = 0, _len = res.length; _i < _len; _i++) {
          severity = res[_i].severity;
          if (!(__indexOf.call(severityArr, severity) >= 0)) {
            severityArr.push(severity);
          }
        }
      }
      return this.emitter.emit('did-update', {
        res: this,
        types: severityArr
      });
    };

    ResultsDB.prototype.appendResults = function(res, severityArr) {
      var severity, _i, _len;
      this.results = this.results.concat(res.map(function(r) {
        return new ResultItem(r);
      }));
      if (severityArr == null) {
        severityArr = [];
        for (_i = 0, _len = res.length; _i < _len; _i++) {
          severity = res[_i].severity;
          if (!(__indexOf.call(severityArr, severity) >= 0)) {
            severityArr.push(severity);
          }
        }
      }
      return this.emitter.emit('did-update', {
        res: this,
        types: severityArr
      });
    };

    ResultsDB.prototype.resultsWithURI = function() {
      return this.results.filter(function(_arg) {
        var uri;
        uri = _arg.uri;
        return uri != null;
      });
    };

    ResultsDB.prototype.filter = function(template) {
      return this.results.filter(function(item) {
        var b, k, v;
        b = (function() {
          var _results;
          _results = [];
          for (k in template) {
            v = template[k];
            _results.push(item[k] === v);
          }
          return _results;
        })();
        return b.every(function(v) {
          return v;
        });
      });
    };

    return ResultsDB;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvcmVzdWx0cy1kYi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseURBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUF0QixDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLG1CQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFEZixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FGQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSx3QkFLQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxLQUFBOzs7ZUFBWSxDQUFFOztPQUFkO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBRGYsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FISjtJQUFBLENBTFQsQ0FBQTs7QUFBQSx3QkFVQSxXQUFBLEdBQWEsU0FBQyxRQUFELEdBQUE7YUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCLEVBRFc7SUFBQSxDQVZiLENBQUE7O0FBQUEsd0JBYUEsVUFBQSxHQUFZLFNBQUMsR0FBRCxFQUFNLFdBQU4sR0FBQTtBQUNWLFVBQUEsa0JBQUE7QUFBQSxNQUFBLElBQUcs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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/results-db.coffee
