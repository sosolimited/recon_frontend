define([
  // Application.
  "core/app",
  "modules/overlay"
],

// Map dependencies from above array.
function(app, Overlay) {

  // Create a new module.
  var Transcript = app.module();
  var curSpeaker = -1;
  var speakers = ["Moderator", "Obama", "Romney"];
  var openSentence = null;
  var openParagraph = null;

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  
  });

  Transcript.View = Backbone.View.extend({

    addWord: function(word) {
    
    	var s = "";

      var col=1;
    		
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", word["id"]);

   			if(curSpeaker==0) col = 2;	//obama
    		else if(curSpeaker==2) col = 3;	//romney
    		
    		if (openSentence) this.endSentence();
    		if (openParagraph) this.endParagraph();	    		
    		
    		this.$el.children().first().append("<div id=curParagraph class='push-" + col + " span-3 " +
          speakers[curSpeaker] + "'><h1 class='franklinMedIt gray80'>" +
          speakers[curSpeaker] + "</h1><p class='metaBook gray80'></p></div><div class=clear></div>");
          
    		openParagraph = true;
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph p').append("<span id=curSentence></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	$('#curSentence').append("<span id="+word["id"]+">"+s+word["word"]+"</span>"); // add word
    	
    	
    	//EG Testing trait overlay.
    	if (word["word"]=="news"){
    	  console.log("Testing trait overlay");
	    	//this.insertView(new Overlay.Views.TraitView({trait: "FORMAL", leader: "obama"}));
				var traitsOverlay = new Overlay.Views.TraitView({trait: "FORMAL", leader: "obama"});
				$('#overlay').append(traitsOverlay.el);
				traitsOverlay.render().then(function() { traitsOverlay.expand(); } );
			}    	
		},
    
    endSentence: function() {
    	$('#curSentence').removeAttr('id');
    	openSentence = false;
    },
    
    endParagraph: function() {
    	$('#curParagraph').removeAttr('id');
    	openParagarph = false;
    }
  });

  // Return the module for AMD compliance.
  return Transcript;

});
