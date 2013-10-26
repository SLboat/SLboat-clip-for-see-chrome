var Note = {}; //处理note的所有方法
var close_timer_id; //关闭的定时器ID

var fire_again_timer_id; //再次开火的定时器id

var opacity_had_desc = 0.55; //已抛锚的透明度

Enable_SetLotPicsDesc = true; //默认标记,不等待

/* 在这里提前用到API-于是领取API回家 */
i_request_for_API();

/* 一切的开始的入口 
 * 确保只执行了一次
 */

function HOOK_FLICKR_COMMON_DIAG_ONCE() {
	//如果不再页面,立即离开
	if ($("#photo-list-holder").length == 0) return false;

	//确保,确保,只干了一次
	//看起来只能Hook修改事件。。
	$("#photo-list-holder").off("DOMSubtreeModified");
	$("#photo-list-holder").on("DOMSubtreeModified", "#comment-form", Flickr_pics_SetUP_hook);

	fire_again_timer_id = setTimeout(function() {
		Scan_All_Pics_For_Desc(400); //首次扫描,如果没有的话
	}, 4000); //等待五秒没有的话开火

	//快速点击区域启动,或许需要延时几秒？
	HOOK_FOR_PIC_MOUSE_CLICK();

}

/* 仅绑定一次,绑定页面变化 */

function HOOK_FLICKR_PAGE_HAS_CHANGE_START() {
	//绑定再次开火的玩意
	$("#view-holder").on("DOMNodeInserted", "div:not([id]):not([class])", function(e) {
		//检查是否我们想要的
		if ($(e.target).parent().prop("id") != "photo-list-holder") {
			//console.log("抛弃", e)
			return false;
		}
		var CONIFG_wait_enought = 2000; //2秒？ <-- 在回调内,看起来不享受了
		if (fire_again_timer_id > 0) {
			console.log("开火调试信息:不对劲,清理掉")
			clearTimeout(fire_again_timer_id); //取消上次的
		}
		fire_again_timer_id = setTimeout(function() {
			console.log("见鬼的!根据船长指令!对方逃跑!再次开火!")
			REDONE_ALL_PAGE(); //再次扫描
			//缓存上次API？
			fire_again_timer_id = 0; //可以再次开火
		}, CONIFG_wait_enought);
		return true; //worked!
	}); // <--done for on

}

/* 当激活一次热键等情况下的处理 */

function REDONE_ALL_PAGE() {
	//tips.count("正在重载所有图片!");

	Scan_All_Pics_For_Desc(300); //最大扫描150张？
	HOOK_FOR_PIC_MOUSE_CLICK();
	//注入图片可以检查
	HOOK_FOR_PIC_CAN_CHECKED();
	//载入保存的值？
	sync_selct.load();
	//tips.count_die(); //结束数数
}

/* 让全部公开的消失掉咯 */

function HIDDEN_ALL_PUBLIC() {
	//切换,切换的发生,需要让切换的方式...
	var hidden_guy = $(".play:contains('已公开')").parents(".photo-display-item:not([style*=display][style*=none])");

	if (hidden_guy.length > 0) {
		tips.says("隐藏公开玩意!")
		/* 去除公开 */
		$(".play:contains('已公开')").parents(".photo-display-item").css("display", "none")
	} else {
		tips.says("显示公开玩意!");
		//需要确保一致的公开字符串哦
		$(".play:contains('已公开')").parents(".photo-display-item").css("display", "")
	}
}

//TODO:如果hook失败,那么可以墨水按钮按下去的时候再次Hook,听起来如何
//CRAZY:或许给body一个hook,然后匹配两个hook是否一致？
//NOW:使用photo-list-holder这里挂钩,看起来好多了!
$(document).ready(function() {
	//检查页面？
	if ($("#photo-list-holder").length == 0) return false; //必须有列表的
	//IDEA:或许等待对象移除后再次复活事件？
	HOOK_FLICKR_COMMON_DIAG_ONCE();
	//绑定初始化事件绑定
	HOOK_FLICKR_PAGE_HAS_CHANGE_START();

	HOOK_FOR_PIC_CAN_CHECKED(); //再次的钩子-或许有优先级问题？背景问题？

	//立即载入设置
	sync_selct.load();
	flickr_chk_hotkey_bind(); /* 热键的绑定 */

	tips.init(); //初始化提示框

})

/* -------------实现之旅------------- */

/* 绑定一个快速的钩子-快速的添加标记到里面 */

function HOOK_FOR_PIC_MOUSE_CLICK() {
	var the_need_postion = ".meta .title,.meta .attribution-block"; //需要针对的区域

	$(the_need_postion).unbind("click"); //解除绑定

	//绑定同级,不要绑定上级的没有事件的玩意,会一大堆冒泡的玩意
	$(the_need_postion).click(function() {
		$(this).parent().find(".comments-icon img").click();
	})
	return ($(the_need_postion).length / 2); //返回处理的数量,大概是一半
}

/* 设置最基本的钩子们 */

function Flickr_pics_SetUP_hook() {
	var title, id, descnote;
	var title_state; //标题描述信息
	var desc_orgin = ""; //读取到的描述信息

	if ($(".comment-button-desc").length > 0) return false; //已经添加过了,再见

	tips.says("船长!描述框待命!")
	//TODO:用函数包装
	Note.work_title_str = ""; //清空尾部字串

	//取消之前的定时器,如果有的话
	if (close_timer_id) clearTimeout(close_timer_id);

	//新的状态框!互动的时代
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

	//试图拉取信息,这里的初始化还是灰色-note信息
	call_flickr_api_for_desc(id, function(desc_returun) {
		desc_orgin = desc_returun;
		if (desc_orgin == null) {
			Note.SetNoteClor("red"); //报警颜色
			Note.SetNote("该死的!船长!提取旧描述出现意外!");
		} else if (desc_orgin != "") { //找到了原始信息
			Note.SetNoteClor("blue"); //来电蓝色
			if (Note.GetDesc() == "") {
				Note.SetNote("啊哈!船长!提取回来了旧的描述见识!");
				//检查是否已经修改了-考虑到延时
				Note.SetDesc(desc_orgin);
			} else {
				//糟糕了打架了
				Note.SetNoteClor("red");
				Note.SetNote("啊,这叫我咋办好!我提取回来了描述[" + desc_orgin + "]");
			}
			//变成修改描述
			$(".comment-button-desc").val("修改描述");
			Note.SetDone("有描", desc_orgin);
		} else {
			Note.SetNote("嘿!船长!检查完毕!这玩意还未描述呢!");
		}
	}); //处理完毕拉回信息
	/* 发出描述信息 */

	var diag_send_out_desc = function(callback) {
		Note.SetNoteClor("grey"); //灰色开始
		//console.log('hi,you press me'); //TEMP:临时的问号
		Note.SetNote("是,船长,收到描述提交请求...");
		//获取最新的标记
		descnote = $.trim(Note.GetDesc());
		//构建写入...
		//TODO:一样的话不写入
		if (id != "" && descnote != "" && desc_orgin != Note.GetDesc()) {
			Note.SetNote("吔吼!一切就绪,正在送往Flickr那家伙...")
			call_flickr_api_setmete(id, title, descnote, function(res) {
				if (res.stat == "ok") {
					Note.SetNoteClor("blue"); //蓝色
					Note.SetNote("太棒了!船长!一切都送出去了!" + Note.wait_for_close + "秒后将自动关闭这里...");
					Note.SetDone("已描", descnote); //设置描绘标记
					if (typeof(callback) == "function") {
						callback(true); //如果是函数的话进行呼叫
						return true; //强制离开?可以直接callback跑走吗?
					}
					close_timer_id = setTimeout(Note.CloseDiag, Note.wait_for_close * 1000); //等待几秒后完毕	

				} else {
					Note.SetNoteClor("red"); //红色警告
					Note.SetNote("见鬼的!船长!完蛋了!返回来:" + res.code + ":" + res.message)
				}

			})
			//回调？延时？
		} else {
			Note.SetNoteClor("red"); //红色警告
			if (descnote == "") {
				if (typeof(callback) == "function") { //强制跑走
					callback(false);
					return false;
				}
				Note.SetNote("见鬼船长,咋门得点描述信息进去才送出去嘛");

			} else if (desc_orgin == Note.GetDesc()) {
				if (typeof(callback) == "function") { //强制跑走
					callback(false);
					return false;
				}
				Note.SetNote("hmmm,看起来这里没有变化嘛");
			} else {
				Note.SetNote("见鬼船长,有些玩意是空的...啥玩意估计是ID这玩意");
			}
		}
	};

	//确保按钮管用
	$(".comment-button-desc").click(diag_send_out_desc);

	//绑定回车键,只是回车键好了
	$(".comments-popover,#message").bind("keydown", "return", function() {
		//提交出去内容
		$(".comment-button-desc").click();
		//抛弃本次事件-不要产生回车键
		return false;
	});

	//确定绑定辅助键
	var bind_shift_key;
	if (navigator.platform == "MacIntel") {
		bind_shift_key = "meta+"; //mac 使用command键
	} else {
		bind_shift_key = "ctrl+"; //mac 使用command键	
	};

	//游览之车开始了...前游览
	$(".comments-popover,#message").bind("keydown", bind_shift_key + "left", function() {
		/* 域描述 
		 * 在这里 $pic_div = $(this).parents(".photo-display-item") 是父级的对话框
		 * $pic_div.find(".comments-icon img") 是父级别的点击对话框
		 */

		/* TODO:这里可以用active来见擦汗效验..参考这个
		 * <a title="描述信息:战斗.." href="#" class="rapidnofollow comments-icon comments-inline-btn active" id="yui_3_11_0_4_1382767821199_969"><img class="spaceball" width="12" height="12" src="/images/spaceball.gif"><span class="comment-count count">有描</span></a>
		 */
		//找到父级图
		var $pic_div = $(this).parents(".photo-display-item");
		//找到自己的序号
		var me_index = find_id_index($pic_div.prop("id"));
		//设置回调送出内容
		diag_send_out_desc(function() { //找寻自己的前一个序号,似乎去到下一个了
			if (me_index > 0) { //如果至少存在的话
				Note.SetNoteClor("grey"); //红色警告
				Note.SetNote("现在向前面游览而去...");
				tips.says("向前开动一海里!");
				$(".photo-display-item").eq(me_index - 1).find(".comments-icon img").click();
			} //TODO:提醒无法游览
		});

		//抛弃本次事件-不要产生回车键
		return false;
	});
	//后游览
	$(".comments-popover,#message").bind("keydown", bind_shift_key + "right", function() {
		//找到父级图
		var $pic_div = $(this).parents(".photo-display-item");
		//找到自己的序号
		var me_index = find_id_index($pic_div.prop("id"));
		//设置回调送出内容
		diag_send_out_desc(function() { //找寻自己的前一个序号,似乎去到下一个了
			if (me_index < $(".photo-display-item").length) { //如果至少存在的话
				Note.SetNoteClor("grey"); //红色警告
				Note.SetNote("现在向后面游览而去...");
				tips.says("向后开动一海里!");
				$(".photo-display-item").eq(me_index + 1).find(".comments-icon img").click();
			}
		});

		//抛弃本次事件-不要产生回车键
		return false;
	});
	//绑定ESC键为关闭
	$(".comments-popover,#message").bind("keydown", "esc", function() {
		if (Note.GetDesc() == "" || desc_orgin == Note.GetDesc()) { //如果没有修改,抛弃
			//关闭处理
			Note.CloseDiag();
		} else {
			Note.SetNoteClor("red"); //红色警告
			//TODO:或许该有原始的话,就不为难这里了呢？
			//包含字符串
			Note.SetNote("见鬼船长,Esc不能取消,有描述了呢!");
			//抛弃事件
			return false;
		}
	});

} //结束了自己

var Note = {

	wait_for_close: 1, //常量,等待几秒后自动关闭
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
		$(pics).find("[id][class*=img]").css("opacity", opacity_had_desc);
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
			//点击一个阴影对话框,应该能置于关闭
			$(".popover-shim").click();
		}
	},

}
/* 返回对象pic层 */

	function get_pics(img_id) {
		return $(".photo-display-item[data-photo-id=" + img_id + "]"); //对象层
	}

	/* 是否存在这个图片id */

	function chk_imgid(img_id) {
		return (get_pics(img_id).length > 0);
	}

	/* 图片描述的方式们 
	 * 旨在试图对图片ID进行标记
	 * 包含模糊
	 */
var pic_Desc = {

	/* 模糊掉 */
	blur_me: function(img_id, desc) { //制造犯迷糊
		var blur_mush = 15; //糊掉的程度

		$pics = get_pics(img_id);

		if ($pics.length == 0) { //0==false?
			return false; //失败了
		}
		//CSS的模糊-看起来太卡了 
		//$(pics).css("-webkit-filter", "blur(" + blur_mush + "px)");

		//写入一个文字
		$pics.find(".play").css("top", "50%").css("font-size", "5em").text("已抛锚");

		//一个悲剧的颜色-绿绿的
		$pics.find("span.photo_container").css("background-color", "#00FFAD");
		//CSS的透明-这个还不错
		$pics.find("[id][class*=img]").css("opacity", opacity_had_desc);
		//设置有标记
		$pics.find(".comment-count").text("抛锚");
		$pics.find(".comments-icon").attr("title", "描述信息:" + desc);
		return true;
	},
	//制造变成灰色,不考虑返回
	public_me: function(img_id) {

		$pics = get_pics(img_id);
		if ($pics.length == 0) { //0==false?
			return false; //失败了
		}

		$pics.find(".play").css("top", "50%").css("font-size", "5em").text("已公开");

		//设置一个背景色
		$pics.find("span.photo_container").css("background-color", "salmon");
		//模糊掉图片自己
		$pics.find("[id][class*=img]").css("opacity", "0.10");
		return true;
	},
	//标记啥都没有
	nothing_me: function(img_id) {
		//或许用this域?
		$pics = get_pics(img_id);
		if ($pics.length == 0) { //0==false?
			return false; //失败了
		};
		$pics.find(".play").css({
			"top": "90%", //靠下边
			"font-size": "4em", //不算太大
		}).text("待见识"); //待见识为文字内容

		//清理,清理
		$pics.find(".comment-count").text("");
		$pics.find(".comments-icon").attr("title", "");

		//清空CSS
		$pics.find("span.photo_container").css({
			"background-color": "",
			"opacity": ""
		});

		//啥也不做了
		return true;

	},
	//标记自己为已检查
	check_me: function(img_id) {
		$pics = get_pics(img_id);
		if ($pics.length == 0) { //0==false?
			return false; //失败了
		}
		//最后的工作
		$pics.attr("has_check", "true"); //标记已经检查
	},
};

/* 读取最新的400张API图片来校验
 * 这里的请求非常少,DOM操作比较多
 * 第一步阶段
 */

function Scan_All_Pics_For_Desc(max_pics) {
	tips.count("扫描见识状态")
	call_flickr_api_getnewphoto(max_pics, function(res) {
		if (res.stat = "ok") {
			if (res.photos.total > 0) { //至少有一个
				tips.justsays("拉回了" + res.photos.total + "个状态")
				var mathc_pic = 0; //匹配了几个
				//TODO 检查是否有photos
				res.photos.photo.every(function(api_photo) { //开始遍历
					//console.log(api_photo); //临时输出
					/* 所有需要的取回来 */
					img_id = api_photo.id; //图片ID
					desc = api_photo.description._content; //描述
					ispublic = api_photo.ispublic;
					if (chk_imgid(img_id)) {
						var have_nothing = true; //啥也没有
						if (desc != "") { //设置消息
							pic_Desc.blur_me(img_id, desc);
							have_nothing = false;
						};
						if (ispublic == 1) {
							pic_Desc.public_me(img_id);
							have_nothing = false;
						};
						if (have_nothing) {
							pic_Desc.nothing_me(img_id);
						};

						pic_Desc.check_me(img_id); //标记检查
						mathc_pic++; //标记
					}
					return true;
				}) // <--遍历每一个id结束
				//todo:显示一次性共多少?检查完成了多少?
				tips.justsays("共" + mathc_pic + "个被处理完")
				tips.count_die();
				//console.log("船长!一次性API匹配了" + mathc_pic + "个请求");
			}

		} else {
			tips.says("船长,试图大量探索失败了!")
			//console.log("船长,大批量的API探寻器失败了:" + res.code + ":" + res.message)
		}
		//todo:检查所有?		
		Scan_All_Pics_For_Desc_By_PerScan(150); //但愿还在?最大一次150
	}) //<--API回家了
}


/* 遍历一切-原生扫描方式
 * 每次扫描用一次api查询权限
 */
//TODO::合并,封装成帽子里

function Scan_All_Pics_For_Desc_By_PerScan(max_pics) {

	//指定最大数量-如果失败
	if (typeof(max_pics) != "number") {
		max_pics = 150; //一次最大处理的张数
	}

	//设置回调的回调函数来获得特别的玩意-看起来这里意外的变成闭包了
	var back_the_desc = function(img_id, callback) {
		call_flickr_api_getinfo(img_id, function(res) {
			//再包装一层。。。看起来是从闭包里得到小局部函数啊
			callback(res, img_id);
		});
	}
	var i_count = 0; //计数器
	//限制最大数,不检查已检查的
	$(".photo-display-item:not([has_check])").each(function() { //遍历开始
		//TODO:变更位imgid
		var img_id = $(this).attr("data-photo-id");
		//临时备份图片
		$img = $(this).find("[id][class*=img]");
		//TODO:或许用[$(".photo-display-item img[id][class*=img]:not([src*='spaceball.gif'])")]
		if ($img.prop("src") && $img.prop("src").match("spaceball.gif")) {
			return true; //继续下一个,不能返回fasle会死掉
		}
		//传入再传入。。。
		back_the_desc(img_id, function(res, img_id) {
			if (res.stat == "ok") { //如果有效发挥
				var have_nothing = true; // 它啥也没有
				//获得描述文本				
				var desc_returun = res.photo.description._content;
				if (desc_returun != "") {
					//必要的话-糊掉-需要指向准确的对象
					pic_Desc.blur_me(img_id, desc_returun);
					have_nothing = false;
				}
				//检查是否公开-处理公开问题-这里是那么优先
				//公开后不再次检查,但是描述信息的还是检查...
				if (res.photo.visibility.ispublic == 1) {
					//检查公开部分
					pic_Desc.public_me(img_id);
					have_nothing = false; //重复写?

				}
				if (have_nothing) {
					//啥也没有
					pic_Desc.nothing_me(img_id);
				}
				//无论如何都标记？为了当前的公开设置,这里暂时关闭
				//避免重复,再次的话-全部重载
				pic_Desc.check_me(img_id); //公开抛弃它
			} else {
				console.log("船长,试图寻找单个注释,失败了:" + res.code + ":" + res.message)
			}

		});
		i_count++;
		if (i_count > max_pics) {
			console.log("船长!超过了" + max_pics + "张,根据说好的!老子不干了!")
			return false; //彻底终止循环
		}
	}); //遍历结束
	//TODO:全局基数？
	if (i_count > 0) {
		console.log("使用了单独API申请了" + i_count + "个请求");
	}
	//TODO:没有的话进行一个提醒
}


/* 绑定注入图片点击钩子 */

function HOOK_FOR_PIC_CAN_CHECKED() {
	/* 搜寻所有有希望的图片 */
	//TODO:HOOK钩子

	/* 如果需要高限制可做: 
	 * 1.一般图片都有id,除了少数: [id]
	 * 2.如果需要去除小球加上 :not([src*='spaceball.gif'])
	 */
	$(".photo-display-item .photo-click[data-track] img[class*=img]").each(function() {
		/* 初始化为这家伙 */
		var $img = $(this); //捆定自己
		var $img_a = $(this).parent(); //绑定操作对象
		var $pic_div = $(this).parents(".photo-display-item"); //绑定对应图像框
		var pic_id = $pic_div.attr("data-photo-id"); //图片ID
		/* 清理自带点击 */
		$img_a.attr("href", ""); //指向保持空就好了,保留鼠标图标
		$img_a.removeAttr("data-track"); //自带的跟踪属性清理,防止冒泡
		$img_a.attr("title", "船长!选了它？");
		/* 注入一个div描述 */
		if ($img_a.find("div.take_state").length == 0) {
			$pic_div.find(".play").after('<div style="top: 10%; font-size: 3em;position: absolute;left: 0;right: 0;color: #009C13;" class="take_state">[-]</div>')
		}

		/* 绑定新的点击事件 */
		$img_a.click(function() {
			/** 开始处理图片被点击 **/
			switch_check(pic_id, true); //切换图片
			//保存变量
			sync_selct.save();

		}); //点击a结束

	});
}

function switch_check(img_id, need_say) {
	//选中的图片背景-ico by @alex
	//TODO:导入到扩展内部
	var css_img_checkd = "http://see.sl088.com/w/images/8/83/Img_check4flick.png";

	$pic_div = $(".photo-display-item[data-photo-id=" + img_id + "]"); //对象层
	$img = $pic_div.find(".photo-click img")

	/** 开始处理图片被点击 **/
	//NOTE:这里存在闭包吗-是的!属于上一级
	//困扰:闭包什么时候会失去呢？整个堆栈回来完毕后吗
	if (typeof($pic_div.attr("slboat_take_you")) == "undefined" || $pic_div.attr("slboat_take_you") != "true") { //字符串对比?
		$img.css("opacity", 0.4); //图片透明化,操作A的透明
		$img.parent().css("background", "url(\"" + css_img_checkd + "\") center no-repeat"); //背景打钩
		$img.attr("title", "船长!不要它？");
		$pic_div.attr("slboat_take_you", "true"); //写入标记
		if (need_say) {
			tips.says("咋门又选择了一个家伙!");
		}
	} else { //取消选中-尽可能还原现场
		$img.css("opacity", ""); //取消透明
		//需要还原现场...		
		$img.parent().css("background", ""); //取消背景
		//todo:改成带有标签?
		$img.attr("title", "船长!要回它？");
		$pic_div.attr("slboat_take_you", "false"); //标记无
		if (need_say) {
			tips.says("咋门又清掉了一个家伙!");
		}
		//TODO:还原原来的标记？是否已描？
	}
	//制造文字标记
	make_a_reson();

}

/* 扫描所有选中的予以标记 */

function make_a_reson() {
	var take_amount = $(".photo-display-item[slboat_take_you=true]").length; //带走的总数量
	$(".photo-display-item[slboat_take_you=true]").each(function(index) {
		var $state = $(this).find(".take_state");
		//标记选中
		$state.text("[" + (index + 1) + "/" + take_amount + "]");
		$state.css("color", "#FF8F00"); //设置alex的土黄色
	});
	//标记未选中的玩意
	$(".photo-display-item[slboat_take_you=false]").each(function(index) {
		var $state = $(this).find(".take_state");
		//标记选中
		$state.text("[-]");
		$state.css("color", "#009C13"); //设置未选的黄色
	});
}

/* 同步选中内容 */
sync_selct = {
	/* 保存当前的选中 */
	save: function() {
		sessionStorage.slboat_flickr_sel = select_gen_str(); //置入
	},
	load: function() {
		var get_save = sessionStorage.getItem("slboat_flickr_sel");
		if (get_save) {
			select_for_this(get_save);
		}
	}

}
/* 清理所有选中的标记 */

function clean_everything() {
	tips.says("船长!清除所有选中的家伙!");
	$(".photo-display-item[slboat_take_you=true]").each(function(index) {
		//用原始的方法来调用点击
		switch_check($(this).attr("data-photo-id"));
		sync_selct.save(); //会不会太早了
	});
}

/* 根据目标字串,选定图片 */

function select_for_this(idstr) {
	var faild_num = 0; //失败次数
	var chk_first, chk_me; //检查者
	if (typeof(idstr) != "string") return false; //失败
	var idArry = idstr.split(",");
	if (idArry.length > 0) { //如果一个都不配合你？
		//开始重组对话框
		idArry.every(function(id) {
			$chk_first = $(".photo-display-item[data-photo-id=" + id + "]")
			if ($chk_first.length > 0) {
				var $chk_me = $chk_first.not("[slboat_take_you=true]"); //检查选中
				if ($chk_me.length > 0) {
					switch_check(id); //切换选择
				}
			} else {
				faild_num++;
			}
			return true;
		});
		//如果目标不存在？
	}
	if (faild_num > 0) console.log("载入ID失败了" + faild_num + "个");
}

/* 获得选中图片的字符串 */

function select_gen_str() {
	return get_all_select().join(",");
}

/* 获得所有选中的ID 
 * 返回数组串 [id1,id2,id3]
 */

function get_all_select() {
	var idArry = []; //新的返回数组
	var $pic_selct = $(".photo-display-item[slboat_take_you=true]"); //选中的图片
	for (now = 0; now < $pic_selct.length; now++) {
		idArry.push($pic_selct.eq(now).attr("data-photo-id"));
	}
	return idArry; //返回出去
}

/* 初始化热键绑定-选中按钮的 */

function flickr_chk_hotkey_bind() {

	/* 绑定清空 - c */
	$(document).bind("keydown", "c", clean_everything);

	/* 绑定送出去哩 */

	/** 绑定 ctrl+/ **/
	$(document).bind("keydown", "ctrl+/", send_to_orgin);
	/** 绑定 z */
	$(document).bind("keydown", "z", send_to_orgin);

	/* 再次刷新显示 -q */
	$(document).bind("keydown", "q", REDONE_ALL_PAGE);

	/* hidden all public 
	 * 看起来只隐藏了,不切换噢
	 */
	$(document).bind("keydown", "h", HIDDEN_ALL_PUBLIC)

}

/* 发送到管理页面-哇喔! */

function send_to_orgin() {
	var idArry = get_all_select(); //获得选中
	if (idArry.length > 0) {
		//告知要管理页面
		//TODO:做点啥子？
		chrome.extension.sendMessage({
			command: "send_ids_to_orgin",
			idstr: idArry.join(","), //合并起来 
		});
		tips.says("送出了" + idArry.length + "到管理的家伙!")
	}

}

/* 收到一条信息 */

function aMessage_form_Forgin(message) {
	//case 在这里看起来很美好
	if (message == "ReScan") { //重新扫描,好的
		REDONE_ALL_PAGE();

	}
}


/* 消息框操作的玩意 - 这里是提示框类
 * init:初始化
 * says:设置
 * count:开始计数
 * count_die:终止计数
 */

var tips = {
	//初始化的提示源文本,@alex最早制造了它的原型,大约于13年年末的时候
	tips_li: '<li style="font-size:2em;color:rgba(137, 210, 233, 0.66);position:absolute;top:32%;left:44%;font-weight:bold;"><span id="tips_top"></span><span id="tips_count" style="color: grey;">...1秒过去了</span></li>',
	//这里应该很有意思的是,初始化的所有都会发生一次,除了函数-它只是赋值,而在通常的意义里赋值就是变量的初始化和生命周期了
	timerID_Tips: 0, //tips的定时器id

	/* 检查是否已经存在 */
	hasinit: function() {
		return $("#tips_top").length > 0;
	},
	/* 初始化 */
	init: function(what) {
		what = what || "船长,航海见识墨水待命!"
		if (!this.hasinit()) {
			//设置一个全局的定时器
			window.i_count_now = 0;
			//将其插入上传后面
			$(".gn-upload").after(this.tips_li);
			this.says(what);
			return true;
		}
		return false;
	},
	/* 谈论它 */
	says: function(what) {
		if (!this.hasinit()) return false;
		//改变后的内容不需要所有已存的计数器
		this.count_die();
		//这是-正事
		$("#tips_top").text(what);
		return true;
	},
	/* 只是谈论,不清理 */
	justsays: function(what) {
		if (!this.hasinit()) return false;
		//这是-正事
		$("#tips_top").text(what);
		return true;
	},
	/* 计时谈话将在处理 */
	count: function(what) {
		if (!this.hasinit()) return false;
		if (this.timerID_Tips > 0) {
			this.count_die(); //处死已存活的定时器
		};
		//若有赋值的话,让别人(says-嘴巴这家伙?)去办到
		if (what && what != "") { //null undefined?->dead
			this.justsays(what);
		}
		//计数器的开始之旅
		this.timerID_Tips = setInterval(function() {
			//这里进入了一个新的变量域
			if (window.i_count_now > 0) {
				//TODO:展示为0:0x?
				$("#tips_count").text(":" + window.i_count_now + "秒");
			}
			window.i_count_now++;
		}, 1000)
	},
	/* 计数器器死了
	 * 终于不再数了-这忙坏了的家伙
	 */
	count_die: function() {
		if (!this.hasinit()) return false;
		if (this.timerID_Tips > 0) {
			clearInterval(this.timerID_Tips);
		};
		//重置计数
		window.i_count_now = 0;
		//dom玩意强制重置
		$("#tips_count").text(""); //清空计数器
	}
};

/* 寻找下一个图片id */

function find_id_index(id) {
	$photos = $(".photo-display-item")
	for (var i = 0; i < $photos.length; i++) {
		if ($photos.eq(i).prop("id") == id) {
			return i; //返回id
		}
	}
	return null; //不存在
};