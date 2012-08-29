// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["core/main"],

  paths: {
    // JavaScript folders.
    libs: "../vendor/js/libs",
    plugins: "../vendor/js/plugins",
    vendor: "../vendor/vendor",
    core: "../core",

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
    },

    "libs/engine.io": {
      exports: "eio"
    },

    // Backbone.LayoutManager depends on Backbone.
    "plugins/backbone.layoutmanager": ["backbone"]
  }

});
