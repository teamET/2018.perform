window.addEventListener("load",mapInfo);
/**
 * スマホ・タブレットサイズのデバイスがmapから来た時の対処
 */
function mapInfo(){
  var h_mapinfo = document.getElementById("mapinfo");
  var h_thisinfo = document.getElementById("thisinfo"); 
  if(getParam("map") == "true"){
    var htmltext = '<div class="map">MAPページをスマートフォン・タブレットから<br>ご覧いただくことはできません。<br>LINE＠の詳細マップ機能をご利用ください。</div>';
    WriteInfo(h_mapinfo,htmltext);
  }
  // 友達登録ボタン画像
  // var friend = document.getElementById("friend");
  // friend.addEventListener('onclick', line);
}

/**
 * 指定したパラメータを取得
 * @param {str} name : パラメータ名
 * @return {object} p_obj[name] : パラメータに対応する値 
 */
function getParam(name) {
  var p_obj = new Object;
  //console.log(reloadCount);
  var p_all = location.search.substring(1).split('&');
  // パラメータを指定しない場合、return Outside
  if(p_all == ""){
    return "false";
  }
  // pair[i]が存在しない場合はいらない
  for(i=0;p_all[i];i++){
    var keyValue = p_all[i].split('=');
    p_obj[keyValue[0]]=keyValue[1];
  }
  return p_obj[name];
}

/**
 * 指定したIDの箇所にhtmlを埋め込む
 * @param {document.getElementById()} id 
 * @param {str} htmltext 
 */
function WriteInfo(id,htmltext){
  id.innerHTML = htmltext;
}

/**
 * LINEの招待URLに飛ぶ
 */
function line(){
  window.location.assign("https://line.me/R/ti/p/%40wey0128f");
  window.msg.textContent = "Moving...";
  setInterval(()=>window.msg.textContent+=".", 10);
}