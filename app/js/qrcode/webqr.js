var displayed = false;
var timeBtwScans = 3000;
var gCtx = null;
var gCanvas = null;
var running = false;
var resultField = document.getElementById("resultField");
var webcam = document.getElementById('webcam');
var sourceSelect = document.getElementById('videoSource');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function gotSources(sourceInfos) {
    sourceSelect.innerHTML = "";
    sourceSelect.onchange = useWebcamWithSources;
    for (var i = 0; i !== sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        var option = document.createElement('option');
        option.value = sourceInfo.id;
        if (sourceInfo.kind === 'video') {
            option.text = sourceInfo.label || 'camera ' + (sourceSelect.length + 1);
            sourceSelect.appendChild(option);
        }
    }
    document.getElementById('videoSourceDiv').style.display = "block";
    useWebcamWithSources();
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
    if(running)
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

    running = true;
    initCanvas("qr-canvas", 800, 600);
    setTimeout(captureToCanvas, timeBtwScans);
    document.getElementById("add_survey_webcam").style.display = "block";
    document.getElementById("add_survey").style.display = "block";
}
        
function useInputFile(reason) {
    document.getElementById("add_survey_webcam").style.display = "none";
    document.getElementById('videoSourceDiv').style.display = "none";
    running = false;
    initCanvas("out-canvas", 399, 300);
    document.getElementById("add_survey_file").style.display = "block";
    document.getElementById("add_survey").style.display = "block";
}

function useWebcamWithSources() {
    if(window.File && window.FileReader && sourceSelect.length > 0) {
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
    } else {
        useInputFile(null);
    }
}

function useWebcamWithoutSource() {
    if(navigator.getUserMedia)
        navigator.getUserMedia({video: true, audio: false}, success, error);
    else
        useInputFile(null);
}

function qrcodeStop() {
    document.getElementById("add_survey_file").style.display = "none";
    document.getElementById("add_survey_webcam").style.display = "none";
    document.getElementById('videoSourceDiv').style.display = "none";
    webcam.pause();
    if (!!window.stream) {
        webcam.src = null;
        window.stream.stop();
    }
    running = false;
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
}

function error() {
    // Code here
}

function qrcodeInit() {
    if (!displayed) {
        displayed = true;
        if (isCanvasSupported()) {
            qrcode.callback = read;
            if (typeof MediaStreamTrack === 'undefined') {
                useInputFile(null);
            } else {
                if (typeof MediaStreamTrack.getSources === 'undefined') {
                    useWebcamWithoutSource();
                } else {
                    MediaStreamTrack.getSources(gotSources);
                }
            }
        } else {
            error();
        }
    } else {
        document.getElementById("add_survey").style.display = "none";
        displayed = false;
        qrcodeStop();
    }
}