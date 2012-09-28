define([
  // Application.
  "core/app",
  "modules/ref",
  "modules/navigation",
  "modules/transcript",
  "modules/overlay",
  "modules/bigWords"
],

// Map dependencies from above array.
function(app, Ref, Navigation, Transcript, Overlay, BigWords) {

  // Create a new module.
  var Landing = app.module();  

  // Default model.
  Landing.Model = Backbone.Model.extend({
  	defaults: function() {
  		return {
	  		startDates: [new Date(2012, 10, 3, 21, 0), new Date(2012, 10, 16, 21, 0), new Date(2012, 10, 22, 21, 0)],
	  		endDates: [new Date(2012, 10, 3, 22, 30), new Date(2012, 10, 16, 22, 30), new Date(2012, 10, 22, 22, 30)],
	  		description: "ReConstitution 2012 is a live web app linked to the three US Presidential Debates. As the debates are happening, language used by the candidates is fed into the app in real time, generating a live data map. Algorithms track the psychological states of Romney and Obama and compare them to past candidates, revealing hidden meaning behind their words.",
	  		now: new Date(),
	  		live: 0	// 1,2,3 if we are watching a debate live.
	  		}	  		
  	},
  	
  	initialize: function() {
	  	if(this.attributes.live) 
	  		this.live = this.attributes.live; 
  	}	
  });

  Landing.View = Backbone.View.extend({
  	template: "landing",
  	
    initialize: function() {
	    this.model = this.options.model;	
	    console.log("new Landing.View: Date = "+this.model.get("startDates")[0].getUTCDate());
    },
    
    events: {
        'click #landingButton0': 'handleDebateClick',
        'click #landingButton1': 'handleDebateClick',
        'click #landingButton2': 'handleDebateClick'
    },
    
    serialize: function() {
	    return {live: this.model.live, dates: this.model.get("startDates"), now: this.model.now, description: this.model.get("description")};	
    },
    
    handleDebateClick: function(e) {
        if(e.target.getAttribute("id")=="landingButton0"){

        }else if(e.target.getAttribute("id")=="landingButton1"){

        }else if(e.target.getAttribute("id")=="landingButton2"){

        }       
        this.exit();
    },
    
    enter: function() {
	    $('#landingWrapper').css("visibility", "visible");
    },
    
    exit: function() {
 	    $('#landingWrapper').css("visibility", "hidden");	    
    }
    
  });

  // Return the module for AMD compliance.
  return Landing;

});
