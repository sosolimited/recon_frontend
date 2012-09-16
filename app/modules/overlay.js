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

  
  Overlay.Views.TraitView = Backbone.View.extend({
  	 template: "overlays/trait",
  			 
		 initialize: function() {
				this.trait = this.options.trait;
				this.leader = this.options.leader; 
				this.posY = this.options.posY;
				
				if(this.options.leader==="obama") this.trailer="romney";
				else this.trailer = "obama";
		 },	
		 
		 serialize: function() {
      return { trait: this.trait, leader: this.leader, trailer: this.trailer };
    },
    
    expand: function() {
   		this.state = 1;	//expanded

    	this.$el.find('.traitExpText').each(function(i){ 
	    		$(this).delay(i*300).animate({top:"0px"}, 1000); 
    	});
    	

    }, 
    
    collapse: function() {
    	//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  		
	    this.$el.find('.traitExpText').each(function(i){ 
	   		$(this).delay(i*300).animate({top:"0px"}, 1000); 	    		
    	});
    	
    	
    } 	
  });

  
  

  

  // Return the module for AMD compliance.
  return Overlay;

});
