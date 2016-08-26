(function() {
  var HighlightLine, Point, Range, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  HighlightLine = require('../lib/highlight-line');

  describe("Higlight line", function() {
    var activationPromise, editor, editorElement, highlightSelected, workspaceElement, _ref1;
    _ref1 = [], activationPromise = _ref1[0], workspaceElement = _ref1[1], editor = _ref1[2], editorElement = _ref1[3], highlightSelected = _ref1[4];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      atom.project.setPaths([path.join(__dirname, 'fixtures')]);
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee');
      });
      runs(function() {
        jasmine.attachToDOM(workspaceElement);
        editor = atom.workspace.getActiveTextEditor();
        editorElement = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage('highlight-line').then(function(_arg) {
          var highlightLine, mainModule;
          mainModule = _arg.mainModule;
          return highlightLine = mainModule.highlightLine, mainModule;
        });
      });
      return waitsForPromise(function() {
        return activationPromise;
      });
    });
    describe("when the view is loaded", function() {
      return it("does not attach to the view", function() {
        return expect(workspaceElement.querySelectorAll('.highlight-view')).toHaveLength(0);
      });
    });
    return describe("when the background color is enabled", function() {
      beforeEach(function() {
        return atom.config.set('highlight-line.enabledBackgroundColor', true);
      });
      describe("when there is only one cursor", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(8, 2));
          return editor.setSelectedBufferRange(range);
        });
        it("adds the background class to the cursor line", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line')).toHaveLength(1);
        });
        return describe("when hide highlight on select is enabled", function() {
          beforeEach(function() {
            return atom.config.set('highlight-line.hideHighlightOnSelect', true);
          });
          it("will have a highlight when there is no text selected", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line')).toHaveLength(1);
          });
          return it("won`t have a highlight when there is text selected", function() {
            var range;
            range = new Range(new Point(8, 2), new Point(8, 5));
            editor.setSelectedBufferRange(range);
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line')).toHaveLength(0);
          });
        });
      });
      describe("when underline is enabled", function() {
        beforeEach(function() {
          return atom.config.set('highlight-line.enableUnderline', true);
        });
        describe("when solid settings has been set", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-line.underline', 'solid');
            range = new Range(new Point(8, 2), new Point(8, 2));
            return editor.setSelectedBufferRange(range);
          });
          it("adds an underline to the current line", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line-multi-line-solid-bottom')).toHaveLength(1);
          });
          return describe("when hide highlight on select is enabled", function() {
            beforeEach(function() {
              return atom.config.set('highlight-line.hideHighlightOnSelect', true);
            });
            return it("will still have a line", function() {
              var range;
              range = new Range(new Point(8, 2), new Point(8, 5));
              editor.setSelectedBufferRange(range);
              return expect(editorElement.shadowRoot.querySelectorAll('.line.highlight-line-multi-line-solid-bottom')).toHaveLength(1);
            });
          });
        });
        describe("when dashed settings has been set", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-line.underline', 'dashed');
            range = new Range(new Point(8, 2), new Point(8, 2));
            return editor.setSelectedBufferRange(range);
          });
          return it("adds an underline to the current line", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line-multi-line-dashed-bottom')).toHaveLength(1);
          });
        });
        return describe("when dotted settings has been set", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-line.underline', 'dotted');
            range = new Range(new Point(8, 2), new Point(8, 2));
            return editor.setSelectedBufferRange(range);
          });
          return it("adds an underline to the current line", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line-multi-line-dotted-bottom')).toHaveLength(1);
          });
        });
      });
      describe("when there are two cursors", function() {
        beforeEach(function() {
          var range1, range2;
          range1 = new Range(new Point(8, 2), new Point(8, 2));
          range2 = new Range(new Point(10, 2), new Point(10, 2));
          return editor.setSelectedBufferRanges([range1, range2]);
        });
        return it('adds the background class to the cursor line', function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line')).toHaveLength(2);
        });
      });
      return describe("when there is a multi row selection", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(10, 8));
          return editor.setSelectedBufferRange(range);
        });
        it("won`t add a highlight line class", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line.highlight-line')).toHaveLength(0);
        });
        return describe("when selection border is enabled", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-line.enableSelectionBorder', true);
            atom.config.set('highlight-line.underline', 'solid');
            range = new Range(new Point(8, 2), new Point(10, 8));
            return editor.setSelectedBufferRange(range);
          });
          return it("will add highlights to the top and bottom", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.cursor-line .highlight-line-multi-line-solid-top .highlight-line-multi-line-solid-bottom')).toHaveLength(0);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtbGluZS9zcGVjL2hpZ2hsaWdodC1saW5lLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE9BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQURSLENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx1QkFBUixDQUZoQixDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsb0ZBQUE7QUFBQSxJQUFBLFFBQzhDLEVBRDlDLEVBQUMsNEJBQUQsRUFBb0IsMkJBQXBCLEVBQ0UsaUJBREYsRUFDVSx3QkFEVixFQUN5Qiw0QkFEekIsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsVUFBckIsQ0FBRCxDQUF0QixDQURBLENBQUE7QUFBQSxNQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGVBQXBCLEVBRGM7TUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxNQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQUFB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

//# sourceURL=/home/epse/.atom/packages/highlight-line/spec/highlight-line-spec.coffee
