import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'floornav';
const DATA_KEY = 'fe.floornav';
const EVENT_KEY = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const Event = {
  SCROLL: `scroll${EVENT_KEY}`,
  RESIZE: `resize${EVENT_KEY}`,
  CLICK: `click${EVENT_KEY}`,
};

const Selector = {
  DATA_TOGGLE: '[data-toggle="floornav"]',
  ITEM: 'a[href]',
};

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

function Floornav(elem, options) {
  this.options = $.extend({}, Floornav.Default, options);
  this.$elem = $(elem);

  // 搜集导航按钮
  this.$items = $(elem).find(Selector.ITEM);

  // 搜集楼层列表
  this.targets = [];

  this.$items.each((index, item) => {
    this.targets.push($(item.getAttribute('href')));
  });

  // 确定容器 $container
  let container = $(options.container)[0];
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

  this.init();
}

Floornav.Default = {
  container: window, // 容器
  base: 'center',
  threshold: 0,
  activeClass: 'active',
};

Floornav.prototype.init = function () {
  const that = this;

  // bind click of 导航按钮, 滚动到对应楼层
  this._initJump();

  // bind scroll and resize, 判断楼层位置, 设置导航按钮状态
  this._initCheck();

  that.check();
};

Floornav.prototype.check = function () {
  const threshold = this.options.threshold;
  const base = this.options.base;
  const scrollTop = this.$container.scrollTop();
  const height = this.$container.height();
  let baseline;
  let containerTop = 0;

  if (this.$container[0] !== window) {
    containerTop = this.$container.offset().top - scrollTop;
  }

  // 计算参考线位置
  if (base === 'top') {
    baseline = containerTop + scrollTop;
  } else if (base == 'bottom') {
    baseline = containerTop + scrollTop + height;
  } else {
    baseline = containerTop + scrollTop + height / 2;
  }

  // 当滚动出现第一个楼层时, 导航器出现; 否则, 隐藏
  if (this.targets[0].offset().top <= baseline + threshold) {
    this.$elem.fadeIn(500);
  } else {
    this.$elem.fadeOut(500);
  }

  // 判断当前是否有楼层出现
  for (let i = this.targets.length - 1; i >= 0; i--) {
    if (this.targets[i].offset().top <= baseline + threshold) {
      this._setItemActive(this.$items.eq(i));
      break;
    }
  }
};

Floornav.prototype._initJump = function () {
  this.$elem.on(Event.CLICK, Selector.ITEM, (e) => {
    e.preventDefault();

    const $item = $(e.target);
    const $target = $($item.attr('href'));

    // 当前点击按钮设置 current 类
    this._setItemActive($item);
    // 滚动显示导航器对应的楼层
    this._scrollTo($target);
  });
};

Floornav.prototype._initCheck = function () {
  this.$container.on(`${Event.SCROLL},${Event.RESIZE}`, () => {
    if (!this._timer) {
      this._timer = setTimeout(() => {
        this.check();

        clearTimeout(this._timer);
        this._timer = null;
      }, 100);
    }
  });
};

Floornav.prototype._scrollTo = function ($target) {
  // 暂时取消监测
  this.$container.off(Event.SCROLL);
  this.$container.off(Event.RESIZE);

  // $('html,body') 会导致重复执行, 所以这里设置一个标识用来保证只执行一次
  let complete = false;

  let containerTop = 0;
  if (this.$container[0] !== window) {
    containerTop = this.$container.offset().top - this.$container.scrollTop();
  }

  this._$scroll.stop().animate({
    scrollTop: $target.offset().top - containerTop
  }, 300, () => {
    if (complete) {
      return;
    }
    complete = true;

    // 恢复监测
    this._initCheck();
  });
};

Floornav.prototype._setItemActive = function ($item) {
  const activeClass = this.options.activeClass;

  this.$items.removeClass(activeClass);
  $item.addClass(activeClass);
};

/**
 * ------------------------------------------------------------------------
 * Plugin Definition
 * ------------------------------------------------------------------------
 */

function Plugin(config, relatedTarget) {
  return this.each(function () {
    const $this = $(this);
    let data = $this.data(DATA_KEY);
    const _config = $.extend({}, Floornav.Default, $this.data(), typeof config === 'object' && config);

    if (!data) {
      data = new Floornav(this, _config);
      $this.data(DATA_KEY, data);
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config](relatedTarget);
    }
  });
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(function () {
  Plugin.call($(Selector.DATA_TOGGLE));
});

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
}

export default Floornav;
