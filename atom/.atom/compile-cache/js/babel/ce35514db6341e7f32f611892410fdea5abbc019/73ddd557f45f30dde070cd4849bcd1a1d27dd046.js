'use babel';

//
// Utility functions for parsing errors
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var notificationCfg = { dismissable: true };

// Meta errors are ignored
var metaErrors = [/aborting due to (\d+ )?previous error[s]?/, /Could not compile `.+`./];

// Collection of span labels that must be ignored (not added to the main message)
// because the main message already contains the same information
var redundantLabels = [{
  // E0001
  label: /this is an unreachable pattern/,
  message: /unreachable pattern/
}, {
  // E0004
  label: /pattern `.+` not covered/,
  message: /non-exhaustive patterns: `.+` not covered/
}, {
  // E00023
  label: /expected \d+ field[s]?, found \d+/,
  message: /this pattern has \d+ field[s]?, but the corresponding variant has \d+ field[s]?/
}, {
  // E0026
  label: /struct `.+` does not have field `.+`/,
  message: /struct `.+` does not have a field named `.+`/
}, {
  // E0027
  label: /missing field `.+`/,
  message: /pattern does not mention field `.+`/
}, {
  // E0029
  label: /ranges require char or numeric types/,
  message: /only char and numeric types are allowed in range patterns/
}, {
  // E0040
  label: /call to destructor method/,
  message: /explicit use of destructor method/
}, {
  // E0046
  label: /missing `.+` in implementation/,
  message: /not all trait items implemented, missing: `.+`/
}, {
  // E0057
  label: /expected \d+ parameter[s]?/,
  message: /this function takes \d+ parameter[s]? but \d+ parameter[s]? (was|were) supplied/
}, {
  // E0062
  label: /used more than once/,
  message: /field `.+` specified more than once/
}, {
  // E0067
  label: /invalid expression for left-hand side/,
  message: /invalid left-hand side expression/
}, {
  // E0068
  label: /return type is not \(\)/,
  message: /`return;` in a function whose return type is not `\(\)`/
}, {
  // E0071
  label: /not a struct/,
  message: /`.+` does not name a struct or a struct variant/
}, {
  // E0072
  label: /recursive type has infinite size/,
  message: /recursive type `.+` has infinite size/
}, {
  // E0087
  label: /expected \d+ parameter[s]?/,
  message: /too many type parameters provided: expected at most \d+ parameter[s]?, found \d+ parameter[s]?/
}, {
  // E0091
  label: /unused type parameter/,
  message: /type parameter `.+` is unused/
}, {
  // E0101
  label: /cannot resolve type of expression/,
  message: /cannot determine a type for this expression: unconstrained type/
}, {
  // E0102
  label: /cannot resolve type of variable/,
  message: /cannot determine a type for this local variable: unconstrained type/
}, {
  // E0106
  label: /expected lifetime parameter/,
  message: /missing lifetime specifier/
}, {
  // E0107
  label: /(un)?expected (\d+ )?lifetime parameter[s]?/,
  message: /wrong number of lifetime parameters: expected \d+, found \d+/
}, {
  // E0109
  label: /type parameter not allowed/,
  message: /type parameters are not allowed on this type/
}, {
  // E0110
  label: /lifetime parameter not allowed/,
  message: /lifetime parameters are not allowed on this type/
}, {
  // E0116
  label: /impl for type defined outside of crate/,
  message: /cannot define inherent `.+` for a type outside of the crate where the type is defined/
}, {
  // E0117
  label: /impl doesn't use types inside crate/,
  message: /only traits defined in the current crate can be implemented for arbitrary types/
}, {
  // E0119
  label: /conflicting implementation for `.+`/,
  message: /conflicting implementations of trait `.+` for type `.+`/
}, {
  // E0120
  label: /implementing Drop requires a struct/,
  message: /the Drop trait may only be implemented on structures/
}, {
  // E0121
  label: /not allowed in type signatures/,
  message: /the type placeholder `_` is not allowed within types on item signatures/
}, {
  // E0124
  label: /field already declared/,
  message: /field `.+` is already declared/
}, {
  // E0368
  label: /cannot use `[<>+&|^\-]?=` on type `.+`/,
  message: /binary assignment operation `[<>+&|^\-]?=` cannot be applied to type `.+`/
}, {
  // E0387
  label: /cannot borrow mutably/,
  message: /cannot borrow immutable local variable `.+` as mutable/
}];

var level2severity = function level2severity(level) {
  switch (level) {
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'note':
      return 'info';
    case 'help':
      return 'info';
    default:
      return 'error';
  }
};

var level2type = function level2type(level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

// Appends a span label to the main message if it's not redundant.
function appendSpanLabel(msg) {
  if (msg.extra.spanLabel && msg.extra.spanLabel.length > 0) {
    var label = msg.extra.spanLabel;
    if (msg.message.indexOf(label) >= 0) {
      return; // Label is contained within the main message
    }
    for (var i = 0; i < redundantLabels.length; i++) {
      var l = redundantLabels[i];
      if (l.label.test(label) && l.message.test(msg.message)) {
        return; // Submesage fits one of the deduplication patterns
      }
    }
    msg.message += ' (' + label + ')';
  }
}

// Adds the error code to the message
function appendErrorCode(msg) {
  if (msg.extra.errorCode && msg.extra.errorCode.length > 0) {
    msg.message += ' [' + msg.extra.errorCode + ']';
  }
}

// Adds an extra info (if provided) to the message.
// Deletes the extra info after extracting.
function appendExtraInfo(msg) {
  if (msg.extra) {
    appendSpanLabel(msg);
    appendErrorCode(msg);
    delete msg.extra;
  }
}

// Checks if the location of the given message is valid
function isValidLocation(msg) {
  return msg.file && !msg.file.startsWith('<');
}

// Removes location info from the given message
function removeLocation(msg) {
  delete msg.file;
  delete msg.line;
  delete msg.line_end;
  delete msg.col;
  delete msg.col_end;
}

// Copies location info from one message to another
function copyLocation(fromMsg, toMsg) {
  toMsg.file = fromMsg.file;
  toMsg.line = fromMsg.line;
  toMsg.line_end = fromMsg.line_end;
  toMsg.col = fromMsg.col;
  toMsg.col_end = fromMsg.col_end;
}

// Removes location info from the submessage if it's exactly the same as in
// the main message.
// Fixes locations that don't point to a valid source code.
// Example: <std macros>:1:33: 1:60
function normalizeLocations(msg) {
  for (var i = 0; i < msg.trace.length; i++) {
    var subMsg = msg.trace[i];
    // Deduplicate location
    if (!isValidLocation(subMsg) || subMsg.file === msg.file && subMsg.line === msg.line && subMsg.col === msg.col) {
      removeLocation(subMsg);
    }
    if (!isValidLocation(msg) && isValidLocation(subMsg)) {
      copyLocation(subMsg, msg);
      removeLocation(subMsg);
    }
  }
}

// Set location for special cases when the compiler doesn't provide it
function preprocessMessage(msg, buildWorkDir) {
  appendExtraInfo(msg);
  normalizeLocations(msg);
  // Reorder trace items if needed.
  // Not explicitly ordered items always go first in their original order.
  msg.trace.sort(function (a, b) {
    if (!a.order && b.order) {
      return -1;
    }
    return a.order && b.order ? a.order - b.order : 1;
  });
  // Check if the message can be added to Linter
  if (isValidLocation(msg)) {
    return true;
  }
  // Ignore meta errors
  for (var i = 0; i < metaErrors.length; i++) {
    if (metaErrors[i].test(msg.message)) {
      return false;
    }
  }
  // Location is not provided for the message, so it cannot be added to Linter.
  // Display it as a notification.
  switch (msg.level) {
    case 'info':
    case 'note':
      atom.notifications.addInfo(msg.message, notificationCfg);
      break;
    case 'warning':
      atom.notifications.addWarning(msg.message, notificationCfg);
      break;
    default:
      atom.notifications.addError(msg.message, notificationCfg);
  }
  return false;
}

exports.level2severity = level2severity;
exports.level2type = level2type;
exports.preprocessMessage = preprocessMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvZXJyb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FBTVosSUFBTSxlQUFlLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUM7OztBQUc5QyxJQUFNLFVBQVUsR0FBRyxDQUNqQiwyQ0FBMkMsRUFDM0MseUJBQXlCLENBQzFCLENBQUM7Ozs7QUFJRixJQUFNLGVBQWUsR0FBRyxDQUFDOztBQUV2QixPQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLFNBQU8sRUFBRSxxQkFBcUI7Q0FDL0IsRUFBRTs7QUFFRCxPQUFLLEVBQUUsMEJBQTBCO0FBQ2pDLFNBQU8sRUFBRSwyQ0FBMkM7Q0FDckQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsbUNBQW1DO0FBQzFDLFNBQU8sRUFBRSxpRkFBaUY7Q0FDM0YsRUFBRTs7QUFFRCxPQUFLLEVBQUUsc0NBQXNDO0FBQzdDLFNBQU8sRUFBRSw4Q0FBOEM7Q0FDeEQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFNBQU8sRUFBRSxxQ0FBcUM7Q0FDL0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsc0NBQXNDO0FBQzdDLFNBQU8sRUFBRSwyREFBMkQ7Q0FDckUsRUFBRTs7QUFFRCxPQUFLLEVBQUUsMkJBQTJCO0FBQ2xDLFNBQU8sRUFBRSxtQ0FBbUM7Q0FDN0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLFNBQU8sRUFBRSxnREFBZ0Q7Q0FDMUQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsNEJBQTRCO0FBQ25DLFNBQU8sRUFBRSxpRkFBaUY7Q0FDM0YsRUFBRTs7QUFFRCxPQUFLLEVBQUUscUJBQXFCO0FBQzVCLFNBQU8sRUFBRSxxQ0FBcUM7Q0FDL0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsdUNBQXVDO0FBQzlDLFNBQU8sRUFBRSxtQ0FBbUM7Q0FD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LGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUFBLEdBQzdEO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZDs7UUFFUSxjQUFjLEdBQWQsY0FBYztRQUFFLFVBQVUsR0FBVixVQUFVO1FBQUUsaUJBQWlCLEdBQWpCLGlCQUFpQiIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2Vycm9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vL1xuLy8gVXRpbGl0eSBmdW5jdGlvbnMgZm9yIHBhcnNpbmcgZXJyb3JzXG4vL1xuXG5jb25zdCBub3RpZmljYXRpb25DZmcgPSB7IGRpc21pc3NhYmxlOiB0cnVlIH07XG5cbi8vIE1ldGEgZXJyb3JzIGFyZSBpZ25vcmVkXG5jb25zdCBtZXRhRXJyb3JzID0gW1xuICAvYWJvcnRpbmcgZHVlIHRvIChcXGQrICk/cHJldmlvdXMgZXJyb3Jbc10/LyxcbiAgL0NvdWxkIG5vdCBjb21waWxlIGAuK2AuL1xuXTtcblxuLy8gQ29sbGVjdGlvbiBvZiBzcGFuIGxhYmVscyB0aGF0IG11c3QgYmUgaWdub3JlZCAobm90IGFkZGVkIHRvIHRoZSBtYWluIG1lc3NhZ2UpXG4vLyBiZWNhdXNlIHRoZSBtYWluIG1lc3NhZ2UgYWxyZWFkeSBjb250YWlucyB0aGUgc2FtZSBpbmZvcm1hdGlvblxuY29uc3QgcmVkdW5kYW50TGFiZWxzID0gW3tcbiAgLy8gRTAwMDFcbiAgbGFiZWw6IC90aGlzIGlzIGFuIHVucmVhY2hhYmxlIHBhdHRlcm4vLFxuICBtZXNzYWdlOiAvdW5yZWFjaGFibGUgcGF0dGVybi9cbn0sIHtcbiAgLy8gRTAwMDRcbiAgbGFiZWw6IC9wYXR0ZXJuIGAuK2Agbm90IGNvdmVyZWQvLFxuICBtZXNzYWdlOiAvbm9uLWV4aGF1c3RpdmUgcGF0dGVybnM6IGAuK2Agbm90IGNvdmVyZWQvXG59LCB7XG4gIC8vIEUwMDAyM1xuICBsYWJlbDogL2V4cGVjdGVkIFxcZCsgZmllbGRbc10/LCBmb3VuZCBcXGQrLyxcbiAgbWVzc2FnZTogL3RoaXMgcGF0dGVybiBoYXMgXFxkKyBmaWVsZFtzXT8sIGJ1dCB0aGUgY29ycmVzcG9uZGluZyB2YXJpYW50IGhhcyBcXGQrIGZpZWxkW3NdPy9cbn0sIHtcbiAgLy8gRTAwMjZcbiAgbGFiZWw6IC9zdHJ1Y3QgYC4rYCBkb2VzIG5vdCBoYXZlIGZpZWxkIGAuK2AvLFxuICBtZXNzYWdlOiAvc3RydWN0IGAuK2AgZG9lcyBub3QgaGF2ZSBhIGZpZWxkIG5hbWVkIGAuK2AvXG59LCB7XG4gIC8vIEUwMDI3XG4gIGxhYmVsOiAvbWlzc2luZyBmaWVsZCBgLitgLyxcbiAgbWVzc2FnZTogL3BhdHRlcm4gZG9lcyBub3QgbWVudGlvbiBmaWVsZCBgLitgL1xufSwge1xuICAvLyBFMDAyOVxuICBsYWJlbDogL3JhbmdlcyByZXF1aXJlIGNoYXIgb3IgbnVtZXJpYyB0eXBlcy8sXG4gIG1lc3NhZ2U6IC9vbmx5IGNoYXIgYW5kIG51bWVyaWMgdHlwZXMgYXJlIGFsbG93ZWQgaW4gcmFuZ2UgcGF0dGVybnMvXG59LCB7XG4gIC8vIEUwMDQwXG4gIGxhYmVsOiAvY2FsbCB0byBkZXN0cnVjdG9yIG1ldGhvZC8sXG4gIG1lc3NhZ2U6IC9leHBsaWNpdCB1c2Ugb2YgZGVzdHJ1Y3RvciBtZXRob2QvXG59LCB7XG4gIC8vIEUwMDQ2XG4gIGxhYmVsOiAvbWlzc2luZyBgLitgIGluIGltcGxlbWVudGF0aW9uLyxcbiAgbWVzc2FnZTogL25vdCBhbGwgdHJhaXQgaXRlbXMgaW1wbGVtZW50ZWQsIG1pc3Npbmc6IGAuK2AvXG59LCB7XG4gIC8vIEUwMDU3XG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3RoaXMgZnVuY3Rpb24gdGFrZXMgXFxkKyBwYXJhbWV0ZXJbc10/IGJ1dCBcXGQrIHBhcmFtZXRlcltzXT8gKHdhc3x3ZXJlKSBzdXBwbGllZC9cbn0sIHtcbiAgLy8gRTAwNjJcbiAgbGFiZWw6IC91c2VkIG1vcmUgdGhhbiBvbmNlLyxcbiAgbWVzc2FnZTogL2ZpZWxkIGAuK2Agc3BlY2lmaWVkIG1vcmUgdGhhbiBvbmNlL1xufSwge1xuICAvLyBFMDA2N1xuICBsYWJlbDogL2ludmFsaWQgZXhwcmVzc2lvbiBmb3IgbGVmdC1oYW5kIHNpZGUvLFxuICBtZXNzYWdlOiAvaW52YWxpZCBsZWZ0LWhhbmQgc2lkZSBleHByZXNzaW9uL1xufSwge1xuICAvLyBFMDA2OFxuICBsYWJlbDogL3JldHVybiB0eXBlIGlzIG5vdCBcXChcXCkvLFxuICBtZXNzYWdlOiAvYHJldHVybjtgIGluIGEgZnVuY3Rpb24gd2hvc2UgcmV0dXJuIHR5cGUgaXMgbm90IGBcXChcXClgL1xufSwge1xuICAvLyBFMDA3MVxuICBsYWJlbDogL25vdCBhIHN0cnVjdC8sXG4gIG1lc3NhZ2U6IC9gLitgIGRvZXMgbm90IG5hbWUgYSBzdHJ1Y3Qgb3IgYSBzdHJ1Y3QgdmFyaWFudC9cbn0sIHtcbiAgLy8gRTAwNzJcbiAgbGFiZWw6IC9yZWN1cnNpdmUgdHlwZSBoYXMgaW5maW5pdGUgc2l6ZS8sXG4gIG1lc3NhZ2U6IC9yZWN1cnNpdmUgdHlwZSBgLitgIGhhcyBpbmZpbml0ZSBzaXplL1xufSwge1xuICAvLyBFMDA4N1xuICBsYWJlbDogL2V4cGVjdGVkIFxcZCsgcGFyYW1ldGVyW3NdPy8sXG4gIG1lc3NhZ2U6IC90b28gbWFueSB0eXBlIHBhcmFtZXRlcnMgcHJvdmlkZWQ6IGV4cGVjdGVkIGF0IG1vc3QgXFxkKyBwYXJhbWV0ZXJbc10/LCBmb3VuZCBcXGQrIHBhcmFtZXRlcltzXT8vXG59LCB7XG4gIC8vIEUwMDkxXG4gIGxhYmVsOiAvdW51c2VkIHR5cGUgcGFyYW1ldGVyLyxcbiAgbWVzc2FnZTogL3R5cGUgcGFyYW1ldGVyIGAuK2AgaXMgdW51c2VkL1xufSwge1xuICAvLyBFMDEwMVxuICBsYWJlbDogL2Nhbm5vdCByZXNvbHZlIHR5cGUgb2YgZXhwcmVzc2lvbi8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgZGV0ZXJtaW5lIGEgdHlwZSBmb3IgdGhpcyBleHByZXNzaW9uOiB1bmNvbnN0cmFpbmVkIHR5cGUvXG59LCB7XG4gIC8vIEUwMTAyXG4gIGxhYmVsOiAvY2Fubm90IHJlc29sdmUgdHlwZSBvZiB2YXJpYWJsZS8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgZGV0ZXJtaW5lIGEgdHlwZSBmb3IgdGhpcyBsb2NhbCB2YXJpYWJsZTogdW5jb25zdHJhaW5lZCB0eXBlL1xufSwge1xuICAvLyBFMDEwNlxuICBsYWJlbDogL2V4cGVjdGVkIGxpZmV0aW1lIHBhcmFtZXRlci8sXG4gIG1lc3NhZ2U6IC9taXNzaW5nIGxpZmV0aW1lIHNwZWNpZmllci9cbn0sIHtcbiAgLy8gRTAxMDdcbiAgbGFiZWw6IC8odW4pP2V4cGVjdGVkIChcXGQrICk/bGlmZXRpbWUgcGFyYW1ldGVyW3NdPy8sXG4gIG1lc3NhZ2U6IC93cm9uZyBudW1iZXIgb2YgbGlmZXRpbWUgcGFyYW1ldGVyczogZXhwZWN0ZWQgXFxkKywgZm91bmQgXFxkKy9cbn0sIHtcbiAgLy8gRTAxMDlcbiAgbGFiZWw6IC90eXBlIHBhcmFtZXRlciBub3QgYWxsb3dlZC8sXG4gIG1lc3NhZ2U6IC90eXBlIHBhcmFtZXRlcnMgYXJlIG5vdCBhbGxvd2VkIG9uIHRoaXMgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMTBcbiAgbGFiZWw6IC9saWZldGltZSBwYXJhbWV0ZXIgbm90IGFsbG93ZWQvLFxuICBtZXNzYWdlOiAvbGlmZXRpbWUgcGFyYW1ldGVycyBhcmUgbm90IGFsbG93ZWQgb24gdGhpcyB0eXBlL1xufSwge1xuICAvLyBFMDExNlxuICBsYWJlbDogL2ltcGwgZm9yIHR5cGUgZGVmaW5lZCBvdXRzaWRlIG9mIGNyYXRlLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZWZpbmUgaW5oZXJlbnQgYC4rYCBmb3IgYSB0eXBlIG91dHNpZGUgb2YgdGhlIGNyYXRlIHdoZXJlIHRoZSB0eXBlIGlzIGRlZmluZWQvXG59LCB7XG4gIC8vIEUwMTE3XG4gIGxhYmVsOiAvaW1wbCBkb2Vzbid0IHVzZSB0eXBlcyBpbnNpZGUgY3JhdGUvLFxuICBtZXNzYWdlOiAvb25seSB0cmFpdHMgZGVmaW5lZCBpbiB0aGUgY3VycmVudCBjcmF0ZSBjYW4gYmUgaW1wbGVtZW50ZWQgZm9yIGFyYml0cmFyeSB0eXBlcy9cbn0sIHtcbiAgLy8gRTAxMTlcbiAgbGFiZWw6IC9jb25mbGljdGluZyBpbXBsZW1lbnRhdGlvbiBmb3IgYC4rYC8sXG4gIG1lc3NhZ2U6IC9jb25mbGljdGluZyBpbXBsZW1lbnRhdGlvbnMgb2YgdHJhaXQgYC4rYCBmb3IgdHlwZSBgLitgL1xufSwge1xuICAvLyBFMDEyMFxuICBsYWJlbDogL2ltcGxlbWVudGluZyBEcm9wIHJlcXVpcmVzIGEgc3RydWN0LyxcbiAgbWVzc2FnZTogL3RoZSBEcm9wIHRyYWl0IG1heSBvbmx5IGJlIGltcGxlbWVudGVkIG9uIHN0cnVjdHVyZXMvXG59LCB7XG4gIC8vIEUwMTIxXG4gIGxhYmVsOiAvbm90IGFsbG93ZWQgaW4gdHlwZSBzaWduYXR1cmVzLyxcbiAgbWVzc2FnZTogL3RoZSB0eXBlIHBsYWNlaG9sZGVyIGBfYCBpcyBub3QgYWxsb3dlZCB3aXRoaW4gdHlwZXMgb24gaXRlbSBzaWduYXR1cmVzL1xufSwge1xuICAvLyBFMDEyNFxuICBsYWJlbDogL2ZpZWxkIGFscmVhZHkgZGVjbGFyZWQvLFxuICBtZXNzYWdlOiAvZmllbGQgYC4rYCBpcyBhbHJlYWR5IGRlY2xhcmVkL1xufSwge1xuICAvLyBFMDM2OFxuICBsYWJlbDogL2Nhbm5vdCB1c2UgYFs8PismfF5cXC1dPz1gIG9uIHR5cGUgYC4rYC8sXG4gIG1lc3NhZ2U6IC9iaW5hcnkgYXNzaWdubWVudCBvcGVyYXRpb24gYFs8PismfF5cXC1dPz1gIGNhbm5vdCBiZSBhcHBsaWVkIHRvIHR5cGUgYC4rYC9cbn0sIHtcbiAgLy8gRTAzODdcbiAgbGFiZWw6IC9jYW5ub3QgYm9ycm93IG11dGFibHkvLFxuICBtZXNzYWdlOiAvY2Fubm90IGJvcnJvdyBpbW11dGFibGUgbG9jYWwgdmFyaWFibGUgYC4rYCBhcyBtdXRhYmxlL1xufV07XG5cbmNvbnN0IGxldmVsMnNldmVyaXR5ID0gKGxldmVsKSA9PiB7XG4gIHN3aXRjaCAobGV2ZWwpIHtcbiAgICBjYXNlICd3YXJuaW5nJzogcmV0dXJuICd3YXJuaW5nJztcbiAgICBjYXNlICdlcnJvcic6IHJldHVybiAnZXJyb3InO1xuICAgIGNhc2UgJ25vdGUnOiByZXR1cm4gJ2luZm8nO1xuICAgIGNhc2UgJ2hlbHAnOiByZXR1cm4gJ2luZm8nO1xuICAgIGRlZmF1bHQ6IHJldHVybiAnZXJyb3InO1xuICB9XG59O1xuXG5jb25zdCBsZXZlbDJ0eXBlID0gKGxldmVsKSA9PiB7XG4gIHJldHVybiBsZXZlbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGxldmVsLnNsaWNlKDEpO1xufTtcblxuLy8gQXBwZW5kcyBhIHNwYW4gbGFiZWwgdG8gdGhlIG1haW4gbWVzc2FnZSBpZiBpdCdzIG5vdCByZWR1bmRhbnQuXG5mdW5jdGlvbiBhcHBlbmRTcGFuTGFiZWwobXNnKSB7XG4gIGlmIChtc2cuZXh0cmEuc3BhbkxhYmVsICYmIG1zZy5leHRyYS5zcGFuTGFiZWwubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxhYmVsID0gbXNnLmV4dHJhLnNwYW5MYWJlbDtcbiAgICBpZiAobXNnLm1lc3NhZ2UuaW5kZXhPZihsYWJlbCkgPj0gMCkge1xuICAgICAgcmV0dXJuOyAgICAgIC8vIExhYmVsIGlzIGNvbnRhaW5lZCB3aXRoaW4gdGhlIG1haW4gbWVzc2FnZVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZHVuZGFudExhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbCA9IHJlZHVuZGFudExhYmVsc1tpXTtcbiAgICAgIGlmIChsLmxhYmVsLnRlc3QobGFiZWwpICYmIGwubWVzc2FnZS50ZXN0KG1zZy5tZXNzYWdlKSkge1xuICAgICAgICByZXR1cm47ICAgIC8vIFN1Ym1lc2FnZSBmaXRzIG9uZSBvZiB0aGUgZGVkdXBsaWNhdGlvbiBwYXR0ZXJuc1xuICAgICAgfVxuICAgIH1cbiAgICBtc2cubWVzc2FnZSArPSAnICgnICsgbGFiZWwgKyAnKSc7XG4gIH1cbn1cblxuLy8gQWRkcyB0aGUgZXJyb3IgY29kZSB0byB0aGUgbWVzc2FnZVxuZnVuY3Rpb24gYXBwZW5kRXJyb3JDb2RlKG1zZykge1xuICBpZiAobXNnLmV4dHJhLmVycm9yQ29kZSAmJiBtc2cuZXh0cmEuZXJyb3JDb2RlLmxlbmd0aCA+IDApIHtcbiAgICBtc2cubWVzc2FnZSArPSAnIFsnICsgbXNnLmV4dHJhLmVycm9yQ29kZSArICddJztcbiAgfVxufVxuXG4vLyBBZGRzIGFuIGV4dHJhIGluZm8gKGlmIHByb3ZpZGVkKSB0byB0aGUgbWVzc2FnZS5cbi8vIERlbGV0ZXMgdGhlIGV4dHJhIGluZm8gYWZ0ZXIgZXh0cmFjdGluZy5cbmZ1bmN0aW9uIGFwcGVuZEV4dHJhSW5mbyhtc2cpIHtcbiAgaWYgKG1zZy5leHRyYSkge1xuICAgIGFwcGVuZFNwYW5MYWJlbChtc2cpO1xuICAgIGFwcGVuZEVycm9yQ29kZShtc2cpO1xuICAgIGRlbGV0ZSBtc2cuZXh0cmE7XG4gIH1cbn1cblxuLy8gQ2hlY2tzIGlmIHRoZSBsb2NhdGlvbiBvZiB0aGUgZ2l2ZW4gbWVzc2FnZSBpcyB2YWxpZFxuZnVuY3Rpb24gaXNWYWxpZExvY2F0aW9uKG1zZykge1xuICByZXR1cm4gbXNnLmZpbGUgJiYgIW1zZy5maWxlLnN0YXJ0c1dpdGgoJzwnKTtcbn1cblxuLy8gUmVtb3ZlcyBsb2NhdGlvbiBpbmZvIGZyb20gdGhlIGdpdmVuIG1lc3NhZ2VcbmZ1bmN0aW9uIHJlbW92ZUxvY2F0aW9uKG1zZykge1xuICBkZWxldGUgbXNnLmZpbGU7XG4gIGRlbGV0ZSBtc2cubGluZTtcbiAgZGVsZXRlIG1zZy5saW5lX2VuZDtcbiAgZGVsZXRlIG1zZy5jb2w7XG4gIGRlbGV0ZSBtc2cuY29sX2VuZDtcbn1cblxuLy8gQ29waWVzIGxvY2F0aW9uIGluZm8gZnJvbSBvbmUgbWVzc2FnZSB0byBhbm90aGVyXG5mdW5jdGlvbiBjb3B5TG9jYXRpb24oZnJvbU1zZywgdG9Nc2cpIHtcbiAgdG9Nc2cuZmlsZSA9IGZyb21Nc2cuZmlsZTtcbiAgdG9Nc2cubGluZSA9IGZyb21Nc2cubGluZTtcbiAgdG9Nc2cubGluZV9lbmQgPSBmcm9tTXNnLmxpbmVfZW5kO1xuICB0b01zZy5jb2wgPSBmcm9tTXNnLmNvbDtcbiAgdG9Nc2cuY29sX2VuZCA9IGZyb21Nc2cuY29sX2VuZDtcbn1cblxuLy8gUmVtb3ZlcyBsb2NhdGlvbiBpbmZvIGZyb20gdGhlIHN1Ym1lc3NhZ2UgaWYgaXQncyBleGFjdGx5IHRoZSBzYW1lIGFzIGluXG4vLyB0aGUgbWFpbiBtZXNzYWdlLlxuLy8gRml4ZXMgbG9jYXRpb25zIHRoYXQgZG9uJ3QgcG9pbnQgdG8gYSB2YWxpZCBzb3VyY2UgY29kZS5cbi8vIEV4YW1wbGU6IDxzdGQgbWFjcm9zPjoxOjMzOiAxOjYwXG5mdW5jdGlvbiBub3JtYWxpemVMb2NhdGlvbnMobXNnKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXNnLnRyYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc3ViTXNnID0gbXNnLnRyYWNlW2ldO1xuICAgIC8vIERlZHVwbGljYXRlIGxvY2F0aW9uXG4gICAgaWYgKCFpc1ZhbGlkTG9jYXRpb24oc3ViTXNnKSB8fCAoc3ViTXNnLmZpbGUgPT09IG1zZy5maWxlICYmIHN1Yk1zZy5saW5lID09PSBtc2cubGluZSAmJiBzdWJNc2cuY29sID09PSBtc2cuY29sKSkge1xuICAgICAgcmVtb3ZlTG9jYXRpb24oc3ViTXNnKTtcbiAgICB9XG4gICAgaWYgKCFpc1ZhbGlkTG9jYXRpb24obXNnKSAmJiBpc1ZhbGlkTG9jYXRpb24oc3ViTXNnKSkge1xuICAgICAgY29weUxvY2F0aW9uKHN1Yk1zZywgbXNnKTtcbiAgICAgIHJlbW92ZUxvY2F0aW9uKHN1Yk1zZyk7XG4gICAgfVxuICB9XG59XG5cbi8vIFNldCBsb2NhdGlvbiBmb3Igc3BlY2lhbCBjYXNlcyB3aGVuIHRoZSBjb21waWxlciBkb2Vzbid0IHByb3ZpZGUgaXRcbmZ1bmN0aW9uIHByZXByb2Nlc3NNZXNzYWdlKG1zZywgYnVpbGRXb3JrRGlyKSB7XG4gIGFwcGVuZEV4dHJhSW5mbyhtc2cpO1xuICBub3JtYWxpemVMb2NhdGlvbnMobXNnKTtcbiAgLy8gUmVvcmRlciB0cmFjZSBpdGVtcyBpZiBuZWVkZWQuXG4gIC8vIE5vdCBleHBsaWNpdGx5IG9yZGVyZWQgaXRlbXMgYWx3YXlzIGdvIGZpcnN0IGluIHRoZWlyIG9yaWdpbmFsIG9yZGVyLlxuICBtc2cudHJhY2Uuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIGlmICghYS5vcmRlciAmJiBiLm9yZGVyKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiBhLm9yZGVyICYmIGIub3JkZXIgPyBhLm9yZGVyIC0gYi5vcmRlciA6IDE7XG4gIH0pO1xuICAvLyBDaGVjayBpZiB0aGUgbWVzc2FnZSBjYW4gYmUgYWRkZWQgdG8gTGludGVyXG4gIGlmIChpc1ZhbGlkTG9jYXRpb24obXNnKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8vIElnbm9yZSBtZXRhIGVycm9yc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGFFcnJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobWV0YUVycm9yc1tpXS50ZXN0KG1zZy5tZXNzYWdlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICAvLyBMb2NhdGlvbiBpcyBub3QgcHJvdmlkZWQgZm9yIHRoZSBtZXNzYWdlLCBzbyBpdCBjYW5ub3QgYmUgYWRkZWQgdG8gTGludGVyLlxuICAvLyBEaXNwbGF5IGl0IGFzIGEgbm90aWZpY2F0aW9uLlxuICBzd2l0Y2ggKG1zZy5sZXZlbCkge1xuICAgIGNhc2UgJ2luZm8nOlxuICAgIGNhc2UgJ25vdGUnOlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obXNnLm1lc3NhZ2UsIG5vdGlmaWNhdGlvbkNmZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1zZy5tZXNzYWdlLCBub3RpZmljYXRpb25DZmcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtc2cubWVzc2FnZSwgbm90aWZpY2F0aW9uQ2ZnKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7IGxldmVsMnNldmVyaXR5LCBsZXZlbDJ0eXBlLCBwcmVwcm9jZXNzTWVzc2FnZSB9O1xuIl19