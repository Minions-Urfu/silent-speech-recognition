URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;

var recordButton = document.getElementById("start-rec");
var textBlock = document.getElementById("text")
//add events to those 3 buttons 
recordButton.addEventListener("click", startRecording);

function startRecording() {
    var constraints = {
        audio: true,
        video: false
    } 
    /* Disable the record button until we get a success or fail from getUserMedia() */

    recordButton.disabled = true;
    recordButton.classList.add('rec-mod')

    /* We're using the standard promise based getUserMedia()

    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
    let audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
        /* assign to gumStream for later use */
        gumStream = stream;
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        }) 
        //start the recording process 
        rec.record()
        console.log("Recording started");
    }).catch(function(err) {
        //enable the record button if getUserMedia() fails 
        recordButton.disabled = false;
    });

    window.setTimeout(stopRecording, 5000)
}

function stopRecording() {
    console.log("stop");
    recordButton.disabled = false;
    recordButton.classList.remove('rec-mod')

    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(uploadFile);
}

function uploadFile(blob) {
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
    if(this.readyState === 4) {
        console.log("Server returned: ",e.target.responseText);
        textBlock.innerText = e.target.responseText
    }
    };
    var fd=new FormData();
    fd.append("audio_data",blob, "output");
    xhr.open("POST","audio",true);
    xhr.send(fd);
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    document.body.appendChild(au);
}
