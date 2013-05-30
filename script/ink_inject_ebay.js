//写入eBay的快递单
//
function ink_go_ebay(){
		//注入香港小包文字，如果可能的话
		var carrierName  = "Hong Kong Post";

		jQuery("#trackingTable .boxtext[id^='carrierName']").val(carrierName); //香港小包看起来，要拆开来
		if (jQuery("#trackingTable .boxtext[id^='trackingNumber']:first").val() != "") //如果第一个不是空白的
		{
				//eBay 更新后看起来只有一个按钮了
				jQuery("#update1 input").click(); //点击下去，看起来是的
		}

 }
//交给主脚本去处理事件钩子，到这里结束