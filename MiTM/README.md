# Conducting a MiTM Attack on a WebRTC application
This repository contains our efforts to conduct a MiTM attack on a WebRTC application.

## Introduction to MiTM Attacks

### What is a Man-in-the-Middle (MiTM) Attack?

As defined by [Wikipedia](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) *"a man-in-the-middle...(MITM)... attack is a cyberattack where the attacker secretly relays and possibly alters the communications between two parties who believe that they are directly communicating with each other."*

<div align="center"><a href="url"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Man_in_the_middle_attack.svg" align="center" height="200" width="400" ></a>
  
*Source: By Miraceti - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=5672044*</div>

### Man-in-Middle and WebRTC: Attacking the Signalling Process
While we previously intended to compromise a TURN server in order to perform the attack, further research (specifically [this account](https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/) on a successful WebRTC MiTM attack by Alan Johnston) led us to realize that we needed to begin by compromising the signalling server. A TURN server might offer another vector to perform such an attack, but thus far we have been unable to find any accounts of someone successfully using a TURN server to perform a MiTM exploit. 

To pull off this attack, we needed first to better understand how WebRTC signalling works. While there is no "standard" signalling transport mechanism for WebRTC, essentially the idea is that a signalling server provides a mechanism for two peers to exchange the information they need to set up a WebRTC connection (either P2P or through a STUN or TURN server).

The below graphic (pulled from [the santanas GitHub repo](https://github.com/satanas/simple-signaling-server)) provides a nice overview of how signalling works:
<div align="center"><a href="url"><img src="https://raw.githubusercontent.com/satanas/simple-signaling-server/master/doc/RTCPeerConnection-diagram.png" align="center"></a>
  
*Source: https://github.com/satanas/simple-signaling-server*</div>

Our goal here was to use our own "compromised" signalling server so that when two parties used our server to set up a call, they would instead both connect to a third party (our MiTM) would be able to intercept and their media streams without the other two parties' realizing what was happening.

## Setting Up the Attack

As the signalling process for our previous WebRTC application was handled entirely by Firebase, we needed to start fresh with a new application in which we could control the signalling server. So, we pulled the source code for the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0), which is available in [this Github Repository](github.com/googlecodelabs/webrtc-web) as in our "BaseCode" folder (though this code includes some modifications we made when experimenting with the code lab). We chose to use this codelab as a basis because it specifically provides instructions for setting up a signalling server for the application.

While this code seemed simple at first (we simply use a socket IO sever to both run the HTML and support signalling), it proved to be much trickier than we assumed to make the attack work. Ultimately, we manipulated the code to do the following:

**1. Have the signalling server surreptitiously separate all users into different Rooms**

  - We allowed the MiTM to designate a special room by entering "mitm" on the "rooms" page and the other two users were separated into different rooms (even though they asked the server to put them in the same room. This allowed us to filter all traffic through our MITM and control what messages each user received from the server.
  
**2. Rather than connecting User A to User B directly, both users actually connected to the MiTM, who simply passed the media stream of the other user as if it were their own local media stream**

  - This task was not as simple as it might seem, but essentially it involved having the MiTM receive A's initial call, then initiate another call to B, and subsequently synchronize the responses it sent to each party so that the MiTM only shared their "local media stream" (we sent B's media stream to A and A's media stream to B) once it was received from the appropriate party.


## Results

Ultimately, we were successful in getting performing this attack and intercepting a call between two parties (while having the call seem as though the parties were simply communicating with each other). 

Currently, the application only runs on local host, and interestingly, only one stream is visible to the MiTM via Google Chrome (while both streams are visible on Safari). *N.B. This Bug was fixed in our online version by altering the mute settings of the localVideo of A/B*

***Demo to be Shown in Class***

## Why this Attack Matters

As in the case of our malicious WebRTC application, this example provides another concrete demonstration of a potential WebRTC vulnerability: if a signalling server is compromised (or malicious to begin with) a MiTM could compromise a WebRTC call. Our initial example assumes that an attacker can both control the signalling server (to divert calls to theirself) as well as compromise the client-facing javascript controlling the application. 

However, even with these assumptions, our example does show that is possible for a WebRTC call to be "eavesdropped upon" without users realizing it. 


## Running on Your own Device
To begin, please visit the [Realtime communication with WebRTC codelab](https://codelabs.developers.google.com/codelabs/webrtc-web/#0) and follow the instructions for getting source code and installing necessary dependencies (including NodeJS). 

You can then clone our repo to get the source files (Working_Demo contains the complete MiTM attack, while MiTM_Demo1 contains iterative versions in which we experimented with the code to produce our final result). 

From your command line in the local directory into which you've cloned the repo, run "npm install" (to install the necessary Node.js dependencies) and then "node index.js" to set up the local signalling server.

In your browser, visit localhost:8080. For the first session, set your room as 'mitm' (this is the attacker's room). Open 2 more tabs to localhost:8080 and choose whatever room name you would like.

In the "Attacker" tab, you will see and/hear the video from the other tabs. Note: in Google Chrome, only one user's video is available in the attacker tab (in Safari, both will be visible).

## Going Live Online

After successfully deploying the attack on localhost, we attempted to deploy our application online so that we could see if it would work for different users not on the same computer/network. Unfotunately, this proved to be a much more arduous task than we initially expected. Below is a summary of our work in this area:

### Set Up and Debugging
Launching our original attack as a Google Cloud Platform application involved a number of additional configuration steps (a basic summary of launching a js application on the Google Cloud App engine is detailed [here](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart)). Notably, these steps included configuring a .yaml file (to automatically launch the application) and creating a flexible runtime environment (to support Socket.io). 

However, even after launching, the app failed to connect users. We quickly realized we needed a TURN server to get through the firewalls and establish a connection.

<div align="center"><a href="url"><img src="https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/turn.jpg" align="center"></a>
  
  *Source: reproduced by Apollo based on https://stackoverflow.com/questions/12708252/how-does-webrtc-work*</div>
  

So, we both set up TURN Servers using [coTurn - an open source TURN Server project](https://github.com/coturn/coturn) on Google Cloud Compute engine virtual machines (using previously acquired domain names for each TURN Server). Although initially our application still would not work, we confirmed that the TURN servers were indeed functioning by both using the [TrickleIce tool](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) and launching the original google code lab (which we used as the baseline code for our attack) on a separate Google Cloud platform App Engine instance (and using our TURN servers to relay traffic).  

After nearly 2 weeks of failing to launch our application, we finally found the bug: an incorrectly assigned boolean that was preventing the attacker from registering Ice Candidates received. Aftr fixing this mistake, we successfully launched the application (again, using our TURN servers to relay the media stream traffic in the connection). 

### App Improvements
After fixing the connection issues, we made a few additional improvements to our "compromised" application to make the attack work a little more seamlessly

* **Room set up:** Because our application relied on a precise sequence of events (user A calls the attacker -> the attacker calls user B -> user B connects with the attacker -> the attacker connects with user A) we had to separate users into separate rooms based on the order in which they joined. While this separation scheme made the attack easier to manage, it proved to be very easy to break if a user disconnected and then reconnected. We therefore modified our signal server code to "intelligently" assign each user to whichever room is empty (rather than based on the order in which they joined). While we are still limited to only 2 callers at a time on the application (plus the man-in-the-middle), we were able to eliminate this clunkiness. 

* **Video Sources:** By default, a user's local video (their own video stream of themselves) is muted. However, in the attacker's case, we want to recieve the audio from both media streams. To accomplish this, we modified the original html of the page (eliminated the "muted" attribute of the local video) and used JS to dynamically mute the localvideo of users A and B (while keeping the attacker's localvideo (their view of A) unmuted. Interestingly, this also fixed a previous bug in our localHost version of the application in which the attacker could not view the videostream from A while using chrome (although the reason behind this fix is still unclear).

### Demo
Demo to be shown in class.

### Next Steps for Sprint 5

Having successfully got our MiTM attack running, we are at a crossroads with the next steps we want to pursue in Sprint 5. We have listed a couple of options below, but would like to have an open discussion.

1. Continue building on our MitM attack. For example, we could try to implement the ability for an attacker to join an ongoing call (rather than have to be in the attack room before the call starts) as well as explore how we might be able to utilize some of the tools for WebRTC session recording(there are a few WebRTC recording libraries available, so it would be interesting to see if these could be integrated into our app and prevent any "recording" icons from showing up on the compromised users' browsers).

2. Continue exploring what information we can log/exploit from our TURN servers. Currently, our logs are not working, but the TURN server should provide some logging of users IP's. Based on our research into TURN servers, since they can be difficult to set up, the ones for which credentials are openly available tend to be aggregated on open source (and ostensibly used by developers). Assuming we can get the logging running (and get something useful from the logs), these might be an interesting "honeypot" for capturing user information.
