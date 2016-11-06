(function() {
  module.exports = {
    autoToggle: {
      title: "Auto Toggle",
      description: "Toggle on start.",
      type: "boolean",
      "default": true
    },
    comboMode: {
      type: "object",
      properties: {
        enabled: {
          title: "Combo Mode - Enabled",
          description: "When enabled effects won't appear until reach the activation threshold.",
          type: "boolean",
          "default": true,
          order: 1
        },
        activationThreshold: {
          title: "Combo Mode - Activation Threshold",
          description: "Streak threshold to activate the power mode.",
          type: "integer",
          "default": 50,
          minimum: 1,
          maximum: 1000
        },
        streakTimeout: {
          title: "Combo Mode - Streak Timeout",
          description: "Timeout to reset the streak counter. In seconds.",
          type: "integer",
          "default": 10,
          minimum: 1,
          maximum: 100
        },
        exclamationEvery: {
          title: "Combo Mode - Exclamation Every",
          description: "Shows an exclamation every streak count.",
          type: "integer",
          "default": 10,
          minimum: 1,
          maximum: 100
        },
        exclamationTexts: {
          title: "Combo Mode - Exclamation Texts",
          description: "Exclamations to show (randomized).",
          type: "array",
          "default": ["Super!", "Radical!", "Fantastic!", "Great!", "OMG", "Whoah!", ":O", "Nice!", "Splendid!", "Wild!", "Grand!", "Impressive!", "Stupendous!", "Extreme!", "Awesome!"]
        },
        opacity: {
          title: "Combo Mode - Opacity",
          description: "Opacity of the streak counter.",
          type: "number",
          "default": 0.6,
          minimum: 0,
          maximum: 1
        }
      }
    },
    screenShake: {
      type: "object",
      properties: {
        minIntensity: {
          title: "Screen Shake - Minimum Intensity",
          description: "The minimum (randomized) intensity of the shake.",
          type: "integer",
          "default": 1,
          minimum: 0,
          maximum: 100
        },
        maxIntensity: {
          title: "Screen Shake - Maximum Intensity",
          description: "The maximum (randomized) intensity of the shake.",
          type: "integer",
          "default": 3,
          minimum: 0,
          maximum: 100
        },
        enabled: {
          title: "Screen Shake - Enabled",
          description: "Turn the shaking on/off.",
          type: "boolean",
          "default": true
        }
      }
    },
    playAudio: {
      type: "object",
      properties: {
        enabled: {
          title: "Play Audio - Enabled",
          description: "Play audio clip on/off.",
          type: "boolean",
          "default": false
        },
        volume: {
          title: "Play Audio - Volume",
          description: "Volume of the audio clip played at keystroke.",
          type: "number",
          "default": 0.42,
          minimum: 0.0,
          maximum: 1.0
        }
      }
    },
    particles: {
      type: "object",
      properties: {
        enabled: {
          title: "Particles - Enabled",
          description: "Turn the particles on/off.",
          type: "boolean",
          "default": true,
          order: 1
        },
        colours: {
          type: "object",
          properties: {
            type: {
              title: "Colours",
              description: "Configure colour options",
              type: "string",
              "default": "cursor",
              "enum": [
                {
                  value: 'cursor',
                  description: 'Particles will be the colour at the cursor.'
                }, {
                  value: 'random',
                  description: 'Particles will have random colours.'
                }, {
                  value: 'fixed',
                  description: 'Particles will have a fixed colour.'
                }
              ],
              order: 1
            },
            fixed: {
              title: "Fixed colour",
              description: "Colour when fixed colour is selected",
              type: "color",
              "default": "#fff"
            }
          }
        },
        totalCount: {
          type: "object",
          properties: {
            max: {
              title: "Particles - Max Total",
              description: "The maximum total number of particles on the screen.",
              type: "integer",
              "default": 500,
              minimum: 0
            }
          }
        },
        spawnCount: {
          type: "object",
          properties: {
            min: {
              title: "Particles - Minimum Spawned",
              description: "The minimum (randomized) number of particles spawned on input.",
              type: "integer",
              "default": 5
            },
            max: {
              title: "Particles - Maximum Spawned",
              description: "The maximum (randomized) number of particles spawned on input.",
              type: "integer",
              "default": 15
            }
          }
        },
        size: {
          type: "object",
          properties: {
            min: {
              title: "Particles - Minimum Size",
              description: "The minimum (randomized) size of the particles.",
              type: "integer",
              "default": 2,
              minimum: 0
            },
            max: {
              title: "Particles - Maximum Size",
              description: "The maximum (randomized) size of the particles.",
              type: "integer",
              "default": 4,
              minimum: 0
            }
          }
        }
      }
    },
    excludedFileTypes: {
      type: "object",
      properties: {
        excluded: {
          title: "Prohibit activate-power-mode from enabling on these file types:",
          description: "Use comma separated, lowercase values (i.e. \"html, cpp, css\")",
          type: "array",
          "default": ["."]
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2NvbmZpZy1zY2hlbWEuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxNQUNBLFdBQUEsRUFBYSxrQkFEYjtBQUFBLE1BRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxNQUdBLFNBQUEsRUFBUyxJQUhUO0tBREY7QUFBQSxJQU1BLFNBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxNQUNBLFVBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sc0JBQVA7QUFBQSxVQUNBLFdBQUEsRUFBYSx5RUFEYjtBQUFBLFVBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxVQUdBLFNBQUEsRUFBUyxJQUhUO0FBQUEsVUFJQSxLQUFBLEVBQU8sQ0FKUDtTQURGO0FBQUEsUUFPQSxtQkFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sbUNBQVA7QUFBQSxVQUNBLFdBQUEsRUFBYSw4Q0FEYjtBQUFBLFVBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxVQUdBLFNBQUEsRUFBUyxFQUhUO0FBQUEsVUFJQSxPQUFBLEVBQVMsQ0FKVDtBQUFBLFVBS0EsT0FBQSxFQUFTLElBTFQ7U0FSRjtBQUFBLFFBZUEsYUFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sNkJBQVA7QUFBQSxVQUNBLFdBQUEsRUFBYSxrREFEYjtBQUFBLFVBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxVQUdBLFNBQUEsRUFBUyxFQUhUO0FBQUEsVUFJQSxPQUFBLEVBQVMsQ0FKVDtB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

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/activate-power-mode/lib/config-schema.coffee
