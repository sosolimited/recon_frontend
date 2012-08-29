define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Word = app.module();

  // Default model.
  Word.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  Word.Collection = Backbone.Collection.extend({
    model: Word.Model
  });

  // Return the module for AMD compliance.
  return Word;

});
