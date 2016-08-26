'use babel';
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module atom:linter-markdown
 * @fileoverview Linter.
 */

var Configuration = require('remark/lib/cli/configuration.js');
var loadPlugin = require('load-plugin');

/* Lazy loading these */
var remark = null;
var lint = null;

/**
 * Linter-markdown.
 *
 * @return {LinterConfiguration}
 */
function linter() {
  var CODE_EXPRESSION = /`([^`]+)`/g;

  /**
   * Transform a (stringified) vfile range to a linter
   * nested-tuple.
   *
   * @param {Object} location - Positional information.
   * @return {Array.<Array.<number>>} - Linter range.
   */
  function toRange(location) {
    var result = [[Number(location.start.line) - 1, Number(location.start.column) - 1]];

    result[1] = [location.end.line ? Number(location.end.line) - 1 : result[0][0], location.end.column ? Number(location.end.column) - 1 : result[0][1]];

    return result;
  }

  /**
   * Transform a reason for warning from remark into
   * pretty HTML.
   *
   * @param {string} reason - Messsage in plain-text.
   * @return {string} - Messsage in HTML.
   */
  function toHTML(reason) {
    return reason.replace(CODE_EXPRESSION, '<code>$1</code>');
  }

  /**
   * Transform VFile messages
   * nested-tuple.
   *
   * @see https://github.com/wooorm/vfile#vfilemessage
   *
   * @param {VFileMessage} message - Virtual file error.
   * @return {Object} - Linter error.
   */
  function transform(message) {
    var reason = toHTML(message.reason);

    return {
      type: 'Error',
      html: '<span class="badge badge-flexible">' + message.ruleId + '</span> ' + reason,
      filePath: this.getPath(),
      range: toRange(message.location)
    };
  }

  /**
   * Handle on-the-fly or on-save (depending on the
   * global atom-linter settings) events. Yeah!
   *
   * Loads `remark` on first invocation.
   *
   * @see https://github.com/atom-community/linter/wiki/Linter-API#messages
   *
   * @param {AtomTextEditor} editor - Access to editor.
   * @return {Promise.<Message, Error>} - Promise
   *  resolved with a list of linter-errors or an error.
   */
  function onchange(editor) {
    var filePath = editor.getPath();

    if (!filePath) {
      return Promise.resolve([]);
    }

    return new Promise(function (resolve, reject) {
      if (!remark) {
        remark = require('remark');
        lint = require('remark-lint');
      }

      var config = new Configuration({ detectRC: true });

      config.getConfiguration(filePath, function (err, conf) {
        var plugins = undefined;

        if (err) {
          return resolve([{
            type: 'Error',
            text: err.message,
            filePath: filePath,
            range: [[0, 0], [0, 0]]
          }]);
        }

        plugins = conf.plugins || {};
        plugins = plugins['remark-lint'] || plugins.lint || {};

        plugins.external = (plugins.external || []).map(function (name) {
          return loadPlugin(name, {
            prefix: 'remark-lint',
            cwd: filePath,
            global: true
          });
        });

        /* Load processor for current path */

        return remark().use(lint, plugins).process(editor.getText(), conf.settings, function (err2, file) {
          if (err2) {
            reject(err2);
          }

          resolve(file.messages.map(transform, editor));
        });
      });
    });
  }

  return {
    grammarScopes: ['source.gfm', 'source.pfm', 'text.md'],
    name: 'remark-lint',
    scope: 'file',
    lintOnFly: true,
    lint: onchange
  };
}

/**
 * Run package activation tasks.
 */
function activate() {
  require('atom-package-deps').install('linter-markdown');
}

/*
 * Expose.
 */
module.exports = {
  activate: activate,
  config: {},
  provideLinter: linter
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyLW1hcmtkb3duL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQVNaLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2pFLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O0FBRzFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFPaEIsU0FBUyxNQUFNLEdBQUc7QUFDaEIsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDOzs7Ozs7Ozs7QUFTckMsV0FBUyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3pCLFFBQU0sTUFBTSxHQUFHLENBQUMsQ0FDZCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDbEMsQ0FBQyxDQUFDOztBQUVILFVBQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNWLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3JFLENBQUM7O0FBRUYsV0FBTyxNQUFNLENBQUM7R0FDZjs7Ozs7Ozs7O0FBU0QsV0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ3RCLFdB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TTtBQUNiLGFBQVMsRUFBRSxJQUFJO0FBQ2YsUUFBSSxFQUFFLFFBQVE7R0FDZixDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxRQUFRLEdBQUc7QUFDbEIsU0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDekQ7Ozs7O0FBS0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQVEsRUFBUixRQUFRO0FBQ1IsUUFBTSxFQUFFLEVBQUU7QUFDVixlQUFhLEVBQUUsTUFBTTtDQUN0QixDQUFDIiwiZmlsZSI6Ii9ob21lL2Vwc2UvLmF0b20vcGFja2FnZXMvbGludGVyLW1hcmtkb3duL2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyoqXG4gKiBAYXV0aG9yIFRpdHVzIFdvcm1lclxuICogQGNvcHlyaWdodCAyMDE1IFRpdHVzIFdvcm1lclxuICogQGxpY2Vuc2UgTUlUXG4gKiBAbW9kdWxlIGF0b206bGludGVyLW1hcmtkb3duXG4gKiBAZmlsZW92ZXJ2aWV3IExpbnRlci5cbiAqL1xuXG5jb25zdCBDb25maWd1cmF0aW9uID0gcmVxdWlyZSgncmVtYXJrL2xpYi9jbGkvY29uZmlndXJhdGlvbi5qcycpO1xuY29uc3QgbG9hZFBsdWdpbiA9IHJlcXVpcmUoJ2xvYWQtcGx1Z2luJyk7XG5cbi8qIExhenkgbG9hZGluZyB0aGVzZSAqL1xubGV0IHJlbWFyayA9IG51bGw7XG5sZXQgbGludCA9IG51bGw7XG5cbi8qKlxuICogTGludGVyLW1hcmtkb3duLlxuICpcbiAqIEByZXR1cm4ge0xpbnRlckNvbmZpZ3VyYXRpb259XG4gKi9cbmZ1bmN0aW9uIGxpbnRlcigpIHtcbiAgY29uc3QgQ09ERV9FWFBSRVNTSU9OID0gL2AoW15gXSspYC9nO1xuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSAoc3RyaW5naWZpZWQpIHZmaWxlIHJhbmdlIHRvIGEgbGludGVyXG4gICAqIG5lc3RlZC10dXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGxvY2F0aW9uIC0gUG9zaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICogQHJldHVybiB7QXJyYXkuPEFycmF5LjxudW1iZXI+Pn0gLSBMaW50ZXIgcmFuZ2UuXG4gICAqL1xuICBmdW5jdGlvbiB0b1JhbmdlKGxvY2F0aW9uKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW1tcbiAgICAgIE51bWJlcihsb2NhdGlvbi5zdGFydC5saW5lKSAtIDEsXG4gICAgICBOdW1iZXIobG9jYXRpb24uc3RhcnQuY29sdW1uKSAtIDFcbiAgICBdXTtcblxuICAgIHJlc3VsdFsxXSA9IFtcbiAgICAgIGxvY2F0aW9uLmVuZC5saW5lID8gTnVtYmVyKGxvY2F0aW9uLmVuZC5saW5lKSAtIDEgOiByZXN1bHRbMF1bMF0sXG4gICAgICBsb2NhdGlvbi5lbmQuY29sdW1uID8gTnVtYmVyKGxvY2F0aW9uLmVuZC5jb2x1bW4pIC0gMSA6IHJlc3VsdFswXVsxXVxuICAgIF07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIHJlYXNvbiBmb3Igd2FybmluZyBmcm9tIHJlbWFyayBpbnRvXG4gICAqIHByZXR0eSBIVE1MLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVhc29uIC0gTWVzc3NhZ2UgaW4gcGxhaW4tdGV4dC5cbiAgICogQHJldHVybiB7c3RyaW5nfSAtIE1lc3NzYWdlIGluIEhUTUwuXG4gICAqL1xuICBmdW5jdGlvbiB0b0hUTUwocmVhc29uKSB7XG4gICAgcmV0dXJuIHJlYXNvbi5yZXBsYWNlKENPREVfRVhQUkVTU0lPTiwgJzxjb2RlPiQxPC9jb2RlPicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBWRmlsZSBtZXNzYWdlc1xuICAgKiBuZXN0ZWQtdHVwbGUuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dvb29ybS92ZmlsZSN2ZmlsZW1lc3NhZ2VcbiAgICpcbiAgICogQHBhcmFtIHtWRmlsZU1lc3NhZ2V9IG1lc3NhZ2UgLSBWaXJ0dWFsIGZpbGUgZXJyb3IuXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBMaW50ZXIgZXJyb3IuXG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0obWVzc2FnZSkge1xuICAgIGNvbnN0IHJlYXNvbiA9IHRvSFRNTChtZXNzYWdlLnJlYXNvbik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgIGh0bWw6IGA8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLWZsZXhpYmxlXCI+JHttZXNzYWdlLnJ1bGVJZH08L3NwYW4+ICR7cmVhc29ufWAsXG4gICAgICBmaWxlUGF0aDogdGhpcy5nZXRQYXRoKCksXG4gICAgICByYW5nZTogdG9SYW5nZShtZXNzYWdlLmxvY2F0aW9uKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIG9uLXRoZS1mbHkgb3Igb24tc2F2ZSAoZGVwZW5kaW5nIG9uIHRoZVxuICAgKiBnbG9iYWwgYXRvbS1saW50ZXIgc2V0dGluZ3MpIGV2ZW50cy4gWWVhaCFcbiAgICpcbiAgICogTG9hZHMgYHJlbWFya2Agb24gZmlyc3QgaW52b2NhdGlvbi5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS1jb21tdW5pdHkvbGludGVyL3dpa2kvTGludGVyLUFQSSNtZXNzYWdlc1xuICAgKlxuICAgKiBAcGFyYW0ge0F0b21UZXh0RWRpdG9yfSBlZGl0b3IgLSBBY2Nlc3MgdG8gZWRpdG9yLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlLjxNZXNzYWdlLCBFcnJvcj59IC0gUHJvbWlzZVxuICAgKiAgcmVzb2x2ZWQgd2l0aCBhIGxpc3Qgb2YgbGludGVyLWVycm9ycyBvciBhbiBlcnJvci5cbiAgICovXG4gIGZ1bmN0aW9uIG9uY2hhbmdlKGVkaXRvcikge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcblxuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXJlbWFyaykge1xuICAgICAgICByZW1hcmsgPSByZXF1aXJlKCdyZW1hcmsnKTtcbiAgICAgICAgbGludCA9IHJlcXVpcmUoJ3JlbWFyay1saW50Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKHsgZGV0ZWN0UkM6IHRydWUgfSk7XG5cbiAgICAgIGNvbmZpZy5nZXRDb25maWd1cmF0aW9uKGZpbGVQYXRoLCAoZXJyLCBjb25mKSA9PiB7XG4gICAgICAgIGxldCBwbHVnaW5zO1xuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShbe1xuICAgICAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZTogW1swLCAwXSwgWzAsIDBdXVxuICAgICAgICAgIH1dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBsdWdpbnMgPSBjb25mLnBsdWdpbnMgfHwge307XG4gICAgICAgIHBsdWdpbnMgPSBwbHVnaW5zWydyZW1hcmstbGludCddIHx8IHBsdWdpbnMubGludCB8fCB7fTtcblxuICAgICAgICBwbHVnaW5zLmV4dGVybmFsID0gKHBsdWdpbnMuZXh0ZXJuYWwgfHwgW10pLm1hcChuYW1lID0+XG4gICAgICAgICAgbG9hZFBsdWdpbihuYW1lLCB7XG4gICAgICAgICAgICBwcmVmaXg6ICdyZW1hcmstbGludCcsXG4gICAgICAgICAgICBjd2Q6IGZpbGVQYXRoLFxuICAgICAgICAgICAgZ2xvYmFsOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICAvKiBMb2FkIHByb2Nlc3NvciBmb3IgY3VycmVudCBwYXRoICovXG5cbiAgICAgICAgcmV0dXJuIHJlbWFyaygpXG4gICAgICAgICAgLnVzZShsaW50LCBwbHVnaW5zKVxuICAgICAgICAgIC5wcm9jZXNzKGVkaXRvci5nZXRUZXh0KCksIGNvbmYuc2V0dGluZ3MsIChlcnIyLCBmaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyMikge1xuICAgICAgICAgICAgICByZWplY3QoZXJyMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUoZmlsZS5tZXNzYWdlcy5tYXAodHJhbnNmb3JtLCBlZGl0b3IpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5nZm0nLCAnc291cmNlLnBmbScsICd0ZXh0Lm1kJ10sXG4gICAgbmFtZTogJ3JlbWFyay1saW50JyxcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICBsaW50OiBvbmNoYW5nZVxuICB9O1xufVxuXG4vKipcbiAqIFJ1biBwYWNrYWdlIGFjdGl2YXRpb24gdGFza3MuXG4gKi9cbmZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1tYXJrZG93bicpO1xufVxuXG4vKlxuICogRXhwb3NlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUsXG4gIGNvbmZpZzoge30sXG4gIHByb3ZpZGVMaW50ZXI6IGxpbnRlclxufTtcbiJdfQ==
//# sourceURL=/home/epse/.atom/packages/linter-markdown/lib/index.js
