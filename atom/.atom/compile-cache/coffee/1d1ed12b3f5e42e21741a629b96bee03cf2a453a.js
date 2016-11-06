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
                console.error("Parse error: " + imports.error);
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
      return this.parse().then(function(_arg) {
        var imports;
        imports = _arg.imports;
        if (!(imports.some(function(_arg1) {
          var name;
          name = _arg1.name;
          return name === 'Prelude';
        }))) {
          imports.push({
            qualified: false,
            hiding: false,
            name: 'Prelude'
          });
        }
        return imports;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2hhc2tlbGwtZ2hjLW1vZC9saWIvY29tcGxldGlvbi1iYWNrZW5kL2J1ZmZlci1pbmZvLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvRUFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BQXRCLENBQUE7O0FBQUEsRUFDQyx1QkFBd0IsT0FBQSxDQUFRLG9CQUFSLEVBQXhCLG9CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNRO0FBQ0oseUJBQUEsTUFBQSxHQUFRLElBQVIsQ0FBQTs7QUFBQSx5QkFDQSxPQUFBLEdBQVMsSUFEVCxDQUFBOztBQUFBLHlCQUVBLFdBQUEsR0FBYSxJQUZiLENBQUE7O0FBSWEsSUFBQSxvQkFBRSxNQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BDLEtBQUMsQ0FBQSxP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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/haskell-ghc-mod/lib/completion-backend/buffer-info.coffee
