/*!
 * JavaScript TreeView Menu
 * @version 1.0.1
 * @author Jehorn(gerardgu@outlook.com)
 * @param  {string} selecto  Selector
 * @param  {Object} options  Configuration
 * @return {Object} treeView TreeView DOM
 * ========================================
 * 1. 可以通过 callback 参数 return false; 进行拦截默认点击事件
 * 2. childMaxHeight 设置为 0 时，将会设置 display: none
 */
;(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('document'), require('window'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory(document, window));
    } else {
        // Browser globals
        factory(document, window);
    }
}(function (document, window) {
    'use strict';

    /**
     * TreeView
     * @param  {string} selecto  Selector
     * @param  {Object} options  Configuration
     * @return {Object} treeView TreeView object
     */
    function TreeView(selector, options) {
        if (this instanceof TreeView) {
            var container = document.querySelector(selector);
            if (!container) {
                throw new Error('ERR! TreeView: 未能获取到指定的容器.');
            }

            this.container = container;
            options        = options || {};
            this.arr       = options.arr || [];

            // 数组键名
            this.key         = options.key          || 'id';
            this.parentKey   = options.kparentKey   || 'pid';
            this.childrenKey = options.kchildrenKey || 'children';
            this.titleKey    = options.ktitleKey    || 'title';
            this.iconKey     = options.kiconKey     || 'icon';
            this.urlKey      = options.kurlKey      || 'url';
            this.openKey     = options.openKey      || 'open';
            this.activeKey   = options.activeKey    || 'active';

            // 菜单标签
            this.eleWrapper   = options.eleWrapper || 'ul';    // 菜单容器标签
            this.eleItem      = options.eleItem || 'li';       // 菜单项标签
            this.eleItemTitle = options.eleItemTitle || 'a';   // 菜单标题标签
            this.eleItemText  = options.eleItemText || 'span'; // 菜单文本标签
            this.eleIcon      = options.eleIcon || 'i';        // 菜单icon标签

            // 值
            this.childPaddingDirection = options.childPaddingDirection || 'paddingLeft'; // 子菜单缩进方向
            this.paddingChild          = options.paddingChild          || '20px';        // 子菜单左缩进
            this.childMaxHeight        = options.childMaxHeight == 0 ? 0 : '100px';       // 最大高度

            // 事件回调
            this.callback = typeof options.callback === 'function' ? options.callback : function () { };

            // 是否默认展开
            this.isOpen = options.isOpen === true ? true : false;

            this.init();
        } else {
            return new TreeView(selector, options);
        }
    }

    /**
     * 二维数组转树形数组
     * @param  {Array}  src         源数组
     * @param  {string} key         主键
     * @param  {string} parentKey   父键
     * @param  {string} childrenKey 子键
     * @return {Array}  _tree       树形数组
     */
    function _arrData2TreeData(src, key, parentKey, childrenKey) {
        if (!(typeof src === 'object' && src.length)) return;

        key         = key         || 'id';
        parentKey   = parentKey   || 'pid';
        childrenKey = childrenKey || 'children';

        var _tree = [],
            _src = src;

        for (var i = 0; i < _src.length; i++) {
            _src[i][childrenKey] = [];
            for (var len = _src.length, j = len - 1; j >= 0; j--) {
                if (_src[i][parentKey] == _src[j][key]) {
                    _src[j][childrenKey].push(_src[i]);
                }
            }
        }

        for (var i = 0; i < _src.length; i++) {
            if (!_src[i][parentKey]) {
                _tree.push(_src[i]);
            }
        }

        return _tree;
    }

    /**
     * 渲染树形菜单
     * @param  {Array}  treeArr 树形数组
     * @param  {Object} _this   其它参数
     * @return {Array}  wrapper 树形DOM
     */
    function _renderTreeView(treeArr, _this) {
        if (!(typeof treeArr === 'object' && treeArr.length)) return;

        var eleWrapper            = _this.eleWrapper,
            eleItem               = _this.eleItem,
            eleItemTitle          = _this.eleItemTitle,
            eleItemText           = _this.eleItemText,
            eleIcon               = _this.eleIcon,
            childPaddingDirection = _this.childPaddingDirection,
            paddingChild          = _this.paddingChild,
            childMaxHeight        = _this.childMaxHeight;

        var key         = _this.key,
            parentKey   = _this.parentKey,
            childrenKey = _this.childrenKey,
            titleKey    = _this.titleKey,
            iconKey     = _this.iconKey,
            urlKey      = _this.urlKey,
            openKey     = _this.openKey,
            activeKey   = _this.activeKey,
            callback    = _this.callback,
            isOpen      = _this.isOpen;

        // 类名
        var CLASS_NAME = {
            WRAPPER: 'tree-view-wrapper',
            ITEM: 'tree-item',
            ITEM_TEXT: 'item-text',
            CHILD: 'item-child',
            ICON: 'item-icon',
            ACTIVE: 'active'
        };

        // 获取值单位
        var getUnit = /[\d|.]+(\w+)/;

        // 点击事件
        function toggle(e) {
            var child_wrapper = this.parentNode.querySelector('.' + CLASS_NAME.CHILD);

            var _cb = callback(this, child_wrapper);

            if (!child_wrapper) return;
            if (_cb === false) return;
            
            if (child_wrapper.style.maxHeight === '0px'
                || child_wrapper.style.display === 'none') {
                childMaxHeight == 0
                    ? child_wrapper.style.display = 'block'
                    : child_wrapper.style.maxHeight = childMaxHeight;
                return;
            }

            childMaxHeight == 0
                ? child_wrapper.style.display = 'none'
                : child_wrapper.style.maxHeight = '0px';
        }

        // 创建菜单容器
        var wrapper = document.createElement(eleWrapper);
        wrapper.className = CLASS_NAME.WRAPPER;

        // 递归创建菜单项
        function create(_tree, parent) {
            for (var i = 0; i < _tree.length; i++) {
                var item = document.createElement(eleItem),
                    item_t = document.createElement(eleItemTitle),
                    text = document.createElement(eleItemText),
                    t = document.createTextNode(_tree[i][titleKey]),
                    icon = document.createElement(eleIcon);

                // class name
                var _item_classname = CLASS_NAME.ITEM;
                _tree[i][activeKey] === true ? (_item_classname += ' ' + CLASS_NAME.ACTIVE) : '';
                item.className = _item_classname;
                item_t.className = CLASS_NAME.ITEM_TEXT;
                icon.className = CLASS_NAME.ICON;

                // styles
                icon.style.display = 'inline-block';
                icon.style.background = 'url(' + _tree[i][iconKey] + ')';

                // data-id / title
                if (item.dataset) {
                    item.dataset.id = _tree[i][key];
                } else {
                    item.title = _tree[i][key];
                }

                // attr
                if (_tree[i][urlKey]) {
                    item_t.setAttribute('href', _tree[i][urlKey]);
                }

                // bind event
                item_t.addEventListener('click', toggle);

                // append 2 super
                text.appendChild(t);
                item_t.appendChild(icon);
                item_t.appendChild(text);
                item.appendChild(item_t);
                parent.appendChild(item);

                // recursive
                if (_tree[i][childrenKey].length) {
                    var child = document.createElement(eleWrapper);
                    child.className = CLASS_NAME.CHILD;
                    child.style[childPaddingDirection] = parseInt(paddingChild) + getUnit.exec(paddingChild)[1];
                    child.style.overflow = 'hidden';
                    if (_tree[i][openKey] == true || isOpen == true) {
                        childMaxHeight == 0
                            ? child.style.display = 'block'
                            : child.style.maxHeight = childMaxHeight;
                    } else {
                        childMaxHeight == 0
                            ? child.style.display = 'none'
                            : child.style.maxHeight = '0px';
                    }
                    
                    child.style.overflow = 'auto';
                    item.appendChild(child);
                    create(_tree[i][childrenKey], child);
                }
            }
        }

        // 调用创建菜单方法
        create(treeArr, wrapper);

        // 返回创建好的DOM
        return wrapper;
    }

    TreeView.prototype = {
        init: function () {
            var tree_data = _arrData2TreeData(this.arr, this.key, this.parentKey, this.childrenKey);
            var tree_view = _renderTreeView(tree_data, this);

            if (!tree_view) {
                throw new Error('ERR! TreeView: 未能创建菜单 arr 参数可能为空.');
            }
            this.container.appendChild(tree_view);

            return this;
        }
    }

    if (typeof module != 'undefined' && module.exports) {
        module.exports = TreeView;
    } else if (typeof define == 'function' && define.amd) {
        define(function () { return TreeView; });
    } else {
        window.TreeView = TreeView;
    }
}));