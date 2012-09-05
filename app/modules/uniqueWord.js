define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var UniqueWord = app.module();

  // Default model.
  UniqueWord.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			moderator:[],
  			obama:[],
  			romney:[],
  			count:0
  		}
  	},
  	
  	initialize: function(word, node) {
  		console.log("INIT "+word["word"]+" "+word["speaker"]);
    	this.set({id:word["id"], count:1, word:word["word"]});
    	this.addNode(word["speaker"], node);
    },
    increment: function(sid, node){
    	this.set({count: this.get("count")+1});
    	this.addNode(sid, node);
    	console.log("INC "+this.get("word")+" "+this.get("count")+" "+sid);
    },
    addNode: function(sid, node) {
    	if (sid == 0) this.get("moderator").push(node);
    	else if (sid == 1) this.get("obama").push(node);
    	else if (sid == 2) this.get("romney").push(node);
    }
  });

  // Default collection.
  UniqueWord.Collection = Backbone.Collection.extend({  
    model: UniqueWord.Model,
    
    addWord: function(word, node) {
    	var w = this.get(word["id"], node);//pend change 0s
    	if (w) {
    		w.increment(word["speaker"], node);
    	} else {
    		this.add(word);
    	}
    }
  });
  
	UniqueWord.Views.Detail = Backbone.View.extend({
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
      console.log(elem);
      this.elem = $('#'+elem);
      //this.model.on("change", this.render, this);
      this.render();
    },

    beforeRender: function() {
      this.$el.hide();
    },

    afterRender: function() {
      if (this.elem) {
        this.$el.css({
          top: (this.elem.offset().top) + "px",
          left: ((this.elem.offset().left) - 50) + "px"
        });
      }
      this.$el.show();
      this.$el.fadeOut(500);
    }
  });
  
  UniqueWord.Views.Item = Backbone.View.extend({
    template: "word/item",

    className: "word",

    serialize: function() {
      console.log(this.model);
      return { word: this.model };
    }
  });


  // Return the module for AMD compliance.
  return UniqueWord;

});
