(function() {
  var zip, _;

  _ = require('underscore-plus');

  zip = function() {
    var arr, i, length, lengthArray, _i, _results;
    lengthArray = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arr = arguments[_i];
        _results.push(arr.length);
      }
      return _results;
    }).apply(this, arguments);
    length = Math.max.apply(Math, lengthArray);
    _results = [];
    for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
      _results.push((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = arguments.length; _j < _len; _j++) {
          arr = arguments[_j];
          _results1.push(arr[i]);
        }
        return _results1;
      }).apply(this, arguments));
    }
    return _results;
  };

  module.exports = {
    grammarExpect: function(grammar, str) {
      var tkzd;
      tkzd = grammar.tokenizeLines(str);
      return expect(tkzd);
    },
    customMatchers: {
      toHaveTokens: function(expected) {
        var a, e, ts, _i, _len, _ref, _ref1;
        _ref = zip(this.actual, expected);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], a = _ref1[0], e = _ref1[1];
          ts = a.map(function(_arg) {
            var value;
            value = _arg.value;
            return value;
          });
          if (!(_.isEqual(ts, e))) {
            this.message = function() {
              return "Expected " + (JSON.stringify(ts)) + " to equal " + (JSON.stringify(e));
            };
            return false;
          }
        }
        return true;
      },
      toHaveTokenScopes: function(expected) {
        var a, e, es, escope, escopes, evalue, scopes, ta, te, ts, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
        _ref = zip(this.actual, expected);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], a = _ref1[0], e = _ref1[1];
          e = (_ref2 = []).concat.apply(_ref2, e.map(function(val) {
            var k, v, _results;
            if (typeof val === 'string') {
              return [[val]];
            } else if ((val != null ? val.length : void 0) != null) {
              return [val];
            } else {
              _results = [];
              for (k in val) {
                v = val[k];
                _results.push([k, v]);
              }
              return _results;
            }
          }));
          ts = a.map(function(_arg) {
            var value;
            value = _arg.value;
            return value;
          });
          es = e.map(function(_arg) {
            var scopes, tok;
            tok = _arg[0], scopes = _arg[1];
            return tok;
          });
          _ref3 = zip(ts, es);
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            _ref4 = _ref3[_j], ta = _ref4[0], te = _ref4[1];
            if (!(ta !== te)) {
              continue;
            }
            this.message = function() {
              return "Expected '" + ta + "' to equal '" + te + "' : " + (JSON.stringify(ts)) + " ; " + (JSON.stringify(es));
            };
            return false;
          }
          _ref5 = zip(a, e);
          for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
            _ref6 = _ref5[_k], (_ref7 = _ref6[0], value = _ref7.value, scopes = _ref7.scopes), (_ref8 = _ref6[1], evalue = _ref8[0], escopes = _ref8[1]);
            if (value !== evalue) {
              this.message = function() {
                return "Expected \"" + value + "\" to equal \"" + evalue + "\"";
              };
              return false;
            }
            if (escopes != null) {
              for (_l = 0, _len3 = escopes.length; _l < _len3; _l++) {
                escope = escopes[_l];
                if (!_.contains(scopes, escope)) {
                  this.message = function() {
                    return "Expected \"" + (JSON.stringify(scopes)) + "\" to contain \"" + escope + "\"";
                  };
                  return false;
                }
              }
            }
          }
        }
        return true;
      },
      toHaveScopes: function(expected) {
        return zip(this.actual, expected).every(function(_arg) {
          var a, e;
          a = _arg[0], e = _arg[1];
          return a.every(function(_arg1) {
            var scopes;
            scopes = _arg1.scopes;
            return e.every(function(s) {
              return _.contains(scopes, s);
            });
          });
        });
      },
      tokenToHaveScopes: function(expected) {
        var a, e, i, s, sc, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        _ref = zip(this.actual, expected);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], a = _ref1[0], e = _ref1[1];
          for (_j = 0, _len1 = e.length; _j < _len1; _j++) {
            _ref2 = e[_j], i = _ref2[0], s = _ref2[1];
            for (_k = 0, _len2 = s.length; _k < _len2; _k++) {
              sc = s[_k];
              if (!_.contains(a[i].scopes, sc)) {
                this.message = function() {
                  return "Expected " + (JSON.stringify(a[i])) + " to have scope " + sc + " from " + (JSON.stringify(s));
                };
                return false;
              }
            }
          }
        }
        return true;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy91dGlsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxNQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osUUFBQSx5Q0FBQTtBQUFBLElBQUEsV0FBQTs7QUFBZTtXQUFBLGdEQUFBOzRCQUFBO0FBQUEsc0JBQUEsR0FBRyxDQUFDLE9BQUosQ0FBQTtBQUFBOzs2QkFBZixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsYUFBUyxXQUFULENBRFQsQ0FBQTtBQUVBO1NBQVMsa0ZBQVQsR0FBQTtBQUNFOztBQUFBO2FBQUEsZ0RBQUE7OEJBQUE7QUFBQSx5QkFBQSxHQUFJLENBQUEsQ0FBQSxFQUFKLENBQUE7QUFBQTs7Z0NBQUEsQ0FERjtBQUFBO29CQUhJO0VBQUEsQ0FGTixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLFNBQUMsT0FBRCxFQUFVLEdBQVYsR0FBQTtBQUNiLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxhQUFSLENBQXNCLEdBQXRCLENBQVAsQ0FBQTthQUNBLE1BQUEsQ0FBTyxJQUFQLEVBRmE7SUFBQSxDQUFmO0FBQUEsSUFJQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLFlBQUEsRUFBYyxTQUFDLFFBQUQsR0FBQTtBQUNaLFlBQUEsK0JBQUE7QUFBQTtBQUFBLGFBQUEsMkNBQUEsR0FBQTtBQUNFLDRCQURHLGNBQUcsWUFDTixDQUFBO0FBQUEsVUFBQSxFQUFBLEdBQUssQ0FBQyxD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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/spec/util.coffee
