define([
  // Application.
  "core/app",

  // Modules.
  "modules/uniqueWord",
  "modules/speaker",
  "modules/comparison",
  "modules/message",
  "modules/transcript",
  "modules/navigation",
  "modules/overlay",
  "modules/markupManager",
  "modules/bigWords"
],

function(app, UniqueWord, Speaker, Comparison, Message, Transcript, Navigation, Overlay, MarkupManager, BigWords) {
  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      // Get access to arguments.
      ":args": "index"
    },

    index: function() {
	    
	    // Init msg collection
			var messageCollection = new Message.Collection();
			
		  // init transcript
		  var transcriptView = new Transcript.View( {messages: messageCollection} );
		  
		  // init markup manager
		  var markupManager = new MarkupManager.Model( {transcript: transcriptView} );
		
		  // init bigWords
		  var bigWords = new BigWords.View();
		  
		  // init navigation
		  var navigationView = new Navigation.View( {transcript: transcriptView, messages: messageCollection} );
		  
			var live = true;
			var startTime = new Date().getTime();
			
      // init speakers
    	var speakerCollection = new Speaker.Collection();

    	speakerCollection.add({ speakerId:0, tag:"moderator", name:"Moderator" });
    	speakerCollection.add({ speakerId:1, tag:"obama", name:"Barack Obama" });
    	speakerCollection.add({ speakerId:2, tag:"romney", name:"Mitt Romney" });
    
    	// init uniquewords collection
      var uniqueWordCollection = new UniqueWord.Collection();
      
      // init comparison collection
      var comparisonCollection = new Comparison.Collection();
      var comparisonView = new Comparison.Views.All({collection: comparisonCollection});

      comparisonCollection.add(new Comparison.CountModel({traitNames:["wc"], speakerNames:speakerCollection, title:"WORD COUNT", subtitle:"The number of total words spoken by each candidate", range:[0,10000.0]}));       
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["funct"], speakerNames:speakerCollection, title:"FUNCTION", subtitle:"TEST!!! The percentage of words spoken that are common. ie. 'I, this, think.'", range:[0,75.0]})); 
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["posemo"], speakerNames:speakerCollection, title:"POSITIVITY", subtitle:"The percentage of words spoken that are positive in some way. ie. 'winning, happy, improve.'", range:[0,5.0]})); 
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["negemo"], speakerNames:speakerCollection, title:"NEGATIVITY", subtitle:"The percentage of words spoken that are negative in some way. ie. 'failure, dead, waste.'", range:[0,3.75]}));     
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["anger"], speakerNames:speakerCollection, title:"ANGER", subtitle:"The percentage of words spoken that are angry in some way. ie. 'fight, destroy, annoy.'", range:[0,1.95]}));    
      comparisonCollection.add(new Comparison.SpectrumModel({traitNames:["honesty"], speakerNames:speakerCollection, title:"AUTHENTIC", subtitle:"DECEPTIVE", range:[0, 6.0]}));             
      //comparisonCollection.add(new Comparison.ListModel({traitNames:["list"], speakerNames:speakerCollection }));    
      
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
      //else {
	      /*app.socket.send(JSON.stringify({
	        event: "loadHistory"
	      }));*/ //pend out for now
	    //}
	    
	    
	    // testing playback (delay is how long to wait after start of connect to server)
	    if (this.qs.playback) {
	    	live = false;
	    	setTimeout(function() {
	    		console.log("play "+messageCollection.length);
	    		messageCollection.each(function(msg) {
	    			msg.emit();
	    		});
	    	}, parseFloat(this.qs.playbackDelay, 100));
	    }


      app.useLayout("main").setViews({
      }).render().then(function() {	
	      navigationView.setElement("#navigation").render();
	      comparisonView.setElement("#comparisons").render();
	     	transcriptView.setElement("#transcript > .wrapper"); // Need transcript to point to the actual scrolling DOM element or else scroll event handling is wack
	     	bigWords.setElement("#bigWords").render();
	     
        (function() {
          // Work with the wrappers, not the actual layers.  --> ???
          var transcript = $(".transcript > div");
          var speaker = $(".comparisons > div");

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

      // WEBSOCKET MESSAGE EVENTS
      // ----------------------------------------------------------------------
      app.socket.on("stats", function(msg) {    
      	app.trigger("message:stats", {msg:msg});
      });
      
      app.socket.on("word", function(msg) {    
      	app.trigger("message:word", {msg:msg,live:live});
      });

      app.socket.on("sentenceEnd", function(msg) {  
      	app.trigger("message:sentenceEnd", {msg:msg,live:live});   
      });

      app.socket.on("transcriptDone", function(msg) {   
      	app.trigger("message:transcriptDone", {msg:msg,live:live});
	    	live = false;
      	console.log("transcriptDone");
      });

      app.socket.on("close", function() {
        console.error("Closed");
      });
     
      // BODY/WINDOW EVENTS
      // ----------------------------------------------------------------------
	    	    
      //Throttle body scroll events and emit them as messages.
      $(window).scroll(_.throttle(function(ev) {
		     	app.trigger("body:scroll", document.body.scrollTop);
	     	}, 33));  // 33ms = Approx 30fps
    
    
      // Listen for keydown events.
      $('body').keydown(function(event){
      	console.log(event.which);
      	//g for toggling test grid
      	if(event.which == 71){
	      	if($('#testGrid').css("visibility") == "visible") $('#testGrid').css("visibility", "hidden");
	      	else $('#testGrid').css("visibility", "visible");
      	}
      	//o for toggling overlay visibility
      	else if(event.which == 79){
	      	//if($('#overlay').css("visibility") == "visible") $('#overlay').css("visibility", "hidden")
	      	//else $('#overlay').css("visibility", "visible")
	      	if($('#overlay').css("display") == "inline") $('#overlay').css("display", "none");
	      	else $('#overlay').css("display", "inline");
      	}
      	//t for toggling transcript
		else if(event.which == 84){	
					//app.trigger("keypress:test", {type:"overlay", kind:"trait"});

			if($('#transcript > .wrapper').css("visibility") == "visible") $('#transcript > .wrapper').css("visibility", "hidden");
	      	else $('#transcript > .wrapper').css("visibility", "visible");

				}
				//w for wordcount testing
				else if(event.which == 87){	
					app.trigger("keypress:test", {type:"overlay", kind:"wordCount"});
				}
				else if(event.which==73){	//Press i to insert a bunch of parallax test objects.
					app.trigger("keypress:test", {type:"testParallax"});
				}
				//z To nudge parallax test objects left
				else if(event.which==90){	
					$('#testZ6').css("left", (parseInt($('#testZ6').css("left")) - 1));
					//console.log("left = "+parseInt($('#testZ6').css("left")));
				}
				//x  To nudge parallax test objects right
				else if(event.which==88){	
					$('#testZ6').css("left", (parseInt($('#testZ6').css("left")) + 1));
					//console.log("left = "+parseInt($('#testZ6').css("left")));
				}
				
      });      
      
      // Automatically load up the first debate for now
      if(this.qs.debate)
        app.trigger("debate:change", this.qs.debate);
      else
        app.trigger("debate:change", 1);
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
