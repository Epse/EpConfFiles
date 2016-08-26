(function() {
  describe('validate', function() {
    var validate;
    validate = require('../lib/validate');
    describe('::linter', function() {
      it('throws error if grammarScopes is not an array', function() {
        return expect(function() {
          return validate.linter({
            lint: function() {}
          });
        }).toThrow('grammarScopes is not an Array. Got: undefined');
      });
      it('throws if lint is missing', function() {
        return expect(function() {
          return validate.linter({
            grammarScopes: []
          });
        }).toThrow();
      });
      return it('throws if lint is not a function', function() {
        return expect(function() {
          return validate.linter({
            grammarScopes: [],
            lint: true
          });
        }).toThrow();
      });
    });
    return describe('::messages', function() {
      it('throws if messages is not an array', function() {
        expect(function() {
          return validate.messages();
        }).toThrow('Expected messages to be array, provided: undefined');
        return expect(function() {
          return validate.messages(true);
        }).toThrow('Expected messages to be array, provided: boolean');
      });
      it('throws if type field is not present', function() {
        return expect(function() {
          return validate.messages([{}], {
            name: ''
          });
        }).toThrow();
      });
      it('throws if type field is invalid', function() {
        return expect(function() {
          return validate.messages([
            {
              type: 1
            }
          ], {
            name: ''
          });
        }).toThrow();
      });
      it("throws if there's no html/text field on message", function() {
        return expect(function() {
          return validate.messages([
            {
              type: 'Error'
            }
          ], {
            name: ''
          });
        }).toThrow();
      });
      it('throws if html/text is invalid', function() {
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: 1
            }
          ], {
            name: ''
          });
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: 1
            }
          ], {
            name: ''
          });
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: false
            }
          ], {
            name: ''
          });
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: false
            }
          ], {
            name: ''
          });
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: []
            }
          ], {
            name: ''
          });
        }).toThrow();
        return expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: []
            }
          ], {
            name: ''
          });
        }).toThrow();
      });
      it('throws if trace is invalid', function() {
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: 'a',
              trace: 1
            }
          ], {
            name: ''
          });
        }).toThrow();
        return validate.messages([
          {
            type: 'Error',
            html: 'a',
            trace: false
          }
        ], {
          name: ''
        });
      });
      return it('throws if class is invalid', function() {
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: 'Well',
              "class": 1
            }
          ], {
            name: ''
          });
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: 'Well',
              "class": []
            }
          ], {
            name: ''
          });
        }).toThrow();
        return validate.messages([
          {
            type: 'Error',
            text: 'Well',
            "class": 'error'
          }
        ], {
          name: ''
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy92YWxpZGF0ZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBQVgsQ0FBQTtBQUFBLElBQ0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtlQUNsRCxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxNQUFULENBQWdCO0FBQUEsWUFBQyxJQUFBLEVBQU0sU0FBQSxHQUFBLENBQVA7V0FBaEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUywrQ0FGVCxFQURrRDtNQUFBLENBQXBELENBQUEsQ0FBQTtBQUFBLE1BSUEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtlQUM5QixNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxNQUFULENBQWdCO0FBQUEsWUFBQyxhQUFBLEVBQWUsRUFBaEI7V0FBaEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQUQ4QjtNQUFBLENBQWhDLENBSkEsQ0FBQTthQVFBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7ZUFDckMsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsTUFBVCxDQUFnQjtBQUFBLFlBQUMsYUFBQSxFQUFlLEVBQWhCO0FBQUEsWUFBb0IsSUFBQSxFQUFNLElBQTFCO1dBQWhCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsRUFEcUM7TUFBQSxDQUF2QyxFQVRtQjtJQUFBLENBQXJCLENBREEsQ0FBQTtXQWVBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixNQUFBLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsUUFBQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQUEsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUyxvREFGVCxDQUFBLENBQUE7ZUFHQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQWxCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBRVMsa0RBRlQsRUFKdUM7TUFBQSxDQUF6QyxDQUFBLENBQUE7QUFBQSxNQU9BLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7ZUFDeEMsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixDQUFDLEVBQUQsQ0FBbEIsRUFBd0I7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQXhCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsRUFEd0M7TUFBQSxDQUExQyxDQVBBLENBQUE7QUFBQSxNQVdBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7ZUFDcEMsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sQ0FBUDthQUFEO1dBQWxCLEVBQStCO0FBQUEsWUFBQyxJQUFBLEVBQU0sRUFBUDtXQUEvQixFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLEVBRG9DO01BQUEsQ0FBdEMsQ0FYQSxDQUFBO0FBQUEsTUFlQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQSxHQUFBO2VBQ3BELE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0I7WUFBQztBQUFBLGNBQUMsSUFBQSxFQUFNLE9BQVA7YUFBRDtXQUFsQixFQUFxQztBQUFBLFlBQUMsSUFBQSxFQUFNLEVBQVA7V0FBckMsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQURvRDtNQUFBLENBQXRELENBZkEsQ0FBQTtBQUFBLE1BbUJBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsUUFBQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLENBQXRCO2FBQUQ7V0FBbEIsRUFBOEM7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQTlDLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLENBQXRCO2FBQUQ7V0FBbEIsRUFBOEM7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQTlDLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FIQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLEtBQXRCO2FBQUQ7V0FBbEIsRUFBa0Q7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQWxELEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FOQSxDQUFBO0FBQUEsUUFTQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLEtBQXRCO2FBQUQ7V0FBbEIsRUFBa0Q7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQWxELEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FUQSxDQUFBO0FBQUEsUUFZQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLEVBQXRCO2FBQUQ7V0FBbEIsRUFBK0M7QUFBQSxZQUFDLElBQUEsRUFBTSxFQUFQO1dBQS9DLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FaQSxDQUFBO2VBZUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxFQUF0QjthQUFEO1dBQWxCLEVBQStDO0FBQUEsWUFBQyxJQUFBLEVBQU0sRUFBUDtXQUEvQyxFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLEVBaEJtQztNQUFBLENBQXJDLENBbkJBLENBQUE7QUFBQSxNQXNDQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxHQUF0QjtBQUFBLGNBQTJCLEtBQUEsRUFBTyxDQUFsQzthQUFEO1dBQWxCLEVBQTBEO0FBQUEsWUFBQyxJQUFBLEVBQU0sRUFBUDtXQUExRCxFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLENBQUEsQ0FBQTtlQUdBLFFBQVEsQ0FBQyxRQUFULENBQWtCO1VBQUM7QUFBQSxZQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsWUFBZ0IsSUFBQSxFQUFNLEdBQXRCO0FBQUEsWUFBMkIsS0FBQSxFQUFPLEtBQWxDO1dBQUQ7U0FBbEIsRUFBOEQ7QUFBQSxVQUFDLElBQUEsRUFBTSxFQUFQO1NBQTlELEVBSitCO01BQUEsQ0FBakMsQ0F0Q0EsQ0FBQTthQTJDQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxNQUF0QjtBQUFBLGNBQThCLE9BQUEsRUFBTyxDQUFyQzthQUFEO1dBQWxCLEVBQTZEO0FBQUEsWUFBQyxJQUFBLEVBQU0sRUFBUDtXQUE3RCxFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxNQUF0QjtBQUFBLGNBQThCLE9BQUEsRUFBTyxFQUFyQzthQUFEO1dBQWxCLEVBQThEO0FBQUEsWUFBQyxJQUFBLEVBQU0sRUFBUDtXQUE5RCxFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLENBSEEsQ0FBQTtlQU1BLFFBQVEsQ0FBQyxRQUFULENBQWtCO1VBQUM7QUFBQSxZQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsWUFBZ0IsSUFBQSxFQUFNLE1BQXRCO0FBQUEsWUFBOEIsT0FBQSxFQUFPLE9BQXJDO1dBQUQ7U0FBbEIsRUFBbUU7QUFBQSxVQUFDLElBQUEsRUFBTSxFQUFQO1NBQW5FLEVBUCtCO01BQUEsQ0FBakMsRUE1Q3FCO0lBQUEsQ0FBdkIsRUFoQm1CO0VBQUEsQ0FBckIsQ0FBQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/epse/.atom/packages/linter/spec/validate-spec.coffee
