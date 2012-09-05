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
  	
  	initialize: function(word, node) {
  		console.log("INIT "+word["word"]+" "+word["speaker"]);
    	this.set({id:word["id"], count:1, word:word["word"]});
    	this.addNode(word["speaker"], node);
    },
    increment: function(sid, node){
    	this.set({count: this.get("count")+1});
    	this.addNode(sid, node);
    	console.log("INC "+this.get("word")+" "+this.get("count")+" "+sid);
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
    
    addWord: function(word) {
    	var w = this.get(word["id"], 0);//pend change 0s
    	if (w) {
    		w.increment(word["speaker"], 0);
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
