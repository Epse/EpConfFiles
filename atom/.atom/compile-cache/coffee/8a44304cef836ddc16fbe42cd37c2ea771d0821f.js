(function() {
  var KeyMapper, ModifierStateHandler, charCodeFromKeyIdentifier, charCodeToKeyIdentifier, getInstance, keyMapper, _ref;

  ModifierStateHandler = require('./modifier-state-handler');

  _ref = require('./helpers'), charCodeFromKeyIdentifier = _ref.charCodeFromKeyIdentifier, charCodeToKeyIdentifier = _ref.charCodeToKeyIdentifier;

  KeyMapper = (function() {
    function KeyMapper() {}

    KeyMapper.prototype.translationTable = null;

    KeyMapper.prototype.modifierStateHandler = null;

    KeyMapper.prototype.destroy = function() {
      this.translationTable = null;
      return this.modifierStateHandler = null;
    };

    KeyMapper.prototype.setModifierStateHandler = function(modifierStateHandler) {
      return this.modifierStateHandler = modifierStateHandler;
    };

    KeyMapper.prototype.setKeymap = function(keymap) {
      return this.translationTable = keymap;
    };

    KeyMapper.prototype.getKeymap = function() {
      return this.translationTable;
    };

    KeyMapper.prototype.translateKeyBinding = function(event) {
      var charCode, identifier, translation;
      identifier = charCodeFromKeyIdentifier(event.keyIdentifier);
      charCode = null;
      if ((this.translationTable != null) && (identifier != null) && (this.translationTable[identifier] != null) && (this.modifierStateHandler != null)) {
        if (translation = this.translationTable[identifier]) {
          if ((translation.altshifted != null) && this.modifierStateHandler.isShift() && this.modifierStateHandler.isAltGr()) {
            charCode = translation.altshifted;
          } else if ((translation.shifted != null) && this.modifierStateHandler.isShift()) {
            charCode = translation.shifted;
          } else if ((translation.alted != null) && this.modifierStateHandler.isAltGr()) {
            charCode = translation.alted;
          } else if (translation.unshifted != null) {
            charCode = translation.unshifted;
          }
        }
      }
      if (charCode != null) {
        Object.defineProperty(event, 'keyIdentifier', {
          get: function() {
            return charCodeToKeyIdentifier(charCode);
          }
        });
        Object.defineProperty(event, 'keyCode', {
          get: function() {
            return charCode;
          }
        });
        Object.defineProperty(event, 'which', {
          get: function() {
            return charCode;
          }
        });
        Object.defineProperty(event, 'translated', {
          get: function() {
            return true;
          }
        });
        Object.defineProperty(event, 'altKey', {
          get: function() {
            return false;
          }
        });
        Object.defineProperty(event, 'ctrlKey', {
          get: function() {
            return false;
          }
        });
        Object.defineProperty(event, 'shiftKey', {
          get: function() {
            return false;
          }
        });
        Object.defineProperty(event, 'metaKey', {
          get: function() {
            return false;
          }
        });
        if (this.modifierStateHandler.isAltGr() && !translation.accent) {
          return event.preventDefault();
        }
      }
    };

    KeyMapper.prototype.remap = function(event) {
      var translated;
      this.translateKeyBinding(event);
      translated = event.translated === true;
      delete event.translated;
      return translated;
    };

    return KeyMapper;

  })();

  keyMapper = null;

  getInstance = function() {
    if (keyMapper === null) {
      keyMapper = new KeyMapper();
    }
    return keyMapper;
  };

  module.exports = {
    getInstance: getInstance
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL2tleS1tYXBwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlIQUFBOztBQUFBLEVBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBQXZCLENBQUE7O0FBQUEsRUFDQSxPQUF1RCxPQUFBLENBQVEsV0FBUixDQUF2RCxFQUFDLGlDQUFBLHlCQUFELEVBQTRCLCtCQUFBLHVCQUQ1QixDQUFBOztBQUFBLEVBR007MkJBQ0o7O0FBQUEsd0JBQUEsZ0JBQUEsR0FBa0IsSUFBbEIsQ0FBQTs7QUFBQSx3QkFDQSxvQkFBQSxHQUFzQixJQUR0QixDQUFBOztBQUFBLHdCQUdBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFwQixDQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCLEtBRmpCO0lBQUEsQ0FIVCxDQUFBOztBQUFBLHdCQU9BLHVCQUFBLEdBQXlCLFNBQUMsb0JBQUQsR0FBQTthQUN2QixJQUFDLENBQUEsb0JBQUQsR0FBd0IscUJBREQ7SUFBQSxDQVB6QixDQUFBOztBQUFBLHdCQVVBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTthQUNULElBQUMsQ0FBQSxnQkFBRCxHQUFvQixPQURYO0lBQUEsQ0FWWCxDQUFBOztBQUFBLHdCQWFBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxhQUFPLElBQUMsQ0FBQSxnQkFBUixDQURTO0lBQUEsQ0FiWCxDQUFBOztBQUFBLHdCQWdCQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQsR0FBQTtBQUNuQixVQUFBLGlDQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEseUJBQUEsQ0FBMEIsS0FBSyxDQUFDLGFBQWhDLENBQWIs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

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/key-mapper.coffee
