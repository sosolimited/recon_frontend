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

  // Default collection.
  Message.Collection = Backbone.Collection.extend({  
    model: Message.Model,
    
    addMessage: function(msg, node) {
	    // log msg
		  msg['node'] = node;
		  //console.log("LOG "+node+" "+msg["word"]+" "+msg["timeDiff"]);
		  this.add(msg);	    
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
