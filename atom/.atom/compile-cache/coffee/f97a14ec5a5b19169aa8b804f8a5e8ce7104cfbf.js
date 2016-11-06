(function() {
  var config, plugins, proxy;

  proxy = require("../services/php-proxy.coffee");

  config = require("../config.coffee");

  plugins = require("../services/plugin-manager.coffee");

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
     * @param {boolean}     noCurrent Do not use the current class if className is empty
     *
     * @return string
     */
    getFullClassName: function(editor, className, noCurrent) {
      var classNameParts, definitionPattern, found, fullClass, i, importNameParts, isAliasedImport, line, lines, matches, methodsRequest, namespacePattern, text, usePattern, _i, _len;
      if (className == null) {
        className = null;
      }
      if (noCurrent == null) {
        noCurrent = false;
      }
      if (className === null) {
        className = '';
        if (noCurrent) {
          return null;
        }
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
        if (!lineText) {
          return;
        }
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
              if (scopeDescriptor.indexOf('.function.construct') > 0) {
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
     * @param {string}  text String to analyze.
     * @param {boolean} keep string inside parenthesis
     * @return String
     */
    stripParanthesesContent: function(text, keepString) {
      var closeCount, content, i, openCount, originalLength, reg, startIndex;
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
            content = text.substring(startIndex, i + 1);
            reg = /["(][\s]*[\'\"][\s]*([^\"\']+)[\s]*[\"\'][\s]*[")]/g;
            if (openCount === 1 && reg.exec(content)) {
              continue;
            }
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
      text = this.stripParanthesesContent(text, true);
      if (!text) {
        return [];
      }
      elements = text.split(/(?:\-\>|::)/);
      for (key in elements) {
        element = elements[key];
        element = element.replace(/^\s+|\s+$/g, "");
        if (element[0] === '{' || element[0] === '[') {
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
      regexNewInstance = new RegExp("\\" + element + "[\\s]*=[\\s]*new[\\s]*\\\\?([a-zA-Z][a-zA-Z_\\\\]*)+(?:(.+)?);", "g");
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
                return this.getFullClassName(editor, params.params[element].type, true);
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
      var methods, val, value, _i, _len, _ref;
      if (!calledClass) {
        calledClass = this.getCalledClass(editor, term, bufferPosition);
      }
      if (!calledClass) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      methods = proxy.methods(calledClass);
      if (!methods || (methods == null)) {
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
      if (!((_ref = methods.values) != null ? _ref.hasOwnProperty(term) : void 0)) {
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
      var className, element, found, loop_index, methods, plugin, _i, _j, _len, _len1, _ref;
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
        found = null;
        _ref = plugins.plugins;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          plugin = _ref[_j];
          if (plugin.autocomplete == null) {
            continue;
          }
          found = plugin.autocomplete(className, element);
          if (found) {
            break;
          }
        }
        if (found) {
          className = found;
        } else {
          methods = proxy.autocomplete(className, element);
          if ((methods["class"] == null) || !this.isClass(methods["class"])) {
            className = null;
            break;
          }
          className = methods["class"];
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUixDQURULENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLG1DQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7QUFBQSxJQUFBLG1CQUFBLEVBQXFCLGtEQUFyQjtBQUFBLElBQ0EsaUJBQUEsRUFBbUIsb0VBRG5CO0FBQUEsSUFJQSxLQUFBLEVBQU8sRUFKUDtBQU1BO0FBQUE7Ozs7Ozs7Ozs7O09BTkE7QUFBQSxJQWtCQSxjQUFBLEVBQWdCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxjQUFmLEdBQUE7QUFDWixVQUFBLFFBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQUF5QixjQUF6QixDQUFYLENBQUE7QUFFQSxNQUFBLHdCQUFHLFFBQVEsQ0FBRSxnQkFBVixLQUFvQixDQUFwQixJQUF5QixDQUFBLElBQTVCO0FBQ0ksY0FBQSxDQURKO09BRkE7QUFLQSxhQUFPLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQUF1QixjQUF2QixFQUF1QyxRQUF2QyxDQUFQLENBTlk7SUFBQSxDQWxCaEI7QUEwQkE7QUFBQTs7OztPQTFCQTtBQUFBLElBK0JBLHlCQUFBLEVBQTJCLFNBQUMsTUFBRCxFQUFTLGNBQVQsR0FBQTtBQUV2QixVQUFBLGlEQUFBO0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/services/php-file-parser.coffee
