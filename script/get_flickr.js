var debug_get_flickr = false; //调试标志

var ink_for = "alex"; //墨水类型，默认森亮号大船

/* 主函数们 */

//得到Flickr的连接
function get_flickr_link() {
   /* 自动获得，看起来很有需要 */
   //th1nk:用一个object来代替，会不会更酷一些
   //获得标题
   var txtTitle = document.title
   //获得URL
   var txtUrl = window.location.href
	
   //初始化图片数量
   var pic_num = 0
   //取得图片字串
   var txtCont = ""
   //最终字串，初始化为空
   var flickr_txt = ""


   //最初标头
   var str_start = "<!-- 来自Flickr相册：[" + txtTitle + "] -->\r\n"
   //一个链接记录下来
   str_start += "<!-- 来自链接：[" + txtUrl + "]) -->\r\n"
   str_start += "<div id=\"slboat_flickr_pics\">\r\n"

   /* 处理标签页，处理相册页 */
   //todo:取得单页图片

   //标签页标记
   var Ident_tag_page = ".pc_t .pc_img"
   //相册页标记
   var Ident_set_page = ".pc_s .pc_img"
   //群组页标记
	var Ident_groups_page = ".pc_n .pc_img"
   //单页标记
	var Ident_single_page = "#liquid-photo"

   if ($(Ident_set_page).length == 0) {
      catch_them = $(Ident_tag_page); //尝试标签页
	  if ($(Ident_set_page).length == 0) { //如果标签页没戏
		catch_them = $(Ident_groups_page); //尝试群组页
	  }
   } else
      catch_them = $(Ident_set_page); //为相片集页

   //看看是否抓到了一些可以捕获的玩意
   if (catch_them.length > 0) {
      catch_them.each(function () {
		  var str_alt = $(this).prop("alt") || "Slboat Seeing..." ; //尝试获得替换文本
         //渲染得到单条的最终连接情况
         txtCont += render_per_link($(this).prop("src"), $(this).parent().prop("href"), str_alt);
         //递加图片数量1
         pic_num ++;
      })
   }else{
		//不属于标签页、不属于相册页
		if ($(Ident_single_page).length>0) //有至少一个单页标签，一般也只有一个
		{
			var str_alt =  $(Ident_single_page).prop("alt") || "Slboat Seeing..." ; //尝试获得替换文本
			txtCont += render_per_link($(Ident_single_page).prop("src"), txtUrl, str_alt);
		}
	  }

   //搭建屁股部分
   str_end = "</div>\r\n"
   str_end += "<!-- 以上共计捕获" + pic_num + "张图片 -->\r\n"
   str_end += "<!-- 来自Flickr相册告一段落 -->\r\n"

   //如果得到了一些东西
   if (txtCont != "") {
      //拼合一切
      flickr_txt = render_final_text(str_start, txtCont, str_end)
   }

   //返回一个调试信息
   if (debug_get_flickr) {
      console.log("这次得到了\n" + flickr_txt)
   }

   return flickr_txt;

   //交回给原来去处理
}

/* 处理事件钩子 */
//添加事件钩子，当服务端请求的时候响应
chrome.extension.onRequest.addListener(function (request, sender,
   sendResponse) {
   if (request.method == "getSelection") {
      var titlestr = (document.title == "") ? "无标题见识" : document.title; //检测是否为空一起都在这里
      var copystr = window.getSelection().toString(); //选中的玩意
      var get_type = "ink"; //获取的类型

      ink_for = request.ink_for; //墨水类型

      //处理是否有复制文本
      if (copystr.length == 0) {
         //转为尝试获取flickr图片
         copystr = get_flickr_link(); // 如果没有取得的话依然是劳碌等死
         //判断是否有获得
         if (copystr.length > 0) {
            get_type = "flickr"; //新的获取类型
         }
      }
      //遣送回去数据，保留选择文字？
      sendResponse({
         data: copystr,
         title: titlestr,
         url: window.location.href,
         //获取类型，分别一种特殊的情况
         copy_type: get_type
      });
   } else
      sendResponse({}); // snub them. should dead?
});

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
//替换最终的图片URL，为需要的尺寸
//导入原始链接用以判断用户名
function mov_flickr_url(org_url,org_link) {
   //替换中图，替换小图
   //todo：可选的获得最终图片尺寸样式
   var return_url = "";
   var replace_url_letter = /_[sqtmnzcbo]\./ ; //正则匹配宏，匹配后缀字母
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
function render_per_link(urlimg, urllink,str_alt) {
   var txt_out = ""; //输出的临时变量
   urlimg = mov_flickr_url(urlimg, urllink); //通用的处理图片
   if (isAlex()) {
      //alex论坛风格
      txt_out += "[img]" + urlimg + "[/img]" + "\r\n";
   } else {
      //森亮号航海见识风格
      txt_out += ": <img src=\"" + urlimg + "\" alt=\""+ str_alt + "\" />" ; //带上缩进处理，赋值于完整图片
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
debug_get_flickr=true;  // 开启调试信息
get_flickr_link(); // 开始一次捕获
*/