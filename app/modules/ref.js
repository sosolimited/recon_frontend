define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Ref = app.module();

  // Distance from bottom of window at which overlays appear and which open sentences sit below.
	Ref.overlayOffsetY = 200;	
	  
	// Var grid variables for animation of absolutely positioned elements.
	Ref.gridColumns = [0, 160, 320, 480, 640, 800, 960];

  // For development, autoscrolling can be disabled completely
  Ref.disableAutoScroll = false;

  // Position of the most recent sentence
  Ref.overlayOffsetY = 100;

  // Return the module for AMD compliance.
  return Ref;

});
