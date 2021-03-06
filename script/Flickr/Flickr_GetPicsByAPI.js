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

/* 我想要一份API信息，提交申请 */
//TODO:防止重复申请？

function i_request_for_API(callback) {
	chrome.extension.sendMessage({
		command: "flickr_key_request"
	}, function(request) {
		flickr_api_key = request.api_token; //赋予全局的API
		ink_option = request.ink_option; //墨水选项
		//释放回调回去
		if (typeof(callback) == "function") {
			callback();
		}
	});
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

//获得签名信息-解包UTF8
//主要有趣的是重新排序请求参数们
//来自 http://josephj.com/prototype/JosephJiang/Presentation/OpenAPI_Workshop/flickr-auth-api.html

function get_api_sig_unpackUTF(sSecretKey, sParameter) {
	sParameter = sParameter.replace('?', ''); //去除问号，不再需要
	var aParameter = sParameter.split('&'); //切割一个个参数
	aParameter.sort(); //神奇的排序，按字母排序
	var sSignature = sSecretKey; //初始化为签名开始
	for (var i = 0, j = aParameter.length; i < j; i++) { //开始组合字符串
		var sName = aParameter[i].split('=')[0];
		var sValue = aParameter[i].split('=')[1];
		sValue = decodeURIComponent(sValue); // 防止出现UTF8的麻烦
		sSignature += sName + sValue;
	};
	return MD5(sSignature);
};

/* 将参数部分都加成UTF8来传出 - 看起来还不工作
 * 意即每一部分值进行utf8编码
 * 对于传送中文这很有用
 */

function make_to_utf8(sParameter) {
	var aParameter = sParameter.split('&'); //切割一个个参数
	//aParameter.sort(); //神奇的排序,按字母排序,需要排序?
	for (var i = 0, j = aParameter.length; i < j; i++) { //开始组合字符串
		var varameter = aParameter[i].split('='); //切分
		varameter[1] = encodeURIComponent(varameter[1]); //制造成utf8
		aParameter[i] = varameter.join("="); //重组
	};
	return aParameter.join("&"); //组合回来
};

//传入搜索tag，传入页面信息，仅获取自己的
//todo:用户名未来也加进去给予考虑
//todo:api_key 尽快加入到考虑范围里，虽然这里也是作为app使用的。。。

function call_flickr_api_search(search_tag, is_inOrganize) {

	is_inOrganize = is_inOrganize || false; //默认为否

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
	var base_url = "https://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.photos.search"; //基础搭建
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&user_id=" + user_id; //用户ID，减少数量
	Requst_url += "&tags=" + search_tag; //搜索标签，将来要变成utf8的

	//强制逆序...这里或许可以取代后面的转录逆序,
	/* 一种后逆序的处理或许是 → 不够好,使用日期更好!
	 * date.photos.photo.sort(function(a,b){return a.title > b.title ? -1 : 1;})
	 */
	if (ink_option.flickr_order != "hand") { //如果不是手动的话
		if (!get_flickr_order_pos()) { //正序,从小到大
			Requst_url += "&sort=" + "date-taken-desc"; //根据拍摄时间逆序,不确定这会带来什么后果
		} else { //逆序,与显示相反...显示新的在前面
			Requst_url += "&sort=" + "date-taken-asc"; //根据拍摄时间逆序,不确定这会带来什么后果
		}
	}

	// 在这里owner_name是拥有者名称,是一个昵称的名称,不符合作为url的搭建者.
	Requst_url += "&extras=url_c,url_z,path_alias,description,date_taken&per_page=" + per_page + "&format=json&nojsoncallback=1"; //最后的一些玩意

	//加个签名信息试试
	Requst_url += "&auth_token=" + flickr_api_key.auth_token
	//看起来还需要公共密匙用来计算MD5
	Requst_url += "&api_sig=" + get_api_sig_unpackUTF(flickr_api_key.secret_key, Requst_url); //算出来这该死的玩意

	Requst_url = base_url + Requst_url; //组合成呼叫url

	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			//获得完毕了
			var res = JSON.parse(xhr.responseText);
			get_json_pics(res, search_tag, is_inOrganize); //传入到解析器里去
		}
	}
	xhr.send();
}


/* 获得JSON里面的图片玩意儿 */
/* 思考它的异步性
 * 整个过程可能会有少许耗时
 * 或许可以先提取一部分？不这太疯狂了，要处理如果再次点击了则抛弃
 * 先获得的是基本页面？在获得api页面？
 * 如果发出事件后给予处理全局已经中断下一次操作呢？这听起来不错，发送一个事件锁钩子
 * 标题标尾，来自页面都可以保留，除了可以加上句来自API访问
 * 同时导入了页面信息用来处理，一些小玩意
 */

function get_json_pics(pics_json, search_tag, is_inOrganize) {

	imgcont = ""; //单条图片内容
	txtcont = ""; //初始化图片内容
	pic_path_alias = ""; //图片地址的昵称部分

	var page_info = null; //默认是空的玩意

	//初始化图片数量
	var pic_num = 0;

	if (pics_json.stat != "ok") //判断是否api无效
	{
		if (is_debug_ink) console.log("返回的内容是失败的，原因：" + pics_json.message)
		return false;
	}

	if (pics_json.photos.total == null || pics_json.photos.total == 0) { //判断是否0张照片
		if (is_debug_ink) console.log("返回的内容没有一张图片呢")
		return false;
	}

	pic_num = pics_json.photos.total; //总共获得的图片，不用一张张去遍历数啦

	if (ink_option.flickr_order == "hand") { //必须自主模式
		// 进行强制排序..2014-8-12
		pics_json.photos.photo.sort(function(p1, p2) {
			return new Date(p1.datetaken).getTime() - new Date(p2.datetaken).getTime();
		});
	}

	//开始提取照片
	for (var pics_check in pics_json.photos.photo) { //这遍历真是作用不大
		var pics = pics_json.photos.photo[pics_check];
		var img_link = pics.url_c || pics.url_z; //自动生成的图片链接，这里就先考虑c
		var desc = "";
		//只获取最后一次管它呢
		pic_path_alias = pics.pathalias;
		var url_link = "http://www.flickr.com/photos/" + pic_path_alias + "/" + pics.id; //获得点击的连接，用户名和ID拼凑
		var alt_str = pics.title || null; //获得标签作为alt
		//提取备注信息
		if (typeof(pics.description) != "undefined") {
			desc = pics.description._content; //获得描述信息在这里
		}
		//遍历中的任何一项
		imgcont = render_per_link(img_link, url_link, alt_str, true, desc); //出来一条了
		//txtcont = flickr_order_pics(txtcont, imgcont); //拼合-根据顺序
		txtcont += imgcont; //在这里顺序已经交给api去做了
	}
	//管理页面后续
	if (is_inOrganize) {
		page_info = {
			txtTitle: "管理页获取的标签：" + search_tag, //获取标题
			txtUrl: "http://www.flickr.com/photos/" + pics.pathalias + "/tags/" + search_tag //获得URL
		}
		//如果是管理页面，告诉完成事情
		ink_organize_api_done(search_tag);
	}
	//处理开头和结尾
	var str_start = get_start_html(page_info);
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
/* 写入公开状态 
 * 需要id
 * 回调函数负责回调返回内容: callback(res){}
 * 哇喔，这里不就像进行了一个封装嘛
 */

function call_flickr_api_setpublic(photo_id, callback) {

	if (photo_id == "") return false; //如果没有一点有用的东西，那则全部抛弃

	/* 基础地址 */
	var base_url = "https://api.flickr.com/services/rest/"; //TODO:移入公共的里面去

	var Requst_url = "?method=" + "flickr.photos.setPerms"; //基础搭建，需要的方法
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&format=json&nojsoncallback=1"; //最后的一些玩意

	/* 基本的密匙等信息 */
	Requst_url += "&auth_token=" + flickr_api_key.auth_token

	/* 组合最后的请求数据 */
	//TODO:或许一个wrap玩意？wrap("id","sss"),像是php那个的
	Requst_url += "&photo_id=" + photo_id; //图片ID

	Requst_url += "&is_public=" + 1;
	Requst_url += "&is_friend=" + 0;
	Requst_url += "&is_family=" + 0;
	/* 别的权限 */
	Requst_url += "&perm_comment=" + 3;
	Requst_url += "&perm_addmeta=" + 2;

	//最后的签名
	Requst_url += "&api_sig=" + get_api_sig(flickr_api_key.secret_key, Requst_url);
	Requst_url = base_url + Requst_url;

	/* 开始送入数据 */
	var xhr = new XMLHttpRequest();
	xhr.open("POST", Requst_url, true);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var res = JSON.parse(xhr.responseText); //返回的json玩意
			if (typeof(callback) == "function") { //如果有效函数传入
				callback(res);
			} else {
				//console.log("放回来了", res)
				if (res.stat != "ok") {
					alert("船长，写入它的权限公开失败了，没有回调所以我来报告咯，返回的是：" + res.id + ":" + res.message); //一个该死的错误
					//IDEA:或许该保存到剪贴板？
				}
			}
		}
	}
	xhr.send();
}

/* 写入单个图片的描述信息 
 * 需要id，需要标题title，需要描述desc
 * 回调函数负责回调返回内容: callback(res){}
 * 哇喔，这里不就像进行了一个封装嘛
 */

function call_flickr_api_setmete(photo_id, title, description, callback) {

	if (photo_id == "" || description == "") return false; //如果没有一点有用的东西，那则全部抛弃

	/* 基础地址 */
	var base_url = "https://api.flickr.com/services/rest/"; //TODO:移入公共的里面去

	var Requst_url = "?method=flickr.photos.setMeta"; //基础搭建，需要的方法
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&format=json&nojsoncallback=1"; //最后的一些玩意

	/* 基本的密匙等信息 */
	Requst_url += "&auth_token=" + flickr_api_key.auth_token

	/* 组合最后的请求数据 */
	//TODO:效验数据是否有效
	Requst_url += "&description=" + encodeURIComponent(description);
	Requst_url += "&title=" + encodeURIComponent(title);
	Requst_url += "&photo_id=" + photo_id;

	//最后的签名
	Requst_url += "&api_sig=" + get_api_sig_unpackUTF(flickr_api_key.secret_key, Requst_url);

	//Requst_url = make_to_utf8(Requst_url); //将值编码为utf8

	Requst_url = base_url + Requst_url;

	/* 开始送入数据 */
	var xhr = new XMLHttpRequest();

	xhr.open("POST", Requst_url, true);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var res = JSON.parse(xhr.responseText); //返回的json玩意
			if (typeof(callback) == "function") { //如果有效函数传入
				callback(res);
			} else {
				//console.log("放回来了", res)
				if (res.stat != "ok") {
					alert("船长，写入它的描述失败了，没有回调所以我来报告咯，返回的是：" + res.id + ":" + res.message); //一个该死的错误
					//IDEA:或许该保存到剪贴板？
				}
			}
		}
	}
	xhr.send();
}

/* 获得图片的详细信息
 * 返回的是 Take_Back(res){}
 * 一些有趣的个例是[res.photo.description._content]是描述信息
 */

function call_flickr_api_getinfo(photo_id, Take_Back) {

	if (photo_id == "") return false; //如果没有一点有用的东西，那则全部抛弃

	if (typeof(Take_Back) != "function") {
		console.log("船长，这家伙没有效的回调函数，而不是这个:", Take_Back);
		return false; //返回
	}
	/* 基础地址 */
	var base_url = "https://api.flickr.com/services/rest/"; //TODO:移入公共的里面去

	var Requst_url = "?method=flickr.photos.getInfo"; //基础搭建，需要的方法
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&format=json&nojsoncallback=1"; //最后的一些玩意

	/* 基本的密匙等信息 */
	Requst_url += "&auth_token=" + flickr_api_key.auth_token

	/* 组合最后的请求数据 */
	Requst_url += "&photo_id=" + photo_id;

	//最后的签名
	Requst_url += "&api_sig=" + get_api_sig(flickr_api_key.secret_key, Requst_url);
	Requst_url = base_url + Requst_url;

	/* 开始送入数据 */
	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var res = JSON.parse(xhr.responseText); //返回的json玩意
			Take_Back(res); //抛回回调里咯
			if (is_debug_ink) console.log("返回来了:", res); //调试描述
		}
	}
	xhr.send();
}
/* 封装后的一些高级些的函数 */

/* 简单的返回描述信息 
 * Take_Desc(desc_str,res){}
 * 有效的话是字符串，无效的话是""(不要null好了)
 */
//TODO:或许待移除

function call_flickr_api_for_desc(photo_id, Take_Desc) {
	if (typeof(Take_Desc) != "function") {
		console.log("船长，这家伙没有效的回调函数，而不是这个:", Take_Desc);
		return false; //返回
	}
	//开门见山的呼叫
	return call_flickr_api_getinfo(photo_id, function(res) {
		if (res.stat == "ok") {
			Take_Desc(res.photo.description._content, res); //当然了这里不需要return嘛
		} else {
			Take_Desc(null); //意外来了
		}

	})

}

/* 搜索特定隐私属性的的图片 
 * 传入最大要求数量
 * 返回 callback(res)
 * res结构, res.stat:状态,res.photos:图片序列
 */
//TODO: 再拉回来标签?
//TODO: 每页200,传入页面?

function call_flickr_api_getnewphoto(max_pics, callback) {
	var max_pics = max_pics || 400; //一次返回最多数量

	if (!get_all_token()) {
		//api失败退出
		return false;
	}

	/* 基本常量 */
	var per_page = max_pics; //一次返回最多数量 - 互相传值一下

	/* 本次赋值 */
	var user_id = "me"; //用户名编号，用来减少搜索范围，但是锁定用户对象

	var base_url = "https://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.photos.search"; //基础搭建
	Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
	Requst_url += "&user_id=" + user_id; //用户ID，减少数量
	Requst_url += "&extras=description&per_page=" + per_page + "&format=json&nojsoncallback=1"; //最后的一些玩意

	//加个签名信息试试
	Requst_url += "&auth_token=" + flickr_api_key.auth_token
	//看起来还需要公共密匙用来计算MD5
	Requst_url += "&api_sig=" + get_api_sig(flickr_api_key.secret_key, Requst_url); //算出来这该死的玩意

	Requst_url = base_url + Requst_url; //组合成呼叫url

	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			//获得完毕了
			var res = JSON.parse(xhr.responseText);
			callback(res); //传入到解析器里去
		}
	}
	xhr.send();
}

/* 以下代码仅仅临时调试用 */