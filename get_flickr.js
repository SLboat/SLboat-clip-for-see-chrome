//�滻���յ�ͼƬURL
function mov_flickr_url(org_url){
	//�滻��ͼ���滻Сͼ
	//todo����ѡ�Ļ������ͼƬ�ߴ���ʽ
	var return_url;
	return_url=org_url.replace("_t","_c");
	return_url=return_url.replace("_s","_c");
	return return_url;
}

//������ű�
function load_jquery_script(){
	//���������µ�JQuery���ж�jQuery�������ܹ������ĸ���
	if (typeof(jQuery)=="undefined")
	{
		//ע��jQuery�ű�
		var script = document.createElement("script")
		script.type = "text/javascript"
		//todo:�Ƶ�����ȥ
		script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
		script.onload = get_flickr_link
		document.body.appendChild(script)
	}else
		//ֱ�ӿ�ʼ����
		get_flickr_link();	
}

//����������ϵĻص�
function first_load_callback(){
	console.log("jQuery"+$.fn.jquery +"�Ѿ�������ϣ�׼������!");
	//Ҳ�����չʾ���ȴ�ɶ�ӵ�
	get_flickr_link();
}

//�õ�Flickr������
function get_flickr_link(){
	//��ñ���
	var txtTitle = document.title
	//���URL
	var txtUrl = window.location.href

	//��ʼ��ͼƬ����
	var pic_num=0
	//ȡ��ͼƬ�ִ�
	var txtCont=""

	//�����ͷ
	var str_start="<!-- ����Flickr��᣺[" + txtTitle + "] -->\r\n"
	//һ�����Ӽ�¼����
	str_start+="<!-- �������ӣ�["+txtUrl+ "]) -->\r\n"
	str_start+="<div id=\"slboat_flickr_pics\">\r\n"

	/* �����ǩҳ���������ҳ */
	//todo:ȡ�õ�ҳͼƬ

	//��ǩҳ���
	var Ident_tag_page=".pc_t .pc_img"
	//���ҳ���
	var Ident_set_page=".pc_s .pc_img"

	if ($(Ident_set_page).length==0){
		catch_them=$(Ident_tag_page);
	}else
		catch_them=$(Ident_set_page);

	//�����Ƿ�ץ����һЩ���Բ��������
	if (catch_them.length>0){
		catch_them.each(function(){ 
			//��ǰ��ͼƬ��ַ����
			txtCont+=mov_flickr_url($(this).prop("src"));
			//�����һ�������ţ��Ѿ�������һ���ո�
			txtCont+=" "+"["
			//��������Ŀ��
			txtCont+=$(this).parent().prop("href");
			//�����β����������
			txtCont+=" Link]\r\n";
			//�ݼ�ͼƬ����1
			pic_num+=1;
		})
	}

	//�ƨ�ɲ���
	str_end="</div>\r\n"
	str_end+="<!-- ���Ϲ��Ʋ���"+pic_num+"��ͼƬ -->\r\n"
	str_end+="<!-- ����Flickr������һ���� -->\r\n"

	//����õ���һЩ����
	if (txtCont != "")
	{
		//ƴ��һ��
		flickr_txt=str_start+txtCont+str_end
	}

	console.log("��εõ���\n"+flickr_txt)

	return flickr_txt;

	//todo:������������ˣ�ͼ��䶯��
}


/* ��ʼ����ִ�� */
//���뿩
load_jquery_script()
//console.log("��εõ���\n"+get_flickr_link())
