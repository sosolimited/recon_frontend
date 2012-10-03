define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var UniqueWord = app.module();

  // One model per unique word (per speaker collection).
  UniqueWord.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			count: 0,
  			cats: null
  		}
  	},
  	
  	initialize: function(word) {
  		//console.log("INIT "+word["word"]+" "+word["speaker"]);
    	this.set({id:word["dbid"], word:word["word"], cats:word["cats"]});
    	this.increment();
    },
    
    increment: function(){
    	this.set({count: this.get("count")+1});
    }
  });

  // One collection per speaker.
  UniqueWord.Collection = Backbone.Collection.extend({  
  
    model: UniqueWord.Model,
        
  	initialize: function() {
  		// Reusable holder for calculating top 20 words.
  		this.top20Words = [];
  		for(var i=0; i<20; i++)
  			this.top20Words.push({word:"", count:0});		
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    addWord: function(args) {
    	if (args['live']) {
	    	var word = args['msg'];
	    
	    	//console.log("UniqueWord.Collection.addWord("+word['word']+")");
	    	var w = this.get(word["dbid"]); //PEND Change 0s.
	    	if (w) {
	    		//console.log("found word - "+word['word']+" ... "+word['speaker']);
	    		w.increment();
	    	} else {
	    		//console.log("new word - "+word['word']+" ... "+word['speaker']);
	    		this.add(word);
	    	}
	    }
    },
    
    getCollectionSize: function() {
	    return this.models.length;
    },
    
    comparator: function(word) { 
    	// Sort collection based on count.
    	// Negative makes it sort backwards.	
	    return (-1.0*word.get("count"));
	  },
	  
	  getTop20Words: function() {
			// Weed out function words and return array of objects.
		  var i=0;
		  var index=0;
		  while((i<20) && (index<this.models.length)){
		  	// If it's NOT a function word.
				if (this.filterWord(this.at(index))){
					this.top20Words[i]['word'] = this.at(index).get("word");
					this.top20Words[i]['count'] = this.at(index).get("count");
					i++;
				}
				index++;	  	
			}	
			return this.top20Words;
	  },
	  
	  // Returns 0 if ain't, word count if it is.
	  isTopWord: function(word, numWords) {
		  var i=0;
		  var index=0;
		  while((i<numWords) && (index<this.models.length)){
		  	// If it's NOT a function word.
				if (this.filterWord(this.at(index))){
					if(this.at(index).get("word")==word){
						return this.at(index).get("count");
					}else{						
						i++;
					}
				}
				index++;	  	
			}	
			return  0;
	  },
	  
	  filterWord: function(model){
	  	if (($.inArray('funct', model.get("cats")) == -1) && (model.get("word") != " ")){
		  	return true;	
	  	}else{
		  	return false;
	  	}
	  }
  });

  // Container for the three speaker collections. 
	UniqueWord.Model.AllWords = Backbone.Model.extend({
		
		defaults: function(){
			return {
				moderator: new UniqueWord.Collection(),
				obama: new UniqueWord.Collection(),
				romney: new UniqueWord.Collection()
			}	
		},
		
		initialize: function() {
			app.on("message:word", this.addWord, this);	
		},
		
		addWord: function(args) {
			// Add word to appropriate speaker collection.
			if(args['msg']['speaker']==0) this.get("moderator").addWord(args);
			else if(args['msg']['speaker']==1) this.get("obama").addWord(args);
			else if(args['msg']['speaker']==2) this.get("romney").addWord(args);	
		},
		
		getTopWord: function(speakerId, index) {
			if(speakerId==0){
			 	return this.get("moderator").at(index);
			}else if (speakerId==1){
				return this.get("obama").at(index);
			}else if(speakerId==2){
			 	return this.get("romney").at(index);	
			}
		},
		
		getTop20Words: function(speakerId) {
			// Returns filtered array of words.
			if(speakerId==0){
			 	return this.get("moderator").getTop20Words();
			}else if (speakerId==1){
				return this.get("obama").getTop20Words();
			}else if(speakerId==2){
			 	return this.get("romney").getTop20Words();	
			}
		},
		
		// Returns 0 if it ain't, word count if it is.
		isTopWord: function(speakerId, word, numWords) {
			if(speakerId==0){
			 	return this.get("moderator").isTopWord(word, numWords);
			}else if (speakerId==1){
				return this.get("obama").isTopWord(word, numWords);
			}else if(speakerId==2){
			 	return this.get("romney").isTopWord(word, numWords);
			}		
		},
		
		getTotalUniqueWords: function(speakerId) {
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
  return UniqueWord;

});
