/*!
 * Circle Process
 * @version 1.2.0
 * @author Jehorn(gerardgu@outlook.com)
 * IE9/IE9+
 */

;
(function (window, document) {
    var ProcessCircle = function (json) {
        if (this instanceof ProcessCircle) {
            this.author = 'Jehorn';
            this.version = '1.2.0';
			
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
            this.speed = json.speed || 10;

            // 容器的 id
            this.id = json.id || 'processCircle';
            // 是否显示调试信息
            this.debug = json.debug === true ? true : false;
            // 是否显示中间的百分比信息
            this.isText = json.isText || true;
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
			APPEND: 'append'
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

	
	var utils = new (function () {
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
		
		this.setStyles = function (ele, styles) {
			if (typeof styles === 'object' && !styles.length) {
				for (var style in styles) {
					ele.style[style] = styles[style];
				}
			}
		}
		
		// CSS3 transform 兼容性设置
		this.transformCompatibility = function (ele, value) {
			ele.style.transform = value;
			ele.style.msTransform = value;
			ele.style.mozTransform = value;
			ele.style.webkitTransform = value;
			ele.style.oTransform = value;
		}
		
		// 传入值验证合法性
		// 自动转换
		this.checkParam = function (_this) {
			var errors = [];

			var float = /^(-?\d+)(\.\d+)?$/;
			var floatPlus = /^\d+(\.\d+)?$/;
			var color = /^#[0-9a-fA-F]{3,6}$/;
			var units = ['px', 'em', 'rem'];
			var borderStyle = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit'];

			if (!floatPlus.test(_this.size)) {
				var error = { param: 'size', msg: '请设置为非负数字' };
				errors.push(error);
			}
			if (!floatPlus.test(_this.borderSize)) {
				var error = { param: 'borderSize', msg: '请设置为非负数字' };
				errors.push(error);
			}
			if (!floatPlus.test(_this.textSize)) {
				var error = { param: 'textSize', msg: '请设置为非负数字' };
				errors.push(error);
			}
			if (units.indexOf(_this.unit) < 0) {
				var error = { param: 'unit', msg: '属性包括[\'px\', \'em\', \'rem\']' };
				errors.push(error);
			}
			if (_this.num.toString().indexOf('%') > -1) {
				var num = _this.num.toString().substring(0, _this.num.toString().indexOf('%'));
				_this.num = num;
				debug(_this, { info: 'num: Get value before the \'%\': ', type: 'log' });
			}
			if (!floatPlus.test(_this.num)) {
				var error = { param: 'num', msg: '请设置为非负数字' };
				errors.push(error);
			}
			if (!float.test(_this.speed)) {
				var error = { param: 'speed', msg: '属性请设置为数字' };
				errors.push(error);
			}
			if (!color.test(_this.textColor)) {
				var error = { param: 'textColor', msg: '请正确设置\'textColor\'属性的16进制颜色值' };
				errors.push(error);
			}
			if (!color.test(_this.borderColor)) {
				var error = { param: 'borderColor', msg: '请正确设置\'borderColor\'属性的16进制颜色值' };
				errors.push(error);
			}
			if (!color.test(_this.borderBgColor)) {
				var error = { param: 'borderBgColor', msg: '请正确设置\'borderBgColor\'属性的16进制颜色值' };
				errors.push(error);
			}
			if (borderStyle.indexOf(_this.borderType) < 0) {
				var error = { param: 'borderStyle', msg: '请正确设置\'borderStyle\'属性的属性值, 具体属性请参考 http://www.w3school.com.cn/cssref/pr_border-style.asp' };
				errors.push(error);
			}

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
    var create = function (_this) {
        var container = document.getElementById(_this.id);

        if (!container) {
            var error = { msg: '未选取到容器, 请传入正确的 id 字符串或者不传值使用默认 id: "processCircle".', type: 'error' }
            debug(_this, {
                info: error.msg,
                type: error.type
            });
            return false;
        }
		
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
		var prepend_t = document.createTextNode(_this.prepend),
			append_t = document.createTextNode(_this.append),
			percent_t = document.createTextNode(constants.PERCENT_INIT);
		
		utils.setClasses(right, [class_names.WRAPPER, class_names.RIGHT]);
		utils.setClasses(left, [class_names.WRAPPER, class_names.LEFT]);
		utils.setClasses(content, class_names.CONTENT);
		utils.setClasses(right_in, class_names.CIRCLE);
		utils.setClasses(left_in, class_names.CIRCLE);
		utils.setClasses(prepend, class_names.PREPEND);
		utils.setClasses(append, class_names.APPEND);
		
		right_in.id = id_names.RIGHT + '_' + _counts;
		left_in.id = id_names.LEFT + '_' + _counts;
		percent.id = id_names.PERCENT + '_' + _counts;
		
		prepend.appendChild(prepend_t);
		append.appendChild(append_t);
		percent.appendChild(percent_t);
		
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
			container: container,
			doc_fragment: docFragment
		};
    }

    // 设置样式
    var setStyle = function (_this, doms) {
        var wrapper_size = parseFloat(_this.size) / 2,
			border_size = parseFloat(_this.borderSize),
			circle_size = parseFloat(_this.size) - border_size * 2;
        
        var wrappers = [doms.right, doms.left],
			circles = [doms.right_in, doms.left_in];
        var bgBorder = _this.borderSize + _this.unit + ' ' + _this.borderType + ' ' + _this.borderBgColor;
		
		doms.container.className = 'circle-process';
        doms.container.style.width = _this.size + _this.unit;
        doms.container.style.height = _this.size + _this.unit;
		doms.container.style.position = 'relative';

        for (var i = 0; i < wrappers.length; i++) {
            wrappers[i].style.width = wrapper_size + _this.unit;
            wrappers[i].style.height = _this.size + _this.unit;
			wrappers[i].style.position = 'absolute';
		    wrappers[i].style.top = '0';
		    wrappers[i].style.overflow = 'hidden';
            circles[i].style.width = circle_size + _this.unit;
            circles[i].style.height = circle_size + _this.unit;
            circles[i].style.border = bgBorder;
			utils.setStyles(circles[i], constants.CIRCLE_STYLES);
        }
		
		doms.right.style.right = '0';
		doms.left.style.left = '0';

        doms.right_in.style.borderTopColor = _this.borderColor;
        doms.right_in.style.borderRightColor = _this.borderColor;
		doms.right_in.style.right = '0';
        doms.left_in.style.borderBottomColor = _this.borderColor;
        doms.left_in.style.borderLeftColor = _this.borderColor;
		doms.left_in.style.left = '0';
		
		utils.setStyles(doms.content, constants.CONTENT_STYLES);
		doms.content.style.fontSize = _this.textSize + _this.unit;
        doms.content.style.color = _this.textColor;
		
		doms.prepend.style.display = 'block';
		doms.append.style.display = 'block';
		
		doms.container.appendChild(doms.doc_fragment);
    }

    // 设置百分比
    var setPercent = function (_this, doms) {
        var num = parseFloat(_this.num);
        var i = 0;

        var clock = window.setInterval(function () {
            i++;
            if (i > num) {
                i = num;
                window.clearInterval(clock);
            }
            doms.percent.innerHTML = i + '%';

            if (i <= 50) {
				utils.transformCompatibility(doms.right_in, 'rotate(' + (-135 + 3.6 * i) + 'deg)');
				utils.transformCompatibility(doms.left_in, 'rotate(-135deg)');
            } else {
				utils.transformCompatibility(doms.right_in, 'rotate(45deg)');
				utils.transformCompatibility(doms.left_in, 'rotate(' + (-135 + 3.6 * (i - 50)) + 'deg)');
            }

        }, _this.speed);
    }

    // 初始化
    ProcessCircle.prototype.init = function () {
        var percent = this.num + '%';

        var check = utils.checkParam(this);

        if (!check) {
            return;
        }

        var doms = create(this);
        if (doms) {
            setStyle(this, doms);
            setPercent(this, doms);
        }
		
		return this;
    }

    // TODO: 动态引入样式表文件 - 暂有问题, 需要判断css加载完成
    /* ProcessCircle.prototype.linkStyleSheet = function (url) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    } */

    window.ProcessCircle = ProcessCircle;
	
}) (window, document);
