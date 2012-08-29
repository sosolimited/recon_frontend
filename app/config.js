// Set the require.js configuration for your application.
require.config({

  shim: {
    "libs/engine.io": {
      exports: "eio"
    },

    // Backbone.LayoutManager depends on Backbone.
    "plugins/backbone.layoutmanager": ["backbone"]
  }

});
