define([
  // Application.
  "app"
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
    
    defaults: function() {
  		return {
	  		lastMessage: 0
	  	}	  			
  	},

    
  	initialize: function() {
      app.on("message:word", this.addMessage, this);
      app.on("message:sentenceEnd", this.addMessage, this);
      app.on("message:transcriptEnd", this.addMessage, this);
  	},
  	
    cleanup: function() {
	    app.off(null, null, this);
    },
    
    comparator: function(msg) { 
    	// Sort collection based on count.
    	// Negative makes it sort backwards.	
	    return (msg.get("timeDiff"));
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
    
    playbackMessages: function(restart, diff) {
    
    	this.stopPlayback();
    	
    	var n = restart ? 0 : (this.lastMessage+1);
    	//console.log("start with message "+n+restart);
  		var startMsg = this.at(n);

      function runMessage(i) {
        var messages = this;
        var msg = this.at(i);
        
        var lastMsg = (i == n) ? startMsg : this.at(i-1);

  			diff = msg.get("timeDiff") - lastMsg.get("timeDiff");

        if (app.modifier) {
          diff = diff / app.modifier;
        }

  			if (diff >= 0) {
	  			setTimeoutEvents.push(setTimeout(function() {
            app.trigger("message:" + msg.get("type"), { msg: msg.attributes, live: app.live });

            //if (messages.length <= i+1) {
              runMessage.call(messages, i+1);
              this.lastMessage = i+1;
              //console.log(this.lastMessage+" last");
            //}
          }, diff, this));
	  			//console.log("settimeout "+msg.get("word")+" "+diff);
	  		}
      }

      runMessage.call(this, n);

  		//this.each( function(msg) {
  		//	diff = diff || msg.get("timeDiff") - startMsg.get("timeDiff");
  		//	if (diff >= 0) {
	  	//		setTimeoutEvents.push(setTimeout(function() {
      //      app.trigger("message:" + msg.get("type"), { msg: msg.attributes, live: app.live });
      //    }, 1000));
	  	//		//console.log("settimeout "+msg.get("word")+" "+diff);
	  	//	}
  		//});
    },
    
    stopPlayback: function() {
  		for(var i=0; i<setTimeoutEvents.length; i++) 
  			clearTimeout(setTimeoutEvents[i]);
  		setTimeoutEvents = [];
    },
 
  });
 

  // Return the module for AMD compliance.
  return Message;

});
