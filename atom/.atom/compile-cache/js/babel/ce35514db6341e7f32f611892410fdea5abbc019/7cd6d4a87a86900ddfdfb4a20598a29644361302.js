Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

// Copies a location from the given span to a linter message
'use babel';

//
// JSON error format parser.
//

var err = require('./errors');

function copySpanLocation(span, msg) {
  msg.file = span.file_name;
  msg.line = span.line_start;
  msg.line_end = span.line_end;
  msg.col = span.column_start;
  msg.col_end = span.column_end;
}

function parseSpan(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var span = _x,
        msg = _x2,
        mainMsg = _x3;
    _again = false;

    if (span.is_primary) {
      msg.extra.spanLabel = span.label;
      // If the error is within a macro, add the macro text to the message
      if (span.file_name && span.file_name.startsWith('<') && span.text && span.text.length > 0) {
        msg.trace.push({
          message: span.text[0].text,
          type: 'Macro',
          severity: 'info',
          extra: {}
        });
      }
    }
    if (span.file_name && !span.file_name.startsWith('<')) {
      if (!span.is_primary && span.label) {
        // A secondary span
        var trace = {
          message: span.label,
          type: 'Note',
          severity: 'info',
          extra: {}
        };
        copySpanLocation(span, trace);
        msg.trace.push(trace);
      }
      // Copy the main error location from the primary span or from any other
      // span if it hasn't been defined yet
      if (span.is_primary || !msg.file) {
        copySpanLocation(span, msg);
      }
      return true;
    } else if (span.expansion) {
      _x = span.expansion.span;
      _x2 = msg;
      _x3 = mainMsg;
      _again = true;
      trace = undefined;
      continue _function;
    }
    return false;
  }
}

// Parses spans of the given message
function parseSpans(jsonObj, msg, mainMsg) {
  if (jsonObj.spans) {
    jsonObj.spans.forEach(function (span) {
      return parseSpan(span, msg, mainMsg);
    });
  }
}

// Parses a compile message in the JSON format
var parseMessage = function parseMessage(line, messages) {
  var json = JSON.parse(line).message;
  if (!json || !json.level) {
    // It's a cargo general message, not a compiler's one. Skip it.
    // In the future can be changed to "reason !== 'compiler-message'"
    return;
  }
  var msg = {
    message: json.message,
    type: err.level2type(json.level),
    severity: err.level2severity(json.level),
    trace: [],
    extra: {}
  };
  parseSpans(json, msg, msg);
  json.children.forEach(function (child) {
    var tr = {
      message: child.message,
      type: err.level2type(child.level),
      severity: err.level2severity(child.level),
      trace: [],
      extra: {}
    };
    parseSpans(child, tr, msg);
    msg.trace.push(tr);
  });
  if (json.code) {
    msg.extra.errorCode = json.code.code;
    if (json.code.explanation) {
      msg.trace.push({
        html_message: '<details><summary>Expand to see the detailed explanation</summary>' + (0, _marked2['default'])(json.code.explanation) + '</details>',
        type: 'Explanation',
        severity: 'info',
        extra: {}
      });
    }
  }
  messages.push(msg);
};

exports.parseMessage = parseMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvanNvbi1wYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3NCQVFtQixRQUFROzs7OztBQVIzQixXQUFXLENBQUM7Ozs7OztBQU1aLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFLaEMsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ25DLEtBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMxQixLQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDM0IsS0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzdCLEtBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUM1QixLQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Q0FDL0I7O0FBRUQsU0FBUyxTQUFTOzs7NEJBQXFCO1FBQXBCLElBQUk7UUFBRSxHQUFHO1FBQUUsT0FBTzs7O0FBQ25DLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUVqQyxVQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekYsV0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDYixpQkFBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMxQixjQUFJLEVBQUUsT0FBTztBQUNiLGtCQUFRLEVB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QUksQ0FBQztBQUNyQyxRQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3pCLFNBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2Isb0JBQVksRUFBRSxvRUFBb0UsR0FBRyx5QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFlBQVk7QUFDakksWUFBSSxFQUFFLGFBQWE7QUFDbkIsZ0JBQVEsRUFBRSxNQUFNO0FBQ2hCLGFBQUssRUFBRSxFQUFFO09BQ1YsQ0FBQyxDQUFDO0tBQ0o7R0FDRjtBQUNELFVBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEIsQ0FBQzs7UUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2pzb24tcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vXG4vLyBKU09OIGVycm9yIGZvcm1hdCBwYXJzZXIuXG4vL1xuXG5jb25zdCBlcnIgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xuXG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5cbi8vIENvcGllcyBhIGxvY2F0aW9uIGZyb20gdGhlIGdpdmVuIHNwYW4gdG8gYSBsaW50ZXIgbWVzc2FnZVxuZnVuY3Rpb24gY29weVNwYW5Mb2NhdGlvbihzcGFuLCBtc2cpIHtcbiAgbXNnLmZpbGUgPSBzcGFuLmZpbGVfbmFtZTtcbiAgbXNnLmxpbmUgPSBzcGFuLmxpbmVfc3RhcnQ7XG4gIG1zZy5saW5lX2VuZCA9IHNwYW4ubGluZV9lbmQ7XG4gIG1zZy5jb2wgPSBzcGFuLmNvbHVtbl9zdGFydDtcbiAgbXNnLmNvbF9lbmQgPSBzcGFuLmNvbHVtbl9lbmQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpIHtcbiAgaWYgKHNwYW4uaXNfcHJpbWFyeSkge1xuICAgIG1zZy5leHRyYS5zcGFuTGFiZWwgPSBzcGFuLmxhYmVsO1xuICAgIC8vIElmIHRoZSBlcnJvciBpcyB3aXRoaW4gYSBtYWNybywgYWRkIHRoZSBtYWNybyB0ZXh0IHRvIHRoZSBtZXNzYWdlXG4gICAgaWYgKHNwYW4uZmlsZV9uYW1lICYmIHNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSAmJiBzcGFuLnRleHQgJiYgc3Bhbi50ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgbWVzc2FnZTogc3Bhbi50ZXh0WzBdLnRleHQsXG4gICAgICAgIHR5cGU6ICdNYWNybycsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGlmIChzcGFuLmZpbGVfbmFtZSAmJiAhc3Bhbi5maWxlX25hbWUuc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgaWYgKCFzcGFuLmlzX3ByaW1hcnkgJiYgc3Bhbi5sYWJlbCkge1xuICAgICAgLy8gQSBzZWNvbmRhcnkgc3BhblxuICAgICAgY29uc3QgdHJhY2UgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHNwYW4ubGFiZWwsXG4gICAgICAgIHR5cGU6ICdOb3RlJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgZXh0cmE6IHt9XG4gICAgICB9O1xuICAgICAgY29weVNwYW5Mb2NhdGlvbihzcGFuLCB0cmFjZSk7XG4gICAgICBtc2cudHJhY2UucHVzaCh0cmFjZSk7XG4gICAgfVxuICAgIC8vIENvcHkgdGhlIG1haW4gZXJyb3IgbG9jYXRpb24gZnJvbSB0aGUgcHJpbWFyeSBzcGFuIG9yIGZyb20gYW55IG90aGVyXG4gICAgLy8gc3BhbiBpZiBpdCBoYXNuJ3QgYmVlbiBkZWZpbmVkIHlldFxuICAgIGlmIChzcGFuLmlzX3ByaW1hcnkgfHwgIW1zZy5maWxlKSB7XG4gICAgICBjb3B5U3BhbkxvY2F0aW9uKHNwYW4sIG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHNwYW4uZXhwYW5zaW9uKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BhbihzcGFuLmV4cGFuc2lvbi5zcGFuLCBtc2csIG1haW5Nc2cpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gUGFyc2VzIHNwYW5zIG9mIHRoZSBnaXZlbiBtZXNzYWdlXG5mdW5jdGlvbiBwYXJzZVNwYW5zKGpzb25PYmosIG1zZywgbWFpbk1zZykge1xuICBpZiAoanNvbk9iai5zcGFucykge1xuICAgIGpzb25PYmouc3BhbnMuZm9yRWFjaChzcGFuID0+IHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpKTtcbiAgfVxufVxuXG4vLyBQYXJzZXMgYSBjb21waWxlIG1lc3NhZ2UgaW4gdGhlIEpTT04gZm9ybWF0XG5jb25zdCBwYXJzZU1lc3NhZ2UgPSAobGluZSwgbWVzc2FnZXMpID0+IHtcbiAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobGluZSkubWVzc2FnZTtcbiAgaWYgKCFqc29uIHx8ICFqc29uLmxldmVsKSB7XG4gICAgLy8gSXQncyBhIGNhcmdvIGdlbmVyYWwgbWVzc2FnZSwgbm90IGEgY29tcGlsZXIncyBvbmUuIFNraXAgaXQuXG4gICAgLy8gSW4gdGhlIGZ1dHVyZSBjYW4gYmUgY2hhbmdlZCB0byBcInJlYXNvbiAhPT0gJ2NvbXBpbGVyLW1lc3NhZ2UnXCJcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbXNnID0ge1xuICAgIG1lc3NhZ2U6IGpzb24ubWVzc2FnZSxcbiAgICB0eXBlOiBlcnIubGV2ZWwydHlwZShqc29uLmxldmVsKSxcbiAgICBzZXZlcml0eTogZXJyLmxldmVsMnNldmVyaXR5KGpzb24ubGV2ZWwpLFxuICAgIHRyYWNlOiBbXSxcbiAgICBleHRyYToge31cbiAgfTtcbiAgcGFyc2VTcGFucyhqc29uLCBtc2csIG1zZyk7XG4gIGpzb24uY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgY29uc3QgdHIgPSB7XG4gICAgICBtZXNzYWdlOiBjaGlsZC5tZXNzYWdlLFxuICAgICAgdHlwZTogZXJyLmxldmVsMnR5cGUoY2hpbGQubGV2ZWwpLFxuICAgICAgc2V2ZXJpdHk6IGVyci5sZXZlbDJzZXZlcml0eShjaGlsZC5sZXZlbCksXG4gICAgICB0cmFjZTogW10sXG4gICAgICBleHRyYToge31cbiAgICB9O1xuICAgIHBhcnNlU3BhbnMoY2hpbGQsIHRyLCBtc2cpO1xuICAgIG1zZy50cmFjZS5wdXNoKHRyKTtcbiAgfSk7XG4gIGlmIChqc29uLmNvZGUpIHtcbiAgICBtc2cuZXh0cmEuZXJyb3JDb2RlID0ganNvbi5jb2RlLmNvZGU7XG4gICAgaWYgKGpzb24uY29kZS5leHBsYW5hdGlvbikge1xuICAgICAgbXNnLnRyYWNlLnB1c2goe1xuICAgICAgICBodG1sX21lc3NhZ2U6ICc8ZGV0YWlscz48c3VtbWFyeT5FeHBhbmQgdG8gc2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbjwvc3VtbWFyeT4nICsgbWFya2VkKGpzb24uY29kZS5leHBsYW5hdGlvbikgKyAnPC9kZXRhaWxzPicsXG4gICAgICAgIHR5cGU6ICdFeHBsYW5hdGlvbicsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIG1lc3NhZ2VzLnB1c2gobXNnKTtcbn07XG5cbmV4cG9ydCB7IHBhcnNlTWVzc2FnZSB9O1xuIl19