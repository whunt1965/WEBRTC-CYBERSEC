# Conducting a MiTM Attack on a WebRTC application
This repository contains our efforts to conduct a MiTM attack on a WebRTC application.

## Introduction to MiTM Attacks

### What is a Man-in-the-Middle (MiTM) Attack?

As defined by [Wikipedia](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) *"a man-in-the-middle...(MITM)... attack is a cyberattack where the attacker secretly relays and possibly alters the communications between two parties who believe that they are directly communicating with each other."*

<div align="center"><a href="url"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Man_in_the_middle_attack.svg" align="center" height="200" width="400" ></a>
  
*Source: By Miraceti - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=5672044*</div>

### Man-in-Middle and WebRTC: Attacking the Signalling Process
While we previously intended to compromise a TURN server in order to perform the attack, further research (specifically [this account](https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/) on a successful WebRTC MiTM attack by Alan Johnston) led us to realize that we needed to begin by compromising the signalling server. A TURN server might offer another mechanism to perform such an attack, but thus far we have been unable to find any accounts of someone successfully using a TURN server to perform a MiTM exploit. 

To pull off this attack, we needed first to better understand how WebRTC signalling works. While there is no "standard" signalling transport mechanism for WebRTC, essentially the idea is that a signalling server provides a mechanism for two peers to exchange the information they need to set up a WebRTC connection (either P2P or through a STUN or TURN server).

The below graphic (pulled from [the santanas GitHub repo](https://github.com/satanas/simple-signaling-server)) provides a nice overview of how signalling works:
<div align="center"><a href="url"><img src="https://raw.githubusercontent.com/satanas/simple-signaling-server/master/doc/RTCPeerConnection-diagram.png" align="center" height="200" width="400" ></a>
  
*Source: https://github.com/satanas/simple-signaling-server*</div>

Our goal here was to use our own "compromised" signalling server so that when two parties used our server to set up a call, they would instead both connect to a third party (our MiTM) would be able to intercept and their media streams without the other two parties' realizing what was happening.

## Setting Up the Attack

As the signalling process for our previous WebRTC application was handled entirely by Firebase, we needed to start fresh with a new application in which we could control the signalling server. So, we pulled the source code for the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0), which is available in [this Github Repository](github.com/googlecodelabs/webrtc-web) as in our "BaseCode" folder (though this code includes some modifications we made when experimenting with the code lab). We chose to use this codelab as a basis because it specifically provides instructions for setting up a signalling server for the application.

While this code seemed simple at first (we simply use a socket IO sever to both run the HTML and support signalling), it proved to be much trickier than we assumed to make the attack work. Ultimately, we manipulated the code to do the following:


## Results

## Why this Attack Matters

## Running on Your own Device
To begin, please visit the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0) and follow the instructions for getting source code and installing necessary dependencies (including NodeJS). 

You can then clone our repo to get the source files. 

From your command line in the local directory into which you've cloned the repo, run "npm install" (to install the necessary Node.js dependencies) and then "node index.js" to set up the local signalling server.

In your browser, visit localhost:8080. For the first session, set your room as 'mitm' (this is the attacker's room). Open 2 more tabs to localhost:8080 and choose whatever room name you would like.

In the "Attacker" tab, you will see and/hear the video from the other tabs. Note: in Google Chrome, only one user's video is available in the attacker tab (in Safari, both will be visible).

## Looking Ahead: Sprint 4
