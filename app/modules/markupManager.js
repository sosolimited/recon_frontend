define([
  // Application.
  "core/app",
  "modules/overlay"
],

// Map dependencies from above array.
function(app, Overlay) {

	var MarkupManager = app.module();

  // Default model.
  MarkupManager.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			overlays: []
  		}
  	},
  	
	  initialize: function () {
		  app.on("markup:wordCount", this.addOverlay, this);
		  app.on("markup:sentenceLead", this.addOverlay, this);		  
		  app.on("markup:quote", this.addOverlay, this);
		  app.on("markup:sentenceSentiment", this.addOverlay, this);
	  },
	  
	  cleanup: function() {
		  app.off(null, null, this);
	  },
	  
	  addOverlay: function(args) {
		  console.log("markupManager:addOverlay "+args['type']+" "+args['speaker']);
	  },
	  
	  annotateTranscript: function() {
	  	//this.options.transcript...
	  }
	  
  });

 
  // Return the module for AMD compliance.
  return MarkupManager;

});
