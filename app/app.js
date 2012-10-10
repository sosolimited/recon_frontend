define([
  // Libraries.
  "jquery",
  "lodash",
  "backbone",
  "libs/engine.io",
  "skrollr",

  // Plugins.
  "plugins/backbone.layoutmanager",
  "plugins/jquery.ba-outside-events"
],

function($, _, Backbone, eio) {
	
  // Provide a global location to place configuration settings and module
  // creation.
  var app = {
    // The root path to run the application.
    root: "/",

    // Assign global reusable views.
    views: {},
    
    mode: "transcript", // transcript or comparison

    // Create a socket connection to the server.
    socket: new eio.Socket({ host: location.hostname, port: 8081 }),
    
    // Init skrollr lib
    skrollr: skrollr.init({    	
	    beforerender: function(data) {
				//console.log('beforerender');
			},
			render: function() {
				//console.log('render');
			},
			easing: {
				//WTF: Math.random,
				//inverted: function(p) {
				//	return 1-p;
				//}
			}
		}),
		    
    // Default to the application thinking it's live.
    live: true,

    // Collection of all debate messages.
    messages: {},

    // Buffer incoming messages when replay is happening.
    bufferedMessages: []
  };

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  // Configure LayoutManager with Backbone Boilerplate defaults.
  Backbone.LayoutManager.configure({
    // Allow LayoutManager to augment Backbone.View.prototype.
    manage: true,
			
    paths: {
      layout: "app/templates/layouts/",
      template: "app/templates/"
    },

    fetch: function(path) {
      // Put fetch into `async-mode`.
      var done = this.async();

      // Concatenate the file extension.
      path = path + ".html";

      // If cached, use the compiled template.
      if (JST[path]) {
        return done(JST[path]);
      }

      // Otherwise seek out the template asynchronously.
      $.ajax({ url: app.root + path }).then(function(contents) {
        done(JST[path] = _.template(contents));
      });
    }
  });
  
  var expectedScrollPos;
  var expectedError = 0;
  var throttleInterval = 33;
  $(window).on("scroll", _.throttle(function() {
    if (Math.abs(document.body.scrollTop - expectedScrollPos) > expectedError) {
      app.trigger("scrollBody:user");
    }
    app.trigger("scrollBody");
  }, throttleInterval));

  // setScrollPos
  // Programattical set the scroll position of the body.
  // Arguments:
  // - [object] options
  //   - position [number] - the offset from the top of the document to scroll
  //   - duration [number] - the number of milliseconds over which to animate
  //     the scroll position. If unspecified, the scroll operation will be
  //     synchronous.
  //   - done [dunction] - a callback function which will be invoked once the
  //     scroll operation is complete
  // The entire application should use this method to set the scroll position
  // as it is capable of tracking the expected scroll position over time (which
  // allows for identification of user-triggered scroll events).
  app.setScrollPos = function(options) {

    // Allow for simplified signature where only a position is specified
    if (typeof options === "number") {
      options = {
        position: options
      };
    }

    if (!options || typeof options.position !== "number") {
      throw "setScrollPos requires a position";
    }

    // Support asynchronous and synchronous scrolling
    if(options.duration > 0) {
      $("body")
        .stop()
        .animate({
            scrollTop: options.position
          },
          {
            duration: options.duration,
            complete: options.done,
            step: function(val, tween) {
              var easingFn = $.easing[tween.easing];
              var totalDist = Math.abs(tween.end - tween.start);
              var errorInterval = throttleInterval / tween.options.duration;
              // The maxiumum position should be no greater than 1
              var maxPos = Math.min(1, tween.pos + errorInterval);
              // The minimum position should be no less than 0
              var minPos = Math.max(0, tween.pos - errorInterval);
              var worstCase = Math.max(tween.pos - minPos, maxPos - tween.pos);

              expectedScrollPos = val;
              expectedError = worstCase * totalDist;
            }
          });
    } else {
      expectedScrollPos = options.position;
      expectedError = 0;
      $("body")
        .stop()
        .scrollTop(options.position);

      if (typeof options.done === "function") {
        options.done();
      }
    }
  };

 	// Non-native setTimeout function that lets you pass 'this' context.
	var _nativeST_ = window.setTimeout;
	
	window.setTimeout = function (vCallback, nDelay, iThis/*, argumentToPass1, argumentToPass2, etc. */) {
	  var oThis = iThis, aArgs = Array.prototype.slice.call(arguments, 2);
	  return _nativeST_(vCallback instanceof Function ? function () {
	    vCallback.apply(oThis, aArgs);
	  } : vCallback, nDelay);
	};
	
	// Shim layer with setTimeout fallback
  window.requestAnimFrame = (function(){
  	return	window.requestAnimationFrame       || 
           	window.webkitRequestAnimationFrame || 
           	window.mozRequestAnimationFrame    || 
           	window.oRequestAnimationFrame      || 
           	window.msRequestAnimationFrame     || 
           	function( callback ){
	           	window.setTimeout(callback, 1000 / 60);
	          };
	          })(); 

  // Mix Backbone.Events, modules, and layout management into the app object.
  return _.extend(app, {
    // Create a custom object with a nested Views object.
    module: function(additionalProps) {
      return _.extend({ Views: {} }, additionalProps);
    },

    // Helper for using layouts.
    useLayout: function(name) {
      // If already using this Layout, then don't re-inject into the DOM.
      if (this.layout) {
        return this.layout;
      }

      // Create a new Layout.
      var layout = new Backbone.Layout({
        el: "#layout"
      });

      // Cache the refererence.
      this.layout = layout;

      // Return the reference, for chainability.
      return layout;
    },
    
  }, Backbone.Events);

});
