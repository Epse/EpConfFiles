(function() {
  module.exports = [
    {
      begin: /^((\\)begin)({)(code|spec)(})(\s*\n)?/,
      beginCaptures: {
        1: {
          name: 'support.function.be.latex'
        },
        2: {
          name: 'punctuation.definition.function.latex'
        },
        3: {
          name: 'punctuation.definition.arguments.begin.latex'
        },
        5: {
          name: 'punctuation.definition.arguments.end.latex'
        }
      },
      end: /^((\\)end)({)\4(})/,
      endCaptures: {
        1: {
          name: 'support.function.be.latex'
        },
        2: {
          name: 'punctuation.definition.function.latex'
        },
        3: {
          name: 'punctuation.definition.arguments.begin.latex'
        },
        4: {
          name: 'punctuation.definition.arguments.end.latex'
        }
      },
      contentName: 'source.haskell.embedded.latex',
      name: 'meta.embedded.block.haskell.latex',
      patterns: [
        {
          include: 'source.haskell'
        }
      ]
    }, {
      begin: /^(?=[><] )/,
      end: /^(?![><] )/,
      name: 'meta.embedded.haskell',
      patterns: (require('./haskell-patterns')).concat({
        match: /^> /,
        name: 'punctuation.definition.bird-track.haskell'
      })
    }, {
      match: '(?<!\\\\verb)\\|((:?[^|]|\\|\\|)+)\\|',
      name: 'meta.embedded.text.haskell.latex',
      captures: {
        1: {
          patterns: [
            {
              include: 'source.haskell'
            }
          ]
        }
      }
    }, {
      include: 'text.tex.latex'
    }
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvbGhzLXBhdHRlcm5zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQ0k7QUFBQSxNQUFBLEtBQUEsRUFBTyx1Q0FBUDtBQUFBLE1BQ0EsYUFBQSxFQUNFO0FBQUEsUUFBQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSwyQkFBTjtTQURGO0FBQUEsUUFFQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSx1Q0FBTjtTQUhGO0FBQUEsUUFJQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSw4Q0FBTjtTQUxGO0FBQUEsUUFNQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSw0Q0FBTjtTQVBGO09BRkY7QUFBQSxNQVVBLEdBQUEsRUFBSyxvQkFWTDtBQUFBLE1BV0EsV0FBQSxFQUNFO0FBQUEsUUFBQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSwyQkFBTjtTQURGO0FBQUEsUUFFQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSx1Q0FBTjtTQUhGO0FBQUEsUUFJQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSw4Q0FBTjtTQUxGO0FBQUEsUUFNQSxDQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSw0Q0FBTjtTQVBGO09BWkY7QUFBQSxNQW9CQSxXQUFBLEVBQWEsK0JBcEJiO0FBQUEsTUFxQkEsSUFBQSxFQUFNLG1DQXJCTjtBQUFBLE1Bc0JBLFFBQUEsRUFBVTtRQUNOO0FBQUEsVUFBQSxPQUFBLEVBQVMsZ0JBQVQ7U0FETTtPQXRCVjtLQURKLEVBMkJJO0FBQUEsTUFBQSxLQUFBLEVBQU8sWUFBUDtBQUFBLE1BQ0EsR0FBQSxFQUFLLFlBREw7QUFBQSxNQUVBLElBQUEsRUFBTSx1QkFGTjtBQUFBLE1BR0EsUUFBQSxFQUFVLENBQUMsT0FBQSxDQUFRLG9CQUFSLENBQUQsQ0FBOEIsQ0FBQyxNQUEvQixDQUNSO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLDJDQUROO09BRFEsQ0FIVjtLQTNCSixFQWtDSTtBQUFBLE1BQUEsS0FBQSxFQUFPLHVDQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sa0NBRE47QUFBQSxNQUVBLFFBQUEsRUFDRTtBQUFBLFFBQUEsQ0FBQSxFQUFHO0FBQUEsVUFBQSxRQUFBLEVBQVU7WUFBQztBQUFBLGNBQUEsT0FBQSxFQUFTLGdCQUFUO2FBQUQ7V0FBVjtTQUFIO09BSEY7S0FsQ0osRUF1Q0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxnQkFBVDtLQXZDSjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/src/include/lhs-patterns.coffee
