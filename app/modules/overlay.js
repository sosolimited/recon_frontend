define([
  // Application.
  "core/app",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Ref) {
	
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
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
				
				//console.log("posY = " + this.posY);
				
				if(this.options.leader==="obama") this.trailer="romney";
				else this.trailer = "obama";
		 },	
		 
		 serialize: function() {
      return { trait: this.trait, leader: this.leader, trailer: this.trailer, startPosY: this.posY-96};
    },
     
    expand: function() {
   		this.state = 1;	//expanded

    	this.$el.find('.traitExpText').each(function(i){ 
	    		$(this).delay(i*300).animate({top:"0px"}, 1000); 
    	}); 	
    	//Sit for holdDur, then collapse.
    	window.setTimeout(this.collapse, this.expandDur + this.holdDur, this);
    }, 
    
    collapse: function() {
    	//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  	
	    //this.$el.find('.traitExpText').each(function(i){ 
	   	//	$(this).animate({top:"96px"}, 1000); 	    		
    	//});
    	//Shrink text.
    	this.$el.find('.traitExpText').each(function(i){ 
    		$(this).animate({'font-size':'20px', 'line-height':'24px'}, this.collapseDur);
    	}); 
    	
    	//Shrink and mov divs.
    	var y = this.posY;
    	this.$el.find('.traitExpTextHolder').each(function(i){
    		$(this).animate({'left':Ref.gridColumns[0], 'top':y+i*24+'px', 'height':'24px'}, this.collapseDur);   		
    	});

    
    },
    
    afterRender: function() {
	    this.expand();
    }
  });



  // Return the module for AMD compliance.
  return Overlay;

});
