(function() {
  var AbstractProvider, SubAtom, TextEditor;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.allMarkers = [];

    AbstractProvider.prototype.hoverEventSelectors = '';

    AbstractProvider.prototype.clickEventSelectors = '';

    AbstractProvider.prototype.manager = {};

    AbstractProvider.prototype.gotoRegex = '';

    AbstractProvider.prototype.jumpWord = '';


    /**
     * Initialisation of Gotos
     *
     * @param {GotoManager} manager The manager that stores this goto. Used mainly for backtrack registering.
     */

    AbstractProvider.prototype.init = function(manager) {
      this.subAtom = new SubAtom;
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.fuzzaldrin = require('fuzzaldrin');
      this.manager = manager;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescanMarkers(editor);
          });
          _this.registerMarkers(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(paneItem) {
          if (paneItem instanceof TextEditor && _this.jumpWord !== '' && _this.jumpWord !== void 0) {
            _this.jumpTo(paneItem, _this.jumpWord);
            return _this.jumpWord = '';
          }
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var i, len, paneItem, panes, ref, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref = panes[0].items;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              paneItem = ref[i];
              if (paneItem instanceof TextEditor) {
                results.push(_this.registerEvents(paneItem));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var i, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (i = 0, len = panes.length; i < len; i++) {
            pane = panes[i];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var j, len1, ref, results1;
              ref = pane.items;
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                paneItem = ref[j];
                if (paneItem instanceof TextEditor) {
                  results1.push(this.registerEvents(paneItem));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    };


    /**
     * Deactives the goto feature.
     */

    AbstractProvider.prototype.deactivate = function() {
      var allMarkers;
      this.subAtom.dispose();
      return allMarkers = [];
    };


    /**
     * Goto from the current cursor position in the editor.
     *
     * @param {TextEditor} editor TextEditor to pull term from.
     */

    AbstractProvider.prototype.gotoFromEditor = function(editor) {
      var position, term, termParts;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        position = editor.getCursorBufferPosition();
        term = this.parser.getFullWordFromBufferPosition(editor, position);
        termParts = term.split(/(?:\-\>|::)/);
        term = termParts.pop().replace('(', '');
        return this.gotoFromWord(editor, term);
      }
    };


    /**
     * Goto from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    AbstractProvider.prototype.gotoFromWord = function(editor, term) {};


    /**
     * Registers the mouse events for alt-click.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mousemove', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!event.altKey) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '1px solid ' + _this.$(selector).css('color'));
            _this.$(selector).css('cursor', 'pointer');
            return _this.isHovering = true;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!_this.isHovering) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '');
            _this.$(selector).css('cursor', '');
            return _this.isHovering = false;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'click', this.clickEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            selector = _this.getSelectorFromEvent(event);
            if (selector === null || event.altKey === false) {
              return;
            }
            if (event.handled !== true) {
              _this.gotoFromWord(editor, _this.$(selector).text());
              return event.handled = true;
            }
          };
        })(this));
        return editor.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            var allKey, allMarker, key, marker, markerProperties, markers, results;
            if (!_this.isHovering) {
              return;
            }
            markerProperties = {
              containsBufferPosition: event.newBufferPosition
            };
            markers = event.cursor.editor.findMarkers(markerProperties);
            results = [];
            for (key in markers) {
              marker = markers[key];
              results.push((function() {
                var ref, results1;
                ref = this.allMarkers[editor.getLongTitle()];
                results1 = [];
                for (allKey in ref) {
                  allMarker = ref[allKey];
                  if (marker.id === allMarker.id) {
                    this.gotoFromWord(event.cursor.editor, marker.getProperties().term);
                    break;
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              }).call(_this));
            }
            return results;
          };
        })(this));
      }
    };


    /**
     * Register any markers that you need.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerMarkers = function(editor) {};


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.cleanMarkers = function(editor) {};


    /**
     * Rescans the editor, updating all markers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescanMarkers = function(editor) {
      this.cleanMarkers(editor);
      return this.registerMarkers(editor);
    };


    /**
     * Gets the correct selector when a selector is clicked.
     *
     * @param  {jQuery.Event} event A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Returns whether this goto is able to jump using the term.
     *
     * @param  {string} term Term to check.
     *
     * @return {boolean} Whether a jump is possible.
     */

    AbstractProvider.prototype.canGoto = function(term) {
      var ref;
      return ((ref = term.match(this.gotoRegex)) != null ? ref.length : void 0) > 0;
    };


    /**
     * Gets the regex used when looking for a word within the editor.
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    AbstractProvider.prototype.getJumpToRegex = function(term) {};


    /**
     * Jumps to a word within the editor
     * @param  {TextEditor} editor The editor that has the function in.
     * @param  {string} word       The word to find and then jump to.
     * @return {boolean}           Whether the finding was successful.
     */

    AbstractProvider.prototype.jumpTo = function(editor, word) {
      var bufferPosition;
      bufferPosition = this.parser.findBufferPositionOfWord(editor, word, this.getJumpToRegex(word));
      if (bufferPosition === null) {
        return false;
      }
      return setTimeout(function() {
        editor.setCursorBufferPosition(bufferPosition, {
          autoscroll: false
        });
        return editor.scrollToScreenPosition(editor.screenPositionForBufferPosition(bufferPosition), {
          center: true
        });
      }, 100);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBRU07OzsrQkFDRixVQUFBLEdBQVk7OytCQUNaLG1CQUFBLEdBQXFCOzsrQkFDckIsbUJBQUEsR0FBcUI7OytCQUNyQixPQUFBLEdBQVM7OytCQUNULFNBQUEsR0FBVzs7K0JBQ1gsUUFBQSxHQUFVOzs7QUFFVjs7Ozs7OytCQUtBLElBQUEsR0FBTSxTQUFDLE9BQUQ7TUFDRixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFDLENBQUEsQ0FBRCxHQUFLLE9BQUEsQ0FBUSxRQUFSO01BQ0wsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsNkJBQVI7TUFDVixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQUEsQ0FBUSxZQUFSO01BRWQsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUVYLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDOUIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsU0FBQyxLQUFEO21CQUNiLEtBQUMsQ0FBQSxhQUFELENBQWUsTUFBZjtVQURhLENBQWpCO1VBR0EsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakI7aUJBQ0EsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEI7UUFMOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO01BT0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFB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LEdBQUE7OztBQUVqQjs7Ozs7OytCQUtBLFlBQUEsR0FBYyxTQUFDLE1BQUQsR0FBQTs7O0FBRWQ7Ozs7OzsrQkFLQSxhQUFBLEdBQWUsU0FBQyxNQUFEO01BQ1gsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakI7SUFGVzs7O0FBSWY7Ozs7Ozs7OytCQU9BLG9CQUFBLEdBQXNCLFNBQUMsS0FBRDtBQUNsQixhQUFPLEtBQUssQ0FBQztJQURLOzs7QUFHdEI7Ozs7Ozs7OytCQU9BLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDTCxVQUFBO0FBQUEsOERBQTZCLENBQUUsZ0JBQXhCLEdBQWlDO0lBRG5DOzs7QUFHVDs7Ozs7Ozs7K0JBT0EsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTs7O0FBRWhCOzs7Ozs7OytCQU1BLE1BQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ0osVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx3QkFBUixDQUFpQyxNQUFqQyxFQUF5QyxJQUF6QyxFQUErQyxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFoQixDQUEvQztNQUVqQixJQUFHLGNBQUEsS0FBa0IsSUFBckI7QUFDSSxlQUFPLE1BRFg7O2FBSUEsVUFBQSxDQUFXLFNBQUE7UUFDUCxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsY0FBL0IsRUFBK0M7VUFDM0MsVUFBQSxFQUFZLEtBRCtCO1NBQS9DO2VBS0EsTUFBTSxDQUFDLHNCQUFQLENBQThCLE1BQU0sQ0FBQywrQkFBUCxDQUF1QyxjQUF2QyxDQUE5QixFQUFzRjtVQUNsRixNQUFBLEVBQVEsSUFEMEU7U0FBdEY7TUFOTyxDQUFYLEVBU0UsR0FURjtJQVBJOzs7OztBQWhOWiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yfSA9IHJlcXVpcmUgJ2F0b20nXG5cblN1YkF0b20gPSByZXF1aXJlICdzdWItYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgYWxsTWFya2VyczogW11cbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnJ1xuICAgIGNsaWNrRXZlbnRTZWxlY3RvcnM6ICcnXG4gICAgbWFuYWdlcjoge31cbiAgICBnb3RvUmVnZXg6ICcnXG4gICAganVtcFdvcmQ6ICcnXG5cbiAgICAjIyMqXG4gICAgICogSW5pdGlhbGlzYXRpb24gb2YgR290b3NcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7R290b01hbmFnZXJ9IG1hbmFnZXIgVGhlIG1hbmFnZXIgdGhhdCBzdG9yZXMgdGhpcyBnb3RvLiBVc2VkIG1haW5seSBmb3IgYmFja3RyYWNrIHJlZ2lzdGVyaW5nLlxuICAgICMjI1xuICAgIGluaXQ6IChtYW5hZ2VyKSAtPlxuICAgICAgICBAc3ViQXRvbSA9IG5ldyBTdWJBdG9tXG5cbiAgICAgICAgQCQgPSByZXF1aXJlICdqcXVlcnknXG4gICAgICAgIEBwYXJzZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXInXG4gICAgICAgIEBmdXp6YWxkcmluID0gcmVxdWlyZSAnZnV6emFsZHJpbidcblxuICAgICAgICBAbWFuYWdlciA9IG1hbmFnZXJcblxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZFNhdmUgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIEByZXNjYW5NYXJrZXJzKGVkaXRvcilcblxuICAgICAgICAgICAgQHJlZ2lzdGVyTWFya2VycyBlZGl0b3JcbiAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBlZGl0b3JcblxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChwYW5lSXRlbSkgPT5cbiAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvciAmJiBAanVtcFdvcmQgIT0gJycgJiYgQGp1bXBXb3JkICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIEBqdW1wVG8ocGFuZUl0ZW0sIEBqdW1wV29yZClcbiAgICAgICAgICAgICAgICBAanVtcFdvcmQgPSAnJ1xuXG4gICAgICAgICMgV2hlbiB5b3UgZ28gYmFjayB0byBvbmx5IGhhdmUgMSBwYW5lIHRoZSBldmVudHMgYXJlIGxvc3QsIHNvIG5lZWQgdG8gcmUtcmVnaXN0ZXIuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmUgKHBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgaWYgcGFuZXMubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZXNbMF0uaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICAgICAjIEhhdmluZyB0byByZS1yZWdpc3RlciBldmVudHMgYXMgd2hlbiBhIG5ldyBwYW5lIGlzIGNyZWF0ZWQgdGhlIG9sZCBwYW5lcyBsb3NlIHRoZSBldmVudHMuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQWRkUGFuZSAob2JzZXJ2ZWRQYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGZvciBwYW5lIGluIHBhbmVzXG4gICAgICAgICAgICAgICAgaWYgcGFuZSA9PSBvYnNlcnZlZFBhbmVcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmVzIHRoZSBnb3RvIGZlYXR1cmUuXG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgQHN1YkF0b20uZGlzcG9zZSgpXG4gICAgICAgIGFsbE1hcmtlcnMgPSBbXVxuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gZnJvbSB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb24gaW4gdGhlIGVkaXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcHVsbCB0ZXJtIGZyb20uXG4gICAgIyMjXG4gICAgZ290b0Zyb21FZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLm1hdGNoIC90ZXh0Lmh0bWwucGhwJC9cbiAgICAgICAgICAgIHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIHRlcm0gPSBAcGFyc2VyLmdldEZ1bGxXb3JkRnJvbUJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24pXG5cbiAgICAgICAgICAgIHRlcm1QYXJ0cyA9IHRlcm0uc3BsaXQoLyg/OlxcLVxcPnw6OikvKVxuICAgICAgICAgICAgdGVybSA9IHRlcm1QYXJ0cy5wb3AoKS5yZXBsYWNlKCcoJywgJycpXG5cbiAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZWRpdG9yLCB0ZXJtKVxuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gZnJvbSB0aGUgdGVybSBnaXZlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgICAgdGVybSAgIFRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAjIyNcbiAgICBnb3RvRnJvbVdvcmQ6IChlZGl0b3IsIHRlcm0pIC0+XG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBtb3VzZSBldmVudHMgZm9yIGFsdC1jbGljay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcmVnaXN0ZXIgZXZlbnRzIHRvLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyRXZlbnRzOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICBzY3JvbGxWaWV3RWxlbWVudCA9IEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcuc2Nyb2xsLXZpZXcnKVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW1vdmUnLCBAaG92ZXJFdmVudFNlbGVjdG9ycywgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgZXZlbnQuYWx0S2V5XG5cbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IEBnZXRTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0b3JcblxuICAgICAgICAgICAgICAgIEAkKHNlbGVjdG9yKS5jc3MoJ2JvcmRlci1ib3R0b20nLCAnMXB4IHNvbGlkICcgKyBAJChzZWxlY3RvcikuY3NzKCdjb2xvcicpKVxuICAgICAgICAgICAgICAgIEAkKHNlbGVjdG9yKS5jc3MoJ2N1cnNvcicsICdwb2ludGVyJylcblxuICAgICAgICAgICAgICAgIEBpc0hvdmVyaW5nID0gdHJ1ZVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW91dCcsIEBob3ZlckV2ZW50U2VsZWN0b3JzLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAaXNIb3ZlcmluZ1xuXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBAZ2V0U2VsZWN0b3JGcm9tRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIHNlbGVjdG9yXG5cbiAgICAgICAgICAgICAgICBAJChzZWxlY3RvcikuY3NzKCdib3JkZXItYm90dG9tJywgJycpXG4gICAgICAgICAgICAgICAgQCQoc2VsZWN0b3IpLmNzcygnY3Vyc29yJywgJycpXG5cbiAgICAgICAgICAgICAgICBAaXNIb3ZlcmluZyA9IGZhbHNlXG5cbiAgICAgICAgICAgIEBzdWJBdG9tLmFkZCBzY3JvbGxWaWV3RWxlbWVudCwgJ2NsaWNrJywgQGNsaWNrRXZlbnRTZWxlY3RvcnMsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IEBnZXRTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICAgICAgICAgICAgIGlmIHNlbGVjdG9yID09IG51bGwgfHwgZXZlbnQuYWx0S2V5ID09IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgaWYgZXZlbnQuaGFuZGxlZCAhPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZWRpdG9yLCBAJChzZWxlY3RvcikudGV4dCgpKVxuICAgICAgICAgICAgICAgICAgICBldmVudC5oYW5kbGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICAjIFRoaXMgaXMgbmVlZGVkIHRvIGJlIGFibGUgdG8gYWx0LWNsaWNrIGNsYXNzIG5hbWVzIGluc2lkZSBjb21tZW50cyAoZG9jYmxvY2tzKS5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBpc0hvdmVyaW5nXG5cbiAgICAgICAgICAgICAgICBtYXJrZXJQcm9wZXJ0aWVzID1cbiAgICAgICAgICAgICAgICAgICAgY29udGFpbnNCdWZmZXJQb3NpdGlvbjogZXZlbnQubmV3QnVmZmVyUG9zaXRpb25cblxuICAgICAgICAgICAgICAgIG1hcmtlcnMgPSBldmVudC5jdXJzb3IuZWRpdG9yLmZpbmRNYXJrZXJzIG1hcmtlclByb3BlcnRpZXNcblxuICAgICAgICAgICAgICAgIGZvciBrZXksbWFya2VyIG9mIG1hcmtlcnNcbiAgICAgICAgICAgICAgICAgICAgZm9yIGFsbEtleSxhbGxNYXJrZXIgb2YgQGFsbE1hcmtlcnNbZWRpdG9yLmdldExvbmdUaXRsZSgpXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbWFya2VyLmlkID09IGFsbE1hcmtlci5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZXZlbnQuY3Vyc29yLmVkaXRvciwgbWFya2VyLmdldFByb3BlcnRpZXMoKS50ZXJtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXIgYW55IG1hcmtlcnMgdGhhdCB5b3UgbmVlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVnaXN0ZXJNYXJrZXJzOiAoZWRpdG9yKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgYW55IG1hcmtlcnMgcHJldmlvdXNseSBjcmVhdGVkIGJ5IHJlZ2lzdGVyTWFya2Vycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgY2xlYW5NYXJrZXJzOiAoZWRpdG9yKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIFJlc2NhbnMgdGhlIGVkaXRvciwgdXBkYXRpbmcgYWxsIG1hcmtlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIHJlc2Nhbk1hcmtlcnM6IChlZGl0b3IpIC0+XG4gICAgICAgIEBjbGVhbk1hcmtlcnMoZWRpdG9yKVxuICAgICAgICBAcmVnaXN0ZXJNYXJrZXJzKGVkaXRvcilcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IHNlbGVjdG9yIHdoZW4gYSBzZWxlY3RvciBpcyBjbGlja2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSBldmVudCBBIGpRdWVyeSBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge29iamVjdHxudWxsfSBBIHNlbGVjdG9yIHRvIGJlIHVzZWQgd2l0aCBqUXVlcnkuXG4gICAgIyMjXG4gICAgZ2V0U2VsZWN0b3JGcm9tRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIGV2ZW50LmN1cnJlbnRUYXJnZXRcblxuICAgICMjIypcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBnb3RvIGlzIGFibGUgdG8ganVtcCB1c2luZyB0aGUgdGVybS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGVybSBUZXJtIHRvIGNoZWNrLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhIGp1bXAgaXMgcG9zc2libGUuXG4gICAgIyMjXG4gICAgY2FuR290bzogKHRlcm0pIC0+XG4gICAgICAgIHJldHVybiB0ZXJtLm1hdGNoKEBnb3RvUmVnZXgpPy5sZW5ndGggPiAwXG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgcmVnZXggdXNlZCB3aGVuIGxvb2tpbmcgZm9yIGEgd29yZCB3aXRoaW4gdGhlIGVkaXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXJtIFRlcm0gYmVpbmcgc2VhcmNoLlxuICAgICAqXG4gICAgICogQHJldHVybiB7cmVnZXh9IFJlZ2V4IHRvIGJlIHVzZWQuXG4gICAgIyMjXG4gICAgZ2V0SnVtcFRvUmVnZXg6ICh0ZXJtKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIEp1bXBzIHRvIGEgd29yZCB3aXRoaW4gdGhlIGVkaXRvclxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRoYXQgaGFzIHRoZSBmdW5jdGlvbiBpbi5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHdvcmQgICAgICAgVGhlIHdvcmQgdG8gZmluZCBhbmQgdGhlbiBqdW1wIHRvLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59ICAgICAgICAgICBXaGV0aGVyIHRoZSBmaW5kaW5nIHdhcyBzdWNjZXNzZnVsLlxuICAgICMjI1xuICAgIGp1bXBUbzogKGVkaXRvciwgd29yZCkgLT5cbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBAcGFyc2VyLmZpbmRCdWZmZXJQb3NpdGlvbk9mV29yZChlZGl0b3IsIHdvcmQsIEBnZXRKdW1wVG9SZWdleCh3b3JkKSlcblxuICAgICAgICBpZiBidWZmZXJQb3NpdGlvbiA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAjIFNtYWxsIGRlbGF5IHRvIHdhaXQgZm9yIHdoZW4gYSBlZGl0b3IgaXMgYmVpbmcgY3JlYXRlZC5cbiAgICAgICAgc2V0VGltZW91dCgoKSAtPlxuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLCB7XG4gICAgICAgICAgICAgICAgYXV0b3Njcm9sbDogZmFsc2VcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICMgU2VwYXJhdGVkIHRoZXNlIGFzIHRoZSBhdXRvc2Nyb2xsIG9uIHNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIGRpZG4ndCB3b3JrIGFzIHdlbGwuXG4gICAgICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiksIHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICwgMTAwKVxuIl19
