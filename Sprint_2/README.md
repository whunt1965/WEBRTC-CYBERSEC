
# Sprint 2

## Overview
In Sprint 2, we sought to define the overall architecture and produce some initial findings for our project. Sprint2 was largely spent on engaging in the following activities:
  * Better understanding WebRTC API's (and how they might be misused) by creating simple javascript-based web programs that attempt to exploit these API's.
  * Deploying a WebRTC-based application and exploring security holes.
  * Building our own TURN server to understand how this technology works (wihin the domain of WebRTC), as well as set ourselves up to later use this server in an attempt to execute a MiTM attack
  
## Repository Contents
  * **Exploit Test Scripts:** This folder contains two test scripts which show how WebRTC can be abused in the browser.
    * *force_camera.html:* Contains a simple HTML/JS file which traps a user in an alert cycle until they give up access to their camera. The purpose of this script is to show how easy it is for a user to give up camera/microphone access (and how a user might simply do so to avoid inconveniences). 
    * *your_ip.html:* This HTML/JS file whose JS script (taken directly from the [VoidSec Github Repo](https://github.com/VoidSec/WebRTC-Leak) uses WebRTC to retrieve a user's IP address and prints it to window. The purpose of this script is to show how WebRTC can easily leak a user's IP address with no action from the user themselves. 
  * **WebRTC_App:** This folder contains the public scripts for a simple WebRTC app developed using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution). When run with app.js, the application simply allows two users to engage in a WebRTC video conference call (using Firebase as the signalling server). However, when run with app_mal.js, the application effectively bugs the computer (retains access to camera/microphone) after a user hangs up (until they close the browser). app_mal_2.js and app_mal_3.js include attempts to further epxloit this vulnerability (eg, reopening peer connections, etc.) that were unsuccessful. Meanwhile, app_mal_4.js extends the attack by attempting to perform the call into a pop-up window and hiding the window on the bugged computer after hangup. 
  
  * **Server Folder...**

## Architecture and Technology Selections
As part of Sprint 2, we also sought to definite our architecture and technology selections for the rest of the project.
### WebRTC App
Our WebRTC app is a simple application developed using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution). We initial chose this application because although it has a simple architecture, it provides a nice demonstration of the core WebRTC API's for video conferencing. Moreover, this application is actually provided on WebRTC.org as a "getting started" [codelab](https://webrtc.org/getting-started/firebase-rtc-codelab) for WebRTC developers, which means that many of its core features may be replicated in other WebRTC applications. By following this demo, we also have the benefit of deploying our application on Firebase (allowing us to test the features online vs. only using a local host), and we have free access to a Firestore DB for logging information from our sessions.

Our application (like most WebRTC apps) is built in javascript allowing us to directly leverage the core WebRTC API's. Additionally, we have a front-end interface built using html to allow the application to be utilized via the browser. 
### Signalling Server

## Demos

