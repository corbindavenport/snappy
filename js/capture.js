const videoEl = document.getElementById('capture-video');
const discordUrl = document.getElementById('discord-webhook-url');
var captureinProgress = false;
var captureStream = null;
var activeFolder = null;
var captureInterval = null;
const browserSupported = (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && (('showDirectoryPicker' in window) || ('createObjectURL' in window.URL)));

function checkIfReady() {
    if (activeFolder && captureStream.active) {
        document.getElementById('capture-btn').removeAttribute('disabled');
    } else {
        document.getElementById('capture-btn').setAttribute('disabled', 'true');
    }
}

async function selectCaptureTarget() {
    var constraints = {
        // Documentation: https://developer.chrome.com/docs/web-platform/screen-sharing-controls
        audio: false,
        video: {
            frameRate: 1,
            cursor: 'never',
            displaySurface: 'window',
            surfaceSwitching: 'exclude',
            resizeMode: 'crop-and-scale',
            aspectRatio: {
                ideal: 1.7777777778
              }
        },
        selfBrowserSurface: 'exclude',
    }
    // Initialize capture stream
    if (document.getElementById('capture-low-latency-mode').checked) {
        constraints.video.frameRate = { ideal: 60, max: 120 };
    }
    captureStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    if (!captureStream) {
        alert('There was an error!');
    }
    // Handle capture stop
    captureStream.getVideoTracks()[0].addEventListener('ended', function () {
        document.getElementById('capture-select-status').innerText = 'No capture target selected';
        sendDiscordMessage('**Capture stopped because the permission was revoked.**');
        stopCapture();
    }, { once: true });
    // Add label to UI
    document.getElementById('capture-select-status').innerText = captureStream.id;
    // Initialize video element
    videoEl.srcObject = captureStream;
    videoEl.play();
    // Check if capture is ready
    checkIfReady();
}

function sendDiscordMessage(message) {
    // Don't send webhook if the text box is blank
    if (!discordUrl.value) {
        return false;
    }
    // Set webhook settings
    const webhookUrl = discordUrl.value;
    const payload = {
        'content': message,
        'username': 'Snappy',
        'avatar_url': 'https://thesnappy.app/img/maskable_icon_x96.png'
    };
    // Send webhook
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
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
    var fileName = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '-' + date.getMilliseconds();
    console.log(fileName);
    console.log(videoEl.videoWidth);
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
        try {
            if (activeFolder === 'legacy') {
                // Use downloads as a fallback
                var a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = fileName + fileEnding;
                a.click();
            } else {
                // Use File System Access API
                var writeableFile = await activeFolder.getFileHandle(fileName + fileEnding, { create: true });
                var writer = await writeableFile.createWritable();
                await writer.write(file);
                await writer.close();
            }
            sendDiscordMessage('Screenshot saved: `' + fileName + fileEnding + '`');
        } catch (e) {
            console.error('Error writing file:', e);
            sendDiscordMessage('Error: ' + e.message);
        }
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
    } catch (e) {
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

function togglePreviewWindow() {
    if (document.pictureInPictureElement === videoEl) {
        document.exitPictureInPicture();
    } else {
        videoEl.requestPictureInPicture();
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

// Button event handlers

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

document.getElementById('capture-preview-btn').addEventListener('click', function () {
    togglePreviewWindow();
})

// Disable all controls if the browser is fully incompatible
if (!browserSupported) {
    // Disable all controls if the browser is fully incompatible
    var disabledEls = '#capture-select-btn, #folder-select-btn, #capture-btn, fieldset';
    document.getElementById('api-unsupported-warning').classList.remove('d-none');
    document.querySelectorAll(disabledEls).forEach(function (el) {
        el.setAttribute('disabled', 'true');
    })
} else if (!('showDirectoryPicker' in window)) {
    // Use regular file downloads as fallback for File System Access API
    document.getElementById('file-access-unsupported-warning').classList.remove('d-none');
    activeFolder = 'legacy';
    document.getElementById('folder-select-btn').setAttribute('disabled', true);
    document.getElementById('folder-select-status').innerText = 'Folder: Downloads'
}

// Prevent page navigation when capture is running
window.addEventListener('beforeunload', function (event) {
    if (captureinProgress) {
        event.returnValue = 'Are you sure you want to close Snappy? You are currently capturing screenshots.'
    }
});

// Save settings automatically to localStorage
document.querySelectorAll('input[type="checkbox"],select,input[type="text"],input[type="number"]').forEach(function (el) {
    el.addEventListener('change', function () {
        const val = (el.checked || el.value || el.innerText);
        localStorage.setItem(el.id, val);
        console.log('Saved setting:', el.id, val);
    })
})

// Load settings from localStorage
Object.entries(localStorage).forEach(function (key) {
    if (document.getElementById(key[0])) {
        console.log('Loaded setting:', key)
        if (document.getElementById(key[0]).type === 'checkbox') {
            document.getElementById(key[0]).checked = JSON.parse(key[1]);
        } else {
            document.getElementById(key[0]).value = key[1];
        }
    }
})