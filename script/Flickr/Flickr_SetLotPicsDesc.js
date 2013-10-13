var debug_flickr

	function Flickr_pics_SetUP_hook() {
		//检查是否值得冒泡起来
		if ($(".comment-button-desc").length == 0) {
			//重置默认提醒文字
			$("textarea#message").prop("placeholder", "或许来点描述 - 航海见识墨水已替换留言部件");
			//隐藏掉默认的注释玩意
			$(".comment-button-post").hide();

			$(".comment-button-post").before($('<input name="Submit" type="button" value="写入描述" class="Butt comment-button-desc rapidnofollow" tabindex="2"></input>'));
		}
	}

$(document).ready(function() {
	//IDEA:或许等待对象移除后再次复活事件？
	$("#photo-display-container").on("DOMSubtreeModified", "#comment-form", Flickr_pics_SetUP_hook);
	if (is_debug_ink) {
		console.log("已将航海见识墨水注入到评论框的按钮里了！");
	}; //告知已载入
})

//确保按钮管用
$(".comment-button-desc").click(function() {
	console.log('hi,you press me');
})