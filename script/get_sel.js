//添加事件钩子，当服务端请求的时候响应
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "getSelection") {
        var titlestr = (document.title == "") ? "无标题见识" : document.title; //检测是否为空一起都在这里
        //遣送回去数据
        sendResponse({
            data: window.getSelection().toString(),
            title: titlestr,
            url: window.location.href,
            copy_type: {type: "ink"}
        });
    } else if (request.method == "putInk") {
		//释放墨水
		ink_go(request.ink, request.ink_type);
	}else
        sendResponse({}); // snub them. should dead?
});