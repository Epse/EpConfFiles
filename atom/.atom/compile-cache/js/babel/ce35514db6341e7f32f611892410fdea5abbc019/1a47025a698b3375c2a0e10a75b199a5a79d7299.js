'use babel';

//
// Standard error format parser.
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var err = require('./errors');

// Detects message headers (the main message and location):
//
// Examles:
//
// error[E0023]: Some error message
//   --> src/main.rs:157:12
//
// <std macros>:1:33: 1:58 Some message
//
// src/main.rs:157:12: 157:18 Some message
//
// error: Something happened
//
// Retursn the message infromation and the number of parsed lines.
function parseMessageHeader(lines, i) {
  var match = /^(error|warning|note|help)(?:\[(E\d+)\])?: (.*)/.exec(lines[i]);
  if (match) {
    var level = match[1];
    var code = match[2];
    var message = match[3];
    if (lines.length >= i) {
      var locMatch = /^\s*--> (.+):(\d+):(\d+)/.exec(lines[i + 1]);
      if (locMatch) {
        var locFile = locMatch[1];
        var locLine = parseInt(locMatch[2], 10);
        var locColStart = parseInt(locMatch[3], 10);
        var msg = {
          message: message,
          type: err.level2type(level),
          severity: err.level2severity(level),
          file: locFile,
          line: locLine,
          line_end: locLine,
          col: locColStart,
          col_end: locColStart + 1, // Highlight only one symbol by default
          trace: [],
          extra: {
            errorCode: code
          }
        };
        if (code && code.length > 0) {
          msg.trace.push({
            html_message: '<a href="https://doc.rust-lang.org/error-index.html#' + msg.extra.errorCode + '">Explain error ' + code + '</a>',
            type: 'Explanation',
            severity: 'info',
            extra: {},
            order: 100 // Always put it to the end of the list
          });
        }
        return {
          message: msg,
          parsedQty: 2 // Number of parsed lines
        };
      }
    }
  }

  // Try the format that is usually found in errors within macros:
  // file_name:l:c: le:ce: message
  var macroMatch = /^\s*(.+):(\d+):(\d+): (\d+):(\d+) (error|warning|note|help):\s*(.*)/.exec(lines[i]);
  if (macroMatch) {
    var msg = {
      message: macroMatch[7],
      type: err.level2type(macroMatch[6]),
      severity: err.level2severity(macroMatch[6]),
      file: macroMatch[1],
      line: parseInt(macroMatch[2], 10),
      line_end: parseInt(macroMatch[4], 10),
      col: parseInt(macroMatch[3], 10),
      col_end: parseInt(macroMatch[5], 10),
      trace: [],
      extra: {}
    };
    return {
      message: msg,
      parsedQty: 1 // Number of parsed lines
    };
  }

  // Try the simplest format:
  // error: message
  var simpleMatch = /^\s*(error|warning|note|help):\s*(.*)/.exec(lines[i]);
  if (simpleMatch) {
    var msg = {
      message: simpleMatch[2],
      type: err.level2type(simpleMatch[1]),
      severity: err.level2severity(simpleMatch[1]),
      trace: [],
      extra: {}
    };
    return {
      message: msg,
      parsedQty: 1 // Number of parsed lines
    };
  }

  return undefined;
}

// Parses a code block. If a message provided, extracts the additional info (the span length,
// the additional text etc) from the block and modifies the message info accordingly.
//
// Examle:
//
//    |
// 12 |    some code here
//    |         ^^^^ additional text
//    = note: additional note
//
// Returns the number of parsed lines.
function parseCodeBlock(lines, i, msg) {
  var l = i;
  var spanLineNo = -1;
  while (l < lines.length && lines[l] !== '') {
    var line = lines[l];
    var lineParsed = false;
    var codeMatch = /^\s*(\d*)\s*\|.*/.exec(line);
    if (codeMatch) {
      if (codeMatch[1].length > 0) {
        spanLineNo = parseInt(codeMatch[1], 10);
      } else {
        var spanMatch = /^[\s\d]*\|(\s+)([\^-]+)\s*(.*)/.exec(line);
        if (spanMatch) {
          // The line contains span highlight
          var startCol = spanMatch[1].length;
          var light = spanMatch[2];
          var label = spanMatch[3].length > 0 ? spanMatch[3] : undefined;
          if (light[0] === '^') {
            // It's the primary span. Copy the highlighting infro to the main message
            msg.col_end = msg.col + light.length;
            msg.extra.spanLabel = label;
          } else if (light[0] === '-' && label) {
            // It's a secondary span, create a submessage
            msg.trace.push({
              message: label,
              type: 'Note',
              severity: 'info',
              file: msg.file,
              line: spanLineNo,
              line_end: spanLineNo,
              col: startCol,
              col_end: startCol + light.length,
              extra: {}
            });
          }
        }
      }
      lineParsed = true;
    } else {
      var auxMatch = /^\s*= (note|help): (.+)/.exec(line);
      if (auxMatch) {
        msg.trace.push({
          message: auxMatch[2],
          type: err.level2type(auxMatch[1]),
          severity: err.level2severity(auxMatch[1]),
          extra: {}
        });
        lineParsed = true;
      }
    }
    if (!lineParsed && line.startsWith('...')) {
      // Gaps in the source code are displayed this way
      lineParsed = true;
    }
    // TODO: Backward compatibility with Rust prior to 1.12. Remove this if-block when there's no need to support it.
    if (!lineParsed && (/^[^:]*:(\d+)\s+.*/.test(line) || /^\s+\^.*/.test(line))) {
      lineParsed = true;
    }
    if (lineParsed) {
      l += 1;
    } else {
      break;
    }
  }

  return l - i;
}

function parseMessageBlock(lines, i, messages, parentMsg) {
  var l = i;
  var headerInfo = parseMessageHeader(lines, i);
  if (headerInfo) {
    // TODO: Backward compatibility with Rust prior to 1.12. Remove this if-block when there's no need to support it.
    if (parentMsg && (headerInfo.message.severity === 'error' || headerInfo.message.severity === 'warning') || !parentMsg && headerInfo.message.severity !== 'error' && headerInfo.message.severity !== 'warning') {
      return 0;
    }
    // Message header detected, remember it and continue parsing
    l += headerInfo.parsedQty;
    if (parentMsg) {
      // We are parsing a submessage, add it to trace
      parentMsg.trace.push(headerInfo.message);
    } else {
      // We are parsing the main message
      messages.push(headerInfo.message);
    }
    l += parseCodeBlock(lines, l, headerInfo.message);
    // If it's the main message, parse its submessages
    if (!parentMsg) {
      while (l < lines.length) {
        var subParsedQty = parseMessageBlock(lines, l, messages, headerInfo.message);
        if (subParsedQty > 0) {
          l += subParsedQty;
        } else {
          break;
        }
      }
    }
  }

  return l - i;
}

var tryParseMessage = function tryParseMessage(lines, i, messages) {
  return parseMessageBlock(lines, i, messages, null);
};

exports.tryParseMessage = tryParseMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvc3RkLXBhcnNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQU1aLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWdCaEMsU0FBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFO0FBQ3BDLE1BQU0sS0FBSyxHQUFHLGlEQUFpRCxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRSxNQUFJLEtBQUssRUFBRTtBQUNULFFBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixRQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDckIsVUFBTSxRQUFRLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxVQUFJLFFBQVEsRUFBRTtBQUNaLFlBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixZQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLFlBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDOUMsWUFBTSxHQUFHLEdBQUc7QUFDVixpQkFBTyxFQUFFLE9BQU87QUFDaEIsY0FBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFD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QUFPLENBQUMsQ0FBQztBQUMvRSxZQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7QUFDcEIsV0FBQyxJQUFJLFlBQVksQ0FBQztTQUNuQixNQUFNO0FBQ0wsZ0JBQU07U0FDUDtPQUNGO0tBQ0Y7R0FDRjs7QUFFRCxTQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZDs7QUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksS0FBSyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUs7QUFDOUMsU0FBTyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNwRCxDQUFDOztRQUVPLGVBQWUsR0FBZixlQUFlIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvc3RkLXBhcnNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vL1xuLy8gU3RhbmRhcmQgZXJyb3IgZm9ybWF0IHBhcnNlci5cbi8vXG5cbmNvbnN0IGVyciA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG5cbi8vIERldGVjdHMgbWVzc2FnZSBoZWFkZXJzICh0aGUgbWFpbiBtZXNzYWdlIGFuZCBsb2NhdGlvbik6XG4vL1xuLy8gRXhhbWxlczpcbi8vXG4vLyBlcnJvcltFMDAyM106IFNvbWUgZXJyb3IgbWVzc2FnZVxuLy8gICAtLT4gc3JjL21haW4ucnM6MTU3OjEyXG4vL1xuLy8gPHN0ZCBtYWNyb3M+OjE6MzM6IDE6NTggU29tZSBtZXNzYWdlXG4vL1xuLy8gc3JjL21haW4ucnM6MTU3OjEyOiAxNTc6MTggU29tZSBtZXNzYWdlXG4vL1xuLy8gZXJyb3I6IFNvbWV0aGluZyBoYXBwZW5lZFxuLy9cbi8vIFJldHVyc24gdGhlIG1lc3NhZ2UgaW5mcm9tYXRpb24gYW5kIHRoZSBudW1iZXIgb2YgcGFyc2VkIGxpbmVzLlxuZnVuY3Rpb24gcGFyc2VNZXNzYWdlSGVhZGVyKGxpbmVzLCBpKSB7XG4gIGNvbnN0IG1hdGNoID0gL14oZXJyb3J8d2FybmluZ3xub3RlfGhlbHApKD86XFxbKEVcXGQrKVxcXSk/OiAoLiopLy5leGVjKGxpbmVzW2ldKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgY29uc3QgbGV2ZWwgPSBtYXRjaFsxXTtcbiAgICBjb25zdCBjb2RlID0gbWF0Y2hbMl07XG4gICAgY29uc3QgbWVzc2FnZSA9IG1hdGNoWzNdO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPj0gaSkge1xuICAgICAgY29uc3QgbG9jTWF0Y2ggPSAvXlxccyotLT4gKC4rKTooXFxkKyk6KFxcZCspLy5leGVjKGxpbmVzW2kgKyAxXSk7XG4gICAgICBpZiAobG9jTWF0Y2gpIHtcbiAgICAgICAgY29uc3QgbG9jRmlsZSA9IGxvY01hdGNoWzFdO1xuICAgICAgICBjb25zdCBsb2NMaW5lID0gcGFyc2VJbnQobG9jTWF0Y2hbMl0sIDEwKTtcbiAgICAgICAgY29uc3QgbG9jQ29sU3RhcnQgPSBwYXJzZUludChsb2NNYXRjaFszXSwgMTApO1xuICAgICAgICBjb25zdCBtc2cgPSB7XG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICB0eXBlOiBlcnIubGV2ZWwydHlwZShsZXZlbCksXG4gICAgICAgICAgc2V2ZXJpdHk6IGVyci5sZXZlbDJzZXZlcml0eShsZXZlbCksXG4gICAgICAgICAgZmlsZTogbG9jRmlsZSxcbiAgICAgICAgICBsaW5lOiBsb2NMaW5lLFxuICAgICAgICAgIGxpbmVfZW5kOiBsb2NMaW5lLFxuICAgICAgICAgIGNvbDogbG9jQ29sU3RhcnQsXG4gICAgICAgICAgY29sX2VuZDogbG9jQ29sU3RhcnQgKyAxLCAgLy8gSGlnaGxpZ2h0IG9ubHkgb25lIHN5bWJvbCBieSBkZWZhdWx0XG4gICAgICAgICAgdHJhY2U6IFtdLFxuICAgICAgICAgIGV4dHJhOiB7XG4gICAgICAgICAgICBlcnJvckNvZGU6IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChjb2RlICYmIGNvZGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgICAgIGh0bWxfbWVzc2FnZTogJzxhIGhyZWY9XCJodHRwczovL2RvYy5ydXN0LWxhbmcub3JnL2Vycm9yLWluZGV4Lmh0bWwjJyArIG1zZy5leHRyYS5lcnJvckNvZGUgKyAnXCI+RXhwbGFpbiBlcnJvciAnICsgY29kZSArICc8L2E+JyxcbiAgICAgICAgICAgIHR5cGU6ICdFeHBsYW5hdGlvbicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICAgICAgZXh0cmE6IHt9LFxuICAgICAgICAgICAgb3JkZXI6IDEwMCAvLyBBbHdheXMgcHV0IGl0IHRvIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgICAgICBwYXJzZWRRdHk6IDIgICAgLy8gTnVtYmVyIG9mIHBhcnNlZCBsaW5lc1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRyeSB0aGUgZm9ybWF0IHRoYXQgaXMgdXN1YWxseSBmb3VuZCBpbiBlcnJvcnMgd2l0aGluIG1hY3JvczpcbiAgLy8gZmlsZV9uYW1lOmw6YzogbGU6Y2U6IG1lc3NhZ2VcbiAgY29uc3QgbWFjcm9NYXRjaCA9IC9eXFxzKiguKyk6KFxcZCspOihcXGQrKTogKFxcZCspOihcXGQrKSAoZXJyb3J8d2FybmluZ3xub3RlfGhlbHApOlxccyooLiopLy5leGVjKGxpbmVzW2ldKTtcbiAgaWYgKG1hY3JvTWF0Y2gpIHtcbiAgICBjb25zdCBtc2cgPSB7XG4gICAgICBtZXNzYWdlOiBtYWNyb01hdGNoWzddLFxuICAgICAgdHlwZTogZXJyLmxldmVsMnR5cGUobWFjcm9NYXRjaFs2XSksXG4gICAgICBzZXZlcml0eTogZXJyLmxldmVsMnNldmVyaXR5KG1hY3JvTWF0Y2hbNl0pLFxuICAgICAgZmlsZTogbWFjcm9NYXRjaFsxXSxcbiAgICAgIGxpbmU6IHBhcnNlSW50KG1hY3JvTWF0Y2hbMl0sIDEwKSxcbiAgICAgIGxpbmVfZW5kOiBwYXJzZUludChtYWNyb01hdGNoWzRdLCAxMCksXG4gICAgICBjb2w6IHBhcnNlSW50KG1hY3JvTWF0Y2hbM10sIDEwKSxcbiAgICAgIGNvbF9lbmQ6IHBhcnNlSW50KG1hY3JvTWF0Y2hbNV0sIDEwKSxcbiAgICAgIHRyYWNlOiBbXSxcbiAgICAgIGV4dHJhOiB7fVxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgIHBhcnNlZFF0eTogMSAgICAvLyBOdW1iZXIgb2YgcGFyc2VkIGxpbmVzXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRyeSB0aGUgc2ltcGxlc3QgZm9ybWF0OlxuICAvLyBlcnJvcjogbWVzc2FnZVxuICBjb25zdCBzaW1wbGVNYXRjaCA9IC9eXFxzKihlcnJvcnx3YXJuaW5nfG5vdGV8aGVscCk6XFxzKiguKikvLmV4ZWMobGluZXNbaV0pO1xuICBpZiAoc2ltcGxlTWF0Y2gpIHtcbiAgICBjb25zdCBtc2cgPSB7XG4gICAgICBtZXNzYWdlOiBzaW1wbGVNYXRjaFsyXSxcbiAgICAgIHR5cGU6IGVyci5sZXZlbDJ0eXBlKHNpbXBsZU1hdGNoWzFdKSxcbiAgICAgIHNldmVyaXR5OiBlcnIubGV2ZWwyc2V2ZXJpdHkoc2ltcGxlTWF0Y2hbMV0pLFxuICAgICAgdHJhY2U6IFtdLFxuICAgICAgZXh0cmE6IHt9XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgcGFyc2VkUXR5OiAxICAgIC8vIE51bWJlciBvZiBwYXJzZWQgbGluZXNcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLy8gUGFyc2VzIGEgY29kZSBibG9jay4gSWYgYSBtZXNzYWdlIHByb3ZpZGVkLCBleHRyYWN0cyB0aGUgYWRkaXRpb25hbCBpbmZvICh0aGUgc3BhbiBsZW5ndGgsXG4vLyB0aGUgYWRkaXRpb25hbCB0ZXh0IGV0YykgZnJvbSB0aGUgYmxvY2sgYW5kIG1vZGlmaWVzIHRoZSBtZXNzYWdlIGluZm8gYWNjb3JkaW5nbHkuXG4vL1xuLy8gRXhhbWxlOlxuLy9cbi8vICAgIHxcbi8vIDEyIHwgICAgc29tZSBjb2RlIGhlcmVcbi8vICAgIHwgICAgICAgICBeXl5eIGFkZGl0aW9uYWwgdGV4dFxuLy8gICAgPSBub3RlOiBhZGRpdGlvbmFsIG5vdGVcbi8vXG4vLyBSZXR1cm5zIHRoZSBudW1iZXIgb2YgcGFyc2VkIGxpbmVzLlxuZnVuY3Rpb24gcGFyc2VDb2RlQmxvY2sobGluZXMsIGksIG1zZykge1xuICBsZXQgbCA9IGk7XG4gIGxldCBzcGFuTGluZU5vID0gLTE7XG4gIHdoaWxlIChsIDwgbGluZXMubGVuZ3RoICYmIGxpbmVzW2xdICE9PSAnJykge1xuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tsXTtcbiAgICBsZXQgbGluZVBhcnNlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGNvZGVNYXRjaCA9IC9eXFxzKihcXGQqKVxccypcXHwuKi8uZXhlYyhsaW5lKTtcbiAgICBpZiAoY29kZU1hdGNoKSB7XG4gICAgICBpZiAoY29kZU1hdGNoWzFdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3BhbkxpbmVObyA9IHBhcnNlSW50KGNvZGVNYXRjaFsxXSwgMTApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3Bhbk1hdGNoID0gL15bXFxzXFxkXSpcXHwoXFxzKykoW1xcXi1dKylcXHMqKC4qKS8uZXhlYyhsaW5lKTtcbiAgICAgICAgaWYgKHNwYW5NYXRjaCkge1xuICAgICAgICAgIC8vIFRoZSBsaW5lIGNvbnRhaW5zIHNwYW4gaGlnaGxpZ2h0XG4gICAgICAgICAgY29uc3Qgc3RhcnRDb2wgPSBzcGFuTWF0Y2hbMV0ubGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGxpZ2h0ID0gc3Bhbk1hdGNoWzJdO1xuICAgICAgICAgIGNvbnN0IGxhYmVsID0gc3Bhbk1hdGNoWzNdLmxlbmd0aCA+IDAgPyBzcGFuTWF0Y2hbM10gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGxpZ2h0WzBdID09PSAnXicpIHtcbiAgICAgICAgICAgIC8vIEl0J3MgdGhlIHByaW1hcnkgc3Bhbi4gQ29weSB0aGUgaGlnaGxpZ2h0aW5nIGluZnJvIHRvIHRoZSBtYWluIG1lc3NhZ2VcbiAgICAgICAgICAgIG1zZy5jb2xfZW5kID0gbXNnLmNvbCArIGxpZ2h0Lmxlbmd0aDtcbiAgICAgICAgICAgIG1zZy5leHRyYS5zcGFuTGFiZWwgPSBsYWJlbDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpZ2h0WzBdID09PSAnLScgJiYgbGFiZWwpIHtcbiAgICAgICAgICAgIC8vIEl0J3MgYSBzZWNvbmRhcnkgc3BhbiwgY3JlYXRlIGEgc3VibWVzc2FnZVxuICAgICAgICAgICAgbXNnLnRyYWNlLnB1c2goe1xuICAgICAgICAgICAgICBtZXNzYWdlOiBsYWJlbCxcbiAgICAgICAgICAgICAgdHlwZTogJ05vdGUnLFxuICAgICAgICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICAgICAgICBmaWxlOiBtc2cuZmlsZSxcbiAgICAgICAgICAgICAgbGluZTogc3BhbkxpbmVObyxcbiAgICAgICAgICAgICAgbGluZV9lbmQ6IHNwYW5MaW5lTm8sXG4gICAgICAgICAgICAgIGNvbDogc3RhcnRDb2wsXG4gICAgICAgICAgICAgIGNvbF9lbmQ6IHN0YXJ0Q29sICsgbGlnaHQubGVuZ3RoLFxuICAgICAgICAgICAgICBleHRyYToge31cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZVBhcnNlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGF1eE1hdGNoID0gL15cXHMqPSAobm90ZXxoZWxwKTogKC4rKS8uZXhlYyhsaW5lKTtcbiAgICAgIGlmIChhdXhNYXRjaCkge1xuICAgICAgICBtc2cudHJhY2UucHVzaCh7XG4gICAgICAgICAgbWVzc2FnZTogYXV4TWF0Y2hbMl0sXG4gICAgICAgICAgdHlwZTogZXJyLmxldmVsMnR5cGUoYXV4TWF0Y2hbMV0pLFxuICAgICAgICAgIHNldmVyaXR5OiBlcnIubGV2ZWwyc2V2ZXJpdHkoYXV4TWF0Y2hbMV0pLFxuICAgICAgICAgIGV4dHJhOiB7fVxuICAgICAgICB9KTtcbiAgICAgICAgbGluZVBhcnNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbGluZVBhcnNlZCAmJiBsaW5lLnN0YXJ0c1dpdGgoJy4uLicpKSB7ICAvLyBHYXBzIGluIHRoZSBzb3VyY2UgY29kZSBhcmUgZGlzcGxheWVkIHRoaXMgd2F5XG4gICAgICBsaW5lUGFyc2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gVE9ETzogQmFja3dhcmQgY29tcGF0aWJpbGl0eSB3aXRoIFJ1c3QgcHJpb3IgdG8gMS4xMi4gUmVtb3ZlIHRoaXMgaWYtYmxvY2sgd2hlbiB0aGVyZSdzIG5vIG5lZWQgdG8gc3VwcG9ydCBpdC5cbiAgICBpZiAoIWxpbmVQYXJzZWQgJiYgKC9eW146XSo6KFxcZCspXFxzKy4qLy50ZXN0KGxpbmUpIHx8IC9eXFxzK1xcXi4qLy50ZXN0KGxpbmUpKSkge1xuICAgICAgbGluZVBhcnNlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChsaW5lUGFyc2VkKSB7XG4gICAgICBsICs9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsIC0gaTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXNzYWdlQmxvY2sobGluZXMsIGksIG1lc3NhZ2VzLCBwYXJlbnRNc2cpIHtcbiAgbGV0IGwgPSBpO1xuICBjb25zdCBoZWFkZXJJbmZvID0gcGFyc2VNZXNzYWdlSGVhZGVyKGxpbmVzLCBpKTtcbiAgaWYgKGhlYWRlckluZm8pIHtcbiAgICAvLyBUT0RPOiBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggUnVzdCBwcmlvciB0byAxLjEyLiBSZW1vdmUgdGhpcyBpZi1ibG9jayB3aGVuIHRoZXJlJ3Mgbm8gbmVlZCB0byBzdXBwb3J0IGl0LlxuICAgIGlmICgocGFyZW50TXNnICYmIChoZWFkZXJJbmZvLm1lc3NhZ2Uuc2V2ZXJpdHkgPT09ICdlcnJvcicgfHwgaGVhZGVySW5mby5tZXNzYWdlLnNldmVyaXR5ID09PSAnd2FybmluZycpKVxuICAgICAgICB8fCAoIXBhcmVudE1zZyAmJiBoZWFkZXJJbmZvLm1lc3NhZ2Uuc2V2ZXJpdHkgIT09ICdlcnJvcicgJiYgaGVhZGVySW5mby5tZXNzYWdlLnNldmVyaXR5ICE9PSAnd2FybmluZycpKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgLy8gTWVzc2FnZSBoZWFkZXIgZGV0ZWN0ZWQsIHJlbWVtYmVyIGl0IGFuZCBjb250aW51ZSBwYXJzaW5nXG4gICAgbCArPSBoZWFkZXJJbmZvLnBhcnNlZFF0eTtcbiAgICBpZiAocGFyZW50TXNnKSB7XG4gICAgICAvLyBXZSBhcmUgcGFyc2luZyBhIHN1Ym1lc3NhZ2UsIGFkZCBpdCB0byB0cmFjZVxuICAgICAgcGFyZW50TXNnLnRyYWNlLnB1c2goaGVhZGVySW5mby5tZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgYXJlIHBhcnNpbmcgdGhlIG1haW4gbWVzc2FnZVxuICAgICAgbWVzc2FnZXMucHVzaChoZWFkZXJJbmZvLm1lc3NhZ2UpO1xuICAgIH1cbiAgICBsICs9IHBhcnNlQ29kZUJsb2NrKGxpbmVzLCBsLCBoZWFkZXJJbmZvLm1lc3NhZ2UpO1xuICAgIC8vIElmIGl0J3MgdGhlIG1haW4gbWVzc2FnZSwgcGFyc2UgaXRzIHN1Ym1lc3NhZ2VzXG4gICAgaWYgKCFwYXJlbnRNc2cpIHtcbiAgICAgIHdoaWxlIChsIDwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHN1YlBhcnNlZFF0eSA9IHBhcnNlTWVzc2FnZUJsb2NrKGxpbmVzLCBsLCBtZXNzYWdlcywgaGVhZGVySW5mby5tZXNzYWdlKTtcbiAgICAgICAgaWYgKHN1YlBhcnNlZFF0eSA+IDApIHtcbiAgICAgICAgICBsICs9IHN1YlBhcnNlZFF0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsIC0gaTtcbn1cblxuY29uc3QgdHJ5UGFyc2VNZXNzYWdlID0gKGxpbmVzLCBpLCBtZXNzYWdlcykgPT4ge1xuICByZXR1cm4gcGFyc2VNZXNzYWdlQmxvY2sobGluZXMsIGksIG1lc3NhZ2VzLCBudWxsKTtcbn07XG5cbmV4cG9ydCB7IHRyeVBhcnNlTWVzc2FnZSB9O1xuIl19