/* 快速添加标记 
 * 用于一个对话框之下快速的完成添加标记
 */

//主函数
var flickr_add_tag = function() { //这里包括了绑定基本的快捷键

	//为更多图片牺牲自己
	//TODO：清理这里
	if (Enable_SetLotPicsDesc) {

		HOOK_FLICKR_PAGE(); //激活热键事件
		return true; //已经完成工作
	}

	var old_desc = "";
	//获取正常文字
	if ($("#description_div textarea").length > 0) {
		old_desc = $("#description_div textarea").val(); //编辑框提取
	} else {
		old_desc = $.trim($("#description_div").text()); //非编辑框尝试，这里看起来是很多p
	}

	if (typeof(old_desc) != undefined && (old_desc == "" || old_desc.match("按一下這裡以增加描述"))) //最终判断
	{
		var note_str = prompt("还未标记,标记点啥?船长");
	} else {
		var note_str = prompt("已标记,换成啥?船长", old_desc);
	}

	//开始处理标记

	if (note_str && note_str != "" && note_str != old_desc) { //避开没有变化的变化	
		//点击编辑
		$("#description_div").click();
		//输入文字
		$("#description_div textarea").val(note_str); //赋值进入
		//点击保存
		$("#description_div .Butt").click();
	}
}

if (!Enable_SetLotPicsDesc) { //非注册的情况下使用有效
	//初始化绑定
	$(document).ready(function() {
		//TODO 优化这些按键
		//意外发现有趣的是，这里的函数传递就像直接对等一样，而不需要()来执行，因为它不需要被执行，只需要被传入-就像一个指针。
		$(document).bind('keydown', 'ctrl+p', flickr_add_tag); //Mac下这个啥都能用，哈！

		$(document).bind('keydown', 'alt+p', flickr_add_tag); //用于Win的兼容

		/* 额外的bones */
		$(document).bind('keydown', 'ctrl+/', flickr_add_tag); //俺喜欢这个，就像c的注释的一部分
		$(document).bind('keydown', 'meta+/', flickr_add_tag); //mac里是command

		//在mac这是非常接近的两键呢
		$(document).bind('keydown', 'alt+/', flickr_add_tag); //mac里是command

	});
}