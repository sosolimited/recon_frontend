define([
  // Application.
  "app",
  "modules/ref",
],

// Map dependencies from above array.
function(app, Ref) {

  // Create a new module.
  var Landing = app.module();  

  // Default model.
  Landing.Model = Backbone.Model.extend({
  	defaults: function() {
  		return {
	  		startDates: [new Date(2012, 10, 3, 21, 0), new Date(2012, 10, 16, 21, 0), new Date(2012, 10, 22, 21, 0)],
	  		endDates: [new Date(2012, 10, 3, 22, 30), new Date(2012, 10, 16, 22, 30), new Date(2012, 10, 22, 22, 30)],
	  		/*
	  		description: "ReConstitution 2012 is a live web app linked to the three US Presidential Debates. As the debates are happening, language used by the candidates is fed into the app in real time, generating a live data map. Algorithms track the psychological states of Romney and Obama and compare them to past candidates, revealing hidden meaning behind their words.",*/
	  		now: new Date()
	  	}	  			
  	},
  	
  	initialize: function() {
  	}	
  });

  Landing.View = Backbone.View.extend({
  	template: "landing",
  	
    initialize: function() {
	    this.model = this.options.model;	
	    //console.log("new Landing.View: Date = "+this.model.get("startDates")[0].getUTCDate());
	    
	    this.navigation = this.options.navigation;
	    this.transcript = this.options.transcript;
	    this.bigWords = this.options.bigWords;
	    this.comparisons = this.options.comparisons;	
	    this.overlay = this.options.overlay;
	    
	    app.on("app:setLive", function(num) {
	    	console.log("set live "+num+app.live);
	    	if (app.live) {
		    	this.enter();
		    	[0,1,2].forEach(function(i) {
			    	if (i != num) this.deactivateDebate(i, true);
			    	else this.activateDebate(i, true);
			    }, this);
			    
			    var debateNum = num+1;
			    
			    $('#navNotification > div > .navInstructionsText').text("Debate "+debateNum+" is now live!");
			    $('#navNotification').css("transform", "translateX(0%)");
			    
			    this.transcript.setHeading("DEBATE "+(num+1));
			    setTimeout(function(){ $('#navNotification').css("transform", "translateX(100%)"); }, 3000);
			  } else {
		    	[0,1,2].forEach(function(i) {
			    	if (app.messages[i]) this.activateDebate(i);
			    	else this.deactivateDebate(i);
			    }, this);
			  }
	    }, this);
      app.on("debate:activate", this.activateDebate, this);
      app.on("debate:deactivate", this.deactivateDebate, this);
      app.on("landing:activate", this.activatePage, this);
    },
    
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    events: {
        'click #landingButton0': 'handleDebateClick',
        'click #landingButton1': 'handleDebateClick',
        'click #landingButton2': 'handleDebateClick'
    },
    
    serialize: function() {
	    return {dates: this.model.get("startDates"), now: this.model.now};	
    },
    
    handleDebateClick: function(e) {
      // Add markup.
      //$("#transcript").html(app.markup);
      //app.restore = true;

      if(e.target.id === "landingButton0" || e.target.parentNode.id == "landingButton0"){
        app.playback = true;
	      if (app.active[0]) this.enterDebate(0);
        app.trigger("navigation:goLive", 600);
      }else if(e.target.id === "landingButton1" || e.target.parentNode.id == "landingButton1"){
        app.trigger("navigation:goLive", 600);
	      if (app.active[1]) this.enterDebate(1);
      }else if(e.target.id === "landingButton2" || e.target.parentNode.id == "landingButton2"){
        app.trigger("navigation:goLive", 600);
	      if (app.active[2]) this.enterDebate(2);
      } 
    },
    
    enterDebate: function(num) {
	  	this.transcript.setHeading("DEBATE "+(num+1));
      // Playback messages.
      if (!app.live) {
	    //if (app.router.qs.playback) {
	    	console.log("last "+app.lastDebateViewed+" "+num);
	    	if (num == app.lastDebateViewed) {
		    	app.messages[num].playbackMessages(false);
		    } else {
		    	app.trigger("debate:reset");
		    	app.messages[num].playbackMessages(true);
		    }
	    }

      if (app.live) {
      	if (!app.loadDoc) {
	        //PEND: data injection still needs work
	        //$("#transcript > .wrapper").html(app.markup);
	        //$("#bigWordsHolder").html(app.bigwords);
	      }
	      this.overlay.rerender();
      }
      
      this.exit(num);
		  app.lastDebateViewed = num;
    },
    
    enter: function() {
    	// Hello landing.
      $('body').stop().scrollTop(0); // Jump to the top since landing is no longer postion: fixed
	    $('#landing').show();
	    // Bye bye everything else.
	    this.navigation.exit();
      this.transcript.exit();
      this.bigWords.exit();	
      this.comparisons.exit();
      if (app.lastDebateViewed > -1 && app.messages[app.lastDebateViewed]) app.messages[app.lastDebateViewed].stopPlayback();    
    },
    
    exit: function(num) {
    	// Bye bye landing.
 	    $('#landing').hide();
 	    // Hello everything else.
 	    this.navigation.enter(app.lastDebateViewed == -1, num);
      this.transcript.enter();
      this.bigWords.enter();	
      this.model.set({lastDebateViewed:num});
    },
    
    deactivateDebate: function(num, force) {
    	if (force || !app.live) { // ignore if app is live, unless command comes direct from setLive msg
	    	if (num >= 0 && num < 3) {
			    console.log("deactivating "+num);
			    $('#landingButton'+num).addClass('inactive');
			    $('#landingRule'+num).addClass('inactive');
			   	app.active[num] = false; 
			  }
			}
    },
    
    activateDebate: function(num, force) {
    	if (force || !app.live) { // ignore if app is live, unless command comes direct from setLive msg
	    	if (num >= 0 && num < 3) {
			    console.log("activating "+num);
			    $('#landingButton'+num).removeClass('inactive');
			    $('#landingRule'+num).removeClass('inactive');
			    app.active[num] = true;
			  }
			}
    },
    
    activatePage: function() {
	    $('#landingSubTitle').text("A LIVE DECONSTRUCTION OF THE US PRESIDENTIAL DEBATES");
    }
    
    
  });

  // Return the module for AMD compliance.
  return Landing;

});
