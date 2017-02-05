
/* eslint no-console:0 */
'use strict';

// Imports

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var pathUtil = require('path');

// Helper class to display nested error in a sensible way

var DetailedError = (function (_Error) {
	_inherits(DetailedError, _Error);

	function DetailedError(message, /* :string */details /* :Object */) {
		_classCallCheck(this, DetailedError);

		Object.keys(details).forEach(function (key) {
			var data = details[key];
			var value = require('util').inspect(data.stack || data.message || data);
			message += '\n' + key + ': ' + value;
		});
		return _possibleConstructorReturn(this, (DetailedError.__proto__ || Object.getPrototypeOf(DetailedError)).call(this, message));
	}

	return DetailedError;
})(Error);

// Environment fetching

var blacklist = process && process.env && process.env.EDITIONS_SYNTAX_BLACKLIST && process.env.EDITIONS_SYNTAX_BLACKLIST.split(',');

// Cache of which syntax combinations are supported or unsupported, hash of booleans
var syntaxFailedCombitions = {}; // sorted lowercase syntax combination => Error instance of failure
var syntaxBlacklist = {};
syntaxBlacklist["import"] = new Error('The import syntax is skipped as the module package.json field eliminates the need for autoloader support');
syntaxBlacklist.coffeescript = new Error('The coffeescript syntax is skipped as we want to use a precompiled edition rather than compiling at runtime');
syntaxBlacklist.typescript = new Error('The typescript syntax is skipped as we want to use a precompiled edition rather than compiling at runtime');

// Blacklist non-esnext node versions from esnext
if (process && process.versions && process.versions.node) {
	var EARLIEST_ESNEXT_NODE_VERSION = [0, 12];
	var NODE_VERSION = process.versions.node.split('.').map(function (n) {
		return parseInt(n, 10);
	});
	var ESNEXT_UNSUPPORTED = NODE_VERSION[0] < EARLIEST_ESNEXT_NODE_VERSION[0] || NODE_VERSION[0] === EARLIEST_ESNEXT_NODE_VERSION[0] && NODE_VERSION[1] < EARLIEST_ESNEXT_NODE_VERSION[1];
	if (ESNEXT_UNSUPPORTED) syntaxBlacklist.esnext = new Error('The esnext syntax is skipped on early node versions as attempting to use esnext features will output debugging information on these node versions');
}

// Check the environment configuration for a syntax blacklist
if (blacklist) {
	for (var i = 0; i < blacklist.length; ++i) {
		var syntax = blacklist[i].trim().toLowerCase();
		syntaxBlacklist[syntax] = new DetailedError('The EDITIONS_SYNTAX_BLACKLIST environment variable has blacklisted an edition syntax:', { syntax: syntax, blacklist: blacklist });
	}
}

/* ::
type edition = {
	name:number,
	description?:string,
	directory?:string,
	entry?:string,
	syntaxes?:Array<string>
};
type options = {
	cwd?:string,
	package?:string,
	entry?:string,
	require:function
};
*/

/**
 * Cycle through the editions and require the correct one
 * @protected internal function that is untested for public consumption
 * @param {edition} edition - the edition entry
 * @param {Object} opts - the following options
 * @param {string} opts.require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [opts.cwd] - if provided, this will be the cwd for entries
 * @param {string} [opts.entry] - if provided, should be a relative or absolute path to the entry point of the edition
 * @param {string} [opts.package] - if provided, should be the name of the package that we are loading the editions for
 * @returns {*}
 */
function requireEdition(edition, /* :edition */opts /* :options */) /* :any */{
	// Prevent require from being included in debug logs
	Object.defineProperty(opts, 'require', { value: opts.require, enumerable: false });

	// Get the correct entry path
	// As older versions o
	var cwd = opts.cwd || '';
	var dir = edition.directory || '';
	var entry = opts.entry || edition.entry || '';
	if (dir && entry && entry.indexOf(dir + '/') === 0) entry = entry.substring(dir.length + 1);
	// ^ this should not be needed, but as previous versions of editions included the directory inside the entry
	// it unfortunately is, as such this is a stepping stone for the new format, the new format being
	// if entry is specified by itself, it is cwd => entry
	// if entry is specified with a directory, it is cwd => dir => entry
	// if entry is not specified but dir is, it is cwd => dir
	// if neither entry nor dir are specified, we have a problem
	if (!dir && !entry) {
		var editionFailure = new DetailedError('Skipped edition due to no entry or directory being specified:', { edition: edition, cwd: cwd, dir: dir, entry: entry });
		throw editionFailure;
	}
	var entryPath = pathUtil.resolve(cwd, dir, entry);

	// Check syntax support
	// Convert syntaxes into a sorted lowercase string
	var syntaxes = edition.syntaxes && edition.syntaxes.map(function (i) {
		return i.toLowerCase();
	}).sort();
	var syntaxCombination = syntaxes && syntaxes.join(', ');
	if (syntaxes && syntaxCombination) {
		// Check if any of the syntaxes are unsupported
		var unsupportedSyntaxes = syntaxes.filter(function (i) {
			return syntaxBlacklist[i.toLowerCase()];
		});
		if (unsupportedSyntaxes.length) {
			var _editionFailure = new DetailedError('Skipped edition due to it containing an unsupported syntax:', { edition: edition, unsupportedSyntaxes: unsupportedSyntaxes });
			throw _editionFailure;
		}
		// Is this syntax combination unsupported? If so skip it with a soft failure to try the next edition
		else if (syntaxFailedCombitions[syntaxCombination]) {
				var previousCombinationFailure = syntaxFailedCombitions[syntaxCombination];
				var _editionFailure2 = new DetailedError('Skipped edition due to its syntax combinatiom failing previously:', { edition: edition, previousCombinationFailure: previousCombinationFailure });
				throw _editionFailure2;
			}
	}

	// Try and load this syntax combination
	try {
		return opts.require(entryPath);
	} catch (error) {
		// Note the error with more details
		var _editionFailure3 = new DetailedError('Failed to load the edition due to a load error:', { edition: edition, error: error.stack });

		// Blacklist the combination, even if it may have worked before
		// Perhaps in the future note if that if it did work previously, then we should instruct module owners to be more specific with their syntaxes
		if (syntaxCombination) syntaxFailedCombitions[syntaxCombination] = _editionFailure3;

		// Continue to the next edition
		throw _editionFailure3;
	}
}

/**
 * Cycle through the editions and require the correct one
 * @protected internal function that is untested for public consumption
 * @param {Array<edition>} editions - an array of edition entries
 * @param {Object} opts - the following options
 * @param {string} opts.require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [opts.cwd] - if provided, this will be the cwd for entries
 * @param {string} [opts.entry] - if provided, should be a relative path to the entry point of the edition
 * @param {string} [opts.package] - if provided, should be the name of the package that we are loading the editions for
 * @returns {*}
 */
function requireEditions(editions, /* :Array<edition> */opts /* :options */) /* :any */{
	// Extract
	if (opts["package"] == null) opts["package"] = 'custom runtime package';

	// Check
	if (!editions || editions.length === 0) {
		throw new DetailedError('No editions were specified:', { opts: opts });
	}

	// Note the last error message
	var editionFailures = [];

	// Cycle through the editions
	for (var _i = 0; _i < editions.length; ++_i) {
		var edition = editions[_i];
		try {
			return requireEdition(edition, opts);
		} catch (err) {
			editionFailures.push(err);
		}
	}

	// Through the error as no edition loaded
	throw new DetailedError('There are no suitable editions for this environment:', { opts: opts, editions: editions, failures: editionFailures });
}

/**
 * Cycle through the editions for a package and require the correct one
 * @param {string} cwd - the path of the package, used to load package.json:editions and handle relative edition entry points
 * @param {function} require - the require method of the calling module, used to ensure require paths remain correct
 * @param {string} [entry] - an optional override for the entry of an edition, requires the edition to specify a `directory` property
 * @returns {*}
 */
function requirePackage(cwd, /* :string */require, /* :function */entry /* :: ?:string */) /* :any */{
	// Load the package.json file to fetch `name` for debugging and `editions` for loading
	var packagePath = pathUtil.resolve(cwd, 'package.json');

	var _require = require(packagePath),
	    name = _require.name,
	    editions = _require.editions;

	var opts /* :options */ = { cwd: cwd, require: require };
	if (name) opts["package"] = name;
	if (entry) opts.entry = entry;
	return requireEditions(editions, opts);
}

// Exports
module.exports = { requireEdition: requireEdition, requireEditions: requireEditions, requirePackage: requirePackage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9ub2RlX21vZHVsZXMvZWRpdGlvbnMvZXMyMDE1L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsWUFBWSxDQUFDOzs7O0FBSWIsU0FBUyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUFFLEtBQUksRUFBRSxRQUFRLFlBQVksV0FBVyxDQUFBLEFBQUMsRUFBRTtBQUFFLFFBQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztFQUFFO0NBQUU7O0FBRXpKLFNBQVMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUU7QUFBRSxRQUFNLElBQUksY0FBYyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7RUFBRSxBQUFDLE9BQU8sSUFBSSxLQUFLLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLENBQUEsQUFBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7Q0FBRTs7QUFFaFAsU0FBUyxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUFFLEtBQUksT0FBTyxVQUFVLEtBQUssVUFBVSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7QUFBRSxRQUFNLElBQUksU0FBUyxDQUFDLDBEQUEwRCxHQUFHLE9BQU8sVUFBVSxDQUFDLENBQUM7RUFBRSxBQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxJQUFJLFVBQVUsRUFBRSxNQUFNLENBQUMsY0FBYyxH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LEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0NBQy9JOzs7Ozs7Ozs7QUFTRCxTQUFTLGNBQWMsQ0FBQyxHQUFHLGVBQWdCLE9BQU8saUJBQWtCLEtBQUssOEJBQThCOztBQUV0RyxLQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFeEQsS0FBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztLQUMvQixJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUk7S0FDcEIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7O0FBRWpDLEtBQUksSUFBSSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUN6RCxLQUFJLElBQUksRUFBRSxJQUFJLFdBQVEsR0FBRyxJQUFJLENBQUM7QUFDOUIsS0FBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDOUIsUUFBTyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3ZDOzs7QUFHRCxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvYnVpbGQvbm9kZV9tb2R1bGVzL2VkaXRpb25zL2VzMjAxNS9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKiBlc2xpbnQgbm8tY29uc29sZTowICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIEltcG9ydHNcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgcGF0aFV0aWwgPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIEhlbHBlciBjbGFzcyB0byBkaXNwbGF5IG5lc3RlZCBlcnJvciBpbiBhIHNlbnNpYmxlIHdheVxuXG52YXIgRGV0YWlsZWRFcnJvciA9IGZ1bmN0aW9uIChfRXJyb3IpIHtcblx0X2luaGVyaXRzKERldGFpbGVkRXJyb3IsIF9FcnJvcik7XG5cblx0ZnVuY3Rpb24gRGV0YWlsZWRFcnJvcihtZXNzYWdlIC8qIDpzdHJpbmcgKi8sIGRldGFpbHMgLyogOk9iamVjdCAqLykge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEZXRhaWxlZEVycm9yKTtcblxuXHRcdE9iamVjdC5rZXlzKGRldGFpbHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0dmFyIGRhdGEgPSBkZXRhaWxzW2tleV07XG5cdFx0XHR2YXIgdmFsdWUgPSByZXF1aXJlKCd1dGlsJykuaW5zcGVjdChkYXRhLnN0YWNrIHx8IGRhdGEubWVzc2FnZSB8fCBkYXRhKTtcblx0XHRcdG1lc3NhZ2UgKz0gJ1xcbicgKyBrZXkgKyAnOiAnICsgdmFsdWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEZXRhaWxlZEVycm9yLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGV0YWlsZWRFcnJvcikpLmNhbGwodGhpcywgbWVzc2FnZSkpO1xuXHR9XG5cblx0cmV0dXJuIERldGFpbGVkRXJyb3I7XG59KEVycm9yKTtcblxuLy8gRW52aXJvbm1lbnQgZmV0Y2hpbmdcblxuXG52YXIgYmxhY2tsaXN0ID0gcHJvY2VzcyAmJiBwcm9jZXNzLmVudiAmJiBwcm9jZXNzLmVudi5FRElUSU9OU19TWU5UQVhfQkxBQ0tMSVNUICYmIHByb2Nlc3MuZW52LkVESVRJT05TX1NZTlRBWF9CTEFDS0xJU1Quc3BsaXQoJywnKTtcblxuLy8gQ2FjaGUgb2Ygd2hpY2ggc3ludGF4IGNvbWJpbmF0aW9ucyBhcmUgc3VwcG9ydGVkIG9yIHVuc3VwcG9ydGVkLCBoYXNoIG9mIGJvb2xlYW5zXG52YXIgc3ludGF4RmFpbGVkQ29tYml0aW9ucyA9IHt9OyAvLyBzb3J0ZWQgbG93ZXJjYXNlIHN5bnRheCBjb21iaW5hdGlvbiA9PiBFcnJvciBpbnN0YW5jZSBvZiBmYWlsdXJlXG52YXIgc3ludGF4QmxhY2tsaXN0ID0ge307XG5zeW50YXhCbGFja2xpc3QuaW1wb3J0ID0gbmV3IEVycm9yKCdUaGUgaW1wb3J0IHN5bnRheCBpcyBza2lwcGVkIGFzIHRoZSBtb2R1bGUgcGFja2FnZS5qc29uIGZpZWxkIGVsaW1pbmF0ZXMgdGhlIG5lZWQgZm9yIGF1dG9sb2FkZXIgc3VwcG9ydCcpO1xuc3ludGF4QmxhY2tsaXN0LmNvZmZlZXNjcmlwdCA9IG5ldyBFcnJvcignVGhlIGNvZmZlZXNjcmlwdCBzeW50YXggaXMgc2tpcHBlZCBhcyB3ZSB3YW50IHRvIHVzZSBhIHByZWNvbXBpbGVkIGVkaXRpb24gcmF0aGVyIHRoYW4gY29tcGlsaW5nIGF0IHJ1bnRpbWUnKTtcbnN5bnRheEJsYWNrbGlzdC50eXBlc2NyaXB0ID0gbmV3IEVycm9yKCdUaGUgdHlwZXNjcmlwdCBzeW50YXggaXMgc2tpcHBlZCBhcyB3ZSB3YW50IHRvIHVzZSBhIHByZWNvbXBpbGVkIGVkaXRpb24gcmF0aGVyIHRoYW4gY29tcGlsaW5nIGF0IHJ1bnRpbWUnKTtcblxuLy8gQmxhY2tsaXN0IG5vbi1lc25leHQgbm9kZSB2ZXJzaW9ucyBmcm9tIGVzbmV4dFxuaWYgKHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcblx0dmFyIEVBUkxJRVNUX0VTTkVYVF9OT0RFX1ZFUlNJT04gPSBbMCwgMTJdO1xuXHR2YXIgTk9ERV9WRVJTSU9OID0gcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLnNwbGl0KCcuJykubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0cmV0dXJuIHBhcnNlSW50KG4sIDEwKTtcblx0fSk7XG5cdHZhciBFU05FWFRfVU5TVVBQT1JURUQgPSBOT0RFX1ZFUlNJT05bMF0gPCBFQVJMSUVTVF9FU05FWFRfTk9ERV9WRVJTSU9OWzBdIHx8IE5PREVfVkVSU0lPTlswXSA9PT0gRUFSTElFU1RfRVNORVhUX05PREVfVkVSU0lPTlswXSAmJiBOT0RFX1ZFUlNJT05bMV0gPCBFQVJMSUVTVF9FU05FWFRfTk9ERV9WRVJTSU9OWzFdO1xuXHRpZiAoRVNORVhUX1VOU1VQUE9SVEVEKSBzeW50YXhCbGFja2xpc3QuZXNuZXh0ID0gbmV3IEVycm9yKCdUaGUgZXNuZXh0IHN5bnRheCBpcyBza2lwcGVkIG9uIGVhcmx5IG5vZGUgdmVyc2lvbnMgYXMgYXR0ZW1wdGluZyB0byB1c2UgZXNuZXh0IGZlYXR1cmVzIHdpbGwgb3V0cHV0IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBvbiB0aGVzZSBub2RlIHZlcnNpb25zJyk7XG59XG5cbi8vIENoZWNrIHRoZSBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uIGZvciBhIHN5bnRheCBibGFja2xpc3RcbmlmIChibGFja2xpc3QpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibGFja2xpc3QubGVuZ3RoOyArK2kpIHtcblx0XHR2YXIgc3ludGF4ID0gYmxhY2tsaXN0W2ldLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXHRcdHN5bnRheEJsYWNrbGlzdFtzeW50YXhdID0gbmV3IERldGFpbGVkRXJyb3IoJ1RoZSBFRElUSU9OU19TWU5UQVhfQkxBQ0tMSVNUIGVudmlyb25tZW50IHZhcmlhYmxlIGhhcyBibGFja2xpc3RlZCBhbiBlZGl0aW9uIHN5bnRheDonLCB7IHN5bnRheDogc3ludGF4LCBibGFja2xpc3Q6IGJsYWNrbGlzdCB9KTtcblx0fVxufVxuXG4vKiA6OlxudHlwZSBlZGl0aW9uID0ge1xuXHRuYW1lOm51bWJlcixcblx0ZGVzY3JpcHRpb24/OnN0cmluZyxcblx0ZGlyZWN0b3J5PzpzdHJpbmcsXG5cdGVudHJ5PzpzdHJpbmcsXG5cdHN5bnRheGVzPzpBcnJheTxzdHJpbmc+XG59O1xudHlwZSBvcHRpb25zID0ge1xuXHRjd2Q/OnN0cmluZyxcblx0cGFja2FnZT86c3RyaW5nLFxuXHRlbnRyeT86c3RyaW5nLFxuXHRyZXF1aXJlOmZ1bmN0aW9uXG59O1xuKi9cblxuLyoqXG4gKiBDeWNsZSB0aHJvdWdoIHRoZSBlZGl0aW9ucyBhbmQgcmVxdWlyZSB0aGUgY29ycmVjdCBvbmVcbiAqIEBwcm90ZWN0ZWQgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCBpcyB1bnRlc3RlZCBmb3IgcHVibGljIGNvbnN1bXB0aW9uXG4gKiBAcGFyYW0ge2VkaXRpb259IGVkaXRpb24gLSB0aGUgZWRpdGlvbiBlbnRyeVxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgLSB0aGUgZm9sbG93aW5nIG9wdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLnJlcXVpcmUgLSB0aGUgcmVxdWlyZSBtZXRob2Qgb2YgdGhlIGNhbGxpbmcgbW9kdWxlLCB1c2VkIHRvIGVuc3VyZSByZXF1aXJlIHBhdGhzIHJlbWFpbiBjb3JyZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuY3dkXSAtIGlmIHByb3ZpZGVkLCB0aGlzIHdpbGwgYmUgdGhlIGN3ZCBmb3IgZW50cmllc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmVudHJ5XSAtIGlmIHByb3ZpZGVkLCBzaG91bGQgYmUgYSByZWxhdGl2ZSBvciBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBlbnRyeSBwb2ludCBvZiB0aGUgZWRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLnBhY2thZ2VdIC0gaWYgcHJvdmlkZWQsIHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgcGFja2FnZSB0aGF0IHdlIGFyZSBsb2FkaW5nIHRoZSBlZGl0aW9ucyBmb3JcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiByZXF1aXJlRWRpdGlvbihlZGl0aW9uIC8qIDplZGl0aW9uICovLCBvcHRzIC8qIDpvcHRpb25zICovKSAvKiA6YW55ICove1xuXHQvLyBQcmV2ZW50IHJlcXVpcmUgZnJvbSBiZWluZyBpbmNsdWRlZCBpbiBkZWJ1ZyBsb2dzXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvcHRzLCAncmVxdWlyZScsIHsgdmFsdWU6IG9wdHMucmVxdWlyZSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG5cblx0Ly8gR2V0IHRoZSBjb3JyZWN0IGVudHJ5IHBhdGhcblx0Ly8gQXMgb2xkZXIgdmVyc2lvbnMgb1xuXHR2YXIgY3dkID0gb3B0cy5jd2QgfHwgJyc7XG5cdHZhciBkaXIgPSBlZGl0aW9uLmRpcmVjdG9yeSB8fCAnJztcblx0dmFyIGVudHJ5ID0gb3B0cy5lbnRyeSB8fCBlZGl0aW9uLmVudHJ5IHx8ICcnO1xuXHRpZiAoZGlyICYmIGVudHJ5ICYmIGVudHJ5LmluZGV4T2YoZGlyICsgJy8nKSA9PT0gMCkgZW50cnkgPSBlbnRyeS5zdWJzdHJpbmcoZGlyLmxlbmd0aCArIDEpO1xuXHQvLyBeIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWVkZWQsIGJ1dCBhcyBwcmV2aW91cyB2ZXJzaW9ucyBvZiBlZGl0aW9ucyBpbmNsdWRlZCB0aGUgZGlyZWN0b3J5IGluc2lkZSB0aGUgZW50cnlcblx0Ly8gaXQgdW5mb3J0dW5hdGVseSBpcywgYXMgc3VjaCB0aGlzIGlzIGEgc3RlcHBpbmcgc3RvbmUgZm9yIHRoZSBuZXcgZm9ybWF0LCB0aGUgbmV3IGZvcm1hdCBiZWluZ1xuXHQvLyBpZiBlbnRyeSBpcyBzcGVjaWZpZWQgYnkgaXRzZWxmLCBpdCBpcyBjd2QgPT4gZW50cnlcblx0Ly8gaWYgZW50cnkgaXMgc3BlY2lmaWVkIHdpdGggYSBkaXJlY3RvcnksIGl0IGlzIGN3ZCA9PiBkaXIgPT4gZW50cnlcblx0Ly8gaWYgZW50cnkgaXMgbm90IHNwZWNpZmllZCBidXQgZGlyIGlzLCBpdCBpcyBjd2QgPT4gZGlyXG5cdC8vIGlmIG5laXRoZXIgZW50cnkgbm9yIGRpciBhcmUgc3BlY2lmaWVkLCB3ZSBoYXZlIGEgcHJvYmxlbVxuXHRpZiAoIWRpciAmJiAhZW50cnkpIHtcblx0XHR2YXIgZWRpdGlvbkZhaWx1cmUgPSBuZXcgRGV0YWlsZWRFcnJvcignU2tpcHBlZCBlZGl0aW9uIGR1ZSB0byBubyBlbnRyeSBvciBkaXJlY3RvcnkgYmVpbmcgc3BlY2lmaWVkOicsIHsgZWRpdGlvbjogZWRpdGlvbiwgY3dkOiBjd2QsIGRpcjogZGlyLCBlbnRyeTogZW50cnkgfSk7XG5cdFx0dGhyb3cgZWRpdGlvbkZhaWx1cmU7XG5cdH1cblx0dmFyIGVudHJ5UGF0aCA9IHBhdGhVdGlsLnJlc29sdmUoY3dkLCBkaXIsIGVudHJ5KTtcblxuXHQvLyBDaGVjayBzeW50YXggc3VwcG9ydFxuXHQvLyBDb252ZXJ0IHN5bnRheGVzIGludG8gYSBzb3J0ZWQgbG93ZXJjYXNlIHN0cmluZ1xuXHR2YXIgc3ludGF4ZXMgPSBlZGl0aW9uLnN5bnRheGVzICYmIGVkaXRpb24uc3ludGF4ZXMubWFwKGZ1bmN0aW9uIChpKSB7XG5cdFx0cmV0dXJuIGkudG9Mb3dlckNhc2UoKTtcblx0fSkuc29ydCgpO1xuXHR2YXIgc3ludGF4Q29tYmluYXRpb24gPSBzeW50YXhlcyAmJiBzeW50YXhlcy5qb2luKCcsICcpO1xuXHRpZiAoc3ludGF4ZXMgJiYgc3ludGF4Q29tYmluYXRpb24pIHtcblx0XHQvLyBDaGVjayBpZiBhbnkgb2YgdGhlIHN5bnRheGVzIGFyZSB1bnN1cHBvcnRlZFxuXHRcdHZhciB1bnN1cHBvcnRlZFN5bnRheGVzID0gc3ludGF4ZXMuZmlsdGVyKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRyZXR1cm4gc3ludGF4QmxhY2tsaXN0W2kudG9Mb3dlckNhc2UoKV07XG5cdFx0fSk7XG5cdFx0aWYgKHVuc3VwcG9ydGVkU3ludGF4ZXMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgX2VkaXRpb25GYWlsdXJlID0gbmV3IERldGFpbGVkRXJyb3IoJ1NraXBwZWQgZWRpdGlvbiBkdWUgdG8gaXQgY29udGFpbmluZyBhbiB1bnN1cHBvcnRlZCBzeW50YXg6JywgeyBlZGl0aW9uOiBlZGl0aW9uLCB1bnN1cHBvcnRlZFN5bnRheGVzOiB1bnN1cHBvcnRlZFN5bnRheGVzIH0pO1xuXHRcdFx0dGhyb3cgX2VkaXRpb25GYWlsdXJlO1xuXHRcdH1cblx0XHQvLyBJcyB0aGlzIHN5bnRheCBjb21iaW5hdGlvbiB1bnN1cHBvcnRlZD8gSWYgc28gc2tpcCBpdCB3aXRoIGEgc29mdCBmYWlsdXJlIHRvIHRyeSB0aGUgbmV4dCBlZGl0aW9uXG5cdFx0ZWxzZSBpZiAoc3ludGF4RmFpbGVkQ29tYml0aW9uc1tzeW50YXhDb21iaW5hdGlvbl0pIHtcblx0XHRcdFx0dmFyIHByZXZpb3VzQ29tYmluYXRpb25GYWlsdXJlID0gc3ludGF4RmFpbGVkQ29tYml0aW9uc1tzeW50YXhDb21iaW5hdGlvbl07XG5cdFx0XHRcdHZhciBfZWRpdGlvbkZhaWx1cmUyID0gbmV3IERldGFpbGVkRXJyb3IoJ1NraXBwZWQgZWRpdGlvbiBkdWUgdG8gaXRzIHN5bnRheCBjb21iaW5hdGlvbSBmYWlsaW5nIHByZXZpb3VzbHk6JywgeyBlZGl0aW9uOiBlZGl0aW9uLCBwcmV2aW91c0NvbWJpbmF0aW9uRmFpbHVyZTogcHJldmlvdXNDb21iaW5hdGlvbkZhaWx1cmUgfSk7XG5cdFx0XHRcdHRocm93IF9lZGl0aW9uRmFpbHVyZTI7XG5cdFx0XHR9XG5cdH1cblxuXHQvLyBUcnkgYW5kIGxvYWQgdGhpcyBzeW50YXggY29tYmluYXRpb25cblx0dHJ5IHtcblx0XHRyZXR1cm4gb3B0cy5yZXF1aXJlKGVudHJ5UGF0aCk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gTm90ZSB0aGUgZXJyb3Igd2l0aCBtb3JlIGRldGFpbHNcblx0XHR2YXIgX2VkaXRpb25GYWlsdXJlMyA9IG5ldyBEZXRhaWxlZEVycm9yKCdGYWlsZWQgdG8gbG9hZCB0aGUgZWRpdGlvbiBkdWUgdG8gYSBsb2FkIGVycm9yOicsIHsgZWRpdGlvbjogZWRpdGlvbiwgZXJyb3I6IGVycm9yLnN0YWNrIH0pO1xuXG5cdFx0Ly8gQmxhY2tsaXN0IHRoZSBjb21iaW5hdGlvbiwgZXZlbiBpZiBpdCBtYXkgaGF2ZSB3b3JrZWQgYmVmb3JlXG5cdFx0Ly8gUGVyaGFwcyBpbiB0aGUgZnV0dXJlIG5vdGUgaWYgdGhhdCBpZiBpdCBkaWQgd29yayBwcmV2aW91c2x5LCB0aGVuIHdlIHNob3VsZCBpbnN0cnVjdCBtb2R1bGUgb3duZXJzIHRvIGJlIG1vcmUgc3BlY2lmaWMgd2l0aCB0aGVpciBzeW50YXhlc1xuXHRcdGlmIChzeW50YXhDb21iaW5hdGlvbikgc3ludGF4RmFpbGVkQ29tYml0aW9uc1tzeW50YXhDb21iaW5hdGlvbl0gPSBfZWRpdGlvbkZhaWx1cmUzO1xuXG5cdFx0Ly8gQ29udGludWUgdG8gdGhlIG5leHQgZWRpdGlvblxuXHRcdHRocm93IF9lZGl0aW9uRmFpbHVyZTM7XG5cdH1cbn1cblxuLyoqXG4gKiBDeWNsZSB0aHJvdWdoIHRoZSBlZGl0aW9ucyBhbmQgcmVxdWlyZSB0aGUgY29ycmVjdCBvbmVcbiAqIEBwcm90ZWN0ZWQgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCBpcyB1bnRlc3RlZCBmb3IgcHVibGljIGNvbnN1bXB0aW9uXG4gKiBAcGFyYW0ge0FycmF5PGVkaXRpb24+fSBlZGl0aW9ucyAtIGFuIGFycmF5IG9mIGVkaXRpb24gZW50cmllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgLSB0aGUgZm9sbG93aW5nIG9wdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLnJlcXVpcmUgLSB0aGUgcmVxdWlyZSBtZXRob2Qgb2YgdGhlIGNhbGxpbmcgbW9kdWxlLCB1c2VkIHRvIGVuc3VyZSByZXF1aXJlIHBhdGhzIHJlbWFpbiBjb3JyZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuY3dkXSAtIGlmIHByb3ZpZGVkLCB0aGlzIHdpbGwgYmUgdGhlIGN3ZCBmb3IgZW50cmllc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmVudHJ5XSAtIGlmIHByb3ZpZGVkLCBzaG91bGQgYmUgYSByZWxhdGl2ZSBwYXRoIHRvIHRoZSBlbnRyeSBwb2ludCBvZiB0aGUgZWRpdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLnBhY2thZ2VdIC0gaWYgcHJvdmlkZWQsIHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgcGFja2FnZSB0aGF0IHdlIGFyZSBsb2FkaW5nIHRoZSBlZGl0aW9ucyBmb3JcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiByZXF1aXJlRWRpdGlvbnMoZWRpdGlvbnMgLyogOkFycmF5PGVkaXRpb24+ICovLCBvcHRzIC8qIDpvcHRpb25zICovKSAvKiA6YW55ICove1xuXHQvLyBFeHRyYWN0XG5cdGlmIChvcHRzLnBhY2thZ2UgPT0gbnVsbCkgb3B0cy5wYWNrYWdlID0gJ2N1c3RvbSBydW50aW1lIHBhY2thZ2UnO1xuXG5cdC8vIENoZWNrXG5cdGlmICghZWRpdGlvbnMgfHwgZWRpdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0dGhyb3cgbmV3IERldGFpbGVkRXJyb3IoJ05vIGVkaXRpb25zIHdlcmUgc3BlY2lmaWVkOicsIHsgb3B0czogb3B0cyB9KTtcblx0fVxuXG5cdC8vIE5vdGUgdGhlIGxhc3QgZXJyb3IgbWVzc2FnZVxuXHR2YXIgZWRpdGlvbkZhaWx1cmVzID0gW107XG5cblx0Ly8gQ3ljbGUgdGhyb3VnaCB0aGUgZWRpdGlvbnNcblx0Zm9yICh2YXIgX2kgPSAwOyBfaSA8IGVkaXRpb25zLmxlbmd0aDsgKytfaSkge1xuXHRcdHZhciBlZGl0aW9uID0gZWRpdGlvbnNbX2ldO1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gcmVxdWlyZUVkaXRpb24oZWRpdGlvbiwgb3B0cyk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRlZGl0aW9uRmFpbHVyZXMucHVzaChlcnIpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRocm91Z2ggdGhlIGVycm9yIGFzIG5vIGVkaXRpb24gbG9hZGVkXG5cdHRocm93IG5ldyBEZXRhaWxlZEVycm9yKCdUaGVyZSBhcmUgbm8gc3VpdGFibGUgZWRpdGlvbnMgZm9yIHRoaXMgZW52aXJvbm1lbnQ6JywgeyBvcHRzOiBvcHRzLCBlZGl0aW9uczogZWRpdGlvbnMsIGZhaWx1cmVzOiBlZGl0aW9uRmFpbHVyZXMgfSk7XG59XG5cbi8qKlxuICogQ3ljbGUgdGhyb3VnaCB0aGUgZWRpdGlvbnMgZm9yIGEgcGFja2FnZSBhbmQgcmVxdWlyZSB0aGUgY29ycmVjdCBvbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjd2QgLSB0aGUgcGF0aCBvZiB0aGUgcGFja2FnZSwgdXNlZCB0byBsb2FkIHBhY2thZ2UuanNvbjplZGl0aW9ucyBhbmQgaGFuZGxlIHJlbGF0aXZlIGVkaXRpb24gZW50cnkgcG9pbnRzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXF1aXJlIC0gdGhlIHJlcXVpcmUgbWV0aG9kIG9mIHRoZSBjYWxsaW5nIG1vZHVsZSwgdXNlZCB0byBlbnN1cmUgcmVxdWlyZSBwYXRocyByZW1haW4gY29ycmVjdFxuICogQHBhcmFtIHtzdHJpbmd9IFtlbnRyeV0gLSBhbiBvcHRpb25hbCBvdmVycmlkZSBmb3IgdGhlIGVudHJ5IG9mIGFuIGVkaXRpb24sIHJlcXVpcmVzIHRoZSBlZGl0aW9uIHRvIHNwZWNpZnkgYSBgZGlyZWN0b3J5YCBwcm9wZXJ0eVxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIHJlcXVpcmVQYWNrYWdlKGN3ZCAvKiA6c3RyaW5nICovLCByZXF1aXJlIC8qIDpmdW5jdGlvbiAqLywgZW50cnkgLyogOjogPzpzdHJpbmcgKi8pIC8qIDphbnkgKi97XG5cdC8vIExvYWQgdGhlIHBhY2thZ2UuanNvbiBmaWxlIHRvIGZldGNoIGBuYW1lYCBmb3IgZGVidWdnaW5nIGFuZCBgZWRpdGlvbnNgIGZvciBsb2FkaW5nXG5cdHZhciBwYWNrYWdlUGF0aCA9IHBhdGhVdGlsLnJlc29sdmUoY3dkLCAncGFja2FnZS5qc29uJyk7XG5cblx0dmFyIF9yZXF1aXJlID0gcmVxdWlyZShwYWNrYWdlUGF0aCksXG5cdCAgICBuYW1lID0gX3JlcXVpcmUubmFtZSxcblx0ICAgIGVkaXRpb25zID0gX3JlcXVpcmUuZWRpdGlvbnM7XG5cblx0dmFyIG9wdHMgLyogOm9wdGlvbnMgKi8gPSB7IGN3ZDogY3dkLCByZXF1aXJlOiByZXF1aXJlIH07XG5cdGlmIChuYW1lKSBvcHRzLnBhY2thZ2UgPSBuYW1lO1xuXHRpZiAoZW50cnkpIG9wdHMuZW50cnkgPSBlbnRyeTtcblx0cmV0dXJuIHJlcXVpcmVFZGl0aW9ucyhlZGl0aW9ucywgb3B0cyk7XG59XG5cbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0geyByZXF1aXJlRWRpdGlvbjogcmVxdWlyZUVkaXRpb24sIHJlcXVpcmVFZGl0aW9uczogcmVxdWlyZUVkaXRpb25zLCByZXF1aXJlUGFja2FnZTogcmVxdWlyZVBhY2thZ2UgfTsiXX0=