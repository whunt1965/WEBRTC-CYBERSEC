# Repository Contents
## Exploit Test Scripts: 
This folder contains two test scripts which show how WebRTC can be abused in the browser.
 * *force_camera.html:* Contains a simple HTML/JS file which traps a user in an alert cycle until they give up access to their camera. The purpose of this script is to show how easy it is for a user to give up camera/microphone access (and how a user might simply do so to avoid inconveniences). 
 * *your_ip.html:* This HTML/JS file whose JS script (taken directly from the [VoidSec Github Repo](https://github.com/VoidSec/WebRTC-Leak) uses WebRTC to retrieve a user's IP address and prints it to window. The purpose of this script is to show how WebRTC can easily leak a user's IP address with no action from the user themselves. 

To run these files, simply open the HTML in a WebRTC-enabled browser (eg Google Chrome or Mozilla Firefox).

## Malicious WebRTCApps:
This folder contains the public scripts for a simple WebRTC app developed using the Firebase RTC Codelab [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution) and subsequently modified to exploit users.
 * *WebRTC_App_initial:* Our first successful attempt at exploiting a WebRTC application! When run with app.js, the application simply allows two users to engage in a WebRTC video conference call (using Firebase as the signalling server). However, when run with app_mal.js, the application effectively bugs the computer (retains access to camera/microphone) after a user hangs up (until they close the browser). To understand how this works, consider the scenario of 2 users (User 1 and User 2) using this application for a video chat.
     * When User 1 hangs up, the call appears to have ended on their side (video feeds are disabled on the User 1's screen, although camera/microphone indicators via the browser/the user's hardware will remain on).
     * However, User 2 will actually still have access to User 1's camera and microphone! So, anything User 1 says or does (including executing another call on the app) can be obseved by User 2! Notably, though, if User 1 simply closes the browser or the tab, the connection will be lost. This led us to making further modifications to our malicious application in *WebRTC_App.*
 * *WebRTC_App:* A modified version of WebRTC_App initial that leverages the fact that browsers allow client-side JS to control pop-up windows that JS creates. Again, when this application is run with app.js, it simply provides a WebRTC calling service (where calls take place in new pop-up windows). However, when executed with appmal_new.js, the application executes the same attack as above, but with a slight modification: 
      * When User 1 hangs up, their calling window is minimized (to the extent allowed by the browser) and moved to a corner of the screen. This makes it more difficult for User 1 to realize that their call is still open if they don't see that the calling window has simply moved! Even if they do see the window, the streams will still appear to be disabled (no video will show).
      * Meanwhile, as in the case above, User 2 will still have access to User 1's camera and microphone!
      * Notably, this modification only appears to work on Safari (and other browsers which permit the usage of the JS function window.resizeTo() to chnage the size of a pop-up window. Chrome for example, does not allow this functionality, thus rendering this modification ineffective.
 
To run these files, you will need to follow the instructions in the [Firebase+WebRTC codelab](https://webrtc.org/getting-started/firebase-rtc-codelab) to set up Firebase access (which is used for signalling) and clone the [solution code](https://github.com/whunt1965/FirebaseRTC/tree/solution) for the application. 

To run the initial version of the attack, simply replace the index.html and app.js files in the solution code (in the public folder) with the index.html and app_mal2.js files from the WebRTC_App_initial folder. 

To run the second version of the attack, you will need to replace the index.html and app.js files in the solution code (in the public folder) with the index.html and appmal_new.js files from the WebRTC_App_initial folder as well as import the remaining files in this folder into the public folder of your Firebase project.

In either case, the attack code can either be run in the local browser (with the command firebase emulate:hosting) or deployed live (with the command firebase deploy --only hosting).
  
## Turn_server_config
This folder includes initial configuration files and set up instructions for a TURN server (which is a critical piece of WebRTC session enablement).

