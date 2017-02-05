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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvanNvbi1wYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3NCQVFtQixRQUFROzs7OztBQVIzQixXQUFXLENBQUM7Ozs7OztBQU1aLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFLaEMsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ25DLEtBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMxQixLQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDM0IsS0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzdCLEtBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUM1QixLQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Q0FDL0I7O0FBRUQsU0FBUyxTQUFTOzs7NEJBQXFCO1FBQXBCLElBQUk7UUFBRSxHQUFHO1FBQUUsT0FBTzs7O0FBQ25DLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUVqQyxVQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekYsV0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDYixpQkFBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMxQixjQUFJLEVBQUUsT0FBTztBQUNiLGtCQUFRLEVB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SyxDQUFDLElBQUksQ0FBQztBQUNiLG9CQUFZLEVBQUUsb0VBQW9FLEdBQUcseUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxZQUFZO0FBQ2pJLFlBQUksRUFBRSxhQUFhO0FBQ25CLGdCQUFRLEVBQUUsTUFBTTtBQUNoQixhQUFLLEVBQUUsRUFBRTtPQUNWLENBQUMsQ0FBQztLQUNKO0dBQ0Y7QUFDRCxVQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLENBQUM7O1FBRU8sWUFBWSxHQUFaLFlBQVkiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1aWxkLWNhcmdvL2xpYi9qc29uLXBhcnNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vL1xuLy8gSlNPTiBlcnJvciBmb3JtYXQgcGFyc2VyLlxuLy9cblxuY29uc3QgZXJyID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcblxuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuXG4vLyBDb3BpZXMgYSBsb2NhdGlvbiBmcm9tIHRoZSBnaXZlbiBzcGFuIHRvIGEgbGludGVyIG1lc3NhZ2VcbmZ1bmN0aW9uIGNvcHlTcGFuTG9jYXRpb24oc3BhbiwgbXNnKSB7XG4gIG1zZy5maWxlID0gc3Bhbi5maWxlX25hbWU7XG4gIG1zZy5saW5lID0gc3Bhbi5saW5lX3N0YXJ0O1xuICBtc2cubGluZV9lbmQgPSBzcGFuLmxpbmVfZW5kO1xuICBtc2cuY29sID0gc3Bhbi5jb2x1bW5fc3RhcnQ7XG4gIG1zZy5jb2xfZW5kID0gc3Bhbi5jb2x1bW5fZW5kO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNwYW4oc3BhbiwgbXNnLCBtYWluTXNnKSB7XG4gIGlmIChzcGFuLmlzX3ByaW1hcnkpIHtcbiAgICBtc2cuZXh0cmEuc3BhbkxhYmVsID0gc3Bhbi5sYWJlbDtcbiAgICAvLyBJZiB0aGUgZXJyb3IgaXMgd2l0aGluIGEgbWFjcm8sIGFkZCB0aGUgbWFjcm8gdGV4dCB0byB0aGUgbWVzc2FnZVxuICAgIGlmIChzcGFuLmZpbGVfbmFtZSAmJiBzcGFuLmZpbGVfbmFtZS5zdGFydHNXaXRoKCc8JykgJiYgc3Bhbi50ZXh0ICYmIHNwYW4udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICBtc2cudHJhY2UucHVzaCh7XG4gICAgICAgIG1lc3NhZ2U6IHNwYW4udGV4dFswXS50ZXh0LFxuICAgICAgICB0eXBlOiAnTWFjcm8nLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBleHRyYToge31cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBpZiAoc3Bhbi5maWxlX25hbWUgJiYgIXNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSkge1xuICAgIGlmICghc3Bhbi5pc19wcmltYXJ5ICYmIHNwYW4ubGFiZWwpIHtcbiAgICAgIC8vIEEgc2Vjb25kYXJ5IHNwYW5cbiAgICAgIGNvbnN0IHRyYWNlID0ge1xuICAgICAgICBtZXNzYWdlOiBzcGFuLmxhYmVsLFxuICAgICAgICB0eXBlOiAnTm90ZScsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfTtcbiAgICAgIGNvcHlTcGFuTG9jYXRpb24oc3BhbiwgdHJhY2UpO1xuICAgICAgbXNnLnRyYWNlLnB1c2godHJhY2UpO1xuICAgIH1cbiAgICAvLyBDb3B5IHRoZSBtYWluIGVycm9yIGxvY2F0aW9uIGZyb20gdGhlIHByaW1hcnkgc3BhbiBvciBmcm9tIGFueSBvdGhlclxuICAgIC8vIHNwYW4gaWYgaXQgaGFzbid0IGJlZW4gZGVmaW5lZCB5ZXRcbiAgICBpZiAoc3Bhbi5pc19wcmltYXJ5IHx8ICFtc2cuZmlsZSkge1xuICAgICAgY29weVNwYW5Mb2NhdGlvbihzcGFuLCBtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChzcGFuLmV4cGFuc2lvbikge1xuICAgIHJldHVybiBwYXJzZVNwYW4oc3Bhbi5leHBhbnNpb24uc3BhbiwgbXNnLCBtYWluTXNnKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIFBhcnNlcyBzcGFucyBvZiB0aGUgZ2l2ZW4gbWVzc2FnZVxuZnVuY3Rpb24gcGFyc2VTcGFucyhqc29uT2JqLCBtc2csIG1haW5Nc2cpIHtcbiAgaWYgKGpzb25PYmouc3BhbnMpIHtcbiAgICBqc29uT2JqLnNwYW5zLmZvckVhY2goc3BhbiA9PiBwYXJzZVNwYW4oc3BhbiwgbXNnLCBtYWluTXNnKSk7XG4gIH1cbn1cblxuLy8gUGFyc2VzIGEgY29tcGlsZSBtZXNzYWdlIGluIHRoZSBKU09OIGZvcm1hdFxuY29uc3QgcGFyc2VNZXNzYWdlID0gKGxpbmUsIG1lc3NhZ2VzKSA9PiB7XG4gIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGxpbmUpLm1lc3NhZ2U7XG4gIGNvbnN0IG1zZyA9IHtcbiAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgdHlwZTogZXJyLmxldmVsMnR5cGUoanNvbi5sZXZlbCksXG4gICAgc2V2ZXJpdHk6IGVyci5sZXZlbDJzZXZlcml0eShqc29uLmxldmVsKSxcbiAgICB0cmFjZTogW10sXG4gICAgZXh0cmE6IHt9XG4gIH07XG4gIHBhcnNlU3BhbnMoanNvbiwgbXNnLCBtc2cpO1xuICBqc29uLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgIGNvbnN0IHRyID0ge1xuICAgICAgbWVzc2FnZTogY2hpbGQubWVzc2FnZSxcbiAgICAgIHR5cGU6IGVyci5sZXZlbDJ0eXBlKGNoaWxkLmxldmVsKSxcbiAgICAgIHNldmVyaXR5OiBlcnIubGV2ZWwyc2V2ZXJpdHkoY2hpbGQubGV2ZWwpLFxuICAgICAgdHJhY2U6IFtdLFxuICAgICAgZXh0cmE6IHt9XG4gICAgfTtcbiAgICBwYXJzZVNwYW5zKGNoaWxkLCB0ciwgbXNnKTtcbiAgICBtc2cudHJhY2UucHVzaCh0cik7XG4gIH0pO1xuICBpZiAoanNvbi5jb2RlKSB7XG4gICAgbXNnLmV4dHJhLmVycm9yQ29kZSA9IGpzb24uY29kZS5jb2RlO1xuICAgIGlmIChqc29uLmNvZGUuZXhwbGFuYXRpb24pIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgaHRtbF9tZXNzYWdlOiAnPGRldGFpbHM+PHN1bW1hcnk+RXhwYW5kIHRvIHNlZSB0aGUgZGV0YWlsZWQgZXhwbGFuYXRpb248L3N1bW1hcnk+JyArIG1hcmtlZChqc29uLmNvZGUuZXhwbGFuYXRpb24pICsgJzwvZGV0YWlscz4nLFxuICAgICAgICB0eXBlOiAnRXhwbGFuYXRpb24nLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICBleHRyYToge31cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBtZXNzYWdlcy5wdXNoKG1zZyk7XG59O1xuXG5leHBvcnQgeyBwYXJzZU1lc3NhZ2UgfTtcbiJdfQ==