(function() {
  var $, Disposable, KeyEventView, KeyMapper, KeymapGeneratorView, KeymapTableView, ModifierStateHandler, ModifierView, ScrollView, TextEditorView, util, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Disposable = require('atom').Disposable;

  _ref = require('atom-space-pen-views'), ScrollView = _ref.ScrollView, TextEditorView = _ref.TextEditorView, $ = _ref.$;

  util = require('util');

  KeyMapper = require('../key-mapper');

  ModifierStateHandler = require('../modifier-state-handler');

  ModifierView = require('./modifier-view');

  KeyEventView = require('./key-event-view');

  KeymapTableView = require('./keymap-table-view');

  module.exports = KeymapGeneratorView = (function(_super) {
    __extends(KeymapGeneratorView, _super);

    function KeymapGeneratorView() {
      return KeymapGeneratorView.__super__.constructor.apply(this, arguments);
    }

    KeymapGeneratorView.prototype.previousMapping = null;

    KeymapGeneratorView.prototype.modifierStateHandler = null;

    KeymapGeneratorView.prototype.keyMapper = null;

    KeymapGeneratorView.content = function() {
      return this.div({
        "class": 'keymap-generator'
      }, (function(_this) {
        return function() {
          _this.header({
            "class": 'header'
          }, function() {
            return _this.h1({
              "class": 'title'
            }, 'Build a Keymap for your foreign keyboard layout');
          });
          _this.section({
            "class": 'keys-events-panel'
          }, function() {
            _this.subview('keyDownView', new KeyEventView({
              title: 'KeyDown Event'
            }));
            return _this.subview('keyPressView', new KeyEventView({
              title: 'KeyPress Event'
            }));
          });
          _this.section({
            "class": 'modifier-bar-panel'
          }, function() {
            _this.subview('ctrlView', new ModifierView({
              label: 'Ctrl'
            }));
            _this.subview('altView', new ModifierView({
              label: 'Alt'
            }));
            _this.subview('shiftView', new ModifierView({
              label: 'Shift'
            }));
            return _this.subview('altgrView', new ModifierView({
              label: 'AltGr'
            }));
          });
          _this.section({
            "class": 'key-input-panel'
          }, function() {
            _this.div({
              "class": 'key-label'
            }, 'Capture Key-Events from input and create Key-Mappings');
            return _this.input({
              "class": 'key-input',
              type: 'text',
              focus: 'clearInput',
              keydown: 'onKeyDown',
              keypress: 'onKeyPress',
              keyup: 'onKeyUp',
              outlet: 'keyInput'
            });
          });
          _this.section({
            "class": 'test-key-panel'
          }, function() {
            _this.div({
              "class": 'test-key-label'
            }, 'Test your generated Key-Mappings');
            return _this.subview('testKeyInput', new TextEditorView({
              mini: true
            }));
          });
          return _this.subview('keymapTableView', new KeymapTableView());
        };
      })(this));
    };

    KeymapGeneratorView.prototype.attached = function() {
      this.keyMapper = KeyMapper.getInstance();
      this.modifierStateHandler = new ModifierStateHandler();
      this.previousMapping = this.keyMapper.getKeymap();
      this.keymapTableView.onKeymapChange((function(_this) {
        return function(keymap) {
          return _this.keyMapper.setKeymap(keymap);
        };
      })(this));
      this.keymapTableView.clear();
      return this.keymapTableView.render();
    };

    KeymapGeneratorView.prototype.detached = function() {
      if (this.previousMapping !== null) {
        this.keyMapper.setKeymap(this.previousMapping);
      }
      this.keyMapper = null;
      return this.modifierStateHandler = null;
    };

    KeymapGeneratorView.prototype.updateModifiers = function(modifierState) {
      this.ctrlView.setActive(modifierState.ctrl);
      this.altView.setActive(modifierState.alt);
      this.shiftView.setActive(modifierState.shift);
      return this.altgrView.setActive(modifierState.altgr);
    };

    KeymapGeneratorView.prototype.addMapping = function() {
      var down, modifier, press;
      down = this.keyDownView.getKey();
      modifier = this.keyDownView.getModifiers();
      press = this.keyPressView.getKey();
      if (press !== null && down.char !== press.char) {
        this.keymapTableView.addKeyMapping(down, modifier, press, this.keyInput.val().length > 1);
        return this.keyMapper.setKeymap(this.keymapTableView.getKeymap());
      }
    };

    KeymapGeneratorView.prototype.clearInput = function() {
      return this.keyInput.val('');
    };

    KeymapGeneratorView.prototype.onKeyDown = function(event) {
      var modifierState, originalEvent;
      this.clearInput();
      this.keyDownView.clear();
      this.keyPressView.clear();
      originalEvent = $.extend({}, event.originalEvent);
      this.modifierStateHandler.handleKeyEvent(originalEvent);
      modifierState = this.modifierStateHandler.getState();
      this.updateModifiers(modifierState);
      return this.keyDownView.setKey(originalEvent, modifierState);
    };

    KeymapGeneratorView.prototype.onKeyPress = function(event) {
      var originalEvent;
      originalEvent = $.extend({}, event.originalEvent);
      return this.keyPressView.setKey(originalEvent, this.modifierStateHandler.getState());
    };

    KeymapGeneratorView.prototype.onKeyUp = function(event) {
      var originalEvent;
      originalEvent = $.extend({}, event.originalEvent);
      this.modifierStateHandler.handleKeyEvent(originalEvent);
      this.addMapping();
      return setTimeout((function(_this) {
        return function() {
          var modifierState;
          modifierState = _this.modifierStateHandler.getState();
          return _this.updateModifiers(modifierState);
        };
      })(this), 50);
    };

    KeymapGeneratorView.deserialize = function(options) {
      if (options == null) {
        options = {};
      }
      return new KeymapGeneratorView(options);
    };

    KeymapGeneratorView.prototype.serialize = function() {
      return {
        deserializer: this.constructor.name,
        uri: this.getURI()
      };
    };

    KeymapGeneratorView.prototype.getURI = function() {
      return this.uri;
    };

    KeymapGeneratorView.prototype.getTitle = function() {
      return "Keymap-Generator";
    };

    KeymapGeneratorView.prototype.onDidChangeTitle = function() {
      return new Disposable(function() {});
    };

    KeymapGeneratorView.prototype.onDidChangeModified = function() {
      return new Disposable(function() {});
    };

    KeymapGeneratorView.prototype.isEqual = function(other) {
      return other instanceof KeymapGeneratorView;
    };

    return KeymapGeneratorView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL3ZpZXdzL2tleW1hcC1nZW5lcmF0b3Itdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0pBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFDQSxPQUFrQyxPQUFBLENBQVEsc0JBQVIsQ0FBbEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsc0JBQUEsY0FBYixFQUE2QixTQUFBLENBRDdCLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxlQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUx2QixDQUFBOztBQUFBLEVBT0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQVBmLENBQUE7O0FBQUEsRUFRQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBUmYsQ0FBQTs7QUFBQSxFQVNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBVGxCLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGtDQUFBLGVBQUEsR0FBaUIsSUFBakIsQ0FBQTs7QUFBQSxrQ0FDQSxvQkFBQSxHQUFzQixJQUR0QixDQUFBOztBQUFBLGtDQUVBLFNBQUEsR0FBVyxJQUZYLENBQUE7O0FBQUEsSUFJQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sa0JBQVA7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

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/views/keymap-generator-view.coffee
