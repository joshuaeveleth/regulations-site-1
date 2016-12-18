'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var RegModel = require('../../models/reg-model');
var SxSList = require('./sxs-list-view');
var SidebarModel = require('../../models/sidebar-model');
var DefinitionModel = require('../../models/definition-model');
var Breakaway = require('../breakaway/breakaway-view');
var SidebarEvents = require('../../events/sidebar-events');
var Definition = require('./definition-view');
var MetaModel = require('../../models/meta-model');
var MainEvents = require('../../events/main-events');
var Helpers = require('../../helpers.js');

Backbone.$ = $;

var SidebarView = Backbone.View.extend({
  el: '#sidebar-content',

  events: {
    'click .expandable': 'toggleExpandable',
  },

  initialize: function initialize() {
    this.listenTo(SidebarEvents, 'update', this.updateChildViews);
    this.listenTo(SidebarEvents, 'definition:open', this.openDefinition);
    this.listenTo(SidebarEvents, 'definition:close', this.closeDefinition);
    this.listenTo(SidebarEvents, 'section:loading', this.loading);
    this.listenTo(SidebarEvents, 'section:error', this.loaded);
    this.listenTo(SidebarEvents, 'breakaway:open', this.hideChildren);

    this.childViews = {'sxs': new SxSList()};
    this.definitionModel = DefinitionModel;
    this.model = SidebarModel;
        /* Cache the initial sidebar */
    this.$el.find('[data-cache-key=sidebar]').each(function perSidebar(idx, el) {
      var $el = $(el);
      SidebarModel.set($el.data('cache-value'), $el.html());
    });
  },

  openDefinition: function openDefinition(config) {
    this.childViews.definition = new Definition({
      id: config.id,
      term: config.term,
    });

    this.definitionModel.get(config.id, {}).then(function handleResponse(resp) {
      this.childViews.definition.render(resp);
    }.bind(this)).fail(function fail() {
      var errorMsg = 'We tried to load that definition, but something went wrong. ';
      errorMsg += '<a href="#" class="update-definition inactive internal" data-definition="' + this.childViews.definition.id + '">Try again?</a>';
      this.childViews.definition.renderError(errorMsg);
    }.bind(this));
  },

  closeDefinition: function closeDefinition() {
    if (typeof this.childViews.definition !== 'undefined') {
      this.childViews.definition.remove();
    }
  },

  updateChildViews: function updateChildViews(context) {
    this.$definition = this.$definition || this.$el.find('#definition');
    switch (context.type) {
      case 'reg-section':
        this.model.get(context.id, {}).then(this.openRegFolders.bind(this));
        MainEvents.trigger('definition:carriedOver');

          // definition container is hidden when SxS opens
        if (this.$definition.is(':hidden')) {
          this.$definition.show();
        }

        break;
      case 'search':
        this.removeChildren();
        this.loaded();
        break;
      case 'diff':
        this.loaded();
        break;
      default:
        this.removeChildren();
        this.loaded();
    }

    this.removeLandingSidebar();
  },

    /* AJAX retrieved a sidebar. Replace the relevant portions of the
     * existing sidebar */
  openRegFolders: function openRegFolders(html) {
        // remove all except definition
    this.removeChildren('definition');

    this.$el.find('[data-cache-key=sidebar]').remove();
    this.$el.append(html);

        // new views to bind to new html
    this.childViews.sxs = new SxSList();
    this.loaded();
  },

  removeLandingSidebar: function removeLandingSidebar() {
    $('.landing-sidebar').hide();
  },

  insertDefinition: function insertDefinition(el) {
    this.closeExpandables();

    if (this.$el.definition.length === 0) {
            // if the page was loaded on the landing, search or 404 page,
            // it won't have the content sidebar template
      this.$el.prepend('<section id="definition"></section>');
      this.$el.definition = this.$el.find('#definition');
    }

    this.$el.definition.html(el);
  },

  closeExpandables: function closeExpandables() {
    this.$el.find('.expandable').each(function perEl(i, folder) {
      var $folder = $(folder);
      if ($folder.hasClass('open')) {
        this.toggleExpandable($folder);
      }
    }.bind(this));
  },

  toggleExpandable: function toggleExpandable(e) {
    var $expandable;

    if (typeof e.stopPropagation !== 'undefined') {
      e.stopPropagation();
      $expandable = $(e.currentTarget);
    } else {
      $expandable = e;
    }
    Helpers.toggleExpandable($expandable, 400);
  },

  removeChildren: function removeChildren(except) {
    var _this = this;
    $.each(this.childViews, function perProperty(key, value) {
      if (!except || except !== key) {
        _this.childViews[key].remove();
      }
    });
    /* Also remove any components of the sidebar which don't have a Backbone
     * view */
    this.$el.find('.regs-meta').remove();
  },

  loading: function loading() {
    this.$el.addClass('loading');
  },

  loaded: function loaded() {
    this.$el.removeClass('loading');
  },

    // when breakaway view loads
  hideChildren: function hideChildren() {
    this.loading();
  },
});

module.exports = SidebarView;
