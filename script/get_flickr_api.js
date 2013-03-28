/* 当前计划 
* 仅仅针对森亮号相册里的超过20张的tag图片处理
*/

/* 授权需要 - 一般信息 */
var api_key=""; //api密匙，用来获得访问请求
/* 授权需要 - 特别授权 */
var secret_key="";
var auth_token=""; //自己去获得token，保存到本地

//获取本地的所有存储信息
function get_all_token(){

}

//传入搜索tag，传入页面信息，仅获取自己的
//todo:用户名未来也加进去给予考虑
//todo:api_key 尽快加入到考虑范围里，虽然这里也是作为app使用的。。。
function call_flickr_api_search(search_tag){	
	/* 基本常量 */
	var per_page = "500"; //一次返回最多数量

	/* 本次赋值 */
	var user_id = "me"; //用户名编号，用来减少搜索范围
	//var search_tag = "macbook"; //搜索标签内容
	var base_url="http://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.photos.search" ;//基础搭建
	Requst_url+="&api_key="+api_key; //这样拼看起来好看点
	Requst_url+="&user_id="+user_id; //用户ID，减少数量
	Requst_url+="&tags="+search_tag; //搜索标签，将来要变成utf8的
	Requst_url+="&extras=url_c,owner_name&per_page="+per_page + "&format=json&nojsoncallback=1"; //最后的一些玩意

	//加个签名信息试试
	Requst_url+= "&auth_token="+auth_token
	//看起来还需要公共密匙用来计算MD5
	Requst_url+="&api_sig="+get_api_sig(secret_key,Requst_url); //算出来这该死的玩意

	Requst_url=base_url+Requst_url; //组合成呼叫url

	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		//获得完毕了
		pics_json=JSON.parse(xhr.responseText);//临时调试用，一个全局变量

		get_json_pics(JSON.parse(xhr.responseText)); //传入到解析器里去
	  }
	}
	xhr.send();
}

//获得签名信息
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
function get_json_pics(pics_json){


   txtCont = "" //清空内容
   //初始化图片数量
   var pic_num = 0

	if (pics_json.stat != "ok") //判断是否api无效
	{
		if (is_debug_ink) console.log ("返回的内容是失败的，原因："+pics_json.message)
		return false;
	}
	if(pics_json.photos.total==0){ //判断是否0张照片
		if (is_debug_ink) console.log ("返回的内容没有一张图片呢")
		return false;
	}

	pic_num=pics_json.photos.total; //总共获得的图片，不用一张张去遍历数啦

	//开始提取照片
	for (var pics_num in pics_json.photos.photo) { //这遍历真是作用不大
		var pics=pics_json.photos.photo[pics_num];
		var img_link=pics.url_c; //自动生成的图片链接，这里就先考虑c
		var url_link= "http://www.flickr.com/photos/"+pics.ownername.toLowerCase()+"/"+pics.id; //获得点击的连接，用户名和ID拼凑
		var alt_str=pics.title || "SLboat Seeing..."; //获得标签作为alt
		//遍历中的任何一项
		txtCont += render_per_link(img_link, url_link, alt_str);
	}

	//处理开头和结尾
    var str_start = get_start_html("usedapi");
    var str_end = get_end_html (pic_num,"yes");

   //如果得到了一些东西
   if (txtCont != "") {
      //拼合一切
      flickr_txt = render_final_text(str_start, txtCont, str_end)
   }

	//返回一个调试信息
	if (is_debug_ink)console.log("这次得到了\n" + flickr_txt);

	//提取到此完毕
	return flickr_txt;


	//最终可以呼叫对方来告诉对方已经完成，但是必须注意时间不能太长了
}




/* 以下代码仅仅临时调试用 */







var is_debug_ink = false; //调试标志

var ink_for = "alex"; //墨水类型，默认森亮号大船

/* 主函数们 */

//得到Flickr的连接
function get_flickr_link() {
   /* 自动获得，看起来很有需要 */
   //获得标题，仅仅留来给自己用用，似乎放到全局变量也不错
   var page_info = {
      txtTitle: document.title,
      //获得URL
      txtUrl: window.location.href
   }

   //初始化图片数量
   var pic_num = 0;
   //取得图片字串
   var txtCont = "";
   //最终字串，初始化为空
   var flickr_txt = "";
	var useapi = "no"; //默认不使用api 

   //获得标头
   var str_start = get_start_html();

   /* 处理各种玩意的标记 */
   //标签页标记
   var Ident_tag_page = ".pc_t .pc_img"
   //不止一页的标签页，有页面点击框
   var Ident_tag_page_more_than_one = ".pages"
   //相册页标记
   var Ident_set_page = ".pc_s .pc_img"
   //群组页标记
   var Ident_groups_page = ".pc_n .pc_img"
   //照片流页标记-Photostream
   var Ident_photostream_page = ".pc_m .pc_img"
   //单页标记
   var Ident_single_page = "#liquid-photo"
	/* 标记处理完毕 */

   catch_them = $(Ident_tag_page); //先试试是不是来到了标签页里
   if (catch_them.length == 0) { //标签页没戏
      catch_them = $(Ident_set_page); //尝试相册页
   } else {
      //来到了标签页里
      //试试是否超过了一页
      if ($(Ident_tag_page_more_than_one).length > 0) {
		  //todo：判断是否为森亮号的tag页面，给所有页面加以判断？

         //超过了一页，不太好办，召唤API，同时这里让它继续去
         console.log("超过一页了！等着处理");
         //修正为不足的标头
         useapi="notyet"

      }
   }

	//上面是检测相册页有没戏
  if (catch_them.length == 0) { 
	 catch_them = $(Ident_groups_page); //疯狂点-尝试群组页
  }

	//排到照片流页了
  if (catch_them.length == 0) { //如果相册页没戏
	 catch_them = $(Ident_photostream_page); //疯狂点-尝试群组页
  }

   //看看是否抓到了一些可以捕获的玩意
   if (catch_them.length > 0) {
      catch_them.each(function () {
         var str_alt = $(this).prop("alt") || "Slboat Seeing..."; //尝试获得替换文本
         //渲染得到单条的最终连接情况
         txtCont += render_per_link($(this).prop("src"), $(this).parent().prop(
            "href"), str_alt);
         //递加图片数量1
         pic_num++;
      })
   } else {
      //不属于标签页、不属于相册页
     //尝试单页
      if ($(Ident_single_page).length > 0)		//有至少一个单页标签，一般也只有一个
      {
         var str_alt = $(Ident_single_page).prop("alt") || "Slboat Seeing..."; //尝试获得替换文本
         txtCont += render_per_link($(Ident_single_page).prop("src"), page_info
            .txtUrl,
            str_alt);
         pic_num++;          //递加图片数量1
      }
   }

   //搭建屁股部分
   var str_end = get_end_html(pic_num,useapi);

   //如果得到了一些东西
   if (txtCont != "") {
      //拼合一切
      flickr_txt = render_final_text(str_start, txtCont, str_end)
   }

   //返回一个调试信息
   if (is_debug_ink) {
      console.log("这次得到了\n" + flickr_txt)
   }

   return flickr_txt;

   //交回给原来去处理
}

/* 作为目标页面直接运行的注入式脚本 */
//加载入脚本，在中间脚本里不再需要，仅在特殊情况的注入下
function load_jquery_script() {
   //尝试载入新的JQuery，判断jQuery，总是能够工作的更好
   if (typeof (jQuery) == "undefined") {
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
function get_start_html() {

   //提取页面信息，是的就在页面里
   //todo:置换为全局变量
   var page_info = {
      txtTitle: document.title,
      //获得URL
      txtUrl: window.location.href
   }

   //最初标头
   var str_start = "<!-- 来自Flickr相册：[" + page_info.txtTitle + "] -->\r\n"
   //一个链接记录下来
   str_start += "<!-- 来自链接：[" + page_info.txtUrl + "]) -->\r\n"
   str_start += "<div id=\"slboat_flickr_pics\">\r\n"

   return str_start
}

//森亮号大船的标记尾玩意
//传入pic_num捕获张数，useapi，是否使用了api
function get_end_html(pic_num,useapi) {
   pic_num = pic_num || 0;
	useapi = useapi || "no"; //初始值假

   pic_num = pic_num || 0;
   //搭建屁股部分
   var str_end = "</div>\r\n"
      if (useapi == "yes") //使用了API，这是最后的大石头啊，最初只考虑森亮号的相册
   {
      str_end += "<!-- 以上使用API共计捕获" + pic_num + "张图片 -->\r\n"
      str_end += "<!-- 以上获得了API的协助获取所有的图片 -->\r\n"
   } else if (useapi == "notyet") {
      str_end += "<!-- 以上仅捕获" + pic_num + "张图片 -->\r\n"
      str_end += "<!-- 因为以上图片使用API捕获更多失败 -->\r\n"
   }else
      str_end += "<!-- 以上共计捕获" + pic_num + "张图片 -->\r\n"

   str_end += "<!-- 来自Flickr相册告一段落 -->\r\n"
   return str_end
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

function render_per_link(urlimg, urllink, str_alt) {
   var txt_out = ""; //输出的临时变量
   urlimg = mov_flickr_url(urlimg, urllink); //通用的处理图片
   if (isAlex()) {
      //alex论坛风格
      txt_out += "[img]" + urlimg + "[/img]" + "\r\n";
   } else {
      //森亮号航海见识风格
      txt_out += ": <img src=\"" + urlimg + "\" alt=\"" + str_alt + "\" />"; //带上缩进处理，赋值于完整图片
      txt_out += " " + "["; //处理第一个中括号，已经赋给第一个空格
      txt_out += urllink; //赋予链接目标
      txt_out += " Link]\r\n"; //赋予结尾封锁中括号
   }
   return txt_out; //输出本次临时的
}

//渲染最终生成图片
//传入开头部分，中间部分，结尾部分

function render_final_text(txtstart, txtcont, txtend) {
   if (isAlex()) {
      return txtcont; //输出本次临时的
   }
   return txtstart + txtcont + txtend; //输出本次临时的
}

//返回是否设置为BBCODE

function isAlex() {
   return ink_for == "alex";
}

/* 额外的测试执行 */

/*
is_debug_ink=true;  // 开启调试信息
get_flickr_link(); // 开始一次捕获
*/