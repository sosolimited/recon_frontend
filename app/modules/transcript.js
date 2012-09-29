define([
  // Application.
  "app",
  "modules/overlay",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Overlay, Ref) {

  // Create a new module.
  var Transcript = app.module();
  
  var curSpeaker = -1;
  var speakers = ["Moderator", "Obama", "Romney"];
  var openSentence = null;
  var openParagraph = null;
  var scrollLive = true;		
  var lastScrollHeight = 0;
  var scrollAnimating = false;

  var oldScrollTop = 0;
  var oldWindowHeight = 0;

  // Store top + bottom positions of paragraphs so they don't need to be recalculated all the time
  var paragraphPropertyCache = [];

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  		
  });

  Transcript.View = Backbone.View.extend({
    
    initialize : function() {
      app.on("message:word", this.addWord, this);
      app.on("message:sentenceEnd", this.endSentence, this);
      app.on("body:scroll", this.handleScroll, this);
      app.on("navigation:goLive", this.reattachLiveScroll, this);

      var thisTranscript = this;
      $(window).resize(function() {
        //if(scrollLive) { thisTranscript.reattachLiveScroll(0) };
        var heightChange = $(window).height() - oldWindowHeight;
        //console.log(heightChange);
        $('body').scrollTop(oldScrollTop - heightChange);
        oldWindowHeight = $(window).height();
        oldScrollTop = $('body').scrollTop();
      });
      
      this.numberOpen = false;
      this.numberCount = 0;		
      this.numberWords = 2;		// Number of words to catch in number phrase, including first numerical word.
      this.numberPhrase = "";
      
  	},

    events : {
    },
  	
    cleanup: function() {
	    app.off(null, null, this);
    },

    addWord: function(args) {
    
	    var word = args['msg'];
	      	    	
	    
	    // Add to transcript.
	    // ---------------------------------------------------------------------
    	var s = "";

      var col=1;
    		
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    		
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", {msg:word});

        this.startParagraph(word);
    	}
    	
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph p').append("<span id=curSentence class='transcriptSentence'></span>"); // add sentence span wrapper
    		//console.log("curSentence appended");
    		//app.trigger("transcript:sentenceOpen");	//testing for markup manager
    		openSentence = true;
    	}
    	
    	if (!word["punctuationFlag"]) s += " "; // add leading space
    	
    	//$('#curSentence').append("<span id="+word["id"]+" class='transcriptWord'>"+s+word["word"]+"</span>");
      $('#curSentence').append(s+word["word"]); // Don't make every word a span.
      
      // Update the paragraph size cache
      $('#curParagraph').attr('data-bottom', parseInt($("#curParagraph").attr('data-top')) + $("#curParagraph").height());
      $('#curParagraph').attr('data-end', word['timeDiff']);

      this.keepBottomSpacing();

      // Autoscroll the window the keep up with transcript
      // ----------------------------------------------------------------------
      if(scrollLive && !Ref.disableAutoScroll) {
        var scrollTo = this.transcriptBottom() - $(window).height();
        //var scrollTo = $(document).height() - $(window).height();
        if(scrollTo != lastScrollHeight && !scrollAnimating) {  // Only trigger autoscroll if needed
          //console.log("scrolling to: " + scrollTo);
          var duration = Math.abs(lastScrollHeight - scrollTo) * 3.0;
          scrollAnimating = true;
          $("body").animate({ scrollTop: scrollTo}, duration, function() { scrollAnimating = false;});
          app.trigger("transcript:scrollTo", word["timeDiff"]); 
          lastScrollHeight = scrollTo;
        }
      }           
      //$('#curSentence').css("margin-bottom", $('#curSentence').height() - Ref.overlayOffsetY);
      
      // Check for special categories and emit events.
      // Note: Gotta do this stuff after word has been added to DOM.
	    // ---------------------------------------------------------------------
    	// Say (said, say, saying, etc).
    	if ($.inArray('say', word['cats']) != -1) {
	    	app.trigger("markup:quote", {type:'quote', speaker:word['speaker']});
    	}
    	
    	// Numerical.
    	// 'number' for numerics, 'numbers' for LIWC
    	if (($.inArray('number', word['cats']) != -1) || ($.inArray('numbers', word['cats']) != -1)) {
    		//console.log("transcript - got a number!");
    		if (!this.numberOpen){
	    		this.numberOpen = true;
	    	}
    	}
    	if (this.numberOpen){
    		// Update count and phrase.
    		this.numberCount =  this.numberCount+1;
    		if(!word['punctuationFlag']) this.numberPhrase += " ";	// Insert a space in phrase if it's not punctuation.
    		this.numberPhrase += word['word'];
 
    		
    		// When we have the correct number of words in the phrase,
    		if(this.numberCount >= this.numberWords){
    			this.emitNumberEvent(word['word']);
    		}
    	}
    	//EG for testing pos word counts
    	if ($.inArray('posemo', word['cats']) != -1) {
    		 app.trigger("markup:posemo", {type:'posemo', speaker:word['speaker'], word:word['word']});
    	}


      return false;
    },
    
    endSentence: function(args) {
      // Style words that have been tagged (with classes) by MarkupManager.
      // --------------------------------------------------------------------------

      // Frequent words are marked by a class named "frequentWord"
      // and have an attribute "data-wordcount" added by markupManager
      var mainEl = this.$el;
      
      //Go through all spans so you can create markup heirarchy (ie specify which markups take precedence)  
      $('#curSentence').find('span').each(function() {
      	 // EG Testing posemo counts
      	 if($(this).hasClass("posemoMarkup")){
	      	 $(this).css("color", "rgb(255,0,0)");
      	 }
	     	 // Word count markup.
	     	 else if($(this).hasClass("wordCountMarkup")){	
	     	   $(this).css("color", "rgb(207,255,36)");
	     	   $(this).css("text-decoration", "underline");	    	
	     	 }
	     	 // Number markup.
	     	 else if($(this).hasClass("numberMarkup")){
	     	 		$(this).css("color", "rgb(255,157,108)");	    	    		
	     	 }
	     	 // Frequent word markup.
	     	 else if($(this).hasClass("frequentWordMarkup")){
			     	//$(this).css("color", "rgb(100,100,100)");	
		    		$(this).css("border-bottom", "1px solid white");	//To do different color underline.
		    		
		    		//$(this).css("text-decoration-color", "rgb(255,255,255)");	
		        var count = $(this).attr("data-wordcount");
		        if(count != undefined) {
		          // Add a div at this point and animate it inCannot read property 'top' of null 
		          var pos = $(this).position();
		          var wordWidth = $(this).width();
		          var lineHeight = $(this).height();
		          var container = $("<div class='wordCountFrame' style='left: " + (pos.left + wordWidth) + "px; top: " + (pos.top - lineHeight/2) + "px;'></div>");
		          var countDiv = $("<div class='wordCount'>" + count + "</div>");
		          container.append(countDiv);
		          $(this).parent().append(container);
		          countDiv.animate({top: '0px'}, 300);
		        }  	     	 
	     	 }
	     	 
	      
      });
  
    	
    	//------------------------------------------------------------------------------
    
      // If any numbers are open, close them.
		  if (this.numberOpen) this.emitNumberEvent();

    	// Keep track of last sentence as well as current one.
      if($('#lastSentence').length > 0) $('#lastSentence').removeAttr('id');
      $('#curSentence').attr('id', 'lastSentence');
      // Close this sentence, start a new one.      
    	//$('#curSentence').removeAttr('id');	// Done with line above now.
    	
    	openSentence = false;
    	if (args)
	    	app.trigger("markup:sentenceSentiment", {type:'sentenceSentiment', speaker:args['msg']['speaker'], sentiment:args['msg']['sentiment']});
    },

    startParagraph : function(msg) {
      var curSpeaker = msg["speaker"];
      if(curSpeaker==0) col = 2;	//obama
  		else if(curSpeaker==2) col = 3;	//romney
      else col = 1; // ???
    		
  		if (openSentence) this.endSentence();
  		if (openParagraph) this.endParagraph();	    		
    		
  		var newP = $("<div id='curParagraph' class='push-" + col + " span-3 " +
                   speakers[curSpeaker] + " transcriptParagraph'><h1 class='franklinMedIt gray60'>" +
                   speakers[curSpeaker] + "</h1><p class='metaBook gray60'></p></div><div class=clear></div>");                   
      this.$el.append(newP);
      
      // Cache position in data attributes
      newP.attr('data-top', newP.offset().top);
      newP.attr('data-bottom', newP.offset().top + newP.height());
      newP.attr('data-start', msg["timeDiff"]);
      newP.attr('data-end', msg["timeDiff"]+1);

      openParagraph = true;
    },

    endParagraph: function() {
    	console.log("endParagraph");
      // Update attributes to cache position properties
      $('#curParagraph').attr('data-top', $("#curParagraph").offset().top);
      $('#curParagraph').attr('data-bottom', $("#curParagraph").offset().top + $("#curParagraph").height());

      // When #curParagraph height goes to 'auto', the page collapses and scroll jumps up
      // So save the height with a temporary div!
      if($('#saveTheHeight').length == 0)
        $('body').append("<div id='saveTheHeight' style='position: absolute; width:100%; height:2px; z-index:-100; left: 0;'></div>");

      var screenBottom = this.transcriptBottom();
      $('#saveTheHeight').offset({'left':0, 'top':screenBottom});
      $('#curParagraph').css('height', 'auto'); // No more offset
    	$('#curParagraph').removeAttr('id');
    	openParagraph = false;
    },
    
    // Replaces word with span and adds className to it if there is one.
    addSpanToRecentWord: function(word, className) {
    	//console.log("transcript.addSpanToRecentWord("+word+", "+className+")");
	    var cS = $('#curSentence');
	    //console.log("text = "+cS.text());
	    cS.html(cS.text().replace($.trim(word), "<span class="+className+">"+$.trim(word)+"</span>"));	    
    },
        
    getCurSentence: function() {
	    //if($('#curSentence').length > 0){
		    return $('#curSentence');		//If it doesn't exist, just returns empty jQuery object, (caller is responsible for iterating over elements)
	    //}else{
		  //  return null;
	    //}
    },
    
    getLastSentence: function() {
	    return $('#lastSentence');	    
	  },

    getCurSentencePosY: function() {
      // Do some error-checking in case #curParagraph or #curSentence don't exist
      var paraTop = $('#curParagraph').length > 0 ? $('#curParagraph').position().top : 0;
      var sentenceTop = $('#curSentence').length > 0 ? $('#curSentence').position().top : 0;
	    return (this.$el.scrollTop() + paraTop + sentenceTop);
    },
   
   	/* 
    // Return y position in transcript of associated word span.
    getRecentWordPosY: function(word) {
    	var wordEl;
    	$('#curSentence').children().each(function() {
		  	if($.trim($(this).text()).toLowerCase() == $.trim(word).toLowerCase()){
		  		wordEl = $(this);
		  	}
		  });
		  return (this.$el.scrollTop() + $('#curParagraph').position().top + wordEl.position().top);
    },
    */
    // Return position (array) in transcript of associated word span.
    getRecentWordPos: function(word) {
    	var wordEl;
    	$('#curSentence').children().each(function() {
		  	if($.trim($(this).text()).toLowerCase() == $.trim(word).toLowerCase()){
		  		wordEl = $(this);
		  	}
		  });
		
			// Note, the x position of the paragraph is got from the left margin, cus that's how the grid is set up.	  
		  try {
        return [(parseInt($('#curParagraph').css("margin-left")) + wordEl.position().left),
	  							(this.$el.scrollTop() + $('#curParagraph').position().top + wordEl.position().top)];
      }
      catch (e) {
        console.log(e);
        return 0;
      }
    },
    
    emitNumberEvent: function(word) {
      var anchorPos;
      word = this.numberPhrase;
      if(word != null) {
      	var cS = $('#curSentence');
	      cS.html(cS.text().replace($.trim(word), "<span id='positionMarker'></span>"+$.trim(word)));
        anchorPos = $('#positionMarker').offset();
        $('#positionMarker').remove();
      }
      else anchorPos = $('#curSentence').offset();

    	// Emit an event
			app.trigger("markup:number", {type:'number', speaker:curSpeaker, phrase:this.numberPhrase, anchor:anchorPos});	
			// Close the number.
			this.numberOpen = false;
			this.numberCount = 0;
			this.numberPhrase = "";
    },
    
    keepBottomSpacing : function() {
      // Make sure there is adequate space below the current sentence
      var sentenceTop, sentenceHeight;
      if($('#curSentence').length <= 0) { sentenceTop = 0; sentenceHeight = 0; }
      else {
        sentenceTop = $('#curSentence').offset().top;
        sentenceHeight = $('#curSentence').height();
      }

      if($('#curParagraph').length > 0) {
        var newHeight = sentenceTop - $('#curParagraph').offset().top + Ref.overlayOffsetY;

        // If the sentence is too long, force a scroll
        if(sentenceHeight > Ref.overlayOffsetY) newHeight += sentenceHeight - Ref.overlayOffsetY;
        
        if(newHeight > $('#curParagraph').height())
          $('#curParagraph').height(newHeight);
      }
    },
    
    reattachLiveScroll : function(duration) {
      if(duration == null) duration = 600;
      var transcriptHeight = this.transcriptBottom();
      var scrollTo = transcriptHeight - $(window).height();
      scrollAnimating = true;
      var theRealSlimShady = this;
      if(duration > 0) {
        $("body").stop().animate({ scrollTop: scrollTo}, duration, function() {
           // If the document has grown, try again
          if(false && theRealSlimShady.transcriptBottom() > transcriptHeight) theRealSlimShady.reattachLiveScroll(100);
          else {
            scrollAnimating = false;
            scrollLive = true;
            app.trigger("transcript:scrollAttach", {});
          }
        });
      }
      else {
        $("body").scrollTop(scrollTo);
        scrollAnimating = false;
        scrollLive = true;
        app.trigger("transcript:scrollAttach", {});
      }
    },

    transcriptBottom : function() {
      try {
        return $('#curParagraph').offset().top + $('#curParagraph').height();
      }
      catch(e) { return 0; }
    },

    handleScroll : function() {
      oldScrollTop = $('body').scrollTop(); // To keep scroll position on resize

      // If this is a user scrolling, decide whether to break or reattach live autoscrolling
      if(!scrollAnimating) {
        // Note: $(document).height() is height of the HTML document,
        //       $(window).height() is the height of the viewport
        var bottom = this.transcriptBottom() - $(window).height();
        if(Math.abs(bottom - $(window).scrollTop()) < Ref.autoscrollReattachThreshold || 
          $(document).height() - $(window).height() - $(window).scrollTop() < Ref.autoscrollReattachThreshold) {
          scrollLive = true;
          app.trigger("transcript:scrollAttach", {}); // So other modules like nav can respond accordingly
        }
        else {
          $("body").stop(); // Stop any scroll animation in progress
          scrollLive = false;
          app.trigger("transcript:scrollDetach", {});
        }
      }

      // Figure out which word is at the bottom of the screen and fire an event with that word's timediff
      // Also perform per-paragraph culling (hide paragraphs that aren't visible)
      var buffer = 50; // How far from the bottom the "bottom" is
      var scrolled = $(window).scrollTop();
      var bottomLine = $(window).scrollTop() + $(window).height() - buffer;

      //var viewportTop    = $(window).scrollTop();
      //var viewportBottom = viewportTop + $(window).height();
      
      // First loop through paragraphs
      var scrolledParagraph = null;
      var closestParagraph = null;
      var closestDistance = 1000000;
      $(".transcriptParagraph").each(function(idx, el) {
        //var paraTop = $(el).offset().top;
        //var paraBottom = paraTop + $(el).height();
        var paraTop = $(el).attr('data-top');
        var paraBottom = $(el).attr('data-bottom');

        // Check if current scroll line is in this paragraph
        if(bottomLine <= paraBottom && bottomLine > paraTop) {
          scrolledParagraph = $(el);
          //return false; // break the each loop
        }
        else if(Math.abs(paraBottom - bottomLine) < closestDistance) {
          closestDistance = Math.abs(paraBottom - bottomLine);
          closestParagraph = $(el);
        }

        /*
        // Check if current paragraph is visible
        if(paraBottom < viewportTop || paraTop > viewportBottom)
          $(el).css("visibility", "hidden");
        else
          $(el).css("visibility", "visible");
        */

      });

      if(!scrolledParagraph) 
        scrolledParagraph = closestParagraph;

      if(scrolledParagraph){  //EG Trying to fix initial race condition when you load page.
	      // Find timestamp of first and last word, linearly interpolate to find current time
	      var words = scrolledParagraph.find("span").not(".transcriptSentence");
	      var t0 = parseInt(scrolledParagraph.attr('data-start'));
	      var tN = parseInt(scrolledParagraph.attr('data-end'));
	
	      var paragraphScrollPercent = (bottomLine - scrolledParagraph.attr('data-top')) / (scrolledParagraph.attr('data-bottom') - scrolledParagraph.attr('data-top'));
	
	      var timeDiff = (paragraphScrollPercent * (tN-t0)) + t0;
	      //console.log(paragraphScrollPercent + " * (" + tN + " - " + t0 + ") + " + t0 + " = " + timeDiff);
	      app.trigger("transcript:scrollTo", timeDiff);
      }
    },
    
    idToMessage : function(id) {
      for(var i=0; i<this.options.messages.length; i++) {
        if(this.options.messages.at(i).get('id') == id) {
          return this.options.messages.at(i);
        }
      }
    },

    resetToNode: function(n) {
	    
  		// clear out following text in prep for playback
  		curSpeaker = "";
  		this.endSentence();
  		this.endParagraph();
  		$('#'+n).parent().parent().parent().nextAll().andSelf().remove();
  		
    },
    
    enter: function() {
	    $('#transcript').css("visibility", "visible");
    },
    
    exit: function() {
	    $('#transcript').css("visibility", "hidden");	    
    },
    
    // Reset puts everything where it's supposed to be before entering.
    reset: function() {
	    $('#transcript').css("visibility", "hidden");	    
    }
   
   
  });

  // Return the module for AMD compliance.
  return Transcript;

});
