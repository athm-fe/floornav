# Floornav

## HTML 结构


```html
<div class="floornav" data-toggle="floornav">
  <a href="#floor1">1楼</a>
  <a href="#floor2">2楼</a>
  <a href="#floor3">3楼</a>
  <a href="#floor4">4楼</a>
  <a href="#floor5">5楼</a>
  <a href="#floor6">6楼</a>
</div>

<div class="floor">占位</div>
<div id="floor1" class="floor">这是1楼</div>
<div id="floor2" class="floor">这是2楼</div>
<div id="floor3" class="floor">这是3楼</div>
<div id="floor4" class="floor">这是4楼</div>
<div id="floor5" class="floor">这是5楼</div>
<div id="floor6" class="floor">这是6楼</div>
<div class="floor">占位</div>
```

## Usage

可以通过两种方式来初始化控件, 你可以根据自己的需要来进行选择.

```html
<div class="floornav" data-toggle="floornav"></div>
```

或者

```javascript
$('.floornav').floornav(options);
```

## Options

参数可以通过 data attributes 或者 JavaScript 两种方式来配置.

Name | Type | Default | Description
---- | ---- | ------- | -----------
container | object | window | 滚动容器.
base | string | 'center' | 计算区块位置的参照线, 值可以为 `'center'`, `'top'`, `'bottom'`.
threshold | number | 0 | 距离参照线多远即认为区块出现.
activeClass | string | active | 导航器当前项样式
showClass | string | show | 导航器显示时添加的样式
scrollOffset | number | 0 | 滚动差值, 假如页面有吸顶元素, 点击导航滚动到对应楼层时会被遮挡, 所以提供了这个参数来解决问题.

## Methods

### `.floornav(options)`

初始化.

```javascript
$('#floornav').floornav({
  threshold: 100
});
```

### `.floornav('check')`

触发一次手动检查.

```javascript
$('#floornav').floornav('check');
```

### `.floornav('update')`

当导航或者楼层有变化时，需要手动更新

```javascript
$('#floornav').floornav('update');
```

## Event

None.

# End

Thanks to [Bootstrap](http://getbootstrap.com/)
