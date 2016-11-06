Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

// eslint-disable-line import/no-unresolved

var _pythonIndent = require("./python-indent");

var _pythonIndent2 = _interopRequireDefault(_pythonIndent);

"use babel";

exports["default"] = {
    config: {
        hangingIndentTabs: {
            type: "number",
            "default": 1,
            description: "Number of tabs used for _hanging_ indents",
            "enum": [1, 2]
        }
    },
    activate: function activate() {
        _this.pythonIndent = new _pythonIndent2["default"]();
        _this.subscriptions = new _atom.CompositeDisposable();
        _this.subscriptions.add(atom.commands.add("atom-text-editor", { "editor:newline": function editorNewline() {
                return _this.pythonIndent.properlyIndent();
            } }));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOzs7OzRCQUNqQixpQkFBaUI7Ozs7QUFIMUMsV0FBVyxDQUFDOztxQkFLRztBQUNYLFVBQU0sRUFBRTtBQUNKLHlCQUFpQixFQUFFO0FBQ2YsZ0JBQUksRUFBRSxRQUFRO0FBQ2QsdUJBQVMsQ0FBQztBQUNWLHVCQUFXLEVBQUUsMkNBQTJDO0FBQ3hELG9CQUFNLENBQ0YsQ0FBQyxFQUNELENBQUMsQ0FDSjtTQUNKO0tBQ0o7QUFDRCxZQUFRLEVBQUUsb0JBQU07QUFDWixjQUFLLFlBQVksR0FBRywrQkFBa0IsQ0FBQztBQUN2QyxjQUFLLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxjQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQ3ZELEVBQUUsZ0JBQWdCLEVBQUU7dUJBQU0sTUFBSyxZQUFZLENBQUMsY0FBYyxFQUFFO2FBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN4RTtDQUNKIiwiZmlsZSI6Ii9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLXVucmVzb2x2ZWRcbmltcG9ydCBQeXRob25JbmRlbnQgZnJvbSBcIi4vcHl0aG9uLWluZGVudFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY29uZmlnOiB7XG4gICAgICAgIGhhbmdpbmdJbmRlbnRUYWJzOiB7XG4gICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgZGVmYXVsdDogMSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIk51bWJlciBvZiB0YWJzIHVzZWQgZm9yIF9oYW5naW5nXyBpbmRlbnRzXCIsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGFjdGl2YXRlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMucHl0aG9uSW5kZW50ID0gbmV3IFB5dGhvbkluZGVudCgpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFwiYXRvbS10ZXh0LWVkaXRvclwiLFxuICAgICAgICAgICAgeyBcImVkaXRvcjpuZXdsaW5lXCI6ICgpID0+IHRoaXMucHl0aG9uSW5kZW50LnByb3Blcmx5SW5kZW50KCkgfSkpO1xuICAgIH0sXG59O1xuIl19
//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/python-indent/lib/main.js
