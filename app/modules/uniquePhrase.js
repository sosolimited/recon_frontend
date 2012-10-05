define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var UniquePhrase = app.module();

  // One model per unique word (per speaker collection).
  UniquePhrase.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			count: 0,
  			cats: null
  		}
  	},
  	
  	initialize: function(msg, phrase, count, cats) {
  		this.set({id:msg['dbid'], phrase:phrase, cats:cats});
  		this.increment(count);
    },
    
    increment: function(count){
    	var inc = count ? count : 1;
    	this.set({count: this.get("count")+inc});
    }
  });

  // One collection per speaker.
  UniquePhrase.Collection = Backbone.Collection.extend({  
  
    model: UniquePhrase.Model,
        
  	initialize: function(length, numTop) {
  	
  		// Reusable holder for calculating top 20 words.
  		
  		this.phraseLength = length;
  		this.numTop = numTop;
  		
			
  		this.topPhrases = [];
  		for(var i=0; i<this.numTop; i++)
  			this.topPhrases.push({phrase:"", count:0});		
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    addPhrase: function(args) {
  	
			//console.log("add "+this.phraseLength+" "+this.numTop+" "+args['msg']['ngram'].join(" "));
			
    	if (args['live']) {
	    	var msg = args['msg'];
	    	// Only add word if it's NOT punctuation.
	    	
	    	if (msg['type'] == 'word') {
		    	if(msg['punctuationFlag'] == 0){
	    	
		    	//console.log("UniqueWord.Collection.addWord("+word['word']+")");
		    	
			    	if (this.phraseLength == 1) {
			    	
				    	var w = this.get(msg["dbid"]); //PEND Change 0s.
				    	if (w) w.increment();
				    	else this.add(msg, msg["word"], 1, msg["cats"]);
				    	
				    } else {
					    for (var i=0; i<msg['ngrams'].length; i++) {
						    var p = this.get(msg['ngrams'][i][0]);
						    if (msg['ngrams'][i][1] == this.phraseLength && p) {
							    p.increment();
							    //console.log("incremented "+p.get("phrase")+" speaker "+msg['speaker']+" for collection "+this.phraseLength);
						    }
					    }
					  }
					}
	    	} else if (msg['type'] == 'newNGram') {
	    	
	    		// add new ngram
	    		if (msg['ngram'].length == this.phraseLength) {
		    		this.add(msg, msg['ngram'].join(" "), parseInt(msg['instances'].length, 10));
		    		//console.log("added "+msg['ngram'].join(" ")+" speaker "+msg['speaker']+" for collection "+this.phraseLength);
		    	}
	    	}
	    	
	    }
    },
    
    getCollectionSize: function() {
	    return this.models.length;
    },
    
    comparator: function(phrase) { 
    	// Sort collection based on count.
    	// Negative makes it sort backwards.	
	    return (-1.0*phrase.get("count"));
	  },
	  
	  getTopPhrases: function() {
			// Weed out function words and return array of objects.
		  var i=0;
		  var index=0;
		  while((i<this.numTop) && (index<this.models.length)){
		  	// If it's NOT a function word.
				if (this.filterPhrase(this.at(index))){
					this.topPhrases[i]['phrase'] = this.at(index).get("phrase");
					this.topPhrases[i]['count'] = this.at(index).get("count");
					i++;
				}
				index++;	  	
			}	
			return this.topPhrases;
	  },
	  
	  // Returns 0 if ain't, word count if it is.
	  isTopPhrase: function(phrase, numPhrases) {
		  var i=0;
		  var index=0;
		  while((i<numPhrases) && (index<this.models.length)){
		  	// If it's NOT a function word.
				if (this.filterPhrase(this.at(index))){
					if(this.at(index).get("phrase")==phrase){
						return this.at(index).get("count");
					}else{						
						i++;
					}
				}
				index++;	  	
			}	
			return  0;
	  },
	  
	  filterPhrase: function(model){
	  	if (this.phraseLength === 1) { // if it's a 1 gram
		  	if (($.inArray('funct', model.get("cats")) == -1) && (model.get("phrase") != " ")){
			  	return true;	
		  	}else{
			  	return false;
		  	}
	  	} else {
	  		return true;
	  	}
	  }
  });

  // Container for the three speaker collections. 
	UniquePhrase.Model.AllPhrases = Backbone.Model.extend({
		
		defaults: function(){
		},
		
		initialize: function(length, numPhrases) {
	
			this.set({moderator:new UniquePhrase.Collection(length, numPhrases),
			obama:new UniquePhrase.Collection(length, numPhrases),
			romney:new UniquePhrase.Collection(length, numPhrases), length:length});
			
			app.on("message:word", this.addPhrase, this);
			if (length != 1) app.on("message:newNGram", this.addPhrase, this);	
		},
		
		addPhrase: function(args) {
			// Add word to appropriate speaker collection.
			if(args['msg']['speaker']==0) this.get("moderator").addPhrase(args);
			else if(args['msg']['speaker']==1) this.get("obama").addPhrase(args);
			else if(args['msg']['speaker']==2) this.get("romney").addPhrase(args);	
		},
		
		getTopPhrase: function(speakerId, index) {
			if(speakerId==0){
			 	return this.get("moderator").at(index);
			}else if (speakerId==1){
				return this.get("obama").at(index);
			}else if(speakerId==2){
			 	return this.get("romney").at(index);	
			}
		},
		
		getTopPhrases: function(speakerId) {
			// Returns filtered array of words.
			if(speakerId==0){
			 	return this.get("moderator").getTopPhrases();
			}else if (speakerId==1){
				return this.get("obama").getTopPhrases();
			}else if(speakerId==2){
			 	return this.get("romney").getTopPhrases();	
			}
		},
		
		// Returns 0 if it ain't, phrase count if it is.
		isTopPhrase: function(speakerId, phrase, numPhrases) {
			if(speakerId==0){
			 	return this.get("moderator").isTopPhrase(phrase, numPhrases);
			}else if (speakerId==1){
				return this.get("obama").isTopPhrase(phrase, numPhrases);
			}else if(speakerId==2){
			 	return this.get("romney").isTopPhrase(phrase, numPhrases);
			}		
		},
		
		getTotalUniquePhrases: function(speakerId) {
			if(speakerId==0){
			 	return this.get("moderator").getCollectionSize();
			}else if (speakerId==1){
				return this.get("obama").getCollectionSize();
			}else if(speakerId==2){
			 	return this.get("romney").getCollectionSize();
			}	
		}
		
	});  

  // Return the module for AMD compliance.
  return UniquePhrase;

});
