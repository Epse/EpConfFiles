(function() {
  var AbstractProvider, AttachedPopover, FunctionProvider, Point, Range, SubAtom, TextEditor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Point = require('atom').Point;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  AbstractProvider = require('./abstract-provider');

  AttachedPopover = require('../services/attached-popover');

  module.exports = FunctionProvider = (function(_super) {
    __extends(FunctionProvider, _super);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.annotationMarkers = [];

    FunctionProvider.prototype.annotationSubAtoms = [];


    /**
     * Registers event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    FunctionProvider.prototype.registerEvents = function(editor) {
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
        this.$(textEditorElement.shadowRoot).find('.horizontal-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        return this.$(textEditorElement.shadowRoot).find('.vertical-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
      }
    };


    /**
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through
     */

    FunctionProvider.prototype.registerAnnotations = function(editor) {
      var annotationClass, currentClass, decoration, gutterContainerElement, marker, match, methodName, range, regex, row, rowNum, rows, text, textEditorElement, value, _results;
      text = editor.getText();
      rows = text.split('\n');
      this.annotationSubAtoms[editor.getLongTitle()] = new SubAtom;
      _results = [];
      for (rowNum in rows) {
        row = rows[rowNum];
        regex = /(\s*(?:public|protected|private)\s+function\s+)(\w+)\s*\(/g;
        _results.push((function() {
          var _results1;
          _results1 = [];
          while ((match = regex.exec(row))) {
            currentClass = this.parser.getFullClassName(editor);
            methodName = match[2];
            value = this.parser.getMethodContext(editor, methodName, null, currentClass);
            if (!value) {
              continue;
            }
            if (value.override || value.implementation) {
              range = new Range(new Point(parseInt(rowNum), match[1].length), new Point(parseInt(rowNum), match[1].length + methodName.length));
              marker = editor.markBufferRange(range, {
                maintainHistory: true,
                invalidate: 'touch'
              });
              annotationClass = value.override ? 'override' : 'implementation';
              decoration = editor.decorateMarker(marker, {
                type: 'line-number',
                "class": annotationClass
              });
              if (this.annotationMarkers[editor.getLongTitle()] === void 0) {
                this.annotationMarkers[editor.getLongTitle()] = [];
              }
              this.annotationMarkers[editor.getLongTitle()].push(marker);
              textEditorElement = atom.views.getView(editor);
              gutterContainerElement = this.$(textEditorElement.shadowRoot).find('.gutter-container');
              _results1.push((function(_this) {
                return function(gutterContainerElement, methodName, value, editor) {
                  var selector;
                  selector = '.line-number' + '.' + annotationClass + '[data-buffer-row=' + rowNum + '] .icon-right';
                  _this.annotationSubAtoms[editor.getLongTitle()].add(gutterContainerElement, 'mouseover', selector, function(event) {
                    var tooltipText;
                    tooltipText = '';
                    if (value.override) {
                      tooltipText += 'Overrides method from ' + value.override.declaringClass.name;
                    } else {
                      tooltipText += 'Implements method for ' + value.implementation.declaringClass.name;
                    }
                    _this.attachedPopover = new AttachedPopover(event.target);
                    _this.attachedPopover.setText(tooltipText);
                    return _this.attachedPopover.show();
                  });
                  _this.annotationSubAtoms[editor.getLongTitle()].add(gutterContainerElement, 'mouseout', selector, function(event) {
                    return _this.removePopover();
                  });
                  return _this.annotationSubAtoms[editor.getLongTitle()].add(gutterContainerElement, 'click', selector, function(event) {
                    var referencedObject;
                    referencedObject = value.override ? value.override : value.implementation;
                    return atom.workspace.open(referencedObject.declaringStructure.filename, {
                      initialLine: referencedObject.startLine - 1,
                      searchAllPanes: true
                    });
                  });
                };
              })(this)(gutterContainerElement, methodName, value, editor));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };


    /**
     * Removes any annotations that were created.
     *
     * @param {TextEditor} editor The editor to search through
     */

    FunctionProvider.prototype.removeAnnotations = function(editor) {
      var i, marker, _ref, _ref1;
      _ref = this.annotationMarkers[editor.getLongTitle()];
      for (i in _ref) {
        marker = _ref[i];
        marker.destroy();
      }
      this.annotationMarkers[editor.getLongTitle()] = [];
      return (_ref1 = this.annotationSubAtoms[editor.getLongTitle()]) != null ? _ref1.dispose() : void 0;
    };


    /**
     * Removes the popover, if it is displayed.
     */

    FunctionProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vbWV0aG9kLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFGRCxDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBSlYsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUxuQixDQUFBOztBQUFBLEVBTUEsZUFBQSxHQUFrQixPQUFBLENBQVEsOEJBQVIsQ0FObEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDRix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsaUJBQUEsR0FBbUIsRUFBbkIsQ0FBQTs7QUFBQSwrQkFDQSxrQkFBQSxHQUFvQixFQURwQixDQUFBOztBQUdBO0FBQUE7Ozs7T0FIQTs7QUFBQSwrQkFRQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxHQUFBO0FBQ1osVUFBQSxpQkFBQTtBQUFBLE1BQUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBUyxDQUFDLEtBQTlCLENBQW9DLGdCQUFwQyxDQUFIO0FBSUksUUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDaEIsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQURnQjtVQUFBLEVBQUE7UUFB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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/annotation/method-provider.coffee
