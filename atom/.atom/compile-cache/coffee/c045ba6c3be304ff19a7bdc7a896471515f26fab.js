(function() {
  var helper;

  helper = require("../../lib/helpers/template-helper");

  describe("templateHelper", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.workspace.open("front-matter.markdown");
      });
    });
    describe(".getFrontMatterDate", function() {
      return it("get date + time to string", function() {
        var date;
        date = helper.getFrontMatterDate(helper.getDateTime());
        return expect(date).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
      });
    });
    describe(".parseFrontMatterDate", function() {
      return it("parse date + time to hash", function() {
        var dateTime, expected, key, value, _i, _len, _results;
        atom.config.set("markdown-writer.frontMatterDate", "{year}-{month}-{day} {hour}:{minute}");
        dateTime = helper.parseFrontMatterDate("2016-01-03 19:11");
        expected = {
          year: "2016",
          month: "01",
          day: "03",
          hour: "19",
          minute: "11"
        };
        _results = [];
        for (value = _i = 0, _len = expected.length; _i < _len; value = ++_i) {
          key = expected[value];
          _results.push(expect(dateTime[key]).toEqual(value));
        }
        return _results;
      });
    });
    return describe(".getFileSlug", function() {
      it("get title slug", function() {
        var fixture, slug;
        slug = "hello-world";
        fixture = "abc/hello-world.markdown";
        expect(helper.getFileSlug(fixture)).toEqual(slug);
        fixture = "abc/2014-02-12-hello-world.markdown";
        return expect(helper.getFileSlug(fixture)).toEqual(slug);
      });
      it("get title slug", function() {
        var fixture, slug;
        atom.config.set("markdown-writer.newPostFileName", "{slug}-{day}-{month}-{year}{extension}");
        slug = "hello-world";
        fixture = "abc/hello-world-02-12-2014.markdown";
        return expect(helper.getFileSlug(fixture)).toEqual(slug);
      });
      return it("get empty slug", function() {
        expect(helper.getFileSlug(void 0)).toEqual("");
        return expect(helper.getFileSlug("")).toEqual("");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy9oZWxwZXJzL3RlbXBsYXRlLWhlbHBlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxNQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUixDQUFULENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHVCQUFwQixFQUFIO01BQUEsQ0FBaEIsRUFEUztJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsSUFHQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO2FBQzlCLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGtCQUFQLENBQTBCLE1BQU0sQ0FBQyxXQUFQLENBQUEsQ0FBMUIsQ0FBUCxDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsK0JBQXJCLEVBRjhCO01BQUEsQ0FBaEMsRUFEOEI7SUFBQSxDQUFoQyxDQUhBLENBQUE7QUFBQSxJQVFBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7YUFDaEMsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixZQUFBLGtEQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLEVBQW1ELHNDQUFuRCxDQUFBLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsa0JBQTVCLENBRFgsQ0FBQTtBQUFBLFFBRUEsUUFBQSxHQUFXO0FBQUEsVUFBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLFVBQWMsS0FBQSxFQUFPLElBQXJCO0FBQUEsVUFBMkIsR0FBQSxFQUFLLElBQWhDO0FBQUEsVUFBc0MsSUFBQSxFQUFNLElBQTVDO0FBQUEsVUFBa0QsTUFBQSxFQUFRLElBQTFEO1NBRlgsQ0FBQTtBQUdBO2FBQUEsK0RBQUE7Z0NBQUE7QUFBQSx3QkFBQSxNQUFBLENBQU8sUUFBUyxDQUFBLEdBQUEsQ0FBaEIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixLQUE5QixFQUFBLENBQUE7QUFBQTt3QkFKOEI7TUFBQSxDQUFoQyxFQURnQztJQUFBLENBQWxDLENBUkEsQ0FBQTtXQWVBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsWUFBQSxhQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sYUFBUCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsMEJBRFYsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE9BQW5CLENBQVAsQ0FBbUMsQ0FBQyxPQUFwQyxDQUE0QyxJQUE1QyxDQUZBLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxxQ0FIVixDQUFBO2VBSUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE9BQW5CLENBQVAsQ0FBbUMsQ0FBQyxPQUFwQyxDQUE0QyxJQUE1QyxFQUxtQjtNQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLE1BT0EsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUEsR0FBQTtBQUNuQixZQUFBLGFBQUE7QUFBQSxRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsRUFBbUQsd0NBQW5ELENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxHQUFPLGFBRFAsQ0FBQTtBQUFBLFFBRUEsT0FBQSxHQUFVLHFDQUZWLENBQUE7ZUFHQSxNQUFBLENBQU8sTUFBTSxDQUFDLFdBQVAsQ0FBbUIsT0FBbkIsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLElBQTVDLEVBSm1CO01BQUEsQ0FBckIsQ0FQQSxDQUFBO2FBYUEsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLE1BQUEsQ0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQixDQUFQLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsRUFBOUMsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxXQUFQLENBQW1CLEVBQW5CLENBQVAsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxFQUF2QyxFQUZtQjtNQUFBLENBQXJCLEVBZHVCO0lBQUEsQ0FBekIsRUFoQnlCO0VBQUEsQ0FBM0IsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/helpers/template-helper-spec.coffee
