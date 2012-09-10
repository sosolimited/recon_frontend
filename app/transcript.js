define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app, nav) {

  // Create a new module.
  var Transcript = app.module();
  var curSpeaker = -1;
  var curNode = -1;
  var speakers = ["moderator", "obama", "romney"];
  var openSentence = null;
  var openParagraph = null;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
  
  	resetCurNode: function(n) {
	  	curNode = n;
  	},
  	
  	getCurNode: function() {
	  	return curNode;
  	},

    addWord: function(word) {
    
    	curNode++;
    
    	var s = "";
    	
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		app.navigation.addChapter(curNode);	

    		
    		if (openSentence) this.endSentence();
    		if (openParagraph) this.endParagraph();	    		
    		
    		this.$el.append("<div id=curParagraph class="+speakers[curSpeaker]+"><span class=speakerName>"+speakers[curSpeaker].toUpperCase()+"</span></div>");
    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph').append("<span id=curSentence></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	$('#curSentence').append("<span id="+curNode+">"+s+word["word"]+"</span>"); // add word
    	
    	return curNode;
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
