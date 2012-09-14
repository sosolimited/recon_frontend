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
  var scrollLive = true;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
    
    initialize : function() {
      app.on("words:new", this.addWord, this);
    },

    addWord: function(word) {
    
    	var s = "";

      var col=1;
    	
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", word);

   			if(curSpeaker==0) col = 2;	//obama
    		else if(curSpeaker==2) col = 3;	//romney
    		
    		if (openSentence) this.endSentence();
    		if (openParagraph) this.endParagraph();	    		
    		
    		this.$el.children().first().append("<div id=curParagraph class='push-" + col + " span-3 " +
          speakers[curSpeaker] + "'><h1 class='franklinMedIt'>" +
          speakers[curSpeaker] + "</h1><p class='metaBook gray80'></p></div><div class=clear></div>");
          
    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph p').append("<span id=curSentence></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	$('#curSentence').append("<span id="+word["id"]+">"+s+word["word"]+"</span>"); // add word

      // Scroll the view if needed
      if(scrollLive) {
        this.$el.children(".wrapper").stop().animate({ scrollTop: this.$el.children(".wrapper").prop("scrollHeight") }, 10);
        app.trigger("time:scrollTo", word["timeDiff"]); 
      }
    
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
