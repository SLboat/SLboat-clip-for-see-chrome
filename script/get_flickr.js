var is_debug_ink = false; //调试标志

var ink_for = "slboat"; //墨水类型，默认森亮号大船

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