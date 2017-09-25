;(function (window, document) {
	var ShareDialog = function (json) {
		if (this instanceof ShareDialog) {
			this.author = 'Jehorn';
			this.version = '0.0.1';

			this.title = json.title || '选择要分享到的平台';
			this.cancel = json.cancel || '取消分享';
			this.speed = json.speed || 300;
			this.link = json.link || './share-dialog/share-dialog.css';

			this.text = json.text || '欢迎使用交金服';
			this.desc = json.desc || '欢迎使用交金服';
			this.url = json.url || '';
			this.img = json.img || '';
			this.beforeClick = json.beforeClick;
			this.afterClick = json.afterClick;

			this.open();
		} else {
			return new ShareDialog(json);
		}
	}

	var bindEvent = function (_this, node, type, fn, stopPropagation) {
		node.addEventListener(type, function (event) {
			if (stopPropagation) {
				// 阻止子元素触发父元素的事件
				if (event.target === this) {
					fn(_this);
				}
			} else {
				fn(_this);
			}
		});
	}

	var create = function (_this) {
		var box = document.createElement('div');
		var wrapper = document.createElement('div');
		var sheader = document.createElement('div');
		var sbody = document.createElement('div');
		var sfooter = document.createElement('div');
		var stitle = document.createElement('h5');
		var scancel = document.createElement('button');
		var baidushare = '<div class="bdsharebuttonbox">\
			<!-- <a href="javascript: void(0);" class="bds_weixin" data-cmd="weixin" title="分享到微信"></a> -->\
			<a href="javascript: void(0);" class="bds_tsina" data-cmd="tsina" title="分享到新浪微博"></a>\
	        <a href="javascript: void(0);" class="bds_sqq" data-cmd="sqq" title="分享到QQ好友"></a>\
	        <a href="javascript: void(0);" class="bds_qzone" data-cmd="qzone" title="分享到QQ空间"></a>\
	    </div>';
	    var baidusharet = '<div class="bdsharetextbox">\
	    	<!-- <span class="bds_weixin_t">微信</span> -->\
	    	<span class="bds_weixin_t">新浪微博</span>\
	    	<span class="bds_weixin_t">QQ</span>\
	    	<span class="bds_weixin_t">QQ空间</span>\
	    </div>';

	    box.id = 'shareDialog';
	    box.className = 'share-dialog';
	    box.style.cssText = 'display: block;'
	    bindEvent(_this, box, 'click', destroy, true);
		wrapper.className = 'share-wrapper';
		wrapper.id = 'shareDialogWrapper';
		wrapper.style.cssText = 'display: none;'
		sheader.className = 'share-header';
		sbody.className = 'share-body';
		sfooter.className = 'share-footer';

		stitle.className = 'share-title';
		stitle.innerHTML = _this.title;

		scancel.className = 'share-cancel';
		scancel.innerHTML = _this.cancel;
		bindEvent(_this, scancel, 'click', destroy);

		sheader.appendChild(stitle);
		sbody.innerHTML = baidushare + baidusharet;
		sfooter.appendChild(scancel);
		wrapper.appendChild(sheader);
		wrapper.appendChild(sbody);
		wrapper.appendChild(sfooter);
		box.appendChild(wrapper);
		document.body.appendChild(box);

		window.setTimeout(function () {
			wrapper.style.cssText = 'display: block;'
		}, _this.speed);
	}

	var destroy = function (_this) {
		// 清空百度分享的对象
		// 否则会出现无法绑定事件
		delete window._bd_share_main;

		var box = document.getElementById('shareDialog');
		var wrapper = document.getElementById('shareDialogWrapper');

		wrapper.style.cssText = 'display: none;'
		box.removeChild(wrapper);
		window.setTimeout(function () {
			box.style.cssText = 'display: none;'
			document.body.removeChild(box);
		}, _this.speed);

		var head = document.getElementsByTagName('head')[0] || document.body;
		var script = document.getElementsByTagName('script');
		var link = document.getElementsByTagName('link');
		var bd = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5);
		var bdLink = 'http://bdimg.share.baidu.com/static/api/css/share_style0_32.css?v=4413acf0.css';
		
		for (var i = script.length - 1; i >= 0; i--) {
			if (script[i].getAttribute('src') == bd) {
				head.removeChild(script[i]);
			}
		}
		for (var i = link.length - 1; i >= 0; i--) {
			if (link[i].getAttribute('href') == bdLink) {
				console.log(link[i])
				head.removeChild(link[i]);
			}
		}
	}

	// Initialize.
	ShareDialog.prototype.open = function () {
		var link = document.createElement('link');
		var checkLink = function () {
        	var links = document.getElementsByTagName('link');
        	for (var i = links.length - 1; i >= 0; i--) {
	        	if (links[i].getAttribute('href') === this.link) {
	        		return true;
	        	}
	        }
	        return false;
        }
		
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', this.link);

        if (!checkLink()) {
        	document.getElementsByTagName('head')[0].appendChild(link);
        }
        
		var _this = this;
		// Baidu share get.
		window._bd_share_config = {
            "common": {
            	"bdText": _this.text,
                "bdDesc": _this.desc,
                "bdUrl": _this.url,
                "bdPic": _this.img,
                "bdSnsKey": {},
                "bdMini": "1",
                "bdMiniList": false,
                "bdStyle": "0",
                "bdSize": "32",
                "onBeforeClick": function (cmd, config) {
                	if (typeof _this.beforeClick === "function") {
                		_this.beforeClick();
                	}
                },
                "onAfterClick": function (cmd) {
                	if (typeof _this.afterClick === "function") {
                		_this.afterClick();
                	}
                }
            },
            "share": {}
        };

        with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
		
		create(this);
	}

	// Close the share dialog.
	ShareDialog.prototype.close = function () {
		destroy(this);
	}

	window.shareDialog = ShareDialog;

}) (window, document)