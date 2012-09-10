require([
  // Application.
  "core/app",

  // Main Router.
  "router",
  "message",
  "navigation",
  "transcript"
],

function(app, Router, Message, Navigation, Transcript) {

	// Init msg collection
	app.messages = new Message.Collection();
	
	app.playback = false;
	
	app.startTime = new Date().getTime();
	
	
  // init navigation
  app.navigation = new Navigation.View();
  
  // init transcript
  app.transcript = new Transcript.View();

  // Wait until the socket has been opened, before routing.
  app.socket.on("open", function() {
    // Wait for messages and respond to them.
    app.socket.on("message", function(msg) {
			//console.log("msg - "+msg);
      msg = JSON.parse(msg);
   
      // log msg
      app.messages.add(msg);
      if (!app.playback) app.socket.emit(msg.type, msg); // pend temp for testing
    });

    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    // Trigger the initial route and enable HTML5 History API support, set the
    // root folder to '/' by default.  Change in app.js.
    Backbone.history.start({ pushState: true, root: app.root });
  });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a:not([data-bypass])", function(evt) {
    // Get the absolute anchor href.
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    // Get the absolute root.
    var root = location.protocol + "//" + location.host + app.root;

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop && href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      Backbone.history.navigate(href.attr, true);
    }
  });

});
