define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var UniqueWord = app.module();

  // Default model.
  UniqueWord.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			moderator:[],
  			obama:[],
  			romney:[],
  			count:0
  		}
  	},
  	
  	initialize: function(word) {
  		//console.log("INIT "+word["word"]+" "+word["speaker"]);
    	this.set({dbid:word["dbid"], count:1, word:word["word"]});
    	this.addNode(word["speaker"], word["id"]);
    },
    increment: function(sid, node){
    	this.set({count: this.get("count")+1});
    	this.addNode(sid, node);
    	//console.log("INC "+this.get("word")+" "+this.get("count")+" "+sid);
    },
    addNode: function(sid, node) {
    	if (sid == 0) this.get("moderator").push(node);
    	else if (sid == 1) this.get("obama").push(node);
    	else if (sid == 2) this.get("romney").push(node);
    }
  });

  // Default collection.
  UniqueWord.Collection = Backbone.Collection.extend({  
    model: UniqueWord.Model,
        
  	initialize: function() {
      app.on("message:word", this.addWord, this);
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    addWord: function(args) {
    
    	if (args['live']) {
	    	var word = args['msg'];
	    
	    	var w = this.get(word["dbid"]);//pend change 0s
	    	if (w) {
	    		w.increment(word["speaker"], word["id"]);
	    	} else {
	    		this.add(word);
	    	}
	    }
    }
  });
  

  // Return the module for AMD compliance.
  return UniqueWord;

});
