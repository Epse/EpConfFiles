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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvZXJyb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FBTVosSUFBTSxlQUFlLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUM7OztBQUc5QyxJQUFNLFVBQVUsR0FBRyxDQUNqQiwyQ0FBMkMsRUFDM0MseUJBQXlCLENBQzFCLENBQUM7Ozs7QUFJRixJQUFNLGVBQWUsR0FBRyxDQUFDOztBQUV2QixPQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLFNBQU8sRUFBRSxxQkFBcUI7Q0FDL0IsRUFBRTs7QUFFRCxPQUFLLEVBQUUsMEJBQTBCO0FBQ2pDLFNBQU8sRUFBRSwyQ0FBMkM7Q0FDckQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsbUNBQW1DO0FBQzFDLFNBQU8sRUFBRSxpRkFBaUY7Q0FDM0YsRUFBRTs7QUFFRCxPQUFLLEVBQUUsc0NBQXNDO0FBQzdDLFNBQU8sRUFBRSw4Q0FBOEM7Q0FDeEQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFNBQU8sRUFBRSxxQ0FBcUM7Q0FDL0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsc0NBQXNDO0FBQzdDLFNBQU8sRUFBRSwyREFBMkQ7Q0FDckUsRUFBRTs7QUFFRCxPQUFLLEVBQUUsMkJBQTJCO0FBQ2xDLFNBQU8sRUFBRSxtQ0FBbUM7Q0FDN0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLFNBQU8sRUFBRSxnREFBZ0Q7Q0FDMUQsRUFBRTs7QUFFRCxPQUFLLEVBQUUsNEJBQTRCO0FBQ25DLFNBQU8sRUFBRSxpRkFBaUY7Q0FDM0YsRUFBRTs7QUFFRCxPQUFLLEVBQUUscUJBQXFCO0FBQzVCLFNBQU8sRUFBRSxxQ0FBcUM7Q0FDL0MsRUFBRTs7QUFFRCxPQUFLLEVBQUUsdUNBQXVDO0FBQzlDLFNBQU8sRUFBRSxtQ0FBbUM7Q0FD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QjtHQUNGO0NBQ0Y7OztBQUdELFNBQVMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRTtBQUM1QyxpQkFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLG9CQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV4QixNQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN4QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFFBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDbkMsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGOzs7QUFHRCxVQUFRLEdBQUcsQ0FBQyxLQUFLO0FBQ2YsU0FBSyxNQUFNLENBQUM7QUFDWixTQUFLLE1BQU07QUFDVCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3pELFlBQU07QUFBQSxBQUNSLFNBQUssU0FBUztBQUNaLFVBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDNUQsWUFBTTtBQUFBLEFBQ1I7QUFDRSxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQUEsR0FDN0Q7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkOztRQUVRLGNBQWMsR0FBZCxjQUFjO1FBQUUsVUFBVSxHQUFWLFVBQVU7UUFBRSxpQkFBaUIsR0FBakIsaUJBQWlCIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvZXJyb3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vXG4vLyBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgcGFyc2luZyBlcnJvcnNcbi8vXG5cbmNvbnN0IG5vdGlmaWNhdGlvbkNmZyA9IHsgZGlzbWlzc2FibGU6IHRydWUgfTtcblxuLy8gTWV0YSBlcnJvcnMgYXJlIGlnbm9yZWRcbmNvbnN0IG1ldGFFcnJvcnMgPSBbXG4gIC9hYm9ydGluZyBkdWUgdG8gKFxcZCsgKT9wcmV2aW91cyBlcnJvcltzXT8vLFxuICAvQ291bGQgbm90IGNvbXBpbGUgYC4rYC4vXG5dO1xuXG4vLyBDb2xsZWN0aW9uIG9mIHNwYW4gbGFiZWxzIHRoYXQgbXVzdCBiZSBpZ25vcmVkIChub3QgYWRkZWQgdG8gdGhlIG1haW4gbWVzc2FnZSlcbi8vIGJlY2F1c2UgdGhlIG1haW4gbWVzc2FnZSBhbHJlYWR5IGNvbnRhaW5zIHRoZSBzYW1lIGluZm9ybWF0aW9uXG5jb25zdCByZWR1bmRhbnRMYWJlbHMgPSBbe1xuICAvLyBFMDAwMVxuICBsYWJlbDogL3RoaXMgaXMgYW4gdW5yZWFjaGFibGUgcGF0dGVybi8sXG4gIG1lc3NhZ2U6IC91bnJlYWNoYWJsZSBwYXR0ZXJuL1xufSwge1xuICAvLyBFMDAwNFxuICBsYWJlbDogL3BhdHRlcm4gYC4rYCBub3QgY292ZXJlZC8sXG4gIG1lc3NhZ2U6IC9ub24tZXhoYXVzdGl2ZSBwYXR0ZXJuczogYC4rYCBub3QgY292ZXJlZC9cbn0sIHtcbiAgLy8gRTAwMDIzXG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBmaWVsZFtzXT8sIGZvdW5kIFxcZCsvLFxuICBtZXNzYWdlOiAvdGhpcyBwYXR0ZXJuIGhhcyBcXGQrIGZpZWxkW3NdPywgYnV0IHRoZSBjb3JyZXNwb25kaW5nIHZhcmlhbnQgaGFzIFxcZCsgZmllbGRbc10/L1xufSwge1xuICAvLyBFMDAyNlxuICBsYWJlbDogL3N0cnVjdCBgLitgIGRvZXMgbm90IGhhdmUgZmllbGQgYC4rYC8sXG4gIG1lc3NhZ2U6IC9zdHJ1Y3QgYC4rYCBkb2VzIG5vdCBoYXZlIGEgZmllbGQgbmFtZWQgYC4rYC9cbn0sIHtcbiAgLy8gRTAwMjdcbiAgbGFiZWw6IC9taXNzaW5nIGZpZWxkIGAuK2AvLFxuICBtZXNzYWdlOiAvcGF0dGVybiBkb2VzIG5vdCBtZW50aW9uIGZpZWxkIGAuK2AvXG59LCB7XG4gIC8vIEUwMDI5XG4gIGxhYmVsOiAvcmFuZ2VzIHJlcXVpcmUgY2hhciBvciBudW1lcmljIHR5cGVzLyxcbiAgbWVzc2FnZTogL29ubHkgY2hhciBhbmQgbnVtZXJpYyB0eXBlcyBhcmUgYWxsb3dlZCBpbiByYW5nZSBwYXR0ZXJucy9cbn0sIHtcbiAgLy8gRTAwNDBcbiAgbGFiZWw6IC9jYWxsIHRvIGRlc3RydWN0b3IgbWV0aG9kLyxcbiAgbWVzc2FnZTogL2V4cGxpY2l0IHVzZSBvZiBkZXN0cnVjdG9yIG1ldGhvZC9cbn0sIHtcbiAgLy8gRTAwNDZcbiAgbGFiZWw6IC9taXNzaW5nIGAuK2AgaW4gaW1wbGVtZW50YXRpb24vLFxuICBtZXNzYWdlOiAvbm90IGFsbCB0cmFpdCBpdGVtcyBpbXBsZW1lbnRlZCwgbWlzc2luZzogYC4rYC9cbn0sIHtcbiAgLy8gRTAwNTdcbiAgbGFiZWw6IC9leHBlY3RlZCBcXGQrIHBhcmFtZXRlcltzXT8vLFxuICBtZXNzYWdlOiAvdGhpcyBmdW5jdGlvbiB0YWtlcyBcXGQrIHBhcmFtZXRlcltzXT8gYnV0IFxcZCsgcGFyYW1ldGVyW3NdPyAod2FzfHdlcmUpIHN1cHBsaWVkL1xufSwge1xuICAvLyBFMDA2MlxuICBsYWJlbDogL3VzZWQgbW9yZSB0aGFuIG9uY2UvLFxuICBtZXNzYWdlOiAvZmllbGQgYC4rYCBzcGVjaWZpZWQgbW9yZSB0aGFuIG9uY2UvXG59LCB7XG4gIC8vIEUwMDY3XG4gIGxhYmVsOiAvaW52YWxpZCBleHByZXNzaW9uIGZvciBsZWZ0LWhhbmQgc2lkZS8sXG4gIG1lc3NhZ2U6IC9pbnZhbGlkIGxlZnQtaGFuZCBzaWRlIGV4cHJlc3Npb24vXG59LCB7XG4gIC8vIEUwMDY4XG4gIGxhYmVsOiAvcmV0dXJuIHR5cGUgaXMgbm90IFxcKFxcKS8sXG4gIG1lc3NhZ2U6IC9gcmV0dXJuO2AgaW4gYSBmdW5jdGlvbiB3aG9zZSByZXR1cm4gdHlwZSBpcyBub3QgYFxcKFxcKWAvXG59LCB7XG4gIC8vIEUwMDcxXG4gIGxhYmVsOiAvbm90IGEgc3RydWN0LyxcbiAgbWVzc2FnZTogL2AuK2AgZG9lcyBub3QgbmFtZSBhIHN0cnVjdCBvciBhIHN0cnVjdCB2YXJpYW50L1xufSwge1xuICAvLyBFMDA3MlxuICBsYWJlbDogL3JlY3Vyc2l2ZSB0eXBlIGhhcyBpbmZpbml0ZSBzaXplLyxcbiAgbWVzc2FnZTogL3JlY3Vyc2l2ZSB0eXBlIGAuK2AgaGFzIGluZmluaXRlIHNpemUvXG59LCB7XG4gIC8vIEUwMDg3XG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3RvbyBtYW55IHR5cGUgcGFyYW1ldGVycyBwcm92aWRlZDogZXhwZWN0ZWQgYXQgbW9zdCBcXGQrIHBhcmFtZXRlcltzXT8sIGZvdW5kIFxcZCsgcGFyYW1ldGVyW3NdPy9cbn0sIHtcbiAgLy8gRTAwOTFcbiAgbGFiZWw6IC91bnVzZWQgdHlwZSBwYXJhbWV0ZXIvLFxuICBtZXNzYWdlOiAvdHlwZSBwYXJhbWV0ZXIgYC4rYCBpcyB1bnVzZWQvXG59LCB7XG4gIC8vIEUwMTAxXG4gIGxhYmVsOiAvY2Fubm90IHJlc29sdmUgdHlwZSBvZiBleHByZXNzaW9uLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGV4cHJlc3Npb246IHVuY29uc3RyYWluZWQgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMDJcbiAgbGFiZWw6IC9jYW5ub3QgcmVzb2x2ZSB0eXBlIG9mIHZhcmlhYmxlLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGxvY2FsIHZhcmlhYmxlOiB1bmNvbnN0cmFpbmVkIHR5cGUvXG59LCB7XG4gIC8vIEUwMTA2XG4gIGxhYmVsOiAvZXhwZWN0ZWQgbGlmZXRpbWUgcGFyYW1ldGVyLyxcbiAgbWVzc2FnZTogL21pc3NpbmcgbGlmZXRpbWUgc3BlY2lmaWVyL1xufSwge1xuICAvLyBFMDEwN1xuICBsYWJlbDogLyh1bik/ZXhwZWN0ZWQgKFxcZCsgKT9saWZldGltZSBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3dyb25nIG51bWJlciBvZiBsaWZldGltZSBwYXJhbWV0ZXJzOiBleHBlY3RlZCBcXGQrLCBmb3VuZCBcXGQrL1xufSwge1xuICAvLyBFMDEwOVxuICBsYWJlbDogL3R5cGUgcGFyYW1ldGVyIG5vdCBhbGxvd2VkLyxcbiAgbWVzc2FnZTogL3R5cGUgcGFyYW1ldGVycyBhcmUgbm90IGFsbG93ZWQgb24gdGhpcyB0eXBlL1xufSwge1xuICAvLyBFMDExMFxuICBsYWJlbDogL2xpZmV0aW1lIHBhcmFtZXRlciBub3QgYWxsb3dlZC8sXG4gIG1lc3NhZ2U6IC9saWZldGltZSBwYXJhbWV0ZXJzIGFyZSBub3QgYWxsb3dlZCBvbiB0aGlzIHR5cGUvXG59LCB7XG4gIC8vIEUwMTE2XG4gIGxhYmVsOiAvaW1wbCBmb3IgdHlwZSBkZWZpbmVkIG91dHNpZGUgb2YgY3JhdGUvLFxuICBtZXNzYWdlOiAvY2Fubm90IGRlZmluZSBpbmhlcmVudCBgLitgIGZvciBhIHR5cGUgb3V0c2lkZSBvZiB0aGUgY3JhdGUgd2hlcmUgdGhlIHR5cGUgaXMgZGVmaW5lZC9cbn0sIHtcbiAgLy8gRTAxMTdcbiAgbGFiZWw6IC9pbXBsIGRvZXNuJ3QgdXNlIHR5cGVzIGluc2lkZSBjcmF0ZS8sXG4gIG1lc3NhZ2U6IC9vbmx5IHRyYWl0cyBkZWZpbmVkIGluIHRoZSBjdXJyZW50IGNyYXRlIGNhbiBiZSBpbXBsZW1lbnRlZCBmb3IgYXJiaXRyYXJ5IHR5cGVzL1xufSwge1xuICAvLyBFMDExOVxuICBsYWJlbDogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9uIGZvciBgLitgLyxcbiAgbWVzc2FnZTogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9ucyBvZiB0cmFpdCBgLitgIGZvciB0eXBlIGAuK2AvXG59LCB7XG4gIC8vIEUwMTIwXG4gIGxhYmVsOiAvaW1wbGVtZW50aW5nIERyb3AgcmVxdWlyZXMgYSBzdHJ1Y3QvLFxuICBtZXNzYWdlOiAvdGhlIERyb3AgdHJhaXQgbWF5IG9ubHkgYmUgaW1wbGVtZW50ZWQgb24gc3RydWN0dXJlcy9cbn0sIHtcbiAgLy8gRTAxMjFcbiAgbGFiZWw6IC9ub3QgYWxsb3dlZCBpbiB0eXBlIHNpZ25hdHVyZXMvLFxuICBtZXNzYWdlOiAvdGhlIHR5cGUgcGxhY2Vob2xkZXIgYF9gIGlzIG5vdCBhbGxvd2VkIHdpdGhpbiB0eXBlcyBvbiBpdGVtIHNpZ25hdHVyZXMvXG59LCB7XG4gIC8vIEUwMTI0XG4gIGxhYmVsOiAvZmllbGQgYWxyZWFkeSBkZWNsYXJlZC8sXG4gIG1lc3NhZ2U6IC9maWVsZCBgLitgIGlzIGFscmVhZHkgZGVjbGFyZWQvXG59LCB7XG4gIC8vIEUwMzY4XG4gIGxhYmVsOiAvY2Fubm90IHVzZSBgWzw+KyZ8XlxcLV0/PWAgb24gdHlwZSBgLitgLyxcbiAgbWVzc2FnZTogL2JpbmFyeSBhc3NpZ25tZW50IG9wZXJhdGlvbiBgWzw+KyZ8XlxcLV0/PWAgY2Fubm90IGJlIGFwcGxpZWQgdG8gdHlwZSBgLitgL1xufSwge1xuICAvLyBFMDM4N1xuICBsYWJlbDogL2Nhbm5vdCBib3Jyb3cgbXV0YWJseS8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgYm9ycm93IGltbXV0YWJsZSBsb2NhbCB2YXJpYWJsZSBgLitgIGFzIG11dGFibGUvXG59XTtcblxuY29uc3QgbGV2ZWwyc2V2ZXJpdHkgPSAobGV2ZWwpID0+IHtcbiAgc3dpdGNoIChsZXZlbCkge1xuICAgIGNhc2UgJ3dhcm5pbmcnOiByZXR1cm4gJ3dhcm5pbmcnO1xuICAgIGNhc2UgJ2Vycm9yJzogcmV0dXJuICdlcnJvcic7XG4gICAgY2FzZSAnbm90ZSc6IHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnaGVscCc6IHJldHVybiAnaW5mbyc7XG4gICAgZGVmYXVsdDogcmV0dXJuICdlcnJvcic7XG4gIH1cbn07XG5cbmNvbnN0IGxldmVsMnR5cGUgPSAobGV2ZWwpID0+IHtcbiAgcmV0dXJuIGxldmVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbGV2ZWwuc2xpY2UoMSk7XG59O1xuXG4vLyBBcHBlbmRzIGEgc3BhbiBsYWJlbCB0byB0aGUgbWFpbiBtZXNzYWdlIGlmIGl0J3Mgbm90IHJlZHVuZGFudC5cbmZ1bmN0aW9uIGFwcGVuZFNwYW5MYWJlbChtc2cpIHtcbiAgaWYgKG1zZy5leHRyYS5zcGFuTGFiZWwgJiYgbXNnLmV4dHJhLnNwYW5MYWJlbC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbGFiZWwgPSBtc2cuZXh0cmEuc3BhbkxhYmVsO1xuICAgIGlmIChtc2cubWVzc2FnZS5pbmRleE9mKGxhYmVsKSA+PSAwKSB7XG4gICAgICByZXR1cm47ICAgICAgLy8gTGFiZWwgaXMgY29udGFpbmVkIHdpdGhpbiB0aGUgbWFpbiBtZXNzYWdlXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVkdW5kYW50TGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsID0gcmVkdW5kYW50TGFiZWxzW2ldO1xuICAgICAgaWYgKGwubGFiZWwudGVzdChsYWJlbCkgJiYgbC5tZXNzYWdlLnRlc3QobXNnLm1lc3NhZ2UpKSB7XG4gICAgICAgIHJldHVybjsgICAgLy8gU3VibWVzYWdlIGZpdHMgb25lIG9mIHRoZSBkZWR1cGxpY2F0aW9uIHBhdHRlcm5zXG4gICAgICB9XG4gICAgfVxuICAgIG1zZy5tZXNzYWdlICs9ICcgKCcgKyBsYWJlbCArICcpJztcbiAgfVxufVxuXG4vLyBBZGRzIHRoZSBlcnJvciBjb2RlIHRvIHRoZSBtZXNzYWdlXG5mdW5jdGlvbiBhcHBlbmRFcnJvckNvZGUobXNnKSB7XG4gIGlmIChtc2cuZXh0cmEuZXJyb3JDb2RlICYmIG1zZy5leHRyYS5lcnJvckNvZGUubGVuZ3RoID4gMCkge1xuICAgIG1zZy5tZXNzYWdlICs9ICcgWycgKyBtc2cuZXh0cmEuZXJyb3JDb2RlICsgJ10nO1xuICB9XG59XG5cbi8vIEFkZHMgYW4gZXh0cmEgaW5mbyAoaWYgcHJvdmlkZWQpIHRvIHRoZSBtZXNzYWdlLlxuLy8gRGVsZXRlcyB0aGUgZXh0cmEgaW5mbyBhZnRlciBleHRyYWN0aW5nLlxuZnVuY3Rpb24gYXBwZW5kRXh0cmFJbmZvKG1zZykge1xuICBpZiAobXNnLmV4dHJhKSB7XG4gICAgYXBwZW5kU3BhbkxhYmVsKG1zZyk7XG4gICAgYXBwZW5kRXJyb3JDb2RlKG1zZyk7XG4gICAgZGVsZXRlIG1zZy5leHRyYTtcbiAgfVxufVxuXG4vLyBDaGVja3MgaWYgdGhlIGxvY2F0aW9uIG9mIHRoZSBnaXZlbiBtZXNzYWdlIGlzIHZhbGlkXG5mdW5jdGlvbiBpc1ZhbGlkTG9jYXRpb24obXNnKSB7XG4gIHJldHVybiBtc2cuZmlsZSAmJiAhbXNnLmZpbGUuc3RhcnRzV2l0aCgnPCcpO1xufVxuXG4vLyBSZW1vdmVzIGxvY2F0aW9uIGluZm8gZnJvbSB0aGUgZ2l2ZW4gbWVzc2FnZVxuZnVuY3Rpb24gcmVtb3ZlTG9jYXRpb24obXNnKSB7XG4gIGRlbGV0ZSBtc2cuZmlsZTtcbiAgZGVsZXRlIG1zZy5saW5lO1xuICBkZWxldGUgbXNnLmxpbmVfZW5kO1xuICBkZWxldGUgbXNnLmNvbDtcbiAgZGVsZXRlIG1zZy5jb2xfZW5kO1xufVxuXG4vLyBDb3BpZXMgbG9jYXRpb24gaW5mbyBmcm9tIG9uZSBtZXNzYWdlIHRvIGFub3RoZXJcbmZ1bmN0aW9uIGNvcHlMb2NhdGlvbihmcm9tTXNnLCB0b01zZykge1xuICB0b01zZy5maWxlID0gZnJvbU1zZy5maWxlO1xuICB0b01zZy5saW5lID0gZnJvbU1zZy5saW5lO1xuICB0b01zZy5saW5lX2VuZCA9IGZyb21Nc2cubGluZV9lbmQ7XG4gIHRvTXNnLmNvbCA9IGZyb21Nc2cuY29sO1xuICB0b01zZy5jb2xfZW5kID0gZnJvbU1zZy5jb2xfZW5kO1xufVxuXG4vLyBSZW1vdmVzIGxvY2F0aW9uIGluZm8gZnJvbSB0aGUgc3VibWVzc2FnZSBpZiBpdCdzIGV4YWN0bHkgdGhlIHNhbWUgYXMgaW5cbi8vIHRoZSBtYWluIG1lc3NhZ2UuXG4vLyBGaXhlcyBsb2NhdGlvbnMgdGhhdCBkb24ndCBwb2ludCB0byBhIHZhbGlkIHNvdXJjZSBjb2RlLlxuLy8gRXhhbXBsZTogPHN0ZCBtYWNyb3M+OjE6MzM6IDE6NjBcbmZ1bmN0aW9uIG5vcm1hbGl6ZUxvY2F0aW9ucyhtc2cpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtc2cudHJhY2UubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzdWJNc2cgPSBtc2cudHJhY2VbaV07XG4gICAgLy8gRGVkdXBsaWNhdGUgbG9jYXRpb25cbiAgICBpZiAoIWlzVmFsaWRMb2NhdGlvbihzdWJNc2cpIHx8IChzdWJNc2cuZmlsZSA9PT0gbXNnLmZpbGUgJiYgc3ViTXNnLmxpbmUgPT09IG1zZy5saW5lICYmIHN1Yk1zZy5jb2wgPT09IG1zZy5jb2wpKSB7XG4gICAgICByZW1vdmVMb2NhdGlvbihzdWJNc2cpO1xuICAgIH1cbiAgICBpZiAoIWlzVmFsaWRMb2NhdGlvbihtc2cpICYmIGlzVmFsaWRMb2NhdGlvbihzdWJNc2cpKSB7XG4gICAgICBjb3B5TG9jYXRpb24oc3ViTXNnLCBtc2cpO1xuICAgICAgcmVtb3ZlTG9jYXRpb24oc3ViTXNnKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2V0IGxvY2F0aW9uIGZvciBzcGVjaWFsIGNhc2VzIHdoZW4gdGhlIGNvbXBpbGVyIGRvZXNuJ3QgcHJvdmlkZSBpdFxuZnVuY3Rpb24gcHJlcHJvY2Vzc01lc3NhZ2UobXNnLCBidWlsZFdvcmtEaXIpIHtcbiAgYXBwZW5kRXh0cmFJbmZvKG1zZyk7XG4gIG5vcm1hbGl6ZUxvY2F0aW9ucyhtc2cpO1xuICAvLyBDaGVjayBpZiB0aGUgbWVzc2FnZSBjYW4gYmUgYWRkZWQgdG8gTGludGVyXG4gIGlmIChpc1ZhbGlkTG9jYXRpb24obXNnKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8vIElnbm9yZSBtZXRhIGVycm9yc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGFFcnJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobWV0YUVycm9yc1tpXS50ZXN0KG1zZy5tZXNzYWdlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICAvLyBMb2NhdGlvbiBpcyBub3QgcHJvdmlkZWQgZm9yIHRoZSBtZXNzYWdlLCBzbyBpdCBjYW5ub3QgYmUgYWRkZWQgdG8gTGludGVyLlxuICAvLyBEaXNwbGF5IGl0IGFzIGEgbm90aWZpY2F0aW9uLlxuICBzd2l0Y2ggKG1zZy5sZXZlbCkge1xuICAgIGNhc2UgJ2luZm8nOlxuICAgIGNhc2UgJ25vdGUnOlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obXNnLm1lc3NhZ2UsIG5vdGlmaWNhdGlvbkNmZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1zZy5tZXNzYWdlLCBub3RpZmljYXRpb25DZmcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtc2cubWVzc2FnZSwgbm90aWZpY2F0aW9uQ2ZnKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7IGxldmVsMnNldmVyaXR5LCBsZXZlbDJ0eXBlLCBwcmVwcm9jZXNzTWVzc2FnZSB9O1xuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/build-cargo/lib/errors.js
