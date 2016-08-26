(function() {
  var expectedCompletions, fullExpectedCompletions, mockSpawn, mockery, provider, spawn;

  mockery = require('mockery');

  mockSpawn = require('/usr/local/lib/node_modules/mock-spawn');

  provider = {};

  spawn = {};

  expectedCompletions = [
    {
      text: '__construct($test)',
      snippet: '__construct(${2:$test})${3}',
      displayText: '__construct($test)',
      type: 'method',
      leftLabel: 'undefined',
      className: 'method-undefined',
      isStatic: false
    }, {
      text: 'firstMethod($firstParam, $secondParam)',
      snippet: 'firstMethod(${2:$firstParam},${3:$secondParam})${4}',
      displayText: 'firstMethod($firstParam, $secondParam)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }, {
      text: 'secondParam(KnownObject $firstParam, Second $second)',
      snippet: 'secondParam(${2:$firstParam},${3:$second})${4}',
      displayText: 'secondParam(KnownObject $firstParam, Second $second)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }, {
      text: 'thirdMethod(KnownObject $first, Second $second, Third $third)',
      snippet: 'thirdMethod(${2:$first},${3:$second},${4:$third})${5}',
      displayText: 'thirdMethod(KnownObject $first, Second $second, Third $third)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }
  ];

  fullExpectedCompletions = [
    {
      text: '$publicVar',
      snippet: 'publicVar${2}',
      displayText: '$publicVar',
      type: 'property',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }, {
      text: '$publicStatic',
      snippet: 'publicStatic${2}',
      displayText: '$publicStatic',
      type: 'property',
      leftLabel: 'public static',
      className: 'method-public',
      isStatic: true
    }, {
      text: '$privateVar',
      snippet: 'privateVar${2}',
      displayText: '$privateVar',
      type: 'property',
      leftLabel: 'private',
      className: 'method-private',
      isStatic: false
    }, {
      text: '$protectedVar',
      snippet: 'protectedVar${2}',
      displayText: '$protectedVar',
      type: 'property',
      leftLabel: 'protected',
      className: 'method-protected',
      isStatic: false
    }, {
      text: 'TEST',
      snippet: 'TEST${2}',
      displayText: 'TEST',
      type: 'constant',
      leftLabel: 'undefined',
      className: 'method-undefined',
      isStatic: false
    }, {
      text: 'TESTINGCONSTANTS',
      snippet: 'TESTINGCONSTANTS${2}',
      displayText: 'TESTINGCONSTANTS',
      type: 'constant',
      leftLabel: 'undefined',
      className: 'method-undefined',
      isStatic: false
    }, {
      text: '__construct($test)',
      snippet: '__construct(${2:$test})${3}',
      displayText: '__construct($test)',
      type: 'method',
      leftLabel: 'undefined',
      className: 'method-undefined',
      isStatic: false
    }, {
      text: 'firstMethod($firstParam, $secondParam)',
      snippet: 'firstMethod(${2:$firstParam},${3:$secondParam})${4}',
      displayText: 'firstMethod($firstParam, $secondParam)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }, {
      text: 'secondParam(KnownObject $firstParam, Second $second)',
      snippet: 'secondParam(${2:$firstParam},${3:$second})${4}',
      displayText: 'secondParam(KnownObject $firstParam, Second $second)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }, {
      text: 'thirdMethod(KnownObject $first, Second $second, Third $third)',
      snippet: 'thirdMethod(${2:$first},${3:$second},${4:$third})${5}',
      displayText: 'thirdMethod(KnownObject $first, Second $second, Third $third)',
      type: 'method',
      leftLabel: 'public',
      className: 'method-public',
      isStatic: false
    }
  ];

  describe("Provider suite", function() {
    beforeEach(function() {
      var providerPath, verbose;
      providerPath = '../lib/provider';
      verbose = false;
      spawn = mockSpawn(verbose);
      mockery.enable({
        useCleanCache: true
      });
      mockery.registerMock('child_process', {
        spawn: spawn
      });
      mockery.registerAllowable(providerPath, true);
      return provider = require(providerPath);
    });
    afterEach(function() {
      mockery.deregisterAll();
      mockery.resetCache();
      return mockery.disable();
    });
    it("creates the method snippet correctly given the method and parameters string", function() {
      var fullMethodRegex, matches;
      fullMethodRegex = /(public|private|protected)?\s?(static)?\s?function\s(\w+)\((.*)\)/;
      matches = "public function testMethod() {".match(fullMethodRegex);
      expect(provider.createMethodSnippet(matches)).toEqual('testMethod()${2}');
      matches = "public function testMethod($simpleParam) {".match(fullMethodRegex);
      expect(provider.createMethodSnippet(matches)).toEqual('testMethod(${2:$simpleParam})${3}');
      matches = "public function testMethod(Typed $simpleParam) {".match(fullMethodRegex);
      expect(provider.createMethodSnippet(matches)).toEqual('testMethod(${2:$simpleParam})${3}');
      matches = "public function testMethod($simpleParam, $secondParam) {".match(fullMethodRegex);
      expect(provider.createMethodSnippet(matches)).toEqual('testMethod(${2:$simpleParam},${3:$secondParam})${4}');
      matches = "public function testMethod($simpleParam, Typed $secondParam) {".match(fullMethodRegex);
      return expect(provider.createMethodSnippet(matches)).toEqual('testMethod(${2:$simpleParam},${3:$secondParam})${4}');
    });
    it("gets the params for the current method", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample.php', {
          initialLine: 13
        }).then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        var bufferPosition, expected;
        expected = [
          {
            objectType: void 0,
            varName: '$firstParam'
          }, {
            objectType: void 0,
            varName: '$secondParam'
          }
        ];
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expect(provider.getMethodParams(editor, bufferPosition)).toEqual(expected);
        editor.setCursorBufferPosition([0, 0]);
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expect(provider.getMethodParams(editor, bufferPosition)).toEqual(void 0);
        editor.setCursorBufferPosition([18, 0]);
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expected[0].objectType = 'KnownObject';
        expected[1].objectType = 'Second';
        expected[1].varName = '$second';
        return expect(provider.getMethodParams(editor, bufferPosition)).toEqual(expected);
      });
    });
    it("creates completion", function() {
      var expected, method;
      method = {
        name: 'test',
        snippet: 'snippetTest',
        visibility: 'public',
        isStatic: false
      };
      expected = {
        text: 'test',
        snippet: 'snippetTest',
        displayText: 'test',
        type: 'method',
        leftLabel: 'public',
        className: 'method-public',
        isStatic: false
      };
      expect(provider.createCompletion(method)).toEqual(expected);
      method.isStatic = true;
      expected.leftLabel = 'public static';
      expected.isStatic = true;
      return expect(provider.createCompletion(method)).toEqual(expected);
    });
    it("knows the object", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample.php', {
          initialLine: 18
        }).then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        var bufferPosition;
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expect(provider.isKnownObject(editor, bufferPosition, '$firstParam->')).toEqual('KnownObject');
        editor.setCursorBufferPosition([18, 0]);
        return expect(provider.isKnownObject(editor, bufferPosition, '$second->')).toEqual('Second');
      });
    });
    it("parses the namespace", function() {
      var namespace, namespaceWithAs, objectType, regex;
      regex = /^use(.*)$/;
      namespace = 'use Object\\Space;';
      namespaceWithAs = 'use Object\\Space as Space;';
      objectType = 'Space';
      expect(provider.parseNamespace(namespace.match(regex)[1].match(objectType))).toEqual('Object\\Space');
      return expect(provider.parseNamespace(namespaceWithAs.match(regex)[1].match(objectType))).toEqual('Object\\Space');
    });
    it("gets full method definition", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample-multiple.php', {
          initialLine: 25
        }).then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        var bufferPosition;
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expect(provider.getFullMethodDefinition(editor, bufferPosition)).toEqual('public function thirdMethod(KnownObject $first,Second $second,Third $third)');
        editor.setCursorBufferPosition([2, 0]);
        bufferPosition = editor.getLastCursor().getBufferPosition();
        return expect(provider.getFullMethodDefinition(editor, bufferPosition)).toEqual('');
      });
    });
    it("matches multiple line method definition correctly", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample-multiple.php', {
          initialLine: 25
        }).then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        var bufferPosition;
        bufferPosition = editor.getLastCursor().getBufferPosition();
        expect(provider.isKnownObject(editor, bufferPosition, '$first->')).toEqual('KnownObject');
        editor.setCursorBufferPosition([25, 0]);
        expect(provider.isKnownObject(editor, bufferPosition, '$second->')).toEqual('Second');
        editor.setCursorBufferPosition([25, 0]);
        return expect(provider.isKnownObject(editor, bufferPosition, '$third->')).toEqual('Third');
      });
    });
    it("gets local methods correctly with multiline method definition", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample-multiple.php').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        return expect(provider.getLocalAvailableCompletions(editor)).toEqual(expectedCompletions);
      });
    });
    it("match current context", function() {
      expect(provider.matchCurrentContext('$this->')).toNotEqual(null);
      expect(provider.matchCurrentContext('parent::')).toNotEqual(null);
      expect(provider.matchCurrentContext('self::')).toNotEqual(null);
      expect(provider.matchCurrentContext('static::')).toNotEqual(null);
      return expect(provider.matchCurrentContext('other::')).toEqual(null);
    });
    it("gets local available completions", function() {
      var editor, local;
      editor = null;
      local = [];
      waitsForPromise(function() {
        return atom.project.open('sample/sample-full.php').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        local = [];
        return expect(provider.getLocalAvailableCompletions(editor)).toEqual(fullExpectedCompletions);
      });
    });
    it("gets parent class name", function() {
      var editor;
      editor = null;
      waitsForPromise(function() {
        return atom.project.open('sample/sample-var.php').then(function(o) {
          return editor = o;
        });
      });
      return runs(function() {
        return expect(provider.getParentClassName(editor)).toEqual('\\SomeParent');
      });
    });
    it("creates method display text", function() {
      expect(provider.createMethodDisplayText('not a method')).toEqual(void 0);
      expect(provider.createMethodDisplayText('public function testMethod()')).toEqual('testMethod()');
      expect(provider.createMethodDisplayText('public function testMethod($param)')).toEqual('testMethod($param)');
      expect(provider.createMethodDisplayText('public function testMethod(Typed $param)')).toEqual('testMethod(Typed $param)');
      expect(provider.createMethodDisplayText('public function testMethod(Typed $param, Second $param)')).toEqual('testMethod(Typed $param, Second $param)');
      expect(provider.createMethodDisplayText('public function testMethod(Typed $param,Second $param)')).toEqual('testMethod(Typed $param, Second $param)');
      expect(provider.createMethodDisplayText('public function testMethod(  Typed $param,      Second $param)')).toEqual('testMethod(Typed $param, Second $param)');
      return expect(provider.createMethodDisplayText('public function testMethod(  Typed $param,    Second $param,    Third  $p)')).toEqual('testMethod(Typed $param, Second $param, Third $p)');
    });
    return it("executes the command correctly and returns the completions", function() {
      var lastMatch, resolve;
      resolve = function(completions) {
        return expect(completions[0].text).toEqual('testMethod');
      };
      lastMatch = {
        input: '\\Obj as Teste;'
      };
      spawn.sequence.add(spawn.simple(1, '[{"name":"testMethod"}]'));
      provider.fetchAndResolveDependencies(lastMatch, '$this->test', resolve);
      expect(spawn.calls.length).toEqual(1);
      expect(spawn.calls[0].command).toEqual('php');
      return expect(spawn.calls[0].args).toEqual([provider.getScript(), provider.getAutoloadPath(), 'Obj']);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waHAtY29tcG9zZXItY29tcGxldGlvbi9zcGVjL3Byb3ZpZGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLFNBQUEsR0FBWSxPQUFBLENBQVEsd0NBQVIsQ0FEWixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLEVBRlgsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxFQUhSLENBQUE7O0FBQUEsRUFLQSxtQkFBQSxHQUFzQjtJQUFDO0FBQUEsTUFDbkIsSUFBQSxFQUFNLG9CQURhO0FBQUEsTUFFbkIsT0FBQSxFQUFTLDZCQUZVO0FBQUEsTUFHbkIsV0FBQSxFQUFhLG9CQUhNO0FBQUEsTUFJbkIsSUFBQSxFQUFNLFFBSmE7QUFBQSxNQUtuQixTQUFBLEVBQVcsV0FMUTtBQUFBLE1BTW5CLFNBQUEsRUFBVyxrQkFOUTtBQUFBLE1BT25CLFFBQUEsRUFBVSxLQVBTO0tBQUQsRUFRbkI7QUFBQSxNQUNDLElBQUEsRUFBTSx3Q0FEUDtBQUFBLE1BRUMsT0FBQSxFQUFTLHFEQUZWO0FBQUEsTUFHQyxXQUFBLEVBQWEsd0NBSGQ7QUFBQSxNQUlDLElBQUEsRUFBTSxRQUpQO0FBQUEsTUFLQyxTQUFBLEVBQVcsUUFMWjtBQUFBLE1BTUMsU0FBQSxFQUFXLGVBTlo7QUFBQSxNQU9DLFFBQUEsRUFBVSxLQVBYO0tBUm1CLEVBZ0JuQjtBQUFBLE1BQ0MsSUFBQSxFQUFNLHNEQURQO0FBQUEsTUFFQyxPQUFBLEVBQVMsZ0RBRlY7QUFBQSxNQUdDLFdBQUEsRUFBYSxzREFIZDtBQUFBLE1BSUMsSUFBQSxFQUFNLFFBSlA7QUFBQSxNQUtDLFNBQUEsRUFBVyxR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

//# sourceURL=/home/epse/.atom/packages/php-composer-completion/spec/provider-spec.coffee
