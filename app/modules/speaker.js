define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

	var sentenceLengthLead = -1;

  // Create a new module.
  var Speaker = app.module();

  // Default model.
  Speaker.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			wordCount: 0,
  			wordCountThreshholds: [ 500, 1000, 1500 ],
  			curWordCountThreshhold: 0,
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
    	// check its self and not moderator
	    if (args['speaker'] == this.get('id') && this.get('id') > 0) {
	    	// inc word count if not punc
   		 	if (!args['punctuationFlag']) this.set({wordCount: this.get("wordCount")+1});
   		 	// update curSentence
   		 	if (!args['sentenceStartFlag'] && !args['punctuationFlag'])
   		 		curSentence += ' ';
   		 		
   		 	curSentence += args['word'];
   		 	
   		 	if (wordCount > wordCountThreshholds[curWordCountThreshhold] ) {
	   		 	app.trigger("markup:wordCount", {type:"wordCount", speaker:this.get("id"), count: wordCountThreshholds[curWordCountThreshhold]});
	   		 	curWordCountThreshhold = min(curWordCountThreshhold++, wordCountThreshholds.length);
   		 	}
	    }
    },
    
    handleSentenceEnd: function(args) {
    	// check it's self and not moderator
    	if (args['speaker'] == this.get('id') && this.get('id') > 0) {
    	
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
    model: Speaker.Model,
    
    initialize: function() {
	    this.bind("change:longestSentence", this.compareSentenceLengths);
    },
    
    compareSentenceLengths: function() {
	  	
	    // check longest sentence
	    var lead = (this.at(1).get("longestSentenceLength") > this.at(2).get("longestSentenceLength")) ? 1 : 2;
	    if (lead != sentenceLengthLead) {
		    app.trigger("markup:sentenceLength", {type:"sentenceLength", speaker:lead, length:this.at(lead).get("longestSentenceLength"), sentence:this.at(lead).get("longestSentence")});
		    sentenceLengthLead = lead;
	    }
    }
  });

  // Return the module for AMD compliance.
  return Speaker;

});
