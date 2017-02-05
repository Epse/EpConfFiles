(function() {
  var AbstractProvider, FunctionProvider, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.function-call';

    FunctionProvider.prototype.clickEventSelectors = '.function-call';

    FunctionProvider.prototype.gotoRegex = /^(\w+\()+/;


    /**
     * Goto the class from the term given.
     *
     * @param {TextEditor} editor  TextEditor to search for namespace of term.
     * @param {string}     term    Term to search for.
     */

    FunctionProvider.prototype.gotoFromWord = function(editor, term) {
      var bufferPosition, calledClass, currentClass, value;
      bufferPosition = editor.getCursorBufferPosition();
      calledClass = this.parser.getCalledClass(editor, term, bufferPosition);
      if (!calledClass) {
        return;
      }
      currentClass = this.parser.getFullClassName(editor);
      if (currentClass === calledClass && this.jumpTo(editor, term)) {
        this.manager.addBackTrack(editor.getPath(), bufferPosition);
        return;
      }
      value = this.parser.getMemberContext(editor, term, bufferPosition, calledClass);
      if (!value) {
        return;
      }
      atom.workspace.open(value.declaringStructure.filename, {
        initialLine: value.startLine - 1,
        searchAllPanes: true
      });
      return this.manager.addBackTrack(editor.getPath(), bufferPosition);
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    FunctionProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("function +" + term + "( +|\\()", "i");
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzsrQkFDckIsbUJBQUEsR0FBcUI7OytCQUNyQixTQUFBLEdBQVc7OztBQUVYOzs7Ozs7OytCQU1BLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ1YsVUFBQTtNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLHVCQUFQLENBQUE7TUFFakIsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQixJQUEvQixFQUFxQyxjQUFyQztNQUVkLElBQUcsQ0FBSSxXQUFQO0FBQ0ksZUFESjs7TUFHQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QjtNQUVmLElBQUcsWUFBQSxLQUFnQixXQUFoQixJQUErQixJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsSUFBaEIsQ0FBbEM7UUFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF0QixFQUF3QyxjQUF4QztBQUNBLGVBRko7O01BSUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsRUFBdUQsV0FBdkQ7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUE3QyxFQUF1RDtRQUNuRCxXQUFBLEVBQWtCLEtBQUssQ0FBQyxTQUFOLEdBQWtCLENBRGU7UUFFbkQsY0FBQSxFQUFpQixJQUZrQztPQUF2RDthQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQXRCLEVBQXdDLGNBQXhDO0lBeEJVOzs7QUEwQmQ7Ozs7Ozs7OytCQU9BLGNBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osYUFBTyxNQUFBLENBQUEsWUFBQSxHQUFnQixJQUFoQixHQUFxQixVQUFyQixFQUFnQyxHQUFoQztJQURLOzs7O0tBNUNXO0FBTi9CIiwic291cmNlc0NvbnRlbnQiOlsie1RleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgRnVuY3Rpb25Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnLmZ1bmN0aW9uLWNhbGwnXG4gICAgY2xpY2tFdmVudFNlbGVjdG9yczogJy5mdW5jdGlvbi1jYWxsJ1xuICAgIGdvdG9SZWdleDogL14oXFx3K1xcKCkrL1xuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gdGhlIGNsYXNzIGZyb20gdGhlIHRlcm0gZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciAgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgdGVybSAgICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgIyMjXG4gICAgZ290b0Zyb21Xb3JkOiAoZWRpdG9yLCB0ZXJtKSAtPlxuICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgICAgY2FsbGVkQ2xhc3MgPSBAcGFyc2VyLmdldENhbGxlZENsYXNzKGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24pXG5cbiAgICAgICAgaWYgbm90IGNhbGxlZENsYXNzXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBjdXJyZW50Q2xhc3MgPSBAcGFyc2VyLmdldEZ1bGxDbGFzc05hbWUoZWRpdG9yKVxuXG4gICAgICAgIGlmIGN1cnJlbnRDbGFzcyA9PSBjYWxsZWRDbGFzcyAmJiBAanVtcFRvKGVkaXRvciwgdGVybSlcbiAgICAgICAgICAgIEBtYW5hZ2VyLmFkZEJhY2tUcmFjayhlZGl0b3IuZ2V0UGF0aCgpLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhbHVlID0gQHBhcnNlci5nZXRNZW1iZXJDb250ZXh0KGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24sIGNhbGxlZENsYXNzKVxuXG4gICAgICAgIGlmIG5vdCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih2YWx1ZS5kZWNsYXJpbmdTdHJ1Y3R1cmUuZmlsZW5hbWUsIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lICAgIDogKHZhbHVlLnN0YXJ0TGluZSAtIDEpLFxuICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXMgOiB0cnVlXG4gICAgICAgIH0pXG5cbiAgICAgICAgQG1hbmFnZXIuYWRkQmFja1RyYWNrKGVkaXRvci5nZXRQYXRoKCksIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHJlZ2V4IHVzZWQgd2hlbiBsb29raW5nIGZvciBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXJtIFRlcm0gYmVpbmcgc2VhcmNoLlxuICAgICAqXG4gICAgICogQHJldHVybiB7cmVnZXh9IFJlZ2V4IHRvIGJlIHVzZWQuXG4gICAgIyMjXG4gICAgZ2V0SnVtcFRvUmVnZXg6ICh0ZXJtKSAtPlxuICAgICAgICByZXR1cm4gLy8vZnVuY3Rpb25cXCArI3t0ZXJtfShcXCArfFxcKCkvLy9pXG4iXX0=
