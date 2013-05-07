//当前光标写入文字
function ink_go_ebay(ink, curr_pos){
		//注入香港小包文字，如果可能的话
		jQuery("#trackingTable .boxtext[id^='carrierName']").val("Hong Kong Post"); //香港小包看起来，要拆开来
		if (jQuery("#trackingTable .boxtext[id^='trackingNumber']:first").val() != "") //如果第一个不是空白的
		{
				jQuery("#update1 .btn").click(); //点击下去，看起来是的
		}

 }
//交给主脚本去处理事件钩子，到这里结束