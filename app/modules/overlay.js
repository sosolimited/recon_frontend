define([
  // Application.
  "app",
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
			this.forceCollapse = this.options.forceCollapse;
			this.trait = this.options.trait;
			this.speaker = this.options.speaker;
			this.moreVal = this.options.moreVal;
			
			
			this.aVal = '>'; 
			
			if (this.speaker == 1)
			{
				if (this.moreVal.indexOf('LESS') != -1) this.aVal = '<';
			}
			else 
			{
				if (this.moreVal.indexOf('MORE') != -1) this.aVal = '<';
			}
			
			//console.log(this.moreVal + " " + this.aVal);

			this.posY = this.options.posY;
			//all durations in milliseconds	
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1500;		
			this.state = 0;	
				
			//console.log("posY = " + this.posY);
				
			if(this.options.speaker==="obama") this.trailer="romney";
			else this.trailer = "obama";
		},	
		 
		serialize: function() {
      return { trait: this.trait, speaker: this.speaker, trailer: this.trailer, startPosY: this.posY-96, moreVal: this.moreVal, aVal: this.aVal };
    },

    expand: function() {
   		this.state = 1;	//expanded

   		//Slide lines up into view.
    	this.$el.find('.traitExpText').each(function(i){ 
	    		$(this).delay(i*300).animate({top:"0px"}, 1000); 
    	}); 	
    	//Slide big arrow in.    
    	this.$el.find('.traitSymbolLeft').each(function(){
	    		$(this).animate({left:Ref.gridColumns[4]+'px'}, 1000);
    	});
  
    	this.$el.find('.traitSymbolRight').each(function(){
	    		$(this).animate({left:Ref.gridColumns[2]+'px'}, 1000);
    	});
    
    	//Sit for holdDur, then collapse.
    	window.setTimeout(function(){this.collapse(false);}, this.expandDur + this.holdDur, this);
    }, 
    
    collapse: function(force) {
    	//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  		   
    	var y = this.posY;
    	var collapseD = (force) ? 0 : this.collapseDur;
    	//Shrink text.
    	this.$el.find('.traitExpText').each(function(i){ 
    		$(this).animate({'font-size':'20px', 'line-height':'24px'}, collapseD);
    	}); 
    	//Shrink and move divs.
    	this.$el.find('.traitExpTextHolder').each(function(i){
    		
    		$(this).animate({'left':Ref.gridColumns[0], 'top':y+i*24+'px', 'height':'24px'}, collapseD);
     		
     		//else $(this).animate({'left':Ref.gridColumns[0], 'top':y+i*24+'px', 'height':'24px'}, collapseD);
    		//$(this).animate({'-webkit-transform':'translateZ(1000px)'}, collapseD);   	//Move div forward in Z.	
    		//this.style.webkitTransform = "translateZ(500px)";	//We're using CSS transitions to animate this.
    	
    	});
    	//Shrink and position big arrow.
    	this.$el.find('.traitSymbolLeft').each(function(){
	    		$(this).animate({'font-size':'360px', 'line-height':12*14+'px'}, collapseD/2.);
    	});
    	
    	this.$el.find('.traitSymbolRight').each(function(){
	    		$(this).animate({'font-size':'360px', 'line-height':12*14+'px'}, collapseD/2.);
    	});
    },
    
    afterRender: function() {
	    if (!this.forceCollapse) this.expand();
	    else this.collapse(true);
	    
	    // Tell skrollr about new elements
    	this.$el.find('.container').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	this.$el.find('.traitSymbolLeft').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	this.$el.find('.traitSymbolRight').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	
    	
    	
    	
    }
  });
  
  //Word counts (i.e. 1000th word)
	//-------------------------------------------------------------------------------------
	Overlay.Views.WordCountView = Backbone.View.extend({
		template: "overlays/wordCount",
		
		initialize: function() {
			this.forceCollapse = this.options.forceCollapse;
			this.speaker = this.options.speaker;
			this.count = this.options.count;
			this.word = this.options.word;
			
			this.posY = this.options.posY;
			this.collapseY = this.options.wordPos[1];
			this.wordX = this.options.wordPos[0];// + 160;	//PEND for some reason, 1 column + 1 gutter width has to be added here. Fix transcript.getRecentWordPos(). 
			
			//all durations in milliseconds	
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1000;				
			this.state = 0;	
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
    	window.setTimeout(function(){this.collapse(false);}, this.expandDur + this.holdDur, this);
		},
		
		collapse: function(force) {
			//PEND we'll probably want to tag this onto the end of the animation, so it only gets set after overlay has played out collapse anim.
  		this.state = 0;	//collapsed	
  		   
    	var y = this.posY;
    	var cY = this.collapseY;
    	//console.log("collapse: y="+y+", cY="+cY);
    	var collapseD = this.collapseDur;
    	//Shrink text.
    	this.$el.find('.wordCountText').each(function(i){ 
	      if (force) $(this).css('-webkit-transition', '0s');
    		//$(this).delay((3-i)*50).animate({'font-size':'36px', 'line-height':'36px'}, collapseD);
	    	$(this).css("top","0px");		
    		$(this).css('font-size','36px');
    		$(this).css('line-height','36px');
    	}); 
    	//Shrink word.
    	this.$el.find('.wordCountWord').each(function(i){ 
	      if (force) $(this).css('-webkit-transition', '0s');
    		//$(this).animate({'font-size':'36px', 'line-height':'36px'}, collapseD);	
    		//$(this).css('font-size','36px');
    		//$(this).css('line-height','36px');
    		$(this).css('top', '120px');
    	}); 
    	//Shrink and move divs.
    	var sp = this.speaker;
    	this.$el.find('.wordCountTextHolder').each(function(i){
	      if (force) $(this).css('-webkit-transition', '0s');
    		if(i<3){ //don't move white word
	    		if(sp=="obama"){
		    		//$(this).delay((4-i)*50).animate({'left':Ref.gridColumns[4], 'top':y+i*36+'px', 'height':'36px'}, collapseD);
		    		$(this).css("left", Ref.gridColumns[5]);
		    		$(this).css("top", (cY-(3-i)*36+24)+"px");
		    		$(this).css("height", "36px");
		    	}else{
		    		//$(this).delay((4-i)*50).animate({'left':Ref.gridColumns[2], 'top':y+i*36+'px', 'height':'36px'}, collapseD);
		    		$(this).css("left", Ref.gridColumns[1]);
		    		$(this).css("top", (cY-(3-i)*36+24)+"px");
		    		$(this).css("height", "36px");
		    	}
	    	}
    		//this.style.webkitTransform = "translateZ(500px)";	
    	}); 
    	
    	//Expand line
    	var x = this.wordX;
	    	this.$el.find('.wordCountLine').each(function(i){
	      	if (force) $(this).css('-webkit-transition', '0s');
	    		//$(this).css("top", cY+Ref.transcriptPointSize);
	    		if(sp=="obama"){
		    		$(this).css("width", (Ref.gridColumns[5]+Ref.gridWidth-x));
		    		//console.log("width = "+(Ref.gridColumns[5]-x));
		    	}else{
		    		$(this).css("width", (x-Ref.gridColumns[1]));
		    		//console.log("width = "+(x-Ref.gridColumns[2]));
		    	}  
		    	
	    	});
		},
		
		afterRender: function() {
			if (!this.forceCollapse)
				window.setTimeout(this.expand, 10, this);	//delay is necessary to ensure that initial template CSS has been inserted by render
			else this.collapse(true);
		}
		
	});

	//Numbers 
	//-------------------------------------------------------------------------------------
	Overlay.Views.NumbersView = Backbone.View.extend({
		//defines the html that will be inserted into the div
		template: "overlays/numbers",
		
		initialize: function() {
		
			this.forceCollapse = this.options.forceCollapse;
		
			this.speaker = this.options.speaker;
			this.phrase = this.options.phrase;
			//console.log("numbersView phrase = "+this.phrase);
				
			this.posY = this.options.posY;
      this.collapseY = this.options.wordPos[1];
			this.wordX = this.options.wordPos[0];

			// All durations in milliseconds.
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1500;				
		},
		
		//defines what the view passes to the template to render it
		serialize: function() {
				return { speaker: this.speaker, phrase: this.phrase, posY: this.posY+Ref.overlayEnterY, lineY: this.collapseY+Ref.transcriptPointSize, grid: Ref.gridColumns};
		},
		
		expand: function() {
			this.state = 1;	// Expanded.

   		// Slide word in from side.
      var thisView = this;
    	this.$el.find('.numberPhrase').each(function(i){ 
          window.setTimeout(function() { thisView.speaker == 1 ? $(this).css("left",Ref.gridColumns[0]) : $(this).css("left",Ref.gridColumns[6] - $(this).width()); }, 1, this);
    	});
      
    	// Sit for holdDur, then collapse.
    	window.setTimeout(function() {this.collapse(false);}, this.expandDur + this.holdDur, this);
		},
		
		collapse: function(force) {

  		this.state = 0;	// Collapsed.	
       
      var _posY = this.posY;
      var sp = this.speaker;
      this.$el.find('.numberPhrase').each(function(i){ 
	      if (force) $(this).css('-webkit-transition', '0s');
	      
	      $(this).css("font-size","54px");
	      $(this).css("height", "72px");
	      
	      
	      
	      //$(this).css("font-size","18px");
	      //$(this).css("height", "24px");
	      //$(this).css("width", Ref.gridWidth);
	      $(this).css("top", (_posY) + 'px');  // Center on line
	      $(this).css("color", "rgb(80,80,80)");
	      if(sp == 1){
	        $(this).css("left", Ref.gridColumns[4]);
	        //$(this).css("left", Ref.gridColumns[0]);
	      }
	      else if(sp == 2){
	        $(this).css("left", Ref.gridColumns[3] - Ref.gutterWidth - 296);
	        //$(this).css("left", Ref.gridColumns[0]);
	        $(this).css("width", "296px");
	        $(this).css("text-align", "right");
	      }
	      else 
	      {
		      $(this).css("left", Ref.gridColumns[0]);
		      $(this).css("width", "296px");
		      $(this).css("text-align", "right");
	      }
	        //console.log(sp);
	        //console.log( (this.anchorY - 18) + 'px'));

    	});
  		   
    	
    },
		
    afterRender: function() {
    	// Tell skrollr about new elements
    	this.$el.find('.numberPhrase').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	    	
			if(!this.forceCollapse) this.expand();
			else this.collapse(true);
		}
		
	});

	// Quotes
	//-------------------------------------------------------------------------------------
	Overlay.Views.QuotesView = Backbone.View.extend({
		template: "overlays/quotes",
		
		initialize: function() {
			this.forceCollapse = this.options.forceCollapse;
		
			this.speaker = this.options.speaker;
			this.phrase = this.options.phrase;
			
			this.anchor = this.options.anchor;

      //all durations in milliseconds	
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1500;
			this.state = 0;					
		},
		
		serialize: function() {
				return { speaker: this.speaker, phrase: this.phrase, posY: this.anchor.top, anchor: this.anchor, grid: Ref.gridColumns};
		},
		
		expand: function() {
			this.state = 1;	//expanded
      
   		//Slide word in from side.
      // TODO: Get the positioning of this just right. Warning: Magic numbers abound!
      var thisView = this;
      var quoteHeight = this.$el.find('.quotePhrase').height();
     
    	this.$el.find('.quotePhrase').each(function(i){ 
          window.setTimeout(function() {
            thisView.speaker == 1 ? $(this).css("left",Ref.gridColumns[0]) : $(this).css("left",Ref.gridColumns[1]);
            $(this).css("top", "-=" + (quoteHeight+100) + "px");
          }, 1, this);
    	});
    	this.$el.find('.quoteLeftQuote').each(function(i){ 
          window.setTimeout(function() { $(this).css("left", (thisView.speaker == 1 ? Ref.gridColumns[0] : Ref.gridColumns[2])); }, 1, this);
          //$(this).css("top", "-=180px");
    	});
    	this.$el.find('.quoteRightQuote').each(function(i){ 
          window.setTimeout(function() {
            $(this).css("left", (thisView.speaker == 1 ? Ref.gridColumns[4] : Ref.gridColumns[6]));
            //$(this).css("top", "+=" + (quoteHeight - 240) + "px");
          }, 1, this);
    	});
      
    	
    	//Sit for holdDur, then collapse.
    	window.setTimeout(function() {this.collapse(false);}, this.expandDur + this.holdDur, this);
		},
		
		collapse: function(force) {
  		this.state = 0;	//collapsed	
       
      var _posY = this.anchor.top;
      var sp = this.speaker;
      this.$el.find('.quotePhrase').each(function(i){ 
	      if (force) $(this).css('-webkit-transition', '0s');
	      $(this).css("font-size","54px");
	      $(this).css("width", Ref.gridWidth);
	      $(this).css("top", (_posY - 18) + 'px');  // Center on line
	      if(sp == 1)
	        $(this).css("left", Ref.gridColumns[4]);
	      else if(sp == 2)
	        $(this).css("left", Ref.gridColumns[2]);
    	});
      this.$el.find('.quoteLeftQuote').each(function(i){ 
	      if (force) $(this).css('-webkit-transition', '0s');
        $(this).css("font-size","180px");
        $(this).css("top", (_posY - 60) + 'px');  // Center on line
        $(this).css("left", (Ref.gridColumns[(sp == 1 ? 0 : 1)]) + 'px');
    	});  		   
      this.$el.find('.quoteRightQuote').each(function(i){   
	      if (force) $(this).css('-webkit-transition', '0s');
        $(this).css("font-size","180px");
        $(this).css("top", (_posY - 38) + 'px');  // Center on linea
        $(this).css("left", (Ref.gridColumns[(sp == 1 ? 0 : 1)] + 70) + 'px');
    	});  		   
      
    	
    },		
		
    afterRender: function() {
			if (!this.forceCollapse) this.expand();
			else this.collapse(true);
			
			// Tell skrollr about new elements
    	this.$el.find('.quotePhrase').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	this.$el.find('.quoteLeftQuote').each(function(i){ 
    		app.skrollr.refresh(this);
    	});
    	this.$el.find('.quoteRightQuote').each(function(i){ 
    		app.skrollr.refresh(this);
    	});			
		}
		
	});

	
	//Longest sentence
	//-------------------------------------------------------------------------------------
	Overlay.Views.LongSentenceView = Backbone.View.extend({
		template: "overlays/longSentence",
		
		initialize: function() {
			this.forceCollapse = this.options.forceCollapse;
			this.speaker = this.options.speaker;
			this.charCount = this.options.charCount;
			this.wordCount = this.options.wordCount;
			
			this.posY = this.options.posY;
			//all durations in milliseconds	
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1500;
			this.state = 0;					
		},
		
		serialize: function() {
			return { speaker: this.speaker, charCount: this.charCount, wordCount: this.wordCount };
		},
		
		expand: function() {
			
		},
		
		collapse: function(force) {
			
		},
		
		afterRender: function() {
			if (!this.forceCollapse) this.expand();
			else this.collapse(true);
		}
		
	});

	
	//Sentiment (aka Neg/Pos burst)
	//-------------------------------------------------------------------------------------
	Overlay.Views.SentimentView = Backbone.View.extend({
		template: "overlays/emoburst",
		
		initialize: function() {

			this.forceCollapse = this.options.forceCollapse;
			this.speaker = this.options.speaker;
			this.type = this.options.polarity;		//posemo or negemo
      this.strength = this.options.strength;
			
			this.posY = this.options.anchor.top;
      this.posX = this.speaker == 1 ? Ref.gridColumns[4] : Ref.gridColumns[1];
      this.anchor = this.options.anchor;
			//all durations in milliseconds	
			this.expandDur = 2*300 + 1000;		
			this.holdDur = 3000;								
			this.collapseDur = 1500;				
			this.state = 0;
			
      this.newSigns = [];
      this.nSigns = 0;
		},
		
		serialize: function() {
			return { speaker: this.speaker, type: this.type, gridColumns: Ref.gridColumns, posY: this.posY+Ref.overlayEnterY/2, posX: this.posX };
		},
		
		expand: function() {
			this.state = 1; 
			
			//PEND: WHAT SHOULD THE CONTAINER BE?
      var container = $(this.$el.find('.container')[0]);
      this.nSigns = (Math.random() * 3 + 7) * (this.type == 'posemo' ? 1 : 2); // 5-15 random + or - signs
      var signChar = this.type == 'posemo' ? '+' : '-';
      signChar = this.type == 'posemo' ? "<div class='plusSignA' /><div class='plusSignB'>" : "<div class='negativeSign' />";
      for(var i=0; i<this.nSigns; i++) {
        var startPos = "left: " + (this.posX-150) + "px; top: " + (this.posY+Ref.overlayEnterY/2-125) + "px;";
        var newSign = $("<div class='emoSign " + this.type + "' style='" + startPos + "'>" + signChar + "</div>");
        $(container.append(newSign));
        this.newSigns.push(newSign);
      }
      
      // Just a 1ms delay so the properties animate in
      window.setTimeout(function() {
        this.$el.find('.emoTextBig').css({'opacity': 1, 'font-size': 120});
        for(var i=0; i<this.nSigns; i++) {
          var flipOut = Math.random() > 0.8;
          var translateX = (Math.random() - 0.5) * (flipOut ? 3000 : 500);
          var translateY = (Math.random() - 0.5) * (flipOut ? 1000 : 100);
          var transform = 'scale(1) translate(' + translateX + 'px, ' + translateY + 'px) rotate(' + (Math.random()*360) + 'deg)';
          // Random transition time
          this.newSigns[i].css('-webkit-transition', '-webkit-transform ' + (Math.random()*2+1) + 's, opacity 1s');
          this.newSigns[i].css({'-webkit-transform': transform});
          this.newSigns[i].css('opacity',1); 
        }
      }, 1, this);

      //Sit for holdDur, then collapse.
    	window.setTimeout(function() {this.collapse(false);}, this.expandDur + this.holdDur, this);
		},
		
		collapse: function(force) {

			this.state = 0;
			
	    if (force) this.$el.find('.emoTextBig').css('-webkit-transition', '0s');
      this.$el.find('.emoTextBig').css({'opacity': 0, 'font-size': 120});
      for(var i=0; i<this.nSigns; i++) {
        var flipOut = Math.random() > 0.8;
        var translateX = (Math.random() - 0.5) * (flipOut ? 3000 : 500);
        var translateY = (Math.random() - 0.5) * (flipOut ? 1000 : 100);
        var transform = 'rotate(' + (Math.random()*360) + 'deg) translate(' + translateX*10 + 'px, ' + translateY*10 + 'px) scale(3)';
        // Random transition time
        if (force) this.newSigns[i].css('-webkit-transition', '0s');
        this.newSigns[i].css('-webkit-transition', '-webkit-transform ' + (Math.random()*2+1) + 's, opacity 1s');
        this.newSigns[i].css({'-webkit-transform': transform});
        this.newSigns[i].css('opacity',0); 
      }

      // Do some cleanup after all elements are gone
      window.setTimeout(function() {
        this.$el.find('.emoTextBig').remove();
        for(var i=0; i<this.nSigns; i++) {
          this.newSigns[i].remove();
        }
        this.newSigns = [];
      }, 1000, this);      
	    
      // Fade in small text
	    if (force) this.$el.find('.emoTextSmall').css('-webkit-transition', '0s');
      this.$el.find('.emoTextSmall').css({'opacity': 1, 'top' : this.posY});

		},
		
		afterRender: function() {
			if (!this.forceCollapse) this.expand();
			else this.collapse(true);
			// Add to skrollr lib.
			this.$el.find('.emoTextSmall').each(function(){
				app.skrollr.refresh(this);				
			});
		}
		
	});
	
	// Resuable Categories 
	//-------------------------------------------------------------------------------------  
  Overlay.Views.CatView = Backbone.View.extend({
  	 template: "overlays/category",
  			 
		 initialize: function() {
			this.category = this.options.category;
			this.title = this.options.title;
	    //this.$el.css('left', Ref.gridColumns[0]+'px');
	    this.$el.css('top', (2*Ref.transcriptLeading) +'px');
	    this.$el.css('position', 'fixed');
	    this.$el.css('z-index', '12');
		 },	
		 
		 serialize: function() {
      return { category: this.category, title: this.title };
    },
    
    expand: function() {
      this.$el.css('display','block'); // Setting opacity alone still blocks mouse interactions.    
      window.setTimeout(function(){
   	   this.$el.find('.categoryOverlayText').each(function(){
	  	 	$(this).css('top', '0px');
	  	 });
	  	}, 10, this);
    },
    
    collapse: function() {
      this.$el.find('.categoryOverlayText').each(function(){
	      $(this).css('top', '90px');
	    });
	    window.setTimeout(function(){
	  	 	$(this).css('display', 'none');
	  	}, 500, this);	
    },
    
    hide: function() {
      this.$el.find('.categoryOverlayText').each(function(){
	      $(this).css('top', '90px');
	    });
	    $(this).css('display', 'none'); 	 	
    },
    
    afterRender: function() {
	    this.hide();
	    // Add to skrollr manager.
	    //this.$el.find(".categoryOverlay").each(function(){
	    //	app.skrollr.refresh(this);		    
	    //});
    }
  });
	

  // Return the module for AMD compliance.
  return Overlay;

});
