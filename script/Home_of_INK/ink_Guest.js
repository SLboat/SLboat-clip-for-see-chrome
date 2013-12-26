/* 这是欢迎宾客之处 
 * 亦指外部的扩展呼叫啥的
 */

var DEBUG_FOR_GUEST = true; //开启客人调试

chrome.runtime.onMessageExternal.addListener(
	function(ask, guest, sendResponse) {
		if (DEBUG_FOR_GUEST) {
			//试图汇报一些信息
			console.log("客人的ID: ", guest.id);
			console.log("客人的希望: ", ask);
		};
		//检查ID对象
		if (guest.id != "bahmaphgocmfpmlkpmcimhgbpdjkjdlo") {
			console.log("遗憾,目前只和航海见识探索来电...");
			return false;
		};
		if (ask.want == "墨水瓶") { //需要放置墨水,好的
			clear_ink(); //先清空墨水
			ink_add(ask.ink, "", "", {
				type: "ink_slboat"
			});
			return true;
		};
		if (ask.want == "放置墨水") { //需要放置墨水,好的
			var org_ink = get_ink();
			copy_text(ask.ink); //临时借用墨水
			set_ink(org_ink);
			getSelectedTab(function(tab) {
				//todo:如果页面不是的话,是否可以送到剪贴板呢?
				chrome.tabs.sendMessage(tab.id, {
					// 传递方法，传递api_key
					method: "putInk",
					ink: ask.ink, //墨水内容
					ink_type: "guest_put" //墨水类型
				}); //注入事件申请
			}); //获得选中比标签
		};
	});

/* 获得当前选中的标签 
 * 进行回调callback(id,tabs)
 */
function getSelectedTab(callback) {
	chrome.tabs.getSelected(function(tabs) {
		callback(tabs);
	});
}