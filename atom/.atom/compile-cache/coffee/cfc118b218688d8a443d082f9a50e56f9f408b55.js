(function() {
  var CommandKeystrokeFinder, DarwinEditorKeyMap, DarwinKeyMap, Win32LinuxEditorKeyMap, Win32LinuxKeyMap, _, getCommandsFromKeymap, mockFindKeyBindings, selector, setupKeyBindings;

  CommandKeystrokeFinder = require('../lib/command-keystroke-humanizer');

  _ = require('underscore-plus');

  selector = {
    Darwin: '.platform-darwin',
    DarwinEditor: '.platform-darwin atom-text-editor',
    Win32: '.platform-win32',
    Linux: '.platform-linux',
    Win32Linux: '.platform-win32, .platform-linux',
    Win32LinuxEditor: '.platform-win32 atom-text-editor, .platform-linux atom-text-editor'
  };

  DarwinKeyMap = {
    'cmd-shift-h': 'git-plus:menu',
    'cmd-shift-a s': 'git-plus:status',
    'cmd-shift-a q': 'git-plus:add-and-commit-and-push'
  };

  Win32LinuxKeyMap = {
    'ctrl-shift-h': 'git-plus:menu',
    'ctrl-shift-x': 'git-plus:commit',
    'ctrl-shift-a s': 'git-plus:status',
    'ctrl-shift-a q': 'git-plus:add-and-commit-and-push',
    'ctrl-shift-a a': 'git-plus:add-all-and-commit',
    'ctrl-shift-a p': 'git-plus:add-all-commit-and-push'
  };

  DarwinEditorKeyMap = {
    'cmd-shift-a': 'git-plus:add',
    'cmd-shift-a c': 'git-plus:add-and-commit'
  };

  Win32LinuxEditorKeyMap = {
    'ctrl-shift-a': 'git-plus:add',
    'ctrl-shift-a c': 'git-plus:add-and-commit'
  };

  getCommandsFromKeymap = function(keymap) {
    var cmd, commands, ks;
    commands = [];
    for (ks in keymap) {
      cmd = keymap[ks];
      commands.push([cmd]);
    }
    return commands;
  };

  mockFindKeyBindings = function(bindings) {
    return function(arg) {
      var command;
      command = arg.command;
      return bindings.filter(function(binding) {
        return binding.command === command;
      });
    };
  };

  setupKeyBindings = function(keymaps, selector) {
    var gitCommand, keybindings, keystrokes;
    keybindings = [];
    for (keystrokes in keymaps) {
      gitCommand = keymaps[keystrokes];
      keybindings.push({
        command: gitCommand,
        selector: selector,
        keystrokes: keystrokes
      });
    }
    return spyOn(atom.keymaps, "findKeyBindings").andCallFake(mockFindKeyBindings(keybindings));
  };

  describe("Git-Plus command keystroke humanizer", function() {
    describe("On any platform", function() {
      return describe("when an empty command list is provided", function() {
        return it("returns empty map", function() {
          var keymaps;
          keymaps = [
            {
              command: 'cmd-shift-a',
              selector: selector.Darwin
            }
          ];
          spyOn(atom.keymaps, "findKeyBindings").andCallFake(mockFindKeyBindings(keymaps));
          return expect(CommandKeystrokeFinder().get([])).toEqual({});
        });
      });
    });
    describe("when platform is Darwin", function() {
      var humanizer;
      humanizer = null;
      beforeEach(function() {
        return humanizer = CommandKeystrokeFinder("darwin");
      });
      describe("when selector is " + selector.Darwin, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(DarwinKeyMap, selector.Darwin);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(DarwinKeyMap));
          results = [];
          for (keystrokes in DarwinKeyMap) {
            gitCommand = DarwinKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.DarwinEditor, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(DarwinEditorKeyMap, selector.DarwinEditor);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(DarwinEditorKeyMap));
          results = [];
          for (keystrokes in DarwinEditorKeyMap) {
            gitCommand = DarwinEditorKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Win32Linux, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(Win32LinuxKeyMap, selector.Win32Linux);
          return expect(humanizer.get(getCommandsFromKeymap(Win32LinuxKeyMap))).toEqual({});
        });
      });
      return describe("when selector is " + selector.Win32LinuxEditor, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(Win32LinuxEditorKeyMap, selector.Win32LinuxEditor);
          return expect(humanizer.get(getCommandsFromKeymap(Win32LinuxEditorKeyMap))).toEqual({});
        });
      });
    });
    return describe("when platform is " + selector.Win32 + " or " + selector.Linux, function() {
      var humanizer;
      humanizer = null;
      beforeEach(function() {
        return humanizer = CommandKeystrokeFinder("win32");
      });
      describe("when selector is " + selector.Win32Linux, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(Win32LinuxKeyMap, selector.Win32Linux);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(Win32LinuxKeyMap));
          results = [];
          for (keystrokes in Win32LinuxKeyMap) {
            gitCommand = Win32LinuxKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Win32LinuxEditor, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(Win32LinuxEditorKeyMap, selector.Win32LinuxEditor);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(Win32LinuxEditorKeyMap));
          results = [];
          for (keystrokes in Win32LinuxEditorKeyMap) {
            gitCommand = Win32LinuxEditorKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Darwin, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(DarwinKeyMap, selector.Darwin);
          return expect(humanizer.get(getCommandsFromKeymap(DarwinKeyMap))).toEqual({});
        });
      });
      return describe("when selector is " + selector.DarwinEditor, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(DarwinEditorKeyMap, selector.DarwinEditor);
          return expect(humanizer.get(getCommandsFromKeymap(DarwinEditorKeyMap))).toEqual({});
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvY29tbWFuZC1rZXlzdHJva2UtaHVtYW5pemVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsb0NBQVI7O0VBQ3pCLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosUUFBQSxHQUNFO0lBQUEsTUFBQSxFQUFvQixrQkFBcEI7SUFDQSxZQUFBLEVBQW9CLG1DQURwQjtJQUVBLEtBQUEsRUFBb0IsaUJBRnBCO0lBR0EsS0FBQSxFQUFvQixpQkFIcEI7SUFJQSxVQUFBLEVBQW9CLGtDQUpwQjtJQUtBLGdCQUFBLEVBQW9CLG9FQUxwQjs7O0VBT0YsWUFBQSxHQUNFO0lBQUEsYUFBQSxFQUFvQixlQUFwQjtJQUNBLGVBQUEsRUFBb0IsaUJBRHBCO0lBRUEsZUFBQSxFQUFvQixrQ0FGcEI7OztFQUlGLGdCQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQW9CLGVBQXBCO0lBQ0EsY0FBQSxFQUFvQixpQkFEcEI7SUFFQSxnQkFBQSxFQUFvQixpQkFGcEI7SUFHQSxnQkFBQSxFQUFvQixrQ0FIcEI7SUFJQSxnQkFBQSxFQUFvQiw2QkFKcEI7SUFLQSxnQkFBQSxFQUFvQixrQ0FMcEI7OztFQU9GLGtCQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQW9CLGNBQXBCO0lBQ0EsZUFBQSxFQUFvQix5QkFEcEI7OztFQUdGLHNCQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQW9CLGNBQXBCO0lBQ0EsZ0JBQUEsRUFBb0IseUJBRHBCOzs7RUFHRixxQkFBQSxHQUF3QixTQUFDLE1BQUQ7QUFDdEIsUUFBQTtJQUFBLFFBQUEsR0FBVztBQUNYLFNBQUEsWUFBQTs7TUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjLENBQUMsR0FBRCxDQUFkO0FBREY7V0FF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QXBFO0VBcEMrQyxDQUFqRDtBQWpEQSIsInNvdXJjZXNDb250ZW50IjpbIkNvbW1hbmRLZXlzdHJva2VGaW5kZXIgPSByZXF1aXJlICcuLi9saWIvY29tbWFuZC1rZXlzdHJva2UtaHVtYW5pemVyJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuc2VsZWN0b3IgPVxuICBEYXJ3aW46ICAgICAgICAgICAgICcucGxhdGZvcm0tZGFyd2luJ1xuICBEYXJ3aW5FZGl0b3I6ICAgICAgICcucGxhdGZvcm0tZGFyd2luIGF0b20tdGV4dC1lZGl0b3InXG4gIFdpbjMyOiAgICAgICAgICAgICAgJy5wbGF0Zm9ybS13aW4zMidcbiAgTGludXg6ICAgICAgICAgICAgICAnLnBsYXRmb3JtLWxpbnV4J1xuICBXaW4zMkxpbnV4OiAgICAgICAgICcucGxhdGZvcm0td2luMzIsIC5wbGF0Zm9ybS1saW51eCdcbiAgV2luMzJMaW51eEVkaXRvcjogICAnLnBsYXRmb3JtLXdpbjMyIGF0b20tdGV4dC1lZGl0b3IsIC5wbGF0Zm9ybS1saW51eCBhdG9tLXRleHQtZWRpdG9yJ1xuXG5EYXJ3aW5LZXlNYXAgPVxuICAnY21kLXNoaWZ0LWgnOiAgICAgICdnaXQtcGx1czptZW51J1xuICAnY21kLXNoaWZ0LWEgcyc6ICAgICdnaXQtcGx1czpzdGF0dXMnXG4gICdjbWQtc2hpZnQtYSBxJzogICAgJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0LWFuZC1wdXNoJ1xuXG5XaW4zMkxpbnV4S2V5TWFwID1cbiAgJ2N0cmwtc2hpZnQtaCc6ICAgICAnZ2l0LXBsdXM6bWVudSdcbiAgJ2N0cmwtc2hpZnQteCc6ICAgICAnZ2l0LXBsdXM6Y29tbWl0J1xuICAnY3RybC1zaGlmdC1hIHMnOiAgICdnaXQtcGx1czpzdGF0dXMnXG4gICdjdHJsLXNoaWZ0LWEgcSc6ICAgJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0LWFuZC1wdXNoJ1xuICAnY3RybC1zaGlmdC1hIGEnOiAgICdnaXQtcGx1czphZGQtYWxsLWFuZC1jb21taXQnXG4gICdjdHJsLXNoaWZ0LWEgcCc6ICAgJ2dpdC1wbHVzOmFkZC1hbGwtY29tbWl0LWFuZC1wdXNoJ1xuXG5EYXJ3aW5FZGl0b3JLZXlNYXAgPVxuICAnY21kLXNoaWZ0LWEnOiAgICAgICdnaXQtcGx1czphZGQnXG4gICdjbWQtc2hpZnQtYSBjJzogICAgJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0J1xuXG5XaW4zMkxpbnV4RWRpdG9yS2V5TWFwID1cbiAgJ2N0cmwtc2hpZnQtYSc6ICAgICAnZ2l0LXBsdXM6YWRkJ1xuICAnY3RybC1zaGlmdC1hIGMnOiAgICdnaXQtcGx1czphZGQtYW5kLWNvbW1pdCdcblxuZ2V0Q29tbWFuZHNGcm9tS2V5bWFwID0gKGtleW1hcCkgLT5cbiAgY29tbWFuZHMgPSBbXVxuICBmb3Iga3MsIGNtZCBvZiBrZXltYXBcbiAgICBjb21tYW5kcy5wdXNoIFtjbWRdXG4gIGNvbW1hbmRzXG5cbm1vY2tGaW5kS2V5QmluZGluZ3MgPSAoYmluZGluZ3MpIC0+XG4gICh7Y29tbWFuZH0pIC0+XG4gICAgYmluZGluZ3MuZmlsdGVyIChiaW5kaW5nKSAtPiBiaW5kaW5nLmNvbW1hbmQgaXMgY29tbWFuZFxuXG5zZXR1cEtleUJpbmRpbmdzID0gKGtleW1hcHMsIHNlbGVjdG9yKS0+XG4gIGtleWJpbmRpbmdzID0gW11cbiAgZm9yIGtleXN0cm9rZXMsIGdpdENvbW1hbmQgb2Yga2V5bWFwc1xuICAgIGtleWJpbmRpbmdzLnB1c2gge2NvbW1hbmQ6IGdpdENvbW1hbmQsIHNlbGVjdG9yOiBzZWxlY3Rvciwga2V5c3Ryb2tlczoga2V5c3Ryb2tlc31cbiAgc3B5T24oYXRvbS5rZXltYXBzLCBcImZpbmRLZXlCaW5kaW5nc1wiKS5hbmRDYWxsRmFrZShtb2NrRmluZEtleUJpbmRpbmdzKGtleWJpbmRpbmdzKSlcblxuXG5kZXNjcmliZSBcIkdpdC1QbHVzIGNvbW1hbmQga2V5c3Ryb2tlIGh1bWFuaXplclwiLCAtPlxuICBkZXNjcmliZSBcIk9uIGFueSBwbGF0Zm9ybVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBlbXB0eSBjb21tYW5kIGxpc3QgaXMgcHJvdmlkZWRcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBlbXB0eSBtYXBcIiwgLT5cbiAgICAgICAga2V5bWFwcyA9IFt7Y29tbWFuZDogJ2NtZC1zaGlmdC1hJywgc2VsZWN0b3I6IHNlbGVjdG9yLkRhcndpbn1dXG4gICAgICAgIHNweU9uKGF0b20ua2V5bWFwcywgXCJmaW5kS2V5QmluZGluZ3NcIikuYW5kQ2FsbEZha2UgbW9ja0ZpbmRLZXlCaW5kaW5ncyhrZXltYXBzKVxuICAgICAgICBleHBlY3QoQ29tbWFuZEtleXN0cm9rZUZpbmRlcigpLmdldChbXSkpLnRvRXF1YWwge31cblxuICBkZXNjcmliZSBcIndoZW4gcGxhdGZvcm0gaXMgRGFyd2luXCIsIC0+XG4gICAgaHVtYW5pemVyID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT4gaHVtYW5pemVyID0gQ29tbWFuZEtleXN0cm9rZUZpbmRlcihcImRhcndpblwiKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdG9yIGlzICN7c2VsZWN0b3IuRGFyd2lufVwiICwgLT5cbiAgICAgIGl0IFwiaXQgbXVzdCByZXR1cm4gYWxsIGtleXN0cm9rZXMgaW4gaHVtYW5pemVkIGZvcm1cIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhEYXJ3aW5LZXlNYXAsIHNlbGVjdG9yLkRhcndpbilcbiAgICAgICAgaHVtYW5pemVkS2V5c3Ryb2tlcyA9IGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKERhcndpbktleU1hcCkpXG4gICAgICAgIGZvciBrZXlzdHJva2VzLCBnaXRDb21tYW5kIG9mIERhcndpbktleU1hcFxuICAgICAgICAgIGV4cGVjdChodW1hbml6ZWRLZXlzdHJva2VzW2dpdENvbW1hbmRdKS50b0VxdWFsKF8uaHVtYW5pemVLZXlzdHJva2Uoa2V5c3Ryb2tlcykpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5EYXJ3aW5FZGl0b3J9XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBhbGwga2V5c3Ryb2tlcyBpbiBodW1hbml6ZWQgZm9ybVwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKERhcndpbkVkaXRvcktleU1hcCwgc2VsZWN0b3IuRGFyd2luRWRpdG9yKVxuICAgICAgICBodW1hbml6ZWRLZXlzdHJva2VzID0gaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoRGFyd2luRWRpdG9yS2V5TWFwKSlcbiAgICAgICAgZm9yIGtleXN0cm9rZXMsIGdpdENvbW1hbmQgb2YgRGFyd2luRWRpdG9yS2V5TWFwXG4gICAgICAgICAgZXhwZWN0KGh1bWFuaXplZEtleXN0cm9rZXNbZ2l0Q29tbWFuZF0pLnRvRXF1YWwoXy5odW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2VzKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLldpbjMyTGludXh9XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBlbXB0eSBtYXBcIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhXaW4zMkxpbnV4S2V5TWFwLCBzZWxlY3Rvci5XaW4zMkxpbnV4KVxuICAgICAgICBleHBlY3QoaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoV2luMzJMaW51eEtleU1hcCkpKS50b0VxdWFsIHt9XG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5XaW4zMkxpbnV4RWRpdG9yfVwiICwgLT5cbiAgICAgIGl0IFwiaXQgbXVzdCByZXR1cm4gZW1wdHkgbWFwXCIsIC0+XG4gICAgICAgIHNldHVwS2V5QmluZGluZ3MoV2luMzJMaW51eEVkaXRvcktleU1hcCwgc2VsZWN0b3IuV2luMzJMaW51eEVkaXRvcilcbiAgICAgICAgZXhwZWN0KGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKFdpbjMyTGludXhFZGl0b3JLZXlNYXApKSkudG9FcXVhbCB7fVxuXG4gIGRlc2NyaWJlIFwid2hlbiBwbGF0Zm9ybSBpcyAje3NlbGVjdG9yLldpbjMyfSBvciAje3NlbGVjdG9yLkxpbnV4fVwiLCAtPlxuICAgIGh1bWFuaXplciA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+IGh1bWFuaXplciA9IENvbW1hbmRLZXlzdHJva2VGaW5kZXIoXCJ3aW4zMlwiKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdG9yIGlzICN7c2VsZWN0b3IuV2luMzJMaW51eH1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGFsbCBrZXlzdHJva2VzIGluIGh1bWFuaXplZCBmb3JtXCIsIC0+XG4gICAgICAgIHNldHVwS2V5QmluZGluZ3MoV2luMzJMaW51eEtleU1hcCwgc2VsZWN0b3IuV2luMzJMaW51eClcbiAgICAgICAgaHVtYW5pemVkS2V5c3Ryb2tlcyA9IGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKFdpbjMyTGludXhLZXlNYXApKVxuICAgICAgICBmb3Iga2V5c3Ryb2tlcywgZ2l0Q29tbWFuZCBvZiBXaW4zMkxpbnV4S2V5TWFwXG4gICAgICAgICAgZXhwZWN0KGh1bWFuaXplZEtleXN0cm9rZXNbZ2l0Q29tbWFuZF0pLnRvRXF1YWwoXy5odW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2VzKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLldpbjMyTGludXhFZGl0b3J9XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBhbGwga2V5c3Ryb2tlcyBpbiBodW1hbml6ZWQgZm9ybVwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKFdpbjMyTGludXhFZGl0b3JLZXlNYXAsIHNlbGVjdG9yLldpbjMyTGludXhFZGl0b3IpXG4gICAgICAgIGh1bWFuaXplZEtleXN0cm9rZXMgPSBodW1hbml6ZXIuZ2V0KGdldENvbW1hbmRzRnJvbUtleW1hcChXaW4zMkxpbnV4RWRpdG9yS2V5TWFwKSlcbiAgICAgICAgZm9yIGtleXN0cm9rZXMsIGdpdENvbW1hbmQgb2YgV2luMzJMaW51eEVkaXRvcktleU1hcFxuICAgICAgICAgIGV4cGVjdChodW1hbml6ZWRLZXlzdHJva2VzW2dpdENvbW1hbmRdKS50b0VxdWFsKF8uaHVtYW5pemVLZXlzdHJva2Uoa2V5c3Ryb2tlcykpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5EYXJ3aW59XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBlbXB0eSBtYXBcIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhEYXJ3aW5LZXlNYXAsIHNlbGVjdG9yLkRhcndpbilcbiAgICAgICAgZXhwZWN0KGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKERhcndpbktleU1hcCkpKS50b0VxdWFsIHt9XG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5EYXJ3aW5FZGl0b3J9XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBlbXB0eSBtYXBcIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhEYXJ3aW5FZGl0b3JLZXlNYXAsIHNlbGVjdG9yLkRhcndpbkVkaXRvcilcbiAgICAgICAgZXhwZWN0KGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKERhcndpbkVkaXRvcktleU1hcCkpKS50b0VxdWFsIHt9XG4iXX0=
