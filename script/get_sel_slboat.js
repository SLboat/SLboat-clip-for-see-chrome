//添加事件钩子，当服务端请求的时候响应
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "getSelection") {
        var titlestr = (document.title == "") ? "{{int:无标题见识}}" : document.title; //检测是否为空一起都在这里
		var copystr = window.getSelection().toString();
		var slboat_title = $("#firstHeading span").text(); //截取一部分标题，别的方式可能是-获得标题
		if (slboat_title=="")
		{
			return false;//结束
		}
        //加上冒号，为啥不呢
		slboat_title = ":[[" + slboat_title + "]]"; //封装
		// 框架里会重复非常多次这样的问题
		if (copystr=="") //无内容跳出
		{
			copystr=slboat_title;
		}else{
			copystr = ":" + slboat_title + ": \n::" + copystr; //换行等等
		}
        //遣送回去数据
        sendResponse({
            data: copystr,
            title: titlestr,
            url: window.location.href,
            copy_type: {type: "ink_slboat"}
        });
    } else
		return false;
});