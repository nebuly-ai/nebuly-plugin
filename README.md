# Nebuly plugin
This repo contains the code to use Nebuly's platform as Chrome Plugin for ChatGPT.

## Installation
Clone the repository:
```bash
git clone https://github.com/nebuly-ai/chrome-plugin.git
```

Go to [chrome://extensions/](chrome://extensions/) and enable developer mode. Then click on "Load unpacked extension" and select the folder containing the plugin.

Click on the plugin icon and select "Options". Enter your name and the nebuly API key you want to use.

Now you're all set to dive into Nebuly's platform! Just use ChatGPT like you usually do, and when you want to check out how things are going, just head over to the analytics section on the platform. It's pretty straightforward and gives you a cool look at your stats and activities. Have fun with it!

## How to contribute to the plugin
### Pre-requisites
* You need to install browserify: `npm install -g browserify`
* You need to install @nebuly-ai/javascript sdk: `npm install @nebuly-ai/javascript`
### How to edit the plugin
The files to edit are the following one:
* For the FE actions: `content_sdk.js`. Once the file has been modified it must be built using browserify: `browserify content_sdk.js -o bundle.js`
* For the server-side actions: `background.js` and `content.js`
* The manifest is used to configure the plugin: `manifest.json`
* The setup of the plugin is done in `options.html` and `options.js`.
