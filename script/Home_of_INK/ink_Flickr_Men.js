/* 这里负责的是处理Flick特别有关的操作们
 * 通常只是提示罢了
 */

var stack_idstr = ""; //没送出的的idstr
var send_back_tab = null; //送回来的tabid

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
			if (had_same) return false; //如果已经获得，跳出
			return true;
		});
		//最终完成-不存在窗口
		if (!had_same) {
			callback(false);
		}
	}) //<--getAll结束

}

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
			callback(tab[0].id, tab); //取第一个
		} else
			callback(0, tab); //丢回个0
	})

}

//发送给目标页面，设置flick返回的id

function set_flick_orgin_ids(idstr, sender) {
	var CONFIG_need_swith_to_tab = true; //是否需要切换到tab

	/* 留存将来用的玩意 */
	send_back_tab = sender;
	stack_idstr = idstr;

	get_orgin_tabid(function(tab_id, tab) { //这里应该有id了
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
				//检查是否同一个窗口
				if (tab[0].windowId != sender.windowId) {
					//再切换窗口一下好了
					chrome.windows.update(tab[0].windowId, {
						focused: true
					});
				}
			};
			//图标变化
			flickr_make_note_send_icon(); //图标设置
			set_inkicon_text("→" + idstr.split(",").length); //设置个标记
			stack_idstr = ""; //清空记录栈哦
		} else {
			set_inkicon_text("↑-" + idstr.split(",").length); //显示一个待命上箭头
			//要想返回啥，只能发消息回去咯
			//<-- 客家人怎样过日子呢？不过这里显然要生产一个才是的好
			chrome.tabs.create({
				url: "http://www.flickr.com/photos/organize", //这里是object的一部分
				index: sender.index + 1, //只在右边
				//active: false, //不激活?
			});
			//看起来创建后还不能做啥的呢

		} // <-- 返回结束
	});
}

/* 返回来到的页面 */

function go_back_to_send_page() {
	//试试回去咯
	if (send_back_tab) {
		chrome_check_tabid(send_back_tab.id, function(has_id) {
			if (has_id) { //如果存在id
				chrome.tabs.update(send_back_tab.id, {
					active: true
				});
				//窗口前置
				chrome.windows.update(send_back_tab.windowId, {
					focused: true
				})
			} else { //已经关掉了,死去了
				send_back_tab = null; //清除
			}
		});
	}
}

/* 领取任务 */

function queryOrginWork(tab_id) {
	if (stack_idstr != "") {
		chrome.tabs.sendMessage(tab_id, {
			method: "set_flick_orgin_ids",
			idstr: stack_idstr //传出字符串id
		});
	}

}