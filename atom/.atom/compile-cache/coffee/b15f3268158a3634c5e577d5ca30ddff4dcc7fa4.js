(function() {
  var config, proxy;

  proxy = require("../services/php-proxy.coffee");

  config = require("../config.coffee");

  module.exports = {
    structureStartRegex: /(?:abstract class|class|trait|interface)\s+(\w+)/,
    useStatementRegex: /(?:use)(?:[^\w\\])([\w\\]+)(?![\w\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/,
    cache: [],

    /**
     * Retrieves the class the specified term (method or property) is being invoked on.
     *
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     *
     * @return {string}
     *
     * @example Invoking it on MyMethod::foo()->bar() will ask what class 'bar' is invoked on, which will whatever type
     *          foo returns.
     */
    getCalledClass: function(editor, term, bufferPosition) {
      var fullCall;
      fullCall = this.getStackClasses(editor, bufferPosition);
      if ((fullCall != null ? fullCall.length : void 0) === 0 || !term) {
        return;
      }
      return this.parseElements(editor, bufferPosition, fullCall);
    },

    /**
     * Get all variables declared in the current function
     * @param {TextEdutir} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     */
    getAllVariablesInFunction: function(editor, bufferPosition) {
      var isInFunction, matches, regex, startPosition, text;
      isInFunction = this.isInFunction(editor, bufferPosition);
      startPosition = null;
      if (isInFunction) {
        startPosition = this.cache['functionPosition'];
      } else {
        startPosition = [0, 0];
      }
      text = editor.getTextInBufferRange([startPosition, [bufferPosition.row, bufferPosition.column - 1]]);
      regex = /(\$[a-zA-Z_]+)/g;
      matches = text.match(regex);
      if (matches == null) {
        return [];
      }
      if (isInFunction) {
        matches.push("$this");
      }
      return matches;
    },

    /**
     * Retrieves the full class name. If the class name is a FQCN (Fully Qualified Class Name), it already is a full
     * name and it is returned as is. Otherwise, the current namespace and use statements are scanned.
     *
     * @param {TextEditor}  editor    Text editor instance.
     * @param {string|null} className Name of the class to retrieve the full name of. If null, the current class will
     *                                be returned (if any).
     *
     * @return string
     */
    getFullClassName: function(editor, className) {
      var classNameParts, definitionPattern, found, fullClass, i, importNameParts, isAliasedImport, line, lines, matches, methodsRequest, namespacePattern, text, usePattern, _i, _len;
      if (className == null) {
        className = null;
      }
      if (className === null) {
        className = '';
      }
      if (className && className[0] === "\\") {
        return className.substr(1);
      }
      usePattern = /(?:use)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/;
      namespacePattern = /(?:namespace)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:;)/;
      definitionPattern = /(?:abstract class|class|trait|interface)\s+(\w+)/;
      text = editor.getText();
      lines = text.split('\n');
      fullClass = className;
      found = false;
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        matches = line.match(namespacePattern);
        if (matches) {
          fullClass = matches[1] + '\\' + className;
        } else if (className) {
          matches = line.match(usePattern);
          if (matches) {
            classNameParts = className.split('\\');
            importNameParts = matches[1].split('\\');
            isAliasedImport = matches[2] ? true : false;
            if (className === matches[1]) {
              fullClass = className;
              break;
            } else if ((isAliasedImport && matches[2] === classNameParts[0]) || (!isAliasedImport && importNameParts[importNameParts.length - 1] === classNameParts[0])) {
              found = true;
              fullClass = matches[1];
              classNameParts = classNameParts.slice(1, +classNameParts.length + 1 || 9e9);
              if (classNameParts.length > 0) {
                fullClass += '\\' + classNameParts.join('\\');
              }
              break;
            }
          }
        }
        matches = line.match(definitionPattern);
        if (matches) {
          if (!className) {
            found = true;
            fullClass += matches[1];
          }
          break;
        }
      }
      if (fullClass && fullClass[0] === '\\') {
        fullClass = fullClass.substr(1);
      }
      if (!found) {
        methodsRequest = proxy.methods(fullClass);
        if (!(methodsRequest != null ? methodsRequest.filename : void 0)) {
          fullClass = className;
        }
      }
      return fullClass;
    },

    /**
     * Add the use for the given class if not already added.
     *
     * @param {TextEditor} editor                  Atom text editor.
     * @param {string}     className               Name of the class to add.
     * @param {boolean}    allowAdditionalNewlines Whether to allow adding additional newlines to attempt to group use
     *                                             statements.
     *
     * @return {int}       The amount of lines added (including newlines), so you can reliably and easily offset your
     *                     rows. This could be zero if a use statement was already present.
     */
    addUseClass: function(editor, className, allowAdditionalNewlines) {
      var bestScore, bestUse, doNewLine, i, line, lineCount, lineEnding, lineToInsertAt, matches, placeBelow, scopeDescriptor, score, textToInsert, _i, _ref;
      if (className.split('\\').length === 1 || className.indexOf('\\') === 0) {
        return null;
      }
      bestUse = 0;
      bestScore = 0;
      placeBelow = true;
      doNewLine = true;
      lineCount = editor.getLineCount();
      for (i = _i = 0, _ref = lineCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        line = editor.lineTextForBufferRow(i).trim();
        if (line.length === 0) {
          continue;
        }
        scopeDescriptor = editor.scopeDescriptorForBufferPosition([i, line.length]).getScopeChain();
        if (scopeDescriptor.indexOf('.comment') >= 0) {
          continue;
        }
        if (line.match(this.structureStartRegex)) {
          break;
        }
        if (line.indexOf('namespace ') >= 0) {
          bestUse = i;
        }
        matches = this.useStatementRegex.exec(line);
        if ((matches != null) && (matches[1] != null)) {
          if (matches[1] === className) {
            return 0;
          }
          score = this.scoreClassName(className, matches[1]);
          if (score >= bestScore) {
            bestUse = i;
            bestScore = score;
            if (this.doShareCommonNamespacePrefix(className, matches[1])) {
              doNewLine = false;
              placeBelow = className.length >= matches[1].length ? true : false;
            } else {
              doNewLine = true;
              placeBelow = true;
            }
          }
        }
      }
      lineEnding = editor.getBuffer().lineEndingForRow(0);
      if (!allowAdditionalNewlines) {
        doNewLine = false;
      }
      if (!lineEnding) {
        lineEnding = "\n";
      }
      textToInsert = '';
      if (doNewLine && placeBelow) {
        textToInsert += lineEnding;
      }
      textToInsert += ("use " + className + ";") + lineEnding;
      if (doNewLine && !placeBelow) {
        textToInsert += lineEnding;
      }
      lineToInsertAt = bestUse + (placeBelow ? 1 : 0);
      editor.setTextInBufferRange([[lineToInsertAt, 0], [lineToInsertAt, 0]], textToInsert);
      return 1 + (doNewLine ? 1 : 0);
    },

    /**
     * Returns a boolean indicating if the specified class names share a common namespace prefix.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {boolean}
     */
    doShareCommonNamespacePrefix: function(firstClassName, secondClassName) {
      var firstClassNameParts, secondClassNameParts;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      firstClassNameParts.pop();
      secondClassNameParts.pop();
      if (firstClassNameParts.join('\\') === secondClassNameParts.join('\\')) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Scores the first class name against the second, indicating how much they 'match' each other. This can be used
     * to e.g. find an appropriate location to place a class in an existing list of classes.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {float}
     */
    scoreClassName: function(firstClassName, secondClassName) {
      var firstClassNameParts, i, maxLength, secondClassNameParts, totalScore, _i, _ref;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      maxLength = 0;
      if (firstClassNameParts.length > secondClassNameParts.length) {
        maxLength = secondClassNameParts.length;
      } else {
        maxLength = firstClassNameParts.length;
      }
      totalScore = 0;
      for (i = _i = 0, _ref = maxLength - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (firstClassNameParts[i] === secondClassNameParts[i]) {
          totalScore += 2;
        }
      }
      if (this.doShareCommonNamespacePrefix(firstClassName, secondClassName)) {
        if (firstClassName.length === secondClassName.length) {
          totalScore += 2;
        } else {
          totalScore -= 0.001 * Math.abs(secondClassName.length - firstClassName.length);
        }
      }
      return totalScore;
    },

    /**
     * Checks if the given name is a class or not
     * @param  {string}  name Name to check
     * @return {Boolean}
     */
    isClass: function(name) {
      return name.substr(0, 1).toUpperCase() + name.substr(1) === name;
    },

    /**
     * Checks if the current buffer is in a functon or not
     * @param {TextEditor} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     * @return bool
     */
    isInFunction: function(editor, bufferPosition) {
      var chain, character, closedBlocks, lastChain, line, lineLength, openedBlocks, result, row, rows, text;
      text = editor.getTextInBufferRange([[0, 0], bufferPosition]);
      if (this.cache[text] != null) {
        return this.cache[text];
      }
      this.cache = [];
      row = bufferPosition.row;
      rows = text.split('\n');
      openedBlocks = 0;
      closedBlocks = 0;
      result = false;
      while (row !== -1) {
        line = rows[row];
        if (!line) {
          row--;
          continue;
        }
        character = 0;
        lineLength = line.length;
        lastChain = null;
        while (character <= line.length) {
          chain = editor.scopeDescriptorForBufferPosition([row, character]).getScopeChain();
          if (!(character === line.length && chain === lastChain)) {
            if (chain.indexOf("scope.end") !== -1) {
              closedBlocks++;
            } else if (chain.indexOf("scope.begin") !== -1) {
              openedBlocks++;
            }
          }
          lastChain = chain;
          character++;
        }
        chain = editor.scopeDescriptorForBufferPosition([row, line.length]).getScopeChain();
        if (chain.indexOf("function") !== -1) {
          if (openedBlocks > closedBlocks) {
            result = true;
            this.cache["functionPosition"] = [row, 0];
            break;
          }
        }
        row--;
      }
      this.cache[text] = result;
      return result;
    },

    /**
     * Retrieves the stack of elements in a stack of calls such as "self::xxx->xxxx".
     *
     * @param  {TextEditor} editor
     * @param  {Point}       position
     *
     * @return {Object}
     */
    getStackClasses: function(editor, position) {
      var finished, i, line, lineText, parenthesesClosed, parenthesesOpened, scopeDescriptor, squiggleBracketsClosed, squiggleBracketsOpened, textSlice;
      if (position == null) {
        return;
      }
      line = position.row;
      finished = false;
      parenthesesOpened = 0;
      parenthesesClosed = 0;
      squiggleBracketsOpened = 0;
      squiggleBracketsClosed = 0;
      while (line > 0) {
        lineText = editor.lineTextForBufferRow(line);
        if (line !== position.row) {
          i = lineText.length - 1;
        } else {
          i = position.column - 1;
        }
        while (i >= 0) {
          if (lineText[i] === '(') {
            ++parenthesesOpened;
            if (parenthesesOpened > parenthesesClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === ')') {
            ++parenthesesClosed;
          } else if (lineText[i] === '{') {
            ++squiggleBracketsOpened;
            if (squiggleBracketsOpened > squiggleBracketsClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === '}') {
            ++squiggleBracketsClosed;
          } else if (parenthesesOpened === parenthesesClosed && squiggleBracketsOpened === squiggleBracketsClosed) {
            if (lineText[i] === '$') {
              finished = true;
              break;
            } else if (lineText[i] === ';' || lineText[i] === '=') {
              ++i;
              finished = true;
              break;
            } else {
              scopeDescriptor = editor.scopeDescriptorForBufferPosition([line, i]).getScopeChain();
              if (scopeDescriptor.indexOf('.function.construct') > 0 || scopeDescriptor.indexOf('.comment') > 0) {
                ++i;
                finished = true;
                break;
              }
            }
          }
          --i;
        }
        if (finished) {
          break;
        }
        --line;
      }
      textSlice = editor.getTextInBufferRange([[line, i], position]).trim();
      return this.parseStackClass(textSlice);
    },

    /**
     * Removes content inside parantheses (including nested parantheses).
     * @param {string} text String to analyze.
     * @return String
     */
    stripParanthesesContent: function(text) {
      var closeCount, i, openCount, originalLength, startIndex;
      i = 0;
      openCount = 0;
      closeCount = 0;
      startIndex = -1;
      while (i < text.length) {
        if (text[i] === '(') {
          ++openCount;
          if (openCount === 1) {
            startIndex = i;
          }
        } else if (text[i] === ')') {
          ++closeCount;
          if (closeCount === openCount) {
            originalLength = text.length;
            text = text.substr(0, startIndex + 1) + text.substr(i, text.length);
            i -= originalLength - text.length;
            openCount = 0;
            closeCount = 0;
          }
        }
        ++i;
      }
      return text;
    },

    /**
     * Parse stack class elements
     * @param {string} text String of the stack class
     * @return Array
     */
    parseStackClass: function(text) {
      var element, elements, key, regx;
      regx = /\/\/.*\n/g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      regx = /\/\*[^(\*\/)]*\*\//g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      text = this.stripParanthesesContent(text);
      if (!text) {
        return [];
      }
      elements = text.split(/(?:\-\>|::)/);
      for (key in elements) {
        element = elements[key];
        element = element.replace(/^\s+|\s+$/g, "");
        if (element[0] === '{' || element[0] === '(' || element[0] === '[') {
          element = element.substring(1);
        } else if (element.indexOf('return ') === 0) {
          element = element.substring('return '.length);
        }
        elements[key] = element;
      }
      return elements;
    },

    /**
     * Get the type of a variable
     *
     * @param {TextEditor} editor
     * @param {Range}      bufferPosition
     * @param {string}     element        Variable to search
     */
    getVariableType: function(editor, bufferPosition, element) {
      var bestMatch, bestMatchRow, chain, elements, funcName, line, lineNumber, matches, matchesCatch, matchesNew, newPosition, params, regexCatch, regexElement, regexFunction, regexNewInstance, regexVar, regexVarWithVarName, typeHint, value;
      if (element.replace(/[\$][a-zA-Z0-9_]+/g, "").trim().length > 0) {
        return null;
      }
      if (element.trim().length === 0) {
        return null;
      }
      bestMatch = null;
      bestMatchRow = null;
      regexElement = new RegExp("\\" + element + "[\\s]*=[\\s]*([^;]+);", "g");
      regexNewInstance = new RegExp("\\" + element + "[\\s]*=[\\s]*new[\\s]*\\\\?([A-Z][a-zA-Z_\\\\]*)+(?:(.+)?);", "g");
      regexCatch = new RegExp("catch[\\s]*\\([\\s]*([A-Za-z0-9_\\\\]+)[\\s]+\\" + element + "[\\s]*\\)", "g");
      lineNumber = bufferPosition.row - 1;
      while (lineNumber > 0) {
        line = editor.lineTextForBufferRow(lineNumber);
        if (!bestMatch) {
          matchesNew = regexNewInstance.exec(line);
          if (null !== matchesNew) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesNew[1]);
          }
        }
        if (!bestMatch) {
          matchesCatch = regexCatch.exec(line);
          if (null !== matchesCatch) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesCatch[1]);
          }
        }
        if (!bestMatch) {
          matches = regexElement.exec(line);
          if (null !== matches) {
            value = matches[1];
            elements = this.parseStackClass(value);
            elements.push("");
            newPosition = {
              row: lineNumber,
              column: bufferPosition.column
            };
            bestMatchRow = lineNumber;
            bestMatch = this.parseElements(editor, newPosition, elements);
          }
        }
        if (!bestMatch) {
          regexFunction = new RegExp("function(?:[\\s]+([a-zA-Z]+))?[\\s]*[\\(](?:(?![a-zA-Z\\_\\\\]*[\\s]*\\" + element + ").)*[,\\s]?([a-zA-Z\\_\\\\]*)[\\s]*\\" + element + "[a-zA-Z0-9\\s\\$\\\\,=\\\"\\\'\(\)]*[\\s]*[\\)]", "g");
          matches = regexFunction.exec(line);
          if (null !== matches) {
            typeHint = matches[2];
            if (typeHint.length > 0) {
              return this.getFullClassName(editor, typeHint);
            }
            funcName = matches[1];
            if (funcName && funcName.length > 0) {
              params = proxy.docParams(this.getFullClassName(editor), funcName);
              if ((params.params != null) && (params.params[element] != null)) {
                return this.getFullClassName(editor, params.params[element]);
              }
            }
          }
        }
        chain = editor.scopeDescriptorForBufferPosition([lineNumber, line.length]).getScopeChain();
        if (chain.indexOf("comment") !== -1) {
          if (bestMatchRow && lineNumber === (bestMatchRow - 1)) {
            regexVar = /\@var[\s]+([a-zA-Z_\\]+)(?![\w]+\$)/g;
            matches = regexVar.exec(line);
            if (null !== matches) {
              return this.getFullClassName(editor, matches[1]);
            }
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+([a-zA-Z_\\\\]+)[\\s]+\\" + element, "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+\\" + element + "[\\s]+([a-zA-Z_\\\\]+)", "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
        }
        if (chain.indexOf("function") !== -1) {
          break;
        }
        --lineNumber;
      }
      return bestMatch;
    },

    /**
     * Retrieves contextual information about the class member at the specified location in the editor.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     * @param {Object}     calledClass    Information about the called class (optional).
     */
    getMemberContext: function(editor, term, bufferPosition, calledClass) {
      var methods, val, value, _i, _len;
      if (!calledClass) {
        calledClass = this.getCalledClass(editor, term, bufferPosition);
      }
      if (!calledClass) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      methods = proxy.methods(calledClass);
      if (!methods) {
        return;
      }
      if ((methods.error != null) && methods.error !== '') {
        if (config.config.verboseErrors) {
          atom.notifications.addError('Failed to get methods for ' + calledClass, {
            'detail': methods.error.message
          });
        } else {
          console.log('Failed to get methods for ' + calledClass + ' : ' + methods.error.message);
        }
        return;
      }
      if (methods.names.indexOf(term) === -1) {
        return;
      }
      value = methods.values[term];
      if (value instanceof Array) {
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          val = value[_i];
          if (val.isMethod) {
            value = val;
            break;
          }
        }
      }
      return value;
    },

    /**
     * Parse all elements from the given array to return the last className (if any)
     * @param  Array elements Elements to parse
     * @return string|null full class name of the last element
     */
    parseElements: function(editor, bufferPosition, elements) {
      var className, element, loop_index, methods, _i, _len;
      loop_index = 0;
      className = null;
      if (elements == null) {
        return;
      }
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        if (loop_index === 0) {
          if (element[0] === '$') {
            className = this.getVariableType(editor, bufferPosition, element);
            if (element === '$this' && !className) {
              className = this.getFullClassName(editor);
            }
            loop_index++;
            continue;
          } else if (element === 'static' || element === 'self') {
            className = this.getFullClassName(editor);
            loop_index++;
            continue;
          } else if (element === 'parent') {
            className = this.getParentClass(editor);
            loop_index++;
            continue;
          } else {
            className = this.getFullClassName(editor, element);
            loop_index++;
            continue;
          }
        }
        if (loop_index >= elements.length - 1) {
          break;
        }
        if (className === null) {
          break;
        }
        methods = proxy.autocomplete(className, element);
        if ((methods["class"] == null) || !this.isClass(methods["class"])) {
          className = null;
          break;
        }
        className = methods["class"];
        loop_index++;
      }
      if (elements.length > 0 && (elements[elements.length - 1].length === 0 || elements[elements.length - 1].match(/([a-zA-Z0-9]$)/g))) {
        return className;
      }
      return null;
    },

    /**
     * Gets the full words from the buffer position given.
     * E.g. Getting a class with its namespace.
     * @param  {TextEditor}     editor   TextEditor to search.
     * @param  {BufferPosition} position BufferPosition to start searching from.
     * @return {string}  Returns a string of the class.
     */
    getFullWordFromBufferPosition: function(editor, position) {
      var backwardRegex, currentText, endBufferPosition, forwardRegex, foundEnd, foundStart, index, previousText, range, startBufferPosition;
      foundStart = false;
      foundEnd = false;
      startBufferPosition = [];
      endBufferPosition = [];
      forwardRegex = /-|(?:\()[\w\[\$\(\\]|\s|\)|;|'|,|"|\|/;
      backwardRegex = /\(|\s|\)|;|'|,|"|\|/;
      index = -1;
      previousText = '';
      while (true) {
        index++;
        startBufferPosition = [position.row, position.column - index - 1];
        range = [[position.row, position.column], [startBufferPosition[0], startBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (backwardRegex.test(editor.getTextInBufferRange(range)) || startBufferPosition[1] === -1 || currentText === previousText) {
          foundStart = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundStart) {
          break;
        }
      }
      index = -1;
      while (true) {
        index++;
        endBufferPosition = [position.row, position.column + index + 1];
        range = [[position.row, position.column], [endBufferPosition[0], endBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (forwardRegex.test(currentText) || endBufferPosition[1] === 500 || currentText === previousText) {
          foundEnd = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundEnd) {
          break;
        }
      }
      startBufferPosition[1] += 1;
      endBufferPosition[1] -= 1;
      return editor.getTextInBufferRange([startBufferPosition, endBufferPosition]);
    },

    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */
    getClassSelectorFromEvent: function(event) {
      var $, selector;
      selector = event.currentTarget;
      $ = require('jquery');
      if ($(selector).hasClass('builtin') || $(selector).children('.builtin').length > 0) {
        return null;
      }
      if ($(selector).parent().hasClass('function argument')) {
        return $(selector).parent().children('.namespace, .class:not(.operator):not(.constant)');
      }
      if ($(selector).prev().hasClass('namespace') && $(selector).hasClass('class')) {
        return $([$(selector).prev()[0], selector]);
      }
      if ($(selector).next().hasClass('class') && $(selector).hasClass('namespace')) {
        return $([selector, $(selector).next()[0]]);
      }
      if ($(selector).prev().hasClass('namespace') || $(selector).next().hasClass('inherited-class')) {
        return $(selector).parent().children('.namespace, .inherited-class');
      }
      return selector;
    },

    /**
     * Gets the parent class of the current class opened in the editor
     * @param  {TextEditor} editor Editor with the class in.
     * @return {string}            The namespace and class of the parent
     */
    getParentClass: function(editor) {
      var extendsIndex, line, lines, text, words, _i, _len;
      text = editor.getText();
      lines = text.split('\n');
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        line = line.trim();
        if (line.indexOf('extends ') !== -1) {
          words = line.split(' ');
          extendsIndex = words.indexOf('extends');
          return this.getFullClassName(editor, words[extendsIndex + 1]);
        }
      }
    },

    /**
     * Finds the buffer position of the word given
     * @param  {TextEditor} editor TextEditor to search
     * @param  {string}     term   The function name to search for
     * @return {mixed}             Either null or the buffer position of the function.
     */
    findBufferPositionOfWord: function(editor, term, regex, line) {
      var lineText, lines, result, row, text, _i, _len;
      if (line == null) {
        line = null;
      }
      if (line !== null) {
        lineText = editor.lineTextForBufferRow(line);
        result = this.checkLineForWord(lineText, term, regex);
        if (result !== null) {
          return [line, result];
        }
      } else {
        text = editor.getText();
        row = 0;
        lines = text.split('\n');
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          result = this.checkLineForWord(line, term, regex);
          if (result !== null) {
            return [row, result];
          }
          row++;
        }
      }
      return null;
    },

    /**
     * Checks the lineText for the term and regex matches
     * @param  {string}   lineText The line of text to check.
     * @param  {string}   term     Term to look for.
     * @param  {regex}    regex    Regex to run on the line to make sure it's valid
     * @return {null|int}          Returns null if nothing was found or an
     *                             int of the column the term is on.
     */
    checkLineForWord: function(lineText, term, regex) {
      var element, propertyIndex, reducedWords, words, _i, _len;
      if (regex.test(lineText)) {
        words = lineText.split(' ');
        propertyIndex = 0;
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          element = words[_i];
          if (element.indexOf(term) !== -1) {
            break;
          }
          propertyIndex++;
        }
        reducedWords = words.slice(0, propertyIndex).join(' ');
        return reducedWords.length + 1;
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUixDQURULENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixrREFBckI7QUFBQSxJQUNBLGlCQUFBLEVBQW1CLG9FQURuQjtBQUFBLElBSUEsS0FBQSxFQUFPLEVBSlA7QUFNQTtBQUFBOzs7Ozs7Ozs7OztPQU5BO0FBQUEsSUFrQkEsY0FBQSxFQUFnQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ1osVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFBeUIsY0FBekIsQ0FBWCxDQUFBO0FBRUEsTUFBQSx3QkFBRyxRQUFRLENBQUUsZ0JBQVYsS0FBb0IsQ0FBcEIsSUFBeUIsQ0FBQSxJQUE1QjtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBS0EsYUFBTyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsY0FBdkIsRUFBdUMsUUFBdkMsQ0FBUCxDQU5ZO0lBQUEsQ0FsQmhCO0FBMEJBO0FBQUE7Ozs7T0ExQkE7QUFBQSxJQStCQSx5QkFBQSxFQUEyQixTQUFDLE1BQUQsRUFBUyxjQUFULEdBQUE7QUFFdkIsVUFBQSxpREFBQTtBQUFBLE1BQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQUFzQixjQUF0QixDQUFmLENBQUE7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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/services/php-file-parser.coffee
