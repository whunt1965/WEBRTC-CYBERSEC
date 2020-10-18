
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
  * **WebRTCApps:** These folder contains the public scripts for a simple WebRTC app developed using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution) and subsequently modified to exploit users.
    * *WebRTC_App_initial:* Our first successful attempt at exploiting a WebRTC application! When run with app.js, the application simply allows two users to engage in a WebRTC video conference call (using Firebase as the signalling server). However, when run with app_mal.js, the application effectively bugs the computer (retains access to camera/microphone) after a user hangs up (until they close the browser). To understand how this works, consider the scenario of 2 users (User 1 and User 2) using this application for a video chat.
      * When User 1 hangs up, the call appears to have ended on their side (video feeds are disabled on the User 1's screen, although camera/microphone indicators via the browser/the user's hardware will remain on).
      * However, User 2 will actually still have access to User 1's camera and microphone! So, anything User 1 says or does (including executing another call on the app) can be obseved by User 2! Notably, though, if User 1 simply closes the browser or the tab, the connection will be lost. This led us to making further modifications to our malicious application in *WebRTC_App.*
    * *WebRTC_App:* A modified version of WebRTC_App initial that leverages the fact that browsers allow client-side JS to control pop-up windows that JS creates. Again, when this application is run with app.js, it simply provides a WebRTC calling service (where calls take place in new pop-up windows). However, when executed with appmal_new.js, the application executes the same attack as above, but with a slight modification: 
      * When User 1 hangs up, their calling window is minimized (to the extent allowed by the browser) and moved to a corner of the screen. This makes it more difficult for User 1 to realize that their call is still open if they don't see that the calling window has simply moved! Even if they do see the window, the streams will still appear to be disabled (no video will show).
      * Meanwhile, as in the case above, User 2 will still have access to User 1's camera and microphone!
      * Notably, this modification only appears to work on Safari (and other browsers which permit the usage of the JS function window.resizeTo() to chnage the size of a pop-up window. Chrome for example, does not allow this functionality, thus rendering this modification ineffective.
  
  * **Server Folder...**

## Architecture and Technology Selections
As part of Sprint 2, we also sought to definite our architecture and technology selections for the rest of the project. As our project is more havily focused on research than product design, we recognize that our architure may evolve over time. However, the minimum architecture required for this project is a WebRTC application and our own Turn Server.  
### WebRTC App
For our initial testing in Sprint 2, we created a simple WebRTC application using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution). We initially chose this application because although it has a simple architecture, it provides a nice demonstration of the core WebRTC API's for video conferencing. Moreover, this application is actually provided on WebRTC.org as a "getting started" [codelab](https://webrtc.org/getting-started/firebase-rtc-codelab) for WebRTC developers, which means that many of its core features may be replicated in other WebRTC applications. By following this demo, we also have the benefit of deploying our application on Firebase (allowing us to test the features online vs. only using a local host), and we have free access to a Firestore DB for logging information from our sessions.

Our application (like most WebRTC apps) is built in javascript allowing us to directly leverage the core WebRTC API's. Additionally, we have a front-end interface built using html to allow the application to be utilized via the browser. 

While this application provides a nice sandbox for learning the technology and developing initial tests, it may be too simple for further tests beyond simply capturing video/mic streams. As such, we are also exploring how we might replicate these vulnerabilities on more well-known open-source WebRTC applications. Indeed, we currently have an instance of Jitsi running on a Google VM, and intend to explore how we might alter its source code to replicate some of the vulnerabilities that we have already found as part of Sprint 3. 

### Turn Server

## Demos
Shown live in class via deployed application.

## Sprint 3
As we were ultimately unsucessful in deploying our TURN server and conducting a MiTM attack for Sprint2, we will focus on this piece in Sprint 3. Our Simple WebRTC Application provides an ability to enumerate STUN/TURN servers (which we have ensured are actually utilized through testing trying to run the application without them), so we should be able to add our own TURN server once deployed. From there, we will seek to open another session whenever our Turn server is accessed so we can insert a third-party listener (a Man-in-the-Middle). 

Additionally, we will begin seeing if we can replicate any parts of our attack on the Jitsi WebRTC application. We currently have our own instance of Jitsi running, so we will first need to ensure that we can modify the source code and redelpoy it (we are not certain we can do this). If this is possible, we can then search through the Jitsi source code and find the relevant functions controlling session creation/termination, and see if we can make similar alterations to enable a session to remain open after a user hangs up. 

