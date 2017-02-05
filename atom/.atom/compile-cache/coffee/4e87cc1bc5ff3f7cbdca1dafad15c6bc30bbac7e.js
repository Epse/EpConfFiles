(function() {
  var AutoComplete, Ex, fs, os, path;

  fs = require('fs');

  path = require('path');

  os = require('os');

  Ex = require('./ex');

  module.exports = AutoComplete = (function() {
    function AutoComplete(commands) {
      this.commands = commands;
      this.resetCompletion();
    }

    AutoComplete.prototype.resetCompletion = function() {
      this.autoCompleteIndex = 0;
      this.autoCompleteText = null;
      return this.completions = [];
    };

    AutoComplete.prototype.expandTilde = function(filePath) {
      if (filePath.charAt(0) === '~') {
        return os.homedir() + filePath.slice(1);
      } else {
        return filePath;
      }
    };

    AutoComplete.prototype.getAutocomplete = function(text) {
      var cmd, filePath, parts;
      if (!this.autoCompleteText) {
        this.autoCompleteText = text;
      }
      parts = this.autoCompleteText.split(' ');
      cmd = parts[0];
      if (parts.length > 1) {
        filePath = parts.slice(1).join(' ');
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getFilePathCompletion(cmd, filePath);
          };
        })(this));
      } else {
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getCommandCompletion(cmd);
          };
        })(this));
      }
    };

    AutoComplete.prototype.filterByPrefix = function(commands, prefix) {
      return commands.sort().filter((function(_this) {
        return function(f) {
          return f.startsWith(prefix);
        };
      })(this));
    };

    AutoComplete.prototype.getCompletion = function(completeFunc) {
      var complete;
      if (this.completions.length === 0) {
        this.completions = completeFunc();
      }
      complete = '';
      if (this.completions.length) {
        complete = this.completions[this.autoCompleteIndex % this.completions.length];
        this.autoCompleteIndex++;
        if (complete.endsWith('/') && this.completions.length === 1) {
          this.resetCompletion();
        }
      }
      return complete;
    };

    AutoComplete.prototype.getCommandCompletion = function(command) {
      return this.filterByPrefix(this.commands, command);
    };

    AutoComplete.prototype.getFilePathCompletion = function(command, filePath) {
      var baseName, basePath, basePathStat, err, files;
      filePath = this.expandTilde(filePath);
      if (filePath.endsWith(path.sep)) {
        basePath = path.dirname(filePath + '.');
        baseName = '';
      } else {
        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);
      }
      try {
        basePathStat = fs.statSync(basePath);
        if (basePathStat.isDirectory()) {
          files = fs.readdirSync(basePath);
          return this.filterByPrefix(files, baseName).map((function(_this) {
            return function(f) {
              filePath = path.join(basePath, f);
              if (fs.lstatSync(filePath).isDirectory()) {
                return command + ' ' + filePath + path.sep;
              } else {
                return command + ' ' + filePath;
              }
            };
          })(this));
        }
        return [];
      } catch (error) {
        err = error;
        return [];
      }
    };

    return AutoComplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2F1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUMsUUFBRDtNQUNYLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsZUFBRCxDQUFBO0lBRlc7OzJCQUliLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtNQUNyQixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7YUFDcEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUhBOzsyQkFLakIsV0FBQSxHQUFhLFNBQUMsUUFBRDtNQUNYLElBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsQ0FBaEIsQ0FBQSxLQUFzQixHQUF6QjtBQUNFLGVBQU8sRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFBLEdBQWUsUUFBUSxDQUFDLEtBQVQsQ0FBZSxDQUFmLEVBRHhCO09BQUEsTUFBQTtBQUdFLGVBQU8sU0FIVDs7SUFEVzs7MkJBTWIsZUFBQSxHQUFpQixTQUFDLElBQUQ7QUFDZixVQUFBO01BQUEsSUFBRyxDQUFDLElBQUMsQ0FBQSxnQkFBTDtRQUNFLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixLQUR0Qjs7TUFHQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLEtBQWxCLENBQXdCLEdBQXhCO01BQ1IsR0FBQSxHQUFNLEtBQU0sQ0FBQSxDQUFBO01BRVosSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENB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R0FBVixHQUFnQixTQUh6Qjs7WUFGMEM7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBRlQ7O0FBU0EsZUFBTyxHQVhUO09BQUEsYUFBQTtRQVlNO0FBQ0osZUFBTyxHQWJUOztJQVZtQjs7Ozs7QUF4RHpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xub3MgPSByZXF1aXJlICdvcydcbkV4ID0gcmVxdWlyZSAnLi9leCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXV0b0NvbXBsZXRlXG4gIGNvbnN0cnVjdG9yOiAoY29tbWFuZHMpIC0+XG4gICAgQGNvbW1hbmRzID0gY29tbWFuZHNcbiAgICBAcmVzZXRDb21wbGV0aW9uKClcblxuICByZXNldENvbXBsZXRpb246ICgpIC0+XG4gICAgQGF1dG9Db21wbGV0ZUluZGV4ID0gMFxuICAgIEBhdXRvQ29tcGxldGVUZXh0ID0gbnVsbFxuICAgIEBjb21wbGV0aW9ucyA9IFtdXG5cbiAgZXhwYW5kVGlsZGU6IChmaWxlUGF0aCkgLT5cbiAgICBpZiBmaWxlUGF0aC5jaGFyQXQoMCkgPT0gJ34nXG4gICAgICByZXR1cm4gb3MuaG9tZWRpcigpICsgZmlsZVBhdGguc2xpY2UoMSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmlsZVBhdGhcblxuICBnZXRBdXRvY29tcGxldGU6ICh0ZXh0KSAtPlxuICAgIGlmICFAYXV0b0NvbXBsZXRlVGV4dFxuICAgICAgQGF1dG9Db21wbGV0ZVRleHQgPSB0ZXh0XG5cbiAgICBwYXJ0cyA9IEBhdXRvQ29tcGxldGVUZXh0LnNwbGl0KCcgJylcbiAgICBjbWQgPSBwYXJ0c1swXVxuXG4gICAgaWYgcGFydHMubGVuZ3RoID4gMVxuICAgICAgZmlsZVBhdGggPSBwYXJ0cy5zbGljZSgxKS5qb2luKCcgJylcbiAgICAgIHJldHVybiBAZ2V0Q29tcGxldGlvbigoKSA9PiBAZ2V0RmlsZVBhdGhDb21wbGV0aW9uKGNtZCwgZmlsZVBhdGgpKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBAZ2V0Q29tcGxldGlvbigoKSA9PiBAZ2V0Q29tbWFuZENvbXBsZXRpb24oY21kKSlcblxuICBmaWx0ZXJCeVByZWZpeDogKGNvbW1hbmRzLCBwcmVmaXgpIC0+XG4gICAgY29tbWFuZHMuc29ydCgpLmZpbHRlcigoZikgPT4gZi5zdGFydHNXaXRoKHByZWZpeCkpXG5cbiAgZ2V0Q29tcGxldGlvbjogKGNvbXBsZXRlRnVuYykgLT5cbiAgICBpZiBAY29tcGxldGlvbnMubGVuZ3RoID09IDBcbiAgICAgIEBjb21wbGV0aW9ucyA9IGNvbXBsZXRlRnVuYygpXG5cbiAgICBjb21wbGV0ZSA9ICcnXG4gICAgaWYgQGNvbXBsZXRpb25zLmxlbmd0aFxuICAgICAgY29tcGxldGUgPSBAY29tcGxldGlvbnNbQGF1dG9Db21wbGV0ZUluZGV4ICUgQGNvbXBsZXRpb25zLmxlbmd0aF1cbiAgICAgIEBhdXRvQ29tcGxldGVJbmRleCsrXG5cbiAgICAgICMgT25seSBvbmUgcmVzdWx0IHNvIGxldHMgcmV0dXJuIHRoaXMgZGlyZWN0b3J5XG4gICAgICBpZiBjb21wbGV0ZS5lbmRzV2l0aCgnLycpICYmIEBjb21wbGV0aW9ucy5sZW5ndGggPT0gMVxuICAgICAgICBAcmVzZXRDb21wbGV0aW9uKClcblxuICAgIHJldHVybiBjb21wbGV0ZVxuXG4gIGdldENvbW1hbmRDb21wbGV0aW9uOiAoY29tbWFuZCkgLT5cbiAgICByZXR1cm4gQGZpbHRlckJ5UHJlZml4KEBjb21tYW5kcywgY29tbWFuZClcblxuICBnZXRGaWxlUGF0aENvbXBsZXRpb246IChjb21tYW5kLCBmaWxlUGF0aCkgLT5cbiAgICAgIGZpbGVQYXRoID0gQGV4cGFuZFRpbGRlKGZpbGVQYXRoKVxuXG4gICAgICBpZiBmaWxlUGF0aC5lbmRzV2l0aChwYXRoLnNlcClcbiAgICAgICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGggKyAnLicpXG4gICAgICAgIGJhc2VOYW1lID0gJydcbiAgICAgIGVsc2VcbiAgICAgICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgIGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aClcblxuICAgICAgdHJ5XG4gICAgICAgIGJhc2VQYXRoU3RhdCA9IGZzLnN0YXRTeW5jKGJhc2VQYXRoKVxuICAgICAgICBpZiBiYXNlUGF0aFN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmMoYmFzZVBhdGgpXG4gICAgICAgICAgcmV0dXJuIEBmaWx0ZXJCeVByZWZpeChmaWxlcywgYmFzZU5hbWUpLm1hcCgoZikgPT5cbiAgICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCBmKVxuICAgICAgICAgICAgaWYgZnMubHN0YXRTeW5jKGZpbGVQYXRoKS5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgIHJldHVybiBjb21tYW5kICsgJyAnICsgZmlsZVBhdGggICsgcGF0aC5zZXBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbW1hbmQgKyAnICcgKyBmaWxlUGF0aFxuICAgICAgICAgIClcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgcmV0dXJuIFtdXG4iXX0=
