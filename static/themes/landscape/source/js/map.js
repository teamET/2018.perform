/*
comment:
変数命名規則
g_-- : 全体マップにおくオブジェクト
j_-- : JSONから持ってきたデータ
a_-- : 外・エリアごとに配置するオブジェクト
c_-- : 構内マップにおくオブジェクト
m_-- : MAP画像
h_-- : html(DOM)
e_-- : eventチェック用
// *z : 後から座標指定しなきゃダメなところ
// ** comment  後から実装するべきところ
// *p : pathが配置されていること
Comment
*/

window.addEventListener("load",Load);

function Load(){
  // load JSON
  var queue = new createjs.LoadQueue(true);
  // *p
  var manifest = [
    {"src":"./../data/mapImgData.json","id":"mapImgs"}
  ]
  /*
  // ** 後で足せ
  {"src":"./JSON/mapImgData.json","id":"mapImgs"},
    {"src":"./JSON/shop.json","id":"shop"},
    {"src":"./JSON/mapImgDatas.json","id":"id"}
  */
  queue.loadManifest(manifest,true);
  queue.addEventListener("complete",init);
}
function init(event){
  // json : j_--- : jsonから読み取ったデータ
  var j_mapImgsData  = event.target.getResult("mapImgs");
  //var j_shopData     = event.target.getResult("shop");
  // - canvasの定義
  var canvasContainer = document.getElementById("wrap");
  var canvasElement = document.getElementById("myCanvas");
  canvasContainer.style.boxSizing="inherit";
  var h_shopname  = document.getElementById("shopname");
  // CanvasSizeの大きさ画面サイズに設定する（初期化）
  var Sizing = function(){
    canvasElement.height = canvasContainer.offsetHeight;
    canvasElement.width  = canvasContainer.offsetWidth;
  }
  Sizing();
  // stageの定義
  var stage = new createjs.StageGL(canvasElement);
  // 表示用コンテナの定義
  var DisplayContainer = new createjs.Container(); //表示用
  stage.addChild(DisplayContainer);
  DisplayContainer.cache(0,0,2000,2000);
  stage.setClearColor('#FFFFFF');
  // 学校全体MAPの表示 m_--- :　map画像 g_--- : 全体マップで表示されるもの
  // *p
  var gm_general = new createjs.Bitmap("./../img/" + j_mapImgsData.Generalview);
  main();

  // --- 画像の読み込み >> 画像の横幅を返す
  function getImageSize(bitmap){
    return new Promise(function(resolve,reject){
      bitmap.image.onload = function(){
        var size =[this.width,this.height];
        resolve(size);
      }
    });
  }
  // --- canvasのサイズを変更する　使わないかも
  function ChangeCanvasSize(width,height){
    canvasElement.style.width = width;
    canvasElement.style.height = height;
  }
  // -- main asyncなのでawaitで非同期処理を同期的に書ける
  async function main(){
    //画像のロードを完全に済ませる
    var bmp_size = await getImageSize(gm_general);
    //画像のスケール
    gm_general.scaleX = canvasContainer.offsetWidth / bmp_size[0];
    gm_general.scaleY = gm_general.scaleX;
    //canvasSizeの調整
    ChangeCanvasSize(gm_general.image.width * gm_general.scaleX,
                    gm_general.image.height * gm_general.scaleY);
    // 親子構造の構築
    //Containerの定義
    var OutsideContainer = new createjs.Container(); // 構外マップで表示されるオブジェクトが格納されている。
    var areaContainers   = []; // 各エリアのデータがA,B,C,D,E,F,の順で格納される。
    var g_rects          = [];
    var am_sizes_tmp     = []; // await時間短縮用
    var am_sizes         = []; // エリアごとに分けたときの画像のサイズが入っている。
    var am_imgs          = []; // エリアごとに分けたときの画像が入っている。
    var a_toGenerals     = []; //エリアから全体に戻るときの画像が入っている。
    var outSidePins_r    = []; //校外のピンたち（outSidePins[Area][num]) 本当はその上に隠れている四角
    var InsideTopContainer = new createjs.Container();// 構内マップで表示されるオブジェクトが格納されている。
    // :: 全体マップの配置 -------------------------------------------------------------------
    OutsideContainer.addChild(gm_general); // MAP画像を構外格納用コンテナの格納
    var g_areaTexts = ["A","B","C","D","E","F"];
    // エリア分け用の四角の配置
    for(i=0;i<j_mapImgsData.AreaRects.length;i++){
      var g_rect = new createjs.Shape();
      var j_rect = j_mapImgsData.AreaRects[i];
      g_rect.graphics.beginFill(j_rect.color); // ** 色分けしたいなら後で配列を宣言しましょう
      g_rect.graphics.drawRoundRect(0,0,j_rect.width * gm_general.scaleX,j_rect.height * gm_general.scaleY, 20* gm_general.scaleX);
      g_rect.x = j_rect.x * gm_general.scaleX; // 位置座標セット
      g_rect.y = j_rect.y * gm_general.scaleY; // 位置座標セット
      g_rect.alpha = 0.15;                       // 透明度
      // 枠線用オブジェクト
      var g_rectStroke = new createjs.Shape();
      g_rectStroke.graphics.beginStroke(j_rect.color);
      g_rectStroke.graphics.setStrokeStyle(5 * gm_general.scaleX); // * gm_general.scaleX
      g_rectStroke.graphics.drawRoundRect(0,0,j_rect.width * gm_general.scaleX,j_rect.height * gm_general.scaleY,20 * gm_general.scaleX);      
      g_rectStroke.x = g_rect.x;
      g_rectStroke.y = g_rect.y;
      // エリア分けで用いるテキスト
      var textSize = 100 * gm_general.scaleX;
      var g_text= new createjs.Text(g_areaTexts[i], textSize +"px selif",j_rect.color);
      g_text.x = (j_rect.x + parseInt(j_rect.width /2) ) * gm_general.scaleX;
      g_text.y = (j_rect.y + parseInt(j_rect.height/2) ) * gm_general.scaleY;
      g_text.textAlign = "center";
      g_text.textBaseline = "middle";
      // 四角形とテキストを構外MAP用に入れる。
      OutsideContainer.addChild(g_rect);
      OutsideContainer.addChild(g_rectStroke);
      OutsideContainer.addChild(g_text);
      g_rects.push(g_rect);
    }
    // :: 構内へ、の矢印
    var toCampusArrow = new createjs.Bitmap("./../img/" + j_mapImgsData.ToCampusArrow);　// *p
    // 位置、角度のセット
    toCampusArrow.scaleX = gm_general.scaleX * 0.8;
    toCampusArrow.scaleY = gm_general.scaleY * 0.8;
    toCampusArrow.x        = 3000 * gm_general.scaleX; // *z 座標を入れよう
    toCampusArrow.y        = 300 * gm_general.scaleY; // *z
    OutsideContainer.addChild(toCampusArrow);
    // :: 小エリアの配置 -------------------------------------------------------------------
    // 各エリアの拡大画像の大きさの取得
    for(i=0;i<j_mapImgsData.OutsideAreas.length;i++){
      var am_img = new createjs.Bitmap("./../img/" + j_mapImgsData.OutsideAreas[i].img);
      am_sizes_tmp[i] = getImageSize(am_img);
    }
    for(i=0;i<j_mapImgsData.OutsideAreas.length;i++)am_sizes[i] = await am_sizes_tmp[i];
    //小エリア内オブジェクトの配置
    for(i=0;i<j_mapImgsData.OutsideAreas.length;i++){
      // a_ : エリア分けされたもの
      var a_PageContainer =  new createjs.Container(); // i番目のエリアのデータが全部入る
      var a_PinContainer = new createjs.Container(); // ピンがいっぱい入る
      // 各エリアの拡大画像の配置 // *p
      var am_img = new createjs.Bitmap("./../img/" + j_mapImgsData.OutsideAreas[i].img);
      var am_size = am_sizes[i];
      am_imgs.push(am_img);
      // canvasのサイズに画像を合わせる。
      if((canvasElement.width/am_size[0]) * am_size[1] > canvasElement.height){
        // 縦横比が合わないと高さがcanvasを超える問題の対処
        am_img.scaleX = canvasElement.height / am_size[1];
        am_img.scaleY = am_img.scaleX;
        am_img.x = ( (canvasElement.width - am_img.scaleY * am_size[0])/2 );
      }else{
        // scale : 現在のcanvasSize / am_img.width 
        am_img.scaleX = canvasElement.width / am_size[0];
        am_img.scaleY = am_img.scaleX;
      }
      a_PageContainer.addChild(am_img);
      var a_pins =[]; // AreaPins
      var a_pin1Tmp = new createjs.Bitmap("./../img/"+j_mapImgsData.PinImg_1);
      var pin1Size = await getImageSize(a_pin1Tmp); // pinの画像サイズを取得
      for(j=0;j<j_mapImgsData.OutsideAreas[i].pins.length;j++){
        var a_pin = new createjs.Bitmap("./../img/"+j_mapImgsData.PinImg_1);
        a_pin.scaleX = gm_general.scaleX;
        a_pin.scaleY = gm_general.scaleY;
        a_pin.x = j_mapImgsData.OutsideAreas[i].pins[j].x * gm_general.scaleX;
        a_pin.y = j_mapImgsData.OutsideAreas[i].pins[j].y * gm_general.scaleY;
        a_PinContainer.addChild(a_pin);
        var a_pin_rect = new createjs.Shape();
        a_pin_rect.graphics.beginFill("DarkRed");
        a_pin_rect.graphics.drawRect(0,0,pin1Size[0] * a_pin.scaleX,pin1Size[1] * a_pin.scaleY);      
        a_pin_rect.x = a_pin.x;
        a_pin_rect.y = a_pin.y;
        a_pin_rect.alpha = 0.0059; // *z 透明度の変更
        a_PinContainer.addChild(a_pin_rect);
        a_pins.push(a_pin_rect);//pinの上に係る四角形たちを入れる（クリック判定は透明の四角形）
      }
      outSidePins_r.push(a_pins);
      a_PageContainer.addChild(a_PinContainer);
      // Generalへ戻る画像の配置
      var a_toGeneral = new createjs.Bitmap("./../img/" + j_mapImgsData.GotoGeneralImg);
      a_toGeneral.scaleX = gm_general.scaleX;
      a_toGeneral.scaleY = gm_general.scaleY;
      a_toGeneral.x = j_mapImgsData.OutsideAreas[i].goGeneral.x * gm_general.scaleX;
      a_toGeneral.y = j_mapImgsData.OutsideAreas[i].goGeneral.y * gm_general.scaleY;
      a_PageContainer.addChild(a_toGeneral);
      a_toGenerals.push(a_toGeneral);
      areaContainers.push(a_PageContainer);
    }
    // :: 構内マップの配置 -------------------------------------------------------------------
    var cm_img = new createjs.Bitmap("./../img/" + j_mapImgsData.Campus.top);
    var cm_size = await getImageSize(cm_img);
    var c_rects = [];
    var c_balloons = []; // 吹き出したち
    // canvasのサイズに画像を合わせる。
    if((canvasElement.width/cm_size[0]) * cm_size[1] > canvasElement.height){
      // 縦横比が合わないと高さがcanvasを超える問題の対処
      cm_img.scaleX = canvasElement.height / cm_size[1];
      cm_img.scaleY = cm_img.scaleX;
      cm_img.x = ( (canvasElement.width - cm_img.scaleY * cm_size[0])/2 );
    }else{
      // scale : 現在のcanvasSize / am_img.width 
      cm_img.scaleX = canvasElement.width / cm_size[0];
      cm_img.scaleY = cm_img.scaleX;
    }
    InsideTopContainer.addChild(cm_img);
    // :: 構外へ、の矢印
    var toOutsideArrow = new createjs.Bitmap("./../img/" + j_mapImgsData.ToOutsideArrow);　// *p
    // 位置、角度のセット
    toOutsideArrow.scaleX = gm_general.scaleX;
    toOutsideArrow.scaleY = gm_general.scaleY;
    toOutsideArrow.x      = 300 * gm_general.scaleX; // *z 座標を入れよう
    toOutsideArrow.y      = 100 * gm_general.scaleY; // *z
    InsideTopContainer.addChild(toOutsideArrow);
    // :: 構内棟ごとのエリア
    for(i=0;i<j_mapImgsData.Campus.buildingRects.length;i++){
      var c_rect = new createjs.Shape();
      var j_rect = j_mapImgsData.Campus.buildingRects[i];
      c_rect.graphics.beginFill("DarkRed");
      c_rect.graphics.drawRect(0,0,j_rect.width * gm_general.scaleX,j_rect.height * gm_general.scaleY);
      c_rect.x = j_rect.x * gm_general.scaleX; // 位置座標セット
      c_rect.y = j_rect.y * gm_general.scaleY; // 位置座標セット
      c_rect.alpha = 0.5;                   // 透明度      
      c_rect.alpha = 0.0059;                   // 透明度
      InsideTopContainer.addChild(c_rect);
      c_rects.push(c_rect);
    }
    // :: 構内マップに表示される吹き出し
    for(i=0;i<j_mapImgsData.Campus.balloons.length;i++){
      var j_balloon = j_mapImgsData.Campus.balloons[i];
      var c_balloon = new createjs.Bitmap("./../img/" + j_balloon.img);
      c_balloon.scaleX = gm_general.scaleX * 0.26; // *z スケール調整
      c_balloon.scaleY = gm_general.scaleY *0.26; // *z
      c_balloon.x = j_balloon.x * gm_general.scaleX;
      c_balloon.y = j_balloon.y * gm_general.scaleY;
      c_balloons.push(c_balloon);
    }
    //event
    var e_balloons = []; //吹き出しが出ていれば 1 出ていなければ0
    var e_buildNum = [2,3,5,8]; // 棟の番号
    var e_balloonBuildNum = [2,3,8]; // 吹き出しが存在する棟の番号
    for(i=0;i<j_mapImgsData.Campus.balloons.length;i++)e_balloons.push(0);
    EventListener();
    //初期状態にする。
    //全体MAPを表示する。
    DisplayContainer.addChild(OutsideContainer);
    //DisplayContainer.addChild(InsideTopContainer);
    // -- eventListener
    function EventListener(){
      // 構内への矢印に対する処理
      toCampusArrow.addEventListener("click",GtoCtop);
      // 構外への矢印に対する処理
      toOutsideArrow.addEventListener("click",CtoptoG);
      //エリアを示す四角に対する処理
      for(i=0;i<g_rects.length;i++){
        g_rects[i].addEventListener("click",GtoA); 
        g_rects[i].eventParam = i ;
        //エリア内にとんだときに全体エリアに飛ぶ処理
        a_toGenerals[i].addEventListener("click",AtoG);
        a_toGenerals[i].eventParam = i;
        // MAPピンに対する処理
        for(j=0;j<j_mapImgsData.OutsideAreas[i].pins.length;j++){
          outSidePins_r[i][j].addEventListener("click",WriteInfo);
          outSidePins_r[i][j].eventParam  = i;
          outSidePins_r[i][j].eventParam2 = j;
        }
      }
      //構内の棟を示す四角に対する処理 >> 吹き出しの出現
      for(i=0;i<c_rects.length;i++){
        c_rects[i].addEventListener("click",SetBalloon); // CampusTop to Buildings 
        c_rects[i].eventParam = i ;
      }
      //構内の吹き出しに対する処理
    }
    // 全体画面から各エリアへ飛ぶ
    function GtoA(event){
      var i = event.target.eventParam;
      MapChange(OutsideContainer,areaContainers[i]);
    }
    // 構外の各エリアから全体へ
    function AtoG(event){
      var i = event.target.eventParam;
      MapChange(areaContainers[i],OutsideContainer);
    }
    // 全体から構内topへ
    function GtoCtop(event){
      MapChange(OutsideContainer,InsideTopContainer);
    }
    // 構内Topから全体へ
    function CtoptoG(event){
      MapChange(InsideTopContainer,OutsideContainer);
    }
    // 構内Topから吹き出しを出力
    function SetBalloon(event){
      var i = event.target.eventParam;
      // 吹き出しに対応していなければreturn
      var check=false;
      var e_balloonTarget; // 吹き出し対応リストの添え字（吹き出し対応のみ）
      for(j=0;j<e_balloonBuildNum.length;j++){
        if(e_balloonBuildNum[j] == e_buildNum[i]){
          // 吹き出しに対応していたら
          // j : 棟番号がiのときの吹き出し対応リストの添え字
          e_balloonTarget = j ;
          check = true;
          break;
        }
      }
      if(check==false)return;
      //console.log(e_balloonTarget);
      // すでに出ている吹き出しをクリックしたとき
      if(e_balloons[e_balloonTarget] == 1){
        InsideTopContainer.removeChild(c_balloons[e_balloonTarget]);
        e_balloons[e_balloonTarget] = 0;
        return;
      }
      // クリックしたときにほかの吹き出しが開いていた時
      for(var j=0;j<c_balloons.length;j++){
        if(e_balloons[j] == 1){
          InsideTopContainer.removeChild(c_balloons[j]);
          e_balloons[j] =0;
        }
      }
      InsideTopContainer.addChild(c_balloons[e_balloonTarget]);
      e_balloons[e_balloonTarget] = 1;
    }
    // 構内Topから各棟へ
    function CtoptoB(event){
      i = event.target.eventParam;
      console.log(e_buildNum[i]);
    }
    // 現在のページから次のページに切り替わる >>
    function MapChange(CurrentContainer,NextContainer){
      DisplayContainer.removeChild(CurrentContainer);
      DisplayContainer.addChild(NextContainer);
    }
    // 情報を書き込む（DOM出力）
    function WriteInfo(event){
      var i = event.target.eventParam;
      var j = event.target.eventParam2;
      h_shopname.textContent = "エリア"+g_areaTexts[i]+"の"+j+"番目";
    }
  }// ここまでmain
  //Resize
  window.addEventListener('resize' , function(){
    (!window.requestAnimationFrame) ? this.setTimeout(Sizing) : window,requestAnimationFrame(Sizing);
  })
  // 画面更新
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick",function(){
    stage.update();
    DisplayContainer.updateCache();
  });
}