//当前光标写入文字
function ink_go_ebay(ink, curr_pos){
		//注入香港小包文字，如果可能的话
		jQuery("#trackingTable .boxtext[id^='carrierName']").val("Hong Kong Post"); //香港小包看起来，要拆开来

 }

//交给主脚本去处理事件钩子，到这里结束