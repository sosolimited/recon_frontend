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
				this.collapseY = this.options.wordPos[1];
				this.wordX = this.options.wordPos[0];// + 160;	//PEND for some reason, 1 column + 1 gutter width has to be added here. Fix transcript.getRecentWordPos(). 
				
				//all durations in milliseconds	
				this.expandDur = 2*300 + 1000;		
				this.holdDur = 2000;								
				this.collapseDur = 1000;				
		},
		
		serialize: function() {
				return { speaker: this.speaker, count: this.count, word: this.word, posY: this.posY, wordX: this.wordX, lineY: this.collapseY+Ref.transcriptPointSize, grid: Ref.gridColumns };
		},
		
		expand: function() {
			this.state = 1;	//expanded

   		//Slide lines up into view.
    	this.$el.find('.wordCountText').each(function(i){ 
	    		//$(this).delay(i*300).animate({top:"0px"}, 1000); 	//Doing it with jQuery.
	    		$(this).css("top","0px");							//This works. 
	    		//window.setTimeout(function(){ this.css("top", "0px"); }, i*300, $(this)); //Use setTimeout to delay the lines.
	 
    	});
    	//Slide word up
    	this.$el.find('.wordCountWord').each(function(i){ 
	    		//$(this).delay(500).animate({top:"0px"}, 1000); //jQuery
	    		window.setTimeout(function(){ this.css("top","0px"); }, 400, $(this));	//CSS transitions
    	}); 	
    	
    	//Sit for holdDur, then collapse.
    	window.setTimeout(this.collapse, this.expandDur + this.holdDur, this);
		},
		
		collapse: function() {
			//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  		   
    	var y = this.posY;
    	var cY = this.collapseY;
    	//console.log("collapse: y="+y+", cY="+cY);
    	var collapseD = this.collapseDur;
    	//Shrink text.
    	this.$el.find('.wordCountText').each(function(i){ 
    		//$(this).delay((3-i)*50).animate({'font-size':'36px', 'line-height':'36px'}, collapseD);
    		$(this).css('font-size','36px');
    		$(this).css('line-height','36px');
    	}); 
    	//Shrink word.
    	this.$el.find('.wordCountWord').each(function(i){ 
    		//$(this).animate({'font-size':'36px', 'line-height':'36px'}, collapseD);	
    		//$(this).css('font-size','36px');
    		//$(this).css('line-height','36px');
    		$(this).css('top', '120px');
    	}); 
    	//Shrink and move divs.
    	var sp = this.speaker;
    	this.$el.find('.wordCountTextHolder').each(function(i){
    		if(i<3){ //don't move white word
	    		if(sp=="obama"){
		    		//$(this).delay((4-i)*50).animate({'left':Ref.gridColumns[4], 'top':y+i*36+'px', 'height':'36px'}, collapseD);
		    		$(this).css("left", Ref.gridColumns[4]);
		    		$(this).css("top", (cY-(3-i)*36+24)+"px");
		    		$(this).css("height", "36px");
		    	}else{
		    		//$(this).delay((4-i)*50).animate({'left':Ref.gridColumns[2], 'top':y+i*36+'px', 'height':'36px'}, collapseD);
		    		$(this).css("left", Ref.gridColumns[2]);
		    		$(this).css("top", (cY-(3-i)*36+24)+"px");
		    		$(this).css("height", "36px");
		    	}
	    	}
    		//this.style.webkitTransform = "translateZ(500px)";	
    	}); 
    	
    	//Expand line
    	var x = this.wordX;
	    	this.$el.find('.wordCountLine').each(function(i){
	    		//$(this).css("top", cY+Ref.transcriptPointSize);
	    		if(sp=="obama"){
		    		$(this).css("width", (Ref.gridColumns[4]+Ref.gridWidth-x));
		    		//console.log("width = "+(Ref.gridColumns[5]-x));
		    	}else{
		    		$(this).css("width", (x-Ref.gridColumns[2]));
		    		//console.log("width = "+(x-Ref.gridColumns[2]));
		    	}  
		    	
	    	});
		},
		
		afterRender: function() {
			//this.expand();
			window.setTimeout(this.expand, 10, this);	//delay is necessary to ensure that initial template CSS has been inserted by render
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
