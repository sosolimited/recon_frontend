define([
  // Application.
  "core/app",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Ref) {
	
  // Create a new module.
  var BigWords = app.module();
 
  BigWords.Model = Backbone.Model.extend({
  });
	  
	BigWords.View = Backbone.View.extend({
  	 template: "bigWords",
	  			 
		 initialize: function() {
		  this.bigWordLength = 10;
		 	app.on("message:word", this.addWord, this);
		 },	
		 
		 serialize: function() {
      return { };
    },
    
    addWord: function(args){
    	var word = args['msg']['word'];
    	//console.log("BigWords addWord("+word+") - "+word.length+" ... "+this.bigWordLength);
	    if(word.length >= this.bigWordLength){
	    	console.log("BigWords.addWord - got a big one");
		   	var holder = this.$el.children(".bigWordsHolder")[0];
		   	$(holder).append("<span class='bigWord'>"+word+"</span>");
	    }
    }
  });
  
  // Return the module for AMD compliance.
  return BigWords;

});