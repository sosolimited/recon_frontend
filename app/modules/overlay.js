define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {
	
	var i=0;
	
  // Create a new module.
  var Overlay = app.module();
 
  Overlay.Model = Backbone.Model.extend({
  
  });

  // We're just using these views as containers for the pieces of each type of overlay object
  // and to give us methods for expanding/collapsing them and parallaxing them.
  Overlay.Views.TraitView = Backbone.View.extend({
  	 template: "overlays/trait",
  			 
		 initialize: function() {
				this.trait = this.options.trait;
				this.leader = this.options.leader; 
				
				if(this.options.leader==="obama") this.trailer="romney";
				else this.trailer = "obama";
		 },	
		 
		 serialize: function() {
      return { trait: this.trait, leader: this.leader, trailer: this.trailer };
    },
    
    expand: function() {
    
    	//this.$el.find('p').css("background-color","blue");
    	//$('body').find('p').css("background-color","blue");

    	this.$el.find('.traitExpText').each(function(i){ 
	    		//$(this).css("background-color", "blue");
	    		$(this).delay(i*300).animate({top:"0px"}, 1000); 
    	});
    	
    	/*
	    $("this.el > div").children('p').each(function(i){
	    	//setTimeout(function(){ this.animate({top:0}, 1000); }, 300*i); 
	    	//this.animate({top:0px}, 1000);
	    	this.css("background-color", "red");
	    	//this.children('p').first().css("top","0px");
	    });
	    */
    }, 
    
    collapse: function() {
	    
	    
    } 	
  });



  // Return the module for AMD compliance.
  return Overlay;

});
