//添加事件钩子，当服务端请求的时候响应
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection"){
	  var eleTitle=document.getElementsByTagName("title")[0]
	  var titlestr = (eleTitle && eleTitle.innerHTML)? eleTitle.innerHTML : "未起名标题";
      sendResponse({data: window.getSelection().toString(), title: titlestr, url: window.location.href});
	}
    else
     sendResponse({}); // snub them. should dead?
});