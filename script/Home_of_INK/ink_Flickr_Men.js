/* 这里负责的是处理Flick特别有关的操作们
 * 通常只是提示罢了
 */

/* 获得匹配的Flickr管理页标签 
 * 没有的话返回0
 */

function get_orgin_tabid() {
	var tab_work_id = 0
	var tab_match_patern = /http:\/\/www\.flickr\.com\/photos\/organize/

	chrome.windows.getAll({
		populate: true
	}, function(windows) { // 开始遍历里面的每一个
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
		});
	}) //<--遍历结束

	//NOTE:有趣没办法一个return退出所有，只能退出一层
	return tab_work_id;
}

//发送给目标页面，设置flick返回的id

function set_flick_orgin_ids(idstr) {
	var tab_id = get_orgin_tabid(); //获得标签id
	//忽视：暂不考虑反馈了
	if (tab_id > 0) {
		chrome.tabs.sendMessage(tab_id, {
			method: "set_flick_orgin_ids",
			idstr: idstr //传出字符串id
		})
		return true;
	} else {
		return false;
	}

}