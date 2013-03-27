var lastTime = new Date().getTime();
var isInManage = false;
var delayTime = 500;

var   delayID=0; 
var  play_dealy=50; //动画每帧延时
var   Num=0; 
var   ink_images   =   new   Array   ( "icon_32.png",
 "pen_shape_1.png ", 
	"pen_shape_2.png ", 
		"pen_shape_3.png ",  
			"pen_shape_4.png "); 
var   flickr_images   =   new   Array   (
 "flickr_pen_shape_1.png ", 
	"flickr_pen_shape_2.png ", 
		"flickr_pen_shape_3.png ",  
			"flickr_pen_shape_4.png "); 

//默认墨水风格
var ink_type="ink"

/* 播放运作动画 */
function   ink_open_animateGraph() 
{ 
    Num++; 
	//播放完毕退出
	if (typeof(ink_type)!="undefined" &&	 ink_type=="flickr")
	{
			// 播放flickr的玩意
		    if (Num >= flickr_images.length) return; 
		    chrome.browserAction.setIcon({path: "/img/" + flickr_images[Num]}); 
	}else{
		    if (Num >= ink_images.length) return; 
		    chrome.browserAction.setIcon({path: "/img/" + ink_images[Num]}); 
	}
    delayID=setTimeout( ink_open_animateGraph ,  play_dealy); 
} 

function add(seltxt,title,url,tab) {
	  //-----------------------------------------------------------------------
      // 如果没有选择内容，那就处理特殊情况
      //-----------------------------------------------------------------------
	
	  ink_type="ink" //初始化墨水类型为默认

	  var result=""; //返回结果的玩意

	  /* 处理传入的玩意 */
      if (seltxt.length <= 0) {
			//没有传入任何内容，判断是否为Flickr
			if (getHost(url)="www.flickr.com") // 当前只做了一个效验
			{
				ink_type="flickr"; //设置墨水类型
				result=get_flickr_link(title,url); //尝试获得页面里的东西
			}else{
				// 全部否定，彻底终止
				chrome.browserAction.setIcon({path: "/img/icon_32.png"}); // 关闭墨水
				return;
			}
      }else{
		  //chrome.browserAction.setIcon({path: "icon_open_32.png"}); //打开墨水
		  Num=0;//播放精心设置的动画，这动画有着alex的心血
		  play_dealy=localStorage.see_ink;//动态赋值动画参数
		  ink_open_animateGraph(); //播放动画由这里开始

		//格式化文本-得到最终玩意
		  result =fixtxt(seltxt,title,url); 
		}

	  //给本地保存一份，作用是啥子呢-将来注入墨水
	  localStorage.content = result;

	  var ta = document.getElementById('ta');
	  ta.value = result;
	  ta.select();

	  //执行复制到这里
	  var rv = document.execCommand("copy");
}
function go_see() {
    chrome.tabs.create({url:"http://see.sl088.com"});  //打开管理页面
}

/* 添加按钮点击事件 */
chrome.browserAction.onClicked.addListener(function(tab) {
    var currentTime = new Date().getTime();
	//点击事件
	if (currentTime - lastTime > delayTime) { // 间隔大于500毫秒就是无关
        // 第一次点击-作为添加事件
        // set manage flag
        isInManage = false;
        setTimeout(function() {
            // check if is in manage now
            if (isInManage) return;
				//发送事件请求
			  chrome.tabs.sendRequest(tab.id, {method: "getSelection"}, function(response){
				 add(response.data,response.title,response.url,tab);
			  }); //注入事件申请
        }, 500);
    } else {
        // alert("manage");
        // set manage flag
        isInManage = true;
        go_see();
    }
    // update time
    lastTime = currentTime;
});

/* 处理得到的事件 */
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
    if (request.command == "add") {
        chrome.tabs.getSelected(null, add);
    } else if (request.command == "manage") {
        go_see();
    }
    sendResponse({}); // snub them.
});

/* 一些子函数-小专将 */
/* 小函数 - 提取URL的域名 */
//获得的字串类似于：www.flickr.com
var getHost = function(url) { 
        var host = "";
        var regex = /.*\:\/\/([^\/]*).*/;
        var match = url.match(regex);
        if(typeof match != "undefined"
                        && null != match)
                host = match[1];
        return host;
}