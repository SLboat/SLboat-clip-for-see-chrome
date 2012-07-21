//这里用不上这玩意，chrome里事情变得麻烦了
var funGetSelectTxt = function() {
	var txt = "";
	if(document.selection) {
		txt = document.selection.createRange().text;	// IE
	} else {
		txt = document.getSelection();
	}
	return txt.toString();
};
//格式化为森亮瀚海见识格式
//-------------------------
// ===标题<ref> url </ref>===
// 内容
//--------------------------
//传入了soure，title，url，在这里处理
function fixtxt (source,title,url){
	source = source.replace(/(\n|\r|\r\n)/g,"<br\\>$1");
	var textout = "===" +title + "<ref>"+url+"</ref>===\r\n"+source;
	textout=textout+"<br\\>\r\n";
	return textout;
}