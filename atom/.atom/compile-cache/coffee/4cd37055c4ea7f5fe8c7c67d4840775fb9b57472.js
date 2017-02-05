(function() {
  var Ex, ExClass, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  ExClass = require('../lib/ex');

  Ex = ExClass.singleton();

  describe("the commands", function() {
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, openEx, projectPath, ref, submitNormalModeInputText, vimState;
    ref = [], editor = ref[0], editorElement = ref[1], vimState = ref[2], exState = ref[3], dir = ref[4], dir2 = ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        dir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        dir2 = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        fs.makeTreeSync(dir);
        fs.makeTreeSync(dir2);
        atom.project.setPaths([dir, dir2]);
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          atom.commands.dispatch(element.getModel().normalModeInputView.editorElement, "core:cancel");
          editorElement = element;
          editor = editorElement.getModel();
          vimState = vimMode.mainModule.getEditorState(editor);
          exState = exMode.mainModule.exStates.get(editor);
          vimState.activateNormalMode();
          vimState.resetNormalMode();
          return editor.setText("abc\ndef\nabc\ndef");
        });
      });
    });
    afterEach(function() {
      fs.removeSync(dir);
      return fs.removeSync(dir2);
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    normalModeInputKeydown = function(key, opts) {
      if (opts == null) {
        opts = {};
      }
      return editor.normalModeInputView.editorElement.getModel().setText(key);
    };
    submitNormalModeInputText = function(text) {
      var commandEditor;
      commandEditor = editor.normalModeInputView.editorElement;
      commandEditor.getModel().setText(text);
      return atom.commands.dispatch(commandEditor, "core:confirm");
    };
    openEx = function() {
      return atom.commands.dispatch(editorElement, "ex-mode:open");
    };
    describe("as a motion", function() {
      beforeEach(function() {
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("moves the cursor to a specific line", function() {
        openEx();
        submitNormalModeInputText('2');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
      it("moves to the second address", function() {
        openEx();
        submitNormalModeInputText('1,3');
        return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
      });
      it("works with offsets", function() {
        openEx();
        submitNormalModeInputText('2+1');
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        openEx();
        submitNormalModeInputText('-2');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("limits to the last line", function() {
        openEx();
        submitNormalModeInputText('10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('3,10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('$+1000');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("goes to the first line with address 0", function() {
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0,0');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("doesn't move when the address is the current line", function() {
        openEx();
        submitNormalModeInputText('.');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        openEx();
        submitNormalModeInputText(',');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("moves to the last line", function() {
        openEx();
        submitNormalModeInputText('$');
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
      });
      it("moves to a mark's line", function() {
        keydown('l');
        keydown('m');
        normalModeInputKeydown('a');
        keydown('j');
        openEx();
        submitNormalModeInputText("'a");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      return it("moves to a specified search", function() {
        openEx();
        submitNormalModeInputText('/def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('?def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([3, 0]);
        openEx();
        submitNormalModeInputText('/ef');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
    });
    describe(":write", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('write-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('write');
          expect(fs.existsSync(filePath)).toBe(true);
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
          return expect(editor.isModified()).toBe(false);
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("write-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("saves the file", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('write');
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc');
          return expect(editor.isModified()).toBe(false);
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("write " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(true);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('write path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('write-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("write " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :write!", function() {
            openEx();
            submitNormalModeInputText("write! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":wall", function() {
      return it("saves all", function() {
        spyOn(atom.workspace, 'saveAll');
        openEx();
        submitNormalModeInputText('wall');
        return expect(atom.workspace.saveAll).toHaveBeenCalled();
      });
    });
    describe(":saveas", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('saveas-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('saveas');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("saveas-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("complains if no path given", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Argument required');
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("saveas " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(false);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('saveas path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('saveas-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("saveas " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :saveas!", function() {
            openEx();
            submitNormalModeInputText("saveas! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":quit", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'destroyActiveItem').andCallThrough();
          return atom.workspace.open();
        });
      });
      it("closes the active pane item if not modified", function() {
        openEx();
        submitNormalModeInputText('quit');
        expect(pane.destroyActiveItem).toHaveBeenCalled();
        return expect(pane.getItems().length).toBe(1);
      });
      return describe("when the active pane item is modified", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('def');
        });
        return it("opens the prompt to save", function() {
          spyOn(pane, 'promptToSaveItem');
          openEx();
          submitNormalModeInputText('quit');
          return expect(pane.promptToSaveItem).toHaveBeenCalled();
        });
      });
    });
    describe(":quitall", function() {
      return it("closes Atom", function() {
        spyOn(atom, 'close');
        openEx();
        submitNormalModeInputText('quitall');
        return expect(atom.close).toHaveBeenCalled();
      });
    });
    describe(":tabclose", function() {
      return it("acts as an alias to :quit", function() {
        var ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        openEx();
        submitNormalModeInputText('tabclose');
        return (ref1 = expect(Ex.quit)).toHaveBeenCalledWith.apply(ref1, Ex.tabclose.calls[0].args);
      });
    });
    describe(":tabnext", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the next tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(2);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(pane.getItems().length - 1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
    });
    describe(":tabprevious", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the previous tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(0);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(pane.getItems().length - 1);
      });
    });
    describe(":wq", function() {
      beforeEach(function() {
        spyOn(Ex, 'write').andCallThrough();
        return spyOn(Ex, 'quit');
      });
      it("writes the file, then quits", function() {
        spyOn(atom, 'showSaveDialogSync').andReturn(projectPath('wq-1'));
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
      it("doesn't quit when the file is new and no path is specified in the save dialog", function() {
        var wasNotCalled;
        spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        wasNotCalled = false;
        setImmediate((function() {
          return wasNotCalled = !Ex.quit.wasCalled;
        }));
        return waitsFor((function() {
          return wasNotCalled;
        }), 100);
      });
      return it("passes the file name", function() {
        openEx();
        submitNormalModeInputText('wq wq-2');
        expect(Ex.write).toHaveBeenCalled();
        expect(Ex.write.calls[0].args[0].args.trim()).toEqual('wq-2');
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
    });
    describe(":xit", function() {
      return it("acts as an alias to :wq", function() {
        spyOn(Ex, 'wq');
        openEx();
        submitNormalModeInputText('xit');
        return expect(Ex.wq).toHaveBeenCalled();
      });
    });
    describe(":wqall", function() {
      return it("calls :wall, then :quitall", function() {
        spyOn(Ex, 'wall');
        spyOn(Ex, 'quitall');
        openEx();
        submitNormalModeInputText('wqall');
        expect(Ex.wall).toHaveBeenCalled();
        return expect(Ex.quitall).toHaveBeenCalled();
      });
    });
    describe(":edit", function() {
      describe("without a file name", function() {
        it("reloads the file from the disk", function() {
          var filePath;
          filePath = projectPath("edit-1");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 100);
        });
        it("doesn't reload when the file has been modified", function() {
          var filePath, isntDef;
          filePath = projectPath("edit-2");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No write since last change (add ! to override)');
          isntDef = false;
          setImmediate(function() {
            return isntDef = editor.getText() !== 'def';
          });
          return waitsFor((function() {
            return isntDef;
          }), "the editor's content not to change", 50);
        });
        it("reloads when the file has been modified and it is forced", function() {
          var filePath;
          filePath = projectPath("edit-3");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit!');
          expect(atom.notifications.notifications.length).toBe(0);
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 50);
        });
        return it("throws an error when editing a new file", function() {
          editor.getBuffer().reload();
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No file name');
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText('edit!');
          return expect(atom.notifications.notifications[1].message).toEqual('Command error: No file name');
        });
      });
      return describe("with a file name", function() {
        beforeEach(function() {
          spyOn(atom.workspace, 'open');
          return editor.getBuffer().reload();
        });
        it("opens the specified path", function() {
          var filePath;
          filePath = projectPath('edit-new-test');
          openEx();
          submitNormalModeInputText("edit " + filePath);
          return expect(atom.workspace.open).toHaveBeenCalledWith(filePath);
        });
        it("opens a relative path", function() {
          openEx();
          submitNormalModeInputText('edit edit-relative-test');
          return expect(atom.workspace.open).toHaveBeenCalledWith(projectPath('edit-relative-test'));
        });
        return it("throws an error if trying to open more than one file", function() {
          openEx();
          submitNormalModeInputText('edit edit-new-test-1 edit-new-test-2');
          expect(atom.workspace.open.callCount).toBe(0);
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
      });
    });
    describe(":tabedit", function() {
      it("acts as an alias to :edit if supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'edit');
        openEx();
        submitNormalModeInputText('tabedit tabedit-test');
        return (ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        openEx();
        submitNormalModeInputText('tabedit  ');
        return (ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
    });
    describe(":tabnew", function() {
      it("opens a new tab", function() {
        spyOn(atom.workspace, 'open');
        openEx();
        submitNormalModeInputText('tabnew');
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      return it("opens a new tab for editing when provided an argument", function() {
        var ref1;
        spyOn(Ex, 'tabnew').andCallThrough();
        spyOn(Ex, 'tabedit');
        openEx();
        submitNormalModeInputText('tabnew tabnew-test');
        return (ref1 = expect(Ex.tabedit)).toHaveBeenCalledWith.apply(ref1, Ex.tabnew.calls[0].args);
      });
    });
    describe(":split", function() {
      return it("splits the current file upwards/downward", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        if (atom.config.get('ex-mode.splitbelow')) {
          spyOn(pane, 'splitDown').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitDown).toHaveBeenCalled();
        } else {
          spyOn(pane, 'splitUp').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitUp).toHaveBeenCalled();
        }
      });
    });
    describe(":vsplit", function() {
      return it("splits the current file to the left/right", function() {
        var filePath, pane;
        if (atom.config.get('ex-mode.splitright')) {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitRight').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        } else {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitLeft').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        }
      });
    });
    describe(":delete", function() {
      beforeEach(function() {
        editor.setText('abc\ndef\nghi\njkl');
        return editor.setCursorBufferPosition([2, 0]);
      });
      it("deletes the current line", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(editor.getText()).toEqual('abc\ndef\njkl');
      });
      it("copies the deleted text", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(atom.clipboard.read()).toEqual('ghi\n');
      });
      it("deletes the lines in the given range", function() {
        var processedOpStack;
        processedOpStack = false;
        exState.onDidProcessOpStack(function() {
          return processedOpStack = true;
        });
        openEx();
        submitNormalModeInputText('1,2delete');
        expect(editor.getText()).toEqual('ghi\njkl');
        waitsFor(function() {
          return processedOpStack;
        });
        editor.setText('abc\ndef\nghi\njkl');
        editor.setCursorBufferPosition([1, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(',/k/delete');
        return expect(editor.getText()).toEqual('abc\n');
      });
      return it("undos deleting several lines at once", function() {
        openEx();
        submitNormalModeInputText('-1,.delete');
        expect(editor.getText()).toEqual('abc\njkl');
        atom.commands.dispatch(editorElement, 'core:undo');
        return expect(editor.getText()).toEqual('abc\ndef\nghi\njkl');
      });
    });
    describe(":substitute", function() {
      beforeEach(function() {
        editor.setText('abcaABC\ndefdDEF\nabcaABC');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("replaces a character on the current line", function() {
        openEx();
        submitNormalModeInputText(':substitute /a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("doesn't need a space before the arguments", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("respects modifiers passed to it", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x/g');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':substitute/a/x/gi');
        return expect(editor.getText()).toEqual('xbcxxBC\ndefdDEF\nabcaABC');
      });
      it("replaces on multiple lines", function() {
        openEx();
        submitNormalModeInputText(':%substitute/abc/ghi');
        expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nghiaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':%substitute/abc/ghi/ig');
        return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nghiaghi');
      });
      describe(":yank", function() {
        beforeEach(function() {
          editor.setText('abc\ndef\nghi\njkl');
          return editor.setCursorBufferPosition([2, 0]);
        });
        it("yanks the current line", function() {
          openEx();
          submitNormalModeInputText('yank');
          return expect(atom.clipboard.read()).toEqual('ghi\n');
        });
        return it("yanks the lines in the given range", function() {
          openEx();
          submitNormalModeInputText('1,2yank');
          return expect(atom.clipboard.read()).toEqual('abc\ndef\n');
        });
      });
      describe("illegal delimiters", function() {
        var test;
        test = function(delim) {
          openEx();
          submitNormalModeInputText(":substitute " + delim + "a" + delim + "x" + delim + "gi");
          expect(atom.notifications.notifications[0].message).toEqual("Command error: Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
          return expect(editor.getText()).toEqual('abcaABC\ndefdDEF\nabcaABC');
        };
        it("can't be delimited by letters", function() {
          return test('n');
        });
        it("can't be delimited by numbers", function() {
          return test('3');
        });
        it("can't be delimited by '\\'", function() {
          return test('\\');
        });
        it("can't be delimited by '\"'", function() {
          return test('"');
        });
        return it("can't be delimited by '|'", function() {
          return test('|');
        });
      });
      describe("empty replacement", function() {
        beforeEach(function() {
          return editor.setText('abcabc\nabcabc');
        });
        it("removes the pattern without modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//");
          return expect(editor.getText()).toEqual('abc\nabcabc');
        });
        return it("removes the pattern with modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//g");
          return expect(editor.getText()).toEqual('\nabcabc');
        });
      });
      describe("replacing with escape sequences", function() {
        var test;
        beforeEach(function() {
          return editor.setText('abc,def,ghi');
        });
        test = function(escapeChar, escaped) {
          openEx();
          submitNormalModeInputText(":substitute/,/\\" + escapeChar + "/g");
          return expect(editor.getText()).toEqual("abc" + escaped + "def" + escaped + "ghi");
        };
        it("replaces with a tab", function() {
          return test('t', '\t');
        });
        it("replaces with a linefeed", function() {
          return test('n', '\n');
        });
        return it("replaces with a carriage return", function() {
          return test('r', '\r');
        });
      });
      describe("case sensitivity", function() {
        describe("respects the smartcase setting", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is on and the pattern is lowercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("uses case sensitive search if smartcase is on and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
        });
        return describe("\\c and \\C in the pattern", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is off and \c is in the pattern", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc\\c/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("doesn't matter where in the pattern \\c is", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/a\\cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is on, \\C is in the pattern and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\C comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cb\\cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\c comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\cb\\Cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("overrides an appended /i flag with \\C", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/ab\\Cc/ghi/gi');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
        });
      });
      return describe("capturing groups", function() {
        beforeEach(function() {
          return editor.setText('abcaABC\ndefdDEF\nabcaABC');
        });
        it("replaces \\1 with the first group", function() {
          openEx();
          submitNormalModeInputText(':substitute/bc(.{2})/X\\1X');
          return expect(editor.getText()).toEqual('aXaAXBC\ndefdDEF\nabcaABC');
        });
        it("replaces multiple groups", function() {
          openEx();
          submitNormalModeInputText(':substitute/a([a-z]*)aA([A-Z]*)/X\\1XY\\2Y');
          return expect(editor.getText()).toEqual('XbcXYBCY\ndefdDEF\nabcaABC');
        });
        return it("replaces \\0 with the entire match", function() {
          openEx();
          submitNormalModeInputText(':substitute/ab(ca)AB/X\\0X');
          return expect(editor.getText()).toEqual('XabcaABXC\ndefdDEF\nabcaABC');
        });
      });
    });
    describe(":set", function() {
      it("throws an error without a specified option", function() {
        openEx();
        submitNormalModeInputText(':set');
        return expect(atom.notifications.notifications[0].message).toEqual('Command error: No option specified');
      });
      it("sets multiple options at once", function() {
        atom.config.set('editor.showInvisibles', false);
        atom.config.set('editor.showLineNumbers', false);
        openEx();
        submitNormalModeInputText(':set list number');
        expect(atom.config.get('editor.showInvisibles')).toBe(true);
        return expect(atom.config.get('editor.showLineNumbers')).toBe(true);
      });
      return describe("the options", function() {
        beforeEach(function() {
          atom.config.set('editor.showInvisibles', false);
          return atom.config.set('editor.showLineNumbers', false);
        });
        it("sets (no)list", function() {
          openEx();
          submitNormalModeInputText(':set list');
          expect(atom.config.get('editor.showInvisibles')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nolist');
          return expect(atom.config.get('editor.showInvisibles')).toBe(false);
        });
        it("sets (no)nu(mber)", function() {
          openEx();
          submitNormalModeInputText(':set nu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set number');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonumber');
          return expect(atom.config.get('editor.showLineNumbers')).toBe(false);
        });
        it("sets (no)sp(lit)r(ight)", function() {
          openEx();
          submitNormalModeInputText(':set spr');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nospr');
          expect(atom.config.get('ex-mode.splitright')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitright');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitright');
          return expect(atom.config.get('ex-mode.splitright')).toBe(false);
        });
        it("sets (no)s(plit)b(elow)", function() {
          openEx();
          submitNormalModeInputText(':set sb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitbelow');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitbelow');
          return expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
        });
        return it("sets (no)s(mart)c(a)s(e)", function() {
          openEx();
          submitNormalModeInputText(':set scs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set noscs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
          openEx();
          submitNormalModeInputText(':set smartcase');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set nosmartcase');
          return expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
        });
      });
    });
    describe("aliases", function() {
      it("calls the aliased function without arguments", function() {
        ExClass.registerAlias('W', 'w');
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        return expect(Ex.write).toHaveBeenCalled();
      });
      return it("calls the aliased function with arguments", function() {
        var WArgs, writeArgs;
        ExClass.registerAlias('W', 'write');
        spyOn(Ex, 'W').andCallThrough();
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        WArgs = Ex.W.calls[0].args[0];
        writeArgs = Ex.write.calls[0].args[0];
        return expect(WArgs).toBe(writeArgs);
      });
    });
    return describe("with selections", function() {
      it("executes on the selected range", function() {
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        return expect(Ex.s.calls[0].args[0].range).toEqual([0, 2]);
      });
      return it("calls the functions multiple times if there are multiple selections", function() {
        var calls;
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        editor.addCursorAtBufferPosition([3, 0]);
        editor.selectToBufferPosition([3, 2]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        calls = Ex.s.calls;
        expect(calls.length).toEqual(2);
        expect(calls[0].args[0].range).toEqual([0, 2]);
        return expect(calls[1].args[0].range).toEqual([3, 3]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvc3BlYy9leC1jb21tYW5kcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUjs7RUFFVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsRUFBQSxHQUFLLE9BQU8sQ0FBQyxTQUFSLENBQUE7O0VBRUwsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsTUFBd0QsRUFBeEQsRUFBQyxlQUFELEVBQVMsc0JBQVQsRUFBd0IsaUJBQXhCLEVBQWtDLGdCQUFsQyxFQUEyQyxZQUEzQyxFQUFnRDtJQUNoRCxXQUFBLEdBQWMsU0FBQyxRQUFEO2FBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsUUFBZjtJQUFkO0lBQ2QsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixVQUExQjtNQUNWLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsU0FBMUI7TUFDVCxlQUFBLENBQWdCLFNBQUE7QUFDZCxZQUFBO1FBQUEsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLFFBQVAsQ0FBQTtRQUNwQixPQUFPLENBQUMsY0FBUixDQUFBO2VBQ0E7TUFIYyxDQUFoQjtNQUtBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsS0FBQSxDQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBeEIsRUFBdUMs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N0J1QixDQUF6QjtBQVRBIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcbmhlbHBlcnMgPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5FeENsYXNzID0gcmVxdWlyZSgnLi4vbGliL2V4JylcbkV4ID0gRXhDbGFzcy5zaW5nbGV0b24oKVxuXG5kZXNjcmliZSBcInRoZSBjb21tYW5kc1wiLCAtPlxuICBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZSwgZXhTdGF0ZSwgZGlyLCBkaXIyXSA9IFtdXG4gIHByb2plY3RQYXRoID0gKGZpbGVOYW1lKSAtPiBwYXRoLmpvaW4oZGlyLCBmaWxlTmFtZSlcbiAgYmVmb3JlRWFjaCAtPlxuICAgIHZpbU1vZGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCd2aW0tbW9kZScpXG4gICAgZXhNb2RlID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnZXgtbW9kZScpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGV4TW9kZS5hY3RpdmF0ZSgpXG4gICAgICBoZWxwZXJzLmFjdGl2YXRlRXhNb2RlKClcbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlXG5cbiAgICBydW5zIC0+XG4gICAgICBzcHlPbihleE1vZGUubWFpbk1vZHVsZS5nbG9iYWxFeFN0YXRlLCAnc2V0VmltJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICB2aW1Nb2RlLmFjdGl2YXRlKClcblxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBleE1vZGUubWFpbk1vZHVsZS5nbG9iYWxFeFN0YXRlLnNldFZpbS5jYWxscy5sZW5ndGggPiAwXG5cbiAgICBydW5zIC0+XG4gICAgICBkaXIgPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwiYXRvbS1leC1tb2RlLXNwZWMtI3t1dWlkLnY0KCl9XCIpXG4gICAgICBkaXIyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBcImF0b20tZXgtbW9kZS1zcGVjLSN7dXVpZC52NCgpfVwiKVxuICAgICAgZnMubWFrZVRyZWVTeW5jKGRpcilcbiAgICAgIGZzLm1ha2VUcmVlU3luYyhkaXIyKVxuICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtkaXIsIGRpcjJdKVxuXG4gICAgICBoZWxwZXJzLmdldEVkaXRvckVsZW1lbnQgKGVsZW1lbnQpIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWxlbWVudCwgXCJleC1tb2RlOm9wZW5cIilcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlbGVtZW50LmdldE1vZGVsKCkubm9ybWFsTW9kZUlucHV0Vmlldy5lZGl0b3JFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29yZTpjYW5jZWxcIilcbiAgICAgICAgZWRpdG9yRWxlbWVudCA9IGVsZW1lbnRcbiAgICAgICAgZWRpdG9yID0gZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgICAgIHZpbVN0YXRlID0gdmltTW9kZS5tYWluTW9kdWxlLmdldEVkaXRvclN0YXRlKGVkaXRvcilcbiAgICAgICAgZXhTdGF0ZSA9IGV4TW9kZS5tYWluTW9kdWxlLmV4U3RhdGVzLmdldChlZGl0b3IpXG4gICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICAgIHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KFwiYWJjXFxuZGVmXFxuYWJjXFxuZGVmXCIpXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgZnMucmVtb3ZlU3luYyhkaXIpXG4gICAgZnMucmVtb3ZlU3luYyhkaXIyKVxuXG4gIGtleWRvd24gPSAoa2V5LCBvcHRpb25zPXt9KSAtPlxuICAgIG9wdGlvbnMuZWxlbWVudCA/PSBlZGl0b3JFbGVtZW50XG4gICAgaGVscGVycy5rZXlkb3duKGtleSwgb3B0aW9ucylcblxuICBub3JtYWxNb2RlSW5wdXRLZXlkb3duID0gKGtleSwgb3B0cyA9IHt9KSAtPlxuICAgIGVkaXRvci5ub3JtYWxNb2RlSW5wdXRWaWV3LmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRUZXh0KGtleSlcblxuICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ID0gKHRleHQpIC0+XG4gICAgY29tbWFuZEVkaXRvciA9IGVkaXRvci5ub3JtYWxNb2RlSW5wdXRWaWV3LmVkaXRvckVsZW1lbnRcbiAgICBjb21tYW5kRWRpdG9yLmdldE1vZGVsKCkuc2V0VGV4dCh0ZXh0KVxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goY29tbWFuZEVkaXRvciwgXCJjb3JlOmNvbmZpcm1cIilcblxuICBvcGVuRXggPSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgXCJleC1tb2RlOm9wZW5cIilcblxuICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBhIHNwZWNpZmljIGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcyJ1xuXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIHRoZSBzZWNvbmQgYWRkcmVzc1wiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzEsMydcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsyLCAwXVxuXG4gICAgaXQgXCJ3b3JrcyB3aXRoIG9mZnNldHNcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcyKzEnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzIsIDBdXG5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICctMidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgIGl0IFwibGltaXRzIHRvIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcxMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMywgMF1cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICczLDEwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFszLCAwXVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJyQrMTAwMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMywgMF1cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBpdCBcImdvZXMgdG8gdGhlIGZpcnN0IGxpbmUgd2l0aCBhZGRyZXNzIDBcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCAwXSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcwLDAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSB3aGVuIHRoZSBhZGRyZXNzIGlzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcuJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnLCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgIGl0IFwibW92ZXMgdG8gdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJyQnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIGEgbWFyaydzIGxpbmVcIiwgLT5cbiAgICAgIGtleWRvd24oJ2wnKVxuICAgICAga2V5ZG93bignbScpXG4gICAgICBub3JtYWxNb2RlSW5wdXRLZXlkb3duICdhJ1xuICAgICAga2V5ZG93bignaicpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCBcIidhXCJcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgIGl0IFwibW92ZXMgdG8gYSBzcGVjaWZpZWQgc2VhcmNoXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnL2RlZidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMSwgMF1cblxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCAwXSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICc/ZGVmJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsxLCAwXVxuXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzMsIDBdKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJy9lZidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMSwgMF1cblxuICBkZXNjcmliZSBcIjp3cml0ZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBlZGl0aW5nIGEgbmV3IGZpbGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiY1xcbmRlZicpXG5cbiAgICAgIGl0IFwib3BlbnMgdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZScpXG4gICAgICAgIGV4cGVjdChhdG9tLnNob3dTYXZlRGlhbG9nU3luYykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwic2F2ZXMgd2hlbiBhIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCd3cml0ZS1mcm9tLXNhdmUtZGlhbG9nJylcbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybihmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUnKVxuICAgICAgICBleHBlY3QoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiY1xcbmRlZicpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNhdmVzIHdoZW4gYSBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybih1bmRlZmluZWQpXG4gICAgICAgIHNweU9uKGZzLCAnd3JpdGVGaWxlU3luYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGZzLndyaXRlRmlsZVN5bmMuY2FsbHMubGVuZ3RoKS50b0JlKDApXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZWRpdGluZyBhbiBleGlzdGluZyBmaWxlXCIsIC0+XG4gICAgICBmaWxlUGF0aCA9ICcnXG4gICAgICBpID0gMFxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGkrK1xuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKFwid3JpdGUtI3tpfVwiKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcblxuICAgICAgaXQgXCJzYXZlcyB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUnKVxuICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5pc01vZGlmaWVkKCkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBhIHNwZWNpZmllZCBwYXRoXCIsIC0+XG4gICAgICAgIG5ld1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZWxhdGl2ZShkaXIsIFwiI3tmaWxlUGF0aH0ubmV3XCIpXG4gICAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgICAgb3BlbkV4KClcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwid3JpdGUgI3tuZXdQYXRofVwiKVxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLnJlc29sdmUoZGlyLCBmcy5ub3JtYWxpemUobmV3UGF0aCkpXG4gICAgICAgICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMobmV3UGF0aCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKG5ld1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmMnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwic2F2ZXMgdG8gdGhlIHBhdGhcIiwgLT5cblxuICAgICAgICBpdCBcImV4cGFuZHMgLlwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJy4nLCBuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyAuLlwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJy4uJywgbmV3UGF0aClcblxuICAgICAgICBpdCBcImV4cGFuZHMgflwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJ34nLCBuZXdQYXRoKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aXRoIG1vcmUgdGhhbiBvbmUgcGF0aFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZSBwYXRoMSBwYXRoMicpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCdcbiAgICAgICAgKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgZXhpc3RzUGF0aCA9ICcnXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGV4aXN0c1BhdGggPSBwcm9qZWN0UGF0aCgnd3JpdGUtZXhpc3RzJylcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGV4aXN0c1BhdGgsICdhYmMnKVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMoZXhpc3RzUGF0aClcblxuICAgICAgICBpdCBcInRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0c1wiLCAtPlxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIndyaXRlICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAgICdDb21tYW5kIGVycm9yOiBGaWxlIGV4aXN0cyAoYWRkICEgdG8gb3ZlcnJpZGUpJ1xuICAgICAgICAgIClcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGV4aXN0c1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmMnKVxuXG4gICAgICAgIGl0IFwid3JpdGVzIGlmIGZvcmNlZCB3aXRoIDp3cml0ZSFcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJ3cml0ZSEgI3tleGlzdHNQYXRofVwiKVxuICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9ucykudG9FcXVhbChbXSlcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGV4aXN0c1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmNcXG5kZWYnKVxuXG4gIGRlc2NyaWJlIFwiOndhbGxcIiwgLT5cbiAgICBpdCBcInNhdmVzIGFsbFwiLCAtPlxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdzYXZlQWxsJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3YWxsJylcbiAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5zYXZlQWxsKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjpzYXZlYXNcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gZWRpdGluZyBhIG5ldyBmaWxlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNcXG5kZWYnKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzJylcbiAgICAgICAgZXhwZWN0KGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3NhdmVhcy1mcm9tLXNhdmUtZGlhbG9nJylcbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybihmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzJylcbiAgICAgICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKS50b0JlKHRydWUpXG4gICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmNcXG5kZWYnKVxuXG4gICAgICBpdCBcInNhdmVzIHdoZW4gYSBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybih1bmRlZmluZWQpXG4gICAgICAgIHNweU9uKGZzLCAnd3JpdGVGaWxlU3luYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChmcy53cml0ZUZpbGVTeW5jLmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYW4gZXhpc3RpbmcgZmlsZVwiLCAtPlxuICAgICAgZmlsZVBhdGggPSAnJ1xuICAgICAgaSA9IDBcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBpKytcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcInNhdmVhcy0je2l9XCIpXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNcXG5kZWYnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuXG4gICAgICBpdCBcImNvbXBsYWlucyBpZiBubyBwYXRoIGdpdmVuXCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogQXJndW1lbnQgcmVxdWlyZWQnXG4gICAgICAgIClcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGEgc3BlY2lmaWVkIHBhdGhcIiwgLT5cbiAgICAgICAgbmV3UGF0aCA9ICcnXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLnJlbGF0aXZlKGRpciwgXCIje2ZpbGVQYXRofS5uZXdcIilcbiAgICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgICBvcGVuRXgoKVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJzYXZlYXMgI3tuZXdQYXRofVwiKVxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLnJlc29sdmUoZGlyLCBmcy5ub3JtYWxpemUobmV3UGF0aCkpXG4gICAgICAgICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMobmV3UGF0aCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKG5ld1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmMnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKS50b0JlKGZhbHNlKVxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMobmV3UGF0aClcblxuICAgICAgICBpdCBcInNhdmVzIHRvIHRoZSBwYXRoXCIsIC0+XG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuJywgbmV3UGF0aClcblxuICAgICAgICBpdCBcImV4cGFuZHMgLi5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIH5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCd+JywgbmV3UGF0aClcblxuICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2l0aCBtb3JlIHRoYW4gb25lIHBhdGhcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzIHBhdGgxIHBhdGgyJylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE9ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJ1xuICAgICAgICApXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0c1wiLCAtPlxuICAgICAgICBleGlzdHNQYXRoID0gJydcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZXhpc3RzUGF0aCA9IHByb2plY3RQYXRoKCdzYXZlYXMtZXhpc3RzJylcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGV4aXN0c1BhdGgsICdhYmMnKVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMoZXhpc3RzUGF0aClcblxuICAgICAgICBpdCBcInRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0c1wiLCAtPlxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcInNhdmVhcyAje2V4aXN0c1BhdGh9XCIpXG4gICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogRmlsZSBleGlzdHMgKGFkZCAhIHRvIG92ZXJyaWRlKSdcbiAgICAgICAgICApXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcblxuICAgICAgICBpdCBcIndyaXRlcyBpZiBmb3JjZWQgd2l0aCA6c2F2ZWFzIVwiLCAtPlxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcInNhdmVhcyEgI3tleGlzdHNQYXRofVwiKVxuICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9ucykudG9FcXVhbChbXSlcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGV4aXN0c1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmNcXG5kZWYnKVxuXG4gIGRlc2NyaWJlIFwiOnF1aXRcIiwgLT5cbiAgICBwYW5lID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdkZXN0cm95QWN0aXZlSXRlbScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG5cbiAgICBpdCBcImNsb3NlcyB0aGUgYWN0aXZlIHBhbmUgaXRlbSBpZiBub3QgbW9kaWZpZWRcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdxdWl0JylcbiAgICAgIGV4cGVjdChwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChwYW5lLmdldEl0ZW1zKCkubGVuZ3RoKS50b0JlKDEpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gaXMgbW9kaWZpZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2RlZicpXG5cbiAgICAgIGl0IFwib3BlbnMgdGhlIHByb21wdCB0byBzYXZlXCIsIC0+XG4gICAgICAgIHNweU9uKHBhbmUsICdwcm9tcHRUb1NhdmVJdGVtJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgncXVpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnByb21wdFRvU2F2ZUl0ZW0pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOnF1aXRhbGxcIiwgLT5cbiAgICBpdCBcImNsb3NlcyBBdG9tXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnY2xvc2UnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3F1aXRhbGwnKVxuICAgICAgZXhwZWN0KGF0b20uY2xvc2UpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOnRhYmNsb3NlXCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDpxdWl0XCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3RhYmNsb3NlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICdxdWl0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYmNsb3NlJylcbiAgICAgIGV4cGVjdChFeC5xdWl0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJjbG9zZS5jYWxsc1swXS5hcmdzLi4uKVxuXG4gIGRlc2NyaWJlIFwiOnRhYm5leHRcIiwgLT5cbiAgICBwYW5lID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgICAgIC50aGVuIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuXG4gICAgaXQgXCJzd2l0Y2hlcyB0byB0aGUgbmV4dCB0YWJcIiwgLT5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCgxKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5leHQnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUoMilcblxuICAgIGl0IFwid3JhcHMgYXJvdW5kXCIsIC0+XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgocGFuZS5nZXRJdGVtcygpLmxlbmd0aCAtIDEpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFibmV4dCcpXG4gICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSkudG9CZSgwKVxuXG4gIGRlc2NyaWJlIFwiOnRhYnByZXZpb3VzXCIsIC0+XG4gICAgcGFuZSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgICAudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcblxuICAgIGl0IFwic3dpdGNoZXMgdG8gdGhlIHByZXZpb3VzIHRhYlwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KDEpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFicHJldmlvdXMnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUoMClcblxuICAgIGl0IFwid3JhcHMgYXJvdW5kXCIsIC0+XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoMClcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJwcmV2aW91cycpXG4gICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSkudG9CZShwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIC0gMSlcblxuICBkZXNjcmliZSBcIjp3cVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNweU9uKEV4LCAnd3JpdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3F1aXQnKVxuXG4gICAgaXQgXCJ3cml0ZXMgdGhlIGZpbGUsIHRoZW4gcXVpdHNcIiwgLT5cbiAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4ocHJvamVjdFBhdGgoJ3dxLTEnKSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cScpXG4gICAgICBleHBlY3QoRXgud3JpdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgIyBTaW5jZSBgOndxYCBvbmx5IGNhbGxzIGA6cXVpdGAgYWZ0ZXIgYDp3cml0ZWAgaXMgZmluaXNoZWQsIHdlIG5lZWQgdG9cbiAgICAgICMgIHdhaXQgYSBiaXQgZm9yIHRoZSBgOnF1aXRgIGNhbGwgdG8gb2NjdXJcbiAgICAgIHdhaXRzRm9yKCgtPiBFeC5xdWl0Lndhc0NhbGxlZCksIFwidGhlIDpxdWl0IGNvbW1hbmQgdG8gYmUgY2FsbGVkXCIsIDEwMClcblxuICAgIGl0IFwiZG9lc24ndCBxdWl0IHdoZW4gdGhlIGZpbGUgaXMgbmV3IGFuZCBubyBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4odW5kZWZpbmVkKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dxJylcbiAgICAgIGV4cGVjdChFeC53cml0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB3YXNOb3RDYWxsZWQgPSBmYWxzZVxuICAgICAgIyBGSVhNRTogVGhpcyBzZWVtcyBkYW5nZXJvdXMsIGJ1dCBzZXRUaW1lb3V0IHNvbWVob3cgZG9lc24ndCB3b3JrLlxuICAgICAgc2V0SW1tZWRpYXRlKCgtPlxuICAgICAgICB3YXNOb3RDYWxsZWQgPSBub3QgRXgucXVpdC53YXNDYWxsZWQpKVxuICAgICAgd2FpdHNGb3IoKC0+IHdhc05vdENhbGxlZCksIDEwMClcblxuICAgIGl0IFwicGFzc2VzIHRoZSBmaWxlIG5hbWVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cSB3cS0yJylcbiAgICAgIGV4cGVjdChFeC53cml0ZSlcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KEV4LndyaXRlLmNhbGxzWzBdLmFyZ3NbMF0uYXJncy50cmltKCkpLnRvRXF1YWwoJ3dxLTInKVxuICAgICAgd2FpdHNGb3IoKC0+IEV4LnF1aXQud2FzQ2FsbGVkKSwgXCJ0aGUgOnF1aXQgY29tbWFuZCB0byBiZSBjYWxsZWRcIiwgMTAwKVxuXG4gIGRlc2NyaWJlIFwiOnhpdFwiLCAtPlxuICAgIGl0IFwiYWN0cyBhcyBhbiBhbGlhcyB0byA6d3FcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAnd3EnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3hpdCcpXG4gICAgICBleHBlY3QoRXgud3EpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOndxYWxsXCIsIC0+XG4gICAgaXQgXCJjYWxscyA6d2FsbCwgdGhlbiA6cXVpdGFsbFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd3YWxsJylcbiAgICAgIHNweU9uKEV4LCAncXVpdGFsbCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3FhbGwnKVxuICAgICAgZXhwZWN0KEV4LndhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KEV4LnF1aXRhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOmVkaXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGhvdXQgYSBmaWxlIG5hbWVcIiwgLT5cbiAgICAgIGl0IFwicmVsb2FkcyB0aGUgZmlsZSBmcm9tIHRoZSBkaXNrXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTFcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICdkZWYnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0JylcbiAgICAgICAgIyBSZWxvYWRpbmcgdGFrZXMgYSBiaXRcbiAgICAgICAgd2FpdHNGb3IoKC0+IGVkaXRvci5nZXRUZXh0KCkgaXMgJ2RlZicpLFxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDEwMClcblxuICAgICAgaXQgXCJkb2Vzbid0IHJlbG9hZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTJcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNkJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJ2RlZicpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2VkaXQnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gd3JpdGUgc2luY2UgbGFzdCBjaGFuZ2UgKGFkZCAhIHRvIG92ZXJyaWRlKScpXG4gICAgICAgIGlzbnREZWYgPSBmYWxzZVxuICAgICAgICBzZXRJbW1lZGlhdGUoLT4gaXNudERlZiA9IGVkaXRvci5nZXRUZXh0KCkgaXNudCAnZGVmJylcbiAgICAgICAgd2FpdHNGb3IoKC0+IGlzbnREZWYpLCBcInRoZSBlZGl0b3IncyBjb250ZW50IG5vdCB0byBjaGFuZ2VcIiwgNTApXG5cbiAgICAgIGl0IFwicmVsb2FkcyB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBpdCBpcyBmb3JjZWRcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcImVkaXQtM1wiKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiY2QnKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnZGVmJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCEnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMubGVuZ3RoKS50b0JlKDApXG4gICAgICAgIHdhaXRzRm9yKCgtPiBlZGl0b3IuZ2V0VGV4dCgpIGlzICdkZWYnKVxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDUwKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IScpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1sxXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdlZGl0LW5ldy10ZXN0JylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcImVkaXQgI3tmaWxlUGF0aH1cIilcbiAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGZpbGVQYXRoKVxuXG4gICAgICBpdCBcIm9wZW5zIGEgcmVsYXRpdmUgcGF0aFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtcmVsYXRpdmUtdGVzdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChcbiAgICAgICAgICBwcm9qZWN0UGF0aCgnZWRpdC1yZWxhdGl2ZS10ZXN0JykpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIGlmIHRyeWluZyB0byBvcGVuIG1vcmUgdGhhbiBvbmUgZmlsZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtbmV3LXRlc3QtMSBlZGl0LW5ldy10ZXN0LTInKVxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3Blbi5jYWxsQ291bnQpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE9ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICBkZXNjcmliZSBcIjp0YWJlZGl0XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDplZGl0IGlmIHN1cHBsaWVkIHdpdGggYSBwYXRoXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ2VkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYmVkaXQgdGFiZWRpdC10ZXN0JylcbiAgICAgIGV4cGVjdChFeC5lZGl0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJlZGl0LmNhbGxzWzBdLmFyZ3MuLi4pXG5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOnRhYm5ldyBpZiBub3Qgc3VwcGxpZWQgd2l0aCBhIHBhdGhcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAndGFiZWRpdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAndGFibmV3JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJlZGl0ICAnKVxuICAgICAgZXhwZWN0KEV4LnRhYm5ldylcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYmVkaXQuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjp0YWJuZXdcIiwgLT5cbiAgICBpdCBcIm9wZW5zIGEgbmV3IHRhYlwiLCAtPlxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXcnKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgXCJvcGVucyBhIG5ldyB0YWIgZm9yIGVkaXRpbmcgd2hlbiBwcm92aWRlZCBhbiBhcmd1bWVudFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJuZXcnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5ldyB0YWJuZXctdGVzdCcpXG4gICAgICBleHBlY3QoRXgudGFiZWRpdClcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYm5ldy5jYWxsc1swXS5hcmdzLi4uKVxuXG4gIGRlc2NyaWJlIFwiOnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB1cHdhcmRzL2Rvd253YXJkXCIsIC0+XG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdERvd24nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3NwbGl0JylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdERvd24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXRVcCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnc3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0VXApLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgIyBGSVhNRTogU2hvdWxkIHRlc3Qgd2hldGhlciB0aGUgbmV3IHBhbmUgY29udGFpbnMgYSBUZXh0RWRpdG9yXG4gICAgICAjICAgICAgICBwb2ludGluZyB0byB0aGUgc2FtZSBwYXRoXG5cbiAgZGVzY3JpYmUgXCI6dnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB0byB0aGUgbGVmdC9yaWdodFwiLCAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdFJpZ2h0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCd2c3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd2c3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdExlZnQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdExlZnQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3ZzcGxpdCcpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3ZzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0TGVmdCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAjIEZJWE1FOiBTaG91bGQgdGVzdCB3aGV0aGVyIHRoZSBuZXcgcGFuZSBjb250YWlucyBhIFRleHRFZGl0b3JcbiAgICAgICMgICAgICAgIHBvaW50aW5nIHRvIHRoZSBzYW1lIHBhdGhcblxuICBkZXNjcmliZSBcIjpkZWxldGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmXFxuZ2hpXFxuamtsJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2RlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjXFxuZGVmXFxuamtsJylcblxuICAgIGl0IFwiY29waWVzIHRoZSBkZWxldGVkIHRleHRcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdkZWxldGUnKVxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnZ2hpXFxuJylcblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgbGluZXMgaW4gdGhlIGdpdmVuIHJhbmdlXCIsIC0+XG4gICAgICBwcm9jZXNzZWRPcFN0YWNrID0gZmFsc2VcbiAgICAgIGV4U3RhdGUub25EaWRQcm9jZXNzT3BTdGFjayAtPiBwcm9jZXNzZWRPcFN0YWNrID0gdHJ1ZVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzEsMmRlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpXFxuamtsJylcblxuICAgICAgd2FpdHNGb3IgLT4gcHJvY2Vzc2VkT3BTdGFja1xuICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDFdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJywvay9kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbicpXG5cbiAgICBpdCBcInVuZG9zIGRlbGV0aW5nIHNldmVyYWwgbGluZXMgYXQgb25jZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJy0xLC5kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmprbCcpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdjb3JlOnVuZG8nKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG5cbiAgZGVzY3JpYmUgXCI6c3Vic3RpdHV0ZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwicmVwbGFjZXMgYSBjaGFyYWN0ZXIgb24gdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlIC9hL3gnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcImRvZXNuJ3QgbmVlZCBhIHNwYWNlIGJlZm9yZSB0aGUgYXJndW1lbnRzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgaXQgXCJyZXNwZWN0cyBtb2RpZmllcnMgcGFzc2VkIHRvIGl0XCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94L2cnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3hBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hL3gvZ2knKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3h4QkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcInJlcGxhY2VzIG9uIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOiVzdWJzdGl0dXRlL2FiYy9naGknKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuZ2hpYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6JXN1YnN0aXR1dGUvYWJjL2doaS9pZycpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5naGlhZ2hpJylcblxuICAgIGRlc2NyaWJlIFwiOnlhbmtcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG5cbiAgICAgIGl0IFwieWFua3MgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd5YW5rJylcbiAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnZ2hpXFxuJylcblxuICAgICAgaXQgXCJ5YW5rcyB0aGUgbGluZXMgaW4gdGhlIGdpdmVuIHJhbmdlXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzEsMnlhbmsnKVxuICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKCdhYmNcXG5kZWZcXG4nKVxuXG4gICAgZGVzY3JpYmUgXCJpbGxlZ2FsIGRlbGltaXRlcnNcIiwgLT5cbiAgICAgIHRlc3QgPSAoZGVsaW0pIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZSAje2RlbGltfWEje2RlbGltfXgje2RlbGltfWdpXCIpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgIFwiQ29tbWFuZCBlcnJvcjogUmVndWxhciBleHByZXNzaW9ucyBjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMsICdcXFxcJywgJ1xcXCInIG9yICd8J1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgbGV0dGVyc1wiLCAtPiB0ZXN0ICduJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgbnVtYmVyc1wiLCAtPiB0ZXN0ICczJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgJ1xcXFwnXCIsICAgIC0+IHRlc3QgJ1xcXFwnXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSAnXFxcIidcIiwgICAgLT4gdGVzdCAnXCInXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSAnfCdcIiwgICAgIC0+IHRlc3QgJ3wnXG5cbiAgICBkZXNjcmliZSBcImVtcHR5IHJlcGxhY2VtZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhYmNcXG5hYmNhYmMnKVxuXG4gICAgICBpdCBcInJlbW92ZXMgdGhlIHBhdHRlcm4gd2l0aG91dCBtb2RpZmllcnNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlL2FiYy8vXCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNcXG5hYmNhYmMnKVxuXG4gICAgICBpdCBcInJlbW92ZXMgdGhlIHBhdHRlcm4gd2l0aCBtb2RpZmllcnNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlL2FiYy8vZ1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnXFxuYWJjYWJjJylcblxuICAgIGRlc2NyaWJlIFwicmVwbGFjaW5nIHdpdGggZXNjYXBlIHNlcXVlbmNlc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjLGRlZixnaGknKVxuXG4gICAgICB0ZXN0ID0gKGVzY2FwZUNoYXIsIGVzY2FwZWQpIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZS8sL1xcXFwje2VzY2FwZUNoYXJ9L2dcIilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJhYmMje2VzY2FwZWR9ZGVmI3tlc2NhcGVkfWdoaVwiKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIHdpdGggYSB0YWJcIiwgLT4gdGVzdCgndCcsICdcXHQnKVxuICAgICAgaXQgXCJyZXBsYWNlcyB3aXRoIGEgbGluZWZlZWRcIiwgLT4gdGVzdCgnbicsICdcXG4nKVxuICAgICAgaXQgXCJyZXBsYWNlcyB3aXRoIGEgY2FycmlhZ2UgcmV0dXJuXCIsIC0+IHRlc3QoJ3InLCAnXFxyJylcblxuICAgIGRlc2NyaWJlIFwiY2FzZSBzZW5zaXRpdml0eVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZXNwZWN0cyB0aGUgc21hcnRjYXNlIHNldHRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIHNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9mZiBhbmQgdGhlIHBhdHRlcm4gaXMgbG93ZXJjYXNlXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCBmYWxzZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb2ZmIGFuZCB0aGUgcGF0dGVybiBpcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL0FCQy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY2FnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2UgaW5zZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvbiBhbmQgdGhlIHBhdHRlcm4gaXMgbG93ZXJjYXNlXCIsIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWJjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvbiBhbmQgdGhlIHBhdHRlcm4gaXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9BQkMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBkZXNjcmliZSBcIlxcXFxjIGFuZCBcXFxcQyBpbiB0aGUgcGF0dGVyblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2UgaW5zZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvZmYgYW5kIFxcYyBpcyBpbiB0aGUgcGF0dGVyblwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgZmFsc2UpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYmNcXFxcYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IG1hdHRlciB3aGVyZSBpbiB0aGUgcGF0dGVybiBcXFxcYyBpc1wiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgZmFsc2UpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXGNiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb24sIFxcXFxDIGlzIGluIHRoZSBwYXR0ZXJuIGFuZCB0aGUgcGF0dGVybiBpcyBsb3dlcmNhc2VcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXENiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJvdmVycmlkZXMgXFxcXEMgd2l0aCBcXFxcYyBpZiBcXFxcQyBjb21lcyBmaXJzdFwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FcXFxcQ2JcXFxcY2MvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwib3ZlcnJpZGVzIFxcXFxDIHdpdGggXFxcXGMgaWYgXFxcXGMgY29tZXMgZmlyc3RcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXGNiXFxcXENjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcIm92ZXJyaWRlcyBhbiBhcHBlbmRlZCAvaSBmbGFnIHdpdGggXFxcXENcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYlxcXFxDYy9naGkvZ2knKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgZGVzY3JpYmUgXCJjYXB0dXJpbmcgZ3JvdXBzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIFxcXFwxIHdpdGggdGhlIGZpcnN0IGdyb3VwXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2JjKC57Mn0pL1hcXFxcMVgnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYVhhQVhCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJyZXBsYWNlcyBtdWx0aXBsZSBncm91cHNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYShbYS16XSopYUEoW0EtWl0qKS9YXFxcXDFYWVxcXFwyWScpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdYYmNYWUJDWVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJyZXBsYWNlcyBcXFxcMCB3aXRoIHRoZSBlbnRpcmUgbWF0Y2hcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWIoY2EpQUIvWFxcXFwwWCcpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdYYWJjYUFCWENcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgZGVzY3JpYmUgXCI6c2V0XCIsIC0+XG4gICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2l0aG91dCBhIHNwZWNpZmllZCBvcHRpb25cIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0JylcbiAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gb3B0aW9uIHNwZWNpZmllZCcpXG5cbiAgICBpdCBcInNldHMgbXVsdGlwbGUgb3B0aW9ucyBhdCBvbmNlXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJywgZmFsc2UpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBsaXN0IG51bWJlcicpXG4gICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKHRydWUpXG5cbiAgICBkZXNjcmliZSBcInRoZSBvcHRpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJywgZmFsc2UpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycsIGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKWxpc3RcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBsaXN0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub2xpc3QnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubyludShtYmVyKVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG51JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9udScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZShmYWxzZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBudW1iZXInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub251bWJlcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylzcChsaXQpcihpZ2h0KVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNwcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zcHInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZShmYWxzZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzcGxpdHJpZ2h0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NwbGl0cmlnaHQnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylzKHBsaXQpYihlbG93KVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNiJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NiJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc3BsaXRiZWxvdycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zcGxpdGJlbG93JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pcyhtYXJ0KWMoYSlzKGUpXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc2NzJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NjcycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKGZhbHNlKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNtYXJ0Y2FzZScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKHRydWUpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zbWFydGNhc2UnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkudG9CZShmYWxzZSlcblxuICBkZXNjcmliZSBcImFsaWFzZXNcIiwgLT5cbiAgICBpdCBcImNhbGxzIHRoZSBhbGlhc2VkIGZ1bmN0aW9uIHdpdGhvdXQgYXJndW1lbnRzXCIsIC0+XG4gICAgICBFeENsYXNzLnJlZ2lzdGVyQWxpYXMoJ1cnLCAndycpXG4gICAgICBzcHlPbihFeCwgJ3dyaXRlJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdXJylcbiAgICAgIGV4cGVjdChFeC53cml0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImNhbGxzIHRoZSBhbGlhc2VkIGZ1bmN0aW9uIHdpdGggYXJndW1lbnRzXCIsIC0+XG4gICAgICBFeENsYXNzLnJlZ2lzdGVyQWxpYXMoJ1cnLCAnd3JpdGUnKVxuICAgICAgc3B5T24oRXgsICdXJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICd3cml0ZScpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnVycpXG4gICAgICBXQXJncyA9IEV4LlcuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgd3JpdGVBcmdzID0gRXgud3JpdGUuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgZXhwZWN0KFdBcmdzKS50b0JlIHdyaXRlQXJnc1xuXG4gIGRlc2NyaWJlIFwid2l0aCBzZWxlY3Rpb25zXCIsIC0+XG4gICAgaXQgXCJleGVjdXRlcyBvbiB0aGUgc2VsZWN0ZWQgcmFuZ2VcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAncycpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvQnVmZmVyUG9zaXRpb24oWzIsIDFdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCInPCwnPnMvYWJjL2RlZlwiKVxuICAgICAgZXhwZWN0KEV4LnMuY2FsbHNbMF0uYXJnc1swXS5yYW5nZSkudG9FcXVhbCBbMCwgMl1cblxuICAgIGl0IFwiY2FsbHMgdGhlIGZ1bmN0aW9ucyBtdWx0aXBsZSB0aW1lcyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgc2VsZWN0aW9uc1wiLCAtPlxuICAgICAgc3B5T24oRXgsICdzJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9CdWZmZXJQb3NpdGlvbihbMiwgMV0pXG4gICAgICBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbMywgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9CdWZmZXJQb3NpdGlvbihbMywgMl0pXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIic8LCc+cy9hYmMvZGVmXCIpXG4gICAgICBjYWxscyA9IEV4LnMuY2FsbHNcbiAgICAgIGV4cGVjdChjYWxscy5sZW5ndGgpLnRvRXF1YWwgMlxuICAgICAgZXhwZWN0KGNhbGxzWzBdLmFyZ3NbMF0ucmFuZ2UpLnRvRXF1YWwgWzAsIDJdXG4gICAgICBleHBlY3QoY2FsbHNbMV0uYXJnc1swXS5yYW5nZSkudG9FcXVhbCBbMywgM11cbiJdfQ==
