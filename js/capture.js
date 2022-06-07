async function startCapture() {
    var previewVid = document.getElementById('capture-video')
    var constraints = {
        audio: false,
        video: true
    }
    captureStream = await navigator.mediaDevices.getDisplayMedia(constraints)
    if (!captureStream) {
        alert('There was an error!')
    }
    previewVid.srcObject = captureStream
    previewVid.play()
    console.log(captureStream)
    // Change button states
    document.getElementById('capture-stop-btn').removeAttribute('disabled')
}

function stopCapture() {
    var previewVid = document.getElementById('capture-video')
    let tracks = previewVid.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    previewVid.srcObject = null;
    document.getElementById('capture-stop-btn').setAttribute('disabled', '')
}

document.getElementById('capture-start-btn').addEventListener('click', function () {
    startCapture()
})

document.getElementById('capture-stop-btn').addEventListener('click', function () {
    stopCapture()
})