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
  // ---------------------------------------------------------------------------------------------
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
  		
  		this.set({viewType:options.viewType, title:options.title, range:options.range, speakers:options.speakerNames, color1:options.color1, color2:options.color2});
  		
  		app.on("message:stats", this.updateStats, this);
  		
  		this.setValues(options);
  	},
  	
  	cleanup: function() {
	  	app.off(null, null, this);
  	},
  	
  	setValues: function(options) {},
  	
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
      return { comparison: this.model};
    }
    
  });
  
  
  // Here is where you can override methods and implement new ones.
  // ---------------------------------------------------------------------------------------------
  Comparison.FancyModel = Comparison.Model.extend({    	
  	setValues: function(options) {
	  	
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
  // ---------------------------------------------------------------------------------------------
  Comparison.EmotionModel = Comparison.Model.extend({    	
  	setValues: function(options) {
	  	
  		this.set({viewType:"emotion"});
  	}
  });

  Comparison.Views.Emotion = Backbone.View.extend({
    template: "comparison/emotion",
    className: "comparison container",

		initialize: function() {
			 this.model.on("change", this.render, this);
			 
			 this.scrollY = this.options.scrollY;				// Top of scrolling.
			 this.scrollD = this.options.scrollD; 			// Total scroll distance.
			 this.scrollDet = this.options.scrollDet;		// Scroll detent.	
		},
		
    serialize: function() {
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth, scrollY: this.scrollY, scrollD: this.scrollD, scrollDet: this.scrollDet };
    },
    
    afterRender: function() {
    	// Add to skrollr mangr.
    	/*
	    this.$el.find('.compareContainer').each(function(){
		  	app.skrollr.refresh(this);
	    });
	    */
    }
    
  });

  // Extended view for honesty, complexity, formality	
  // ---------------------------------------------------------------------------------------------
  Comparison.SpectrumModel = Comparison.Model.extend({    	
  	setValues: function(options) {
	  	
  		this.set({viewType:"spectrum", gradient: options.gradient});
  	}
  });

  Comparison.Views.Spectrum = Backbone.View.extend({
    template: "comparison/spectrum",
    className: "comparison container",

		initialize: function() {
			 this.model.on("change", this.render, this);
			 
			 this.scrollY = this.options.scrollY;			// Top of scrolling.
			 this.scrollD = this.options.scrollD; 			// Total scroll distance.
			 this.scrollDet = this.options.scrollDet;	// Scroll detent.	
		},
		
    serialize: function() {
      return { comparison: this.model, scrollY: this.scrollY, scrollD: this.scrollD, scrollDet: this.scrollDet };
    },
    
    afterRender: function() {
	    // Add to skrollr mangr.
	    /*
	    this.$el.find('.compareContainer').each(function(){
		  	app.skrollr.refresh(this);
	    });
	    */
	  	    
    	/*
    	$(this).children(".className").each(function () { 
    	
    		$(this).css("background-color", "rgb(50,100,150)");
    	
    	});
    	*/
    }
    
  });

  // Extended view for word count, unique word count	
  // ---------------------------------------------------------------------------------------------
  Comparison.CountModel = Comparison.Model.extend({    	

    setValues: function(options) {
	  	
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
			 
			 this.scrollY = this.options.scrollY;	// Top of scrolling.
			 this.scrollD = this.options.scrollD; // Total scroll distance.	
			 this.scrollDet = this.options.scrollDet;	// Scroll detent.	
		},
		
    serialize: function() {
      return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth, scrollY: this.scrollY, scrollD: this.scrollD, scrollDet: this.scrollDet };
    },
    
    afterRender: function() {
	   	// Add to skrollr mangr.
	   	/*
	    this.$el.find('.compareContainer').each(function(){
		  	app.skrollr.refresh(this);
	    });
	    */
	  }
    
  });

  // Extended view for top words, top n-grams	
  // ---------------------------------------------------------------------------------------------
  Comparison.ListModel = Comparison.Model.extend({
        	     	
  	setValues: function(options) {

  		this.set({viewType:"list", uniqueWords:options.uniqueWords, obamaList: new Array(), romneyList: new Array(), obamaValues: new Array(), romneyValues: new Array()});
  		app.on("message:word", this.updateWordStats, this);	
  			  		
  	},
  	
  	updateWordStats: function() {
  	
  		// massive memory leak here! move these new's out of here!
  		// this is the only way I could get this to pass info correctly
  	  var oList = new Array();
  	  var rList = new Array();
	  	var oVals = new Array();
	  	var rVals = new Array();  	
  	
  		for (var i = 0 ; i < 10 ; i++) {
  		
  		  oList[i] = this.get('uniqueWords').getTopPhrases(1)[i]['phrase'];
  		  rList[i] = this.get('uniqueWords').getTopPhrases(2)[i]['phrase'];
  		  oVals[i] = this.get('uniqueWords').getTopPhrases(1)[i]['count'];
  		  rVals[i] = this.get('uniqueWords').getTopPhrases(2)[i]['count'];
  
  		  if (oList[i] === "") 
	  		  oList[i] = "...";
  		  if (rList[i] === "") 
	  		  rList[i] = "...";	  		  

  		}
  	
	  	this.set({obamaList: oList, romneyList: rList, obamaValues: oVals, romneyValues: rVals});

  	}

  });

  Comparison.Views.List = Backbone.View.extend({
    template: "comparison/list",
    className: "comparison container",

    initialize: function() {
			this.model.on("change", this.render, this);
			
			this.scrollY = this.options.scrollY;			// Top of scrolling.
			this.scrollD = this.options.scrollD; 			// Total scroll distance.
			this.scrollDet = this.options.scrollDet;	// Scroll detent.	
		},
		
	  serialize: function() {
	    return { comparison: this.model, grid: Ref.gridColumns, gutter: Ref.gutterWidth, scrollY: this.scrollY, scrollD: this.scrollD, scrollDet: this.scrollDet };
	  },
	 
	  afterRender: function() {
	  	// Add to skrollr mangr.
	  	/*
	    this.$el.find('.compareContainer').each(function(){
		  	app.skrollr.refresh(this);
	    });	    
	    */
	    /*
	    this.$el.find('.comparisonListWord').each(function(){
		  	app.skrollr.refresh(this);
	    });
	    this.$el.find('.comparisonListCandidate').each(function(){
		  	app.skrollr.refresh(this);
	    });	    
	    this.$el.find('.comparisonSubtitle').each(function(){
		  	app.skrollr.refresh(this);
	    });	    
	    */
	    
    }    
  });


  Comparison.MegaListModel = Comparison.Model.extend({
        	     	
  	setValues: function(options) {

  		this.set({viewType:"list", uniqueWords:options.uniqueWords, unique2Grams:options.unique2Grams, unique3Grams:options.unique3Grams, obamaList: new Array(), romneyList: new Array(), obamaValues: new Array(), romneyValues: new Array()});
  		app.on("message:word", this.updateWordStats, this);	
  			  		
  	},
  	
  	updateWordStats: function() {
  	
  		// massive memory leak here! move these new's out of here!
  		// this is the only way I could get this to pass info correctly
  	  var oWordList = new Array();
  	  var rWordList = new Array();
	  	var oWordVals = new Array();
	  	var rWordVals = new Array();  	
  	  var o2GramList = new Array();
  	  var r2GramList = new Array();
	  	var o2GramVals = new Array();
	  	var r2GramVals = new Array();  	
  	  var o3GramList = new Array();
  	  var r3GramList = new Array();
	  	var o3GramVals = new Array();
	  	var r3GramVals = new Array();  	
  	
  		for (var i = 0 ; i < 10 ; i++) {
  		
  		  oWordList[i] = this.get('uniqueWords').getTopPhrases(1)[i]['phrase'];
  		  rWordList[i] = this.get('uniqueWords').getTopPhrases(2)[i]['phrase'];
  		  oWordVals[i] = this.get('uniqueWords').getTopPhrases(1)[i]['count'];
  		  rWordVals[i] = this.get('uniqueWords').getTopPhrases(2)[i]['count'];
  		  o2GramList[i] = this.get('unique2Grams').getTopPhrases(1)[i]['phrase'];
  		  r2GramList[i] = this.get('unique2Grams').getTopPhrases(2)[i]['phrase'];
  		  o2GramVals[i] = this.get('unique2Grams').getTopPhrases(1)[i]['count'];
  		  r2GramVals[i] = this.get('unique2Grams').getTopPhrases(2)[i]['count'];  
  		  o3GramList[i] = this.get('unique3Grams').getTopPhrases(1)[i]['phrase'];
  		  r3GramList[i] = this.get('unique3Grams').getTopPhrases(2)[i]['phrase'];
  		  o3GramVals[i] = this.get('unique3Grams').getTopPhrases(1)[i]['count'];
  		  r3GramVals[i] = this.get('unique3Grams').getTopPhrases(2)[i]['count'];  
  		    
  		  if (oWordList[i] === "") 
	  		  oWordList[i] = "...";
  		  if (rWordList[i] === "") 
	  		  rWordList[i] = "...";	  		  
  		  if (o2GramList[i] === "") 
	  		  o2GramList[i] = "...";
  		  if (r2GramList[i] === "") 
	  		  r2GramList[i] = "...";	  
  		  if (o3GramList[i] === "") 
	  		  o3GramList[i] = "...";
  		  if (r3GramList[i] === "") 
	  		  r3GramList[i] = "...";	
	  		   	  		  
  		}
  	
	  	this.set({obamaWordList: oWordList, romneyWordList: rWordList, obamaWordValues: oWordVals, romneyWordValues: rWordVals, obama2GramList: o2GramList, romney2GramList: r2GramList, obama2GramValues: o2GramVals, romney2GramValues: r2GramVals, obama3GramList: o3GramList, romney3GramList: r3GramList, obama3GramValues: o3GramVals, romney3GramValues: r3GramVals, });

  	}

  });

  Comparison.Views.MegaList = Backbone.View.extend({
    template: "comparison/megalist",
    className: "comparison container",

    initialize: function() {
			this.model.on("change", this.render, this);
			
			this.scrollY = this.options.scrollY;			// Top of scrolling.
			this.scrollD = this.options.scrollD; 			// Total scroll distance.
			this.scrollDet = this.options.scrollDet;	// Scroll detent.	
		},
		
	  serialize: function() {
	    return { comparison: this.model, scrollY: this.scrollY, scrollD: this.scrollD, scrollDet: this.scrollDet };
	  },
	 
	  afterRender: function() {
	    
    }    
  });
  
  // ---------------------------------------------------------------------------------------------
  Comparison.Collection = Backbone.Collection.extend({
  });

	// View for full list of comparisons.
	// Must be created before comparison models are added to collection.
  Comparison.Views.All = Backbone.View.extend({

    template: "comparison/all",
    
    initialize: function() {
	    //this.uniqueWords = this.options.uWords;

	    this.collection.on("add", function(comparison) {
        this.addComparison(comparison).render();
      }, this);

	    this.curScrollY = 0;	// To keep track of skrollr ranges.
	    this.scrollDist = 2500;	// Scroll height over which each comparison assembles.
	    this.scrollDetent = 500;	// Scroll height over which each comparison pauses before exiting.
    },

    addComparison: function(comparison) {
	  	//console.log("curScrollY = "+this.curScrollY+" scrollDist = "+this.scrollDist);
	  	var view = null;
	  	
			if (comparison.get("viewType") === "fancy") {
				view = this.insertView(new Comparison.Views.Fancy({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}
			else if (comparison.get("viewType") === "emotion") {
				view = this.insertView(new Comparison.Views.Emotion({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}
			else if (comparison.get("viewType") === "spectrum") {
				view = this.insertView(new Comparison.Views.Spectrum({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}			
			else if (comparison.get("viewType") === "list") {
				view =  this.insertView(new Comparison.Views.List({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}
			else if (comparison.get("viewType") === "megalist") {
				view =  this.insertView(new Comparison.Views.MegaList({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}			
			else if (comparison.get("viewType") === "count") {
				view = this.insertView(new Comparison.Views.Count({
						model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
					}));
			}							
			else {
		    view =  this.insertView(new Comparison.Views.Simple({
			    model: comparison, scrollY: this.curScrollY, scrollD: this.scrollDist, scrollDet: this.scrollDetent
			  }));  		  
	  	}
	  	
	  	this.curScrollY += (this.scrollDist + this.scrollDetent);	
	  	return view;  		  	
    },
    
    cleanup: function() {
      this.collection(null, null, this);
    },

    
    // For skrollr purposes.
    insertFiller: function() {
	    this.$el.append("<div class='comparisonFiller'></div>");	    
    },
    
    exit: function() {
	    $('#comparisons').css("visibility", "hidden");	     	   
    },
    
    afterRender: function() {
    	// For skrollr purposes, to be able to scroll long and deep in the comparisons > .wrapper div.
	    //this.insertFiller();	

    }
  });

  // Return the module for AMD compliance.
  return Comparison;

});
