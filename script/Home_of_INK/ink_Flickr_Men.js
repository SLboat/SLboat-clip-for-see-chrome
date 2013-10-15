/* 这里负责的是处理Flick特别有关的操作们
 * 通常只是提示罢了
 */

/* 获得匹配的Flickr管理页标签 
 * 返回callback(id)
 * 没有的话返回id:0
 */

function get_orgin_tabid(callback) {
	var tab_work_id = 0
	var tab_match_patern = /http:\/\/www\.flickr\.com\/photos\/organize/

	chrome.windows.getAll({
		populate: true
	}, function(wins) { // 开始遍历里面的每一个
		wins.every(function(win) {
			win.tabs.every(function(tab) {
				if (tab.url.match(tab_match_patern)) {
					tab_work_id = tab.id
					return false; //成功了跳出
				}
				return true;
			})
			if (tab_work_id > 0) return false; //如果已经获得，跳出
			return true;
		}); //<--遍历结束
		callback(tab_work_id);
	}); //<--搜索结束

	//NOTE:有趣没办法一个return退出所有，只能退出一层
}

//发送给目标页面，设置flick返回的id

function set_flick_orgin_ids(idstr) {
	var CONFIG_need_swith_to_tab = true; //是否需要切换到tab

	get_orgin_tabid(function(tab_id) {
		//检查返回来的id如何
		if (tab_id > 0) {
			chrome.tabs.sendMessage(tab_id, {
				method: "set_flick_orgin_ids",
				idstr: idstr //传出字符串id
			});
			if (CONFIG_need_swith_to_tab) { //如果要切换的话
				//未等待返回结果-直接的切过去！
				chrome.tabs.update(tab_id, {
					active: true
				});
			}
		} // <-- 返回结束
	});
}