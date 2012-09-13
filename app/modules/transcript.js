define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Transcript = app.module();
  var curSpeaker = -1;
  var curNode = -1;
  var curSentence = -1;
  var speakers = ["moderator", "obama", "romney"];
  var openSentence = null;
  var openParagraph = null;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
    initialize: function() {
      // Bind custom events to event handlers
      app.on("chapters:jump", this.jumpToChapter, this);
      app.on("words:new", this.addWord, this);
    },

  	resetCurNode: function(n) {
	  	curNode = n;
  	},
  	
  	getCurNode: function() {
	  	return curNode;
  	},

    addWord: function(word) {
    
    	curNode++;
    
    	var s = "";
    	var newCh = false;  // New chapter flag
    	
    	if (word["speaker"] != curSpeaker) {
        // The speaker has changed!
    		curSpeaker = word["speaker"];
    		newCh = true;

        app.trigger("chapters:new", word["node"]);
        console.log("New chapter: " + word["node"]);

    		
    		if (openSentence)
          this.endSentence();
    		if (openParagraph)
          this.endParagraph();	    		
    		
    		this.$el.append("<div id=curParagraph class="+speakers[curSpeaker]+"><span class=speakerName>"+speakers[curSpeaker].toUpperCase()+"</span></div>");
    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph').append("<span id='curSentence'></span>"); // add sentence span wrapper
    		openSentence = true;
        app.trigger("sentences:new", curNode);
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	$('#curSentence').append("<span id=word"+word["node"]+">"+s+word["word"]+"</span>"); // add word
    },
    
    endSentence: function() {
    	$('#curSentence').removeAttr('id');
    	openSentence = false;
      // Fire an event in case anyone else cares
      app.trigger("sentences:end", curNode);
    },
    
    endParagraph: function() {
    	$('#curParagraph').removeAttr('id');
    	openParagraph = false;

      // Fire an event in case anyone else cares
      app.trigger("paragraphs:end", curNode);
    },

    jumpToChapter: function(chapterNum) {
      this.curSpeaker = -1;
      this.curSentence = -1;
      this.endSentence();
      this.endParagraph();

      // Clear all the paragraphs after this chapter began
      $('#word'+chapterNum).parent().parent().nextAll().andSelf().remove();

      // Reset the current node for playback
      this.resetCurNode(chapterNum-1);

      // NOTE: All node re-emitting is handled by the messages collection
    }
  });

  // Return the module for AMD compliance.
  return Transcript;

});
