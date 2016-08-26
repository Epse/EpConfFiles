(function() {
  var CompositeDisposable, MainMenuLabel, Point, UPI, UPIInstance, getEventType, _ref, _ref1;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Point = _ref.Point;

  _ref1 = require('./utils'), MainMenuLabel = _ref1.MainMenuLabel, getEventType = _ref1.getEventType;

  module.exports = UPI = (function() {
    function UPI(pluginManager) {
      this.pluginManager = pluginManager;
    }


    /*
    Call this function in consumer to get actual interface
    
    disposables: CompositeDisposable, one you will return in consumer
     */

    UPI.prototype.registerPlugin = function(disposables) {
      return new UPIInstance(this.pluginManager, disposables);
    };

    return UPI;

  })();

  UPIInstance = (function() {
    function UPIInstance(pluginManager, disposables) {
      this.pluginManager = pluginManager;
      disposables.add(this.disposables = new CompositeDisposable);
    }


    /*
    Adds new sumbenu to 'Haskell IDE' menu item
    name -- submenu label, should be descriptive of a package
    menu -- Atom menu object
    
    Returns Disposable.
     */

    UPIInstance.prototype.setMenu = function(name, menu) {
      var menuDisp;
      this.disposables.add(menuDisp = atom.menu.add([
        {
          label: MainMenuLabel,
          submenu: [
            {
              label: name,
              submenu: menu
            }
          ]
        }
      ]));
      return menuDisp;
    };


    /*
    Sets backend status
    status -- object
      status: one of 'progress', 'ready', 'error', 'warning'
      progress: float between 0 and 1, only relevant when status is 'progress'
                if 0 or undefined, progress bar is not shown
     */

    UPIInstance.prototype.setStatus = function(status) {
      return this.pluginManager.outputView.backendStatus(status);
    };


    /*
    Add messages to ide-haskell output
    messages: Array of Object
      uri: String, File URI message relates to
      position: Point, or Point-like Object, position to which message relates
      message: String or {<text | html>, highlighter?}, message
      severity: String, one of 'error', 'warning', 'lint', 'build',
                or user-defined, see `setMessageTypes`
    types: Array of String, containing possible message `severity`. If undefined,
           will be taken from `messages`
     */

    UPIInstance.prototype.addMessages = function(messages, types) {
      messages = messages.map(function(m) {
        if (m.position != null) {
          m.position = Point.fromObject(m.position);
        }
        return m;
      });
      return this.pluginManager.checkResults.appendResults(messages, types);
    };


    /*
    Set messages in ide-haskell output. Clears all existing messages with
    `severity` in `types`
    messages: Array of Object
      uri: String, File URI message relates to
      position: Point, or Point-like Object, position to which message relates
      message: String, message
      severity: String, one of 'error', 'warning', 'lint', 'build',
                or user-defined, see `setMessageTypes`
    types: Array of String, containing possible message `severity`. If undefined,
           will be taken from `messages`
     */

    UPIInstance.prototype.setMessages = function(messages, types) {
      messages = messages.map(function(m) {
        if (m.position != null) {
          m.position = Point.fromObject(m.position);
        }
        return m;
      });
      return this.pluginManager.checkResults.setResults(messages, types);
    };


    /*
    Clear all existing messages with `severity` in `types`
    This is shorthand from `setMessages([],types)`
     */

    UPIInstance.prototype.clearMessages = function(types) {
      return this.pluginManager.checkResults.setResults([], types);
    };


    /*
    Set possible message `severity` that your package will use.
    types: Object with keys representing possible message `severity` (i.e. tab name)
           and values being Objects with keys
      uriFilter: Bool, should uri filter apply to tab?
      autoScroll: Bool, should tab auto-scroll?
    
    This allows to define custom output panel tabs.
     */

    UPIInstance.prototype.setMessageTypes = function(types) {
      var opts, type, _results;
      _results = [];
      for (type in types) {
        opts = types[type];
        _results.push(this.pluginManager.outputView.createTab(type, opts));
      }
      return _results;
    };


    /*
    Editor event subscription. Fires when mouse cursor stopped over a symbol in
    editor.
    
    callback: callback(editor, crange, type)
      editor: TextEditor, editor that generated event
      crange: Range, cursor range that generated event.
      type: One of 'mouse', 'selection' -- type of event that triggered this
    
      Returns {range, text} or Promise.
        range: Range, tooltip highlighting range
        text: tooltip text. String or {text, highlighter} or {html}
          text: tooltip text
          highlighter: grammar scope that will be used to highlight tooltip text
          html: html to be displayed in tooltip
    
    returns Disposable
     */

    UPIInstance.prototype.onShouldShowTooltip = function(callback) {
      var disp;
      this.disposables.add(disp = this.pluginManager.onShouldShowTooltip((function(_this) {
        return function(_arg) {
          var editor, eventType, pos;
          editor = _arg.editor, pos = _arg.pos, eventType = _arg.eventType;
          return _this.showTooltip({
            editor: editor,
            pos: pos,
            eventType: eventType,
            tooltip: function(crange) {
              var res;
              res = callback(editor, crange, eventType);
              if (res != null) {
                return Promise.resolve(res);
              } else {
                return Promise.reject({
                  ignore: true
                });
              }
            }
          });
        };
      })(this)));
      return disp;
    };


    /*
    Show tooltip in editor.
    
    editor: editor that will show tooltip
    pos: tooltip position
    eventType: one of 'context', 'keyboard' and 'mouse'
    detail: for automatic selection between 'context' and 'keyboard'.
            Ignored if 'eventType' is set.
    tooltip: function(crange)
      crange: Range, currently selected range in editor (possibly empty)
    
      Returns {range, text} or Promise
        range: Range, tooltip highlighting range
        text: tooltip text. String or {text, highlighter} or {html}
          text: tooltip text
          highlighter: grammar scope that will be used to highlight tooltip text
          html: html to be displayed in tooltip
     */

    UPIInstance.prototype.showTooltip = function(_arg) {
      var controller, detail, editor, eventType, pos, tooltip;
      editor = _arg.editor, pos = _arg.pos, eventType = _arg.eventType, detail = _arg.detail, tooltip = _arg.tooltip;
      controller = this.pluginManager.controller(editor);
      return this.withEventRange({
        controller: controller,
        pos: pos,
        detail: detail,
        eventType: eventType
      }, (function(_this) {
        return function(_arg1) {
          var crange, eventType, pos;
          crange = _arg1.crange, pos = _arg1.pos, eventType = _arg1.eventType;
          return tooltip(crange).then(function(_arg2) {
            var range, text;
            range = _arg2.range, text = _arg2.text;
            return controller.showTooltip(pos, range, text, {
              eventType: eventType,
              subtype: 'external'
            });
          })["catch"](function(status) {
            if (status == null) {
              status = {
                status: 'warning'
              };
            }
            if (status instanceof Error) {
              console.warn(status);
              status = {
                status: 'warning'
              };
            }
            if (!status.ignore) {
              controller.hideTooltip({
                eventType: eventType
              });
              return _this.setStatus(status);
            }
          });
        };
      })(this));
    };


    /*
    Convenience function. Will fire before Haskell buffer is saved.
    
    callback: callback(buffer)
      buffer: TextBuffer, buffer that generated event
    
    Returns Disposable
     */

    UPIInstance.prototype.onWillSaveBuffer = function(callback) {
      var disp;
      this.disposables.add(disp = this.pluginManager.onWillSaveBuffer(callback));
      return disp;
    };


    /*
    Convenience function. Will fire after Haskell buffer is saved.
    
    callback: callback(buffer)
      buffer: TextBuffer, buffer that generated event
    
    Returns Disposable
     */

    UPIInstance.prototype.onDidSaveBuffer = function(callback) {
      var disp;
      this.disposables.add(disp = this.pluginManager.onDidSaveBuffer(callback));
      return disp;
    };

    UPIInstance.prototype.onDidStopChanging = function(callback) {
      var disp;
      this.disposables.add(disp = this.pluginManager.onDidStopChanging(callback));
      return disp;
    };


    /*
    Add a new control to ouptut panel heading.
    
    element: HTMLElement of control, or String with tag name
    opts: various options
      id: String, id
      events: Object, event callbacks, key is event name, e.g. "click",
              value is callback
      classes: Array of String, classes
      style: Object, css style, keys are style attributes, values are values
      attrs: Object, other attributes, keys are attribute names, values are values
      before: String, CSS selector of element, that this one should be inserted
              before, e.g. '#progressBar'
    
    Returns Disposable.
     */

    UPIInstance.prototype.addPanelControl = function(element, opts) {
      return this.pluginManager.outputView.addPanelControl(element, opts);
    };


    /*
    Utility function to extract event range/type for a given event
    
    editor: TextEditor, editor that generated event
    detail: event detail, ignored if eventType is set
    eventType: String, event type, one of 'keyboard', 'context', 'mouse'
    pos: Point, or Point-like Object, event position, can be undefined
    controller: leave undefined, this is internal field
    
    callback: callback({pos, crange}, eventType)
      pos: Point, event position
      crange: Range, event range
      eventType: String, event type, one of 'keyboard', 'context', 'mouse'
     */

    UPIInstance.prototype.withEventRange = function(_arg, callback) {
      var controller, detail, editor, eventType, pos;
      editor = _arg.editor, detail = _arg.detail, eventType = _arg.eventType, pos = _arg.pos, controller = _arg.controller;
      if (pos != null) {
        pos = Point.fromObject(pos);
      }
      if (eventType == null) {
        eventType = getEventType(detail);
      }
      if (controller == null) {
        controller = this.pluginManager.controller(editor);
      }
      if (controller == null) {
        return;
      }
      return callback(controller.getEventRange(pos, eventType));
    };

    return UPIInstance;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvdXBpLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzRkFBQTs7QUFBQSxFQUFBLE9BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsYUFBQSxLQUF0QixDQUFBOztBQUFBLEVBQ0EsUUFBZ0MsT0FBQSxDQUFRLFNBQVIsQ0FBaEMsRUFBQyxzQkFBQSxhQUFELEVBQWdCLHFCQUFBLFlBRGhCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxhQUFFLGFBQUYsR0FBQTtBQUFrQixNQUFqQixJQUFDLENBQUEsZ0JBQUEsYUFBZ0IsQ0FBbEI7SUFBQSxDQUFiOztBQUVBO0FBQUE7Ozs7T0FGQTs7QUFBQSxrQkFPQSxjQUFBLEdBQWdCLFNBQUMsV0FBRCxHQUFBO2FBQ1YsSUFBQSxXQUFBLENBQVksSUFBQyxDQUFBLGFBQWIsRUFBNEIsV0FBNUIsRUFEVTtJQUFBLENBUGhCLENBQUE7O2VBQUE7O01BTEYsQ0FBQTs7QUFBQSxFQWVNO0FBQ1MsSUFBQSxxQkFBRSxhQUFGLEVBQWlCLFdBQWpCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxnQkFBQSxhQUNiLENBQUE7QUFBQSxNQUFBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUEvQixDQUFBLENBRFc7SUFBQSxDQUFiOztBQUdBO0FBQUE7Ozs7OztPQUhBOztBQUFBLDBCQVVBLE9BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFDUCxVQUFBLFFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixRQUFBLEdBQVcsSUFBSSxDQUFD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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/upi.coffee
