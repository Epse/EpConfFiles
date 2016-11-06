(function() {
  var MessageObject;

  module.exports = MessageObject = (function() {
    function MessageObject(_arg) {
      this.text = _arg.text, this.highlighter = _arg.highlighter, this.html = _arg.html;
    }

    MessageObject.fromObject = function(message) {
      if (typeof message === 'string') {
        return new MessageObject({
          text: message
        });
      } else if (typeof message === 'object') {
        this.validate(message);
        return new MessageObject(message);
      }
    };

    MessageObject.validate = function(message) {
      if ((message.text != null) && (message.html != null)) {
        throw new Error('Can\'t have both text and html set');
      }
      if ((message.highlighter != null) && (message.text == null)) {
        throw new Error('Must pass text when highlighter is set');
      }
      if ((message.text == null) && (message.html == null)) {
        throw new Error('Neither text nor html is set');
      }
    };

    MessageObject.prototype.toHtml = function() {
      var div, html;
      if ((this.highlighter != null) && (this.text != null)) {
        html = require('./highlight')({
          fileContents: this.text,
          scopeName: this.highlighter,
          registry: atom.grammars
        });
        if (html == null) {
          this.highlighter = null;
          return this.toHtml();
        } else {
          return html;
        }
      } else if (this.html != null) {
        return this.html;
      } else {
        div = document.createElement('div');
        div.innerText = this.text;
        return div.innerHTML;
      }
    };

    MessageObject.prototype.paste = function(element) {
      return element.innerHTML = this.toHtml();
    };

    return MessageObject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9tZXNzYWdlLW9iamVjdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHVCQUFDLElBQUQsR0FBQTtBQUFnQyxNQUE5QixJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxtQkFBQSxhQUFhLElBQUMsQ0FBQSxZQUFBLElBQVEsQ0FBaEM7SUFBQSxDQUFiOztBQUFBLElBRUEsYUFBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLE9BQUQsR0FBQTtBQUNYLE1BQUEsSUFBRyxNQUFBLENBQUEsT0FBQSxLQUFtQixRQUF0QjtBQUNFLGVBQVcsSUFBQSxhQUFBLENBQ1Q7QUFBQSxVQUFBLElBQUEsRUFBTSxPQUFOO1NBRFMsQ0FBWCxDQURGO09BQUEsTUFHSyxJQUFHLE1BQUEsQ0FBQSxPQUFBLEtBQW1CLFFBQXRCO0FBQ0gsUUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsQ0FBQSxDQUFBO0FBQ0EsZUFBVyxJQUFBLGFBQUEsQ0FBYyxPQUFkLENBQVgsQ0FGRztPQUpNO0lBQUEsQ0FGYixDQUFBOztBQUFBLElBVUEsYUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLE9BQUQsR0FBQTtBQUNULE1BQUEsSUFBRyxzQkFBQSxJQUFrQixzQkFBckI7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLG9DQUFOLENBQVYsQ0FERjtPQUFBO0FBRUEsTUFBQSxJQUFHLDZCQUFBLElBQTZCLHNCQUFoQztBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sd0NBQU4sQ0FBVixDQURGO09BRkE7QUFJQSxNQUFBLElBQU8sc0JBQUosSUFBMEIsc0JBQTdCO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSw4QkFBTixDQUFWLENBREY7T0FMUztJQUFBLENBVlgsQ0FBQTs7QUFBQSw0QkFrQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsU0FBQTtBQUFBLE1BQUEsSUFBRywwQkFBQSxJQUFrQixtQkFBckI7QUFDRSxRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFBLENBQ0w7QUFBQSxVQUFBLFlBQUEsRUFBYyxJQUFDLENBQUEsSUFBZjtBQUFBLFVBQ0EsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQURaO0FBQUEsVUFFQSxRQUFBLEVBQVUsSUFBSSxDQUFDLFFBRmY7U0FESyxDQUFQLENBQUE7QUFJQSxRQUFBLElBQU8sWUFBUDtBQUNFLFVBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFmLENBQUE7aUJBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUZGO1NBQUEsTUFBQTtpQkFJRSxLQUpGO1NBTEY7T0FBQSxNQVVLLElBQUcsaUJBQUg7QUFDSCxlQUFPLElBQUMsQ0FBQSxJQUFSLENBREc7T0FBQSxNQUFBO0FBR0gsUUFBQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBTixDQUFBO0FBQUEsUUFDQSxHQUFHLENBQUMsU0FBSixHQUFnQixJQUFDLENBQUEsSUFEakIsQ0FBQTtBQUVBLGVBQU8sR0FBRyxDQUFDLFNBQVgsQ0FMRztPQVhDO0lBQUEsQ0FsQlIsQ0FBQTs7QUFBQSw0QkFvQ0EsS0FBQSxHQUFPLFNBQUMsT0FBRCxHQUFBO2FBQ0wsT0FBTyxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURmO0lBQUEsQ0FwQ1AsQ0FBQTs7eUJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/message-object.coffee
