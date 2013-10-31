//格式化为森亮航海见识格式
//-------------------------
// ===标题<sup> 沿途见识</sup><ref> url </ref>===
// 内容
//--------------------------
//传入了ink，title，url，在这里处理

function ink_color(ink_box) {
	var textout; //输出变量
	var style_txt; //风格字串

	if (get_ink_for() == "alex") {
		style_txt = "[color=grey]沿途见识：[/color]%br%";
		style_txt += "[quote]%ink%[/quote]%br%"; //无法避免不换行
		style_txt += "[align=right][color=grey]见识来源: [url=%url%]%title%[/url][/color][/align]%br%"; //结尾完毕

		/* 保守风格
		// 一种保守风格-用于不支持对齐代码的地方 
		var style_txt_classic = "[color=grey]沿途见识[/color][color=Grey](见识原始来源: [url=%url%][/url][/color])%br%"
		style_txt_classic += "[quote]%ink%[/quote]"
		*/

		textout = randerink(style_txt, ink_box);

	} else {
		//todo: 考虑太长标题带来的麻烦？
		if (ink_box.title == "" || ink_box.url == "") //如果只有墨水
		{
			return ink_box.text; //只返回一些玩意
		}
		// 没有回头的路，是的
		//处理标题加上标志 -- 这玩意是如此的简单
		style_txt = "===%title%<sup> 沿途见识</sup><ref name=%refname%>[%url% %title%], 见识于" + get_time_str() + "</ref>===";
		style_txt += "%br%"; //先换一行
		style_txt += "<poem>%br%%ink%%br%</poem>";
		style_txt += "%br%"; //再一个换行
		textout = randerink(style_txt, ink_box);

	}
	return textout;
}

/* 渲染墨水-染色
 * 渲染文字(%ink%)、标题(%title%)、url(%url%)、新行(%br%)、见识名称(%refname%)
 */

function randerink(perink, ink_box) {
	//todo：考虑如果替换原始内容有特殊玩意的处理，目前考虑的是模式符号[\1]
	perink = perink.replace(/%ink%/g, escape_replace_substr(ink_box.text)); //文字
	perink = perink.replace(/%title%/g, escape_replace_substr(ink_box.title)); //标题
	perink = perink.replace(/%url%/g, escape_replace_substr(ink_box.url)); //地址
	perink = perink.replace(/%br%/g, "\r\n"); //新行也支持了，是的
	perink = perink.replace(/%refname%/g, escape_replace_substr(ref_name_str())) //支持参考名称

	return perink;
}

/* 返回一个当前时间 */
// 格式就像是"2013-3-30 14:20"

function get_time_str() {
	var now = new Date();
	//获得日期串
	var datastr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
	//获得时间串
	var timestr = now.getHours() + ":" + now.getMinutes();
	return datastr + " " + timestr; // 最后得到的玩意
}

function ref_name_str() {
	var now = new Date();
	var datastr = now.getFullYear().toString().slice(-2) + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2);
	var timestr = ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + ("0" + now.getSeconds()).slice(-2);
	return "\"" + "Seeing@" + datastr + "_" + timestr + "\""
}

/* 反注释替换字符的怪异字符
 * 比如[]$&]
 */

function escape_replace_substr(s) {
	return s.replace(/\$/g, "$$$$");

}