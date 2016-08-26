(function() {
  var LineMeta;

  LineMeta = require("../../lib/helpers/line-meta");

  describe("LineMeta", function() {
    describe(".isList", function() {
      it("is not list", function() {
        return expect(LineMeta.isList("normal line")).toBe(false);
      });
      it("is not list, blockquote", function() {
        return expect(LineMeta.isList("> blockquote")).toBe(false);
      });
      it("is unordered list", function() {
        return expect(LineMeta.isList("- list")).toBe(true);
      });
      it("is unordered task list", function() {
        return expect(LineMeta.isList("- [ ]list")).toBe(true);
      });
      it("is unordered task list", function() {
        return expect(LineMeta.isList("- [ ] list")).toBe(true);
      });
      it("is ordered list", function() {
        return expect(LineMeta.isList("12. list")).toBe(true);
      });
      it("is ordered task list", function() {
        return expect(LineMeta.isList("12. [ ]list")).toBe(true);
      });
      return it("is ordered task list", function() {
        return expect(LineMeta.isList("12. [ ] list")).toBe(true);
      });
    });
    describe("normal line", function() {
      return it("is not continuous", function() {
        return expect(new LineMeta("normal line").isContinuous()).toBe(false);
      });
    });
    describe("unordered task list line", function() {
      var lineMeta;
      lineMeta = new LineMeta("- [X] line");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(true);
      });
      it("is ul list", function() {
        return expect(lineMeta.isList("ul")).toBe(true);
      });
      it("is not ol list", function() {
        return expect(lineMeta.isList("ol")).toBe(false);
      });
      it("is task list", function() {
        return expect(lineMeta.isTaskList()).toBe(true);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(false);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("line");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe("-");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("- [ ] ");
      });
    });
    describe("unordered list line", function() {
      var lineMeta;
      lineMeta = new LineMeta("- line");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(true);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(false);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("line");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe("-");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("- ");
      });
    });
    describe("ordered task list line", function() {
      var lineMeta;
      lineMeta = new LineMeta("99. [X] line");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(true);
      });
      it("is ol list", function() {
        return expect(lineMeta.isList("ol")).toBe(true);
      });
      it("is not ul list", function() {
        return expect(lineMeta.isList("ul")).toBe(false);
      });
      it("is task list", function() {
        return expect(lineMeta.isTaskList()).toBe(true);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(false);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("line");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe("99");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("100. [ ] ");
      });
    });
    describe("ordered list line", function() {
      var lineMeta;
      lineMeta = new LineMeta("3. line");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(true);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(false);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("line");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe("3");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("4. ");
      });
    });
    describe("empty list line", function() {
      var lineMeta;
      lineMeta = new LineMeta("3.     ");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(true);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(true);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe("3");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("4. ");
      });
    });
    return describe("blockquote", function() {
      var lineMeta;
      lineMeta = new LineMeta("  > blockquote");
      it("is list", function() {
        return expect(lineMeta.isList()).toBe(false);
      });
      it("is continuous", function() {
        return expect(lineMeta.isContinuous()).toBe(true);
      });
      it("is not empty body", function() {
        return expect(lineMeta.isEmptyBody()).toBe(false);
      });
      it("has body", function() {
        return expect(lineMeta.body).toBe("blockquote");
      });
      it("has head", function() {
        return expect(lineMeta.head).toBe(">");
      });
      return it("has nextLine", function() {
        return expect(lineMeta.nextLine).toBe("  > ");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy9oZWxwZXJzL2xpbmUtbWV0YS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUFYLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFFbkIsSUFBQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsTUFBQSxFQUFBLENBQUcsYUFBSCxFQUFrQixTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsYUFBaEIsQ0FBUCxDQUFzQyxDQUFDLElBQXZDLENBQTRDLEtBQTVDLEVBQUg7TUFBQSxDQUFsQixDQUFBLENBQUE7QUFBQSxNQUNBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsY0FBaEIsQ0FBUCxDQUF1QyxDQUFDLElBQXhDLENBQTZDLEtBQTdDLEVBQUg7TUFBQSxDQUE5QixDQURBLENBQUE7QUFBQSxNQUVBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsUUFBaEIsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQXZDLEVBQUg7TUFBQSxDQUF4QixDQUZBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsV0FBaEIsQ0FBUCxDQUFvQyxDQUFDLElBQXJDLENBQTBDLElBQTFDLEVBQUg7TUFBQSxDQUE3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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/helpers/line-meta-spec.coffee
