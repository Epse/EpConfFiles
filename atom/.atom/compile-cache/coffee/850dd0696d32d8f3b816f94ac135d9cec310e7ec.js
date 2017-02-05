(function() {
  var BufferedProcess, Os, RepoListView, _prettify, _prettifyDiff, _prettifyUntracked, getRepoForCurrentFile, git, gitUntrackedFiles, notifier;

  Os = require('os');

  BufferedProcess = require('atom').BufferedProcess;

  RepoListView = require('./views/repo-list-view');

  notifier = require('./notifier');

  gitUntrackedFiles = function(repo, dataUnstaged) {
    var args;
    if (dataUnstaged == null) {
      dataUnstaged = [];
    }
    args = ['ls-files', '-o', '--exclude-standard'];
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return dataUnstaged.concat(_prettifyUntracked(data));
    });
  };

  _prettify = function(data) {
    var i, mode;
    if (data === '') {
      return [];
    }
    data = data.split(/\0/).slice(0, -1);
    return (function() {
      var j, len, results;
      results = [];
      for (i = j = 0, len = data.length; j < len; i = j += 2) {
        mode = data[i];
        results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  _prettifyUntracked = function(data) {
    if (data === '') {
      return [];
    }
    data = data.split(/\n/).filter(function(d) {
      return d !== '';
    });
    return data.map(function(file) {
      return {
        mode: '?',
        path: file
      };
    });
  };

  _prettifyDiff = function(data) {
    var line, ref;
    data = data.split(/^@@(?=[ \-\+\,0-9]*@@)/gm);
    [].splice.apply(data, [1, data.length - 1 + 1].concat(ref = (function() {
      var j, len, ref1, results;
      ref1 = data.slice(1);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        line = ref1[j];
        results.push('@@' + line);
      }
      return results;
    })())), ref;
    return data;
  };

  getRepoForCurrentFile = function() {
    return new Promise(function(resolve, reject) {
      var directory, path, project, ref;
      project = atom.project;
      path = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
      directory = project.getDirectories().filter(function(d) {
        return d.contains(path);
      })[0];
      if (directory != null) {
        return project.repositoryForDirectory(directory).then(function(repo) {
          var submodule;
          submodule = repo.repo.submoduleForPath(path);
          if (submodule != null) {
            return resolve(submodule);
          } else {
            return resolve(repo);
          }
        })["catch"](function(e) {
          return reject(e);
        });
      } else {
        return reject("no current file");
      }
    });
  };

  module.exports = git = {
    cmd: function(args, options, arg) {
      var color;
      if (options == null) {
        options = {
          env: process.env
        };
      }
      color = (arg != null ? arg : {}).color;
      return new Promise(function(resolve, reject) {
        var output, process, ref;
        output = '';
        if (color) {
          args = ['-c', 'color.ui=always'].concat(args);
        }
        process = new BufferedProcess({
          command: (ref = atom.config.get('git-plus.gitPath')) != null ? ref : 'git',
          args: args,
          options: options,
          stdout: function(data) {
            return output += data.toString();
          },
          stderr: function(data) {
            return output += data.toString();
          },
          exit: function(code) {
            if (code === 0) {
              return resolve(output);
            } else {
              return reject(output);
            }
          }
        });
        return process.onWillThrowError(function(errorObject) {
          notifier.addError('Git Plus is unable to locate the git command. Please ensure process.env.PATH can access git.');
          return reject("Couldn't find git");
        });
      });
    },
    getConfig: function(repo, setting) {
      return repo.getConfigValue(setting, repo.getWorkingDirectory());
    },
    reset: function(repo) {
      return git.cmd(['reset', 'HEAD'], {
        cwd: repo.getWorkingDirectory()
      }).then(function() {
        return notifier.addSuccess('All changes unstaged');
      });
    },
    status: function(repo) {
      return git.cmd(['status', '--porcelain', '-z'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (data.length > 2) {
          return data.split('\0').slice(0, -1);
        } else {
          return [];
        }
      });
    },
    refresh: function(repo) {
      if (repo) {
        if (typeof repo.refreshStatus === "function") {
          repo.refreshStatus();
        }
        return typeof repo.refreshIndex === "function" ? repo.refreshIndex() : void 0;
      } else {
        return atom.project.getRepositories().forEach(function(repo) {
          if (repo != null) {
            return repo.refreshStatus();
          }
        });
      }
    },
    relativize: function(path) {
      var ref, ref1, ref2, ref3;
      return (ref = (ref1 = (ref2 = git.getSubmodule(path)) != null ? ref2.relativize(path) : void 0) != null ? ref1 : (ref3 = atom.project.getRepositories()[0]) != null ? ref3.relativize(path) : void 0) != null ? ref : path;
    },
    diff: function(repo, path) {
      return git.cmd(['diff', '-p', '-U1', path], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettifyDiff(data);
      });
    },
    stagedFiles: function(repo, stdout) {
      var args;
      args = ['diff-index', '--cached', 'HEAD', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettify(data);
      })["catch"](function(error) {
        if (error.includes("ambiguous argument 'HEAD'")) {
          return Promise.resolve([1]);
        } else {
          notifier.addError(error);
          return Promise.resolve([]);
        }
      });
    },
    unstagedFiles: function(repo, arg) {
      var args, showUntracked;
      showUntracked = (arg != null ? arg : {}).showUntracked;
      args = ['diff-files', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (showUntracked) {
          return gitUntrackedFiles(repo, _prettify(data));
        } else {
          return _prettify(data);
        }
      });
    },
    add: function(repo, arg) {
      var args, file, ref, update;
      ref = arg != null ? arg : {}, file = ref.file, update = ref.update;
      args = ['add'];
      if (update) {
        args.push('--update');
      } else {
        args.push('--all');
      }
      args.push(file ? file : '.');
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(output) {
        if (output !== false) {
          return notifier.addSuccess("Added " + (file != null ? file : 'all files'));
        }
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    },
    getRepo: function() {
      return new Promise(function(resolve, reject) {
        return getRepoForCurrentFile().then(function(repo) {
          return resolve(repo);
        })["catch"](function(e) {
          var repos;
          repos = atom.project.getRepositories().filter(function(r) {
            return r != null;
          });
          if (repos.length === 0) {
            return reject("No repos found");
          } else if (repos.length > 1) {
            return resolve(new RepoListView(repos).result);
          } else {
            return resolve(repos[0]);
          }
        });
      });
    },
    getSubmodule: function(path) {
      var ref, ref1, ref2;
      if (path == null) {
        path = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
      }
      return (ref1 = atom.project.getRepositories().filter(function(r) {
        var ref2;
        return r != null ? (ref2 = r.repo) != null ? ref2.submoduleForPath(path) : void 0 : void 0;
      })[0]) != null ? (ref2 = ref1.repo) != null ? ref2.submoduleForPath(path) : void 0 : void 0;
    },
    dir: function(andSubmodules) {
      if (andSubmodules == null) {
        andSubmodules = true;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var submodule;
          if (andSubmodules && (submodule = git.getSubmodule())) {
            return resolve(submodule.getWorkingDirectory());
          } else {
            return git.getRepo().then(function(repo) {
              return resolve(repo.getWorkingDirectory());
            });
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9naXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUVwQixZQUFBLEdBQWUsT0FBQSxDQUFRLHdCQUFSOztFQUNmLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxpQkFBQSxHQUFvQixTQUFDLElBQUQsRUFBTyxZQUFQO0FBQ2xCLFFBQUE7O01BRHlCLGVBQWE7O0lBQ3RDLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLG9CQUFuQjtXQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUNKLFlBQVksQ0FBQyxNQUFiLENBQW9CLGtCQUFBLENBQW1CLElBQW5CLENBQXBCO0lBREksQ0FETjtFQUZrQjs7RUFNcEIsU0FBQSxHQUFZLFNBQUMsSUFBRDtBQUNWLFFBQUE7SUFBQSxJQUFhLElBQUEsS0FBUSxFQUFyQjtBQUFBLGFBQU8sR0FBUDs7SUFDQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLENBQWlCOzs7QUFDbkI7V0FBQSxpREFBQTs7cUJBQ0g7VUFBQyxNQUFBLElBQUQ7VUFBTyxJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQWxCOztBQURHOzs7RUFISzs7RUFTWixrQkFBQSxHQUFxQixTQUFDLElBQUQ7SUFDbkIsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcs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QUMsTUFBL0IsQ0FBc0MsU0FBQyxDQUFEO21CQUFPO1VBQVAsQ0FBdEM7VUFDUixJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO21CQUNFLE1BQUEsQ0FBTyxnQkFBUCxFQURGO1dBQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7bUJBQ0gsT0FBQSxDQUFRLElBQUksWUFBQSxDQUFhLEtBQWIsQ0FBbUIsQ0FBQyxNQUFoQyxFQURHO1dBQUEsTUFBQTttQkFHSCxPQUFBLENBQVEsS0FBTSxDQUFBLENBQUEsQ0FBZCxFQUhHOztRQUpBLENBRFA7TUFEVSxDQUFSO0lBREcsQ0ExRVQ7SUFzRkEsWUFBQSxFQUFjLFNBQUMsSUFBRDtBQUNaLFVBQUE7O1FBQUEsaUVBQTRDLENBQUUsT0FBdEMsQ0FBQTs7Ozs7d0RBR0UsQ0FBRSxnQkFGWixDQUU2QixJQUY3QjtJQUZZLENBdEZkO0lBNEZBLEdBQUEsRUFBSyxTQUFDLGFBQUQ7O1FBQUMsZ0JBQWM7O2FBQ2QsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1YsY0FBQTtVQUFBLElBQUcsYUFBQSxJQUFrQixDQUFBLFNBQUEsR0FBWSxHQUFHLENBQUMsWUFBSixDQUFBLENBQVosQ0FBckI7bUJBQ0UsT0FBQSxDQUFRLFNBQVMsQ0FBQyxtQkFBVixDQUFBLENBQVIsRUFERjtXQUFBLE1BQUE7bUJBR0UsR0FBRyxDQUFDLE9BQUosQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFtQixTQUFDLElBQUQ7cUJBQVUsT0FBQSxDQUFRLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVI7WUFBVixDQUFuQixFQUhGOztRQURVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBREQsQ0E1Rkw7O0FBOUNGIiwic291cmNlc0NvbnRlbnQiOlsiT3MgPSByZXF1aXJlICdvcydcbntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcblxuUmVwb0xpc3RWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9yZXBvLWxpc3Qtdmlldydcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi9ub3RpZmllcidcblxuZ2l0VW50cmFja2VkRmlsZXMgPSAocmVwbywgZGF0YVVuc3RhZ2VkPVtdKSAtPlxuICBhcmdzID0gWydscy1maWxlcycsICctbycsICctLWV4Y2x1ZGUtc3RhbmRhcmQnXVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIGRhdGFVbnN0YWdlZC5jb25jYXQoX3ByZXR0aWZ5VW50cmFja2VkKGRhdGEpKVxuXG5fcHJldHRpZnkgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcMC8pWy4uLi0xXVxuICBbXSA9IGZvciBtb2RlLCBpIGluIGRhdGEgYnkgMlxuICAgIHttb2RlLCBwYXRoOiBkYXRhW2krMV0gfVxuICAjIGRhdGEgPSBkYXRhLnNwbGl0KC9cXG4vKVxuICAjIGRhdGEuZmlsdGVyKChmaWxlKSAtPiBmaWxlIGlzbnQgJycpLm1hcCAoZmlsZSkgLT5cbiAgIyAgIHttb2RlOiBmaWxlWzBdLCBwYXRoOiBmaWxlLnN1YnN0cmluZygxKS50cmltKCl9XG5cbl9wcmV0dGlmeVVudHJhY2tlZCA9IChkYXRhKSAtPlxuICByZXR1cm4gW10gaWYgZGF0YSBpcyAnJ1xuICBkYXRhID0gZGF0YS5zcGxpdCgvXFxuLykuZmlsdGVyIChkKSAtPiBkIGlzbnQgJydcbiAgZGF0YS5tYXAgKGZpbGUpIC0+IHttb2RlOiAnPycsIHBhdGg6IGZpbGV9XG5cbl9wcmV0dGlmeURpZmYgPSAoZGF0YSkgLT5cbiAgZGF0YSA9IGRhdGEuc3BsaXQoL15AQCg/PVsgXFwtXFwrXFwsMC05XSpAQCkvZ20pXG4gIGRhdGFbMS4uZGF0YS5sZW5ndGhdID0gKCdAQCcgKyBsaW5lIGZvciBsaW5lIGluIGRhdGFbMS4uXSlcbiAgZGF0YVxuXG5nZXRSZXBvRm9yQ3VycmVudEZpbGUgPSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHByb2plY3QgPSBhdG9tLnByb2plY3RcbiAgICBwYXRoID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKClcbiAgICBkaXJlY3RvcnkgPSBwcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKChkKSAtPiBkLmNvbnRhaW5zKHBhdGgpKVswXVxuICAgIGlmIGRpcmVjdG9yeT9cbiAgICAgIHByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShkaXJlY3RvcnkpLnRoZW4gKHJlcG8pIC0+XG4gICAgICAgIHN1Ym1vZHVsZSA9IHJlcG8ucmVwby5zdWJtb2R1bGVGb3JQYXRoKHBhdGgpXG4gICAgICAgIGlmIHN1Ym1vZHVsZT8gdGhlbiByZXNvbHZlKHN1Ym1vZHVsZSkgZWxzZSByZXNvbHZlKHJlcG8pXG4gICAgICAuY2F0Y2ggKGUpIC0+XG4gICAgICAgIHJlamVjdChlKVxuICAgIGVsc2VcbiAgICAgIHJlamVjdCBcIm5vIGN1cnJlbnQgZmlsZVwiXG5cbm1vZHVsZS5leHBvcnRzID0gZ2l0ID1cbiAgY21kOiAoYXJncywgb3B0aW9ucz17IGVudjogcHJvY2Vzcy5lbnZ9LCB7Y29sb3J9PXt9KSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBvdXRwdXQgPSAnJ1xuICAgICAgYXJncyA9IFsnLWMnLCAnY29sb3IudWk9YWx3YXlzJ10uY29uY2F0KGFyZ3MpIGlmIGNvbG9yXG4gICAgICBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgICBjb21tYW5kOiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdpdFBhdGgnKSA/ICdnaXQnXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICBzdGRvdXQ6IChkYXRhKSAtPiBvdXRwdXQgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgIHN0ZGVycjogKGRhdGEpIC0+XG4gICAgICAgICAgb3V0cHV0ICs9IGRhdGEudG9TdHJpbmcoKVxuICAgICAgICBleGl0OiAoY29kZSkgLT5cbiAgICAgICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgICAgIHJlc29sdmUgb3V0cHV0XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVqZWN0IG91dHB1dFxuICAgICAgcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yIChlcnJvck9iamVjdCkgLT5cbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgJ0dpdCBQbHVzIGlzIHVuYWJsZSB0byBsb2NhdGUgdGhlIGdpdCBjb21tYW5kLiBQbGVhc2UgZW5zdXJlIHByb2Nlc3MuZW52LlBBVEggY2FuIGFjY2VzcyBnaXQuJ1xuICAgICAgICByZWplY3QgXCJDb3VsZG4ndCBmaW5kIGdpdFwiXG5cbiAgZ2V0Q29uZmlnOiAocmVwbywgc2V0dGluZykgLT4gcmVwby5nZXRDb25maWdWYWx1ZSBzZXR0aW5nLCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIHJlc2V0OiAocmVwbykgLT5cbiAgICBnaXQuY21kKFsncmVzZXQnLCAnSEVBRCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50aGVuICgpIC0+IG5vdGlmaWVyLmFkZFN1Y2Nlc3MgJ0FsbCBjaGFuZ2VzIHVuc3RhZ2VkJ1xuXG4gIHN0YXR1czogKHJlcG8pIC0+XG4gICAgZ2l0LmNtZChbJ3N0YXR1cycsICctLXBvcmNlbGFpbicsICcteiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBpZiBkYXRhLmxlbmd0aCA+IDIgdGhlbiBkYXRhLnNwbGl0KCdcXDAnKVsuLi4tMV0gZWxzZSBbXVxuXG4gIHJlZnJlc2g6IChyZXBvKSAtPlxuICAgIGlmIHJlcG9cbiAgICAgIHJlcG8ucmVmcmVzaFN0YXR1cz8oKVxuICAgICAgcmVwby5yZWZyZXNoSW5kZXg/KClcbiAgICBlbHNlXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZm9yRWFjaCAocmVwbykgLT4gcmVwby5yZWZyZXNoU3RhdHVzKCkgaWYgcmVwbz9cblxuICByZWxhdGl2aXplOiAocGF0aCkgLT5cbiAgICBnaXQuZ2V0U3VibW9kdWxlKHBhdGgpPy5yZWxhdGl2aXplKHBhdGgpID8gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpWzBdPy5yZWxhdGl2aXplKHBhdGgpID8gcGF0aFxuXG4gIGRpZmY6IChyZXBvLCBwYXRoKSAtPlxuICAgIGdpdC5jbWQoWydkaWZmJywgJy1wJywgJy1VMScsIHBhdGhdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBfcHJldHRpZnlEaWZmKGRhdGEpXG5cbiAgc3RhZ2VkRmlsZXM6IChyZXBvLCBzdGRvdXQpIC0+XG4gICAgYXJncyA9IFsnZGlmZi1pbmRleCcsICctLWNhY2hlZCcsICdIRUFEJywgJy0tbmFtZS1zdGF0dXMnLCAnLXonXVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIF9wcmV0dGlmeSBkYXRhXG4gICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yLmluY2x1ZGVzIFwiYW1iaWd1b3VzIGFyZ3VtZW50ICdIRUFEJ1wiXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSBbMV1cbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyb3JcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlIFtdXG5cbiAgdW5zdGFnZWRGaWxlczogKHJlcG8sIHtzaG93VW50cmFja2VkfT17fSkgLT5cbiAgICBhcmdzID0gWydkaWZmLWZpbGVzJywgJy0tbmFtZS1zdGF0dXMnLCAnLXonXVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIHNob3dVbnRyYWNrZWRcbiAgICAgICAgZ2l0VW50cmFja2VkRmlsZXMocmVwbywgX3ByZXR0aWZ5KGRhdGEpKVxuICAgICAgZWxzZVxuICAgICAgICBfcHJldHRpZnkoZGF0YSlcblxuICBhZGQ6IChyZXBvLCB7ZmlsZSwgdXBkYXRlfT17fSkgLT5cbiAgICBhcmdzID0gWydhZGQnXVxuICAgIGlmIHVwZGF0ZSB0aGVuIGFyZ3MucHVzaCAnLS11cGRhdGUnIGVsc2UgYXJncy5wdXNoICctLWFsbCdcbiAgICBhcmdzLnB1c2goaWYgZmlsZSB0aGVuIGZpbGUgZWxzZSAnLicpXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChvdXRwdXQpIC0+XG4gICAgICBpZiBvdXRwdXQgaXNudCBmYWxzZVxuICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzIFwiQWRkZWQgI3tmaWxlID8gJ2FsbCBmaWxlcyd9XCJcbiAgICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkRXJyb3IgbXNnXG5cbiAgZ2V0UmVwbzogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZ2V0UmVwb0ZvckN1cnJlbnRGaWxlKCkudGhlbiAocmVwbykgLT4gcmVzb2x2ZShyZXBvKVxuICAgICAgLmNhdGNoIChlKSAtPlxuICAgICAgICByZXBvcyA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIgKHIpIC0+IHI/XG4gICAgICAgIGlmIHJlcG9zLmxlbmd0aCBpcyAwXG4gICAgICAgICAgcmVqZWN0KFwiTm8gcmVwb3MgZm91bmRcIilcbiAgICAgICAgZWxzZSBpZiByZXBvcy5sZW5ndGggPiAxXG4gICAgICAgICAgcmVzb2x2ZShuZXcgUmVwb0xpc3RWaWV3KHJlcG9zKS5yZXN1bHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXNvbHZlKHJlcG9zWzBdKVxuXG4gIGdldFN1Ym1vZHVsZTogKHBhdGgpIC0+XG4gICAgcGF0aCA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoKHIpIC0+XG4gICAgICByPy5yZXBvPy5zdWJtb2R1bGVGb3JQYXRoIHBhdGhcbiAgICApWzBdPy5yZXBvPy5zdWJtb2R1bGVGb3JQYXRoIHBhdGhcblxuICBkaXI6IChhbmRTdWJtb2R1bGVzPXRydWUpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGlmIGFuZFN1Ym1vZHVsZXMgYW5kIHN1Ym1vZHVsZSA9IGdpdC5nZXRTdWJtb2R1bGUoKVxuICAgICAgICByZXNvbHZlKHN1Ym1vZHVsZS5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5nZXRSZXBvKCkudGhlbiAocmVwbykgLT4gcmVzb2x2ZShyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiJdfQ==
