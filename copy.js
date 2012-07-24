var lastTime = new Date().getTime();
var isInManage = false;
var delayTime = 500;

var   delayID=0; 
var  paly_dealy=50; //动画每帧延时
var   Num=0; 
var   _images   =   new   Array   ( "icon_32.png",
 "pen_shape_1.png ", 
	"pen_shape_2.png ", 
		"pen_shape_3.png ",  
			"pen_shape_4.png "); 

function   ink_open_animateGraph() 
{ 
    Num++; 
    if (Num >= _images.length) return; 
    chrome.browserAction.setIcon({path: "/img/" + _images[Num]}); 
    delayID=setTimeout( "ink_open_animateGraph() ",   paly_dealy); 
} 

function add(seltxt,title,url,tab) {
    //var action_url = localStorage.instapaper; //本地存储
    //chrome.tabs.update(tab.id, {url: action_url});
	//alert("hi");
	  //-----------------------------------------------------------------------
      // 如果没有选择内容，那么什么也不做
      //-----------------------------------------------------------------------
      if (seltxt.length <= 0) {
   	    chrome.browserAction.setIcon({path: "/img/icon_32.png"}); // 关闭墨水
        return;
      }
	  //chrome.browserAction.setIcon({path: "icon_open_32.png"}); //打开墨水
	  Num=0;//播放精心设置的动画，这动画有着alex的心血
	  paly_dealy=localStorage.see_ink;//动态赋值动画参数
	  ink_open_animateGraph(); //播放动画由这里开始
	  var ta = document.getElementById('ta');
	  ta.value =fixtxt(seltxt,title,url); //格式化文本
	  ta.select();
	  var rv = document.execCommand("copy");
}
function go_see() {
    chrome.tabs.create({url:"http://see.sl088.com"});  //打开管理页面
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var currentTime = new Date().getTime();
    // alert("click");
    if (currentTime - lastTime > delayTime) { // 间隔大于500毫秒就是无关
        // alert("add");
        // set manage flag
        isInManage = false;
        setTimeout(function() {
            // check if is in manage now
            if (isInManage) return;
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

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
    if (request.command == "add") {
        chrome.tabs.getSelected(null, add);
    } else if (request.command == "manage") {
        go_see();
    }
    sendResponse({}); // snub them.
});