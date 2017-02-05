
/* eslint quote-props:0 */
'use strict';

// Character positions
var INDEX_OF_FUNCTION_NAME = 9; // "function X", X is at index 9
var FIRST_UPPERCASE_INDEX_IN_ASCII = 65; // A is at index 65 in ASCII
var LAST_UPPERCASE_INDEX_IN_ASCII = 90; // Z is at index 90 in ASCII

// -----------------------------------
// Values

/**
 * Get the object type string
 * @param {any} value
 * @returns {string}
 */
function getObjectType(value /* :mixed */) /* :string */{
  return Object.prototype.toString.call(value);
}

/**
 * Checks to see if a value is an object
 * @param {any} value
 * @returns {boolean}
 */
function isObject(value /* :any */) /* :boolean */{
  // null is object, hence the extra check
  return value !== null && typeof value === 'object';
}

/**
 * Checks to see if a value is an object and only an object
 * @param {any} value
 * @returns {boolean}
 */
function isPlainObject(value /* :any */) /* :boolean */{
  /* eslint no-proto:0 */
  return isObject(value) && value.__proto__ === Object.prototype;
}

/**
 * Checks to see if a value is empty
 * @param {any} value
 * @returns {boolean}
 */
function isEmpty(value /* :mixed */) /* :boolean */{
  return value == null;
}

/**
 * Is empty object
 * @param {any} value
 * @returns {boolean}
 */
function isEmptyObject(value /* :Object */) /* :boolean */{
  // We could use Object.keys, but this is more effecient
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

/**
 * Is ES6+ class
 * @param {any} value
 * @returns {boolean}
 */
function isNativeClass(value /* :mixed */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
  return typeof value === 'function' && value.toString().indexOf('class') === 0;
}

/**
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 * @param {any} value
 * @returns {boolean}
 */
function isConventionalClass(value /* :any */) /* :boolean */{
  if (typeof value !== 'function') return false;
  var c = value.toString().charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

// There use to be code here that checked for CoffeeScript's "function _Class" at index 0 (which was sound)
// But it would also check for Babel's __classCallCheck anywhere in the function, which wasn't sound
// as somewhere in the function, another class could be defined, which would provide a false positive
// So instead, proxied classes are ignored, as we can't guarantee their accuracy, would also be an ever growing set

// -----------------------------------
// Types

/**
 * Is Class
 * @param {any} value
 * @returns {boolean}
 */
function isClass(value /* :any */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, you may also need to update isNativeClass
  if (typeof value !== 'function') return false;
  var s = value.toString();
  if (s.indexOf('class') === 0) return true;
  var c = s.charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

/**
 * Checks to see if a value is an error
 * @param {any} value
 * @returns {boolean}
 */
function isError(value /* :mixed */) /* :boolean */{
  return value instanceof Error;
}

/**
 * Checks to see if a value is a date
 * @param {any} value
 * @returns {boolean}
 */
function isDate(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Date]';
}

/**
 * Checks to see if a value is an arguments object
 * @param {any} value
 * @returns {boolean}
 */
function isArguments(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Arguments]';
}

/**
 * Checks to see if a value is a function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Function]';
}

/**
 * Checks to see if a value is an regex
 * @param {any} value
 * @returns {boolean}
 */
function isRegExp(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object RegExp]';
}

/**
 * Checks to see if a value is an array
 * @param {any} value
 * @returns {boolean}
 */
function isArray(value /* :mixed */) /* :boolean */{
  return typeof Array.isArray === 'function' && Array.isArray(value) || getObjectType(value) === '[object Array]';
}

/**
 * Checks to see if a valule is a number
 * @param {any} value
 * @returns {boolean}
 */
function isNumber(value /* :mixed */) /* :boolean */{
  return typeof value === 'number' || getObjectType(value) === '[object Number]';
}

/**
 * Checks to see if a value is a string
 * @param {any} value
 * @returns {boolean}
 */
function isString(value /* :mixed */) /* :boolean */{
  return typeof value === 'string' || getObjectType(value) === '[object String]';
}

/**
 * Checks to see if a valule is a boolean
 * @param {any} value
 * @returns {boolean}
 */
function isBoolean(value /* :mixed */) /* :boolean */{
  return value === true || value === false || getObjectType(value) === '[object Boolean]';
}

/**
 * Checks to see if a value is null
 * @param {any} value
 * @returns {boolean}
 */
function isNull(value /* :mixed */) /* :boolean */{
  return value === null;
}

/**
 * Checks to see if a value is undefined
 * @param {any} value
 * @returns {boolean}
 */
function isUndefined(value /* :mixed */) /* :boolean */{
  return typeof value === 'undefined';
}

/**
 * Checks to see if a value is a Map
 * @param {any} value
 * @returns {boolean}
 */
function isMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Map]';
}

/**
 * Checks to see if a value is a WeakMap
 * @param {any} value
 * @returns {boolean}
 */
function isWeakMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object WeakMap]';
}

// -----------------------------------
// General

/**
 * The type mapping (type => method) to use for getType. Frozen.
 */
var typeMap = Object.freeze({
  array: isArray,
  boolean: isBoolean,
  date: isDate,
  error: isError,
  'class': isClass,
  'function': isFunction,
  'null': isNull,
  number: isNumber,
  regexp: isRegExp,
  string: isString,
  'undefined': isUndefined,
  map: isMap,
  weakmap: isWeakMap,
  object: isObject
});

/**
 * Get the type of the value in lowercase
 * @param {any} value
 * @param {Object} [_typeMap] a custom type map (type => method) in case you have new types you wish to use
 * @returns {?string}
 */
function getType(value /* :mixed */) /* :?string */{
  var _typeMap /* :Object */ = arguments.length <= 1 || arguments[1] === undefined ? typeMap : arguments[1];

  // Cycle through our type map
  for (var key in _typeMap) {
    if (typeMap.hasOwnProperty(key)) {
      if (typeMap[key](value)) {
        return key;
      }
    }
  }

  // No type was successful
  return null;
}

// Export
module.exports = {
  getObjectType: getObjectType,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isEmpty: isEmpty,
  isEmptyObject: isEmptyObject,
  isNativeClass: isNativeClass,
  isConventionalClass: isConventionalClass,
  isClass: isClass,
  isError: isError,
  isDate: isDate,
  isArguments: isArguments,
  isFunction: isFunction,
  isRegExp: isRegExp,
  isArray: isArray,
  isNumber: isNumber,
  isString: isString,
  isBoolean: isBoolean,
  isNull: isNull,
  isUndefined: isUndefined,
  isMap: isMap,
  isWeakMap: isWeakMap,
  typeMap: typeMap,
  getType: getType
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9ub2RlX21vZHVsZXMvdHlwZWNoZWNrZXIvc291cmNlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsWUFBWSxDQUFBOzs7QUFHWixJQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQTtBQUNoQyxJQUFNLDhCQUE4QixHQUFHLEVBQUUsQ0FBQTtBQUN6QyxJQUFNLDZCQUE2QixHQUFHLEVBQUUsQ0FBQTs7Ozs7Ozs7OztBQVd4QyxTQUFTLGFBQWEsQ0FBRSxLQUFLLDRCQUE2QjtBQUN6RCxTQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtDQUM1Qzs7Ozs7OztBQU9ELFNBQVMsUUFBUSxDQUFFLEtBQUssMkJBQTZCOztBQUVwRCxTQUFPLEtBQUssS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFBO0NBQ2xEOzs7Ozs7O0FBT0QsU0FBUyxhQUFhLENBQUUsS0FBSywyQkFBNkI7O0FBRXpELFNBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQTtDQUM5RDs7Ozs7OztBQU9ELFNBQVMsT0FBTyxDQUFFLEtBQUssNkJBQStCO0FBQ3JELFNBQU8sS0FBSyxJQUFJLElBQUksQ0FBQTtDQUNwQjs7Ozs7OztBQU9ELFNBQVMsYUFBYSxDQUFFLEtBQUssOEJBQWdDOztBQUU1RCxPQUFNLElBQU0sR0FBRyxJQUFJLEtBQUssRUFBRztBQUMxQixRQUFLLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUc7QUFDaEMsYUFBTyxLQUFLLENBQUE7S0FDWjtHQUNEO0FBQ0QsU0FBTyxJQUFJLENBQUE7Q0FDWDs7Ozs7OztBQU9ELFNBQVMsYUFBYSxDQUFFLEtBQUssNkJBQStCOztBQUUzRCxTQUFPLE9BQU8s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QUFhO0FBQ2IscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixTQUFPLEVBQVAsT0FBTztBQUNQLFNBQU8sRUFBUCxPQUFPO0FBQ1AsUUFBTSxFQUFOLE1BQU07QUFDTixhQUFXLEVBQVgsV0FBVztBQUNYLFlBQVUsRUFBVixVQUFVO0FBQ1YsVUFBUSxFQUFSLFFBQVE7QUFDUixTQUFPLEVBQVAsT0FBTztBQUNQLFVBQVEsRUFBUixRQUFRO0FBQ1IsVUFBUSxFQUFSLFFBQVE7QUFDUixXQUFTLEVBQVQsU0FBUztBQUNULFFBQU0sRUFBTixNQUFNO0FBQ04sYUFBVyxFQUFYLFdBQVc7QUFDWCxPQUFLLEVBQUwsS0FBSztBQUNMLFdBQVMsRUFBVCxTQUFTO0FBQ1QsU0FBTyxFQUFQLE9BQU87QUFDUCxTQUFPLEVBQVAsT0FBTztDQUNQLENBQUEiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1aWxkL25vZGVfbW9kdWxlcy90eXBlY2hlY2tlci9zb3VyY2UvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyogZXNsaW50IHF1b3RlLXByb3BzOjAgKi9cbid1c2Ugc3RyaWN0J1xuXG4vLyBDaGFyYWN0ZXIgcG9zaXRpb25zXG5jb25zdCBJTkRFWF9PRl9GVU5DVElPTl9OQU1FID0gOSAgLy8gXCJmdW5jdGlvbiBYXCIsIFggaXMgYXQgaW5kZXggOVxuY29uc3QgRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJID0gNjUgIC8vIEEgaXMgYXQgaW5kZXggNjUgaW4gQVNDSUlcbmNvbnN0IExBU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJID0gOTAgICAvLyBaIGlzIGF0IGluZGV4IDkwIGluIEFTQ0lJXG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFZhbHVlc1xuXG4vKipcbiAqIEdldCB0aGUgb2JqZWN0IHR5cGUgc3RyaW5nXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldE9iamVjdFR5cGUgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOnN0cmluZyAqLyB7XG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QgKHZhbHVlIC8qIDphbnkgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIG51bGwgaXMgb2JqZWN0LCBoZW5jZSB0aGUgZXh0cmEgY2hlY2tcblx0cmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gb2JqZWN0IGFuZCBvbmx5IGFuIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAodmFsdWUgLyogOmFueSAqLyApIC8qIDpib29sZWFuICovIHtcblx0LyogZXNsaW50IG5vLXByb3RvOjAgKi9cblx0cmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS5fX3Byb3RvX18gPT09IE9iamVjdC5wcm90b3R5cGVcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgZW1wdHlcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHkgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHZhbHVlID09IG51bGxcbn1cblxuLyoqXG4gKiBJcyBlbXB0eSBvYmplY3RcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlPYmplY3QgKHZhbHVlIC8qIDpPYmplY3QgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIFdlIGNvdWxkIHVzZSBPYmplY3Qua2V5cywgYnV0IHRoaXMgaXMgbW9yZSBlZmZlY2llbnRcblx0Zm9yICggY29uc3Qga2V5IGluIHZhbHVlICkge1xuXHRcdGlmICggdmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSApIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIElzIEVTNisgY2xhc3NcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlQ2xhc3MgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0Ly8gTk9URSBUTyBERVZFTE9QRVI6IElmIGFueSBvZiB0aGlzIGNoYW5nZXMsIGlzQ2xhc3MgbXVzdCBhbHNvIGJlIHVwZGF0ZWRcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWx1ZS50b1N0cmluZygpLmluZGV4T2YoJ2NsYXNzJykgPT09IDBcbn1cblxuLyoqXG4gKiBJcyBDb252ZW50aW9uYWwgQ2xhc3NcbiAqIExvb2tzIGZvciBmdW5jdGlvbiB3aXRoIGNhcGl0YWwgZmlyc3QgbGV0dGVyIE15Q2xhc3NcbiAqIEZpcnN0IGxldHRlciBpcyB0aGUgOXRoIGNoYXJhY3RlclxuICogSWYgY2hhbmdlZCwgaXNDbGFzcyBtdXN0IGFsc28gYmUgdXBkYXRlZFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDb252ZW50aW9uYWxDbGFzcyAodmFsdWUgLyogOmFueSAqLyApIC8qIDpib29sZWFuICovIHtcblx0aWYgKCB0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgKSAgcmV0dXJuIGZhbHNlXG5cdGNvbnN0IGMgPSB2YWx1ZS50b1N0cmluZygpLmNoYXJDb2RlQXQoSU5ERVhfT0ZfRlVOQ1RJT05fTkFNRSlcblx0cmV0dXJuIGMgPj0gRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJICYmIGMgPD0gTEFTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUlcbn1cblxuLy8gVGhlcmUgdXNlIHRvIGJlIGNvZGUgaGVyZSB0aGF0IGNoZWNrZWQgZm9yIENvZmZlZVNjcmlwdCdzIFwiZnVuY3Rpb24gX0NsYXNzXCIgYXQgaW5kZXggMCAod2hpY2ggd2FzIHNvdW5kKVxuLy8gQnV0IGl0IHdvdWxkIGFsc28gY2hlY2sgZm9yIEJhYmVsJ3MgX19jbGFzc0NhbGxDaGVjayBhbnl3aGVyZSBpbiB0aGUgZnVuY3Rpb24sIHdoaWNoIHdhc24ndCBzb3VuZFxuLy8gYXMgc29tZXdoZXJlIGluIHRoZSBmdW5jdGlvbiwgYW5vdGhlciBjbGFzcyBjb3VsZCBiZSBkZWZpbmVkLCB3aGljaCB3b3VsZCBwcm92aWRlIGEgZmFsc2UgcG9zaXRpdmVcbi8vIFNvIGluc3RlYWQsIHByb3hpZWQgY2xhc3NlcyBhcmUgaWdub3JlZCwgYXMgd2UgY2FuJ3QgZ3VhcmFudGVlIHRoZWlyIGFjY3VyYWN5LCB3b3VsZCBhbHNvIGJlIGFuIGV2ZXIgZ3Jvd2luZyBzZXRcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVHlwZXNcblxuLyoqXG4gKiBJcyBDbGFzc1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDbGFzcyAodmFsdWUgLyogOmFueSAqLyApIC8qIDpib29sZWFuICovIHtcblx0Ly8gTk9URSBUTyBERVZFTE9QRVI6IElmIGFueSBvZiB0aGlzIGNoYW5nZXMsIHlvdSBtYXkgYWxzbyBuZWVkIHRvIHVwZGF0ZSBpc05hdGl2ZUNsYXNzXG5cdGlmICggdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICkgIHJldHVybiBmYWxzZVxuXHRjb25zdCBzID0gdmFsdWUudG9TdHJpbmcoKVxuXHRpZiAoIHMuaW5kZXhPZignY2xhc3MnKSA9PT0gMCApICByZXR1cm4gdHJ1ZVxuXHRjb25zdCBjID0gcy5jaGFyQ29kZUF0KElOREVYX09GX0ZVTkNUSU9OX05BTUUpXG5cdHJldHVybiBjID49IEZJUlNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSSAmJiBjIDw9IExBU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGVycm9yXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0Vycm9yICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEVycm9yXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZGF0ZVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEYXRlICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgRGF0ZV0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGFyZ3VtZW50cyBvYmplY3RcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBmdW5jdGlvblxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbiAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gcmVnZXhcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzUmVnRXhwICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gYXJyYXlcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiBBcnJheS5pc0FycmF5KHZhbHVlKSkgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWxlIGlzIGEgbnVtYmVyXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc051bWJlciAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgTnVtYmVyXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBzdHJpbmdcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBTdHJpbmddJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1bGUgaXMgYSBib29sZWFuXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0Jvb2xlYW4gKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIG51bGxcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTnVsbCAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIE1hcFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNNYXAgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBNYXBdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIFdlYWtNYXBcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzV2Vha01hcCAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFdlYWtNYXBdJ1xufVxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBHZW5lcmFsXG5cbi8qKlxuICogVGhlIHR5cGUgbWFwcGluZyAodHlwZSA9PiBtZXRob2QpIHRvIHVzZSBmb3IgZ2V0VHlwZS4gRnJvemVuLlxuICovXG5jb25zdCB0eXBlTWFwID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFycmF5OiBpc0FycmF5LFxuXHRib29sZWFuOiBpc0Jvb2xlYW4sXG5cdGRhdGU6IGlzRGF0ZSxcblx0ZXJyb3I6IGlzRXJyb3IsXG5cdGNsYXNzOiBpc0NsYXNzLFxuXHRmdW5jdGlvbjogaXNGdW5jdGlvbixcblx0bnVsbDogaXNOdWxsLFxuXHRudW1iZXI6IGlzTnVtYmVyLFxuXHRyZWdleHA6IGlzUmVnRXhwLFxuXHRzdHJpbmc6IGlzU3RyaW5nLFxuXHQndW5kZWZpbmVkJzogaXNVbmRlZmluZWQsXG5cdG1hcDogaXNNYXAsXG5cdHdlYWttYXA6IGlzV2Vha01hcCxcblx0b2JqZWN0OiBpc09iamVjdFxufSlcblxuLyoqXG4gKiBHZXQgdGhlIHR5cGUgb2YgdGhlIHZhbHVlIGluIGxvd2VyY2FzZVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gW190eXBlTWFwXSBhIGN1c3RvbSB0eXBlIG1hcCAodHlwZSA9PiBtZXRob2QpIGluIGNhc2UgeW91IGhhdmUgbmV3IHR5cGVzIHlvdSB3aXNoIHRvIHVzZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUgKHZhbHVlIC8qIDptaXhlZCAqLywgX3R5cGVNYXAgLyogOk9iamVjdCAqLyA9IHR5cGVNYXApIC8qIDo/c3RyaW5nICovIHtcblx0Ly8gQ3ljbGUgdGhyb3VnaCBvdXIgdHlwZSBtYXBcblx0Zm9yICggY29uc3Qga2V5IGluIF90eXBlTWFwICkge1xuXHRcdGlmICggdHlwZU1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpICkge1xuXHRcdFx0aWYgKCB0eXBlTWFwW2tleV0odmFsdWUpICkge1xuXHRcdFx0XHRyZXR1cm4ga2V5XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm8gdHlwZSB3YXMgc3VjY2Vzc2Z1bFxuXHRyZXR1cm4gbnVsbFxufVxuXG4vLyBFeHBvcnRcbm1vZHVsZS5leHBvcnRzID0ge1xuXHRnZXRPYmplY3RUeXBlLFxuXHRpc09iamVjdCxcblx0aXNQbGFpbk9iamVjdCxcblx0aXNFbXB0eSxcblx0aXNFbXB0eU9iamVjdCxcblx0aXNOYXRpdmVDbGFzcyxcblx0aXNDb252ZW50aW9uYWxDbGFzcyxcblx0aXNDbGFzcyxcblx0aXNFcnJvcixcblx0aXNEYXRlLFxuXHRpc0FyZ3VtZW50cyxcblx0aXNGdW5jdGlvbixcblx0aXNSZWdFeHAsXG5cdGlzQXJyYXksXG5cdGlzTnVtYmVyLFxuXHRpc1N0cmluZyxcblx0aXNCb29sZWFuLFxuXHRpc051bGwsXG5cdGlzVW5kZWZpbmVkLFxuXHRpc01hcCxcblx0aXNXZWFrTWFwLFxuXHR0eXBlTWFwLFxuXHRnZXRUeXBlXG59XG4iXX0=