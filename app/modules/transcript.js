define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Transcript = app.module();

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({
    el: '#transcript',
    
    addWord: function(word) {
    	var n = 3;
    	this.$el.append("<span id="+n+">"+word["word"]+"</span>");
    	return n;
    }
  });

  // Return the module for AMD compliance.
  return Transcript;

});
