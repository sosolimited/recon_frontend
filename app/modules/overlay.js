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
	  
	  
	//Psychological traits
	//-------------------------------------------------------------------------------------  
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

   		//Slide lines up into view.
    	this.$el.find('.traitExpText').each(function(i){ 
	    		$(this).delay(i*300).animate({top:"0px"}, 1000); 
    	}); 	
    	//Slide big arrow in.
    	this.$el.find('.traitSymbol').each(function(){
	    		$(this).animate({left:Ref.gridColumns[2]+'px'}, 1000);
    	});
    	
    	//Sit for holdDur, then collapse.
    	window.setTimeout(this.collapse, this.expandDur + this.holdDur, this);
    }, 
    
    collapse: function() {
    	//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  		   
    	var y = this.posY;
    	var collapseD = this.collapseDur;
    	//Shrink text.
    	this.$el.find('.traitExpText').each(function(i){ 
    		$(this).animate({'font-size':'20px', 'line-height':'24px'}, collapseD);
    	}); 
    	//Shrink and move divs.
    	this.$el.find('.traitExpTextHolder').each(function(i){
    		$(this).animate({'left':Ref.gridColumns[0], 'top':y+i*24+'px', 'height':'24px'}, collapseD);
    		//$(this).animate({'-webkit-transform':'translateZ(1000px)'}, collapseD);   	//Move div forward in Z.	
    		this.style.webkitTransform = "translateZ(500px)";	//We're using CSS transitions to animate this.
    	});
    	//Shrink and position big arrow.
    	this.$el.find('.traitSymbol').each(function(){
	    		$(this).animate({left:Ref.gridColumns[1]+'px'}, collapseD);
	    		//$(this).animate({'-webkit-transform':'translateZ(-1000px)'}, collapseD);	//Move arrow back in Z.
	    		//this.style.webkitTransform = "translateZ(0px)";	//We're using CSS transitions to animate this.
    	});

    
    },
    
    afterRender: function() {
	    this.expand();
    }
  });
  
  //Word counts (i.e. 1000th word)
	//-------------------------------------------------------------------------------------
	Overlay.Views.WordCountView = Backbone.View.extend({
		template: "overlays/wordCount",
		
		initialize: function() {
				this.speaker = this.options.speaker;
				this.count = this.options.count;
				this.word = this.options.word;
				
				this.posY = this.options.posY;
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, count: this.count, word: this.word, posY: this.posY };
		},
		
		expand: function() {
			
		},
		
		collapse: function() {
			
		},
		
		afterRender: function() {
			this.expand();
		}
		
	});

	//Numbers 
	//-------------------------------------------------------------------------------------
	Overlay.Views.NumbersView = Backbone.View.extend({
		template: "overlays/numbers",
		
		initialize: function() {
				this.speaker = this.options.speaker;
				this.phrase = this.options.phrase;
				
				this.posY = this.options.posY;
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, phrase: this.phrase};
		},
		
		expand: function() {
			
		},
		
		collapse: function() {
			
		},
		
		afterRender: function() {
			this.expand();
		}
		
	});
	
	//Longest sentence
	//-------------------------------------------------------------------------------------
	Overlay.Views.LongSentenceView = Backbone.View.extend({
		template: "overlays/longSentence",
		
		initialize: function() {
				this.speaker = this.options.speaker;
				this.charCount = this.options.charCount;
				this.wordCount = this.options.wordCount;
				
				this.posY = this.options.posY;
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, charCount: this.charCount, wordCount: this.wordCount };
		},
		
		expand: function() {
			
		},
		
		collapse: function() {
			
		},
		
		afterRender: function() {
			this.expand();
		}
		
	});

	//Quotes
	//-------------------------------------------------------------------------------------
	Overlay.Views.QuotesView = Backbone.View.extend({
		template: "overlays/quotes",
		
		initialize: function() {
				this.speaker = this.options.speaker;
				this.phrase = this.options.phrase;
				
				this.posY = this.options.posY;
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, phrase: this.phrase };
		},
		
		expand: function() {
			
		},
		
		collapse: function() {
			
		},
		
		afterRender: function() {
			this.expand();
		}
		
	});
	
	//Sentiment (aka Neg/Pos burst)
	//-------------------------------------------------------------------------------------
	Overlay.Views.SentimentView = Backbone.View.extend({
		template: "overlays/sentiment",
		
		initialize: function() {
				this.speaker = this.options.speaker;
				this.polarity = this.options.polarity;		//negative/positive
				
				this.posY = this.options.posY;
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1500;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, polarity: this.polarity };
		},
		
		expand: function() {
			
		},
		
		collapse: function() {
			
		},
		
		afterRender: function() {
			this.expand();
		}
		
	});
	

  // Return the module for AMD compliance.
  return Overlay;

});
