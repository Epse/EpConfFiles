(function() {
  var classDeclarations, namespaceDeclaration, proxy;

  proxy = require("../services/php-proxy.coffee");

  classDeclarations = ['class ', 'abstract class ', 'trait '];

  namespaceDeclaration = 'namespace ';

  module.exports = {
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
     * Add the use for the given class if not already added
     * @param {TextEditor} editor    Atom text editor
     * @param {string}     className Name of the class to add
     */
    addUseClass: function(editor, className) {
      var index, lastUse, line, lines, matches, splits, text, useRegex, _i, _len;
      text = editor.getText();
      lastUse = 0;
      index = 0;
      splits = className.split('\\');
      if (splits.length === 1 || className.indexOf('\\') === 0) {
        return null;
      }
      lines = text.split('\n');
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        line = line.trim();
        if (line.indexOf('class ') !== -1) {
          editor.setTextInBufferRange([[lastUse + 1, 0], [lastUse + 1, 0]], "use " + className + ";\n");
          return 'added';
        }
        if (line.indexOf('namespace ') === 0) {
          lastUse = index;
        }
        if (line.indexOf('use') === 0) {
          useRegex = /(?:use)(?:[^\w\\])([\w\\]+)(?![\w\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/g;
          matches = useRegex.exec(line);
          if ((matches != null) && (matches[1] != null)) {
            if (matches[1] === className) {
              return 'exists';
            } else {
              lastUse = index;
            }
          }
        }
        index += 1;
      }
      return null;
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
            if (funcName.length > 0) {
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
     * Retrieves contextual information about the property at the specified location in the editor.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     * @param {Object}     calledClass    Information about the called class (optional).
     */
    getMethodContext: function(editor, term, bufferPosition, calledClass) {
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
        atom.notifications.addError('Failed to get methods for ' + calledClass, {
          'detail': methods.error.message
        });
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
     * Retrieves contextual information about the property at the specified location in the editor.
      *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     name           The name of the property to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     * @param {Object}     calledClass    Information about the called class (optional).
     */
    getPropertyContext: function(editor, name, bufferPosition, calledClass) {
      var methodsAndProperties, val, value, _i, _len;
      if (!calledClass) {
        calledClass = this.getCalledClass(editor, name, bufferPosition);
      }
      if (!calledClass) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      methodsAndProperties = proxy.methods(calledClass);
      if (methodsAndProperties.names == null) {
        return;
      }
      if (methodsAndProperties.names.indexOf(name) === -1) {
        return;
      }
      value = methodsAndProperties.values[name];
      if (value instanceof Array) {
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          val = value[_i];
          if (!val.isMethod) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOENBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDhCQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLENBQ2xCLFFBRGtCLEVBRWxCLGlCQUZrQixFQUdsQixRQUhrQixDQUhwQixDQUFBOztBQUFBLEVBU0Esb0JBQUEsR0FBdUIsWUFUdkIsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBR0k7QUFBQSxJQUFBLEtBQUEsRUFBTyxFQUFQO0FBRUE7QUFBQTs7Ozs7Ozs7Ozs7T0FGQTtBQUFBLElBY0EsY0FBQSxFQUFnQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBO0FBQ1osVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFBeUIsY0FBekIsQ0FBWCxDQUFBO0FBRUEsTUFBQSx3QkFBRyxRQUFRLENBQUUsZ0JBQVYsS0FBb0IsQ0FBcEIsSUFBeUIsQ0FBQSxJQUE1QjtBQUNJLGNBQUEsQ0FESjtPQUZBO0FBS0EsYUFBTyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsY0FBdkIsRUFBdUMsUUFBdkMsQ0FBUCxDQU5ZO0lBQUEsQ0FkaEI7QUFzQkE7QUFBQTs7OztPQXRCQTtBQUFBLElBMkJBLHlCQUFBLEVBQTJCLFNBQUMsTUFBRCxFQUFTLGNBQVQsR0FBQTtBQUV2QixVQUFBLGlEQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBQXNCLGNBQXRCLENBQWYsQ0FBQTtB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

//# sourceURL=/home/epse/.atom/packages/atom-autocomplete-php/lib/services/php-file-parser.coffee
