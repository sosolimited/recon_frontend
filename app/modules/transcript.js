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
    template: "transcript/main",

    className: "transcript"
  });

  // Return the module for AMD compliance.
  return Transcript;

});
