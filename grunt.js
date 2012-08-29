// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
module.exports = function(grunt) {

  // Load in the defaults.
  var defaults = require("./app/core/Gruntfile.js");

  // Initialize the configuration.
  grunt.initConfig(defaults(grunt));

};
