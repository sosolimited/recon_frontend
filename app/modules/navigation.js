define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {
  var startDates = [new Date(2012, 10, 5, 21, 0, 0, 0), new Date(2012, 10, 16, 21, 0,0,0), new Date(2012, 10, 23, 21, 0,0,0)]; 
  var monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var debateNumber = 0;

  var chapters = [];

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
    },
	
    initialize: function() {
      // Bind custom events
      app.on("playback:addChapter", this.addChapter, this);
      app.on("transcript:scrollTo", this.updateTime, this);
      app.on("debate:change", this.setDebateNumber, this);
      app.on("message:word", this.updateProgress, this);
    },
    
    serialize: function() {
      return { word: this.model };
    },
    
    events: {
    	"click": "goToChapter"
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    setDebateNumber : function(n) {
      n -= 1;
      debateNumber = n;
      var dateString = monthNames[startDates[n].getMonth()] + " " + startDates[n].getDate() + ", " + startDates[n].getFullYear();
      $("#navDate").text(dateString);

      var debateNumString = (n == 0 ? "1st" : (n == 1 ? "2nd" : "3rd")) + " Debate";
      $("#navDebateNum").text(debateNumString);
    },
      
  	goToChapter: function(e) {
    	//app.trigger("playback:set", true);
    	
  		console.log("goTo "+e.target.id);
  	  
      // Figure out chapter index #
  		var n = parseFloat(e.target.id.substring(2), 10);

      // TODO: Have this trigger a message and handle playback accordingly

  		// clear out following text in prep for playback
  		this.options.transcript.curSpeaker = "";
  		this.options.transcript.endSentence();
  		this.options.transcript.endParagraph();
  		$('#'+n).parent().parent().parent().nextAll().andSelf().remove();
  		
  		//playback from that point
  		var startMsg = this.options.messages.get(n);

  		this.options.messages.each( function(msg) {
  			var diff = msg.get("timeDiff") - startMsg.get("timeDiff");
  			if (diff >= 0) {
	  			setTimeout(function() { msg.emit(); }, diff);
	  			//console.log("settimeout "+msg.get("word")+" "+diff);
	  		}
  		});

  	},
  	
  	addChapter: function(msg) {
      // Check if this chapter already exists and return if true
      for(i=0; i<chapters.length; i++)
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
      var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
      $("<div></div>", {
        id : "CH" + id,
        class : "navChapterBar",
        style : "background-color: " + colors[chapters.length % colors.length] +
                "; width: 0;"
      }).appendTo("#navTimeline");
      console.log("New Chapter :" + id + " at " + percent + "%");
  	},

    updateTime : function(newTime) {
      // Update the CURRENTLY BEING VIEWED TIME
      var now = new Date(startDates[debateNumber].getTime() + newTime);
      var nowString = (now.getHours() > 12 ? now.getHours() - 12 : now.getHours()) + ":" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) + (now.getHours() > 12 ? " PM" : " AM"); 

      var percent = this.timeDiffToPercent(newTime);
      $("#navTime").text(nowString);
      $("#navProgressMarker").stop().animate({"left": percent * $("#navTimeline").width()}, 100);
      
    },

    updateProgress : function(msg) {
      // Update the PROGRESS OF THE DEBATE, increasing with every word
      var percent = this.timeDiffToPercent(msg["msg"]["timeDiff"]);
      $("#navProgressBar").width(percent * $("#navProgressBar").parent().width());
    },

    timeDiffToPercent : function(diff) {
      var scaleFactor = 10;  // TODO: Set this to 1 for longer transcripts/production
      return diff / 1000 / 60 / 60 / 1.5 * scaleFactor;
    }

  });

  return Navigation;

});
