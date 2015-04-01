var gCtx = null;
var gCanvas = null;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;

function handleFiles(f) {
	var o = [];
	for(var i = 0; i < f.length; i++) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
			qrcode.decode(e.target.result);
        };
        })(f[i]);
        reader.readAsDataURL(f[i]);	
    }
}

function initCanvas(w, h) {
    gCanvas = document.getElementById("qr-canvas");
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(gUM)
    {
        try{
            gCtx.drawImage(v, 0, 0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function read(a) {
    console.log(a);
    document.getElementById("result").innerHTML = "<a target='_blank' href='" + a + "'>" + a + "</a>";
    alert(a);
}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    v = document.getElementById("webcam");
    v.width = 300;
    v.height = 300;
    if(webkit)
        v.src = window.webkitURL.createObjectURL(stream);
    else if(moz)
    {
        v.mozSrcObject = stream;
        v.play();
    }
    else v.src = stream;
    gUM = true;
    setTimeout(captureToCanvas, 500);
}
		
function error(error) {
    gUM = false;
    return;
}

function load() {
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = read;
        setwebcam();
	}
	else
	{
		document.getElementById("mainbody").innerHTML='<p>Browser not supported</p><br>';
	}
}

function setwebcam() {
    var n = navigator;
    v = document.getElementById("webcam");

    if(n.getUserMedia) n.getUserMedia({video: true, audio: false}, success, error);
    else if(n.webkitGetUserMedia)
    {
        webkit=true;
        n.webkitGetUserMedia({video: true, audio: false}, success, error);
    }
    else if(n.mozGetUserMedia)
    {
        moz=true;
        n.mozGetUserMedia({video: true, audio: false}, success, error);
    }
    else return;

    setTimeout(captureToCanvas, 500);
}
