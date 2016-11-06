(function() {
  var path, utils;

  path = require("path");

  utils = require("../lib/utils");

  describe("utils", function() {
    describe(".incrementChars", function() {
      it("increment empty chars", function() {
        return expect(utils.incrementChars("")).toEqual("a");
      });
      it("increment 1 char", function() {
        expect(utils.incrementChars("a")).toEqual("b");
        expect(utils.incrementChars("f")).toEqual("g");
        expect(utils.incrementChars("y")).toEqual("z");
        return expect(utils.incrementChars("z")).toEqual("aa");
      });
      return it("increment 2 char", function() {
        expect(utils.incrementChars("AC")).toEqual("AD");
        expect(utils.incrementChars("EZ")).toEqual("FA");
        return expect(utils.incrementChars("ZZ")).toEqual("AAA");
      });
    });
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
    it("check is not valid image", function() {
      var fixture;
      fixture = "[text](url)";
      return expect(utils.isImage(fixture)).toBe(false);
    });
    it("check is valid image", function() {
      var fixture;
      fixture = "![](url)";
      expect(utils.isImage(fixture)).toBe(true);
      fixture = '![](url "title")';
      expect(utils.isImage(fixture)).toBe(true);
      fixture = "![text]()";
      expect(utils.isImage(fixture)).toBe(true);
      fixture = "![text](url)";
      expect(utils.isImage(fixture)).toBe(true);
      fixture = "![text](url 'title')";
      return expect(utils.isImage(fixture)).toBe(true);
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
        fixture = "[text][]";
        expect(utils.isInlineLink(fixture)).toBe(false);
        fixture = "[![](image.png)][id]";
        expect(utils.isInlineLink(fixture)).toBe(false);
        fixture = "[![image title](image.png)][id]";
        return expect(utils.isInlineLink(fixture)).toBe(false);
      });
      it("check is text valid inline link", function() {
        var fixture;
        fixture = "[text]()";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[text](url)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[text](url title)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[text](url 'title')";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[[link](in_another_link)][]";
        return expect(utils.isInlineLink(fixture)).toBe(true);
      });
      return it("check is image link valid inlink link", function() {
        var fixture;
        fixture = "[![](image.png)](url)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[![text](image.png)](url)";
        expect(utils.isInlineLink(fixture)).toBe(true);
        fixture = "[![text](image.png)](url 'title')";
        return expect(utils.isInlineLink(fixture)).toBe(true);
      });
    });
    it("parse valid inline link text", function() {
      var fixture;
      fixture = "[text]()";
      expect(utils.parseInlineLink(fixture)).toEqual({
        text: "text",
        url: "",
        title: ""
      });
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
    it("parse valid image text inline link", function() {
      var fixture;
      fixture = "[![](image.png)](url)";
      expect(utils.parseInlineLink(fixture)).toEqual({
        text: "![](image.png)",
        url: "url",
        title: ""
      });
      fixture = "[![text](image.png)](url)";
      expect(utils.parseInlineLink(fixture)).toEqual({
        text: "![text](image.png)",
        url: "url",
        title: ""
      });
      fixture = "[![text](image.png 'title')](url 'title')";
      return expect(utils.parseInlineLink(fixture)).toEqual({
        text: "![text](image.png 'title')",
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
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[][]";
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[![](image.png)][]";
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[![text](image.png)][]";
        return expect(utils.isReferenceLink(fixture)).toBe(false);
      });
      it("check is text valid reference link", function() {
        var fixture;
        fixture = "[text][]";
        expect(utils.isReferenceLink(fixture)).toBe(true);
        fixture = "[text][id with space]";
        return expect(utils.isReferenceLink(fixture)).toBe(true);
      });
      return it("check is text valid image reference link", function() {
        var fixture;
        fixture = "[![](image.png)][]";
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[![text](image.png)][]";
        expect(utils.isReferenceLink(fixture)).toBe(false);
        fixture = "[![](image.png)][id with space]";
        expect(utils.isReferenceLink(fixture)).toBe(true);
        fixture = "[![text](image.png)][id with space]";
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
      it("parse valid reference link text with id", function() {
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
      return it("parse orphan reference link text", function() {
        var fixture;
        fixture = "[Jekyll][jekyll]";
        return expect(utils.parseReferenceLink(fixture, editor)).toEqual({
          id: "jekyll",
          text: "Jekyll",
          url: "",
          title: "",
          definitionRange: null
        });
      });
    });
    describe(".isReferenceDefinition", function() {
      it("check is text invalid reference definition", function() {
        var fixture;
        fixture = "[text] http";
        expect(utils.isReferenceDefinition(fixture)).toBe(false);
        fixture = "[^text]: http";
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
    describe(".parseReferenceDefinition", function() {
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
      it("parse valid reference definition text with id", function() {
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
      return it("parse orphan reference definition text", function() {
        var fixture;
        fixture = "[jekyll]: http://jekyll.com \"Jekyll Website\"";
        return expect(utils.parseReferenceDefinition(fixture, editor)).toEqual({
          id: "jekyll",
          text: "",
          url: "http://jekyll.com",
          title: "Jekyll Website",
          linkRange: null
        });
      });
    });
    describe(".isFootnote", function() {
      it("check is text invalid footnote", function() {
        var fixture;
        fixture = "[text]";
        expect(utils.isFootnote(fixture)).toBe(false);
        fixture = "![abc]";
        return expect(utils.isFootnote(fixture)).toBe(false);
      });
      return it("check is text valid footnote", function() {
        var fixture;
        fixture = "[^1]";
        expect(utils.isFootnote(fixture)).toBe(true);
        fixture = "[^text]";
        expect(utils.isFootnote(fixture)).toBe(true);
        fixture = "[^text text]";
        expect(utils.isFootnote(fixture)).toBe(true);
        fixture = "[^12]:";
        return expect(utils.isFootnote(fixture)).toBe(true);
      });
    });
    describe(".parseFootnote", function() {
      return it("parse valid footnote", function() {
        var fixture;
        fixture = "[^1]";
        expect(utils.parseFootnote(fixture)).toEqual({
          label: "1",
          content: "",
          isDefinition: false
        });
        fixture = "[^text]: ";
        return expect(utils.parseFootnote(fixture)).toEqual({
          label: "text",
          content: "",
          isDefinition: true
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9zcGVjL3V0aWxzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQU1oQixJQUFBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsTUFBQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO2VBQzFCLE1BQUEsQ0FBTyxLQUFLLENBQUMsY0FBTixDQUFxQixFQUFyQixDQUFQLENBQWdDLENBQUMsT0FBakMsQ0FBeUMsR0FBekMsRUFEMEI7TUFBQSxDQUE1QixDQUFBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLGNBQU4sQ0FBcUIsR0FBckIsQ0FBUCxDQUFpQyxDQUFDLE9BQWxDLENBQTBDLEdBQTFDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxjQUFOLENBQXFCLEdBQXJCLENBQVAsQ0FBaUMsQ0FBQyxPQUFsQyxDQUEwQyxHQUExQyxDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsY0FBTixDQUFxQixHQUFyQixDQUFQLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsR0FBMUMsQ0FGQSxDQUFBO2VBR0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxjQUFOLENBQXFCLEdBQXJCLENBQVAsQ0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/spec/utils-spec.coffee
