(function() {
  var OutputPanel;

  module.exports = OutputPanel = (function() {
    function OutputPanel(state, results) {
      var CompositeDisposable, OutputPanelElement, pos, _ref, _ref1;
      this.state = state != null ? state : {};
      this.results = results;
      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable;
      pos = atom.config.get('ide-haskell.panelPosition');
      OutputPanelElement = require('./views/output-panel');
      this.element = (new OutputPanelElement).setModel(this);
      this.element.setPanelPosition(pos);
      this.panel = atom.workspace.addPanel(pos, {
        item: this,
        visible: (_ref = (_ref1 = this.state) != null ? _ref1.visibility : void 0) != null ? _ref : true
      });
      atom.config.onDidChange('ide-haskell.panelPosition', (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          _this.element.setPanelPosition(newValue);
          return atom.workspace.addPanel(newValue, {
            item: _this
          });
        };
      })(this));
      this.disposables.add(this.results.onDidUpdate((function(_this) {
        return function() {
          return _this.currentResult = null;
        };
      })(this)));
      this.backendStatus({
        status: 'ready'
      });
    }

    OutputPanel.prototype.toggle = function() {
      if (this.panel.isVisible()) {
        return this.panel.hide();
      } else {
        return this.panel.show();
      }
    };

    OutputPanel.prototype.destroy = function() {
      this.disposables.dispose();
      this.panel.destroy();
      return this.element.destroy();
    };

    OutputPanel.prototype.createTab = function(name, opts) {
      return this.element.createTab(name, opts);
    };

    OutputPanel.prototype.serialize = function() {
      return {
        visibility: this.panel.isVisible(),
        height: this.element.style.height,
        width: this.element.style.width,
        activeTab: this.element.getActiveTab(),
        fileFilter: this.element.buttons.getFileFilter()
      };
    };

    OutputPanel.prototype.addPanelControl = function(element, opts) {
      return this.element.addPanelControl(element, opts);
    };

    OutputPanel.prototype.backendStatus = function(_arg) {
      var progress, status, _ref;
      status = _arg.status, progress = _arg.progress;
      this.element.statusChanged({
        status: status,
        oldStatus: (_ref = this.status) != null ? _ref : 'ready'
      });
      this.status = status;
      if (status !== 'progress') {
        if (progress == null) {
          progress = 0;
        }
      }
      if (progress != null) {
        return this.element.setProgress(progress);
      }
    };

    OutputPanel.prototype.showNextError = function() {
      var rs;
      rs = this.results.resultsWithURI();
      if (rs.length === 0) {
        return;
      }
      if (this.currentResult != null) {
        this.currentResult++;
      } else {
        this.currentResult = 0;
      }
      if (this.currentResult >= rs.length) {
        this.currentResult = 0;
      }
      return this.element.showItem(rs[this.currentResult]);
    };

    OutputPanel.prototype.showPrevError = function() {
      var rs;
      rs = this.results.resultsWithURI();
      if (rs.length === 0) {
        return;
      }
      if (this.currentResult != null) {
        this.currentResult--;
      } else {
        this.currentResult = rs.length - 1;
      }
      if (this.currentResult < 0) {
        this.currentResult = rs.length - 1;
      }
      return this.element.showItem(rs[this.currentResult]);
    };

    return OutputPanel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2lkZS1oYXNrZWxsL2xpYi9vdXRwdXQtcGFuZWwvb3V0cHV0LXBhbmVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUUsS0FBRixFQUFlLE9BQWYsR0FBQTtBQUNYLFVBQUEseURBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSx3QkFBQSxRQUFRLEVBQ3JCLENBQUE7QUFBQSxNQUR5QixJQUFDLENBQUEsVUFBQSxPQUMxQixDQUFBO0FBQUEsTUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBRGYsQ0FBQTtBQUFBLE1BR0EsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsQ0FITixDQUFBO0FBQUEsTUFLQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsc0JBQVIsQ0FMckIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFDLEdBQUEsQ0FBQSxrQkFBRCxDQUF3QixDQUFDLFFBQXpCLENBQWtDLElBQWxDLENBTlgsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixHQUExQixDQVBBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQXdCLEdBQXhCLEVBQ1A7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsUUFDQSxPQUFBLHFGQUE4QixJQUQ5QjtPQURPLENBVFQsQ0FBQTtBQUFBLE1BYUEsSUFB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/ide-haskell/lib/output-panel/output-panel.coffee
