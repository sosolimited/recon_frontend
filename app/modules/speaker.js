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
  		}
  	},
  	
  	initialize: function(sid, sname) {
  		console.log("INIT SPEAKER "+sname+" "+sid);
    	this.set({id:sid, name:sname});
    }
  });

  // Default collection.
  Speaker.Collection = Backbone.Collection.extend({  
    model: Speaker.Model
  });

  // Return the module for AMD compliance.
  return Speaker;

});
