/* 这是:处理公共wiki等内部链接页 */

//添加事件钩子，当服务端请求的时候响应
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "getSelection") {
		var titlestr = (document.title == "") ? "{{int:无标题见识}}" : document.title; //检测是否为空一起都在这里
		var copystr = window.getSelection().toString(); //空的看起来也不要紧...
		var inter_wiki_title = $("#firstHeading span").text(); //截取一部分标题，别的方式可能是-获得标题
		var inter_wiki_url; //定义地址存放
		var ink_type = "ink"; //类型
		// 检查标题是否有效
		if (inter_wiki_title.length > 0 && interwiki_shortname()) {
			inter_wiki_url = interwiki_shortname() + inter_wiki_title;
			if (copystr.length > 0) {				
				ink_type = "ink_interwiki";
			}else{ //旧方法..
				copystr = "[[" + inter_wiki_url + "]]";
				ink_type = "ink_slboat";  //这不太公平,只是需要内容而已
			}
		} else {
			inter_wiki_url = window.location.href;
		}
		//遣送回去数据
		sendResponse({
			data: copystr,
			title: titlestr,
			url: inter_wiki_url,
			copy_type: {
				type: ink_type, //准确的墨水类型
			}
		});
	} else
		return false;
});

//获得短短的名字

function interwiki_shortname() {
	var page_url = window.location.href;
	if (page_url.match(/www\.mediawiki\.org\/wiki/)) {
		return "mw:";
	};

	//没任何匹配
	return null
}