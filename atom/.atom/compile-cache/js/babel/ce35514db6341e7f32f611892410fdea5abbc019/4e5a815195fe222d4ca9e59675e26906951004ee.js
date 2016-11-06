'use babel';

//
// JSON error format parser.
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var err = require('./errors');

// Copies a location from the given span to a linter message
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
  var json = JSON.parse(line);
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
      extra: {}
    };
    parseSpans(child, tr, msg);
    msg.trace.push(tr);
  });
  if (json.code) {
    msg.extra.errorCode = json.code.code;
    if (json.code.explanation) {
      msg.trace.push({
        message: json.code.explanation,
        type: 'Explanation',
        severity: 'info',
        extra: {}
      });
    }
  }
  messages.push(msg);
};

exports.parseMessage = parseMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvanNvbi1wYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7QUFNWixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdoQyxTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDbkMsS0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUMzQixLQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDN0IsS0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQzVCLEtBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztDQUMvQjs7QUFFRCxTQUFTLFNBQVM7Ozs0QkFBcUI7UUFBcEIsSUFBSTtRQUFFLEdBQUc7UUFBRSxPQUFPOzs7QUFDbkMsUUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ25CLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRWpDLFVBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN6RixXQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNiLGlCQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzFCLGNBQUksRUFBRSxPQUFPO0FBQ2Isa0JBQVEsRUFBRSxNQUFNO0FBQ2hCLGVBQUss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QUMsV0FBVztBQUM5QixZQUFJLEVBQUUsYUFBYTtBQUNuQixnQkFBUSxFQUFFLE1BQU07QUFDaEIsYUFBSyxFQUFFLEVBQUU7T0FDVixDQUFDLENBQUM7S0FDSjtHQUNGO0FBQ0QsVUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQixDQUFDOztRQUVPLFlBQVksR0FBWixZQUFZIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvanNvbi1wYXJzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy9cbi8vIEpTT04gZXJyb3IgZm9ybWF0IHBhcnNlci5cbi8vXG5cbmNvbnN0IGVyciA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG5cbi8vIENvcGllcyBhIGxvY2F0aW9uIGZyb20gdGhlIGdpdmVuIHNwYW4gdG8gYSBsaW50ZXIgbWVzc2FnZVxuZnVuY3Rpb24gY29weVNwYW5Mb2NhdGlvbihzcGFuLCBtc2cpIHtcbiAgbXNnLmZpbGUgPSBzcGFuLmZpbGVfbmFtZTtcbiAgbXNnLmxpbmUgPSBzcGFuLmxpbmVfc3RhcnQ7XG4gIG1zZy5saW5lX2VuZCA9IHNwYW4ubGluZV9lbmQ7XG4gIG1zZy5jb2wgPSBzcGFuLmNvbHVtbl9zdGFydDtcbiAgbXNnLmNvbF9lbmQgPSBzcGFuLmNvbHVtbl9lbmQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpIHtcbiAgaWYgKHNwYW4uaXNfcHJpbWFyeSkge1xuICAgIG1zZy5leHRyYS5zcGFuTGFiZWwgPSBzcGFuLmxhYmVsO1xuICAgIC8vIElmIHRoZSBlcnJvciBpcyB3aXRoaW4gYSBtYWNybywgYWRkIHRoZSBtYWNybyB0ZXh0IHRvIHRoZSBtZXNzYWdlXG4gICAgaWYgKHNwYW4uZmlsZV9uYW1lICYmIHNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSAmJiBzcGFuLnRleHQgJiYgc3Bhbi50ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgbWVzc2FnZTogc3Bhbi50ZXh0WzBdLnRleHQsXG4gICAgICAgIHR5cGU6ICdNYWNybycsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGlmIChzcGFuLmZpbGVfbmFtZSAmJiAhc3Bhbi5maWxlX25hbWUuc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgaWYgKCFzcGFuLmlzX3ByaW1hcnkgJiYgc3Bhbi5sYWJlbCkge1xuICAgICAgLy8gQSBzZWNvbmRhcnkgc3BhblxuICAgICAgY29uc3QgdHJhY2UgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHNwYW4ubGFiZWwsXG4gICAgICAgIHR5cGU6ICdOb3RlJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgZXh0cmE6IHt9XG4gICAgICB9O1xuICAgICAgY29weVNwYW5Mb2NhdGlvbihzcGFuLCB0cmFjZSk7XG4gICAgICBtc2cudHJhY2UucHVzaCh0cmFjZSk7XG4gICAgfVxuICAgIC8vIENvcHkgdGhlIG1haW4gZXJyb3IgbG9jYXRpb24gZnJvbSB0aGUgcHJpbWFyeSBzcGFuIG9yIGZyb20gYW55IG90aGVyXG4gICAgLy8gc3BhbiBpZiBpdCBoYXNuJ3QgYmVlbiBkZWZpbmVkIHlldFxuICAgIGlmIChzcGFuLmlzX3ByaW1hcnkgfHwgIW1zZy5maWxlKSB7XG4gICAgICBjb3B5U3BhbkxvY2F0aW9uKHNwYW4sIG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHNwYW4uZXhwYW5zaW9uKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BhbihzcGFuLmV4cGFuc2lvbi5zcGFuLCBtc2csIG1haW5Nc2cpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gUGFyc2VzIHNwYW5zIG9mIHRoZSBnaXZlbiBtZXNzYWdlXG5mdW5jdGlvbiBwYXJzZVNwYW5zKGpzb25PYmosIG1zZywgbWFpbk1zZykge1xuICBpZiAoanNvbk9iai5zcGFucykge1xuICAgIGpzb25PYmouc3BhbnMuZm9yRWFjaChzcGFuID0+IHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpKTtcbiAgfVxufVxuXG4vLyBQYXJzZXMgYSBjb21waWxlIG1lc3NhZ2UgaW4gdGhlIEpTT04gZm9ybWF0XG5jb25zdCBwYXJzZU1lc3NhZ2UgPSAobGluZSwgbWVzc2FnZXMpID0+IHtcbiAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobGluZSk7XG4gIGNvbnN0IG1zZyA9IHtcbiAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgdHlwZTogZXJyLmxldmVsMnR5cGUoanNvbi5sZXZlbCksXG4gICAgc2V2ZXJpdHk6IGVyci5sZXZlbDJzZXZlcml0eShqc29uLmxldmVsKSxcbiAgICB0cmFjZTogW10sXG4gICAgZXh0cmE6IHt9XG4gIH07XG4gIHBhcnNlU3BhbnMoanNvbiwgbXNnLCBtc2cpO1xuICBqc29uLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgIGNvbnN0IHRyID0ge1xuICAgICAgbWVzc2FnZTogY2hpbGQubWVzc2FnZSxcbiAgICAgIHR5cGU6IGVyci5sZXZlbDJ0eXBlKGNoaWxkLmxldmVsKSxcbiAgICAgIHNldmVyaXR5OiBlcnIubGV2ZWwyc2V2ZXJpdHkoY2hpbGQubGV2ZWwpLFxuICAgICAgZXh0cmE6IHt9XG4gICAgfTtcbiAgICBwYXJzZVNwYW5zKGNoaWxkLCB0ciwgbXNnKTtcbiAgICBtc2cudHJhY2UucHVzaCh0cik7XG4gIH0pO1xuICBpZiAoanNvbi5jb2RlKSB7XG4gICAgbXNnLmV4dHJhLmVycm9yQ29kZSA9IGpzb24uY29kZS5jb2RlO1xuICAgIGlmIChqc29uLmNvZGUuZXhwbGFuYXRpb24pIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgbWVzc2FnZToganNvbi5jb2RlLmV4cGxhbmF0aW9uLFxuICAgICAgICB0eXBlOiAnRXhwbGFuYXRpb24nLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBleHRyYToge31cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBtZXNzYWdlcy5wdXNoKG1zZyk7XG59O1xuXG5leHBvcnQgeyBwYXJzZU1lc3NhZ2UgfTtcbiJdfQ==
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/build-cargo/lib/json-parser.js
