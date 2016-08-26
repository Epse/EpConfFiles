(function() {
  var BufferInfo, CompositeDisposable, Emitter, parseHsModuleImports, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  parseHsModuleImports = require('atom-haskell-utils').parseHsModuleImports;

  module.exports = BufferInfo = (function() {
    BufferInfo.prototype.buffer = null;

    BufferInfo.prototype.emitter = null;

    BufferInfo.prototype.disposables = null;

    function BufferInfo(buffer) {
      this.buffer = buffer;
      this.getModuleName = __bind(this.getModuleName, this);
      this.getImports = __bind(this.getImports, this);
      this.onDidSave = __bind(this.onDidSave, this);
      this.onDidDestroy = __bind(this.onDidDestroy, this);
      this.destroy = __bind(this.destroy, this);
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.emitter = new Emitter);
      this.disposables.add(this.buffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
    }

    BufferInfo.prototype.destroy = function() {
      if (this.buffer == null) {
        return;
      }
      this.buffer = null;
      this.disposables.dispose();
      this.disposables = null;
      this.emitter.emit('did-destroy');
      return this.emitter = null;
    };

    BufferInfo.prototype.onDidDestroy = function(callback) {
      if (this.emitter == null) {
        return new Disposable(function() {});
      }
      return this.emitter.on('did-destroy', callback);
    };

    BufferInfo.prototype.onDidSave = function(callback) {
      if (this.buffer == null) {
        return new Disposable(function() {});
      }
      return this.buffer.onDidSave(callback);
    };

    BufferInfo.prototype.parse = function() {
      return new Promise((function(_this) {
        return function(resolve) {
          var newText;
          newText = _this.buffer.getText();
          if (_this.oldText === newText) {
            return resolve(_this.oldImports);
          } else {
            return parseHsModuleImports(_this.buffer.getText(), function(imports) {
              _this.oldText = newText;
              if (imports.error != null) {
                console.error("" + imports.error + " in " + imports.file + " on " + imports.line + "," + imports.col);
                return resolve(_this.oldImports = {
                  name: void 0,
                  imports: []
                });
              } else {
                return resolve(_this.oldImports = imports);
              }
            });
          }
        };
      })(this));
    };

    BufferInfo.prototype.getImports = function() {
      if (this.buffer == null) {
        return Promise.resolve([]);
      }
      return this.parse().then(function(res) {
        return res.imports.map(function(imp) {
          var getCName, getName, _ref1, _ref2;
          getName = function(thing) {
            switch (false) {
              case thing.Ident == null:
                return thing.Ident;
              case thing.Symbol == null:
                return thing.Symbol;
            }
          };
          getCName = function(thing) {
            switch (false) {
              case thing.VarName == null:
                return getName(thing.VarName);
              case thing.ConName == null:
                return getName(thing.ConName);
            }
          };
          return {
            qualified: imp.importQualified,
            name: imp.importModule,
            alias: imp.importAs,
            hiding: (_ref1 = (_ref2 = imp.importSpecs) != null ? _ref2[0] : void 0) != null ? _ref1 : false,
            importList: imp.importSpecs != null ? Array.prototype.concat.apply([], imp.importSpecs[1].map(function(spec) {
              switch (false) {
                case !spec.IVar:
                  return [getName(spec.IVar)];
                case !spec.IAbs:
                  return [getName(spec.IAbs[1])];
                case !spec.IThingAll:
                  return [
                    getName(spec.IThingAll), {
                      parent: getName(spec.IThingAll)
                    }
                  ];
                case !spec.IThingWith:
                  return Array.prototype.concat.apply([getName(spec.IThingWith[0])], spec.IThingWith[1].map(function(v) {
                    return getCName(v);
                  }));
              }
            })) : void 0
          };
        });
      }).then(function(modules) {
        if (!(modules.some(function(_arg) {
          var name;
          name = _arg.name;
          return name === 'Prelude';
        }))) {
          modules.push({
            qualified: false,
            hiding: false,
            name: 'Prelude'
          });
        }
        return modules;
      });
    };

    BufferInfo.prototype.getModuleName = function() {
      if (this.buffer == null) {
        return Promise.resolve();
      }
      return this.parse().then(function(res) {
        return res.name;
      });
    };

    return BufferInfo;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oYXNrZWxsLWdoYy1tb2QvbGliL2NvbXBsZXRpb24tYmFja2VuZC9idWZmZXItaW5mby5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0VBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUF0QixDQUFBOztBQUFBLEVBQ0MsdUJBQXdCLE9BQUEsQ0FBUSxvQkFBUixFQUF4QixvQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNKLHlCQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEseUJBQ0EsT0FBQSxHQUFTLElBRFQsQ0FBQTs7QUFBQSx5QkFFQSxXQUFBLEdBQWEsSUFGYixDQUFBOztBQUlhLElBQUEsb0JBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQTVCLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwQyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBRG9DO1FB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

//# sourceURL=/home/epse/.atom/packages/haskell-ghc-mod/lib/completion-backend/buffer-info.coffee
