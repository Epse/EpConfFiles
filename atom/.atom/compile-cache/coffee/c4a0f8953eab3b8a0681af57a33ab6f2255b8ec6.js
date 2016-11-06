(function() {
  var AncestorsMethods, ColorResultsElement, CompositeDisposable, EventsDelegation, Range, SpacePenDSL, path, removeLeadingWhitespace, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = [], Range = _ref[0], CompositeDisposable = _ref[1], _ = _ref[2], path = _ref[3];

  _ref1 = require('atom-utils'), SpacePenDSL = _ref1.SpacePenDSL, EventsDelegation = _ref1.EventsDelegation, AncestorsMethods = _ref1.AncestorsMethods;

  removeLeadingWhitespace = function(string) {
    return string.replace(/^\s+/, '');
  };

  ColorResultsElement = (function(_super) {
    __extends(ColorResultsElement, _super);

    function ColorResultsElement() {
      return ColorResultsElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorResultsElement);

    EventsDelegation.includeInto(ColorResultsElement);

    ColorResultsElement.content = function() {
      return this.tag('atom-panel', {
        outlet: 'pane',
        "class": 'preview-pane pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.span({
              outlet: 'previewCount',
              "class": 'preview-count inline-block'
            });
            return _this.div({
              outlet: 'loadingMessage',
              "class": 'inline-block'
            }, function() {
              _this.div({
                "class": 'loading loading-spinner-tiny inline-block'
              });
              return _this.div({
                outlet: 'searchedCountBlock',
                "class": 'inline-block'
              }, function() {
                _this.span({
                  outlet: 'searchedCount',
                  "class": 'searched-count'
                });
                return _this.span(' paths searched');
              });
            });
          });
          return _this.ol({
            outlet: 'resultsList',
            "class": 'search-colors-results results-view list-tree focusable-panel has-collapsable-children native-key-bindings',
            tabindex: -1
          });
        };
      })(this));
    };

    ColorResultsElement.prototype.createdCallback = function() {
      var _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.pathMapping = {};
      this.files = 0;
      this.colors = 0;
      this.loadingMessage.style.display = 'none';
      this.subscriptions.add(this.subscribeTo(this, '.list-nested-item > .list-item', {
        click: function(e) {
          var fileItem;
          e.stopPropagation();
          fileItem = AncestorsMethods.parents(e.target, '.list-nested-item')[0];
          return fileItem.classList.toggle('collapsed');
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this, '.search-result', {
        click: (function(_this) {
          return function(e) {
            var fileItem, matchItem, pathAttribute, range;
            e.stopPropagation();
            matchItem = e.target.matches('.search-result') ? e.target : AncestorsMethods.parents(e.target, '.search-result')[0];
            fileItem = AncestorsMethods.parents(matchItem, '.list-nested-item')[0];
            range = Range.fromObject([matchItem.dataset.start.split(',').map(Number), matchItem.dataset.end.split(',').map(Number)]);
            pathAttribute = fileItem.dataset.path;
            return atom.workspace.open(_this.pathMapping[pathAttribute]).then(function(editor) {
              return editor.setSelectedBufferRange(range, {
                autoscroll: true
              });
            });
          };
        })(this)
      }));
    };

    ColorResultsElement.prototype.setModel = function(colorSearch) {
      this.colorSearch = colorSearch;
      this.subscriptions.add(this.colorSearch.onDidFindMatches((function(_this) {
        return function(result) {
          return _this.addFileResult(result);
        };
      })(this)));
      this.subscriptions.add(this.colorSearch.onDidCompleteSearch((function(_this) {
        return function() {
          return _this.searchComplete();
        };
      })(this)));
      return this.colorSearch.search();
    };

    ColorResultsElement.prototype.addFileResult = function(result) {
      this.files += 1;
      this.colors += result.matches.length;
      this.resultsList.innerHTML += this.createFileResult(result);
      return this.updateMessage();
    };

    ColorResultsElement.prototype.searchComplete = function() {
      this.updateMessage();
      if (this.colors === 0) {
        this.pane.classList.add('no-results');
        return this.pane.appendChild("<ul class='centered background-message no-results-overlay'>\n  <li>No Results</li>\n</ul>");
      }
    };

    ColorResultsElement.prototype.updateMessage = function() {
      var filesString;
      filesString = this.files === 1 ? 'file' : 'files';
      return this.previewCount.innerHTML = this.colors > 0 ? "<span class='text-info'>\n  " + this.colors + " colors\n</span>\nfound in\n<span class='text-info'>\n  " + this.files + " " + filesString + "\n</span>" : "No colors found in " + this.files + " " + filesString;
    };

    ColorResultsElement.prototype.createFileResult = function(fileResult) {
      var fileBasename, filePath, matches, pathAttribute, pathName;
      if (_ == null) {
        _ = require('underscore-plus');
      }
      if (path == null) {
        path = require('path');
      }
      filePath = fileResult.filePath, matches = fileResult.matches;
      fileBasename = path.basename(filePath);
      pathAttribute = _.escapeAttribute(filePath);
      this.pathMapping[pathAttribute] = filePath;
      pathName = atom.project.relativize(filePath);
      return "<li class=\"path list-nested-item\" data-path=\"" + pathAttribute + "\">\n  <div class=\"path-details list-item\">\n    <span class=\"disclosure-arrow\"></span>\n    <span class=\"icon icon-file-text\" data-name=\"" + fileBasename + "\"></span>\n    <span class=\"path-name bright\">" + pathName + "</span>\n    <span class=\"path-match-number\">(" + matches.length + ")</span></div>\n  </div>\n  <ul class=\"matches list-tree\">\n    " + (matches.map((function(_this) {
        return function(match) {
          return _this.createMatchResult(match);
        };
      })(this)).join('')) + "\n  </ul>\n</li>";
    };

    ColorResultsElement.prototype.createMatchResult = function(match) {
      var filePath, lineNumber, matchEnd, matchStart, prefix, range, style, suffix, textColor, _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      textColor = match.color.luma > 0.43 ? 'black' : 'white';
      filePath = match.filePath, range = match.range;
      range = Range.fromObject(range);
      matchStart = range.start.column - match.lineTextOffset;
      matchEnd = range.end.column - match.lineTextOffset;
      prefix = removeLeadingWhitespace(match.lineText.slice(0, matchStart));
      suffix = match.lineText.slice(matchEnd);
      lineNumber = range.start.row + 1;
      style = '';
      style += "background: " + (match.color.toCSS()) + ";";
      style += "color: " + textColor + ";";
      return "<li class=\"search-result list-item\" data-start=\"" + range.start.row + "," + range.start.column + "\" data-end=\"" + range.end.row + "," + range.end.column + "\">\n  <span class=\"line-number text-subtle\">" + lineNumber + "</span>\n  <span class=\"preview\">\n    " + prefix + "\n    <span class='match color-match' style='" + style + "'>" + match.matchText + "</span>\n    " + suffix + "\n  </span>\n</li>";
    };

    return ColorResultsElement;

  })(HTMLElement);

  module.exports = ColorResultsElement = document.registerElement('pigments-color-results', {
    prototype: ColorResultsElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1yZXN1bHRzLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtJQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUdJLEVBSEosRUFDRSxlQURGLEVBQ1MsNkJBRFQsRUFFRSxXQUZGLEVBRUssY0FGTCxDQUFBOztBQUFBLEVBS0EsUUFBb0QsT0FBQSxDQUFRLFlBQVIsQ0FBcEQsRUFBQyxvQkFBQSxXQUFELEVBQWMseUJBQUEsZ0JBQWQsRUFBZ0MseUJBQUEsZ0JBTGhDLENBQUE7O0FBQUEsRUFPQSx1QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtXQUFZLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUF1QixFQUF2QixFQUFaO0VBQUEsQ0FQMUIsQ0FBQTs7QUFBQSxFQVNNO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLG1CQUE3QixDQURBLENBQUE7O0FBQUEsSUFHQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFlBQUwsRUFBbUI7QUFBQSxRQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsUUFBZ0IsT0FBQSxFQUFPLHdCQUF2QjtPQUFuQixFQUFvRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2xFLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsWUFBQSxLQUFDLENBQUEs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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/color-results-element.coffee
