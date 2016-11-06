(function() {
  var config,
    __slice = [].slice;

  config = require("./config");

  module.exports = {
    siteEngine: {
      title: "Site Engine",
      type: "string",
      "default": config.getDefault("siteEngine"),
      "enum": [config.getDefault("siteEngine")].concat(__slice.call(config.engineNames()))
    },
    siteUrl: {
      title: "Site URL",
      type: "string",
      "default": config.getDefault("siteUrl")
    },
    siteLocalDir: {
      title: "Site Local Directory",
      description: "The absolute path to your site's local directory",
      type: "string",
      "default": config.getDefault("siteLocalDir")
    },
    siteDraftsDir: {
      title: "Site Drafts Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("siteDraftsDir")
    },
    sitePostsDir: {
      title: "Site Posts Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("sitePostsDir")
    },
    siteImagesDir: {
      title: "Site Images Directory",
      description: "The relative path from your site's local directory",
      type: "string",
      "default": config.getDefault("siteImagesDir")
    },
    urlForTags: {
      title: "URL to Tags JSON definitions",
      type: "string",
      "default": config.getDefault("urlForTags")
    },
    urlForPosts: {
      title: "URL to Posts JSON definitions",
      type: "string",
      "default": config.getDefault("urlForPosts")
    },
    urlForCategories: {
      title: "URL to Categories JSON definitions",
      type: "string",
      "default": config.getDefault("urlForCategories")
    },
    newDraftFileName: {
      title: "New Draft File Name",
      type: "string",
      "default": config.getCurrentDefault("newDraftFileName")
    },
    newPostFileName: {
      title: "New Post File Name",
      type: "string",
      "default": config.getCurrentDefault("newPostFileName")
    },
    fileExtension: {
      title: "File Extension",
      type: "string",
      "default": config.getCurrentDefault("fileExtension")
    },
    relativeImagePath: {
      title: "Use Relative Image Path",
      description: "Use relative image path from the open file",
      type: "boolean",
      "default": config.getCurrentDefault("relativeImagePath")
    },
    renameImageOnCopy: {
      title: "Rename Image File Name",
      description: "Rename image filename when you chose to copy to image directory",
      type: "boolean",
      "default": config.getCurrentDefault("renameImageOnCopy")
    },
    tableAlignment: {
      title: "Table Cell Alignment",
      type: "string",
      "default": config.getDefault("tableAlignment"),
      "enum": ["empty", "left", "right", "center"]
    },
    tableExtraPipes: {
      title: "Table Extra Pipes",
      description: "Insert extra pipes at the start and the end of the table rows",
      type: "boolean",
      "default": config.getDefault("tableExtraPipes")
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29uZmlnLWJhc2ljLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxNQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsVUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxNQUFNLENBQUMsVUFBUCxDQUFrQixZQUFsQixDQUZUO0FBQUEsTUFHQSxNQUFBLEVBQU8sQ0FBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixZQUFsQixDQUFpQyxTQUFBLGFBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLENBQUEsQ0FIeEM7S0FERjtBQUFBLElBS0EsT0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sVUFBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxNQUFNLENBQUMsVUFBUCxDQUFrQixTQUFsQixDQUZUO0tBTkY7QUFBQSxJQVNBLFlBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLHNCQUFQO0FBQUEsTUFDQSxXQUFBLEVBQWEsa0RBRGI7QUFBQSxNQUVBLElBQUEsRUFBTSxRQUZOO0FBQUEsTUFHQSxTQUFBLEVBQVMsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsY0FBbEIsQ0FIVDtLQVZGO0FBQUEsSUFjQSxhQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyx1QkFBUDtBQUFBLE1BQ0EsV0FBQSxFQUFhLG9EQURiO0FBQUEsTUFFQSxJQUFBLEVB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/markdown-writer/lib/config-basic.coffee
