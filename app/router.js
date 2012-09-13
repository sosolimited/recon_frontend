define([
  // Application.
  "core/app",

  // Modules.
  "modules/uniqueWord",
  "modules/speaker",
  "modules/comparison",
  "modules/message",
  "modules/transcript",
  "modules/navigation"
],

function(app, UniqueWord, Speaker, Comparison, Message, Transcript, Navigation) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      // Get access to arguments.
      ":args": "index"
    },

    index: function() {
	    
	    	// Init msg collection
			var messages = new Message.Collection();
			
		  // init transcript
		  var transcript = new Transcript.View();
		
		  // init navigation
		  var navigation = new Navigation.View( { transcript: transcript, messages: messages } );
		  
			
			var live = true;
			var startTime = new Date().getTime();
			
    	    
      // init speakers
    	var speakers = new Speaker.Collection();
    	speakers.add("moderator", "Moderator");
    	speakers.add("obama", "Barack Obama");
    	speakers.add("romney", "Mitt Romney");
    
    	// init uniquewords collection
      var uniqueWords = new UniqueWord.Collection();
      
      // init comparison collection
      var comparisons = new Comparison.Collection();
    
      
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
	    	live = false;
	    	setTimeout(function() {
	    		console.log("play "+messages.length);
	    		messages.each(function(msg) {
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
	      navigation.setElement("#navigation");
	      navigation.render();
	     	transcript.setElement("#transcript");
        app.views.detail.setElement($("#newWordMeta"));
        app.views.detail.render(); 

        (function() {
          // Work with the wrappers, not the actual layers.
          var transcript = $(".transcript > div");
          var speaker = $(".speaker > div");

          transcript.on("click", "h1", function(ev) {
            var dist = transcript.offsetHeight;
            transcript.scrollTop = dist;

            transcript.toggleClass("fade");
            speaker.parent().toggleClass("active");
            speaker.toggleClass("active");
          });

          speaker.on("click", ".close", function(ev) {
            transcript.toggleClass("fade");
            speaker.parent().toggleClass("active");
            speaker.toggleClass("active");
          });
        })();
      });

      
      //Populate comparisons collection with models
      comparisons.add(new Comparison.Model({names: ['HONESTY', 'MASCULINITY', 'DEPRESSION']}));

      
      app.socket.on("word", function(msg) {    
	    	if (live) messages.addMessage(msg); 
      	transcript.addWord(msg);
        if (live) uniqueWords.addWord(msg); 
        app.views.detail.activate(msg);
        $('body').animate({ scrollTop: $('body').prop("scrollHeight") }, 0);
      });

      app.socket.on("sentenceEnd", function(msg) {     
	    	if (live) messages.addMessage(msg); 
      	transcript.endSentence(); 
      });

      app.socket.on("transcriptDone", function(msg) {   
	    	if (live) messages.addMessage(msg); 
	    	live = false;
      	console.log("transcriptDone");
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
