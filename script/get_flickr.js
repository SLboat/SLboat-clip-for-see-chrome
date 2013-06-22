/* 所有与HTML相关部分标记为：于目标HTML相关联代码 */
/* 基本变量配置 */
var is_debug_ink = false; //调试标志
var flickr_api_key = new Object; //api key

var flikcr_organize_tag = false; //是否是管理页面的api_tag模式

var ink_option = {
	ink_for: "slboat",
	flickr_order: "pos"
}; //墨水选项

/* 主函数们 */

//得到Flickr的连接

function get_flickr_link() { /* 自动获得，看起来很有需要 */
	//获得标题，仅仅留来给自己用用，似乎放到全局变量也不错
	var page_info = get_page_info();

	//初始化图片数量
	var pic_num = 0;
	//单条图片字串
	var imgcont = "";
	//取得图片字串
	var txtcont = "";
	//最终字串，初始化为空
	var flickr_txt = "";
	//不使用API默认
	var useapi = "no";
	var flickr_return = {
		txt: "",
		need_api: false,
		tag: "",
		pic_num: 0
	}; //返回的一个组件

	var tag = ""; //默认的标记获得物

	//获得标头
	var str_start = get_start_html();

	/* 处理各种玩意的标记 */
	/* 于目标HTML相关联代码 */
	var Ident_tag_page = ".pc_t .pc_img"; //标签页标记
	var Ident_tag_page_more_than_one = ".pages" //不止一页的标签页，有页面点击框
	var Ident_set_page = ".pc_s .pc_img"; //相册页标记 
	var Ident_groups_page = ".pc_n .pc_img"; //群组页标记
	var Ident_photostream_page = ".pc_ju .pc_img"; //照片流页标记-Photostream，新的相册看起来也在这里了，看起来旧时代离开了
	var Ident_single_page = "#liquid-photo-buffer"; //单页标记，会优先得到buffer缓冲，很奇怪
	//灯箱页的东西们
	var Ident_lightbox_div = ".position[style*='visibility: visible']";
	//单页的标题和描述
	var Ident_single_page_info = {
		title_div: "#title_div", //标题div
		desc_div: "#description_div", //描述div
		desc_div_inEDIT: "#description_div textarea", //在编辑模式下的描述DIV
		class_none: "insitu-hint", //没有文字的class，默认提醒标记
		text_none: "按一下這裡以增加" //没有文字的开头提醒字符，第一个算起
	}; /* 标记处理完毕 */

	catch_them = $(Ident_tag_page); //先试试是不是来到了标签页里
	if (catch_them.length == 0) { //标签页没戏
		catch_them = $(Ident_set_page); //尝试相册页
	} else {
		//来到了标签页里
		//试试是否超过了一页
		if ($(Ident_tag_page_more_than_one)
			.length > 0) {
			//超过了一页，不太好办，召唤API，同时这里让它继续去
			if (is_debug_ink) console.log("超过一页了！将使用API进行处理");
			useapi = "notmine"; //不管它，就是没用到api
			// 获得自己相册页面的tag
			tag = get_my_tag_name(page_info.txtTitle);
			if (tag.length > 0) {
				useapi = "notyet"; //还没准备好
				//赋值给未来的人
				flickr_return.need_api = true;
				flickr_return.tag = tag; //传回去似乎也没啥用
				//不管了呼叫API去
				call_flickr_api_search(tag, false);
			}
		} else {
			//依然使用API因为可以获得附注
			// 获得自己相册页面的tag
			tag = get_my_tag_name(page_info.txtTitle);
			if (tag.length > 0) {
				useapi = "notdesc"; //还没获得desc信息
				//赋值给未来的人
				flickr_return.need_api = true;
				flickr_return.tag = tag; //传回去似乎也没啥用
				//不管了呼叫API去，非组织模式
				call_flickr_api_search(tag, false);
			}
		}
	}

	//上面是检测相册页有没戏-都是批量检测
	if (catch_them.length == 0) {
		catch_them = $(Ident_groups_page); //疯狂点-尝试群组页
	}

	//排到照片流页了-递归检测
	if (catch_them.length == 0) { //如果相册页没戏
		catch_them = $(Ident_photostream_page); //疯狂点-尝试群组页
	}

	//看看是否抓到了一些可以捕获的玩意，之前所有抓到的都在这里被处理
	if (catch_them.length > 0) {
		catch_them.each(function() {
			var str_alt = $(this)
				.prop("alt") || null; //尝试获得替换文本
			//渲染得到单条的最终连接情况
			var imgcont = render_per_link($(this)
				.prop("src"), $(this)
				.parent()
				.prop("href"), str_alt, false); //单条
			txtcont = flickr_order_pics(txtcont, imgcont); //要处理后面那个
			//递加图片数量1
			pic_num++;
		})
	}
	var flag_light_box = false;
	//试试灯箱页面的运气
	if (catch_them.length == 0) {
		if (page_info.txtUrl.match("/photostream/lightbox/")) { //匹配了灯箱
			//至少标记是允许的
			flag_light_box = true;
			//赋予给一个家伙
			catch_them = $(Ident_lightbox_div); //搜索唯一可见者
			if (catch_them.length > 0) {
				//存在灯箱图片咯
				var img_src = $(catch_them)
					.find("img")
					.prop("src");
				var str_alt = $(catch_them)
					.find(".lightbox-meta-title a")
					.prop("title");
				var str_desc = "";
				//生成和返回
				imgcont = render_per_link(img_src, page_info.txtUrl, str_alt, false, str_desc);

				//最后渲染
				txtcont = flickr_order_pics(txtcont, imgcont); //要处理后面那个
				pic_num++; //递加图片数量1
			}
		}
	}


	if (!flag_light_box && catch_them.length == 0) { //如果还是啥也没有
		//不属于标签页、不属于相册页
		//尝试单页，灯箱页也会存在单页，这里单页做最后处理
		if ($(Ident_single_page)
			.length > 0) //有至少一个单页标签，一般也只有一个
		{
			var img_src = $(Ident_single_page)
				.prop("src");
			if (typeof(img_src) == "undefined" || img_src.length == 0) {
				return ""; //返回一些破玩意回去
			}
			var str_alt = null; //默认值
			/* 效验单页标题和特征 */
			//获得alt标题，太重复使用var了
			if (!$(Ident_single_page_info.title_div)
				.hasClass(Ident_single_page_info.class_none) && $(Ident_single_page_info.title_div)
				.text()
				.search(Ident_single_page_info.text_none) != 0) {
				//有标题文字
				str_alt = $(Ident_single_page_info.title_div)
					.text();
			}
			//获得描述信息
			var str_desc = ""; //空字串
			if (!$(Ident_single_page_info.desc_div)
				.hasClass(Ident_single_page_info.class_none) && $(Ident_single_page_info.class_none)
				.text()
				.search(Ident_single_page_info.text_none) != 0) {
				// 是否存在编辑模式下的文字框
				if ($(Ident_single_page_info.desc_div_inEDIT)
					.length > 0) //如果存在的话
				{
					str_desc = $.trim($(Ident_single_page_info.desc_div_inEDIT)
						.val()); // 编辑模式下-标题编辑模式下，特殊点
				} else {
					//有标题文字			
					str_desc = $.trim($(Ident_single_page_info.desc_div)
						.text());
				}
			}

			imgcont = render_per_link(img_src, page_info.txtUrl, str_alt, false, str_desc);

			//最后渲染
			txtcont = flickr_order_pics(txtcont, imgcont); //要处理后面那个
			pic_num++; //递加图片数量1
		}
	}

	//搭建屁股部分
	var str_end = get_end_html(pic_num, useapi);
	//传回得到了多少的数量玩意
	flickr_return.pic_num = pic_num;

	//如果得到了一些东西
	if (txtcont != "") {
		//拼合一切
		flickr_txt = render_final_text(str_start, txtcont, str_end)
	}

	//返回一个调试信息
	if (is_debug_ink) {
		console.log("这次得到了\n" + flickr_txt)
	}

	flickr_return.txt = flickr_txt; //赋给最终的那玩意
	return flickr_return; //返回的是一个类呢

	//交回给原来去处理
}

/* 处理事件钩子 */
//添加事件钩子，当服务端请求的时候响应
chrome.runtime.onMessage.addListener(function(request, sender,
sendResponse) {
	if (request.method == "getSelection") {
		//todo:处理是否为组织管理的页面。。。
		var titlestr = (document.title == "") ? "{{int:无标题见识}}" : document.title; //检测是否为空一起都在这里
		var copystr = window.getSelection()
			.toString(); //选中的玩意
		var get_type = {
			type: "ink"
		}; //获取的类型
		flickr_api_key = request.flickr_api_key; //放到全局去，API_Key
		ink_option = request.ink_option; //墨水类型

		//处理是否有复制文本
		if (copystr.length == 0) {
			//转为尝试获取flickr图片
			get_type.api = get_flickr_link(); // api都丢在这里了
			copystr = get_type.api.txt; // 赋值给基本文本，只是兼容一下啥子的
			//判断是否有获得
			if (copystr.length > 0) {
				get_type.type = "flickr"; //新的获取类型
			}
		}
		if (typeof(copystr) == "undefined") {

		}
		//遣送回去数据，保留选择文字？这是一个callback
		sendResponse({
			data: copystr,
			title: titlestr,
			url: window.location.href,
			//获取类型，分别一种特殊的情况
			copy_type: get_type, //多配置一些东西在里面
		});
	} else if (request.method == "get_flickr_organize_tag") {
		//获得选中内容
		var selctstr = window.getSelection()
			.toString();

		//处理原料工具
		flickr_api_key = request.flickr_api_key;
		ink_option = request.ink_option;

		//送去检测真实tag
		get_flickr_organize_tag(selctstr);
		//不传回去了，去它的
	} //else

});

/* 作为目标页面直接运行的注入式脚本 */
//加载入脚本，在中间脚本里不再需要，仅在特殊情况的注入下

function load_jquery_script() {
	//尝试载入新的JQuery，判断jQuery，总是能够工作的更好
	if (typeof(jQuery) == "undefined") {
		//注入jQuery脚本
		var script = document.createElement("script");
		script.type = "text/javascript";
		//todo:移到本地去
		script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
		script.onload = get_flickr_link;
		document.body.appendChild(script);
	} else
	//直接开始工作
	get_flickr_link();
}

/* 小函数们 */
//森亮号大船的标记头玩意

function get_start_html(page_info) {
	var need_div = false; //关闭需要div标签
	//提取页面信息，是的就在页面里
	page_info = page_info || get_page_info(); //默认是当前页

	//最初标头
	var str_start = "<!-- 来自：[" + page_info.txtTitle + "] -->\r\n";
	//一个链接记录下来，缩进看起来是破坏了大空格
	str_start += ":<!-- 来自链接：[" + page_info.txtUrl + "]) -->\r\n";
	if (need_div) //如果需要div
	{
		str_start += "<div id=\"slboat_flickr_pics\">"; //默认关闭div
	}
	str_start += "\r\n"; //换行多一个

	return str_start
}

//森亮号大船的标记尾玩意
//传入pic_num捕获张数，useapi，是否使用了api

function get_end_html(pic_num, useapi) {
	var need_div = false; //关闭需要div标签
	pic_num = pic_num || "0";
	useapi = useapi || "no"; //初始值假

	//搭建屁股部分
	if (need_div) {
		var str_end = "\r\n</div>"; //多加div，需要的话
	}
	var str_end = "\r\n"; //多加个换行
	if (useapi == "yes") //使用了API，这是最后的大石头啊，最初只考虑森亮号的相册
	{
		str_end += "<!-- 以上使用API共计捕获" + pic_num + "张图片 -->\r\n"
		str_end += "<!-- 已获得API协助捕获所有图片 -->\r\n"
	} else if (useapi == "notyet") {
		str_end += "<!-- 以上仅捕获" + pic_num + "张图片 -->\r\n"
		str_end += "<!-- 尝试用API捕获更多失败 -->\r\n"
	} else if (useapi == "notmine") {
		str_end += "<!-- 以上只捕获" + pic_num + "张图片 -->\r\n"
		str_end += "<!-- 非自己相册而不使用API捕获 -->\r\n"
	} else if (useapi == "notdesc") {
		//还没有获得描述信息
		str_end += "<!-- 以上共计捕获" + pic_num + "张图片 -->\r\n"
		str_end += "<!-- 尚未使用API获得备注信息 -->\r\n"
	} else str_end += "<!-- 以上共计捕获" + pic_num + "张图片 -->\r\n"; //只跟了一句哦

	//最后的结尾
	str_end += "<!-- 来自Flickr相册告一段落 -->\r\n"
	return str_end
}

//排序图片队列

function flickr_order_pics(txtcont, txtnow) {
	//获得顺序
	if (get_flickr_order_pos())
	//正序
	return txtcont + txtnow;
	else
	//逆序
	return txtnow + txtcont;
}

/* 获得页面信息 */

function get_page_info() {
	var page_info = {
		txtTitle: document.title, //获取标题
		txtUrl: window.location.href //获得URL
	}
	//返回页面信息
	return page_info;
}

//获得标签页的标签名称，仅仅获得自己的标签
//如果获得别人的需要它的用户ID，暂时不去考虑

function get_my_tag_name(title) {

	/* 于目标HTML相关联代码 */
	var tag_title_patern_cn = /你的標籤為 (.+) 的材料/;
	var tag_title_patern_en = /Your stuff tagged with (.+)/;

	var get_tag_by = title.match(tag_title_patern_cn); //匹配中文尝试
	if (get_tag_by == null) var get_tag_by = title.match(tag_title_patern_en); //匹配英文尝试

	if (get_tag_by == null) //全部失败，走人
	return ""
	return get_tag_by[1]; //返回第一个字节

}

//替换最终的图片URL，为需要的尺寸
//导入原始链接用以判断用户名

function mov_flickr_url(org_url, org_link) {
	//替换中图，替换小图
	//todo：可选的获得最终图片尺寸样式
	var return_url = "";
	var replace_url_letter = /_[sqtmnzcbo]\./; //正则匹配宏，匹配后缀字母
	if (isAlex() || org_link.search("/slboat/") == -1) {
		//alex不需要太大的图片，如果不是slboat自己的相册也一样处理，考虑到早期的情况
		return_url = org_url.replace(/_[sqtmnzcbo]\./, "_z.");
	} else {
		//森亮号大船用800大图-考虑到多半是自己的
		return_url = org_url.replace(replace_url_letter, "_c.");
	}
	return return_url; //最终返回咯
}

//渲染得到单条的图片的连接
//传入图片地址，和点击链接，以及替换文字（都会搞到有的）

function render_per_link(urlimg, urllink, str_alt, no_url_work, desc) {
	var txt_out = ""; //输出的临时变量
	var null_str_alt = "SLboat Seeing..."; //null的替换标题文字

	if (!no_url_work) //如果指定不处理，那就不处理了，转录图片大小
	{
		urlimg = mov_flickr_url(urlimg, urllink); //通用的处理图片
	}
	if (isAlex()) { /* alex论坛风格 */
		txt_out += "[img]" + urlimg + "[/img]" + "\r\n";
	} else { /* 森亮号航海见识风格 */
		//处理描述信息
		var descstr = ""; //临时标记
		var flickr_id = null; //默认是null，这是id
		//可选备注
		if (typeof(desc) != "undefined" && desc != "") //有备注
		{
			descstr = ' desc=\"' + desc + '\" ';
		}
		//这是匹配模式工厂
		var patern_url_id = /.+\/(.+?)_.+_.+\./; //匹配的URL ID

		//提取ID - 假设它为必须存在
		if (urlimg.match(patern_url_id)) //是否有效匹配
		{
			flickr_id = urlimg.match(patern_url_id)[1]; //获取初步匹配值
		}

		//----后面部分-----
		//检查是否没有标题信息
		if (str_alt == null) {
			str_alt = null_str_alt; //默认的标题信息
		} else { //有标题信息那就再写入一些
			var match_alt_patern = /(.+)\..+/; //匹配文件切割的规则
			var alt_name = " " + str_alt + ""; //默认的标题信息-原始
			//切割掉后缀-存在的话
			if (str_alt.match(match_alt_patern)) //如果存在[.]
			{
				alt_name = " " + str_alt.match(match_alt_patern)[1] + " "; //匹配第一个
				alt_name += "(全名:" + " " + str_alt + " " + ")"; //最终拼合，需要很多空格
			}
			//注释加上些标记，alt信息咯，切分后缀？
			txt_out += "<!-- 来自图片文件:" + alt_name + " 的Flickr标记-->"; //去掉分号，确保空格，检索的关键-这是英文
		}
		//todo: 是否前面传入个ID玩意，为了好看呢<flickr id="">，修理被引用问题，还是去空格的好
		txt_out += '<flickr alt=\"' + str_alt + '\" id=\"' + flickr_id + '\" link=\"' + urllink + '\" img=\"' + urlimg + '\"' + descstr + '>'; //标记所有的一切
		//看看是否增加ID
		if (flickr_id != null) //检测是否有ID，最好必须有个这样的玩意
		{
			txt_out += flickr_id
		}
		//标签合并
		txt_out += " </flickr>\r\n";

	}
	return txt_out; //输出本次临时的
}

//渲染最终生成图片
//传入开头部分，中间部分，结尾部分

function render_final_text(txtstart, txtcont, txtend) {
	if (isAlex()) {
		return txtcont; //输出本次临时的
	}
	// 如果前面多换行，必须处理中间内容，否则那么最后会有大换行
	return "\r\n" + txtstart + txtcont + txtend; //最终返回拼合
}

//返回是否设置为BBCODE

function isAlex() {
	return ink_option.ink_for == "alex";
}

//获得排序选项，这些真该直接丢在object里，是否是正序的

function get_flickr_order_pos() {
	return ink_option.flickr_order == "pos";
} /* 额外的测试执行 */

/*
is_debug_ink=true;  // 开启调试信息
get_flickr_link(); // 开始一次捕获
*/
