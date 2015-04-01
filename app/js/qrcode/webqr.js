'use strict';

var timeBtwScans = 3000;
var gCtx = null;
var gCanvas = null;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;
var resultField = document.getElementById("resultField");
var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function gotSources(sourceInfos) {
  for (var i = 0; i !== sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.id;
    if (sourceInfo.kind === 'video') {
      option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

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
                setTimeout(captureToCanvas, timeBtwScans);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, timeBtwScans);
        };
    }
}

function read(a) {
    resultField.value = a;
    resultField.click();
    setTimeout(captureToCanvas, timeBtwScans);
}   

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    v = document.getElementById("webcam");
    v.width = 300;
    v.height = 300;

    window.stream = stream; // make stream available to console
    v.src = window.URL.createObjectURL(stream);
    v.play();

    gUM = true;
    setTimeout(captureToCanvas, timeBtwScans);
}
        
function error(error) {
    gUM = false;
    return;
}

function start() {
    if(isCanvasSupported() && window.File && window.FileReader)
    {
        initCanvas(800, 600);
        qrcode.callback = read;
        if (!!window.stream) {
            videoElement.src = null;
            window.stream.stop();
        }
        var videoSource = videoSelect.value;
        var constraints = {
        video: {
          optional: [{
            sourceId: videoSource
          }]
        }
        };
        navigator.getUserMedia(constraints, success, error);
    }
    else
    {
        document.getElementById("mainbody").innerHTML='<p>Browser not supported</p><br>';
    }
}

if (typeof MediaStreamTrack === 'undefined' ||
    typeof MediaStreamTrack.getSources === 'undefined') {
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
} else {
  MediaStreamTrack.getSources(gotSources);
}

videoSelect.onchange = start;

start();