const videoEl = document.getElementById('capture-video');
var captureinProgress = false;
var captureStream = null;
var activeFolder = null;
var captureInterval = null;
const browserSupported = (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && ('showDirectoryPicker' in window));

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
        document.getElementById('capture-select-status').innerText = 'No capture target selected';
        stopCapture();
    }, { once: true });
    videoEl.srcObject = captureStream;
    document.getElementById('capture-select-status').innerText = captureStream.id;
    videoEl.play();
    // Check if capture is ready
    checkIfReady();
}

function startCapture() {
    console.log('Starting capture...');
    // Change recording state
    captureinProgress = true;
    // Set variables
    var fileQuality = (parseFloat(document.getElementById('capture-img-quality').value) / 100);
    var imgFormat = document.getElementById('capture-img-format').value;
    var intervalTime = (parseFloat(document.getElementById('capture-interval').value) * 1000);
    const btn = document.getElementById('capture-btn');
    // Display app badge if supported
    if ('setAppBadge' in navigator) {
        navigator.setAppBadge();
    }
    // Change button and status state
    btn.classList.remove('btn-success');
    btn.classList.add('btn-danger');
    btn.innerHTML = '<i class="bi bi-record2-fill me-2"></i>Stop capture';
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
    canvas.toBlob(async function (blob) {
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

function stopCapture() {
    console.log('Stopping capture...');
    const btn = document.getElementById('capture-btn');
    // Change recording state
    captureinProgress = false;
    // Stop interval if needed
    try {
        clearInterval(captureInterval);
    } catch(e) {
        console.error('Error stopping interval:', e);
    }
    // Change button and status state
    btn.classList.remove('btn-danger');
    btn.classList.add('btn-success');
    btn.innerHTML = '<i class="bi bi-record2 me-2"></i>Start capture';
    checkIfReady();
    // Remove app badge
    if ('setAppBadge' in navigator) {
        navigator.clearAppBadge();
    }
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
    if (captureinProgress) {
        stopCapture();
    } else {
        startCapture();
    }
});

// Show compatibility warning if browser is missing APIs
if (!browserSupported) {
    document.getElementById('api-unsupported-warning').classList.remove('d-none');
}