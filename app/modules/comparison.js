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
  			range:[0,100],
  			viewType: "simple"
  		}
  	},
  	
  	initialize: function(options){
  	
  		var k = [];
  	
  		for (var i=0; i<options.traitNames.length; i++) {
  			console.log("adding trait "+options.traitNames[i]);
  			this.get("traits").push({name:options.traitNames[i], vals:[0,0]});
  		}
  		console.log("added traits "+options.traits.length);
  		
  		this.set({viewType:options.viewType, title:options.title, range:options.range});
  		
  		app.on("message:stats", this.updateStats, this);
  		
  		this.setValues();
  	},
  	
  	cleanup: function() {
	  	app.off(null, null, this);
  	},
  	
  	setValues: function() {},
  	
  	updateStats: function(args) {
  		var newTraits = [];
  	
  		for (var i=0; i<this.get("traits").length; i++){ 
  			var msgTrait = args['msg'][this.get("traits")[i]['name']];
  			
  			console.log("setval "+this.get("traits")[i]['name']+" "+msgTrait);

	  		if (msgTrait) // if found, update vals
	  			newTraits.push({name:this.get("traits")[i]['name'], vals:msgTrait});
	  		else // otherwise keep old vals
	  			newTraits.push(this.get("traits")[i]);
  		}
	  	this.set({traits:newTraits});
  	}
  });
  
  
  // Default view for a single comparison.		
  Comparison.Views.Simple = Backbone.View.extend({
    template: "comparison/simple",
    className: "comparison",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model };
    }
    
  });
  
  
  
  // here is where you can override methods and implement new ones
  Comparison.FancyModel = Comparison.Model.extend({    	
  	setValues: function() {
	  	
  		this.set({viewType:"fancy"});
  	}
  });

  // Extended view for a single comparison.		
  Comparison.Views.Fancy = Backbone.View.extend({
    template: "comparison/fancy",
    className: "comparison",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model };
    }
    
  });

  // Extended view for posemo, negemo, anger.	
  Comparison.EmotionModel = Comparison.Model.extend({    	
  	setValues: function() {
	  	
  		this.set({viewType:"emotion"});
  	}
  });


  Comparison.Views.Emotion = Backbone.View.extend({
    template: "comparison/emotion",
    className: "comparison container",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model };
    }
    
  });

  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
  });

	// View for full list of comparisons.
	// Must be created before comparison models are added to collection.
  Comparison.Views.List = Backbone.View.extend({
  	el: '#comparisons',
    template: "comparison/list",

    addComparison: function(comparison) {
    
    	if (comparison.get("viewType") === "fancy") {
    		return this.insertView(new Comparison.Views.Fancy({
					model: comparison
				}));
		}
    	else if (comparison.get("viewType") === "emotion") {
    		return this.insertView(new Comparison.Views.Emotion({
					model: comparison
				}));
		}		
		else {
		    return this.insertView(new Comparison.Views.Simple({
  		    model: comparison
  		  }));
  	  }
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
