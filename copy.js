var lastTime = new Date().getTime();
var isInManage = false;
var delayTime = 500;

function add(seltxt,title,url,tab) {
    //var action_url = localStorage.instapaper; //本地存储
    //chrome.tabs.update(tab.id, {url: action_url});
	//alert("hi");
	  //-----------------------------------------------------------------------
      // 如果没有选择内容，那么什么也不做
      //-----------------------------------------------------------------------
      if (seltxt.length <= 0) {
   	    alert ("没有发现任何见识")
        return;
      }
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