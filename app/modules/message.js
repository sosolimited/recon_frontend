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
    
    addMessage: function(msg) {
	    // log msg
		  curNum++;
		  msg['id'] = curNum;
		  this.add(msg);	
		  //console.log("LOG "+msg["word"]+" "+msg["timeDiff"]+" "+curNum);  
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
