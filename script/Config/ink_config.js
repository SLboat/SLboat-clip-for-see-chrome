var default_link_for_token = "http://www.flickr.com/auth-72157633098872233"; //API KEY的对应获取地址，默认值

function init() {
	//可以工作
	Load_Setting();
}

//载入设置

function Load_Setting() {
	// th1nk: 利用遍历一次性保存-听起来如何，匹配ID来操作，这样可以直接读取改变的值来变更哪里变了，不用全局变动

	$("#see_ink").val(localStorage.see_ink || "80"); //默认80
	$("#ink_for").val(localStorage.ink_for || "slboat"); //默认值slboat
	$("#link_for_token").val(localStorage.link_for_token || default_link_for_token); //默认值或者默认值
	$("#api_key").val(localStorage.api_key || ""); //默认值为空
	$("#secret_key").val(localStorage.secret_key || ""); //默认值为空
	$("#auth_token").val(localStorage.auth_token || ""); //默认值为空
	$("#user_name").val(localStorage.user_name || ""); //默认值为空
	$("#flickr_order").val(localStorage.flickr_order || ""); //默认值为空

    //树之下的信息
    $("#user_name_underthetree").val(localStorage.user_name_underthetree);
    $("#auth_token_underthetree").val(localStorage.auth_token_underthetree);
    
	//种子不用动
	Disabled_Save_Button();
}

//保存设置

function Save_Setting() {
	localStorage.clear(); //清空抛弃不必要的
	localStorage.see_ink = $("#see_ink").val();
	localStorage.ink_for = $("#ink_for").val();
	localStorage.link_for_token = $("#link_for_token").val(); //这里是认证连接
	localStorage.api_key = $("#api_key").val();
	localStorage.secret_key = $("#secret_key").val();
	localStorage.auth_token = $("#auth_token").val();
	localStorage.user_name = $("#user_name").val(); //用户名这玩意
	localStorage.flickr_order = $("#flickr_order").val(); //排序这玩意
	localStorage.seeds = random_int(0, 500); //生成一个种子

    //树之下的信息
    
    localStorage.user_name_underthetree = $("#user_name_underthetree").val();
    localStorage.auth_token_underthetree = $("#auth_token_underthetree").val();
    
	Disabled_Save_Button(); //黑按钮
	save_tips("应该保存进去了！不然为啥按钮都黑了！"); //保存提醒

	// chrome.extension.getBackgroundPage().init();
}

//开启按钮

function Enable_Save_Button() {
	$("#save-button").prop("disabled", false);
}

//禁止按钮

function Disabled_Save_Button() {
	$("#save-button").prop("disabled", true);
}

$(document).ready(function() {
	init(); //载入默认

	$("input").bind("input", Enable_Save_Button); //所有输入框
	$("select").bind("change", Enable_Save_Button); //所有选择框
	$("#save-button").click(Save_Setting); //所有保存
	$("#cancel-button").click(Load_Setting); //所有保存

	$("#flickr_order").change(Save_Setting); //所有保存

	//打开指定页面
	$(".link_get_token").click(function() {
		window.open($("#link_for_token").val(), "_blank");
	});

	//绑定获得token的玩意
	$("#get-token-button").click(function() {
		if ($("#api_key").val().length == 0) //长度是0
		{
			tips("抱歉，你没有输入一个api-key呢，先搞到api-key吧！");
			return false;
		}
		if ($("#secret_key").val().length == 0) //长度是0
		{
			tips("抱歉，你没有输入一个公共密匙呢，到api-key页面搞到吧！");
			return false;
		}
		if ($("#mini_token").val().length == 0) //长度是0
		{
			tips("抱歉，你没有输入一个mini-token呢，先进入认证页面吧！");
			return false;
		}
		tips("船长..正在为你获取...")
		//传给匿名函数，来得到一整个的访问，取得的是当页的
		call_flickr_api_get_fulltoekn($("#api_key").val(), $("#secret_key").val(), $("#mini_token").val(), get_token_back);

	});
	//测试API按钮
	$("#api_test").click(function() {
		tips("船长..正在效验API是否有效....");
		call_flickr_api_check_token($("#api_key").val(), $("#secret_key").val(), $("#mini_token").val(), $("#auth_token").val(), function(res) {
			if (res.stat == "ok") {
				//TODO:加全名?
				tips("船长,这玩意管用,权限:" + res.auth.perms._content + ",用户名:" + res.auth.user.username);
			} else {
				tips("船长,这玩意不管用: " + res.code + "-" + res.message)
			}
		})

	});

	$(".borderBTM").click(function() {
		$("#" + ($(this).attr("blink"))).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
	})
})

function get_token_back(Json_Token) {
	console.log("获得了一些东西回来");
	if (Json_Token.stat == "ok") {
		tips("获得token成功!已填入授权密匙处，请记得保存！");
        
        /* 根据树之下来自动获取 */
        if (Json_Token.auth.user.username.toLowerCase() == "slboat under the tree"){
            $("#auth_token_underthetree").val(Json_Token.auth.token._content); //写入到token里去
            $("#user_name_underthetree").val(Json_Token.auth.user.username.toLowerCase());
            
        } else {
            //这里是正常的森亮号
            $("#auth_token").val(Json_Token.auth.token._content); //写入到token里去
            $("#user_name").val(Json_Token.auth.user.username.toLowerCase());
        };
        
	} else {
		tips("尝试获取token失败，原因：" + Json_Token.message);
	}

}

//直接输入提示给token

function tips(text) {
	$("#tips").text(text); //不返回直接操作
}

function save_tips(text) {
	$("#save_info").text(text); //传入内容
	$("#save_info").show();
	$("#save_info").fadeOut(5000);

}

// 生成min-max之间的随机数整数

function random_int(min, max) {
	return parseInt(Math.random() * (min - max) + max)
}