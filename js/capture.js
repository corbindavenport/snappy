const videoEl = document.getElementById('capture-video');
var captureStream = null;
var activeFolder = null;
var captureInterval = null;

console.log('List of supported capture options:', navigator.mediaDevices.getSupportedConstraints());

function checkIfReady() {
    if (activeFolder && captureStream.active) {
        document.getElementById('capture-btn').removeAttribute('disabled')
    } else {
        document.getElementById('capture-btn').setAttribute('disabled', 'true')
    }
}

async function selectCaptureTarget() {
    var constraints = {
        audio: false,
        video: {
            frameRate: 1,
            cursor: 'never'
        },
        selfBrowserSurface: 'exclude'
    }
    captureStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    if (!captureStream) {
        alert('There was an error!');
    }
    // Handle capture stop
    captureStream.addEventListener('inactive', function() {
        console.log('Capture stopped');
        document.getElementById('capture-select-status').innerText = 'No capture target selected';
        checkIfReady();
    }, { once: true });
    videoEl.srcObject = captureStream;
    document.getElementById('capture-select-status').innerText = captureStream.id;
    videoEl.play();
    // Check if capture is ready
    checkIfReady();
}

function captureScreenshot() {
    var fileQuality = 0.95;
    var imgFormat = document.getElementById('capture-img-format').value;
    var intervalTime = (parseFloat(document.getElementById('capture-interval').value) * 1000);
    console.log(intervalTime)
    // Set file ending
    if (imgFormat === 'image/jpeg') {
        var fileEnding = '.jpg';
    } else if (imgFormat === 'image/png') {
        var fileEnding = '.png';
    } else if (imgFormat === 'image/webp') {
        var fileEnding = '.webp';
    }
    // Save first file
    saveToDisk(fileEnding, imgFormat, fileQuality)
    // Start capture on loop
    captureInterval = setInterval(saveToDisk, intervalTime, fileEnding, imgFormat, fileQuality);
}

async function saveToDisk(fileEnding, imgFormat, fileQuality) {
    // Get date
    var date = new Date();
    var fileName = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getMilliseconds();
    // Capture image
    var canvas = document.getElementById('capture-canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
    var imgBlob = canvas.toBlob(async function (blob) {
        // Create file
        var file = new File([blob], fileName + fileEnding, {
            lastModified: Date.now(),
            type: imgFormat
        })
        // Write file to storage
        var writeableFile = await activeFolder.getFileHandle(fileName + fileEnding, { create: true })
        var writer = await writeableFile.createWritable()
        await writer.write(file)
        await writer.close()
    }, imgFormat, fileQuality);
}

async function selectFolder() {
    activeFolder = await window.showDirectoryPicker({
        'mode': 'readwrite'
    });
    document.getElementById('folder-select-status').innerText = 'Folder: ' + activeFolder.name;
    // Check if capture is ready
    checkIfReady();
}

// Main buttons

document.getElementById('folder-select-btn').addEventListener('click', function () {
    selectFolder();
});

document.getElementById('capture-select-btn').addEventListener('click', async function () {
    selectCaptureTarget();
});

document.getElementById('capture-btn').addEventListener('click', async function () {
    captureScreenshot();
});