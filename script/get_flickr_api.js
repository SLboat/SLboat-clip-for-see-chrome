/* 当前计划 
 * 仅仅针对自己相册里的超过20张的tag图片处理
 */
/* 效验授权信息 */
//效验是否都是有效效验信息
//user_name暂且抛弃
function get_all_token() {
	//检查有效性
	if (flickr_api_key.api_key == "" || flickr_api_key.secret_key == "" || flickr_api_key.auth_token == "") {
		//有任何一个不存在，抛出异常
		return false;
	}
	return true; // 算作成功了
}

//传入搜索tag，传入页面信息，仅获取自己的
//todo:用户名未来也加进去给予考虑
//todo:api_key 尽快加入到考虑范围里，虽然这里也是作为app使用的。。。

function call_flickr_api_search(search_tag) {
	if (!get_all_token()) {
		//遗憾，啥都没得到
		// 放置变身图标
		chrome.extension.sendMessage({
			command: "ink_api_finish",
			have_ink: false,
			ink: ""
		});
		return false;
	}

	/* 基本常量 */
	var per_page = "500"; //一次返回最多数量

	/* 本次赋值 */
	var user_id = "me"; //用户名编号，用来减少搜索范围，但是锁定用户对象
	//var search_tag = "macbook"; //搜索标签内容
	var base_url = "http://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.photos.search"; //基础搭建
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&user_id=" + user_id; //用户ID，减少数量
	Requst_url += "&tags=" + search_tag; //搜索标签，将来要变成utf8的
	Requst_url += "&extras=url_c,url_z,owner_name,description&per_page=" + per_page + "&format=json&nojsoncallback=1"; //最后的一些玩意

	//加个签名信息试试
	Requst_url += "&auth_token=" + flickr_api_key.auth_token
	//看起来还需要公共密匙用来计算MD5
	Requst_url += "&api_sig=" + get_api_sig(flickr_api_key.secret_key, Requst_url); //算出来这该死的玩意

	Requst_url = base_url + Requst_url; //组合成呼叫url

	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			//获得完毕了
			//pics_json=JSON.parse(xhr.responseText);//临时调试用，一个全局变量

			get_json_pics(JSON.parse(xhr.responseText)); //传入到解析器里去
		}
	}
	xhr.send();
}

//获得签名信息
//主要有趣的是重新排序请求参数们
//来自 http://josephj.com/prototype/JosephJiang/Presentation/OpenAPI_Workshop/flickr-auth-api.html

function get_api_sig(sSecretKey, sParameter) {
	sParameter = sParameter.replace('?', ''); //去除问号，不再需要
	var aParameter = sParameter.split('&'); //切割一个个参数
	aParameter.sort(); //神奇的排序，按字母排序
	var sSignature = sSecretKey; //初始化为签名开始
	for (var i = 0, j = aParameter.length; i < j; i++) { //开始组合字符串
		var sName = aParameter[i].split('=')[0];
		var sValue = aParameter[i].split('=')[1];
		sSignature += sName + sValue;
	};
	return MD5(sSignature);
};

/* 获得JSON里面的图片玩意儿 */
/* 思考它的异步性
 * 整个过程可能会有少许耗时
 * 或许可以先提取一部分？不这太疯狂了，要处理如果再次点击了则抛弃
 * 先获得的是基本页面？在获得api页面？
 * 如果发出事件后给予处理全局已经中断下一次操作呢？这听起来不错，发送一个事件锁钩子
 * 标题标尾，来自页面都可以保留，除了可以加上句来自API访问
 * 同时导入了页面信息用来处理，一些小玩意
 */
function get_json_pics(pics_json) {

	imgcont = "" //单条图片内容
	txtcont = "" //初始化图片内容
	//初始化图片数量
	var pic_num = 0

	if (pics_json.stat != "ok") //判断是否api无效
	{
		if (is_debug_ink) console.log("返回的内容是失败的，原因：" + pics_json.message)
		return false;
	}
	if (pics_json.photos.total == 0) { //判断是否0张照片
		if (is_debug_ink) console.log("返回的内容没有一张图片呢")
		return false;
	}

	pic_num = pics_json.photos.total; //总共获得的图片，不用一张张去遍历数啦

	//开始提取照片
	for (var pics_check in pics_json.photos.photo) { //这遍历真是作用不大
		var pics = pics_json.photos.photo[pics_check];
		var img_link = pics.url_c; //自动生成的图片链接，这里就先考虑c
		var desc = "";
		if (typeof (url_link) == "undefined") {
			var img_link = pics.url_z; //没有大尺寸的时候，就用z好了
		}
		var url_link = "http://www.flickr.com/photos/" + pics.ownername.toLowerCase() + "/" + pics.id; //获得点击的连接，用户名和ID拼凑
		var alt_str = pics.title || "SLboat Seeing..."; //获得标签作为alt
		//提取备注信息
		if (typeof(pics.description) != "undefined")
		{
			desc=pics.description._content; //获得描述信息在这里
		}
		//遍历中的任何一项
		imgcont = render_per_link(img_link, url_link, alt_str, true, desc); //出来一条了
		txtcont = flickr_order_pics(txtcont,imgcont); //拼合-根据顺序
	}

	//处理开头和结尾
	var str_start = get_start_html("usedapi");
	var str_end = get_end_html(pic_num, "yes");

	var have_ink = false; //是否有墨水
	//如果得到了一些东西
	if (txtcont != "") {
		//拼合一切
		flickr_txt = render_final_text(str_start, txtcont, str_end);
		have_ink = true;
	}

	//返回一个调试信息
	if (is_debug_ink) console.log("这次得到了\n" + flickr_txt);

	//呼叫API弄到剪贴板里去，检查是否得到了东西
	chrome.extension.sendMessage({
		command: "ink_api_finish",
		have_ink: have_ink,
		ink: flickr_txt,
        pic_num: pic_num
	});

	//提取到此完毕
	return flickr_txt;

	//最终可以呼叫对方来告诉对方已经完成，但是必须注意时间不能太长了
}


/* 以下代码仅仅临时调试用 */