define([
  // Application.
  "core/app"
],

var speakers = ["moderator", "obama", "romney"];

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
  	}
  	initialize: function(){
  		//Iterate through constructor arg list of trait names.
		for(var i=0; i < this.options.length; i++)
		  	traits.push(new dataPair(name));
  	}
  	// Holds a trait and the two speaker scores for that trait.
  	dataPair: function(name) {
  		this.title = name;
  		this.obama = 0;
  		this.romney = 0;
  	}  	
  	// Optional way of adding a trait to the model.
  	addTrait : function(name) {
  	 	traits.push(new dataPair(name));
  	}
  });

  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
    model: Comparison.Model
  });

  Comparison.Views.Item = Backbone.View.extend({
    template: "comparison/item",

    className: "comparison",

    serialize: function() {
      return { comparison: this.model };
    }
  });

  Comparison.Views.List = Backbone.View.extend({
  	el: '#comparisons',
    template: "comparison/list",

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
