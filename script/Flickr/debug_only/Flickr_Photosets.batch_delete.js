/* 原始内容从API浏览器里提取
 * 获得页面:http://www.flickr.com/services/api/explore/flickr.photosets.getList
 */
jsonFlickrApi = {
  "photosets": {
    "cancreate": 1,
    "page": 1,
    "pages": 1,
    "perpage": "120",
    "total": "120",
    "photoset": [{
      "id": "72157636649124193",
      "primary": "10325592436",
      "secret": "sdsdsdsds",
      "server": "2815",
      "farm": 3,
      "photos": 31,
      "videos": 0,
      "title": {
        "_content": "[2013-10-17]"
      },
      "description": {
        "_content": ""
      },
      "needs_interstitial": 0,
      "visibility_can_see_set": 1,
      "count_views": 0,
      "count_comments": 0,
      "can_comment": 1,
      "date_create": "1382003861",
      "date_update": "1382361347"
    }, {
      "id": "72157636594585366",
      "primary": "10297176554",
      "secret": "ssssdasdsds",
      "server": "7420",
      "farm": 8,
      "photos": 6,
      "videos": 0,
      "title": {
        "_content": "[2013-10-16]"
      },
      "description": {
        "_content": ""
      },
      "needs_interstitial": 0,
      "visibility_can_see_set": 1,
      "count_views": 0,
      "count_comments": 0,
      "can_comment": 1,
      "date_create": "1381866348",
      "date_update": "1382254042"
    }, ]
  },
  "stat": "ok"
}

//中间获得内容
photos = jsonFlickrApi.photosets.photoset

//一些初始化动作-你最好确保之前已经得到了列表-以任何方式
//这里过滤所有的列表们
//假设你的列表是:photos=jsonFlickrApi.photosets.photoset

var photos_to_del = []; //新的数组
for (var i = 0; i < photos.length; i++) {
  //如果匹配了模式这里是日期-[yyyy-mm-dd]
  if (photos[i].title._content.match(/\[\d{4}-\d{2}-\d{2}\]/)) {
    photos_to_del.push(photos[i]); //压入
  }
}

/* 批量删除一堆的id玩意 
 * 危险,不可恢复,务必确定好是你想要的 */

function del_batch_array(photosets_id_arr) {
  if (photosets_id_arr.length == 0) return false;
  for (var i = 0; i < photosets_id_arr.length; i++) {
    del_photosets(photosets_id_arr[i].id); //每一个的进行删除
  }
  console.log("船长!已经全部送出去请求哩!一共是" + photosets_id_arr.length + "个")
}

// 制造处理玩意
/* 封装后的带console简单提示的函数 */

function del_photosets(photosets_id) {
  call_flickr_api_delsets(photosets_id, function(res) {
    //console.log("返回了:",res); //调试输出
    if (res.stat == "ok") {
      console.log("成功!相册" + photosets_id + "已经被删除")
    } else {
      console.log("失败!!!相册" + photosets_id + "删除失败:" + res.code + "-" + res.message)
    }
  })
}

/* 原始的处理函数-API处理-删除图片相册 */

function call_flickr_api_delsets(photosets_id, callback) {

  if (photosets_id == "") return false; //如果没有一点有用的东西，那则全部抛弃

  /* 基础地址 */
  var base_url = "http://api.flickr.com/services/rest/"; //TODO:移入公共的里面去

  var Requst_url = "?method=" + "flickr.photosets.delete"; //基础搭建，需要的方法
  Requst_url += "&api_key=" + flickr_api_key.api_key; //这样拼看起来好看点
  Requst_url += "&format=json&nojsoncallback=1"; //最后的一些玩意

  /* 基本的密匙等信息 */
  Requst_url += "&auth_token=" + flickr_api_key.auth_token

  /* 组合最后的请求数据 */
  //TODO:效验数据是否有效
  Requst_url += "&photoset_id=" + photosets_id;

  //最后的签名
  Requst_url += "&api_sig=" + get_api_sig(flickr_api_key.secret_key, Requst_url);

  Requst_url = base_url + Requst_url;

  /* 开始送入数据 */
  var xhr = new XMLHttpRequest();

  xhr.open("POST", Requst_url, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var res = JSON.parse(xhr.responseText); //返回的json玩意
      //呼叫回去
      callback(res);
    }
  }
  xhr.send();
}

/* 开始执行咯 */
del_batch_array(photos_to_del);