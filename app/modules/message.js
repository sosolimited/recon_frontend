define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

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
			  //console.log("LOG "+args['msg']["word"]+" "+args['msg']["timeDiff"]+" "+curNum);  
			}
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
