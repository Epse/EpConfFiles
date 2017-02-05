(function() {
  var LinterRust, errorModes, linter;

  errorModes = require('../lib/mode');

  LinterRust = require('../lib/linter-rust');

  linter = new LinterRust();

  describe("errorModes::OLD_RUSTC::parse", function() {
    it("should return 0 messages for an empty string", function() {
      return expect(errorModes.OLD_RUSTC.parse('', {})).toEqual([]);
    });
    it("should properly parse one line error message", function() {
      return expect(errorModes.OLD_RUSTC.parse('my/awesome file.rs:1:2: 3:4 error: my awesome text\n', {})).toEqual([
        {
          type: 'Error',
          text: 'my awesome text',
          filePath: 'my/awesome file.rs',
          range: [[0, 1], [2, 3]]
        }
      ]);
    });
    it("should properly parse one line warning message", function() {
      return expect(errorModes.OLD_RUSTC.parse('foo:33:44: 22:33 warning: äüö<>\n', {})).toEqual([
        {
          type: 'Warning',
          text: 'äüö<>',
          filePath: 'foo',
          range: [[32, 43], [21, 32]]
        }
      ]);
    });
    it("should return messages with a range of at least one character", function() {
      var editor;
      editor = atom.workspace.buildTextEditor();
      editor.setText('fn main() {\nprintln!("Hi test");}\n');
      expect(errorModes.OLD_RUSTC.parse('foo:1:1: 1:1 error: text\n', {
        textEditor: editor
      })).toEqual([
        {
          type: 'Error',
          text: 'text',
          filePath: 'foo',
          range: [[0, 0], [0, 2]]
        }
      ]);
      return expect(errorModes.OLD_RUSTC.parse('foo:2:1: 2:1 error: text\n', {
        textEditor: editor
      })).toEqual([
        {
          type: 'Error',
          text: 'text',
          filePath: 'foo',
          range: [[1, 0], [1, 7]]
        }
      ]);
    });
    it("should properly parse multiline messages", function() {
      expect(errorModes.OLD_RUSTC.parse('bar:1:2: 3:4 error: line one\ntwo\n', {})).toEqual([
        {
          type: 'Error',
          text: 'line one\ntwo',
          filePath: 'bar',
          range: [[0, 1], [2, 3]]
        }
      ]);
      expect(errorModes.OLD_RUSTC.parse('bar:1:2: 3:4 error: line one\ntwo\nfoo:1:1: 1:2 warning: simple line\n', {})).toEqual([
        {
          type: 'Error',
          text: 'line one\ntwo',
          filePath: 'bar',
          range: [[0, 1], [2, 3]]
        }, {
          type: 'Warning',
          text: 'simple line',
          filePath: 'foo',
          range: [[0, 0], [0, 1]]
        }
      ]);
      return expect(errorModes.OLD_RUSTC.parse('bar:1:2: 3:4 error: line one\ntwo\nthree\nfoo:1   shouldnt match', {})).toEqual([
        {
          type: 'Error',
          text: 'line one\ntwo\nthree',
          filePath: 'bar',
          range: [[0, 1], [2, 3]]
        }
      ]);
    });
    it("should also cope with windows line breaks", function() {
      var multi;
      expect(errorModes.OLD_RUSTC.parse('a:1:2: 3:4 error: a\r\nb\n', {})[0].text).toEqual('a\r\nb');
      multi = errorModes.OLD_RUSTC.parse('a:1:2: 3:4 error: a\n\rb\n\rx:1:2: 3:4 error: asd\r\n', {});
      expect(multi[0].text).toEqual('a\n\rb');
      return expect(multi[1].text).toEqual('asd');
    });
    return it("should not throw an error with extra whitespace in paths", function() {
      var buildLinterWithWhitespacePath, resetPath;
      buildLinterWithWhitespacePath = function() {
        atom.config.set("linter-rust.rustc", "rustc\n");
        atom.config.set("linter-rust.cargo", "cargo\n");
        return new LinterRust();
      };
      resetPath = function() {
        atom.config.set("linter-rust.rustc", "rustc");
        return atom.config.set("linter-rust.cargo", "cargo");
      };
      expect(buildLinterWithWhitespacePath).not.toThrow();
      return resetPath();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1ydXN0L3NwZWMvcGFyc2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjs7RUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLG9CQUFSOztFQUViLE1BQUEsR0FBYSxJQUFBLFVBQUEsQ0FBQTs7RUFFYixRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTtJQUN2QyxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTthQUNqRCxNQUFBLENBQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFyQixDQUEyQixFQUEzQixFQUErQixFQUEvQixDQUFQLENBQTBDLENBQUMsT0FBM0MsQ0FBbUQsRUFBbkQ7SUFEaUQsQ0FBbkQ7SUFHQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTthQUNqRCxNQUFBLENBQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFyQixDQUEyQixzREFBM0IsRUFBbUYsRUFBbkYsQ0FBUCxDQUNFLENBQUMsT0FESCxDQUNXO1FBQUM7VUFDUixJQUFBLEVBQU0sT0FERTtVQUVSLElBQUEsRUFBTSxpQkFGRTtVQUdSLFFBQUEsRUFBVSxvQkFIRjtVQUlSLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUpDO1NBQUQ7T0FEWDtJQURpRCxDQUFuRDtJQVNBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBO2FBQ25ELE1BQUEsQ0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQXJCLENBQTJCLG1DQUEzQixFQUFnRSxFQUFoRSxDQUFQLENBQ0UsQ0FBQyxPQURILENBQ1c7UUFBQztVQUNSLElBQUEsRUFBTSxTQURFO1VBRVIsSUFBQSxFQUFNLE9B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LENBQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFyQixDQUEyQiw0QkFBM0IsRUFBeUQsRUFBekQsQ0FBNkQsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUF2RSxDQUNFLENBQUMsT0FESCxDQUNXLFFBRFg7TUFHQSxLQUFBLEdBQVEsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFyQixDQUEyQix1REFBM0IsRUFBb0YsRUFBcEY7TUFDUixNQUFBLENBQU8sS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWhCLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsUUFBOUI7YUFDQSxNQUFBLENBQU8sS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWhCLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsS0FBOUI7SUFOOEMsQ0FBaEQ7V0FRQSxFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQTtBQUM3RCxVQUFBO01BQUEsNkJBQUEsR0FBZ0MsU0FBQTtRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDLFNBQXJDO1FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQyxTQUFyQztlQUNJLElBQUEsVUFBQSxDQUFBO01BSDBCO01BS2hDLFNBQUEsR0FBWSxTQUFBO1FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQyxPQUFyQztlQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsRUFBcUMsT0FBckM7TUFGVTtNQUlaLE1BQUEsQ0FBTyw2QkFBUCxDQUFxQyxDQUFDLEdBQUcsQ0FBQyxPQUExQyxDQUFBO2FBQ0EsU0FBQSxDQUFBO0lBWDZELENBQS9EO0VBdEV1QyxDQUF6QztBQUxBIiwic291cmNlc0NvbnRlbnQiOlsiZXJyb3JNb2RlcyA9IHJlcXVpcmUgJy4uL2xpYi9tb2RlJ1xuTGludGVyUnVzdCA9IHJlcXVpcmUgJy4uL2xpYi9saW50ZXItcnVzdCdcblxubGludGVyID0gbmV3IExpbnRlclJ1c3QoKVxuXG5kZXNjcmliZSBcImVycm9yTW9kZXM6Ok9MRF9SVVNUQzo6cGFyc2VcIiwgLT5cbiAgaXQgXCJzaG91bGQgcmV0dXJuIDAgbWVzc2FnZXMgZm9yIGFuIGVtcHR5IHN0cmluZ1wiLCAtPlxuICAgIGV4cGVjdChlcnJvck1vZGVzLk9MRF9SVVNUQy5wYXJzZSgnJywge30pKS50b0VxdWFsKFtdKVxuXG4gIGl0IFwic2hvdWxkIHByb3Blcmx5IHBhcnNlIG9uZSBsaW5lIGVycm9yIG1lc3NhZ2VcIiwgLT5cbiAgICBleHBlY3QoZXJyb3JNb2Rlcy5PTERfUlVTVEMucGFyc2UoJ215L2F3ZXNvbWUgZmlsZS5yczoxOjI6IDM6NCBlcnJvcjogbXkgYXdlc29tZSB0ZXh0XFxuJywge30pKVxuICAgICAgLnRvRXF1YWwoW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJ1xuICAgICAgICB0ZXh0OiAnbXkgYXdlc29tZSB0ZXh0J1xuICAgICAgICBmaWxlUGF0aDogJ215L2F3ZXNvbWUgZmlsZS5ycydcbiAgICAgICAgcmFuZ2U6IFtbMCwgMV0sIFsyLCAzXV1cbiAgICAgIH1dKVxuXG4gIGl0IFwic2hvdWxkIHByb3Blcmx5IHBhcnNlIG9uZSBsaW5lIHdhcm5pbmcgbWVzc2FnZVwiLCAtPlxuICAgIGV4cGVjdChlcnJvck1vZGVzLk9MRF9SVVNUQy5wYXJzZSgnZm9vOjMzOjQ0OiAyMjozMyB3YXJuaW5nOiDDpMO8w7Y8PlxcbicsIHt9KSlcbiAgICAgIC50b0VxdWFsKFt7XG4gICAgICAgIHR5cGU6ICdXYXJuaW5nJyxcbiAgICAgICAgdGV4dDogJ8Okw7zDtjw+J1xuICAgICAgICBmaWxlUGF0aDogJ2ZvbydcbiAgICAgICAgcmFuZ2U6IFtbMzIsIDQzXSwgWzIxLCAzMl1dXG4gICAgICB9XSlcblxuICBpdCBcInNob3VsZCByZXR1cm4gbWVzc2FnZXMgd2l0aCBhIHJhbmdlIG9mIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKVxuICAgIGVkaXRvci5zZXRUZXh0ICdmbiBtYWluKCkge1xcbnByaW50bG4hKFwiSGkgdGVzdFwiKTt9XFxuJ1xuICAgICAgICAjIGV4cGVjdChlZGl0b3IuZ2V0UGF0aCgpKS50b0NvbnRhaW4gJ2MuY29mZmVlJ1xuICAgIGV4cGVjdChlcnJvck1vZGVzLk9MRF9SVVNUQy5wYXJzZSgnZm9vOjE6MTogMToxIGVycm9yOiB0ZXh0XFxuJywge3RleHRFZGl0b3I6IGVkaXRvcn0pKVxuICAgICAgLnRvRXF1YWwoW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJ1xuICAgICAgICB0ZXh0OiAndGV4dCdcbiAgICAgICAgZmlsZVBhdGg6ICdmb28nXG4gICAgICAgIHJhbmdlOiBbWzAsIDBdLCBbMCwgMl1dXG4gICAgICB9XSlcbiAgICBleHBlY3QoZXJyb3JNb2Rlcy5PTERfUlVTVEMucGFyc2UoJ2ZvbzoyOjE6IDI6MSBlcnJvcjogdGV4dFxcbicsIHt0ZXh0RWRpdG9yOiBlZGl0b3J9KSlcbiAgICAgIC50b0VxdWFsKFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcidcbiAgICAgICAgdGV4dDogJ3RleHQnXG4gICAgICAgIGZpbGVQYXRoOiAnZm9vJ1xuICAgICAgICByYW5nZTogW1sxLCAwXSwgWzEsIDddXVxuICAgICAgfV0pXG5cbiAgaXQgXCJzaG91bGQgcHJvcGVybHkgcGFyc2UgbXVsdGlsaW5lIG1lc3NhZ2VzXCIsIC0+XG4gICAgZXhwZWN0KGVycm9yTW9kZXMuT0xEX1JVU1RDLnBhcnNlKCdiYXI6MToyOiAzOjQgZXJyb3I6IGxpbmUgb25lXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0d29cXG4nLCB7fSkpXG4gICAgICAudG9FcXVhbChbXG4gICAgICAgIHsgdHlwZTogJ0Vycm9yJywgdGV4dDogJ2xpbmUgb25lXFxudHdvJywgZmlsZVBhdGg6ICdiYXInLCByYW5nZTogW1swLCAxXSwgWzIsIDNdXSB9XG4gICAgICBdKVxuICAgIGV4cGVjdChlcnJvck1vZGVzLk9MRF9SVVNUQy5wYXJzZSgnYmFyOjE6MjogMzo0IGVycm9yOiBsaW5lIG9uZVxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgdHdvXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICBmb286MToxOiAxOjIgd2FybmluZzogc2ltcGxlIGxpbmVcXG4nLCB7fSkpXG4gICAgICAudG9FcXVhbChbXG4gICAgICAgIHsgdHlwZTogJ0Vycm9yJywgdGV4dDogJ2xpbmUgb25lXFxudHdvJywgZmlsZVBhdGg6ICdiYXInLCByYW5nZTogW1swLCAxXSwgWzIsIDNdXSB9LFxuICAgICAgICB7IHR5cGU6ICdXYXJuaW5nJywgdGV4dDogJ3NpbXBsZSBsaW5lJywgZmlsZVBhdGg6ICdmb28nLCByYW5nZTogW1swLCAwXSwgWzAsIDFdXSB9XG4gICAgICBdKVxuICAgIGV4cGVjdChlcnJvck1vZGVzLk9MRF9SVVNUQy5wYXJzZSgnYmFyOjE6MjogMzo0IGVycm9yOiBsaW5lIG9uZVxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgdHdvXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aHJlZVxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgZm9vOjEgICBzaG91bGRudCBtYXRjaCcsIHt9KSlcbiAgICAgIC50b0VxdWFsKFtcbiAgICAgICAgeyB0eXBlOiAnRXJyb3InLCB0ZXh0OiAnbGluZSBvbmVcXG50d29cXG50aHJlZScsIGZpbGVQYXRoOiAnYmFyJywgcmFuZ2U6IFtbMCwgMV0sIFsyLCAzXV0gfVxuICAgICAgXSlcblxuICBpdCBcInNob3VsZCBhbHNvIGNvcGUgd2l0aCB3aW5kb3dzIGxpbmUgYnJlYWtzXCIsIC0+XG4gICAgZXhwZWN0KGVycm9yTW9kZXMuT0xEX1JVU1RDLnBhcnNlKCdhOjE6MjogMzo0IGVycm9yOiBhXFxyXFxuYlxcbicsIHt9KVswXS50ZXh0KVxuICAgICAgLnRvRXF1YWwoJ2FcXHJcXG5iJylcblxuICAgIG11bHRpID0gZXJyb3JNb2Rlcy5PTERfUlVTVEMucGFyc2UoJ2E6MToyOiAzOjQgZXJyb3I6IGFcXG5cXHJiXFxuXFxyeDoxOjI6IDM6NCBlcnJvcjogYXNkXFxyXFxuJywge30pXG4gICAgZXhwZWN0KG11bHRpWzBdLnRleHQpLnRvRXF1YWwoJ2FcXG5cXHJiJylcbiAgICBleHBlY3QobXVsdGlbMV0udGV4dCkudG9FcXVhbCgnYXNkJylcblxuICBpdCBcInNob3VsZCBub3QgdGhyb3cgYW4gZXJyb3Igd2l0aCBleHRyYSB3aGl0ZXNwYWNlIGluIHBhdGhzXCIsIC0+XG4gICAgYnVpbGRMaW50ZXJXaXRoV2hpdGVzcGFjZVBhdGggPSAoKSAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0IFwibGludGVyLXJ1c3QucnVzdGNcIiwgXCJydXN0Y1xcblwiXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgXCJsaW50ZXItcnVzdC5jYXJnb1wiLCBcImNhcmdvXFxuXCJcbiAgICAgIG5ldyBMaW50ZXJSdXN0KClcblxuICAgIHJlc2V0UGF0aCA9ICgpIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgXCJsaW50ZXItcnVzdC5ydXN0Y1wiLCBcInJ1c3RjXCJcbiAgICAgIGF0b20uY29uZmlnLnNldCBcImxpbnRlci1ydXN0LmNhcmdvXCIsIFwiY2FyZ29cIlxuXG4gICAgZXhwZWN0KGJ1aWxkTGludGVyV2l0aFdoaXRlc3BhY2VQYXRoKS5ub3QudG9UaHJvdygpXG4gICAgcmVzZXRQYXRoKClcbiJdfQ==
