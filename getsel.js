//添加事件钩子，当服务端请求的时候响应
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection"){
	  var titlestr=(document.title=="")?"无标题见识":document.title;//检测是否为空一起都在这里
	  //遣送回去数据
      sendResponse({data: window.getSelection().toString(), title: titlestr, url: window.location.href});
	}
    else
     sendResponse({}); // snub them. should dead?
});