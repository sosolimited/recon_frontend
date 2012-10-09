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
    
    playbackMessages: function(n, diff) {
    
    	this.stopPlayback();
    	
  		var startMsg = this.at(n);

      function runMessage(i) {
        var messages = this;
        var msg = this.at(i);

  			diff = diff || msg.get("timeDiff") - startMsg.get("timeDiff");
  			if (diff >= 0) {
	  			setTimeoutEvents.push(setTimeout(function() {
            app.trigger("message:" + msg.get("type"), { msg: msg.attributes, live: app.live });

            //if (messages.length <= i+1) {
              runMessage.call(messages, i+1);
            //}
          }, diff));
	  			//console.log("settimeout "+msg.get("word")+" "+diff);
	  		}
      }

      runMessage.call(this, 0);

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
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
