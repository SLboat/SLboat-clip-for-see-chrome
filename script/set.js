var customDomainsTextbox;
var saveButton;

function init() {
   customDomainsTextbox = document.getElementById("play_time");
   saveButton = document.getElementById("save-button");

   customDomainsTextbox.value = localStorage.see_ink || "80";
	document.getElementById("ink_for").value=localStorage.ink_for || "slboat"; //默认值
	document.getElementById("api_key").value=localStorage.api_key || ""; //默认值为空

   markClean();
}

function save() {
	localStorage.see_ink = customDomainsTextbox.value;
	localStorage.ink_for = document.getElementById("ink_for").value;
	localStorage.api_key = document.getElementById("api_key").value;

   markClean();

   // chrome.extension.getBackgroundPage().init();
}

function markDirty() {
   saveButton.disabled = false;
}

function markClean() {
   saveButton.disabled = true;
}
// 设置按键钩子
document.addEventListener('DOMContentLoaded', function () {
   init();
   document.getElementById("play_time").addEventListener('input', markDirty);
   document.getElementById("api_key").addEventListener('input', markDirty);
   document.getElementById("ink_for").addEventListener('change', markDirty);
   document.getElementById('cancel-button').addEventListener('click', init);
   document.getElementById('save-button').addEventListener('click', save);

});