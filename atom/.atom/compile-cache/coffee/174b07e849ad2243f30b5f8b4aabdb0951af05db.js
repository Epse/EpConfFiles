(function() {
  var ColorContext, ColorParser,
    __slice = [].slice;

  ColorContext = require('../lib/color-context');

  ColorParser = require('../lib/color-parser');

  describe('ColorContext', function() {
    var context, itParses, parser, _ref;
    _ref = [], context = _ref[0], parser = _ref[1];
    itParses = function(expression) {
      return {
        asUndefinedColor: function() {
          return it("parses '" + expression + "' as undefined", function() {
            return expect(context.readColor(expression)).toBeUndefined();
          });
        },
        asInt: function(expected) {
          return it("parses '" + expression + "' as an integer with value of " + expected, function() {
            return expect(context.readInt(expression)).toEqual(expected);
          });
        },
        asFloat: function(expected) {
          return it("parses '" + expression + "' as a float with value of " + expected, function() {
            return expect(context.readFloat(expression)).toEqual(expected);
          });
        },
        asIntOrPercent: function(expected) {
          return it("parses '" + expression + "' as an integer or a percentage with value of " + expected, function() {
            return expect(context.readIntOrPercent(expression)).toEqual(expected);
          });
        },
        asFloatOrPercent: function(expected) {
          return it("parses '" + expression + "' as a float or a percentage with value of " + expected, function() {
            return expect(context.readFloatOrPercent(expression)).toEqual(expected);
          });
        },
        asColorExpression: function(expected) {
          return it("parses '" + expression + "' as a color expression", function() {
            return expect(context.readColorExpression(expression)).toEqual(expected);
          });
        },
        asColor: function() {
          var expected;
          expected = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as a color with value of " + (jasmine.pp(expected)), function() {
            var _ref1;
            return (_ref1 = expect(context.readColor(expression))).toBeColor.apply(_ref1, expected);
          });
        }
      };
    };
    describe('created without any variables', function() {
      beforeEach(function() {
        return context = new ColorContext;
      });
      itParses('10').asInt(10);
      itParses('10').asFloat(10);
      itParses('0.5').asFloat(0.5);
      itParses('.5').asFloat(0.5);
      itParses('10').asIntOrPercent(10);
      itParses('10%').asIntOrPercent(26);
      itParses('0.1').asFloatOrPercent(0.1);
      itParses('10%').asFloatOrPercent(0.1);
      itParses('red').asColorExpression('red');
      itParses('red').asColor(255, 0, 0);
      itParses('#ff0000').asColor(255, 0, 0);
      return itParses('rgb(255,127,0)').asColor(255, 127, 0);
    });
    describe('with a variables array', function() {
      var createColorVar, createVar;
      createVar = function(name, value) {
        return {
          value: value,
          name: name,
          path: '/path/to/file.coffee'
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      beforeEach(function() {
        var colorVariables, variables;
        variables = [createVar('x', '10'), createVar('y', '0.1'), createVar('z', '10%'), createColorVar('c', 'rgb(255,127,0)')];
        colorVariables = variables.filter(function(v) {
          return v.isColor;
        });
        return context = new ColorContext({
          variables: variables,
          colorVariables: colorVariables
        });
      });
      itParses('x').asInt(10);
      itParses('y').asFloat(0.1);
      itParses('z').asIntOrPercent(26);
      itParses('z').asFloatOrPercent(0.1);
      itParses('c').asColorExpression('rgb(255,127,0)');
      itParses('c').asColor(255, 127, 0);
      return describe('that contains invalid colors', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@text-height', '@scale-b-xxl * 1rem'), createVar('@component-line-height', '@text-height'), createVar('@list-item-height', '@component-line-height')];
          return context = new ColorContext({
            variables: variables
          });
        });
        return itParses('@list-item-height').asUndefinedColor();
      });
    });
    describe('with variables from a default file', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value, path) {
        var v;
        v = createVar(name, value, path);
        v.isColor = true;
        return v;
      };
      describe('when there is another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/.pigments"), createVar('b', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(20);
      });
      describe('when there is no another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/.pigments"), createVar('b', 'c', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      describe('when there is another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', "" + projectPath + "/.pigments"), createColorVar('b', '#0000ff', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(0, 0, 255);
      });
      return describe('when there is no another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', "" + projectPath + "/.pigments"), createColorVar('b', 'c', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(255, 0, 0);
      });
    });
    describe('with a reference variable', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/b.styl"), createVar('b', '20', "" + projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath, "" + projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
    return describe('with a reference path', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referencePath: "" + projectPath + "/a.styl",
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/b.styl"), createVar('b', '20', "" + projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            referencePath: "" + projectPath + "/a.styl",
            rootPaths: [projectPath, "" + projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLWNvbnRleHQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEseUJBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FBZixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQURkLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSwrQkFBQTtBQUFBLElBQUEsT0FBb0IsRUFBcEIsRUFBQyxpQkFBRCxFQUFVLGdCQUFWLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNUO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7aUJBQ2hCLEVBQUEsQ0FBSSxVQUFBLEdBQVUsVUFBVixHQUFxQixnQkFBekIsRUFBMEMsU0FBQSxHQUFBO21CQUN4QyxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsVUFBbEIsQ0FBUCxDQUFxQyxDQUFDLGFBQXRDLENBQUEsRUFEd0M7VUFBQSxDQUExQyxFQURnQjtRQUFBLENBQWxCO0FBQUEsUUFJQSxLQUFBLEVBQU8sU0FBQyxRQUFELEdBQUE7aUJBQ0wsRUFBQSxDQUFJLFVBQUEsR0FBVSxVQUFWLEdBQXFCLGdDQUFyQixHQUFxRCxRQUF6RCxFQUFxRSxTQUFBLEdBQUE7bUJBQ25FLE1BQUEsQ0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixDQUFQLENBQW1DLENBQUMsT0FBcEMsQ0FBNEMsUUFBNUMsRUFEbUU7VUFBQSxDQUFyRSxFQURLO1FBQUEsQ0FKUDtBQUFBLFFBUUEsT0FBQSxFQUFTLFNBQUMsUUFBRCxHQUFBO2lC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

//# sourceURL=/home/epse/.atom/packages/pigments/spec/color-context-spec.coffee
