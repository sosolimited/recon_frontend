define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

	// Create a new module.
	var WordData = app.module();

	// Default model.
  WordData.Model = Backbone.Model.extend({
  	defaults: {
  		word : "word",
  		count : 0,
  		cats : []
  	},
  	
  	//Create arrays for list of DOM nodes with this word.
  	initialize: function(){
    	this.set({nodes: []);
    }
  });

  // Default collection.
  WordData.Collection = Backbone.Collection.extend({
    model: WordData.Model,
    
    addWord: function(word){
      return this.insertView(new Word.Views.Item({
        model: word
      }));
    }

  });




	return WordData;
});

