/* 这里是从管理页面获取tag，然后用API调用
 * 依赖jQuery进行运作
 */
var No_matter_tag = "From_Eye_Fi";
var Have_bundle_flag = false; //是否已经绑定
var Have_setup_bundle = false; //是否已经注入绑定

var Has_key_bundle = false; //esc键是否绑定成功

var Flickr_Orgin_Has_Load = true;
/* 扩展获得下一个节点的功能给jQuery
 * 这里用来提取文本节点
 * 但愿只有一个
 * todo：检查是否存在不存在则注入
 */

function jQuery_load_nextNode() {
	if (typeof($.fn.nextNode) == "undefined")
	//不存在，注册使用
	{
		$.fn.nextNode = function() {
			var contents = $(this).parent().contents();
			return contents.get(contents.index(this) + 1);
		}
	}
}

//加入绑定事件-原型，还不能工作的很好

function tag_press_done_bundle() {
	if (Have_bundle_flag) {
		//返回已经完成
		return 302;
	}
	if ($("#batch_add_tags_form").length > 0) {
		$("#batch_add_tags_form").submit(function() {
			//动画开始-通常的需要它吗？
			use_ink_api_start();
			//开始制造剩余部分-需要点好运
			make_tag_and_get();

		})
		//奇怪的是按键事件竟然可能是独立的
		$("#batch_add_tags_form .Butt").click(function() {
			//动画开始-通常的需要它吗？
			use_ink_api_start();
			//开始制造剩余部分-需要点好运
			make_tag_and_get();

		})

		/* 顺带的绑定留言框的 */
		$("#batch_perms_form").submit(function() {
			wait_tag_done(10); //依然等待几秒
		});

		$("#batch_perms_form .butt").click(function() {
			wait_tag_done(10); //依然等待几秒
		})

		Have_bundle_flag = true; //绑定标志锁死
	} else {
		//试试未来注入吧
		set_up_tag_hook();
	}
}

//试图注入基本钩子
$(document).ready(function() {
	i_request_for_API(); //索要api
	//TODO:这里看起来会出现问题
	use_key_bundle(); //绑定寄出键
	set_up_tag_hook(); //绑定tag对话框

	sandbox_setup(); //初始化沙盒

})

/* 热键绑定，让事情变得简单一些-至少试图 
/* 确保页面完成后再做这个 */

function use_key_bundle() {
	if (!Has_key_bundle) {
		//旧的方式是[mouseover mouseout]，在这里新的方式看起来妙极了
		$("body").on("DOMSubtreeModified", "#one_photo_inner_border_div", function() {
			//取消委托-不需要了
			$("body").off("DOMSubtreeModified", "#one_photo_inner_border_div");

			//很奇怪热键在这里不能用
			$("#one_photo_inner_border_div").keydown(function(event) {
				if (event.keyCode == 27) { //ESC
					$("#one_photo_cancel").click()
				};
			});

			/* 绑定回车按钮 */
			//todo:检查对话框显示并且存在
			$("#addtagbox").bind("keydown", "return", function() {
				$("#one_photo_save").click()
			});
		})
		//再继续绑定别的玩意
		$(document).bind("keydown", "esc", function() {
			//所有的esc处理玩意
			press_esc_event(); //呼叫这个玩意

		})
		/* 绑定按键 t */
		$(document).bind("keydown", "t", function() {
			//NOTE：这里不处理标记对话框，因为它可以回到自己
			/** 检查权限对话框 **/
			if (check_display($("#batch_mat_perms"))) {
				return true;
			}
			/** 检查公共对话框 **/
			if (check_display($("#comm_div"))) {
				return true; //只处理一层
			}
			$("#candy_button_o_addtags a")[0].click(); //看起来哦，只能dom方法
			return false; //不要本次事件
		})
		/* 绑定按键 s */
		$(document).bind("keydown", "s", function() {
			/* 检查对话框 */
			/** 检查自己的对话框 **/
			if (check_display($("#batch_mat_perms"))) {
				return true;
			}
			/** 检查标记对话框 **/
			if (check_display($("#batch_mat_add_tags"))) {
				return true;
			}
			/** 检查公共对话框 **/
			if (check_display($("#comm_div"))) {
				return true; //只处理一层
			}
			/* 检查选中情况 */
			if (!($("#is_public").prop("checked"))) {
				$("#is_public").prop("checked", "true");
				//LUCK:变更属性-幸好这里的onchange事件非必须
			}
			/* 激活事件 */
			$("#candy_menu_o_perms a:eq(0)")[0].click(); //看起来哦，只能dom方法	

			//目前是等待一秒五呢
			setTimeout($("#batch_perms_form .Butt").click(), 1500);

			return false; //不要本次事件
		})
		/* 绑定按键 c */
		$(document).bind("keydown", "c", function() { //大写是不会干活的
			if ($("#clear_batch_div").css("visibility") == "visible") {
				$("#clear_batch_div a")[0].click();
			}
		})
		/* 绑定按键 p */
		$(document).bind("keydown", "p", function() {
			//选择隐私
			$("#findr_privacy_select").val("priv_5");
			//原生按钮尝试
			$("#findr_submit").click();
		})
		/* 绑定按键 b */
		$(document).bind("keydown", "b", function() {
			i_wana_back_index();
		});
		/* 绑定左右的玩意 */
		$(document).bind("keydown", "left", function() {
			$("#findr_prev_solt")[0].click(); //看起来哦，只能dom方法
		});

		$(document).bind("keydown", "right", function() {
			$("#findr_next_solt")[0].click(); //看起来哦，只能dom方法
		});

		//额外再次绑定添加标签按钮
		//TODO:变成吸取选中？好像很无必要呢
		$(document).bind("keydown", "ctrl+/", function() {
			$("#candy_button_o_addtags a")[0].click(); //看起来哦，只能dom方法
		});
		//失效
		Has_key_bundle = true;
	}
}

//标签按钮的钩子

function set_up_tag_hook() {
	if (!Have_setup_bundle) {
		//鼠标移动怎么样！
		$("#batch_edit_pop").on("DOMSubtreeModified", "#batch_add_tags_form,#batch_perms_form", function() {
			//注销原始触发器-相比one的好处是不是处理完注销
			$("body").off("DOMSubtreeModified", "#batch_add_tags_form");
			//一次性事件注入
			tag_press_done_bundle();
			//一个象征物
			use_ink_api_start();
			//tab标签框，绑定esc
			$("#batch_add_tags").bind("keydown", "esc", function() {
				$("#batch_add_tags_form .CancelButt").click()
			});

			//因为是一起出现的，这里绑定公开的玩意
			$("#batch_mat_perms").bind("keydown", "esc", function() { //ESC取消
				$("#batch_perms_form .CancelButt").click(); //可用[this.find]不是吗
			});
			$("#batch_mat_perms").bind("keydown", "return", function() { //return输入
				$("#batch_perms_form .Butt").click();
			});

			//激活首次事件
			//$("#batch_add_tags_form .Butt").click();
		})
		//绑定完毕
		Have_setup_bundle = true;
	}

}

//完整的获取逻辑 - 这里是一切的起源地
//todo:复位work_tag

function get_flickr_organize_tag(selct_tag_str) {
	var tags; //定义标记的中间仓库
	var tag_to_found = null; //获得的tag标签

	var check_div = "#one_photo_edit_pop"; //检查是否存在的标记

	//锁定绑定标志-委托给body
	tag_press_done_bundle();
	//绑定esc键为啥不呢
	use_key_bundle();

	//提取一份tag列表，确定是否有对话框出现
	if ($(check_div).length > 0 && $(check_div).css("display") != "none") //存在并且可见
	//存在标记，开始工作
	{
		//仓库保存
		tags = get_all_tags();
		//首先试试选中的文字是否匹配
		tag_to_found = get_in_tags(tags, selct_tag_str);
		//测试匹配获取
		if (!tag_to_found) {
			//选中文字不匹配，试试唯一性的匹配
			tag_to_found = get_only_tags(tags);
		} else if (tag_to_found == "::alot") {
			set_taginfo_text("@many - 航海见识墨水匹配到接近( " + selct_tag_str + " )的玩意太多了,不止有1个")
			//可以匹配的太多了
			//use_ink_api_clean();
			return false;
		}
	} else {
		if (has_tag_edit_diag()) {
			//交给获取标签的去试试运气
			push_the_tag_button();
			return true; //返回成功
		} //清空
		use_ink_api_clean();
		//发生意外事件
		return false;
	}
	//如果无匹配
	//todo：提醒加上标题？因为没有复位
	if (!tag_to_found) {
		var taff_str = ""; //艰难标签的说辞
		if (tags.has_taff_tag)
			taff_str = "虽然有着坚硬的标签:" + No_matter_tag;
		if (selct_tag_str.length == 0) {
			if (tags.num == 0)
				set_taginfo_text("航海见识墨水无法提取到有效标签,这里甚至没有标签" + taff_str);
			else
				set_taginfo_text("!faild -航海见识墨水不知道该提取哪个是好,这里有" + tags.num + "个标签呢");
		} else {
			if (tags.num == 0)
				set_taginfo_text("!faild -航海见识墨水无法匹配到接近( " + selct_tag_str + " )的玩意,这里甚至没有任何标签!" + taff_str)
			else
				set_taginfo_text("!faild -航海见识墨水无法匹配到接近( " + selct_tag_str + " )的玩意")
		}
		use_ink_api_clean();
		//todo: 更多提醒，选中了啥子的
		return false;
	}

	//啊哈，匹配了
	//给出提示信息
	set_taginfo_text("@work - 航海见识墨水正在提取标签:" + tag_to_found + "...");

	//召唤API，使用高级模式
	call_flickr_api_search(tag_to_found, true);
	//别的？

	return true;

}

//获得页面里对话框的tag

function get_in_tags(tags, selct_tag_str) {
	var match_tag = null; //匹配的标记
	var match_times = 0; //匹配次数
	//清理空白格
	selct_tag_str = $.trim(selct_tag_str);

	if (selct_tag_str == "") {
		return false; //直接完毕
	}

	//todo：模糊匹配一部分？
	if (tags.text.match(selct_tag_str)) //存在字符串里 
	{
		for (var i in tags.alltag) {
			tag = tags.alltag[i];
			if (tag.match(selct_tag_str)) {
				match_tag = tag;
				match_times++;
			}
		}
	}
	if (match_times == 1) {
		return match_tag;
	} else if (match_times > 1) //不止一个
	{
		return "::alot"; //太多了！
	}
	//失败告终，没有tag匹配
	return null;
}

//获得唯一的tag，如果存在的话

function get_only_tags(tags) {
	if (!is_empty_tags(tags) && is_only_tags(tags)) {
		return tags.text; //返回文字即可
	}
	return null; //返回无效
}


/* 标签标记显示和操作 */
//获得标签标记的文字层

function get_taginfo_div() {
	jQuery_load_nextNode(); //必要的话载入
	return $("#one_photo_description+br").nextNode();
}

//设置标签标记文字

function set_taginfo_text(tips) {
	//todo: 获取默认值？
	var default_tips = "標籤"; //默认的显示文字，这里考虑为中文的
	var taginfo_div = get_taginfo_div(); //临时获得
	if (typeof(taginfo_div) != "undefined") //以无效来判断是否为第一次初始化
	{
		taginfo_div.textContent = default_tips + "\t\t\t      [" + tips + "]";
	}
}

//获得所有匹配的标记

function get_all_tags() {
	var tag_conts_div = "#addtagbox"; //标签内容容器的标志
	var tag_split_str = " "; //标签分割字符，默认是空格
	var has_taff_tag = false; //带着坚硬的标签-无价值标签

	var tags_text = $.trim($(tag_conts_div).val()); //临时的中间标签文本,切割空格

	var alltag = tags_text.split(tag_split_str); //切割的临时变量
	//开始检索不必要的标签，目前只处理一个，通常它是eyefi的
	for (var tag in alltag) {
		if (alltag[tag] == No_matter_tag) //如果是不要的标签
		{
			alltag.splice(tag, 1); //丢弃掉它
			has_taff_tag = true; //设置坚硬标签
		}
	}

	//搭建完成
	tags_text = alltag.join(tag_split_str); //重新组合最终字串

	var num = 0;
	if (tags_text.length > 0) //有内容的话
	{
		num = alltag.length; //获得的长度，没有将是0
	}

	return {
		text: tags_text, //最基础的玩意
		alltag: alltag, //使用tags很好，但是可能很意外
		num: num, //一个多余的小玩意
		has_taff_tag: has_taff_tag
	}
}

//是否唯一tag，输入tag类型
//todo:合并到原始类型里去

function is_only_tags(tags) {
	//集中到一次性处理？
	return (tags.num == 1);
}

//是否没有tag

function is_empty_tags(tags) {
	//即时很坏的扑捉到了空格，那么也是得到空白玩意
	return (tags.text == "");
}

//通知开始主动播放动画

function use_ink_api_start() {
	chrome.extension.sendMessage({
		command: "ink_api_start",
	});
}

//通知播放一切动画

function use_ink_api_clean() {
	chrome.extension.sendMessage({
		command: "ink_api_clean",
	});
}

/* 当完成了api工作后
 * 这里会被调用api未来调用
 */

function ink_organize_api_done(tag) {
	set_taginfo_text("@done - 航海见识墨水已经提取标签: " + tag + "");
}

/* 这是标签自动化添加的模块们 
 * 它们暂时的被置放在这里
 */
var wait_id = 0;
var tags_for_work; //要工作的标签
var is_debug_tag_module = true; //标签模块的调试标记-输出日志

// 返回是否在编辑对话框

function has_tag_edit_diag() {
	//存在显示，长度大于0
	return $("#batch_edit_pop").css("display") == "block" &&
		$("#batch_add_tags").val().length > 0;
}

//推一下tag对话框

function push_the_tag_button() {
	if ($("#batch_edit_pop").css("display") == "block") {
		$("#batch_add_tags_form .Butt").click(); //点击，开始干活
		//剩下的交给别人去做
	}
}

//在编辑对话框制造一些玩意

function make_tag_and_get() {
	//开始自动标签
	if ($("#batch_edit_pop").css("display") == "block") { //有了加入标签对话框的话
		tags_for_work = $("#batch_add_tags").val();
		if (tags_for_work.length == 0) {
			return 1; //意外退出
		} else

		//开始等待10秒的工作，或许需要更多？
			wait_tag_done(10);
	} else
		return false;
}

/* 关闭公共对话框 */

function wait_tag_done(timeout_time) {
	var work_start_time = new Date().getTime(); //开始工作的事件，毫秒
	clearInterval(wait_id); //清理上次的id
	//开始每500毫秒一次扫描对话框
	wait_id = setInterval(function() {
		//扫描间隔
		if ($("#comm_div").css("display") == "block" && $("#comm_button_ok").val() == "謝謝！") {
			//已经完成任务了
			if (is_debug_tag_module) console.log("看起来任务完成了！") //标签模块的调试标记-输出日志
			clearInterval(wait_id);
			$("#comm_button_ok")[0].click(); //奇怪只能用html的方式
			call_flickr_api_search(tags_for_work, true); //1秒后完成剩下的工作
			//设置捕获事件。。。
			return 0; //返回结束
		}
		if (new Date().getTime() - work_start_time > timeout_time * 1000) {
			if (is_debug_tag_module) console.log("时间太长了，结束等待...超过了秒数：", timeout_time) //标签模块的调试标记-输出日志
			clearInterval(wait_id);
			return 1; //意外
		} else
		if (is_debug_tag_module) console.log("继续等待对话框...") //标签模块的调试标记-输出日志

	}, 500)
}

/* 基本函数部分 */
/** 检查是否显示 **/

function check_display($dom) {
	if ($($dom).length == 0) return false; //检查至少需要存在嘛
	return $($dom).css("display") != "none";
}

/* 全局的esc工作函数 */

function press_esc_event() {
	//console.log("esc has press:!a"); //提醒

	/* 开始处理对话框 */
	/** 处理公共对话框 **/
	if (check_display($("#comm_div"))) {
		//检查取消按钮是否存在
		if ($("#comm_button_cancel").css("visibility") == "visible") {
			return false;
		}

		$("#comm_button_ok")[0].click(); //奇怪只能用html的方式
		return true; //只处理一层
	}
	/** 处理公开对话框 **/
	if (check_display($("#batch_mat_perms"))) {
		$("#batch_perms_form .CancelButt").click(); //取消咯
		return true;
	}
	/** 处理标签对话框 **/
	if (check_display($("#batch_mat_add_tags"))) {
		$("#batch_add_tags_form .CancelButt").click(); //取消咯
		return true;
	}
	/* 处理单个图片信息对话框 **/
	if (check_display($("#one_photo_edit_pop"))) {
		$("#one_photo_cancel").click();
		return true;
	}

	return false; //可伶的没有一个
}

/* 初始化沙盒玩意 */

function sandbox_setup() {
	/* 注入沙盒按钮 */
	if ($("#id_to").length == 0) {
		//检查事件细节
		var chk_events = "if(_ge('id_to').value==''){return false;};_ge('tabl_mat_batch').mat_empty();_ge('tabl_mat_batch').mat_add_photos(_ge('id_to').value.split(','));"
		//左右按钮
		var double_a = '<a id="findr_prev_solt" onclick="_ge(\'findr\').findr_go_towards_the_beg();" style="display: none;"></a>';
		double_a += '<a id="findr_next_solt" onclick="_ge(\'findr\').findr_go_towards_the_end();" style="display: none;;"></a>';
		//添加按钮div源码
		var div_Add_id_batch = '<li id="Add_id_batch">'; //头部

		div_Add_id_batch += '<a id="sandbox_addpic" onclick="' + chk_events + '">添加ID:</a>'; //按钮沙盒
		div_Add_id_batch += '<input type="text" id="id_to" readonly style="margin-left: 5px;">'; //id输入框
		div_Add_id_batch += '<span id="id_got_much" style="margin-left: 2px;">↑待送来</span>'; //获得了多少状态框
		div_Add_id_batch += double_a; //加上双a

		div_Add_id_batch += '</li>'; //尾巴

		/* 开始绑定咯 */
		$("#candy_button_o_location").after(div_Add_id_batch); //绑定上去
	}
}

/* 沙盒添加图片 
 * 传入图片文本：[,]分割的字串
 */

function add_pics_by_sandbox(picStr) {
	if (picStr.length > 0) {
		//写入id文本
		{
			$("#id_to").val(picStr);
		}
		var id_num = picStr.split(",").length;
		//告知反馈
		$("#id_got_much").text("←" + id_num + "个ID")
		$("#sandbox_addpic")[0].click();

		//设置的事情后检查是否一致
		setTimeout(function() {
			var really_id_num = $("#tabl_mat_batch .batch_photo_img_div").length - 1;
			if (really_id_num != id_num) {
				//显示不一致的情况
				$("#id_got_much").text("X[" + id_num + "丢失" + (id_num - really_id_num) + "]");
			} else {
				$("#id_got_much").text("√[" + id_num + "全获得]");
			}
		}, 500)
		//需要严重的反馈
	}

}

/* 我想返回来的页面 */

function i_wana_back_index() {
	//请求返回
	chrome.extension.sendMessage({
		command: "back_to_index_page"
	})

}