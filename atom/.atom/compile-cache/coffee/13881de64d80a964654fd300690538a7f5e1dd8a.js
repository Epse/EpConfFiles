(function() {
  var CompositeDisposable, Emitter, OutputPanel, OutputPanelElement, _ref;

  OutputPanelElement = require('./views/output-panel');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  module.exports = OutputPanel = (function() {
    function OutputPanel(state, results) {
      var pos, _ref1, _ref2;
      this.state = state != null ? state : {};
      this.results = results;
      this.disposables = new CompositeDisposable;
      pos = atom.config.get('ide-haskell.panelPosition');
      this.element = (new OutputPanelElement).setModel(this);
      this.element.setPanelPosition(pos);
      this.panel = atom.workspace.addPanel(pos, {
        item: this,
        visible: (_ref1 = (_ref2 = this.state) != null ? _ref2.visibility : void 0) != null ? _ref1 : true
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
      var progress, status, _ref1;
      status = _arg.status, progress = _arg.progress;
      this.element.statusChanged({
        status: status,
        oldStatus: (_ref1 = this.status) != null ? _ref1 : 'ready'
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9pZGUtaGFza2VsbC9saWIvb3V0cHV0LXBhbmVsL291dHB1dC1wYW5lbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUVBQUE7O0FBQUEsRUFBQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsc0JBQVIsQ0FBckIsQ0FBQTs7QUFBQSxFQUNBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUR0QixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUUsS0FBRixFQUFlLE9BQWYsR0FBQTtBQUNYLFVBQUEsaUJBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSx3QkFBQSxRQUFRLEVBQ3JCLENBQUE7QUFBQSxNQUR5QixJQUFDLENBQUEsVUFBQSxPQUMxQixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQUZOLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyxHQUFBLENBQUEsa0JBQUQsQ0FBd0IsQ0FBQyxRQUF6QixDQUFrQyxJQUFsQyxDQUpYLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsR0FBMUIsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBZixDQUF3QixHQUF4QixFQUNQO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFFBQ0EsT0FBQSx1RkFBOEIsSUFEOUI7T0FETyxDQVBULENBQUE7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

//# sourceURL=/home/epse/.atom/packages/ide-haskell/lib/output-panel/output-panel.coffee
