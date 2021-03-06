/*!
 * @autofe/floornav v0.5.2
 * (c) 2019 Autohome Inc.
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global.AutoFE = global.AutoFE || {}, global.AutoFE.Floornav = factory(global.jQuery));
}(this, (function ($) { 'use strict';

$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

var NAME = 'floornav';
var DATA_KEY = 'fe.floornav';
var EVENT_KEY = '.' + DATA_KEY;
var JQUERY_NO_CONFLICT = $.fn[NAME];

var Event = {
  SCROLL: 'scroll' + EVENT_KEY,
  RESIZE: 'resize' + EVENT_KEY,
  CLICK: 'click' + EVENT_KEY
};

var Selector = {
  ITEM: 'a[href]'
};

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

function Floornav(elem, options) {
  var _this = this;

  this.options = $.extend({}, Floornav.Default, options);
  this.$elem = $(elem);

  // 搜集导航按钮
  this.$items = $(elem).find(Selector.ITEM);

  // 搜集楼层列表
  this.targets = [];

  this.$items.each(function (index, item) {
    var $target = $(item.getAttribute('href'));
    if ($target && $target.length > 0) {
      _this.targets.push($target);
    }
  });

  // 确定容器 $container
  var container = $(options.container)[0];
  if (container.tagName === 'BODY' || container.tagName === 'HTML') {
    container = window;
  }
  this.$container = $(container);

  // window 不能设置 animate(scrollTop)
  this._$scroll = this.$container;
  if (container === window) {
    this._$scroll = $('html,body');
  }

  // 定时器
  this._timer = null;
  // 导航器是否展示
  this.isShown = false;

  this.init();
}

Floornav.Default = {
  container: window, // 容器
  base: 'center',
  threshold: 0,
  scrollOffset: 0,
  activeClass: 'active',
  showClass: 'show'
};

Floornav.prototype.init = function () {
  var that = this;

  // bind click of 导航按钮, 滚动到对应楼层
  this._initJump();

  // bind scroll and resize, 判断楼层位置, 设置导航按钮状态
  this._initCheck();

  that.check();
};

Floornav.prototype.check = function () {
  var _this2 = this;

  var threshold = this.options.threshold;
  var base = this.options.base;
  var height = this.$container.height();
  var baseline = void 0;
  var containerTop = 0;

  if (this.$container[0] !== window) {
    containerTop = this.$container[0].getBoundingClientRect().top;
  }

  // 计算参考线位置
  if (base === 'top') {
    baseline = containerTop;
  } else if (base == 'bottom') {
    baseline = containerTop + height;
  } else {
    baseline = containerTop + height / 2;
  }

  // 当滚动出现第一个楼层时, 导航器出现; 否则, 隐藏
  var $firstTarget = this.targets[0];
  if ($firstTarget[0].getBoundingClientRect().top <= baseline + threshold) {
    if (!this.isShown) {
      this.$elem[0].style.display = 'block';
      setTimeout(function () {
        _this2.$elem.addClass(_this2.options.showClass);
      }, 0);
      this.isShown = true;
    }
  } else {
    if (this.isShown) {
      this.$elem.removeClass(this.options.showClass);
      this.$elem[0].style.display = 'none';
      this.isShown = false;
    }
  }

  // 判断当前是否有楼层出现
  for (var i = this.targets.length - 1; i >= 0; i--) {
    var $currentTarget = this.targets[i];
    if ($currentTarget[0].getBoundingClientRect().top <= baseline + threshold) {
      var id = $currentTarget.attr('id');
      var $item = this.$elem.find('a[href="#' + String(id) + '"]');
      this._setItemActive($item);
      break;
    }
  }
};

Floornav.prototype.update = function () {
  var _this3 = this;

  // 搜集导航按钮
  this.$items = this.$elem.find(Selector.ITEM);

  // 搜集楼层列表
  this.targets = [];

  this.$items.each(function (index, item) {
    var $target = $(item.getAttribute('href'));
    if ($target && $target.length > 0) {
      _this3.targets.push($target);
    }
  });
};

Floornav.prototype._initJump = function () {
  var _this4 = this;

  this.$elem.on(Event.CLICK, Selector.ITEM, function (e) {
    e.preventDefault();

    var $item = $(e.currentTarget);
    var $target = $($item.attr('href'));

    // 当前点击按钮设置 current 类
    _this4._setItemActive($item);
    // 滚动显示导航器对应的楼层
    _this4._scrollTo($target);
  });
};

Floornav.prototype._initCheck = function () {
  var _this5 = this;

  this.$container.on(String(Event.SCROLL) + ',' + String(Event.RESIZE), function () {
    if (!_this5._timer) {
      _this5._timer = setTimeout(function () {
        _this5.check();

        clearTimeout(_this5._timer);
        _this5._timer = null;
      }, 100);
    }
  });
};

Floornav.prototype._scrollTo = function ($target) {
  var _this6 = this;

  if (!$target || $target.length <= 0) {
    return;
  }

  // 暂时取消监测
  this.$container.off(Event.SCROLL);
  this.$container.off(Event.RESIZE);

  // $('html,body') 会导致重复执行, 所以这里设置一个标识用来保证只执行一次
  var complete = false;

  var containerTop = 0;
  if (this.$container[0] !== window) {
    containerTop = this.$container.offset().top - this.$container.scrollTop();
  }

  var scrollOffset = this.options.scrollOffset;

  this._$scroll.stop().animate({
    scrollTop: $target.offset().top - scrollOffset - containerTop
  }, 150, function () {
    if (complete) {
      return;
    }
    complete = true;

    // 恢复监测
    _this6._initCheck();
  });
};

Floornav.prototype._setItemActive = function ($item) {
  var activeClass = this.options.activeClass;

  if (!$item.hasClass(activeClass)) {
    this.$items.removeClass(activeClass);
    $item.addClass(activeClass);
  }
};

/**
 * ------------------------------------------------------------------------
 * Plugin Definition
 * ------------------------------------------------------------------------
 */

function Plugin(config, relatedTarget) {
  return this.each(function () {
    var $this = $(this);
    var data = $this.data(DATA_KEY);
    var _config = $.extend({}, Floornav.Default, $this.data(), typeof config === 'object' && config);

    if (!data) {
      data = new Floornav(this, _config);
      $this.data(DATA_KEY, data);
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError('No method named "' + config + '"');
      }
      data[config](relatedTarget);
    }
  });
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Plugin;
$.fn[NAME].Constructor = Floornav;
$.fn[NAME].noConflict = function () {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Plugin;
};

return Floornav;

})));
