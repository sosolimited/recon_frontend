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

  Word.Views.Basic = Backbone.View.extend({
    template: "word/basic",

    serialize: function() {
      return { word: this.model };
    },

    events: {
      click: "clickWord"
    },

    clickWord: function(ev) {
      var word = $.trim(this.$el.text());

      // Enlarge to next screen.
      this.$el.siblings().removeClass("expand");
      this.$el.toggleClass("expand");
    },

    className: "word"
  });

  Word.Views.List = Backbone.View.extend({
    template: "word/list",

    addWord: function(word) {
      return this.insertView(new Word.Views.Basic({
        model: word
      }));
    },

    beforeRender: function() {
      this.collection.each(function(word) {
        this.addWord(word);
      }, this);
    },

    cleanup: function() {
      this.collection(null, null, this);
    },

    initialize: function() {
      this.collection.on("add", function(word) {
        this.addWord(word).render();
      }, this);
    }
  });

  // Return the module for AMD compliance.
  return Word;

});
