let gumStream;
//stream from getUserMedia() 
let rec;

window.MediaRecorder = OpusMediaRecorder

let chunks = [];

const startButton = document.getElementsByClassName("start-button")[0];
const stopButton = document.getElementsByClassName("stop-button")[0];
const textBlock = document.getElementsByClassName("window-text")[0];

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", () => {
    setTimeout(stopRecording, 2000);
});

function startRecording() {
    const constraints = {
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
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function uploadFile(blob) {
    const data = new FormData();
    data.append("audio_data", blob, "output");

    const csrftoken = getCookie('csrftoken');

    const response = await fetch("/audio/", {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        body: data
    });

    if (response.ok === true) {
        textBlock.innerText = await response.text();
    }
}
