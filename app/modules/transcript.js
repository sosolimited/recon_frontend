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
  
      
  	initialize: function() {
      app.on("message:word", this.addWord, this);
      app.on("message:sentenceEnd", this.endSentence, this);
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },

    addWord: function(args) {
    
	    var word = args['msg'];
    
    	var s = "";

      var col=1;
    	
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", word["id"]);

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
    
    },
    
    endSentence: function(args) {
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
