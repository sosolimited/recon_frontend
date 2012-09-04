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

  Word.Views.Item = Backbone.View.extend({
    template: "word/item",

    className: "word",

    serialize: function() {
      return { word: this.model };
    }
  });

  Word.Views.List = Backbone.View.extend({
    template: "word/list",

    addWord: function(word) {
      return this.insertView(new Word.Views.Item({
        model: word
      }));
    },

    addWords: function() {
      this.collection.each(function(word) {
        this.addWord(word);
      }, this);
    },

    beforeRender: function() {
      this.addWords();
    },

    cleanup: function() {
      this.collection(null, null, this);
    },

    initialize: function() {
      this.collection.on("add", function(word) {
        this.addWord(word).render();
      }, this);

      this.collection.on("reset", this.addWords, this);
    }
  });

  // Return the module for AMD compliance.
  return Word;

});
