(function() {
  var AnsiToHtml, OutputView, ansiToHtml, text;

  AnsiToHtml = require('ansi-to-html');

  ansiToHtml = new AnsiToHtml();

  OutputView = require('../../lib/views/output-view');

  text = "foo bar baz";

  describe("OutputView", function() {
    beforeEach(function() {
      return this.view = new OutputView;
    });
    it("displays a default message", function() {
      return expect(this.view.find('.output').text()).toContain('Nothing new to show');
    });
    it("displays the new message when ::finish is called", function() {
      this.view.setContent(text);
      this.view.finish();
      return expect(this.view.find('.output').text()).toBe(text);
    });
    it("resets its html property when ::reset is called", function() {
      this.view.setContent(text);
      this.view.reset();
      return expect(this.view.find('.output').text()).toContain('Nothing new to show');
    });
    return describe("::setContent", function() {
      it("accepts terminal color encoded text and transforms it into html", function() {
        this.view.setContent("foo[m * [32mmaster[m");
        this.view.finish();
        return expect(this.view.find('.output').html()).toBe('foo * <span style="color:#0A0">master</span>');
      });
      return it("returns the instance of the view to allow method chaining", function() {
        this.view.setContent(text).finish();
        return expect(this.view.find('.output').text()).toBe(text);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvdmlld3Mvb3V0cHV0LXZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUFBOztFQUNqQixVQUFBLEdBQWEsT0FBQSxDQUFRLDZCQUFSOztFQUViLElBQUEsR0FBTzs7RUFFUCxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBO0lBQ3JCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJO0lBREgsQ0FBWDtJQUdBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO2FBQy9CLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxTQUFYLENBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUFQLENBQW9DLENBQUMsU0FBckMsQ0FBK0MscUJBQS9DO0lBRCtCLENBQWpDO0lBR0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUE7TUFDckQsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLElBQWpCO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7YUFDQSxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsU0FBWCxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBUCxDQUFvQyxDQUFDLElBQXJDLENBQTBDLElBQTFDO0lBSHFELENBQXZEO0lBS0EsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7TUFDcEQsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLElBQWpCO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUE7YUFDQSxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsU0FBWCxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBUCxDQUFvQyxDQUFDLFNBQXJDLENBQStDLHFCQUEvQztJQUhvRCxDQUF0RDtXQUtBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7TUFDdkIsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUE7UUFDcEUsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLHlCQUFqQjtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBQVAsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyw4Q0FBMUM7TUFIb0UsQ0FBdEU7YUFLQSxFQUFBLENBQUcsMkRBQUgsRUFBZ0UsU0FBQTtRQUM5RCxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQU4sQ0FBaUIsSUFBakIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBQVAsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxJQUExQztNQUY4RCxDQUFoRTtJQU51QixDQUF6QjtFQWpCcUIsQ0FBdkI7QUFOQSIsInNvdXJjZXNDb250ZW50IjpbIkFuc2lUb0h0bWwgPSByZXF1aXJlICdhbnNpLXRvLWh0bWwnXG5hbnNpVG9IdG1sID0gbmV3IEFuc2lUb0h0bWwoKVxuT3V0cHV0VmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9vdXRwdXQtdmlldydcblxudGV4dCA9IFwiZm9vIGJhciBiYXpcIlxuXG5kZXNjcmliZSBcIk91dHB1dFZpZXdcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEB2aWV3ID0gbmV3IE91dHB1dFZpZXdcblxuICBpdCBcImRpc3BsYXlzIGEgZGVmYXVsdCBtZXNzYWdlXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3LmZpbmQoJy5vdXRwdXQnKS50ZXh0KCkpLnRvQ29udGFpbiAnTm90aGluZyBuZXcgdG8gc2hvdydcblxuICBpdCBcImRpc3BsYXlzIHRoZSBuZXcgbWVzc2FnZSB3aGVuIDo6ZmluaXNoIGlzIGNhbGxlZFwiLCAtPlxuICAgIEB2aWV3LnNldENvbnRlbnQgdGV4dFxuICAgIEB2aWV3LmZpbmlzaCgpXG4gICAgZXhwZWN0KEB2aWV3LmZpbmQoJy5vdXRwdXQnKS50ZXh0KCkpLnRvQmUgdGV4dFxuXG4gIGl0IFwicmVzZXRzIGl0cyBodG1sIHByb3BlcnR5IHdoZW4gOjpyZXNldCBpcyBjYWxsZWRcIiwgLT5cbiAgICBAdmlldy5zZXRDb250ZW50IHRleHRcbiAgICBAdmlldy5yZXNldCgpXG4gICAgZXhwZWN0KEB2aWV3LmZpbmQoJy5vdXRwdXQnKS50ZXh0KCkpLnRvQ29udGFpbiAnTm90aGluZyBuZXcgdG8gc2hvdydcblxuICBkZXNjcmliZSBcIjo6c2V0Q29udGVudFwiLCAtPlxuICAgIGl0IFwiYWNjZXB0cyB0ZXJtaW5hbCBjb2xvciBlbmNvZGVkIHRleHQgYW5kIHRyYW5zZm9ybXMgaXQgaW50byBodG1sXCIsIC0+XG4gICAgICBAdmlldy5zZXRDb250ZW50IFwiZm9vXHUwMDFiW20gKiBcdTAwMWJbMzJtbWFzdGVyXHUwMDFiW21cIlxuICAgICAgQHZpZXcuZmluaXNoKClcbiAgICAgIGV4cGVjdChAdmlldy5maW5kKCcub3V0cHV0JykuaHRtbCgpKS50b0JlICdmb28gKiA8c3BhbiBzdHlsZT1cImNvbG9yOiMwQTBcIj5tYXN0ZXI8L3NwYW4+J1xuXG4gICAgaXQgXCJyZXR1cm5zIHRoZSBpbnN0YW5jZSBvZiB0aGUgdmlldyB0byBhbGxvdyBtZXRob2QgY2hhaW5pbmdcIiwgLT5cbiAgICAgIEB2aWV3LnNldENvbnRlbnQodGV4dCkuZmluaXNoKClcbiAgICAgIGV4cGVjdChAdmlldy5maW5kKCcub3V0cHV0JykudGV4dCgpKS50b0JlIHRleHRcbiJdfQ==
