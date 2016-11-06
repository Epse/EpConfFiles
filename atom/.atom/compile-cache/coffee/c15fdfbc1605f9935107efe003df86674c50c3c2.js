(function() {
  var OutputPanelElement, OutputPanelView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = OutputPanelView = (function(_super) {
    __extends(OutputPanelView, _super);

    function OutputPanelView() {
      return OutputPanelView.__super__.constructor.apply(this, arguments);
    }

    OutputPanelView.prototype.setModel = function(model) {
      var _ref, _ref1, _ref2;
      this.model = model;
      this.disposables.add(this.model.results.onDidUpdate((function(_this) {
        return function(_arg) {
          var types;
          types = _arg.types;
          if (atom.config.get('ide-haskell.switchTabOnCheck')) {
            _this.activateFirstNonEmptyTab(types);
          }
          return _this.updateItems();
        };
      })(this)));
      this.items.setModel(this.model.results);
      if (((_ref = this.model.state) != null ? _ref.height : void 0) != null) {
        this.style.height = this.model.state.height;
      }
      if (((_ref1 = this.model.state) != null ? _ref1.width : void 0) != null) {
        this.style.width = this.model.state.width;
      }
      this.activateTab((_ref2 = this.model.state.activeTab) != null ? _ref2 : this.buttons.buttonNames()[0]);
      this.buttons.setFileFilter(this.model.state.fileFilter);
      return this;
    };

    OutputPanelView.prototype.createdCallback = function() {
      var OutputPanelButtonsElement, OutputPanelItemsElement, ProgressBar, SubAtom;
      SubAtom = require('sub-atom');
      this.disposables = new SubAtom;
      this.appendChild(this.resizeHandle = document.createElement('resize-handle'));
      this.initResizeHandle();
      this.appendChild(this.heading = document.createElement('ide-haskell-panel-heading'));
      this.disposables.add(this.addPanelControl('ide-haskell-status-icon', {
        id: 'status',
        attrs: {
          'data-status': 'ready'
        }
      }));
      OutputPanelButtonsElement = require('./output-panel-buttons');
      this.disposables.add(this.addPanelControl(new OutputPanelButtonsElement, {
        id: 'buttons'
      }));
      ProgressBar = require('./progress-bar');
      this.disposables.add(this.addPanelControl(new ProgressBar, {
        id: 'progressBar'
      }));
      this.progressBar.setProgress(0);
      OutputPanelItemsElement = require('./output-panel-items');
      this.appendChild(this.items = new OutputPanelItemsElement);
      this.disposables.add(this.buttons.onButtonClicked((function(_this) {
        return function() {
          return _this.updateItems();
        };
      })(this)));
      this.disposables.add(this.buttons.onCheckboxSwitched((function(_this) {
        return function() {
          return _this.updateItems();
        };
      })(this)));
      return this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          if (_this.buttons.getFileFilter()) {
            return _this.updateItems();
          }
        };
      })(this)));
    };

    OutputPanelView.prototype.addPanelControl = function(element, _arg) {
      var Disposable, SubAtom, a, action, attrs, before, classes, cls, disp, event, events, id, s, style, v, _i, _len;
      events = _arg.events, classes = _arg.classes, style = _arg.style, attrs = _arg.attrs, before = _arg.before, id = _arg.id;
      Disposable = require('atom').Disposable;
      if ((id != null) && this[id]) {
        return new Disposable(function() {});
      }
      if (typeof element === 'string') {
        element = document.createElement(element);
      }
      if (id != null) {
        element.id = id;
        this[id] = element;
      }
      SubAtom = require('sub-atom');
      disp = new SubAtom;
      disp.add(new Disposable(function() {
        if (id != null) {
          delete this[id];
        }
        element.remove();
        return typeof element.destroy === "function" ? element.destroy() : void 0;
      }));
      if (classes != null) {
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          cls = classes[_i];
          element.classList.add(cls);
        }
      }
      if (style != null) {
        for (s in style) {
          v = style[s];
          element.style.setProperty(s, v);
        }
      }
      if (attrs != null) {
        for (a in attrs) {
          v = attrs[a];
          element.setAttribute(a, v);
        }
      }
      if (events != null) {
        for (event in events) {
          action = events[event];
          disp.add(element, event, action);
        }
      }
      if (before != null) {
        before = this.heading.querySelector(before);
      }
      if (before != null) {
        before.parentElement.insertBefore(element, before);
      } else {
        this.heading.appendChild(element);
      }
      this.disposables.add(disp);
      return disp;
    };


    /*
    Note: can't use detachedCallback here, since when panel
    is reattached, it is called, and panel items are
    detached
     */

    OutputPanelView.prototype.destroy = function() {
      this.remove();
      this.items.destroy();
      return this.disposables.dispose();
    };

    OutputPanelView.prototype.setPanelPosition = function(pos) {
      this.pos = pos;
      return this.setAttribute('data-pos', this.pos);
    };

    OutputPanelView.prototype.initResizeHandle = function() {
      return this.disposables.add(this.resizeHandle, 'mousedown', (function(_this) {
        return function(e) {
          var dir, doDrag, startHeight, startWidth, startX, startY, stopDrag;
          doDrag = (function() {
            switch (this.pos) {
              case 'top':
              case 'bottom':
                startY = e.clientY;
                startHeight = parseInt(document.defaultView.getComputedStyle(this).height, 10);
                dir = (function() {
                  switch (this.pos) {
                    case 'top':
                      return 1;
                    case 'bottom':
                      return -1;
                  }
                }).call(this);
                return (function(_this) {
                  return function(e) {
                    return _this.style.height = (startHeight + dir * (e.clientY - startY)) + 'px';
                  };
                })(this);
              case 'left':
              case 'right':
                startX = e.clientX;
                startWidth = parseInt(document.defaultView.getComputedStyle(this).width, 10);
                dir = (function() {
                  switch (this.pos) {
                    case 'left':
                      return 1;
                    case 'right':
                      return -1;
                  }
                }).call(this);
                return (function(_this) {
                  return function(e) {
                    return _this.style.width = (startWidth + dir * (e.clientX - startX)) + 'px';
                  };
                })(this);
            }
          }).call(_this);
          stopDrag = function(e) {
            document.documentElement.removeEventListener('mousemove', doDrag);
            return document.documentElement.removeEventListener('mouseup', stopDrag);
          };
          document.documentElement.addEventListener('mousemove', doDrag);
          return document.documentElement.addEventListener('mouseup', stopDrag);
        };
      })(this));
    };

    OutputPanelView.prototype.updateItems = function() {
      var activeTab, btn, f, filter, scroll, uri, _i, _len, _ref, _ref1, _results;
      activeTab = this.getActiveTab();
      filter = {
        severity: activeTab
      };
      if (this.buttons.getFileFilter()) {
        uri = (_ref = atom.workspace.getActiveTextEditor()) != null ? typeof _ref.getPath === "function" ? _ref.getPath() : void 0 : void 0;
        if ((uri != null) && this.buttons.options(activeTab).uriFilter) {
          filter.uri = uri;
        }
      }
      scroll = this.buttons.options(activeTab).autoScroll && this.items.atEnd();
      this.items.filter(filter);
      if (scroll) {
        this.items.scrollToEnd();
      }
      _ref1 = this.buttons.buttonNames();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        btn = _ref1[_i];
        f = {
          severity: btn
        };
        if ((uri != null) && this.buttons.options(btn).uriFilter) {
          f.uri = uri;
        }
        _results.push(this.buttons.setCount(btn, this.model.results.filter(f).length));
      }
      return _results;
    };

    OutputPanelView.prototype.activateTab = function(tab) {
      return this.buttons.clickButton(tab);
    };

    OutputPanelView.prototype.activateFirstNonEmptyTab = function(types) {
      var name, _i, _len, _ref, _results;
      _ref = this.buttons.buttonNames();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if ((types != null ? __indexOf.call(types, name) >= 0 : true)) {
          if ((this.model.results.filter({
            severity: name
          })).length > 0) {
            this.activateTab(name);
            break;
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    };

    OutputPanelView.prototype.statusChanged = function(_arg) {
      var oldStatus, prio, status;
      status = _arg.status, oldStatus = _arg.oldStatus;
      prio = {
        progress: 0,
        error: 20,
        warning: 10,
        ready: 0
      };
      if (prio[status] >= prio[oldStatus] || status === 'progress') {
        return this.status.setAttribute('data-status', status);
      }
    };

    OutputPanelView.prototype.showItem = function(item) {
      this.activateTab(item.severity);
      return this.items.showItem(item);
    };

    OutputPanelView.prototype.getActiveTab = function() {
      return this.buttons.getActive();
    };

    OutputPanelView.prototype.createTab = function(name, opts) {
      if (__indexOf.call(this.buttons.buttonNames(), name) < 0) {
        this.buttons.createButton(name, opts);
      }
      if (this.getActiveTab() == null) {
        return this.activateTab(this.buttons.buttonNames()[0]);
      }
    };

    OutputPanelView.prototype.setProgress = function(progress) {
      return this.progressBar.setProgress(progress);
    };

    return OutputPanelView;

  })(HTMLElement);

  OutputPanelElement = document.registerElement('ide-haskell-panel', {
    prototype: OutputPanelView.prototype
  });

  module.exports = OutputPanelElement;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvdmlld3Mvb3V0cHV0LXBhbmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQ0FBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsOEJBQUEsUUFBQSxHQUFVLFNBQUUsS0FBRixHQUFBO0FBQ1IsVUFBQSxrQkFBQTtBQUFBLE1BRFMsSUFBQyxDQUFBLFFBQUEsS0FDVixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBZixDQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDMUMsY0FBQSxLQUFBO0FBQUEsVUFENEMsUUFBRCxLQUFDLEtBQzVDLENBQUE7QUFBQSxVQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFIO0FBQ0UsWUFBQSxLQUFDLENBQUEsd0JBQUQsQ0FBMEIsS0FBMUIsQ0FBQSxDQURGO1dBQUE7aUJBRUEsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUgwQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLENBQWpCLENBQUEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBdkIsQ0FKQSxDQUFBO0FBTUEsTUFBQSxJQUF1QyxrRUFBdkM7QUFBQSxRQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQixJQUFDLENB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/views/output-panel.coffee
