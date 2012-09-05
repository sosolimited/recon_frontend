define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Transcript = app.module();

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
    el: '#transcript',
    
    addWord: function(word) {
    	var n = 3;
    	
    	var s = "";
    	
    	if (!word["punctuationFlag"]) s +=" "; // add leading space
    	
    	if (word["sentenceStartFlag"]) s += "<span>"; // add sentence span wrapper
    	
    	s += "<span id="+n+">"+word["word"]+"</span>"; // add word
    	
    	this.$el.append(s);
    	
    	return n;
    },
    
    endSentence: function() {
    	this.$el.append("</span>");
    }
  });

  // Return the module for AMD compliance.
  return Transcript;

});
