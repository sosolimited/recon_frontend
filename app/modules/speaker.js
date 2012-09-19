define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

	var sentenceLengthLead = -1;
	var speakerCount = 0;	//EG

  // Create a new module.
  var Speaker = app.module();

  // Default model.
  Speaker.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			speakerId: 0,
  			wordCount: 0,
  			//wordCountThreshholds: [ 500, 1000, 1500 ],
  			//curWordCountThreshhold: 0,
  			frequentWordThreshold: 5,
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
      this.speakerId = speakerCount++;
      //console.log("Speaker.Model.initialize: speakerId = " + this.get('speakerId'));
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    handleWord: function(args) {
    	//console.log("handleWord(), args.speaker= "+args['msg']['speaker']+" this.speakerId = "+this.speakerId);
    	
    	// check its self and not moderator
	    //if (args['msg']['speaker'] == this.get('id') && this.get('id') > 0) {
	    if (args['msg']['speaker'] == this.speakerId) {	// && this.speakerId > 0) {	//testing
	    	// inc word count if not punc
   		 	if (!args['msg']['punctuationFlag']) this.set({wordCount: this.get("wordCount")+1});
   		 	// update curSentence
   		 	if (!args['msg']['sentenceStartFlag'] && !args['msg']['punctuationFlag'])
   		 		this.curSentence += ' ';
   		 		
   		 	this.curSentence += args['msg']['word'];
   		 	
   		 	//console.log("instances = "+args['msg']['wordInstances']+" frequentWordThreshold = "+this.get('frequentWordThreshold'));
   		 	// Emit frequent word event.
   		 	//if (wordCount > wordCountThreshholds[curWordCountThreshhold] ) {
   		 	if (args['msg']['wordInstances'] >= this.get('frequentWordThreshold')) {
	   		 	//app.trigger("markup:frequentWord", {type:"frequentWord", speaker:this.get("id"), count: wordCountThreshholds[curWordCountThreshhold], word: args['word']});
	   		 	app.trigger("markup:frequentWord", {type:"frequentWord", speaker:this.get("id"), count: args['msg']['wordInstances'], word: args['msg']['word']});
	   		 	//console.log(args['msg']['wordInstances'] + " >= " + this.frequentWordThreshold);
	   		 	//curWordCountThreshhold = min(curWordCountThreshhold++, wordCountThreshholds.length);
   		 	}
   		 	
   		 	// Emit 1000,2000,etc word count events.
   		 	if((this.wordCount%1000)==0){
	   			app.trigger("markup:wordCount", {type:"wordCount", speaker:this.get("id"), count: this.wordCount, word: args['msg']['word']}); 		   		 	
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
