# Conducting a MiTM Attack on a WebRTC application
This repository contains our efforts to conduct a MiTM attack on a WebRTC application.

## Introduction to MiTM Attacks and WebRTC Signalling

### What is a Man-in-the-Middle (MiTM) Attack

As defined by [Wikipedia](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) *"a man-in-the-middle...(MITM)... attack is a cyberattack where the attacker secretly relays and possibly alters the communications between two parties who believe that they are directly communicating with each other."*

<div align="center"><a href="url"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Man_in_the_middle_attack.svg" align="center" height="200" width="400" ></a>
  
*Source: By Miraceti - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=5672044*</div>

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
