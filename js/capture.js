const videoEl = document.getElementById('capture-video');
var activeFolder = null;

console.log('List of supported capture options:', navigator.mediaDevices.getSupportedConstraints());

document.getElementById('capture-select-btn').addEventListener('click', async function () {
    var constraints = {
        audio: false,
        video: {
            frameRate: 1,
            contrast: 100,
            cursor: 'never'
        },
        selfBrowserSurface: 'exclude'
    }
    captureStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    if (!captureStream) {
        alert('There was an error!');
    }
    videoEl.srcObject = captureStream;
    videoEl.play();
    console.log(captureStream);
});

// TODO: No UI for saveFile, start button should work as start and stop

function saveFile() {
    var fileName = 'test';
    var fileQuality = 0.95;
    var imgFormat = document.getElementById('capture-img-format').value;
    // Set file ending
    if (imgFormat === 'image/jpeg') {
        var fileEnding = '.jpg';
    } else if (imgFormat === 'image/png') {
        var fileEnding = '.png';
    } else if (imgFormat === 'image/webp') {
        var fileEnding = '.webp';
    }
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

document.getElementById('folder-btn').addEventListener('click', async function () {
    // Open file picker and destructure the result the first handle
    activeFolder = await window.showDirectoryPicker({
        'mode': 'readwrite'
    });
    document.getElementById('folder-name').value = activeFolder.name;
    console.log(activeFolder);
});