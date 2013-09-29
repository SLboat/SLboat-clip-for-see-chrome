/* 快速添加标记 */
$(document).bind('keydown', 'alt+q', function() {
	var old_desc = "";
	//获取正常文字
	if ($("#description_div textarea").length > 0) {
		old_desc = $("#description_div textarea").val(); //编辑框提取
	} else {
		old_desc = $.trim($("#description_div").text()); //非编辑框尝试，这里看起来是很多p
	}

	if (typeof(old_desc) != undefined && old_desc == "") //最终判断
	{
		var note_str = prompt("还未标记,标记点啥?船长");
	} else {
		var note_str = prompt("已标记,换成啥?船长", old_desc);
	}

	//开始处理标记

	if (note_str != "" && note_str != old_desc) { //避开没有变化的变化
		//点击编辑
		$("#description_div").click();
		//输入文字
		$("#description_div textarea").val(note_str); //赋值进入
		//点击保存
		$("#description_div .Butt").click();
	}
});