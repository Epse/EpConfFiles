(function() {
  var AbstractProvider, ClassProvider,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AbstractProvider = require('./abstract-provider');

  module.exports = ClassProvider = (function(_super) {
    __extends(ClassProvider, _super);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    ClassProvider.prototype.hoverEventSelectors = '.entity.inherited-class, .support.namespace, .support.class, .comment-clickable .region';

    ClassProvider.prototype.clickEventSelectors = '.entity.inherited-class, .support.namespace, .support.class';

    ClassProvider.prototype.gotoRegex = /^\\?[A-Z][A-za-z0-9_]*(\\[A-Z][A-Za-z0-9_])*$/;


    /**
     * Goto the class from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    ClassProvider.prototype.gotoFromWord = function(editor, term) {
      var classInfo, classesResponse, matches, proxy, regexMatches;
      if (term === void 0 || term.indexOf('$') === 0) {
        return;
      }
      term = this.parser.getFullClassName(editor, term);
      proxy = require('../services/php-proxy.coffee');
      classesResponse = proxy.classes();
      if (!classesResponse.autocomplete) {
        return;
      }
      this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
      matches = this.fuzzaldrin.filter(classesResponse.autocomplete, term);
      if (matches[0] === term) {
        regexMatches = /(?:\\)(\w+)$/i.exec(matches[0]);
        if (regexMatches === null || regexMatches.length === 0) {
          this.jumpWord = matches[0];
        } else {
          this.jumpWord = regexMatches[1];
        }
        classInfo = proxy.methods(matches[0]);
        return atom.workspace.open(classInfo.filename, {
          searchAllPanes: true
        });
      }
    };


    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    ClassProvider.prototype.getSelectorFromEvent = function(event) {
      return this.parser.getClassSelectorFromEvent(event);
    };


    /**
     * Goes through all the lines within the editor looking for classes within comments. More specifically if they have
     * @var, @param or @return prefixed.
     *
     * @param  {TextEditor} editor The editor to search through.
     */

    ClassProvider.prototype.registerMarkers = function(editor) {
      var key, regex, row, rows, text, _results;
      text = editor.getText();
      rows = text.split('\n');
      _results = [];
      for (key in rows) {
        row = rows[key];
        regex = /@param|@var|@return|@throws|@see/gi;
        if (regex.test(row)) {
          _results.push(this.addMarkerToCommentLine(row.split(' '), parseInt(key), editor, true));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through
     */

    ClassProvider.prototype.cleanMarkers = function(editor) {
      var i, marker, _ref;
      _ref = this.allMarkers[editor.getLongTitle()];
      for (i in _ref) {
        marker = _ref[i];
        marker.destroy();
      }
      return this.allMarkers = [];
    };


    /**
     * Analyses the words array given for any classes and then creates a marker for them.
     *
     * @param {array} words           The array of words to check.
     * @param {int} rowIndex          The current row the words are on within the editor.
     * @param {TextEditor} editor     The editor the words are from.
     * @param {bool} shouldBreak      Flag to say whether the search should break after finding 1 class.
     * @param {int} currentIndex  = 0 The current column index the search is on.
     * @param {int} offset        = 0 Any offset that should be applied when creating the marker.
     */

    ClassProvider.prototype.addMarkerToCommentLine = function(words, rowIndex, editor, shouldBreak, currentIndex, offset) {
      var key, keywordRegex, marker, markerProperties, options, range, regex, value, _results;
      if (currentIndex == null) {
        currentIndex = 0;
      }
      if (offset == null) {
        offset = 0;
      }
      _results = [];
      for (key in words) {
        value = words[key];
        regex = /^\\?([A-Za-z0-9_]+)\\?([A-Za-zA-Z_\\]*)?/g;
        keywordRegex = /^(array|object|bool|string|static|null|boolean|void|int|integer|mixed|callable)$/gi;
        if (value && regex.test(value) && keywordRegex.test(value) === false) {
          if (value.includes('|')) {
            this.addMarkerToCommentLine(value.split('|'), rowIndex, editor, false, currentIndex, parseInt(key));
          } else {
            range = [[rowIndex, currentIndex + parseInt(key) + offset], [rowIndex, currentIndex + parseInt(key) + value.length + offset]];
            marker = editor.markBufferRange(range);
            markerProperties = {
              term: value
            };
            marker.setProperties(markerProperties);
            options = {
              type: 'highlight',
              "class": 'comment-clickable comment'
            };
            if (!marker.isDestroyed()) {
              editor.decorateMarker(marker, options);
            }
            if (this.allMarkers[editor.getLongTitle()] === void 0) {
              this.allMarkers[editor.getLongTitle()] = [];
            }
            this.allMarkers[editor.getLongTitle()].push(marker);
          }
          if (shouldBreak === true) {
            break;
          }
        }
        _results.push(currentIndex += value.length);
      }
      return _results;
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param  {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    ClassProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("^(class|interface|abstractclass|trait) +" + term, "i");
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9jbGFzcy1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUFuQixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNGLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw0QkFBQSxtQkFBQSxHQUFxQix5RkFBckIsQ0FBQTs7QUFBQSw0QkFDQSxtQkFBQSxHQUFxQiw2REFEckIsQ0FBQTs7QUFBQSw0QkFFQSxTQUFBLEdBQVcsK0NBRlgsQ0FBQTs7QUFJQTtBQUFBOzs7OztPQUpBOztBQUFBLDRCQVVBLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFULEdBQUE7QUFDVixVQUFBLHdEQUFBO0FBQUEsTUFBQSxJQUFHLElBQUEsS0FBUSxNQUFSLElBQXFCLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEtBQXFCLENBQTdDO0FBQ0ksY0FBQSxDQURKO09BQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLElBQWpDLENBSFAsQ0FBQTtBQUFBLE1BS0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUixDQUxSLENBQUE7QUFBQSxNQU1BLGVBQUEsR0FBa0IsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQU5sQixDQUFBO0FBUUEsTUFBQSxJQUFBLENBQUEsZUFBNkIsQ0FBQyxZQUE5QjtBQUFBLGNBQUEsQ0FBQTtPQVJBO0FBQUEsTUFVQSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/goto/class-provider.coffee
