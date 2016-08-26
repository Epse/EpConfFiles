
/*
 * Modifierhandling shamelessly stolen and customized from brackets:
 * https://github.com/adobe/brackets/blob/master/src/command/KeyBindingManager.js
 */

(function() {
  var KeyEvent, ModifierStateHandler;

  KeyEvent = require('./key-event');

  module.exports = ModifierStateHandler = (function() {

    /**
     * States of Ctrl key down detection
     * @enum {number}
     */
    var LINUX_ALTGR_IDENTIFIER;

    ModifierStateHandler.prototype.CtrlDownStates = {
      'NOT_YET_DETECTED': 0,
      'DETECTED': 1,
      'DETECTED_AND_IGNORED': 2
    };


    /**
     * Flags used to determine whether right Alt key is pressed. When it is pressed,
     * the following two keydown events are triggered in that specific order.
     *
     *    1. ctrlDown - flag used to record { ctrlKey: true, keyIdentifier: "Control", ... } keydown event
     *    2. altGrDown - flag used to record { ctrlKey: true, altKey: true, keyIdentifier: "Alt", ... } keydown event
     *
     * @type {CtrlDownStates|boolean}
     */

    ModifierStateHandler.prototype.ctrlDown = 0;

    ModifierStateHandler.prototype.altGrDown = false;

    ModifierStateHandler.prototype.hasShift = false;

    ModifierStateHandler.prototype.hasCtrl = false;

    ModifierStateHandler.prototype.hasAltGr = false;

    ModifierStateHandler.prototype.hasAlt = false;

    ModifierStateHandler.prototype.hasCmd = false;


    /**
     * Constant used for checking the interval between Control keydown event and Alt keydown event.
     * If the right Alt key is down we get Control keydown followed by Alt keydown within 30 ms. if
     * the user is pressing Control key and then Alt key, the interval will be larger than 30 ms.
     * @type {number}
     */

    ModifierStateHandler.prototype.MAX_INTERVAL_FOR_CTRL_ALT_KEYS = 30;


    /**
     * Constant used for identifying AltGr on Linux
     * @type {String}
     */

    LINUX_ALTGR_IDENTIFIER = 'U+00E1';


    /**
     * Used to record the timeStamp property of the last keydown event.
     * @type {number}
     */

    ModifierStateHandler.prototype.lastTimeStamp = null;


    /**
     * Used to record the keyIdentifier property of the last keydown event.
     * @type {string}
     */

    ModifierStateHandler.prototype.lastKeyIdentifier = null;


    /**
     * clear modifiers listener on editor blur and focus
     * @type {event}
     */

    ModifierStateHandler.prototype.clearModifierStateListener = null;

    function ModifierStateHandler() {
      this.clearModifierStateListener = (function(_this) {
        return function() {
          return _this.clearModifierState();
        };
      })(this);
      window.addEventListener('blur', this.clearModifierStateListener);
      window.addEventListener('focus', this.clearModifierStateListener);
    }

    ModifierStateHandler.prototype.destroy = function() {
      window.removeEventListener('blur', this.clearModifierStateListener);
      return window.removeEventListener('focus', this.clearModifierStateListener);
    };

    ModifierStateHandler.prototype.clearModifierState = function() {
      if (process.platform === 'win32') {
        this.quitAltGrMode();
      }
      this.hasShift = false;
      this.hasCtrl = false;
      this.hasAltGr = false;
      this.hasAlt = false;
      return this.hasCmd = false;
    };


    /**
     * Resets all the flags.
     */

    ModifierStateHandler.prototype.quitAltGrMode = function() {
      this.ctrlDown = this.CtrlDownStates.NOT_YET_DETECTED;
      this.altGrDown = false;
      this.hasAltGr = false;
      this.lastTimeStamp = null;
      return this.lastKeyIdentifier = null;
    };


    /**
     * Detects the release of AltGr key by checking all keyup events
     * until we receive one with ctrl key code. Once detected, reset
     * all the flags.
     *
     * @param {KeyboardEvent} e keyboard event object
     */

    ModifierStateHandler.prototype.detectAltGrKeyUp = function(e) {
      var key;
      if (process.platform === 'win32') {
        key = e.keyCode || e.which;
        if (this.altGrDown && key === KeyEvent.DOM_VK_CONTROL) {
          this.quitAltGrMode();
        }
      }
      if (process.platform === 'linux') {
        if (e.keyIdentifier === LINUX_ALTGR_IDENTIFIER) {
          return this.quitAltGrMode();
        }
      }
    };


    /**
     * Detects whether AltGr key is pressed. When it is pressed, the first keydown event has
     * ctrlKey === true with keyIdentifier === "Control". The next keydown event with
     * altKey === true, ctrlKey === true and keyIdentifier === "Alt" is sent within 30 ms. Then
     * the next keydown event with altKey === true, ctrlKey === true and keyIdentifier === "Control"
     * is sent. If the user keep holding AltGr key down, then the second and third
     * keydown events are repeatedly sent out alternately. If the user is also holding down Ctrl
     * key, then either keyIdentifier === "Control" or keyIdentifier === "Alt" is repeatedly sent
     * but not alternately.
     *
     * @param {KeyboardEvent} e keyboard event object
     */

    ModifierStateHandler.prototype.detectAltGrKeyDown = function(e) {
      if (process.platform === 'win32') {
        if (!this.altGrDown) {
          if (this.ctrlDown !== this.CtrlDownStates.DETECTED_AND_IGNORED && e.ctrlKey && e.keyIdentifier === 'Control') {
            this.ctrlDown = this.CtrlDownStates.DETECTED;
          } else if (e.repeat && e.ctrlKey && e.keyIdentifier === 'Control') {
            this.ctrlDown = this.CtrlDownStates.DETECTED_AND_IGNORED;
          } else if (this.ctrlDown === this.CtrlDownStates.DETECTED && e.altKey && e.ctrlKey && e.keyIdentifier === 'Alt' && e.timeStamp - this.lastTimeStamp < this.MAX_INTERVAL_FOR_CTRL_ALT_KEYS && (e.location === 2 || e.keyLocation === 2)) {
            this.altGrDown = true;
            this.lastKeyIdentifier = 'Alt';
          } else {
            this.ctrlDown = this.CtrlDownStates.NOT_YET_DETECTED;
          }
          this.lastTimeStamp = e.timeStamp;
        } else if (e.keyIdentifier === 'Control' || e.keyIdentifier === 'Alt') {
          if (e.altKey && e.ctrlKey && e.keyIdentifier === this.lastKeyIdentifier) {
            this.quitAltGrMode();
          } else {
            this.lastKeyIdentifier = e.keyIdentifier;
          }
        }
      }
      if (process.platform === 'linux') {
        if (!this.altGrDown) {
          if (e.keyIdentifier === LINUX_ALTGR_IDENTIFIER) {
            return this.altGrDown = true;
          }
        }
      } else {

      }
    };


    /**
     * Handle key event
     *
     * @param {KeyboardEvent} e keyboard event object
     */

    ModifierStateHandler.prototype.handleKeyEvent = function(e) {
      if (e.type === 'keydown') {
        this.detectAltGrKeyDown(e);
      }
      if (e.type === 'keyup') {
        this.detectAltGrKeyUp(e);
      }
      if (process.platform === 'win32') {
        this.hasCtrl = !this.altGrDown && e.ctrlKey;
        this.hasAltGr = this.altGrDown;
        this.hasAlt = !this.altGrDown && e.altKey;
      } else if (process.platform === 'linux') {
        this.hasCtrl = e.ctrlKey;
        this.hasAltGr = this.altGrDown;
        this.hasAlt = e.altKey;
      } else {
        this.hasCtrl = (e.ctrlKey != null) && e.ctrlKey === true;
        this.hasAltGr = e.altKey;
        this.hasAlt = e.altKey;
      }
      this.hasShift = e.shiftKey;
      return this.hasCmd = (e.metaKey != null) && e.metaKey === true;
    };


    /**
     * determine if shift key is pressed
     */

    ModifierStateHandler.prototype.isShift = function() {
      return this.hasShift;
    };


    /**
     * determine if altgr key is pressed
     */

    ModifierStateHandler.prototype.isAltGr = function() {
      return this.hasAltGr;
    };


    /**
     * determine if alt key is pressed
     */

    ModifierStateHandler.prototype.isAlt = function() {
      return this.hasAlt;
    };


    /**
     * determine if ctrl key is pressed
     */

    ModifierStateHandler.prototype.isCtrl = function() {
      return this.hasCtrl;
    };


    /**
     * determine if cmd key is pressed
     */

    ModifierStateHandler.prototype.isCmd = function() {
      return this.hasCmd;
    };


    /**
     * get the state of all modifiers
     * @return {object}
     */

    ModifierStateHandler.prototype.getState = function() {
      return {
        shift: this.isShift(),
        altgr: this.isAltGr(),
        alt: this.isAlt(),
        ctrl: this.isCtrl(),
        cmd: this.isCmd()
      };
    };


    /**
     * get the modifier sequence string.
     * Additionally with a character
     * @param {String} character
     * @return {String}
     */

    ModifierStateHandler.prototype.getStrokeSequence = function(character) {
      var sequence;
      sequence = [];
      if (this.isCtrl()) {
        sequence.push('ctrl');
      }
      if (this.isAlt()) {
        sequence.push('alt');
      }
      if (this.isAltGr()) {
        sequence.push('altgr');
      }
      if (this.isShift()) {
        sequence.push('shift');
      }
      if (this.isCmd()) {
        sequence.push('cmd');
      }
      if (character) {
        sequence.push(character);
      }
      return sequence.join('-');
    };

    return ModifierStateHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL21vZGlmaWVyLXN0YXRlLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSw4QkFBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUxYLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0o7QUFBQTs7O09BQUE7QUFBQSxRQUFBLHNCQUFBOztBQUFBLG1DQUlBLGNBQUEsR0FDRTtBQUFBLE1BQUEsa0JBQUEsRUFBb0IsQ0FBcEI7QUFBQSxNQUNBLFVBQUEsRUFBWSxDQURaO0FBQUEsTUFFQSxzQkFBQSxFQUF3QixDQUZ4QjtLQUxGLENBQUE7O0FBU0E7QUFBQTs7Ozs7Ozs7T0FUQTs7QUFBQSxtQ0FrQkEsUUFBQSxHQUFVLENBbEJWLENBQUE7O0FBQUEsbUNBbUJBLFNBQUEsR0FBVyxLQW5CWCxDQUFBOztBQUFBLG1DQXFCQSxRQUFBLEdBQVUsS0FyQlYsQ0FBQTs7QUFBQSxtQ0FzQkEsT0FBQSxHQUFTLEtBdEJULENBQUE7O0FBQUEsbUNBdUJBLFFBQUEsR0FBVSxLQXZCVixDQUFBOztBQUFBLG1DQXdCQSxNQUFBLEdBQVEsS0F4QlIsQ0FBQTs7QUFBQSxtQ0F5QkEsTUFBQSxHQUFRLEtBekJSLENBQUE7O0FBMkJBO0FBQUE7Ozs7O09BM0JBOztBQUFBLG1DQWlDQSw4QkFBQSxHQUFnQyxFQWpDaEMsQ0FBQTs7QUFtQ0E7QUFBQTs7O09BbkNBOztBQUFBLElBdUNBLHNCQUFBLEdBQXlCLFFBdkN6QixDQUFBOztBQXlDQTtBQUFBOzs7T0F6Q0E7O0FBQUEsbUNBNkNBLGFBQUEsR0FBZSxJQTdDZixDQUFBOztBQStDQTtBQUFBOzs7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

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/modifier-state-handler.coffee
