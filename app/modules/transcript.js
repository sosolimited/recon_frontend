define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Transcript = app.module();
  var curSpeaker = -1;
  var speakers = ["moderator", "obama", "romney"];
  var openSentence = null;
  var openParagraph = null;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({

    addWord: function(word) {
    
    	var s = "";
      var offset = 1;
    	
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", word["id"]);
    		
    		if (openSentence) this.endSentence();
    		if (openParagraph) this.endParagraph();	    		
    		
    		this.$el.children().first().append("<div id=curParagraph class='push_" + (offset+curSpeaker) + " grid_3 " +
          speakers[curSpeaker] + "'><h1>" +
          speakers[curSpeaker].toUpperCase()+"</h1><p></p></div><div class=clear></div>");

    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph p').append("<span id=curSentence></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	$('#curSentence').append("<span id="+word["id"]+">"+s+word["word"]+"</span>"); // add word
    
    },
    
    endSentence: function() {
    	$('#curSentence').removeAttr('id');
    	openSentence = false;
    },
    
    endParagraph: function() {
    	$('#curParagraph').removeAttr('id');
    	openParagarph = false;
    }
  });

  // Return the module for AMD compliance.
  return Transcript;

});
