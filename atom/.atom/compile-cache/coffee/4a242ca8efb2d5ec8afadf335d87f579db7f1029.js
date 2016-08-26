(function() {
  "$ curl https://raw.githubusercontent.com/twilson63/cakefile-template/master/Cakefile > ../Cakefile\n\n$ cd .. && coffee -c -o lib src/main.coffee\n$ cd .. && npm version minor\n$ cd .. && git comm\n$ cd .. && cake build";
  var GrammarCreator, makeGrammar;

  GrammarCreator = (function() {
    function GrammarCreator(grammar, print) {
      this.grammar = grammar;
      this.print = print != null ? print : false;
    }

    GrammarCreator.prototype.process = function() {
      var CSON, G, all_done, fs, grammar, k, macros, n, name, pats, print, v, _i, _len, _ref, _ref1, _ref2;
      grammar = this.grammar;
      print = this.print;
      G = {};
      _ref = ["comment", "fileTypes", "firstLineMatch", "keyEquivalent", "name", "scopeName", "injectionSelector"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (grammar[n] != null) {
          G[n] = grammar[n];
        }
      }
      this.autoAppendScopeName = grammar.autoAppendScopeName, this.macros = grammar.macros;
      if (typeof this.autoAppendScopeName === "undefined") {
        this.autoAppendScopeName = true;
      }
      if (typeof this.macros === "undefined") {
        this.macros = {};
      }
      this.grammarScopeName = G.scopeName.replace(/.*\./, '');
      this.hasGrammarScopeName = new RegExp("\\." + this.grammarScopeName + "$");
      macros = this.macros;
      for (k in macros) {
        v = macros[k];
        if (v instanceof RegExp) {
          macros[k] = v.source;
        }
      }
      for (k in macros) {
        v = macros[k];
        macros[k] = this.resolveMacros(v);
      }
      while (true) {
        all_done = true;
        for (k in macros) {
          v = macros[k];
          macros[k] = this.resolveMacros(v);
          if (/\{[a-zA-Z_]\w*\}/.test(macros[k])) {
            all_done = false;
            if (v === macros[k]) {
              all_done = true;
            }
          }
        }
        if (all_done) {
          break;
        }
      }
      name = grammar['name'];
      _ref1 = this.makePattern(grammar);
      for (k in _ref1) {
        v = _ref1[k];
        G[k] = v;
      }
      G['name'] = name;
      if (grammar.repository != null) {
        G.repository = {};
        _ref2 = grammar.repository;
        for (k in _ref2) {
          v = _ref2[k];
          pats = this.makePattern(v, macros);
          if ((pats.begin != null) || (pats.match != null)) {
            pats = {
              "patterns": [pats]
            };
          } else if (pats instanceof Array) {
            pats = {
              "patterns": pats
            };
          }
          G.repository[k] = pats;
        }
      }
      if (print) {
        if (print.match(/\.cson$/)) {
          CSON = require("season");
          fs = require("fs");
          fs.writeFileSync(print, CSON.stringify(G));
        } else if (print.match(/\.json$/)) {
          fs.writeFileSync(print, JSON.stringify(G, null, "    "));
        } else if (print === "CSON") {
          CSON = require("season");
          process.stdout.write(CSON.stringify(G));
        } else {
          process.stdout.write(JSON.stringify(G, null, "    "));
        }
      }
      return G;
    };

    GrammarCreator.prototype.resolveMacros = function(regex) {
      var macros;
      if (regex instanceof RegExp) {
        regex = regex.source;
      }
      macros = this.macros;
      return regex.replace(/\{\w+\}/g, function(mob) {
        var s;
        s = mob.slice(1, -1);
        if (typeof macros[s] !== "undefined") {
          return macros[s];
        } else {
          return mob;
        }
      });
    };

    GrammarCreator.prototype.makeScopeName = function(name) {
      name = this.resolveMacros(name);
      if (this.autoAppendScopeName) {
        if (!this.hasGrammarScopeName.test(name)) {
          return "" + name + "." + this.grammarScopeName;
        }
      }
      return name;
    };

    GrammarCreator.prototype.makePattern = function(pattern) {
      var P, c, ck, cv, k, p, pat, v;
      pat = pattern;
      P = {};
      if (typeof pattern === "string") {
        P.include = pattern;
        return P;
      }
      if (pattern instanceof Array) {
        return (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = pattern.length; _i < _len; _i++) {
            p = pattern[_i];
            _results.push(this.makePattern(p));
          }
          return _results;
        }).call(this);
      }
      for (k in pat) {
        v = pat[k];
        switch (k) {
          case "N":
          case "contentName":
            P.contentName = this.makeScopeName(v);
            break;
          case "i":
          case "include":
            P.include = v;
            break;
          case "n":
          case "name":
            P.name = this.makeScopeName(v);
            break;
          case "m":
          case "match":
            P.match = this.resolveMacros(v);
            break;
          case "b":
          case "begin":
            P.begin = this.resolveMacros(v);
            break;
          case "e":
          case "end":
            P.end = this.resolveMacros(v);
            break;
          case "c":
          case "captures":
          case "beginCaptures":
            if (P.begin != null) {
              P.beginCaptures = c = {};
            } else {
              P.captures = c = {};
            }
            if (typeof v === "string") {
              c[0] = {
                name: this.makeScopeName(v)
              };
            } else {
              for (ck in v) {
                cv = v[ck];
                if (typeof cv !== "string") {
                  c[ck] = this.makePattern(cv);
                } else {
                  c[ck] = {
                    name: this.makeScopeName(cv)
                  };
                }
              }
            }
            break;
          case "C":
          case "endCaptures":
            P.endCaptures = c = {};
            if (typeof v === "string") {
              c[0] = {
                name: this.makeScopeName(v)
              };
            } else {
              for (ck in v) {
                cv = v[ck];
                if (typeof cv !== "string") {
                  c[ck] = this.makePattern(cv);
                } else {
                  c[ck] = {
                    name: this.makeScopeName(cv)
                  };
                }
              }
            }
            break;
          case "p":
          case "patterns":
            if (!(v instanceof Array)) {
              v = [v];
            }
            P.patterns = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = v.length; _i < _len; _i++) {
                p = v[_i];
                _results.push(this.makePattern(p));
              }
              return _results;
            }).call(this);
            break;
          case "L":
          case "applyEndPatternLast":
            P.applyEndPatternLast = v;
            break;
          default:
            P[k] = v;
        }
      }
      return P;
    };

    return GrammarCreator;

  })();

  makeGrammar = function(grammar, print) {
    var grammar_;
    if (print == null) {
      print = false;
    }
    grammar_ = (require('clone'))(grammar);
    return (new GrammarCreator(grammar_, print)).process();
  };

  module.exports = makeGrammar;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9zeW50YXgtdG9vbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLDZOQUFBLENBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBV007QUFDUyxJQUFBLHdCQUFFLE9BQUYsRUFBWSxLQUFaLEdBQUE7QUFBNEIsTUFBM0IsSUFBQyxDQUFBLFVBQUEsT0FBMEIsQ0FBQTtBQUFBLE1BQWpCLElBQUMsQ0FBQSx3QkFBQSxRQUFRLEtBQVEsQ0FBNUI7SUFBQSxDQUFiOztBQUFBLDZCQUVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGdHQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQURULENBQUE7QUFBQSxNQUVBLENBQUEsR0FBSSxFQUZKLENBQUE7QUFJQTtBQUFBLFdBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFBLElBQXFCLGtCQUFyQjtBQUFBLFVBQUEsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsQ0FBQTtTQURGO0FBQUEsT0FKQTtBQUFBLE1BT0MsSUFBQyxDQUFBLDhCQUFBLG1CQUFGLEVBQXVCLElBQUMsQ0FBQSxpQkFBQSxNQVB4QixDQUFBO0FBU0EsTUFBQSxJQUErQixNQUFBLENBQUEsSUFBUSxDQUFBLG1CQUFSLEtBQStCLFdBQTlEO0FBQUEsUUFBQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsSUFBdkIsQ0FBQTtPQVRBO0FBVUEsTUFBQSxJQUFnQixNQUFBLENBQUEsSUFBUSxDQUFBLE1BQVIsS0FBa0IsV0FBbEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBVixDQUFBO09B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

//# sourceURL=/home/epse/.atom/packages/language-haskell/src/syntax-tools.coffee
