(function() {
  var Point, PythonTools, Range, ref;

  PythonTools = require('../lib/python-tools');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  describe("PythonTools", function() {
    var pythonTools;
    pythonTools = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('python-tools');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-python');
      });
      return runs(function() {
        return pythonTools = atom.packages.getActivePackage('python-tools').mainModule;
      });
    });
    describe("when running jedi commands", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('test.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("import json");
        });
      });
      return it("does not send too many commands over time", function() {
        editor.setCursorBufferPosition(new Point(0, 9));
        spyOn(pythonTools, 'handleJediToolsResponse');
        waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef');
        });
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(pythonTools.handleJediToolsResponse.calls.length).toEqual(2);
          });
        });
      });
    });
    describe("when running the goto definitions command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('mike.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("import json\n\nclass Snake(object):\n    def slither(self, dict):\n        return json.dumps(dict)\n\nsnake = Snake()\nsnake.slither({'x': 10, 'y': 20})\n\ni_dont_exist()");
        });
      });
      it("moves to the correct class location", function() {
        editor.setCursorBufferPosition(new Point(6, 9));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(3, 6));
          });
        });
      });
      it("moves to the correct method location", function() {
        editor.setCursorBufferPosition(new Point(7, 7));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(4, 8));
          });
        });
      });
      it("does nothing if symbol does not exist", function() {
        editor.setCursorBufferPosition(new Point(9, 7));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(9, 7));
          });
        });
      });
      return it("opens appropriate file if required", function() {
        editor.setCursorBufferPosition(new Point(0, 9));
        spyOn(atom.workspace, 'open').andCallThrough();
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            var path;
            path = atom.workspace.open.mostRecentCall.args[0];
            if (/^win/.test(process.platform)) {
              return expect(path).toMatch(/.*\\json\\__init__.py/);
            } else {
              return expect(path).toMatch(/.*\/json\/__init__.py/);
            }
          });
        });
      });
    });
    describe("when tools.py gets an invalid request", function() {
      var editor;
      editor = null;
      return beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('error.py');
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
    });
    describe("when running the show usages command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('foo.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("def my_function(a, b):\n    return a + b\n\nprint my_function(10, 20)");
        });
      });
      xit("selects the correct symbols", function() {
        editor.setCursorBufferPosition(new Point(3, 8));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('usages').then(function() {
            return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(0, 4), new Point(0, 15)), new Range(new Point(3, 6), new Point(3, 17))]);
          });
        });
      });
      return xit("doesn't alter current selection on no results", function() {
        editor.setCursorBufferPosition(new Point(3, 2));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('usages').then(function() {
            return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(3, 2), new Point(3, 2))]);
          });
        });
      });
    });
    describe("when running the select string command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('lolcat.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("class Lolcat(object):\n  mystring = 'hello world'\n  anotherstring = \"this is some text\"\n  block_text = \"\"\"\n  This was a triumph!\n  I'm making a note here:\n  Huge success!\n  \"\"\"\n  more_blocks = '''\n  This is some text\n  '''\n  sql_text = \"\"\"SELECT *\n  FROM foo\n  \"\"\"\n  sql_text2 = '''SELECT *\n  FROM bar\n  '''");
        });
      });
      it("selects single-line single qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(1, 17));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(1, 14), new Point(1, 25)));
      });
      it("selects single-line double qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(2, 25));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(2, 19), new Point(2, 36)));
      });
      it("selects block string double qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(4, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(3, 18), new Point(7, 2)));
      });
      it("smart selects double qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(4, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(4, 2), new Point(4, 21)), new Range(new Point(5, 2), new Point(5, 25)), new Range(new Point(6, 2), new Point(6, 15))]);
      });
      it("selects block string single qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(9, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(8, 19), new Point(10, 2)));
      });
      it("smart selects single qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(9, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(9, 2), new Point(9, 19))]);
      });
      it("it selects block SQL double qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(12, 20));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(11, 16), new Point(13, 2)));
      });
      return it("it selects block SQL single qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(14, 20));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(14, 17), new Point(16, 2)));
      });
    });
    return describe("when a response is returned from tools.py", function() {
      it("informs the user with an info notification when no items were found", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          type: "usages",
          definitions: []
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('info');
      });
      it("informs the user with an error notification on error", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          "error": "this is a test error"
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('error');
      });
      return it("informs the user with an error notification on invalid type", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          type: "monkeys",
          definitions: [
            {
              line: 0,
              column: 0
            }
          ]
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('error');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi10b29scy9zcGVjL3B5dGhvbi10b29scy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBRVIsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsV0FBQSxHQUFjO0lBQ2QsVUFBQSxDQUFXLFNBQUE7TUFDVCxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsY0FBOUI7TUFEYyxDQUFoQjtNQUVBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUI7TUFEYyxDQUFoQjthQUVBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsY0FBL0IsQ0FBOEMsQ0FBQztNQUQxRCxDQUFMO0lBTFMsQ0FBWDtJQVFBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBO0FBQ3JDLFVBQUE7TUFBQSxNQUFBLEdBQVM7TUFDVCxVQUFBLENBQVcsU0FBQTtRQUNULGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEI7UUFEYyxDQUFoQjtlQUdBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtpQkFDVCxNQUFNLENBQUMsT0FBUCxDQUFlLGFBQWY7UUFGRyxDQUFMO01BSlMsQ0FBWDthQVVBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBO1FBQzlDLE1B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QUFaLENBQ0U7VUFBQSxJQUFBLEVBQU0sU0FBTjtVQUNBLFdBQUEsRUFBYTtZQUFDO2NBQ1YsSUFBQSxFQUFNLENBREk7Y0FFVixNQUFBLEVBQVEsQ0FGRTthQUFEO1dBRGI7U0FERjtRQU9DLGVBQWdCLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQW5CLENBQUE7ZUFDakIsTUFBQSxDQUFPLFlBQVksQ0FBQyxJQUFwQixDQUF5QixDQUFDLElBQTFCLENBQStCLE9BQS9CO01BVGdFLENBQWxFO0lBakJvRCxDQUF0RDtFQXRPc0IsQ0FBeEI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIlB5dGhvblRvb2xzID0gcmVxdWlyZSgnLi4vbGliL3B5dGhvbi10b29scycpO1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmRlc2NyaWJlIFwiUHl0aG9uVG9vbHNcIiwgLT5cbiAgcHl0aG9uVG9vbHMgPSBudWxsXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdweXRob24tdG9vbHMnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLXB5dGhvbicpXG4gICAgcnVucyAtPlxuICAgICAgcHl0aG9uVG9vbHMgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3B5dGhvbi10b29scycpLm1haW5Nb2R1bGVcblxuICBkZXNjcmliZSBcIndoZW4gcnVubmluZyBqZWRpIGNvbW1hbmRzXCIsIC0+XG4gICAgZWRpdG9yID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCd0ZXN0LnB5JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIlwiXG4gICAgICAgIGltcG9ydCBqc29uXG4gICAgICAgIFwiXCJcIilcblxuICAgIGl0IFwiZG9lcyBub3Qgc2VuZCB0b28gbWFueSBjb21tYW5kcyBvdmVyIHRpbWVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoMCwgOSkpXG4gICAgICBzcHlPbihweXRob25Ub29scywgJ2hhbmRsZUplZGlUb29sc1Jlc3BvbnNlJylcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJylcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJykudGhlbiAtPlxuICAgICAgICAgIGV4cGVjdChweXRob25Ub29scy5oYW5kbGVKZWRpVG9vbHNSZXNwb25zZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcblxuICBkZXNjcmliZSBcIndoZW4gcnVubmluZyB0aGUgZ290byBkZWZpbml0aW9ucyBjb21tYW5kXCIsIC0+XG4gICAgZWRpdG9yID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdtaWtlLnB5JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIlwiXG4gICAgICAgIGltcG9ydCBqc29uXG5cbiAgICAgICAgY2xhc3MgU25ha2Uob2JqZWN0KTpcbiAgICAgICAgICAgIGRlZiBzbGl0aGVyKHNlbGYsIGRpY3QpOlxuICAgICAgICAgICAgICAgIHJldHVybiBqc29uLmR1bXBzKGRpY3QpXG5cbiAgICAgICAgc25ha2UgPSBTbmFrZSgpXG4gICAgICAgIHNuYWtlLnNsaXRoZXIoeyd4JzogMTAsICd5JzogMjB9KVxuXG4gICAgICAgIGlfZG9udF9leGlzdCgpXG4gICAgICAgIFwiXCJcIilcblxuICAgIGl0IFwibW92ZXMgdG8gdGhlIGNvcnJlY3QgY2xhc3MgbG9jYXRpb25cIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoNiwgOSkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHl0aG9uVG9vbHMuamVkaVRvb2xzUmVxdWVzdCgnZ290b0RlZicpLnRoZW4oICgpIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKG5ldyBQb2ludCgzLCA2KSlcbiAgICAgICAgKVxuXG4gICAgaXQgXCJtb3ZlcyB0byB0aGUgY29ycmVjdCBtZXRob2QgbG9jYXRpb25cIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoNywgNykpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHl0aG9uVG9vbHMuamVkaVRvb2xzUmVxdWVzdCgnZ290b0RlZicpLnRoZW4oICgpIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKG5ldyBQb2ludCg0LCA4KSlcbiAgICAgICAgKVxuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgc3ltYm9sIGRvZXMgbm90IGV4aXN0XCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDksIDcpKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHB5dGhvblRvb2xzLmplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKS50aGVuKCAoKSAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChuZXcgUG9pbnQoOSwgNykpXG4gICAgICAgIClcblxuICAgIGl0IFwib3BlbnMgYXBwcm9wcmlhdGUgZmlsZSBpZiByZXF1aXJlZFwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgwLCA5KSlcbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJykudGhlbiggKCkgLT5cbiAgICAgICAgICBwYXRoID0gYXRvbS53b3Jrc3BhY2Uub3Blbi5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgICAgICAgaWYgL153aW4vLnRlc3QgcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgICAgICAgZXhwZWN0KHBhdGgpLnRvTWF0Y2goLy4qXFxcXGpzb25cXFxcX19pbml0X18ucHkvKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGV4cGVjdChwYXRoKS50b01hdGNoKC8uKlxcL2pzb25cXC9fX2luaXRfXy5weS8pXG4gICAgICAgIClcblxuICBkZXNjcmliZSBcIndoZW4gdG9vbHMucHkgZ2V0cyBhbiBpbnZhbGlkIHJlcXVlc3RcIiwgLT5cbiAgICBlZGl0b3IgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2Vycm9yLnB5JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBkZXNjcmliZSBcIndoZW4gcnVubmluZyB0aGUgc2hvdyB1c2FnZXMgY29tbWFuZFwiLCAtPlxuICAgIGVkaXRvciA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZm9vLnB5JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIlwiXG4gICAgICAgIGRlZiBteV9mdW5jdGlvbihhLCBiKTpcbiAgICAgICAgICAgIHJldHVybiBhICsgYlxuXG4gICAgICAgIHByaW50IG15X2Z1bmN0aW9uKDEwLCAyMClcbiAgICAgICAgXCJcIlwiKVxuXG4gICAgeGl0IFwic2VsZWN0cyB0aGUgY29ycmVjdCBzeW1ib2xzXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDMsIDgpKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHB5dGhvblRvb2xzLmplZGlUb29sc1JlcXVlc3QoJ3VzYWdlcycpLnRoZW4oICgpLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgbmV3IFJhbmdlKG5ldyBQb2ludCgwLCA0KSwgbmV3IFBvaW50KDAsIDE1KSksXG4gICAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDMsIDYpLCBuZXcgUG9pbnQoMywgMTcpKSxcbiAgICAgICAgICBdKVxuICAgICAgICApXG5cbiAgICB4aXQgXCJkb2Vzbid0IGFsdGVyIGN1cnJlbnQgc2VsZWN0aW9uIG9uIG5vIHJlc3VsdHNcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoMywgMikpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHl0aG9uVG9vbHMuamVkaVRvb2xzUmVxdWVzdCgndXNhZ2VzJykudGhlbiggKCkgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDMsIDIpLCBuZXcgUG9pbnQoMywgMikpXG4gICAgICAgICAgXSlcbiAgICAgICAgKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBydW5uaW5nIHRoZSBzZWxlY3Qgc3RyaW5nIGNvbW1hbmRcIiwgLT5cbiAgICBlZGl0b3IgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2xvbGNhdC5weScpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KFwiXCJcIlxuICAgICAgICBjbGFzcyBMb2xjYXQob2JqZWN0KTpcbiAgICAgICAgICBteXN0cmluZyA9ICdoZWxsbyB3b3JsZCdcbiAgICAgICAgICBhbm90aGVyc3RyaW5nID0gXCJ0aGlzIGlzIHNvbWUgdGV4dFwiXG4gICAgICAgICAgYmxvY2tfdGV4dCA9IFxcXCJcXFwiXFxcIlxuICAgICAgICAgIFRoaXMgd2FzIGEgdHJpdW1waCFcbiAgICAgICAgICBJJ20gbWFraW5nIGEgbm90ZSBoZXJlOlxuICAgICAgICAgIEh1Z2Ugc3VjY2VzcyFcbiAgICAgICAgICBcXFwiXFxcIlxcXCJcbiAgICAgICAgICBtb3JlX2Jsb2NrcyA9ICcnJ1xuICAgICAgICAgIFRoaXMgaXMgc29tZSB0ZXh0XG4gICAgICAgICAgJycnXG4gICAgICAgICAgc3FsX3RleHQgPSBcXFwiXFxcIlxcXCJTRUxFQ1QgKlxuICAgICAgICAgIEZST00gZm9vXG4gICAgICAgICAgXFxcIlxcXCJcXFwiXG4gICAgICAgICAgc3FsX3RleHQyID0gJycnU0VMRUNUICpcbiAgICAgICAgICBGUk9NIGJhclxuICAgICAgICAgICcnJ1xuICAgICAgICBcIlwiXCIpXG5cbiAgICBpdCBcInNlbGVjdHMgc2luZ2xlLWxpbmUgc2luZ2xlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgxLCAxNykpXG4gICAgICAgIHB5dGhvblRvb2xzLnNlbGVjdEFsbFN0cmluZygpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKS50b0VxdWFsKG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludCgxLCAxNCksXG4gICAgICAgICAgICBuZXcgUG9pbnQoMSwgMjUpLFxuICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgaXQgXCJzZWxlY3RzIHNpbmdsZS1saW5lIGRvdWJsZSBxb3V0ZXMgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoMiwgMjUpKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoMiwgMTkpLFxuICAgICAgICAgICAgbmV3IFBvaW50KDIsIDM2KSxcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICAgIGl0IFwic2VsZWN0cyBibG9jayBzdHJpbmcgZG91YmxlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdweXRob24tdG9vbHMuc21hcnRCbG9ja1NlbGVjdGlvbicsIGZhbHNlKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDQsIDE1KSlcbiAgICAgICAgcHl0aG9uVG9vbHMuc2VsZWN0QWxsU3RyaW5nKClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkpLnRvRXF1YWwobmV3IFJhbmdlKFxuICAgICAgICAgICAgbmV3IFBvaW50KDMsIDE4KSxcbiAgICAgICAgICAgIG5ldyBQb2ludCg3LCAyKSxcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICAgIGl0IFwic21hcnQgc2VsZWN0cyBkb3VibGUgcW91dGVzIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDQsIDE1KSlcbiAgICAgICAgcHl0aG9uVG9vbHMuc2VsZWN0QWxsU3RyaW5nKClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpKS50b0VxdWFsKFtcbiAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDQsIDIpLCBuZXcgUG9pbnQoNCwgMjEpKSxcbiAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDUsIDIpLCBuZXcgUG9pbnQoNSwgMjUpKSxcbiAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDYsIDIpLCBuZXcgUG9pbnQoNiwgMTUpKSxcbiAgICAgICAgXSlcblxuICAgIGl0IFwic2VsZWN0cyBibG9jayBzdHJpbmcgc2luZ2xlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdweXRob24tdG9vbHMuc21hcnRCbG9ja1NlbGVjdGlvbicsIGZhbHNlKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDksIDE1KSlcbiAgICAgICAgcHl0aG9uVG9vbHMuc2VsZWN0QWxsU3RyaW5nKClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkpLnRvRXF1YWwobmV3IFJhbmdlKFxuICAgICAgICAgICAgbmV3IFBvaW50KDgsIDE5KSxcbiAgICAgICAgICAgIG5ldyBQb2ludCgxMCwgMiksXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgICBpdCBcInNtYXJ0IHNlbGVjdHMgc2luZ2xlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCg5LCAxNSkpXG4gICAgICAgIHB5dGhvblRvb2xzLnNlbGVjdEFsbFN0cmluZygpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSkudG9FcXVhbChbXG4gICAgICAgICAgbmV3IFJhbmdlKG5ldyBQb2ludCg5LCAyKSwgbmV3IFBvaW50KDksIDE5KSksXG4gICAgICAgIF0pXG5cbiAgICBpdCBcIml0IHNlbGVjdHMgYmxvY2sgU1FMIGRvdWJsZSBxb3V0ZXMgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgncHl0aG9uLXRvb2xzLnNtYXJ0QmxvY2tTZWxlY3Rpb24nLCBmYWxzZSlcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgxMiwgMjApKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoMTEsIDE2KSxcbiAgICAgICAgICAgIG5ldyBQb2ludCgxMywgMiksXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgICBpdCBcIml0IHNlbGVjdHMgYmxvY2sgU1FMIHNpbmdsZSBxb3V0ZXMgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgncHl0aG9uLXRvb2xzLnNtYXJ0QmxvY2tTZWxlY3Rpb24nLCBmYWxzZSlcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgxNCwgMjApKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoMTQsIDE3KSxcbiAgICAgICAgICAgIG5ldyBQb2ludCgxNiwgMiksXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGEgcmVzcG9uc2UgaXMgcmV0dXJuZWQgZnJvbSB0b29scy5weVwiLCAtPlxuXG4gICAgaXQgXCJpbmZvcm1zIHRoZSB1c2VyIHdpdGggYW4gaW5mbyBub3RpZmljYXRpb24gd2hlbiBubyBpdGVtcyB3ZXJlIGZvdW5kXCIsIC0+XG4gICAgICBweXRob25Ub29scy5oYW5kbGVKZWRpVG9vbHNSZXNwb25zZShcbiAgICAgICAgdHlwZTogXCJ1c2FnZXNcIlxuICAgICAgICBkZWZpbml0aW9uczogW11cbiAgICAgIClcbiAgICAgIFtub3RpZmljYXRpb25dID0gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi50eXBlKS50b0JlKCdpbmZvJylcblxuICAgIGl0IFwiaW5mb3JtcyB0aGUgdXNlciB3aXRoIGFuIGVycm9yIG5vdGlmaWNhdGlvbiBvbiBlcnJvclwiLCAtPlxuICAgICAgcHl0aG9uVG9vbHMuaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UoXG4gICAgICAgIFwiZXJyb3JcIjogXCJ0aGlzIGlzIGEgdGVzdCBlcnJvclwiXG4gICAgICApXG4gICAgICBbbm90aWZpY2F0aW9uXSA9IGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKClcbiAgICAgIGV4cGVjdChub3RpZmljYXRpb24udHlwZSkudG9CZSgnZXJyb3InKVxuXG4gICAgaXQgXCJpbmZvcm1zIHRoZSB1c2VyIHdpdGggYW4gZXJyb3Igbm90aWZpY2F0aW9uIG9uIGludmFsaWQgdHlwZVwiLCAtPlxuICAgICAgcHl0aG9uVG9vbHMuaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UoXG4gICAgICAgIHR5cGU6IFwibW9ua2V5c1wiXG4gICAgICAgIGRlZmluaXRpb25zOiBbe1xuICAgICAgICAgICAgbGluZTogMFxuICAgICAgICAgICAgY29sdW1uOiAwXG4gICAgICAgIH0gICBdXG4gICAgICApXG4gICAgICBbbm90aWZpY2F0aW9uXSA9IGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKClcbiAgICAgIGV4cGVjdChub3RpZmljYXRpb24udHlwZSkudG9CZSgnZXJyb3InKVxuIl19
