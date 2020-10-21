# WEBRTC-CYBERSEC
**Boston University EC601 Term Project:** *Testing security vulnerabilities in WebRTC technologies.*

**Authors: Wiley Hunt and Apollo Lo**

Our project involves exploring vulnerabilities in WebRTC and associated applications. Specific findings, test scripts, and applications may be found in the individual "Sprint X" folders of this repository. The contents of each folder are briefly described below. 

## Contents
* Sprint 1 -- Contains a README.md file with an overview of our project goals, user stories, and minimum viable product
* Sprint 2 -- Our initial work at developing malicious HTML scripts (exploiting WebRTC API's), a malicious WebRTC application, and a compromised Turn Server (to conduct MiTM attacks)

# Sprint 1

## Project Mission
Conduct an intensive exploration in how WebRTC technologies can be exploited to better understand how malicious hackers might perform attacks.

## Minimum Viable Product (MVP)
As an initial step in this exploration, we will:
* Experiment with WebRTC JavaScript API's to see how they might be be abused
* Create a malicious WebRTC application to take control of user media
* Create a malicious TURN server to execute MiTM attacks

## User Stories
WebRTC is widely available in popular browsers and the technology is becoming increasingly common (WebRTC is used by number of well-known applications, such as Google Hangouts and Facebook Messenger). As such, it's important that even the casual user understand any potential vulnerabilities that the the WebRTC in their browser might have or how malicious Javascript could be used to access user media devices (or capture information such as a user's IP). 

Additionally, as more and more users are turning to WebRTC enabled video conference solutions, it is paramount that individuals and organizations understand how these might technologies might be exploited (for example, how cameras/microphones might be abused or even third parties might intercept sensitive communications).

Our research will attempt to provide some insight into these potential vulnerabilities. 

## Sprint 2 Goals
In Sprint 2, we will seek to:
* Create initial malicious WebRTC application
  * Explore how we can manipulate features such as GetUserMedia() 
  * Areas of exploration:
   * Forcing access to camera/microphone
   * Retaining camera/microphone access when user leaves page
   * Signaling to third party without user’s knowledge
* Further explore and begin working on TURN server to execute MiTM attack in later Sprints

## Technologies to be Used
This project will leverage a number of technologies. In particualar, we will make heavy use of Javascript (as many of the WebRTC API's are JS API's). Moreover, for Sprint 2 studies, we will leverage a basic WebRTC application built through a (Firebase + WebRTC CodeLab)[https://webrtc.org/getting-started/firebase-rtc-codelab] as a starting point for our malicious WebRTC application. 

## Development Environment
For this project, we will use basic IDE's for scripting as well as specific platforms for particular WebRTC exploits we explore (eg, Firebase for our malicious application, and a Virtual Machine to host our malicious TURN server).

## Literature Review
Our Project builds on the extensive literature available on WebRTC security (which we explored in teh initial phase of the project). A non-comprehensive list of key works that we've analyzed is included below:
* Aumasson, JP and Verview, M. “HUNTING FOR VULNERABILITIES IN SIGNAL - HITBSECCONF2017 AMSTERDAM.” https://conference.hitb.org/hitbsecconf2017ams/materials/D2T1%20-%20Markus%20Vervier%20-%20Hunting%20for%20Vulnerabilities%20in%20Signal.pdf (Accessed 9/11/2020).
* De Groef, W., Subramaniam, D., Johns, M., Piessens, F., Desmet, L. (2016). “Ensuring endpoint authenticity in WebRTC peer-to-peer communication.” https://core.ac.uk/download/pdf/34663061.pdf (Accessed 9/7/2020).
* Feher, B., Sidi, L., Shabtai, A., Puzis, R., and Marozas, L. (2018). “WebRTC security measures and weaknesses.” International Journal of Internet Technology and Secured Transactions (IJITST), Vol. 8, No. 1, 2018. https://www.researchgate.net/publication/325589071_WebRTC_security_measures_and_weaknesses (Accessed 9/4/2020).
* Hancke, P. (2018). “Let’s get better at fuzzing in 2019 – here’s how.” https://webrtchacks.com/lets-get-better-at-fuzzing-in-2019-heres-how/ (Accessed 9/11/2020).
* Johnston, Alan (2015). “WebRTC and Man in the Middle Attacks.” https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/ (Accessed 9/8/2020).
* Leaver, E. (2015). “A Study of WebRTC Security.” https://github.com/webrtc-security/webrtc-security.github.io (Accessed 9/4/2020).
* Li, Vickie (2019). “Hacking the Same-Origin Policy.” Medium. https://medium.com/swlh/hacking-the-same-origin-policy-f9f49ad592fc (Accessed 9/7/2020).
*	Rescorla, E. (2019) “Security Considerations for WebRTC, draft-ietf-rtcweb-security-12.” https://tools.ietf.org/html/draft-ietf-rtcweb-security-12 (Accessed 9/4/2020).
* Silvanovich, N. (2018) “Adventures in Video Conferencing Part 1: The Wild World of WebRTC.” https://googleprojectzero.blogspot.com/2018/12/adventures-in-video-conferencing-part-1.html (Accessed 9/9/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 1” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-1.html (Accessed 9/5/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 2.” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html (Accessed 9/5/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 3.” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-3.html (Accessed 9/5/2020).
* W3C Interest Group (2019). “Mitigating Browser Fingerprinting in Web Specifications.” https://www.w3.org/TR/fingerprinting-guidance/ (Accessed 9/9/2020).
* Wells, D. (2020) “Abusing WebRTC to Reveal Coarse Location Data in Signal.” Medium. https://medium.com/tenable-techblog/turning-signal-app-into-a-coarse-tracking-device-643eb4298447 (Accessed 9/11/2020).


# Sprint 2

## Overview
In Sprint 2, we sought to better understand WebRTC technology, define the overall architecture, and produce some initial findings for our project. Sprint2 was largely spent on engaging in the following activities:
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
  
  * **Server Folder**
    * Includes configuration files and set up instructions.

## Architecture and Technology Selections
As part of Sprint 2, we also sought to definite our architecture and technology selections for the rest of the project. As our project is more havily focused on research than product design, we recognize that our architure may evolve over time. However, the minimum architecture required for this project is a WebRTC application and our own Turn Server.  
### WebRTC App
For our initial testing in Sprint 2, we created a simple WebRTC application using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution). We initially chose this application because although it has a simple architecture, it provides a nice demonstration of the core WebRTC API's for video conferencing. Moreover, this application is actually provided on WebRTC.org as a "getting started" [codelab](https://webrtc.org/getting-started/firebase-rtc-codelab) for WebRTC developers, which means that many of its core features may be replicated in other WebRTC applications. By following this demo, we also have the benefit of deploying our application on Firebase (allowing us to test the features online vs. only using a local host), and we have free access to a Firestore DB for logging information from our sessions.

Our application (like most WebRTC apps) is built in javascript allowing us to directly leverage the core WebRTC API's. Additionally, we have a front-end interface built using html to allow the application to be utilized via the browser. 

While this application provides a nice sandbox for learning the technology and developing initial tests, it may be too simple for further tests beyond simply capturing video/mic streams. As such, we are also exploring how we might replicate these vulnerabilities on more well-known open-source WebRTC applications. Indeed, we currently have an instance of Jitsi running on a Google VM, and intend to explore how we might alter its source code to replicate some of the vulnerabilities that we have already found as part of Sprint 3. 

### Turn Server
STUN/TURN server is on the process of being set up for this project. The server is currently being hosted on Google Cloud with its IP address connected to the domain name buec601turnservers.com . This server will be used in our WebRTC app to initiate peer to peer connection. The plan is that with the server set up with malicious scripts, it can access personal information from users that are using WebRTC. 

## Demos
Shown live in class via deployed application.

## Sprint 3
As we were ultimately unsucessful in deploying our TURN server and conducting a MiTM attack for Sprint2, we will focus on this piece in Sprint 3. Our Simple WebRTC Application provides an ability to enumerate STUN/TURN servers (which we have ensured are actually utilized through testing trying to run the application without them), so we should be able to add our own TURN server once deployed. From there, we will seek to open another session whenever our Turn server is accessed so we can insert a third-party listener (a Man-in-the-Middle). 

Additionally, if we are successful in deploying the server, we will also begin seeing if we can replicate any parts of our attack on the Jitsi WebRTC application. We currently have our own instance of Jitsi running, so we will first need to ensure that we can modify the source code and re-deplpoy it (we are not certain we can do this). If this is possible, we can then search through the Jitsi source code and find the relevant functions controlling TURN/ICE server usage and session creation/termination. We will then attempt to make similar alterations to enable a session to remain open after a user hangs up. 





