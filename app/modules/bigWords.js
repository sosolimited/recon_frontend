define([
  // Application.
  "app",
  "modules/ref"
],

// Map dependencies from above array.
function(app, Ref) {
  var focalLength = 700;

  // Create a new module.
  var BigWords = app.module();
 
  BigWords.Model = Backbone.Model.extend({
  });
	  
	BigWords.View = Backbone.View.extend({
  	 template: "bigWords",
	  			 
		 initialize: function() {
		  this.bigWordLength = 8;
		  this.curY = 0;		// Used to absolutely layout big words.
		 	app.on("message:word", this.addWord, this);

      //focalLength = parseInt($("#bigWords").css("webkit-perspective"));

      //app.on("body:scroll", this.handleScroll, this);			//EG This is handled by requestAnimFrame now in router.
		 },	
		 
		 serialize: function() {
      return { };
    },
    
    /*	// Using skrollr lib to cull and do parallax now.
    handleScroll: function(val) {
       // Move the origin to make parallax happen
			 //$('#bigWords').css("webkit-perspective-origin", "50% "+(val)+"px");		     
			 
       // Perform culling
       var viewportTop = $('body').scrollTop();
       var viewportBottom = viewportTop + $(window).height();
       //console.log("Viewport top: " + viewportTop + " bottom: " + viewportBottom);

       var bottomFound = false;
       $('.bigWord').each(function() {
         var el = $(this);
         if(bottomFound) var autoCull = true;
         else {
           var topPrime = (el.attr('data-top') - viewportTop) * el.attr('data-scale') + viewportTop;
           var bottomPrime = (el.attr('data-bottom') - viewportTop) * el.attr('data-scale') + viewportTop;
           var autoCull = false;
         }
         if(autoCull || viewportBottom < topPrime || viewportTop > bottomPrime) {
           el.addClass('hiddenWord');
           if(!bottomFound && viewportBottom < topPrime) bottomFound = true;
         }
         else  el.removeClass('hiddenWord');
       });
	  },
    */
    
    addWord: function(args){
    	var word = args['msg']['word'];
    	//console.log("BigWords addWord("+word+") - "+word.length+" ... "+this.bigWordLength);
	    if(word.length >= this.bigWordLength){
		    // Filter out hyphenated words cus they're line breaking.
	    	 if(word.indexOf('-') == -1){
		    	 //console.log("transcript = "+parseInt($('#transcript > .wrapper').css("height"))+", bigWords = "+parseInt(this.$el.css("height")));
		
		    	 // Only add the next big word if there is room (to stay roughly sync'd in height with the transcript.
		    	 if(parseInt($('#transcript > .wrapper').prop('scrollHeight')) > parseInt(this.$el.prop('scrollHeight'))){
			    	//console.log("BigWords.addWord - got a big one");
				   	//var holder = this.$el.children(".bigWordsHolder")[0];
				   	// Horizontal skrolling!
	          //var bigWord = $("<span class='bigWord' style='top:"+this.curY+"px;'data--500-top-bottom='display:block; margin-left:-400px;' data-500-bottom-top='display:block; margin-left:200px;'>"+word+"</span>");
	          var bigWord = $("<span class='bigWord' style='top:"+this.curY+"px;'>"+word+"</span>");
	          $('#bigWordsHolder').append(bigWord);
	          // Add to skrollr manager. 
	          //app.skrollr.refresh(bigWord.get(0));
	          
	          /*
	          var s = this.foreshortening(bigWord);
	          var top = parseInt(bigWord.css('top'));
	          var bottom = top + parseInt(bigWord.height());
	          bigWord.attr("data-top", top);
	          bigWord.attr("data-bottom", bottom);
	          bigWord.attr("data-scale", s);
	          */
				   	this.curY += Ref.bigWordLeading;
				   	//$(holder).append(word+"</br>");
				   }
			   }
	    }
    },

    /* // Using skrollr lib to cull and do parallax now.
    foreshortening : function(element, _focalLength) {
      if(_focalLength == null) {
        // Calculate cached focal length if it hasn't been calculated yet
        if(isNaN(focalLength)) focalLength = parseInt($("#bigWords").css("webkit-perspective"));
        _focalLength = focalLength;
      }
      
      var mat = $(element).css('webkit-transform').split(" ");
      var z = parseInt(mat[mat.length-2]);
      
      var out = _focalLength / (_focalLength - z);
      return out;
    },
    */
    
    enter: function() {
	    $('#bigWordsHolder').css("visibility", "visible");
	    //console.log("bigWords.enter()");
    },
    
    exit: function() {
 	    $('#bigWordsHolder').css("visibility", "hidden");	    
    },
    // Reset puts everything where it's supposed to be before entering.
    reset: function() {
	    $('#bigWordsHolder').css("visibility", "hidden");	    
	    //console.log("bigWords.reset()");
    },
    
    //Init it to hidden state, ready for enter.
    afterRender: function() {
	    this.reset();
    }
    
  });

  // Return the module for AMD compliance.
  return BigWords;

});
