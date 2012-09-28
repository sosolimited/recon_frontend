define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

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
  			wordCountPeriod: 500, 	//1000, //EG low number for testing 
  			longestSentenceLength: 0,
  			longestSentence: "",
  			curSentence: "",
  			traits: [{name: "posemo", val: 0},
  							 {name: "negemo", val: 0}]
  		}
  	},
  	

  	initialize: function() {
  		//console.log("INIT SPEAKER " + this.attributes.id + " "+this.attributes.name);
    	this.set({tag:this.attributes.tag, name:this.attributes.name, speakerId:this.attributes.speakerId});    	
      app.on("message:word", this.handleWord, this);
      app.on("message:sentenceEnd", this.handleSentenceEnd, this);
      app.on("message:stats", this.updateStats, this);
      console.log("Speaker.Model.initialize: speakerId = " + this.get('speakerId'));
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    handleWord: function(args) {
    	//console.log("handleWord(), args.speaker= "+args['msg']['speaker']+" this.speakerId = "+this.get('speakerId'));
    	
    	// check its self and not moderator
	    if (args['msg']['speaker'] == this.get("speakerId") && this.get("speakerId") > 0) {	

	    	// inc word count if not punc
   		 	if (!args['msg']['punctuationFlag']) this.set({wordCount: this.get("wordCount")+1});
   		 	// update curSentence
   		 	if (!args['msg']['sentenceStartFlag'] && !args['msg']['punctuationFlag'])
   		 		this.curSentence += ' ';
   		 		
   		 	this.curSentence += args['msg']['word'];

   		 	// Emit frequent word event.
   		 	if (args['msg']['wordInstances'] >= this.get('frequentWordThreshold')) {
   		 	 	if ($.inArray('funct', args['msg']['cats']) == -1) {	//If it's not a function word (aka common word).
	   		 		app.trigger("markup:frequentWord", {type:"frequentWord", speaker:this.get("tag"), count: args['msg']['wordInstances'], word: args['msg']['word']});
	   		 	}
   		 	}
   		 	
   		 	// Emit 1000,2000,etc word count events.
   		 	if((this.get("wordCount")%this.get("wordCountPeriod"))==0 && this.get("wordCount")>0){
   		 		//console.log("handleWord just reached word "+this.get("wordCount"));
	   			app.trigger("markup:wordCount", {type:"wordCount", speaker:this.get("tag"), count: this.get("wordCount"), word: args['msg']['word']}); 		   		 	
   		 	}	
	    }
    },
    
    handleSentenceEnd: function(args) {
    
    	// check it's self and not moderator
    	if (args['msg']['speaker'] == this.get('speakerId') && this.get('speakerId') > 0) {
    	
	    	//update longest sentence
	    	if (args['msg']['length'] > this.get("longestSentenceLength")) {
   		 		this.set({longestSentenceLength: args['msg']['length']});
   		 		this.set({longestSentence: this.curSentence});
   		 	} //else console.log("no change "+args['msg']['length']+" "+this.get("longestSentenceLength"));
   		 	// reset curSentence
   		 	this.curSentence = "";
   		}
    },
    
    updateStats: function(args) {
    	if (this.get('speakerId') > 0) {
	    	//console.log("updateStats "+this.get('speakerId'));
		    var newTraits = [];
	  	
	  		for (var i=0; i<this.get("traits").length; i++){ 
	  			var msgTrait = args['msg'][this.get("traits")[i]['name']];
	
		  		if (msgTrait) {// if found, update vals
		  			newTraits.push({name:this.get("traits")[i]['name'], val:msgTrait[this.get('speakerId')-1]});
		  			//console.log("id "+this.get("speakerId") + " "+this.get("traits")[i]['name']+" "+msgTrait[this.get('speakerId')-1]);
		  		} else // otherwise keep old vals
		  			newTraits.push(this.get("traits")[i]);
	  		}
		  	this.set({traits:newTraits});
		  }
    }
  });

  // Default collection.
  Speaker.Collection = Backbone.Collection.extend({  
    model: Speaker.Model,
    
    leads: [],
    sentenceLeadLead: -1,
    
    initialize: function() {
    	this.on("add", this.modelAdded, this);
    	app.on("message:stats", this.setCompareTraits, this);
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    changed: function() {
	    console.log("changed");
    },
    
    modelAdded: function(model) {
	    model.bind("change:longestSentenceLength", this.compareSentenceLengths, this);
    },
    
    compareSentenceLengths: function() {
	    // check longest sentence
	    var lead = (this.at(1).get("longestSentenceLength") > this.at(2).get("longestSentenceLength")) ? 1 : 2;
	    if (lead != this.sentenceLengthLead) {
		    app.trigger("markup:sentenceLength", {type:"sentenceLength", speaker:lead, length:this.at(lead).get("longestSentenceLength"), sentence:this.at(lead).get("longestSentence")});
		    this.sentenceLengthLead = lead;
	    }
    },
    
    setCompareTraits: function() {
    	var collection = this;
	  	setTimeout(function() {collection.compareTraits();}, 1000); // wait a second for speakers to update first
    },
    
    compareTraits: function() {
    	var newLeads = [];
    
    	for (var i=0; i<this.at(1).get("traits").length; i++) {
    		
		    var newLead = (this.at(1).get("traits")[i]['val'] > this.at(2).get("traits")[i]['val']) ? 1 : 2;
		    
		    newLeads.push(newLead);
		    
 		    if (newLead != this.leads[i]) {
		    //	console.log("newLead "+newLead+" "+this.at(1).get("traits")[i]['name']);
		    	app.trigger("markup:traitLead", {type:"traitLead", speaker:newLead, trait:this.at(1).get("traits")[i]['name']});
		    }
		    //else console.log("oldLead "+this.leads[i]+" "+this.at(1).get("traits")[i]['name']);
		    
		   // console.log("traits "+this.at(1).previous("traits")[i]['val']+" "+this.at(2).previous("traits")[i]['val']+" "+this.at(1).get("traits")[i]['val']+" "+this.at(2).get("traits")[i]['val']);
	    }
	    
	    this.leads = newLeads;
    }
  });

  // Return the module for AMD compliance.
  return Speaker;

});
