//添加事件钩子，当服务端请求的时候响应
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "getSelection") {
        var titlestr = (document.title == "") ? "无标题见识" : document.title; //检测是否为空一起都在这里
		var copystr = window.getSelection().toString();
		// 框架里会重复非常多次这样的问题
		if (copystr=="") //无内容跳出
		{
			 return false; //结束
		}
        //遣送回去数据
        sendResponse({
            data: copystr,
            title: titlestr,
            url: window.location.href,
            copy_type: {type: "ink"}
        });
    } else if (request.method == "putInk" && typeof(ink_go)=="function") { //确保已定义函数
		//释放墨水
		ink_go(request.ink, request.ink_type);
	}else
		return false;
});