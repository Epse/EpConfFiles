(function() {
  module.exports = function(colorPicker) {
    return {
      element: null,
      pointer: null,
      activate: function() {
        var hasChild, _isClicking;
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-definition");
            return _el;
          })(),
          height: function() {
            return this.el.offsetHeight;
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          },
          setColor: function(smartColor) {
            return this.el.style.backgroundColor = smartColor.toRGBA();
          }
        };
        colorPicker.element.add(this.element.el);
        setTimeout((function(_this) {
          return function() {
            var $colorPicker, Arrow;
            Arrow = colorPicker.getExtension('Arrow');
            $colorPicker = colorPicker.element;
            colorPicker.onInputVariable(function() {
              var onClose, _newHeight, _oldHeight;
              _oldHeight = $colorPicker.height();
              $colorPicker.addClass('view--definition');
              _newHeight = _this.element.height() + Arrow.element.height();
              $colorPicker.setHeight(_newHeight);
              _this.element.setColor(colorPicker.SmartColor.RGBAArray([0, 0, 0, 0]));
              onClose = function() {
                var onTransitionEnd;
                colorPicker.canOpen = false;
                onTransitionEnd = function() {
                  $colorPicker.setHeight(_oldHeight);
                  $colorPicker.el.removeEventListener('transitionend', onTransitionEnd);
                  $colorPicker.removeClass('view--definition');
                  return colorPicker.canOpen = true;
                };
                $colorPicker.el.addEventListener('transitionend', onTransitionEnd);
                return colorPicker.Emitter.off('close', onClose);
              };
              return colorPicker.onClose(onClose);
            });
            colorPicker.onInputColor(function() {
              return $colorPicker.removeClass('view--definition');
            });
          };
        })(this));
        colorPicker.onInputVariableColor((function(_this) {
          return function(smartColor) {
            if (!smartColor) {
              return;
            }
            return _this.element.setColor(smartColor);
          };
        })(this));
        colorPicker.onInputVariableColor((function(_this) {
          return function() {
            var pointer;
            pointer = arguments[arguments.length - 1];
            return _this.pointer = pointer;
          };
        })(this));
        hasChild = function(element, child) {
          var _parent;
          if (child && (_parent = child.parentNode)) {
            if (child === element) {
              return true;
            } else {
              return hasChild(element, _parent);
            }
          }
          return false;
        };
        _isClicking = false;
        colorPicker.onMouseDown((function(_this) {
          return function(e, isOnPicker) {
            if (!(isOnPicker && hasChild(_this.element.el, e.target))) {
              return;
            }
            e.preventDefault();
            return _isClicking = true;
          };
        })(this));
        colorPicker.onMouseMove(function(e) {
          return _isClicking = false;
        });
        colorPicker.onMouseUp((function(_this) {
          return function(e) {
            if (!(_isClicking && _this.pointer)) {
              return;
            }
            atom.workspace.open(_this.pointer.filePath).then(function() {
              var Editor;
              Editor = atom.workspace.getActiveTextEditor();
              Editor.clearSelections();
              Editor.setSelectedBufferRange(_this.pointer.range);
              Editor.scrollToCursorPosition();
              return colorPicker.close();
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var _definition;
            _definition = document.createElement('p');
            _definition.classList.add("" + _this.element.el.className + "-definition");
            colorPicker.onInputVariable(function() {
              return _definition.innerText = '';
            });
            colorPicker.onInputVariableColor(function(color) {
              if (color) {
                return _definition.innerText = color.value;
              } else {
                return _definition.innerText = 'No color found.';
              }
            });
            return _this.element.add(_definition);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var _variable;
            _variable = document.createElement('p');
            _variable.classList.add("" + _this.element.el.className + "-variable");
            colorPicker.onInputVariable(function(match) {
              return _variable.innerText = match.match;
            });
            return _this.element.add(_variable);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9jb2xvci1waWNrZXIvbGliL2V4dGVuc2lvbnMvRGVmaW5pdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFLSTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFELEdBQUE7V0FDYjtBQUFBLE1BQUEsT0FBQSxFQUFTLElBQVQ7QUFBQSxNQUNBLE9BQUEsRUFBUyxJQURUO0FBQUEsTUFNQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ04sWUFBQSxxQkFBQTtBQUFBLFFBQUEsSUFBQyxDQUFBLE9BQUQsR0FDSTtBQUFBLFVBQUEsRUFBQSxFQUFPLENBQUEsU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsaUJBQUE7QUFBQSxZQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUF0QyxDQUFBO0FBQUEsWUFDQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FETixDQUFBO0FBQUEsWUFFQSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsRUFBQSxHQUFyQyxZQUFxQyxHQUFrQixhQUFwQyxDQUZBLENBQUE7QUFJQSxtQkFBTyxHQUFQLENBTEc7VUFBQSxDQUFBLENBQUgsQ0FBQSxDQUFKO0FBQUEsVUFPQSxNQUFBLEVBQVEsU0FBQSxHQUFBO21CQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsYUFBUDtVQUFBLENBUFI7QUFBQSxVQVVBLEdBQUEsRUFBSyxTQUFDLE9BQUQsR0FBQTtBQUNELFlBQUEsSUFBQyxDQUFBLEVBQUUsQ0FBQyxXQUFKLENBQWdCLE9BQWhCLENBQUEsQ0FBQTtBQUNBLG1CQUFPLElBQVAsQ0FGQztVQUFBLENBVkw7QUFBQSxVQWVBLFFBQUEsRUFBVSxTQUFDLFVBQUQsR0FBQTttQkFDTixJQUFDLENB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

//# sourceURL=/home/epse/.atom/packages/color-picker/lib/extensions/Definition.coffee
