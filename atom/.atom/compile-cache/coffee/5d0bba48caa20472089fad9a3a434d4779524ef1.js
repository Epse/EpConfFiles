(function() {
  var FRONT_MATTER_REGEX, FrontMatter, yaml;

  yaml = require("js-yaml");

  FRONT_MATTER_REGEX = /^(?:---\s*$)?([^:]+:[\s\S]*?)^---\s*$/m;

  module.exports = FrontMatter = (function() {
    function FrontMatter(editor, options) {
      if (options == null) {
        options = {};
      }
      this.editor = editor;
      this.options = options;
      this.content = {};
      this.leadingFence = true;
      this.isEmpty = true;
      this.parseError = null;
      this._findFrontMatter((function(_this) {
        return function(match) {
          var error;
          try {
            _this.content = yaml.safeLoad(match.match[1].trim()) || {};
            _this.leadingFence = match.matchText.startsWith("---");
            return _this.isEmpty = false;
          } catch (_error) {
            error = _error;
            _this.parseError = error;
            _this.content = {};
            if (options["silent"] !== true) {
              return atom.confirm({
                message: "[Markdown Writer] Error!",
                detailedMessage: "Invalid Front Matter:\n" + error.message,
                buttons: ['OK']
              });
            }
          }
        };
      })(this));
    }

    FrontMatter.prototype._findFrontMatter = function(onMatch) {
      return this.editor.buffer.scan(FRONT_MATTER_REGEX, onMatch);
    };

    FrontMatter.prototype.normalizeField = function(field) {
      if (Object.prototype.toString.call(this.content[field]) === "[object Array]") {
        return this.content[field];
      } else if (typeof this.content[field] === "string") {
        return this.content[field] = [this.content[field]];
      } else {
        return this.content[field] = [];
      }
    };

    FrontMatter.prototype.has = function(field) {
      return field && (this.content[field] != null);
    };

    FrontMatter.prototype.get = function(field) {
      return this.content[field];
    };

    FrontMatter.prototype.getArray = function(field) {
      this.normalizeField(field);
      return this.content[field];
    };

    FrontMatter.prototype.set = function(field, content) {
      return this.content[field] = content;
    };

    FrontMatter.prototype.setIfExists = function(field, content) {
      if (this.has(field)) {
        return this.content[field] = content;
      }
    };

    FrontMatter.prototype.getContent = function() {
      return JSON.parse(JSON.stringify(this.content));
    };

    FrontMatter.prototype.getContentText = function() {
      var text;
      text = yaml.safeDump(this.content);
      if (this.leadingFence) {
        return ["---", "" + text + "---", ""].join("\n");
      } else {
        return ["" + text + "---", ""].join("\n");
      }
    };

    FrontMatter.prototype.save = function() {
      return this._findFrontMatter((function(_this) {
        return function(match) {
          return match.replace(_this.getContentText());
        };
      })(this));
    };

    return FrontMatter;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2hlbHBlcnMvZnJvbnQtbWF0dGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQ0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxrQkFBQSxHQUFxQix3Q0FGckIsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFHUyxJQUFBLHFCQUFDLE1BQUQsRUFBUyxPQUFULEdBQUE7O1FBQVMsVUFBVTtPQUM5QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBRlgsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFIaEIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUpYLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFMZCxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2hCLGNBQUEsS0FBQTtBQUFBO0FBQ0UsWUFBQSxLQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFmLENBQUEsQ0FBZCxDQUFBLElBQXdDLEVBQW5ELENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxZQUFELEdBQWdCLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBaEIsQ0FBMkIsS0FBM0IsQ0FEaEIsQ0FBQTttQkFFQSxLQUFDLENBQUEsT0FBRCxHQUFXLE1BSGI7V0FBQSxjQUFBO0FBS0UsWUFESSxjQUNKLENBQUE7QUFBQSxZQUFBLEtBQUMsQ0FBQSxVQUFELEdBQWMsS0FBZCxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXLEVBRFgsQ0FBQTtBQUVBLFlBQUEsSUFBTyxPQUFRLENBQUEsUUFBQSxDQUFSLEtBQXFCLElBQTVCO3FCQUNFLElBQUksQ0FBQyxPQUFMLENBQ0U7QUFBQSxnQkFBQSxPQUFBLEVBQVMsMEJBQVQ7QUFBQSxnQkFDQSxlQUFBLEVBQWtCLHlCQUFBLEdBQXlCLEtBQUssQ0FBQyxPQURqRDtBQUFBLGdCQUVBLE9BQUEsRUFBUyxDQUFDLElBQUQsQ0FGVDtlQURGLEVBREY7YUFQRjtXQURnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLENBUkEsQ0FEVztJQUFBLENBQWI7O0FBQUEsMEJBdUJBLGdCQUFBLEdBQWtCLFNBQUMsT0FBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQWYsQ0FBb0Isa0JBQXBCLEVBQXdDLE9BQXhDLEVBRGdCO0lBQUEsQ0F2QmxCLENBQUE7O0FBQUEsMEJBMkJBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEdBQUE7QUFDZCxNQUFBLElBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBMUIsQ0FBK0IsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQXhDLENBQUEsS0FBbUQsZ0JBQXREO2VBQ0UsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLEVBRFg7T0FBQSxNQUVLLElBQUcsTUFBQSxDQUFBLElBQVEsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFoQixLQUEwQixRQUE3QjtlQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCLENBQUMsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVYsRUFEZjtPQUFBLE1BQUE7ZUFHSCxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsQ0FBVCxHQUFrQixHQUhmO09BSFM7SUFBQSxDQTNCaEIsQ0FBQTs7QUFBQSwwQkFtQ0EsR0FBQSxHQUFLLFNBQUMsS0FBRCxHQUFBO2FBQVcsS0FBQSxJQUFTLDhCQUFwQjtJQUFBLENBbkNMLENBQUE7O0FBQUEsMEJBcUNBLEdBQUEsR0FBSyxTQUFDLEtBQUQsR0FBQTthQUFXLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxFQUFwQjtJQUFBLENBckNMLENBQUE7O0FBQUEsMEJBdUNBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLEVBRkQ7SUFBQSxDQXZDVixDQUFBOztBQUFBLDBCQTJDQSxHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO2FBQW9CLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCLFFBQXRDO0lBQUEsQ0EzQ0wsQ0FBQTs7QUFBQSwwQkE2Q0EsV0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNYLE1BQUEsSUFBNkIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLENBQTdCO2VBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVQsR0FBa0IsUUFBbEI7T0FEVztJQUFBLENBN0NiLENBQUE7O0FBQUEsMEJBZ0RBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE9BQWhCLENBQVgsRUFBSDtJQUFBLENBaERaLENBQUE7O0FBQUEsMEJBa0RBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsT0FBZixDQUFQLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQyxDQUFBLFlBQUo7ZUFDRSxDQUFDLEtBQUQsRUFBUSxFQUFBLEdBQUcsSUFBSCxHQUFRLEtBQWhCLEVBQXNCLEVBQXRCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0IsRUFERjtPQUFBLE1BQUE7ZUFHRSxDQUFDLEVBQUEsR0FBRyxJQUFILEdBQVEsS0FBVCxFQUFlLEVBQWYsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUhGO09BRmM7SUFBQSxDQWxEaEIsQ0FBQTs7QUFBQSwwQkF5REEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFDLENBQUEsY0FBRCxDQUFBLENBQWQsRUFBWDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLEVBREk7SUFBQSxDQXpETixDQUFBOzt1QkFBQTs7TUFmRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/markdown-writer/lib/helpers/front-matter.coffee
