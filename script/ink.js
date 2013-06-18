/* 主核心后台脚本 */
var lastTime = new Date().getTime();
var isInManage = false; //是否在管理界面啥子的
var click_double_wait_time = 400; //双击等待毫秒时间
var has_ink = false; //是否有墨水
var has_api = false; //是否有api请求

var delayID; //全局的定时器ID，虽然没啥用

//基本赋值的玩意
var play_dealy = 80; //动画每帧延时
var image_play_now = 0; //播放当前帧
var image_stay_ink = 0; //墨水剩余量
var ink_images = new Array("icon_32.png", "pen_shape_1.png ",
	"pen_shape_2.png ", "pen_shape_3.png ", "pen_shape_4.png "); //正常墨水

var ink_images_start = "./img/icon_32.png"; // 初始墨水

var flickr_images = new Array("flickr_pen_shape_1.png ",
	"flickr_pen_shape_2.png ", "flickr_pen_shape_3.png ",
	"flickr_pen_shape_4.png ", "flickr_pen_shape_5.png ",
	"flickr_pen_shape_6.png "); //Flickr墨水

var flickr_images_ink_done = "./img/" + flickr_images[flickr_images.length - 1]; //最后一帧正常
var flickr_images_api_wait = "./img/flickr_pen_api_wait.png"; //API_等待
var flickr_images_api_done = "./img/flickr_pen_api_done.png"; //API_完成

//默认墨水风格
var ink_type = "ink";

/* 播放运作动画 */

function ink_box_Play(begin) {
	if (typeof(begin) != "undefined" && begin) {
		image_play_now = 0; //初始化
	}
	//播放完毕退出
	if (typeof(ink_type) != "undefined" && ink_type == "flickr") {
		// 播放flickr的玩意
		if (image_play_now >= flickr_images.length) {
			//处理一些最后帧
			if (is_api()) {
				if (is_empty_ink()) {
					//播放等待图标
					chrome.browserAction.setIcon({
						path: flickr_images_api_wait
					});
				} else {
					//播放结束图标
					chrome.browserAction.setIcon({
						path: flickr_images_api_done
					});
				}

			}
			return; //返回的时候终止了
		}
		chrome.browserAction.setIcon({
			path: "./img/" + flickr_images[image_play_now]
		});
	} else {
		if (image_play_now >= ink_images.length) return; //返回的时候结束了
		chrome.browserAction.setIcon({
			path: "./img/" + ink_images[image_play_now]
		});
	}
	//墨水量保存
	image_stay_ink = image_play_now;
	//动画加1
	image_play_now++;

	delayID = setTimeout(ink_box_Play, play_dealy); //这是一直播放吗？真疯狂
}

/* 播放运作动画 */

function ink_close_animateGraph(begin) {
	if (typeof(begin) != "undefined" && begin) //初始化的标记
	{
		if (typeof(ink_type) != "undefined" && ink_type == "flickr")
			image_play_now = flickr_images.length - 1; //最大大小
		else
			image_play_now = ink_images.length - 1; //最大大小
	}
	if (image_stay_ink < 0) //没有剩余墨水-罢工
	{
		return;
	}
	//播放完毕退出
	if (typeof(ink_type) != "undefined" && ink_type == "flickr") {
		// 播放flickr的玩意
		if (image_play_now < 0) { //结束了玩完了
			//todo： 或许动画不用太夸张了			
			//设置剩余墨水
			chrome.browserAction.setIcon({
				path: "./img/" + flickr_images[image_stay_ink]
			});

			return; //返回的时候终止了
		}
		//放置动画
		chrome.browserAction.setIcon({
			path: "./img/" + flickr_images[image_play_now]
		});
	} else {
		if (image_play_now < 0) {
			chrome.browserAction.setIcon({
				path: "./img/" + ink_images[image_stay_ink]
			}); // 关闭墨水
			return; //返回的时候结束了
		}
		chrome.browserAction.setIcon({
			path: "./img/" + ink_images[image_play_now]
		});
	}
	//动画-1
	image_play_now--;
	delayID = setTimeout(ink_close_animateGraph, play_dealy); //这是一直播放吗？真疯狂
}

/* 墨水在这里处理着 */

function ink_add(ink, title, url, copy_type, tab) {
	//-----------------------------------------------------------------------
	// 开始处理墨水的情况
	//-----------------------------------------------------------------------

	var result = ""; //返回结果的玩意

	//播放动画有关的初始化
	ink_type = copy_type.type; //直接用传入的墨水类型进行赋值
	image_play_now = 0; //播放精心设置的动画，这动画有着alex的心血
	play_dealy = localStorage.see_ink || play_dealy; //动态赋值动画参数

	if (ink.length == 0) { // 看看有没有墨水在里面
		// 全部否定，彻底终止
		chrome.browserAction.setIcon({
			path: ink_images_start
		}); // 关闭墨水
		//走人
		return false;
	}

	/* 处理传入的玩意 */
	if (ink_type == "flickr") {
		//检查是否需要api来处理-提前给动画
		if (copy_type.api.need_api) //需要api，假设一定有
		{
			has_api = true; //放个画面给人家看看
		}
		//没有传入任何内容，判断是否为Flickr
		ink_box_Play(true); //播放动画由这里开始，开始吸取墨水
		//显示一个小角标玩意,看起来穿回来的都在api里面
		set_inkicon_text(copy_type.api.pic_num.toString());
		//送入墨水
		result = ink; //墨水里已有了一切

	} else if (ink_type == "ink") { //作为默认的墨水情况
		ink_box_Play(true); //播放动画由这里开始

		//格式化文本-得到最终玩意
		result = ink_color({
			text: ink,
			title: title,
			url: url
		});
	} else if (ink_type == "ink_slboat") {
		ink_box_Play(true); //播放动画由这里开始

		//森亮号墨水，只有文本
		result = ink;
	}

	//给本地保存一份，作用是啥子呢-将来注入墨水
	localStorage.content = result;

	if (is_empty_ink()) //确保是空墨水
	{
		return copy_text(result); //复制，结束
	} else
		return false; //已经有墨水，可能是API的功劳
}

//打开森亮号页面

function go_see() {
	chrome.tabs.create({
		url: "http://see.sl088.com"
	});
}
//监控变更
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		//提取一个改变的对象
		if (typeof(changes.ink_config) != "undefined") //只扑捉想要的键值
		{
			localStorage = changes.ink_config.newValue; //载入本地去管它呢
		}
		console.log("服务器的配置数据变动！已同步！");
	}
})

/* 添加按钮点击事件 */
chrome.browserAction.onClicked.addListener(function(tab) {
	var currentTime = new Date().getTime();

	// 一些注入页面的特殊标记规则，这里的标记替换模式需要的是替换掉[/]为[\/]，替换掉[.]为[\.]，简单的说就是对符号下手
	/* 一个注入见识的连接就像是：
	 * http://see.sl088.com/wiki/Mediawiki_%E7%BC%96%E8%BE%91%E6%A1%86#.E5.9C.A8.E5.85.89.E6.A0.87.E4.B8.8B.E5.86.99.E5.85.A5.E5.86.85.E5.AE.B9
	 */

	var slboat_edit_patern = /\/see\.sl088\.com\/w\/index\.php.+action=edit/; //森亮号大船编辑模式
	/* 一个eBay注入的连接就像是
	 * http://payments.ebay.com/ws/eBayISAPI.dll?AddTrackingNumber2&LineID=Transactions.181078954797
	 */
	var ebay_tracknumber_patern = /\/payments\.ebay\.com\/ws\/eBayISAPI\.dll\?AddTrackingNumber/; //eBay的承运人编辑模式

	/* 只有一种flickr的管理页面样式，那就是
	 * http://www.flickr.com/photos/organize
	 * 不收尾巴，虽然看起来没啥坏事
	 */
	var flickr_organize_patern = /www\.flickr\.com\/photos\/organize/;

	//如果是非http协议走人，或许可以注入支持，但是谁需要呢
	if (tab.url.search(/http/) == -1) {
		clear_ink();
		return; //非http协议走人
	}
	//点击事件
	if (currentTime - lastTime > click_double_wait_time) { // 间隔大于500毫秒就是无关
		// 第一次点击-作为添加事件
		// set manage flag
		isInManage = false;
		//判断是否为森亮号页面，用非值足以判断match发出的null了
		if (tab.url.match(slboat_edit_patern)) { //森亮号墨水注入
			if (get_ink().length > 0) {
				if (image_stay_ink < 0) //需要准备图标吗？
				{
					clear_ink();
					return;
				}
				//墨水减少一粒
				image_stay_ink--;
				//放置动画
				ink_close_animateGraph(true);
				//定时器看起来可以提前播放个动画啥子的-但是没啥必要呢
				setTimeout(function() { //为啥要设置超时呢，看起来是500毫秒后
					//播放动画啥子的。。。
					chrome.tabs.sendMessage(tab.id, {
						// 传递方法，传递api_key
						method: "putInk",
						ink: get_ink(), //墨水内容
						ink_type: ink_type //墨水类型
					}); //注入事件申请
				}, 50); //等待页面间隔
			}
		} else if (tab.url.match(ebay_tracknumber_patern)) { //这是eBay的编辑注入模式（不要考虑选择了内容？那太稀少了，没见识价值度）
			//放置动画-释放墨水，不减少
			ink_close_animateGraph(true);
			//不用减少墨水咯，这看起来有点诡异。。。
			setTimeout(function() { //为啥要设置超时呢，看起来是500毫秒后
				chrome.tabs.sendMessage(tab.id, {
					// 这是干活方式
					method: "putInk_ebay"
				}); //注入事件申请
			}, 50); //等待页面间隔
		} else if (tab.url.match(flickr_organize_patern)) { //这是Flickr的管理模式
			//清空墨水
			clear_ink();
			//播放释放动画
			flickr_api_animal();
			//播放API捕获动画-todo
			setTimeout(function() { //为啥要设置超时呢，看起来是500毫秒后
				//播放动画啥子的。。。
				chrome.tabs.sendMessage(tab.id, {
					//告知要获得tag
					method: "get_flickr_organize_tag",
					//传入原料API
					flickr_api_key: get_api_key(), //API，这是需要的
					//传入要求：墨水的作用
					ink_option: {
						ink_for: get_ink_for(),
						flickr_order: localStorage.flickr_order || ""
					}
				});
			}, 50); //等待页面间隔

		} else { //正常的吸取墨水
			setTimeout(function() { //为啥要设置超时呢，看起来是500毫秒后
				if (isInManage) return; //返回去啥子的。。难道在中间
				//清空墨水
				clear_ink();
				//发送事件请求
				chrome.tabs.sendMessage(tab.id, {
					// 传递方法，传递api_key
					method: "getSelection",
					flickr_api_key: get_api_key(),
					//用于墨水的作用
					ink_option: {
						ink_for: get_ink_for(),
						flickr_order: localStorage.flickr_order || ""
					} //传入选项
				}, function(response) {
					ink_add(response.data, response.title, response.url, response
						.copy_type,
						tab);
				}); //注入事件申请
			}, 50); //等待页面间隔
		}
	} else {
		//双击的话，进入主站好了
		// set manage flag
		isInManage = true;
		go_see();
	}
	// update time
	lastTime = currentTime;
});

/* 处理得到的事件 */
chrome.runtime.onMessage.addListener(function(request, sender,
	sendResponse) {

	// 从API回来的事情
	if (request.command == "ink_api_start") {
		flickr_api_start();
	} else if (request.command == "flickr_api_animal") {
		flickr_api_animal(); //把呼叫体传回去得了
	} else if (request.command == "ink_api_finish") {
		flick_api_end(request); //把呼叫体传回去得了
	} else if (request.command == "ink_api_clean") {
		clear_ink(); //把呼叫体传回去得了
	}

	//目前没有使用到
	sendResponse({}); // snub them.
});

/* 每次启动的时候初始化 */
chrome.runtime.onStartup.addListener(function() {
	//关闭魔术图标
	chrome.browserAction.setIcon({
		path: ink_images_start
	}); // 关闭墨水
	//清理所有标记文字
	clear_inkicon_text();
	//自动设置背景透明色
	init_inkicon_color();

});

/* Flickr API有关的处理在这里 */

//开始API处理

function flickr_api_start() {
	//先清理下
	clear_ink();
	//播放等待图标
	chrome.browserAction.setIcon({
		path: flickr_images_api_wait
	});
}

//播放flickr APi捕获的动画

function flickr_api_animal() {
	ink_type = "flickr"
	image_play_now = 0; //播放精心设置的动画，这动画有着alex的心血
	play_dealy = localStorage.see_ink || play_dealy; //动态赋值动画参数
	has_api = true; //放个画面给人家看看
	ink_box_Play(true); //播放动画由这里开始，开始吸取墨水
}

//API完成处理，只是动动图标啥的

function flick_api_end(request) {
	if (request.have_ink) { //有墨水了
		//API完成图标
		chrome.browserAction.setIcon({
			path: flickr_images_api_done
		});
		full_ink(); //填满墨水
		copy_text(request.ink); //复制墨水
		set_inkicon_text(request.pic_num); //显示个小玩意
		//todo:处理是否重复获取了
	} else {
		chrome.browserAction.setIcon({
			path: flickr_images_ink_done
		});
		clear_inkicon_text(); // 清理现场
	}

}

//获得API的KEY

function get_api_key() {
	// 赋值给它
	var api_key = {
		api_key: localStorage.api_key || "",
		secret_key: localStorage.secret_key || "",
		auth_token: localStorage.auth_token || "",
		user_name: localStorage.user_name || ""
	};
	// 放回去
	return api_key;

}

/* 一些子函数-小专将 */
/* 小函数 - 提取URL的域名 */
//获得的字串类似于：www.flickr.com

function getHost(url) {
	var host = "";
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if (typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

/* 复制文本到剪贴板里-就是一切的终结 */

function copy_text(text) {
	//todo：检查些之前内容啥的
	var inkstand = document.getElementById('inkstand'); //不需要使用jQuery
	inkstand.value = text;
	inkstand.select();
	var rv = document.execCommand("copy"); //执行复制到这里
	return rv; //返回这玩意的执行
}

/* 提出来墨水 */

function get_ink() {
	return document.getElementById('inkstand').value; //不需要使用jQuery
}

/* 封装成一个墨水类？ */
/* 装满墨水 */

function full_ink() {
	has_ink = true;
}

/* 清空墨水 */

function clear_ink() {
	//todo：检查些之前内容啥的
	//停止动画
	clearTimeout(delayID);
	//清空很多玩意们
	has_ink = false;
	has_api = false;
	//图标重置
	chrome.browserAction.setIcon({
		path: ink_images_start
	});
	//清理标记
	clear_inkicon_text();
}

/* 是否没有墨水 */

function is_empty_ink() {
	return !has_ink; //反置是否有墨水
}

/* 是否为API */

function is_api() {
	return has_api;
}

//获得墨水用于谁

function get_ink_for() {
	return localStorage.ink_for || "slboat";
}

//设置墨水文字

function set_inkicon_text(str) {
	//todo:检查是否str为未定义，或者null啥子的
	chrome.browserAction.setBadgeText({
		text: str.toString()
	});
}

//清除墨水文字

function clear_inkicon_text(str) {
	chrome.browserAction.setBadgeText({
		text: ""
	});
}

//设置透明一些的背景

function init_inkicon_color(str) {
	chrome.browserAction.setBadgeBackgroundColor({
		color: [255, 0, 0, 200]
	});
}