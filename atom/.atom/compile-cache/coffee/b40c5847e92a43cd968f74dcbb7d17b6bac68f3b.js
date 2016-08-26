(function() {
  var AbstractProvider, TextEditor;

  TextEditor = require('atom').TextEditor;

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}


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
          var paneItem, panes, _i, _len, _ref, _results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            _ref = panes[0].items;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              paneItem = _ref[_i];
              if (paneItem instanceof TextEditor) {
                _results.push(_this.registerEvents(paneItem));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var pane, paneItem, panes, _i, _len, _results;
          panes = atom.workspace.getPanes();
          _results = [];
          for (_i = 0, _len = panes.length; _i < _len; _i++) {
            pane = panes[_i];
            if (pane === observedPane) {
              continue;
            }
            _results.push((function() {
              var _j, _len1, _ref, _results1;
              _ref = pane.items;
              _results1 = [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                paneItem = _ref[_j];
                if (paneItem instanceof TextEditor) {
                  _results1.push(this.registerEvents(paneItem));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(_this));
          }
          return _results;
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

    AbstractProvider.prototype.registerEvents = function(editor) {};


    /**
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerAnnotations = function(editor) {};


    /**
     * Removes any annotations that were created.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.removeAnnotations = function(editor) {};


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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBRU07a0NBQ0Y7O0FBQUE7QUFBQTs7T0FBQTs7QUFBQSwrQkFHQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0YsTUFBQSxJQUFDLENBQUEsQ0FBRCxHQUFLLE9BQUEsQ0FBUSxRQUFSLENBQUwsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsNkJBQVIsQ0FEVixDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUM5QixVQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUMsS0FBRCxHQUFBO21CQUNiLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQURhO1VBQUEsQ0FBakIsQ0FBQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsQ0FIQSxDQUFBO2lCQUlBLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBTDhCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FIQSxDQUFBO0FBQUEsTUFXQSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFmLENBQWdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUM1QixjQUFBLHlDQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQUEsQ0FBUixDQUFBO0FBRUEsVUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO0FBQ0k7QUFBQTtpQkFBQSwyQ0FBQTtrQ0FBQTtBQUNJLGNBQUEsSUFBRyxRQUFBLFlBQW9CLFVBQXZCOzhCQUNJLEtBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCLEdBREo7ZUFBQSxNQUFBO3NDQUFBO2VBREo7QUFBQTs0QkFESjtXQUg0QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLENBWEEsQ0FBQTthQW9CQSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsWUFBRCxHQUFBO0FBQ3hCLGNBQUEseUNBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQSxDQUFSLENBQUE7QUFFQTtlQUFBLDRDQUFBOzZCQUFBO0FBQ0ksWUFBQSxJQUFHLElBQUEsS0FBUSxZQUFYO0FBQ0ksdUJBREo7YUFBQTtBQUFBOztBQUdBO0FBQUE7bUJBQUEsNkNBQUE7b0NBQUE7QUFDSSxnQkFBQSxJQUFHLFFBQUEsWUFBb0IsVUFBdkI7aUNBQ0ksSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBaEIsR0FESjtpQkFBQSxNQUFBO3lDQUFBO2lCQURKO0FBQUE7OzJCQUhBLENBREo7QUFBQTswQkFId0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixFQXJCRTtJQUFBLENBSE4sQ0FBQTs7QUFtQ0E7QUFBQTs7T0FuQ0E7O0FBQUEsK0JBc0NBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQURRO0lBQUEsQ0F0Q1osQ0FBQTs7QUF5Q0E7QUFBQTs7OztPQXpDQTs7QUFBQSwrQkE4Q0EsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQSxDQTlDaEIsQ0FBQTs7QUFpREE7QUFBQTs7OztPQWpEQTs7QUFBQSwrQkFzREEsbUJBQUEsR0FBcUIsU0FBQyxNQUFELEdBQUEsQ0F0RHJCLENBQUE7O0FBd0RBO0FBQUE7Ozs7T0F4REE7O0FBQUEsK0JBNkRBLGlCQUFBLEdBQW1CLFNBQUMsTUFBRCxHQUFBLENBN0RuQixDQUFBOztBQStEQTtBQUFBOzs7O09BL0RBOztBQUFBLCtCQW9FQSxNQUFBLEdBQVEsU0FBQyxNQUFELEdBQUE7QUFDSixNQUFBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsRUFGSTtJQUFBLENBcEVSLENBQUE7OzRCQUFBOztNQUxKLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/annotation/abstract-provider.coffee
