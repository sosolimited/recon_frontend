define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Message = app.module();
  var playbackHead = -1;
  var playback = false;
  var playbackStart = 0;
  var count = 0;

  // Default model.
  Message.Model = Backbone.Model.extend({
    // Not much here because messages are sent as JSON objects from the server
    // But it looks something like this:
    //  cats: Array[5]
    //    0: "funct"
    //    1: "pronoun"
    //    2: "ppron"
    //    3: "you"
    //    4: "social"
    //    length: 5
    //  id: "504fe513bd00e824e40d609a"
    //  ngrams: Array[0]
    //  node: 643
    //  punctuationFlag: false
    //  sentenceStartFlag: true
    //  speaker: 2
    //  timestamp: 1347501365260
    //  type: "word"
    //  word: "You"
    //  wordInstances: 116
    
    defaults: {
      "cats" : [],
      "id" : -1,
      "ngrams" : [],
      "node" : -1,
      "punctuationFlag" : false,
      "sentenceStartFlag" : false,
      "speaker" : -1,
      "type" : "unknown",
      "word" : "",
      "wordInstances" : 0
    },

    emit : function() {
      app.socket.emit(this.get("type"), this.toJSON());
  	}
  });

  // Default collection.
  Message.Collection = Backbone.Collection.extend({  
    model: Message.Model,
    
    initialize: function() {
      // Bind custom events
      app.on("chapters:jump", this.setPlaybackPosition, this);
    },

    addMessage: function(msg) {
      // Only used for processing NEW messages that have not yet been passed to the client
	    // log msg
		  msg['node'] = this.length;
		  console.log("Inserting message " + msg['node'] + " of type " + msg["type"]);
		  this.add(new Message.Model(msg));
      // Just log this message, but don't do anything with it
      // if it's received while we're viewing history
      if(!playback) this.handleMessage(msg, msg['node']);  
      //console.log(this);
      console.log(msg);
      count++;
      console.log("Length is " + this.length + " but count is " + count);
    },

    handleMessage: function(msg, node) {
      // This handler doesn't care so much if the message is brand new or being replayed
      if(!msg["type"]) msg = msg.toJSON();

      if(playback) console.log("Playing back message #" + node + ": " + msg["word"]);
      else         console.log("Handling new message #" + node + ": " + msg["word"]);
      //console.log(msg);
      if(msg["type"] == "word")
        app.trigger("words:new", msg);
      
      // TODO: Handler other message types here and trigger the appropriate events

      playbackHead++;
    },

    setPlaybackPosition: function(position) {
      playback = true;
      playbackHead = position;
      playbackStart = this.at(position).timestamp;
      this.playbackNextMessage();
    },

    playbackNextMessage : function() {
      console.log("Re-playing message " + playbackHead + " of " + this.length);
      this.handleMessage(this.at(playbackHead).toJSON(), playbackHead);
      if(this.at(playbackHead+1)) {
        var delay = (this.at(playbackHead+1).get("timestamp") - this.at(playbackHead).get("timestamp"));

        var theseMessages = this; // Save state so setTimeout knows who "this" is
        setTimeout(function() { theseMessages.playbackNextMessage(); }, delay);
      }
      else {
        // End of playback
        console.log("No next message. Playback is OVER!");
      }
    },

    fastForward : function() {
      console.log("Fast forwarding from position " + playbackHead + " to " + this.length);
      this.each(function(msg) {
        this.handleMessage(msg.toJSON(), msg.get('node'));
      });
    }
  });
 

  // Return the module for AMD compliance.
  return Message;

});
