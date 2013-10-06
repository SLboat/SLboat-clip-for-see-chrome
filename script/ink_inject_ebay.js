/* 航海见识注入墨水模块
 * 写入eBay的快递单
 */

function ink_go_ebay() {
	//注入香港小包文字，如果可能的话
	var carrierName = "Hong Kong Post";

	//如果没有输入单号？

	//REV:第一次使用_me_下划线桥接
	var _flag_alert_ = true; //是否弹出提示框

	//TODO:显示这是第几个问题？
	$("#trackingTable .boxtext[id^='trackingNumber']").each(function(index, box) { //如果一个都没有看起来是不会执行的呢
		var chk_id = $(box).val(); //单号值
		var id_str = $(box).prop("id").replace("trackingNumber", "carrierName"); //替换为承运人的玩意
		//这里的每一个选择到的对应承运人将是: $("#trackingTable .boxtext[id='" + id_str + "']")
		/* 检查是否有效啥的 */
		if (vaild_hk_post(chk_id, _flag_alert_)) {
			$("#trackingTable .boxtext[id='" + id_str + "']").val(carrierName); //写入承运人
		} else { //效验不通过的话
			//nothing to do
			$(box).focus(); //聚集焦点？
		}


	})

	if (jQuery("#trackingTable .boxtext[id^='trackingNumber']:first").val() != "") //如果第一个不是空白的
	{
		//eBay 更新后看起来只有一个按钮了
		jQuery("#update1 input").click(); //点击下去，看起来是的
	}

}
//交给主脚本去处理事件钩子，到这里结束

/* 检查单号是否符合规则 */
/* 传入单号，以及是否弹出框标记 */

function vaild_hk_post(hk_post_number, alert_flag) {
	var alert_msg = ""; //报警信息
	var the_number_length = 13; //应当的长度
	//这里是一连串的大转圈圈。。。
	if (hk_post_number.length == the_number_length) {
		if (hk_post_number.search("RC") == 0) { //检查开头
			if (hk_post_number.search("HK") == the_number_length - 2) { //检查结尾
				if (!(hk_post_number.substring(2, the_number_length - 2).match(/\D/))) { //中间部分无数字
					return true; //一切通过了考验
				} else {
					alert_msg = "船长,这个单号中间部分" + hk_post_number.substring(2, the_number_length - 2) + "包含非数字的玩意！这是老子不认的。";


				}
			} else {
				alert_msg = "船长,这个单号:" + hk_post_number + "不是HK结尾！而是该死的" + hk_post_number.substring(the_number_length - 2, the_number_length);

			}
		} else {
			alert_msg = "船长,这个单号:" + hk_post_number + "不是RC开头！而是该死的" + hk_post_number.substring(0, 2);

		}
	} else if (hk_post_number.length > 0) { //至少一个
		alert_msg = "船长,这个单号:" + hk_post_number + "位数不是" + the_number_length + "位！而是该死的" + hk_post_number.length + "位";
	}
	//最终处理提示框
	if (alert_flag && alert_msg.length > 0) {
		alert(alert_msg); //弹出提示框
	}
	return false; //返回失败
}