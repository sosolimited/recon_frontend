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

  var recentPositiveEnergy = [0,0,0];
  var recentNegativeEnergy = [0,0,0];
  var energyBurstThreshold = 2; // Sum of recent energies must be above this to trigger an energy burst
  var energyBurstWindow = 3;    // Number of recent sentences to look at for calculating an energy burst

  var recentPositiveWords = [];
  var recentNegativeWords = [];
  var emoWordsWindow = 38;   // 50
  var emoWordsThreshold = 3; // 4

  var oldScrollTop = 0;
  var oldWindowHeight = 0;
  
  var prevLeadingPunct = false;
  var numberLeadingPunct = false;
  
  var extraNumberWords = ['on', 'of', 'a', 'to', 'the', 'Of', 'The', 'A', 'To', 'and'];

  // Default model.
  Transcript.Model = Backbone.Model.extend({
  		
  });

  Transcript.View = Backbone.View.extend({
    
    initialize : function() {
      app.on("message:word", this.addWord, this);
      app.on("message:sentenceEnd", this.endSentence, this);
      app.on("navigation:goLive", this.reattachLiveScroll, this);

      this.$window = $(window);
      this.$body = $(window.body);

      var thisTranscript = this;
      this.$window.resize(function() {
        //if(scrollLive) { thisTranscript.reattachLiveScroll(0) };
        var heightChange = thisTranscript.$window.height() - oldWindowHeight;
        //console.log(heightChange);
        app.setScrollPos({
          position: oldScrollTop - heightChange,
          duration: 600
        });
        oldWindowHeight = thisTranscript.$window.height();
        oldScrollTop = thisTranscript.$body.scrollTop();
      });
		  app.on("userScroll", function() {
		    console.log("USERSCROLL");
		  });

      
      this.numberOpen = false;
      this.numberPhrase = "";
      
      this.speakers = this.options.speakers; // Speaker collection ref used to synchronously check on special events in addWords().
      this.uniqueWords = this.options.uniqueWords;	

  	},

    events : {
    	"click" : "handleClick"
    },
    
    handleClick: function(e) {
	   /* if(e.target.class == 'transcriptSpeaker')
        playbackChapter(e);

      else if(e.target.id == 'goLive') {
        app.trigger("navigation:goLive", 600);
      }
      else if(e.target.id == 'reconTitle'){
				if (app.mode == "comparison") this.exitComparison(e);
	      this.landing.enter();
      }

          transcript.on("click", ".transcriptSpeaker", function() {navigationView.enterComparison(event, "count");});
          transcript.on("click", ".sentimentClick", function() {navigationView.enterComparison(event, "POSITIVITY");});
          transcript.on("click", ".traitClick", function() {navigationView.enterComparison(event, "AUTHENTIC");});
          transcript.on("click", ".countClick", function() {navigationView.enterComparison(event, "list");});*/
    },
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    setHeading: function(str) {
	    $('#transcriptHeading').html(str+'<hr>');    
    },

    addWord: function(args) {
      if (args.msg.type === "word" && app.restore) { return; }
     // console.log("transcript.addWord("+args['msg']['word']+")");
	    var word = args['msg'];
	    
	    // Add word to speakers, which returns an array of any special events triggered by the word.
	    var wordProps = this.speakers.addWord(args);
	    //console.log("addWord...");
	    //for(var i=0; i<wordProps.length; i++) console.log(wordProps[i]);
	        
	    var positiveWord = false;
      var negativeWord = false;

      // Add to transcript.
	    // ---------------------------------------------------------------------
    	var s = "";

      var col=1;
    		
    	if (word["speaker"] != curSpeaker) {
    		curSpeaker = word["speaker"];
    			
    		// emit message to add chapter marker
    		app.trigger("playback:addChapter", {msg:word});
    		app.trigger("transcript:speakerSwitch", {speaker: curSpeaker});

        this.startParagraph(word);
        
        // Clear sentiment running total
        if(Ref.useSentistrengthBurst) {
          for(var i=0; i<recentPositiveEnergy.length; i++) {
            recentPositiveEnergy[i] = 0;
            recentNegativeEnergy[i] = 0;
          }
        }
        else {
          for(var i=0; i<recentPositiveWords.length; i++) {
            recentPositiveWords[i] = 0;
            recentNegativeWords[i] = 0;
          }
        }
    	}
    	
    	if (word["sentenceStartFlag"]) this.endSentence();
    	
    	if (!openSentence) {
    		$('#curParagraph p').append("<span id=curSentence class='transcriptSentence'></span>"); // add sentence span wrapper
    		openSentence = true;
    	}
    	
    	//console.log('punct '+word["punctuationFlag"]);
    	
    	if (word["punctuationFlag"] != 1 && !prevLeadingPunct) s += " "; // Add leading space.
    	
    	if (word["punctuationFlag"] == -1) prevLeadingPunct = true; //keep track of punct if it was leading
    	else prevLeadingPunct = false;
    	
    	
    	    	
    	// Check for any kind of special word events then: insert marked up word and/or trigger overlay event.
    	// -------------------------------------------------------------------------------------------------------  
      // Check for numbers: 'number' for numerics, 'numbers' for LIWC.
      
      var curNumber = false;
      //if(curSpeaker==1 || curSpeaker==2){  //trying numbers on moderator too
	    	
	    	if ( ($.inArray('numbrz', word['cats']) != -1) || (word["word"] == '$')) //TODO: add a check for $, currently it breaks something
	    	{
	    		//console.log("transcript - got a number!" + word['word']);
	    		if (!this.numberOpen){
		    		this.numberOpen = true;
		    	}
		    	curNumber = true;
	    	}
    	//}
    	
    	var top20Count = 0;
    	// Only do other markup if a number phrase isn't open, and only if obama or romney are speaking
      //console.log(word['word'] + ": " + word['cats']);
      
    	if(!this.numberOpen && (curSpeaker==1 || curSpeaker==2)){    	
    		
        // Check for quotes.
        //console.log(word['word']  + ": " + word['cats']);
    		if ($.inArray('say', word['cats']) != -1) { // TODO: Change this to 'say' cat once we're sure it's working everywhere 
	        // Go back a word and pull it into this phrase.
	        var cS = $('#curSentence');
	        var cSHTML = cS.html();
	
	        // Find two words back.
	        var wordIndex = this.getIndexOfPreviousWord(cS, 1);
	        
	        var newSpan = $("<span class='catMarkup quoteMarkup'>" + cSHTML.substring(wordIndex, cSHTML.length) + s+word['word'] + "</span>");	        
	        cS.html(cSHTML.substring(0,wordIndex));
	        cS.append(newSpan);
	
	        var quotePhrase = newSpan.text();
	
	        //console.log("QUOTE: " + quotePhrase);
	        
		    	app.trigger("markup", {type:'quoteMarkup', phrase:quotePhrase, speaker:word['speaker'], anchor:newSpan.offset()});
	    	}
        
		  	
        // Check for any special events returned by speaker.addWord() and add word to DOM with appropriate markup.
		    if(wordProps.length > 0){
		    	// For now, just grab whatever the first one is and apply it.
		    	// Note: Class name is just whatever the 'type' of the arg is, so endSentence() down below has to match these class names. 
		    	$('#curSentence').append("<span class='"+wordProps[0]['type']+" transcriptWord'>"+s+word["word"]+"</span>");	
			    // Trigger the associated overlay event.
			    //app.trigger("markup:"+wordProps[0]['type'], wordProps[0]); 		   		 	 
			    app.trigger("markup", wordProps[0]); 		   		 	 
		    }
		    // Check if the word is in the top N words. (20 was too busy, so we're trying 10)
		    else if((top20Count = this.uniqueWords.isTopPhrase(curSpeaker, word['word'], 10))
		    	&& (this.uniqueWords.getTotalUniquePhrases(curSpeaker) > 100)){
				  var sp = $("<span class='frequentWordMarkup countClick transcriptWord'>"+s+word["word"]+"</span>");
				  sp.attr("data-wordcount", top20Count);
			   	$('#curSentence').append(sp);	
		    }
		  	else if ($.inArray('posemo', word['cats']) != -1) {
		  		 //app.trigger("markup:posemo", {type:'posemo', speaker:word['speaker'], word:word['word']});
		  		 $('#curSentence').append(s+"<span class='catMarkup posemoMarkup transcriptWord'>"+word["word"]+"</span>"); 
           positiveWord = true;
		  	}
		  	else if ($.inArray('negemo', word['cats']) != -1 || (!Ref.useSentistrengthBurst && $.inArray('negate', word['cats']) != -1)) {
		  		 //app.trigger("markup:posemo", {type:'posemo', speaker:word['speaker'], word:word['word']});
		  		 $('#curSentence').append(s+"<span class='catMarkup negemoMarkup transcriptWord'>"+word["word"]+"</span>"); 
           negativeWord = true;
		  	}		  	
		  	else if ($.inArray('certain', word['cats']) != -1) {
		  		 //app.trigger("markup:posemo", {type:'posemo', speaker:word['speaker'], word:word['word']});
		  		 $('#curSentence').append(s+"<span class='catMarkup certainMarkup transcriptWord'>"+word["word"]+"</span>"); 
		  	}
		  	else if ($.inArray('tentat', word['cats']) != -1) {
		  		 //app.trigger("markup:posemo", {type:'posemo', speaker:word['speaker'], word:word['word']});
		  		 $('#curSentence').append(s+"<span class='catMarkup tentatMarkup transcriptWord'>"+word["word"]+"</span>"); 
		  	}
		    else{
		    	$('#curSentence').append(s+word["word"]); 
		    }
      }
      else{
	      $('#curSentence').append(s+word["word"]); 
      }
      
    	// Check for any open number phrases.  
      if (this.numberOpen){
      
      	//1. if end punct, emit number and don't add word
      	if((word['punctuationFlag'] != 0) && (word["word"] != '$')) {
      		//console.log("closing with punctFlag");
      		this.emitNumberEvent();
      	}
      	
      	//2. else add the word
      	else 
      	{
      		
      	
	      	if ((word['punctuationFlag'] == 0) && !numberLeadingPunct) this.numberPhrase += " "; //add lead space if leading
	      	this.numberPhrase += word['word']; //add word
	      	
	      	if (!curNumber) {
	      		//only emit and close on words other than the special one
	      		var special = false;
	      		for (i in extraNumberWords)
	      		{
		      		if (word["word"] == extraNumberWords[i]) special = true;
	      		}
	    			if (!special) this.emitNumberEvent(); //We're not special! We're just like you!
	      	}
	      	
	      	//special case for $
	      	if (word["word"] == '$') {
	      		 numberLeadingPunct = true;
      		}
      		else numberLeadingPunct = false;
	      		
      	}
    		
    	}
      
      // Update the paragraph size cache
      $('#curParagraph').attr('data-bottom', parseInt($("#curParagraph").attr('data-top')) + $("#curParagraph").height());
      $('#curParagraph').attr('data-end', word['timeDiff']);

      this.keepBottomSpacing();

      // Autoscroll the window to keep up with transcript
      // ----------------------------------------------------------------------
      if(scrollTo != lastScrollHeight && this.scrollShouldReattach()) {
        scrollLive = true;
        app.trigger("transcript:scrollAttach", {});         
      }
      if(scrollLive && !Ref.disableAutoScroll) {
        var scrollTo = this.transcriptBottom() - this.$window.height();
        //var scrollTo = $(document).height() - this.$window.height();
        if(scrollTo != lastScrollHeight) {  // Only trigger autoscroll if needed
          //console.log("scrolling to: " + scrollTo);
          var duration = Math.abs(lastScrollHeight - scrollTo) * 3.0;
          app.setScrollPos({
            duration: duration,
            position: scrollTo
          });
          app.trigger("transcript:scrollTo", word["timeDiff"]); 
          lastScrollHeight = scrollTo;
        }
      }
      //$('#curSentence').css("margin-bottom", $('#curSentence').height() - Ref.overlayOffsetY);
      
      // Calculate recent positive/negative word count, trigger burst if appropriate
      // ---------------------------------------------------------------------------
      // Shift values back, calculate recent total
      if(!Ref.useSentistrengthBurst && args && (curSpeaker==1 || curSpeaker==2)) {
        var positiveTotal = 0; var negativeTotal = 0;
        for(var i=0; i<emoWordsWindow-1; i++) {
          recentPositiveWords[i] = (recentPositiveWords[i+1] || 0);
          recentNegativeWords[i] = (recentNegativeWords[i+1] || 0);

          positiveTotal += recentPositiveWords[i];
          negativeTotal += recentNegativeWords[i];
        }
        recentPositiveWords[emoWordsWindow-1] = positiveWord ? 1 : 0;
        recentNegativeWords[emoWordsWindow-1] = negativeWord ? 1 : 0;

        positiveTotal += recentPositiveWords[emoWordsWindow-1];
        negativeTotal += recentNegativeWords[emoWordsWindow-1];

        var posiWins = positiveTotal > negativeTotal;
        
        if(positiveTotal > emoWordsThreshold && posiWins) {

          app.trigger("markup", {type:"sentimentMarkup", polarity:"posemo", speaker:args['msg']['speaker'], strength:positiveTotal, anchor: $('#curSentence').offset()});

          // Flush recent energy so the next sentence is less likely to trigger
          for(var i=0; i<recentPositiveWords.length; i++)
            recentPositiveWords[i] = 0;
        }
        // TODO: Make this not just an else, but alternate pos/neg bursts when both happen at the same time
        else if(negativeTotal > emoWordsThreshold && !posiWins) {  

          app.trigger("markup", {type:"sentimentMarkup", polarity:"negemo", speaker:args['msg']['speaker'], strength:negativeTotal, anchor: $('#curSentence').offset()});

          // Flush recent energy so the next sentence is less likely to trigger
          for(var i=0; i<recentNegativeWords.length; i++)
            recentNegativeWords[i] = 0;
        }
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
      	 if($(this).hasClass("posemoMarkup")){
	      	 $(this).css("background-color", "rgb(124,240,179)");
	      	 //$(this).css("color", "rgb(255,255,255)");
      	 }
      	 else if($(this).hasClass("negemoMarkup")){
	      	 $(this).css("background-color", "rgb(122,52,183)");
	      	 $(this).css("color", "rgb(180,180,180)");
      	 }
      	 else if($(this).hasClass("certainMarkup")){
	      	 $(this).css("background-color", "rgb(255,175,108)");
	      	 //$(this).css("color", "rgb(255,255,255)");
      	 }
      	 else if($(this).hasClass("tentatMarkup")){
	      	 $(this).css("background-color", "rgb(193,186,134)");
	      	 //$(this).css("color", "rgb(255,255,255)");
      	 }
	     	 // Word count markup.
	     	 else if($(this).hasClass("wordCountMarkup")){	
	     	   $(this).css("color", "rgb(207,255,36)");
	     	   $(this).css("text-decoration", "underline");	    	
	     	 }
	     	 // Number markup.
	     	 else if($(this).hasClass("numberMarkup")){
	     	 		//$(this).css("background-color", "rgb(64,180,229)");	    	    		
	     	 		$(this).css("background-color", "rgb(80,80,80)");
	     	 		$(this).css("color", "rgb(180,180,180)");	    	    			    	    		
	     	 }
	     	 // Quotation markup.
	     	 else if($(this).hasClass("quoteMarkup")){
	     	 		$(this).css("background-color", "rgb(48,179,228)");	    	    		
	     	 }         
	     	 // Frequent word markup.
	     	 else if($(this).hasClass("frequentWordMarkup")){
			     	//$(this).css("color", "rgb(100,100,100)");	
		    		//$(this).css("border-bottom", "1px solid white");	//To do different color underline.
		    		
		    		//$(this).css("text-decoration-color", "rgb(255,255,255)");	
		    		
		        var count = $(this).attr("data-wordcount");
		        if(count != undefined) {
		          // Add a div at this point and animate it inCannot read property 'top' of null 
		          var pos = $(this).position();
		          var wordWidth = $(this).width();
		          var lineHeight = $(this).height();
              var leftInset = 2; // Keep the superscripts a little tighter to the word
		          var container = $("<div class='freqWordFrame' style='left: " + (pos.left + wordWidth - leftInset) + "px; top: " + (pos.top - lineHeight*.25) + "px;'></div>");
		          var countDiv = $("<div class='freqWordCount'>" + count + "</div>");
		          container.append(countDiv);
		          $(this).parent().append(container);
		          countDiv.animate({top: '0px'}, 300);
		          
		          
		          ////EG Trying it without underline.
              //var spaceWidth = 5;  // To avoid underlining the leading space. This is an ugly hack.
              //var underlineDiv = $("<div class='freqWordUnderline' style='left: " + (pos.left+spaceWidth) + "px; top: " + (pos.top + lineHeight*0.8) + "px;  width: " + (wordWidth-spaceWidth) + "px;' />");
              //$(this).parent().append(underlineDiv);
              
		        } 
	     	 }
      });

      // Calculate positive/negative energy over the last few sentences, determine if this is a burst
      // --------------------------------------------------------------------------------------------
      // Shift values back, calculate recent total
      if(args && Ref.useSentistrengthBurst && (curSpeaker==1 || curSpeaker==2)) {
        var positiveTotal = 0; var negativeTotal = 0;
        for(var i=0; i<energyBurstWindow-1; i++) {
          recentPositiveEnergy[i] = recentPositiveEnergy[i+1];
          recentNegativeEnergy[i] = recentNegativeEnergy[i+1];

          positiveTotal += recentPositiveEnergy[i];
          negativeTotal += recentNegativeEnergy[i];
        }
        recentPositiveEnergy[energyBurstWindow-1] = args['msg']['sentiment'][0];;
        recentNegativeEnergy[energyBurstWindow-1] = args['msg']['sentiment'][1];;

        positiveTotal += recentPositiveEnergy[energyBurstWindow-1];
        negativeTotal += recentNegativeEnergy[energyBurstWindow-1];
        
        var posiWins = positiveTotal > negativeTotal;
        
        if(positiveTotal > energyBurstThreshold && posiWins) {

          app.trigger("markup", {type:"sentimentMarkup", polarity:"posemo", speaker:args['msg']['speaker'], strength:positiveTotal, anchor: $('#curSentence').offset()});

          // Flush recent energy so the next sentence is less likely to trigger
          for(var i=0; i<recentPositiveEnergy.length; i++)
            recentPositiveEnergy[i] = 0;
        }
        // TODO: Make this not just an else, but alternate pos/neg bursts when both happen at the same time
        else if(negativeTotal > energyBurstThreshold && !posiWins) {

          app.trigger("markup", {type:"sentimentMarkup", polarity:"negemo", speaker:args['msg']['speaker'], strength:negativeTotal, anchor: $('#curSentence').offset()});

          // Flush recent energy so the next sentence is less likely to trigger
          for(var i=0; i<recentNegativeEnergy.length; i++)
            recentNegativeEnergy[i] = 0;
        }
      }
    	
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
     	//console.log("transcript.startParagraph()");
      var curSpeaker = msg["speaker"];
      if(curSpeaker==0) col = 2;	//obama
  		else if(curSpeaker==2) col = 3;	//romney
      else col = 1; // ???
    		
  		if (openSentence) this.endSentence();
  		if (openParagraph) this.endParagraph();	    		
    	
    	// Color candidates white and speaker gray.
    	var spColor = "white";
    	//if(curSpeaker == 0) spColor = "gray60";	
    		
  		var newP = $("<div id='curParagraph' class='push-" + col + " span-3 " +
                   speakers[curSpeaker] + " transcriptParagraph'><div class='transcriptSpeaker franklinMedIt " + spColor + "'>" +
                   speakers[curSpeaker] + "</div><p class='metaBook gray60'></p></div><div class=clear></div>");                   
      // Adding parallax.
      //var newP = $("<div id='curParagraph' class='push-" + col + " span-3 " +
      //             speakers[curSpeaker] + " transcriptParagraph' data-top-bottom='margin-top:-40px;' data-top-top='margin-top:40px;'><div class='transcriptSpeaker franklinMedIt " 
      //             + spColor + "'>" + speakers[curSpeaker] + "</div><p class='metaBook gray60'></p></div><div class=clear></div>");                                                  
      this.$el.append(newP);
      // Add to skrollr manager.
      //app.skrollr.refresh(newP.get(0));
      
      // Cache position in data attributes
      newP.attr('data-top', newP.offset().top);
      newP.attr('data-bottom', newP.offset().top + newP.height());
      newP.attr('data-start', msg["timeDiff"]);
      newP.attr('data-end', msg["timeDiff"]+1);

      openParagraph = true;
    },

    endParagraph: function() {
    	//console.log("transcript.endParagraph()");
      // Update attributes to cache position properties
      $('#curParagraph').attr('data-top', this.$("#curParagraph").offset().top);
      $('#curParagraph').attr('data-bottom', this.$("#curParagraph").offset().top + $("#curParagraph").height());

      // When #curParagraph height goes to 'auto', the page collapses and scroll jumps up
      // So save the height with a temporary div!
      if($('#saveTheHeight').length == 0)
        this.$body.append("<div id='saveTheHeight' style='position: absolute; width:100%; height:2px; z-index:-100; left: 0;'></div>");

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

    getIndexOfPreviousWord : function(source, n) {
      var sourceHTML = $(source).html();
      var wordsPassed = 0;
      var inTag = false;
      var inWord = false;
      for(var i=sourceHTML.length; i>=0; i--) {
        var c = sourceHTML.charAt(i);
        if(c == '>') inTag = true;
        else if(c == '<' && inTag) inTag = false;
        else if(!inTag && c != ' ') inWord = true;
        else if(inWord && !inTag && c == ' ') {
          inWord = false;
          wordsPassed++;
        }
        if(wordsPassed == n + 1) {
          return i;
        }
        if(i == 0) return i;
      }
      
      return sourceHTML.length;
    },
    
    emitNumberEvent: function() {
    	
    	//console.log("emitNumberEvent("+this.numberPhrase+")");
      
      
      var anchorPos;
      if(this.numberPhrase != null) 
      {
      	var cS = $('#curSentence');
	      cS.html(cS.html().replace($.trim(this.numberPhrase), "<span id='positionMarker' class='transcriptWord numberMarkup catMarkup'>"+$.trim(this.numberPhrase)+"</span>"));
	      
        anchorPos = $('#positionMarker').offset();
        $('#positionMarker').removeAttr("id");        
      }
      else anchorPos = $('#curSentence').offset();

    	// Emit an overlay event.
			app.trigger("markup", {type:'numberMarkup', speaker:curSpeaker, phrase:this.numberPhrase, anchor:anchorPos});	
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
      var transcriptHeight = this.transcriptBottom();
      var scrollTo = transcriptHeight - this.$window.height();

      app.setScrollPos({
        position: scrollTo,
        duration: duration,
        done: function() {
          scrollLive = true;
          app.trigger("transcript:scrollAttach", {});
        }
      });

    },

    transcriptBottom : function() {
      try {
        return $('#curParagraph').offset().top + $('#curParagraph').height();
      }
      catch(e) { console.log("NO CURRENT PARAGRAPH"); return 0; }
    },


    // Decide whether to break or reattach live autoscrolling
    handleUserScroll : function() {
      // Note: $(document).height() is height of the HTML document,
      //       this.$window.height() is the height of the viewport
      var bottom = this.transcriptBottom() - this.$window.height();
      if(!scrollLive && this.scrollShouldReattach()) {
        scrollLive = true;
        // So other modules like nav can respond accordingly
        app.trigger("transcript:scrollAttach", {});
      }
      else if(scrollLive && !this.scrollShouldReattach()) {
        this.$body.stop(); // Stop any scroll animation in progress
        scrollLive = false;
        app.trigger("transcript:scrollDetach", {});
      }
    },

    handleScroll : function() {
      // Save value to keep scroll position on resize
      oldScrollTop = this.$body.scrollTop();

      // Figure out which word is at the bottom of the screen and fire an event with that word's timediff
      // Also perform per-paragraph culling (hide paragraphs that aren't visible)
      var buffer = 50; // How far from the bottom the "bottom" is
      var scrolled = this.$window.scrollTop();
      var bottomLine = this.$window.scrollTop() + this.$window.height() -
        buffer;

      //var viewportTop    = this.$window.scrollTop();
      //var viewportBottom = viewportTop + this.$window.height();
      
      // First loop through paragraphs
      var scrolledParagraph = null;
      var closestParagraph = null;
      var closestDistance = Infinity;
      $(".transcriptParagraph").each(function(idx, el) {
        //var paraTop = $(el).offset().top;
        //var paraBottom = paraTop + $(el).height();
        var $el = $(el);
        var paraTop = $el.data('top');
        var paraBottom = $el.data('bottom');

        // Check if current scroll line is in this paragraph
        if(bottomLine <= paraBottom && bottomLine > paraTop) {
          scrolledParagraph = $el;
          //return false; // break the each loop
        }
        else if(Math.abs(paraBottom - bottomLine) < closestDistance) {
          closestDistance = Math.abs(paraBottom - bottomLine);
          closestParagraph = $el;
        }

        /*
        // Check if current paragraph is visible
        if(paraBottom < viewportTop || paraTop > viewportBottom)
          $(el).css("visibility", "hidden");
        else
          $(el).css("visibility", "visible");
        */

      });

      if(!scrolledParagraph) {
        scrolledParagraph = closestParagraph;
      }

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

    scrollShouldReattach : function() {
      var bottom = this.transcriptBottom() - this.$window.height();
      return Math.abs(bottom - this.$window.scrollTop()) < Ref.autoscrollReattachThreshold;
        // || $(document).height() - this.$window.height() - this.$window.scrollTop() < Ref.autoscrollReattachThreshold;
        // Second case is to bounce from the bottom
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
