(function() {
  var AbstractProvider, AttachedPopover, Point, Range, SubAtom, TextEditor, ref;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, TextEditor = ref.TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = null;

    AbstractProvider.prototype.markers = [];

    AbstractProvider.prototype.subAtoms = [];


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescan(editor);
          });
          _this.registerAnnotations(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var j, len, paneItem, panes, ref1, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref1 = panes[0].items;
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              paneItem = ref1[j];
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
          var j, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (j = 0, len = panes.length; j < len; j++) {
            pane = panes[j];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var k, len1, ref1, results1;
              ref1 = pane.items;
              results1 = [];
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                paneItem = ref1[k];
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
      return this.removeAnnotations();
    };


    /**
     * Registers event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
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
        textEditorElement = atom.views.getView(editor);
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
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerAnnotations = function(editor) {
      var match, results, row, rowNum, rows, text;
      text = editor.getText();
      rows = text.split('\n');
      this.subAtoms[editor.getLongTitle()] = new SubAtom;
      results = [];
      for (rowNum in rows) {
        row = rows[rowNum];
        results.push((function() {
          var results1;
          results1 = [];
          while ((match = this.regex.exec(row))) {
            results1.push(this.placeAnnotation(editor, rowNum, row, match));
          }
          return results1;
        }).call(this));
      }
      return results;
    };


    /**
     * Places an annotation at the specified line and row text.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.placeAnnotation = function(editor, row, rowText, match) {
      var annotationInfo, decoration, longTitle, marker, markerLayer, range;
      annotationInfo = this.extractAnnotationInfo(editor, row, rowText, match);
      if (!annotationInfo) {
        return;
      }
      range = new Range(new Point(parseInt(row), 0), new Point(parseInt(row), rowText.length));
      if (typeof editor.addMarkerLayer === 'function') {
        if (this.markerLayers == null) {
          this.markerLayers = new WeakMap;
        }
        if (!(markerLayer = this.markerLayers.get(editor))) {
          markerLayer = editor.addMarkerLayer({
            maintainHistory: true
          });
          this.markerLayers.set(editor, markerLayer);
        }
      }
      marker = (markerLayer != null ? markerLayer : editor).markBufferRange(range, {
        maintainHistory: true,
        invalidate: 'touch'
      });
      decoration = editor.decorateMarker(marker, {
        type: 'line-number',
        "class": annotationInfo.lineNumberClass
      });
      longTitle = editor.getLongTitle();
      if (this.markers[longTitle] === void 0) {
        this.markers[longTitle] = [];
      }
      this.markers[longTitle].push(marker);
      return this.registerAnnotationEventHandlers(editor, row, annotationInfo);
    };


    /**
     * Exracts information about the annotation match.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {};


    /**
     * Registers annotation event handlers for the specified row.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {Object}     annotationInfo
     */

    AbstractProvider.prototype.registerAnnotationEventHandlers = function(editor, row, annotationInfo) {
      var gutterContainerElement, textEditorElement;
      textEditorElement = atom.views.getView(editor);
      gutterContainerElement = this.$(textEditorElement).find('.gutter-container');
      return (function(_this) {
        return function(editor, gutterContainerElement, annotationInfo) {
          var longTitle, selector;
          longTitle = editor.getLongTitle();
          selector = '.line-number' + '.' + annotationInfo.lineNumberClass + '[data-buffer-row=' + row + '] .icon-right';
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseover', selector, function(event) {
            return _this.handleMouseOver(event, editor, annotationInfo);
          });
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseout', selector, function(event) {
            return _this.handleMouseOut(event, editor, annotationInfo);
          });
          return _this.subAtoms[longTitle].add(gutterContainerElement, 'click', selector, function(event) {
            return _this.handleMouseClick(event, editor, annotationInfo);
          });
        };
      })(this)(editor, gutterContainerElement, annotationInfo);
    };


    /**
     * Handles the mouse over event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOver = function(event, editor, annotationInfo) {
      if (annotationInfo.tooltipText) {
        this.removePopover();
        this.attachedPopover = new AttachedPopover(event.target);
        this.attachedPopover.setText(annotationInfo.tooltipText);
        return this.attachedPopover.show();
      }
    };


    /**
     * Handles the mouse out event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOut = function(event, editor, annotationInfo) {
      return this.removePopover();
    };


    /**
     * Handles the mouse click event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {};


    /**
     * Removes the existing popover, if any.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Removes any annotations that were created.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.removeAnnotations = function(editor) {
      var i, marker, ref1, ref2;
      ref1 = this.markers[editor.getLongTitle()];
      for (i in ref1) {
        marker = ref1[i];
        marker.destroy();
      }
      this.markers[editor.getLongTitle()] = [];
      return (ref2 = this.subAtoms[editor.getLongTitle()]) != null ? ref2.dispose() : void 0;
    };


    /**
     * Rescans the editor, updating all annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescan = function(editor) {
      this.removeAnnotations(editor);
      return this.registerAnnotations(editor);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYW5ub3RhdGlvbi9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUVmLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFFVixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw4QkFBUjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FFTTs7OytCQUVGLEtBQUEsR0FBTzs7K0JBQ1AsT0FBQSxHQUFTOzsrQkFDVCxRQUFBLEdBQVU7OztBQUVWOzs7OytCQUdBLElBQUEsR0FBTSxTQUFBO01BQ0YsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUjtNQUNMLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBQSxDQUFRLDZCQUFSO01BRVYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtVQUM5QixNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFDLEtBQUQ7bUJBQ2IsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSO1VBRGEsQ0FBakI7VUFHQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckI7aUJBQ0EsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEI7UUFMOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO01BUUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFnQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUM1QixjQUFBO1VBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBZixDQUFBO1VBRVIsSUFBRyxLQUFLLENB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Ozs7OytCQUtBLGlCQUFBLEdBQW1CLFNBQUMsTUFBRDtBQUNmLFVBQUE7QUFBQTtBQUFBLFdBQUEsU0FBQTs7UUFDSSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBREo7TUFHQSxJQUFDLENBQUEsT0FBUSxDQUFBLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxDQUFULEdBQWtDO3lFQUNGLENBQUUsT0FBbEMsQ0FBQTtJQUxlOzs7QUFPbkI7Ozs7OzsrQkFLQSxNQUFBLEdBQVEsU0FBQyxNQUFEO01BQ0osSUFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO0lBRkk7Ozs7O0FBek9aIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgVGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5TdWJBdG9tID0gcmVxdWlyZSAnc3ViLWF0b20nXG5cbkF0dGFjaGVkUG9wb3ZlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2F0dGFjaGVkLXBvcG92ZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgQWJzdHJhY3RQcm92aWRlclxuICAgICMgVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGEgbGluZSBtdXN0IG1hdGNoIGluIG9yZGVyIGZvciBpdCB0byBiZSBjaGVja2VkIGlmIGl0IHJlcXVpcmVzIGFuIGFubm90YXRpb24uXG4gICAgcmVnZXg6IG51bGxcbiAgICBtYXJrZXJzOiBbXVxuICAgIHN1YkF0b21zOiBbXVxuXG4gICAgIyMjKlxuICAgICAqIEluaXRpYWxpemVzIHRoaXMgcHJvdmlkZXIuXG4gICAgIyMjXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQCQgPSByZXF1aXJlICdqcXVlcnknXG4gICAgICAgIEBwYXJzZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXInXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTYXZlIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAcmVzY2FuKGVkaXRvcilcblxuICAgICAgICAgICAgQHJlZ2lzdGVyQW5ub3RhdGlvbnMgZWRpdG9yXG4gICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgZWRpdG9yXG5cbiAgICAgICAgIyBXaGVuIHlvdSBnbyBiYWNrIHRvIG9ubHkgaGF2ZSAxIHBhbmUgdGhlIGV2ZW50cyBhcmUgbG9zdCwgc28gbmVlZCB0byByZS1yZWdpc3Rlci5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZSAocGFuZSkgPT5cbiAgICAgICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICAgICAgICBpZiBwYW5lcy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lc1swXS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBwYW5lSXRlbVxuXG4gICAgICAgICMgSGF2aW5nIHRvIHJlLXJlZ2lzdGVyIGV2ZW50cyBhcyB3aGVuIGEgbmV3IHBhbmUgaXMgY3JlYXRlZCB0aGUgb2xkIHBhbmVzIGxvc2UgdGhlIGV2ZW50cy5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRQYW5lIChvYnNlcnZlZFBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgZm9yIHBhbmUgaW4gcGFuZXNcbiAgICAgICAgICAgICAgICBpZiBwYW5lID09IG9ic2VydmVkUGFuZVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgZm9yIHBhbmVJdGVtIGluIHBhbmUuaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICMjIypcbiAgICAgKiBEZWFjdGl2ZXMgdGhlIHByb3ZpZGVyLlxuICAgICMjI1xuICAgIGRlYWN0aXZhdGU6ICgpIC0+XG4gICAgICAgIEByZW1vdmVBbm5vdGF0aW9ucygpXG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIGV2ZW50IGhhbmRsZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGV4dEVkaXRvciB0byByZWdpc3RlciBldmVudHMgdG8uXG4gICAgIyMjXG4gICAgcmVnaXN0ZXJFdmVudHM6IChlZGl0b3IpIC0+XG4gICAgICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLm1hdGNoIC90ZXh0Lmh0bWwucGhwJC9cbiAgICAgICAgICAgICMgVGlja2V0ICMxMDcgLSBNb3VzZW91dCBpc24ndCBnZW5lcmF0ZWQgdW50aWwgdGhlIG1vdXNlIG1vdmVzLCBldmVuIHdoZW4gc2Nyb2xsaW5nICh3aXRoIHRoZSBrZXlib2FyZCBvclxuICAgICAgICAgICAgIyBtb3VzZSkuIElmIHRoZSBlbGVtZW50IGdvZXMgb3V0IG9mIHRoZSB2aWV3IGluIHRoZSBtZWFudGltZSwgaXRzIEhUTUwgZWxlbWVudCBkaXNhcHBlYXJzLCBuZXZlciByZW1vdmluZ1xuICAgICAgICAgICAgIyBpdC5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZERlc3Ryb3kgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgdGV4dEVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuXG4gICAgICAgICAgICBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLmhvcml6b250YWwtc2Nyb2xsYmFyJykub24gJ3Njcm9sbCcsICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLnZlcnRpY2FsLXNjcm9sbGJhcicpLm9uICdzY3JvbGwnLCAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICMjIypcbiAgICAgKiBSZWdpc3RlcnMgdGhlIGFubm90YXRpb25zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAjIyNcbiAgICByZWdpc3RlckFubm90YXRpb25zOiAoZWRpdG9yKSAtPlxuICAgICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgQHN1YkF0b21zW2VkaXRvci5nZXRMb25nVGl0bGUoKV0gPSBuZXcgU3ViQXRvbVxuXG4gICAgICAgIGZvciByb3dOdW0scm93IG9mIHJvd3NcbiAgICAgICAgICAgIHdoaWxlIChtYXRjaCA9IEByZWdleC5leGVjKHJvdykpXG4gICAgICAgICAgICAgICAgQHBsYWNlQW5ub3RhdGlvbihlZGl0b3IsIHJvd051bSwgcm93LCBtYXRjaClcblxuICAgICMjIypcbiAgICAgKiBQbGFjZXMgYW4gYW5ub3RhdGlvbiBhdCB0aGUgc3BlY2lmaWVkIGxpbmUgYW5kIHJvdyB0ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIHJvd1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgcm93VGV4dFxuICAgICAqIEBwYXJhbSB7QXJyYXl9ICAgICAgbWF0Y2hcbiAgICAjIyNcbiAgICBwbGFjZUFubm90YXRpb246IChlZGl0b3IsIHJvdywgcm93VGV4dCwgbWF0Y2gpIC0+XG4gICAgICAgIGFubm90YXRpb25JbmZvID0gQGV4dHJhY3RBbm5vdGF0aW9uSW5mbyhlZGl0b3IsIHJvdywgcm93VGV4dCwgbWF0Y2gpXG5cbiAgICAgICAgaWYgbm90IGFubm90YXRpb25JbmZvXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludChwYXJzZUludChyb3cpLCAwKSxcbiAgICAgICAgICAgIG5ldyBQb2ludChwYXJzZUludChyb3cpLCByb3dUZXh0Lmxlbmd0aClcbiAgICAgICAgKVxuXG4gICAgICAgICMgRm9yIEF0b20gMS4zIG9yIGdyZWF0ZXIsIG1haW50YWluSGlzdG9yeSBjYW4gb25seSBiZSBhcHBsaWVkIHRvIGVudGlyZVxuICAgICAgICAjIG1hcmtlciBsYXllcnMuIExheWVycyBkb24ndCBleGlzdCBpbiBlYXJsaWVyIHZlcnNpb25zLCBoZW5jZSB0aGVcbiAgICAgICAgIyBjb25kaXRpb25hbCBsb2dpYy5cbiAgICAgICAgaWYgdHlwZW9mIGVkaXRvci5hZGRNYXJrZXJMYXllciBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICBAbWFya2VyTGF5ZXJzID89IG5ldyBXZWFrTWFwXG4gICAgICAgICAgICB1bmxlc3MgbWFya2VyTGF5ZXIgPSBAbWFya2VyTGF5ZXJzLmdldChlZGl0b3IpXG4gICAgICAgICAgICAgICAgbWFya2VyTGF5ZXIgPSBlZGl0b3IuYWRkTWFya2VyTGF5ZXIobWFpbnRhaW5IaXN0b3J5OiB0cnVlKVxuICAgICAgICAgICAgICAgIEBtYXJrZXJMYXllcnMuc2V0KGVkaXRvciwgbWFya2VyTGF5ZXIpXG5cbiAgICAgICAgbWFya2VyID0gKG1hcmtlckxheWVyID8gZWRpdG9yKS5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtcbiAgICAgICAgICAgIG1haW50YWluSGlzdG9yeSA6IHRydWUsXG4gICAgICAgICAgICBpbnZhbGlkYXRlICAgICAgOiAndG91Y2gnXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lLW51bWJlcicsXG4gICAgICAgICAgICBjbGFzczogYW5ub3RhdGlvbkluZm8ubGluZU51bWJlckNsYXNzXG4gICAgICAgIH0pXG5cbiAgICAgICAgbG9uZ1RpdGxlID0gZWRpdG9yLmdldExvbmdUaXRsZSgpXG5cbiAgICAgICAgaWYgQG1hcmtlcnNbbG9uZ1RpdGxlXSA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgIEBtYXJrZXJzW2xvbmdUaXRsZV0gPSBbXVxuXG4gICAgICAgIEBtYXJrZXJzW2xvbmdUaXRsZV0ucHVzaChtYXJrZXIpXG5cbiAgICAgICAgQHJlZ2lzdGVyQW5ub3RhdGlvbkV2ZW50SGFuZGxlcnMoZWRpdG9yLCByb3csIGFubm90YXRpb25JbmZvKVxuXG4gICAgIyMjKlxuICAgICAqIEV4cmFjdHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGFubm90YXRpb24gbWF0Y2guXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvclxuICAgICAqIEBwYXJhbSB7aW50fSAgICAgICAgcm93XG4gICAgICogQHBhcmFtIHtTdHJpbmd9ICAgICByb3dUZXh0XG4gICAgICogQHBhcmFtIHtBcnJheX0gICAgICBtYXRjaFxuICAgICMjI1xuICAgIGV4dHJhY3RBbm5vdGF0aW9uSW5mbzogKGVkaXRvciwgcm93LCByb3dUZXh0LCBtYXRjaCkgLT5cblxuICAgICMjIypcbiAgICAgKiBSZWdpc3RlcnMgYW5ub3RhdGlvbiBldmVudCBoYW5kbGVycyBmb3IgdGhlIHNwZWNpZmllZCByb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvclxuICAgICAqIEBwYXJhbSB7aW50fSAgICAgICAgcm93XG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICBhbm5vdGF0aW9uSW5mb1xuICAgICMjI1xuICAgIHJlZ2lzdGVyQW5ub3RhdGlvbkV2ZW50SGFuZGxlcnM6IChlZGl0b3IsIHJvdywgYW5ub3RhdGlvbkluZm8pIC0+XG4gICAgICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCA9IEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcuZ3V0dGVyLWNvbnRhaW5lcicpXG5cbiAgICAgICAgZG8gKGVkaXRvciwgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgYW5ub3RhdGlvbkluZm8pID0+XG4gICAgICAgICAgICBsb25nVGl0bGUgPSBlZGl0b3IuZ2V0TG9uZ1RpdGxlKClcbiAgICAgICAgICAgIHNlbGVjdG9yID0gJy5saW5lLW51bWJlcicgKyAnLicgKyBhbm5vdGF0aW9uSW5mby5saW5lTnVtYmVyQ2xhc3MgKyAnW2RhdGEtYnVmZmVyLXJvdz0nICsgcm93ICsgJ10gLmljb24tcmlnaHQnXG5cbiAgICAgICAgICAgIEBzdWJBdG9tc1tsb25nVGl0bGVdLmFkZCBndXR0ZXJDb250YWluZXJFbGVtZW50LCAnbW91c2VvdmVyJywgc2VsZWN0b3IsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAaGFuZGxlTW91c2VPdmVyKGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKVxuXG4gICAgICAgICAgICBAc3ViQXRvbXNbbG9uZ1RpdGxlXS5hZGQgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgJ21vdXNlb3V0Jywgc2VsZWN0b3IsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAaGFuZGxlTW91c2VPdXQoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pXG5cbiAgICAgICAgICAgIEBzdWJBdG9tc1tsb25nVGl0bGVdLmFkZCBndXR0ZXJDb250YWluZXJFbGVtZW50LCAnY2xpY2snLCBzZWxlY3RvciwgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIEBoYW5kbGVNb3VzZUNsaWNrKGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKVxuXG4gICAgIyMjKlxuICAgICAqIEhhbmRsZXMgdGhlIG1vdXNlIG92ZXIgZXZlbnQgb24gYW4gYW5ub3RhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5LkV2ZW50fSBldmVudFxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gICBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgICAgYW5ub3RhdGlvbkluZm9cbiAgICAjIyNcbiAgICBoYW5kbGVNb3VzZU92ZXI6IChldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbykgLT5cbiAgICAgICAgaWYgYW5ub3RhdGlvbkluZm8udG9vbHRpcFRleHRcbiAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3ZlciA9IG5ldyBBdHRhY2hlZFBvcG92ZXIoZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5zZXRUZXh0KGFubm90YXRpb25JbmZvLnRvb2x0aXBUZXh0KVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5zaG93KClcblxuICAgICMjIypcbiAgICAgKiBIYW5kbGVzIHRoZSBtb3VzZSBvdXQgZXZlbnQgb24gYW4gYW5ub3RhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5LkV2ZW50fSBldmVudFxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gICBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgICAgYW5ub3RhdGlvbkluZm9cbiAgICAjIyNcbiAgICBoYW5kbGVNb3VzZU91dDogKGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKSAtPlxuICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAjIyMqXG4gICAgICogSGFuZGxlcyB0aGUgbW91c2UgY2xpY2sgZXZlbnQgb24gYW4gYW5ub3RhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5LkV2ZW50fSBldmVudFxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gICBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgICAgYW5ub3RhdGlvbkluZm9cbiAgICAjIyNcbiAgICBoYW5kbGVNb3VzZUNsaWNrOiAoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pIC0+XG5cbiAgICAjIyMqXG4gICAgICogUmVtb3ZlcyB0aGUgZXhpc3RpbmcgcG9wb3ZlciwgaWYgYW55LlxuICAgICMjI1xuICAgIHJlbW92ZVBvcG92ZXI6ICgpIC0+XG4gICAgICAgIGlmIEBhdHRhY2hlZFBvcG92ZXJcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuZGlzcG9zZSgpXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgYW55IGFubm90YXRpb25zIHRoYXQgd2VyZSBjcmVhdGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAjIyNcbiAgICByZW1vdmVBbm5vdGF0aW9uczogKGVkaXRvcikgLT5cbiAgICAgICAgZm9yIGksbWFya2VyIG9mIEBtYXJrZXJzW2VkaXRvci5nZXRMb25nVGl0bGUoKV1cbiAgICAgICAgICAgIG1hcmtlci5kZXN0cm95KClcblxuICAgICAgICBAbWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldID0gW11cbiAgICAgICAgQHN1YkF0b21zW2VkaXRvci5nZXRMb25nVGl0bGUoKV0/LmRpc3Bvc2UoKVxuXG4gICAgIyMjKlxuICAgICAqIFJlc2NhbnMgdGhlIGVkaXRvciwgdXBkYXRpbmcgYWxsIGFubm90YXRpb25zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAjIyNcbiAgICByZXNjYW46IChlZGl0b3IpIC0+XG4gICAgICAgIEByZW1vdmVBbm5vdGF0aW9ucyhlZGl0b3IpXG4gICAgICAgIEByZWdpc3RlckFubm90YXRpb25zKGVkaXRvcilcbiJdfQ==
