'use babel';
/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module atom:linter-markdown:config
 * @fileoverview Configuration loaded into the engine.
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */
var CompositeDisposable = require('atom').CompositeDisposable;
var path = require('path');

var consistent = require.resolve('remark-preset-lint-consistent');
var recommended = require.resolve('remark-preset-lint-recommended');

var subscriptions = undefined;
var presetConsistentWithoutConfig = undefined;
var presetRecommendedWithoutConfig = undefined;

function configure(config) {
  var current = config.plugins || {};
  var plugins = {};
  var presets = [];
  var configured = undefined;

  Object.keys(current).forEach(function (filePath) {
    if (path.basename(path.dirname(filePath)) === 'remark-lint' || filePath === 'remark-lint' || filePath === 'lint') {
      configured = true;
    } else {
      /* Turn off other plug-ins. */
      plugins[filePath] = false;
    }
  });

  /* Found no config for `remark-lint`, set presets. */
  if (!configured) {
    if (presetRecommendedWithoutConfig) {
      presets.push(recommended);
    }

    if (presetConsistentWithoutConfig) {
      presets.push(consistent);
    }
  }

  return { presets: presets, plugins: plugins };
}

function on() {
  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.config.observe('linter-markdown.presetRecommendedWithoutConfig', function (value) {
    presetRecommendedWithoutConfig = value;
  }));

  subscriptions.add(atom.config.observe('linter-markdown.presetConsistentWithoutConfig', function (value) {
    presetConsistentWithoutConfig = value;
  }));
}

function off() {
  subscriptions.dispose();
}

module.exports = configure;

configure.on = on;
configure.off = off;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9saW50ZXItbWFya2Rvd24vbGliL2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7QUFVWixJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztBQUNoRSxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUNwRSxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7O0FBRXRFLElBQUksYUFBYSxZQUFBLENBQUM7QUFDbEIsSUFBSSw2QkFBNkIsWUFBQSxDQUFDO0FBQ2xDLElBQUksOEJBQThCLFlBQUEsQ0FBQzs7QUFFbkMsU0FBUyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3pCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0FBQ3JDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsTUFBSSxVQUFVLFlBQUEsQ0FBQzs7QUFFZixRQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUN6QyxRQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLGFBQWEsSUFDdkQsUUFBUSxLQUFLLGFBQWEsSUFDMUIsUUFBUSxLQUFLLE1BQU0sRUFDbkI7QUFDQSxnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQixNQUFNOztBQUVMLGFBQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDM0I7R0FDRixDQUFDLENBQUM7OztBQUdILE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixRQUFJLDhCQUE4QixFQUFFO0FBQ2xDLGFBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDM0I7O0FBRUQsUUFBSSw2QkFBNkIsRUFBRTtBQUNqQyxhQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzFCO0dBQ0Y7O0FBRUQsU0FBTyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBRSxDQUFDO0NBQzdCOztBQUVELFNBQVMsRUFBRSxHQUFHO0FBQ1osZUFBYSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQzs7QUFFMUMsZUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnREFBZ0QsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNqRyxrQ0FBOEIsR0FBRyxLQUFLLENBQUM7R0FDeEMsQ0FBQyxDQUFDLENBQUM7O0FBRUosZUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQ0FBK0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNoRyxpQ0FBNkIsR0FBRyxLQUFLLENBQUM7R0FDdkMsQ0FBQyxDQUFDLENBQUM7Q0FDTDs7QUFFRCxTQUFTLEdBQUcsR0FBRztBQUNiLGVBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUN6Qjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFM0IsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDbEIsU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1tYXJrZG93bi9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKipcbiAqIEBhdXRob3IgVGl0dXMgV29ybWVyXG4gKiBAY29weXJpZ2h0IDIwMTYgVGl0dXMgV29ybWVyXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBtb2R1bGUgYXRvbTpsaW50ZXItbWFya2Rvd246Y29uZmlnXG4gKiBAZmlsZW92ZXJ2aWV3IENvbmZpZ3VyYXRpb24gbG9hZGVkIGludG8gdGhlIGVuZ2luZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9uby11bnJlc29sdmVkICovXG5jb25zdCBDb21wb3NpdGVEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGU7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBjb25zaXN0ZW50ID0gcmVxdWlyZS5yZXNvbHZlKCdyZW1hcmstcHJlc2V0LWxpbnQtY29uc2lzdGVudCcpO1xuY29uc3QgcmVjb21tZW5kZWQgPSByZXF1aXJlLnJlc29sdmUoJ3JlbWFyay1wcmVzZXQtbGludC1yZWNvbW1lbmRlZCcpO1xuXG5sZXQgc3Vic2NyaXB0aW9ucztcbmxldCBwcmVzZXRDb25zaXN0ZW50V2l0aG91dENvbmZpZztcbmxldCBwcmVzZXRSZWNvbW1lbmRlZFdpdGhvdXRDb25maWc7XG5cbmZ1bmN0aW9uIGNvbmZpZ3VyZShjb25maWcpIHtcbiAgY29uc3QgY3VycmVudCA9IGNvbmZpZy5wbHVnaW5zIHx8IHt9O1xuICBjb25zdCBwbHVnaW5zID0ge307XG4gIGNvbnN0IHByZXNldHMgPSBbXTtcbiAgbGV0IGNvbmZpZ3VyZWQ7XG5cbiAgT2JqZWN0LmtleXMoY3VycmVudCkuZm9yRWFjaCgoZmlsZVBhdGgpID0+IHtcbiAgICBpZiAoXG4gICAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShmaWxlUGF0aCkpID09PSAncmVtYXJrLWxpbnQnIHx8XG4gICAgICBmaWxlUGF0aCA9PT0gJ3JlbWFyay1saW50JyB8fFxuICAgICAgZmlsZVBhdGggPT09ICdsaW50J1xuICAgICkge1xuICAgICAgY29uZmlndXJlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIFR1cm4gb2ZmIG90aGVyIHBsdWctaW5zLiAqL1xuICAgICAgcGx1Z2luc1tmaWxlUGF0aF0gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qIEZvdW5kIG5vIGNvbmZpZyBmb3IgYHJlbWFyay1saW50YCwgc2V0IHByZXNldHMuICovXG4gIGlmICghY29uZmlndXJlZCkge1xuICAgIGlmIChwcmVzZXRSZWNvbW1lbmRlZFdpdGhvdXRDb25maWcpIHtcbiAgICAgIHByZXNldHMucHVzaChyZWNvbW1lbmRlZCk7XG4gICAgfVxuXG4gICAgaWYgKHByZXNldENvbnNpc3RlbnRXaXRob3V0Q29uZmlnKSB7XG4gICAgICBwcmVzZXRzLnB1c2goY29uc2lzdGVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgcHJlc2V0cywgcGx1Z2lucyB9O1xufVxuXG5mdW5jdGlvbiBvbigpIHtcbiAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLW1hcmtkb3duLnByZXNldFJlY29tbWVuZGVkV2l0aG91dENvbmZpZycsICh2YWx1ZSkgPT4ge1xuICAgIHByZXNldFJlY29tbWVuZGVkV2l0aG91dENvbmZpZyA9IHZhbHVlO1xuICB9KSk7XG5cbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLW1hcmtkb3duLnByZXNldENvbnNpc3RlbnRXaXRob3V0Q29uZmlnJywgKHZhbHVlKSA9PiB7XG4gICAgcHJlc2V0Q29uc2lzdGVudFdpdGhvdXRDb25maWcgPSB2YWx1ZTtcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBvZmYoKSB7XG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbmZpZ3VyZTtcblxuY29uZmlndXJlLm9uID0gb247XG5jb25maWd1cmUub2ZmID0gb2ZmO1xuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/linter-markdown/lib/config.js
