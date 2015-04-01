var timeBtwScans = 3000;
var gCtx = null;
var gCanvas = null;
var gUM = false;
var resultField = document.getElementById("resultField");
var webcam = document.getElementById('webcam');
var sourceSelect = document.getElementById('videoSource');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function gotSources(sourceInfos) {
    for (var i = 0; i !== sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        var option = document.createElement('option');
        option.value = sourceInfo.id;
        if (sourceInfo.kind === 'video') {
            option.text = sourceInfo.label || 'camera ' + (sourceSelect.length + 1);
            sourceSelect.appendChild(option);
        }
    }
    useWebcam();
}

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
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

function initCanvas(can, w, h) {
    gCanvas = document.getElementById(can);
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}

function captureToCanvas() {
    if(gUM)
    {
        try{
            gCtx.drawImage(webcam, 0, 0);
            try{
                qrcode.decode();
            }
            catch(e){       
                setTimeout(captureToCanvas, timeBtwScans);
            };
        }
        catch(e){       
            setTimeout(captureToCanvas, timeBtwScans);
        };
    }
}

function read(a) {
    resultField.value = a;
    resultField.click();
    setTimeout(captureToCanvas, timeBtwScans);
}

function success(stream) {
    webcam.width = 399;
    webcam.height = 300;

    window.stream = stream;
    webcam.src = window.URL.createObjectURL(stream);
    webcam.play();

    gUM = true;
    initCanvas("qr-canvas", 800, 600);
    setTimeout(captureToCanvas, timeBtwScans);
}
        
function useInputFile(reason) {
    gUM = false;
    initCanvas("out-canvas", 399, 300);
    return;
}

function useWebcam() {
    if(window.File && window.FileReader && sourceSelect.length > 0)
    {
        sourceSelect.onchange = useWebcam;
        qrcode.callback = read;
        if (!!window.stream) {
            webcam.src = null;
            window.stream.stop();
        }
        var videoSourceId = sourceSelect.value;
        var constraints = {
        video: {
          optional: [{
            sourceId: videoSourceId
          }]
        }
        };
        navigator.getUserMedia(constraints, success, useInputFile);
    }
    else
    {
        useInputFile(null);
    }
}

function qrcodeInit() {
    if (isCanvasSupported()) {
        if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
            useInputFile(null);
        } else {
            MediaStreamTrack.getSources(gotSources);
        }
    } else {
        error();
    }
}

function qrcodeStop() {
    // Code here
}

function error() {
    // Code here
}

qrcodeInit();