var debug_flickr

	function Flickr_pics_SetUP_hook() {
		//检查是否值得冒泡起来
		if ($(".comment-button-desc").length == 0) {
			//新的状态框！互动的时代
			$(".add-comment-form").before($('<div style = "font-size:0.3em;margin-bottom: 5px;text-align: right;color: grey;" id = "Desc_info" > 随时待命准备写入描述信息... </div>'));
			//重置默认提醒文字
			$("textarea#message").prop("placeholder", "或许来点描述 - 航海见识墨水已替换留言部件");
			//隐藏掉默认的注释玩意
			$(".comment-button-post").hide();
			//开始填入新的按钮
			$(".comment-button-post").before($('<input name="Submit" type="button" value="写入描述" class="Butt comment-button-desc rapidnofollow" tabindex="2"></input>'));

			//确保按钮管用
			$(".comment-button-desc").click(function() {
				console.log('hi,you press me'); //TEMP:临时的问号
				set_note_state("是，船长，收到描述提交请求...");
				//构建写入...
				var title = get_title_by_comment();
				var id = get_id_by_comment();
				var descnote = get_descnote_by_comment();
				if (title != "" && id != "" && descnote != "") {
					set_note_state("吔吼！一切就绪，正在送往Flickr那家伙...")
					call_flickr_api_setmete(id, title, descnote)
					//回调？延时？
				}else{
					//TODO:红色？
					set_note_state("见鬼船长，有些玩意是空的...啥玩意就得去检查下了");
				}

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

/* 获得输入的描述信息 */

function get_descnote_by_comment() {
	return $("#message").val();
}

/* 写入状态信息 */

function set_note_state(state) {
	$("#Desc_info").text(state);
}

/* 读取状态信息 */

function get_note_state(state) {
	return $("#Desc_info").text();
}

/* 在这里提前用到API-于是领取API回家 */
i_request_for_API();