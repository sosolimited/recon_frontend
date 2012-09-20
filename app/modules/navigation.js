define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {
  var startDates = [new Date(2012, 9, 5, 21, 0, 0, 0), new Date(2012, 9, 16, 21, 0,0,0), new Date(2012, 9, 23, 21, 0,0,0)]; 
  var debateNumber = 0;

  var chapters = [];

  var showTime = true;
  

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
      app.on("debate:change", this.setDebateNumber, this);
      app.on("message:word", this.updateProgress, this);
      app.on("message:transcriptDone", this.addChapter, this);
      app.on("transcript:scrollTo", this.updateTime, this);
      app.on("transcript:scrollDetach", this.liveScrollOff, this);
      app.on("transcript:scrollAttach", this.liveScrollOn, this);
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
      debateNumber = n;
      var dateString = startDates[n].toLocaleDateString();
      $("#navDate").text(dateString.substring(dateString.indexOf(",")+2));

      var debateNumString = (n == 0 ? "1st" : (n == 1 ? "2nd" : "3rd")) + " Debate";
      $("#navDebateNum").text(debateNumString);
    },

    handleClick : function(e) {
      if(e.target.id.substring(0,2) == 'CH')
        playbackChapter(e);

      else if(e.target.id == 'goLive') {
        app.trigger("navigation:goLive");
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
      var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
      $("<div></div>", {
        id : "CH" + id,
        class : "navChapterBar",
        style : "background-color: " + colors[chapters.length % colors.length] +
                "; width: 0;"
      }).appendTo("#navTimeline");
      console.log("New Chapter :" + id + " at " + percent + "%");
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
        $("#navTime").text(nowString);
      }
      else {
        $("#navTime").html("<span id='goLive' class='tapable'>Go Live!</span>");
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
    }

  });

  return Navigation;

});
