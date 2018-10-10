window.addEventListener("load",init);

function init() {
  var canvas = document.getElementById("myCanvas"); 
  //var stage = new createjs.StageGL(canvas);
  //stage.setClearColor('#FFFFFF');
  var stage = new createjs.Stage("myCanvas");
  /*
  if (window.devicePixelRatio) {
    canvas.width *= devicePixelRatio;
    canvas.height *= devicePixelRatio;
    canvas.style.width = String(canvas.width / devicePixelRatio) + "px";
    canvas.style.height = String(canvas.height / devicePixelRatio) + "px";
    stage.scaleX = stage.scaleY = window.devicePixelRatio;
  }  
  */
  
  var circle = new createjs.Shape();
  circle.graphics.beginFill("red").drawCircle(0, 0, 20);
  circle.y = 100;

  var DisplayContainer = new createjs.Container();
  stage.addChild(DisplayContainer);  
  DisplayContainer.addChild(circle);
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", function(){
   circle.x += 5;
   if(canvas.width < circle.x){
     circle.x = 0;
   }
   stage.update();
  });
}