(function() {
  var ColorBuffer, ColorBufferElement, ColorMarkerElement, ColorProject, ColorProjectElement, ColorResultsElement, ColorSearch, Palette, PaletteElement;

  ColorBuffer = require('./color-buffer');

  ColorSearch = require('./color-search');

  ColorProject = require('./color-project');

  Palette = require('./palette');

  ColorBufferElement = require('./color-buffer-element');

  ColorMarkerElement = require('./color-marker-element');

  ColorResultsElement = require('./color-results-element');

  ColorProjectElement = require('./color-project-element');

  PaletteElement = require('./palette-element');

  ColorBufferElement.registerViewProvider(ColorBuffer);

  ColorResultsElement.registerViewProvider(ColorSearch);

  ColorProjectElement.registerViewProvider(ColorProject);

  PaletteElement.registerViewProvider(Palette);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVnaXN0ZXItZWxlbWVudHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlKQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FGZixDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUlBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQUpyQixDQUFBOztBQUFBLEVBS0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBTHJCLENBQUE7O0FBQUEsRUFNQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FOdEIsQ0FBQTs7QUFBQSxFQU9BLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVB0QixDQUFBOztBQUFBLEVBUUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FSakIsQ0FBQTs7QUFBQSxFQVVBLGtCQUFrQixDQUFDLG9CQUFuQixDQUF3QyxXQUF4QyxDQVZBLENBQUE7O0FBQUEsRUFXQSxtQkFBbUIsQ0FBQyxvQkFBcEIsQ0FBeUMsV0FBekMsQ0FYQSxDQUFBOztBQUFBLEVBWUEsbUJBQW1CLENBQUMsb0JBQXBCLENBQXlDLFlBQXpDLENBWkEsQ0FBQTs7QUFBQSxFQWFBLGNBQWMsQ0FBQyxvQkFBZixDQUFvQyxPQUFwQyxDQWJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/.atom/packages/pigments/lib/register-elements.coffee
