define([
  // Application.
  "app",
  "modules/overlay",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Overlay, Ref) {

	// This module listens for special events and marks up the transcript - directly or by creating one of several overlay views.
	// It will also listen to transcript scroll events and manage the parallax positioning of the overlays.
	// In addition, it will listen to window resize events and update the overlay positions.
	var MarkupManager = app.module();

  // 60 most common English words from Wikipedia, with lexemes expanded manually
  // This array is ordered, so you can eliminate only the n most common words if you need to
  var commonWords = ["the", "be", "are", "is", "were", "was",
                     "to", "of", "and", "a", "an", "in", "that",
                     "have", "has", "having", "i", "it", "its", "it's",
                     "for", "not", "on", "with", "he",
                     "as", "you", "do", "does", "doing", "did",
                     "at", "this", "but", "his", "by",
                     "from", "they", "we", "say", "says", "saying", "said",
                     "her", "she", "or", "an",
                     "will", "won't", "my", "one", "all", "would", "there", "their",
                     "what", "so", "up", "out", "if", "about", "who", "whome",
                     "get", "got", "gets", "which", "go", "goes", "going", "went",
                     "me", "when", "make", "makes", "making", "made", "can", "can't",
                     "like", "likes", "time", "times", "no", "just", "him",
                     "know", "knows", "knowing", "knew", "take", "takes"];
                     

  MarkupManager.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			"overlays":[]
  		}	
  	},
  	
	  initialize: function () {
		  app.on("markup:frequentWordMarkup", this.markupFrequentWord, this);		
		  app.on("markup:wordCountMarkup", this.addWordCountOverlay, this);			
		  app.on("markup:sentenceLead", this.addTraitOverlay, this);		  	
		  app.on("markup:quote", this.addQuoteOverlay, this);
		  app.on("markup:sentimentBurst", this.addSentimentOverlay, this);
		  app.on("markup:number", this.addNumberOverlay, this);		
		  //app.on("body:scroll", this.handleScroll, this);	//EG Testing requestAnimFrame for this.
		  //for testing
		  app.on("keypress:test", this.test, this);
		  app.on("markup", this.addOverlay, this);			
		  app.on("markup:sentenceLead", this.addTraitOverlay, this);		  	// EG FIXME convert to "markup", type="sentenceLeadMarkup" style.
      // TODO: Merge these markup message changes better
	  },
	  
	  cleanup: function() {
		  app.off(null, null, this);
	  },
	  
	  // All overlay events get funnelled through this function.
	  addOverlay: function(args) {
	  	//console.log("markupManager.addOverlay(" + args['type'] + ")");

	  	if(!this.isAnyOverlayExpanded()){
			  if(args['type']=="wordCountMarkup"){
				  this.addWordCountOverlay(args);			  
			  }
			  else if(args['type']=="numberMarkup"){
				  this.addNumberOverlay(args);			  
			  }
			  else if(args['type']=="quoteMarkup"){
				  this.addQuoteOverlay(args);			  
			  }
		  }
	  },
	  
	  isAnyOverlayExpanded: function() {
		  for(var i=0; i<this.get("overlays").length; i++){
				if(this.get("overlays")[i].state == 1)
					return true;  	 			  
		  }
		  return false;		  
	  },
	  
	  // Functions for adding specific overlays.
	  // -----------------------------------------------------------------------------------
	  addSentimentOverlay: function(args) {
		  var sentimentOverlay = new Overlay.Views.SentimentView(args);
		  $('#overlay').append(sentimentOverlay.el);
      sentimentOverlay.render();
	  },
	  
	  addTraitOverlay: function(args) {
		  var traitsOverlay = new Overlay.Views.TraitView({ trait: "FORMAL", leader: "obama", posY: parseInt(this.attributes.transcript.getCurSentencePosY()) });
			$('#overlay').append(traitsOverlay.el);
			traitsOverlay.render();
			
			this.get("overlays").push(traitsOverlay);			
	  },
	  
	  addQuoteOverlay: function(args) {
      var quoteOverlay = new Overlay.Views.QuotesView(args);
			//console.log("Anchor: " + args['anchor'].top);
      $('#overlay').append(quoteOverlay.el);
			quoteOverlay.render();		  
			
			this.get("overlays").push(quoteOverlay);			
	  },
	  
	  addWordCountOverlay: function(args){
	  	//console.log("markupManager.addWordCountOverlay, collapseY = "+this.attributes.transcript.getRecentWordPosY(args['word']));	  	
		  var wordCountOverlay = new Overlay.Views.WordCountView({ speaker: args['speaker'], count: args['count'], word: args['word'], posY: parseInt(this.attributes.transcript.getCurSentencePosY()), wordPos: this.attributes.transcript.getRecentWordPos(args['word']) });
		  $('#overlay').append(wordCountOverlay.el);
		  wordCountOverlay.render();	
		  
		  this.get("overlays").push(wordCountOverlay);			
	  },
	  
	  addNumberOverlay: function(args){
		  	//console.log("addNumberOverlay: "+args['speaker']+", "+args['phrase']);
        var numbersOverlay = new Overlay.Views.NumbersView({ speaker: args['speaker'], phrase: args['phrase'], posY: args['anchor'].top, wordPos: args['anchor'] });
  		  $('#overlay').append(numbersOverlay.el);
	      numbersOverlay.render();
        //console.log("Number alert: " + args['phrase']);
        
        this.get("overlays").push(numbersOverlay);			
	  },
	  
 	  // -----------------------------------------------------------------------------------
	  	  
	  handleScroll: function(val) {
 			 //console.log("markupManager.handleScroll("+val+")");
			 $('.wrapper').css("webkit-perspective-origin", "50% "+(val+500)+"px");
	  },
	  
	  enter: function() {
	    $('#overlay').css("visibility", "visible");
    },
    
    exit: function() {
	    $('#overlay').css("visibility", "hidden");	    
    },
    
    // Reset puts everything where it's supposed to be before entering.
    reset: function() {
	    $('#overlay').css("visibility", "hidden");	    
    },
    
    // For testing things with keypresses.
	  test: function(args) {
		  if(args['type']=="overlay"){
			  if(args['kind']=="trait"){
				 		console.log("test - trait overlay");			  
				 		this.addTraitOverlay();
			  }else if(args['kind']=="wordCount"){
				 		console.log("test - wordCount overlay");			  
				 		//this.addWordCountOverlay();
			  }
		  }
		  else if(args['type']=="testParallax"){
				//inserg some test objects
				//console.log("testParallax");
				
				for(var y=0; y<10; y++){
				  for(var i=0; i<6; i++){	
				  
				  $('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:" + Ref.gridZn200['grid'][i] + "px; top:" + (y*600 + 600) + "px; -webkit-transform: translateZ(-200px); background-color:blue;'>" + i + "</span>");
				  	
				  	$('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:" + Ref.gridZ100['grid'][i] + "px; top:"  + (y*600 + 600) + "px; -webkit-transform: translateZ(100px); background-color:yellow;'>" + i + "</span>");
				  	
				  	$('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:" + Ref.gridZ200['grid'][i] + "px; top:"  + (y*600 + 600) + "px; -webkit-transform: translateZ(200px); background-color:red;'>" + i + "</span>");
				  
				  /*
				  //EG testing with translateX instead of left for x position
				  $('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:0px; -webkit-transform:translateX(" + Ref.gridZn200['grid'][i] + "px); top:" + (y*600 + 600) + "px; -webkit-transform: translateZ(-200px); background-color:blue;'>" + i + "</span>");
				  	
				  	$('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:0px; -webkit-transform:translateX(" + Ref.gridZ100['grid'][i] + "px); top:"  + (y*600 + 600) + "px; -webkit-transform: translateZ(100px); background-color:yellow;'>" + i + "</span>");
				  	
				  	$('#overlay').append("<span id='testZ" + (i+1) + "' class='testZ' style='left:0px; -webkit-transform:translateX(" + Ref.gridZ200['grid'][i] + "px); top:"  + (y*600 + 600) + "px; -webkit-transform: translateZ(200px); background-color:red;'>" + i + "</span>");
				  	*/	  
				  }	
			  }
		  }
	  }
	  
  });

 
  // Return the module for AMD compliance.
  return MarkupManager;

});
