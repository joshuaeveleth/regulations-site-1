// this is a browserify friendly version of https://github.com/ssorallen/jquery-scrollstop

'use strict';

var $ = require('jquery');

var dispatch = $.event.dispatch || $.event.handle;

var special = $.event.special,
  uid1 = 'D' + (+new Date()),
  uid2 = 'D' + (+new Date() + 1);

special.scrollstart = {
  setup: function setup(data) {
    var _data = $.extend({
      latency: special.scrollstop.latency,
    }, data);

    var timer,
      handler = function handler(evt) {
        var _self = this,
          _args = arguments;

        if (timer) {
          clearTimeout(timer);
        } else {
          evt.type = 'scrollstart';
          dispatch.apply(_self, _args);
        }

        timer = setTimeout(function timedOut() {
          timer = null;
        }, _data.latency);
      };

    $(this).bind('scroll', handler).data(uid1, handler);
  },
  teardown: function teardown() {
    $(this).unbind('scroll', $(this).data(uid1));
  },
};

special.scrollstop = {
  latency: 250,
  setup: function setup(data) {
    var _data = $.extend({
      latency: special.scrollstop.latency,
    }, data);

    var timer,
      handler = function handler(evt) {
        var _self = this,
          _args = arguments;

        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function timedOut() {
          timer = null;
          evt.type = 'scrollstop';
          dispatch.apply(_self, _args);
        }, _data.latency);
      };

    $(this).bind('scroll', handler).data(uid2, handler);
  },
  teardown: function teardown() {
    $(this).unbind('scroll', $(this).data(uid2));
  },
};
