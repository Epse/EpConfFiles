(function() {
  var OutputPanelButtons, OutputPanelButtonsElement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = OutputPanelButtons = (function(_super) {
    __extends(OutputPanelButtons, _super);

    function OutputPanelButtons() {
      return OutputPanelButtons.__super__.constructor.apply(this, arguments);
    }

    OutputPanelButtons.prototype.createdCallback = function() {
      var Emitter, SubAtom;
      Emitter = require('atom').Emitter;
      SubAtom = require('sub-atom');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3Mvb3V0cHV0LXBhbmVsLWJ1dHRvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxnQkFBQTtBQUFBLE1BQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBRFYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsT0FGZixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBNUIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBSlgsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsK0JBQXZCLENBQWpDLENBTEEsQ0FBQTtBQUFBLE1BTUEsQ0FBQyxPQUFELEVBQVUsU0FBVixFQUFxQixNQUFyQixDQUE0QixDQUFDLE9BQTdCLENBQXFDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtpQkFDbkMsS0FBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBRG1DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckMsQ0FO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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-buttons.coffee
