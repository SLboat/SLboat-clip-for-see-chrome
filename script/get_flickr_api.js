/* 当前计划 
* 仅仅针对森亮号相册里的超过20张的tag图片处理
*/

/* 基本常量 */
var api_key="efd70e945516b4251a6d16f6bb538ee2"; //api密匙，用来获得访问请求
var per_page = "500"; //一次返回最多数量

/* 本次赋值 */
var user_id = "93340000%40N05"; //用户名编号，用来减少搜索范围
var search_tag = "赣州"; //搜索标签内容

var Requst_url = "http://api.flickr.com/services/rest/?method=flickr.photos.search" ;//基础搭建
Requst_url+="&api_key="+api_key; //这样拼看起来好看点
Requst_url+="&user_id="+user_id; //用户ID，减少数量
Requst_url+="&tags="+encodeURIComponent(search_tag); //搜索标签，将来要变成utf8的
Requst_url+="&extras=url_c,owner_name&per_page="+per_page + "&format=json&nojsoncallback=1"; //最后的一些玩意


var xhr = new XMLHttpRequest();
xhr.open("GET", Requst_url, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // JSON解析器不会执行攻击者设计的脚本.
    get_json_pics(JSON.parse(xhr.responseText));
  }
}
xhr.send();





