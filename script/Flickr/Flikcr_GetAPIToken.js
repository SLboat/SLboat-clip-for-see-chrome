/* 获得token用来取得剩下的一切 */
//森亮号航海见识墨水的认证URL是：http://www.flickr.com/auth-72157633098872233

function call_flickr_api_get_fulltoekn(api_key, secret_key, mini_token, callback) {

	var base_url = "http://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.auth.getFullToken"; //基础搭建
	Requst_url += "&api_key=" + api_key; //这样拼看起来好看点
	Requst_url += "&mini_token=" + mini_token; //迷你的token
	Requst_url += "&format=json&nojsoncallback=1"; //再加上反馈json信息

	//看起来还需要公共密匙用来计算MD5
	Requst_url += "&api_sig=" + get_api_sig(secret_key, Requst_url); //算出来这该死的玩意


	Requst_url = base_url + Requst_url; //组合成呼叫url

	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			//获得完毕了
			var res = (JSON.parse(xhr.responseText)); //传入到解析器里去
			/* 不太紧要的输出一些东西 
			if (Json_Token.stat=="ok")
			{
				console.log ("获得token完毕!");
				var auth_token=Json_Token.auth.token._content || ""; //写入到全局token里去

			}else{
				console.log ("获得token失败!");
				console.log("返回的是:"+xhr.responseText);
			}
			//调试中先注销 
		*/
			if (typeof(callback) == "function") return callback(res); //函数回调结束

		}
	}
	xhr.send();
}

//获得签名信息
//来自 http://josephj.com/prototype/JosephJiang/Presentation/OpenAPI_Workshop/flickr-auth-api.html

function get_api_sig(sSecretKey, sParameter) {
	sParameter = sParameter.replace('?', ''); //去除问号，不再需要
	var aParameter = sParameter.split('&'); //切割一个个参数
	aParameter.sort(); //神奇的排序，按字母排序
	var sSignature = sSecretKey; //初始化为签名开始
	for (var i = 0, j = aParameter.length; i < j; i++) { //开始组合字符串
		var sName = aParameter[i].split('=')[0];
		var sValue = aParameter[i].split('=')[1];
		sSignature += sName + sValue;
	};
	return MD5(sSignature);
};

/* 验证token是否工作 */

function call_flickr_api_get_checktoekn(api_key, secret_key, mini_token, auth_token, callback) {

	var base_url = "http://api.flickr.com/services/rest/";

	var Requst_url = "?method=flickr.auth.checkToken"; //基础搭建
	Requst_url += "&api_key=" + api_key; //这样拼看起来好看点
	Requst_url += "&mini_token=" + mini_token; //迷你的token
	Requst_url += "&auth_token=" + auth_token; //效验的token
	Requst_url += "&format=json&nojsoncallback=1"; //再加上反馈json信息

	Requst_url += "&api_sig=" + get_api_sig(secret_key, Requst_url); //算出来这该死的玩意
	Requst_url = base_url + Requst_url; //组合成呼叫url
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", Requst_url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			//获得完毕了
			var res = (JSON.parse(xhr.responseText)); //传入到解析器里去
			if (typeof(callback) == "function") return callback(res); //函数回调结束

		}
	}
	xhr.send();
}