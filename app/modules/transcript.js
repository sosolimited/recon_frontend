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
  var speakers = ["moderator", "obama", "romney"];
  var openSentence = null;
  var openParagraph = null;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
    el: '#transcript',
    
    addWord: function(word) {
    
    
    	var s = "";
    	
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		if (openSentence) this.endSentence();
    		if (openParagraph) this.endParagraph();
    		
    		this.$el.append("<div id=curParagraph class="+speakers[curSpeaker]+"><span class=speakerName>"+speakers[curSpeaker]+"</span></div>");
    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph').append("<span id=curSentence></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	curNode++;
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
