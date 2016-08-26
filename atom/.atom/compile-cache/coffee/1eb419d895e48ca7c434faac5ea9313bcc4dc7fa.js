(function() {
  var KeyEventView, View, charCodeFromKeyIdentifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  charCodeFromKeyIdentifier = require('../helpers').charCodeFromKeyIdentifier;

  module.exports = KeyEventView = (function(_super) {
    __extends(KeyEventView, _super);

    function KeyEventView() {
      return KeyEventView.__super__.constructor.apply(this, arguments);
    }

    KeyEventView.prototype.event = null;

    KeyEventView.prototype.modifiers = null;

    KeyEventView.content = function(params) {
      return this.div({
        "class": 'key-box'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'section-heading icon icon-keyboard'
          }, params.title);
          _this.div({
            "class": 'key-attribute-row'
          }, function() {
            _this.span('Identifier: ');
            return _this.span({
              outlet: 'identifier'
            });
          });
          _this.div({
            "class": 'key-attribute-row'
          }, function() {
            _this.span('Code: ');
            return _this.span({
              outlet: 'code'
            });
          });
          _this.div({
            "class": 'key-attribute-row'
          }, function() {
            _this.span('Char: ');
            return _this.span({
              outlet: 'char'
            });
          });
          return _this.div({
            "class": 'key-attribute-row'
          }, function() {
            _this.span('Modifier: ');
            return _this.span({
              outlet: 'modifier'
            });
          });
        };
      })(this));
    };

    KeyEventView.prototype.setKey = function(keyEvent, modifiers) {
      var k, modifierStack, v, _ref;
      this.event = keyEvent;
      this.modifiers = modifiers;
      this.event.code = charCodeFromKeyIdentifier(this.event.keyIdentifier) || this.event.keyCode || this.event.which;
      this.event.char = String.fromCharCode(this.event.code).toLowerCase();
      this.identifier.text(this.event.keyIdentifier);
      this.code.text(this.event.code);
      this.char.text(this.event.char);
      modifierStack = [];
      _ref = this.modifiers;
      for (k in _ref) {
        v = _ref[k];
        if (v === true) {
          modifierStack.push(k);
        }
      }
      return this.modifier.text(modifierStack.join(' '));
    };

    KeyEventView.prototype.getKey = function() {
      return this.event;
    };

    KeyEventView.prototype.getModifiers = function() {
      return this.modifiers;
    };

    KeyEventView.prototype.clear = function() {
      this.event = null;
      this.modifiers = null;
      this.identifier.text('');
      this.code.text('');
      this.char.text('');
      return this.modifier.text('');
    };

    return KeyEventView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1sb2NhbGl6YXRpb24vbGliL3ZpZXdzL2tleS1ldmVudC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQyw0QkFBNkIsT0FBQSxDQUFRLFlBQVIsRUFBN0IseUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMkJBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSwyQkFDQSxTQUFBLEdBQVcsSUFEWCxDQUFBOztBQUFBLElBR0EsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxTQUFQO09BQUwsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyQixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxvQ0FBUDtXQUFMLEVBQWtELE1BQU0sQ0FBQyxLQUF6RCxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxtQkFBUDtXQUFMLEVBQWlDLFNBQUEsR0FBQTtBQUMvQixZQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLFlBQVI7YUFBTixFQUYrQjtVQUFBLENBQWpDLENBREEsQ0FBQTtBQUFBLFVBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG1CQUFQO1dBQUwsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFlBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsTUFBUjthQUFOLEVBRitCO1VBQUEsQ0FBakMsQ0FKQSxDQUFBO0FBQUEsVUFPQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sbUJBQVA7V0FBTCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxNQUFSO2FBQU4sRUFGK0I7VUFBQSxDQUFqQyxDQVBBLENBQUE7aUJBVUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG1CQUFQO1dBQUwsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFlBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFOLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsVUFBUjthQUFOLEVBRitCO1VBQUEsQ0FBakMsRUFYcUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQURRO0lBQUEsQ0FIVixDQUFBOztBQUFBLDJCQW1CQSxNQUFBLEdBQVEsU0FBQyxRQUFELEVBQVcsU0FBWCxHQUFBO0FBQ04sVUFBQSx5QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxRQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FEYixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsR0FBYyx5QkFBQSxDQUEwQixJQUFDLENBQUEsS0FBSyxDQUFDLGFBQWpDLENBQUEsSUFBbUQsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUExRCxJQUFxRSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBSDFGLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxHQUFjLE1BQU0sQ0FBQyxZQUFQLENBQW9CLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBQyxXQUFqQyxDQUFBLENBSmQsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsYUFBeEIsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQWxCLENBUEEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFsQixDQVJBLENBQUE7QUFBQSxNQVVBLGFBQUEsR0FBZ0IsRUFWaEIsQ0FBQTtBQVdBO0FBQUEsV0FBQSxTQUFBO29CQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUEsS0FBSyxJQUFSO0FBQWtCLFVBQUEsYUFBYSxDQUFDLElBQWQsQ0FBbUIsQ0FBbkIsQ0FBQSxDQUFsQjtTQURGO0FBQUEsT0FYQTthQWFBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLGFBQWEsQ0FBQyxJQUFkLENBQW1CLEdBQW5CLENBQWYsRUFkTTtJQUFBLENBbkJSLENBQUE7O0FBQUEsMkJBbUNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixhQUFPLElBQUMsQ0FBQSxLQUFSLENBRE07SUFBQSxDQW5DUixDQUFBOztBQUFBLDJCQXNDQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osYUFBTyxJQUFDLENBQUEsU0FBUixDQURZO0lBQUEsQ0F0Q2QsQ0FBQTs7QUFBQSwyQkF5Q0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsRUFBakIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxFQUFYLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsRUFBWCxDQUpBLENBQUE7YUFLQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxFQUFmLEVBTks7SUFBQSxDQXpDUCxDQUFBOzt3QkFBQTs7S0FEeUIsS0FKM0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/.atom/packages/keyboard-localization/lib/views/key-event-view.coffee
