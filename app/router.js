define([
  // Application.
  "core/app",

  // Modules.
  "modules/uniqueWord",
  "modules/speaker",
  "modules/comparison",
  "modules/transcript"
],

function(app, UniqueWord, Speaker, Comparison, Transcript) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      // Get access to arguments.
      ":args": "index"
    },

    index: function() {
    
    	// init speakers
    	var speakers = new Speaker.Collection();
    	speakers.add("moderator", "Moderator");
    	speakers.add("obama", "Barack Obama");
    	speakers.add("romney", "Mitt Romney");
    
    	// init uniquewords collection
      var uniqueWords = new UniqueWord.Collection();
      
      // init comparison collection
      var comparisons = new Comparison.Collection();

      // Send up options.
      
      if (this.qs.docName) {
      
	      app.socket.send(JSON.stringify({
	        event: "loadDoc",
	
	        data: {
	          // Pass up the document name if it's set.
	          docName: this.qs.docName,
	
	          // TODO What is this?
	          delay: parseFloat(this.qs.delay, 10)
	        }
	      }));
	    }

      app.socket.on("word", function(word) {      
        uniqueWords.addWord(word); 
      });

      app.socket.on("close", function() {
        console.error("Closed");
      });

      // Create a global reference to a reusable View.
      //app.views.detail = new Word.Views.Detail();
      

      app.useLayout("main").setViews({
      	"#transcript" : new Transcript.View(),
        "#comparisons": new Comparison.Views.List({
          collection: comparisons
        })
      }).render().then(function() {
        //app.views.detail.setElement($("#status")[0]);
        //app.views.detail.render();
      });
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
