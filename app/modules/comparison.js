define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Comparison = app.module();



  // Default model.
  Comparison.Model = Backbone.Model.extend({
  	defaults: function() {
  		return {
  			traits:[]		
  		}
  	},
  	// Way of adding a trait to the model.
  	//addTrait: function(name) {
  	// 	traits.push(new dataPair(name));
  	// 	console.log("Comparison.Model:addTrait(" + name + ")");
  	//},
  	// Holds a trait title and the two speaker scores for that trait.
  	dataPair: function(name) {
  		this.title = name;
  		this.obama = 0;
  		this.romney = 0;
  	},
  	initialize: function(options){
  	// Iterate through constructor arg list of traitNames.
		for(var i=0; i < options.names.length; i++)
		  	 this.get("traits").push(new this.dataPair(options.names[i]));
  	}  	
  });


  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
    model: Comparison.Model
  });


	// View for a single comparison.		
  Comparison.Views.Item = Backbone.View.extend({
    template: "comparison/item",
    className: "comparison",

		initialize: function() {
			 
		},
    serialize: function() {
      return { comparison: this.model };
    }
  });


	// View for full list of comparisons.
	// Must be created before comparison models are added to collection.
  Comparison.Views.List = Backbone.View.extend({
  	el: '#comparisons',
    template: "comparison/list",

		/*
		// Iterate over passed collection and create an item view for each model.
		beforeRender: function() {
			this.collection.each(function(model) {
				this.insertView(new Comparison.Views.Item(model));			
			}, this);
		},
		*/

    addComparison: function(comparison) {
      return this.insertView(new Comparison.Views.Item({
        model: comparison
      }));
    },
    
    cleanup: function() {
      this.collection(null, null, this);
    },

    initialize: function() {
      this.collection.on("add", function(comparison) {
        this.addComparison(comparison).render();
      }, this);

    }
  });

  // Return the module for AMD compliance.
  return Comparison;

});
