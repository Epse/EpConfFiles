'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StatusBarView = (function () {
  function StatusBarView(statusBar) {
    _classCallCheck(this, StatusBarView);

    this.statusBar = statusBar;
    this.elements = {};
    this.tasks = [];

    this.setupView();
    this.tile = this.statusBar.addRightTile({ item: this.elements.root, priority: -1000 });
  }

  _createClass(StatusBarView, [{
    key: 'setupView',
    value: function setupView() {
      this.elements.root = document.createElement('div');
      this.elements.gear = document.createElement('span');

      this.elements.root.classList.add('inline-block', 'busy');
      this.elements.gear.classList.add('icon-gear');

      this.elements.root.appendChild(this.elements.gear);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.tile.destroy();
      this.tooltip && this.tooltip.dispose();
    }
  }, {
    key: 'beginTask',
    value: function beginTask(task) {
      this.tasks.push(_extends({}, task, {
        finished: false
      }));

      this.tasks = this.tasks.slice(-atom.config.get('busy.taskBacklog'));

      this.elements.gear.classList.add('is-busy');

      this.setTooltip();
    }
  }, {
    key: 'endTask',
    value: function endTask(endedTask) {
      var index = this.tasks.findIndex(function (t) {
        return t.uniqueId === endedTask.uniqueId;
      });
      this.tasks[index] = _extends({}, endedTask, { finished: true });

      if (!this.tasks.find(function (t) {
        return !t.finished;
      })) {
        this.elements.gear.classList.remove('is-busy');
      }

      this.setTooltip();
    }
  }, {
    key: 'buildTooltipRow',
    value: function buildTooltipRow(task) {
      var classes = ['icon-gear', 'spin'];
      if (task.finished && task.success) {
        classes = ['icon-check'];
      } else if (task.finished && !task.success) {
        classes = ['icon-x', 'text-error'];
      }

      var durationText = task.finished ? '(' + ((task.time.end - task.time.start) / 1000).toFixed(1) + ' s)' : '';

      return '<span class="' + classes.join(' ') + '"></span> ' + task.description + ' ' + durationText;
    }
  }, {
    key: 'setTooltip',
    value: function setTooltip() {
      this.tooltip && this.tooltip.dispose();
      var title = this.tasks.map(this.buildTooltipRow.bind(this)).join('<br />');
      this.tooltip = atom.tooltips.add(this.elements.root, { title: title });
    }
  }]);

  return StatusBarView;
})();

exports['default'] = StatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idXN5L2xpYi9zdGF0dXMtYmFyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7SUFFUyxhQUFhO0FBRXJCLFdBRlEsYUFBYSxDQUVwQixTQUFTLEVBQUU7MEJBRkosYUFBYTs7QUFHOUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWhCLFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7R0FDeEY7O2VBVGtCLGFBQWE7O1dBV3ZCLHFCQUFHO0FBQ1YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVwRCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6RCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUU5QyxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qzs7O1dBRVEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLGNBQ1YsSUFBSTtBQUNQLGdCQUFRLEVBQUUsS0FBSztTQUNmLENBQUM7O0FBRUgsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzs7QUFFcEUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFNUMsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ25COzs7V0FFTSxpQkFBQyxTQUFTLEVBQUU7QUFDakIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsUUFBUTtPQUFBLENBQUMsQ0FBQztBQUMzRSxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBUSxTQUFTLElBQUUsUUFBUSxFQUFFLElBQUksR0FBRSxDQUFDOztBQUVyRCxVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLENBQUMsUUFBUTtPQUFBLENBQUMsRUFBRTtBQUN0QyxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2hEOztBQUVELFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNuQjs7O1dBRWMseUJBQUMsSUFBSSxFQUFFO0FBQ3BCLFVBQUksT0FBTyxHQUFHLENBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBRSxDQUFDO0FBQ3RDLFVBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFHO0FBQ2xDLGVBQU8sR0FBRyxDQUFFLFlBQVksQ0FBRSxDQUFDO09BQzVCLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUN6QyxlQUFPLEdBQUcsQ0FBRSxRQUFRLEVBQUUsWUFBWSxDQUFFLENBQUM7T0FDdEM7O0FBRUQsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsU0FDNUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBLEdBQUksSUFBSSxDQUFBLENBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFRLEVBQUUsQ0FBQzs7QUFFdEUsK0JBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFhLElBQUksQ0FBQyxXQUFXLFNBQUksWUFBWSxDQUFHO0tBQ3pGOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRyxJQUFJLENBQUMsZUFBZSxNQUFwQixJQUFJLEVBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNqRTs7O1NBcEVrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVzeS9saWIvc3RhdHVzLWJhci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXR1c0JhclZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7fTtcbiAgICB0aGlzLnRhc2tzID0gW107XG5cbiAgICB0aGlzLnNldHVwVmlldygpO1xuICAgIHRoaXMudGlsZSA9IHRoaXMuc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7IGl0ZW06IHRoaXMuZWxlbWVudHMucm9vdCwgcHJpb3JpdHk6IC0xMDAwIH0pO1xuICB9XG5cbiAgc2V0dXBWaWV3KCkge1xuICAgIHRoaXMuZWxlbWVudHMucm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZWxlbWVudHMuZ2VhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICAgIHRoaXMuZWxlbWVudHMucm9vdC5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snLCAnYnVzeScpO1xuICAgIHRoaXMuZWxlbWVudHMuZ2Vhci5jbGFzc0xpc3QuYWRkKCdpY29uLWdlYXInKTtcblxuICAgIHRoaXMuZWxlbWVudHMucm9vdC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRzLmdlYXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnRpbGUuZGVzdHJveSgpO1xuICAgIHRoaXMudG9vbHRpcCAmJiB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpO1xuICB9XG5cbiAgYmVnaW5UYXNrKHRhc2spIHtcbiAgICB0aGlzLnRhc2tzLnB1c2goe1xuICAgICAgLi4udGFzayxcbiAgICAgIGZpbmlzaGVkOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgdGhpcy50YXNrcyA9IHRoaXMudGFza3Muc2xpY2UoLWF0b20uY29uZmlnLmdldCgnYnVzeS50YXNrQmFja2xvZycpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuZ2Vhci5jbGFzc0xpc3QuYWRkKCdpcy1idXN5Jyk7XG5cbiAgICB0aGlzLnNldFRvb2x0aXAoKTtcbiAgfVxuXG4gIGVuZFRhc2soZW5kZWRUYXNrKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnRhc2tzLmZpbmRJbmRleCh0ID0+IHQudW5pcXVlSWQgPT09IGVuZGVkVGFzay51bmlxdWVJZCk7XG4gICAgdGhpcy50YXNrc1tpbmRleF0gPSB7IC4uLmVuZGVkVGFzaywgZmluaXNoZWQ6IHRydWUgfTtcblxuICAgIGlmICghdGhpcy50YXNrcy5maW5kKHQgPT4gIXQuZmluaXNoZWQpKSB7XG4gICAgICB0aGlzLmVsZW1lbnRzLmdlYXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYnVzeScpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0VG9vbHRpcCgpO1xuICB9XG5cbiAgYnVpbGRUb29sdGlwUm93KHRhc2spIHtcbiAgICBsZXQgY2xhc3NlcyA9IFsgJ2ljb24tZ2VhcicsICdzcGluJyBdO1xuICAgIGlmICh0YXNrLmZpbmlzaGVkICYmIHRhc2suc3VjY2VzcyApIHtcbiAgICAgIGNsYXNzZXMgPSBbICdpY29uLWNoZWNrJyBdO1xuICAgIH0gZWxzZSBpZiAodGFzay5maW5pc2hlZCAmJiAhdGFzay5zdWNjZXNzKSB7XG4gICAgICBjbGFzc2VzID0gWyAnaWNvbi14JywgJ3RleHQtZXJyb3InIF07XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb25UZXh0ID0gdGFzay5maW5pc2hlZCA/XG4gICAgICBgKCR7KCh0YXNrLnRpbWUuZW5kIC0gdGFzay50aW1lLnN0YXJ0KSAvIDEwMDApLnRvRml4ZWQoMSl9IHMpYCA6ICcnO1xuXG4gICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cIiR7Y2xhc3Nlcy5qb2luKCcgJyl9XCI+PC9zcGFuPiAke3Rhc2suZGVzY3JpcHRpb259ICR7ZHVyYXRpb25UZXh0fWA7XG4gIH1cblxuICBzZXRUb29sdGlwKCkge1xuICAgIHRoaXMudG9vbHRpcCAmJiB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpO1xuICAgIGNvbnN0IHRpdGxlID0gdGhpcy50YXNrcy5tYXAoOjp0aGlzLmJ1aWxkVG9vbHRpcFJvdykuam9pbignPGJyIC8+Jyk7XG4gICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcy5lbGVtZW50cy5yb290LCB7IHRpdGxlIH0pO1xuICB9XG59XG4iXX0=