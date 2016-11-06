(function() {
  var CompositeDisposable, Emitter, ModuleInfo, Util, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  Util = require('../util');

  module.exports = ModuleInfo = (function() {
    ModuleInfo.prototype.symbols = null;

    ModuleInfo.prototype.process = null;

    ModuleInfo.prototype.name = "";

    ModuleInfo.prototype.disposables = null;

    ModuleInfo.prototype.emitter = null;

    ModuleInfo.prototype.timeout = null;

    ModuleInfo.prototype.invalidateInterval = 30 * 60 * 1000;

    function ModuleInfo(name, process, rootDir, done) {
      this.name = name;
      this.process = process;
      this.select = __bind(this.select, this);
      this.unsetBuffer = __bind(this.unsetBuffer, this);
      this.setBuffer = __bind(this.setBuffer, this);
      this.update = __bind(this.update, this);
      this.onDidDestroy = __bind(this.onDidDestroy, this);
      this.destroy = __bind(this.destroy, this);
      if (this.name == null) {
        throw new Error("No name set");
      }
      Util.debug("" + this.name + " created");
      this.symbols = [];
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      this.update(rootDir, done);
      this.timeout = setTimeout(((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)), this.invalidateInterval);
      this.disposables.add(this.process.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
    }

    ModuleInfo.prototype.destroy = function() {
      if (this.symbols == null) {
        return;
      }
      Util.debug("" + this.name + " destroyed");
      clearTimeout(this.timeout);
      this.timeout = null;
      this.emitter.emit('did-destroy');
      this.disposables.dispose();
      this.disposables = null;
      this.symbols = null;
      this.process = null;
      this.name = "";
      return this.emitter = null;
    };

    ModuleInfo.prototype.onDidDestroy = function(callback) {
      if (this.emitter == null) {
        return new Disposable(function() {});
      }
      return this.emitter.on('did-destroy', callback);
    };

    ModuleInfo.prototype.update = function(rootDir, done) {
      if (this.process == null) {
        return;
      }
      Util.debug("" + this.name + " updating");
      return this.process.runBrowse(rootDir, [this.name]).then((function(_this) {
        return function(symbols) {
          _this.symbols = symbols;
          Util.debug("" + _this.name + " updated");
          return typeof done === "function" ? done() : void 0;
        };
      })(this));
    };

    ModuleInfo.prototype.setBuffer = function(bufferInfo, rootDir) {
      var bufferRootDir, _ref1, _ref2;
      if (this.disposables == null) {
        return;
      }
      bufferRootDir = (_ref1 = (_ref2 = this.process) != null ? typeof _ref2.getRootDir === "function" ? _ref2.getRootDir(bufferInfo.buffer) : void 0 : void 0) != null ? _ref1 : Util.getRootDir(bufferInfo.buffer);
      if (rootDir.getPath() !== bufferRootDir.getPath()) {
        return;
      }
      return bufferInfo.getModuleName().then((function(_this) {
        return function(name) {
          if (name !== _this.name) {
            Util.debug("" + _this.name + " moduleName mismatch: " + name + " != " + _this.name);
            return;
          }
          Util.debug("" + _this.name + " buffer is set");
          _this.disposables.add(bufferInfo.onDidSave(function() {
            Util.debug("" + _this.name + " did-save triggered");
            return _this.update(rootDir);
          }));
          return _this.disposables.add(bufferInfo.onDidDestroy(function() {
            return _this.unsetBuffer();
          }));
        };
      })(this));
    };

    ModuleInfo.prototype.unsetBuffer = function() {
      if (this.disposables == null) {
        return;
      }
      this.disposables.dispose();
      return this.disposables = new CompositeDisposable;
    };

    ModuleInfo.prototype.select = function(importDesc, symbolTypes) {
      var si, symbols;
      if (this.symbols == null) {
        return [];
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.destroy, this.invalidateInterval);
      symbols = importDesc.importList != null ? this.symbols.filter(function(s) {
        var _ref1;
        return importDesc.hiding !== ((_ref1 = s.name, __indexOf.call(importDesc.importList, _ref1) >= 0) || (importDesc.importList.some(function(_arg) {
          var parent;
          parent = _arg.parent;
          return (parent != null) && s.parent === parent;
        })));
      }) : this.symbols;
      si = Array.prototype.concat.apply([], symbols.map(function(s) {
        var qns;
        qns = [
          function(n) {
            var _ref1;
            if (importDesc.qualified) {
              return ((_ref1 = importDesc.alias) != null ? _ref1 : importDesc.name) + '.' + n;
            } else {
              return n;
            }
          }
        ];
        if (!importDesc.skipQualified) {
          qns.push(function(n) {
            return importDesc.name + '.' + n;
          });
          if (importDesc.alias) {
            qns.push(function(n) {
              return importDesc.alias + '.' + n;
            });
          }
        }
        return qns.map(function(qn) {
          return {
            name: s.name,
            typeSignature: s.typeSignature,
            symbolType: s.symbolType === 'function' && s.name[0].toUpperCase() === s.name[0] ? 'tag' : s.symbolType,
            qparent: s.parent ? qn(s.parent) : void 0,
            module: importDesc,
            qname: qn(s.name)
          };
        });
      }));
      if (symbolTypes != null) {
        si = si.filter(function(_arg) {
          var symbolType;
          symbolType = _arg.symbolType;
          return __indexOf.call(symbolTypes, symbolType) >= 0;
        });
      }
      return si;
    };

    return ModuleInfo;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvY29tcGxldGlvbi1iYWNrZW5kL21vZHVsZS1pbmZvLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvREFBQTtJQUFBO3lKQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BQXRCLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNKLHlCQUFBLE9BQUEsR0FBUyxJQUFULENBQUE7O0FBQUEseUJBQ0EsT0FBQSxHQUFTLElBRFQsQ0FBQTs7QUFBQSx5QkFFQSxJQUFBLEdBQU0sRUFGTixDQUFBOztBQUFBLHlCQUdBLFdBQUEsR0FBYSxJQUhiLENBQUE7O0FBQUEseUJBSUEsT0FBQSxHQUFTLElBSlQsQ0FBQTs7QUFBQSx5QkFLQSxPQUFBLEdBQVMsSUFMVCxDQUFBOztBQUFBLHlCQU1BLGtCQUFBLEdBQW9CLEVBQUEsR0FBSyxFQUFMLEdBQVUsSUFOOUIsQ0FBQTs7QUFRYSxJQUFBLG9CQUFFLElBQUYsRUFBUyxPQUFULEVBQWtCLE9BQWxCLEVBQTJCLElBQTNCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxPQUFBLElBQ2IsQ0FBQTtBQUFBLE1BRG1CLElBQUMsQ0FBQSxVQUFBLE9BQ3BCLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxNQUFBLElBQU8saUJBQVA7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLGFBQU4sQ0FBVixDQURGO09BQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBQSxHQUFHLElBQUMsQ0FBQSxJQUFKLEdBQVMsVUFBcEIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBSFgsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBSmYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQTVCLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxPQUFSLEVBQWlCLElBQWpCLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxVQUFBLENBQVcsQ0FBQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBWCxFQUE0QixJQUFDLENBQUEsa0JBQTdCLENBUFgsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCLENBQWpCLENBUkEsQ0FEVztJQUFBLENBUmI7O0FBQUEseUJBbUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQWMsb0JBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFBLEdBQUcsSUFBQyxDQUFBLElBQUosR0FBUyxZQUFwQixDQURBLENBQUE7QUFBQSxNQUVBLFlBQUEsQ0FBYSxJQUFDLENBQUEsT0FBZCxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFIWCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsQ0FMQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBTmYsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQVBYLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFSWCxDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsSUFBRCxHQUFRLEVBVFIsQ0FBQTthQVVBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FYSjtJQUFBLENBbkJULENBQUE7O0FBQUEseUJBZ0NBLFlBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTtBQUNaLE1BQUEsSUFBTyxvQkFBUDtBQUNFLGVBQVcsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBLENBQVgsQ0FBWCxDQURGO09BQUE7YUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCLEVBSFk7SUFBQSxDQWhDZCxDQUFBOztBQUFBLHlCQXFDQSxNQUFBLEdBQVEsU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ04sTUFBQSxJQUFjLG9CQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBQSxHQUFHLElBQUMsQ0FBQSxJQUFKLEdBQVMsV0FBcEIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLE9BQW5CLEVBQTRCLENBQUMsSUFBQyxDQUFBLElBQUYsQ0FBNUIsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxPQUFGLEdBQUE7QUFDSixVQURLLEtBQUMsQ0FBQSxVQUFBLE9BQ04sQ0FBQTtBQUFBLFVBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFBLEdBQUcsS0FBQyxDQUFBLElBQUosR0FBUyxVQUFwQixDQUFBLENBQUE7OENBQ0EsZ0JBRkk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLEVBSE07SUFBQSxDQXJDUixDQUFBOztBQUFBLHlCQTZDQSxTQUFBLEdBQVcsU0FBQyxVQUFELEVBQWEsT0FBYixHQUFBO0FBQ1QsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBYyx3QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxhQUFBLCtKQUEyRCxJQUFJLENBQUMsVUFBTCxDQUFnQixVQUFVLENBQUMsTUFBM0IsQ0FEM0QsQ0FBQTtBQUVBLE1BQUEsSUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQUEsS0FBcUIsYUFBYSxDQUFDLE9BQWQsQ0FBQSxDQUE1QjtBQUNFLGNBQUEsQ0FERjtPQUZBO2FBSUEsVUFBVSxDQUFDLGFBQVgsQ0FBQSxDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNKLFVBQUEsSUFBTyxJQUFBLEtBQVEsS0FBQyxDQUFBLElBQWhCO0FBQ0UsWUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLEVBQUEsR0FBRyxLQUFDLENBQUEsSUFBSixHQUFTLHdCQUFULEdBQ1AsSUFETyxHQUNGLE1BREUsR0FDSSxLQUFDLENBQUEsSUFEaEIsQ0FBQSxDQUFBO0FBRUEsa0JBQUEsQ0FIRjtXQUFBO0FBQUEsVUFJQSxJQUFJLENBQUMsS0FBTCxDQUFXLEVBQUEsR0FBRyxLQUFDLENBQUEsSUFBSixHQUFTLGdCQUFwQixDQUpBLENBQUE7QUFBQSxVQUtBLEtBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixVQUFVLENBQUMsU0FBWCxDQUFxQixTQUFBLEdBQUE7QUFDcEMsWUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLEVBQUEsR0FBRyxLQUFDLENBQUEsSUFBSixHQUFTLHFCQUFwQixDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxPQUFSLEVBRm9DO1VBQUEsQ0FBckIsQ0FBakIsQ0FMQSxDQUFBO2lCQVFBLEtBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBLEdBQUE7bUJBQ3ZDLEtBQUMsQ0FBQSxXQUFELENBQUEsRUFEdUM7VUFBQSxDQUF4QixDQUFqQixFQVRJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixFQUxTO0lBQUEsQ0E3Q1gsQ0FBQTs7QUFBQSx5QkErREEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLE1BQUEsSUFBYyx3QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxvQkFISjtJQUFBLENBL0RiLENBQUE7O0FBQUEseUJBb0VBLE1BQUEsR0FBUSxTQUFDLFVBQUQsRUFBYSxXQUFiLEdBQUE7QUFDTixVQUFBLFdBQUE7QUFBQSxNQUFBLElBQWlCLG9CQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BQUE7QUFBQSxNQUNBLFlBQUEsQ0FBYSxJQUFDLENBQUEsT0FBZCxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsVUFBQSxDQUFXLElBQUMsQ0FBQSxPQUFaLEVBQXFCLElBQUMsQ0FBQSxrQkFBdEIsQ0FGWCxDQUFBO0FBQUEsTUFHQSxPQUFBLEdBQ0ssNkJBQUgsR0FDRSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxDQUFELEdBQUE7QUFDZCxZQUFBLEtBQUE7ZUFBQSxVQUFVLENBQUMsTUFBWCxLQUFxQixDQUNuQixTQUFDLENBQUMsQ0FBQyxJQUFGLEVBQUEsZUFBVSxVQUFVLENBQUMsVUFBckIsRUFBQSxLQUFBLE1BQUQsQ0FBQSxJQUNBLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUF0QixDQUEyQixTQUFDLElBQUQsR0FBQTtBQUFjLGNBQUEsTUFBQTtBQUFBLFVBQVosU0FBRCxLQUFDLE1BQVksQ0FBQTtpQkFBQSxnQkFBQSxJQUFZLENBQUMsQ0FBQyxNQUFGLEtBQVksT0FBdEM7UUFBQSxDQUEzQixDQUFELENBRm1CLEVBRFA7TUFBQSxDQUFoQixDQURGLEdBT0UsSUFBQyxDQUFBLE9BWEwsQ0FBQTtBQUFBLE1BWUEsRUFBQSxHQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQXZCLENBQTZCLEVBQTdCLEVBQWlDLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxDQUFELEdBQUE7QUFDaEQsWUFBQSxHQUFBO0FBQUEsUUFBQSxHQUFBLEdBQ0U7VUFDRSxTQUFDLENBQUQsR0FBQTtBQUNFLGdCQUFBLEtBQUE7QUFBQSxZQUFBLElBQUcsVUFBVSxDQUFDLFNBQWQ7cUJBQ0UsOENBQW9CLFVBQVUsQ0FBQyxJQUEvQixDQUFBLEdBQXVDLEdBQXZDLEdBQTZDLEVBRC9DO2FBQUEsTUFBQTtxQkFHRSxFQUhGO2FBREY7VUFBQSxDQURGO1NBREYsQ0FBQTtBQVFBLFFBQUEsSUFBQSxDQUFBLFVBQWlCLENBQUMsYUFBbEI7QUFDRSxVQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsU0FBQyxDQUFELEdBQUE7bUJBQU8sVUFBVSxDQUFDLElBQVgsR0FBa0IsR0FBbEIsR0FBd0IsRUFBL0I7VUFBQSxDQUFULENBQUEsQ0FBQTtBQUNBLFVBQUEsSUFBRyxVQUFVLENBQUMsS0FBZDtBQUNFLFlBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxTQUFDLENBQUQsR0FBQTtxQkFBTyxVQUFVLENBQUMsS0FBWCxHQUFtQixHQUFuQixHQUF5QixFQUFoQztZQUFBLENBQVQsQ0FBQSxDQURGO1dBRkY7U0FSQTtlQVlBLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxFQUFELEdBQUE7aUJBQ047QUFBQSxZQUFBLElBQUEsRUFBTSxDQUFDLENBQUMsSUFBUjtBQUFBLFlBQ0EsYUFBQSxFQUFlLENBQUMsQ0FBQyxhQURqQjtBQUFBLFlBRUEsVUFBQSxFQUNLLENBQUMsQ0FBQyxVQUFGLEtBQWdCLFVBQWhCLElBQStCLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBVixDQUFBLENBQUEsS0FBMkIsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXBFLEdBQ0UsS0FERixHQUdFLENBQUMsQ0FBQyxVQU5OO0FBQUEsWUFPQSxPQUFBLEVBQXdCLENBQUMsQ0FBQyxNQUFqQixHQUFBLEVBQUEsQ0FBRyxDQUFDLENBQUMsTUFBTCxDQUFBLEdBQUEsTUFQVDtBQUFBLFlBUUEsTUFBQSxFQUFRLFVBUlI7QUFBQSxZQVNBLEtBQUEsRUFBTyxFQUFBLENBQUcsQ0FBQyxDQUFDLElBQUwsQ0FUUDtZQURNO1FBQUEsQ0FBUixFQWJnRDtNQUFBLENBQVosQ0FBakMsQ0FaTCxDQUFBO0FBb0NBLE1BQUEsSUFBRyxtQkFBSDtBQUNFLFFBQUEsRUFBQSxHQUFLLEVBQUUsQ0FBQyxNQUFILENBQVUsU0FBQyxJQUFELEdBQUE7QUFBa0IsY0FBQSxVQUFBO0FBQUEsVUFBaEIsYUFBRCxLQUFDLFVBQWdCLENBQUE7aUJBQUEsZUFBYyxXQUFkLEVBQUEsVUFBQSxPQUFsQjtRQUFBLENBQVYsQ0FBTCxDQURGO09BcENBO2FBc0NBLEdBdkNNO0lBQUEsQ0FwRVIsQ0FBQTs7c0JBQUE7O01BTEosQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/completion-backend/module-info.coffee
