
# Sprint 2

## Overview
In Sprint 2, we sought to define the overall architecture and produce some initial findings for our project.

## Architecture and Technology Selections
Our architecture for the project is as follows:
### WebRTC App
Our WebRTC app is a simple application developed using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution). We initial chose this application because although it has a simple architecture, it provides a nice demonstration of the core WebRTC API's for video conferencing. Moreover, this application is actually provided on WebRTC.org as a "getting started" [codelab](https://webrtc.org/getting-started/firebase-rtc-codelab) for WebRTC developers, which means that many of its core features may be replicated in other WebRTC applications. By following this demo, we also have the benefit of deploying our application on Firebase (allowing us to test the features online vs. only using a local host), and we have free access to a Firestore DB for logging information from our sessions.

Our application (like most WebRTC apps) is built in javascript allowing us to directly leverage the core WebRTC API's. Additionally, we have a front-end interface built using html to allow the application to be utilized via the browser. 
### Signalling Server

## Demos

