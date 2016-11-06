(function() {
  var include, makeGrammar, _, _ref;

  _ref = require('./syntax-tools'), include = _ref.include, makeGrammar = _ref.makeGrammar;

  _ = require('underscore-plus');

  makeGrammar("grammars/haskell.cson", {
    name: 'Haskell',
    fileTypes: ['hs'],
    firstLineMatch: '^\\#\\!.*\\brunhaskell\\b',
    scopeName: 'source.haskell',
    macros: include('macros'),
    repository: include('repository'),
    patterns: include('haskell-patterns')
  });

  makeGrammar("grammars/haskell autocompletion hint.cson", {
    fileTypes: [],
    scopeName: 'hint.haskell',
    macros: include('macros'),
    patterns: [
      {
        include: '#function_type_declaration'
      }, {
        include: '#ctor_type_declaration'
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/haskell type hint.cson", {
    fileTypes: [],
    scopeName: 'hint.type.haskell',
    macros: include('macros'),
    patterns: [
      {
        include: '#type_signature'
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/haskell message hint.cson", {
    fileTypes: [],
    scopeName: 'hint.message.haskell',
    macros: include('macros'),
    patterns: [
      {
        match: /^[^:]*:(.+)$/,
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
        begin: /^[^:]*:$/,
        end: /^(?=\S)/,
        patterns: [
          {
            include: 'source.haskell'
          }
        ]
      }, {
        begin: /‘/,
        end: /’/,
        patterns: [
          {
            include: 'source.haskell'
          }
        ]
      }
    ],
    repository: include('repository')
  });

  makeGrammar("grammars/literate haskell.cson", {
    name: 'Literate Haskell',
    fileTypes: ['lhs'],
    scopeName: 'text.tex.latex.haskell',
    macros: _.extend((require('clone'))(include('macros')), {
      maybeBirdTrack: /^(?:>|<) /,
      indentBlockEnd: /^(?!(?:>|<) \1{indentChar}|(?:>|<) {indentChar}*$)|^(?!(?:>|<) )/,
      operatorChar: /[\p{S}\p{P}&&[^(),;\[\]`{}_"'\|]]/
    }),
    patterns: include('lhs-patterns'),
    repository: include('repository')
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2hhc2tlbGwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsT0FBeUIsT0FBQSxDQUFRLGdCQUFSLENBQXpCLEVBQUMsZUFBQSxPQUFELEVBQVUsbUJBQUEsV0FBVixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxXQUFBLENBQVksdUJBQVosRUFDRTtBQUFBLElBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxJQUNBLFNBQUEsRUFBVyxDQUFFLElBQUYsQ0FEWDtBQUFBLElBRUEsY0FBQSxFQUFnQiwyQkFGaEI7QUFBQSxJQUdBLFNBQUEsRUFBVyxnQkFIWDtBQUFBLElBS0EsTUFBQSxFQUFRLE9BQUEsQ0FBUSxRQUFSLENBTFI7QUFBQSxJQU1BLFVBQUEsRUFBWSxPQUFBLENBQVEsWUFBUixDQU5aO0FBQUEsSUFPQSxRQUFBLEVBQVUsT0FBQSxDQUFRLGtCQUFSLENBUFY7R0FERixDQUhBLENBQUE7O0FBQUEsRUFhQSxXQUFBLENBQVksMkNBQVosRUFFRTtBQUFBLElBQUEsU0FBQSxFQUFXLEVBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxjQURYO0FBQUEsSUFHQSxNQUFBLEVBQVEsT0FBQSxDQUFRLFFBQVIsQ0FIUjtBQUFBLElBSUEsUUFBQSxFQUFVO01BQ047QUFBQSxRQUFDLE9BQUEsRUFBUyw0QkFBVjtPQURNLEVBRU47QUFBQSxRQUFDLE9BQUEsRUFBUyx3QkFBVjtPQUZNO0tBSlY7QUFBQSxJQVFBLFVBQUEsRUFBWSxPQUFBLENBQVEsWUFBUixDQVJaO0dBRkYsQ0FiQSxDQUFBOztBQUFBLEVBeUJBLFdBQUEsQ0FBWSxpQ0FBWixFQUVFO0FBQUEsSUFBQSxTQUFBLEVBQVcsRUFBWDtBQUFBLElBQ0EsU0FBQSxFQUFXLG1CQURYO0FBQUEsSUFHQSxNQUFBLEVBQVEsT0FBQSxDQUFRLFFBQVIsQ0FIUjtBQUFBLElBSUEsUUFBQSxFQUFVO01BQ047QUFBQSxRQUFBLE9BQUEsRUFBUyxpQkFBVDtPQURNO0tBSlY7QUFBQSxJQU9BLFVBQUEsRUFBWSxPQUFBLENBQVEsWUFBUixDQVBaO0dBRkYsQ0F6QkEsQ0FBQTs7QUFBQSxFQW9DQSxXQUFBLENBQVksb0NBQVosRUFFRTtBQUFBLElBQUEsU0FBQSxFQUFXLEVBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxzQkFEWDtBQUFBLElBR0EsTUFBQSxFQUFRLE9BQUEsQ0FBUSxRQUFSLENBSFI7QUFBQSxJQUlBLFFBQUEsRUFBVTtNQUNOO0FBQUEsUUFBQSxLQUFBLEVBQU8sY0FBUDtBQUFBLFFBQ0EsUUFBQSxFQUNFO0FBQUEsVUFBQSxDQUFBLEVBQ0U7QUFBQSxZQUFBLFFBQUEsRUFBVTtjQUNSO0FBQUEsZ0JBQUEsT0FBQSxFQUFTLGdCQUFUO2VBRFE7YUFBVjtXQURGO1NBRkY7T0FETSxFQVFOO0FBQUEsUUFBQSxLQUFBLEVBQU8sVUFBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBREw7QUFBQSxRQUVBLFFBQUEsRUFBVTtVQUNSO0FBQUEsWUFBQSxPQUFBLEVBQVMsZ0JBQVQ7V0FEUTtTQUZWO09BUk0sRUFjTjtBQUFBLFFBQUEsS0FBQSxFQUFPLEdBQVA7QUFBQSxRQUNBLEdBQUEsRUFBSyxHQURMO0FBQUEsUUFFQSxRQUFBLEVBQVU7VUFDUjtBQUFBLFlBQUEsT0FBQSxFQUFTLGdCQUFUO1dBRFE7U0FGVjtPQWRNO0tBSlY7QUFBQSxJQXdCQSxVQUFBLEVBQVksT0FBQSxDQUFRLFlBQVIsQ0F4Qlo7R0FGRixDQXBDQSxDQUFBOztBQUFBLEVBZ0VBLFdBQUEsQ0FBWSxnQ0FBWixFQUNFO0FBQUEsSUFBQSxJQUFBLEVBQU0sa0JBQU47QUFBQSxJQUNBLFNBQUEsRUFBVyxDQUFFLEtBQUYsQ0FEWDtBQUFBLElBRUEsU0FBQSxFQUFXLHdCQUZYO0FBQUEsSUFJQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFDLE9BQUEsQ0FBUSxPQUFSLENBQUQsQ0FBQSxDQUFrQixPQUFBLENBQVEsUUFBUixDQUFsQixDQUFULEVBQ047QUFBQSxNQUFBLGNBQUEsRUFBZ0IsV0FBaEI7QUFBQSxNQUNBLGNBQUEsRUFDRSxrRUFGRjtBQUFBLE1BR0EsWUFBQSxFQUFjLG1DQUhkO0tBRE0sQ0FKUjtBQUFBLElBU0EsUUFBQSxFQUFVLE9BQUEsQ0FBUSxjQUFSLENBVFY7QUFBQSxJQVVBLFVBQUEsRUFBWSxPQUFBLENBQVEsWUFBUixDQVZaO0dBREYsQ0FoRUEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/src/haskell.coffee
