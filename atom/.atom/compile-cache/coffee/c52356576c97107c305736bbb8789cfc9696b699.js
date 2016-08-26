(function() {
  var KeymapTableView, ScrollView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScrollView = require('atom-space-pen-views').ScrollView;

  module.exports = KeymapTableView = (function(_super) {
    __extends(KeymapTableView, _super);

    function KeymapTableView() {
      return KeymapTableView.__super__.constructor.apply(this, arguments);
    }

    KeymapTableView.prototype.mapTable = {};

    KeymapTableView.prototype.keymapChangeCallback = null;

    KeymapTableView.content = function() {
      return this.section({
        "class": 'map-table-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'section-heading pull-left icon icon-code'
          }, 'Key-Mappings');
          _this.div({
            "class": 'btn-group pull-right'
          }, function() {
            _this.div({
              "class": 'btn btn-clipboard icon-clippy',
              click: 'saveToClipboard'
            }, ' clipboard');
            return _this.div({
              "class": 'btn btn-clear icon icon-trashcan',
              click: 'clear'
            }, 'clear');
          });
          return _this.pre({
            "class": 'map-table',
            outlet: 'mapTableView'
          });
        };
      })(this));
    };

    KeymapTableView.prototype.addKeyMapping = function(down, modifier, press, isAccentKey) {
      var modIdentifier;
      modIdentifier = 'unshifted';
      if (modifier.shift) {
        modIdentifier = 'shifted';
      }
      if (modifier.altgr) {
        modIdentifier = 'alted';
      }
      if (modifier.shift && modifier.altgr) {
        modIdentifier = 'altshifted';
      }
      if (this.mapTable[down.code] == null) {
        this.mapTable[down.code] = {};
      }
      if (isAccentKey) {
        this.mapTable[down.code]['accent'] = true;
      }
      this.mapTable[down.code][modIdentifier] = press.code;
      if (this.keymapChangeCallback) {
        this.keymapChangeCallback(this.mapTable);
      }
      return this.render();
    };

    KeymapTableView.prototype.render = function() {
      return this.mapTableView.text(JSON.stringify(this.mapTable, void 0, 4));
    };

    KeymapTableView.prototype.getKeymap = function() {
      return this.mapTable;
    };

    KeymapTableView.prototype.saveToClipboard = function() {
      var input;
      console.log('clipboard');
      input = document.createElement('textarea');
      document.body.appendChild(input);
      input.value = JSON.stringify(this.mapTable, void 0, 4);
      input.focus();
      input.select();
      document.execCommand('Copy');
      return input.remove();
    };


    /*
    saveToFile: ->
      console.log 'save'
    
    saveToGithub: ->
      console.log 'github'
     */

    KeymapTableView.prototype.onKeymapChange = function(keymapChangeCallback) {
      return this.keymapChangeCallback = keymapChangeCallback;
    };

    KeymapTableView.prototype.clear = function() {
      this.mapTable = {};
      this.render();
      if (this.keymapChangeCallback) {
        return this.keymapChangeCallback(this.mapTable);
      }
    };

    return KeymapTableView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL3ZpZXdzL2tleW1hcC10YWJsZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsc0JBQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDhCQUFBLFFBQUEsR0FBVSxFQUFWLENBQUE7O0FBQUEsOEJBQ0Esb0JBQUEsR0FBc0IsSUFEdEIsQ0FBQTs7QUFBQSxJQUdBLGVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLE9BQUQsQ0FBUztBQUFBLFFBQUEsT0FBQSxFQUFNLGlCQUFOO09BQVQsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNoQyxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTywwQ0FBUDtXQUFMLEVBQXdELGNBQXhELENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFNLHNCQUFOO1dBQUwsRUFBbUMsU0FBQSxHQUFBO0FBRWpDLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFNLCtCQUFOO0FBQUEsY0FBdUMsS0FBQSxFQUFNLGlCQUE3QzthQUFMLEVBQXFFLFlBQXJFLENBQUEsQ0FBQTttQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU0sa0NBQU47QUFBQSxjQUEwQyxLQUFBLEVBQU0sT0FBaEQ7YUFBTCxFQUE4RCxPQUE5RCxF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

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/views/keymap-table-view.coffee
