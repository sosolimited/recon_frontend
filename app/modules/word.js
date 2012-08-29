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

  Word.Views.Detail = Backbone.View.extend({
    template: "word/detail",

    events: {
      clickoutside: "close"
    },

    close: function(ev) {
      this.$el.fadeOut(500);

      // Enlarge to next screen.
      if (this.elem) {
        this.elem.removeClass("expand");
        this.elem.siblings().removeClass("fade");
      }
    },

    serialize: function() {
      console.log(this.model);
      return { word: this.model };
    },

    activate: function(word, elem) {
      this.model = word;
      this.elem = elem;
      this.model.on("change", this.render, this);
      this.render();
    },

    beforeRender: function() {
      this.$el.hide();
    },

    afterRender: function() {
      if (this.elem) {
        this.$el.css({
          top: (this.elem.offset().top - 22) + "px",
          left: ((this.elem.offset().left) - 10) + "px"
        });
      }

      this.$el.show();
    }
  });

  Word.Views.Item = Backbone.View.extend({
    template: "word/item",

    className: "word",

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
      this.$el.addClass("expand");
      this.$el.siblings().addClass("fade");

      // Fade in the detail View.
      this.$el.on("webkitTransitionEnd", _.bind(function() {
        this.$el.off("webkitTransitionEnd");
        app.views.detail.activate(this.model, this.$el);
      }, this));
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
