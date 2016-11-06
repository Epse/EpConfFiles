(function() {
  var OutputPanelItemElement, OutputPanelItemView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  OutputPanelItemView = (function(_super) {
    __extends(OutputPanelItemView, _super);

    function OutputPanelItemView() {
      return OutputPanelItemView.__super__.constructor.apply(this, arguments);
    }

    OutputPanelItemView.prototype.setModel = function(model) {
      var MessageObject;
      this.model = model;
      this.innerHTML = '';
      if ((this.model.uri != null) && (this.model.position != null)) {
        this.appendChild(this.position = document.createElement('ide-haskell-item-position'));
        this.position.innerText = "" + this.model.uri + ": " + (this.model.position.row + 1) + ", " + (this.model.position.column + 1);
      }
      this.appendChild(this.description = document.createElement('ide-haskell-item-description'));
      MessageObject = require('../../message-object.coffee');
      MessageObject.fromObject(this.model.message).paste(this.description);
      return this;
    };

    OutputPanelItemView.prototype.attachedCallback = function() {
      var SubAtom;
      SubAtom = require('sub-atom');
      this.disposables = new SubAtom;
      if (this.position != null) {
        return this.disposables.add(this.position, 'click', (function(_this) {
          return function() {
            return atom.workspace.open(_this.model.uri).then(function(editor) {
              return editor.setCursorBufferPosition(_this.model.position);
            });
          };
        })(this));
      }
    };

    OutputPanelItemView.prototype.destroy = function() {
      this.remove();
      this.disposables.dispose();
      return this.disposables = null;
    };

    return OutputPanelItemView;

  })(HTMLElement);

  OutputPanelItemElement = document.registerElement('ide-haskell-panel-item', {
    prototype: OutputPanelItemView.prototype
  });

  module.exports = OutputPanelItemElement;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3Mvb3V0cHV0LXBhbmVsLWl0ZW0uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxrQ0FBQSxRQUFBLEdBQVUsU0FBRSxLQUFGLEdBQUE7QUFDUixVQUFBLGFBQUE7QUFBQSxNQURTLElBQUMsQ0FBQSxRQUFBLEtBQ1YsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBQUE7QUFDQSxNQUFBLElBQUcsd0JBQUEsSUFBZ0IsNkJBQW5CO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsMkJBQXZCLENBQXpCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLEdBQXNCLEVBQUEsR0FBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVYsR0FBYyxJQUFkLEdBQWlCLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBaEIsR0FBc0IsQ0FBdkIsQ0FBakIsR0FBMEMsSUFBMUMsR0FBNkMsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFoQixHQUF5QixDQUExQixDQURuRSxDQURGO09BREE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLFdBQUQsR0FBZSxRQUFRLENBQUMsYUFBVCxDQUF1Qiw4QkFBdkIsQ0FBNUIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSw2QkFBUixDQUxoQixDQUFBO0FBQUEsTUFNQSxhQUFhLENBQUMsVUFBZCxDQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQWhDLENBQXdDLENBQUMsS0FBekMsQ0FBK0MsSUFBQyxDQUFBLFdBQWhELENBTkEsQ0FBQTthQU9BLEtBUlE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBVUEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsT0FEZixDQUFBO0FBRUEsTUFBQSxJQUFHLHFCQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFsQixFQUE0QixPQUE1QixFQUFxQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBM0IsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxTQUFDLE1BQUQsR0FBQTtxQkFDbkMsTUFBTSxDQUFDLHVCQUFQLENBQStCLEtBQUMsQ0FBQSxLQUFLLENBQUMsUUFBdEMsRUFEbUM7WUFBQSxDQUFyQyxFQURtQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBREY7T0FIZ0I7SUFBQSxDQVZsQixDQUFBOztBQUFBLGtDQWtCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUhSO0lBQUEsQ0FsQlQsQ0FBQTs7K0JBQUE7O0tBRGdDLFlBQWxDLENBQUE7O0FBQUEsRUF5QkEsc0JBQUEsR0FDRSxRQUFRLENBQUMsZUFBVCxDQUF5Qix3QkFBekIsRUFDRTtBQUFBLElBQUEsU0FBQSxFQUFXLG1CQUFtQixDQUFDLFNBQS9CO0dBREYsQ0ExQkYsQ0FBQTs7QUFBQSxFQTZCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixzQkE3QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-item.coffee
