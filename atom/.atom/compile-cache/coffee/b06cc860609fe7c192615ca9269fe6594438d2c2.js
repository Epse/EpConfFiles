(function() {
  var ColorBuffer, ColorBufferElement, ColorMarker, ColorMarkerElement, ColorProject, ColorProjectElement, ColorResultsElement, ColorSearch, Disposable, Palette, PaletteElement, PigmentsAPI, PigmentsProvider, VariablesCollection, uris, url, _ref;

  _ref = [], Palette = _ref[0], PaletteElement = _ref[1], ColorSearch = _ref[2], ColorResultsElement = _ref[3], ColorProject = _ref[4], ColorProjectElement = _ref[5], ColorBuffer = _ref[6], ColorBufferElement = _ref[7], ColorMarker = _ref[8], ColorMarkerElement = _ref[9], VariablesCollection = _ref[10], PigmentsProvider = _ref[11], PigmentsAPI = _ref[12], Disposable = _ref[13], url = _ref[14], uris = _ref[15];

  module.exports = {
    activate: function(state) {
      var convertMethod, copyMethod;
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      this.patchAtom();
      this.project = state.project != null ? ColorProject.deserialize(state.project) : new ColorProject();
      atom.commands.add('atom-workspace', {
        'pigments:find-colors': (function(_this) {
          return function() {
            return _this.findColors();
          };
        })(this),
        'pigments:show-palette': (function(_this) {
          return function() {
            return _this.showPalette();
          };
        })(this),
        'pigments:project-settings': (function(_this) {
          return function() {
            return _this.showSettings();
          };
        })(this),
        'pigments:reload': (function(_this) {
          return function() {
            return _this.reloadProjectVariables();
          };
        })(this),
        'pigments:report': (function(_this) {
          return function() {
            return _this.createPigmentsReport();
          };
        })(this)
      });
      convertMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, editor;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              editor.getCursors().forEach(function(cursor) {
                var marker;
                marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
                return action(marker);
              });
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      copyMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, cursor, editor, marker;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              cursor = editor.getLastCursor();
              marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
              action(marker);
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      atom.commands.add('atom-text-editor', {
        'pigments:convert-to-hex': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHex();
          }
        }),
        'pigments:convert-to-rgb': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGB();
          }
        }),
        'pigments:convert-to-rgba': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGBA();
          }
        }),
        'pigments:convert-to-hsl': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSL();
          }
        }),
        'pigments:convert-to-hsla': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSLA();
          }
        }),
        'pigments:copy-as-hex': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHex();
          }
        }),
        'pigments:copy-as-rgb': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGB();
          }
        }),
        'pigments:copy-as-rgba': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGBA();
          }
        }),
        'pigments:copy-as-hsl': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSL();
          }
        }),
        'pigments:copy-as-hsla': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSLA();
          }
        })
      });
      atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var host, protocol, _ref1;
          url || (url = require('url'));
          _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host;
          if (protocol !== 'pigments:') {
            return;
          }
          switch (host) {
            case 'search':
              return _this.project.findAllColors();
            case 'palette':
              return _this.project.getPalette();
            case 'settings':
              return atom.views.getView(_this.project);
          }
        };
      })(this));
      return atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Pigments',
            submenu: [
              {
                label: 'Convert to hexadecimal',
                command: 'pigments:convert-to-hex'
              }, {
                label: 'Convert to RGB',
                command: 'pigments:convert-to-rgb'
              }, {
                label: 'Convert to RGBA',
                command: 'pigments:convert-to-rgba'
              }, {
                label: 'Convert to HSL',
                command: 'pigments:convert-to-hsl'
              }, {
                label: 'Convert to HSLA',
                command: 'pigments:convert-to-hsla'
              }, {
                type: 'separator'
              }, {
                label: 'Copy as hexadecimal',
                command: 'pigments:copy-as-hex'
              }, {
                label: 'Copy as RGB',
                command: 'pigments:copy-as-rgb'
              }, {
                label: 'Copy as RGBA',
                command: 'pigments:copy-as-rgba'
              }, {
                label: 'Copy as HSL',
                command: 'pigments:copy-as-hsl'
              }, {
                label: 'Copy as HSLA',
                command: 'pigments:copy-as-hsla'
              }
            ],
            shouldDisplay: (function(_this) {
              return function(event) {
                return _this.shouldDisplayContextMenu(event);
              };
            })(this)
          }
        ]
      });
    },
    deactivate: function() {
      var _ref1;
      return (_ref1 = this.getProject()) != null ? typeof _ref1.destroy === "function" ? _ref1.destroy() : void 0 : void 0;
    },
    provideAutocomplete: function() {
      if (PigmentsProvider == null) {
        PigmentsProvider = require('./pigments-provider');
      }
      return new PigmentsProvider(this);
    },
    provideAPI: function() {
      if (PigmentsAPI == null) {
        PigmentsAPI = require('./pigments-api');
      }
      return new PigmentsAPI(this.getProject());
    },
    consumeColorPicker: function(api) {
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      this.getProject().setColorPickerAPI(api);
      return new Disposable((function(_this) {
        return function() {
          return _this.getProject().setColorPickerAPI(null);
        };
      })(this));
    },
    consumeColorExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getColorExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    consumeVariableExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getVariableExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    deserializePalette: function(state) {
      if (Palette == null) {
        Palette = require('./palette');
      }
      return Palette.deserialize(state);
    },
    deserializeColorSearch: function(state) {
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      return ColorSearch.deserialize(state);
    },
    deserializeColorProject: function(state) {
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      return ColorProject.deserialize(state);
    },
    deserializeColorProjectElement: function(state) {
      var element, subscription;
      if (ColorProjectElement == null) {
        ColorProjectElement = require('./color-project-element');
      }
      element = new ColorProjectElement;
      if (this.project != null) {
        element.setModel(this.getProject());
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              return element.setModel(_this.getProject());
            }
          };
        })(this));
      }
      return element;
    },
    deserializeVariablesCollection: function(state) {
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      return VariablesCollection.deserialize(state);
    },
    pigmentsViewProvider: function(model) {
      var element;
      element = model instanceof (ColorBuffer != null ? ColorBuffer : ColorBuffer = require('./color-buffer')) ? (ColorBufferElement != null ? ColorBufferElement : ColorBufferElement = require('./color-buffer-element'), element = new ColorBufferElement) : model instanceof (ColorMarker != null ? ColorMarker : ColorMarker = require('./color-marker')) ? (ColorMarkerElement != null ? ColorMarkerElement : ColorMarkerElement = require('./color-marker-element'), element = new ColorMarkerElement) : model instanceof (ColorSearch != null ? ColorSearch : ColorSearch = require('./color-search')) ? (ColorResultsElement != null ? ColorResultsElement : ColorResultsElement = require('./color-results-element'), element = new ColorResultsElement) : model instanceof (ColorProject != null ? ColorProject : ColorProject = require('./color-project')) ? (ColorProjectElement != null ? ColorProjectElement : ColorProjectElement = require('./color-project-element'), element = new ColorProjectElement) : model instanceof (Palette != null ? Palette : Palette = require('./palette')) ? (PaletteElement != null ? PaletteElement : PaletteElement = require('./palette-element'), element = new PaletteElement) : void 0;
      if (element != null) {
        element.setModel(model);
      }
      return element;
    },
    shouldDisplayContextMenu: function(event) {
      this.lastEvent = event;
      setTimeout(((function(_this) {
        return function() {
          return _this.lastEvent = null;
        };
      })(this)), 10);
      return this.colorMarkerForMouseEvent(event) != null;
    },
    colorMarkerForMouseEvent: function(event) {
      var colorBuffer, colorBufferElement, editor;
      editor = atom.workspace.getActiveTextEditor();
      colorBuffer = this.project.colorBufferForEditor(editor);
      colorBufferElement = atom.views.getView(colorBuffer);
      return colorBufferElement != null ? colorBufferElement.colorMarkerForMouseEvent(event) : void 0;
    },
    serialize: function() {
      return {
        project: this.project.serialize()
      };
    },
    getProject: function() {
      return this.project;
    },
    findColors: function() {
      var pane;
      if (uris == null) {
        uris = require('./uris');
      }
      pane = atom.workspace.paneForURI(uris.SEARCH);
      pane || (pane = atom.workspace.getActivePane());
      return atom.workspace.openURIInPane(uris.SEARCH, pane, {});
    },
    showPalette: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.PALETTE);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.PALETTE, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    showSettings: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.SETTINGS);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.SETTINGS, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    reloadProjectVariables: function() {
      return this.project.reload();
    },
    createPigmentsReport: function() {
      return atom.workspace.open('pigments-report.json').then((function(_this) {
        return function(editor) {
          return editor.setText(_this.createReport());
        };
      })(this));
    },
    createReport: function() {
      var o;
      o = {
        atom: atom.getVersion(),
        pigments: atom.packages.getLoadedPackage('pigments').metadata.version,
        platform: require('os').platform(),
        config: atom.config.get('pigments'),
        project: {
          config: {
            sourceNames: this.project.sourceNames,
            searchNames: this.project.searchNames,
            ignoredNames: this.project.ignoredNames,
            ignoredScopes: this.project.ignoredScopes,
            includeThemes: this.project.includeThemes,
            ignoreGlobalSourceNames: this.project.ignoreGlobalSourceNames,
            ignoreGlobalSearchNames: this.project.ignoreGlobalSearchNames,
            ignoreGlobalIgnoredNames: this.project.ignoreGlobalIgnoredNames,
            ignoreGlobalIgnoredScopes: this.project.ignoreGlobalIgnoredScopes
          },
          paths: this.project.getPaths(),
          variables: {
            colors: this.project.getColorVariables().length,
            total: this.project.getVariables().length
          }
        }
      };
      return JSON.stringify(o, null, 2).replace(RegExp("" + (atom.project.getPaths().join('|')), "g"), '<root>');
    },
    patchAtom: function() {
      var HighlightComponent, TextEditorPresenter, requireCore, _buildHighlightRegions, _updateHighlightRegions;
      requireCore = function(name) {
        return require(Object.keys(require.cache).filter(function(s) {
          return s.indexOf(name) > -1;
        })[0]);
      };
      HighlightComponent = requireCore('highlights-component');
      TextEditorPresenter = requireCore('text-editor-presenter');
      if (TextEditorPresenter.getTextInScreenRange == null) {
        TextEditorPresenter.prototype.getTextInScreenRange = function(screenRange) {
          if (this.displayLayer != null) {
            return this.model.getTextInRange(this.displayLayer.translateScreenRange(screenRange));
          } else {
            return this.model.getTextInRange(this.model.bufferRangeForScreenRange(screenRange));
          }
        };
        _buildHighlightRegions = TextEditorPresenter.prototype.buildHighlightRegions;
        TextEditorPresenter.prototype.buildHighlightRegions = function(screenRange) {
          var regions;
          regions = _buildHighlightRegions.call(this, screenRange);
          if (regions.length === 1) {
            regions[0].text = this.getTextInScreenRange(screenRange);
          } else {
            regions[0].text = this.getTextInScreenRange([screenRange.start, [screenRange.start.row, Infinity]]);
            regions[regions.length - 1].text = this.getTextInScreenRange([[screenRange.end.row, 0], screenRange.end]);
            if (regions.length > 2) {
              regions[1].text = this.getTextInScreenRange([[screenRange.start.row + 1, 0], [screenRange.end.row - 1, Infinity]]);
            }
          }
          return regions;
        };
        _updateHighlightRegions = HighlightComponent.prototype.updateHighlightRegions;
        return HighlightComponent.prototype.updateHighlightRegions = function(id, newHighlightState) {
          var i, newRegionState, regionNode, _i, _len, _ref1, _ref2, _results;
          _updateHighlightRegions.call(this, id, newHighlightState);
          if ((_ref1 = newHighlightState["class"]) != null ? _ref1.match(/^pigments-native-background\s/) : void 0) {
            _ref2 = newHighlightState.regions;
            _results = [];
            for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
              newRegionState = _ref2[i];
              regionNode = this.regionNodesByHighlightId[id][i];
              if (newRegionState.text != null) {
                _results.push(regionNode.textContent = newRegionState.text);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9waWdtZW50cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK09BQUE7O0FBQUEsRUFBQSxPQVNJLEVBVEosRUFDRSxpQkFERixFQUNXLHdCQURYLEVBRUUscUJBRkYsRUFFZSw2QkFGZixFQUdFLHNCQUhGLEVBR2dCLDZCQUhoQixFQUlFLHFCQUpGLEVBSWUsNEJBSmYsRUFLRSxxQkFMRixFQUtlLDRCQUxmLEVBTUUsOEJBTkYsRUFNdUIsMkJBTnZCLEVBTXlDLHNCQU56QyxFQU9FLHFCQVBGLEVBUUUsY0FSRixFQVFPLGVBUlAsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEseUJBQUE7O1FBQUEsZUFBZ0IsT0FBQSxDQUFRLGlCQUFSO09BQWhCO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBRkEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQUQsR0FBYyxxQkFBSCxHQUNULFlBQVksQ0FBQyxXQUFiLENBQXlCLEtBQUssQ0FBQyxPQUEvQixDQURTLEdBR0wsSUFBQSxZQUFBLENBQUEsQ0FQTixDQUFBO0FBQUEsTUFTQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ0U7QUFBQSxRQUFBLHNCQUFBLEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO0FBQUEsUUFDQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/lib/pigments.coffee
