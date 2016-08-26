(function() {
  var path, utils;

  path = require("path");

  utils = require("../lib/utils");

  describe("utils", function() {
    describe(".slugize", function() {
      it("slugize string", function() {
        var fixture;
        fixture = "hello world!";
        expect(utils.slugize(fixture)).toEqual("hello-world");
        fixture = "hello-world";
        expect(utils.slugize(fixture)).toEqual("hello-world");
        fixture = " hello     World";
        return expect(utils.slugize(fixture)).toEqual("hello-world");
      });
      it("slugize chinese", function() {
        var fixture;
        fixture = "中文也可以";
        expect(utils.slugize(fixture)).toEqual("中文也可以");
        fixture = "中文：也可以";
        expect(utils.slugize(fixture)).toEqual("中文：也可以");
        fixture = " 「中文」  『也可以』";
        return expect(utils.slugize(fixture)).toEqual("「中文」-『也可以』");
      });
      return it("slugize empty string", function() {
        expect(utils.slugize(void 0)).toEqual("");
        return expect(utils.slugize("")).toEqual("");
      });
    });
    describe(".getPackagePath", function() {
      it("get the package path", function() {
        var root;
        root = atom.packages.resolvePackagePath("markdown-writer");
        return expect(utils.getPackagePath()).toEqual(root);
      });
      return it("get the path to package file", function() {
        var cheatsheetPath, root;
        root = atom.packages.resolvePackagePath("markdown-writer");
        cheatsheetPath = path.join(root, "CHEATSHEET.md");
        return expect(utils.getPackagePath("CHEATSHEET.md")).toEqual(cheatsheetPath);
      });
    });
    describe(".getAbsolutePath", function() {
      return it("expand ~ to homedir", function() {
        var absPath;
        absPath = utils.getAbsolutePath(path.join("~", "markdown-writer"));
        return expect(absPath).toEqual(path.join(utils.getHomedir(), "markdown-writer"));
      });
    });
    describe(".template", function() {
      it("generate template", function() {
        var fixture;
        fixture = "<a href=''>hello <title>! <from></a>";
        return expect(utils.template(fixture, {
          title: "world",
          from: "markdown-writer"
        })).toEqual("<a href=''>hello world! markdown-writer</a>");
      });
      return it("generate template with data missing", function() {
        var fixture;
        fixture = "<a href='<url>' title='<title>'><img></a>";
        return expect(utils.template(fixture, {
          url: "//",
          title: ''
        })).toEqual("<a href='//' title=''><img></a>");
      });
    });
    describe(".untemplate", function() {
      it("generate untemplate for normal text", function() {
        var fn;
        fn = utils.untemplate("text");
        expect(fn("text")).toEqual({
          _: "text"
        });
        return expect(fn("abc")).toEqual(void 0);
      });
      it("generate untemplate for template", function() {
        var fn;
        fn = utils.untemplate("{year}-{month}");
        expect(fn("2016-11-12")).toEqual(void 0);
        return expect(fn("2016-01")).toEqual({
          _: "2016-01",
          year: "2016",
          month: "01"
        });
      });
      it("generate untemplate for complex template", function() {
        var fn;
        fn = utils.untemplate("{year}-{month}-{day} {hour}:{minute}");
        expect(fn("2016-11-12")).toEqual(void 0);
        return expect(fn("2016-01-03 12:19")).toEqual({
          _: "2016-01-03 12:19",
          year: "2016",
          month: "01",
          day: "03",
          hour: "12",
          minute: "19"
        });
      });
      return it("generate untemplate for template with regex chars", function() {
        var fn;
        fn = utils.untemplate("[{year}-{month}-{day}] - {hour}:{minute}");
        expect(fn("2016-11-12")).toEqual(void 0);
        return expect(fn("[2016-01-03] - 12:19")).toEqual({
          _: "[2016-01-03] - 12:19",
          year: "2016",
          month: "01",
          day: "03",
          hour: "12",
          minute: "19"
        });
      });
    });
    describe(".parseDate", function() {
      return it("parse date dashed string", function() {
        var date, parseDate;
        date = utils.getDate();
        parseDate = utils.parseDate(date);
        return expect(parseDate).toEqual(date);
      });
    });
    it("check is valid html image tag", function() {
      var fixture;
      fixture = "<img alt=\"alt\" src=\"src.png\" class=\"aligncenter\" height=\"304\" width=\"520\">";
      return expect(utils.isImageTag(fixture)).toBe(true);
    });
    it("check parse valid html image tag", function() {
      var fixture;
      fixture = "<img alt=\"alt\" src=\"src.png\" class=\"aligncenter\" height=\"304\" width=\"520\">";
      return expect(utils.parseImageTag(fixture)).toEqual({
        alt: "alt",
        src: "src.png",
        "class": "aligncenter",
        height: "304",
        width: "520"
      });
    });
    it("check parse valid html image tag with title", function() {
      var fixture;
      fixture = "<img title=\"\" src=\"src.png\" class=\"aligncenter\" height=\"304\" width=\"520\" />";
      return expect(utils.parseImageTag(fixture)).toEqual({
        title: "",
        src: "src.png",
        "class": "aligncenter",
        height: "304",
        width: "520"
      });
    });
    it("check is valid image", function() {
      var fixture;
      fixture = "![text](url)";
      expect(utils.isImage(fixture)).toBe(true);
      fixture = "[text](url)";
      return expect(utils.isImage(fixture)).toBe(false);
    });
    it("parse valid image", function() {
      var fixture;
      fixture = "![text](url)";
      return expect(utils.parseImage(fixture)).toEqual({
        alt: "text",
        src: "url",
        title: ""
      });
    });
    it("check is valid image file", function() {
      var fixture;
      fixture = "fixtures/abc.jpg";
      expect(utils.isImageFile(fixture)).toBe(true);
      fixture = "fixtures/abc.txt";
      return expect(utils.isImageFile(fixture)).toBe(false);
    });
    describe(".isInlineLink", function() {
      it("check is text invalid inline link", function() {
        var fixture;
        fixture = "![text](url)";
        expect(utils.isInlineLink(fixture)).toBe(false);
        fixture = "[text]()";
        expect(utils.isInlineLink(fixture)).toBe(false);
        fixture = "[text][]";
        return expect(utils.isInlineLink(fixture)).toBe(false);
      });
      return it("check is text valid inline link", function() {
        var fixture;
        fixture = "[text](url)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[text](url title)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[text](url 'title')";
        return expect(utils.isInlineLink(fixture)).toBe(true);
      });
    });
    it("parse valid inline link text", function() {
      var fixture;
      fixture = "[text](url)";
      expect(utils.parseInlineLink(fixture)).toEqual({
        text: "text",
        url: "url",
        title: ""
      });
      fixture = "[text](url title)";
      expect(utils.parseInlineLink(fixture)).toEqual({
        text: "text",
        url: "url",
        title: "title"
      });
      fixture = "[text](url 'title')";
      return expect(utils.parseInlineLink(fixture)).toEqual({
        text: "text",
        url: "url",
        title: "title"
      });
    });
    describe(".isReferenceLink", function() {
      it("check is text invalid reference link", function() {
        var fixture;
        fixture = "![text](url)";
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[text](has)";
        return expect(utils.isReferenceLink(fixture)).toBe(false);
      });
      it("check is text valid reference link", function() {
        var fixture;
        fixture = "[text][]";
        return expect(utils.isReferenceLink(fixture)).toBe(true);
      });
      return it("check is text valid reference link with id", function() {
        var fixture;
        fixture = "[text][id with space]";
        return expect(utils.isReferenceLink(fixture)).toBe(true);
      });
    });
    describe(".parseReferenceLink", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open("empty.markdown");
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("Transform your plain [text][] into static websites and blogs.\n\n[text]: http://www.jekyll.com\n[id]: http://jekyll.com \"Jekyll Website\"\n\nMarkdown (or Textile), Liquid, HTML & CSS go in [Jekyll][id].");
        });
      });
      it("parse valid reference link text without id", function() {
        var fixture;
        fixture = "[text][]";
        return expect(utils.parseReferenceLink(fixture, editor)).toEqual({
          id: "text",
          text: "text",
          url: "http://www.jekyll.com",
          title: "",
          definitionRange: {
            start: {
              row: 2,
              column: 0
            },
            end: {
              row: 2,
              column: 29
            }
          }
        });
      });
      return it("parse valid reference link text with id", function() {
        var fixture;
        fixture = "[Jekyll][id]";
        return expect(utils.parseReferenceLink(fixture, editor)).toEqual({
          id: "id",
          text: "Jekyll",
          url: "http://jekyll.com",
          title: "Jekyll Website",
          definitionRange: {
            start: {
              row: 3,
              column: 0
            },
            end: {
              row: 3,
              column: 40
            }
          }
        });
      });
    });
    describe(".isReferenceDefinition", function() {
      it("check is text invalid reference definition", function() {
        var fixture;
        fixture = "[text] http";
        return expect(utils.isReferenceDefinition(fixture)).toBe(false);
      });
      it("check is text valid reference definition", function() {
        var fixture;
        fixture = "[text text]: http";
        return expect(utils.isReferenceDefinition(fixture)).toBe(true);
      });
      return it("check is text valid reference definition with title", function() {
        var fixture;
        fixture = "  [text]: http 'title not in double quote'";
        return expect(utils.isReferenceDefinition(fixture)).toBe(true);
      });
    });
    describe(".parseReferenceLink", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open("empty.markdown");
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("Transform your plain [text][] into static websites and blogs.\n\n[text]: http://www.jekyll.com\n[id]: http://jekyll.com \"Jekyll Website\"\n\nMarkdown (or Textile), Liquid, HTML & CSS go in [Jekyll][id].");
        });
      });
      it("parse valid reference definition text without id", function() {
        var fixture;
        fixture = "[text]: http://www.jekyll.com";
        return expect(utils.parseReferenceDefinition(fixture, editor)).toEqual({
          id: "text",
          text: "text",
          url: "http://www.jekyll.com",
          title: "",
          linkRange: {
            start: {
              row: 0,
              column: 21
            },
            end: {
              row: 0,
              column: 29
            }
          }
        });
      });
      return it("parse valid reference definition text with id", function() {
        var fixture;
        fixture = "[id]: http://jekyll.com \"Jekyll Website\"";
        return expect(utils.parseReferenceDefinition(fixture, editor)).toEqual({
          id: "id",
          text: "Jekyll",
          url: "http://jekyll.com",
          title: "Jekyll Website",
          linkRange: {
            start: {
              row: 5,
              column: 48
            },
            end: {
              row: 5,
              column: 60
            }
          }
        });
      });
    });
    describe(".isTableSeparator", function() {
      it("check is table separator", function() {
        var fixture;
        fixture = "----|";
        expect(utils.isTableSeparator(fixture)).toBe(false);
        fixture = "|--|";
        expect(utils.isTableSeparator(fixture)).toBe(true);
        fixture = "--|--";
        expect(utils.isTableSeparator(fixture)).toBe(true);
        fixture = "---- |------ | ---";
        return expect(utils.isTableSeparator(fixture)).toBe(true);
      });
      it("check is table separator with extra pipes", function() {
        var fixture;
        fixture = "|-----";
        expect(utils.isTableSeparator(fixture)).toBe(false);
        fixture = "|--|--";
        expect(utils.isTableSeparator(fixture)).toBe(true);
        fixture = "|---- |------ | ---|";
        return expect(utils.isTableSeparator(fixture)).toBe(true);
      });
      return it("check is table separator with format", function() {
        var fixture;
        fixture = ":--  |::---";
        expect(utils.isTableSeparator(fixture)).toBe(false);
        fixture = "|:---: |";
        expect(utils.isTableSeparator(fixture)).toBe(true);
        fixture = ":--|--:";
        expect(utils.isTableSeparator(fixture)).toBe(true);
        fixture = "|:---: |:----- | --: |";
        return expect(utils.isTableSeparator(fixture)).toBe(true);
      });
    });
    describe(".parseTableSeparator", function() {
      it("parse table separator", function() {
        var fixture;
        fixture = "|----|";
        expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: true,
          alignments: ["empty"],
          columns: ["----"],
          columnWidths: [4]
        });
        fixture = "--|--";
        expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: false,
          alignments: ["empty", "empty"],
          columns: ["--", "--"],
          columnWidths: [2, 2]
        });
        fixture = "---- |------ | ---";
        return expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: false,
          alignments: ["empty", "empty", "empty"],
          columns: ["----", "------", "---"],
          columnWidths: [4, 6, 3]
        });
      });
      it("parse table separator with extra pipes", function() {
        var fixture;
        fixture = "|--|--";
        expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: true,
          alignments: ["empty", "empty"],
          columns: ["--", "--"],
          columnWidths: [2, 2]
        });
        fixture = "|---- |------ | ---|";
        return expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: true,
          alignments: ["empty", "empty", "empty"],
          columns: ["----", "------", "---"],
          columnWidths: [4, 6, 3]
        });
      });
      return it("parse table separator with format", function() {
        var fixture;
        fixture = ":-|-:|::";
        expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: false,
          alignments: ["left", "right", "center"],
          columns: [":-", "-:", "::"],
          columnWidths: [2, 2, 2]
        });
        fixture = ":--|--:";
        expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: false,
          alignments: ["left", "right"],
          columns: [":--", "--:"],
          columnWidths: [3, 3]
        });
        fixture = "|:---: |:----- | --: |";
        return expect(utils.parseTableSeparator(fixture)).toEqual({
          separator: true,
          extraPipes: true,
          alignments: ["center", "left", "right"],
          columns: [":---:", ":-----", "--:"],
          columnWidths: [5, 6, 3]
        });
      });
    });
    describe(".isTableRow", function() {
      it("check table separator is a table row", function() {
        var fixture;
        fixture = ":--  |:---";
        return expect(utils.isTableRow(fixture)).toBe(true);
      });
      return it("check is table row", function() {
        var fixture;
        fixture = "| empty content |";
        expect(utils.isTableRow(fixture)).toBe(true);
        fixture = "abc|feg";
        expect(utils.isTableRow(fixture)).toBe(true);
        fixture = "|   abc |efg | |";
        return expect(utils.isTableRow(fixture)).toBe(true);
      });
    });
    describe(".parseTableRow", function() {
      it("parse table separator by table row ", function() {
        var fixture;
        fixture = "|:---: |:----- | --: |";
        return expect(utils.parseTableRow(fixture)).toEqual({
          separator: true,
          extraPipes: true,
          alignments: ["center", "left", "right"],
          columns: [":---:", ":-----", "--:"],
          columnWidths: [5, 6, 3]
        });
      });
      return it("parse table row ", function() {
        var fixture;
        fixture = "| 中文 |";
        expect(utils.parseTableRow(fixture)).toEqual({
          separator: false,
          extraPipes: true,
          columns: ["中文"],
          columnWidths: [4]
        });
        fixture = "abc|feg";
        expect(utils.parseTableRow(fixture)).toEqual({
          separator: false,
          extraPipes: false,
          columns: ["abc", "feg"],
          columnWidths: [3, 3]
        });
        fixture = "|   abc |efg | |";
        return expect(utils.parseTableRow(fixture)).toEqual({
          separator: false,
          extraPipes: true,
          columns: ["abc", "efg", ""],
          columnWidths: [3, 3, 0]
        });
      });
    });
    it("create table separator", function() {
      var row;
      row = utils.createTableSeparator({
        numOfColumns: 3,
        extraPipes: false,
        columnWidth: 1,
        alignment: "empty"
      });
      expect(row).toEqual("--|---|--");
      row = utils.createTableSeparator({
        numOfColumns: 2,
        extraPipes: true,
        columnWidth: 1,
        alignment: "empty"
      });
      expect(row).toEqual("|---|---|");
      row = utils.createTableSeparator({
        numOfColumns: 1,
        extraPipes: true,
        columnWidth: 1,
        alignment: "left"
      });
      expect(row).toEqual("|:--|");
      row = utils.createTableSeparator({
        numOfColumns: 3,
        extraPipes: true,
        columnWidths: [2, 3, 3],
        alignment: "left"
      });
      expect(row).toEqual("|:---|:----|:----|");
      row = utils.createTableSeparator({
        numOfColumns: 4,
        extraPipes: false,
        columnWidth: 3,
        alignment: "left",
        alignments: ["empty", "right", "center"]
      });
      return expect(row).toEqual("----|----:|:---:|:---");
    });
    it("create empty table row", function() {
      var row;
      row = utils.createTableRow([], {
        numOfColumns: 3,
        columnWidth: 1,
        alignment: "empty"
      });
      expect(row).toEqual("  |   |  ");
      row = utils.createTableRow([], {
        numOfColumns: 3,
        extraPipes: true,
        columnWidths: [1, 2, 3],
        alignment: "empty"
      });
      return expect(row).toEqual("|   |    |     |");
    });
    it("create table row", function() {
      var row;
      row = utils.createTableRow(["中文", "English"], {
        numOfColumns: 2,
        extraPipes: true,
        columnWidths: [4, 7]
      });
      expect(row).toEqual("| 中文 | English |");
      row = utils.createTableRow(["中文", "English"], {
        numOfColumns: 2,
        columnWidths: [8, 10],
        alignments: ["right", "center"]
      });
      return expect(row).toEqual("    中文 |  English  ");
    });
    it("create an empty table", function() {
      var options, rows;
      rows = [];
      options = {
        numOfColumns: 3,
        columnWidths: [4, 1, 4],
        alignments: ["left", "center", "right"]
      };
      rows.push(utils.createTableRow([], options));
      rows.push(utils.createTableSeparator(options));
      rows.push(utils.createTableRow([], options));
      return expect(rows).toEqual(["     |   |     ", ":----|:-:|----:", "     |   |     "]);
    });
    it("create an empty table with extra pipes", function() {
      var options, rows;
      rows = [];
      options = {
        numOfColumns: 3,
        extraPipes: true,
        columnWidth: 1,
        alignment: "empty"
      };
      rows.push(utils.createTableRow([], options));
      rows.push(utils.createTableSeparator(options));
      rows.push(utils.createTableRow([], options));
      return expect(rows).toEqual(["|   |   |   |", "|---|---|---|", "|   |   |   |"]);
    });
    it("check is url", function() {
      var fixture;
      fixture = "https://github.com/zhuochun/md-writer";
      expect(utils.isUrl(fixture)).toBe(true);
      fixture = "/Users/zhuochun/md-writer";
      return expect(utils.isUrl(fixture)).toBe(false);
    });
    return it("normalize file path", function() {
      var expected, fixture;
      fixture = "https://github.com/zhuochun/md-writer";
      expect(utils.normalizeFilePath(fixture)).toEqual(fixture);
      fixture = "\\github.com\\zhuochun\\md-writer.gif";
      expected = "/github.com/zhuochun/md-writer.gif";
      expect(utils.normalizeFilePath(fixture)).toEqual(expected);
      return expect(utils.normalizeFilePath(expected)).toEqual(expected);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvc3BlYy91dGlscy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQURSLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFNaEIsSUFBQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsTUFBQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFlBQUEsT0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLGNBQVYsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZCxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsYUFBdkMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLEdBQVUsYUFGVixDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkLENBQVAsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxhQUF2QyxDQUhBLENBQUE7QUFBQSxRQUlBLE9BQUEsR0FBVSxrQkFKVixDQUFBO2VBS0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZCxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsYUFBdkMsRUFObUI7TUFBQSxDQUFyQixDQUFBLENBQUE7QUFBQSxNQVFBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsWUFBQSxPQUFBO0FBQUEsUUFBQSxPQUFBLEdBQVUsT0FBVixDQUFBO0FBQUEsUUFDQSxNQUFB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

//# sourceURL=/home/epse/.atom/packages/markdown-writer/spec/utils-spec.coffee
