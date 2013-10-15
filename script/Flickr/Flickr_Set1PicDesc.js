/* 快速添加标记 
 * 用于一个对话框之下快速的完成添加标记
 */

//主函数

function flickr_onepic_add_tag() { //这里包括了绑定基本的快捷键

	//为更多图片牺牲自己
	//TODO：清理这里

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

if (!am_i_index()) { //非注册的情况下使用有效
	//初始化绑定
	$(document).ready(function() {
		//只需要z
		//意外发现有趣的是，这里的函数传递就像直接对等一样，而不需要()来执行，因为它不需要被执行，只需要被传入-就像一个指针。
		$(document).bind('keydown', 'z', flickr_onepic_add_tag); //Mac下这个啥都能用，哈！

		/* 绑定一个设置公开的玩意  - ctrl+/，旧方式 */
		$(document).bind('keydown', 'ctrl+/', setPhotoPubilc); //mac里是command

		/* 也申请一次api吧 */
		i_request_for_API();

	});
}

function setPhotoPubilc() {

	var photo_id = get_flickr_link("only_id");
	if (!photo_id) return false; //如果无效，丢弃
	call_flickr_api_setpublic(photo_id, function(res) {
		if (res.stat == "ok") {
			alert("船长!这玩意被设置公开了!现在是见识了!")
		} else {
			alert("船长!\n这玩意出现意外!失败了!\n意外是" + res.code + ":" + res.message)
		};
	});

}