(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, mark, ref, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        addr = this.editor.getBuffer().lines.length - 1;
      } else if ((ref = str[0]) === "+" || ref === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      lastLine = this.editor.getBuffer().lines.length - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        ref1 = cl.match(addrPattern), match = ref1[0], addr1 = ref1[1], off1 = ref1[2], addr2 = ref1[3], off2 = ref1[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        ref2 = cl.match(/^(\w+)(.*)/), m = ref2[0], command = ref2[1], args = ref2[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref3, results;
          ref3 = Ex.singleton();
          results = [];
          for (name in ref3) {
            val = ref3[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref3 = this.selections;
          results = [];
          for (id in ref3) {
            selection = ref3[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2NvbW1hbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSOztFQUNkLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFFVDtJQUNTLGlCQUFDLE1BQUQsRUFBVSxPQUFWO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsVUFBRDtNQUNyQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUFBO01BQ2QsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxXQUFBLENBQVksSUFBWixFQUFlLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFVBQWIsQ0FBd0IsQ0FBQyxNQUF6QixHQUFrQyxDQUFqRDtJQUZOOztzQkFJYixTQUFBLEdBQVcsU0FBQyxHQUFELEVBQU0sTUFBTjtBQUNULFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFlBQVAsQ0FBQTtNQUNOLElBQUcsR0FBQSxLQUFPLEdBQVY7UUFDRSxJQUFBLEdBQU8sSUFEVDtPQUFBLE1BRUssSUFBRyxHQUFBLEtBQU8sR0FBVjtRQUVILElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLEtBQUssQ0FBQyxNQUExQixHQUFtQyxFQUZ2QztPQUFBLE1BR0EsV0FBRyxHQUFJLENBQUEsQ0FBQSxFQUFKLEtBQVcsR0FBWCxJQUFBLEdBQUEsS0FBZ0IsR0FBbkI7UUFDSCxJQUFBLEdBQU8sR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFELENBQWEsR0FBYixFQURWO09B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LENBQWEsT0FBYixDQUFBLEtBQXlCOzJCQURmOztBQUFBOzs7UUFHWixRQUFRLENBQUMsSUFBVCxDQUFBO1FBRUEsT0FBQSxHQUFVLFFBQVMsQ0FBQSxDQUFBO1FBRW5CLElBQUEsR0FBTyxFQUFFLENBQUMsU0FBSCxDQUFBLENBQWUsQ0FBQSxPQUFBLEVBVHhCOztNQVdBLElBQUcsWUFBSDtRQUNFLElBQUcsaUJBQUg7QUFDRTtBQUFBO2VBQUEsVUFBQTs7WUFDRSxXQUFBLEdBQWMsU0FBUyxDQUFDLGNBQVYsQ0FBQTtZQUNkLEtBQUEsR0FBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBbkIsRUFBd0IsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUF4Qzt5QkFDUixJQUFBLENBQUs7Y0FBRSxPQUFBLEtBQUY7Y0FBUyxNQUFBLElBQVQ7Y0FBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7Y0FBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7Y0FBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7YUFBTDtBQUhGO3lCQURGO1NBQUEsTUFBQTtpQkFNRSxJQUFBLENBQUs7WUFBRSxPQUFBLEtBQUY7WUFBUyxNQUFBLElBQVQ7WUFBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7WUFBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7WUFBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7V0FBTCxFQU5GO1NBREY7T0FBQSxNQUFBO0FBU0UsY0FBVSxJQUFBLFlBQUEsQ0FBYSx5QkFBQSxHQUEwQixLQUFLLENBQUMsVUFBN0MsRUFUWjs7SUE1SE87Ozs7OztFQXVJWCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxNakIiLCJzb3VyY2VzQ29udGVudCI6WyJFeFZpZXdNb2RlbCA9IHJlcXVpcmUgJy4vZXgtdmlldy1tb2RlbCdcbkV4ID0gcmVxdWlyZSAnLi9leCdcbkZpbmQgPSByZXF1aXJlICcuL2ZpbmQnXG5Db21tYW5kRXJyb3IgPSByZXF1aXJlICcuL2NvbW1hbmQtZXJyb3InXG5cbmNsYXNzIENvbW1hbmRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAZXhTdGF0ZSkgLT5cbiAgICBAc2VsZWN0aW9ucyA9IEBleFN0YXRlLmdldFNlbGVjdGlvbnMoKVxuICAgIEB2aWV3TW9kZWwgPSBuZXcgRXhWaWV3TW9kZWwoQCwgT2JqZWN0LmtleXMoQHNlbGVjdGlvbnMpLmxlbmd0aCA+IDApXG5cbiAgcGFyc2VBZGRyOiAoc3RyLCBjdXJzb3IpIC0+XG4gICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaWYgc3RyIGlzICcuJ1xuICAgICAgYWRkciA9IHJvd1xuICAgIGVsc2UgaWYgc3RyIGlzICckJ1xuICAgICAgIyBMaW5lcyBhcmUgMC1pbmRleGVkIGluIEF0b20sIGJ1dCAxLWluZGV4ZWQgaW4gdmltLlxuICAgICAgYWRkciA9IEBlZGl0b3IuZ2V0QnVmZmVyKCkubGluZXMubGVuZ3RoIC0gMVxuICAgIGVsc2UgaWYgc3RyWzBdIGluIFtcIitcIiwgXCItXCJdXG4gICAgICBhZGRyID0gcm93ICsgQHBhcnNlT2Zmc2V0KHN0cilcbiAgICBlbHNlIGlmIG5vdCBpc05hTihzdHIpXG4gICAgICBhZGRyID0gcGFyc2VJbnQoc3RyKSAtIDFcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIidcIiAjIFBhcnNlIE1hcmsuLi5cbiAgICAgIHVubGVzcyBAdmltU3RhdGU/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJDb3VsZG4ndCBnZXQgYWNjZXNzIHRvIHZpbS1tb2RlLlwiKVxuICAgICAgbWFyayA9IEB2aW1TdGF0ZS5tYXJrc1tzdHJbMV1dXG4gICAgICB1bmxlc3MgbWFyaz9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk1hcmsgI3tzdHJ9IG5vdCBzZXQuXCIpXG4gICAgICBhZGRyID0gbWFyay5nZXRFbmRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIGVsc2UgaWYgc3RyWzBdIGlzIFwiL1wiXG4gICAgICBzdHIgPSBzdHJbMS4uLl1cbiAgICAgIGlmIHN0cltzdHIubGVuZ3RoLTFdIGlzIFwiL1wiXG4gICAgICAgIHN0ciA9IHN0clsuLi4tMV1cbiAgICAgIGFkZHIgPSBGaW5kLnNjYW5FZGl0b3Ioc3RyLCBAZWRpdG9yLCBjdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLmVuZClbMF1cbiAgICAgIHVubGVzcyBhZGRyP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiUGF0dGVybiBub3QgZm91bmQ6ICN7c3RyfVwiKVxuICAgICAgYWRkciA9IGFkZHIuc3RhcnQucm93XG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCI/XCJcbiAgICAgIHN0ciA9IHN0clsxLi4uXVxuICAgICAgaWYgc3RyW3N0ci5sZW5ndGgtMV0gaXMgXCI/XCJcbiAgICAgICAgc3RyID0gc3RyWy4uLi0xXVxuICAgICAgYWRkciA9IEZpbmQuc2NhbkVkaXRvcihzdHIsIEBlZGl0b3IsIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuc3RhcnQsIHRydWUpWzBdXG4gICAgICB1bmxlc3MgYWRkcj9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIlBhdHRlcm4gbm90IGZvdW5kOiAje3N0clsxLi4uLTFdfVwiKVxuICAgICAgYWRkciA9IGFkZHIuc3RhcnQucm93XG5cbiAgICByZXR1cm4gYWRkclxuXG4gIHBhcnNlT2Zmc2V0OiAoc3RyKSAtPlxuICAgIGlmIHN0ci5sZW5ndGggaXMgMFxuICAgICAgcmV0dXJuIDBcbiAgICBpZiBzdHIubGVuZ3RoIGlzIDFcbiAgICAgIG8gPSAxXG4gICAgZWxzZVxuICAgICAgbyA9IHBhcnNlSW50KHN0clsxLi5dKVxuICAgIGlmIHN0clswXSBpcyAnKydcbiAgICAgIHJldHVybiBvXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIC1vXG5cbiAgZXhlY3V0ZTogKGlucHV0KSAtPlxuICAgIEB2aW1TdGF0ZSA9IEBleFN0YXRlLmdsb2JhbEV4U3RhdGUudmltPy5nZXRFZGl0b3JTdGF0ZShAZWRpdG9yKVxuICAgICMgQ29tbWFuZCBsaW5lIHBhcnNpbmcgKG1vc3RseSkgZm9sbG93aW5nIHRoZSBydWxlcyBhdFxuICAgICMgaHR0cDovL3B1YnMub3Blbmdyb3VwLm9yZy9vbmxpbmVwdWJzLzk2OTk5MTk3OTkvdXRpbGl0aWVzXG4gICAgIyAvZXguaHRtbCN0YWdfMjBfNDBfMTNfMDNcblxuICAgICMgU3RlcHMgMS8yOiBMZWFkaW5nIGJsYW5rcyBhbmQgY29sb25zIGFyZSBpZ25vcmVkLlxuICAgIGNsID0gaW5wdXQuY2hhcmFjdGVyc1xuICAgIGNsID0gY2wucmVwbGFjZSgvXig6fFxccykqLywgJycpXG4gICAgcmV0dXJuIHVubGVzcyBjbC5sZW5ndGggPiAwXG5cbiAgICAjIFN0ZXAgMzogSWYgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBhIFwiLCBpZ25vcmUgdGhlIHJlc3Qgb2YgdGhlIGxpbmVcbiAgICBpZiBjbFswXSBpcyAnXCInXG4gICAgICByZXR1cm5cblxuICAgICMgU3RlcCA0OiBBZGRyZXNzIHBhcnNpbmdcbiAgICBsYXN0TGluZSA9IEBlZGl0b3IuZ2V0QnVmZmVyKCkubGluZXMubGVuZ3RoIC0gMVxuICAgIGlmIGNsWzBdIGlzICclJ1xuICAgICAgcmFuZ2UgPSBbMCwgbGFzdExpbmVdXG4gICAgICBjbCA9IGNsWzEuLl1cbiAgICBlbHNlXG4gICAgICBhZGRyUGF0dGVybiA9IC8vL15cbiAgICAgICAgKD86ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgRmlyc3QgYWRkcmVzc1xuICAgICAgICAoXG4gICAgICAgIFxcLnwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBDdXJyZW50IGxpbmVcbiAgICAgICAgXFwkfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIExhc3QgbGluZVxuICAgICAgICBcXGQrfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgbi10aCBsaW5lXG4gICAgICAgICdbXFxbXFxdPD4nYFwiXi4oKXt9YS16QS1aXXwgICAgICAgICAjIE1hcmtzXG4gICAgICAgIC8uKj8oPzpbXlxcXFxdL3wkKXwgICAgICAgICAgICAgICAgICMgUmVnZXhcbiAgICAgICAgXFw/Lio/KD86W15cXFxcXVxcP3wkKXwgICAgICAgICAgICAgICAjIEJhY2t3YXJkcyBzZWFyY2hcbiAgICAgICAgWystXVxcZCogICAgICAgICAgICAgICAgICAgICAgICAgICAjIEN1cnJlbnQgbGluZSArLy0gYSBudW1iZXIgb2YgbGluZXNcbiAgICAgICAgKSgoPzpcXHMqWystXVxcZCopKikgICAgICAgICAgICAgICAgIyBMaW5lIG9mZnNldFxuICAgICAgICApP1xuICAgICAgICAoPzosICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBTZWNvbmQgYWRkcmVzc1xuICAgICAgICAoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBTYW1lIGFzIGZpcnN0IGFkZHJlc3NcbiAgICAgICAgXFwufFxuICAgICAgICBcXCR8XG4gICAgICAgIFxcZCt8XG4gICAgICAgICdbXFxbXFxdPD4nYFwiXi4oKXt9YS16QS1aXXxcbiAgICAgICAgLy4qP1teXFxcXF0vfFxuICAgICAgICBcXD8uKj9bXlxcXFxdXFw/fFxuICAgICAgICBbKy1dXFxkKlxuICAgICAgICApKCg/OlxccypbKy1dXFxkKikqKVxuICAgICAgICApP1xuICAgICAgLy8vXG5cbiAgICAgIFttYXRjaCwgYWRkcjEsIG9mZjEsIGFkZHIyLCBvZmYyXSA9IGNsLm1hdGNoKGFkZHJQYXR0ZXJuKVxuXG4gICAgICBjdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuXG4gICAgICAjIFNwZWNpYWwgY2FzZTogcnVuIGNvbW1hbmQgb24gc2VsZWN0aW9uLiBUaGlzIGNhbid0IGJlIGhhbmRsZWQgYnkgc2ltcGx5XG4gICAgICAjIHBhcnNpbmcgdGhlIG1hcmsgc2luY2UgdmltLW1vZGUgZG9lc24ndCBzZXQgaXQgKGFuZCBpdCB3b3VsZCBiZSBmYWlybHlcbiAgICAgICMgdXNlbGVzcyB3aXRoIG11bHRpcGxlIHNlbGVjdGlvbnMpXG4gICAgICBpZiBhZGRyMSBpcyBcIic8XCIgYW5kIGFkZHIyIGlzIFwiJz5cIlxuICAgICAgICBydW5PdmVyU2VsZWN0aW9ucyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgcnVuT3ZlclNlbGVjdGlvbnMgPSBmYWxzZVxuICAgICAgICBpZiBhZGRyMT9cbiAgICAgICAgICBhZGRyZXNzMSA9IEBwYXJzZUFkZHIoYWRkcjEsIGN1cnNvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgSWYgbm8gYWRkcjEgaXMgZ2l2ZW4gKCwrMyksIGFzc3VtZSBpdCBpcyAnLidcbiAgICAgICAgICBhZGRyZXNzMSA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgICBpZiBvZmYxP1xuICAgICAgICAgIGFkZHJlc3MxICs9IEBwYXJzZU9mZnNldChvZmYxKVxuXG4gICAgICAgIGFkZHJlc3MxID0gMCBpZiBhZGRyZXNzMSBpcyAtMVxuICAgICAgICBhZGRyZXNzMSA9IGxhc3RMaW5lIGlmIGFkZHJlc3MxID4gbGFzdExpbmVcblxuICAgICAgICBpZiBhZGRyZXNzMSA8IDBcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdJbnZhbGlkIHJhbmdlJylcblxuICAgICAgICBpZiBhZGRyMj9cbiAgICAgICAgICBhZGRyZXNzMiA9IEBwYXJzZUFkZHIoYWRkcjIsIGN1cnNvcilcbiAgICAgICAgaWYgb2ZmMj9cbiAgICAgICAgICBhZGRyZXNzMiArPSBAcGFyc2VPZmZzZXQob2ZmMilcblxuICAgICAgICBhZGRyZXNzMiA9IDAgaWYgYWRkcmVzczIgaXMgLTFcbiAgICAgICAgYWRkcmVzczIgPSBsYXN0TGluZSBpZiBhZGRyZXNzMiA+IGxhc3RMaW5lXG5cbiAgICAgICAgaWYgYWRkcmVzczIgPCAwXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignSW52YWxpZCByYW5nZScpXG5cbiAgICAgICAgaWYgYWRkcmVzczIgPCBhZGRyZXNzMVxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0JhY2t3YXJkcyByYW5nZSBnaXZlbicpXG5cbiAgICAgIHJhbmdlID0gW2FkZHJlc3MxLCBpZiBhZGRyZXNzMj8gdGhlbiBhZGRyZXNzMiBlbHNlIGFkZHJlc3MxXVxuICAgIGNsID0gY2xbbWF0Y2g/Lmxlbmd0aC4uXVxuXG4gICAgIyBTdGVwIDU6IExlYWRpbmcgYmxhbmtzIGFyZSBpZ25vcmVkXG4gICAgY2wgPSBjbC50cmltTGVmdCgpXG5cbiAgICAjIFN0ZXAgNmE6IElmIG5vIGNvbW1hbmQgaXMgc3BlY2lmaWVkLCBnbyB0byB0aGUgbGFzdCBzcGVjaWZpZWQgYWRkcmVzc1xuICAgIGlmIGNsLmxlbmd0aCBpcyAwXG4gICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtyYW5nZVsxXSwgMF0pXG4gICAgICByZXR1cm5cblxuICAgICMgSWdub3JlIHN0ZXBzIDZiIGFuZCA2YyBzaW5jZSB0aGV5IG9ubHkgbWFrZSBzZW5zZSBmb3IgcHJpbnQgY29tbWFuZHMgYW5kXG4gICAgIyBwcmludCBkb2Vzbid0IG1ha2Ugc2Vuc2VcblxuICAgICMgSWdub3JlIHN0ZXAgN2Egc2luY2UgZmxhZ3MgYXJlIG9ubHkgdXNlZnVsIGZvciBwcmludFxuXG4gICAgIyBTdGVwIDdiOiA6azx2YWxpZCBtYXJrPiBpcyBlcXVhbCB0byA6bWFyayA8dmFsaWQgbWFyaz4gLSBvbmx5IGEtekEtWiBpc1xuICAgICMgaW4gdmltLW1vZGUgZm9yIG5vd1xuICAgIGlmIGNsLmxlbmd0aCBpcyAyIGFuZCBjbFswXSBpcyAnaycgYW5kIC9bYS16XS9pLnRlc3QoY2xbMV0pXG4gICAgICBjb21tYW5kID0gJ21hcmsnXG4gICAgICBhcmdzID0gY2xbMV1cbiAgICBlbHNlIGlmIG5vdCAvW2Etel0vaS50ZXN0KGNsWzBdKVxuICAgICAgY29tbWFuZCA9IGNsWzBdXG4gICAgICBhcmdzID0gY2xbMS4uXVxuICAgIGVsc2VcbiAgICAgIFttLCBjb21tYW5kLCBhcmdzXSA9IGNsLm1hdGNoKC9eKFxcdyspKC4qKS8pXG5cbiAgICAjIElmIHRoZSBjb21tYW5kIG1hdGNoZXMgYW4gZXhpc3Rpbmcgb25lIGV4YWN0bHksIGV4ZWN1dGUgdGhhdCBvbmVcbiAgICB1bmxlc3MgKGZ1bmMgPSBFeC5zaW5nbGV0b24oKVtjb21tYW5kXSk/XG4gICAgICAjIFN0ZXAgODogTWF0Y2ggY29tbWFuZCBhZ2FpbnN0IGV4aXN0aW5nIGNvbW1hbmRzXG4gICAgICBtYXRjaGluZyA9IChuYW1lIGZvciBuYW1lLCB2YWwgb2YgRXguc2luZ2xldG9uKCkgd2hlbiBcXFxuICAgICAgICBuYW1lLmluZGV4T2YoY29tbWFuZCkgaXMgMClcblxuICAgICAgbWF0Y2hpbmcuc29ydCgpXG5cbiAgICAgIGNvbW1hbmQgPSBtYXRjaGluZ1swXVxuXG4gICAgICBmdW5jID0gRXguc2luZ2xldG9uKClbY29tbWFuZF1cblxuICAgIGlmIGZ1bmM/XG4gICAgICBpZiBydW5PdmVyU2VsZWN0aW9uc1xuICAgICAgICBmb3IgaWQsIHNlbGVjdGlvbiBvZiBAc2VsZWN0aW9uc1xuICAgICAgICAgIGJ1ZmZlclJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgICByYW5nZSA9IFtidWZmZXJSYW5nZS5zdGFydC5yb3csIGJ1ZmZlclJhbmdlLmVuZC5yb3ddXG4gICAgICAgICAgZnVuYyh7IHJhbmdlLCBhcmdzLCBAdmltU3RhdGUsIEBleFN0YXRlLCBAZWRpdG9yIH0pXG4gICAgICBlbHNlXG4gICAgICAgIGZ1bmMoeyByYW5nZSwgYXJncywgQHZpbVN0YXRlLCBAZXhTdGF0ZSwgQGVkaXRvciB9KVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJOb3QgYW4gZWRpdG9yIGNvbW1hbmQ6ICN7aW5wdXQuY2hhcmFjdGVyc31cIilcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kXG4iXX0=
