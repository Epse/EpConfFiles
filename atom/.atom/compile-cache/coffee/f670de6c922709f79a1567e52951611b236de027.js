(function() {
  var Pigments, deserializers, registry;

  registry = require('../../lib/color-expressions');

  Pigments = require('../../lib/pigments');

  deserializers = {
    Palette: 'deserializePalette',
    ColorSearch: 'deserializeColorSearch',
    ColorProject: 'deserializeColorProject',
    ColorProjectElement: 'deserializeColorProjectElement',
    VariablesCollection: 'deserializeVariablesCollection'
  };

  beforeEach(function() {
    var k, v;
    atom.config.set('pigments.markerType', 'background');
    atom.views.addViewProvider(Pigments.pigmentsViewProvider);
    for (k in deserializers) {
      v = deserializers[k];
      atom.deserializers.add({
        name: k,
        deserialize: Pigments[v]
      });
    }
    return registry.removeExpression('pigments:variables');
  });

  afterEach(function() {
    return registry.removeExpression('pigments:variables');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvaGVscGVycy9zcGVjLWhlbHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsYUFBQSxHQUNFO0FBQUEsSUFBQSxPQUFBLEVBQVMsb0JBQVQ7QUFBQSxJQUNBLFdBQUEsRUFBYSx3QkFEYjtBQUFBLElBRUEsWUFBQSxFQUFjLHlCQUZkO0FBQUEsSUFHQSxtQkFBQSxFQUFxQixnQ0FIckI7QUFBQSxJQUlBLG1CQUFBLEVBQXFCLGdDQUpyQjtHQUpGLENBQUE7O0FBQUEsRUFVQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLEVBQXVDLFlBQXZDLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLENBQTJCLFFBQVEsQ0FBQyxvQkFBcEMsQ0FEQSxDQUFBO0FBR0EsU0FBQSxrQkFBQTsyQkFBQTtBQUNFLE1BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QjtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQU47QUFBQSxRQUFTLFdBQUEsRUFBYSxRQUFTLENBQUEsQ0FBQSxDQUEvQjtPQUF2QixDQUFBLENBREY7QUFBQSxLQUhBO1dBTUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLG9CQUExQixFQVBTO0VBQUEsQ0FBWCxDQVZBLENBQUE7O0FBQUEsRUFtQkEsU0FBQSxDQUFVLFNBQUEsR0FBQTtXQUNSLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUIsRUFEUTtFQUFBLENBQVYsQ0FuQkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/pigments/spec/helpers/spec-helper.coffee
