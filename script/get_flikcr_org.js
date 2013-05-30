/* 这里是从管理页面获取tag，然后用API调用
 * 依赖jQuery进行运作
 */

/* 扩展获得下一个节点的功能给jQuery
 * 这里用来提取文本节点
 * 但愿只有一个
 */
window.onload = function (){
	$.fn.nextNode = function(){
	  var contents = $(this).parent().contents();
	  return contents.get(contents.index(this)+1);
	}
}

//完整的获取逻辑 - 这里是一切的起源地
function get_flickr_organize_tag(selct_tag_str){
	var tags; //定义标记的中间仓库
	var tag_to_found=null; //获得的tag标签

	var check_div = "#one_photo_inner_border_div"; //检查是否存在的标记

	//提取一份tag列表，确定是否有对话框出现
	if ($(check_div).length>0)
	//存在标记，开始工作
	{
		//仓库保存
		tags=get_all_tags();
		//首先试试选中的文字是否匹配
		tag_to_found=get_in_tags(tags, selct_tag_str);
		//测试匹配获取
		if (!tag_to_found)
		{
			//选中文字不匹配，试试唯一性的匹配
			tag_to_found = get_only_tags(tags);
		}
		else{
			return false; //返回死去
		}
	}
	//如果无匹配
	if (!tag_to_found)
	{
		return false;
	}

	//啊哈，匹配了
	//给出提示信息
	set_taginfo_text("航海见识墨水提取了标签：" + tag_to_found);
	//召唤API
	call_flickr_api_search(tag_to_found);
	//别的？

	return true;

}

//获得页面里对话框的tag
function get_in_tags(tags, selct_tag_str){
	//todo：模糊匹配一部分？
	if (tags.text.match(selct_tag_str)) //存在字符串里 
	{
		for (var i in tags.alltag)
		{
			tag = tags.alltag[i];
			if (tag.match(selct_tag_str))
			{
				return tag;
			}
		}
	}
	//失败告终，没有tag匹配
	return null;
}

//获得唯一的tag，如果存在的话
function get_only_tags(tags){
	if (!is_empty_tags(tags) && is_only_tags(tags))
	{
		return tags.text; //返回文字即可
	}
	return null; //返回无效
}


/* 标签标记显示和操作 */
//获得标签标记的文字层
function get_taginfo_div(){
	return $("#one_photo_description+br").nextNode();
}

//设置标签标记文字
function set_taginfo_text(tips){
	//todo: 获取默认值？
	var default_tips = "標籤"; //默认的显示文字，这里考虑为中文的
	get_taginfo_div().textContent=default_tips + "\t\t\t      [" + tips + "]";
}

//获得所有匹配的标记
function get_all_tags(){
	var tag_conts_div = "#addtagbox"; //标签内容容器的标志
	var tag_split_str =" ";//标签分割字符，默认是空格

	var tags_text = $(tag_conts_div).val(); //临时的中间标签文本

	return {
		text: tags_text, //最基础的玩意
		alltag: tags_text.split(tag_split_str), //使用tags很好，但是可能很意外
		num: tags_text.split(tag_split_str).length //一个多余的小玩意
	}
}

//是否唯一tag，输入tag类型
//todo:合并到原始类型里去
function is_only_tags(tags){
	//集中到一次性处理？
	return (tags.num == 1);
}

//是否没有tag
function is_empty_tags(tags){
	//即时很坏的扑捉到了空格，那么也是得到空白玩意
	return (tags.text == "");
}
