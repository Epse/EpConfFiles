"use babel";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PythonIndent = (function () {
    function PythonIndent() {
        _classCallCheck(this, PythonIndent);
    }

    _createClass(PythonIndent, [{
        key: "properlyIndent",
        value: function properlyIndent() {
            this.editor = atom.workspace.getActiveTextEditor();

            // Make sure this is a Python file
            if (this.editor.getGrammar().scopeName.substring(0, 13) !== "source.python") {
                return;
            }

            // Get base variables
            var row = this.editor.getCursorBufferPosition().row;
            var col = this.editor.getCursorBufferPosition().column;

            // Parse the entire file up to the current point, keeping track of brackets
            var lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split("\n");
            // At this point, the newline character has just been added,
            // so remove the last element of lines, which will be the empty line
            lines = lines.splice(0, lines.length - 1);

            var parseOutput = this.parseLines(lines);
            // openBracketStack: A stack of [row, col] pairs describing where open brackets are
            // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
            //  here the last bracket to be closed was opened and closed.
            // shouldHang: A stack containing the row number where each bracket was closed.
            // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
            var openBracketStack = parseOutput.openBracketStack;
            var lastClosedRow = parseOutput.lastClosedRow;
            var shouldHang = parseOutput.shouldHang;
            var lastColonRow = parseOutput.lastColonRow;

            if (shouldHang) {
                this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
                return;
            }

            if (!(openBracketStack.length || lastClosedRow.length && openBracketStack)) {
                return;
            }

            if (!openBracketStack.length) {
                // Can assume lastClosedRow is not empty
                if (lastClosedRow[1] === row - 1) {
                    // We just closed a bracket on the row, get indentation from the
                    // row where it was opened
                    var indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);

                    if (lastColonRow === row - 1) {
                        // We just finished def/for/if/elif/else/try/except etc. block,
                        // need to increase indent level by 1.
                        indentLevel += 1;
                    }
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                }
                return;
            }

            // Get tab length for context
            var tabLength = this.editor.getTabLength();

            var lastOpenBracketLocations = openBracketStack.pop();

            // Get some booleans to help work through the cases

            // haveClosedBracket is true if we have ever closed a bracket
            var haveClosedBracket = lastClosedRow.length;
            // justOpenedBracket is true if we opened a bracket on the row we just finished
            var justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
            // justClosedBracket is true if we closed a bracket on the row we just finished
            var justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
            // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
            // it is true if the most recently closed bracket pair was opened on
            // a line AFTER the line where the current open bracket
            var closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
            var indentColumn = undefined;

            if (!justOpenedBracket && !justClosedBracket) {
                // The bracket was opened before the previous line,
                // and we did not close a bracket on the previous line.
                // Thus, nothing has happened that could have changed the
                // indentation level since the previous line, so
                // we should use whatever indent we are given.
                return;
            } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
                // A bracket that was opened after the most recent open
                // bracket was closed on the line we just finished typing.
                // We should use whatever indent was used on the row
                // where we opened the bracket we just closed. This needs
                // to be handled as a separate case from the last case below
                // in case the current bracket is using a hanging indent.
                // This handles cases such as
                // x = [0, 1, 2,
                //      [3, 4, 5,
                //       6, 7, 8],
                //      9, 10, 11]
                // which would be correctly handled by the case below, but it also correctly handles
                // x = [
                //     0, 1, 2, [3, 4, 5,
                //               6, 7, 8],
                //     9, 10, 11
                // ]
                // which the last case below would incorrectly indent an extra space
                // before the "9", because it would try to match it up with the
                // open bracket instead of using the hanging indent.
                var previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
                indentColumn = previousIndent * tabLength;
            } else {
                // lastOpenBracketLocations[1] is the column where the bracket was,
                // so need to bump up the indentation by one
                indentColumn = lastOpenBracketLocations[1] + 1;
            }

            // Calculate soft-tabs from spaces (can have remainder)
            var tabs = indentColumn / tabLength;
            var rem = (tabs - Math.floor(tabs)) * tabLength;

            // If there's a remainder, `@editor.buildIndentString` requires the tab to
            // be set past the desired indentation level, thus the ceiling.
            tabs = rem > 0 ? Math.ceil(tabs) : tabs;

            // Offset is the number of spaces to subtract from the soft-tabs if they
            // are past the desired indentation (not divisible by tab length).
            var offset = rem > 0 ? tabLength - rem : 0;

            // I'm glad Atom has an optional `column` param to subtract spaces from
            // soft-tabs, though I don't see it used anywhere in the core.
            // It looks like for hard tabs, the "tabs" input can be fractional and
            // the "column" input is ignored...?
            var indent = this.editor.buildIndentString(tabs, offset);

            // The range of text to replace with our indent
            // will need to change this for hard tabs, especially tricky for when
            // hard tabs have mixture of tabs + spaces, which they can judging from
            // the editor.buildIndentString function
            var startRange = [row, 0];
            var stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
            this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
        }
    }, {
        key: "parseLines",
        value: function parseLines(lines) {
            // openBracketStack is an array of [row, col] indicating the location
            // of the opening bracket (square, curly, or parentheses)
            var openBracketStack = [];
            // lastClosedRow is either empty or [rowOpen, rowClose] describing the
            // rows where the latest closed bracket was opened and closed.
            var lastClosedRow = [];
            // If we are in a string, this tells us what character introduced the string
            // i.e., did this string start with ' or with "?
            var stringDelimiter = [];
            // This is the row of the last function definition
            var lastColonRow = NaN;

            // true if we are in a triple quoted string
            var inTripleQuotedString = false;

            // If we have seen two of the same string delimiters in a row,
            // then we have to check the next character to see if it matches
            // in order to correctly parse triple quoted strings.
            var checkNextCharForString = false;

            // keep track of the number of consecutive string delimiter's we've seen
            // used to tell if we are in a triple quoted string
            var numConsecutiveStringDelimiters = 0;

            // true if we should have a hanging indent, false otherwise
            var shouldHang = false;

            // NOTE: this parsing will only be correct if the python code is well-formed
            // statements like "[0, (1, 2])" might break the parsing

            // loop over each line
            for (var row of Array(lines.length).fill().map(function (_, i) {
                return i;
            })) {
                var line = lines[row];

                // boolean, whether or not the current character is being escaped
                // applicable when we are currently in a string
                var isEscaped = false;

                // This is the last defined def/for/if/elif/else/try/except row
                var lastlastColonRow = lastColonRow;

                for (var col of Array(line.length).fill().map(function (_, i) {
                    return i;
                })) {
                    var c = line[col];

                    if (c === stringDelimiter && !isEscaped) {
                        numConsecutiveStringDelimiters += 1;
                    } else if (checkNextCharForString) {
                        numConsecutiveStringDelimiters = 0;
                        stringDelimiter = [];
                    } else {
                        numConsecutiveStringDelimiters = 0;
                    }

                    checkNextCharForString = false;

                    // If stringDelimiter is set, then we are in a string
                    // Note that this works correctly even for triple quoted strings
                    if (stringDelimiter.length) {
                        if (isEscaped) {
                            // If current character is escaped, then we do not care what it was,
                            // but since it is impossible for the next character to be escaped as well,
                            // go ahead and set that to false
                            isEscaped = false;
                        } else {
                            if (c === stringDelimiter) {
                                // We are seeing the same quote that started the string, i.e. ' or "
                                if (inTripleQuotedString) {
                                    if (numConsecutiveStringDelimiters === 3) {
                                        // Breaking out of the triple quoted string...
                                        numConsecutiveStringDelimiters = 0;
                                        stringDelimiter = [];
                                        inTripleQuotedString = false;
                                    }
                                } else if (numConsecutiveStringDelimiters === 3) {
                                    // reset the count, correctly handles cases like ''''''
                                    numConsecutiveStringDelimiters = 0;
                                    inTripleQuotedString = true;
                                } else if (numConsecutiveStringDelimiters === 2) {
                                    // We are not currently in a triple quoted string, and we've
                                    // seen two of the same string delimiter in a row. This could
                                    // either be an empty string, i.e. '' or "", or it could be
                                    // the start of a triple quoted string. We will check the next
                                    // character, and if it matches then we know we're in a triple
                                    // quoted string, and if it does not match we know we're not
                                    // in a string any more (i.e. it was the empty string).
                                    checkNextCharForString = true;
                                } else if (numConsecutiveStringDelimiters === 1) {
                                    // We are not in a string that is not triple quoted, and we've
                                    // just seen an un-escaped instance of that string delimiter.
                                    // In other words, we've left the string.
                                    // It is also worth noting that it is impossible for
                                    // numConsecutiveStringDelimiters to be 0 at this point, so
                                    // this set of if/else if statements covers all cases.
                                    stringDelimiter = [];
                                }
                            } else if (c === "\\") {
                                // We are seeing an unescaped backslash, the next character is escaped.
                                // Note that this is not exactly true in raw strings, HOWEVER, in raw
                                // strings you can still escape the quote mark by using a backslash.
                                // Since that's all we really care about as far as escaped characters
                                // go, we can assume we are now escaping the next character.
                                isEscaped = true;
                            }
                        }
                    } else {
                        if ("[({".includes(c)) {
                            openBracketStack.push([row, col]);
                            // If the only characters after this opening bracket are whitespace,
                            // then we should do a hanging indent. If there are other non-whitespace
                            // characters after this, then they will set the shouldHang boolean to false
                            shouldHang = true;
                        } else if (" \t\r\n".includes(c)) {
                            // just in case there's a new line
                            // If it's whitespace, we don't care at all
                            // this check is necessary so we don't set shouldHang to false even if
                            // someone e.g. just entered a space between the opening bracket and the
                            // newline.
                            continue;
                        } else if (c === "#") {
                            // This check goes as well to make sure we don't set shouldHang
                            // to false in similar circumstances as described in the whitespace section.
                            break;
                        } else {
                            // We've already skipped if the character was white-space, an opening
                            // bracket, or a new line, so that means the current character is not
                            // whitespace and not an opening bracket, so shouldHang needs to get set to
                            // false.
                            shouldHang = false;

                            // Similar to above, we've already skipped all irrelevant characters,
                            // so if we saw a colon earlier in this line, then we would have
                            // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                            // block when it was actually a dictionary being defined, reset the
                            // lastColonRow variable to whatever it was when we started parsing this
                            // line.
                            lastColonRow = lastlastColonRow;

                            if (c === ":") {
                                lastColonRow = row;
                            } else if ("})]".includes(c) && openBracketStack.length) {
                                // The .pop() will take the element off of the openBracketStack as it
                                // adds it to the array for lastClosedRow.
                                lastClosedRow = [openBracketStack.pop()[0], row];
                            } else if ("'\"".includes(c)) {
                                // Starting a string, keep track of what quote was used to start it.
                                stringDelimiter = c;
                                numConsecutiveStringDelimiters += 1;
                            }
                        }
                    }
                }
            }
            return { openBracketStack: openBracketStack, lastClosedRow: lastClosedRow, shouldHang: shouldHang, lastColonRow: lastColonRow };
        }
    }, {
        key: "indentHanging",
        value: function indentHanging(row) {
            // Indent at the current block level plus the setting amount (1 or 2)
            var indent = this.editor.indentationForBufferRow(row) + atom.config.get("python-indent.hangingIndentTabs");

            // Set the indent
            this.editor.setIndentationForBufferRow(row, indent);
        }
    }]);

    return PythonIndent;
})();

exports["default"] = PythonIndent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0lBQ1MsWUFBWTthQUFaLFlBQVk7OEJBQVosWUFBWTs7O2lCQUFaLFlBQVk7O2VBRWYsMEJBQUc7QUFDYixnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7OztBQUduRCxnQkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLGVBQWUsRUFBRTtBQUN6RSx1QkFBTzthQUNWOzs7QUFHRCxnQkFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN0RCxnQkFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE1BQU0sQ0FBQzs7O0FBR3pELGdCQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBRy9FLGlCQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFMUMsZ0JBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7OztnQkFNbkMsZ0JBQWdCLEdBQThDLFdBQVcsQ0FBekUsZ0JBQWdCO2dCQUFFLGFBQWEsR0FBK0IsV0FBVyxDQUF2RCxh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LENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEdBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLEFBQUMsQ0FBQzs7O0FBR3pELGdCQUFJLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN2RDs7O1dBM1NnQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvcHl0aG9uLWluZGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQeXRob25JbmRlbnQge1xuXG4gICAgcHJvcGVybHlJbmRlbnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIGEgUHl0aG9uIGZpbGVcbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuc3Vic3RyaW5nKDAsIDEzKSAhPT0gXCJzb3VyY2UucHl0aG9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBiYXNlIHZhcmlhYmxlc1xuICAgICAgICBjb25zdCByb3cgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdztcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5jb2x1bW47XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVudGlyZSBmaWxlIHVwIHRvIHRoZSBjdXJyZW50IHBvaW50LCBrZWVwaW5nIHRyYWNrIG9mIGJyYWNrZXRzXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwgMF0sIFtyb3csIGNvbF1dKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIG5ld2xpbmUgY2hhcmFjdGVyIGhhcyBqdXN0IGJlZW4gYWRkZWQsXG4gICAgICAgIC8vIHNvIHJlbW92ZSB0aGUgbGFzdCBlbGVtZW50IG9mIGxpbmVzLCB3aGljaCB3aWxsIGJlIHRoZSBlbXB0eSBsaW5lXG4gICAgICAgIGxpbmVzID0gbGluZXMuc3BsaWNlKDAsIGxpbmVzLmxlbmd0aCAtIDEpO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlT3V0cHV0ID0gdGhpcy5wYXJzZUxpbmVzKGxpbmVzKTtcbiAgICAgICAgLy8gb3BlbkJyYWNrZXRTdGFjazogQSBzdGFjayBvZiBbcm93LCBjb2xdIHBhaXJzIGRlc2NyaWJpbmcgd2hlcmUgb3BlbiBicmFja2V0cyBhcmVcbiAgICAgICAgLy8gbGFzdENsb3NlZFJvdzogRWl0aGVyIGVtcHR5LCBvciBhbiBhcnJheSBbcm93T3Blbiwgcm93Q2xvc2VdIGRlc2NyaWJpbmcgdGhlIHJvd3NcbiAgICAgICAgLy8gIGhlcmUgdGhlIGxhc3QgYnJhY2tldCB0byBiZSBjbG9zZWQgd2FzIG9wZW5lZCBhbmQgY2xvc2VkLlxuICAgICAgICAvLyBzaG91bGRIYW5nOiBBIHN0YWNrIGNvbnRhaW5pbmcgdGhlIHJvdyBudW1iZXIgd2hlcmUgZWFjaCBicmFja2V0IHdhcyBjbG9zZWQuXG4gICAgICAgIC8vIGxhc3RDb2xvblJvdzogVGhlIGxhc3Qgcm93IGEgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCBldGMuIGJsb2NrIHN0YXJ0ZWRcbiAgICAgICAgY29uc3QgeyBvcGVuQnJhY2tldFN0YWNrLCBsYXN0Q2xvc2VkUm93LCBzaG91bGRIYW5nLCBsYXN0Q29sb25Sb3cgfSA9IHBhcnNlT3V0cHV0O1xuXG4gICAgICAgIGlmIChzaG91bGRIYW5nKSB7XG4gICAgICAgICAgICB0aGlzLmluZGVudEhhbmdpbmcocm93LCB0aGlzLmVkaXRvci5idWZmZXIubGluZUZvclJvdyhyb3cgLSAxKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIShvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCB8fCAobGFzdENsb3NlZFJvdy5sZW5ndGggJiYgb3BlbkJyYWNrZXRTdGFjaykpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wZW5CcmFja2V0U3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDYW4gYXNzdW1lIGxhc3RDbG9zZWRSb3cgaXMgbm90IGVtcHR5XG4gICAgICAgICAgICBpZiAobGFzdENsb3NlZFJvd1sxXSA9PT0gcm93IC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgY2xvc2VkIGEgYnJhY2tldCBvbiB0aGUgcm93LCBnZXQgaW5kZW50YXRpb24gZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyByb3cgd2hlcmUgaXQgd2FzIG9wZW5lZFxuICAgICAgICAgICAgICAgIGxldCBpbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGxhc3RDbG9zZWRSb3dbMF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RDb2xvblJvdyA9PT0gcm93IC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBqdXN0IGZpbmlzaGVkIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgZXRjLiBibG9jayxcbiAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byBpbmNyZWFzZSBpbmRlbnQgbGV2ZWwgYnkgMS5cbiAgICAgICAgICAgICAgICAgICAgaW5kZW50TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnRMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGFiIGxlbmd0aCBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCB0YWJMZW5ndGggPSB0aGlzLmVkaXRvci5nZXRUYWJMZW5ndGgoKTtcblxuICAgICAgICBjb25zdCBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnMgPSBvcGVuQnJhY2tldFN0YWNrLnBvcCgpO1xuXG4gICAgICAgIC8vIEdldCBzb21lIGJvb2xlYW5zIHRvIGhlbHAgd29yayB0aHJvdWdoIHRoZSBjYXNlc1xuXG4gICAgICAgIC8vIGhhdmVDbG9zZWRCcmFja2V0IGlzIHRydWUgaWYgd2UgaGF2ZSBldmVyIGNsb3NlZCBhIGJyYWNrZXRcbiAgICAgICAgY29uc3QgaGF2ZUNsb3NlZEJyYWNrZXQgPSBsYXN0Q2xvc2VkUm93Lmxlbmd0aDtcbiAgICAgICAgLy8ganVzdE9wZW5lZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBvcGVuZWQgYSBicmFja2V0IG9uIHRoZSByb3cgd2UganVzdCBmaW5pc2hlZFxuICAgICAgICBjb25zdCBqdXN0T3BlbmVkQnJhY2tldCA9IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1swXSA9PT0gcm93IC0gMTtcbiAgICAgICAgLy8ganVzdENsb3NlZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBjbG9zZWQgYSBicmFja2V0IG9uIHRoZSByb3cgd2UganVzdCBmaW5pc2hlZFxuICAgICAgICBjb25zdCBqdXN0Q2xvc2VkQnJhY2tldCA9IGhhdmVDbG9zZWRCcmFja2V0ICYmIGxhc3RDbG9zZWRSb3dbMV0gPT09IHJvdyAtIDE7XG4gICAgICAgIC8vIGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4gaXMgYW4gKioqZXh0cmVtZWx5KioqIGxvbmcgbmFtZSwgYW5kXG4gICAgICAgIC8vIGl0IGlzIHRydWUgaWYgdGhlIG1vc3QgcmVjZW50bHkgY2xvc2VkIGJyYWNrZXQgcGFpciB3YXMgb3BlbmVkIG9uXG4gICAgICAgIC8vIGEgbGluZSBBRlRFUiB0aGUgbGluZSB3aGVyZSB0aGUgY3VycmVudCBvcGVuIGJyYWNrZXRcbiAgICAgICAgY29uc3QgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3BlbiA9IGhhdmVDbG9zZWRCcmFja2V0ICYmXG4gICAgICAgICAgICBsYXN0Q2xvc2VkUm93WzBdID4gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzBdO1xuICAgICAgICBsZXQgaW5kZW50Q29sdW1uO1xuXG4gICAgICAgIGlmICghanVzdE9wZW5lZEJyYWNrZXQgJiYgIWp1c3RDbG9zZWRCcmFja2V0KSB7XG4gICAgICAgICAgICAvLyBUaGUgYnJhY2tldCB3YXMgb3BlbmVkIGJlZm9yZSB0aGUgcHJldmlvdXMgbGluZSxcbiAgICAgICAgICAgIC8vIGFuZCB3ZSBkaWQgbm90IGNsb3NlIGEgYnJhY2tldCBvbiB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAgICAgICAgIC8vIFRodXMsIG5vdGhpbmcgaGFzIGhhcHBlbmVkIHRoYXQgY291bGQgaGF2ZSBjaGFuZ2VkIHRoZVxuICAgICAgICAgICAgLy8gaW5kZW50YXRpb24gbGV2ZWwgc2luY2UgdGhlIHByZXZpb3VzIGxpbmUsIHNvXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGQgdXNlIHdoYXRldmVyIGluZGVudCB3ZSBhcmUgZ2l2ZW4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoanVzdENsb3NlZEJyYWNrZXQgJiYgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3Blbikge1xuICAgICAgICAgICAgLy8gQSBicmFja2V0IHRoYXQgd2FzIG9wZW5lZCBhZnRlciB0aGUgbW9zdCByZWNlbnQgb3BlblxuICAgICAgICAgICAgLy8gYnJhY2tldCB3YXMgY2xvc2VkIG9uIHRoZSBsaW5lIHdlIGp1c3QgZmluaXNoZWQgdHlwaW5nLlxuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIHVzZSB3aGF0ZXZlciBpbmRlbnQgd2FzIHVzZWQgb24gdGhlIHJvd1xuICAgICAgICAgICAgLy8gd2hlcmUgd2Ugb3BlbmVkIHRoZSBicmFja2V0IHdlIGp1c3QgY2xvc2VkLiBUaGlzIG5lZWRzXG4gICAgICAgICAgICAvLyB0byBiZSBoYW5kbGVkIGFzIGEgc2VwYXJhdGUgY2FzZSBmcm9tIHRoZSBsYXN0IGNhc2UgYmVsb3dcbiAgICAgICAgICAgIC8vIGluIGNhc2UgdGhlIGN1cnJlbnQgYnJhY2tldCBpcyB1c2luZyBhIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHN1Y2ggYXNcbiAgICAgICAgICAgIC8vIHggPSBbMCwgMSwgMixcbiAgICAgICAgICAgIC8vICAgICAgWzMsIDQsIDUsXG4gICAgICAgICAgICAvLyAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICAgOSwgMTAsIDExXVxuICAgICAgICAgICAgLy8gd2hpY2ggd291bGQgYmUgY29ycmVjdGx5IGhhbmRsZWQgYnkgdGhlIGNhc2UgYmVsb3csIGJ1dCBpdCBhbHNvIGNvcnJlY3RseSBoYW5kbGVzXG4gICAgICAgICAgICAvLyB4ID0gW1xuICAgICAgICAgICAgLy8gICAgIDAsIDEsIDIsIFszLCA0LCA1LFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICA5LCAxMCwgMTFcbiAgICAgICAgICAgIC8vIF1cbiAgICAgICAgICAgIC8vIHdoaWNoIHRoZSBsYXN0IGNhc2UgYmVsb3cgd291bGQgaW5jb3JyZWN0bHkgaW5kZW50IGFuIGV4dHJhIHNwYWNlXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFwiOVwiLCBiZWNhdXNlIGl0IHdvdWxkIHRyeSB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZVxuICAgICAgICAgICAgLy8gb3BlbiBicmFja2V0IGluc3RlYWQgb2YgdXNpbmcgdGhlIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNJbmRlbnQgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhsYXN0Q2xvc2VkUm93WzBdKTtcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IHByZXZpb3VzSW5kZW50ICogdGFiTGVuZ3RoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzFdIGlzIHRoZSBjb2x1bW4gd2hlcmUgdGhlIGJyYWNrZXQgd2FzLFxuICAgICAgICAgICAgLy8gc28gbmVlZCB0byBidW1wIHVwIHRoZSBpbmRlbnRhdGlvbiBieSBvbmVcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1sxXSArIDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgc29mdC10YWJzIGZyb20gc3BhY2VzIChjYW4gaGF2ZSByZW1haW5kZXIpXG4gICAgICAgIGxldCB0YWJzID0gaW5kZW50Q29sdW1uIC8gdGFiTGVuZ3RoO1xuICAgICAgICBjb25zdCByZW0gPSAodGFicyAtIE1hdGguZmxvb3IodGFicykpICogdGFiTGVuZ3RoO1xuXG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYSByZW1haW5kZXIsIGBAZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nYCByZXF1aXJlcyB0aGUgdGFiIHRvXG4gICAgICAgIC8vIGJlIHNldCBwYXN0IHRoZSBkZXNpcmVkIGluZGVudGF0aW9uIGxldmVsLCB0aHVzIHRoZSBjZWlsaW5nLlxuICAgICAgICB0YWJzID0gcmVtID4gMCA/IE1hdGguY2VpbCh0YWJzKSA6IHRhYnM7XG5cbiAgICAgICAgLy8gT2Zmc2V0IGlzIHRoZSBudW1iZXIgb2Ygc3BhY2VzIHRvIHN1YnRyYWN0IGZyb20gdGhlIHNvZnQtdGFicyBpZiB0aGV5XG4gICAgICAgIC8vIGFyZSBwYXN0IHRoZSBkZXNpcmVkIGluZGVudGF0aW9uIChub3QgZGl2aXNpYmxlIGJ5IHRhYiBsZW5ndGgpLlxuICAgICAgICBjb25zdCBvZmZzZXQgPSByZW0gPiAwID8gdGFiTGVuZ3RoIC0gcmVtIDogMDtcblxuICAgICAgICAvLyBJJ20gZ2xhZCBBdG9tIGhhcyBhbiBvcHRpb25hbCBgY29sdW1uYCBwYXJhbSB0byBzdWJ0cmFjdCBzcGFjZXMgZnJvbVxuICAgICAgICAvLyBzb2Z0LXRhYnMsIHRob3VnaCBJIGRvbid0IHNlZSBpdCB1c2VkIGFueXdoZXJlIGluIHRoZSBjb3JlLlxuICAgICAgICAvLyBJdCBsb29rcyBsaWtlIGZvciBoYXJkIHRhYnMsIHRoZSBcInRhYnNcIiBpbnB1dCBjYW4gYmUgZnJhY3Rpb25hbCBhbmRcbiAgICAgICAgLy8gdGhlIFwiY29sdW1uXCIgaW5wdXQgaXMgaWdub3JlZC4uLj9cbiAgICAgICAgY29uc3QgaW5kZW50ID0gdGhpcy5lZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcodGFicywgb2Zmc2V0KTtcblxuICAgICAgICAvLyBUaGUgcmFuZ2Ugb2YgdGV4dCB0byByZXBsYWNlIHdpdGggb3VyIGluZGVudFxuICAgICAgICAvLyB3aWxsIG5lZWQgdG8gY2hhbmdlIHRoaXMgZm9yIGhhcmQgdGFicywgZXNwZWNpYWxseSB0cmlja3kgZm9yIHdoZW5cbiAgICAgICAgLy8gaGFyZCB0YWJzIGhhdmUgbWl4dHVyZSBvZiB0YWJzICsgc3BhY2VzLCB3aGljaCB0aGV5IGNhbiBqdWRnaW5nIGZyb21cbiAgICAgICAgLy8gdGhlIGVkaXRvci5idWlsZEluZGVudFN0cmluZyBmdW5jdGlvblxuICAgICAgICBjb25zdCBzdGFydFJhbmdlID0gW3JvdywgMF07XG4gICAgICAgIGNvbnN0IHN0b3BSYW5nZSA9IFtyb3csIHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgKiB0YWJMZW5ndGhdO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0SW5SYW5nZShbc3RhcnRSYW5nZSwgc3RvcFJhbmdlXSwgaW5kZW50KTtcbiAgICB9XG5cbiAgICBwYXJzZUxpbmVzKGxpbmVzKSB7XG4gICAgICAgIC8vIG9wZW5CcmFja2V0U3RhY2sgaXMgYW4gYXJyYXkgb2YgW3JvdywgY29sXSBpbmRpY2F0aW5nIHRoZSBsb2NhdGlvblxuICAgICAgICAvLyBvZiB0aGUgb3BlbmluZyBicmFja2V0IChzcXVhcmUsIGN1cmx5LCBvciBwYXJlbnRoZXNlcylcbiAgICAgICAgY29uc3Qgb3BlbkJyYWNrZXRTdGFjayA9IFtdO1xuICAgICAgICAvLyBsYXN0Q2xvc2VkUm93IGlzIGVpdGhlciBlbXB0eSBvciBbcm93T3Blbiwgcm93Q2xvc2VdIGRlc2NyaWJpbmcgdGhlXG4gICAgICAgIC8vIHJvd3Mgd2hlcmUgdGhlIGxhdGVzdCBjbG9zZWQgYnJhY2tldCB3YXMgb3BlbmVkIGFuZCBjbG9zZWQuXG4gICAgICAgIGxldCBsYXN0Q2xvc2VkUm93ID0gW107XG4gICAgICAgIC8vIElmIHdlIGFyZSBpbiBhIHN0cmluZywgdGhpcyB0ZWxscyB1cyB3aGF0IGNoYXJhY3RlciBpbnRyb2R1Y2VkIHRoZSBzdHJpbmdcbiAgICAgICAgLy8gaS5lLiwgZGlkIHRoaXMgc3RyaW5nIHN0YXJ0IHdpdGggJyBvciB3aXRoIFwiP1xuICAgICAgICBsZXQgc3RyaW5nRGVsaW1pdGVyID0gW107XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIHJvdyBvZiB0aGUgbGFzdCBmdW5jdGlvbiBkZWZpbml0aW9uXG4gICAgICAgIGxldCBsYXN0Q29sb25Sb3cgPSBOYU47XG5cbiAgICAgICAgLy8gdHJ1ZSBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xuICAgICAgICBsZXQgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIHNlZW4gdHdvIG9mIHRoZSBzYW1lIHN0cmluZyBkZWxpbWl0ZXJzIGluIGEgcm93LFxuICAgICAgICAvLyB0aGVuIHdlIGhhdmUgdG8gY2hlY2sgdGhlIG5leHQgY2hhcmFjdGVyIHRvIHNlZSBpZiBpdCBtYXRjaGVzXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGNvcnJlY3RseSBwYXJzZSB0cmlwbGUgcXVvdGVkIHN0cmluZ3MuXG4gICAgICAgIGxldCBjaGVja05leHRDaGFyRm9yU3RyaW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIHN0cmluZyBkZWxpbWl0ZXIncyB3ZSd2ZSBzZWVuXG4gICAgICAgIC8vIHVzZWQgdG8gdGVsbCBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xuICAgICAgICBsZXQgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcblxuICAgICAgICAvLyB0cnVlIGlmIHdlIHNob3VsZCBoYXZlIGEgaGFuZ2luZyBpbmRlbnQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAgICBsZXQgc2hvdWxkSGFuZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIE5PVEU6IHRoaXMgcGFyc2luZyB3aWxsIG9ubHkgYmUgY29ycmVjdCBpZiB0aGUgcHl0aG9uIGNvZGUgaXMgd2VsbC1mb3JtZWRcbiAgICAgICAgLy8gc3RhdGVtZW50cyBsaWtlIFwiWzAsICgxLCAyXSlcIiBtaWdodCBicmVhayB0aGUgcGFyc2luZ1xuXG4gICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIGxpbmVcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgQXJyYXkobGluZXMubGVuZ3RoKS5maWxsKCkubWFwKChfLCBpKSA9PiBpKSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW3Jvd107XG5cbiAgICAgICAgICAgIC8vIGJvb2xlYW4sIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJyZW50IGNoYXJhY3RlciBpcyBiZWluZyBlc2NhcGVkXG4gICAgICAgICAgICAvLyBhcHBsaWNhYmxlIHdoZW4gd2UgYXJlIGN1cnJlbnRseSBpbiBhIHN0cmluZ1xuICAgICAgICAgICAgbGV0IGlzRXNjYXBlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IGRlZmluZWQgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCByb3dcbiAgICAgICAgICAgIGNvbnN0IGxhc3RsYXN0Q29sb25Sb3cgPSBsYXN0Q29sb25Sb3c7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sIG9mIEFycmF5KGxpbmUubGVuZ3RoKS5maWxsKCkubWFwKChfLCBpKSA9PiBpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBsaW5lW2NvbF07XG5cbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gc3RyaW5nRGVsaW1pdGVyICYmICFpc0VzY2FwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGVja05leHRDaGFyRm9yU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IFtdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgc3RyaW5nRGVsaW1pdGVyIGlzIHNldCwgdGhlbiB3ZSBhcmUgaW4gYSBzdHJpbmdcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyB3b3JrcyBjb3JyZWN0bHkgZXZlbiBmb3IgdHJpcGxlIHF1b3RlZCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZ0RlbGltaXRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXNjYXBlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudCBjaGFyYWN0ZXIgaXMgZXNjYXBlZCwgdGhlbiB3ZSBkbyBub3QgY2FyZSB3aGF0IGl0IHdhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBzaW5jZSBpdCBpcyBpbXBvc3NpYmxlIGZvciB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgZXNjYXBlZCBhcyB3ZWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCB0aGF0IHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VzY2FwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBzdHJpbmdEZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgc2VlaW5nIHRoZSBzYW1lIHF1b3RlIHRoYXQgc3RhcnRlZCB0aGUgc3RyaW5nLCBpLmUuICcgb3IgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5UcmlwbGVRdW90ZWRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnJlYWtpbmcgb3V0IG9mIHRoZSB0cmlwbGUgcXVvdGVkIHN0cmluZy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IHRoZSBjb3VudCwgY29ycmVjdGx5IGhhbmRsZXMgY2FzZXMgbGlrZSAnJycnJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBub3QgY3VycmVudGx5IGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcsIGFuZCB3ZSd2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWVuIHR3byBvZiB0aGUgc2FtZSBzdHJpbmcgZGVsaW1pdGVyIGluIGEgcm93LiBUaGlzIGNvdWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVpdGhlciBiZSBhbiBlbXB0eSBzdHJpbmcsIGkuZS4gJycgb3IgXCJcIiwgb3IgaXQgY291bGQgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0IG9mIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcuIFdlIHdpbGwgY2hlY2sgdGhlIG5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBhbmQgaWYgaXQgbWF0Y2hlcyB0aGVuIHdlIGtub3cgd2UncmUgaW4gYSB0cmlwbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVvdGVkIHN0cmluZywgYW5kIGlmIGl0IGRvZXMgbm90IG1hdGNoIHdlIGtub3cgd2UncmUgbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIGEgc3RyaW5nIGFueSBtb3JlIChpLmUuIGl0IHdhcyB0aGUgZW1wdHkgc3RyaW5nKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBpbiBhIHN0cmluZyB0aGF0IGlzIG5vdCB0cmlwbGUgcXVvdGVkLCBhbmQgd2UndmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBzZWVuIGFuIHVuLWVzY2FwZWQgaW5zdGFuY2Ugb2YgdGhhdCBzdHJpbmcgZGVsaW1pdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBvdGhlciB3b3Jkcywgd2UndmUgbGVmdCB0aGUgc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJdCBpcyBhbHNvIHdvcnRoIG5vdGluZyB0aGF0IGl0IGlzIGltcG9zc2libGUgZm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyB0byBiZSAwIGF0IHRoaXMgcG9pbnQsIHNvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgc2V0IG9mIGlmL2Vsc2UgaWYgc3RhdGVtZW50cyBjb3ZlcnMgYWxsIGNhc2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIHNlZWluZyBhbiB1bmVzY2FwZWQgYmFja3NsYXNoLCB0aGUgbmV4dCBjaGFyYWN0ZXIgaXMgZXNjYXBlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBub3QgZXhhY3RseSB0cnVlIGluIHJhdyBzdHJpbmdzLCBIT1dFVkVSLCBpbiByYXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmdzIHlvdSBjYW4gc3RpbGwgZXNjYXBlIHRoZSBxdW90ZSBtYXJrIGJ5IHVzaW5nIGEgYmFja3NsYXNoLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoYXQncyBhbGwgd2UgcmVhbGx5IGNhcmUgYWJvdXQgYXMgZmFyIGFzIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdvLCB3ZSBjYW4gYXNzdW1lIHdlIGFyZSBub3cgZXNjYXBpbmcgdGhlIG5leHQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXCJbKHtcIi5pbmNsdWRlcyhjKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkJyYWNrZXRTdGFjay5wdXNoKFtyb3csIGNvbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG9ubHkgY2hhcmFjdGVycyBhZnRlciB0aGlzIG9wZW5pbmcgYnJhY2tldCBhcmUgd2hpdGVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gd2Ugc2hvdWxkIGRvIGEgaGFuZ2luZyBpbmRlbnQuIElmIHRoZXJlIGFyZSBvdGhlciBub24td2hpdGVzcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVycyBhZnRlciB0aGlzLCB0aGVuIHRoZXkgd2lsbCBzZXQgdGhlIHNob3VsZEhhbmcgYm9vbGVhbiB0byBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkSGFuZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCIgXFx0XFxyXFxuXCIuaW5jbHVkZXMoYykpIHsgLy8ganVzdCBpbiBjYXNlIHRoZXJlJ3MgYSBuZXcgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQncyB3aGl0ZXNwYWNlLCB3ZSBkb24ndCBjYXJlIGF0IGFsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBjaGVjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3Qgc2V0IHNob3VsZEhhbmcgdG8gZmFsc2UgZXZlbiBpZlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBlLmcuIGp1c3QgZW50ZXJlZCBhIHNwYWNlIGJldHdlZW4gdGhlIG9wZW5pbmcgYnJhY2tldCBhbmQgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBuZXdsaW5lLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2hlY2sgZ29lcyBhcyB3ZWxsIHRvIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZXQgc2hvdWxkSGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gZmFsc2UgaW4gc2ltaWxhciBjaXJjdW1zdGFuY2VzIGFzIGRlc2NyaWJlZCBpbiB0aGUgd2hpdGVzcGFjZSBzZWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBhbHJlYWR5IHNraXBwZWQgaWYgdGhlIGNoYXJhY3RlciB3YXMgd2hpdGUtc3BhY2UsIGFuIG9wZW5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyYWNrZXQsIG9yIGEgbmV3IGxpbmUsIHNvIHRoYXQgbWVhbnMgdGhlIGN1cnJlbnQgY2hhcmFjdGVyIGlzIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGVzcGFjZSBhbmQgbm90IGFuIG9wZW5pbmcgYnJhY2tldCwgc28gc2hvdWxkSGFuZyBuZWVkcyB0byBnZXQgc2V0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEhhbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltaWxhciB0byBhYm92ZSwgd2UndmUgYWxyZWFkeSBza2lwcGVkIGFsbCBpcnJlbGV2YW50IGNoYXJhY3RlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyBpZiB3ZSBzYXcgYSBjb2xvbiBlYXJsaWVyIGluIHRoaXMgbGluZSwgdGhlbiB3ZSB3b3VsZCBoYXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbmNvcnJlY3RseSB0aG91Z2h0IGl0IHdhcyB0aGUgZW5kIG9mIGEgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2sgd2hlbiBpdCB3YXMgYWN0dWFsbHkgYSBkaWN0aW9uYXJ5IGJlaW5nIGRlZmluZWQsIHJlc2V0IHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFzdENvbG9uUm93IHZhcmlhYmxlIHRvIHdoYXRldmVyIGl0IHdhcyB3aGVuIHdlIHN0YXJ0ZWQgcGFyc2luZyB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsaW5lLlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbG9uUm93ID0gbGFzdGxhc3RDb2xvblJvdztcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT09IFwiOlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbG9uUm93ID0gcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIn0pXVwiLmluY2x1ZGVzKGMpICYmIG9wZW5CcmFja2V0U3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIC5wb3AoKSB3aWxsIHRha2UgdGhlIGVsZW1lbnQgb2ZmIG9mIHRoZSBvcGVuQnJhY2tldFN0YWNrIGFzIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBpdCB0byB0aGUgYXJyYXkgZm9yIGxhc3RDbG9zZWRSb3cuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENsb3NlZFJvdyA9IFtvcGVuQnJhY2tldFN0YWNrLnBvcCgpWzBdLCByb3ddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIidcXFwiXCIuaW5jbHVkZXMoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydGluZyBhIHN0cmluZywga2VlcCB0cmFjayBvZiB3aGF0IHF1b3RlIHdhcyB1c2VkIHRvIHN0YXJ0IGl0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IGM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgb3BlbkJyYWNrZXRTdGFjaywgbGFzdENsb3NlZFJvdywgc2hvdWxkSGFuZywgbGFzdENvbG9uUm93IH07XG4gICAgfVxuXG4gICAgaW5kZW50SGFuZ2luZyhyb3cpIHtcbiAgICAgICAgLy8gSW5kZW50IGF0IHRoZSBjdXJyZW50IGJsb2NrIGxldmVsIHBsdXMgdGhlIHNldHRpbmcgYW1vdW50ICgxIG9yIDIpXG4gICAgICAgIGNvbnN0IGluZGVudCA9ICh0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpKSArXG4gICAgICAgICAgICAoYXRvbS5jb25maWcuZ2V0KFwicHl0aG9uLWluZGVudC5oYW5naW5nSW5kZW50VGFic1wiKSk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBpbmRlbnRcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnQpO1xuICAgIH1cbn1cbiJdfQ==
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/python-indent/lib/python-indent.js
