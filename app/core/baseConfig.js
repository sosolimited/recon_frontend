// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["config", "core/main"],

  baseUrl: "/app",

  paths: {
    // JavaScript folders.
    libs: "../vendor/js/libs",
    plugins: "../vendor/js/plugins",
    vendor: "../vendor/vendor",

    // Libraries.
    jquery: "../vendor/js/libs/jquery",
    lodash: "../vendor/js/libs/lodash",
    backbone: "../vendor/js/libs/backbone"
  },

  shim: {
    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    }
  }

});

