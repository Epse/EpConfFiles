(function() {
  var CompositeDisposable, EventsDelegation, Palette, PaletteElement, SpacePenDSL, StickyTitle, THEME_VARIABLES, pigments, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  _ref1 = [], CompositeDisposable = _ref1[0], THEME_VARIABLES = _ref1[1], pigments = _ref1[2], Palette = _ref1[3], StickyTitle = _ref1[4];

  PaletteElement = (function(_super) {
    __extends(PaletteElement, _super);

    function PaletteElement() {
      return PaletteElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(PaletteElement);

    EventsDelegation.includeInto(PaletteElement);

    PaletteElement.content = function() {
      var group, merge, optAttrs, sort;
      sort = atom.config.get('pigments.sortPaletteColors');
      group = atom.config.get('pigments.groupPaletteColors');
      merge = atom.config.get('pigments.mergeColorDuplicates');
      optAttrs = function(bool, name, attrs) {
        if (bool) {
          attrs[name] = name;
        }
        return attrs;
      };
      return this.div({
        "class": 'pigments-palette-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'pigments-palette-controls settings-view pane-item'
          }, function() {
            return _this.div({
              "class": 'pigments-palette-controls-wrapper'
            }, function() {
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Sort Colors');
                return _this.select({
                  outlet: 'sort',
                  id: 'sort-palette-colors'
                }, function() {
                  _this.option(optAttrs(sort === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  _this.option(optAttrs(sort === 'by name', 'selected', {
                    value: 'by name'
                  }), 'By Name');
                  return _this.option(optAttrs(sort === 'by file', 'selected', {
                    value: 'by color'
                  }), 'By Color');
                });
              });
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Group Colors');
                return _this.select({
                  outlet: 'group',
                  id: 'group-palette-colors'
                }, function() {
                  _this.option(optAttrs(group === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  return _this.option(optAttrs(group === 'by file', 'selected', {
                    value: 'by file'
                  }), 'By File');
                });
              });
              return _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.input(optAttrs(merge, 'checked', {
                  type: 'checkbox',
                  id: 'merge-duplicates',
                  outlet: 'merge'
                }));
                return _this.label({
                  "for": 'merge-duplicates'
                }, 'Merge Duplicates');
              });
            });
          });
          return _this.div({
            "class": 'pigments-palette-list native-key-bindings',
            tabindex: -1
          }, function() {
            return _this.ol({
              outlet: 'list'
            });
          });
        };
      })(this));
    };

    PaletteElement.prototype.createdCallback = function() {
      var subscription;
      if (pigments == null) {
        pigments = require('./pigments');
      }
      this.project = pigments.getProject();
      if (this.project != null) {
        return this.init();
      } else {
        return subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pigments.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    };

    PaletteElement.prototype.init = function() {
      if (this.project.isDestroyed()) {
        return;
      }
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (_this.palette != null) {
            _this.palette.variables = _this.project.getColorVariables();
            if (_this.attached) {
              return _this.renderList();
            }
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sortPaletteColors', (function(_this) {
        return function(sortPaletteColors) {
          _this.sortPaletteColors = sortPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.groupPaletteColors', (function(_this) {
        return function(groupPaletteColors) {
          _this.groupPaletteColors = groupPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.mergeColorDuplicates', (function(_this) {
        return function(mergeColorDuplicates) {
          _this.mergeColorDuplicates = mergeColorDuplicates;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this.sort, {
        'change': function(e) {
          return atom.config.set('pigments.sortPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.group, {
        'change': function(e) {
          return atom.config.set('pigments.groupPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.merge, {
        'change': function(e) {
          return atom.config.set('pigments.mergeColorDuplicates', e.target.checked);
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this.list, '[data-variable-id]', {
        'click': (function(_this) {
          return function(e) {
            var variable, variableId;
            variableId = Number(e.target.dataset.variableId);
            variable = _this.project.getVariableById(variableId);
            return _this.project.showVariableInFile(variable);
          };
        })(this)
      }));
    };

    PaletteElement.prototype.attachedCallback = function() {
      if (this.palette != null) {
        this.renderList();
      }
      return this.attached = true;
    };

    PaletteElement.prototype.detachedCallback = function() {
      this.subscriptions.dispose();
      return this.attached = false;
    };

    PaletteElement.prototype.getModel = function() {
      return this.palette;
    };

    PaletteElement.prototype.setModel = function(palette) {
      this.palette = palette;
      if (this.attached) {
        return this.renderList();
      }
    };

    PaletteElement.prototype.getColorsList = function(palette) {
      switch (this.sortPaletteColors) {
        case 'by color':
          return palette.sortedByColor();
        case 'by name':
          return palette.sortedByName();
        default:
          return palette.variables.slice();
      }
    };

    PaletteElement.prototype.renderList = function() {
      var file, li, ol, palette, palettes, _ref2;
      if ((_ref2 = this.stickyTitle) != null) {
        _ref2.dispose();
      }
      this.list.innerHTML = '';
      if (this.groupPaletteColors === 'by file') {
        if (StickyTitle == null) {
          StickyTitle = require('./sticky-title');
        }
        palettes = this.getFilesPalettes();
        for (file in palettes) {
          palette = palettes[file];
          li = document.createElement('li');
          li.className = 'pigments-color-group';
          ol = document.createElement('ol');
          li.appendChild(this.getGroupHeader(atom.project.relativize(file)));
          li.appendChild(ol);
          this.buildList(ol, this.getColorsList(palette));
          this.list.appendChild(li);
        }
        return this.stickyTitle = new StickyTitle(this.list.querySelectorAll('.pigments-color-group-header-content'), this.querySelector('.pigments-palette-list'));
      } else {
        return this.buildList(this.list, this.getColorsList(this.palette));
      }
    };

    PaletteElement.prototype.getGroupHeader = function(label) {
      var content, header;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      header = document.createElement('div');
      header.className = 'pigments-color-group-header';
      content = document.createElement('div');
      content.className = 'pigments-color-group-header-content';
      if (label === THEME_VARIABLES) {
        content.textContent = 'Atom Themes';
      } else {
        content.textContent = label;
      }
      header.appendChild(content);
      return header;
    };

    PaletteElement.prototype.getFilesPalettes = function() {
      var palettes;
      if (Palette == null) {
        Palette = require('./palette');
      }
      palettes = {};
      this.palette.eachColor((function(_this) {
        return function(variable) {
          var path;
          path = variable.path;
          if (palettes[path] == null) {
            palettes[path] = new Palette([]);
          }
          return palettes[path].variables.push(variable);
        };
      })(this));
      return palettes;
    };

    PaletteElement.prototype.buildList = function(container, paletteColors) {
      var color, html, id, li, line, name, path, variables, _i, _j, _len, _len1, _ref2, _results;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      paletteColors = this.checkForDuplicates(paletteColors);
      _results = [];
      for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
        variables = paletteColors[_i];
        li = document.createElement('li');
        li.className = 'pigments-color-item';
        color = variables[0].color;
        if (color.toCSS == null) {
          continue;
        }
        html = "<div class=\"pigments-color\">\n  <span class=\"pigments-color-preview\"\n        style=\"background-color: " + (color.toCSS()) + "\">\n  </span>\n  <span class=\"pigments-color-properties\">\n    <span class=\"pigments-color-component\"><strong>R:</strong> " + (Math.round(color.red)) + "</span>\n    <span class=\"pigments-color-component\"><strong>G:</strong> " + (Math.round(color.green)) + "</span>\n    <span class=\"pigments-color-component\"><strong>B:</strong> " + (Math.round(color.blue)) + "</span>\n    <span class=\"pigments-color-component\"><strong>A:</strong> " + (Math.round(color.alpha * 1000) / 1000) + "</span>\n  </span>\n</div>\n<div class=\"pigments-color-details\">";
        for (_j = 0, _len1 = variables.length; _j < _len1; _j++) {
          _ref2 = variables[_j], name = _ref2.name, path = _ref2.path, line = _ref2.line, id = _ref2.id;
          html += "<span class=\"pigments-color-occurence\">\n    <span class=\"name\">" + name + "</span>";
          if (path !== THEME_VARIABLES) {
            html += "<span data-variable-id=\"" + id + "\">\n  <span class=\"path\">" + (atom.project.relativize(path)) + "</span>\n  <span class=\"line\">at line " + (line + 1) + "</span>\n</span>";
          }
          html += '</span>';
        }
        html += '</div>';
        li.innerHTML = html;
        _results.push(container.appendChild(li));
      }
      return _results;
    };

    PaletteElement.prototype.checkForDuplicates = function(paletteColors) {
      var colors, findColor, key, map, results, v, _i, _len;
      results = [];
      if (this.mergeColorDuplicates) {
        map = new Map();
        colors = [];
        findColor = function(color) {
          var col, _i, _len;
          for (_i = 0, _len = colors.length; _i < _len; _i++) {
            col = colors[_i];
            if (typeof col.isEqual === "function" ? col.isEqual(color) : void 0) {
              return col;
            }
          }
        };
        for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
          v = paletteColors[_i];
          if (key = findColor(v.color)) {
            map.get(key).push(v);
          } else {
            map.set(v.color, [v]);
            colors.push(v.color);
          }
        }
        map.forEach(function(vars, color) {
          return results.push(vars);
        });
        return results;
      } else {
        return (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = paletteColors.length; _j < _len1; _j++) {
            v = paletteColors[_j];
            _results.push([v]);
          }
          return _results;
        })();
      }
    };

    return PaletteElement;

  })(HTMLElement);

  module.exports = PaletteElement = registerOrUpdateElement('pigments-palette', PaletteElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYWxldHRlLWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlKQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUEyRCxPQUFBLENBQVEsWUFBUixDQUEzRCxFQUFDLG1CQUFBLFdBQUQsRUFBYyx3QkFBQSxnQkFBZCxFQUFnQywrQkFBQSx1QkFBaEMsQ0FBQTs7QUFBQSxFQUVBLFFBQXlFLEVBQXpFLEVBQUMsOEJBQUQsRUFBc0IsMEJBQXRCLEVBQXVDLG1CQUF2QyxFQUFpRCxrQkFBakQsRUFBMEQsc0JBRjFELENBQUE7O0FBQUEsRUFJTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLGNBQXhCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGNBQTdCLENBREEsQ0FBQTs7QUFBQSxJQUdBLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSw0QkFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FBUCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQURSLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLENBRlIsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEdBQUE7QUFDVCxRQUFBLElBQXNCLElBQXRCO0FBQUEsVUFBQSxLQUFNLENBQUEsSUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/palette-element.coffee
