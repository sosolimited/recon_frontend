define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {
  var startDates = [new Date(2012, 9, 3, 21, 0, 0, 0), new Date(2012, 9, 16, 21, 0,0,0), new Date(2012, 9, 22, 21, 0,0,0)]; 
  var debateNumber = 0;

  var chapters = [];

  var showTime = true;
  var instructionTimeout;
  

  // Create a new module.
  var Navigation = app.module();

  // Default model.
  Navigation.Model = Backbone.Model.extend({

  });


  Navigation.View = Backbone.View.extend({

		template: "navigation",
    afterRender : function() {
      // Do "initialization"-type things that need to happen after the template is loaded
      this.setDebateNumber(debateNumber+1);
      this.reset();
    },
	
    initialize: function() {
      // Bind custom events
      app.on("playback:addChapter", this.addChapter, this);
      app.on("debate:change", this.setDebateNumber, this);
      app.on("message:word", this.updateProgress, this);
      app.on("message:transcriptDone", this.addChapter, this);
      app.on("transcript:scrollTo", this.updateTime, this);
      app.on("transcript:scrollDetach", this.liveScrollOff, this);
      app.on("transcript:scrollAttach", this.liveScrollOn, this);
      
      this.landing = null;
    },
    
    serialize: function() {
      return { word: this.model };
    },
    
    events: {
    	"click": "handleClick"
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    setDebateNumber : function(n) {
      n -= 1;
      // Set the debate number globally.
      app.debateNumber = debateNumber = n;
      var dateString = startDates[n].toLocaleDateString();
      $("#navDate").text(dateString.substring(dateString.indexOf(",")+2));

      var debateNumString = (n == 0 ? "1st" : (n == 1 ? "2nd" : "3rd")) + " Debate";
      $("#navDebateNum").text(debateNumString);
    },

    handleClick : function(e) {
      if(e.target.id.substring(0,2) == 'CH') {
        //playbackChapter(e); //PEND out for now
      } else if(e.target.id == 'goLive') {
        app.trigger("navigation:goLive", 600);
      } else if(e.target.id == 'reconTitle'){
				if (app.mode == "comparison") this.exitComparison(e);
	      this.landing.enter();
      } else if (e.target.id == 'navTranscriptButton') {
	      this.exitComparison(e);
      } else if (e.target.id == 'navComparisonButton') {
	      this.enterComparison(e, "count");
      } else if (e.target.id == 'navPlaybackButton') {
				var elem = $("#navPlaybackButton");
	      var states = ["1x", "2x", "10x"];
	      // Find the offset in the array.
	      var offset = (states.indexOf($.trim(elem.text())) + 1) % states.length;
	      elem.text(states[offset]);
	      app.modifier = window.parseInt(states[offset], 10);
      }    
    },
      
  	playbackChapter: function(e) {
  		
  		console.log("goTo "+e.target.id);
  	  
      // Figure out chapter index #
  		var n = parseFloat(e.target.id.substring(2), 10);

  		this.options.transcript.resetToNode(n);
  		this.options.messages.playbackMessages(n);

  	},
  	
  	
  	addChapter: function(args) {
  		var msg = args['msg'];
  	
      // Check if this chapter already exists and return if true
      for(var i=0; i<chapters.length; i++)
        if(chapters[i]["id"] == msg["id"]) return;

      chapters.push(msg);
      var id = msg["id"];
      var percent = this.timeDiffToPercent(msg["timeDiff"]);

      // Extend previous chapter (if any) to this point
      if(chapters.length > 1) {
        var previousid = chapters[chapters.length-2]["id"];
        var previousPercent = this.timeDiffToPercent(chapters[chapters.length-2]["timeDiff"]);
        
        var previous = $("#CH" + previousid);
        previous.width((percent - previousPercent) * previous.parent().width());
        previous.css("left", previousPercent * previous.parent().width());
      }


      // Create a new div of 0 width at this point
      // TODO: Put real colors in here
      var colors = ["grayBlue", "bgGrayBlue"];      
      $("<div></div>", {
        id : "CH" + id,
        class : "navChapterBar",
        style : "background-color: " + colors[chapters.length % colors.length] +
                "; width: 0;"
      }).appendTo("#navTimeline");
      //console.log("New Chapter :" + id + " at " + percent + "%");	
  	},

    liveScrollOn : function() {
      showTime = true;
    },
    liveScrollOff : function() {
      showTime = false;
    },

    updateTime : function(newTime) {
      // Update the CURRENTLY BEING VIEWED TIME
      if(showTime) {
        var now = new Date(startDates[debateNumber].getTime() + newTime);
        var nowString = (now.getHours() > 12 ? now.getHours() - 12 : now.getHours()) + ":" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) + (now.getHours() > 12 ? " PM" : " AM"); 
        $("#navGoLiveButton").text(nowString);
      }
      else {
        $("#navGoLiveButton").html("<span id='goLive' class='tapable'>GO LIVE!</span>");
      }

      var percent = this.timeDiffToPercent(newTime);
      $("#navProgressMarker").css("left", percent * $("#navTimeline").width());
    },

    updateProgress : function(msg) {
      // Update the PROGRESS OF THE DEBATE, increasing with every word
      var percent = this.timeDiffToPercent(msg["msg"]["timeDiff"]);
      $("#navProgressBar").width(percent * $("#navProgressBar").parent().width());
    },

    timeDiffToPercent : function(diff) {
      var scaleFactor = 1;  // TODO: Set this to 1 for longer transcripts/production
      return diff / 1000 / 60 / 60 / 1.5 * scaleFactor;
    },
    
    enter: function(first) {
	    $('#navigation').css("visibility", "visible");
	    $('#navLeft').css("webkitTransform", "translateX(5px) translateY(-5px) rotate(90deg)");
	    $('#navLeftButtons').css("webkitTransform", "translateX(0px) translateY(0px) rotate(90deg)");
	    $('#navRight').css("webkitTransform", "translateX(0px) translateY(-5px) rotate(-90deg)");
	    if (first) {
	    	console.log("first");
	    	$('#navInstructions').css("webkitTransform", "translateX(0%)");
		    instructionTimeout = setTimeout(function(){ $('#navInstructions').css("webkitTransform", "translateX(100%)"); }, 4000);
		  } 
    },
    
    exit: function() {
	    //$('#navigation').css("visibility", "hidden");	    
	    $('#navLeft').css("webkitTransform", "translateX(-55px) translateY(-5px) rotate(90deg)");
	    $('#navRight').css("webkitTransform", "translateX(60px) translateY(-5px) rotate(-90deg)");
	    $('#navLeftButtons').css("webkitTransform", "translateX(-55px) translateY(0px) rotate(90deg)");
	    $('#navInstructions').css("webkitTransform", "translateX(110%)");
	    clearTimeout(instructionTimeout);
    },
    
    // Reset puts everything where it's supposed to be before entering.
    reset: function() { 
	    $('#navigation').css("visibility", "hidden");
	    $('#navLeft').css("webkitTransform", "translateX(-55px) translateY(-5px) rotate(90deg)");
	    $('#navLeftButtons').css("webkitTransform", "translateX(-55px) translateY(0px) rotate(90deg)");
	    $('#navRight').css("webkitTransform", "translateX(60px) translateY(-5px) rotate(-90deg)");
	    $('#navInstructions').css("webkitTransform", "translateX(-120%)");
	    clearTimeout(instructionTimeout);
    },
    
    // Pass pointer to landing view so that title click can call enter on landing.
    setLanding: function(arg) {
	    this.landing = arg;
    },
    
    enterComparison: function(event, tag) {
	    event.stopPropagation();
    	app.mode = "comparison";  
    	
      var dist = $("#transcript > .wrapper").offsetHeight;
      $("#transcript > .wrapper").scrollTop = dist;
      $("#transcript > .wrapper").addClass("fade");
      $("#comparisons > .wrapper").addClass("active");
      
      // switch buttons
      $('#navTranscriptButton').css('display', 'inline-block'); 
      $('#navComparisonButton').css('display', 'none');

      // EG Testing this for performance
      $('#comparisons').css("visibility", "visible");	     	   // This is in case comparison.exit() was called.
      $('#comparisons > .wrapper').css("display", "block");
      $('#transcript').css("visibility", "hidden");       
      
      // Disable scrolling on the document body and save the current
      // offset (to be restored when closing the comparison view)
      $(document.body).addClass("no-scroll");	
      $("#transcript > .wrapper").data("lastTop", $(document.body).scrollTop());	

      var elt = $('#comparisons').find('.compareContainer.'+tag).parent();
      $("#comparisons > .wrapper").stop().animate({ scrollTop: elt.position().top}, 1.0);
      
      // Switch skrollr scroll element to comparisons container.
			//app.skrollr.setSkrollElement($('#comparisons > .wrapper').get(0));
	    
    },
    
    exitComparison: function(event) {
      
    	event.stopPropagation();
    	app.mode = "transcript";
      $("#transcript > .wrapper").removeClass("fade");
      $("#comparisons > .wrapper").removeClass("active");
        
      // switch buttons
      $('#navTranscriptButton').css('display', 'none'); 
      $('#navComparisonButton').css('display', 'inline-block');
      
      // EG Testing this for performance
      $('#comparisons > .wrapper').css("display", "none");
      $('#transcript').css("visibility", "visible");
      
      // Re-enable scrolling on the document body and restore the
      // previous offset
      $(document.body).removeClass("no-scroll");	
      $(document.body).scrollTop($("#transcript > .wrapper").data("lastTop"));	
      
      // Switch skrollr scroll element back to body.
			//app.skrollr.resetSkrollElement();
    }

   

  });

  return Navigation;

});
