/* 这里是从管理页面获取tag，然后用API调用
 * 依赖jQuery进行运作
 */
var no_matter_tag = "From_Eye_Fi";

/* 扩展获得下一个节点的功能给jQuery
 * 这里用来提取文本节点
 * 但愿只有一个
 * todo：检查是否存在不存在则注入
 */

function jQuery_load_nextNode() {
	if (typeof ($.fn.nextNode) == "undefined")
	//不存在，注册使用
	{
		$.fn.nextNode = function () {
			var contents = $(this).parent().contents();
			return contents.get(contents.index(this) + 1);
		}
	}
}

//完整的获取逻辑 - 这里是一切的起源地

function get_flickr_organize_tag(selct_tag_str) {
	var tags; //定义标记的中间仓库
	var tag_to_found = null; //获得的tag标签

	var check_div = "#one_photo_edit_pop"; //检查是否存在的标记

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
		if (has_tag_edit_diag())
		{
				//交给获取标签的去试试运气
				make_tag_and_get();
				return true;//返回成功
		}	//清空
			use_ink_api_clean();
			//发生意外事件
			return false;
	}
	//如果无匹配
	//todo：提醒加上标题？因为没有复位
	if (!tag_to_found) {
		var taff_str = ""; //艰难标签的说辞
		if (tags.has_taff_tag)
			taff_str = "虽然有着坚硬的标签:" + no_matter_tag;
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
	selct_tag_str=$.trim(selct_tag_str);

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
	var taginfo_div=get_taginfo_div();//临时获得
	if (typeof(tag_div)!="undefined") //以无效来判断是否为第一次初始化
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
		if (alltag[tag] == no_matter_tag) //如果是不要的标签
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
			$("#batch_add_tags").val().length>0;
}

//在编辑对话框制造一些玩意

function make_tag_and_get() {
	//开始自动标签
	if ($("#batch_edit_pop").css("display") == "block") { //有了加入标签对话框的话
		tags_for_work = $("#batch_add_tags").val();
		if (tags_for_work.length == 0) {
			return 1; //意外退出
		} else
			$("#batch_add_tags_form .Butt").click(); //点击，开始干活
		//开始等待10秒的工作，或许需要更多？
		wait_tag_done(10);
	}else
		return false;
}

//等待最后的任务完成

function wait_tag_done(timeout_time) {
	var work_start_time = new Date().getTime(); //开始工作的事件，毫秒
	clearInterval(wait_id); //清理上次的id
	//开始每500毫秒一次扫描对话框
	wait_id = setInterval(function () {
		//扫描间隔
		if ($("#comm_div").css("display") == "block" && $("#comm_button_ok").val() == "謝謝！") {
			//已经完成任务了
			if (is_debug_tag_module) console.log("看起来任务完成了！这次要针对的标签是", tags_for_work) //标签模块的调试标记-输出日志
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