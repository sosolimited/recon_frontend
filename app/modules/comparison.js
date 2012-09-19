define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Comparison = app.module();



  // Base class for comparison model
  Comparison.Model = Backbone.Model.extend({
  	defaults: function() {
  		return {
  			traits:[],
  			val: 0
  		}
  	},
  	
  	initialize: function(options){
  	
  		var k = [];
  	
  		for (var i=0; i<options.traitNames.length; i++) {
  			console.log("adding trait "+options.traitNames[i]);
  			this.get("traits").push({name:options.traitNames[i], vals:[0,0]});
  		}
  		console.log("added traits "+options.traits.length);
  		
  		app.on("message:stats", this.updateStats, this);
  	},
  	
  	cleanup: function() {
	  	app.off(null, null, this);
  	},
  	
  	updateStats: function(args) {
  		var newTraits = [];
  	
  		for (var i=0; i<this.get("traits").length; i++){ 
  			var msgTrait = args['msg'][this.get("traits")[i]['name']];

	  		if (msgTrait) // if found, update vals
	  			newTraits.push({name:this.get("traits")[i]['name'], vals:msgTrait});
	  		else // otherwise keep old vals
	  			newTraits.push(this.get("traits")[i]);
  		}
	  	this.set({traits:newTraits});
  	}
  });
  
  
  // here is where you can override methods and implement new ones
  Comparison.FancyModel = Comparison.Model.extend({  
  });



  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
  });


	// View for a single comparison.		
  Comparison.Views.Item = Backbone.View.extend({
    template: "comparison/item",
    className: "comparison",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model };
    },
    
    print: function() {
	    console.log("print");
    }
  });


	// View for full list of comparisons.
	// Must be created before comparison models are added to collection.
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
