/* 这里负责的是处理Flick特别有关的操作们
 * 通常只是提示罢了
 */

var send_back_tabid = null; //送回来的tabid

/* 获得匹配的Flickr管理页标签 
 * 返回callback(id)
 * 没有的话返回id:0
 */

function get_orgin_tabid(callback) {
	//匹配的地址咯
	var tab_match_patern = "http://www.flickr.com/photos/organize";

	chrome.tabs.query({
		url: tab_match_patern
	}, function(tab) {
		if (tab.length > 0) { //如果存在tab
			callback(tab[0].id); //取第一个
		} else
			callback(0); //丢回个0
	})

}

//发送给目标页面，设置flick返回的id

function set_flick_orgin_ids(idstr, send_tab_id) {
	var CONFIG_need_swith_to_tab = true; //是否需要切换到tab

	send_back_tabid = send_tab_id;

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
		} else {
			//要想返回啥，只能发消息回去咯

		} // <-- 返回结束
	});
}

/* 检查是否存在目标id
 * 存在的话调用callback(true)，否则callback(false)
 */

function chrome_check_tabid(tabid, callback) {
	chrome.windows.getAll({
		populate: true
	}, function(wins) { // 开始遍历里面的每一个
		var had_same = false; //一致的标记
		wins.every(function(win) {
			win.tabs.every(function(tab) {
				if (tab.id == tabid) { //一样了
					callback(true);
					had_same = true;
					return false; //成功了跳出
				}
				return true;
			})
			if (!had_same) return false; //如果已经获得，跳出
			return true;
		});
		//最终完成-不存在窗口
		if (!had_same) {
			callback(false);
		}
	}) //<--getAll结束

}

/* 返回来到的页面 */

function go_back_to_send_page() {
	//试试回去咯
	if (send_back_tabid) {
		chrome_check_tabid(send_back_tabid, function(has_id) {
			if (has_id) { //如果存在id
				chrome.tabs.update(send_back_tabid, {
					active: true
				});
			}
		});
	}
}