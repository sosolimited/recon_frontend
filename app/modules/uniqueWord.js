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
  	console.log("INIT "+word["word"]+" "+word["speaker"]);
    	this.set({id:word["id"], count:1, word:word["word"]});
    	if (word["speaker"] == 0) this.get("moderator").push(0);
    	else if (word["speaker"] == 1) this.get("obama").push(0);
    	else if (word["speaker"] == 2) this.get("romney").push(0);
    	 //pend change 0
    },
    increment: function(node, sid){
    	this.set({count: this.get("count")+1});
    	if (sid == 0) this.get("moderator").push(0);
    	else if (sid == 1) this.get("obama").push(0);
    	else if (sid == 2) this.get("romney").push(0);
    	 //pend change 0
    	console.log("INC "+this.get("word")+" "+this.get("count")+" "+sid);
    }
  });

  // Default collection.
  UniqueWord.Collection = Backbone.Collection.extend({  
    model: UniqueWord.Model,
    
    addWord: function(word) {
    	var w = this.get(word["id"]);
    	if (w) {
    		w.increment(0, word["speaker"]);
    	} else {
    		this.add(word);
    	}
    }
  });

  UniqueWord.Views.Item = Backbone.View.extend({
    template: "word/item",

    className: "word",

    serialize: function() {
      console.log(this.model);
      return { word: this.model };
    }
  });


  // Return the module for AMD compliance.
  return UniqueWord;

});
