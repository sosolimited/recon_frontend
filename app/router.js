define([
  // Application.
  "core/app",

  // Modules.
  "modules/word"
],

function(app, Word) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      // Get access to arguments.
      ":args": "index"
    },

    index: function() {
      var words = new Word.Collection();

      // Send up options.
      app.socket.send(JSON.stringify({
        event: "loadDoc",

        data: {
          // Pass up the document name if it's set.
          docName: this.qs.docName,

          // TODO What is this?
          delay: parseFloat(this.qs.delay, 10)
        }
      }));

      app.socket.on("word", function(word) {
        words.add(word); 
      });

      app.socket.on("close", function() {
        console.error("Closed");
      });

      app.useLayout("main").setViews({
        "#ccFeed": new Word.Views.List({
          collection: words
        })
      }).render();
    },

    initialize: function() {
      // Cache the querystring lookup.
      var querystring = location.search.slice(1);

      // For every key/value pair, break into [key] = value onto the `qs`
      // router property.
      Object.defineProperty(this, "qs", {
        // Whenever the property is accessed process the latest value.
        get: function() {
          return querystring.split("&").reduce(function(memo, keyVal) {
            // Break the keyVal string into actual key/value pairs.
            var parts = keyVal.split("=");
            // Assign them into the memoized object, which will be `this.qs`.
            memo[parts[0]] = parts[1];

            return memo;
          }, {});
        }
      });
    }
  });

  return Router;

});
