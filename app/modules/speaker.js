define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Speaker = app.module();

  // Default model.
  Speaker.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			wordCount: 0,
  			longestSentence: 0 // PEND: this should keep track of what the longest sentence actually IS.
  		}
  	},
  	
  	initialize: function(sid, sname) {
  		//console.log("INIT SPEAKER "+sname+" "+sid);
    	this.set({id:sid, name:sname});
      app.on("message:word", this.incWordCount, this);
      app.on("message:sentenceEnd", this.incWordCount, this);
      app.on("message:stats", this.updateStats, this);
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    incWordCount: function(args) {
    	if (args['speaker'] == this.get('id'))
   		 	this.set({wordCount: this.get("wordCount")+1});
    },
    
    // PEND: this should keep track of what the longest sentence actually IS.
    updateLongestSentence: function(args) {
    	if (args['speaker'] == this.get('id') && args['length'] > this.get("longestSentence"))
   		 	this.set({longestSentence: args['length']});
    },
    
    updateStats: function(args) {
	    
    }
  });

  // Default collection.
  Speaker.Collection = Backbone.Collection.extend({  
    model: Speaker.Model
  });

  // Return the module for AMD compliance.
  return Speaker;

});
