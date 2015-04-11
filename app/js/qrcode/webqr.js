var useWebcam = false;
var displayed = false;
var timeBtwScans;
var gCtx = null;
var gCanvas = null;
var running = false;
var resultField = document.getElementById("resultField");
var webcam = document.getElementById('webcam');
var sourceSelect = document.getElementById('videoSource');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

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
    if (f.length != 0) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
                qrcode.decode(e.target.result);
            };
        })(f[0]);
        reader.readAsDataURL(f[0]); 
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

function cameraPause(p) {
    if (useWebcam) {
        if (p) {
            running = false;
            webcam.pause();
        } else {
            running = true;
            webcam.play();
            setTimeout(captureToCanvas, timeBtwScans);
        }
    }
}

function read(a) {
    angular.element(document.getElementById("mySurveysMain")).scope().addSurvey(a);
}

function success(stream) {
    webcam.width = 399;
    webcam.height = 300;

    if (detectmob)
        timeBtwScans = 2000;
    else
        timeBtwScans = 500;

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
    if (useWebcam)
        error(0, "Votre navigateur n'est pas compatible pour l'utilisation de la caméra / aucune caméra détectée / permission non accordée.");
    useWebcam = false;
    document.getElementById("add_survey_webcam").style.display = "none";
    document.getElementById('videoSourceDiv').style.display = "none";
    running = false;
    initCanvas("out-canvas", 399, 300);
    document.getElementById("add_survey_file").style.display = "block";
    document.getElementById("add_survey").style.display = "block";
}

function useWebcamWithSources() {
    useWebcam = true;
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
        error(0, "Votre navigateur n'est pas compatible pour l'utilisation de la caméra / aucune caméra détectée / permission non accordée.");
        useInputFile(null);
    }
}

function useWebcamWithoutSource() {
    useWebcam = true;
    if(navigator.getUserMedia)
        navigator.getUserMedia({video: true, audio: false}, success, useInputFile);
    else {
        error(0, "Votre navigateur n'est pas compatible pour l'utilisation de la caméra / aucune caméra détectée / permission non accordée.");
        useInputFile(null);
    }
}

function qrcodeStop() {
    document.getElementById("add_survey_file").style.display = "none";
    document.getElementById("add_survey_webcam").style.display = "none";
    document.getElementById('videoSourceDiv').style.display = "none";
    document.getElementById('add_survey_error').style.display = "none";
    webcam.pause();
    if (!!window.stream) {
        webcam.src = null;
        window.stream.stop();
    }
    running = false;
    if (gCtx != null)
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
}

// Type 0 = warning, Type 1 = error
function error(type, message) {
    var errorElement = document.getElementById('add_survey_error');
    if (type == 0)
        errorElement.style.color = "orange";
    else if (type == 1)
        errorElement.style.color = "red";
    errorElement.innerHTML = message;
    errorElement.style.display = "block";
}

function qrcodeInit() {
    if (!displayed) {
        displayed = true;
        if (isCanvasSupported()) {
            qrcode.callback = read;
            if (typeof MediaStreamTrack === 'undefined') {
                error(0, "Votre navigateur n'est pas compatible pour l'utilisation de la caméra / aucune caméra détectée / permission non accordée.");
                useInputFile(null);
            } else {
                if (typeof MediaStreamTrack.getSources === 'undefined') {
                    useWebcamWithoutSource();
                } else {
                    MediaStreamTrack.getSources(gotSources);
                }
            }
        } else {
            error(1, "Votre navigateur n'est pas compatible avec cette fonctionnalité. Veuillez le mettre à jour ou utiliser un navigateur compatible");
        }
    } else {
        document.getElementById("add_survey").style.display = "none";
        displayed = false;
        qrcodeStop();
    }
}

function switchToFile() {
    qrcodeStop();
    useWebcam = false;
    useInputFile();
}

function switchToWebcam() {
    qrcodeStop();
    if (typeof MediaStreamTrack === 'undefined') {
        error(0, "Votre navigateur n'est pas compatible pour l'utilisation de la caméra / aucune caméra détectée / permission non accordée.");
        useInputFile(null);
    } else {
        if (typeof MediaStreamTrack.getSources === 'undefined') {
            useWebcamWithoutSource();
        } else {
            MediaStreamTrack.getSources(gotSources);
        }
    }
}