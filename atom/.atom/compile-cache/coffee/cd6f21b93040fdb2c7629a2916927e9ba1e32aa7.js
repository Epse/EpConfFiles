
/**
 * PHP files namespace management
 */

(function() {
  module.exports = {

    /**
     * Add the good namespace to the given file
     * @param {TextEditor} editor
     */
    createNamespace: function(editor) {
      var autoload, autoloaders, composer, directory, element, elements, index, line, lines, name, namespace, path, proxy, psr, src, text, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      proxy = require('./php-proxy.coffee');
      composer = proxy.composer();
      autoloaders = [];
      if (!composer) {
        return;
      }
      _ref = composer.autoload;
      for (psr in _ref) {
        autoload = _ref[psr];
        for (namespace in autoload) {
          src = autoload[namespace];
          if (namespace.endsWith("\\")) {
            namespace = namespace.substr(0, namespace.length - 1);
          }
          autoloaders[src] = namespace;
        }
      }
      if (composer["autoload-dev"]) {
        _ref1 = composer["autoload-dev"];
        for (psr in _ref1) {
          autoload = _ref1[psr];
          for (namespace in autoload) {
            src = autoload[namespace];
            if (namespace.endsWith("\\")) {
              namespace = namespace.substr(0, namespace.length - 1);
            }
            autoloaders[src] = namespace;
          }
        }
      }
      path = editor.getPath();
      _ref2 = atom.project.getDirectories();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        directory = _ref2[_i];
        if (path.indexOf(directory.path) === 0) {
          path = path.substr(directory.path.length + 1);
          break;
        }
      }
      path = path.replace(/\\/g, '/');
      namespace = null;
      for (src in autoloaders) {
        name = autoloaders[src];
        if (path.indexOf(src) === 0) {
          path = path.substr(src.length);
          namespace = name;
          break;
        }
      }
      if (namespace === null) {
        return;
      }
      if (path.indexOf("/") === 0) {
        path = path.substr(1);
      }
      elements = path.split('/');
      index = 1;
      for (_j = 0, _len1 = elements.length; _j < _len1; _j++) {
        element = elements[_j];
        if (element === "" || index === elements.length) {
          continue;
        }
        namespace = namespace === "" ? element : namespace + "\\" + element;
        index++;
      }
      text = editor.getText();
      index = 0;
      lines = text.split('\n');
      for (_k = 0, _len2 = lines.length; _k < _len2; _k++) {
        line = lines[_k];
        line = line.trim();
        if (line.indexOf('namespace ') === 0) {
          editor.setTextInBufferRange([[index, 0], [index + 1, 0]], "namespace " + namespace + ";\n");
          return;
        } else if (line.trim() !== "" && line.trim().indexOf("<?") !== 0) {
          editor.setTextInBufferRange([[index, 0], [index, 0]], "namespace " + namespace + ";\n\n");
          return;
        }
        index += 1;
      }
      return editor.setTextInBufferRange([[2, 0], [2, 0]], "namespace " + namespace + ";\n\n");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvbmFtZXNwYWNlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVJO0FBQUE7QUFBQTs7O09BQUE7QUFBQSxJQUlBLGVBQUEsRUFBaUIsU0FBQyxNQUFELEdBQUE7QUFDYixVQUFBLG1MQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLG9CQUFSLENBQVIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFjLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FGZCxDQUFBO0FBQUEsTUFHQSxXQUFBLEdBQWMsRUFIZCxDQUFBO0FBS0EsTUFBQSxJQUFHLENBQUEsUUFBSDtBQUNJLGNBQUEsQ0FESjtPQUxBO0FBU0E7QUFBQSxXQUFBLFdBQUE7NkJBQUE7QUFDSSxhQUFBLHFCQUFBO29DQUFBO0FBQ0ksVUFBQSxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLElBQW5CLENBQUg7QUFDSSxZQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFBVixDQUFpQixDQUFqQixFQUFvQixTQUFTLENBQUMsTUFBVixHQUFpQixDQUFyQyxDQUFaLENBREo7V0FBQTtBQUFBLFVBR0EsV0FBWSxDQUFBLEdBQUEsQ0FBWixHQUFtQixTQUhuQixDQURKO0FBQUEsU0FESjtBQUFBLE9BVEE7QUFnQkEsTUFBQSxJQUFHLFFBQVMsQ0FBQSxjQUFBLENBQVo7QUFDSTtBQUFBLGFBQUEsWUFBQTtnQ0FBQTtBQUNJLGVBQUEscUJBQUE7c0NBQUE7QUFDSSxZQUFBLElBQUcsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsSUFBbkIsQ0FBSDtBQUNJLGNBQUEsU0FB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/atom-autocomplete-php/lib/services/namespace.coffee
