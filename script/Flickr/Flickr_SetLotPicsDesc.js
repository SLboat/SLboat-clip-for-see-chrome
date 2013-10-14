var Note = {}; //处理note的所有方法
var close_timer_id; //关闭的定时器ID

/* 一切的开始的入口 
 * 确保只执行了一次
 */

function Flickr_Comment_Hook_Start() {
	//如果不再页面，立即离开
	if ($("#photo-list-holder").length == 0) return false;

	/* 在这里提前用到API-于是领取API回家 */
	i_request_for_API();

	//确保，确保，只干了一次
	$("#photo-list-holder").off("DOMSubtreeModified");
	$("#photo-list-holder").on("DOMSubtreeModified", "#comment-form", Flickr_pics_SetUP_hook);

	if (is_debug_ink) {
		console.log("已将航海见识墨水注入到评论框的按钮里了！");
	}; //告知已载入
	Enable_SetLotPicsDesc = true;

	//TODO:或许要延时一些时间？
	//NOTE:这里默认大概是300张
	Flickr_pics_quick_mouse();

}

//TODO:如果hook失败，那么可以墨水按钮按下去的时候再次Hook，听起来如何
//CRAZY:或许给body一个hook，然后匹配两个hook是否一致？
//NOW:使用photo-list-holder这里挂钩，看起来好多了！
$(document).ready(function() {
	//IDEA:或许等待对象移除后再次复活事件？
	Flickr_Comment_Hook_Start();

})

/* -------------实现之旅------------- */

/* 绑定一个快速的钩子-快速的添加标记到里面 */

function Flickr_pics_quick_mouse() {
	var the_need_postion = ".meta .title,.meta .attribution-block"; //需要针对的区域

	$(the_need_postion).unbind("click"); //解除绑定

	//绑定同级，不要绑定上级的没有事件的玩意，会一大堆冒泡的玩意
	$(the_need_postion).click(function() {
		$(this).parent().find(".comments-icon img").click();
	})
	return ($(the_need_postion).length / 2); //返回处理的数量，大概是一半
}

/* 设置最基本的钩子们 */

function Flickr_pics_SetUP_hook() {
	var title, id, descnote;
	var title_state; //标题描述信息
	var desc_orgin = ""; //读取到的描述信息

	if ($(".comment-button-desc").length > 0) return false; //已经添加过了，再见

	//TODO:用函数包装
	Note.work_title_str = ""; //清空尾部字串

	//取消之前的定时器，如果有的话
	if (close_timer_id) clearTimeout(close_timer_id);

	//新的状态框！互动的时代
	$(".add-comment-form").before($('<div style = "font-size:0.3em;margin-bottom: 5px;text-align: right;color: grey;" id = "Desc_info" > 装入显示装置... </div>'));
	//重置默认提醒文字
	$("textarea#message").prop("placeholder", "或许来点描述 - 航海见识墨水已替换留言部件");
	//隐藏掉默认的注释玩意
	$(".comment-button-post").hide();
	//开始填入新的按钮
	$(".comment-button-post").before($('<input name="Submit" type="button" value="写入描述" class="Butt comment-button-desc rapidnofollow" tabindex="2"></input>'));

	/* 一些更完善的初始化信息 */
	title = Note.GetTitle(), id = Note.GetID();

	//标题信息建造
	if (title.length > 0) {
		Note.work_title_str = "→正在处置[" + title + "]";
	} else {
		Note.work_title_str = "→正在处置[无标题]";
	}
	Note.SetNote("装载完毕!尝试拉取已有的描述信息...");

	//试图拉取信息，这里的初始化还是灰色-note信息
	call_flickr_api_for_desc(id, function(desc_returun) {
		desc_orgin = desc_returun;
		if (desc_orgin == null) {
			Note.SetNoteClor("red"); //报警颜色
			Note.SetNote("该死的！船长！提取旧描述出现意外！");
		} else if (desc_orgin != "") { //找到了原始信息
			Note.SetNoteClor("blue"); //来电蓝色
			if (Note.GetDesc() == "") {
				Note.SetNote("啊哈！船长！提取回来了旧的描述见识！");
				//检查是否已经修改了-考虑到延时
				Note.SetDesc(desc_orgin);
			} else {
				//糟糕了打架了
				Note.SetNoteClor("red");
				Note.SetNote("啊，这叫我咋办好！我提取回来了描述[" + desc_orgin + "]");
			}
			//变成修改描述
			$(".comment-button-desc").val("修改描述");
			Note.SetDone("有描", desc_orgin);
		} else {
			Note.SetNote("嘿！船长！检查完毕！这玩意还未描述呢！");
		}
	}); //处理完毕拉回信息

	//确保按钮管用
	$(".comment-button-desc").click(function() {
		Note.SetNoteClor("grey"); //灰色开始
		console.log('hi,you press me'); //TEMP:临时的问号
		Note.SetNote("是，船长，收到描述提交请求...");
		//获取最新的标记
		descnote = $.trim(Note.GetDesc());
		//构建写入...
		if (id != "" && descnote != "") {
			Note.SetNote("吔吼！一切就绪，正在送往Flickr那家伙...")
			call_flickr_api_setmete(id, title, descnote, function(res) {
				if (res.stat == "ok") {
					Note.SetNoteClor("blue"); //蓝色
					Note.SetNote("太棒了！船长！一切都送出去了！" + Note.wait_for_close + "秒后将自动关闭这里...");
					Note.SetDone("已描", descnote); //设置描绘标记
					close_timer_id = setTimeout(Note.CloseDiag, Note.wait_for_close * 1000); //等待几秒后完毕
				} else {
					Note.SetNoteClor("red"); //红色警告
					Note.SetNote("见鬼的！船长！完蛋了！返回来：" + res.code + ":" + res.message)
				}

			})
			//回调？延时？
		} else {
			Note.SetNoteClor("red"); //红色警告
			if (descnote == "") {
				Note.SetNote("见鬼船长，咋门得点描述信息进去才送出去嘛");
			} else {
				Note.SetNote("见鬼船长，有些玩意是空的...啥玩意估计是ID这玩意");
			}
		}

	});
	//绑定Ctrl+回车键，或许只是回车键好了？
	$(".comments-popover,#message").bind("keydown", "return", function() {

		//提交出去内容
		$(".comment-button-desc").click();
		//抛弃本次事件-不要产生回车键
		return false;
	});

	//绑定ESC键为关闭
	$(".comments-popover,#message").bind("keydown", "esc", function() {
		if (Note.GetDesc() == "" || desc_orgin == Note.GetDesc()) { //如果没有修改，抛弃
			//关闭处理
			Note.CloseDiag();
		} else {
			Note.SetNoteClor("red"); //红色警告
			//TODO:或许该有原始的话，就不为难这里了呢？
			//包含字符串
			Note.SetNote("见鬼船长，Esc不能取消，有描述了呢！");
			//抛弃事件
			return false;
		}
	});

} //结束了自己

Note = {

	wait_for_close: 1, //常量，等待几秒后自动关闭
	work_title_str: "", //针对工作的家伙

	/* 获取页面的里的标题 */
	//TODO:对于没标题的处理？

	GetTitle: function() {
		return $("#message").parents(".photo-display-item").find("div.title a").text();
	},

	/* 获取当前对应的ID */

	GetID: function() {
		//TODO:用隐藏的ID来蝴蝶？
		return $("#message").parents(".photo-display-item").attr("data-photo-id");
	},

	/* 写入描述信息 */
	SetDesc: function(desc) {
		$("#message").val(desc);
	},

	/* 获得输入的描述信息 */

	GetDesc: function() {
		//切刀换行问题
		return $.trim($("#message").val());
	},

	/* 设置已描的标记 */
	SetDone: function(donestr, desc) {
		var pics = $("#message").parents(".photo-display-item");

		$(pics).find(".play").css("top", "50%").css("font-size", "5em").text("已抛锚");

		//一个悲剧的颜色-绿绿的
		$(pics).find("span.photo_container").css("background-color", "#00FFAD");
		//设置模糊
		$(pics).find("[id][class*=img]").css("opacity", "0.15");
		//设置标记
		$(pics).find(".comment-count").text(donestr);
		if (typeof(desc) == "string" && desc != "") {
			$(pics).find(".comments-icon").attr("title", "描述信息:" + desc);
		}
	},

	/* 设置状态的颜色 */

	SetNoteClor: function(color) {
		$("#Desc_info").css("color", color);
	},

	/* 写入状态信息 */

	SetNote: function(state) {
		//检查尾部字串
		if (this.work_title_str.length > 0) {
			state = state + this.work_title_str
		}
		$("#Desc_info").text(state);

	},

	/* 读取状态信息 */

	GetNote: function(state) {
		return $("#Desc_info").text();
	},

	/* 关闭状态框 */

	CloseDiag: function() {
		//需要消息框存在
		if ($("#message").length > 0) {
			//点击一个阴影对话框，应该能置于关闭
			$(".popover-shim").click();
		}
	},

}

/* 遍历所有的图片，解决里面的是否有标记问题 */
//TODO：检查tag来变色？
//TODO：记录缓存，给后来调用？

function Scan_All_Pics_For_Desc() {
	var blur_mush = 15; //糊掉的程度
	var max_per_time_work = 150; //一次最大处理的张数
	//制造犯迷糊
	var blur_me = function(pics, desc) {
		//CSS的模糊-看起来太卡了 
		//$(pics).css("-webkit-filter", "blur(" + blur_mush + "px)");

		//写入一个文字
		$(pics).find(".play").css("top", "50%").css("font-size", "5em").text("已抛锚");

		//一个悲剧的颜色-绿绿的
		$(pics).find("span.photo_container").css("background-color", "#00FFAD");
		//CSS的透明-这个还不错
		$(pics).find("[id][class*=img]").css("opacity", "0.15");
		//设置有标记
		$(pics).find(".comment-count").text("抛锚");
		$(pics).find(".comments-icon").attr("title", "描述信息:" + desc);
	};
	//制造变成灰色，不考虑返回
	var public_me = function(pics) {

		$(pics).find(".play").css("top", "50%").css("font-size", "5em").text("已公开");

		//设置一个背景色
		$(pics).find("span.photo_container").css("background-color", "palegreen");
		//模糊掉图片自己
		$(pics).find("[id][class*=img]").css("opacity", "0.10");

	}
	//标记自己为已检查
	var check_me = function(pics) {
		$(pics).attr("has_check", "true"); //标记已经检查
	}
	//设置回调的回调函数来获得特别的玩意-看起来这里意外的变成闭包了
	var back_the_desc = function(id, $pic, callback) {
		call_flickr_api_for_desc(id, function(desc_returun, res) {
			//再包装一层。。。看起来是从闭包里得到小局部函数啊
			callback(desc_returun, res, $pic);
		});
	}
	var i_count = 0; //计数器
	//限制最大数，不检查已检查的
	$(".photo-display-item:not([has_check])").each(function() { //遍历开始
		var id = $(this).attr("data-photo-id");
		//临时备份图片
		$img = $(this).find("[id][class*=img]");
		if ($img.prop("src").match("spaceball.gif")) {
			return true; //继续下一个，不能返回fasle会死掉
		}
		//传入再传入。。。
		//TODO:精简到只要做一次
		back_the_desc(id, $(this), function(desc_returun, res, $pic) {
			//检查是否公开
			if (res.stat == "ok") {
				//效验是否设置了公开
				if (res.photo.visibility.ispublic == 1) {
					//检查公开部分
					public_me($pic);
				}
			};

			if (desc_returun && desc_returun != "") {
				//必要的话-糊掉-需要指向准确的对象
				blur_me($pic, desc_returun);
				check_me($pic); //标记检查
			} else if (desc_returun != null) { //至少不是null吧
				check_me($pic); //标记检查				
			}

		});
		i_count++;
		if (i_count > max_per_time_work) {
			console.log("船长！超过了" + max_per_time_work + "张，根据说好的！老子不干了！")
			return false; //彻底终止循环
		}
	}); //遍历结束
	//TODO:没有的话进行一个提醒
}