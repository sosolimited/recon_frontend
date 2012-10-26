/*
 * app/modules/uniquePhrase.js
 *
 * Copyright 2012 (c) Sosolimited http://sosolimited.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */


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
  	
  	initialize: function(msg, phrase, count) {
  		var str = this.getTheFuckingString(msg.dbid);
  		if (msg && str) this.set({dbid:str, phrase:phrase, cats:msg['cats'], count:count});
    },
    
    getTheFuckingString: function(oid) {  
	    var str = JSON.stringify(oid);
	    if (str) {
  			if (str.indexOf("oid") != -1) return str.substring(10, str.length-2);
  			else return str;
  		}
    },
    
    increment: function(){
    	this.set({count: this.get("count")+1});
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
  		for(var i=0; i<this.numTop+1; i++)
  			this.topPhrases.push({phrase:"", count:0});		
  		
  		app.on("debate:reset", this.empty, this);
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    empty: function() {
	    this.reset();
	    this.topPhrases = [];
  		for(var i=0; i<this.numTop+1; i++)
  			this.topPhrases.push({phrase:"", count:0});	
    },
    
    getTheFuckingString: function(oid) {
	    var str = JSON.stringify(oid);
	    if (str) {
  			if (str.indexOf("oid") != -1) return str.substring(10, str.length-2);
  			else return str;
  		}
    },
    
    addPhrase: function(args) {
			
    	//if (args['live']) { //PEND take out for not, but need to remember why this was here...
	    	var msg = args['msg'];
	    	// Only add word if it's NOT punctuation.
	    	
	    	if (msg['type'] == 'word') {
		    	if(msg['punctuationFlag'] == 0){
		    	
			    	if (this.phraseLength == 1) {
			    		var str = this.getTheFuckingString(msg.dbid);
			    		//console.log(str);
				    	var w = this.where({dbid:str})[0]; //PEND Change 0s.
				    	if (w) w.increment();
				    	else this.add(new UniquePhrase.Model(msg, msg["word"], 1));				    	
				    } else {
					    for (var i=0; i<msg['ngrams'].length; i++) {
			    			var str = this.getTheFuckingString(msg['ngrams'][i][0]);
						    var p = this.where({dbid:str})[0];
						    //if (msg['ngrams'][i][1] == this.phraseLength && p) {
						    if (p) {
							    p.increment();
							    //console.log("inc "+p.get("phrase"));
						    } 
					    }
					  }
					}
	    	} else if (msg['type'] == 'newNGram') {
	    		// add new ngram
	    		if (msg['ngram'].length == this.phraseLength) {		    		
	    			this.add(new UniquePhrase.Model(msg, msg['ngram'].join(" "), 2));
		    		//console.log("added '"+msg['ngram'].join(" ")+"' speaker "+msg['speaker']+" for collection "+this.phraseLength+" "+msg['instances'].length);
		    	}
	    	}
	    	
	    //}
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
					//console.log("p "+this.topPhrases[i]['phrase']+" c "+this.topPhrases[i]['phrase']);
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
		  while((i<numPhrases) && (index<this.length)){
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
