//格式化为森亮航海见识格式
//-------------------------
// ===标题<sup> 沿途见识</sup><ref> url </ref>===
// 内容
//--------------------------
//传入了ink，title，url，在这里处理

function ink_color(ink)
{
	var textout; //输出变量
	var style_txt; //风格字串
	if (get_ink_for()=="alex")
	{
		style_txt="[color=grey]沿途见识：[/color]\r\n"
		style_txt+="[quote]%ink%[/quote]\r\n"
		style_txt+="[align=right][color=grey]见识来源: [url=%url%]%title%[/url][/color][/align]\r\n"

		/* 保守风格
		// 一种保守风格-用于不支持对齐代码的地方 
		var style_txt_classic = "[color=grey]沿途见识[/color][color=Grey](见识原始来源: [url=%url%][/url][/color])\r\n"
		style_txt_classic += "[quote]%ink%[/quote]"
		*/

		textout = randerink(style_txt, ink);

	}else{
		//处理标题加上标志 -- 这玩意是如此的简单
		title += "<sup> 沿途见识</sup>"
		ink = "<poem>\r\n" + ink.text + "\r\n</poem>"
		textout = "===" + ink.title + "<ref>" + ink.url + "</ref>===\r\n" +
			ink;
		textout += "\r\n";
	}
		return textout;
}

//渲染墨水-染色
function randerink(perink,ink){
	perink=perink.replace("%ink%",ink.text);
	perink=perink.replace("%title%",ink.title);
	perink=perink.replace("%url%",ink.url);
	return perink;
}