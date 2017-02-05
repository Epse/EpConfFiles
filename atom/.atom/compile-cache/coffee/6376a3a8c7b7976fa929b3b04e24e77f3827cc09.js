(function() {
  var CSON, defs;

  CSON = require('season');

  defs = CSON.readFileSync(__dirname + "/../snippets/language-haskell.cson");

  describe("Snippets", function() {
    var Snippets, editor, editorElement, ref, sanitize, simulateTabKeyEvent, universalTests;
    ref = [], editorElement = ref[0], editor = ref[1], Snippets = ref[2];
    simulateTabKeyEvent = function(arg) {
      var event, shift;
      shift = (arg != null ? arg : {}).shift;
      event = atom.keymaps.constructor.buildKeydownEvent('tab', {
        shift: shift,
        target: editorElement
      });
      return atom.keymaps.handleKeyboardEvent(event);
    };
    sanitize = function(body) {
      var flatten, parsed, parser;
      parser = Snippets.getBodyParser();
      flatten = function(obj) {
        if (typeof obj === "string") {
          return obj;
        } else {
          return obj.content.map(flatten).join('');
        }
      };
      parsed = parser.parse(body).map(flatten).join('').replace(/\t/g, ' '.repeat(editor.getTabLength()));
      return parsed;
    };
    universalTests = function() {
      it('triggers snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers non-comment snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell:not(.comment)'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers comment snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.comment'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText("-- " + prefix);
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe("-- " + (sanitize(body).trim())));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      it('triggers empty-list snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.constant.language.empty-list'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix + "]");
            editor.getLastCursor().moveLeft();
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe((sanitize(body).trim()) + "]"));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
      return it('triggers type snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source .haskell.meta.type'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText("data Data = Constr " + prefix);
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe("data Data = Constr " + (sanitize(body).trim())));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("snippets");
      });
      runs(function() {
        return Snippets = atom.packages.getActivePackage('snippets').mainModule;
      });
      return waitsForPromise(function() {
        return new Promise(function(resolve) {
          return Snippets.onDidLoadSnippets(function() {
            return resolve();
          });
        });
      });
    });
    describe('haskell', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.hs');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    describe('c2hs', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.chs');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    describe('hsc2hs', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.hsc');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return universalTests();
    });
    return describe('cabal', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.cabal');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      return it('triggers snippets', function() {
        var body, name, prefix;
        return expect(((function() {
          var ref1, ref2, results;
          ref1 = defs['.source.cabal'];
          results = [];
          for (name in ref1) {
            ref2 = ref1[name], prefix = ref2.prefix, body = ref2.body;
            editor.setText("");
            editor.insertText(prefix);
            simulateTabKeyEvent();
            results.push(expect(editor.getText().trim()).toBe(sanitize(body).trim()));
          }
          return results;
        })()).length).toBeGreaterThan(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9zbmlwcGV0cy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVQLElBQUEsR0FBTyxJQUFJLENBQUMsWUFBTCxDQUFxQixTQUFELEdBQVcsb0NBQS9COztFQUVQLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQW9DLEVBQXBDLEVBQUMsc0JBQUQsRUFBZ0IsZUFBaEIsRUFBd0I7SUFFeEIsbUJBQUEsR0FBc0IsU0FBQyxHQUFEO0FBQ3BCLFVBQUE7TUFEc0IsdUJBQUQsTUFBVTtNQUMvQixLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsaUJBQXpCLENBQTJDLEtBQTNDLEVBQWtEO1FBQUMsT0FBQSxLQUFEO1FBQVEsTUFBQSxFQUFRLGFBQWhCO09BQWxEO2FBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBYixDQUFpQyxLQUFqQztJQUZvQjtJQUl0QixRQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1QsVUFBQTtNQUFBLE1BQUEsR0FBUyxRQUFRLENBQUMsYUFBVCxDQUFBO01BQ1QsT0FBQSxHQUFVLFNBQUMsR0FBRDtRQUNSLElBQUcsT0FBTyxHQUFQLEtBQWUsUUFBbEI7QUFDRSxpQkFBTyxJQURUO1NBQUEsTUFBQTtBQUdFLGlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBWixDQUFnQixPQUFoQixDQUF3QixDQUFDLElBQXpCLENBQThCLEVBQTlCLEVBSFQ7O01BRFE7TUFLVixNQUFBLEdBQ0UsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFiLENBQ0EsQ0FBQyxHQURELENBQ0ssT0FETCxDQUVBLENBQUMsSUFGRCxDQUVNLEVBRk4s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QUFtQixNQUFuQjtRQUZiLENBQUw7TUFIUyxDQUFYO2FBTUEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUE7QUFDdEIsWUFBQTtlQUFBLE1BQUEsQ0FBTzs7QUFBQztBQUFBO2VBQUEsWUFBQTsrQkFBVyxzQkFBUTtZQUN6QixNQUFNLENBQUMsT0FBUCxDQUFlLEVBQWY7WUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQjtZQUNBLG1CQUFBLENBQUE7eUJBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBLENBQVAsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxRQUFBLENBQVMsSUFBVCxDQUFjLENBQUMsSUFBZixDQUFBLENBQXJDO0FBSk07O1lBQUQsQ0FLTixDQUFDLE1BTEYsQ0FLUyxDQUFDLGVBTFYsQ0FLMEIsQ0FMMUI7TUFEc0IsQ0FBeEI7SUFQZ0IsQ0FBbEI7RUEvRm1CLENBQXJCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJDU09OID0gcmVxdWlyZSAnc2Vhc29uJ1xuXG5kZWZzID0gQ1NPTi5yZWFkRmlsZVN5bmMoXCIje19fZGlybmFtZX0vLi4vc25pcHBldHMvbGFuZ3VhZ2UtaGFza2VsbC5jc29uXCIpXG5cbmRlc2NyaWJlIFwiU25pcHBldHNcIiwgLT5cbiAgW2VkaXRvckVsZW1lbnQsIGVkaXRvciwgU25pcHBldHNdID0gW11cblxuICBzaW11bGF0ZVRhYktleUV2ZW50ID0gKHtzaGlmdH0gPSB7fSkgLT5cbiAgICBldmVudCA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvci5idWlsZEtleWRvd25FdmVudCgndGFiJywge3NoaWZ0LCB0YXJnZXQ6IGVkaXRvckVsZW1lbnR9KVxuICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50KVxuXG4gIHNhbml0aXplID0gKGJvZHkpIC0+XG4gICAgcGFyc2VyID0gU25pcHBldHMuZ2V0Qm9keVBhcnNlcigpXG4gICAgZmxhdHRlbiA9IChvYmopIC0+XG4gICAgICBpZiB0eXBlb2Yob2JqKSBpcyBcInN0cmluZ1wiXG4gICAgICAgIHJldHVybiBvYmpcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9iai5jb250ZW50Lm1hcChmbGF0dGVuKS5qb2luKCcnKVxuICAgIHBhcnNlZCA9XG4gICAgICBwYXJzZXIucGFyc2UoYm9keSlcbiAgICAgIC5tYXAoZmxhdHRlbilcbiAgICAgIC5qb2luKCcnKVxuICAgICAgLnJlcGxhY2UgL1xcdC9nLCAnICcucmVwZWF0KGVkaXRvci5nZXRUYWJMZW5ndGgoKSlcbiAgICByZXR1cm4gcGFyc2VkXG5cbiAgdW5pdmVyc2FsVGVzdHMgPSAtPlxuICAgIGl0ICd0cmlnZ2VycyBzbmlwcGV0cycsIC0+XG4gICAgICBleHBlY3QoKGZvciBuYW1lLCB7cHJlZml4LCBib2R5fSBvZiBkZWZzWycuc291cmNlIC5oYXNrZWxsJ11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQocHJlZml4KVxuICAgICAgICBzaW11bGF0ZVRhYktleUV2ZW50KClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIHNhbml0aXplKGJvZHkpLnRyaW0oKVxuICAgICAgKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4gICAgaXQgJ3RyaWdnZXJzIG5vbi1jb21tZW50IHNuaXBwZXRzJywgLT5cbiAgICAgIGV4cGVjdCgoZm9yIG5hbWUsIHtwcmVmaXgsIGJvZHl9IG9mIGRlZnNbJy5zb3VyY2UgLmhhc2tlbGw6bm90KC5jb21tZW50KSddXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KFwiXCIpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHByZWZpeClcbiAgICAgICAgc2ltdWxhdGVUYWJLZXlFdmVudCgpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKSkudG9CZSBzYW5pdGl6ZShib2R5KS50cmltKClcbiAgICAgICkubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4gMFxuICAgIGl0ICd0cmlnZ2VycyBjb21tZW50IHNuaXBwZXRzJywgLT5cbiAgICAgIGV4cGVjdCgoZm9yIG5hbWUsIHtwcmVmaXgsIGJvZHl9IG9mIGRlZnNbJy5zb3VyY2UgLmhhc2tlbGwuY29tbWVudCddXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KFwiXCIpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiLS0gI3twcmVmaXh9XCIpXG4gICAgICAgIHNpbXVsYXRlVGFiS2V5RXZlbnQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS50cmltKCkpLnRvQmUgXCItLSAje3Nhbml0aXplKGJvZHkpLnRyaW0oKX1cIlxuICAgICAgKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4gICAgaXQgJ3RyaWdnZXJzIGVtcHR5LWxpc3Qgc25pcHBldHMnLCAtPlxuICAgICAgZXhwZWN0KChmb3IgbmFtZSwge3ByZWZpeCwgYm9keX0gb2YgZGVmc1snLnNvdXJjZSAuaGFza2VsbC5jb25zdGFudC5sYW5ndWFnZS5lbXB0eS1saXN0J11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIje3ByZWZpeH1dXCIpXG4gICAgICAgIGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkubW92ZUxlZnQoKVxuICAgICAgICBzaW11bGF0ZVRhYktleUV2ZW50KClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIFwiI3tzYW5pdGl6ZShib2R5KS50cmltKCl9XVwiXG4gICAgICApLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICBpdCAndHJpZ2dlcnMgdHlwZSBzbmlwcGV0cycsIC0+XG4gICAgICBleHBlY3QoKGZvciBuYW1lLCB7cHJlZml4LCBib2R5fSBvZiBkZWZzWycuc291cmNlIC5oYXNrZWxsLm1ldGEudHlwZSddXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KFwiXCIpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiZGF0YSBEYXRhID0gQ29uc3RyICN7cHJlZml4fVwiKVxuICAgICAgICBzaW11bGF0ZVRhYktleUV2ZW50KClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIFwiZGF0YSBEYXRhID0gQ29uc3RyICN7c2FuaXRpemUoYm9keSkudHJpbSgpfVwiXG4gICAgICApLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcImxhbmd1YWdlLWhhc2tlbGxcIilcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwic25pcHBldHNcIilcbiAgICBydW5zIC0+XG4gICAgICBTbmlwcGV0cyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnc25pcHBldHMnKS5tYWluTW9kdWxlXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICAgICAgU25pcHBldHMub25EaWRMb2FkU25pcHBldHMgLT4gcmVzb2x2ZSgpXG5cbiAgZGVzY3JpYmUgJ2hhc2tlbGwnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuaHMnKVxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgdW5pdmVyc2FsVGVzdHMoKVxuICBkZXNjcmliZSAnYzJocycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5jaHMnKVxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgdW5pdmVyc2FsVGVzdHMoKVxuICBkZXNjcmliZSAnaHNjMmhzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmhzYycpXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICB1bml2ZXJzYWxUZXN0cygpXG5cbiAgZGVzY3JpYmUgJ2NhYmFsJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmNhYmFsJylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGl0ICd0cmlnZ2VycyBzbmlwcGV0cycsIC0+XG4gICAgICBleHBlY3QoKGZvciBuYW1lLCB7cHJlZml4LCBib2R5fSBvZiBkZWZzWycuc291cmNlLmNhYmFsJ11cbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQocHJlZml4KVxuICAgICAgICBzaW11bGF0ZVRhYktleUV2ZW50KClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIHNhbml0aXplKGJvZHkpLnRyaW0oKVxuICAgICAgKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbiAwXG4iXX0=
