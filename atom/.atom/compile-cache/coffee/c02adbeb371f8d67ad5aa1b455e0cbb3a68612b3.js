(function() {
  var CompositeDisposable, Emitter, EventsDelegation, Main, MinimapQuickSettingsElement, SpacePenDSL, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), EventsDelegation = _ref.EventsDelegation, SpacePenDSL = _ref.SpacePenDSL;

  _ref1 = require('event-kit'), CompositeDisposable = _ref1.CompositeDisposable, Emitter = _ref1.Emitter;

  Main = require('./main');

  module.exports = MinimapQuickSettingsElement = (function(_super) {
    __extends(MinimapQuickSettingsElement, _super);

    function MinimapQuickSettingsElement() {
      this.toggleSelectedItem = __bind(this.toggleSelectedItem, this);
      return MinimapQuickSettingsElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(MinimapQuickSettingsElement);

    EventsDelegation.includeInto(MinimapQuickSettingsElement);

    MinimapQuickSettingsElement.content = function() {
      return this.div({
        "class": 'select-list popover-list minimap-quick-settings'
      }, (function(_this) {
        return function() {
          _this.input({
            type: 'text',
            "class": 'hidden-input',
            outlet: 'hiddenInput'
          });
          _this.ol({
            "class": 'list-group mark-active',
            outlet: 'list'
          }, function() {
            _this.li({
              "class": 'separator',
              outlet: 'separator'
            });
            _this.li({
              "class": 'code-highlights',
              outlet: 'codeHighlights'
            }, 'code-highlights');
            return _this.li({
              "class": 'absolute-mode',
              outlet: 'absoluteMode'
            }, 'absolute-mode');
          });
          return _this.div({
            "class": 'btn-group'
          }, function() {
            _this.button({
              "class": 'btn btn-default',
              outlet: 'onLeftButton'
            }, 'On Left');
            return _this.button({
              "class": 'btn btn-default',
              outlet: 'onRightButton'
            }, 'On Right');
          });
        };
      })(this));
    };

    MinimapQuickSettingsElement.prototype.selectedItem = null;

    MinimapQuickSettingsElement.prototype.setModel = function(minimap) {
      this.minimap = minimap;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.plugins = {};
      this.itemsActions = new WeakMap;
      this.subscriptions.add(Main.onDidAddPlugin((function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.addItemFor(name, plugin);
        };
      })(this)));
      this.subscriptions.add(Main.onDidRemovePlugin((function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.removeItemFor(name, plugin);
        };
      })(this)));
      this.subscriptions.add(Main.onDidActivatePlugin((function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.activateItem(name, plugin);
        };
      })(this)));
      this.subscriptions.add(Main.onDidDeactivatePlugin((function(_this) {
        return function(_arg) {
          var name, plugin;
          name = _arg.name, plugin = _arg.plugin;
          return _this.deactivateItem(name, plugin);
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('minimap-quick-settings', {
        'core:move-up': (function(_this) {
          return function() {
            return _this.selectPreviousItem();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.selectNextItem();
          };
        })(this),
        'core:move-left': function() {
          return atom.config.set('minimap.displayMinimapOnLeft', true);
        },
        'core:move-right': function() {
          return atom.config.set('minimap.displayMinimapOnLeft', false);
        },
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.toggleSelectedItem();
          };
        })(this)
      }));
      this.codeHighlights.classList.toggle('active', this.minimap.displayCodeHighlights);
      this.subscriptions.add(this.subscribeTo(this.codeHighlights, {
        'mousedown': (function(_this) {
          return function(e) {
            e.preventDefault();
            return atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
          };
        })(this)
      }));
      this.itemsActions.set(this.codeHighlights, (function(_this) {
        return function() {
          return atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
        };
      })(this));
      this.subscriptions.add(this.subscribeTo(this.absoluteMode, {
        'mousedown': (function(_this) {
          return function(e) {
            e.preventDefault();
            return atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
          };
        })(this)
      }));
      this.itemsActions.set(this.absoluteMode, (function(_this) {
        return function() {
          return atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
        };
      })(this));
      this.subscriptions.add(this.subscribeTo(this.hiddenInput, {
        'focusout': (function(_this) {
          return function(e) {
            return _this.destroy();
          };
        })(this)
      }));
      this.subscriptions.add(this.subscribeTo(this.onLeftButton, {
        'mousedown': function(e) {
          e.preventDefault();
          return atom.config.set('minimap.displayMinimapOnLeft', true);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.onRightButton, {
        'mousedown': function(e) {
          e.preventDefault();
          return atom.config.set('minimap.displayMinimapOnLeft', false);
        }
      }));
      this.subscriptions.add(atom.config.observe('minimap.displayCodeHighlights', (function(_this) {
        return function(bool) {
          return _this.codeHighlights.classList.toggle('active', bool);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('minimap.absoluteMode', (function(_this) {
        return function(bool) {
          return _this.absoluteMode.classList.toggle('active', bool);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('minimap.displayMinimapOnLeft', (function(_this) {
        return function(bool) {
          _this.onLeftButton.classList.toggle('selected', bool);
          return _this.onRightButton.classList.toggle('selected', !bool);
        };
      })(this)));
      return this.initList();
    };

    MinimapQuickSettingsElement.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    MinimapQuickSettingsElement.prototype.attach = function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.appendChild(this);
      return this.hiddenInput.focus();
    };

    MinimapQuickSettingsElement.prototype.destroy = function() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      return this.parentNode.removeChild(this);
    };

    MinimapQuickSettingsElement.prototype.initList = function() {
      var name, plugin, _ref2, _results;
      this.itemsDisposables = new WeakMap;
      _ref2 = Main.plugins;
      _results = [];
      for (name in _ref2) {
        plugin = _ref2[name];
        _results.push(this.addItemFor(name, plugin));
      }
      return _results;
    };

    MinimapQuickSettingsElement.prototype.toggleSelectedItem = function() {
      var _base;
      return typeof (_base = this.itemsActions.get(this.selectedItem)) === "function" ? _base() : void 0;
    };

    MinimapQuickSettingsElement.prototype.selectNextItem = function() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.nextSibling != null) {
        this.selectedItem = this.selectedItem.nextSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.nextSibling;
        }
      } else {
        this.selectedItem = this.list.firstChild;
      }
      return this.selectedItem.classList.add('selected');
    };

    MinimapQuickSettingsElement.prototype.selectPreviousItem = function() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.previousSibling != null) {
        this.selectedItem = this.selectedItem.previousSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.previousSibling;
        }
      } else {
        this.selectedItem = this.list.lastChild;
      }
      return this.selectedItem.classList.add('selected');
    };

    MinimapQuickSettingsElement.prototype.addItemFor = function(name, plugin) {
      var action, item;
      item = document.createElement('li');
      if (plugin.isActive()) {
        item.classList.add('active');
      }
      item.textContent = name;
      action = (function(_this) {
        return function() {
          return Main.togglePluginActivation(name);
        };
      })(this);
      this.itemsActions.set(item, action);
      this.itemsDisposables.set(item, this.addDisposableEventListener(item, 'mousedown', (function(_this) {
        return function(e) {
          e.preventDefault();
          return action();
        };
      })(this)));
      this.plugins[name] = item;
      this.list.insertBefore(item, this.separator);
      if (this.selectedItem == null) {
        this.selectedItem = item;
        return this.selectedItem.classList.add('selected');
      }
    };

    MinimapQuickSettingsElement.prototype.removeItemFor = function(name, plugin) {
      try {
        this.list.removeChild(this.plugins[name]);
      } catch (_error) {}
      return delete this.plugins[name];
    };

    MinimapQuickSettingsElement.prototype.activateItem = function(name, plugin) {
      return this.plugins[name].classList.add('active');
    };

    MinimapQuickSettingsElement.prototype.deactivateItem = function(name, plugin) {
      return this.plugins[name].classList.remove('active');
    };

    return MinimapQuickSettingsElement;

  })(HTMLElement);

  module.exports = MinimapQuickSettingsElement = document.registerElement('minimap-quick-settings', {
    prototype: MinimapQuickSettingsElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJHQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBa0MsT0FBQSxDQUFRLFlBQVIsQ0FBbEMsRUFBQyx3QkFBQSxnQkFBRCxFQUFtQixtQkFBQSxXQUFuQixDQUFBOztBQUFBLEVBQ0EsUUFBaUMsT0FBQSxDQUFRLFdBQVIsQ0FBakMsRUFBQyw0QkFBQSxtQkFBRCxFQUFzQixnQkFBQSxPQUR0QixDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBSFAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixrREFBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsMkJBQXhCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLDJCQUE3QixDQURBLENBQUE7O0FBQUEsSUFHQSwyQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8saURBQVA7T0FBTCxFQUErRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzdELFVBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLFlBQUEsSUFBQSxFQUFNLE1BQU47QUFBQSxZQUFjLE9BQUEsRUFBTyxjQUFyQjtBQUFBLFlBQXFDLE1BQUEsRUFBUSxhQUE3QztXQUFQLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsT0FBQSxFQUFPLHdCQUFQO0FBQUEs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

//# sourceURL=/home/epse/.atom/packages/minimap/lib/minimap-quick-settings-element.coffee
