(function() {
  var AbstractProvider, AttachedPopover, SubAtom, TextEditor;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.hoverEventSelectors = '';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.subAtom = new SubAtom;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.registerEvents(editor);
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
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {
      document.removeChild(this.popover);
      this.subAtom.dispose();
      return this.removePopover();
    };


    /**
     * Registers the necessary event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mouseover', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var cursorPosition, editorViewComponent, selector;
            if (_this.timeout) {
              clearTimeout(_this.timeout);
            }
            selector = _this.getSelectorFromEvent(event);
            if (selector === null) {
              return;
            }
            editorViewComponent = atom.views.getView(editor).component;
            if (editorViewComponent) {
              cursorPosition = editorViewComponent.screenPositionForMouseEvent(event);
              _this.removePopover();
              return _this.showPopoverFor(editor, selector, cursorPosition);
            }
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            return _this.removePopover();
          };
        })(this));
        editor.onDidDestroy((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        editor.onDidStopChanging((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        this.$(textEditorElement).find('.horizontal-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        return this.$(textEditorElement).find('.vertical-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
      }
    };


    /**
     * Shows a popover containing the documentation of the specified element located at the specified location.
     *
     * @param {TextEditor} editor         TextEditor containing the elemment.
     * @param {string}     element        The element to search for.
     * @param {Point}      bufferPosition The cursor location the element is at.
     * @param {int}        delay          How long to wait before the popover shows up.
     * @param {int}        fadeInTime     The amount of time to take to fade in the tooltip.
     */

    AbstractProvider.prototype.showPopoverFor = function(editor, element, bufferPosition, delay, fadeInTime) {
      var popoverElement, term, tooltipText;
      if (delay == null) {
        delay = 500;
      }
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      term = this.$(element).text();
      tooltipText = this.getTooltipForWord(editor, term, bufferPosition);
      if ((tooltipText != null ? tooltipText.length : void 0) > 0) {
        popoverElement = this.getPopoverElementFromSelector(element);
        this.attachedPopover = new AttachedPopover(popoverElement);
        this.attachedPopover.setText('<div style="margin-top: -1em;">' + tooltipText + '</div>');
        return this.attachedPopover.showAfter(delay, fadeInTime);
      }
    };


    /**
     * Removes the popover, if it is displayed.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Retrieves a tooltip for the word given.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     */

    AbstractProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {};


    /**
     * Gets the correct selector when a selector is clicked.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Gets the correct element to attach the popover to from the retrieved selector.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getPopoverElementFromSelector = function(selector) {
      return selector;
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDhCQUFSOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7K0JBQ0YsbUJBQUEsR0FBcUI7OztBQUVyQjs7OzsrQkFHQSxJQUFBLEdBQU0sU0FBQTtNQUNGLElBQUMsQ0FBQSxDQUFELEdBQUssT0FBQSxDQUFRLFFBQVI7TUFDTCxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQUEsQ0FBUSw2QkFBUjtNQUVWLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQzlCLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCO1FBRDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztNQUlBLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDNUIsY0FBQTtVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQTtVQUVSLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDSTtBQUFBO2lCQUFBLHFDQUFBOztjQUNJLElBQUcsUUFBQSxZQUFvQixVQUF2Qjs2QkFDSSxLQUFDLENBQUEsY0FBRCxDQUFnQixRQUFoQixHQURKO2VBQUEsTUFBQTtxQ0FBQTs7QUFESjsyQkFESjs7UUFINEI7TUFBQSxD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LGVBQUQsR0FBbUIsS0FGdkI7O0lBRFc7OztBQUtmOzs7Ozs7OzsrQkFPQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBOzs7QUFFbkI7Ozs7OzsrQkFLQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQ7QUFDbEIsYUFBTyxLQUFLLENBQUM7SUFESzs7O0FBR3RCOzs7Ozs7K0JBS0EsNkJBQUEsR0FBK0IsU0FBQyxRQUFEO0FBQzNCLGFBQU87SUFEb0I7Ozs7O0FBbkpuQyIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yfSA9IHJlcXVpcmUgJ2F0b20nXG5cblN1YkF0b20gPSByZXF1aXJlICdzdWItYXRvbSdcbkF0dGFjaGVkUG9wb3ZlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2F0dGFjaGVkLXBvcG92ZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgQWJzdHJhY3RQcm92aWRlclxuICAgIGhvdmVyRXZlbnRTZWxlY3RvcnM6ICcnXG5cbiAgICAjIyMqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhpcyBwcm92aWRlci5cbiAgICAjIyNcbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbiAgICAgICAgQHBhcnNlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlcidcblxuICAgICAgICBAc3ViQXRvbSA9IG5ldyBTdWJBdG9tXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgZWRpdG9yXG5cbiAgICAgICAgIyBXaGVuIHlvdSBnbyBiYWNrIHRvIG9ubHkgaGF2ZSBvbmUgcGFuZSB0aGUgZXZlbnRzIGFyZSBsb3N0LCBzbyBuZWVkIHRvIHJlLXJlZ2lzdGVyLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lIChwYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGlmIHBhbmVzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgZm9yIHBhbmVJdGVtIGluIHBhbmVzWzBdLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAgICAgIyBIYXZpbmcgdG8gcmUtcmVnaXN0ZXIgZXZlbnRzIGFzIHdoZW4gYSBuZXcgcGFuZSBpcyBjcmVhdGVkIHRoZSBvbGQgcGFuZXMgbG9zZSB0aGUgZXZlbnRzLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFBhbmUgKG9ic2VydmVkUGFuZSkgPT5cbiAgICAgICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICAgICAgICBmb3IgcGFuZSBpbiBwYW5lc1xuICAgICAgICAgICAgICAgIGlmIHBhbmUgPT0gb2JzZXJ2ZWRQYW5lXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBwYW5lSXRlbVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZlcyB0aGUgcHJvdmlkZXIuXG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlQ2hpbGQoQHBvcG92ZXIpXG4gICAgICAgIEBzdWJBdG9tLmRpc3Bvc2UoKVxuICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHJlZ2lzdGVyIGV2ZW50cyB0by5cbiAgICAjIyNcbiAgICByZWdpc3RlckV2ZW50czogKGVkaXRvcikgLT5cbiAgICAgICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUubWF0Y2ggL3RleHQuaHRtbC5waHAkL1xuICAgICAgICAgICAgdGV4dEVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgc2Nyb2xsVmlld0VsZW1lbnQgPSBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLnNjcm9sbC12aWV3JylcblxuICAgICAgICAgICAgQHN1YkF0b20uYWRkIHNjcm9sbFZpZXdFbGVtZW50LCAnbW91c2VvdmVyJywgQGhvdmVyRXZlbnRTZWxlY3RvcnMsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBpZiBAdGltZW91dFxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXQpXG5cbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IEBnZXRTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICAgICAgICAgICAgIGlmIHNlbGVjdG9yID09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICAgICBlZGl0b3JWaWV3Q29tcG9uZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcikuY29tcG9uZW50XG5cbiAgICAgICAgICAgICAgICAjIFRpY2tldCAjMTQwIC0gSW4gcmFyZSBjYXNlcyB0aGUgY29tcG9uZW50IGlzIG51bGwuXG4gICAgICAgICAgICAgICAgaWYgZWRpdG9yVmlld0NvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGVkaXRvclZpZXdDb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcbiAgICAgICAgICAgICAgICAgICAgQHNob3dQb3BvdmVyRm9yKGVkaXRvciwgc2VsZWN0b3IsIGN1cnNvclBvc2l0aW9uKVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW91dCcsIEBob3ZlckV2ZW50U2VsZWN0b3JzLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICAjIFRpY2tldCAjMTA3IC0gTW91c2VvdXQgaXNuJ3QgZ2VuZXJhdGVkIHVudGlsIHRoZSBtb3VzZSBtb3ZlcywgZXZlbiB3aGVuIHNjcm9sbGluZyAod2l0aCB0aGUga2V5Ym9hcmQgb3JcbiAgICAgICAgICAgICMgbW91c2UpLiBJZiB0aGUgZWxlbWVudCBnb2VzIG91dCBvZiB0aGUgdmlldyBpbiB0aGUgbWVhbnRpbWUsIGl0cyBIVE1MIGVsZW1lbnQgZGlzYXBwZWFycywgbmV2ZXIgcmVtb3ZpbmdcbiAgICAgICAgICAgICMgaXQuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95ICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcuaG9yaXpvbnRhbC1zY3JvbGxiYXInKS5vbiAnc2Nyb2xsJywgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcudmVydGljYWwtc2Nyb2xsYmFyJykub24gJ3Njcm9sbCcsICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIFNob3dzIGEgcG9wb3ZlciBjb250YWluaW5nIHRoZSBkb2N1bWVudGF0aW9uIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBsb2NhdGVkIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgIFRleHRFZGl0b3IgY29udGFpbmluZyB0aGUgZWxlbW1lbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICBlbGVtZW50ICAgICAgICBUaGUgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9ICAgICAgYnVmZmVyUG9zaXRpb24gVGhlIGN1cnNvciBsb2NhdGlvbiB0aGUgZWxlbWVudCBpcyBhdC5cbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIGRlbGF5ICAgICAgICAgIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIHRoZSBwb3BvdmVyIHNob3dzIHVwLlxuICAgICAqIEBwYXJhbSB7aW50fSAgICAgICAgZmFkZUluVGltZSAgICAgVGhlIGFtb3VudCBvZiB0aW1lIHRvIHRha2UgdG8gZmFkZSBpbiB0aGUgdG9vbHRpcC5cbiAgICAjIyNcbiAgICBzaG93UG9wb3ZlckZvcjogKGVkaXRvciwgZWxlbWVudCwgYnVmZmVyUG9zaXRpb24sIGRlbGF5ID0gNTAwLCBmYWRlSW5UaW1lID0gMTAwKSAtPlxuICAgICAgICB0ZXJtID0gQCQoZWxlbWVudCkudGV4dCgpXG4gICAgICAgIHRvb2x0aXBUZXh0ID0gQGdldFRvb2x0aXBGb3JXb3JkKGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24pXG5cbiAgICAgICAgaWYgdG9vbHRpcFRleHQ/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIHBvcG92ZXJFbGVtZW50ID0gQGdldFBvcG92ZXJFbGVtZW50RnJvbVNlbGVjdG9yKGVsZW1lbnQpXG5cbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIgPSBuZXcgQXR0YWNoZWRQb3BvdmVyKHBvcG92ZXJFbGVtZW50KVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5zZXRUZXh0KCc8ZGl2IHN0eWxlPVwibWFyZ2luLXRvcDogLTFlbTtcIj4nICsgdG9vbHRpcFRleHQgKyAnPC9kaXY+JylcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2hvd0FmdGVyKGRlbGF5LCBmYWRlSW5UaW1lKVxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgdGhlIHBvcG92ZXIsIGlmIGl0IGlzIGRpc3BsYXllZC5cbiAgICAjIyNcbiAgICByZW1vdmVQb3BvdmVyOiAoKSAtPlxuICAgICAgICBpZiBAYXR0YWNoZWRQb3BvdmVyXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3ZlciA9IG51bGxcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgYSB0b29sdGlwIGZvciB0aGUgd29yZCBnaXZlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICAgICAgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgdGVybSAgICAgICAgICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9ICAgICAgYnVmZmVyUG9zaXRpb24gVGhlIGN1cnNvciBsb2NhdGlvbiB0aGUgdGVybSBpcyBhdC5cbiAgICAjIyNcbiAgICBnZXRUb29sdGlwRm9yV29yZDogKGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24pIC0+XG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgY29ycmVjdCBzZWxlY3RvciB3aGVuIGEgc2VsZWN0b3IgaXMgY2xpY2tlZC5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnkuRXZlbnR9ICBldmVudCAgQSBqUXVlcnkgZXZlbnQuXG4gICAgICogQHJldHVybiB7b2JqZWN0fG51bGx9ICAgICAgICAgIEEgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGpRdWVyeS5cbiAgICAjIyNcbiAgICBnZXRTZWxlY3RvckZyb21FdmVudDogKGV2ZW50KSAtPlxuICAgICAgICByZXR1cm4gZXZlbnQuY3VycmVudFRhcmdldFxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIGNvcnJlY3QgZWxlbWVudCB0byBhdHRhY2ggdGhlIHBvcG92ZXIgdG8gZnJvbSB0aGUgcmV0cmlldmVkIHNlbGVjdG9yLlxuICAgICAqIEBwYXJhbSAge2pRdWVyeS5FdmVudH0gIGV2ZW50ICBBIGpRdWVyeSBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8bnVsbH0gICAgICAgICAgQSBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggalF1ZXJ5LlxuICAgICMjI1xuICAgIGdldFBvcG92ZXJFbGVtZW50RnJvbVNlbGVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICAgIHJldHVybiBzZWxlY3RvclxuIl19
