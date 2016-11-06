(function() {
  var ResultItem, ResultsDB,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ResultItem = null;

  module.exports = ResultsDB = (function() {
    function ResultsDB() {
      var CompositeDisposable, Emitter, _ref;
      this.results = [];
      _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      ResultItem = require('./result-item');
    }

    ResultsDB.prototype.destroy = function() {
      var _ref;
      if ((_ref = this.disposables) != null) {
        if (typeof _ref.dispose === "function") {
          _ref.dispose();
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
        }).concat(res.map((function(_this) {
          return function(i) {
            return new ResultItem(_this, i);
          };
        })(this)));
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
      this.results = this.results.concat(res.map((function(_this) {
        return function(r) {
          return new ResultItem(_this, r);
        };
      })(this)));
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

    ResultsDB.prototype.removeResult = function(resItem) {
      this.results = this.results.filter(function(res) {
        return res !== resItem;
      });
      return resItem.parent = null;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9yZXN1bHRzLWRiLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLElBQWIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLG1CQUFBLEdBQUE7QUFDWCxVQUFBLGtDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FBQTtBQUFBLE1BQ0EsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BRHRCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUZmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUE1QixDQUhBLENBQUE7QUFBQSxNQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUpiLENBRFc7SUFBQSxDQUFiOztBQUFBLHdCQU9BLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7OztjQUFZLENBQUU7O09BQWQ7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFEZixDQUFBO2FBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUhKO0lBQUEsQ0FQVCxDQUFBOztBQUFBLHdCQVlBLFdBQUEsR0FBYSxTQUFDLFFBQUQsR0FBQTthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsUUFBMUIsRUFEVztJQUFBLENBWmIsQ0FBQTs7QUFBQSx3QkFlQSxVQUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/results-db.coffee
