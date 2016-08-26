(function() {
  var $, GitTimeplot, GitTimeplotPopup, RevisionView, View, d3, moment, _, _ref;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  moment = require('moment');

  d3 = require('d3');

  GitTimeplotPopup = require('./git-timeplot-popup');

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplot = (function() {
    function GitTimeplot(element) {
      this.element = element;
      this.$element = $(this.element);
      this._debouncedRenderPopup = _.debounce(this._renderPopup, 50);
      this._debouncedHidePopup = _.debounce(this._hidePopup, 50);
      this._debouncedViewNearestRevision = _.debounce(this._viewNearestRevision, 100);
    }

    GitTimeplot.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.popup) != null ? _ref1.remove() : void 0;
    };

    GitTimeplot.prototype.show = function() {};

    GitTimeplot.prototype.render = function(editor, commitData) {
      var svg, _ref1;
      this.editor = editor;
      this.commitData = commitData;
      if ((_ref1 = this.popup) != null) {
        _ref1.remove();
      }
      this.file = this.editor.getPath();
      this.$timeplot = this.$element.find('.timeplot');
      if (this.$timeplot.length <= 0) {
        this.$timeplot = $("<div class='timeplot'>");
        this.$element.append(this.$timeplot);
      }
      if (this.commitData.length <= 0) {
        this.$timeplot.html("<div class='placeholder'>No commits, nothing to see here.</div>");
        return;
      }
      svg = d3.select(this.$timeplot.get(0)).append("svg").attr("width", this.$element.width()).attr("height", 100);
      this._renderAxis(svg);
      this._renderBlobs(svg);
      this._renderHoverMarker();
      return this.$timeplot;
    };

    GitTimeplot.prototype._renderAxis = function(svg) {
      var h, left_pad, maxDate, maxHour, minDate, minHour, pad, w, xAxis, yAxis;
      w = this.$element.width();
      h = 100;
      left_pad = 20;
      pad = 20;
      minDate = moment.unix(this.commitData[this.commitData.length - 1].authorDate).toDate();
      maxDate = moment.unix(this.commitData[0].authorDate).toDate();
      minHour = d3.min(this.commitData.map(function(d) {
        return moment.unix(d.authorDate).hour();
      }));
      maxHour = d3.max(this.commitData.map(function(d) {
        return moment.unix(d.authorDate).hour();
      }));
      this.x = d3.time.scale().domain([minDate, maxDate]).range([left_pad, w - pad]);
      this.y = d3.scale.linear().domain([minHour, maxHour]).range([10, h - pad * 2]);
      xAxis = d3.svg.axis().scale(this.x).orient("bottom");
      yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(0);
      svg.append("g").attr("class", "axis").attr("transform", "translate(0, " + (h - pad) + ")").call(xAxis);
      return svg.append("g").attr("class", "axis").attr("transform", "translate(" + (left_pad - pad) + ", 0)").call(yAxis);
    };

    GitTimeplot.prototype._renderBlobs = function(svg) {
      var max_r, r;
      max_r = d3.max(this.commitData.map(function(d) {
        return d.linesAdded + d.linesDeleted;
      }));
      r = d3.scale.linear().domain([0, max_r]).range([3, 15]);
      return svg.selectAll("circle").data(this.commitData).enter().append("circle").attr("class", "circle").attr("cx", (function(_this) {
        return function(d) {
          return _this.x(moment.unix(d.authorDate).toDate());
        };
      })(this)).attr("cy", (function(_this) {
        return function(d) {
          return _this.y(moment.unix(d.authorDate).hour());
        };
      })(this)).transition().duration(500).attr("r", function(d) {
        return r(d.linesAdded + d.linesDeleted || 0);
      });
    };

    GitTimeplot.prototype._renderHoverMarker = function() {
      var _this;
      this.$hoverMarker = this.$element.find('.hover-marker');
      if (!(this.$hoverMarker.length > 0)) {
        this.$hoverMarker = $("<div class='hover-marker'>");
        this.$element.append(this.$hoverMarker);
      }
      _this = this;
      this.$element.mouseenter(function(e) {
        return _this._onMouseenter(e);
      });
      this.$element.mousemove(function(e) {
        return _this._onMousemove(e);
      });
      this.$element.mouseleave(function(e) {
        return _this._onMouseleave(e);
      });
      this.$element.mousedown(function(e) {
        return _this._onMousedown(e);
      });
      return this.$element.mouseup(function(e) {
        return _this._onMouseup(e);
      });
    };

    GitTimeplot.prototype._onMouseenter = function(evt) {
      return this.isMouseInElement = true;
    };

    GitTimeplot.prototype._onMousemove = function(evt) {
      var relativeX;
      relativeX = evt.clientX - this.$element.offset().left;
      if (relativeX < this.$hoverMarker.offset().left) {
        this.$hoverMarker.css('left', relativeX);
      } else {
        this.$hoverMarker.css('left', relativeX - this.$hoverMarker.width());
      }
      if (this.isMouseDown) {
        this._hidePopup({
          force: true
        });
        return this._debouncedViewNearestRevision();
      } else {
        return this._debouncedRenderPopup();
      }
    };

    GitTimeplot.prototype._onMouseleave = function(evt) {
      this.isMouseInElement = false;
      this._debouncedHidePopup();
      return this.isMouseDown = false;
    };

    GitTimeplot.prototype._onMousedown = function(evt) {
      this.isMouseDown = true;
      this._hidePopup({
        force: true
      });
      return this._debouncedViewNearestRevision();
    };

    GitTimeplot.prototype._onMouseup = function(evt) {
      return this.isMouseDown = false;
    };

    GitTimeplot.prototype._renderPopup = function() {
      var commits, end, left, start, _ref1, _ref2, _ref3;
      if ((_ref1 = this.popup) != null ? _ref1.isMouseInPopup() : void 0) {
        left = this.popup.offset().left - this.$element.offset().left;
        if (this._popupRightAligned) {
          left += this.popup.width() + 7;
        }
        this.$hoverMarker.css({
          'left': left
        });
        return;
      }
      if (!this.isMouseInElement) {
        return;
      }
      if ((_ref2 = this.popup) != null) {
        _ref2.hide().remove();
      }
      _ref3 = this._filterCommitData(this.commitData), commits = _ref3[0], start = _ref3[1], end = _ref3[2];
      this.popup = new GitTimeplotPopup(commits, this.editor, start, end);
      left = this.$hoverMarker.offset().left;
      if (left + this.popup.outerWidth() + 10 > this.$element.offset().left + this.$element.width()) {
        this._popupRightAligned = true;
        left -= this.popup.width() + 7;
      } else {
        this._popupRightAligned = false;
      }
      return this.popup.css({
        left: left,
        top: this.$element.offset().top - this.popup.height() - 10
      });
    };

    GitTimeplot.prototype._hidePopup = function(options) {
      var _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        force: false
      });
      if (!options.force && (((_ref1 = this.popup) != null ? _ref1.isMouseInPopup() : void 0) || this.isMouseInElement)) {
        return;
      }
      return (_ref2 = this.popup) != null ? _ref2.hide().remove() : void 0;
    };

    GitTimeplot.prototype._filterCommitData = function() {
      var commits, left, relativeLeft, tEnd, tStart;
      left = this.$hoverMarker.offset().left;
      relativeLeft = left - this.$element.offset().left - 5;
      tStart = moment(this.x.invert(relativeLeft)).startOf('hour').subtract(1, 'minute');
      tEnd = moment(this.x.invert(relativeLeft + 10)).endOf('hour').add(1, 'minute');
      commits = _.filter(this.commitData, function(c) {
        return moment.unix(c.authorDate).isBetween(tStart, tEnd);
      });
      return [commits, tStart, tEnd];
    };

    GitTimeplot.prototype._getNearestCommit = function() {
      var filteredCommitData, tEnd, tStart, _ref1;
      _ref1 = this._filterCommitData(), filteredCommitData = _ref1[0], tStart = _ref1[1], tEnd = _ref1[2];
      if ((filteredCommitData != null ? filteredCommitData.length : void 0) > 0) {
        return filteredCommitData[0];
      } else {
        return _.find(this.commitData, function(c) {
          return moment.unix(c.authorDate).isBefore(tEnd);
        });
      }
    };

    GitTimeplot.prototype._viewNearestRevision = function() {
      var nearestCommit;
      nearestCommit = this._getNearestCommit();
      if (nearestCommit != null) {
        return RevisionView.showRevision(this.editor, nearestCommit.hash);
      }
    };

    return GitTimeplot;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZXBsb3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLHlFQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQUxuQixDQUFBOztBQUFBLEVBTUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxxQkFBUixDQU5mLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUVSLElBQUEscUJBQUUsT0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLElBQUMsQ0FBQSxPQUFILENBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLHFCQUFELEdBQXlCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLFlBQVosRUFBMEIsRUFBMUIsQ0FEekIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0IsRUFBeEIsQ0FGdkIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLDZCQUFELEdBQWlDLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxD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

//# sourceURL=/home/epse/.atom/packages/git-time-machine/lib/git-timeplot.coffee
