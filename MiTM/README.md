# Conducting a MiTM Attack on a WebRTC application
This repository contains our efforts to conduct a MiTM attack on a WebRTC application.

## Introduction to WebRTC Signalling and MiTM Attacks

## Setting Up the Attack

To begin, we pulled the source code for the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0), which is available in [this Github Repository](//github.com/googlecodelabs/webrtc-web) as well as the various . 

We chose to use this codelab as a basis because it specifically provides instructions for setting up a signalling server for the application. While we previously intended to compromise a TURN server in order to perform the attack, further research (specifically [this account](https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/) on a successful WebRTC MiTM attack by Alan Johnston) led us to realize that we needed to begin by compromising the signalling server.

## Results

## Why this Attack Matters

## Running on Your own Device
To begin, please visit the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0) and follow the instructions for getting source code and installing necessary dependencies (including NodeJS). 

You can then clone our repo to get the source files. 

From your command line in the local directory into which you've cloned the repo, run "npm install" (to install the necessary Node.js dependencies) and then "node index.js" to set up the local signalling server.

In your browser, visit localhost:8080. For the first session, set your room as 'mitm' (this is the attacker's room). Open 2 more tabs to localhost:8080 and choose whatever room name you would like.

In the "Attacker" tab, you will see and/hear the video from the other tabs. Note: in Google Chrome, only one user's video is available in the attacker tab (in Safari, both will be visible). 
