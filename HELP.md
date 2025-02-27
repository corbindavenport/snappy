### Why doesn't Snappy work in my browser?

Snappy uses the [File System Access API](https://caniuse.com/native-filesystem-api) to save screenshots to a specified folder, as well as the [getDisplayMedia API](https://caniuse.com/mdn-api_mediadevices_getdisplaymedia) to capture screens, windows, and browser tabs. As of May 2023, the File System Access API is only fully supported on the desktop versions of Google Chrome and other Chromium-based browsers (Edge, Vivaldi, etc.), while the getDisplayMedia API is available on all modern desktop browsers to some extent.

Snappy can download screenshots in browsers that don't support the File System Access API, but this can be more unreliable.

### How can I install Snappy?

In Google Chrome, click the three dots menu button in the toolbar, then select "Install Snappy." In Microsoft Edge, click the three dots menu, then navigate to Apps > Install Snappy.

### Why can't I capture a specific window or tab?

Some browsers only allow Snappy to capture screens and/or individual windows. Chromium-based browsers, like Google Chrome, Microsoft Edge, Vivaldi, and others should support all capture options.

### How can I save screenshots to cloud storage?

If you create a folder inside your device's cloud storage folder (e.g. OneDrive, iCloud Drive, etc.), and set that as the selected folder in Snappy, your images will be synchronized to the cloud as they are captured. Snappy does not have a built-in upload feature.

### How can I prevent notifications and other elements from covering the screenshot?

This depends on the browser and operating system, but *generally*, selecting an individual window instead of a screen will hide content like system notifications.

### Does Snappy require an internet connection?

Snappy works offline after it is loaded for the first time. You can test it by disconnecting your device from all networks, and navigating to [thesnappy.app](https://thesnappy.app/) in your web browser.