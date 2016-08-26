(function() {
  var Emitter, OutputPanelButtons, OutputPanelButtonsElement, SubAtom,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Emitter = require('atom').Emitter;

  SubAtom = require('sub-atom');

  module.exports = OutputPanelButtons = (function(_super) {
    __extends(OutputPanelButtons, _super);

    function OutputPanelButtons() {
      return OutputPanelButtons.__super__.constructor.apply(this, arguments);
    }

    OutputPanelButtons.prototype.createdCallback = function() {
      this.disposables = new SubAtom;
      this.disposables.add(this.emitter = new Emitter);
      this.buttons = {};
      this.appendChild(this.buttonsContainer = document.createElement('ide-haskell-buttons-container'));
      ['error', 'warning', 'lint'].forEach((function(_this) {
        return function(btn) {
          return _this.createButton(btn);
        };
      })(this));
      this.createButton('build', {
        uriFilter: false,
        autoScroll: true
      });
      this.appendChild(this.cbCurrentFile = document.createElement('ide-haskell-checkbox'));
      return this.disposables.add(this.cbCurrentFile, 'click', (function(_this) {
        return function() {
          return _this.toggleFileFilter();
        };
      })(this));
    };

    OutputPanelButtons.prototype.createButton = function(btn, opts) {
      this.buttons[btn] = {
        element: null,
        options: opts != null ? opts : {}
      };
      this.buttonsContainer.appendChild(this.buttons[btn].element = document.createElement('ide-haskell-button'));
      this.buttons[btn].element.setAttribute('data-caption', btn);
      this.buttons[btn].element.setAttribute('data-count', 0);
      return this.disposables.add(this.buttons[btn].element, 'click', (function(_this) {
        return function() {
          return _this.clickButton(btn);
        };
      })(this));
    };

    OutputPanelButtons.prototype.options = function(btn) {
      var opts;
      opts = this.buttons[btn] != null ? this.buttons[btn].options : {};
      if (opts['uriFilter'] == null) {
        opts['uriFilter'] = true;
      }
      if (opts['autoScroll'] == null) {
        opts['autoScroll'] = false;
      }
      return opts;
    };

    OutputPanelButtons.prototype.onButtonClicked = function(callback) {
      return this.emitter.on('button-clicked', callback);
    };

    OutputPanelButtons.prototype.onCheckboxSwitched = function(callback) {
      return this.emitter.on('checkbox-switched', callback);
    };

    OutputPanelButtons.prototype.buttonNames = function() {
      return Object.keys(this.buttons);
    };

    OutputPanelButtons.prototype.clickButton = function(btn) {
      var v, _i, _len, _ref;
      if (this.buttons[btn] != null) {
        _ref = this.getElementsByClassName('active');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          v.classList.remove('active');
        }
        this.buttons[btn].element.classList.add('active');
        return this.emitter.emit('button-clicked', btn);
      }
    };

    OutputPanelButtons.prototype.setFileFilter = function(state) {
      if (state) {
        this.cbCurrentFile.classList.add('enabled');
        return this.emitter.emit('checkbox-switched', true);
      } else {
        this.cbCurrentFile.classList.remove('enabled');
        return this.emitter.emit('checkbox-switched', false);
      }
    };

    OutputPanelButtons.prototype.getFileFilter = function() {
      return this.cbCurrentFile.classList.contains('enabled');
    };

    OutputPanelButtons.prototype.toggleFileFilter = function() {
      return this.setFileFilter(!this.getFileFilter());
    };

    OutputPanelButtons.prototype.setCount = function(btn, count) {
      if (this.buttons[btn] != null) {
        return this.buttons[btn].element.setAttribute('data-count', count);
      }
    };

    OutputPanelButtons.prototype.destroy = function() {
      this.remove();
      return this.disposables.dispose();
    };

    OutputPanelButtons.prototype.getActive = function() {
      var _ref;
      return (_ref = this.getElementsByClassName('active')[0]) != null ? typeof _ref.getAttribute === "function" ? _ref.getAttribute('data-caption') : void 0 : void 0;
    };

    return OutputPanelButtons;

  })(HTMLElement);

  OutputPanelButtonsElement = document.registerElement('ide-haskell-panel-buttons', {
    prototype: OutputPanelButtons.prototype
  });

  module.exports = OutputPanelButtonsElement;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvb3V0cHV0LXBhbmVsL3ZpZXdzL291dHB1dC1wYW5lbC1idXR0b25zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQURWLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxPQUFmLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUE1QixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFGWCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixRQUFRLENBQUMsYUFBVCxDQUF1QiwrQkFBdkIsQ0FBakMsQ0FIQSxDQUFBO0FBQUEsTUFJQSxDQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXFCLE1BQXJCLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsR0FBRCxHQUFBO2lCQUNuQyxLQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFEbUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxDQUpBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxZQUFE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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-buttons.coffee
