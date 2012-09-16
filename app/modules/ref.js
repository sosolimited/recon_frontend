define([
  // Application.
  "core/app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Ref = app.module();

  // Distance from bottom of window at which overlays appear and which open sentences sit below.
	Ref.overlayOffset = 200;	  

  // Return the module for AMD compliance.
  return Ref;

});
