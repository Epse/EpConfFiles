(function() {
  "$ curl https://raw.githubusercontent.com/twilson63/cakefile-template/master/Cakefile > ../Cakefile\n\n$ cd .. && coffee -c -o lib src/main.coffee\n$ cd .. && npm version minor\n$ cd .. && git comm\n$ cd .. && cake build";
  var GrammarCreator, include, makeGrammar;

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

  makeGrammar = function(print, grammar) {
    var grammar_;
    grammar_ = (require('clone'))(grammar);
    return (new GrammarCreator(grammar_, print)).process();
  };

  include = function(what) {
    return require("./include/" + what);
  };

  module.exports = {
    makeGrammar: makeGrammar,
    include: include
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL3N5bnRheC10b29scy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsNk5BQUEsQ0FBQTtBQUFBLE1BQUEsb0NBQUE7O0FBQUEsRUFXTTtBQUNTLElBQUEsd0JBQUUsT0FBRixFQUFZLEtBQVosR0FBQTtBQUE0QixNQUEzQixJQUFDLENBQUEsVUFBQSxPQUEwQixDQUFBO0FBQUEsTUFBakIsSUFBQyxDQUFBLHdCQUFBLFFBQVEsS0FBUSxDQUE1QjtJQUFBLENBQWI7O0FBQUEsNkJBRUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsZ0dBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBWCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEtBRFQsQ0FBQTtBQUFBLE1BRUEsQ0FBQSxHQUFJLEVBRkosQ0FBQTtBQUlBO0FBQUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUEsSUFBcUIsa0JBQXJCO0FBQUEsVUFBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sT0FBUSxDQUFBLENBQUEsQ0FBZixDQUFBO1NBREY7QUFBQSxPQUpBO0FBQUEsTUFPQyxJQUFDLENBQUEsOEJBQUEsbUJBQUYsRUFBdUIsSUFBQyxDQUFBLGlCQUFBLE1BUHhCLENBQUE7QUFTQSxNQUFBLElBQStCLE1BQUEsQ0FBQSxJQUFRLENBQUEsbUJBQVIsS0FBK0IsV0FBOUQ7QUFBQSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixJQUF2QixDQUFBO09BVEE7QUFVQSxNQUFBLElBQWdCLE1BQUEsQ0FBQSxJQUFRLENBQUEsTUFBUixLQUFrQixXQUFsQztBQUFBLFFBQUEsSUFBQyxDQUFBLE1BQUQs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/src/syntax-tools.coffee
