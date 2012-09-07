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
  		
  		var n = e.target.id.substring(2);
  		
  		// clear out following text in prep for playback
  		$('#'+n).parent().parent().nextAll().andSelf().remove();
  		
  		//playback from that point
  		
  		// pend get this to walk thru with timestamp
  		app.messages.each( function(msg) {
  			msg.emit();
  		});

  	},
  	
  	addChapter: function(elt) {
  		this.$el.append("<div class=chapterButton id=CH"+elt+">"+elt+"</div>");
  	}
  });

  return Navigation;

});
