define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Speaker = app.module();

  // Default model.
  Speaker.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			wordCount: 0,
  			longestSentenceLength: 0,
  			longestSentence: "",
  			curSentence: ""
  		}
  	},
  	
  	initialize: function(sid, sname) {
  		//console.log("INIT SPEAKER "+sname+" "+sid);
    	this.set({id:sid, name:sname});
      app.on("message:word", this.handleWord, this);
      app.on("message:sentenceEnd", this.handleSentenceEnd, this);
      app.on("message:stats", this.updateStats, this);
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    handleWord: function(args) {
	    if (args['speaker'] == this.get('id')) {
	    	// inc word count if not punc
   		 	if (!args['punctuationFlag']) this.set({wordCount: this.get("wordCount")+1});
   		 	// update curSentence
   		 	if (!args['sentenceStartFlag'] && !args['punctuationFlag'])
   		 		curSentence += ' ';
   		 		
   		 	curSentence += args['word'];
	    }
    },
    
    handleSentenceEnd: function(args) {
    	if (args['speaker'] == this.get('id')) {
    	
	    	//update longest sentence
	    	if (args['length'] > this.get("longestSentenceLength")) {
   		 		this.set({longestSentenceLength: args['length']});
   		 		this.set({longestSentence: curSentence});
   		 	}
   		 	// reset curSentence
   		 	this.set({curSentence: ""});
   		}
    },
    
    updateStats: function(args) {
	    
    }
  });

  // Default collection.
  Speaker.Collection = Backbone.Collection.extend({  
    model: Speaker.Model
  });

  // Return the module for AMD compliance.
  return Speaker;

});
