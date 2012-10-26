/*
 * app/modules/message.js
 *
 * Copyright 2012 (c) Sosolimited http://sosolimited.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */


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
	  		lastMessage: -1
	  	}	  			
  	},

    
  	initialize: function() {
      this.lastMessage = -1;
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
    	console.log("start with message "+n+restart);
  		var startMsg = this.at(n);

      function runMessage(i) {
        var messages = this;
        var msg = this.at(i);
        
        var lastMsg = (i == n) ? startMsg : this.at(i-1);

  			diff = (msg.get("timeDiff") - lastMsg.get("timeDiff"));

        if (app.modifier) {
          diff = diff / app.modifier;
        }
  			if (diff >= 0) {
	  			setTimeoutEvents.push(setTimeout(function() {
            app.trigger("message:" + msg.get("type"), { msg: msg.attributes });

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
