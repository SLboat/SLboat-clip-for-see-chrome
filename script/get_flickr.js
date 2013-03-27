var debug_get_flickr = false; //调试标志

//替换最终的图片URL

function mov_flickr_url(org_url) {
   //替换中图，替换小图
   //todo：可选的获得最终图片尺寸样式
   var return_url;
   return_url = org_url.replace("_t", "_c");
   return_url = return_url.replace("_s", "_c");
   return return_url;
}

//得到Flickr的连接

function get_flickr_link() {
   /* 自动获得，看起来很有需要 */
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

   if ($(Ident_set_page).length == 0) {
      catch_them = $(Ident_tag_page);
   } else
      catch_them = $(Ident_set_page);

   //看看是否抓到了一些可以捕获的玩意
   if (catch_them.length > 0) {
      catch_them.each(function () {
         //当前的图片地址链接
         //带上缩进处理
         txtCont += ": " + mov_flickr_url($(this).prop("src"));
         //处理第一个中括号，已经赋给第一个空格
         txtCont += " " + "["
         //赋予链接目标
         txtCont += $(this).parent().prop("href");
         //赋予结尾封锁中括号
         txtCont += " Link]\r\n";
         //递加图片数量1
         pic_num += 1;
      })
   }

   //搭建屁股部分
   str_end = "</div>\r\n"
   str_end += "<!-- 以上共计捕获" + pic_num + "张图片 -->\r\n"
   str_end += "<!-- 来自Flickr的相册告一段落 -->\r\n"

   //如果得到了一些东西
   if (txtCont != "") {
      //拼合一切
      flickr_txt = str_start + txtCont + str_end
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
      var script = document.createElement("script")
      script.type = "text/javascript"
      //todo:移到本地去
      script.src =
         "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
      script.onload = get_flickr_link
      document.body.appendChild(script)
   } else
   //直接开始工作
      get_flickr_link();
}

/* 额外的测试执行 */

/*
debug_get_flickr=true;  // 开启调试信息
get_flickr_link(); // 开始一次捕获
*/