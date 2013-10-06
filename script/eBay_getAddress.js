/* 这里试图获取eBay的地址信息 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
            copy_type: {type: "ink_slboat"} //使用航海见识的类型，只有一个基本内容。
        });
    } else
		return false;
});

function ebay_GetAddress(){
	var address, phone;//最终的地址构成部分
	//第一部分，只是地址信息
	address ="[Address]"; //初始化字串
	address += $("#shippingAddress").text().replace(/	/g,"");
	
	//构建电话信息的
    phone = $("#shippingAddressPhoneNum").text(); //进行两次替换-由于两种不同的空格头长度
	phone = phone.replace(/	/g,"").replace(/    /g,"");
	phone = phone.replace("Phone number","[Phone number]"); //滤除？
	
	//处理掉末尾的
	phone = phone.replace(/\n$/,""); //切除末尾的换行

	return address+phone; //抛出返回信息
}