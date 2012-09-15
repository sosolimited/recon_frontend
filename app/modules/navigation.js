define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Navigation = app.module();

  // Default model.
  Navigation.Model = Backbone.Model.extend({

  });


  Navigation.View = Backbone.View.extend({


		//template: "navigation",
	
    initialize: function() {
      // Bind custom events
      app.on("playback:addChapter", this.addChapter, this);
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
    
      
  	goToChapter: function(e) {
    	//app.trigger("playback:set", true);
    	
  		console.log("goTo "+e.target.id);
  		
  		var n = parseFloat(e.target.id.substring(2), 10);

  		// clear out nav in prep for playback
  		$('#'+e.target.id).nextAll().andSelf().remove();

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
  	
  	addChapter: function(elt) {
  		this.$el.append("<div class=chapterButton id=CH"+elt+">"+elt+"</div>");
  	}
  });

  return Navigation;

});
