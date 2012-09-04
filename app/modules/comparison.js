define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Comparison = app.module();

  // Default model.
  Comparison.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  Comparison.Collection = Backbone.Collection.extend({
    model: Comparison.Model
  });

  Comparison.Views.Item = Backbone.View.extend({
    template: "comparison/item",

    className: "comparison",

    serialize: function() {
      return { comparison: this.model };
    }
  });

  Comparison.Views.List = Backbone.View.extend({
    template: "comparison/list",

    addComparison: function(comparison) {
      return this.insertView(new Comparison.Views.Item({
        model: comparison
      }));
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
