/*!
 * Circle Process
 * @version 1.4.2
 * @author Jehorn(gerardgu@outlook.com)
 * IE9/IE9+
 * ======================================
 * 由于IE的SetTimeOut最小时间限制，会出现环形进度条与数字变化效果不一致的情况
 * speed设置小于等于100时没有过渡效果
 * Chrome浏览器下size设置为奇数时，底部会出现漏色。建议使用偶数
 */

;
(function (window, document) {
    'use strict';

    // 内部计数器
    var _counts = 0;

    // 常量
    var constants = {
        CLASS_NAME: {
            WRAPPER: 'wrapper',
            RIGHT: 'circle-right',
            LEFT: 'circle-left',
            CONTENT: 'content',
            CIRCLE: 'circle',
            PREPEND: 'prepend',
            APPEND: 'append',
            PERCENT_SYMBOL: 'symbol-percent',
            PERCENT_BOX: 'percent-box'
        },
        ID_NAME: {
            RIGHT: 'circleRight',
            LEFT: 'circleLeft',
            PERCENT: 'percentProcess'
        },
        PERCENT_INIT: '0%',
        CIRCLE_STYLES: {
            borderRadius: '50%',
            position: 'absolute',
            top: '0',
            transform: 'rotate(-135deg)',
            msTransform: 'rotate(-135deg)',
            mozTransform: 'rotate(-135deg)',
            webkitTransform: 'rotate(-135deg)',
            oTransform: 'rotate(-135deg)'
        },
        CONTENT_STYLES: {
            textAlign: 'center',
            position: 'absolute',
            width: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            msTransform: 'translateY(-50%)',
            mozTransform: 'translateY(-50%)',
            webkitTransform: 'translateY(-50%)',
            oTransform: 'translateY(-50%)'
        },
        NO_ANIMATE_TIME: 100,
        IS_INTERVAL_DEFAULT: false

    }

    var ProcessCircle = function (json) {
        if (this instanceof ProcessCircle) {
            this.author = 'Jehorn';
            this.version = '1.4.2';

            // 进度条的宽/高
            this.size = json.size || 100;
            // 边框的宽度
            this.borderSize = json.borderSize || 3;
            // 显示文字的大小
            this.textSize = json.textSize || 24;
            // 宽高以及边框的单位 px, em, rem
            this.unit = json.unit || 'px';
            // 显示的百分比值
            this.num = json.num || 0;
            // 动画速度 毫秒
            this.speed = json.speed || 600;

            // 容器的 选择器
            this.selector = json.selector || '.process-circle';
            // 是否显示调试信息
            this.debug = json.debug === true ? true : false;
            // 是否显示中间的百分比信息
            this.isText = json.isText === false ? false : true;
            // 百分比信息颜色
            this.textColor = json.textColor || '#ff5f00';
            // 边框颜色
            this.borderColor = json.borderColor || '#ff5f00';
            // 边框背景色
            this.borderBgColor = json.borderBgColor || '#dddddd';
            // 边框样式
            this.borderType = json.borderType || 'solid';
            // 是否需要实例化完毕自动渲染
            // 如果为 false, 需要在实例化完毕后调用 init 方法
            this.isInit = json.isInit === false ? false : true;
            // 是否直接使用setInterval
            this.isInterval = json.isInterval === !constants.IS_INTERVAL_DEFAULT ? !constants.IS_INTERVAL_DEFAULT : constants.IS_INTERVAL_DEFAULT;

            // 追加内容
            this.prepend = json.prepend || '';
            this.append = json.append || '';

            if (this.isInit) {
                this.init();
            }

        } else {
            return new ProcessCircle(json);
        }
    }

    // 控制台打印信息
    var debug = function (_this, json) {
        this.info = json.info || '';
        this.type = json.type || 'log';

        if (_this.debug) {
            console.log('%c Debug message from ProcessCircle: ', 'background: #ff5f00;color: #fff;font-size: 12px;');

            var consoleTypes = ['log', 'write', 'warn', 'warning', 'error'];
            var infoPrint = function (consoles) {
                try {
                    if (typeof (this.info) === 'string') {
                        consoles(this.info);
                        return;
                    }
                    if (this.info instanceof Array || typeof (this.info) === 'object') {
                        for (var i in this.info) {
                            if (typeof (this.info[i] === 'object')) {
                                for (var j in this.info[i]) {
                                    consoles(j + ': ' + this.info[i][j]);
                                }
                            } else {
                                consoles(i + ': ' + this.info[i]);
                            }
                        }
                        return;
                    }
                } catch (e) {
                    console.error(e);
                    return;
                }
            }

            if (this.type) {
                this.type = this.type.toString().toLowerCase();

                switch (this.type) {
                    case 'log':
                        infoPrint(console.log);
                        break;
                    case 'write':
                        infoPrint(console.log);
                        break;
                    case 'warn':
                        infoPrint(console.warn);
                        break;
                    case 'warning':
                        infoPrint(console.warn);
                        break;
                    case 'error':
                        infoPrint(console.error);
                        break;
                    default:
                        infoPrint(console.log);
                        break;
                }
            }
        }
    }

    // 公共工具
    var utils = new (function () {
        var self = this;
        this.isIE9 = false;

        // 是否非空数组
        this.isArray = function (attr, callback) {
            var isArr = false;
            callback = typeof callback === 'function' ? callback : function () { };
            if (typeof attr === 'object' && attr.length) {
                isArr = true;
                callback(isArr);
            } else {
                isArr = false;
                callback(isArr);
            }

            return isArr;
        }

        // 删除容器下的所有元素
        this.delChildren = function (ele) {
            if (!ele) return;
            while (ele.hasChildNodes()) {
                ele.removeChild(ele.firstChild);
            }
        }

        // 设置dom的className
        this.setClasses = function (ele, classnames) {
            var classes = '';
            if (typeof classnames === 'string') {
                classes = classnames;
            } else if (typeof classnames === 'object' && classnames.length) {
                for (var len = classnames.length, i = len - 1; i >= 0; i--) {
                    classes += classnames[i] + ' ';
                }
            }

            ele.className = classes;
        }

        // 设置dom的style
        this.setStyles = function (ele, styles) {
            if (typeof styles === 'object' && !styles.length) {
                for (var style in styles) {
                    ele.style[style] = styles[style];
                }
            }
        }

        // 获取数组/字符串属性值
        this.getText = function (attr, index) {
            var text;
            if (typeof attr === 'object' && attr.length && (attr[index] || attr[index] == 0)) {
                text = attr[index];
            } else if (typeof attr === 'object' && attr.length) {
                text = attr[0];
            } else {
                text = attr;
            }

            return text;
        }

        // CSS3 transform 兼容性设置
        this.transformCompatibility = function (ele, value) {
            ele.style.transform = value;
            ele.style.msTransform = value;
            ele.style.mozTransform = value;
            ele.style.webkitTransform = value;
            ele.style.oTransform = value;
        }

        // CSS3 transition 兼容性设置
        this.transitionCompatibility = function (ele, value) {
            ele.style.transition = value;
            ele.style.mozTransition = value;
            ele.style.webkitTransition = value;
            ele.style.oTransition = value;
        }

        // 判断是否IE9
        this._isIE9 = function () {
            if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i) == "9.") {
                self.isIE9 = true;
            }
        }();

        // 传入值验证合法性
        // 自动转换
        this.checkParam = function (_this) {
            var errors = [];

            var float = /^(-?\d+)(\.\d+)?$/;
            var floatPlus = /^\d+(\.\d+)?$/;
            var color = /^#[0-9a-fA-F]{3,6}$/;
            var units = ['px', 'em', 'rem'];
            var borderStyle = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit'];

            var checkIsArrAttr = function (attr, check) {
                utils.isArray(attr, function (isArr) {
                    if (isArr) {
                        for (var len = attr.length, i = len - 1; i >= 0; i--) {
                            check(attr[i]);
                        }
                    } else {
                        check(attr);
                    }
                });
            }

            if (units.indexOf(_this.unit) < 0) {
                var error = { param: 'unit', msg: '属性包括[\'px\', \'em\', \'rem\']' };
                errors.push(error);
            }

            // size
            var checkSize = function (size) {
                if (!floatPlus.test(size)) {
                    var error = { param: 'size', msg: '请设置为非负数字' };
                    errors.push(error);
                }
            }

            checkIsArrAttr(_this.size, checkSize);

            // borderSize
            var checkBorderSize = function (borderSize) {
                if (!floatPlus.test(borderSize)) {
                    var error = { param: 'borderSize', msg: '请设置为非负数字' };
                    errors.push(error);
                }
            }

            checkIsArrAttr(_this.borderSize, checkBorderSize);

            // textSize
            var checkTextSize = function (textSize) {
                if (!floatPlus.test(textSize)) {
                    var error = { param: 'textSize', msg: '请设置为非负数字' };
                    errors.push(error);
                }
            }

            checkIsArrAttr(_this.textSize, checkTextSize);

            // num
            var checkNum = function (percent) {
                if (percent.toString().indexOf('%') > -1) {
                    var num = percent.toString().substring(0, _this.num.toString().indexOf('%'));
                    percent = num;
                    debug(_this, { info: 'num: Get value before the \'%\': ', type: 'log' });
                }
                if (!floatPlus.test(percent)) {
                    var error = { param: 'num', msg: '请设置为非负数字' };
                    errors.push(error);
                }
            }

            checkIsArrAttr(_this.num, checkNum);

            // speed
            var checkSpeed = function (speed) {
                if (!float.test(speed)) {
                    var error = { param: 'speed', msg: '属性请设置为数字' };
                    errors.push(error);
                }
            };

            checkIsArrAttr(_this.speed, checkSpeed);

            // textColor
            var checkTextColor = function (textColor) {
                if (!color.test(textColor)) {
                    var error = { param: 'textColor', msg: '请正确设置\'textColor\'属性的16进制颜色值' };
                    errors.push(error);
                }
            };

            checkIsArrAttr(_this.textColor, checkTextColor);

            // borderColor
            var checkBorderColor = function (borderColor) {
                if (!color.test(borderColor)) {
                    var error = { param: 'borderColor', msg: '请正确设置\'borderColor\'属性的16进制颜色值' };
                    errors.push(error);
                }
            };

            checkIsArrAttr(_this.borderColor, checkBorderColor);

            // borderBgColor
            var checkBorderBgColor = function (BgColor) {
                if (!color.test(BgColor)) {
                    var error = { param: 'borderBgColor', msg: '请正确设置\'borderBgColor\'属性的16进制颜色值' };
                    errors.push(error);
                }
            };

            checkIsArrAttr(_this.borderBgColor, checkBorderBgColor);

            // borderType
            var checkBorderType = function (borderType) {
                if (borderStyle.indexOf(borderType) < 0) {
                    var error = { param: 'borderStyle', msg: '请正确设置\'borderStyle\'属性的属性值, 具体属性请参考 http://www.w3school.com.cn/cssref/pr_border-style.asp' };
                    errors.push(error);
                }
            };

            checkIsArrAttr(_this.borderType, checkBorderType);

            if (errors.length > 0) {
                debug(_this, {
                    info: errors,
                    type: 'error'
                });
                return false;
            }

            return true;
        }

    })();

    // 创建DOM
    var create = function (_this, index) {
        var docFragment = document.createDocumentFragment();
        var class_names = constants.CLASS_NAME,
            id_names = constants.ID_NAME;

        var right = document.createElement('div'),
            left = document.createElement('div'),
            content = document.createElement('div');
        var right_in = document.createElement('div'),
            left_in = document.createElement('div'),
            prepend = document.createElement('span'),
            percent = document.createElement('span'),
            append = document.createElement('span');

        if (_this.counts > 1) {
            var prepend_t = document.createTextNode(utils.getText(_this.prepend, index)),
                append_t = document.createTextNode(utils.getText(_this.append, index));
        } else {
            var prepend_t = document.createTextNode(_this.prepend),
                append_t = document.createTextNode(_this.append);
        }
        var percent_t = document.createTextNode(constants.PERCENT_INIT);

        utils.setClasses(right, [class_names.WRAPPER, class_names.RIGHT]);
        utils.setClasses(left, [class_names.WRAPPER, class_names.LEFT]);
        utils.setClasses(content, class_names.CONTENT);
        utils.setClasses(right_in, class_names.CIRCLE);
        utils.setClasses(left_in, class_names.CIRCLE);
        utils.setClasses(prepend, class_names.PREPEND);
        utils.setClasses(append, class_names.APPEND);
        utils.setClasses(percent, class_names.PERCENT_BOX);

        right_in.id = id_names.RIGHT + '_' + _counts;
        left_in.id = id_names.LEFT + '_' + _counts;
        percent.id = id_names.PERCENT + '_' + _counts;

        prepend.appendChild(prepend_t);
        append.appendChild(append_t);
        _this.isText ? percent.appendChild(percent_t) : '';

        right.appendChild(right_in);
        left.appendChild(left_in);
        content.appendChild(prepend);
        content.appendChild(percent);
        content.appendChild(append);

        docFragment.appendChild(right);
        docFragment.appendChild(left);
        docFragment.appendChild(content);

        _counts++;

        return {
            right: right,
            left: left,
            content: content,
            right_in: right_in,
            left_in: left_in,
            prepend: prepend,
            append: append,
            percent: percent,
            doc_fragment: docFragment
        };
    }

    // 设置样式
    var setStyle = function (_this, doms) {
        var wrapper_size_full = parseFloat(utils.getText(_this.size, doms.index)),
            wrapper_size = wrapper_size_full / 2,
            border_size = parseFloat(utils.getText(_this.borderSize, doms.index)),
            circle_size = wrapper_size_full - border_size * 2,
            border_type = utils.getText(_this.borderType, doms.index),
            border_bg_color = utils.getText(_this.borderBgColor, doms.index),
            border_color = utils.getText(_this.borderColor, doms.index),
            text_size = utils.getText(_this.textSize, doms.index),
            text_color = utils.getText(_this.textColor, doms.index);

        var wrappers = [doms.right, doms.left],
            circles = [doms.right_in, doms.left_in];
        var bgBorder = border_size + _this.unit + ' ' + border_type + ' ' + border_bg_color;

        for (var i = 0; i < wrappers.length; i++) {
            // wrappers[i].style.width = wrapper_size + _this.unit;
            wrappers[i].style.height = wrapper_size_full + _this.unit;
            wrappers[i].style.position = 'absolute';
            wrappers[i].style.top = '0';
            wrappers[i].style.overflow = 'hidden';
            circles[i].style.width = circle_size + _this.unit;
            circles[i].style.height = circle_size + _this.unit;
            circles[i].style.border = bgBorder;
            utils.setStyles(circles[i], constants.CIRCLE_STYLES);
        }

        doms.right.style.width = Math.floor(wrapper_size) + _this.unit;
        doms.left.style.width = Math.ceil(wrapper_size) + _this.unit;
        doms.right.style.right = '0';
        doms.left.style.left = '0';

        doms.right_in.style.borderTopColor = utils.getText(border_color, doms.index);
        doms.right_in.style.borderRightColor = utils.getText(border_color, doms.index);
        doms.right_in.style.right = '0';
        utils.transitionCompatibility(doms.right_in, 'transform ' + doms.speed / 2 + 'ms linear');
        doms.left_in.style.borderBottomColor = utils.getText(border_color, doms.index);
        doms.left_in.style.borderLeftColor = utils.getText(border_color, doms.index);
        doms.left_in.style.left = '0';
        utils.transitionCompatibility(doms.left_in, 'transform ' + doms.speed / 2 + 'ms linear');

        utils.setStyles(doms.content, constants.CONTENT_STYLES);
        doms.content.style.fontSize = text_size + _this.unit;
        doms.content.style.color = text_color;

        doms.prepend.style.display = 'block';
        doms.append.style.display = 'block';

        doms.container.style.width = wrapper_size_full + _this.unit;
        doms.container.style.height = wrapper_size_full + _this.unit;
        doms.container.style.position = 'relative';

        utils.delChildren(doms.container);
        doms.container.appendChild(doms.doc_fragment);
    }

    // percent animate
    var setPercentNumber = function (_this, doms) {
        var i = 0;

        if (doms.speed <= constants.NO_ANIMATE_TIME) {
            doms.percent.innerHTML = doms.num + '%';
            return;
        }

        var timer = window.setInterval(function () {
            i++;
            if (i > doms.num) {
                i = doms.num;
                window.clearInterval(timer);
            }
            // _this.isText ? doms.percent.innerHTML = i + '<span class="' + constants.CLASS_NAME.PERCENT_SYMBOL + '">%</span>' : '';
            _this.isText ? doms.percent.innerHTML = i + '%' : '';
        }, doms.speed / doms.num);
    }

    // async to animate
    var setPercentCircle = function (_this, doms) {

        if (doms.num <= 50) {
            utils.transitionCompatibility(doms.right_in, 'transform ' + doms.speed + 'ms linear');
        }

        if (doms.speed <= constants.NO_ANIMATE_TIME) {
            utils.transitionCompatibility(doms.right_in, 'transform 0ms linear');
            utils.transitionCompatibility(doms.left_in, 'transform 0ms linear');
        }

        window.setTimeout(function () {
            if (doms.num <= 50) {
                utils.transformCompatibility(doms.right_in, 'rotate(' + (-135 + 3.6 * doms.num) + 'deg)');
                utils.transformCompatibility(doms.left_in, 'rotate(-135deg)');
            } else {
                utils.transformCompatibility(doms.right_in, 'rotate(45deg)');

                if (doms.speed <= constants.NO_ANIMATE_TIME) {
                    utils.transformCompatibility(doms.left_in, 'rotate(' + (-135 + 3.6 * (doms.num - 50)) + 'deg)');
                    return;
                }

                setTimeout(function () {
                    utils.transformCompatibility(doms.left_in, 'rotate(' + (-135 + 3.6 * (doms.num - 50)) + 'deg)');
                }, doms.speed / 2);
            }
        }, 0);
    }

    // 设置百分比及效果
    var setPercent = function (_this, doms) {
        if (utils.isIE9 || _this.isInterval) {
            var i = 0;

            utils.transitionCompatibility(doms.right_in, 'transform ' + 0 + 'ms linear');
            utils.transitionCompatibility(doms.left_in, 'transform ' + 0 + 'ms linear');

            var clock = window.setInterval(function () {
                i++;
                if (i > doms.num) {
                    i = doms.num;
                    window.clearInterval(clock);
                }
                // _this.isText ? doms.percent.innerHTML = i + '<span class="' + constants.CLASS_NAME.PERCENT_SYMBOL + '">%</span>' : '';
                _this.isText ? doms.percent.innerHTML = i + '%' : '';

                if (i <= 50) {
                    utils.transformCompatibility(doms.right_in, 'rotate(' + (-135 + 3.6 * i) + 'deg)');
                    utils.transformCompatibility(doms.left_in, 'rotate(-135deg)');
                } else {
                    utils.transformCompatibility(doms.right_in, 'rotate(45deg)');
                    utils.transformCompatibility(doms.left_in, 'rotate(' + (-135 + 3.6 * (i - 50)) + 'deg)');
                }

            }, doms.speed / doms.num);

            return;
        }

        setPercentCircle(_this, doms);
        setPercentNumber(_this, doms);
    }

    ProcessCircle.prototype = {
        // 初始化
        init: function () {
            var percent = this.num + '%';

            var check = utils.checkParam(this);

            if (!check) {
                return;
            }

            var containers = document.querySelectorAll(this.selector);

            if (!containers || !containers.length) {
                var error = { msg: '未选取到容器, 请传入正确的 class或id选择器 字符串或者不传值使用默认 class: ".process-circle".', type: 'error' }
                debug(this, {
                    info: error.msg,
                    type: error.type
                });
                return false;
            }

            this.containers = containers;
            this.counts = containers.length;
            this.doms = [];
            for (var i = this.counts - 1; i >= 0; i--) {
                var doms = create(this, i);
                if (doms) {
                    doms.container = containers[i];
                    doms.index = i;
                    doms.speed = parseFloat(utils.getText(this.speed, doms.index));
                    doms.num = parseFloat(utils.getText(this.num, doms.index));
                    setStyle(this, doms);
                    setPercent(this, doms);
                }

                this.doms.push(doms);
            }

            return this;
        },

        // 设置百分比
        set: function (index, percent) {
            var self = this;
            var is_arr = utils.isArray(index);
            var is_num = function (val) {
                val = +val;
                val = isNaN(val) ? 0 : val;

                return val;
            };
            var set_num = function (index, val) {
                if (utils.isArray(self.num)) {
                    self.num[index] = val;
                    return;
                }

                self.num = val;
            }
            var set_default_index = function (arr) {
                var _arr = [];
                for (var i = 0; i < arr.length; i++) {
                    _arr.push(i);
                }

                return _arr;
            }

            if (!arguments.length) return;
            if (arguments.length === 1) {
                percent = index;
                if (is_arr) {
                    index = set_default_index(percent);
                }
            }
            
            if (is_arr) {
                for (var i = 0; i < index.length; i++) {
                    var _p = utils.getText(percent, i);
                    var _i = is_num(index[i]);
                    set_num(_i, _p);
                    this.init();
                }
            } else {
                index = is_num(index);
                set_num(index, utils.getText(percent, 0));
                this.init();
            }
        }
    }

    window.ProcessCircle = ProcessCircle;

})(window, document);
