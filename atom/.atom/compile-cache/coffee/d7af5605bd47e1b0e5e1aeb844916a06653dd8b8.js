(function() {
  var KeyMapper, KeyboardLocalization, KeymapGeneratorUri, KeymapGeneratorView, KeymapLoader, ModifierStateHandler, createKeymapGeneratorView, util, vimModeActive;

  util = require('util');

  KeymapLoader = require('./keymap-loader');

  KeyMapper = require('./key-mapper');

  ModifierStateHandler = require('./modifier-state-handler');

  vimModeActive = require('./helpers').vimModeActive;

  KeymapGeneratorView = null;

  KeymapGeneratorUri = 'atom://keyboard-localization/keymap-manager';

  createKeymapGeneratorView = function(state) {
    if (KeymapGeneratorView == null) {
      KeymapGeneratorView = require('./views/keymap-generator-view');
    }
    return new KeymapGeneratorView(state);
  };

  atom.deserializers.add({
    name: 'KeymapGeneratorView',
    deserialize: function(state) {
      return createKeymapGeneratorView(state);
    }
  });

  KeyboardLocalization = {
    pkg: 'keyboard-localization',
    keystrokeForKeyboardEventCb: null,
    keymapLoader: null,
    keyMapper: null,
    modifierStateHandler: null,
    keymapGeneratorView: null,
    config: {
      useKeyboardLayout: {
        type: 'string',
        "default": 'de_DE',
        "enum": ['cs_CZ-qwerty', 'cs_CZ', 'da_DK', 'de_CH', 'de_DE-neo', 'de_DE', 'en_GB', 'es_ES', 'es_LA', 'et_EE', 'fr_BE', 'fr_CH', 'fr_FR', 'fr_FR-bepo', 'fr_CA', 'fi_FI', 'fi_FI-mac', 'hu_HU', 'it_IT', 'ja_JP', 'lv_LV', 'nb_NO', 'pl_PL', 'pt_BR', 'pt_PT', 'ro_RO', 'ru_RU', 'sl_SL', 'sr_RS', 'sv_SE', 'tr_TR', 'uk_UA'],
        description: 'Pick your locale'
      },
      useKeyboardLayoutFromPath: {
        type: 'string',
        "default": '',
        description: 'Provide an absolute path to your keymap-json file'
      }
    },
    activate: function(state) {
      atom.workspace.addOpener(function(filePath) {
        if (filePath === KeymapGeneratorUri) {
          return createKeymapGeneratorView({
            uri: KeymapGeneratorUri
          });
        }
      });
      atom.commands.add('atom-workspace', {
        'keyboard-localization:keymap-generator': function() {
          return atom.workspace.open(KeymapGeneratorUri);
        }
      });
      this.keymapLoader = new KeymapLoader();
      this.keymapLoader.loadKeymap();
      this.keyMapper = KeyMapper.getInstance();
      this.modifierStateHandler = new ModifierStateHandler();
      this.changeUseKeyboardLayout = atom.config.onDidChange([this.pkg, 'useKeyboardLayout'].join('.'), (function(_this) {
        return function() {
          _this.keymapLoader.loadKeymap();
          if (_this.keymapLoader.isLoaded()) {
            return _this.keyMapper.setKeymap(_this.keymapLoader.getKeymap());
          }
        };
      })(this));
      this.changeUseKeyboardLayoutFromPath = atom.config.onDidChange([this.pkg, 'useKeyboardLayoutFromPath'].join('.'), (function(_this) {
        return function() {
          _this.keymapLoader.loadKeymap();
          if (_this.keymapLoader.isLoaded()) {
            return _this.keyMapper.setKeymap(_this.keymapLoader.getKeymap());
          }
        };
      })(this));
      if (this.keymapLoader.isLoaded()) {
        this.keyMapper.setKeymap(this.keymapLoader.getKeymap());
        this.keyMapper.setModifierStateHandler(this.modifierStateHandler);
        this.orginalKeyEvent = atom.keymaps.keystrokeForKeyboardEvent;
        return atom.keymaps.keystrokeForKeyboardEvent = (function(_this) {
          return function(event) {
            return _this.onKeyEvent(event);
          };
        })(this);
      }
    },
    deactivate: function() {
      var _ref;
      if (this.keymapLoader.isLoaded()) {
        atom.keymaps.keystrokeForKeyboardEvent = this.orginalKeyEvent;
        this.orginalKeyEvent = null;
      }
      this.changeUseKeyboardLayout.dispose();
      this.changeUseKeyboardLayoutFromPath.dispose();
      if ((_ref = this.keymapGeneratorView) != null) {
        _ref.destroy();
      }
      this.modifierStateHandler = null;
      this.keymapLoader = null;
      this.keyMapper = null;
      return this.keymapGeneratorView = null;
    },
    onKeyEvent: function(event) {
      var character;
      if (!event) {
        return '';
      }
      this.modifierStateHandler.handleKeyEvent(event);
      if (event.type === 'keydown' && (event.translated || this.keyMapper.remap(event))) {
        character = String.fromCharCode(event.keyCode);
        if (vimModeActive(event.target)) {
          if (this.modifierStateHandler.isAltGr() || this.modifierStateHandler.isShift()) {
            return character;
          }
        }
        return this.modifierStateHandler.getStrokeSequence(character);
      } else {
        return this.orginalKeyEvent(event);
      }
    }
  };

  module.exports = KeyboardLocalization;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL2tleWJvYXJkLWxvY2FsaXphdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQURmLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FGWixDQUFBOztBQUFBLEVBR0Esb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBSHZCLENBQUE7O0FBQUEsRUFJQyxnQkFBaUIsT0FBQSxDQUFRLFdBQVIsRUFBakIsYUFKRCxDQUFBOztBQUFBLEVBTUEsbUJBQUEsR0FBc0IsSUFOdEIsQ0FBQTs7QUFBQSxFQU9BLGtCQUFBLEdBQXFCLDZDQVByQixDQUFBOztBQUFBLEVBU0EseUJBQUEsR0FBNEIsU0FBQyxLQUFELEdBQUE7O01BQzFCLHNCQUF1QixPQUFBLENBQVEsK0JBQVI7S0FBdkI7V0FDSSxJQUFBLG1CQUFBLENBQW9CLEtBQXBCLEVBRnNCO0VBQUEsQ0FUNUIsQ0FBQTs7QUFBQSxFQWFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FDRTtBQUFBLElBQUEsSUFBQSxFQUFNLHFCQUFOO0FBQUEsSUFDQSxXQUFBLEVBQWEsU0FBQyxLQUFELEdBQUE7YUFBVyx5QkFBQSxDQUEwQixLQUExQixFQUFYO0lBQUEsQ0FEYjtHQURGLENBYkEsQ0FBQTs7QUFBQSxFQWlCQSxvQkFBQSxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssdUJBQUw7QUFBQSxJQUNBLDJCQUFBLEVBQTZCLElBRDdCO0FBQUEsSUFFQSxZQUFBLEVBQWMsSUFGZDtB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

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/keyboard-localization.coffee
