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
      // Bind DOM events to function handlers
    	"click": "clicked"
    },

    initialize: function() {
      // Bind custom events to function hanlders
      // Note third parameter "this" --> Very important! (not sure exactly why...)
      app.on("chapters:jump", this.jumpToChapter, this);
      app.on("chapters:new", this.addChapter, this);
    },

  	clicked: function(e) {
      // Figure out which chapter number n was clicked based on the element ID
  		console.log("goTo "+e.target.id);
  		var n = parseFloat(e.target.id.substring(2), 10);
  		console.log("N "+n);
  		
      // Go to that chapter by triggering an event so that other modules can react
      app.trigger("chapters:jump", n);  // Implicitly calls this.jumpToChapter(n)
  	},
  	
    jumpToChapter: function(chapterNum) {
      // Just handle updating this view's chapter buttons
      // The transcript view should update itself as a response to this event
  	  this.$el.children(".chapterButton").each(function(index) { 
        var buttonNum = parseFloat($(this).attr('id').substring(2));
        if(buttonNum > chapterNum) {
          // This chapter is in the future, so disable it
          $(this).addClass("future");
          $(this).removeClass("past");
          $(this).removeClass("current");

          console.log("Chapter " + buttonNum + " is in the future.");
        }
        else if(buttonNum == chapterNum) {
          // This chapter is the one that was just selected, so highlight it
          $(this).addClass("current");
          $(this).removeClass("past");
          $(this).removeClass("future");
          console.log("Chapter " + buttonNum + " is the current chapter!");
        }
        else {
          // This chapter is in the past
          $(this).removeClass("current");
          $(this).removeClass("future");
          $(this).addClass("past");
        }
      });

  		// pend get this to walk thru with timestamp
  		/*
      this.options.messages.each( function(msg) {
  			if (msg.get("node") >= chapterNum-1)
	  			msg.emit();
	  		else console.log(" "+msg.get("node"));
  		});
      */
    },

  	addChapter: function(elt) {
  		this.$el.append("<div class=chapterButton id=CH"+elt+">"+elt+"</div>");
  	}
  });

  return Navigation;

});
