// this is a browserify friendly version of https://github.com/ssorallen/jquery-scrollstop

'use strict';

var $ = require('jquery');

var dispatch = $.event.dispatch || $.event.handle;

var special = $.event.special;
var uid1 = 'D' + (+new Date());
var uid2 = 'D' + (+new Date() + 1);

special.scrollstart = {
  setup: function setup(initialData) {
    var data = $.extend({
      latency: special.scrollstop.latency,
    }, initialData);

    var timer;
    var handler = function handler(evt) {
      var self = this;
      var args = arguments;

      if (timer) {
        clearTimeout(timer);
      } else {
        var modifiedEvent = $.extend({}, evt, { type: 'scrollstart' });
        var modifiedArgs = [modifiedEvent].concat(args.slice(1));
        dispatch.apply(self, modifiedArgs);
      }

      timer = setTimeout(function timedOut() {
        timer = null;
      }, data.latency);
    };

    $(this).bind('scroll', handler).data(uid1, handler);
  },
  teardown: function teardown() {
    $(this).unbind('scroll', $(this).data(uid1));
  },
};

special.scrollstop = {
  latency: 250,
  setup: function setup(initialData) {
    var data = $.extend({
      latency: special.scrollstop.latency,
    }, initialData);

    var timer;
    var handler = function handler(evt) {
      var self = this;
      var args = arguments;

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(function timedOut() {
        var modifiedEvent = $.extend({}, evt, { type: 'scrollstart' });
        var modifiedArgs = [modifiedEvent].concat(args.slice(1));
        timer = null;
        dispatch.apply(self, modifiedArgs);
      }, data.latency);
    };

    $(this).bind('scroll', handler).data(uid2, handler);
  },
  teardown: function teardown() {
    $(this).unbind('scroll', $(this).data(uid2));
  },
};
