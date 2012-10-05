define([
  // Application.
  "app",

  // Modules.
  "modules/uniqueWord",
  "modules/speaker",
  "modules/comparison",
  "modules/message",
  "modules/transcript",
  "modules/navigation",
  "modules/overlay",
  "modules/markupManager",
  "modules/bigWords",
  "modules/landing",
  "modules/ref"
],

function(app, UniqueWord, Speaker, Comparison, Message, Transcript, Navigation, Overlay, MarkupManager, BigWords, Landing, Ref) {
  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      // Get access to arguments.
      ":args": "index"
    },

    index: function() {
	    
	    // Init msg collection.
			var messageCollection = new Message.Collection();
			
			// Init speakers.
    	var speakerCollection = new Speaker.Collection();

    	speakerCollection.add({ id:0, speakerId:0, tag:"moderator", name:"Moderator" });
    	speakerCollection.add({ id:1, speakerId:1, tag:"obama", name:"Barack Obama" });
    	speakerCollection.add({ id:2, speakerId:2, tag:"romney", name:"Mitt Romney" });
    	
    	// Init uniquewords collection.
      //var uniqueWordCollection = new UniqueWord.Collection();
      var uniqueWords = new UniqueWord.Model.AllWords();
      
		  // Init transcript.
		  var transcriptView = new Transcript.View( {messages: messageCollection, speakers: speakerCollection, uniqueWords: uniqueWords} );
		  
		  // Init markup manager.
		  var markupManager = new MarkupManager.Model( {transcript: transcriptView} );
		
		  // Init bigWords.
		  var bigWordsView = new BigWords.View();
		  
		  // Init navigation.
		  var navigationView = new Navigation.View( {transcript: transcriptView, messages: messageCollection} );
		  
		  // Init landing page.
			var landingView = new Landing.View( {model: new Landing.Model(), navigation: navigationView, transcript: transcriptView, overlay: markupManager, bigWords: bigWordsView} );
			// Pass landing view to navigation for menu control.
			navigationView.setLanding(landingView);
		  
			var live = true;
			var startTime = new Date().getTime();
    	    	      
      // Init comparison collection.
      var comparisonCollection = new Comparison.Collection();
      var comparisonView = new Comparison.Views.All({collection: comparisonCollection});

      comparisonCollection.add(new Comparison.CountModel({traitNames:["wc"], speakerNames:speakerCollection, title:"WORD COUNT", subtitle:"The number of total words spoken by each candidate", range:[0,10000.0], color1:"Salmon"})); 
      
      comparisonCollection.add(new Comparison.ListModel({traitNames:["list"], speakerNames:speakerCollection, title:"TOP 20 WORDS", subtitle:"The top twenty words of each candidate (excluding 'the', 'I', 'if', etc.)", uniqueWords:uniqueWords, color1:"Lime"}));  
          
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["posemo"], speakerNames:speakerCollection, title:"POSITIVITY", subtitle:"The percentage of words spoken that are positive in some way. ie. 'winning, happy, improve.'", range:[0,5.0], color1:"Sky"}));
       
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["negemo"], speakerNames:speakerCollection, title:"NEGATIVITY", subtitle:"The percentage of words spoken that are negative in some way. ie. 'failure, dead, waste.'", range:[0,3.75], color1:"GrayBlue"})); 
          
      comparisonCollection.add(new Comparison.EmotionModel({traitNames:["anger"], speakerNames:speakerCollection, title:"ANGER", subtitle:"The percentage of words spoken that are angry in some way. ie. 'fight, destroy, annoy.'", range:[0,1.95], color1:"Angry"})); 
         
        
      comparisonCollection.add(new Comparison.SpectrumModel({traitNames:["formality"], speakerNames:speakerCollection, title:"FORMAL", subtitle:"CASUAL", range:[3, 25.0], color1:Ref.formal, color2:Ref.casual, gradient:"gradientFormality"})); 
      
      comparisonCollection.add(new Comparison.SpectrumModel({traitNames:["depression"], speakerNames:speakerCollection, title:"DEPRESSED", subtitle:"CHEERFUL", range:[-1.0, 4.75], color1:Ref.depressed, color2:Ref.cheery, gradient:"gradientDisposition"}));  
      
      comparisonCollection.add(new Comparison.SpectrumModel({traitNames:["honesty"], speakerNames:speakerCollection, title:"AUTHENTIC", subtitle:"DECEPTIVE", range:[0, 6.0], color1:Ref.purple, color2:Ref.redOrange, gradient:"gradientHonesty"}));                   
      
      // Load from static file.
      if (this.qs.docName) {
      
	      app.socket.send(JSON.stringify({
	        event: "loadDoc",
	
	        data: {
	          docName: this.qs.docName,
	          delay: parseFloat(this.qs.delay, 100)
	        }
	      }));
	    }
	        
      // Send msg to get past msgs in bulk.
      //else {
	      /*app.socket.send(JSON.stringify({
	        event: "loadHistory"
	      }));*/ //pend out for now
	    //}
	    
	    
	    // Testing playback (delay is how long to wait after start of connect to server).
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
      }).render();

			// EG Hack to fix loading race condition. calling render().then(... wasn't working above.
			// I'm sure there's a less stupid way to do this.
      window.setTimeout(function() {	
      
	      landingView.setElement("#landing").render();
	      navigationView.setElement("#navigation").render();
	      comparisonView.setElement("#comparisons > .wrapper").render();
	     	transcriptView.setElement("#transcript > .wrapper"); // Need transcript to point to the actual scrolling DOM element or else scroll event handling is wack
	     	bigWordsView.setElement("#bigWords").render();
	     	
	     	// Init transcript view to hidden. 
	     	// Navigation and bigWords are getting reset in afterRender()
	     	transcriptView.reset();
	     
        (function() {
          // Work with the wrappers, not the actual layers.  --> ???
          var transcript = $("#transcript > .wrapper");
          var comparisons = $("#comparisons > .wrapper");
          
          var enterComp = function(event) {
	          
            var dist = transcript.offsetHeight;
            transcript.scrollTop = dist;

            transcript.toggleClass("fade");
            //comparisons.parent().toggleClass("active");
            comparisons.toggleClass("active");
            var elt = $('#comparisons').find('.compareContainer.'+event.data.tag).parent();
            $("#comparisons > .wrapper").stop().animate({ scrollTop: elt.position().top}, 1.0);
            console.log(elt.position().top);
          };

          transcript.on("click", "h1", { tag: "count" }, enterComp);
          transcript.on("click", ".sentimentClick", { tag: "POSITIVITY" } , enterComp);
          transcript.on("click", ".traitClick", { tag: "AUTHENTIC" } , enterComp);
          transcript.on("click", ".countClick", { tag: "list" } , enterComp);
          
          transcript.on("click", ".catMarkup", function(ev) {
          	var name;
          	if ($(this).hasClass("posemoMarkup")) {
	          	name = "posemo";
          	} else if ($(this).hasClass("negemoMarkup")) {
	          	name = "negemo";
          	} else if ($(this).hasClass("certainMarkup")) {
	          	name = "certain";
          	} else if ($(this).hasClass("tentatMarkup")) {
	          	name = "tentat";
          	}
          
          	console.log(name);
          	$('.'+name+'Markup').addClass('reverse');
          	setTimeout(function(){$('.'+name+'Markup').removeClass('reverse');}, 2000);
          	
          	var off = $(this).scrollTop() + $(this).parent().parent().parent().position().top + $(this).position().top;
          	
          	markupManager.fireCatOverlay(name, off, 2000);
          });
         
          comparisons.on("click", function(ev) {
            transcript.toggleClass("fade");
            comparisons.toggleClass("active");
          });
          
        })();
      }, 50);
     
			// EG Again, stupid hack to fix loading. This seems to work, though: basically, wait until the DOM elements have been set to fire up events. 
      window.setTimeout(function() {
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
      }, 100);
	     
      // BODY/WINDOW EVENTS
      // ----------------------------------------------------------------------
      
      //Throttle body scroll events and emit them as messages.
      var lastScrollY = 0;
      var ticking = false;
      $(window).scroll(_.throttle(function(ev) {
		     	//app.trigger("body:scroll", document.body.scrollTop);
		     	
		     	// Intead of emitting events, keep track of scroll position for requestAnimFrame below.
		     	lastScrollY = document.body.scrollTop;
		     	requestTick();
	     	}, 15));  // 33ms = Approx 30fps
	     	
	     	
	    // EG Trying this as alternative to emitting scroll events.
	    function requestTick() {
		  	if(!ticking){
			  	requestAnimFrame(update);
			  }
			  ticking = true;
			}	
	     
	    function update() {
		  	// Do everything that was previously handled on scroll events.
		    markupManager.handleScroll(lastScrollY);		     
		    bigWordsView.handleScroll(lastScrollY);
		    transcriptView.handleScroll(lastScrollY);
        ticking = false;
	    }
	     	
	     /*
	    (function animloop(){
      	requestAnimFrame(animloop);
      	//render();
      	markupManager.handleScroll(document.body.scrollTop);
      })();
	    */	    
    
      // Listen for keydown events.
      var keyboardEnabled = false;	
      
      if(keyboardEnabled){
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
					//p for inserting parallax test objects
					else if(event.which==80){	
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
					//q Test top words.
					else if(event.which==81){
						var sp = 1;
						var top20 = uniqueWords.getTop20Words(sp);
						for(var i=0; i<20; i++){
							console.log(i+" = "+top20[i]['word']+" > "+top20[i]['count']);
						}
					}
					
	      });      
      }
      
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
