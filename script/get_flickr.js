//替换最终的图片URL
function mov_flickr_url(org_url){
	//替换中图，替换小图
	//todo：可选的获得最终图片尺寸样式
	var return_url;
	return_url=org_url.replace("_t","_c");
	return_url=return_url.replace("_s","_c");
	return return_url;
}

//加载入脚本
function load_jquery_script(){
	//尝试载入新的JQuery，判断jQuery，总是能够工作的更好
	if (typeof(jQuery)=="undefined")
	{
		//注入jQuery脚本
		var script = document.createElement("script")
		script.type = "text/javascript"
		//todo:移到本地去
		script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
		script.onload = get_flickr_link
		document.body.appendChild(script)
	}else
		//直接开始工作
		get_flickr_link();	
}

//初次载入完毕的回调
function first_load_callback(){
	console.log("jQuery"+$.fn.jquery +"已经载入完毕！准备就绪!");
	//也许可以展示个等待啥子的
	get_flickr_link();
}

//得到Flickr的连接
function get_flickr_link(){
	/* 自动获得，看起来不再需要 */
	//获得标题
	var txtTitle = document.title
	//获得URL
	var txtUrl = window.location.href

	//初始化图片数量
	var pic_num=0
	//取得图片字串
	var txtCont=""
	//最终字串，初始化为空
	var flickr_txt=""


	//最初标头
	var str_start="<!-- 来自Flickr相册：[" + txtTitle + "] -->\r\n"
	//一个链接记录下来
	str_start+="<!-- 来自链接：["+txtUrl+ "]) -->\r\n"
	str_start+="<div id=\"slboat_flickr_pics\">\r\n"

	/* 处理标签页，处理相册页 */
	//todo:取得单页图片

	//标签页标记
	var Ident_tag_page=".pc_t .pc_img"
	//相册页标记
	var Ident_set_page=".pc_s .pc_img"

	if ($(Ident_set_page).length==0){
		catch_them=$(Ident_tag_page);
	}else
		catch_them=$(Ident_set_page);

	//看看是否抓到了一些可以捕获的玩意
	if (catch_them.length>0){
		catch_them.each(function(){ 
			//当前的图片地址链接
			//带上缩进处理
			txtCont+=": "+mov_flickr_url($(this).prop("src"));
			//处理第一个中括号，已经赋给第一个空格
			txtCont+=" "+"["
			//赋予链接目标
			txtCont+=$(this).parent().prop("href");
			//赋予结尾封锁中括号
			txtCont+=" Link]\r\n";
			//递加图片数量1
			pic_num+=1;
		})
	}

	//搭建屁股部分
	str_end="</div>\r\n"
	str_end+="<!-- 以上共计捕获"+pic_num+"张图片 -->\r\n"
	str_end+="<!-- 来自Flickr的相册告一段落 -->\r\n"

	//如果得到了一些东西
	if (txtCont != "")
	{
		//拼合一切
		flickr_txt=str_start+txtCont+str_end
	}

	console.log("这次得到了\n"+flickr_txt)

	return flickr_txt;

	//todo:处理剪贴板事宜，图标变动等
}


/* 开始测试执行 */
//调入咯
load_jquery_script()
//console.log("这次得到了\n"+get_flickr_link())
