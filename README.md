# Welcome!

Homebridge-Sengled-EthanR adds brightness controls to Homebridge-Sengled. 
### Information
This does not install like a normal homebridge plugin because I am very new to this. I'll look into it, though.

[All credit to the original homebridge-sengled, save for my small additions.](https://github.com/j796160836/homebridge-sengled)

#### [Get the plugin files here from the repo!](https://github.com/EthanRDoesMC/homebridge-sengled-ethanr)

### Requirements
- This tutorial is written for Windows, although outside of directories it should work the same on other platforms.
  - My homebridge install is on a Windows PC, sorry!
- homebridge-sengled already installed and set up
- config.js and index.js from the rep

### Installing
Download config.js and index.js from the repo.
Open Windows+R, type %AppData%/Roaming/npm/npm_modules/homebridge-sengled and press enter.
Replace the existing index.js with the one you just downloaded from here.
Open lib/ and replace client.js with the one you just downloaded from here.

Remove your Homebridge from Apple Home and reboot your iPhone or whatever you removed it from.

Then, go to your homebridge config folder and delete "accessories" and "persist". This will clear out any old Homebridge-Sengled devices. 

Re-add your Homebridge back to Apple Home and it should work!

### Known Bugs
- The plugin cannot fetch brightness and has to rely on Apple Home to keep track of that. Any outside changes to brightness (Sengled, Alexa, etc) will not be reflected in Apple Home.
  - I have no idea how to fix this. The information isn't returned in device info.
