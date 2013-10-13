var debug_flickr

	function Flickr_pics_SetUP_hook() {
		//检查是否值得冒泡起来
		if ($(".comment-button-desc").length == 0) {
			//重置默认提醒文字
			$("textarea#message").prop("placeholder", "或许来点描述 - 航海见识墨水已替换留言部件");
			//隐藏掉默认的注释玩意
			$(".comment-button-post").hide();
			//开始填入新的按钮
			$(".comment-button-post").before($('<input name="Submit" type="button" value="写入描述" class="Butt comment-button-desc rapidnofollow" tabindex="2"></input>'));

			//确保按钮管用
			$(".comment-button-desc").click(function() {
				console.log('hi,you press me');
			})
		}
	}

	//TODO:如果hook失败，那么可以墨水按钮按下去的时候再次Hook，听起来如何
	//CRAZY:或许给body一个hook，然后匹配两个hook是否一致？
	//NOW:使用photo-list-holder这里挂钩，看起来好多了！
$(document).ready(function() {
	//IDEA:或许等待对象移除后再次复活事件？
	$("#photo-list-holder").on("DOMSubtreeModified", "#comment-form", Flickr_pics_SetUP_hook);
	if (is_debug_ink) {
		console.log("已将航海见识墨水注入到评论框的按钮里了！");
	}; //告知已载入

})


/* 获取页面的里的标题 */
//TODO:对于没标题的处理？

function get_title_by_comment() {
	return $("#message").parents(".photo-display-item").find("div.title a").text();
}

/* 获取当前对应的ID */

function get_id_by_comment() {
	return $("#message").parents(".photo-display-item").attr("data-photo-id");
}

//领取API回家
chrome.extension.sendMessage({
	command: "flickr_api_request"
}, function(api) {
	flickr_api_key = api; //赋予全局的API
});