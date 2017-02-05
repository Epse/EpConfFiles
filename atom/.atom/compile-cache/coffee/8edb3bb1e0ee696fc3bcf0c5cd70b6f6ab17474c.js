(function() {
  describe('GADT', function() {
    var check, grammar, zip;
    grammar = null;
    zip = function() {
      var arr, i, j, length, lengthArray, ref, results;
      lengthArray = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = arguments.length; j < len; j++) {
          arr = arguments[j];
          results.push(arr.length);
        }
        return results;
      }).apply(this, arguments);
      length = Math.max.apply(Math, lengthArray);
      results = [];
      for (i = j = 0, ref = length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push((function() {
          var k, len, results1;
          results1 = [];
          for (k = 0, len = arguments.length; k < len; k++) {
            arr = arguments[k];
            results1.push(arr[i]);
          }
          return results1;
        }).apply(this, arguments));
      }
      return results;
    };
    check = function(line, exp) {
      var i, j, len, ref, results, t;
      ref = zip(line, exp);
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        t = ref[i];
        if (t[0] == null) {
          t[0] = {};
        }
        if (t[1] == null) {
          t[1] = {};
        }
        t[0].index = i;
        t[1].index = i;
        results.push(expect(t[0]).toEqual(t[1]));
      }
      return results;
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-haskell");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.haskell");
      });
    });
    return it('understands GADT syntax', function() {
      var exp, j, l, len, lines, ref, results, string;
      string = "data Term a where\n  Lit :: Int -> Term Int";
      lines = grammar.tokenizeLines(string);
      exp = [
        [
          {
            value: 'data',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.other.data.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'a',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell', 'variable.other.generic-type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'where',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'keyword.other.haskell']
          }
        ], [
          {
            value: '  ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: 'Lit',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'entity.name.tag.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell']
          }, {
            value: '::',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'keyword.other.double-colon.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: '->',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'keyword.other.arrow.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Term',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell']
          }, {
            value: ' ',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell']
          }, {
            value: 'Int',
            scopes: ['source.haskell', 'meta.declaration.type.data.haskell', 'meta.ctor.type-declaration.haskell', 'meta.type-signature.haskell', 'entity.name.type.haskell', 'support.class.prelude.haskell']
          }
        ]
      ];
      ref = zip(lines, exp);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        l = ref[j];
        results.push(check(l[0], l[1]));
      }
      return results;
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3BlYy9oYXNrZWxsLWdhZHQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBO0FBQ2YsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUVWLEdBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLFdBQUE7O0FBQWU7YUFBQSwyQ0FBQTs7dUJBQUEsR0FBRyxDQUFDO0FBQUo7OztNQUNmLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxhQUFTLFdBQVQ7QUFDVDtXQUFTLCtFQUFUOzs7QUFDRTtlQUFBLDJDQUFBOzswQkFBQSxHQUFJLENBQUEsQ0FBQTtBQUFKOzs7QUFERjs7SUFISTtJQU1OLEtBQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ04sVUFBQTtBQUFBO0FBQUE7V0FBQSw2Q0FBQTs7O1VBQ0UsQ0FBRSxDQUFBLENBQUEsSUFBTTs7O1VBQ1IsQ0FBRSxDQUFBLENBQUEsSUFBTTs7UUFDUixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTCxHQUFXO1FBQ1gsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUwsR0FBVztxQkFDWCxNQUFBLENBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBVCxDQUFZLENBQUMsT0FBYixDQUFxQixDQUFFLENBQUEsQ0FBQSxDQUF2QjtBQUxGOztJQURNO0lBUVIsVUFBQSxDQUFXLFNBQUE7TUFDVCxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCO01BRGMsQ0FBaEI7YUFHQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGdCQUFsQztNQURQLENBQUw7SUFKUyxDQUFY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VDtXQTdGRixFQXNHRTtZQUNFLEtBQUEsRUFBTSxLQURSO1lBRUUsTUFBQSxFQUFPLENBQ0wsZ0JBREssRUFFTCxvQ0FGSyxFQUdMLG9DQUhLLEVBSUwsNkJBSkssRUFLTCwwQkFMSyxFQU1MLCtCQU5LLENBRlQ7V0F0R0Y7U0EzREU7O0FBNktOO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsS0FBQSxDQUFNLENBQUUsQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFFLENBQUEsQ0FBQSxDQUFkO0FBREY7O0lBbkw0QixDQUE5QjtFQXhCZSxDQUFqQjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUgJ0dBRFQnLCAtPlxuICBncmFtbWFyID0gbnVsbFxuXG4gIHppcCA9ICgpIC0+XG4gICAgbGVuZ3RoQXJyYXkgPSAoYXJyLmxlbmd0aCBmb3IgYXJyIGluIGFyZ3VtZW50cylcbiAgICBsZW5ndGggPSBNYXRoLm1heChsZW5ndGhBcnJheS4uLilcbiAgICBmb3IgaSBpbiBbMC4uLmxlbmd0aF1cbiAgICAgIGFycltpXSBmb3IgYXJyIGluIGFyZ3VtZW50c1xuXG4gIGNoZWNrID0gKGxpbmUsIGV4cCkgLT5cbiAgICBmb3IgdCxpIGluIHppcChsaW5lLGV4cClcbiAgICAgIHRbMF0gPz0ge31cbiAgICAgIHRbMV0gPz0ge31cbiAgICAgIHRbMF0uaW5kZXg9aVxuICAgICAgdFsxXS5pbmRleD1pXG4gICAgICBleHBlY3QodFswXSkudG9FcXVhbCh0WzFdKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibGFuZ3VhZ2UtaGFza2VsbFwiKVxuXG4gICAgcnVucyAtPlxuICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShcInNvdXJjZS5oYXNrZWxsXCIpXG5cbiAgaXQgJ3VuZGVyc3RhbmRzIEdBRFQgc3ludGF4JywgLT5cbiAgICBzdHJpbmcgPSBcIlwiXCJcbiAgICAgICAgZGF0YSBUZXJtIGEgd2hlcmVcbiAgICAgICAgICBMaXQgOjogSW50IC0+IFRlcm0gSW50XG4gICAgICAgIFwiXCJcIlxuICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzKHN0cmluZylcbiAgICBleHAgPSBbW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOidkYXRhJyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ2tleXdvcmQub3RoZXIuZGF0YS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6JyAnLFxuICAgICAgICAgICAgc2NvcGVzOltcbiAgICAgICAgICAgICAgJ3NvdXJjZS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTonVGVybScsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6JyAnLFxuICAgICAgICAgICAgc2NvcGVzOltcbiAgICAgICAgICAgICAgJ3NvdXJjZS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6J2EnLFxuICAgICAgICAgICAgc2NvcGVzOltcbiAgICAgICAgICAgICAgJ3NvdXJjZS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ3ZhcmlhYmxlLm90aGVyLmdlbmVyaWMtdHlwZS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6JyAnLFxuICAgICAgICAgICAgc2NvcGVzOltcbiAgICAgICAgICAgICAgJ3NvdXJjZS5oYXNrZWxsJ1xuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCdcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOid3aGVyZScsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6JyAgJyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTonTGl0JyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTonICcsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6Jzo6JyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOicgJyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6J0ludCcsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTonICcsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOictPicsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdrZXl3b3JkLm90aGVyLmFycm93Lmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTonICcsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOidUZXJtJyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ2VudGl0eS5uYW1lLnR5cGUuaGFza2VsbCdcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOicgJyxcbiAgICAgICAgICAgIHNjb3BlczpbXG4gICAgICAgICAgICAgICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6J0ludCcsXG4gICAgICAgICAgICBzY29wZXM6W1xuICAgICAgICAgICAgICAnc291cmNlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJyxcbiAgICAgICAgICAgICAgJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsXG4gICAgICAgICAgICAgICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnLFxuICAgICAgICAgICAgICAnc3VwcG9ydC5jbGFzcy5wcmVsdWRlLmhhc2tlbGwnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXVxuICAgIGZvciBsIGluIHppcChsaW5lcywgZXhwKVxuICAgICAgY2hlY2sgbFswXSwgbFsxXVxuIl19
