//格式化复制内容，这里称为。
//这里用不上这玩意，chrome里事情变得麻烦了。
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
// ===标题<sup> 沿途见识</sup><ref> url </ref>===
// 内容
//--------------------------
//传入了soure，title，url，在这里处理
function fixtxt (source,title,url){
	//不再该死的br
	//source = source.replace(/(\n|\r|\r\n)/g,"<br />$1"); 
	//处理标题加上标志
	title+="<sup> 沿途见识</sup>"
	source="<poem>\r\n"+source+"\r\n</poem>"
	var textout = "===" +title + "<ref>"+url+"</ref>===\r\n"+source;
	textout=textout+"\r\n";
	return textout;
}