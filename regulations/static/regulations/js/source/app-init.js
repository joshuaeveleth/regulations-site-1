// Module called on app load, once doc.ready

'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var MainView = require('./views/main/main-view');
var Router = require('./router');
var SidebarView = require('./views/sidebar/sidebar-view');
var HeaderView = require('./views/header/header-view');
var DrawerView = require('./views/drawer/drawer-view');
var AnalyticsHandler = require('./views/analytics-handler-view');

Backbone.$ = $;

module.exports = {
    // Purgatory for DOM event bindings that should happen in a View
  bindEvents: function bindEvents() {
        // disable/hide an alert
    $('.disable-link').on( 'click', function click(e) {
      e.preventDefault();
      $(this).closest('.displayed').addClass('disabled');
    });
  },

  init: function init() {
    var regs = window.regs || {};

    Router.start();
    this.bindEvents();
    // Can we avoid `new`s here?
    /* eslint-disable no-new */
    new AnalyticsHandler();
    new HeaderView();  // Header before Drawer as Drawer sends Header events
    new DrawerView({ forceOpen: regs.drawer && regs.drawer.forceOpen });
    new MainView();
    new SidebarView();
    /* eslint-enable */
    setTimeout(function seleniumStart() {
      $('html').addClass('selenium-start');
    }, 5000);
  },
};
