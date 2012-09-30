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
	 
	// Transcript leading
	Ref.transcriptPointSize = 18;
	Ref.transcriptLeading = 24;
	
	Ref.bigWordLeading = 336;
	  
	// For development, autoscrolling can be disabled completely
  Ref.disableAutoScroll = false;

  // Position of the most recent sentence
  Ref.overlayOffsetY = 100;

  // Threshold for re-attaching autoscrolling
  Ref.autoscrollReattachThreshold = 20;
  
  // Var grid variables for animation of absolutely positioned elements.
  Ref.gridWidth = 136;
  Ref.gutterWidth = 24;
	Ref.gridColumns = [0, 160, 320, 480, 640, 800, 960];

  //For perspective 1000px, these are the x values to use at chosen z depths to get things to align to the grid columns.
  Ref.gridZn300 = { scalar: 1, grid:[-199, 29, 259, 486, 715, 944] };
  Ref.gridZn200 = { scalar: 1, grid:[-133, 74, 280, 485, 690, 896] };
  Ref.gridZn100 = { scalar: 1, grid:[-65, 117, 301, 483, 666, 849] };
  Ref.gridZn50 = { scalar: 1, grid:[-32, 140, 311, 482, 653, 825] };
  Ref.gridZ50 = { scalar: 1, grid:[34, 183, 332, 480, 629, 777] };
  Ref.gridZ100 = { scalar: 1, grid:[68, 204, 342, 479, 616, 754] };
  Ref.gridZ200 = { scalar: 1, grid:[133, 249, 363, 477, 592, 706] };
  Ref.gridZ300 = { scalar: 1, grid:[201, 293, 384, 475, 567, 658] };

  // Positioning parameters for overlays
  Ref.overlayEnterY = -250; // Distance above line to have big words slide in

  // Return the module for AMD compliance.
  return Ref;

});
