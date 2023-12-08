URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;

window.MediaRecorder = OpusMediaRecorder

let chunks = [];

let startButton = document.getElementsByClassName("start-button")[0];
let stopButton = document.getElementsByClassName("stop-button")[0];
let textBlock = document.getElementsByClassName("window-text")[0];

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", () => {
    setTimeout(stopRecording, 2000);
});

function startRecording() {
    var constraints = {
        audio: true,
        video: false
    } 

    startButton.disabled = true;
    startButton.style.display = "none";
    stopButton.disabled = false;
    stopButton.style.display = "inline";

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        gumStream = stream;

        rec = new MediaRecorder(stream, { mimeType: 'audio/wav' });
        rec.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data)
            }
        }
        rec.start(2000)
    }).catch(function(err) {
        startButton.disabled = false;
        startButton.style.display = "inline";
        stopButton.disabled = true;
        stopButton.style.display = "none";
    });
}

function stopRecording() {
    startButton.disabled = false;
    startButton.style.display = "inline";
    stopButton.disabled = true;
    stopButton.style.display = "none";

    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();

    const blob = new Blob(chunks, { type: "audio/wav" });

    chunks = [];
    uploadFile(blob);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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

    const csrftoken = getCookie('csrftoken');
    console.log(csrftoken);
    xhr.open("POST","audio/",true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken)

    xhr.send(fd);
}
