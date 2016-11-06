(function() {
  var path;

  path = require("path");

  module.exports = {
    play: function() {
      var audio, pathtoaudio;
      pathtoaudio = path.join(__dirname, '../audioclips/gun.wav');
      audio = new Audio(pathtoaudio);
      audio.currentTime = 0;
      audio.volume = this.getConfig("volume");
      return audio.play();
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode.playAudio." + config);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL3BsYXktYXVkaW8uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsa0JBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsdUJBQXJCLENBQWQsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLFdBQU4sQ0FEWixDQUFBO0FBQUEsTUFFQSxLQUFLLENBQUMsV0FBTixHQUFvQixDQUZwQixDQUFBO0FBQUEsTUFHQSxLQUFLLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxTQUFELENBQVcsUUFBWCxDQUhmLENBQUE7YUFJQSxLQUFLLENBQUMsSUFBTixDQUFBLEVBTEk7SUFBQSxDQUFOO0FBQUEsSUFPQSxTQUFBLEVBQVcsU0FBQyxNQUFELEdBQUE7YUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBaUIsZ0NBQUEsR0FBZ0MsTUFBakQsRUFEUztJQUFBLENBUFg7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/activate-power-mode/lib/play-audio.coffee
