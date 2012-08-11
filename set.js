var customDomainsTextbox;
var saveButton;

function init() {
  customDomainsTextbox = document.getElementById("insta");
  saveButton = document.getElementById("save-button");

  customDomainsTextbox.value = localStorage.see_ink || "80";
  markClean();
}

function save() {
  localStorage.see_ink = customDomainsTextbox.value;
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
	document.getElementById("insta").addEventListener('input', markDirty);
	document.getElementById('cancel-button').addEventListener('click', init);
	document.getElementById('save-button').addEventListener('click', save);
});
