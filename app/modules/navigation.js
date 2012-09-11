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

    serialize: function() {
      return { word: this.model };
    },
    
    events: {
    	"click": "goToChapter"
    },
    
      
  	goToChapter: function(e) {
  		console.log("goTo "+e.target.id);
  		
  		var n = parseFloat(e.target.id.substring(2), 10);
  		console.log("N "+n);
  		
  		// clear out following text in prep for playback
  		this.options.transcript.curSpeaker = "";
  		this.options.transcript.endSentence();
  		this.options.transcript.endParagraph();
  		$('#'+n).parent().parent().nextAll().andSelf().remove();
  		
  		// reset curnode
  		this.options.transcript.resetCurNode(n-1);
  		
  		//playback from that point
  		
  		// pend get this to walk thru with timestamp
  		this.options.messages.each( function(msg) {
  			if (msg.get("node") >= n-1)
	  			msg.emit();
	  		else console.log(" "+msg.get("node"));
  		});

  	},
  	
  	addChapter: function(elt) {
  		this.$el.append("<div class=chapterButton id=CH"+elt+">"+elt+"</div>");
  	}
  });

  return Navigation;

});
