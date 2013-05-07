//当前光标写入文字
function ink_go_ebay(ink, curr_pos){
		//注入香港小包文字，如果可能的话
		jQuery("#trackingTable .boxtext[id^='carrierName']").val("HongKong Post");

 }

//交给主脚本去处理事件钩子，到这里结束