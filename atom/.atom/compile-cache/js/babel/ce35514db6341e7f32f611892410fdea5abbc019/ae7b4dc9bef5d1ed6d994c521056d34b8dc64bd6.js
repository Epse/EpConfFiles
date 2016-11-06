function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libPythonIndent = require("../lib/python-indent");

var _libPythonIndent2 = _interopRequireDefault(_libPythonIndent);

"use babel";

describe("python-indent", function () {
    var FILE_NAME = "fixture.py";
    var buffer = null;
    var editor = null;
    var pythonIndent = null;

    beforeEach(function () {
        waitsForPromise(function () {
            return atom.workspace.open(FILE_NAME).then(function (ed) {
                editor = ed;
                editor.setSoftTabs(true);
                editor.setTabLength(4);
                buffer = editor.buffer;
            });
        });

        waitsForPromise(function () {
            var packages = atom.packages.getAvailablePackageNames();
            var languagePackage = undefined;

            if (packages.indexOf("language-python") > -1) {
                languagePackage = "language-python";
            } else if (packages.indexOf("MagicPython") > -1) {
                languagePackage = "MagicPython";
            }

            return atom.packages.activatePackage(languagePackage);
        });

        waitsForPromise(function () {
            return atom.packages.activatePackage("python-indent").then(function () {
                pythonIndent = new _libPythonIndent2["default"]();
            });
        });
    });

    describe("package", function () {
        return it("loads python file and package", function () {
            expect(editor.getPath()).toContain(FILE_NAME);
            expect(atom.packages.isPackageActive("python-indent")).toBe(true);
        });
    });

    // Aligned with opening delimiter
    describe("aligned with opening delimiter", function () {
        describe("when indenting after newline", function () {
            /*
            def test(param_a, param_b, param_c,
                             param_d):
                    pass
            */
            it("indents after open def params", function () {
                editor.insertText("def test(param_a, param_b, param_c,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(9));
            });

            /*
            x = [0, 1, 2,
                     3, 4, 5]
            */
            it("indents after open bracket with multiple values on the first line", function () {
                editor.insertText("x = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = [0,
                     1]
            */
            it("indents after open bracket with one value on the first line", function () {
                editor.insertText("x = [0,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = [0, 1, 2, [3, 4, 5,
                                         6, 7, 8]]
            */
            it("indeents in nested lists when inner list is on the same line", function () {
                editor.insertText("x = [0, 1, 2, [3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(15));
            });

            /*
            x = [0, 1, 2,
                     [3, 4, 5,
                        6, 7, 8]]
            */
            it("indeents in nested lists when inner list is on a new line", function () {
                editor.insertText("x = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("[3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(6));
            });

            /*
            x = (0, 1, 2,
                     3, 4, 5)
            */
            it("indents after open tuple with multiple values on the first line", function () {
                editor.insertText("x = (0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = (0,
                     1)
            */
            it("indents after open tuple with one value on the first line", function () {
                editor.insertText("x = (0,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = (0, 1, 2, [3, 4, 5,
                                         6, 7, 8],
                     9, 10, 11)
            */
            it("indents in nested lists when inner list is on a new line", function () {
                editor.insertText("x = (0, 1, 2, [3, 4, 5,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(15));

                editor.insertText("6, 7, 8],\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(5));
            });

            /*
            x = {0: 0, 1: 1,
                     2: 2, 3: 3}
            */
            it("indents dictionaries when multiple pairs are on the same line", function () {
                editor.insertText("x = {0: 0, 1: 1,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));
            });

            /*
            x = {0: 0, 1: 1,
                     2: 2, 3: 3, 4: [4, 4,
                                                     4, 4]}
            */
            it("indents dictionaries with a list as a value", function () {
                editor.insertText("x = {0: 0, 1: 1,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("2: 2, 3: 3, 4: [4, 4,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(21));
            });

            /*
            s = "[ will this \"break ( the parsing?"
            */
            it("does not indent with delimiters that are quoted", function () {
                editor.insertText("s = \"[ will this \\\"break ( the parsing?\"\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
            x = ["here(\"(", "is", "a",
                     "list", "of", ["nested]",
                                                    "strings\\"],
                     r"some \[\"[of which are raw",
                     "and some of which are not"]
            */
            it("knows when to indent when some delimiters are literal, and some are not", function () {
                editor.insertText("x = [\"here(\\\"(\", \"is\", \"a\",\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(5));

                editor.insertText("\"list\", \"of\", [\"nested]\",\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(20));

                editor.insertText("\"strings\\\\\"],\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(5));

                editor.insertText("r\"some \\[\\\"[of which are raw\",\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(5));
            });

            /*
            def test(param_a, param_b, param_c,
                             param_d):
                    pass
            */
            it("indents normally when delimiter is closed", function () {
                editor.insertText("def test(param_a, param_b, param_c):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            def test(param_a,
                             param_b,
                             param_c):
                    pass
            */
            it("keeps indentation on succeding open lines", function () {
                editor.insertText("def test(param_a,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(9));
            });

            /*
            class TheClass(object):
                    def test(param_a, param_b,
                                     param_c):
                            a_list = [1, 2, 3,
                                                4]
            */
            it("allows for fluid indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(param_a, param_b,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_c):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(8));

                editor.insertText("a_list = [1, 2, 3,\n");
                pythonIndent.properlyIndent();
                editor.insertText("4]\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(5)).toBe(" ".repeat(8));
            });

            /*
            def f(arg1, arg2, arg3,
                        arg4, arg5, arg6=")\)",
                        arg7=0):
                    return 0
            */
            it("indents properly when delimiters are an argument default string", function () {
                editor.insertText("def f(arg1, arg2, arg3,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(6));

                editor.insertText("arg4, arg5, arg6=\")\\)\",\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(6));

                editor.insertText("arg7=0):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            for i in range(10):
                    for j in range(20):
                            def f(x=[0,1,2,
                                             3,4,5]):
                                    return x * i * j
            */
            it("indents properly when blocks and lists are deeply nested", function () {
                editor.insertText("for i in range(10):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));

                editor.insertText("for j in range(20):\n");
                editor.autoIndentSelectedRows(2);
                expect(buffer.lineForRow(2)).toBe(" ".repeat(8));

                editor.insertText("def f(x=[0,1,2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(17));

                editor.insertText("3,4,5]):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(4)).toBe(" ".repeat(12));
            });

            /*
            """ quote with a single string delimiter: " """
            var_name = [0, 1, 2,
            */
            it("handles odd number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" quote with a single string delimiter: \" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            """ here is a triple quote with a two string delimiters: "" """
            var_name = [0, 1, 2,
            */
            it("handles even number of string delimiters inside triple quoted string", function () {
                editor.insertText("\"\"\" a quote with a two string delimiters: \"\" \"\"\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is "a triple quote" with three extra" string delimiters" ###
            var_name = [0, 1, 2,
            */
            it("handles three string delimiters spaced out inside triple quoted string", function () {
                editor.insertText("### here is \"a quote\" with extra\" string delimiters\" ###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### string with an \\"escaped delimiter in the middle###
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimieters at the end of a triple quoted string", function () {
                editor.insertText("### string with an \\\"escaped delimiter in the middle###\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });

            /*
            ### here is a string with an escaped delimiter ending\\###"
            var_name = [0, 1, 2,;
            */
            it("correctly handles escaped delimiters at the end of a quoted string", function () {
                editor.insertText("### here is a string with an escaped delimiter ending\\###\"\n");
                editor.insertText("var_name = [0, 1, 2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));
            });
        });

        describe("when unindenting after newline :: aligned with opening delimiter", function () {
            /*
            def test(param_a,
                             param_b):
                    pass
            */
            it("unindents after close def params", function () {
                editor.insertText("def test(param_a,\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_b):\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            tup = (True, False,
                         False)
            */
            it("unindents after close tuple", function () {
                editor.insertText("tup = (True, False,\n");
                pythonIndent.properlyIndent();
                editor.insertText("False)\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_list = [1, 2,
                                3]
            */
            it("unindents after close bracket", function () {
                editor.insertText("a_list = [1, 2,\n");
                pythonIndent.properlyIndent();
                editor.insertText("3]\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe("");
            });

            /*
            a_dict = {0: 0}
            */
            it("unindents after close curly brace", function () {
                editor.insertText("a_dict = {0: 0}\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });
    });

    // Hanging
    describe("hanging", function () {
        describe("when indenting after newline", function () {
            /*
            def test(
                    param_a
            )
            */
            it("hanging indents after open def params", function () {
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            tup = (
                    "elem"
            )
            */
            it("indents after open tuple", function () {
                editor.insertText("tup = (\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            a_list = [
                    "elem"
            ]
            */
            it("indents after open bracket", function () {
                editor.insertText("a_list = [\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
            def test(
                    param_a,
                    param_b,
                    param_c
            )
            */
            it("indents on succeding open lines", function () {
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_a,\n");
                editor.autoIndentSelectedRows(2);
                editor.insertText("param_b,\n");
                editor.autoIndentSelectedRows(3);
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });

            /*
            class TheClass(object):
                    def test(
                            param_a, param_b,
                            param_c):
                            a_list = [
                                    "1", "2", "3",
                                    "4"
                            ]
            */
            it("allows for indent in multi-level situations", function () {
                editor.insertText("class TheClass(object):\n");
                editor.autoIndentSelectedRows(1);
                editor.insertText("def test(\n");
                pythonIndent.properlyIndent();
                editor.insertText("param_a, param_b,\n");
                editor.autoIndentSelectedRows(3);
                editor.insertText("param_c):\n");
                editor.autoIndentSelectedRows(4);
                expect(buffer.lineForRow(4)).toBe(" ".repeat(4));

                editor.insertText("a_list = [\n");
                pythonIndent.properlyIndent();
                editor.insertText("\"1\", \"2\", \"3\",\n");
                editor.autoIndentSelectedRows(6);
                editor.insertText("\"4\"]\n");
                editor.autoIndentSelectedRows(7);
                expect(buffer.lineForRow(7)).toBe(" ".repeat(4));
            });
        });

        describe("when newline is in a comment", function () {
            /*
            x = [    #
                    0
            ]
            */
            it("indents when delimiter is not commented, but other characters are", function () {
                editor.insertText("x = [ #\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe(" ".repeat(4));
            });

            /*
             * [
             */
            it("does not indent when bracket delimiter is commented", function () {
                editor.insertText("# [\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * (
             */
            it("does not indent when parentheses delimiter is commented", function () {
                editor.insertText("# (\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * {
             */
            it("does not indent when brace delimiter is commented", function () {
                editor.insertText("# {\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });

            /*
             * def f():
             */
            it("does not indent when function def is commented", function () {
                editor.insertText("# def f():\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(1)).toBe("");
            });
        });

        describe("when continuing a hanging indent after opening/closing bracket(s)", function () {
            /*
            alpha = (
                    epsilon(),
                    gamma
            )
            */
            it("continues correctly after bracket is opened and closed on same line", function () {
                editor.insertText("alpha = (\n");
                pythonIndent.properlyIndent();
                editor.insertText("epsilon(),\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(4));
            });

            /*
            alpha = (
                    epsilon(arg1, arg2,
                                    arg3, arg4),
                    gamma
            )
            */
            it("continues after bracket is opened/closed on different lines", function () {
                editor.insertText("alpha = (\n");
                pythonIndent.properlyIndent();

                editor.insertText("epsilon(arg1, arg2,\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(2)).toBe(" ".repeat(12));

                editor.insertText("arg3, arg4),\n");
                pythonIndent.properlyIndent();
                expect(buffer.lineForRow(3)).toBe(" ".repeat(4));
            });
        });
    });

    describe("when source is malformed", function () {
        return(

            /*
            class DoesBadlyFormedCodeBreak )
            */
            it("does not throw error or indent when code is malformed", function () {
                editor.insertText("class DoesBadlyFormedCodeBreak )\n");
                expect(function () {
                    return pythonIndent.properlyIndent();
                }).not.toThrow();
                expect(buffer.lineForRow(1)).toBe("");
            })
        );
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L3NwZWMvcHl0aG9uLWluZGVudC1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OytCQUN5QixzQkFBc0I7Ozs7QUFEL0MsV0FBVyxDQUFDOztBQUVaLFFBQVEsQ0FBQyxlQUFlLEVBQUUsWUFBTTtBQUM1QixRQUFNLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFDL0IsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7O0FBRXhCLGNBQVUsQ0FBQyxZQUFNO0FBQ2IsdUJBQWUsQ0FBQzttQkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFFLEVBQUs7QUFDeEMsc0JBQU0sR0FBRyxFQUFFLENBQUM7QUFDWixzQkFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzQkFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixzQkFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7YUFDMUIsQ0FBQztTQUFBLENBQ0wsQ0FBQzs7QUFFRix1QkFBZSxDQUFDLFlBQU07QUFDbEIsZ0JBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztBQUMxRCxnQkFBSSxlQUFlLFlBQUEsQ0FBQzs7QUFFcEIsZ0JBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzFDLCtCQUFlLEdBQUcsaUJBQWlCLENBQUM7YUFDdkMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDN0MsK0JBQWUsR0FBRyxhQUFhLENBQUM7YUFDbkM7O0FBRUQsbUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDekQsQ0FBQyxDQUFDOztBQUVILHVCQUFlLENBQUM7bUJBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDdEQsNEJBQVksR0FBRyxrQ0FBa0IsQ0FBQzthQUNyQyxDQUFDO1NBQUEsQ0FDTCxDQUFDO0tBQ0wsQ0FBQyxDQUFDOztBQUVILFlBQVEsQ0FBQyxTQUFTLEVBQUU7ZUFDaEIsRUFBRSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDdEMsa0JBQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUMsa0JBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyRSxDQUFDO0tBQUEsQ0FDTCxDQUFDOzs7QUFHRixZQUFRLENBQUMsZ0NBQWdDLEVBQUUsWUFBTTtBQUM3QyxnQkFBUSxDQUFDLDhCQUE4QixFQUFFLFlBQU07Ozs7OztBQU0zQyxjQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN0QyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNELDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7OztBQU1ILGNBQUUsQ0FBQyxtRUFBbUUsRUFBRSxZQUFNO0FBQzFFLHNCQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDckMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLDZEQUE2RCxFQUFFLFlBQU07QUFDcEUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLDhEQUE4RCxFQUFFLFlBQU07QUFDckUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMvQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQyxDQUFDOzs7Ozs7O0FBT0gsY0FBRSxDQUFDLDJEQUEyRCxFQUFFLFlBQU07QUFDbEUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNyQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpELHNCQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7OztBQU1ILGNBQUUsQ0FBQyxpRUFBaUUsRUFBRSxZQUFNO0FBQ3hFLHNCQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDckMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLDJEQUEyRCxFQUFFLFlBQU07QUFDbEUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7OztBQU9ILGNBQUUsQ0FBQywwREFBMEQsRUFBRSxZQUFNO0FBQ2pFLHNCQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEQsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxjQUFFLENBQUMsK0RBQStELEVBQUUsWUFBTTtBQUN0RSxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3hDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7QUFPSCxjQUFFLENBQUMsNkNBQTZDLEVBQUUsWUFBTTtBQUNwRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3hDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakQsc0JBQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM3Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQyxDQUFDOzs7OztBQUtILGNBQUUsQ0FBQyxpREFBaUQsRUFBRSxZQUFNO0FBQ3hELHNCQUFNLENBQUMsVUFBVSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7QUFDcEUsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekMsQ0FBQyxDQUFDOzs7Ozs7Ozs7QUFTSCxjQUFFLENBQUMseUVBQXlFLEVBQUUsWUFBTTtBQUNoRixzQkFBTSxDQUFDLFVBQVUsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNELDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakQsc0JBQU0sQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUN2RCw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxELHNCQUFNLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNELHNCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7QUFPSCxjQUFFLENBQUMsMkNBQTJDLEVBQUUsWUFBTTtBQUNsRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVELDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7O0FBUUgsY0FBRSxDQUFDLDJDQUEyQyxFQUFFLFlBQU07QUFDbEQsc0JBQU0sQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLHNCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7OztBQVNILGNBQUUsQ0FBQyxtREFBbUQsRUFBRSxZQUFNO0FBQzFELHNCQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0Msc0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2xELDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzFDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7Ozs7QUFRSCxjQUFFLENBQUMsaUVBQWlFLEVBQUUsWUFBTTtBQUN4RSxzQkFBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQy9DLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakQsc0JBQU0sQ0FBQyxVQUFVLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUNsRCxzQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpELHNCQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7OztBQVNILGNBQUUsQ0FBQywwREFBMEQsRUFBRSxZQUFNO0FBQ2pFLHNCQUFNLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0MsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzNDLHNCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakQsc0JBQU0sQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN2Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxELHNCQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNyRCxDQUFDLENBQUM7Ozs7OztBQU1ILGNBQUUsQ0FBQyxxRUFBcUUsRUFBRSxZQUFNO0FBQzVFLHNCQUFNLENBQUMsVUFBVSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7QUFDOUUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxjQUFFLENBQUMsc0VBQXNFLEVBQUUsWUFBTTtBQUM3RSxzQkFBTSxDQUFDLFVBQVUsQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0FBQ2hGLHNCQUFNLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDNUMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JELENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLHdFQUF3RSxFQUFFLFlBQU07QUFDL0Usc0JBQU0sQ0FBQyxVQUFVLENBQUMsZ0VBQWdFLENBQUMsQ0FBQztBQUNwRixzQkFBTSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzVDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNyRCxDQUFDLENBQUM7Ozs7OztBQU1ILGNBQUUsQ0FBQyw0RUFBNEUsRUFBRSxZQUFNO0FBQ25GLHNCQUFNLENBQUMsVUFBVSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7QUFDakYsc0JBQU0sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxjQUFFLENBQUMsb0VBQW9FLEVBQUUsWUFBTTtBQUMzRSxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO0FBQ3BGLHNCQUFNLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDNUMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JELENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQzs7QUFFSCxnQkFBUSxDQUFDLGtFQUFrRSxFQUFFLFlBQU07Ozs7OztBQU0vRSxjQUFFLENBQUMsa0NBQWtDLEVBQUUsWUFBTTtBQUN6QyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDcEMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDLENBQUMsQ0FBQzs7Ozs7O0FBTUgsY0FBRSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDdEMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN2Qyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDLENBQUMsQ0FBQzs7Ozs7QUFLSCxjQUFFLENBQUMsbUNBQW1DLEVBQUUsWUFBTTtBQUMxQyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3ZDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQzs7O0FBR0gsWUFBUSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQ3RCLGdCQUFRLENBQUMsOEJBQThCLEVBQUUsWUFBTTs7Ozs7O0FBTTNDLGNBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxZQUFNO0FBQzlDLHNCQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7QUFPSCxjQUFFLENBQUMsMEJBQTBCLEVBQUUsWUFBTTtBQUNqQyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQiw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEQsQ0FBQyxDQUFDOzs7Ozs7O0FBT0gsY0FBRSxDQUFDLDRCQUE0QixFQUFFLFlBQU07QUFDbkMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbEMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7Ozs7O0FBU0gsY0FBRSxDQUFDLGlDQUFpQyxFQUFFLFlBQU07QUFDeEMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxzQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLHNCQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLHNCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQVlILGNBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxZQUFNO0FBQ3BELHNCQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0Msc0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekMsc0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxzQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpELHNCQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2xDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1QyxzQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLHNCQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLHNCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7O0FBRUgsZ0JBQVEsQ0FBQyw4QkFBOEIsRUFBRSxZQUFNOzs7Ozs7QUFNM0MsY0FBRSxDQUFDLG1FQUFtRSxFQUFFLFlBQU07QUFDMUUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7QUFLSCxjQUFFLENBQUMscURBQXFELEVBQUUsWUFBTTtBQUM1RCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQiw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxDQUFDLENBQUM7Ozs7O0FBS0gsY0FBRSxDQUFDLHlEQUF5RCxFQUFFLFlBQU07QUFDaEUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekMsQ0FBQyxDQUFDOzs7OztBQUtILGNBQUUsQ0FBQyxtREFBbUQsRUFBRSxZQUFNO0FBQzFELHNCQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDLENBQUMsQ0FBQzs7Ozs7QUFLSCxjQUFFLENBQUMsZ0RBQWdELEVBQUUsWUFBTTtBQUN2RCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7O0FBRUgsZ0JBQVEsQ0FBQyxtRUFBbUUsRUFBRSxZQUFNOzs7Ozs7O0FBT2hGLGNBQUUsQ0FBQyxxRUFBcUUsRUFBRSxZQUFNO0FBQzVFLHNCQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pDLDRCQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbEMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQzs7Ozs7Ozs7O0FBU0gsY0FBRSxDQUFDLDZEQUE2RCxFQUFFLFlBQU07QUFDcEUsc0JBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFOUIsc0JBQU0sQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzQyw0QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzlCLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxELHNCQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEMsNEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixzQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQzs7QUFFSCxZQUFRLENBQUMsMEJBQTBCLEVBQUU7Ozs7OztBQUtqQyxjQUFFLENBQUMsdURBQXVELEVBQUUsWUFBTTtBQUM5RCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hELHNCQUFNLENBQUM7MkJBQU0sWUFBWSxDQUFDLGNBQWMsRUFBRTtpQkFBQSxDQUFDLENBQzFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLHNCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxDQUFDOztLQUFBLENBQ0wsQ0FBQztDQUNMLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9lcHNlL0VwQ29uZkZpbGVzL2F0b20vLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9zcGVjL3B5dGhvbi1pbmRlbnQtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5pbXBvcnQgUHl0aG9uSW5kZW50IGZyb20gXCIuLi9saWIvcHl0aG9uLWluZGVudFwiO1xuZGVzY3JpYmUoXCJweXRob24taW5kZW50XCIsICgpID0+IHtcbiAgICBjb25zdCBGSUxFX05BTUUgPSBcImZpeHR1cmUucHlcIjtcbiAgICBsZXQgYnVmZmVyID0gbnVsbDtcbiAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICBsZXQgcHl0aG9uSW5kZW50ID0gbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oRklMRV9OQU1FKS50aGVuKChlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvciA9IGVkO1xuICAgICAgICAgICAgICAgIGVkaXRvci5zZXRTb2Z0VGFicyh0cnVlKTtcbiAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VGFiTGVuZ3RoKDQpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGVkaXRvci5idWZmZXI7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlcyA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKCk7XG4gICAgICAgICAgICBsZXQgbGFuZ3VhZ2VQYWNrYWdlO1xuXG4gICAgICAgICAgICBpZiAocGFja2FnZXMuaW5kZXhPZihcImxhbmd1YWdlLXB5dGhvblwiKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2VQYWNrYWdlID0gXCJsYW5ndWFnZS1weXRob25cIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFja2FnZXMuaW5kZXhPZihcIk1hZ2ljUHl0aG9uXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsYW5ndWFnZVBhY2thZ2UgPSBcIk1hZ2ljUHl0aG9uXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShsYW5ndWFnZVBhY2thZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwicHl0aG9uLWluZGVudFwiKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQgPSBuZXcgUHl0aG9uSW5kZW50KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoXCJwYWNrYWdlXCIsICgpID0+XG4gICAgICAgIGl0KFwibG9hZHMgcHl0aG9uIGZpbGUgYW5kIHBhY2thZ2VcIiwgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRQYXRoKCkpLnRvQ29udGFpbihGSUxFX05BTUUpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKFwicHl0aG9uLWluZGVudFwiKSkudG9CZSh0cnVlKTtcbiAgICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQWxpZ25lZCB3aXRoIG9wZW5pbmcgZGVsaW1pdGVyXG4gICAgZGVzY3JpYmUoXCJhbGlnbmVkIHdpdGggb3BlbmluZyBkZWxpbWl0ZXJcIiwgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZShcIndoZW4gaW5kZW50aW5nIGFmdGVyIG5ld2xpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsIHBhcmFtX2MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2QpOlxuICAgICAgICAgICAgICAgICAgICBwYXNzXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gZGVmIHBhcmFtc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgdGVzdChwYXJhbV9hLCBwYXJhbV9iLCBwYXJhbV9jLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDkpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFswLCAxLCAyLFxuICAgICAgICAgICAgICAgICAgICAgMywgNCwgNV1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiBicmFja2V0IHdpdGggbXVsdGlwbGUgdmFsdWVzIG9uIHRoZSBmaXJzdCBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg1KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSBbMCxcbiAgICAgICAgICAgICAgICAgICAgIDFdXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gYnJhY2tldCB3aXRoIG9uZSB2YWx1ZSBvbiB0aGUgZmlyc3QgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gWzAsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gWzAsIDEsIDIsIFszLCA0LCA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA2LCA3LCA4XV1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVlbnRzIGluIG5lc3RlZCBsaXN0cyB3aGVuIGlubmVyIGxpc3QgaXMgb24gdGhlIHNhbWUgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gWzAsIDEsIDIsIFszLCA0LCA1LFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDE1KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSBbMCwgMSwgMixcbiAgICAgICAgICAgICAgICAgICAgIFszLCA0LCA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgNiwgNywgOF1dXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlZW50cyBpbiBuZXN0ZWQgbGlzdHMgd2hlbiBpbm5lciBsaXN0IGlzIG9uIGEgbmV3IGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiWzMsIDQsIDUsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0gKDAsIDEsIDIsXG4gICAgICAgICAgICAgICAgICAgICAzLCA0LCA1KVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBhZnRlciBvcGVuIHR1cGxlIHdpdGggbXVsdGlwbGUgdmFsdWVzIG9uIHRoZSBmaXJzdCBsaW5lXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSAoMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg1KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSAoMCxcbiAgICAgICAgICAgICAgICAgICAgIDEpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGFmdGVyIG9wZW4gdHVwbGUgd2l0aCBvbmUgdmFsdWUgb24gdGhlIGZpcnN0IGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9ICgwLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9ICgwLCAxLCAyLCBbMywgNCwgNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNiwgNywgOF0sXG4gICAgICAgICAgICAgICAgICAgICA5LCAxMCwgMTEpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIGluIG5lc3RlZCBsaXN0cyB3aGVuIGlubmVyIGxpc3QgaXMgb24gYSBuZXcgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gKDAsIDEsIDIsIFszLCA0LCA1LFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDE1KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjYsIDcsIDhdLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IHswOiAwLCAxOiAxLFxuICAgICAgICAgICAgICAgICAgICAgMjogMiwgMzogM31cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgZGljdGlvbmFyaWVzIHdoZW4gbXVsdGlwbGUgcGFpcnMgYXJlIG9uIHRoZSBzYW1lIGxpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwieCA9IHswOiAwLCAxOiAxLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IHswOiAwLCAxOiAxLFxuICAgICAgICAgICAgICAgICAgICAgMjogMiwgMzogMywgNDogWzQsIDQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDQsIDRdfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBkaWN0aW9uYXJpZXMgd2l0aCBhIGxpc3QgYXMgYSB2YWx1ZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gezA6IDAsIDE6IDEsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNSkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIyOiAyLCAzOiAzLCA0OiBbNCwgNCxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgyMSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBzID0gXCJbIHdpbGwgdGhpcyBcXFwiYnJlYWsgKCB0aGUgcGFyc2luZz9cIlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdpdGggZGVsaW1pdGVycyB0aGF0IGFyZSBxdW90ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicyA9IFxcXCJbIHdpbGwgdGhpcyBcXFxcXFxcImJyZWFrICggdGhlIHBhcnNpbmc/XFxcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHggPSBbXCJoZXJlKFxcXCIoXCIsIFwiaXNcIiwgXCJhXCIsXG4gICAgICAgICAgICAgICAgICAgICBcImxpc3RcIiwgXCJvZlwiLCBbXCJuZXN0ZWRdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJpbmdzXFxcXFwiXSxcbiAgICAgICAgICAgICAgICAgICAgIHJcInNvbWUgXFxbXFxcIltvZiB3aGljaCBhcmUgcmF3XCIsXG4gICAgICAgICAgICAgICAgICAgICBcImFuZCBzb21lIG9mIHdoaWNoIGFyZSBub3RcIl1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImtub3dzIHdoZW4gdG8gaW5kZW50IHdoZW4gc29tZSBkZWxpbWl0ZXJzIGFyZSBsaXRlcmFsLCBhbmQgc29tZSBhcmUgbm90XCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInggPSBbXFxcImhlcmUoXFxcXFxcXCIoXFxcIiwgXFxcImlzXFxcIiwgXFxcImFcXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcImxpc3RcXFwiLCBcXFwib2ZcXFwiLCBbXFxcIm5lc3RlZF1cXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDIwKSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcXCJzdHJpbmdzXFxcXFxcXFxcXFwiXSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg1KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInJcXFwic29tZSBcXFxcW1xcXFxcXFwiW29mIHdoaWNoIGFyZSByYXdcXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cyg0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coNCkpLnRvQmUoXCIgXCIucmVwZWF0KDUpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSwgcGFyYW1fYiwgcGFyYW1fYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fZCk6XG4gICAgICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgbm9ybWFsbHkgd2hlbiBkZWxpbWl0ZXIgaXMgY2xvc2VkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsIHBhcmFtX2MpOlxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIHRlc3QocGFyYW1fYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYyk6XG4gICAgICAgICAgICAgICAgICAgIHBhc3NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImtlZXBzIGluZGVudGF0aW9uIG9uIHN1Y2NlZGluZyBvcGVuIGxpbmVzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg5KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XG4gICAgICAgICAgICAgICAgICAgIGRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYyk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYV9saXN0ID0gWzEsIDIsIDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA0XVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiYWxsb3dzIGZvciBmbHVpZCBpbmRlbnQgaW4gbXVsdGktbGV2ZWwgc2l0dWF0aW9uc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJjbGFzcyBUaGVDbGFzcyhvYmplY3QpOlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygxKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KHBhcmFtX2EsIHBhcmFtX2IsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYyk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygzKSkudG9CZShcIiBcIi5yZXBlYXQoOCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhX2xpc3QgPSBbMSwgMiwgMyxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCI0XVxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coNSkpLnRvQmUoXCIgXCIucmVwZWF0KDgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZGVmIGYoYXJnMSwgYXJnMiwgYXJnMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZzQsIGFyZzUsIGFyZzY9XCIpXFwpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmc3PTApOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBwcm9wZXJseSB3aGVuIGRlbGltaXRlcnMgYXJlIGFuIGFyZ3VtZW50IGRlZmF1bHQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiBmKGFyZzEsIGFyZzIsIGFyZzMsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNikpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhcmc0LCBhcmc1LCBhcmc2PVxcXCIpXFxcXClcXFwiLFxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDYpKTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYXJnNz0wKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGZvciBpIGluIHJhbmdlKDEwKTpcbiAgICAgICAgICAgICAgICAgICAgZm9yIGogaW4gcmFuZ2UoMjApOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZiBmKHg9WzAsMSwyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMyw0LDVdKTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4ICogaSAqIGpcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgcHJvcGVybHkgd2hlbiBibG9ja3MgYW5kIGxpc3RzIGFyZSBkZWVwbHkgbmVzdGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImZvciBpIGluIHJhbmdlKDEwKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImZvciBqIGluIHJhbmdlKDIwKTpcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCg4KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiBmKHg9WzAsMSwyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMykpLnRvQmUoXCIgXCIucmVwZWF0KDE3KSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjMsNCw1XSk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg0KSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgXCJcIlwiIHF1b3RlIHdpdGggYSBzaW5nbGUgc3RyaW5nIGRlbGltaXRlcjogXCIgXCJcIlwiXG4gICAgICAgICAgICB2YXJfbmFtZSA9IFswLCAxLCAyLFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaGFuZGxlcyBvZGQgbnVtYmVyIG9mIHN0cmluZyBkZWxpbWl0ZXJzIGluc2lkZSB0cmlwbGUgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiXFxcIlxcXCIgcXVvdGUgd2l0aCBhIHNpbmdsZSBzdHJpbmcgZGVsaW1pdGVyOiBcXFwiIFxcXCJcXFwiXFxcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInZhcl9uYW1lID0gWzAsIDEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgXCJcIlwiIGhlcmUgaXMgYSB0cmlwbGUgcXVvdGUgd2l0aCBhIHR3byBzdHJpbmcgZGVsaW1pdGVyczogXCJcIiBcIlwiXCJcbiAgICAgICAgICAgIHZhcl9uYW1lID0gWzAsIDEsIDIsXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJoYW5kbGVzIGV2ZW4gbnVtYmVyIG9mIHN0cmluZyBkZWxpbWl0ZXJzIGluc2lkZSB0cmlwbGUgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiXFxcIlxcXCIgYSBxdW90ZSB3aXRoIGEgdHdvIHN0cmluZyBkZWxpbWl0ZXJzOiBcXFwiXFxcIiBcXFwiXFxcIlxcXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ2YXJfbmFtZSA9IFswLCAxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDEyKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICMjIyBoZXJlIGlzIFwiYSB0cmlwbGUgcXVvdGVcIiB3aXRoIHRocmVlIGV4dHJhXCIgc3RyaW5nIGRlbGltaXRlcnNcIiAjIyNcbiAgICAgICAgICAgIHZhcl9uYW1lID0gWzAsIDEsIDIsXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJoYW5kbGVzIHRocmVlIHN0cmluZyBkZWxpbWl0ZXJzIHNwYWNlZCBvdXQgaW5zaWRlIHRyaXBsZSBxdW90ZWQgc3RyaW5nXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMjIyBoZXJlIGlzIFxcXCJhIHF1b3RlXFxcIiB3aXRoIGV4dHJhXFxcIiBzdHJpbmcgZGVsaW1pdGVyc1xcXCIgIyMjXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAjIyMgc3RyaW5nIHdpdGggYW4gXFxcXFwiZXNjYXBlZCBkZWxpbWl0ZXIgaW4gdGhlIG1pZGRsZSMjI1xuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMiw7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb3JyZWN0bHkgaGFuZGxlcyBlc2NhcGVkIGRlbGltaWV0ZXJzIGF0IHRoZSBlbmQgb2YgYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIyMgc3RyaW5nIHdpdGggYW4gXFxcXFxcXCJlc2NhcGVkIGRlbGltaXRlciBpbiB0aGUgbWlkZGxlIyMjXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwidmFyX25hbWUgPSBbMCwgMSwgMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAjIyMgaGVyZSBpcyBhIHN0cmluZyB3aXRoIGFuIGVzY2FwZWQgZGVsaW1pdGVyIGVuZGluZ1xcXFwjIyNcIlxuICAgICAgICAgICAgdmFyX25hbWUgPSBbMCwgMSwgMiw7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb3JyZWN0bHkgaGFuZGxlcyBlc2NhcGVkIGRlbGltaXRlcnMgYXQgdGhlIGVuZCBvZiBhIHF1b3RlZCBzdHJpbmdcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIyMjIGhlcmUgaXMgYSBzdHJpbmcgd2l0aCBhbiBlc2NhcGVkIGRlbGltaXRlciBlbmRpbmdcXFxcIyMjXFxcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInZhcl9uYW1lID0gWzAsIDEsIDIsXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoMTIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZShcIndoZW4gdW5pbmRlbnRpbmcgYWZ0ZXIgbmV3bGluZSA6OiBhbGlnbmVkIHdpdGggb3BlbmluZyBkZWxpbWl0ZXJcIiwgKCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGRlZiB0ZXN0KHBhcmFtX2EsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2IpOlxuICAgICAgICAgICAgICAgICAgICBwYXNzXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJ1bmluZGVudHMgYWZ0ZXIgY2xvc2UgZGVmIHBhcmFtc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJkZWYgdGVzdChwYXJhbV9hLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInBhcmFtX2IpOlxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMikpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgdHVwID0gKFRydWUsIEZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIEZhbHNlKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwidW5pbmRlbnRzIGFmdGVyIGNsb3NlIHR1cGxlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInR1cCA9IChUcnVlLCBGYWxzZSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJGYWxzZSlcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBhX2xpc3QgPSBbMSwgMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgM11cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcInVuaW5kZW50cyBhZnRlciBjbG9zZSBicmFja2V0XCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfbGlzdCA9IFsxLCAyLFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIjNdXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgYV9kaWN0ID0gezA6IDB9XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJ1bmluZGVudHMgYWZ0ZXIgY2xvc2UgY3VybHkgYnJhY2VcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYV9kaWN0ID0gezA6IDB9XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEhhbmdpbmdcbiAgICBkZXNjcmliZShcImhhbmdpbmdcIiwgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZShcIndoZW4gaW5kZW50aW5nIGFmdGVyIG5ld2xpbmVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGRlZiB0ZXN0KFxuICAgICAgICAgICAgICAgICAgICBwYXJhbV9hXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJoYW5naW5nIGluZGVudHMgYWZ0ZXIgb3BlbiBkZWYgcGFyYW1zXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCIgXCIucmVwZWF0KDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgdHVwID0gKFxuICAgICAgICAgICAgICAgICAgICBcImVsZW1cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiaW5kZW50cyBhZnRlciBvcGVuIHR1cGxlXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInR1cCA9IChcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGFfbGlzdCA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlbGVtXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpdChcImluZGVudHMgYWZ0ZXIgb3BlbiBicmFja2V0XCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFfbGlzdCA9IFtcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGRlZiB0ZXN0KFxuICAgICAgICAgICAgICAgICAgICBwYXJhbV9hLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbV9iLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbV9jXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIG9uIHN1Y2NlZGluZyBvcGVuIGxpbmVzXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInBhcmFtX2EsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoMyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGNsYXNzIFRoZUNsYXNzKG9iamVjdCk6XG4gICAgICAgICAgICAgICAgICAgIGRlZiB0ZXN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtX2EsIHBhcmFtX2IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1fYyk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYV9saXN0ID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIxXCIsIFwiMlwiLCBcIjNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiNFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiYWxsb3dzIGZvciBpbmRlbnQgaW4gbXVsdGktbGV2ZWwgc2l0dWF0aW9uc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJjbGFzcyBUaGVDbGFzcyhvYmplY3QpOlxcblwiKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygxKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImRlZiB0ZXN0KFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcInBhcmFtX2EsIHBhcmFtX2IsXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDMpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicGFyYW1fYyk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg0KSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhX2xpc3QgPSBbXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxcIjFcXFwiLCBcXFwiMlxcXCIsIFxcXCIzXFxcIixcXG5cIik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoNik7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXFwiNFxcXCJdXFxuXCIpO1xuICAgICAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKDcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdyg3KSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKFwid2hlbiBuZXdsaW5lIGlzIGluIGEgY29tbWVudFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IFsgICAgI1xuICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJpbmRlbnRzIHdoZW4gZGVsaW1pdGVyIGlzIG5vdCBjb21tZW50ZWQsIGJ1dCBvdGhlciBjaGFyYWN0ZXJzIGFyZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJ4ID0gWyAjXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBbXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdoZW4gYnJhY2tldCBkZWxpbWl0ZXIgaXMgY29tbWVudGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMgW1xcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIChcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJkb2VzIG5vdCBpbmRlbnQgd2hlbiBwYXJlbnRoZXNlcyBkZWxpbWl0ZXIgaXMgY29tbWVudGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMgKFxcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIHtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJkb2VzIG5vdCBpbmRlbnQgd2hlbiBicmFjZSBkZWxpbWl0ZXIgaXMgY29tbWVudGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiMge1xcblwiKTtcbiAgICAgICAgICAgICAgICBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYnVmZmVyLmxpbmVGb3JSb3coMSkpLnRvQmUoXCJcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIGRlZiBmKCk6XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiZG9lcyBub3QgaW5kZW50IHdoZW4gZnVuY3Rpb24gZGVmIGlzIGNvbW1lbnRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIjIGRlZiBmKCk6XFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygxKSkudG9CZShcIlwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZShcIndoZW4gY29udGludWluZyBhIGhhbmdpbmcgaW5kZW50IGFmdGVyIG9wZW5pbmcvY2xvc2luZyBicmFja2V0KHMpXCIsICgpID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBhbHBoYSA9IChcbiAgICAgICAgICAgICAgICAgICAgZXBzaWxvbigpLFxuICAgICAgICAgICAgICAgICAgICBnYW1tYVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGl0KFwiY29udGludWVzIGNvcnJlY3RseSBhZnRlciBicmFja2V0IGlzIG9wZW5lZCBhbmQgY2xvc2VkIG9uIHNhbWUgbGluZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhbHBoYSA9IChcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJlcHNpbG9uKCksXFxuXCIpO1xuICAgICAgICAgICAgICAgIHB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChidWZmZXIubGluZUZvclJvdygyKSkudG9CZShcIiBcIi5yZXBlYXQoNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBhbHBoYSA9IChcbiAgICAgICAgICAgICAgICAgICAgZXBzaWxvbihhcmcxLCBhcmcyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnMywgYXJnNCksXG4gICAgICAgICAgICAgICAgICAgIGdhbW1hXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaXQoXCJjb250aW51ZXMgYWZ0ZXIgYnJhY2tldCBpcyBvcGVuZWQvY2xvc2VkIG9uIGRpZmZlcmVudCBsaW5lc1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhbHBoYSA9IChcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImVwc2lsb24oYXJnMSwgYXJnMixcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDIpKS50b0JlKFwiIFwiLnJlcGVhdCgxMikpO1xuXG4gICAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhcmczLCBhcmc0KSxcXG5cIik7XG4gICAgICAgICAgICAgICAgcHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDMpKS50b0JlKFwiIFwiLnJlcGVhdCg0KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShcIndoZW4gc291cmNlIGlzIG1hbGZvcm1lZFwiLCAoKSA9PlxuXG4gICAgICAgIC8qXG4gICAgICAgIGNsYXNzIERvZXNCYWRseUZvcm1lZENvZGVCcmVhayApXG4gICAgICAgICovXG4gICAgICAgIGl0KFwiZG9lcyBub3QgdGhyb3cgZXJyb3Igb3IgaW5kZW50IHdoZW4gY29kZSBpcyBtYWxmb3JtZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJjbGFzcyBEb2VzQmFkbHlGb3JtZWRDb2RlQnJlYWsgKVxcblwiKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBweXRob25JbmRlbnQucHJvcGVybHlJbmRlbnQoKSlcbiAgICAgICAgICAgIC5ub3QudG9UaHJvdygpO1xuICAgICAgICAgICAgZXhwZWN0KGJ1ZmZlci5saW5lRm9yUm93KDEpKS50b0JlKFwiXCIpO1xuICAgICAgICB9KVxuICAgICk7XG59KTtcbiJdfQ==
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/python-indent/spec/python-indent-spec.js
