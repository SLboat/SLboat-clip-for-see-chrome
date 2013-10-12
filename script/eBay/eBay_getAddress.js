/* 这里试图获取eBay的地址信息 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	//处理事件在这里
	if (request.method == "getSelection") {
		//获取页面标题
		var titlestr = (document.title == "") ? "{{int:无标题见识}}" : document.title; //检测是否为空一起都在这里
		var copystr = "[!无地址信息]"; //默认地址信息？
		copystr = ebay_GetAddress(); // 获取回来地址信息

		//遣送回去数据
		sendResponse({
			data: copystr,
			title: titlestr,
			url: window.location.href,
			copy_type: {
				type: "ink_slboat"
			} //使用航海见识的类型，只有一个基本内容。
		});
	} else
		return false;
});

function ebay_GetAddress() {
	/* 常量 */
	var ext_note = true; //额外信息
	/* 用量 */
	var address, phone; //最终的地址构成部分
	var info_add; //最终的地址
	//第一部分，只是地址信息
	address = ""; //初始化？
	if (ext_note) address += "[Address]"; //初始化字串，不要的选择？

	address += $("#shippingAddress").text().replace(/	/g, "");

	//构建电话信息的
	phone = $("#shippingAddressPhoneNum").text(); //进行两次替换-由于两种不同的空格头长度
	if (phone.trim()=="Phone number") //检查只有电话号码字样
	{
		phone = ""; //清理掉所有？
	}
	phone = phone.replace(/	/g, "").replace(/    /g, "");

	//电话的递加
	if (ext_note) phone = phone.replace("Phone number", "[Phone number]");

	//叠加-有点罗嗦
	info_add = address + phone; //叠加起来

	//最后的事情
	info_add = info_add.replace(/\n$/, ""); //切除末尾的换行，如果需要的话

	return info_add; //抛出返回信息
}