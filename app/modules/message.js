define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  var setTimeoutEvents = [];
  
  // Create a new module.
  var Message = app.module();

    // Default model.
  Message.Model = Backbone.Model.extend({
  
  	emit : function() {
      app.socket.emit(this.get("type"), this.toJSON());
  	}
  });
  
  var curNum = -1;

  // Default collection.
  Message.Collection = Backbone.Collection.extend({  
    model: Message.Model,
    
    
  	initialize: function() {
      app.on("message:word", this.addMessage, this);
      app.on("message:sentenceEnd", this.addMessage, this);
      app.on("message:transcriptEnd", this.addMessage, this);
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    addMessage: function(args) {
    	if (args['live']) {

		    // log msg
			  curNum++;
			  args['msg']['id'] = curNum;
			  this.add(args['msg']);	
			  //console.log("LOG "+args['msg']["word"]+" "+args['msg']["type"]+" "+args['msg']['punctuationFlag']+" "+args['msg']['cats']);  
			}
    },
    
    playbackMessages: function(n) {
    
    	this.stopPlayback();
    	
  		var startMsg = this.get(n);

  		this.each( function(msg) {
  			var diff = msg.get("timeDiff") - startMsg.get("timeDiff");
  			if (diff >= 0) {
	  			setTimeoutEvents.push(setTimeout(function() { msg.emit(); }, diff));
	  			//console.log("settimeout "+msg.get("word")+" "+diff);
	  		}
  		});
    },
    
    stopPlayback: function() {
  		for(var i=0; i<setTimeoutEvents.length; i++) 
  			clearTimeout(setTimeoutEvents[i]);
  		setTimeoutEvents = [];
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
