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
      
      var transcript = new Transcript.View();
    
      
      // load from static file
      if (this.qs.docName) {
      
	      app.socket.send(JSON.stringify({
	        event: "loadDoc",
	
	        data: {
	          docName: this.qs.docName,
	          delay: parseFloat(this.qs.delay, 100)
	        }
	      }));
	    }
	        
      // send msg to get past msgs in bulk
      else {
      
	      /*app.socket.send(JSON.stringify({
	        event: "loadHistory"
	      }));*/ //pend out for now
	    }
	    
	    
	    // testing playback (delay is how long to wait after start of connect to server)
	    if (this.qs.playback) {
	    	app.playback = true;
	    	setTimeout(function() {
	    		console.log("play "+app.messages.length);
	    		app.messages.each(function(msg) {
	    			msg.emit();
	    		});
	    	}, parseFloat(this.qs.playbackDelay, 100));
	    }


      // Create a global reference to a reusable View.
      app.views.detail = new UniqueWord.Views.Detail();

      app.useLayout("main").setViews({
        "#comparisons": new Comparison.Views.List({
          collection: comparisons
        })
      }).render().then(function() {	      
	      // init transcript
	      app.navigation.setElement("#navigation");
	      app.navigation.render();
	     	transcript.setElement("#transcript");
        app.views.detail.setElement($("#newWordMeta"));
        app.views.detail.render(); 

      });
      
      app.socket.on("word", function(word) {     
      	var n = transcript.addWord(word); // add to dom
        uniqueWords.addWord(word, n); 
        app.views.detail.activate(word, n);
        $('body').animate({ scrollTop: $('body').prop("scrollHeight") }, 0);
      });

      app.socket.on("sentenceEnd", function(word) {     
      	transcript.endSentence(); 
      });

      app.socket.on("close", function() {
        console.error("Closed");
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
