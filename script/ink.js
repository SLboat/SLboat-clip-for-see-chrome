/* 主核心后台脚本 */
var lastTime = new Date().getTime();
var isInManage = false; //是否在管理界面啥子的
var click_double_wait_time = 400; //双击等待毫秒时间
var has_ink = false; //是否有墨水
var has_api = false; //是否有api请求

var delayID; //全局的定时器ID

//基本赋值的玩意
var play_dealy = 50; //动画每帧延时
var image_play_now = 0; //播放当前帧
var ink_images = new Array("icon_32.png", "pen_shape_1.png ",
	"pen_shape_2.png ", "pen_shape_3.png ", "pen_shape_4.png "); //正常墨水

var flickr_images = new Array("flickr_pen_shape_1.png ",
	"flickr_pen_shape_2.png ", "flickr_pen_shape_3.png ",
	"flickr_pen_shape_4.png ", "flickr_pen_shape_5.png ",
	"flickr_pen_shape_6.png "); //Flickr墨水

var flickr_images_ink_done = "./img/" + flickr_images[flickr_images.length - 1]; //最后一帧正常
var flickr_images_api_wait = "./img/flickr_pen_api_wait.png"; //API_等待
var flickr_images_api_done = "./img/flickr_pen_api_wait.png"; //API_完成

//默认墨水风格
var ink_type = "ink";

/* 播放运作动画 */
function ink_open_animateGraph() {
	image_play_now++;
	//播放完毕退出
	if (typeof (ink_type) != "undefined" && ink_type == "flickr") {
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

	delayID = setTimeout(ink_open_animateGraph, play_dealy); //这是一直播放吗？真疯狂
}

/* 添加基本文字 */
function ink_add(ink, title, url, copy_type, tab) {
	//-----------------------------------------------------------------------
	// 开始处理墨水的情况
	//-----------------------------------------------------------------------

	var result = ""; //返回结果的玩意

	//播放动画有关的初始化
	ink_type = copy_type.type; //直接用传入的墨水类型进行赋值
	image_play_now = 0; //播放精心设置的动画，这动画有着alex的心血
	play_dealy = localStorage.see_ink; //动态赋值动画参数

	if (ink.length == 0) { // 看看有没有墨水在里面
		// 全部否定，彻底终止
		chrome.browserAction.setIcon({
			path: "/img/icon_32.png"
		}); // 关闭墨水
		//走人
		return false;
	}

	/* 处理传入的玩意 */
	if (ink_type == "flickr") {
		//没有传入任何内容，判断是否为Flickr
		ink_open_animateGraph(); //播放动画由这里开始，开始吸取墨水
		result = ink; //墨水里已有了一切

		//检查是否需要api来处理
		if (copy_type.api.need_api) //需要api，假设一定有
		{
			has_api = true; //放个画面给人家看看
		}
	} else { //作为默认的墨水情况
		ink_open_animateGraph(); //播放动画由这里开始

		//格式化文本-得到最终玩意
		result = fixtxt(ink, title, url);
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

/* 添加按钮点击事件 */
chrome.browserAction.onClicked.addListener(function (tab) {
	var currentTime = new Date().getTime();
	//点击事件
	if (currentTime - lastTime > click_double_wait_time) { // 间隔大于500毫秒就是无关
		// 第一次点击-作为添加事件
		// set manage flag
		isInManage = false;
		setTimeout(function () { //为啥要设置超时呢，看起来是500毫秒后
			if (isInManage) return; //返回去啥子的。。难道在中间
			//清空墨水
			clear_ink();
			//发送事件请求
			chrome.tabs.sendMessage(tab.id, {
				// 传递方法，传递api_key
				method: "getSelection",
				flickr_api_key: get_api_key(),
				//用于墨水的作用
				ink_for: localStorage.ink_for || "slboat"
			}, function (response) {
				ink_add(response.data, response.title, response.url, response
					.copy_type,
					tab);
			}); //注入事件申请
		}, 50); //等待页面间隔
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
chrome.runtime.onMessage.addListener(function (request, sender,
	sendResponse) {

	// 从API回来的事情
	if (request.command == "ink_api_start") {
		flickr_api_start();
	} else if (request.command == "ink_api_finish") {
		flick_api_end(request); //把呼叫体传回去得了
	}

	sendResponse({}); // snub them.
});

/* Flickr API有关的处理在这里 */

//开始API处理
function flickr_api_start() {
	//播放等待图标
	chrome.browserAction.setIcon({
		path: flickr_images_wait
	});
}

//API完成处理

function flick_api_end(request) {
	if (request.have_ink) { //有墨水了
		//API完成图标
		chrome.browserAction.setIcon({
			path: flickr_images_api_done
		});
		full_ink(); //填满墨水
		copy_text(request.ink); //复制墨水
		//todo:处理是否重复获取了
	} else
		chrome.browserAction.setIcon({
			path: flickr_images_ink_done
		});

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

/* 封装成一个墨水类？ */
/* 装满墨水 */
function full_ink() {
	has_ink = true;
}

/* 清空墨水 */
function clear_ink() {
	//todo：检查些之前内容啥的
	has_ink = false;
}

/* 是否没有墨水 */
function is_empty_ink() {
	return has_ink;
}

/* 是否为API */
function is_api() {
	return has_api;
}
