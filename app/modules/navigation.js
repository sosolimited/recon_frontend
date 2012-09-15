define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {
  var startDates = [new Date(2012, 9, 5, 21, 0, 0, 0), new Date(2012, 9, 16, 21, 0,0,0), new Date(2012, 9, 23, 21, 0,0,0)]; 
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
      app.on("message:transcriptDone", this.addChapter, this);
    },
    
    serialize: function() {
      return { word: this.model };
    },
    
    events: {
    	"click": "playbackChapter"
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    setDebateNumber : function(n) {
      n -= 1;
      debateNumber = n;
      var dateString = startDates[n].toLocaleDateString();
      $("#navDate").text(dateString.substring(dateString.indexOf(",")+2));

      var debateNumString = (n == 0 ? "1st" : (n == 1 ? "2nd" : "3rd")) + " Debate";
      $("#navDebateNum").text(debateNumString);
    },
      
  	playbackChapter: function(e) {
  		
  		this.options.messages.stopPlayback();
  	
    	//app.trigger("playback:set", true);
    	
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
