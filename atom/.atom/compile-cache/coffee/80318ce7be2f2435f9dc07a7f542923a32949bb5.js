(function() {
  var Minimap, TextEditor, fs;

  fs = require('fs-plus');

  TextEditor = require('atom').TextEditor;

  Minimap = require('../lib/minimap');

  describe('Minimap', function() {
    var editor, largeSample, minimap, smallSample, _ref;
    _ref = [], editor = _ref[0], minimap = _ref[1], largeSample = _ref[2], smallSample = _ref[3];
    beforeEach(function() {
      var dir;
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      editor = new TextEditor({});
      editor.setLineHeightInPixels(10);
      editor.setHeight(50);
      editor.setWidth(200);
      dir = atom.project.getDirectories()[0];
      minimap = new Minimap({
        textEditor: editor
      });
      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString();
      return smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString();
    });
    it('has an associated editor', function() {
      return expect(minimap.getTextEditor()).toEqual(editor);
    });
    it('returns false when asked if destroyed', function() {
      return expect(minimap.isDestroyed()).toBeFalsy();
    });
    it('raise an exception if created without a text editor', function() {
      return expect(function() {
        return new Minimap;
      }).toThrow();
    });
    it('measures the minimap size based on the current editor content', function() {
      editor.setText(smallSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      editor.setText(largeSample);
      return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
    });
    it('measures the scaling factor between the editor and the minimap', function() {
      expect(minimap.getVerticalScaleFactor()).toEqual(0.5);
      return expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth());
    });
    it('measures the editor visible area size at minimap scale', function() {
      editor.setText(largeSample);
      return expect(minimap.getTextEditorScaledHeight()).toEqual(25);
    });
    it('measures the available minimap scroll', function() {
      var largeLineCount;
      editor.setText(largeSample);
      largeLineCount = editor.getScreenLineCount();
      expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 50);
      return expect(minimap.canScroll()).toBeTruthy();
    });
    it('computes the first visible row in the minimap', function() {
      return expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
    });
    it('computes the last visible row in the minimap', function() {
      return expect(minimap.getLastVisibleScreenRow()).toEqual(10);
    });
    it('relays change events from the text editor', function() {
      var changeSpy;
      changeSpy = jasmine.createSpy('didChange');
      minimap.onDidChange(changeSpy);
      editor.setText('foo');
      return expect(changeSpy).toHaveBeenCalled();
    });
    it('relays scroll top events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editor.setScrollTop(100);
      return expect(scrollSpy).toHaveBeenCalled();
    });
    it('relays scroll left events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollLeft(scrollSpy);
      spyOn(editor.displayBuffer, 'getScrollWidth').andReturn(10000);
      editor.setScrollLeft(100);
      return expect(scrollSpy).toHaveBeenCalled();
    });
    describe('when scrols past end is enabled', function() {
      beforeEach(function() {
        editor.setText(largeSample);
        return atom.config.set('editor.scrollPastEnd', true);
      });
      it('adjust the scrolling ratio', function() {
        var maxScrollTop;
        editor.setScrollTop(editor.displayBuffer.getMaxScrollTop());
        maxScrollTop = editor.displayBuffer.getMaxScrollTop() - (editor.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels());
        return expect(minimap.getTextEditorScrollRatio()).toEqual(editor.getScrollTop() / maxScrollTop);
      });
      it('lock the minimap scroll top to 1', function() {
        editor.setScrollTop(editor.displayBuffer.getMaxScrollTop());
        return expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
      });
      return describe('when getScrollTop() and maxScrollTop both equal 0', function() {
        beforeEach(function() {
          editor.setText(smallSample);
          editor.setHeight(40);
          return atom.config.set('editor.scrollPastEnd', true);
        });
        return it('getTextEditorScrollRatio() should return 0', function() {
          var maxScrollTop;
          editor.setScrollTop(0);
          maxScrollTop = editor.displayBuffer.getMaxScrollTop() - (editor.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels());
          expect(maxScrollTop).toEqual(0);
          return expect(minimap.getTextEditorScrollRatio()).toEqual(0);
        });
      });
    });
    describe('when soft wrap is enabled', function() {
      beforeEach(function() {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        return atom.config.set('editor.preferredLineLength', 2);
      });
      return it('measures the minimap using screen lines', function() {
        editor.setText(smallSample);
        expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
        editor.setText(largeSample);
        return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      });
    });
    describe('when there is no scrolling needed to display the whole minimap', function() {
      it('returns 0 when computing the minimap scroll', function() {
        return expect(minimap.getScrollTop()).toEqual(0);
      });
      return it('returns 0 when measuring the available minimap scroll', function() {
        editor.setText(smallSample);
        expect(minimap.getMaxScrollTop()).toEqual(0);
        return expect(minimap.canScroll()).toBeFalsy();
      });
    });
    describe('when the editor is scrolled', function() {
      var editorHeight, editorScrollRatio, largeLineCount, _ref1;
      _ref1 = [], largeLineCount = _ref1[0], editorHeight = _ref1[1], editorScrollRatio = _ref1[2];
      beforeEach(function() {
        spyOn(editor.displayBuffer, 'getScrollWidth').andReturn(10000);
        editor.setText(largeSample);
        editor.setScrollTop(1000);
        editor.setScrollLeft(200);
        largeLineCount = editor.getScreenLineCount();
        editorHeight = largeLineCount * editor.getLineHeightInPixels();
        return editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop();
      });
      it('scales the editor scroll based on the minimap scale factor', function() {
        expect(minimap.getTextEditorScaledScrollTop()).toEqual(500);
        return expect(minimap.getTextEditorScaledScrollLeft()).toEqual(200 * minimap.getHorizontalScaleFactor());
      });
      it('computes the offset to apply based on the editor scroll top', function() {
        return expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop());
      });
      it('computes the first visible row in the minimap', function() {
        return expect(minimap.getFirstVisibleScreenRow()).toEqual(Math.floor(99));
      });
      it('computes the last visible row in the minimap', function() {
        return expect(minimap.getLastVisibleScreenRow()).toEqual(110);
      });
      return describe('down to the bottom', function() {
        beforeEach(function() {
          editor.setScrollTop(editor.displayBuffer.getMaxScrollTop());
          return editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop();
        });
        it('computes an offset that scrolls the minimap to the bottom edge', function() {
          return expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
        });
        it('computes the first visible row in the minimap', function() {
          return expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10);
        });
        return it('computes the last visible row in the minimap', function() {
          return expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount);
        });
      });
    });
    describe('destroying the model', function() {
      it('emits a did-destroy event', function() {
        var spy;
        spy = jasmine.createSpy('destroy');
        minimap.onDidDestroy(spy);
        minimap.destroy();
        return expect(spy).toHaveBeenCalled();
      });
      return it('returns true when asked if destroyed', function() {
        minimap.destroy();
        return expect(minimap.isDestroyed()).toBeTruthy();
      });
    });
    describe('destroying the text editor', function() {
      return it('destroys the model', function() {
        spyOn(minimap, 'destroy');
        editor.destroy();
        return expect(minimap.destroy).toHaveBeenCalled();
      });
    });
    describe('::decorateMarker', function() {
      var changeSpy, decoration, marker, _ref1;
      _ref1 = [], marker = _ref1[0], decoration = _ref1[1], changeSpy = _ref1[2];
      beforeEach(function() {
        editor.setText(largeSample);
        changeSpy = jasmine.createSpy('didChange');
        minimap.onDidChange(changeSpy);
        marker = minimap.markBufferRange([[0, 6], [1, 11]]);
        return decoration = minimap.decorateMarker(marker, {
          type: 'highlight',
          "class": 'dummy'
        });
      });
      it('creates a decoration for the given marker', function() {
        return expect(minimap.decorationsByMarkerId[marker.id]).toBeDefined();
      });
      it('creates a change corresponding to the marker range', function() {
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.calls[0].args[0].start).toEqual(0);
        return expect(changeSpy.calls[0].args[0].end).toEqual(1);
      });
      describe('when the marker range changes', function() {
        beforeEach(function() {
          var markerChangeSpy;
          markerChangeSpy = jasmine.createSpy('marker-did-change');
          marker.onDidChange(markerChangeSpy);
          marker.setBufferRange([[0, 6], [3, 11]]);
          return waitsFor(function() {
            return markerChangeSpy.calls.length > 0;
          });
        });
        return it('creates a change only for the dif between the two ranges', function() {
          expect(changeSpy).toHaveBeenCalled();
          expect(changeSpy.calls[1].args[0].start).toEqual(1);
          return expect(changeSpy.calls[1].args[0].end).toEqual(3);
        });
      });
      describe('destroying the marker', function() {
        beforeEach(function() {
          return marker.destroy();
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      describe('destroying the decoration', function() {
        beforeEach(function() {
          return decoration.destroy();
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      describe('destroying all the decorations for the marker', function() {
        beforeEach(function() {
          return minimap.removeAllDecorationsForMarker(marker);
        });
        it('removes the decoration from the render view', function() {
          return expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
        });
        return it('creates a change corresponding to the marker range', function() {
          expect(changeSpy.calls[1].args[0].start).toEqual(0);
          return expect(changeSpy.calls[1].args[0].end).toEqual(1);
        });
      });
      return describe('destroying the minimap', function() {
        beforeEach(function() {
          return minimap.destroy();
        });
        it('removes all the previously added decorations', function() {
          expect(minimap.decorationsById).toEqual({});
          return expect(minimap.decorationsByMarkerId).toEqual({});
        });
        return it('prevents the creation of new decorations', function() {
          marker = editor.markBufferRange([[0, 6], [0, 11]]);
          decoration = minimap.decorateMarker(marker, {
            type: 'highlight',
            "class": 'dummy'
          });
          return expect(decoration).toBeUndefined();
        });
      });
    });
    return describe('::decorationsByTypeThenRows', function() {
      var decorations;
      decorations = [][0];
      beforeEach(function() {
        var createDecoration;
        editor.setText(largeSample);
        createDecoration = function(type, range) {
          var decoration, marker;
          marker = minimap.markBufferRange(range);
          return decoration = minimap.decorateMarker(marker, {
            type: type
          });
        };
        createDecoration('highlight', [[6, 0], [11, 0]]);
        createDecoration('highlight', [[7, 0], [8, 0]]);
        createDecoration('highlight-over', [[1, 0], [2, 0]]);
        createDecoration('line', [[3, 0], [4, 0]]);
        createDecoration('line', [[12, 0], [12, 0]]);
        createDecoration('highlight-under', [[0, 0], [10, 1]]);
        return decorations = minimap.decorationsByTypeThenRows(0, 12);
      });
      it('returns an object whose keys are the decorations types', function() {
        return expect(Object.keys(decorations).sort()).toEqual(['highlight-over', 'highlight-under', 'line']);
      });
      it('stores decorations by rows within each type objects', function() {
        expect(Object.keys(decorations['highlight-over']).sort()).toEqual('1 2 6 7 8 9 10 11'.split(' ').sort());
        expect(Object.keys(decorations['line']).sort()).toEqual('3 4 12'.split(' ').sort());
        return expect(Object.keys(decorations['highlight-under']).sort()).toEqual('0 1 2 3 4 5 6 7 8 9 10'.split(' ').sort());
      });
      return it('stores the decorations spanning a row in the corresponding row array', function() {
        expect(decorations['highlight-over']['7'].length).toEqual(2);
        expect(decorations['line']['3'].length).toEqual(1);
        return expect(decorations['highlight-under']['5'].length).toEqual(1);
      });
    });
  });

  describe('Stand alone minimap', function() {
    var editor, largeSample, minimap, smallSample, _ref;
    _ref = [], editor = _ref[0], minimap = _ref[1], largeSample = _ref[2], smallSample = _ref[3];
    beforeEach(function() {
      var dir;
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      editor = new TextEditor({});
      editor.setLineHeightInPixels(10);
      editor.setHeight(50);
      editor.setWidth(200);
      dir = atom.project.getDirectories()[0];
      minimap = new Minimap({
        textEditor: editor,
        standAlone: true
      });
      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString();
      return smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString();
    });
    it('has an associated editor', function() {
      return expect(minimap.getTextEditor()).toEqual(editor);
    });
    it('measures the minimap size based on the current editor content', function() {
      editor.setText(smallSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
      editor.setText(largeSample);
      return expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
    });
    it('measures the scaling factor between the editor and the minimap', function() {
      expect(minimap.getVerticalScaleFactor()).toEqual(0.5);
      return expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth());
    });
    it('measures the editor visible area size at minimap scale', function() {
      editor.setText(largeSample);
      return expect(minimap.getTextEditorScaledHeight()).toEqual(25);
    });
    it('has a visible height based on the passed-in options', function() {
      expect(minimap.getVisibleHeight()).toEqual(5);
      editor.setText(smallSample);
      expect(minimap.getVisibleHeight()).toEqual(20);
      editor.setText(largeSample);
      expect(minimap.getVisibleHeight()).toEqual(editor.getScreenLineCount() * 5);
      minimap.height = 100;
      return expect(minimap.getVisibleHeight()).toEqual(100);
    });
    it('has a visible width based on the passed-in options', function() {
      expect(minimap.getVisibleWidth()).toEqual(0);
      editor.setText(smallSample);
      expect(minimap.getVisibleWidth()).toEqual(36);
      editor.setText(largeSample);
      expect(minimap.getVisibleWidth()).toEqual(editor.getMaxScreenLineLength() * 2);
      minimap.width = 50;
      return expect(minimap.getVisibleWidth()).toEqual(50);
    });
    it('measures the available minimap scroll', function() {
      var largeLineCount;
      editor.setText(largeSample);
      largeLineCount = editor.getScreenLineCount();
      expect(minimap.getMaxScrollTop()).toEqual(0);
      expect(minimap.canScroll()).toBeFalsy();
      minimap.height = 100;
      expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 100);
      return expect(minimap.canScroll()).toBeTruthy();
    });
    it('computes the first visible row in the minimap', function() {
      return expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
    });
    it('computes the last visible row in the minimap', function() {
      editor.setText(largeSample);
      expect(minimap.getLastVisibleScreenRow()).toEqual(editor.getScreenLineCount());
      minimap.height = 100;
      return expect(minimap.getLastVisibleScreenRow()).toEqual(20);
    });
    it('does not relay scroll top events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editor.setScrollTop(100);
      return expect(scrollSpy).not.toHaveBeenCalled();
    });
    it('does not relay scroll left events from the editor', function() {
      var scrollSpy;
      editor.setText(largeSample);
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollLeft(scrollSpy);
      spyOn(editor.displayBuffer, 'getScrollWidth').andReturn(10000);
      editor.setScrollLeft(100);
      return expect(scrollSpy).not.toHaveBeenCalled();
    });
    return it('has a scroll top that is not bound to the text editor', function() {
      var scrollSpy;
      scrollSpy = jasmine.createSpy('didScroll');
      minimap.onDidChangeScrollTop(scrollSpy);
      editor.setText(largeSample);
      editor.setScrollTop(1000);
      expect(minimap.getScrollTop()).toEqual(0);
      expect(scrollSpy).not.toHaveBeenCalled();
      minimap.setScrollTop(10);
      expect(minimap.getScrollTop()).toEqual(10);
      return expect(scrollSpy).toHaveBeenCalled();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1QkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFMLENBQUE7O0FBQUEsRUFDQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFERCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSwrQ0FBQTtBQUFBLElBQUEsT0FBOEMsRUFBOUMsRUFBQyxnQkFBRCxFQUFTLGlCQUFULEVBQWtCLHFCQUFsQixFQUErQixxQkFBL0IsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsR0FBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxDQUF0QyxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsRUFBcUMsQ0FBckMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDLENBQXJDLENBRkEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxHQUFhLElBQUEsVUFBQSxDQUFXLEVBQVgsQ0FKYixDQUFBO0FBQUEsTUFLQSxNQUFNLENBQUMscUJBQVAsQ0FBNkIsRUFBN0IsQ0FMQSxDQUFBO0FBQUEsTUFNQSxNQUFNLENBQUMsU0FBUCxDQUFpQixFQUFqQixDQU5BLENBQUE7QUFBQSxNQU9BLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEdBQWhCLENBUEEsQ0FBQTtBQUFBLE1BU0EsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQVRwQyxDQUFBO0FBQUEsTUFXQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVE7QUFBQSxRQUFDLFVBQUEsRUFBWSxNQUFiO09BQVIsQ0FYZCxDQUFBO0FBQUEsTUFZQSxXQUFBLEdBQWMsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsR0FBRyxDQUFDLE9BQUosQ0FBWSxtQkFBWixDQUFoQixDQUFpRCxDQUFDLFFBQWxELENBQUEsQ0FaZCxDQUFBO2FBYUEsV0FBQSxHQUFjLEVBQUUsQ0FBQyxZQUFILENBQWdCLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWixDQUFoQixDQUE2QyxDQUFDLFFBQTlDLENBQUEsRUFkTDtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFrQkEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTthQUM3QixNQUFBLENBQU8sT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUFQLENBQStCLENBQUMsT0FBaEMsQ0FBd0MsTUFBeEMsRUFENkI7SUFBQSxDQUEvQixDQWxCQSxDQUFBO0FBQUEsSUFxQkEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTthQUMxQyxNQUFBLENBQU8sT0FBTyxDQUFDLFdBQVIsQ0FBQSxDQUFQLENBQTZCLENBQUMsU0FBOUIsQ0FBQSxFQUQwQztJQUFBLENBQTVDLENBckJBLENBQUE7QUFBQSxJQXdCQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQSxHQUFBO2FBQ3hELE1BQUEsQ0FBTyxTQUFBLEdBQUE7ZUFBRyxHQUFBLENBQUEsUUFBSDtNQUFBLENBQVAsQ0FBc0IsQ0FBQyxPQUF2QixDQUFBLEVBRHdEO0lBQUEsQ0FBMUQsQ0F4QkEsQ0FBQTtBQUFBLElBMkJBLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBLEdBQUE7QUFDbEUsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxDQURBLENBQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUhBLENBQUE7YUFJQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxFQUxrRTtJQUFBLENBQXBFLENBM0JBLENBQUE7QUFBQSxJQWtDQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsU0FBQSxHQUFBO0FBQ25FLE1BQUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxzQkFBUixDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxHQUFqRCxDQUFBLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLHdCQUFSLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELENBQUEsR0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUF2RCxFQUZtRTtJQUFBLENBQXJFLENBbENBLENBQUE7QUFBQSxJQXNDQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO0FBQzNELE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMseUJBQVIsQ0FBQSxDQUFQLENBQTJDLENBQUMsT0FBNUMsQ0FBb0QsRUFBcEQsRUFGMkQ7SUFBQSxDQUE3RCxDQXRDQSxDQUFBO0FBQUEsSUEwQ0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxVQUFBLGNBQUE7QUFBQSxNQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUFBLENBQUE7QUFBQSxNQUNBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FEakIsQ0FBQTtBQUFBLE1BR0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxlQUFSLENBQUEsQ0FBUCxDQUFpQyxDQUFDLE9BQWxDLENBQTBDLGNBQUEsR0FBaUIsQ0FBakIsR0FBcUIsRUFBL0QsQ0FIQSxDQUFBO2FBSUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBUCxDQUEyQixDQUFDLFVBQTVCLENBQUEsRUFMMEM7SUFBQSxDQUE1QyxDQTFDQSxDQUFBO0FBQUEsSUFpREEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTthQUNsRCxNQUFBLENBQU8sT0FBTyxDQUFDLHdCQUFSLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELENBQW5ELEVBRGtEO0lBQUEsQ0FBcEQsQ0FqREEsQ0FBQTtBQUFBLElBb0RBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBLEdBQUE7YUFDakQsTUFBQSxDQUFPLE9BQU8sQ0FBQyx1QkFBUixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxFQUFsRCxFQURpRDtJQUFBLENBQW5ELENBcERBLENBQUE7QUFBQSxJQXVEQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFdBQWxCLENBQVosQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsU0FBcEIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsQ0FIQSxDQUFBO2FBS0EsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQSxFQU44QztJQUFBLENBQWhELENBdkRBLENBQUE7QUFBQSxJQStEQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLFVBQUEsU0FBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFdBQWxCLENBRlosQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLG9CQUFSLENBQTZCLFNBQTdCLENBSEEsQ0FBQTtBQUFBLE1BS0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsR0FBcEIsQ0FMQSxDQUFBO2FBT0EsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQSxFQVI2QztJQUFBLENBQS9DLENBL0RBLENBQUE7QUFBQSxJQXlFQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFVBQUEsU0FBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFdBQWxCLENBRlosQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLHFCQUFSLENBQThCLFNBQTlCLENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQSxDQUFNLE1BQU0sQ0FBQyxhQUFiLEVBQTRCLGdCQUE1QixDQUE2QyxDQUFDLFNBQTlDLENBQXdELEtBQXhELENBUEEsQ0FBQTtBQUFBLE1BU0EsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsQ0FUQSxDQUFBO2FBV0EsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQSxFQVo4QztJQUFBLENBQWhELENBekVBLENBQUE7QUFBQSxJQXVGQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtlQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsSUFBeEMsRUFGUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFJQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFlBQUEsWUFBQTtBQUFBLFFBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFyQixDQUFBLENBQXBCLENBQUEsQ0FBQTtBQUFBLFFBRUEsWUFBQSxHQUFlLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBQSxDQUFBLEdBQXlDLENBQUMsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFBLEdBQXFCLENBQUEsR0FBSSxNQUFNLENBQUMsYUFBYSxDQUFDLHFCQUFyQixDQUFBLENBQTFCLENBRnhELENBQUE7ZUFJQSxNQUFBLENBQU8sT0FBTyxDQUFDLHdCQUFSLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxHQUF3QixZQUEzRSxFQUwrQjtNQUFBLENBQWpDLENBSkEsQ0FBQTtBQUFBLE1BV0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxRQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBQSxDQUFwQixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsT0FBTyxDQUFDLGVBQVIsQ0FBQSxDQUF2QyxFQUZxQztNQUFBLENBQXZDLENBWEEsQ0FBQTthQWVBLFFBQUEsQ0FBUyxtREFBVCxFQUE4RCxTQUFBLEdBQUE7QUFDNUQsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsU0FBUCxDQUFpQixFQUFqQixDQURBLENBQUE7aUJBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxJQUF4QyxFQUhTO1FBQUEsQ0FBWCxDQUFBLENBQUE7ZUFLQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQSxHQUFBO0FBQy9DLGNBQUEsWUFBQTtBQUFBLFVBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsQ0FBcEIsQ0FBQSxDQUFBO0FBQUEsVUFFQSxZQUFBLEdBQWUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFyQixDQUFBLENBQUEsR0FBeUMsQ0FBQyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQUEsR0FBcUIsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMscUJBQXJCLENBQUEsQ0FBMUIsQ0FGeEQsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QixDQUE3QixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyx3QkFBUixDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxDQUFuRCxFQU4rQztRQUFBLENBQWpELEVBTjREO01BQUEsQ0FBOUQsRUFoQjBDO0lBQUEsQ0FBNUMsQ0F2RkEsQ0FBQTtBQUFBLElBcUhBLFFBQUEsQ0FBUywyQkFBVCxFQUFzQyxTQUFBLEdBQUE7QUFDcEMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLEVBQW1DLElBQW5DLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixFQUF3RCxJQUF4RCxDQURBLENBQUE7ZUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLENBQTlDLEVBSFM7TUFBQSxDQUFYLENBQUEsQ0FBQTthQUtBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxDQURBLENBQUE7QUFBQSxRQUdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUhBLENBQUE7ZUFJQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxFQUw0QztNQUFBLENBQTlDLEVBTm9DO0lBQUEsQ0FBdEMsQ0FySEEsQ0FBQTtBQUFBLElBa0lBLFFBQUEsQ0FBUyxnRUFBVCxFQUEyRSxTQUFBLEdBQUE7QUFDekUsTUFBQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO2VBQ2hELE1BQUEsQ0FBTyxPQUFPLENBQUMsWUFBUixDQUFBLENBQVAsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxDQUF2QyxFQURnRDtNQUFBLENBQWxELENBQUEsQ0FBQTthQUdBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sT0FBTyxDQUFDLGVBQVIsQ0FBQSxDQUFQLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsQ0FBMUMsQ0FGQSxDQUFBO2VBR0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBUCxDQUEyQixDQUFDLFNBQTVCLENBQUEsRUFKMEQ7TUFBQSxDQUE1RCxFQUp5RTtJQUFBLENBQTNFLENBbElBLENBQUE7QUFBQSxJQTRJQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFVBQUEsc0RBQUE7QUFBQSxNQUFBLFFBQW9ELEVBQXBELEVBQUMseUJBQUQsRUFBaUIsdUJBQWpCLEVBQStCLDRCQUEvQixDQUFBO0FBQUEsTUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBSVQsUUFBQSxLQUFBLENBQU0sTUFBTSxDQUFDLGFBQWIsRUFBNEIsZ0JBQTVCLENBQTZDLENBQUMsU0FBOUMsQ0FBd0QsS0FBeEQsQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQixDQUhBLENBQUE7QUFBQSxRQUlBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLEdBQXJCLENBSkEsQ0FBQTtBQUFBLFFBTUEsY0FBQSxHQUFpQixNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQU5qQixDQUFBO0FBQUEsUUFPQSxZQUFBLEdBQWUsY0FBQSxHQUFpQixNQUFNLENBQUMscUJBQVAsQ0FBQSxDQVBoQyxDQUFBO2VBUUEsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEdBQXdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBQSxFQVpuQztNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFnQkEsRUFBQSxDQUFHLDREQUFILEVBQWlFLFNBQUEsR0FBQTtBQUMvRCxRQUFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsNEJBQVIsQ0FBQSxDQUFQLENBQThDLENBQUMsT0FBL0MsQ0FBdUQsR0FBdkQsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyw2QkFBUixDQUFBLENBQVAsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxHQUFBLEdBQU0sT0FBTyxDQUFDLHdCQUFSLENBQUEsQ0FBOUQsRUFGK0Q7TUFBQSxDQUFqRSxDQWhCQSxDQUFBO0FBQUEsTUFvQkEsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtlQUNoRSxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsaUJBQUEsR0FBb0IsT0FBTyxDQUFDLGVBQVIsQ0FBQSxDQUEzRCxFQURnRTtNQUFBLENBQWxFLENBcEJBLENBQUE7QUFBQSxNQXVCQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO2VBQ2xELE1BQUEsQ0FBTyxPQUFPLENBQUMsd0JBQVIsQ0FBQSxDQUFQLENBQTBDLENBQUMsT0FBM0MsQ0FBbUQsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFYLENBQW5ELEVBRGtEO01BQUEsQ0FBcEQsQ0F2QkEsQ0FBQTtBQUFBLE1BMEJBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBLEdBQUE7ZUFDakQsTUFBQSxDQUFPLE9BQU8sQ0FBQyx1QkFBUixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxHQUFsRCxFQURpRDtNQUFBLENBQW5ELENBMUJBLENBQUE7YUE2QkEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBQSxDQUFwQixDQUFBLENBQUE7aUJBQ0EsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEdBQXdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBQSxFQUZuQztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFJQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsU0FBQSxHQUFBO2lCQUNuRSxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsT0FBTyxDQUFDLGVBQVIsQ0FBQSxDQUF2QyxFQURtRTtRQUFBLENBQXJFLENBSkEsQ0FBQTtBQUFBLFFBT0EsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtpQkFDbEQsTUFBQSxDQUFPLE9BQU8sQ0FBQyx3QkFBUixDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxjQUFBLEdBQWlCLEVBQXBFLEVBRGtEO1FBQUEsQ0FBcEQsQ0FQQSxDQUFBO2VBVUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtpQkFDakQsTUFBQSxDQUFPLE9BQU8sQ0FBQyx1QkFBUixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxjQUFsRCxFQURpRDtRQUFBLENBQW5ELEVBWDZCO01BQUEsQ0FBL0IsRUE5QnNDO0lBQUEsQ0FBeEMsQ0E1SUEsQ0FBQTtBQUFBLElBd0xBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsTUFBQSxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFlBQUEsR0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLENBQU4sQ0FBQTtBQUFBLFFBQ0EsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsR0FBckIsQ0FEQSxDQUFBO0FBQUEsUUFHQSxPQUFPLENBQUMsT0FBUixDQUFBLENBSEEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxHQUFQLENBQVcsQ0FBQyxnQkFBWixDQUFBLEVBTjhCO01BQUEsQ0FBaEMsQ0FBQSxDQUFBO2FBUUEsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxXQUFSLENBQUEsQ0FBUCxDQUE2QixDQUFDLFVBQTlCLENBQUEsRUFGeUM7TUFBQSxDQUEzQyxFQVQrQjtJQUFBLENBQWpDLENBeExBLENBQUE7QUFBQSxJQXFNQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO2FBQ3JDLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxLQUFBLENBQU0sT0FBTixFQUFjLFNBQWQsQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsT0FBUCxDQUFBLENBRkEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxPQUFPLENBQUMsT0FBZixDQUF1QixDQUFDLGdCQUF4QixDQUFBLEVBTHVCO01BQUEsQ0FBekIsRUFEcUM7SUFBQSxDQUF2QyxDQXJNQSxDQUFBO0FBQUEsSUFxTkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLG9DQUFBO0FBQUEsTUFBQSxRQUFrQyxFQUFsQyxFQUFDLGlCQUFELEVBQVMscUJBQVQsRUFBcUIsb0JBQXJCLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUFBLENBQUE7QUFBQSxRQUVBLFNBQUEsR0FBWSxPQUFPLENBQUMsU0FBUixDQUFrQixXQUFsQixDQUZaLENBQUE7QUFBQSxRQUdBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBSEEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxHQUFTLE9BQU8sQ0FBQyxlQUFSLENBQXdCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBQXhCLENBTFQsQ0FBQTtlQU1BLFVBQUEsR0FBYSxPQUFPLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQjtBQUFBLFVBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxVQUFtQixPQUFBLEVBQU8sT0FBMUI7U0FBL0IsRUFQSjtNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFXQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQSxHQUFBO2VBQzlDLE1BQUEsQ0FBTyxPQUFPLENBQUMscUJBQXNCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBckMsQ0FBZ0QsQ0FBQyxXQUFqRCxDQUFBLEVBRDhDO01BQUEsQ0FBaEQsQ0FYQSxDQUFBO0FBQUEsTUFjQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQSxHQUFBO0FBQ3ZELFFBQUEsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFsQyxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQWpELENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFsQyxDQUFzQyxDQUFDLE9BQXZDLENBQStDLENBQS9DLEVBSHVEO01BQUEsQ0FBekQsQ0FkQSxDQUFBO0FBQUEsTUFtQkEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxjQUFBLGVBQUE7QUFBQSxVQUFBLGVBQUEsR0FBa0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsbUJBQWxCLENBQWxCLENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLGVBQW5CLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLENBQUQsRUFBRyxFQUFILENBQVIsQ0FBdEIsQ0FGQSxDQUFBO2lCQUlBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxNQUF0QixHQUErQixFQUFsQztVQUFBLENBQVQsRUFMUztRQUFBLENBQVgsQ0FBQSxDQUFBO2VBT0EsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxVQUFBLE1BQUEsQ0FBTyxTQUFQLENBQWlCLENBQUMsZ0JBQWxCLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBbEMsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxDQUFqRCxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLFNBQVMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEdBQWxDLENBQXNDLENBQUMsT0FBdkMsQ0FBK0MsQ0FBL0MsRUFINkQ7UUFBQSxDQUEvRCxFQVJ3QztNQUFBLENBQTFDLENBbkJBLENBQUE7QUFBQSxNQWdDQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxNQUFNLENBQUMsT0FBUCxDQUFBLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtpQkFDaEQsTUFBQSxDQUFPLE9BQU8sQ0FBQyxxQkFBc0IsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUFyQyxDQUFnRCxDQUFDLGFBQWpELENBQUEsRUFEZ0Q7UUFBQSxDQUFsRCxDQUhBLENBQUE7ZUFNQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQSxHQUFBO0FBQ3ZELFVBQUEsTUFBQSxDQUFPLFNBQVMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWxDLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBakQsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFsQyxDQUFzQyxDQUFDLE9BQXZDLENBQStDLENBQS9DLEVBRnVEO1FBQUEsQ0FBekQsRUFQZ0M7TUFBQSxDQUFsQyxDQWhDQSxDQUFBO0FBQUEsTUEyQ0EsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsVUFBVSxDQUFDLE9BQVgsQ0FBQSxFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUdBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBLEdBQUE7aUJBQ2hELE1BQUEsQ0FBTyxPQUFPLENBQUMscUJBQXNCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBckMsQ0FBZ0QsQ0FBQyxhQUFqRCxDQUFBLEVBRGdEO1FBQUEsQ0FBbEQsQ0FIQSxDQUFBO2VBTUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTtBQUN2RCxVQUFBLE1BQUEsQ0FBTyxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFsQyxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQWpELENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBbEMsQ0FBc0MsQ0FBQyxPQUF2QyxDQUErQyxDQUEvQyxFQUZ1RDtRQUFBLENBQXpELEVBUG9DO01BQUEsQ0FBdEMsQ0EzQ0EsQ0FBQTtBQUFBLE1Bc0RBLFFBQUEsQ0FBUywrQ0FBVCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULE9BQU8sQ0FBQyw2QkFBUixDQUFzQyxNQUF0QyxFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUdBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBLEdBQUE7aUJBQ2hELE1BQUEsQ0FBTyxPQUFPLENBQUMscUJBQXNCLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBckMsQ0FBZ0QsQ0FBQyxhQUFqRCxDQUFBLEVBRGdEO1FBQUEsQ0FBbEQsQ0FIQSxDQUFBO2VBTUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTtBQUN2RCxVQUFBLE1BQUEsQ0FBTyxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFsQyxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQWpELENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsR0FBbEMsQ0FBc0MsQ0FBQyxPQUF2QyxDQUErQyxDQUEvQyxFQUZ1RDtRQUFBLENBQXpELEVBUHdEO01BQUEsQ0FBMUQsQ0F0REEsQ0FBQTthQWlFQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxPQUFPLENBQUMsT0FBUixDQUFBLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxVQUFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBZixDQUErQixDQUFDLE9BQWhDLENBQXdDLEVBQXhDLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLHFCQUFmLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsRUFBOUMsRUFGaUQ7UUFBQSxDQUFuRCxDQUhBLENBQUE7ZUFPQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLFVBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxlQUFQLENBQXVCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBQXZCLENBQVQsQ0FBQTtBQUFBLFVBQ0EsVUFBQSxHQUFhLE9BQU8sQ0FBQyxjQUFSLENBQXVCLE1BQXZCLEVBQStCO0FBQUEsWUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLFlBQW1CLE9BQUEsRUFBTyxPQUExQjtXQUEvQixDQURiLENBQUE7aUJBR0EsTUFBQSxDQUFPLFVBQVAsQ0FBa0IsQ0FBQyxhQUFuQixDQUFBLEVBSjZDO1FBQUEsQ0FBL0MsRUFSaUM7TUFBQSxDQUFuQyxFQWxFMkI7SUFBQSxDQUE3QixDQXJOQSxDQUFBO1dBcVNBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBLEdBQUE7QUFDdEMsVUFBQSxXQUFBO0FBQUEsTUFBQyxjQUFlLEtBQWhCLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLGdCQUFBO0FBQUEsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsUUFFQSxnQkFBQSxHQUFtQixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDakIsY0FBQSxrQkFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxlQUFSLENBQXdCLEtBQXhCLENBQVQsQ0FBQTtpQkFDQSxVQUFBLEdBQWEsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsTUFBdkIsRUFBK0I7QUFBQSxZQUFDLE1BQUEsSUFBRDtXQUEvQixFQUZJO1FBQUEsQ0FGbkIsQ0FBQTtBQUFBLFFBTUEsZ0JBQUEsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVQsQ0FBOUIsQ0FOQSxDQUFBO0FBQUEsUUFPQSxnQkFBQSxDQUFpQixXQUFqQixFQUE4QixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUE5QixDQVBBLENBQUE7QUFBQSxRQVFBLGdCQUFBLENBQWlCLGdCQUFqQixFQUFtQyxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBVCxDQUFuQyxDQVJBLENBQUE7QUFBQSxRQVNBLGdCQUFBLENBQWlCLE1BQWpCLEVBQXlCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFSLENBQXpCLENBVEEsQ0FBQTtBQUFBLFFBVUEsZ0JBQUEsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBQyxDQUFDLEVBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLEVBQUQsRUFBSSxDQUFKLENBQVQsQ0FBekIsQ0FWQSxDQUFBO0FBQUEsUUFXQSxnQkFBQSxDQUFpQixpQkFBakIsRUFBb0MsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLEVBQUQsRUFBSSxDQUFKLENBQVIsQ0FBcEMsQ0FYQSxDQUFBO2VBYUEsV0FBQSxHQUFjLE9BQU8sQ0FBQyx5QkFBUixDQUFrQyxDQUFsQyxFQUFxQyxFQUFyQyxFQWRMO01BQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxNQWtCQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO2VBQzNELE1BQUEsQ0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLFdBQVosQ0FBd0IsQ0FBQyxJQUF6QixDQUFBLENBQVAsQ0FBdUMsQ0FBQyxPQUF4QyxDQUFnRCxDQUFDLGdCQUFELEVBQW1CLGlCQUFuQixFQUFzQyxNQUF0QyxDQUFoRCxFQUQyRDtNQUFBLENBQTdELENBbEJBLENBQUE7QUFBQSxNQXFCQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELFFBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksV0FBWSxDQUFBLGdCQUFBLENBQXhCLENBQTBDLENBQUMsSUFBM0MsQ0FBQSxDQUFQLENBQ0EsQ0FBQyxPQURELENBQ1MsbUJBQW1CLENBQUMsS0FBcEIsQ0FBMEIsR0FBMUIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBLENBRFQsQ0FBQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxXQUFZLENBQUEsTUFBQSxDQUF4QixDQUFnQyxDQUFDLElBQWpDLENBQUEsQ0FBUCxDQUNBLENBQUMsT0FERCxDQUNTLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZixDQUFtQixDQUFDLElBQXBCLENBQUEsQ0FEVCxDQUhBLENBQUE7ZUFNQSxNQUFBLENBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxXQUFZLENBQUEsaUJBQUEsQ0FBeEIsQ0FBMkMsQ0FBQyxJQUE1QyxDQUFBLENBQVAsQ0FDQSxDQUFDLE9BREQsQ0FDUyx3QkFBd0IsQ0FBQyxLQUF6QixDQUErQixHQUEvQixDQUFtQyxDQUFDLElBQXBDLENBQUEsQ0FEVCxFQVB3RDtNQUFBLENBQTFELENBckJBLENBQUE7YUErQkEsRUFBQSxDQUFHLHNFQUFILEVBQTJFLFNBQUEsR0FBQTtBQUN6RSxRQUFBLE1BQUEsQ0FBTyxXQUFZLENBQUEsZ0JBQUEsQ0FBa0IsQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUExQyxDQUFpRCxDQUFDLE9BQWxELENBQTBELENBQTFELENBQUEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLFdBQVksQ0FBQSxNQUFBLENBQVEsQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFoQyxDQUF1QyxDQUFDLE9BQXhDLENBQWdELENBQWhELENBRkEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxXQUFZLENBQUEsaUJBQUEsQ0FBbUIsQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUEzQyxDQUFrRCxDQUFDLE9BQW5ELENBQTJELENBQTNELEVBTHlFO01BQUEsQ0FBM0UsRUFoQ3NDO0lBQUEsQ0FBeEMsRUF0U2tCO0VBQUEsQ0FBcEIsQ0FKQSxDQUFBOztBQUFBLEVBaVdBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsUUFBQSwrQ0FBQTtBQUFBLElBQUEsT0FBOEMsRUFBOUMsRUFBQyxnQkFBRCxFQUFTLGlCQUFULEVBQWtCLHFCQUFsQixFQUErQixxQkFBL0IsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsR0FBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxDQUF0QyxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsRUFBcUMsQ0FBckMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDLENBQXJDLENBRkEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxHQUFhLElBQUEsVUFBQSxDQUFXLEVBQVgsQ0FKYixDQUFBO0FBQUEsTUFLQSxNQUFNLENBQUMscUJBQVAsQ0FBNkIsRUFBN0IsQ0FMQSxDQUFBO0FBQUEsTUFNQSxNQUFNLENBQUMsU0FBUCxDQUFpQixFQUFqQixDQU5BLENBQUE7QUFBQSxNQU9BLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEdBQWhCLENBUEEsQ0FBQTtBQUFBLE1BU0EsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQVRwQyxDQUFBO0FBQUEsTUFXQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVE7QUFBQSxRQUNwQixVQUFBLEVBQVksTUFEUTtBQUFBLFFBRXBCLFVBQUEsRUFBWSxJQUZRO09BQVIsQ0FYZCxDQUFBO0FBQUEsTUFnQkEsV0FBQSxHQUFjLEVBQUUsQ0FBQyxZQUFILENBQWdCLEdBQUcsQ0FBQyxPQUFKLENBQVksbUJBQVosQ0FBaEIsQ0FBaUQsQ0FBQyxRQUFsRCxDQUFBLENBaEJkLENBQUE7YUFpQkEsV0FBQSxHQUFjLEVBQUUsQ0FBQyxZQUFILENBQWdCLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWixDQUFoQixDQUE2QyxDQUFDLFFBQTlDLENBQUEsRUFsQkw7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBc0JBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7YUFDN0IsTUFBQSxDQUFPLE9BQU8sQ0FBQyxhQUFSLENBQUEsQ0FBUCxDQUErQixDQUFDLE9BQWhDLENBQXdDLE1BQXhDLEVBRDZCO0lBQUEsQ0FBL0IsQ0F0QkEsQ0FBQTtBQUFBLElBeUJBLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBLEdBQUE7QUFDbEUsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxDQURBLENBQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUhBLENBQUE7YUFJQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBQSxHQUE4QixDQUFsRSxFQUxrRTtJQUFBLENBQXBFLENBekJBLENBQUE7QUFBQSxJQWdDQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsU0FBQSxHQUFBO0FBQ25FLE1BQUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxzQkFBUixDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxHQUFqRCxDQUFBLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLHdCQUFSLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELENBQUEsR0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUF2RCxFQUZtRTtJQUFBLENBQXJFLENBaENBLENBQUE7QUFBQSxJQW9DQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQSxHQUFBO0FBQzNELE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMseUJBQVIsQ0FBQSxDQUFQLENBQTJDLENBQUMsT0FBNUMsQ0FBb0QsRUFBcEQsRUFGMkQ7SUFBQSxDQUE3RCxDQXBDQSxDQUFBO0FBQUEsSUF3Q0EsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtBQUN4RCxNQUFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZ0JBQVIsQ0FBQSxDQUFQLENBQWtDLENBQUMsT0FBbkMsQ0FBMkMsQ0FBM0MsQ0FBQSxDQUFBO0FBQUEsTUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FGQSxDQUFBO0FBQUEsTUFHQSxNQUFBLENBQU8sT0FBTyxDQUFDLGdCQUFSLENBQUEsQ0FBUCxDQUFrQyxDQUFDLE9BQW5DLENBQTJDLEVBQTNDLENBSEEsQ0FBQTtBQUFBLE1BS0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBTEEsQ0FBQTtBQUFBLE1BTUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxnQkFBUixDQUFBLENBQVAsQ0FBa0MsQ0FBQyxPQUFuQyxDQUEyQyxNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUFBLEdBQThCLENBQXpFLENBTkEsQ0FBQTtBQUFBLE1BUUEsT0FBTyxDQUFDLE1BQVIsR0FBaUIsR0FSakIsQ0FBQTthQVNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZ0JBQVIsQ0FBQSxDQUFQLENBQWtDLENBQUMsT0FBbkMsQ0FBMkMsR0FBM0MsRUFWd0Q7SUFBQSxDQUExRCxDQXhDQSxDQUFBO0FBQUEsSUFvREEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTtBQUN2RCxNQUFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBUixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxDQUExQyxDQUFBLENBQUE7QUFBQSxNQUVBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUZBLENBQUE7QUFBQSxNQUdBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBUixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxFQUExQyxDQUhBLENBQUE7QUFBQSxNQUtBLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZixDQUxBLENBQUE7QUFBQSxNQU1BLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBUixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUFBLEdBQWtDLENBQTVFLENBTkEsQ0FBQTtBQUFBLE1BUUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsRUFSaEIsQ0FBQTthQVNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBUixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxFQUExQyxFQVZ1RDtJQUFBLENBQXpELENBcERBLENBQUE7QUFBQSxJQWdFQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLFVBQUEsY0FBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsY0FBQSxHQUFpQixNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQURqQixDQUFBO0FBQUEsTUFHQSxNQUFBLENBQU8sT0FBTyxDQUFDLGVBQVIsQ0FBQSxDQUFQLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsQ0FBMUMsQ0FIQSxDQUFBO0FBQUEsTUFJQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQUFQLENBQTJCLENBQUMsU0FBNUIsQ0FBQSxDQUpBLENBQUE7QUFBQSxNQU1BLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEdBTmpCLENBQUE7QUFBQSxNQVFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsZUFBUixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxjQUFBLEdBQWlCLENBQWpCLEdBQXFCLEdBQS9ELENBUkEsQ0FBQTthQVNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBUixDQUFBLENBQVAsQ0FBMkIsQ0FBQyxVQUE1QixDQUFBLEVBVjBDO0lBQUEsQ0FBNUMsQ0FoRUEsQ0FBQTtBQUFBLElBNEVBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBLEdBQUE7YUFDbEQsTUFBQSxDQUFPLE9BQU8sQ0FBQyx3QkFBUixDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxDQUFuRCxFQURrRDtJQUFBLENBQXBELENBNUVBLENBQUE7QUFBQSxJQStFQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyx1QkFBUixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUFsRCxDQUZBLENBQUE7QUFBQSxNQUlBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEdBSmpCLENBQUE7YUFLQSxNQUFBLENBQU8sT0FBTyxDQUFDLHVCQUFSLENBQUEsQ0FBUCxDQUF5QyxDQUFDLE9BQTFDLENBQWtELEVBQWxELEVBTmlEO0lBQUEsQ0FBbkQsQ0EvRUEsQ0FBQTtBQUFBLElBdUZBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsVUFBQSxTQUFBO0FBQUEsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FBQSxDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksT0FBTyxDQUFDLFNBQVIsQ0FBa0IsV0FBbEIsQ0FGWixDQUFBO0FBQUEsTUFHQSxPQUFPLENBQUMsb0JBQVIsQ0FBNkIsU0FBN0IsQ0FIQSxDQUFBO0FBQUEsTUFLQSxNQUFNLENBQUMsWUFBUCxDQUFvQixHQUFwQixDQUxBLENBQUE7YUFPQSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLEdBQUcsQ0FBQyxnQkFBdEIsQ0FBQSxFQVJxRDtJQUFBLENBQXZELENBdkZBLENBQUE7QUFBQSxJQWlHQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFVBQUEsU0FBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxXQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFdBQWxCLENBRlosQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLHFCQUFSLENBQThCLFNBQTlCLENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQSxDQUFNLE1BQU0sQ0FBQyxhQUFiLEVBQTRCLGdCQUE1QixDQUE2QyxDQUFDLFNBQTlDLENBQXdELEtBQXhELENBUEEsQ0FBQTtBQUFBLE1BU0EsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsQ0FUQSxDQUFBO2FBV0EsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxHQUFHLENBQUMsZ0JBQXRCLENBQUEsRUFac0Q7SUFBQSxDQUF4RCxDQWpHQSxDQUFBO1dBK0dBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksT0FBTyxDQUFDLFNBQVIsQ0FBa0IsV0FBbEIsQ0FBWixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsb0JBQVIsQ0FBNkIsU0FBN0IsQ0FEQSxDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWYsQ0FIQSxDQUFBO0FBQUEsTUFJQSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQixDQUpBLENBQUE7QUFBQSxNQU1BLE1BQUEsQ0FBTyxPQUFPLENBQUMsWUFBUixDQUFBLENBQVAsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxDQUF2QyxDQU5BLENBQUE7QUFBQSxNQU9BLE1BQUEsQ0FBTyxTQUFQLENBQWlCLENBQUMsR0FBRyxDQUFDLGdCQUF0QixDQUFBLENBUEEsQ0FBQTtBQUFBLE1BU0EsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsRUFBckIsQ0FUQSxDQUFBO0FBQUEsTUFXQSxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsRUFBdkMsQ0FYQSxDQUFBO2FBWUEsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQSxFQWIwRDtJQUFBLENBQTVELEVBaEg4QjtFQUFBLENBQWhDLENBaldBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/minimap/spec/minimap-spec.coffee
