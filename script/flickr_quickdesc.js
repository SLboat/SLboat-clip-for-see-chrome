/* 快速添加标记 */
$(document).bind('keydown', 'alt+q', function() {
	//标记文字
	var note_str = prompt("你想标记点啥？船长");
	if (note_str != "") {
		//点击编辑
		$("#description_div").click();
		//输入文字
		$("#description_div textarea").val(note_str); //赋值进入
		//点击保存
		$("#description_div .Butt").click();
	}
});