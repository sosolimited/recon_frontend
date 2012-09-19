define([
  // Application.
  "core/app",
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
                     

  // Default model.
  MarkupManager.Model = Backbone.Model.extend({
  
  	defaults: function() {
  		return {
  			overlays: []
  		}	
  	},
  	
	  initialize: function () {
		  app.on("markup:frequentWord", this.markupFrequentWord, this);		//TEMP
		  app.on("markup:wordCount", this.addWordCountOverlay, this);
		  app.on("markup:sentenceLead", this.addTraitOverlay, this);		  	//LM, is this psych traits? 
		  app.on("markup:quote", this.addQuoteOverlay, this);
		  app.on("markup:sentenceSentiment", this.addSentimentOverlay, this);
		  //for testing
		  app.on("keypress:test", this.test, this);
		  //app.on("transcript:sentenceOpen", this.sentenceTest, this);
	  },
	  
	  cleanup: function() {
		  app.off(null, null, this);
	  },
	  
	  addOverlay: function(args) {
		  console.log("markupManager:addOverlay "+args['type']+" "+args['speaker']);
		  
	  },
	  
	  addSentimentOverlay: function(args) {
		  
		  
	  },
	  
	  addTraitOverlay: function(args) {
		  var traitsOverlay = new Overlay.Views.TraitView({trait: "FORMAL", leader: "obama", posY: parseInt(this.attributes.transcript.getCurSentencePosY())});
			$('#overlay').append(traitsOverlay.el);
			traitsOverlay.render();
	  },
	  
	  addQuoteOverlay: function(args) {
		  
		  
	  },
	  
	  addWordCountOverlay: function(args){
		  
		  
	  },
	  
	  markupFrequentWord: function(args) {
		  // Skip common words
      if($.inArray(args['word'].toLowerCase(), commonWords) > -1) return false;

		  // Add a class named "frequentWord" and a "data-wordcount" attribute to
      // words in the current sentence. DOM elements are created in transcript
      // when the sentence is complete.
	  	$('#curSentence').children().each(function() {
		  	if($.trim($(this).text()).toLowerCase() == $.trim(args['word']).toLowerCase()){ 
		  		$(this).addClass('frequentWord');
          $(this).attr("data-wordcount", args['count']);
		  	}
	  	});
	  },
	  
	  annotateTranscript: function() {
	  
	  },
	  
	  // For testing things with keypresses.
	  test: function(args) {
		  if(args['type']=="overlay"){
			  if(args['kind']=="trait"){
				 		console.log("test - trait overlay");			  
				 		this.addTraitOverlay();
			  }else if(args['kind']=="wordCount"){
				 		console.log("test - wordCount overlay");			  
			  }
		  }
	  },
	  //Testing sentence positioning
	  /*
	  sentenceTest: function() {
	  	console.log("sentenceTest");
		  $('#overlay').append("<hr style= 'position:absolute; font-size: 12px; top:" + parseInt(this.attributes.transcript.getCurSentencePosY() + 24) + "px;'></hr>");
	  }
	  */
	  
  });

 
  // Return the module for AMD compliance.
  return MarkupManager;

});
