define([
  // Application.
  "core/app",
  "modules/overlay",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Overlay, Ref) {

	// This module listens for special events and marks up the transcript - directly or by creating one of several overlay views.
	// It will also listen to transcript scroll events and manage the parallax positioning of the overlays.
	// In addition, it will listen to window resize events and update the overlay positions.
	var MarkupManager = app.module();

  // Default model.
  MarkupManager.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			overlays: []
  		}
  	},
  	
	  initialize: function () {
		  app.on("markup:frequentWord", this.markupFrequentWord, this);
		  app.on("markup:wordCount", this.addWordCountOverlay, this);
		  app.on("markup:sentenceLead", this.addTraitOverlay, this);		  	//LM, is this psych traits? 
		  app.on("markup:quote", this.addQuoteOverlay, this);
		  app.on("markup:sentenceSentiment", this.addSentimentOverlay, this);
		  //for testing
		  app.on("keypress:test", this.test, this);
	  },
	  
	  cleanup: function() {
		  app.off(null, null, this);
	  },
	  
	  addOverlay: function(args) {
		  console.log("markupManager:addOverlay "+args['type']+" "+args['speaker']);
		  
	  },
	  
	  addSentimentOverlay: function(args) {
		  
		  
	  },
	  
	  addTraitOverlay: function(args) {
		  var traitsOverlay = new Overlay.Views.TraitView({trait: "FORMAL", leader: "obama", posY: parseInt(this.attributes.transcript.$el.prop("scrollHeight"))});
			$('#overlay').append(traitsOverlay.el);
			traitsOverlay.render().then(function() { traitsOverlay.expand(); } );  
	  },
	  
	  addQuoteOverlay: function(args) {
		  
		  
	  },
	  
	  addWordCountOverlay: function(args){
		  
		  
	  },
	  
	  markupFrequentWord: function(args) {
		  //console.log("markupFrequentWord() " + args['word']);
		  
		  this.attributes.transcript.addClassToRecentWord(args['word'], "frequentWord");
		  
		  /*
		  var word = this.attributes.transcript.getRecentWordEl(args['word']);
		  // console.log("word = " + word);
		  if(word){
		    console.log("found word: "+word.html());
			  word.addClass(".frequentWord");
		  } 
		  */
		  
	  },
	  
	  annotateTranscript: function() {
	  
	  },
	  
	  // For testing things with keypresses.
	  test: function(args) {
		  if(args['type']=="overlay"){
			  if(args['kind']=="trait"){
				 		console.log("test - trait overlay");			  
				 		this.addTraitOverlay();
			  }else if(args['kind']=="wordCount"){
				 		console.log("test - wordCount overlay");			  
			  }
		  }
	  }
	  
  });

 
  // Return the module for AMD compliance.
  return MarkupManager;

});
