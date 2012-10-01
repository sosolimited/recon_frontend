define([
  // Application.
  "app",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Ref) {

  // Create a new module.
  var Comparison = app.module();

  // Base class for comparison model
  Comparison.Model = Backbone.Model.extend({
  	defaults: function() {
  		return {
  			traits:[],
  			speakers:[],
  			range:[0,100],
  			wc:[0,0],
 			
  			viewType: "simple"
  		}
  	},
  	
  	initialize: function(options){
  	
  		var k = [];
  	
  		for (var i=0; i<options.traitNames.length; i++) {

  			//console.log("adding trait "+options.traitNames[i]);
  			this.get("traits").push({name:options.traitNames[i], vals:[0,0]});
  		}
  		//console.log("added traits "+options.traits.length);
  		
  		this.set({viewType:options.viewType, title:options.title, range:options.range, speakers:options.speakerNames});
  		
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

	  		if (msgTrait) {// if found, update vals
	  			newTraits.push({name:this.get("traits")[i]['name'], vals:msgTrait});
	  		
	  		} else // otherwise keep old vals
	  			newTraits.push(this.get("traits")[i]);
	  			
	  		//console.log("updateStats " + args['msg'] + " " + this.get("traits")[i]['name']);
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
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth};
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
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth };
    }
    
  });

  // Extended view for honesty, complexity, formality	
  Comparison.SpectrumModel = Comparison.Model.extend({    	
  	setValues: function() {
	  	
  		this.set({viewType:"spectrum"});
  	}
  });

  Comparison.Views.Spectrum = Backbone.View.extend({
    template: "comparison/spectrum",
    className: "comparison container",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth};
    }
    
  });

  // Extended view for word count, unique word count	
  Comparison.CountModel = Comparison.Model.extend({    	

    setValues: function() {
	  	
  		this.set({viewType:"count"});
  		
  		app.on("message:word", this.updateWordStats, this);  		
  	},
 
    updateWordStats: function(args) {
  		
  		var msgTrait = args['msg']['speaker'];
  		var punct = args['msg']['punctuationFlag'];
  		var val1 = this.get('speakers').at(1).get("wordCount");
  		var val2 = this.get('speakers').at(2).get("wordCount");
  		  		
  		if (msgTrait == 1 && !punct) {
  			//this.set({wc:[ this.get("wc")[0] +1, this.get("wc")[1]] });
  			this.set({wc:[ val1, val2] });
  			//console.log("speaker[1] wc = " + val1);
  		} else if (msgTrait == 2 && !punct) {
  			//this.set({wc:[ this.get("wc")[0], this.get("wc")[1] + 1] });
  			this.set({wc:[ val1, val2] });
   			//console.log("speaker[2] wc = " + val2); 			
  			//console.log("wc[1] ++");
  			
  		}
	  	
  	}

  });

  Comparison.Views.Count = Backbone.View.extend({
    template: "comparison/count",
    className: "comparison container",

		initialize: function() {
			 this.model.on("change", this.render, this);
		},
		
    serialize: function() {
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth};
    }
    
  });

  // Extended view for top words, top n-grams	
  Comparison.ListModel = Comparison.Model.extend({    	
  
  	setValues: function() {
  	
  		this.set({viewType:"list" });
  		
  		app.on("message:word", this.updateWordStats, this);
  		
  		
  		var oList = ["going", "make", "think", "got", "opponent", "Romney", "right", "know", "Mitt", "president", "sure", "said", "tax", "years", "Afghanistan", "look", "troops", "need", "nuclear", "important"];
  	    var rList = ["president", "Obama", "know", "said", "spending", "united", "got", "states", "want", "people", "going", "government", "strategy", "make ", "think", "time", "way", "go", "look", "new"];
	  	var oVals = [51,36,35,33,32,31,27,26,24,24,21,20,17,17,16,15,15,14,13,13];
	  	var rVals = [55,44,40,36,35,34,27,26,24,24,21,20,17,16,15,15,15,14,14,12];
	  	this.set({ obamaList: oList, obamaValues: oVals, romneyList: rList, romneyValues: rVals});		
  	},
  	
  	
    updateWordStats: function(args) {
    	
  	}  	
  	
  });

  Comparison.Views.List = Backbone.View.extend({
    template: "comparison/list",
    className: "comparison container",

	initialize: function() {
		this.model.on("change", this.render, this);

	},
		
    serialize: function() {
	  console.log(this.model.get("obamaList"));
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth};
    }
    
  });


  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
  });

	// View for full list of comparisons.
	// Must be created before comparison models are added to collection.
  Comparison.Views.All = Backbone.View.extend({
  	el: '#comparisons',
    template: "comparison/all",

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
		else if (comparison.get("viewType") === "spectrum") {
			return this.insertView(new Comparison.Views.Spectrum({
					model: comparison
				}));
		}			
		else if (comparison.get("viewType") === "list") {
			return this.insertView(new Comparison.Views.List({
					model: comparison
				}));
		}
		
		else if (comparison.get("viewType") === "count") {
			return this.insertView(new Comparison.Views.Count({
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
