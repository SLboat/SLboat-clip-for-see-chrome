/**** 仅仅用以调试的代码 ****/

/* Flickr 首页 DOM 调试代码 */

/* Hook的事件委托人（办事者） */
var hook_dom_div = $("#view-holder");

/* 需要Hook的事件们 */
/** 不需要的？注释掉 **/
var hook_events = [
		"DOMSubtreeModified", //修改节点
	"DOMNodeInserted", //插入节点
	"DOMAttrModified", //属性修改
	"DOMNodeRemoved", //删除节点
	"DOMNodeRemovedFromDocument", //从文档移除
	"DOMNodeInsertedIntoDocument", //插入文档
	"DOMCharacterDataModified", //这个啥子修改
]

/* 取消所有历史绑定 */
hook_dom_div.off();

//TODO:typef翻译表？

function console_print_e(e) {
	//TODO,二次过滤？比如 e.DOMsubsxxxx=false
	console.log("DOM发生" + e.type + "事件：修改目标节点", e.target, ", 来自委托", e.currentTarget);

}

/* 开始事件绑定们 */
//空格分离时间
hook_dom_div.on(hook_events.join(" "), function(e) {
	console_print_e(e); //输出日志反馈
});