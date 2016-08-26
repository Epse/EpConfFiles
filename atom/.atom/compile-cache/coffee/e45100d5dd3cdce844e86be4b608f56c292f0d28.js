(function() {
  var MessageObject, OutputPanelItemElement, OutputPanelItemView, SubAtom,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SubAtom = require('sub-atom');

  MessageObject = require('../../message-object.coffee');

  OutputPanelItemView = (function(_super) {
    __extends(OutputPanelItemView, _super);

    function OutputPanelItemView() {
      return OutputPanelItemView.__super__.constructor.apply(this, arguments);
    }

    OutputPanelItemView.prototype.setModel = function(model) {
      this.model = model;
      this.innerHTML = '';
      if ((this.model.uri != null) && (this.model.position != null)) {
        this.appendChild(this.position = document.createElement('ide-haskell-item-position'));
        this.position.innerText = "" + this.model.uri + ": " + (this.model.position.row + 1) + ", " + (this.model.position.column + 1);
      }
      this.appendChild(this.description = document.createElement('ide-haskell-item-description'));
      MessageObject.fromObject(this.model.message).paste(this.description);
      return this;
    };

    OutputPanelItemView.prototype.attachedCallback = function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvb3V0cHV0LXBhbmVsL3ZpZXdzL291dHB1dC1wYW5lbC1pdGVtLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDZCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFHTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxrQ0FBQSxRQUFBLEdBQVUsU0FBRSxLQUFGLEdBQUE7QUFDUixNQURTLElBQUMsQ0FBQSxRQUFBLEtBQ1YsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBQUE7QUFDQSxNQUFBLElBQUcsd0JBQUEsSUFBZ0IsNkJBQW5CO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsMkJBQXZCLENBQXpCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLEdBQXNCLEVBQUEsR0FBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVYsR0FBYyxJQUFkLEdBQWlCLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBaEIsR0FBc0IsQ0FBdkIsQ0FBakIsR0FBMEMsSUFBMUMsR0FBNkMsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFoQixHQUF5QixDQUExQixDQURuRSxDQURGO09BREE7QUFBQSxNQUlBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLFdBQUQsR0FBZSxRQUFRLENBQUMsYUFBVCxDQUF1Qiw4QkFBdkIsQ0FBNUIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxhQUFhLENBQUMsVUFBZCxDQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQWhDLENBQXdDLENBQUMsS0FBekMsQ0FBK0MsSUFBQyxDQUFBLFdBQWhELENBTEEsQ0FBQTthQU1BLEtBUFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBU0EsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsT0FBZixDQUFBO0FBQ0EsTUFBQSxJQUFHLHFCQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFsQixFQUE0QixPQUE1QixFQUFxQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBM0IsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxTQUFDLE1BQUQsR0FBQTtxQkFDbkMsTUFBTSxDQUFDLHVCQUFQLENBQStCLEtBQUMsQ0FBQSxLQUFLLENBQUMsUUFBdEMsRUFEbUM7WUFBQSxDQUFyQyxFQURtQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBREY7T0FGZ0I7SUFBQSxDQVRsQixDQUFBOztBQUFBLGtDQWdCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUhSO0lBQUEsQ0FoQlQsQ0FBQTs7K0JBQUE7O0tBRGdDLFlBSGxDLENBQUE7O0FBQUEsRUEwQkEsc0JBQUEsR0FDRSxRQUFRLENBQUMsZUFBVCxDQUF5Qix3QkFBekIsRUFDRTtBQUFBLElBQUEsU0FBQSxFQUFXLG1CQUFtQixDQUFDLFNBQS9CO0dBREYsQ0EzQkYsQ0FBQTs7QUFBQSxFQThCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixzQkE5QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/output-panel/views/output-panel-item.coffee
